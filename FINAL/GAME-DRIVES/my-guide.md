# Game Drives - Quick Reference Guide

> **Purpose**: Quick reference for game_drives table
> **Date**: October 22, 2025
> **Status**: ⚠️ EMPTY (No data populated)
> **CodeRef**: Migration 20250101000008:29-50 (no scraper yet)

---

## All 11 Fields (Copy-Paste Ready)

```
drive_id, game_id, season, team_id, drive_number, quarter, start_time_seconds, end_time_seconds, duration_seconds, plays, yards, result
```

---

## Field Categories

### Identification (4 fields)
```
drive_id, game_id, season, team_id
```

### Position (2 fields)
```
drive_number, quarter
```

### Timing (3 fields)
```
start_time_seconds, end_time_seconds, duration_seconds
```

### Stats (2 fields)
```
plays, yards
```

### Outcome (1 field)
```
result
```

---

## SELECT Query String

```sql
drive_id, game_id, season, team_id, drive_number, quarter, start_time_seconds, end_time_seconds, duration_seconds, plays, yards, result, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 11
- **Total Records**: 0 (⚠️ NOT POPULATED)
- **Expected Records**: ~12,240 (for 2025 season)
- **Per Game**: ~40-48 drives
- **Per Team**: ~20-24 drives
- **Data Source**: ESPN Game Summary API
- **Auto-Populated**: ❌ No scraper exists

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| drive_id | bigserial | 1 | Auto-increment PK |
| game_id | varchar(50) | "401772510" | Which game |
| season | integer | 2025 | Which season |
| team_id | varchar(10) | "DAL" | Offensive team (FK) |
| drive_number | integer | 1 | 1st, 2nd, 3rd drive |
| quarter | integer | 1 | 1-4 (5=OT) |
| start_time_seconds | integer | 900 | 15:00 → 900 sec |
| end_time_seconds | integer | 709 | 11:49 → 709 sec |
| duration_seconds | integer | 191 | Real-world time |
| plays | integer | 6 | Number of plays |
| yards | decimal(6,1) | 53.0 | Net yards gained |
| result | varchar(50) | "Touchdown" | How drive ended |

---

## Drive Result Values

### Common Results (with typical frequency)

| Result | Meaning | Frequency |
|--------|---------|-----------|
| "Touchdown" | Scored TD | ~25% |
| "Punt" | Kicked away | ~40% |
| "Field Goal" | Kicked FG | ~15% |
| "Turnover" | INT/Fumble | ~10% |
| "Turnover on Downs" | Failed 4th | ~3% |
| "Missed Field Goal" | FG failed | ~3% |
| "End of Half" | Clock ran out | ~2% |
| "End of Game" | Game ended | ~1% |
| "Blocked Punt" | Punt blocked | ~0.5% |
| "Safety" | Safety scored | ~0.5% |

---

## Expected Data Examples

### Example 1: Touchdown Drive

```json
{
  "drive_id": 1,
  "game_id": "401772510",
  "season": 2025,
  "team_id": "DAL",
  "drive_number": 1,
  "quarter": 1,
  "start_time_seconds": 900,
  "end_time_seconds": 709,
  "duration_seconds": 191,
  "plays": 6,
  "yards": 53.0,
  "result": "Touchdown"
}
```

### Example 2: Three-and-Out (Punt)

```json
{
  "drive_id": 2,
  "game_id": "401772510",
  "season": 2025,
  "team_id": "PHI",
  "drive_number": 2,
  "quarter": 1,
  "start_time_seconds": 649,
  "end_time_seconds": 527,
  "duration_seconds": 84,
  "plays": 3,
  "yards": 2.0,
  "result": "Punt"
}
```

### Example 3: Field Goal Drive

```json
{
  "drive_id": 3,
  "game_id": "401772510",
  "season": 2025,
  "team_id": "DAL",
  "drive_number": 3,
  "quarter": 2,
  "start_time_seconds": 510,
  "end_time_seconds": 123,
  "duration_seconds": 189,
  "plays": 11,
  "yards": 58.0,
  "result": "Field Goal"
}
```

---

## Current Status

**⚠️ TABLE IS EMPTY**

This table exists in the schema but has no data. ESPN API provides drive data in the game summary endpoint, but no scraper has been implemented yet.

**To populate:**
1. Add `extractGameDrives()` function to `game-stats-scraper.js`
2. Parse `drives.previous[]` array from ESPN API
3. Transform clock times to seconds
4. Upsert to database with composite key (game_id + drive_number + team_id)

---

## Common Use Cases

### 1. Get All Drives for a Game

```javascript
const { data: drives } = await supabase
  .from('game_drives')
  .select(`
    *,
    team:teams(team_name, team_abbr)
  `)
  .eq('game_id', '401772510')
  .order('drive_number')

drives.forEach(drive => {
  console.log(`${drive.team.team_abbr}: ${drive.plays} plays, ${drive.yards} yds → ${drive.result}`)
})
```

### 2. Find Scoring Drives

```javascript
const { data: scoringDrives } = await supabase
  .from('game_drives')
  .select('*')
  .eq('game_id', '401772510')
  .in('result', ['Touchdown', 'Field Goal', 'Safety'])
  .order('drive_number')

console.log(`${scoringDrives.length} scoring drives`)
```

### 3. Calculate Team Drive Efficiency

```javascript
const { data: teamDrives } = await supabase
  .from('game_drives')
  .select('*')
  .eq('team_id', 'KC')
  .eq('season', 2025)

const avgPlays = teamDrives.reduce((sum, d) => sum + d.plays, 0) / teamDrives.length
const avgYards = teamDrives.reduce((sum, d) => sum + d.yards, 0) / teamDrives.length
const tdRate = teamDrives.filter(d => d.result === 'Touchdown').length / teamDrives.length

console.log(`KC: ${avgPlays.toFixed(1)} plays, ${avgYards.toFixed(1)} yds/drive`)
console.log(`TD rate: ${(tdRate * 100).toFixed(1)}%`)
```

### 4. Find Longest Drives by Duration

```javascript
const { data: longDrives } = await supabase
  .from('game_drives')
  .select(`
    *,
    team:teams(team_name)
  `)
  .eq('season', 2025)
  .order('duration_seconds', { ascending: false })
  .limit(10)

longDrives.forEach((d, i) => {
  const mins = Math.floor(d.duration_seconds / 60)
  const secs = d.duration_seconds % 60
  console.log(`${i+1}. ${d.team.team_name} - ${mins}:${secs.toString().padStart(2, '0')}`)
})
```

### 5. Red Zone Efficiency

```javascript
// Note: Would need yard line data (not currently stored)
// Could calculate from play_by_play table if needed
```

---

## Clock Time Parsing

### Converting "MM:SS" to Seconds

```javascript
function parseClockToSeconds(clockDisplay) {
  if (!clockDisplay) return null
  const [minutes, seconds] = clockDisplay.split(':').map(Number)
  return (minutes * 60) + seconds
}

parseClockToSeconds("15:00")  // → 900 (start of quarter)
parseClockToSeconds("11:49")  // → 709
parseClockToSeconds("2:00")   // → 120 (2-minute warning)
parseClockToSeconds("0:03")   // → 3 (final seconds)
```

### Converting Seconds to "MM:SS"

```javascript
function secondsToClock(seconds) {
  if (seconds === null) return null
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

secondsToClock(900)  // → "15:00"
secondsToClock(709)  // → "11:49"
secondsToClock(17)   // → "0:17"
```

---

## Frontend Display Examples

### Drive Chart

```jsx
const DriveChart = ({ gameId }) => {
  const { data: drives } = useQuery(() =>
    supabase
      .from('game_drives')
      .select(`
        *,
        team:teams(team_abbr, primary_color)
      `)
      .eq('game_id', gameId)
      .order('drive_number')
  )

  return (
    <div className="drive-chart">
      {drives?.map(drive => (
        <div
          key={drive.drive_id}
          className="drive-bar"
          style={{
            backgroundColor: drive.team.primary_color,
            width: `${Math.min((drive.yards / 100) * 100, 100)}%`
          }}
        >
          <span className="team">{drive.team.team_abbr}</span>
          <span className="stats">
            {drive.plays} plays, {drive.yards} yds
          </span>
          <span className={`result ${drive.result.toLowerCase().replace(/ /g, '-')}`}>
            {drive.result}
          </span>
        </div>
      ))}
    </div>
  )
}
```

### Drive Summary Stats

```jsx
const DriveSummary = ({ teamId, season }) => {
  const { data: drives } = useQuery(() =>
    supabase
      .from('game_drives')
      .select('*')
      .eq('team_id', teamId)
      .eq('season', season)
  )

  const stats = useMemo(() => {
    if (!drives?.length) return null

    return {
      total: drives.length,
      avgPlays: (drives.reduce((sum, d) => sum + d.plays, 0) / drives.length).toFixed(1),
      avgYards: (drives.reduce((sum, d) => sum + d.yards, 0) / drives.length).toFixed(1),
      touchdowns: drives.filter(d => d.result === 'Touchdown').length,
      fieldGoals: drives.filter(d => d.result === 'Field Goal').length,
      punts: drives.filter(d => d.result === 'Punt').length,
      turnovers: drives.filter(d => d.result === 'Turnover').length
    }
  }, [drives])

  if (!stats) return null

  return (
    <div className="drive-summary">
      <h4>Drive Efficiency ({season})</h4>
      <div className="stats-grid">
        <div className="stat">
          <label>Avg Plays:</label>
          <span>{stats.avgPlays}</span>
        </div>
        <div className="stat">
          <label>Avg Yards:</label>
          <span>{stats.avgYards}</span>
        </div>
        <div className="stat">
          <label>TDs:</label>
          <span>{stats.touchdowns} ({((stats.touchdowns / stats.total) * 100).toFixed(1)}%)</span>
        </div>
        <div className="stat">
          <label>FGs:</label>
          <span>{stats.fieldGoals}</span>
        </div>
        <div className="stat">
          <label>Punts:</label>
          <span>{stats.punts}</span>
        </div>
        <div className="stat">
          <label>Turnovers:</label>
          <span>{stats.turnovers}</span>
        </div>
      </div>
    </div>
  )
}
```

---

## Related Tables

- **games** - Game information (FK: game_id)
- **teams** - Team details (FK: team_id)
- **play_by_play** - Individual plays (FK: drive_id)
- **scoring_plays** - Scoring events (related by game_id)

---

## Known Limitations

### 1. No Scraper Implemented ⚠️

**Issue**: Table schema exists but no data collection script.

**Impact**: Table is empty (0 records).

**Solution**: Add `extractGameDrives()` to `game-stats-scraper.js`.

---

### 2. Clock Times Are Game Clock ⚠️

**Issue**: `start_time_seconds` and `end_time_seconds` are game clock (counts down).

**Impact**: Not real-world wall-clock time.

**Note**: `duration_seconds` is real-world elapsed time.

---

### 3. No Yard Line Position Stored ⚠️

**Issue**: Don't track where drive started/ended on field.

**Impact**: Can't calculate red zone efficiency directly.

**Workaround**: Query play_by_play table for detailed position data.

---

## Implementation Checklist

To populate this table, implement:

- [ ] Add `extractGameDrives()` function to `game-stats-scraper.js`
- [ ] Parse `drives.previous[]` from ESPN API
- [ ] Transform clock times ("15:00" → 900 seconds)
- [ ] Normalize team abbreviations (WAS/WSH → WAS)
- [ ] Upsert with composite key (game_id + drive_number + team_id)
- [ ] Add logging for drive count verification
- [ ] Test with sample game (should get ~40-48 drives)

---

## Documentation Links

- **Migration**: `supabase/migrations/20250101000008_create_game_and_reference_tables.sql` (lines 29-50)
- **Field Mapping**: `GAME-DRIVES-RESOURCES/field-mapping-report.md` - All 11 fields documented
- **Raw Data Source**: `GAME-DRIVES-RESOURCES/raw-data-source-mapping.md` - ESPN API structure
- **Related Tables**: games, teams, play_by_play

---

## Quick Commands

```bash
# Check if populated
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('game_drives').select('*', { count: 'exact', head: true }).then(({ count }) => console.log('Drives:', count));"

# Sample ESPN drive data
node -e "const axios = require('axios'); (async () => { const res = await axios.get('https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401772510'); console.log('Total drives:', res.data.drives.previous.length); })();"
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 11
**Total Records**: 0 ⚠️ (Expected: ~12,240 for 2025)
**Status**: ✅ Schema ready, ❌ No scraper
**CodeRef**: Migration 20250101000008:29-50 ✅ Validated
