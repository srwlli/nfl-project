-- Create core entity tables (players, coaches, seasons, games, team_seasons)
-- Migration: 20250101000004_create_core_entity_tables
-- Domain 1: Core Entities - Main

-- =============================================================================
-- TABLE: seasons
-- =============================================================================
CREATE TABLE seasons (
    season INTEGER PRIMARY KEY CHECK (season >= 1970 AND season <= 2030),
    start_date DATE NOT NULL,
    end_date DATE,
    super_bowl_winner VARCHAR(10),
    super_bowl_runner_up VARCHAR(10),
    super_bowl_location VARCHAR(100),
    super_bowl_date DATE,
    regular_season_weeks INTEGER DEFAULT 17,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_seasons_dates ON seasons(start_date, end_date) WHERE deleted_at IS NULL;

COMMENT ON TABLE seasons IS 'NFL seasons (1970-2024+)';
COMMENT ON COLUMN seasons.season IS 'Year the season started (e.g., 2024)';

-- =============================================================================
-- TABLE: players
-- =============================================================================
CREATE TABLE players (
    player_id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    primary_position VARCHAR(10) NOT NULL,
    secondary_positions VARCHAR(50),
    jersey_number INTEGER CHECK (jersey_number >= 0 AND jersey_number <= 99),
    height_inches INTEGER,
    weight_lbs INTEGER,
    birth_date DATE,
    birth_city VARCHAR(100),
    birth_state VARCHAR(50),
    birth_country VARCHAR(50),
    college VARCHAR(200),
    high_school VARCHAR(200),
    draft_year INTEGER,
    draft_round INTEGER CHECK (draft_round >= 1 AND draft_round <= 7),
    draft_pick INTEGER CHECK (draft_pick >= 1 AND draft_pick <= 300),
    draft_team_id VARCHAR(10),
    undrafted BOOLEAN DEFAULT FALSE,
    rookie_year INTEGER,
    final_year INTEGER,
    hof_inducted BOOLEAN DEFAULT FALSE,
    hof_induction_year INTEGER,
    status player_status DEFAULT 'active',
    headshot_url TEXT,
    profile_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_players_primary_position FOREIGN KEY (primary_position) REFERENCES positions(position_id),
    CONSTRAINT fk_players_draft_team FOREIGN KEY (draft_team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_players_last_name ON players(last_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_players_position ON players(primary_position) WHERE deleted_at IS NULL;
CREATE INDEX idx_players_last_name_trgm ON players USING gin(last_name gin_trgm_ops);
CREATE INDEX idx_players_full_name_trgm ON players USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_players_status ON players(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_players_hof ON players(hof_inducted) WHERE hof_inducted = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_players_draft_year ON players(draft_year) WHERE deleted_at IS NULL;

COMMENT ON TABLE players IS 'All NFL players (27,000+ historical and current)';
COMMENT ON COLUMN players.player_id IS 'Unique identifier (e.g., "brady-tom")';
COMMENT ON COLUMN players.metadata IS 'Additional data (nicknames, awards, etc.)';

-- =============================================================================
-- TABLE: coaches
-- =============================================================================
CREATE TABLE coaches (
    coach_id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200),
    birth_date DATE,
    birth_city VARCHAR(100),
    birth_state VARCHAR(50),
    first_season INTEGER,
    last_season INTEGER,
    hof_inducted BOOLEAN DEFAULT FALSE,
    hof_induction_year INTEGER,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    total_ties INTEGER DEFAULT 0,
    playoff_wins INTEGER DEFAULT 0,
    playoff_losses INTEGER DEFAULT 0,
    super_bowl_wins INTEGER DEFAULT 0,
    headshot_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_coaches_last_name ON coaches(last_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_coaches_hof ON coaches(hof_inducted) WHERE hof_inducted = TRUE AND deleted_at IS NULL;

COMMENT ON TABLE coaches IS 'NFL head coaches and coordinators';

-- =============================================================================
-- TABLE: games (PARTITIONED by season)
-- =============================================================================
CREATE TABLE games (
    game_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    week INTEGER NOT NULL CHECK (week >= 1 AND week <= 22),
    game_type season_type NOT NULL,
    game_date DATE NOT NULL,
    game_time TIME,
    home_team_id VARCHAR(10) NOT NULL,
    away_team_id VARCHAR(10) NOT NULL,
    home_score INTEGER CHECK (home_score >= 0),
    away_score INTEGER CHECK (away_score >= 0),
    status game_status DEFAULT 'scheduled',
    stadium_id VARCHAR(50),
    attendance INTEGER,
    duration_minutes INTEGER,
    overtime BOOLEAN DEFAULT FALSE,
    playoff_round VARCHAR(50),
    weather_id VARCHAR(50),
    broadcast_network VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    PRIMARY KEY (game_id, season),
    CONSTRAINT fk_games_home_team FOREIGN KEY (home_team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_games_away_team FOREIGN KEY (away_team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_games_stadium FOREIGN KEY (stadium_id) REFERENCES stadiums(stadium_id),
    CONSTRAINT fk_games_season FOREIGN KEY (season) REFERENCES seasons(season)
) PARTITION BY RANGE (season);

-- Create partitions by season (recent seasons get individual partitions)
CREATE TABLE games_historical PARTITION OF games
    FOR VALUES FROM (1970) TO (2020);

CREATE TABLE games_2020 PARTITION OF games
    FOR VALUES FROM (2020) TO (2021);

CREATE TABLE games_2021 PARTITION OF games
    FOR VALUES FROM (2021) TO (2022);

CREATE TABLE games_2022 PARTITION OF games
    FOR VALUES FROM (2022) TO (2023);

CREATE TABLE games_2023 PARTITION OF games
    FOR VALUES FROM (2023) TO (2024);

CREATE TABLE games_2024 PARTITION OF games
    FOR VALUES FROM (2024) TO (2025);

CREATE TABLE games_2025 PARTITION OF games
    FOR VALUES FROM (2025) TO (2026);

-- Indexes on partitioned table
CREATE INDEX idx_games_season_week ON games(season, week) WHERE deleted_at IS NULL;
CREATE INDEX idx_games_home_team ON games(home_team_id, season) WHERE deleted_at IS NULL;
CREATE INDEX idx_games_away_team ON games(away_team_id, season) WHERE deleted_at IS NULL;
CREATE INDEX idx_games_date ON games(game_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_games_status ON games(status) WHERE deleted_at IS NULL;

COMMENT ON TABLE games IS 'All NFL games (14,000+ historical, partitioned by season)';
COMMENT ON COLUMN games.game_id IS 'Unique game identifier';

-- =============================================================================
-- TABLE: team_seasons
-- =============================================================================
CREATE TABLE team_seasons (
    team_season_id SERIAL PRIMARY KEY,
    team_id VARCHAR(10) NOT NULL,
    season INTEGER NOT NULL,
    head_coach_id VARCHAR(50),
    offensive_coordinator_id VARCHAR(50),
    defensive_coordinator_id VARCHAR(50),
    wins INTEGER DEFAULT 0 CHECK (wins >= 0),
    losses INTEGER DEFAULT 0 CHECK (losses >= 0),
    ties INTEGER DEFAULT 0 CHECK (ties >= 0),
    division_rank INTEGER CHECK (division_rank >= 1 AND division_rank <= 4),
    conference_rank INTEGER CHECK (conference_rank >= 1 AND conference_rank <= 16),
    made_playoffs BOOLEAN DEFAULT FALSE,
    playoff_result VARCHAR(50),
    super_bowl_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT uq_team_season UNIQUE (team_id, season),
    CONSTRAINT fk_team_seasons_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_team_seasons_season FOREIGN KEY (season) REFERENCES seasons(season),
    CONSTRAINT fk_team_seasons_head_coach FOREIGN KEY (head_coach_id) REFERENCES coaches(coach_id)
);

CREATE INDEX idx_team_seasons_team ON team_seasons(team_id, season) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_seasons_season ON team_seasons(season) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_seasons_playoffs ON team_seasons(made_playoffs) WHERE made_playoffs = TRUE AND deleted_at IS NULL;

COMMENT ON TABLE team_seasons IS 'Team-season combinations (1,760 records for 32 teams × 55 seasons)';
