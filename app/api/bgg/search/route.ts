import { NextResponse } from 'next/server'
import { parseBggSearch } from '@/app/lib/bgg/xml'
import type { BggSearchResponse } from '@/app/lib/bgg/types'

const BGG_BASE = 'https://boardgamegeek.com/xmlapi2'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const rawQuery = url.searchParams.get('query') || ''
  const page = url.searchParams.get('page') || '1'

  const query = rawQuery.trim().slice(0, 100)
  if (!query) {
    return NextResponse.json({ items: [] } as BggSearchResponse)
  }

  const upstream = `${BGG_BASE}/search?query=${encodeURIComponent(query)}&type=boardgame&page=${encodeURIComponent(page)}`

  let attempts = 0
  while (attempts < 3) {
    attempts += 1
    const res = await fetch(upstream, {
      headers: { 'Accept': 'application/xml' },
      // 10s timeout via AbortController
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 60 },
    })

    if (res.status === 202) {
      await new Promise((r) => setTimeout(r, attempts * 300))
      continue
    }

    if (!res.ok) {
      return NextResponse.json({ items: [] } as BggSearchResponse, { status: 502 })
    }

    const xml = await res.text()
    const items = parseBggSearch(xml)
    return NextResponse.json({ items } as BggSearchResponse, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=60',
      },
    })
  }

  return NextResponse.json({ items: [] } as BggSearchResponse, { status: 202 })
}


