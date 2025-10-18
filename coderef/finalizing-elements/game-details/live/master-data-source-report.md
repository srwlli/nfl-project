# Master Data Source Report - Live Games

**Game Type:** In-Progress / Live
**Coverage Goal:** 100% - Every data field mapped to a source
**Current Status:** 40% Available, 60% Requires Integration
**Last Updated:** 2025-10-17

---

## Coverage Summary

| Category | Total Fields | Available | Partial | Missing | Coverage % |
|----------|--------------|-----------|---------|---------|------------|
| P0 - Must Have | 32 | 8 | 18 | 6 | 81% |
| P1 - Important | 45 | 4 | 24 | 17 | 62% |
| P2 - Nice to Have | 12 | 4 | 4 | 4 | 67% |
| **TOTAL** | **89** | **16** | **46** | **27** | **70%** |

---

## P0: Must-Have Data Fields (81% Coverage)

### Section 1: Game Header - Live Edition (Update: Every 10-15 seconds)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| game_id | ✅ Available | nflreadpy / ESPN | schedules.game_id | |
| home_team_name | ✅ Available | nflreadpy | teams.name | |
| away_team_name | ✅ Available | nflreadpy | teams.name | |
| home_team_logo | 🔧 Planned | ESPN API | Add to teams table | Need team logos |
| away_team_logo | 🔧 Planned | ESPN API | Add to teams table | Need team logos |
| home_abbreviation | ✅ Available | nflreadpy | teams.abbreviation | |
| away_abbreviation | ✅ Available | nflreadpy | teams.abbreviation | |
| current_score_home | 🔧 Planned | ESPN API | Live scoreboard endpoint | CRITICAL: Need ESPN live API |
| current_score_away | 🔧 Planned | ESPN API | Live scoreboard endpoint | CRITICAL: Need ESPN live API |
| game_status_live_badge | 🔧 Planned | ESPN API | Live game status | CRITICAL: Need ESPN live API |
| quarter | 🔧 Planned | ESPN / nflreadpy | Live pbp or ESPN API | CRITICAL: Need real-time source |
| time_remaining | 🔧 Planned | ESPN API | Live clock (MM:SS) | CRITICAL: Need ESPN live API |
| possession_team | ⚠️ Partial | ESPN / nflreadpy | play_by_play.posteam (latest) | Need real-time updates |
| down | 🔧 Planned | ESPN / nflreadpy | play_by_play.down (add column) | Need to add down column + real-time |
| distance | 🔧 Planned | ESPN / nflreadpy | play_by_play.ydstogo (add column) | Need to add ydstogo column + real-time |
| field_position_yardline | 🔧 Planned | ESPN / nflreadpy | play_by_play.yardline_100 (add column) | Need to add yardline column + real-time |
| field_side | 🔧 Planned | ESPN / nflreadpy | Calculated from yardline | |
| red_zone_indicator | ✅ Available | Calculated | yardline < 20 | Frontend logic |

**Section Coverage:** 5/18 fields available (28%), 13 require ESPN live API + pbp expansion

---

### Section 2: Score Breakdown - Live Updating (Update: Instant after each score)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| home_q1_score | ❌ Missing | ESPN API | Live scoreboard | CRITICAL: Not in database |
| home_q2_score | ❌ Missing | ESPN API | Live scoreboard | CRITICAL: Not in database |
| home_q3_score | ❌ Missing | ESPN API | Live scoreboard | CRITICAL: Not in database |
| home_q4_score | ❌ Missing | ESPN API | Live scoreboard | CRITICAL: Not in database |
| home_ot_score | ❌ Missing | ESPN API | Live scoreboard | CRITICAL: Not in database |
| home_total_score | 🔧 Planned | ESPN API | Live scoreboard | Same as current_score_home |
| away_q1_score | ❌ Missing | ESPN API | Live scoreboard | CRITICAL: Not in database |
| away_q2_score | ❌ Missing | ESPN API | Live scoreboard | CRITICAL: Not in database |
| away_q3_score | ❌ Missing | ESPN API | Live scoreboard | CRITICAL: Not in database |
| away_q4_score | ❌ Missing | ESPN API | Live scoreboard | CRITICAL: Not in database |
| away_ot_score | ❌ Missing | ESPN API | Live scoreboard | CRITICAL: Not in database |
| away_total_score | 🔧 Planned | ESPN API | Live scoreboard | Same as current_score_away |

**Section Coverage:** 0/12 fields available (0%), 12 require ESPN live API

---

### Section 3: Live Drive Tracker (Update: Every play, real-time)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| current_drive_number | ⚠️ Partial | ESPN / nflreadpy | play_by_play.drive (add column) | Need to add drive column |
| possessing_team | ⚠️ Partial | ESPN / nflreadpy | play_by_play.posteam | Need real-time updates |
| drive_start_yardline | 🔧 Planned | ESPN / Calculate | Aggregate from pbp drive | Need drive aggregation logic |
| drive_start_field_side | 🔧 Planned | ESPN / Calculate | Aggregate from pbp drive | Need drive aggregation logic |
| current_yardline | ⚠️ Partial | ESPN / nflreadpy | play_by_play.yardline_100 (latest) | Need to add yardline column |
| current_field_side | ⚠️ Partial | ESPN / nflreadpy | Calculated from yardline | |
| plays_in_drive | 🔧 Planned | ESPN / Calculate | COUNT plays for current drive | Need drive aggregation |
| yards_gained_drive | 🔧 Planned | ESPN / Calculate | SUM yards for current drive | Need drive aggregation |
| time_of_possession_drive | 🔧 Planned | ESPN API | Drive-level stat | ESPN API or complex clock calc |
| drive_result | 🔧 Planned | ESPN / Detect | Ongoing/TD/FG/Punt/Turnover | Need drive end detection logic |
| is_scoring_drive | 🔧 Planned | ESPN / Detect | Boolean | Drive end detection |

**Section Coverage:** 0/11 fields available (0%), 11 require ESPN API + drive logic

---

### Section 4: Last Play Summary (Update: Every 5-15 seconds)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| play_description | ✅ Available | nflreadpy | play_by_play.play_text or .desc | Need real-time ingestion |
| yards_gained | ✅ Available | nflreadpy | play_by_play.yards_gained | Need real-time ingestion |
| down_before | ⚠️ Partial | nflreadpy | play_by_play.down (add column) | Need to add down column |
| distance_before | ⚠️ Partial | nflreadpy | play_by_play.ydstogo (add column) | Need to add ydstogo column |
| result_type | ⚠️ Partial | nflreadpy | play_by_play.play_type | Need event flags (TD, INT, fumble) |
| passer_player_name | ⚠️ Partial | nflreadpy | play_by_play.passer_id (add column) | Need to add player ID columns |
| rusher_player_name | ⚠️ Partial | nflreadpy | play_by_play.rusher_id (add column) | Need to add player ID columns |
| receiver_player_name | ⚠️ Partial | nflreadpy | play_by_play.receiver_id (add column) | Need to add player ID columns |
| tackler_player_name | ⚠️ Partial | nflreadpy | play_by_play.tackle_1 (add column) | Need to add tackler columns |
| clock_time | ✅ Available | nflreadpy | play_by_play.clock | Need real-time ingestion |
| quarter_play | ✅ Available | nflreadpy | play_by_play.quarter | Need real-time ingestion |

**Section Coverage:** 4/11 fields available (36%), 7 require pbp column expansion

---

## P1: Important Data Fields (62% Coverage)

### Section 5: Play-by-Play Feed - Last 10-20 Plays (Update: Every 5-10 seconds)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| recent_plays_array | ⚠️ Partial | nflreadpy | play_by_play (limit 20, order DESC) | Need real-time ingestion |
| play_number | ⚠️ Partial | nflreadpy | play_by_play.play_id or sequence | |
| play_quarter | ✅ Available | nflreadpy | play_by_play.quarter | |
| play_time | ✅ Available | nflreadpy | play_by_play.clock | |
| play_down | ⚠️ Partial | nflreadpy | play_by_play.down (add column) | Need to add down column |
| play_distance | ⚠️ Partial | nflreadpy | play_by_play.ydstogo (add column) | Need to add ydstogo column |
| play_yardline | ⚠️ Partial | nflreadpy | play_by_play.yardline_100 (add column) | Need to add yardline column |
| play_field_side | ⚠️ Partial | Calculated | From yardline_100 | |
| play_description | ✅ Available | nflreadpy | play_by_play.play_text | |
| play_yards_gained | ✅ Available | nflreadpy | play_by_play.yards_gained | |
| play_result_icon | ⚠️ Partial | nflreadpy | From play_type + event flags | Need TD/fumble/INT flags |

**Section Coverage:** 4/11 fields available (36%), 7 require pbp expansion

---

### Section 6: Live Box Score - Key Stats Only (Update: Every 30-60 seconds)

**Passing Stats:**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| qb_completions | 🔧 Planned | ESPN / Aggregate | COUNT passing plays complete | Need aggregation |
| qb_attempts | 🔧 Planned | ESPN / Aggregate | COUNT passing plays | Need aggregation |
| qb_yards | ⚠️ Partial | Aggregate | SUM passing yards from pbp | Need aggregation |
| qb_touchdowns | ⚠️ Partial | Aggregate | COUNT TD passes from pbp | Need TD flag + aggregation |
| qb_interceptions | ⚠️ Partial | Aggregate | COUNT INTs from pbp | Need INT flag + aggregation |
| qb_rating | 🔧 Planned | ESPN / Calculate | From stats formula | Need aggregation |

**Rushing Stats:**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| rb_attempts | 🔧 Planned | ESPN / Aggregate | COUNT rushing plays | Need aggregation |
| rb_yards | ⚠️ Partial | Aggregate | SUM rushing yards from pbp | Need aggregation |
| rb_touchdowns | ⚠️ Partial | Aggregate | COUNT TD rushes from pbp | Need TD flag + aggregation |
| rb_longest | 🔧 Planned | ESPN / Aggregate | MAX rushing yards from pbp | Need aggregation |

**Receiving Stats:**

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| wr_receptions | 🔧 Planned | ESPN / Aggregate | COUNT receptions from pbp | Need aggregation |
| wr_yards | ⚠️ Partial | Aggregate | SUM receiving yards from pbp | Need aggregation |
| wr_touchdowns | ⚠️ Partial | Aggregate | COUNT TD receptions from pbp | Need TD flag + aggregation |
| wr_longest | 🔧 Planned | ESPN / Aggregate | MAX receiving yards from pbp | Need aggregation |

**Section Coverage:** 0/14 fields available (0%), 14 require ESPN API or pbp aggregation

---

### Section 7: Live Team Stats Comparison (Update: Every 30-60 seconds)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| home_total_yards | ⚠️ Partial | ESPN / Aggregate | SUM yards from pbp by team | Need aggregation |
| away_total_yards | ⚠️ Partial | ESPN / Aggregate | SUM yards from pbp by team | Need aggregation |
| home_passing_yards | ⚠️ Partial | ESPN / Aggregate | SUM passing yards by team | Need aggregation |
| away_passing_yards | ⚠️ Partial | ESPN / Aggregate | SUM passing yards by team | Need aggregation |
| home_rushing_yards | ⚠️ Partial | ESPN / Aggregate | SUM rushing yards by team | Need aggregation |
| away_rushing_yards | ⚠️ Partial | ESPN / Aggregate | SUM rushing yards by team | Need aggregation |
| home_first_downs | 🔧 Planned | ESPN API | Team stats endpoint | Better from ESPN API |
| away_first_downs | 🔧 Planned | ESPN API | Team stats endpoint | Better from ESPN API |
| home_third_down_conv | 🔧 Planned | ESPN / Calculate | Need down column in pbp | ESPN API or calc from pbp |
| home_third_down_att | 🔧 Planned | ESPN / Calculate | Need down column in pbp | ESPN API or calc from pbp |
| home_third_down_pct | 🔧 Planned | Calculated | conv / att * 100 | |
| away_third_down_conv | 🔧 Planned | ESPN / Calculate | Need down column in pbp | ESPN API or calc from pbp |
| away_third_down_att | 🔧 Planned | ESPN / Calculate | Need down column in pbp | ESPN API or calc from pbp |
| away_third_down_pct | 🔧 Planned | Calculated | conv / att * 100 | |
| home_turnovers | ⚠️ Partial | ESPN / Count | COUNT fumbles + INTs | Need event flags |
| away_turnovers | ⚠️ Partial | ESPN / Count | COUNT fumbles + INTs | Need event flags |
| home_time_of_possession | 🔧 Planned | ESPN API | Team stats endpoint | Complex clock calc, better from ESPN |
| away_time_of_possession | 🔧 Planned | ESPN API | Team stats endpoint | Complex clock calc, better from ESPN |
| home_penalties | 🔧 Planned | ESPN / Count | COUNT penalty plays | Need penalty flag in pbp |
| home_penalty_yards | 🔧 Planned | ESPN / Sum | SUM penalty yards | Need penalty flag + yards in pbp |
| away_penalties | 🔧 Planned | ESPN / Count | COUNT penalty plays | Need penalty flag in pbp |
| away_penalty_yards | 🔧 Planned | ESPN / Sum | SUM penalty yards | Need penalty flag + yards in pbp |

**Section Coverage:** 0/22 fields available (0%), 22 require ESPN API or pbp aggregation

---

### Section 8: Live Betting Lines (Update: Every 15-30 seconds)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| live_spread_line | 🔧 Planned | The Odds API | Live endpoint (15-30 sec poll) | CRITICAL: Need The Odds API |
| live_spread_home_odds | 🔧 Planned | The Odds API | Live endpoint | CRITICAL: Need The Odds API |
| live_spread_away_odds | 🔧 Planned | The Odds API | Live endpoint | CRITICAL: Need The Odds API |
| live_spread_movement | 🔧 Planned | The Odds API | Compare vs pregame | Track line history |
| live_total_line | 🔧 Planned | The Odds API | Live endpoint | CRITICAL: Need The Odds API |
| live_total_over_odds | 🔧 Planned | The Odds API | Live endpoint | CRITICAL: Need The Odds API |
| live_total_under_odds | 🔧 Planned | The Odds API | Live endpoint | CRITICAL: Need The Odds API |
| live_total_movement | 🔧 Planned | The Odds API | Compare vs pregame | Track line history |
| live_moneyline_home | 🔧 Planned | The Odds API | Live endpoint | CRITICAL: Need The Odds API |
| live_moneyline_away | 🔧 Planned | The Odds API | Live endpoint | CRITICAL: Need The Odds API |
| last_updated_timestamp | ✅ Available | Backend | System timestamp | |

**Section Coverage:** 0/11 fields available (0%), 10 require The Odds API

---

## P2: Nice-to-Have Data Fields (67% Coverage)

### Section 9: Live Highlights / Recent Key Plays (Update: After significant plays)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| highlight_list | 🔧 Planned | ESPN API | Highlights endpoint | Need ESPN highlights API |
| highlight_thumbnail_url | 🔧 Planned | ESPN API | Video thumbnail | Need ESPN highlights API |
| highlight_video_url | 🔧 Planned | ESPN API | Video clip URL | Need ESPN highlights API |
| highlight_description | ⚠️ Partial | nflreadpy | play_by_play.play_text for key plays | Need key play detection |
| highlight_impact_level | ⚠️ Partial | Calculate | EPA swing, WP swing, TD, turnover | Need impact algorithm |

**Section Coverage:** 0/5 fields available (0%), 5 require ESPN API or detection logic

---

### Section 10: Live Win Probability Chart (Update: After each play)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| current_home_win_prob | ⚠️ Partial | nflreadpy / ESPN | play_by_play.wp (add column) | Need to add wp column |
| current_away_win_prob | ⚠️ Partial | Calculated | 100 - home_win_prob | |
| chart_data_array | ⚠️ Partial | nflreadpy | play_by_play.wp for all plays | Need to add wp column |
| play_number_for_chart | ✅ Available | nflreadpy | play_by_play sequence | |
| wp_value_for_chart | ⚠️ Partial | nflreadpy | play_by_play.wp (add column) | Need to add wp column |

**Section Coverage:** 1/5 fields available (20%), 4 require wp column addition

---

### Section 11: Live EPA (Expected Points Added) (Update: After each play)

| Field | Status | Source | Database/API | Notes |
|-------|--------|--------|--------------|-------|
| home_cumulative_epa | ✅ Available | nflreadpy | SUM play_by_play.epa by team | Need aggregation logic |
| away_cumulative_epa | ✅ Available | nflreadpy | SUM play_by_play.epa by team | Need aggregation logic |
| last_play_epa | ✅ Available | nflreadpy | play_by_play.epa (latest play) | |
| epa_chart_data_array | ✅ Available | nflreadpy | play_by_play.epa for all plays | |

**Section Coverage:** 4/4 fields available (100%) ✅

---

## 100% Coverage Plan

### Currently Available (16 fields)
✅ EPA metrics, basic play descriptions, yards gained, quarter, clock

### Requires ESPN API Integration (47 fields)

**ESPN Live Scoreboard (18 fields) - Priority: CRITICAL**
- Current score (home/away)
- Game status (LIVE badge)
- Quarter, time remaining
- Quarter-by-quarter scores (Q1-Q4, OT)
- Possession, down, distance, field position

**ESPN Live Box Score (14 fields) - Priority: HIGH**
- Passing stats (completions, attempts, yards, TDs, INTs, rating)
- Rushing stats (attempts, yards, TDs, longest)
- Receiving stats (receptions, yards, TDs, longest)

**ESPN Live Team Stats (22 fields) - Priority: HIGH**
- Total/passing/rushing yards
- First downs
- Third/fourth down conversions
- Turnovers, penalties
- Time of possession

**ESPN Highlights (3 fields) - Priority: LOW**
- Highlight videos, thumbnails, URLs

### Requires nflreadpy PBP Column Expansion (20 fields)

**Add to play_by_play table - Priority: CRITICAL**
- down, ydstogo, yardline_100
- drive (drive number)
- wp (win probability)
- Event flags: touchdown, fumble, interception, penalty
- Player IDs: passer_id, rusher_id, receiver_id, tackle_1, tackle_2

### Requires The Odds API (10 fields)

**Live Betting Lines - Priority: HIGH**
- Live spread (line, odds, movement)
- Live total (line, odds, movement)
- Live moneyline (home, away, movement)

### Requires Custom Logic/Aggregation (12 fields)

**Drive-Level Aggregation (11 fields) - Priority: HIGH**
- Drive start/current position
- Plays in drive, yards gained, TOP
- Drive result detection

**Key Play Detection (1 field) - Priority: LOW**
- Impact level algorithm (EPA swing, WP swing)

---

## Implementation Roadmap

### Phase 1: CRITICAL Foundation (3-4 weeks)

1. **ESPN Live API Integration** - Scoreboard, play-by-play, box score
   - Effort: 5-7 days
   - Impact: +47 fields
   - Endpoints:
     - `/sports/football/nfl/scoreboard` (10-15 sec polling)
     - `/sports/football/nfl/summary?event={game_id}`
     - `/sports/football/nfl/playbyplay?event={game_id}`
     - `/sports/football/nfl/boxscore?event={game_id}`

2. **Expand nflreadpy PBP Columns** - Add 20-30 columns
   - Effort: 3-5 days
   - Impact: +20 fields
   - Columns: down, ydstogo, yardline_100, drive, wp, event flags, player IDs

3. **Real-Time PBP Ingestion Service** - Polling/WebSocket
   - Effort: 5-7 days
   - Impact: Enables real-time data flow
   - Strategy: Hybrid (WebSocket for plays, polling for stats)

### Phase 2: HIGH Priority Enhancements (2-3 weeks)

4. **The Odds API - Live Betting Lines**
   - Effort: 3-5 days
   - Impact: +10 fields
   - Polling: Every 15-30 seconds

5. **Drive-Level Aggregation Logic**
   - Effort: 3-5 days
   - Impact: +11 fields
   - Uses: drive column from pbp

6. **Live Stats Aggregation Engine**
   - Effort: 3-5 days
   - Impact: Enables box score + team stats
   - Caching: Redis with 10-60 sec TTL

### Phase 3: LOW Priority Nice-to-Haves (1 week)

7. **ESPN Highlights Integration**
   - Effort: 3-5 days
   - Impact: +3 fields

8. **Key Play Detection Algorithm**
   - Effort: 2-3 days
   - Impact: +1 field
   - Uses: EPA swing, WP swing, event type

---

## Final Coverage After Implementation

| Category | Current | After Phase 1 | After Phase 2 | After Phase 3 |
|----------|---------|---------------|---------------|---------------|
| P0 - Must Have | 81% | 100% ✅ | 100% ✅ | 100% ✅ |
| P1 - Important | 62% | 96% | 100% ✅ | 100% ✅ |
| P2 - Nice to Have | 67% | 87% | 87% | 100% ✅ |
| **OVERALL** | **70%** | **96%** | **100%** ✅ | **100%** ✅ |

**Target: 100% coverage achieved after Phase 2 (P0/P1) and Phase 3 (P2)**

---

## Technical Implementation Notes

### WebSocket vs Polling Strategy
**Recommendation:** Hybrid
- **WebSocket:** Play-by-play updates (if ESPN offers)
- **Polling:** Live stats, betting lines

**Polling Intervals:**
- Game header/score: 10-15 seconds
- Play-by-play feed: 5-10 seconds (or WebSocket)
- Box score stats: 30 seconds
- Team stats: 30-60 seconds
- Betting lines: 15-30 seconds

### Caching Strategy (Redis)
- Live game state: 10-second TTL
- Box score stats: 30-second TTL
- Team stats: 60-second TTL
- Play-by-play feed: 5-second TTL
- Invalidate on new play detection

---

## Data Source Reference

| Source ID | Source Name | Status | Cost | Update Frequency |
|-----------|-------------|--------|------|------------------|
| 1.1 | nflreadpy | ✅ Active | Free | Real-time |
| 1.3 | ESPN API | 🔧 Planned | Free | Real-time (10-15 sec) |
| 1.5 | The Odds API | 🔧 Planned | $99-500/mo | 15-30 seconds |

---

## Legend

- ✅ **Available** - Data exists in current database/system
- ⚠️ **Partial** - Data partially available, needs enhancement or real-time ingestion
- 🔧 **Planned** - Source identified, integration required
- ❌ **Missing** - No source, requires new API or calculation
