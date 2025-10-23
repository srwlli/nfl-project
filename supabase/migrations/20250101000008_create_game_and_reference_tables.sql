-- Create game details, leaderboards, and reference tables
-- Migration: 20250101000008_create_game_and_reference_tables
-- Domains 4, 5, 6: Game Details + Leaderboards + Reference tables

-- =============================================================================
-- DOMAIN 4: GAME DETAILS (7 tables)
-- =============================================================================

-- TABLE: game_stats
CREATE TABLE game_stats (
    game_stat_id SERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL UNIQUE,
    season INTEGER NOT NULL,
    total_points INTEGER DEFAULT 0,
    total_yards DECIMAL(7,1) DEFAULT 0,
    total_plays INTEGER DEFAULT 0,
    total_turnovers INTEGER DEFAULT 0,
    total_penalties INTEGER DEFAULT 0,
    total_penalty_yards INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_game_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_game_stats_season ON game_stats(season) WHERE deleted_at IS NULL;

-- TABLE: game_drives
CREATE TABLE game_drives (
    drive_id BIGSERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    team_id VARCHAR(10) NOT NULL,
    drive_number INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter >= 1 AND quarter <= 5),
    start_time_seconds INTEGER,
    end_time_seconds INTEGER,
    duration_seconds INTEGER,
    plays INTEGER DEFAULT 0,
    yards DECIMAL(6,1) DEFAULT 0,
    result VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_game_drives_team FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_game_drives_game ON game_drives(game_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE game_drives IS 'Drive-by-drive breakdown (280,000+ drives)';

-- TABLE: play_by_play (PARTITIONED by season)
CREATE TABLE play_by_play (
    play_id BIGSERIAL NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    drive_id BIGINT,
    play_number INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter >= 1 AND quarter <= 5),
    time_remaining_seconds INTEGER,
    down INTEGER CHECK (down >= 1 AND down <= 4),
    yards_to_go INTEGER,
    yard_line INTEGER CHECK (yard_line >= -50 AND yard_line <= 50),
    possession_team_id VARCHAR(10),
    play_type VARCHAR(50),
    play_description TEXT,
    yards_gained DECIMAL(5,1),
    epa DECIMAL(7,4),
    wpa DECIMAL(7,4),
    success BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (play_id, season),
    CONSTRAINT fk_play_by_play_drive FOREIGN KEY (drive_id) REFERENCES game_drives(drive_id),
    CONSTRAINT fk_play_by_play_team FOREIGN KEY (possession_team_id) REFERENCES teams(team_id)
) PARTITION BY RANGE (season);

-- Create partitions
CREATE TABLE play_by_play_historical PARTITION OF play_by_play
    FOR VALUES FROM (1970) TO (2020);
CREATE TABLE play_by_play_2020 PARTITION OF play_by_play
    FOR VALUES FROM (2020) TO (2021);
CREATE TABLE play_by_play_2021 PARTITION OF play_by_play
    FOR VALUES FROM (2021) TO (2022);
CREATE TABLE play_by_play_2022 PARTITION OF play_by_play
    FOR VALUES FROM (2022) TO (2023);
CREATE TABLE play_by_play_2023 PARTITION OF play_by_play
    FOR VALUES FROM (2023) TO (2024);
CREATE TABLE play_by_play_2024 PARTITION OF play_by_play
    FOR VALUES FROM (2024) TO (2025);
CREATE TABLE play_by_play_2025 PARTITION OF play_by_play
    FOR VALUES FROM (2025) TO (2026);

CREATE INDEX idx_play_by_play_game ON play_by_play(game_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE play_by_play IS 'Play-by-play data (7M+ plays, partitioned by season)';

-- TABLE: scoring_plays
CREATE TABLE scoring_plays (
    scoring_play_id SERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL,
    play_id BIGINT,
    season INTEGER NOT NULL,
    team_id VARCHAR(10) NOT NULL,
    quarter INTEGER,
    time_remaining_seconds INTEGER,
    scoring_type VARCHAR(50),
    points INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_scoring_plays_team FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_scoring_plays_game ON scoring_plays(game_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE scoring_plays IS 'All scoring plays (70,000+ scores)';

-- TABLE: key_plays
CREATE TABLE key_plays (
    key_play_id SERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL,
    play_id BIGINT,
    season INTEGER NOT NULL,
    play_type VARCHAR(50),
    importance_score DECIMAL(5,2),
    description TEXT,
    video_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_key_plays_game ON key_plays(game_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE key_plays IS 'Highlight/key plays (140,000+ plays)';

-- TABLE: game_weather
CREATE TABLE game_weather (
    weather_id SERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL UNIQUE,
    temperature_fahrenheit INTEGER,
    humidity_percentage INTEGER,
    wind_speed_mph INTEGER,
    wind_direction VARCHAR(10),
    precipitation VARCHAR(50),
    conditions VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

COMMENT ON TABLE game_weather IS 'Weather conditions for games (14,000+ records)';

-- TABLE: game_officials
CREATE TABLE game_officials (
    game_official_id SERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL,
    official_name VARCHAR(200) NOT NULL,
    position VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_game_officials_game ON game_officials(game_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE game_officials IS 'Officiating crews (14,000+ games)';

-- =============================================================================
-- DOMAIN 5: LEADERBOARDS (4 tables)
-- =============================================================================

-- REMOVED: season_leaderboards (redundant - data in weekly_stat_leaders + player_season_cumulative_stats)
-- REMOVED: career_leaderboards (redundant - data in player_season_cumulative_stats)
-- REMOVED: active_leaderboards (redundant - data in weekly_stat_leaders)
-- REMOVED: rookie_leaderboards (redundant - data in weekly_stat_leaders)

-- =============================================================================
-- DOMAIN 6: REFERENCE & RELATIONSHIPS (7 tables)
-- =============================================================================

-- TABLE: player_teams
CREATE TABLE player_teams (
    player_team_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(10) NOT NULL,
    start_season INTEGER NOT NULL,
    end_season INTEGER,
    jersey_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_teams_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_teams_team FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_player_teams_player ON player_teams(player_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_player_teams_team ON player_teams(team_id, start_season) WHERE deleted_at IS NULL;

COMMENT ON TABLE player_teams IS 'Player-team history (35,000+ records)';

-- TABLE: player_awards
CREATE TABLE player_awards (
    player_award_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    award_type_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    team_id VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_awards_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_awards_award_type FOREIGN KEY (award_type_id) REFERENCES award_types(award_type_id),
    CONSTRAINT fk_player_awards_team FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_player_awards_player ON player_awards(player_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_player_awards_season ON player_awards(season, award_type_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE player_awards IS 'Awards won by players (5,000+ records)';

-- TABLE: player_milestones
CREATE TABLE player_milestones (
    milestone_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    milestone_type VARCHAR(100) NOT NULL,
    milestone_value INTEGER,
    achieved_date DATE,
    achieved_season INTEGER,
    game_id VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_milestones_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX idx_player_milestones_player ON player_milestones(player_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE player_milestones IS 'Career milestones (2,000+ records)';

-- TABLE: player_injuries
CREATE TABLE player_injuries (
    injury_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    injury_type VARCHAR(100),
    injury_description TEXT,
    injury_date DATE,
    return_date DATE,
    games_missed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_injuries_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);

CREATE INDEX idx_player_injuries_player ON player_injuries(player_id, season) WHERE deleted_at IS NULL;

COMMENT ON TABLE player_injuries IS 'Injury history (8,000+ records)';

-- TABLE: player_contracts
CREATE TABLE player_contracts (
    contract_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(10) NOT NULL,
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    total_value_usd BIGINT,
    average_annual_value_usd INTEGER,
    guaranteed_usd BIGINT,
    signing_bonus_usd INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_contracts_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_player_contracts_team FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_player_contracts_player ON player_contracts(player_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE player_contracts IS 'Contract details (10,000+ records)';

-- TABLE: roster_transactions
CREATE TABLE roster_transactions (
    transaction_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(10) NOT NULL,
    transaction_type transaction_type NOT NULL,
    transaction_date DATE NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_roster_transactions_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE,
    CONSTRAINT fk_roster_transactions_team FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_roster_transactions_player ON roster_transactions(player_id, transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_roster_transactions_team ON roster_transactions(team_id, transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_roster_transactions_date ON roster_transactions(transaction_date DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE roster_transactions IS 'Signings, trades, releases (50,000+ transactions)';
