# Master Data Source Report - Completed Games

**Game Type:** Final / Post-Game
**Coverage Goal:** 100% - Every data field mapped to a source
**Current Status:** 45% Available, 55% Requires Integration/Enhancement
**Last Updated:** 2025-10-17

---

## Coverage Summary

| Category | Total Fields | Available | Partial | Missing | Coverage % |
|----------|--------------|-----------|---------|---------|------------|
| P0 - Must Have | 78 | 24 | 32 | 22 | 72% |
| P1 - Important | 35 | 19 | 10 | 6 | 83% |
| P2 - Nice to Have | 28 | 15 | 8 | 5 | 82% |
| **TOTAL** | **141** | **58** | **50** | **33** | **77%** |

---

## P0: Must-Have Data Fields (72% Coverage)

### Section 1: Final Game Header

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| game_id | ✅ Available | nflreadpy | schedules.game_id | |
| season | ✅ Available | nflreadpy | schedules.season | |
| week | ✅ Available | nflreadpy | schedules.week | |
| season_type | ✅ Available | nflreadpy | schedules.game_type (REG/POST/PRE) | |
| home_team_name | ✅ Available | nflreadpy | teams.name | |
| away_team_name | ✅ Available | nflreadpy | teams.name | |
| home_abbreviation | ✅ Available | nflreadpy | teams.abbreviation | |
| away_abbreviation | ✅ Available | nflreadpy | teams.abbreviation | |
| home_team_logo | 🔧 Planned | ESPN API | Add logo_url to teams table | |
| away_team_logo | 🔧 Planned | ESPN API | Add logo_url to teams table | |
| final_score_home | ✅ Available | nflreadpy | schedules.home_score | |
| final_score_away | ✅ Available | nflreadpy | schedules.away_score | |
| winner | ✅ Available | nflreadpy | schedules.result | |
| home_record_before | ✅ Available | nflreadpy | Calculate from season_stats | |
| home_record_after | ✅ Available | nflreadpy | Calculate from season_stats | |
| away_record_before | ✅ Available | nflreadpy | Calculate from season_stats | |
| away_record_after | ✅ Available | nflreadpy | Calculate from season_stats | |
| venue_name | ✅ Available | nflreadpy | schedules.stadium | |
| venue_city | 🔧 Planned | Static Data | Stadium reference table | |
| venue_state | 🔧 Planned | Static Data | Stadium reference table | |
| roof_type | ✅ Available | nflreadpy | schedules.roof | |
| attendance | ✅ Available | nflreadpy | schedules.attendance | |
| broadcast_network | 🔧 Planned | ESPN API | Add to schedules or fetch | |
| scheduled_date | ✅ Available | nflreadpy | schedules.gameday | |
| scheduled_time | ✅ Available | nflreadpy | schedules.gametime | |
| actual_kickoff | ✅ Available | nflreadpy | schedules.gametime | |

**Section Coverage:** 21/26 fields available (81%)

---

### Section 2: Final Score Breakdown

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| home_q1_score | ❌ Missing | ESPN API / Calculate | Aggregate from pbp scoring plays | CRITICAL: Not in database |
| home_q2_score | ❌ Missing | ESPN API / Calculate | Aggregate from pbp scoring plays | CRITICAL: Not in database |
| home_q3_score | ❌ Missing | ESPN API / Calculate | Aggregate from pbp scoring plays | CRITICAL: Not in database |
| home_q4_score | ❌ Missing | ESPN API / Calculate | Aggregate from pbp scoring plays | CRITICAL: Not in database |
| home_ot_score | ❌ Missing | ESPN API / Calculate | Aggregate from pbp scoring plays | CRITICAL: Not in database |
| home_total_score | ✅ Available | nflreadpy | schedules.home_score | |
| away_q1_score | ❌ Missing | ESPN API / Calculate | Aggregate from pbp scoring plays | CRITICAL: Not in database |
| away_q2_score | ❌ Missing | ESPN API / Calculate | Aggregate from pbp scoring plays | CRITICAL: Not in database |
| away_q3_score | ❌ Missing | ESPN API / Calculate | Aggregate from pbp scoring plays | CRITICAL: Not in database |
| away_q4_score | ❌ Missing | ESPN API / Calculate | Aggregate from pbp scoring plays | CRITICAL: Not in database |
| away_ot_score | ❌ Missing | ESPN API / Calculate | Aggregate from pbp scoring plays | CRITICAL: Not in database |
| away_total_score | ✅ Available | nflreadpy | schedules.away_score | |

**Section Coverage:** 2/12 fields available (17%), 10 require ESPN API or pbp aggregation

---

### Section 3: Complete Box Score - Passing

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| player_name | ✅ Available | nflreadpy | players.name | |
| team | ✅ Available | nflreadpy | player_stats.team | |
| completions | 🔧 Planned | nflreadpy | Add to player_stats table | CRITICAL: Need column |
| attempts | 🔧 Planned | nflreadpy | Add to player_stats table | CRITICAL: Need column |
| completion_percentage | 🔧 Planned | Calculate | comp / att * 100 | After adding comp/att |
| passing_yards | ✅ Available | nflreadpy | player_stats.passing_yards | |
| yards_per_attempt | 🔧 Planned | Calculate | yards / att | After adding att |
| passing_touchdowns | ✅ Available | nflreadpy | player_stats.passing_tds | |
| interceptions | 🔧 Planned | nflreadpy | Add to player_stats table | CRITICAL: Need column |
| sacks | 🔧 Planned | nflreadpy | Add to player_stats table | CRITICAL: Need column |
| sack_yards_lost | 🔧 Planned | nflreadpy | Add to player_stats table | CRITICAL: Need column |
| longest_pass | 🔧 Planned | nflreadpy | Add to player_stats OR MAX from pbp | Need column |
| passer_rating | 🔧 Planned | nflreadpy / Calculate | Add column or calculate from formula | Need column |
| qbr | 🔧 Planned | ESPN API | ESPN proprietary metric | ESPN only |

**Section Coverage:** 4/14 fields available (29%), 10 require player_stats expansion

---

### Section 4: Complete Box Score - Rushing

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| player_name | ✅ Available | nflreadpy | players.name | |
| team | ✅ Available | nflreadpy | player_stats.team | |
| carries | 🔧 Planned | nflreadpy | Add to player_stats table | CRITICAL: Need column |
| rushing_yards | ✅ Available | nflreadpy | player_stats.rushing_yards | |
| average_yards_per_carry | 🔧 Planned | Calculate | yards / carries | After adding carries |
| rushing_touchdowns | ✅ Available | nflreadpy | player_stats.rushing_tds | |
| longest_run | 🔧 Planned | nflreadpy | Add to player_stats OR MAX from pbp | Need column |
| fumbles | 🔧 Planned | nflreadpy | Add to player_stats table | Need column |
| first_downs_rushing | 🔧 Planned | nflreadpy | Add to player_stats table | Need column |

**Section Coverage:** 4/9 fields available (44%), 5 require player_stats expansion

---

### Section 5: Complete Box Score - Receiving

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| player_name | ✅ Available | nflreadpy | players.name | |
| team | ✅ Available | nflreadpy | player_stats.team | |
| receptions | ✅ Available | nflreadpy | player_stats.receptions | |
| targets | ✅ Available | nflreadpy | player_stats.targets | |
| catch_rate | ✅ Available | Calculate | rec / targets * 100 | |
| receiving_yards | ✅ Available | nflreadpy | player_stats.receiving_yards | |
| yards_per_reception | ✅ Available | Calculate | yards / rec | |
| receiving_touchdowns | ✅ Available | nflreadpy | player_stats.receiving_tds | |
| longest_reception | 🔧 Planned | nflreadpy | Add to player_stats OR MAX from pbp | Need column |
| first_downs_receiving | 🔧 Planned | nflreadpy | Add to player_stats table | Need column |

**Section Coverage:** 8/10 fields available (80%), 2 require player_stats expansion

---

### Section 6: Complete Box Score - Defense

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| player_name | ✅ Available | nflreadpy | players.name | |
| team | ✅ Available | nflreadpy | player_stats.team | |
| tackles_solo | 🔧 Planned | nflreadpy | Add defensive category to player_stats | CRITICAL: Missing category |
| tackles_assist | 🔧 Planned | nflreadpy | Add defensive category to player_stats | CRITICAL: Missing category |
| tackles_total | 🔧 Planned | nflreadpy / Calculate | solo + assist | CRITICAL: Missing category |
| sacks_defense | 🔧 Planned | nflreadpy | Add defensive category to player_stats | CRITICAL: Missing category |
| tackles_for_loss | 🔧 Planned | nflreadpy | Add defensive category to player_stats | CRITICAL: Missing category |
| interceptions_defense | 🔧 Planned | nflreadpy | Add defensive category to player_stats | CRITICAL: Missing category |
| passes_defended | 🔧 Planned | nflreadpy | Add defensive category to player_stats | CRITICAL: Missing category |
| forced_fumbles | 🔧 Planned | nflreadpy | Add defensive category to player_stats | CRITICAL: Missing category |
| fumble_recoveries | 🔧 Planned | nflreadpy | Add defensive category to player_stats | CRITICAL: Missing category |

**Section Coverage:** 2/11 fields available (18%), 9 require new defensive stats category

---

### Section 7: Final Team Stats Comparison

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| home_first_downs | 🔧 Planned | ESPN API / Calculate | Team stats endpoint or pbp calc | Need integration |
| away_first_downs | 🔧 Planned | ESPN API / Calculate | Team stats endpoint or pbp calc | Need integration |
| home_first_downs_passing | 🔧 Planned | ESPN API / Calculate | Team stats or pbp | Need integration |
| away_first_downs_passing | 🔧 Planned | ESPN API / Calculate | Team stats or pbp | Need integration |
| home_first_downs_rushing | 🔧 Planned | ESPN API / Calculate | Team stats or pbp | Need integration |
| away_first_downs_rushing | 🔧 Planned | ESPN API / Calculate | Team stats or pbp | Need integration |
| home_first_downs_penalty | 🔧 Planned | ESPN API / Calculate | Team stats or pbp | Need integration |
| away_first_downs_penalty | 🔧 Planned | ESPN API / Calculate | Team stats or pbp | Need integration |
| home_total_yards | ⚠️ Partial | nflreadpy / Calculate | Aggregate from pbp | Season avg available, need per-game |
| away_total_yards | ⚠️ Partial | nflreadpy / Calculate | Aggregate from pbp | Season avg available, need per-game |
| home_passing_yards | ⚠️ Partial | nflreadpy / Calculate | Aggregate from pbp | Season avg available, need per-game |
| away_passing_yards | ⚠️ Partial | nflreadpy / Calculate | Aggregate from pbp | Season avg available, need per-game |
| home_rushing_yards | ⚠️ Partial | nflreadpy / Calculate | Aggregate from pbp | Season avg available, need per-game |
| away_rushing_yards | ⚠️ Partial | nflreadpy / Calculate | Aggregate from pbp | Season avg available, need per-game |
| home_plays | ⚠️ Partial | Calculate | COUNT pbp plays | Need aggregation |
| away_plays | ⚠️ Partial | Calculate | COUNT pbp plays | Need aggregation |
| home_yards_per_play | ⚠️ Partial | Calculate | total_yards / plays | Need aggregation |
| away_yards_per_play | ⚠️ Partial | Calculate | total_yards / plays | Need aggregation |
| home_turnovers | ⚠️ Partial | Calculate | COUNT fumbles + INTs from pbp | Need event flags |
| away_turnovers | ⚠️ Partial | Calculate | COUNT fumbles + INTs from pbp | Need event flags |
| home_fumbles_lost | ⚠️ Partial | Calculate | COUNT fumble plays from pbp | Need fumble flag |
| away_fumbles_lost | ⚠️ Partial | Calculate | COUNT fumble plays from pbp | Need fumble flag |
| home_interceptions_thrown | ⚠️ Partial | Calculate | COUNT INT plays from pbp | Need INT flag |
| away_interceptions_thrown | ⚠️ Partial | Calculate | COUNT INT plays from pbp | Need INT flag |
| home_penalties | 🔧 Planned | ESPN API / Calculate | Team stats or count from pbp | Need penalty flag |
| away_penalties | 🔧 Planned | ESPN API / Calculate | Team stats or count from pbp | Need penalty flag |
| home_penalty_yards | 🔧 Planned | ESPN API / Calculate | Team stats or sum from pbp | Need penalty flag + yards |
| away_penalty_yards | 🔧 Planned | ESPN API / Calculate | Team stats or sum from pbp | Need penalty flag + yards |
| home_time_of_possession | 🔧 Planned | ESPN API | Team stats endpoint | Complex clock calc |
| away_time_of_possession | 🔧 Planned | ESPN API | Team stats endpoint | Complex clock calc |
| home_third_down_conv | 🔧 Planned | ESPN API / Calculate | Need down column in pbp | |
| away_third_down_conv | 🔧 Planned | ESPN API / Calculate | Need down column in pbp | |
| home_third_down_att | 🔧 Planned | ESPN API / Calculate | Need down column in pbp | |
| away_third_down_att | 🔧 Planned | ESPN API / Calculate | Need down column in pbp | |
| home_third_down_pct | 🔧 Planned | Calculate | conv / att * 100 | |
| away_third_down_pct | 🔧 Planned | Calculate | conv / att * 100 | |
| home_fourth_down_conv | 🔧 Planned | ESPN API / Calculate | Need down column in pbp | |
| away_fourth_down_conv | 🔧 Planned | ESPN API / Calculate | Need down column in pbp | |
| home_fourth_down_att | 🔧 Planned | ESPN API / Calculate | Need down column in pbp | |
| away_fourth_down_att | 🔧 Planned | ESPN API / Calculate | Need down column in pbp | |
| home_fourth_down_pct | 🔧 Planned | Calculate | conv / att * 100 | |
| away_fourth_down_pct | 🔧 Planned | Calculate | conv / att * 100 | |
| home_red_zone_trips | 🔧 Planned | ESPN API / Calculate | Need yardline in pbp | |
| away_red_zone_trips | 🔧 Planned | ESPN API / Calculate | Need yardline in pbp | |
| home_red_zone_scores | 🔧 Planned | ESPN API / Calculate | Need yardline + TD flag | |
| away_red_zone_scores | 🔧 Planned | ESPN API / Calculate | Need yardline + TD flag | |
| home_sacks_allowed | 🔧 Planned | ESPN API / Calculate | Need sack flag in pbp | |
| away_sacks_allowed | 🔧 Planned | ESPN API / Calculate | Need sack flag in pbp | |

**Section Coverage:** 0/48 fields available (0%), 48 require ESPN API or pbp expansion

---

## P1: Important Data Fields (83% Coverage)

### Section 8: Complete Scoring Summary

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| scoring_plays_list | ⚠️ Partial | nflreadpy | Filter pbp for scoring plays | Need TD/FG/safety flags |
| play_quarter | ✅ Available | nflreadpy | play_by_play.quarter | |
| play_time | ✅ Available | nflreadpy | play_by_play.clock | |
| scoring_team | ✅ Available | nflreadpy | play_by_play.posteam | |
| score_type | ⚠️ Partial | nflreadpy | Detect from play_type | Need TD/FG/safety flags |
| play_description | ✅ Available | nflreadpy | play_by_play.play_text | |
| yards_for_td_or_fg_distance | ⚠️ Partial | nflreadpy | play_by_play.yards_gained | For TDs; FG distance TBD |
| home_score_after | 🔧 Planned | ESPN / Calculate | Running score or ESPN | Need running total |
| away_score_after | 🔧 Planned | ESPN / Calculate | Running score or ESPN | Need running total |
| drive_plays | 🔧 Planned | Calculate | COUNT plays for drive | Need drive column |
| drive_yards | 🔧 Planned | Calculate | SUM yards for drive | Need drive column |
| drive_time | 🔧 Planned | ESPN / Calculate | Drive time of possession | Need drive column + clock calc |

**Section Coverage:** 4/12 fields available (33%), 8 require drive aggregation

---

### Section 9: Season Context & Playoff Implications

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| home_playoff_status | ⚠️ Partial | nflreadpy | Calculate from season_stats | Need playoff logic |
| away_playoff_status | ⚠️ Partial | nflreadpy | Calculate from season_stats | Need playoff logic |
| home_division_standing | ✅ Available | nflreadpy | Rank from season_stats by division | |
| away_division_standing | ✅ Available | nflreadpy | Rank from season_stats by division | |
| home_conference_standing | ✅ Available | nflreadpy | Rank from season_stats by conference | |
| away_conference_standing | ✅ Available | nflreadpy | Rank from season_stats by conference | |
| home_playoff_probability | 🔧 Planned | ESPN FPI / Custom | Prediction model | |
| away_playoff_probability | 🔧 Planned | ESPN FPI / Custom | Prediction model | |
| home_current_streak | ✅ Available | nflreadpy | Detect from schedules | |
| away_current_streak | ✅ Available | nflreadpy | Detect from schedules | |
| home_home_record | ✅ Available | nflreadpy | Filter schedules by home | |
| away_away_record | ✅ Available | nflreadpy | Filter schedules by away | |
| home_division_record | ✅ Available | nflreadpy | Filter schedules by division | |
| away_division_record | ✅ Available | nflreadpy | Filter schedules by division | |
| season_series_summary | ✅ Available | nflreadpy | Filter schedules by both teams + season | |
| season_series_games_remaining | ✅ Available | nflreadpy | COUNT future games between teams | |

**Section Coverage:** 12/16 fields available (75%), 4 require playoff logic or prediction model

---

### Section 10: Final Betting Results

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| spread_opening_line | ✅ Available | nflreadpy | schedules.spread_line | |
| spread_closing_line | ⚠️ Partial | The Odds API | Store closing line before kickoff | Need to capture |
| spread_favorite | ✅ Available | nflreadpy | Calculate from spread_line sign | |
| spread_actual_margin | ✅ Available | nflreadpy | home_score - away_score | |
| spread_result | ✅ Available | Calculate | Compare margin vs line | |
| total_opening_line | ✅ Available | nflreadpy | schedules.total | |
| total_closing_line | ⚠️ Partial | The Odds API | Store closing total before kickoff | Need to capture |
| total_actual_total | ✅ Available | nflreadpy | home_score + away_score | |
| total_result | ✅ Available | Calculate | Over/Under/Push | |
| moneyline_home_odds | ⚠️ Partial | The Odds API | Store pregame moneyline | Need to capture |
| moneyline_away_odds | ⚠️ Partial | The Odds API | Store pregame moneyline | Need to capture |
| moneyline_winner | ✅ Available | nflreadpy | schedules.result | |

**Section Coverage:** 8/12 fields available (67%), 4 require The Odds API historical data

---

### Section 11: Player Milestones & Achievements

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| milestones_list | ⚠️ Partial | nflreadpy | player_stats + detection logic | Need milestone algorithm |
| player_name | ✅ Available | nflreadpy | players.name | |
| team | ✅ Available | nflreadpy | player_stats.team | |
| milestone_type | ⚠️ Partial | Custom Logic | Career/Season/Game | Need detection algorithm |
| achievement_description | ⚠️ Partial | Custom Logic | E.g., "300th career TD" | Need detection algorithm |
| stat_value | ✅ Available | nflreadpy | player_stats (relevant stat) | |

**Section Coverage:** 3/6 fields available (50%), 3 require milestone detection logic

---

### Section 12: Historical Comparisons

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| all_time_home_wins | ✅ Available | nflreadpy | Filter schedules by both teams | |
| all_time_away_wins | ✅ Available | nflreadpy | Filter schedules by both teams | |
| all_time_ties | ✅ Available | nflreadpy | Filter schedules by both teams | |
| venue_home_wins | ✅ Available | nflreadpy | Filter by stadium + both teams | |
| venue_away_wins | ✅ Available | nflreadpy | Filter by stadium + both teams | |
| previous_meeting_this_season | ✅ Available | nflreadpy | Filter by season + both teams + prev date | |
| similar_games_list | ⚠️ Partial | nflreadpy | Filter by records/standings | Need similarity algorithm |

**Section Coverage:** 6/7 fields available (86%), 1 requires similarity algorithm

---

## P2: Nice-to-Have Data Fields (82% Coverage)

### Section 13: Complete Play-by-Play

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| all_plays_list | ✅ Available | nflreadpy | play_by_play table (all plays) | |
| play_quarter | ✅ Available | nflreadpy | play_by_play.quarter | |
| play_time | ✅ Available | nflreadpy | play_by_play.clock | |
| play_down | ⚠️ Partial | nflreadpy | play_by_play.down (add column) | Need to add down |
| play_distance | ⚠️ Partial | nflreadpy | play_by_play.ydstogo (add column) | Need to add ydstogo |
| play_yardline | ⚠️ Partial | nflreadpy | play_by_play.yardline_100 (add column) | Need to add yardline |
| play_possession_team | ✅ Available | nflreadpy | play_by_play.posteam | |
| play_type | ✅ Available | nflreadpy | play_by_play.play_type | |
| play_description | ✅ Available | nflreadpy | play_by_play.play_text | |
| play_yards_gained | ✅ Available | nflreadpy | play_by_play.yards_gained | |
| play_scoring_flag | ⚠️ Partial | nflreadpy | Detect from play_type | Need TD/FG/safety flags |
| play_turnover_flag | ⚠️ Partial | nflreadpy | Detect from play_type | Need fumble/INT flags |
| play_penalty_flag | ⚠️ Partial | nflreadpy | Detect from play_text | Need penalty flag |
| play_home_score_after | 🔧 Planned | ESPN / Calculate | Running score | Need running total |
| play_away_score_after | 🔧 Planned | ESPN / Calculate | Running score | Need running total |

**Section Coverage:** 7/15 fields available (47%), 8 require pbp expansion + running score

---

### Section 14: Game Information & Details

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| weather_temperature | ✅ Available | nflreadpy | schedules.temp | |
| weather_condition | ✅ Available | nflreadpy | schedules.weather_desc (if available) | |
| weather_wind_speed | ✅ Available | nflreadpy | schedules.wind | |
| weather_wind_direction | ⚠️ Partial | nflreadpy | schedules.wind (may include direction) | |
| referee | 🔧 Planned | nflreadpy | Officials data (not currently collected) | Available in nflreadpy |
| umpire | 🔧 Planned | nflreadpy | Officials data (not currently collected) | Available in nflreadpy |
| down_judge | 🔧 Planned | nflreadpy | Officials data (not currently collected) | Available in nflreadpy |
| line_judge | 🔧 Planned | nflreadpy | Officials data (not currently collected) | Available in nflreadpy |
| field_judge | 🔧 Planned | nflreadpy | Officials data (not currently collected) | Available in nflreadpy |
| side_judge | 🔧 Planned | nflreadpy | Officials data (not currently collected) | Available in nflreadpy |
| back_judge | 🔧 Planned | nflreadpy | Officials data (not currently collected) | Available in nflreadpy |
| broadcast_network | 🔧 Planned | ESPN API | Broadcast info | |
| broadcast_announcers | 🔧 Planned | ESPN API | Play-by-play, color analyst | |
| broadcast_viewership | ❌ Missing | Manual / Nielsen | Ratings data | Premium source |

**Section Coverage:** 3/14 fields available (21%), 11 require officials/broadcast data

---

### Section 15: Advanced Analytics

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| win_probability_chart_data | ⚠️ Partial | nflreadpy | play_by_play.wp (add column) | Need to add wp column |
| home_total_epa | ✅ Available | nflreadpy | SUM play_by_play.epa by team | |
| away_total_epa | ✅ Available | nflreadpy | SUM play_by_play.epa by team | |
| home_passing_epa | ✅ Available | nflreadpy | SUM epa for pass plays by team | |
| away_passing_epa | ✅ Available | nflreadpy | SUM epa for pass plays by team | |
| home_rushing_epa | ✅ Available | nflreadpy | SUM epa for rush plays by team | |
| away_rushing_epa | ✅ Available | nflreadpy | SUM epa for rush plays by team | |
| home_success_rate | ✅ Available | nflreadpy | season_stats.success_rate_off OR calc from pbp | |
| away_success_rate | ✅ Available | nflreadpy | season_stats.success_rate_off OR calc from pbp | |
| home_explosive_plays | ✅ Available | nflreadpy | COUNT yards_gained > 20 from pbp | |
| away_explosive_plays | ✅ Available | nflreadpy | COUNT yards_gained > 20 from pbp | |

**Section Coverage:** 10/11 fields available (91%), 1 requires wp column

---

### Section 16: Video Highlights & Media

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| highlights_list | 🔧 Planned | ESPN API | Highlights endpoint | |
| highlight_video_id | 🔧 Planned | ESPN API | Video ID | |
| highlight_title | 🔧 Planned | ESPN API | Video title | |
| highlight_description | 🔧 Planned | ESPN API | Video description | |
| highlight_thumbnail_url | 🔧 Planned | ESPN API | Thumbnail image | |
| highlight_video_url | 🔧 Planned | ESPN API | Video stream URL | |
| highlight_duration | 🔧 Planned | ESPN API | Video length (seconds) | |
| post_game_interviews_list | ❌ Missing | Manual / YouTube | Requires curation | |

**Section Coverage:** 0/8 fields available (0%), 8 require ESPN API or manual curation

---

## 100% Coverage Plan

### Currently Available (58 fields)
✅ Game header (90%), basic box scores (partial), season context, historical comparisons, EPA metrics

### Requires ESPN API Integration (28 fields)

**ESPN Box Score Endpoint (10 fields) - Priority: CRITICAL**
- Quarter-by-quarter scores (Q1-Q4, OT for both teams)

**ESPN Team Stats Endpoint (48 fields) - Priority: CRITICAL**
- First downs, 3rd/4th down %, red zone, TOP, penalties

**ESPN Officials/Broadcast (12 fields) - Priority: LOW**
- Officials roster, broadcast info

**ESPN Highlights (7 fields) - Priority: LOW**
- Video highlights

### Requires nflreadpy Player Stats Expansion (30+ fields)

**Add to player_stats table - Priority: CRITICAL**
- Passing: completions, attempts, interceptions, sacks, sacked_yards, passer_rating (6 fields)
- Rushing: carries, rushing_longest, rushing_fumbles, rushing_first_downs (4 fields)
- Receiving: receiving_longest, receiving_first_downs (2 fields)
- Defense (NEW CATEGORY): tackles_solo, tackles_assist, sacks_def, tackles_for_loss, pass_deflections, qb_hits, interceptions_def, interception_yards (8 fields)
- Kicking (NEW CATEGORY): fg_made, fg_attempts, fg_longest, xp_made, xp_attempts (5 fields)
- Punting (NEW CATEGORY): punts, punt_yards, punt_longest, punts_inside_20, punt_touchbacks (5 fields)
- Returns (NEW CATEGORY): kick_returns, kick_return_yards, punt_returns, punt_return_yards, return_touchdowns (5 fields)

### Requires nflreadpy PBP Expansion (15 fields)

**Add columns to play_by_play table - Priority: HIGH**
- down, ydstogo, yardline_100
- drive (drive number)
- wp (win probability)
- Event flags: touchdown, fumble, interception, penalty
- Player IDs: passer_id, rusher_id, receiver_id, tackle_1, tackle_2

### Requires Custom Logic/Calculation (15 fields)

**Drive-Level Aggregation (12 fields) - Priority: HIGH**
- Scoring summary drive stats
- Running score calculation

**Milestone Detection (3 fields) - Priority: MEDIUM**
- Career/season/game achievement algorithm

**Similarity Detection (1 field) - Priority: LOW**
- Similar games algorithm

### Requires The Odds API (4 fields)

**Closing Lines Storage - Priority: MEDIUM**
- Closing spread, total, moneyline
- Store before kickoff

### Requires Static/Manual Data (3 fields)

**Stadium Reference Table (2 fields) - Priority: LOW**
- Venue city, state

**Officials Data Collection (7 fields) - Priority: LOW**
- Collect from nflreadpy officials

**Viewership Data (1 field) - Priority: LOW**
- Nielsen ratings (premium)

---

## Implementation Roadmap

### Phase 1: CRITICAL - Complete Box Scores (3-4 weeks)

1. **Expand nflreadpy player_stats Table** - Add 30-40 columns
   - Effort: 5-7 days
   - Impact: +30 fields
   - Columns: All passing/rushing/receiving/defense/kicking/punting/returns stats

2. **ESPN API - Quarter Scores & Team Stats**
   - Effort: 3-5 days
   - Impact: +58 fields (10 quarter scores + 48 team stats)
   - Endpoints:
     - `/sports/football/nfl/summary?event={game_id}` (quarter scores)
     - `/sports/football/nfl/boxscore?event={game_id}` (team stats)

3. **Expand nflreadpy PBP Table** - Add 15 columns
   - Effort: 3-5 days
   - Impact: +15 fields
   - Columns: down, ydstogo, yardline_100, drive, wp, event flags, player IDs

### Phase 2: HIGH - Drive Stats & Aggregation (2-3 weeks)

4. **Drive-Level Aggregation Logic**
   - Effort: 3-5 days
   - Impact: +12 fields
   - Uses: drive column from pbp

5. **Running Score Calculation**
   - Effort: 2-3 days
   - Impact: +2 fields
   - Uses: Scoring plays from pbp

6. **Milestone Detection Algorithm**
   - Effort: 3-5 days
   - Impact: +3 fields
   - Logic: Career/season thresholds

### Phase 3: MEDIUM/LOW - Enhancements (1-2 weeks)

7. **The Odds API - Store Closing Lines**
   - Effort: 2-3 days
   - Impact: +4 fields
   - Store: Before each kickoff

8. **nflreadpy Officials Data Collection**
   - Effort: 1-2 days
   - Impact: +7 fields
   - Available in nflreadpy

9. **ESPN Highlights Integration**
   - Effort: 3-5 days
   - Impact: +7 fields

10. **Static Data & Misc**
    - Effort: 1-2 days
    - Impact: +3 fields
    - Stadium reference, team logos

---

## Final Coverage After Implementation

| Category | Current | After Phase 1 | After Phase 2 | After Phase 3 |
|----------|---------|---------------|---------------|---------------|
| P0 - Must Have | 72% | 100% ✅ | 100% ✅ | 100% ✅ |
| P1 - Important | 83% | 94% | 100% ✅ | 100% ✅ |
| P2 - Nice to Have | 82% | 89% | 93% | 100% ✅ |
| **OVERALL** | **77%** | **96%** | **98%** | **100%** ✅ |

**Target: 100% coverage achieved after Phase 3**

---

## Data Source Reference

| Source ID | Source Name | Status | Cost | Update Frequency |
|-----------|-------------|--------|------|------------------|
| 1.1 | nflreadpy | ✅ Active | Free | Real-time |
| 1.2 | nflscraPy | ✅ Active | Free | Daily |
| 1.3 | ESPN API | ⚠️ Need to Add | Free | Real-time |
| 1.4 | sportsref-nfl | ✅ Active | Free | Daily |
| 1.5 | The Odds API | 🔧 Planned | $99-500/mo | Real-time |

---

## Legend

- ✅ **Available** - Data exists in current database/system
- ⚠️ **Partial** - Data partially available, needs enhancement or calculation
- 🔧 **Planned** - Source identified, integration or column addition required
- ❌ **Missing** - No clear source, requires premium service or manual curation
