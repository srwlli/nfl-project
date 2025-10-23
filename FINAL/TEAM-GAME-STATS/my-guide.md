# Team Game Stats - Quick Reference Guide

> **Purpose**: Quick reference for team_game_stats table with all 13 fields
> **Date**: October 22, 2025
> **Status**: ✅ Complete

---

## All 13 Fields (Copy-Paste Ready)

```
team_game_stat_id, team_id, game_id, season, is_home, points_scored, points_allowed, total_yards, total_yards_allowed, turnovers, turnovers_forced, time_of_possession_seconds, created_at, updated_at, deleted_at
```

---

## Field Categories

### Identification (4 fields)
```
team_game_stat_id, team_id, game_id, season
```

### Game Context (1 field)
```
is_home
```

### Scoring (2 fields)
```
points_scored, points_allowed
```

### Offensive Performance (2 fields)
```
total_yards, total_yards_allowed
```

### Turnovers (2 fields)
```
turnovers, turnovers_forced
```

### Possession (1 field)
```
time_of_possession_seconds
```

### Metadata (3 fields)
```
created_at, updated_at, deleted_at
```

---

## SELECT Query String

```sql
team_game_stat_id, team_id, game_id, season, is_home, points_scored, points_allowed, total_yards, total_yards_allowed, turnovers, turnovers_forced, time_of_possession_seconds, created_at, updated_at, deleted_at
```

---

## Supabase Select (with team join)

```javascript
const { data } = await supabase
  .from('team_game_stats')
  .select(`
    *,
    team:teams(team_id, team_name, team_abbr, logo_url)
  `)
  .eq('game_id', gameId)
  .eq('season', 2025)
  .order('is_home', { ascending: false })
```

---

## Quick Stats

- **Total Columns**: 13
- **Total Records**: 212+ (106 completed games × 2 teams)
- **Data Source**: ESPN boxscore team statistics
- **Auto-Populated**: Via game-stats-scraper.js when games complete
- **Updated**: Real-time via live-games-scraper.js

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| team_game_stat_id | integer | 1234 | Auto-increment |
| team_id | string | "PIT" | FK to teams |
| game_id | string | "espn-401772510" | No FK (partitioned) |
| season | integer | 2025 | FK to seasons |
| is_home | boolean | true | Home/away flag |
| points_scored | integer | 28 | Team's score |
| points_allowed | integer | 24 | Opponent's score |
| total_yards | decimal | 385.0 | Offensive yards |
| total_yards_allowed | decimal | 342.0 | Defensive yards (⚠️ always 0) |
| turnovers | integer | 2 | INTs + fumbles lost |
| turnovers_forced | integer | 1 | INTs + fumbles rec (⚠️ always 0) |
| time_of_possession_seconds | integer | 1845 | 30:45 in seconds |
| created_at | timestamp | "2025-10-20T16:30:00Z" | Auto |
| updated_at | timestamp | "2025-10-20T16:30:00Z" | Auto |
| deleted_at | timestamp | null | Soft delete |

---

## Common Queries

### Get Both Teams' Stats for Game
```javascript
const { data } = await supabase
  .from('team_game_stats')
  .select(`
    *,
    team:teams(team_name, team_abbr, logo_url)
  `)
  .eq('game_id', 'espn-401772510')
  .eq('season', 2025)
  .order('is_home', { ascending: false })

const [homeTeam, awayTeam] = data
```

### Get Team's Game-by-Game Stats
```javascript
const { data } = await supabase
  .from('team_game_stats')
  .select(`
    *,
    games!inner(week, game_date, home_team_id, away_team_id, status)
  `)
  .eq('team_id', 'PIT')
  .eq('season', 2025)
  .order('games(week)')
```

### Calculate Season Totals
```javascript
const { data } = await supabase
  .from('team_game_stats')
  .select('*')
  .eq('team_id', 'PIT')
  .eq('season', 2025)

const totals = data.reduce((acc, game) => ({
  games: acc.games + 1,
  points_scored: acc.points_scored + game.points_scored,
  points_allowed: acc.points_allowed + game.points_allowed,
  total_yards: acc.total_yards + game.total_yards,
  turnovers: acc.turnovers + game.turnovers
}), { games: 0, points_scored: 0, points_allowed: 0, total_yards: 0, turnovers: 0 })
```

### Get Team Win/Loss Record
```javascript
const { data } = await supabase
  .from('team_game_stats')
  .select('*')
  .eq('team_id', 'PIT')
  .eq('season', 2025)

const record = data.reduce((acc, game) => {
  if (game.points_scored > game.points_allowed) acc.wins++
  else if (game.points_scored < game.points_allowed) acc.losses++
  else acc.ties++
  return acc
}, { wins: 0, losses: 0, ties: 0 })
```

---

## Scripts in This Folder

### **File**: `scripts/game-stats-scraper.js` (34K)
- **Purpose**: Extract and store team game statistics
- **Data Source**: ESPN Game Summary API
- **Extraction Function**: `extractTeamStats(gameSummary, gameId)` (lines 44-93)
- **Records Created**: 2 per game (home + away)
- **Auto-Triggered**: By live-games-scraper.js when game completes
- **Usage**:
  ```bash
  # Single game
  node coderef/FINAL/TEAM-GAME-STATS/scripts/game-stats-scraper.js --game=401772510
  npm run scrape:game-stats -- --game=401772510

  # All games for a week
  node coderef/FINAL/TEAM-GAME-STATS/scripts/game-stats-scraper.js --week=7
  npm run scrape:game-stats -- --week=7

  # With verbose logging
  npm run scrape:game-stats -- --game=401772510 --verbose
  ```

**What It Does**:
1. Fetches game summary from ESPN API
2. Extracts boxscore team statistics
3. Parses scores, yards, turnovers, possession time
4. Upserts 2 records (home + away) to database
5. Handles missing data gracefully (returns 0 or null)

**Key Code Section** (lines 44-93):
```javascript
function extractTeamStats(gameSummary, gameId) {
  const boxscore = gameSummary.boxscore

  return boxscore.teams.map(teamData => {
    const stats = teamData.statistics || []
    const statMap = {}

    // Convert array to key-value map
    stats.forEach(stat => {
      statMap[stat.name] = stat.displayValue || stat.value
    })

    return {
      team_id: teamData.team.abbreviation,
      game_id: `espn-${gameId}`,
      season: SEASON_YEAR,
      is_home: isHome,
      points_scored: teamCompetitor?.score ? parseInt(teamCompetitor.score) : 0,
      points_allowed: opponentCompetitor?.score ? parseInt(opponentCompetitor.score) : 0,
      total_yards: parseNumber(statMap.totalYards),
      total_yards_allowed: 0, // Known limitation
      turnovers: parseNumber(statMap.turnovers),
      turnovers_forced: 0, // Known limitation
      time_of_possession_seconds: parseTimeToSeconds(statMap.possessionTime)
    }
  })
}
```

---

## Time of Possession Conversion

### Database Storage
- **Format**: Integer (total seconds)
- **Example**: `1845` = 30 minutes 45 seconds

### Display Conversion
```javascript
// Convert seconds to MM:SS
const formatTimeOfPossession = (seconds) => {
  if (!seconds) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Usage
formatTimeOfPossession(1845)  // "30:45"
formatTimeOfPossession(1530)  // "25:30"
formatTimeOfPossession(null)  // "00:00"
```

### ESPN → Database Conversion
```javascript
// Convert MM:SS to seconds (for storage)
const parseTimeToSeconds = (timeStr) => {
  if (!timeStr || timeStr === '-') return null
  const [minutes, seconds] = timeStr.split(':').map(Number)
  return minutes * 60 + seconds
}

// Usage
parseTimeToSeconds("30:45")  // 1845
parseTimeToSeconds("25:30")  // 1530
parseTimeToSeconds("-")      // null
```

---

## Stat Calculations

### Points Differential
```javascript
const pointDiff = team.points_scored - team.points_allowed
// Positive = winning, Negative = losing
```

### Yards Differential (when yards_allowed implemented)
```javascript
const yardsDiff = team.total_yards - team.total_yards_allowed
// Positive = outgaining opponent
```

### Turnover Differential (when turnovers_forced implemented)
```javascript
const turnoverDiff = team.turnovers_forced - team.turnovers
// Positive = forcing more than committing
```

### Yards Per Point
```javascript
const yardsPerPoint = team.total_yards / team.points_scored
// Lower = more efficient offense
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Forgetting season filter
```javascript
.eq('game_id', gameId)  // Could match multiple seasons
```

### ✅ CORRECT - Always include season
```javascript
.eq('game_id', gameId)
.eq('season', 2025)
```

### ❌ WRONG - Not joining team data
```javascript
.select('team_id')  // Only gets ID, not team name
```

### ✅ CORRECT - Join team information
```javascript
.select('*, team:teams(team_name, team_abbr, logo_url)')
```

### ❌ WRONG - Using team_game_stats for season totals
```javascript
.from('team_game_stats')  // Game-by-game data
```

### ✅ CORRECT - Use season stats table
```javascript
.from('team_season_stats')  // Pre-aggregated season totals
```

### ❌ WRONG - Not handling time_of_possession NULL
```javascript
.order('time_of_possession_seconds')  // NULL values will sort unexpectedly
```

### ✅ CORRECT - Filter NULLs or handle in application
```javascript
.not('time_of_possession_seconds', 'is', null)
.order('time_of_possession_seconds')
```

---

## Known Limitations

### 1. total_yards_allowed Always 0
**Issue**: Currently hardcoded to 0 in extraction
**Reason**: Requires opponent lookup after both teams extracted
**Workaround**: Calculate manually:
```javascript
// After fetching both teams for a game
const [homeTeam, awayTeam] = teamStats
homeTeam.total_yards_allowed = awayTeam.total_yards
awayTeam.total_yards_allowed = homeTeam.total_yards
```

### 2. turnovers_forced Always 0
**Issue**: Currently hardcoded to 0 in extraction
**Reason**: Requires opponent lookup after both teams extracted
**Workaround**: Calculate manually:
```javascript
// After fetching both teams for a game
const [homeTeam, awayTeam] = teamStats
homeTeam.turnovers_forced = awayTeam.turnovers
awayTeam.turnovers_forced = homeTeam.turnovers
```

---

## Related Tables

### Join with teams
```javascript
.select('*, team:teams(team_name, team_abbr, logo_url)')
```

### Join with games
```javascript
.select('*, games!inner(week, game_date, status)')
```

### Join with player_game_stats
```javascript
// Get team + player stats for same game
const teamStats = await supabase
  .from('team_game_stats')
  .select('*')
  .eq('game_id', gameId)
  .eq('season', 2025)

const playerStats = await supabase
  .from('player_game_stats')
  .select('*')
  .eq('game_id', gameId)
  .eq('season', 2025)
```

### Compare to team_season_stats
```javascript
// Game performance vs season average
const gameStats = await supabase
  .from('team_game_stats')
  .select('*')
  .eq('game_id', gameId)
  .eq('team_id', teamId)
  .single()

const seasonStats = await supabase
  .from('team_season_stats')
  .select('*')
  .eq('team_id', teamId)
  .eq('season', 2025)
  .single()

const yardsAboveAvg = gameStats.total_yards - (seasonStats.total_yards / seasonStats.games_played)
```

---

## Query Performance Tips

### Use Indexes
The table has these indexes:
- `idx_team_game_stats_team` - Lookup by team and season
- `idx_team_game_stats_game` - Lookup by game

### Efficient Queries
```javascript
// ✅ GOOD - Uses idx_team_game_stats_team
.eq('team_id', 'PIT')
.eq('season', 2025)

// ✅ GOOD - Uses idx_team_game_stats_game
.eq('game_id', 'espn-401772510')

// ⚠️ OKAY - Full table scan
.gt('total_yards', 400)  // Not indexed
```

---

## Validation Queries

### Check Data Completeness
```sql
-- Should match: team_stats = completed_games × 2
SELECT
  (SELECT COUNT(*) FROM games WHERE season = 2025 AND status = 'final') AS completed_games,
  (SELECT COUNT(*) FROM team_game_stats WHERE season = 2025) AS team_stats,
  (SELECT COUNT(*) FROM team_game_stats WHERE season = 2025) / 2 AS expected_games;
```

### Find Missing Stats
```sql
-- Games with no team stats
SELECT
  g.game_id,
  g.week,
  g.game_date,
  g.home_team_id,
  g.away_team_id
FROM games g
LEFT JOIN team_game_stats tgs
  ON g.game_id = tgs.game_id AND g.season = tgs.season
WHERE g.season = 2025
  AND g.status = 'final'
  AND tgs.team_game_stat_id IS NULL;
```

### Check Data Quality
```sql
-- Find outliers
SELECT
  tgs.*,
  t.team_name
FROM team_game_stats tgs
JOIN teams t ON tgs.team_id = t.team_id
WHERE tgs.season = 2025
  AND (
    tgs.total_yards > 600  -- Unusually high
    OR tgs.turnovers > 5   -- Many turnovers
    OR tgs.time_of_possession_seconds > 2400  -- > 40 minutes impossible
  );
```

---

## Frontend Display Examples

### Game Comparison Widget
```javascript
const { data: teamStats } = await supabase
  .from('team_game_stats')
  .select(`
    *,
    team:teams(team_name, team_abbr, logo_url)
  `)
  .eq('game_id', gameId)
  .eq('season', 2025)

const [homeTeam, awayTeam] = teamStats.sort((a, b) => b.is_home - a.is_home)

// Display side-by-side comparison
<div className="game-comparison">
  <TeamStats team={homeTeam} />
  <TeamStats team={awayTeam} />
</div>
```

### Team Game Log Table
```javascript
const { data: gameLog } = await supabase
  .from('team_game_stats')
  .select(`
    *,
    games!inner(week, game_date, home_team_id, away_team_id)
  `)
  .eq('team_id', teamId)
  .eq('season', 2025)
  .order('games(week)')

// Display as table
gameLog.map(game => ({
  week: game.games.week,
  opponent: game.is_home ? game.games.away_team_id : game.games.home_team_id,
  result: game.points_scored > game.points_allowed ? 'W' : 'L',
  score: `${game.points_scored}-${game.points_allowed}`,
  yards: game.total_yards,
  turnovers: game.turnovers,
  possession: formatTimeOfPossession(game.time_of_possession_seconds)
}))
```

---

## Testing & Debugging

### Test Single Game Extraction
```bash
# Extract stats for completed game
npm run scrape:game-stats -- --game=401772510

# Check database
node -e "
const { getSupabaseClient } = require('./scripts/utils/supabase-client.js');
const supabase = getSupabaseClient();
supabase.from('team_game_stats')
  .select('*')
  .eq('game_id', 'espn-401772510')
  .then(({ data }) => console.log(data));
"
```

### Debug ESPN API Response
```bash
# Fetch raw ESPN data
curl "https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401772510" \
  | jq '.boxscore.teams[].statistics'
```

### Verify Transformation
```bash
# Run scraper with verbose logging
DEBUG=* npm run scrape:game-stats -- --game=401772510
```

---

## Automation Details

### Auto-Population Flow
1. **live-games-scraper.js** runs every 30 seconds during game windows
2. Detects when game status changes to "final"
3. Automatically triggers **game-stats-scraper.js** for completed game
4. game-stats-scraper extracts team stats (+ player stats + scoring plays)
5. Upserts 2 records to team_game_stats table (home + away)

### Schedule
- **Live games**: Every 30s on game days (Thu/Sun/Mon + late-season Sat)
- **Game stats**: Triggered automatically when games complete
- **Manual**: Can run anytime with `npm run scrape:game-stats -- --week=X`

---

## Documentation Links

- **Field Mapping**: `TEAM-GAME-STATS-RESOURCES/field-mapping-report.md` - All 13 fields documented
- **Raw Data Sources**: `TEAM-GAME-STATS-RESOURCES/raw-data-source-mapping.md` - ESPN API mappings
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000007_create_team_stats_tables.sql` - Table creation
- **Main Docs**: `CLAUDE.md` - Full project documentation

---

## Quick Commands

```bash
# Extract stats for one game
npm run scrape:game-stats -- --game=401772510

# Extract stats for all games in week 7
npm run scrape:game-stats -- --week=7

# Check data completeness
node scripts/validate-data-completeness.js

# View live scoreboard
npm run scoreboard

# Generate comprehensive showcase
node scripts/generate-comprehensive-index.js
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 13
**Total Records**: 212+ (106 completed games × 2 teams)
**Status**: ✅ Production Ready
