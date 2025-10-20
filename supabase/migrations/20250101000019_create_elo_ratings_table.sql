-- ================================================================
-- TEAM ELO RATINGS TABLE
-- ================================================================
-- Purpose: Store historical team Elo ratings from FiveThirtyEight
-- Source: https://projects.fivethirtyeight.com/nfl-api/nfl_elo.csv
-- Coverage: 1920-present (complete NFL history)
-- Used by: elo-ratings-scraper.js, greatest-games-algo validation

CREATE TABLE IF NOT EXISTS team_elo_ratings (
  elo_rating_id SERIAL PRIMARY KEY,
  team_id VARCHAR(10) NOT NULL,
  season INTEGER NOT NULL,
  game_date DATE NOT NULL,
  elo_pre_game DECIMAL(10,2) NOT NULL,
  elo_post_game DECIMAL(10,2) NOT NULL,
  elo_probability DECIMAL(5,4), -- Win probability (0.0000 to 1.0000)
  qb_adjustment DECIMAL(6,2) DEFAULT 0, -- QB value adjustment
  is_playoff BOOLEAN DEFAULT FALSE,
  opponent_team_id VARCHAR(10),
  is_home_game BOOLEAN DEFAULT TRUE,
  data_source VARCHAR(50) DEFAULT 'FiveThirtyEight',
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_elo_ratings_team ON team_elo_ratings(team_id);
CREATE INDEX IF NOT EXISTS idx_elo_ratings_season ON team_elo_ratings(season);
CREATE INDEX IF NOT EXISTS idx_elo_ratings_date ON team_elo_ratings(game_date);
CREATE INDEX IF NOT EXISTS idx_elo_ratings_team_season ON team_elo_ratings(team_id, season);
CREATE INDEX IF NOT EXISTS idx_elo_ratings_team_date ON team_elo_ratings(team_id, game_date);

-- Comments
COMMENT ON TABLE team_elo_ratings IS 'Historical team Elo ratings from FiveThirtyEight (1920-present)';
COMMENT ON COLUMN team_elo_ratings.elo_pre_game IS 'Elo rating before the game';
COMMENT ON COLUMN team_elo_ratings.elo_post_game IS 'Elo rating after the game';
COMMENT ON COLUMN team_elo_ratings.elo_probability IS 'Elo-based win probability (0-1)';
COMMENT ON COLUMN team_elo_ratings.qb_adjustment IS 'Quarterback value adjustment to Elo';
COMMENT ON COLUMN team_elo_ratings.is_playoff IS 'TRUE if playoff game';
