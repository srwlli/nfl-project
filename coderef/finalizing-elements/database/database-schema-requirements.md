# Database Schema Requirements

**System:** NFL Stats Platform - Next Scraper
**Database Type:** PostgreSQL (recommended) or MySQL
**Scale:** ~3,200+ fields across 40+ tables
**Data Period:** 1970-2024 historical + 2025 current season
**Priority:** P0 - Critical
**Last Updated:** 2025-10-18

---

## Executive Summary

This database schema supports a comprehensive NFL statistics platform covering:
- **54 years of historical data** (1970-2024)
- **Current season real-time data** (2025)
- **3,200+ documented fields** across all areas
- **~40 tables** organized into logical domains
- **Multiple data granularities** (season, game, play-by-play)

### Key Requirements
- ✅ High read performance (stats queries)
- ✅ Support for time-series data (historical trends)
- ✅ Real-time updates (live games)
- ✅ Complex relationships (players, teams, games, stats)
- ✅ Scalability (millions of records)
- ✅ Data integrity (referential constraints)

---

## Database Architecture

### Design Principles

1. **Normalized Design** - Reduce redundancy, ensure data integrity
2. **Time-Series Optimization** - Partition large tables by season/date
3. **Read-Optimized** - Extensive indexing, materialized views for aggregates
4. **Audit Trail** - Track data changes (updated_at, created_at)
5. **Soft Deletes** - Never hard delete (use deleted_at flag)

### Technology Stack

**Recommended:** PostgreSQL 14+
- ✅ Advanced JSON support (for flexible metadata)
- ✅ Native partitioning
- ✅ Excellent query performance
- ✅ Robust constraint system
- ✅ Full-text search capabilities
- ✅ Materialized views

**Alternative:** MySQL 8+
- ✅ Good performance
- ✅ Wide adoption
- ⚠️ Limited JSON capabilities
- ⚠️ Less robust partitioning

---

## Table Organization

### Domain-Based Structure

```
1. CORE ENTITIES (8 tables)
   ├── players
   ├── teams
   ├── games
   ├── seasons
   ├── stadiums
   ├── coaches
   ├── officials
   └── draft_picks

2. PLAYER STATS (10 tables)
   ├── player_season_stats
   ├── player_game_stats
   ├── player_career_stats (materialized view)
   ├── player_advanced_stats
   ├── player_next_gen_stats
   ├── player_situational_stats
   ├── player_awards
   ├── player_transactions
   ├── player_injuries
   └── player_contracts

3. TEAM STATS (5 tables)
   ├── team_season_stats
   ├── team_game_stats
   ├── team_advanced_stats
   ├── team_rankings
   └── team_transactions

4. GAME DATA (7 tables)
   ├── game_details
   ├── game_box_scores
   ├── play_by_play
   ├── scoring_plays
   ├── drives
   ├── game_weather
   └── game_officials

5. LEADERBOARDS & RANKINGS (4 tables)
   ├── leaderboards
   ├── rankings_historical
   ├── milestones
   └── records

6. REFERENCE DATA (6 tables)
   ├── positions
   ├── award_types
   ├── eras
   ├── playoff_formats
   ├── rule_changes
   └── data_sources

TOTAL: ~40 tables
```

---

## 1. CORE ENTITIES

### 1.1 Table: `players`

**Purpose:** Central player registry (all NFL players, historical + current)

**Estimated Rows:** ~30,000 (all players since 1970)

```sql
CREATE TABLE players (
    -- Primary Key
    player_id VARCHAR(50) PRIMARY KEY,  -- e.g., 'brady-tom-2000'

    -- Basic Identity
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    nickname VARCHAR(100),
    suffix VARCHAR(10),  -- Jr., Sr., III, etc.

    -- Physical Attributes
    date_of_birth DATE,
    birth_city VARCHAR(100),
    birth_state VARCHAR(50),
    birth_country VARCHAR(100),
    height_inches INTEGER,  -- Total inches
    weight_pounds INTEGER,
    hand_size_inches DECIMAL(3,2),  -- For QBs
    arm_length_inches DECIMAL(4,2),
    wingspan_inches DECIMAL(4,2),

    -- Position & Role
    primary_position VARCHAR(10) NOT NULL,  -- QB, RB, WR, etc.
    secondary_positions VARCHAR(100),  -- Comma-separated if multi-position
    position_group VARCHAR(20),  -- offense, defense, special_teams

    -- College & Pre-NFL
    college VARCHAR(200),
    college_conference VARCHAR(100),
    high_school VARCHAR(200),
    high_school_city VARCHAR(100),
    high_school_state VARCHAR(50),

    -- Draft Information
    draft_year INTEGER,
    draft_round INTEGER,
    draft_pick INTEGER,
    draft_overall_pick INTEGER,
    drafted_by_team_id VARCHAR(10),  -- FK to teams

    -- Career Status
    status VARCHAR(50) NOT NULL,  -- active, retired, deceased, practice_squad, etc.
    rookie_year INTEGER,
    final_year INTEGER,
    years_active INTEGER,  -- Calculated or stored

    -- Hall of Fame
    hof_inducted BOOLEAN DEFAULT FALSE,
    hof_induction_year INTEGER,
    hof_class_size INTEGER,
    hof_modern_era BOOLEAN,  -- vs senior/contributor

    -- Media & Assets
    headshot_url VARCHAR(500),
    action_photo_url VARCHAR(500),
    profile_url VARCHAR(500),  -- Link to player profile page

    -- Social & Contact
    twitter_handle VARCHAR(100),
    instagram_handle VARCHAR(100),
    personal_website VARCHAR(500),

    -- Metadata
    jersey_numbers JSON,  -- Array of {team, number, years} objects
    teams_played_for JSON,  -- Array of team objects with years
    additional_info JSON,  -- Flexible field for misc data

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,  -- Soft delete
    data_source VARCHAR(100),  -- Where data came from
    last_verified_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_players_last_name ON players(last_name);
CREATE INDEX idx_players_position ON players(primary_position);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_players_draft_year ON players(draft_year);
CREATE INDEX idx_players_college ON players(college);
CREATE INDEX idx_players_hof ON players(hof_inducted) WHERE hof_inducted = TRUE;
CREATE INDEX idx_players_rookie_year ON players(rookie_year);

-- Full-text search
CREATE INDEX idx_players_fulltext ON players USING GIN(to_tsvector('english', full_name || ' ' || COALESCE(nickname, '')));
```

**Relationships:**
- `drafted_by_team_id` → `teams.team_id`
- Referenced by: `player_season_stats`, `player_game_stats`, `player_awards`, etc.

---

### 1.2 Table: `teams`

**Purpose:** NFL teams (current + historical, including relocated/renamed)

**Estimated Rows:** ~50 (accounting for relocations, renames)

```sql
CREATE TABLE teams (
    -- Primary Key
    team_id VARCHAR(10) PRIMARY KEY,  -- e.g., 'KC', 'SF', 'NE'

    -- Identity
    team_name VARCHAR(100) NOT NULL,  -- e.g., 'Chiefs', '49ers', 'Patriots'
    full_name VARCHAR(200) NOT NULL,  -- e.g., 'Kansas City Chiefs'
    abbreviation VARCHAR(10) NOT NULL,
    nickname VARCHAR(100),  -- e.g., 'America's Team' for DAL

    -- Location
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50),
    region VARCHAR(50),  -- e.g., 'Pacific Northwest', 'Midwest'

    -- Conference & Division
    conference VARCHAR(10) NOT NULL,  -- AFC, NFC
    division VARCHAR(20) NOT NULL,  -- North, South, East, West

    -- Historical
    founded_year INTEGER,
    relocated_from VARCHAR(200),  -- e.g., 'Oakland' for Raiders
    previous_names JSON,  -- Array of {name, years} objects
    previous_cities JSON,  -- Array of {city, years} objects

    -- Stadium
    current_stadium_id VARCHAR(50),  -- FK to stadiums
    stadium_name VARCHAR(200),
    stadium_capacity INTEGER,

    -- Status
    status VARCHAR(50) NOT NULL,  -- active, relocated, defunct
    active_from INTEGER,
    active_to INTEGER,

    -- Branding
    primary_color VARCHAR(7),  -- Hex color
    secondary_color VARCHAR(7),
    logo_url VARCHAR(500),
    helmet_url VARCHAR(500),

    -- Championships
    super_bowl_wins INTEGER DEFAULT 0,
    super_bowl_appearances INTEGER DEFAULT 0,
    conference_championships INTEGER DEFAULT 0,
    division_titles INTEGER DEFAULT 0,

    -- Ownership & Management
    owner VARCHAR(200),
    gm VARCHAR(200),
    head_coach VARCHAR(200),

    -- Media
    website_url VARCHAR(500),
    twitter_handle VARCHAR(100),

    -- Metadata
    additional_info JSON,

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    data_source VARCHAR(100)
);

-- Indexes
CREATE INDEX idx_teams_conference ON teams(conference);
CREATE INDEX idx_teams_division ON teams(division);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_city ON teams(city);
```

**Relationships:**
- `current_stadium_id` → `stadiums.stadium_id`
- Referenced by: `players`, `games`, `team_season_stats`, etc.

---

### 1.3 Table: `games`

**Purpose:** All NFL games (regular season + playoffs, 1970-2024 + current)

**Estimated Rows:** ~15,000 games per season × 54 years = ~810,000 rows

```sql
CREATE TABLE games (
    -- Primary Key
    game_id VARCHAR(50) PRIMARY KEY,  -- e.g., '2024_17_KC_LV'

    -- Game Identity
    season INTEGER NOT NULL,
    season_type VARCHAR(20) NOT NULL,  -- REG, POST, PRE
    week INTEGER,  -- 1-18 for regular, playoff round for post

    -- Teams
    home_team_id VARCHAR(10) NOT NULL,  -- FK to teams
    away_team_id VARCHAR(10) NOT NULL,  -- FK to teams

    -- Scheduling
    game_date DATE NOT NULL,
    game_time TIME,
    game_datetime TIMESTAMP NOT NULL,

    -- Location
    stadium_id VARCHAR(50),  -- FK to stadiums
    neutral_site BOOLEAN DEFAULT FALSE,

    -- Score
    home_score INTEGER,
    away_score INTEGER,
    winner_id VARCHAR(10),  -- FK to teams
    loser_id VARCHAR(10),  -- FK to teams
    tie BOOLEAN DEFAULT FALSE,

    -- Game Flow
    quarters_played INTEGER DEFAULT 4,
    overtime_periods INTEGER DEFAULT 0,
    overtime_type VARCHAR(20),  -- sudden_death, 10min_period, etc.

    -- Status
    game_status VARCHAR(50) NOT NULL,  -- scheduled, in_progress, final, postponed, cancelled
    current_quarter INTEGER,
    time_remaining VARCHAR(10),  -- MM:SS
    possession_team_id VARCHAR(10),  -- FK to teams (for live games)

    -- Playoff Context
    playoff_round VARCHAR(50),  -- wild_card, divisional, conference, super_bowl
    playoff_seed_home INTEGER,
    playoff_seed_away INTEGER,

    -- Broadcasting
    network VARCHAR(50),  -- CBS, FOX, NBC, ESPN, etc.
    announcers JSON,  -- Array of announcer names

    -- Attendance
    attendance INTEGER,
    sellout BOOLEAN,

    -- Officials
    referee VARCHAR(200),
    umpire VARCHAR(200),
    head_linesman VARCHAR(200),
    officials JSON,  -- Full crew

    -- Conditions
    weather_id VARCHAR(50),  -- FK to game_weather
    roof_type VARCHAR(50),  -- open, dome, retractable_open, retractable_closed
    surface_type VARCHAR(50),  -- grass, turf, hybrid
    temperature_f INTEGER,

    -- Advanced
    home_win_probability DECIMAL(5,4),  -- Pre-game win prob
    spread_line DECIMAL(4,1),  -- Betting line
    over_under DECIMAL(4,1),

    -- Highlights & Media
    highlights_url VARCHAR(500),
    recap_url VARCHAR(500),
    box_score_url VARCHAR(500),

    -- Metadata
    notes TEXT,
    historical_significance JSON,  -- For notable games
    additional_info JSON,

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    data_source VARCHAR(100)
);

-- Indexes (critical for performance)
CREATE INDEX idx_games_season ON games(season);
CREATE INDEX idx_games_season_week ON games(season, week);
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_games_home_team ON games(home_team_id, season);
CREATE INDEX idx_games_away_team ON games(away_team_id, season);
CREATE INDEX idx_games_status ON games(game_status);
CREATE INDEX idx_games_season_type ON games(season_type);
CREATE INDEX idx_games_playoff_round ON games(playoff_round) WHERE playoff_round IS NOT NULL;

-- Partitioning (recommended for performance)
-- Partition by season (1970-2024, then yearly partitions going forward)
-- This dramatically improves query performance for season-specific queries
```

**Relationships:**
- `home_team_id`, `away_team_id`, `winner_id`, `loser_id` → `teams.team_id`
- `stadium_id` → `stadiums.stadium_id`
- `weather_id` → `game_weather.weather_id`
- Referenced by: `player_game_stats`, `play_by_play`, `drives`, etc.

---

### 1.4 Table: `seasons`

**Purpose:** NFL season metadata (rule changes, playoff formats, etc.)

**Estimated Rows:** 55 (1970-2024 + current)

```sql
CREATE TABLE seasons (
    -- Primary Key
    season INTEGER PRIMARY KEY,

    -- Season Structure
    regular_season_games INTEGER NOT NULL,  -- 14, 16, 17, or 18
    playoff_teams INTEGER NOT NULL,  -- 10, 12, 14
    playoff_format VARCHAR(100),
    wild_card_round BOOLEAN DEFAULT TRUE,

    -- Dates
    season_start_date DATE,
    season_end_date DATE,
    super_bowl_date DATE,
    super_bowl_location VARCHAR(200),
    super_bowl_stadium_id VARCHAR(50),

    -- Champions
    super_bowl_winner_id VARCHAR(10),  -- FK to teams
    super_bowl_runner_up_id VARCHAR(10),  -- FK to teams
    super_bowl_mvp_player_id VARCHAR(50),  -- FK to players

    -- League Structure
    num_teams INTEGER NOT NULL,
    num_divisions INTEGER,
    division_structure JSON,  -- Current alignment

    -- Historical Context
    era VARCHAR(50),  -- modern, merger, pre_merger, etc.
    expansion_teams JSON,  -- Array of new teams this year
    realignment BOOLEAN DEFAULT FALSE,

    -- Rule Changes
    rule_changes JSON,  -- Array of {rule, description} objects
    significant_changes TEXT,

    -- Work Stoppages
    strike BOOLEAN DEFAULT FALSE,
    lockout BOOLEAN DEFAULT FALSE,
    games_missed INTEGER DEFAULT 0,

    -- Awards
    mvp_player_id VARCHAR(50),  -- FK to players
    opoy_player_id VARCHAR(50),
    dpoy_player_id VARCHAR(50),
    oroy_player_id VARCHAR(50),
    droy_player_id VARCHAR(50),
    cpoy_player_id VARCHAR(50),
    coy_coach VARCHAR(200),

    -- Stats Leaders
    passing_leader_id VARCHAR(50),
    rushing_leader_id VARCHAR(50),
    receiving_leader_id VARCHAR(50),
    sacks_leader_id VARCHAR(50),
    interceptions_leader_id VARCHAR(50),

    -- Metadata
    notes TEXT,
    additional_info JSON,

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_source VARCHAR(100)
);

-- Indexes
CREATE INDEX idx_seasons_era ON seasons(era);
CREATE INDEX idx_seasons_strike ON seasons(strike) WHERE strike = TRUE;
```

**Relationships:**
- Multiple FKs to `teams` and `players` for champions, award winners, leaders

---

### 1.5 Table: `stadiums`

**Purpose:** NFL stadiums (current + historical)

**Estimated Rows:** ~100 (accounting for old/demolished stadiums)

```sql
CREATE TABLE stadiums (
    -- Primary Key
    stadium_id VARCHAR(50) PRIMARY KEY,

    -- Identity
    stadium_name VARCHAR(200) NOT NULL,
    previous_names JSON,  -- Array of {name, years}
    nickname VARCHAR(100),

    -- Location
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'USA',
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    timezone VARCHAR(50),

    -- Specifications
    capacity INTEGER,
    surface_type VARCHAR(50),  -- grass, turf, hybrid
    roof_type VARCHAR(50),  -- open, dome, retractable

    -- Timeline
    opened_year INTEGER,
    closed_year INTEGER,  -- NULL if still active
    demolished_year INTEGER,
    renovations JSON,  -- Array of {year, description}

    -- Teams
    current_team_ids JSON,  -- Array of team_ids using this stadium
    historical_teams JSON,  -- Array of {team_id, years}

    -- Metadata
    architect VARCHAR(200),
    construction_cost_millions DECIMAL(10,2),
    unique_features TEXT,
    additional_info JSON,

    -- Media
    image_url VARCHAR(500),
    aerial_view_url VARCHAR(500),

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_stadiums_city ON stadiums(city);
CREATE INDEX idx_stadiums_surface ON stadiums(surface_type);
CREATE INDEX idx_stadiums_roof ON stadiums(roof_type);
```

---

### 1.6 Table: `coaches`

**Purpose:** NFL coaches (head coaches, coordinators, historical)

**Estimated Rows:** ~1,000

```sql
CREATE TABLE coaches (
    -- Primary Key
    coach_id VARCHAR(50) PRIMARY KEY,

    -- Identity
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,

    -- Career
    coaching_positions JSON,  -- Array of {team, role, years}
    current_team_id VARCHAR(10),  -- FK to teams
    current_position VARCHAR(100),  -- head_coach, OC, DC, etc.

    -- Records
    career_wins INTEGER DEFAULT 0,
    career_losses INTEGER DEFAULT 0,
    career_ties INTEGER DEFAULT 0,
    playoff_wins INTEGER DEFAULT 0,
    playoff_losses INTEGER DEFAULT 0,
    super_bowl_wins INTEGER DEFAULT 0,
    super_bowl_appearances INTEGER DEFAULT 0,

    -- Awards
    coy_awards INTEGER DEFAULT 0,  -- Coach of the Year
    coy_years JSON,  -- Array of years

    -- Hall of Fame
    hof_inducted BOOLEAN DEFAULT FALSE,
    hof_induction_year INTEGER,

    -- Metadata
    additional_info JSON,

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
```

---

### 1.7 Table: `officials`

**Purpose:** NFL officials/referees

**Estimated Rows:** ~500

```sql
CREATE TABLE officials (
    official_id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200) NOT NULL,
    position VARCHAR(50),  -- referee, umpire, line_judge, etc.
    number INTEGER,  -- Official's number
    years_active JSON,  -- Array of seasons
    games_worked INTEGER DEFAULT 0,
    playoff_games_worked INTEGER DEFAULT 0,
    super_bowls_worked INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 1.8 Table: `draft_picks`

**Purpose:** NFL Draft picks (all rounds, all years)

**Estimated Rows:** ~300 picks/year × 54 years = ~16,000

```sql
CREATE TABLE draft_picks (
    pick_id VARCHAR(50) PRIMARY KEY,  -- e.g., '2024_1_1'

    draft_year INTEGER NOT NULL,
    round INTEGER NOT NULL,
    pick_in_round INTEGER NOT NULL,
    overall_pick INTEGER NOT NULL,

    team_id VARCHAR(10) NOT NULL,  -- Team making the pick
    player_id VARCHAR(50),  -- FK to players (NULL if traded or forfeited)

    traded BOOLEAN DEFAULT FALSE,
    original_team_id VARCHAR(10),  -- If traded
    trade_details TEXT,

    forfeited BOOLEAN DEFAULT FALSE,
    forfeit_reason TEXT,

    mr_irrelevant BOOLEAN DEFAULT FALSE,  -- Last pick of draft

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_draft_year ON draft_picks(draft_year);
CREATE INDEX idx_draft_team ON draft_picks(team_id, draft_year);
CREATE INDEX idx_draft_player ON draft_picks(player_id);
```

---

## 2. PLAYER STATS TABLES

### 2.1 Table: `player_season_stats`

**Purpose:** Player statistics aggregated by season

**Estimated Rows:** ~2,000 players/season × 54 years = ~108,000

**Note:** This is a **CRITICAL** table. Fields derived from historical-stats-data-requirements.md (95 fields).

```sql
CREATE TABLE player_season_stats (
    -- Primary Key
    stat_id SERIAL PRIMARY KEY,

    -- Foreign Keys
    player_id VARCHAR(50) NOT NULL,  -- FK to players
    team_id VARCHAR(10) NOT NULL,  -- FK to teams
    season INTEGER NOT NULL,

    -- Core
    position VARCHAR(10) NOT NULL,
    games_played INTEGER NOT NULL DEFAULT 0,
    games_started INTEGER NOT NULL DEFAULT 0,

    -- Passing (26 fields) - QB
    pass_attempts INTEGER,
    pass_completions INTEGER,
    pass_completion_pct DECIMAL(5,2),
    pass_yards INTEGER,
    pass_yards_per_attempt DECIMAL(4,2),
    pass_yards_per_completion DECIMAL(4,2),
    pass_touchdowns INTEGER,
    pass_interceptions INTEGER,
    pass_td_int_ratio DECIMAL(5,2),
    pass_rating DECIMAL(5,2),
    pass_sacks INTEGER,
    pass_sack_yards INTEGER,
    pass_first_downs INTEGER,
    pass_20plus_yards INTEGER,
    pass_40plus_yards INTEGER,
    pass_longest INTEGER,
    pass_air_yards INTEGER,  -- 2016+
    pass_yards_after_catch INTEGER,  -- 2016+
    pass_intended_air_yards INTEGER,  -- 2016+
    pass_accuracy_pct DECIMAL(5,2),  -- 2016+
    pass_on_target_pct DECIMAL(5,2),  -- 2016+
    pass_drops INTEGER,  -- 2016+
    pass_drop_pct DECIMAL(5,2),  -- 2016+
    pass_batted_balls INTEGER,  -- 2016+
    pass_throwaways INTEGER,  -- 2016+
    pass_spikes INTEGER,

    -- Rushing (13 fields) - RB/QB/WR
    rush_attempts INTEGER,
    rush_yards INTEGER,
    rush_yards_per_attempt DECIMAL(4,2),
    rush_touchdowns INTEGER,
    rush_first_downs INTEGER,
    rush_20plus_yards INTEGER,
    rush_40plus_yards INTEGER,
    rush_longest INTEGER,
    rush_fumbles INTEGER,
    rush_yards_before_contact INTEGER,  -- 2016+
    rush_yards_after_contact INTEGER,  -- 2016+
    rush_broken_tackles INTEGER,  -- 2016+
    rush_stuffed INTEGER,

    -- Receiving (18 fields) - WR/TE/RB
    targets INTEGER,  -- 1999+
    receptions INTEGER,
    reception_pct DECIMAL(5,2),
    receiving_yards INTEGER,
    yards_per_reception DECIMAL(4,2),
    yards_per_target DECIMAL(4,2),
    receiving_touchdowns INTEGER,
    receiving_first_downs INTEGER,
    receiving_20plus_yards INTEGER,
    receiving_40plus_yards INTEGER,
    receiving_longest INTEGER,
    receiving_air_yards INTEGER,  -- 2016+
    receiving_yards_after_catch INTEGER,  -- 2016+
    receiving_yac_per_reception DECIMAL(4,2),  -- 2016+
    receiving_drops INTEGER,  -- 2016+
    receiving_contested_catches INTEGER,  -- 2016+
    receiving_contested_catch_pct DECIMAL(5,2),  -- 2016+
    receiving_fumbles INTEGER,

    -- Defensive (20 fields)
    tackles_solo INTEGER,  -- 2001+
    tackles_assisted INTEGER,  -- 2001+
    tackles_total INTEGER,  -- 2001+
    tackles_for_loss INTEGER,
    sacks DECIMAL(4,1),  -- 1982+
    sack_yards INTEGER,
    qb_hits INTEGER,  -- 2006+
    interceptions INTEGER,
    interception_yards INTEGER,
    interception_touchdowns INTEGER,
    interception_longest INTEGER,
    passes_defended INTEGER,
    forced_fumbles INTEGER,
    fumble_recoveries INTEGER,
    fumble_recovery_yards INTEGER,
    fumble_recovery_touchdowns INTEGER,
    safeties INTEGER,
    defensive_snaps INTEGER,  -- 2012+
    coverage_snaps INTEGER,  -- 2016+
    targets_allowed INTEGER,  -- 2016+

    -- Special Teams (6 fields)
    special_teams_tackles INTEGER,
    kickoff_returns INTEGER,
    kickoff_return_yards INTEGER,
    punt_returns INTEGER,
    punt_return_yards INTEGER,
    special_teams_touchdowns INTEGER,

    -- Composite Stats
    total_touchdowns INTEGER,  -- All TDs combined
    total_yards INTEGER,  -- All purpose yards
    fantasy_points DECIMAL(6,2),  -- Standard fantasy scoring

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_source VARCHAR(100),

    -- Constraints
    UNIQUE(player_id, team_id, season)
);

-- Critical Indexes
CREATE INDEX idx_pss_player_season ON player_season_stats(player_id, season);
CREATE INDEX idx_pss_team_season ON player_season_stats(team_id, season);
CREATE INDEX idx_pss_position_season ON player_season_stats(position, season);
CREATE INDEX idx_pss_season ON player_season_stats(season);

-- Partitioning by season decade (recommended for performance)
-- 1970s, 1980s, 1990s, 2000s, 2010s, 2020s
```

**Relationships:**
- `player_id` → `players.player_id`
- `team_id` → `teams.team_id`
- `season` → `seasons.season`

---

### 2.2 Table: `player_game_stats`

**Purpose:** Player statistics per game

**Estimated Rows:** ~70 players/game × 250 games/season × 54 years = ~945,000

**Note:** Similar structure to `player_season_stats` but at game granularity.

```sql
CREATE TABLE player_game_stats (
    stat_id SERIAL PRIMARY KEY,

    player_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(10) NOT NULL,
    game_id VARCHAR(50) NOT NULL,  -- FK to games
    season INTEGER NOT NULL,
    week INTEGER,

    position VARCHAR(10) NOT NULL,
    started BOOLEAN DEFAULT FALSE,
    snap_count INTEGER,  -- 2012+

    -- Same stat fields as player_season_stats
    -- (85 fields - see historical-stats-data-list.md fields 96-180)

    -- ... (all passing, rushing, receiving, defensive, ST stats)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(player_id, game_id)
);

-- Indexes
CREATE INDEX idx_pgs_player ON player_game_stats(player_id, season);
CREATE INDEX idx_pgs_game ON player_game_stats(game_id);
CREATE INDEX idx_pgs_season_week ON player_game_stats(season, week);

-- Partition by season for performance
```

---

### 2.3 Materialized View: `player_career_stats`

**Purpose:** Pre-aggregated career totals for fast lookups

```sql
CREATE MATERIALIZED VIEW player_career_stats AS
SELECT
    player_id,
    COUNT(DISTINCT season) as seasons_played,
    MIN(season) as rookie_year,
    MAX(season) as final_year,
    SUM(games_played) as career_games_played,
    SUM(games_started) as career_games_started,

    -- Career Passing Totals (24 fields)
    SUM(pass_attempts) as career_pass_attempts,
    SUM(pass_completions) as career_pass_completions,
    AVG(pass_completion_pct) as career_pass_completion_pct,
    SUM(pass_yards) as career_pass_yards,
    -- ... (all passing stats aggregated)

    -- Career Rushing Totals (16 fields)
    SUM(rush_attempts) as career_rush_attempts,
    SUM(rush_yards) as career_rush_yards,
    -- ... (all rushing stats aggregated)

    -- Career Receiving Totals (18 fields)
    SUM(targets) as career_targets,
    SUM(receptions) as career_receptions,
    SUM(receiving_yards) as career_receiving_yards,
    -- ... (all receiving stats aggregated)

    -- Career Defensive Totals (20 fields)
    SUM(tackles_total) as career_tackles,
    SUM(sacks) as career_sacks,
    SUM(interceptions) as career_interceptions,
    -- ... (all defensive stats aggregated)

    updated_at
FROM player_season_stats
WHERE deleted_at IS NULL
GROUP BY player_id;

-- Refresh weekly during season, monthly off-season
CREATE UNIQUE INDEX ON player_career_stats(player_id);
```

---

### 2.4 Table: `player_advanced_stats`

**Purpose:** Advanced analytics (EPA, DVOA, WPA, Success Rate)

**Estimated Rows:** Same as `player_season_stats` (~108,000)

**Note:** Many fields only available 1999+

```sql
CREATE TABLE player_advanced_stats (
    stat_id SERIAL PRIMARY KEY,

    player_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(10) NOT NULL,
    season INTEGER NOT NULL,

    -- EPA (Expected Points Added) - 1999+
    epa_total DECIMAL(8,2),
    epa_per_play DECIMAL(6,4),
    epa_passing DECIMAL(8,2),
    epa_rushing DECIMAL(8,2),
    epa_receiving DECIMAL(8,2),
    epa_defense DECIMAL(8,2),
    epa_rank INTEGER,
    epa_percentile DECIMAL(5,2),

    -- DVOA (Defense-adjusted Value Over Average) - 1999+
    dvoa_total DECIMAL(6,2),
    dvoa_passing DECIMAL(6,2),
    dvoa_rushing DECIMAL(6,2),
    dvoa_receiving DECIMAL(6,2),
    dvoa_rank INTEGER,
    dvoa_percentile DECIMAL(5,2),

    -- Success Rate
    success_rate_overall DECIMAL(5,2),
    success_rate_passing DECIMAL(5,2),
    success_rate_rushing DECIMAL(5,2),
    success_rate_early_downs DECIMAL(5,2),
    success_rate_late_downs DECIMAL(5,2),

    -- Win Probability Added
    wpa_total DECIMAL(8,4),
    wpa_per_play DECIMAL(6,4),
    clutch_wpa DECIMAL(8,4),
    clutch_plays INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(player_id, team_id, season)
);

CREATE INDEX idx_pas_player_season ON player_advanced_stats(player_id, season);
CREATE INDEX idx_pas_season ON player_advanced_stats(season);
```

---

### 2.5 Table: `player_next_gen_stats`

**Purpose:** NFL Next Gen Stats (tracking data)

**Estimated Rows:** ~2,000 players/season × 8 years (2016-2024) = ~16,000

**Note:** Only available 2016+

```sql
CREATE TABLE player_next_gen_stats (
    stat_id SERIAL PRIMARY KEY,

    player_id VARCHAR(50) NOT NULL,
    team_id VARCHAR(10) NOT NULL,
    season INTEGER NOT NULL,
    position VARCHAR(10) NOT NULL,

    -- QB Metrics (12 fields) - 2016+
    time_to_throw DECIMAL(3,2),  -- Seconds
    avg_completed_air_yards DECIMAL(4,1),
    avg_intended_air_yards DECIMAL(4,1),
    aggressiveness_pct DECIMAL(5,2),
    max_completion_air_distance DECIMAL(4,1),
    -- ... (QB NGS fields)

    -- WR/TE Metrics (8 fields) - 2016+
    avg_separation DECIMAL(3,1),  -- Yards
    avg_cushion DECIMAL(3,1),
    pct_share_of_team_air_yards DECIMAL(5,2),
    avg_yac_above_expectation DECIMAL(4,1),
    -- ... (WR/TE NGS fields)

    -- RB Metrics (6 fields) - 2016+
    avg_time_to_los DECIMAL(3,2),  -- Seconds
    efficiency_rating DECIMAL(5,2),
    rush_yards_over_expected INTEGER,
    -- ... (RB NGS fields)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(player_id, team_id, season)
);

CREATE INDEX idx_pngs_player_season ON player_next_gen_stats(player_id, season);
```

---

### 2.6-2.10 Additional Player Tables

**Due to space constraints, I'll provide brief schemas:**

**2.6 `player_situational_stats`** - Stats by situation (home/away, quarter, down/distance, etc.) - ~200 fields per player-season

**2.7 `player_awards`** - Individual awards (MVP, Pro Bowl, All-Pro, etc.)

**2.8 `player_transactions`** - Trades, signings, releases, IR placements

**2.9 `player_injuries`** - Injury history and status

**2.10 `player_contracts`** - Contract details (if tracking)

---

## 3. TEAM STATS TABLES

### 3.1 Table: `team_season_stats`

**Purpose:** Team statistics by season

**Estimated Rows:** 32 teams × 54 years = ~1,728

```sql
CREATE TABLE team_season_stats (
    stat_id SERIAL PRIMARY KEY,

    team_id VARCHAR(10) NOT NULL,
    season INTEGER NOT NULL,

    -- Record (14 fields)
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    ties INTEGER DEFAULT 0,
    win_pct DECIMAL(5,4),
    division_finish INTEGER,
    playoff_berth BOOLEAN,
    playoff_seed INTEGER,
    playoff_wins INTEGER DEFAULT 0,
    playoff_losses INTEGER DEFAULT 0,
    super_bowl_appearance BOOLEAN DEFAULT FALSE,
    super_bowl_win BOOLEAN DEFAULT FALSE,
    points_for INTEGER,
    points_against INTEGER,
    point_differential INTEGER,

    -- Offense (30 fields from historical requirements)
    total_yards INTEGER,
    total_yards_per_game DECIMAL(6,2),
    passing_yards INTEGER,
    rushing_yards INTEGER,
    -- ... (all offensive team stats)

    -- Defense (30 fields)
    def_total_yards_allowed INTEGER,
    def_passing_yards_allowed INTEGER,
    def_rushing_yards_allowed INTEGER,
    -- ... (all defensive team stats)

    -- Special Teams (15 fields)
    field_goals_made INTEGER,
    field_goals_attempted INTEGER,
    -- ... (all ST stats)

    -- Advanced (24 fields)
    pythagorean_wins DECIMAL(5,2),
    simple_rating_system DECIMAL(6,2),
    dvoa_total DECIMAL(6,2),
    epa_per_play_offense DECIMAL(6,4),
    -- ... (all advanced team metrics)

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(team_id, season)
);

CREATE INDEX idx_tss_team ON team_season_stats(team_id, season);
CREATE INDEX idx_tss_season ON team_season_stats(season);
```

---

## 4. GAME DATA TABLES

### 4.1 Table: `play_by_play`

**Purpose:** Individual play records

**Estimated Rows:** ~150 plays/game × 250 games/season × 30 years (1994-2024) = ~1.125 million

**Note:** This is the largest and most complex table.

```sql
CREATE TABLE play_by_play (
    play_id VARCHAR(100) PRIMARY KEY,

    game_id VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    week INTEGER,

    -- Play Sequence
    drive_id VARCHAR(50),
    play_number_in_drive INTEGER,
    game_play_number INTEGER,

    -- Situation (15 fields from historical requirements)
    quarter INTEGER NOT NULL,
    time_remaining VARCHAR(10),
    time_seconds_remaining INTEGER,
    possession_team_id VARCHAR(10),
    defensive_team_id VARCHAR(10),
    down INTEGER,
    yards_to_go INTEGER,
    yardline INTEGER,
    yardline_side VARCHAR(10),
    field_position_category VARCHAR(50),
    score_differential INTEGER,
    -- ... (more situation fields)

    -- Play Type & Outcome (12 fields)
    play_type VARCHAR(50),
    play_description TEXT,
    yards_gained INTEGER,
    first_down_converted BOOLEAN,
    touchdown BOOLEAN,
    turnover BOOLEAN,
    turnover_type VARCHAR(50),
    penalty BOOLEAN,
    penalty_team_id VARCHAR(10),
    penalty_type VARCHAR(100),
    penalty_yards INTEGER,
    no_play BOOLEAN,

    -- Passing Details (15 fields if pass play)
    passer_player_id VARCHAR(50),
    receiver_player_id VARCHAR(50),
    pass_location VARCHAR(20),
    pass_depth VARCHAR(20),
    air_yards INTEGER,
    yards_after_catch INTEGER,
    pass_result VARCHAR(50),
    complete_pass BOOLEAN,
    incomplete_pass BOOLEAN,
    interception BOOLEAN,
    sack BOOLEAN,
    qb_scramble BOOLEAN,
    touchdown_pass BOOLEAN,
    -- ...

    -- Rushing Details (8 fields if run play)
    rusher_player_id VARCHAR(50),
    run_location VARCHAR(20),
    run_gap VARCHAR(20),
    touchdown_rush BOOLEAN,
    fumble BOOLEAN,
    fumble_lost BOOLEAN,
    fumble_recovery_player_id VARCHAR(50),
    -- ...

    -- Advanced Metrics (13 fields - 1999+)
    epa DECIMAL(8,4),
    wpa DECIMAL(8,4),
    win_probability_before DECIMAL(6,4),
    win_probability_after DECIMAL(6,4),
    wp_delta DECIMAL(6,4),
    success BOOLEAN,
    explosive_play BOOLEAN,
    expected_yards DECIMAL(5,2),
    yards_over_expected DECIMAL(5,2),
    qb_epa DECIMAL(6,4),
    air_epa DECIMAL(6,4),
    yac_epa DECIMAL(6,4),
    comp_prob DECIMAL(5,4),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Critical indexes
CREATE INDEX idx_pbp_game ON play_by_play(game_id, game_play_number);
CREATE INDEX idx_pbp_season ON play_by_play(season);
CREATE INDEX idx_pbp_player ON play_by_play(passer_player_id) WHERE passer_player_id IS NOT NULL;
CREATE INDEX idx_pbp_rusher ON play_by_play(rusher_player_id) WHERE rusher_player_id IS NOT NULL;

-- Partition by season for performance
```

---

## 5. LEADERBOARDS & RANKINGS

### 5.1 Table: `leaderboards`

**Purpose:** Pre-calculated leaderboards for fast retrieval

```sql
CREATE TABLE leaderboards (
    leaderboard_id SERIAL PRIMARY KEY,

    leaderboard_type VARCHAR(100) NOT NULL,  -- passing_yards, rushing_yards, etc.
    scope VARCHAR(50) NOT NULL,  -- all_time, season, career, active, etc.
    season INTEGER,  -- NULL for all-time
    position VARCHAR(10),  -- NULL for all positions
    era VARCHAR(50),  -- NULL for all eras

    player_id VARCHAR(50) NOT NULL,
    rank INTEGER NOT NULL,
    stat_value DECIMAL(10,2) NOT NULL,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(leaderboard_type, scope, season, position, era, player_id)
);

CREATE INDEX idx_lb_type_scope ON leaderboards(leaderboard_type, scope, season);
CREATE INDEX idx_lb_player ON leaderboards(player_id);
```

---

## 6. REFERENCE DATA

### 6.1 Table: `positions`

```sql
CREATE TABLE positions (
    position_code VARCHAR(10) PRIMARY KEY,
    position_name VARCHAR(50) NOT NULL,
    position_group VARCHAR(20) NOT NULL,  -- offense, defense, special_teams
    description TEXT,
    abbreviations JSON
);
```

### 6.2 Table: `award_types`

```sql
CREATE TABLE award_types (
    award_id VARCHAR(50) PRIMARY KEY,
    award_name VARCHAR(200) NOT NULL,
    award_category VARCHAR(50),  -- individual, team, coach
    first_awarded_year INTEGER,
    description TEXT
);
```

### 6.3 Table: `eras`

```sql
CREATE TABLE eras (
    era_id VARCHAR(50) PRIMARY KEY,
    era_name VARCHAR(100) NOT NULL,
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    description TEXT,
    rule_changes JSON,
    dominant_teams JSON,
    dominant_players JSON
);
```

---

## Performance Considerations

### 1. Partitioning Strategy

**Tables to Partition:**
- `player_season_stats` - by decade
- `player_game_stats` - by season
- `play_by_play` - by season
- `games` - by season
- `team_season_stats` - by decade

### 2. Indexing Strategy

**Already defined above**, but key principles:
- Index all foreign keys
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- Full-text indexes for search

### 3. Materialized Views

- `player_career_stats` - refresh weekly
- `team_all_time_records` - refresh monthly
- `leaderboards_*` - refresh daily during season

### 4. Caching Layer

- Redis for hot data (current week games, active players)
- CDN for static content (historical stats)

---

## Data Volume Estimates

| Table | Rows | Est. Size |
|-------|------|-----------|
| players | 30,000 | 50 MB |
| teams | 50 | 100 KB |
| games | 810,000 | 500 MB |
| player_season_stats | 108,000 | 200 MB |
| player_game_stats | 945,000 | 1.5 GB |
| play_by_play | 1,125,000 | 3 GB |
| team_season_stats | 1,728 | 5 MB |
| **TOTAL** | **~3 million rows** | **~6 GB** |

**With indexes:** ~15-20 GB total
**Growth rate:** ~500 MB/season

---

## Backup & Recovery

- **Daily backups** of full database
- **Hourly incremental** during live games
- **Point-in-time recovery** for last 30 days
- **Offsite replication** for disaster recovery

---

## Migration Strategy

1. **Phase 1:** Create core tables (players, teams, games, seasons)
2. **Phase 2:** Load historical data (1970-1998, traditional stats only)
3. **Phase 3:** Load modern historical (1999-2015, + advanced analytics)
4. **Phase 4:** Load recent history (2016-2024, + Next Gen Stats)
5. **Phase 5:** Set up real-time pipelines (2025 current season)
6. **Phase 6:** Create materialized views and optimize

---

## Next Steps

1. Review and approve schema design
2. Create database migration scripts
3. Set up development/staging databases
4. Begin data ingestion from sources (nflreadpy, sportsref_nfl, etc.)
5. Build API layer on top of database

---

**Status:** Schema requirements complete - ready for implementation planning
**Next Document:** `database-schema-tables-list.md` (exhaustive field list)
