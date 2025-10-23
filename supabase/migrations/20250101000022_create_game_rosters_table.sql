-- Migration: Create game_rosters table for game-day roster snapshots
-- Workorder: WO-GAME-DAY-ROSTER-TRACKING-001
-- Task: MIGRATE-001
-- Purpose: Track which players were active/inactive for each game
--          This solves the missing player FK constraint problem by maintaining
--          historical roster data even after players are released/traded

-- Create game_rosters table
CREATE TABLE IF NOT EXISTS game_rosters (
  game_roster_id BIGSERIAL PRIMARY KEY,
  game_id VARCHAR(50) NOT NULL,
  season INTEGER NOT NULL,
  team_id VARCHAR(10) NOT NULL,
  player_id VARCHAR(50) NOT NULL,
  position VARCHAR(10),
  jersey_number INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(20), -- active, inactive, injured_reserve, practice_squad
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Foreign key constraints
  -- Note: Cannot FK to partitioned games table directly in PostgreSQL
  -- Game existence must be validated at application level

  CONSTRAINT fk_game_rosters_team
    FOREIGN KEY (team_id)
    REFERENCES teams(team_id)
    ON DELETE CASCADE,

  CONSTRAINT fk_game_rosters_player
    FOREIGN KEY (player_id)
    REFERENCES players(player_id)
    ON DELETE CASCADE,

  -- Unique constraint: one roster entry per player per game per team
  CONSTRAINT unique_player_game_team_season
    UNIQUE (game_id, season, team_id, player_id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_game_rosters_game_id_season ON game_rosters(game_id, season);
CREATE INDEX IF NOT EXISTS idx_game_rosters_team_id ON game_rosters(team_id);
CREATE INDEX IF NOT EXISTS idx_game_rosters_player_id ON game_rosters(player_id);
CREATE INDEX IF NOT EXISTS idx_game_rosters_active ON game_rosters(active);
CREATE INDEX IF NOT EXISTS idx_game_rosters_season ON game_rosters(season);

-- Add comments for documentation
COMMENT ON TABLE game_rosters IS 'Game-day roster snapshots tracking which players were active/inactive for each game';
COMMENT ON COLUMN game_rosters.game_id IS 'Game identifier (validated at application level)';
COMMENT ON COLUMN game_rosters.season IS 'Season year for partitioning alignment';
COMMENT ON COLUMN game_rosters.team_id IS 'Foreign key to teams table';
COMMENT ON COLUMN game_rosters.player_id IS 'Foreign key to players table';
COMMENT ON COLUMN game_rosters.active IS 'Whether player was active (dressed) for this game';
COMMENT ON COLUMN game_rosters.status IS 'Player status for this game (active, inactive, injured_reserve, practice_squad)';
