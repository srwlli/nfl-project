# NFL Stats Platform - Complete Scripts Index

**Last Updated**: October 21, 2025
**Total Scripts**: 63

---

## Table of Contents

1. [Seed Scripts (4)](#seed-scripts) - Initial data loading
2. [Scraper Scripts (8)](#scraper-scripts) - Continuous data collection
3. [Aggregator Scripts (1)](#aggregator-scripts) - Data processing
4. [Analysis Scripts (3)](#analysis-scripts) - Performance calculations
5. [Validation Scripts (12)](#validation-scripts) - Data integrity checks
6. [Database Scripts (5)](#database-scripts) - Schema and migrations
7. [Page Generator Scripts (5)](#page-generator-scripts) - HTML generation
8. [Utility Scripts (11)](#utility-scripts) - Shared helpers
9. [Maintenance Scripts (4)](#maintenance-scripts) - Player backfills & fixes
10. [Testing Scripts (3)](#testing-scripts) - Development tools

---

## Seed Scripts

**Purpose**: One-time data loading to populate initial database records

| Script | Purpose | Records Created | Usage |
|--------|---------|----------------|-------|
| `01-teams.js` | Load NFL teams | 33 teams (32 + 1 alias) | `npm run seed:teams` |
| `02-stadiums.js` | Load NFL stadiums | 30 stadiums | `npm run seed:stadiums` |
| `03-players.js` | Load active players from rosters | 2,540+ players | `npm run seed:players` |
| `04-schedule.js` | Load 2025 season schedule | 272 games | `npm run seed:schedule` |

**Run all seeds**: `npm run seed:all`

---

## Scraper Scripts

**Purpose**: Continuous data collection from ESPN API and external sources

### Core Scrapers (5)

| Script | Purpose | Frequency | Tables Updated |
|--------|---------|-----------|---------------|
| `game-stats-scraper.js` | Post-game stats (team, player, scoring, rosters, weather) | After each game | `team_game_stats`, `player_game_stats`, `scoring_plays`, `game_rosters`, `game_weather`, `games` (quarter scores) |
| `live-games-scraper.js` | Real-time score updates | Every 30s during games | `games` |
| `standings-scraper.js` | Division/conference rankings | Daily 7:00 AM ET | `team_standings` |
| `injuries-scraper.js` | Player injury reports | Daily 6:00 AM ET | `player_injury_status` |
| `roster-updates-scraper.js` | Roster transactions | Daily 5:00 PM ET | `roster_transactions`, `player_teams` |

**Usage Examples**:
```bash
# Scrape specific game
npm run scrape:game-stats -- --game=401772510

# Scrape entire week
npm run scrape:game-stats -- --week=7

# Check live scores
npm run scrape:live -- --week=7

# Update standings
npm run scrape:standings

# Check injuries
npm run scrape:injuries

# Check roster moves
npm run scrape:roster
```

### Advanced Scrapers (3)

| Script | Purpose | Frequency | Data Source |
|--------|---------|-----------|-------------|
| `betting-scraper.js` | Betting lines (spreads, moneyline, totals) | Daily 10:00 AM ET | The Odds API |
| `advanced-analytics-scraper.js` | EPA, WPA, success rate | Weekly Tuesday 6:00 AM ET | nflverse |
| `historical-betting-scraper.js` | Historical betting data | On-demand | ESPN |
| `elo-ratings-scraper.js` | Team ELO ratings | Weekly | FiveThirtyEight |
| `nfl-top-100-games-scraper.js` | Greatest games analysis | On-demand | ESPN |

**Usage Examples**:
```bash
# Betting odds (requires THE_ODDS_API_KEY)
npm run scrape:betting

# Advanced analytics
npm run scrape:analytics -- --week=7

# Historical betting
npm run scrape:historical-betting

# ELO ratings
npm run scrape:elo-ratings

# Top 100 games
npm run scrape:top-100-games
```

---

## Aggregator Scripts

**Purpose**: Process and aggregate raw data into derived statistics

| Script | Purpose | Tables Updated | Frequency |
|--------|---------|---------------|-----------|
| `weekly-aggregation.js` | Calculate weekly leaders and season cumulative stats | `weekly_stat_leaders`, `player_season_cumulative_stats` | After each week completes |

**Usage**:
```bash
npm run aggregate:weekly
```

**What it does**:
- Processes all player game stats for the week
- Identifies top 10 leaders in 12 categories (passing yards, rushing yards, receiving yards, TDs, receptions, fantasy points, etc.)
- Updates season-to-date cumulative stats for all players
- Calculates pace projections (16-game projections)

---

## Analysis Scripts

**Purpose**: Advanced statistical analysis and projections

| Script | Purpose | Output | Usage |
|--------|---------|--------|-------|
| `calculate-performance-floors.js` | Statistical performance floor projections (Phase 1-3 enhancements) | Console display + recommendations | `npm run floors -- --week=7` |
| `calculate-performance-floors-props.js` | Player props format (individual stat lines) | Console display by prop type | `npm run floors:props -- --week=7` |
| `train-feature-weights.js` | Train ML weights for floor calculations | Feature importance scores | `npm run train:weights` |

**Performance Floors Features**:
- Phase 1: Opponent defensive efficiency, completed games filter, batch optimization, position-specific volatility
- Phase 2: Environment modifiers (venue/weather), opportunity-based projections, adaptive rolling windows, percentile-based floors
- Phase 3: Data validation suite, injury filter

---

## Validation Scripts

**Purpose**: Verify data completeness and integrity

| Script | Purpose | Usage |
|--------|---------|-------|
| `validate-data-completeness.js` | Check Phase 1 data coverage (100% game stats) | `node scripts/validate-data-completeness.js` |
| `validate-floors.js` | Validate performance floor calculations | `npm run validate:floors` |
| `verify-phase1-fields.js` | Verify Phase 1 enhanced stats fields exist | `node scripts/verify-phase1-fields.js` |
| `check-data-availability.js` | Check available data across all tables | `node scripts/check-data-availability.js` |
| `check-migrations-applied.js` | Verify database migrations applied | `node scripts/check-migrations-applied.js` |
| `check-games-by-week.js` | Check game completion status by week | `node scripts/check-games-by-week.js` |
| `check-season-stats.js` | Check season cumulative stats | `node scripts/check-season-stats.js` |
| `check-teams-with-stats.js` | Verify all teams have stats | `node scripts/check-teams-with-stats.js` |
| `check-week-7.js` | Week 7 specific validation | `node scripts/check-week-7.js` |
| `check-tb-sea-data.js` | Specific game validation | `node scripts/check-tb-sea-data.js` |
| `check-houston-defense.js` | Houston defensive stats check | `node scripts/check-houston-defense.js` |
| `test-validation-query.js` | Test validation queries | `node scripts/test-validation-query.js` |

---

## Database Scripts

**Purpose**: Schema management and database operations

| Script | Purpose | Usage |
|--------|---------|-------|
| `generate-schema-map.js` | Generate live schema documentation from database | `npm run schema:map` |
| `apply-migrations.js` | Apply Supabase migrations via CLI | `node scripts/apply-migrations.js` |
| `apply-migrations-direct.js` | Apply migrations directly to database | `node scripts/apply-migrations-direct.js` |
| `apply-phase1-migration.js` | Apply Phase 1 specific migration | `node scripts/apply-phase1-migration.js` |
| `check-position-field.js` | Check position field values | `node scripts/check-position-field.js` |

**Key File**:
- `generate-schema-map.js` - Auto-generates `coderef/training/database-schema-map.json` (910 lines, 248 columns documented)

---

## Page Generator Scripts

**Purpose**: Generate HTML demo and showcase pages

| Script | Purpose | Output File | Usage |
|--------|---------|------------|-------|
| `generate-index-with-data.js` | Basic data showcase | `index.html` | `node scripts/generate-index-with-data.js` |
| `generate-comprehensive-index.js` | Comprehensive 8-scraper showcase | `index.html` | `node scripts/generate-comprehensive-index.js` |
| `generate-demo-game-page.js` | Game page with team-separated stats | `demo-game-page-with-players.html` | `node scripts/generate-demo-game-page.js` |
| `generate-betting-data-page.js` | Betting odds display | `demo-betting.html` | `node scripts/generate-betting-data-page.js` |
| `generate-elo-ratings-page.js` | ELO ratings display | `demo-elo-ratings.html` | `node scripts/generate-elo-ratings-page.js` |
| `generate-top-100-games-page.js` | Greatest games display | `demo-top-100-games.html` | `node scripts/generate-top-100-games-page.js` |

---

## Utility Scripts

**Purpose**: Shared helper modules and libraries

| Script | Purpose | Used By |
|--------|---------|---------|
| `supabase-client.js` | Database connection client | All scripts |
| `logger.js` | Winston logging configuration | All scripts |
| `espn-api.js` | ESPN API wrapper with rate limiting | Scrapers |
| `rate-limiter.js` | Rate limiting utility | Scrapers |
| `fantasy-calculator.js` | Fantasy point calculations (standard, PPR, half-PPR) | game-stats-scraper, aggregator |
| `player-creator.js` | Auto-create missing players from ESPN API | backfill scripts |
| `test-connection.js` | Test database connection | Development |
| `bootstrap-intervals.js` | Bootstrap confidence intervals | Performance floors |
| `feature-importance.js` | Feature importance scoring | Performance floors |
| `hierarchical-stats.js` | Hierarchical statistical models | Performance floors |
| `temporal-smoothing.js` | Time-series smoothing | Performance floors |

**Usage**:
```bash
# Test database connection
npm run test:db
```

---

## Maintenance Scripts

**Purpose**: Backfill missing data and fix data issues

| Script | Purpose | Usage |
|--------|---------|-------|
| `add-missing-players-by-id.js` | Add specific missing players by ID | `node scripts/add-missing-players-by-id.js` |
| `backfill-missing-players.js` | Batch backfill missing players | `npm run backfill:missing-players` |
| `list-missing-players.js` | List players causing FK errors | `node scripts/list-missing-players.js` |
| `ensure-complete-data.js` | Ensure all games have complete data | `node scripts/ensure-complete-data.js` |

**Workorder**: WO-GAME-DAY-ROSTER-TRACKING-001

---

## Testing & Debug Scripts

**Purpose**: Development and debugging tools

| Script | Purpose | Usage |
|--------|---------|-------|
| `show-season-leaders.js` | Display top 10 season leaders by position | `node scripts/show-season-leaders.js` |
| `show-game-data.js` | Display specific game data | `node scripts/show-game-data.js` |
| `demo-week4-game.js` | Week 4 game demo | `node scripts/demo-week4-game.js` |
| `debug-floor-query.js` | Debug performance floor queries | `node scripts/debug-floor-query.js` |
| `debug-performance-floors-data.js` | Debug floor calculation data | `node scripts/debug-performance-floors-data.js` |
| `diagnose-missing-stats.js` | Diagnose missing stats | `node scripts/diagnose-missing-stats.js` |
| `investigate-missing-stats.js` | Investigate stat gaps | `node scripts/investigate-missing-stats.js` |
| `format-floors-output.js` | Format floor output for display | `node scripts/format-floors-output.js` |
| `check-actual-results.js` | Check actual game results | `node scripts/check-actual-results.js` |

---

## Automation Script

| Script | Purpose | Frequency |
|--------|---------|-----------|
| `scheduler.js` | Automated orchestration of all scrapers | Continuous (cron-based) |

**Cron Schedule**:
- **Daily 6:00 AM ET**: Injuries scraper
- **Daily 7:00 AM ET**: Standings scraper
- **Daily 10:00 AM ET**: Betting odds scraper
- **Daily 5:00 PM ET**: Roster updates scraper
- **Game days (30s intervals)**: Live games scraper
- **Weekly Monday 3:00 AM ET**: Schedule refresh
- **Weekly Tuesday 6:00 AM ET**: Advanced analytics scraper

**Usage**:
```bash
# Production mode
npm run scheduler

# Development mode (accelerated)
SCHEDULER_MODE=development npm run scheduler

# Disable live games
LIVE_GAMES_ENABLED=false npm run scheduler
```

---

## Quick Reference

### Most Commonly Used Scripts

```bash
# Display season leaders
node scripts/show-season-leaders.js

# Scrape current week's games
npm run scrape:game-stats -- --week=7

# Run weekly aggregation
npm run aggregate:weekly

# Validate data completeness
node scripts/validate-data-completeness.js

# Calculate performance floors
npm run floors -- --week=7

# Start automated scheduler
npm run scheduler

# Generate fresh schema map
npm run schema:map

# Test database connection
npm run test:db
```

### Script Naming Conventions

- **Prefix `seed/`**: One-time initial data loading
- **Prefix `scrapers/`**: Continuous data collection
- **Prefix `aggregators/`**: Data processing and aggregation
- **Prefix `utils/`**: Shared helper modules
- **Prefix `check-`**: Validation and verification
- **Prefix `generate-`**: HTML/documentation generation
- **Prefix `debug-`**: Debugging tools
- **Prefix `validate-`**: Data integrity checks

---

## NPM Scripts Reference

From `package.json`:

```json
{
  "seed:all": "Run all 4 seed scripts sequentially",
  "seed:teams": "Load NFL teams",
  "seed:stadiums": "Load stadiums",
  "seed:players": "Load players from rosters",
  "seed:schedule": "Load 2025 season schedule",

  "backfill:missing-players": "Backfill missing players",

  "scrape:game-stats": "Scrape post-game statistics",
  "scrape:live": "Monitor live games",
  "scrape:injuries": "Scrape injury reports",
  "scrape:roster": "Scrape roster updates",
  "scrape:standings": "Calculate standings",
  "scrape:betting": "Fetch betting odds",
  "scrape:analytics": "Fetch advanced analytics",
  "scrape:top-100-games": "Scrape top 100 games",
  "scrape:historical-betting": "Scrape historical betting",
  "scrape:elo-ratings": "Scrape ELO ratings",

  "aggregate:weekly": "Run weekly aggregation",

  "floors": "Calculate performance floors",
  "floors:props": "Calculate player props floors",
  "validate:floors": "Validate floor calculations",
  "train:weights": "Train ML feature weights",

  "schema:map": "Generate schema map from live DB",

  "scheduler": "Start automated scheduler",
  "test:db": "Test database connection"
}
```

---

## Statistics

**Total Scripts**: 63
- Seed: 4
- Scrapers: 8
- Aggregators: 1
- Analysis: 3
- Validation: 12
- Database: 5
- Page Generators: 5
- Utilities: 11
- Maintenance: 4
- Testing: 3
- Automation: 1

**Total Lines of Code**: ~15,000+

**Most Complex Scripts**:
1. `game-stats-scraper.js` - 840 lines (scraping, rosters, weather)
2. `calculate-performance-floors.js` - 780 lines (Phase 1-3 enhancements)
3. `generate-demo-game-page.js` - 1,500 lines (HTML generation)
4. `weekly-aggregation.js` - 500 lines (12 stat categories)
5. `advanced-analytics-scraper.js` - 351 lines (nflverse integration)

---

## See Also

- [PROJECT-MAP.md](PROJECT-MAP.md) - Project navigation guide
- [CLAUDE.md](CLAUDE.md) - Development log and session history
- [DATABASE-SCHEMA-REFERENCE.md](DATABASE-SCHEMA-REFERENCE.md) - Database schema documentation
- [DATABASE-ACCESS-GUIDE.md](DATABASE-ACCESS-GUIDE.md) - How to connect to database
- [SESSION-PHASE-1-DEPLOYMENT.md](SESSION-PHASE-1-DEPLOYMENT.md) - Phase 1 deployment details
