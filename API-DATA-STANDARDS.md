# API DATA STANDARDS

> **Purpose**: Standard data formats for the new Next.js app
> **Created**: October 22, 2025
> **Status**: Foundation - Ready for Implementation

---

## 📋 OVERVIEW

This document defines the **standard JSON formats** the Next.js frontend will consume.

**Approach**:
1. ✅ Inventory what data we currently have access to
2. ✅ Define clean, consistent TypeScript interfaces
3. ✅ Map backend tables → frontend standards
4. Next: Build API endpoints that return these formats

---

## 🎯 6 STANDARD API ENDPOINTS

```
GET /api/scoreboard?week=7               → Scoreboard data
GET /api/game/:id                         → Full game details
GET /api/team/:id                         → Team profile
GET /api/player/:id                       → Player profile
GET /api/standings?week=7                 → League standings
GET /api/leaders?category=passing_yards   → Stats leaders
```

---

## 1️⃣ SCOREBOARD API

### Endpoint: `GET /api/scoreboard?week={week}`

### Standard Format
```typescript
interface ScoreboardResponse {
  meta: {
    season: number
    week: number
    currentWeek: number
    totalGames: number
  }

  games: Game[]
}

interface Game {
  id: string                    // "espn-401772510"
  status: 'scheduled' | 'in_progress' | 'final'

  dateTime: {
    date: string                // "2025-09-29"
    time: string                // "13:00"
    timezone: string            // "ET"
    display: string             // "Sun, Sep 29 1:00 PM ET"
  }

  teams: {
    away: TeamSummary
    home: TeamSummary
  }

  broadcast: string | null      // "CBS"
  venue: string | null          // "Acrisure Stadium"
}

interface TeamSummary {
  id: string                    // "PIT"
  name: string                  // "Pittsburgh Steelers"
  abbr: string                  // "PIT"
  logo: string                  // URL
  score: number | null          // null if scheduled
  record: string | null         // "3-1" (optional)
}
```

### Data Sources
```javascript
// Backend mapping
{
  meta: {
    season: games.season,
    week: games.week,
    currentWeek: calculateCurrentWeek(),
    totalGames: COUNT(*)
  },

  games: [
    {
      id: games.game_id,
      status: games.status,
      dateTime: {
        date: games.game_date,
        time: games.game_time,
        // ... format helpers
      },
      teams: {
        away: {
          id: teams.team_id,         // via games.away_team_id
          name: teams.team_name,
          abbr: teams.team_abbr,
          logo: teams.logo_url,
          score: games.away_score,
          record: calculateRecord(team_id)  // Optional
        },
        home: { /* same */ }
      },
      broadcast: games.broadcast_network,
      venue: stadiums.stadium_name  // via games.stadium_id
    }
  ]
}
```

**✅ Data Available**: 100% (all fields in database)
**⚠️ Need**: `calculateRecord()` helper function

---

## 2️⃣ GAME API

### Endpoint: `GET /api/game/:id`

### Standard Format
```typescript
interface GameResponse {
  game: GameDetails
  teams: {
    away: TeamInGame
    home: TeamInGame
  }
  scoring: ScoringTimeline
  stats: {
    team: TeamStatsComparison
    players: PlayerStatsCollection
  }
}

interface GameDetails {
  id: string
  status: 'scheduled' | 'in_progress' | 'final'
  season: number
  week: number

  dateTime: {
    date: string
    time: string
    display: string
  }

  venue: {
    name: string
    city: string
    state: string
  } | null

  weather: {
    temperature: number          // Fahrenheit
    conditions: string           // "Partly Cloudy"
    wind: string                 // "5 mph NW"
  } | null

  broadcast: string | null
  attendance: number | null
}

interface TeamInGame {
  id: string
  name: string
  abbr: string
  logo: string
  colors: {
    primary: string
    secondary: string
  }

  score: {
    total: number
    quarters: number[]           // [Q1, Q2, Q3, Q4, OT?]
  }

  record: {
    wins: number
    losses: number
    ties: number
  } | null
}

interface ScoringTimeline {
  plays: ScoringPlay[]
}

interface ScoringPlay {
  id: number
  quarter: number
  clock: string                  // "8:23"
  team: {
    id: string
    abbr: string
    logo: string
  }
  description: string            // "Joe Burrow 5 yd pass to Ja'Marr Chase"
  scoreAfter: {
    away: number
    home: number
  }
}

interface TeamStatsComparison {
  categories: StatCategory[]
}

interface StatCategory {
  label: string                  // "Total Yards"
  away: number | string
  home: number | string
  winner: 'away' | 'home' | 'tie'
}

interface PlayerStatsCollection {
  passing: PlayerStat[]
  rushing: PlayerStat[]
  receiving: PlayerStat[]
  defense: PlayerStat[]
  kicking: PlayerStat[]
}

interface PlayerStat {
  player: {
    id: string
    name: string
    number: number | null
    position: string
    headshot: string | null
  }
  team: {
    id: string
    abbr: string
  }
  stats: Record<string, number | string>
}
```

### Data Sources
```javascript
// Backend tables used
{
  game: games,                             // ✅
  teams: teams,                            // ✅
  venue: stadiums,                         // ✅
  weather: game_weather,                   // ✅
  quarters: games (home_q1_score, etc.),   // ✅
  record: calculateRecord(team_id),        // ⚠️ Need function
  scoringPlays: scoring_plays,             // ✅
  teamStats: team_game_stats,              // ✅
  playerStats: player_game_stats           // ✅
}
```

**✅ Data Available**: 95% (missing only W-L record calculation)

---

## 3️⃣ TEAM API

### Endpoint: `GET /api/team/:id`

### Standard Format
```typescript
interface TeamResponse {
  team: TeamProfile
  season: SeasonSummary
  roster: RosterByPosition
  schedule: GameSchedule
  transactions: Transaction[]
  injuries: Injury[]
}

interface TeamProfile {
  id: string
  name: string
  abbr: string
  city: string

  branding: {
    logo: string
    colors: {
      primary: string
      secondary: string
    }
  }

  division: {
    conference: string           // "NFC"
    division: string             // "West"
  }

  venue: {
    name: string
    city: string
    capacity: number | null
  }

  founded: number | null
}

interface SeasonSummary {
  season: number
  record: {
    overall: { wins: number, losses: number, ties: number }
    home: { wins: number, losses: number, ties: number }
    away: { wins: number, losses: number, ties: number }
    division: { wins: number, losses: number, ties: number }
  }

  standings: {
    divisionRank: number         // 1-4
    conferenceRank: number       // 1-16
  }

  points: {
    for: number
    against: number
    differential: number
  }

  streak: {
    type: 'W' | 'L'
    count: number
    display: string              // "W3"
  }
}

interface RosterByPosition {
  [position: string]: RosterPlayer[]
}

interface RosterPlayer {
  id: string
  name: string
  number: number | null
  position: string

  bio: {
    height: string               // "6'3\""
    weight: number
    age: number | null
    college: string | null
    experience: string           // "5 years" or "Rookie"
  }

  status: 'active' | 'inactive' | 'injured'
  headshot: string | null

  seasonStats: {
    gamesPlayed: number
    keyStats: Record<string, number>  // Position-dependent
  } | null
}

interface GameSchedule {
  lastGame: GameSummary | null
  nextGame: GameSummary | null
  upcoming: GameSummary[]
}

interface GameSummary {
  id: string
  week: number
  opponent: {
    id: string
    abbr: string
    logo: string
  }
  location: 'home' | 'away'
  date: string
  time: string
  result: string | null          // "W 27-24" or null if not played
}

interface Transaction {
  id: number
  date: string
  type: 'addition' | 'removal'
  player: {
    name: string
    position: string
  }
}

interface Injury {
  player: {
    id: string
    name: string
    number: number | null
    position: string
  }
  status: 'out' | 'doubtful' | 'questionable' | 'probable'
  injury: string                 // "Ankle"
  lastUpdate: string
}
```

### Data Sources
```javascript
{
  team: teams,                                    // ✅
  venue: stadiums,                                // ✅
  record: calculateRecord(team_id),               // ⚠️ Need
  standings: calculateStandings(),                // ⚠️ Need
  streak: calculateStreak(team_id),               // ⚠️ Need
  roster: players + player_teams,                 // ✅
  seasonStats: player_season_cumulative_stats,    // ✅
  schedule: games,                                // ✅
  transactions: roster_transactions,              // ✅
  injuries: player_injury_status                  // ❓ Data unknown
}
```

**✅ Data Available**: 70% (need record/standings/streak calculations)

---

## 4️⃣ PLAYER API

### Endpoint: `GET /api/player/:id`

### Standard Format
```typescript
interface PlayerResponse {
  player: PlayerProfile
  currentSeason: SeasonStats
  gameLog: GameLogEntry[]
  career: CareerStats | null
}

interface PlayerProfile {
  id: string
  name: {
    full: string
    first: string
    last: string
  }

  number: number | null
  position: string

  team: {
    id: string
    abbr: string
    name: string
    logo: string
  }

  bio: {
    height: string
    weight: number
    age: number | null
    birthDate: string | null
    college: string | null
    draftYear: number | null
    draftRound: number | null
    draftPick: number | null
    experience: string
  }

  headshot: string | null
  status: 'active' | 'inactive' | 'injured'

  injury: {
    status: 'out' | 'doubtful' | 'questionable' | 'probable'
    description: string
  } | null
}

interface SeasonStats {
  season: number
  gamesPlayed: number
  gamesStarted: number | null

  stats: Record<string, number>  // Position-dependent stats

  fantasy: {
    standard: number
    ppr: number
    halfPpr: number
  }

  rankings: {
    position: number | null      // #5 among QBs
    overall: number | null       // #12 overall
  } | null
}

interface GameLogEntry {
  game: {
    id: string
    week: number
    date: string
    opponent: {
      id: string
      abbr: string
      logo: string
    }
    location: 'home' | 'away'
    result: string               // "W 27-24"
  }

  stats: Record<string, number>
  fantasyPoints: number
}

interface CareerStats {
  seasons: number
  gamesPlayed: number
  totals: Record<string, number>
  averages: Record<string, number>
}
```

### Data Sources
```javascript
{
  player: players,                              // ✅
  team: teams (via player_teams),               // ✅
  injury: player_injury_status,                 // ❓ Data unknown
  seasonStats: player_season_cumulative_stats,  // ✅
  gameLog: player_game_stats + games,           // ✅
  career: aggregate(player_game_stats)          // ⚠️ Need aggregation
}
```

**✅ Data Available**: 80% (need career aggregation, injury data unknown)

---

## 5️⃣ STANDINGS API

### Endpoint: `GET /api/standings?week={week}`

### Standard Format
```typescript
interface StandingsResponse {
  meta: {
    season: number
    week: number
    lastUpdated: string
  }

  conferences: {
    [conference: string]: ConferenceStandings
  }
}

interface ConferenceStandings {
  divisions: {
    [division: string]: DivisionStanding[]
  }
}

interface DivisionStanding {
  rank: number                   // 1-4 in division

  team: {
    id: string
    abbr: string
    name: string
    logo: string
  }

  record: {
    overall: { wins: number, losses: number, ties: number }
    home: { wins: number, losses: number, ties: number }
    away: { wins: number, losses: number, ties: number }
    division: { wins: number, losses: number, ties: number }
    conference: { wins: number, losses: number, ties: number }
    winPct: number
  }

  points: {
    for: number
    against: number
    differential: number
  }

  streak: {
    type: 'W' | 'L'
    count: number
    display: string
  }

  last5: string                  // "3-2"

  divisionRank: number           // 1-4
  conferenceRank: number         // 1-16
  playoffSeed: number | null     // 1-7 or null
}
```

### Data Sources
```javascript
{
  teams: teams,                      // ✅
  record: calculateRecord(),         // ⚠️ Need
  points: SUM(games.score),          // ⚠️ Need
  streak: calculateStreak(),         // ⚠️ Need
  last5: calculateLast5(),           // ⚠️ Need
  ranks: calculateRanks()            // ⚠️ Need
}
```

**✅ Data Available**: 30% (most calculations needed)

---

## 6️⃣ LEADERS API

### Endpoint: `GET /api/leaders?category={category}&limit={limit}`

### Standard Format
```typescript
interface LeadersResponse {
  meta: {
    season: number
    week: number
    category: string
    limit: number
  }

  leaders: Leader[]
}

interface Leader {
  rank: number

  player: {
    id: string
    name: string
    position: string
    headshot: string | null
  }

  team: {
    id: string
    abbr: string
    logo: string
  }

  stats: {
    value: number              // The stat being ranked
    gamesPlayed: number
    perGameAvg: number
  }
}
```

### Data Sources
```javascript
{
  leaders: player_season_cumulative_stats  // ✅
    .orderBy(category, 'desc')
    .limit(limit),

  player: players,                         // ✅
  team: teams (via player_teams)           // ✅
}
```

**✅ Data Available**: 100% (just need ranking query)

---

## 📊 DATA AVAILABILITY SUMMARY

| API Endpoint | Data Ready | Missing Components |
|--------------|-----------|-------------------|
| **Scoreboard** | ✅ 100% | Optional: team records |
| **Game** | ✅ 95% | Team W-L records |
| **Team** | ⚠️ 70% | Record calculations, standings, streaks |
| **Player** | ⚠️ 80% | Career aggregation, injury data |
| **Standings** | ⚠️ 30% | All calculations needed |
| **Leaders** | ✅ 100% | Just ranking queries |

---

## 🔧 REQUIRED BACKEND FUNCTIONS

### 1. calculateRecord(teamId, season, upToWeek?)
```typescript
interface TeamRecord {
  wins: number
  losses: number
  ties: number
  winPct: number
  pointsFor: number
  pointsAgainst: number
  pointDiff: number
  home: { wins: number, losses: number, ties: number }
  away: { wins: number, losses: number, ties: number }
  division: { wins: number, losses: number, ties: number }
  conference: { wins: number, losses: number, ties: number }
}
```
**Source**: Calculate from `games` table

### 2. calculateStreak(teamId, season, upToWeek?)
```typescript
interface Streak {
  type: 'W' | 'L'
  count: number
  display: string  // "W3"
}
```
**Source**: Get last N games from `games` table, find streak

### 3. calculateStandings(season, week)
```typescript
interface Standings {
  [teamId: string]: {
    divisionRank: number
    conferenceRank: number
    playoffSeed: number | null
  }
}
```
**Source**: Calculate records, then rank

### 4. calculateLast5(teamId, season, upToWeek)
```typescript
string  // "3-2"
```
**Source**: Get last 5 games, calculate W-L

---

## 🎯 IMPLEMENTATION PLAN

### Phase 1: Core Calculations (High Priority)
1. **Build**: `lib/calculations/team-record.ts`
2. **Build**: `lib/calculations/standings.ts`
3. **Build**: `lib/calculations/streaks.ts`

### Phase 2: API Routes (Next.js)
1. **Create**: `app/api/scoreboard/route.ts`
2. **Create**: `app/api/game/[id]/route.ts`
3. **Create**: `app/api/team/[id]/route.ts`
4. **Create**: `app/api/player/[id]/route.ts`
5. **Create**: `app/api/standings/route.ts`
6. **Create**: `app/api/leaders/route.ts`

### Phase 3: TypeScript Types
1. **Create**: `types/api.ts` with all interfaces from this document
2. **Export**: Standard types for frontend consumption

---

## ✅ STANDARDS ESTABLISHED

This document defines:
- ✅ 6 standard API endpoints
- ✅ TypeScript interfaces for all responses
- ✅ Backend data source mapping
- ✅ 4 required calculation functions
- ✅ Implementation priority order

**Next Step**: Move to new Next.js app and implement these standards.
