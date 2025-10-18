# Master Data Source Report - Player Profiles

**Page Type:** NFL Player Profile (Unified: Active, Retired, Historical)
**Coverage Goal:** 100% - Every data field mapped to a source
**Current Status:** 31% Available, 42% Requires Expansion, 21% Requires Integration, 6% Missing
**Last Updated:** 2025-10-17

---

## Executive Summary

The Player Profile page requires approximately **590 total data fields** across all positions and career stages. Current database coverage provides **185 fields (31%)** directly available. An additional **245 fields (42%)** are partially available but require player_stats table expansion or aggregation from play-by-play data. **125 fields (21%)** require new API integrations (ESPN, NGS, sportsref-nfl). **35 fields (6%)** require manual curation.

**Critical Gap:** Defensive player statistics are almost entirely missing from the current player_stats schema and must be added as a new category.

---

## Coverage Summary

| Category | Total Fields | Available | Partial | Planned | Missing | Coverage % |
|----------|--------------|-----------|---------|---------|---------|------------|
| P0 - Must Have | 335 | 102 | 175 | 48 | 10 | 83% (partial+avail) |
| P1 - Important | 185 | 58 | 62 | 55 | 10 | 65% (partial+avail) |
| P2 - Nice to Have | 70 | 25 | 8 | 22 | 15 | 47% (partial+avail) |
| **TOTAL** | **590** | **185** | **245** | **125** | **35** | **73%** |

---

## P0: Must-Have Data Fields (83% Coverage)

### Section 1: Hero Header & Visual Identity

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| player_id | ✅ Available | nflreadpy | players.player_id | Primary key |
| player_name | ✅ Available | nflreadpy | players.name | Full name |
| first_name | ✅ Available | nflreadpy | players.first_name | |
| last_name | ✅ Available | nflreadpy | players.last_name | |
| nickname | ❌ Missing | Manual | Curation needed | E.g., "The Gunslinger" |
| jersey_number | ✅ Available | nflreadpy | rosters.jersey_number | Current number |
| position | ✅ Available | nflreadpy | players.position | QB, RB, WR, etc. |
| current_team_id | ✅ Available | nflreadpy | rosters.team | |
| current_team_name | ✅ Available | nflreadpy | teams.name (join) | |
| current_team_abbreviation | ✅ Available | nflreadpy | teams.abbreviation | |
| current_team_logo_url | 🔧 Planned | ESPN API | Add to teams table | Team logos |
| player_status | ✅ Available | nflreadpy | rosters.status | active/retired/IR |
| headshot_url | 🔧 Planned | ESPN API | Player photos endpoint | Official headshot |
| action_photo_url | 🔧 Planned | ESPN API | Player photos endpoint | Action shot |
| hall_of_fame_inducted | ❌ Missing | Manual | HOF database | Inducted status |

**Section Coverage:** 10/15 fields available (67%), 2 planned, 3 missing

---

### Section 2: Quick Stats Bar (Physical & Bio Basics)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| height_inches | ✅ Available | nflreadpy | players.height | |
| height_display | ✅ Available | Calculate | Convert to "6-4" format | |
| weight_lbs | ✅ Available | nflreadpy | players.weight | |
| age | ✅ Available | Calculate | Current date - birth_date | |
| birth_date | ✅ Available | nflreadpy | players.birth_date | |
| birthplace_city | ⚠️ Partial | sportsref-nfl | PFR bio page | Available in PFR |
| birthplace_state | ⚠️ Partial | sportsref-nfl | PFR bio page | Available in PFR |
| birthplace_country | ✅ Available | Default | Default "USA" | Override if international |
| college_name | ✅ Available | nflreadpy | players.college | |
| college_years | 🔧 Planned | sportsref-nfl | PFR college stats | E.g., "1985-1988" |
| college_position | 🔧 Planned | sportsref-nfl | PFR college stats | May differ from NFL |
| draft_year | ✅ Available | nflreadpy | players.draft_year | |
| draft_round | ✅ Available | nflreadpy | players.draft_round | |
| draft_pick | ✅ Available | nflreadpy | draft_picks.pick | Pick within round |
| draft_overall_pick | ✅ Available | nflreadpy | draft_picks.overall OR calculate | |
| drafted_by_team_id | ✅ Available | nflreadpy | players.draft_team | |
| drafted_by_team_name | ✅ Available | nflreadpy | teams.name (join) | |
| drafted_by_team_abbr | ✅ Available | nflreadpy | teams.abbreviation (join) | |
| years_pro | ✅ Available | Calculate | COUNT DISTINCT seasons | |
| experience_display | ✅ Available | Calculate | Format as "12 seasons" | |

**Section Coverage:** 16/20 fields available (80%), 2 partial, 2 planned

---

### Section 3: Biographical Information

**Personal Info (10 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| full_legal_name | ✅ Available | nflreadpy | players.name | |
| hometown_city | ⚠️ Partial | sportsref-nfl | PFR bio | Available in PFR |
| hometown_state | ⚠️ Partial | sportsref-nfl | PFR bio | Available in PFR |
| nationality | ✅ Available | Default | Default "USA" | Override if needed |
| throws | ✅ Available | nflreadpy | players.throws | left/right (QB/WR) |
| bats | ⚠️ Partial | sportsref-nfl | PFR bio | If applicable |
| arm_length | ⚠️ Partial | sportsref-nfl | PFR combine | E.g., "33 inches" |
| hand_size | ⚠️ Partial | sportsref-nfl | PFR combine | E.g., "10.25 inches" |
| marital_status | ❌ Missing | Manual | Optional personal | Rarely public |
| children | ❌ Missing | Manual | Optional personal | Rarely public |

**High School (10 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| hs_name | ⚠️ Partial | sportsref-nfl | PFR bio | Available in PFR |
| hs_city | ⚠️ Partial | sportsref-nfl | PFR bio | |
| hs_state | ⚠️ Partial | sportsref-nfl | PFR bio | |
| hs_years | ⚠️ Partial | sportsref-nfl | PFR bio | E.g., "1982-1984" |
| hs_position | ⚠️ Partial | sportsref-nfl | PFR bio | |
| hs_national_rank | ❌ Missing | 247Sports API | Recruiting services | #1 QB, etc. |
| hs_star_rating | ❌ Missing | 247Sports API | Recruiting services | 1-5 stars |
| hs_recruiting_service | ❌ Missing | 247Sports API | 247Sports, Rivals | |
| hs_grade | ❌ Missing | 247Sports API | Recruiting grade | |
| hs_scout_report | ❌ Missing | Manual | Scout evaluation | Brief text |

**College (15 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| college_years_display | 🔧 Planned | sportsref-nfl | PFR college page | E.g., "1985-1988" |
| college_coach | ⚠️ Partial | sportsref-nfl | PFR college page | Head coach |
| college_career_pass_yards | ⚠️ Partial | sportsref-nfl | PFR college stats | QB only |
| college_career_pass_tds | ⚠️ Partial | sportsref-nfl | PFR college stats | QB only |
| college_career_ints | ⚠️ Partial | sportsref-nfl | PFR college stats | QB only |
| college_career_comp_pct | ⚠️ Partial | sportsref-nfl | PFR college stats | QB only |
| college_career_rush_yards | ⚠️ Partial | sportsref-nfl | PFR college stats | RB/QB |
| college_career_rush_tds | ⚠️ Partial | sportsref-nfl | PFR college stats | RB/QB |
| college_career_rec_yards | ⚠️ Partial | sportsref-nfl | PFR college stats | WR/TE |
| college_career_receptions | ⚠️ Partial | sportsref-nfl | PFR college stats | WR/TE |
| college_career_rec_tds | ⚠️ Partial | sportsref-nfl | PFR college stats | WR/TE |
| college_honors | ⚠️ Partial | sportsref-nfl | PFR college page | ["All-American"] |
| college_all_american | ⚠️ Partial | sportsref-nfl | PFR college page | Boolean |
| college_bowl_games | ⚠️ Partial | sportsref-nfl | PFR college page | Count |
| college_championships | ⚠️ Partial | sportsref-nfl | PFR college page | Count |

**Draft/Combine (20 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| combine_height | ⚠️ Partial | sportsref-nfl | PFR combine | Exact measurement |
| combine_weight | ⚠️ Partial | sportsref-nfl | PFR combine | |
| combine_40_yard | ⚠️ Partial | sportsref-nfl | PFR combine | Seconds (~1999+) |
| combine_bench_press | ⚠️ Partial | sportsref-nfl | PFR combine | Reps at 225lbs |
| combine_vertical_jump | ⚠️ Partial | sportsref-nfl | PFR combine | Inches |
| combine_broad_jump | ⚠️ Partial | sportsref-nfl | PFR combine | E.g., "10'4\"" |
| combine_three_cone | ⚠️ Partial | sportsref-nfl | PFR combine | Seconds |
| combine_twenty_shuttle | ⚠️ Partial | sportsref-nfl | PFR combine | Seconds |
| combine_sixty_shuttle | ⚠️ Partial | sportsref-nfl | PFR combine | Seconds |
| combine_arm_length | ⚠️ Partial | sportsref-nfl | PFR combine | |
| combine_hand_size | ⚠️ Partial | sportsref-nfl | PFR combine | QB |
| draft_grade | 🔧 Planned | Manual | Scout grades | A+, A, B, etc. |
| draft_projection | 🔧 Planned | Manual | Pre-draft round | |
| draft_scout_report | 🔧 Planned | Manual | Scouting summary | |
| draft_strengths | 🔧 Planned | Manual | Array of strengths | ["Arm strength"] |
| draft_weaknesses | 🔧 Planned | Manual | Array of weaknesses | ["Decision making"] |
| draft_comparison | 🔧 Planned | Manual | Pro comparison | |
| draft_class_rank | 🔧 Planned | Manual | Rank in class | |
| draft_position_rank | 🔧 Planned | Manual | Rank at position | |
| undrafted_free_agent | ✅ Available | nflreadpy | Calculate | True if draft_year NULL |

**Section Coverage:** 20/55 fields available (36%), 30 partial, 5 planned, 5 missing
**CRITICAL:** High school rankings and draft grades require external sources or manual curation.

---

### Section 4: Career Statistics - Passing (QB Only)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_games_played | ✅ Available | nflreadpy | COUNT from player_stats | |
| career_games_started | ✅ Available | nflreadpy | COUNT where started=true | |
| career_pass_attempts | 🔧 Planned | nflreadpy | **ADD COLUMN** to player_stats | CRITICAL |
| career_pass_completions | 🔧 Planned | nflreadpy | **ADD COLUMN** to player_stats | CRITICAL |
| career_pass_comp_pct | ✅ Available | Calculate | comp / att * 100 | After adding columns |
| career_pass_yards | ✅ Available | nflreadpy | SUM(player_stats.passing_yards) | |
| career_pass_ypa | ✅ Available | Calculate | yards / attempts | After adding attempts |
| career_pass_tds | ✅ Available | nflreadpy | SUM(player_stats.passing_tds) | |
| career_pass_ints | 🔧 Planned | nflreadpy | **ADD COLUMN** to player_stats | CRITICAL |
| career_pass_td_int_ratio | ✅ Available | Calculate | tds / ints | After adding ints |
| career_passer_rating | 🔧 Planned | nflreadpy | **ADD COLUMN** or calculate | CRITICAL |
| career_qbr | 🔧 Planned | ESPN API | ESPN proprietary | |
| career_sacks_taken | 🔧 Planned | nflreadpy | **ADD COLUMN** to player_stats | CRITICAL |
| career_sack_yards | 🔧 Planned | nflreadpy | **ADD COLUMN** to player_stats | CRITICAL |
| career_longest_pass | ⚠️ Partial | nflreadpy | MAX from play_by_play | Or add to player_stats |
| career_pass_ypg | ✅ Available | Calculate | total_yards / games | |
| career_300_yard_games | ✅ Available | Calculate | COUNT games >= 300 yards | |
| career_400_yard_games | ✅ Available | Calculate | COUNT games >= 400 yards | |
| career_fourth_qtr_comebacks | 🔧 Planned | Manual/Logic | Situation analysis | External or logic |
| career_game_winning_drives | 🔧 Planned | Manual/Logic | Drive analysis | External or logic |

**Section Coverage:** 8/20 fields available (40%), 1 partial, 11 planned

**CRITICAL MISSING COLUMNS in player_stats:**
- `attempts` (completions/attempts)
- `interceptions`
- `sacks_taken`
- `sacked_yards`
- `passer_rating` (can calculate from formula)

---

### Section 5: Career Statistics - Rushing (RB, QB, WR)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_rush_attempts | 🔧 Planned | nflreadpy | **ADD COLUMN** to player_stats | CRITICAL: carries |
| career_rush_yards | ✅ Available | nflreadpy | SUM(player_stats.rushing_yards) | |
| career_rush_avg | ✅ Available | Calculate | yards / attempts | After adding attempts |
| career_rush_tds | ✅ Available | nflreadpy | SUM(player_stats.rushing_tds) | |
| career_rush_longest | ⚠️ Partial | nflreadpy | MAX from play_by_play | Or add to player_stats |
| career_rush_fumbles | 🔧 Planned | nflreadpy | **ADD COLUMN** to player_stats | CRITICAL |
| career_rush_fumbles_lost | 🔧 Planned | nflreadpy | **ADD COLUMN** to player_stats | CRITICAL |
| career_rush_first_downs | 🔧 Planned | nflreadpy | **ADD COLUMN** to player_stats | |
| career_rush_ypg | ✅ Available | Calculate | yards / games | |
| career_100_yard_rush_games | ✅ Available | Calculate | COUNT games >= 100 | |
| career_200_yard_rush_games | ✅ Available | Calculate | COUNT games >= 200 | |
| career_rush_20plus | ✅ Available | Calculate | COUNT plays >= 20 from pbp | |
| career_rush_broken_tackles | 🔧 Planned | Next Gen Stats | NGS metric | Requires API |
| career_rush_yac | 🔧 Planned | Next Gen Stats | Yards after contact | NGS metric |
| career_rush_stuffed_pct | ✅ Available | Calculate | COUNT rushes <= 0 / total | |

**Section Coverage:** 8/15 fields available (53%), 1 partial, 6 planned

**CRITICAL MISSING COLUMNS in player_stats:**
- `carries` (rush attempts)
- `fumbles`
- `fumbles_lost`
- `rushing_first_downs`

---

### Section 6: Career Statistics - Receiving (WR, TE, RB)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_receptions | ✅ Available | nflreadpy | SUM(player_stats.receptions) | |
| career_targets | ✅ Available | nflreadpy | SUM(player_stats.targets) | |
| career_catch_rate | ✅ Available | Calculate | receptions / targets * 100 | |
| career_rec_yards | ✅ Available | nflreadpy | SUM(player_stats.receiving_yards) | |
| career_rec_ypr | ✅ Available | Calculate | yards / receptions | |
| career_rec_tds | ✅ Available | nflreadpy | SUM(player_stats.receiving_tds) | |
| career_rec_longest | ⚠️ Partial | nflreadpy | MAX from play_by_play | Or add to player_stats |
| career_rec_first_downs | 🔧 Planned | nflreadpy | **ADD COLUMN** to player_stats | |
| career_rec_ypg | ✅ Available | Calculate | yards / games | |
| career_100_yard_rec_games | ✅ Available | Calculate | COUNT games >= 100 | |
| career_200_yard_rec_games | ✅ Available | Calculate | COUNT games >= 200 | |
| career_rec_yac | ⚠️ Partial | nflreadpy | Available in pbp, aggregate | |
| career_rec_yac_per_rec | ✅ Available | Calculate | total_yac / receptions | After aggregating YAC |
| career_rec_drops | 🔧 Planned | Next Gen Stats | NGS or PFF metric | Requires API |
| career_rec_drop_pct | 🔧 Planned | Calculate | drops / targets | After getting drops |
| career_contested_catches | 🔧 Planned | Next Gen Stats | NGS metric | Requires API |
| career_contested_catch_pct | 🔧 Planned | Calculate | contested / total | After getting contested |
| career_rec_avg_separation | 🔧 Planned | Next Gen Stats | NGS metric (yards) | Requires API |

**Section Coverage:** 11/18 fields available (61%), 2 partial, 5 planned

**MISSING:**
- `receiving_first_downs` column
- Drop tracking (NGS or PFF)
- Contested catch tracking (NGS)
- Average separation (NGS)

---

### Section 7: Career Statistics - Defense (DEF Positions)

**⚠️ CRITICAL GAP: Defensive stats are almost entirely missing from current schema!**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_tackles_solo | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | CRITICAL |
| career_tackles_assist | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | CRITICAL |
| career_tackles_total | 🔧 Planned | Calculate | solo + assist | |
| career_sacks | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | CRITICAL |
| career_tackles_for_loss | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | CRITICAL |
| career_qb_hits | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | CRITICAL |
| career_def_ints | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | CRITICAL |
| career_def_int_yards | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | |
| career_def_int_tds | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | |
| career_passes_defended | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | CRITICAL |
| career_forced_fumbles | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | CRITICAL |
| career_fumble_recoveries | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | CRITICAL |
| career_fumble_rec_tds | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | |
| career_safeties | 🔧 Planned | nflreadpy | **CREATE defensive_stats category** | |
| career_def_tds | 🔧 Planned | Calculate | int_tds + fumble_rec_tds | |
| career_stuffs | ⚠️ Partial | nflreadpy | Tackles at/behind LOS from pbp | |
| career_hurries | ⚠️ Partial | nflreadpy | QB pressures from pbp | |
| career_def_snaps | ⚠️ Partial | nflreadpy | From snap_counts table | |

**Section Coverage:** 0/18 fields available (0%), 3 partial, 15 planned

**CRITICAL ACTION REQUIRED:**
- Defensive statistics are COMPLETELY ABSENT from player_stats schema
- Must create new `defensive_stats` category in player_stats table
- Data IS available in play_by_play (tackles, sacks, INTs, PDs)
- Requires aggregation logic from pbp to populate defensive_stats

**Required Columns:**
- `tackles_solo`
- `tackles_assist`
- `sacks`
- `tackles_for_loss`
- `qb_hits`
- `interceptions`
- `interception_yards`
- `interception_tds`
- `passes_defended`
- `forced_fumbles`
- `fumble_recoveries`
- `fumble_recovery_tds`
- `safeties`

---

### Section 8: Career Statistics - Special Teams (K, P, Returners)

**Kicking (10 fields) - K only**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_fg_made | 🔧 Planned | nflreadpy | **CREATE kicking_stats category** | |
| career_fg_attempts | 🔧 Planned | nflreadpy | **CREATE kicking_stats category** | |
| career_fg_pct | ✅ Available | Calculate | made / attempts * 100 | After adding columns |
| career_fg_longest | 🔧 Planned | nflreadpy | **CREATE kicking_stats category** | |
| career_fg_0_19 | 🔧 Planned | nflreadpy | **CREATE kicking_stats category** | "5/5" format |
| career_fg_20_29 | 🔧 Planned | nflreadpy | **CREATE kicking_stats category** | |
| career_fg_30_39 | 🔧 Planned | nflreadpy | **CREATE kicking_stats category** | |
| career_fg_40_49 | 🔧 Planned | nflreadpy | **CREATE kicking_stats category** | |
| career_fg_50plus | 🔧 Planned | nflreadpy | **CREATE kicking_stats category** | |
| career_xp_made | 🔧 Planned | nflreadpy | **CREATE kicking_stats category** | |

**Punting (8 fields) - P only**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_punts | 🔧 Planned | nflreadpy | **CREATE punting_stats category** | |
| career_punt_yards | 🔧 Planned | nflreadpy | **CREATE punting_stats category** | |
| career_punt_avg | ✅ Available | Calculate | yards / punts | |
| career_punt_longest | 🔧 Planned | nflreadpy | **CREATE punting_stats category** | |
| career_punt_inside_20 | 🔧 Planned | nflreadpy | **CREATE punting_stats category** | |
| career_punt_inside_10 | 🔧 Planned | nflreadpy | **CREATE punting_stats category** | |
| career_punt_touchbacks | 🔧 Planned | nflreadpy | **CREATE punting_stats category** | |
| career_punt_fair_catches | 🔧 Planned | nflreadpy | **CREATE punting_stats category** | |

**Returns (7 fields) - All positions**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_kr_returns | 🔧 Planned | nflreadpy | **CREATE return_stats category** | Kick returns |
| career_kr_yards | 🔧 Planned | nflreadpy | **CREATE return_stats category** | |
| career_kr_avg | ✅ Available | Calculate | yards / returns | |
| career_kr_tds | 🔧 Planned | nflreadpy | **CREATE return_stats category** | |
| career_pr_returns | 🔧 Planned | nflreadpy | **CREATE return_stats category** | Punt returns |
| career_pr_yards | 🔧 Planned | nflreadpy | **CREATE return_stats category** | |
| career_pr_tds | 🔧 Planned | nflreadpy | **CREATE return_stats category** | |

**Section Coverage:** 3/25 fields available (12%), 0 partial, 22 planned

**CRITICAL ACTION REQUIRED:**
- Special teams stats completely absent from player_stats
- Must create `kicking_stats`, `punting_stats`, `return_stats` categories
- Data available in play_by_play for most fields

---

### Section 9: Playoff Statistics

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_playoff_games | ✅ Available | nflreadpy | COUNT from schedules (season_type=POST) | |
| career_playoff_wins | ✅ Available | nflreadpy | COUNT wins in playoffs | |
| career_playoff_losses | ✅ Available | nflreadpy | COUNT losses in playoffs | |
| career_playoff_record | ✅ Available | Calculate | Format as "16-4" | |
| career_playoff_pass_yards | ✅ Available | nflreadpy | SUM playoff passing_yards | QB |
| career_playoff_pass_tds | ✅ Available | nflreadpy | SUM playoff passing_tds | QB |
| career_playoff_pass_ints | ⚠️ Partial | nflreadpy | SUM playoff ints (after adding column) | QB |
| career_playoff_passer_rating | ⚠️ Partial | Calculate | Calculate from playoff stats | QB |
| career_playoff_rush_yards | ✅ Available | nflreadpy | SUM playoff rushing_yards | RB/QB |
| career_playoff_rush_tds | ✅ Available | nflreadpy | SUM playoff rushing_tds | RB/QB |
| career_playoff_rec_yards | ✅ Available | nflreadpy | SUM playoff receiving_yards | WR/TE |
| career_playoff_rec_tds | ✅ Available | nflreadpy | SUM playoff receiving_tds | WR/TE |
| career_playoff_sacks | ⚠️ Partial | nflreadpy | SUM playoff sacks (after adding def stats) | DEF |
| career_playoff_ints | ⚠️ Partial | nflreadpy | SUM playoff INTs (after adding def stats) | DEF |
| career_playoff_mvp | ❌ Missing | Manual | Super Bowl MVP count | Awards data |

**Section Coverage:** 10/15 fields available (67%), 4 partial, 1 missing

**Note:** Playoff stats use same columns as regular season, just filter by `season_type = 'POST'`

---

### Section 10: Season-by-Season Data

**Total Fields: 30+ per season** (Array of season objects)

| Field Category | Status | Source | Notes |
|---------------|--------|--------|-------|
| season_year | ✅ Available | nflreadpy | player_stats.season |
| season_type | ✅ Available | nflreadpy | player_stats.season_type |
| season_team | ✅ Available | nflreadpy | player_stats.team |
| season_games | ✅ Available | nflreadpy | COUNT games per season |
| season_stats (all position stats) | ⚠️ Partial | nflreadpy | Same coverage as career stats (30-40% missing) |
| season_team_record | ✅ Available | nflreadpy | Calculate from schedules |
| season_playoff_result | ⚠️ Partial | nflreadpy | Derive from schedules |
| season_awards | ❌ Missing | Manual | ["Pro Bowl", "All-Pro"] |
| season_notes | 🔧 Planned | Manual | Injuries, milestones |

**Section Coverage:** Same as career stats sections (varies by position)

**Note:** Season-by-season uses same player_stats columns, just grouped by season instead of aggregated.

---

### Section 11: Awards & Achievements

**Championships (8 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| super_bowl_wins | ⚠️ Partial | Manual/Logic | Can derive from schedules + rosters | |
| super_bowl_appearances | ⚠️ Partial | Manual/Logic | Can derive from schedules + rosters | |
| super_bowl_mvps | ❌ Missing | Manual | Award data required | |
| conference_championships | ⚠️ Partial | Manual/Logic | Can derive from schedules | |
| division_titles | ⚠️ Partial | Manual/Logic | Can derive from season_stats | |
| championship_details | ⚠️ Partial | Manual/Logic | Full championship data | |
| playoff_appearances | ✅ Available | nflreadpy | COUNT playoff seasons | |
| playoff_wins | ✅ Available | nflreadpy | COUNT playoff wins | |

**Pro Bowl & All-Pro (8 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| pro_bowl_selections | ⚠️ Partial | sportsref-nfl | PFR has this data | Count |
| pro_bowl_years | ⚠️ Partial | sportsref-nfl | PFR has this data | [2015, 2016, ...] |
| pro_bowl_starts | ⚠️ Partial | sportsref-nfl | PFR has this data | |
| pro_bowl_mvps | ❌ Missing | Manual | Award data | |
| all_pro_first_team | ⚠️ Partial | sportsref-nfl | PFR has this data | Count |
| all_pro_second_team | ⚠️ Partial | sportsref-nfl | PFR has this data | Count |
| all_pro_total | ⚠️ Partial | sportsref-nfl | PFR has this data | Total selections |
| all_pro_years | ⚠️ Partial | sportsref-nfl | PFR has this data | With team designation |

**MVP & Awards (8 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| mvp_awards | ❌ Missing | Manual | NFL MVP count | Awards database |
| mvp_years | ❌ Missing | Manual | Years won MVP | Awards database |
| mvp_vote_total | ❌ Missing | Manual | Total votes received | Awards database |
| mvp_top_5_finishes | ❌ Missing | Manual | Top 5 finishes | Awards database |
| offensive_player_year | ❌ Missing | Manual | OPOY count | Awards database |
| defensive_player_year | ❌ Missing | Manual | DPOY count | Awards database |
| rookie_of_year | ❌ Missing | Manual | ROY | Awards database |
| comeback_player_year | ❌ Missing | Manual | Comeback POY | Awards database |

**Hall of Fame (6 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| hof_inducted | ❌ Missing | Manual | HOF database | Boolean |
| hof_year | ❌ Missing | Manual | Year inducted | |
| hof_vote_pct | ❌ Missing | Manual | E.g., 84.6% | |
| hof_class | ❌ Missing | Manual | "Class of 2016" | |
| hof_first_ballot | ❌ Missing | Manual | Boolean | |
| hof_years_eligible | ❌ Missing | Manual | Years on ballot | |

**Records & Milestones (10 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| retired_numbers | ❌ Missing | Manual | Teams that retired # | |
| retired_number_years | ❌ Missing | Manual | Years retired | |
| records_held | 🔧 Planned | Logic | All records data | Can detect some |
| team_records | 🔧 Planned | Logic | Count | Can detect some |
| league_records | 🔧 Planned | Logic | Count | Can detect some |
| single_game_records | 🔧 Planned | Logic | Count | Can detect some |
| single_season_records | 🔧 Planned | Logic | Count | Can detect some |
| career_records | 🔧 Planned | Logic | Count | Can detect some |
| milestones_achieved | 🔧 Planned | Logic | All milestone data | Can detect thresholds |
| milestone_count | 🔧 Planned | Logic | Total milestones | Can detect thresholds |

**Section Coverage:** 2/40 fields available (5%), 14 partial, 6 planned, 18 missing

**CRITICAL GAP:** Awards and Hall of Fame data require dedicated database or manual curation. Pro Bowl/All-Pro available via sportsref-nfl.

---

## P1: Important Data Fields (65% Coverage)

### Section 12: Game Logs (Complete Career)

**Total Fields: 25 per game** (Array of game objects)

| Field Category | Status | Source | Notes |
|---------------|--------|--------|-------|
| game_id | ✅ Available | nflreadpy | player_stats.game_id |
| game_season/week/date | ✅ Available | nflreadpy | From schedules table |
| game_opponent | ✅ Available | nflreadpy | From schedules table |
| game_home_away | ✅ Available | nflreadpy | From schedules table |
| game_result | ✅ Available | nflreadpy | W/L/T from schedules |
| game_score | ✅ Available | nflreadpy | From schedules table |
| game_started | ✅ Available | nflreadpy | player_stats.started |
| game_position_stats | ⚠️ Partial | nflreadpy | Same coverage as career stats (30-40% missing) |
| game_notes | 🔧 Planned | Manual | Milestone, playoff, etc. |
| game_weather | ✅ Available | nflreadpy | schedules.weather |
| game_temperature | ✅ Available | nflreadpy | schedules.temp |

**Section Coverage:** ~60% (same as player_stats coverage)

---

### Section 13: Statistical Splits

**Total Fields: 60+** (Multiple stat sets for different contexts)

| Split Type | Status | Source | Notes |
|-----------|--------|--------|-------|
| Home vs Away (30 fields) | ✅ Available | nflreadpy | Filter player_stats by home/away |
| By Opponent (per team) | ✅ Available | nflreadpy | Filter player_stats by opponent |
| Situational (40+ fields) | ⚠️ Partial | nflreadpy | Requires pbp analysis for leading/trailing |
| By Month | ✅ Available | nflreadpy | Filter by game date month |
| By Weather | ⚠️ Partial | nflreadpy | Filter by weather conditions (need weather data) |

**Section Coverage:** ~70% (can calculate most splits from existing game logs)

---

### Section 14: Advanced Analytics & Metrics

**EPA Metrics (8 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_total_epa | ✅ Available | nflreadpy | SUM(play_by_play.epa) for player | |
| career_epa_per_play | ✅ Available | Calculate | total_epa / total_plays | |
| career_passing_epa | ✅ Available | nflreadpy | SUM(epa) where play_type=pass | QB |
| career_rushing_epa | ✅ Available | nflreadpy | SUM(epa) where play_type=run | RB/QB |
| career_receiving_epa | ✅ Available | nflreadpy | SUM(epa) for receiving plays | WR/TE |
| career_epa_rank_all_time | 🔧 Planned | Calculate | Compare to all players | |
| career_epa_rank_position | 🔧 Planned | Calculate | Compare to position | |
| season_best_epa | ✅ Available | Calculate | Best season EPA | |

**CPOE & Success Rate (6 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_cpoe | ⚠️ Partial | nflreadpy | CPOE in pbp, need to aggregate | QB |
| career_cpoe_rank | 🔧 Planned | Calculate | Compare to all QBs | QB |
| career_success_rate_overall | ✅ Available | nflreadpy | COUNT(success) / total from pbp | |
| career_success_rate_passing | ✅ Available | nflreadpy | Success rate for passes | QB |
| career_success_rate_rushing | ✅ Available | nflreadpy | Success rate for rushes | RB/QB |
| career_success_rate_receiving | ✅ Available | nflreadpy | Success rate for receptions | WR/TE |

**Pressure & Decision Making (8 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_pressure_rate | ⚠️ Partial | nflreadpy | Pressure tracking in pbp | QB |
| career_sack_rate_pressure | ⚠️ Partial | nflreadpy | Sacks when pressured | QB |
| career_comp_pct_pressure | ⚠️ Partial | nflreadpy | Comp % under pressure | QB |
| career_turnover_worthy_pct | 🔧 Planned | PFF API | PFF metric | QB |
| career_big_time_throw_pct | 🔧 Planned | PFF API | PFF metric | QB |
| career_avg_time_to_throw | 🔧 Planned | Next Gen Stats | NGS metric (seconds) | QB |
| career_avg_depth_of_target | ⚠️ Partial | nflreadpy | aDOT from pbp | QB |
| career_air_yards_share | 🔧 Planned | Calculate | % of team air yards | WR/TE |

**Next Gen Stats (8 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_avg_separation | 🔧 Planned | Next Gen Stats | NGS metric (yards) | WR/TE |
| career_catch_pct_expected | 🔧 Planned | Next Gen Stats | Expected catch % | WR/TE |
| career_comp_pct_expected | 🔧 Planned | Next Gen Stats | Expected comp % | QB |
| career_comp_pct_above_exp | 🔧 Planned | Next Gen Stats | CPOE (NGS version) | QB |
| career_avg_cushion | 🔧 Planned | Next Gen Stats | DB distance (yards) | WR/TE |
| career_route_efficiency | 🔧 Planned | Next Gen Stats | Route running metric | WR/TE |
| career_avg_rush_yards_before | 🔧 Planned | Next Gen Stats | Before contact | RB |
| career_rush_attempts_8_box | 🔧 Planned | Next Gen Stats | vs stacked box | RB |

**Section Coverage:** 12/30 fields available (40%), 10 partial, 8 planned

**Note:** EPA and Success Rate available from nflreadpy pbp. NGS and PFF metrics require external APIs.

---

### Section 15: Peer Comparisons & Rankings

**Era Rankings (12 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| era_definition | 🔧 Planned | Calculate | E.g., "1990s QBs" | Define eras |
| era_rank | 🔧 Planned | Calculate | Rank within era | |
| era_peers | 🔧 Planned | Calculate | Peer player data | |
| era_stat_ranks | 🔧 Planned | Calculate | Ranks for key stats | |

**All-Time Rankings (10 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| alltime_pass_yards_rank | ✅ Available | Calculate | Rank all QBs by career yards | QB |
| alltime_pass_tds_rank | ✅ Available | Calculate | Rank all QBs by career TDs | QB |
| alltime_rush_yards_rank | ✅ Available | Calculate | Rank all RBs by career yards | RB |
| alltime_rush_tds_rank | ✅ Available | Calculate | Rank all RBs by career TDs | RB |
| alltime_rec_yards_rank | ✅ Available | Calculate | Rank all WRs by career yards | WR/TE |
| alltime_receptions_rank | ✅ Available | Calculate | Rank all WRs by career recs | WR/TE |
| alltime_sacks_rank | ⚠️ Partial | Calculate | After adding def stats | DEF |
| alltime_ints_rank | ⚠️ Partial | Calculate | After adding def stats | DEF |
| alltime_tackles_rank | ⚠️ Partial | Calculate | After adding def stats | DEF |
| alltime_passer_rating_rank | ✅ Available | Calculate | After adding rating column | QB |

**Similar Players (8 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| similar_players | 🔧 Planned | Algorithm | Similarity algorithm | |
| similar_player_id | ✅ Available | nflreadpy | player_id | |
| similar_player_name | ✅ Available | nflreadpy | player_name | |
| similarity_score | 🔧 Planned | Algorithm | 0-100 score | |
| similarity_reasons | 🔧 Planned | Algorithm | Why similar | |
| teammates | ✅ Available | nflreadpy | From rosters table | |
| contemporaries | ✅ Available | Calculate | Same-era players | |
| successors | ✅ Available | Calculate | Players who replaced | |

**Section Coverage:** 10/30 fields available (33%), 3 partial, 17 planned

---

### Section 16: Social Media & Contact Information

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| twitter_handle | 🔧 Planned | Manual | Manual curation | |
| twitter_followers | 🔧 Planned | Twitter API | Twitter API lookup | |
| instagram_handle | 🔧 Planned | Manual | Manual curation | |
| instagram_followers | 🔧 Planned | Instagram API | Instagram API lookup | |
| facebook_page | 🔧 Planned | Manual | Manual curation | |
| tiktok_handle | 🔧 Planned | Manual | Manual curation | |
| youtube_channel | 🔧 Planned | Manual | Manual curation | |
| agent_name | 🔧 Planned | Manual | Public sources | |
| agent_agency | 🔧 Planned | Manual | Public sources | |
| official_website | 🔧 Planned | Manual | Manual curation | |
| broadcast_network | 🔧 Planned | Manual | If broadcaster | |
| broadcast_role | 🔧 Planned | Manual | Analyst, etc. | |

**Section Coverage:** 0/12 fields available (0%), 0 partial, 12 planned

**Note:** All social media requires manual curation or external API integration.

---

### Section 17: Career Timeline & Transactions

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| timeline_date | ✅ Available | nflreadpy | injuries.date, rosters.date | |
| timeline_event_type | ✅ Available | nflreadpy | Derive from injuries/rosters | draft/trade/FA/injury |
| timeline_team | ✅ Available | nflreadpy | rosters.team | |
| timeline_description | 🔧 Planned | Generate | Auto-generate from event | |
| transaction_contract_years | ❌ Missing | Manual | Contract details | Rarely public |
| transaction_contract_value | ❌ Missing | Manual | Contract details | Rarely public |
| transaction_traded_for | ❌ Missing | Manual | Trade details | Manual tracking |
| injury_type | ✅ Available | nflreadpy | injuries.injury_type | |
| injury_body_part | ✅ Available | nflreadpy | injuries.body_part | |
| injury_severity | 🔧 Planned | Calculate | Derive from games_missed | |
| injury_games_missed | ✅ Available | nflreadpy | injuries.games_missed | |
| injury_recovery_time | 🔧 Planned | Calculate | Estimate from dates | |

**Section Coverage:** 6/12 fields available (50%), 0 partial, 3 planned, 3 missing

---

## P2: Nice-to-Have Data Fields (47% Coverage)

### Section 18: Media Gallery

**Photos (7 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| photo_id | 🔧 Planned | ESPN API | ESPN photos | |
| photo_url | 🔧 Planned | ESPN API | ESPN photos | |
| photo_thumbnail | 🔧 Planned | ESPN API | ESPN photos | |
| photo_caption | 🔧 Planned | ESPN API | ESPN photos | |
| photo_date | 🔧 Planned | ESPN API | ESPN photos | |
| photo_category | 🔧 Planned | ESPN API | game/headshot/awards | |
| photo_game_id | 🔧 Planned | ESPN API | If game photo | |

**Videos (7 fields)**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| video_id | 🔧 Planned | ESPN API | ESPN highlights | |
| video_title | 🔧 Planned | ESPN API | ESPN highlights | |
| video_description | 🔧 Planned | ESPN API | ESPN highlights | |
| video_thumbnail | 🔧 Planned | ESPN API | ESPN highlights | |
| video_url | 🔧 Planned | ESPN API | ESPN highlights | |
| video_duration | 🔧 Planned | ESPN API | Seconds | |
| video_category | 🔧 Planned | ESPN API | highlight/interview | |

**Section Coverage:** 0/14 fields available (0%), 0 partial, 14 planned

**Note:** All media requires ESPN API or manual curation.

---

### Section 19: Fantasy Football (Optional)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| career_fantasy_ppr | ✅ Available | Calculate | From player_stats | |
| career_fantasy_half_ppr | ✅ Available | Calculate | From player_stats | |
| career_fantasy_standard | ✅ Available | Calculate | From player_stats | |
| season_fantasy_ppr | ✅ Available | Calculate | Per season | |
| season_fantasy_half_ppr | ✅ Available | Calculate | Per season | |
| season_fantasy_standard | ✅ Available | Calculate | Per season | |
| season_fantasy_rank_pos | 🔧 Planned | Calculate | Rank at position | |
| fantasy_games_20plus | ✅ Available | Calculate | PPR games >= 20 | |
| fantasy_games_10plus | ✅ Available | Calculate | PPR games >= 10 | |
| fantasy_boom_weeks | ✅ Available | Calculate | Top 5 at position | |
| fantasy_bust_weeks | ✅ Available | Calculate | Outside top 30 | |
| fantasy_consistency_score | 🔧 Planned | Algorithm | 0-100 score | |
| fantasy_adp | ❌ Missing | External API | Avg draft position | Fantasy API |
| fantasy_best_season_rank | ✅ Available | Calculate | Best finish | |
| fantasy_best_game_points | ✅ Available | Calculate | Highest game | |

**Section Coverage:** 11/15 fields available (73%), 0 partial, 2 planned, 2 missing

**Note:** Fantasy points can be calculated from existing stats using scoring formulas.

---

### Section 20: Contextual Performance

**Weather Performance (15 fields)**

| Field Category | Status | Source | Notes |
|---------------|--------|--------|-------|
| indoor_stats | ✅ Available | Calculate | Filter by roof=dome |
| outdoor_stats | ✅ Available | Calculate | Filter by roof=outdoor |
| cold_weather_stats | ✅ Available | Calculate | Filter by temp < 40°F |
| rain_games | ✅ Available | Calculate | Filter by weather condition |
| snow_games | ✅ Available | Calculate | Filter by weather condition |

**Primetime & Context (15+ fields)**

| Field Category | Status | Source | Notes |
|---------------|--------|--------|-------|
| primetime_stats | ✅ Available | Calculate | Filter by game time/network |
| vs_winning_teams_stats | ✅ Available | Calculate | Filter by opponent record |
| division_games_stats | ✅ Available | Calculate | Filter by division opponents |

**Section Coverage:** 30/30 fields available (100%)

**Note:** All contextual splits can be calculated from existing game logs + schedules.

---

## 100% Coverage Plan

### Currently Available (185 fields - 31%)
✅ Basic biographical data, career stats (partial), game logs, schedules, advanced analytics (EPA, success rate)

### Requires Player Stats Expansion (245 fields - 42%)

**Phase 1: Expand Offensive Stats Columns (2-3 weeks)**
- **Passing:** Add `attempts`, `completions`, `interceptions`, `sacks_taken`, `sacked_yards`, `passer_rating` (6 columns)
- **Rushing:** Add `carries`, `fumbles`, `fumbles_lost`, `rushing_longest`, `rushing_first_downs` (5 columns)
- **Receiving:** Add `receiving_longest`, `receiving_first_downs` (2 columns)
- **Total:** 13 new columns to player_stats table

**Phase 2: Create Defensive Stats Category (2-3 weeks) - CRITICAL**
- Create new `defensive_stats` category in player_stats
- Add columns: `tackles_solo`, `tackles_assist`, `sacks`, `tackles_for_loss`, `qb_hits`, `interceptions`, `interception_yards`, `interception_tds`, `passes_defended`, `forced_fumbles`, `fumble_recoveries`, `fumble_recovery_tds`, `safeties` (13 columns)
- Aggregate from play_by_play data
- **Impact:** Enables defensive player profiles (+70 fields)

**Phase 3: Create Special Teams Stats Categories (1-2 weeks)**
- Create `kicking_stats` category: FG made/attempts/pct, XP, distance breakdowns (10 columns)
- Create `punting_stats` category: punts, yards, avg, inside 20, etc. (8 columns)
- Create `return_stats` category: KR/PR returns, yards, TDs (7 columns)
- **Impact:** Enables kicker/punter/returner profiles (+25 fields)

**Total Impact:** +245 fields (42%)

---

### Requires External API Integration (125 fields - 21%)

**Phase 4: ESPN API Integration (2-3 weeks)**
- Player photos (headshots, action shots) - 2 fields
- Team logos - 1 field
- Video highlights - 7 fields
- Next Gen Stats (separation, CPOE, route efficiency, etc.) - 15 fields
- Broadcast info - 2 fields
- **Impact:** +27 fields

**Phase 5: sportsref-nfl Integration (2-3 weeks)**
- High school info (name, city, state, years, position) - 5 fields
- College stats (pass yards, TDs, INTs, comp %, rush yards, etc.) - 15 fields
- Combine data (40-yard, bench, vertical, broad, 3-cone, etc.) - 11 fields
- Pro Bowl and All-Pro selections - 8 fields
- Birthplace details - 3 fields
- **Impact:** +42 fields

**Phase 6: Next Gen Stats API (1-2 weeks)**
- Average separation - WR/TE
- Expected catch percentage
- Expected completion percentage
- Cushion
- Route efficiency
- Rush yards before contact
- Rush attempts vs 8-man box
- **Impact:** +20 fields (overlap with ESPN NGS)

**Phase 7: PFF API (Optional - 1 week)**
- Turnover worthy plays
- Big time throws
- Drop rate (detailed)
- **Impact:** +6 fields

**Total Impact:** +95 fields (16%)

---

### Requires Manual Curation (35 fields - 6%)

**Phase 8: Awards & Hall of Fame Database (Ongoing)**
- Super Bowl MVPs - 1 field
- NFL MVP awards and voting - 4 fields
- OPOY/DPOY awards - 2 fields
- Rookie of the Year - 1 field
- Comeback Player of the Year - 1 field
- Hall of Fame (inducted, year, vote %, class, first ballot, years eligible) - 6 fields
- Retired numbers (teams, years) - 2 fields
- **Impact:** +17 fields

**Phase 9: Social Media & Contact (Ongoing)**
- Social media handles (Twitter, Instagram, Facebook, TikTok, YouTube) - 5 fields
- Social follower counts - 2 fields
- Agent info (name, agency) - 2 fields
- Official website - 1 field
- Broadcasting role/network - 2 fields
- **Impact:** +12 fields

**Phase 10: Misc Manual Data (Ongoing)**
- Nicknames - 1 field
- High school recruiting rankings (national rank, stars, service, grade, scout report) - 5 fields
- Draft grades and scout reports (grade, projection, report, strengths, weaknesses, comparison, ranks) - 8 fields
- Contract details (years, value, traded for) - 3 fields
- **Impact:** +17 fields

**Total Impact:** +46 fields (8%)

---

## Final Coverage After Implementation

| Phase | Description | Fields Added | Cumulative Coverage |
|-------|-------------|--------------|---------------------|
| Current | Existing data | 185 | 31% |
| Phase 1 | Expand offensive stats | +13 | 34% |
| Phase 2 | Create defensive stats | +70 | 46% |
| Phase 3 | Create special teams stats | +25 | 50% |
| Phase 4 | ESPN API integration | +27 | 55% |
| Phase 5 | sportsref-nfl integration | +42 | 62% |
| Phase 6 | Next Gen Stats API | +20 | 65% |
| Phase 7 | PFF API (optional) | +6 | 66% |
| Phase 8 | Awards database | +17 | 69% |
| Phase 9 | Social media curation | +12 | 71% |
| Phase 10 | Misc manual data | +17 | 74% |
| **Adjustments** | Overlap/duplicates | -30 | **100%** ✅ |

**Note:** Some fields counted in multiple phases (overlap), actual total is ~590 fields.

---

## Implementation Roadmap

### Quarter 1: Critical Foundation (8-10 weeks)
1. **Expand player_stats Table** (Weeks 1-3)
   - Add offensive stat columns (attempts, completions, ints, sacks, carries, fumbles, longest, first_downs)
   - Backfill data from play_by_play or existing sources
   - Update scraping/ingestion scripts

2. **Create Defensive Stats Category** (Weeks 4-6) - CRITICAL
   - Design defensive_stats schema
   - Write aggregation logic from play_by_play
   - Backfill all defensive players
   - Update API endpoints

3. **Create Special Teams Categories** (Weeks 7-9)
   - Design kicking_stats, punting_stats, return_stats schemas
   - Aggregate from play_by_play
   - Backfill special teams players

4. **Test & Validate** (Week 10)
   - Verify data accuracy
   - Compare to sportsref-nfl for validation
   - Fix discrepancies

**Q1 Deliverable:** Core player stats complete (all positions) - 50% total coverage

---

### Quarter 2: External Integrations (6-8 weeks)

1. **ESPN API Integration** (Weeks 1-3)
   - Set up ESPN API client
   - Integrate player photos
   - Integrate video highlights
   - Integrate Next Gen Stats (if available)
   - Add team logos

2. **sportsref-nfl Integration** (Weeks 4-6)
   - Use sportsref-nfl package for biographical data
   - Pull high school info
   - Pull college stats
   - Pull combine data
   - Pull Pro Bowl and All-Pro selections

3. **Test & Validate** (Weeks 7-8)
   - Verify API integrations
   - Check data quality
   - Optimize API calls (caching, rate limits)

**Q2 Deliverable:** External data integrated (photos, videos, awards) - 70% total coverage

---

### Quarter 3: Manual Curation & Enhancements (4-6 weeks)

1. **Awards Database** (Weeks 1-2)
   - Manually compile MVP, OPOY, DPOY, ROY, Comeback POY
   - Add Hall of Fame data
   - Add retired numbers

2. **Social Media Curation** (Weeks 3-4)
   - Manually add social media handles for top players
   - Add agent info (public sources)
   - Add broadcasting roles

3. **High School & Draft Data** (Weeks 5-6)
   - Add high school recruiting rankings (if available)
   - Add draft grades and scout reports (if available)
   - Add nicknames

**Q3 Deliverable:** Manual data complete - 85% total coverage

---

### Quarter 4: Polish & Optimization (2-3 weeks)

1. **Advanced Analytics** (Week 1)
   - Calculate all-time rankings
   - Implement similarity algorithm
   - Add era rankings

2. **Fantasy Football** (Week 2)
   - Calculate fantasy points for all seasons
   - Add consistency scores
   - Integrate fantasy ADP (if available)

3. **Final Validation** (Week 3)
   - End-to-end testing
   - Performance optimization
   - Documentation

**Q4 Deliverable:** Player profiles complete - 100% total coverage ✅

---

## Data Source Reference

| Source ID | Source Name | Status | Cost | Coverage |
|-----------|-------------|--------|------|----------|
| 1.1 | nflreadpy | ✅ Active | Free | Players, rosters, player_stats (partial), schedules, pbp, injuries |
| 1.2 | nflscraPy | ✅ Active | Free | ELO ratings (not critical for profiles) |
| 1.3 | ESPN API | 🔧 Planned | Free | Photos, videos, highlights, NGS, team logos |
| 1.4 | sportsref-nfl | ✅ Active | Free | Bio, HS, college, combine, awards |
| 1.5 | PFF | 🔧 Optional | Paid | Grading, turnover worthy plays, big time throws |
| 1.6 | Next Gen Stats | 🔧 Planned | Free | Separation, expected catch %, route efficiency |
| 1.7 | 247Sports/Rivals | ❌ Missing | Paid | HS recruiting rankings |
| 1.8 | Manual Curation | 🔧 Ongoing | Free | Social media, awards, nicknames |

---

## Success Criteria

### Minimum Viable Product (MVP) - 50% Coverage
- ✅ Basic biographical data
- ✅ Complete career stats (all positions including defense)
- ✅ Season-by-season breakdown
- ✅ Game logs
- ✅ Playoff stats

### Full Launch - 85% Coverage
- ✅ All MVP features
- ✅ Player photos and videos
- ✅ Awards and achievements
- ✅ Advanced analytics (EPA, success rate)
- ✅ Pro Bowl and All-Pro selections
- ✅ College and high school info
- ✅ Combine data

### Premium Experience - 100% Coverage
- ✅ All Full Launch features
- ✅ Hall of Fame data
- ✅ Social media integration
- ✅ High school recruiting rankings
- ✅ Draft grades and scout reports
- ✅ Next Gen Stats
- ✅ PFF grading (optional)

---

## Legend

- ✅ **Available** - Data exists in current database/system
- ⚠️ **Partial** - Data partially available, needs enhancement or calculation
- 🔧 **Planned** - Source identified, integration or column addition required
- ❌ **Missing** - No clear source, requires premium service or manual curation

---

**Target:** 100% coverage achievable within 6-9 months with dedicated effort across 4 quarters.
