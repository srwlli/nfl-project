# Super Bowl Component Specification

**Date**: October 16, 2025
**Purpose**: Dedicated Super Bowl explorer and historical database for all 58 Super Bowls (1967-2024)
**Status**: Research Complete - Ready for Implementation
**Research**: Pro Football Reference, Wikipedia Super Bowl data, historical championship series patterns

---

## Executive Summary

Research into how sports sites handle championship series reveals patterns for showcasing the sport's biggest event across 57+ years of history.

**Key Insight**: Super Bowl pages serve multiple purposes:
1. **Current Super Bowl**: Real-time coverage, predictions, odds, team pages
2. **Historical Explorer**: Browse all past Super Bowls by year, era, team
3. **Records Browser**: All-time Super Bowl records, MVP records, attendance records
4. **Comparison Tool**: Compare two Super Bowls, eras, teams' performances
5. **Fan Hub**: Predictions, prop bets, team matchups, halftime info

Effective Super Bowl components let users explore the sport's greatest moments while tracking current season.

---

## What Research Revealed

### Pro Football Reference Super Bowl Directory

**Table Format**:
- Date of game
- Super Bowl number (Roman and Arabic: "LVIII" and "58")
- Winner (bolded) and loser with scores
- Game MVP
- Stadium and location (city, state)
- Chronological reverse order (newest first)

**Navigation Links**:
- Super Bowl Leaders (stat leaders across all time)
- Super Bowl Standings (all-time records by franchise)
- Individual game pages with full details

**Key Pattern**: Elegant simplicity with contextual navigation

### Wikipedia Super Bowl Historical Organization

**Structure**:
- Era-based grouping (1960s dominance, 1970s Steel Curtain, 1980s 49ers, etc.)
- Detailed narratives for each game
- Notable achievements and records highlighted
- Historical context (boycotts, strikes, cultural moments)
- TV ratings and viewership data

**Key Pattern**: Story + stats tells richer history

### Baseball Reference World Series Records

**Championship History Structure**:
- Historical periods clearly identified
- Per-series data: Year, teams, games won, MVP, winning team highlighted
- Cross-linked to team pages and individual player records
- Contextual notes explain anomalies

**Key Pattern**: Context helps understand significance

---

## Best Practices for Super Bowl Component

### ✅ Super Bowl Hub (Main Landing)

**Current Super Bowl + Archive**:
```
┌──────────────────────────────────────────────────────────┐
│ SUPER BOWL EXPLORER                                      │
│                                                           │
│ ┌─ CURRENT/UPCOMING ─────────────────────────────────┐  │
│ │ Super Bowl LIX (2025)  → Live Coverage              │  │
│ │ Kansas City Chiefs vs San Francisco 49ers           │  │
│ │ February 9, 2025 | Caesars Superdome, New Orleans  │  │
│ │ [Get Predictions] [View Matchup] [Teams Stats]     │  │
│ └────────────────────────────────────────────────────┘  │
│                                                           │
│ ┌─ QUICK STATS ──────────────────────────────────────┐  │
│ │ Total Super Bowls: 58                               │  │
│ │ Most Wins: Patriots, Steelers (6 each)             │  │
│ │ Most Recent Winner: Chiefs (LVIII, 2024)           │  │
│ │ Highest Attendance: 93,701 (Raiders, SoFi)         │  │
│ │ Lowest Attendance: 61,646 (Dolphins, '79)          │  │
│ │ Largest Point Spread: 40 (1-1)                     │  │
│ └────────────────────────────────────────────────────┘  │
│                                                           │
│ [Browse All] [By Era] [By Team] [Records] [MVP Race]   │
└──────────────────────────────────────────────────────────┘
```

### ✅ Super Bowl Directory

**All 58 Super Bowls in Table**:
```
SUPER BOWL HISTORY (1967-2024)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Search: ____________] [Era: All ▼] [Team: All ▼] [Sort: Newest ▼]

SB# | YEAR | DATE        | WINNER              | LOSER              | SCORE | MVP              | STADIUM    | CITY
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
58  | 2024 | Feb 11      | Kansas City Chiefs  | San Francisco 49ers| 25-22 | Patrick Mahomes  | Allegiant  | Vegas
57  | 2023 | Feb 12      | Kansas City Chiefs  | Philadelphia Eagles| 38-35 | Patrick Mahomes  | State Farm | AZ
56  | 2022 | Feb 13      | Los Angeles Rams    | Cincinnati Bengals | 23-20 | Cooper Kupp      | SoFi       | LA
...
1   | 1967 | Jan 15      | Green Bay Packers   | Kansas City Chiefs | 35-10 | Bart Starr        | Memorial   | LA
```

### ✅ Super Bowl Detail Page

**Individual Game Full Information**:
```
┌──────────────────────────────────────────────────────────┐
│ SUPER BOWL LVIII (2024)                                 │
│ Kansas City Chiefs 25   vs   San Francisco 49ers 22      │
│ (OT)                                                      │
│                                                           │
│ BASIC INFO                                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Date: February 11, 2024                                  │
│ Attendance: 61,929                                       │
│ Stadium: Allegiant Stadium (Las Vegas, Nevada)           │
│ Referee: Ron Torbert (Head)                              │
│ Game MVP: Patrick Mahomes (QB)                           │
│ Head Coaches: Andy Reid (KC) vs Kyle Shanahan (SF)       │
│                                                           │
│ HISTORIC SIGNIFICANCE                                    │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ ★ 1st Super Bowl decided under NEW overtime rules       │
│ ★ Both teams guaranteed possession in OT                 │
│ ★ 3rd Super Bowl ever played in overtime                │
│ ★ Mahomes becomes 3x Super Bowl winner & MVP            │
│ ★ Chiefs win 3rd championship in 4 years (dynasty)      │
│ ★ Highest-rated Super Bowl in 2 years (TV audience)     │
│                                                           │
│ THE GAME STORY                                            │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ The Chiefs came into halftime down 19-13 to a 49ers team │
│ that looked like they'd solved Patrick Mahomes. But the  │
│ Chiefs' defense tightened in the second half while their │
│ offense found rhythm. A Travis Kelce TD tied it 20-20    │
│ with 2:11 left in the game. In overtime, under the new   │
│ playoff OT rules ensuring both teams got a possession,   │
│ both teams scored TDs. The Chiefs scored last for the    │
│ 25-22 victory, cementing their status as the sport's     │
│ first dynasty of this era.                               │
│                                                           │
│ SCORING BY QUARTER                                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Q1: KC FG 3-0                                            │
│ Q2: KC TD 10-0 | SF TD 10-7 | KC FG 13-7                 │
│ Q3: SF TD 13-14                                          │
│ Q4: SF TD 22-13 | KC TD 20-22 (tie after 4)              │
│ OT: SF TD 25-22 | KC TD 28-25 (KC wins)                  │
│                                                           │
│ KEY PERFORMANCES                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ KANSAS CITY CHIEFS                                        │
│ • Patrick Mahomes (QB): 333 YDS | 2 TD | MVP ⭐         │
│ • Travis Kelce (TE): 93 REC YDS | 1 TD                   │
│ • Isiah Pacheco (RB): 59 RUSH YDS                        │
│                                                           │
│ SAN FRANCISCO 49ers                                       │
│ • Christian McCaffrey (RB): 80 RUSH YDS | 1 TD           │
│ • Brandon Aiyuk (WR): 84 REC YDS                         │
│ • Brock Purdy (QB): 255 YDS | 1 TD                       │
│                                                           │
│ DEFENSIVE HIGHLIGHTS                                     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ • L'Jarius Sneed (DB, KC): 1 INT, Key Coverage          │
│ • Nick Bosa (DE, SF): 2 Sacks, Dominant                  │
│ • George Karlaftis (DE, KC): 0.5 Sacks                   │
│                                                           │
│ RECORDS MADE THIS GAME                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ NEW SUPER BOWL RECORDS:                                   │
│ • 1st Super Bowl OT under new rules (both teams play)    │
│ • Mahomes: 3 Super Bowl MVPs                             │
│ • Mahomes: 3 Super Bowl Wins before age 29               │
│                                                           │
│ COMPARISON TO OTHER CLASSIC SUPER BOWLS                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Ranked #5 All-Time (compare to:)                         │
│ • Super Bowl LI (Patriots-Falcons, 2017) - 28-3 comeback │
│ • Super Bowl XXXVIII (Patriots-Eagles, 2004) - 1 yd TD  │
│ • Super Bowl XXXVI (Patriots-Rams, 2002) - 1st Brady    │
│                                                           │
│ ALL-TIME STATISTICS FOR THIS GAME                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Total Points: 47 (Above avg: 48.5)                       │
│ Total Yards: 800 (Above avg: 950)                        │
│ Turnovers: 0 (Below avg: 2.5)                            │
│ MVP Age: 28 years (Mahomes)                              │
│                                                           │
│ [Download Full Box Score] [Watch Full Game] [Player Stats]
│ [Compare Eras] [See Related Games] [Share This Game]
└──────────────────────────────────────────────────────────┘
```

### ✅ Super Bowl by Era Browser

**Temporal Organization**:
```
SUPER BOWL HISTORY BY ERA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1960s - ESTABLISHMENT ERA (Packers Dominance)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Records: 4 Super Bowls played
Packer Dominance: 3 of 4 (1966, 1967, 1968)
Jets Upset: Super Bowl III - "The Greatest Game Ever Played"
Era Theme: AFL-NFL Merger impact, Packers dynasty

Notable Games:
• Super Bowl III - NY Jets 16, Baltimore Colts 7
  "Joe Namath guaranteed victory" - First AFL win

1970s - STEELERS STEEL CURTAIN ERA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Records: 10 Super Bowls (VI-XV)
Steelers Wins: 4 of 10 championships (1974, 1975, 1978, 1979)
Cowboys Success: 2 championships (1971, 1977)
Era Theme: Defense-first football, Running game emphasis

Notable Games:
• Super Bowl X - Pittsburgh 21, Dallas 17
  "Steel Curtain vs America's Team"
• Super Bowl IX - Pittsburgh 16, Minnesota 6
  Steelers' 4th title begins

1980s - 49ERS DYNASTY ERA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Records: 10 Super Bowls (XVI-XXV)
49ers Wins: 4 of 10 championships (1981, 1984, 1988, 1989)
Domination: Won 16 straight postseason games
Era Theme: West Coast Offense, Passing game revolution

Notable Games:
• Super Bowl XVI - San Francisco 26, Cincinnati 21
  "49ers' first, Walsh's offense arrives"
• Super Bowl XIX - San Francisco 38, Miami 16
  Montana's dominant performance

2000s - PATRIOTS DYNASTY BEGINS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Records: 10 Super Bowls
Patriots Wins: 3 of 10 championships (2001, 2003, 2004)
Start of Era: Brady-Belichick dynasty begins
Era Theme: 6th-round pick becomes G.O.A.T., Patriots dominance

Notable Games:
• Super Bowl XXXVI - New England 20, St. Louis 17
  "Brady's arrival"
• Super Bowl XXXVIII - New England 32, Carolina 29
  "2-yard TD goal line stand"

2020s - MAHOMES/CHIEFS ERA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Records: 5 Super Bowls so far (LIII-LVII, LVIII pending)
Chiefs Wins: 3 of 5 championships (2019, 2022, 2023)
Dominance: 3 Super Bowls in 4 years (2019-2023)
Era Theme: Mahomes dynasty emerges, New Patriots-level dominance

Notable Games:
• Super Bowl LIV - KC 31, SF 20
  "Mahomes arrives"
• Super Bowl LVIII - KC 25, SF 22 (OT)
  "First new-rule OT in Super Bowl"
```

### ✅ Super Bowl Records Browser

**All-Time Records Across Entire History**:
```
SUPER BOWL ALL-TIME RECORDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FRANCHISES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Most Wins:        New England Patriots (6)
                  Pittsburgh Steelers (6)

Most Appearances: New England Patriots (11)
                  Pittsburgh Steelers (8)

Most in One Era:  New England Patriots (2000-2019: 9 in 20 years)

Longest Drought:  Detroit Lions (0 Super Bowl wins)
                  Cleveland Browns (0 Super Bowl wins)

INDIVIDUAL PLAYERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Most Super Bowls:  Rob Gronkowski (7 appearances)
                   Tom Brady (10 appearances)

Most MVPs:         Joe Montana (3)
                   Patrick Mahomes (3) ← Tied
                   Tom Brady (5)

Most TDs (QB):     Tom Brady (13 TDs)
                   Patrick Mahomes (8 TDs)

Most Yards (QB):   Tom Brady (1,152 yards)
                   Patrick Mahomes (725 yards)

GAME RECORDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Highest Score:     49ers 55, Broncos 10 (SB XXIX)
Closest Game:      Patriots 36, Falcons 28 OT (SB LI)
Largest Spread:    49ers 55, Broncos 10 (45-point gap)
Lowest Score:      Colts 16, Bears 13 (SB XX)
Longest Game:      Patriots 34, Falcons 28 OT (4:01 of OT)
Highest Attendance: Raiders 16, Vikings 13 (93,701 at SoFi Stadium)

ATTENDANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Highest:          93,701 (Super Bowl LVII at SoFi)
Lowest:           61,629 (Super Bowl I)
Average (modern): 75,000+
Lowest (recent):  61,929 (Super Bowl LVIII)
```

### ✅ Super Bowl Team Filter

**All Super Bowls for a Specific Team**:
```
DALLAS COWBOYS SUPER BOWL HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL RECORD: 5 Wins - 3 Losses (5 Appearances)
Win %: 62.5% (Elite performance)

SUPER BOWLS WON:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SB VI (1972)   Cowboys 24, Dolphins 3       [View Game]
SB XII (1978)  Cowboys 27, Broncos 10       [View Game]
SB XXVII (1993) Cowboys 30, Bills 13        [View Game]
SB XXVIII (1994) Cowboys 30, Bills 13       [View Game]
SB XXX (1996)  Cowboys 27, Steelers 17      [View Game]

SUPER BOWLS LOST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SB V (1971)   Cowboys 17, Colts 16 [LOSS]   [View Game]
SB XIII (1979) Cowboys 31, Steelers 35 [LOSS] [View Game]
SB XXXI (1997) Cowboys 27, Packers 31 [LOSS] [View Game]

ERA BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1970s: 3 appearances (1-2 record, SB VI win)
1990s: 5 appearances (4-1 record, dynasty)
2000s+: 0 appearances (long drought continues)

KEY FACTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Won in 3 consecutive years (1992, 1993, 1994 seasons)
• Troy Aikman: 2 Super Bowl MVPs
• 1990s dynasty: "America's Team" at peak
• Last appearance: January 1997 (27+ years ago!)
```

### ✅ Super Bowl Comparisons

**Head-to-Head Game Analysis**:
```
COMPARE SUPER BOWLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Game 1: Super Bowl LI (Pats-Falcons, 2017) ▼]
vs
[Game 2: Super Bowl LVIII (Chiefs-49ers, 2024) ▼]

FINAL SCORE COMPARISON:
LI: New England 34, Atlanta 28 (OT)
LVIII: Kansas City 25, San Francisco 22 (OT)

Both Went To Overtime! (Only 3 Super Bowls ever)

COMPARISON METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        SB LI              SB LVIII
Largest Comeback        28-3 (25 pts)      19-13 (6 pts)
MVP Performance         Tom Brady (5 TD)   Patrick Mahomes (2 TD)
Attendance             70,404             61,929
TV Ratings             111.3M              115.6M
Total Yards            1,068              800
Total Plays            255                180
Turnovers              2                  0

SIMILARITIES:
• Both went to OT
• Both involved elite QBs
• Both high-scoring affairs
• Both legendary moments
```

---

## Data Model

```json
{
  "super_bowl": {
    "id": "sb-lviii",
    "number_roman": "LVIII",
    "number_arabic": 58,
    "year": 2024,
    "season": 2023,
    "date": "2024-02-11",
    "home_team": "kc",
    "away_team": "sf",
    "home_score": 25,
    "away_score": 22,
    "overtime": true,
    "attendance": 61929,
    "stadium": "Allegiant Stadium",
    "city": "Las Vegas",
    "state": "Nevada",
    "head_coaches": {
      "home": "Andy Reid",
      "away": "Kyle Shanahan"
    },
    "game_mvp": {
      "player_id": "mahomes-patrick",
      "player_name": "Patrick Mahomes",
      "team": "kc"
    },
    "tv_ratings": {
      "viewers": 115600000,
      "rank": 5
    },
    "all_time_rank": 5,
    "significance": "First Super Bowl OT under new rules",
    "records_made": [
      "Mahomes 3x Super Bowl MVP",
      "Chiefs 3 in 4 years dynasty"
    ]
  }
}
```

---

## Implementation Priorities

### Phase 1: MVP
- ✅ Super Bowl directory (all 58 games)
- ✅ Game detail pages (narrative + stats)
- ✅ Era browser
- ✅ Team filter
- ✅ Mobile responsive

### Phase 2: Enhanced
- ✅ Super Bowl records browser
- ✅ Game comparisons
- ✅ Video highlights integration
- ✅ Scoring breakdown animations

### Phase 3: Advanced
- ✅ Interactive playoff bracket visualization
- ✅ Predictions/prop bet tracker (current SB)
- ✅ Social media integration
- ✅ Advanced analytics

---

## Success Criteria

✅ All 58 Super Bowls easily browsable
✅ Current Super Bowl prominent and detailed
✅ Era-based organization makes sense
✅ Records accessible and clear
✅ Team-specific filtering works
✅ Mobile responsive
✅ Video plays without lag
✅ Accessible (captions on video)

---

**Status**: Super Bowl Design Complete - Ready for Implementation
**Related**: All-Time Games, Team Pages, Player Cards, Historical Stats
**Owner**: Frontend team (Next.js implementation)
