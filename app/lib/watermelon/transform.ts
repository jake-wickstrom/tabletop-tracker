import type { TableSchema } from '@nozbe/watermelondb/Schema'
import type { SyncDatabaseChangeSet, SyncTableChangeSet } from '@nozbe/watermelondb/sync'
import { schema } from './schema'

export type TableName = string

const wmTablesMap = schema.tables
const wmTableList: TableSchema[] = Object.values(wmTablesMap)
const TABLE_NAME_SET = new Set<string>(Object.keys(wmTablesMap))

export function getTableNames(): string[] {
  return [...TABLE_NAME_SET]
}

const SOFT_DELETE_SET = new Set<TableName>(
  wmTableList
    .filter((t) => t.columnArray.some((c) => c.name === 'deleted_at'))
    .map((t) => t.name as TableName)
)

export function tableHasSoftDelete(table: TableName): boolean {
  return SOFT_DELETE_SET.has(table as TableName)
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
  // Whitelist only columns defined for the table in WM schema + id
  const allowed = allowedColumnsForTable(table)
  const out: Record<string, unknown> = {}
  // Always accept id if provided
  if (typeof row.id !== 'undefined') out.id = row.id
  for (const col of allowed) {
    if (col === 'id') continue
    if (col in row) out[col] = (row as Record<string, unknown>)[col]
  }
  // Normalize timestamps
  out.created_at = isoFromEpoch(row.created_at) ?? epochMsToIso(serverNowMs)
  out.updated_at = isoFromEpoch(getField(row, 'updated_at')) ?? epochMsToIso(serverNowMs)
  if (tableHasSoftDelete(table) && typeof getField(row, 'deleted_at') !== 'undefined') {
    out.deleted_at = isoFromEpoch(getField(row, 'deleted_at'))
  }
  return out
}

export function buildChangeSet(
  tables: Record<
    TableName,
    { created: Record<string, unknown>[]; updated: Record<string, unknown>[]; deleted: string[] }
  >,
  serverNowMs: number
): SyncDatabaseChangeSet {
  const out: Record<string, { created: Record<string, unknown>[]; updated: Record<string, unknown>[]; deleted: string[] }> = {}
  for (const table of Object.keys(tables)) {
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

  for (const [table, obj] of Object.entries(changes) as [string, SyncTableChangeSet][]) {
    const created = Array.isArray(obj.created) ? obj.created : []
    const updatedRows = Array.isArray(obj.updated) ? obj.updated : []
    const deletedIds = Array.isArray(obj.deleted) ? obj.deleted : []

    if (created.length > 0) {
      upserts[table as TableName] = created
        .map((row) => sanitizeRowForTable(table, row, serverNowMs))
        .filter((r) => typeof r['id'] === 'string')
    }

    if (updatedRows.length > 0) {
      updates[table as TableName] = updatedRows
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
      deletes[table as TableName] = deletedIds
    }
  }

  return { upserts, updates, deletes }
}

// Helpers
type RawRecord = Record<string, unknown>

function getField<T = unknown>(row: RawRecord, key: string): T | undefined {
  const value = row[key]
  return (value as T | undefined)
}

function allowedColumnsForTable(table: string): Set<string> {
  const t = wmTablesMap[table]
  const cols = new Set<string>(['id'])
  if (!t) return cols
  for (const c of t.columnArray) cols.add(c.name)
  // Ensure timestamps are considered
  cols.add('created_at')
  cols.add('updated_at')
  cols.add('deleted_at')
  return cols
}
