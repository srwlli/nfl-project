-- Create betting and odds tables
-- Migration: 20250101000011_create_betting_tables
-- Purpose: Store betting lines, odds, and market data

-- =============================================================================
-- BETTING TABLES
-- =============================================================================

-- TABLE: game_betting_lines
CREATE TABLE game_betting_lines (
    betting_line_id SERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    bookmaker VARCHAR(100) NOT NULL,
    market_type VARCHAR(50) NOT NULL, -- 'spread', 'moneyline', 'totals'
    last_update TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_game_betting_lines_season FOREIGN KEY (season) REFERENCES seasons(season)
);

CREATE INDEX idx_game_betting_lines_game ON game_betting_lines(game_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_game_betting_lines_season ON game_betting_lines(season) WHERE deleted_at IS NULL;

COMMENT ON TABLE game_betting_lines IS 'Betting lines and odds from various bookmakers';

-- TABLE: spread_lines
CREATE TABLE spread_lines (
    spread_line_id SERIAL PRIMARY KEY,
    betting_line_id INTEGER NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    home_spread DECIMAL(5,1) NOT NULL, -- e.g., -3.5
    away_spread DECIMAL(5,1) NOT NULL, -- e.g., +3.5
    home_spread_odds INTEGER, -- e.g., -110
    away_spread_odds INTEGER, -- e.g., -110
    line_timestamp TIMESTAMP NOT NULL,
    is_opening_line BOOLEAN DEFAULT FALSE,
    is_closing_line BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_spread_lines_betting_line FOREIGN KEY (betting_line_id) REFERENCES game_betting_lines(betting_line_id) ON DELETE CASCADE
);

CREATE INDEX idx_spread_lines_game ON spread_lines(game_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE spread_lines IS 'Point spread betting lines';

-- TABLE: moneyline_odds
CREATE TABLE moneyline_odds (
    moneyline_id SERIAL PRIMARY KEY,
    betting_line_id INTEGER NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    home_moneyline INTEGER NOT NULL, -- e.g., -150
    away_moneyline INTEGER NOT NULL, -- e.g., +130
    line_timestamp TIMESTAMP NOT NULL,
    is_opening_line BOOLEAN DEFAULT FALSE,
    is_closing_line BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_moneyline_odds_betting_line FOREIGN KEY (betting_line_id) REFERENCES game_betting_lines(betting_line_id) ON DELETE CASCADE
);

CREATE INDEX idx_moneyline_odds_game ON moneyline_odds(game_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE moneyline_odds IS 'Moneyline betting odds';

-- TABLE: over_under_lines
CREATE TABLE over_under_lines (
    over_under_id SERIAL PRIMARY KEY,
    betting_line_id INTEGER NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    total_points DECIMAL(5,1) NOT NULL, -- e.g., 47.5
    over_odds INTEGER, -- e.g., -110
    under_odds INTEGER, -- e.g., -110
    line_timestamp TIMESTAMP NOT NULL,
    is_opening_line BOOLEAN DEFAULT FALSE,
    is_closing_line BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_over_under_lines_betting_line FOREIGN KEY (betting_line_id) REFERENCES game_betting_lines(betting_line_id) ON DELETE CASCADE
);

CREATE INDEX idx_over_under_lines_game ON over_under_lines(game_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE over_under_lines IS 'Over/Under (totals) betting lines';

-- TABLE: betting_results
CREATE TABLE betting_results (
    result_id SERIAL PRIMARY KEY,
    game_id VARCHAR(50) NOT NULL UNIQUE,
    season INTEGER NOT NULL,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    spread_result VARCHAR(20), -- 'home_cover', 'away_cover', 'push'
    spread_value DECIMAL(5,1), -- Closing spread
    moneyline_result VARCHAR(20), -- 'home_win', 'away_win'
    total_points INTEGER,
    over_under_result VARCHAR(20), -- 'over', 'under', 'push'
    over_under_value DECIMAL(5,1), -- Closing total
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_betting_results_season ON betting_results(season) WHERE deleted_at IS NULL;

COMMENT ON TABLE betting_results IS 'Final betting results for completed games';
