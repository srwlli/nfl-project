-- Enhancement: Add ESPN Advanced Fields + Fantasy Points + nflverse EPA
-- Migration: 20250101000020_enhance_player_game_stats
-- Phase 1: Foundation Enhancement
-- Adds 44 new columns to player_game_stats table

-- =============================================================================
-- ESPN ADVANCED FIELDS (25 columns)
-- =============================================================================

-- Passing Advanced (5 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS passing_sacks INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS passing_sack_yards_lost INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS passing_longest INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS passer_rating DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS qbr DECIMAL(5,2);

COMMENT ON COLUMN player_game_stats.passing_sacks IS 'Number of times sacked (QB stat)';
COMMENT ON COLUMN player_game_stats.passing_sack_yards_lost IS 'Yards lost from sacks';
COMMENT ON COLUMN player_game_stats.passing_longest IS 'Longest completion in yards';
COMMENT ON COLUMN player_game_stats.passer_rating IS 'NFL passer rating (0-158.3)';
COMMENT ON COLUMN player_game_stats.qbr IS 'ESPN Total QBR (0-100)';

-- Rushing Advanced (4 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS rushing_longest INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS rushing_fumbles INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS rushing_fumbles_lost INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS rushing_yards_after_contact INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.rushing_longest IS 'Longest rush in yards';
COMMENT ON COLUMN player_game_stats.rushing_fumbles IS 'Total fumbles on rushing plays';
COMMENT ON COLUMN player_game_stats.rushing_fumbles_lost IS 'Fumbles lost on rushing plays';

-- Receiving Advanced (5 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS receiving_targets INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS receiving_longest INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS receiving_yards_after_catch INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS receiving_first_downs INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS receiving_fumbles INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.receiving_targets IS 'Number of times targeted';
COMMENT ON COLUMN player_game_stats.receiving_longest IS 'Longest reception in yards';
COMMENT ON COLUMN player_game_stats.receiving_yards_after_catch IS 'YAC - Yards after catch';
COMMENT ON COLUMN player_game_stats.receiving_first_downs IS 'First downs via receptions';

-- Defense Advanced (7 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS tackles_solo INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS tackles_assists INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS tackles_for_loss DECIMAL(5,1) DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS qb_hits INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS passes_defended INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS forced_fumbles INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fumble_recoveries INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.tackles_solo IS 'Solo tackles';
COMMENT ON COLUMN player_game_stats.tackles_assists IS 'Assisted tackles';
COMMENT ON COLUMN player_game_stats.tackles_for_loss IS 'Tackles for loss (TFL)';
COMMENT ON COLUMN player_game_stats.qb_hits IS 'QB hits (pressures)';
COMMENT ON COLUMN player_game_stats.passes_defended IS 'Passes defensed (PD)';
COMMENT ON COLUMN player_game_stats.forced_fumbles IS 'Forced fumbles';
COMMENT ON COLUMN player_game_stats.fumble_recoveries IS 'Fumble recoveries';

-- Kicking Advanced (3 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS field_goal_longest INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS extra_points_made INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS extra_points_attempted INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.field_goal_longest IS 'Longest field goal made';
COMMENT ON COLUMN player_game_stats.extra_points_made IS 'Extra points made';
COMMENT ON COLUMN player_game_stats.extra_points_attempted IS 'Extra points attempted';

-- Punting (6 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punts INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punt_yards INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punt_average DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punts_inside_20 INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punt_longest INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punt_touchbacks INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.punts IS 'Number of punts';
COMMENT ON COLUMN player_game_stats.punt_yards IS 'Total punt yards';
COMMENT ON COLUMN player_game_stats.punt_average IS 'Average yards per punt';
COMMENT ON COLUMN player_game_stats.punts_inside_20 IS 'Punts downed inside 20';
COMMENT ON COLUMN player_game_stats.punt_longest IS 'Longest punt';

-- =============================================================================
-- FANTASY POINTS (5 calculated fields)
-- =============================================================================

ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fantasy_points_standard DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fantasy_points_ppr DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fantasy_points_half_ppr DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fantasy_points_dfs_dk DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fantasy_points_dfs_fd DECIMAL(5,2);

COMMENT ON COLUMN player_game_stats.fantasy_points_standard IS 'Standard fantasy scoring (no PPR)';
COMMENT ON COLUMN player_game_stats.fantasy_points_ppr IS 'PPR fantasy scoring (1 pt per reception)';
COMMENT ON COLUMN player_game_stats.fantasy_points_half_ppr IS 'Half-PPR fantasy scoring (0.5 pt per reception)';
COMMENT ON COLUMN player_game_stats.fantasy_points_dfs_dk IS 'DraftKings DFS scoring';
COMMENT ON COLUMN player_game_stats.fantasy_points_dfs_fd IS 'FanDuel DFS scoring';

-- =============================================================================
-- NFLVERSE ADVANCED ANALYTICS (6 fields)
-- =============================================================================

ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS epa_total DECIMAL(6,3);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS epa_pass DECIMAL(6,3);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS epa_rush DECIMAL(6,3);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS epa_receive DECIMAL(6,3);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS cpoe DECIMAL(5,2);

COMMENT ON COLUMN player_game_stats.epa_total IS 'Total Expected Points Added';
COMMENT ON COLUMN player_game_stats.epa_pass IS 'Passing EPA';
COMMENT ON COLUMN player_game_stats.epa_rush IS 'Rushing EPA';
COMMENT ON COLUMN player_game_stats.epa_receive IS 'Receiving EPA';
COMMENT ON COLUMN player_game_stats.success_rate IS 'Play success rate percentage';
COMMENT ON COLUMN player_game_stats.cpoe IS 'Completion Percentage Over Expected (QB only)';

-- =============================================================================
-- OPPORTUNITY METRICS (8 fields) - from snap data sources
-- =============================================================================

ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS snaps_played INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS snaps_total INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS snap_percentage DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS routes_run INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS route_participation_pct DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS red_zone_touches INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS red_zone_targets INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS end_zone_targets INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.snaps_played IS 'Offensive snaps played';
COMMENT ON COLUMN player_game_stats.snaps_total IS 'Total offensive snaps for team';
COMMENT ON COLUMN player_game_stats.snap_percentage IS 'Percentage of offensive snaps played';
COMMENT ON COLUMN player_game_stats.routes_run IS 'Routes run (WR/TE)';
COMMENT ON COLUMN player_game_stats.route_participation_pct IS 'Percentage of pass plays where player ran route';
COMMENT ON COLUMN player_game_stats.red_zone_touches IS 'Touches inside red zone (rushing attempts + targets)';
COMMENT ON COLUMN player_game_stats.red_zone_targets IS 'Targets inside red zone';
COMMENT ON COLUMN player_game_stats.end_zone_targets IS 'Targets inside end zone';

-- =============================================================================
-- INDEXES (for new columns with high query frequency)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_player_game_stats_fantasy_ppr
  ON player_game_stats(fantasy_points_ppr DESC)
  WHERE deleted_at IS NULL AND fantasy_points_ppr IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_player_game_stats_targets
  ON player_game_stats(receiving_targets DESC)
  WHERE deleted_at IS NULL AND receiving_targets > 0;

CREATE INDEX IF NOT EXISTS idx_player_game_stats_epa
  ON player_game_stats(epa_total DESC)
  WHERE deleted_at IS NULL AND epa_total IS NOT NULL;

-- =============================================================================
-- SUMMARY
-- =============================================================================

COMMENT ON TABLE player_game_stats IS 'Player stats by game - ENHANCED with 44 new columns (ESPN advanced, Fantasy, EPA, Opportunity metrics)';

-- Total new columns: 44
-- ESPN Advanced: 25 columns
-- Fantasy Points: 5 columns
-- nflverse EPA: 6 columns
-- Opportunity Metrics: 8 columns
