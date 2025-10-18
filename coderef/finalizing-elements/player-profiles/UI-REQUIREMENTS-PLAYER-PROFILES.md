# UI Requirements - Player Profile Pages

**Page Type:** NFL Player Profiles
**For:** UI/UX Design Team
**Priority:** P0 - Critical
**Page Count:** 27,000+ (active, retired, historical players)
**Update Frequency:** Daily

---

## Overview

**Comprehensive career information** for all NFL players with focus on:
- Hero header with visual identity
- Complete biographical data
- Full career stats (season-by-season + career totals)
- Awards, achievements, Hall of Fame status
- Career timeline and transactions
- Advanced analytics (EPA, Next Gen Stats)

---

## Page Sections (8 Main Sections)

### 1. Hero Header

```javascript
{
  player_name: "Patrick Mahomes",
  jersey_number: 15,
  position: "QB",
  current_team: {
    name: "Kansas City Chiefs",
    abbreviation: "KC",
    logo_url: "..."
  },
  headshot_url: "...",
  player_status: "active", // or "retired", "injured_reserve", etc.
  hall_of_fame: {
    inducted: false,
    eligible_year: null
  }
}
```

**Visual**: Large headshot, jersey number, team logo/colors, status badge

---

### 2. Quick Stats Bar (Physical & Bio)

```javascript
{
  height: "6-3",
  weight: 225,
  age: 28,
  birth_date: "1995-09-17",
  birthplace: "Tyler, TX",
  college: "Texas Tech",
  draft: {
    year: 2017,
    round: 1,
    pick: 10,
    team: "Kansas City Chiefs"
  },
  years_pro: 7
}
```

**Visual**: Horizontal bar with icons, responsive (stacks on mobile)

---

### 3. Career Stats Summary (Career Totals)

```javascript
{
  career_totals: {
    seasons: 7,
    games_played: 98,
    games_started: 90,

    // Position-specific totals
    passing_yards: 28424,
    passing_touchdowns: 219,
    passing_interceptions: 63,
    completion_percentage: 66.5,
    passer_rating: 103.8,

    // Rankings
    all_time_passing_yards_rank: 125,
    all_time_passing_tds_rank: 89,

    // Awards
    mvp_awards: 2,
    super_bowl_wins: 2,
    pro_bowls: 6,
    all_pro_selections: 4
  }
}
```

**Visual**: Large number cards, sparklines for trends, ranking badges

---

### 4. Season-by-Season Stats (Table)

```javascript
{
  season_stats: [
    {
      season: 2023,
      team: "KC",
      games: 16,
      passing_yards: 4183,
      passing_tds: 27,
      // ... all stats
      awards: ["Pro Bowl"],
      playoff_result: "Super Bowl Champion"
    },
    // ... all seasons
  ]
}
```

**Visual**: Sortable table, expandable rows for game logs, highlight championship seasons

---

### 5. Biographical Info (Complete)

```javascript
{
  full_name: "Patrick Lavon Mahomes II",
  nickname: null,
  birthplace: {
    city: "Tyler",
    state: "TX",
    country: "USA"
  },
  high_school: {
    name: "Whitehouse High School",
    city: "Whitehouse",
    state: "TX"
  },
  college: {
    name: "Texas Tech",
    years: "2014-2016",
    position: "QB"
  },
  family: {
    father: "Pat Mahomes (MLB pitcher)",
    mother: "Randi Martin",
    spouse: "Brittany Matthews",
    children: 2
  },
  social_media: {
    twitter: "@PatrickMahomes",
    instagram: "@patrickmahomes"
  }
}
```

**Visual**: Clean info cards, family tree, social media links

---

### 6. Awards & Achievements

```javascript
{
  awards: [
    {
      award: "NFL MVP",
      season: 2022,
      team: "KC"
    },
    {
      award: "Super Bowl MVP",
      season: 2019,
      game: "Super Bowl LIV"
    },
    // ... all awards
  ],
  milestones: [
    {
      milestone: "400th Career TD Pass",
      date: "2024-10-15",
      game_id: "..."
    }
  ]
}
```

**Visual**: Trophy case, timeline, achievement badges

---

### 7. Career Timeline

```javascript
{
  timeline: [
    {
      date: "2017-04-27",
      event: "Drafted",
      description: "Selected 10th overall by Kansas City Chiefs"
    },
    {
      date: "2018-09-09",
      event: "First Start",
      description: "Started vs LA Chargers"
    },
    // ... all career events
  ],
  transactions: [
    {
      date: "2020-07-06",
      type: "Contract Extension",
      details: "10-year, $450M extension"
    }
  ]
}
```

**Visual**: Vertical timeline, icons for event types

---

### 8. Advanced Analytics (2016+ for Next Gen Stats)

```javascript
{
  advanced_stats: {
    epa_total: 145.2,
    epa_per_play: 0.28,
    cpoe: 5.2,
    success_rate: 52.3,

    // Next Gen Stats
    average_time_to_throw: 2.65,
    average_air_yards: 8.4,
    max_speed_mph: 21.2,
    aggressiveness: 7.8
  }
}
```

**Visual**: Radar charts, percentile rankings, comparison to league average

---

## Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Hero: Headshot + Name + Team + Jersey]               │
├─────────────────────────────────────────────────────────┤
│  [Quick Stats Bar: Height | Weight | Age | College]    │
├─────────────────────────────────────────────────────────┤
│  [Career Stats Summary: Big Numbers + Rankings]        │
├─────────────────────────────────────────────────────────┤
│  [Tabs: Stats | Bio | Awards | Timeline | Game Logs]   │
│                                                          │
│  Tab Content Area                                       │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  [Related Players: Similar position/era/stats]         │
└─────────────────────────────────────────────────────────┘
```

---

## UI Components Needed

1. **Hero Section** - Headshot, team colors, status badges
2. **Stats Cards** - Large numbers with context
3. **Tabbed Interface** - Stats, Bio, Awards, Timeline, Game Logs
4. **Season Stats Table** - Sortable, expandable rows
5. **Timeline Component** - Vertical timeline with icons
6. **Trophy Case** - Awards display with icons
7. **Comparison Widget** - Compare to other players

---

## API Integration

### Get Player Profile Data

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)

// Get player basic info
const { data: player } = await supabase
  .from('players')
  .select('*')
  .eq('player_id', 'mahomes-patrick')
  .single()

// Get career stats using custom function
const { data: careerStats } = await supabase
  .rpc('get_player_career_summary', {
    p_player_id: 'mahomes-patrick'
  })

// Get season-by-season stats
const { data: seasonStats } = await supabase
  .from('player_season_stats')
  .select(`
    *,
    teams (team_name, team_abbr, logo_url)
  `)
  .eq('player_id', 'mahomes-patrick')
  .order('season', { ascending: false })

// Get awards
const { data: awards } = await supabase
  .from('player_awards')
  .select(`
    *,
    award_types (award_name, award_category)
  `)
  .eq('player_id', 'mahomes-patrick')
  .order('season', { ascending: false })

// Get career timeline/transactions
const { data: transactions } = await supabase
  .from('roster_transactions')
  .select('*')
  .eq('player_id', 'mahomes-patrick')
  .order('transaction_date', { ascending: false })
```

---

## Design Principles

1. **Hero-First**: Large, impactful header with visual identity
2. **Tab Organization**: Complex data organized into logical tabs
3. **Stats Hierarchy**: Career totals → Season-by-season → Game logs
4. **Visual Context**: Show rankings, awards, achievements prominently
5. **Mobile-Friendly**: Tabs and cards stack well on mobile

---

## Detailed Documentation

📄 **Full Requirements**: `player-profile-data-requirements.md` (1,107 lines, 590 fields)
📄 **Field List**: `player-profile-data-list.md` (680 lines)
📄 **Design Context**: `context/perfect-player-builder.md`

---

## Summary

**Page Count**: 27,000+ player profiles
**Total Fields**: 590
**Update Frequency**: Daily
**Complexity**: Very High
**Priority**: P0 - Critical

**Key Features**:
- Hero header with team branding
- Comprehensive career stats
- Awards and achievements trophy case
- Career timeline visualization
- Advanced analytics (EPA, Next Gen Stats)
- Related players comparison
