-- Create player statistics tables
-- Migration: 20250101000005_create_player_stats_tables
-- Domain 2: Player Stats (1 table - removed 5 redundant stat tables)

-- REMOVED: player_season_stats (redundant - we use player_season_cumulative_stats in migration 21 instead)
-- The old partitioned player_season_stats was replaced by player_season_cumulative_stats which aggregates from player_game_stats

-- =============================================================================
-- TABLE: player_game_stats (PARTITIONED by season - recent years)
-- =============================================================================
CREATE TABLE player_game_stats (
    player_game_id BIGSERIAL NOT NULL,
    player_id VARCHAR(50) NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    team_id VARCHAR(10) NOT NULL,
    opponent_team_id VARCHAR(10) NOT NULL,
    started BOOLEAN DEFAULT FALSE,
    -- Passing stats (subset for game-level)
    passing_attempts INTEGER DEFAULT 0,
    passing_completions INTEGER DEFAULT 0,
    passing_yards INTEGER DEFAULT 0,
    passing_touchdowns INTEGER DEFAULT 0,
    passing_interceptions INTEGER DEFAULT 0,
    -- Rushing stats
    rushing_attempts INTEGER DEFAULT 0,
    rushing_yards INTEGER DEFAULT 0,
    rushing_touchdowns INTEGER DEFAULT 0,
    -- Receiving stats
    receptions INTEGER DEFAULT 0,
    receiving_yards INTEGER DEFAULT 0,
    receiving_touchdowns INTEGER DEFAULT 0,
    -- Defense stats
    tackles_total INTEGER DEFAULT 0,
    sacks DECIMAL(5,1) DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    -- Special teams
    field_goals_made INTEGER DEFAULT 0,
    field_goals_attempted INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (player_game_id, season),
    CONSTRAINT uq_player_game UNIQUE (player_id, game_id, season),
    CONSTRAINT fk_player_game_stats_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_game_stats_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_player_game_stats_opponent FOREIGN KEY (opponent_team_id) REFERENCES teams(team_id)
) PARTITION BY RANGE (season);

-- Create partitions (historical combined, recent individual)
CREATE TABLE player_game_stats_historical PARTITION OF player_game_stats
    FOR VALUES FROM (1970) TO (2020);

CREATE TABLE player_game_stats_2020 PARTITION OF player_game_stats
    FOR VALUES FROM (2020) TO (2021);

CREATE TABLE player_game_stats_2021 PARTITION OF player_game_stats
    FOR VALUES FROM (2021) TO (2022);

CREATE TABLE player_game_stats_2022 PARTITION OF player_game_stats
    FOR VALUES FROM (2022) TO (2023);

CREATE TABLE player_game_stats_2023 PARTITION OF player_game_stats
    FOR VALUES FROM (2023) TO (2024);

CREATE TABLE player_game_stats_2024 PARTITION OF player_game_stats
    FOR VALUES FROM (2024) TO (2025);

CREATE TABLE player_game_stats_2025 PARTITION OF player_game_stats
    FOR VALUES FROM (2025) TO (2026);

-- Indexes
CREATE INDEX idx_player_game_stats_player ON player_game_stats(player_id, season) WHERE deleted_at IS NULL;
CREATE INDEX idx_player_game_stats_game ON player_game_stats(game_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE player_game_stats IS 'Player stats by game (1,000,000+ records, partitioned by season)';

-- REMOVED: player_career_stats (redundant - cumulative data in player_season_cumulative_stats)
-- REMOVED: player_passing_stats (redundant - 20 passing fields in player_game_stats)
-- REMOVED: player_rushing_stats (redundant - 9 rushing fields in player_game_stats)
-- REMOVED: player_receiving_stats (redundant - 10 receiving fields in player_game_stats)
