# Live Game Data Requirements

**Game Category:** Live / In-Progress Games
**Purpose:** Real-time game tracking with play-by-play updates, live stats, and dynamic betting lines
**Update Frequency:** Real-time (every play, 5-15 second intervals)
**User Priority:** High - users expect instant updates during live action

---

## P0: Must-Have (Core Live Experience)

### 1. Game Header - Live Edition
**Priority:** P0
**Update Frequency:** Real-time (every play)
**Why Critical:** Users need to know game status, time remaining, and possession at a glance

**Data Fields:**
- Game ID
- Home Team vs Away Team (names, logos, colors)
- Current Score (home/away)
- Game Status: "Live" badge/indicator
- Quarter/Period (1st, 2nd, 3rd, 4th, OT)
- Time Remaining (MM:SS format)
- Down & Distance (e.g., "2nd & 7")
- Field Position (e.g., "SF 35")
- Possession Indicator (which team has the ball)
- Red Zone Indicator (if applicable)

**JSON Schema:**
```json
{
  "game_id": "string",
  "home_team": {
    "id": "string",
    "name": "string",
    "abbreviation": "string",
    "logo_url": "string",
    "primary_color": "string"
  },
  "away_team": { /* same structure as home_team */ },
  "current_score": {
    "home": "number",
    "away": "number"
  },
  "game_status": "Live",
  "quarter": "number (1-4) or 'OT'",
  "time_remaining": "string (MM:SS)",
  "possession": {
    "team_id": "string",
    "down": "number (1-4)",
    "distance": "number",
    "yardline": "number",
    "field_side": "string (home/away team abbreviation)",
    "in_red_zone": "boolean"
  },
  "last_updated": "timestamp (ISO 8601)"
}
```

**Data Source:** ESPN API (live endpoints), nflreadpy (play-by-play real-time)

---

### 2. Score Breakdown - Live Updating
**Priority:** P0
**Update Frequency:** After each score (instant)
**Why Critical:** Users need to see how the score evolved quarter by quarter

**Data Fields:**
- Team Name
- Q1 Score
- Q2 Score
- Q3 Score
- Q4 Score
- OT Score (if applicable)
- Total Score

**JSON Schema:**
```json
{
  "score_breakdown": {
    "home": {
      "team_id": "string",
      "q1": "number",
      "q2": "number",
      "q3": "number",
      "q4": "number",
      "ot": "number or null",
      "total": "number"
    },
    "away": { /* same structure as home */ }
  },
  "last_score_update": "timestamp (ISO 8601)"
}
```

**Data Source:** ESPN API, nflreadpy (pbp data aggregation)

---

### 3. Live Drive Tracker
**Priority:** P0
**Update Frequency:** Real-time (every play in current drive)
**Why Critical:** Shows momentum and field position battle in real-time

**Data Fields:**
- Current Drive Number
- Possessing Team
- Drive Start Position
- Current Position
- Plays in Drive
- Yards Gained
- Time of Possession (for this drive)
- Drive Result (ongoing, touchdown, field goal, punt, turnover, etc.)

**JSON Schema:**
```json
{
  "current_drive": {
    "drive_number": "number",
    "team_id": "string",
    "start_position": {
      "yardline": "number",
      "field_side": "string"
    },
    "current_position": {
      "yardline": "number",
      "field_side": "string"
    },
    "plays": "number",
    "yards": "number",
    "time_of_possession": "string (MM:SS)",
    "result": "string (Ongoing/TD/FG/Punt/Turnover/Downs)",
    "is_scoring_drive": "boolean"
  },
  "last_updated": "timestamp (ISO 8601)"
}
```

**Data Source:** ESPN API (live drive data), nflreadpy (play aggregation)

---

### 4. Last Play Summary
**Priority:** P0
**Update Frequency:** Real-time (every play, 5-15 seconds)
**Why Critical:** Shows what just happened without scrolling through full play-by-play

**Data Fields:**
- Play Description (e.g., "Patrick Mahomes pass deep right to Travis Kelce for 23 yards")
- Yards Gained/Lost
- Down & Distance Before
- Result (First Down, Touchdown, Incomplete, Turnover, etc.)
- Key Players Involved
- Clock Time When Play Occurred

**JSON Schema:**
```json
{
  "last_play": {
    "play_id": "string",
    "description": "string",
    "yards": "number (can be negative)",
    "down": "number",
    "distance": "number",
    "result": "string (First Down/TD/Incomplete/INT/Fumble/etc)",
    "players": [
      {
        "player_id": "string",
        "name": "string",
        "role": "string (Passer/Rusher/Receiver/Tackler/etc)"
      }
    ],
    "clock": "string (MM:SS)",
    "quarter": "number",
    "timestamp": "timestamp (ISO 8601)"
  }
}
```

**Data Source:** ESPN API, nflreadpy (real-time pbp)

---

## P1: Important (Enhanced Live Experience)

### 5. Play-by-Play Feed (Last 10-20 Plays)
**Priority:** P1
**Update Frequency:** Real-time (prepend new plays)
**Why Important:** Users want recent context without overwhelming data

**Data Fields:**
- Play Number (in game)
- Quarter
- Time
- Down & Distance
- Field Position
- Play Description
- Yards Gained
- Result Icon (First Down, TD, Turnover, etc.)

**JSON Schema:**
```json
{
  "recent_plays": [
    {
      "play_number": "number",
      "quarter": "number",
      "clock": "string (MM:SS)",
      "down": "number",
      "distance": "number",
      "yardline": "number",
      "field_side": "string",
      "description": "string",
      "yards": "number",
      "result_type": "string (first_down/td/incomplete/int/fumble/punt/fg/etc)",
      "timestamp": "timestamp (ISO 8601)"
    }
  ],
  "total_plays": "number",
  "last_updated": "timestamp (ISO 8601)"
}
```

**Data Source:** ESPN API, nflreadpy (pbp)

---

### 6. Live Box Score - Key Stats Only
**Priority:** P1
**Update Frequency:** After each play or every 30-60 seconds
**Why Important:** Shows statistical momentum without overwhelming users

**Key Stats to Track Live:**

**Passing:**
- Completions / Attempts
- Yards
- TDs
- INTs
- Rating (live calculated)

**Rushing:**
- Attempts
- Yards
- TDs
- Long

**Receiving:**
- Receptions
- Yards
- TDs
- Long

**JSON Schema:**
```json
{
  "live_box_score": {
    "passing": [
      {
        "player_id": "string",
        "name": "string",
        "team_id": "string",
        "completions": "number",
        "attempts": "number",
        "yards": "number",
        "touchdowns": "number",
        "interceptions": "number",
        "rating": "number (calculated live)"
      }
    ],
    "rushing": [ /* similar structure */ ],
    "receiving": [ /* similar structure */ ]
  },
  "last_updated": "timestamp (ISO 8601)"
}
```

**Data Source:** ESPN API (live stats), nflreadpy (aggregated pbp)

---

### 7. Live Team Stats Comparison
**Priority:** P1
**Update Frequency:** Every 30-60 seconds or after significant plays
**Why Important:** Shows which team is dominating statistically

**Data Fields:**
- Total Yards (Offense)
- Passing Yards
- Rushing Yards
- First Downs
- Third Down Efficiency (X/Y, percentage)
- Fourth Down Efficiency
- Turnovers
- Time of Possession
- Penalties (Number / Yards)

**JSON Schema:**
```json
{
  "live_team_stats": {
    "home": {
      "total_yards": "number",
      "passing_yards": "number",
      "rushing_yards": "number",
      "first_downs": "number",
      "third_down_conversions": "number",
      "third_down_attempts": "number",
      "third_down_percentage": "number",
      "fourth_down_conversions": "number",
      "fourth_down_attempts": "number",
      "turnovers": "number",
      "time_of_possession": "string (MM:SS)",
      "penalties": "number",
      "penalty_yards": "number"
    },
    "away": { /* same structure as home */ }
  },
  "last_updated": "timestamp (ISO 8601)"
}
```

**Data Source:** ESPN API, nflreadpy (calculated from pbp)

---

### 8. Live Betting Lines (Real-Time Updates)
**Priority:** P1
**Update Frequency:** Every 15-30 seconds during live game
**Why Important:** Betting users want to see line movement during the game

**Data Fields:**
- Live Spread (adjusted based on current score)
- Live Total (over/under adjustment)
- Live Moneyline (if available)
- Timestamp of Last Update

**JSON Schema:**
```json
{
  "live_betting": {
    "spread": {
      "line": "number",
      "home_odds": "number",
      "away_odds": "number",
      "movement": "string (up/down/unchanged)"
    },
    "total": {
      "line": "number",
      "over_odds": "number",
      "under_odds": "number",
      "movement": "string"
    },
    "moneyline": {
      "home": "number",
      "away": "number"
    },
    "last_updated": "timestamp (ISO 8601)"
  }
}
```

**Data Source:** The Odds API (live endpoint)

---

## P2: Nice-to-Have (Premium Live Features)

### 9. Live Highlights / Recent Key Plays
**Priority:** P2
**Update Frequency:** After significant plays (TDs, turnovers, big gains)
**Why Nice-to-Have:** Enhances engagement but not critical for core experience

**Data Fields:**
- Highlight ID
- Play Description
- Video Thumbnail URL
- Video Clip URL (if available)
- Impact Level (Game-Changing, Big Play, Notable)
- Timestamp

**JSON Schema:**
```json
{
  "live_highlights": [
    {
      "highlight_id": "string",
      "description": "string",
      "thumbnail_url": "string or null",
      "video_url": "string or null",
      "impact_level": "string (game_changing/big_play/notable)",
      "timestamp": "timestamp (ISO 8601)"
    }
  ]
}
```

**Data Source:** ESPN API (highlights endpoint), YouTube API (potential)

---

### 10. Live Win Probability Chart
**Priority:** P2
**Update Frequency:** After each play
**Why Nice-to-Have:** Advanced analytics users love this, but casual users may ignore

**Data Fields:**
- Play-by-play win probability values (0-100% for home team)
- Chart data points (x: play number, y: win probability)
- Current win probability

**JSON Schema:**
```json
{
  "win_probability": {
    "current": {
      "home_win_prob": "number (0-100)",
      "away_win_prob": "number (0-100)"
    },
    "chart_data": [
      {
        "play_number": "number",
        "quarter": "number",
        "clock": "string (MM:SS)",
        "home_win_prob": "number (0-100)"
      }
    ],
    "last_updated": "timestamp (ISO 8601)"
  }
}
```

**Data Source:** nflreadpy (wp column in pbp data), ESPN API (if available)

---

### 11. Live EPA (Expected Points Added)
**Priority:** P2
**Update Frequency:** After each play
**Why Nice-to-Have:** Advanced metric for analytics enthusiasts

**Data Fields:**
- Cumulative EPA (Home vs Away)
- EPA for Last Play
- EPA Chart Data

**JSON Schema:**
```json
{
  "epa_live": {
    "cumulative": {
      "home_epa": "number",
      "away_epa": "number"
    },
    "last_play_epa": "number",
    "chart_data": [
      {
        "play_number": "number",
        "home_cumulative_epa": "number"
      }
    ],
    "last_updated": "timestamp (ISO 8601)"
  }
}
```

**Data Source:** nflreadpy (epa column in pbp data)

---

## API Endpoints Needed

### ESPN API (Primary Live Source)
- `GET /sports/football/nfl/scoreboard` - Live scores and game status
- `GET /sports/football/nfl/summary?event={game_id}` - Live game details
- `GET /sports/football/nfl/playbyplay?event={game_id}` - Real-time plays
- `GET /sports/football/nfl/boxscore?event={game_id}` - Live stats

### The Odds API (Live Betting Lines)
- `GET /v4/sports/americanfootball_nfl/odds?markets=spreads,totals&bookmakers=draftkings`

### nflreadpy (Real-Time PBP Ingestion)
- Load latest play-by-play data for in-progress games
- Filter to current game_id
- Parse live columns: desc, yards_gained, down, ydstogo, yardline_100, drive, wp, epa

---

## Implementation Notes

### WebSocket vs Polling Strategy
**Recommendation:** Hybrid approach
- **WebSocket:** For real-time play-by-play updates (ESPN may offer WebSocket endpoints)
- **Polling:** For live stats, betting lines (every 15-30 seconds)

**Polling Intervals:**
- Game Header / Score: Every 10-15 seconds
- Play-by-Play Feed: Every 5-10 seconds (or WebSocket)
- Box Score Stats: Every 30 seconds
- Team Stats: Every 30-60 seconds
- Betting Lines: Every 15-30 seconds

### Caching Strategy (Redis)
- Cache live game state with 10-second TTL
- Cache box score stats with 30-second TTL
- Cache team stats with 60-second TTL
- Invalidate cache on new play detection

### Mobile Optimization
- Minimize payload size (send only changed data)
- Use delta updates where possible (only send new plays, not full list)
- Compress JSON responses
- Consider server-sent events (SSE) for lightweight streaming

### User Actions During Live Game
1. **Auto-refresh toggle:** Allow users to pause auto-updates
2. **Notification preferences:** Alert on scores, turnovers, big plays
3. **Minimize mode:** Compact view showing only score and possession

---

## Success Metrics

1. **Update Latency:** < 15 seconds from actual play to UI update
2. **Data Accuracy:** 99.9% accuracy on scores, stats, play descriptions
3. **Uptime:** 99.5% availability during live games
4. **User Engagement:** Average session time > 20 minutes during live games
5. **Error Rate:** < 0.1% failed updates or missing plays

---

## Current Data Coverage for Live Games

**Available Now:**
-  Game ID, teams, scores (nflreadpy, ESPN API)
-  Play-by-play descriptions (nflreadpy pbp)
-  Down, distance, yardline (nflreadpy)
-  Win probability, EPA (nflreadpy)
-  Player stats (partial - can aggregate from pbp)

**Needs Integration:**
-   Real-time ESPN API for live games (not yet integrated)
-   WebSocket or polling mechanism (not implemented)
-   Live betting lines (The Odds API integration exists but not real-time)
-   Quarter-by-quarter scores (needs ESPN API or pbp aggregation logic)
-   Live highlights/videos (ESPN API or YouTube integration needed)

**Recommendation:**
Integrate ESPN live endpoints with 10-15 second polling for P0 data, 30-60 second polling for P1 data. Consider WebSocket upgrade for high-traffic games.
