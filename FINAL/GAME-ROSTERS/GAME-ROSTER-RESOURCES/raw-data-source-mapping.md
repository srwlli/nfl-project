# Game Rosters Table - Raw Data Source Mapping

> **Purpose**: Maps each database field to its raw data source
> **Date Generated**: October 22, 2025
> **Data Source**: ESPN API Game Summary (`/summary?event={game_id}`)

---

## Field-by-Field Source Mapping

### 1. game_roster_id
- **Database Column**: `game_roster_id`
- **Data Type**: BIGSERIAL
- **Raw Source**: Database auto-generated
- **API Path**: N/A
- **Transformation**: Auto-increment primary key
- **Example Raw**: N/A
- **Example Stored**: `1234`
- **Script**: Database default

---

### 2. game_id
- **Database Column**: `game_id`
- **Data Type**: VARCHAR(50)
- **Raw Source**: Function parameter
- **API Path**: N/A (passed to function)
- **Transformation**: None (direct)
- **Example Raw**: `"401772510"`
- **Example Stored**: `"espn-401772510"`
- **Script**: `game-stats-scraper.js` line 696

---

### 3. season
- **Database Column**: `season`
- **Data Type**: INTEGER
- **Raw Source**: Function parameter
- **API Path**: N/A (passed to function)
- **Transformation**: None (direct)
- **Example Raw**: `2025`
- **Example Stored**: `2025`
- **Script**: `game-stats-scraper.js` line 696

---

### 4. team_id
- **Database Column**: `team_id`
- **Data Type**: VARCHAR(10)
- **Raw Source**: ESPN API game summary
- **API Path**: `gameSummary.boxscore.teams[].team.abbreviation`
- **Transformation**: None (direct)
- **Example Raw**: `"SEA"`
- **Example Stored**: `"SEA"`
- **Script**: `game-stats-scraper.js` extractGameRosters()

---

### 5. player_id
- **Database Column**: `player_id`
- **Data Type**: VARCHAR(50)
- **Raw Source**: ESPN API roster/boxscore
- **API Path**: `gameSummary.rosters[].roster[].athlete.id` OR `boxscore.players[].athlete.id`
- **Transformation**: Prefix with "espn-"
- **Example Raw**: `"4361529"`
- **Example Stored**: `"espn-4361529"`
- **Script**: `game-stats-scraper.js` extractGameRosters()

---

### 6. position
- **Database Column**: `position`
- **Data Type**: VARCHAR(10)
- **Raw Source**: ESPN API athlete position
- **API Path**: `athlete.position.abbreviation`
- **Transformation**: None (direct)
- **Example Raw**: `"QB"`
- **Example Stored**: `"QB"`
- **Script**: `game-stats-scraper.js` extractGameRosters()

---

### 7. jersey_number
- **Database Column**: `jersey_number`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API athlete jersey
- **API Path**: `athlete.jersey`
- **Transformation**: parseInt() or NULL
- **Example Raw**: `"14"`
- **Example Stored**: `14`
- **Script**: `game-stats-scraper.js` extractGameRosters()

---

### 8. active
- **Database Column**: `active`
- **Data Type**: BOOLEAN
- **Raw Source**: Inferred from roster presence
- **API Path**: N/A
- **Transformation**: Default true (all players in boxscore are active)
- **Example Raw**: N/A
- **Example Stored**: `true`
- **Script**: `game-stats-scraper.js` extractGameRosters()
```javascript
active: true  // All players in boxscore were active
```

---

### 9. status
- **Database Column**: `status`
- **Data Type**: VARCHAR(20)
- **Raw Source**: Not provided by ESPN
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated
**Note**: ESPN API doesn't provide detailed status (active/inactive/IR/practice squad)

---

### 10. created_at
- **Database Column**: `created_at`
- **Data Type**: TIMESTAMPTZ
- **Raw Source**: Database auto-generated
- **API Path**: N/A
- **Transformation**: `NOW()`
- **Example Raw**: N/A
- **Example Stored**: `"2025-10-22T13:14:00.123Z"`
- **Script**: Database default

---

## ESPN API Response Example

### Raw API Game Summary Structure

```json
{
  "boxscore": {
    "teams": [
      {
        "team": {
          "id": "26",
          "abbreviation": "SEA",
          "displayName": "Seattle Seahawks"
        },
        "statistics": [...],
        "players": [
          {
            "athlete": {
              "id": "4361529",
              "displayName": "Sam Darnold",
              "jersey": "14",
              "position": {
                "abbreviation": "QB"
              }
            },
            "stats": [...]
          }
        ]
      }
    ]
  },
  "rosters": [
    {
      "team": {
        "id": "26",
        "abbreviation": "SEA"
      },
      "roster": [
        {
          "athlete": {
            "id": "4361529",
            "displayName": "Sam Darnold",
            "jersey": "14",
            "position": {
              "abbreviation": "QB"
            }
          }
        }
      ]
    }
  ]
}
```

---

## Data Source Scripts

### Primary Script
**File**: `scripts/scrapers/game-stats-scraper.js`
**Function**: `extractGameRosters(gameSummary, gameId, season)`
**Lines**: 721-791

### Extraction Process

```javascript
async function extractGameRosters(gameSummary, gameId, season) {
  const rosters = new Map()  // Deduplication

  // Try rosters array first (more complete)
  if (gameSummary.rosters && Array.isArray(gameSummary.rosters)) {
    for (const teamRoster of gameSummary.rosters) {
      const teamAbbr = teamRoster.team?.abbreviation

      for (const entry of teamRoster.roster || []) {
        const athlete = entry.athlete
        const playerId = `espn-${athlete.id}`

        rosters.set(playerId, {
          game_id: gameId,
          season: season,
          team_id: teamAbbr,
          player_id: playerId,
          position: athlete.position?.abbreviation || null,
          jersey_number: athlete.jersey ? parseInt(athlete.jersey) : null,
          active: true
        })
      }
    }
  }

  // Fallback to boxscore.players if rosters not available
  if (rosters.size === 0 && gameSummary.boxscore?.teams) {
    for (const team of gameSummary.boxscore.teams) {
      const teamAbbr = team.team?.abbreviation

      for (const playerEntry of team.players || []) {
        const athlete = playerEntry.athlete
        const playerId = `espn-${athlete.id}`

        rosters.set(playerId, {
          game_id: gameId,
          season: season,
          team_id: teamAbbr,
          player_id: playerId,
          position: athlete.position?.abbreviation || null,
          jersey_number: athlete.jersey ? parseInt(athlete.jersey) : null,
          active: true
        })
      }
    }
  }

  // Insert to database
  const rosterEntries = Array.from(rosters.values())
  await insertBatch('game_rosters', rosterEntries)
}
```

---

## Auto-Creation of Missing Players

### Player Creator Integration

**When**: Before roster insertion
**File**: `scripts/utils/player-creator.js`
**Purpose**: Auto-create any players not in database

```javascript
// Extract player IDs from game
const playerIdsInGame = extractPlayerIdsFromGame(gameSummary)

// Check which exist
const existingPlayerIds = await getExistingPlayers(playerIdsInGame)

// Auto-create missing
const missingPlayerIds = playerIdsInGame.filter(
  id => !existingPlayerIds.has(id)
)

if (missingPlayerIds.length > 0) {
  await autoCreatePlayers(missingPlayerIds, { rateLimit: 1000 })
}
```

---

## Field Population Summary

| Field | ESPN API | Calculated | Database | Always NULL |
|-------|----------|------------|----------|-------------|
| game_roster_id | | | ✅ | |
| game_id | ✅ (param) | | | |
| season | ✅ (param) | | | |
| team_id | ✅ | | | |
| player_id | ✅ (transformed) | | | |
| position | ✅ | | | |
| jersey_number | ✅ | | | |
| active | | ✅ (true) | | |
| status | | | | ✅ |
| created_at | | | ✅ | |

---

## Data Quality Notes

### Fields Always Populated
- `game_roster_id` - Auto-increment primary key
- `game_id` - Required parameter
- `season` - Required parameter
- `team_id` - From ESPN API
- `player_id` - From ESPN API (auto-creates if missing)
- `active` - Defaults to true
- `created_at` - Auto-generated timestamp

### Fields Sometimes NULL
- `position` - NULL if not in ESPN response
- `jersey_number` - NULL if not in ESPN response

### Fields Always NULL
- `status` - ESPN doesn't provide detailed status

---

## Deduplication Strategy

### Map-Based Deduplication

**Purpose**: Prevent duplicate roster entries
**Method**: Use Map with player_id as key

```javascript
const rosters = new Map()

// First source: rosters array
for (const entry of teamRoster.roster) {
  const playerId = `espn-${entry.athlete.id}`
  rosters.set(playerId, {...})  // Overwrites duplicates
}

// Second source: boxscore (fallback)
if (rosters.size === 0) {
  // Only use if rosters array was empty
}
```

**Result**: One entry per player per game

---

## Validation Rules

### Required Fields (enforced by database)
- `game_id` - NOT NULL
- `season` - NOT NULL
- `team_id` - NOT NULL (FK to teams)
- `player_id` - NOT NULL (FK to players)
- `active` - NOT NULL (default true)

### Unique Constraint
```sql
CONSTRAINT unique_player_game_team_season
  UNIQUE (game_id, season, team_id, player_id)
```

Prevents duplicate roster entries for same player in same game.

---

## Two Data Sources

### Source 1: gameSummary.rosters (Preferred)
```json
{
  "rosters": [
    {
      "team": { "abbreviation": "SEA" },
      "roster": [
        {
          "athlete": {
            "id": "4361529",
            "displayName": "Sam Darnold",
            "jersey": "14",
            "position": { "abbreviation": "QB" }
          }
        }
      ]
    }
  ]
}
```

**Pros**: More complete, dedicated roster structure
**Cons**: Sometimes not present in ESPN response

### Source 2: boxscore.teams[].players (Fallback)
```json
{
  "boxscore": {
    "teams": [
      {
        "team": { "abbreviation": "SEA" },
        "players": [
          {
            "athlete": {
              "id": "4361529",
              "jersey": "14",
              "position": { "abbreviation": "QB" }
            },
            "stats": [...]
          }
        ]
      }
    ]
  }
}
```

**Pros**: Always present (players who had stats)
**Cons**: May miss inactive players who didn't record stats

---

## Automation Workflow

### Complete Flow

1. **Live Games Scraper** (`live-games-scraper.js`)
   - Runs every 30 seconds during game windows
   - Checks game status via ESPN API
   - Detects when status changes to "final"

2. **Auto-Trigger** (in live-games-scraper.js)
   ```javascript
   if (game.status === 'final' && previousStatus !== 'final') {
     exec(`node scripts/scrapers/game-stats-scraper.js --game=${gameId}`)
   }
   ```

3. **Game Stats Scraper** (`game-stats-scraper.js`)
   - Fetches complete game summary from ESPN
   - Extracts player IDs from rosters
   - Auto-creates missing players
   - Extracts roster entries
   - Inserts to `game_rosters` table

4. **Result**
   - ~56-60 roster entries per game (28-30 per team)
   - Both teams' rosters saved
   - Historical snapshot preserved

---

## Performance Metrics

### Execution Time
- **Roster extraction**: ~50-100ms
- **Player auto-creation**: ~1s per missing player (1 req/sec rate limit)
- **Database insert**: ~50ms (batch insert)
- **Total**: 100-200ms per game (if no missing players)

### Data Volume
- **Per game**: ~56-60 roster entries
- **106 completed games**: ~5,995 entries
- **Full season (272 games)**: ~15,000+ entries expected

---

## Error Handling

### Missing Data Scenarios

**1. No rosters array**
```javascript
if (rosters.size === 0) {
  // Fallback to boxscore.players
}
```

**2. Missing player in database**
```javascript
await autoCreatePlayers(missingPlayerIds)
// Creates player before inserting roster
```

**3. Team FK constraint**
```javascript
// Fixed in Session 6: Query games table for correct team IDs
const { data: game } = await supabase
  .from('games')
  .select('home_team_id, away_team_id')
  .eq('game_id', gameId)
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-22 | Initial raw data source mapping |

---

## References

- **Scraper**: `scripts/scrapers/game-stats-scraper.js` (lines 721-791)
- **Player Creator**: `scripts/utils/player-creator.js`
- **Migration**: `supabase/migrations/20250101000022_create_game_rosters_table.sql`
- **Display**: `scripts/get-gameday-roster.js`

---

**Last Updated**: October 22, 2025
**Data Source**: ESPN API Game Summary (boxscore + rosters)
**Total Fields**: 10 (6 from ESPN, 2 calculated, 2 database)
**Automation**: ✅ Fully automated via live-games-scraper
