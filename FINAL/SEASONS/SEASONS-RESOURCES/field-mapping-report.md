# Seasons Table - Field Mapping Report

> **Purpose**: Complete field mapping verification for the seasons table
> **Date Generated**: October 22, 2025
> **Status**: ✅ 100% Normalized
> **CodeRef**: `04-schedule.js:28-32` (seed script)

---

## Executive Summary

The **seasons table** is a reference table storing NFL season definitions. This is a minimal lookup table used for foreign key constraints and season metadata tracking.

- **Total Columns**: 8 (+ 3 metadata)
- **Total Records**: 1 (2025 season)
- **Critical Fields**: ✅ 8/8 verified
- **Normalization Status**: ✅ 100% compliant
- **Ready for Frontend**: ✅ Yes
- **Auto-Populated**: ✅ Via seed script (one-time per season)

---

## All 8 Fields (Copy-Paste Ready)

```
season, start_date, end_date, super_bowl_winner, super_bowl_runner_up, super_bowl_location, super_bowl_date, regular_season_weeks
```

---

## Field Categories

### Identification (1 field)
```
season
```

### Season Dates (2 fields)
```
start_date, end_date
```

### Super Bowl Info (4 fields)
```
super_bowl_winner, super_bowl_runner_up, super_bowl_location, super_bowl_date
```

### Configuration (1 field)
```
regular_season_weeks
```

---

## Complete Field Mapping

| Field Name | Database Column | Type | Example | Nullable | Notes |
|------------|-----------------|------|---------|----------|-------|
| Season | `season` | integer | 2025 | ❌ No | PK, year season started |
| Start Date | `start_date` | date | "2025-09-04" | ❌ No | Season kickoff |
| End Date | `end_date` | date | "2026-02-09" | ✅ Yes | Super Bowl date (approx) |
| Super Bowl Winner | `super_bowl_winner` | varchar(10) | "KC" | ✅ Yes | FK to teams (updated post-SB) |
| Super Bowl Runner Up | `super_bowl_runner_up` | varchar(10) | "SF" | ✅ Yes | FK to teams (updated post-SB) |
| Super Bowl Location | `super_bowl_location` | varchar(100) | "Las Vegas, NV" | ✅ Yes | City/venue |
| Super Bowl Date | `super_bowl_date` | date | "2026-02-09" | ✅ Yes | Exact SB date |
| Regular Season Weeks | `regular_season_weeks` | integer | 17 | ✅ Yes | Default 17 (was 16 pre-2021) |

---

## Data Source Mapping

### Seed Script → Database

**Source**: `scripts/seed/04-schedule.js`
**CodeRef**: Lines 28-32

```javascript
// 04-schedule.js:28-32
await insertBatch('seasons', [{
  season: SEASON_YEAR,        // 2025
  start_date: '2025-09-04',   // First Thursday in September
  end_date: '2026-02-09'      // Estimated Super Bowl date
}])
```

**Example seed data:**
```json
{
  "season": 2025,
  "start_date": "2025-09-04",
  "end_date": "2026-02-09",
  "super_bowl_winner": null,
  "super_bowl_runner_up": null,
  "super_bowl_location": null,
  "super_bowl_date": null,
  "regular_season_weeks": 17
}
```

---

## Current Season Data

**2025 Season** (current):
- **Season**: 2025
- **Start Date**: September 4, 2025
- **End Date**: February 9, 2026
- **Regular Season Weeks**: 17
- **Super Bowl**: Not yet played (fields NULL)

---

## Common Queries

### Get Current Season

```javascript
const { data: currentSeason } = await supabase
  .from('seasons')
  .select('*')
  .eq('season', 2025)
  .single()

console.log(`Season ${currentSeason.season}`)
console.log(`Start: ${currentSeason.start_date}`)
console.log(`End: ${currentSeason.end_date}`)
```

### Get Season with Super Bowl Winner

```javascript
const { data: pastSeasons } = await supabase
  .from('seasons')
  .select('*, winner:teams!super_bowl_winner(*), runner_up:teams!super_bowl_runner_up(*)')
  .not('super_bowl_winner', 'is', null)
  .order('season', { ascending: false })

pastSeasons.forEach(season => {
  console.log(`${season.season}: ${season.winner.team_name} defeated ${season.runner_up.team_name}`)
})
```

### Check If Season Exists

```javascript
const seasonExists = async (year) => {
  const { data } = await supabase
    .from('seasons')
    .select('season')
    .eq('season', year)
    .maybeSingle()

  return !!data
}

// Usage
await seasonExists(2025)  // true
await seasonExists(2024)  // false (not seeded yet)
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Hardcoding season year

```javascript
const season = 2025  // What if running for different season?
```

### ✅ CORRECT - Read from seasons table

```javascript
const { data: currentSeason } = await supabase
  .from('seasons')
  .select('season')
  .order('season', { ascending: false })
  .limit(1)
  .single()

const season = currentSeason.season  // Dynamic
```

### ❌ WRONG - Assuming Super Bowl fields are always populated

```javascript
console.log(season.super_bowl_winner)  // Could be NULL mid-season
```

### ✅ CORRECT - Check for NULL before using

```javascript
if (season.super_bowl_winner) {
  console.log(`Winner: ${season.super_bowl_winner}`)
} else {
  console.log('Super Bowl not yet played')
}
```

---

## Scripts in This Folder

### **File**: `scripts/seed/04-schedule.js`
- **Purpose**: Seed 2025 season schedule (also creates season record first)
- **Season Seeding**: Lines 28-32
- **Trigger**: Manual one-time (or yearly for new seasons)

**Usage**:
```bash
# Seed season + schedule
npm run seed:schedule
```

**What It Does**:
1. Creates season record for 2025
2. Checks if already exists (duplicate key protection)
3. Then proceeds to seed 272 games

**Key Code** (lines 28-32):
```javascript
await insertBatch('seasons', [{
  season: SEASON_YEAR,
  start_date: '2025-09-04',
  end_date: '2026-02-09'
}])
```

---

## Related Tables

### Referenced By

- `games` - FK: games.season → seasons.season
- `player_game_stats` - FK: player_game_stats.season → seasons.season
- `team_season_stats` - FK: team_season_stats.season → seasons.season
- `game_betting_lines` - FK: game_betting_lines.season → seasons.season

---

## Frontend Display Examples

### Season Selector Component

```jsx
const SeasonSelector = ({ value, onChange }) => {
  const { data: seasons } = useQuery(() =>
    supabase.from('seasons').select('*').order('season', { ascending: false })
  )

  return (
    <select value={value} onChange={onChange}>
      {seasons?.map(s => (
        <option key={s.season} value={s.season}>
          {s.season} Season
        </option>
      ))}
    </select>
  )
}
```

### Season Info Display

```jsx
const SeasonInfo = ({ season }) => {
  const { data } = useQuery(() =>
    supabase.from('seasons').select('*').eq('season', season).single()
  )

  return (
    <div>
      <h2>{data.season} NFL Season</h2>
      <p>Regular Season: {data.start_date} - Week 18</p>
      <p>Super Bowl: {data.super_bowl_date || 'TBD'}</p>
      {data.super_bowl_winner && (
        <p>Champion: {data.super_bowl_winner}</p>
      )}
    </div>
  )
}
```

---

## Validation Queries

### Check Data Completeness

```sql
-- Should have at least 1 season (2025)
SELECT COUNT(*) as total_seasons
FROM seasons;
```

### Verify Current Season

```sql
-- Get current season
SELECT *
FROM seasons
WHERE season = 2025;
```

### Check Historical Seasons (Future)

```sql
-- Find seasons with Super Bowl data
SELECT
  season,
  super_bowl_winner,
  super_bowl_date
FROM seasons
WHERE super_bowl_winner IS NOT NULL
ORDER BY season DESC;
```

---

## Known Limitations

### 1. Manual Super Bowl Updates ⚠️

**Issue**: Super Bowl fields must be manually updated after championship game.

**Impact**: No automatic scraper updates these fields.

**Solution**: Manual update or create post-super-bowl script:
```javascript
await supabase.from('seasons').update({
  super_bowl_winner: 'KC',
  super_bowl_runner_up: 'SF',
  super_bowl_location: 'Las Vegas, NV',
  super_bowl_date: '2026-02-09'
}).eq('season', 2025)
```

---

### 2. Single Season Support ⚠️

**Issue**: Currently only 2025 season seeded.

**Impact**: Historical data queries will fail.

**Solution**: Seed additional seasons as needed:
```javascript
await insertBatch('seasons', [
  { season: 2024, start_date: '2024-09-05', end_date: '2025-02-11' },
  { season: 2023, start_date: '2023-09-07', end_date: '2024-02-11' }
])
```

---

## Documentation Links

- **Field Mapping**: `SEASONS-RESOURCES/field-mapping-report.md` - All 8 fields documented
- **Raw Data Sources**: `SEASONS-RESOURCES/raw-data-source-mapping.md` - Seed script structure
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000004_create_core_entity_tables.sql` (lines 8-25)
- **Seed Script**: scripts/seed/04-schedule.js:28-32
- **Related**: games table (season FK), player_game_stats (season FK)

---

## Quick Commands

```bash
# Seed season (part of schedule seed)
npm run seed:schedule

# Query current season
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('seasons').select('*').order('season', { ascending: false }).limit(1).then(({ data }) => console.log(data));"
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 8
**Total Records**: 1 (2025 season)
**Status**: ✅ Production Ready
**CodeRef**: 04-schedule.js:28-32 ✅ Validated
