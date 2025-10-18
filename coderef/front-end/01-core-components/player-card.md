# Player Cards Design Specification

**Date**: October 16, 2025
**Purpose**: Best practices for displaying individual player cards (summary and detail views)
**Status**: Analysis Complete - Ready for Implementation
**Research**: Baseball Reference, Basketball Reference, theScore, Hudl analyzed

---

## Executive Summary

Research into how Baseball Reference, Basketball Reference, theScore, and Hudl display player information reveals proven patterns for player cards.

**Key Insight**: Player cards serve two purposes:
1. **Summary Card** (in lists, rosters, search results) - minimal info, fast scanning
2. **Detail Card** (full player page) - comprehensive info, stats, career progression

Both need visual identity (photo, number, position) + key stats at a glance.

---

## Player Card Hierarchy

### Level 1: Micro Card (List/Search Context)
**Use When**: Player appears in a list, search results, or roster table
**Size**: ~120-150px width
**Information**:
- Player name
- Position
- Jersey number
- Team abbreviation
- Current stats (1-2 key metrics)

**Example**:
```
┌──────────────┐
│   🏈 #9      │
│ Troy Aikman  │
│ QB | DAL     │
│ 3518 YDS     │
└──────────────┘
```

### Level 2: Standard Card (Roster/Featured Context)
**Use When**: Player appears in roster view, featured player section, or comparison
**Size**: ~200-250px width
**Information**:
- Player photo (headshot)
- Jersey number
- Player name
- Position + Height/Weight
- Team (logo + name)
- Current season stats (3-5 key metrics)
- Social handle or link to full profile

**Example**:
```
┌────────────────────┐
│  [Player Photo]    │
│   #9 Troy Aikman   │
│   QB | 6'4" 220lb  │
│   Dallas Cowboys   │
│   3518 YDS | 23 TD │
│   → View Profile   │
└────────────────────┘
```

### Level 3: Full Player Page (Detail Context)
**Use When**: User clicks on player to see complete information
**Size**: Full width (desktop responsive)
**Sections**:
1. Header (photo, name, number, team, position, physical attributes)
2. Quick Stats (current season highlights)
3. Career Summary (career totals, rankings)
4. Season-by-Season Stats (table of all years)
5. Game Logs (recent games, performance details)
6. Career Achievements (MVP votes, Pro Bowls, All-Pro selections, Hall of Fame status)
7. Related Players (teammates, similar position players)
8. Videos/Highlights (if available)

---

## What Research Revealed

### Baseball Reference Player Directory

**Card Elements**:
- Name (with Hall of Fame indicator if applicable)
- Active status (bold for active, regular for retired)
- Link to detailed player page
- Alphabetical organization

**Key Insight**: Simple, text-focused approach works for directories

**Player Page Sections**:
- Biographical data (birth date, college, draft info)
- Career statistics (career totals)
- Year-by-year statistics (table)
- Game logs
- Splits (by season, by opponent, by situation)
- Playoff statistics

### Basketball Reference Player Pages

**Organization**:
- Alphabetical index (A-Z)
- Active players in bold
- Hall of Fame members marked with asterisk (*)
- Easy navigation to player pages

**Player Page Contents**:
- Career statistics overview
- Season-by-season breakdown
- Playoff records
- All-Star game participation
- Awards and honors
- Draft history

### theScore Player Cards

**Visual Elements**:
- Player headshots (small versions for thumbnails)
- Team color coding (hex values for visual identity)
- Player name with team identification
- Alert subscriptions (Touchdown, Fumble, Reception, Breaking News)

**Card Design Pattern**:
- Responsive: 100% width on mobile, 316-658px on larger screens
- Masonry grid layout
- Clickable for full profile
- Color-coded by team

### Baseball/Basketball Reference Insights

**Common Patterns**:
1. **Alphabetical organization** works at scale
2. **Status indicators** important (active, Hall of Fame, retired)
3. **Simple photos** helpful for identification
4. **Career totals** more important than year-by-year initially
5. **Drill-down approach**: Overview → Detail → Specific records

---

## Best Practices for NFL Player Cards

### ✅ Visual Identity

**Always Include**:
- Player photo (headshot, professional)
- Jersey number
- Position(s)
- Team name (with logo)
- Name in readable font

**Optional but Valuable**:
- Height/Weight
- College
- Draft year/round
- Years in NFL

### ✅ Information Architecture

**Quick Stats Section** (1-3 key metrics based on position):
- **QBs**: Passing yards, TDs, INTs
- **RBs**: Rushing yards, TDs, Receptions
- **WRs**: Receptions, receiving yards, TDs
- **Defensive**: Sacks, INTs, Tackles
- **Others**: Position-specific key stats

**Career Context** (when space available):
- Rank all-time at position
- Pro Bowl selections (count)
- All-Pro selections (count)
- MVP voting history
- Hall of Fame status

### ✅ Card Sizes and Layouts

**Micro Card** (120-150px):
```
┌────────────────┐
│ [Photo/Jersey] │
│  Player Name   │
│   Position     │
│    Team        │
│  Key Stat: 42  │
└────────────────┘
```

**Standard Card** (200-250px):
```
┌──────────────────┐
│   [Photo]        │
│ #9 Troy Aikman   │
│ QB | 6'4" 220    │
│ Dallas Cowboys   │
│ 3518 YDS | 23 TD │
│ Pro Bowl: 6x     │
│ → Full Profile   │
└──────────────────┘
```

**Full Page** (Responsive):
```
┌────────────────────────────────────────────┐
│ [Large Photo]  #9 Troy Aikman              │
│                QB | Dallas Cowboys         │
│                6'4" | 220 lb               │
│                Birth: 11/21/1966           │
│                College: UCLA              │
├────────────────────────────────────────────┤
│ QUICK STATS        │  CAREER HIGHLIGHTS    │
│ 2024 (through W7)  │ Pro Bowls: 6          │
│ 3518 YDS           │ All-Pro: 3            │
│ 23 TD              │ Super Bowls: 3 Wins   │
│ 12 INT             │ HOF: 2016              │
├────────────────────────────────────────────┤
│ SEASON BY SEASON STATISTICS TABLE          │
│ GAME LOGS (RECENT PERFORMANCE)             │
│ RELATED PLAYERS (TEAMMATES, RIVALS)        │
└────────────────────────────────────────────┘
```

### ✅ Color Coding

**Team Visual Identity**:
- Use team primary color as card accent
- Logo prominent (not photo URL)
- Text contrast readable on team color
- Consistent across all cards

**Status Indicators**:
- Green background: Active player
- Gray background: Retired player
- Gold badge: Hall of Fame
- Star icon: Award winner

### ✅ Responsive Design

**Mobile (<768px)**:
- Card width: 100% of container
- Horizontal layout: [Photo] [Info]
- Single column for stats
- Larger touch targets for clicks

**Tablet (768-1200px)**:
- Card width: 280-350px
- Grid layout: 2-3 cards per row
- Slightly larger info text
- Same hierarchy as desktop

**Desktop (1200px+)**:
- Card width: 300-400px
- Grid layout: 3-4 cards per row
- Full detail visible
- Hover effects for interactivity

### ✅ Key Stats by Position

**Quarterback**:
- Passing yards
- Touchdowns
- Interceptions
- Completion %
- Rating

**Running Back**:
- Rushing yards
- Touchdowns
- Receptions
- Yards per game
- Fumbles

**Wide Receiver**:
- Receptions
- Receiving yards
- Touchdowns
- Yards per reception
- Targets

**Defensive Player**:
- Sacks
- Interceptions
- Tackles
- Forced fumbles
- Pass deflections

### ✅ Interactive Elements

**Hover State** (Desktop):
- Slight shadow increase
- Background color fade
- Show full profile link
- Highlight key stat

**Click Actions**:
- Link to full player page
- Show career stats modal
- Compare to other players
- View game log

**Mobile**:
- Touch expands card briefly
- Tap to go to full page
- Long press for quick stats

---

## Sample Player Card HTML/CSS Structure

```jsx
// Micro Card Component
<PlayerCard size="micro" player={player}>
  <PlayerPhoto src={player.photo} />
  <PlayerJersey number={player.number} />
  <PlayerName>{player.name}</PlayerName>
  <PlayerPosition>{player.position}</PlayerPosition>
  <KeyStat label="Pass YDS" value={player.stats.passingYards} />
</PlayerCard>

// Standard Card Component
<PlayerCard size="standard" player={player}>
  <PlayerPhoto src={player.photo} size="large" />
  <PlayerHeader>
    <PlayerJersey>{player.number}</PlayerJersey>
    <PlayerName>{player.name}</PlayerName>
  </PlayerHeader>
  <PlayerInfo>
    <Position>{player.position}</Position>
    <Physical>{player.height} | {player.weight}lb</Physical>
    <Team logo>{player.team}</Team>
  </PlayerInfo>
  <StatsList>
    <Stat label="YDS" value={player.stats.yards} />
    <Stat label="TD" value={player.stats.touchdowns} />
    <Stat label="INT" value={player.stats.interceptions} />
  </StatsList>
  <ProfileLink>View Full Profile</ProfileLink>
</PlayerCard>
```

---

## Full Player Page Sections

### 1. Header Section
- Large player photo (left)
- Jersey number (overlay)
- Name, position, team (center)
- Height, weight, college, draft info (right)
- Social links, share buttons

### 2. Quick Stats Section
- Current season (with week number)
- 5-7 key stats for position
- Rank all-time (where applicable)
- Comparison to position average

### 3. Career Summary Section
- Career totals
- Games played
- Pro Bowls (with years)
- All-Pro selections (with years)
- MVP voting (votes received)
- Hall of Fame (inducted year or eligibility status)

### 4. Season-by-Season Statistics
- Table format
- All career years
- Sortable columns
- Team per year (if traded)
- Status per year (active, injured, retired)

### 5. Game Logs (Current Season)
- Most recent 5-10 games
- Date, opponent, result
- Performance stats
- Link to full game log

### 6. Career Achievements
- Awards won
- Records held
- Notable games (playoff, Super Bowl)
- Milestone achievements

### 7. Related Players
- Current/former teammates
- Position rivals (contemporaries)
- Draft class peers
- Same college alumni

### 8. Video/Media Section
- Highlights (if available)
- Game footage
- Interviews

---

## Data Model for Player Cards

```json
{
  "player": {
    "id": "aikman-troy",
    "name": "Troy Aikman",
    "number": 9,
    "position": ["QB"],
    "team": "DAL",
    "status": "retired",
    "photos": {
      "headshot": "https://...",
      "full_body": "https://...",
      "action": "https://..."
    },
    "physical": {
      "height": "6'4\"",
      "weight": 220,
      "college": "UCLA",
      "draft": {
        "year": 1989,
        "round": 1,
        "pick": 1
      }
    }
  },
  "current_season": {
    "year": 2025,
    "week": 7,
    "stats": {
      "passing_yards": 3518,
      "touchdowns": 23,
      "interceptions": 12,
      "completion_pct": 64.8
    }
  },
  "career": {
    "games_played": 165,
    "start_date": "1989-09-10",
    "end_date": "2000-12-24",
    "career_totals": {
      "passing_yards": 32942,
      "touchdowns": 165,
      "interceptions": 141
    }
  },
  "awards": {
    "pro_bowls": 6,
    "all_pro": 3,
    "super_bowls_won": 3,
    "mvp_votes": 42,
    "hall_of_fame": {
      "inducted": 2016,
      "year_eligible": 2005
    }
  },
  "achievements": [
    "3x Super Bowl Champion",
    "1x NFC Champion",
    "6x Pro Bowl Selection",
    "3x All-Pro Selection"
  ]
}
```

---

## API Endpoints Needed

**From Backend**:
- `/v1/players/{player_id}` → Full player profile
- `/v1/players/{player_id}/season/{year}` → Specific season stats
- `/v1/players/{player_id}/gamelogs?season={year}` → Game-by-game stats
- `/v1/teams/{team}/roster?season={year}` → Team roster with player cards
- `/v1/players/search?q={name}` → Player search
- `/v1/players/leaders?stat={stat}&year={year}` → Stat leaders

---

## Implementation Priorities

### Phase 1: MVP
- ✅ Micro cards (name, position, team, one stat)
- ✅ Standard cards (photo, number, key stats)
- ✅ Basic player page (header, career totals, season stats table)
- ✅ Mobile responsive

### Phase 2: Enhanced
- ✅ Pro Bowl/All-Pro indicators
- ✅ Career achievements section
- ✅ Game logs (recent)
- ✅ Team color coding
- ✅ Hall of Fame indicator

### Phase 3: Advanced
- ✅ Full video/highlights integration
- ✅ Career comparison tools
- ✅ Related players section
- ✅ Interactive charts
- ✅ Social integration

---

## Success Criteria

✅ Player instantly identifiable (photo, number, name visible)
✅ Key stats visible without clicking
✅ Mobile responsive and touch-friendly
✅ Links work to full profile
✅ Team branding consistent
✅ Load fast even with many cards
✅ Accessible (alt text for images, high contrast)
✅ No dead links or 404 errors

---

**Status**: Player Cards Design Complete - Ready for Implementation
**Related**: Backend provides player data via `/v1/players/*` endpoints
**Owner**: Frontend team (Next.js implementation)
**Reference**: Baseball Reference, Basketball Reference, theScore, Hudl

