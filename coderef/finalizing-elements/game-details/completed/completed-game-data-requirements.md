# Completed Game - Data Requirements

**Game Type:** Final / Post-Game
**Update Frequency:** Static (updated once after game ends)
**User Context:** Reviewing results, analyzing performance, researching season trends, comparing to historical games

---

## Overview

Completed games show **what happened** with a focus on:
- Complete box score and final stats
- Season context and playoff implications
- Historical comparisons and records
- Final betting results (spread, total)
- Player milestones and achievements
- Full game narrative and analysis

---

## Priority Level: P0 (Must-Have)

### 1. Final Game Header

**Data Fields:**
```json
{
  "game_id": "string",
  "status": "completed",
  "scheduled_date": "ISO 8601 datetime",
  "actual_kickoff": "ISO 8601 datetime",
  "game_duration": "HH:MM (total game time)",
  "week": "number",
  "season": "number",
  "season_type": "REG | POST | PRE",
  "final_score": {
    "home": "number",
    "away": "number",
    "winner": "home | away | tie"
  },
  "teams": {
    "away": {
      "id": "string",
      "name": "string",
      "abbreviation": "string",
      "logo_url": "string",
      "record_before": { "wins": "number", "losses": "number", "ties": "number" },
      "record_after": { "wins": "number", "losses": "number", "ties": "number" }
    },
    "home": {
      "id": "string",
      "name": "string",
      "abbreviation": "string",
      "logo_url": "string",
      "record_before": { "wins": "number", "losses": "number", "ties": "number" },
      "record_after": { "wins": "number", "losses": "number", "ties": "number" }
    }
  },
  "venue": {
    "name": "string",
    "city": "string",
    "state": "string",
    "roof_type": "outdoor | dome | retractable"
  },
  "attendance": "number",
  "broadcast": {
    "network": "string",
    "national": "boolean"
  }
}
```

**Data Sources:**
- `schedules` table → game_id, date, time, week, teams, stadium, final scores
- `teams` table → logos, names, abbreviations
- Calculate records from historical schedules

**Visual Display:**
- Large final score display
- Winner highlighted (green border/background)
- Record changes shown (e.g., "10-5" → "11-5")
- "FINAL" badge
- Attendance and venue info

---

### 2. Final Score Breakdown

**Data Fields:**
```json
{
  "score_breakdown": {
    "away": {
      "q1": "number",
      "q2": "number",
      "q3": "number",
      "q4": "number",
      "ot": "number | null",
      "total": "number"
    },
    "home": {
      "q1": "number",
      "q2": "number",
      "q3": "number",
      "q4": "number",
      "ot": "number | null",
      "total": "number"
    }
  }
}
```

**Data Sources:**
- `schedules` table → quarter scores

**Visual Display:**
- Horizontal table: Q1 | Q2 | Q3 | Q4 | OT | T
- Winner's row highlighted

---

### 3. Complete Box Score - Passing

**Data Fields:**
```json
{
  "passing": {
    "[team_id]": [
      {
        "player_id": "string",
        "player_name": "string",
        "completions": "number",
        "attempts": "number",
        "completion_percentage": "number",
        "yards": "number",
        "yards_per_attempt": "number",
        "touchdowns": "number",
        "interceptions": "number",
        "sacks": "number",
        "sack_yards_lost": "number",
        "longest_pass": "number",
        "passer_rating": "number",
        "qbr": "number (if available)"
      }
    ]
  }
}
```

**Data Sources:**
- nflreadpy play-by-play → Calculate from all passing plays
- `player_stats` table → Per-game passing stats

**Visual Display:**
- Complete passing stats table
- Sort by passing yards
- Highlight 300+ yard games, 3+ TD games
- Passer rating color-coded (>100=green, <70=red)

---

### 4. Complete Box Score - Rushing

**Data Fields:**
```json
{
  "rushing": {
    "[team_id]": [
      {
        "player_id": "string",
        "player_name": "string",
        "carries": "number",
        "yards": "number",
        "average": "number",
        "touchdowns": "number",
        "long": "number",
        "fumbles": "number",
        "first_downs": "number"
      }
    ]
  }
}
```

**Data Sources:**
- nflreadpy play-by-play → Rush stats per play
- `player_stats` table → Per-game rushing stats

**Visual Display:**
- Complete rushing stats table
- Highlight 100+ yard games, 2+ TD games
- Sort by rushing yards

---

### 5. Complete Box Score - Receiving

**Data Fields:**
```json
{
  "receiving": {
    "[team_id]": [
      {
        "player_id": "string",
        "player_name": "string",
        "receptions": "number",
        "targets": "number",
        "catch_rate": "percentage",
        "yards": "number",
        "yards_per_reception": "number",
        "touchdowns": "number",
        "long": "number",
        "first_downs": "number"
      }
    ]
  }
}
```

**Data Sources:**
- nflreadpy play-by-play → Reception stats per play
- `player_stats` table → Per-game receiving stats

**Visual Display:**
- Complete receiving stats table
- Highlight 100+ yard games, 2+ TD games
- Sort by receiving yards

---

### 6. Complete Box Score - Defense

**Data Fields:**
```json
{
  "defense": {
    "[team_id]": [
      {
        "player_id": "string",
        "player_name": "string",
        "tackles": "number",
        "assists": "number",
        "sacks": "number",
        "tackles_for_loss": "number",
        "interceptions": "number",
        "passes_defended": "number",
        "forced_fumbles": "number",
        "fumble_recoveries": "number"
      }
    ]
  }
}
```

**Data Sources:**
- nflreadpy play-by-play → Defensive stats per play
- `player_stats` table → Per-game defensive stats

**Visual Display:**
- Defense stats table
- Sort by tackles
- Highlight 2+ sacks, interceptions

---

### 7. Final Team Stats Comparison

**Data Fields:**
```json
{
  "team_stats": {
    "home": {
      "first_downs": "number",
      "first_downs_passing": "number",
      "first_downs_rushing": "number",
      "first_downs_penalty": "number",
      "total_yards": "number",
      "passing_yards": "number",
      "rushing_yards": "number",
      "plays": "number",
      "yards_per_play": "number",
      "turnovers": "number",
      "fumbles_lost": "number",
      "interceptions_thrown": "number",
      "penalties": "number",
      "penalty_yards": "number",
      "time_of_possession": "MM:SS",
      "third_down_conversions": "number",
      "third_down_attempts": "number",
      "third_down_percentage": "number",
      "fourth_down_conversions": "number",
      "fourth_down_attempts": "number",
      "red_zone_trips": "number",
      "red_zone_scores": "number",
      "sacks_allowed": "number"
    },
    "away": {
      /* same structure */
    }
  }
}
```

**Data Sources:**
- nflreadpy play-by-play → Calculate from all plays
- `schedules` table → Aggregate team stats

**Visual Display:**
- Side-by-side comparison table
- Winner's column highlighted
- Stat differentials shown (e.g., +120 yards)

---

## Priority Level: P1 (Important)

### 8. Complete Scoring Summary

**Data Fields:**
```json
{
  "scoring_summary": [
    {
      "quarter": "number",
      "time": "MM:SS",
      "team": "home | away",
      "score_type": "touchdown | field_goal | safety | extra_point | two_point_conversion",
      "description": "string",
      "yards": "number (for TD drives or FG distance)",
      "home_score": "number (score after this play)",
      "away_score": "number (score after this play)"
    }
  ]
}
```

**Data Sources:**
- nflreadpy play-by-play → Filter scoring plays

**Visual Display:**
- Chronological timeline of all scoring plays
- Score differential after each play
- Drive info (e.g., "7 plays, 75 yards, 3:24")

---

### 9. Season Context & Implications

**Data Fields:**
```json
{
  "season_context": {
    "playoff_implications": {
      "home_team": {
        "playoff_status": "clinched | in_hunt | eliminated",
        "division_standing": "number (1-4)",
        "conference_standing": "number (1-16)",
        "playoff_probability": "percentage (if available)"
      },
      "away_team": {
        /* same structure */
      }
    },
    "streak_info": {
      "home_team": {
        "current_streak": "string (e.g., 'W3' or 'L2')",
        "home_record": "string (W-L at home)",
        "division_record": "string (W-L in division)"
      },
      "away_team": {
        "current_streak": "string",
        "away_record": "string (W-L on road)",
        "division_record": "string"
      }
    },
    "season_series": {
      "description": "string (e.g., 'Series tied 1-1', 'Team A leads 2-0')",
      "games_remaining": "number"
    }
  }
}
```

**Data Sources:**
- `schedules` table → Calculate standings, streaks, records
- `season_stats` table → Season-long performance
- Manual logic → Playoff probability (or use external model)

**Visual Display:**
- "Playoff Implications" card
- Standings position badges
- Streak indicator
- Season series summary

---

### 10. Final Betting Results

**Data Fields:**
```json
{
  "betting_results": {
    "spread": {
      "opening_line": "number",
      "closing_line": "number",
      "favorite": "home | away",
      "actual_margin": "number",
      "result": "favorite_covered | underdog_covered | push"
    },
    "total": {
      "opening_line": "number",
      "closing_line": "number",
      "actual_total": "number",
      "result": "over | under | push"
    },
    "moneyline": {
      "home_odds": "number",
      "away_odds": "number",
      "winner": "home | away"
    }
  }
}
```

**Data Sources:**
- `schedules` table → Opening/closing lines
- Calculate results from final score

**Visual Display:**
- Betting results card
- Spread result with checkmark/X
- Total result (O/U)
- Moneyline winner

---

### 11. Player Milestones & Achievements

**Data Fields:**
```json
{
  "milestones": [
    {
      "player_id": "string",
      "player_name": "string",
      "team": "home | away",
      "milestone_type": "career | season | game",
      "achievement": "string (e.g., '300th career TD', 'First 100-yard game')",
      "stat_value": "number",
      "description": "string"
    }
  ]
}
```

**Data Sources:**
- `player_stats` table → Calculate career/season totals
- Logic to detect milestones (100-yard game, 5+ receptions, etc.)

**Visual Display:**
- "Player Milestones" section
- Badge for each milestone
- Player name with team logo

---

### 12. Historical Comparisons

**Data Fields:**
```json
{
  "historical_comparisons": {
    "head_to_head_all_time": {
      "home_team_wins": "number",
      "away_team_wins": "number",
      "ties": "number"
    },
    "at_this_venue": {
      "home_team_wins": "number",
      "away_team_wins": "number"
    },
    "in_this_season": {
      "previous_meeting": {
        "date": "ISO 8601 date",
        "winner": "string",
        "score": "string"
      }
    },
    "similar_games": [
      {
        "date": "ISO 8601 date",
        "teams": "string",
        "similarity": "string (e.g., 'Both teams 10-5, playoff implications')"
      }
    ]
  }
}
```

**Data Sources:**
- `schedules` table (historical) → Filter by both teams
- Logic to find similar matchups

**Visual Display:**
- "Historical Context" section
- All-time series record
- Venue-specific record
- Links to previous meetings

---

## Priority Level: P2 (Nice-to-Have)

### 13. Complete Play-by-Play

**Data Fields:**
```json
{
  "play_by_play": [
    {
      "play_id": "string",
      "quarter": "number",
      "time": "MM:SS",
      "down": "number",
      "distance": "number",
      "yardline": "number",
      "possession_team": "string",
      "play_type": "pass | run | punt | kickoff | field_goal",
      "play_description": "string",
      "yards_gained": "number",
      "scoring_play": "boolean",
      "turnover": "boolean",
      "penalty": "boolean",
      "home_score_after": "number",
      "away_score_after": "number"
    }
  ]
}
```

**Data Sources:**
- nflreadpy play-by-play → Every single play

**Visual Display:**
- Collapsible drive-by-drive view
- Searchable/filterable
- Export to CSV option

---

### 14. Game Information & Details

**Data Fields:**
```json
{
  "game_information": {
    "weather": {
      "temperature": "number",
      "condition": "string",
      "wind_speed": "number",
      "wind_direction": "string"
    },
    "officials": {
      "referee": "string",
      "umpire": "string",
      "down_judge": "string",
      "line_judge": "string",
      "field_judge": "string",
      "side_judge": "string",
      "back_judge": "string"
    },
    "broadcast": {
      "network": "string",
      "announcers": ["string"],
      "ratings": "number (viewership in millions, if available)"
    }
  }
}
```

**Data Sources:**
- nflreadpy schedules → Weather, officials
- ESPN API → Broadcast details

**Visual Display:**
- "Game Information" expandable section
- Weather icon with details
- Officials list
- Broadcast details

---

### 15. Advanced Analytics

**Data Fields:**
```json
{
  "advanced_analytics": {
    "win_probability_chart": [
      {
        "play_number": "number",
        "home_wp": "percentage",
        "away_wp": "percentage"
      }
    ],
    "epa_summary": {
      "home": {
        "total_epa": "number",
        "passing_epa": "number",
        "rushing_epa": "number"
      },
      "away": {
        /* same structure */
      }
    },
    "success_rate": {
      "home": "percentage",
      "away": "percentage"
    },
    "explosive_plays": {
      "home": "number (plays > 20 yards)",
      "away": "number"
    }
  }
}
```

**Data Sources:**
- nflreadpy play-by-play → EPA, WP for every play

**Visual Display:**
- Win probability line chart (full game)
- EPA comparison bars
- Success rate percentages
- Explosive plays count

---

### 16. Video Highlights & Media

**Data Fields:**
```json
{
  "media": {
    "highlights": [
      {
        "video_id": "string",
        "title": "string",
        "description": "string",
        "thumbnail_url": "string",
        "video_url": "string",
        "duration": "number (seconds)",
        "play_ids": ["string"]
      }
    ],
    "post_game_interviews": [
      {
        "video_id": "string",
        "title": "string",
        "interviewee": "string (coach or player)",
        "thumbnail_url": "string",
        "video_url": "string"
      }
    ]
  }
}
```

**Data Sources:**
- ESPN API → Video highlights
- Manual curation → Post-game interviews

**Visual Display:**
- Video grid with thumbnails
- Click to watch
- Grouped by category (Highlights, Interviews)

---

## Data Update Frequency

| Data Element | Update Frequency |
|--------------|------------------|
| Game Header | Once (after game ends) |
| Box Scores | Once (after game ends) |
| Team Stats | Once (after game ends) |
| Scoring Summary | Once (after game ends) |
| Season Context | Daily (as standings change) |
| Betting Results | Once (after game ends) |
| Milestones | Once (after game ends) |
| Historical Comparisons | Static (historical data) |
| Play-by-Play | Once (after game ends) |
| Advanced Analytics | Once (after game ends) |
| Video Highlights | As available (hours after game) |

---

## API Endpoints Needed

### Existing
- `GET /v1/schedules?week={week}&status=completed`
- `GET /v1/schedules/{game_id}` → Game details
- `GET /v1/play-by-play/{game_id}` → All plays
- `GET /v1/teams/{team_id}/stats?season={season}`

### New/Enhanced
- `GET /v1/schedules/{game_id}/season-context` → Playoff implications, standings
- `GET /v1/schedules/{game_id}/betting-results` → Final betting outcomes
- `GET /v1/schedules/{game_id}/milestones` → Player achievements from this game
- `GET /v1/schedules/{game_id}/historical-context` → Head-to-head, similar games
- `GET /v1/schedules/{game_id}/advanced-analytics` → EPA, WP chart, success rate

---

## Caching Strategy

### Long TTL for Completed Games
- Game header: 24 hours (never changes, but may be corrected)
- Box scores: 24 hours
- Team stats: 24 hours
- Season context: 1 hour (standings may shift)
- Betting results: Permanent (never changes)
- Advanced analytics: Permanent
- Video highlights: 6 hours (new videos may be added)

### Static Data
- Play-by-play: Permanent (never changes after game ends)
- Historical comparisons: Permanent

---

## Progressive Enhancement

### Initial Load (< 1 second)
1. Final score and game header
2. Score breakdown by quarter
3. Final team stats comparison

### Secondary Load (1-2 seconds)
4. Complete box scores (passing, rushing, receiving, defense)
5. Scoring summary
6. Season context & playoff implications

### Tertiary Load (2-3 seconds)
7. Final betting results
8. Player milestones
9. Historical comparisons
10. Advanced analytics

### On-Demand Load
11. Complete play-by-play (load when tab is clicked)
12. Video highlights (load when section is expanded)

---

## Mobile Considerations

### Priority on Small Screens
- **Above fold:** Final score, team records after game
- **Tabs:** Box Score | Team Stats | Scoring | Play-by-Play | Advanced
- **Collapsed sections:** Season context, betting results, milestones
- **On-demand:** Play-by-play, video highlights

### Data Usage Optimization
- Don't load play-by-play until requested
- Compress images and videos
- Use lazy loading for all media

---

## User Actions

Completed games should allow users to:
1. **Compare to Season Average** - How did this game compare to team's season stats?
2. **View Player Season Stats** - Click player name to see full season stats
3. **Export Box Score** - Download as PDF or CSV
4. **Share Game Summary** - Social media share card
5. **Add to Favorites** - Save for quick reference
6. **View Related Games** - Other games this week or historical matchups
7. **Watch Highlights** - Inline video player

---

## Success Metrics

For completed games, track:
- Time spent on page
- Box score tab engagement
- Play-by-play usage (% who click into it)
- Video highlight views
- Export/share actions
- Season context click-through
- Advanced analytics engagement

---

## Season Trends & Context Examples

### Playoff Implications
- "With this win, Team A clinches playoff spot"
- "Team B eliminated from playoff contention"
- "Team A now controls division with 1 game left"

### Record Milestones
- "Team A's 5th straight win, longest streak since 2019"
- "Team B's first road win this season"
- "Team A now 7-0 at home, best home record since 2015"

### Player Trends
- "Player X has 100+ receiving yards in 3 straight games"
- "Player Y reached 1,000 rushing yards for the season"
- "Player Z's 4th multi-TD game this season"

### Historical Context
- "Largest comeback in stadium history (down 21-0)"
- "First time these teams met in playoffs since 2010"
- "Team A extends division dominance to 8-2 in last 10 meetings"

---

## Implementation Notes

### Data Enrichment
- Calculate all season context immediately after game ends
- Detect player milestones automatically using career stat thresholds
- Generate narrative snippets for key storylines

### Narrative Generation
- Use templates to auto-generate game summary text
- Highlight biggest plays and turning points
- Include betting context in summary

### Search & Discovery
- Index completed games for search (e.g., "Chiefs vs Bills 2024")
- Allow filtering by week, team, playoff implications
- Surface "similar games" in search results
