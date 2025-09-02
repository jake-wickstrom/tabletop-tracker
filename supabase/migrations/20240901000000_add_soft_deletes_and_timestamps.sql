-- Add soft deletes (deleted_at) and ensure updated_at exists across tables

-- Add deleted_at to all domain tables
ALTER TABLE games ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE session_players ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE game_results ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Ensure updated_at exists on session_players (others already created in initial schema)
ALTER TABLE session_players ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Indexes for soft delete filters
CREATE INDEX IF NOT EXISTS idx_games_deleted_at ON games(deleted_at);
CREATE INDEX IF NOT EXISTS idx_players_deleted_at ON players(deleted_at);
CREATE INDEX IF NOT EXISTS idx_game_sessions_deleted_at ON game_sessions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_session_players_deleted_at ON session_players(deleted_at);
CREATE INDEX IF NOT EXISTS idx_game_results_deleted_at ON game_results(deleted_at);

-- Trigger for updating updated_at on session_players
CREATE TRIGGER update_session_players_updated_at BEFORE UPDATE ON session_players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
