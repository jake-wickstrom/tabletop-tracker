"use client"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Database } from '@nozbe/watermelondb'
import { createDatabase } from '../lib/watermelon/db'
import { runSync } from '../lib/watermelon/sync'
import { createClient } from '../lib/supabase-client'

// Constants to avoid magic numbers/strings
const LOCAL_STORAGE_CURSOR_KEY = 'wm_last_cursor'
const BACKOFF_MIN_MS = 2000
const BACKOFF_MAX_MS = 60000

type WatermelonContextValue = {
  db: Database | undefined
  isSyncing: boolean
  lastCursor: number | undefined
  lastError: string | undefined
  setSyncRequested: () => void
}

const WatermelonContext = createContext<WatermelonContextValue | undefined>(undefined)

export function WatermelonProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database | undefined>(undefined)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [lastCursor, setLastCursor] = useState<number | undefined>(undefined)
  const [lastError, setLastError] = useState<string | undefined>(undefined)
  const lastCursorRef = useRef<number | undefined>(undefined)
  const backoffMsRef = useRef<number>(BACKOFF_MIN_MS)
  const cancelRef = useRef<boolean>(false)
  const inFlightRef = useRef<boolean>(false)
  const retryTimeoutRef = useRef<number | undefined>(undefined)
  const performSyncRef = useRef<(() => void) | undefined>(undefined)
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    setDb(createDatabase())
  }, [])

  useEffect(() => {
    lastCursorRef.current = lastCursor
  }, [lastCursor])

  useEffect(() => {
    if (!db) return
    cancelRef.current = false

    function scheduleRetry(cb: () => void) {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      retryTimeoutRef.current = window.setTimeout(cb, backoffMsRef.current)
    }

    async function performSync(currentDb: Database) {
      if (cancelRef.current) return
      if (inFlightRef.current) return
      try {
        inFlightRef.current = true
        setLastError(undefined)
        const session = (await supabaseRef.current.auth.getSession()).data.session
        const token = session?.access_token
        if (!token) return
        setIsSyncing(true)
        const next = await runSync(currentDb, token, lastCursorRef.current)
        if (cancelRef.current) return
        if (typeof next !== 'undefined') {
          setLastCursor(next)
          lastCursorRef.current = next
          try { localStorage.setItem(LOCAL_STORAGE_CURSOR_KEY, String(next)) } catch {}
        }
        backoffMsRef.current = BACKOFF_MIN_MS
      } catch (err) {
        if (cancelRef.current) return
        setLastError(err instanceof Error ? err.message : 'Sync failed')
        backoffMsRef.current = Math.min(backoffMsRef.current * 2, BACKOFF_MAX_MS)
        scheduleRetry(() => { if (!cancelRef.current) void performSync(currentDb) })
      } finally {
        inFlightRef.current = false
        if (!cancelRef.current) setIsSyncing(false)
      }
    }

    // Expose performSync to outside handlers via ref
    performSyncRef.current = () => void performSync(db)

    // Initial run
    void performSync(db)

    // Event triggers
    const onlineHandler = () => void performSync(db)
    const visibilityHandler = () => { if (document.visibilityState === 'visible') void performSync(db) }
    const authSub = supabaseRef.current.auth.onAuthStateChange(() => void performSync(db))
    window.addEventListener('online', onlineHandler)
    document.addEventListener('visibilitychange', visibilityHandler)

    return () => {
      cancelRef.current = true
      inFlightRef.current = false
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = undefined
      }
      window.removeEventListener('online', onlineHandler)
      document.removeEventListener('visibilitychange', visibilityHandler)
      authSub.data.subscription.unsubscribe()
    }
  }, [db])

  // Load persisted cursor early, separate from sync orchestration
  useEffect(() => {
    try {
      const persisted = localStorage.getItem(LOCAL_STORAGE_CURSOR_KEY)
      if (persisted) {
        const parsed = Number(persisted)
        if (Number.isFinite(parsed)) {
          setLastCursor(parsed)
          lastCursorRef.current = parsed
        }
      }
    } catch {}
  }, [])

  const setSyncRequested = useCallback(() => {
    if (performSyncRef.current) performSyncRef.current()
  }, [])

  const value = useMemo<WatermelonContextValue>(
    () => ({ db, isSyncing, lastCursor, lastError, setSyncRequested }),
    [db, isSyncing, lastCursor, lastError, setSyncRequested]
  )

  return <WatermelonContext.Provider value={value}>{children}</WatermelonContext.Provider>
}

export function useWatermelon() {
  const ctx = useContext(WatermelonContext)
  if (!ctx) throw new Error('useWatermelon must be used within WatermelonProvider')
  return ctx
}


