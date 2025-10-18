# UI Requirements - Game Details Pages

**Page Type:** NFL Game Details (3 variants)
**For:** UI/UX Design Team
**Priority:** P0 - Critical
**Update Frequency:** Varies by game status

---

## Overview

**Three distinct page types** based on game status:

1. **Live Games** - Real-time updates (second-by-second)
2. **Completed Games** - Full box score, stats, play-by-play
3. **Scheduled Games** - Matchup preview, betting lines, predictions

---

## 1. Live Game Details

**Update Frequency**: Real-time (WebSocket updates every 1-5 seconds)

### Key Sections

```javascript
{
  // Live Score Header (updates every 1-5 seconds)
  game_status: {
    status: "in_progress",
    quarter: 3,
    time_remaining: "8:42",
    possession: "KC",
    down_distance: "2nd & 7",
    yard_line: "BUF 35"
  },

  score: {
    home: {
      team: "Kansas City Chiefs",
      abbreviation: "KC",
      score: 24,
      timeouts_remaining: 2
    },
    away: {
      team: "Buffalo Bills",
      abbreviation: "BUF",
      score: 21,
      timeouts_remaining: 3
    }
  },

  // Live Play-by-Play
  current_drive: {
    team: "KC",
    plays: 6,
    yards: 48,
    time: "4:23"
  },

  last_play: {
    quarter: 3,
    time: "8:42",
    down: 2,
    distance: 7,
    yard_line: "BUF 35",
    description: "Patrick Mahomes pass complete to Travis Kelce for 12 yards",
    result: "First Down",
    yards_gained: 12
  },

  // Live Stats (updated after each play)
  live_stats: {
    KC: {
      total_yards: 342,
      passing_yards: 268,
      rushing_yards: 74,
      turnovers: 0,
      time_of_possession: "18:23"
    },
    BUF: {
      total_yards: 298,
      passing_yards: 215,
      rushing_yards: 83,
      turnovers: 1,
      time_of_possession: "17:37"
    }
  },

  // Live Player Stats
  player_stats: {
    passing: [
      {
        player: "Patrick Mahomes",
        team: "KC",
        completions: 18,
        attempts: 26,
        yards: 268,
        touchdowns: 2,
        interceptions: 0
      }
    ],
    rushing: [...],
    receiving: [...]
  }
}
```

**Visual**: Live score updates, play-by-play feed (auto-scroll), real-time stat bars

### UI Components

1. **Live Score Header** - Real-time score, possession indicator
2. **Play-by-Play Feed** - Auto-scrolling, expandable drives
3. **Live Stats Bars** - Animated comparison bars
4. **Player Stat Tables** - Real-time updating
5. **Drive Chart** - Visual field position tracker

---

## 2. Completed Game Details

**Update Frequency**: Static after game ends

### Key Sections

```javascript
{
  // Final Score
  final_score: {
    home: { team: "KC", score: 31 },
    away: { team: "BUF", score: 28 },
    overtime: true
  },

  // Complete Box Score
  box_score: {
    scoring_summary: [
      {
        quarter: 1,
        time: "12:05",
        team: "KC",
        description: "Patrick Mahomes 15 yd pass to Travis Kelce",
        score_after: "7-0"
      },
      // ... all scores
    ],

    team_stats: {
      KC: {
        first_downs: 24,
        total_yards: 425,
        passing_yards: 312,
        rushing_yards: 113,
        turnovers: 1,
        penalties: "5-45",
        time_of_possession: "32:15"
      },
      BUF: { /* same structure */ }
    },

    player_stats: {
      passing: [
        {
          player: "Patrick Mahomes",
          team: "KC",
          comp_att: "28-39",
          yards: 312,
          td: 3,
          int: 1,
          rating: 104.2
        }
      ],
      rushing: [...],
      receiving: [...],
      defense: [...]
    }
  },

  // Full Play-by-Play
  play_by_play: [
    {
      drive_number: 1,
      team: "KC",
      quarter: 1,
      start_time: "15:00",
      start_yard_line: "KC 25",
      plays: [
        {
          play_number: 1,
          down: 1,
          distance: 10,
          yard_line: "KC 25",
          description: "Patrick Mahomes pass complete to Travis Kelce for 8 yards",
          yards_gained: 8,
          epa: 0.45
        },
        // ... all plays
      ],
      result: "Touchdown",
      yards: 75,
      time: "6:23"
    },
    // ... all drives
  ]
}
```

**Visual**: Final score banner, complete box score tables, drive chart, play-by-play accordion

### UI Components

1. **Final Score Banner** - Winner highlighted
2. **Box Score Tables** - Team stats, player stats
3. **Scoring Summary Timeline** - Quarter-by-quarter
4. **Drive Chart** - Visual drive outcomes
5. **Play-by-Play Accordion** - Expandable drives

---

## 3. Scheduled Game Details

**Update Frequency**: Daily (betting lines, weather)

### Key Sections

```javascript
{
  // Matchup Info
  matchup: {
    home: {
      team: "Kansas City Chiefs",
      record: "10-2",
      conference_rank: 1,
      streak: "W4"
    },
    away: {
      team: "Buffalo Bills",
      record: "9-3",
      conference_rank: 2,
      streak: "W2"
    },
    date: "2024-11-17T16:25:00Z",
    location: "GEHA Field at Arrowhead Stadium",
    tv_network: "CBS",
    weather: {
      temperature: 45,
      conditions: "Partly Cloudy",
      wind: "10 mph NW",
      precipitation_chance: 20
    }
  },

  // Betting Lines
  betting: {
    spread: {
      favorite: "KC",
      line: -3.5,
      odds: -110
    },
    over_under: 52.5,
    moneyline: {
      KC: -180,
      BUF: +150
    }
  },

  // Season Matchup History
  season_matchup: {
    previous_meetings_this_season: 0,
    last_meeting: {
      date: "2024-01-21",
      result: "KC 27, BUF 24",
      location: "Arrowhead Stadium"
    },
    all_time_series: {
      KC_wins: 28,
      BUF_wins: 54,
      ties: 0
    }
  },

  // Team Comparison
  comparison: {
    offense: {
      KC_ppg: 28.5,
      BUF_ppg: 27.1,
      KC_rank: 3,
      BUF_rank: 5
    },
    defense: {
      KC_ppg_allowed: 20.2,
      BUF_ppg_allowed: 18.5,
      KC_rank: 8,
      BUF_rank: 4
    }
  },

  // Key Players to Watch
  key_players: {
    KC: [
      {
        player: "Patrick Mahomes",
        position: "QB",
        season_stats: {
          passing_yards: 3245,
          passing_tds: 24,
          interceptions: 8
        }
      }
    ],
    BUF: [...]
  }
}
```

**Visual**: Matchup card, betting lines, team comparison bars, key players spotlight

### UI Components

1. **Matchup Preview Card** - Team comparison
2. **Betting Lines Display** - Spread, O/U, moneyline
3. **Weather Widget** - Game day conditions
4. **Key Players Spotlight** - Player cards
5. **Team Comparison Bars** - Visual stat comparison
6. **Series History** - Head-to-head record

---

## Page Layouts

### Live Game

```
┌─────────────────────────────────────────────────────────┐
│  [Live Score: KC 24 - BUF 21 | Q3 8:42]                │
│  [Possession: KC | 2nd & 7 at BUF 35]                   │
├─────────────────────────────────────────────────────────┤
│  [Live Stats Comparison Bars]                          │
├─────────────────────────────────────────────────────────┤
│  [Play-by-Play Feed (auto-scrolling)]                  │
│  │ 8:42 - P. Mahomes pass to T. Kelce, 12 yards       │
│  │ 9:15 - I. Pacheco rush for 8 yards                 │
│  │ ...                                                  │
├─────────────────────────────────────────────────────────┤
│  [Tabs: Box Score | Drive Chart | Player Stats]        │
└─────────────────────────────────────────────────────────┘
```

### Completed Game

```
┌─────────────────────────────────────────────────────────┐
│  [Final: KC 31 - BUF 28 (OT)]                          │
├─────────────────────────────────────────────────────────┤
│  [Scoring Summary by Quarter]                          │
├─────────────────────────────────────────────────────────┤
│  [Tabs: Box Score | Play-by-Play | Team Stats]         │
│                                                          │
│  Complete box score, player stats, drive chart          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Scheduled Game

```
┌─────────────────────────────────────────────────────────┐
│  [Matchup: KC (10-2) vs BUF (9-3)]                     │
│  [Date: Nov 17, 2024 | 4:25 PM ET | CBS]              │
├─────────────────────────────────────────────────────────┤
│  [Betting Lines: KC -3.5 | O/U 52.5]                   │
├─────────────────────────────────────────────────────────┤
│  [Team Comparison Stats]                               │
├─────────────────────────────────────────────────────────┤
│  [Key Players to Watch]                                │
├─────────────────────────────────────────────────────────┤
│  [Weather & Series History]                            │
└─────────────────────────────────────────────────────────┘
```

---

## API Integration

### Live Game (Real-time)

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)

// Get live game data
const { data: game } = await supabase
  .rpc('get_game_summary', {
    p_game_id: '2024_12_KC_BUF'
  })

// Subscribe to live updates
const channel = supabase
  .channel('game-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'games',
      filter: `game_id=eq.2024_12_KC_BUF`
    },
    (payload) => {
      // Update UI with new score/status
      updateGameUI(payload.new)
    }
  )
  .subscribe()
```

### Completed Game

```javascript
// Get completed game data
const { data: game } = await supabase
  .from('games')
  .select(`
    *,
    home_team:teams!games_home_team_id_fkey(*),
    away_team:teams!games_away_team_id_fkey(*),
    game_stats(*),
    game_weather(*)
  `)
  .eq('game_id', '2024_12_KC_BUF')
  .single()

// Get play-by-play
const { data: playByPlay } = await supabase
  .from('play_by_play')
  .select('*')
  .eq('game_id', '2024_12_KC_BUF')
  .order('play_number', { ascending: true })
```

### Scheduled Game

```javascript
// Get upcoming game matchup
const { data: game } = await supabase
  .from('games')
  .select(`
    *,
    home_team:teams!games_home_team_id_fkey(*),
    away_team:teams!games_away_team_id_fkey(*),
    game_weather(*)
  `)
  .eq('game_id', '2024_12_KC_BUF')
  .eq('status', 'scheduled')
  .single()

// Get team comparison stats
const { data: teamStats } = await supabase
  .from('team_season_stats')
  .select('*')
  .in('team_id', ['KC', 'BUF'])
  .eq('season', 2024)
```

---

## Design Principles

1. **Real-time First** (Live): Prioritize live updates, minimal latency
2. **Comprehensive Detail** (Completed): Show all stats, full play-by-play
3. **Matchup Preview** (Scheduled): Focus on comparison and prediction
4. **Responsive Updates**: WebSocket for live, polling for scheduled
5. **Visual Hierarchy**: Score → Stats → Details

---

## Detailed Documentation

📄 **Live Games**: `live/live-game-data-requirements.md` (550 lines)
📄 **Completed Games**: `completed/completed-game-data-requirements.md` (836 lines)
📄 **Scheduled Games**: `scheduled/scheduled-game-data-requirements.md` (434 lines)
📄 **Design Context**: `context/football-game-details-structure.md`

---

## Summary

**Page Variants**: 3 (Live, Completed, Scheduled)
**Update Frequency**:
- Live: 1-5 seconds (WebSocket)
- Completed: Static
- Scheduled: Daily

**Complexity**: Very High (especially live games)
**Priority**: P0 - Critical

**Key Features**:
- Real-time score and play updates (live)
- Complete box score and play-by-play (completed)
- Matchup preview and betting lines (scheduled)
- Team comparison statistics
- Player performance tracking
- Drive charts and field visualization
