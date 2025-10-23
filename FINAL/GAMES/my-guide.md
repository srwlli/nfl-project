# Games Table - Quick Reference Guide

> **Purpose**: Fast reference for games table fields and queries
> **Table**: `games`
> **Records**: 272 games (2025 season)
> **Completed**: 106 games with full data
> **Partitioned By**: season (for performance)

---

## Quick Field List (Copy-Paste Ready)

### All 29 Fields
```
game_id, season, week, game_type, game_date, game_time, overtime,
home_team_id, away_team_id, home_score, away_score, status, duration_minutes,
home_q1_score, home_q2_score, home_q3_score, home_q4_score, home_ot_score,
away_q1_score, away_q2_score, away_q3_score, away_q4_score, away_ot_score,
stadium_id, attendance, broadcast_network, playoff_round,
created_at, updated_at, deleted_at
```

### Core Fields (13 fields)
```
game_id, season, week, game_date, game_time,
home_team_id, away_team_id, home_score, away_score, status,
broadcast_network, stadium_id, attendance
```

### Identification Fields (3 fields)
```
game_id, season, week
```

### Teams & Scores (6 fields)
```
home_team_id, away_team_id, home_score, away_score, status, overtime
```

### Quarter Scores (10 fields)
```
home_q1_score, home_q2_score, home_q3_score, home_q4_score, home_ot_score,
away_q1_score, away_q2_score, away_q3_score, away_q4_score, away_ot_score
```

### Timing Fields (3 fields)
```
game_date, game_time, game_type
```

---

## Quick Query Strings

### Select All Fields
```sql
game_id, season, week, game_type, game_date, game_time, overtime,
home_team_id, away_team_id, home_score, away_score, status, duration_minutes,
home_q1_score, home_q2_score, home_q3_score, home_q4_score, home_ot_score,
away_q1_score, away_q2_score, away_q3_score, away_q4_score, away_ot_score,
stadium_id, attendance, broadcast_network, playoff_round,
created_at, updated_at
```

### Select Scoreboard Fields
```sql
game_id, game_date, game_time, status,
home_team_id, away_team_id, home_score, away_score, broadcast_network
```

### Select with Quarter Scores
```sql
game_id, home_team_id, away_team_id, home_score, away_score,
home_q1_score, home_q2_score, home_q3_score, home_q4_score, home_ot_score,
away_q1_score, away_q2_score, away_q3_score, away_q4_score, away_ot_score
```

### Select Game Header
```sql
game_id, week, season, game_date, game_time, status,
stadium_id, attendance, broadcast_network
```

---

## Critical Field Names ⚠️

### Correct Names (Use These)
- ✅ `game_id` - Primary key (with season)
- ✅ `status` - Game status enum
- ✅ `home_team_id` - FK to teams
- ✅ `away_team_id` - FK to teams
- ✅ `game_type` - Season type enum
- ✅ `home_q1_score` - Quarter 1 score (NOT home_quarter1_score)

### Common Mistakes (Don't Use These)
- ❌ `id` - Wrong (use `game_id`)
- ❌ `game_status` - Wrong (use `status`)
- ❌ `home_team` - Wrong (use `home_team_id`)
- ❌ `quarter1_score` - Wrong (use `home_q1_score` / `away_q1_score`)
- ❌ `completed` - Wrong (check `status = 'final'`)

---

## Scripts in This Folder

### Seed Script
**File**: `scripts/04-schedule.js` (6K)
- **Purpose**: Load full 2025 season schedule (272 games)
- **Data Source**: ESPN Scoreboard API
- **Populates**: game_id, season, week, game_date, game_time, teams, broadcast
- **Run Once**: Initial database setup
- **Usage**:
  ```bash
  # Load complete 2025 schedule
  node coderef/FINAL/GAMES/scripts/04-schedule.js

  # NPM shortcut
  npm run seed:schedule
  ```

### Live Games Scraper
**File**: `scripts/live-games-scraper.js` (8K)
- **Purpose**: Update scores and status in real-time
- **Updates**: status, home_score, away_score
- **Auto-Triggers**: game-stats-scraper when games complete
- **Schedule**: Every 30 seconds during game windows
- **Usage**:
  ```bash
  # Check current week
  node coderef/FINAL/GAMES/scripts/live-games-scraper.js

  # Specific week
  node coderef/FINAL/GAMES/scripts/live-games-scraper.js --week=7

  # Watch mode (continuous updates)
  node coderef/FINAL/GAMES/scripts/live-games-scraper.js --watch

  # NPM shortcuts
  npm run scrape:live
  npm run scrape:live -- --week=7
  npm run scrape:live -- --watch
  ```

### Scoreboard Display
**File**: `scripts/get-live-scoreboard.js` (10K)
- **Purpose**: Display formatted scoreboard
- **Shows**: All games for a week, grouped by status
- **Includes**: Quarter scores, venue, broadcast
- **Output**: Console table or JSON
- **Usage**:
  ```bash
  # Current week scoreboard
  node coderef/FINAL/GAMES/scripts/get-live-scoreboard.js

  # Specific week
  node coderef/FINAL/GAMES/scripts/get-live-scoreboard.js --week=7

  # JSON output
  node coderef/FINAL/GAMES/scripts/get-live-scoreboard.js --json

  # NPM shortcuts
  npm run scoreboard
  npm run scoreboard -- --week=7
  npm run scoreboard:json
  ```

---

## Common Query Patterns

### Get Single Game with Teams

```javascript
const { data } = await supabase
  .from('games')
  .select(`
    *,
    home_team:teams!games_home_team_id_fkey(team_id, team_name, team_abbr, logo_url),
    away_team:teams!games_away_team_id_fkey(team_id, team_name, team_abbr, logo_url),
    stadium:stadiums(stadium_name, city, state, roof_type)
  `)
  .eq('game_id', 'espn-401772510')
  .eq('season', 2025)
  .single()
```

### Get Games for a Specific Week

```javascript
const { data } = await supabase
  .from('games')
  .select(`
    game_id,
    game_date,
    game_time,
    status,
    home_team_id,
    away_team_id,
    home_score,
    away_score,
    broadcast_network,
    home_team:teams!games_home_team_id_fkey(team_abbr, logo_url),
    away_team:teams!games_away_team_id_fkey(team_abbr, logo_url)
  `)
  .eq('season', 2025)
  .eq('week', 7)
  .order('game_date')
  .order('game_time')
```

### Get Completed Games with Quarter Scores

```javascript
const { data } = await supabase
  .from('games')
  .select(`
    *,
    home_team:teams!games_home_team_id_fkey(team_abbr),
    away_team:teams!games_away_team_id_fkey(team_abbr)
  `)
  .eq('season', 2025)
  .eq('status', 'final')
  .not('home_q1_score', 'is', null)
  .order('game_date', { ascending: false })
  .limit(10)
```

### Get Team Schedule

```javascript
const { data } = await supabase
  .from('games')
  .select(`
    game_id,
    week,
    game_date,
    game_time,
    status,
    home_team_id,
    away_team_id,
    home_score,
    away_score,
    broadcast_network
  `)
  .eq('season', 2025)
  .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
  .order('week')
```

### Get Live Games (In Progress)

```javascript
const { data } = await supabase
  .from('games')
  .select(`
    *,
    home_team:teams!games_home_team_id_fkey(team_abbr, team_name, logo_url),
    away_team:teams!games_away_team_id_fkey(team_abbr, team_name, logo_url)
  `)
  .eq('season', 2025)
  .eq('status', 'in_progress')
  .order('game_date')
```

### Get Upcoming Games

```javascript
const { data } = await supabase
  .from('games')
  .select('*')
  .eq('season', 2025)
  .eq('status', 'scheduled')
  .gte('game_date', new Date().toISOString().split('T')[0])
  .order('game_date')
  .order('game_time')
  .limit(10)
```

### Get Recent Final Scores

```javascript
const { data } = await supabase
  .from('games')
  .select(`
    *,
    home_team:teams!games_home_team_id_fkey(team_name, team_abbr),
    away_team:teams!games_away_team_id_fkey(team_name, team_abbr)
  `)
  .eq('season', 2025)
  .eq('status', 'final')
  .order('game_date', { ascending: false })
  .limit(10)
```

---

## Related Tables

### Foreign Key Relationships

1. **teams** (home and away)
   - Join: `games.home_team_id = teams.team_id`
   - Join: `games.away_team_id = teams.team_id`
   - FK: ✅ Both constraints exist
   - Note: Use FK constraint names in Supabase: `games_home_team_id_fkey`, `games_away_team_id_fkey`

2. **stadiums** - Venue information
   - Join: `games.stadium_id = stadiums.stadium_id`
   - FK: ✅ Constraint exists

3. **player_game_stats** - Player performance
   - Join: Match on game_id, season
   - Use: Get all player stats for a game

4. **team_game_stats** - Team performance
   - Join: Match on game_id, season
   - Use: Get team-level stats

5. **game_rosters** - Game-day rosters
   - Join: Match on game_id, season
   - Use: Get who played

6. **scoring_plays** - Play-by-play scoring
   - Join: Match on game_id, season
   - Use: Get scoring timeline

7. **game_weather** - Weather conditions
   - Join: Match on game_id
   - Use: Get weather for outdoor games

---

## Status Values

### game_status Enum

| Value | Meaning | Query Usage |
|-------|---------|-------------|
| `scheduled` | Game not started | Future games |
| `in_progress` | Game currently playing | Live games |
| `final` | Game completed | Past games |
| `postponed` | Game delayed | Rare |
| `canceled` | Game not played | Rare |

### Query by Status

```javascript
// Live games
.eq('status', 'in_progress')

// Completed games
.eq('status', 'final')

// Upcoming games
.eq('status', 'scheduled')

// Live OR recently completed
.in('status', ['in_progress', 'final'])
.gte('game_date', todayDate)
```

---

## Game Type Values

### season_type Enum

| Value | Meaning | Weeks |
|-------|---------|-------|
| `preseason` | Preseason games | Weeks 1-4 (August) |
| `regular` | Regular season | Weeks 1-18 |
| `postseason` | Playoff games | Wild Card through Super Bowl |

### Query by Game Type

```javascript
// Regular season only
.eq('game_type', 'regular')

// Playoff games only
.eq('game_type', 'postseason')
```

---

## Quarter Score Validation

### Validation Function

```javascript
const verifyQuarterScores = (game) => {
  const homeQuarterTotal =
    (game.home_q1_score || 0) +
    (game.home_q2_score || 0) +
    (game.home_q3_score || 0) +
    (game.home_q4_score || 0) +
    (game.home_ot_score || 0)

  const awayQuarterTotal =
    (game.away_q1_score || 0) +
    (game.away_q2_score || 0) +
    (game.away_q3_score || 0) +
    (game.away_q4_score || 0) +
    (game.away_ot_score || 0)

  return (
    homeQuarterTotal === game.home_score &&
    awayQuarterTotal === game.away_score
  )
}
```

---

## Common Mistakes

### ❌ WRONG Queries

```javascript
// ❌ WRONG - Forgetting season partition
.eq('game_id', gameId)  // Must include season for performance

// ❌ WRONG - Not handling NULL quarter scores
.select('home_q1_score')  // NULL for scheduled games

// ❌ WRONG - Wrong FK reference
.select('home_team(team_name)')  // Must specify constraint name

// ❌ WRONG - Checking for "completed"
.eq('status', 'completed')  // Should be 'final'

// ❌ WRONG - Not filtering deleted records
.select('*')  // Should filter deleted_at IS NULL
```

### ✅ CORRECT Queries

```javascript
// ✅ CORRECT - Include season partition
.eq('game_id', gameId)
.eq('season', 2025)

// ✅ CORRECT - Filter for completed games with quarter scores
.eq('status', 'final')
.not('home_q1_score', 'is', null)

// ✅ CORRECT - Proper FK reference with constraint name
.select('home_team:teams!games_home_team_id_fkey(team_name)')

// ✅ CORRECT - Use 'final' status
.eq('status', 'final')

// ✅ CORRECT - Filter soft deletes
.is('deleted_at', null)
```

---

## Table Partitioning

### Partitioned By Season

**Why**: Improves query performance by limiting scans to single season

**Partitions**:
- `games_historical`: 1970-2019 (50 years)
- `games_2020`: 2020 season
- `games_2021`: 2021 season
- `games_2022`: 2022 season
- `games_2023`: 2023 season
- `games_2024`: 2024 season
- `games_2025`: 2025 season (current)

**Primary Key**: `(game_id, season)` - Composite ensures uniqueness

**Query Requirement**: Always include season:
```javascript
.eq('season', 2025)  // Required for optimal performance
```

---

## Indexes

### Performance Indexes

1. `idx_games_season_week` - Lookup by season and week
2. `idx_games_home_team` - Home games for team
3. `idx_games_away_team` - Away games for team
4. `idx_games_date` - Sort by game date (DESC)
5. `idx_games_status` - Filter by status

---

## Data Coverage

### 2025 Season

```
Total Games: 272
  Regular Season: 272 games (18 weeks × 16 teams)
  Playoffs: TBD (6 Wild Card + 4 Divisional + 2 Conference + 1 Super Bowl)

Completed: 106 games (39%)
  With Quarter Scores: 106 (100%)

Scheduled: 166 games (61%)
```

### Week Distribution

**Regular Season**: 18 weeks
- Weeks 1-17: 16 games each
- Week 18: 16 games

**Playoffs**: 5 rounds
- Wild Card: 6 games
- Divisional: 4 games
- Conference: 2 games
- Super Bowl: 1 game

---

## Scoreboard Query Pattern

### Full Scoreboard for Week

```javascript
const { data } = await supabase
  .from('games')
  .select(`
    game_id,
    game_date,
    game_time,
    status,
    home_team_id,
    away_team_id,
    home_score,
    away_score,
    home_q1_score,
    home_q2_score,
    home_q3_score,
    home_q4_score,
    away_q1_score,
    away_q2_score,
    away_q3_score,
    away_q4_score,
    broadcast_network,
    stadium:stadiums(stadium_name, city, state),
    home_team:teams!games_home_team_id_fkey(team_id, team_abbr, team_name, logo_url),
    away_team:teams!games_away_team_id_fkey(team_id, team_abbr, team_name, logo_url)
  `)
  .eq('season', 2025)
  .eq('week', 7)
  .order('game_date')
  .order('game_time')
```

### Group by Status

```javascript
const groupByStatus = (games) => {
  return {
    live: games.filter(g => g.status === 'in_progress'),
    final: games.filter(g => g.status === 'final'),
    scheduled: games.filter(g => g.status === 'scheduled')
  }
}
```

---

## Validation Checklist

- [x] All 29 columns exist in database
- [x] Foreign keys constrained (teams, stadiums)
- [x] Partitioned by season for performance
- [x] Indexes created for common queries
- [x] Quarter scores populate correctly
- [x] Query patterns documented
- [x] Common mistakes documented
- [x] Related tables identified

---

## References

### Documentation Files (This Folder)
- **GAMES-RESOURCES/field-mapping-report.md** - Complete field mapping for all 29 columns
- **GAMES-RESOURCES/raw-data-source-mapping.md** - ESPN API sources and transformations
- **my-guide.md** - This file (quick reference)

### Related Documentation
- `DATABASE-SCHEMA-REFERENCE.md` - Master schema reference
- `AUTOMATION-GUARANTEE.md` - Complete automation docs
- `SCRIPTS-INDEX.md` - All 63 scripts cataloged
- `STATE-OF-THE-UNION.md` - Project overview

### Migration Files
- `supabase/migrations/20250101000004_create_core_entity_tables.sql` (base)
- `supabase/migrations/20250101000012_add_quarter_scores.sql` (quarters)

---

## Status

- **Data Coverage**: 272 games (2025 season)
- **Completed Games**: 106 with full data
- **Automation**: ✅ Fully automated (seed → live updates → quarter scores)
- **Production Ready**: ✅ Yes

---

**Last Updated**: October 22, 2025
**Total Fields**: 29
**Total Records**: 272 (2025 season)
**Completed**: 106 games (39%)
**Foundation Table**: ✅ Connects all game-related data
