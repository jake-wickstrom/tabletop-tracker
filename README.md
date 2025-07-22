# Tabletop Tracker

Track board game plays, wins, losses and more!

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker Desktop (for local Supabase)
- Supabase CLI

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd tabletop-tracker
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.local.example .env.local
   
   # Edit .env.local with your Supabase credentials
   # Get these from: https://supabase.com/dashboard/project/_/settings/api
   ```

3. **Start local Supabase and apply migrations:**
   ```bash
   npm run supabase:start
   npm run db:reset
   npm run types:generate
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Supabase Commands
- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance
- `npm run supabase:status` - Check Supabase status
- `npm run db:reset` - Reset and apply all migrations
- `npm run db:push` - Push local migrations to remote
- `npm run db:diff` - Generate migration diff

### Type Generation
- `npm run types:generate` - Generate types from local database
- `npm run types:generate:remote` - Generate types from remote database

## 📚 Documentation

For detailed setup and usage instructions, see [AUTH_SETUP.md](./AUTH_SETUP.md).

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Real-time)
- **Authentication:** Supabase Auth with Row Level Security
- **Deployment:** Vercel (recommended)

## 🔐 Authentication Features

- ✅ User registration with email verification
- ✅ User sign-in with email/password
- ✅ Password reset functionality
- ✅ Protected routes with middleware
- ✅ Row Level Security (RLS) policies
- ✅ Session management with automatic refresh
- ✅ Type-safe database operations

## 📁 Project Structure

```
app/
├── lib/                    # Utility libraries
│   ├── supabase.ts        # Server-side Supabase client
│   ├── supabase-client.ts # Client-side Supabase client
│   ├── database.types.ts  # Generated TypeScript types
│   └── auth.ts            # Authentication utilities
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state management
├── components/            # Reusable components
│   ├── Navigation.tsx     # Main navigation
│   └── auth/              # Authentication components
├── auth/                  # Authentication pages
│   ├── page.tsx           # Sign in/up page
│   └── reset-password/    # Password reset
├── layout.tsx             # Root layout
├── page.tsx               # Main dashboard
└── middleware.ts          # Route protection

supabase/
└── migrations/            # Database migrations
```

## 🚨 Troubleshooting

### Common Issues

1. **"Module not found: @supabase/ssr"**
   ```bash
   npm install @supabase/ssr
   ```

2. **"Your project's URL and API key are required"**
   - Ensure `.env.local` exists with correct Supabase credentials
   - Check that environment variables are properly set

3. **Database connection issues**
   ```bash
   npm run supabase:start
   npm run db:reset
   ```

4. **Type errors**
   ```bash
   npm run types:generate
   ```

### Getting Help

- Check the [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed documentation
- Review [Supabase documentation](https://supabase.com/docs)
- Check [Next.js documentation](https://nextjs.org/docs)

## 📄 License

This project is licensed under the MIT License.
