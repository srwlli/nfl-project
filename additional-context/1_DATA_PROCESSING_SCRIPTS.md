# 1. DATA PROCESSING SCRIPTS - Complete Inventory

**Generated:** 2025-10-16
**Location:** `C:\Users\willh\Desktop\projects - current-location\nfl-scraper\scripts\`
**Total Scripts:** 21

---

## Executive Summary

This document catalogs ALL data processing scripts found in the NFL scraper backend. These scripts handle data acquisition, processing, analysis, and reporting for the 2025 NFL betting metrics platform.

**Script Categories:**
- **Data Acquisition (Master Scrapers):** 4 scripts
- **Data Processing & Analysis:** 5 scripts
- **Integration Scripts (APIs):** 2 scripts
- **Utility & Testing Scripts:** 5 scripts
- **Validation & Reporting:** 3 scripts
- **Demo & Phase Scripts:** 2 scripts

---

## 1. MASTER DATA SCRAPERS

### 1.1 scrape_everything.py
**Path:** `scripts/scrape_everything.py`
**Purpose:** Master comprehensive NFL data scraper - scrapes ALL available free NFL data

**What it does:**
- Scrapes 16 different data types from all free sources
- Covers 3 years of historical data (2022-2024) + 5 years of schedules (2019-2024)
- Estimated download: 800 MB - 1.2 GB
- Estimated time: 45-90 minutes

**Data Sources:**
- nflreadpy (11 data types): schedules, injuries, depth charts, play-by-play, player stats, snap counts, Next Gen Stats (3 types), rosters, teams
- nflscraPy (3 data types): FiveThirtyEight ELO ratings, season splits, expected points
- ESPN API (1 data type): live scores
- sportsref-nfl (1 data type): Pro Football Reference stats

**Key Outputs:**
```
data/raw/schedules_2019_2024.parquet        (~50 MB)
data/raw/pbp_2022_2024.parquet             (~500 MB)
data/raw/pbp_{season}.parquet              (per season splits)
data/raw/injuries_2022_2024.parquet
data/raw/player_stats_2022_2024.parquet
data/raw/snap_counts_2022_2024.parquet
data/raw/ngs_passing_2022_2024.parquet
data/raw/ngs_rushing_2022_2024.parquet
data/raw/ngs_receiving_2022_2024.parquet
data/raw/rosters_2022_2024.parquet
data/raw/teams_all_seasons.parquet
data/raw/elo_1970_2025.parquet             (54 years!)
data/raw/season_splits_2024.parquet
data/raw/expected_points_2024.parquet
data/raw/espn_scores_{timestamp}.json
data/raw/scrape_results.json               (scrape summary)
```

**How to Run:**
```powershell
python scripts/scrape_everything.py
# With auto-confirm:
python scripts/scrape_everything.py --no-confirm
```

**Dependencies:** nflreadpy, nflscraPy, polars, pandas, requests, json, time

**Special Features:**
- Interactive confirmation prompt (or --no-confirm flag)
- Rate limiting for nflscraPy (3.5s between requests)
- Saves both combined and per-season files
- Detailed progress reporting with timing
- Error handling for individual data sources

---

### 1.2 scrape_2025_gambling.py
**Path:** `scripts/scrape_2025_gambling.py`
**Purpose:** 2025 NFL Gambling Metrics Scraper - ALL gambling-relevant data for current season

**What it does:**
- Scrapes 9 gambling-critical data types for 2025 season only
- Fast targeted scraping (minutes vs hours)
- Focused on betting applications

**Data Types Scraped:**
1. **Schedules** (with betting lines) - CRITICAL
   - Spread lines, totals, moneylines, odds
2. **Injuries** - CRITICAL for betting
   - Practice status, game status, injury types
3. **Depth Charts** - HIGH VALUE
   - Starter tracking by week
4. **Play-by-Play** - HIGH VALUE
   - EPA, Win Probability, Air Yards, YAC
5. **Player Stats** - HIGH VALUE
   - For player props (pass/rush/rec stats, fantasy points)
6. **Snap Counts** - MEDIUM VALUE
   - Usage percentages
7. **Next Gen Stats** (3 types) - MEDIUM VALUE
   - Passing, Rushing, Receiving advanced metrics
8. **Rosters** - MEDIUM VALUE
   - Current team rosters
9. **ESPN Live Scores** - HIGH VALUE
   - Real-time game data

**Key Outputs:**
```
data/raw/schedules_2025_latest.parquet
data/raw/injuries_2025.parquet
data/raw/depth_charts_2025.parquet
data/raw/pbp_2025.parquet
data/raw/player_stats_2025.parquet
data/raw/snap_counts_2025.parquet
data/raw/ngs_passing_2025.parquet
data/raw/ngs_rushing_2025.parquet
data/raw/ngs_receiving_2025.parquet
data/raw/rosters_2025.parquet
data/raw/espn_scoreboard_latest.json
data/raw/scrape_2025_gambling_results.json
```

**How to Run:**
```powershell
python scripts/scrape_2025_gambling.py
# With auto-confirm:
python scripts/scrape_2025_gambling.py --no-confirm
```

**Dependencies:** nflreadpy, requests, polars, pathlib, datetime

**Next Steps Suggested:**
1. Run integrate_odds_api.py (live betting odds)
2. Run integrate_weather_api.py (weather forecasts)
3. Run create_betting_dashboard.py (generate reports)

---

### 1.3 scrape_team_stats_data.py
**Path:** `scripts/scrape_team_stats_data.py`
**Purpose:** Scrape all 2025 data needed specifically for Team Stats page

**What it does:**
- Targeted scraping for team-level analytics
- 8 specific data types optimized for team stats display
- Lightweight and fast

**Data Types Scraped:**
1. **Schedules** (with betting lines)
2. **Injuries** (2025)
3. **Rosters** (2025)
4. **Player Stats** (weekly, all positions combined)
5. **Depth Charts** (2025)
6. **Snap Counts** (2025)
7. **Play-by-Play** (for EPA calculations) - 2-5 min download
8. **Teams Metadata** (2025 only)

**Key Outputs:**
```
data/raw/schedules_2025_teamstats.parquet
data/raw/injuries_2025_teamstats.parquet
data/raw/rosters_2025_teamstats.parquet
data/raw/player_stats_weekly_2025_teamstats.parquet
data/raw/depth_charts_2025_teamstats.parquet
data/raw/snap_counts_2025_teamstats.parquet
data/raw/pbp_2025_teamstats.parquet
data/raw/teams_2025_teamstats.parquet
```

**How to Run:**
```powershell
python scripts/scrape_team_stats_data.py
```

**Dependencies:** nflreadpy, polars, pathlib

**Next Step:** Run `process_team_stats.py` to aggregate data

---

### 1.4 scrape_elo_ratings.py
**Path:** `scripts/scrape_elo_ratings.py`
**Purpose:** Generate Power Ratings for NFL teams based on EPA and performance metrics

**What it does:**
- Creates ELO-like ranking system from team stats
- Calculates power ratings (1000-2000 scale, similar to ELO)
- Combines multiple performance factors

**Rating Formula:**
- **Base Rating:** 1500
- **Offensive EPA:** 40% weight (scaled to ±200)
- **Defensive EPA:** 30% weight (scaled to ±150)
- **Success Rate:** 20% weight (scaled to ±100)
- **ATS Performance:** 10% weight (scaled to ±50)

**Required Input:**
```
data/processed/team_stats_2025_complete.parquet
```

**Output:**
```
data/raw/power_ratings_2025.parquet
```

**Output Columns:**
- team, team_name
- elo_rating (power rating score)
- elo_rank (rank 1-32)
- offensive_rating, defensive_rating
- success_rate_off, success_rate_def
- ats_win_pct
- games_played

**How to Run:**
```powershell
python scripts/scrape_elo_ratings.py
```

**Dependencies:** polars, pathlib, datetime, time

**Notes:**
- Must run `process_team_stats.py` first
- Displays top 10 and bottom 5 teams
- Shows rating distribution stats

---

## 2. DATA PROCESSING & ANALYSIS SCRIPTS

### 2.1 process_team_stats.py
**Path:** `scripts/process_team_stats.py`
**Purpose:** Comprehensive 2025 team-level aggregation and ranking pipeline

**What it does:**
- Processes raw 2025 data into comprehensive team statistics
- Aggregates 7 categories of stats
- Creates rankings for all metrics
- Produces THE canonical dataset for Team Stats page

**Processing Pipeline:**
1. **Fetch Current Standings** (from ESPN API)
   - Live W-L records, points for/against, point differential
   - Fallback to teams metadata if API fails

2. **Aggregate Offensive Stats** (from player stats)
   - Passing: yards, TDs, INTs, attempts, completions, sacks
   - Rushing: yards, TDs, attempts, fumbles
   - Receiving: receptions, targets, yards, TDs
   - Per-game calculations

3. **Aggregate Defensive Stats** (from opponent stats)
   - Opponent passing/rushing yards allowed
   - TDs allowed, INTs by defense, sacks by defense
   - Per-game calculations

4. **Calculate EPA and Advanced Metrics** (from play-by-play)
   - Offensive EPA: per play, pass EPA, rush EPA
   - Success rates (overall, pass, rush)
   - Defensive EPA

5. **Calculate ATS and Betting Metrics** (from schedules)
   - ATS (Against The Spread) records and win %
   - O/U (Over/Under) records and percentages
   - Average cover margin

6. **Merge All Team Stats**
   - Combines all categories
   - Joins with teams metadata

7. **Calculate Rankings**
   - Ranks for 40+ metrics
   - Higher-is-better stats (offense)
   - Lower-is-better stats (defense)

**Required Inputs:**
```
data/raw/schedules_2025_teamstats.parquet
data/raw/player_stats_weekly_2025_teamstats.parquet
data/raw/pbp_2025_teamstats.parquet
data/raw/snap_counts_2025_teamstats.parquet
data/raw/teams_2025_teamstats.parquet
```

**Outputs:**
```
data/processed/team_stats_2025_complete.parquet
data/processed/team_stats_2025_complete.json
```

**Output Schema (100+ columns):**
- **Team Info:** team, team_name, location, nickname, wins, losses, win_pct, games_played
- **Scoring:** points_for, points_against, point_diff
- **Offensive Stats:** pass_yards, pass_tds, rush_yards, rush_tds, total_yards_per_game, ypa, ypc
- **Defensive Stats:** pass_yards_allowed, rush_yards_allowed, total_yards_allowed_per_game
- **EPA Metrics:** epa_per_play_off, epa_per_pass, epa_per_rush, epa_per_play_def
- **Success Rates:** success_rate_off, pass_success_rate, rush_success_rate, success_rate_def
- **Betting Metrics:** ats_wins_total, ats_games_total, ats_win_pct, over_total, ou_games_total, over_pct
- **Rankings:** _rank suffix for all metrics (e.g., pass_yards_rank, epa_per_play_off_rank)

**How to Run:**
```powershell
python scripts/process_team_stats.py
```

**Dependencies:** polars, requests, pathlib, json

**Notes:**
- Contacts ESPN API for live standings
- Defensive calculation used defensively (checks for required columns)
- Creates both Parquet and JSON outputs
- Prints comprehensive summary with column counts

---

### 2.2 fetch_team_data.py
**Path:** `scripts/fetch_team_data.py`
**Purpose:** Fetch comprehensive team data for a specific team (team-specific deep dive)

**What it does:**
- Retrieves all data for ONE specific team
- Provides 6 categories of team information
- Includes historical data option

**Data Categories:**
1. **Team Metadata**
   - Team name, location, nickname, IDs (nfl_team_id, espn, pfr)
2. **Schedule Data**
   - All games (home/away)
   - Betting lines (spread, total, moneylines)
   - Results and rest days
3. **Play-by-Play Aggregated Stats**
   - Offensive EPA, success rate, play counts
   - Pass/Rush specific EPA
   - Defensive EPA
4. **Power Ratings**
   - ELO rating and rank
   - Offensive/defensive ratings
5. **Betting Performance**
   - ATS record and win %
   - O/U record and over %
6. **Historical Data** (optional)
   - ELO history (1970-2024)
   - Season splits (2000-2024)
   - Gamelog statistics
   - Expected points

**Usage:**
```powershell
# Current season only
python fetch_team_data.py KC 2025

# With historical data
python fetch_team_data.py KC 2025 --historical

# Different season
python fetch_team_data.py BUF 2024
```

**Output:**
```
a/team/team_data_{TEAM}_{SEASON}.json
```

**Output Structure:**
```json
{
  "team_abbr": "KC",
  "season": 2025,
  "fetched_at": "ISO datetime",
  "team_info": {
    "abbr": "KC",
    "name": "Kansas City Chiefs",
    "wins": 6,
    "losses": 0,
    "games_played": 6
  },
  "power_ratings": {
    "elo_rating": 1650.5,
    "elo_rank": 1
  },
  "season_stats": {
    "epa_per_play_off": 0.245,
    "epa_per_play_def": -0.115,
    "success_rate_off": 0.52
  },
  "schedule": [/* array of games */],
  "betting_performance": {
    "ats_record": "4-2",
    "ats_win_pct": 66.7,
    "over_under_record": "3-3"
  }
}
```

**Dependencies:** nflreadpy, polars, pathlib, json, sys, datetime

**Notes:**
- Requires power_ratings_2025.parquet to exist
- Calculates betting metrics from spread/total lines
- Prints detailed progress for all 6 steps
- Saves relative path for portability

---

### 2.3 generate_data_index.py
**Path:** `scripts/generate_data_index.py`
**Purpose:** Generate comprehensive index of all available betting metrics with relevance ratings

**What it does:**
- Scans all parquet files in data/raw/
- Categorizes every column by betting relevance
- Provides descriptions and sample values
- Creates searchable betting metrics catalog

**Relevance Levels:**
- **CRITICAL:** Betting lines, props, scores (must-have for betting)
- **HIGH:** Key stats, EPA, usage rates (very important)
- **MEDIUM:** Supporting metrics (helpful context)
- **LOW:** Metadata, IDs (informational only)

**Categories:**
- Betting Lines (spreads, totals, moneylines, odds)
- Advanced Analytics (EPA, Win Probability, success)
- Passing Metrics (air yards, completion %, time to throw)
- Rushing Metrics (yards over expected, efficiency)
- Receiving Metrics (separation, catch %, YAC)
- Player Props - Passing/Rushing/Receiving
- Fantasy (fantasy points, PPR)
- NGS - Next Gen Stats (advanced)
- Usage (snap counts, snap %)
- Environmental (temp, wind, roof, surface)
- Injuries (report status, practice status)

**Output:**
```
data/processed/betting_metrics_index.json
```

**Output Structure:**
```json
{
  "generated_at": timestamp,
  "total_datasets": 15,
  "total_columns": 450,
  "datasets": {
    "schedules_2025_latest": {
      "filename": "schedules_2025_latest.parquet",
      "records": 285,
      "columns": 42,
      "metrics": [
        {
          "name": "spread_line",
          "category": "Betting Lines",
          "relevance": "CRITICAL",
          "description": "Point spread for the game",
          "sample_value": "-3.5"
        }
      ]
    }
  }
}
```

**How to Run:**
```powershell
python scripts/generate_data_index.py
```

**Dependencies:** polars, pathlib, json

**Special Features:**
- Auto-categorizes unknown columns by name patterns
- Provides relevance breakdown (CRITICAL/HIGH/MEDIUM/LOW counts)
- Handles 77 predefined metrics with descriptions
- Extensible categorization logic

---

### 2.4 generate_2025_data_list.py
**Path:** `scripts/generate_2025_data_list.py`
**Purpose:** Generate comprehensive list of 2025 season betting metrics

**What it does:**
- Inventories all 2025 datasets
- Categorizes by betting use case
- Generates both JSON and Markdown reports

**Report Sections:**
1. **Summary Statistics**
   - Total datasets, records, columns

2. **Betting Lines & Odds**
   - Schedule files with spreads, totals, moneylines
   - All betting-relevant columns listed

3. **Player Performance Data**
   - Player stats, snap counts, NGS stats
   - Sample metrics shown

4. **Team Statistics**
   - Team-level aggregates, power ratings
   - EPA metrics

5. **Advanced Analytics**
   - Play-by-play, depth charts, injuries

6. **Betting Use Cases**
   - Pre-game betting (spreads/totals/ML)
   - Player props (performance stats, usage, NGS)
   - Live betting (PBP, EPA, Win Prob)
   - Advanced analysis (EPA, power rankings)

7. **Quick Reference Table**
   - All datasets sorted by record count
   - Category assignments

8. **Data Access Instructions**
   - File locations
   - How to load with polars

**Outputs:**
```
data/processed/2025_season_metrics.json
2025_SEASON_DATA.md
```

**How to Run:**
```powershell
python scripts/generate_2025_data_list.py
```

**Dependencies:** polars, pathlib, json

**Output Features:**
- JSON: Machine-readable with full metadata
- Markdown: Human-readable with formatted tables
- UTF-8 encoding for universal compatibility

---

### 2.5 phase3_process_data.py
**Path:** `scripts/phase3_process_data.py`
**Purpose:** Transform raw data into processed analytics datasets (legacy processing pipeline)

**What it does:**
- Processes multiple years of historical data
- Creates derived analytics datasets
- Handles missing data gracefully

**Processing Steps:**

1. **Schedules with Weather**
   - Reads schedules (multi-year)
   - Adds weather_category column
   - Output: `data/processed/schedules_with_weather.parquet`

2. **Team EPA by Game**
   - Processes play-by-play data
   - Calculates per-game EPA metrics
   - 3-game rolling averages
   - Output: `data/processed/team_epa_by_game.parquet`

3. **Player Season Aggregates**
   - Aggregates player stats across season
   - Career totals and averages
   - Output: `data/processed/player_season_aggregates.parquet`

4. **Starter Injuries**
   - Joins injuries with depth charts
   - Identifies injured starters
   - Output: `data/processed/starter_injuries.parquet`

**How to Run:**
```powershell
python scripts/phase3_process_data.py
```

**Dependencies:** polars, pathlib

**Notes:**
- Defensive processing (skips missing inputs)
- Prints inventory summary
- Legacy script (use process_team_stats.py for 2025 data)

---

## 3. API INTEGRATION SCRIPTS

### 3.1 integrate_odds_api.py
**Path:** `scripts/integrate_odds_api.py`
**Purpose:** The Odds API integration for live betting lines from multiple sportsbooks

**What it does:**
- Fetches live betting odds from The Odds API
- Covers multiple sportsbooks and markets
- Saves raw JSON and structured parquet

**Sportsbooks Covered:**
- DraftKings
- FanDuel
- BetMGM
- Caesars
- Bovada

**Markets Covered:**
- h2h (Moneyline)
- spreads (Point Spreads)
- totals (Over/Under)

**API Information:**
- Free Tier: 500 requests/month
- Paid Tiers: $99/mo (10k requests), $500/mo (unlimited)
- Cost per request: 1 request per market fetch

**Setup Required:**
1. Get free API key from https://the-odds-api.com/
2. Set environment variable:
   ```powershell
   # Windows
   $env:ODDS_API_KEY = "your_key_here"
   ```
3. Run script

**Outputs:**
```
data/raw/odds/h2h_odds_{timestamp}.json
data/raw/odds/spreads_odds_{timestamp}.json
data/raw/odds/totals_odds_{timestamp}.json
data/raw/odds/odds_combined_{timestamp}.parquet
data/raw/odds/odds_fetch_results_{timestamp}.json
```

**Output Schema (combined parquet):**
- game_id, commence_time
- home_team, away_team
- bookmaker (sportsbook name)
- market (h2h/spreads/totals)
- team (which team/outcome)
- price (American odds format: +150, -110)
- point (spread/total value)
- scraped_at

**How to Run:**
```powershell
python scripts/integrate_odds_api.py
# With auto-confirm:
python scripts/integrate_odds_api.py --no-confirm
```

**Dependencies:** requests, json, polars, pandas, pathlib, datetime, os, sys

**Error Handling:**
- Checks for API key existence
- Provides setup instructions if missing
- Shows requests remaining after each call

---

### 3.2 integrate_weather_api.py
**Path:** `scripts/integrate_weather_api.py`
**Purpose:** OpenWeatherMap API integration for game forecasts

**What it does:**
- Fetches weather forecasts for all 32 NFL stadiums
- Analyzes weather impact on betting
- Skips dome stadiums (no weather impact)

**Weather Impacts:**
- **High Wind (>15 mph):** Reduces passing efficiency, lowers totals
- **Freezing (<32°F):** Reduces scoring
- **Rain/Snow:** Favors run-heavy offenses
- **Dome games:** No weather impact

**Stadium Coverage:**
- All 32 NFL teams
- Exact lat/lon coordinates
- Dome identification

**API Information:**
- Free Tier: 1000 calls/day (more than enough)
- Data: temperature, wind speed, humidity, precipitation, description

**Setup Required:**
1. Sign up (free) at https://openweathermap.org/api
2. Set environment variable:
   ```powershell
   # Windows
   $env:WEATHER_API_KEY = "your_key_here"
   ```
3. Run script

**Output:**
```
data/raw/weather/weather_{timestamp}.parquet
```

**Output Schema:**
- team, stadium, is_dome
- temperature_f, wind_mph, humidity
- description (weather conditions)
- forecast_date
- impact (Favorable | High Wind - Lower Totals | Freezing - Lower Totals | Precipitation - Run-Heavy | None - Dome)

**Stadium Locations (32 stadiums):**
```
ARI: State Farm Stadium (Dome)
ATL: Mercedes-Benz Stadium (Dome)
BAL: M&T Bank Stadium
BUF: Highmark Stadium
CHI: Soldier Field
DAL: AT&T Stadium (Dome)
DET: Ford Field (Dome)
... [all 32 teams]
```

**How to Run:**
```powershell
python scripts/integrate_weather_api.py
# With auto-confirm:
python scripts/integrate_weather_api.py --no-confirm
```

**Dependencies:** requests, json, polars, pandas, pathlib, datetime, os, sys

**Demo Mode:**
- If no API key, creates sample weather data
- Useful for testing without API key

**Error Handling:**
- Graceful handling of API failures
- Continues processing other stadiums if one fails
- Shows API call usage

---

## 4. UTILITY & TESTING SCRIPTS

### 4.1 check_data_coverage.py
**Path:** `scripts/check_data_coverage.py`
**Purpose:** Check all available data and columns across all parquet files

**What it does:**
- Scans all parquet files in data/raw/
- Lists records and columns for each
- Shows sample columns
- Calculates total data points available

**Output Example:**
```
schedules_2025_latest.parquet
  Records: 285
  Columns: 42
  Column samples: game_id, season, week, gameday, gametime, ...
                  ... and 32 more

pbp_2025.parquet
  Records: 45,892
  Columns: 372
  Column samples: play_id, game_id, season, week, posteam, ...
                  ... and 362 more

TOTAL DATA POINTS AVAILABLE: 1,247 columns across all datasets
```

**How to Run:**
```powershell
python scripts/check_data_coverage.py
```

**Dependencies:** polars, pathlib

**Use Cases:**
- Quick inventory check
- Verify scrape completion
- Column discovery

---

### 4.2 check_teams.py
**Path:** `scripts/check_teams.py`
**Purpose:** Investigate what load_teams() returns

**What it does:**
- Loads teams data from nflreadpy
- Shows structure and coverage
- Lists all seasons available
- Shows current NFL teams

**Output Example:**
```
Loading teams data...

Total records: 2,592
Columns: ['team', 'season', 'full', 'location', 'nickname', 'nfl_team_id', ...]

Seasons included: 108
Range: 1920 - 2025

Current season (2025) teams: 32

Current NFL teams (32):
['ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LA', 'LAC', 'LV', 'MIA',
 'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WAS']
```

**How to Run:**
```powershell
python scripts/check_teams.py
```

**Dependencies:** nflreadpy, polars

**Use Cases:**
- Validate teams data structure
- Check for new teams
- Verify season coverage

---

### 4.3 test_setup.py
**Path:** `scripts/test_setup.py`
**Purpose:** Quick dependency and API smoke check

**What it does:**
- Tests nflreadpy installation
- Tests ESPN API connectivity
- Validates basic data fetching

**Tests:**
1. Load teams data (nflreadpy)
2. Fetch ESPN scoreboard (API)

**Output Example:**
```
Testing nflreadpy...
  [OK] Teams data: 2,592 records

Testing ESPN API...
  [OK] Scoreboard: 14 games

ALL TESTS PASSED!
```

**How to Run:**
```powershell
python scripts/test_setup.py
```

**Dependencies:** nflreadpy, requests

**Use Cases:**
- Quick environment check
- Validate setup after install
- Pre-scrape connectivity test

---

### 4.4 daily_update.py
**Path:** `scripts/daily_update.py`
**Purpose:** Daily automated update script for current season data

**What it does:**
- Updates 5 critical data sources daily
- Logs all operations
- Designed for Task Scheduler/cron automation

**Updates (in order):**
1. **Schedules** (with updated results and lines)
2. **Injuries** (CRITICAL - shows current week status)
3. **Depth Charts** (starter changes)
4. **Weekly Rosters** (active/inactive status)
5. **Player Stats** (after games complete)

**Outputs:**
```
data/raw/schedules_2024_latest.parquet
data/raw/injuries_2024_latest.parquet
data/raw/depth_charts_2024_latest.parquet
data/raw/rosters_2024_latest.parquet
data/raw/player_stats_2024_latest.parquet
logs/daily_update_{YYYYMMDD}.log
```

**Logging:**
- Creates daily log files
- Both file and console output
- Detailed progress and error tracking

**How to Run:**
```powershell
# Manual run
python scripts/daily_update.py

# Windows Task Scheduler (daily at 6 AM)
# Action: python.exe
# Arguments: C:\path\to\scripts\daily_update.py
# Start in: C:\path\to\project\
```

**Dependencies:** nflreadpy, polars, pathlib, datetime, logging

**Special Features:**
- Injury week summary (counts OUT players)
- Graceful error handling
- Maintains latest files only

---

### 4.5 view_odds.py, demo_save_view.py
**Path:** `scripts/view_odds.py`, `scripts/demo_save_view.py`
**Purpose:** Utility scripts for odds viewing and demo data

**view_odds.py:**
- Views/parses odds data from The Odds API
- Displays odds in readable format

**demo_save_view.py:**
- Demonstrates save/load operations
- Shows data persistence patterns

**Dependencies:** polars, json

---

## 5. VALIDATION & REPORTING SCRIPTS

### 5.1 generate_inventory.py
**Path:** `scripts/generate_inventory.py`
**Purpose:** Generate comprehensive project inventory and health report

**What it does:**
- Crawls entire codebase
- Categorizes all files (core/source/test/docs/config/template)
- Calculates project health score (0-10)
- Identifies refactor candidates and risks
- Generates detailed reports

**Outputs:**
```
inventory/inventory_manifest.json      (structured data)
inventory/project_inventory_report.md  (human-readable)
```

**Manifest Contents:**
- File inventory (all project files)
- Size, LOC, category, risk level
- Dependencies per file
- Framework detection
- Tags and roles

**Report Sections:**
1. Executive Summary (health score)
2. Project Overview (file counts, risk levels)
3. Architecture Analysis (category breakdown)
4. File Category Analysis (top files per category)
5. Critical Issues & Recommendations
6. Security Analysis (config files, secrets)
7. Performance Analysis (large files)
8. Action Plan (prioritized tasks)
9. Maintenance Checklist
10. Quality Metrics (test coverage, doc coverage)

**Health Score Factors:**
- Large file count
- Test coverage ratio
- Documentation ratio
- Deprecated file ratio
- Security sensitive files

**How to Run:**
```powershell
python scripts/generate_inventory.py
```

**Dependencies:** json, re, collections.Counter, dataclasses, datetime, pathlib, typing

**Use Cases:**
- Project health monitoring
- Technical debt tracking
- Onboarding documentation
- Governance reporting

---

### 5.2 create_betting_dashboard.py
**Path:** `scripts/create_betting_dashboard.py`
**Purpose:** Generate comprehensive betting analysis reports and dashboards

**What it does:**
- Combines all scraped data sources
- Generates 4 types of betting reports
- Exports in multiple formats (CSV, JSON)

**Reports Generated:**

1. **Weekly Betting Sheet**
   - Next 20 games
   - Spreads, totals, moneylines
   - Stadium and roof info
   - Output: `reports/weekly_betting_sheet_{date}.csv`

2. **Player Props Analysis**
   - Top 100 players
   - Average yards (pass/rush/rec)
   - Total TDs, games played
   - Output: `reports/player_props_analysis_{date}.csv`

3. **Team Performance Metrics**
   - EPA metrics (offense & defense)
   - Success rates
   - Total plays
   - Output: `reports/team_performance_metrics_{date}.csv`

4. **Master Summary Report**
   - Data coverage statistics
   - Reports generated list
   - Betting readiness %
   - Data sources catalog
   - Output: `reports/betting_summary_{date}.json`

**Data Sources Combined:**
- Schedules (betting lines)
- Play-by-play (EPA)
- Player stats (props)
- Snap counts (usage)
- Depth charts (starters)
- Live odds (optional)
- Weather forecasts (optional)

**How to Run:**
```powershell
python scripts/create_betting_dashboard.py
# With auto-confirm:
python scripts/create_betting_dashboard.py --no-confirm
```

**Dependencies:** polars, pandas, json, pathlib, datetime, sys

**Output Location:** `reports/` directory

**Next Steps Suggested:**
1. Review reports in reports/ folder
2. Set up The Odds API key (optional)
3. Set up Weather API key (optional)
4. Run automate_2025_updates.py (daily automation)

---

### 5.3 SCRAPE_INVENTORY.md and Related Reports
**Purpose:** Documentation of scraped data and system status

See Section 2 (Reports Analysis) for full documentation of all report files.

---

## 6. PHASE SCRIPTS (Legacy)

### 6.1 phase1_explore_all.py
**Path:** `scripts/phase1_explore_all.py`
**Purpose:** Quick exploration / smoke-scrape to populate sample datasets

**What it does:**
- Minimal sample scrapes for development
- Fast initial data population
- 2024 season only

**Data Scraped:**
- Schedules 2024
- Injuries 2024
- Depth charts 2024
- ESPN scoreboard (latest)
- Teams 2024
- Sample player stats (offense only)

**Outputs:**
```
data/raw/schedules_2024.parquet
data/raw/injuries_2024.parquet
data/raw/depth_charts_2024.parquet
data/raw/espn_scoreboard_latest.json
data/raw/teams_2024.parquet
data/raw/player_stats_2024_sample.parquet
```

**How to Run:**
```powershell
python scripts/phase1_explore_all.py
```

**Use Case:** Quick development setup

---

### 6.2 phase2_backfill.py
**Path:** `scripts/phase2_backfill.py`
**Purpose:** Multi-year historical backfill (heavy downloads)

**What it does:**
- Historical data acquisition (2019-2024)
- Interactive confirmation prompt
- Large dataset downloads

**Data Scraped:**
- Schedules 2019-2024 (5 years)
- Play-by-play 2022-2024 (3 years, ~600 MB)
- Injuries, player stats, snap counts 2022-2024
- Next Gen Stats 2022-2024 (3 types)

**Estimated:**
- Download: 600 MB - 1+ GB
- Time: 30-60 minutes

**Outputs:**
```
data/raw/schedules_2019_2024.parquet
data/raw/pbp_2022_2024.parquet
data/raw/pbp_{season}.parquet (per-season splits)
data/raw/injuries_2022_2024.parquet
data/raw/player_stats_2022_2024.parquet
data/raw/snap_counts_2022_2024.parquet
data/raw/ngs_*_2022_2024.parquet
```

**How to Run:**
```powershell
python scripts/phase2_backfill.py
# Prompts: Continue with backfill? (yes/no): yes
```

**Use Case:** Historical analysis and backtesting

---

## 7. CROSS-REFERENCE TABLE

| Script | Category | Input Sources | Output Files | Run Time | 2025 Data |
|--------|----------|---------------|--------------|----------|-----------|
| scrape_everything.py | Master Scraper | nflreadpy, nflscraPy, ESPN, sportsref | 16 files (800MB-1.2GB) | 45-90 min | ❌ |
| scrape_2025_gambling.py | Master Scraper | nflreadpy, ESPN | 11 files (2025 data) | 5-15 min | ✅ |
| scrape_team_stats_data.py | Master Scraper | nflreadpy | 8 files (2025 data) | 3-8 min | ✅ |
| scrape_elo_ratings.py | Processing | team_stats_2025_complete.parquet | power_ratings_2025.parquet | <1 min | ✅ |
| process_team_stats.py | Processing | 5 raw files | team_stats_2025_complete.* | 1-3 min | ✅ |
| fetch_team_data.py | Processing | nflreadpy, power ratings | team_data_{team}_{season}.json | <1 min | ✅ |
| generate_data_index.py | Processing | All parquet files | betting_metrics_index.json | <1 min | ✅ |
| generate_2025_data_list.py | Processing | 2025 parquet files | 2025_season_metrics.json, .md | <1 min | ✅ |
| phase3_process_data.py | Processing | Historical raw files | 4 processed files | 2-5 min | ❌ |
| integrate_odds_api.py | API Integration | The Odds API | odds files (JSON + parquet) | <1 min | ✅ |
| integrate_weather_api.py | API Integration | OpenWeatherMap | weather parquet | <1 min | ✅ |
| check_data_coverage.py | Utility | Parquet files | Console output | <1 min | ✅ |
| check_teams.py | Utility | nflreadpy | Console output | <1 min | ✅ |
| test_setup.py | Testing | nflreadpy, ESPN | Console output | <1 min | ✅ |
| daily_update.py | Automation | nflreadpy | 5 latest files + log | 2-5 min | ✅ |
| generate_inventory.py | Validation | Codebase files | manifest.json + report.md | 1-2 min | N/A |
| create_betting_dashboard.py | Reporting | Multiple sources | 4 report files | 1-2 min | ✅ |
| phase1_explore_all.py | Legacy | nflreadpy, ESPN | 6 sample files | 2-5 min | ❌ |
| phase2_backfill.py | Legacy | nflreadpy, nflscraPy | Historical files (600MB+) | 30-60 min | ❌ |

---

## 8. RECOMMENDED EXECUTION ORDER

### For 2025 Season Analysis (Quickstart):
```powershell
# Step 1: Scrape 2025 gambling data (5-15 min)
python scripts/scrape_2025_gambling.py

# Step 2: Process team stats (1-3 min)
python scripts/process_team_stats.py

# Step 3: Generate power ratings (1 min)
python scripts/scrape_elo_ratings.py

# Step 4: Generate betting dashboard (1-2 min)
python scripts/create_betting_dashboard.py

# Step 5: Create data indexes (1 min each)
python scripts/generate_data_index.py
python scripts/generate_2025_data_list.py

# Optional: API integrations (requires API keys)
python scripts/integrate_odds_api.py
python scripts/integrate_weather_api.py

# Total time: ~10-25 minutes for complete 2025 setup
```

### For Historical Analysis:
```powershell
# Step 1: Master historical scrape (45-90 min)
python scripts/scrape_everything.py

# Step 2: Process historical data (2-5 min)
python scripts/phase3_process_data.py

# Step 3: Generate inventory
python scripts/generate_inventory.py
```

### For Daily Updates:
```powershell
# Run daily (automate with Task Scheduler)
python scripts/daily_update.py
```

### For Team-Specific Analysis:
```powershell
# Fetch specific team data
python scripts/fetch_team_data.py KC 2025
python scripts/fetch_team_data.py BUF 2025 --historical
```

---

## 9. KEY DEPENDENCIES SUMMARY

**Primary Dependencies:**
- **nflreadpy**: Primary data source (11 data types)
- **polars**: Fast dataframe library (primary)
- **pandas**: Dataframe library (secondary)
- **requests**: HTTP library for APIs
- **json**: JSON handling
- **pathlib**: Path handling

**Optional Dependencies:**
- **nflscraPy**: FiveThirtyEight ELO ratings
- **sportsref-nfl**: Pro Football Reference data

**API Keys (Optional):**
- **The Odds API**: Live betting odds (ODDS_API_KEY)
- **OpenWeatherMap**: Weather forecasts (WEATHER_API_KEY)

---

## 10. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACQUISITION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  scrape_everything.py          scrape_2025_gambling.py          │
│  ├── Historical (2022-2024)    ├── 2025 Season Only            │
│  ├── 16 data types             ├── 9 data types                │
│  └── 800MB-1.2GB               └── Gambling-focused            │
│                                                                  │
│  scrape_team_stats_data.py                                      │
│  ├── 2025 Season Only                                           │
│  ├── 8 data types                                               │
│  └── Team Stats focused                                         │
│                                                                  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RAW DATA STORAGE                            │
│                    data/raw/*.parquet                            │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PROCESSING LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  process_team_stats.py              phase3_process_data.py      │
│  ├── 2025 team aggregation          ├── Historical processing  │
│  ├── 7 stat categories               ├── Weather enrichment    │
│  ├── EPA calculations                ├── EPA by game           │
│  ├── Betting metrics                 ├── Player aggregates     │
│  └── Rankings (40+ metrics)          └── Starter injuries      │
│                                                                  │
│  scrape_elo_ratings.py              generate_data_index.py      │
│  ├── Power ratings                   ├── Metrics catalog        │
│  ├── ELO-like scores                 ├── Relevance ratings     │
│  └── Team rankings                   └── Column descriptions    │
│                                                                  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PROCESSED DATA STORAGE                         │
│                 data/processed/*.parquet                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REPORTING LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  create_betting_dashboard.py        generate_2025_data_list.py  │
│  ├── Weekly betting sheet            ├── Season inventory       │
│  ├── Player props analysis           ├── JSON + Markdown        │
│  ├── Team performance                └── Use case guides        │
│  └── Master summary                                             │
│                                                                  │
│  fetch_team_data.py                 generate_inventory.py       │
│  ├── Team-specific reports          ├── Project health         │
│  └── JSON output                    └── Manifest + report       │
│                                                                  │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OUTPUTS & REPORTS                              │
│              reports/*.csv, *.json, *.md                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. FILE SIZE REFERENCE

| File Pattern | Typical Size | Notes |
|-------------|--------------|-------|
| schedules_*.parquet | 5-50 MB | Varies by year range |
| pbp_*.parquet | 150-200 MB per season | Largest files |
| pbp_2022_2024.parquet | ~500 MB | 3 seasons combined |
| player_stats_*.parquet | 20-50 MB | Per season or range |
| injuries_*.parquet | 5-15 MB | Per season |
| snap_counts_*.parquet | 10-20 MB | Per season |
| ngs_*_*.parquet | 5-10 MB each | Per stat type |
| rosters_*.parquet | 5-10 MB | Per season |
| teams_*.parquet | 1-2 MB | Metadata |
| depth_charts_*.parquet | 5-10 MB | Per season |
| power_ratings_*.parquet | <1 MB | Derived data |
| team_stats_*_complete.parquet | 1-2 MB | Aggregated |
| elo_1970_2025.parquet | 10-20 MB | 54 years of ELO |

**Total Storage Requirements:**
- **Minimal (2025 only):** 50-100 MB
- **Standard (2022-2024):** 600-800 MB
- **Complete (all history):** 1-1.5 GB

---

## 12. ERROR HANDLING PATTERNS

All scripts follow consistent error handling:

1. **Defensive Column Checks:**
   ```python
   if 'spread_line' in schedules.columns:
       # Process spread line
   else:
       print("[SKIP] No spread line column found")
   ```

2. **Graceful API Failures:**
   ```python
   try:
       standings = fetch_espn_standings()
   except Exception as e:
       print(f"[ERROR] API failed: {e}")
       standings = fallback_standings
   ```

3. **Missing Input Handling:**
   ```python
   if not pbp_file.exists():
       print("[SKIP] No play-by-play data found")
       return
   ```

4. **Logging for Automation:**
   ```python
   logger.info("[OK] Processed 285 games")
   logger.error(f"[ERROR] Failed: {e}")
   ```

---

## 13. NEXT GENERATION ROADMAP

**Immediate Priorities:**
1. Add NextJS backend equivalents
2. Create TypeScript API wrappers
3. Implement data caching layer
4. Add GraphQL endpoints

**Future Enhancements:**
1. Real-time data streaming
2. Machine learning predictions
3. Advanced betting models
4. Mobile app backend

---

**Document Status:** ✅ Complete
**Last Updated:** 2025-10-16
**Maintainer:** NFL Scraper Backend Team
**Total Scripts Documented:** 21
**Total Output Files:** 40+
**Total Processing Categories:** 6
