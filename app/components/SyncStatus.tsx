"use client"
import { useWatermelon } from '../contexts/WatermelonContext'

export default function SyncStatus() {
  const { isSyncing, lastCursor, lastError, setSyncRequested } = useWatermelon()
  return (
    <div className="fixed bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded shadow">
      <div>
        {isSyncing ? 'Syncing…' : lastError ? `Sync error: ${lastError}` : 'Synced'}
      </div>
      <div>cursor: {typeof lastCursor === 'number' ? lastCursor : '—'}</div>
      <button className="underline" onClick={setSyncRequested}>
        Sync now
      </button>
    </div>
  )
}


