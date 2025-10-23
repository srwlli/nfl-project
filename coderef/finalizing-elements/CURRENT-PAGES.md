# Current Pages - NFL Stats Platform

**Last Updated**: October 23, 2025
**Total Pages**: 7 core page types
**Status**: All specifications complete ✅

---

## Overview

This document lists ONLY the pages we are building right now. All future/optional pages have been moved to `FINAL/FUTURE/`.

---

## 🏈 The 7 Core Pages

### 1. **Homepage / Live Scoreboard**
**Route**: `/`
**Priority**: P0 - Critical
**Data Ready**: ✅ 100%
**Spec**: `live-scoreboard/components.json`

**What it does**:
- Real-time live game scores (auto-refresh every 30s)
- Upcoming games today with countdown timers
- Recently completed games (last 6 hours)
- Top performers today (best stats from live/completed games)
- Division standings widget
- Featured game spotlight
- Full week schedule overview
- Trending news (if available)

**Key Features**:
- WebSocket real-time updates during games
- Pulsing "LIVE" indicator
- Auto-refresh only during game windows (Thu/Sun/Mon)
- Responsive grid layout

**Components**: 11 major components defined

---

### 2. **Game Details Pages**
**Route**: `/games/[gameId]`
**Priority**: P0 - Critical
**Data Ready**: ✅ 95-100%
**Spec**: `game-details/components.json`
**Template**: ✅ `game-details/template-next-down-metrics.tsx` (1,356 lines)

**3 Variants Based on Game Status**:

#### **A. Live Game** (status = in_progress)
- Real-time score updates via WebSocket
- Current quarter, down & distance, possession
- Live play-by-play feed (auto-scrolling)
- Player stats updating live
- Red zone indicator
- Scoring play animations

#### **B. Completed Game** (status = final)
- Final score with winner highlighted
- Complete box score tables:
  - Passing stats (C/ATT, YDS, TD, INT, RTG)
  - Rushing stats (CAR, YDS, AVG, TD, LONG)
  - Receiving stats (REC, TAR, YDS, TD)
  - Defense stats (TACK, SACKS, INT, PD, FF)
- Team stats comparison (side-by-side bars)
- Scoring summary timeline
- Play-by-play with drive charts
- Advanced analytics (EPA, Win Probability)
- Betting results (spread, O/U, moneyline)
- Game info (officials, weather, broadcast)

#### **C. Scheduled Game** (status = scheduled)
- Matchup preview
- Team comparison
- Betting lines (spread, O/U, moneyline)
- Weather forecast
- Quick injury report
- Recent head-to-head history

**Key Features**:
- 8-tab navigation (Summary, Box Score, Play-by-Play, Team Stats, Player Stats, Scoring, Info, Videos)
- Quarter-by-quarter scores
- Real-time updates for live games
- 13 theme variations available

**Components**: 20+ major components defined
**Page Count**: 272 games (2025 season)

---

### 3. **Player Profile Pages**
**Route**: `/players/[playerId]`
**Priority**: P0 - Critical
**Data Ready**: ✅ 85%
**Spec**: `player-profiles/components.json`

**What it shows**:
- **Hero Section**:
  - Large player headshot (300x300px)
  - Player name, jersey number, position
  - Current team logo and colors
  - Status badge (Active/Injured/Retired)

- **Quick Stats Bar**:
  - Height, weight, age
  - Birth date and birthplace
  - College, draft info
  - Years pro

- **Career Totals**:
  - Big numbers (passing yards, TDs, etc.)
  - Sparklines showing trends
  - All-time ranking badges
  - Award badges (MVP, Pro Bowl)

- **Season-by-Season Table**:
  - Sortable by any stat
  - Expandable game logs per season
  - Championship seasons highlighted
  - Award indicators
  - Team logos

- **Biographical Info**:
  - Full name, nickname
  - High school, college
  - Family (if available)

- **Awards & Achievements**:
  - Trophy case with icons
  - Pro Bowl selections, All-Pro
  - MVP awards, championships
  - Hall of Fame status

- **Career Timeline**:
  - Draft day, first start
  - Team changes (trades/signings)
  - Major injuries
  - Awards won, playoff appearances
  - Retirement

- **Advanced Analytics** (if available):
  - EPA (Expected Points Added)
  - Next Gen Stats (speed, separation, etc.)
  - Percentile rankings
  - Radar charts

**Key Features**:
- Position-specific stats displayed
- Expandable game logs (loaded on demand)
- Related players recommendations
- Link to current team page

**Components**: 15+ major components defined
**Page Count**: 2,578 active players

---

### 4. **Team Pages**
**Route**: `/teams/[teamId]`
**Priority**: P1 - Important
**Data Ready**: ✅ 95%
**Spec**: `team-pages/components.json`

**What it shows**:
- **Hero Section**:
  - Large team logo (200x200px)
  - Team name
  - Division/Conference badges
  - Current record (W-L-T)
  - Division standing (#1 AFC West)
  - Team colors gradient background

- **Quick Stats Cards**:
  - Record, Points Per Game
  - Points Allowed Per Game
  - Total Yards Per Game
  - Division/Conference standing
  - Current streak (W3, L2)

- **53-Man Roster Table**:
  - Sortable columns (#, Name, Position, Height, Weight, Age, College, Experience)
  - Filter by position group
  - Search by name
  - Position color coding
  - Link to player profile

- **Depth Chart View** ⭐:
  - Visual depth chart by position
  - Offense: QB, RB, WR (3), TE, OL (5)
  - Defense: DL (4), LB (3), DB (4)
  - Special Teams: K, P, LS
  - Starter/backup designation
  - Injury status indicators
  - Player cards with headshots

- **Season Schedule**:
  - Week, date, opponent, result, score, record
  - Filter by status (completed, live, scheduled)
  - Win/loss color coding
  - Home/away indicators
  - TV network badges
  - Link to game details

- **Team Season Stats**:
  - Offense: PPG, Total Yds/G, Pass/Rush Yds/G, 3rd Down %
  - Defense: PPG Allowed, Yds/G Allowed, Sacks
  - Turnovers: Giveaways, Takeaways, Differential
  - Rank badges (#1, #5, etc.)
  - League comparison bars
  - Season trend sparklines

- **Team Leaders**:
  - Passing, Rushing, Receiving, Defense leaders
  - Top 3 per category
  - Season stats

- **Division Standings**:
  - Division standings with current team highlighted
  - Win %, points for/against, differential, streak
  - Playoff indicator (green dot)

- **Team Info**:
  - Stadium (name, city, capacity, surface)
  - Head coach, GM (if available)
  - Founded year
  - Championships, playoff appearances

**Key Features**:
- Dynamic team colors theming
- Depth chart with injury indicators
- Sortable/filterable roster
- Home/away record splits
- Link to stadium page

**Components**: 12+ major components defined
**Page Count**: 32 NFL teams

---

### 5. **Stats & Leaderboards**
**Route**: `/stats/[category]`
**Priority**: P1 - Important
**Data Ready**: ✅ 100%
**Spec**: `stats/components.json`

**Categories**:
- **Passing Leaders**: Yards, TDs, INTs, Rating, Completions, Attempts, YPA
- **Rushing Leaders**: Yards, TDs, Avg, Longest, Carries
- **Receiving Leaders**: Receptions, Yards, TDs, Targets, Avg
- **Defense Leaders**: Tackles, Sacks, INTs, Forced Fumbles, Passes Defended

**What it shows**:
- **Leaderboard Tables**:
  - Rank, Player, Team, Position
  - All relevant stats for category
  - Sortable columns
  - Paginated (25 per page)
  - Rank badges (#1, #2, #3 highlighted)
  - Click player to open profile

- **Weekly Leaders Cards**:
  - Top 5 performers by week
  - Weekly highlight badges
  - Stat milestones (300+ yds, 3+ TDs)

- **Filter Panel**:
  - Season dropdown
  - Position group checkboxes
  - Team multi-select
  - Stat minimum sliders
  - Games played minimum
  - Reset all filters button

- **Player Comparison**:
  - Select up to 3 players
  - Side-by-side stats
  - Radar chart visualization
  - Percentile rankings
  - Color-coded better/worse

- **Team Comparison Grid**:
  - All 32 teams displayed
  - Sortable by any stat
  - Rank columns
  - Color gradient for rankings

- **Stat Trend Charts**:
  - Line charts showing week-by-week progression
  - Multiple players overlay
  - Zoom/pan controls
  - Export as image

- **Record Book**:
  - Single game records
  - Single season records
  - Career records
  - Team records

- **Active Streaks**:
  - Games with TD
  - Games with 100+ yards
  - Consecutive starts
  - Milestone badges (10 games, 20 games)

**Key Features**:
- Client-side filtering (fast)
- Position-specific radar charts
- Percentile-based rankings
- Visual trend lines

**Components**: 10+ major components defined

---

### 6. **Matchup Preview Pages**
**Route**: `/games/[gameId]/preview`
**Priority**: P1 - Important
**Data Ready**: ✅ 85%
**Spec**: `matchup-preview/components.json`

**What it shows**:
- **Matchup Header**:
  - Large team logos (200x200px)
  - Team names and records
  - VS divider with game time
  - Network badge (CBS, FOX, NBC, ESPN)
  - Stadium name and city
  - Countdown to kickoff
  - Weather forecast

- **Betting Lines**:
  - Spread (opening/current)
  - Moneyline (home/away)
  - Over/Under (opening/current)
  - Line movement indicators
  - Multiple sportsbooks comparison
  - Best odds highlighter

- **Key Storylines**:
  - 3-5 main narratives
  - Rivalry games, playoff implications
  - Revenge games, milestones
  - Coaching matchups

- **Team Comparison**:
  - Head-to-head season stats
  - Record, PPG, Yards/Game
  - Turnover differential
  - 3rd down %, Red Zone %
  - Horizontal comparison bars
  - League rank badges

- **Key Players to Watch**:
  - Top QB, RB, WR, TE from each team
  - Season stats summary
  - Last 3 games trend
  - Injury status indicator
  - Player headshots

- **Injury Report**:
  - Both teams
  - Grouped by status (Out, Doubtful, Questionable, Probable)
  - Color-coded (red/orange/yellow/green)
  - Impact indicator (starter/backup)

- **Weather Forecast**:
  - Temperature, precipitation chance
  - Wind speed/direction
  - Game-time forecast icon
  - Impact assessment (HIGH/MEDIUM/LOW)
  - Indoor/outdoor indicator

- **Team Trends**:
  - Last 5 games (W-L)
  - Home/away splits
  - Scoring trends
  - ATS record (against the spread)
  - O/U record

- **Recent Matchups**:
  - Last 5 meetings between teams
  - Game date, final score, location
  - Series record (Team A leads 8-4)

- **Game Prediction** (if available):
  - Win probability percentage
  - Predicted final score
  - Confidence level
  - Key factors (3-5 bullets)

**Key Features**:
- Live countdown to kickoff
- Real-time betting line updates (15 min refresh)
- Weather updates (1 hour refresh)
- Switches to live game page when game starts

**Components**: 13+ major components defined
**Page Count**: ~16 games per week (272 total)

---

### 7. **Stadium Pages**
**Route**: `/stadiums/[stadiumId]`
**Priority**: P2 - Nice to Have
**Data Ready**: ✅ 90%
**Spec**: `stadium-pages/components.json`

**What it shows**:
- **Stadium Hero**:
  - Large stadium photo (1200x600px)
  - Stadium name
  - Location (city, state)
  - Home team logo and colors
  - Quick facts (capacity, year opened, surface)

- **Stadium Information**:
  - Official name, address
  - Coordinates (lat/long)
  - Capacity, year opened
  - Surface type (grass, turf)
  - Roof type (open, retractable, dome)
  - Owner, architect, construction cost (if available)

- **Upcoming Games**:
  - Next 5 scheduled games at this stadium
  - Date, time, matchup
  - Ticket availability link
  - Weather forecast
  - Link to matchup preview

- **Home Team History**:
  - All-time record at stadium (W-L-T)
  - Home record this season
  - Playoff games hosted
  - Championships won here
  - Longest home win streak
  - Average attendance

- **Weather Impact Analysis**:
  - Average temperature by month
  - Games with rain/snow/high wind (%)
  - Coldest/hottest games played
  - Impact on scoring (PPG in weather vs normal)

- **Notable Games**:
  - Super Bowls hosted
  - Playoff games
  - Highest scoring games
  - Overtime classics
  - Milestone games

- **Recent Games**:
  - Last 10 games at this venue
  - Date, matchup, final score
  - Attendance, weather
  - Link to game details

- **Location Map**:
  - Embedded Google Maps
  - Stadium marker
  - Directions button
  - Nearby parking info

- **Stadium Records**:
  - Highest score by home/visiting team
  - Most points in a game
  - Largest home win margin
  - Longest field goal
  - Most passing/rushing yards

**Key Features**:
- Interactive map
- Weather history charts
- Notable games timeline
- Link to home team page

**Components**: 13+ major components defined
**Page Count**: 30 NFL stadiums

---

## 📊 Summary Table

| # | Page Type | Route | Priority | Data Ready | Spec | Template |
|---|-----------|-------|----------|------------|------|----------|
| 1 | Homepage | `/` | P0 | ✅ 100% | ✅ | ⏳ |
| 2 | Game Details | `/games/[id]` | P0 | ✅ 95-100% | ✅ | ✅ |
| 3 | Player Profiles | `/players/[id]` | P0 | ✅ 85% | ✅ | ⏳ |
| 4 | Team Pages | `/teams/[id]` | P1 | ✅ 95% | ✅ | ⏳ |
| 5 | Stats Pages | `/stats/[cat]` | P1 | ✅ 100% | ✅ | ⏳ |
| 6 | Matchup Preview | `/games/[id]/preview` | P1 | ✅ 85% | ✅ | ⏳ |
| 7 | Stadium Pages | `/stadiums/[id]` | P2 | ✅ 90% | ✅ | ⏳ |

**Total**: 7 page types, all with complete specifications ✅

---

## 🗂️ File Locations

All specifications located in:
```
coderef/finalizing-elements/
├── live-scoreboard/
│   └── components.json ✅
├── game-details/
│   ├── components.json ✅
│   └── template-next-down-metrics.tsx ✅
├── player-profiles/
│   └── components.json ✅
├── team-pages/
│   └── components.json ✅
├── stats/
│   └── components.json ✅
├── matchup-preview/
│   └── components.json ✅
└── stadium-pages/
    └── components.json ✅
```

---

## 🎨 Themes Available

All 7 pages support the **13 primary themes**:
1. Bold Vibrant
2. Classic Almanac
3. Classic Newspaper
4. Cyberpunk Holographic
5. Fourth Forever
6. Glassmorphism
7. Gridiron Legacy
8. Luxury Magazine
9. **Next Down Metrics (HUD)** ⭐ DEFAULT
10. Retro TV Broadcast
11. Retro Video Game
12. Sunday Lights
13. Tech Forward

**See `THEMES/` folder for complete theme specifications.**

---

## 🚀 Build Order

### Recommended Implementation Order:

**Week 1-2**: Foundation + Homepage
1. Set up Next.js 14 + Tailwind CSS v4 + shadcn/ui
2. Set up Supabase client
3. Implement theme system
4. **Build Homepage / Live Scoreboard**

**Week 3-4**: Core Game Pages
5. **Build Game Details Pages** (use template)

**Week 5-6**: Player & Team Pages
6. **Build Player Profile Pages**
7. **Build Team Pages**

**Week 7-8**: Stats & Analysis
8. **Build Stats & Leaderboards**
9. **Build Matchup Preview Pages**

**Week 9**: Polish
10. **Build Stadium Pages**
11. Implement theme switcher
12. Performance optimization

---

## ✅ What's Ready

- ✅ All 7 components.json files created
- ✅ 1 complete template (Game Details - Next Down Metrics)
- ✅ 13 primary themes documented
- ✅ Data sources mapped for all pages
- ✅ 85-100% data availability across all pages
- ✅ Theme system ready
- ✅ Component hierarchy defined

**You can start building immediately!** 🚀

---

Last Updated: October 23, 2025
