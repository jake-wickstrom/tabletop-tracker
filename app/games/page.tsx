'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/app/lib/supabase-client'
import { useAuth } from '@/app/contexts/AuthContext'
import type { Database } from '@/app/lib/database.types'

type GameRow = Database['public']['Tables']['games']['Row']

type SearchItem = {
  bggId: string
  name: string
  yearPublished?: number
  publisher?: string
  imageUrl?: string
  thumbnailUrl?: string
}

export default function GamesPage() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [games, setGames] = useState<GameRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchItem[]>([])

  const loadGames = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setGames(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadGames()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        setSearching(true)
        const res = await fetch(`/api/bgg/search?query=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (res.status === 202) {
          // queueing; show hint
          setResults([])
        } else if (res.ok) {
          const json = await res.json()
          const items: any[] = json.items || []
          setResults(items.map((i) => ({
            bggId: i.id,
            name: i.name,
            yearPublished: i.yearPublished,
            imageUrl: i.imageUrl,
            thumbnailUrl: i.thumbnailUrl,
          })))
        } else {
          setResults([])
        }
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [query])

  const userHasGame = (bggId: string) => {
    return games.some((g) => g.bgg_id === bggId)
  }

  const fetchPublisherFor = async (bggId: string): Promise<string | undefined> => {
    try {
      const res = await fetch(`/api/bgg/thing?id=${encodeURIComponent(bggId)}`)
      if (!res.ok) return undefined
      const json = await res.json()
      const first = (json.items?.[0]?.publishers?.[0]) as string | undefined
      return first
    } catch {
      return undefined
    }
  }

  const addGame = async (item: SearchItem) => {
    const existing = userHasGame(item.bggId)
    if (existing) return

    const publisher = await fetchPublisherFor(item.bggId)

    const { error } = await supabase.from('games').insert({
      name: item.name,
      bgg_id: item.bggId,
      year_published: item.yearPublished,
      publisher: publisher,
      image_url: item.imageUrl,
      thumbnail_url: item.thumbnailUrl,
    } as any)

    if (error) {
      setError(error.message)
    } else {
      await loadGames()
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-4">Your Games</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Add Game (Search BGG)</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search board games..."
          className="w-full border rounded px-3 py-2"
          aria-label="Search games on BoardGameGeek"
        />
        {searching && <p className="text-sm text-gray-500 mt-1">Searching...</p>}
        {!searching && query.trim() && results.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">No results, or BGG queued. Try again.</p>
        )}
        <ul className="mt-3 divide-y bg-white rounded border">
          {results.map((r) => {
            const disabled = userHasGame(r.bggId)
            return (
              <li key={r.bggId} className="p-3 flex items-center gap-3">
                {r.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.thumbnailUrl} alt="thumbnail" className="w-12 h-12 object-cover rounded" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-sm text-gray-600">{r.yearPublished ? `(${r.yearPublished})` : undefined}</div>
                </div>
                <button
                  disabled={disabled}
                  onClick={() => addGame(r)}
                  className={`px-3 py-1 rounded text-sm ${disabled ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {disabled ? 'Added' : 'Add'}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : games.length === 0 ? (
          <p className="text-gray-600">No games yet. Use the search above to add your first game.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {games.map((g) => (
              <li key={g.id} className="bg-white rounded shadow p-4 flex gap-4">
                {g.thumbnail_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.thumbnail_url} alt="thumbnail" className="w-16 h-16 object-cover rounded" />
                )}
                <div>
                  <div className="font-semibold">{g.name}</div>
                  <div className="text-sm text-gray-600">
                    {g.year_published ? `(${g.year_published})` : undefined}
                    {g.publisher ? ` • ${g.publisher}` : ''}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}


