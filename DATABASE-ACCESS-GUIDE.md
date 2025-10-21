# Database Access Guide for Agents

**Purpose**: Step-by-step instructions for connecting to and working with the Supabase database
**Last Updated**: 2025-10-20
**Status**: ✅ Production Tested

---

## 📍 WHERE TO FIND CRITICAL FILES

**If you need database credentials:**
- **File**: `C:\Users\willh\Desktop\projects - current-location\next-scraper\.env.local`
- **What**: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- **Note**: This file is gitignored - if missing, check with user

**If you need the Supabase project reference:**
- **File**: `C:\Users\willh\Desktop\projects - current-location\next-scraper\supabase\.temp\project-ref`
- **Contents**: `fuzouuxhxluqjmiyabal` (project ID)
- **Why**: Required for `supabase link` command

**If you need database schema information:**
- **Directory**: `C:\Users\willh\Desktop\projects - current-location\next-scraper\supabase\migrations\`
- **Key Files**:
  - `20250101000020_enhance_player_game_stats.sql` (44 columns added)
  - `20250101000021_create_weekly_aggregation_tables.sql` (3 tables + 3 views)
- **Why**: Shows exact table structures, column names, constraints

**If you need to verify migrations are applied:**
- **Script**: `C:\Users\willh\Desktop\projects - current-location\next-scraper\scripts\check-migrations-applied.js`
- **Run**: `node scripts/check-migrations-applied.js`
- **Output**: Shows which Phase 1 migrations are live

**If you need to validate data completeness:**
- **Script**: `C:\Users\willh\Desktop\projects - current-location\next-scraper\scripts\validate-data-completeness.js`
- **Run**: `node scripts/validate-data-completeness.js`
- **Output**: Shows 100% game coverage status, record counts

**If you need to verify new fields are populated:**
- **Script**: `C:\Users\willh\Desktop\projects - current-location\next-scraper\scripts\verify-phase1-fields.js`
- **Run**: `node scripts/verify-phase1-fields.js`
- **Output**: Shows fantasy points, advanced stats populated correctly

**If you need session history:**
- **File**: `C:\Users\willh\Desktop\projects - current-location\next-scraper\communication.json`
- **What**: Complete log of all agent sessions with changes made
- **Last Session**: Session 4 (Phase 1 deployment)

**If you need deployment details:**
- **File**: `C:\Users\willh\Desktop\projects - current-location\next-scraper\SESSION-PHASE-1-DEPLOYMENT.md`
- **What**: Complete technical details of Phase 1 deployment (migration fixes, performance metrics, known limitations)

**If you need project overview:**
- **File**: `C:\Users\willh\Desktop\projects - current-location\next-scraper\CLAUDE.md`
- **What**: Main development log with all sessions, scrapers, database tables

---

## Quick Start (5 Minutes)

### 1. Verify Database Connection

```bash
# Test that environment variables are set correctly
node scripts/utils/test-connection.js
```

**Expected Output**:
```
✓ Connection test successful
```

If this fails, check `.env.local` has these variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### 2. Link Supabase CLI (Required for Migrations)

```bash
# Get the project reference
cat supabase/.temp/project-ref

# Link the CLI to the project
supabase link --project-ref <PROJECT_REF>
```

**Current Project**: `fuzouuxhxluqjmiyabal`

**One-liner**:
```bash
supabase link --project-ref fuzouuxhxluqjmiyabal
```

**Expected Output**:
```
Finished supabase link.
Initialising login role...
Connecting to remote database...
```

---

### 3. Check Migration Status

```bash
# Verify which migrations are applied
node scripts/check-migrations-applied.js
```

**Expected Output**:
```
✅ Migration 20250101000020 applied (player_game_stats enhanced)
✅ Migration 20250101000021 applied (weekly aggregation tables exist)

=== SUMMARY ===
✅ All Phase 1 migrations applied - Ready for testing!
```

---

## Common Database Operations

### Query Pattern Examples

**✅ CORRECT - Games Table (Composite Primary Key)**
```javascript
// Get a specific game
const { data, error } = await supabase
  .from('games')
  .select('game_id, season, home_team_id, away_team_id, status')
  .eq('game_id', '401772510')
  .eq('season', 2025)
  .single()

// Get all final games
const { data, error } = await supabase
  .from('games')
  .select('*')
  .eq('status', 'final')  // NOT 'completed'
  .eq('season', 2025)
```

**❌ WRONG - Common Mistakes**
```javascript
// ❌ WRONG: games table has NO 'id' column
.select('id, home_team, away_team')

// ❌ WRONG: Status enum is 'final' not 'completed'
.eq('status', 'completed')

// ❌ WRONG: Team columns have _id suffix
.select('home_team, away_team')

// ✅ CORRECT:
.select('game_id, season, home_team_id, away_team_id')
.eq('status', 'final')
```

---

## Critical Schema Information

### games Table
- **Primary Key**: Composite (`game_id`, `season`) - NO `id` column
- **Status Enum**: `'scheduled'` | `'in_progress'` | `'final'` (NOT `'completed'`)
- **Team Columns**: `home_team_id`, `away_team_id` (with `_id` suffix)
- **Partitioning**: RANGE partitioned by `season`

### teams Table
- **Primary Key**: `team_id` (e.g., 'KC', 'SF', 'BUF')
- **Abbreviation Column**: `team_abbr` (NOT `team_abbreviation`)
- **Common Query**: `teams.team_abbr as team_abbreviation` (alias for compatibility)

### player_teams Table
- **Season Columns**: `start_season`, `end_season` (NOT `season`)
- **Correct JOIN**:
  ```sql
  LEFT JOIN player_teams pt
    ON pt.player_id = p.player_id
    AND wsl.season BETWEEN pt.start_season AND COALESCE(pt.end_season, wsl.season)
  ```

### player_game_stats Table
- **Primary Key**: Composite (`player_id`, `game_id`, `season`)
- **New Columns (Phase 1)**: 44 added
  - Fantasy: `fantasy_points_ppr`, `fantasy_points_standard`, etc.
  - Advanced: `passing_sacks`, `receiving_targets`, `qbr`, `passer_rating`
  - EPA: `epa_total`, `epa_pass`, `epa_rush`, `success_rate`

---

## Applying New Migrations

### Step 1: Create Migration File
```bash
# Migrations go in supabase/migrations/
# Filename format: YYYYMMDDHHMMSS_description.sql
# Example: 20250101000022_add_new_feature.sql
```

### Step 2: Test Migration Locally (Optional)
```bash
# Check SQL syntax
cat supabase/migrations/20250101000022_add_new_feature.sql | grep -i "error"
```

### Step 3: Apply Migration via CLI
```bash
# Make sure you're linked first
supabase link --project-ref fuzouuxhxluqjmiyabal

# Push new migrations
cd supabase
supabase db push

# Or push specific migration
# (Note: CLI pushes all unapplied migrations automatically)
```

**Common Issues**:
```bash
# Issue: "Cannot find project ref"
# Fix: Re-link the project
supabase link --project-ref fuzouuxhxluqjmiyabal

# Issue: "column does not exist"
# Fix: Check actual schema first (see "Verify Schema" below)
```

### Step 4: Verify Migration Applied
```bash
node scripts/check-migrations-applied.js
```

---

## Verifying Schema Before Writing Queries

**Always check actual schema before assuming column names!**

### Method 1: Query via Node Script
```javascript
// Create a quick test file: test-schema.js
import { getSupabaseClient } from './scripts/utils/supabase-client.js'

const supabase = getSupabaseClient()
const { data, error } = await supabase
  .from('TABLE_NAME')
  .select('*')
  .limit(1)

if (data && data[0]) {
  console.log('Columns:', Object.keys(data[0]))
}
```

```bash
node test-schema.js
```

### Method 2: Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select project: `fuzouuxhxluqjmiyabal`
3. Click **Table Editor** → Select table
4. View column names and types

### Method 3: Read Migration Files
```bash
# Find table creation
grep -r "CREATE TABLE table_name" supabase/migrations/

# Find all columns for a table
grep -A 50 "CREATE TABLE games" supabase/migrations/*.sql
```

---

## Common Tasks

### 1. Run Game Stats Scraper
```bash
# Single game
npm run scrape:game-stats -- --game=401772510

# Entire week
npm run scrape:game-stats -- --week=7

# Specific season
npm run scrape:game-stats -- --week=7 --season=2025
```

### 2. Run Weekly Aggregation
```bash
# Current week (auto-detected)
npm run aggregate:weekly

# Specific week
npm run aggregate:weekly -- --week=7 --season=2025
```

### 3. Validate Data Completeness
```bash
node scripts/validate-data-completeness.js
```

**Expected Output**:
```
📊 PHASE 1 DATA COMPLETENESS SUMMARY
✅ Player Game Stats: 3817 records with fantasy points
✅ Weekly Leaders: 110 records
✅ Season Cumulative: 811 player records
✅ Team Stats: 188 records
✅ Scoring Plays: 820 records
⚠️  Games Missing Stats: 0/94 (100% coverage)

Overall Status: ✅ EXCELLENT
```

### 4. Check for Missing Players (Foreign Key Errors)
```bash
# If you see errors like:
# "Key (player_id)=(espn-1234567) is not present in table 'players'"

# Fix: Run roster updates to add missing players
npm run scrape:roster

# Then re-run failed games
npm run scrape:game-stats -- --week=X
```

---

## Troubleshooting

### Error: "Cannot find project ref. Have you run supabase link?"
**Solution**:
```bash
supabase link --project-ref fuzouuxhxluqjmiyabal
```

**Why**: Supabase CLI linking is NOT persistent across terminal sessions. Always re-link when starting work.

---

### Error: "column games.id does not exist"
**Cause**: Games table uses composite primary key `(game_id, season)`, not single `id` column

**Solution**:
```javascript
// ❌ WRONG
.select('id, home_team, away_team')

// ✅ CORRECT
.select('game_id, season, home_team_id, away_team_id')
```

---

### Error: "No results when filtering by status='completed'"
**Cause**: Status enum value is `'final'` not `'completed'`

**Solution**:
```javascript
// ❌ WRONG
.eq('status', 'completed')

// ✅ CORRECT
.eq('status', 'final')
```

**Verify**:
```javascript
// Check actual enum values
const { data } = await supabase
  .from('games')
  .select('status')
  .limit(100)

// Get unique values
const statuses = [...new Set(data.map(g => g.status))]
console.log('Valid statuses:', statuses)
// Output: ['final', 'scheduled']
```

---

### Error: "column player_teams.season does not exist"
**Cause**: Table uses `start_season` and `end_season`, not `season`

**Solution**:
```sql
-- ❌ WRONG
LEFT JOIN player_teams pt ON pt.season = wsl.season

-- ✅ CORRECT
LEFT JOIN player_teams pt
  ON wsl.season BETWEEN pt.start_season
  AND COALESCE(pt.end_season, wsl.season)
```

---

### Error: "insert violates foreign key constraint fk_player_game_stats_player"
**Cause**: Player not in `players` table (practice squad callup, mid-season signing)

**Solution**:
```bash
# Step 1: Run roster updates to add missing players
npm run scrape:roster

# Step 2: Re-run the failed game scrape
npm run scrape:game-stats -- --week=X --season=2025
```

**Why**: Roster updates scraper fetches current rosters from ESPN and adds any new players.

---

### Migration Won't Apply - Schema Conflict
**Symptoms**: Migration fails with "column already exists" or "table already exists"

**Solution 1 - Use IF NOT EXISTS**:
```sql
-- Always use IF NOT EXISTS for safety
ALTER TABLE player_game_stats
  ADD COLUMN IF NOT EXISTS fantasy_points_ppr DECIMAL(5,2);

CREATE TABLE IF NOT EXISTS weekly_stat_leaders (
  -- columns...
);
```

**Solution 2 - Check What's Applied**:
```bash
# Verify migration history
supabase db remote list

# Or check manually
node scripts/check-migrations-applied.js
```

---

## Environment Variables Reference

### Required Variables (.env.local)
```bash
# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://fuzouuxhxluqjmiyabal.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional (for future features)
THE_ODDS_API_KEY=your-odds-api-key
```

### How to Get These Values
1. Go to https://supabase.com/dashboard
2. Select project: `fuzouuxhxluqjmiyabal`
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **NEVER commit `.env.local` to git!** (it's in .gitignore)

---

## Quick Reference Commands

```bash
# === CONNECTION ===
supabase link --project-ref fuzouuxhxluqjmiyabal
node scripts/utils/test-connection.js

# === MIGRATIONS ===
supabase db push
node scripts/check-migrations-applied.js

# === SCRAPING ===
npm run scrape:game-stats -- --week=7
npm run aggregate:weekly -- --week=7

# === VALIDATION ===
node scripts/validate-data-completeness.js
node scripts/verify-phase1-fields.js

# === SCHEMA CHECKS ===
# Check games table
node -e "import('./scripts/utils/supabase-client.js').then(async ({getSupabaseClient}) => { const s = getSupabaseClient(); const {data} = await s.from('games').select('*').limit(1); console.log('Columns:', Object.keys(data[0])); })"

# Check teams table
node -e "import('./scripts/utils/supabase-client.js').then(async ({getSupabaseClient}) => { const s = getSupabaseClient(); const {data} = await s.from('teams').select('*').limit(1); console.log('Columns:', Object.keys(data[0])); })"
```

---

## For Future Agents: New Feature Checklist

When adding a new feature that requires database changes:

1. ✅ **Check existing schema first**
   ```bash
   node -e "import('./scripts/utils/supabase-client.js').then(...)"
   ```

2. ✅ **Create migration file**
   - Use proper naming: `YYYYMMDDHHMMSS_description.sql`
   - Always use `IF NOT EXISTS`
   - Add comments explaining what you're doing

3. ✅ **Test locally if possible**
   - Read the migration SQL
   - Check for syntax errors
   - Verify column names match existing conventions

4. ✅ **Apply migration**
   ```bash
   supabase link --project-ref fuzouuxhxluqjmiyabal
   cd supabase && supabase db push
   ```

5. ✅ **Verify migration applied**
   ```bash
   node scripts/check-migrations-applied.js
   ```

6. ✅ **Update scraper/scripts to use new fields**
   - Follow existing patterns in `game-stats-scraper.js`
   - Use `calculateFantasyPoints()` for fantasy fields
   - Add to batch upsert operations

7. ✅ **Test end-to-end**
   ```bash
   npm run scrape:game-stats -- --game=GAME_ID
   node scripts/validate-data-completeness.js
   ```

8. ✅ **Document in CLAUDE.md**
   - Add to development timeline
   - Update schema summary
   - Add to performance metrics

---

## Success Criteria Checklist

Before moving to next phase, verify:

- [ ] `supabase link` works without errors
- [ ] `node scripts/check-migrations-applied.js` shows all ✅
- [ ] `npm run scrape:game-stats` completes successfully
- [ ] `node scripts/validate-data-completeness.js` shows 100% coverage
- [ ] No foreign key constraint errors
- [ ] All queries use correct column names (`home_team_id` not `home_team`)
- [ ] All queries use correct enum values (`'final'` not `'completed'`)
- [ ] Composite keys handled correctly in JOINs

---

## Support Resources

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Project ID**: `fuzouuxhxluqjmiyabal`
- **Schema Docs**: See migration files in `supabase/migrations/`
- **Code Examples**: See `scripts/scrapers/game-stats-scraper.js`
- **Testing Scripts**: `scripts/check-*.js` and `scripts/verify-*.js`

---

**Last Verified**: 2025-10-20
**Phase 1 Status**: ✅ Complete (100% game coverage, 303 fields operational)
**Next Phase**: Phase 2 (Betting + Snaps + Trending)
