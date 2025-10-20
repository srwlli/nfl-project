-- ================================================================
-- ENHANCE BETTING TABLES FOR HISTORICAL DATA
-- ================================================================
-- Purpose: Add fields to support historical betting data from nflverse
-- Source: nflverse/nfldata (2006-present)
-- Related: historical-betting-scraper.js

-- Add columns to game_betting_lines for historical data support
ALTER TABLE game_betting_lines
ADD COLUMN IF NOT EXISTS data_source VARCHAR(50), -- 'nflverse', 'The Odds API', 'SportsOddsHistory'
ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT FALSE, -- Flag for pre-2025 data
ADD COLUMN IF NOT EXISTS spread_line DECIMAL(5,1), -- Simplified spread (absolute value)
ADD COLUMN IF NOT EXISTS favorite_team_id VARCHAR(10), -- Team favored
ADD COLUMN IF NOT EXISTS underdog_team_id VARCHAR(10), -- Team underdog
ADD COLUMN IF NOT EXISTS total_line DECIMAL(5,1), -- Over/under total
ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMP; -- When data was scraped

-- Create indexes for historical data queries
CREATE INDEX IF NOT EXISTS idx_game_betting_lines_historical ON game_betting_lines(is_historical) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_game_betting_lines_source ON game_betting_lines(data_source) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_game_betting_lines_game_id ON game_betting_lines(game_id) WHERE deleted_at IS NULL;

-- Add comments
COMMENT ON COLUMN game_betting_lines.data_source IS 'Source of betting data (nflverse, The Odds API, etc.)';
COMMENT ON COLUMN game_betting_lines.is_historical IS 'TRUE for historical data (pre-2025), FALSE for current season';
COMMENT ON COLUMN game_betting_lines.spread_line IS 'Absolute value of point spread (e.g., 3.5)';
COMMENT ON COLUMN game_betting_lines.favorite_team_id IS 'Team ID of favorite';
COMMENT ON COLUMN game_betting_lines.underdog_team_id IS 'Team ID of underdog';
COMMENT ON COLUMN game_betting_lines.total_line IS 'Over/under total points line';

-- Update existing records to mark as current (not historical)
UPDATE game_betting_lines SET is_historical = FALSE WHERE is_historical IS NULL;

-- Make certain fields nullable for historical data (which may not have all details)
ALTER TABLE game_betting_lines
ALTER COLUMN market_type DROP NOT NULL,
ALTER COLUMN last_update DROP NOT NULL;
