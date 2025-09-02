"use client"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Database } from '@nozbe/watermelondb'
import { createDatabase } from '../lib/watermelon/db'
import { runSync } from '../lib/watermelon/sync'
import { createClient } from '../lib/supabase-client'

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
  const backoffMsRef = useRef<number>(2000)
  const cancelRef = useRef<boolean>(false)
  const inFlightRef = useRef<boolean>(false)
  const retryTimeoutRef = useRef<number | undefined>(undefined)
  const performSyncRef = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    setDb(createDatabase())
  }, [])

  useEffect(() => {
    lastCursorRef.current = lastCursor
  }, [lastCursor])

  useEffect(() => {
    if (!db) return
    cancelRef.current = false
    const supabase = createClient()

    // Load persisted cursor on mount
    try {
      const persisted = localStorage.getItem('wm_last_cursor')
      if (persisted) {
        const parsed = Number(persisted)
        if (Number.isFinite(parsed)) {
          setLastCursor(parsed)
          lastCursorRef.current = parsed
        }
      }
    } catch {}

    async function performSync(currentDb: Database) {
      if (cancelRef.current) return
      if (inFlightRef.current) return
      try {
        inFlightRef.current = true
        setLastError(undefined)
        const session = (await supabase.auth.getSession()).data.session
        const token = session?.access_token
        if (!token) return
        setIsSyncing(true)
        const next = await runSync(currentDb, token, lastCursorRef.current)
        if (cancelRef.current) return
        if (typeof next !== 'undefined') {
          setLastCursor(next)
          lastCursorRef.current = next
          try { localStorage.setItem('wm_last_cursor', String(next)) } catch {}
        }
        backoffMsRef.current = 2000
      } catch (err) {
        if (cancelRef.current) return
        setLastError(err instanceof Error ? err.message : 'Sync failed')
        backoffMsRef.current = Math.min(backoffMsRef.current * 2, 60000)
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
        }
        retryTimeoutRef.current = window.setTimeout(() => {
          if (!cancelRef.current) void performSync(currentDb)
        }, backoffMsRef.current)
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
    const authSub = supabase.auth.onAuthStateChange(() => void performSync(db))
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


