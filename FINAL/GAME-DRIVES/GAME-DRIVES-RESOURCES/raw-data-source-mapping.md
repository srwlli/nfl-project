# Game Drives - Raw Data Source Mapping

> **Purpose**: Document ESPN API structure for game_drives table
> **Date**: October 22, 2025
> **API Endpoint**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={gameId}`
> **Data Path**: `response.data.drives.previous[]`

---

## ESPN API Endpoint

**Full URL:**
```
https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401772510
```

**Response Path:**
```javascript
const drives = response.data.drives.previous  // Array of drive objects
```

---

## ESPN Drive Object Structure

### Complete Drive Example (Dallas 1st Drive - Touchdown)

```json
{
  "id": "4017725101",
  "description": "6 plays, 53 yards, 3:11",
  "team": {
    "id": "6",
    "name": "Cowboys",
    "abbreviation": "DAL",
    "displayName": "Dallas Cowboys",
    "shortDisplayName": "Cowboys"
  },
  "start": {
    "period": {
      "type": "quarter",
      "number": 1
    },
    "clock": {
      "displayValue": "15:00"
    },
    "yardLine": 53,
    "text": "DAL 47"
  },
  "end": {
    "period": {
      "type": "quarter",
      "number": 1
    },
    "clock": {
      "displayValue": "11:49"
    },
    "yardLine": 0,
    "text": "PHI 0"
  },
  "timeElapsed": {
    "displayValue": "3:11"
  },
  "yards": 53,
  "isScore": true,
  "offensivePlays": 6,
  "result": "TD",
  "shortDisplayResult": "TD",
  "displayResult": "Touchdown",
  "plays": [ /* Array of play objects */ ]
}
```

---

## Field-by-Field Mapping

### ESPN → Database Mapping Table

| ESPN Field | ESPN Type | ESPN Example | Database Column | Database Type | Transform |
|------------|-----------|--------------|-----------------|---------------|-----------|
| `id` | string | "4017725101" | N/A | - | Not stored (ESPN internal ID) |
| `description` | string | "6 plays, 53 yards, 3:11" | N/A | - | Not stored (redundant) |
| `team.id` | string | "6" | N/A | - | Not needed |
| `team.abbreviation` | string | "DAL" | `team_id` | varchar(10) | Normalize via team-normalizer |
| `start.period.number` | integer | 1 | `quarter` | integer | Direct |
| `start.clock.displayValue` | string | "15:00" | `start_time_seconds` | integer | Parse to seconds |
| `end.period.number` | integer | 1 | N/A | - | Not stored (use start quarter) |
| `end.clock.displayValue` | string | "11:49" | `end_time_seconds` | integer | Parse to seconds |
| `timeElapsed.displayValue` | string | "3:11" | `duration_seconds` | integer | Parse to seconds |
| `yards` | integer | 53 | `yards` | decimal(6,1) | Direct |
| `offensivePlays` | integer | 6 | `plays` | integer | Direct |
| `result` | string | "TD" | N/A | - | Use displayResult instead |
| `displayResult` | string | "Touchdown" | `result` | varchar(50) | Direct |
| `isScore` | boolean | true | N/A | - | Not stored (derivable) |

---

## Drive Result Values

### All Possible ESPN Results

| ESPN `result` | ESPN `displayResult` | Database `result` | Frequency |
|---------------|---------------------|-------------------|-----------|
| "TD" | "Touchdown" | "Touchdown" | ~25% |
| "FG" | "Field Goal" | "Field Goal" | ~15% |
| "Punt" | "Punt" | "Punt" | ~40% |
| "Turnover" | "Interception" | "Turnover" | ~5% |
| "Turnover" | "Fumble" | "Turnover" | ~5% |
| "Turnover on Downs" | "Turnover on Downs" | "Turnover on Downs" | ~3% |
| "Missed FG" | "Missed Field Goal" | "Missed Field Goal" | ~3% |
| "End of Half" | "End of Half" | "End of Half" | ~2% |
| "End of Game" | "End of Game" | "End of Game" | ~1% |
| "Blocked Punt" | "Blocked Punt" | "Blocked Punt" | ~0.5% |
| "Safety" | "Safety" | "Safety" | ~0.5% |

---

## Clock Parsing Examples

### Converting ESPN Clock to Seconds

**ESPN Format**: "MM:SS" (minutes:seconds remaining)

**Conversion Formula**:
```javascript
function parseClockToSeconds(clockDisplay) {
  if (!clockDisplay) return null
  const [minutes, seconds] = clockDisplay.split(':').map(Number)
  return (minutes * 60) + seconds
}
```

**Examples:**
```javascript
parseClockToSeconds("15:00")  // → 900 (start of quarter)
parseClockToSeconds("11:49")  // → 709
parseClockToSeconds("2:00")   // → 120 (2-minute warning)
parseClockToSeconds("0:03")   // → 3 (final seconds)
```

### Duration Parsing

**ESPN Format**: "M:SS" (real-world elapsed time)

```javascript
function parseDurationToSeconds(durationDisplay) {
  if (!durationDisplay) return null
  const [minutes, seconds] = durationDisplay.split(':').map(Number)
  return (minutes * 60) + seconds
}
```

**Examples:**
```javascript
parseDurationToSeconds("3:11")   // → 191 seconds
parseDurationToSeconds("8:45")   // → 525 seconds
parseDurationToSeconds("0:17")   // → 17 seconds
```

---

## Drive Position (Yard Line)

### ESPN Yard Line System

ESPN uses **distance to opponent's goal line**:

**Examples:**
- `start.yardLine: 53` → Own 47-yard line (53 yards to opponent's goal)
- `start.text: "DAL 47"` → Dallas's 47-yard line
- `end.yardLine: 0` → Opponent's goal line (touchdown)
- `end.text: "PHI 0"` → Philadelphia's goal line

**Note**: We don't store yard line in game_drives table (available in play_by_play if needed)

---

## Real-World Examples

### Example 1: Touchdown Drive

```json
{
  "team": { "abbreviation": "KC" },
  "start": {
    "period": { "number": 1 },
    "clock": { "displayValue": "10:23" }
  },
  "end": {
    "period": { "number": 1 },
    "clock": { "displayValue": "6:15" }
  },
  "timeElapsed": { "displayValue": "4:08" },
  "offensivePlays": 8,
  "yards": 75,
  "displayResult": "Touchdown"
}
```

**Maps to:**
```json
{
  "team_id": "KC",
  "quarter": 1,
  "start_time_seconds": 623,
  "end_time_seconds": 375,
  "duration_seconds": 248,
  "plays": 8,
  "yards": 75.0,
  "result": "Touchdown"
}
```

---

### Example 2: Three-and-Out (Punt)

```json
{
  "team": { "abbreviation": "NYJ" },
  "start": {
    "period": { "number": 2 },
    "clock": { "displayValue": "8:47" }
  },
  "end": {
    "period": { "number": 2 },
    "clock": { "displayValue": "7:23" }
  },
  "timeElapsed": { "displayValue": "1:24" },
  "offensivePlays": 3,
  "yards": 2,
  "displayResult": "Punt"
}
```

**Maps to:**
```json
{
  "team_id": "NYJ",
  "quarter": 2,
  "start_time_seconds": 527,
  "end_time_seconds": 443,
  "duration_seconds": 84,
  "plays": 3,
  "yards": 2.0,
  "result": "Punt"
}
```

---

### Example 3: Field Goal

```json
{
  "team": { "abbreviation": "SF" },
  "start": {
    "period": { "number": 3 },
    "clock": { "displayValue": "5:12" }
  },
  "end": {
    "period": { "number": 3 },
    "clock": { "displayValue": "2:03" }
  },
  "timeElapsed": { "displayValue": "3:09" },
  "offensivePlays": 11,
  "yards": 58,
  "displayResult": "Field Goal"
}
```

**Maps to:**
```json
{
  "team_id": "SF",
  "quarter": 3,
  "start_time_seconds": 312,
  "end_time_seconds": 123,
  "duration_seconds": 189,
  "plays": 11,
  "yards": 58.0,
  "result": "Field Goal"
}
```

---

### Example 4: Turnover (Interception)

```json
{
  "team": { "abbreviation": "MIA" },
  "start": {
    "period": { "number": 4 },
    "clock": { "displayValue": "12:30" }
  },
  "end": {
    "period": { "number": 4 },
    "clock": { "displayValue": "11:45" }
  },
  "timeElapsed": { "displayValue": "0:45" },
  "offensivePlays": 2,
  "yards": 8,
  "displayResult": "Interception"
}
```

**Maps to:**
```json
{
  "team_id": "MIA",
  "quarter": 4,
  "start_time_seconds": 750,
  "end_time_seconds": 705,
  "duration_seconds": 45,
  "plays": 2,
  "yards": 8.0,
  "result": "Turnover"
}
```

**Note**: Both "Interception" and "Fumble" map to "Turnover" in database.

---

## Edge Cases

### Overtime Drives

```json
{
  "start": {
    "period": { "number": 5 },
    "clock": { "displayValue": "10:00" }
  }
}
```

**Maps to:**
```json
{
  "quarter": 5,
  "start_time_seconds": 600
}
```

**Note**: Quarter 5 = overtime. Some playoff games may have multiple OT periods.

---

### End of Half Drives

```json
{
  "displayResult": "End of Half",
  "offensivePlays": 1,
  "yards": 0
}
```

**Maps to:**
```json
{
  "result": "End of Half",
  "plays": 1,
  "yards": 0.0
}
```

**Common**: Last drive before halftime with no score attempt (kneel).

---

### Negative Yards Drives

```json
{
  "offensivePlays": 3,
  "yards": -8,
  "displayResult": "Punt"
}
```

**Maps to:**
```json
{
  "plays": 3,
  "yards": -8.0,
  "result": "Punt"
}
```

**Caused by**: Sacks, penalties, losses behind line of scrimmage.

---

## API Response Structure

### Full Path to Drives

```javascript
// Complete API call
const response = await axios.get(
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary',
  { params: { event: gameId } }
)

// Access drives array
const allDrives = response.data.drives.previous  // Array of 40-50 drives

// Current drive (if game in progress)
const currentDrive = response.data.drives.current

// Example iteration
allDrives.forEach((drive, index) => {
  console.log(`Drive ${index + 1}: ${drive.team.abbreviation}`)
  console.log(`  ${drive.offensivePlays} plays, ${drive.yards} yards`)
  console.log(`  Result: ${drive.displayResult}`)
})
```

---

## Data Availability

### When ESPN Populates Drive Data

**Available:**
- ✅ After game is final
- ✅ During game (live updates to current drive)
- ✅ Immediately after each drive ends

**Not Available:**
- ❌ Before game starts (scheduled games)
- ❌ For very old games (pre-2010)

**Typical Response:**
- 40-48 drives per game
- Each drive includes 6-15 plays
- Complete data for all completed games

---

## Scraper Implementation Template

```javascript
/**
 * Fetch and transform game drives from ESPN API
 */
async function scrapeGameDrives(gameId, season) {
  try {
    // Fetch game summary
    const response = await axios.get(
      `${ESPN_API_BASE}/summary`,
      { params: { event: gameId } }
    )

    const drives = response.data.drives?.previous || []

    if (drives.length === 0) {
      logger.warn(`No drives found for game ${gameId}`)
      return []
    }

    // Transform drives to database format
    const driveRecords = drives.map((drive, index) => {
      return {
        game_id: gameId,
        season: season,
        team_id: normalizeTeamId(drive.team.abbreviation),
        drive_number: index + 1,
        quarter: drive.start?.period?.number || null,
        start_time_seconds: parseClockToSeconds(drive.start?.clock?.displayValue),
        end_time_seconds: parseClockToSeconds(drive.end?.clock?.displayValue),
        duration_seconds: parseDurationToSeconds(drive.timeElapsed?.displayValue),
        plays: drive.offensivePlays || 0,
        yards: drive.yards || 0,
        result: drive.displayResult || drive.result || null
      }
    })

    logger.info(`✓ Extracted ${driveRecords.length} drives for game ${gameId}`)
    return driveRecords

  } catch (error) {
    logger.error(`Failed to scrape drives for game ${gameId}:`, error.message)
    return []
  }
}
```

---

## Testing Commands

### Fetch Sample Drive Data

```bash
# View first drive from a game
node -e "const axios = require('axios'); (async () => { const res = await axios.get('https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401772510'); console.log(JSON.stringify(res.data.drives.previous[0], null, 2)); })();"

# Count total drives
node -e "const axios = require('axios'); (async () => { const res = await axios.get('https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401772510'); console.log('Total drives:', res.data.drives.previous.length); })();"

# List all drive results
node -e "const axios = require('axios'); (async () => { const res = await axios.get('https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401772510'); res.data.drives.previous.forEach((d, i) => console.log(`${i+1}. ${d.team.abbreviation} - ${d.displayResult}`)); })();"
```

---

## Known ESPN API Quirks

### 1. Inconsistent `result` vs `displayResult`

- Sometimes only `result` is present ("TD", "FG")
- Sometimes only `displayResult` is present ("Touchdown", "Field Goal")
- **Solution**: Prefer `displayResult`, fallback to `result`

### 2. Missing Clock Times

- Rarely, `start.clock` or `end.clock` may be missing
- **Solution**: Calculate from play data or mark as NULL

### 3. Kickoffs vs Offensive Drives

- ESPN includes kickoffs as separate "drives" with 1 play
- **Solution**: Filter or include based on requirements

---

**Last Updated**: October 22, 2025
**API Version**: ESPN v2
**Endpoint**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary`
**Data Format**: JSON
**Authentication**: None required
