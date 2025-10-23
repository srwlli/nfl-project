# Player Injuries - Quick Reference Guide

> **Purpose**: Quick reference for player_injuries table
> **Date**: October 22, 2025
> **Status**: ⚠️ EMPTY (No data populated)
> **CodeRef**: Migration only (no scraper exists)

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

## SELECT Query String

```sql
injury_id, player_id, season, injury_type, injury_description, injury_date, return_date, games_missed, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 8
- **Total Records**: 0 (⚠️ NOT POPULATED)
- **Expected Records**: 8,000+ (historical injury data)
- **Data Source**: ESPN API (limited) or manual tracking
- **Auto-Populated**: ❌ No scraper exists

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| injury_id | serial | 1 | Auto-increment PK |
| player_id | varchar(50) | "espn-3139477" | FK to players table |
| season | integer | 2025 | Which season injury occurred |
| injury_type | varchar(100) | "Ankle" | Body part/injury category |
| injury_description | text | "Sprained ankle" | Detailed description |
| injury_date | date | "2025-10-15" | When injury occurred |
| return_date | date | "2025-11-05" | When player returned (nullable) |
| games_missed | integer | 3 | Number of games missed |

---

## Expected Data Examples

### Example 1: Active Injury

```json
{
  "injury_id": 1,
  "player_id": "espn-3139477",
  "season": 2025,
  "injury_type": "Hamstring",
  "injury_description": "Strained hamstring, week-to-week",
  "injury_date": "2025-10-20",
  "return_date": null,
  "games_missed": 2
}
```

### Example 2: Recovered Injury

```json
{
  "injury_id": 2,
  "player_id": "espn-4040715",
  "season": 2025,
  "injury_type": "Ankle",
  "injury_description": "Sprained ankle, returned after 3 weeks",
  "injury_date": "2025-09-15",
  "return_date": "2025-10-06",
  "games_missed": 3
}
```

---

## Current Status

**⚠️ TABLE IS EMPTY**

This table exists in the schema but has no data. ESPN API has limited injury report data, and tracking historical injuries would require:
1. Manual data entry
2. Scraping from sports news sites
3. Integration with injury report APIs

---

## Potential Use Cases

### 1. Player Injury History

```javascript
// Get all injuries for a player
const { data: injuries } = await supabase
  .from('player_injuries')
  .select('*')
  .eq('player_id', 'espn-3139477')
  .order('injury_date', { ascending: false })

injuries.forEach(inj => {
  console.log(`${inj.injury_date}: ${inj.injury_type} - ${inj.games_missed} games missed`)
})
```

### 2. Current Season Injuries

```javascript
// Get all injuries for current season
const { data: currentInjuries } = await supabase
  .from('player_injuries')
  .select(`
    *,
    player:players(full_name, primary_position)
  `)
  .eq('season', 2025)
  .is('return_date', null)  // Still injured
  .order('injury_date', { ascending: false })
```

### 3. Team Injury Report

```javascript
// Get injuries for a specific team
const { data: teamPlayers } = await supabase
  .from('player_teams')
  .select('player_id')
  .eq('team_id', 'KC')
  .eq('start_season', 2025)
  .is('end_season', null)

const playerIds = teamPlayers.map(p => p.player_id)

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

### 4. Most Injury-Prone Players

```javascript
// Players with most injuries (career)
const { data: injuries } = await supabase
  .from('player_injuries')
  .select('player_id, player:players(full_name)')

const injuryCounts = injuries.reduce((acc, inj) => {
  acc[inj.player_id] = (acc[inj.player_id] || 0) + 1
  return acc
}, {})

const sorted = Object.entries(injuryCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
```

---

## How to Populate

### Manual Entry

```javascript
await supabase.from('player_injuries').insert({
  player_id: 'espn-3139477',
  season: 2025,
  injury_type: 'Hamstring',
  injury_description: 'Strained hamstring, week-to-week',
  injury_date: '2025-10-20',
  return_date: null,
  games_missed: 2
})
```

### Potential Scraper (Not Implemented)

```javascript
// Hypothetical injuries-scraper.js
async function scrapeInjuries() {
  // ESPN API has limited injury data
  const injuryReports = await fetchESPNInjuryReports()

  const injuries = injuryReports.map(report => ({
    player_id: `espn-${report.playerId}`,
    season: CURRENT_SEASON,
    injury_type: report.injuryType,
    injury_description: report.description,
    injury_date: report.date,
    return_date: report.returnDate || null,
    games_missed: report.gamesMissed || 0
  }))

  await supabase.from('player_injuries').upsert(injuries)
}
```

---

## Frontend Display Examples

### Injury Report Card

```jsx
const InjuryReport = ({ playerId }) => {
  const { data: injuries } = useQuery(() =>
    supabase
      .from('player_injuries')
      .select('*')
      .eq('player_id', playerId)
      .eq('season', 2025)
      .order('injury_date', { ascending: false })
  )

  return (
    <div className="injury-report">
      <h3>Injury History (2025)</h3>
      {injuries?.length === 0 && <p>No injuries this season</p>}
      {injuries?.map(inj => (
        <div key={inj.injury_id} className="injury-item">
          <span className="date">{inj.injury_date}</span>
          <span className="type">{inj.injury_type}</span>
          <span className="desc">{inj.injury_description}</span>
          {inj.return_date ? (
            <span className="status returned">Returned {inj.return_date}</span>
          ) : (
            <span className="status active">Out ({inj.games_missed} games)</span>
          )}
        </div>
      ))}
    </div>
  )
}
```

### Team Injury Summary

```jsx
const TeamInjuryStatus = ({ teamId }) => {
  const { data: injuries } = useQuery(() =>
    supabase
      .from('player_injuries')
      .select(`
        *,
        player:players(full_name, primary_position),
        player_team:player_teams!inner(team_id)
      `)
      .eq('player_team.team_id', teamId)
      .eq('season', 2025)
      .is('return_date', null)
  )

  return (
    <div className="team-injuries">
      <h3>Injury Report</h3>
      <p>{injuries?.length || 0} players currently injured</p>
      <ul>
        {injuries?.map(inj => (
          <li key={inj.injury_id}>
            {inj.player.full_name} ({inj.player.primary_position}) - {inj.injury_type}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## Related Tables

- **players** - Player profiles (FK: player_id)
- **player_teams** - Current team assignments
- **games** - Game schedule (to calculate games_missed)

---

## Known Limitations

### 1. No Automated Data Collection ⚠️

**Issue**: ESPN API has very limited injury report data.

**Impact**: Must manually track injuries or find alternative data source.

**Potential Solutions**:
- Scrape from NFL.com injury reports
- Use Sleeper API (fantasy football)
- Manual entry for key injuries

---

### 2. Historical Data Gap ⚠️

**Issue**: No historical injury data populated.

**Impact**: Can't show injury trends or patterns.

**Solution**: Backfill manually or from external sources.

---

### 3. Injury Status vs. Injury History ⚠️

**Note**: This table tracks injury **history** (past injuries).

For **current injury status** (Out/Doubtful/Questionable), there's a separate concept that could be tracked in a different table or in the `players` table directly.

---

## Documentation Links

- **Migration**: `supabase/migrations/20250101000008_create_game_and_reference_tables.sql` (lines 246-263)
- **Related Tables**: players, player_teams, games

---

## Quick Commands

```bash
# Check if populated
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('player_injuries').select('*', { count: 'exact' }).then(({ count }) => console.log('Injuries:', count));"

# Get injuries for a player
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('player_injuries').select('*').eq('player_id', 'espn-PLAYER_ID').then(({ data }) => console.table(data));"
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 8
**Total Records**: 0 ⚠️ (Expected: 8,000+)
**Status**: ⚠️ Schema exists, no data, no scraper
**CodeRef**: Migration only (no active data collection)
