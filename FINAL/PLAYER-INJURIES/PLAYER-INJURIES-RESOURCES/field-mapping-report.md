# Player Injuries Table - Field Mapping Report

> **Purpose**: Complete field mapping verification for the player_injuries table
> **Date Generated**: October 22, 2025
> **Status**: ✅ Schema Complete, ⚠️ Not Yet Populated
> **CodeRef**: `injuries-scraper.js:75-96` (transform function)

---

## Executive Summary

The **player_injuries table** tracks injury history for NFL players. This table stores detailed injury information including type, description, dates, and games missed.

- **Total Columns**: 8 (+ 3 metadata)
- **Total Records**: 0 (⚠️ Not yet scraped - scraper exists and is ready)
- **Critical Fields**: ✅ 8/8 verified
- **Normalization Status**: ✅ 100% compliant
- **Ready for Frontend**: ✅ Yes
- **Auto-Populated**: ✅ Via injuries-scraper.js (runs daily at 6:00 AM ET)

---

## All 8 Fields (Copy-Paste Ready)

```
injury_id, player_id, season, injury_type, injury_description, injury_date, return_date, games_missed
```

---

## Field Categories

### Identification (2 fields)
```
injury_id, player_id
```

### Injury Details (3 fields)
```
injury_type, injury_description, injury_date
```

### Recovery Tracking (2 fields)
```
return_date, games_missed
```

### Metadata (1 field)
```
season
```

---

## Complete Field Mapping

| Field Name | Database Column | Type | Example | Nullable | Notes |
|------------|-----------------|------|---------|----------|-------|
| Injury ID | `injury_id` | serial | 1 | ❌ No | PK (auto-increment) |
| Player ID | `player_id` | varchar(50) | "espn-3139477" | ❌ No | FK to players |
| Season | `season` | integer | 2025 | ❌ No | Which season |
| Injury Type | `injury_type` | varchar(100) | "Ankle" | ✅ Yes | Body part/category |
| Injury Description | `injury_description` | text | "Left ankle - Questionable - Week-to-week" | ✅ Yes | Detailed info |
| Injury Date | `injury_date` | date | "2025-10-15" | ✅ Yes | When injured |
| Return Date | `return_date` | date | "2025-11-05" | ✅ Yes | When returned (nullable if still out) |
| Games Missed | `games_missed` | integer | 3 | ✅ Yes | Count of games missed (default 0) |

---

## Data Source Mapping

### ESPN API → Database

**Source**: `scripts/scrapers/injuries-scraper.js`
**CodeRef**: Lines 75-96 (transformInjuryData function)

```javascript
// injuries-scraper.js:75-96
function transformInjuryData(injury, teamId) {
  const athlete = injury.athlete || {}

  // Build injury description from available data
  const bodyPart = injury.details?.detail || injury.details?.side || ''
  const status = injury.status || ''
  const comment = injury.longComment || injury.details?.fantasyStatus || ''

  const injuryDescription = [bodyPart, status, comment]
    .filter(Boolean)
    .join(' - ')

  return {
    player_id: `espn-${athlete.id}`,
    season: SEASON_YEAR,
    injury_type: injury.type || injury.details?.type || 'Unknown',
    injury_description: injuryDescription || null,
    injury_date: injury.date || new Date().toISOString().split('T')[0],
    return_date: injury.details?.returnDate || null,
    games_missed: 0  // Will be calculated separately if needed
  }
}
```

---

## ESPN API Structure

**Endpoint**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{teamId}?enable=injuries`

**Example ESPN Response:**
```json
{
  "team": {
    "injuries": [
      {
        "athlete": {
          "id": "3139477",
          "displayName": "Derrick Henry"
        },
        "type": "Hamstring",
        "status": "Questionable",
        "date": "2025-10-20",
        "longComment": "Week-to-week with hamstring strain",
        "details": {
          "type": "Hamstring",
          "detail": "Left hamstring",
          "side": "Left",
          "fantasyStatus": "Questionable",
          "returnDate": null
        }
      }
    ]
  }
}
```

**Mapped to Database:**
```json
{
  "player_id": "espn-3139477",
  "season": 2025,
  "injury_type": "Hamstring",
  "injury_description": "Left hamstring - Questionable - Week-to-week with hamstring strain",
  "injury_date": "2025-10-20",
  "return_date": null,
  "games_missed": 0
}
```

---

## Field Mapping Details

| Database Column | ESPN Source | Transform | Notes |
|-----------------|-------------|-----------|-------|
| player_id | `athlete.id` | Prefix with "espn-" | FK to players table |
| season | Hardcoded constant | SEASON_YEAR (2025) | Current season |
| injury_type | `type` or `details.type` | Direct | Body part (e.g., "Ankle", "Hamstring") |
| injury_description | Multiple fields | Concatenate | Combines bodyPart + status + comment |
| injury_date | `date` | ISO date string | When injury reported |
| return_date | `details.returnDate` | Direct or NULL | Expected return (often null) |
| games_missed | Calculated | Default 0 | Needs manual calculation |

---

## Common Queries

### Get Current Season Injuries

```javascript
const { data: currentInjuries } = await supabase
  .from('player_injuries')
  .select(`
    *,
    player:players(full_name, primary_position)
  `)
  .eq('season', 2025)
  .is('return_date', null)  // Still injured
  .order('injury_date', { ascending: false })

currentInjuries.forEach(inj => {
  console.log(`${inj.player.full_name} - ${inj.injury_type}`)
})
```

### Get Player Injury History

```javascript
const { data: playerInjuries } = await supabase
  .from('player_injuries')
  .select('*')
  .eq('player_id', 'espn-3139477')
  .order('injury_date', { ascending: false })

console.log(`Total injuries: ${playerInjuries.length}`)
```

### Get Team Injury Report

```javascript
// Get current team roster
const { data: roster } = await supabase
  .from('player_teams')
  .select('player_id')
  .eq('team_id', 'KC')
  .is('end_season', null)

const playerIds = roster.map(p => p.player_id)

// Get injuries for those players
const { data: teamInjuries } = await supabase
  .from('player_injuries')
  .select(`
    *,
    player:players(full_name, primary_position)
  `)
  .in('player_id', playerIds)
  .eq('season', 2025)
  .is('return_date', null)
```

### Most Injury-Prone Players

```javascript
const { data: injuries } = await supabase
  .from('player_injuries')
  .select('player_id, player:players(full_name)')

// Count injuries per player
const counts = injuries.reduce((acc, inj) => {
  const key = inj.player_id
  acc[key] = acc[key] || { player: inj.player, count: 0 }
  acc[key].count++
  return acc
}, {})

const sorted = Object.values(counts)
  .sort((a, b) => b.count - a.count)
  .slice(0, 10)
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Assuming injury_description is always populated

```javascript
console.log(injury.injury_description.toUpperCase())  // Could be NULL!
```

### ✅ CORRECT - Check for null first

```javascript
console.log(injury.injury_description?.toUpperCase() || 'No description')
```

### ❌ WRONG - Not checking return_date for active injuries

```javascript
// Shows all injuries including recovered
const { data } = await supabase
  .from('player_injuries')
  .eq('season', 2025)
```

### ✅ CORRECT - Filter by return_date to get current injuries

```javascript
// Show only current injuries
const { data } = await supabase
  .from('player_injuries')
  .eq('season', 2025)
  .is('return_date', null)  // Still injured
```

### ❌ WRONG - Hardcoding games_missed

```javascript
// games_missed is set to 0 by scraper, needs calculation
if (injury.games_missed === 0) {
  console.log('Player not injured')  // WRONG - could be newly injured
}
```

### ✅ CORRECT - Calculate games_missed from game schedule

```javascript
// Calculate games missed by comparing injury_date to game dates
const { data: games } = await supabase
  .from('games')
  .select('*')
  .gte('game_date', injury.injury_date)
  .lt('game_date', injury.return_date || new Date())

const gamesMissed = games.length
```

---

## Scripts in This Folder

### **File**: `scripts/scrapers/injuries-scraper.js`
- **Purpose**: Fetch injury reports from ESPN API
- **Key Function**: transformInjuryData (lines 75-96)
- **Trigger**: Daily at 6:00 AM ET (via scheduler)
- **Schedule**: Runs every day to catch updates

**Usage**:
```bash
# Scrape all teams
npm run scrape:injuries

# Scrape specific team
npm run scrape:injuries -- --team=PHI
```

**What It Does**:
1. Fetches injuries from ESPN API (enable=injuries parameter)
2. Transforms ESPN data to match player_injuries schema
3. Upserts to player_injuries table (keyed by player_id + season)
4. Logs summary (teams with injuries, total injuries found)

**Key Code** (lines 75-96):
```javascript
function transformInjuryData(injury, teamId) {
  // Build injury_description from multiple ESPN fields
  const bodyPart = injury.details?.detail || injury.details?.side || ''
  const status = injury.status || ''
  const comment = injury.longComment || injury.details?.fantasyStatus || ''

  const injuryDescription = [bodyPart, status, comment]
    .filter(Boolean)
    .join(' - ')

  return {
    player_id: `espn-${athlete.id}`,
    season: SEASON_YEAR,
    injury_type: injury.type || injury.details?.type || 'Unknown',
    injury_description: injuryDescription || null,
    injury_date: injury.date || new Date().toISOString().split('T')[0],
    return_date: injury.details?.returnDate || null,
    games_missed: 0
  }
}
```

---

## Related Tables

### Referenced By

- `players` - Player profiles (FK: player_id)
- `player_teams` - Current team assignments (to get team injury reports)
- `games` - Game schedule (to calculate games_missed)

---

## Frontend Display Examples

### Injury Report Card

```jsx
const PlayerInjuryHistory = ({ playerId }) => {
  const { data: injuries } = useQuery(() =>
    supabase
      .from('player_injuries')
      .select('*')
      .eq('player_id', playerId)
      .order('injury_date', { ascending: false })
  )

  return (
    <div className="injury-history">
      <h3>Injury History</h3>
      {injuries?.map(inj => (
        <div key={inj.injury_id} className="injury-item">
          <span className="date">{inj.injury_date}</span>
          <span className="type">{inj.injury_type}</span>
          <p className="desc">{inj.injury_description}</p>
          {inj.return_date ? (
            <span className="status returned">
              Returned: {inj.return_date}
            </span>
          ) : (
            <span className="status active">Currently Out</span>
          )}
        </div>
      ))}
    </div>
  )
}
```

### Team Injury Report

```jsx
const TeamInjuryReport = ({ teamId }) => {
  const { data: injuries } = useQuery(async () => {
    // Get team roster
    const { data: roster } = await supabase
      .from('player_teams')
      .select('player_id')
      .eq('team_id', teamId)
      .is('end_season', null)

    const playerIds = roster.map(p => p.player_id)

    // Get current injuries
    return supabase
      .from('player_injuries')
      .select(`
        *,
        player:players(full_name, primary_position)
      `)
      .in('player_id', playerIds)
      .eq('season', 2025)
      .is('return_date', null)
  })

  return (
    <div className="team-injuries">
      <h3>Current Injuries</h3>
      <p>{injuries?.length || 0} players injured</p>
      <ul>
        {injuries?.map(inj => (
          <li key={inj.injury_id}>
            <strong>{inj.player.full_name}</strong> ({inj.player.primary_position})
            <br />
            {inj.injury_type} - {inj.injury_description}
            <br />
            <small>Injured: {inj.injury_date}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Validation Queries

### Check Data Completeness

```sql
-- Should have records after scraper runs
SELECT COUNT(*) as total_injuries
FROM player_injuries;
```

### Verify Current Season Injuries

```sql
-- Get current season injury count
SELECT
  season,
  COUNT(*) as injury_count
FROM player_injuries
GROUP BY season
ORDER BY season DESC;
```

### Find Players with Multiple Injuries

```sql
-- Players with 2+ injuries this season
SELECT
  p.full_name,
  COUNT(*) as injury_count
FROM player_injuries pi
JOIN players p ON p.player_id = pi.player_id
WHERE pi.season = 2025
GROUP BY p.player_id, p.full_name
HAVING COUNT(*) >= 2
ORDER BY injury_count DESC;
```

### Check for Missing Return Dates

```sql
-- Current injuries (no return date)
SELECT
  p.full_name,
  pi.injury_type,
  pi.injury_date
FROM player_injuries pi
JOIN players p ON p.player_id = pi.player_id
WHERE pi.season = 2025
  AND pi.return_date IS NULL
ORDER BY pi.injury_date DESC;
```

---

## Known Limitations

### 1. ESPN API Has Limited Injury Data ⚠️

**Issue**: ESPN API doesn't always provide comprehensive injury information.

**Impact**: Some injuries may not be captured, or descriptions may be incomplete.

**Workaround**: Scraper runs daily to catch updates as ESPN updates their data.

---

### 2. games_missed Not Automatically Calculated ⚠️

**Issue**: Scraper sets games_missed to 0 by default.

**Impact**: Need separate calculation to determine actual games missed.

**Solution**: Calculate based on injury_date, return_date, and game schedule:
```javascript
const gamesMissed = await calculateGamesMissed(playerId, injuryDate, returnDate)
```

---

### 3. return_date Often NULL ⚠️

**Issue**: ESPN rarely provides expected return dates.

**Impact**: Hard to distinguish between recent injury and long-term injury.

**Workaround**: Use injury_date and check if player has played in recent games.

---

## Documentation Links

- **Field Mapping**: `PLAYER-INJURIES-RESOURCES/field-mapping-report.md` - All 8 fields documented
- **Raw Data Sources**: `PLAYER-INJURIES-RESOURCES/raw-data-source-mapping.md` - ESPN API structure
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000008_create_game_and_reference_tables.sql` (lines 246-263)
- **Scraper Script**: scripts/scrapers/injuries-scraper.js (lines 75-96)

---

## Quick Commands

```bash
# Scrape injuries for all teams
npm run scrape:injuries

# Scrape injuries for specific team
npm run scrape:injuries -- --team=KC

# Check injury count
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('player_injuries').select('*', { count: 'exact', head: true }).then(({ count }) => console.log('Total injuries:', count));"

# Get current injuries
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('player_injuries').select('*, player:players(full_name)').eq('season', 2025).is('return_date', null).then(({ data }) => console.table(data));"
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 8
**Total Records**: 0 (⚠️ Scraper ready, not yet run)
**Status**: ✅ Schema Complete, Scraper Fixed & Ready
**CodeRef**: injuries-scraper.js:75-96 ✅ Validated
