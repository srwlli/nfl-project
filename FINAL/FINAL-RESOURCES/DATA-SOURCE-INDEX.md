# DATA SOURCE INDEX

Complete mapping of what data we have and where it comes from.

**Last Updated**: October 22, 2025
**Data Coverage**: 106/272 completed games (39% of 2025 season)

---

## 📊 DATA INVENTORY BY SOURCE

### **1. TEAMS DATA**

**Database Table**: `teams`
**Record Count**: 33 (32 NFL teams + 1 alias)
**Source Script**: `scripts/seed/01-teams.js`
**Populated By**: Manual seed (one-time)

**Available Fields**:
```javascript
{
  team_id: "SEA",                    // Primary key
  team_name: "Seattle Seahawks",
  team_abbr: "SEA",                  // ⚠️ NOT team_abbreviation
  city: "Seattle",
  conference: "NFC",
  division: "West",
  team_color: "#002244",
  secondary_color: "#69BE28",
  logo_url: "https://...",
  founded_year: 1976,
  stadium_id: "lumen-field"
}
```

**NPM Scripts**: `npm run seed:teams`
**Output Example**: `npm run roster:team -- --team=SEA`

---

### **2. PLAYERS DATA**

**Database Tables**:
- `players` (2,571 records) - Player profiles
- `player_teams` (2,538 records) - Current roster assignments

**Source Scripts**:
- `scripts/seed/03-players.js` - Initial player load
- `scripts/scrapers/roster-updates-scraper.js` - Daily roster updates
- `scripts/utils/player-creator.js` - Auto-create missing players

**Populated By**:
- Initial seed (one-time)
- Daily roster scraper (5:00 PM ET)
- Auto-creation during game stats processing

**Available Fields (players table)**:
```javascript
{
  player_id: "espn-4361529",         // Primary key
  full_name: "Sam Darnold",
  first_name: "Sam",
  last_name: "Darnold",
  primary_position: "QB",            // ⚠️ NOT position
  height_inches: 75,                 // 6'3"
  weight_lbs: 225,
  birth_date: "1997-06-05",
  college: "USC",
  rookie_year: 2018,
  draft_year: 2018,
  draft_round: 1,
  draft_pick: 3,
  headshot_url: "https://...",
  status: "active"                   // Enum: active/inactive/injured
}
```

**Available Fields (player_teams table)**:
```javascript
{
  player_team_id: 1,
  player_id: "espn-4361529",
  team_id: "SEA",
  start_season: 2025,
  end_season: null,                  // null = currently on team
  jersey_number: 14
}
```

**NPM Scripts**:
- `npm run seed:players`
- `npm run scrape:roster`
- `npm run roster:team -- --team=SEA`

**Query Pattern**:
```javascript
// ⚠️ CORRECT: Use start_season/end_season
.eq('team_id', 'SEA')
.lte('start_season', 2025)
.or('end_season.is.null,end_season.gte.2025')

// ❌ WRONG: player_teams.season doesn't exist
.eq('season', 2025)
```

---

### **3. GAMES DATA**

**Database Table**: `games`
**Record Count**: 272 total (106 completed, 166 scheduled)
**Source Script**: `scripts/seed/04-schedule.js`
**Populated By**:
- Initial seed (one-time)
- Game stats scraper updates scores/status

**Available Fields**:
```javascript
{
  game_id: "espn-401772510",         // Primary key
  season: 2025,
  week: 4,
  season_type: "regular",            // Enum: preseason/regular/postseason
  game_date: "2025-09-29",
  game_time: "13:00:00",
  status: "final",                   // Enum: scheduled/in_progress/final

  // Teams
  home_team_id: "PIT",
  away_team_id: "CIN",

  // Scores
  home_score: 31,
  away_score: 33,

  // Quarter Scores (added in Session 2)
  home_q1_score: 10,
  home_q2_score: 7,
  home_q3_score: 7,
  home_q4_score: 7,
  home_ot_score: null,
  away_q1_score: 3,
  away_q2_score: 10,
  away_q3_score: 13,
  away_q4_score: 7,
  away_ot_score: null,

  // Metadata
  overtime: false,
  stadium_id: "acrisure-stadium",
  broadcast_network: "CBS",
  attendance: 68400
}
```

**NPM Scripts**:
- `npm run seed:schedule`
- `npm run scoreboard -- --week=4`
- `npm run scrape:game-stats -- --week=4`

**Output Examples**:
- `npm run scoreboard -- --week=4` - All 16 Week 4 games with scores
- `npm run scoreboard:page` - HTML scoreboard with auto-refresh

---

### **4. PLAYER GAME STATISTICS**

**Database Table**: `player_game_stats`
**Record Count**: 6,842 records
**Source Script**: `scripts/scrapers/game-stats-scraper.js`
**Populated By**:
- Manual scrape: `npm run scrape:game-stats -- --week=X`
- Auto-triggered by live-games-scraper when game completes

**Available Fields** (75 total columns):
```javascript
{
  stat_id: 12345,
  player_id: "espn-4361529",
  game_id: "espn-401772510",
  team_id: "SEA",
  season: 2025,
  week: 4,

  // Passing (10 fields)
  passing_completions: 25,
  passing_attempts: 35,
  passing_yards: 289,
  passing_touchdowns: 2,
  passing_interceptions: 1,
  passing_sacks: 2,
  passing_sack_yards_lost: 15,
  passing_longest: 45,
  passing_rating: 95.3,
  passing_qbr: 68.5,

  // Rushing (8 fields)
  rushing_attempts: 5,
  rushing_yards: 23,
  rushing_touchdowns: 0,
  rushing_longest: 12,
  rushing_yards_after_contact: 15,
  rushing_fumbles: 0,
  rushing_fumbles_lost: 0,
  rushing_first_downs: 2,

  // Receiving (10 fields)
  receiving_receptions: 8,           // ⚠️ NOT receptions
  receiving_targets: 12,
  receiving_yards: 112,
  receiving_touchdowns: 1,
  receiving_longest: 34,
  receiving_yards_after_catch: 45,
  receiving_fumbles: 0,
  receiving_fumbles_lost: 0,
  receiving_first_downs: 5,
  receiving_drops: 1,

  // Defense (15 fields)
  defense_tackles: 8,
  defense_solo_tackles: 5,
  defense_assisted_tackles: 3,
  defense_tackles_for_loss: 2,
  defense_sacks: 1.5,
  defense_qb_hits: 3,
  defense_interceptions: 1,
  defense_interception_yards: 25,
  defense_interception_touchdowns: 0,
  defense_passes_defended: 2,
  defense_forced_fumbles: 1,
  defense_fumble_recoveries: 0,
  defense_fumble_recovery_yards: 0,
  defense_fumble_touchdowns: 0,
  defense_safeties: 0,

  // Kicking (8 fields)
  kicking_field_goals_made: 3,
  kicking_field_goals_attempted: 4,
  kicking_field_goal_pct: 75.0,
  kicking_longest_field_goal: 52,
  kicking_extra_points_made: 4,
  kicking_extra_points_attempted: 4,
  kicking_total_points: 13,
  kicking_touchbacks: 5,

  // Punting (6 fields)
  punting_punts: 5,
  punting_yards: 235,
  punting_average: 47.0,
  punting_longest: 58,
  punting_inside_20: 3,
  punting_touchbacks: 0,

  // Kick/Punt Returns (8 fields)
  kickoff_returns: 2,
  kickoff_return_yards: 45,
  kickoff_return_touchdowns: 0,
  kickoff_return_average: 22.5,
  punt_returns: 3,
  punt_return_yards: 28,
  punt_return_touchdowns: 0,
  punt_return_average: 9.3,

  // Fantasy Points (5 formats - added Session 4)
  fantasy_points_standard: 18.9,
  fantasy_points_ppr: 26.9,
  fantasy_points_half_ppr: 22.9,
  fantasy_points_draftkings: 28.5,
  fantasy_points_fanduel: 24.3
}
```

**NPM Scripts**:
- `npm run scrape:game-stats -- --week=4`
- `npm run scrape:game-stats -- --game=401772510`

**Coverage**: 106/106 completed games (100%)

---

### **5. TEAM GAME STATISTICS**

**Database Table**: `team_game_stats`
**Record Count**: 212 records (2 per game × 106 games)
**Source Script**: `scripts/scrapers/game-stats-scraper.js`
**Populated By**: Same as player game stats

**Available Fields**:
```javascript
{
  stat_id: 456,
  team_id: "SEA",
  game_id: "espn-401772510",
  season: 2025,
  week: 4,

  // Offense
  total_yards: 389,
  passing_yards: 289,
  rushing_yards: 100,
  first_downs: 24,
  third_down_conversions: 8,
  third_down_attempts: 15,
  fourth_down_conversions: 1,
  fourth_down_attempts: 2,

  // Turnovers
  turnovers: 2,
  fumbles_lost: 1,
  interceptions_thrown: 1,

  // Penalties
  penalties: 6,
  penalty_yards: 45,

  // Time
  possession_time: "32:15",

  // Red Zone
  red_zone_attempts: 4,
  red_zone_scores: 3
}
```

**NPM Scripts**: Same as player stats

---

### **6. GAME-DAY ROSTERS**

**Database Table**: `game_rosters`
**Record Count**: 5,995 entries
**Source Script**: `scripts/scrapers/game-stats-scraper.js`
**Populated By**: Auto-extracted from game data during stats scraping

**Available Fields**:
```javascript
{
  roster_id: 789,
  game_id: "espn-401772510",
  season: 2025,
  team_id: "SEA",
  player_id: "espn-4361529",
  position: "QB",
  jersey_number: 14,
  active: true,                      // Did they play?
  status: "active"                   // Roster status that game
}
```

**NPM Scripts**:
- `npm run roster:gameday -- --game=401772510`

**Use Case**: See who actually played in a specific game (historical roster snapshot)

---

### **7. SCORING PLAYS**

**Database Table**: `scoring_plays`
**Record Count**: 917 plays
**Source Script**: `scripts/scrapers/game-stats-scraper.js`
**Populated By**: Extracted from game summary data

**Available Fields**:
```javascript
{
  play_id: 1011,
  game_id: "espn-401772510",
  season: 2025,
  week: 4,
  team_id: "SEA",
  quarter: 2,
  time_remaining: "5:23",
  play_type: "passing_touchdown",    // Enum
  scoring_type: "touchdown",
  points: 6,
  description: "Sam Darnold 34 yard pass to Tyler Lockett (Jason Myers kick)",
  away_score: 10,
  home_score: 17
}
```

**NPM Scripts**: Included in game stats output

---

### **8. SEASON CUMULATIVE STATISTICS**

**Database Table**: `player_season_cumulative_stats`
**Record Count**: 1,516 players
**Source Script**: `scripts/aggregators/weekly-aggregation.js`
**Populated By**:
- Manual: `npm run aggregate:weekly -- --week=7`
- Auto: Runs after all week's games complete

**Available Fields**:
```javascript
{
  stat_id: 1213,
  player_id: "espn-4361529",
  season: 2025,
  week: 7,                           // Stats through this week
  team_id: "SEA",

  // Games
  games_played: 7,

  // Season totals (all stat categories)
  season_passing_yards: 1923,
  season_passing_touchdowns: 14,
  season_passing_interceptions: 7,
  season_rushing_yards: 156,
  season_rushing_touchdowns: 1,
  season_receiving_yards: 0,
  season_receiving_touchdowns: 0,
  season_receptions: 0,
  season_targets: 0,
  season_tackles: 0,
  season_sacks: 0,
  season_interceptions: 0,

  // Fantasy
  season_fantasy_points_ppr: 189.5,

  // Pace projections (17-game pace)
  projected_passing_yards: 4667,
  projected_passing_touchdowns: 34,
  projected_fantasy_points: 460.2
}
```

**NPM Scripts**:
- `npm run aggregate:weekly -- --week=7`

**Coverage**: Aggregates all 6,842 player game stats with pagination

---

### **9. WEEKLY LEADERS**

**Database Table**: `weekly_leaders`
**Record Count**: ~110 per week (12 categories × ~10 leaders each)
**Source Script**: `scripts/aggregators/weekly-aggregation.js`
**Populated By**: Same as season stats

**Available Fields**:
```javascript
{
  leader_id: 1415,
  season: 2025,
  week: 7,
  stat_category: "passing_yards",    // 12 categories total
  rank: 1,
  player_id: "espn-4361529",
  team_id: "SEA",
  stat_value: 289,
  game_id: "espn-401772510"
}
```

**Stat Categories**:
1. passing_yards
2. passing_touchdowns
3. rushing_yards
4. rushing_touchdowns
5. receiving_yards
6. receiving_touchdowns
7. receptions
8. tackles
9. sacks
10. interceptions
11. field_goals_made
12. fantasy_points_ppr

---

### **10. ROSTER TRANSACTIONS**

**Database Table**: `roster_transactions`
**Record Count**: 2,161 transactions
**Source Script**: `scripts/scrapers/roster-updates-scraper.js`
**Populated By**: Daily at 5:00 PM ET

**Available Fields**:
```javascript
{
  transaction_id: 1617,
  player_id: "espn-4361529",
  team_id: "SEA",
  transaction_type: "addition",      // Enum: addition/removal
  transaction_date: "2025-03-15",
  notes: "Signed as free agent"
}
```

**NPM Scripts**:
- `npm run scrape:roster`

**Coverage**: Tracks all roster changes since initial seed

---

### **11. STANDINGS**

**Database Table**: `team_standings`
**Record Count**: 32 teams (updated daily)
**Source Script**: `scripts/scrapers/standings-scraper.js`
**Populated By**: Daily at 7:00 AM ET

**Available Fields**:
```javascript
{
  standing_id: 1819,
  team_id: "SEA",
  season: 2025,
  week: 7,

  // Record
  wins: 5,
  losses: 2,
  ties: 0,
  win_percentage: 0.714,

  // Rankings
  division_rank: 1,
  conference_rank: 4,

  // Point differential
  points_for: 189,
  points_against: 156,
  point_differential: 33,

  // Streaks
  current_streak: "W3",              // 3-game win streak
  home_record: "3-1",
  away_record: "2-1"
}
```

**NPM Scripts**:
- `npm run scrape:standings`

**Display**: Shown in scoreboard output

---

## 🔍 QUICK REFERENCE: HOW TO GET SPECIFIC DATA

### "I need current team rosters"
```bash
npm run roster:team -- --team=SEA
```
**Tables Used**: `teams`, `players`, `player_teams`
**Query**: See get-team-roster.js:62-63 for correct season filter

### "I need who played in a specific game"
```bash
npm run roster:gameday -- --game=401772510
```
**Tables Used**: `games`, `game_rosters`, `players`, `player_game_stats`

### "I need live scores for this week"
```bash
npm run scoreboard -- --week=7
```
**Tables Used**: `games`, `teams`
**Shows**: Score, quarter scores, status, broadcast

### "I need season leaders"
```javascript
// Query weekly_leaders table
SELECT * FROM weekly_leaders
WHERE season = 2025 AND week = 7 AND stat_category = 'passing_yards'
ORDER BY rank
LIMIT 10
```

### "I need a player's season stats"
```javascript
// Query player_season_cumulative_stats
SELECT * FROM player_season_cumulative_stats
WHERE player_id = 'espn-4361529' AND season = 2025 AND week = 7
```

### "I need all games for a team"
```javascript
// Query games table
SELECT * FROM games
WHERE (home_team_id = 'SEA' OR away_team_id = 'SEA')
AND season = 2025
ORDER BY week
```

---

## ⚠️ COMMON SCHEMA MISTAKES TO AVOID

### ❌ WRONG → ✅ CORRECT

**Teams Table:**
```javascript
// ❌ WRONG
.select('team_abbreviation')

// ✅ CORRECT
.select('team_abbr')
```

**Players Table:**
```javascript
// ❌ WRONG
.select('position')

// ✅ CORRECT
.select('primary_position')
```

**Player Teams Table:**
```javascript
// ❌ WRONG
.eq('season', 2025)

// ✅ CORRECT
.lte('start_season', 2025)
.or('end_season.is.null,end_season.gte.2025')
```

**Player Game Stats:**
```javascript
// ❌ WRONG
.select('receptions')

// ✅ CORRECT
.select('receiving_receptions')
```

---

## 📁 FILE LOCATIONS

### **Seed Scripts** (One-time population)
- `scripts/seed/01-teams.js` → teams table
- `scripts/seed/02-stadiums.js` → stadiums table
- `scripts/seed/03-players.js` → players table
- `scripts/seed/04-schedule.js` → games table

### **Scraper Scripts** (Automated daily)
- `scripts/scrapers/game-stats-scraper.js` → player_game_stats, team_game_stats, game_rosters, scoring_plays
- `scripts/scrapers/live-games-scraper.js` → updates games.status
- `scripts/scrapers/roster-updates-scraper.js` → player_teams, roster_transactions
- `scripts/scrapers/standings-scraper.js` → team_standings

### **Aggregator Scripts** (Weekly)
- `scripts/aggregators/weekly-aggregation.js` → player_season_cumulative_stats, weekly_leaders

### **Display Scripts** (On-demand)
- `scripts/get-live-scoreboard.js` → Console/JSON scoreboard
- `scripts/generate-live-scoreboard-page.js` → HTML scoreboard
- `scripts/get-team-roster.js` → Team roster display
- `scripts/get-gameday-roster.js` → Game-day roster display

### **Utility Scripts**
- `scripts/utils/player-creator.js` → Auto-create missing players
- `scripts/utils/fantasy-calculator.js` → Calculate fantasy points

---

## 🎯 DATA COMPLETENESS

| Data Type | Records | Coverage | Auto-Updated |
|-----------|---------|----------|--------------|
| Teams | 33 | 100% | No (static) |
| Players | 2,571 | 100% | Daily 5PM |
| Player-Team Links | 2,538 | 100% (32/32 teams) | Daily 5PM |
| Games | 272 | 100% scheduled | No (static) |
| Completed Games | 106 | 39% of season | N/A |
| Player Game Stats | 6,842 | 100% of completed | Auto on game end |
| Team Game Stats | 212 | 100% of completed | Auto on game end |
| Game Rosters | 5,995 | 100% of completed | Auto on game end |
| Scoring Plays | 917 | 100% of completed | Auto on game end |
| Season Stats | 1,516 players | 100% aggregated | Weekly |
| Roster Transactions | 2,161 | Since seed | Daily 5PM |
| Standings | 32 teams | Current week | Daily 7AM |

---

## 🤖 AUTOMATION SCHEDULE

**Daily 6:00 AM ET**: Injuries scraper (not yet implemented)
**Daily 7:00 AM ET**: Standings scraper
**Daily 5:00 PM ET**: Roster updates scraper
**Game Days (every 30s)**: Live games scraper → Auto-triggers game stats scraper
**Weekly Monday 3:00 AM ET**: Schedule refresh
**After week completes**: Weekly aggregation (manual trigger recommended)

---

**See Also**:
- [DATABASE-SCHEMA-REFERENCE.md](DATABASE-SCHEMA-REFERENCE.md) - Complete column definitions
- [AUTOMATION-GUARANTEE.md](AUTOMATION-GUARANTEE.md) - How automation works
- [SCRIPTS-INDEX.md](SCRIPTS-INDEX.md) - All 63 scripts cataloged
- [STATE-OF-THE-UNION.md](STATE-OF-THE-UNION.md) - User-friendly overview
