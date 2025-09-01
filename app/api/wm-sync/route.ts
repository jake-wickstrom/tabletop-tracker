import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase'

// Basic stub for WatermelonDB push/pull sync. Secured via Supabase JWT in Authorization header.
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // For now, return empty changes and echo back a cursor
  const url = new URL(request.url)
  const cursorParam = url.searchParams.get('cursor')
  const timestamp = Number.isFinite(Number(cursorParam)) ? Number(cursorParam) : Date.UTC(2024, 0, 1)
  return NextResponse.json({ changes: {}, timestamp })
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Accept changes but do nothing yet
  // TODO: Apply using RLS-scoped mutations
  return NextResponse.json({ ok: true })
}


