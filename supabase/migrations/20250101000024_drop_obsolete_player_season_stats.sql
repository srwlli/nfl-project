-- Drop obsolete player_season_stats table
-- This table was replaced by player_season_cumulative_stats in migration 20250101000021
-- Migration 20250101000005 noted: "REMOVED: player_season_stats (redundant)"

-- Check for any data before dropping (should be empty)
DO $$
DECLARE
    record_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO record_count FROM player_season_stats;

    IF record_count > 0 THEN
        RAISE EXCEPTION 'player_season_stats contains % records - manual review required before dropping', record_count;
    END IF;

    RAISE NOTICE 'player_season_stats is empty - safe to drop';
END $$;

-- Drop the table
DROP TABLE IF EXISTS player_season_stats CASCADE;

-- Add comment explaining the removal
COMMENT ON SCHEMA public IS 'player_season_stats removed in migration 20250101000024 - replaced by player_season_cumulative_stats';
