# Scheduled Game - Data Requirements

**Game Type:** Pre-Game / Upcoming
**Update Frequency:** Daily (or when betting lines change)
**User Context:** Planning to watch, making betting decisions, researching matchups

---

## Overview

Scheduled games show **what's coming up** with a focus on:
- Betting context (lines, odds, predictions)
- Team preview and recent performance
- Head-to-head history
- Key storylines and injury impact

---

## Priority Level: P0 (Must-Have)

### 1. Game Header - Pre-Game Edition

**Data Fields:**
```json
{
  "game_id": "string",
  "status": "scheduled",
  "scheduled_date": "ISO 8601 datetime",
  "scheduled_time": "HH:MM timezone",
  "week": "number",
  "season": "number",
  "season_type": "REG | POST | PRE",
  "teams": {
    "away": {
      "id": "string",
      "name": "string",
      "abbreviation": "string",
      "logo_url": "string",
      "record": {
        "wins": "number",
        "losses": "number",
        "ties": "number"
      }
    },
    "home": {
      "id": "string",
      "name": "string",
      "abbreviation": "string",
      "logo_url": "string",
      "record": {
        "wins": "number",
        "losses": "number",
        "ties": "number"
      }
    }
  },
  "venue": {
    "name": "string",
    "city": "string",
    "state": "string",
    "roof_type": "outdoor | dome | retractable"
  },
  "broadcast": {
    "network": "string (CBS, FOX, NBC, ESPN, etc.)",
    "national": "boolean"
  }
}
```

**Data Sources:**
- `schedules` table → game_id, date, time, week, teams, stadium
- `teams` table → logos, names, abbreviations
- ESPN API → broadcast network

**Visual Display:**
- Large team logos
- Team records prominently displayed
- Countdown timer to kickoff
- Broadcast network badge

---

### 2. Betting Context

**Data Fields:**
```json
{
  "betting_lines": {
    "spread": {
      "line": "number (negative = home favored)",
      "home_odds": "number (American odds)",
      "away_odds": "number (American odds)"
    },
    "total": {
      "line": "number",
      "over_odds": "number",
      "under_odds": "number"
    },
    "moneyline": {
      "home": "number (American odds)",
      "away": "number (American odds)"
    },
    "implied_probability": {
      "home_win": "percentage",
      "away_win": "percentage"
    },
    "last_updated": "ISO 8601 datetime"
  }
}
```

**Data Sources:**
- `schedules` table → spread_line, total_line, home_moneyline, away_moneyline
- The Odds API (optional) → Real-time line movements
- Calculate implied probability from moneyline

**Visual Display:**
- Betting lines prominently displayed
- Line movement indicators (↑↓)
- Implied win probability as percentage bars
- Link to full betting analysis

---

## Priority Level: P1 (Important)

### 3. Team Preview Stats

**Data Fields:**
```json
{
  "team_stats": {
    "[team_id]": {
      "recent_form": {
        "last_5_games": "W-L string (e.g., 'W-L-W-W-L')",
        "last_5_record": { "wins": "number", "losses": "number" }
      },
      "season_offense": {
        "points_per_game": "number",
        "yards_per_game": "number",
        "pass_yards_per_game": "number",
        "rush_yards_per_game": "number",
        "turnovers": "number"
      },
      "season_defense": {
        "points_allowed_per_game": "number",
        "yards_allowed_per_game": "number",
        "takeaways": "number"
      },
      "rankings": {
        "power_ranking": "number (1-32)",
        "elo_rating": "number",
        "offensive_rank": "number (1-32)",
        "defensive_rank": "number (1-32)"
      },
      "betting_record": {
        "ats_record": "string (W-L)",
        "ats_percentage": "number",
        "over_under_record": "string (O-U)",
        "over_percentage": "number"
      }
    }
  }
}
```

**Data Sources:**
- `season_stats` table → yards per game, EPA, success rate
- `schedules` table (historical) → Calculate last 5 games
- `power_ratings` table → ELO rating, rankings
- Calculate ATS and O/U records from schedules + results

**Visual Display:**
- Side-by-side team comparison cards
- Recent form with W/L icons
- Stat bars showing offensive/defensive rankings
- ATS/O/U records with percentages

---

### 4. Head-to-Head History

**Data Fields:**
```json
{
  "head_to_head": {
    "all_time_record": {
      "team_a_wins": "number",
      "team_b_wins": "number",
      "ties": "number"
    },
    "recent_meetings": [
      {
        "date": "ISO 8601 date",
        "season": "number",
        "week": "number",
        "home_team": "string",
        "away_team": "string",
        "home_score": "number",
        "away_score": "number",
        "winner": "string",
        "spread_result": "covered | pushed | did_not_cover",
        "total_result": "over | under | push"
      }
    ],
    "average_score_differential": "number (last 5 games)",
    "home_field_advantage": "number (home team avg margin)"
  }
}
```

**Data Sources:**
- `schedules` table (historical) → Filter by both teams
- Calculate spread/total results from historical lines + scores

**Visual Display:**
- Last 5 meetings timeline
- All-time series record
- Average score trends
- Home field advantage indicator

---

### 5. Weather Forecast (Outdoor Stadiums Only)

**Data Fields:**
```json
{
  "weather_forecast": {
    "temperature": "number (Fahrenheit)",
    "feels_like": "number",
    "condition": "string (Clear, Cloudy, Rain, Snow, etc.)",
    "wind_speed": "number (mph)",
    "wind_direction": "string (N, NE, E, etc.)",
    "precipitation_chance": "number (percentage)",
    "humidity": "number (percentage)",
    "forecast_time": "ISO 8601 datetime",
    "impact_rating": "Low | Medium | High"
  }
}
```

**Data Sources:**
- OpenWeatherMap API → 7-day forecast for stadium location
- Custom logic → Calculate impact rating (wind > 15mph = High, etc.)

**Visual Display:**
- Weather icon with temperature
- Wind speed with direction arrow
- Impact badge (color-coded)
- "Weather may affect game" alert if High impact

---

## Priority Level: P2 (Nice-to-Have)

### 6. Advanced Predictions

**Data Fields:**
```json
{
  "predictions": {
    "win_probability": {
      "home": "percentage",
      "away": "percentage",
      "model": "string (ELO, EPA-based, etc.)"
    },
    "projected_score": {
      "home": { "low": "number", "high": "number", "median": "number" },
      "away": { "low": "number", "high": "number", "median": "number" }
    },
    "key_matchups": [
      {
        "title": "string",
        "description": "string",
        "advantage": "home | away | even"
      }
    ]
  }
}
```

**Data Sources:**
- Calculate from ELO ratings
- EPA-based predictions
- Success rate differentials

**Visual Display:**
- Win probability gauge
- Projected score range bars
- Key matchup cards with advantage indicators

---

### 7. Injury Reports

**Data Fields:**
```json
{
  "injury_reports": {
    "[team_id]": [
      {
        "player_id": "string",
        "player_name": "string",
        "position": "string",
        "injury": "string",
        "status": "Out | Questionable | Doubtful | Probable",
        "impact_to_team": "High | Medium | Low"
      }
    ]
  }
}
```

**Data Sources:**
- `injuries` table → player_id, team, status, injury type
- `players` table → player name, position
- Manual tagging or logic → impact_to_team based on position + starter status

**Visual Display:**
- Injury list by team
- Status color-coded (Out=red, Questionable=yellow)
- Star players highlighted
- Impact badges

---

### 8. Expert Picks & Analysis

**Data Fields:**
```json
{
  "expert_analysis": {
    "consensus_pick": "home | away",
    "consensus_percentage": "number",
    "betting_trends": {
      "public_bets_on_home": "percentage",
      "public_money_on_home": "percentage",
      "sharp_money_indicator": "home | away | split"
    },
    "notable_angles": [
      {
        "angle": "string (e.g., 'Revenge game', 'Primetime underdog')",
        "explanation": "string"
      }
    ]
  }
}
```

**Data Sources:**
- External picks data (if available)
- Betting percentage data (The Odds API or other)
- Manual content or AI-generated angles

**Visual Display:**
- Expert pick badge
- Public vs sharp money indicator
- Notable angles cards

---

## Data Update Frequency

| Data Element | Update Frequency |
|--------------|-----------------|
| Game Info | Once per day |
| Betting Lines | Every 5-15 minutes |
| Team Stats | Daily |
| Head-to-Head | Static (historical) |
| Weather | Every 3-6 hours |
| Injury Reports | Twice per week (Wed/Fri) |
| Predictions | Daily |
| Expert Picks | Daily or as available |

---

## API Endpoints Needed

### Existing
- `GET /v1/schedules?week={week}&status=scheduled`
- `GET /v1/teams/{team_id}/stats?season={season}`
- `GET /v1/power_ratings?season={season}`
- `GET /v1/injuries?week={week}&team={team_id}`

### New/Enhanced
- `GET /v1/schedules/{game_id}/head-to-head` → Historical matchups
- `GET /v1/schedules/{game_id}/predictions` → Win probability, projected scores
- `GET /v1/schedules/{game_id}/weather` → Weather forecast (if outdoor)
- `GET /v1/schedules/{game_id}/betting-trends` → Public/sharp money

---

## Implementation Notes

### Caching Strategy
- Game info: 1 hour (changes rarely)
- Betting lines: 5 minutes (changes frequently)
- Team stats: 24 hours (updates daily)
- Weather: 3 hours (changes moderately)

### Progressive Enhancement
1. **First Load:** Show game info + betting lines
2. **Secondary Load:** Load team stats, head-to-head in background
3. **Tertiary Load:** Weather, predictions, expert picks (nice-to-have)

### Mobile Considerations
- Prioritize betting lines and team records
- Collapse head-to-head history into expandable section
- Show key injury reports only (High impact)
- Weather as compact badge, tap for details

---

## User Actions

Scheduled games should allow users to:
1. **Set Reminder** - Notify before game starts
2. **Add to Calendar** - Export to Google/Apple calendar
3. **Share Game** - Social share link
4. **View Betting Analysis** - Link to detailed betting breakdown
5. **Compare Teams** - Side-by-side deep dive
6. **Track Betting Lines** - Alert on line movements

---

## Success Metrics

For scheduled games, track:
- Reminder conversion rate
- Click-through to betting analysis
- Time spent on page (engagement)
- Line movement alert engagement
- Calendar export rate
