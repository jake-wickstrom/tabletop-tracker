"use client"
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
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
  const isSyncRequestedRef = useRef<boolean>(false)
  const backoffMsRef = useRef<number>(2000)
  const cancelRef = useRef<boolean>(false)

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
      try {
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
        setTimeout(() => { if (!cancelRef.current) void performSync(currentDb) }, backoffMsRef.current)
      } finally {
        if (!cancelRef.current) setIsSyncing(false)
      }
    }

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
      window.removeEventListener('online', onlineHandler)
      document.removeEventListener('visibilitychange', visibilityHandler)
      authSub.data.subscription.unsubscribe()
    }
  }, [db])

  const setSyncRequested = () => {
    isSyncRequestedRef.current = true
    // Nudge retry immediately with zero-delay timeout
    setTimeout(() => {
      isSyncRequestedRef.current = false
      // trigger via updating ref; actual sync will occur on events or next failure cycle
      // directly call a sync attempt if db present
      if (db) {
        const supabase = createClient()
        ;(async () => {
          try {
            const session = (await supabase.auth.getSession()).data.session
            const token = session?.access_token
            if (!token) return
            setIsSyncing(true)
            const next = await runSync(db, token, lastCursorRef.current)
            if (typeof next !== 'undefined') {
              setLastCursor(next)
              lastCursorRef.current = next
              try { localStorage.setItem('wm_last_cursor', String(next)) } catch {}
            }
            setLastError(undefined)
            backoffMsRef.current = 2000
          } catch (err) {
            setLastError(err instanceof Error ? err.message : 'Sync failed')
          } finally {
            setIsSyncing(false)
          }
        })()
      }
    }, 0)
  }

  const value = useMemo<WatermelonContextValue>(
    () => ({ db, isSyncing, lastCursor, lastError, setSyncRequested }),
    [db, isSyncing, lastCursor, lastError]
  )

  return <WatermelonContext.Provider value={value}>{children}</WatermelonContext.Provider>
}

export function useWatermelon() {
  const ctx = useContext(WatermelonContext)
  if (!ctx) throw new Error('useWatermelon must be used within WatermelonProvider')
  return ctx
}


