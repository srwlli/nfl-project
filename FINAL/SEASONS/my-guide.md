# Seasons - Quick Reference Guide

> **Purpose**: Quick reference for seasons table
> **Date**: October 22, 2025
> **Status**: ✅ Complete
> **CodeRef**: `04-schedule.js:28-32`

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

## SELECT Query String

```sql
season, start_date, end_date, super_bowl_winner, super_bowl_runner_up, super_bowl_location, super_bowl_date, regular_season_weeks, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 8
- **Total Records**: 1 (2025 season)
- **Data Source**: Hardcoded in 04-schedule.js
- **Auto-Populated**: ✅ One-time seed per season

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| season | integer | 2025 | Year season started (PK) |
| start_date | date | "2025-09-04" | Season kickoff date |
| end_date | date | "2026-02-09" | Super Bowl date (approx) |
| super_bowl_winner | varchar(10) | "KC" | Champion (NULL until played) |
| super_bowl_runner_up | varchar(10) | "SF" | Runner-up (NULL until played) |
| super_bowl_location | varchar(100) | "Las Vegas, NV" | SB venue (NULL until played) |
| super_bowl_date | date | "2026-02-09" | Exact SB date (NULL until played) |
| regular_season_weeks | integer | 17 | Default 17 (was 16 pre-2021) |

---

## Current Season Data

**2025 Season:**
- **Start**: September 4, 2025
- **End**: February 9, 2026 (estimated)
- **Regular Season**: 17 weeks
- **Super Bowl**: Not yet played (all SB fields NULL)

---

## Common Queries

### Get Current Season

```javascript
const { data: currentSeason } = await supabase
  .from('seasons')
  .select('*')
  .order('season', { ascending: false })
  .limit(1)
  .single()

console.log(`${currentSeason.season} NFL Season`)
console.log(`Kickoff: ${currentSeason.start_date}`)
```

### Get Specific Season

```javascript
const { data: season } = await supabase
  .from('seasons')
  .select('*')
  .eq('season', 2025)
  .single()

console.log(`Regular Season Weeks: ${season.regular_season_weeks}`)
```

### Get Seasons with Super Bowl Data

```javascript
const { data: completedSeasons } = await supabase
  .from('seasons')
  .select('*')
  .not('super_bowl_winner', 'is', null)
  .order('season', { ascending: false })

completedSeasons.forEach(s => {
  console.log(`${s.season}: ${s.super_bowl_winner} defeated ${s.super_bowl_runner_up}`)
  console.log(`Location: ${s.super_bowl_location}`)
  console.log(`Date: ${s.super_bowl_date}`)
})
```

### Check Season Exists

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
await seasonExists(2024)  // false (not seeded)
```

---

## Display Helpers

### Format Season Label

```javascript
const formatSeason = (season) => {
  return `${season.season} NFL Season`
}

// Usage
formatSeason({ season: 2025 })  // "2025 NFL Season"
```

### Format Season Date Range

```javascript
const formatSeasonDates = (season) => {
  const start = new Date(season.start_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const end = new Date(season.end_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  return `${start} - ${end}`
}

// Usage
formatSeasonDates({
  start_date: '2025-09-04',
  end_date: '2026-02-09'
})
// "September 4, 2025 - February 9, 2026"
```

### Format Super Bowl Result

```javascript
const formatSuperBowl = (season) => {
  if (!season.super_bowl_winner) {
    return 'Super Bowl not yet played'
  }

  return `${season.super_bowl_winner} defeated ${season.super_bowl_runner_up} in ${season.super_bowl_location} on ${season.super_bowl_date}`
}

// Usage (when Super Bowl played)
formatSuperBowl({
  super_bowl_winner: 'KC',
  super_bowl_runner_up: 'SF',
  super_bowl_location: 'Las Vegas, NV',
  super_bowl_date: '2026-02-09'
})
// "KC defeated SF in Las Vegas, NV on 2026-02-09"
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Hardcoding season year

```javascript
const season = 2025  // What if querying different year?
```

### ✅ CORRECT - Get from database

```javascript
const { data: season } = await supabase
  .from('seasons')
  .select('season')
  .order('season', { ascending: false })
  .limit(1)
  .single()
```

### ❌ WRONG - Assuming Super Bowl fields exist

```javascript
console.log(season.super_bowl_winner)  // Could be NULL!
```

### ✅ CORRECT - Check for NULL first

```javascript
if (season.super_bowl_winner) {
  console.log(`Champion: ${season.super_bowl_winner}`)
} else {
  console.log('Super Bowl not yet played')
}
```

### ❌ WRONG - Not handling missing seasons

```javascript
const { data: season } = await supabase
  .from('seasons')
  .select('*')
  .eq('season', 2024)
  .single()  // Will throw if not found
```

### ✅ CORRECT - Use maybeSingle()

```javascript
const { data: season } = await supabase
  .from('seasons')
  .select('*')
  .eq('season', 2024)
  .maybeSingle()

if (!season) {
  console.log('Season not seeded yet')
}
```

---

## Scripts in This Folder

### **File**: `scripts/seed/04-schedule.js`
- **Purpose**: Seed 2025 season + schedule
- **Season Seeding**: Lines 28-32
- **Trigger**: Manual one-time

**Usage**:
```bash
# Seed season (part of schedule seed)
npm run seed:schedule
```

**What It Does**:
1. Creates 2025 season record
2. Handles duplicate key gracefully
3. Proceeds to seed 272 games

**Key Code** (lines 28-32):
```javascript
await insertBatch('seasons', [{
  season: SEASON_YEAR,
  start_date: '2025-09-04',
  end_date: '2026-02-09'
}])
```

---

## Frontend Display Examples

### Season Selector Dropdown

```jsx
const SeasonSelector = ({ value, onChange }) => {
  const { data: seasons } = useQuery(() =>
    supabase
      .from('seasons')
      .select('*')
      .order('season', { ascending: false })
  )

  return (
    <select value={value} onChange={onChange}>
      <option value="">Select Season</option>
      {seasons?.map(s => (
        <option key={s.season} value={s.season}>
          {s.season} Season
        </option>
      ))}
    </select>
  )
}
```

### Season Info Card

```jsx
const SeasonCard = ({ season }) => {
  const { data } = useQuery(() =>
    supabase
      .from('seasons')
      .select('*')
      .eq('season', season)
      .single()
  )

  if (!data) return <div>Loading...</div>

  return (
    <div className="season-card">
      <h2>{data.season} NFL Season</h2>
      <div className="dates">
        <span>Start: {new Date(data.start_date).toLocaleDateString()}</span>
        <span>End: {new Date(data.end_date).toLocaleDateString()}</span>
      </div>
      <div className="regular-season">
        <span>{data.regular_season_weeks} Regular Season Weeks</span>
      </div>
      {data.super_bowl_winner && (
        <div className="super-bowl">
          <h3>Super Bowl {data.season}</h3>
          <p>Champion: {data.super_bowl_winner}</p>
          <p>Runner-Up: {data.super_bowl_runner_up}</p>
          <p>Location: {data.super_bowl_location}</p>
          <p>Date: {new Date(data.super_bowl_date).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  )
}
```

### Current Season Badge

```jsx
const CurrentSeasonBadge = () => {
  const { data: currentSeason } = useQuery(() =>
    supabase
      .from('seasons')
      .select('season, start_date, end_date')
      .order('season', { ascending: false })
      .limit(1)
      .single()
  )

  const isInSeason = () => {
    const now = new Date()
    const start = new Date(currentSeason.start_date)
    const end = new Date(currentSeason.end_date)
    return now >= start && now <= end
  }

  return (
    <div className="season-badge">
      <span className={isInSeason() ? 'active' : 'upcoming'}>
        {currentSeason?.season} Season
      </span>
      {isInSeason() && <span className="live-indicator">● LIVE</span>}
    </div>
  )
}
```

---

## Validation Queries

### Check Data Completeness

```sql
-- Should have at least 1 season (2025)
SELECT COUNT(*) as season_count
FROM seasons;
```

### Verify Required Fields

```sql
-- Check all required fields populated
SELECT
  season,
  CASE
    WHEN start_date IS NULL THEN 'MISSING start_date'
    ELSE 'OK'
  END as validation
FROM seasons;
```

### Find Incomplete Seasons

```sql
-- Seasons missing Super Bowl data
SELECT
  season,
  start_date,
  end_date,
  super_bowl_winner IS NULL as sb_winner_missing,
  super_bowl_date IS NULL as sb_date_missing
FROM seasons
ORDER BY season DESC;
```

---

## Known Limitations

### 1. Manual Super Bowl Updates ⚠️

**Issue**: No automatic scraper to update Super Bowl fields.

**Impact**: Must manually update after championship game.

**Workaround**: Run manual update script post-Super Bowl.

---

### 2. Single Season Only ⚠️

**Issue**: Only 2025 season currently seeded.

**Impact**: Historical queries will return no data.

**Solution**: Seed additional seasons as needed.

---

## Documentation Links

- **Field Mapping**: `SEASONS-RESOURCES/field-mapping-report.md` - All 8 fields documented
- **Raw Data Sources**: `SEASONS-RESOURCES/raw-data-source-mapping.md` - Seed script details
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000004_create_core_entity_tables.sql` (lines 8-25)
- **Seed Script**: scripts/seed/04-schedule.js:28-32

---

## Quick Commands

```bash
# Seed season (part of schedule)
npm run seed:schedule

# Query current season
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('seasons').select('*').order('season', { ascending: false }).limit(1).then(({ data }) => console.table(data));"

# Check season exists
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('seasons').select('season').eq('season', 2025).maybeSingle().then(({ data }) => console.log(data ? 'Season exists' : 'Season not found'));"
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 8
**Total Records**: 1 (2025 season)
**Status**: ✅ Production Ready
**CodeRef**: 04-schedule.js:28-32 ✅ Validated
