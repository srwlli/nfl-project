# Team Page - Complete Data Field List

**Total Fields:** 284 fields
**Document Purpose:** Exhaustive field-by-field inventory for implementation
**Reference:** Maps to `team-page-data-requirements.md` sections
**Last Updated:** 2025-10-17

---

## Field Organization

Fields are organized by priority level and section:
- **P0** = Must-Have (core functionality) - 189 fields
- **P1** = Important (enhanced experience) - 44 fields
- **P2** = Nice-to-Have (premium features) - 51 fields

Each field includes:
- Field number (sequential)
- Field name (technical identifier)
- Data type
- Required/Optional status
- Section reference
- Notes

---

## PRIORITY P0: MUST-HAVE FIELDS (189 fields)

### Section 1: Team Identity & Header (25 fields)

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 1 | team_id | string | Yes | Unique identifier (e.g., 'DAL', 'KC') |
| 2 | team_name | string | Yes | Full team name (e.g., 'Dallas Cowboys') |
| 3 | team_city | string | Yes | City name |
| 4 | team_state | string | Yes | State abbreviation |
| 5 | abbreviation | string | Yes | 3-letter code (e.g., 'DAL') |
| 6 | nickname | string | Yes | Team nickname (e.g., 'Cowboys') |
| 7 | conference | string | Yes | 'NFC' or 'AFC' |
| 8 | division | string | Yes | 'East', 'West', 'North', 'South' |
| 9 | founded_year | number | Yes | Year franchise founded |
| 10 | primary_color | string | Yes | Hex color code |
| 11 | secondary_color | string | Yes | Hex color code |
| 12 | accent_color | string | Optional | Hex color code |
| 13 | primary_logo_url | string | Yes | Primary logo image URL |
| 14 | alternate_logo_url | string | Optional | Alternate logo URL |
| 15 | helmet_logo_url | string | Optional | Helmet image URL |
| 16 | wordmark_url | string | Optional | Team wordmark URL |
| 17 | stadium_id | string | Yes | Links to stadium integration |
| 18 | stadium_name | string | Yes | Stadium official name |
| 19 | stadium_city | string | Yes | Stadium location city |
| 20 | stadium_state | string | Yes | Stadium location state |
| 21 | stadium_capacity | number | Yes | Total seating capacity |
| 22 | stadium_surface | string | Yes | 'grass', 'turf', or 'hybrid' |
| 23 | stadium_roof | string | Yes | 'outdoor', 'dome', 'retractable' |
| 24 | stadium_year_opened | number | Yes | Year stadium opened |
| 25 | franchise_age | number | Calculated | Current year - founded_year |

---

### Section 2: Current Season Overview (30 fields)

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 26 | season | number | Yes | Current season year |
| 27 | current_week | number | Yes | Current NFL week (1-18) |
| 28 | wins | number | Yes | Total wins |
| 29 | losses | number | Yes | Total losses |
| 30 | ties | number | Yes | Total ties |
| 31 | win_percentage | number | Yes | W / (W+L+T) |
| 32 | division_rank | number | Yes | Rank in division (1-4) |
| 33 | division_games_back | number | Yes | Games behind division leader |
| 34 | division_record | string | Yes | Division W-L (e.g., '4-2') |
| 35 | conference_record | string | Yes | Conference W-L |
| 36 | conference_rank | number | Yes | Rank in conference (1-16) |
| 37 | playoff_seed | number | Optional | Current playoff seed (1-7 or null) |
| 38 | streak_type | string | Yes | 'W' or 'L' |
| 39 | streak_count | number | Yes | Number of consecutive W/L |
| 40 | streak_description | string | Yes | e.g., 'W4 - Won last 4' |
| 41 | clinched_division | boolean | Yes | Has team clinched division |
| 42 | clinched_playoff | boolean | Yes | Has team clinched playoff spot |
| 43 | clinched_bye | boolean | Yes | Has team clinched first-round bye |
| 44 | eliminated | boolean | Yes | Is team eliminated from playoffs |
| 45 | playoff_probability | number | Optional | Percentage (0-100) |
| 46 | next_game_id | string | Yes | Links to game-details |
| 47 | next_game_week | number | Yes | Week number |
| 48 | next_opponent_id | string | Yes | Opponent team_id |
| 49 | next_opponent_name | string | Yes | Opponent full name |
| 50 | next_game_date | datetime | Yes | ISO 8601 format |
| 51 | next_game_location | string | Yes | 'home' or 'away' |
| 52 | next_game_tv_network | string | Optional | Broadcast network |
| 53 | next_game_spread | number | Optional | Betting spread |
| 54 | next_game_over_under | number | Optional | Betting total |
| 55 | last_game_id | string | Optional | Links to game-details |

---

### Section 3: Complete Roster Ecosystem (40 fields per player × 4 lists = 160 roster-related fields)

**Note:** These fields repeat for each player in: active_roster, practice_squad, injured_reserve, suspended_list

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 56 | player_id | string | Yes | Unique player identifier |
| 57 | jersey_number | number | Yes | Player's number |
| 58 | first_name | string | Yes | Player first name |
| 59 | last_name | string | Yes | Player last name |
| 60 | full_name | string | Yes | Complete player name |
| 61 | position | string | Yes | Position abbreviation (QB, RB, etc.) |
| 62 | depth_chart_position | number | Yes | Depth (1=starter, 2=backup) |
| 63 | height | string | Yes | Format: '6-4' |
| 64 | weight | number | Yes | Weight in pounds |
| 65 | age | number | Yes | Current age |
| 66 | experience | number | Yes | Years in NFL |
| 67 | college | string | Yes | College attended |
| 68 | draft_year | number | Optional | Year drafted |
| 69 | draft_round | number | Optional | Draft round |
| 70 | draft_pick | number | Optional | Overall pick number |
| 71 | contract_years_remaining | number | Optional | Years left on contract |
| 72 | contract_cap_hit | number | Optional | Current year cap hit (dollars) |
| 73 | is_franchise_tagged | boolean | Optional | Franchise tag status |
| 74 | status | string | Yes | 'active', 'injured', 'suspended', 'pup' |
| 75 | injury_type | string | Optional | Injury description |
| 76 | injury_body_part | string | Optional | Affected body part |
| 77 | injury_status | string | Optional | 'questionable', 'doubtful', 'out', 'IR' |
| 78 | injury_return_week | number | Optional | Estimated return week |
| 79 | season_stats_passing_yards | number | Optional | QB stat |
| 80 | season_stats_passing_tds | number | Optional | QB stat |
| 81 | season_stats_rushing_yards | number | Optional | RB/QB stat |
| 82 | season_stats_rushing_tds | number | Optional | RB/QB stat |
| 83 | season_stats_receptions | number | Optional | WR/TE/RB stat |
| 84 | season_stats_receiving_yards | number | Optional | WR/TE/RB stat |
| 85 | season_stats_receiving_tds | number | Optional | WR/TE/RB stat |
| 86 | season_stats_tackles | number | Optional | Defensive stat |
| 87 | season_stats_sacks | number | Optional | Defensive stat |
| 88 | season_stats_interceptions | number | Optional | Defensive stat |
| 89 | season_stats_field_goals_made | number | Optional | Kicker stat |
| 90 | season_stats_punting_average | number | Optional | Punter stat |
| 91 | pro_bowls | number | Yes | Career Pro Bowl selections |
| 92 | all_pro_selections | number | Yes | Career All-Pro selections |
| 93 | is_captain | boolean | Yes | Team captain status |
| 94 | player_card_size | string | Yes | 'S', 'M', or 'L' for display |
| 95 | player_profile_link | string | Yes | Link to player profile page |

**Roster List Counts:**
- Fields 56-95: 40 fields per player
- Active roster: ~53 players
- Practice squad: ~16 players
- Injured reserve: Variable (0-20 players)
- Suspended list: Variable (0-5 players)

---

### Section 4: Team Statistics - Comprehensive (95 fields)

#### Offensive Stats (30 fields)

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 96 | points_per_game | number | Yes | Offensive PPG |
| 97 | points_per_game_rank | number | Yes | NFL rank (1-32) |
| 98 | total_points | number | Yes | Season total points |
| 99 | touchdowns | number | Yes | Total TDs |
| 100 | field_goals | number | Yes | Total FG made |
| 101 | pass_yards_per_game | number | Yes | Passing YPG |
| 102 | pass_yards_per_game_rank | number | Yes | NFL rank |
| 103 | total_pass_yards | number | Yes | Season total |
| 104 | completions | number | Yes | Pass completions |
| 105 | pass_attempts | number | Yes | Pass attempts |
| 106 | completion_percentage | number | Yes | Completion % |
| 107 | pass_touchdowns | number | Yes | Passing TDs |
| 108 | interceptions | number | Yes | INTs thrown |
| 109 | sacks_allowed | number | Yes | Sacks allowed |
| 110 | sack_yards_lost | number | Yes | Yards lost to sacks |
| 111 | yards_per_pass_attempt | number | Yes | YPA |
| 112 | passer_rating | number | Yes | Team passer rating |
| 113 | rush_yards_per_game | number | Yes | Rushing YPG |
| 114 | rush_yards_per_game_rank | number | Yes | NFL rank |
| 115 | total_rush_yards | number | Yes | Season total |
| 116 | rush_attempts | number | Yes | Rushing attempts |
| 117 | yards_per_carry | number | Yes | YPC |
| 118 | rush_touchdowns | number | Yes | Rushing TDs |
| 119 | fumbles | number | Yes | Fumbles total |
| 120 | fumbles_lost | number | Yes | Fumbles lost |
| 121 | total_yards_per_game | number | Yes | Total offense YPG |
| 122 | total_yards_per_game_rank | number | Yes | NFL rank |
| 123 | plays_per_game | number | Yes | Offensive plays per game |
| 124 | yards_per_play | number | Yes | YPP |
| 125 | time_of_possession_avg | string | Yes | Format: 'MM:SS' |

#### Efficiency Stats (10 fields)

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 126 | third_down_conversions | number | Yes | 3rd downs converted |
| 127 | third_down_attempts | number | Yes | 3rd down attempts |
| 128 | third_down_percentage | number | Yes | Conversion % |
| 129 | fourth_down_conversions | number | Yes | 4th downs converted |
| 130 | fourth_down_attempts | number | Yes | 4th down attempts |
| 131 | fourth_down_percentage | number | Yes | Conversion % |
| 132 | red_zone_trips | number | Yes | RZ opportunities |
| 133 | red_zone_touchdowns | number | Yes | RZ TDs |
| 134 | red_zone_percentage | number | Yes | RZ TD % |
| 135 | turnovers_committed | number | Yes | Total turnovers |

#### Defensive Stats (25 fields)

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 136 | points_per_game_allowed | number | Yes | Defensive PPG allowed |
| 137 | points_per_game_allowed_rank | number | Yes | NFL rank (1-32) |
| 138 | total_points_allowed | number | Yes | Season total |
| 139 | touchdowns_allowed | number | Yes | TDs allowed |
| 140 | pass_yards_per_game_allowed | number | Yes | Pass YPG allowed |
| 141 | pass_yards_per_game_allowed_rank | number | Yes | NFL rank |
| 142 | completions_allowed | number | Yes | Completions allowed |
| 143 | attempts_against | number | Yes | Pass attempts against |
| 144 | completion_percentage_allowed | number | Yes | % allowed |
| 145 | pass_touchdowns_allowed | number | Yes | Pass TDs allowed |
| 146 | interceptions_by_defense | number | Yes | INTs by defense |
| 147 | interception_yards | number | Yes | INT return yards |
| 148 | interception_touchdowns | number | Yes | Pick-6s |
| 149 | passes_defended | number | Yes | Pass breakups |
| 150 | sacks_by_defense | number | Yes | Sacks by defense |
| 151 | sack_yards_by_defense | number | Yes | Sack yards |
| 152 | qb_hits | number | Yes | QB hits |
| 153 | rush_yards_per_game_allowed | number | Yes | Rush YPG allowed |
| 154 | rush_yards_per_game_allowed_rank | number | Yes | NFL rank |
| 155 | rush_attempts_against | number | Yes | Rush attempts against |
| 156 | yards_per_carry_allowed | number | Yes | YPC allowed |
| 157 | rush_touchdowns_allowed | number | Yes | Rush TDs allowed |
| 158 | stuffs | number | Yes | Tackles at/behind LOS |
| 159 | total_yards_per_game_allowed | number | Yes | Total defense YPG |
| 160 | total_yards_per_game_allowed_rank | number | Yes | NFL rank |

#### Defensive Turnovers & Efficiency (10 fields)

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 161 | turnovers_forced | number | Yes | Total turnovers forced |
| 162 | fumbles_recovered | number | Yes | Fumble recoveries |
| 163 | fumble_recovery_touchdowns | number | Yes | Fumble return TDs |
| 164 | safeties | number | Yes | Safeties |
| 165 | third_down_stops | number | Yes | 3rd down stops |
| 166 | third_down_attempts_against | number | Yes | 3rd down attempts faced |
| 167 | third_down_percentage_allowed | number | Yes | % allowed |
| 168 | red_zone_trips_against | number | Yes | RZ trips allowed |
| 169 | red_zone_touchdowns_allowed | number | Yes | RZ TDs allowed |
| 170 | red_zone_percentage_allowed | number | Yes | RZ TD % allowed |

#### Special Teams Stats (20 fields)

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 171 | field_goals_made | number | Yes | FG made |
| 172 | field_goals_attempted | number | Yes | FG attempted |
| 173 | field_goal_percentage | number | Yes | FG % |
| 174 | longest_field_goal | number | Yes | Longest FG |
| 175 | extra_points_made | number | Yes | XP made |
| 176 | extra_points_attempted | number | Yes | XP attempted |
| 177 | punts | number | Yes | Total punts |
| 178 | punt_yards | number | Yes | Punting yards |
| 179 | average_punt | number | Yes | Punt average |
| 180 | longest_punt | number | Yes | Longest punt |
| 181 | punts_inside_20 | number | Yes | Punts downed inside 20 |
| 182 | punt_touchbacks | number | Yes | Punt touchbacks |
| 183 | kick_return_attempts | number | Yes | KR attempts |
| 184 | kick_return_yards | number | Yes | KR yards |
| 185 | kick_return_average | number | Yes | KR average |
| 186 | kick_return_touchdowns | number | Yes | KR TDs |
| 187 | punt_return_attempts | number | Yes | PR attempts |
| 188 | punt_return_yards | number | Yes | PR yards |
| 189 | punt_return_average | number | Yes | PR average |
| 190 | punt_return_touchdowns | number | Yes | PR TDs |

---

### Section 5: Full Schedule & Results (25 fields per game)

**Note:** These fields repeat for each game in schedule (17 regular season + 4 preseason + playoffs)

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 191 | game_id | string | Yes | Unique game identifier |
| 192 | week | number | Yes | Week number |
| 193 | season_type | string | Yes | 'PRE', 'REG', or 'POST' |
| 194 | game_date | datetime | Yes | ISO 8601 format |
| 195 | opponent_id | string | Yes | Opponent team_id |
| 196 | opponent_name | string | Yes | Opponent full name |
| 197 | opponent_abbreviation | string | Yes | Opponent 3-letter code |
| 198 | location | string | Yes | 'home' or 'away' |
| 199 | venue_name | string | Yes | Stadium name |
| 200 | result | string | Optional | 'W', 'L', 'T', or null if not played |
| 201 | team_score | number | Optional | Team's score (null if not played) |
| 202 | opponent_score | number | Optional | Opponent's score |
| 203 | team_record_after | string | Optional | Record after this game (e.g., '6-2') |
| 204 | opening_spread | number | Optional | Opening betting line |
| 205 | closing_spread | number | Optional | Closing betting line |
| 206 | opening_total | number | Optional | Opening over/under |
| 207 | closing_total | number | Optional | Closing over/under |
| 208 | result_vs_spread | string | Optional | 'covered', 'did_not_cover', 'push', null |
| 209 | broadcast_network | string | Optional | TV network |
| 210 | broadcast_time | string | Optional | Game time |
| 211 | is_primetime | boolean | Yes | Primetime game flag |
| 212 | is_division_game | boolean | Yes | Division game flag |
| 213 | is_conference_game | boolean | Yes | Conference game flag |
| 214 | rest_days | number | Yes | Days of rest before game |
| 215 | game_details_link | string | Yes | Link to game-details page |

**Schedule Metrics (5 additional fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 216 | strength_of_schedule | number | Yes | Opponent combined win % |
| 217 | remaining_sos | number | Yes | Remaining opponents win % |
| 218 | wins_vs_winning_teams | number | Yes | Wins vs teams > .500 |
| 219 | wins_vs_500_plus | number | Yes | Wins vs teams .500+ |
| 220 | divisional_games_remaining | number | Yes | Division games left |

---

### Section 6: Division & Conference Standings (20 fields)

**Division Standings (per team in division - 4 teams):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 221 | division_name | string | Yes | e.g., 'NFC East' |
| 222 | division_team_id | string | Yes | Team identifier |
| 223 | division_team_name | string | Yes | Team full name |
| 224 | division_team_rank | number | Yes | Division rank (1-4) |
| 225 | division_team_wins | number | Yes | Team wins |
| 226 | division_team_losses | number | Yes | Team losses |
| 227 | division_team_ties | number | Yes | Team ties |
| 228 | division_team_win_pct | number | Yes | Win percentage |
| 229 | division_team_games_back | number | Yes | Games behind leader |
| 230 | division_team_div_record | string | Yes | Division record |
| 231 | division_team_conf_record | string | Yes | Conference record |

**Conference Standings (additional fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 232 | conference_name | string | Yes | 'NFC' or 'AFC' |
| 233 | conference_rank | number | Yes | Conference rank (1-16) |
| 234 | playoff_seed | number | Optional | Playoff seed (1-7 or null) |
| 235 | conf_clinched_division | boolean | Yes | Division clinched |
| 236 | conf_clinched_playoff | boolean | Yes | Playoff spot clinched |
| 237 | conf_eliminated | boolean | Yes | Eliminated from playoffs |

**Playoff Picture (4 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 238 | wild_card_teams | array | Yes | Team IDs in wild card spots |
| 239 | division_leaders | array | Yes | Team IDs leading divisions |
| 240 | teams_in_hunt | array | Yes | Teams still in playoff hunt |
| 241 | eliminated_teams | array | Yes | Teams eliminated |

---

### Section 7: Coaching Staff Directory (30 fields)

**Head Coach (10 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 242 | hc_coach_id | string | Yes | Head coach identifier |
| 243 | hc_name | string | Yes | Full name |
| 244 | hc_photo_url | string | Optional | Photo URL |
| 245 | hc_years_with_team | number | Yes | Years with current team |
| 246 | hc_career_wins | number | Yes | Career wins |
| 247 | hc_career_losses | number | Yes | Career losses |
| 248 | hc_win_percentage | number | Yes | Career win % |
| 249 | hc_playoff_wins | number | Yes | Playoff wins |
| 250 | hc_playoff_losses | number | Yes | Playoff losses |
| 251 | hc_super_bowl_wins | number | Yes | SB championships |

**Coordinators (3 × 6 fields = 18 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 252 | oc_coach_id | string | Yes | OC identifier |
| 253 | oc_name | string | Yes | OC name |
| 254 | oc_years_with_team | number | Yes | Years with team |
| 255 | dc_coach_id | string | Yes | DC identifier |
| 256 | dc_name | string | Yes | DC name |
| 257 | dc_years_with_team | number | Yes | Years with team |
| 258 | stc_coach_id | string | Yes | ST coordinator identifier |
| 259 | stc_name | string | Yes | ST coordinator name |
| 260 | stc_years_with_team | number | Yes | Years with team |

**Position Coaches (variable, ~8-12 coaches):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 261 | position_coach_id | string | Yes | Per position coach |
| 262 | position_coach_name | string | Yes | Per position coach |
| 263 | position_coach_title | string | Yes | e.g., 'Quarterbacks Coach' |
| 264 | position_coach_position_group | string | Yes | QB, RB, WR, OL, DL, LB, DB, ST |
| 265 | position_coach_years_with_team | number | Yes | Years with team |

---

## PRIORITY P1: IMPORTANT FIELDS (44 fields)

### Section 8: News & Transactions Feed (20 fields)

**News Articles (10 fields per article):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 266 | article_id | string | Yes | Unique article identifier |
| 267 | article_title | string | Yes | Article headline |
| 268 | article_summary | text | Yes | Brief summary |
| 269 | article_published_date | datetime | Yes | ISO 8601 format |
| 270 | article_source | string | Yes | e.g., 'NFL.com', 'ESPN' |
| 271 | article_url | string | Yes | Full article URL |
| 272 | article_thumbnail_url | string | Optional | Thumbnail image |
| 273 | article_category | string | Yes | 'injury', 'roster_move', 'game_recap', etc. |

**Transactions (10 fields per transaction):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 274 | transaction_id | string | Yes | Unique transaction ID |
| 275 | transaction_date | date | Yes | Transaction date |
| 276 | transaction_type | string | Yes | 'signing', 'trade', 'release', 'draft_pick', 'IR', etc. |
| 277 | transaction_player_id | string | Yes | Player involved |
| 278 | transaction_player_name | string | Yes | Player name |
| 279 | transaction_description | string | Yes | Transaction details |
| 280 | transaction_contract_years | number | Optional | Contract length |
| 281 | transaction_contract_value | number | Optional | Contract value (dollars) |

---

### Section 9: Injury Report (12 fields)

**Per Injured Player:**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 282 | injury_player_id | string | Yes | Player identifier |
| 283 | injury_player_name | string | Yes | Player name |
| 284 | injury_position | string | Yes | Player position |
| 285 | injury_type | string | Yes | Injury description |
| 286 | injury_body_part | string | Yes | Affected body part |
| 287 | injury_status | string | Yes | 'out', 'doubtful', 'questionable', 'probable' |
| 288 | injury_date_injured | date | Yes | Date of injury |
| 289 | injury_games_missed | number | Yes | Games missed |
| 290 | injury_estimated_return | string | Optional | Week or date estimate |
| 291 | injury_practice_wed | string | Optional | 'full', 'limited', 'dnp', null |
| 292 | injury_practice_thu | string | Optional | Practice participation |
| 293 | injury_practice_fri | string | Optional | Practice participation |

**Injury Summary (5 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 294 | injury_summary_total_injured | number | Yes | Total injured players |
| 295 | injury_summary_starters_injured | number | Yes | Starters on injury list |
| 296 | injury_summary_key_players_out | array | Yes | Key player names |
| 297 | injury_summary_games_lost | number | Yes | Team games lost to injury |

---

### Section 10: Key Players Spotlight (12 fields)

**Per Key Player (5 positions: QB, RB, WR, DEF, Rookie):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 298 | key_player_id | string | Yes | Player identifier |
| 299 | key_player_name | string | Yes | Player full name |
| 300 | key_player_photo_url | string | Optional | Player photo |
| 301 | key_player_position | string | Yes | Position |
| 302 | key_player_season_stat_1 | number | Yes | Primary stat (position-specific) |
| 303 | key_player_season_stat_2 | number | Yes | Secondary stat |
| 304 | key_player_season_stat_3 | number | Yes | Tertiary stat |
| 305 | key_player_league_rank_1 | number | Optional | Rank for stat 1 |
| 306 | key_player_league_rank_2 | number | Optional | Rank for stat 2 |
| 307 | key_player_card_size | string | Yes | 'S', 'M', or 'L' |
| 308 | key_player_profile_link | string | Yes | Link to player profile |
| 309 | key_player_is_rookie | boolean | Yes | Rookie flag (for emerging rookie) |

---

## PRIORITY P2: NICE-TO-HAVE FIELDS (51 fields)

### Section 11: Franchise History & Records (25 fields)

**All-Time Record (6 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 310 | all_time_regular_season_wins | number | Yes | Total RS wins |
| 311 | all_time_regular_season_losses | number | Yes | Total RS losses |
| 312 | all_time_regular_season_ties | number | Yes | Total RS ties |
| 313 | all_time_playoff_wins | number | Yes | Total playoff wins |
| 314 | all_time_playoff_losses | number | Yes | Total playoff losses |
| 315 | all_time_win_percentage | number | Yes | Overall win % |

**Championships (10 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 316 | super_bowl_championships | number | Yes | Total Super Bowl wins |
| 317 | super_bowl_years | array | Yes | Years won (e.g., [1993, 1994, 1996]) |
| 318 | conference_championships | number | Yes | Total conference titles |
| 319 | division_titles | number | Yes | Total division titles |
| 320 | playoff_appearances | number | Yes | Total playoff appearances |

**Hall of Fame & Honors (5 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 321 | hall_of_famers_count | number | Yes | Total HOF inductees |
| 322 | retired_numbers_count | number | Yes | Total retired numbers |

**Franchise Records (4 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 323 | single_season_most_wins | number | Yes | Best regular season record |
| 324 | single_season_most_wins_year | number | Yes | Year of best record |
| 325 | single_game_most_points | number | Yes | Most points in a game |
| 326 | single_game_most_points_date | date | Yes | Date of record |

---

### Section 12: All-Time Leaders (12 fields)

**Passing Leaders (3 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 327 | all_time_passing_leader_name | string | Yes | Top passer name |
| 328 | all_time_passing_leader_yards | number | Yes | Total career yards |
| 329 | all_time_passing_leader_years | string | Yes | Years active (e.g., '1989-2000') |

**Rushing Leaders (3 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 330 | all_time_rushing_leader_name | string | Yes | Top rusher name |
| 331 | all_time_rushing_leader_yards | number | Yes | Total career yards |
| 332 | all_time_rushing_leader_years | string | Yes | Years active |

**Receiving Leaders (3 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 333 | all_time_receiving_leader_name | string | Yes | Top receiver name |
| 334 | all_time_receiving_leader_yards | number | Yes | Total career yards |
| 335 | all_time_receiving_leader_years | string | Yes | Years active |

**Defensive Leaders (3 fields):**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 336 | all_time_sacks_leader_name | string | Yes | Top sacks leader |
| 337 | all_time_sacks_leader_total | number | Yes | Total career sacks |
| 338 | all_time_sacks_leader_years | string | Yes | Years active |

---

### Section 13: Team Analytics Dashboard (10 fields)

**Power Rankings & Advanced Metrics:**

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 339 | analytics_overall_rank | number | Optional | Overall power rank (1-32) |
| 340 | analytics_offense_rank | number | Optional | Offense rank |
| 341 | analytics_defense_rank | number | Optional | Defense rank |
| 342 | analytics_current_elo | number | Optional | Current ELO rating |
| 343 | analytics_elo_rank | number | Optional | ELO rank (1-32) |
| 344 | analytics_overall_dvoa | number | Optional | Total DVOA % |
| 345 | analytics_offensive_dvoa | number | Optional | Offensive DVOA % |
| 346 | analytics_defensive_dvoa | number | Optional | Defensive DVOA % |
| 347 | analytics_recent_form | string | Optional | Last 5 games (e.g., 'W-W-L-W-W') |
| 348 | analytics_momentum_score | number | Optional | Custom momentum metric |

---

### Section 14: Depth Chart Visualization (4 fields)

**Note:** Depth chart uses roster data but organizes by position groupings

| # | Field Name | Data Type | Required | Notes |
|---|------------|-----------|----------|-------|
| 349 | depth_chart_offense | object | Yes | Nested position groups (QB, RB, WR, TE, OL) |
| 350 | depth_chart_defense | object | Yes | Nested position groups (DL, LB, CB, S) |
| 351 | depth_chart_special_teams | object | Yes | K, P, LS, return specialists |
| 352 | depth_chart_last_updated | datetime | Yes | Last depth chart update |

---

## Field Count Summary

| Priority | Section | Field Count |
|----------|---------|-------------|
| **P0** | Section 1: Team Identity | 25 |
| **P0** | Section 2: Current Season | 30 |
| **P0** | Section 3: Roster Ecosystem | 40 per player (×4 lists) |
| **P0** | Section 4: Team Statistics | 95 |
| **P0** | Section 5: Schedule & Results | 25 per game + 5 metrics |
| **P0** | Section 6: Standings | 20 |
| **P0** | Section 7: Coaching Staff | 30 |
| **P1** | Section 8: News & Transactions | 20 |
| **P1** | Section 9: Injury Report | 12 + 5 summary |
| **P1** | Section 10: Key Players | 12 per player (×5) |
| **P2** | Section 11: Franchise History | 25 |
| **P2** | Section 12: All-Time Leaders | 12 |
| **P2** | Section 13: Analytics Dashboard | 10 |
| **P2** | Section 14: Depth Chart | 4 |
| **TOTAL** | **All Sections** | **284 unique fields** |

---

## Notes

1. **Roster Fields**: 40 fields per player repeated across active_roster (~53), practice_squad (~16), injured_reserve (variable), and suspended_list (variable)
2. **Schedule Fields**: 25 fields per game repeated for ~21 games (17 regular + 4 preseason)
3. **Position-Specific Stats**: Season stats fields (79-90) are position-dependent; not all apply to every player
4. **Calculated Fields**: Some fields are calculated from other fields (e.g., win_percentage, franchise_age)
5. **Optional vs Required**: Fields marked "Optional" may be null if data is unavailable (e.g., betting lines, contract details)
6. **Array Fields**: Some fields store arrays of objects (e.g., super_bowl_years, wild_card_teams)
7. **Integration Fields**: Several fields are links to other pages (player_profile_link, game_details_link, stadium_id)

---

**Status:** Complete field inventory - Ready for data source mapping
**Next Steps:**
1. Create `data-source-for-team-pages.json` mapping each field to data sources
2. Create `master-data-source-report.md` with coverage analysis
