# Team Season Stats - Quick Reference Guide

> **Purpose**: Quick reference for team_season_stats table
> **Date**: October 22, 2025
> **Status**: ✅ Complete
> **CodeRef**: `transformToTeamSeasonStats:202`

---

## All 11 Fields (Copy-Paste Ready)

```
team_season_stat_id, team_id, season, games_played, wins, losses, ties, win_percentage, points_for, points_against, point_differential, division_rank, conference_rank
```

---

## Field Categories

### Identification (3 fields)
```
team_season_stat_id, team_id, season
```

### Record (4 fields)
```
games_played, wins, losses, ties
```

### Performance Metrics (4 fields)
```
win_percentage, points_for, points_against, point_differential
```

### Rankings (2 fields)
```
division_rank, conference_rank
```

---

## SELECT Query String

```sql
team_season_stat_id, team_id, season, games_played, wins, losses, ties, win_percentage, points_for, points_against, point_differential, division_rank, conference_rank, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 11
- **Total Records**: 32 (one per team for 2025 season)
- **Data Source**: Database (games table) - NOT ESPN API
- **Auto-Populated**: ✅ Daily at 7:00 AM ET via scheduler

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| team_season_stat_id | serial | 123 | Auto-increment PK |
| team_id | string | "KC" | FK to teams |
| season | integer | 2025 | FK to seasons |
| games_played | integer | 17 | Counted from games |
| wins | integer | 12 | Calculated from scores |
| losses | integer | 5 | Calculated from scores |
| ties | integer | 0 | Calculated from scores |
| win_percentage | decimal | 0.7059 | (wins+ties*0.5)/games |
| points_for | integer | 425 | Sum of team's scores |
| points_against | integer | 312 | Sum of opponent scores |
| point_differential | integer | 113 | points_for - points_against |
| division_rank | integer | 1 | 1-4 rank in division |
| conference_rank | integer | 3 | 1-16 rank in conference |

---

## Common Queries

### Get Team Season Stats
```javascript
const { data } = await supabase
  .from('team_season_stats')
  .select(`
    *,
    team:teams(team_name, team_abbr, logo_url, division, conference)
  `)
  .eq('team_id', 'KC')
  .eq('season', 2025)
  .single()

console.log(`${data.team.team_name}: ${data.wins}-${data.losses}`)
console.log(`Win %: ${(data.win_percentage * 100).toFixed(1)}%`)
```

### Get Division Standings
```javascript
const { data: standings } = await supabase
  .from('team_season_stats')
  .select(`
    *,
    team:teams(team_name, team_abbr, division)
  `)
  .eq('season', 2025)
  .eq('team.division', 'AFC West')
  .order('division_rank')
```

### Get Conference Standings
```javascript
const { data: standings } = await supabase
  .from('team_season_stats')
  .select(`
    *,
    team:teams(team_name, team_abbr, conference)
  `)
  .eq('season', 2025)
  .eq('team.conference', 'AFC')
  .order('conference_rank')
  .limit(7)  // Playoff teams
```

### Get Top Teams
```javascript
const { data } = await supabase
  .from('team_season_stats')
  .select(`
    *,
    team:teams(team_name, team_abbr)
  `)
  .eq('season', 2025)
  .order('win_percentage', { ascending: false })
  .limit(10)
```

---

## Display Helpers

### Format Record
```javascript
const formatRecord = (stats) => {
  const record = `${stats.wins}-${stats.losses}`
  return stats.ties > 0 ? `${record}-${stats.ties}` : record
}

// Usage
formatRecord({ wins: 12, losses: 5, ties: 0 })  // "12-5"
formatRecord({ wins: 10, losses: 5, ties: 2 })  // "10-5-2"
```

### Format Win Percentage
```javascript
const formatWinPct = (winPct) => {
  if (!winPct && winPct !== 0) return 'N/A'
  return (winPct * 100).toFixed(1) + '%'
}

// Usage
formatWinPct(0.7059)  // "70.6%"
formatWinPct(0.5000)  // "50.0%"
```

### Format Point Differential
```javascript
const formatPointDiff = (diff) => {
  if (diff > 0) return `+${diff}`
  return diff.toString()
}

// Usage
formatPointDiff(113)   // "+113"
formatPointDiff(-45)   // "-45"
formatPointDiff(0)     // "0"
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Forgetting season filter
```javascript
.eq('team_id', 'KC')  // Could match multiple seasons
```

### ✅ CORRECT - Include season
```javascript
.eq('team_id', 'KC')
.eq('season', 2025)
```

### ❌ WRONG - Win percentage as percentage
```javascript
.gte('win_percentage', 70)  // Stored as 0.70, not 70!
```

### ✅ CORRECT - Decimal format
```javascript
.gte('win_percentage', 0.700)
```

### ❌ WRONG - Not joining team data
```javascript
.select('team_id')  // Only gets ID
```

### ✅ CORRECT - Join teams
```javascript
.select('*, team:teams(team_name, team_abbr, division, conference)')
```

### ❌ WRONG - Ordering by wins only
```javascript
.order('wins', { ascending: false })  // Should use win_percentage
```

### ✅ CORRECT - Order by win percentage
```javascript
.order('win_percentage', { ascending: false })
```

---

## Scripts in This Folder

### **File**: `scripts/scrapers/standings-scraper.js`
- **Purpose**: Calculate team season statistics from games
- **Calculation Function**: `transformToTeamSeasonStats` (lines 202-224)
- **Auto-Trigger**: Daily at 7:00 AM ET via scheduler
- **Data Source**: Database (games table), NOT ESPN API

**Usage**:
```bash
# Calculate standings for current season
npm run scrape:standings

# Calculate for specific season
npm run scrape:standings -- --season=2025
```

**What It Does**:
1. Fetches all completed games from database
2. Initializes records for all 32 teams
3. Processes each game to calculate wins/losses/points
4. Calculates division rankings (1-4 per division)
5. Calculates conference rankings (1-16 per conference)
6. Transforms to team_season_stats schema
7. Upserts to database

**Key Code** (lines 202-224):
```javascript
function transformToTeamSeasonStats(teamRecords, season) {
  return teamRecords.filter(team => team.games_played > 0).map(team => {
    const winPct = team.games_played > 0
      ? (team.wins + team.ties * 0.5) / team.games_played
      : 0

    return {
      team_id: team.team_id,
      season: season,
      games_played: team.games_played,
      wins: team.wins,
      losses: team.losses,
      ties: team.ties,
      win_percentage: parseFloat(winPct.toFixed(4)),
      points_for: team.points_for,
      points_against: team.points_against,
      point_differential: team.points_for - team.points_against,
      division_rank: team.division_rank,
      conference_rank: team.conference_rank
    }
  })
}
```

---

## Calculation Formulas

### Win Percentage
```
win_percentage = (wins + (ties × 0.5)) / games_played

Examples:
  12-5-0 → (12 + 0) / 17 = 0.7059
  10-5-2 → (10 + 1) / 17 = 0.6471
```

### Point Differential
```
point_differential = points_for - points_against

Examples:
  425 for, 312 against → +113 (strong)
  280 for, 350 against → -70 (weak)
```

### Division Rank
```
1. Sort teams in division by win_percentage (DESC)
2. Tiebreaker: point_differential (DESC)
3. Assign rank 1-4
```

### Conference Rank
```
1. Sort teams in conference by win_percentage (DESC)
2. Tiebreaker: point_differential (DESC)
3. Assign rank 1-16
```

---

## Related Tables

### Join with Teams
```javascript
.select(`
  *,
  team:teams(team_name, team_abbr, logo_url, division, conference)
`)
```

### Join with Seasons
```javascript
.select(`
  *,
  season_info:seasons(season_type)
`)
```

---

## Frontend Display Examples

### Standings Table Component
```jsx
const StandingsTable = ({ division }) => {
  const { data: standings } = useQuery(/* division query */)

  return (
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Team</th>
          <th>W-L-T</th>
          <th>Win %</th>
          <th>PF</th>
          <th>PA</th>
          <th>Diff</th>
        </tr>
      </thead>
      <tbody>
        {standings?.map(team => (
          <tr key={team.team_id}>
            <td>{team.division_rank}</td>
            <td>{team.team.team_abbr}</td>
            <td>{formatRecord(team)}</td>
            <td>{formatWinPct(team.win_percentage)}</td>
            <td>{team.points_for}</td>
            <td>{team.points_against}</td>
            <td>{formatPointDiff(team.point_differential)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Playoff Picture Component
```jsx
const PlayoffPicture = ({ conference }) => {
  const { data: teams } = useQuery(/* top 7 teams */)

  return (
    <div className="playoff-picture">
      <h3>{conference} Playoff Picture</h3>
      {teams?.map((team, idx) => (
        <div key={team.team_id} className={idx < 4 ? 'division-winner' : 'wildcard'}>
          <span className="seed">{team.conference_rank}</span>
          <span className="team">{team.team.team_name}</span>
          <span className="record">{formatRecord(team)}</span>
        </div>
      ))}
    </div>
  )
}
```

---

## Validation Queries

### Check Data Completeness
```sql
-- Should have 32 teams for current season
SELECT COUNT(*) as team_count
FROM team_season_stats
WHERE season = 2025;
```

### Find Teams with No Games
```sql
SELECT
  tss.team_id,
  t.team_name,
  tss.games_played
FROM team_season_stats tss
JOIN teams t ON tss.team_id = t.team_id
WHERE tss.season = 2025
  AND tss.games_played = 0;
```

### Verify Rankings
```sql
-- Division ranks should be 1-4
SELECT
  team_id,
  division_rank
FROM team_season_stats
JOIN teams USING (team_id)
WHERE season = 2025
  AND division = 'AFC West'
ORDER BY division_rank;
```

---

## Testing & Debugging

### Test Calculation
```bash
# Calculate standings
npm run scrape:standings

# Check database
node -e "
const { getSupabaseClient } = require('./scripts/utils/supabase-client.js');
const supabase = getSupabaseClient();
supabase.from('team_season_stats')
  .select('*, team:teams(team_name, team_abbr, division)')
  .eq('season', 2025)
  .eq('team.division', 'AFC West')
  .order('division_rank')
  .then(({ data }) => {
    data.forEach(t => {
      console.log(\`\${t.division_rank}. \${t.team.team_abbr} \${t.wins}-\${t.losses} (\${(t.win_percentage*100).toFixed(1)}%)\`)
    })
  });
"
```

---

## Known Limitations

### 1. Simplified Tiebreakers ⚠️

**Issue**: Only uses win_percentage and point_differential for rankings.

**Missing NFL Tiebreakers**:
- Head-to-head record
- Division record
- Conference record
- Common games record
- Strength of victory
- Strength of schedule

**Impact**: Rankings may differ from official NFL standings in tiebreaker scenarios.

**Workaround**: Treat as approximation, not official standings.

---

### 2. Rankings Update Daily, Not Real-Time ⚠️

**Issue**: Scheduler runs at 7:00 AM ET.

**Impact**: Stats lag behind completed games until next morning.

**Solution**: Run manually after games:
```bash
npm run scrape:standings
```

---

### 3. Constraint: wins + losses + ties = games_played ⚠️

**Issue**: Database enforces this CHECK constraint.

**Impact**: If calculation is wrong, upsert will fail.

**Solution**: Scraper logic is correct, but manual updates must respect this.

---

## Documentation Links

- **Field Mapping**: `TEAM-SEASON-STATS-RESOURCES/field-mapping-report.md` - All 11 fields documented
- **Raw Data Sources**: `TEAM-SEASON-STATS-RESOURCES/raw-data-source-mapping.md` - Database calculation logic
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000007_create_team_stats_tables.sql` (lines 8-29)
- **CodeRef**: transformToTeamSeasonStats at standings-scraper.js:202

---

## Quick Commands

```bash
# Calculate standings
npm run scrape:standings

# Calculate for specific season
npm run scrape:standings -- --season=2025

# Check data completeness
node scripts/validate-data-completeness.js
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 11
**Total Records**: 32 (one per team for 2025 season)
**Status**: ✅ Production Ready
**CodeRef**: transformToTeamSeasonStats:202 ✅ Validated
