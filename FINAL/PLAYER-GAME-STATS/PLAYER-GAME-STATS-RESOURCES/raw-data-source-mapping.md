# Player Game Stats Table - Raw Data Source Mapping

> **Purpose**: Maps each database field to its raw data source
> **Date Generated**: October 22, 2025
> **Data Source**: ESPN API Game Summary (`/summary?event={game_id}`)

---

## Field-by-Field Source Mapping

### Identification Fields (6 columns)

**⚠️ IMPORTANT**: The `position` field does NOT exist in `player_game_stats` table. See "Missing Fields" section at end of this document.

#### 1. player_id
- **Database Column**: `player_id`
- **Data Type**: VARCHAR(50)
- **Raw Source**: ESPN API boxscore
- **API Path**: `boxscore.players[].statistics[].athletes[].athlete.id`
- **Transformation**: Prefix with "espn-"
- **Example Raw**: `"4361529"`
- **Example Stored**: `"espn-4361529"`
- **Script**: `game-stats-scraper.js` line 357

#### 2. game_id
- **Database Column**: `game_id`
- **Data Type**: VARCHAR(50)
- **Raw Source**: Function parameter
- **API Path**: N/A (passed to function)
- **Transformation**: Prefix with "espn-"
- **Example Raw**: `"401772510"`
- **Example Stored**: `"espn-401772510"`
- **Script**: `game-stats-scraper.js` line 364

#### 3. season
- **Database Column**: `season`
- **Data Type**: INTEGER
- **Raw Source**: Global constant
- **API Path**: N/A (configured value)
- **Transformation**: None (direct)
- **Example Raw**: `2025`
- **Example Stored**: `2025`
- **Script**: `game-stats-scraper.js` line 365

#### 4. team_id
- **Database Column**: `team_id`
- **Data Type**: VARCHAR(10)
- **Raw Source**: ESPN API boxscore
- **API Path**: `boxscore.players[].team.abbreviation`
- **Transformation**: None (direct)
- **Example Raw**: `"SEA"`
- **Example Stored**: `"SEA"`
- **Script**: `game-stats-scraper.js` line 330

#### 5. position
- **Database Column**: `position`
- **Data Type**: VARCHAR(10)
- **Raw Source**: ESPN API athlete position
- **API Path**: `boxscore.players[].statistics[].athletes[].athlete.position.abbreviation`
- **Transformation**: None (direct, null if missing)
- **Example Raw**: `"QB"`
- **Example Stored**: `"QB"`
- **Script**: Player position extracted from athlete object
- **Note**: This is game-specific position (e.g., QB filling in at RB)

---

### Passing Stats (14 columns)

#### 6. passing_attempts
- **Database Column**: `passing_attempts`
- **Data Type**: INTEGER
- **Raw Source**: ESPN passing category
- **API Path**: `statistics[name="passing"].athletes[].stats[0]` (second part of "C/ATT")
- **Transformation**: Parse "18/26" → 26
- **Example Raw**: `"18/26"`
- **Example Stored**: `26`
- **Script**: `game-stats-scraper.js` line 440

#### 7. passing_completions
- **Database Column**: `passing_completions`
- **Data Type**: INTEGER
- **Raw Source**: ESPN passing category
- **API Path**: `statistics[name="passing"].athletes[].stats[0]` (first part of "C/ATT")
- **Transformation**: Parse "18/26" → 18
- **Example Raw**: `"18/26"`
- **Example Stored**: `18`
- **Script**: `game-stats-scraper.js` line 439

#### 8. passing_yards
- **Database Column**: `passing_yards`
- **Data Type**: INTEGER
- **Raw Source**: ESPN passing category
- **API Path**: `statistics[name="passing"].athletes[].stats[1]`
- **Transformation**: parseInt()
- **Example Raw**: `"289"`
- **Example Stored**: `289`
- **Script**: `game-stats-scraper.js` line 441
- **Labels**: `["C/ATT", "YDS", "AVG", "TD", "INT", "SACKS", "QBR", "RTG"]`

#### 9. passing_touchdowns
- **Database Column**: `passing_touchdowns`
- **Data Type**: INTEGER
- **Raw Source**: ESPN passing category
- **API Path**: `statistics[name="passing"].athletes[].stats[3]`
- **Transformation**: parseInt()
- **Example Raw**: `"3"`
- **Example Stored**: `3`
- **Script**: `game-stats-scraper.js` line 442

#### 10. passing_interceptions
- **Database Column**: `passing_interceptions`
- **Data Type**: INTEGER
- **Raw Source**: ESPN passing category
- **API Path**: `statistics[name="passing"].athletes[].stats[4]`
- **Transformation**: parseInt()
- **Example Raw**: `"1"`
- **Example Stored**: `1`
- **Script**: `game-stats-scraper.js` line 443

#### 11. passing_sacks
- **Database Column**: `passing_sacks`
- **Data Type**: INTEGER
- **Raw Source**: ESPN passing category
- **API Path**: `statistics[name="passing"].athletes[].stats[5]`
- **Transformation**: parseInt()
- **Example Raw**: `"2"`
- **Example Stored**: `2`
- **Script**: `game-stats-scraper.js` line 444

#### 12. passing_sack_yards
- **Database Column**: `passing_sack_yards`
- **Data Type**: INTEGER
- **Raw Source**: Calculated from sacks
- **API Path**: N/A (derived)
- **Transformation**: sacks × 7 (estimate)
- **Example Raw**: `2 sacks`
- **Example Stored**: `14`
- **Script**: `game-stats-scraper.js` line 446
- **Note**: ESPN doesn't provide sack yards directly

#### 13. passing_rating
- **Database Column**: `passing_rating`
- **Data Type**: DECIMAL
- **Raw Source**: ESPN passing category
- **API Path**: `statistics[name="passing"].athletes[].stats[7]`
- **Transformation**: parseFloat()
- **Example Raw**: `"108.5"`
- **Example Stored**: `108.5`
- **Script**: `game-stats-scraper.js` line 448
- **Note**: Official NFL passer rating formula

#### 14. passing_qbr
- **Database Column**: `passing_qbr`
- **Data Type**: DECIMAL
- **Raw Source**: ESPN passing category
- **API Path**: `statistics[name="passing"].athletes[].stats[6]`
- **Transformation**: parseFloat()
- **Example Raw**: `"72.3"`
- **Example Stored**: `72.3`
- **Script**: `game-stats-scraper.js` line 447
- **Note**: ESPN's Total QBR metric

#### 15. passing_completion_percentage
- **Database Column**: `passing_completion_percentage`
- **Data Type**: DECIMAL
- **Raw Source**: Calculated
- **API Path**: N/A (derived from completions/attempts)
- **Transformation**: (completions / attempts) × 100
- **Example Raw**: `18/26`
- **Example Stored**: `69.2`
- **Script**: `fantasy-calculator.js` (post-processing)

#### 16. passing_yards_per_attempt
- **Database Column**: `passing_yards_per_attempt`
- **Data Type**: DECIMAL
- **Raw Source**: ESPN passing category
- **API Path**: `statistics[name="passing"].athletes[].stats[2]` (AVG)
- **Transformation**: parseFloat()
- **Example Raw**: `"8.3"`
- **Example Stored**: `8.3`
- **Script**: `game-stats-scraper.js` line 441 (AVG field)

#### 17. passing_first_downs
- **Database Column**: `passing_first_downs`
- **Data Type**: INTEGER
- **Raw Source**: Not provided by ESPN
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated
- **Note**: Would need play-by-play data

#### 18. passing_long
- **Database Column**: `passing_long`
- **Data Type**: INTEGER
- **Raw Source**: Not in standard boxscore
- **API Path**: N/A
- **Transformation**: Always 0
- **Example Raw**: N/A
- **Example Stored**: `0`
- **Script**: `game-stats-scraper.js` line 450
- **Note**: TODO - Extract from play-by-play if available

#### 19. passing_two_point_conversions
- **Database Column**: `passing_two_point_conversions`
- **Data Type**: INTEGER
- **Raw Source**: Not provided by ESPN
- **API Path**: N/A
- **Transformation**: Always 0
- **Example Raw**: N/A
- **Example Stored**: `0`
- **Script**: Not populated
- **Note**: Would need play-by-play data

---

### Rushing Stats (9 columns)

#### 20. rushing_attempts
- **Database Column**: `rushing_attempts`
- **Data Type**: INTEGER
- **Raw Source**: ESPN rushing category
- **API Path**: `statistics[name="rushing"].athletes[].stats[0]`
- **Transformation**: parseInt()
- **Example Raw**: `"18"`
- **Example Stored**: `18`
- **Script**: `game-stats-scraper.js` line 453
- **Labels**: `["CAR", "YDS", "AVG", "TD", "LONG"]`

#### 21. rushing_yards
- **Database Column**: `rushing_yards`
- **Data Type**: INTEGER
- **Raw Source**: ESPN rushing category
- **API Path**: `statistics[name="rushing"].athletes[].stats[1]`
- **Transformation**: parseInt()
- **Example Raw**: `"87"`
- **Example Stored**: `87`
- **Script**: `game-stats-scraper.js` line 454

#### 22. rushing_touchdowns
- **Database Column**: `rushing_touchdowns`
- **Data Type**: INTEGER
- **Raw Source**: ESPN rushing category
- **API Path**: `statistics[name="rushing"].athletes[].stats[3]`
- **Transformation**: parseInt()
- **Example Raw**: `"1"`
- **Example Stored**: `1`
- **Script**: `game-stats-scraper.js` line 455

#### 23. rushing_long
- **Database Column**: `rushing_long`
- **Data Type**: INTEGER
- **Raw Source**: ESPN rushing category
- **API Path**: `statistics[name="rushing"].athletes[].stats[4]`
- **Transformation**: parseInt()
- **Example Raw**: `"22"`
- **Example Stored**: `22`
- **Script**: `game-stats-scraper.js` line 456

#### 24. rushing_yards_per_attempt
- **Database Column**: `rushing_yards_per_attempt`
- **Data Type**: DECIMAL
- **Raw Source**: ESPN rushing category
- **API Path**: `statistics[name="rushing"].athletes[].stats[2]` (AVG)
- **Transformation**: parseFloat()
- **Example Raw**: `"4.8"`
- **Example Stored**: `4.8`
- **Script**: `game-stats-scraper.js` line 454 (AVG field)

#### 25. rushing_first_downs
- **Database Column**: `rushing_first_downs`
- **Data Type**: INTEGER
- **Raw Source**: Not provided by ESPN
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated

#### 26. rushing_fumbles
- **Database Column**: `rushing_fumbles`
- **Data Type**: INTEGER
- **Raw Source**: ESPN fumbles category
- **API Path**: `statistics[name="fumbles"].athletes[].stats[0]`
- **Transformation**: parseInt()
- **Example Raw**: `"1"`
- **Example Stored**: `1`
- **Script**: `game-stats-scraper.js` line 482
- **Labels**: `["FUM", "LOST", "REC"]`

#### 27. rushing_fumbles_lost
- **Database Column**: `rushing_fumbles_lost`
- **Data Type**: INTEGER
- **Raw Source**: ESPN fumbles category
- **API Path**: `statistics[name="fumbles"].athletes[].stats[1]`
- **Transformation**: parseInt()
- **Example Raw**: `"0"`
- **Example Stored**: `0`
- **Script**: `game-stats-scraper.js` line 483

#### 28. rushing_two_point_conversions
- **Database Column**: `rushing_two_point_conversions`
- **Data Type**: INTEGER
- **Raw Source**: Not provided by ESPN
- **API Path**: N/A
- **Transformation**: Always 0
- **Example Raw**: N/A
- **Example Stored**: `0`
- **Script**: Not populated

---

### Receiving Stats (11 columns)

#### 29. receiving_targets
- **Database Column**: `receiving_targets`
- **Data Type**: INTEGER
- **Raw Source**: ESPN receiving category
- **API Path**: `statistics[name="receiving"].athletes[].stats[5]`
- **Transformation**: parseInt()
- **Example Raw**: `"8"`
- **Example Stored**: `8`
- **Script**: `game-stats-scraper.js` line 464
- **Labels**: `["REC", "YDS", "AVG", "TD", "LONG", "TGTS"]`

#### 30. receptions ⚠️
- **Database Column**: `receptions`
- **Data Type**: INTEGER
- **Raw Source**: ESPN receiving category
- **API Path**: `statistics[name="receiving"].athletes[].stats[0]`
- **Transformation**: parseInt()
- **Example Raw**: `"6"`
- **Example Stored**: `6`
- **Script**: `game-stats-scraper.js` line 460
- **CRITICAL**: Column name is `receptions`, NOT `receiving_receptions`

#### 31. receiving_yards
- **Database Column**: `receiving_yards`
- **Data Type**: INTEGER
- **Raw Source**: ESPN receiving category
- **API Path**: `statistics[name="receiving"].athletes[].stats[1]`
- **Transformation**: parseInt()
- **Example Raw**: `"73"`
- **Example Stored**: `73`
- **Script**: `game-stats-scraper.js` line 461

#### 32. receiving_touchdowns
- **Database Column**: `receiving_touchdowns`
- **Data Type**: INTEGER
- **Raw Source**: ESPN receiving category
- **API Path**: `statistics[name="receiving"].athletes[].stats[3]`
- **Transformation**: parseInt()
- **Example Raw**: `"1"`
- **Example Stored**: `1`
- **Script**: `game-stats-scraper.js` line 462

#### 33. receiving_long
- **Database Column**: `receiving_long`
- **Data Type**: INTEGER
- **Raw Source**: ESPN receiving category
- **API Path**: `statistics[name="receiving"].athletes[].stats[4]`
- **Transformation**: parseInt()
- **Example Raw**: `"28"`
- **Example Stored**: `28`
- **Script**: `game-stats-scraper.js` line 463

#### 34. receiving_yards_per_reception
- **Database Column**: `receiving_yards_per_reception`
- **Data Type**: DECIMAL
- **Raw Source**: ESPN receiving category
- **API Path**: `statistics[name="receiving"].athletes[].stats[2]` (AVG)
- **Transformation**: parseFloat()
- **Example Raw**: `"12.2"`
- **Example Stored**: `12.2`
- **Script**: `game-stats-scraper.js` line 461 (AVG field)

#### 35. receiving_first_downs
- **Database Column**: `receiving_first_downs`
- **Data Type**: INTEGER
- **Raw Source**: Not provided by ESPN
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated

#### 36. receiving_fumbles
- **Database Column**: `receiving_fumbles`
- **Data Type**: INTEGER
- **Raw Source**: ESPN fumbles category (same as rushing)
- **API Path**: `statistics[name="fumbles"].athletes[].stats[0]`
- **Transformation**: parseInt()
- **Example Raw**: `"0"`
- **Example Stored**: `0`
- **Script**: `game-stats-scraper.js` line 482

#### 37. receiving_fumbles_lost
- **Database Column**: `receiving_fumbles_lost`
- **Data Type**: INTEGER
- **Raw Source**: ESPN fumbles category (same as rushing)
- **API Path**: `statistics[name="fumbles"].athletes[].stats[1]`
- **Transformation**: parseInt()
- **Example Raw**: `"0"`
- **Example Stored**: `0`
- **Script**: `game-stats-scraper.js` line 483

#### 38. receiving_yards_after_catch
- **Database Column**: `receiving_yards_after_catch`
- **Data Type**: INTEGER
- **Raw Source**: Not in standard boxscore
- **API Path**: N/A
- **Transformation**: Always 0
- **Example Raw**: N/A
- **Example Stored**: `0`
- **Script**: `game-stats-scraper.js` line 466
- **Note**: Would need Next Gen Stats API

#### 39. receiving_two_point_conversions
- **Database Column**: `receiving_two_point_conversions`
- **Data Type**: INTEGER
- **Raw Source**: Not provided by ESPN
- **API Path**: N/A
- **Transformation**: Always 0
- **Example Raw**: N/A
- **Example Stored**: `0`
- **Script**: Not populated

---

### Defensive Stats (15 columns)

#### 40. defensive_tackles
- **Database Column**: `defensive_tackles`
- **Data Type**: INTEGER
- **Raw Source**: ESPN defensive category
- **API Path**: `statistics[name="defensive"].athletes[].stats[0]`
- **Transformation**: parseInt()
- **Example Raw**: `"8"`
- **Example Stored**: `8`
- **Script**: `game-stats-scraper.js` line 469
- **Labels**: `["TOT", "SOLO", "SACKS", "TFL", "PD", "QB HTS", "TD"]`

#### 41. defensive_solo_tackles
- **Database Column**: `defensive_solo_tackles`
- **Data Type**: INTEGER
- **Raw Source**: ESPN defensive category
- **API Path**: `statistics[name="defensive"].athletes[].stats[1]`
- **Transformation**: parseInt()
- **Example Raw**: `"5"`
- **Example Stored**: `5`
- **Script**: `game-stats-scraper.js` line 470

#### 42. defensive_assists
- **Database Column**: `defensive_assists`
- **Data Type**: INTEGER
- **Raw Source**: Calculated
- **API Path**: N/A (total - solo)
- **Transformation**: total_tackles - solo_tackles
- **Example Raw**: `8 - 5`
- **Example Stored**: `3`
- **Script**: `game-stats-scraper.js` line 472

#### 43. defensive_sacks
- **Database Column**: `defensive_sacks`
- **Data Type**: DECIMAL
- **Raw Source**: ESPN defensive category
- **API Path**: `statistics[name="defensive"].athletes[].stats[2]`
- **Transformation**: parseFloat()
- **Example Raw**: `"1.5"`
- **Example Stored**: `1.5`
- **Script**: `game-stats-scraper.js` line 473
- **Note**: Can be fractional (shared sacks)

#### 44. defensive_tackles_for_loss
- **Database Column**: `defensive_tackles_for_loss`
- **Data Type**: INTEGER
- **Raw Source**: ESPN defensive category
- **API Path**: `statistics[name="defensive"].athletes[].stats[3]`
- **Transformation**: parseInt()
- **Example Raw**: `"2"`
- **Example Stored**: `2`
- **Script**: `game-stats-scraper.js` line 474

#### 45. defensive_qb_hits
- **Database Column**: `defensive_qb_hits`
- **Data Type**: INTEGER
- **Raw Source**: ESPN defensive category
- **API Path**: `statistics[name="defensive"].athletes[].stats[5]`
- **Transformation**: parseInt()
- **Example Raw**: `"3"`
- **Example Stored**: `3`
- **Script**: `game-stats-scraper.js` line 476

#### 46. defensive_interceptions
- **Database Column**: `defensive_interceptions`
- **Data Type**: INTEGER
- **Raw Source**: ESPN interceptions category
- **API Path**: `statistics[name="interceptions"].athletes[].stats[0]`
- **Transformation**: parseInt()
- **Example Raw**: `"1"`
- **Example Stored**: `1`
- **Script**: `game-stats-scraper.js` line 479
- **Labels**: `["INT", "YDS", "TD"]`

#### 47. defensive_interception_yards
- **Database Column**: `defensive_interception_yards`
- **Data Type**: INTEGER
- **Raw Source**: ESPN interceptions category
- **API Path**: `statistics[name="interceptions"].athletes[].stats[1]`
- **Transformation**: parseInt()
- **Example Raw**: `"25"`
- **Example Stored**: `25`
- **Script**: Would be line ~480 (INT YDS)

#### 48. defensive_interception_touchdowns
- **Database Column**: `defensive_interception_touchdowns`
- **Data Type**: INTEGER
- **Raw Source**: ESPN interceptions category
- **API Path**: `statistics[name="interceptions"].athletes[].stats[2]`
- **Transformation**: parseInt()
- **Example Raw**: `"0"`
- **Example Stored**: `0`
- **Script**: Would be line ~481 (INT TD)

#### 49. defensive_passes_defended
- **Database Column**: `defensive_passes_defended`
- **Data Type**: INTEGER
- **Raw Source**: ESPN defensive category
- **API Path**: `statistics[name="defensive"].athletes[].stats[4]`
- **Transformation**: parseInt()
- **Example Raw**: `"2"`
- **Example Stored**: `2`
- **Script**: `game-stats-scraper.js` line 475

#### 50. defensive_fumbles_forced
- **Database Column**: `defensive_fumbles_forced`
- **Data Type**: INTEGER
- **Raw Source**: ESPN defensive category (if available)
- **API Path**: `statistics[name="defensive"].athletes[].stats[6]`
- **Transformation**: parseInt()
- **Example Raw**: `"1"`
- **Example Stored**: `1`
- **Script**: `game-stats-scraper.js` line 487

#### 51. defensive_fumbles_recovered
- **Database Column**: `defensive_fumbles_recovered`
- **Data Type**: INTEGER
- **Raw Source**: ESPN fumbles category
- **API Path**: `statistics[name="fumbles"].athletes[].stats[2]`
- **Transformation**: parseInt()
- **Example Raw**: `"0"`
- **Example Stored**: `0`
- **Script**: `game-stats-scraper.js` line 484

#### 52. defensive_fumble_return_yards
- **Database Column**: `defensive_fumble_return_yards`
- **Data Type**: INTEGER
- **Raw Source**: Not provided by ESPN
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated

#### 53. defensive_fumble_return_touchdowns
- **Database Column**: `defensive_fumble_return_touchdowns`
- **Data Type**: INTEGER
- **Raw Source**: Not provided by ESPN
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated

#### 54. defensive_safeties
- **Database Column**: `defensive_safeties`
- **Data Type**: INTEGER
- **Raw Source**: Not provided by ESPN
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated

---

### Kicking Stats (6 columns)

#### 55. kicking_field_goals_made
- **Database Column**: `kicking_field_goals_made`
- **Data Type**: INTEGER
- **Raw Source**: ESPN kicking category
- **API Path**: `statistics[name="kicking"].athletes[].stats[0]` (first part of "FG/ATT")
- **Transformation**: Parse "3/4" → 3
- **Example Raw**: `"3/4"`
- **Example Stored**: `3`
- **Script**: `game-stats-scraper.js` line 490
- **Labels**: `["FG", "PCT", "LONG", "XP", "PTS"]`

#### 56. kicking_field_goals_attempted
- **Database Column**: `kicking_field_goals_attempted`
- **Data Type**: INTEGER
- **Raw Source**: ESPN kicking category
- **API Path**: `statistics[name="kicking"].athletes[].stats[0]` (second part of "FG/ATT")
- **Transformation**: Parse "3/4" → 4
- **Example Raw**: `"3/4"`
- **Example Stored**: `4`
- **Script**: `game-stats-scraper.js` line 491

#### 57. kicking_field_goal_percentage
- **Database Column**: `kicking_field_goal_percentage`
- **Data Type**: DECIMAL
- **Raw Source**: Calculated
- **API Path**: N/A (made / attempted × 100)
- **Transformation**: (made / attempted) × 100
- **Example Raw**: `3/4`
- **Example Stored**: `75.0`
- **Script**: Post-processing calculation

#### 58. kicking_long
- **Database Column**: `kicking_long`
- **Data Type**: INTEGER
- **Raw Source**: ESPN kicking category
- **API Path**: `statistics[name="kicking"].athletes[].stats[2]`
- **Transformation**: parseInt()
- **Example Raw**: `"52"`
- **Example Stored**: `52`
- **Script**: `game-stats-scraper.js` line 492

#### 59. kicking_extra_points_made
- **Database Column**: `kicking_extra_points_made`
- **Data Type**: INTEGER
- **Raw Source**: ESPN kicking category
- **API Path**: `statistics[name="kicking"].athletes[].stats[3]` (first part of "XP/ATT")
- **Transformation**: Parse "4/4" → 4
- **Example Raw**: `"4/4"`
- **Example Stored**: `4`
- **Script**: `game-stats-scraper.js` line 493

#### 60. kicking_extra_points_attempted
- **Database Column**: `kicking_extra_points_attempted`
- **Data Type**: INTEGER
- **Raw Source**: ESPN kicking category
- **API Path**: `statistics[name="kicking"].athletes[].stats[3]` (second part of "XP/ATT")
- **Transformation**: Parse "4/4" → 4
- **Example Raw**: `"4/4"`
- **Example Stored**: `4`
- **Script**: `game-stats-scraper.js` line 494

---

### Punting Stats (6 columns)

#### 61. punting_punts
- **Database Column**: `punting_punts`
- **Data Type**: INTEGER
- **Raw Source**: ESPN punting category
- **API Path**: `statistics[name="punting"].athletes[].stats[0]`
- **Transformation**: parseInt()
- **Example Raw**: `"5"`
- **Example Stored**: `5`
- **Script**: `game-stats-scraper.js` line 497
- **Labels**: `["NO", "YDS", "AVG", "TB", "IN 20", "LONG"]`

#### 62. punting_yards
- **Database Column**: `punting_yards`
- **Data Type**: INTEGER
- **Raw Source**: ESPN punting category
- **API Path**: `statistics[name="punting"].athletes[].stats[1]`
- **Transformation**: parseInt()
- **Example Raw**: `"235"`
- **Example Stored**: `235`
- **Script**: `game-stats-scraper.js` line 498

#### 63. punting_average
- **Database Column**: `punting_average`
- **Data Type**: DECIMAL
- **Raw Source**: ESPN punting category
- **API Path**: `statistics[name="punting"].athletes[].stats[2]`
- **Transformation**: parseFloat()
- **Example Raw**: `"47.0"`
- **Example Stored**: `47.0`
- **Script**: `game-stats-scraper.js` line 499

#### 64. punting_long
- **Database Column**: `punting_long`
- **Data Type**: INTEGER
- **Raw Source**: ESPN punting category
- **API Path**: `statistics[name="punting"].athletes[].stats[5]`
- **Transformation**: parseInt()
- **Example Raw**: `"58"`
- **Example Stored**: `58`
- **Script**: `game-stats-scraper.js` line 502

#### 65. punting_inside_20
- **Database Column**: `punting_inside_20`
- **Data Type**: INTEGER
- **Raw Source**: ESPN punting category
- **API Path**: `statistics[name="punting"].athletes[].stats[4]`
- **Transformation**: parseInt()
- **Example Raw**: `"2"`
- **Example Stored**: `2`
- **Script**: `game-stats-scraper.js` line 501

#### 66. punting_touchbacks
- **Database Column**: `punting_touchbacks`
- **Data Type**: INTEGER
- **Raw Source**: ESPN punting category
- **API Path**: `statistics[name="punting"].athletes[].stats[3]`
- **Transformation**: parseInt()
- **Example Raw**: `"0"`
- **Example Stored**: `0`
- **Script**: `game-stats-scraper.js` line 500

---

### Return Stats (10 columns)

#### 67-71. Kick Returns (5 columns)
- **Database Columns**: `kick_return_returns`, `kick_return_yards`, `kick_return_average`, `kick_return_long`, `kick_return_touchdowns`
- **Raw Source**: ESPN kick returns category (if available)
- **API Path**: `statistics[name="kickReturns"].athletes[].stats[]`
- **Transformation**: parseInt() / parseFloat()
- **Script**: Not currently implemented in scraper
- **Note**: ESPN may not always provide return stats in standard boxscore

#### 72-76. Punt Returns (5 columns)
- **Database Columns**: `punt_return_returns`, `punt_return_yards`, `punt_return_average`, `punt_return_long`, `punt_return_touchdowns`
- **Raw Source**: ESPN punt returns category (if available)
- **API Path**: `statistics[name="puntReturns"].athletes[].stats[]`
- **Transformation**: parseInt() / parseFloat()
- **Script**: Not currently implemented in scraper
- **Note**: ESPN may not always provide return stats in standard boxscore

---

### Fantasy Points (5 columns)

#### 77. fantasy_points_standard
- **Database Column**: `fantasy_points_standard`
- **Data Type**: DECIMAL
- **Raw Source**: Calculated from stats
- **API Path**: N/A (formula-based)
- **Transformation**: See fantasy-calculator.js
- **Formula**:
  ```javascript
  (passing_yards / 25) +
  (passing_touchdowns × 4) +
  (passing_interceptions × -2) +
  (rushing_yards / 10) +
  (rushing_touchdowns × 6) +
  (receiving_yards / 10) +
  (receiving_touchdowns × 6) +
  (fumbles_lost × -2)
  ```
- **Example Stored**: `18.6`
- **Script**: `fantasy-calculator.js` + `game-stats-scraper.js` line 509

#### 78. fantasy_points_ppr
- **Database Column**: `fantasy_points_ppr`
- **Data Type**: DECIMAL
- **Raw Source**: Calculated from stats
- **API Path**: N/A (formula-based)
- **Transformation**: Standard + (receptions × 1)
- **Formula**:
  ```javascript
  fantasy_points_standard + receptions
  ```
- **Example Stored**: `24.6`
- **Script**: `fantasy-calculator.js`

#### 79. fantasy_points_half_ppr
- **Database Column**: `fantasy_points_half_ppr`
- **Data Type**: DECIMAL
- **Raw Source**: Calculated from stats
- **API Path**: N/A (formula-based)
- **Transformation**: Standard + (receptions × 0.5)
- **Formula**:
  ```javascript
  fantasy_points_standard + (receptions × 0.5)
  ```
- **Example Stored**: `21.6`
- **Script**: `fantasy-calculator.js`

#### 80. fantasy_points_dynasty
- **Database Column**: `fantasy_points_dynasty`
- **Data Type**: DECIMAL
- **Raw Source**: Calculated from stats
- **API Path**: N/A (formula-based)
- **Transformation**: Custom dynasty scoring
- **Formula**: Similar to PPR with adjustments
- **Example Stored**: `22.3`
- **Script**: `fantasy-calculator.js`

#### 81. fantasy_points_superflex
- **Database Column**: `fantasy_points_superflex`
- **Data Type**: DECIMAL
- **Raw Source**: Calculated from stats
- **API Path**: N/A (formula-based)
- **Transformation**: Enhanced QB scoring
- **Formula**: Passing TDs worth 6 pts (not 4)
- **Example Stored**: `25.1`
- **Script**: `fantasy-calculator.js`

---

### Metadata (1 column)

#### 82. updated_at
- **Database Column**: `updated_at`
- **Data Type**: TIMESTAMPTZ
- **Raw Source**: Database auto-generated
- **API Path**: N/A
- **Transformation**: `NOW()`
- **Example Stored**: `"2025-10-22T13:14:00.123Z"`
- **Script**: Database default

---

## ESPN API Response Structure

### Game Summary Endpoint
```
https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={game_id}
```

### Boxscore Players Array Structure
```json
{
  "boxscore": {
    "players": [
      {
        "team": {
          "id": "26",
          "abbreviation": "SEA"
        },
        "statistics": [
          {
            "name": "passing",
            "labels": ["C/ATT", "YDS", "AVG", "TD", "INT", "SACKS", "QBR", "RTG"],
            "athletes": [
              {
                "athlete": {
                  "id": "4361529",
                  "displayName": "Sam Darnold",
                  "jersey": "14",
                  "position": {
                    "abbreviation": "QB"
                  }
                },
                "stats": ["18/26", "289", "11.1", "3", "1", "2", "72.3", "108.5"]
              }
            ]
          },
          {
            "name": "rushing",
            "labels": ["CAR", "YDS", "AVG", "TD", "LONG"],
            "athletes": [...]
          },
          {
            "name": "receiving",
            "labels": ["REC", "YDS", "AVG", "TD", "LONG", "TGTS"],
            "athletes": [...]
          },
          {
            "name": "defensive",
            "labels": ["TOT", "SOLO", "SACKS", "TFL", "PD", "QB HTS", "TD"],
            "athletes": [...]
          },
          {
            "name": "interceptions",
            "labels": ["INT", "YDS", "TD"],
            "athletes": [...]
          },
          {
            "name": "fumbles",
            "labels": ["FUM", "LOST", "REC"],
            "athletes": [...]
          },
          {
            "name": "kicking",
            "labels": ["FG", "PCT", "LONG", "XP", "PTS"],
            "athletes": [...]
          },
          {
            "name": "punting",
            "labels": ["NO", "YDS", "AVG", "TB", "IN 20", "LONG"],
            "athletes": [...]
          }
        ]
      }
    ]
  }
}
```

---

## Data Source Scripts

### Primary Script
**File**: `scripts/scrapers/game-stats-scraper.js`
**Function**: `extractPlayerStats(gameSummary, gameId)`
**Lines**: 315-519

### Extraction Process

```javascript
// 1. Get boxscore players array
const boxscore = gameSummary.boxscore

// 2. Process each team
boxscore.players.forEach(teamData => {
  const teamAbbr = teamData.team.abbreviation
  const statistics = teamData.statistics || []

  // 3. Build player stats map
  const playerStatsMap = new Map()

  // 4. Process each category (passing, rushing, receiving, etc.)
  statistics.forEach(category => {
    category.athletes.forEach(athleteData => {
      const playerId = `espn-${athleteData.athlete.id}`
      const stats = athleteData.stats

      // Map stats based on category.name and labels
      if (category.name === 'passing') {
        playerStats.passing_completions = parseStat(stats[0], 0)
        playerStats.passing_attempts = parseStat(stats[0], 1)
        playerStats.passing_yards = parseStat(stats[1], 0)
        // ... etc
      }
    })
  })

  // 5. Calculate fantasy points
  playerStatsMap.forEach((playerStats, playerId) => {
    const fantasyPoints = calculateFantasyPoints(playerStats)
    Object.assign(playerStats, fantasyPoints)
  })
})
```

---

## Field Population Summary

| Category | ESPN API | Calculated | Database | Always NULL |
|----------|----------|------------|----------|-------------|
| Identification (5) | 4 | 0 | 1 | 0 |
| Passing (14) | 9 | 3 | 0 | 2 |
| Rushing (9) | 5 | 1 | 0 | 3 |
| Receiving (11) | 6 | 1 | 0 | 4 |
| Defense (15) | 10 | 1 | 0 | 4 |
| Kicking (6) | 5 | 1 | 0 | 0 |
| Punting (6) | 6 | 0 | 0 | 0 |
| Returns (10) | 0 | 0 | 0 | 10 |
| Fantasy (5) | 0 | 5 | 0 | 0 |
| Metadata (1) | 0 | 0 | 1 | 0 |
| **TOTAL (82)** | **45** | **12** | **2** | **23** |

---

## Data Quality Notes

### Fields Always Populated
- Identification fields (player_id, game_id, season, team_id)
- Stats for players who recorded them (position-dependent)

### Fields Sometimes NULL
- Position-specific stats (e.g., passing_yards for RBs)
- Advanced metrics not in boxscore (first_downs, YAC)

### Fields Always NULL
- Return stats (not in standard boxscore)
- 2-point conversions (not consistently provided)
- Some advanced defensive stats (fumble return yards/TDs, safeties)

---

## Performance Metrics

### Execution Time
- **Player extraction**: ~200-400ms per game
- **Fantasy calculations**: ~50ms per game
- **Database insert**: ~100ms (batch)
- **Total**: ~400-600ms per game

### Data Volume
- **Per game**: ~60-80 player stat records
- **106 completed games**: 6,842 records
- **Full season (272 games)**: ~17,000+ records expected

---

## Version History

| Version | Date | Changes |
|---------|------|------------|
| 1.0 | 2025-10-20 | Added 44 columns (Session 4 - Phase 1) |
| 1.1 | 2025-10-22 | Raw data source mapping created |

---

## Missing Fields

### position (NOT IN DATABASE)

- **Database Column**: ❌ DOES NOT EXIST
- **Data Type**: N/A
- **Raw Source**: Would be from ESPN API
- **API Path**: `boxscore.players[].statistics[].athletes[].athlete.position.abbreviation`
- **Example Raw**: `"QB"`, `"RB"`, `"WR"`
- **Example Stored**: N/A (field doesn't exist)
- **Script**: NOT extracted in `game-stats-scraper.js`

**Why Missing**:
- Original schema (20250101000005) did not include position column
- Extraction code at line 363 does not set position field
- Enhancement migration (20250101000020) added 44 fields but NOT position

**Impact**:
- Cannot filter by position: `.eq('position', 'QB')` will fail
- Performance floors must JOIN with `players.primary_position`
- Weekly aggregation must JOIN for position-based filtering
- All queries needing position require extra JOIN

**Workaround**:
```javascript
// Get position from players table
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    *,
    player:players(primary_position)
  `)
  .eq('game_id', gameId)
```

**Alternative Workaround**:
```javascript
// Get position from game_rosters (game-specific position)
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    *,
    roster:game_rosters!inner(position)
  `)
  .eq('game_id', gameId)
```

**If Added in Future**:
1. Add column: `ALTER TABLE player_game_stats ADD COLUMN position VARCHAR(10)`
2. Update extraction at line 363: `position: athleteData.athlete?.position?.abbreviation`
3. Backfill: `UPDATE player_game_stats SET position = (SELECT primary_position FROM players WHERE player_id = player_game_stats.player_id)`

---

## References

- **Scraper**: `scripts/scrapers/game-stats-scraper.js` (lines 315-519)
- **Fantasy Calculator**: `scripts/utils/fantasy-calculator.js`
- **ESPN API Docs**: Not publicly documented (reverse-engineered)
- **Migration (Base)**: `supabase/migrations/20250101000005_create_player_stats_tables.sql`
- **Migration (Enhanced)**: `supabase/migrations/20250101000020_enhance_player_game_stats.sql`
- **Validation Report**: `coderef/FINAL/FIELD-MAPPING-VALIDATION-REPORT.md`

---

**Last Updated**: October 22, 2025
**Data Source**: ESPN API Game Summary (boxscore.players)
**Total Fields**: 66 (NOT 75 - position does not exist)
**Automation**: ✅ Fully automated via live-games-scraper → game-stats-scraper
**Known Issues**: ⚠️ Missing `position` field - requires JOIN workaround
