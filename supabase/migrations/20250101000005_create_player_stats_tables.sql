-- Create player statistics tables
-- Migration: 20250101000005_create_player_stats_tables
-- Domain 2: Player Stats (10 tables, 2 partitioned)

-- =============================================================================
-- TABLE: player_season_stats (PARTITIONED by decade)
-- =============================================================================
CREATE TABLE player_season_stats (
    player_season_id BIGSERIAL NOT NULL,
    player_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    team_id VARCHAR(10) NOT NULL,
    primary_position VARCHAR(10) NOT NULL,
    games_played INTEGER DEFAULT 0 CHECK (games_played >= 0 AND games_played <= 20),
    games_started INTEGER DEFAULT 0 CHECK (games_started >= 0),
    -- Passing stats
    passing_attempts INTEGER DEFAULT 0,
    passing_completions INTEGER DEFAULT 0,
    passing_yards INTEGER DEFAULT 0,
    passing_touchdowns INTEGER DEFAULT 0,
    passing_interceptions INTEGER DEFAULT 0,
    passing_sacks INTEGER DEFAULT 0,
    passing_sack_yards INTEGER DEFAULT 0,
    -- Rushing stats
    rushing_attempts INTEGER DEFAULT 0,
    rushing_yards INTEGER DEFAULT 0,
    rushing_touchdowns INTEGER DEFAULT 0,
    rushing_fumbles INTEGER DEFAULT 0,
    -- Receiving stats
    receptions INTEGER DEFAULT 0,
    receiving_targets INTEGER DEFAULT 0,
    receiving_yards INTEGER DEFAULT 0,
    receiving_touchdowns INTEGER DEFAULT 0,
    receiving_fumbles INTEGER DEFAULT 0,
    -- Defense stats
    tackles_total INTEGER DEFAULT 0,
    tackles_solo INTEGER DEFAULT 0,
    tackles_assists INTEGER DEFAULT 0,
    sacks DECIMAL(5,1) DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    interceptions_yards INTEGER DEFAULT 0,
    interceptions_touchdowns INTEGER DEFAULT 0,
    passes_defended INTEGER DEFAULT 0,
    fumbles_forced INTEGER DEFAULT 0,
    fumbles_recovered INTEGER DEFAULT 0,
    fumbles_touchdowns INTEGER DEFAULT 0,
    -- Kicking stats
    field_goals_made INTEGER DEFAULT 0,
    field_goals_attempted INTEGER DEFAULT 0,
    extra_points_made INTEGER DEFAULT 0,
    extra_points_attempted INTEGER DEFAULT 0,
    -- Punting stats
    punts INTEGER DEFAULT 0,
    punt_yards INTEGER DEFAULT 0,
    punt_average DECIMAL(5,2) DEFAULT 0,
    -- Return stats
    kick_returns INTEGER DEFAULT 0,
    kick_return_yards INTEGER DEFAULT 0,
    kick_return_touchdowns INTEGER DEFAULT 0,
    punt_returns INTEGER DEFAULT 0,
    punt_return_yards INTEGER DEFAULT 0,
    punt_return_touchdowns INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (player_season_id, season),
    CONSTRAINT uq_player_season_team UNIQUE (player_id, season, team_id),
    CONSTRAINT fk_player_season_stats_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_season_stats_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_player_season_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
) PARTITION BY RANGE (season);

-- Create partitions by decade
CREATE TABLE player_season_stats_1970s PARTITION OF player_season_stats
    FOR VALUES FROM (1970) TO (1980);

CREATE TABLE player_season_stats_1980s PARTITION OF player_season_stats
    FOR VALUES FROM (1980) TO (1990);

CREATE TABLE player_season_stats_1990s PARTITION OF player_season_stats
    FOR VALUES FROM (1990) TO (2000);

CREATE TABLE player_season_stats_2000s PARTITION OF player_season_stats
    FOR VALUES FROM (2000) TO (2010);

CREATE TABLE player_season_stats_2010s PARTITION OF player_season_stats
    FOR VALUES FROM (2010) TO (2020);

CREATE TABLE player_season_stats_2020s PARTITION OF player_season_stats
    FOR VALUES FROM (2020) TO (2030);

-- Indexes
CREATE INDEX idx_player_season_stats_player ON player_season_stats(player_id, season) WHERE deleted_at IS NULL;
CREATE INDEX idx_player_season_stats_team ON player_season_stats(team_id, season) WHERE deleted_at IS NULL;
CREATE INDEX idx_player_season_stats_position ON player_season_stats(primary_position, season) WHERE deleted_at IS NULL;
CREATE INDEX idx_player_season_stats_passing_yards ON player_season_stats(passing_yards DESC) WHERE deleted_at IS NULL AND passing_yards > 0;
CREATE INDEX idx_player_season_stats_rushing_yards ON player_season_stats(rushing_yards DESC) WHERE deleted_at IS NULL AND rushing_yards > 0;
CREATE INDEX idx_player_season_stats_receiving_yards ON player_season_stats(receiving_yards DESC) WHERE deleted_at IS NULL AND receiving_yards > 0;

COMMENT ON TABLE player_season_stats IS 'Aggregated player stats by season (145,000+ records, partitioned by decade)';

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
    CONSTRAINT uq_player_game UNIQUE (player_id, game_id),
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

-- =============================================================================
-- TABLE: player_career_stats
-- =============================================================================
CREATE TABLE player_career_stats (
    player_id VARCHAR(50) PRIMARY KEY,
    first_season INTEGER,
    last_season INTEGER,
    total_seasons INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    -- Career passing totals
    career_passing_attempts INTEGER DEFAULT 0,
    career_passing_completions INTEGER DEFAULT 0,
    career_passing_yards INTEGER DEFAULT 0,
    career_passing_touchdowns INTEGER DEFAULT 0,
    career_passing_interceptions INTEGER DEFAULT 0,
    -- Career rushing totals
    career_rushing_attempts INTEGER DEFAULT 0,
    career_rushing_yards INTEGER DEFAULT 0,
    career_rushing_touchdowns INTEGER DEFAULT 0,
    -- Career receiving totals
    career_receptions INTEGER DEFAULT 0,
    career_receiving_yards INTEGER DEFAULT 0,
    career_receiving_touchdowns INTEGER DEFAULT 0,
    -- Career defense totals
    career_tackles INTEGER DEFAULT 0,
    career_sacks DECIMAL(6,1) DEFAULT 0,
    career_interceptions INTEGER DEFAULT 0,
    -- Career special teams totals
    career_field_goals_made INTEGER DEFAULT 0,
    career_field_goals_attempted INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_career_stats_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX idx_player_career_stats_passing_yards ON player_career_stats(career_passing_yards DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_player_career_stats_rushing_yards ON player_career_stats(career_rushing_yards DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_player_career_stats_receiving_yards ON player_career_stats(career_receiving_yards DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE player_career_stats IS 'Denormalized career totals for fast queries (27,000 players)';

-- Position-specific stats tables (non-partitioned)

-- =============================================================================
-- TABLE: player_passing_stats
-- =============================================================================
CREATE TABLE player_passing_stats (
    passing_stat_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    completions INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    yards INTEGER DEFAULT 0,
    touchdowns INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    sacks INTEGER DEFAULT 0,
    sack_yards INTEGER DEFAULT 0,
    completion_percentage DECIMAL(5,2),
    yards_per_attempt DECIMAL(5,2),
    yards_per_completion DECIMAL(5,2),
    passer_rating DECIMAL(6,2),
    qbr DECIMAL(5,2),
    longest_completion INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_passing_stats_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_passing_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_player_passing_stats_player ON player_passing_stats(player_id, season);
CREATE INDEX idx_player_passing_stats_yards ON player_passing_stats(yards DESC);

-- =============================================================================
-- TABLE: player_rushing_stats
-- =============================================================================
CREATE TABLE player_rushing_stats (
    rushing_stat_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    attempts INTEGER DEFAULT 0,
    yards INTEGER DEFAULT 0,
    touchdowns INTEGER DEFAULT 0,
    fumbles INTEGER DEFAULT 0,
    yards_per_attempt DECIMAL(5,2),
    yards_per_game DECIMAL(6,2),
    longest_rush INTEGER,
    first_downs INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_rushing_stats_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_rushing_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_player_rushing_stats_player ON player_rushing_stats(player_id, season);
CREATE INDEX idx_player_rushing_stats_yards ON player_rushing_stats(yards DESC);

-- =============================================================================
-- TABLE: player_receiving_stats
-- =============================================================================
CREATE TABLE player_receiving_stats (
    receiving_stat_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    receptions INTEGER DEFAULT 0,
    targets INTEGER DEFAULT 0,
    yards INTEGER DEFAULT 0,
    touchdowns INTEGER DEFAULT 0,
    fumbles INTEGER DEFAULT 0,
    yards_per_reception DECIMAL(5,2),
    yards_per_target DECIMAL(5,2),
    catch_percentage DECIMAL(5,2),
    longest_reception INTEGER,
    first_downs INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_receiving_stats_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_receiving_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_player_receiving_stats_player ON player_receiving_stats(player_id, season);
CREATE INDEX idx_player_receiving_stats_yards ON player_receiving_stats(yards DESC);

-- Continue with remaining position-specific tables...
-- (Continuing in next migration for clarity)
