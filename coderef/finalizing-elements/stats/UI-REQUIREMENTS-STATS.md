# UI Requirements - Stats Pages

**Page Type:** NFL Statistics Pages (Current Season + Historical)
**For:** UI/UX Design Team
**Priority:** P0 - Critical
**Update Frequency:** Real-time (current) / Static (historical)

---

## Overview

Two distinct types with **different UI approaches**:

### **Historical Stats (1970-2024)**
- **Users**: Researchers, historians, Hall of Fame debaters
- **UI Style**: Dense tables, sortable, scannable
- **Navigation**: Year → Team → Player hierarchy
- **Key Features**: Era comparisons, all-time rankings, decade views

### **Current Season Stats (2025)**
- **Users**: Fantasy players, bettors, casual fans
- **UI Style**: Dynamic, filterable, real-time updates
- **Navigation**: Current week → Live games → Player stats
- **Key Features**: Live leaderboards, week-over-week changes, trending players

---

## What to Display

### Main Stats Table (Both Historical & Current)

**674 fields total for current season, 850 for historical**

**Priority Fields** (Always visible):

```javascript
{
  // Player Identity
  player_name: "Tom Brady",
  team: "NE",
  position: "QB",
  jersey_number: 12,

  // Games
  games_played: 16,
  games_started: 16,

  // Passing (if QB)
  passing_attempts: 578,
  passing_completions: 398,
  passing_yards: 4806,
  passing_touchdowns: 50,
  passing_interceptions: 8,
  completion_percentage: 68.9,
  yards_per_attempt: 8.3,
  passer_rating: 117.2,

  // Rushing (if RB/QB)
  rushing_attempts: 52,
  rushing_yards: 98,
  rushing_touchdowns: 2,
  yards_per_carry: 1.9,

  // Receiving (if WR/TE/RB)
  receptions: 85,
  receiving_yards: 1215,
  receiving_touchdowns: 9,
  targets: 120,
  catch_percentage: 70.8,
  yards_per_reception: 14.3,

  // Defense (if defensive player)
  tackles_total: 95,
  tackles_solo: 65,
  tackles_assists: 30,
  sacks: 12.5,
  interceptions: 3,
  passes_defended: 12,

  // Special Teams (if K/P)
  field_goals_made: 28,
  field_goals_attempted: 32,
  field_goal_percentage: 87.5,
  longest_field_goal: 54,
  extra_points_made: 45,
  extra_points_attempted: 46
}
```

**Advanced Stats** (Show on expand/toggle):
- EPA (Expected Points Added)
- CPOE (Completion Percentage Over Expected)
- Success Rate
- Situational splits (red zone, third down, etc.)
- Next Gen Stats (2016+): Speed, separation, time to throw

---

## Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Header: "2007 NFL Season Passing Leaders"]           │
├─────────────────────────────────────────────────────────┤
│  Filters:                                               │
│  Position: [QB ▼]  Team: [All ▼]  Min Attempts: [100]  │
│  Sort: [Passing Yards ▼]                                │
├─────────────────────────────────────────────────────────┤
│  Rank | Player        | Team | GP | CMP | ATT | YDS    │
│   1   | Tom Brady ★   | NE   | 16 | 398 | 578 | 4806   │
│   2   | Drew Brees    | NO   | 16 | 440 | 652 | 4423   │
│   3   | Brett Favre   | GB   | 16 | 356 | 535 | 4155   │
│  ...                                                     │
├─────────────────────────────────────────────────────────┤
│  [Pagination: 1 2 3 ... 50 →]                          │
└─────────────────────────────────────────────────────────┘
```

---

## UI Components Needed

### 1. Sortable Table
- Sticky headers
- Zebra striping
- Click column to sort
- Icons: ★ (Pro Bowl), 🏆 (Champion), 🏈 (HOF)

### 2. Filter Bar
- Position dropdown
- Team dropdown
- Year/season selector
- Statistical thresholds (min games, min attempts)

### 3. Stat Cards (Mobile view)
- Player headshot
- Key stats (3-5 most important)
- Expandable for full stats

### 4. Era Comparison Widget
- "How does this compare to other eras?"
- Show league averages by decade
- Adjust for rule changes

---

## API Integration

### Get Season Stats

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)

// Get current season passing leaders
const { data } = await supabase
  .from('player_season_stats')
  .select(`
    *,
    players (full_name, primary_position, headshot_url),
    teams (team_name, team_abbr, logo_url)
  `)
  .eq('season', 2024)
  .gte('passing_attempts', 100)
  .order('passing_yards', { ascending: false })
  .limit(50)

// Get historical season stats
const { data: historical } = await supabase
  .from('player_season_stats')
  .select('*')
  .eq('season', 2007)
  .eq('primary_position', 'QB')
  .order('passing_yards', { ascending: false })

// Use leaderboard function
const { data: leaderboard } = await supabase
  .rpc('get_season_leaderboard', {
    p_season: 2024,
    p_stat_category: 'passing_yards',
    p_position: 'QB',
    p_limit: 10
  })
```

---

## Design Principles

1. **Information Density**: Users are stats nerds - show more data, not less
2. **Scannable Tables**: Sortable columns, sticky headers, zebra striping
3. **Desktop-First**: Most users on desktop for deep stats
4. **Real-time Updates**: Live games update scores/stats without page refresh (current season)
5. **Context is King**: Show rankings, era comparisons, historical context alongside raw numbers

---

## Detailed Documentation

📄 **Current Season Requirements**: `current-season/current-season-stats-data-requirements.md` (1,330 lines)
📄 **Current Season Field List**: `current-season/current-season-stats-data-list.md` (674 fields)
📄 **Historical Requirements**: `historical/historical-stats-data-requirements.md` (1,416 lines)
📄 **Historical Field List**: `historical/historical-stats-data-list.md` (850 fields)
📄 **Design Context**: `context/stats-page-design.md` (3,438 lines)

---

## Summary

**Page Count**: 2 (Current + Historical)
**Total Fields**: 1,524 (674 current + 850 historical)
**Update Frequency**: Real-time for current, static for historical
**Complexity**: High
**Priority**: P0 - Critical

**Key Features**:
- Sortable, filterable stat tables
- Era comparisons
- Real-time leaderboards (current season)
- Historical rankings and context
- Advanced analytics (EPA, CPOE, Next Gen Stats)
