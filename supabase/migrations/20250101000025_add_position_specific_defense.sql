-- V5 Improvement #1: Position-Specific Defensive Matchups
-- Add position-specific defensive columns to team_game_stats for more accurate opponent factors
-- Migration: 20250101000024_add_position_specific_defense.sql

-- Add receiving yards allowed by position (RB/WR/TE)
ALTER TABLE team_game_stats
ADD COLUMN IF NOT EXISTS receiving_yards_allowed_rb INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS receiving_yards_allowed_wr INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS receiving_yards_allowed_te INTEGER DEFAULT 0;

-- Add receiving touchdowns allowed by position
ALTER TABLE team_game_stats
ADD COLUMN IF NOT EXISTS receiving_touchdowns_allowed_rb INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS receiving_touchdowns_allowed_wr INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS receiving_touchdowns_allowed_te INTEGER DEFAULT 0;

-- Add fantasy points allowed by position (for more direct matchup rating)
ALTER TABLE team_game_stats
ADD COLUMN IF NOT EXISTS rb_fantasy_points_allowed DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS wr_fantasy_points_allowed DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS te_fantasy_points_allowed DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS qb_fantasy_points_allowed DECIMAL(5,2) DEFAULT 0;

-- Add general defensive stats (for QB opponent factor)
ALTER TABLE team_game_stats
ADD COLUMN IF NOT EXISTS passing_yards_allowed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS passing_touchdowns_allowed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rushing_yards_allowed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rushing_touchdowns_allowed INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN team_game_stats.receiving_yards_allowed_rb IS 'V5: Receiving yards allowed to RBs (for RB receiving matchup)';
COMMENT ON COLUMN team_game_stats.receiving_yards_allowed_wr IS 'V5: Receiving yards allowed to WRs';
COMMENT ON COLUMN team_game_stats.receiving_yards_allowed_te IS 'V5: Receiving yards allowed to TEs';
COMMENT ON COLUMN team_game_stats.rb_fantasy_points_allowed IS 'V5: Total fantasy points allowed to RBs (PPR)';
COMMENT ON COLUMN team_game_stats.wr_fantasy_points_allowed IS 'V5: Total fantasy points allowed to WRs (PPR)';
COMMENT ON COLUMN team_game_stats.te_fantasy_points_allowed IS 'V5: Total fantasy points allowed to TEs (PPR)';
COMMENT ON COLUMN team_game_stats.qb_fantasy_points_allowed IS 'V5: Total fantasy points allowed to QBs';
COMMENT ON COLUMN team_game_stats.passing_yards_allowed IS 'V5: Passing yards allowed (defensive stat)';
COMMENT ON COLUMN team_game_stats.passing_touchdowns_allowed IS 'V5: Passing TDs allowed (defensive stat)';
COMMENT ON COLUMN team_game_stats.rushing_yards_allowed IS 'V5: Rushing yards allowed (defensive stat)';
COMMENT ON COLUMN team_game_stats.rushing_touchdowns_allowed IS 'V5: Rushing TDs allowed (defensive stat)';
