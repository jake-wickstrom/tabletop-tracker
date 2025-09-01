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
}

const WatermelonContext = createContext<WatermelonContextValue | undefined>(undefined)

export function WatermelonProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database | undefined>(undefined)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [lastCursor, setLastCursor] = useState<number | undefined>(undefined)
  const lastCursorRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    setDb(createDatabase())
  }, [])

  useEffect(() => {
    lastCursorRef.current = lastCursor
  }, [lastCursor])

  useEffect(() => {
    if (!db) return
    let cancelled = false
    const supabase = createClient()

    async function syncLoop(currentDb: Database) {
      try {
        const session = (await supabase.auth.getSession()).data.session
        const token = session?.access_token
        if (!token) return
        setIsSyncing(true)
        const next = await runSync(currentDb, token, lastCursorRef.current)
        if (!cancelled) setLastCursor(next)
      } catch {
        // Silent retry on next run
      } finally {
        if (!cancelled) setIsSyncing(false)
      }
    }

    void syncLoop(db)

    const onlineHandler = () => void syncLoop(db)
    window.addEventListener('online', onlineHandler)
    return () => {
      cancelled = true
      window.removeEventListener('online', onlineHandler)
    }
  }, [db])

  const value = useMemo<WatermelonContextValue>(() => ({ db, isSyncing, lastCursor }), [db, isSyncing, lastCursor])

  return <WatermelonContext.Provider value={value}>{children}</WatermelonContext.Provider>
}

export function useWatermelon() {
  const ctx = useContext(WatermelonContext)
  if (!ctx) throw new Error('useWatermelon must be used within WatermelonProvider')
  return ctx
}


