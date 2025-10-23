# Player Game Stats Table - Quick Reference Guide

> **Purpose**: Fast reference for player_game_stats fields and queries
> **Table**: `player_game_stats`
> **Records**: 6,842+ entries (from 106 completed games)
> **Auto-Populated**: ✅ Yes (via live-games-scraper → game-stats-scraper)
> **⚠️ CRITICAL**: Missing `position` field - requires JOIN workaround (see below)

---

## ⚠️ CRITICAL: Missing Position Field

**The `position` field does NOT exist in this table!**

If you need position data, you MUST JOIN with either:
- `players.primary_position` (player's main position)
- `game_rosters.position` (position for specific game)

See "Position Workaround" section below for examples.

---

## Quick Field List (Copy-Paste Ready)

### All 66 Fields (NOT 75)
```
player_id, game_id, season, team_id, opponent_team_id, started,
passing_attempts, passing_completions, passing_yards, passing_touchdowns, passing_interceptions,
passing_sacks, passing_sack_yards, passing_rating, passing_qbr, passing_completion_percentage,
passing_yards_per_attempt, passing_first_downs, passing_long, passing_two_point_conversions,
rushing_attempts, rushing_yards, rushing_touchdowns, rushing_long, rushing_yards_per_attempt,
rushing_first_downs, rushing_fumbles, rushing_fumbles_lost, rushing_two_point_conversions,
receiving_targets, receptions, receiving_yards, receiving_touchdowns, receiving_long,
receiving_yards_per_reception, receiving_first_downs, receiving_fumbles, receiving_fumbles_lost,
receiving_yards_after_catch, receiving_two_point_conversions,
defensive_tackles, defensive_solo_tackles, defensive_assists, defensive_sacks,
defensive_tackles_for_loss, defensive_qb_hits, defensive_interceptions, defensive_interception_yards,
defensive_interception_touchdowns, defensive_passes_defended, defensive_fumbles_forced,
defensive_fumbles_recovered, defensive_fumble_return_yards, defensive_fumble_return_touchdowns,
defensive_safeties,
kicking_field_goals_made, kicking_field_goals_attempted, kicking_field_goal_percentage, kicking_long,
kicking_extra_points_made, kicking_extra_points_attempted,
punting_punts, punting_yards, punting_average, punting_long, punting_inside_20, punting_touchbacks,
kick_return_returns, kick_return_yards, kick_return_average, kick_return_long, kick_return_touchdowns,
punt_return_returns, punt_return_yards, punt_return_average, punt_return_long, punt_return_touchdowns,
fantasy_points_standard, fantasy_points_ppr, fantasy_points_half_ppr, fantasy_points_dynasty, fantasy_points_superflex,
updated_at
```

### Identification Fields (5 fields)
```
player_id, game_id, season, team_id, position
```

### Passing Stats (14 fields)
```
passing_attempts, passing_completions, passing_yards, passing_touchdowns, passing_interceptions,
passing_sacks, passing_sack_yards, passing_rating, passing_qbr, passing_completion_percentage,
passing_yards_per_attempt, passing_first_downs, passing_long, passing_two_point_conversions
```

### Rushing Stats (9 fields)
```
rushing_attempts, rushing_yards, rushing_touchdowns, rushing_long, rushing_yards_per_attempt,
rushing_first_downs, rushing_fumbles, rushing_fumbles_lost, rushing_two_point_conversions
```

### Receiving Stats (11 fields)
```
receiving_targets, receptions, receiving_yards, receiving_touchdowns, receiving_long,
receiving_yards_per_reception, receiving_first_downs, receiving_fumbles, receiving_fumbles_lost,
receiving_yards_after_catch, receiving_two_point_conversions
```

### Defensive Stats (15 fields)
```
defensive_tackles, defensive_solo_tackles, defensive_assists, defensive_sacks,
defensive_tackles_for_loss, defensive_qb_hits, defensive_interceptions, defensive_interception_yards,
defensive_interception_touchdowns, defensive_passes_defended, defensive_fumbles_forced,
defensive_fumbles_recovered, defensive_fumble_return_yards, defensive_fumble_return_touchdowns,
defensive_safeties
```

### Kicking Stats (6 fields)
```
kicking_field_goals_made, kicking_field_goals_attempted, kicking_field_goal_percentage, kicking_long,
kicking_extra_points_made, kicking_extra_points_attempted
```

### Punting Stats (6 fields)
```
punting_punts, punting_yards, punting_average, punting_long, punting_inside_20, punting_touchbacks
```

### Return Stats (10 fields)
```
kick_return_returns, kick_return_yards, kick_return_average, kick_return_long, kick_return_touchdowns,
punt_return_returns, punt_return_yards, punt_return_average, punt_return_long, punt_return_touchdowns
```

### Fantasy Points (5 fields)
```
fantasy_points_standard, fantasy_points_ppr, fantasy_points_half_ppr, fantasy_points_dynasty, fantasy_points_superflex
```

---

## Quick Query Strings

### Select All Fields
```sql
player_id, game_id, season, team_id, position,
passing_attempts, passing_completions, passing_yards, passing_touchdowns, passing_interceptions,
passing_sacks, passing_sack_yards, passing_rating, passing_qbr, passing_completion_percentage,
passing_yards_per_attempt, passing_first_downs, passing_long, passing_two_point_conversions,
rushing_attempts, rushing_yards, rushing_touchdowns, rushing_long, rushing_yards_per_attempt,
rushing_first_downs, rushing_fumbles, rushing_fumbles_lost, rushing_two_point_conversions,
receiving_targets, receptions, receiving_yards, receiving_touchdowns, receiving_long,
receiving_yards_per_reception, receiving_first_downs, receiving_fumbles, receiving_fumbles_lost,
receiving_yards_after_catch, receiving_two_point_conversions,
defensive_tackles, defensive_solo_tackles, defensive_assists, defensive_sacks,
defensive_tackles_for_loss, defensive_qb_hits, defensive_interceptions, defensive_interception_yards,
defensive_interception_touchdowns, defensive_passes_defended, defensive_fumbles_forced,
defensive_fumbles_recovered, defensive_fumble_return_yards, defensive_fumble_return_touchdowns,
defensive_safeties,
kicking_field_goals_made, kicking_field_goals_attempted, kicking_field_goal_percentage, kicking_long,
kicking_extra_points_made, kicking_extra_points_attempted,
punting_punts, punting_yards, punting_average, punting_long, punting_inside_20, punting_touchbacks,
kick_return_returns, kick_return_yards, kick_return_average, kick_return_long, kick_return_touchdowns,
punt_return_returns, punt_return_yards, punt_return_average, punt_return_long, punt_return_touchdowns,
fantasy_points_standard, fantasy_points_ppr, fantasy_points_half_ppr, fantasy_points_dynasty, fantasy_points_superflex,
updated_at
```

### Select QB Stats
```sql
player_id, passing_attempts, passing_completions, passing_yards, passing_touchdowns,
passing_interceptions, passing_rating, passing_qbr, fantasy_points_ppr
```

### Select RB Stats
```sql
player_id, rushing_attempts, rushing_yards, rushing_touchdowns,
receptions, receiving_yards, receiving_touchdowns, fantasy_points_ppr
```

### Select WR/TE Stats
```sql
player_id, receiving_targets, receptions, receiving_yards, receiving_touchdowns,
receiving_long, fantasy_points_ppr
```

### Select Defensive Stats
```sql
player_id, defensive_tackles, defensive_solo_tackles, defensive_sacks,
defensive_interceptions, defensive_passes_defended, defensive_fumbles_forced
```

### Select Kicker Stats
```sql
player_id, kicking_field_goals_made, kicking_field_goals_attempted, kicking_field_goal_percentage,
kicking_extra_points_made, kicking_extra_points_attempted
```

---

## Critical Field Names ⚠️

### Correct Names (Use These)
- ✅ `receptions` - **NOT** "receiving_receptions"
- ❌ ~~`position`~~ - **DOES NOT EXIST** (see Position Workaround below)
- ✅ `fantasy_points_ppr` - Full PPR scoring
- ✅ `passer_rating` - Official passer rating
- ✅ `qbr` - ESPN's QBR metric

### Common Mistakes (Don't Use These)
- ❌ `receiving_receptions` - Wrong (use `receptions`)
- ❌ `position` - **DOES NOT EXIST** (use JOIN)
- ❌ `tackles` - Wrong (use `tackles_total`)
- ❌ `sacks` - Ambiguous (use `passing_sacks` or `sacks` for defense)

---

## Position Workaround

Since `position` field doesn't exist in `player_game_stats`, use these patterns:

### Get Position from Players Table (Recommended)
```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    *,
    player:players!inner(primary_position)
  `)
  .eq('game_id', 'espn-401772510')
  .eq('player.primary_position', 'QB')
```

### Get Position from Game Rosters
```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    *,
    roster:game_rosters!inner(position)
  `)
  .eq('game_id', 'espn-401772510')
  .eq('roster.position', 'WR')
```

### Get All Positions with Stats
```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    *,
    player:players(full_name, primary_position)
  `)
  .eq('game_id', 'espn-401772510')
  .gt('fantasy_points_ppr', 10)

// Then filter in JS
const qbs = data.filter(p => p.player.primary_position === 'QB')
const rbs = data.filter(p => p.player.primary_position === 'RB')
const wrs = data.filter(p => p.player.primary_position === 'WR')
```

---

## Scripts in This Folder

### Scrapers
**File**: `scripts/game-stats-scraper.js` (34K)
- **Purpose**: Scrapes complete game data including all player stats
- **Auto-Trigger**: When game status changes to "final"
- **Extracts**: All 75 columns from ESPN API
- **Fantasy Points**: Calculates all 5 fantasy formats
- **Usage**:
  ```bash
  # Scrape specific game
  node coderef/FINAL/PLAYER-GAME-STATS/scripts/game-stats-scraper.js --game=401772510

  # Scrape all games in a week
  node coderef/FINAL/PLAYER-GAME-STATS/scripts/game-stats-scraper.js --week=7

  # NPM shortcut
  npm run scrape:game-stats -- --game=401772510
  ```

### Performance Floors Calculator
**File**: `scripts/calculate-performance-floors.js` (38K)
- **Purpose**: Statistical projections for conservative baseline player performance
- **Uses**: All player_game_stats columns
- **Calculations**:
  - Rolling averages (last 3-5 games by position)
  - Opponent defensive efficiency adjustments
  - Environment modifiers (turf, dome, weather)
  - Percentile-based floors (15th percentile)
  - Floor/Expected/Ceiling projections
- **Usage**:
  ```bash
  # Calculate floors for a specific week
  node coderef/FINAL/PLAYER-GAME-STATS/scripts/calculate-performance-floors.js --week=7

  # Calculate floors for a specific game
  node coderef/FINAL/PLAYER-GAME-STATS/scripts/calculate-performance-floors.js --game=espn-401772816

  # NPM shortcut
  npm run floors -- --week=7
  ```

### Props Calculator
**File**: `scripts/calculate-performance-floors-props.js` (11K)
- **Purpose**: Betting props format (Pass Yds, Rush Yds, Rec Yds, Receptions, TDs)
- **Displays**: Individual stat lines with floor/expected/ceiling
- **Usage**:
  ```bash
  # Generate props for a specific week
  node coderef/FINAL/PLAYER-GAME-STATS/scripts/calculate-performance-floors-props.js --week=7

  # NPM shortcut
  npm run floors:props -- --week=7
  ```

### Weekly Aggregation
**File**: `scripts/weekly-aggregation.js` (15K)
- **Purpose**: Calculate top performers and cumulative season stats
- **Generates**:
  - Weekly Leaderboards: Top 10 per category (12 categories)
  - Season Cumulative: Running totals for all 1,516+ players
  - Pace Projections: 17-game projections
- **Usage**:
  ```bash
  # Run weekly aggregation
  node coderef/FINAL/PLAYER-GAME-STATS/scripts/weekly-aggregation.js --week=7

  # NPM shortcut
  npm run aggregate:weekly -- --week=7
  ```

### Utilities
**File**: `utils/fantasy-calculator.js` (5K)
- **Purpose**: Calculate fantasy points for all 5 formats
- **Functions**:
  - `calculateFantasyPoints(playerStats)` - Returns all 5 fantasy formats
  - `calculateStandardScoring()` - Standard scoring
  - `calculatePPRScoring()` - Points Per Reception
  - `calculateHalfPPRScoring()` - Half PPR
  - `calculateDynastyScoring()` - Dynasty leagues
  - `calculateSuperflexScoring()` - Superflex leagues
- **Usage**:
  ```javascript
  import { calculateFantasyPoints } from './utils/fantasy-calculator.js'

  const fantasyPoints = calculateFantasyPoints(playerStats)
  console.log(`PPR: ${fantasyPoints.fantasy_points_ppr}`)
  ```

---

## Common Query Patterns

### Get All Player Stats for a Game

```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    *,
    players (
      full_name,
      primary_position,
      headshot_url
    )
  `)
  .eq('game_id', 'espn-401772510')
  .eq('season', 2025)
  .order('fantasy_points_ppr', { ascending: false })
```

### Get Top Passers (Weekly)

```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    player_id,
    team_id,
    passing_yards,
    passing_touchdowns,
    passing_interceptions,
    passing_rating,
    fantasy_points_ppr,
    players!inner(full_name)
  `)
  .eq('season', 2025)
  .gt('passing_attempts', 15)
  .order('passing_yards', { ascending: false })
  .limit(10)
```

### Get Top Rushers (Weekly)

```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    player_id,
    team_id,
    rushing_yards,
    rushing_attempts,
    rushing_touchdowns,
    fantasy_points_ppr,
    players!inner(full_name)
  `)
  .eq('season', 2025)
  .gt('rushing_attempts', 10)
  .order('rushing_yards', { ascending: false })
  .limit(10)
```

### Get Top Receivers (Weekly)

```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    player_id,
    team_id,
    receptions,
    receiving_yards,
    receiving_touchdowns,
    receiving_targets,
    fantasy_points_ppr,
    players!inner(full_name)
  `)
  .eq('season', 2025)
  .gt('receptions', 5)
  .order('receiving_yards', { ascending: false })
  .limit(10)
```

### Get Player Game Log (All Games)

```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    game_id,
    team_id,
    passing_yards,
    rushing_yards,
    receptions,
    receiving_yards,
    fantasy_points_ppr,
    games!inner(week, game_date, home_team_id, away_team_id)
  `)
  .eq('player_id', playerId)
  .eq('season', 2025)
  .order('games(week)')
```

### Get QB Stats with Game Context

```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    player_id,
    passing_attempts,
    passing_completions,
    passing_yards,
    passing_touchdowns,
    passing_interceptions,
    passing_rating,
    passing_qbr,
    players!inner(full_name),
    games!inner(week, game_date, home_team_id, away_team_id, home_score, away_score)
  `)
  .eq('player_id', playerId)
  .eq('season', 2025)
  .gt('passing_attempts', 1)
  .order('games(week)')
```

### Get Multi-Position Player Stats (RB with receiving)

```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    player_id,
    rushing_attempts,
    rushing_yards,
    rushing_touchdowns,
    receptions,
    receiving_yards,
    receiving_touchdowns,
    fantasy_points_ppr,
    players!inner(full_name)
  `)
  .eq('player_id', playerId)
  .eq('season', 2025)
  .order('games(week)')
```

---

## Related Tables

### Foreign Key Relationships

1. **players** - Player profiles
   - Join: `player_game_stats.player_id = players.player_id`
   - FK: ✅ Foreign key constraint exists

2. **games** - Game information
   - Join: `player_game_stats.game_id = games.game_id AND player_game_stats.season = games.season`
   - Note: No FK constraint (partitioned table limitation)

3. **teams** - Team information
   - Join: `player_game_stats.team_id = teams.team_id`
   - FK: ✅ Foreign key constraint exists

4. **game_rosters** - Game-day roster
   - Join: Match on game_id, season, team_id, player_id
   - Use: Combine roster status with game stats

5. **player_season_stats** - Aggregated season stats
   - Join: Match on player_id, season
   - Use: Compare game performance to season averages

---

## Fantasy Points Formulas

### Standard Scoring
```javascript
fantasy_points_standard =
  (passing_yards / 25) +
  (passing_touchdowns × 4) +
  (passing_interceptions × -2) +
  (rushing_yards / 10) +
  (rushing_touchdowns × 6) +
  (receiving_yards / 10) +
  (receiving_touchdowns × 6) +
  ((rushing_fumbles_lost + receiving_fumbles_lost) × -2)
```

### PPR (Points Per Reception)
```javascript
fantasy_points_ppr = fantasy_points_standard + receptions
```

### Half PPR
```javascript
fantasy_points_half_ppr = fantasy_points_standard + (receptions × 0.5)
```

### Dynasty
```javascript
fantasy_points_dynasty = fantasy_points_ppr
// Same as PPR with additional roster/contract considerations
```

### Superflex
```javascript
fantasy_points_superflex = fantasy_points_standard +
  (position === 'QB' ? (passing_touchdowns × 2) : 0)
// Passing TDs worth 6 points (not 4)
```

---

## Common Mistakes

### ❌ WRONG Queries

```javascript
// ❌ WRONG - Column doesn't exist
.select('receiving_receptions')  // Should be 'receptions'

// ❌ WRONG - Forgetting season partition
.eq('game_id', gameId)  // Must also include season

// ❌ WRONG - Not filtering by minimum attempts
.order('passing_yards', { ascending: false })  // QBs with 1 attempt show up

// ❌ WRONG - Not joining player data
.select('player_id, passing_yards')  // Only gets ID, not name

// ❌ WRONG - Ambiguous sacks column
.select('sacks')  // Use passing_sacks or defensive_sacks
```

### ✅ CORRECT Queries

```javascript
// ✅ CORRECT - Use 'receptions'
.select('receptions, receiving_yards')

// ✅ CORRECT - Include season
.eq('game_id', gameId)
.eq('season', 2025)

// ✅ CORRECT - Filter by minimum attempts
.gt('passing_attempts', 15)
.order('passing_yards', { ascending: false })

// ✅ CORRECT - Join player data
.select('*, players(full_name, primary_position)')

// ✅ CORRECT - Specify which sacks
.select('passing_sacks')  // For QBs
.select('defensive_sacks')  // For defense
```

---

## Performance Floors Usage

This table is the **primary data source** for performance floor calculations.

### Query Pattern (Rolling Window)
```javascript
// Get recent games for a player (position-specific window)
const rollingWindow = {
  QB: 5,
  RB: 3,
  WR: 4,
  TE: 4
}

const { data } = await supabase
  .from('player_game_stats')
  .select('*')
  .eq('player_id', playerId)
  .eq('season', 2025)
  .order('games(week)', { ascending: false })
  .limit(rollingWindow[position])
```

### Stat Categories for Floors
- **QB**: passing_yards, passing_touchdowns, passing_interceptions, rushing_yards
- **RB**: rushing_yards, rushing_touchdowns, receptions, receiving_yards
- **WR**: receptions, receiving_yards, receiving_touchdowns
- **TE**: receptions, receiving_yards, receiving_touchdowns

---

## Data Quality Notes

### Fields Always Populated
- Identification fields (player_id, game_id, season, team_id)
- Stats for players who recorded them (position-dependent)
- Fantasy points (all 5 formats)

### Fields Sometimes NULL
- Position-specific stats (e.g., passing_yards for RBs)
- Advanced metrics not in boxscore (first_downs, YAC)

### Fields Always NULL
- Return stats (not in standard boxscore)
- 2-point conversions (not consistently provided)
- Some advanced defensive stats (fumble return yards/TDs, safeties)

---

## Table Partitioning

**Partitioned By**: `season` (INTEGER)

**Why**: Improves query performance by limiting scans to single season

**Query Requirement**: Always include `season` in WHERE clause:
```javascript
.eq('season', 2025)  // Required for optimal performance
```

---

## Indexes

### Performance Indexes Created

1. `idx_player_game_stats_player_id` - Lookup by player
2. `idx_player_game_stats_game_id_season` - Lookup by game
3. `idx_player_game_stats_team_id` - Lookup by team
4. `idx_player_game_stats_position` - Filter by position
5. `idx_player_game_stats_fantasy_ppr` - Sort by fantasy points

---

## Validation Checklist

- [x] All 75 columns exist in database
- [x] Foreign keys properly constrained (players, teams)
- [x] Partitioned by season for performance
- [x] Indexes created for common queries
- [x] Fantasy points correctly calculated
- [x] Query patterns documented
- [x] Common mistakes documented
- [x] Related tables identified

---

## References

### Documentation Files (This Folder)
- **PLAYER-GAME-STATS-RESOURCES/field-mapping-report.md** - Complete field mapping for all 75 columns
- **PLAYER-GAME-STATS-RESOURCES/raw-data-source-mapping.md** - ESPN API sources and transformations
- **my-guide.md** - This file (quick reference)

### Related Documentation
- `DATABASE-SCHEMA-REFERENCE.md` - Master schema reference
- `AUTOMATION-GUARANTEE.md` - Complete automation system docs
- `SCRIPTS-INDEX.md` - All 63 scripts cataloged
- `STATE-OF-THE-UNION.md` - Project overview with links

### Migration Files
- `supabase/migrations/20250101000020_enhance_player_game_stats.sql`

---

## Status

- **Data Coverage**: 6,842+ stat records from 106 completed games
- **Automation**: ✅ Fully automated via live-games-scraper → game-stats-scraper
- **Fantasy Points**: ✅ All 5 formats calculated
- **Production Ready**: ✅ Yes

---

**Last Updated**: October 22, 2025
**Total Fields**: 75
**Total Records**: 6,842+ (106 completed games)
**Auto-Population**: ✅ Working perfectly
**Primary Use**: Performance projections, leaderboards, fantasy analysis
