# DATA MAPPING SPECIFICATION

> **Purpose**: Define exactly what data we need from our database to display each page/view in the frontend.
> **Date**: October 22, 2025
> **Status**: Draft for Review

---

## Overview

This document maps our **backend data sources** → **frontend display requirements**.

**Proven Capabilities** (from test-week4.js):
- ✅ Week scoreboard with 16 games
- ✅ Team rosters with 78+ players per team
- ✅ Game-day rosters with stats
- ✅ Player game statistics (passing, rushing, receiving, defense)
- ✅ Team game statistics
- ✅ Quarter-by-quarter scores
- ✅ Scoring plays timeline

**What We Need to Define**:
1. Which pages/views do we want to build?
2. For each page, what exact data fields do we display?
3. Which database tables/scripts provide that data?
4. What's missing (if anything)?

---

## 📋 Proposed Pages/Views

### 1. HOME PAGE - Live Scoreboard
**Purpose**: Show current week's games with live scores

**Display Requirements**:
```javascript
{
  week: 4,
  season: 2025,
  games: [
    {
      gameId: "espn-401772510",
      status: "final", // or "scheduled" or "in_progress"
      date: "2024-09-29",
      time: "1:00 PM ET",

      awayTeam: {
        abbreviation: "CIN",
        name: "Cincinnati Bengals",
        logo: "https://...",
        score: 24
      },

      homeTeam: {
        abbreviation: "PIT",
        name: "Pittsburgh Steelers",
        logo: "https://...",
        score: 27
      },

      broadcast: "CBS",

      // Optional: Show quarter scores?
      quarters: {
        away: [7, 10, 0, 7],  // Q1-Q4
        home: [3, 14, 3, 7]
      }
    }
  ]
}
```

**Data Source**:
- **Script**: `scripts/get-live-scoreboard.js`
- **Function**: `fetchScoreboardData(week)`
- **Tables**: `games`, `teams`

**Status**: ✅ Already working (tested in test-week4.js)

---

### 2. GAME PAGE - Complete Game Details
**Purpose**: Show everything about a single game

**Display Requirements**:
```javascript
{
  game: {
    gameId: "espn-401772510",
    week: 4,
    season: 2025,
    date: "2024-09-29",
    time: "1:00 PM ET",
    status: "final",
    broadcast: "CBS",
    venue: "Acrisure Stadium",
    attendance: 68,400,

    // Weather
    weather: {
      temperature: 72,
      conditions: "Partly Cloudy",
      wind: "5 mph NW",
      humidity: "65%"
    }
  },

  // Team summaries
  teams: {
    away: {
      id: "CIN",
      name: "Cincinnati Bengals",
      logo: "https://...",
      score: 24,
      record: "0-4"
    },
    home: {
      id: "PIT",
      name: "Pittsburgh Steelers",
      logo: "https://...",
      score: 27,
      record: "3-1"
    }
  },

  // Quarter scores
  quarters: {
    away: [7, 10, 0, 7, 0],  // Q1-Q4, OT
    home: [3, 14, 3, 7, 0]
  },

  // Team stats
  teamStats: {
    away: {
      totalYards: 389,
      passingYards: 289,
      rushingYards: 100,
      turnovers: 1,
      penalties: "5-45",
      possessionTime: "28:15",
      thirdDowns: "4-12",
      fourthDowns: "1-2"
    },
    home: { /* same structure */ }
  },

  // Scoring plays timeline
  scoringPlays: [
    {
      quarter: 1,
      time: "8:23",
      team: "CIN",
      description: "Joe Burrow 5 yd pass to Ja'Marr Chase (Evan McPherson kick)",
      scoreAfter: { away: 7, home: 0 }
    }
  ],

  // Player stats (organized by category)
  playerStats: {
    passing: [
      {
        playerId: "...",
        name: "Joe Burrow",
        team: "CIN",
        stats: {
          completions: 22,
          attempts: 34,
          yards: 289,
          touchdowns: 2,
          interceptions: 1,
          rating: 87.3
        }
      }
    ],

    rushing: [
      {
        playerId: "...",
        name: "Najee Harris",
        team: "PIT",
        stats: {
          attempts: 18,
          yards: 78,
          touchdowns: 1,
          longRun: 23,
          average: 4.3
        }
      }
    ],

    receiving: [
      {
        playerId: "...",
        name: "Ja'Marr Chase",
        team: "CIN",
        stats: {
          receptions: 8,
          targets: 11,
          yards: 112,
          touchdowns: 2,
          longReception: 34,
          average: 14.0
        }
      }
    ],

    defense: [
      {
        playerId: "...",
        name: "T.J. Watt",
        team: "PIT",
        stats: {
          tackles: 8,
          sacks: 2.0,
          tacklesForLoss: 3,
          interceptions: 0,
          forcedFumbles: 1
        }
      }
    ]
  }
}
```

**Data Sources**:
- **Script**: `scripts/get-game-stats.js` (game + team stats + player stats + scoring plays)
- **Script**: `scripts/get-gameday-roster.js` (active roster for the game)
- **Tables**: `games`, `teams`, `team_game_stats`, `player_game_stats`, `scoring_plays`, `game_rosters`, `players`

**Status**: ✅ Mostly working (see demo-game-page-with-players.html)

**Missing**:
- Team records (W-L) - need to calculate from games table
- Player headshots in player stats
- Weather humidity % (only have temp, wind, conditions)

---

### 3. TEAM PAGE - Team Overview & Roster
**Purpose**: Show team info, current roster, season stats

**Display Requirements**:
```javascript
{
  team: {
    id: "SEA",
    name: "Seattle Seahawks",
    abbreviation: "SEA",
    city: "Seattle",
    logo: "https://...",
    colors: {
      primary: "#002244",
      secondary: "#69BE28"
    },
    conference: "NFC",
    division: "West",

    // Current season
    record: {
      wins: 3,
      losses: 1,
      ties: 0
    },

    divisionRank: 1,
    conferenceRank: 3,

    nextGame: {
      gameId: "...",
      opponent: "SF",
      date: "2024-10-10",
      time: "8:15 PM ET",
      location: "home"
    }
  },

  // Current roster (by position group)
  roster: {
    QB: [
      {
        playerId: "...",
        name: "Geno Smith",
        number: 7,
        position: "QB",
        height: "6'3\"",
        weight: 221,
        college: "West Virginia",
        experience: "12 years",
        status: "active",

        // Season stats
        stats: {
          gamesPlayed: 4,
          passingYards: 1134,
          touchdowns: 8,
          interceptions: 3,
          fantasyPoints: 87.2
        }
      }
    ],

    RB: [ /* same structure */ ],
    WR: [ /* same structure */ ],
    TE: [ /* same structure */ ],
    OL: [ /* same structure */ ],
    DL: [ /* same structure */ ],
    LB: [ /* same structure */ ],
    DB: [ /* same structure */ ],
    K: [ /* same structure */ ],
    P: [ /* same structure */ ]
  },

  // Recent roster moves
  recentTransactions: [
    {
      date: "2024-09-25",
      type: "addition",
      player: "John Doe",
      position: "WR"
    }
  ],

  // Injury report
  injuries: [
    {
      playerId: "...",
      name: "Kenneth Walker III",
      position: "RB",
      status: "questionable",
      injury: "Ankle",
      lastUpdate: "2024-10-08"
    }
  ]
}
```

**Data Sources**:
- **Script**: `scripts/get-team-roster.js`
- **Script**: `scripts/scrapers/roster-updates-scraper.js` (transactions)
- **Script**: `scripts/scrapers/injuries-scraper.js` (injury report)
- **Tables**: `teams`, `players`, `player_teams`, `player_season_cumulative_stats`, `roster_transactions`, `player_injury_status`, `games`

**Status**: ✅ Roster working (tested in test-week4.js)

**Missing**:
- Team record calculation (need to query games)
- Division/conference rank (need standings table)
- Next game lookup
- Injury data (table exists but may be empty)

---

### 4. PLAYER PAGE - Player Profile
**Purpose**: Show individual player details, stats, game log

**Display Requirements**:
```javascript
{
  player: {
    playerId: "...",
    name: "Geno Smith",
    firstName: "Geno",
    lastName: "Smith",
    number: 7,
    position: "QB",

    team: {
      id: "SEA",
      name: "Seattle Seahawks",
      logo: "https://..."
    },

    bio: {
      height: "6'3\"",
      weight: 221,
      age: 33,
      college: "West Virginia",
      draftYear: 2013,
      draftRound: 2,
      draftPick: 39,
      experience: "12 years",
      status: "active"
    },

    headshot: "https://...",

    // Current injury status (if applicable)
    injury: {
      status: "healthy" // or "out", "doubtful", "questionable"
    }
  },

  // Season totals
  seasonStats: {
    season: 2025,
    gamesPlayed: 4,
    gamesStarted: 4,

    passing: {
      completions: 88,
      attempts: 134,
      yards: 1134,
      touchdowns: 8,
      interceptions: 3,
      rating: 94.7,
      yardsPerAttempt: 8.5
    },

    rushing: {
      attempts: 12,
      yards: 23,
      touchdowns: 0
    },

    fantasy: {
      standardPoints: 78.2,
      pprPoints: 78.2,
      halfPprPoints: 78.2
    }
  },

  // Game-by-game log
  gameLog: [
    {
      week: 4,
      date: "2024-09-29",
      opponent: "DET",
      location: "away",
      result: "W 42-29",

      stats: {
        passing: {
          completions: 18,
          attempts: 28,
          yards: 395,
          touchdowns: 1,
          interceptions: 1
        },
        rushing: {
          attempts: 1,
          yards: -2,
          touchdowns: 0
        },
        fantasyPoints: 26.9
      }
    }
  ],

  // Career stats (optional)
  careerStats: {
    seasons: 12,
    gamesPlayed: 89,
    passingYards: 14567,
    touchdowns: 78,
    interceptions: 52
  }
}
```

**Data Sources**:
- **Tables**: `players`, `player_teams`, `player_season_cumulative_stats`, `player_game_stats`, `games`, `teams`, `player_injury_status`

**Status**: ⚠️ Data exists but no dedicated script yet

**Missing**:
- Dedicated player profile script
- Career stats aggregation
- Draft information (not in current schema)

---

### 5. STANDINGS PAGE - League Standings
**Purpose**: Show division/conference rankings

**Display Requirements**:
```javascript
{
  season: 2025,
  week: 7,

  conferences: {
    AFC: {
      divisions: {
        East: [
          {
            team: "BUF",
            teamName: "Buffalo Bills",
            logo: "https://...",
            wins: 5,
            losses: 2,
            ties: 0,
            winPercentage: 0.714,
            pointsFor: 189,
            pointsAgainst: 156,
            pointDifferential: 33,
            divisionRank: 1,
            conferenceRank: 2,
            streak: "W3"
          }
        ],
        North: [ /* same */ ],
        South: [ /* same */ ],
        West: [ /* same */ ]
      }
    },

    NFC: { /* same structure */ }
  }
}
```

**Data Sources**:
- **Script**: `scripts/scrapers/standings-scraper.js`
- **Tables**: `games`, `teams`, `standings` (if exists)

**Status**: ✅ Standings scraper exists

**Missing**:
- Need to verify standings table schema
- Streak calculation (W3, L2, etc.)

---

### 6. STATS LEADERS PAGE - League Leaders
**Purpose**: Show top performers by category

**Display Requirements**:
```javascript
{
  season: 2025,
  week: 7,

  categories: {
    passingYards: [
      {
        rank: 1,
        playerId: "...",
        name: "Patrick Mahomes",
        team: "KC",
        teamLogo: "https://...",
        headshot: "https://...",
        value: 2134,
        average: 304.9  // per game
      }
    ],

    passingTouchdowns: [ /* same */ ],
    rushingYards: [ /* same */ ],
    receivingYards: [ /* same */ ],
    receptions: [ /* same */ ],
    tackles: [ /* same */ ],
    sacks: [ /* same */ ],
    interceptions: [ /* same */ ],

    fantasyPoints: [ /* same */ ]
  }
}
```

**Data Sources**:
- **Tables**: `player_season_cumulative_stats`, `players`, `teams`, `weekly_stat_leaders` (if exists)

**Status**: ⚠️ Data exists, need leaderboard query script

**Missing**:
- Dedicated leaderboard script
- Need to query player_season_cumulative_stats and rank

---

### 7. SCHEDULE PAGE - Full Season Schedule
**Purpose**: Show all games by week

**Display Requirements**:
```javascript
{
  season: 2025,

  weeks: [
    {
      week: 1,
      games: [
        {
          gameId: "...",
          date: "2024-09-05",
          time: "8:20 PM ET",
          awayTeam: "BAL",
          homeTeam: "KC",
          status: "final",
          score: { away: 20, home: 27 },
          broadcast: "NBC"
        }
      ]
    }
  ]
}
```

**Data Sources**:
- **Tables**: `games`, `teams`

**Status**: ✅ Data exists, need schedule query script

---

## 📊 Data Completeness Assessment

### What We Have (✅ Confirmed Working)
| Data Type | Source | Status |
|-----------|--------|--------|
| Live scoreboard | get-live-scoreboard.js | ✅ Working |
| Team rosters | get-team-roster.js | ✅ Working |
| Game-day rosters | get-gameday-roster.js | ✅ Working |
| Player game stats | player_game_stats table | ✅ 6,842 records |
| Team game stats | team_game_stats table | ✅ 212 records |
| Scoring plays | scoring_plays table | ✅ 917 records |
| Quarter scores | games table | ✅ Available |
| Season cumulative stats | player_season_cumulative_stats | ✅ 1,516 players |

### What We Need to Build (⚠️ Scripts/Queries Needed)
| Feature | Missing Component | Effort |
|---------|------------------|--------|
| Team records (W-L) | Query games table, calculate | 1 hour |
| Standings with streak | Calculate from games | 1 hour |
| Leaderboard queries | Rank player_season_cumulative_stats | 2 hours |
| Player profile script | Aggregate player data | 2 hours |
| Schedule by week script | Query + format games | 1 hour |

### What's Incomplete (❌ Data Gaps)
| Feature | Issue | Solution |
|---------|-------|----------|
| Injury reports | Table exists but may be empty | Run injuries-scraper.js |
| Team records/standings | No standings table? | Verify schema or calculate from games |
| Player headshots | URLs exist in players table | Already have this! |
| Weather humidity | Only have temp/wind/conditions | ESPN may not provide % |
| Draft info | Not in schema | Add to players table (future) |

---

## 🎯 Recommended Next Steps

### Phase 1: Verify What We Have (1-2 hours)
1. Check if standings data exists in database
2. Verify injury_status table has data
3. Confirm player headshot URLs are valid

### Phase 2: Build Missing Query Scripts (6-8 hours)
1. **get-team-record.js** - Calculate team W-L from games
2. **get-leaderboard.js** - Rank players by stat category
3. **get-player-profile.js** - Aggregate player data
4. **get-schedule.js** - Format season schedule by week
5. **get-standings.js** - Calculate/format standings with streaks

### Phase 3: Data Validation (2-3 hours)
1. Run all scripts and verify output matches requirements
2. Check for missing/null fields
3. Test with different weeks/teams/players

### Phase 4: Frontend Integration (Separate effort)
1. Create TypeScript interfaces matching these data structures
2. Build API endpoints or static data generation
3. Connect Next.js components to data

---

## 🔍 Questions to Answer

Before we proceed, we should decide:

1. **Which pages are priority?**
   - Home (scoreboard) - YES
   - Game details - YES
   - Team page - YES
   - Player page - ?
   - Standings - ?
   - Leaderboards - ?

2. **Real-time vs Static?**
   - Do we need live score updates during games?
   - Or is "refresh page" acceptable?

3. **Mobile-first?**
   - What's our primary target device?

4. **Performance constraints?**
   - How many API calls per page load is acceptable?
   - Should we pre-generate static pages?

---

## 📝 Summary

**We have proven**:
- ✅ Scoreboard works (16 games with live scores)
- ✅ Rosters work (78+ players per team)
- ✅ Game stats work (team + player stats + scoring plays)
- ✅ Data is comprehensive (6,842+ player game stats)

**We need to build**:
- Query scripts for team records, leaderboards, player profiles
- Calculate derived data (W-L records, rankings, streaks)
- Verify/populate injury data

**We're ready to**:
- Define final page list (prioritize)
- Build missing query scripts
- Start frontend integration

---

**Decision Point**: Should we build all the missing query scripts now, or prioritize specific pages first?
