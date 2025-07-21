# Tabletop Tracker - Supabase Setup

This guide will help you set up the Supabase project for local development.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (for local Supabase)

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env.local` file in the root directory with the following content:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_DB_PASSWORD=sCYpJbGUvszGq7YZ
   ```

3. **Start Supabase locally:**
   ```bash
   npm run supabase:start
   ```

4. **Apply database migrations:**
   ```bash
   npm run db:push
   ```

5. **Seed the database (optional):**
   ```bash
   npm run db:reset
   ```

## Database Schema

The application includes the following tables:

- **games**: Store information about board games
- **players**: Store player information
- **game_sessions**: Track individual game sessions
- **session_players**: Many-to-many relationship between sessions and players
- **game_results**: Store results for each player in a session

## Available Scripts

- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance
- `npm run supabase:status` - Check Supabase status
- `npm run db:reset` - Reset database and apply migrations + seed data
- `npm run db:push` - Apply migrations to database
- `npm run db:diff` - Generate migration from schema changes

## Local Development

1. Start the Supabase instance:
   ```bash
   npm run supabase:start
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```

3. Access the applications:
   - Next.js app: http://localhost:3000
   - Supabase Studio: http://localhost:54323
   - API: http://localhost:54321

## Database Management

### Creating a new migration:
```bash
npx supabase migration new your_migration_name
```

### Applying migrations:
```bash
npm run db:push
```

### Resetting the database:
```bash
npm run db:reset
```

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_DB_PASSWORD`: Database password (for local development)

## Troubleshooting

1. **Supabase won't start**: Make sure Docker is running
2. **Database connection issues**: Check that the environment variables are set correctly
3. **Migration errors**: Try resetting the database with `npm run db:reset`

## Project Structure

```
tabletop-tracker/
├── supabase/           # Supabase configuration
│   ├── migrations/     # Database migrations
│   ├── seed/          # Seed data
│   ├── functions/     # Edge functions
│   └── config.toml    # Supabase configuration
├── .env.example       # Example environment variables
└── package.json       # Project dependencies and scripts
``` 