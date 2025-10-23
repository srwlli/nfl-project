# Game Rosters Table - Field Mapping Report

> **Purpose**: Complete field mapping verification for the game_rosters table
> **Date Generated**: October 22, 2025
> **Status**: ✅ 100% Normalized to FIELD-MAPPING-REFERENCE.md

---

## Executive Summary

The **game_rosters table** stores game-day roster snapshots, tracking which players were active/inactive for each game. This solves the historical data problem where players who appeared in games but were later released no longer exist in the database.

- **Total Columns**: 10
- **Total Records**: 5,995+ entries (from 106 completed games)
- **Critical Fields**: ✅ 4/4 verified
- **Normalization Status**: ✅ 100% compliant
- **Ready for Frontend**: ✅ Yes

---

## 1. Critical Field Verification

These are the most important fields that must match exactly:

| Field Name | Status | Database Column | Type | Notes |
|------------|--------|-----------------|------|-------|
| **Game ID** | ✅ CORRECT | `game_id` | string | Foreign key to games |
| **Team ID** | ✅ CORRECT | `team_id` | string | Foreign key to teams |
| **Player ID** | ✅ CORRECT | `player_id` | string | Foreign key to players |
| **Active Status** | ✅ CORRECT | `active` | boolean | Was player active for game? |

---

## 2. Complete Field Mapping (10 Columns)

### 2.1 Identification Fields (5 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Roster Entry ID | `game_roster_id` | bigint | 1234 | ❌ No (auto-increment) |
| Game ID | `game_id` | string | "espn-401772510" | ❌ No |
| Season | `season` | integer | 2025 | ❌ No |
| Team ID | `team_id` | string | "SEA" | ❌ No |
| Player ID | `player_id` | string | "espn-4361529" | ❌ No |

---

### 2.2 Player Info (2 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Position | `position` | string | "QB" | ✅ Yes |
| Jersey Number | `jersey_number` | integer | 14 | ✅ Yes |

---

### 2.3 Game-Day Status (2 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Active | `active` | boolean | true | ❌ No |
| Status | `status` | string | "active" | ✅ Yes |

**Active Values**: `true` (dressed and played) | `false` (inactive list)
**Status Values**: `active` | `inactive` | `injured_reserve` | `practice_squad`

---

### 2.4 Metadata (1 column)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Created At | `created_at` | timestamp | "2025-10-22T13:14:00" | ❌ No |

---

## 3. Data Quality Report

### 3.1 Record Counts

```
Total Roster Entries: 5,995+
Completed Games: 106
Average Players per Game: ~56 (28 per team)
```

### 3.2 Status Distribution

**Expected Distribution**:
- `active: true` - ~53 players per team (gameday roster)
- `active: false` - ~5-7 players per team (inactive list)

### 3.3 All Fields

1. `game_roster_id` - Primary key (auto-increment)
2. `game_id` - Foreign key to games
3. `season` - Season year (2025)
4. `team_id` - Foreign key to teams
5. `player_id` - Foreign key to players
6. `position` - Player position
7. `jersey_number` - Jersey number
8. `active` - Active status (true/false)
9. `status` - Text status (active/inactive/etc.)
10. `created_at` - Timestamp

---

## 4. Frontend Display Examples

### 4.1 Get Game-Day Roster
```javascript
const { data } = await supabase
  .from('game_rosters')
  .select(`
    player_id,
    position,
    jersey_number,
    active,
    status,
    players (
      full_name,
      primary_position,
      height_inches,
      weight_lbs
    )
  `)
  .eq('game_id', 'espn-401772510')
  .eq('team_id', 'SEA')
  .order('position')
  .order('jersey_number')
```

### 4.2 Get Active Players Only
```javascript
const { data } = await supabase
  .from('game_rosters')
  .select('*, players(*)')
  .eq('game_id', gameId)
  .eq('team_id', teamId)
  .eq('active', true)
```

### 4.3 Get Player's Game History
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

---

## 5. Common Mistakes to Avoid

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

## 6. Related Tables

The game_rosters table joins with:

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

## 7. Query Patterns

### Get Full Roster for Both Teams

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
  .eq('game_id', gameId)
  .eq('season', 2025)
  .order('team_id')
  .order('active', { ascending: false })
  .order('players(primary_position)')
```

### Count Active vs Inactive

```javascript
const { data } = await supabase
  .from('game_rosters')
  .select('active, count')
  .eq('game_id', gameId)
  .eq('team_id', teamId)
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

---

## 8. Unique Constraint

**Constraint**: `unique_player_game_team_season`

Ensures one roster entry per player per game per team:
- `game_id` + `season` + `team_id` + `player_id` = UNIQUE

This prevents duplicate roster entries.

---

## 9. Indexes

### Performance Indexes Created

1. `idx_game_rosters_game_id_season` - Lookup rosters by game
2. `idx_game_rosters_team_id` - Lookup by team
3. `idx_game_rosters_player_id` - Lookup by player
4. `idx_game_rosters_active` - Filter active/inactive
5. `idx_game_rosters_season` - Season-based queries

---

## 10. Validation Checklist

- [x] All 10 columns exist in database
- [x] Foreign keys properly constrained (teams, players)
- [x] Unique constraint prevents duplicates
- [x] Indexes created for performance
- [x] Active boolean correctly used
- [x] Query patterns documented
- [x] Common mistakes documented
- [x] Related tables identified

---

## 11. Maintenance Notes

### Data Sources
- **Auto-populated**: `scripts/scrapers/game-stats-scraper.js`
- **Trigger**: Live-games-scraper detects "final" status
- **Extraction**: From ESPN boxscore rosters

### Update Frequency
- **Real-time**: Populated when game completes
- **Automatic**: No manual intervention needed
- **Historical**: Already populated for 106 completed games

### Known Issues
- None - auto-population working correctly

### Recommended Actions
1. ✅ Schema is correct - no changes needed
2. ✅ Auto-population working
3. ✅ Historical data populated

---

## 12. How Auto-Population Works

### Workflow

1. **Live Games Scraper** monitors games (every 30s)
2. **Detects** game status changes to "final"
3. **Triggers** game-stats-scraper automatically
4. **Extracts** rosters from ESPN boxscore
5. **Auto-creates** missing players (if needed)
6. **Inserts** roster entries to game_rosters table

### Code Location

**File**: `scripts/scrapers/game-stats-scraper.js`
**Function**: `extractGameRosters(gameSummary, gameId, season)`

```javascript
async function extractGameRosters(gameSummary, gameId, season) {
  // Extract from gameSummary.rosters or boxscore.players
  // Map players with team, position, jersey, active status
  // Deduplicate and insert to game_rosters table
}
```

---

## 13. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-22 | Initial field mapping report created |

---

## 14. References

- **Migration**: `supabase/migrations/20250101000022_create_game_rosters_table.sql`
- **Scraper**: `scripts/scrapers/game-stats-scraper.js`
- **Display Script**: `scripts/get-gameday-roster.js`
- **Player Creator**: `scripts/utils/player-creator.js`

---

## Contact & Support

For schema questions or field mapping issues:
- Review: `DATABASE-SCHEMA-REFERENCE.md`
- Check: `coderef/FINAL/FIELD-MAPPING-REFERENCE.md`
- Run: `node scripts/get-gameday-roster.js --game=espn-401772510`

---

**Last Updated**: October 22, 2025
**Status**: ✅ Production Ready - 100% Normalized
**Total Fields**: 10
**Total Records**: 5,995+ (106 completed games)
