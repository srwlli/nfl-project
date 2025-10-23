# DISPLAY REQUIREMENTS SPECIFICATION

> **Approach**: Design-first data mapping
> **Method**: Define what we want to display → Map to existing data sources → Identify gaps
> **Date**: October 22, 2025

---

## Methodology

1. **Define Display Requirements** - What do we want users to see?
2. **Map to Data Sources** - Use AVAILABLE-DATA-INVENTORY.md and DATA-SOURCE-INDEX.md
3. **Identify Gaps** - What's missing? What needs calculation?
4. **Prioritize** - Which pages first?

---

## 📱 PAGE 1: HOME - Live Scoreboard

### What We Want to Display

```typescript
interface HomePageData {
  currentWeek: number
  season: number
  totalGames: number

  games: Array<{
    // Game identity
    gameId: string
    status: 'scheduled' | 'in_progress' | 'final'

    // Timing
    date: string           // "Sunday, Sep 29"
    time: string           // "1:00 PM ET"
    broadcast?: string     // "CBS", "FOX", "NBC"

    // Teams (minimal for scoreboard)
    awayTeam: {
      abbr: string         // "CIN"
      logo: string         // Team logo URL
      score: number | null // null if scheduled
    }

    homeTeam: {
      abbr: string         // "PIT"
      logo: string         // Team logo URL
      score: number | null
    }

    // Game state indicators
    clock?: string         // "3:45 Q2" (if in_progress)
    possession?: 'home' | 'away'  // (if in_progress)
  }>
}
```

### Data Source Mapping

| Field | Source Table/Script | Notes |
|-------|---------------------|-------|
| `currentWeek` | Calculated from current date | Need logic |
| `games[].gameId` | `games.game_id` | ✅ Available |
| `games[].status` | `games.status` | ✅ Available |
| `games[].date` | `games.game_date` | ✅ Available |
| `games[].time` | `games.game_time` | ✅ Available |
| `games[].broadcast` | `games.broadcast_network` | ✅ Available |
| `games[].awayTeam.abbr` | `teams.team_abbr` (via games.away_team_id) | ✅ Available |
| `games[].awayTeam.logo` | `teams.logo_url` | ✅ Available |
| `games[].awayTeam.score` | `games.away_score` | ✅ Available |
| `games[].homeTeam.*` | Same as away | ✅ Available |
| `games[].clock` | Not stored | ❌ ESPN live only |
| `games[].possession` | Not stored | ❌ ESPN live only |

**Query Script**: ✅ `scripts/get-live-scoreboard.js` already exists

**Gaps**: Live game clock and possession (requires real-time ESPN polling)

---

## 📱 PAGE 2: GAME - Complete Game View

### What We Want to Display

```typescript
interface GamePageData {
  // Game header
  game: {
    gameId: string
    week: number
    season: number
    status: 'scheduled' | 'in_progress' | 'final'
    date: string
    time: string
    venue: string
    attendance?: number
    broadcast: string
  }

  // Weather (if game played outdoors)
  weather?: {
    temperature: number      // 72
    conditions: string       // "Partly Cloudy"
    wind: string            // "5 mph NW"
  }

  // Team summaries with scores
  teams: {
    away: TeamSummary
    home: TeamSummary
  }

  // Linescore (quarter by quarter)
  linescore: {
    quarters: string[]       // ["Q1", "Q2", "Q3", "Q4", "OT"]
    away: number[]           // [7, 10, 0, 7, 0]
    home: number[]           // [3, 14, 3, 7, 0]
  }

  // Team statistics comparison
  teamStats: {
    categories: TeamStatCategory[]
  }

  // Scoring plays timeline
  scoringPlays: ScoringPlay[]

  // Player statistics (tabbed by category)
  playerStats: {
    passing: PlayerStat[]
    rushing: PlayerStat[]
    receiving: PlayerStat[]
    defense: PlayerStat[]
    kicking: PlayerStat[]
  }
}

interface TeamSummary {
  id: string
  abbr: string
  name: string
  logo: string
  score: number
  record?: string          // "3-1" (optional)
}

interface TeamStatCategory {
  label: string
  away: string | number
  home: string | number
  winner?: 'away' | 'home' | 'tie'
}

interface ScoringPlay {
  quarter: number
  clock: string
  team: string             // "CIN"
  teamLogo: string
  description: string      // "Joe Burrow 5 yd pass to Ja'Marr Chase (PAT good)"
  scoreAfter: {
    away: number
    home: number
  }
}

interface PlayerStat {
  playerId: string
  name: string
  team: string
  teamLogo: string
  headshot?: string
  position: string

  stats: Record<string, number | string>  // Flexible for different stat types
}
```

### Data Source Mapping

**Game Header**:
| Field | Source | Status |
|-------|--------|--------|
| `game.*` | `games` table | ✅ All fields available |
| `game.venue` | `stadiums.stadium_name` (via games.stadium_id) | ✅ Available |

**Weather**:
| Field | Source | Status |
|-------|--------|--------|
| `weather.temperature` | `game_weather.temperature_fahrenheit` | ✅ Available |
| `weather.conditions` | `game_weather.weather_conditions` | ✅ Available |
| `weather.wind` | `game_weather.wind_speed` + `wind_direction` | ✅ Available |

**Teams**:
| Field | Source | Status |
|-------|--------|--------|
| All fields | `teams` table | ✅ Available |
| `record` | Calculate from `games` | ⚠️ Need calculation |

**Linescore**:
| Field | Source | Status |
|-------|--------|--------|
| `quarters` | Static array | ✅ Hardcoded |
| `away/home scores` | `games` columns: `home_q1_score`, `home_q2_score`, etc. | ✅ Available |

**Team Stats**:
| Field | Source | Status |
|-------|--------|--------|
| All categories | `team_game_stats` table | ✅ Available (212 records) |

**Scoring Plays**:
| Field | Source | Status |
|-------|--------|--------|
| All fields | `scoring_plays` table | ✅ Available (917 records) |

**Player Stats**:
| Field | Source | Status |
|-------|--------|--------|
| All fields | `player_game_stats` table | ✅ Available (6,842 records) |
| `headshot` | `players.headshot_url` | ✅ Available |

**Query Script**: ✅ Can use existing `get-game-stats.js` + need aggregation

**Gaps**: Team record calculation

---

## 📱 PAGE 3: TEAM - Team Hub

### What We Want to Display

```typescript
interface TeamPageData {
  // Team identity
  team: {
    id: string
    abbr: string
    name: string
    city: string
    mascot: string         // Extract from team_name
    logo: string
    colors: {
      primary: string
      secondary: string
    }

    conference: string
    division: string

    venue: string
    venueCapacity?: number
  }

  // Current season record
  record: {
    wins: number
    losses: number
    ties: number
    winPct: number

    pointsFor: number
    pointsAgainst: number
    pointDiff: number

    divisionRank: number       // 1-4
    conferenceRank: number     // 1-16

    streak: string             // "W3" or "L2"

    homeRecord: string         // "2-1"
    awayRecord: string         // "1-0"
  }

  // Schedule
  schedule: {
    lastGame?: GameSummary
    nextGame?: GameSummary
    upcomingGames: GameSummary[]   // Next 3-4 games
  }

  // Current roster (by position group)
  roster: {
    [positionGroup: string]: RosterPlayer[]
  }

  // Injuries
  injuries: InjuryReport[]

  // Recent transactions
  transactions: Transaction[]

  // Team stats (season totals)
  seasonStats: {
    offense: {
      pointsPerGame: number
      yardsPerGame: number
      passYardsPerGame: number
      rushYardsPerGame: number
    }
    defense: {
      pointsAllowedPerGame: number
      yardsAllowedPerGame: number
    }
  }
}

interface RosterPlayer {
  playerId: string
  name: string
  number: number
  position: string
  height: string
  weight: number
  college: string
  experience: string
  status: string
  headshot?: string

  // Quick season stats
  stats?: {
    gamesPlayed: number
    keyStats: Record<string, number>  // Position-dependent
  }
}

interface InjuryReport {
  playerId: string
  name: string
  position: string
  status: 'out' | 'doubtful' | 'questionable' | 'probable'
  injury: string
  lastUpdate: string
}

interface Transaction {
  date: string
  type: 'addition' | 'removal'
  playerName: string
  position: string
}
```

### Data Source Mapping

**Team Identity**:
| Field | Source | Status |
|-------|--------|--------|
| All basic fields | `teams` table | ✅ Available |
| `venue` | `stadiums.stadium_name` (via teams.stadium_id) | ✅ Available |
| `venueCapacity` | `stadiums.capacity` | ✅ Available |

**Record**:
| Field | Source | Status |
|-------|--------|--------|
| `wins, losses, ties` | Calculate from `games` | ⚠️ Need query |
| `pointsFor, pointsAgainst` | Sum from `games` | ⚠️ Need query |
| `divisionRank, conferenceRank` | `standings` table or calculate | ⚠️ Unknown |
| `streak` | Calculate from recent `games` | ⚠️ Need logic |
| `homeRecord, awayRecord` | Calculate from `games` | ⚠️ Need query |

**Schedule**:
| Field | Source | Status |
|-------|--------|--------|
| All fields | `games` table, filter by team | ✅ Data available |

**Roster**:
| Field | Source | Status |
|-------|--------|--------|
| Player info | `players` + `player_teams` | ✅ Available (2,538 records) |
| Season stats | `player_season_cumulative_stats` | ✅ Available (1,516 records) |

**Injuries**:
| Field | Source | Status |
|-------|--------|--------|
| All fields | `player_injury_status` table | ❓ Table exists, data unknown |

**Transactions**:
| Field | Source | Status |
|-------|--------|--------|
| All fields | `roster_transactions` table | ✅ Available (2,161 records) |

**Season Stats**:
| Field | Source | Status |
|-------|--------|--------|
| All fields | Aggregate from `team_game_stats` | ✅ Data available |

**Query Script**: ⚠️ Need new `get-team-profile.js` script

**Gaps**:
- Record calculation logic
- Standings/rank (verify if `standings` table exists)
- Injury data population

---

## 📱 PAGE 4: PLAYER - Player Profile

### What We Want to Display

```typescript
interface PlayerPageData {
  // Player identity
  player: {
    playerId: string
    name: string
    firstName: string
    lastName: string
    number: number
    position: string
    headshot?: string

    team: {
      id: string
      abbr: string
      name: string
      logo: string
    }

    bio: {
      height: string
      weight: number
      age: number
      birthDate: string
      college: string
      experience: string
      status: string
    }
  }

  // Current injury (if applicable)
  injury?: {
    status: 'out' | 'doubtful' | 'questionable' | 'probable'
    description: string
    lastUpdate: string
  }

  // Season statistics
  seasonStats: {
    season: number
    gamesPlayed: number
    gamesStarted?: number

    // Position-specific stats
    stats: Record<string, number>

    // Fantasy points
    fantasy: {
      standard: number
      ppr: number
      halfPpr: number
    }
  }

  // Game log (last 10 games or current season)
  gameLog: GameLogEntry[]

  // Career totals (optional)
  career?: {
    seasons: number
    gamesPlayed: number
    careerStats: Record<string, number>
  }
}

interface GameLogEntry {
  week: number
  date: string
  opponent: string
  opponentLogo: string
  location: 'home' | 'away'
  result: string           // "W 27-24" or "L 20-24"

  stats: Record<string, number>
  fantasyPoints: number
}
```

### Data Source Mapping

**Player Identity**:
| Field | Source | Status |
|-------|--------|--------|
| All player fields | `players` table | ✅ Available |
| Team info | `teams` via `player_teams` | ✅ Available |
| `age` | Calculate from `birth_date` if exists | ❓ Check schema |

**Injury**:
| Field | Source | Status |
|-------|--------|--------|
| All fields | `player_injury_status` | ❓ Data unknown |

**Season Stats**:
| Field | Source | Status |
|-------|--------|--------|
| All fields | `player_season_cumulative_stats` | ✅ Available (1,516 players) |

**Game Log**:
| Field | Source | Status |
|-------|--------|--------|
| Stats | `player_game_stats` | ✅ Available (6,842 records) |
| Game info | `games` table | ✅ Available |

**Career Totals**:
| Field | Source | Status |
|-------|--------|--------|
| All fields | Aggregate `player_game_stats` across seasons | ⚠️ Need calculation |

**Query Script**: ⚠️ Need new `get-player-profile.js` script

**Gaps**: Birth date field, career stats aggregation

---

## 📱 PAGE 5: STANDINGS - League Standings

### What We Want to Display

```typescript
interface StandingsPageData {
  season: number
  week: number
  lastUpdated: string

  conferences: {
    [conference: string]: {
      [division: string]: DivisionStanding[]
    }
  }
}

interface DivisionStanding {
  rank: number
  team: {
    id: string
    abbr: string
    name: string
    logo: string
  }

  record: {
    wins: number
    losses: number
    ties: number
    winPct: number
  }

  divisionRecord: string     // "2-1"
  conferenceRecord: string   // "3-1"

  pointsFor: number
  pointsAgainst: number
  pointDiff: number

  streak: string             // "W3" or "L2"

  last5: string              // "3-2"

  divisionRank: number
  conferenceRank: number
  playoffSeed?: number       // Top 7 per conference
}
```

### Data Source Mapping

| Field | Source | Status |
|-------|--------|--------|
| Basic record | Calculate from `games` | ⚠️ Need query |
| Division/conference record | Calculate from `games` (filter by opponent division/conference) | ⚠️ Need complex query |
| `streak` | Calculate from recent `games` | ⚠️ Need logic |
| `last5` | Calculate from last 5 games | ⚠️ Need logic |
| Rankings | Calculate after sorting | ⚠️ Need logic |

**Query Script**: ⚠️ Need new `get-standings.js` script (or enhance existing standings-scraper.js)

**Gaps**: Complex record calculations

---

## 📱 PAGE 6: STATS LEADERS - Top Performers

### What We Want to Display

```typescript
interface LeadersPageData {
  season: number
  week: number

  categories: {
    passing: {
      yards: Leader[]
      touchdowns: Leader[]
      rating: Leader[]
      completionPct: Leader[]
    }
    rushing: {
      yards: Leader[]
      touchdowns: Leader[]
      yardsPerAttempt: Leader[]
    }
    receiving: {
      receptions: Leader[]
      yards: Leader[]
      touchdowns: Leader[]
    }
    defense: {
      tackles: Leader[]
      sacks: Leader[]
      interceptions: Leader[]
    }
    fantasy: {
      standardPoints: Leader[]
      pprPoints: Leader[]
    }
  }
}

interface Leader {
  rank: number
  playerId: string
  name: string
  position: string
  team: string
  teamLogo: string
  headshot?: string
  value: number
  gamesPlayed: number
  perGameAvg?: number
}
```

### Data Source Mapping

| Field | Source | Status |
|-------|--------|--------|
| All stat values | `player_season_cumulative_stats` | ✅ Available |
| Player info | `players` table | ✅ Available |
| Team info | `teams` via `player_teams` | ✅ Available |

**Query Script**: ⚠️ Need new `get-leaderboard.js` script

**Gaps**: None - all data exists, just need ranking queries

---

## 📊 COMPREHENSIVE GAP ANALYSIS

### ✅ Data We Have (Confirmed)

| Data Type | Records | Coverage |
|-----------|---------|----------|
| Games | 272 | Full season |
| Completed games | 106 | 39% of season |
| Teams | 32 | 100% (after normalization) |
| Players | 2,571 | Complete |
| Player-team links | 2,538 | All 32 teams |
| Player game stats | 6,842 | All completed games |
| Team game stats | 212 | All completed games |
| Scoring plays | 917 | All games |
| Season cumulative stats | 1,516 | Active players |
| Roster transactions | 2,161 | Full history |
| Game rosters | 5,995 | All active players per game |

### ⚠️ Queries/Scripts We Need to Build

| Script | Purpose | Effort | Priority |
|--------|---------|--------|----------|
| `calculate-team-record.js` | Calculate W-L-T from games | 2 hours | HIGH |
| `calculate-standings.js` | Full standings with ranks, streaks | 4 hours | HIGH |
| `get-team-profile.js` | Aggregate team page data | 3 hours | HIGH |
| `get-player-profile.js` | Aggregate player page data | 3 hours | MEDIUM |
| `get-leaderboard.js` | Rank players by stat category | 2 hours | MEDIUM |
| `get-schedule.js` | Format season schedule | 1 hour | LOW |

**Total Effort**: ~15 hours to build all missing query scripts

### ❓ Data We Need to Verify

| Data | Table | Status | Action |
|------|-------|--------|--------|
| Injury reports | `player_injury_status` | Exists but unknown if populated | Run injuries-scraper.js |
| Standings | `standings` | Unknown if exists | Check schema |
| Player birth dates | `players.birth_date` | Unknown if in schema | Check schema |

### ❌ Data We Don't Have (Cannot Get)

| Data | Reason | Workaround |
|------|--------|-----------|
| Live game clock | ESPN API, not stored | Poll ESPN during games (future) |
| Live possession | ESPN API, not stored | Poll ESPN during games (future) |
| Draft information | Not in schema | Add to schema (future) |

---

## 🎯 RECOMMENDED APPROACH

### Phase 1: Verify Schema & Data (30 minutes)
```bash
# Check if these exist
1. Does standings table exist?
2. Does players have birth_date column?
3. Is player_injury_status populated?
```

### Phase 2: Build Core Calculation Scripts (6-8 hours)
**Priority Order**:
1. ✅ `calculate-team-record.js` - Needed for game pages AND team pages
2. ✅ `calculate-standings.js` - Needed for standings page
3. ✅ `get-team-profile.js` - Complete team pages
4. `get-leaderboard.js` - Stats leaders page
5. `get-player-profile.js` - Player pages
6. `get-schedule.js` - Schedule page

### Phase 3: Test Against Display Requirements (2 hours)
- Generate sample output for each page
- Verify all required fields present
- Check for null/missing data

### Phase 4: Frontend Integration (Separate)
- Create TypeScript interfaces
- Build Next.js data fetching layer
- Connect components

---

## 🔍 NEXT DECISION POINT

**Question**: Which pages should we prioritize for Phase 2?

**Option A - Core Fan Experience** (Build these first):
1. Home (scoreboard) - Already works
2. Game (full game view) - 80% working
3. Team profile - Need new script
4. Standings - Need calculation

**Option B - Stats Focus** (Different priority):
1. Home
2. Stats Leaders
3. Player profiles
4. Fantasy-focused

**Recommendation**: Start with **Option A** since game pages and team pages are most commonly visited.

---

**Ready to proceed?** Let's verify the schema first, then build the missing calculation scripts.
