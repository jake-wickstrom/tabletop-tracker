import { NextResponse } from 'next/server'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import type { SyncDatabaseChangeSet } from '@nozbe/watermelondb/sync'
import { buildChangeSet, epochMsToIso, splitPushChanges } from '@/app/lib/watermelon/transform'
import type { TableName } from '@/app/lib/watermelon/transform'

const TABLES: TableName[] = ['games', 'players', 'game_sessions', 'session_players', 'game_results']
const TABLES_WITH_SOFT_DELETE: TableName[] = ['games', 'players', 'game_sessions', 'session_players', 'game_results']

function getAuthToken(request: Request): string | undefined {
  const header = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!header) return undefined
  const parts = header.split(' ')
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1]
  return undefined
}

function createAuthedSupabaseClient(request: Request) {
  const token = getAuthToken(request)
  const client = createSupabaseJsClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    }
  )
  return { client, token }
}

// GET: Pull changes
export async function GET(request: Request) {
  const { client, token } = createAuthedSupabaseClient(request)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const cursorParam = url.searchParams.get('cursor')
  const last = Number.isFinite(Number(cursorParam)) ? Number(cursorParam) : 0
  const serverNowMs = Date.now()
  const sinceIso = epochMsToIso(last)

  const perTable: Record<TableName, { created: Record<string, unknown>[]; updated: Record<string, unknown>[]; deleted: string[] }> = {
    games: { created: [], updated: [], deleted: [] },
    players: { created: [], updated: [], deleted: [] },
    game_sessions: { created: [], updated: [], deleted: [] },
    session_players: { created: [], updated: [], deleted: [] },
    game_results: { created: [], updated: [], deleted: [] },
  }

  for (const table of TABLES) {
    // created: created_at > cursor and not soft-deleted
    {
      const createdQuery = client
        .from(table)
        .select('*')
        .gt('created_at', sinceIso)
        .is('deleted_at', null)
        .limit(500)
      const { data } = await createdQuery
      for (const row of data ?? []) perTable[table].created.push(row)
    }

    // updated: updated_at > cursor and created_at <= cursor and not soft-deleted
    {
      const updatedQuery = client
        .from(table)
        .select('*')
        .gt('updated_at', sinceIso)
        .lte('created_at', sinceIso)
        .is('deleted_at', null)
        .limit(500)
      const { data } = await updatedQuery
      for (const row of data ?? []) perTable[table].updated.push(row)
    }

    // deleted: ids where deleted_at > cursor
    if (TABLES_WITH_SOFT_DELETE.includes(table)) {
      const { data } = await client
        .from(table)
        .select('id, deleted_at')
        .gt('deleted_at', sinceIso)
        .limit(500)
      for (const row of data ?? []) perTable[table].deleted.push(row.id as string)
    }
  }

  const changes: SyncDatabaseChangeSet = buildChangeSet(perTable, serverNowMs)
  return NextResponse.json({ changes, timestamp: serverNowMs })
}

// POST: Push changes
export async function POST(request: Request) {
  const { client, token } = createAuthedSupabaseClient(request)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => undefined)) as
    | { changes?: SyncDatabaseChangeSet; lastPulledAt?: number }
    | undefined
  if (!body || !body.changes || typeof body.changes !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const serverNowMs = Date.now()
  const { upserts, updates, deletes } = splitPushChanges(body.changes, serverNowMs)

  const conflicts: Partial<Record<TableName, string[]>> = {}

  // Created / Upserts
  for (const table of TABLES) {
    const toUpsert = upserts[table]
    if (toUpsert && toUpsert.length > 0) {
      const { error } = await client.from(table).upsert(toUpsert, { onConflict: 'id' })
      if (error) {
        return NextResponse.json({ error: 'upsert_failed', table, details: error.message }, { status: 500 })
      }
    }
  }

  // Updates with LWW
  for (const table of TABLES) {
    const toUpdate = updates[table]
    if (!toUpdate || toUpdate.length === 0) continue

    for (const { id, row, clientUpdatedIso } of toUpdate) {
      // conditional update; request returning rows to know if anything changed
      const { data: updatedRows, error: updateError } = await client
        .from(table)
        .update(row)
        .eq('id', id)
        .lt('updated_at', clientUpdatedIso)
        .select('id')
        .limit(1)

      if (updateError) {
        return NextResponse.json({ error: 'update_failed', table, details: updateError.message }, { status: 500 })
      }

      const updatedCount = (updatedRows?.length ?? 0)
      if (updatedCount === 0) {
        // no rows updated; detect conflict vs. missing
        const { data: existing, error: fetchError } = await client
          .from(table)
          .select('id, updated_at')
          .eq('id', id)
          .maybeSingle()

        if (fetchError) {
          return NextResponse.json({ error: 'read_failed', table, details: fetchError.message }, { status: 500 })
        }

        if (existing && existing.updated_at && new Date(existing.updated_at as string).getTime() >= new Date(clientUpdatedIso).getTime()) {
          if (!conflicts[table]) conflicts[table] = []
          conflicts[table]!.push(id)
        } else if (!existing) {
          // record does not exist — create it to satisfy WMDB guidance
          const { error: insertError } = await client.from(table).upsert([row], { onConflict: 'id' })
          if (insertError) {
            return NextResponse.json({ error: 'create_missing_failed', table, details: insertError.message }, { status: 500 })
          }
        }
      }
    }
  }

  // Soft deletes
  for (const table of TABLES) {
    const toDelete = deletes[table]
    if (toDelete && toDelete.length > 0) {
      const { error } = await client
        .from(table)
        .update({ deleted_at: epochMsToIso(serverNowMs) })
        .in('id', toDelete)
      if (error) {
        return NextResponse.json({ error: 'delete_failed', table, details: error.message }, { status: 500 })
      }
    }
  }

  // If any conflicts detected, signal to client to pull again
  const hasConflicts = Object.values(conflicts).some((ids) => (ids?.length ?? 0) > 0)
  if (hasConflicts) {
    return NextResponse.json({ error: 'conflict', conflicts }, { status: 409 })
  }

  return NextResponse.json({ ok: true })
}
