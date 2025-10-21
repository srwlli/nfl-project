# Apply Phase 1 Migrations - Instructions

**Status**: Phase 1 code is complete but migrations NOT YET applied to database
**Required**: Apply 2 migration files to Supabase database

---

## Quick Start (5 minutes)

### Option 1: Supabase Dashboard (RECOMMENDED)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New query**
5. Copy/paste **Migration 1** (below) and click **RUN**
6. Click **New query** again
7. Copy/paste **Migration 2** (below) and click **RUN**
8. Verify: Run `npm run check:migrations`

### Option 2: Supabase CLI

```bash
# Link project first
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
cd supabase
supabase db push

# Verify
npm run check:migrations
```

---

## Migration 1: Enhance player_game_stats

**File**: `supabase/migrations/20250101000020_enhance_player_game_stats.sql`

**Adds**: 44 new columns to `player_game_stats` table
- 25 ESPN advanced fields (sacks, rating, QBR, targets, etc.)
- 5 fantasy point fields (Standard, PPR, Half-PPR, DK, FD)
- 6 nflverse EPA fields (EPA, success rate, CPOE)
- 8 opportunity metrics (snaps, routes, red zone touches)

**SQL to run**:

```sql
-- Enhancement: Add ESPN Advanced Fields + Fantasy Points + nflverse EPA
-- Migration: 20250101000020_enhance_player_game_stats
-- Phase 1: Foundation Enhancement
-- Adds 44 new columns to player_game_stats table

-- =============================================================================
-- ESPN ADVANCED FIELDS (25 columns)
-- =============================================================================

-- Passing Advanced (5 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS passing_sacks INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS passing_sack_yards_lost INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS passing_longest INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS passer_rating DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS qbr DECIMAL(5,2);

COMMENT ON COLUMN player_game_stats.passing_sacks IS 'Number of times sacked (QB stat)';
COMMENT ON COLUMN player_game_stats.passing_sack_yards_lost IS 'Yards lost from sacks';
COMMENT ON COLUMN player_game_stats.passing_longest IS 'Longest completion in yards';
COMMENT ON COLUMN player_game_stats.passer_rating IS 'NFL passer rating (0-158.3)';
COMMENT ON COLUMN player_game_stats.qbr IS 'ESPN Total QBR (0-100)';

-- Rushing Advanced (4 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS rushing_longest INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS rushing_fumbles INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS rushing_fumbles_lost INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS rushing_yards_after_contact INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.rushing_longest IS 'Longest rush in yards';
COMMENT ON COLUMN player_game_stats.rushing_fumbles IS 'Total fumbles on rushing plays';
COMMENT ON COLUMN player_game_stats.rushing_fumbles_lost IS 'Fumbles lost on rushing plays';

-- Receiving Advanced (5 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS receiving_targets INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS receiving_longest INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS receiving_yards_after_catch INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS receiving_first_downs INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS receiving_fumbles INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.receiving_targets IS 'Number of times targeted';
COMMENT ON COLUMN player_game_stats.receiving_longest IS 'Longest reception in yards';
COMMENT ON COLUMN player_game_stats.receiving_yards_after_catch IS 'YAC - Yards after catch';
COMMENT ON COLUMN player_game_stats.receiving_first_downs IS 'First downs via receptions';

-- Defense Advanced (7 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS tackles_solo INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS tackles_assists INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS tackles_for_loss DECIMAL(5,1) DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS qb_hits INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS passes_defended INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS forced_fumbles INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fumble_recoveries INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.tackles_solo IS 'Solo tackles';
COMMENT ON COLUMN player_game_stats.tackles_assists IS 'Assisted tackles';
COMMENT ON COLUMN player_game_stats.tackles_for_loss IS 'Tackles for loss (TFL)';
COMMENT ON COLUMN player_game_stats.qb_hits IS 'QB hits (pressures)';
COMMENT ON COLUMN player_game_stats.passes_defended IS 'Passes defensed (PD)';
COMMENT ON COLUMN player_game_stats.forced_fumbles IS 'Forced fumbles';
COMMENT ON COLUMN player_game_stats.fumble_recoveries IS 'Fumble recoveries';

-- Kicking Advanced (3 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS field_goal_longest INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS extra_points_made INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS extra_points_attempted INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.field_goal_longest IS 'Longest field goal made';
COMMENT ON COLUMN player_game_stats.extra_points_made IS 'Extra points made';
COMMENT ON COLUMN player_game_stats.extra_points_attempted IS 'Extra points attempted';

-- Punting (6 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punts INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punt_yards INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punt_average DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punts_inside_20 INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punt_longest INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS punt_touchbacks INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.punts IS 'Number of punts';
COMMENT ON COLUMN player_game_stats.punt_yards IS 'Total punt yards';
COMMENT ON COLUMN player_game_stats.punt_average IS 'Average yards per punt';
COMMENT ON COLUMN player_game_stats.punts_inside_20 IS 'Punts downed inside 20';
COMMENT ON COLUMN player_game_stats.punt_longest IS 'Longest punt';

-- =============================================================================
-- FANTASY POINTS (5 calculated fields)
-- =============================================================================

ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fantasy_points_standard DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fantasy_points_ppr DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fantasy_points_half_ppr DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fantasy_points_dfs_dk DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS fantasy_points_dfs_fd DECIMAL(5,2);

COMMENT ON COLUMN player_game_stats.fantasy_points_standard IS 'Standard fantasy scoring (no PPR)';
COMMENT ON COLUMN player_game_stats.fantasy_points_ppr IS 'PPR fantasy scoring (1 pt per reception)';
COMMENT ON COLUMN player_game_stats.fantasy_points_half_ppr IS 'Half-PPR fantasy scoring (0.5 pt per reception)';
COMMENT ON COLUMN player_game_stats.fantasy_points_dfs_dk IS 'DraftKings DFS scoring';
COMMENT ON COLUMN player_game_stats.fantasy_points_dfs_fd IS 'FanDuel DFS scoring';

-- =============================================================================
-- NFLVERSE ADVANCED ANALYTICS (6 fields)
-- =============================================================================

ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS epa_total DECIMAL(6,3);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS epa_pass DECIMAL(6,3);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS epa_rush DECIMAL(6,3);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS epa_receive DECIMAL(6,3);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS cpoe DECIMAL(5,2);

COMMENT ON COLUMN player_game_stats.epa_total IS 'Total Expected Points Added';
COMMENT ON COLUMN player_game_stats.epa_pass IS 'Passing EPA';
COMMENT ON COLUMN player_game_stats.epa_rush IS 'Rushing EPA';
COMMENT ON COLUMN player_game_stats.epa_receive IS 'Receiving EPA';
COMMENT ON COLUMN player_game_stats.success_rate IS 'Play success rate percentage';
COMMENT ON COLUMN player_game_stats.cpoe IS 'Completion Percentage Over Expected (QB only)';

-- =============================================================================
-- OPPORTUNITY METRICS (8 fields) - from snap data sources
-- =============================================================================

ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS snaps_played INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS snaps_total INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS snap_percentage DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS routes_run INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS route_participation_pct DECIMAL(5,2);
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS red_zone_touches INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS red_zone_targets INTEGER DEFAULT 0;
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS end_zone_targets INTEGER DEFAULT 0;

COMMENT ON COLUMN player_game_stats.snaps_played IS 'Offensive snaps played';
COMMENT ON COLUMN player_game_stats.snaps_total IS 'Total offensive snaps for team';
COMMENT ON COLUMN player_game_stats.snap_percentage IS 'Percentage of offensive snaps played';
COMMENT ON COLUMN player_game_stats.routes_run IS 'Routes run (WR/TE)';
COMMENT ON COLUMN player_game_stats.route_participation_pct IS 'Percentage of pass plays where player ran route';
COMMENT ON COLUMN player_game_stats.red_zone_touches IS 'Touches inside red zone (rushing attempts + targets)';
COMMENT ON COLUMN player_game_stats.red_zone_targets IS 'Targets inside red zone';
COMMENT ON COLUMN player_game_stats.end_zone_targets IS 'Targets inside end zone';

-- =============================================================================
-- INDEXES (for new columns with high query frequency)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_player_game_stats_fantasy_ppr
  ON player_game_stats(fantasy_points_ppr DESC)
  WHERE deleted_at IS NULL AND fantasy_points_ppr IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_player_game_stats_targets
  ON player_game_stats(receiving_targets DESC)
  WHERE deleted_at IS NULL AND receiving_targets > 0;

CREATE INDEX IF NOT EXISTS idx_player_game_stats_epa
  ON player_game_stats(epa_total DESC)
  WHERE deleted_at IS NULL AND epa_total IS NOT NULL;

-- =============================================================================
-- SUMMARY
-- =============================================================================

COMMENT ON TABLE player_game_stats IS 'Player stats by game - ENHANCED with 44 new columns (ESPN advanced, Fantasy, EPA, Opportunity metrics)';
```

---

## Migration 2: Weekly Aggregation Tables

**File**: `supabase/migrations/20250101000021_create_weekly_aggregation_tables.sql`

**Creates**:
- `weekly_stat_leaders` table (12 categories × 10 leaders per week)
- `player_season_cumulative_stats` table (running season totals + pace projections)
- `player_trending_analytics` table (hot/cold streaks, breakout alerts)
- 3 convenience views

This migration file is **780 lines**. The full SQL is at:
`supabase/migrations/20250101000021_create_weekly_aggregation_tables.sql`

**To apply**: Copy the entire file contents and paste into Supabase SQL Editor

---

## Verify Migrations Applied

```bash
npm run check:migrations
```

**Expected output**:
```
✅ Migration 20250101000020 applied (player_game_stats enhanced)
✅ Migration 20250101000021 applied (weekly aggregation tables exist)

=== SUMMARY ===
✅ All Phase 1 migrations applied - Ready for testing!

Next step: npm run scrape:game-stats -- --game=401772510
```

---

## Next Steps After Migrations

1. **Test enhanced scraper** on single game:
   ```bash
   npm run scrape:game-stats -- --game=401772510
   ```

2. **Backfill 76 missing games** (Weeks 2-7):
   ```bash
   npm run scrape:game-stats -- --week=2
   npm run scrape:game-stats -- --week=3
   # ... through week 7
   ```

3. **Run weekly aggregation**:
   ```bash
   npm run aggregate:weekly -- --week=7
   ```

4. **Validate data completeness**:
   ```sql
   -- Check player stats have new fields
   SELECT COUNT(*) FROM player_game_stats WHERE fantasy_points_ppr IS NOT NULL;

   -- Check weekly leaders populated
   SELECT COUNT(*) FROM weekly_stat_leaders WHERE season=2025 AND week=7;

   -- Check season cumulative populated
   SELECT COUNT(*) FROM player_season_cumulative_stats WHERE season=2025;
   ```

---

## Troubleshooting

### Error: "column already exists"
This is fine - columns are added with `IF NOT EXISTS`. Just continue to next migration.

### Error: "permission denied"
Make sure you're using the correct Supabase project and have admin/owner access.

### Error: "table does not exist"
Check that base migrations (20250101000001-000010) were applied first. These create the `player_game_stats` table.

---

## Files Modified

- ✅ `supabase/migrations/20250101000020_enhance_player_game_stats.sql` (created)
- ✅ `supabase/migrations/20250101000021_create_weekly_aggregation_tables.sql` (created)
- ✅ `scripts/utils/fantasy-calculator.js` (created)
- ✅ `scripts/scrapers/game-stats-scraper.js` (enhanced)
- ✅ `scripts/aggregators/weekly-aggregation.js` (created)
- ✅ `PHASE-1-COMPLETE.md` (documentation)
- ✅ `package.json` (added aggregate:weekly script)

---

**Status**: Ready to apply migrations → test → backfill → production!
