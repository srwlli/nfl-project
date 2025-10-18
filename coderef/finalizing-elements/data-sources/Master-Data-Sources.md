# Master Data Sources Inventory

**Project:** Next-Scraper NFL Data Platform
**Last Updated:** October 17, 2025
**Total Sources Identified:** 33

---

## Complete Data Sources List

This document contains ALL data sources, APIs, packages, and services identified in the project, organized by category.

**Data Scope Legend:**
- 📊 **Both Historical + 2025** - Provides historical data AND current 2025 season
- 📅 **2025 Only** - Current season/live data only
- 📚 **Historical Only** - Past seasons only (pre-2025)

---

## 1. Core Data APIs (Currently Active/Planned)

### 1.1 nflreadpy
- **Type:** Python Package (Open Source)
- **Cost:** Free
- **Authentication:** None required
- **Status:** ✅ Currently Active
- **GitHub:** `https://github.com/nflverse/nflverse-pbp`
- **PyPI:** `https://pypi.org/project/nflreadpy/`
- **Coverage:** 1999-present (varies by data type)
- **Data Scope:** 📊 Both Historical + 2025
- **Update Frequency:** Real-time during season
- **Data Provided:**
  - Schedules with betting lines
  - Play-by-play (372 columns: EPA, Win Probability, etc.)
  - Player stats (weekly & seasonal)
  - Injuries
  - Depth charts
  - Snap counts
  - Next Gen Stats (passing, rushing, receiving)
  - Rosters
  - Teams metadata
  - Officials
  - FTN charting data

### 1.2 nflscraPy
- **Type:** Python Package (Open Source)
- **Cost:** Free
- **Authentication:** None required
- **Rate Limit:** 3.5 seconds between requests
- **Status:** ✅ Currently Active
- **GitHub:** `https://github.com/HurricaneLabs/nflscrapy`
- **PyPI:** `https://pypi.org/project/nflscrapy/`
- **Coverage:** 1970-present (ELO), 2000-present (others)
- **Data Scope:** 📊 Both Historical + 2025
- **Update Frequency:** Daily
- **Data Provided:**
  - FiveThirtyEight ELO ratings (1970-2025)
  - Season splits (team performance by situation)
  - Expected points model

### 1.3 ESPN API
- **Type:** Public REST API
- **Cost:** Free
- **Authentication:** None required
- **Status:** ⚠️ Need to Add
- **URL:** `https://site.api.espn.com/apis/site/v2/sports/football/nfl/`
- **Coverage:** Current season
- **Data Scope:** 📅 2025 Only (Live/Current Season)
- **Update Frequency:** Real-time during games
- **Endpoints:**
  - `/scoreboard` - Live game scores and status
  - `/standings` - Current team standings
- **Data Provided:**
  - Live game scores
  - Game status & timing (quarter, clock)
  - Basic odds
  - Win probability
  - Team stats during games
  - Standings (wins, losses, point differential)

### 1.4 sportsref-nfl
- **Type:** Python Package (Pro Football Reference wrapper)
- **Cost:** Free
- **Authentication:** None required
- **Status:** ✅ Currently Active
- **GitHub:** `https://github.com/roclark/sportsref`
- **PyPI:** `https://pypi.org/project/sportsref/`
- **Coverage:** 1920-present
- **Data Scope:** 📊 Both Historical + 2025
- **Update Frequency:** Daily
- **Data Provided:**
  - Pro Football Reference advanced stats
  - Historical team & player data
  - Game logs
  - Career statistics

### 1.5 The Odds API (Optional)
- **Type:** Commercial REST API
- **Cost:** Paid
  - Free: 500 requests/month
  - Starter: $99/month (10,000 requests)
  - Pro: $500/month (unlimited)
- **Authentication:** API Key required (ODDS_API_KEY)
- **Status:** ❌ Optional - Not Currently Used
- **URL:** `https://api.the-odds-api.com/v4`
- **Coverage:** Live/Current odds
- **Data Scope:** 📅 2025 Only (Live Betting Data)
- **Update Frequency:** Real-time (1-5 minutes)
- **Markets:**
  - h2h (Moneyline)
  - spreads (Point spreads)
  - totals (Over/Under)
  - player_props
- **Bookmakers:** DraftKings, FanDuel, BetMGM, Caesars, Bovada
- **Data Provided:**
  - Live betting odds from multiple sportsbooks
  - Line movement tracking
  - Player props markets

### 1.6 OpenWeatherMap API (Optional)
- **Type:** Commercial REST API
- **Cost:** Paid
  - Free: 1,000 calls/day
  - Startup: $40/month (100k calls/month)
- **Authentication:** API Key required (WEATHER_API_KEY)
- **Status:** ❌ Optional - Not Currently Used
- **URL:** `https://api.openweathermap.org/data/2.5`
- **Stadium Coverage:** 32 NFL stadiums (23 outdoor, 9 domes)
- **Data Scope:** 📅 2025 Only (Current Weather/Forecasts)
- **Data Provided:**
  - Temperature (Fahrenheit)
  - Wind speed (mph)
  - Precipitation chance
  - Humidity
  - Weather description

---

## 2. Premium/Enterprise APIs (Researched but Not Implemented)

### 2.1 SportsDataIO
- **Type:** Premium Enterprise API
- **Cost:** Enterprise-level pricing
- **Status:** 📋 Researched Only
- **URL:** `https://sportsdata.io`
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - Comprehensive NFL data
  - Live scores
  - Play-by-play
  - Rosters
  - Depth charts
  - Player profiles
  - Betting odds
  - Fantasy projections
  - News
  - Statistical matchups

### 2.2 Sportradar
- **Type:** Premium Enterprise API (Official NFL Data Partner)
- **Cost:** Enterprise pricing
- **Status:** 📋 Researched Only
- **URL:** `https://developer.sportradar.com`
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - Schedules
  - Standings
  - Live scores
  - Play-by-play (full coverage including preseason)
  - Rosters
  - Depth charts
  - Injuries
  - Statistics
  - Draft information
  - Real-time push feeds

### 2.3 Genius Sports
- **Type:** Premium Enterprise API (Official NFL Sports Data Partner)
- **Cost:** Enterprise pricing
- **Status:** 📋 Researched Only
- **URL:** `https://www.geniussports.com`
- **Focus:** Live betting operations
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - Ultra-low latency live NFL data
  - Comprehensive historical data
  - Detailed play-by-play
  - Real-time stats

### 2.4 OddsMatrix
- **Type:** Premium Enterprise API
- **Cost:** Premium sportsbook-focused pricing
- **Status:** 📋 Researched Only
- **URL:** `https://oddsmatrix.com`
- **Data Scope:** 📊 Both Historical + 2025 (Live + Historical Odds)
- **Data Provided:**
  - Real-time NFL betting odds
  - Pre-game & live betting odds
  - Play-by-play updates
  - Player stats
  - Game-changing moments
  - Market settlement data

### 2.5 Sports Info Solutions (SIS DataHub Pro)
- **Type:** Premium Enterprise Service
- **Cost:** Enterprise pricing (no public pricing)
- **Status:** 📋 Researched Only
- **URL:** `https://www.sportsinfosolutions.com`
- **Unique Feature:** Referee tendencies
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - Advanced NFL data
  - Formations
  - Offensive/defensive analysis
  - Injury tracking
  - Referee reports
  - Predictive analytics
  - Situational analysis

### 2.6 SumerSports
- **Type:** Premium Analytics Platform
- **Cost:** Premium pricing
- **Status:** 📋 Researched Only
- **URL:** `https://sumersports.com`
- **Data Scope:** 📅 2025 Only (Current Analysis)
- **Data Provided:**
  - Football intelligence by NFL veterans combined with AI
  - AI-powered analysis
  - Expert analysis
  - Predictive modeling

### 2.7 Goalserve NFL API
- **Type:** Premium API
- **Cost:** Premium pricing
- **Status:** 📋 Researched Only
- **URL:** `https://www.goalserve.com`
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - Live scores
  - Player statistics
  - Team data
  - Rosters
  - Injuries
  - Standings
  - Betting odds
  - Historical stats

### 2.8 OpticOdds NFL API
- **Type:** Premium Enterprise API
- **Cost:** Enterprise pricing
- **Status:** 📋 Researched Only
- **URL:** `https://opticodds.com`
- **Data Scope:** 📅 2025 Only (Live Betting Focus)
- **Data Provided:**
  - Real-time NFL data for sportsbook operators
  - Live game information
  - In-play markets
  - Player stats
  - Play-by-play updates
  - Bet settlement
  - Risk monitoring

### 2.9 Zyla Labs NFL Players API
- **Type:** Premium/Freemium API
- **Cost:** Premium with unknown limits
- **Status:** 📋 Researched Only
- **URL:** `https://zylalabs.com`
- **Unique Feature:** Social media sentiment tracking
- **Data Scope:** 📅 2025 Only (Current Player Data)
- **Data Provided:**
  - Player profile details
  - Social media analysis
  - Player popularity tracking
  - Sentiment analysis
  - Real-time player updates

### 2.10 Entity Sport NFL API
- **Type:** Premium API
- **Cost:** Premium pricing
- **Status:** 📋 Researched Only
- **URL:** `https://www.entitysport.com`
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - Real-time player statistics
  - Live scores
  - Career stats
  - News highlights
  - Player profiles

### 2.11 Statorium NFL API
- **Type:** Premium API
- **Cost:** Premium pricing
- **Status:** 📋 Researched Only
- **URL:** `https://statorium.com`
- **Unique Feature:** Official player photos
- **Data Scope:** 📅 2025 Only (Current Season)
- **Data Provided:**
  - Player photos
  - Season stats
  - Live player scores
  - News feeds

### 2.12 Apify NFL Stats Scraper
- **Type:** Paid Web Scraping Service
- **Cost:** Unknown pricing
- **Status:** 📋 Researched Only
- **URL:** `https://apify.com/payai/nfl-stats`
- **Data Scope:** 📊 Both Historical + 2025 (Multi-source aggregation)
- **Data Provided:**
  - Multi-source scraping (ESPN, NFL.com, TeamRankings, Pro Football Reference)
  - Aggregated data
  - EV calculations

---

## 3. Free/Low-Cost Data Sources (Available but Not Yet Implemented)

### 3.1 Pro Football Reference
- **Type:** Free Website with CSV Exports
- **Cost:** Free
- **Status:** 📋 Available (sportsref-nfl library already integrated)
- **URL:** `https://www.pro-football-reference.com`
- **Coverage:** 1967-present
- **Data Scope:** 📊 Both Historical + 2025
- **Update Frequency:** Weekly during season
- **Export Options:** CSV/Excel available
- **Data Provided:**
  - Complete historical data
  - Individual player and team statistics
  - Advanced metrics (AV, ANY/A, DVOA)
  - Awards and honors
  - Draft history and combine data
  - Coaches and staff records
  - Play Index search tool
  - Game logs and career stats

### 3.2 NFL Next Gen Stats
- **Type:** Official NFL Website (Free)
- **Cost:** Free
- **Status:** 📋 Available (Web scraping possible but against TOS)
- **URL:** `https://nextgenstats.nfl.com`
- **Coverage:** 2016-present
- **Data Scope:** 📊 Both Historical + 2025 (2016-present)
- **Update Frequency:** Weekly during season
- **Data Provided:**
  - Real-time player tracking data (speed, acceleration, separation)
  - Machine learning models:
    - Completion Probability
    - Expected Rushing Yards
    - Win Probability
    - Defensive rankings
  - Player rankings by position with NGS metrics
  - Weekly insights and analysis

### 3.3 StatMuse
- **Type:** Free Website
- **Cost:** Free
- **Status:** 📋 Available
- **URL:** `https://www.statmuse.com/nfl`
- **Features:** Natural language queries, voice search support
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - Natural language search capability
  - Player stats and team stats
  - Historical data and trends
  - Player comparisons
  - Game logs and career stats
  - Data visualizations

### 3.4 NFL.com Stats
- **Type:** Official NFL Website (Free)
- **Cost:** Free
- **Status:** 📋 Available (Limited historical data, no API access)
- **URL:** `https://www.nfl.com/stats`
- **Coverage:** Current season focus
- **Data Scope:** 📅 2025 Only (Current Season Focus)
- **Data Provided:**
  - Official NFL player and team stats
  - Stat leaders by category
  - Fantasy football stats
  - Video highlights linked to stats
  - Game summaries

### 3.5 NFLsavant.com
- **Type:** Free Website with CSV Downloads
- **Cost:** Free
- **Status:** 📋 Available
- **URL:** `https://nflsavant.com`
- **Coverage:** Play-by-play data 2013-2024
- **Data Scope:** 📚 Historical Only (2013-2024, no 2025 yet)
- **Format:** CSV files
- **Data Provided:**
  - Free CSV downloads of play-by-play data (2013-2024)
  - Custom stat queries
  - Advanced filters (formation, play type, down, team)
  - Target distribution charts
  - Route tree visualizations

### 3.6 Sports Insights
- **Type:** Free Website
- **Cost:** Free
- **Status:** 📋 Available (API access unclear, may be web-only)
- **URL:** `https://www.sportsinsights.com/nfl/`
- **Data Scope:** 📊 Both Historical + 2025 (Odds trends)
- **Data Provided:**
  - Free live NFL odds
  - Sportsbook movement tracking
  - Betting market trends and analysis
  - Historical odds data

### 3.7 TeamRankings
- **Type:** Freemium Website
- **Cost:** Free tier available, Premium $99-299/year
- **Status:** 📋 Available
- **URL:** `https://www.teamrankings.com`
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - 200,000+ pages of projections, stats, rankings, odds
  - NFL team stats in tables
  - ATS (Against The Spread) trends and splits
  - Custom betting trends tool
  - Betting picks and predictions (premium)

### 3.8 RotoBaller Fantasy API
- **Type:** Freemium
- **Cost:** $-$$ (freemium with unknown limits)
- **Status:** 📋 Available (API access unknown)
- **URL:** `https://www.rotoballer.com`
- **Data Scope:** 📅 2025 Only (Current Fantasy Focus)
- **Data Provided:**
  - Fantasy-focused player news
  - Player updates
  - Fantasy-specific insights

---

## 4. Premium Stats Sites (Subscription-Based Services)

### 4.1 Pro Football Focus (PFF)
- **Type:** Premium Subscription Service
- **Cost:** $40-200/year
  - PFF Edge: $39.99/year
  - PFF+: $99.99/year
  - PFF Elite: $199.99/year
- **Status:** 📋 Reference/Inspiration
- **URL:** `https://www.pff.com`
- **Coverage:** 2006-present (player grades)
- **Data Scope:** 📊 Both Historical + 2025 (2006-present)
- **Data Provided:**
  - Proprietary player grading (0-100 scale) on every play
  - All-22 film analysis
  - Advanced metrics: WAR, EPA, success rate
  - Fantasy tools and projections
  - Draft analysis and prospect grades
  - Betting insights and picks

### 4.2 FTN Fantasy (StatsHub)
- **Type:** Premium Subscription Service
- **Cost:** $60-120/year
- **Status:** 📋 Reference (Data available via nflreadpy)
- **URL:** `https://ftnfantasy.com/nfl/stats`
- **Coverage:** 2022-present (manual charting)
- **Data Scope:** 📊 Both Historical + 2025 (2022-present)
- **Integration:** Data available via nflreadpy (MIT license, CC-BY-SA 4.0)
- **Data Provided:**
  - All-in-one research tool powered by FTN Data
  - Proprietary metrics: DVOA, EPA per play, explosive run rate
  - Manual play charting (route tracking, coverage schemes, pressure)
  - Fantasy football projections and rankings

### 4.3 Football Outsiders
- **Type:** Premium Subscription Service
- **Cost:** $50/year
- **Status:** 📋 Reference/Inspiration
- **URL:** `https://www.footballoutsiders.com`
- **Coverage:** DVOA 1989-present
- **Data Scope:** 📊 Both Historical + 2025 (1989-present DVOA)
- **Data Provided:**
  - DVOA (Defense-adjusted Value Over Average)
  - Advanced team and player efficiency metrics
  - Play-by-play analysis
  - Almanac (annual book with deep stats)
  - Premium articles and analysis

### 4.4 Sharp Football Analysis
- **Type:** Premium Subscription Service
- **Cost:** $499-999/year
- **Status:** 📋 Reference/Inspiration
- **URL:** `https://www.sharpfootballanalysis.com`
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - Data-driven analysis by Warren Sharp
  - Coaching and play-calling insights
  - Betting predictions (19-year documented track record)
  - Weekly matchup previews
  - Coaching tendency analysis

### 4.5 PlayerProfiler
- **Type:** Freemium Subscription Service
- **Cost:** Free tier available, Premium ~$50/year
- **Status:** 📋 Reference/Inspiration
- **URL:** `https://www.playerprofiler.com`
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - Advanced fantasy football metrics
  - College dominator ratings
  - NFL athleticism scores
  - Market share analysis (targets, carries, snaps)

### 4.6 Opta Analyst (The Analyst)
- **Type:** Freemium Service
- **Status:** 📋 Reference/Inspiration
- **URL:** `https://theanalyst.com/articles/nfl-advanced-stats-zone`
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - Opta's advanced NFL stats and player rankings
  - Expected goals models
  - Performance analytics
  - Data visualizations

### 4.7 Advanced Football Analytics
- **Type:** Free Website
- **Cost:** Free
- **Status:** 📋 Reference/Inspiration
- **URL:** `http://www.advancedfootballanalytics.com`
- **Data Scope:** 📊 Both Historical + 2025
- **Data Provided:**
  - Win Probability (WP) models
  - Expected Points Added (EPA) analysis
  - 4th down decision analysis
  - Statistical articles and research

---

## Summary by Status

### ✅ Currently Active (4 sources)
1. nflreadpy - 📊 Both
2. nflscraPy - 📊 Both
3. sportsref-nfl - 📊 Both
4. Supabase (database) - 📊 Both

### ⚠️ Need to Add (1 source)
5. ESPN API - 📅 2025 Only

### ❌ Optional/Not Currently Used (2 sources)
6. The Odds API - 📅 2025 Only
7. OpenWeatherMap API - 📅 2025 Only

### 📋 Researched/Available (26 sources)
- 12 Premium/Enterprise APIs (mix of 📊 Both and 📅 2025 Only)
- 8 Free/Low-Cost Sources (mostly 📊 Both, some 📅 2025 Only)
- 7 Premium Stats Sites (all 📊 Both)

---

## Data Scope Summary

| Data Scope | Count | Percentage |
|------------|-------|------------|
| 📊 **Both Historical + 2025** | 24 | 73% |
| 📅 **2025 Only** | 8 | 24% |
| 📚 **Historical Only** | 1 | 3% |
| **TOTAL** | **33** | **100%** |

### Sources by Data Scope

**📊 Both Historical + 2025 (24 sources):**
- nflreadpy, nflscraPy, sportsref-nfl
- SportsDataIO, Sportradar, Genius Sports, OddsMatrix
- SIS DataHub Pro, Goalserve, Entity Sport, Apify
- Pro Football Reference, NFL Next Gen Stats, StatMuse
- Sports Insights, TeamRankings
- PFF, FTN Fantasy, Football Outsiders, Sharp Football
- PlayerProfiler, Opta Analyst, Advanced Football Analytics

**📅 2025 Only (8 sources):**
- ESPN API, The Odds API, OpenWeatherMap API
- SumerSports, OpticOdds, Zyla Labs, Statorium
- NFL.com Stats, RotoBaller

**📚 Historical Only (1 source):**
- NFLsavant.com (2013-2024)

---

## Total Count by Category

| Category | Count |
|----------|-------|
| **Core APIs (Active/Planned)** | 6 |
| **Premium/Enterprise APIs** | 12 |
| **Free/Low-Cost Sources** | 8 |
| **Premium Stats Sites** | 7 |
| **TOTAL** | **33** |

---

## Related Documentation

- **Full API Details:** `additional-context/FREE_AND_PREMIUM_API_SOURCES.md`
- **Stats Sites Research:** `additional-context/BEST_NFL_STATS_SITES.md`
- **Source Inventory JSON:** `additional-context/COMPLETE_SOURCE_INVENTORY.json`
- **Game Details Gap Analysis:** `coderef/front-end/game-details/data-for-game-details.md`

---

## Notes

- This inventory includes ALL sources mentioned anywhere in the project
- Status indicators show current implementation state
- Some sources are for reference/inspiration only (UI/UX patterns)
- Focus on free/low-cost sources to minimize operational costs
- Premium enterprise APIs listed for future scaling consideration
- **Data Scope** helps identify which sources provide historical analysis vs. live/current season data
- Most sources (73%) provide both historical and current season data
- Live betting and weather APIs are current-season only by nature
