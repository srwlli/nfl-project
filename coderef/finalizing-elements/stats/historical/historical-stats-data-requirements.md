# Historical Stats Data Requirements (1970-2024)

**Page Type:** NFL Historical Statistics Database (54 Years: 1970-2024)
**Coverage Goal:** Complete historical archive - all seasons, all players, all teams, all games
**Priority:** P0 - Critical (powers all other pages)
**Status:** Requirements Complete - Ready for Implementation
**Last Updated:** 2025-10-17

---

## Executive Summary

The Historical Stats database is the foundational data layer powering all historical analysis, player comparisons, record tracking, and statistical insights across the platform. This system encompasses **54 complete NFL seasons (1970-2024)** with **multiple granularity levels**: season stats, game-by-game logs, and complete play-by-play data.

**Total Estimated Fields:** ~850 unique field definitions across 12 sections

**Scope:** Complete NFL Historical Archive (1970-2024)
- ✅ **Season-level stats:** 54 years × all teams × all players
- ✅ **Game-level logs:** Game-by-game performance for all players/teams
- ✅ **Play-by-play data:** Individual play records with EPA, win probability
- ✅ **Advanced analytics:** EPA, DVOA, success rate, CPOE, Next Gen Stats (when available)
- ✅ **Full historical context:** Rankings, era adjustments, related players, championships
- ✅ **Multi-dimensional leaderboards:** All-time, era-based, team, position, playoff, active vs retired
- ✅ **Comprehensive filtering:** By year, team, position, stat thresholds, playoff/regular season
- ✅ **Situational splits:** Home/away, by opponent, down/distance, field position, score differential
- ✅ **Awards & accolades:** MVPs, Pro Bowls, All-Pro, championships, Hall of Fame
- ✅ **Visualization-ready:** Time series, scatter plots, distributions, career arcs

**Granularity Levels:**
1. **Season Stats:** Player/team performance aggregated by season
2. **Game Logs:** Game-by-game individual performance
3. **Play-by-Play:** Individual play records (snap-level data)

**Statistical Categories:**
- Traditional stats (yards, TDs, completions, etc.)
- Advanced analytics (EPA, DVOA, success rate, CPOE)
- Next Gen Stats (separation, cushion, time to throw) - 2016-2024 only
- Situational stats (red zone, third down, 4th quarter, etc.)

**Data Source Dependencies:**
- nflreadpy (primary) - Season stats, game logs
- sportsref-nfl - Play-by-play, franchise history
- nflscraPy - Advanced analytics (EPA, DVOA)
- NFL Next Gen Stats - Tracking data (2016-2024)
- Manual curation - Awards, context, historical notes

---

## Scope Decisions (From User Requirements)

**User Confirmed Scope:**

✅ **Granularity:** Season + Game + Play-level (complete play-by-play)
✅ **Statistical Categories:** All traditional + Advanced + Situational + Next Gen Stats
✅ **Player Depth:** NFL career only (NOTE: Circle back on player profile overlap)
✅ **Era Priority:** Equal - all 54 years (1970-2024) fully implemented
✅ **Search & Filters:** Comprehensive filtering system
✅ **Historical Context:** Full context (rankings, era adjustments, related players, championships)
✅ **Game Logs:** Complete game context (opponent, result, weather, playoff status)
✅ **Play-by-Play:** Complete database with EPA, win probability, situational context
✅ **Visualizations:** Comprehensive visualization suite
✅ **Integrations:** Full integration with all pages (players, teams, games, badges, record chase)
✅ **Leaderboards:** Multi-dimensional (all-time, era, team, position, playoff, active vs retired)

---

## Section 1: Player Season Stats (P0)

**Total Fields:** ~95 fields per player-season record

### Description
Complete season-by-season statistics for every player in NFL history (1970-2024). Includes all traditional stats, advanced metrics, and contextual information.

### Data Structure

```json
{
  "player_season_stats": {
    "player_id": "brady-tom",
    "player_name": "Tom Brady",
    "season": 2007,
    "team_id": "NE",
    "team_name": "New England Patriots",
    "position": "QB",
    "jersey_number": 12,

    "games": {
      "games_played": 16,
      "games_started": 16,
      "team_games_total": 16,
      "games_missed": 0,
      "injury_games": 0
    },

    "passing": {
      "attempts": 578,
      "completions": 398,
      "completion_pct": 68.9,
      "yards": 4806,
      "touchdowns": 50,
      "interceptions": 8,
      "td_int_ratio": 6.25,
      "yards_per_attempt": 8.3,
      "yards_per_completion": 12.1,
      "passer_rating": 117.2,
      "qbr": 82.5,
      "sacks": 21,
      "sack_yards": 128,
      "longest_pass": 65,
      "first_downs": 245,
      "fourth_quarter_comebacks": 2,
      "game_winning_drives": 3,
      "300_yard_games": 12,
      "400_yard_games": 2,
      "air_yards": 3245,
      "yards_after_catch": 1561,
      "on_target_throws": 512,
      "on_target_pct": 88.6,
      "dropped_passes": 28,
      "batted_passes": 12,
      "throwaways": 15
    },

    "rushing": {
      "attempts": 42,
      "yards": 98,
      "yards_per_carry": 2.3,
      "touchdowns": 2,
      "longest_run": 18,
      "first_downs": 12,
      "fumbles": 5,
      "fumbles_lost": 3,
      "broken_tackles": 4,
      "yards_after_contact": 45,
      "stuffed_runs": 8,
      "20_plus_runs": 0
    },

    "receiving": {
      "targets": null,
      "receptions": null,
      "reception_pct": null,
      "yards": null,
      "yards_per_reception": null,
      "yards_per_target": null,
      "touchdowns": null,
      "longest_reception": null,
      "first_downs": null,
      "yards_after_catch": null,
      "yards_after_catch_per_reception": null,
      "contested_catches": null,
      "contested_catch_pct": null,
      "drops": null,
      "drop_pct": null,
      "100_yard_games": null,
      "200_yard_games": null
    },

    "defense": {
      "tackles_solo": null,
      "tackles_assist": null,
      "tackles_total": null,
      "tackles_for_loss": null,
      "sacks": null,
      "qb_hits": null,
      "qb_hurries": null,
      "interceptions": null,
      "interception_yards": null,
      "interception_tds": null,
      "passes_defended": null,
      "forced_fumbles": null,
      "fumble_recoveries": null,
      "fumble_recovery_yards": null,
      "fumble_recovery_tds": null,
      "safeties": null,
      "defensive_tds": null
    },

    "special_teams": {
      "fg_made": null,
      "fg_attempts": null,
      "fg_pct": null,
      "fg_longest": null,
      "fg_0_19": null,
      "fg_20_29": null,
      "fg_30_39": null,
      "fg_40_49": null,
      "fg_50_plus": null,
      "xp_made": null,
      "xp_attempts": null,
      "xp_pct": null,
      "punts": null,
      "punt_yards": null,
      "punt_average": null,
      "punt_longest": null,
      "punts_inside_20": null,
      "punts_inside_10": null,
      "punt_touchbacks": null,
      "kick_returns": null,
      "kick_return_yards": null,
      "kick_return_average": null,
      "kick_return_tds": null,
      "kick_return_longest": null,
      "punt_returns": null,
      "punt_return_yards": null,
      "punt_return_average": null,
      "punt_return_tds": null,
      "punt_return_longest": null
    },

    "fantasy": {
      "fantasy_points_standard": 302.4,
      "fantasy_points_ppr": 302.4,
      "fantasy_points_half_ppr": 302.4,
      "fantasy_rank_position": 1,
      "fantasy_rank_overall": 3,
      "fantasy_ppg": 18.9,
      "fantasy_boom_weeks": 10,
      "fantasy_bust_weeks": 1
    },

    "advanced_analytics": {
      "epa_total": 145.2,
      "epa_per_play": 0.25,
      "epa_passing": 148.3,
      "epa_rushing": -3.1,
      "cpoe": 5.2,
      "success_rate_overall": 52.3,
      "success_rate_passing": 54.1,
      "success_rate_rushing": 38.1,
      "dvoa_total": 45.2,
      "dvoa_passing": 48.3,
      "dvoa_rushing": -5.1,
      "win_probability_added": 2.8
    },

    "contextual": {
      "team_record": "16-0",
      "team_wins": 16,
      "team_losses": 0,
      "playoff_appearance": true,
      "playoff_result": "Lost Super Bowl",
      "division_title": true,
      "conference_title": true,
      "super_bowl_champion": false,
      "player_age": 30,
      "years_pro": 8,
      "contract_year": false
    },

    "awards": {
      "mvp": true,
      "offensive_player_of_year": true,
      "pro_bowl": true,
      "all_pro_first_team": true,
      "all_pro_second_team": false
    },

    "rankings": {
      "season_rank_passing_yards": 1,
      "season_rank_passing_tds": 1,
      "season_rank_passer_rating": 1,
      "era_rank_passing_yards": 1,
      "alltime_rank_passing_yards": null
    }
  }
}
```

### Field Count by Category
- **Metadata:** 7 fields (player_id, name, season, team, position, jersey, age)
- **Games Played:** 5 fields
- **Passing:** 26 fields
- **Rushing:** 12 fields
- **Receiving:** 17 fields
- **Defense:** 17 fields
- **Special Teams:** 20 fields
- **Fantasy:** 8 fields
- **Advanced Analytics:** 11 fields
- **Contextual:** 11 fields
- **Awards:** 5 fields
- **Rankings:** 5 fields

**Total:** ~95 fields per player-season record

---

## Section 2: Player Game Logs (P0)

**Total Fields:** ~85 fields per game log record

### Description
Game-by-game performance logs for every player in every game (1970-2024). Allows analysis of individual game performances, trends, streaks, and game-specific contexts.

### Data Structure

```json
{
  "player_game_log": {
    "player_id": "mahomes-patrick",
    "player_name": "Patrick Mahomes",
    "season": 2024,
    "week": 7,
    "game_id": "2024_07_KC_SF",
    "game_date": "2024-10-20",
    "team_id": "KC",
    "opponent_id": "SF",
    "opponent_name": "San Francisco 49ers",
    "home_away": "away",
    "game_result": "W",
    "team_score": 28,
    "opponent_score": 18,
    "started": true,

    "passing": {
      "attempts": 34,
      "completions": 25,
      "completion_pct": 73.5,
      "yards": 291,
      "touchdowns": 3,
      "interceptions": 1,
      "passer_rating": 108.4,
      "qbr": 75.2,
      "sacks": 2,
      "sack_yards": 14,
      "longest_pass": 48,
      "first_downs": 16
    },

    "rushing": {
      "attempts": 4,
      "yards": 22,
      "yards_per_carry": 5.5,
      "touchdowns": 0,
      "longest_run": 12,
      "first_downs": 2,
      "fumbles": 0,
      "fumbles_lost": 0
    },

    "fantasy": {
      "fantasy_points_standard": 24.64,
      "fantasy_points_ppr": 24.64,
      "fantasy_points_half_ppr": 24.64,
      "fantasy_rank_week_position": 3,
      "fantasy_rank_week_overall": 8
    },

    "advanced_analytics": {
      "epa_total": 8.5,
      "epa_per_play": 0.22,
      "cpoe": 4.1,
      "success_rate": 55.9
    },

    "game_context": {
      "temperature": 68,
      "weather": "Clear",
      "wind_mph": 5,
      "roof_type": "outdoor",
      "surface": "grass",
      "playoff_game": false,
      "primetime": false,
      "broadcast_network": "CBS",
      "attendance": 68500,
      "game_notes": "Mahomes' 200th career start",
      "milestone_achieved": "200th start"
    },

    "team_context": {
      "team_record_before": "6-0",
      "team_record_after": "7-0",
      "division_standing_before": 1,
      "division_standing_after": 1
    }
  }
}
```

### Field Count by Category
- **Metadata:** 14 fields (player, game, teams, date, result)
- **Passing:** 12 fields
- **Rushing:** 8 fields
- **Receiving:** 17 fields (for WR/TE/RB)
- **Defense:** 17 fields (for DEF)
- **Special Teams:** 20 fields (for K/P)
- **Fantasy:** 5 fields
- **Advanced Analytics:** 4 fields
- **Game Context:** 11 fields
- **Team Context:** 4 fields

**Total:** ~85 fields per game log record

---

## Section 3: Player Career Aggregates (P0)

**Total Fields:** ~110 fields per player career record

### Description
Career-long aggregates for every player. Complete career totals, averages, bests, and career trajectory information.

### Data Structure

```json
{
  "player_career_stats": {
    "player_id": "rice-jerry",
    "player_name": "Jerry Rice",
    "position": "WR",
    "career_span": "1985-2004",
    "seasons_played": 20,
    "teams": ["SF", "OAK", "SEA"],
    "primary_team": "SF",
    "status": "retired",
    "hall_of_fame": true,
    "hof_year": 2010,

    "career_totals": {
      "games_played": 303,
      "games_started": 284,
      "receptions": 1549,
      "receiving_yards": 22895,
      "receiving_tds": 197,
      "yards_per_reception": 14.8,
      "100_yard_games": 76,
      "rushing_attempts": 87,
      "rushing_yards": 645,
      "rushing_tds": 10,
      "total_tds": 208,
      "total_yards_from_scrimmage": 23540,
      "fumbles": 58,
      "fumbles_lost": 29
    },

    "career_averages": {
      "receptions_per_game": 5.1,
      "yards_per_game": 75.6,
      "tds_per_game": 0.65,
      "tds_per_season": 9.9
    },

    "career_bests": {
      "most_receptions_game": 14,
      "most_yards_game": 289,
      "most_tds_game": 5,
      "best_season_receptions": 122,
      "best_season_yards": 1848,
      "best_season_tds": 22
    },

    "playoff_career": {
      "playoff_games": 29,
      "playoff_receptions": 151,
      "playoff_yards": 2245,
      "playoff_tds": 22,
      "playoff_yards_per_game": 77.4,
      "super_bowls": 4,
      "super_bowl_wins": 3,
      "super_bowl_mvps": 1
    },

    "awards_totals": {
      "mvp_awards": 0,
      "pro_bowl_selections": 13,
      "all_pro_first_team": 10,
      "all_pro_second_team": 2,
      "offensive_player_of_year": 2
    },

    "records_held": [
      {
        "record_type": "career",
        "stat": "receiving_yards",
        "value": 22895,
        "rank_alltime": 1,
        "years_held": "1995-2024",
        "status": "current_holder"
      },
      {
        "record_type": "career",
        "stat": "receiving_tds",
        "value": 197,
        "rank_alltime": 1,
        "years_held": "1994-2024",
        "status": "current_holder"
      }
    ],

    "alltime_rankings": {
      "receiving_yards": 1,
      "receiving_tds": 1,
      "receptions": 2,
      "total_tds": 2,
      "yards_from_scrimmage": 4,
      "100_yard_games": 1
    },

    "era_context": {
      "era": "1980s-2000s",
      "era_rank_receiving_yards": 1,
      "contemporaries": ["moss-randy", "owens-terrell", "harrison-marvin"],
      "era_dominance_score": 98.5
    }
  }
}
```

### Field Count by Category
- **Metadata:** 10 fields
- **Career Totals:** 14 fields
- **Career Averages:** 4 fields
- **Career Bests:** 6 fields
- **Playoff Career:** 9 fields
- **Awards Totals:** 5 fields
- **Records Held:** Array (dynamic)
- **All-Time Rankings:** 10 fields
- **Era Context:** 5 fields
- **Position-Specific Stats:** ~50 fields (varies by position)

**Total:** ~110 fields per player career record

---

## Section 4: Play-by-Play Data (P0)

**Total Fields:** ~75 fields per play record

### Description
Individual play-level data for every play in NFL history (1970-2024). Includes play description, personnel, situation, result, and advanced metrics (EPA, win probability).

### Data Structure

```json
{
  "play_by_play": {
    "play_id": "2024_07_KC_SF_Q3_08:42_1",
    "game_id": "2024_07_KC_SF",
    "season": 2024,
    "week": 7,
    "quarter": 3,
    "time_remaining": "8:42",
    "game_seconds_remaining": 1722,
    "
_team": "KC",
    "defense_team": "SF",

    "situation": {
      "down": 1,
      "distance": 10,
      "yardline": 75,
      "yardline_side": "SF",
      "yards_to_goal": 25,
      "field_position": "opponent_territory",
      "score_differential": 7,
      "possession_team_score": 21,
      "defense_team_score": 14
    },

    "play_description": {
      "play_type": "pass",
      "play_category": "pass_complete",
      "description": "P.Mahomes pass short right to T.Kelce for 15 yards",
      "yards_gained": 15,
      "first_down_gained": true,
      "touchdown": false,
      "turnover": false,
      "penalty": false,
      "safety": false
    },

    "personnel": {
      "passer_id": "mahomes-patrick",
      "passer_name": "Patrick Mahomes",
      "receiver_id": "kelce-travis",
      "receiver_name": "Travis Kelce",
      "rusher_id": null,
      "tackler_1_id": "warner-fred",
      "tackler_2_id": null,
      "assist_tackler_ids": []
    },

    "pass_details": {
      "pass_location": "short_right",
      "pass_depth": "short",
      "air_yards": 8,
      "yards_after_catch": 7,
      "completed": true,
      "incomplete_reason": null,
      "interception": false,
      "sack": false,
      "qb_hit": false,
      "qb_hurry": false,
      "pass_defense": false
    },

    "rush_details": {
      "rush_direction": null,
      "rush_location": null,
      "rush_gap": null,
      "yards_before_contact": null,
      "yards_after_contact": null,
      "broken_tackles": null,
      "defenders_in_box": null
    },

    "advanced_metrics": {
      "epa": 0.85,
      "win_probability_before": 0.652,
      "win_probability_after": 0.687,
      "wp_delta": 0.035,
      "success": true,
      "explosive_play": true,
      "air_epa": 0.45,
      "yac_epa": 0.40
    },

    "next_play_context": {
      "next_down": 1,
      "next_distance": 10,
      "next_yardline": 60,
      "next_yards_to_goal": 10
    }
  }
}
```

### Field Count by Category
- **Metadata:** 8 fields
- **Situation:** 9 fields
- **Play Description:** 8 fields
- **Personnel:** 7 fields
- **Pass Details:** 11 fields
- **Rush Details:** 7 fields
- **Advanced Metrics:** 8 fields
- **Next Play Context:** 4 fields
- **Penalty Details:** 6 fields (if applicable)
- **Scoring Details:** 7 fields (if applicable)

**Total:** ~75 fields per play record

---

## Section 5: Team Season Stats (P0)

**Total Fields:** ~120 fields per team-season record

### Description
Complete season statistics for all 32 NFL teams across all 54 seasons (1970-2024). Includes offensive, defensive, special teams, and contextual data.

### Data Structure

```json
{
  "team_season_stats": {
    "team_id": "NE",
    "team_name": "New England Patriots",
    "season": 2007,
    "conference": "AFC",
    "division": "East",

    "record": {
      "wins": 16,
      "losses": 0,
      "ties": 0,
      "win_pct": 1.000,
      "division_finish": 1,
      "conference_finish": 1,
      "playoff_seed": 1
    },

    "offense": {
      "points_scored": 589,
      "points_per_game": 36.8,
      "total_yards": 6440,
      "yards_per_game": 402.5,
      "passing_yards": 4700,
      "passing_tds": 52,
      "passing_ints": 12,
      "rushing_yards": 1740,
      "rushing_tds": 15,
      "turnovers": 23,
      "third_down_pct": 48.9,
      "red_zone_td_pct": 67.5,
      "time_of_possession": "32:15"
    },

    "defense": {
      "points_allowed": 274,
      "points_per_game": 17.1,
      "total_yards_allowed": 5132,
      "yards_per_game_allowed": 320.8,
      "passing_yards_allowed": 3295,
      "passing_tds_allowed": 21,
      "interceptions": 20,
      "rushing_yards_allowed": 1837,
      "rushing_tds_allowed": 11,
      "sacks": 47,
      "turnovers_forced": 35,
      "third_down_pct_allowed": 35.2,
      "red_zone_td_pct_allowed": 52.3
    },

    "special_teams": {
      "fg_made": 28,
      "fg_attempts": 32,
      "fg_pct": 87.5,
      "fg_50_plus_made": 4,
      "xp_made": 74,
      "xp_attempts": 75,
      "punt_average": 44.2,
      "net_punt_average": 40.1,
      "punt_return_average": 12.3,
      "kick_return_average": 24.8,
      "return_tds": 2
    },

    "advanced": {
      "offensive_dvoa": 35.2,
      "defensive_dvoa": -18.5,
      "special_teams_dvoa": 5.1,
      "total_dvoa": 58.8,
      "pythagorean_wins": 14.8,
      "simple_rating_system": 16.3,
      "strength_of_schedule": -1.2
    },

    "playoff": {
      "playoff_appearance": true,
      "playoff_wins": 2,
      "playoff_losses": 1,
      "super_bowl_appearance": true,
      "super_bowl_winner": false,
      "conference_champion": true,
      "division_champion": true
    }
  }
}
```

### Field Count by Category
- **Metadata:** 5 fields
- **Record:** 7 fields
- **Offense:** 15 fields
- **Defense:** 14 fields
- **Special Teams:** 11 fields
- **Advanced:** 7 fields
- **Playoff:** 7 fields
- **Additional Metrics:** ~54 fields (detailed breakdowns)

**Total:** ~120 fields per team-season record

---

## Section 6: All-Time Leaderboards (P0)

**Total Fields:** ~45 fields per leaderboard entry

### Description
Multi-dimensional leaderboards allowing ranking by any stat across various filters (all-time, era, position, team, playoff/regular season, active/retired).

### Leaderboard Types

1. **All-Time Leaderboards**
   - Passing: yards, TDs, completions, rating, wins
   - Rushing: yards, TDs, attempts, yards per carry
   - Receiving: receptions, yards, TDs, yards per reception
   - Defense: tackles, sacks, interceptions, forced fumbles
   - Kicking: points, FG made, FG%, longest
   - Punting: average, inside 20, net average

2. **Era-Based Leaderboards**
   - 1970s, 1980s, 1990s, 2000s, 2010s, 2020s
   - Dead Ball Era, Modern Era, Pass-Happy Era

3. **Position-Specific Leaderboards**
   - QB, RB, WR, TE, OL, DL, LB, DB, K, P

4. **Team-Specific Leaderboards**
   - All-time leaders for each franchise

5. **Playoff Leaderboards**
   - Playoff-only stats, Super Bowl stats

6. **Active vs Retired**
   - Current active leaders, retired leaders

### Data Structure

```json
{
  "leaderboard_entry": {
    "rank": 1,
    "player_id": "rice-jerry",
    "player_name": "Jerry Rice",
    "position": "WR",
    "teams": ["SF", "OAK", "SEA"],
    "primary_team": "SF",
    "seasons_played": 20,
    "career_span": "1985-2004",
    "status": "retired",
    "hall_of_fame": true,

    "stat_value": 22895,
    "stat_name": "receiving_yards",
    "stat_display": "22,895 yards",

    "context": {
      "games_played": 303,
      "per_game_average": 75.6,
      "seasons_to_achieve": 20,
      "peak_season": 1995,
      "peak_season_value": 1848
    },

    "comparisons": {
      "rank_alltime": 1,
      "rank_era": 1,
      "rank_position": 1,
      "rank_team_franchise": 1,
      "distance_to_2nd_place": 1005,
      "distance_to_10th_place": 8346,
      "percentile": 100.0
    },

    "active_comparison": {
      "closest_active_player": "adams-davante",
      "closest_active_value": 11274,
      "years_to_catch": "estimated_10+"
    }
  }
}
```

### Field Count
- **Leaderboard Metadata:** 10 fields
- **Player Info:** 8 fields
- **Stat Value:** 3 fields
- **Context:** 5 fields
- **Comparisons:** 6 fields
- **Active Comparison:** 3 fields
- **Related Records:** 10 fields (array)

**Total:** ~45 fields per leaderboard entry

---

## Section 7: Historical Context & Metadata (P0)

**Total Fields:** ~40 fields for contextual data

### Description
Rich historical context that powers storytelling, comparisons, and narrative features. Includes era definitions, rule changes, historical events, and related players.

### Data Structure

```json
{
  "historical_context": {
    "eras": [
      {
        "era_id": "modern_era",
        "era_name": "Modern Era",
        "start_year": 1970,
        "end_year": 1977,
        "description": "AFL-NFL merger era",
        "rule_changes": [
          "AFL-NFL merger (1970)",
          "Sudden death overtime introduced (1974)",
          "Goal posts moved to end line (1974)"
        ],
        "dominant_teams": ["MIA", "PIT", "OAK", "DAL"],
        "dominant_players": ["bradshaw-terry", "griese-bob", "staubach-roger"]
      },
      {
        "era_id": "passing_era",
        "era_name": "Modern Passing Era",
        "start_year": 2004,
        "end_year": 2024,
        "description": "Pass-happy era with rule changes favoring offense",
        "rule_changes": [
          "Illegal contact emphasis (2004)",
          "Defenseless receiver rules (2011)",
          "Targeting rules (2018)"
        ],
        "statistical_context": {
          "avg_passing_yards_per_game": 248.3,
          "avg_passing_tds_per_game": 1.8,
          "avg_passer_rating": 89.2
        }
      }
    ],

    "season_context": {
      "season": 2007,
      "notable_events": [
        "Patriots 16-0 regular season",
        "Brady 50 TD passes",
        "Moss 23 TD receptions",
        "Favre retirement speculation"
      ],
      "rule_changes": [],
      "expansion_teams": [],
      "labor_issues": false
    },

    "player_context": {
      "player_id": "manning-peyton",
      "contemporaries": [
        {
          "player_id": "brady-tom",
          "player_name": "Tom Brady",
          "relationship": "rival_qb",
          "head_to_head_record": "6-11",
          "era_overlap": "2001-2015"
        }
      ],
      "era_rank": 1,
      "era_peers_comparison": {
        "passing_yards": {
          "manning_value": 71940,
          "era_avg": 38245,
          "percentile": 99.8
        }
      }
    }
  }
}
```

### Field Count
- **Era Definitions:** 15 fields per era
- **Season Context:** 10 fields per season
- **Player Context:** 15 fields per player

**Total:** ~40 fields for contextual data

---

## Section 8: Advanced Analytics (P0)

**Total Fields:** ~35 fields per player/team/play

### Description
Advanced statistical metrics including EPA, DVOA, success rate, CPOE, and Next Gen Stats (when available).

### Data Structure

```json
{
  "advanced_analytics": {
    "player_id": "mahomes-patrick",
    "season": 2024,

    "epa_metrics": {
      "total_epa": 142.3,
      "epa_per_play": 0.28,
      "passing_epa": 145.8,
      "rushing_epa": -3.5,
      "epa_rank_qb": 1,
      "epa_rank_all": 1
    },

    "success_rate": {
      "overall_success_rate": 54.2,
      "passing_success_rate": 56.1,
      "rushing_success_rate": 42.3,
      "early_down_success_rate": 52.8,
      "late_down_success_rate": 48.9,
      "third_down_success_rate": 51.2
    },

    "cpoe": {
      "cpoe_overall": 6.3,
      "cpoe_short": 8.1,
      "cpoe_medium": 5.2,
      "cpoe_deep": 4.8,
      "expected_completion_pct": 64.2,
      "actual_completion_pct": 70.5
    },

    "next_gen_stats": {
      "avg_time_to_throw": 2.68,
      "avg_completed_air_yards": 7.8,
      "avg_intended_air_yards": 8.9,
      "aggressiveness": 18.2,
      "max_completed_air_distance": 58.3,
      "avg_air_yards_differential": 1.1,
      "completion_pct_above_expectation": 6.3
    },

    "dvoa": {
      "total_dvoa": 42.8,
      "passing_dvoa": 45.2,
      "rushing_dvoa": -8.3,
      "dvoa_rank": 1
    },

    "win_probability": {
      "total_wp_added": 3.2,
      "clutch_wp_added": 1.8,
      "avg_leverage_index": 1.12
    }
  }
}
```

### Field Count
- **EPA Metrics:** 6 fields
- **Success Rate:** 7 fields
- **CPOE:** 7 fields
- **Next Gen Stats:** 7 fields (2016-2024 only)
- **DVOA:** 4 fields
- **Win Probability:** 3 fields

**Total:** ~35 fields per record

---

## Section 9: Situational Splits (P0)

**Total Fields:** ~200 fields for all splits

### Description
Performance broken down by various situational contexts: home/away, by opponent, down/distance, field position, score differential, quarter, weather.

### Split Categories

1. **Home vs Away**
   - All core stats split by home/away

2. **By Opponent**
   - Performance vs each of 32 teams

3. **By Down**
   - 1st down, 2nd down, 3rd down, 4th down

4. **By Distance**
   - Short (1-3), Medium (4-6), Long (7+)

5. **By Field Position**
   - Own territory, midfield, opponent territory, red zone, goal line

6. **By Score Differential**
   - Leading, trailing, tied, leading by 7+, trailing by 7+

7. **By Quarter**
   - 1st, 2nd, 3rd, 4th, OT

8. **By Weather**
   - Indoor, outdoor, clear, rain, snow, wind

### Data Structure

```json
{
  "situational_splits": {
    "player_id": "mahomes-patrick",
    "season": 2024,

    "home_away": {
      "home": {
        "games": 8,
        "pass_attempts": 272,
        "pass_completions": 185,
        "pass_yards": 2240,
        "pass_tds": 18,
        "passer_rating": 108.2
      },
      "away": {
        "games": 8,
        "pass_attempts": 268,
        "pass_completions": 178,
        "pass_yards": 2156,
        "pass_tds": 16,
        "passer_rating": 104.1
      }
    },

    "by_down": {
      "first_down": {
        "attempts": 180,
        "completions": 125,
        "yards": 1650,
        "tds": 12,
        "success_rate": 58.3
      },
      "second_down": {
        "attempts": 145,
        "completions": 98,
        "yards": 1240,
        "tds": 9,
        "success_rate": 52.4
      },
      "third_down": {
        "attempts": 188,
        "completions": 120,
        "yards": 1350,
        "tds": 11,
        "success_rate": 48.9,
        "conversion_rate": 45.2
      },
      "fourth_down": {
        "attempts": 27,
        "completions": 20,
        "yards": 156,
        "tds": 2,
        "success_rate": 74.1
      }
    },

    "red_zone": {
      "opportunities": 45,
      "pass_attempts": 52,
      "pass_completions": 38,
      "pass_tds": 24,
      "td_rate": 53.3,
      "success_rate": 68.2
    },

    "by_quarter": {
      "q1": { "attempts": 130, "yards": 1050, "tds": 8 },
      "q2": { "attempts": 142, "yards": 1180, "tds": 10 },
      "q3": { "attempts": 125, "yards": 980, "tds": 7 },
      "q4": { "attempts": 138, "yards": 1180, "tds": 9 },
      "ot": { "attempts": 5, "yards": 46, "tds": 0 }
    },

    "clutch": {
      "fourth_quarter_comebacks": 2,
      "game_winning_drives": 3,
      "final_2_min_attempts": 42,
      "final_2_min_completions": 28,
      "final_2_min_tds": 5
    }
  }
}
```

### Field Count by Split Type
- **Home/Away:** 30 fields (15 stats × 2)
- **By Down:** 40 fields (10 stats × 4 downs)
- **By Quarter:** 25 fields (5 stats × 5 periods)
- **Red Zone:** 10 fields
- **By Opponent:** 320 fields (10 stats × 32 teams)
- **Weather:** 40 fields (10 stats × 4 conditions)
- **Score Differential:** 50 fields (10 stats × 5 situations)

**Total:** ~200 unique split fields (many are arrays/objects)

---

## Section 10: Awards & Accolades (P0)

**Total Fields:** ~50 fields per player

### Description
Complete awards, honors, championships, and accolades for every player.

### Data Structure

```json
{
  "player_awards": {
    "player_id": "brady-tom",
    "player_name": "Tom Brady",

    "mvp_awards": {
      "total_count": 3,
      "years": [2007, 2010, 2017],
      "vote_details": [
        {
          "year": 2007,
          "votes_received": 49,
          "total_votes": 50,
          "vote_pct": 98.0,
          "runner_up": "favre-brett"
        }
      ]
    },

    "championships": {
      "super_bowl_wins": 7,
      "super_bowl_appearances": 10,
      "super_bowl_mvps": 5,
      "super_bowl_years_won": [2001, 2003, 2004, 2014, 2016, 2018, 2020],
      "super_bowl_years_lost": [2007, 2011, 2017],
      "conference_championships": 10,
      "division_titles": 17
    },

    "pro_bowl": {
      "selections": 15,
      "years": [2001, 2004, 2005, 2007, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2021],
      "starts": 8,
      "pro_bowl_mvps": 0
    },

    "all_pro": {
      "first_team_total": 3,
      "second_team_total": 2,
      "total_selections": 5,
      "first_team_years": [2007, 2010, 2017],
      "second_team_years": [2005, 2016]
    },

    "other_awards": {
      "offensive_player_of_year": 2,
      "offensive_player_of_year_years": [2007, 2010],
      "comeback_player_of_year": 1,
      "comeback_player_of_year_years": [2009],
      "walter_payton_man_of_year": 0,
      "rookie_of_year": 0
    },

    "hall_of_fame": {
      "inducted": false,
      "eligible_year": 2027,
      "first_ballot_lock": true,
      "hof_probability": 100.0
    },

    "records_and_milestones": {
      "records_held_count": 28,
      "milestones_achieved": [
        {
          "milestone": "50 TD passes",
          "season": 2007,
          "value": 50,
          "rank_alltime": 2
        },
        {
          "milestone": "500 career TD passes",
          "date": "2021-10-03",
          "game_id": "2021_04_TB_NE"
        }
      ]
    }
  }
}
```

### Field Count
- **MVP Awards:** 8 fields
- **Championships:** 10 fields
- **Pro Bowl:** 5 fields
- **All-Pro:** 6 fields
- **Other Awards:** 7 fields
- **Hall of Fame:** 5 fields
- **Records & Milestones:** ~15 fields (array)

**Total:** ~50 fields per player

---

## Section 11: Visualization Data Structures (P1)

**Total Fields:** Varies by visualization type

### Description
Pre-calculated data structures optimized for common visualizations: time series, career arcs, scatter plots, distributions, heatmaps.

### Visualization Types

1. **Career Arc (Time Series)**
2. **Scatter Plot Data**
3. **Distribution Histograms**
4. **Heatmaps (Field Position, Down/Distance)**
5. **Comparison Charts**
6. **Trend Lines**

### Data Structure Example

```json
{
  "career_arc_visualization": {
    "player_id": "manning-peyton",
    "stat_tracked": "passing_yards",
    "data_points": [
      {
        "season": 1998,
        "age": 22,
        "value": 3739,
        "rank_that_year": 5,
        "percentile": 85.2
      },
      {
        "season": 1999,
        "age": 23,
        "value": 4135,
        "rank_that_year": 3,
        "percentile": 92.1
      }
    ],
    "trend_line": {
      "slope": 145.2,
      "intercept": 3200,
      "r_squared": 0.82
    },
    "annotations": [
      {
        "season": 2013,
        "note": "Record 5,477 yards",
        "icon": "star"
      }
    ]
  }
}
```

---

## Section 12: Export Formats (P1)

**Total Fields:** N/A (export functionality)

### Description
Support for exporting historical data in various formats for external analysis.

### Export Formats

1. **CSV Export**
   - Player season stats
   - Game logs
   - Team stats

2. **JSON Export**
   - Full data structures
   - API-compatible format

3. **Excel Export**
   - Multi-sheet workbooks
   - Formatted tables

4. **PDF Reports**
   - Player career summaries
   - Season recaps
   - Leaderboard printouts

---

## Data Source Mapping

| Section | Primary Source | Secondary Sources | Coverage |
|---------|---------------|-------------------|----------|
| Player Season Stats | nflreadpy | Manual curation | 95% |
| Player Game Logs | nflreadpy | sportsref-nfl | 92% |
| Player Career Aggregates | Calculated | nflreadpy | 100% |
| Play-by-Play | sportsref-nfl | nflscraPy | 90% |
| Team Season Stats | nflreadpy | Manual curation | 95% |
| All-Time Leaderboards | Calculated | nflreadpy | 100% |
| Historical Context | Manual curation | Research | 80% |
| Advanced Analytics | nflscraPy | nflreadpy | 75% |
| Situational Splits | Calculated | sportsref-nfl | 85% |
| Awards & Accolades | Manual curation | Wikipedia | 90% |
| Visualizations | Calculated | All sources | 100% |
| Export Formats | Generated | All sources | 100% |

---

## Implementation Priority

### P0 - Critical (Must Have for MVP)
1. Player Season Stats
2. Player Game Logs
3. Player Career Aggregates
4. Team Season Stats
5. All-Time Leaderboards
6. Awards & Accolades
7. Basic Situational Splits (home/away, by quarter)

### P1 - Important (High Value)
8. Play-by-Play Data
9. Advanced Analytics
10. Full Situational Splits
11. Historical Context
12. Visualization Data Structures

### P2 - Nice to Have
13. Export Formats (can add later)

---

## Success Criteria

✅ **Coverage Goals:**
- 95%+ coverage for player season stats (1970-2024)
- 90%+ coverage for game logs (1970-2024)
- 100% career aggregates (calculated from season stats)
- 90%+ play-by-play coverage (1999-2024, limited before 1999)
- 95%+ team season stats
- 100% leaderboards (calculated)
- 80%+ historical context
- 75%+ advanced analytics (EPA limited before 1999)

✅ **Performance Targets:**
- Season stats query: <500ms
- Game log query: <1s
- Leaderboard query: <2s
- Play-by-play query: <3s (large dataset)

✅ **Integration:**
- Full integration with player profile cards
- Team pages reference team season stats
- Game pages pull from play-by-play
- Record chase pages use leaderboards

---

**Document Status:** Requirements Complete - Ready for data list, JSON mapping, and master report
**Total Estimated Fields:** ~850 unique field definitions
**Next Steps:**
1. Create exhaustive field list (data-list.md)
2. Map all fields to data sources (JSON)
3. Generate coverage report (master-data-source-report.md)
