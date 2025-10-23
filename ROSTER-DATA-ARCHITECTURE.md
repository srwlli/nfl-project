# Roster Data Architecture - Three-Tier System

## Current State Analysis

We have **3 different types of roster data** needed:

### 1️⃣ Full Team Roster (~80 players)
**What**: All players under contract (53-man roster + practice squad + IR)
**Current Table**: `player_teams`
**Current Source**: `roster-updates-scraper.js` (daily)
**Data**:
- Eagles example: 81 players
- Includes: Active roster, practice squad, IR, suspended
- Updates: Daily via roster-updates-scraper

✅ **Status**: ALREADY WORKING

---

### 2️⃣ Game-Day 53-Man Roster (Active/Inactive)
**What**: Official 53-man roster for specific game with active/inactive status
**Current Table**: `game_rosters`
**Current Source**: `game-stats-scraper.js` (extracts from boxscore)
**Current Data**:
- Eagles Week 3: Only 29 players (players who PLAYED)
- Missing: 24+ players who were on roster but didn't play

⚠️ **Status**: PARTIALLY WORKING (only captures players with stats)

**What We Need**:
- Full 53-man game-day roster
- Active/Inactive designation (47 active + 6-8 inactive typical)
- Even players with 0 stats should be included

---

### 3️⃣ Players Who Recorded Stats
**What**: Players who actually participated and recorded statistics
**Current Table**: `player_game_stats`
**Current Source**: `game-stats-scraper.js`
**Data**:
- Eagles Week 3: ~29 players with stats
- Includes: All players who touched ball, made tackle, etc.

✅ **Status**: ALREADY WORKING

---

## Architecture Recommendation

### Option A: Use Existing game_rosters Table (RECOMMENDED)

**Current Schema** (already exists):
```sql
CREATE TABLE game_rosters (
  game_roster_id BIGSERIAL PRIMARY KEY,
  game_id VARCHAR(50) NOT NULL,
  season INTEGER NOT NULL,
  team_id VARCHAR(10) NOT NULL,
  player_id VARCHAR(50) NOT NULL,
  position VARCHAR(10),
  jersey_number INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,  -- ✅ Already has this
  status VARCHAR(20),                     -- ✅ Already has this
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Usage**:
```javascript
// Query active players for game
SELECT * FROM game_rosters
WHERE game_id = 'espn-401772839'
  AND team_id = 'PHI'
  AND active = true;  // 46-48 active players

// Query inactive players for game
SELECT * FROM game_rosters
WHERE game_id = 'espn-401772839'
  AND team_id = 'PHI'
  AND active = false;  // 5-7 inactive players

// Get all stats for active players
SELECT gr.*, pgs.*
FROM game_rosters gr
LEFT JOIN player_game_stats pgs
  ON gr.player_id = pgs.player_id
  AND gr.game_id = pgs.game_id
WHERE gr.game_id = 'espn-401772839'
  AND gr.team_id = 'PHI'
  AND gr.active = true;
```

---

## ESPN API Endpoints for Full Roster

### Endpoint 1: Game Summary (Current)
**URL**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={gameId}`

**Current Usage**: `game-stats-scraper.js` uses this
**Data Available**:
- `gameSummary.boxscore.players` - Players with stats only (~30)
- `gameSummary.rosters` - **MAY have full roster with active/inactive**

**Investigation Needed**: Check if `.rosters` array contains full 53-man

---

### Endpoint 2: Team Roster (Alternative)
**URL**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{teamId}/roster`

**Current Usage**: `roster-updates-scraper.js` uses this for full team roster
**Data Available**:
- Full 53-man + practice squad
- But: NOT game-specific (no active/inactive per game)

---

### Endpoint 3: Play-by-Play (Check)
**URL**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/playbyplay?event={gameId}`

**Potential**: May list all active players
**Investigation Needed**: Check response structure

---

## Recommended Implementation Plan

### Phase 1: Investigate ESPN Data (30 min)
1. Test if `gameSummary.rosters` contains full 53-man roster
2. Check if it includes `active` field
3. Test on recent game (Week 7)

**Script to create**: `scripts/investigate-espn-rosters.js`

---

### Phase 2: Enhance game-stats-scraper.js (1-2 hours)

**Current extractGameRosters() function**:
```javascript
// Currently extracts from boxscore.players (only players with stats)
function extractGameRosters(gameSummary, gameId, season, teamIds) {
  if (!gameSummary.rosters || gameSummary.rosters.length === 0) {
    // Fallback to boxscore.players
    // ⚠️ This only gets ~30 players
  }

  // Process rosters array
  // ✅ This should have full 53-man
}
```

**Enhancement needed**:
1. Prioritize `gameSummary.rosters` over `boxscore.players`
2. Extract `active` status from roster data
3. Populate all 53 players (active + inactive)
4. Ensure players without stats are still included

---

### Phase 3: Backfill Missing Rosters (2-3 hours)

After enhancer scraper:
1. Re-scrape Weeks 1-7 to populate full rosters
2. Verify each game has ~100-110 roster entries (53 × 2 teams)
3. Validate active/inactive counts (should be ~94 active, ~12-16 inactive per game)

---

### Phase 4: Validation (30 min)

```javascript
// Validation query
SELECT
  game_id,
  team_id,
  COUNT(*) as total_roster,
  COUNT(*) FILTER (WHERE active = true) as active_players,
  COUNT(*) FILTER (WHERE active = false) as inactive_players
FROM game_rosters
WHERE season = 2025
GROUP BY game_id, team_id
ORDER BY game_id, team_id;

// Expected per team:
// total_roster: 53
// active_players: 46-48
// inactive_players: 5-7
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FULL TEAM ROSTER (player_teams)                          │
│ Source: roster-updates-scraper.js (daily)                   │
│ Data: 80+ players (all contracts)                           │
│ Purpose: Current team composition                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. GAME-DAY 53-MAN ROSTER (game_rosters)                    │
│ Source: game-stats-scraper.js (post-game)                   │
│ Data: 53 players per team (active: true/false)              │
│ Purpose: Who was eligible to play this game                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PLAYERS WITH STATS (player_game_stats)                   │
│ Source: game-stats-scraper.js (post-game)                   │
│ Data: ~30-35 players per team (who recorded stats)          │
│ Purpose: Game statistics                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Example Queries (After Implementation)

### Get Eagles Week 3 Full Game-Day Roster
```sql
SELECT
  p.full_name,
  gr.position,
  gr.jersey_number,
  gr.active,
  CASE WHEN pgs.player_id IS NOT NULL THEN '✅ Played' ELSE '❌ Did not play' END as played_status,
  pgs.fantasy_points_ppr
FROM game_rosters gr
JOIN players p ON gr.player_id = p.player_id
LEFT JOIN player_game_stats pgs
  ON gr.player_id = pgs.player_id
  AND gr.game_id = pgs.game_id
WHERE gr.game_id = 'espn-401772839'
  AND gr.team_id = 'PHI'
ORDER BY gr.active DESC, p.full_name;
```

**Expected Result**:
- 53 total rows
- 46-48 with `active = true`
- 5-7 with `active = false`
- ~29 with `played_status = '✅ Played'`
- ~24 with `played_status = '❌ Did not play'` (inactive or active but no stats)

---

### Get All Active Players Who Didn't Record Stats
```sql
SELECT
  p.full_name,
  gr.position,
  gr.team_id
FROM game_rosters gr
JOIN players p ON gr.player_id = p.player_id
LEFT JOIN player_game_stats pgs
  ON gr.player_id = pgs.player_id
  AND gr.game_id = pgs.game_id
WHERE gr.game_id = 'espn-401772839'
  AND gr.active = true
  AND pgs.player_id IS NULL;
```

**Purpose**: Find active players who were dressed but didn't play (backups, special teams only, etc.)

---

## Next Steps

1. **Investigate**: Create `scripts/investigate-espn-rosters.js` to check ESPN data
2. **Enhance**: Update `extractGameRosters()` in `game-stats-scraper.js`
3. **Backfill**: Re-scrape Weeks 1-7 with enhanced scraper
4. **Validate**: Verify all games have full 53-man rosters

**Estimated Time**: 4-6 hours total

---

## Benefits

✅ Complete game-day roster tracking
✅ Know who was active vs inactive
✅ Identify players who dressed but didn't play
✅ Historical roster data for all games
✅ Support for injury analysis (active but 0 stats = likely injured mid-game)
✅ Better fantasy football insights

---

**Status**: Architecture documented, ready for implementation
**File**: ROSTER-DATA-ARCHITECTURE.md
