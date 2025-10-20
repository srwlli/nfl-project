-- ================================================================
-- GREATEST GAMES VALIDATION TABLE
-- ================================================================
-- Purpose: Store NFL's official 100 greatest games for algorithm validation
-- Source: https://www.nfl.com/100/originals/100-greatest/
-- Used by: nfl-top-100-games-scraper.js, validate-greatest-games-algo.js

CREATE TABLE IF NOT EXISTS greatest_games_official_ranking (
  rank INTEGER PRIMARY KEY CHECK (rank >= 1 AND rank <= 100),
  game_title TEXT NOT NULL,
  game_date DATE NOT NULL,
  home_team_id TEXT,
  away_team_id TEXT,
  home_score INTEGER,
  away_score INTEGER,
  summary TEXT,
  significance_notes TEXT,
  url TEXT,
  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_greatest_games_date ON greatest_games_official_ranking(game_date);
CREATE INDEX IF NOT EXISTS idx_greatest_games_teams ON greatest_games_official_ranking(home_team_id, away_team_id);

-- Comments
COMMENT ON TABLE greatest_games_official_ranking IS 'NFL official 100 greatest games for algorithm validation';
COMMENT ON COLUMN greatest_games_official_ranking.rank IS 'Official NFL ranking (1-100)';
COMMENT ON COLUMN greatest_games_official_ranking.game_title IS 'Game nickname (e.g., "The Catch", "Ice Bowl")';
COMMENT ON COLUMN greatest_games_official_ranking.significance_notes IS 'Historical significance and context';

-- Example data
-- INSERT INTO greatest_games_official_ranking (rank, game_title, game_date, home_team_id, away_team_id, home_score, away_score, summary, significance_notes, url)
-- VALUES
--   (1, 'The Greatest Game Ever Played', '1958-12-28', 'NYG', 'BAL', 17, 23, 'NFL Championship - First OT game', 'Game that made NFL a major sport', 'https://www.nfl.com/100/originals/100-greatest/games-1'),
--   (2, 'The Catch', '1982-01-10', 'SF', 'DAL', 28, 27, 'NFC Championship', 'Montana to Clark, launched 49ers dynasty', 'https://www.nfl.com/100/originals/100-greatest/games-2');
