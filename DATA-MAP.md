# DATA MAP

> **Visual mapping of our data sources → frontend pages**
> **Purpose**: Quick reference for what data goes where
> **Date**: October 22, 2025

---

## 🎯 6 PAGES → DATA SOURCES

```
┌─────────────────────────────────────────────────────────────┐
│                     1. HOME PAGE                             │
│                   (Live Scoreboard)                          │
├─────────────────────────────────────────────────────────────┤
│ DATA NEEDED:                                                 │
│ • Week + Season                                              │
│ • List of games with scores, status, time                   │
│ • Team logos                                                 │
│                                                              │
│ SOURCES:                                                     │
│ ✅ games table (272 records)                                │
│ ✅ teams table (32 records)                                 │
│                                                              │
│ SCRIPT:                                                      │
│ ✅ scripts/get-live-scoreboard.js                           │
│                                                              │
│ STATUS: Ready ✅                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     2. GAME PAGE                             │
│                (Complete Game Details)                       │
├─────────────────────────────────────────────────────────────┤
│ DATA NEEDED:                                                 │
│ • Game info (date, time, venue, status)                     │
│ • Quarter scores                                             │
│ • Team statistics (yards, turnovers, etc.)                  │
│ • Scoring plays timeline                                    │
│ • Player statistics (passing, rushing, receiving, defense)  │
│ • Weather conditions                                         │
│                                                              │
│ SOURCES:                                                     │
│ ✅ games table → Basic game info                            │
│ ✅ games.home_q1_score, etc. → Quarter scores              │
│ ✅ team_game_stats table (212 records) → Team stats        │
│ ✅ scoring_plays table (917 records) → Scoring timeline    │
│ ✅ player_game_stats table (6,842 records) → Player stats  │
│ ✅ game_weather table → Weather                            │
│ ⚠️  W-L record → Need to calculate from games              │
│                                                              │
│ SCRIPTS:                                                     │
│ ✅ Multiple queries needed (no single script yet)           │
│                                                              │
│ STATUS: 90% Ready (missing W-L calculation)                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     3. TEAM PAGE                             │
│                  (Team Hub & Roster)                         │
├─────────────────────────────────────────────────────────────┤
│ DATA NEEDED:                                                 │
│ • Team identity (name, logo, colors, venue)                 │
│ • Season record (W-L-T, points for/against)                 │
│ • Division/conference rank                                  │
│ • Current roster by position                                │
│ • Injury report                                              │
│ • Recent transactions                                        │
│ • Upcoming schedule                                          │
│                                                              │
│ SOURCES:                                                     │
│ ✅ teams table → Team identity                              │
│ ✅ stadiums table → Venue info                             │
│ ✅ player_teams table (2,538 records) → Roster links       │
│ ✅ players table (2,571 records) → Player profiles         │
│ ✅ player_season_cumulative_stats (1,516) → Season stats   │
│ ✅ roster_transactions table (2,161) → Transactions        │
│ ❓ player_injury_status table → Injuries (data unknown)    │
│ ⚠️  W-L-T record → Calculate from games                    │
│ ⚠️  Rankings → Calculate or standings table?               │
│                                                              │
│ SCRIPTS:                                                     │
│ ✅ scripts/get-team-roster.js (roster only)                │
│ ⚠️  Need: get-team-profile.js (full page)                  │
│                                                              │
│ STATUS: 60% Ready (need calculations + aggregation script)  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     4. PLAYER PAGE                           │
│                   (Player Profile)                           │
├─────────────────────────────────────────────────────────────┤
│ DATA NEEDED:                                                 │
│ • Player bio (name, position, height, weight, college)      │
│ • Current team                                               │
│ • Injury status                                              │
│ • Season statistics                                          │
│ • Game-by-game log                                           │
│ • Career totals                                              │
│                                                              │
│ SOURCES:                                                     │
│ ✅ players table → Bio data                                 │
│ ✅ player_teams table → Current team                       │
│ ✅ player_season_cumulative_stats → Season totals          │
│ ✅ player_game_stats (6,842) → Game log                    │
│ ❓ player_injury_status → Injury (data unknown)            │
│ ⚠️  Career totals → Need to aggregate across seasons       │
│                                                              │
│ SCRIPTS:                                                     │
│ ⚠️  Need: get-player-profile.js                            │
│                                                              │
│ STATUS: 50% Ready (need aggregation script)                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     5. STANDINGS PAGE                        │
│                   (League Standings)                         │
├─────────────────────────────────────────────────────────────┤
│ DATA NEEDED:                                                 │
│ • All 32 teams with W-L-T records                           │
│ • Points for/against                                         │
│ • Division rankings (1-4 per division)                      │
│ • Conference rankings (1-16 per conference)                 │
│ • Streaks (W3, L2, etc.)                                    │
│ • Division/conference records                                │
│                                                              │
│ SOURCES:                                                     │
│ ✅ teams table → Team identity                              │
│ ✅ games table → Calculate W-L from game results           │
│ ⚠️  All metrics → Need to calculate                        │
│                                                              │
│ SCRIPTS:                                                     │
│ ✅ scripts/scrapers/standings-scraper.js (exists)           │
│ ⚠️  Need to verify/enhance calculation logic                │
│                                                              │
│ STATUS: 40% Ready (need full standings calculation)         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   6. STATS LEADERS PAGE                      │
│                    (Top Performers)                          │
├─────────────────────────────────────────────────────────────┤
│ DATA NEEDED:                                                 │
│ • Top 10-25 players per stat category                       │
│ • Passing yards, TDs, rating                                │
│ • Rushing yards, TDs                                         │
│ • Receiving yards, TDs, receptions                          │
│ • Defense: tackles, sacks, INTs                             │
│ • Fantasy points                                             │
│                                                              │
│ SOURCES:                                                     │
│ ✅ player_season_cumulative_stats (1,516 players)          │
│ ✅ players table → Player bio                               │
│ ✅ teams table → Team info                                  │
│ ⚠️  Need ranking queries                                    │
│                                                              │
│ SCRIPTS:                                                     │
│ ⚠️  Need: get-leaderboard.js                               │
│                                                              │
│ STATUS: 70% Ready (data exists, need ranking script)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA COVERAGE SUMMARY

| Data Source | Records | Used By Pages | Status |
|-------------|---------|---------------|--------|
| **teams** | 32 | All 6 pages | ✅ Ready |
| **players** | 2,571 | Player, Team, Leaders | ✅ Ready |
| **games** | 272 | Home, Game, Team, Standings | ✅ Ready |
| **player_teams** | 2,538 | Team, Player | ✅ Ready |
| **player_game_stats** | 6,842 | Game, Player | ✅ Ready |
| **team_game_stats** | 212 | Game | ✅ Ready |
| **scoring_plays** | 917 | Game | ✅ Ready |
| **player_season_cumulative_stats** | 1,516 | Player, Team, Leaders | ✅ Ready |
| **roster_transactions** | 2,161 | Team | ✅ Ready |
| **stadiums** | 30 | Team, Game | ✅ Ready |
| **game_weather** | 106 | Game | ✅ Ready |
| **player_injury_status** | ? | Player, Team | ❓ Unknown |

---

## ⚠️ WHAT WE NEED TO BUILD

### High Priority (Core Pages)
1. **Team Record Calculator** → For Game, Team, Standings pages
   - Input: team_id, season
   - Output: W, L, T, win%, points_for, points_against
   - Source: Calculate from games table

2. **Standings Calculator** → For Standings page
   - Input: season, week
   - Output: All teams with division/conference ranks, streaks
   - Source: Calculate from games table

3. **Team Profile Aggregator** → For Team page
   - Input: team_id
   - Output: All team page data in one query
   - Sources: teams, players, player_teams, games, transactions

### Medium Priority (Enhanced Features)
4. **Player Profile Aggregator** → For Player page
   - Input: player_id
   - Output: All player page data
   - Sources: players, player_teams, player_game_stats, player_season_cumulative_stats

5. **Leaderboard Query** → For Leaders page
   - Input: stat_category, limit
   - Output: Top N players ranked
   - Source: player_season_cumulative_stats

---

## 🔄 DATA FLOW

```
ESPN API → Scrapers → Database → Query Scripts → Frontend
    ↓          ↓          ↓            ↓             ↓
  Live      7 scripts  49 tables   Need 5 new    Next.js
  Data      Running    22K+ rows     scripts       Pages
```

---

## ✅ READY TO USE NOW

```bash
# Home Page Data
npm run scoreboard -- --week=7

# Game Page Data (partial)
# Query games + team_game_stats + player_game_stats + scoring_plays

# Team Roster Data
npm run roster:team -- --team=SEA

# Game-Day Roster
npm run roster:gameday -- --game=401772510
```

---

## ⚠️ NEED TO BUILD

```bash
# Team Record (for multiple pages)
scripts/calculate-team-record.js --team=SEA --season=2025

# Full Standings
scripts/get-standings.js --season=2025 --week=7

# Team Profile (everything)
scripts/get-team-profile.js --team=SEA

# Player Profile (everything)
scripts/get-player-profile.js --player=espn-4361529

# Leaderboards
scripts/get-leaderboard.js --category=passing_yards --limit=25
```

---

## 📈 EFFORT ESTIMATE

| Script | Complexity | Time | Priority |
|--------|------------|------|----------|
| calculate-team-record.js | Low | 2h | HIGH |
| get-standings.js | Medium | 4h | HIGH |
| get-team-profile.js | Medium | 3h | HIGH |
| get-leaderboard.js | Low | 2h | MEDIUM |
| get-player-profile.js | Medium | 3h | MEDIUM |

**Total: ~14 hours to complete all missing scripts**

---

## 🎯 NEXT STEP

**Fix the WSH normalization issue** then build the 5 missing query scripts in priority order.
