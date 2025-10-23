-- =====================================================
-- MIGRATION: Add Team Aliases System
-- =====================================================
-- Purpose: Normalize team IDs across all data sources
-- Solves: WAS/WSH duplicate, allows flexible team input
-- Author: Claude Code
-- Date: October 22, 2025
-- =====================================================

-- =====================================================
-- 1. CREATE team_aliases TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS team_aliases (
  alias_id SERIAL PRIMARY KEY,
  alias VARCHAR(50) NOT NULL UNIQUE,        -- WSH, Washington, Commanders, etc.
  canonical_team_id VARCHAR(10) NOT NULL,   -- WAS (the "official" one we use)
  source VARCHAR(50),                        -- ESPN, The Odds API, user input, etc.
  is_primary BOOLEAN DEFAULT false,          -- Only one true per team
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_team_aliases_canonical ON team_aliases(canonical_team_id);
CREATE INDEX idx_team_aliases_alias ON team_aliases(alias);

-- =====================================================
-- 3. POPULATE ALIASES FOR ALL 32 NFL TEAMS
-- =====================================================

INSERT INTO team_aliases (alias, canonical_team_id, source, is_primary) VALUES
  -- Arizona Cardinals
  ('ARI', 'ARI', 'canonical', true),
  ('Arizona', 'ARI', 'user_input', false),
  ('Cardinals', 'ARI', 'user_input', false),
  ('Arizona Cardinals', 'ARI', 'user_input', false),

  -- Atlanta Falcons
  ('ATL', 'ATL', 'canonical', true),
  ('Atlanta', 'ATL', 'user_input', false),
  ('Falcons', 'ATL', 'user_input', false),
  ('Atlanta Falcons', 'ATL', 'user_input', false),

  -- Baltimore Ravens
  ('BAL', 'BAL', 'canonical', true),
  ('Baltimore', 'BAL', 'user_input', false),
  ('Ravens', 'BAL', 'user_input', false),
  ('Baltimore Ravens', 'BAL', 'user_input', false),

  -- Buffalo Bills
  ('BUF', 'BUF', 'canonical', true),
  ('Buffalo', 'BUF', 'user_input', false),
  ('Bills', 'BUF', 'user_input', false),
  ('Buffalo Bills', 'BUF', 'user_input', false),

  -- Carolina Panthers
  ('CAR', 'CAR', 'canonical', true),
  ('Carolina', 'CAR', 'user_input', false),
  ('Panthers', 'CAR', 'user_input', false),
  ('Carolina Panthers', 'CAR', 'user_input', false),

  -- Chicago Bears
  ('CHI', 'CHI', 'canonical', true),
  ('Chicago', 'CHI', 'user_input', false),
  ('Bears', 'CHI', 'user_input', false),
  ('Chicago Bears', 'CHI', 'user_input', false),

  -- Cincinnati Bengals
  ('CIN', 'CIN', 'canonical', true),
  ('Cincinnati', 'CIN', 'user_input', false),
  ('Bengals', 'CIN', 'user_input', false),
  ('Cincinnati Bengals', 'CIN', 'user_input', false),

  -- Cleveland Browns
  ('CLE', 'CLE', 'canonical', true),
  ('Cleveland', 'CLE', 'user_input', false),
  ('Browns', 'CLE', 'user_input', false),
  ('Cleveland Browns', 'CLE', 'user_input', false),

  -- Dallas Cowboys
  ('DAL', 'DAL', 'canonical', true),
  ('Dallas', 'DAL', 'user_input', false),
  ('Cowboys', 'DAL', 'user_input', false),
  ('Dallas Cowboys', 'DAL', 'user_input', false),

  -- Denver Broncos
  ('DEN', 'DEN', 'canonical', true),
  ('Denver', 'DEN', 'user_input', false),
  ('Broncos', 'DEN', 'user_input', false),
  ('Denver Broncos', 'DEN', 'user_input', false),

  -- Detroit Lions
  ('DET', 'DET', 'canonical', true),
  ('Detroit', 'DET', 'user_input', false),
  ('Lions', 'DET', 'user_input', false),
  ('Detroit Lions', 'DET', 'user_input', false),

  -- Green Bay Packers
  ('GB', 'GB', 'canonical', true),
  ('GNB', 'GB', 'ESPN', false),
  ('Green Bay', 'GB', 'user_input', false),
  ('Packers', 'GB', 'user_input', false),
  ('Green Bay Packers', 'GB', 'user_input', false),

  -- Houston Texans
  ('HOU', 'HOU', 'canonical', true),
  ('Houston', 'HOU', 'user_input', false),
  ('Texans', 'HOU', 'user_input', false),
  ('Houston Texans', 'HOU', 'user_input', false),

  -- Indianapolis Colts
  ('IND', 'IND', 'canonical', true),
  ('Indianapolis', 'IND', 'user_input', false),
  ('Colts', 'IND', 'user_input', false),
  ('Indianapolis Colts', 'IND', 'user_input', false),

  -- Jacksonville Jaguars
  ('JAX', 'JAX', 'canonical', true),
  ('JAC', 'JAX', 'ESPN', false),
  ('Jacksonville', 'JAX', 'user_input', false),
  ('Jaguars', 'JAX', 'user_input', false),
  ('Jacksonville Jaguars', 'JAX', 'user_input', false),

  -- Kansas City Chiefs
  ('KC', 'KC', 'canonical', true),
  ('Kansas City', 'KC', 'user_input', false),
  ('Chiefs', 'KC', 'user_input', false),
  ('Kansas City Chiefs', 'KC', 'user_input', false),

  -- Los Angeles Chargers
  ('LAC', 'LAC', 'canonical', true),
  ('LA Chargers', 'LAC', 'user_input', false),
  ('Chargers', 'LAC', 'user_input', false),
  ('Los Angeles Chargers', 'LAC', 'user_input', false),

  -- Los Angeles Rams
  ('LAR', 'LAR', 'canonical', true),
  ('LA Rams', 'LAR', 'user_input', false),
  ('Rams', 'LAR', 'user_input', false),
  ('Los Angeles Rams', 'LAR', 'user_input', false),

  -- Las Vegas Raiders
  ('LV', 'LV', 'canonical', true),
  ('Las Vegas', 'LV', 'user_input', false),
  ('Raiders', 'LV', 'user_input', false),
  ('Las Vegas Raiders', 'LV', 'user_input', false),

  -- Miami Dolphins
  ('MIA', 'MIA', 'canonical', true),
  ('Miami', 'MIA', 'user_input', false),
  ('Dolphins', 'MIA', 'user_input', false),
  ('Miami Dolphins', 'MIA', 'user_input', false),

  -- Minnesota Vikings
  ('MIN', 'MIN', 'canonical', true),
  ('Minnesota', 'MIN', 'user_input', false),
  ('Vikings', 'MIN', 'user_input', false),
  ('Minnesota Vikings', 'MIN', 'user_input', false),

  -- New England Patriots
  ('NE', 'NE', 'canonical', true),
  ('New England', 'NE', 'user_input', false),
  ('Patriots', 'NE', 'user_input', false),
  ('New England Patriots', 'NE', 'user_input', false),

  -- New Orleans Saints
  ('NO', 'NO', 'canonical', true),
  ('New Orleans', 'NO', 'user_input', false),
  ('Saints', 'NO', 'user_input', false),
  ('New Orleans Saints', 'NO', 'user_input', false),

  -- New York Giants
  ('NYG', 'NYG', 'canonical', true),
  ('NY Giants', 'NYG', 'user_input', false),
  ('Giants', 'NYG', 'user_input', false),
  ('New York Giants', 'NYG', 'user_input', false),

  -- New York Jets
  ('NYJ', 'NYJ', 'canonical', true),
  ('NY Jets', 'NYJ', 'user_input', false),
  ('Jets', 'NYJ', 'user_input', false),
  ('New York Jets', 'NYJ', 'user_input', false),

  -- Philadelphia Eagles
  ('PHI', 'PHI', 'canonical', true),
  ('Philadelphia', 'PHI', 'user_input', false),
  ('Eagles', 'PHI', 'user_input', false),
  ('Philadelphia Eagles', 'PHI', 'user_input', false),

  -- Pittsburgh Steelers
  ('PIT', 'PIT', 'canonical', true),
  ('Pittsburgh', 'PIT', 'user_input', false),
  ('Steelers', 'PIT', 'user_input', false),
  ('Pittsburgh Steelers', 'PIT', 'user_input', false),

  -- San Francisco 49ers
  ('SF', 'SF', 'canonical', true),
  ('San Francisco', 'SF', 'user_input', false),
  ('49ers', 'SF', 'user_input', false),
  ('San Francisco 49ers', 'SF', 'user_input', false),

  -- Seattle Seahawks
  ('SEA', 'SEA', 'canonical', true),
  ('Seattle', 'SEA', 'user_input', false),
  ('Seahawks', 'SEA', 'user_input', false),
  ('Seattle Seahawks', 'SEA', 'user_input', false),

  -- Tampa Bay Buccaneers
  ('TB', 'TB', 'canonical', true),
  ('Tampa Bay', 'TB', 'user_input', false),
  ('Buccaneers', 'TB', 'user_input', false),
  ('Bucs', 'TB', 'user_input', false),
  ('Tampa Bay Buccaneers', 'TB', 'user_input', false),

  -- Tennessee Titans
  ('TEN', 'TEN', 'canonical', true),
  ('Tennessee', 'TEN', 'user_input', false),
  ('Titans', 'TEN', 'user_input', false),
  ('Tennessee Titans', 'TEN', 'user_input', false),

  -- Washington Commanders ⭐ (Primary canonical: WAS, WSH is alias)
  ('WAS', 'WAS', 'canonical', true),
  ('WSH', 'WAS', 'ESPN', false),
  ('Washington', 'WAS', 'user_input', false),
  ('Commanders', 'WAS', 'user_input', false),
  ('Washington Commanders', 'WAS', 'user_input', false)
ON CONFLICT (alias) DO NOTHING;

-- =====================================================
-- 4. CREATE teams_canonical VIEW
-- =====================================================

CREATE OR REPLACE VIEW teams_canonical AS
SELECT DISTINCT ON (ta.canonical_team_id)
  ta.canonical_team_id as team_id,
  t.team_name,
  ta.canonical_team_id as team_abbr,
  t.city,
  t.conference,
  t.division,
  t.primary_color,
  t.secondary_color,
  t.logo_url
FROM team_aliases ta
JOIN teams t ON t.team_id = ta.alias
WHERE ta.is_primary = true
ORDER BY ta.canonical_team_id;

-- =====================================================
-- 5. COMMENTS
-- =====================================================

COMMENT ON TABLE team_aliases IS 'Maps all team name/abbreviation variants to canonical IDs';
COMMENT ON COLUMN team_aliases.alias IS 'Any team identifier (WSH, Washington, Commanders, etc.)';
COMMENT ON COLUMN team_aliases.canonical_team_id IS 'The official team ID we use (WAS for Washington)';
COMMENT ON COLUMN team_aliases.source IS 'Where this alias comes from (ESPN, user input, etc.)';
COMMENT ON COLUMN team_aliases.is_primary IS 'Only one true per team - the canonical record';

COMMENT ON VIEW teams_canonical IS 'View returning only canonical team data (no duplicates)';
