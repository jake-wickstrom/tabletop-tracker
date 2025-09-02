import { synchronize, type SyncDatabaseChangeSet, type SyncPullResult } from '@nozbe/watermelondb/sync'
import type { Database } from '@nozbe/watermelondb'

export type SyncResponse = {
  changes: SyncDatabaseChangeSet
  timestamp: number
}

export async function runSync(db: Database, authToken: string, cursor: number | undefined): Promise<number | undefined> {
  let serverTimestamp: number | undefined = undefined
  await synchronize({
    database: db,
    pullChanges: async ({ lastPulledAt }): Promise<SyncPullResult> => {
      const url = `/api/wm-sync?cursor=${encodeURIComponent(String(lastPulledAt ?? 0))}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (!res.ok) throw new Error('Failed to pull changes')
      const body = (await res.json()) as SyncResponse
      serverTimestamp = body.timestamp
      return { changes: body.changes, timestamp: body.timestamp }
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      const res = await fetch('/api/wm-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ changes, lastPulledAt }),
      })
      if (!res.ok) throw new Error('Failed to push changes')
    },
    sendCreatedAsUpdated: true,
  })

  // Prefer server-provided timestamp when available; fall back to existing cursor
  return typeof serverTimestamp === 'number' ? serverTimestamp : cursor
}


