# Urgent Fix: Filter Out Injured Players

## Issue
Bucky Irving (RB, TB) appears in Week 7 projections despite being injured this week.

## Root Cause
`calculate-performance-floors.js` does NOT check `player_injury_status` table before generating projections.

## Current Behavior
Script pulls all players with `player_game_stats` records, regardless of injury status.

## Required Fix

### Step 1: Query Injury Status
After fetching `playerDetails` from `players` table (line ~111), query `player_injury_status`:

```javascript
// Get injury statuses for these players
const { data: injuries } = await supabase
  .from('player_injury_status')
  .select('player_id, injury_status')
  .in('player_id', uniquePlayerIds)
  .eq('season', season)
```

### Step 2: Filter Out Injured Players
Before building `enrichedPlayers`, filter out injured:

```javascript
const injuryMap = new Map(injuries?.map(i => [i.player_id, i.injury_status]) || [])

const enrichedPlayers = uniquePlayerIds
  .map(id => {
    const player = playerMap.get(id)
    const injuryStatus = injuryMap.get(id)

    // Skip if injured
    if (injuryStatus === 'out' || injuryStatus === 'doubtful') {
      return null
    }

    return player
  })
  .filter(p => p !== undefined && p !== null)
```

### Step 3: Optional - Flag Questionable Players
For questionable players, include them but add a warning flag:

```javascript
if (injuryStatus === 'questionable') {
  player.injury_warning = true
}
```

Then display with a warning icon in output:
```javascript
console.log(`\n  ${player.player_name}${player.injury_warning ? ' ⚠️  QUESTIONABLE' : ''} (${player.games_played} games):`)
```

## Database Schema
```sql
-- player_injury_status table
player_id VARCHAR(50)
season INTEGER
week INTEGER
injury_status injury_status_enum  -- 'out', 'doubtful', 'questionable', 'probable'
injury_type VARCHAR(100)
updated_at TIMESTAMP
```

## Testing
1. Check that Bucky Irving does NOT appear in Week 7 projections after fix
2. Verify questionable players show warning flag
3. Ensure players with no injury record still appear normally

## Priority
**HIGH** - Real-world impact on projection accuracy

## Estimated Time
15-30 minutes

## Related
- See `coderef/working/performance-floors-enhancements/context.json`
- Edge Cases section, line: "Skip injured players (status = 'INJURED')"
