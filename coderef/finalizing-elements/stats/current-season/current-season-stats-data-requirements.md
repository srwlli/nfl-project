# Current Season Stats Data Requirements (2025 NFL Season)

**Page Type:** Real-Time/Live NFL Season Statistics
**Coverage Goal:** Complete 2025 season coverage - live updates, weekly leaders, season totals
**Priority:** P0 - Critical (powers all other pages)
**Status:** Requirements Complete - Ready for Implementation
**Last Updated:** 2025-10-17

---

## Executive Summary

The 2025 Current Season Stats system is the **live heartbeat** of the entire platform, providing real-time data during games and powering player profiles, team pages, fantasy tools, and betting integrations.

### Scope Decisions (from AskUserQuestion Workflow)

**✅ Confirmed Requirements:**
- **Update Frequency**: Real-time WebSocket (instant, every play)
- **Live Game Data**: Complete live game feed (score, all player stats, play-by-play, drive summary, scoring plays, penalties, injuries)
- **Leaderboard Timeframes**: Current week only (focus on this week's performance)
- **Fantasy Stats**: Complete fantasy suite (multi-format scoring, DFS data, targets, snaps, red zone touches, advanced opportunity metrics)
- **Player Status**: Complete player tracking (injuries, practice, roster moves, game-time decisions, weather, beat reporter notes, social media)
- **Trending Analytics**: Comprehensive trending (streaks, week-over-week, pace projections, breakout alerts, usage trends)
- **Betting Integration**: Complete betting suite (game lines, player props, live in-game lines, prop tracking, value alerts, line movement)
- **Page Integrations**: Full cross-page integration (links, previews, live sync, stats widgets, unified search, record chase integration)

**Total Fields:** 487 fields across 10 sections

---

## Data Requirements Sections

### Section 1: Live Game Stats (P0)

**Description**: Real-time player and team statistics updated via WebSocket during active games.

**Update Frequency**: Instant (WebSocket push on every play)

**Data Structure**:

```json
{
  "live_game_stats": {
    "game_id": "2025_07_KC_BUF",
    "game_status": "in_progress | final | scheduled",
    "game_clock": {
      "quarter": 3,
      "time_remaining": "8:42",
      "is_halftime": false,
      "is_overtime": false
    },
    "score": {
      "away_team": "KC",
      "away_score": 24,
      "home_team": "BUF",
      "home_score": 21
    },
    "possession": {
      "team": "KC",
      "yard_line": "BUF 35",
      "down": 1,
      "distance": 10
    },
    "live_player_stats": [
      {
        "player_id": "mahomes-patrick",
        "player_name": "Patrick Mahomes",
        "team": "KC",
        "position": "QB",
        "is_active": true,
        "passing": {
          "completions": 18,
          "attempts": 24,
          "yards": 245,
          "touchdowns": 2,
          "interceptions": 0,
          "sacks": 1,
          "sack_yards_lost": 7,
          "longest_completion": 42,
          "passer_rating": 126.8,
          "completion_percentage": 75.0,
          "yards_per_attempt": 10.2,
          "air_yards": 198,
          "yards_after_catch": 47,
          "first_downs": 12,
          "third_down_conversions": "4/6",
          "red_zone_attempts": 3,
          "red_zone_touchdowns": 2
        },
        "rushing": {
          "attempts": 2,
          "yards": 14,
          "touchdowns": 0,
          "longest_rush": 9,
          "yards_per_carry": 7.0,
          "fumbles": 0,
          "fumbles_lost": 0
        },
        "last_play": "15-yard completion to Kelce",
        "fantasy_points": {
          "standard": 16.8,
          "ppr": 16.8,
          "half_ppr": 16.8,
          "dfs_draftkings": 24.52,
          "dfs_fanduel": 26.1
        },
        "last_updated": "2025-10-15T20:15:32Z"
      },
      {
        "player_id": "kelce-travis",
        "player_name": "Travis Kelce",
        "team": "KC",
        "position": "TE",
        "is_active": true,
        "receiving": {
          "targets": 8,
          "receptions": 6,
          "yards": 89,
          "touchdowns": 1,
          "longest_reception": 22,
          "yards_per_reception": 14.8,
          "yards_after_catch": 42,
          "first_downs": 4,
          "catch_rate": 75.0,
          "air_yards_share": 18.5,
          "target_share": 33.3,
          "red_zone_targets": 2,
          "end_zone_targets": 1
        },
        "rushing": {
          "attempts": 0,
          "yards": 0,
          "touchdowns": 0
        },
        "last_play": "15-yard reception (this drive)",
        "fantasy_points": {
          "standard": 14.9,
          "ppr": 20.9,
          "half_ppr": 17.9,
          "dfs_draftkings": 18.4,
          "dfs_fanduel": 22.3
        },
        "snap_data": {
          "snaps_played": 38,
          "snaps_total": 42,
          "snap_percentage": 90.5,
          "route_participation": "34/38"
        },
        "last_updated": "2025-10-15T20:15:32Z"
      }
    ],
    "live_team_stats": {
      "away_team": "KC",
      "offense": {
        "total_yards": 312,
        "passing_yards": 245,
        "rushing_yards": 67,
        "first_downs": 18,
        "third_down_conversions": "6/10",
        "fourth_down_conversions": "1/1",
        "red_zone_trips": 3,
        "red_zone_touchdowns": 2,
        "time_of_possession": "17:24",
        "sacks_allowed": 1
      },
      "defense": {
        "sacks": 2,
        "tackles_for_loss": 4,
        "interceptions": 0,
        "fumbles_recovered": 0,
        "passes_defended": 3,
        "qb_hits": 4
      },
      "penalties": {
        "total_penalties": 4,
        "total_penalty_yards": 35
      }
    },
    "current_drive": {
      "team": "KC",
      "start_position": "KC 25",
      "current_position": "BUF 35",
      "plays": 6,
      "yards": 40,
      "time_elapsed": "3:18",
      "first_downs": 2
    },
    "scoring_plays": [
      {
        "quarter": 3,
        "time": "12:15",
        "team": "KC",
        "play_description": "Mahomes 8-yard TD pass to Kelce",
        "play_type": "passing_touchdown",
        "points": 7,
        "score_after": "KC 24, BUF 21"
      }
    ],
    "web_socket_connection": {
      "status": "connected",
      "last_update": "2025-10-15T20:15:32Z",
      "update_frequency": "instant (on every play)"
    }
  }
}
```

**Fields**: 87 fields per game
- Game metadata: 5 fields
- Game clock: 4 fields
- Score: 3 fields
- Possession: 4 fields
- Per-player stats: ~45 fields (repeated for each active player)
- Team stats: 20 fields per team
- Current drive: 6 fields

**Visual Display**:
- Live indicator (🔴 LIVE or ⚡)
- Real-time score updates
- Player stats update on every play
- Last play highlighted
- Fantasy points update live

**Data Sources**:
- WebSocket feed: `wss://api/v1/stats/live`
- Fallback polling: `GET /v1/stats/live/game/{game_id}` (15-second interval if WebSocket fails)
- ESPN API: Real-time scores and play-by-play

---

### Section 2: Weekly Leaderboards (P0)

**Description**: Current week's statistical leaders across all positions.

**Update Frequency**: After each game completes (Sunday/Monday/Thursday night)

**Data Structure**:

```json
{
  "weekly_leaderboard": {
    "week": 7,
    "season": 2025,
    "category": "passing_yards | rushing_yards | receiving_yards | fantasy_points | etc",
    "last_updated": "2025-10-15T23:42:00Z",
    "games_included": "Sunday games complete, MNF pending",
    "leaders": [
      {
        "rank": 1,
        "player_id": "mahomes-patrick",
        "player_name": "Patrick Mahomes",
        "team": "KC",
        "position": "QB",
        "stat_value": 389,
        "stat_label": "Passing Yards",
        "touchdowns": 4,
        "interceptions": 0,
        "passer_rating": 138.2,
        "game_result": "W 31-27 vs BUF",
        "fantasy_points": {
          "standard": 31.6,
          "ppr": 31.6,
          "half_ppr": 31.6
        },
        "trending_indicator": "🔥",
        "trending_description": "Hot streak - 3rd consecutive 300+ yard game",
        "comparison_to_season_avg": "+42 yards vs season avg"
      },
      {
        "rank": 2,
        "player_id": "allen-josh",
        "player_name": "Josh Allen",
        "team": "BUF",
        "position": "QB",
        "stat_value": 342,
        "stat_label": "Passing Yards",
        "touchdowns": 3,
        "interceptions": 1,
        "passer_rating": 112.4,
        "game_result": "L 27-31 vs KC",
        "fantasy_points": {
          "standard": 27.7,
          "ppr": 27.7,
          "half_ppr": 27.7
        },
        "trending_indicator": "▲",
        "trending_description": "Rank improved from last week",
        "comparison_to_season_avg": "+15 yards vs season avg"
      }
    ],
    "minimum_qualifiers": {
      "passing": "min 14 attempts",
      "rushing": "min 5 carries",
      "receiving": "min 2 receptions"
    }
  }
}
```

**Categories** (separate leaderboard for each):
1. Passing yards
2. Rushing yards
3. Receiving yards
4. Passing touchdowns
5. Rushing touchdowns
6. Receiving touchdowns
7. Receptions
8. Fantasy points (Standard)
9. Fantasy points (PPR)
10. Passer rating
11. Yards from scrimmage
12. All-purpose yards

**Fields**: 24 fields per leader × 12 categories = 288 fields

**Visual Display**:
- Top 10 leaders per category
- Trending indicators: 🔥 hot, ▲ rising, ▼ falling
- Comparison to season average
- Game result context
- "Last Updated" timestamp with MNF note

**Data Sources**:
- nflreadpy: Weekly stat aggregation
- Calculated: Rankings, trending indicators
- Fantasy points: Calculated from stats

---

### Section 3: Season Cumulative Stats (P0)

**Description**: Running season totals through current week.

**Update Frequency**: After each game completes

**Data Structure**:

```json
{
  "season_cumulative": {
    "player_id": "mahomes-patrick",
    "player_name": "Patrick Mahomes",
    "team": "KC",
    "position": "QB",
    "season": 2025,
    "games_played": 7,
    "games_started": 7,
    "passing": {
      "completions": 175,
      "attempts": 264,
      "yards": 2156,
      "touchdowns": 18,
      "interceptions": 3,
      "sacks": 12,
      "sack_yards_lost": 67,
      "longest_completion": 58,
      "completion_percentage": 66.3,
      "yards_per_attempt": 8.2,
      "passer_rating": 112.3,
      "first_downs": 92,
      "fourth_quarter_comebacks": 2,
      "game_winning_drives": 3
    },
    "rushing": {
      "attempts": 28,
      "yards": 145,
      "touchdowns": 2,
      "longest_rush": 22,
      "yards_per_carry": 5.2,
      "fumbles": 2,
      "fumbles_lost": 1
    },
    "season_rank": {
      "passing_yards": 1,
      "passing_touchdowns": 2,
      "passer_rating": 3
    },
    "pace_projection": {
      "projected_games": 17,
      "projected_passing_yards": 5236,
      "projected_passing_touchdowns": 44,
      "historical_comparison": "Would rank 3rd all-time in passing yards if maintains pace"
    },
    "fantasy_season_totals": {
      "standard": 211.4,
      "ppr": 211.4,
      "half_ppr": 211.4,
      "rank_standard": 1,
      "rank_ppr": 2,
      "points_per_game": 30.2,
      "consistency_score": 87.5,
      "boom_weeks": 4,
      "bust_weeks": 0
    },
    "last_updated": "2025-10-16T00:01:00Z"
  }
}
```

**Fields**: 42 fields per player

**Visual Display**:
- Season totals with NFL ranks
- Pace projections
- Historical context ("On pace for X, would rank Nth all-time")
- Fantasy season totals and consistency
- Last updated timestamp

**Data Sources**:
- nflreadpy: Season stats aggregation
- Calculated: Pace projections, rankings
- Historical data: All-time comparisons

---

### Section 4: Real-Time Scores & Updates (P0)

**Description**: Live scoreboard for all games on a given day.

**Update Frequency**: Real-time (WebSocket) or 10-second polling

**Data Structure**:

```json
{
  "scoreboard": {
    "date": "2025-10-15",
    "games": [
      {
        "game_id": "2025_07_KC_BUF",
        "game_status": "in_progress",
        "game_time": "Q3 8:42",
        "broadcast": {
          "network": "CBS",
          "is_national": true
        },
        "away_team": {
          "team_id": "KC",
          "team_name": "Kansas City Chiefs",
          "team_abbr": "KC",
          "score": 24,
          "record": "6-1",
          "possession": true
        },
        "home_team": {
          "team_id": "BUF",
          "team_name": "Buffalo Bills",
          "team_abbr": "BUF",
          "score": 21,
          "record": "5-2",
          "possession": false
        },
        "situation": {
          "down": 1,
          "distance": 10,
          "yard_line": "BUF 35",
          "team_with_ball": "KC"
        },
        "betting_lines": {
          "spread": {
            "line": -3.5,
            "favorite": "KC",
            "current_status": "KC covering"
          },
          "total": {
            "line": 52.5,
            "current_combined_score": 45,
            "current_status": "Under"
          },
          "moneyline": {
            "away": -165,
            "home": +145
          }
        },
        "weather": {
          "temperature": 52,
          "conditions": "Partly cloudy",
          "wind_speed": 8,
          "wind_direction": "NW",
          "precipitation": "0%"
        },
        "last_play": "Mahomes pass complete to Kelce for 15 yards",
        "scoring_summary": [
          "Q3 12:15 - KC TD: Mahomes 8-yard pass to Kelce (KC 24-21)"
        ]
      }
    ]
  }
}
```

**Fields**: 35 fields per game

**Visual Display**:
- Live scores with game clock
- Possession indicator
- Down & distance
- Betting lines with live status
- Weather conditions
- Last play
- Quick link to full game details

**Data Sources**:
- WebSocket: `wss://api/v1/scoreboard`
- Polling fallback: `GET /v1/scoreboard?date=YYYY-MM-DD` (10-second interval)
- The Odds API: Live betting lines
- Weather API: Current conditions

---

### Section 5: Player Status & Availability (P0)

**Description**: Complete player tracking - injuries, practice participation, roster moves, game-time decisions.

**Update Frequency**: Daily (3:00 AM ET batch), Real-time for breaking news

**Data Structure**:

```json
{
  "player_status": {
    "player_id": "mahomes-patrick",
    "player_name": "Patrick Mahomes",
    "team": "KC",
    "position": "QB",
    "status": "active | questionable | doubtful | out | ir | suspended | pup",
    "availability_for_next_game": {
      "game_id": "2025_08_KC_LV",
      "game_date": "2025-10-22",
      "opponent": "LV",
      "expected_status": "active",
      "confidence": "high | medium | low"
    },
    "injury_report": {
      "has_injury": false,
      "injury_type": null,
      "body_part": null,
      "severity": null,
      "date_injured": null,
      "games_missed": 0,
      "estimated_return": null,
      "practice_participation": {
        "wednesday": "full | limited | dnp | n/a",
        "thursday": "full",
        "friday": "full",
        "last_updated": "2025-10-18T16:00:00Z"
      }
    },
    "roster_status": {
      "active_roster": true,
      "practice_squad": false,
      "injured_reserve": false,
      "suspended": false,
      "recent_transactions": []
    },
    "game_time_decision": {
      "is_game_time_decision": false,
      "decision_time": null,
      "factors": []
    },
    "weather_impact": {
      "affected_by_weather": false,
      "weather_conditions": null,
      "historical_performance_in_weather": null
    },
    "beat_reporter_notes": [
      {
        "date": "2025-10-18",
        "reporter": "Adam Schefter",
        "source": "ESPN",
        "note": "Mahomes looks sharp in practice, no injury concerns"
      }
    ],
    "social_media_updates": [
      {
        "date": "2025-10-17",
        "platform": "twitter",
        "content": "Mahomes posts workout video, appears healthy",
        "source_url": "https://twitter.com/..."
      }
    ],
    "last_updated": "2025-10-18T18:30:00Z"
  }
}
```

**Fields**: 28 fields per player

**Visual Display**:
- Status badge (Active, Questionable, Out, IR)
- Practice participation table (Wed/Thu/Fri)
- Beat reporter notes feed
- Game-time decision alerts
- Weather impact warnings

**Data Sources**:
- nflreadpy: Official injury reports
- Manual entry: Beat reporter notes
- Social media: Twitter/X API
- Weather API: Game day forecasts

---

### Section 6: Fantasy Stats (P0)

**Description**: Complete fantasy football suite - multi-format scoring, DFS data, opportunity metrics.

**Update Frequency**: Real-time during games, Daily aggregation overnight

**Data Structure**:

```json
{
  "fantasy_stats": {
    "player_id": "mahomes-patrick",
    "player_name": "Patrick Mahomes",
    "team": "KC",
    "position": "QB",
    "week": 7,
    "season": 2025,
    "scoring": {
      "standard": {
        "points": 31.6,
        "rank": 1,
        "rank_position": "QB1"
      },
      "ppr": {
        "points": 31.6,
        "rank": 2,
        "rank_position": "QB2"
      },
      "half_ppr": {
        "points": 31.6,
        "rank": 2,
        "rank_position": "QB2"
      },
      "points_breakdown": {
        "passing_yards": 15.6,
        "passing_touchdowns": 16.0,
        "interceptions": 0.0,
        "rushing_yards": 0.0,
        "rushing_touchdowns": 0.0,
        "bonus_points": 0.0
      }
    },
    "dfs": {
      "draftkings": {
        "salary": 8700,
        "projected_ownership": 28.5,
        "projected_points": 24.2,
        "value": 2.78,
        "actual_points": 28.5,
        "ownership_actual": 31.2,
        "roi": "+3.3 points above projection"
      },
      "fanduel": {
        "salary": 9200,
        "projected_ownership": 32.1,
        "projected_points": 22.8,
        "value": 2.48,
        "actual_points": 29.1,
        "ownership_actual": 35.4,
        "roi": "+6.3 points above projection"
      },
      "value_plays": [
        "High value (actual points >> salary)",
        "High ownership (chalky play)",
        "GPP viable"
      ]
    },
    "opportunity_metrics": {
      "targets": 0,
      "target_share": 0.0,
      "air_yards_share": 0.0,
      "snaps": 42,
      "snap_percentage": 100.0,
      "routes_run": 0,
      "route_participation": "N/A",
      "red_zone_touches": 5,
      "red_zone_opportunities": 3,
      "goal_line_carries": 0,
      "end_zone_targets": 0,
      "designed_rush_attempts": 2
    },
    "advanced_metrics": {
      "fantasy_points_per_snap": 0.75,
      "fantasy_points_per_opportunity": 6.32,
      "boom_rate": "25% (weeks with 25+ points)",
      "bust_rate": "0% (weeks with <10 points)",
      "consistency_score": 87.5,
      "ceiling_projection": 42.0,
      "floor_projection": 18.0
    },
    "season_trends": {
      "last_4_weeks_avg": 29.8,
      "season_avg": 30.2,
      "trend": "stable",
      "hot_streak": true,
      "cold_streak": false
    },
    "matchup_analysis": {
      "opponent": "LV",
      "opponent_rank_vs_position": 28,
      "opponent_rating": "favorable",
      "historical_vs_opponent": "avg 27.3 pts in 3 games"
    }
  }
}
```

**Fields**: 51 fields per player

**Visual Display**:
- Multi-format scoring table (Standard, PPR, Half-PPR)
- DFS salary, ownership, value
- Opportunity metrics table
- Trend indicators (hot/cold)
- Matchup rating

**Data Sources**:
- Calculated: Fantasy points from stats
- DFS APIs: DraftKings, FanDuel salaries/ownership
- nflreadpy: Snap counts, targets, touches
- Calculated: Advanced metrics

---

### Section 7: Trending & Hot/Cold Streaks (P1)

**Description**: Comprehensive trending analytics - streaks, week-over-week changes, pace projections, breakout alerts.

**Update Frequency**: Daily (overnight batch after all games complete)

**Data Structure**:

```json
{
  "trending_analytics": {
    "player_id": "puka-nacua",
    "player_name": "Puka Nacua",
    "team": "LAR",
    "position": "WR",
    "week": 7,
    "trending_status": "hot | cold | stable | breakout | injury_concern",
    "hot_streak": {
      "is_hot": true,
      "consecutive_weeks": 3,
      "criteria": "100+ receiving yards in 3 consecutive games",
      "indicator": "🔥",
      "description": "On fire - 3 straight 100+ yard games"
    },
    "cold_streak": {
      "is_cold": false,
      "consecutive_weeks": 0,
      "criteria": null
    },
    "week_over_week_changes": {
      "receiving_yards": {
        "this_week": 142,
        "last_week": 98,
        "change": +44,
        "change_percentage": "+44.9%"
      },
      "targets": {
        "this_week": 12,
        "last_week": 8,
        "change": +4,
        "change_percentage": "+50.0%"
      },
      "target_share": {
        "this_week": 32.5,
        "last_week": 24.2,
        "change": +8.3,
        "change_percentage": "+34.3%"
      },
      "snap_percentage": {
        "this_week": 94.2,
        "last_week": 89.1,
        "change": +5.1,
        "change_percentage": "+5.7%"
      },
      "fantasy_rank_position": {
        "this_week": "WR3",
        "last_week": "WR12",
        "change": "▲ +9"
      }
    },
    "pace_projections": {
      "receiving_yards_pace": 1628,
      "receptions_pace": 121,
      "touchdowns_pace": 11,
      "historical_comparison": "On pace to break Calvin Johnson's reception record (143 in 2012)",
      "rookie_record_watch": "On pace for rookie receiving yards record (Justin Jefferson 1400 in 2020)"
    },
    "breakout_alert": {
      "is_breakout": true,
      "breakout_type": "usage_spike",
      "details": "Target share increased from 18% (Weeks 1-4) to 31% (Weeks 5-7)",
      "confidence": "high",
      "action": "Add to lineups, consider trade target"
    },
    "usage_trends": {
      "target_trend": {
        "weeks_1_4_avg": 7.2,
        "weeks_5_7_avg": 11.3,
        "trend": "sharply_increasing",
        "change": "+56.9%"
      },
      "snap_percentage_trend": {
        "weeks_1_4_avg": 78.5,
        "weeks_5_7_avg": 92.1,
        "trend": "increasing",
        "change": "+17.3%"
      },
      "red_zone_target_share_trend": {
        "weeks_1_4_avg": 12.5,
        "weeks_5_7_avg": 28.3,
        "trend": "sharply_increasing",
        "change": "+126.4%"
      }
    },
    "alerts": [
      "🔥 Hot streak - 3 consecutive 100+ yard games",
      "📈 Breakout alert - Usage spike detected",
      "🎯 Target share up 56.9% over last 3 weeks",
      "🏆 On pace to break rookie reception record"
    ]
  }
}
```

**Fields**: 38 fields per player

**Visual Display**:
- Hot/cold streak badges
- Week-over-week change indicators (▲▼)
- Pace projection callouts
- Breakout alerts
- Usage trend charts

**Data Sources**:
- nflreadpy: Weekly stats
- Calculated: Trends, projections, alerts
- Historical data: Record comparisons

---

### Section 8: Advanced Analytics (Current Season) (P1)

**Description**: EPA, CPOE, Success Rate, and other advanced metrics for current season.

**Update Frequency**: Post-game (calculated from play-by-play)

**Data Structure**:

```json
{
  "advanced_analytics": {
    "player_id": "mahomes-patrick",
    "player_name": "Patrick Mahomes",
    "team": "KC",
    "position": "QB",
    "week": 7,
    "season": 2025,
    "epa": {
      "total_epa": 0.42,
      "epa_per_play": 0.28,
      "epa_rank": 2,
      "passing_epa": 0.35,
      "rushing_epa": 0.07
    },
    "cpoe": {
      "completion_percentage_over_expected": 8.5,
      "cpoe_rank": 3,
      "expected_completion_percentage": 57.8,
      "actual_completion_percentage": 66.3
    },
    "success_rate": {
      "overall_success_rate": 58.3,
      "passing_success_rate": 60.1,
      "rushing_success_rate": 42.9,
      "success_rate_rank": 4
    },
    "pressure_metrics": {
      "time_to_throw": 2.78,
      "under_pressure_attempts": 8,
      "under_pressure_completions": 5,
      "under_pressure_completion_pct": 62.5,
      "blitz_rate_faced": 24.2,
      "blitz_completion_pct": 68.8
    },
    "air_yards": {
      "average_depth_of_target": 8.2,
      "air_yards_per_attempt": 7.1,
      "completed_air_yards": 198,
      "intended_air_yards": 264
    },
    "next_gen_stats": {
      "avg_time_to_throw": 2.78,
      "avg_completed_air_yards": 8.25,
      "avg_intended_air_yards": 11.0,
      "aggressiveness": 18.5,
      "max_completed_air_distance": 42
    }
  }
}
```

**Fields**: 29 fields per player

**Visual Display**:
- EPA chart (above/below average)
- CPOE vs league average
- Success rate percentage
- Pressure performance table
- Next Gen Stats dashboard

**Data Sources**:
- nflreadpy: Play-by-play data
- Calculated: EPA, CPOE, Success Rate
- NFL Next Gen Stats API: Tracking data

---

### Section 9: Betting Lines & Props (P1)

**Description**: Complete betting suite - game lines, player props, live in-game lines, prop tracking, value alerts.

**Update Frequency**: Real-time (15-30 second updates during games)

**Data Structure**:

```json
{
  "betting_lines": {
    "game_id": "2025_07_KC_BUF",
    "game_date": "2025-10-15",
    "game_lines": {
      "spread": {
        "opening_line": -3.0,
        "current_line": -3.5,
        "favorite": "KC",
        "movement": -0.5,
        "movement_indicator": "▼",
        "betting_percentages": {
          "on_favorite": 68,
          "on_underdog": 32
        },
        "current_status": "KC covering (24-21)"
      },
      "total": {
        "opening_total": 51.5,
        "current_total": 52.5,
        "movement": +1.0,
        "movement_indicator": "▲",
        "betting_percentages": {
          "on_over": 54,
          "on_under": 46
        },
        "current_combined_score": 45,
        "current_status": "Under by 7.5"
      },
      "moneyline": {
        "away": -165,
        "home": +145,
        "opening_away": -150,
        "opening_home": +130
      }
    },
    "player_props": [
      {
        "player_id": "mahomes-patrick",
        "player_name": "Patrick Mahomes",
        "prop_type": "passing_yards",
        "line": 285.5,
        "over_odds": -110,
        "under_odds": -110,
        "actual_result": 389,
        "result": "over",
        "margin": +103.5,
        "hit_rate_season": "5/7 (71.4%)",
        "value_rating": "high_value",
        "betting_percentages": {
          "on_over": 62,
          "on_under": 38
        }
      },
      {
        "player_id": "mahomes-patrick",
        "player_name": "Patrick Mahomes",
        "prop_type": "passing_touchdowns",
        "line": 2.5,
        "over_odds": +110,
        "under_odds": -130,
        "actual_result": 4,
        "result": "over",
        "margin": +1.5,
        "hit_rate_season": "4/7 (57.1%)"
      },
      {
        "player_id": "kelce-travis",
        "player_name": "Travis Kelce",
        "prop_type": "receptions",
        "line": 5.5,
        "over_odds": -105,
        "under_odds": -115,
        "actual_result": 6,
        "result": "over",
        "margin": +0.5,
        "hit_rate_season": "6/7 (85.7%)",
        "value_rating": "high_value"
      }
    ],
    "live_in_game_lines": {
      "live_spread": {
        "line": -4.5,
        "favorite": "KC",
        "movement_from_pregame": -1.5
      },
      "live_total": {
        "line": 58.5,
        "movement_from_pregame": +6.0
      },
      "live_moneyline": {
        "away": -220,
        "home": +180
      },
      "next_score_odds": {
        "touchdown_kc": +150,
        "touchdown_buf": +180,
        "field_goal_kc": +300,
        "field_goal_buf": +350,
        "no_score": +400
      }
    },
    "prop_tracking": {
      "total_props_offered": 47,
      "props_hit": 32,
      "props_miss": 12,
      "props_push": 3,
      "hit_rate": 68.1,
      "profitable_props": [
        "Mahomes over 285.5 pass yards (+103.5 margin)",
        "Kelce over 5.5 receptions (high season hit rate 85.7%)"
      ]
    },
    "value_alerts": [
      "🎯 Mahomes pass yards over 285.5 - Hit 5/7 games this season",
      "📊 Kelce receptions over 5.5 - Hit 6/7 games (85.7%)",
      "⚠️ Game total moved +6.0 points live, significant shift"
    ],
    "line_movement_history": [
      {
        "timestamp": "2025-10-15T12:00:00Z",
        "spread": -3.0,
        "total": 51.5
      },
      {
        "timestamp": "2025-10-15T16:00:00Z",
        "spread": -3.5,
        "total": 52.5
      }
    ],
    "last_updated": "2025-10-15T20:15:32Z"
  }
}
```

**Fields**: 58 fields per game

**Visual Display**:
- Game lines with movement indicators
- Player props table with actual vs line
- Live in-game lines
- Prop hit rate badges
- Value alert notifications
- Line movement chart

**Data Sources**:
- The Odds API: Live betting lines
- Calculated: Prop results, hit rates, value ratings

---

### Section 10: Social/Viral Moments (P2)

**Description**: Capture and highlight viral plays, social media moments, trending topics.

**Update Frequency**: Real-time (social media monitoring), Post-game aggregation

**Data Structure**:

```json
{
  "viral_moments": {
    "game_id": "2025_07_KC_BUF",
    "moments": [
      {
        "moment_id": "2025_07_KC_BUF_Q3_12:15",
        "play_description": "Mahomes 42-yard bomb to Kelce, one-handed catch",
        "quarter": 3,
        "time": "12:15",
        "moment_type": "highlight_play | controversial_call | injury | celebration | milestone",
        "virality_score": 9.2,
        "social_media_metrics": {
          "twitter_mentions": 15420,
          "twitter_trending_rank": 3,
          "hashtags": ["#ChiefsKingdom", "#Mahomes"],
          "retweets": 8934,
          "likes": 42103
        },
        "video_url": "https://...",
        "gif_url": "https://...",
        "broadcast_replay_count": 5,
        "is_trending": true,
        "timestamp": "2025-10-15T19:42:15Z"
      },
      {
        "moment_id": "2025_07_KC_BUF_MILESTONE",
        "milestone_type": "career_touchdown_300",
        "player_id": "mahomes-patrick",
        "player_name": "Patrick Mahomes",
        "description": "Mahomes throws 300th career touchdown pass",
        "context": "Joins elite group: Brady, Brees, Manning, Rodgers",
        "virality_score": 8.8,
        "social_media_metrics": {
          "twitter_mentions": 12304,
          "twitter_trending_rank": 5
        },
        "is_trending": true
      }
    ]
  }
}
```

**Fields**: 18 fields per moment

**Visual Display**:
- Viral moments feed
- Social media metrics
- Video/GIF embeds
- Trending badge
- Milestone callouts

**Data Sources**:
- Twitter/X API: Social mentions, trending
- Manual curation: Highlight selection
- Broadcast data: Replay counts

---

## Data Update Frequencies Summary

| Section | Update Frequency | Method |
|---------|------------------|--------|
| Live Game Stats | Instant (every play) | WebSocket |
| Weekly Leaderboards | After each game | Batch calculation |
| Season Cumulative | After each game | Batch calculation |
| Real-Time Scores | Instant / 10-second polling | WebSocket / Polling |
| Player Status | Daily 3:00 AM ET + Real-time breaking | Batch + Manual |
| Fantasy Stats | Real-time during games, Daily overnight | WebSocket + Batch |
| Trending Analytics | Daily overnight | Batch calculation |
| Advanced Analytics | Post-game | Batch calculation |
| Betting Lines | Real-time (15-30 seconds) | Polling |
| Viral Moments | Real-time + Post-game | Social API + Manual |

---

## API Endpoints

### Live Stats Endpoints

```
WebSocket: wss://api/v1/stats/live
  - Pushes updates on every play
  - Subscription: { "game_id": "2025_07_KC_BUF" }

GET /v1/stats/live/games?status={live|final|scheduled}
  - Returns all games with current status

GET /v1/stats/live/game/{game_id}
  - Returns complete live game feed
  - Query params: include=play_by_play,box_score,team_stats

WebSocket: wss://api/v1/scoreboard
  - Live scoreboard updates for all games
```

### Current Season Endpoints

```
GET /v1/stats/current/leaders
  ?week={week_number}
  &position={QB|RB|WR|TE|etc}
  &stat={passing_yards|rushing_yards|fantasy_points|etc}
  &limit={10}

GET /v1/stats/current/player/{player_id}
  ?week={week_number|season}
  &include=fantasy,trending,advanced

GET /v1/stats/current/season/{player_id}
  - Returns season cumulative totals
```

### Player Status Endpoints

```
GET /v1/stats/player-status/{player_id}
  - Returns complete player status

GET /v1/stats/injury-report?team={team_id}&week={week_number}
  - Returns team injury report
```

### Fantasy Endpoints

```
GET /v1/stats/fantasy/player/{player_id}
  ?week={week_number|season}
  &scoring={standard|ppr|half_ppr}

GET /v1/stats/fantasy/dfs
  ?week={week_number}
  &platform={draftkings|fanduel}

GET /v1/stats/fantasy/opportunities/{player_id}
  ?week={week_number}
  - Returns snap counts, targets, touches, red zone opportunities
```

### Betting Endpoints

```
GET /v1/stats/betting/game/{game_id}
  - Returns game lines, player props, live lines

GET /v1/stats/betting/props/{player_id}
  ?week={week_number}
  - Returns player prop history and results
```

---

## Success Criteria

### Performance Requirements:
- ✅ Live stats latency < 15 seconds (WebSocket < 2 seconds)
- ✅ Page load time < 1 second
- ✅ WebSocket uptime 99.5%+
- ✅ Data accuracy 99.9%+

### Feature Completeness:
- ✅ All 487 fields implemented
- ✅ Real-time updates functional during games
- ✅ Weekly leaderboards update after each game
- ✅ Season cumulative stats accurate
- ✅ Player status tracking comprehensive
- ✅ Fantasy suite complete (multi-format, DFS, opportunities)
- ✅ Trending analytics operational
- ✅ Advanced analytics (EPA, CPOE) available post-game
- ✅ Betting integration complete
- ✅ Full cross-page integration

### User Experience:
- ✅ Mobile notifications for key moments
- ✅ Live score widgets embeddable
- ✅ Fantasy-relevant stats prominently displayed
- ✅ Trending indicators intuitive
- ✅ Betting info clearly presented
- ✅ Responsive design across all devices

---

## Integration Points

### With Other Finalized Pages:

**Player Profiles** (`player-profiles/`):
- Current season stats appear on player profile
- Live stats update player profile during active games
- Career stats include 2025 season totals

**Team Pages** (`team-pages/`):
- Team current season stats power team pages
- Live game stats update team pages
- Weekly leaders by team

**Game Details** (`game-details/`):
- Live game stats power game-details (live) pages
- Post-game stats populate game-details (completed) pages

**Record Chase Tracker** (integration):
- Pace projections feed record chase alerts
- Milestone tracking updates in real-time

**Badge System** (integration):
- Hot streak badges trigger from trending analytics
- Achievement badges unlock based on stats

---

## Data Sources Summary

| Source | Status | Fields Provided | Update Frequency |
|--------|--------|-----------------|------------------|
| WebSocket Feed | 🔧 Planned | 87 (live game stats) | Instant (every play) |
| nflreadpy | ✅ Active | 150+ (season stats, weekly) | Weekly |
| ESPN API | 🔧 Planned | 50+ (live scores, PBP) | Real-time |
| The Odds API | 🔧 Planned | 58 (betting lines, props) | 15-30 seconds |
| NFL Next Gen Stats | 🔧 Planned | 29 (advanced analytics) | Post-game |
| DFS APIs (DK/FD) | 🔧 Planned | 12 (salaries, ownership) | Daily |
| Twitter/X API | 🔧 Planned | 18 (viral moments) | Real-time |
| Manual Entry | 🔧 Ongoing | 28 (injury notes, beat reports) | Daily |
| Calculated | 🔧 Implementation | 100+ (rankings, trends, projections) | Varies |

---

**Status:** Requirements Complete - Ready for Implementation
**Total Fields:** 487 fields
**Implementation Approach:** Full implementation IS the MVP (agentic coding, no phases)
**Priority:** P0 - Critical (powers all other pages)

**Next Steps:**
1. Populate `current-season-stats-data-list.md` with complete field inventory
2. Populate `data-source-for-current-season-stats.json` with field mappings
3. Populate `master-data-source-report.md` with coverage analysis
4. Begin implementation (WebSocket infrastructure, API endpoints, React components)
