# Scoring Plays - Quick Reference Guide

> **Purpose**: Quick reference for scoring_plays table
> **Date**: October 22, 2025
> **Status**: ✅ Complete
> **CodeRef**: `extractScoringPlays:111`

---

## All 10 Fields (Copy-Paste Ready)

```
scoring_play_id, game_id, play_id, season, team_id, quarter, time_remaining_seconds, scoring_type, points, description
```

---

## Field Categories

### Identification (4 fields)
```
scoring_play_id, game_id, play_id, season
```

### Team & Timing (3 fields)
```
team_id, quarter, time_remaining_seconds
```

### Scoring Details (2 fields)
```
scoring_type, points
```

### Description (1 field)
```
description
```

---

## SELECT Query String

```sql
scoring_play_id, game_id, play_id, season, team_id, quarter, time_remaining_seconds, scoring_type, points, description, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 10
- **Total Records**: 917+ (106 completed games)
- **Average Scores/Game**: 8-12
- **Data Source**: ESPN scoringPlays array
- **Auto-Populated**: ✅ Yes (via live-games-scraper → game-stats-scraper)

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| scoring_play_id | serial | 1234 | Auto-increment PK |
| game_id | string | "espn-401772510" | No FK (partitioned) |
| play_id | bigint | 4017725100231 | From ESPN (nullable) |
| season | integer | 2025 | FK to seasons |
| team_id | string | "KC" | FK to teams |
| quarter | integer | 2 | 1-4 (reg), 5 (OT) |
| time_remaining_seconds | integer | 458 | Seconds left in quarter |
| scoring_type | string | "Touchdown" | TD/FG/XP/2PT/Safety |
| points | integer | 7 | Calculated from score delta |
| description | text | "Mahomes 15 yd pass to Kelce" | Play description |

---

## Common Queries

### Get All Scores for a Game (Chronological)
```javascript
const { data } = await supabase
  .from('scoring_plays')
  .select(`
    *,
    team:teams(team_name, team_abbr, logo_url, primary_color)
  `)
  .eq('game_id', 'espn-401772510')
  .order('quarter', { ascending: true })
  .order('time_remaining_seconds', { ascending: false })
```

### Get Team's Scores
```javascript
const { data } = await supabase
  .from('scoring_plays')
  .select('*')
  .eq('team_id', 'KC')
  .eq('season', 2025)
  .order('quarter')
```

### Get Touchdowns Only
```javascript
const { data } = await supabase
  .from('scoring_plays')
  .select('*')
  .eq('game_id', gameId)
  .eq('scoring_type', 'Touchdown')
```

### Get High-Value Scores (6+ points)
```javascript
const { data } = await supabase
  .from('scoring_plays')
  .select('*')
  .eq('game_id', gameId)
  .gte('points', 6)
```

---

## Time Conversion

### Seconds to MM:SS
```javascript
const formatTime = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Usage
formatTime(458)  // "7:38"
formatTime(15)   // "0:15"
formatTime(892)  // "14:52"
```

### MM:SS to Seconds
```javascript
const parseTimeToSeconds = (timeStr) => {
  const [mins, secs] = timeStr.split(':').map(Number)
  return mins * 60 + secs
}

// Usage
parseTimeToSeconds("7:38")  // 458
parseTimeToSeconds("0:15")  // 15
```

---

## Scoring Type Values

| Type | Points | Example Description |
|------|--------|---------------------|
| Touchdown | 6 | "Patrick Mahomes 15 yd pass to Travis Kelce" |
| Field Goal | 3 | "Harrison Butker 47 yd field goal" |
| Extra Point | 1 | "Harrison Butker extra point" |
| Two-Point Conversion | 2 | "Patrick Mahomes pass to Travis Kelce" |
| Safety | 2 | "Tackled in end zone for a Safety" |

---

## Query Patterns

### Scoring Timeline Component
```javascript
const { data: scores } = await supabase
  .from('scoring_plays')
  .select(`
    *,
    team:teams(team_abbr, logo_url, primary_color)
  `)
  .eq('game_id', gameId)
  .order('quarter')
  .order('time_remaining_seconds', { ascending: false })

// Display
scores.forEach(score => {
  const time = formatTime(score.time_remaining_seconds)
  console.log(`Q${score.quarter} ${time} - ${score.team.team_abbr} ${score.scoring_type} (${score.points})`)
})
```

### Scoring Summary by Quarter
```javascript
const { data } = await supabase
  .from('scoring_plays')
  .select('quarter, team_id, points')
  .eq('game_id', gameId)

const byQuarter = data.reduce((acc, play) => {
  if (!acc[play.quarter]) acc[play.quarter] = {}
  if (!acc[play.quarter][play.team_id]) acc[play.quarter][play.team_id] = 0
  acc[play.quarter][play.team_id] += play.points
  return acc
}, {})

// byQuarter = { 1: { KC: 7, DEN: 3 }, 2: { KC: 14, DEN: 7 }, ... }
```

### Team Scoring Breakdown
```javascript
const { data } = await supabase
  .from('scoring_plays')
  .select('team_id, scoring_type, points')
  .eq('game_id', gameId)

const teamStats = data.reduce((acc, play) => {
  if (!acc[play.team_id]) acc[play.team_id] = { TD: 0, FG: 0, XP: 0, total: 0 }

  if (play.scoring_type === 'Touchdown') acc[play.team_id].TD++
  if (play.scoring_type === 'Field Goal') acc[play.team_id].FG++
  if (play.scoring_type === 'Extra Point') acc[play.team_id].XP++

  acc[play.team_id].total += play.points
  return acc
}, {})

// teamStats = { KC: { TD: 3, FG: 1, XP: 3, total: 28 }, ... }
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Forgetting season filter
```javascript
.eq('game_id', gameId)  // Could match multiple seasons
```

### ✅ CORRECT - Include season
```javascript
.eq('game_id', gameId)
.eq('season', 2025)
```

### ❌ WRONG - Using wrong time format
```javascript
.eq('time_remaining', '7:38')  // Stored as seconds!
```

### ✅ CORRECT - Use seconds
```javascript
.lte('time_remaining_seconds', 900)  // Last 15 minutes
```

### ❌ WRONG - Not joining team data
```javascript
.select('team_id')  // Only gets ID
```

### ✅ CORRECT - Join teams
```javascript
.select('*, team:teams(team_name, team_abbr, logo_url)')
```

### ❌ WRONG - Ordering by created_at
```javascript
.order('created_at')  // Not chronological!
```

### ✅ CORRECT - Order by quarter + time
```javascript
.order('quarter', { ascending: true })
.order('time_remaining_seconds', { ascending: false })
```

---

## Scripts in This Folder

### **File**: `scripts/game-stats-scraper.js` (34K)
- **Purpose**: Scrapes complete game data including scoring plays
- **Extraction Function**: `extractScoringPlays` (lines 111-159)
- **Auto-Trigger**: When game status changes to "final"
- **Records Created**: 8-12 per game (varies by total scores)
- **Deletion Strategy**: Deletes existing plays before re-inserting (allows re-scraping)

**Usage**:
```bash
# Scrape specific game
npm run scrape:game-stats -- --game=401772510

# Scrape all games in a week
npm run scrape:game-stats -- --week=7
```

**What It Does**:
1. Fetches game summary from ESPN API
2. Extracts scoringPlays array
3. Calculates points for each play (comparing score deltas)
4. Deletes existing scoring plays for game
5. Inserts new scoring plays
6. Logs success/failure

**Key Code** (lines 111-159):
```javascript
function extractScoringPlays(gameSummary, gameId) {
  const scoringPlays = gameSummary.scoringPlays || []

  return scoringPlays.map((play, index) => {
    // Calculate points from score change (complex logic)
    let points = calculatePoints(play, index, scoringPlays)

    return {
      game_id: `espn-${gameId}`,
      play_id: play.id ? parseInt(play.id) : null,
      season: SEASON_YEAR,
      team_id: play.team?.abbreviation || 'UNK',
      quarter: play.period?.number || 1,
      time_remaining_seconds: parseClockToSeconds(play.clock?.displayValue),
      scoring_type: play.type?.text || 'unknown',
      points: points,
      description: play.text || ''
    }
  })
}
```

---

## Related Tables

### Join with Teams
```javascript
.select('*, team:teams(team_name, team_abbr, logo_url, primary_color)')
```

### Join with Games
```javascript
.select(`
  *,
  game:games(game_date, home_team_id, away_team_id, home_score, away_score)
`)
```

### Join with Play-by-Play (when play_id exists)
```javascript
.select(`
  *,
  play:play_by_play(epa, wpa, play_description)
`)
.not('play_id', 'is', null)
```

---

## Frontend Display Examples

### Scoring Timeline Component
```jsx
const ScoringTimeline = ({ gameId }) => {
  const { data: scores } = useQuery(/* query above */)

  return (
    <div className="scoring-timeline">
      {scores?.map(score => (
        <div key={score.scoring_play_id} className="score-event">
          <div className="quarter-badge">Q{score.quarter}</div>
          <div className="time">{formatTime(score.time_remaining_seconds)}</div>
          <div className="team-logo">
            <img src={score.team.logo_url} alt={score.team.team_abbr} />
          </div>
          <div className="score-details">
            <div className="type">{score.scoring_type} ({score.points})</div>
            <div className="description">{score.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Validation Queries

### Check Data Completeness
```sql
-- Should have ~8-12 scores per completed game
SELECT
  COUNT(DISTINCT game_id) as games_with_scores,
  COUNT(*) as total_scores,
  ROUND(COUNT(*)::decimal / COUNT(DISTINCT game_id), 1) as avg_per_game
FROM scoring_plays
WHERE season = 2025;
```

### Find Games with No Scoring Plays
```sql
SELECT
  g.game_id,
  g.week,
  g.home_team_id,
  g.away_team_id,
  g.home_score,
  g.away_score
FROM games g
LEFT JOIN scoring_plays sp
  ON g.game_id = sp.game_id
WHERE g.season = 2025
  AND g.status = 'final'
  AND sp.scoring_play_id IS NULL;
```

### Verify Points Sum to Final Score
```sql
SELECT
  sp.game_id,
  g.home_team_id,
  g.away_team_id,
  g.home_score as actual_home_score,
  g.away_score as actual_away_score,
  SUM(CASE WHEN sp.team_id = g.home_team_id THEN sp.points ELSE 0 END) as calculated_home,
  SUM(CASE WHEN sp.team_id = g.away_team_id THEN sp.points ELSE 0 END) as calculated_away
FROM scoring_plays sp
JOIN games g ON sp.game_id = g.game_id AND sp.season = g.season
WHERE sp.season = 2025
GROUP BY sp.game_id, g.home_team_id, g.away_team_id, g.home_score, g.away_score
HAVING
  SUM(CASE WHEN sp.team_id = g.home_team_id THEN sp.points ELSE 0 END) != g.home_score
  OR SUM(CASE WHEN sp.team_id = g.away_team_id THEN sp.points ELSE 0 END) != g.away_score;
```

---

## Testing & Debugging

### Test Single Game Extraction
```bash
# Extract scoring plays for completed game
npm run scrape:game-stats -- --game=401772510

# Check database
node -e "
const { getSupabaseClient } = require('./scripts/utils/supabase-client.js');
const supabase = getSupabaseClient();
supabase.from('scoring_plays')
  .select('*')
  .eq('game_id', 'espn-401772510')
  .then(({ data }) => console.log(JSON.stringify(data, null, 2)));
"
```

### Debug ESPN API Response
```bash
# Fetch raw ESPN data
curl "https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401772510" \
  | jq '.scoringPlays'
```

---

## Documentation Links

- **Field Mapping**: `SCORING-PLAYS-RESOURCES/field-mapping-report.md` - All 10 fields documented
- **Raw Data Sources**: `SCORING-PLAYS-RESOURCES/raw-data-source-mapping.md` - ESPN API mappings
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000008_create_game_and_reference_tables.sql` (lines 99-119)
- **CodeRef**: extractScoringPlays at game-stats-scraper.js:111

---

## Quick Commands

```bash
# Extract scoring plays for one game
npm run scrape:game-stats -- --game=401772510

# Extract for all games in week 7
npm run scrape:game-stats -- --week=7

# Check data completeness
node scripts/validate-data-completeness.js

# View live scoreboard
npm run scoreboard
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 10
**Total Records**: 917+ (106 completed games × ~8-12 scores)
**Status**: ✅ Production Ready
**CodeRef**: extractScoringPlays:111 ✅ Validated
