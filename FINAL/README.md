# NFL Database Documentation - Table Index

> **Purpose**: User-facing reference for all documented database tables
> **Last Updated**: October 23, 2025
> **Total Tables Documented**: 30 (+ 8 future enhancements)
> **Documentation Coverage**: 100% of active 2025 season tables

---

## Quick Metrics

### Documentation Stats
- **Total Tables**: 38 documented (30 active + 8 future)
- **Total Fields**: 517+ fields documented
- **Documentation Files**: 90+ markdown files
- **Total Lines**: 50,000+ lines of documentation

### Database Stats (2025 Season)
- **Total Records**: 37,000+ across all tables
- **Players**: 2,571 players
- **Games**: 272 games (106 completed)
- **Player Stats**: 6,842 game records
- **Snap Counts**: 10,079 records
- **Transactions**: 2,161 roster moves
- **Data Coverage**: 100% of completed games

---

## Tables by Importance (Ranked)

### 🔴 CRITICAL - Core Operations (8 tables)

**Required for basic site functionality**

| # | Table | Fields | Records | Status | Purpose |
|---|-------|--------|---------|--------|---------|
| 1 | [PLAYERS](PLAYERS/) | 18 | 2,571 | ✅ Active | Player profiles and bio data |
| 2 | [TEAMS](TEAMS/) | 17 | 33 | ✅ Active | NFL team information |
| 3 | [GAMES](GAMES/) | 20 | 272 | ✅ Active | Game schedule and scores |
| 4 | [PLAYER-GAME-STATS](PLAYER-GAME-STATS/) | 75 | 6,842 | ✅ Active | Player performance per game |
| 5 | [TEAM-GAME-STATS](TEAM-GAME-STATS/) | 24 | 212 | ✅ Active | Team performance per game |
| 6 | [PLAYER-TEAMS](PLAYER-TEAMS/) | 7 | 2,538 | ✅ Active | Player-team relationships |
| 7 | [POSITIONS](POSITIONS/) | 5 | 26 | ✅ Active | NFL positions reference |
| 8 | [SEASONS](SEASONS/) | 8 | 1 | ✅ Active | Season information (2025) |

---

### 🟡 IMPORTANT - Enhanced Features (11 tables)

**Add significant value to user experience**

| # | Table | Fields | Records | Status | Purpose |
|---|-------|--------|---------|--------|---------|
| 9 | [SCORING-PLAYS](SCORING-PLAYS/) | 12 | 917 | ✅ Active | Play-by-play scoring events |
| 10 | [ROSTER-TRANSACTIONS](ROSTER-TRANSACTIONS/) | 9 | 2,161 | ✅ Active | Player moves (signings/releases) |
| 11 | [GAME-ROSTERS](GAME-ROSTERS/) | 9 | 5,995 | ✅ Active | Game-day roster snapshots |
| 12 | [SNAP-COUNTS](SNAP-COUNTS/) | 17 | 10,079 | ✅ Active | Player snap counts (OFF/DEF/ST) |
| 13 | [STADIUMS](STADIUMS/) | 11 | 30 | ✅ Active | NFL venues |
| 14 | [PLAYER-SEASON-STATS](PLAYER-SEASON-STATS/) | 75 | 1,516 | ✅ Active | Season cumulative stats |
| 15 | [TEAM-SEASON-STATS](TEAM-SEASON-STATS/) | 24 | 32 | ✅ Active | Team season totals |
| 16 | [WEEKLY-STATS](WEEKLY-STATS/) | 14 | Varies | ✅ Active | Weekly stat leaders |
| 17 | [GAME-WEATHER](GAME-WEATHER/) | 11 | 106 | ✅ Active | Weather conditions per game |
| 18 | [PLAY-BY-PLAY](PLAY-BY-PLAY/) | 25+ | 0 | ⚠️ Planned | Detailed play-by-play data |
| 19 | [BETTING-LINES](BETTING-LINES/) | 15 | 0 | ⚠️ Planned | Betting odds and spreads |

---

### 🟢 USEFUL - Supporting Data (6 tables)

**Nice-to-have features and metadata**

| # | Table | Fields | Records | Status | Purpose |
|---|-------|--------|---------|--------|---------|
| 20 | [TEAM-ALIASES](TEAM-ALIASES/) | 5 | 132 | ✅ Active | Team name normalization |
| 21 | [DIVISIONS](DIVISIONS/) | 6 | 8 | ✅ Active | AFC/NFC divisions |
| 22 | [CONFERENCES](CONFERENCES/) | 6 | 2 | ✅ Active | AFC/NFC conferences |
| 23 | [PLAYER-INJURIES](PLAYER-INJURIES/) | 8 | 0 | ⚠️ Planned | Injury reports |
| 24 | [STAT-CATEGORIES](STAT-CATEGORIES/) | 9 | 0 | ⚠️ Empty | Stat metadata for UI |
| 25 | [SCRIPTS](SCRIPTS/) | N/A | N/A | ✅ Active | All scraper/seed scripts |

---

### 🔵 OPTIONAL - Future Enhancements (5 tables)

**Advanced features not yet implemented**

| # | Table | Fields | Records | Status | Purpose |
|---|-------|--------|---------|--------|---------|
| 26 | [GAME-DRIVES](GAME-DRIVES/) | 11 | 0 | ⚠️ Future | Drive-by-drive breakdown |
| 27 | [PLAYER-NEWS](PLAYER-NEWS/) | 15 | 0 | ⚠️ Future | Player news articles |
| 28 | [TEAM-NEWS](TEAM-NEWS/) | 9 | 0 | ⚠️ Future | Team news articles |
| 29 | [COACHES](COACHES/) | 20 | 0 | ⚠️ Empty | Coach profiles and records |
| 30 | [GAME-OFFICIALS](GAME-OFFICIALS/) | 7 | 0 | ⚠️ Empty | Referee crews per game |

---

## Tables in FUTURE Directory

**Not yet implemented - lower priority**

| Table | Fields | Status | Reason |
|-------|--------|--------|--------|
| [KEY-PLAYS](FUTURE/KEY-PLAYS/) | 11 | Future | Highlight plays with importance scoring |
| TEAM-ELO-RATINGS | TBD | Future | Team strength ratings |
| PLAYER-AWARDS | TBD | Future | Awards and honors |
| PLAYER-CONTRACTS | TBD | Future | Contract details |
| PLAYER-MILESTONES | TBD | Future | Career milestones |
| PLAYER-TRENDING-ANALYTICS | TBD | Future | Trending player stats |
| AWARD-TYPES | TBD | Future | Award definitions |
| TEAM-SEASONS | TBD | Future | Historical team seasons |

---

## Table Categories

### By Data Type

**Core Entities (5 tables):**
- PLAYERS, TEAMS, GAMES, POSITIONS, SEASONS

**Performance Stats (6 tables):**
- PLAYER-GAME-STATS, TEAM-GAME-STATS, PLAYER-SEASON-STATS, TEAM-SEASON-STATS, WEEKLY-STATS, SCORING-PLAYS

**Roster Management (4 tables):**
- PLAYER-TEAMS, ROSTER-TRANSACTIONS, GAME-ROSTERS, SNAP-COUNTS

**Game Details (5 tables):**
- PLAY-BY-PLAY, GAME-WEATHER, BETTING-LINES, GAME-DRIVES, GAME-OFFICIALS

**Reference Data (5 tables):**
- STADIUMS, DIVISIONS, CONFERENCES, TEAM-ALIASES, STAT-CATEGORIES

**News & Media (3 tables):**
- PLAYER-NEWS, TEAM-NEWS, KEY-PLAYS

**Personnel (2 tables):**
- COACHES, PLAYER-INJURIES

---

## Status Legend

| Symbol | Status | Meaning |
|--------|--------|---------|
| ✅ | Active | Table populated with 2025 season data |
| ⚠️ | Planned | Schema exists, scraper planned but not implemented |
| ⚠️ | Empty | Schema exists, no data or scraper |
| 🔮 | Future | Enhancement for future implementation |

---

## Quick Navigation

### By Use Case

**Building Player Profiles:**
1. [PLAYERS](PLAYERS/) - Bio data
2. [PLAYER-TEAMS](PLAYER-TEAMS/) - Current team
3. [POSITIONS](POSITIONS/) - Position info
4. [PLAYER-GAME-STATS](PLAYER-GAME-STATS/) - Recent games
5. [PLAYER-SEASON-STATS](PLAYER-SEASON-STATS/) - Season totals
6. [PLAYER-NEWS](PLAYER-NEWS/) - Latest news (planned)

**Building Game Pages:**
1. [GAMES](GAMES/) - Score and basic info
2. [TEAM-GAME-STATS](TEAM-GAME-STATS/) - Team stats
3. [PLAYER-GAME-STATS](PLAYER-GAME-STATS/) - Player stats
4. [SCORING-PLAYS](SCORING-PLAYS/) - Scoring summary
5. [GAME-WEATHER](GAME-WEATHER/) - Weather conditions
6. [GAME-ROSTERS](GAME-ROSTERS/) - Active rosters
7. [GAME-DRIVES](GAME-DRIVES/) - Drive breakdown (future)

**Building Team Pages:**
1. [TEAMS](TEAMS/) - Team info
2. [STADIUMS](STADIUMS/) - Home venue
3. [PLAYER-TEAMS](PLAYER-TEAMS/) - Current roster
4. [TEAM-SEASON-STATS](TEAM-SEASON-STATS/) - Season stats
5. [TEAM-GAME-STATS](TEAM-GAME-STATS/) - Game-by-game
6. [ROSTER-TRANSACTIONS](ROSTER-TRANSACTIONS/) - Recent moves

**Building Standings:**
1. [TEAMS](TEAMS/) - Team list
2. [GAMES](GAMES/) - Win/loss records
3. [DIVISIONS](DIVISIONS/) - Division structure (empty)
4. [CONFERENCES](CONFERENCES/) - Conference structure (empty)

**Building Stats Leaders:**
1. [WEEKLY-STATS](WEEKLY-STATS/) - Weekly leaders
2. [PLAYER-SEASON-STATS](PLAYER-SEASON-STATS/) - Season leaders
3. [TEAM-SEASON-STATS](TEAM-SEASON-STATS/) - Team leaders

---

## Documentation Structure

Each table folder contains:

### Standard Files
- **`my-guide.md`** - Quick reference guide
  - All fields listed
  - Quick stats
  - Common queries
  - Current status

### RESOURCES Subfolder
- **`field-mapping-report.md`** - Complete field documentation
  - All fields with types, examples, constraints
  - Data source mapping (ESPN API → Database)
  - Common mistakes and best practices

- **`raw-data-source-mapping.md`** - API/source documentation
  - ESPN API structure
  - Data transformation logic
  - Example API responses

### Additional Files (when applicable)
- **Seed scripts** - Initial data loading (POSITIONS, TEAMS, etc.)
- **Scraper scripts** - Continuous data collection
- **Migration files** - Database schema definitions

---

## File Metrics by Table

| Table | my-guide | field-mapping | raw-data-source | Total Lines |
|-------|----------|---------------|-----------------|-------------|
| PLAYERS | ✅ | ✅ | ✅ | ~2,500 |
| TEAMS | ✅ | ✅ | ✅ | ~2,000 |
| GAMES | ✅ | ✅ | ✅ | ~2,200 |
| PLAYER-GAME-STATS | ✅ | ✅ | ✅ | ~3,500 |
| PLAYER-NEWS | ✅ | ✅ | ✅ | ~2,800 |
| GAME-DRIVES | ✅ | ✅ | ✅ | ~2,400 |
| *(and 23 more...)* | ... | ... | ... | ... |

**Total Documentation**: 50,000+ lines across 90+ files

---

## Key Documentation Files

### Project-Level
- **[PROJECT-MAP.md](../../PROJECT-MAP.md)** - Complete project navigation
- **[CLAUDE.md](../../CLAUDE.md)** - Development log and history
- **[DATABASE-SCHEMA-REFERENCE.md](../../DATABASE-SCHEMA-REFERENCE.md)** - Schema quick reference
- **[DATABASE-ACCESS-GUIDE.md](../../DATABASE-ACCESS-GUIDE.md)** - How to connect to database

### Scraper-Level
- **[AUTOMATION-GUARANTEE.md](../../AUTOMATION-GUARANTEE.md)** - Automation system docs
- **[SCRIPTS-INDEX.md](../../SCRIPTS-INDEX.md)** - All 63 scripts cataloged

### Agent-Level
- **[AGENT-INSTRUCTIONS.md](AGENT-INSTRUCTIONS.md)** - Instructions for AI agents
- **[CRITICAL-FUNCTIONS-INDEX.md](CRITICAL-FUNCTIONS-INDEX.md)** - Key functions reference

---

## Data Completeness by Category

### ✅ Complete (100% coverage)
- **Players**: 2,571 players across 32 teams
- **Games**: 272 games scheduled, 106 completed with stats
- **Team Stats**: 212 game records (100% of completed games)
- **Player Stats**: 6,842 game records (100% of completed games)
- **Scoring Plays**: 917 plays (100% of completed games)
- **Game Rosters**: 5,995 entries (100% of completed games)

### ⚠️ Partial (Some data)
- **Weather**: 106 games (only completed games)
- **Transactions**: 2,161 records (ongoing)
- **Season Stats**: 1,516 players (updated weekly)

### ❌ Empty (Schema ready, no data)
- **Betting Lines**: 0 (requires API key)
- **Play-by-Play**: 0 (requires nflverse integration)
- **Injuries**: 0 (scraper fixed, needs execution)
- **News**: 0 (not implemented)
- **Drives**: 0 (not implemented)
- **Coaches**: 0 (not implemented)
- **Officials**: 0 (not implemented)

---

## Coverage by Field Count

### Large Tables (50+ fields)
- **PLAYER-GAME-STATS**: 75 fields
- **PLAYER-SEASON-STATS**: 75 fields
- **COACHES**: 20 fields

### Medium Tables (10-24 fields)
- **PLAYERS**: 18 fields
- **TEAMS**: 17 fields
- **GAMES**: 20 fields
- **TEAM-GAME-STATS**: 24 fields
- **PLAYER-NEWS**: 15 fields

### Small Tables (< 10 fields)
- **POSITIONS**: 5 fields
- **TEAM-ALIASES**: 5 fields
- **CONFERENCES**: 3 fields
- **PLAYER-TEAMS**: 7 fields

---

## External Dependencies

### Data Sources
- **ESPN API**: Primary source (players, games, stats)
- **The Odds API**: Betting lines (requires key)
- **nflverse**: Play-by-play data (free)
- **RotoWire**: News fallback (web scraping)

### Database
- **Supabase**: PostgreSQL hosting
- **Project ID**: fuzouuxhxluqjmiyabal
- **Schema Version**: 22 migrations applied

---

## Next Steps

### High Priority
1. ✅ All core tables documented
2. ✅ Schema verified with live database
3. ⚠️ Populate empty reference tables (divisions, conferences)
4. ⚠️ Implement news scraper
5. ⚠️ Implement play-by-play scraper

### Medium Priority
1. ⚠️ Add game drives scraper
2. ⚠️ Populate betting lines (requires API key)
3. ⚠️ Add coach data

### Low Priority
1. 🔮 Future enhancements in FUTURE directory
2. 🔮 Advanced analytics tables
3. 🔮 Historical season backfill

---

## Quick Commands

### Check Table Record Counts
```bash
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); (async () => { const { count } = await supabase.from('TABLE_NAME').select('*', { count: 'exact', head: true }); console.log('Records:', count); })();"
```

### View Table Documentation
```bash
# Quick guide
cat coderef/FINAL/TABLE-NAME/my-guide.md

# Full field mapping
cat coderef/FINAL/TABLE-NAME/TABLE-NAME-RESOURCES/field-mapping-report.md
```

---

**Last Updated**: October 22, 2025 at 11:30 PM
**Documentation Version**: 1.0
**Total Tables**: 37 (29 active + 8 future)
**Total Fields Documented**: 500+
**Total Documentation**: 50,000+ lines
