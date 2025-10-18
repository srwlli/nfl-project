# NFL Betting Platform - Frontend Architecture Brainstorm

**Date:** October 16, 2025
**Status:** Planning Phase
**Context:** Backend complete (21 scripts, 6 APIs, 10 betting sources), ready for NextJS migration

---

## 📋 Executive Summary

### Current State Assessment

**Backend Status: ✅ COMPLETE**
- 21 data processing scripts fully documented (see `additional-context/1_DATA_PROCESSING_SCRIPTS.md`)
- 11 API endpoints planned (FastAPI architecture documented in `nextjs-project-migration.md`)
- 6 data sources integrated:
  - **Free (4):** nflreadpy, nflscraPy, sportsref-nfl, ESPN API
  - **Optional Paid (2):** The Odds API ($99/mo), OpenWeatherMap ($40/mo)
- 10 betting metrics available:
  - Spread lines, totals (O/U), moneylines, ATS records, EPA metrics, power ratings, weather data, rest days, injury reports, historical trends
- **Data Coverage:** 85-95% of betting needs covered with free sources
- **2025 Season Only:** 2024 data blocked via 3-layer validation

**Prototype Status: 🟡 IN PROGRESS**
- `/a` folder contains modular data system
- Component specs fully documented:
  - `scorebug-info.json` - 3 status modes (Completed/Live/Upcoming)
  - `full-game-details-info.json` - Comprehensive game stats component
  - `quickstats-info.json` - Top performer displays
- CLI-first approach with JSON outputs
- ESPN API integration working (rosters module complete)
- Data sources: nflreadpy (primary), ESPN API (live), nflscraPy (historical)

**Gap: Need production-ready NextJS frontend**

---

## 🏗️ Architecture Options

### Option 1: NextJS App Router + FastAPI Backend (✅ RECOMMENDED)

#### Stack
- **Frontend:** Next.js 14+ (App Router), TypeScript, TailwindCSS
- **Backend:** FastAPI (Python) - serves existing backend logic via REST API
- **Data Layer:** Parquet files + Redis caching
- **Deployment:** Vercel (frontend) + Railway/Fly.io (backend)

#### Why This Works
- ✅ **Leverages all existing Python scripts** - No rewrite needed for 21 scripts
- ✅ **Next.js App Router** - Server Components + Client Components separation for optimal performance
- ✅ **API routes in FastAPI already planned** - See `nextjs-project-migration.md` for 11 endpoint specs
- ✅ **Incremental migration** - Can move from Streamlit prototype gradually
- ✅ **Production-ready** - Scalable, modern, excellent DX
- ✅ **Polars performance** - Keep 2-10x faster DataFrame operations in Python
- ✅ **Type safety** - TypeScript frontend + Python backend with Pydantic models

#### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│  NextJS Frontend (Vercel)                                       │
│  ├── /app/page.tsx (Home - Scoreboard)                          │
│  ├── /app/games/[gameId]/page.tsx (Game Details)                │
│  ├── /app/teams/[teamId]/page.tsx (Team Stats)                  │
│  ├── /app/betting/page.tsx (Betting Dashboard)                  │
│  └── /components/                                               │
│      ├── Scorebug.tsx (3 modes: Completed/Live/Upcoming)        │
│      ├── FullGameDetails.tsx (Box scores, drives, scoring)      │
│      ├── QuickStats.tsx (Top performers)                        │
│      ├── BettingMetrics.tsx (Spread/Total/ML analysis)          │
│      └── WeatherWidget.tsx (Game-day forecast)                  │
└─────────────────────────────────────────────────────────────────┘
                          ↓ REST API calls (fetch/SWR)
┌─────────────────────────────────────────────────────────────────┐
│  FastAPI Backend (Railway/Fly.io)                               │
│  ├── GET /api/scoreboard?week={week}&season={2025}              │
│  ├── GET /api/games/{gameId} (ESPN API proxy + processed data)  │
│  ├── GET /api/teams/{teamId} (season stats from Parquet)        │
│  ├── GET /api/betting/metrics?week={week} (aggregated insights) │
│  ├── Redis Cache (30s TTL for live data, 1hr for team stats)    │
│  ├── Polars/Pandas → Parquet data access layer                  │
│  └── Background jobs (daily data updates via Cron)              │
└─────────────────────────────────────────────────────────────────┘
                          ↓ Data storage
┌─────────────────────────────────────────────────────────────────┐
│  Data Layer (Railway S3 / Fly.io Volumes)                       │
│  ├── data/raw/*.parquet (nflreadpy outputs: ~5-10MB for 2025)   │
│  │   ├── schedules_2025.parquet (46 columns, betting lines)     │
│  │   ├── play_by_play_2025.parquet (372 columns, EPA metrics)   │
│  │   ├── player_stats_2025.parquet (114 columns)                │
│  │   ├── rosters_2025.parquet (36 columns)                      │
│  │   ├── injuries_2025.parquet                                  │
│  │   └── depth_charts_2025.parquet (12 columns)                 │
│  └── data/processed/*.json (API responses, ~2-5MB)              │
│      ├── team_data_KC_2025.json                                 │
│      ├── team_data_BUF_2025.json                                │
│      ├── betting_metrics_index.json                             │
│      └── 2025_season_metrics.json                               │
└─────────────────────────────────────────────────────────────────┘
```

#### Request Flow Example (Game Detail Page)
```
User visits: /games/401547417
    ↓
Next.js Server Component (SSR)
    ↓ fetch('https://api.example.com/api/games/401547417')
FastAPI Backend
    ↓ Check Redis cache (key: "game:401547417", TTL: 30s)
    ↓ Cache miss → Fetch data
    ├─ ESPN API: game summary, box score, drives, scoring plays
    ├─ Parquet: schedules_2025.parquet for betting lines
    └─ Parquet: play_by_play_2025.parquet for EPA calculations
    ↓ Process data, store in Redis
    ↓ Return JSON
Next.js renders page with data
    ↓ Hydrate client components (SWR polling for live updates)
```

---

### Option 2: Full TypeScript Migration (❌ NOT RECOMMENDED)

#### Stack
- Next.js 14+ (App Router), TypeScript, Node.js
- All Python scripts ported to TypeScript
- DanfoJS/Arquero for DataFrame operations
- Node.js Parquet libraries

#### Why This Is Harder
- ❌ **Requires rewriting 21 Python scripts to TypeScript** - Estimated 6-8 weeks of work
- ❌ **Loss of Polars performance** - DanfoJS is 2-10x slower than Polars
- ❌ **Parquet support in Node.js is less mature** - Limited libraries, less stable
- ❌ **nflreadpy library not available in Node** - Would need custom API wrappers for all data sources
- ❌ **No reuse of existing backend logic** - Duplicate effort, higher maintenance burden
- ❌ **Pandas equivalent in JS (DanfoJS) is less battle-tested** - Fewer Stack Overflow answers

#### When to Consider This
- Only if Python backend hosting is impossible (very rare)
- If team has no Python expertise for maintenance (hire Python dev instead)
- If serverless constraints require JS-only (not applicable here)

**Verdict:** Stick with Option 1 unless there's a compelling business constraint.

---

## 📄 Page Structure & Routes

### 1. Home Page: `/` (Scoreboard Dashboard)

**Purpose:** Live scoreboard with all games for current week

**Components:**
- **Header:** Logo, navigation (Scoreboard | Teams | Betting | About)
- **Week Selector:** Dropdown to change week (1-18 regular season, 19-22 playoffs)
- **Game Status Tabs:** Upcoming | Live | Completed
- **Scorebug Grid:** 3-column responsive grid of game cards

**Data Fetching:**
- Server Component fetches initial data (SSR for SEO)
- Client Component polls `/api/scoreboard?week=5&season=2025` every 30s for live updates
- Uses SWR for caching and revalidation

**Layout Wireframe:**
```
┌──────────────────────────────────────────────────────────────────┐
│  🏈 NFL Betting Dashboard    [Scoreboard] [Teams] [Betting] [...] │
├──────────────────────────────────────────────────────────────────┤
│  Week: [▼ Week 5]      2025 Season      Updated: 2 sec ago       │
├──────────────────────────────────────────────────────────────────┤
│  [Upcoming (8)] [Live (3)] [Completed (5)]                       │
├──────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ FINAL #666666 │  │ Q3 5:32 #ff44 │  │ Sun 1PM #00cc │       │
│  │ KC      28 ✓ │  │ BUF     21 ✓ │  │ SF       - │       │
│  │ BUF     24   │  │ MIA     17   │  │ DAL      - │       │
│  │ 8:45 PM ET   │  │ Live         │  │ Spread: -3.5 │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ ... (more)   │  │ ... (more)   │  │ ... (more)   │       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
└──────────────────────────────────────────────────────────────────┘
```

**State Management:**
- `selectedWeek` (Zustand global state)
- `gamesData` (SWR server state, auto-refresh every 30s)
- `activeTab` (local component state: 'upcoming' | 'live' | 'completed')

**Data Flow:**
```typescript
// app/page.tsx
export default async function HomePage() {
  // Server Component - initial data (SSR)
  const initialData = await fetch(`${API_URL}/api/scoreboard?week=5&season=2025`)
    .then(res => res.json());

  return <ScoreboardClient initialData={initialData} />;
}

// components/ScoreboardClient.tsx (Client Component)
'use client';
export function ScoreboardClient({ initialData }) {
  const { data, error } = useSWR(
    `/api/scoreboard?week=${selectedWeek}&season=2025`,
    fetcher,
    { fallbackData: initialData, refreshInterval: 30000 }
  );

  return <ScoreboardGrid games={data.games} />;
}
```

---

### 2. Game Detail Page: `/games/[gameId]`

**Purpose:** Deep dive into specific game with full stats, betting analysis, and live updates

**Components:**
1. **Scorebug** (from `scorebug-info.json` spec)
   - 3 modes: Completed (gray badge) | Live (red pulse) | Upcoming (blue)
   - Winner highlighting with team color gradient
   - Status badge shows FINAL / Quarter / Date

2. **Quick Stats** (Top Performers)
   - Passing: Top QB stats (YDS, TD, INT)
   - Rushing: Top RB stats (CAR, YDS, TD)
   - Receiving: Top WR/TE stats (REC, YDS, TD)

3. **Betting Metrics Accordion** (Expandable)
   - **Spread Analysis:**
     - Pre-game line vs closing line
     - Result: Covered ✅ / Pushed / Lost ❌
     - Historical ATS records for both teams
   - **Total (O/U) Analysis:**
     - Pre-game total vs closing total
     - Result: Over ✅ / Under ✅ / Pushed
     - Scoring pace by quarter
   - **Moneyline Odds:**
     - Pre-game odds
     - Implied win probability
   - **Key Betting Factors:**
     - Injury report (starters out)
     - Weather impact (wind >15mph, rain, temp)
     - Rest days (team on bye vs short week)

4. **Full Game Details Expander** (from `full-game-details-info.json` spec)
   - **Tab 1: Team A Stats**
     - Box Score: PASSING, RUSHING, RECEIVING, FUMBLES, DEFENSIVE, INTERCEPTIONS, KICK RETURNS, PUNT RETURNS, KICKING, PUNTING
     - Drives: Chronological list with play count, yards, time, result, field position
   - **Tab 2: Team B Stats**
     - Same as Tab 1 for opponent
   - **Tab 3: Scoring Summary**
     - Chronological scoring plays
     - Win probability per score (if available)
     - Play description with yardage

**Data Fetching:**
- Server Component: Initial game data (SSR or ISR with 30s revalidation)
- Client Component: Live polling if `game.status === 'live'`
- ESPN API: `/summary?event={gameId}` for box scores, drives, scoring plays
- Parquet: `schedules_2025.parquet` for betting lines
- Redis: Cache with 30s TTL for live games, 1hr for completed games

**Layout Wireframe:**
```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back to Scoreboard                                            │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ FINAL #666666                           8:45 PM ET         │ │
│  │ KC      28  [Winner gradient, bold, #ffffff]               │ │
│  │ BUF     24  [Loser dimmed, #cccccc]                        │ │
│  └────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│  Quick Stats:                                                    │
│  📊 Mahomes 312 YDS, 3 TD, 0 INT | Allen 280 YDS, 2 TD, 1 INT   │
│  🏃 Pacheco 85 YDS, 1 TD | Cook 65 YDS, 0 TD                    │
│  🎯 Kelce 8 REC, 95 YDS, 2 TD | Diggs 7 REC, 110 YDS, 1 TD      │
├──────────────────────────────────────────────────────────────────┤
│  🎯 Betting Analysis (click to expand) ▼                         │
│  ├─ Spread: KC -3.5 → Closed -3.0                               │
│  │   KC won by 4 ✅ COVERED (beat spread by 0.5)                │
│  │   KC ATS: 6-4 (60%) | BUF ATS: 5-5 (50%)                     │
│  ├─ Total: 51.5 → Closed 52.0                                   │
│  │   Combined: 52 ✅ OVER HIT (by 0.5)                          │
│  │   Scoring pace: Q1: 14, Q2: 17, Q3: 7, Q4: 14               │
│  ├─ Moneylines: KC -165 (62.3% implied) | BUF +145 (40.8%)      │
│  └─ Key Factors:                                                 │
│      • Weather: 45°F, Wind 8mph NE (no impact)                  │
│      • Injuries: BUF WR2 (Gabe Davis) OUT                       │
│      • Rest: Both teams standard week rest                      │
├──────────────────────────────────────────────────────────────────┤
│  📊 Full Game Details (click to expand) ▼                        │
│  ├─ [KC Stats] [BUF Stats] [Scoring Summary]                    │
│  │                                                               │
│  │  KC Stats Tab:                                               │
│  │  ┌─────────────────────────────────────────────────────┐    │
│  │  │ PASSING                                              │    │
│  │  │ Player          C/ATT   YDS   AVG  TD  INT  SACKS   │    │
│  │  │ Patrick Mahomes 25/35   312   8.9  3   0    2       │    │
│  │  └─────────────────────────────────────────────────────┘    │
│  │  ┌─────────────────────────────────────────────────────┐    │
│  │  │ RUSHING                                              │    │
│  │  │ Player          CAR   YDS   AVG   TD   LONG          │    │
│  │  │ Isiah Pacheco   18    85    4.7   1    22           │    │
│  │  │ Patrick Mahomes 3     12    4.0   0    8            │    │
│  │  └─────────────────────────────────────────────────────┘    │
│  │                                                               │
│  │  Drives (14 total):                                          │
│  │  1. 14 plays, 75 yards, 6:32 → Touchdown (Own 25 → Opp 0)   │
│  │  2. 3 plays, 8 yards, 1:22 → Punt (Own 20 → Own 28)         │
│  │  ... (more drives)                                           │
│  │                                                               │
│  │  Scoring Summary Tab:                                        │
│  │  Q1 10:32 | KC +7 | KC 7 - BUF 0                            │
│  │  Win Prob: KC 68.5% - BUF 31.5%                             │
│  │  Patrick Mahomes 12 yd pass to Travis Kelce (Butker kick)   │
│  │                                                               │
│  │  Q2 5:15 | BUF +7 | KC 7 - BUF 7                            │
│  │  Win Prob: KC 52.0% - BUF 48.0%                             │
│  │  Josh Allen 18 yd pass to Stefon Diggs (Bass kick)          │
│  │  ... (more scores)                                           │
│  └──────────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

**State Management:**
- `gameId` (route param)
- `gameData` (SWR, auto-refresh every 30s if live)
- `expandedSections` (local state: betting, fullDetails)

---

### 3. Team Page: `/teams/[teamId]`

**Purpose:** Team-specific dashboard with season stats, betting performance, and schedule

**Components:**
1. **Team Header**
   - Team logo (if available)
   - Team name + record (W-L-T)
   - Division + standings position (e.g., "AFC West: 1st")

2. **Season Stats Tabs**
   - **Overview:**
     - Offensive stats: PPG, Total YPG, Pass YPG, Rush YPG
     - Defensive stats: Points Allowed, Total YPG Allowed
     - Rankings: NFL rank for each category
   - **EPA Metrics:**
     - Pass EPA per play (offense + defense)
     - Rush EPA per play (offense + defense)
     - Success rate percentages
   - **Betting Performance:**
     - ATS record (Against The Spread): 6-4 (60%)
     - O/U record: 7-3 (70% over)
     - Home vs Away ATS splits
     - Division games ATS record
   - **Schedule:**
     - Past games: Final score, result (W/L), ATS result, O/U result
     - Upcoming games: Opponent, date/time, spread, total
   - **Power Ratings:**
     - Current ELO rating
     - Historical ELO chart (1970-2025 if using nflscraPy)
     - QB-adjusted ELO (if applicable)

**Data Fetching:**
- Static or ISR (revalidate every 1 hour - stats don't change often)
- Uses `/api/teams/{teamId}` endpoint
- Data source: `team_data_{TEAM}_2025.json` (from `fetch_team_data.py` script)

**Layout Wireframe:**
```
┌──────────────────────────────────────────────────────────────────┐
│  ← Back to Teams                                                 │
├──────────────────────────────────────────────────────────────────┤
│  🏈 Kansas City Chiefs (8-2)                 AFC West: 1st       │
│  [Logo placeholder]                                              │
├──────────────────────────────────────────────────────────────────┤
│  [Overview] [EPA] [Betting] [Schedule] [Power Ratings]          │
├──────────────────────────────────────────────────────────────────┤
│  Overview Tab:                                                   │
│                                                                  │
│  Offensive Stats:                                                │
│  • Points Per Game: 28.5 (3rd in NFL)                           │
│  • Total Yards Per Game: 365.2 (7th in NFL)                     │
│  • Passing YPG: 268.5 (5th in NFL)                              │
│  • Rushing YPG: 96.7 (18th in NFL)                              │
│  • Turnovers: 8 (12th fewest)                                   │
│                                                                  │
│  Defensive Stats:                                                │
│  • Points Allowed Per Game: 19.8 (8th in NFL)                   │
│  • Total Yards Allowed: 325.4 (10th in NFL)                     │
│  • Pass Yards Allowed: 215.6 (9th in NFL)                       │
│  • Rush Yards Allowed: 109.8 (12th in NFL)                      │
│  • Takeaways: 12 (8th most)                                     │
│                                                                  │
│  EPA Tab:                                                        │
│  • Offensive Pass EPA: +0.18 (5th in NFL)                       │
│  • Offensive Rush EPA: +0.02 (12th in NFL)                      │
│  • Defensive Pass EPA: -0.08 (9th in NFL)                       │
│  • Defensive Rush EPA: -0.05 (10th in NFL)                      │
│  • Success Rate: 48.5% (6th in NFL)                             │
│                                                                  │
│  Betting Tab:                                                    │
│  • ATS Record: 6-4 (60%)                                        │
│  • O/U Record: 7-3 (70% over)                                   │
│  • Home ATS: 3-2 (60%)                                          │
│  • Away ATS: 3-2 (60%)                                          │
│  • Division ATS: 2-1 (67%)                                      │
│  • As Favorite: 5-3 ATS                                         │
│  • As Underdog: 1-1 ATS                                         │
│                                                                  │
│  Schedule Tab:                                                   │
│  Past Games:                                                     │
│  Week 1: W 27-20 vs DET | Spread: -3.5 ✅ | Total: 52.5 ❌      │
│  Week 2: W 17-10 @ JAX | Spread: -3.0 ✅ | Total: 45.5 ❌       │
│  ... (all past games)                                            │
│                                                                  │
│  Upcoming Games:                                                 │
│  Week 11: vs BUF (Sun 8:20 PM ET)                               │
│            Spread: KC -3.5 | Total: 51.5 | ML: KC -165          │
│  Week 12: @ LV (Fri 3:00 PM ET)                                 │
│            Spread: KC -7.0 | Total: 48.5 | ML: KC -300          │
│  ... (all upcoming games)                                        │
│                                                                  │
│  Power Ratings Tab:                                              │
│  Current ELO: 1612 (3rd in NFL)                                 │
│  [Line chart: ELO over 2025 season, 10 weeks]                   │
│  Historical Peak: 1650 (2020 Super Bowl season)                 │
└──────────────────────────────────────────────────────────────────┘
```

**State Management:**
- `teamId` (route param)
- `teamData` (SWR with 1hr revalidation)
- `activeTab` (local state)

---

### 4. Betting Dashboard: `/betting`

**Purpose:** Aggregated betting insights across all games for the week

**Components:**
1. **Week Overview Section**
   - Best ATS teams this week (by winning %)
   - Worst ATS teams this week (by losing %)
   - Best O/U trends (teams consistently going over/under)
   - Public betting percentages (if The Odds API integrated)

2. **Value Plays Section**
   - **Line Movement Alerts:**
     - Games where spread moved >2 points (sharp money indicator)
     - Games where total moved >3 points
   - **Weather-Impacted Games:**
     - Wind >15mph (affects passing/kicking)
     - Rain/snow (affects totals)
     - Temperature extremes (cold weather = lower totals)
   - **Rest Advantage:**
     - Teams coming off bye week (well-rested)
     - Teams on short week (Thursday night = tired)
   - **Injury Impact:**
     - Key starters out (QB, WR1, RB1, etc.)

3. **Historical Trends Section**
   - **Division Games:**
     - Division rivals ATS performance (historically tight spreads)
     - Home vs away in division
   - **Prime Time Games:**
     - Sunday Night Football O/U trends (tends to go under)
     - Monday Night Football ATS trends
   - **Situational Spots:**
     - Revenge games (lost to opponent earlier in season)
     - Trap games (good team vs bad team after big win)

**Data Fetching:**
- `/api/betting/metrics?week={week}&season=2025` endpoint
- Aggregates data from:
  - `betting_metrics_index.json`
  - `2025_season_metrics.json`
  - `schedules_2025.parquet` (betting lines)
  - OpenWeatherMap API (weather forecasts)

**Layout Wireframe:**
```
┌──────────────────────────────────────────────────────────────────┐
│  🎯 Betting Dashboard - Week 5                                   │
├──────────────────────────────────────────────────────────────────┤
│  Week Overview:                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ Best ATS This Week  │  │ Worst ATS This Week │              │
│  │ 1. KC (6-4, 60%)    │  │ 1. NYJ (3-7, 30%)   │              │
│  │ 2. BUF (7-3, 70%)   │  │ 2. DEN (4-6, 40%)   │              │
│  │ 3. SF (6-4, 60%)    │  │ 3. LV (3-7, 30%)    │              │
│  └─────────────────────┘  └─────────────────────┘              │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ Over Trends         │  │ Under Trends        │              │
│  │ 1. MIA (8-2 O/U)    │  │ 1. NE (2-8 O/U)     │              │
│  │ 2. KC (7-3 O/U)     │  │ 2. PIT (3-7 O/U)    │              │
│  │ 3. PHI (7-3 O/U)    │  │ 3. CLE (2-8 O/U)    │              │
│  └─────────────────────┘  └─────────────────────┘              │
├──────────────────────────────────────────────────────────────────┤
│  🚨 Value Plays:                                                 │
│                                                                  │
│  Line Movement Alerts:                                           │
│  • BUF @ MIA: Spread moved from MIA -3.5 → MIA -6.0 (sharp $)   │
│  • SF @ LAR: Total moved from 48.5 → 45.5 (injury news)         │
│                                                                  │
│  Weather-Impacted Games:                                         │
│  • CHI @ GB (Lambeau Field): Wind 22mph NW, Rain 60% chance     │
│    → Consider UNDER 42.5 (wind affects passing, field goals)    │
│  • BUF @ MIA (Hard Rock Stadium): Clear, 78°F (dome, no impact) │
│                                                                  │
│  Rest Advantage:                                                 │
│  • KC (off bye) vs BUF (standard week) → KC +2% win prob        │
│  • DEN (short week, Thu) @ LV (standard) → LV +3% win prob      │
│                                                                  │
│  Injury Impact:                                                  │
│  • BUF WR2 (Gabe Davis) OUT → BUF passing attack -5% efficiency │
│  • SF RB1 (CMC) QUESTIONABLE → SF total could drop 3 points     │
├──────────────────────────────────────────────────────────────────┤
│  📊 Historical Trends:                                           │
│                                                                  │
│  Division Games This Week:                                       │
│  • KC @ LV (AFC West): Division rivals are 45-55 ATS (tight)    │
│  • PHI @ DAL (NFC East): Home team is 60-40 ATS in rivalry      │
│                                                                  │
│  Prime Time Games:                                               │
│  • Sunday Night: BUF @ MIA                                       │
│    → SNF totals go UNDER 55% of the time (defensive chess match)│
│  • Monday Night: SF @ LAR                                        │
│    → MNF home underdogs cover 58% of the time                   │
│                                                                  │
│  Situational Spots:                                              │
│  • Revenge Game: BUF @ MIA (MIA won Week 2) → BUF motivated     │
│  • Trap Game: KC vs LV (KC coming off big win vs BUF) → beware  │
└──────────────────────────────────────────────────────────────────┘
```

**State Management:**
- `selectedWeek` (Zustand global state)
- `bettingMetrics` (SWR, refresh every 5min)
- `weatherData` (SWR, refresh every 1hr)

---

## 🧩 Component Library Architecture

Based on existing component specs and new requirements, here's the full component library:

### Core Components (`/components/`)

#### 1. **`Scorebug.tsx`** (from `scorebug-info.json`)

**Purpose:** Core game score display with 3 status modes

**Props:**
```typescript
interface ScorebugProps {
  // Required
  awayTeam: string;           // "KC"
  homeTeam: string;           // "BUF"
  awayScore: string | number; // 28 or "-"
  homeScore: string | number; // 24 or "-"
  statusText: string;         // "FINAL" | "Q3" | "2025-09-11"
  statusColor: string;        // "#666666" | "#ff4444" | "#0066cc"

  // Optional
  gameTime?: string;          // "8:45 PM ET" | "5:32" | "8:20 PM ET"
  showBetting?: boolean;      // Default: true
  bettingData?: {
    spread_line: string;      // "KC -3.5"
    total_line: string;       // "51.5"
    away_ml: string;          // "-165"
    home_ml: string;          // "+145"
  };
  gameInfo?: {
    stadium: string;          // "Arrowhead Stadium"
    roof: string;             // "outdoor" | "dome" | "retractable"
    temp: string;             // "45°F"
    wind: string;             // "8mph NE"
  };
  teamColors?: Record<string, string>; // Custom colors
  showWrapper?: boolean;      // Default: true (false for unified card)
}
```

**Status Modes:**
1. **Completed (`#666666` gray)**
   - Status badge: "FINAL" / "FINAL/OT" / "FINAL/2OT"
   - Winner highlighted (gradient + bold + white text)
   - Loser dimmed (#cccccc gray text)
   - Game end time displayed

2. **Live (`#ff4444` red)**
   - Status badge: "Q1" / "Q2" / "Q3" / "Q4" / "OT" / "HALFTIME"
   - Optional pulsing animation
   - Currently winning team highlighted (dynamic)
   - Game clock displayed next to quarter

3. **Upcoming (`#0066cc` blue)**
   - Status badge: Date ("2025-09-11") / "TBD" / "SCHEDULED"
   - No scores (both show "-")
   - No winner highlighting (equal styling)
   - Kickoff time displayed
   - Betting lines prominently shown

**Winner Highlighting:**
- Background: `linear-gradient(90deg, rgba(team_color, 0.15) 0%, transparent 100%)`
- Text color: Winner `#ffffff`, Loser `#cccccc`
- Font weight: Winner `bold`, Loser `normal`
- Border left: `5px solid [team_color]`

**Example Usage:**
```tsx
// Completed game
<Scorebug
  awayTeam="KC"
  homeTeam="BUF"
  awayScore={28}
  homeScore={24}
  statusText="FINAL"
  statusColor="#666666"
  gameTime="8:45 PM ET"
/>

// Live game
<Scorebug
  awayTeam="BUF"
  homeTeam="MIA"
  awayScore={21}
  homeScore={17}
  statusText="Q3"
  statusColor="#ff4444"
  gameTime="5:32"
/>

// Upcoming game
<Scorebug
  awayTeam="SF"
  homeTeam="DAL"
  awayScore="-"
  homeScore="-"
  statusText="2025-09-11"
  statusColor="#0066cc"
  gameTime="8:20 PM ET"
  bettingData={{
    spread_line: "SF -3.5",
    total_line: "48.5",
    away_ml: "-165",
    home_ml: "+145"
  }}
/>
```

---

#### 2. **`FullGameDetails.tsx`** (from `full-game-details-info.json`)

**Purpose:** Comprehensive game statistics with box scores, drives, and scoring timeline

**Props:**
```typescript
interface FullGameDetailsProps {
  summaryData: {
    boxscore: {
      players: Array<{
        team: { abbreviation: string };
        statistics: Array<{
          name: string; // "passing" | "rushing" | "receiving" | etc.
          labels: string[]; // ["C/ATT", "YDS", "AVG", "TD", "INT"]
          athletes: Array<{
            athlete: {
              displayName: string;
              links?: Array<{ href: string }>;
            };
            stats: string[]; // ["25/35", "312", "8.9", "3", "0"]
          }>;
        }>;
      }>;
    };
    drives: {
      previous: Array<{
        team: { abbreviation: string };
        description: string; // "14 plays, 75 yards, 6:32"
        result: string; // "Touchdown" | "Field Goal" | "Punt" | etc.
        start: { text: string }; // "Own 25"
        end: { text: string }; // "Opp 0"
      }>;
    };
    scoringPlays: Array<{
      team: { abbreviation: string };
      period: { number: number };
      clock: { displayValue: string };
      scoreValue: number; // 3 | 6 | 7 | 8 | 2
      awayScore: number;
      homeScore: number;
      probability?: {
        awayWinPercentage: number;
        homeWinPercentage: number;
      };
      text: string; // "Mahomes 12 yd pass to Kelce (Butker kick)"
    }>;
  };
  awayTeam: string;
  homeTeam: string;
}
```

**Component Structure:**
- **3-tab interface:** Team A | Team B | Scoring Summary
- **Team Tabs:**
  - **Box Score Section:** All stat categories (PASSING, RUSHING, RECEIVING, FUMBLES, DEFENSIVE, INTERCEPTIONS, KICK RETURNS, PUNT RETURNS, KICKING, PUNTING)
  - **Drives Section:** Chronological list of all drives with description, result, field position
- **Scoring Summary Tab:**
  - All scoring plays in chronological order
  - Header: `Q{period} {clock} | {team} +{score_value} | {away_score} - {home_score}`
  - Win probability: `Win Prob: {away_team} {away_pct}% - {home_team} {home_pct}%`
  - Play description: Full text

**Data Processing:**
- Box scores: Pandas-style DataFrame → HTML table
- Player names: Wrapped in `<a>` tags if `athlete.links` exists
- Drives: Filtered by team abbreviation, rendered chronologically
- Scoring plays: All plays with win probability if available

**Edge Cases:**
- No drives yet: Shows "No drives yet" message
- No scoring plays: Shows "No scoring plays available" message
- Player no link: Renders plain text name
- Empty category: Category header shown but table empty
- Single team data: Only one team tab populated

**Example Usage:**
```tsx
<FullGameDetails
  summaryData={espnSummaryData}
  awayTeam="KC"
  homeTeam="BUF"
/>
```

---

#### 3. **`QuickStats.tsx`**

**Purpose:** Top performer highlights for passing, rushing, receiving

**Props:**
```typescript
interface QuickStatsProps {
  gameId: string;
  summaryData: {
    boxscore: {
      players: Array<{
        // Same structure as FullGameDetails
      }>;
    };
  };
}
```

**Display Logic:**
- **Passing:** Top QB by passing yards (show YDS, TD, INT)
- **Rushing:** Top RB by rushing yards (show CAR, YDS, TD)
- **Receiving:** Top WR/TE by receiving yards (show REC, YDS, TD)

**Layout:**
```tsx
<div className="quick-stats">
  <div className="stat-category">
    <span className="icon">📊</span>
    <span className="label">Passing:</span>
    <span className="stats">Mahomes 312 YDS, 3 TD, 0 INT</span>
  </div>
  <div className="stat-category">
    <span className="icon">🏃</span>
    <span className="label">Rushing:</span>
    <span className="stats">Pacheco 85 YDS, 1 TD</span>
  </div>
  <div className="stat-category">
    <span className="icon">🎯</span>
    <span className="label">Receiving:</span>
    <span className="stats">Kelce 8 REC, 95 YDS, 2 TD</span>
  </div>
</div>
```

---

#### 4. **`BettingMetrics.tsx`** (NEW)

**Purpose:** Betting analysis for spread, total, moneyline

**Props:**
```typescript
interface BettingMetricsProps {
  gameId: string;
  bettingData: {
    // Pre-game lines
    spread_line: string;        // "KC -3.5"
    total_line: string;         // "51.5"
    away_moneyline: string;     // "-165"
    home_moneyline: string;     // "+145"

    // Closing lines (if available)
    closing_spread?: string;    // "KC -3.0"
    closing_total?: string;     // "52.0"

    // Results (if game completed)
    spread_result?: "covered" | "pushed" | "lost";
    total_result?: "over" | "under" | "pushed";

    // Team ATS records
    away_ats_record?: string;   // "6-4 (60%)"
    home_ats_record?: string;   // "5-5 (50%)"
  };
  gameStatus: "upcoming" | "live" | "completed";
}
```

**Component Sections:**

1. **Spread Analysis:**
   ```
   Spread: KC -3.5 → Closed -3.0
   KC won by 4 ✅ COVERED (beat spread by 0.5)
   KC ATS: 6-4 (60%) | BUF ATS: 5-5 (50%)
   ```

2. **Total (O/U) Analysis:**
   ```
   Total: 51.5 → Closed 52.0
   Combined: 52 ✅ OVER HIT (by 0.5)
   Scoring pace: Q1: 14, Q2: 17, Q3: 7, Q4: 14
   ```

3. **Moneyline Display:**
   ```
   Moneylines: KC -165 (62.3% implied) | BUF +145 (40.8% implied)
   ```

4. **Key Factors:**
   ```
   • Weather: 45°F, Wind 8mph NE (no impact)
   • Injuries: BUF WR2 (Gabe Davis) OUT
   • Rest: Both teams standard week rest
   ```

**Conditional Rendering:**
- **Upcoming games:** Show pre-game lines, no results
- **Live games:** Show pre-game vs current live lines (if odds API)
- **Completed games:** Show pre-game vs closing lines, final results

---

#### 5. **`WeatherWidget.tsx`** (OPTIONAL)

**Purpose:** Game-day weather forecast with betting impact analysis

**Props:**
```typescript
interface WeatherWidgetProps {
  stadium: string;            // "Arrowhead Stadium"
  gameTime: string;           // ISO timestamp or "2025-09-11T20:20:00Z"
  roof: "outdoor" | "dome" | "retractable";
}
```

**Data Source:**
- OpenWeatherMap API (optional paid: $0-40/mo)
- Forecast endpoint: `/forecast?lat={lat}&lon={lon}&appid={key}`

**Display:**
```tsx
<div className="weather-widget">
  <div className="weather-header">
    <span>🌤️ Weather</span>
    <span className="stadium">{stadium} (Outdoor)</span>
  </div>
  <div className="weather-details">
    <div className="temp">45°F</div>
    <div className="wind">Wind: 8mph NE</div>
    <div className="precipitation">Rain: 0%</div>
  </div>
  <div className="betting-impact">
    ⚠️ Impact: Minimal (wind <15mph)
  </div>
</div>
```

**Betting Impact Logic:**
- Wind >15mph: "High impact - affects passing, field goals"
- Rain/snow: "Moderate impact - lower totals expected"
- Temperature <20°F: "Cold weather - lower totals"
- Dome/retractable closed: "No impact - indoor"

**Conditional Rendering:**
- Only show for outdoor stadiums
- Only show for upcoming games (no need for completed)
- Show cached forecast for live games

---

#### 6. **`TeamStatsCard.tsx`**

**Purpose:** Team season statistics card for team page

**Props:**
```typescript
interface TeamStatsCardProps {
  teamId: string;
  stats: {
    // Offensive stats
    ppg: number;              // 28.5
    total_ypg: number;        // 365.2
    pass_ypg: number;         // 268.5
    rush_ypg: number;         // 96.7
    turnovers: number;        // 8

    // Defensive stats
    points_allowed_pg: number; // 19.8
    total_ya_pg: number;      // 325.4
    pass_ya_pg: number;       // 215.6
    rush_ya_pg: number;       // 109.8
    takeaways: number;        // 12

    // EPA metrics
    pass_epa_offense: number; // +0.18
    rush_epa_offense: number; // +0.02
    pass_epa_defense: number; // -0.08
    rush_epa_defense: number; // -0.05
    success_rate: number;     // 48.5%

    // Betting stats
    ats_record: string;       // "6-4 (60%)"
    ou_record: string;        // "7-3 (70%)"

    // Rankings (NFL rank out of 32)
    ppg_rank: number;         // 3
    total_ypg_rank: number;   // 7
    // ... (all other ranks)
  };
}
```

**Layout:**
```tsx
<div className="team-stats-card">
  <div className="stats-section">
    <h3>Offensive Stats</h3>
    <div className="stat-row">
      <span className="label">Points Per Game:</span>
      <span className="value">28.5</span>
      <span className="rank">(3rd in NFL)</span>
    </div>
    {/* More stat rows */}
  </div>

  <div className="stats-section">
    <h3>Defensive Stats</h3>
    {/* Defense stats */}
  </div>

  <div className="stats-section">
    <h3>Betting Performance</h3>
    <div className="stat-row">
      <span className="label">ATS:</span>
      <span className="value">6-4 (60%)</span>
    </div>
    <div className="stat-row">
      <span className="label">O/U:</span>
      <span className="value">7-3 (70% over)</span>
    </div>
  </div>
</div>
```

---

### UI/UX Components (`/components/ui/`)

Using **Shadcn UI** for headless, customizable components:

1. **`Button.tsx`** - Standard button with variants (primary, secondary, ghost)
2. **`Card.tsx`** - Container with border, padding, shadow
3. **`Tabs.tsx`** - Tabbed interface (for FullGameDetails, TeamStatsCard)
4. **`Accordion.tsx`** - Collapsible sections (for BettingMetrics)
5. **`Badge.tsx`** - Status badges (FINAL, Q3, 2025-09-11)
6. **`Skeleton.tsx`** - Loading placeholders
7. **`Select.tsx`** - Dropdown (week selector)
8. **`Dialog.tsx`** - Modal (future: betting calculators)

---

## 📡 Data Fetching Strategy

### NextJS Server Components (RSC)

**Use for:**
- Initial page load (SSR for SEO)
- Static/semi-static data (team pages, historical games)
- Metadata generation (OpenGraph tags)

**Example:**
```typescript
// app/games/[gameId]/page.tsx
export default async function GameDetailPage({ params }) {
  // Server Component - fetches data on server
  const gameData = await fetch(
    `${process.env.API_URL}/api/games/${params.gameId}`,
    { next: { revalidate: 30 } } // ISR with 30s revalidation
  ).then(res => res.json());

  return (
    <>
      <Scorebug {...gameData.scorebug} />
      <QuickStats summaryData={gameData.summary} />
      {/* Client components will hydrate below */}
      <GameDetailClient initialData={gameData} />
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const game = await fetch(`${API_URL}/api/games/${params.gameId}`)
    .then(res => res.json());

  return {
    title: `${game.away_team} @ ${game.home_team} - NFL Game`,
    description: `Live scores and stats for ${game.away_team} at ${game.home_team}`,
  };
}
```

---

### NextJS Client Components

**Use for:**
- Live score updates (polling)
- User interactions (expanding sections, tab switching)
- State management (favorites, filters)

**Example:**
```typescript
// components/GameDetailClient.tsx
'use client';

import useSWR from 'swr';

export function GameDetailClient({ initialData }) {
  const { data, error, isLoading } = useSWR(
    `/api/games/${initialData.game_id}`,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: initialData.status === 'live' ? 30000 : 0, // 30s if live
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  if (error) return <ErrorState />;
  if (isLoading) return <Skeleton />;

  return (
    <>
      <BettingMetrics bettingData={data.betting} gameStatus={data.status} />
      <FullGameDetails summaryData={data.summary} awayTeam={data.away_team} homeTeam={data.home_team} />
    </>
  );
}
```

---

### SWR Configuration

**Global config** (`lib/swr-config.ts`):
```typescript
export const swrConfig = {
  refreshInterval: 0, // Default: no auto-refresh (override per component)
  dedupingInterval: 10000, // 10s - dedupe requests within 10s window
  revalidateOnFocus: true, // Revalidate when window regains focus
  revalidateOnReconnect: true, // Revalidate on network reconnect
  shouldRetryOnError: true, // Retry on fetch errors
  errorRetryCount: 3, // Max 3 retries
  errorRetryInterval: 5000, // 5s between retries
  onError: (error, key) => {
    console.error(`SWR Error for ${key}:`, error);
    // Optional: Send to error tracking (Sentry, etc.)
  },
};

// Fetcher function
export const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('API request failed');
    return res.json();
  });
```

**Live game polling:**
```typescript
// components/LiveScoreboard.tsx
'use client';

export function LiveScoreboard({ initialData }) {
  const { data } = useSWR(
    `/api/scoreboard?week=${selectedWeek}`,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: 30000, // 30s for live scores
      dedupingInterval: 10000, // Dedupe within 10s
    }
  );

  const liveGames = data.games.filter(g => g.status === 'live');
  const upcomingGames = data.games.filter(g => g.status === 'upcoming');
  const completedGames = data.games.filter(g => g.status === 'completed');

  return (
    <Tabs defaultValue="live">
      <TabsList>
        <TabsTrigger value="live">Live ({liveGames.length})</TabsTrigger>
        <TabsTrigger value="upcoming">Upcoming ({upcomingGames.length})</TabsTrigger>
        <TabsTrigger value="completed">Completed ({completedGames.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="live">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveGames.map(game => (
            <Scorebug key={game.game_id} {...game} />
          ))}
        </div>
      </TabsContent>

      {/* Upcoming and Completed tabs */}
    </Tabs>
  );
}
```

---

### Caching Strategy

#### Client-Side (SWR)
- **Live games:** 30s cache, auto-refresh
- **Completed games:** 5min cache, revalidate on focus
- **Team stats:** 1hr cache, background revalidation
- **Betting metrics:** 5min cache

#### Server-Side (Redis)
- **Live game data:** 30s TTL (expires quickly, re-fetch from ESPN)
- **Completed game data:** 1hr TTL (static, can cache longer)
- **Team season stats:** 1hr TTL (changes infrequently)
- **Betting aggregations:** 5min TTL (recalculate periodically)

#### ISR (Incremental Static Regeneration)
- **Team pages:** Revalidate every 1hr
- **Historical game pages:** Revalidate every 24hr (static content)

---

## 🎨 Styling & Design System

### Framework: TailwindCSS + Shadcn UI

**Why TailwindCSS:**
- ✅ Utility-first CSS (fast prototyping)
- ✅ Excellent responsive design support
- ✅ Built-in dark mode support
- ✅ Highly customizable via `tailwind.config.js`
- ✅ Tree-shakeable (removes unused CSS)

**Why Shadcn UI:**
- ✅ Headless components (full control over styling)
- ✅ Copy-paste components (not a dependency, you own the code)
- ✅ Built with Radix UI primitives (accessibility)
- ✅ TailwindCSS compatible
- ✅ TypeScript first

---

### Color Scheme

**Base Colors** (Dark Mode Primary):
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Background colors
        background: '#0a0a0a',        // Main background
        surface: '#1a1a1a',           // Card backgrounds (matches prototype)
        border: '#30363d',            // Borders, dividers

        // Text colors
        foreground: '#ffffff',        // Primary text
        muted: '#cccccc',             // Secondary text (losing team)
        subtle: '#888888',            // Tertiary text (labels)

        // Status colors (from scorebug spec)
        completed: '#666666',         // FINAL badge
        live: '#ff4444',              // Live game badge
        upcoming: '#0066cc',          // Upcoming game badge

        // Betting result colors
        success: '#10b981',           // Covered ✅, Over hit ✅
        danger: '#ef4444',            // Lost ❌, Missed ❌
        warning: '#f59e0b',           // Pushed (neutral)

        // Accent colors
        primary: '#3b82f6',           // Primary CTA buttons
        secondary: '#8b5cf6',         // Secondary actions
      },
    },
  },
};
```

**Team Colors:**
- Import from existing `team_colors` dict (32 NFL teams + alternates)
- Used for border-left accent on Scorebug
- Used for winner gradient background: `rgba(team_color, 0.15)`

**Color Usage:**
- `background`: Page background
- `surface`: Card containers (Scorebug, FullGameDetails, TeamStatsCard)
- `border`: Card borders, dividers between teams
- `foreground`: Default text (white)
- `muted`: Losing team text (#cccccc)
- `completed/live/upcoming`: Status badges
- `success/danger/warning`: Betting results

---

### Typography

**Font Stack:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto'],
        mono: ['JetBrains Mono', 'monospace'],
        score: ['Arial Black', 'Arial', 'sans-serif'], // For big scores
      },
    },
  },
};
```

**Typography Scale:**
- **Headers (H1):** `text-4xl font-bold` (36px) - Page titles
- **Headers (H2):** `text-2xl font-semibold` (24px) - Section titles
- **Headers (H3):** `text-xl font-medium` (20px) - Subsection titles
- **Body:** `text-base` (16px) - Default text
- **Small:** `text-sm` (14px) - Labels, captions
- **Tiny:** `text-xs` (12px) - Status badges, footnotes
- **Scores:** `text-5xl font-bold font-score` (48px) - Big game scores

**Font Weights:**
- `font-normal` (400): Default text
- `font-medium` (500): Emphasis
- `font-semibold` (600): Headings
- `font-bold` (700): Scores, winners

---

### Responsive Design (Mobile-First)

**Breakpoints:**
```javascript
// tailwind.config.js (default breakpoints)
{
  screens: {
    'sm': '640px',   // Small tablets
    'md': '768px',   // Tablets
    'lg': '1024px',  // Laptops
    'xl': '1280px',  // Desktops
    '2xl': '1536px', // Large desktops
  }
}
```

**Responsive Patterns:**

1. **Scoreboard Grid:**
   ```tsx
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
     {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
   </div>
   ```

2. **Navigation:**
   ```tsx
   {/* Mobile: Hamburger menu, Desktop: Horizontal nav */}
   <nav className="flex flex-col md:flex-row gap-2 md:gap-6">
     <Link href="/">Scoreboard</Link>
     <Link href="/teams">Teams</Link>
     <Link href="/betting">Betting</Link>
   </nav>
   ```

3. **Scorebug Layout:**
   ```tsx
   {/* Mobile: Stack team rows vertically, Desktop: Side-by-side */}
   <div className="flex flex-col md:flex-row md:justify-between">
     <div className="team-info">{awayTeam}</div>
     <div className="score">{awayScore}</div>
   </div>
   ```

4. **Full Game Details:**
   ```tsx
   {/* Mobile: Tabs scroll horizontally, Desktop: Normal tabs */}
   <Tabs className="w-full overflow-x-auto md:overflow-x-visible">
     <TabsList>
       <TabsTrigger>Team A</TabsTrigger>
       <TabsTrigger>Team B</TabsTrigger>
       <TabsTrigger>Scoring</TabsTrigger>
     </TabsList>
   </Tabs>
   ```

---

### Component Styling Examples

#### Scorebug Component
```tsx
// components/Scorebug.tsx
export function Scorebug({ awayTeam, homeTeam, awayScore, homeScore, statusText, statusColor, gameTime }) {
  const isCompleted = statusColor === '#666666';
  const isLive = statusColor === '#ff4444';
  const isUpcoming = statusColor === '#0066cc';

  // Determine winner
  const awayWinner = isCompleted && awayScore > homeScore;
  const homeWinner = isCompleted && homeScore > awayScore;

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      {/* Status Badge */}
      <div
        className="text-xs font-bold text-white text-center py-1 px-3 rounded mb-3"
        style={{ backgroundColor: statusColor }}
      >
        {statusText} {gameTime && `• ${gameTime}`}
      </div>

      {/* Away Team Row */}
      <div
        className={cn(
          "flex justify-between items-center py-2 px-2 border-b border-border",
          awayWinner && "font-bold text-foreground",
          !awayWinner && "text-muted"
        )}
        style={{
          borderLeft: `5px solid ${getTeamColor(awayTeam)}`,
          background: awayWinner
            ? `linear-gradient(90deg, ${hexToRgba(getTeamColor(awayTeam), 0.15)} 0%, transparent 100%)`
            : 'transparent',
        }}
      >
        <span className="text-lg">{awayTeam}</span>
        <span className="text-4xl font-score">{awayScore}</span>
      </div>

      {/* Home Team Row */}
      <div
        className={cn(
          "flex justify-between items-center py-2 px-2",
          homeWinner && "font-bold text-foreground",
          !homeWinner && "text-muted"
        )}
        style={{
          borderLeft: `5px solid ${getTeamColor(homeTeam)}`,
          background: homeWinner
            ? `linear-gradient(90deg, ${hexToRgba(getTeamColor(homeTeam), 0.15)} 0%, transparent 100%)`
            : 'transparent',
        }}
      >
        <span className="text-lg">{homeTeam}</span>
        <span className="text-4xl font-score">{homeScore}</span>
      </div>

      {/* Betting Lines (if upcoming) */}
      {isUpcoming && bettingData && (
        <div className="mt-4 pt-4 border-t border-border text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Spread:</span>
            <span>{bettingData.spread_line}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Total:</span>
            <span>{bettingData.total_line}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🔌 Backend API Design (FastAPI)

From `nextjs-project-migration.md`, these **11 FastAPI endpoints** are planned:

### 1. Scoreboard Endpoint

**GET `/api/scoreboard?week={week}&season={2025}`**

**Purpose:** Fetch all games for a specific week

**Query Parameters:**
- `week` (int, required): Week number (1-18 regular, 19-22 playoffs)
- `season` (int, required): Season year (2025)

**Response Schema:**
```json
{
  "week": 5,
  "season": 2025,
  "games": [
    {
      "game_id": "401547417",
      "away_team": "KC",
      "home_team": "BUF",
      "away_score": 28,
      "home_score": 24,
      "status": "completed",
      "status_text": "FINAL",
      "status_color": "#666666",
      "game_time": "8:45 PM ET",
      "betting": {
        "spread_line": "KC -3.5",
        "total_line": "51.5",
        "away_ml": "-165",
        "home_ml": "+145"
      },
      "game_info": {
        "stadium": "Highmark Stadium",
        "roof": "outdoor",
        "temp": "45°F",
        "wind": "8mph NE"
      }
    },
    // ... more games
  ]
}
```

**Data Sources:**
- `schedules_2025.parquet` (betting lines, game info)
- ESPN API `/scoreboard` (live scores, status)

**Caching:**
- Redis: 30s TTL for live games, 5min for completed

**FastAPI Implementation:**
```python
from fastapi import APIRouter, Query
from datetime import datetime

router = APIRouter()

@router.get("/api/scoreboard")
async def get_scoreboard(
    week: int = Query(..., ge=1, le=22),
    season: int = Query(2025)
):
    # Check Redis cache
    cache_key = f"scoreboard:{season}:week:{week}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    # Load from Parquet
    schedules = load_schedules_parquet(season)
    games_this_week = schedules.filter(pl.col("week") == week)

    # Fetch live scores from ESPN API
    espn_data = await fetch_espn_scoreboard()

    # Merge data
    games = merge_schedule_with_live_data(games_this_week, espn_data)

    response = {
        "week": week,
        "season": season,
        "games": games
    }

    # Cache for 30s (live) or 5min (all completed)
    ttl = 30 if any(g["status"] == "live" for g in games) else 300
    await redis.setex(cache_key, ttl, json.dumps(response))

    return response
```

---

### 2. Game Detail Endpoint

**GET `/api/games/{game_id}`**

**Purpose:** Fetch comprehensive game data for detail page

**Path Parameters:**
- `game_id` (str): ESPN game ID (e.g., "401547417")

**Response Schema:**
```json
{
  "game_id": "401547417",
  "away_team": "KC",
  "home_team": "BUF",
  "away_score": 28,
  "home_score": 24,
  "status": "completed",
  "status_text": "FINAL",
  "status_color": "#666666",
  "game_time": "8:45 PM ET",
  "scorebug": {
    "away_team": "KC",
    "home_team": "BUF",
    "away_score": 28,
    "home_score": 24,
    "status_text": "FINAL",
    "status_color": "#666666",
    "game_time": "8:45 PM ET"
  },
  "betting": {
    "spread_line": "KC -3.5",
    "closing_spread": "KC -3.0",
    "spread_result": "covered",
    "total_line": "51.5",
    "closing_total": "52.0",
    "total_result": "over",
    "away_moneyline": "-165",
    "home_moneyline": "+145",
    "away_ats_record": "6-4 (60%)",
    "home_ats_record": "5-5 (50%)"
  },
  "summary": {
    "boxscore": {
      "players": [
        {
          "team": {"abbreviation": "KC"},
          "statistics": [
            {
              "name": "passing",
              "labels": ["C/ATT", "YDS", "AVG", "TD", "INT"],
              "athletes": [
                {
                  "athlete": {
                    "displayName": "Patrick Mahomes",
                    "links": [{"href": "https://espn.com/player/123"}]
                  },
                  "stats": ["25/35", "312", "8.9", "3", "0"]
                }
              ]
            }
          ]
        }
      ]
    },
    "drives": {
      "previous": [
        {
          "team": {"abbreviation": "KC"},
          "description": "14 plays, 75 yards, 6:32",
          "result": "Touchdown",
          "start": {"text": "Own 25"},
          "end": {"text": "Opp 0"}
        }
      ]
    },
    "scoringPlays": [
      {
        "team": {"abbreviation": "KC"},
        "period": {"number": 2},
        "clock": {"displayValue": "5:32"},
        "scoreValue": 7,
        "awayScore": 14,
        "homeScore": 10,
        "probability": {
          "awayWinPercentage": 65.2,
          "homeWinPercentage": 34.8
        },
        "text": "Patrick Mahomes 12 yd pass to Travis Kelce (Harrison Butker kick)"
      }
    ]
  }
}
```

**Data Sources:**
- ESPN API `/summary?event={game_id}` (box scores, drives, scoring plays)
- `schedules_2025.parquet` (betting lines)
- `play_by_play_2025.parquet` (EPA calculations, if needed)

**Caching:**
- Redis: 30s TTL for live, 1hr for completed

---

### 3. Teams List Endpoint

**GET `/api/teams`**

**Purpose:** Fetch all 32 NFL teams metadata

**Response Schema:**
```json
{
  "teams": [
    {
      "team_id": "KC",
      "team_name": "Kansas City Chiefs",
      "abbreviation": "KC",
      "conference": "AFC",
      "division": "West",
      "color": "e31837",
      "logo_url": "https://a.espncdn.com/i/teamlogos/nfl/500/kc.png"
    },
    // ... 31 more teams
  ]
}
```

**Data Sources:**
- `teams.parquet` (from nflreadpy)
- Static JSON file

**Caching:**
- Redis: 24hr TTL (rarely changes)

---

### 4. Team Detail Endpoint

**GET `/api/teams/{team_id}`**

**Purpose:** Fetch team season stats, betting performance, schedule

**Path Parameters:**
- `team_id` (str): Team abbreviation (e.g., "KC")

**Response Schema:**
```json
{
  "team_id": "KC",
  "team_name": "Kansas City Chiefs",
  "record": "8-2",
  "division": "AFC West",
  "division_rank": 1,
  "stats": {
    "offensive": {
      "ppg": 28.5,
      "ppg_rank": 3,
      "total_ypg": 365.2,
      "total_ypg_rank": 7,
      "pass_ypg": 268.5,
      "pass_ypg_rank": 5,
      "rush_ypg": 96.7,
      "rush_ypg_rank": 18,
      "turnovers": 8
    },
    "defensive": {
      "points_allowed_pg": 19.8,
      "pa_rank": 8,
      "total_ya_pg": 325.4,
      "ya_rank": 10,
      "pass_ya_pg": 215.6,
      "rush_ya_pg": 109.8,
      "takeaways": 12
    },
    "epa": {
      "pass_epa_offense": 0.18,
      "rush_epa_offense": 0.02,
      "pass_epa_defense": -0.08,
      "rush_epa_defense": -0.05,
      "success_rate": 48.5
    },
    "betting": {
      "ats_record": "6-4 (60%)",
      "ou_record": "7-3 (70%)",
      "home_ats": "3-2 (60%)",
      "away_ats": "3-2 (60%)",
      "division_ats": "2-1 (67%)",
      "as_favorite_ats": "5-3",
      "as_underdog_ats": "1-1"
    }
  },
  "schedule": {
    "past_games": [
      {
        "week": 1,
        "opponent": "DET",
        "result": "W",
        "score": "27-20",
        "spread_result": "covered",
        "total_result": "under"
      }
    ],
    "upcoming_games": [
      {
        "week": 11,
        "opponent": "BUF",
        "date": "2025-11-17",
        "time": "8:20 PM ET",
        "spread_line": "KC -3.5",
        "total_line": "51.5"
      }
    ]
  },
  "power_rating": {
    "current_elo": 1612,
    "elo_rank": 3,
    "elo_history": [
      {"week": 1, "elo": 1580},
      {"week": 2, "elo": 1595},
      // ... all weeks
    ]
  }
}
```

**Data Sources:**
- `team_data_{TEAM}_2025.json` (from `fetch_team_data.py`)
- `schedules_2025.parquet`
- `play_by_play_2025.parquet` (EPA)
- `elo_ratings_historical.csv` (from nflscraPy)

**Caching:**
- Redis: 1hr TTL

---

### 5. Team Schedule Endpoint

**GET `/api/teams/{team_id}/schedule`**

**Purpose:** Fetch team's full schedule with betting lines

**Path Parameters:**
- `team_id` (str): Team abbreviation

**Query Parameters:**
- `season` (int, default: 2025): Season year

**Response Schema:**
```json
{
  "team_id": "KC",
  "season": 2025,
  "games": [
    {
      "week": 1,
      "game_id": "401547400",
      "opponent": "DET",
      "home_away": "home",
      "date": "2025-09-07",
      "time": "8:20 PM ET",
      "result": "W",
      "score": "27-20",
      "spread_line": "KC -3.5",
      "spread_result": "covered",
      "total_line": "52.5",
      "total_result": "under"
    },
    // ... all 17 regular season games
  ]
}
```

**Data Sources:**
- `schedules_2025.parquet`

---

### 6. Betting Metrics Endpoint

**GET `/api/betting/metrics?week={week}&season={2025}`**

**Purpose:** Aggregated betting insights for betting dashboard

**Query Parameters:**
- `week` (int, required): Week number
- `season` (int, required): Season year

**Response Schema:**
```json
{
  "week": 5,
  "season": 2025,
  "overview": {
    "best_ats": [
      {"team": "KC", "record": "6-4", "percentage": 60},
      {"team": "BUF", "record": "7-3", "percentage": 70}
    ],
    "worst_ats": [
      {"team": "NYJ", "record": "3-7", "percentage": 30}
    ],
    "over_trends": [
      {"team": "MIA", "record": "8-2", "percentage": 80}
    ],
    "under_trends": [
      {"team": "NE", "record": "2-8", "percentage": 20}
    ]
  },
  "value_plays": {
    "line_movement": [
      {
        "game_id": "401547420",
        "matchup": "BUF @ MIA",
        "spread_open": "MIA -3.5",
        "spread_current": "MIA -6.0",
        "movement": 2.5,
        "analysis": "Sharp money on MIA (public on BUF)"
      }
    ],
    "weather_impact": [
      {
        "game_id": "401547421",
        "matchup": "CHI @ GB",
        "stadium": "Lambeau Field",
        "temp": "32°F",
        "wind": "22mph NW",
        "precipitation": "Rain 60%",
        "impact": "High - consider UNDER 42.5"
      }
    ],
    "rest_advantage": [
      {
        "game_id": "401547417",
        "matchup": "KC vs BUF",
        "advantage_team": "KC",
        "reason": "KC off bye, BUF standard week",
        "impact": "+2% win probability"
      }
    ],
    "injury_impact": [
      {
        "game_id": "401547417",
        "team": "BUF",
        "player": "Gabe Davis",
        "position": "WR2",
        "status": "OUT",
        "impact": "BUF passing attack -5% efficiency"
      }
    ]
  },
  "historical_trends": {
    "division_games": [
      {
        "matchup": "KC @ LV",
        "division": "AFC West",
        "ats_trend": "45-55 ATS (tight spreads)"
      }
    ],
    "prime_time": [
      {
        "game_id": "401547420",
        "matchup": "BUF @ MIA",
        "time_slot": "Sunday Night Football",
        "trend": "SNF totals go UNDER 55% of the time"
      }
    ],
    "situational": [
      {
        "game_id": "401547420",
        "matchup": "BUF @ MIA",
        "spot": "Revenge game (MIA won Week 2)",
        "trend": "BUF motivated, favors underdog"
      }
    ]
  }
}
```

**Data Sources:**
- `betting_metrics_index.json`
- `2025_season_metrics.json`
- `schedules_2025.parquet`
- OpenWeatherMap API (weather)
- `injuries_2025.parquet`

**Caching:**
- Redis: 5min TTL

---

### 7. Betting Lines Endpoint

**GET `/api/betting/lines?game_id={game_id}`**

**Purpose:** Current betting lines for a specific game (if The Odds API integrated)

**Query Parameters:**
- `game_id` (str, required): ESPN game ID

**Response Schema:**
```json
{
  "game_id": "401547417",
  "matchup": "KC @ BUF",
  "lines": [
    {
      "bookmaker": "DraftKings",
      "spread": {
        "away": "KC -3.5 (-110)",
        "home": "BUF +3.5 (-110)"
      },
      "total": {
        "over": "51.5 (-110)",
        "under": "51.5 (-110)"
      },
      "moneyline": {
        "away": "-165",
        "home": "+145"
      }
    },
    {
      "bookmaker": "FanDuel",
      "spread": {
        "away": "KC -3.0 (-108)",
        "home": "BUF +3.0 (-112)"
      },
      // ... more sportsbooks
    }
  ],
  "consensus": {
    "spread": "KC -3.5",
    "total": "51.5",
    "moneyline": {
      "away": "-165",
      "home": "+145"
    }
  }
}
```

**Data Sources:**
- The Odds API (optional, $99/mo)
- Fallback: `schedules_2025.parquet` (static lines)

**Caching:**
- Redis: 1min TTL for live odds, 5min for upcoming

---

### 8. Player Detail Endpoint

**GET `/api/players/{player_id}`**

**Purpose:** Player profile and season stats

**Path Parameters:**
- `player_id` (str): ESPN player ID

**Response Schema:**
```json
{
  "player_id": "3139477",
  "name": "Patrick Mahomes",
  "position": "QB",
  "team": "KC",
  "jersey_number": 15,
  "stats": {
    "passing": {
      "games": 10,
      "completions": 250,
      "attempts": 350,
      "completion_pct": 71.4,
      "yards": 3120,
      "yards_per_attempt": 8.9,
      "touchdowns": 30,
      "interceptions": 5,
      "qbr": 68.5,
      "rating": 105.2
    }
  },
  "game_log": [
    {
      "week": 10,
      "opponent": "BUF",
      "result": "W 28-24",
      "stats": {
        "completions": 25,
        "attempts": 35,
        "yards": 312,
        "touchdowns": 3,
        "interceptions": 0
      }
    }
  ]
}
```

**Data Sources:**
- ESPN API `/player/{player_id}`
- `player_stats_2025.parquet`

---

### 9. Player Game Log Endpoint

**GET `/api/players/{player_id}/game-log?season={2025}`**

**Purpose:** Player game-by-game stats

**Response Schema:**
```json
{
  "player_id": "3139477",
  "name": "Patrick Mahomes",
  "season": 2025,
  "game_log": [
    {
      "week": 1,
      "opponent": "DET",
      "result": "W 27-20",
      "stats": {
        "completions": 22,
        "attempts": 30,
        "yards": 280,
        "touchdowns": 2,
        "interceptions": 0
      }
    },
    // ... all games
  ]
}
```

**Data Sources:**
- `player_stats_2025.parquet`

---

### 10. Health Check Endpoint

**GET `/api/health`**

**Purpose:** Backend health status

**Response Schema:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T15:30:00Z",
  "services": {
    "redis": "connected",
    "parquet_storage": "accessible",
    "espn_api": "reachable"
  }
}
```

---

### 11. Data Index Endpoint

**GET `/api/data-index`**

**Purpose:** Available data coverage summary

**Response Schema:**
```json
{
  "season": 2025,
  "coverage": {
    "schedules": {
      "weeks_available": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "games_count": 160,
      "betting_lines_available": true
    },
    "play_by_play": {
      "weeks_available": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "plays_count": 45680
    },
    "player_stats": {
      "weeks_available": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "players_count": 2200
    },
    "injuries": {
      "weeks_available": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "reports_count": 340
    }
  },
  "last_updated": "2025-10-16T12:00:00Z"
}
```

**Data Sources:**
- `betting_metrics_index.json`
- All Parquet files metadata

---

## 🗂️ State Management

### Global State (Zustand)

**Use for:**
- User preferences (favorites, filters)
- UI state (sidebar open/closed, dark mode)
- Current week selection (persists across pages)

**Store Structure:**
```typescript
// stores/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Week selection
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;

  // User favorites
  favoriteTeams: string[];
  addFavoriteTeam: (teamId: string) => void;
  removeFavoriteTeam: (teamId: string) => void;

  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  // Betting line alerts
  lineAlerts: Array<{
    gameId: string;
    type: 'spread' | 'total';
    threshold: number;
  }>;
  addLineAlert: (alert: LineAlert) => void;
  removeLineAlert: (gameId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      selectedWeek: getCurrentWeek(),
      favoriteTeams: [],
      theme: 'dark',
      lineAlerts: [],

      // Actions
      setSelectedWeek: (week) => set({ selectedWeek: week }),
      addFavoriteTeam: (teamId) =>
        set((state) => ({
          favoriteTeams: [...state.favoriteTeams, teamId],
        })),
      removeFavoriteTeam: (teamId) =>
        set((state) => ({
          favoriteTeams: state.favoriteTeams.filter((t) => t !== teamId),
        })),
      setTheme: (theme) => set({ theme }),
      addLineAlert: (alert) =>
        set((state) => ({
          lineAlerts: [...state.lineAlerts, alert],
        })),
      removeLineAlert: (gameId) =>
        set((state) => ({
          lineAlerts: state.lineAlerts.filter((a) => a.gameId !== gameId),
        })),
    }),
    {
      name: 'nfl-app-storage', // LocalStorage key
      partialize: (state) => ({
        // Only persist these fields
        favoriteTeams: state.favoriteTeams,
        theme: state.theme,
        lineAlerts: state.lineAlerts,
      }),
    }
  )
);

// Helper: Get current NFL week based on date
function getCurrentWeek(): number {
  const now = new Date();
  const seasonStart = new Date('2025-09-04'); // Week 1 start
  const diffTime = now.getTime() - seasonStart.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const week = Math.ceil(diffDays / 7);
  return Math.max(1, Math.min(week, 18)); // Clamp to 1-18
}
```

**Usage Example:**
```tsx
// components/WeekSelector.tsx
'use client';

import { useAppStore } from '@/stores/useAppStore';

export function WeekSelector() {
  const { selectedWeek, setSelectedWeek } = useAppStore();

  return (
    <Select value={selectedWeek.toString()} onValueChange={(val) => setSelectedWeek(parseInt(val))}>
      <SelectTrigger>
        <SelectValue>Week {selectedWeek}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => (
          <SelectItem key={week} value={week.toString()}>
            Week {week}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

---

### Server State (SWR)

**Use for:**
- API data fetching and caching
- Automatic revalidation
- Error handling and retries

**Already covered in Data Fetching Strategy section above.**

---

## 🚀 Deployment Architecture

### Frontend: Vercel

**Why Vercel:**
- ✅ Built by Next.js creators (best Next.js support)
- ✅ Zero-config deployment (connect GitHub repo)
- ✅ Automatic HTTPS, CDN, edge functions
- ✅ ISR and SSR work out-of-the-box
- ✅ Free tier: 100GB bandwidth, unlimited requests

**Deployment Process:**
1. Connect GitHub repo to Vercel
2. Set environment variables:
   - `API_URL` (backend API base URL)
3. Deploy: `vercel --prod`
4. Automatic deployments on `git push` to `main`

**Environment Variables:**
```bash
# .env.production
API_URL=https://nfl-api.railway.app
NEXT_PUBLIC_API_URL=https://nfl-api.railway.app
```

---

### Backend: Railway or Fly.io

**Option A: Railway (RECOMMENDED)**

**Why Railway:**
- ✅ Zero-config Python deployment (Dockerfile or `railway up`)
- ✅ Built-in Redis addon (1-click install)
- ✅ S3-compatible storage for Parquet files
- ✅ Automatic HTTPS
- ✅ Free tier: 500hr/mo ($5 credit)
- ✅ Hobby plan: $5/mo (unlimited hours)

**Deployment Process:**
1. Create `railway.toml`:
   ```toml
   [build]
   builder = "nixpacks"

   [deploy]
   startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"
   ```
2. Connect GitHub repo
3. Add Redis addon
4. Add environment variables:
   - `REDIS_URL` (auto-set by addon)
   - `ODDS_API_KEY` (optional)
   - `WEATHER_API_KEY` (optional)
5. Deploy: `railway up`

**Cost Estimate:**
- Free tier: $5 credit/mo (500 execution hours) = $0
- Hobby: $5/mo (unlimited hours) + $5/mo (Redis) = $10/mo
- Pro: $20/mo (more resources) + $10/mo (Redis) = $30/mo

---

**Option B: Fly.io**

**Why Fly.io:**
- ✅ Global edge deployment (lower latency)
- ✅ Persistent volumes for Parquet files (cheaper than S3)
- ✅ Built-in Redis addon
- ✅ Docker-based (full control)
- ✅ Free tier: 3 shared-CPU VMs, 3GB storage

**Deployment Process:**
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Create `fly.toml`:
   ```toml
   app = "nfl-betting-api"

   [build]
     dockerfile = "Dockerfile"

   [[services]]
     internal_port = 8000
     protocol = "tcp"

     [[services.ports]]
       handlers = ["http"]
       port = 80

     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443

   [mounts]
     source = "nfl_data"
     destination = "/data"
   ```
3. Create persistent volume: `flyctl volumes create nfl_data --size 10`
4. Add Redis: `flyctl redis create`
5. Deploy: `flyctl deploy`

**Cost Estimate:**
- Free tier: 3 VMs (2GB total) + 3GB storage = $0
- Paid: $10/mo (1 dedicated CPU) + $1/GB storage = $11-15/mo

---

### Data Storage

**Option A: Railway S3 (Recommended for Railway deployment)**
- S3-compatible storage
- Parquet files uploaded during deployment
- Accessed via `boto3` in Python

**Option B: Fly.io Persistent Volumes (Recommended for Fly.io deployment)**
- Persistent disk attached to VM
- Parquet files stored directly on volume
- Faster access (local disk vs network)

**Option C: External S3 (AWS, Cloudflare R2)**
- Use if multi-region deployment needed
- Cloudflare R2: Free egress (no bandwidth fees)

---

### Scheduled Jobs (Daily Data Updates)

**Railway Cron Jobs:**
```yaml
# railway.yaml
cron:
  - name: "Daily Data Update"
    schedule: "0 12 * * *"  # Every day at noon UTC
    command: "python scripts/daily_update.py"
```

**Fly.io Cron (via GitHub Actions):**
```yaml
# .github/workflows/daily-update.yml
name: Daily Data Update
on:
  schedule:
    - cron: '0 12 * * *'  # Every day at noon UTC
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger update
        run: |
          curl -X POST https://nfl-api.fly.dev/api/jobs/daily-update \
            -H "Authorization: Bearer ${{ secrets.CRON_TOKEN }}"
```

---

## 🛣️ Migration Path (10 Weeks)

### Phase 1: Core NextJS Setup (Week 1-2)

**Tasks:**
1. ✅ Create Next.js 14 project with App Router
   ```bash
   npx create-next-app@latest nfl-betting-app --typescript --tailwind --app
   ```
2. ✅ Set up TailwindCSS + Shadcn UI
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button card tabs accordion badge skeleton select
   ```
3. ✅ Port `Scorebug` component from Python to TypeScript React
   - Read `scorebug-info.json` spec
   - Create `components/Scorebug.tsx`
   - Implement 3 status modes (Completed, Live, Upcoming)
   - Add winner highlighting logic
   - Test with mock data
4. ✅ Create basic scoreboard page with mock data
   - `app/page.tsx` (home page)
   - Load mock games JSON
   - Render grid of Scorebugs
   - Add week selector

**Deliverable:** Working scoreboard page with static mock data

---

### Phase 2: FastAPI Backend (Week 3-4)

**Tasks:**
1. ✅ Set up FastAPI project structure
   ```
   backend/
   ├── main.py              # FastAPI app
   ├── routers/
   │   ├── scoreboard.py    # /api/scoreboard
   │   ├── games.py         # /api/games/{id}
   │   ├── teams.py         # /api/teams
   │   └── betting.py       # /api/betting
   ├── services/
   │   ├── espn.py          # ESPN API client
   │   ├── parquet.py       # Parquet data loader
   │   └── redis.py         # Redis cache client
   ├── models/
   │   ├── game.py          # Pydantic models
   │   └── team.py
   └── requirements.txt
   ```
2. ✅ Implement `/api/scoreboard` endpoint
   - Load `schedules_2025.parquet`
   - Fetch live scores from ESPN API
   - Merge and return JSON
3. ✅ Implement `/api/games/{gameId}` endpoint
   - ESPN API `/summary?event={id}`
   - Parse box scores, drives, scoring plays
   - Merge with betting data from Parquet
4. ✅ Deploy backend to Railway/Fly.io
   - Set up Redis addon
   - Upload Parquet files to storage
   - Configure environment variables
5. ✅ Connect Next.js to real backend
   - Update API URLs
   - Test live data flow

**Deliverable:** Working FastAPI backend with scoreboard + game detail endpoints

---

### Phase 3: Component Porting (Week 5-6)

**Tasks:**
1. ✅ Port `FullGameDetails` component to TypeScript
   - Read `full-game-details-info.json` spec
   - Create `components/FullGameDetails.tsx`
   - Implement 3-tab interface (Team A | Team B | Scoring)
   - Parse box scores, drives, scoring plays
   - Test with real ESPN data
2. ✅ Port `QuickStats` component to TypeScript
   - Create `components/QuickStats.tsx`
   - Extract top performers (passing, rushing, receiving)
   - Display with icons
3. ✅ Create `BettingMetrics` component (new)
   - Create `components/BettingMetrics.tsx`
   - Implement spread/total/moneyline analysis
   - Add key factors (weather, injuries, rest)
   - Test with betting data
4. ✅ Implement game detail page
   - `app/games/[gameId]/page.tsx`
   - Server Component: fetch initial data
   - Client Component: live polling (if live game)
   - Combine all components (Scorebug, QuickStats, BettingMetrics, FullGameDetails)

**Deliverable:** Complete game detail page with all stats and betting analysis

---

### Phase 4: Team & Betting Pages (Week 7-8)

**Tasks:**
1. ✅ Create team page with season stats
   - `app/teams/[teamId]/page.tsx`
   - Implement tabs (Overview, EPA, Betting, Schedule, Power Ratings)
   - Fetch from `/api/teams/{teamId}`
   - Display team stats with rankings
   - Show ATS/O-U records
2. ✅ Create betting dashboard with aggregated metrics
   - `app/betting/page.tsx`
   - Fetch from `/api/betting/metrics?week={week}`
   - Display best/worst ATS teams
   - Show value plays (line movement, weather, rest, injuries)
   - Historical trends (division, prime time, situational)
3. ✅ Implement player pages (optional MVP stretch)
   - `app/players/[playerId]/page.tsx`
   - Fetch from `/api/players/{playerId}`
   - Display season stats, game log

**Deliverable:** Team pages and betting dashboard functional

---

### Phase 5: Polish & Deploy (Week 9-10)

**Tasks:**
1. ✅ Add loading states, error handling
   - Skeleton components while loading
   - Error boundaries for failed fetches
   - Retry logic for API errors
2. ✅ Implement live score polling (SWR)
   - Auto-refresh every 30s for live games
   - Visual indicator ("Updated 5s ago")
   - Pause polling when tab not visible (battery optimization)
3. ✅ Add weather widget (OpenWeatherMap API)
   - Create `components/WeatherWidget.tsx`
   - Integrate OpenWeatherMap API
   - Display in game detail page (if outdoor stadium)
4. ✅ SEO optimization
   - Generate metadata for all pages (title, description, OG tags)
   - Create sitemap.xml
   - Add robots.txt
5. ✅ Production deployment
   - Deploy frontend to Vercel (production)
   - Deploy backend to Railway/Fly.io (production)
   - Test end-to-end with real data
   - Monitor for errors (Sentry, LogRocket)

**Deliverable:** Production-ready NFL betting platform live at custom domain

---

## ❓ Key Decision Points

### 1. Frontend Framework Preference

**Question:** Are you committed to Next.js, or open to alternatives?

**Options:**
- ✅ **Next.js (App Router) with FastAPI backend** (RECOMMENDED)
  - Best for: SEO, SSR/ISR, large-scale apps
  - Timeline: 10 weeks
- ❌ **Full TypeScript migration** (port all Python to Node.js)
  - Best for: JavaScript-only teams
  - Timeline: 16 weeks (6 weeks longer)
- 🤔 **Remix** (alternative to Next.js)
  - Best for: Nested routing, form-heavy apps
  - Timeline: 12 weeks (learning curve)
- 🤔 **SvelteKit** (alternative frontend)
  - Best for: Smaller bundle sizes, simpler syntax
  - Timeline: 12 weeks (less ecosystem maturity)

**Recommendation:** Next.js App Router + FastAPI (Option 1)

---

### 2. Deployment Budget

**Question:** What's your monthly hosting budget?

**Tiers:**

**Free Tier ($0/mo):**
- Frontend: Vercel Free (100GB bandwidth/mo)
- Backend: Railway Free ($5 credit = 500hr/mo) or Fly.io Free (3 VMs)
- Redis: Railway Free (25MB) or Fly.io Free (256MB)
- **Limitations:**
  - Backend sleeps after 1hr inactivity (500hr/mo limit)
  - Limited Redis memory (25-256MB)
  - No custom domain (use .railway.app or .fly.dev)
- **Good for:** MVP testing, personal projects

**Low Cost ($15-30/mo):**
- Frontend: Vercel Hobby ($20/mo) - custom domain, analytics
- Backend: Railway Hobby ($5/mo unlimited hours) + Redis ($5/mo)
- Total: ~$30/mo
- **Benefits:**
  - Always-on backend (no sleep)
  - Larger Redis (1GB)
  - Custom domain
- **Good for:** Side projects, small user base (<1000 users)

**Production ($50-100/mo):**
- Frontend: Vercel Pro ($20/mo)
- Backend: Railway Pro ($20/mo) + Redis Pro ($10/mo)
- Odds API: The Odds API ($99/mo) (optional for live odds)
- Weather API: OpenWeatherMap ($40/mo) (optional for forecasts)
- Total: ~$50-170/mo (depending on optional APIs)
- **Benefits:**
  - High performance
  - Advanced caching
  - Live betting odds
  - Weather forecasts
- **Good for:** Production app, monetization plans

**Recommendation:** Start with Free tier for MVP, upgrade to Low Cost ($30/mo) when launching to users.

---

### 3. MVP Scope

**Question:** What features are must-have for initial launch?

**Must-Have (Core MVP):**
- ✅ Scoreboard page (all games for week)
- ✅ Game detail page (scores, stats, betting lines)
- ✅ Team pages (season stats, ATS records)
- ✅ Basic betting metrics (spread/total/ML)

**Nice-to-Have (Post-MVP):**
- 🟡 Betting dashboard (aggregated insights)
- 🟡 Player pages (player stats, game logs)
- 🟡 Weather widget (game-day forecasts)
- 🟡 Live odds (The Odds API integration)
- 🟡 User accounts (save favorites, alerts)

**Future (V2):**
- 🔵 Historical data (2019-2024 seasons)
- 🔵 Advanced analytics (win probability charts, EPA visualizations)
- 🔵 Betting calculators (parlay, arbitrage)
- 🔵 Community features (forums, predictions)
- 🔵 Mobile app (React Native)

**Recommendation:** Launch with Must-Have features (4-6 weeks), iterate with Nice-to-Have based on user feedback.

---

### 4. Design Preferences

**Question:** What visual style do you prefer?

**Options:**

**A. Minimalist (ESPN-style)**
- Clean, white space
- Focus on data readability
- Minimal colors, gradients
- Fast loading
- **Examples:** ESPN, Yahoo Sports

**B. Rich (DraftKings-style)**
- Bold colors, animations
- Flashy UI elements
- Heavy use of team colors
- Premium feel
- **Examples:** DraftKings, FanDuel

**C. Dark (Existing Prototype)**
- Dark mode primary (#1a1a1a background)
- Team color accents
- Card-based layout
- Existing scorecard design
- **Examples:** Current Streamlit app

**Recommendation:** Option C (Dark theme) - Matches existing prototype, modern aesthetic, reduces eye strain for long sessions.

---

### 5. Live Data Priority

**Question:** How important is real-time live score updates?

**Options:**

**A. Real-Time (30s polling)**
- Live games update every 30 seconds
- Visual indicator ("Live • Updated 5s ago")
- SWR auto-refresh
- **Cost:** Higher server load, more API calls
- **Use case:** Users actively watching games, live betting

**B. Near Real-Time (2min polling)**
- Live games update every 2 minutes
- Manual refresh button
- **Cost:** Lower server load
- **Use case:** Casual checking during games

**C. Static (Manual refresh only)**
- User must refresh browser to update
- No auto-polling
- **Cost:** Minimal server load
- **Use case:** Completed games only, no live betting

**Recommendation:** Option A (Real-Time 30s polling) for live games, static for completed games. Aligns with ESPN API 30s update rate.

---

## 🎯 Next Steps - Choose Your Path

Now that we've brainstormed the full architecture, here are **4 actionable options** for immediate next steps:

### Option 1: Create Detailed Implementation Plan for Phase 1
**What:** Break down Phase 1 (NextJS setup) into day-by-day tasks with code samples

**Includes:**
- Next.js project setup commands
- TailwindCSS + Shadcn UI configuration
- Scorebug component implementation (TypeScript + React)
- Mock data structure
- Basic scoreboard page layout

**Timeline:** 1-2 days to document, 1-2 weeks to implement

---

### Option 2: Generate FastAPI Backend Structure
**What:** Create complete FastAPI backend file structure with endpoint stubs

**Includes:**
- `main.py` with all 11 routers
- Pydantic models for all endpoints
- Parquet data loader (Polars)
- ESPN API client
- Redis caching layer
- Docker setup for deployment

**Timeline:** 2-3 days to generate, 2-3 weeks to implement

---

### Option 3: Port Scorebug Component to TypeScript React
**What:** Convert existing `scorebug-info.json` spec into working React component

**Includes:**
- `components/Scorebug.tsx` with full implementation
- 3 status modes (Completed, Live, Upcoming)
- Winner highlighting with team colors
- Betting lines display (if upcoming)
- Styled with TailwindCSS
- Storybook stories for testing

**Timeline:** 1 day to port, test with mock data

---

### Option 4: Design Database/Caching Layer
**What:** Create comprehensive Redis caching strategy + Parquet data access layer

**Includes:**
- Redis cache key structure
- TTL policies per data type
- Parquet file organization
- Data loading patterns (Polars)
- Background job scheduling (daily updates)

**Timeline:** 1-2 days to design, implement alongside backend

---

## 📝 Summary

**Recommended Architecture:** Next.js App Router + FastAPI Backend

**Tech Stack:**
- **Frontend:** Next.js 14, TypeScript, TailwindCSS, Shadcn UI, SWR
- **Backend:** FastAPI (Python), Polars, Redis, Parquet files
- **Deployment:** Vercel (frontend), Railway (backend)

**Timeline:** 10 weeks to production MVP

**Budget:** Start free ($0/mo), upgrade to $30/mo for production

**MVP Scope:** Scoreboard + Game Details + Team Pages + Basic Betting Metrics

**Next Immediate Step:** Choose from 4 options above based on priority.

---

**This document serves as the master reference for all frontend architecture decisions. All implementation work should align with the patterns and specifications outlined here.**

---

**Questions? Let me know which option (1-4) you'd like to pursue first, or if you have specific questions about any architectural decision!**
