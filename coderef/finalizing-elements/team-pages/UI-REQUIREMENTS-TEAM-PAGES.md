# UI Requirements - Team Pages

**Page Type:** NFL Team Profiles
**For:** UI/UX Design Team
**Priority:** P0 - Critical
**Page Count:** 32 active teams + franchise history
**Update Frequency:** Real-time during games, daily during season

---

## Overview

**Complete franchise information** with focus on:
- Current season performance and standings
- Full 53-man roster with depth chart
- Complete schedule (current + historical)
- Team statistics (offense, defense, special teams)
- Franchise history (championships, HOF players, retired numbers)
- Coaching staff directory
- News, transactions, and injuries

---

## Page Sections (10 Main Sections)

### 1. Team Identity Header

```javascript
{
  team_name: "Kansas City Chiefs",
  city: "Kansas City",
  state: "MO",
  abbreviation: "KC",
  conference: "AFC",
  division: "West",
  founded_year: 1960,
  colors: {
    primary: "#E31837",
    secondary: "#FFB81C"
  },
  logos: {
    primary: "...",
    helmet: "..."
  },
  stadium: {
    name: "GEHA Field at Arrowhead Stadium",
    capacity: 76416,
    surface: "grass",
    year_opened: 1972
  }
}
```

**Visual**: Large logo, team colors throughout page, stadium image

---

### 2. Current Season Overview

```javascript
{
  season: 2024,
  current_week: 12,
  record: {
    wins: 10,
    losses: 2,
    ties: 0,
    win_percentage: 0.833
  },
  division_standing: {
    rank: 1,
    games_back: 0,
    division_record: "4-0",
    conference_record: "8-1"
  },
  streak: {
    type: "W",
    count: 4,
    description: "Won last 4"
  },
  playoff_status: {
    clinched_playoff: false,
    playoff_probability: 98.7
  },
  next_game: {
    opponent: "Buffalo Bills",
    date: "2024-11-17",
    location: "home",
    tv_network: "CBS"
  }
}
```

**Visual**: Prominent record display, standings badge, streak indicator, next game card

---

### 3. Roster (Active 53-man)

```javascript
{
  roster: [
    {
      player_id: "mahomes-patrick",
      name: "Patrick Mahomes",
      position: "QB",
      jersey_number: 15,
      height: "6-3",
      weight: 225,
      age: 28,
      experience: "7 seasons",
      college: "Texas Tech",
      headshot_url: "..."
    },
    // ... 52 more players
  ],
  // Organized by position groups
  offense: {
    qb: [...],
    rb: [...],
    wr: [...],
    te: [...],
    ol: [...]
  },
  defense: {
    dl: [...],
    lb: [...],
    db: [...]
  },
  special_teams: {
    k: [...],
    p: [...],
    ls: [...]
  }
}
```

**Visual**: Grid/list with headshots, filterable by position, depth chart view

---

### 4. Schedule (Full Season)

```javascript
{
  schedule: [
    {
      week: 1,
      date: "2024-09-05",
      opponent: "Baltimore Ravens",
      location: "away",
      result: "W",
      score: "27-20",
      record_after: "1-0"
    },
    {
      week: 2,
      date: "2024-09-15",
      opponent: "Cincinnati Bengals",
      location: "home",
      result: "W",
      score: "26-25",
      record_after: "2-0"
    },
    // ... all 17 games + playoffs
  ]
}
```

**Visual**: Calendar/list view, color-coded W/L, upcoming games highlighted

---

### 5. Team Stats (Offense, Defense, Special Teams)

```javascript
{
  offense: {
    total_yards: 6245,
    yards_per_game: 390.3,
    passing_yards: 4512,
    rushing_yards: 1733,
    points_per_game: 28.5,
    third_down_percentage: 45.2,
    red_zone_percentage: 62.8,
    turnovers: 12,
    rank_total_offense: 3,
    rank_passing: 2,
    rank_rushing: 12
  },
  defense: {
    total_yards_allowed: 5234,
    yards_allowed_per_game: 327.1,
    passing_yards_allowed: 3456,
    rushing_yards_allowed: 1778,
    points_allowed_per_game: 20.2,
    sacks: 38,
    interceptions: 14,
    fumbles_recovered: 8,
    rank_total_defense: 8,
    rank_pass_defense: 12,
    rank_run_defense: 6
  },
  special_teams: {
    field_goal_percentage: 88.9,
    punt_average: 46.2,
    kick_return_average: 24.1,
    punt_return_average: 9.8
  }
}
```

**Visual**: Stat cards with rankings, comparison bars, league average comparison

---

### 6. Coaching Staff

```javascript
{
  head_coach: {
    name: "Andy Reid",
    years_with_team: 12,
    career_record: "258-137-1",
    super_bowl_wins: 2,
    photo_url: "..."
  },
  coordinators: {
    offensive: {
      name: "Matt Nagy",
      position: "Offensive Coordinator"
    },
    defensive: {
      name: "Steve Spagnuolo",
      position: "Defensive Coordinator"
    },
    special_teams: {
      name: "Dave Toub",
      position: "Special Teams Coordinator"
    }
  },
  position_coaches: [...]
}
```

**Visual**: Coach cards with photos, records, tenure

---

### 7. Franchise History

```javascript
{
  championships: [
    {
      season: 2023,
      super_bowl: "LVIII",
      opponent: "San Francisco 49ers",
      score: "25-22",
      location: "Las Vegas, NV",
      mvp: "Patrick Mahomes"
    },
    // ... all championships
  ],
  retired_numbers: [
    {
      number: 3,
      player: "Jan Stenerud",
      position: "K",
      years: "1967-1979"
    },
    // ... all retired numbers
  ],
  hall_of_famers: [
    {
      player_name: "Len Dawson",
      position: "QB",
      inducted_year: 1987,
      years_with_team: "1962-1975"
    },
    // ... all HOF players
  ],
  all_time_leaders: {
    passing_yards: {
      player: "Len Dawson",
      value: 28711,
      years: "1962-1975"
    },
    // ... all statistical leaders
  }
}
```

**Visual**: Championship banners, retired numbers display, HOF gallery

---

### 8. News & Transactions

```javascript
{
  news: [
    {
      date: "2024-11-15",
      headline: "Chiefs sign CB to practice squad",
      source: "NFL.com",
      url: "..."
    },
    // ... recent news
  ],
  transactions: [
    {
      date: "2024-11-14",
      type: "signed",
      player: "John Doe",
      position: "CB",
      details: "Signed to practice squad"
    },
    // ... recent transactions
  ]
}
```

**Visual**: News feed, transaction log with icons

---

### 9. Injuries & Depth Chart

```javascript
{
  injuries: [
    {
      player: "Travis Kelce",
      position: "TE",
      injury: "Ankle",
      status: "Questionable",
      last_updated: "2024-11-15"
    },
    // ... all injuries
  ],
  depth_chart: {
    QB: [
      { player: "Patrick Mahomes", depth: 1 },
      { player: "Carson Wentz", depth: 2 }
    ],
    // ... all positions
  }
}
```

**Visual**: Injury report table with status colors, depth chart grid

---

### 10. Stadium Details

```javascript
{
  stadium: {
    name: "GEHA Field at Arrowhead Stadium",
    capacity: 76416,
    surface: "grass",
    roof: "outdoor",
    year_opened: 1972,
    location: {
      address: "1 Arrowhead Drive",
      city: "Kansas City",
      state: "MO",
      zip: "64129"
    },
    features: [
      "Loudest outdoor stadium (142.2 dB)",
      "Home to Chiefs Kingdom"
    ],
    images: [
      "exterior.jpg",
      "interior.jpg",
      "aerial.jpg"
    ]
  }
}
```

**Visual**: Stadium images, capacity info, features list

---

## Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Hero: Team Logo + Name + Stadium]                    │
├─────────────────────────────────────────────────────────┤
│  [Season Overview: Record | Standing | Next Game]      │
├─────────────────────────────────────────────────────────┤
│  [Tabs: Roster | Schedule | Stats | History | News]    │
│                                                          │
│  Tab Content Area                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## UI Components Needed

1. **Team Header** - Logo, colors, stadium
2. **Record Card** - W-L record, standings, streak
3. **Roster Grid** - Player cards with filters
4. **Schedule Calendar** - Games list/calendar view
5. **Stats Dashboard** - Offense/Defense/ST metrics with rankings
6. **Championship Timeline** - Super Bowl wins
7. **News Feed** - Latest updates
8. **Injury Report Table** - Status indicators
9. **Depth Chart Grid** - Visual depth chart

---

## API Integration

### Get Team Data

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)

// Get team basic info
const { data: team } = await supabase
  .from('teams')
  .select(`
    *,
    stadium:stadiums(*)
  `)
  .eq('team_id', 'KC')
  .single()

// Get current season record
const { data: seasonRecord } = await supabase
  .rpc('get_team_season_record', {
    p_team_id: 'KC',
    p_season: 2024
  })

// Get roster
const { data: roster } = await supabase
  .from('player_teams')
  .select(`
    *,
    player:players(*)
  `)
  .eq('team_id', 'KC')
  .is('end_season', null) // Current players only

// Get schedule
const { data: schedule } = await supabase
  .from('games')
  .select(`
    *,
    home_team:teams!games_home_team_id_fkey(team_name, team_abbr),
    away_team:teams!games_away_team_id_fkey(team_name, team_abbr)
  `)
  .or(`home_team_id.eq.KC,away_team_id.eq.KC`)
  .eq('season', 2024)
  .order('week', { ascending: true })

// Get team stats
const { data: teamStats } = await supabase
  .from('team_season_stats')
  .select('*')
  .eq('team_id', 'KC')
  .eq('season', 2024)
  .single()
```

---

## Design Principles

1. **Team Branding**: Use team colors throughout the page
2. **Current-First**: Prioritize current season data
3. **Tab Organization**: Logical grouping (Roster, Schedule, Stats, History)
4. **Real-time Updates**: Live score/standing updates during season
5. **Rich History**: Showcase championships, HOF players, franchise records

---

## Detailed Documentation

📄 **Full Requirements**: `team-page-data-requirements.md` (1,348 lines, ~450 fields)
📄 **Field List**: `team-page-data-list.md` (636 lines)
📄 **Design Context**: `context/team-page.md`

---

## Summary

**Page Count**: 32 active teams
**Total Fields**: ~450
**Update Frequency**: Real-time during games, daily during season
**Complexity**: High
**Priority**: P0 - Critical

**Key Features**:
- Team branding (colors, logos)
- Current season standings and schedule
- Full 53-man roster
- Team statistics with league rankings
- Franchise history (championships, HOF)
- News feed and transaction log
- Injury report and depth chart
