# Games Table - Raw Data Source Mapping

> **Purpose**: Maps each database field to its raw data source
> **Date Generated**: October 22, 2025
> **Data Sources**: ESPN API Scoreboard + Game Summary

---

## Field-by-Field Source Mapping

### Identification Fields (3 columns)

#### 1. game_id
- **Database Column**: `game_id`
- **Data Type**: VARCHAR(50)
- **Raw Source**: ESPN API game ID
- **API Path**: `competitions[0].id` OR `event.id`
- **Transformation**: Prefix with "espn-"
- **Example Raw**: `"401772510"`
- **Example Stored**: `"espn-401772510"`
- **Script**: `04-schedule.js` line 100 + `live-games-scraper.js` line 75

#### 2. season
- **Database Column**: `season`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API season year
- **API Path**: `season.year`
- **Transformation**: parseInt()
- **Example Raw**: `"2025"`
- **Example Stored**: `2025`
- **Script**: `04-schedule.js` (SEASON_YEAR constant)

#### 3. week
- **Database Column**: `week`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API week number
- **API Path**: `week.number`
- **Transformation**: parseInt()
- **Example Raw**: `"7"`
- **Example Stored**: `7`
- **Script**: `04-schedule.js` line 56-61 (regular season) / line 65-75 (playoffs)

---

### Game Timing Fields (4 columns)

#### 4. game_type
- **Database Column**: `game_type`
- **Data Type**: ENUM (season_type)
- **Raw Source**: ESPN API season type parameter
- **API Path**: Function parameter (seasonType)
- **Transformation**: Map 1='preseason', 2='regular', 3='postseason'
- **Example Raw**: `2` (API parameter)
- **Example Stored**: `"regular"`
- **Script**: `04-schedule.js` line 58 (regular), line 67 (playoffs)
- **Note**: Season type passed as parameter to fetchSchedule()

#### 5. game_date
- **Database Column**: `game_date`
- **Data Type**: DATE
- **Raw Source**: ESPN API competition date
- **API Path**: `competitions[0].date`
- **Transformation**: Extract date from ISO timestamp
- **Example Raw**: `"2025-10-20T17:00:00Z"`
- **Example Stored**: `"2025-10-20"`
- **Script**: `espn-api.js` transformGameData()

#### 6. game_time
- **Database Column**: `game_time`
- **Data Type**: TIME
- **Raw Source**: ESPN API competition date
- **API Path**: `competitions[0].date`
- **Transformation**: Extract time from ISO timestamp
- **Example Raw**: `"2025-10-20T17:00:00Z"`
- **Example Stored**: `"17:00:00"`
- **Script**: `espn-api.js` transformGameData()

#### 7. overtime
- **Database Column**: `overtime`
- **Data Type**: BOOLEAN
- **Raw Source**: Inferred from period
- **API Path**: `competitions[0].status.period`
- **Transformation**: period > 4 → true
- **Example Raw**: `5` (period)
- **Example Stored**: `true`
- **Script**: `live-games-scraper.js` (inferred from period)
- **Note**: Default false, set to true if game goes to OT

---

### Teams & Scores Fields (6 columns)

#### 8. home_team_id
- **Database Column**: `home_team_id`
- **Data Type**: VARCHAR(10)
- **Raw Source**: ESPN API home competitor
- **API Path**: `competitions[0].competitors.find(c => c.homeAway === 'home').team.abbreviation`
- **Transformation**: None (direct)
- **Example Raw**: `"PIT"`
- **Example Stored**: `"PIT"`
- **Script**: `espn-api.js` transformGameData()

#### 9. away_team_id
- **Database Column**: `away_team_id`
- **Data Type**: VARCHAR(10)
- **Raw Source**: ESPN API away competitor
- **API Path**: `competitions[0].competitors.find(c => c.homeAway === 'away').team.abbreviation`
- **Transformation**: None (direct)
- **Example Raw**: `"CIN"`
- **Example Stored**: `"CIN"`
- **Script**: `espn-api.js` transformGameData()

#### 10. home_score
- **Database Column**: `home_score`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API home competitor score
- **API Path**: `competitors.find(c => c.homeAway === 'home').score`
- **Transformation**: parseInt() or NULL if scheduled
- **Example Raw**: `"28"`
- **Example Stored**: `28`
- **Script**: `live-games-scraper.js` line 71

#### 11. away_score
- **Database Column**: `away_score`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API away competitor score
- **API Path**: `competitors.find(c => c.homeAway === 'away').score`
- **Transformation**: parseInt() or NULL if scheduled
- **Example Raw**: `"24"`
- **Example Stored**: `24`
- **Script**: `live-games-scraper.js` line 72

#### 12. status
- **Database Column**: `status`
- **Data Type**: ENUM (game_status)
- **Raw Source**: ESPN API competition status
- **API Path**: `competitions[0].status.type.completed` and `status.type.state`
- **Transformation**: Map ESPN status to enum
- **Example Raw**: `{completed: true, state: 'post'}`
- **Example Stored**: `"final"`
- **Script**: `live-games-scraper.js` line 62-68
- **Mapping**:
  ```javascript
  if (status.type.completed) return 'final'
  if (status.type.state === 'in') return 'in_progress'
  return 'scheduled'
  ```

#### 13. duration_minutes
- **Database Column**: `duration_minutes`
- **Data Type**: INTEGER
- **Raw Source**: Not provided by ESPN
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated
- **Note**: Would need start/end timestamps to calculate

---

### Quarter Scores Fields (10 columns)

#### 14-18. Home Quarter Scores
- **Database Columns**: `home_q1_score`, `home_q2_score`, `home_q3_score`, `home_q4_score`, `home_ot_score`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API game summary linescores
- **API Path**: `gameSummary.header.competitions[0].competitors.find(c => c.homeAway === 'home').linescores`
- **Transformation**: Extract from linescores array by index
- **Example Raw**: `[{value: 7}, {value: 14}, {value: 0}, {value: 7}]`
- **Example Stored**: `home_q1_score: 7, home_q2_score: 14, home_q3_score: 0, home_q4_score: 7`
- **Script**: `game-stats-scraper.js` extractQuarterScores()
- **Note**: Only populated when game status = 'final'

#### 19-23. Away Quarter Scores
- **Database Columns**: `away_q1_score`, `away_q2_score`, `away_q3_score`, `away_q4_score`, `away_ot_score`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API game summary linescores
- **API Path**: `gameSummary.header.competitions[0].competitors.find(c => c.homeAway === 'away').linescores`
- **Transformation**: Extract from linescores array by index
- **Example Raw**: `[{value: 3}, {value: 7}, {value: 7}, {value: 7}]`
- **Example Stored**: `away_q1_score: 3, away_q2_score: 7, away_q3_score: 7, away_q4_score: 7`
- **Script**: `game-stats-scraper.js` extractQuarterScores()

**Linescores Array Structure**:
```json
{
  "linescores": [
    {"value": 7},   // Q1
    {"value": 14},  // Q2
    {"value": 0},   // Q3
    {"value": 7},   // Q4
    {"value": 3}    // OT (if applicable)
  ]
}
```

---

### Venue & Location Fields (2 columns)

#### 24. stadium_id
- **Database Column**: `stadium_id`
- **Data Type**: VARCHAR(50)
- **Raw Source**: ESPN API venue information
- **API Path**: `competitions[0].venue.id` (converted to slug)
- **Transformation**: Convert venue name to slug format
- **Example Raw**: `{id: "3800", fullName: "Acrisure Stadium"}`
- **Example Stored**: `"acrisure-stadium"`
- **Script**: `game-stats-scraper.js` extractAndUpsertVenue()
- **Note**: Auto-creates stadium if missing

#### 25. attendance
- **Database Column**: `attendance`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API venue attendance
- **API Path**: `competitions[0].attendance`
- **Transformation**: parseInt()
- **Example Raw**: `"68,500"`
- **Example Stored**: `68500`
- **Script**: `game-stats-scraper.js` (from game summary)

---

### Broadcast & Context Fields (2 columns)

#### 26. broadcast_network
- **Database Column**: `broadcast_network`
- **Data Type**: VARCHAR(50)
- **Raw Source**: ESPN API broadcast information
- **API Path**: `competitions[0].broadcasts[0].names[0]`
- **Transformation**: None (direct)
- **Example Raw**: `"CBS"`
- **Example Stored**: `"CBS"`
- **Script**: `espn-api.js` transformGameData()
- **Note**: Common values: CBS, FOX, NBC, ESPN, ABC, NFL Network

#### 27. playoff_round
- **Database Column**: `playoff_round`
- **Data Type**: VARCHAR(50)
- **Raw Source**: ESPN API playoff information
- **API Path**: `week.text` (for playoff games)
- **Transformation**: Extract round name
- **Example Raw**: `"Wild Card Round"`
- **Example Stored**: `"Wild Card"`
- **Script**: `04-schedule.js` (for playoff games only)
- **Note**: NULL for regular season games

---

### Metadata Fields (3 columns)

#### 28. created_at
- **Database Column**: `created_at`
- **Data Type**: TIMESTAMPTZ
- **Raw Source**: Database auto-generated
- **API Path**: N/A
- **Transformation**: `NOW()`
- **Example Raw**: N/A
- **Example Stored**: `"2025-10-01T00:00:00.123Z"`
- **Script**: Database default

#### 29. updated_at
- **Database Column**: `updated_at`
- **Data Type**: TIMESTAMPTZ
- **Raw Source**: Database auto-generated
- **API Path**: N/A
- **Transformation**: `NOW()` on every update
- **Example Raw**: N/A
- **Example Stored**: `"2025-10-20T16:30:00.123Z"`
- **Script**: Database default

#### 30. deleted_at
- **Database Column**: `deleted_at`
- **Data Type**: TIMESTAMPTZ
- **Raw Source**: Database managed
- **API Path**: N/A
- **Transformation**: NULL (soft delete timestamp)
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Database default (NULL by default)

---

### Legacy/Deprecated Fields (1 column)

#### 31. weather_id
- **Database Column**: `weather_id`
- **Data Type**: VARCHAR(50)
- **Raw Source**: Deprecated (now in game_weather table)
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated
- **Note**: Weather data now in separate game_weather table

---

## ESPN API Endpoints

### Schedule/Scoreboard Endpoint
```
https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard
?dates={YYYYMMDD}
&seasontype={1|2|3}
&week={week_number}
```

**Parameters**:
- `dates`: Optional date filter (YYYYMMDD format)
- `seasontype`: 1=preseason, 2=regular, 3=postseason
- `week`: Week number (1-18 for regular, 1-5 for playoffs)

**Example**: Fetch Week 7 regular season games
```
https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?seasontype=2&week=7
```

### Game Summary Endpoint
```
https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={game_id}
```

**Used For**: Quarter scores, detailed stats, weather, venue details

---

## ESPN API Response Structure

### Scoreboard Response (Schedule)
```json
{
  "leagues": [...],
  "season": {
    "year": 2025,
    "type": 2
  },
  "week": {
    "number": 7
  },
  "events": [
    {
      "id": "401772510",
      "name": "Cincinnati Bengals at Pittsburgh Steelers",
      "season": {
        "year": 2025
      },
      "week": {
        "number": 7
      },
      "competitions": [
        {
          "id": "401772510",
          "date": "2025-10-20T17:00:00Z",
          "attendance": 68500,
          "status": {
            "type": {
              "completed": true,
              "state": "post"
            },
            "period": 4,
            "displayClock": "0:00"
          },
          "competitors": [
            {
              "id": "23",
              "team": {
                "id": "23",
                "abbreviation": "PIT",
                "displayName": "Pittsburgh Steelers"
              },
              "homeAway": "home",
              "score": "28"
            },
            {
              "id": "4",
              "team": {
                "id": "4",
                "abbreviation": "CIN",
                "displayName": "Cincinnati Bengals"
              },
              "homeAway": "away",
              "score": "24"
            }
          ],
          "broadcasts": [
            {
              "names": ["CBS"]
            }
          ],
          "venue": {
            "id": "3800",
            "fullName": "Acrisure Stadium"
          }
        }
      ]
    }
  ]
}
```

### Game Summary Response (Quarter Scores)
```json
{
  "header": {
    "competitions": [
      {
        "competitors": [
          {
            "id": "23",
            "homeAway": "home",
            "team": {
              "abbreviation": "PIT"
            },
            "score": "28",
            "linescores": [
              {"value": 7},   // Q1
              {"value": 14},  // Q2
              {"value": 0},   // Q3
              {"value": 7}    // Q4
            ]
          },
          {
            "id": "4",
            "homeAway": "away",
            "team": {
              "abbreviation": "CIN"
            },
            "score": "24",
            "linescores": [
              {"value": 3},   // Q1
              {"value": 7},   // Q2
              {"value": 7},   // Q3
              {"value": 7}    // Q4
            ]
          }
        ]
      }
    ]
  }
}
```

---

## Data Source Scripts

### Seed Script (Initial Load)
**File**: `scripts/seed/04-schedule.js`
**Purpose**: Load full 2025 season schedule (272 games)
**Populates**:
- game_id, season, week, game_type
- game_date, game_time
- home_team_id, away_team_id
- broadcast_network
- status (all 'scheduled' initially)

**Process**:
```javascript
// Regular season: 18 weeks
for (let week = 1; week <= 18; week++) {
  const weekGames = await fetchSchedule(2025, 2, week)
  allGames.push(...weekGames)
}

// Playoffs: 5 weeks
for (let week = 1; week <= 5; week++) {
  const weekGames = await fetchSchedule(2025, 3, week)
  allGames.push(...weekGames)
}

// Transform and insert
const transformedGames = allGames.map(transformGameData)
await upsertBatch('games', transformedGames)
```

### Live Scraper (Updates)
**File**: `scripts/scrapers/live-games-scraper.js`
**Purpose**: Update scores and status in real-time
**Updates**:
- status (scheduled → in_progress → final)
- home_score, away_score
- updated_at

**Process**:
```javascript
// Fetch current week scoreboard
const weekGames = await fetchSchedule(2025, 2, currentWeek)

// Extract updates
const updates = weekGames.map(game => ({
  game_id: `espn-${game.id}`,
  status: determineStatus(game),
  home_score: parseInt(homeTeam.score),
  away_score: parseInt(awayTeam.score)
}))

// Upsert to database
await upsertBatch('games', updates)

// Trigger stats scraper for newly completed games
const newlyCompleted = await findNewlyCompletedGames(updates)
await scrapeCompletedGameStats(newlyCompleted)
```

### Game Stats Scraper (Quarter Scores)
**File**: `scripts/scrapers/game-stats-scraper.js`
**Purpose**: Add detailed data after game completes
**Populates**:
- home_q1_score through home_ot_score
- away_q1_score through away_ot_score
- stadium_id
- attendance
- overtime flag

**Process**:
```javascript
// Fetch game summary
const gameSummary = await fetchGameSummary(gameId)

// Extract quarter scores from linescores
const competition = gameSummary.header.competitions[0]
const homeTeam = competition.competitors.find(c => c.homeAway === 'home')
const awayTeam = competition.competitors.find(c => c.homeAway === 'away')

const quarterScores = {
  home_q1_score: homeTeam.linescores[0]?.value || 0,
  home_q2_score: homeTeam.linescores[1]?.value || 0,
  home_q3_score: homeTeam.linescores[2]?.value || 0,
  home_q4_score: homeTeam.linescores[3]?.value || 0,
  home_ot_score: homeTeam.linescores[4]?.value || 0,
  away_q1_score: awayTeam.linescores[0]?.value || 0,
  away_q2_score: awayTeam.linescores[1]?.value || 0,
  away_q3_score: awayTeam.linescores[2]?.value || 0,
  away_q4_score: awayTeam.linescores[3]?.value || 0,
  away_ot_score: awayTeam.linescores[4]?.value || 0
}

// Update game record
await supabase
  .from('games')
  .update(quarterScores)
  .eq('game_id', gameId)
  .eq('season', 2025)
```

---

## Field Population Summary

| Field | ESPN Schedule | ESPN Summary | Calculated | Database |
|-------|---------------|--------------|------------|----------|
| game_id | ✅ | ✅ | | |
| season | ✅ | | | |
| week | ✅ | | | |
| game_type | ✅ | | | |
| game_date | ✅ | | | |
| game_time | ✅ | | | |
| overtime | | | ✅ | |
| home_team_id | ✅ | ✅ | | |
| away_team_id | ✅ | ✅ | | |
| home_score | ✅ | ✅ | | |
| away_score | ✅ | ✅ | | |
| status | ✅ | ✅ | | |
| duration_minutes | | | | ❌ NULL |
| home_q1-q4_score | | ✅ | | |
| home_ot_score | | ✅ | | |
| away_q1-q4_score | | ✅ | | |
| away_ot_score | | ✅ | | |
| stadium_id | | ✅ | | |
| attendance | | ✅ | | |
| broadcast_network | ✅ | | | |
| playoff_round | ✅ | | | |
| created_at | | | | ✅ |
| updated_at | | | | ✅ |
| deleted_at | | | | ✅ |
| weather_id | | | | ❌ NULL |

**Summary**: 19 from ESPN, 1 calculated, 3 database, 2 always NULL

---

## Data Quality Notes

### Fields Always Populated
- Identification (game_id, season, week)
- Game timing (game_date, game_type)
- Teams (home_team_id, away_team_id)
- Status
- Metadata (created_at, updated_at)

### Fields Populated After Game
- Scores (home_score, away_score)
- Quarter scores (all 10 columns)
- Stadium and attendance
- Overtime flag

### Fields Sometimes NULL
- game_time (TBD games)
- broadcast_network (not always announced)
- playoff_round (regular season games)

### Fields Always NULL
- duration_minutes (not provided by ESPN)
- weather_id (deprecated, moved to game_weather table)

---

## Performance Metrics

### Execution Times
- **Schedule seed**: ~20-30 seconds (272 games, 1 req/sec)
- **Live scraper**: ~500ms per week (16 games)
- **Quarter score update**: ~200ms per game

### Data Volume
- **2025 Season**: 272 games total
- **Regular Season**: 272 games (18 weeks × 16 games, no byes yet)
- **Playoffs**: TBD (Wild Card, Divisional, Conference, Super Bowl)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-01 | Initial games table with 19 columns |
| 1.1 | 2025-10-18 | Added quarter score columns (10 columns) |
| 1.2 | 2025-10-22 | Raw data source mapping created |

---

## References

- **Seed Script**: `scripts/seed/04-schedule.js`
- **Live Scraper**: `scripts/scrapers/live-games-scraper.js`
- **Game Stats Scraper**: `scripts/scrapers/game-stats-scraper.js`
- **ESPN API Wrapper**: `scripts/utils/espn-api.js`
- **Migration (Base)**: `supabase/migrations/20250101000004_create_core_entity_tables.sql`
- **Migration (Quarters)**: `supabase/migrations/20250101000012_add_quarter_scores.sql`

---

**Last Updated**: October 22, 2025
**Data Sources**: ESPN Scoreboard API + Game Summary API
**Total Fields**: 29 (19 from ESPN Schedule, 10 quarter scores from Summary, 1 calculated, 3 database, 2 NULL)
**Automation**: ✅ Fully automated (schedule seed → live updates → quarter scores)
