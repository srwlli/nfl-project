# Drop Obsolete player_season_stats Table

## Background
The `player_season_stats` table was marked as **REMOVED** in migration `20250101000005` with the comment:
> "REMOVED: player_season_stats (redundant - we use player_season_cumulative_stats in migration 21 instead)"

However, the table was never actually dropped from the database. It currently exists but is empty (0 records).

## Verification
✅ Confirmed the table exists: `scripts/check-table-exists.js`
✅ Confirmed it's empty: 0 records
✅ Confirmed replacement exists: `player_season_cumulative_stats` with 1,516 records

## How to Drop the Table

### Option 1: Supabase SQL Editor (Recommended)
1. Go to: https://supabase.com/dashboard/project/fuzouuxhxluqjmiyabal/sql/new
2. Paste this SQL:

```sql
-- Drop obsolete player_season_stats table
-- This table was replaced by player_season_cumulative_stats in migration 20250101000021

DROP TABLE IF EXISTS player_season_stats CASCADE;
```

3. Click "Run"

### Option 2: Node.js Script
We don't have direct SQL execution via Supabase client, so manual SQL Editor is the best approach.

## Post-Drop Verification
After dropping, run:
```bash
node scripts/check-table-exists.js
```

You should see:
```
❌ player_season_stats table does NOT exist
✅ This is correct - it was replaced by player_season_cumulative_stats
```

## Files Created for This Cleanup
- `scripts/check-table-exists.js` - Verify table exists
- `scripts/drop-obsolete-table.js` - Attempt to drop via script
- `supabase/migrations/20250101000024_drop_obsolete_player_season_stats.sql` - Migration file (for reference)
- `DROP-OBSOLETE-TABLE.md` - This documentation
