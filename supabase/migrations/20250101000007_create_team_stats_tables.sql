-- Create team statistics tables
-- Migration: 20250101000007_create_team_stats_tables
-- Domain 3: Team Stats (2 tables - removed 3 redundant stat tables)

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

-- REMOVED: team_offense_stats (redundant - data in team_game_stats.total_yards)
-- REMOVED: team_defense_stats (redundant - data in team_game_stats.total_yards_allowed, turnovers_forced)
-- REMOVED: team_special_teams_stats (redundant - data in team_game_stats)
