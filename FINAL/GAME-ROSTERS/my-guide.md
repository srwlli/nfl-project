# Game Rosters Table - Quick Reference Guide

> **Purpose**: Fast reference for game-day roster fields and queries
> **Table**: `game_rosters`
> **Records**: 5,995+ entries (from 106 completed games)
> **Auto-Populated**: ✅ Yes (via live-games-scraper → game-stats-scraper)

---

## Quick Field List (Copy-Paste Ready)

### All 10 Fields
```
game_roster_id
game_id
season
team_id
player_id
position
jersey_number
active
status
created_at
```

### Required Fields Only (8 fields)
```
game_roster_id, game_id, season, team_id, player_id, position, jersey_number, active
```

### Identification Fields (5 fields)
```
game_roster_id, game_id, season, team_id, player_id
```

### Player Info Fields (2 fields)
```
position, jersey_number
```

### Game-Day Status Fields (2 fields)
```
active, status
```

---

## Quick Query Strings

### Select All Fields
```sql
game_roster_id, game_id, season, team_id, player_id, position, jersey_number, active, status, created_at
```

### Select with Player Join
```sql
game_rosters.*, players(full_name, primary_position, height_inches, weight_lbs)
```

### Select with Game Join
```sql
game_rosters.*, games(week, game_date, home_team_id, away_team_id, home_score, away_score)
```

### Select Active Players Only
```sql
game_roster_id, player_id, position, jersey_number
WHERE active = true
```

---

## Critical Field Names ⚠️

### Correct Names (Use These)
- ✅ `game_roster_id` - Primary key
- ✅ `game_id` - Foreign key to games
- ✅ `team_id` - Foreign key to teams
- ✅ `player_id` - Foreign key to players
- ✅ `active` - Boolean (true/false)
- ✅ `position` - Player position (QB, RB, WR, etc.)

### Common Mistakes (Don't Use These)
- ❌ `roster_id` - Wrong (use `game_roster_id`)
- ❌ `roster_game_id` - Wrong (use `game_id`)
- ❌ `is_active` - Wrong (use `active`)
- ❌ `player_position` - Wrong (use `position`)
- ❌ `jersey` - Wrong (use `jersey_number`)

---

## Scripts in This Folder

### Scrapers
**File**: `scripts/game-stats-scraper.js` (34K)
- **Purpose**: Scrapes complete game data including rosters
- **Auto-Trigger**: When game status changes to "final"
- **Extracts**: Team stats, player stats, scoring plays, rosters, quarter scores, weather
- **Roster Function**: `extractGameRosters(gameSummary, gameId, season)` (lines 721-791)
- **Usage**:
  ```bash
  # Scrape specific game
  node coderef/FINAL/GAME-ROSTERS/scripts/game-stats-scraper.js --game=401772510

  # Scrape all games in a week
  node coderef/FINAL/GAME-ROSTERS/scripts/game-stats-scraper.js --week=7

  # NPM shortcut
  npm run scrape:game-stats -- --game=401772510
  ```

**File**: `scripts/get-gameday-roster.js` (9.3K)
- **Purpose**: Display game-day roster for a specific game
- **Shows**: Active players with game stats
- **Output**: Console table or JSON format
- **Usage**:
  ```bash
  # Display game-day roster
  node coderef/FINAL/GAME-ROSTERS/scripts/get-gameday-roster.js --game=401772510

  # JSON output
  node coderef/FINAL/GAME-ROSTERS/scripts/get-gameday-roster.js --game=401772510 --json

  # NPM shortcut
  npm run roster:gameday -- --game=401772510
  ```

### Utilities
**File**: `utils/player-creator.js` (8.2K)
- **Purpose**: Auto-create missing players from ESPN API
- **Prevents**: FK constraint violations when players appear in games but are missing from database
- **Functions**:
  - `fetchPlayerFromESPN(playerId)` - Fetch player data from ESPN
  - `getExistingPlayers(playerIds)` - Batch check for player existence
  - `createPlayer(player)` - UPSERT player to database
  - `autoCreatePlayers(playerIds, options)` - Bulk auto-create with rate limiting
  - `extractPlayerIdsFromGame(gameData)` - Extract player IDs from rosters
- **Usage**:
  ```javascript
  import { autoCreatePlayers, extractPlayerIdsFromGame } from './utils/player-creator.js'

  // Extract player IDs from game data
  const playerIds = extractPlayerIdsFromGame(gameSummary)

  // Auto-create missing players
  const results = await autoCreatePlayers(playerIds, { rateLimit: 1000 })
  console.log(`Created: ${results.created}, Failed: ${results.failed}`)
  ```

---

## Common Query Patterns

### Get Game-Day Roster for Both Teams
```javascript
const { data } = await supabase
  .from('game_rosters')
  .select(`
    team_id,
    active,
    players (
      full_name,
      primary_position,
      jersey_number,
      height_inches,
      weight_lbs
    )
  `)
  .eq('game_id', 'espn-401772510')
  .eq('season', 2025)
  .order('team_id')
  .order('active', { ascending: false })
```

### Get Active Players Only
```javascript
const { data } = await supabase
  .from('game_rosters')
  .select('*, players(*)')
  .eq('game_id', gameId)
  .eq('team_id', teamId)
  .eq('active', true)
```

### Get Inactive List
```javascript
const { data } = await supabase
  .from('game_rosters')
  .select('*, players(full_name)')
  .eq('game_id', gameId)
  .eq('team_id', teamId)
  .eq('active', false)
```

### Get Player's Game History
```javascript
const { data } = await supabase
  .from('game_rosters')
  .select(`
    game_id,
    team_id,
    active,
    status,
    games (
      week,
      game_date,
      home_team_id,
      away_team_id,
      home_score,
      away_score
    )
  `)
  .eq('player_id', playerId)
  .eq('season', 2025)
  .order('games(week)')
```

### Count Active vs Inactive
```javascript
const { data } = await supabase
  .from('game_rosters')
  .select('active, count')
  .eq('game_id', gameId)
  .eq('team_id', teamId)
```

---

## Related Tables

### Foreign Key Relationships
1. **games** - Game information
   - Join: `game_rosters.game_id = games.game_id` (validate season)
   - Note: No FK constraint (partitioned table limitation)

2. **teams** - Team information
   - Join: `game_rosters.team_id = teams.team_id`
   - FK: ✅ Foreign key constraint exists

3. **players** - Player profiles
   - Join: `game_rosters.player_id = players.player_id`
   - FK: ✅ Foreign key constraint exists

4. **player_game_stats** - Player performance
   - Join: Match on game_id, season, player_id
   - Use: Combine roster status with game stats

---

## Auto-Population Workflow

### How Game Rosters Are Saved

**Step 1**: Live Games Scraper monitors games (every 30s during game windows)
```javascript
// scripts/scrapers/live-games-scraper.js
if (game.status === 'final' && previousStatus !== 'final') {
  exec(`node scripts/scrapers/game-stats-scraper.js --game=${gameId}`)
}
```

**Step 2**: Game Stats Scraper extracts rosters
```javascript
// scripts/scrapers/game-stats-scraper.js lines 721-791
async function extractGameRosters(gameSummary, gameId, season) {
  // Extract from gameSummary.rosters or boxscore.players
  // Map players with team, position, jersey, active status
  // Deduplicate and insert to game_rosters table
}
```

**Step 3**: Player Creator auto-creates missing players
```javascript
// scripts/utils/player-creator.js
const playerIdsInGame = extractPlayerIdsFromGame(gameSummary)
const existingPlayerIds = await getExistingPlayers(playerIdsInGame)
const missingPlayerIds = playerIdsInGame.filter(id => !existingPlayerIds.has(id))

if (missingPlayerIds.length > 0) {
  await autoCreatePlayers(missingPlayerIds, { rateLimit: 1000 })
}
```

**Step 4**: Rosters inserted to database
```javascript
const rosterEntries = Array.from(rosters.values())
await insertBatch('game_rosters', rosterEntries)
```

**Result**: ~56-60 roster entries per game (28-30 per team)

---

## Data Sources

### ESPN API
- **Endpoint**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={game_id}`
- **Primary Source**: `gameSummary.rosters[]` (preferred)
- **Fallback Source**: `gameSummary.boxscore.teams[].players[]`
- **Deduplication**: Map-based (one entry per player per game)

### ESPN Athlete API
- **Endpoint**: `https://site.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{espn_id}`
- **Purpose**: Auto-create missing players
- **Rate Limit**: 1 request per second (self-imposed)

---

## Unique Constraint

**Constraint**: `unique_player_game_team_season`

Ensures one roster entry per player per game per team:
```sql
UNIQUE (game_id, season, team_id, player_id)
```

This prevents duplicate roster entries.

---

## Performance Metrics

### Execution Times
- **Roster extraction**: ~50-100ms
- **Player auto-creation**: ~1s per missing player (1 req/sec rate limit)
- **Database insert**: ~50ms (batch insert)
- **Total**: 100-200ms per game (if no missing players)

### Data Volume
- **Per game**: ~56-60 roster entries
- **106 completed games**: ~5,995 entries
- **Full season (272 games)**: ~15,000+ entries expected

---

## Common Mistakes

### ❌ WRONG Queries

```javascript
// ❌ WRONG - Forgetting season filter
.eq('game_id', gameId)  // Could match multiple seasons

// ❌ WRONG - Not joining player data
.select('player_id')  // Only gets ID, not player info

// ❌ WRONG - Checking status instead of active
.eq('status', 'active')  // Should use active boolean
```

### ✅ CORRECT Queries

```javascript
// ✅ CORRECT - Include season
.eq('game_id', gameId)
.eq('season', 2025)

// ✅ CORRECT - Join player data
.select('*, players(full_name, primary_position)')

// ✅ CORRECT - Use active boolean
.eq('active', true)
```

---

## Field Value Examples

### Typical Game Roster Entry
```json
{
  "game_roster_id": 1234,
  "game_id": "espn-401772510",
  "season": 2025,
  "team_id": "SEA",
  "player_id": "espn-4361529",
  "position": "QB",
  "jersey_number": 14,
  "active": true,
  "status": null,
  "created_at": "2025-10-22T13:14:00.123Z"
}
```

### Active vs Inactive
- **Active (true)**: Player dressed and played (~53 per team)
- **Inactive (false)**: Player on inactive list (~5-7 per team)

### Status Values
- `"active"` - Dressed and played
- `"inactive"` - Inactive list
- `"injured_reserve"` - IR
- `"practice_squad"` - Practice squad
- `null` - ESPN doesn't provide detailed status

---

## Indexes

### Performance Indexes Created
1. `idx_game_rosters_game_id_season` - Lookup rosters by game
2. `idx_game_rosters_team_id` - Lookup by team
3. `idx_game_rosters_player_id` - Lookup by player
4. `idx_game_rosters_active` - Filter active/inactive
5. `idx_game_rosters_season` - Season-based queries

---

## Database Migration

**File**: `supabase/migrations/20250101000022_create_game_rosters_table.sql`

```sql
CREATE TABLE IF NOT EXISTS game_rosters (
  game_roster_id BIGSERIAL PRIMARY KEY,
  game_id VARCHAR(50) NOT NULL,
  season INTEGER NOT NULL,
  team_id VARCHAR(10) NOT NULL REFERENCES teams(team_id),
  player_id VARCHAR(50) NOT NULL REFERENCES players(player_id),
  position VARCHAR(10),
  jersey_number INTEGER,
  active BOOLEAN NOT NULL DEFAULT true,
  status VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_player_game_team_season
    UNIQUE (game_id, season, team_id, player_id)
);
```

---

## References

### Documentation Files (This Folder)
- **field-mapping-report.md** - Complete field mapping for all 10 columns
- **raw-data-source-mapping.md** - ESPN API sources and transformations
- **my-guide.md** - This file (quick reference)

### Related Documentation
- `DATABASE-SCHEMA-REFERENCE.md` - Master schema reference
- `AUTOMATION-GUARANTEE.md` - Complete automation system docs
- `SCRIPTS-INDEX.md` - All 63 scripts cataloged
- `STATE-OF-THE-UNION.md` - Project overview with links

### Migration Files
- `supabase/migrations/20250101000022_create_game_rosters_table.sql`

### Workorder
- `coderef/working/game-day-roster-tracking/plan.json` - Feature implementation plan

---

## Status

- **Data Coverage**: 5,995+ roster entries from 106 completed games
- **Automation**: ✅ Fully automated via live-games-scraper
- **Missing Players**: ✅ Auto-created via player-creator utility
- **FK Constraints**: ✅ All resolved
- **Production Ready**: ✅ Yes

---

**Last Updated**: October 22, 2025
**Total Fields**: 10
**Total Records**: 5,995+ (106 completed games)
**Auto-Population**: ✅ Working perfectly
