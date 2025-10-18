# Scorebug Design Specification (Stub)

**Date**: October 16, 2025
**Purpose**: Define what makes a great NFL scorebug for data display
**Status**: Design Stub (Ready for Implementation)
**Research**: Competitive analysis of ESPN, Fox Sports, NFL.com included

---

## Executive Summary

A **scorebug** is the persistent on-screen graphic overlay that displays live game data. Research into ESPN, Fox Sports, and NFL.com reveals a universal pattern:

**The Essential 6 Elements** (Every major site shows these):
1. **Score** (large, prominent)
2. **Team Identity** (logos/abbreviations)
3. **Game Status** (quarter/time)
4. **Broadcast Network** (which channel)
5. **Team Records** (W-L standings)
6. **Game Status** (Live/Final/Scheduled)

**The Differentiators** (What separates good from great):
- Betting information (spread, total)
- Top player statistics
- Weather/venue context
- Down & distance information

---

## What is a Scorebug?

A **scorebug** is the persistent on-screen graphic overlay that displays:
- Live game score (primary)
- Team information and records
- Game time/quarter/status
- Broadcast network (where to watch)
- Down and distance (during play)
- Key statistics (top performers)
- Context (weather, venue, betting lines)

Essential for real-time game viewing and provides comprehensive at-a-glance game information.

---

## Great Scorebug: Core Elements

### 1. **Score Display** (Primary)
- Large, readable score for both teams
- Team logos or abbreviations (visual identity)
- Current possession indicator
- Clear hierarchy (larger than other elements)

### 2. **Game Status** (Secondary)
- Quarter/Period (1st, 2nd, 3rd, 4th, OT)
- Time remaining or game clock
- Status indicator (Live, Final, Scheduled)
- One-line game context

### 3. **Down & Distance** (Optional but Valuable)
- Current down (1st, 2nd, 3rd, 4th)
- Yards to go
- Field position indicator
- Only visible during play-by-play view

### 4. **Context & Stats** (Enhanced)
- **Team Records**: Home and away team win-loss records
- **Broadcast Network**: Which channel (FOX, CBS, NBC, ESPN, AMZN, etc.)
- **Betting Info**: Spread and over/under totals
- **Key Performance Stats**: Top players (QB passing, RB rushing, WR receiving)
- **Venue Context**: Stadium name, location, weather conditions
- **Badges**: Special indicators (playoff game, Super 6 available, etc.)

### 5. **Visual Design** (Professional)
- Clean, minimal layout (no clutter)
- High contrast (readable on any background)
- Consistent colors (team colors or neutral)
- Professional typography
- Subtle animations (smooth transitions, not distracting)

---

## Scorebug Layouts

### Compact (Mobile)
```
┌──────────────────────────┐
│  KC 21  |  BUF 17       │
│  2nd Q  |  8:45         │
│  1st & 10 | KC 32-yd ln │
└──────────────────────────┘
```

### Standard (Web)
```
┌────────────────────────────────────────┐
│  🏈 KC Chiefs          21               │
│         vs 2nd Q | 8:45               │
│  🏈 Buffalo Bills       17              │
│  1st & 10 | Kansas City 32-yard line  │
└────────────────────────────────────────┘
```

### Broadcast (Full)
```
┌─────────────────────────────────────────────────────────────┐
│  KC CHIEFS 21          2nd QTR | 8:45              BUF 17   │
│  Record: 6-2, Seed: 2          |                  Record: 5-3 │
│  1st & 10 | KC 32-yd line | Live on CBS | Possession: KC   │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features of a Great Scorebug

✅ **Instantly Readable** - You know the score within 1 second
✅ **Persistent** - Visible throughout viewing (not intrusive)
✅ **Contextual** - Shows relevant info for current game state
✅ **Professional** - Looks broadcast-quality
✅ **Responsive** - Works on mobile, tablet, desktop
✅ **Accessible** - High contrast, readable for colorblind
✅ **Fast Updates** - Real-time score updates (no lag)
✅ **Minimal Jank** - Smooth animations, no flicker

---

## Data Sources (From Historical Backend)

The scorebug will pull from:

**Essential Data**:
- `/v1/schedules?season=2025` → Score, teams, time, status, venue, weather, records
- `/v1/pbp?season=2025` → Down & distance, field position, current play
- `/v1/teams` → Team logos, colors, abbreviations, info
- `/v1/players?season=2025` → Player stats (QB, RB, WR leaders)
- Real-time updates (WebSocket or polling)

**Optional Enhancements**:
- `/v1/power-ratings?season=2025` → Team strength ranking
- Betting lines API (external) → Spread, total, moneyline
- Weather API (external) → Stadium conditions
- Broadcast info (manual or external) → Network, channel

---

## Implementation Path

### Phase 1: MVP (Minimal Viable) - Competitor Essential
Based on what ESPN, Fox, and NFL.com show:
- Score display (large, prominent)
- Team logos/abbreviations
- Quarter/time remaining
- Broadcast network
- Records (W-L)
- Game status (Live/Final/Scheduled)

**Why these**: Every major site shows these 6 elements

### Phase 2: Enhanced - Add Engagement
- Betting information (spread, total)
- Down & distance
- Possession indicator
- Top player stats (1 QB stat, 1 RB stat, 1 WR stat)
- Stadium/location info

### Phase 3: Advanced - Full Experience
- Live updates (WebSocket, real-time)
- Multi-game view (scoreboard)
- Weather conditions (temperature, conditions)
- Special badges (playoff, Super 6, etc.)
- Link to detailed boxscore/gamecast
- Ticket availability

---

## Competitor Analysis: How Major Sites Display Live Game Data

### ESPN Scoreboard Display

**What They Show**:
- Team names and records (e.g., "Steelers (4-12-0 Away)" vs "Bengals (2-41-1 Home)")
- Stadium location and weather conditions (e.g., "Paycor Stadium, Cincinnati, OH" with temperature)
- Broadcast network (Prime Video, FOX, CBS, NBC, ESPN, ABC)
- Betting information: spread and total (e.g., "Spread: PIT -4.5, Total: 44.5")
- Ticket availability with purchase links
- Key player statistics:
  - **PASS**: QB stats (yards, TDs, INTs) e.g., "1021YDS, 10TD, 3INT"
  - **RUSH**: RB stats (carries, yards, TDs) e.g., "74CAR, 202YDS, 1TD"
  - **REC**: WR stats (receptions, yards, TDs) e.g., "42REC, 468YDS, 4TD"
- "Gamecast" link for detailed play-by-play

**Key Insight**: ESPN emphasizes **narrative** (weather, location, tickets) + **performance metrics** alongside scores

### Fox Sports NFL Scores Display

**What They Show**:
- Team logos and names with records (e.g., "Steelers 4-1" vs "Bengals 2-4")
- Broadcast network indicators (AMZN, NFLN, FOX, CBS, ESPN, ABC)
- Betting information: spread and over/under (e.g., "PIT -5.5 TOTAL 44.5")
- Special badges (e.g., "Super 6 Logo" for games with fantasy contests)
- Chronological organization by day (Today, SUN OCT 19, MON OCT 20)
- Clickable cards linking to detailed boxscores

**Key Insight**: Fox Sports emphasizes **scanability** (quick glance) + **betting/fantasy engagement**

### NFL.com Scores Display

**What They Show** (inferred from structure):
- Official NFL presentation
- Focus on league-wide scoreboard view
- Week navigation and season/week organization
- Likely includes: scores, times, status, networks

**Key Insight**: Focuses on **comprehensive league view** with official standings

### Universal Patterns Across All Sites

✅ **Team identity**: Logos or team abbreviations (visual scanning)
✅ **Current score**: Large, prominent, immediately visible
✅ **Game status**: Quarter/time remaining or Final status
✅ **Betting info**: Spread and total (critical for sports audience)
✅ **Broadcast network**: Which channel/platform to watch
✅ **Organization**: Chronological grouping (today, tomorrow, week view)
✅ **Key stats**: Top performers (QB, RB, WR stats)
✅ **Context**: Stadium, weather, records (narrative elements)

---

## Inspiration Sources

**What We Can Learn**:
- **ESPN**: Include narrative context (weather, location) + top performer stats
- **Fox Sports**: Design for scanability + betting engagement
- **NFL.com**: Official comprehensive view + week navigation
- **Combined best practices**: Score + status + stats + betting + network + context

---

## Next Steps

1. **Design phase**: Create Figma mockup or wireframe
2. **Component build**: React component for scorebug
3. **Data integration**: Connect to backend APIs
4. **Real-time updates**: WebSocket or polling for live data
5. **Testing**: All device sizes, accessibility

---

**Status**: Stub Complete - Ready for Design/Implementation
**Related**: Backend provides data via API, historical data for context
**Owner**: Frontend team (Next.js implementation)

