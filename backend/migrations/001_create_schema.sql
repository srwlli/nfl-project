-- NFL Scraper Database Schema
-- Run this in Supabase SQL Editor to create tables

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  team_id SERIAL PRIMARY KEY,
  team TEXT UNIQUE NOT NULL,
  team_name TEXT NOT NULL,
  location TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  game_id TEXT PRIMARY KEY,
  season INT NOT NULL,
  week INT NOT NULL,
  gameday DATE NOT NULL,
  gametime TIME,
  home_team TEXT NOT NULL REFERENCES teams(team),
  away_team TEXT NOT NULL REFERENCES teams(team),
  stadium TEXT,
  roof TEXT,
  temp DECIMAL,
  wind DECIMAL,
  spread_line DECIMAL,
  total_line DECIMAL,
  home_moneyline INT,
  away_moneyline INT,
  home_score INT,
  away_score INT,
  result TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Season Stats table (weekly aggregates)
CREATE TABLE IF NOT EXISTS season_stats (
  stat_id SERIAL PRIMARY KEY,
  team TEXT NOT NULL REFERENCES teams(team),
  season INT NOT NULL,
  week INT,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  pass_yards_per_game DECIMAL,
  rush_yards_per_game DECIMAL,
  total_yards_per_game DECIMAL,
  epa_per_play_off DECIMAL,
  epa_per_play_def DECIMAL,
  success_rate_off DECIMAL,
  success_rate_def DECIMAL,
  ats_record TEXT,
  ats_win_pct DECIMAL,
  over_pct DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team, season, week)
);

-- Power Ratings table
CREATE TABLE IF NOT EXISTS power_ratings (
  rating_id SERIAL PRIMARY KEY,
  team TEXT NOT NULL REFERENCES teams(team),
  season INT NOT NULL,
  elo_rating DECIMAL NOT NULL,
  elo_rank INT,
  offensive_rating DECIMAL,
  defensive_rating DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team, season)
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  player_id TEXT PRIMARY KEY,
  player_name TEXT NOT NULL,
  position TEXT,
  team TEXT REFERENCES teams(team),
  nfl_id INT,
  gsis_id TEXT,
  espn_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Player Stats table
CREATE TABLE IF NOT EXISTS player_stats (
  stat_id SERIAL PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(player_id),
  season INT NOT NULL,
  week INT,
  passing_yards INT DEFAULT 0,
  passing_tds INT DEFAULT 0,
  rushing_yards INT DEFAULT 0,
  rushing_tds INT DEFAULT 0,
  receptions INT DEFAULT 0,
  receiving_yards INT DEFAULT 0,
  receiving_tds INT DEFAULT 0,
  targets INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(player_id, season, week)
);

-- Injuries table
CREATE TABLE IF NOT EXISTS injuries (
  injury_id SERIAL PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(player_id),
  team TEXT NOT NULL REFERENCES teams(team),
  season INT NOT NULL,
  week INT,
  report_status TEXT,
  primary_injury TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Depth Charts table
CREATE TABLE IF NOT EXISTS depth_charts (
  depth_id SERIAL PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(player_id),
  team TEXT NOT NULL REFERENCES teams(team),
  season INT NOT NULL,
  week INT,
  position TEXT,
  depth_rank INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Play-by-Play table
CREATE TABLE IF NOT EXISTS play_by_play (
  pbp_id SERIAL PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES schedules(game_id),
  season INT NOT NULL,
  week INT,
  play_index INT,
  quarter INT,
  clock TEXT,
  posteam TEXT REFERENCES teams(team),
  defteam TEXT REFERENCES teams(team),
  play_type TEXT,
  yards_gained INT,
  epa DECIMAL,
  success INT,
  pass INT,
  rush INT,
  play_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedules_season_week ON schedules(season, week);
CREATE INDEX IF NOT EXISTS idx_schedules_team ON schedules(home_team, away_team);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(gameday);
CREATE INDEX IF NOT EXISTS idx_season_stats_team ON season_stats(team, season);
CREATE INDEX IF NOT EXISTS idx_pbp_game ON play_by_play(game_id);
CREATE INDEX IF NOT EXISTS idx_pbp_team ON play_by_play(posteam, defteam);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team);
CREATE INDEX IF NOT EXISTS idx_depth_team ON depth_charts(team, season);

-- Grant permissions (if using service role)
-- GRANT ALL ON public.teams TO postgres, authenticated, anon;
-- GRANT ALL ON public.schedules TO postgres, authenticated, anon;
-- GRANT ALL ON public.season_stats TO postgres, authenticated, anon;
-- GRANT ALL ON public.power_ratings TO postgres, authenticated, anon;
-- GRANT ALL ON public.players TO postgres, authenticated, anon;
-- GRANT ALL ON public.player_stats TO postgres, authenticated, anon;
-- GRANT ALL ON public.injuries TO postgres, authenticated, anon;
-- GRANT ALL ON public.depth_charts TO postgres, authenticated, anon;
-- GRANT ALL ON public.play_by_play TO postgres, authenticated, anon;
