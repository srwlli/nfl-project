-- Create team statistics tables
-- Migration: 20250101000007_create_team_stats_tables
-- Domain 3: Team Stats (5 tables)

-- =============================================================================
-- TABLE: team_season_stats
-- =============================================================================
CREATE TABLE team_season_stats (
    team_season_stat_id SERIAL PRIMARY KEY,
    team_id VARCHAR(10) NOT NULL,
    season INTEGER NOT NULL,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0 CHECK (wins >= 0),
    losses INTEGER DEFAULT 0 CHECK (losses >= 0),
    ties INTEGER DEFAULT 0 CHECK (ties >= 0),
    win_percentage DECIMAL(5,4),
    points_for INTEGER DEFAULT 0,
    points_against INTEGER DEFAULT 0,
    point_differential INTEGER DEFAULT 0,
    division_rank INTEGER CHECK (division_rank >= 1 AND division_rank <= 4),
    conference_rank INTEGER CHECK (conference_rank >= 1 AND conference_rank <= 16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT uq_team_season_stats UNIQUE (team_id, season),
    CONSTRAINT fk_team_season_stats_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_team_season_stats_season FOREIGN KEY (season) REFERENCES seasons(season),
    CONSTRAINT chk_wins_losses CHECK (wins + losses + ties = games_played)
);

CREATE INDEX idx_team_season_stats_team ON team_season_stats(team_id, season) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_season_stats_season ON team_season_stats(season) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_season_stats_wins ON team_season_stats(wins DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE team_season_stats IS 'Team season-level stats (1,760 records: 32 teams × 55 seasons)';

-- =============================================================================
-- TABLE: team_game_stats
-- =============================================================================
CREATE TABLE team_game_stats (
    team_game_stat_id SERIAL PRIMARY KEY,
    team_id VARCHAR(10) NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    is_home BOOLEAN DEFAULT FALSE,
    points_scored INTEGER DEFAULT 0,
    points_allowed INTEGER DEFAULT 0,
    total_yards DECIMAL(6,1) DEFAULT 0,
    total_yards_allowed DECIMAL(6,1) DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    turnovers_forced INTEGER DEFAULT 0,
    time_of_possession_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT uq_team_game_stats UNIQUE (team_id, game_id),
    CONSTRAINT fk_team_game_stats_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_team_game_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_team_game_stats_team ON team_game_stats(team_id, season) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_game_stats_game ON team_game_stats(game_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE team_game_stats IS 'Team game-level stats (28,000+ records)';

-- =============================================================================
-- TABLE: team_offense_stats
-- =============================================================================
CREATE TABLE team_offense_stats (
    team_offense_id SERIAL PRIMARY KEY,
    team_id VARCHAR(10) NOT NULL,
    season INTEGER NOT NULL,
    total_yards DECIMAL(7,1) DEFAULT 0,
    yards_per_game DECIMAL(6,2),
    passing_yards DECIMAL(7,1) DEFAULT 0,
    passing_yards_per_game DECIMAL(6,2),
    rushing_yards DECIMAL(7,1) DEFAULT 0,
    rushing_yards_per_game DECIMAL(6,2),
    points_per_game DECIMAL(5,2),
    third_down_conversions INTEGER DEFAULT 0,
    third_down_attempts INTEGER DEFAULT 0,
    third_down_percentage DECIMAL(5,2),
    red_zone_attempts INTEGER DEFAULT 0,
    red_zone_touchdowns INTEGER DEFAULT 0,
    red_zone_percentage DECIMAL(5,2),
    turnovers INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT uq_team_offense_stats UNIQUE (team_id, season),
    CONSTRAINT fk_team_offense_stats_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_team_offense_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_team_offense_stats_team ON team_offense_stats(team_id, season) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_offense_stats_total_yards ON team_offense_stats(total_yards DESC) WHERE deleted_at IS NULL;

COMMENT ON TABLE team_offense_stats IS 'Team offensive stats by season (1,760 records)';

-- =============================================================================
-- TABLE: team_defense_stats
-- =============================================================================
CREATE TABLE team_defense_stats (
    team_defense_id SERIAL PRIMARY KEY,
    team_id VARCHAR(10) NOT NULL,
    season INTEGER NOT NULL,
    total_yards_allowed DECIMAL(7,1) DEFAULT 0,
    yards_allowed_per_game DECIMAL(6,2),
    passing_yards_allowed DECIMAL(7,1) DEFAULT 0,
    rushing_yards_allowed DECIMAL(7,1) DEFAULT 0,
    points_allowed_per_game DECIMAL(5,2),
    sacks DECIMAL(6,1) DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    fumbles_recovered INTEGER DEFAULT 0,
    safeties INTEGER DEFAULT 0,
    touchdowns INTEGER DEFAULT 0,
    third_down_conversions_allowed INTEGER DEFAULT 0,
    third_down_attempts_allowed INTEGER DEFAULT 0,
    third_down_percentage DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT uq_team_defense_stats UNIQUE (team_id, season),
    CONSTRAINT fk_team_defense_stats_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_team_defense_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_team_defense_stats_team ON team_defense_stats(team_id, season) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_defense_stats_yards_allowed ON team_defense_stats(total_yards_allowed ASC) WHERE deleted_at IS NULL;

COMMENT ON TABLE team_defense_stats IS 'Team defensive stats by season (1,760 records)';

-- =============================================================================
-- TABLE: team_special_teams_stats
-- =============================================================================
CREATE TABLE team_special_teams_stats (
    team_special_teams_id SERIAL PRIMARY KEY,
    team_id VARCHAR(10) NOT NULL,
    season INTEGER NOT NULL,
    field_goals_made INTEGER DEFAULT 0,
    field_goals_attempted INTEGER DEFAULT 0,
    field_goal_percentage DECIMAL(5,2),
    extra_points_made INTEGER DEFAULT 0,
    extra_points_attempted INTEGER DEFAULT 0,
    punt_average DECIMAL(5,2),
    punt_net_average DECIMAL(5,2),
    kick_return_average DECIMAL(5,2),
    punt_return_average DECIMAL(5,2),
    kick_return_touchdowns INTEGER DEFAULT 0,
    punt_return_touchdowns INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT uq_team_special_teams_stats UNIQUE (team_id, season),
    CONSTRAINT fk_team_special_teams_stats_team FOREIGN KEY (team_id) REFERENCES teams(team_id),
    CONSTRAINT fk_team_special_teams_stats_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_team_special_teams_stats_team ON team_special_teams_stats(team_id, season) WHERE deleted_at IS NULL;

COMMENT ON TABLE team_special_teams_stats IS 'Team special teams stats by season (1,760 records)';
