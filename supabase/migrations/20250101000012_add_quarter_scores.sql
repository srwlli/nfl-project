-- Add quarter-by-quarter scoring columns to games table
-- Migration: 20250101000012_add_quarter_scores
-- Purpose: Store quarter scores for score breakdown display

-- Add columns to games table (applies to all partitions)
ALTER TABLE games ADD COLUMN IF NOT EXISTS home_q1_score INTEGER DEFAULT 0 CHECK (home_q1_score >= 0);
ALTER TABLE games ADD COLUMN IF NOT EXISTS home_q2_score INTEGER DEFAULT 0 CHECK (home_q2_score >= 0);
ALTER TABLE games ADD COLUMN IF NOT EXISTS home_q3_score INTEGER DEFAULT 0 CHECK (home_q3_score >= 0);
ALTER TABLE games ADD COLUMN IF NOT EXISTS home_q4_score INTEGER DEFAULT 0 CHECK (home_q4_score >= 0);
ALTER TABLE games ADD COLUMN IF NOT EXISTS home_ot_score INTEGER DEFAULT 0 CHECK (home_ot_score >= 0);

ALTER TABLE games ADD COLUMN IF NOT EXISTS away_q1_score INTEGER DEFAULT 0 CHECK (away_q1_score >= 0);
ALTER TABLE games ADD COLUMN IF NOT EXISTS away_q2_score INTEGER DEFAULT 0 CHECK (away_q2_score >= 0);
ALTER TABLE games ADD COLUMN IF NOT EXISTS away_q3_score INTEGER DEFAULT 0 CHECK (away_q3_score >= 0);
ALTER TABLE games ADD COLUMN IF NOT EXISTS away_q4_score INTEGER DEFAULT 0 CHECK (away_q4_score >= 0);
ALTER TABLE games ADD COLUMN IF NOT EXISTS away_ot_score INTEGER DEFAULT 0 CHECK (away_ot_score >= 0);

COMMENT ON COLUMN games.home_q1_score IS 'Home team score in Q1';
COMMENT ON COLUMN games.home_q2_score IS 'Home team score in Q2';
COMMENT ON COLUMN games.home_q3_score IS 'Home team score in Q3';
COMMENT ON COLUMN games.home_q4_score IS 'Home team score in Q4';
COMMENT ON COLUMN games.home_ot_score IS 'Home team score in OT';
COMMENT ON COLUMN games.away_q1_score IS 'Away team score in Q1';
COMMENT ON COLUMN games.away_q2_score IS 'Away team score in Q2';
COMMENT ON COLUMN games.away_q3_score IS 'Away team score in Q3';
COMMENT ON COLUMN games.away_q4_score IS 'Away team score in Q4';
COMMENT ON COLUMN games.away_ot_score IS 'Away team score in OT';
