# Player Profile - Data Requirements

**Page Type:** NFL Player Profile (Unified: Active, Retired, Historical)
**Update Frequency:** Varies by data type (real-time stats to static biographical)
**User Context:** Researching players, comparing performance, viewing career history, analyzing stats, fantasy football, sports betting

---

## Overview

Player profiles provide **complete career information** with focus on:
- Comprehensive biographical and physical data
- Full career progression (high school → college → draft → NFL → retirement)
- Complete statistics (career totals, season-by-season, game logs, advanced metrics)
- Awards, achievements, and Hall of Fame status
- Career timeline, transactions, and injury history
- Media (photos, videos, highlights)
- Social media and contact information
- Historical rankings and era comparisons

**Design Reference:** See `context/perfect-player-builder.md` for full UI/UX specification

---

## Priority Level: P0 (Must-Have)

### 1. Hero Header & Visual Identity

**Data Fields:**
```json
{
  "player_id": "string (unique identifier)",
  "player_name": "string (full name)",
  "first_name": "string",
  "last_name": "string",
  "nickname": "string (e.g., 'The Gunslinger')",
  "jersey_number": "number",
  "position": "string (QB, RB, WR, etc.)",
  "current_team": {
    "id": "string",
    "name": "string",
    "abbreviation": "string",
    "logo_url": "string"
  },
  "player_status": "active | retired | injured_reserve | practice_squad | free_agent",
  "headshot_url": "string (professional photo)",
  "action_photo_url": "string (optional action shot)",
  "hall_of_fame_status": {
    "inducted": "boolean",
    "year": "number (if inducted)",
    "vote_percentage": "number (if inducted)"
  }
}
```

**Data Sources:**
- `players` table → player_id, name, position
- `rosters` table → current_team, status
- ESPN API → Photos
- Manual/Static → Hall of Fame data (or Pro Football Reference)

**Visual Display:**
- Large professional headshot
- Jersey number prominently displayed
- Current team logo and colors
- Status badge (Active/Retired/HOF)
- Social sharing buttons

---

### 2. Quick Stats Bar (Physical & Bio Basics)

**Data Fields:**
```json
{
  "physical": {
    "height": "string (e.g., '6-4' or inches)",
    "weight": "number (lbs)",
    "age": "number (calculated from birth_date)",
    "birth_date": "ISO 8601 date",
    "birthplace": {
      "city": "string",
      "state": "string",
      "country": "string (default USA)"
    }
  },
  "college": {
    "name": "string",
    "years_attended": "string (e.g., '1985-1988')",
    "position": "string"
  },
  "draft": {
    "year": "number",
    "round": "number",
    "pick": "number",
    "overall_pick": "number",
    "drafted_by_team": {
      "id": "string",
      "name": "string",
      "abbreviation": "string"
    }
  },
  "years_pro": "number (seasons in NFL)",
  "experience": "string (e.g., '12 seasons')"
}
```

**Data Sources:**
- `players` table → height, weight, birth_date, college
- `draft_picks` table (if exists) or sportsref-nfl → draft info
- Calculate age from birth_date

**Visual Display:**
- Horizontal bar with key stats
- Icons for each stat category
- Responsive layout (stacks on mobile)

---

### 3. Biographical Information (Complete)

**Data Fields:**
```json
{
  "biographical": {
    "full_name": "string (legal name)",
    "nickname": "string",
    "birth_date": "ISO 8601 date",
    "age": "number",
    "birthplace": {
      "city": "string",
      "state": "string",
      "country": "string"
    },
    "hometown": {
      "city": "string",
      "state": "string"
    },
    "high_school": {
      "name": "string",
      "city": "string",
      "state": "string",
      "years": "string (e.g., '1982-1984')",
      "position": "string",
      "ranking": {
        "national_rank": "number (e.g., #1 QB)",
        "stars": "number (1-5)",
        "recruiting_service": "string (247Sports, Rivals, etc.)",
        "grade": "number (if applicable)"
      }
    },
    "college": {
      "name": "string",
      "years": "string",
      "position": "string",
      "coach": "string",
      "career_stats": {
        "pass_yards": "number",
        "touchdowns": "number",
        "interceptions": "number",
        "completion_pct": "number"
      },
      "honors": ["string array (e.g., 'All-American 1988')"]
    },
    "draft_info": {
      "year": "number",
      "round": "number",
      "pick": "number",
      "overall_pick": "number",
      "team": "string",
      "combine_stats": {
        "height": "string",
        "weight": "number",
        "forty_yard_dash": "number",
        "bench_press_225": "number",
        "vertical_jump": "number",
        "broad_jump": "string",
        "three_cone_drill": "number",
        "twenty_yard_shuttle": "number"
      },
      "draft_grade": "string (A+, A, B, etc.)",
      "scout_report": "string (brief evaluation)"
    },
    "physical": {
      "height": "string",
      "weight": "number",
      "arm_length": "string (if available)",
      "hand_size": "string (if available)",
      "throws": "left | right",
      "bats": "left | right (baseball background)"
    }
  }
}
```

**Data Sources:**
- `players` table → Basic bio
- sportsref-nfl → Detailed bio, high school, college
- ESPN/247Sports API → High school rankings (if available)
- Draft combine data → ESPN API or sportsref-nfl

**Visual Display:**
- Two-column layout
- Left: Biographical timeline
- Right: Career highlights summary
- Expandable sections for HS/College details

---

### 4. Career Statistics - Passing (if applicable)

**Data Fields:**
```json
{
  "career_passing": {
    "games_played": "number",
    "games_started": "number",
    "attempts": "number",
    "completions": "number",
    "completion_pct": "number",
    "passing_yards": "number",
    "yards_per_attempt": "number",
    "touchdowns": "number",
    "interceptions": "number",
    "td_int_ratio": "number",
    "passer_rating": "number",
    "qbr": "number (ESPN metric, if available)",
    "sacks": "number",
    "sack_yards_lost": "number",
    "longest_pass": "number",
    "yards_per_game": "number",
    "fourth_quarter_comebacks": "number",
    "game_winning_drives": "number"
  }
}
```

**Data Sources:**
- `player_stats` table → Aggregate career totals
- nflreadpy play-by-play → Advanced metrics (EPA, CPOE, Success Rate)
- sportsref-nfl → Career totals verification

**Visual Display:**
- Complete stats table
- Key stats highlighted (300+ yard games, etc.)
- All-time rankings shown for major stats

---

### 5. Career Statistics - Rushing (if applicable)

**Data Fields:**
```json
{
  "career_rushing": {
    "attempts": "number",
    "yards": "number",
    "average": "number",
    "touchdowns": "number",
    "longest_run": "number",
    "fumbles": "number",
    "fumbles_lost": "number",
    "first_downs": "number",
    "yards_per_game": "number",
    "hundred_yard_games": "number",
    "broken_tackles": "number (if available)",
    "yards_after_contact": "number (if available)"
  }
}
```

**Data Sources:**
- `player_stats` table → Career rushing totals
- nflreadpy → Advanced rushing metrics
- Next Gen Stats → Broken tackles, YAC

**Visual Display:**
- Rushing stats table
- Highlight 100+ yard games, 2+ TD games
- Efficiency metrics (YPC, YAC)

---

### 6. Career Statistics - Receiving (if applicable)

**Data Fields:**
```json
{
  "career_receiving": {
    "receptions": "number",
    "targets": "number",
    "catch_rate": "percentage",
    "receiving_yards": "number",
    "yards_per_reception": "number",
    "touchdowns": "number",
    "longest_reception": "number",
    "first_downs": "number",
    "yards_per_game": "number",
    "hundred_yard_games": "number",
    "yards_after_catch": "number",
    "yards_after_catch_per_reception": "number",
    "drops": "number (if available)",
    "contested_catches": "number (if available)"
  }
}
```

**Data Sources:**
- `player_stats` table → Career receiving totals
- nflreadpy → Advanced receiving metrics
- Next Gen Stats → Separation, route running

**Visual Display:**
- Receiving stats table
- Highlight elite performances
- Reception charts (targets vs receptions)

---

### 7. Career Statistics - Defense (if applicable)

**Data Fields:**
```json
{
  "career_defense": {
    "tackles_solo": "number",
    "tackles_assist": "number",
    "tackles_total": "number",
    "sacks": "number",
    "tackles_for_loss": "number",
    "quarterback_hits": "number",
    "interceptions": "number",
    "interception_yards": "number",
    "interception_touchdowns": "number",
    "passes_defended": "number",
    "forced_fumbles": "number",
    "fumble_recoveries": "number",
    "fumble_recovery_touchdowns": "number",
    "safeties": "number"
  }
}
```

**Data Sources:**
- `player_stats` table → Defensive stats (if category exists)
- nflreadpy play-by-play → Defensive plays
- sportsref-nfl → Historical defensive stats

**Visual Display:**
- Defensive stats table
- Sort by position-relevant stats
- Highlight elite performances (2+ sack games, etc.)

---

### 8. Season-by-Season Statistics

**Data Fields:**
```json
{
  "season_by_season": [
    {
      "year": "number",
      "season_type": "REG | POST | PRE",
      "team": {
        "id": "string",
        "abbreviation": "string",
        "name": "string"
      },
      "games_played": "number",
      "games_started": "number",
      "team_record": "string (W-L)",
      "position_specific_stats": {
        /* All stats from sections 4-7, per season */
      },
      "notes": "string (injuries, playoffs, achievements)"
    }
  ]
}
```

**Data Sources:**
- `player_stats` table → Filter by player + season
- `schedules` table → Team records
- Manual flags → Season notes (injuries, rookie year, etc.)

**Visual Display:**
- Sortable, filterable table
- Click year to expand for full season details
- Color-code playoff years, SB wins
- Show team logo for each season

---

### 9. Career Achievements & Awards

**Data Fields:**
```json
{
  "achievements": {
    "championships": [
      {
        "type": "Super Bowl | Conference Championship | Division Title",
        "year": "number",
        "opponent": "string",
        "score": "string",
        "mvp": "boolean",
        "game_stats": {
          /* Position-specific stats from that game */
        }
      }
    ],
    "pro_bowls": [
      {
        "year": "number",
        "starter": "boolean",
        "mvp": "boolean"
      }
    ],
    "all_pro": [
      {
        "year": "number",
        "team": "First Team | Second Team",
        "selection_body": "AP | PFWA | Sporting News"
      }
    ],
    "mvp_voting": [
      {
        "year": "number",
        "votes_received": "number",
        "rank": "number",
        "winner": "string"
      }
    ],
    "hall_of_fame": {
      "inducted": "boolean",
      "year": "number",
      "vote_percentage": "number",
      "class": "string (e.g., 'Class of 2016')"
    },
    "retired_numbers": [
      {
        "team": "string",
        "number": "number",
        "year_retired": "number"
      }
    ],
    "records_held": [
      {
        "record_type": "team | league | career | single_season | single_game",
        "description": "string",
        "value": "number or string",
        "date_set": "ISO 8601 date",
        "still_active": "boolean"
      }
    ],
    "milestones": [
      {
        "milestone": "string (e.g., '300th career TD')",
        "date": "ISO 8601 date",
        "game": "string (opponent)",
        "stat_value": "number"
      }
    ]
  }
}
```

**Data Sources:**
- sportsref-nfl → Awards, Pro Bowls, All-Pro
- Manual/Static → Hall of Fame data
- `player_stats` + logic → Milestones detection
- Team reference data → Retired numbers

**Visual Display:**
- Championship rings visual
- Award badges with years
- Records table with context
- Milestone timeline

---

### 10. Career Timeline & Transactions

**Data Fields:**
```json
{
  "career_timeline": [
    {
      "date": "ISO 8601 date",
      "event_type": "draft | trade | free_agent_signing | retirement | injury | milestone",
      "team": "string",
      "description": "string",
      "transaction_details": {
        "contract_length": "number (years)",
        "contract_value": "number (dollars, if public)",
        "traded_for": "string (players/picks)",
        "injury_type": "string",
        "games_missed": "number"
      }
    }
  ],
  "injury_history": [
    {
      "date": "ISO 8601 date",
      "injury_type": "string",
      "body_part": "string",
      "severity": "minor | major | season_ending | career_ending",
      "games_missed": "number",
      "recovery_time": "string"
    }
  ]
}
```

**Data Sources:**
- `injuries` table → Injury history
- Manual/News sources → Transactions
- sportsref-nfl → Career timeline events

**Visual Display:**
- Chronological timeline
- Visual markers for different event types
- Expandable details for each event

---

## Priority Level: P1 (Important)

### 11. Game Logs (Complete Career)

**Data Fields:**
```json
{
  "game_logs": [
    {
      "game_id": "string",
      "season": "number",
      "week": "number",
      "date": "ISO 8601 date",
      "opponent": {
        "id": "string",
        "name": "string",
        "abbreviation": "string"
      },
      "home_away": "home | away",
      "result": "W | L | T",
      "score": "string (e.g., '31-33')",
      "started": "boolean",
      "position_specific_stats": {
        /* All relevant stats for that game */
      },
      "game_notes": "string (milestone, playoff game, etc.)"
    }
  ]
}
```

**Data Sources:**
- `player_stats` table → Per-game stats
- `schedules` table → Game details, results

**Visual Display:**
- Searchable, filterable, sortable table
- Click game to expand for full box score
- Highlight career-best performances
- Filter by season, opponent, home/away

---

### 12. Statistical Splits

**Data Fields:**
```json
{
  "splits": {
    "home_vs_away": {
      "home": { /* All career stats at home */ },
      "away": { /* All career stats away */ }
    },
    "by_opponent": [
      {
        "opponent": "string",
        "games": "number",
        "record": "string (W-L)",
        "stats": { /* Career stats vs this opponent */ }
      }
    ],
    "situational": {
      "when_leading": { /* Stats when team is ahead */ },
      "when_trailing": { /* Stats when team is behind */ },
      "fourth_quarter": { /* 4th quarter stats */ },
      "overtime": { /* OT stats */ },
      "playoff": { /* Playoff stats */ }
    },
    "by_month": [
      {
        "month": "September | October | November | December | January | February",
        "games": "number",
        "stats": { /* Monthly stats */ }
      }
    ],
    "by_weather": {
      "indoor": { /* Dome/indoor stats */ },
      "outdoor_clear": { /* Outdoor clear stats */ },
      "outdoor_rain": { /* Rain stats */ },
      "outdoor_snow": { /* Snow stats */ },
      "cold_weather": { /* < 40°F stats */ }
    }
  }
}
```

**Data Sources:**
- `player_stats` + `schedules` → Join for splits
- Calculate from game logs with filters

**Visual Display:**
- Comparison tables
- Visual charts for splits
- Highlight significant differences

---

### 13. Advanced Analytics & Metrics

**Data Fields:**
```json
{
  "advanced_metrics": {
    "epa": {
      "total_epa": "number",
      "epa_per_play": "number",
      "passing_epa": "number",
      "rushing_epa": "number",
      "all_time_rank": "number"
    },
    "cpoe": {
      "career_cpoe": "number (percentage)",
      "all_time_rank": "number"
    },
    "success_rate": {
      "overall": "percentage",
      "passing": "percentage",
      "rushing": "percentage"
    },
    "pressure_stats": {
      "pressure_rate": "percentage",
      "sack_rate_under_pressure": "percentage",
      "completion_pct_under_pressure": "percentage"
    },
    "decision_making": {
      "turnover_worthy_play_pct": "percentage",
      "big_time_throw_pct": "percentage"
    },
    "next_gen_stats": {
      "average_separation": "number (yards, for WR)",
      "catch_percentage": "number",
      "expected_completion_percentage": "number",
      "completion_percentage_above_expectation": "number"
    }
  }
}
```

**Data Sources:**
- nflreadpy play-by-play → EPA, CPOE, Success Rate, WP
- Next Gen Stats API → NGS metrics
- PFF (if available) → Grading data

**Visual Display:**
- Metrics dashboard
- Comparison to league average
- Positional rankings
- Advanced charts and visualizations

---

### 14. Peer Comparisons & Rankings

**Data Fields:**
```json
{
  "comparisons": {
    "era_rankings": {
      "era_definition": "string (e.g., '1990s Quarterbacks')",
      "peers": [
        {
          "player_name": "string",
          "key_stats": { /* Major stats for comparison */ },
          "championships": "number",
          "hof_status": "boolean"
        }
      ],
      "player_rank_in_era": "number"
    },
    "all_time_rankings": {
      "position": "string",
      "rankings": [
        {
          "stat_category": "string (e.g., 'Passing Yards')",
          "rank": "number",
          "value": "number",
          "leader": "string (all-time leader)"
        }
      ]
    },
    "similar_players": [
      {
        "player_name": "string",
        "similarity_score": "number (0-100)",
        "reasons": ["string array (why similar)"]
      }
    ],
    "teammates": [
      {
        "player_id": "string",
        "player_name": "string",
        "position": "string",
        "years_together": "string (e.g., '1990-1995')"
      }
    ]
  }
}
```

**Data Sources:**
- sportsref-nfl → All-time rankings
- `player_stats` → Filter by era for comparisons
- Logic algorithm → Similar players calculation
- `rosters` table → Teammates

**Visual Display:**
- Era comparison table
- All-time rankings badges
- Similar players cards
- Teammate connections

---

### 15. Social Media & Contact Information

**Data Fields:**
```json
{
  "social_contact": {
    "social_media": {
      "twitter": "string (handle)",
      "instagram": "string (handle)",
      "facebook": "string (page URL)",
      "tiktok": "string (handle)",
      "youtube": "string (channel)"
    },
    "contact": {
      "agent": "string (name)",
      "agency": "string",
      "official_website": "string (URL)",
      "contact_email": "string (public only)"
    },
    "broadcasting": {
      "network": "string (if broadcaster)",
      "role": "string (analyst, color commentator, etc.)"
    }
  }
}
```

**Data Sources:**
- Manual/Curated → Social media handles
- Public sources → Agent info

**Visual Display:**
- Social follow buttons
- Contact info sidebar
- Broadcasting role badge

---

## Priority Level: P2 (Nice-to-Have)

### 16. Media Gallery

**Data Fields:**
```json
{
  "media": {
    "photos": [
      {
        "photo_id": "string",
        "url": "string",
        "thumbnail_url": "string",
        "caption": "string",
        "date": "ISO 8601 date",
        "category": "game_action | headshot | awards | personal | career_milestone"
      }
    ],
    "videos": [
      {
        "video_id": "string",
        "title": "string",
        "description": "string",
        "thumbnail_url": "string",
        "video_url": "string (embed or direct)",
        "duration": "number (seconds)",
        "date": "ISO 8601 date",
        "category": "highlights | interviews | career_reel | touchdown | big_play"
      }
    ]
  }
}
```

**Data Sources:**
- ESPN API → Video highlights
- Manual curation → Photo gallery
- YouTube API → Curated playlists

**Visual Display:**
- Photo grid with lightbox
- Video thumbnails with play button
- Filterable by category
- Lazy loading for performance

---

### 17. Game Information Contextual Data

**Data Fields:**
```json
{
  "game_context": {
    "weather_performance": {
      "indoor_stats": { /* All stats in dome */ },
      "outdoor_stats": { /* All stats outdoors */ },
      "cold_weather_stats": { /* < 40°F stats */ },
      "precipitation_stats": { /* Rain/snow stats */ }
    },
    "primetime_performance": {
      "sunday_night": { /* SNF stats */ },
      "monday_night": { /* MNF stats */ },
      "thursday_night": { /* TNF stats */ },
      "playoff": { /* Playoff stats */ }
    },
    "vs_winning_teams": {
      "record": "string (W-L)",
      "stats": { /* Stats vs teams > .500 */ }
    },
    "division_games": {
      "record": "string (W-L)",
      "stats": { /* Stats vs division rivals */ }
    }
  }
}
```

**Data Sources:**
- `schedules` + `player_stats` → Join and filter
- Calculate from game logs

**Visual Display:**
- Contextual performance cards
- Split comparison charts
- Highlight clutch performances

---

### 18. Fantasy Football Data (Optional)

**Data Fields:**
```json
{
  "fantasy": {
    "career_fantasy_points": {
      "ppr": "number",
      "half_ppr": "number",
      "standard": "number"
    },
    "season_fantasy_points": [
      {
        "season": "number",
        "ppr": "number",
        "half_ppr": "number",
        "standard": "number",
        "rank_at_position": "number"
      }
    ],
    "consistency": {
      "games_over_20_points": "number",
      "games_over_10_points": "number",
      "boom_weeks": "number (top 5 at position)",
      "bust_weeks": "number (outside top 30)"
    }
  }
}
```

**Data Sources:**
- Calculate from `player_stats` using scoring rules
- Fantasy football APIs (if available)

**Visual Display:**
- Fantasy point charts
- Weekly consistency graph
- Position ranking badges

---

## Data Update Frequency

| Data Element | Update Frequency |
|--------------|------------------|
| Biographical Info | Static (update on corrections) |
| Current Team/Status | Daily during season, weekly offseason |
| Career Stats | After each game (active players) |
| Season Stats | After each game (active players) |
| Game Logs | After each game (active players) |
| Achievements | Weekly (check for milestones) |
| Awards | Annually (after award ceremonies) |
| Transactions | Real-time (when announced) |
| Injuries | Daily |
| Rankings | Weekly |
| Advanced Analytics | After each game |
| Media (Photos/Videos) | As available |
| Social Media | Manual updates |

---

## API Endpoints Needed

### Existing
- `GET /v1/players/{player_id}` → Player biographical data
- `GET /v1/players/{player_id}/stats` → Career and season stats
- `GET /v1/players/{player_id}/game-logs?season={year}` → Game-by-game stats
- `GET /v1/rosters?player={player_id}` → Team history

### New/Enhanced
- `GET /v1/players/{player_id}/achievements` → Awards, Pro Bowls, championships
- `GET /v1/players/{player_id}/timeline` → Career events, transactions, injuries
- `GET /v1/players/{player_id}/splits` → Home/away, situational stats
- `GET /v1/players/{player_id}/advanced-stats` → EPA, CPOE, NGS metrics
- `GET /v1/players/{player_id}/comparisons` → Peer rankings, similar players
- `GET /v1/players/{player_id}/media` → Photos, videos, highlights

---

## Caching Strategy

### Long TTL (Active Players)
- Biographical info: 24 hours (rarely changes)
- Career stats: 1 hour (updates after games)
- Season stats: 1 hour (updates after games)
- Game logs: 1 hour (updates after games)
- Advanced analytics: 1 hour

### Very Long TTL (Retired Players)
- Biographical info: 1 week (static)
- Career stats: 1 week (never changes)
- Season stats: 1 week (never changes)
- Game logs: 1 week (never changes)
- Achievements: 1 day (Hall of Fame updates)

### Short TTL
- Current team/status: 15 minutes (during trade deadline)
- Injuries: 15 minutes (during season)
- Transactions: 5 minutes (during signing period)

### On-Demand
- Media gallery: Load when tab clicked
- Complete play-by-play: Load when requested
- Historical comparisons: Load when expanded

---

## Progressive Enhancement

### Initial Load (< 1 second)
1. Hero header with photo
2. Quick stats bar
3. Current team and status
4. Key career stats summary

### Secondary Load (1-2 seconds)
5. Complete biographical information
6. Career statistics (all categories)
7. Recent season performance
8. Achievements overview

### Tertiary Load (2-3 seconds)
9. Season-by-season breakdown
10. Career timeline
11. Rankings and comparisons
12. Advanced analytics

### On-Demand Load
13. Complete game logs (load when tab clicked)
14. Statistical splits (load when expanded)
15. Media gallery (load when section viewed)
16. Historical comparisons (load when requested)

---

## Mobile Considerations

### Priority on Small Screens
- **Above fold:** Headshot, name, position, team, key stats
- **Tabs:** Overview | Stats | Game Logs | Achievements | Media
- **Collapsed sections:** Bio details, timeline, advanced stats
- **On-demand:** Complete game logs, media gallery

### Data Usage Optimization
- Lazy load all images
- Compress headshots and action photos
- Don't load media gallery until requested
- Paginate game logs (show 10 at a time)

---

## Conditional Fields (Active vs Retired)

### Active Players Only
- Current week game preview
- Season-to-date stats (current season)
- Injury status
- Depth chart position
- Fantasy projections (current week)
- Contract details (years remaining)

### Retired Players Only
- Hall of Fame voting history
- Post-career career (broadcasting, coaching)
- Retired number ceremonies
- Legacy analysis
- Historical rankings comparisons

### Both
- Career statistics
- Biographical information
- Awards and achievements
- Career timeline
- Media gallery

---

## User Actions

Player profiles should allow users to:
1. **Compare to Other Players** - Side-by-side stat comparison
2. **View All Games vs Opponent** - Filter game logs by team
3. **Export Stats** - Download as PDF or CSV
4. **Share Profile** - Social media share card
5. **Add to Favorites** - Save for quick access
6. **Follow Player** - Get notifications for news/stats
7. **View Highlights** - Inline video player
8. **Compare Seasons** - Side-by-side season comparison
9. **Fantasy Analysis** - View fantasy performance
10. **Draft Analysis** - Compare to draft class peers

---

## Success Metrics

For player profiles, track:
- Time spent on page
- Most viewed sections (stats, bio, media)
- Game log engagement
- Video views
- Comparison tool usage
- Export/share actions
- Follow/favorite actions
- Returning visitors (for favorite players)

---

## Implementation Notes

### Data Enrichment
- Auto-detect milestones from career stats
- Calculate all-time rankings on-the-fly
- Generate peer comparisons algorithmically
- Enrich with Hall of Fame data for retired players

### Narrative Generation
- Auto-generate career summary text
- Highlight signature moments
- Include context for achievements

### Search & Discovery
- Index by name, team, position, college
- Allow filtering (active/retired, position, team, era)
- Surface "trending" players based on recent performance
- Suggest similar players for comparison

---

## Accessibility Requirements

- Screen reader friendly stats tables
- Alt text for all photos
- Keyboard navigation for tabs
- ARIA labels for interactive elements
- High contrast mode support
- Responsive text sizing
- Skip to content links

---

**Reference:** Full UI/UX design specification available in `context/perfect-player-builder.md`
