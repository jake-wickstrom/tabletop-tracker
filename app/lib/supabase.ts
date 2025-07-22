import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Re-export client function for backwards compatibility
export { createClient } from './supabase-client'

// Server-side Supabase client for Server Components
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
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
  return createServerClient(
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

// Database types (basic structure - can be expanded)
export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          name: string
          description: string | undefined
          min_players: number | undefined
          max_players: number | undefined
          estimated_playtime_minutes: number | undefined
          complexity_rating: number | undefined
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          min_players?: number
          max_players?: number
          estimated_playtime_minutes?: number
          complexity_rating?: number
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          min_players?: number
          max_players?: number
          estimated_playtime_minutes?: number
          complexity_rating?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      players: {
        Row: {
          id: string
          name: string
          email: string | undefined
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          email?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          game_id: string
          session_date: string
          location: string | undefined
          notes: string | undefined
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          game_id: string
          session_date: string
          location?: string
          notes?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          game_id?: string
          session_date?: string
          location?: string
          notes?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      session_players: {
        Row: {
          id: string
          session_id: string
          player_id: string
          player_order: number | undefined
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          player_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          player_order?: number
          created_at?: string
        }
      }
      game_results: {
        Row: {
          id: string
          session_id: string
          player_id: string
          score: number | undefined
          position: number | undefined
          is_winner: boolean | undefined
          notes: string | undefined
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          score?: number
          position?: number
          is_winner?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          score?: number
          position?: number
          is_winner?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}