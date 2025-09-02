-- Add BoardGameGeek fields to games and related indexes/constraints

-- Columns
ALTER TABLE games ADD COLUMN IF NOT EXISTS bgg_id TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS year_published INTEGER;
ALTER TABLE games ADD COLUMN IF NOT EXISTS publisher TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_bgg_id ON games(bgg_id);

-- Unique per user and bgg_id when bgg_id is provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uq_games_user_bgg'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX uq_games_user_bgg ON games(user_id, bgg_id) WHERE bgg_id IS NOT NULL';
  END IF;
END
$$;


