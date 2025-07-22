# Setup Guide - Resolving Common Issues

This guide will help you resolve the startup issues and get the Tabletop Tracker app running properly.

## 🚨 Issue Resolution Steps

### Step 1: Install Missing Dependencies

The main issue was that `@supabase/ssr` wasn't properly installed. Run:

```bash
npm install @supabase/ssr
```

### Step 2: Verify Installation

Check that all dependencies are installed correctly:

```bash
npm list @supabase/ssr
npm list @supabase/supabase-js
```

### Step 3: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **To get these values:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to Settings → API
   - Copy the Project URL and anon/public key

### Step 4: Start Local Development

1. **Start Supabase locally:**
   ```bash
   npm run supabase:start
   ```

2. **Apply database migrations:**
   ```bash
   npm run db:reset
   ```

3. **Generate TypeScript types:**
   ```bash
   npm run types:generate
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ✅ Verification Checklist

- [ ] `@supabase/ssr` is installed
- [ ] `.env.local` file exists with correct credentials
- [ ] Supabase local instance is running
- [ ] Database migrations are applied
- [ ] TypeScript types are generated
- [ ] Development server starts without errors
- [ ] App loads in browser without module resolution errors

## 🔧 Alternative: Using Remote Supabase

If you prefer to use a remote Supabase instance instead of local:

1. **Create a Supabase project:**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Wait for it to be ready

2. **Get your credentials:**
   - Go to Settings → API
   - Copy the Project URL and anon key

3. **Update your `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Apply migrations to remote:**
   ```bash
   npm run db:push
   ```

5. **Generate types from remote:**
   ```bash
   export PROJECT_REF="your-project-ref"
   npm run types:generate:remote
   ```

## 🚨 Common Error Messages & Solutions

| Error | Solution |
|-------|----------|
| `Module not found: @supabase/ssr` | `npm install @supabase/ssr` |
| `Your project's URL and API key are required` | Set up `.env.local` with correct credentials |
| `Cannot connect to the Docker daemon` | Start Docker Desktop |
| `Failed to inspect service` | Run `npm run supabase:start` |
| Type errors | Run `npm run types:generate` |

## 📞 Getting Help

If you're still experiencing issues:

1. Check the [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed documentation
2. Review the [README.md](./README.md) for general setup instructions
3. Check [Supabase documentation](https://supabase.com/docs)
4. Check [Next.js documentation](https://nextjs.org/docs)

## 🎉 Success!

Once you've completed these steps, you should have:
- ✅ A working authentication system
- ✅ Protected routes with middleware
- ✅ Type-safe database operations
- ✅ Row Level Security policies
- ✅ Modern, responsive UI

The app will redirect unauthenticated users to the sign-in page and authenticated users to the main dashboard. 