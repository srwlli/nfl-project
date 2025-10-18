# Historical Stats - Complete Data Field List (1970-2024)

**Total Fields:** 850 fields
**Document Purpose:** Exhaustive field-by-field inventory for historical stats implementation
**Reference:** Maps to `historical-stats-data-requirements.md` sections
**Coverage Period:** 1970-2024 NFL seasons (54 years)
**Last Updated:** 2025-10-18

---

## Field Organization

Fields are organized by section matching the requirements document:
1. **Player Season Stats** (95 fields) - Yearly aggregates per player
2. **Player Game Logs** (85 fields) - Game-by-game stats per player
3. **Player Career Aggregates** (110 fields) - Career totals and milestones
4. **Play-by-Play Data** (75 fields) - Individual play records
5. **Team Season Stats** (120 fields) - Yearly team performance
6. **All-Time Leaderboards** (45 fields) - Historical rankings
7. **Historical Context & Metadata** (40 fields) - Era context and awards
8. **Advanced Analytics** (35 fields) - EPA, DVOA, advanced metrics
9. **Situational Splits** (200 fields) - Performance by situation
10. **Awards & Accolades** (50 fields) - Individual and team honors

**Field Format:**
- Field # | Field Name | Data Type | Required/Optional | Position-Specific | Notes

---

## Section 1: Player Season Stats (95 fields)

### Core Identification (7 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 1 | player_id | string | Required | All | Unique player identifier |
| 2 | player_name | string | Required | All | Full player name |
| 3 | season | integer | Required | All | NFL season year (1970-2024) |
| 4 | team_id | string | Required | All | Team abbreviation |
| 5 | team_name | string | Required | All | Full team name |
| 6 | position | string | Required | All | Primary position |
| 7 | jersey_number | integer | Optional | All | Jersey number for that season |

### Games Played (5 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 8 | games_played | integer | Required | All | Total games played |
| 9 | games_started | integer | Required | All | Games started |
| 10 | team_games_total | integer | Required | All | Team's total games that season |
| 11 | games_missed | integer | Optional | All | Games missed due to injury/suspension |
| 12 | injury_games | integer | Optional | All | Games missed due to injury only |

### Passing Stats (26 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 13 | pass_attempts | integer | Optional | QB | Pass attempts |
| 14 | pass_completions | integer | Optional | QB | Completed passes |
| 15 | pass_completion_pct | float | Optional | QB | Completion percentage |
| 16 | pass_yards | integer | Optional | QB | Total passing yards |
| 17 | pass_yards_per_attempt | float | Optional | QB | Yards per attempt |
| 18 | pass_yards_per_completion | float | Optional | QB | Yards per completion |
| 19 | pass_touchdowns | integer | Optional | QB | Passing touchdowns |
| 20 | pass_interceptions | integer | Optional | QB | Interceptions thrown |
| 21 | pass_td_int_ratio | float | Optional | QB | TD to INT ratio |
| 22 | pass_rating | float | Optional | QB | Passer rating (0-158.3) |
| 23 | pass_sacks | integer | Optional | QB | Times sacked |
| 24 | pass_sack_yards | integer | Optional | QB | Yards lost to sacks |
| 25 | pass_first_downs | integer | Optional | QB | First downs via passing |
| 26 | pass_20plus_yards | integer | Optional | QB | Completions 20+ yards |
| 27 | pass_40plus_yards | integer | Optional | QB | Completions 40+ yards |
| 28 | pass_longest | integer | Optional | QB | Longest completion |
| 29 | pass_air_yards | integer | Optional | QB | Total air yards (2016+) |
| 30 | pass_yards_after_catch | integer | Optional | QB | Total YAC on completions |
| 31 | pass_intended_air_yards | integer | Optional | QB | Air yards on all attempts (2016+) |
| 32 | pass_accuracy_pct | float | Optional | QB | Catchable pass percentage (2016+) |
| 33 | pass_on_target_pct | float | Optional | QB | On-target throw percentage (2016+) |
| 34 | pass_drops | integer | Optional | QB | Receiver drops (2016+) |
| 35 | pass_drop_pct | float | Optional | QB | Drop percentage (2016+) |
| 36 | pass_batted_balls | integer | Optional | QB | Passes batted at line (2016+) |
| 37 | pass_throwaways | integer | Optional | QB | Intentional throwaways (2016+) |
| 38 | pass_spikes | integer | Optional | QB | Clock-stopping spikes |

### Rushing Stats (13 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 39 | rush_attempts | integer | Optional | RB/QB/WR | Rushing attempts |
| 40 | rush_yards | integer | Optional | RB/QB/WR | Total rushing yards |
| 41 | rush_yards_per_attempt | float | Optional | RB/QB/WR | Yards per carry |
| 42 | rush_touchdowns | integer | Optional | RB/QB/WR | Rushing touchdowns |
| 43 | rush_first_downs | integer | Optional | RB/QB/WR | First downs via rushing |
| 44 | rush_20plus_yards | integer | Optional | RB/QB/WR | Rushes 20+ yards |
| 45 | rush_40plus_yards | integer | Optional | RB/QB/WR | Rushes 40+ yards |
| 46 | rush_longest | integer | Optional | RB/QB/WR | Longest rush |
| 47 | rush_fumbles | integer | Optional | RB/QB/WR | Fumbles while rushing |
| 48 | rush_yards_before_contact | integer | Optional | RB | Yards before contact (2016+) |
| 49 | rush_yards_after_contact | integer | Optional | RB | Yards after contact (2016+) |
| 50 | rush_broken_tackles | integer | Optional | RB | Broken tackles (2016+) |
| 51 | rush_stuffed | integer | Optional | RB | Rushes for 0 or negative yards |

### Receiving Stats (18 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 52 | targets | integer | Optional | WR/TE/RB | Times targeted |
| 53 | receptions | integer | Optional | WR/TE/RB | Catches made |
| 54 | reception_pct | float | Optional | WR/TE/RB | Catch rate |
| 55 | receiving_yards | integer | Optional | WR/TE/RB | Total receiving yards |
| 56 | yards_per_reception | float | Optional | WR/TE/RB | Yards per catch |
| 57 | yards_per_target | float | Optional | WR/TE/RB | Yards per target |
| 58 | receiving_touchdowns | integer | Optional | WR/TE/RB | Receiving touchdowns |
| 59 | receiving_first_downs | integer | Optional | WR/TE/RB | First downs via receiving |
| 60 | receiving_20plus_yards | integer | Optional | WR/TE/RB | Receptions 20+ yards |
| 61 | receiving_40plus_yards | integer | Optional | WR/TE/RB | Receptions 40+ yards |
| 62 | receiving_longest | integer | Optional | WR/TE/RB | Longest reception |
| 63 | receiving_air_yards | integer | Optional | WR/TE/RB | Air yards on receptions (2016+) |
| 64 | receiving_yards_after_catch | integer | Optional | WR/TE/RB | Total YAC (2016+) |
| 65 | receiving_yac_per_reception | float | Optional | WR/TE/RB | YAC per catch (2016+) |
| 66 | receiving_drops | integer | Optional | WR/TE/RB | Dropped passes (2016+) |
| 67 | receiving_contested_catches | integer | Optional | WR/TE/RB | Contested catches (2016+) |
| 68 | receiving_contested_catch_pct | float | Optional | WR/TE/RB | Contested catch rate (2016+) |
| 69 | receiving_fumbles | integer | Optional | WR/TE/RB | Fumbles after catch |

### Defensive Stats (20 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 70 | tackles_solo | integer | Optional | Defensive | Solo tackles |
| 71 | tackles_assisted | integer | Optional | Defensive | Assisted tackles |
| 72 | tackles_total | integer | Optional | Defensive | Total tackles |
| 73 | tackles_for_loss | integer | Optional | Defensive | TFL |
| 74 | sacks | float | Optional | Defensive | Sacks (0.5 for assisted) |
| 75 | sack_yards | integer | Optional | Defensive | Yards lost on sacks |
| 76 | qb_hits | integer | Optional | Defensive | QB hits (2006+) |
| 77 | interceptions | integer | Optional | Defensive | Interceptions |
| 78 | interception_yards | integer | Optional | Defensive | INT return yards |
| 79 | interception_touchdowns | integer | Optional | Defensive | Pick-sixes |
| 80 | interception_longest | integer | Optional | Defensive | Longest INT return |
| 81 | passes_defended | integer | Optional | Defensive | Passes defended |
| 82 | forced_fumbles | integer | Optional | Defensive | Forced fumbles |
| 83 | fumble_recoveries | integer | Optional | Defensive | Fumble recoveries |
| 84 | fumble_recovery_yards | integer | Optional | Defensive | Fumble return yards |
| 85 | fumble_recovery_touchdowns | integer | Optional | Defensive | Fumble return TDs |
| 86 | safeties | integer | Optional | Defensive | Safeties recorded |
| 87 | defensive_snaps | integer | Optional | Defensive | Defensive snap count (2012+) |
| 88 | coverage_snaps | integer | Optional | DB | Coverage snaps (2016+) |
| 89 | targets_allowed | integer | Optional | DB | Times targeted (2016+) |

### Special Teams Stats (6 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 90 | special_teams_tackles | integer | Optional | All | ST tackles |
| 91 | kickoff_returns | integer | Optional | All | Kickoff returns |
| 92 | kickoff_return_yards | integer | Optional | All | KR yards |
| 93 | punt_returns | integer | Optional | All | Punt returns |
| 94 | punt_return_yards | integer | Optional | All | PR yards |
| 95 | special_teams_touchdowns | integer | Optional | All | ST touchdowns |

---

## Section 2: Player Game Logs (85 fields)

### Core Game Identification (10 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 96 | game_id | string | Required | All | Unique game identifier |
| 97 | player_id | string | Required | All | Unique player identifier |
| 98 | player_name | string | Required | All | Full player name |
| 99 | season | integer | Required | All | NFL season year |
| 100 | week | integer | Required | All | Week number (1-18, playoff) |
| 101 | game_date | date | Required | All | Game date (YYYY-MM-DD) |
| 102 | team_id | string | Required | All | Player's team |
| 103 | opponent_id | string | Required | All | Opponent team |
| 104 | home_away | string | Required | All | "home" or "away" |
| 105 | game_result | string | Required | All | "W" or "L" or "T" |

### Game Context (7 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 106 | team_score | integer | Required | All | Player's team score |
| 107 | opponent_score | integer | Required | All | Opponent score |
| 108 | overtime | boolean | Required | All | Overtime game flag |
| 109 | playoff_game | boolean | Required | All | Playoff game flag |
| 110 | playoff_round | string | Optional | All | WildCard/Divisional/Conference/SuperBowl |
| 111 | game_started | boolean | Required | All | Did player start |
| 112 | snap_count | integer | Optional | All | Player snaps (2012+) |

### Passing Stats - Game Level (21 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 113 | game_pass_attempts | integer | Optional | QB | Pass attempts |
| 114 | game_pass_completions | integer | Optional | QB | Completed passes |
| 115 | game_pass_completion_pct | float | Optional | QB | Completion percentage |
| 116 | game_pass_yards | integer | Optional | QB | Passing yards |
| 117 | game_pass_yards_per_attempt | float | Optional | QB | Yards per attempt |
| 118 | game_pass_touchdowns | integer | Optional | QB | Passing touchdowns |
| 119 | game_pass_interceptions | integer | Optional | QB | Interceptions thrown |
| 120 | game_pass_rating | float | Optional | QB | Passer rating |
| 121 | game_pass_sacks | integer | Optional | QB | Times sacked |
| 122 | game_pass_sack_yards | integer | Optional | QB | Sack yards lost |
| 123 | game_pass_first_downs | integer | Optional | QB | First downs passing |
| 124 | game_pass_20plus | integer | Optional | QB | Completions 20+ yards |
| 125 | game_pass_40plus | integer | Optional | QB | Completions 40+ yards |
| 126 | game_pass_longest | integer | Optional | QB | Longest completion |
| 127 | game_pass_air_yards | integer | Optional | QB | Air yards (2016+) |
| 128 | game_pass_yac | integer | Optional | QB | YAC on completions (2016+) |
| 129 | game_pass_accuracy_pct | float | Optional | QB | Accuracy percentage (2016+) |
| 130 | game_pass_on_target_pct | float | Optional | QB | On-target percentage (2016+) |
| 131 | game_pass_drops | integer | Optional | QB | Receiver drops (2016+) |
| 132 | game_pass_batted | integer | Optional | QB | Batted passes (2016+) |
| 133 | game_pass_throwaways | integer | Optional | QB | Throwaways (2016+) |

### Rushing Stats - Game Level (11 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 134 | game_rush_attempts | integer | Optional | RB/QB/WR | Rush attempts |
| 135 | game_rush_yards | integer | Optional | RB/QB/WR | Rushing yards |
| 136 | game_rush_yards_per_attempt | float | Optional | RB/QB/WR | Yards per carry |
| 137 | game_rush_touchdowns | integer | Optional | RB/QB/WR | Rushing touchdowns |
| 138 | game_rush_first_downs | integer | Optional | RB/QB/WR | First downs rushing |
| 139 | game_rush_20plus | integer | Optional | RB/QB/WR | Rushes 20+ yards |
| 140 | game_rush_40plus | integer | Optional | RB/QB/WR | Rushes 40+ yards |
| 141 | game_rush_longest | integer | Optional | RB/QB/WR | Longest rush |
| 142 | game_rush_fumbles | integer | Optional | RB/QB/WR | Fumbles while rushing |
| 143 | game_rush_ybc | integer | Optional | RB | Yards before contact (2016+) |
| 144 | game_rush_yac | integer | Optional | RB | Yards after contact (2016+) |

### Receiving Stats - Game Level (15 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 145 | game_targets | integer | Optional | WR/TE/RB | Times targeted |
| 146 | game_receptions | integer | Optional | WR/TE/RB | Catches made |
| 147 | game_reception_pct | float | Optional | WR/TE/RB | Catch rate |
| 148 | game_receiving_yards | integer | Optional | WR/TE/RB | Receiving yards |
| 149 | game_yards_per_reception | float | Optional | WR/TE/RB | Yards per catch |
| 150 | game_yards_per_target | float | Optional | WR/TE/RB | Yards per target |
| 151 | game_receiving_touchdowns | integer | Optional | WR/TE/RB | Receiving TDs |
| 152 | game_receiving_first_downs | integer | Optional | WR/TE/RB | First downs receiving |
| 153 | game_receiving_20plus | integer | Optional | WR/TE/RB | Receptions 20+ yards |
| 154 | game_receiving_40plus | integer | Optional | WR/TE/RB | Receptions 40+ yards |
| 155 | game_receiving_longest | integer | Optional | WR/TE/RB | Longest reception |
| 156 | game_receiving_air_yards | integer | Optional | WR/TE/RB | Air yards (2016+) |
| 157 | game_receiving_yac | integer | Optional | WR/TE/RB | YAC total (2016+) |
| 158 | game_receiving_drops | integer | Optional | WR/TE/RB | Drops (2016+) |
| 159 | game_receiving_contested | integer | Optional | WR/TE/RB | Contested catches (2016+) |

### Defensive Stats - Game Level (16 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 160 | game_tackles_solo | integer | Optional | Defensive | Solo tackles |
| 161 | game_tackles_assisted | integer | Optional | Defensive | Assisted tackles |
| 162 | game_tackles_total | integer | Optional | Defensive | Total tackles |
| 163 | game_tackles_for_loss | integer | Optional | Defensive | TFL |
| 164 | game_sacks | float | Optional | Defensive | Sacks |
| 165 | game_sack_yards | integer | Optional | Defensive | Sack yards |
| 166 | game_qb_hits | integer | Optional | Defensive | QB hits (2006+) |
| 167 | game_interceptions | integer | Optional | Defensive | Interceptions |
| 168 | game_interception_yards | integer | Optional | Defensive | INT return yards |
| 169 | game_interception_touchdowns | integer | Optional | Defensive | Pick-sixes |
| 170 | game_passes_defended | integer | Optional | Defensive | Passes defended |
| 171 | game_forced_fumbles | integer | Optional | Defensive | Forced fumbles |
| 172 | game_fumble_recoveries | integer | Optional | Defensive | Fumble recoveries |
| 173 | game_fumble_recovery_touchdowns | integer | Optional | Defensive | Fumble return TDs |
| 174 | game_safeties | integer | Optional | Defensive | Safeties |
| 175 | game_targets_allowed | integer | Optional | DB | Times targeted (2016+) |

### Special Teams - Game Level (5 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 176 | game_st_tackles | integer | Optional | All | ST tackles |
| 177 | game_kickoff_returns | integer | Optional | All | Kickoff returns |
| 178 | game_kickoff_return_yards | integer | Optional | All | KR yards |
| 179 | game_punt_returns | integer | Optional | All | Punt returns |
| 180 | game_punt_return_yards | integer | Optional | All | PR yards |

---

## Section 3: Player Career Aggregates (110 fields)

### Core Career Identity (8 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 181 | player_id | string | Required | All | Unique player identifier |
| 182 | player_name | string | Required | All | Full player name |
| 183 | primary_position | string | Required | All | Career primary position |
| 184 | career_start_year | integer | Required | All | First NFL season |
| 185 | career_end_year | integer | Required | All | Last NFL season |
| 186 | seasons_played | integer | Required | All | Total seasons |
| 187 | teams_played_for | array | Required | All | List of team abbreviations |
| 188 | pro_bowl_selections | integer | Required | All | Pro Bowl appearances |

### Career Games Played (8 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 189 | career_games_played | integer | Required | All | Total games played |
| 190 | career_games_started | integer | Required | All | Total games started |
| 191 | career_playoff_games | integer | Optional | All | Playoff games |
| 192 | career_playoff_starts | integer | Optional | All | Playoff starts |
| 193 | career_sb_appearances | integer | Optional | All | Super Bowl appearances |
| 194 | career_sb_wins | integer | Optional | All | Super Bowl wins |
| 195 | career_games_active | integer | Optional | All | Games on active roster |
| 196 | career_games_inactive | integer | Optional | All | Games inactive |

### Career Passing Totals (24 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 197 | career_pass_attempts | integer | Optional | QB | Career pass attempts |
| 198 | career_pass_completions | integer | Optional | QB | Career completions |
| 199 | career_pass_completion_pct | float | Optional | QB | Career completion % |
| 200 | career_pass_yards | integer | Optional | QB | Career passing yards |
| 201 | career_pass_yards_per_attempt | float | Optional | QB | Career YPA |
| 202 | career_pass_touchdowns | integer | Optional | QB | Career passing TDs |
| 203 | career_pass_interceptions | integer | Optional | QB | Career INTs |
| 204 | career_pass_td_int_ratio | float | Optional | QB | Career TD:INT ratio |
| 205 | career_pass_rating | float | Optional | QB | Career passer rating |
| 206 | career_pass_sacks | integer | Optional | QB | Career sacks taken |
| 207 | career_pass_sack_yards | integer | Optional | QB | Career sack yards lost |
| 208 | career_pass_first_downs | integer | Optional | QB | Career first downs passing |
| 209 | career_pass_20plus | integer | Optional | QB | Career 20+ yard completions |
| 210 | career_pass_40plus | integer | Optional | QB | Career 40+ yard completions |
| 211 | career_pass_longest | integer | Optional | QB | Longest career completion |
| 212 | career_300_yard_games | integer | Optional | QB | 300+ yard passing games |
| 213 | career_400_yard_games | integer | Optional | QB | 400+ yard passing games |
| 214 | career_4_td_games | integer | Optional | QB | 4+ TD passing games |
| 215 | career_5_td_games | integer | Optional | QB | 5+ TD passing games |
| 216 | career_perfect_rating_games | integer | Optional | QB | Perfect passer rating games |
| 217 | career_playoff_pass_yards | integer | Optional | QB | Playoff passing yards |
| 218 | career_playoff_pass_tds | integer | Optional | QB | Playoff passing TDs |
| 219 | career_sb_pass_yards | integer | Optional | QB | Super Bowl passing yards |
| 220 | career_sb_pass_tds | integer | Optional | QB | Super Bowl passing TDs |

### Career Rushing Totals (16 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 221 | career_rush_attempts | integer | Optional | RB/QB/WR | Career rush attempts |
| 222 | career_rush_yards | integer | Optional | RB/QB/WR | Career rushing yards |
| 223 | career_rush_yards_per_attempt | float | Optional | RB/QB/WR | Career YPC |
| 224 | career_rush_touchdowns | integer | Optional | RB/QB/WR | Career rushing TDs |
| 225 | career_rush_first_downs | integer | Optional | RB/QB/WR | Career rushing first downs |
| 226 | career_rush_20plus | integer | Optional | RB/QB/WR | Career 20+ yard rushes |
| 227 | career_rush_40plus | integer | Optional | RB/QB/WR | Career 40+ yard rushes |
| 228 | career_rush_longest | integer | Optional | RB/QB/WR | Longest career rush |
| 229 | career_rush_fumbles | integer | Optional | RB/QB/WR | Career fumbles rushing |
| 230 | career_100_yard_rush_games | integer | Optional | RB/QB/WR | 100+ yard rushing games |
| 231 | career_150_yard_rush_games | integer | Optional | RB/QB/WR | 150+ yard rushing games |
| 232 | career_200_yard_rush_games | integer | Optional | RB/QB/WR | 200+ yard rushing games |
| 233 | career_1000_yard_seasons | integer | Optional | RB/QB/WR | 1000+ yard rushing seasons |
| 234 | career_playoff_rush_yards | integer | Optional | RB/QB/WR | Playoff rushing yards |
| 235 | career_playoff_rush_tds | integer | Optional | RB/QB/WR | Playoff rushing TDs |
| 236 | career_sb_rush_yards | integer | Optional | RB/QB/WR | Super Bowl rushing yards |

### Career Receiving Totals (18 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 237 | career_targets | integer | Optional | WR/TE/RB | Career targets |
| 238 | career_receptions | integer | Optional | WR/TE/RB | Career receptions |
| 239 | career_reception_pct | float | Optional | WR/TE/RB | Career catch rate |
| 240 | career_receiving_yards | integer | Optional | WR/TE/RB | Career receiving yards |
| 241 | career_yards_per_reception | float | Optional | WR/TE/RB | Career YPC |
| 242 | career_yards_per_target | float | Optional | WR/TE/RB | Career YPT |
| 243 | career_receiving_touchdowns | integer | Optional | WR/TE/RB | Career receiving TDs |
| 244 | career_receiving_first_downs | integer | Optional | WR/TE/RB | Career receiving first downs |
| 245 | career_receiving_20plus | integer | Optional | WR/TE/RB | Career 20+ yard receptions |
| 246 | career_receiving_40plus | integer | Optional | WR/TE/RB | Career 40+ yard receptions |
| 247 | career_receiving_longest | integer | Optional | WR/TE/RB | Longest career reception |
| 248 | career_100_yard_rec_games | integer | Optional | WR/TE/RB | 100+ yard receiving games |
| 249 | career_150_yard_rec_games | integer | Optional | WR/TE/RB | 150+ yard receiving games |
| 250 | career_200_yard_rec_games | integer | Optional | WR/TE/RB | 200+ yard receiving games |
| 251 | career_1000_yard_rec_seasons | integer | Optional | WR/TE/RB | 1000+ yard receiving seasons |
| 252 | career_playoff_rec_yards | integer | Optional | WR/TE/RB | Playoff receiving yards |
| 253 | career_playoff_rec_tds | integer | Optional | WR/TE/RB | Playoff receiving TDs |
| 254 | career_sb_rec_yards | integer | Optional | WR/TE/RB | Super Bowl receiving yards |

### Career Defensive Totals (20 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 255 | career_tackles_solo | integer | Optional | Defensive | Career solo tackles |
| 256 | career_tackles_assisted | integer | Optional | Defensive | Career assisted tackles |
| 257 | career_tackles_total | integer | Optional | Defensive | Career total tackles |
| 258 | career_tackles_for_loss | integer | Optional | Defensive | Career TFL |
| 259 | career_sacks | float | Optional | Defensive | Career sacks |
| 260 | career_sack_yards | integer | Optional | Defensive | Career sack yards |
| 261 | career_qb_hits | integer | Optional | Defensive | Career QB hits |
| 262 | career_interceptions | integer | Optional | Defensive | Career interceptions |
| 263 | career_interception_yards | integer | Optional | Defensive | Career INT return yards |
| 264 | career_interception_touchdowns | integer | Optional | Defensive | Career pick-sixes |
| 265 | career_passes_defended | integer | Optional | Defensive | Career passes defended |
| 266 | career_forced_fumbles | integer | Optional | Defensive | Career forced fumbles |
| 267 | career_fumble_recoveries | integer | Optional | Defensive | Career fumble recoveries |
| 268 | career_fumble_recovery_tds | integer | Optional | Defensive | Career fumble return TDs |
| 269 | career_safeties | integer | Optional | Defensive | Career safeties |
| 270 | career_defensive_tds | integer | Optional | Defensive | Career defensive TDs |
| 271 | career_playoff_tackles | integer | Optional | Defensive | Playoff tackles |
| 272 | career_playoff_sacks | float | Optional | Defensive | Playoff sacks |
| 273 | career_playoff_ints | integer | Optional | Defensive | Playoff interceptions |
| 274 | career_sb_tackles | integer | Optional | Defensive | Super Bowl tackles |

### Career Milestones (16 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 275 | career_all_pro_first | integer | Optional | All | First-Team All-Pro selections |
| 276 | career_all_pro_second | integer | Optional | All | Second-Team All-Pro selections |
| 277 | career_pro_bowls | integer | Optional | All | Pro Bowl selections |
| 278 | career_mvp_awards | integer | Optional | All | NFL MVP awards |
| 279 | career_opoy_awards | integer | Optional | All | Offensive POY awards |
| 280 | career_dpoy_awards | integer | Optional | All | Defensive POY awards |
| 281 | career_sb_mvp_awards | integer | Optional | All | Super Bowl MVP awards |
| 282 | career_hof_inducted | boolean | Optional | All | Hall of Fame status |
| 283 | career_hof_year | integer | Optional | All | HOF induction year |
| 284 | career_jersey_retired | boolean | Optional | All | Jersey retired flag |
| 285 | career_ring_of_honor | boolean | Optional | All | Team Ring of Honor |
| 286 | career_50th_anniversary_team | boolean | Optional | All | 50th Anniversary Team |
| 287 | career_75th_anniversary_team | boolean | Optional | All | 75th Anniversary Team |
| 288 | career_100th_anniversary_team | boolean | Optional | All | 100th Anniversary Team |
| 289 | career_all_decade_team | array | Optional | All | Decade teams (1970s, 1980s, etc.) |
| 290 | career_franchise_records | array | Optional | All | Franchise records held |

---

## Section 4: Play-by-Play Data (75 fields)

### Core Play Identification (12 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 291 | play_id | string | Required | N/A | Unique play identifier |
| 292 | game_id | string | Required | N/A | Game identifier |
| 293 | season | integer | Required | N/A | Season year |
| 294 | week | integer | Required | N/A | Week number |
| 295 | season_type | string | Required | N/A | REG/POST |
| 296 | quarter | integer | Required | N/A | Quarter (1-5) |
| 297 | time_remaining | string | Required | N/A | Time remaining (MM:SS) |
| 298 | time_seconds_remaining | integer | Required | N/A | Seconds remaining in quarter |
| 299 | play_clock | integer | Optional | N/A | Play clock when snap occurred |
| 300 | drive_id | string | Required | N/A | Drive identifier |
| 301 | play_number_in_drive | integer | Required | N/A | Play number within drive |
| 302 | game_play_number | integer | Required | N/A | Sequential play # in game |

### Situation (15 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 303 | possession_team | string | Required | N/A | Team with possession |
| 304 | defensive_team | string | Required | N/A | Defensive team |
| 305 | down | integer | Required | N/A | Down (1-4) |
| 306 | yards_to_go | integer | Required | N/A | Yards for first down |
| 307 | yardline | integer | Required | N/A | Yardline (0-100) |
| 308 | yardline_side | string | Required | N/A | Which team's side |
| 309 | field_position_category | string | Required | N/A | own_territory/midfield/opponent_territory/red_zone |
| 310 | score_differential | integer | Required | N/A | Score diff (offense perspective) |
| 311 | possession_team_score | integer | Required | N/A | Offense score |
| 312 | defensive_team_score | integer | Required | N/A | Defense score |
| 313 | total_home_score | integer | Required | N/A | Home team score |
| 314 | total_away_score | integer | Required | N/A | Away team score |
| 315 | game_half | string | Required | N/A | first_half/second_half/overtime |
| 316 | two_minute_warning_flag | boolean | Required | N/A | Within 2-minute warning |
| 317 | goal_to_go | boolean | Required | N/A | Goal-to-go situation |

### Play Type & Outcome (12 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 318 | play_type | string | Required | N/A | pass/run/punt/field_goal/kickoff/extra_point |
| 319 | play_description | text | Required | N/A | Full play-by-play text |
| 320 | yards_gained | integer | Required | N/A | Net yards gained |
| 321 | first_down_converted | boolean | Required | N/A | First down achieved |
| 322 | touchdown | boolean | Required | N/A | Touchdown scored |
| 323 | turnover | boolean | Required | N/A | Turnover occurred |
| 324 | turnover_type | string | Optional | N/A | interception/fumble/downs |
| 325 | penalty | boolean | Required | N/A | Penalty on play |
| 326 | penalty_team | string | Optional | N/A | Team penalized |
| 327 | penalty_type | string | Optional | N/A | Type of penalty |
| 328 | penalty_yards | integer | Optional | N/A | Penalty yardage |
| 329 | no_play | boolean | Required | N/A | Play nullified by penalty |

### Passing Play Details (15 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 330 | passer_player_id | string | Optional | N/A | QB player ID |
| 331 | passer_player_name | string | Optional | N/A | QB name |
| 332 | receiver_player_id | string | Optional | N/A | Receiver player ID |
| 333 | receiver_player_name | string | Optional | N/A | Receiver name |
| 334 | pass_location | string | Optional | N/A | left/middle/right |
| 335 | pass_depth | string | Optional | N/A | short/medium/deep |
| 336 | air_yards | integer | Optional | N/A | Yards in air |
| 337 | yards_after_catch | integer | Optional | N/A | YAC |
| 338 | pass_result | string | Optional | N/A | complete/incomplete/intercepted/sack |
| 339 | complete_pass | boolean | Optional | N/A | Completion flag |
| 340 | incomplete_pass | boolean | Optional | N/A | Incomplete flag |
| 341 | interception | boolean | Optional | N/A | INT flag |
| 342 | sack | boolean | Optional | N/A | Sack flag |
| 343 | qb_scramble | boolean | Optional | N/A | Scramble flag |
| 344 | touchdown_pass | boolean | Optional | N/A | TD pass flag |

### Rushing Play Details (8 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 345 | rusher_player_id | string | Optional | N/A | Rusher player ID |
| 346 | rusher_player_name | string | Optional | N/A | Rusher name |
| 347 | run_location | string | Optional | N/A | left/middle/right |
| 348 | run_gap | string | Optional | N/A | Specific gap |
| 349 | touchdown_rush | boolean | Optional | N/A | TD rush flag |
| 350 | fumble | boolean | Optional | N/A | Fumble flag |
| 351 | fumble_lost | boolean | Optional | N/A | Fumble lost flag |
| 352 | fumble_recovery_player_id | string | Optional | N/A | Player who recovered |

### Advanced Metrics (13 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 353 | epa | float | Optional | N/A | Expected Points Added |
| 354 | wpa | float | Optional | N/A | Win Probability Added |
| 355 | win_probability_before | float | Optional | N/A | WP before play |
| 356 | win_probability_after | float | Optional | N/A | WP after play |
| 357 | wp_delta | float | Optional | N/A | WP change |
| 358 | success | boolean | Optional | N/A | Successful play (EPA > 0) |
| 359 | explosive_play | boolean | Optional | N/A | 20+ yards |
| 360 | expected_yards | float | Optional | N/A | Expected yards gained |
| 361 | yards_over_expected | float | Optional | N/A | Yards - expected |
| 362 | qb_epa | float | Optional | N/A | QB-specific EPA |
| 363 | air_epa | float | Optional | N/A | Air yards EPA |
| 364 | yac_epa | float | Optional | N/A | YAC EPA |
| 365 | comp_prob | float | Optional | N/A | Completion probability |

---

## Section 5: Team Season Stats (120 fields)

### Core Team Identity (7 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 366 | team_id | string | Required | N/A | Team abbreviation |
| 367 | team_name | string | Required | N/A | Full team name |
| 368 | season | integer | Required | N/A | Season year |
| 369 | conference | string | Required | N/A | AFC/NFC |
| 370 | division | string | Required | N/A | East/West/North/South |
| 371 | head_coach | string | Required | N/A | Head coach name |
| 372 | stadium | string | Optional | N/A | Home stadium name |

### Team Record (14 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 373 | wins | integer | Required | N/A | Regular season wins |
| 374 | losses | integer | Required | N/A | Regular season losses |
| 375 | ties | integer | Required | N/A | Ties |
| 376 | win_pct | float | Required | N/A | Win percentage |
| 377 | division_finish | integer | Required | N/A | Division rank (1-4) |
| 378 | playoff_berth | boolean | Required | N/A | Made playoffs |
| 379 | playoff_seed | integer | Optional | N/A | Playoff seed (1-7) |
| 380 | playoff_wins | integer | Optional | N/A | Playoff wins |
| 381 | playoff_losses | integer | Optional | N/A | Playoff losses |
| 382 | playoff_round_reached | string | Optional | N/A | Best playoff round |
| 383 | super_bowl_appearance | boolean | Required | N/A | SB appearance |
| 384 | super_bowl_win | boolean | Required | N/A | SB win |
| 385 | points_for | integer | Required | N/A | Total points scored |
| 386 | points_against | integer | Required | N/A | Total points allowed |

### Team Offense (30 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 387 | total_yards | integer | Required | N/A | Total offense yards |
| 388 | total_yards_per_game | float | Required | N/A | Yards per game |
| 389 | total_yards_rank | integer | Optional | N/A | League rank |
| 390 | passing_yards | integer | Required | N/A | Passing yards |
| 391 | passing_yards_per_game | float | Required | N/A | Pass yards/game |
| 392 | passing_yards_rank | integer | Optional | N/A | League rank |
| 393 | pass_attempts | integer | Required | N/A | Pass attempts |
| 394 | pass_completions | integer | Required | N/A | Completions |
| 395 | pass_completion_pct | float | Required | N/A | Completion % |
| 396 | pass_touchdowns | integer | Required | N/A | Passing TDs |
| 397 | pass_interceptions | integer | Required | N/A | INTs thrown |
| 398 | pass_rating | float | Required | N/A | Team passer rating |
| 399 | sacks_allowed | integer | Required | N/A | Sacks allowed |
| 400 | sack_yards_allowed | integer | Required | N/A | Sack yards lost |
| 401 | rushing_yards | integer | Required | N/A | Rushing yards |
| 402 | rushing_yards_per_game | float | Required | N/A | Rush yards/game |
| 403 | rushing_yards_rank | integer | Optional | N/A | League rank |
| 404 | rush_attempts | integer | Required | N/A | Rush attempts |
| 405 | rush_yards_per_attempt | float | Required | N/A | Yards per carry |
| 406 | rush_touchdowns | integer | Required | N/A | Rushing TDs |
| 407 | fumbles_lost | integer | Required | N/A | Fumbles lost |
| 408 | turnovers | integer | Required | N/A | Total turnovers |
| 409 | first_downs | integer | Required | N/A | First downs |
| 410 | first_downs_passing | integer | Required | N/A | First downs passing |
| 411 | first_downs_rushing | integer | Required | N/A | First downs rushing |
| 412 | first_downs_penalty | integer | Required | N/A | First downs via penalty |
| 413 | third_down_attempts | integer | Required | N/A | 3rd down attempts |
| 414 | third_down_conversions | integer | Required | N/A | 3rd down conversions |
| 415 | third_down_pct | float | Required | N/A | 3rd down conversion % |
| 416 | red_zone_scoring_pct | float | Required | N/A | RZ scoring % |

### Team Defense (30 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 417 | def_total_yards_allowed | integer | Required | N/A | Total yards allowed |
| 418 | def_yards_allowed_per_game | float | Required | N/A | Yards/game allowed |
| 419 | def_total_yards_rank | integer | Optional | N/A | League rank |
| 420 | def_passing_yards_allowed | integer | Required | N/A | Pass yards allowed |
| 421 | def_pass_yards_per_game | float | Required | N/A | Pass yards/game allowed |
| 422 | def_pass_yards_rank | integer | Optional | N/A | League rank |
| 423 | def_pass_touchdowns_allowed | integer | Required | N/A | Pass TDs allowed |
| 424 | def_interceptions | integer | Required | N/A | INTs by defense |
| 425 | def_pass_rating_allowed | float | Required | N/A | Passer rating allowed |
| 426 | def_sacks | integer | Required | N/A | Sacks by defense |
| 427 | def_sack_yards | integer | Required | N/A | Sack yardage |
| 428 | def_qb_hits | integer | Optional | N/A | QB hits |
| 429 | def_rushing_yards_allowed | integer | Required | N/A | Rush yards allowed |
| 430 | def_rush_yards_per_game | float | Required | N/A | Rush yards/game allowed |
| 431 | def_rush_yards_rank | integer | Optional | N/A | League rank |
| 432 | def_rush_touchdowns_allowed | integer | Required | N/A | Rush TDs allowed |
| 433 | def_fumbles_forced | integer | Required | N/A | Fumbles forced |
| 434 | def_fumble_recoveries | integer | Required | N/A | Fumbles recovered |
| 435 | def_turnovers_gained | integer | Required | N/A | Turnovers gained |
| 436 | def_turnover_differential | integer | Required | N/A | +/- turnover margin |
| 437 | def_first_downs_allowed | integer | Required | N/A | First downs allowed |
| 438 | def_third_down_attempts | integer | Required | N/A | 3rd downs faced |
| 439 | def_third_down_conversions | integer | Required | N/A | 3rd downs allowed |
| 440 | def_third_down_pct | float | Required | N/A | 3rd down % allowed |
| 441 | def_red_zone_scoring_pct | float | Required | N/A | RZ scoring % allowed |
| 442 | def_safeties | integer | Required | N/A | Safeties scored |
| 443 | def_defensive_touchdowns | integer | Required | N/A | Defensive TDs |
| 444 | def_tackles_for_loss | integer | Optional | N/A | TFL |
| 445 | def_passes_defended | integer | Optional | N/A | Passes defended |
| 446 | def_points_allowed | integer | Required | N/A | Points allowed |

### Special Teams (15 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 447 | field_goals_made | integer | Required | N/A | FGs made |
| 448 | field_goals_attempted | integer | Required | N/A | FGs attempted |
| 449 | field_goal_pct | float | Required | N/A | FG percentage |
| 450 | extra_points_made | integer | Required | N/A | XPs made |
| 451 | extra_points_attempted | integer | Required | N/A | XPs attempted |
| 452 | punt_yards | integer | Required | N/A | Gross punt yards |
| 453 | punts | integer | Required | N/A | Number of punts |
| 454 | punt_average | float | Required | N/A | Yards per punt |
| 455 | net_punt_average | float | Required | N/A | Net punt average |
| 456 | kickoff_return_yards | integer | Required | N/A | KR yards |
| 457 | kickoff_return_average | float | Required | N/A | Average KR |
| 458 | punt_return_yards | integer | Required | N/A | PR yards |
| 459 | punt_return_average | float | Required | N/A | Average PR |
| 460 | special_teams_touchdowns | integer | Required | N/A | ST TDs |
| 461 | blocked_kicks | integer | Optional | N/A | Kicks blocked |

### Advanced Team Metrics (24 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 462 | pythagorean_wins | float | Optional | N/A | Expected wins |
| 463 | pythagorean_differential | float | Optional | N/A | Actual - expected |
| 464 | simple_rating_system | float | Optional | N/A | SRS rating |
| 465 | strength_of_schedule | float | Optional | N/A | SOS rating |
| 466 | margin_of_victory | float | Required | N/A | Avg point differential |
| 467 | dvoa_total | float | Optional | N/A | Total DVOA |
| 468 | dvoa_offense | float | Optional | N/A | Offensive DVOA |
| 469 | dvoa_defense | float | Optional | N/A | Defensive DVOA |
| 470 | dvoa_special_teams | float | Optional | N/A | ST DVOA |
| 471 | elo_rating_start | integer | Optional | N/A | Start of season ELO |
| 472 | elo_rating_end | integer | Optional | N/A | End of season ELO |
| 473 | elo_rating_max | integer | Optional | N/A | Max ELO during season |
| 474 | epa_per_play_offense | float | Optional | N/A | Offensive EPA/play |
| 475 | epa_per_play_defense | float | Optional | N/A | Defensive EPA/play |
| 476 | success_rate_offense | float | Optional | N/A | Offensive success rate |
| 477 | success_rate_defense | float | Optional | N/A | Defensive success rate |
| 478 | explosive_play_rate_offense | float | Optional | N/A | 20+ yard play % |
| 479 | explosive_play_rate_defense | float | Optional | N/A | 20+ yard plays allowed % |
| 480 | home_record | string | Optional | N/A | Home W-L-T |
| 481 | away_record | string | Optional | N/A | Away W-L-T |
| 482 | conference_record | string | Optional | N/A | Conference W-L-T |
| 483 | division_record | string | Optional | N/A | Division W-L-T |
| 484 | vs_winning_teams | string | Optional | N/A | W-L vs winning teams |
| 485 | one_score_games | integer | Optional | N/A | Games decided by 1 score |

---

## Section 6: All-Time Leaderboards (45 fields)

### Core Leaderboard Fields (5 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 486 | leaderboard_id | string | Required | N/A | Unique leaderboard ID |
| 487 | leaderboard_category | string | Required | N/A | Stat category |
| 488 | leaderboard_scope | string | Required | N/A | all_time/era/active/team/position |
| 489 | era_filter | string | Optional | N/A | Modern/Super Bowl/Merger etc. |
| 490 | position_filter | string | Optional | N/A | Position if position-specific |

### Leaderboard Entry Fields (10 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 491 | rank | integer | Required | N/A | Current rank |
| 492 | player_id | string | Required | N/A | Player identifier |
| 493 | player_name | string | Required | N/A | Player name |
| 494 | primary_team | string | Optional | N/A | Team most associated with |
| 495 | years_active | string | Required | N/A | Active years (e.g., 2000-2019) |
| 496 | stat_value | float | Required | N/A | Stat value |
| 497 | games_played | integer | Optional | N/A | Total games |
| 498 | seasons_played | integer | Optional | N/A | Total seasons |
| 499 | per_game_average | float | Optional | N/A | Stat per game |
| 500 | active_player | boolean | Required | N/A | Currently active |

### Passing Leaderboards (6 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 501 | passing_yards_leaderboard | array | Required | QB | All-time passing yards |
| 502 | passing_touchdowns_leaderboard | array | Required | QB | All-time passing TDs |
| 503 | passer_rating_leaderboard | array | Required | QB | Career passer rating (min attempts) |
| 504 | completions_leaderboard | array | Required | QB | All-time completions |
| 505 | pass_attempts_leaderboard | array | Required | QB | All-time attempts |
| 506 | wins_quarterback_leaderboard | array | Required | QB | QB wins |

### Rushing Leaderboards (4 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 507 | rushing_yards_leaderboard | array | Required | RB | All-time rushing yards |
| 508 | rushing_touchdowns_leaderboard | array | Required | RB | All-time rushing TDs |
| 509 | rushing_attempts_leaderboard | array | Required | RB | All-time carries |
| 510 | yards_per_carry_leaderboard | array | Required | RB | Career YPC (min attempts) |

### Receiving Leaderboards (5 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 511 | receiving_yards_leaderboard | array | Required | WR/TE | All-time receiving yards |
| 512 | receiving_touchdowns_leaderboard | array | Required | WR/TE | All-time receiving TDs |
| 513 | receptions_leaderboard | array | Required | WR/TE | All-time receptions |
| 514 | yards_per_reception_leaderboard | array | Required | WR/TE | Career YPC (min receptions) |
| 515 | yards_per_game_leaderboard | array | Required | WR/TE | Yards per game (min games) |

### Defensive Leaderboards (8 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 516 | sacks_leaderboard | array | Required | Defensive | All-time sacks |
| 517 | interceptions_leaderboard | array | Required | DB | All-time interceptions |
| 518 | tackles_leaderboard | array | Optional | Defensive | All-time tackles (limited data) |
| 519 | forced_fumbles_leaderboard | array | Required | Defensive | All-time forced fumbles |
| 520 | defensive_touchdowns_leaderboard | array | Required | Defensive | All-time defensive TDs |
| 521 | passes_defended_leaderboard | array | Optional | DB | All-time passes defended |
| 522 | safeties_leaderboard | array | Required | Defensive | All-time safeties |
| 523 | tackles_for_loss_leaderboard | array | Optional | Defensive | All-time TFL |

### Team Leaderboards (7 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 524 | team_wins_leaderboard | array | Required | N/A | All-time team wins |
| 525 | team_win_pct_leaderboard | array | Required | N/A | All-time win % |
| 526 | super_bowl_wins_leaderboard | array | Required | N/A | SB championships |
| 527 | playoff_appearances_leaderboard | array | Required | N/A | Playoff appearances |
| 528 | points_scored_leaderboard | array | Required | N/A | All-time points |
| 529 | championships_leaderboard | array | Required | N/A | All championships (pre + post SB) |
| 530 | division_titles_leaderboard | array | Required | N/A | Division titles |

---

## Section 7: Historical Context & Metadata (40 fields)

### Era Definitions (8 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 531 | era_id | string | Required | N/A | Era identifier |
| 532 | era_name | string | Required | N/A | Era name |
| 533 | era_start_year | integer | Required | N/A | Start year |
| 534 | era_end_year | integer | Optional | N/A | End year (null if current) |
| 535 | era_description | text | Required | N/A | Era characteristics |
| 536 | era_rule_changes | array | Optional | N/A | Major rule changes |
| 537 | era_dominant_teams | array | Optional | N/A | Dynasties during era |
| 538 | era_dominant_players | array | Optional | N/A | Iconic players |

### Season Context (10 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 539 | season | integer | Required | N/A | Season year |
| 540 | season_games_per_team | integer | Required | N/A | Games in season (14/16/17/18) |
| 541 | season_playoff_format | string | Required | N/A | Playoff structure |
| 542 | season_rule_changes | array | Optional | N/A | Rule changes this season |
| 543 | season_expansion_teams | array | Optional | N/A | Expansion teams added |
| 544 | season_realignment | boolean | Optional | N/A | Division realignment |
| 545 | season_work_stoppage | boolean | Optional | N/A | Strike or lockout |
| 546 | season_mvp | string | Optional | N/A | MVP winner |
| 547 | season_super_bowl_winner | string | Optional | N/A | SB champion |
| 548 | season_super_bowl_mvp | string | Optional | N/A | SB MVP |

### Awards & Recognition (12 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 549 | award_season | integer | Required | N/A | Season for award |
| 550 | award_type | string | Required | N/A | MVP/OPOY/DPOY/OROY/DROY/CPOY |
| 551 | award_winner_id | string | Required | N/A | Player ID |
| 552 | award_winner_name | string | Required | N/A | Player name |
| 553 | award_runner_up | string | Optional | N/A | Second place |
| 554 | all_pro_first_team | array | Required | N/A | First team selections |
| 555 | all_pro_second_team | array | Required | N/A | Second team selections |
| 556 | pro_bowl_roster | array | Required | N/A | Pro Bowl selections |
| 557 | all_rookie_team | array | Optional | N/A | All-Rookie team |
| 558 | offensive_rookie_of_year | string | Required | N/A | OROY winner |
| 559 | defensive_rookie_of_year | string | Required | N/A | DROY winner |
| 560 | comeback_player_of_year | string | Optional | N/A | CPOY winner |

### Hall of Fame (10 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 561 | hof_induction_year | integer | Required | N/A | Year inducted |
| 562 | hof_inductee_id | string | Required | N/A | Player/coach ID |
| 563 | hof_inductee_name | string | Required | N/A | Inductee name |
| 564 | hof_inductee_position | string | Required | N/A | Position/role |
| 565 | hof_primary_team | string | Optional | N/A | Primary team |
| 566 | hof_years_active | string | Required | N/A | Years active |
| 567 | hof_class_size | integer | Required | N/A | Size of HOF class |
| 568 | hof_enshrinement_speech | text | Optional | N/A | Speech text/link |
| 569 | hof_presenter | string | Optional | N/A | Who presented |
| 570 | hof_bust_image_url | string | Optional | N/A | Bust image |

---

## Section 8: Advanced Analytics (35 fields)

### EPA (Expected Points Added) (8 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 571 | epa_total | float | Optional | All | Total EPA |
| 572 | epa_per_play | float | Optional | All | EPA per play |
| 573 | epa_passing | float | Optional | QB | Passing EPA |
| 574 | epa_rushing | float | Optional | RB/QB | Rushing EPA |
| 575 | epa_receiving | float | Optional | WR/TE/RB | Receiving EPA |
| 576 | epa_defense | float | Optional | Defensive | Defensive EPA |
| 577 | epa_rank | integer | Optional | All | League rank |
| 578 | epa_percentile | float | Optional | All | Percentile rank |

### DVOA (Defense-adjusted Value Over Average) (6 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 579 | dvoa_total | float | Optional | All | Total DVOA |
| 580 | dvoa_passing | float | Optional | QB | Passing DVOA |
| 581 | dvoa_rushing | float | Optional | RB | Rushing DVOA |
| 582 | dvoa_receiving | float | Optional | WR/TE | Receiving DVOA |
| 583 | dvoa_rank | integer | Optional | All | League rank |
| 584 | dvoa_percentile | float | Optional | All | Percentile rank |

### Success Rate (5 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 585 | success_rate_overall | float | Optional | All | Overall success rate |
| 586 | success_rate_passing | float | Optional | QB | Passing success rate |
| 587 | success_rate_rushing | float | Optional | RB | Rushing success rate |
| 588 | success_rate_early_downs | float | Optional | All | 1st/2nd down success |
| 589 | success_rate_late_downs | float | Optional | All | 3rd/4th down success |

### Win Probability (4 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 590 | wpa_total | float | Optional | All | Total WPA |
| 591 | wpa_per_play | float | Optional | All | WPA per play |
| 592 | clutch_wpa | float | Optional | All | High-leverage WPA |
| 593 | clutch_plays | integer | Optional | All | Number of clutch plays |

### Next Gen Stats (12 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 594 | time_to_throw | float | Optional | QB | Avg time to throw (2016+) |
| 595 | avg_completed_air_yards | float | Optional | QB | aDOT on completions (2016+) |
| 596 | avg_intended_air_yards | float | Optional | QB | aDOT on attempts (2016+) |
| 597 | aggressiveness_pct | float | Optional | QB | Tight window % (2016+) |
| 598 | max_completion_air_distance | float | Optional | QB | Longest air yards (2016+) |
| 599 | avg_separation | float | Optional | WR | Avg separation (2016+) |
| 600 | avg_cushion | float | Optional | WR | Avg cushion at snap (2016+) |
| 601 | pct_share_of_team_air_yards | float | Optional | WR | Air yards share (2016+) |
| 602 | avg_time_to_los | float | Optional | RB | Time to line of scrimmage (2016+) |
| 603 | efficiency_rating | float | Optional | RB | NGS efficiency (2016+) |
| 604 | rush_yards_over_expected | float | Optional | RB | RYOE (2016+) |
| 605 | avg_rush_yards | float | Optional | RB | Avg yards per rush (2016+) |

---

## Section 9: Situational Splits (200 fields)

### Home/Away Splits (20 fields - 10 per split)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 606 | home_games | integer | Optional | All | Games at home |
| 607 | home_pass_yards | integer | Optional | QB | Home passing yards |
| 608 | home_pass_tds | integer | Optional | QB | Home passing TDs |
| 609 | home_rush_yards | integer | Optional | RB | Home rushing yards |
| 610 | home_rush_tds | integer | Optional | RB | Home rushing TDs |
| 611 | home_rec_yards | integer | Optional | WR/TE | Home receiving yards |
| 612 | home_rec_tds | integer | Optional | WR/TE | Home receiving TDs |
| 613 | home_tackles | integer | Optional | Defensive | Home tackles |
| 614 | home_sacks | float | Optional | Defensive | Home sacks |
| 615 | home_ints | integer | Optional | DB | Home interceptions |
| 616 | away_games | integer | Optional | All | Games on road |
| 617 | away_pass_yards | integer | Optional | QB | Away passing yards |
| 618 | away_pass_tds | integer | Optional | QB | Away passing TDs |
| 619 | away_rush_yards | integer | Optional | RB | Away rushing yards |
| 620 | away_rush_tds | integer | Optional | RB | Away rushing TDs |
| 621 | away_rec_yards | integer | Optional | WR/TE | Away receiving yards |
| 622 | away_rec_tds | integer | Optional | WR/TE | Away receiving TDs |
| 623 | away_tackles | integer | Optional | Defensive | Away tackles |
| 624 | away_sacks | float | Optional | Defensive | Away sacks |
| 625 | away_ints | integer | Optional | DB | Away interceptions |

### By Quarter (40 fields - 10 per quarter)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 626 | q1_pass_yards | integer | Optional | QB | Q1 passing yards |
| 627 | q1_pass_tds | integer | Optional | QB | Q1 passing TDs |
| 628 | q1_rush_yards | integer | Optional | RB | Q1 rushing yards |
| 629 | q1_rush_tds | integer | Optional | RB | Q1 rushing TDs |
| 630 | q1_rec_yards | integer | Optional | WR/TE | Q1 receiving yards |
| 631 | q1_rec_tds | integer | Optional | WR/TE | Q1 receiving TDs |
| 632 | q1_tackles | integer | Optional | Defensive | Q1 tackles |
| 633 | q1_sacks | float | Optional | Defensive | Q1 sacks |
| 634 | q1_ints | integer | Optional | DB | Q1 interceptions |
| 635 | q1_points | integer | Optional | All | Q1 points (team) |
| 636 | q2_pass_yards | integer | Optional | QB | Q2 passing yards |
| 637 | q2_pass_tds | integer | Optional | QB | Q2 passing TDs |
| 638 | q2_rush_yards | integer | Optional | RB | Q2 rushing yards |
| 639 | q2_rush_tds | integer | Optional | RB | Q2 rushing TDs |
| 640 | q2_rec_yards | integer | Optional | WR/TE | Q2 receiving yards |
| 641 | q2_rec_tds | integer | Optional | WR/TE | Q2 receiving TDs |
| 642 | q2_tackles | integer | Optional | Defensive | Q2 tackles |
| 643 | q2_sacks | float | Optional | Defensive | Q2 sacks |
| 644 | q2_ints | integer | Optional | DB | Q2 interceptions |
| 645 | q2_points | integer | Optional | All | Q2 points (team) |
| 646 | q3_pass_yards | integer | Optional | QB | Q3 passing yards |
| 647 | q3_pass_tds | integer | Optional | QB | Q3 passing TDs |
| 648 | q3_rush_yards | integer | Optional | RB | Q3 rushing yards |
| 649 | q3_rush_tds | integer | Optional | RB | Q3 rushing TDs |
| 650 | q3_rec_yards | integer | Optional | WR/TE | Q3 receiving yards |
| 651 | q3_rec_tds | integer | Optional | WR/TE | Q3 receiving TDs |
| 652 | q3_tackles | integer | Optional | Defensive | Q3 tackles |
| 653 | q3_sacks | float | Optional | Defensive | Q3 sacks |
| 654 | q3_ints | integer | Optional | DB | Q3 interceptions |
| 655 | q3_points | integer | Optional | All | Q3 points (team) |
| 656 | q4_pass_yards | integer | Optional | QB | Q4 passing yards |
| 657 | q4_pass_tds | integer | Optional | QB | Q4 passing TDs |
| 658 | q4_rush_yards | integer | Optional | RB | Q4 rushing yards |
| 659 | q4_rush_tds | integer | Optional | RB | Q4 rushing TDs |
| 660 | q4_rec_yards | integer | Optional | WR/TE | Q4 receiving yards |
| 661 | q4_rec_tds | integer | Optional | WR/TE | Q4 receiving TDs |
| 662 | q4_tackles | integer | Optional | Defensive | Q4 tackles |
| 663 | q4_sacks | float | Optional | Defensive | Q4 sacks |
| 664 | q4_ints | integer | Optional | DB | Q4 interceptions |
| 665 | q4_points | integer | Optional | All | Q4 points (team) |

### Down & Distance (30 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 666 | first_down_plays | integer | Optional | All | Plays on 1st down |
| 667 | first_down_pass_yards | integer | Optional | QB | 1st down passing yards |
| 668 | first_down_pass_tds | integer | Optional | QB | 1st down passing TDs |
| 669 | first_down_rush_yards | integer | Optional | RB | 1st down rushing yards |
| 670 | first_down_rush_tds | integer | Optional | RB | 1st down rushing TDs |
| 671 | first_down_success_rate | float | Optional | All | 1st down success rate |
| 672 | second_down_plays | integer | Optional | All | Plays on 2nd down |
| 673 | second_down_pass_yards | integer | Optional | QB | 2nd down passing yards |
| 674 | second_down_pass_tds | integer | Optional | QB | 2nd down passing TDs |
| 675 | second_down_rush_yards | integer | Optional | RB | 2nd down rushing yards |
| 676 | second_down_rush_tds | integer | Optional | RB | 2nd down rushing TDs |
| 677 | second_down_success_rate | float | Optional | All | 2nd down success rate |
| 678 | third_down_plays | integer | Optional | All | Plays on 3rd down |
| 679 | third_down_pass_yards | integer | Optional | QB | 3rd down passing yards |
| 680 | third_down_pass_tds | integer | Optional | QB | 3rd down passing TDs |
| 681 | third_down_rush_yards | integer | Optional | RB | 3rd down rushing yards |
| 682 | third_down_rush_tds | integer | Optional | RB | 3rd down rushing TDs |
| 683 | third_down_conversions | integer | Optional | All | 3rd down conversions |
| 684 | third_down_conversion_rate | float | Optional | All | 3rd down conversion % |
| 685 | fourth_down_plays | integer | Optional | All | Plays on 4th down |
| 686 | fourth_down_pass_yards | integer | Optional | QB | 4th down passing yards |
| 687 | fourth_down_pass_tds | integer | Optional | QB | 4th down passing TDs |
| 688 | fourth_down_rush_yards | integer | Optional | RB | 4th down rushing yards |
| 689 | fourth_down_rush_tds | integer | Optional | RB | 4th down rushing TDs |
| 690 | fourth_down_conversions | integer | Optional | All | 4th down conversions |
| 691 | fourth_down_conversion_rate | float | Optional | All | 4th down conversion % |
| 692 | short_yardage_plays | integer | Optional | All | 3rd/4th & short |
| 693 | short_yardage_conversions | integer | Optional | All | Short yardage conversions |
| 694 | long_yardage_plays | integer | Optional | All | 3rd/4th & 7+ |
| 695 | long_yardage_conversions | integer | Optional | All | Long yardage conversions |

### Field Position (30 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 696 | own_half_plays | integer | Optional | All | Plays on own half |
| 697 | own_half_pass_yards | integer | Optional | QB | Own half passing yards |
| 698 | own_half_rush_yards | integer | Optional | RB | Own half rushing yards |
| 699 | own_half_success_rate | float | Optional | All | Own half success rate |
| 700 | opp_half_plays | integer | Optional | All | Plays on opponent half |
| 701 | opp_half_pass_yards | integer | Optional | QB | Opp half passing yards |
| 702 | opp_half_rush_yards | integer | Optional | RB | Opp half rushing yards |
| 703 | opp_half_success_rate | float | Optional | All | Opp half success rate |
| 704 | red_zone_plays | integer | Optional | All | Red zone plays |
| 705 | red_zone_pass_attempts | integer | Optional | QB | RZ pass attempts |
| 706 | red_zone_pass_tds | integer | Optional | QB | RZ passing TDs |
| 707 | red_zone_pass_completion_pct | float | Optional | QB | RZ completion % |
| 708 | red_zone_rush_attempts | integer | Optional | RB | RZ rush attempts |
| 709 | red_zone_rush_tds | integer | Optional | RB | RZ rushing TDs |
| 710 | red_zone_rush_yards_per_attempt | float | Optional | RB | RZ yards per carry |
| 711 | red_zone_targets | integer | Optional | WR/TE | RZ targets |
| 712 | red_zone_receptions | integer | Optional | WR/TE | RZ receptions |
| 713 | red_zone_rec_tds | integer | Optional | WR/TE | RZ receiving TDs |
| 714 | red_zone_scoring_rate | float | Optional | All | RZ TD % |
| 715 | goal_to_go_plays | integer | Optional | All | Goal-to-go situations |
| 716 | goal_to_go_rush_tds | integer | Optional | RB | GTG rushing TDs |
| 717 | goal_to_go_pass_tds | integer | Optional | QB | GTG passing TDs |
| 718 | goal_to_go_rec_tds | integer | Optional | WR/TE | GTG receiving TDs |
| 719 | midfield_plays | integer | Optional | All | Plays near midfield (40-50) |
| 720 | midfield_pass_yards | integer | Optional | QB | Midfield passing yards |
| 721 | midfield_rush_yards | integer | Optional | RB | Midfield rushing yards |
| 722 | deep_field_plays | integer | Optional | All | Plays in own 20 |
| 723 | deep_field_pass_yards | integer | Optional | QB | Own 20 passing yards |
| 724 | deep_field_rush_yards | integer | Optional | RB | Own 20 rushing yards |
| 725 | deep_field_turnovers | integer | Optional | All | Turnovers in own 20 |

### Score Differential (30 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 726 | tied_plays | integer | Optional | All | Plays when tied |
| 727 | tied_pass_yards | integer | Optional | QB | Pass yards when tied |
| 728 | tied_rush_yards | integer | Optional | RB | Rush yards when tied |
| 729 | tied_success_rate | float | Optional | All | Success rate when tied |
| 730 | leading_plays | integer | Optional | All | Plays when leading |
| 731 | leading_pass_yards | integer | Optional | QB | Pass yards when leading |
| 732 | leading_rush_yards | integer | Optional | RB | Rush yards when leading |
| 733 | leading_success_rate | float | Optional | All | Success rate when leading |
| 734 | trailing_plays | integer | Optional | All | Plays when trailing |
| 735 | trailing_pass_yards | integer | Optional | QB | Pass yards when trailing |
| 736 | trailing_rush_yards | integer | Optional | RB | Rush yards when trailing |
| 737 | trailing_success_rate | float | Optional | All | Success rate when trailing |
| 738 | one_score_game_plays | integer | Optional | All | Plays in 1-score games |
| 739 | one_score_pass_yards | integer | Optional | QB | Pass yards 1-score games |
| 740 | one_score_rush_yards | integer | Optional | RB | Rush yards 1-score games |
| 741 | one_score_success_rate | float | Optional | All | Success rate 1-score games |
| 742 | blowout_plays | integer | Optional | All | Plays in blowouts (14+ pts) |
| 743 | blowout_pass_yards | integer | Optional | QB | Pass yards in blowouts |
| 744 | blowout_rush_yards | integer | Optional | RB | Rush yards in blowouts |
| 745 | blowout_success_rate | float | Optional | All | Success rate in blowouts |
| 746 | clutch_plays | integer | Optional | All | High-leverage situations |
| 747 | clutch_pass_yards | integer | Optional | QB | Clutch passing yards |
| 748 | clutch_pass_tds | integer | Optional | QB | Clutch passing TDs |
| 749 | clutch_rush_yards | integer | Optional | RB | Clutch rushing yards |
| 750 | clutch_rush_tds | integer | Optional | RB | Clutch rushing TDs |
| 751 | clutch_rec_yards | integer | Optional | WR/TE | Clutch receiving yards |
| 752 | clutch_rec_tds | integer | Optional | WR/TE | Clutch receiving TDs |
| 753 | clutch_success_rate | float | Optional | All | Clutch success rate |
| 754 | game_winning_drives | integer | Optional | QB | Game-winning drives led |
| 755 | fourth_quarter_comebacks | integer | Optional | QB | 4Q comebacks |

### By Opponent Type (20 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 756 | vs_winning_teams_games | integer | Optional | All | Games vs winning teams |
| 757 | vs_winning_pass_yards | integer | Optional | QB | Pass yards vs winning teams |
| 758 | vs_winning_rush_yards | integer | Optional | RB | Rush yards vs winning teams |
| 759 | vs_winning_rec_yards | integer | Optional | WR/TE | Rec yards vs winning teams |
| 760 | vs_winning_tackles | integer | Optional | Defensive | Tackles vs winning teams |
| 761 | vs_losing_teams_games | integer | Optional | All | Games vs losing teams |
| 762 | vs_losing_pass_yards | integer | Optional | QB | Pass yards vs losing teams |
| 763 | vs_losing_rush_yards | integer | Optional | RB | Rush yards vs losing teams |
| 764 | vs_losing_rec_yards | integer | Optional | WR/TE | Rec yards vs losing teams |
| 765 | vs_losing_tackles | integer | Optional | Defensive | Tackles vs losing teams |
| 766 | vs_division_games | integer | Optional | All | Division games |
| 767 | vs_division_pass_yards | integer | Optional | QB | Division pass yards |
| 768 | vs_division_rush_yards | integer | Optional | RB | Division rush yards |
| 769 | vs_division_rec_yards | integer | Optional | WR/TE | Division rec yards |
| 770 | vs_division_tackles | integer | Optional | Defensive | Division tackles |
| 771 | vs_conference_games | integer | Optional | All | Conference games |
| 772 | vs_conference_pass_yards | integer | Optional | QB | Conference pass yards |
| 773 | vs_conference_rush_yards | integer | Optional | RB | Conference rush yards |
| 774 | vs_conference_rec_yards | integer | Optional | WR/TE | Conference rec yards |
| 775 | vs_conference_tackles | integer | Optional | Defensive | Conference tackles |

### Weather & Surface (30 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 776 | outdoor_games | integer | Optional | All | Outdoor games |
| 777 | outdoor_pass_yards | integer | Optional | QB | Outdoor passing yards |
| 778 | outdoor_rush_yards | integer | Optional | RB | Outdoor rushing yards |
| 779 | outdoor_rec_yards | integer | Optional | WR/TE | Outdoor receiving yards |
| 780 | indoor_games | integer | Optional | All | Indoor/dome games |
| 781 | indoor_pass_yards | integer | Optional | QB | Indoor passing yards |
| 782 | indoor_rush_yards | integer | Optional | RB | Indoor rushing yards |
| 783 | indoor_rec_yards | integer | Optional | WR/TE | Indoor receiving yards |
| 784 | clear_weather_games | integer | Optional | All | Clear weather games |
| 785 | clear_pass_yards | integer | Optional | QB | Clear weather pass yards |
| 786 | rain_games | integer | Optional | All | Rain games |
| 787 | rain_pass_yards | integer | Optional | QB | Rain passing yards |
| 788 | rain_rush_yards | integer | Optional | RB | Rain rushing yards |
| 789 | snow_games | integer | Optional | All | Snow games |
| 790 | snow_pass_yards | integer | Optional | QB | Snow passing yards |
| 791 | snow_rush_yards | integer | Optional | RB | Snow rushing yards |
| 792 | cold_games | integer | Optional | All | Cold weather (< 32°F) |
| 793 | cold_pass_yards | integer | Optional | QB | Cold weather pass yards |
| 794 | cold_rush_yards | integer | Optional | RB | Cold weather rush yards |
| 795 | wind_games | integer | Optional | All | High wind games (15+ mph) |
| 796 | wind_pass_yards | integer | Optional | QB | High wind pass yards |
| 797 | wind_rush_yards | integer | Optional | RB | High wind rush yards |
| 798 | grass_games | integer | Optional | All | Grass surface games |
| 799 | grass_pass_yards | integer | Optional | QB | Grass passing yards |
| 800 | grass_rush_yards | integer | Optional | RB | Grass rushing yards |
| 801 | turf_games | integer | Optional | All | Turf surface games |
| 802 | turf_pass_yards | integer | Optional | QB | Turf passing yards |
| 803 | turf_rush_yards | integer | Optional | RB | Turf rushing yards |
| 804 | turf_rec_yards | integer | Optional | WR/TE | Turf receiving yards |
| 805 | turf_tackles | integer | Optional | Defensive | Turf tackles |

---

## Section 10: Awards & Accolades (50 fields)

### Individual Season Awards (15 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 806 | season_mvp | boolean | Optional | All | MVP winner |
| 807 | season_mvp_votes | integer | Optional | All | MVP votes received |
| 808 | season_opoy | boolean | Optional | Offensive | OPOY winner |
| 809 | season_dpoy | boolean | Optional | Defensive | DPOY winner |
| 810 | season_oroy | boolean | Optional | Offensive | OROY winner |
| 811 | season_droy | boolean | Optional | Defensive | DROY winner |
| 812 | season_cpoy | boolean | Optional | All | Comeback POY winner |
| 813 | season_all_pro_first | boolean | Optional | All | First-Team All-Pro |
| 814 | season_all_pro_second | boolean | Optional | All | Second-Team All-Pro |
| 815 | season_pro_bowl | boolean | Optional | All | Pro Bowl selection |
| 816 | season_pro_bowl_alternate | boolean | Optional | All | Pro Bowl alternate |
| 817 | season_all_rookie_team | boolean | Optional | All | All-Rookie team |
| 818 | season_passing_leader | boolean | Optional | QB | Passing yards leader |
| 819 | season_rushing_leader | boolean | Optional | RB | Rushing yards leader |
| 820 | season_receiving_leader | boolean | Optional | WR/TE | Receiving yards leader |

### Playoff & Super Bowl Awards (10 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 821 | super_bowl_mvp | boolean | Optional | All | SB MVP winner |
| 822 | super_bowl_mvp_season | integer | Optional | All | Season of SB MVP |
| 823 | super_bowl_champion | boolean | Optional | All | SB champion |
| 824 | super_bowl_appearances | integer | Optional | All | Total SB appearances |
| 825 | conference_championship_mvp | boolean | Optional | All | Conference champ MVP |
| 826 | playoff_mvp_honors | integer | Optional | All | Playoff MVP recognitions |
| 827 | super_bowl_ring_count | integer | Optional | All | Total SB rings |
| 828 | playoff_statistical_leader | boolean | Optional | All | Led playoffs in category |
| 829 | playoff_record_holder | boolean | Optional | All | Holds playoff record |
| 830 | super_bowl_record_holder | boolean | Optional | All | Holds SB record |

### Career Honors (15 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 831 | hall_of_fame_status | string | Optional | All | inducted/eligible/not_eligible |
| 832 | hof_induction_year | integer | Optional | All | Year inducted |
| 833 | hof_first_ballot | boolean | Optional | All | First-ballot HOF |
| 834 | hof_vote_percentage | float | Optional | All | % votes received |
| 835 | pro_football_reference_hof_monitor | float | Optional | All | HOF likelihood score |
| 836 | jersey_retired | boolean | Optional | All | Jersey retired |
| 837 | jersey_retired_team | string | Optional | All | Team that retired jersey |
| 838 | team_ring_of_honor | boolean | Optional | All | Ring of Honor |
| 839 | team_ring_of_honor_teams | array | Optional | All | Teams with ROH honor |
| 840 | nfl_anniversary_team_50 | boolean | Optional | All | 50th Anniversary Team |
| 841 | nfl_anniversary_team_75 | boolean | Optional | All | 75th Anniversary Team |
| 842 | nfl_anniversary_team_100 | boolean | Optional | All | 100th Anniversary Team |
| 843 | all_decade_teams | array | Optional | All | Decade teams (e.g., ["1970s", "1980s"]) |
| 844 | franchise_all_time_team | boolean | Optional | All | Franchise all-time team |
| 845 | nfl_records_held | array | Optional | All | NFL records held |

### Team Awards (5 fields)

| # | Field Name | Data Type | Required | Position | Notes |
|---|------------|-----------|----------|----------|-------|
| 846 | team_mvp | boolean | Optional | All | Team MVP |
| 847 | team_offensive_player_of_year | boolean | Optional | Offensive | Team OPOY |
| 848 | team_defensive_player_of_year | boolean | Optional | Defensive | Team DPOY |
| 849 | team_rookie_of_year | boolean | Optional | All | Team ROY |
| 850 | team_awards_total | integer | Optional | All | Total team awards |

---

## Summary

**Total Fields: 850**

### Fields by Section:
1. Player Season Stats: 95 fields
2. Player Game Logs: 85 fields
3. Player Career Aggregates: 110 fields
4. Play-by-Play Data: 75 fields
5. Team Season Stats: 120 fields
6. All-Time Leaderboards: 45 fields
7. Historical Context & Metadata: 40 fields
8. Advanced Analytics: 35 fields
9. Situational Splits: 200 fields
10. Awards & Accolades: 50 fields

### Coverage Period:
- **1970-2024** (54 NFL seasons)
- Limited historical data for some categories (tackles, Next Gen Stats)
- Full coverage for traditional stats (passing, rushing, receiving)

### Data Granularity:
- **Season-level**: Career and yearly aggregates
- **Game-level**: Individual game performances
- **Play-level**: Individual play records with advanced metrics

### Position-Specific Fields:
- **QB**: 100+ fields
- **RB**: 80+ fields
- **WR/TE**: 85+ fields
- **Defensive**: 75+ fields
- **All positions**: 200+ universal fields

---

**Next Steps:**
1. Map each field to data sources (data-source-for-historical-stats.json)
2. Calculate actual coverage percentages per field
3. Identify gaps and plan data acquisition
4. Create implementation roadmap in master report

**Status:** Field inventory complete - ready for data source mapping
