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
              const [name, value] = cookie.trim().split('=')
              return { name, value }
            })
            .filter(({ name }) => name)
        },
        setAll(cookiesToSet) {
          // Implementation for setting cookies in route handlers
          // This would typically be handled by the response
        },
      },
    }
  )
}

// Re-export the Database type for convenience
export type { Database }