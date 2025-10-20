-- Create Weekly Aggregation Tables
-- Migration: 20250101000021_create_weekly_aggregation_tables
-- Phase 1: Foundation Enhancement
-- Supports Section 2 (Weekly Leaderboards), Section 3 (Season Cumulative), Section 7 (Trending)

-- =============================================================================
-- TABLE: weekly_stat_leaders
-- Purpose: Store weekly leaderboards across all stat categories
-- =============================================================================

CREATE TABLE weekly_stat_leaders (
    week_leader_id BIGSERIAL PRIMARY KEY,
    season INTEGER NOT NULL,
    week INTEGER NOT NULL CHECK (week >= 1 AND week <= 22),
    category VARCHAR(50) NOT NULL,
    rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 100),
    player_id VARCHAR(50) NOT NULL,

    -- Core stat value
    stat_value DECIMAL(10,2) NOT NULL,

    -- Supporting context
    touchdowns INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    receptions INTEGER,
    passer_rating DECIMAL(5,2),
    game_result VARCHAR(20), -- 'W 31-27 vs BUF' or 'L 27-31 vs KC'

    -- Trending indicators
    trending_indicator VARCHAR(10), -- '🔥', '▲', '▼', ''
    trending_description TEXT,
    comparison_to_season_avg DECIMAL(10,2),

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_weekly_leader UNIQUE (season, week, category, rank),
    CONSTRAINT fk_weekly_leader_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX idx_weekly_leaders_season_week ON weekly_stat_leaders(season, week);
CREATE INDEX idx_weekly_leaders_category ON weekly_stat_leaders(category, season, week);
CREATE INDEX idx_weekly_leaders_player ON weekly_stat_leaders(player_id, season);

COMMENT ON TABLE weekly_stat_leaders IS 'Weekly statistical leaders across all categories (Section 2: Weekly Leaderboards)';
COMMENT ON COLUMN weekly_stat_leaders.category IS 'Stat category: passing_yards, rushing_yards, receiving_yards, fantasy_points_ppr, etc.';
COMMENT ON COLUMN weekly_stat_leaders.trending_indicator IS 'Visual indicator: 🔥 hot, ▲ rising, ▼ falling';

-- =============================================================================
-- TABLE: player_season_cumulative_stats
-- Purpose: Running season totals through current week
-- =============================================================================

CREATE TABLE player_season_cumulative_stats (
    player_season_id BIGSERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    last_updated_week INTEGER NOT NULL,

    -- Games played
    games_played INTEGER DEFAULT 0,
    games_started INTEGER DEFAULT 0,

    -- Passing cumulative
    season_passing_attempts INTEGER DEFAULT 0,
    season_passing_completions INTEGER DEFAULT 0,
    season_passing_yards INTEGER DEFAULT 0,
    season_passing_touchdowns INTEGER DEFAULT 0,
    season_passing_interceptions INTEGER DEFAULT 0,
    season_passing_sacks INTEGER DEFAULT 0,
    season_passer_rating DECIMAL(5,2),

    -- Rushing cumulative
    season_rushing_attempts INTEGER DEFAULT 0,
    season_rushing_yards INTEGER DEFAULT 0,
    season_rushing_touchdowns INTEGER DEFAULT 0,
    season_rushing_fumbles_lost INTEGER DEFAULT 0,

    -- Receiving cumulative
    season_receptions INTEGER DEFAULT 0,
    season_receiving_yards INTEGER DEFAULT 0,
    season_receiving_touchdowns INTEGER DEFAULT 0,
    season_receiving_targets INTEGER DEFAULT 0,

    -- Defense cumulative
    season_tackles_total INTEGER DEFAULT 0,
    season_sacks DECIMAL(5,1) DEFAULT 0,
    season_interceptions INTEGER DEFAULT 0,
    season_forced_fumbles INTEGER DEFAULT 0,
    season_passes_defended INTEGER DEFAULT 0,

    -- Kicking cumulative
    season_field_goals_made INTEGER DEFAULT 0,
    season_field_goals_attempted INTEGER DEFAULT 0,

    -- Fantasy cumulative
    season_fantasy_points_standard DECIMAL(7,2),
    season_fantasy_points_ppr DECIMAL(7,2),
    season_fantasy_points_half_ppr DECIMAL(7,2),

    -- Rankings (calculated)
    season_rank_passing_yards INTEGER,
    season_rank_rushing_yards INTEGER,
    season_rank_receiving_yards INTEGER,
    season_rank_fantasy_ppr INTEGER,

    -- Pace projections (calculated for 17-game season)
    pace_projected_passing_yards INTEGER,
    pace_projected_passing_touchdowns INTEGER,
    pace_projected_rushing_yards INTEGER,
    pace_projected_rushing_touchdowns INTEGER,
    pace_projected_receptions INTEGER,
    pace_projected_receiving_yards INTEGER,
    pace_projected_receiving_touchdowns INTEGER,

    -- Historical context
    historical_comparison TEXT, -- 'On pace for 5236 yards (would rank 3rd all-time)'

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_player_season_cumulative UNIQUE (player_id, season),
    CONSTRAINT fk_player_season_cumulative_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX idx_player_season_cumulative_season ON player_season_cumulative_stats(season);
CREATE INDEX idx_player_season_cumulative_passing_yards ON player_season_cumulative_stats(season_passing_yards DESC) WHERE season_passing_yards > 0;
CREATE INDEX idx_player_season_cumulative_rushing_yards ON player_season_cumulative_stats(season_rushing_yards DESC) WHERE season_rushing_yards > 0;
CREATE INDEX idx_player_season_cumulative_receiving_yards ON player_season_cumulative_stats(season_receiving_yards DESC) WHERE season_receiving_yards > 0;
CREATE INDEX idx_player_season_cumulative_fantasy_ppr ON player_season_cumulative_stats(season_fantasy_points_ppr DESC) WHERE season_fantasy_points_ppr > 0;

COMMENT ON TABLE player_season_cumulative_stats IS 'Running season totals through current week (Section 3: Season Cumulative Stats)';
COMMENT ON COLUMN player_season_cumulative_stats.last_updated_week IS 'Most recent week included in cumulative stats';
COMMENT ON COLUMN player_season_cumulative_stats.historical_comparison IS 'Context like "On pace for X, would rank Nth all-time"';

-- =============================================================================
-- TABLE: player_trending_analytics
-- Purpose: Hot/cold streaks, week-over-week changes, breakout detection
-- =============================================================================

CREATE TABLE player_trending_analytics (
    trending_id BIGSERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    week INTEGER NOT NULL CHECK (week >= 1 AND week <= 22),

    -- Trending status
    trending_status VARCHAR(20) NOT NULL, -- 'hot', 'cold', 'stable', 'breakout', 'injury_concern'

    -- Hot streak
    hot_streak_weeks INTEGER DEFAULT 0,
    hot_streak_criteria TEXT,
    hot_streak_indicator VARCHAR(10), -- '🔥'

    -- Cold streak
    cold_streak_weeks INTEGER DEFAULT 0,
    cold_streak_criteria TEXT,

    -- Week-over-week changes (stored as JSONB for flexibility)
    week_over_week_changes JSONB,
    /*
    Example structure:
    {
      "receiving_yards": { "this_week": 142, "last_week": 98, "change": 44, "change_pct": 44.9 },
      "targets": { "this_week": 12, "last_week": 8, "change": 4, "change_pct": 50.0 },
      "target_share": { "this_week": 32.5, "last_week": 24.2, "change": 8.3, "change_pct": 34.3 }
    }
    */

    -- Pace projections
    pace_projected_yards INTEGER,
    pace_projected_touchdowns INTEGER,
    pace_projected_receptions INTEGER,

    -- Breakout alert
    breakout_alert BOOLEAN DEFAULT FALSE,
    breakout_type VARCHAR(50), -- 'usage_spike', 'role_change', 'hot_hand'
    breakout_details TEXT,
    breakout_confidence VARCHAR(10), -- 'high', 'medium', 'low'

    -- Usage trends (stored as JSONB)
    usage_trends JSONB,
    /*
    Example structure:
    {
      "target_trend": { "weeks_1_4_avg": 7.2, "weeks_5_7_avg": 11.3, "trend": "sharply_increasing", "change_pct": 56.9 },
      "snap_pct_trend": { "weeks_1_4_avg": 78.5, "weeks_5_7_avg": 92.1, "trend": "increasing", "change_pct": 17.3 }
    }
    */

    -- Alerts (array of text messages)
    alerts TEXT[],
    /*
    Example:
    ['🔥 Hot streak - 3 consecutive 100+ yard games', '📈 Breakout alert - Usage spike detected']
    */

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_trending UNIQUE (player_id, season, week),
    CONSTRAINT fk_trending_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX idx_trending_season_week ON player_trending_analytics(season, week);
CREATE INDEX idx_trending_status ON player_trending_analytics(trending_status, season, week);
CREATE INDEX idx_trending_breakout ON player_trending_analytics(breakout_alert, season, week) WHERE breakout_alert = TRUE;
CREATE INDEX idx_trending_hot_streak ON player_trending_analytics(hot_streak_weeks DESC) WHERE hot_streak_weeks >= 3;

COMMENT ON TABLE player_trending_analytics IS 'Trending analytics: hot/cold streaks, breakouts, usage trends (Section 7: Trending Analytics)';
COMMENT ON COLUMN player_trending_analytics.trending_status IS 'Overall status: hot, cold, stable, breakout, injury_concern';
COMMENT ON COLUMN player_trending_analytics.week_over_week_changes IS 'JSONB object with WoW stat changes';
COMMENT ON COLUMN player_trending_analytics.usage_trends IS 'JSONB object with multi-week usage trend analysis';
COMMENT ON COLUMN player_trending_analytics.alerts IS 'Array of alert messages for display';

-- =============================================================================
-- VIEWS: Convenient queries for common use cases
-- =============================================================================

-- View: Top 10 weekly leaders by category
CREATE OR REPLACE VIEW v_top_weekly_leaders AS
SELECT
    wsl.*,
    p.full_name,
    p.primary_position,
    t.team_name,
    t.team_abbreviation
FROM weekly_stat_leaders wsl
INNER JOIN players p ON wsl.player_id = p.player_id
LEFT JOIN player_teams pt ON p.player_id = pt.player_id AND pt.season = wsl.season
LEFT JOIN teams t ON pt.team_id = t.team_id
WHERE wsl.rank <= 10
ORDER BY wsl.season DESC, wsl.week DESC, wsl.category, wsl.rank;

COMMENT ON VIEW v_top_weekly_leaders IS 'Top 10 weekly statistical leaders with player/team info';

-- View: Season leaders (current season only)
CREATE OR REPLACE VIEW v_season_leaders AS
SELECT
    psc.*,
    p.full_name,
    p.primary_position,
    t.team_name,
    t.team_abbreviation
FROM player_season_cumulative_stats psc
INNER JOIN players p ON psc.player_id = p.player_id
LEFT JOIN player_teams pt ON p.player_id = pt.player_id AND pt.season = psc.season
LEFT JOIN teams t ON pt.team_id = t.team_id
WHERE psc.season = EXTRACT(YEAR FROM CURRENT_DATE)
  AND psc.games_played >= 4 -- Minimum qualifier
ORDER BY psc.season_fantasy_points_ppr DESC;

COMMENT ON VIEW v_season_leaders IS 'Season leaders with minimum 4 games played';

-- View: Hot players (3+ week hot streak)
CREATE OR REPLACE VIEW v_hot_players AS
SELECT
    pta.*,
    p.full_name,
    p.primary_position,
    t.team_name,
    t.team_abbreviation
FROM player_trending_analytics pta
INNER JOIN players p ON pta.player_id = p.player_id
LEFT JOIN player_teams pt ON p.player_id = pt.player_id AND pt.season = pta.season
LEFT JOIN teams t ON pt.team_id = t.team_id
WHERE pta.hot_streak_weeks >= 3
  AND pta.season = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY pta.hot_streak_weeks DESC, pta.week DESC;

COMMENT ON VIEW v_hot_players IS 'Players on hot streaks (3+ consecutive strong performances)';

-- =============================================================================
-- SUMMARY
-- =============================================================================

-- Tables created: 3
-- 1. weekly_stat_leaders (12 categories × 10 leaders × 18 weeks = ~2,160 records/season)
-- 2. player_season_cumulative_stats (~2,500 active players/season)
-- 3. player_trending_analytics (~500 tracked players × 18 weeks = ~9,000 records/season)
--
-- Views created: 3
-- 1. v_top_weekly_leaders (convenient weekly leaderboard query)
-- 2. v_season_leaders (current season standings)
-- 3. v_hot_players (trending hot players)
