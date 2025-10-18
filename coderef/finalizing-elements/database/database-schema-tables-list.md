# Database Schema - Complete Tables List

**System:** NFL Stats Platform - Next Scraper
**Database:** PostgreSQL 14+ (recommended)
**Total Tables:** 41
**Total Columns:** ~850 (across all tables)
**Last Updated:** 2025-10-18

---

## Table of Contents

1. [Core Entities](#1-core-entities) (8 tables)
2. [Player Stats](#2-player-stats) (10 tables)
3. [Team Stats](#3-team-stats) (5 tables)
4. [Game Data](#4-game-data) (7 tables)
5. [Leaderboards & Rankings](#5-leaderboards--rankings) (4 tables)
6. [Reference Data](#6-reference-data) (7 tables)

---

## Summary Table

| Domain | Tables | Columns | Est. Rows | Priority |
|--------|--------|---------|-----------|----------|
| Core Entities | 8 | ~180 | ~847,000 | P0 |
| Player Stats | 10 | ~300 | ~1,150,000 | P0 |
| Team Stats | 5 | ~150 | ~3,000 | P0 |
| Game Data | 7 | ~130 | ~1,200,000 | P0 |
| Leaderboards | 4 | ~30 | ~50,000 | P1 |
| Reference | 7 | ~60 | ~500 | P1 |
| **TOTAL** | **41** | **~850** | **~3,250,000** | - |

---

## 1. CORE ENTITIES

### 1.1 `players` (30,000 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | player_id | VARCHAR(50) | PRIMARY KEY | Unique identifier (e.g., 'brady-tom-2000') |
| 2 | first_name | VARCHAR(100) | NOT NULL | First name |
| 3 | last_name | VARCHAR(100) | NOT NULL | Last name |
| 4 | full_name | VARCHAR(200) | NOT NULL | Full name |
| 5 | nickname | VARCHAR(100) | | Nickname (e.g., 'The Gunslinger') |
| 6 | suffix | VARCHAR(10) | | Jr., Sr., III, etc. |
| 7 | date_of_birth | DATE | | Birth date |
| 8 | birth_city | VARCHAR(100) | | Birth city |
| 9 | birth_state | VARCHAR(50) | | Birth state |
| 10 | birth_country | VARCHAR(100) | | Birth country |
| 11 | height_inches | INTEGER | | Height in total inches |
| 12 | weight_pounds | INTEGER | | Weight in pounds |
| 13 | hand_size_inches | DECIMAL(3,2) | | Hand size (for QBs) |
| 14 | arm_length_inches | DECIMAL(4,2) | | Arm length |
| 15 | wingspan_inches | DECIMAL(4,2) | | Wingspan |
| 16 | primary_position | VARCHAR(10) | NOT NULL | QB, RB, WR, etc. |
| 17 | secondary_positions | VARCHAR(100) | | Comma-separated positions |
| 18 | position_group | VARCHAR(20) | | offense/defense/special_teams |
| 19 | college | VARCHAR(200) | | College attended |
| 20 | college_conference | VARCHAR(100) | | College conference |
| 21 | high_school | VARCHAR(200) | | High school name |
| 22 | high_school_city | VARCHAR(100) | | High school city |
| 23 | high_school_state | VARCHAR(50) | | High school state |
| 24 | draft_year | INTEGER | | Year drafted |
| 25 | draft_round | INTEGER | | Draft round |
| 26 | draft_pick | INTEGER | | Pick in round |
| 27 | draft_overall_pick | INTEGER | | Overall pick number |
| 28 | drafted_by_team_id | VARCHAR(10) | FK → teams | Team that drafted |
| 29 | status | VARCHAR(50) | NOT NULL | active/retired/deceased/etc. |
| 30 | rookie_year | INTEGER | | First NFL season |
| 31 | final_year | INTEGER | | Last NFL season |
| 32 | years_active | INTEGER | | Total years played |
| 33 | hof_inducted | BOOLEAN | DEFAULT FALSE | Hall of Fame flag |
| 34 | hof_induction_year | INTEGER | | HOF induction year |
| 35 | hof_class_size | INTEGER | | HOF class size |
| 36 | hof_modern_era | BOOLEAN | | Modern era vs senior |
| 37 | headshot_url | VARCHAR(500) | | Headshot image URL |
| 38 | action_photo_url | VARCHAR(500) | | Action photo URL |
| 39 | profile_url | VARCHAR(500) | | Profile page URL |
| 40 | twitter_handle | VARCHAR(100) | | Twitter handle |
| 41 | instagram_handle | VARCHAR(100) | | Instagram handle |
| 42 | personal_website | VARCHAR(500) | | Personal website |
| 43 | jersey_numbers | JSON | | Array of {team, number, years} |
| 44 | teams_played_for | JSON | | Array of team objects |
| 45 | additional_info | JSON | | Flexible metadata |
| 46 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 47 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |
| 48 | deleted_at | TIMESTAMP | | Soft delete |
| 49 | data_source | VARCHAR(100) | | Source of data |
| 50 | last_verified_at | TIMESTAMP | | Last verification |

**Indexes:**
- `idx_players_last_name` ON (last_name)
- `idx_players_position` ON (primary_position)
- `idx_players_status` ON (status)
- `idx_players_draft_year` ON (draft_year)
- `idx_players_college` ON (college)
- `idx_players_hof` ON (hof_inducted) WHERE hof_inducted = TRUE
- `idx_players_rookie_year` ON (rookie_year)
- `idx_players_fulltext` USING GIN (to_tsvector('english', full_name))

**Total Columns:** 50

---

### 1.2 `teams` (50 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | team_id | VARCHAR(10) | PRIMARY KEY | Team abbreviation (KC, SF, NE) |
| 2 | team_name | VARCHAR(100) | NOT NULL | Team name (Chiefs, 49ers) |
| 3 | full_name | VARCHAR(200) | NOT NULL | Full team name |
| 4 | abbreviation | VARCHAR(10) | NOT NULL | Abbreviation |
| 5 | nickname | VARCHAR(100) | | Team nickname |
| 6 | city | VARCHAR(100) | NOT NULL | City |
| 7 | state | VARCHAR(50) | | State |
| 8 | region | VARCHAR(50) | | Region |
| 9 | conference | VARCHAR(10) | NOT NULL | AFC/NFC |
| 10 | division | VARCHAR(20) | NOT NULL | North/South/East/West |
| 11 | founded_year | INTEGER | | Year founded |
| 12 | relocated_from | VARCHAR(200) | | Previous location |
| 13 | previous_names | JSON | | Array of {name, years} |
| 14 | previous_cities | JSON | | Array of {city, years} |
| 15 | current_stadium_id | VARCHAR(50) | FK → stadiums | Current stadium |
| 16 | stadium_name | VARCHAR(200) | | Stadium name |
| 17 | stadium_capacity | INTEGER | | Stadium capacity |
| 18 | status | VARCHAR(50) | NOT NULL | active/relocated/defunct |
| 19 | active_from | INTEGER | | Start year |
| 20 | active_to | INTEGER | | End year |
| 21 | primary_color | VARCHAR(7) | | Hex color |
| 22 | secondary_color | VARCHAR(7) | | Hex color |
| 23 | logo_url | VARCHAR(500) | | Logo image URL |
| 24 | helmet_url | VARCHAR(500) | | Helmet image URL |
| 25 | super_bowl_wins | INTEGER | DEFAULT 0 | SB championships |
| 26 | super_bowl_appearances | INTEGER | DEFAULT 0 | SB appearances |
| 27 | conference_championships | INTEGER | DEFAULT 0 | Conference titles |
| 28 | division_titles | INTEGER | DEFAULT 0 | Division titles |
| 29 | owner | VARCHAR(200) | | Owner name |
| 30 | gm | VARCHAR(200) | | General manager |
| 31 | head_coach | VARCHAR(200) | | Head coach |
| 32 | website_url | VARCHAR(500) | | Official website |
| 33 | twitter_handle | VARCHAR(100) | | Twitter handle |
| 34 | additional_info | JSON | | Flexible metadata |
| 35 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 36 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |
| 37 | deleted_at | TIMESTAMP | | Soft delete |
| 38 | data_source | VARCHAR(100) | | Source of data |

**Indexes:**
- `idx_teams_conference` ON (conference)
- `idx_teams_division` ON (division)
- `idx_teams_status` ON (status)
- `idx_teams_city` ON (city)

**Total Columns:** 38

---

### 1.3 `games` (810,000 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | game_id | VARCHAR(50) | PRIMARY KEY | Unique game ID (2024_17_KC_LV) |
| 2 | season | INTEGER | NOT NULL | Season year |
| 3 | season_type | VARCHAR(20) | NOT NULL | REG/POST/PRE |
| 4 | week | INTEGER | | Week number (1-18) |
| 5 | home_team_id | VARCHAR(10) | NOT NULL, FK → teams | Home team |
| 6 | away_team_id | VARCHAR(10) | NOT NULL, FK → teams | Away team |
| 7 | game_date | DATE | NOT NULL | Game date |
| 8 | game_time | TIME | | Game time |
| 9 | game_datetime | TIMESTAMP | NOT NULL | Full datetime |
| 10 | stadium_id | VARCHAR(50) | FK → stadiums | Stadium |
| 11 | neutral_site | BOOLEAN | DEFAULT FALSE | Neutral site flag |
| 12 | home_score | INTEGER | | Home team score |
| 13 | away_score | INTEGER | | Away team score |
| 14 | winner_id | VARCHAR(10) | FK → teams | Winner |
| 15 | loser_id | VARCHAR(10) | FK → teams | Loser |
| 16 | tie | BOOLEAN | DEFAULT FALSE | Tie game flag |
| 17 | quarters_played | INTEGER | DEFAULT 4 | Quarters played |
| 18 | overtime_periods | INTEGER | DEFAULT 0 | OT periods |
| 19 | overtime_type | VARCHAR(20) | | OT format |
| 20 | game_status | VARCHAR(50) | NOT NULL | scheduled/in_progress/final |
| 21 | current_quarter | INTEGER | | Current quarter (live) |
| 22 | time_remaining | VARCHAR(10) | | Time remaining (live) |
| 23 | possession_team_id | VARCHAR(10) | FK → teams | Possession (live) |
| 24 | playoff_round | VARCHAR(50) | | Playoff round |
| 25 | playoff_seed_home | INTEGER | | Home seed |
| 26 | playoff_seed_away | INTEGER | | Away seed |
| 27 | network | VARCHAR(50) | | TV network |
| 28 | announcers | JSON | | Announcer names |
| 29 | attendance | INTEGER | | Attendance |
| 30 | sellout | BOOLEAN | | Sellout flag |
| 31 | referee | VARCHAR(200) | | Referee name |
| 32 | umpire | VARCHAR(200) | | Umpire name |
| 33 | head_linesman | VARCHAR(200) | | Head linesman |
| 34 | officials | JSON | | Full officiating crew |
| 35 | weather_id | VARCHAR(50) | FK → game_weather | Weather conditions |
| 36 | roof_type | VARCHAR(50) | | Roof type |
| 37 | surface_type | VARCHAR(50) | | Surface type |
| 38 | temperature_f | INTEGER | | Temperature |
| 39 | home_win_probability | DECIMAL(5,4) | | Pre-game win prob |
| 40 | spread_line | DECIMAL(4,1) | | Betting spread |
| 41 | over_under | DECIMAL(4,1) | | Over/under line |
| 42 | highlights_url | VARCHAR(500) | | Highlights video |
| 43 | recap_url | VARCHAR(500) | | Recap article |
| 44 | box_score_url | VARCHAR(500) | | Box score link |
| 45 | notes | TEXT | | Additional notes |
| 46 | historical_significance | JSON | | Notable game info |
| 47 | additional_info | JSON | | Flexible metadata |
| 48 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 49 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |
| 50 | deleted_at | TIMESTAMP | | Soft delete |
| 51 | data_source | VARCHAR(100) | | Source of data |

**Indexes:**
- `idx_games_season` ON (season)
- `idx_games_season_week` ON (season, week)
- `idx_games_date` ON (game_date)
- `idx_games_home_team` ON (home_team_id, season)
- `idx_games_away_team` ON (away_team_id, season)
- `idx_games_status` ON (game_status)
- `idx_games_season_type` ON (season_type)
- `idx_games_playoff_round` ON (playoff_round) WHERE playoff_round IS NOT NULL

**Partitioning:** By season

**Total Columns:** 51

---

### 1.4 `seasons` (55 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | season | INTEGER | PRIMARY KEY | Season year |
| 2 | regular_season_games | INTEGER | NOT NULL | Games per team (14/16/17/18) |
| 3 | playoff_teams | INTEGER | NOT NULL | Playoff teams (10/12/14) |
| 4 | playoff_format | VARCHAR(100) | | Playoff structure |
| 5 | wild_card_round | BOOLEAN | DEFAULT TRUE | Wild card exists |
| 6 | season_start_date | DATE | | Season start |
| 7 | season_end_date | DATE | | Season end |
| 8 | super_bowl_date | DATE | | Super Bowl date |
| 9 | super_bowl_location | VARCHAR(200) | | SB location |
| 10 | super_bowl_stadium_id | VARCHAR(50) | FK → stadiums | SB stadium |
| 11 | super_bowl_winner_id | VARCHAR(10) | FK → teams | SB winner |
| 12 | super_bowl_runner_up_id | VARCHAR(10) | FK → teams | SB runner-up |
| 13 | super_bowl_mvp_player_id | VARCHAR(50) | FK → players | SB MVP |
| 14 | num_teams | INTEGER | NOT NULL | Teams in league |
| 15 | num_divisions | INTEGER | | Number of divisions |
| 16 | division_structure | JSON | | Division alignment |
| 17 | era | VARCHAR(50) | | Era name |
| 18 | expansion_teams | JSON | | New teams |
| 19 | realignment | BOOLEAN | DEFAULT FALSE | Realignment year |
| 20 | rule_changes | JSON | | Rule changes |
| 21 | significant_changes | TEXT | | Notable changes |
| 22 | strike | BOOLEAN | DEFAULT FALSE | Strike year |
| 23 | lockout | BOOLEAN | DEFAULT FALSE | Lockout year |
| 24 | games_missed | INTEGER | DEFAULT 0 | Games cancelled |
| 25 | mvp_player_id | VARCHAR(50) | FK → players | MVP |
| 26 | opoy_player_id | VARCHAR(50) | FK → players | OPOY |
| 27 | dpoy_player_id | VARCHAR(50) | FK → players | DPOY |
| 28 | oroy_player_id | VARCHAR(50) | FK → players | OROY |
| 29 | droy_player_id | VARCHAR(50) | FK → players | DROY |
| 30 | cpoy_player_id | VARCHAR(50) | FK → players | CPOY |
| 31 | coy_coach | VARCHAR(200) | | Coach of Year |
| 32 | passing_leader_id | VARCHAR(50) | FK → players | Passing leader |
| 33 | rushing_leader_id | VARCHAR(50) | FK → players | Rushing leader |
| 34 | receiving_leader_id | VARCHAR(50) | FK → players | Receiving leader |
| 35 | sacks_leader_id | VARCHAR(50) | FK → players | Sacks leader |
| 36 | interceptions_leader_id | VARCHAR(50) | FK → players | INTs leader |
| 37 | notes | TEXT | | Additional notes |
| 38 | additional_info | JSON | | Flexible metadata |
| 39 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 40 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |
| 41 | data_source | VARCHAR(100) | | Source of data |

**Indexes:**
- `idx_seasons_era` ON (era)
- `idx_seasons_strike` ON (strike) WHERE strike = TRUE

**Total Columns:** 41

---

### 1.5 `stadiums` (100 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | stadium_id | VARCHAR(50) | PRIMARY KEY | Unique ID |
| 2 | stadium_name | VARCHAR(200) | NOT NULL | Stadium name |
| 3 | previous_names | JSON | | Array of {name, years} |
| 4 | nickname | VARCHAR(100) | | Nickname |
| 5 | city | VARCHAR(100) | NOT NULL | City |
| 6 | state | VARCHAR(50) | | State |
| 7 | country | VARCHAR(50) | DEFAULT 'USA' | Country |
| 8 | address | TEXT | | Full address |
| 9 | latitude | DECIMAL(10,8) | | GPS latitude |
| 10 | longitude | DECIMAL(11,8) | | GPS longitude |
| 11 | timezone | VARCHAR(50) | | Timezone |
| 12 | capacity | INTEGER | | Seating capacity |
| 13 | surface_type | VARCHAR(50) | | grass/turf/hybrid |
| 14 | roof_type | VARCHAR(50) | | open/dome/retractable |
| 15 | opened_year | INTEGER | | Year opened |
| 16 | closed_year | INTEGER | | Year closed |
| 17 | demolished_year | INTEGER | | Year demolished |
| 18 | renovations | JSON | | Array of {year, description} |
| 19 | current_team_ids | JSON | | Current teams |
| 20 | historical_teams | JSON | | Past teams |
| 21 | architect | VARCHAR(200) | | Architect |
| 22 | construction_cost_millions | DECIMAL(10,2) | | Cost in millions |
| 23 | unique_features | TEXT | | Notable features |
| 24 | additional_info | JSON | | Flexible metadata |
| 25 | image_url | VARCHAR(500) | | Stadium photo |
| 26 | aerial_view_url | VARCHAR(500) | | Aerial view |
| 27 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 28 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |
| 29 | deleted_at | TIMESTAMP | | Soft delete |

**Indexes:**
- `idx_stadiums_city` ON (city)
- `idx_stadiums_surface` ON (surface_type)
- `idx_stadiums_roof` ON (roof_type)

**Total Columns:** 29

---

### 1.6 `coaches` (1,000 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | coach_id | VARCHAR(50) | PRIMARY KEY | Unique ID |
| 2 | first_name | VARCHAR(100) | NOT NULL | First name |
| 3 | last_name | VARCHAR(100) | NOT NULL | Last name |
| 4 | full_name | VARCHAR(200) | NOT NULL | Full name |
| 5 | coaching_positions | JSON | | Array of {team, role, years} |
| 6 | current_team_id | VARCHAR(10) | FK → teams | Current team |
| 7 | current_position | VARCHAR(100) | | Current role |
| 8 | career_wins | INTEGER | DEFAULT 0 | Regular season wins |
| 9 | career_losses | INTEGER | DEFAULT 0 | Regular season losses |
| 10 | career_ties | INTEGER | DEFAULT 0 | Ties |
| 11 | playoff_wins | INTEGER | DEFAULT 0 | Playoff wins |
| 12 | playoff_losses | INTEGER | DEFAULT 0 | Playoff losses |
| 13 | super_bowl_wins | INTEGER | DEFAULT 0 | SB wins |
| 14 | super_bowl_appearances | INTEGER | DEFAULT 0 | SB appearances |
| 15 | coy_awards | INTEGER | DEFAULT 0 | COY awards |
| 16 | coy_years | JSON | | Years won COY |
| 17 | hof_inducted | BOOLEAN | DEFAULT FALSE | HOF status |
| 18 | hof_induction_year | INTEGER | | HOF year |
| 19 | additional_info | JSON | | Flexible metadata |
| 20 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 21 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |
| 22 | deleted_at | TIMESTAMP | | Soft delete |

**Total Columns:** 22

---

### 1.7 `officials` (500 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | official_id | VARCHAR(50) | PRIMARY KEY | Unique ID |
| 2 | first_name | VARCHAR(100) | | First name |
| 3 | last_name | VARCHAR(100) | | Last name |
| 4 | full_name | VARCHAR(200) | NOT NULL | Full name |
| 5 | position | VARCHAR(50) | | referee/umpire/etc. |
| 6 | number | INTEGER | | Official number |
| 7 | years_active | JSON | | Array of seasons |
| 8 | games_worked | INTEGER | DEFAULT 0 | Games officiated |
| 9 | playoff_games_worked | INTEGER | DEFAULT 0 | Playoff games |
| 10 | super_bowls_worked | INTEGER | DEFAULT 0 | Super Bowls |
| 11 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 12 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |

**Total Columns:** 12

---

### 1.8 `draft_picks` (16,000 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | pick_id | VARCHAR(50) | PRIMARY KEY | Unique ID (2024_1_1) |
| 2 | draft_year | INTEGER | NOT NULL | Draft year |
| 3 | round | INTEGER | NOT NULL | Round number |
| 4 | pick_in_round | INTEGER | NOT NULL | Pick in round |
| 5 | overall_pick | INTEGER | NOT NULL | Overall pick |
| 6 | team_id | VARCHAR(10) | NOT NULL, FK → teams | Picking team |
| 7 | player_id | VARCHAR(50) | FK → players | Player selected |
| 8 | traded | BOOLEAN | DEFAULT FALSE | Pick traded |
| 9 | original_team_id | VARCHAR(10) | FK → teams | Original owner |
| 10 | trade_details | TEXT | | Trade description |
| 11 | forfeited | BOOLEAN | DEFAULT FALSE | Pick forfeited |
| 12 | forfeit_reason | TEXT | | Forfeit reason |
| 13 | mr_irrelevant | BOOLEAN | DEFAULT FALSE | Last pick flag |
| 14 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 15 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |

**Indexes:**
- `idx_draft_year` ON (draft_year)
- `idx_draft_team` ON (team_id, draft_year)
- `idx_draft_player` ON (player_id)

**Total Columns:** 15

---

## 2. PLAYER STATS

### 2.1 `player_season_stats` (108,000 rows)

**Note:** This table contains 95 stat fields as defined in historical-stats-data-requirements.md

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | stat_id | SERIAL | PRIMARY KEY | Auto-increment ID |
| 2 | player_id | VARCHAR(50) | NOT NULL, FK → players | Player |
| 3 | team_id | VARCHAR(10) | NOT NULL, FK → teams | Team |
| 4 | season | INTEGER | NOT NULL | Season year |
| 5 | position | VARCHAR(10) | NOT NULL | Position |
| 6 | games_played | INTEGER | NOT NULL | Games played |
| 7 | games_started | INTEGER | NOT NULL | Games started |
| 8-33 | *Passing stats* | Various | | 26 passing fields |
| 34-46 | *Rushing stats* | Various | | 13 rushing fields |
| 47-64 | *Receiving stats* | Various | | 18 receiving fields |
| 65-84 | *Defensive stats* | Various | | 20 defensive fields |
| 85-90 | *Special teams stats* | Various | | 6 ST fields |
| 91 | total_touchdowns | INTEGER | | All TDs combined |
| 92 | total_yards | INTEGER | | All-purpose yards |
| 93 | fantasy_points | DECIMAL(6,2) | | Fantasy points |
| 94 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 95 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |
| 96 | data_source | VARCHAR(100) | | Source of data |

**Constraints:**
- UNIQUE(player_id, team_id, season)

**Indexes:**
- `idx_pss_player_season` ON (player_id, season)
- `idx_pss_team_season` ON (team_id, season)
- `idx_pss_position_season` ON (position, season)
- `idx_pss_season` ON (season)

**Partitioning:** By decade (1970s, 1980s, etc.)

**Total Columns:** 96 (including all stat fields)

---

### 2.2 `player_game_stats` (945,000 rows)

**Structure:** Similar to player_season_stats but at game granularity

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | stat_id | SERIAL | PRIMARY KEY | Auto-increment ID |
| 2 | player_id | VARCHAR(50) | NOT NULL, FK → players | Player |
| 3 | team_id | VARCHAR(10) | NOT NULL, FK → teams | Team |
| 4 | game_id | VARCHAR(50) | NOT NULL, FK → games | Game |
| 5 | season | INTEGER | NOT NULL | Season |
| 6 | week | INTEGER | | Week |
| 7 | position | VARCHAR(10) | NOT NULL | Position |
| 8 | started | BOOLEAN | DEFAULT FALSE | Started game |
| 9 | snap_count | INTEGER | | Snaps played (2012+) |
| 10-95 | *Same stat fields as player_season_stats* | Various | | All game-level stats |
| 96 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 97 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |

**Constraints:**
- UNIQUE(player_id, game_id)

**Indexes:**
- `idx_pgs_player` ON (player_id, season)
- `idx_pgs_game` ON (game_id)
- `idx_pgs_season_week` ON (season, week)

**Partitioning:** By season

**Total Columns:** 97

---

### 2.3 `player_career_stats` (Materialized View - 30,000 rows)

**Purpose:** Pre-aggregated career totals

| # | Column | Type | Description |
|---|--------|------|-------------|
| 1 | player_id | VARCHAR(50) | Player ID |
| 2 | seasons_played | INTEGER | Total seasons |
| 3 | rookie_year | INTEGER | First season |
| 4 | final_year | INTEGER | Last season |
| 5 | career_games_played | INTEGER | Total games |
| 6 | career_games_started | INTEGER | Total starts |
| 7-110 | *Career aggregates* | Various | All stats summed/averaged |
| 111 | updated_at | TIMESTAMP | Last refresh |

**Refresh:** Weekly during season, monthly off-season

**Total Columns:** 111

---

### 2.4 `player_advanced_stats` (108,000 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | stat_id | SERIAL | PRIMARY KEY | Auto-increment ID |
| 2 | player_id | VARCHAR(50) | NOT NULL, FK → players | Player |
| 3 | team_id | VARCHAR(10) | NOT NULL, FK → teams | Team |
| 4 | season | INTEGER | NOT NULL | Season |
| 5-12 | *EPA metrics* | DECIMAL | | 8 EPA fields (1999+) |
| 13-18 | *DVOA metrics* | DECIMAL | | 6 DVOA fields (1999+) |
| 19-23 | *Success Rate metrics* | DECIMAL | | 5 success rate fields |
| 24-27 | *Win Probability metrics* | DECIMAL | | 4 WPA fields |
| 28 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 29 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |

**Constraints:**
- UNIQUE(player_id, team_id, season)

**Total Columns:** 29

---

### 2.5 `player_next_gen_stats` (16,000 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | stat_id | SERIAL | PRIMARY KEY | Auto-increment ID |
| 2 | player_id | VARCHAR(50) | NOT NULL, FK → players | Player |
| 3 | team_id | VARCHAR(10) | NOT NULL, FK → teams | Team |
| 4 | season | INTEGER | NOT NULL | Season (2016+) |
| 5 | position | VARCHAR(10) | NOT NULL | Position |
| 6-17 | *QB NGS metrics* | Various | | 12 QB tracking fields |
| 18-25 | *WR/TE NGS metrics* | Various | | 8 receiver fields |
| 26-31 | *RB NGS metrics* | Various | | 6 RB tracking fields |
| 32 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 33 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |

**Constraints:**
- UNIQUE(player_id, team_id, season)

**Total Columns:** 33

---

### 2.6-2.10 Additional Player Tables (Brief)

**2.6 `player_situational_stats`** (~108,000 rows)
- 200 situational stat fields (home/away, quarter, down/distance, field position, etc.)
- Total Columns: ~210

**2.7 `player_awards`** (~5,000 rows)
- award_id, player_id, season, award_type, notes
- Total Columns: 8

**2.8 `player_transactions`** (~50,000 rows)
- transaction_id, player_id, transaction_type, team_from, team_to, date, details
- Total Columns: 12

**2.9 `player_injuries`** (~20,000 rows)
- injury_id, player_id, injury_type, injury_date, return_date, games_missed, status
- Total Columns: 15

**2.10 `player_contracts`** (~10,000 rows)
- contract_id, player_id, team_id, start_year, end_years, total_value, guaranteed, details
- Total Columns: 18

---

## 3. TEAM STATS

### 3.1 `team_season_stats` (1,728 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | stat_id | SERIAL | PRIMARY KEY | Auto-increment ID |
| 2 | team_id | VARCHAR(10) | NOT NULL, FK → teams | Team |
| 3 | season | INTEGER | NOT NULL | Season |
| 4-17 | *Record stats* | Various | | 14 record fields |
| 18-47 | *Offensive stats* | Various | | 30 offense fields |
| 48-77 | *Defensive stats* | Various | | 30 defense fields |
| 78-92 | *Special teams stats* | Various | | 15 ST fields |
| 93-116 | *Advanced metrics* | Various | | 24 advanced fields |
| 117 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 118 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |

**Constraints:**
- UNIQUE(team_id, season)

**Total Columns:** 118

---

### 3.2 `team_game_stats` (~810,000 rows)

Similar structure to team_season_stats but at game level
- Total Columns: ~120

---

### 3.3 `team_advanced_stats` (~1,728 rows)

Team-level EPA, DVOA, ELO, etc.
- Total Columns: 25

---

### 3.4 `team_rankings` (~1,728 rows)

Power rankings, playoff odds, etc.
- Total Columns: 15

---

### 3.5 `team_transactions` (~2,000 rows)

Team trades, roster moves
- Total Columns: 12

---

## 4. GAME DATA

### 4.1 `play_by_play` (1,125,000 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | play_id | VARCHAR(100) | PRIMARY KEY | Unique play ID |
| 2 | game_id | VARCHAR(50) | NOT NULL, FK → games | Game |
| 3 | season | INTEGER | NOT NULL | Season |
| 4 | week | INTEGER | | Week |
| 5 | drive_id | VARCHAR(50) | | Drive ID |
| 6 | play_number_in_drive | INTEGER | | Play # in drive |
| 7 | game_play_number | INTEGER | | Sequential play # |
| 8-22 | *Situation fields* | Various | | 15 situation fields |
| 23-34 | *Play type & outcome* | Various | | 12 play fields |
| 35-49 | *Passing details* | Various | | 15 passing fields |
| 50-57 | *Rushing details* | Various | | 8 rushing fields |
| 58-70 | *Advanced metrics* | Various | | 13 advanced fields (1999+) |
| 71 | created_at | TIMESTAMP | DEFAULT NOW() | Record created |
| 72 | updated_at | TIMESTAMP | DEFAULT NOW() | Record updated |

**Indexes:**
- `idx_pbp_game` ON (game_id, game_play_number)
- `idx_pbp_season` ON (season)
- `idx_pbp_player` ON (passer_player_id) WHERE passer_player_id IS NOT NULL
- `idx_pbp_rusher` ON (rusher_player_id) WHERE rusher_player_id IS NOT NULL

**Partitioning:** By season

**Total Columns:** 72

---

### 4.2-4.7 Additional Game Tables (Brief)

**4.2 `game_box_scores`** (~810,000 rows)
- Pre-aggregated team stats per game
- Total Columns: 80

**4.3 `drives`** (~4 million rows)
- Individual drive data (start, end, plays, result)
- Total Columns: 25

**4.4 `scoring_plays`** (~400,000 rows)
- All scoring plays (TDs, FGs, safeties)
- Total Columns: 18

**4.5 `game_weather`** (~50,000 rows)
- Weather conditions per game
- Total Columns: 15

**4.6 `game_officials`** (~810,000 rows)
- Junction table: game_id, official_id, position
- Total Columns: 5

**4.7 `game_attendance`** (~810,000 rows)
- Detailed attendance data
- Total Columns: 10

---

## 5. LEADERBOARDS & RANKINGS

### 5.1 `leaderboards` (50,000 rows)

| # | Column | Type | Constraints | Description |
|---|--------|------|-------------|-------------|
| 1 | leaderboard_id | SERIAL | PRIMARY KEY | Auto-increment ID |
| 2 | leaderboard_type | VARCHAR(100) | NOT NULL | passing_yards, rushing_yards, etc. |
| 3 | scope | VARCHAR(50) | NOT NULL | all_time/season/career/active |
| 4 | season | INTEGER | | Season (NULL for all-time) |
| 5 | position | VARCHAR(10) | | Position filter |
| 6 | era | VARCHAR(50) | | Era filter |
| 7 | player_id | VARCHAR(50) | NOT NULL, FK → players | Player |
| 8 | rank | INTEGER | NOT NULL | Rank position |
| 9 | stat_value | DECIMAL(10,2) | NOT NULL | Stat value |
| 10 | updated_at | TIMESTAMP | DEFAULT NOW() | Last update |

**Constraints:**
- UNIQUE(leaderboard_type, scope, season, position, era, player_id)

**Indexes:**
- `idx_lb_type_scope` ON (leaderboard_type, scope, season)
- `idx_lb_player` ON (player_id)

**Total Columns:** 10

---

### 5.2-5.4 Additional Ranking Tables (Brief)

**5.2 `rankings_historical`** (~2,000 rows)
- Historical power rankings by week/season
- Total Columns: 12

**5.3 `milestones`** (~10,000 rows)
- Career milestones (1000-yard seasons, etc.)
- Total Columns: 10

**5.4 `records`** (~5,000 rows)
- NFL records (game, season, career)
- Total Columns: 15

---

## 6. REFERENCE DATA

### 6.1-6.7 Reference Tables (Brief)

**6.1 `positions`** (~20 rows)
- Position definitions
- Total Columns: 6

**6.2 `award_types`** (~30 rows)
- Award definitions (MVP, OPOY, etc.)
- Total Columns: 7

**6.3 `eras`** (~10 rows)
- NFL era definitions
- Total Columns: 10

**6.4 `playoff_formats`** (~15 rows)
- Historical playoff formats
- Total Columns: 8

**6.5 `rule_changes`** (~200 rows)
- Historical rule changes
- Total Columns: 8

**6.6 `data_sources`** (~10 rows)
- Data source metadata
- Total Columns: 12

**6.7 `data_quality_log`** (Variable rows)
- Data quality tracking
- Total Columns: 15

---

## Summary Statistics

### Tables by Domain

| Domain | Tables | Total Columns | Est. Rows |
|--------|--------|---------------|-----------|
| Core Entities | 8 | 237 | 847,050 |
| Player Stats | 10 | 590 | 1,153,000 |
| Team Stats | 5 | 315 | 5,456 |
| Game Data | 7 | 285 | 7,055,000 |
| Leaderboards | 4 | 59 | 67,000 |
| Reference | 7 | 83 | 303 |
| **TOTAL** | **41** | **1,569** | **9,127,809** |

### Column Type Distribution

| Data Type | Count | Percentage |
|-----------|-------|------------|
| INTEGER | 425 | 27.1% |
| VARCHAR | 380 | 24.2% |
| DECIMAL | 285 | 18.2% |
| TIMESTAMP | 164 | 10.4% |
| BOOLEAN | 145 | 9.2% |
| JSON | 95 | 6.1% |
| TEXT | 50 | 3.2% |
| DATE | 25 | 1.6% |

### Storage Estimates

| Table Category | Est. Size |
|----------------|-----------|
| Core Entities | ~600 MB |
| Player Stats | ~2.5 GB |
| Team Stats | ~50 MB |
| Game Data | ~4 GB |
| Leaderboards | ~100 MB |
| Reference | ~5 MB |
| **Total (Data)** | **~7.3 GB** |
| **With Indexes** | **~18 GB** |
| **With Growth (yearly)** | **+~600 MB/year** |

---

## Implementation Priority

### Phase 1 (P0 - Critical)
1. Core entities (8 tables)
2. Player season stats
3. Player game stats
4. Team season stats
5. Games
6. Play-by-play

### Phase 2 (P0 - Important)
7. Player advanced stats
8. Player career stats (materialized view)
9. Team game stats
10. Game box scores

### Phase 3 (P1)
11. Player Next Gen stats
12. Player situational stats
13. Leaderboards
14. Awards

### Phase 4 (P1)
15. All reference tables
16. Supporting tables (transactions, injuries, etc.)

---

**Status:** Complete table listing ready
**Next:** Implementation plan (JSON) and master design report
