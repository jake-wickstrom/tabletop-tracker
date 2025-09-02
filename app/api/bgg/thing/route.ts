import { NextResponse } from 'next/server'
import { parseBggThing } from '@/app/lib/bgg/xml'

const BGG_BASE = 'https://boardgamegeek.com/xmlapi2'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id') || ''
  const clamped = id.trim().slice(0, 20)

  if (!clamped) {
    return NextResponse.json({ items: [] })
  }

  const upstream = `${BGG_BASE}/thing?id=${encodeURIComponent(clamped)}&stats=0`

  let attempts = 0
  while (attempts < 3) {
    attempts += 1
    const res = await fetch(upstream, {
      headers: { 'Accept': 'application/xml' },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 300 },
    })

    if (res.status === 202) {
      await new Promise((r) => setTimeout(r, attempts * 300))
      continue
    }

    if (!res.ok) {
      return NextResponse.json({ items: [] }, { status: 502 })
    }

    const xml = await res.text()
    const items = parseBggThing(xml)
    return NextResponse.json({ items }, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    })
  }

  return NextResponse.json({ items: [] }, { status: 202 })
}


