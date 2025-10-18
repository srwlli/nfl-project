# Stats Pages Design Specification

**Date**: October 17, 2025
**Purpose**: Comprehensive design patterns for NFL statistics display (Historical 1970-2024 + Live 2025 Season)
**Status**: Design Complete - Ready for Finalization
**Research**: Pro Football Reference, ESPN, Fox Sports, Baseball Reference analyzed

---

## Executive Summary

This specification combines best practices for displaying **two distinct types** of NFL statistics:

1. **Historical Stats (1970-2024)**: Complete archive of 54 years of NFL data
2. **Current Season Stats (2025)**: Real-time, live-updating statistics for ongoing season

**Key Insight**: These require **different UI approaches** because they serve different use cases:

| Aspect | Historical (1970-2024) | Current Season (2025) |
|--------|------------------------|----------------------|
| **Primary Users** | Researchers, historians, fantasy deep-divers | Fantasy players, bettors, casual fans |
| **Update Frequency** | Static (frozen historical data) | Real-time (during games), weekly (after games) |
| **Navigation Pattern** | Year → Team → Player hierarchy | Current week → Live games → Player stats |
| **Table Design** | Dense, scannable, sortable | Dynamic, filterable, real-time updates |
| **Visualization** | Trends over time, era comparisons | Current leaderboards, week-over-week changes |
| **Mobile Experience** | Card-based, touch-friendly filtering | Live score updates, quick stats access |

---

## PART 1: Historical Stats (1970-2024)

### Use Cases

**Who uses historical stats and why:**

1. **Fantasy Researchers**: Looking for trends, career arcs, era-adjusted performance
2. **Hall of Fame Debates**: Comparing players across eras
3. **Historical Context**: "How does Mahomes compare to Montana at this point in career?"
4. **Franchise Historians**: Team records, all-time leaders by franchise
5. **Academic/Media**: Research for articles, books, documentaries

### Information Architecture

**Multi-Door Entry** (Users enter through different paths):

```
Entry Point 1: By Year
├── 1970-1979 (Decade view)
│   ├── 1975 Season
│   │   ├── Team Standings
│   │   ├── Player Leaders
│   │   └── Game Results
│   └── ...
└── 1980-1989
    └── ...

Entry Point 2: By Team
├── Dallas Cowboys (Franchise view)
│   ├── All-Time Records
│   ├── Season-by-Season (1970-2024)
│   ├── All-Time Leaders
│   └── Championships
└── ...

Entry Point 3: By Player
├── Search (autocomplete)
├── All-Time Leaders
│   ├── Passing Yards
│   ├── Rushing Yards
│   ├── Receiving Yards
│   └── ...
└── Hall of Fame

Entry Point 4: By Statistical Category
├── All-Time Passing Leaders
├── All-Time Rushing Leaders
├── Single-Season Records
└── Career Records
```

### Navigation Design

**Breadcrumb Navigation** (Critical for historical data):
```
Home > Historical Stats > 1990s > 1995 Season > Dallas Cowboys > Player Stats
        └─────┬──────┘   └──┬──┘   └───┬────┘   └─────┬──────┘   └────┬────┘
           Entry Point   Decade    Specific Year   Team Filter    Stats View
```

**Sidebar Navigation** (Consistent structure every season):
```
1995 NFL Season
├── Overview & Standings
├── Team Stats
│   ├── Offense Rankings
│   ├── Defense Rankings
│   └── Special Teams
├── Player Stats
│   ├── Passing
│   ├── Rushing
│   ├── Receiving
│   ├── Defense
│   └── Kicking
├── Weekly Breakdowns (Week 1-18)
├── Playoffs
│   ├── Wild Card
│   ├── Divisional
│   ├── Championship
│   └── Super Bowl XXX
└── Awards & Honors
    ├── MVP
    ├── Pro Bowl Selections
    └── All-Pro Teams
```

**Granularity Levels**:
- **Decade Level**: 1970s, 1980s, 1990s, 2000s, 2010s, 2020s
- **Year Level**: Jump to any season (1970-2024)
- **Week Level**: Specific week within season
- **Game Level**: Individual game box scores
- **Play Level**: Play-by-play (when available)

### Table Design Principles

**What Works (from Pro Football Reference):**

1. **Scannable Column Headers**:
   - Abbreviations: W, L, Pct, PF, PA, PD, YDS, TD, INT
   - Consistent across all tables
   - Sortable by any column
   - Sticky headers on scroll

2. **Visual Hierarchy**:
   - Alternate row colors (zebra striping)
   - Division breaks visually distinct
   - Top performers highlighted (top 5 in category)
   - Icons for significance:
     - ★ MVP, Pro Bowl, All-Pro
     - ▶ Playoff teams
     - 🏆 Champions
     - 🏈 Hall of Fame

3. **Information Density**:
   - 50-100 rows per page (scrollable, no pagination)
   - Related tables grouped (offense, defense, special teams)
   - Horizontal scroll for wide tables on mobile
   - All data visible without clicking "Show More"

4. **Contextual Statistics**:
   - **SRS Rating** (Simple Rating System - strength of schedule adjusted)
   - **ERA Index** (Compares performance to league average in that era)
   - **Rank** (Where player ranks all-time, in era, in season)
   - **Context Notes**: "Part of 1995 Super Bowl XXX championship team"

### Filtering and Search

**Critical Filters for Historical Data**:

```
┌─────────────────────────────────────────────────┐
│ Year: [1995 ▼]  Era: [1990s ▼]  Team: [DAL ▼]  │
│ Position: [QB ▼]  Min Games: [8 ▼]             │
│ Show: ☐ Hall of Famers Only                    │
│       ☐ Pro Bowlers Only                       │
│       ☐ Super Bowl Winners Only                │
└─────────────────────────────────────────────────┘
```

**Search Capabilities**:
- **Player Name**: Fuzzy search, handles typos ("aikmen" finds "Aikman")
- **Team Name**: Autocomplete ("cowboys" → "Dallas Cowboys")
- **Season Year**: Jump directly to year
- **Statistical Leaders**: "Top 100 passers 1990-1999"

**Advanced Filtering**:
- **Career Length**: "Players with 10+ seasons"
- **Date Range**: "QBs from 1980-1989"
- **Statistical Thresholds**: "Rushers with 1000+ yards in season"
- **Award Winners**: "All MVP winners", "All Pro Bowl QBs"

### Sample Historical Stats Page Layout

```
Historical Stats: 1995 NFL Season
═══════════════════════════════════════════════════════════

Breadcrumb: Home > Historical Stats > 1990s > 1995 Season

┌─ Filters ────────────────────────────────────────────┐
│ Position: [All ▼]  Team: [All ▼]  Sort: [Yards ▼]   │
└──────────────────────────────────────────────────────┘

1995 NFL Passing Leaders
┌────────────────────────────────────────────────────────────────────────┐
│ Rank | Player          | Team | CMP | ATT | YDS  | TD | INT | Rating │
├────────────────────────────────────────────────────────────────────────┤
│  1   | Brett Favre ★   | GB   | 359 | 570 | 4413 | 38 | 13  | 99.5   │
│  2   | Jim Harbaugh    | IND  | 200 | 314 | 2575 | 17 | 5   | 100.7  │
│  3   | Troy Aikman ★   | DAL  | 280 | 432 | 3518 | 23 | 12  | 93.5   │
│  4   | Steve Young ★🏈 | SF   | 299 | 447 | 3200 | 20 | 11  | 92.3   │
│  5   | Dan Marino 🏈   | MIA  | 309 | 482 | 3668 | 24 | 15  | 90.8   │
└────────────────────────────────────────────────────────────────────────┘

Legend: ★ Pro Bowl | 🏈 Hall of Fame | ▶ Playoff Team

Context:
- This was part of the 1995 season which ended with Super Bowl XXX
- Brett Favre won NFL MVP this season
- Average passer rating this era: 83.2 (modern era higher due to rule changes)

Related Links:
→ View 1994 Season | → View 1996 Season | → All-Time Passing Leaders
→ Compare Favre vs Marino Career Stats
```

---

## PART 2: Current Season Stats (2025 NFL Season)

### Use Cases

**Who uses current season stats and why:**

1. **Fantasy Football Players**: Weekly lineup decisions, waiver wire pickups
2. **Sports Bettors**: Player props, team totals, over/under analysis
3. **Casual Fans**: "How is my team doing?", "Who's leading the league?"
4. **Daily Fantasy**: DFS lineup optimization, game stacks
5. **Media/Podcasters**: Weekly content, player performance tracking

### Real-Time Requirements

**Update Frequencies**:

| Data Type | Update Frequency | Example |
|-----------|-----------------|---------|
| **Live Stats** | Every play (~30 seconds during games) | Mahomes: 245 YDS, 2 TD (3Q 8:42) |
| **Live Scores** | Every scoring play (~2-3 minutes) | KC 24 - BUF 21 (3Q 8:42) |
| **Player Stats** | After each game completes | Updated Monday 12:00 AM ET |
| **Weekly Leaders** | After each game completes | "Through Week 7 games" |
| **Season Totals** | After each game completes | Cumulative season stats |
| **Rankings** | Daily (overnight batch) | "As of Oct 17, 2025 12:01 AM ET" |

### Information Architecture

**Current Season Entry Points**:

```
Entry Point 1: Live Games (During Game Day)
├── Sunday 1:00 PM ET Games (Live Now)
│   ├── KC @ BUF (Live)
│   │   ├── Live Box Score
│   │   ├── Play-by-Play
│   │   └── Player Stats (Updating)
│   └── ...
├── Sunday 4:25 PM ET Games
└── Sunday Night Football

Entry Point 2: Weekly Leaders
├── Week 7 Leaders
│   ├── Passing Leaders
│   ├── Rushing Leaders
│   ├── Receiving Leaders
│   └── Defensive Leaders
└── Season Leaders (Cumulative)

Entry Point 3: Team Stats (Current Standings)
├── AFC
│   ├── East (BUF, MIA, NE, NYJ)
│   ├── North
│   ├── South
│   └── West
└── NFC
    └── ...

Entry Point 4: Player Stats (By Position)
├── Quarterbacks
├── Running Backs
├── Wide Receivers
├── Tight Ends
├── Defense
└── Kickers
```

### Live Stats Display Patterns

**During-Game Live Stats**:

```
LIVE: Kansas City Chiefs @ Buffalo Bills
Q3 8:42 | KC 24 - BUF 21 | KC Ball on BUF 35

┌─ Patrick Mahomes (KC QB) ─────────────────────┐
│ 18/24   245 YDS   2 TD   0 INT   ⚡ 126.8 RTG │
│                                                │
│ Last Play: 15-yard completion to Kelce        │
│ Status: ✅ Active | Fantasy Points: 18.2      │
└────────────────────────────────────────────────┘

┌─ Travis Kelce (KC TE) ────────────────────────┐
│ 6 REC   89 YDS   1 TD   ⚡ 14.9 FP            │
│                                                │
│ Last Target: 15-yard catch (This drive)       │
│ Targets: 8 | Status: ✅ Active                │
└────────────────────────────────────────────────┘

⚡ = Live updating | Updates every ~30 seconds
```

**Post-Game Stats (Final)**:

```
FINAL: Kansas City Chiefs 31, Buffalo Bills 27

┌─ Game Leaders ────────────────────────────────┐
│ Passing: Patrick Mahomes  312 YDS, 3 TD       │
│ Rushing: James Cook       94 YDS, 1 TD        │
│ Receiving: Travis Kelce   112 YDS, 1 TD       │
└────────────────────────────────────────────────┘

Full Box Score | Play-by-Play | Post-Game Analysis
```

### Weekly Leaderboards

**Design Pattern**:

```
Week 7 Passing Leaders (Through Sunday 10/15)
═══════════════════════════════════════════════════════════

Filter: [All ▼] | Sort: [Yards ▼] | View: [Week 7 ▼]

┌──────────────────────────────────────────────────────────────────┐
│ Rank | Player          | Team | CMP/ATT | YDS  | TD | INT | RTG │
├──────────────────────────────────────────────────────────────────┤
│  1 🔥| Patrick Mahomes | KC   | 32/45   | 389  | 4  | 0   | 138.2│
│  2   | Josh Allen      | BUF  | 28/40   | 342  | 3  | 1   | 112.4│
│  3   | Lamar Jackson   | BAL  | 24/35   | 315  | 2  | 0   | 118.7│
│  4 ▲ | Jared Goff      | DET  | 22/30   | 298  | 3  | 1   | 115.3│
│  5 ▼ | Tua Tagovailoa  | MIA  | 26/38   | 287  | 2  | 1   | 98.5 │
└──────────────────────────────────────────────────────────────────┘

Legend:
🔥 Hot streak (3+ consecutive strong weeks)
▲ Rising (rank improved from last week)
▼ Falling (rank dropped from last week)

Last Updated: Sunday, Oct 15, 2025 11:42 PM ET
Monday Night Football not yet included
```

**Season Leaderboards** (Cumulative through current week):

```
2025 Season Passing Leaders (Through Week 7)
═══════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────┐
│ Rank | Player          | Team | G | YDS  | TD | INT | YPG   | RTG  │
├──────────────────────────────────────────────────────────────────────┤
│  1   | Patrick Mahomes | KC   | 7 | 2156 | 18 | 3   | 308.0 | 112.3│
│  2   | Josh Allen      | BUF  | 7 | 2089 | 16 | 5   | 298.4 | 108.7│
│  3   | Lamar Jackson   | BAL  | 6 | 1876 | 14 | 2   | 312.7 | 115.2│
│  4   | Jared Goff      | DET  | 7 | 1854 | 12 | 4   | 264.9 | 102.1│
│  5   | Tua Tagovailoa  | MIA  | 6 | 1798 | 13 | 3   | 299.7 | 109.5│
└──────────────────────────────────────────────────────────────────────┘

Pace to finish season:
- Mahomes: 5,236 YDS, 44 TD (Would rank 3rd all-time)
- Jackson: 5,315 YDS, 40 TD (Most by rushing QB)

Last Updated: Monday, Oct 16, 2025 12:01 AM ET
```

### Filtering for Current Season

**Real-Time Filters**:

```
┌─ Current Season Filters ──────────────────────────────┐
│ Week: [Week 7 ▼] | Position: [QB ▼] | Team: [All ▼]  │
│ Status: ☑ Active  ☐ Injured  ☐ Bye Week             │
│ View:   ◉ Week Stats  ○ Season Totals                │
│ Min Attempts: [20 ▼]                                  │
└───────────────────────────────────────────────────────┘
```

**Unique Current-Season Filters**:
- **Game Status**: Live, Final, Scheduled
- **Player Status**: Active, Injured, Questionable, Out, IR
- **Week Range**: This Week, Last 4 Weeks, Season
- **Fantasy Relevance**: Fantasy Points, Targets, Red Zone Touches
- **Trending**: Hot Hand (last 3 weeks), Cold Streak

### Mobile Experience (Critical for Live Stats)

**Mobile-First Design for Current Season**:

```
┌─────────────────────┐
│  🔴 LIVE            │
│                     │
│  KC 24 - BUF 21    │
│  Q3  8:42          │
│                     │
│ [View Game]        │
├─────────────────────┤
│ Week 7 Leaders     │
│                     │
│ 🏈 Mahomes 389 YDS │
│    4 TD  0 INT     │
│                     │
│ 🏃 Cook    94 YDS  │
│    1 TD            │
│                     │
│ 📡 Kelce  112 YDS  │
│    1 TD            │
├─────────────────────┤
│ [Full Leaderboard] │
└─────────────────────┘
```

**Swipe Gestures**:
- Swipe left/right: Navigate between stat categories (Pass, Rush, Rec, Def)
- Pull to refresh: Update live stats
- Tap player: View full player card
- Long press: Add to favorites/watchlist

### Data Freshness Indicators

**Always Show Timestamp**:

```
Live Game:
⚡ Last updated: 30 seconds ago (Auto-refreshing)

Post-Game:
✅ Final - Game ended at 4:42 PM ET

Weekly Stats:
📊 Through Week 7 (Updated Mon 12:01 AM ET)
⏳ MNF not included

Season Stats:
📈 Through 7 games (Updated Tue 3:00 AM ET)
```

---

## PART 3: Unified Design Patterns

### Common Elements (Both Historical + Current)

**Header Structure** (Consistent across both):

```
┌─────────────────────────────────────────────────────────┐
│ 🏈 NFL Stats                                            │
│                                                         │
│ [Historical 1970-2024] [2025 Season ⚡ LIVE]          │
│        ↑                      ↑                         │
│   Static Archive      Real-Time Updates                │
└─────────────────────────────────────────────────────────┘
```

**Navigation Toggle**:
- Clear visual distinction between Historical and Current
- Historical: Gray/muted colors, archive icon
- Current: Bright colors, live indicator (🔴 or ⚡)

**Table Components** (Reusable):
- Sortable headers
- Filterable columns
- Responsive design (mobile cards, tablet hybrid, desktop full)
- Export functionality (CSV, JSON)
- Share links (deep linking to filtered views)

### Color System

**Historical Stats**:
- Primary: Muted blues/grays (timeless, archive feel)
- Accents: Gold for Hall of Fame, silver for records
- Backgrounds: White/light gray (high contrast for reading)

**Current Season**:
- Primary: Vibrant team colors, dynamic gradients
- Accents: Green for live games, red for final scores
- Backgrounds: Dark mode friendly, high contrast for mobile

### Typography

**Historical (Optimized for Reading)**:
- Font: System serif or Georgia (classic, readable)
- Size: 14-16px base (larger for older demographics)
- Line height: 1.6 (comfortable for long tables)

**Current Season (Optimized for Scanning)**:
- Font: System sans-serif or Roboto (modern, clean)
- Size: 14-18px base (larger numbers for quick scanning)
- Line height: 1.4 (tighter for information density)

### Performance Requirements

**Historical Stats**:
- Initial load: < 2 seconds (static data, cacheable)
- Table sorting: Instant (client-side)
- Pagination: Not needed (show all rows, scrollable)
- Caching: Aggressive (data doesn't change)

**Current Season**:
- Initial load: < 1 second (critical for live experience)
- Live updates: Every 30 seconds during games
- WebSocket: Real-time score updates
- Caching: Minimal (data changes frequently)

---

## PART 4: Data Integration

### Historical Stats Data Sources

**Primary Sources**:
- `nflreadpy` - Historical seasons, player stats, team stats
- `sportsref-nfl` - Career records, franchise history, Hall of Fame
- `nflscraPy` - Historical ELO ratings, advanced metrics

**Data Structure**:
```json
{
  "historical_player_season": {
    "player_id": "aikman-troy",
    "season": 1995,
    "team": "DAL",
    "position": "QB",
    "games_played": 16,
    "games_started": 16,
    "stats": {
      "passing_completions": 280,
      "passing_attempts": 432,
      "passing_yards": 3518,
      "passing_touchdowns": 23,
      "interceptions": 12,
      "passer_rating": 93.5
    },
    "context": {
      "season_rank_passing_yards": 5,
      "era_index": 108,
      "pro_bowl": true,
      "all_pro": false,
      "awards": ["Super Bowl XXX Champion"]
    }
  }
}
```

### Current Season Data Sources

**Primary Sources**:
- `nflreadpy` - Current season stats (weekly updates)
- `ESPN API` - Live game data, real-time scores
- `The Odds API` - Betting lines (optional)
- `WebSocket Feed` - Live play-by-play updates

**Data Structure**:
```json
{
  "live_player_stats": {
    "player_id": "mahomes-patrick",
    "game_id": "2025_07_KC_BUF",
    "game_status": "in_progress",
    "quarter": 3,
    "time_remaining": "8:42",
    "stats": {
      "passing_completions": 18,
      "passing_attempts": 24,
      "passing_yards": 245,
      "passing_touchdowns": 2,
      "interceptions": 0,
      "passer_rating": 126.8
    },
    "last_play": "15-yard completion to Kelce",
    "fantasy_points": 18.2,
    "last_updated": "2025-10-15T20:15:32Z"
  }
}
```

---

## API Endpoints

### Historical Stats Endpoints

```
GET /v1/stats/historical/players
  ?season={year}
  &position={QB|RB|WR|etc}
  &team={team_id}
  &min_games={number}

GET /v1/stats/historical/leaders
  ?stat={passing_yards|rushing_yards|etc}
  &years={start_year-end_year}
  &limit={100}

GET /v1/stats/historical/player/{player_id}
  ?seasons={all|range}

GET /v1/stats/historical/team/{team_id}
  ?season={year}

GET /v1/stats/historical/season/{year}
  ?week={week_number}
```

### Current Season Endpoints

```
GET /v1/stats/live/games
  ?status={live|final|scheduled}

GET /v1/stats/live/game/{game_id}
  ?include=play_by_play

GET /v1/stats/current/leaders
  ?week={week_number|season}
  &position={QB|RB|WR|etc}
  &stat={passing_yards|fantasy_points|etc}

GET /v1/stats/current/player/{player_id}
  ?week={week_number}

WebSocket: wss://api/v1/stats/live
  (Real-time game updates)
```

---

## Success Criteria

### Historical Stats Success:
- ✅ Users can find any historical stat within 2 clicks
- ✅ Tables load instantly (< 2s) even with 50+ years of data
- ✅ Search/filter is responsive and helpful
- ✅ Era comparisons provide meaningful context
- ✅ Mobile experience equals desktop
- ✅ Data freshness is always clear (frozen historical)

### Current Season Success:
- ✅ Live stats update every 30 seconds during games
- ✅ Page loads in < 1 second
- ✅ Weekly leaderboards update immediately after games
- ✅ Mobile notifications for key player performances
- ✅ Real-time score integration seamless
- ✅ Fantasy-relevant stats prominently displayed

---

## Implementation Notes

**Key Differences to Remember**:

| Feature | Historical | Current Season |
|---------|-----------|----------------|
| **Data Updates** | Never (frozen) | Real-time/weekly |
| **Primary UI** | Tables | Live scores + tables |
| **Navigation** | Year-based hierarchy | Week-based + live games |
| **Filters** | Era, HOF, career length | Game status, player status, trending |
| **Mobile Priority** | Readable tables | Live updates, notifications |
| **Caching** | Aggressive | Minimal |
| **WebSocket** | Not needed | Critical for live |

**Shared Components**:
- Player card components (reusable for both)
- Table components (configurable for historical vs live)
- Filter components (different options, same UI pattern)
- Export functionality (both need CSV/JSON export)

---

**Status**: Design Complete - Ready for Finalization and Implementation
**Related**: `historical-stats-display.md` (original historical spec)
**Owner**: Frontend team (Next.js implementation)
**Reference**: Pro Football Reference, ESPN, Fox Sports, Baseball Reference
