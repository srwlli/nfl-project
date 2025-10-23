# Pages to Build - NFL Stats Platform

**Last Updated**: October 23, 2025
**Total Pages**: 7 core page types

---

## ✅ Phase 1: Core Pages (Build These Now)

### 1. **Homepage / Live Scoreboard**
**Route**: `/`
**Priority**: P0 - Critical
**Components.json**: ✅ `live-scoreboard/components.json`
**Template**: ⏳ Need to create
**Data Ready**: ✅ 100%

**What it shows**:
- Live game scores (auto-updating every 30 seconds)
- Upcoming games today
- Recently completed games
- Top performers today
- Division standings widget
- Featured game spotlight
- Week schedule overview

**Key Features**:
- Real-time WebSocket updates during games
- Pulsing "LIVE" indicator
- Responsive grid layout
- Auto-refresh only during game windows

---

### 2. **Game Details Pages**
**Route**: `/games/[gameId]`
**Priority**: P0 - Critical
**Components.json**: ✅ `game-details/components.json`
**Template**: ✅ `game-details/template-next-down-metrics.tsx` (1,356 lines)
**Data Ready**: ✅ 95-100%

**3 Variants**:

#### A. **Live Game Page** (status = in_progress)
- Real-time score updates
- Current quarter, down & distance
- Live play-by-play feed
- Player stats updating live
- Possession indicator

#### B. **Completed Game Page** (status = final)
- Final score with winner highlighted
- Complete box score (passing, rushing, receiving, defense)
- Team stats comparison
- Scoring summary timeline
- Play-by-play with drives
- Advanced analytics (EPA, win probability)
- Betting results

#### C. **Scheduled Game Page** (status = scheduled)
- Matchup preview
- Team comparison
- Betting lines (spread, O/U, moneyline)
- Weather forecast
- Injury report preview

**Key Features**:
- 8-tab navigation (Summary, Box Score, Play-by-Play, Team Stats, Player Stats, Scoring, Info, Videos)
- Quarter-by-quarter scores
- Real-time updates for live games
- 13 theme variations available

---

### 3. **Player Profile Pages**
**Route**: `/players/[playerId]`
**Priority**: P0 - Critical
**Components.json**: ✅ `player-profiles/components.json`
**Template**: ⏳ Use showcase examples
**Data Ready**: ✅ 85%

**What it shows**:
- Player hero section (headshot, name, team, jersey #)
- Quick stats bar (height, weight, age, college, draft)
- Career totals (big numbers with sparklines)
- Season-by-season stats table
- Game logs (expandable per season)
- Biographical info
- Awards & achievements
- Career timeline (draft, trades, milestones)
- Advanced analytics (EPA, Next Gen Stats if available)

**Key Features**:
- Position-specific stats displayed
- Award badges (MVP, Pro Bowl, All-Pro)
- Injury status indicator
- Link to current team page

**Page Count**: 2,578 active players

---

### 4. **Team Pages**
**Route**: `/teams/[teamId]`
**Priority**: P1 - Important
**Components.json**: ✅ `team-pages/components.json`
**Template**: ⏳ Use showcase examples
**Data Ready**: ✅ 95%

**What it shows**:
- Team hero (logo, record, standings)
- Quick stats cards (PPG, rankings, streak)
- **53-man roster table** (sortable, filterable)
- **Depth chart view** (starters/backups by position) ⭐
- Season schedule (past results + upcoming)
- Team season stats (offense, defense, turnovers)
- Division standings
- Team leaders (top performers)
- Team info (stadium, founded, championships)

**Key Features**:
- Dynamic team colors theming
- Depth chart with injury indicators
- Home/away record splits
- Link to stadium page

**Page Count**: 32 NFL teams

---

### 5. **Stats & Leaderboards**
**Route**: `/stats/[category]`
**Priority**: P1 - Important
**Components.json**: ✅ `stats/components.json`
**Template**: ⏳ Need to create
**Data Ready**: ✅ 100%

**Categories**:
- **Passing Leaders** - Yards, TDs, INTs, Rating, Completions
- **Rushing Leaders** - Yards, TDs, Avg, Longest
- **Receiving Leaders** - Receptions, Yards, TDs, Targets
- **Defense Leaders** - Tackles, Sacks, INTs, Forced Fumbles

**What it shows**:
- Leaderboard tables (top 100+ players)
- Weekly leaders (top performers by week)
- Player comparison tool (side-by-side)
- Team comparison grid (all 32 teams)
- Stat trend charts
- Record book (all-time records)
- Active streaks

**Key Features**:
- Sortable columns
- Position filters
- Team filters
- Stat minimums (games played, attempts, etc.)
- Pagination
- Rank badges (#1, #2, #3 highlighted)

---

### 6. **Matchup Preview Pages**
**Route**: `/games/[gameId]/preview`
**Priority**: P1 - Important
**Components.json**: ✅ `matchup-preview/components.json`
**Template**: ⏳ Need to create
**Data Ready**: ✅ 85%

**What it shows**:
- Matchup header (teams, logos, game time, countdown)
- Betting lines (spread, moneyline, over/under)
- Key storylines
- Team comparison (season stats head-to-head)
- Key players to watch
- Injury report (both teams)
- Weather forecast
- Team trends (last 5 games)
- Recent matchup history
- Game prediction (if algorithm available)

**Key Features**:
- Countdown timer to kickoff
- Real-time betting line updates
- Weather impact analysis
- Switches to live game page when game starts

**Page Count**: ~16 games per week during season

---

### 7. **Stadium Pages**
**Route**: `/stadiums/[stadiumId]`
**Priority**: P2 - Nice to Have
**Components.json**: ✅ `stadium-pages/components.json`
**Template**: ⏳ Need to create
**Data Ready**: ✅ 90%

**What it shows**:
- Stadium hero (photo, name, location, home team)
- Stadium information (capacity, surface, roof, year opened)
- Upcoming games at this stadium
- Home team history at stadium
- Weather impact analysis
- Notable games played here
- Recent games
- Location map (Google Maps)
- Stadium records

**Key Features**:
- Interactive map
- Weather history by month
- Home team win/loss record
- Link to home team page

**Page Count**: 30 NFL stadiums

---

## ❌ Pages We're NOT Building (For Now)

These were in the showcase but we don't need them yet:

### Historical Data Pages (Need Historical Data 1920-2024)
- ❌ Super Bowl History
- ❌ Hall of Fame
- ❌ All-Time Greatest Games
- ❌ Historic Matchups
- ❌ Historical Stats
- ❌ On This Day in NFL History

### Interactive Tools (Need Algorithm Development)
- ❌ GOAT Calculator
- ❌ Perfect Player Builder
- ❌ Perfect Team Builder

### Engagement/Gamification (Need User Authentication)
- ❌ Player Card Collection
- ❌ Engagement Dashboard
- ❌ Franchise Simulator
- ❌ My Rankings
- ❌ Weekly Awards Voting

---

## 📊 Build Priority

### Week 1-2: Foundation + Homepage
1. ✅ Set up Next.js 14 with App Router
2. ✅ Configure Tailwind CSS v4 + shadcn/ui
3. ✅ Set up Supabase client
4. ✅ Implement theme system (13 primary themes)
5. **Build Homepage / Live Scoreboard**

### Week 3-4: Core Game Pages
6. **Build Game Details Pages** (use template)
   - Live variant
   - Completed variant
   - Scheduled variant

### Week 5-6: Player & Team Pages
7. **Build Player Profile Pages**
8. **Build Team Pages** (includes depth chart)

### Week 7-8: Stats & Analysis
9. **Build Stats & Leaderboards**
10. **Build Matchup Preview Pages**

### Week 9: Polish
11. **Build Stadium Pages**
12. Theme switcher
13. Performance optimization
14. SEO optimization

---

## 🎯 Summary

**Total Pages to Build**: 7 page types
**All Components.json**: ✅ Complete (7/7)
**Templates Available**: ✅ 1 (Game Details - Next Down Metrics)
**Data Readiness**: ✅ 85-100% across all pages

**You're ready to start building!** 🚀

All specifications are in:
```
coderef/finalizing-elements/
├── live-scoreboard/components.json
├── game-details/components.json + template-next-down-metrics.tsx
├── player-profiles/components.json
├── team-pages/components.json
├── stats/components.json
├── matchup-preview/components.json
└── stadium-pages/components.json
```

---

Last Updated: October 23, 2025
