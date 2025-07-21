# Tabletop Tracker

Track board game plays, wins, losses and more! A modern web application built with Next.js and Supabase.

## Features

- 🎲 Track board games and their details
- 👥 Manage players and their information
- 📅 Record game sessions with dates and locations
- 🏆 Store game results and scores
- 📊 View statistics and history
- 🎨 Modern, responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Row Level Security

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with:
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

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   - App: http://localhost:3000
   - Supabase Studio: http://localhost:54323

## Database Schema

The application includes the following core tables:

- **games**: Board game information (name, description, player count, etc.)
- **players**: Player profiles and contact information
- **game_sessions**: Individual game sessions with dates and locations
- **session_players**: Many-to-many relationship between sessions and players
- **game_results**: Detailed results for each player in a session

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run db:reset` - Reset database with migrations and seed data
- `npm run db:push` - Apply migrations to database

## Project Structure

```
tabletop-tracker/
├── app/                # Next.js App Router
│   ├── components/     # React components
│   ├── lib/           # Utility functions and configurations
│   │   └── supabase.ts # Supabase client setup
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── supabase/           # Supabase configuration
│   ├── migrations/     # Database migrations
│   ├── seed/          # Seed data
│   └── functions/     # Edge functions
└── public/            # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
