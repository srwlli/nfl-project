-- Create remaining player statistics tables
-- Migration: 20250101000006_create_remaining_player_stats
-- Domain 2: Player Stats (continued)

-- =============================================================================
-- TABLE: player_defensive_stats
-- =============================================================================
CREATE TABLE player_defensive_stats (
    defensive_stat_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    tackles_total INTEGER DEFAULT 0,
    tackles_solo INTEGER DEFAULT 0,
    tackles_assists INTEGER DEFAULT 0,
    sacks DECIMAL(5,1) DEFAULT 0,
    sack_yards DECIMAL(6,1) DEFAULT 0,
    qb_hits INTEGER DEFAULT 0,
    tackles_for_loss INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    interception_yards INTEGER DEFAULT 0,
    interception_touchdowns INTEGER DEFAULT 0,
    passes_defended INTEGER DEFAULT 0,
    fumbles_forced INTEGER DEFAULT 0,
    fumbles_recovered INTEGER DEFAULT 0,
    fumble_touchdowns INTEGER DEFAULT 0,
    safeties INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_defensive_stats_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_defensive_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_player_defensive_stats_player ON player_defensive_stats(player_id, season);
CREATE INDEX idx_player_defensive_stats_tackles ON player_defensive_stats(tackles_total DESC);
CREATE INDEX idx_player_defensive_stats_sacks ON player_defensive_stats(sacks DESC);

COMMENT ON TABLE player_defensive_stats IS 'Detailed defensive stats (35,000+ records)';

-- =============================================================================
-- TABLE: player_kicking_stats
-- =============================================================================
CREATE TABLE player_kicking_stats (
    kicking_stat_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    field_goals_made INTEGER DEFAULT 0,
    field_goals_attempted INTEGER DEFAULT 0,
    field_goal_percentage DECIMAL(5,2),
    fg_made_0_19 INTEGER DEFAULT 0,
    fg_made_20_29 INTEGER DEFAULT 0,
    fg_made_30_39 INTEGER DEFAULT 0,
    fg_made_40_49 INTEGER DEFAULT 0,
    fg_made_50_plus INTEGER DEFAULT 0,
    longest_field_goal INTEGER,
    extra_points_made INTEGER DEFAULT 0,
    extra_points_attempted INTEGER DEFAULT 0,
    extra_point_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_kicking_stats_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_kicking_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_player_kicking_stats_player ON player_kicking_stats(player_id, season);
CREATE INDEX idx_player_kicking_stats_percentage ON player_kicking_stats(field_goal_percentage DESC);

COMMENT ON TABLE player_kicking_stats IS 'Kicking stats (8,000+ records)';

-- =============================================================================
-- TABLE: player_returning_stats
-- =============================================================================
CREATE TABLE player_returning_stats (
    returning_stat_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    kick_returns INTEGER DEFAULT 0,
    kick_return_yards INTEGER DEFAULT 0,
    kick_return_touchdowns INTEGER DEFAULT 0,
    kick_return_average DECIMAL(5,2),
    kick_return_longest INTEGER,
    punt_returns INTEGER DEFAULT 0,
    punt_return_yards INTEGER DEFAULT 0,
    punt_return_touchdowns INTEGER DEFAULT 0,
    punt_return_average DECIMAL(5,2),
    punt_return_longest INTEGER,
    fumbles INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_returning_stats_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_returning_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_player_returning_stats_player ON player_returning_stats(player_id, season);

COMMENT ON TABLE player_returning_stats IS 'Return specialist stats (12,000+ records)';

-- =============================================================================
-- TABLE: player_advanced_stats
-- =============================================================================
CREATE TABLE player_advanced_stats (
    advanced_stat_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    -- Advanced QB metrics
    epa_total DECIMAL(7,2),
    epa_per_play DECIMAL(6,4),
    cpoe DECIMAL(5,2),
    success_rate DECIMAL(5,2),
    -- Next Gen Stats (2016+)
    average_time_to_throw DECIMAL(4,2),
    average_completed_air_yards DECIMAL(5,2),
    average_intended_air_yards DECIMAL(5,2),
    aggressiveness_percentage DECIMAL(5,2),
    max_speed_mph DECIMAL(5,2),
    average_separation_yards DECIMAL(5,2),
    catch_percentage DECIMAL(5,2),
    cushion_yards DECIMAL(5,2),
    -- Other advanced metrics
    dvoa DECIMAL(6,2),
    war DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_advanced_stats_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_advanced_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_player_advanced_stats_player ON player_advanced_stats(player_id, season);
CREATE INDEX idx_player_advanced_stats_epa ON player_advanced_stats(epa_total DESC);

COMMENT ON TABLE player_advanced_stats IS 'Advanced analytics (EPA, CPOE, Next Gen Stats, 18,000+ records)';
