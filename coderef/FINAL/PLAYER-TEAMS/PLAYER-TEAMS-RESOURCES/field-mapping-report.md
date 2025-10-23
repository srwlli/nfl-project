# Player Teams Table - Field Mapping Report

> **Purpose**: Complete field mapping verification for the player_teams table
> **Date Generated**: October 22, 2025
> **Status**: ✅ 100% Normalized
> **CodeRef**: `updatePlayerRecords:164`

---

## Executive Summary

The **player_teams table** stores player-team relationships tracking when players join and leave teams. This is a critical relationship table that maintains historical team rosters and enables tracking of player movement throughout their careers.

- **Total Columns**: 6 (+ 3 metadata)
- **Total Records**: 2,538 records (current 2025 season rosters)
- **Critical Fields**: ✅ 6/6 verified
- **Normalization Status**: ✅ 100% compliant
- **Ready for Frontend**: ✅ Yes
- **Auto-Populated**: ✅ Via roster-updates-scraper (daily at 5:00 PM ET)

---

## All 6 Fields (Copy-Paste Ready)

```
player_team_id, player_id, team_id, start_season, end_season, jersey_number
```

---

## Field Categories

### Identification (3 fields)
```
player_team_id, player_id, team_id
```

### Timeline (2 fields)
```
start_season, end_season
```

### Additional Info (1 field)
```
jersey_number
```

---

## Complete Field Mapping

| Field Name | Database Column | Type | Example | Nullable | Notes |
|------------|-----------------|------|---------|----------|-------|
| Player Team ID | `player_team_id` | serial | 1234 | ❌ No | Auto-increment PK |
| Player ID | `player_id` | varchar(50) | "espn-2969939" | ❌ No | FK to players |
| Team ID | `team_id` | varchar(10) | "PHI" | ❌ No | FK to teams |
| Start Season | `start_season` | integer | 2025 | ❌ No | Year player joined |
| End Season | `end_season` | integer | 2026 | ✅ Yes | NULL = still on team |
| Jersey Number | `jersey_number` | integer | 11 | ✅ Yes | Player's number |

---

## Data Source Mapping

### ESPN API → Database

**Source**: ESPN Team Roster API
**Endpoint**: `/teams/{teamId}/roster`
**Extraction Function**: `updatePlayerRecords:164` in roster-updates-scraper.js

```javascript
// ESPN API Response
{
  "id": "2969939",
  "jersey": "11"
}

// Transformed to Database
{
  player_id: "espn-2969939",
  team_id: "PHI",
  start_season: 2025,
  end_season: null,  // Still on team
  jersey_number: 11
}
```

---

## Common Queries

### Get Team's Current Roster

```javascript
const { data: currentRoster } = await supabase
  .from('player_teams')
  .select(`
    *,
    player:players(full_name, position, height_inches, weight_lbs)
  `)
  .eq('team_id', 'PHI')
  .is('end_season', null)  // Currently on team
  .order('player.position')
```

### Get Player's Team History

```javascript
const { data: teamHistory } = await supabase
  .from('player_teams')
  .select(`
    *,
    team:teams(team_name, team_abbr, logo_url)
  `)
  .eq('player_id', 'espn-2969939')
  .order('start_season', { ascending: false })
```

### Get All Players on Team in Specific Season

```javascript
const { data: roster2024 } = await supabase
  .from('player_teams')
  .select(`
    *,
    player:players(full_name, position)
  `)
  .eq('team_id', 'KC')
  .lte('start_season', 2024)  // Joined before or during 2024
  .or('end_season.is.null,end_season.gte.2024')  // Still on team OR left after 2024
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Not filtering for current roster
```javascript
.eq('team_id', 'PHI')  // Gets ALL historical players, not just current
```

### ✅ CORRECT - Include end_season filter
```javascript
.eq('team_id', 'PHI')
.is('end_season', null)
```

### ❌ WRONG - Assuming one record per player
```javascript
.eq('player_id', 'espn-123')
.single()  // Player might have multiple team history records
```

### ✅ CORRECT - Get all records, order by season
```javascript
.eq('player_id', 'espn-123')
.order('start_season', { ascending: false })
```

### ❌ WRONG - Not handling NULL end_season
```javascript
.eq('end_season', 2025)  // Misses active players (end_season = NULL)
```

### ✅ CORRECT - Use OR with is.null
```javascript
.or('end_season.is.null,end_season.gte.2025')
```

---

## Scripts in This Folder

### **File**: `scripts/scrapers/roster-updates-scraper.js`
- **Purpose**: Track daily roster changes and update player_teams relationships
- **Update Function**: `updatePlayerRecords` (lines 152-206)
- **Auto-Trigger**: Daily at 5:00 PM ET via scheduler
- **Data Source**: ESPN Team Roster API

**Usage**:
```bash
# Update all team rosters
npm run scrape:roster

# Update specific team
npm run scrape:roster -- --team=PHI
```

**What It Does**:
1. Fetches current ESPN roster for team
2. Compares ESPN roster vs database player_teams records
3. For new players: Creates player_teams record with `end_season = NULL`
4. For returning players: Updates existing record to set `end_season = NULL`
5. For removed players: Sets `end_season = current_year`

**Key Code** (lines 164-206):
```javascript
// Update player_teams relationships
const playerTeamRecords = []

for (const espnPlayer of espnRoster) {
  const playerId = `espn-${espnPlayer.id}`

  // Check if player_teams record exists for this player + team
  const { data: existing } = await supabase
    .from('player_teams')
    .select('player_team_id, end_season')
    .eq('player_id', playerId)
    .eq('team_id', teamId)
    .is('deleted_at', null)
    .order('start_season', { ascending: false })
    .limit(1)
    .single()

  if (!existing) {
    // Create new player_teams record
    playerTeamRecords.push({
      player_id: playerId,
      team_id: teamId,
      start_season: SEASON_YEAR,
      end_season: null,  // Still on team
      jersey_number: espnPlayer.jersey ? parseInt(espnPlayer.jersey) : null
    })
  } else if (existing.end_season !== null) {
    // Player was previously on team but left - update to rejoin
    await supabase
      .from('player_teams')
      .update({ end_season: null })
      .eq('player_team_id', existing.player_team_id)
  }
}

// Insert new player_teams records
if (playerTeamRecords.length > 0) {
  await insertBatch('player_teams', playerTeamRecords)
}
```

---

## Business Logic

### Player Lifecycle

**New Player Joins Team**:
```javascript
// Creates record
{
  player_id: "espn-123",
  team_id: "PHI",
  start_season: 2025,
  end_season: null,  // Active
  jersey_number: 11
}
```

**Player Leaves Team**:
```javascript
// Updates record
{
  end_season: 2025  // No longer active
}
```

**Player Rejoins Team**:
```javascript
// Sets end_season back to NULL
{
  end_season: null  // Active again
}
```

---

## Known Limitations

### 1. Start Season May Be Inaccurate ⚠️

**Issue**: When a player is first detected on a team, `start_season` is set to current season (e.g., 2025), even if they actually joined years earlier.

**Impact**: Historical data incomplete for existing players.

**Workaround**: Only accurate for players added AFTER scraper deployment (Oct 2025+).

---

### 2. No Mid-Season Tracking ⚠️

**Issue**: Player joins/leaves during season are detected but recorded with season year only (no specific date).

**Impact**: Can't determine exact date player joined/left.

**Solution**: Use `roster_transactions` table for date-specific movements.

---

### 3. Jersey Number Changes Not Tracked ⚠️

**Issue**: If player changes number mid-career, `jersey_number` field shows only the number at time of joining.

**Impact**: Historical jersey numbers incomplete.

**Workaround**: Use `game_rosters` table for game-specific jersey numbers.

---

## Related Tables

### Join with Players
```javascript
.select(`
  *,
  player:players(full_name, position, college, draft_year)
`)
```

### Join with Teams
```javascript
.select(`
  *,
  team:teams(team_name, team_abbr, logo_url, division, conference)
`)
```

---

## Validation Queries

### Check Data Completeness
```sql
-- Should have ~2,500+ records (all current rosters)
SELECT COUNT(*) as active_player_count
FROM player_teams
WHERE end_season IS NULL;
```

### Find Teams with No Active Players
```sql
SELECT
  t.team_id,
  t.team_name,
  COUNT(pt.player_team_id) as player_count
FROM teams t
LEFT JOIN player_teams pt ON t.team_id = pt.team_id AND pt.end_season IS NULL
GROUP BY t.team_id, t.team_name
HAVING COUNT(pt.player_team_id) = 0;
```

### Find Players Who Changed Teams
```sql
SELECT
  p.full_name,
  COUNT(pt.player_team_id) as team_count
FROM players p
JOIN player_teams pt ON p.player_id = pt.player_id
GROUP BY p.player_id, p.full_name
HAVING COUNT(pt.player_team_id) > 1
ORDER BY team_count DESC;
```

---

## Documentation Links

- **Field Mapping**: `PLAYER-TEAMS-RESOURCES/field-mapping-report.md` - All 6 fields documented
- **Raw Data Sources**: `PLAYER-TEAMS-RESOURCES/raw-data-source-mapping.md` - ESPN API mappings
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000008_create_game_and_reference_tables.sql` (lines 253-270)
- **CodeRef**: updatePlayerRecords at roster-updates-scraper.js:164

---

## Quick Commands

```bash
# Update all team rosters
npm run scrape:roster

# Update specific team
npm run scrape:roster -- --team=PHI

# Check roster completeness
node scripts/validate-data-completeness.js
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 6
**Total Records**: 2,538 (all 32 teams populated)
**Status**: ✅ Production Ready
**CodeRef**: updatePlayerRecords:164 ✅ Validated
