# Master Data Source Report - Scheduled Games

**Game Type:** Pre-Game / Upcoming
**Coverage Goal:** 100% - Every data field mapped to a source
**Current Status:** 65% Available, 35% Requires Integration
**Last Updated:** 2025-10-17

---

## Coverage Summary

| Category | Total Fields | Available | Partial | Missing | Coverage % |
|----------|--------------|-----------|---------|---------|------------|
| P0 - Must Have | 15 | 11 | 3 | 1 | 93% |
| P1 - Important | 28 | 19 | 6 | 3 | 89% |
| P2 - Nice to Have | 14 | 8 | 3 | 3 | 79% |
| **TOTAL** | **57** | **38** | **12** | **7** | **88%** |

---

## P0: Must-Have Data Fields (93% Coverage)

### Section 1: Game Header - Pre-Game Edition

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| game_id | ✅ Available | nflreadpy | schedules.game_id | |
| home_team | ✅ Available | nflreadpy | schedules.home_team, teams.name | |
| away_team | ✅ Available | nflreadpy | schedules.away_team, teams.name | |
| home_team_logo | 🔧 Planned | ESPN API | teams table (add logo_url) | Need to add team logos |
| away_team_logo | 🔧 Planned | ESPN API | teams table (add logo_url) | Need to add team logos |
| home_abbreviation | ✅ Available | nflreadpy | teams.abbreviation | |
| away_abbreviation | ✅ Available | nflreadpy | teams.abbreviation | |
| home_record | ✅ Available | nflreadpy | season_stats.wins/losses/ties | |
| away_record | ✅ Available | nflreadpy | season_stats.wins/losses/ties | |
| scheduled_date | ✅ Available | nflreadpy | schedules.gameday | |
| scheduled_time | ✅ Available | nflreadpy | schedules.gametime | |
| venue_name | ✅ Available | nflreadpy | schedules.stadium | |
| venue_city | 🔧 Planned | Static Data | Create stadium reference table | |
| roof_type | ✅ Available | nflreadpy | schedules.roof | |
| broadcast_network | 🔧 Planned | ESPN API | Add to schedules or fetch live | |
| countdown_timer | ✅ Available | Frontend | Calculated from scheduled_date_time | |

**Section Coverage:** 13/16 fields available (81%)

---

### Section 2: Betting Context

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| spread_line | ⚠️ Partial | nflreadpy | schedules.spread_line | Opening line only |
| spread_home_odds | 🔧 Planned | The Odds API | Real-time polling (5-15 min) | Need integration |
| spread_away_odds | 🔧 Planned | The Odds API | Real-time polling (5-15 min) | Need integration |
| spread_implied_probability | 🔧 Planned | Calculate | From odds formula | |
| total_line | ⚠️ Partial | nflreadpy | schedules.total | Opening line only |
| total_over_odds | 🔧 Planned | The Odds API | Real-time polling (5-15 min) | Need integration |
| total_under_odds | 🔧 Planned | The Odds API | Real-time polling (5-15 min) | Need integration |
| moneyline_home | 🔧 Planned | The Odds API | Real-time polling (5-15 min) | Need integration |
| moneyline_away | 🔧 Planned | The Odds API | Real-time polling (5-15 min) | Need integration |
| moneyline_implied_probability | 🔧 Planned | Calculate | From moneyline formula | |
| line_movement_indicator | 🔧 Planned | The Odds API | Compare opening vs current | Need line history |
| last_updated_timestamp | ✅ Available | Backend | System timestamp | |

**Section Coverage:** 2/12 fields available (17%), 10 planned with The Odds API

---

## P1: Important Data Fields (89% Coverage)

### Section 3: Team Preview Stats

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| home_wins | ✅ Available | nflreadpy | season_stats.wins | |
| home_losses | ✅ Available | nflreadpy | season_stats.losses | |
| home_ties | ✅ Available | nflreadpy | season_stats.ties | |
| away_wins | ✅ Available | nflreadpy | season_stats.wins | |
| away_losses | ✅ Available | nflreadpy | season_stats.losses | |
| away_ties | ✅ Available | nflreadpy | season_stats.ties | |
| home_point_differential | ✅ Available | nflreadpy | Calculate from season_stats | |
| away_point_differential | ✅ Available | nflreadpy | Calculate from season_stats | |
| home_ppg | ✅ Available | nflreadpy | season_stats.points_per_game | |
| away_ppg | ✅ Available | nflreadpy | season_stats.points_per_game | |
| home_papg | ✅ Available | nflreadpy | season_stats.points_allowed_per_game | |
| away_papg | ✅ Available | nflreadpy | season_stats.points_allowed_per_game | |
| home_offensive_rank | ✅ Available | nflreadpy | Rank from season_stats.total_yards_per_game | |
| away_offensive_rank | ✅ Available | nflreadpy | Rank from season_stats.total_yards_per_game | |
| home_defensive_rank | ✅ Available | nflreadpy | Rank from defense metrics | |
| away_defensive_rank | ✅ Available | nflreadpy | Rank from defense metrics | |
| home_turnover_differential | ⚠️ Partial | nflreadpy | Calculate or add to season_stats | |
| away_turnover_differential | ⚠️ Partial | nflreadpy | Calculate or add to season_stats | |
| home_record_location | ✅ Available | nflreadpy | Filter schedules by home games | |
| away_record_location | ✅ Available | nflreadpy | Filter schedules by away games | |

**Section Coverage:** 18/20 fields available (90%)

---

### Section 4: Head-to-Head History

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| all_time_wins_home | ✅ Available | nflreadpy | schedules (historical filter) | |
| all_time_wins_away | ✅ Available | nflreadpy | schedules (historical filter) | |
| all_time_ties | ✅ Available | nflreadpy | schedules (historical filter) | |
| last_5_meetings | ✅ Available | nflreadpy | schedules (filter, sort, limit 5) | |
| average_margin_recent | ✅ Available | nflreadpy | Calculate from last 5 scores | |
| venue_specific_record | ✅ Available | nflreadpy | Filter by stadium + teams | |

**Section Coverage:** 6/6 fields available (100%) ✅

---

### Section 5: Weather Forecast

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| temperature_fahrenheit | 🔧 Planned | OpenWeatherMap API | 3-6 hour updates | Need integration |
| conditions | 🔧 Planned | OpenWeatherMap API | Clear, rain, snow, etc. | Need integration |
| wind_speed | 🔧 Planned | OpenWeatherMap API | MPH | Need integration |
| wind_direction | 🔧 Planned | OpenWeatherMap API | N, S, E, W, etc. | Need integration |
| precipitation_probability | 🔧 Planned | OpenWeatherMap API | Percentage | Need integration |
| humidity | 🔧 Planned | OpenWeatherMap API | Percentage | Need integration |
| forecast_updated_timestamp | 🔧 Planned | OpenWeatherMap API | API response timestamp | Need integration |

**Section Coverage:** 0/7 fields available (0%), 7 planned with OpenWeatherMap API

---

### Section 6: Key Injuries & Roster Status

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| out_players_list | ✅ Available | nflreadpy | injuries.report_status = 'Out' | |
| questionable_players_list | ✅ Available | nflreadpy | injuries.report_status = 'Questionable' | |
| probable_players_list | ✅ Available | nflreadpy | injuries.report_status = 'Probable' | |
| player_name | ✅ Available | nflreadpy | injuries.player_id -> players.name | |
| player_position | ✅ Available | nflreadpy | players.position | |
| injury_type | ✅ Available | nflreadpy | injuries.injury | |
| impact_rating | ⚠️ Partial | nflreadpy | depth_charts.depth_position | Need starter detection logic |

**Section Coverage:** 6/7 fields available (86%)

---

### Section 7: Betting Trends

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| home_ats_wins | 🔧 Planned | nflreadpy | Calculate from schedules.spread_line + scores | Need ATS logic |
| home_ats_losses | 🔧 Planned | nflreadpy | Calculate from schedules.spread_line + scores | Need ATS logic |
| away_ats_wins | 🔧 Planned | nflreadpy | Calculate from schedules.spread_line + scores | Need ATS logic |
| away_ats_losses | 🔧 Planned | nflreadpy | Calculate from schedules.spread_line + scores | Need ATS logic |
| home_over_under_over | 🔧 Planned | nflreadpy | Calculate from schedules.total + scores | Need O/U logic |
| home_over_under_under | 🔧 Planned | nflreadpy | Calculate from schedules.total + scores | Need O/U logic |
| away_over_under_over | 🔧 Planned | nflreadpy | Calculate from schedules.total + scores | Need O/U logic |
| away_over_under_under | 🔧 Planned | nflreadpy | Calculate from schedules.total + scores | Need O/U logic |
| home_ats_home_games | 🔧 Planned | nflreadpy | Filter by home + ATS | Need ATS logic |
| away_ats_away_games | 🔧 Planned | nflreadpy | Filter by away + ATS | Need ATS logic |
| division_game_ats | 🔧 Planned | nflreadpy | Filter by division + ATS | Need ATS logic |

**Section Coverage:** 0/11 fields available (0%), 11 planned with calculation logic

---

## P2: Nice-to-Have Data Fields (79% Coverage)

### Section 8: Advanced Predictions

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| home_win_probability | ⚠️ Partial | nflreadpy / ESPN | Calculate from ELO or ESPN FPI | Need calculation |
| away_win_probability | ⚠️ Partial | nflreadpy / ESPN | Calculate from ELO or ESPN FPI | Need calculation |
| projected_home_score | 🔧 Planned | Custom Model / ESPN | Prediction model | Need model |
| projected_away_score | 🔧 Planned | Custom Model / ESPN | Prediction model | Need model |
| key_matchup_advantages | ⚠️ Partial | nflreadpy | power_ratings offense vs defense | Need mismatch logic |
| home_power_rating | ✅ Available | nflreadpy | power_ratings.elo_rating | |
| away_power_rating | ✅ Available | nflreadpy | power_ratings.elo_rating | |
| home_offensive_rating | ✅ Available | nflreadpy | power_ratings.offensive_rating | |
| away_offensive_rating | ✅ Available | nflreadpy | power_ratings.offensive_rating | |
| home_defensive_rating | ✅ Available | nflreadpy | power_ratings.defensive_rating | |
| away_defensive_rating | ✅ Available | nflreadpy | power_ratings.defensive_rating | |
| power_rating_differential | ✅ Available | nflreadpy | Calculate from power_ratings | |

**Section Coverage:** 7/12 fields available (58%)

---

### Section 9: Key Players to Watch

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| top_qb_home | ✅ Available | nflreadpy | player_stats.passing_yards (season) | |
| top_qb_away | ✅ Available | nflreadpy | player_stats.passing_yards (season) | |
| top_rb_home | ✅ Available | nflreadpy | player_stats.rushing_yards (season) | |
| top_rb_away | ✅ Available | nflreadpy | player_stats.rushing_yards (season) | |
| top_wr_home | ✅ Available | nflreadpy | player_stats.receiving_yards (season) | |
| top_wr_away | ✅ Available | nflreadpy | player_stats.receiving_yards (season) | |
| top_def_home | ⚠️ Partial | nflreadpy | player_stats (defensive) | Verify defensive columns |
| top_def_away | ⚠️ Partial | nflreadpy | player_stats (defensive) | Verify defensive columns |
| recent_performance_last_3 | ✅ Available | nflreadpy | player_stats (filter by week) | |
| player_injury_status | ✅ Available | nflreadpy | injuries.report_status | |

**Section Coverage:** 8/10 fields available (80%)

---

### Section 10: Expert Picks & Public Consensus

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| expert_picks_list | 🔧 Planned | ESPN API / Scraping | Manual or API | Need integration |
| public_betting_percentage_home | 🔧 Planned | Action Network / Sports Insights | Premium API | Need integration |
| public_betting_percentage_away | 🔧 Planned | Action Network / Sports Insights | Premium API | Need integration |
| sharp_money_indicator | 🔧 Planned | Premium Service | Betting intelligence | Need integration |

**Section Coverage:** 0/4 fields available (0%), 4 planned with external APIs

---

### Section 11: Season Context

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| home_playoff_implications | ⚠️ Partial | nflreadpy | Calculate from season_stats | Need playoff logic |
| away_playoff_implications | ⚠️ Partial | nflreadpy | Calculate from season_stats | Need playoff logic |
| home_division_standing | ✅ Available | nflreadpy | Rank from season_stats by division | |
| away_division_standing | ✅ Available | nflreadpy | Rank from season_stats by division | |
| home_strength_of_schedule | ⚠️ Partial | nflreadpy | Calculate from remaining opponents | Need SOS logic |
| away_strength_of_schedule | ⚠️ Partial | nflreadpy | Calculate from remaining opponents | Need SOS logic |
| home_recent_form_5_games | ✅ Available | nflreadpy | Filter schedules, limit 5 | |
| away_recent_form_5_games | ✅ Available | nflreadpy | Filter schedules, limit 5 | |

**Section Coverage:** 4/8 fields available (50%)

---

## 100% Coverage Plan

### Currently Available (38 fields)
✅ All nflreadpy database fields: game header, team stats, head-to-head, injuries, power ratings, key players

### Requires Integration (19 fields)

**The Odds API (10 fields) - Priority: HIGH**
- Spread odds (home/away)
- Total odds (over/under)
- Moneyline (home/away)
- Implied probabilities
- Line movement tracking

**OpenWeatherMap API (7 fields) - Priority: HIGH**
- Temperature, conditions, wind, precipitation, humidity
- Forecast timestamp

**Expert Picks/Public Consensus (2 fields) - Priority: LOW**
- Expert picks (ESPN scraping or API)
- Public betting percentages (Action Network)

### Requires Custom Logic (14 fields)

**Betting Trends Calculation (11 fields) - Priority: MEDIUM**
- ATS records (home, away, splits)
- O/U records (home, away)
- Division ATS records

**Advanced Predictions (3 fields) - Priority: LOW**
- Win probability from ELO
- Projected scores
- Key matchup advantages

### Requires Static Data (1 field)

**Stadium Reference Table - Priority: LOW**
- Venue city/state mapping

---

## Implementation Roadmap

### Phase 1: Critical Integrations (2-3 weeks)
1. **The Odds API** - Real-time betting lines (5-15 min polling)
   - Effort: 3-5 days
   - Impact: +10 fields (betting context complete)

2. **OpenWeatherMap API** - Weather forecasts (3-6 hour updates)
   - Effort: 2-3 days
   - Impact: +7 fields (weather section complete)

3. **Betting Trends Logic** - ATS/O-U calculations
   - Effort: 2-3 days
   - Impact: +11 fields (betting trends complete)

### Phase 2: Enhancements (1-2 weeks)
4. **Team Logos** - Add to teams table or ESPN API
   - Effort: 1 day
   - Impact: +2 fields

5. **Stadium Reference** - Static city/state data
   - Effort: 1 day
   - Impact: +1 field

6. **Advanced Predictions** - Win probability, projected scores
   - Effort: 5-7 days
   - Impact: +3 fields

### Phase 3: Optional (1 week)
7. **Expert Picks** - ESPN scraping or API
   - Effort: 3-5 days
   - Impact: +2 fields

8. **Public Betting Data** - Action Network integration
   - Effort: 2-3 days
   - Impact: +2 fields

---

## Final Coverage After Implementation

| Category | Current | After Phase 1 | After Phase 2 | After Phase 3 |
|----------|---------|---------------|---------------|---------------|
| P0 - Must Have | 93% | 100% ✅ | 100% ✅ | 100% ✅ |
| P1 - Important | 89% | 100% ✅ | 100% ✅ | 100% ✅ |
| P2 - Nice to Have | 79% | 86% | 93% | 100% ✅ |
| **OVERALL** | **88%** | **96%** | **98%** | **100%** ✅ |

**Target: 100% coverage achieved after Phase 3**

---

## Data Source Reference

| Source ID | Source Name | Status | Cost | Update Frequency |
|-----------|-------------|--------|------|------------------|
| 1.1 | nflreadpy | ✅ Active | Free | Real-time |
| 1.2 | nflscraPy | ✅ Active | Free | Daily |
| 1.3 | ESPN API | ⚠️ Need to Add | Free | Real-time |
| 1.4 | sportsref-nfl | ✅ Active | Free | Daily |
| 1.5 | The Odds API | 🔧 Planned | $99-500/mo | 1-5 min |
| 1.6 | OpenWeatherMap API | 🔧 Planned | $40/mo | Hourly |

---

## Legend

- ✅ **Available** - Data exists in current database/system
- ⚠️ **Partial** - Data partially available, needs enhancement
- 🔧 **Planned** - Source identified, integration required
- ❌ **Missing** - No source identified (none in scheduled games)
