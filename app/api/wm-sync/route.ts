import { NextResponse } from 'next/server'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'
import type { SyncDatabaseChangeSet } from '@nozbe/watermelondb/sync'

type TableName = 'games' | 'players' | 'game_sessions' | 'session_players' | 'game_results'

const TABLES: TableName[] = ['games', 'players', 'game_sessions', 'session_players', 'game_results']
const TABLES_WITH_SOFT_DELETE: TableName[] = ['games', 'players', 'game_sessions', 'session_players', 'game_results']

function getAuthToken(request: Request): string | undefined {
  const header = request.headers.get('authorization') || request.headers.get('Authorization')
  if (!header) return undefined
  const parts = header.split(' ')
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1]
  return undefined
}

function epochMsToIso(epochMs: number): string {
  return new Date(epochMs).toISOString()
}

function isoOrUndefined(epoch: unknown): string | undefined {
  if (typeof epoch === 'number' && Number.isFinite(epoch)) return epochMsToIso(epoch)
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

function sanitizeRowForTable(table: TableName, row: Record<string, unknown>, serverNowMs: number) {
  // Only allow known columns per table
  const baseTimestamps = {
    created_at: isoOrUndefined(row.created_at) ?? epochMsToIso(serverNowMs),
    updated_at: isoOrUndefined(row.updated_at) ?? epochMsToIso(serverNowMs),
  }
  const softDelete = TABLES_WITH_SOFT_DELETE.includes(table)
    ? { deleted_at: isoOrUndefined(row.deleted_at) }
    : {}

  switch (table) {
    case 'games':
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        min_players: row.min_players,
        max_players: row.max_players,
        estimated_playtime_minutes: row.estimated_playtime_minutes,
        complexity_rating: row.complexity_rating,
        ...baseTimestamps,
        ...softDelete,
      }
    case 'players':
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        ...baseTimestamps,
        ...softDelete,
      }
    case 'game_sessions':
      return {
        id: row.id,
        game_id: row.game_id,
        session_date: row.session_date,
        location: row.location,
        notes: row.notes,
        ...baseTimestamps,
        ...softDelete,
      }
    case 'session_players':
      return {
        id: row.id,
        session_id: row.session_id,
        player_id: row.player_id,
        player_order: row.player_order,
        created_at: isoOrUndefined(row.created_at) ?? epochMsToIso(serverNowMs),
        // updated_at may exist after migration; include if provided
        updated_at: isoOrUndefined((row as any).updated_at) ?? epochMsToIso(serverNowMs),
        ...(TABLES_WITH_SOFT_DELETE.includes('session_players')
          ? { deleted_at: isoOrUndefined((row as any).deleted_at) }
          : {}),
      }
    case 'game_results':
      return {
        id: row.id,
        session_id: row.session_id,
        player_id: row.player_id,
        score: row.score,
        position: row.position,
        is_winner: row.is_winner,
        notes: row.notes,
        ...baseTimestamps,
        ...softDelete,
      }
  }
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

  const changes: SyncDatabaseChangeSet = {}

  for (const table of TABLES) {
    const created: any[] = []
    const updated: any[] = []
    const deleted: string[] = []

    // created: created_at > cursor and not soft-deleted
    {
      const createdQuery = client
        .from(table)
        .select('*')
        .gt('created_at', sinceIso)
        .is('deleted_at', null)
        .limit(500)
      const { data } = await createdQuery
      for (const row of data ?? []) {
        created.push(row)
      }
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
      for (const row of data ?? []) {
        updated.push(row)
      }
    }

    // deleted: ids where deleted_at > cursor
    if (TABLES_WITH_SOFT_DELETE.includes(table)) {
      const { data } = await client
        .from(table)
        .select('id, deleted_at')
        .gt('deleted_at', sinceIso)
        .limit(500)
      for (const row of data ?? []) {
        deleted.push(row.id as string)
      }
    }

    // Assign into WatermelonDB change set with sanitized rows
    ;(changes as any)[table] = {
      created: created.map((r) => sanitizeRowForTable(table, r, serverNowMs)),
      updated: updated.map((r) => sanitizeRowForTable(table, r, serverNowMs)),
      deleted,
    }
  }

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

  for (const table of TABLES) {
    const tableChanges = (body.changes as any)[table] as
      | { created?: Record<string, unknown>[]; updated?: Record<string, unknown>[]; deleted?: string[] }
      | undefined
    if (!tableChanges) continue

    const created = Array.isArray(tableChanges.created) ? tableChanges.created : []
    const updated = Array.isArray(tableChanges.updated) ? tableChanges.updated : []
    const deleted = Array.isArray(tableChanges.deleted) ? tableChanges.deleted : []

    // Created: upsert with client-provided UUIDs, set timestamps to serverNow if missing
    if (created.length > 0) {
      const rows = created
        .map((row) => sanitizeRowForTable(table, row, serverNowMs))
        .filter((r) => r && typeof (r as any).id === 'string')
      if (rows.length > 0) {
        await client.from(table).upsert(rows, { onConflict: 'id' })
      }
    }

    // Updated: LWW - only apply if server.updated_at < client.updated_at
    for (const row of updated) {
      const sanitized = sanitizeRowForTable(table, row, serverNowMs) as any
      const id = sanitized.id as string | undefined
      const clientUpdatedIso = isoOrUndefined((row as any).updated_at) || epochMsToIso(serverNowMs)
      if (!id) continue

      await client
        .from(table)
        .update(sanitized)
        .eq('id', id)
        .lt('updated_at', clientUpdatedIso)
    }

    // Deleted: soft-delete by setting deleted_at = serverNow
    if (deleted.length > 0 && TABLES_WITH_SOFT_DELETE.includes(table)) {
      await client
        .from(table)
        .update({ deleted_at: epochMsToIso(serverNowMs) })
        .in('id', deleted as string[])
    }
  }

  return NextResponse.json({ ok: true })
}
