# Authentication Setup for Tabletop Tracker

This document provides detailed instructions for setting up and configuring authentication in the Tabletop Tracker application.

## Overview

The authentication system is built using:
- **Supabase Auth** - Handles user authentication and session management
- **Next.js 14 App Router** - Modern React framework with server components
- **@supabase/ssr** - Latest Supabase SSR package for Next.js
- **Row Level Security (RLS)** - Database-level security policies
- **TypeScript** - Full type safety throughout the application

## Features Implemented

✅ **User Registration** - Email/password signup with email verification  
✅ **User Sign In** - Email/password authentication  
✅ **Password Reset** - Forgot password functionality  
✅ **Protected Routes** - Middleware-based route protection  
✅ **Row Level Security** - Database policies to protect user data  
✅ **Session Management** - Automatic session refresh and persistence  
✅ **Type Safety** - Full TypeScript types for auth state and database  
✅ **Modern UI** - Clean, responsive design with Tailwind CSS  

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root with your Supabase credentials:

```bash
# Copy from .env.local.example
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**How to get these values:**
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy the `Project URL` and `anon/public` key

### 2. Database Setup

The authentication system requires database migrations to be applied:

```bash
# Start your local Supabase instance
npm run supabase:start

# Apply migrations
npm run db:reset
```

**What the migrations do:**
- Add `user_id` columns to existing tables (games, players, game_sessions)
- Enable Row Level Security (RLS) on all tables
- Create RLS policies to ensure users only see their own data
- Add triggers to automatically set `user_id` on insert operations

### 3. Supabase Auth Configuration

In your Supabase dashboard:

1. **Enable Email Authentication:**
   - Go to Authentication → Settings
   - Ensure "Enable email confirmations" is enabled
   - Configure email templates if desired

2. **Set Site URL:**
   - Go to Authentication → Settings
   - Set Site URL to your app URL (e.g., `http://localhost:3000` for development)

3. **Configure Redirect URLs:**
   - Add allowed redirect URLs:
     - `http://localhost:3000/auth/callback` (development)
     - `your-production-domain.com/auth/callback` (production)

4. **Email Templates (Optional):**
   - Customize confirmation and password reset email templates
   - Set redirect URLs to your auth pages

## File Structure

```
app/
├── lib/
│   ├── supabase.ts          # Supabase client configuration
│   └── auth.ts              # Authentication utility functions
├── contexts/
│   └── AuthContext.tsx      # React context for auth state
├── components/
│   ├── Navigation.tsx       # Navigation with auth state
│   └── auth/
│       ├── SignInForm.tsx   # Sign in form component
│       └── SignUpForm.tsx   # Sign up form component
├── auth/
│   ├── page.tsx             # Main auth page (signin/signup)
│   └── reset-password/
│       └── page.tsx         # Password reset confirmation
├── layout.tsx               # Root layout with AuthProvider
├── page.tsx                 # Protected main page
└── middleware.ts            # Route protection middleware

supabase/
└── migrations/
    ├── 20240721000000_initial_schema.sql
    └── 20240722000000_add_auth_support.sql
```

## Authentication Flow

### 1. User Registration
1. User fills out sign-up form with email, password, and name
2. Supabase creates user account and sends confirmation email
3. User clicks confirmation link in email to verify account
4. User can now sign in

### 2. User Sign In
1. User enters email and password
2. Supabase validates credentials
3. Session is created and stored in secure HTTP-only cookies
4. User is redirected to the main application
5. Middleware protects subsequent page visits

### 3. Session Management
1. Session state is managed by React Context (`AuthProvider`)
2. Session is automatically refreshed when needed
3. Session persists across browser sessions via cookies
4. User stays logged in until explicitly signing out

### 4. Route Protection
1. Middleware runs on every request
2. Checks for valid session
3. Redirects unauthenticated users to `/auth`
4. Redirects authenticated users away from auth pages

## Security Features

### Row Level Security (RLS)

All database tables have RLS policies that ensure:
- Users can only view their own data
- Users can only modify their own data
- Foreign key relationships are respected (e.g., session players belong to user's sessions)

**Example Policy:**
```sql
CREATE POLICY "Users can view their own games" ON games
    FOR SELECT USING (auth.uid() = user_id);
```

### Data Isolation

- Each user's data is completely isolated
- No cross-user data leakage possible
- Enforced at the database level, not just application level

### Secure Session Handling

- Sessions stored in secure HTTP-only cookies
- Automatic session refresh
- Proper logout clears all session data

## Usage Examples

### Using Authentication in Components

```tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function MyComponent() {
  const { user, loading, signOut } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return (
    <div>
      <p>Welcome, {user.email}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### Using Supabase Client

```tsx
import { createClient } from '@/lib/supabase'

const supabase = createClient()

// Insert data (user_id is automatically set)
const { data, error } = await supabase
  .from('games')
  .insert({
    name: 'Settlers of Catan',
    min_players: 3,
    max_players: 4
  })

// Query data (only user's data returned due to RLS)
const { data: games } = await supabase
  .from('games')
  .select('*')
```

## Troubleshooting

### Common Issues

1. **"Invalid session" errors**
   - Check environment variables are set correctly
   - Ensure Supabase URL and anon key are valid
   - Check browser cookies aren't being blocked

2. **Email confirmation not working**
   - Check Site URL in Supabase dashboard
   - Verify redirect URLs are configured
   - Check spam folder for confirmation emails

3. **RLS policies blocking queries**
   - Ensure user is authenticated before making queries
   - Check that `user_id` is being set correctly
   - Verify RLS policies match your use case

4. **TypeScript errors**
   - Ensure all imports use correct paths (`@/` prefix)
   - Check that TypeScript types are properly defined
   - Run `npm run build` to check for type issues

### Debug Tips

1. **Check session state:**
   ```tsx
   const { user, session } = useAuth()
   console.log('User:', user)
   console.log('Session:', session)
   ```

2. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Filter by Auth logs to see authentication events

3. **Verify RLS policies:**
   ```sql
   -- Test queries in Supabase SQL editor
   SELECT auth.uid(); -- Should return current user ID
   SELECT * FROM games; -- Should only return user's games
   ```

## Testing

### Manual Testing Checklist

- [ ] User can sign up with email/password
- [ ] Email confirmation is sent and works
- [ ] User can sign in after confirmation
- [ ] User can sign out
- [ ] Protected routes redirect to auth when not signed in
- [ ] Authenticated users are redirected away from auth pages
- [ ] Password reset email is sent and works
- [ ] Password reset form updates password correctly
- [ ] User data is isolated (create test users to verify)
- [ ] Navigation shows correct auth state

### Automated Testing

Consider adding tests for:
- Authentication utility functions
- Component rendering based on auth state
- Protected route middleware
- Form validation and error handling

## Next Steps

This authentication system provides a solid foundation. Consider adding:

1. **Social Authentication** (Google, GitHub, etc.)
2. **Multi-factor Authentication (MFA)**
3. **Role-based Access Control (RBAC)**
4. **User Profile Management**
5. **Account Deletion**
6. **Session Management Dashboard**

## Support

For issues or questions:
1. Check this documentation first
2. Review Supabase Auth documentation
3. Check the GitHub repository issues
4. Consult Next.js App Router documentation for routing questions