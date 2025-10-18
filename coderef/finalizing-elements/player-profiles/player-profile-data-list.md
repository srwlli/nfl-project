# Player Profile - Complete Data Field List

**Total Fields:** ~380 fields across all sections
**Document Purpose:** Exhaustive field-by-field inventory for implementation
**Reference:** Maps to `player-profile-data-requirements.md` sections

---

## Field Organization

Fields are organized by priority level and section:
- **P0** = Must-Have (core functionality)
- **P1** = Important (enhanced experience)
- **P2** = Nice-to-Have (premium features)

Each field includes:
- Field name
- Data type
- Required/Optional status
- Position dependency (QB/RB/WR/DEF/K/P specific)

---

## Section 1: Hero Header & Visual Identity (P0)
**Total Fields: 15**

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 1 | player_id | string | Yes | All | Unique identifier |
| 2 | player_name | string | Yes | All | Full display name |
| 3 | first_name | string | Yes | All | |
| 4 | last_name | string | Yes | All | |
| 5 | nickname | string | No | All | E.g., "The Gunslinger" |
| 6 | jersey_number | number | Yes | All | |
| 7 | position | string | Yes | All | QB, RB, WR, TE, etc. |
| 8 | current_team_id | string | Yes | All | |
| 9 | current_team_name | string | Yes | All | |
| 10 | current_team_abbreviation | string | Yes | All | |
| 11 | current_team_logo_url | string | No | All | |
| 12 | player_status | enum | Yes | All | active/retired/IR/etc |
| 13 | headshot_url | string | No | All | Professional photo |
| 14 | action_photo_url | string | No | All | Optional action shot |
| 15 | hall_of_fame_inducted | boolean | Yes | All | |

---

## Section 2: Quick Stats Bar (P0)
**Total Fields: 20**

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 16 | height_inches | number | Yes | All | |
| 17 | height_display | string | Yes | All | E.g., "6-4" |
| 18 | weight_lbs | number | Yes | All | |
| 19 | age | number | Yes | All | Calculated from birth_date |
| 20 | birth_date | date | Yes | All | ISO 8601 |
| 21 | birthplace_city | string | No | All | |
| 22 | birthplace_state | string | No | All | |
| 23 | birthplace_country | string | No | All | Default "USA" |
| 24 | college_name | string | No | All | |
| 25 | college_years | string | No | All | E.g., "1985-1988" |
| 26 | college_position | string | No | All | |
| 27 | draft_year | number | No | All | |
| 28 | draft_round | number | No | All | |
| 29 | draft_pick | number | No | All | Pick within round |
| 30 | draft_overall_pick | number | No | All | Overall pick number |
| 31 | drafted_by_team_id | string | No | All | |
| 32 | drafted_by_team_name | string | No | All | |
| 33 | drafted_by_team_abbr | string | No | All | |
| 34 | years_pro | number | Yes | All | Seasons in NFL |
| 35 | experience_display | string | Yes | All | E.g., "12 seasons" |

---

## Section 3: Biographical Information (P0)
**Total Fields: 55**

### Personal Info (10 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 36 | full_legal_name | string | No | All | |
| 37 | hometown_city | string | No | All | |
| 38 | hometown_state | string | No | All | |
| 39 | nationality | string | No | All | |
| 40 | throws | enum | No | QB/WR/RB | left/right |
| 41 | bats | enum | No | All | left/right (if applicable) |
| 42 | arm_length | string | No | QB/WR/TE | E.g., "33 inches" |
| 43 | hand_size | string | No | QB | E.g., "10.25 inches" |
| 44 | marital_status | string | No | All | Optional personal |
| 45 | children | number | No | All | Optional personal |

### High School (10 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 46 | hs_name | string | No | All | |
| 47 | hs_city | string | No | All | |
| 48 | hs_state | string | No | All | |
| 49 | hs_years | string | No | All | E.g., "1982-1984" |
| 50 | hs_position | string | No | All | |
| 51 | hs_national_rank | number | No | All | E.g., 1 for #1 QB |
| 52 | hs_star_rating | number | No | All | 1-5 stars |
| 53 | hs_recruiting_service | string | No | All | 247Sports, Rivals |
| 54 | hs_grade | number | No | All | Recruiting grade |
| 55 | hs_scout_report | text | No | All | Brief evaluation |

### College (15 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 56 | college_years_display | string | No | All | E.g., "1985-1988" |
| 57 | college_coach | string | No | All | Head coach name |
| 58 | college_career_pass_yards | number | No | QB | |
| 59 | college_career_pass_tds | number | No | QB | |
| 60 | college_career_ints | number | No | QB | |
| 61 | college_career_comp_pct | number | No | QB | |
| 62 | college_career_rush_yards | number | No | RB/QB | |
| 63 | college_career_rush_tds | number | No | RB/QB | |
| 64 | college_career_rec_yards | number | No | WR/TE | |
| 65 | college_career_receptions | number | No | WR/TE | |
| 66 | college_career_rec_tds | number | No | WR/TE | |
| 67 | college_honors | array | No | All | ["All-American 1988"] |
| 68 | college_all_american | boolean | No | All | |
| 69 | college_bowl_games | number | No | All | |
| 70 | college_championships | number | No | All | |

### Draft/Combine (20 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 71 | combine_height | string | No | All | Exact measurement |
| 72 | combine_weight | number | No | All | |
| 73 | combine_40_yard | number | No | All | Seconds |
| 74 | combine_bench_press | number | No | All | Reps at 225lbs |
| 75 | combine_vertical_jump | number | No | All | Inches |
| 76 | combine_broad_jump | string | No | All | E.g., "10'4\"" |
| 77 | combine_three_cone | number | No | All | Seconds |
| 78 | combine_twenty_shuttle | number | No | All | Seconds |
| 79 | combine_sixty_shuttle | number | No | All | Seconds |
| 80 | combine_arm_length | string | No | All | |
| 81 | combine_hand_size | string | No | QB | |
| 82 | draft_grade | string | No | All | A+, A, B, etc. |
| 83 | draft_projection | string | No | All | Round projection |
| 84 | draft_scout_report | text | No | All | Scouting summary |
| 85 | draft_strengths | array | No | All | ["Arm strength", ...] |
| 86 | draft_weaknesses | array | No | All | ["Decision making", ...] |
| 87 | draft_comparison | string | No | All | Pro comparison |
| 88 | draft_class_rank | number | No | All | Rank in draft class |
| 89 | draft_position_rank | number | No | All | Rank at position |
| 90 | undrafted_free_agent | boolean | Yes | All | True if UDFA |

---

## Section 4: Career Statistics - Passing (P0)
**Total Fields: 20** (QB only)

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 91 | career_games_played | number | Yes | QB | |
| 92 | career_games_started | number | Yes | QB | |
| 93 | career_pass_attempts | number | Yes | QB | |
| 94 | career_pass_completions | number | Yes | QB | |
| 95 | career_pass_comp_pct | number | Yes | QB | |
| 96 | career_pass_yards | number | Yes | QB | |
| 97 | career_pass_ypa | number | Yes | QB | Yards per attempt |
| 98 | career_pass_tds | number | Yes | QB | |
| 99 | career_pass_ints | number | Yes | QB | |
| 100 | career_pass_td_int_ratio | number | Yes | QB | |
| 101 | career_passer_rating | number | Yes | QB | |
| 102 | career_qbr | number | No | QB | ESPN metric |
| 103 | career_sacks_taken | number | Yes | QB | |
| 104 | career_sack_yards | number | Yes | QB | |
| 105 | career_longest_pass | number | Yes | QB | |
| 106 | career_pass_ypg | number | Yes | QB | Yards per game |
| 107 | career_300_yard_games | number | Yes | QB | |
| 108 | career_400_yard_games | number | Yes | QB | |
| 109 | career_fourth_qtr_comebacks | number | No | QB | |
| 110 | career_game_winning_drives | number | No | QB | |

---

## Section 5: Career Statistics - Rushing (P0)
**Total Fields: 15** (RB, QB, WR)

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 111 | career_rush_attempts | number | Yes | RB/QB/WR | |
| 112 | career_rush_yards | number | Yes | RB/QB/WR | |
| 113 | career_rush_avg | number | Yes | RB/QB/WR | YPC |
| 114 | career_rush_tds | number | Yes | RB/QB/WR | |
| 115 | career_rush_longest | number | Yes | RB/QB/WR | |
| 116 | career_rush_fumbles | number | Yes | RB/QB/WR | |
| 117 | career_rush_fumbles_lost | number | Yes | RB/QB/WR | |
| 118 | career_rush_first_downs | number | No | RB/QB/WR | |
| 119 | career_rush_ypg | number | Yes | RB/QB/WR | Yards per game |
| 120 | career_100_yard_rush_games | number | Yes | RB | |
| 121 | career_200_yard_rush_games | number | Yes | RB | Rare milestone |
| 122 | career_rush_20plus | number | No | RB | Runs 20+ yards |
| 123 | career_rush_broken_tackles | number | No | RB | NGS stat |
| 124 | career_rush_yac | number | No | RB | Yards after contact |
| 125 | career_rush_stuffed_pct | number | No | RB | % runs for 0/negative |

---

## Section 6: Career Statistics - Receiving (P0)
**Total Fields: 18** (WR, TE, RB)

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 126 | career_receptions | number | Yes | WR/TE/RB | |
| 127 | career_targets | number | Yes | WR/TE/RB | |
| 128 | career_catch_rate | number | Yes | WR/TE/RB | |
| 129 | career_rec_yards | number | Yes | WR/TE/RB | |
| 130 | career_rec_ypr | number | Yes | WR/TE/RB | Yards per rec |
| 131 | career_rec_tds | number | Yes | WR/TE/RB | |
| 132 | career_rec_longest | number | Yes | WR/TE/RB | |
| 133 | career_rec_first_downs | number | No | WR/TE/RB | |
| 134 | career_rec_ypg | number | Yes | WR/TE/RB | Yards per game |
| 135 | career_100_yard_rec_games | number | Yes | WR/TE | |
| 136 | career_200_yard_rec_games | number | Yes | WR/TE | Rare |
| 137 | career_rec_yac | number | No | WR/TE/RB | Yards after catch |
| 138 | career_rec_yac_per_rec | number | No | WR/TE/RB | |
| 139 | career_rec_drops | number | No | WR/TE | |
| 140 | career_rec_drop_pct | number | No | WR/TE | |
| 141 | career_contested_catches | number | No | WR/TE | |
| 142 | career_contested_catch_pct | number | No | WR/TE | |
| 143 | career_rec_avg_separation | number | No | WR/TE | NGS stat (yards) |

---

## Section 7: Career Statistics - Defense (P0)
**Total Fields: 18** (DEF positions)

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 144 | career_tackles_solo | number | Yes | DEF | |
| 145 | career_tackles_assist | number | Yes | DEF | |
| 146 | career_tackles_total | number | Yes | DEF | |
| 147 | career_sacks | number | Yes | DEF | |
| 148 | career_tackles_for_loss | number | Yes | DEF | |
| 149 | career_qb_hits | number | Yes | DEF | |
| 150 | career_def_ints | number | Yes | DEF | |
| 151 | career_def_int_yards | number | Yes | DEF | |
| 152 | career_def_int_tds | number | Yes | DEF | |
| 153 | career_passes_defended | number | Yes | DEF | |
| 154 | career_forced_fumbles | number | Yes | DEF | |
| 155 | career_fumble_recoveries | number | Yes | DEF | |
| 156 | career_fumble_rec_tds | number | Yes | DEF | |
| 157 | career_safeties | number | Yes | DEF | |
| 158 | career_def_tds | number | Yes | DEF | Total def TDs |
| 159 | career_stuffs | number | No | DEF | Tackles at/behind LOS |
| 160 | career_hurries | number | No | DEF | QB pressures |
| 161 | career_def_snaps | number | No | DEF | Total snaps played |

---

## Section 8: Career Statistics - Special Teams (P0)
**Total Fields: 25** (K, P, Returners)

### Kicking (10 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 162 | career_fg_made | number | Yes | K | |
| 163 | career_fg_attempts | number | Yes | K | |
| 164 | career_fg_pct | number | Yes | K | |
| 165 | career_fg_longest | number | Yes | K | |
| 166 | career_fg_0_19 | string | No | K | "5/5" format |
| 167 | career_fg_20_29 | string | No | K | |
| 168 | career_fg_30_39 | string | No | K | |
| 169 | career_fg_40_49 | string | No | K | |
| 170 | career_fg_50plus | string | No | K | |
| 171 | career_xp_made | number | Yes | K | |

### Punting (8 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 172 | career_punts | number | Yes | P | |
| 173 | career_punt_yards | number | Yes | P | |
| 174 | career_punt_avg | number | Yes | P | |
| 175 | career_punt_longest | number | Yes | P | |
| 176 | career_punt_inside_20 | number | Yes | P | |
| 177 | career_punt_inside_10 | number | No | P | |
| 178 | career_punt_touchbacks | number | Yes | P | |
| 179 | career_punt_fair_catches | number | No | P | |

### Returns (7 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 180 | career_kr_returns | number | No | All | Kick returns |
| 181 | career_kr_yards | number | No | All | |
| 182 | career_kr_avg | number | No | All | |
| 183 | career_kr_tds | number | No | All | |
| 184 | career_pr_returns | number | No | All | Punt returns |
| 185 | career_pr_yards | number | No | All | |
| 186 | career_pr_tds | number | No | All | |

---

## Section 9: Playoff Statistics (P0)
**Total Fields: 15** (Position-dependent)

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 187 | career_playoff_games | number | Yes | All | |
| 188 | career_playoff_wins | number | Yes | All | |
| 189 | career_playoff_losses | number | Yes | All | |
| 190 | career_playoff_record | string | Yes | All | E.g., "16-4" |
| 191 | career_playoff_pass_yards | number | No | QB | |
| 192 | career_playoff_pass_tds | number | No | QB | |
| 193 | career_playoff_pass_ints | number | No | QB | |
| 194 | career_playoff_passer_rating | number | No | QB | |
| 195 | career_playoff_rush_yards | number | No | RB/QB | |
| 196 | career_playoff_rush_tds | number | No | RB/QB | |
| 197 | career_playoff_rec_yards | number | No | WR/TE | |
| 198 | career_playoff_rec_tds | number | No | WR/TE | |
| 199 | career_playoff_sacks | number | No | DEF | |
| 200 | career_playoff_ints | number | No | DEF | |
| 201 | career_playoff_mvp | number | No | All | Count of SB MVPs |

---

## Section 10: Season-by-Season Data (P0)
**Total Fields: 30+ per season** (Array of season objects)

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 202 | season_year | number | Yes | All | |
| 203 | season_type | enum | Yes | All | REG/POST/PRE |
| 204 | season_team_id | string | Yes | All | |
| 205 | season_team_name | string | Yes | All | |
| 206 | season_team_abbr | string | Yes | All | |
| 207 | season_games_played | number | Yes | All | |
| 208 | season_games_started | number | Yes | All | |
| 209 | season_team_record | string | Yes | All | E.g., "11-5" |
| 210 | season_playoff_appearance | boolean | Yes | All | |
| 211 | season_playoff_result | string | No | All | E.g., "Lost Conf Champ" |
| 212-240 | season_*_stats | number | Yes | Position | All position stats |
| 241 | season_awards | array | No | All | ["Pro Bowl", "All-Pro"] |
| 242 | season_notes | string | No | All | Injuries, milestones |

---

## Section 11: Awards & Achievements (P0)
**Total Fields: 40**

### Championships (8 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 243 | super_bowl_wins | number | Yes | All | Count |
| 244 | super_bowl_appearances | number | Yes | All | Count |
| 245 | super_bowl_mvps | number | Yes | All | Count |
| 246 | conference_championships | number | Yes | All | |
| 247 | division_titles | number | Yes | All | |
| 248 | championship_details | array | Yes | All | Full championship data |
| 249 | playoff_appearances | number | Yes | All | |
| 250 | playoff_wins | number | Yes | All | |

### Pro Bowl & All-Pro (8 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 251 | pro_bowl_selections | number | Yes | All | Count |
| 252 | pro_bowl_years | array | Yes | All | [2015, 2016, ...] |
| 253 | pro_bowl_starts | number | No | All | |
| 254 | pro_bowl_mvps | number | No | All | |
| 255 | all_pro_first_team | number | Yes | All | Count |
| 256 | all_pro_second_team | number | Yes | All | Count |
| 257 | all_pro_total | number | Yes | All | Total selections |
| 258 | all_pro_years | array | Yes | All | With team designation |

### MVP & Awards (8 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 259 | mvp_awards | number | Yes | All | NFL MVP count |
| 260 | mvp_years | array | No | All | Years won MVP |
| 261 | mvp_vote_total | number | No | All | Total votes received |
| 262 | mvp_top_5_finishes | number | No | All | |
| 263 | offensive_player_year | number | No | All | OPOY count |
| 264 | defensive_player_year | number | No | DEF | DPOY count |
| 265 | rookie_of_year | boolean | No | All | |
| 266 | comeback_player_year | boolean | No | All | |

### Hall of Fame (6 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 267 | hof_inducted | boolean | Yes | All | |
| 268 | hof_year | number | No | All | Year inducted |
| 269 | hof_vote_pct | number | No | All | E.g., 84.6 |
| 270 | hof_class | string | No | All | E.g., "Class of 2016" |
| 271 | hof_first_ballot | boolean | No | All | |
| 272 | hof_years_eligible | number | No | All | Years on ballot |

### Records & Milestones (10 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 273 | retired_numbers | array | No | All | Teams that retired # |
| 274 | retired_number_years | array | No | All | Years retired |
| 275 | records_held | array | No | All | All records data |
| 276 | team_records | number | No | All | Count |
| 277 | league_records | number | No | All | Count |
| 278 | single_game_records | number | No | All | Count |
| 279 | single_season_records | number | No | All | Count |
| 280 | career_records | number | No | All | Count |
| 281 | milestones_achieved | array | No | All | All milestone data |
| 282 | milestone_count | number | No | All | Total milestones |

---

## Section 12: Advanced Analytics (P1)
**Total Fields: 30**

### EPA Metrics (8 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 283 | career_total_epa | number | No | All | |
| 284 | career_epa_per_play | number | No | All | |
| 285 | career_passing_epa | number | No | QB | |
| 286 | career_rushing_epa | number | No | RB/QB | |
| 287 | career_receiving_epa | number | No | WR/TE | |
| 288 | career_epa_rank_all_time | number | No | All | |
| 289 | career_epa_rank_position | number | No | All | |
| 290 | season_best_epa | number | No | All | Best season EPA |

### CPOE & Success Rate (6 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 291 | career_cpoe | number | No | QB | Comp % over expected |
| 292 | career_cpoe_rank | number | No | QB | |
| 293 | career_success_rate_overall | number | No | All | |
| 294 | career_success_rate_passing | number | No | QB | |
| 295 | career_success_rate_rushing | number | No | RB/QB | |
| 296 | career_success_rate_receiving | number | No | WR/TE | |

### Pressure & Decision Making (8 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 297 | career_pressure_rate | number | No | QB | % under pressure |
| 298 | career_sack_rate_pressure | number | No | QB | |
| 299 | career_comp_pct_pressure | number | No | QB | |
| 300 | career_turnover_worthy_pct | number | No | QB | |
| 301 | career_big_time_throw_pct | number | No | QB | |
| 302 | career_avg_time_to_throw | number | No | QB | Seconds |
| 303 | career_avg_depth_of_target | number | No | QB | aDOT |
| 304 | career_air_yards_share | number | No | WR/TE | % of team air yards |

### Next Gen Stats (8 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 305 | career_avg_separation | number | No | WR/TE | Yards |
| 306 | career_catch_pct_expected | number | No | WR/TE | |
| 307 | career_comp_pct_expected | number | No | QB | |
| 308 | career_comp_pct_above_exp | number | No | QB | CPOE |
| 309 | career_avg_cushion | number | No | WR/TE | DB distance |
| 310 | career_route_efficiency | number | No | WR/TE | |
| 311 | career_avg_rush_yards_before | number | No | RB | Before contact |
| 312 | career_rush_attempts_8_box | number | No | RB | vs stacked box |

---

## Section 13: Game Logs (P1)
**Total Fields: 25 per game** (Array of game objects)

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 313 | game_id | string | Yes | All | |
| 314 | game_season | number | Yes | All | |
| 315 | game_week | number | Yes | All | |
| 316 | game_date | date | Yes | All | |
| 317 | game_opponent_id | string | Yes | All | |
| 318 | game_opponent_name | string | Yes | All | |
| 319 | game_home_away | enum | Yes | All | home/away |
| 320 | game_result | enum | Yes | All | W/L/T |
| 321 | game_score | string | Yes | All | E.g., "31-33" |
| 322 | game_started | boolean | Yes | All | |
| 323-345 | game_*_stats | number | Yes | Position | All position stats |
| 346 | game_notes | string | No | All | Milestone, playoff, etc. |
| 347 | game_weather | string | No | All | |
| 348 | game_temperature | number | No | All | |

---

## Section 14: Statistical Splits (P1)
**Total Fields: 60+** (Multiple stat sets)

### Home vs Away (30 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 349-363 | home_*_stats | number | No | Position | All stats at home |
| 364-378 | away_*_stats | number | No | Position | All stats away |

### By Opponent (Dynamic - per team)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 379 | vs_opponent_games | number | No | All | Per opponent |
| 380 | vs_opponent_record | string | No | All | Per opponent |
| 381-395 | vs_opponent_*_stats | number | No | Position | Stats vs opponent |

### Situational (40+ fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 396-410 | when_leading_*_stats | number | No | Position | |
| 411-425 | when_trailing_*_stats | number | No | Position | |
| 426-440 | fourth_quarter_*_stats | number | No | Position | |
| 441-455 | overtime_*_stats | number | No | Position | |

---

## Section 15: Timeline & Transactions (P0)
**Total Fields: 20** (Array objects)

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 456 | timeline_date | date | Yes | All | Event date |
| 457 | timeline_event_type | enum | Yes | All | draft/trade/FA/etc |
| 458 | timeline_team | string | Yes | All | |
| 459 | timeline_description | text | Yes | All | |
| 460 | transaction_contract_years | number | No | All | |
| 461 | transaction_contract_value | number | No | All | |
| 462 | transaction_traded_for | string | No | All | |
| 463 | injury_type | string | No | All | |
| 464 | injury_body_part | string | No | All | |
| 465 | injury_severity | enum | No | All | |
| 466 | injury_games_missed | number | No | All | |
| 467 | injury_recovery_time | string | No | All | |

---

## Section 16: Comparisons & Rankings (P1)
**Total Fields: 30**

### Era Rankings (12 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 468 | era_definition | string | No | All | E.g., "1990s QBs" |
| 469 | era_rank | number | No | All | Rank within era |
| 470 | era_peers | array | No | All | Peer player data |
| 471-478 | era_stat_ranks | number | No | Position | Ranks for key stats |

### All-Time Rankings (10 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 479 | alltime_pass_yards_rank | number | No | QB | |
| 480 | alltime_pass_tds_rank | number | No | QB | |
| 481 | alltime_rush_yards_rank | number | No | RB | |
| 482 | alltime_rush_tds_rank | number | No | RB | |
| 483 | alltime_rec_yards_rank | number | No | WR/TE | |
| 484 | alltime_receptions_rank | number | No | WR/TE | |
| 485 | alltime_sacks_rank | number | No | DEF | |
| 486 | alltime_ints_rank | number | No | DEF | |
| 487 | alltime_tackles_rank | number | No | DEF | |
| 488 | alltime_passer_rating_rank | number | No | QB | |

### Similar Players (8 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 489 | similar_players | array | No | All | Player objects |
| 490 | similar_player_id | string | No | All | Per similar player |
| 491 | similar_player_name | string | No | All | |
| 492 | similarity_score | number | No | All | 0-100 |
| 493 | similarity_reasons | array | No | All | Why similar |
| 494 | teammates | array | No | All | Teammate data |
| 495 | contemporaries | array | No | All | Same-era players |
| 496 | successors | array | No | All | Players who replaced |

---

## Section 17: Social & Contact (P1)
**Total Fields: 12**

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 497 | twitter_handle | string | No | All | |
| 498 | twitter_followers | number | No | All | |
| 499 | instagram_handle | string | No | All | |
| 500 | instagram_followers | number | No | All | |
| 501 | facebook_page | string | No | All | |
| 502 | tiktok_handle | string | No | All | |
| 503 | youtube_channel | string | No | All | |
| 504 | agent_name | string | No | All | |
| 505 | agent_agency | string | No | All | |
| 506 | official_website | string | No | All | |
| 507 | broadcast_network | string | No | All | If broadcaster |
| 508 | broadcast_role | string | No | All | Analyst, etc. |

---

## Section 18: Media Gallery (P2)
**Total Fields: 14** (Array objects)

### Photos (7 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 509 | photo_id | string | No | All | |
| 510 | photo_url | string | No | All | |
| 511 | photo_thumbnail | string | No | All | |
| 512 | photo_caption | string | No | All | |
| 513 | photo_date | date | No | All | |
| 514 | photo_category | enum | No | All | game/headshot/awards |
| 515 | photo_game_id | string | No | All | If game photo |

### Videos (7 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 516 | video_id | string | No | All | |
| 517 | video_title | string | No | All | |
| 518 | video_description | text | No | All | |
| 519 | video_thumbnail | string | No | All | |
| 520 | video_url | string | No | All | |
| 521 | video_duration | number | No | All | Seconds |
| 522 | video_category | enum | No | All | highlight/interview |

---

## Section 19: Fantasy Football (P2)
**Total Fields: 15** (Optional)

| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 523 | career_fantasy_ppr | number | No | All | |
| 524 | career_fantasy_half_ppr | number | No | All | |
| 525 | career_fantasy_standard | number | No | All | |
| 526 | season_fantasy_ppr | number | No | All | Per season |
| 527 | season_fantasy_half_ppr | number | No | All | Per season |
| 528 | season_fantasy_standard | number | No | All | Per season |
| 529 | season_fantasy_rank_pos | number | No | All | |
| 530 | fantasy_games_20plus | number | No | All | PPR |
| 531 | fantasy_games_10plus | number | No | All | PPR |
| 532 | fantasy_boom_weeks | number | No | All | Top 5 at position |
| 533 | fantasy_bust_weeks | number | No | All | Outside top 30 |
| 534 | fantasy_consistency_score | number | No | All | 0-100 |
| 535 | fantasy_adp | number | No | All | Avg draft position |
| 536 | fantasy_best_season_rank | number | No | All | |
| 537 | fantasy_best_game_points | number | No | All | |

---

## Section 20: Contextual Performance (P2)
**Total Fields: 30+**

### Weather Performance (15 fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 538-545 | indoor_*_stats | number | No | Position | Dome stats |
| 546-553 | outdoor_*_stats | number | No | Position | Outdoor stats |
| 554-561 | cold_weather_*_stats | number | No | Position | <40°F |
| 562 | rain_games | number | No | All | |
| 563 | snow_games | number | No | All | |

### Primetime & Context (15+ fields)
| # | Field Name | Data Type | Required | Position Specific | Notes |
|---|------------|-----------|----------|-------------------|-------|
| 564-571 | primetime_*_stats | number | No | Position | SNF/MNF/TNF |
| 572 | vs_winning_teams_record | string | No | All | |
| 573-580 | vs_winning_teams_*_stats | number | No | Position | |
| 581 | division_games_record | string | No | All | |
| 582-589 | division_games_*_stats | number | No | Position | |

---

## TOTAL FIELD COUNT: ~590 fields

### Breakdown by Priority:
- **P0 (Must-Have):** ~320 fields
- **P1 (Important):** ~200 fields
- **P2 (Nice-to-Have):** ~70 fields

### Breakdown by Position:
- **Universal (All Positions):** ~200 fields
- **QB-Specific:** ~120 fields
- **RB-Specific:** ~80 fields
- **WR/TE-Specific:** ~90 fields
- **DEF-Specific:** ~70 fields
- **K/P-Specific:** ~30 fields

### Data Source Categories:
- **Direct from Database:** ~250 fields (players, rosters, player_stats)
- **Calculated/Aggregated:** ~150 fields (career totals, percentages)
- **External API Required:** ~100 fields (photos, videos, NGS)
- **Manual/Static:** ~40 fields (HOF, awards, social media)
- **Advanced Analytics:** ~50 fields (EPA, CPOE, NGS)

---

**Note:** Many fields are position-dependent and will only populate for relevant positions. The actual field count per player will vary based on their position and career stage (active vs retired).
