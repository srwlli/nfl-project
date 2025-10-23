# Player Teams - Quick Reference Guide

> **Purpose**: Quick reference for player_teams table
> **Date**: October 22, 2025
> **Status**: ✅ Complete
> **CodeRef**: `updatePlayerRecords:164`

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

## SELECT Query String

```sql
player_team_id, player_id, team_id, start_season, end_season, jersey_number, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 6
- **Total Records**: 2,538 (all 32 team rosters)
- **Data Source**: ESPN Team Roster API
- **Auto-Populated**: ✅ Daily at 5:00 PM ET via scheduler

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| player_team_id | serial | 1234 | Auto-increment PK |
| player_id | varchar(50) | "espn-2969939" | FK to players |
| team_id | varchar(10) | "PHI" | FK to teams |
| start_season | integer | 2025 | Year player joined |
| end_season | integer | 2026 | NULL if still on team |
| jersey_number | integer | 11 | Player's number |

---

## Common Queries

### Get Team's Current Roster

```javascript
const { data } = await supabase
  .from('player_teams')
  .select(`
    *,
    player:players(full_name, position, height_inches, weight_lbs, college)
  `)
  .eq('team_id', 'PHI')
  .is('end_season', null)
  .order('player.position')

console.log(`${data.length} players on PHI roster`)
```

### Get Player's Team History

```javascript
const { data: history } = await supabase
  .from('player_teams')
  .select(`
    *,
    team:teams(team_name, team_abbr, logo_url)
  `)
  .eq('player_id', 'espn-2969939')
  .order('start_season', { ascending: false })

history.forEach(stint => {
  const years = stint.end_season
    ? `${stint.start_season}-${stint.end_season}`
    : `${stint.start_season}-Present`
  console.log(`${stint.team.team_abbr} (${years}) #${stint.jersey_number}`)
})
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
  .lte('start_season', 2024)
  .or('end_season.is.null,end_season.gte.2024')
```

### Find Players Who Changed Teams

```javascript
const { data } = await supabase
  .from('player_teams')
  .select(`
    *,
    player:players(full_name, position)
  `)
  .eq('start_season', 2025)
  .order('player.full_name')

// Group by player_id to find those with multiple teams
const playerTeamCounts = {}
data.forEach(record => {
  if (!playerTeamCounts[record.player_id]) {
    playerTeamCounts[record.player_id] = []
  }
  playerTeamCounts[record.player_id].push(record.team_id)
})

// Find players with > 1 team
const movers = Object.keys(playerTeamCounts)
  .filter(playerId => playerTeamCounts[playerId].length > 1)
```

---

## Display Helpers

### Format Player Team Stint

```javascript
const formatPlayerTeam = (record) => {
  const { start_season, end_season, team, jersey_number } = record
  const years = end_season ? `${start_season}-${end_season}` : `${start_season}-Present`
  const jersey = jersey_number ? `#${jersey_number}` : ''

  return `${team.team_abbr} ${jersey} (${years})`
}

// Usage
formatPlayerTeam({
  start_season: 2023,
  end_season: null,
  team: { team_abbr: 'KC' },
  jersey_number: 15
})
// "KC #15 (2023-Present)"
```

### Check if Player Currently on Team

```javascript
const isPlayerOnTeam = (playerId, teamId) => {
  const { data } = await supabase
    .from('player_teams')
    .select('player_team_id')
    .eq('player_id', playerId)
    .eq('team_id', teamId)
    .is('end_season', null)
    .single()

  return !!data
}

// Usage
const isActive = await isPlayerOnTeam('espn-2969939', 'PHI')
console.log(isActive)  // true or false
```

### Get Player's Current Team

```javascript
const getCurrentTeam = async (playerId) => {
  const { data } = await supabase
    .from('player_teams')
    .select(`
      *,
      team:teams(team_name, team_abbr, logo_url)
    `)
    .eq('player_id', playerId)
    .is('end_season', null)
    .single()

  return data?.team || null
}

// Usage
const team = await getCurrentTeam('espn-2969939')
console.log(team.team_name)  // "Philadelphia Eagles"
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Forgetting end_season filter

```javascript
.eq('team_id', 'PHI')  // Gets ALL historical players, not just current
```

### ✅ CORRECT - Include NULL check

```javascript
.eq('team_id', 'PHI')
.is('end_season', null)
```

### ❌ WRONG - Using .single() for player history

```javascript
.eq('player_id', 'espn-123')
.single()  // Player might have multiple team records
```

### ✅ CORRECT - Get all records

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

### ❌ WRONG - Assuming player.current_team_id exists

```javascript
.select('*, player:players(current_team_id)')  // current_team_id doesn't exist
```

### ✅ CORRECT - Use player_teams for current team

```javascript
.select('*, team:teams(team_name, team_abbr)')
.is('end_season', null)
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

**Key Code** (lines 182-197):
```javascript
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
```

---

## Interpretation Guide

### End Season Values

| end_season | Meaning | Example |
|------------|---------|---------|
| `NULL` | Currently on team | Player active on roster |
| `2024` | Left after 2024 season | Free agent or traded |
| `2025` | Left during 2025 season | Mid-season move |

### Timeline Examples

```javascript
// Example 1: Player joined in 2023, still on team
{ start_season: 2023, end_season: null }
// "Joined in 2023, currently active"

// Example 2: Player joined 2020, left 2024
{ start_season: 2020, end_season: 2024 }
// "Played 5 seasons (2020-2024)"

// Example 3: Player with multiple stints
[
  { start_season: 2018, end_season: 2021 },  // First stint
  { start_season: 2025, end_season: null }   // Returned
]
// "Played 2018-2021, returned 2025"
```

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

### Compare with Roster Transactions
```javascript
// player_teams: Long-term tenure
// roster_transactions: Daily movement events

// Get player's transaction history for current team
const { data } = await supabase
  .from('roster_transactions')
  .select('*')
  .eq('player_id', playerId)
  .eq('team_id', teamId)
  .order('transaction_date', { ascending: false })
```

---

## Frontend Display Examples

### Roster Table Component

```jsx
const RosterTable = ({ teamId }) => {
  const { data: roster } = useQuery(/* current roster query */)

  return (
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Position</th>
          <th>Ht/Wt</th>
          <th>College</th>
          <th>Since</th>
        </tr>
      </thead>
      <tbody>
        {roster?.map(player => (
          <tr key={player.player_team_id}>
            <td>{player.jersey_number}</td>
            <td>{player.player.full_name}</td>
            <td>{player.player.position}</td>
            <td>{player.player.height_inches}" / {player.player.weight_lbs} lbs</td>
            <td>{player.player.college}</td>
            <td>{player.start_season}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Player Career Timeline Component

```jsx
const PlayerTimeline = ({ playerId }) => {
  const { data: stints } = useQuery(/* player history query */)

  return (
    <div className="timeline">
      <h3>Team History</h3>
      {stints?.map(stint => {
        const years = stint.end_season
          ? `${stint.start_season}-${stint.end_season}`
          : `${stint.start_season}-Present`

        return (
          <div key={stint.player_team_id} className="stint">
            <img src={stint.team.logo_url} alt={stint.team.team_name} />
            <div>
              <strong>{stint.team.team_name}</strong>
              <span>#{stint.jersey_number} • {years}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
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

### Find Players on Multiple Teams (Error Check)

```sql
-- Should return 0 rows (business rule: one active team per player)
SELECT
  player_id,
  COUNT(*) as active_team_count
FROM player_teams
WHERE end_season IS NULL
GROUP BY player_id
HAVING COUNT(*) > 1;
```

---

## Testing & Debugging

### Test Roster Query

```bash
# Get roster for team
node -e "
const { getSupabaseClient } = require('./scripts/utils/supabase-client.js');
const supabase = getSupabaseClient();
supabase.from('player_teams')
  .select('*, player:players(full_name, position), team:teams(team_name)')
  .eq('team_id', 'PHI')
  .is('end_season', null)
  .then(({ data }) => {
    console.log(\`PHI Roster: \${data.length} players\`);
    data.forEach(p => {
      console.log(\`#\${p.jersey_number} \${p.player.full_name} (\${p.player.position})\`);
    });
  });
"
```

---

## Known Limitations

### 1. Start Season May Be Inaccurate ⚠️

**Issue**: For existing players, `start_season` is set to 2025 even if they joined earlier.

**Impact**: Can't rely on `start_season` for historical tenure.

**Workaround**: Only accurate for players added AFTER Oct 2025.

---

### 2. No Mid-Season Dates ⚠️

**Issue**: Only tracks season year, not exact dates.

**Impact**: Can't determine when during season player joined/left.

**Solution**: Use `roster_transactions` table for date-specific info.

---

### 3. Jersey Number Not Updated ⚠️

**Issue**: If player changes number, this table doesn't update.

**Impact**: May show outdated jersey number.

**Workaround**: Use `game_rosters` table for game-specific numbers.

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
**Total Records**: 2,538 (all 32 teams)
**Status**: ✅ Production Ready
**CodeRef**: updatePlayerRecords:164 ✅ Validated
