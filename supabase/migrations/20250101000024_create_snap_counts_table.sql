-- Migration: Create snap_counts table for player snap count data
-- Purpose: Track offensive, defensive, and special teams snaps per player per game
-- Source: nflverse snap_counts_2025.csv (weekly updates)
-- Schedule: Tuesday updates via nflverse-snap-counts-scraper.js

-- Create snap_counts table
CREATE TABLE IF NOT EXISTS snap_counts (
  snap_count_id BIGSERIAL PRIMARY KEY,
  game_id VARCHAR(50) NOT NULL,
  pfr_game_id VARCHAR(50), -- Pro Football Reference game ID
  season INTEGER NOT NULL,
  game_type VARCHAR(10) NOT NULL, -- REG, POST
  week INTEGER NOT NULL,
  player_name VARCHAR(255) NOT NULL,
  pfr_player_id VARCHAR(50), -- Pro Football Reference player ID
  player_id VARCHAR(50), -- Our internal player_id (mapped from pfr_player_id)
  position VARCHAR(10),
  team_id VARCHAR(10) NOT NULL,
  opponent_team_id VARCHAR(10),

  -- Offensive snaps
  offense_snaps INTEGER DEFAULT 0,
  offense_pct DECIMAL(5,4) DEFAULT 0, -- Percentage (0-1)

  -- Defensive snaps
  defense_snaps INTEGER DEFAULT 0,
  defense_pct DECIMAL(5,4) DEFAULT 0,

  -- Special teams snaps
  st_snaps INTEGER DEFAULT 0,
  st_pct DECIMAL(5,4) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key constraints
  CONSTRAINT fk_snap_counts_team
    FOREIGN KEY (team_id)
    REFERENCES teams(team_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_snap_counts_opponent
    FOREIGN KEY (opponent_team_id)
    REFERENCES teams(team_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_snap_counts_player
    FOREIGN KEY (player_id)
    REFERENCES players(player_id)
    ON DELETE CASCADE,

  -- Unique constraint: one snap count entry per player per game
  CONSTRAINT unique_player_game_snap_counts
    UNIQUE (game_id, season, player_name, team_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_snap_counts_game_id ON snap_counts(game_id);
CREATE INDEX IF NOT EXISTS idx_snap_counts_player_id ON snap_counts(player_id);
CREATE INDEX IF NOT EXISTS idx_snap_counts_team_id ON snap_counts(team_id);
CREATE INDEX IF NOT EXISTS idx_snap_counts_season_week ON snap_counts(season, week);
CREATE INDEX IF NOT EXISTS idx_snap_counts_player_name ON snap_counts(player_name);

-- Add comments for documentation
COMMENT ON TABLE snap_counts IS 'Player snap counts from nflverse - offensive, defensive, and special teams snaps per game';
COMMENT ON COLUMN snap_counts.game_id IS 'nflverse game ID format (YYYY_WW_AWAY_HOME)';
COMMENT ON COLUMN snap_counts.pfr_game_id IS 'Pro Football Reference game ID';
COMMENT ON COLUMN snap_counts.player_id IS 'Foreign key to players table (mapped from pfr_player_id)';
COMMENT ON COLUMN snap_counts.offense_snaps IS 'Number of offensive snaps played';
COMMENT ON COLUMN snap_counts.offense_pct IS 'Percentage of team offensive snaps (0-1)';
COMMENT ON COLUMN snap_counts.defense_snaps IS 'Number of defensive snaps played';
COMMENT ON COLUMN snap_counts.defense_pct IS 'Percentage of team defensive snaps (0-1)';
COMMENT ON COLUMN snap_counts.st_snaps IS 'Number of special teams snaps played';
COMMENT ON COLUMN snap_counts.st_pct IS 'Percentage of special teams snaps (0-1)';
