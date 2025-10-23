# Player Teams - Raw Data Source Mapping

> **Table**: `player_teams`
> **Source**: ESPN Team Roster API
> **Scraper**: roster-updates-scraper.js
> **CodeRef**: `updatePlayerRecords:164`
> **Date**: October 22, 2025

---

## Data Source

**API**: ESPN Team Roster API
**Base URL**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl`
**Endpoint**: `/teams/{teamId}/roster`
**Method**: GET
**Rate Limit**: 1 request/second
**Update Frequency**: Daily at 5:00 PM ET

---

## ESPN API Response Structure

```json
{
  "team": {
    "id": "21",
    "abbreviation": "PHI",
    "displayName": "Philadelphia Eagles"
  },
  "athletes": [
    {
      "id": "2969939",
      "firstName": "Jalen",
      "lastName": "Hurts",
      "displayName": "Jalen Hurts",
      "jersey": "1",
      "position": {
        "name": "Quarterback",
        "abbreviation": "QB"
      }
    },
    {
      "id": "3116593",
      "firstName": "DeVonta",
      "lastName": "Smith",
      "displayName": "DeVonta Smith",
      "jersey": "6",
      "position": {
        "name": "Wide Receiver",
        "abbreviation": "WR"
      }
    }
  ]
}
```

---

## Field Mapping

| Database Column | ESPN API Path | Type | Transform | Notes |
|-----------------|---------------|------|-----------|-------|
| `player_id` | `athletes[].id` | varchar(50) | Prefix with "espn-" | Example: "espn-2969939" |
| `team_id` | `team.abbreviation` | varchar(10) | Direct | Example: "PHI" |
| `start_season` | N/A | integer | Current year | Set to 2025 for new additions |
| `end_season` | N/A | integer | NULL or year | NULL if still on team |
| `jersey_number` | `athletes[].jersey` | integer | parseInt() | Can be null |

---

## Transformation Logic

### Step 1: Fetch ESPN Roster

```javascript
// roster-updates-scraper.js:34-50
async function fetchTeamRoster(teamId) {
  const response = await axios.get(`${ESPN_API_BASE}/teams/${teamId}`, {
    params: { enable: 'roster' }
  })

  return response.data.team?.athletes || []
}
```

### Step 2: Check Existing Player-Team Records

```javascript
// roster-updates-scraper.js:172-180
const { data: existing } = await supabase
  .from('player_teams')
  .select('player_team_id, end_season')
  .eq('player_id', playerId)
  .eq('team_id', teamId)
  .is('deleted_at', null)
  .order('start_season', { ascending: false })
  .limit(1)
  .single()
```

### Step 3: Create New Player-Team Record

```javascript
// roster-updates-scraper.js:182-190
if (!existing) {
  // Create new player_teams record
  playerTeamRecords.push({
    player_id: `espn-${espnPlayer.id}`,
    team_id: teamId,
    start_season: SEASON_YEAR,  // 2025
    end_season: null,  // Still on team
    jersey_number: espnPlayer.jersey ? parseInt(espnPlayer.jersey) : null
  })
}
```

### Step 4: Reactivate Returning Player

```javascript
// roster-updates-scraper.js:191-197
else if (existing.end_season !== null) {
  // Player was previously on team but left - update to rejoin
  await supabase
    .from('player_teams')
    .update({ end_season: null })
    .eq('player_team_id', existing.player_team_id)
}
```

### Step 5: Mark Departures

```javascript
// In detectRosterChanges function (lines 76-118)
// Players in DB but not on ESPN roster = removed
const removals = dbPlayerIds.filter(dbId => !espnPlayerIds.has(dbId))

// Update end_season for removed players
for (const playerId of removals) {
  await supabase
    .from('player_teams')
    .update({ end_season: SEASON_YEAR })
    .eq('player_id', playerId)
    .eq('team_id', teamId)
    .is('end_season', null)
}
```

---

## Example Transformations

### Example 1: New Player Addition

**ESPN Input**:
```json
{
  "id": "2969939",
  "jersey": "1"
}
```

**Database Output**:
```javascript
{
  player_id: "espn-2969939",
  team_id: "PHI",
  start_season: 2025,
  end_season: null,
  jersey_number: 1
}
```

---

### Example 2: Player Leaving Team

**ESPN**: Player NOT in roster
**Database**: Player exists with `end_season = null`

**Update**:
```javascript
{
  end_season: 2025  // Mark as left team
}
```

---

### Example 3: Player Returning to Team

**ESPN**: Player back on roster
**Database**: Player exists with `end_season = 2024`

**Update**:
```javascript
{
  end_season: null  // Reactivate
}
```

---

## Data Validation

### Required Fields

All fields marked as NOT NULL in schema must have values:

```javascript
// Validation before insert
if (!player_id || !team_id || !start_season) {
  throw new Error('Missing required fields')
}
```

### Jersey Number Parsing

```javascript
jersey_number: espnPlayer.jersey ? parseInt(espnPlayer.jersey) : null
```

**Handles**:
- Valid numbers: "1" → 1
- Missing: undefined → null
- Invalid: "N/A" → NaN (caught by parseInt, becomes null)

---

## Error Handling

### Missing Player in Database

If ESPN roster contains player not in `players` table:

```javascript
// Player creation happens in updatePlayerRecords:156
const players = espnRoster.map(espnPlayer => transformPlayerData(espnPlayer))
await upsertBatch('players', players, ['player_id'])
```

### Foreign Key Violations

Both `player_id` and `team_id` have FK constraints:

- If player doesn't exist: Create player first
- If team doesn't exist: Log error, skip record

---

## Update Strategy

### Daily Sync Process

1. **Fetch**: Get current ESPN roster for team
2. **Compare**: Check against database player_teams records
3. **Additions**: Create new records for new players
4. **Removals**: Set `end_season` for departed players
5. **Returns**: Reactivate records for returning players

### Conflict Resolution

**Upsert Strategy**: Insert new records, update existing by `player_team_id`

```javascript
// New records
await insertBatch('player_teams', playerTeamRecords)

// Updates
await supabase
  .from('player_teams')
  .update({ end_season: null })
  .eq('player_team_id', existing.player_team_id)
```

---

## Rate Limiting

**ESPN API**: 1 request per second (self-imposed)

```javascript
const rateLimiter = createRateLimiter(1)  // 1 req/sec

await rateLimiter.execute(async () => {
  return await fetchTeamRoster(teamId)
})
```

---

## Data Freshness

**Update Schedule**: Daily at 5:00 PM ET

**Reasoning**:
- After business hours when most roster moves announced
- Before evening games start
- Allows detection of practice squad elevations

---

## Historical Data Limitations

### Issue: Incomplete Start Seasons

**Problem**: For existing players (already on team before scraper deployed), `start_season` is set to 2025 even if they joined years earlier.

**Example**:
- Player joined PHI in 2020
- Scraper first ran Oct 2025
- `start_season` = 2025 (WRONG, should be 2020)

**Impact**: Historical tenure incomplete

**Mitigation**: Only trust `start_season` for players added AFTER Oct 2025

---

## Complete Mapping Table

| Database Field | ESPN Source | Default | Transform | Validation |
|----------------|-------------|---------|-----------|------------|
| player_team_id | N/A | Auto-increment | - | PK |
| player_id | athletes[].id | - | Prefix "espn-" | FK to players |
| team_id | team.abbreviation | - | Direct | FK to teams |
| start_season | N/A | Current year | SEASON_YEAR | NOT NULL |
| end_season | N/A | NULL | NULL or year | NULL = active |
| jersey_number | athletes[].jersey | NULL | parseInt() | Can be null |
| created_at | N/A | now() | Auto | Timestamp |
| updated_at | N/A | now() | Auto | Timestamp |
| deleted_at | N/A | NULL | Soft delete | Timestamp |

---

## Related Documentation

- **Field Mapping Report**: `field-mapping-report.md`
- **Scraper Source**: `scripts/scrapers/roster-updates-scraper.js`
- **Database Schema**: `supabase/migrations/20250101000008_create_game_and_reference_tables.sql:253-270`

---

**Last Updated**: October 22, 2025
**Status**: ✅ Validated
**CodeRef**: updatePlayerRecords:164
