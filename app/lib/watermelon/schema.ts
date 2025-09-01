import { appSchema, tableSchema } from '@nozbe/watermelondb'

// WatermelonDB schema v2 mirroring Supabase tables for offline sync
export const schema = appSchema({
  version: 1,
  tables: [
    // games
    tableSchema({
      name: 'games',
      columns: [
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'min_players', type: 'number' },
        { name: 'max_players', type: 'number' },
        { name: 'estimated_playtime_minutes', type: 'number' },
        { name: 'complexity_rating', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // players
    tableSchema({
      name: 'players',
      columns: [
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // game_sessions
    tableSchema({
      name: 'game_sessions',
      columns: [
        { name: 'game_id', type: 'string', isIndexed: true },
        { name: 'session_date', type: 'string' },
        { name: 'location', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),

    // session_players
    tableSchema({
      name: 'session_players',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'player_id', type: 'string', isIndexed: true },
        { name: 'player_order', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),

    // game_results
    tableSchema({
      name: 'game_results',
      columns: [
        { name: 'session_id', type: 'string', isIndexed: true },
        { name: 'player_id', type: 'string', isIndexed: true },
        { name: 'score', type: 'number' },
        { name: 'position', type: 'number' },
        { name: 'is_winner', type: 'boolean' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
  ],
})


