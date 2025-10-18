# Team Page - Data Requirements

**Page Type:** NFL Team Profile (All 32 Active Teams + Full Franchise History)
**Update Frequency:** Real-time during games, daily during season, weekly in offseason
**User Context:** Team research, standings tracking, roster analysis, schedule planning, fantasy football, historical research

---

## Overview

Team pages provide **complete franchise information** with focus on:
- Current season performance, standings, and playoff probability
- Complete roster ecosystem (active roster, practice squad, IR, depth chart, contracts)
- Full schedule (current + historical) with game-details integration
- Comprehensive team statistics (offense, defense, special teams, advanced analytics, situational splits)
- Franchise history from founding to present (championships, retired numbers, all-time leaders, HOF players)
- Coaching staff directory (head coach through position coaches)
- News, transactions, injuries, and depth chart changes
- Stadium integration and matchup preview integration

**Design Reference:** See `context/team-page.md` for full UI/UX specification

---

## Priority Level: P0 (Must-Have)

### 1. Team Identity & Header

**Data Fields:**
```json
{
  "team_identity": {
    "team_id": "string (unique identifier)",
    "team_name": "string (full name)",
    "team_city": "string",
    "team_state": "string",
    "abbreviation": "string (e.g., 'DAL', 'KC')",
    "nickname": "string (e.g., 'Cowboys', 'Chiefs')",
    "conference": "NFC | AFC",
    "division": "East | West | North | South",
    "founded_year": "number",
    "colors": {
      "primary": "hex color",
      "secondary": "hex color",
      "accent": "hex color"
    },
    "logos": {
      "primary_url": "string",
      "alternate_url": "string",
      "helmet_url": "string",
      "wordmark_url": "string"
    },
    "stadium": {
      "stadium_id": "string",
      "name": "string",
      "city": "string",
      "state": "string",
      "capacity": "number",
      "surface": "grass | turf | hybrid",
      "roof": "outdoor | dome | retractable",
      "year_opened": "number"
    }
  }
}
```

**Data Sources:**
- `teams` table → team_id, name, abbreviation, conference, division
- Static/Manual → Colors, logos (4 variants), founded_year
- `stadiums` table or stadium integration → Full stadium details

**Visual Display:**
- Large team logo and wordmark
- Team colors used throughout page theme
- Stadium name (clickable link to stadium page)
- Conference and division badges
- Founded year and franchise age

---

### 2. Current Season Overview

**Data Fields:**
```json
{
  "current_season": {
    "season": "number (year)",
    "current_week": "number",
    "record": {
      "wins": "number",
      "losses": "number",
      "ties": "number",
      "win_percentage": "number"
    },
    "division_standing": {
      "rank": "number (1-4)",
      "games_back": "number",
      "division_record": "string (W-L)",
      "conference_record": "string (W-L)"
    },
    "conference_standing": {
      "rank": "number (1-16)",
      "playoff_seed": "number (1-7 or null)"
    },
    "streak": {
      "type": "W | L",
      "count": "number",
      "description": "string (e.g., 'W4 - Won last 4')"
    },
    "playoff_status": {
      "clinched_division": "boolean",
      "clinched_playoff": "boolean",
      "clinched_bye": "boolean",
      "eliminated": "boolean",
      "playoff_probability": "number (percentage)"
    },
    "next_game": {
      "game_id": "string",
      "week": "number",
      "opponent_id": "string",
      "opponent_name": "string",
      "date": "ISO 8601 datetime",
      "location": "home | away",
      "tv_network": "string",
      "spread": "number",
      "over_under": "number"
    },
    "last_game": {
      "game_id": "string",
      "week": "number",
      "opponent_name": "string",
      "result": "W | L | T",
      "score": "string (e.g., '31-28')"
    }
  }
}
```

**Data Sources:**
- `season_stats` table → Wins, losses, ties, conference/division records
- `schedules` table → Next game, last game details
- Calculate standings from season_stats
- Playoff probability → FPI or custom calculation

**Visual Display:**
- Prominent record display (10-2)
- Division standing badge ("1st NFC East")
- Playoff probability meter
- Streak indicator with color coding
- Next game card with opponent logo, date, TV
- Last game result summary

---

### 3. Complete Roster Ecosystem

**Data Fields:**
```json
{
  "roster": {
    "active_roster": [
      {
        "player_id": "string",
        "jersey_number": "number",
        "first_name": "string",
        "last_name": "string",
        "full_name": "string",
        "position": "string",
        "depth_chart_position": "number (1=starter, 2=backup, etc.)",
        "height": "string (e.g., '6-4')",
        "weight": "number (lbs)",
        "age": "number",
        "experience": "number (years pro)",
        "college": "string",
        "draft_info": {
          "year": "number",
          "round": "number",
          "pick": "number"
        },
        "contract": {
          "years_remaining": "number",
          "cap_hit": "number (dollars)",
          "is_franchise_tagged": "boolean"
        },
        "status": "active | injured | suspended | pup",
        "injury": {
          "injury_type": "string",
          "body_part": "string",
          "status": "questionable | doubtful | out | IR",
          "return_week": "number (estimate)"
        },
        "season_stats": {
          /* Position-specific stats */
        },
        "accolades": {
          "pro_bowls": "number",
          "all_pro_selections": "number",
          "is_captain": "boolean"
        }
      }
    ],
    "practice_squad": [
      /* Same structure as active_roster */
    ],
    "injured_reserve": [
      /* Same structure with injury details */
    ],
    "suspended_list": [
      /* Same structure with suspension details */
    ]
  }
}
```

**Data Sources:**
- `rosters` table → Player assignments to teams
- `players` table → Player biographical info
- `player_stats` table → Season stats for each player
- `injuries` table → Injury status and details
- `depth_charts` table → Depth chart positioning
- Contract data → External API or manual (optional)

**Visual Display:**
- Sortable, filterable roster table
- Filter by position (QB, RB, WR, etc.)
- Depth chart view (starters highlighted)
- Injury status icons (🔴 Out, 🟡 Questionable, 🟢 Active)
- Click player → Navigate to player profile
- Hover player → Player card preview (S/M/L)
- Practice squad and IR in collapsed sections

---

### 4. Team Statistics - Comprehensive

**Offense Tab:**
```json
{
  "offensive_stats": {
    "scoring": {
      "points_per_game": "number",
      "points_per_game_rank": "number (1-32)",
      "total_points": "number",
      "touchdowns": "number",
      "field_goals": "number"
    },
    "passing": {
      "pass_yards_per_game": "number",
      "pass_yards_per_game_rank": "number",
      "total_pass_yards": "number",
      "completions": "number",
      "attempts": "number",
      "completion_percentage": "number",
      "pass_touchdowns": "number",
      "interceptions": "number",
      "sacks_allowed": "number",
      "sack_yards_lost": "number",
      "yards_per_attempt": "number",
      "passer_rating": "number"
    },
    "rushing": {
      "rush_yards_per_game": "number",
      "rush_yards_per_game_rank": "number",
      "total_rush_yards": "number",
      "rush_attempts": "number",
      "yards_per_carry": "number",
      "rush_touchdowns": "number",
      "fumbles": "number",
      "fumbles_lost": "number"
    },
    "total_offense": {
      "yards_per_game": "number",
      "yards_per_game_rank": "number",
      "plays_per_game": "number",
      "yards_per_play": "number"
    },
    "efficiency": {
      "third_down_conversions": "number",
      "third_down_attempts": "number",
      "third_down_percentage": "number",
      "fourth_down_conversions": "number",
      "fourth_down_attempts": "number",
      "fourth_down_percentage": "number",
      "red_zone_trips": "number",
      "red_zone_touchdowns": "number",
      "red_zone_percentage": "number"
    },
    "turnovers": {
      "turnovers_committed": "number",
      "fumbles_lost": "number",
      "interceptions_thrown": "number"
    },
    "time_of_possession": {
      "average_top": "string (MM:SS)",
      "total_top": "string (HH:MM:SS)"
    }
  }
}
```

**Defense Tab:**
```json
{
  "defensive_stats": {
    "points_allowed": {
      "points_per_game_allowed": "number",
      "points_per_game_allowed_rank": "number",
      "total_points_allowed": "number",
      "touchdowns_allowed": "number"
    },
    "pass_defense": {
      "pass_yards_per_game_allowed": "number",
      "pass_yards_per_game_allowed_rank": "number",
      "completions_allowed": "number",
      "attempts_against": "number",
      "completion_percentage_allowed": "number",
      "pass_touchdowns_allowed": "number",
      "interceptions": "number",
      "interception_yards": "number",
      "interception_touchdowns": "number",
      "passes_defended": "number",
      "sacks": "number",
      "sack_yards": "number",
      "qb_hits": "number"
    },
    "rush_defense": {
      "rush_yards_per_game_allowed": "number",
      "rush_yards_per_game_allowed_rank": "number",
      "rush_attempts_against": "number",
      "yards_per_carry_allowed": "number",
      "rush_touchdowns_allowed": "number",
      "stuffs": "number (tackles at/behind LOS)"
    },
    "total_defense": {
      "yards_per_game_allowed": "number",
      "yards_per_game_allowed_rank": "number",
      "plays_per_game_against": "number",
      "yards_per_play_allowed": "number"
    },
    "turnovers": {
      "turnovers_forced": "number",
      "fumbles_recovered": "number",
      "fumble_recovery_touchdowns": "number",
      "safeties": "number"
    },
    "efficiency": {
      "third_down_stops": "number",
      "third_down_attempts_against": "number",
      "third_down_percentage_allowed": "number",
      "red_zone_trips_against": "number",
      "red_zone_touchdowns_allowed": "number",
      "red_zone_percentage_allowed": "number"
    }
  }
}
```

**Special Teams Tab:**
```json
{
  "special_teams_stats": {
    "kicking": {
      "field_goals_made": "number",
      "field_goals_attempted": "number",
      "field_goal_percentage": "number",
      "longest_field_goal": "number",
      "extra_points_made": "number",
      "extra_points_attempted": "number"
    },
    "punting": {
      "punts": "number",
      "punt_yards": "number",
      "average_punt": "number",
      "longest_punt": "number",
      "punts_inside_20": "number",
      "touchbacks": "number"
    },
    "kick_returns": {
      "kick_return_attempts": "number",
      "kick_return_yards": "number",
      "kick_return_average": "number",
      "kick_return_touchdowns": "number",
      "longest_return": "number"
    },
    "punt_returns": {
      "punt_return_attempts": "number",
      "punt_return_yards": "number",
      "punt_return_average": "number",
      "punt_return_touchdowns": "number",
      "longest_return": "number"
    }
  }
}
```

**Advanced Analytics Tab:**
```json
{
  "advanced_stats": {
    "epa": {
      "total_epa_offense": "number",
      "epa_per_play_offense": "number",
      "passing_epa": "number",
      "rushing_epa": "number",
      "total_epa_defense": "number",
      "epa_per_play_defense": "number"
    },
    "success_rate": {
      "offensive_success_rate": "percentage",
      "defensive_success_rate": "percentage"
    },
    "dvoa": {
      "offensive_dvoa": "percentage",
      "defensive_dvoa": "percentage",
      "special_teams_dvoa": "percentage",
      "total_dvoa": "percentage"
    },
    "explosive_plays": {
      "offensive_explosive_plays": "number (20+ yard plays)",
      "defensive_explosive_plays_allowed": "number"
    },
    "drive_efficiency": {
      "average_drive_yards": "number",
      "average_drive_plays": "number",
      "average_drive_time": "string (MM:SS)",
      "scoring_percentage": "percentage (drives ending in score)"
    }
  }
}
```

**Situational Splits:**
```json
{
  "situational_splits": {
    "home_vs_away": {
      "home_record": "string (W-L)",
      "home_ppg": "number",
      "away_record": "string (W-L)",
      "away_ppg": "number"
    },
    "by_quarter": {
      "q1_points_scored": "number",
      "q2_points_scored": "number",
      "q3_points_scored": "number",
      "q4_points_scored": "number",
      "ot_points_scored": "number"
    },
    "vs_winning_teams": {
      "record": "string (W-L)",
      "ppg": "number"
    },
    "division_games": {
      "record": "string (W-L)",
      "ppg": "number"
    },
    "primetime": {
      "primetime_record": "string (W-L)",
      "snf_record": "string",
      "mnf_record": "string",
      "tnf_record": "string"
    }
  }
}
```

**Data Sources:**
- `season_stats` table → Team-level offensive/defensive stats
- nflreadpy play-by-play → Advanced metrics (EPA, success rate)
- nflscraPy → DVOA
- Calculate splits from schedules + season_stats

**Visual Display:**
- Tabbed interface: Offense | Defense | Special Teams | Advanced | Splits
- Each stat shows value + NFL rank (1-32)
- Color coding (top 10 = green, bottom 10 = red)
- Comparison to league average
- Sortable tables

---

### 5. Full Schedule & Results

**Data Fields:**
```json
{
  "schedule": {
    "current_season_games": [
      {
        "game_id": "string",
        "week": "number",
        "season_type": "PRE | REG | POST",
        "date": "ISO 8601 datetime",
        "opponent_id": "string",
        "opponent_name": "string",
        "opponent_abbreviation": "string",
        "location": "home | away",
        "venue_name": "string",
        "result": "W | L | T | null (if not played)",
        "team_score": "number (if played)",
        "opponent_score": "number (if played)",
        "team_record_after": "string (W-L)",
        "betting": {
          "opening_spread": "number",
          "closing_spread": "number",
          "opening_total": "number",
          "closing_total": "number",
          "result_vs_spread": "covered | did_not_cover | push | null"
        },
        "broadcast": {
          "network": "string",
          "time": "string",
          "is_primetime": "boolean"
        },
        "conditions": {
          "temperature": "number",
          "weather": "string",
          "roof_status": "open | closed | outdoor"
        },
        "context": {
          "is_division_game": "boolean",
          "is_conference_game": "boolean",
          "rest_days": "number",
          "team_injuries_count": "number",
          "opponent_injuries_count": "number"
        },
        "game_details_link": "string (link to game-details page)"
      }
    ],
    "historical_schedules": {
      "2023": [ /* same structure */ ],
      "2022": [ /* same structure */ ],
      /* ... back to founding year */
    },
    "schedule_metrics": {
      "strength_of_schedule": "number (opponent win %)",
      "remaining_sos": "number",
      "wins_vs_winning_teams": "number",
      "wins_vs_500_plus": "number",
      "divisional_games_remaining": "number"
    }
  }
}
```

**Data Sources:**
- `schedules` table → All game info (current + historical)
- Betting lines → The Odds API or schedules table
- Weather → schedules.weather, schedules.temp
- Game details integration → Link to finalized game-details pages

**Visual Display:**
- Current season: Week-by-week table with results
- Past games: Score, result, record after
- Future games: Opponent, date/time, TV, spread
- Each game row links to full game-details page
- Strength of schedule metrics
- Filter by season (dropdown: 2024, 2023, etc.)
- Highlight division games, primetime games

---

### 6. Division & Conference Standings

**Data Fields:**
```json
{
  "standings": {
    "division": {
      "division_name": "string (e.g., 'NFC East')",
      "teams": [
        {
          "team_id": "string",
          "team_name": "string",
          "rank": "number (1-4)",
          "wins": "number",
          "losses": "number",
          "ties": "number",
          "win_percentage": "number",
          "games_back": "number",
          "division_record": "string",
          "conference_record": "string",
          "home_record": "string",
          "away_record": "string",
          "streak": "string"
        }
      ]
    },
    "conference": {
      "conference_name": "string (NFC | AFC)",
      "teams": [
        {
          /* Same structure as division teams */
          "rank": "number (1-16)",
          "playoff_seed": "number (1-7 or null)",
          "clinched_division": "boolean",
          "clinched_playoff": "boolean",
          "eliminated": "boolean"
        }
      ]
    },
    "playoff_picture": {
      "wild_card_teams": ["team_id"],
      "division_leaders": ["team_id"],
      "teams_in_hunt": ["team_id"],
      "eliminated_teams": ["team_id"]
    }
  }
}
```

**Data Sources:**
- `season_stats` table → Team records
- Calculate standings from all teams' season_stats
- Playoff status → Logic based on wins, remaining games

**Visual Display:**
- Division standings table (4 teams)
- Conference standings table (16 teams)
- Highlight current team in both tables
- Playoff seed indicators
- Clinch/elimination badges
- Games behind leader

---

### 7. Coaching Staff Directory

**Data Fields:**
```json
{
  "coaching_staff": {
    "head_coach": {
      "coach_id": "string",
      "name": "string",
      "photo_url": "string",
      "title": "Head Coach",
      "years_with_team": "number",
      "career_record": {
        "wins": "number",
        "losses": "number",
        "win_percentage": "number"
      },
      "playoff_record": {
        "wins": "number",
        "losses": "number"
      },
      "super_bowl_wins": "number",
      "coaching_history": [
        {
          "team": "string",
          "years": "string (e.g., '2018-2020')",
          "role": "string"
        }
      ],
      "bio": "text (brief background)"
    },
    "offensive_coordinator": {
      /* Same structure as head_coach */
      "title": "Offensive Coordinator"
    },
    "defensive_coordinator": {
      /* Same structure */
      "title": "Defensive Coordinator"
    },
    "special_teams_coordinator": {
      /* Same structure */
      "title": "Special Teams Coordinator"
    },
    "position_coaches": [
      {
        "coach_id": "string",
        "name": "string",
        "title": "string (e.g., 'Quarterbacks Coach')",
        "position_group": "QB | RB | WR | OL | DL | LB | DB | ST",
        "years_with_team": "number",
        "photo_url": "string",
        "bio": "text"
      }
    ],
    "support_staff": [
      {
        "name": "string",
        "title": "string (e.g., 'Director of Player Personnel')",
        "role_type": "personnel | analytics | strength | medical"
      }
    ]
  }
}
```

**Data Sources:**
- Manual curation → Coaching staff details
- sportsref-nfl → Coaching records (if available)
- ESPN API → Coach photos

**Visual Display:**
- Head coach prominently featured with photo
- Coordinators in grid (OC, DC, ST)
- Position coaches organized by unit (Offense, Defense, ST)
- Expandable bios
- Coaching records with win percentages

---

## Priority Level: P1 (Important)

### 8. News & Transactions Feed

**Data Fields:**
```json
{
  "news": {
    "articles": [
      {
        "article_id": "string",
        "title": "string",
        "summary": "text",
        "published_date": "ISO 8601 datetime",
        "source": "string (NFL.com, ESPN, team site)",
        "url": "string",
        "thumbnail_url": "string",
        "category": "injury | roster_move | game_recap | feature | breaking"
      }
    ]
  },
  "transactions": {
    "recent_moves": [
      {
        "transaction_id": "string",
        "date": "ISO 8601 date",
        "type": "signing | trade | release | draft_pick | IR | contract_extension",
        "player_id": "string",
        "player_name": "string",
        "description": "string",
        "details": {
          "contract_years": "number",
          "contract_value": "number (dollars)",
          "traded_for": "string",
          "draft_pick_details": "string"
        }
      }
    ],
    "season_transactions": [
      /* All transactions for current season */
    ]
  }
}
```

**Data Sources:**
- ESPN API → News articles
- Manual/RSS feeds → Team news
- `injuries` table → Injury-related news
- Roster changes → Track in transactions table

**Visual Display:**
- News feed card with latest 5-10 articles
- Transaction timeline (most recent first)
- Filter by type (signings, trades, injuries)
- Click article → Open full article
- Transaction details in modal/expandable

---

### 9. Injury Report

**Data Fields:**
```json
{
  "injury_report": {
    "official_report": [
      {
        "player_id": "string",
        "player_name": "string",
        "position": "string",
        "injury_type": "string",
        "body_part": "string",
        "status": "out | doubtful | questionable | probable",
        "date_injured": "ISO 8601 date",
        "games_missed": "number",
        "estimated_return": "string (week or date)",
        "practice_participation": {
          "wednesday": "full | limited | dnp | null",
          "thursday": "full | limited | dnp | null",
          "friday": "full | limited | dnp | null"
        }
      }
    ],
    "injured_reserve": [
      {
        /* Same structure with IR-specific fields */
        "ir_designation": "IR | IR-return | PUP | NFI",
        "eligible_to_return_week": "number"
      }
    ],
    "injury_summary": {
      "total_players_injured": "number",
      "starters_injured": "number",
      "key_players_out": ["player_name"],
      "games_lost_to_injury": "number (team total)"
    }
  }
}
```

**Data Sources:**
- `injuries` table → All injury data
- Official NFL injury reports → Manual or API
- Practice participation → Manual tracking

**Visual Display:**
- Current injury report table
- Status color coding (🔴 Out, 🟡 Questionable, 🟢 Full)
- Practice participation grid
- IR list in separate section
- Injury timeline chart (games missed over season)

---

### 10. Key Players Spotlight

**Data Fields:**
```json
{
  "key_players": {
    "top_quarterback": {
      "player_id": "string",
      "name": "string",
      "photo_url": "string",
      "position": "QB",
      "season_stats": {
        "pass_yards": "number",
        "pass_tds": "number",
        "passer_rating": "number"
      },
      "rank": {
        "league_rank_yards": "number",
        "league_rank_tds": "number"
      },
      "player_card_preview": "component (S/M/L)"
    },
    "top_running_back": {
      /* Same structure */
      "position": "RB",
      "season_stats": {
        "rush_yards": "number",
        "rush_tds": "number",
        "yards_per_carry": "number"
      }
    },
    "top_receiver": {
      /* Same structure */
      "position": "WR",
      "season_stats": {
        "receptions": "number",
        "receiving_yards": "number",
        "receiving_tds": "number"
      }
    },
    "top_defender": {
      /* Same structure */
      "position": "string",
      "season_stats": {
        "tackles": "number",
        "sacks": "number",
        "interceptions": "number"
      }
    },
    "emerging_rookie": {
      /* Same structure */
      "is_rookie": "boolean",
      "draft_position": "string"
    }
  }
}
```

**Data Sources:**
- `player_stats` table → Season stats for team's players
- Player profiles integration → Player card components
- Determine "top" by stats (leading passer, rusher, etc.)

**Visual Display:**
- 5 player cards (QB, RB, WR, DEF, Rookie)
- Player card component (S/M/L size based on layout)
- Season stats highlighted
- League rank badges
- Click → Navigate to player profile

---

## Priority Level: P2 (Nice-to-Have)

### 11. Franchise History & Records

**Data Fields:**
```json
{
  "franchise_history": {
    "all_time_record": {
      "regular_season": {
        "wins": "number",
        "losses": "number",
        "ties": "number",
        "win_percentage": "number"
      },
      "playoffs": {
        "wins": "number",
        "losses": "number",
        "win_percentage": "number"
      }
    },
    "championships": {
      "super_bowls": [
        {
          "year": "number",
          "opponent": "string",
          "score": "string",
          "mvp": "string",
          "location": "string"
        }
      ],
      "pre_super_bowl_championships": [
        {
          "year": "number",
          "league": "string (NFL, AFL, etc.)",
          "opponent": "string"
        }
      ],
      "conference_championships": [
        {
          "year": "number",
          "conference": "NFC | AFC"
        }
      ],
      "division_titles": [
        {
          "year": "number",
          "division": "string"
        }
      ]
    },
    "playoff_appearances": {
      "total": "number",
      "years": ["number array"]
    },
    "hall_of_famers": [
      {
        "player_id": "string",
        "name": "string",
        "position": "string",
        "inducted_year": "number",
        "years_with_team": "string (e.g., '1989-2000')"
      }
    ],
    "retired_numbers": [
      {
        "number": "number",
        "player_name": "string",
        "position": "string",
        "year_retired": "number"
      }
    ],
    "franchise_records": {
      "single_season": {
        "most_wins": {
          "value": "number",
          "year": "number",
          "record": "string (W-L)"
        },
        "most_points": {
          "value": "number",
          "year": "number"
        },
        "fewest_points_allowed": {
          "value": "number",
          "year": "number"
        }
      },
      "single_game": {
        "most_points": {
          "value": "number",
          "opponent": "string",
          "date": "ISO 8601 date"
        },
        "largest_margin_of_victory": {
          "value": "number",
          "opponent": "string",
          "date": "ISO 8601 date"
        }
      }
    }
  }
}
```

**Data Sources:**
- Manual curation → Championships, HOF, retired numbers
- sportsref-nfl → Historical records
- `schedules` table (historical) → Calculate franchise records

**Visual Display:**
- Championship rings visual
- Super Bowl years timeline
- Hall of Famers grid with photos
- Retired numbers display
- Franchise records table
- All-time record prominently displayed

---

### 12. All-Time Leaders

**Data Fields:**
```json
{
  "all_time_leaders": {
    "passing": {
      "yards": [
        {
          "player_id": "string",
          "player_name": "string",
          "value": "number",
          "years_active": "string (e.g., '1989-2000')"
        }
      ],
      "touchdowns": [ /* same structure */ ],
      "completions": [ /* same structure */ ]
    },
    "rushing": {
      "yards": [ /* same structure */ ],
      "touchdowns": [ /* same structure */ ],
      "attempts": [ /* same structure */ ]
    },
    "receiving": {
      "receptions": [ /* same structure */ ],
      "yards": [ /* same structure */ ],
      "touchdowns": [ /* same structure */ ]
    },
    "defense": {
      "sacks": [ /* same structure */ ],
      "interceptions": [ /* same structure */ ],
      "tackles": [ /* same structure */ ]
    }
  }
}
```

**Data Sources:**
- sportsref-nfl → Historical player stats
- `player_stats` table → Aggregate career stats for team's players
- Manual curation for pre-modern era

**Visual Display:**
- Leaderboard format (top 5-10)
- Organized by category (Passing, Rushing, Receiving, Defense)
- Player photos
- Click player → Navigate to player profile
- Career years and total value

---

### 13. Team Analytics Dashboard

**Data Fields:**
```json
{
  "team_analytics": {
    "power_rankings": {
      "overall_rank": "number (1-32)",
      "offense_rank": "number",
      "defense_rank": "number",
      "special_teams_rank": "number"
    },
    "elo_rating": {
      "current_elo": "number",
      "elo_rank": "number",
      "elo_history": [
        {
          "week": "number",
          "elo": "number"
        }
      ]
    },
    "dvoa_breakdown": {
      "overall_dvoa": "percentage",
      "weighted_dvoa": "percentage",
      "offense_rank": "number",
      "defense_rank": "number",
      "variance": "number"
    },
    "trending": {
      "win_probability_added": "number",
      "recent_form": "string (last 5 games)",
      "momentum_score": "number"
    }
  }
}
```

**Data Sources:**
- nflscraPy → ELO ratings
- FiveThirtyEight → Power rankings (if available)
- Calculate DVOA or use external source
- Custom analytics → Momentum, WPA

**Visual Display:**
- Analytics dashboard with charts
- ELO history line graph
- DVOA breakdown visualization
- Power rankings badge
- Trending indicators

---

### 14. Depth Chart Visualization

**Data Fields:**
```json
{
  "depth_chart": {
    "offense": {
      "quarterback": [
        {
          "depth": 1,
          "player_id": "string",
          "name": "string",
          "number": "number"
        }
      ],
      "running_back": [ /* array of players by depth */ ],
      "wide_receiver": [ /* array */ ],
      "tight_end": [ /* array */ ],
      "offensive_line": {
        "left_tackle": [ /* array */ ],
        "left_guard": [ /* array */ ],
        "center": [ /* array */ ],
        "right_guard": [ /* array */ ],
        "right_tackle": [ /* array */ ]
      }
    },
    "defense": {
      "defensive_line": [ /* by position */ ],
      "linebacker": [ /* array */ ],
      "secondary": {
        "cornerback": [ /* array */ ],
        "safety": [ /* array */ ]
      }
    },
    "special_teams": {
      "kicker": [ /* array */ ],
      "punter": [ /* array */ ],
      "long_snapper": [ /* array */ ],
      "return_specialist": [ /* array */ ]
    }
  }
}
```

**Data Sources:**
- `depth_charts` table → Depth positioning
- `rosters` table → Player info
- Manual updates → Weekly depth chart changes

**Visual Display:**
- Visual depth chart (football field layout)
- Starter/backup designation
- Injury status overlays
- Click player → Player card preview

---

## Data Update Frequency

| Data Element | Update Frequency |
|--------------|------------------|
| Team Identity | Static (update on corrections) |
| Current Season Record | After each game (real-time during games) |
| Roster | Daily during season, weekly offseason |
| Team Statistics | After each game (within 1 hour) |
| Schedule | Daily (for odds updates), after games for results |
| Standings | After each game (all teams) |
| Coaching Staff | Weekly or as changes occur |
| News Feed | Hourly (RSS/API pull) |
| Transactions | Real-time when announced |
| Injury Report | Daily (official reports Wed-Fri), real-time for major injuries |
| Key Players | After each game (recalculate leaders) |
| Franchise History | Static (update annually or on milestones) |
| All-Time Leaders | After each game (if records broken) |
| Analytics | Weekly (ELO, DVOA) |

---

## API Endpoints Needed

### Existing
- `GET /v1/teams` → All 32 teams
- `GET /v1/teams/{team_id}` → Team overview
- `GET /v1/teams/{team_id}/roster?season={year}` → Roster
- `GET /v1/teams/{team_id}/schedule?season={year}` → Schedule
- `GET /v1/teams/{team_id}/stats?season={year}` → Statistics
- `GET /v1/standings?year={year}&week={week}` → Standings

### New/Enhanced
- `GET /v1/teams/{team_id}/coaching-staff` → Full coaching directory
- `GET /v1/teams/{team_id}/news` → News feed
- `GET /v1/teams/{team_id}/transactions?season={year}` → Transaction history
- `GET /v1/teams/{team_id}/injuries` → Current injury report
- `GET /v1/teams/{team_id}/key-players` → Key players spotlight
- `GET /v1/teams/{team_id}/history` → Franchise history
- `GET /v1/teams/{team_id}/all-time-leaders` → All-time leaders
- `GET /v1/teams/{team_id}/analytics` → Team analytics dashboard
- `GET /v1/teams/{team_id}/depth-chart` → Depth chart

---

## Caching Strategy

### Long TTL (Season Data)
- Team identity: 1 week (rarely changes)
- Franchise history: 1 month (static)
- All-time leaders: 1 day (rare changes)
- Coaching staff: 1 week (rare changes)
- Stadium info: 1 month (static)

### Medium TTL (Game-Dependent)
- Current season stats: 1 hour (updates after games)
- Roster: 6 hours (daily changes possible)
- Schedule: 1 hour (odds updates)
- Standings: 1 hour (after games)
- Key players: 1 hour (after games)

### Short TTL (Real-Time)
- Injury report: 15 minutes (during week)
- News feed: 15 minutes (constant updates)
- Transactions: 5 minutes (real-time announcements)
- Live game stats: 30 seconds (during games)

---

## Progressive Enhancement

### Initial Load (< 1 second)
1. Team header (logo, name, record, standings)
2. Current season overview
3. Next game info

### Secondary Load (1-2 seconds)
4. Roster table (active roster only)
5. Basic team stats (PPG, YPG, rank)
6. Schedule (current week context)
7. Division standings

### Tertiary Load (2-3 seconds)
8. Full statistics (all tabs)
9. Complete schedule
10. News feed
11. Key players spotlight

### On-Demand Load
12. Practice squad and IR (expand roster)
13. Coaching staff (separate tab)
14. Franchise history (separate tab)
15. All-time leaders (separate tab)
16. Advanced analytics (separate tab)
17. Historical schedules (season dropdown)

---

## Mobile Considerations

### Priority on Small Screens
- **Above fold:** Team header, current record, next game
- **Tabs:** Overview | Roster | Schedule | Stats | News
- **Collapsed sections:** Coaching staff, history, analytics
- **On-demand:** Full roster (show starters only initially)

### Data Usage Optimization
- Lazy load roster photos
- Load stats tabs on demand
- Don't load historical data until requested
- Compress team logos and photos

---

## Integrations (Modular)

### Player Profiles Integration
- Roster table: Each player links to player profile
- Player cards (S/M/L): Imported component for previews
- Key players: Use player card component
- All-time leaders: Link to retired players' profiles

### Stadium Integration
- Header: Stadium name links to stadium page
- Home games: Show stadium details
- Stadium page: Cross-reference with team page

### Matchup Preview Integration
- Next game section: Link to matchup preview page
- Schedule: Each upcoming game links to matchup preview

### Game Details Integration
- Schedule: Each completed game links to game-details page
- Last game: Link to full game recap
- Season schedule: Deep linking to all games

### Business Data Integration (Future)
- Ownership, valuation, payroll
- To be integrated in future phase

---

## Success Criteria

### Minimum Viable Product (MVP) - P0
- ✅ Team identity and header
- ✅ Current season overview
- ✅ Active roster with depth chart
- ✅ Team statistics (offense, defense, special teams)
- ✅ Full season schedule with results
- ✅ Division and conference standings
- ✅ Coaching staff directory

### Full Launch - P0 + P1
- ✅ All MVP features
- ✅ News and transactions feed
- ✅ Injury reports
- ✅ Key players spotlight
- ✅ Practice squad and IR
- ✅ Advanced analytics tab
- ✅ Situational splits

### Premium Experience - P0 + P1 + P2
- ✅ All Full Launch features
- ✅ Complete franchise history
- ✅ All-time leaders by position
- ✅ Championships and retired numbers
- ✅ Hall of Famers
- ✅ Team analytics dashboard
- ✅ Depth chart visualization

---

**Status:** Requirements defined via AskUserQuestion workflow
**Reference:** `context/team-page.md` contains full UI/UX specification
**Next Steps:** Create detailed field list, data source mapping, and coverage analysis
