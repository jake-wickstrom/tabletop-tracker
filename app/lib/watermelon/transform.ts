import type { SyncDatabaseChangeSet } from '@nozbe/watermelondb/sync'
import { schema } from './schema'

export type TableName = 'games' | 'players' | 'game_sessions' | 'session_players' | 'game_results'

type WatermelonSchema = { tables: Array<{ name: string; columns: Array<{ name: string }> }> }
const wmTables = (schema as unknown as WatermelonSchema).tables ?? []
const SOFT_DELETE_SET = new Set<TableName>(
  wmTables
    .filter((t) => (t.columns || []).some((c) => c.name === 'deleted_at'))
    .map((t) => t.name as TableName)
)

export function tableHasSoftDelete(table: TableName): boolean {
  return SOFT_DELETE_SET.has(table)
}

export function epochMsToIso(epochMs: number): string {
  return new Date(epochMs).toISOString()
}

export function isoFromEpoch(epoch: unknown): string | undefined {
  if (typeof epoch === 'number' && Number.isFinite(epoch)) return epochMsToIso(epoch)
  return undefined
}

export function sanitizeRowForTable(
  table: TableName,
  row: Record<string, unknown>,
  serverNowMs: number
): Record<string, unknown> {
  const baseTimestamps = {
    created_at: isoFromEpoch(row.created_at) ?? epochMsToIso(serverNowMs),
    updated_at: isoFromEpoch(row.updated_at) ?? epochMsToIso(serverNowMs),
  }
  const withSoftDelete = tableHasSoftDelete(table)
    ? { deleted_at: isoFromEpoch(row.deleted_at) }
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
        ...withSoftDelete,
      }
    case 'players':
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        ...baseTimestamps,
        ...withSoftDelete,
      }
    case 'game_sessions':
      return {
        id: row.id,
        game_id: row.game_id,
        session_date: row.session_date,
        location: row.location,
        notes: row.notes,
        ...baseTimestamps,
        ...withSoftDelete,
      }
    case 'session_players':
      return {
        id: row.id,
        session_id: row.session_id,
        player_id: row.player_id,
        player_order: row.player_order,
        created_at: isoFromEpoch(row.created_at) ?? epochMsToIso(serverNowMs),
        updated_at: isoFromEpoch(getField(row, 'updated_at')) ?? epochMsToIso(serverNowMs),
        ...(tableHasSoftDelete('session_players')
          ? { deleted_at: isoFromEpoch(getField(row, 'deleted_at')) }
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
        ...withSoftDelete,
      }
  }
}

export function buildChangeSet(
  tables: Record<
    TableName,
    { created: Record<string, unknown>[]; updated: Record<string, unknown>[]; deleted: string[] }
  >,
  serverNowMs: number
): SyncDatabaseChangeSet {
  const out: Record<string, { created: Record<string, unknown>[]; updated: Record<string, unknown>[]; deleted: string[] }> = {}
  for (const table of Object.keys(tables) as TableName[]) {
    const { created, updated, deleted } = tables[table]
    out[table] = {
      created: created.map((r) => sanitizeRowForTable(table, r, serverNowMs)),
      updated: updated.map((r) => sanitizeRowForTable(table, r, serverNowMs)),
      deleted,
    }
  }
  return out as SyncDatabaseChangeSet
}

export type PushOps = {
  upserts: Partial<Record<TableName, Record<string, unknown>[]>>
  updates: Partial<
    Record<TableName, { id: string; row: Record<string, unknown>; clientUpdatedIso: string }[]>
  >
  deletes: Partial<Record<TableName, string[]>>
}

export function splitPushChanges(
  changes: SyncDatabaseChangeSet,
  serverNowMs: number
): PushOps {
  const upserts: PushOps['upserts'] = {}
  const updates: PushOps['updates'] = {}
  const deletes: PushOps['deletes'] = {}

  for (const table of Object.keys(changes) as TableName[]) {
    const raw = (changes as unknown as Record<string, unknown>)[table]
    const obj = (raw && typeof raw === 'object') ? (raw as Record<string, unknown>) : undefined

    const createdUnknown = obj?.created
    const updatedUnknown = obj?.updated
    const deletedUnknown = obj?.deleted

    const created = isRawRecordArray(createdUnknown) ? createdUnknown : []
    const updatedRows = isRawRecordArray(updatedUnknown) ? updatedUnknown : []
    const deletedIds = isStringArray(deletedUnknown) ? deletedUnknown : []

    if (created.length > 0) {
      upserts[table] = created
        .map((row) => sanitizeRowForTable(table, row, serverNowMs))
        .filter((r) => typeof r['id'] === 'string')
    }

    if (updatedRows.length > 0) {
      updates[table] = updatedRows
        .map((row) => {
          const sanitized = sanitizeRowForTable(table, row, serverNowMs)
          const idVal = sanitized['id']
          const clientUpdatedIso = isoFromEpoch(getField(row, 'updated_at')) ?? epochMsToIso(serverNowMs)
          if (typeof idVal !== 'string') return undefined
          return { id: idVal, row: sanitized, clientUpdatedIso }
        })
        .filter((v): v is { id: string; row: Record<string, unknown>; clientUpdatedIso: string } => !!v)
    }

    if (deletedIds.length > 0) {
      deletes[table] = deletedIds
    }
  }

  return { upserts, updates, deletes }
}

// Helpers
type RawRecord = Record<string, unknown>

function isRawRecordArray(val: unknown): val is RawRecord[] {
  return Array.isArray(val) && val.every((v) => v !== null && typeof v === 'object' && !Array.isArray(v))
}

function isStringArray(val: unknown): val is string[] {
  return Array.isArray(val) && val.every((v) => typeof v === 'string')
}

function getField<T = unknown>(row: RawRecord, key: string): T | undefined {
  const value = row[key]
  return (value as T | undefined)
}
