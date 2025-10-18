# Team Pages Design Specification

**Date**: October 16, 2025
**Purpose**: Best practices for displaying team information pages (roster, schedule, stats)
**Status**: Analysis Complete - Ready for Implementation
**Research**: Pro Football Reference, Fox Sports, Baseball Reference analyzed

---

## Executive Summary

Research into how Pro Football Reference, Fox Sports, and Baseball Reference display team pages reveals proven patterns for organizing team information, rosters, schedules, and statistics.

**Key Insight**: Team pages must serve multiple audiences:
1. **Casual fans**: Quick overview, current score/record, star players
2. **Fantasy players**: Full roster, injury status, upcoming schedule
3. **Researchers**: Historical records, season stats, all-time performance

Effective team pages allow all three to find what they need quickly.

---

## Team Page Hierarchy

### Level 1: Team Overview Card (List Context)
**Use When**: Team appears in standings, search results, or league view
**Size**: ~150-200px width
**Information**:
- Team logo
- Team name + record (W-L)
- Current win streak
- One key stat (points for/against or ranking)

**Example**:
```
┌────────────────────┐
│   [Logo]           │
│  Dallas Cowboys    │
│   6-2 (W4)         │
│   Rank: 2 (NFC)    │
│   Avg: 28.1 PPG    │
└────────────────────┘
```

### Level 2: Team Page (Full Context)
**Use When**: User clicks on team to see complete information
**Size**: Full width (desktop responsive)
**Key Sections**:
1. Header (logo, name, record, standings, upcoming game)
2. Roster overview (quick scan of key players)
3. Current season stats (team-level statistics)
4. Schedule & Results (this week, remaining games)
5. Standings (division, conference)
6. Recent news/transactions
7. Historical information (franchise records, all-time leaders)

---

## What Research Revealed

### Pro Football Reference Team Pages

**Team Directory Organization**:
- All 32 franchises listed
- Historical records (from founding to present)
- Win-loss percentage
- Approximate Value (AV) metric
- Quick links to notable players
- Top coaches
- Playoff statistics

**Team Page Sections** (from structure analysis):
- Franchise history (records across all eras)
- Current season standings
- Roster with links to player pages
- Schedule and results
- Team statistics (offensive, defensive, special teams)
- Season stats by position
- Notable achievements (MVPs, Pro Bowlers, championships)

**Navigation**:
- Season selector (dropdown: 1920-present)
- Week selector (for current season)
- Sub-pages: Roster, Schedule, Stats, Playoffs, Transactions

### Fox Sports Team Organization

**Navigation Structure**:
- Featured content
- Scores
- Schedule
- Standings (division, conference, league)
- Stats (team and player)
- Odds/Betting
- Videos
- News
- Player News
- Injuries
- All Teams

**Content Organization**:
- Modular components
- Responsive grid layout
- Multiple content types (news, video, standings)
- Real-time updates
- Player news/alerts

### Baseball Reference Team Pages

**Franchise Overview**:
- All-time franchise records
- Notable players by position (all-time leaders)
- Coaching records
- Hall of Famers
- Year-by-year summary

**Season-Specific Pages**:
- Standings
- Roster
- Schedule & Results
- Team Statistics
- Player Performance
- Transactions

---

## Best Practices for NFL Team Pages

### ✅ Team Page Header

**Essential Elements**:
- Team logo (large)
- Team name + city
- Current record (W-L)
- Standings position (1st NFC East, etc.)
- Playoff probability (if available)
- Next opponent + date/time

**Optional but Valuable**:
- Head coach name
- Stadium name + city
- Founded year
- Championships won
- Recent streak indicator (W/L)

**Example Header**:
```
┌─────────────────────────────────────────┐
│ [Logo]  DALLAS COWBOYS                  │
│         6-2 | 1st NFC East | 78% Playoff│
│                                         │
│  vs Philadelphia Eagles  SUN 3:00 PM ET │
└─────────────────────────────────────────┘
```

### ✅ Tab Navigation

**Primary Tabs** (visible always):
1. **Overview** - Team summary, key stats
2. **Roster** - Full roster with positions, numbers
3. **Schedule** - Games played and remaining
4. **Stats** - Team-level statistics
5. **News** - Recent articles, transactions

**Secondary Tabs** (expandable or dropdown):
- Standings
- Transactions
- Injuries
- History
- Awards

### ✅ Roster Organization

**Table Format**:
- Jersey number
- Player name (clickable)
- Position
- Height/Weight
- College
- Current stats (position-specific)
- Injury status (if applicable)
- Pro Bowl/All-Pro indicator

**Filtering/Sorting**:
- Sort by position
- Sort by jersey number
- Sort by stats
- Filter by position (show only QBs, etc.)
- Filter by injury status

**Example Roster Table**:
```
NO | NAME           | POS | HT   | WT  | COL     | PASS YDS  | INJURY
────────────────────────────────────────────────────────────────────────
 9 | Troy Aikman    | QB  | 6'4" | 220 | UCLA    | 3,518     | —
14 | Andy Dalton    | QB  | 6'2" | 220 | SMU     | 485       | —
 1 | Roger Staubach| QB  | 6'3" | 202 | Navy    | [Hall]    | —
22 | Emmitt Smith   | RB  | 5'9" | 209 | Florida | 1,563 RUS | —
24 | George Newbern| RB  | 6'1" | 205 | N. Caro | 203 REC   | —
```

### ✅ Schedule Display

**Format Options**:

**Compact View** (This Week Focus):
```
SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAST GAMES (6-2)
☑ W vs NYG 28-23 (Oct 5)
☑ W @ PHI 21-14 (Sep 28)
☑ L vs WAS 31-23 (Sep 21)

THIS WEEK (W7)
⏱ vs PHI SUN 3:00 PM @ AT&T

UPCOMING (6 remaining)
→ @ BAL
→ vs STL
→ @ CHI
```

**Full Schedule View** (All games):
```
WEEK | DATE     | OPPONENT      | TIME        | RESULT   | RECORD
─────────────────────────────────────────────────────────────────────
 1   | Sep 5    | @ Kansas City | 8:15 PM EST | L 21-28  | 0-1
 2   | Sep 12   | vs Washington | 1:00 PM EST | W 28-23  | 1-1
 3   | Sep 19   | @ Denver      | 4:15 PM EST | W 34-24  | 2-1
 4   | Sep 26   | @ Philadelphia| 1:00 PM EST | W 21-14  | 3-1
 5   | Oct 3    | vs New York   | 1:00 PM EST | W 28-23  | 4-1
 6   | Oct 10   | Bye Week      | —           | —        | 4-1
 7   | Oct 19   | @ Philadelphia| 3:00 PM EST | ⏱ TBD    | TBD
```

### ✅ Team Statistics

**Offensive Stats Section**:
- Points per game (rank)
- Yards per game (rank)
- Passing yards per game (rank)
- Rushing yards per game (rank)
- Touchdowns (rank)
- Turnover differential (rank)

**Defensive Stats Section**:
- Points allowed per game (rank)
- Yards allowed per game (rank)
- Passing yards allowed (rank)
- Rushing yards allowed (rank)
- Sacks (rank)
- Interceptions (rank)

**Special Teams**:
- Kicking percentage
- Punting average
- Returns stats

**Table Format**:
```
STATISTICS SUMMARY (6 games played)
────────────────────────────────────────
OFFENSIVE STATS        | VALUE    | RANK
Points Per Game        | 28.5     | 5
Passing Yards/Game     | 285.2    | 8
Rushing Yards/Game     | 142.1    | 3
Turnovers/Game         | 1.2      | 28

DEFENSIVE STATS        | VALUE    | RANK
Points Allowed/Game    | 21.3     | 2
Passing Yards Allowed  | 210.5    | 4
Rushing Yards Allowed  | 115.2    | 9
Sacks                  | 18       | 12
```

### ✅ Standings Context

**Display Options**:

**Division Standings**:
```
NFC EAST STANDINGS
─────────────────────────────────────
 1. Dallas Cowboys      6-2  .750
 2. Philadelphia Eagles 5-3  .625  3.0 GB
 3. Washington Cmnd.    4-3  .571  2.5 GB
 4. New York Giants     3-5  .375  4.0 GB
```

**Conference Standings**:
```
NFC STANDINGS (Playoff Race)
─────────────────────────────────────
         W  L  PCT  GB   STRENGTH
1. LAR   8  1  .889  —   1st overall
2. GB    7  2  .778  1.0  3rd overall
3. DAL   6  2  .750  2.0  5th overall
...
```

### ✅ Key Players Highlight

**Quick Look Section**:
- Top QB this season
- Top RB this season
- Top WR this season
- Top defensive player
- Emerging rookie

**Format**:
```
KEY PLAYERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏈 #9 Troy Aikman (QB)
   3,518 Pass YDS | 23 TD | 12 INT
   Rank: 5th all-time seasons

🏈 #22 Emmitt Smith (RB)
   1,563 Rush YDS | 12 TD
   Only 512 YDS to 2,000 season

🏈 #88 Michael Irvin (WR)
   68 REC | 1,021 REC YDS | 8 TD
   On pace for career high

🛡️  #54 Charles Haley (DE)
   8.5 Sacks | 2nd on team
```

### ✅ Responsive Design

**Mobile (<768px)**:
- Header stacks vertically
- Tabs scroll horizontally
- Tables: Show key columns only, scroll for details
- Roster: Card view instead of table
- Schedule: Week-by-week, not all games

**Tablet (768-1200px)**:
- Sidebar for navigation
- Two-column layout
- Tables scroll horizontally if needed
- Key stats visible, detailed stats expandable

**Desktop (1200px+)**:
- Full layout with all sections
- All columns visible in tables
- Side panel for quick stats
- Rich formatting and spacing

### ✅ Historical Context

**Franchise Overview Section** (for team page):
- All-time record (franchise history)
- Championships won (years)
- Super Bowl appearances
- All-time leading passer
- All-time leading rusher
- All-time leading receiver
- Notable eras/dynasties

---

## Sample Team Page Layout

### Navigation Structure
```
TEAM: Dallas Cowboys
├── Overview (summary, key stats)
├── Roster (full roster table)
├── Schedule (all games)
├── Stats (team statistics)
├── News (articles, transactions)
├── Standings (division, conference)
└── History (franchise records, all-time leaders)
```

### Overview Tab
```
┌─────────────────────────────────────────────────────┐
│ [Logo]  DALLAS COWBOYS                              │
│ 6-2 | 1st NFC East | 78% Playoff Probability       │
├─────────────────────────────────────────────────────┤
│ NEXT GAME                                           │
│ vs Philadelphia Eagles  SUN 3:00 PM                │
│ AT&T Stadium, Arlington, TX                        │
├─────────────────────────────────────────────────────┤
│ QUICK STATS              | DEFENSIVE STATS         │
│ PPG: 28.5 (5th)          | PPG Allowed: 21.3 (2nd)│
│ Yards/Game: 427.3        | Yards Allowed: 325.7   │
│ Pass Yards: 285.2        | Sacks: 18              │
│ Rush Yards: 142.1        | INTs: 9                │
├─────────────────────────────────────────────────────┤
│ KEY PLAYERS                                         │
│ #9 Troy Aikman (QB) 3,518 YDS | #22 Emmitt Smith  │
│ (RB) 1,563 YDS | #88 Michael Irvin (WR) 1,021 YDS │
├─────────────────────────────────────────────────────┤
│ RECENT GAMES                                        │
│ ✓ W vs NYG 28-23  | ✓ W @ PHI 21-14  | ✗ L vs WAS │
└─────────────────────────────────────────────────────┘
```

---

## Data Model for Team Pages

```json
{
  "team": {
    "id": "dal",
    "name": "Dallas Cowboys",
    "city": "Dallas",
    "state": "Texas",
    "stadium": "AT&T Stadium",
    "founded": 1960,
    "coach": "Jimmy Johnson",
    "logos": {
      "primary": "https://...",
      "secondary": "https://...",
      "helmet": "https://..."
    },
    "colors": {
      "primary": "#003594",
      "secondary": "#ACC0C6"
    }
  },
  "current_season": {
    "year": 2025,
    "week": 7,
    "wins": 6,
    "losses": 2,
    "conference": "NFC",
    "division": "East",
    "playoff_probability": 0.78
  },
  "roster": [
    {
      "player_id": "aikman-troy",
      "name": "Troy Aikman",
      "number": 9,
      "position": "QB",
      "status": "active"
    }
  ],
  "schedule": [
    {
      "week": 7,
      "date": "2025-10-19",
      "opponent_id": "phi",
      "home_away": "away",
      "time": "15:00 ET",
      "result": "scheduled"
    }
  ],
  "stats": {
    "offensive": {
      "points_per_game": 28.5,
      "points_per_game_rank": 5,
      "yards_per_game": 427.3,
      "passing_yards_per_game": 285.2,
      "rushing_yards_per_game": 142.1
    },
    "defensive": {
      "points_allowed_per_game": 21.3,
      "points_allowed_rank": 2,
      "yards_allowed": 325.7,
      "sacks": 18,
      "interceptions": 9
    }
  }
}
```

---

## API Endpoints Needed

**From Backend**:
- `/v1/teams` → All 32 teams
- `/v1/teams/{team_id}` → Team overview
- `/v1/teams/{team_id}/roster?season={year}` → Team roster
- `/v1/teams/{team_id}/schedule?season={year}` → Schedule and results
- `/v1/teams/{team_id}/stats?season={year}` → Team statistics
- `/v1/standings?year={year}` → Standings (division, conference, league)
- `/v1/teams/{team_id}/transactions?season={year}` → Recent moves
- `/v1/teams/{team_id}/history` → Franchise records

---

## Implementation Priorities

### Phase 1: MVP
- ✅ Team overview/header
- ✅ Roster table (name, position, number, key stat)
- ✅ Schedule display (past and upcoming games)
- ✅ Basic team stats
- ✅ Mobile responsive

### Phase 2: Enhanced
- ✅ Key players highlight section
- ✅ Standings (division, conference)
- ✅ News/transactions section
- ✅ Injury reports
- ✅ Advanced filtering (position, injury status)

### Phase 3: Advanced
- ✅ Franchise history
- ✅ All-time leaders by position
- ✅ Play-by-play game details
- ✅ Comparison tools (vs other teams)
- ✅ Analytics/visualizations

---

## Success Criteria

✅ Team identity immediately clear (logo, colors)
✅ Record and standings quickly visible
✅ Full roster accessible
✅ Next game prominent
✅ Key stats visible at a glance
✅ Mobile responsive and touch-friendly
✅ All links functional
✅ Page loads fast
✅ Accessible (keyboard nav, screen reader friendly)

---

**Status**: Team Pages Design Complete - Ready for Implementation
**Related**: Backend provides team data via `/v1/teams/*` endpoints
**Owner**: Frontend team (Next.js implementation)
**Reference**: Pro Football Reference, Fox Sports, Baseball Reference

