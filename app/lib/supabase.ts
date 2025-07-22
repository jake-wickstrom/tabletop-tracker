import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// Re-export client function for backwards compatibility
export { createClient } from './supabase-client'

// Server-side Supabase client for Server Components
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Server-side Supabase client for Route Handlers
export function createRouteHandlerClient(request: Request) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieStore = request.headers.get('cookie') || ''
          return cookieStore
            .split(';')
            .map((cookie) => {
              const trimmedCookie = cookie.trim()
              const firstEqualIndex = trimmedCookie.indexOf('=')
              if (firstEqualIndex === -1) return { name: '', value: '' }
              
              const name = trimmedCookie.substring(0, firstEqualIndex)
              const value = trimmedCookie.substring(firstEqualIndex + 1)
              return { name, value }
            })
            .filter(({ name }) => name)
        },
        setAll(cookiesToSet) {
          // In route handlers, cookies are typically set via response headers
          // This method is called but we don't need to do anything here
          // The actual cookie setting should be done in the route handler response
        },
      },
    }
  )
}

// Re-export the Database type for convenience
export type { Database }