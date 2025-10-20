-- ================================================================
-- REMOVE SEASON FOREIGN KEY FROM BETTING TABLES
-- ================================================================
-- Purpose: Allow historical betting data without requiring season records
-- Reason: We're importing 2006-2024 betting data but only have 2025 season

-- Drop the foreign key constraint
ALTER TABLE game_betting_lines
DROP CONSTRAINT IF EXISTS fk_game_betting_lines_season;

-- Season column is still useful for queries, just not enforced
COMMENT ON COLUMN game_betting_lines.season IS 'Season year (not enforced for historical data)';
