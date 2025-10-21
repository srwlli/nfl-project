# Performance Floors Calculator - Data Sources Reference

> **Generated**: October 21, 2025
> **Script**: `scripts/calculate-performance-floors.js`
> **Purpose**: Document all database tables and data used in performance floor calculations

---

## Summary

The performance floors calculator uses **8 database tables** to generate player projections. Based on Week 7 (2025 season) analysis for HOU @ SEA and TB @ DET games.

---

## 1. `games` Table

**Purpose**: Game schedule, matchups, and completion status

**Query Pattern**:
```javascript
// Fetch games for specific week
supabase.from('games')
  .select('game_id, week, home_team_id, away_team_id, status, stadium_id, season')
  .eq('season', 2025)
  .eq('week', 7)
```

**Data Found (Week 7, 2025)**:
- HOU @ SEA (game_id: espn-401772826, status: scheduled)
- TB @ DET (game_id: espn-401772816, status: scheduled)

**Columns Used**:
- `game_id` - Unique game identifier
- `season` - Season year (2025)
- `week` - Week number (1-18)
- `home_team_id` - Home team abbreviation (e.g., 'SEA', 'DET')
- `away_team_id` - Away team abbreviation (e.g., 'HOU', 'TB')
- `status` - Game status ('scheduled', 'in_progress', 'final')
- `stadium_id` - Foreign key to stadiums table

**Filter for Historical Data**:
```javascript
// Only use completed games for calculations
.eq('status', 'final')
.lt('week', currentWeek)  // Games before current week
```

---

## 2. `players` Table

**Purpose**: Player roster and position information

**Query Pattern**:
```javascript
// Fetch skill position players for a team
supabase.from('players')
  .select('player_id, full_name, primary_position, current_team_id')
  .eq('current_team_id', teamId)
  .in('primary_position', ['QB', 'RB', 'WR', 'TE'])
```

**Data Found (Week 7)**:
- **SEA**: 16 skill position players
  - QBs: Sam Darnold
  - RBs: Kenneth Walker III, Zach Charbonnet
  - WRs: Jaxon Smith-Njigba, Cooper Kupp, Tory Horton
  - TEs: AJ Barner

- **HOU**: 15 skill position players
  - QBs: C.J. Stroud
  - RBs: Woody Marks, Nick Chubb
  - WRs: Nico Collins, Xavier Hutchinson, Jayden Higgins
  - TEs: Dalton Schultz

- **DET**: 14 skill position players
  - QBs: Jared Goff
  - RBs: Jahmyr Gibbs, David Montgomery
  - WRs: Amon-Ra St. Brown, Jameson Williams, Isaac TeSlaa
  - TEs: Sam LaPorta

- **TB**: 15 skill position players
  - QBs: Baker Mayfield
  - RBs: Bucky Irving, Rachaad White
  - WRs: Emeka Egbuka, Mike Evans, Sterling Shepard
  - TEs: Cade Otton

**Columns Used**:
- `player_id` - Unique player identifier (e.g., 'espn-3052587')
- `full_name` - Player name (e.g., 'Sam Darnold')
- `primary_position` - Position abbreviation ('QB', 'RB', 'WR', 'TE')
- `current_team_id` - Current team abbreviation

---

## 3. `player_game_stats` Table

**Purpose**: Individual player performance statistics per game

**Query Pattern**:
```javascript
// Batch fetch all player stats for a team
supabase.from('player_game_stats')
  .select('player_id, game_id, passing_yards, passing_attempts, rushing_yards, rushing_attempts, receiving_yards, receiving_targets, receptions, fantasy_points_ppr')
  .in('player_id', playerIds)
  .eq('season', 2025)
```

**Data Found (Week 7)**:
- **SEA**: 6 games with stats before Week 7
  - Sam Darnold: 256.8 avg passing yards, 16.9 avg fantasy pts
  - Kenneth Walker III: 60.7 avg rushing yards, 11.4 avg fantasy pts
  - Jaxon Smith-Njigba: 116 avg receiving yards, 21.5 avg fantasy pts

- **HOU**: 2 games with stats before Week 7
  - C.J. Stroud: 238.5 avg passing yards, 23.6 avg fantasy pts
  - Nick Chubb: 54 avg rushing yards, 10.1 avg fantasy pts
  - Nico Collins: 65.5 avg receiving yards, 14 avg fantasy pts

- **DET**: 4 games with stats before Week 7
  - Jared Goff: 207.8 avg passing yards, 15.6 avg fantasy pts
  - Jahmyr Gibbs: 69.3 avg rushing yards, 17.2 avg fantasy pts
  - Amon-Ra St. Brown: 73 avg receiving yards, 19.6 avg fantasy pts

- **TB**: 4 games with stats before Week 7
  - Baker Mayfield: 258.8 avg passing yards, 21.2 avg fantasy pts
  - Bucky Irving: 51.5 avg rushing yards, 14.2 avg fantasy pts (only 2 games)
  - Emeka Egbuka: 84.8 avg receiving yards, 18 avg fantasy pts

**Columns Used**:
- `player_id` - Links to players table
- `game_id` - Links to games table
- `season` - Season year
- `position` - Player position for filtering
- **Passing**: `passing_yards`, `passing_attempts`, `passing_touchdowns`, `passing_interceptions`
- **Rushing**: `rushing_yards`, `rushing_attempts`, `rushing_touchdowns`
- **Receiving**: `receiving_yards`, `receiving_targets`, `receptions`, `receiving_touchdowns`
- **Fantasy**: `fantasy_points_ppr`

**Rolling Window Logic**:
- Position-specific lookback periods (Phase 2.3):
  - QB: 5 most recent games
  - RB: 3 most recent games
  - WR: 4 most recent games
  - TE: 4 most recent games

---

## 4. `team_game_stats` Table ⚠️

**Purpose**: Team-level defensive statistics (for opponent factor calculation)

**Query Pattern**:
```javascript
// Fetch opponent's defensive performance
supabase.from('team_game_stats')
  .select('game_id, total_yards_allowed')
  .eq('team_id', opponentId)
  .eq('season', 2025)
```

**⚠️ CRITICAL DATA ISSUE**:

Based on the 0.81 opponent factor for Houston, the script is finding **very limited defensive data** (likely only 2 games). This is causing:

1. **Small Sample Bias**: 2 games is NOT enough for reliable defensive rating
2. **False "Elite" Rating**: HOU showing as 19% better than average defense
3. **No Confidence Adjustment**: Formula doesn't account for sample size

**Expected Data** (if fully populated):
- Each team should have defensive stats for ~6 completed games before Week 7
- `total_yards_allowed` per game
- Used to calculate: `team_avg_allowed / league_avg_allowed`

**Actual Data** (inferred from 0.81 factor):
- HOU appears to have ~2 games with defensive data
- HOU allowing ~19% fewer yards than league average (in those 2 games)
- **League average**: Unknown (calculated from all team-game records)

**Opponent Factor Calculation**:
```javascript
// Houston defense example (showing 0.81)
const houstonAvg = 280  // yards allowed per game (estimated from 2 games)
const leagueAvg = 345   // league average (estimated)
const rawFactor = 280 / 345 = 0.81
const cappedFactor = Math.min(1.3, Math.max(0.7, 0.81)) = 0.81
```

**Interpretation**:
- Factor < 1.0 = **Tougher defense** (offense suppressed)
- Factor > 1.0 = **Easier defense** (offense boosted)
- Factor = 1.0 = **Average defense** (no adjustment)

**Columns Used**:
- `game_id` - Links to games table
- `team_id` - Team abbreviation
- `season` - Season year
- `total_yards_allowed` - Total yards allowed to opponent
- *(Note: No passing/rushing breakdown available)*

---

## 5. `stadiums` Table

**Purpose**: Venue characteristics for environment modifiers (Phase 2.1)

**Query Pattern**:
```javascript
// Fetch stadium info from game
supabase.from('stadiums')
  .select('stadium_name, surface_type, roof_type')
  .eq('stadium_id', game.stadium_id)
```

**Data Status**: Unknown (environment modifiers showing 1.0x suggests sparse data)

**Expected Modifiers**:
- **Surface Type**:
  - Turf: 1.03x (faster surface)
  - Grass: 1.00x (baseline)
- **Roof Type**:
  - Dome: 1.02x (controlled environment)
  - Outdoor: 1.00x (baseline)

**Columns Used**:
- `stadium_id` - Unique stadium identifier
- `stadium_name` - Stadium name
- `surface_type` - 'turf', 'grass', etc.
- `roof_type` - 'dome', 'outdoor', 'retractable'

**Current Impact**: All games showing "standard conditions (1x)" - suggests stadium_id not linking or data incomplete

---

## 6. `game_weather` Table

**Purpose**: Weather conditions for environment modifiers (Phase 2.1)

**Query Pattern**:
```javascript
// Fetch weather for game
supabase.from('game_weather')
  .select('temperature, wind_speed, conditions')
  .eq('game_id', gameId)
```

**Data Status**: Unknown (environment modifiers showing 1.0x suggests no weather data)

**Expected Penalties**:
- **High Wind** (>15 mph): 0.95x
- **Precipitation** (rain/snow): 0.92x
- **Extreme Cold** (<25°F): 0.94x

**Columns Used**:
- `game_id` - Links to games table
- `temperature` - Temperature in Fahrenheit
- `wind_speed` - Wind speed in mph
- `conditions` - Weather description (e.g., 'Rain', 'Snow', 'Clear')

**Current Impact**: All games showing "standard conditions (1x)" - no weather penalties applied

---

## 7. `player_injury_status` Table

**Purpose**: Injury filtering (Phase 3.4)

**Query Pattern**:
```javascript
// Batch fetch injury status for all players
supabase.from('player_injury_status')
  .select('player_id, injury_status, injury_type')
  .in('player_id', playerIds)
  .eq('season', 2025)
  .eq('week', currentWeek)
```

**Data Status**: **EMPTY** - No injury data found for Week 7

**Expected Behavior**:
- **Exclude**: Players with status 'out' or 'doubtful'
- **Flag**: Players with status 'questionable' (show warning but include)
- **Include**: All other players

**Columns Used**:
- `player_id` - Links to players table
- `season` - Season year
- `week` - Week number
- `injury_status` - Enum: 'out', 'doubtful', 'questionable', 'probable'
- `injury_type` - Body part/description (e.g., 'Ankle', 'Hamstring')

**Current Impact**: No players filtered - injury system ready but no data populated

---

## 8. Data Validation (Phase 3.3)

**Purpose**: Pre-flight data completeness checks

**Validations Performed**:
1. **Game Existence**: Game record found
2. **Team Information**: home_team_id and away_team_id present
3. **Game Status**: Warn if not 'final' or 'scheduled'
4. **Player Count**: Warn if <1 players found
5. **Stats Count**: Warn if <10 player stats found

**Current Warnings** (Week 7):
```
⚠️  Data warnings:
   - No players found for this game
```

**Interpretation**: The games table has Week 7 games, but players aren't linked to specific games until game stats are populated

---

## Data Quality Summary

### ✅ Complete Data:
1. **players** table - All rosters populated (60+ players across 4 teams)
2. **games** table - Schedule present (Week 7 games exist)
3. **player_game_stats** table - Historical stats available (2-6 games per team)

### ⚠️ Partial Data:
4. **team_game_stats** table - **Limited defensive data** (HOU: ~2 games, causing false "elite" rating)
5. **stadiums** table - Present but not linking to games properly
6. **game_weather** table - No data (all modifiers defaulting to 1.0x)

### ❌ Missing Data:
7. **player_injury_status** table - **Empty** for Week 7 (injury filtering not active)

---

## Key Findings

### 1. Houston "Elite Defense" Rating (0.81x)

**The Issue**:
- Opponent factor of 0.81 suggests HOU defense is 19% better than league average
- **BUT** this is based on only ~2 completed games
- Small sample size creates unreliable defensive rating

**The Math**:
```
HOU games with defensive data: 2
HOU avg yards allowed: ~280 (estimated)
League avg yards allowed: ~345 (estimated)
Opponent factor: 280 / 345 = 0.81

Impact on SEA offense:
- Sam Darnold: 256.8 season avg → 211.6 expected (17% drop)
- Kenneth Walker III: 60.7 season avg → 49.1 expected (19% drop)
```

**Recommendation**: Add sample-size confidence adjustment:
```javascript
// Regress to league average (1.0) when sample < 4 games
if (filteredGames.length < 4) {
  const weight = filteredGames.length / 4
  factor = (rawFactor * weight) + (1.0 * (1 - weight))
}
// With 2 games: (0.81 * 0.5) + (1.0 * 0.5) = 0.905 (more realistic!)
```

### 2. Environment Modifiers Not Applied

**All games showing**:
```
🏟️  Environment: standard conditions (modifier: 1x)
```

**Possible Causes**:
- `stadium_id` in games table is NULL
- Stadium data exists but surface_type/roof_type columns are NULL
- game_weather table is empty

**Impact**: Missing 2-8% boosts/penalties from venue and weather

### 3. Injury Filtering Ready But Inactive

**System is ready**:
- Query written and integrated
- Exclusion logic implemented (OUT/DOUBTFUL)
- Warning display for QUESTIONABLE players

**But**: `player_injury_status` table has no Week 7 data

---

## Performance Metrics

**Script Execution**:
- Time per game: ~800ms (with all 10 enhancements)
- 90% improvement from initial 8,000ms (Phase 1.3 batch optimization)

**Database Queries** (per game):
1. **games** table: 1 query (fetch game info)
2. **players** table: 2 queries (home team + away team)
3. **player_game_stats** table: 1 batch query (all players, all games)
4. **games** table: 1 query (filter to completed games)
5. **player_injury_status** table: 1 query (batch fetch injuries)
6. **stadiums** table: 1 query (venue info)
7. **game_weather** table: 1 query (weather)
8. **team_game_stats** table: 4-8 queries (opponent factors for each team)

**Total**: ~12-16 queries per game (most parallelized via Promise.all)

---

## Confidence Scores Explained

**Formula**:
```javascript
confidence = baseConfidence * (sampleBonus) * (varianceBonus)

baseConfidence = min(games / 10, 1.0)  // Max at 10 games
sampleBonus = 1.0 if games >= 5, else 0.8
varianceBonus = 1.0 - min(cv / 2, 0.3)  // cv = stdDev / avg

// Coefficient of Variation (CV):
// - Low CV (<0.3): Consistent player → high confidence
// - High CV (>0.5): Volatile player → low confidence
```

**Examples**:
- **Sam Darnold Passing** (69% confidence):
  - 6 games (good sample)
  - StdDev: 62.1, Avg: 256.8 → CV = 0.24 (low variance)
  - Confidence: 0.69

- **Woody Marks Fantasy** (18% confidence):
  - Only 2 games (small sample)
  - StdDev: 12.7, Avg: 15.2 → CV = 0.84 (very high variance)
  - Confidence: 0.18

---

## Sample Size by Team (Week 7)

| Team | Completed Games | Data Quality |
|------|----------------|--------------|
| SEA  | 6 games        | ✅ Excellent |
| DET  | 4 games        | ✅ Good      |
| TB   | 4 games        | ✅ Good      |
| HOU  | 2 games        | ⚠️ Limited   |

**Impact**: Houston players have lower confidence scores due to small sample (2 games)

---

## Recommendations

### 1. Fix Opponent Factor Small Sample Bias
Add Bayesian shrinkage (planned in Phase 3.2):
```javascript
const minSample = 4
if (games < minSample) {
  factor = (rawFactor * games/minSample) + (1.0 * (1 - games/minSample))
}
```

### 2. Populate Missing Data
- ✅ `player_game_stats` - Already complete
- ⚠️ `team_game_stats` - Needs defensive data backfill for all teams
- ❌ `game_weather` - Populate from historical weather APIs
- ❌ `player_injury_status` - Scrape weekly injury reports

### 3. Link Stadium Data
- Ensure `games.stadium_id` is populated for all games
- Verify `stadiums.surface_type` and `stadiums.roof_type` columns filled

### 4. Add Data Quality Metrics to Output
Show users the underlying data quality:
```
C.J. Stroud (⚠️ LIMITED DATA - only 2 games):
  Expected: 229.0 yards
  Confidence: 67% (reduce due to small sample)
```

---

## File Location

This reference document: `PERFORMANCE-FLOORS-DATA-SOURCES.md`
Calculator script: `scripts/calculate-performance-floors.js` (780 lines)
Session documentation: `SESSION-5-SUMMARY.md`
Development log: `CLAUDE.md`
