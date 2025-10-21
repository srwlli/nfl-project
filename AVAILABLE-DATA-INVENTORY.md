# 2025 Season Data Inventory - Available for Export

**Purpose**: Complete list of all scraped NFL data available for external agents
**Last Updated**: 2025-10-20 (Week 7, 13/16 games complete)
**Database**: Supabase PostgreSQL
**Status**: ✅ Production Ready

---

## 📊 CURRENT SEASON COVERAGE (2025)

**Games Completed**: 106/272 (39% of season)
- Week 1: 16/16 ✅
- Week 2: 16/16 ✅
- Week 3: 16/16 ✅
- Week 4: 16/16 ✅
- Week 5: 14/14 ✅
- Week 6: 15/15 ✅
- Week 7: 13/16 ✅ (3 games remaining)
- Week 8+: Scheduled (not yet played)

**Data Quality**: 100% coverage for all completed games

---

## 🗄️ AVAILABLE DATA TABLES

### 1. Games (`games` table)

**Location**: `games` table
**Records**: 272 total (106 with final scores)
**Primary Key**: Composite `(game_id, season)`

**Available Fields**:
```javascript
{
  game_id: string,          // ESPN game ID (e.g., '401772635')
  season: integer,          // 2025
  week: integer,            // 1-18 (regular season), 19-22 (playoffs)
  game_date: timestamp,     // Kickoff time
  season_type: string,      // 'regular' | 'postseason'
  status: string,           // 'scheduled' | 'in_progress' | 'final'

  // Teams
  home_team_id: string,     // Team abbreviation (e.g., 'KC', 'SF')
  away_team_id: string,

  // Scores
  home_score: integer,
  away_score: integer,
  home_q1_score: integer,   // Quarter-by-quarter scores
  home_q2_score: integer,
  home_q3_score: integer,
  home_q4_score: integer,
  home_ot_score: integer,   // Overtime (if applicable)
  away_q1_score: integer,
  away_q2_score: integer,
  away_q3_score: integer,
  away_q4_score: integer,
  away_ot_score: integer,

  // Metadata
  stadium_id: string,       // Venue reference
  attendance: integer,
  venue_name: string,
  venue_city: string,
  venue_state: string
}
```

**Sample Query**:
```javascript
// Get all Week 7 final games with scores
SELECT game_id, week, home_team_id, away_team_id,
       home_score, away_score,
       home_q1_score, home_q2_score, home_q3_score, home_q4_score
FROM games
WHERE season = 2025
  AND week = 7
  AND status = 'final'
ORDER BY game_date;
```

---

### 2. Team Game Statistics (`team_game_stats` table)

**Location**: `team_game_stats` table
**Records**: 212 (106 games × 2 teams)
**Primary Key**: Composite `(team_id, game_id, season)`

**Available Fields**:
```javascript
{
  team_id: string,          // 'KC', 'SF', etc.
  game_id: string,
  season: integer,

  // Passing Stats
  passing_yards: integer,
  passing_attempts: integer,
  passing_completions: integer,
  passing_touchdowns: integer,
  passing_interceptions: integer,

  // Rushing Stats
  rushing_yards: integer,
  rushing_attempts: integer,
  rushing_touchdowns: integer,

  // Receiving Stats (team totals)
  receiving_yards: integer,
  receiving_receptions: integer,
  receiving_touchdowns: integer,

  // Defense
  sacks: decimal,
  tackles_for_loss: integer,
  interceptions: integer,
  fumbles_recovered: integer,
  safeties: integer,

  // Special Teams
  field_goals_made: integer,
  field_goals_attempted: integer,
  extra_points_made: integer,
  extra_points_attempted: integer,

  // Game Flow
  possession_time: string,  // "MM:SS" format
  turnovers: integer,
  penalties: integer,
  penalty_yards: integer,
  first_downs: integer,
  third_down_conversions: integer,
  third_down_attempts: integer,
  fourth_down_conversions: integer,
  fourth_down_attempts: integer
}
```

**Sample Query**:
```javascript
// Get team stats for all Week 7 games
SELECT t.team_id, t.game_id,
       t.passing_yards, t.rushing_yards, t.turnovers,
       t.possession_time
FROM team_game_stats t
WHERE t.season = 2025
  AND EXISTS (
    SELECT 1 FROM games g
    WHERE g.game_id = t.game_id
      AND g.season = t.season
      AND g.week = 7
  )
ORDER BY t.game_id, t.team_id;
```

---

### 3. Player Game Statistics (`player_game_stats` table)

**Location**: `player_game_stats` table
**Records**: 4,599 (65-70 players per game × 106 games)
**Primary Key**: Composite `(player_id, game_id, season)`

**Available Fields** (303 total fields):

#### Basic Info
```javascript
{
  player_id: string,        // ESPN player ID (e.g., 'espn-4428718')
  game_id: string,
  season: integer,
  team_id: string,
  position: string,         // 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'
}
```

#### Passing Stats (QBs)
```javascript
{
  passing_completions: integer,
  passing_attempts: integer,
  passing_yards: integer,
  passing_touchdowns: integer,
  passing_interceptions: integer,
  passing_sacks: integer,         // NEW Phase 1
  passing_sack_yards: integer,
  passing_longest: integer,
  passing_rating: decimal,        // NEW Phase 1
  qbr: decimal,                   // NEW Phase 1 (ESPN's Total QBR)
  passing_first_downs: integer,
}
```

#### Rushing Stats (RB, QB, WR)
```javascript
{
  rushing_attempts: integer,
  rushing_yards: integer,
  rushing_touchdowns: integer,
  rushing_longest: integer,
  rushing_average: decimal,
  rushing_first_downs: integer,
  rushing_fumbles: integer,
  rushing_fumbles_lost: integer,
}
```

#### Receiving Stats (WR, TE, RB)
```javascript
{
  receiving_receptions: integer,
  receiving_targets: integer,     // NEW Phase 1
  receiving_yards: integer,
  receiving_touchdowns: integer,
  receiving_longest: integer,
  receiving_average: decimal,
  receiving_first_downs: integer,
  receiving_fumbles: integer,
  receiving_fumbles_lost: integer,
}
```

#### Defensive Stats (DEF, LB, DB)
```javascript
{
  tackles_solo: integer,
  tackles_assisted: integer,
  tackles_total: integer,
  tackles_for_loss: integer,
  sacks: decimal,
  sack_yards: decimal,
  qb_hits: integer,
  interceptions: integer,
  interception_yards: integer,
  interception_touchdowns: integer,
  passes_defended: integer,
  fumbles_forced: integer,
  fumbles_recovered: integer,
  fumble_return_yards: integer,
  fumble_return_touchdowns: integer,
  safeties: integer,
}
```

#### Kicking Stats (K)
```javascript
{
  field_goals_made: integer,
  field_goals_attempted: integer,
  field_goal_percentage: decimal,
  field_goals_longest: integer,
  extra_points_made: integer,
  extra_points_attempted: integer,
}
```

#### Fantasy Points (NEW - Phase 1) - 5 Formats
```javascript
{
  fantasy_points_standard: decimal,  // Standard scoring
  fantasy_points_ppr: decimal,       // Full PPR
  fantasy_points_half_ppr: decimal,  // Half PPR
  fantasy_points_dfs_dk: decimal,    // DraftKings
  fantasy_points_dfs_fd: decimal,    // FanDuel
}
```

#### Advanced Analytics (NEW - Phase 1)
```javascript
{
  // EPA (Expected Points Added)
  epa_total: decimal,
  epa_pass: decimal,
  epa_rush: decimal,
  epa_receive: decimal,

  // Success Rate
  success_rate: decimal,

  // Opportunity Metrics
  red_zone_targets: integer,
  red_zone_touches: integer,
  air_yards: integer,
  yards_after_catch: integer,
}
```

**Sample Query**:
```javascript
// Get top 10 fantasy performers for Week 7
SELECT p.player_id, p.position, p.team_id,
       p.fantasy_points_ppr,
       p.passing_yards, p.rushing_yards, p.receiving_yards,
       p.passing_touchdowns, p.rushing_touchdowns, p.receiving_touchdowns
FROM player_game_stats p
JOIN games g ON p.game_id = g.game_id AND p.season = g.season
WHERE p.season = 2025
  AND g.week = 7
  AND p.fantasy_points_ppr IS NOT NULL
ORDER BY p.fantasy_points_ppr DESC
LIMIT 10;
```

---

### 4. Scoring Plays (`scoring_plays` table)

**Location**: `scoring_plays` table
**Records**: 917 (6-12 per game × 106 games)
**Primary Key**: Auto-increment `id`

**Available Fields**:
```javascript
{
  id: integer,
  game_id: string,
  season: integer,
  team_id: string,          // Scoring team

  // Play Details
  quarter: integer,         // 1-4, 5 for OT
  time_remaining: string,   // "MM:SS" format
  play_description: string, // Full text description

  // Scoring
  score_type: string,       // 'touchdown', 'field_goal', 'safety', 'extra_point', 'two_point'
  points: integer,          // Points scored on this play

  // Involved Players
  player_id: string,        // Primary player (scorer/kicker)
  assisted_by: string,      // QB on TD pass, etc.

  // Context
  home_score: integer,      // Score after this play
  away_score: integer
}
```

**Sample Query**:
```javascript
// Get all touchdowns for Week 7
SELECT sp.game_id, sp.team_id, sp.quarter, sp.time_remaining,
       sp.play_description, sp.points, sp.player_id
FROM scoring_plays sp
JOIN games g ON sp.game_id = g.game_id AND sp.season = g.season
WHERE sp.season = 2025
  AND g.week = 7
  AND sp.score_type = 'touchdown'
ORDER BY g.game_date, sp.quarter, sp.time_remaining DESC;
```

---

### 5. Weekly Stat Leaders (`weekly_stat_leaders` table)

**Location**: `weekly_stat_leaders` table
**Records**: 110 per week (10 leaders × 11 categories)
**Primary Key**: Auto-increment `id`

**Available Fields**:
```javascript
{
  id: integer,
  season: integer,
  week: integer,
  stat_category: string,    // See categories below
  rank: integer,            // 1-10
  player_id: string,
  team_id: string,
  stat_value: decimal,      // The actual stat value
  games_played: integer     // Games played that week (usually 1)
}
```

**Stat Categories Available**:
- `passing_yards`
- `rushing_yards`
- `receiving_yards`
- `passing_touchdowns`
- `rushing_touchdowns`
- `receiving_touchdowns`
- `receptions`
- `fantasy_points_standard`
- `fantasy_points_ppr`
- `passer_rating`
- `yards_from_scrimmage` (rush + rec yards)

**Sample Query**:
```javascript
// Get Week 7 passing yards leaders
SELECT w.rank, w.player_id, w.team_id, w.stat_value as yards
FROM weekly_stat_leaders w
WHERE w.season = 2025
  AND w.week = 7
  AND w.stat_category = 'passing_yards'
ORDER BY w.rank;
```

---

### 6. Season Cumulative Stats (`player_season_cumulative_stats` table)

**Location**: `player_season_cumulative_stats` table
**Records**: 754 players (active players through Week 7)
**Primary Key**: Composite `(player_id, season)`

**Available Fields**:
```javascript
{
  player_id: string,
  season: integer,
  team_id: string,
  position: string,

  // Games Played
  games_played: integer,
  weeks_active: array,      // [1, 2, 3, 4, 5, 6, 7]

  // Cumulative Stats (all positions have relevant stats summed)
  passing_yards: integer,
  passing_touchdowns: integer,
  passing_interceptions: integer,
  rushing_yards: integer,
  rushing_touchdowns: integer,
  receiving_yards: integer,
  receiving_touchdowns: integer,
  receptions: integer,
  targets: integer,

  // Fantasy Totals
  fantasy_points_ppr: decimal,
  fantasy_points_standard: decimal,

  // Per-Game Averages
  passing_yards_per_game: decimal,
  rushing_yards_per_game: decimal,
  receiving_yards_per_game: decimal,
  fantasy_points_ppr_per_game: decimal,

  // Pace Projections (16-game season)
  projected_passing_yards: integer,
  projected_rushing_yards: integer,
  projected_receiving_yards: integer,
  projected_fantasy_points_ppr: decimal
}
```

**Sample Query**:
```javascript
// Get top 10 fantasy scorers through Week 7
SELECT p.player_id, p.team_id, p.position,
       p.games_played,
       p.fantasy_points_ppr,
       p.fantasy_points_ppr_per_game,
       p.projected_fantasy_points_ppr
FROM player_season_cumulative_stats p
WHERE p.season = 2025
  AND p.fantasy_points_ppr IS NOT NULL
ORDER BY p.fantasy_points_ppr DESC
LIMIT 10;
```

---

### 7. Teams (`teams` table)

**Location**: `teams` table
**Records**: 32 teams
**Primary Key**: `team_id`

**Available Fields**:
```javascript
{
  team_id: string,          // 'KC', 'SF', 'BUF', etc.
  team_name: string,        // 'Kansas City Chiefs'
  team_abbr: string,        // 'KC' (same as team_id)
  city: string,             // 'Kansas City'
  conference: string,       // 'AFC' | 'NFC'
  division: string,         // 'North' | 'South' | 'East' | 'West'

  // Colors
  primary_color: string,    // Hex code
  secondary_color: string,

  // Metadata
  logo_url: string,
  espn_team_id: string
}
```

---

### 8. Players (`players` table)

**Location**: `players` table
**Records**: 2,540 active players
**Primary Key**: `player_id`

**Available Fields**:
```javascript
{
  player_id: string,        // 'espn-4428718'
  full_name: string,        // 'Patrick Mahomes'
  first_name: string,
  last_name: string,
  position: string,         // 'QB', 'RB', 'WR', 'TE', 'K', etc.
  jersey_number: integer,
  height: string,           // "6'3\""
  weight: integer,          // pounds
  birth_date: date,
  college: string,
  experience_years: integer,
  status: string,           // 'active' | 'injured' | 'inactive'

  // Metadata
  headshot_url: string,
  espn_player_id: string
}
```

---

### 9. Stadiums (`stadiums` table)

**Location**: `stadiums` table
**Records**: 30 NFL venues
**Primary Key**: `stadium_id`

**Available Fields**:
```javascript
{
  stadium_id: string,       // 'espn-3622'
  stadium_name: string,     // 'Arrowhead Stadium'
  city: string,
  state: string,
  capacity: integer,
  surface_type: string,     // 'grass' | 'turf'
  roof_type: string,        // 'open' | 'dome' | 'retractable'
  year_opened: integer,
  espn_venue_id: string
}
```

---

## 🔌 DATABASE ACCESS

### Connection Information:

**Database**: Supabase PostgreSQL
**Project ID**: `fuzouuxhxluqjmiyabal`
**Project URL**: `https://fuzouuxhxluqjmiyabal.supabase.co`

**Connection Methods**:

1. **Via Supabase Client (Node.js)**:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Query example
const { data, error } = await supabase
  .from('player_game_stats')
  .select('*')
  .eq('season', 2025)
  .eq('position', 'QB')
  .order('fantasy_points_ppr', { ascending: false })
  .limit(10)
```

2. **Via Direct PostgreSQL**:
```bash
# Connection string format
postgresql://postgres:[PASSWORD]@db.fuzouuxhxluqjmiyabal.supabase.co:5432/postgres
```

3. **Via REST API**:
```bash
# GET request
curl "https://fuzouuxhxluqjmiyabal.supabase.co/rest/v1/player_game_stats?season=eq.2025&select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## 📥 EXPORT OPTIONS

### Option 1: Direct SQL Export

```sql
-- Export all Week 7 player stats to CSV
COPY (
  SELECT p.*, g.week, g.game_date
  FROM player_game_stats p
  JOIN games g ON p.game_id = g.game_id AND p.season = g.season
  WHERE p.season = 2025 AND g.week = 7
) TO '/tmp/week7_player_stats.csv' WITH CSV HEADER;
```

### Option 2: Supabase API Query

```javascript
// Export via API (paginated)
async function exportAllPlayerStats() {
  let allData = []
  let from = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('player_game_stats')
      .select('*')
      .eq('season', 2025)
      .range(from, from + pageSize - 1)

    if (error) break
    if (data.length === 0) break

    allData = allData.concat(data)
    from += pageSize
  }

  return allData
}
```

### Option 3: Database Dump

```bash
# Full database backup
pg_dump -h db.fuzouuxhxluqjmiyabal.supabase.co \
        -U postgres \
        -d postgres \
        -t player_game_stats \
        -t games \
        -t teams \
        > nfl_data_export.sql
```

---

## 📊 DATA FRESHNESS

**Update Schedule**:
- **During game days**: Live games scraper runs every 30 seconds
- **Post-game**: Stats available within 2-3 minutes after final whistle
- **Weekly aggregations**: Run after all games complete (usually Tuesday)
- **Season cumulative**: Updated with each weekly aggregation

**Last Updated**:
- Games: 2025-10-20 22:39 UTC
- Player stats: 2025-10-20 22:41 UTC
- Weekly leaders: 2025-10-20 22:42 UTC
- Season cumulative: 2025-10-20 22:42 UTC

---

## 🎯 COMMON USE CASES

### 1. Get All Stats for a Specific Game
```javascript
const gameId = '401772635'
const { data } = await supabase
  .from('player_game_stats')
  .select('*, games(home_team_id, away_team_id, home_score, away_score)')
  .eq('game_id', gameId)
  .eq('season', 2025)
```

### 2. Get Weekly Fantasy Leaders
```javascript
const { data } = await supabase
  .from('weekly_stat_leaders')
  .select('*')
  .eq('season', 2025)
  .eq('week', 7)
  .eq('stat_category', 'fantasy_points_ppr')
  .order('rank')
```

### 3. Get Season-Long Stats for a Player
```javascript
const { data } = await supabase
  .from('player_season_cumulative_stats')
  .select('*')
  .eq('player_id', 'espn-4428718')
  .eq('season', 2025)
  .single()
```

### 4. Get All Touchdowns for a Week
```javascript
const { data } = await supabase
  .from('scoring_plays')
  .select('*, games(week)')
  .eq('season', 2025)
  .eq('score_type', 'touchdown')
  .filter('games.week', 'eq', 7)
```

---

## 🔐 CREDENTIALS

**Required Environment Variables**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://fuzouuxhxluqjmiyabal.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[Ask user for key]
```

**Security Notes**:
- Service role key required for full access
- Anon key available for read-only access
- Row-level security policies may apply

---

## 📚 DOCUMENTATION REFERENCES

**For complete schema details**:
- `DATABASE-ACCESS-GUIDE.md` - Database connection patterns
- `supabase/migrations/*.sql` - Table definitions
- `CLAUDE.md` - Project overview and history

**For data validation**:
- `scripts/validate-data-completeness.js` - Check data coverage
- `scripts/check-games-by-week.js` - Check game status by week
- `scripts/verify-phase1-fields.js` - Verify Phase 1 fields populated

---

**Last Updated**: 2025-10-20
**Data Coverage**: Week 7 (13/16 games) - 106 total games
**Status**: ✅ Production Ready - 100% coverage for completed games
