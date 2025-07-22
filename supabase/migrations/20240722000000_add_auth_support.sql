-- Add authentication support to existing tables
-- This migration adds user_id columns and Row Level Security (RLS) policies

-- Add user_id column to games table
ALTER TABLE games ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to players table  
ALTER TABLE players ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to game_sessions table
ALTER TABLE game_sessions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for the new user_id columns for better performance
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for games table
CREATE POLICY "Users can view their own games" ON games
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games" ON games
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games" ON games
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games" ON games
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for players table
CREATE POLICY "Users can view their own players" ON players
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own players" ON players
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own players" ON players
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own players" ON players
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for game_sessions table
CREATE POLICY "Users can view their own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game sessions" ON game_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for session_players table (based on session ownership)
CREATE POLICY "Users can view session players for their sessions" ON session_players
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM game_sessions 
            WHERE game_sessions.id = session_players.session_id 
            AND game_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert session players for their sessions" ON session_players
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM game_sessions 
            WHERE game_sessions.id = session_players.session_id 
            AND game_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update session players for their sessions" ON session_players
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM game_sessions 
            WHERE game_sessions.id = session_players.session_id 
            AND game_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete session players for their sessions" ON session_players
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM game_sessions 
            WHERE game_sessions.id = session_players.session_id 
            AND game_sessions.user_id = auth.uid()
        )
    );

-- Create RLS policies for game_results table (based on session ownership)
CREATE POLICY "Users can view game results for their sessions" ON game_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM game_sessions 
            WHERE game_sessions.id = game_results.session_id 
            AND game_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert game results for their sessions" ON game_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM game_sessions 
            WHERE game_sessions.id = game_results.session_id 
            AND game_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update game results for their sessions" ON game_results
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM game_sessions 
            WHERE game_sessions.id = game_results.session_id 
            AND game_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete game results for their sessions" ON game_results
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM game_sessions 
            WHERE game_sessions.id = game_results.session_id 
            AND game_sessions.user_id = auth.uid()
        )
    );

-- Function to automatically set user_id when inserting records
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create triggers to automatically set user_id on insert
CREATE TRIGGER set_user_id_games BEFORE INSERT ON games
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_players BEFORE INSERT ON players
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_game_sessions BEFORE INSERT ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION set_user_id();

-- Update existing records to have a default user_id (you may want to customize this)
-- For development/testing purposes, we'll leave them as NULL initially
-- In production, you might want to assign them to a specific user or clean them up

-- Note: Make sure to set NOT NULL constraints after you've handled existing data
-- ALTER TABLE games ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE players ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE game_sessions ALTER COLUMN user_id SET NOT NULL;