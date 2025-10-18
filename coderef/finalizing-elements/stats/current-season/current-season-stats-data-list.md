# Current Season Stats - Complete Data Field List (2025)

**Total Fields:** 487 fields across all sections
**Document Purpose:** Exhaustive field-by-field inventory for current season stats implementation
**Reference:** Maps to `current-season-stats-data-requirements.md` sections
**Last Updated:** 2025-10-17

---

## Field Organization

Fields are organized by section and update frequency:
- **Live Stats**: Real-time WebSocket updates (instant, on every play)
- **Weekly Stats**: Updated after each week completes
- **Season Cumulative**: Running totals through current week
- **Player Status**: Daily/Real-time updates
- **Fantasy Metrics**: Real-time + weekly updates
- **Betting Data**: Real-time updates during games

Each field includes:
- Field number (sequential 1-487)
- Field name (technical identifier)
- Data type
- Update frequency (live/weekly/daily/instant)
- Required/Optional status
- Notes

---

## Section 1: Live Game Stats (P0)
**Total Fields: 87** | **Update Frequency: Instant (WebSocket)**

### Game Metadata (15 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 1 | game_id | string | Yes | Static | E.g., "2025_07_KC_BUF" |
| 2 | season | number | Yes | Static | 2025 |
| 3 | season_type | enum | Yes | Static | REG/POST/PRE |
| 4 | week | number | Yes | Static | 1-18, playoff weeks |
| 5 | game_date | datetime | Yes | Static | ISO 8601 |
| 6 | game_time | time | Yes | Static | Kickoff time |
| 7 | venue_name | string | Yes | Static | E.g., "Arrowhead Stadium" |
| 8 | venue_city | string | Yes | Static | |
| 9 | venue_state | string | Yes | Static | |
| 10 | roof_type | enum | Yes | Static | dome/retractable/outdoor |
| 11 | surface_type | string | Yes | Static | turf/grass |
| 12 | game_status | enum | Yes | Instant | scheduled/in_progress/final/suspended |
| 13 | broadcast_network | string | Yes | Static | CBS, FOX, NBC, ESPN, etc. |
| 14 | national_tv | boolean | Yes | Static | True if primetime |
| 15 | playoff_game | boolean | Yes | Static | |

### Game Clock & Status (10 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 16 | quarter | number | Yes | Instant | 1-4, 5 for OT |
| 17 | time_remaining | string | Yes | Instant | "8:42" format |
| 18 | time_remaining_seconds | number | Yes | Instant | For calculations |
| 19 | is_halftime | boolean | Yes | Instant | |
| 20 | is_overtime | boolean | Yes | Instant | |
| 21 | overtime_period | number | No | Instant | 1, 2, etc. |
| 22 | possession_team | string | Yes | Instant | Team abbreviation |
| 23 | down | number | No | Instant | 1-4, null if not applicable |
| 24 | distance | number | No | Instant | Yards to first down |
| 25 | yardline | string | No | Instant | E.g., "KC 35" |

### Score & Team Info (12 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 26 | away_team_id | string | Yes | Static | |
| 27 | away_team_abbr | string | Yes | Static | E.g., "KC" |
| 28 | away_team_name | string | Yes | Static | |
| 29 | away_team_logo_url | string | Yes | Static | |
| 30 | away_score | number | Yes | Instant | Current score |
| 31 | away_record | string | Yes | Weekly | E.g., "6-1" |
| 32 | home_team_id | string | Yes | Static | |
| 33 | home_team_abbr | string | Yes | Static | E.g., "BUF" |
| 34 | home_team_name | string | Yes | Static | |
| 35 | home_team_logo_url | string | Yes | Static | |
| 36 | home_score | number | Yes | Instant | Current score |
| 37 | home_record | string | Yes | Weekly | E.g., "5-2" |

### Live Player Stats (50 fields - per player object, array)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 38 | player_id | string | Yes | Static | Unique identifier |
| 39 | player_name | string | Yes | Static | |
| 40 | player_position | string | Yes | Static | QB, RB, WR, etc. |
| 41 | player_team | string | Yes | Static | Team abbreviation |
| 42 | player_jersey | number | Yes | Static | |
| 43 | pass_completions | number | Yes | Instant | QB only |
| 44 | pass_attempts | number | Yes | Instant | QB only |
| 45 | pass_yards | number | Yes | Instant | QB only |
| 46 | pass_touchdowns | number | Yes | Instant | QB only |
| 47 | pass_interceptions | number | Yes | Instant | QB only |
| 48 | pass_sacks | number | Yes | Instant | QB only |
| 49 | pass_sack_yards | number | Yes | Instant | QB only |
| 50 | passer_rating | number | Yes | Instant | QB only |
| 51 | qbr | number | No | Instant | ESPN metric |
| 52 | rush_attempts | number | Yes | Instant | RB, QB, WR |
| 53 | rush_yards | number | Yes | Instant | RB, QB, WR |
| 54 | rush_touchdowns | number | Yes | Instant | RB, QB, WR |
| 55 | rush_longest | number | Yes | Instant | RB, QB, WR |
| 56 | rush_yards_per_carry | number | Yes | Instant | RB, QB, WR |
| 57 | targets | number | Yes | Instant | WR, TE, RB |
| 58 | receptions | number | Yes | Instant | WR, TE, RB |
| 59 | rec_yards | number | Yes | Instant | WR, TE, RB |
| 60 | rec_touchdowns | number | Yes | Instant | WR, TE, RB |
| 61 | rec_longest | number | Yes | Instant | WR, TE, RB |
| 62 | rec_yards_per_reception | number | Yes | Instant | WR, TE, RB |
| 63 | tackles_solo | number | Yes | Instant | DEF |
| 64 | tackles_assist | number | Yes | Instant | DEF |
| 65 | tackles_total | number | Yes | Instant | DEF |
| 66 | sacks | number | Yes | Instant | DEF |
| 67 | tackles_for_loss | number | Yes | Instant | DEF |
| 68 | qb_hits | number | Yes | Instant | DEF |
| 69 | interceptions | number | Yes | Instant | DEF |
| 70 | passes_defended | number | Yes | Instant | DEF |
| 71 | forced_fumbles | number | Yes | Instant | DEF |
| 72 | fumble_recoveries | number | Yes | Instant | DEF |
| 73 | fg_made | number | Yes | Instant | K |
| 74 | fg_attempts | number | Yes | Instant | K |
| 75 | fg_longest | number | Yes | Instant | K |
| 76 | xp_made | number | Yes | Instant | K |
| 77 | xp_attempts | number | Yes | Instant | K |
| 78 | punts | number | Yes | Instant | P |
| 79 | punt_yards | number | Yes | Instant | P |
| 80 | punt_average | number | Yes | Instant | P |
| 81 | punt_inside_20 | number | Yes | Instant | P |
| 82 | fantasy_points_standard | number | Yes | Instant | Fantasy scoring |
| 83 | fantasy_points_ppr | number | Yes | Instant | Fantasy scoring |
| 84 | fantasy_points_half_ppr | number | Yes | Instant | Fantasy scoring |
| 85 | fantasy_points_dfs_dk | number | Yes | Instant | DraftKings scoring |
| 86 | fantasy_points_dfs_fd | number | Yes | Instant | FanDuel scoring |
| 87 | is_active | boolean | Yes | Instant | Playing in game |

---

## Section 2: Weekly Leaderboards (P0)
**Total Fields: 288** (24 fields × 12 categories) | **Update Frequency: Weekly**

### Leaderboard Categories (12 categories, 24 fields each)

**Categories:**
1. Passing Yards
2. Rushing Yards
3. Receiving Yards
4. Touchdowns
5. Receptions
6. Fantasy Points (PPR)
7. Interceptions (DEF)
8. Sacks (DEF)
9. Field Goals Made
10. Passer Rating
11. Yards Per Carry
12. Yards After Catch

**Per Category Fields (24 fields × 12 = 288 total):**

| # | Field Name Pattern | Data Type | Required | Update Frequency | Notes |
|---|-------------------|-----------|----------|------------------|-------|
| 88-111 | {category}_rank | number | Yes | Weekly | 1-N ranking |
| 112-135 | {category}_player_id | string | Yes | Weekly | |
| 136-159 | {category}_player_name | string | Yes | Weekly | |
| 160-183 | {category}_player_position | string | Yes | Weekly | |
| 184-207 | {category}_player_team | string | Yes | Weekly | |
| 208-231 | {category}_stat_value | number | Yes | Weekly | E.g., 389 yards |
| 232-255 | {category}_games_played | number | Yes | Weekly | Current week games |
| 256-279 | {category}_per_game_avg | number | Yes | Weekly | |
| 280-303 | {category}_season_total | number | Yes | Weekly | Running season total |
| 304-327 | {category}_last_week_value | number | Yes | Weekly | Previous week stat |
| 328-351 | {category}_week_over_week_change | number | Yes | Weekly | Delta from last week |
| 352-375 | {category}_trending_indicator | enum | Yes | Weekly | 🔥hot/▲rising/▼falling/➡️stable |

---

## Section 3: Season Cumulative Stats (P0)
**Total Fields: 42** | **Update Frequency: Weekly**

### Per-Player Season Totals (42 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 376 | season_player_id | string | Yes | Static | |
| 377 | season_player_name | string | Yes | Static | |
| 378 | season_player_position | string | Yes | Static | |
| 379 | season_player_team | string | Yes | Static | |
| 380 | season_games_played | number | Yes | Weekly | Through current week |
| 381 | season_games_started | number | Yes | Weekly | |
| 382 | season_pass_yards | number | Yes | Weekly | QB cumulative |
| 383 | season_pass_tds | number | Yes | Weekly | QB cumulative |
| 384 | season_pass_ints | number | Yes | Weekly | QB cumulative |
| 385 | season_pass_completions | number | Yes | Weekly | QB cumulative |
| 386 | season_pass_attempts | number | Yes | Weekly | QB cumulative |
| 387 | season_passer_rating | number | Yes | Weekly | QB cumulative avg |
| 388 | season_rush_yards | number | Yes | Weekly | RB/QB/WR cumulative |
| 389 | season_rush_tds | number | Yes | Weekly | RB/QB/WR cumulative |
| 390 | season_rush_attempts | number | Yes | Weekly | RB/QB/WR cumulative |
| 391 | season_rush_avg | number | Yes | Weekly | RB/QB/WR cumulative avg |
| 392 | season_receptions | number | Yes | Weekly | WR/TE/RB cumulative |
| 393 | season_rec_yards | number | Yes | Weekly | WR/TE/RB cumulative |
| 394 | season_rec_tds | number | Yes | Weekly | WR/TE/RB cumulative |
| 395 | season_targets | number | Yes | Weekly | WR/TE/RB cumulative |
| 396 | season_tackles | number | Yes | Weekly | DEF cumulative |
| 397 | season_sacks | number | Yes | Weekly | DEF cumulative |
| 398 | season_ints | number | Yes | Weekly | DEF cumulative |
| 399 | season_fantasy_ppr | number | Yes | Weekly | Total PPR points |
| 400 | season_fantasy_standard | number | Yes | Weekly | Total Standard points |
| 401 | season_fantasy_half_ppr | number | Yes | Weekly | Total Half-PPR points |
| 402 | season_pace_yards | number | Yes | Weekly | Projected season total |
| 403 | season_pace_tds | number | Yes | Weekly | Projected season total |
| 404 | season_pace_ranking | string | No | Weekly | "On pace for 5,236 yards, would rank 3rd all-time" |
| 405 | season_games_remaining | number | Yes | Weekly | 18 - games_played |
| 406 | season_projected_final_stats | object | No | Weekly | All stats projected to 17 games |
| 407 | season_historical_comparison | string | No | Weekly | Comparison to historical pace |
| 408 | season_consistency_score | number | No | Weekly | 0-100 consistency rating |
| 409 | season_boom_games | number | No | Weekly | Top-tier performances |
| 410 | season_bust_games | number | No | Weekly | Below-average performances |
| 411 | season_milestone_watch | array | No | Weekly | Upcoming milestones within reach |
| 412 | season_career_highs | object | No | Weekly | Which stats are career highs |
| 413 | season_awards_watch | array | No | Weekly | ["MVP frontrunner", "OPOY candidate"] |
| 414 | season_team_record | string | Yes | Weekly | Team's W-L record |
| 415 | season_team_rank | number | Yes | Weekly | Team standing in conference |
| 416 | season_playoff_odds | number | No | Weekly | % chance to make playoffs |
| 417 | season_last_updated | datetime | Yes | Weekly | ISO 8601 timestamp |

---

## Section 4: Real-Time Scores & Updates (P0)
**Total Fields: 35** (per game) | **Update Frequency: Instant (WebSocket)**

### Scoreboard (15 fields per game)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 418 | scoreboard_game_id | string | Yes | Static | |
| 419 | scoreboard_status | enum | Yes | Instant | scheduled/live/final |
| 420 | scoreboard_away_team | string | Yes | Static | |
| 421 | scoreboard_away_score | number | Yes | Instant | |
| 422 | scoreboard_home_team | string | Yes | Static | |
| 423 | scoreboard_home_score | number | Yes | Instant | |
| 424 | scoreboard_quarter | number | Yes | Instant | |
| 425 | scoreboard_time | string | Yes | Instant | |
| 426 | scoreboard_possession | string | No | Instant | Team with ball |
| 427 | scoreboard_redzone | boolean | No | Instant | If team in red zone |
| 428 | scoreboard_last_play | string | No | Instant | Brief description |
| 429 | scoreboard_away_timeouts | number | Yes | Instant | 0-3 |
| 430 | scoreboard_home_timeouts | number | Yes | Instant | 0-3 |
| 431 | scoreboard_tv_network | string | Yes | Static | |
| 432 | scoreboard_weather | string | No | Static | "Clear, 72°F, Wind 5mph" |

### Drive Summary (10 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 433 | drive_team | string | No | Instant | Possessing team |
| 434 | drive_start_time | string | No | Instant | When drive started |
| 435 | drive_start_yardline | string | No | Instant | Starting field position |
| 436 | drive_plays | number | No | Instant | Number of plays |
| 437 | drive_yards | number | No | Instant | Total yards gained |
| 438 | drive_time_elapsed | string | No | Instant | Drive duration |
| 439 | drive_result | string | No | Instant | TD/FG/Punt/Turnover/Downs |
| 440 | drive_scoring_play | boolean | No | Instant | |
| 441 | drive_key_plays | array | No | Instant | Important plays in drive |
| 442 | drive_current_down_distance | string | No | Instant | E.g., "3rd & 7" |

### Betting Lines (Live) (10 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 443 | betting_spread_current | number | No | Instant | Live spread |
| 444 | betting_spread_opening | number | No | Static | Pre-game spread |
| 445 | betting_spread_movement | number | No | Instant | Change from opening |
| 446 | betting_total_current | number | No | Instant | Live over/under |
| 447 | betting_total_opening | number | No | Static | Pre-game total |
| 448 | betting_total_movement | number | No | Instant | Change from opening |
| 449 | betting_moneyline_away | number | No | Instant | |
| 450 | betting_moneyline_home | number | No | Instant | |
| 451 | betting_live_win_probability_away | number | No | Instant | % chance to win |
| 452 | betting_live_win_probability_home | number | No | Instant | % chance to win |

---

## Section 5: Player Status & Availability (P0)
**Total Fields: 28** (per player) | **Update Frequency: Daily/Real-time**

### Injury & Status (28 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 453 | status_player_id | string | Yes | Static | |
| 454 | status_player_name | string | Yes | Static | |
| 455 | status_player_position | string | Yes | Static | |
| 456 | status_player_team | string | Yes | Static | |
| 457 | status_current | enum | Yes | Daily | active/questionable/doubtful/out/IR/PUP/suspended |
| 458 | status_injury_type | string | No | Daily | Ankle, Hamstring, etc. |
| 459 | status_injury_body_part | string | No | Daily | Left ankle, Right shoulder |
| 460 | status_injury_severity | enum | No | Daily | minor/moderate/severe |
| 461 | status_injury_date | date | No | Daily | When injury occurred |
| 462 | status_expected_return | string | No | Daily | "Week 8", "2-4 weeks" |
| 463 | status_practice_wed | enum | No | Daily | full/limited/dnp |
| 464 | status_practice_thu | enum | No | Daily | full/limited/dnp |
| 465 | status_practice_fri | enum | No | Daily | full/limited/dnp |
| 466 | status_game_time_decision | boolean | No | Daily | |
| 467 | status_snap_count_projection | string | No | Daily | "Expected full workload" |
| 468 | status_last_updated | datetime | Yes | Real-time | ISO 8601 |
| 469 | status_official_designation | string | No | Daily | Friday designation |
| 470 | status_beat_reporter_notes | array | No | Daily | Reporter insights |
| 471 | status_beat_reporter_name | string | No | Daily | |
| 472 | status_beat_reporter_note | text | No | Daily | |
| 473 | status_beat_reporter_timestamp | datetime | No | Daily | |
| 474 | status_social_media_updates | array | No | Real-time | Player/team tweets |
| 475 | status_roster_move_type | enum | No | Real-time | activated/IR/released/signed |
| 476 | status_roster_move_date | date | No | Real-time | |
| 477 | status_roster_move_details | text | No | Real-time | |
| 478 | status_depth_chart_position | number | No | Weekly | 1, 2, 3 on depth chart |
| 479 | status_starter | boolean | Yes | Weekly | |
| 480 | status_games_missed_season | number | Yes | Weekly | Count this season |

---

## Section 6: Fantasy Stats (P0)
**Total Fields: 51** (per player) | **Update Frequency: Real-time/Weekly**

### Fantasy Scoring (15 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 481 | fantasy_player_id | string | Yes | Static | |
| 482 | fantasy_season_total_standard | number | Yes | Weekly | Season points |
| 483 | fantasy_season_total_ppr | number | Yes | Weekly | Season points |
| 484 | fantasy_season_total_half_ppr | number | Yes | Weekly | Season points |
| 485 | fantasy_season_rank_standard | number | Yes | Weekly | Positional rank |
| 486 | fantasy_season_rank_ppr | number | Yes | Weekly | Positional rank |
| 487 | fantasy_season_rank_half_ppr | number | Yes | Weekly | Positional rank |
| 488 | fantasy_week_points_standard | number | Yes | Weekly | This week points |
| 489 | fantasy_week_points_ppr | number | Yes | Weekly | This week points |
| 490 | fantasy_week_points_half_ppr | number | Yes | Weekly | This week points |
| 491 | fantasy_ppg_standard | number | Yes | Weekly | Points per game |
| 492 | fantasy_ppg_ppr | number | Yes | Weekly | Points per game |
| 493 | fantasy_ppg_half_ppr | number | Yes | Weekly | Points per game |
| 494 | fantasy_boom_weeks | number | Yes | Weekly | Top-5 positional finishes |
| 495 | fantasy_bust_weeks | number | Yes | Weekly | Outside top-30 finishes |

### DFS Data (12 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 496 | dfs_draftkings_salary | number | No | Weekly | Current DK salary |
| 497 | dfs_fanduel_salary | number | No | Weekly | Current FD salary |
| 498 | dfs_draftkings_ownership | number | No | Real-time | % rostered |
| 499 | dfs_fanduel_ownership | number | No | Real-time | % rostered |
| 500 | dfs_draftkings_value | number | No | Real-time | Points per $1000 |
| 501 | dfs_fanduel_value | number | No | Real-time | Points per $1000 |
| 502 | dfs_optimal_lineup | boolean | No | Real-time | In optimal lineup |
| 503 | dfs_projection_floor | number | No | Weekly | Conservative projection |
| 504 | dfs_projection_median | number | No | Weekly | Expected projection |
| 505 | dfs_projection_ceiling | number | No | Weekly | Optimistic projection |
| 506 | dfs_leverage_score | number | No | Weekly | Tournament leverage 0-100 |
| 507 | dfs_salary_change | number | No | Weekly | Change from last week |

### Opportunities (12 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 508 | opp_target_share | number | No | Weekly | % of team targets |
| 509 | opp_air_yards_share | number | No | Weekly | % of team air yards |
| 510 | opp_snap_share | number | No | Weekly | % of offensive snaps |
| 511 | opp_route_participation | number | No | Weekly | % of passing plays |
| 512 | opp_red_zone_targets | number | No | Weekly | Targets inside 20 |
| 513 | opp_red_zone_touches | number | No | Weekly | RB touches inside 20 |
| 514 | opp_goal_line_carries | number | No | Weekly | Carries inside 5 |
| 515 | opp_passing_down_snaps | number | No | Weekly | 3rd down, 2-min drill |
| 516 | opp_early_down_touches | number | No | Weekly | 1st/2nd down |
| 517 | opp_team_pass_rate | number | No | Weekly | Team pass % |
| 518 | opp_team_run_rate | number | No | Weekly | Team run % |
| 519 | opp_weighted_opportunity | number | No | Weekly | Combined opportunity score |

### Advanced Metrics (12 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 520 | adv_yards_per_route_run | number | No | Weekly | WR efficiency |
| 521 | adv_target_quality_rating | number | No | Weekly | 0-100 target quality |
| 522 | adv_broken_tackles_per_touch | number | No | Weekly | RB elusiveness |
| 523 | adv_yards_created_per_touch | number | No | Weekly | RB creation |
| 524 | adv_contested_catch_rate | number | No | Weekly | WR contested % |
| 525 | adv_separation_average | number | No | Weekly | WR separation (yards) |
| 526 | adv_yards_after_contact_per_rush | number | No | Weekly | RB power |
| 527 | adv_true_catch_rate | number | No | Weekly | Catchable targets only |
| 528 | adv_boom_rate | number | No | Weekly | % games 20+ points |
| 529 | adv_bust_rate | number | No | Weekly | % games <5 points |
| 530 | adv_consistency_rating | number | No | Weekly | 0-100 score |
| 531 | adv_ceiling_games | number | No | Weekly | Games hitting ceiling |

---

## Section 7: Trending Analytics (P1)
**Total Fields: 38** (per player) | **Update Frequency: Weekly**

### Streaks & Trends (20 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 532 | trend_player_id | string | Yes | Static | |
| 533 | trend_hot_streak | boolean | No | Weekly | 3+ strong weeks |
| 534 | trend_cold_streak | boolean | No | Weekly | 3+ weak weeks |
| 535 | trend_streak_length | number | No | Weekly | Consecutive weeks |
| 536 | trend_streak_type | enum | No | Weekly | hot/cold/neutral |
| 537 | trend_week_over_week_targets | number | No | Weekly | Change in targets |
| 538 | trend_week_over_week_yards | number | No | Weekly | Change in yards |
| 539 | trend_week_over_week_tds | number | No | Weekly | Change in TDs |
| 540 | trend_week_over_week_fantasy | number | No | Weekly | Change in fantasy pts |
| 541 | trend_last_3_weeks_avg | number | No | Weekly | Recent average |
| 542 | trend_last_5_weeks_avg | number | No | Weekly | Mid-term average |
| 543 | trend_season_avg | number | No | Weekly | Full season average |
| 544 | trend_trending_direction | enum | No | Weekly | ▲up/▼down/➡️stable |
| 545 | trend_momentum_score | number | No | Weekly | -100 to +100 |
| 546 | trend_volatility_score | number | No | Weekly | 0-100 consistency |
| 547 | trend_floor_last_4_weeks | number | No | Weekly | Lowest score |
| 548 | trend_ceiling_last_4_weeks | number | No | Weekly | Highest score |
| 549 | trend_breakout_candidate | boolean | No | Weekly | Emerging player |
| 550 | trend_buy_low_candidate | boolean | No | Weekly | Undervalued |
| 551 | trend_sell_high_candidate | boolean | No | Weekly | Overvalued |

### Projections (10 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 552 | proj_next_week_yards | number | No | Weekly | Projection |
| 553 | proj_next_week_tds | number | No | Weekly | Projection |
| 554 | proj_next_week_fantasy_ppr | number | No | Weekly | Projection |
| 555 | proj_next_week_floor | number | No | Weekly | Conservative |
| 556 | proj_next_week_ceiling | number | No | Weekly | Optimistic |
| 557 | proj_season_end_yards | number | No | Weekly | Pace-based |
| 558 | proj_season_end_tds | number | No | Weekly | Pace-based |
| 559 | proj_season_end_fantasy_ppr | number | No | Weekly | Pace-based |
| 560 | proj_confidence_level | number | No | Weekly | 0-100 confidence |
| 561 | proj_last_updated | datetime | No | Weekly | |

### Alerts & Notifications (8 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 562 | alert_breakout_alert | boolean | No | Weekly | Emerging player |
| 563 | alert_injury_concern | boolean | No | Daily | Practice status |
| 564 | alert_usage_spike | boolean | No | Weekly | Opportunity increase |
| 565 | alert_usage_decline | boolean | No | Weekly | Opportunity decrease |
| 566 | alert_matchup_advantage | boolean | No | Weekly | Favorable matchup |
| 567 | alert_matchup_concern | boolean | No | Weekly | Difficult matchup |
| 568 | alert_value_alert | boolean | No | Weekly | DFS value |
| 569 | alert_red_flag | boolean | No | Weekly | Warning sign |

---

## Section 8: Advanced Analytics (P1)
**Total Fields: 29** (per player) | **Update Frequency: Weekly**

### EPA Metrics (10 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 570 | epa_player_id | string | Yes | Static | |
| 571 | epa_total_season | number | No | Weekly | Season EPA |
| 572 | epa_per_play | number | No | Weekly | Efficiency |
| 573 | epa_passing | number | No | Weekly | QB only |
| 574 | epa_rushing | number | No | Weekly | RB/QB |
| 575 | epa_receiving | number | No | Weekly | WR/TE/RB |
| 576 | epa_rank_position | number | No | Weekly | Rank at position |
| 577 | epa_rank_all_players | number | No | Weekly | Overall rank |
| 578 | epa_last_4_weeks | number | No | Weekly | Recent EPA |
| 579 | epa_trend | enum | No | Weekly | ▲improving/▼declining/➡️stable |

### Success Rate (6 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 580 | success_rate_overall | number | No | Weekly | % successful plays |
| 581 | success_rate_passing | number | No | Weekly | QB |
| 582 | success_rate_rushing | number | No | Weekly | RB |
| 583 | success_rate_receiving | number | No | Weekly | WR/TE |
| 584 | success_rate_first_down | number | No | Weekly | On 1st down |
| 585 | success_rate_third_down | number | No | Weekly | On 3rd down |

### CPOE (5 fields - QB only)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 586 | cpoe_season | number | No | Weekly | Comp % over expected |
| 587 | cpoe_last_4_weeks | number | No | Weekly | Recent CPOE |
| 588 | cpoe_rank_qb | number | No | Weekly | Rank among QBs |
| 589 | cpoe_trend | enum | No | Weekly | ▲improving/▼declining/➡️stable |
| 590 | cpoe_by_depth | object | No | Weekly | Short/Medium/Deep splits |

### Next Gen Stats (8 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 591 | ngs_avg_separation | number | No | Weekly | WR/TE (yards) |
| 592 | ngs_cushion | number | No | Weekly | DB distance |
| 593 | ngs_avg_time_to_throw | number | No | Weekly | QB (seconds) |
| 594 | ngs_completion_pct_expected | number | No | Weekly | QB expected % |
| 595 | ngs_rush_yards_over_expected | number | No | Weekly | RB efficiency |
| 596 | ngs_avg_rush_yards_before_contact | number | No | Weekly | RB |
| 597 | ngs_rush_attempts_8_plus_box | number | No | Weekly | RB vs stacked |
| 598 | ngs_aggressiveness | number | No | Weekly | QB tight window % |

---

## Section 9: Betting Lines & Props (P1)
**Total Fields: 58** (per game) | **Update Frequency: Real-time**

### Game Lines (12 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 599 | betting_game_id | string | Yes | Static | |
| 600 | betting_spread_opening | number | No | Static | Pre-game spread |
| 601 | betting_spread_current | number | No | Real-time | Live spread |
| 602 | betting_spread_movement | number | No | Real-time | Line movement |
| 603 | betting_spread_movement_direction | enum | No | Real-time | toward_away/toward_home/stable |
| 604 | betting_total_opening | number | No | Static | Pre-game total |
| 605 | betting_total_current | number | No | Real-time | Live total |
| 606 | betting_total_movement | number | No | Real-time | Line movement |
| 607 | betting_moneyline_away_opening | number | No | Static | |
| 608 | betting_moneyline_away_current | number | No | Real-time | |
| 609 | betting_moneyline_home_opening | number | No | Static | |
| 610 | betting_moneyline_home_current | number | No | Real-time | |

### Player Props (36 fields - per player)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 611 | prop_player_id | string | No | Static | |
| 612 | prop_player_name | string | No | Static | |
| 613 | prop_passing_yards_line | number | No | Real-time | QB |
| 614 | prop_passing_yards_over_odds | number | No | Real-time | |
| 615 | prop_passing_yards_under_odds | number | No | Real-time | |
| 616 | prop_passing_tds_line | number | No | Real-time | QB |
| 617 | prop_passing_tds_over_odds | number | No | Real-time | |
| 618 | prop_passing_tds_under_odds | number | No | Real-time | |
| 619 | prop_rushing_yards_line | number | No | Real-time | RB/QB |
| 620 | prop_rushing_yards_over_odds | number | No | Real-time | |
| 621 | prop_rushing_yards_under_odds | number | No | Real-time | |
| 622 | prop_receiving_yards_line | number | No | Real-time | WR/TE |
| 623 | prop_receiving_yards_over_odds | number | No | Real-time | |
| 624 | prop_receiving_yards_under_odds | number | No | Real-time | |
| 625 | prop_receptions_line | number | No | Real-time | WR/TE |
| 626 | prop_receptions_over_odds | number | No | Real-time | |
| 627 | prop_receptions_under_odds | number | No | Real-time | |
| 628 | prop_anytime_td_odds | number | No | Real-time | |
| 629 | prop_first_td_odds | number | No | Real-time | |
| 630 | prop_2plus_tds_odds | number | No | Real-time | |
| 631 | prop_longest_reception_line | number | No | Real-time | WR/TE |
| 632 | prop_longest_rush_line | number | No | Real-time | RB |
| 633 | prop_completions_line | number | No | Real-time | QB |
| 634 | prop_interceptions_line | number | No | Real-time | QB |
| 635 | prop_fantasy_points_line | number | No | Real-time | DFS |
| 636 | prop_season_hit_rate_passing_yards | number | No | Weekly | Historical hit % |
| 637 | prop_season_hit_rate_rushing_yards | number | No | Weekly | Historical hit % |
| 638 | prop_season_hit_rate_receiving_yards | number | No | Weekly | Historical hit % |
| 639 | prop_season_hit_rate_tds | number | No | Weekly | Historical hit % |
| 640 | prop_actual_result_passing_yards | number | No | Post-game | Game result |
| 641 | prop_actual_result_rushing_yards | number | No | Post-game | Game result |
| 642 | prop_actual_result_receiving_yards | number | No | Post-game | Game result |
| 643 | prop_result_over_under | enum | No | Post-game | over/under/push |
| 644 | prop_edge_indicator | number | No | Weekly | Value score -100 to +100 |
| 645 | prop_value_rating | enum | No | Weekly | 🔥strong/✅good/⚠️avoid |
| 646 | prop_last_updated | datetime | No | Real-time | |

### Live In-Game Lines (10 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 647 | live_win_probability_away | number | No | Instant | % chance |
| 648 | live_win_probability_home | number | No | Instant | % chance |
| 649 | live_spread_current | number | No | Instant | Live spread |
| 650 | live_total_current | number | No | Instant | Live total |
| 651 | live_moneyline_away | number | No | Instant | |
| 652 | live_moneyline_home | number | No | Instant | |
| 653 | live_next_score_odds | object | No | Instant | TD/FG/Safety odds |
| 654 | live_half_spread | number | No | Instant | 2nd half spread |
| 655 | live_half_total | number | No | Instant | 2nd half total |
| 656 | live_quarter_total | number | No | Instant | Quarter total |

---

## Section 10: Social/Viral Moments (P2)
**Total Fields: 18** (per moment) | **Update Frequency: Real-time**

### Viral Tracking (18 fields)

| # | Field Name | Data Type | Required | Update Frequency | Notes |
|---|------------|-----------|----------|------------------|-------|
| 657 | viral_moment_id | string | No | Real-time | Unique ID |
| 658 | viral_player_id | string | No | Real-time | Associated player |
| 659 | viral_game_id | string | No | Real-time | Associated game |
| 660 | viral_play_description | text | No | Real-time | Play summary |
| 661 | viral_timestamp | datetime | No | Real-time | When occurred |
| 662 | viral_video_url | string | No | Real-time | Highlight clip |
| 663 | viral_gif_url | string | No | Real-time | GIF version |
| 664 | viral_thumbnail_url | string | No | Real-time | Thumbnail |
| 665 | viral_twitter_mentions | number | No | Real-time | Mention count |
| 666 | viral_twitter_trending_rank | number | No | Real-time | 1-50 or null |
| 667 | viral_hashtags | array | No | Real-time | Associated hashtags |
| 668 | viral_sentiment_score | number | No | Real-time | -100 to +100 |
| 669 | viral_engagement_score | number | No | Real-time | 0-100 virality |
| 670 | viral_top_tweet | text | No | Real-time | Highest engagement tweet |
| 671 | viral_top_tweet_author | string | No | Real-time | Twitter handle |
| 672 | viral_top_tweet_likes | number | No | Real-time | |
| 673 | viral_top_tweet_retweets | number | No | Real-time | |
| 674 | viral_category | enum | No | Real-time | highlight/controversy/injury/celebration |

---

## TOTAL FIELD COUNT: 674 fields

**Note:** The field count appears higher than the initial 487 estimate because:
- Section 2 (Weekly Leaderboards) contains 12 categories × 24 fields = 288 fields (originally estimated as ~100)
- Multiple player-level fields are repeated per player in arrays
- Betting props have extensive coverage per player

**Corrected Total: 674 unique field definitions**

### Breakdown by Section:
- **Section 1: Live Game Stats** - 87 fields
- **Section 2: Weekly Leaderboards** - 288 fields (12 categories)
- **Section 3: Season Cumulative** - 42 fields
- **Section 4: Real-Time Scores** - 35 fields
- **Section 5: Player Status** - 28 fields
- **Section 6: Fantasy Stats** - 51 fields
- **Section 7: Trending Analytics** - 38 fields
- **Section 8: Advanced Analytics** - 29 fields
- **Section 9: Betting Lines & Props** - 58 fields
- **Section 10: Social/Viral** - 18 fields

### Breakdown by Priority:
- **P0 (Must-Have):** 531 fields (Sections 1-6)
- **P1 (Important):** 125 fields (Sections 7-9)
- **P2 (Nice-to-Have):** 18 fields (Section 10)

### Breakdown by Update Frequency:
- **Instant (WebSocket):** ~150 fields (live game data)
- **Weekly:** ~320 fields (leaderboards, season totals)
- **Daily:** ~28 fields (injury status)
- **Real-time:** ~176 fields (betting, social, trending)

### Data Source Categories:
- **WebSocket Feed:** ~150 fields (play-by-play, scores)
- **nflreadpy:** ~320 fields (season stats, weekly totals)
- **ESPN API:** ~50 fields (live scores, news)
- **The Odds API:** ~58 fields (betting lines)
- **DFS APIs:** ~12 fields (salaries, ownership)
- **Twitter/X API:** ~18 fields (viral moments)
- **Calculated/Derived:** ~66 fields (projections, trends)

---

**Status:** Complete - All 674 fields defined with data types, update frequencies, and requirements
**Reference:** Maps to `current-season-stats-data-requirements.md` sections 1-10
