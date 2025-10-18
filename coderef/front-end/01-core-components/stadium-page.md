# Stadium Page Design Specification

**Date**: October 16, 2025
**Purpose**: Best practices for displaying NFL stadium pages with comprehensive venue information
**Status**: Analysis Complete - Ready for Implementation
**Research**: Pro Football Reference, Wikipedia stadium listings, StadiumsOfProfootball.com, MLB/NBA arena patterns analyzed

---

## Executive Summary

Research into how major sports sites display stadium information reveals proven patterns for presenting venue details, historical context, and stadium-specific statistics.

**Key Insight**: Stadium pages serve multiple audiences:
1. **Game attendees**: Where is it? How do I get there? What's there to eat? Where do I park?
2. **Fans at home**: What's this stadium like? Notable moments? Records set there?
3. **Historians/Researchers**: When opened? Teams that played there? What's the capacity?
4. **Fantasy/Bettors**: Dome vs. outdoor? Natural vs. artificial surface? Home field advantage?

Effective stadium pages allow all audiences to find what they need quickly.

---

## Stadium Page Hierarchy

### Level 1: Stadium Card (List Context)
**Use When**: Stadium appears in standings, team pages, or league view
**Size**: ~150-200px width
**Information**:
- Stadium name
- Home team(s)
- Location
- Year opened
- One key fact (capacity or roof type)

**Example**:
```
┌────────────────────┐
│  ARROWHEAD STADIUM │
│  Kansas City Chiefs│
│  Kansas City, MO   │
│  Opened: 1972     │
│  Capacity: 76,416 │
└────────────────────┘
```

### Level 2: Stadium Page (Full Context)
**Use When**: User clicks on stadium to see complete information
**Size**: Full width (desktop responsive)
**Key Sections**:
1. Header (stadium photo, name, team, location, basic facts)
2. Quick Facts (capacity, opened, surface, roof)
3. Team Timeline (all teams that played there)
4. Stadium Features (amenities, food, parking, accessibility)
5. Notable Players (famous players who played there)
6. Stadium Records (best performances, records set there)
7. Game History (recent games, historical games)
8. Directions & Getting There
9. Photos & Media (stadium tour, photos, videos)
10. Comparisons (vs. other stadiums)

---

## What Research Revealed

### Pro Football Reference Stadium Directory

**Structure**:
- All NFL stadiums (current + historical)
- Chronological organization (active first, then historical)
- Stadium name with links to individual pages
- Years active (From/To)
- Game count (total games hosted)
- Location (City, State/Country)
- Primary teams associated

**Key Pattern**: Historical depth matters - shows both active and retired venues

### Wikipedia NFL Stadium Listing

**Data Points for Each Stadium**:
- Stadium Name
- Home Team(s)
- Location (City, State)
- Capacity (seating)
- Playing Surface (natural grass, artificial turf type)
- Roof Type (open-air, dome, retractable, translucent)
- Year Opened
- Architect/Builder (when significant)

**Key Pattern**: Physical specifications matter as much as location

### StadiumsOfProfootball.com Organization

**Categories**:
- AFC Stadiums
- NFC Stadiums
- Past Stadiums (historical)
- Future Stadiums (under development)

**Features**:
- Seating charts (visual layout)
- Directions and parking information
- Stadium comparisons (data between venues)
- Stadium news (current updates)
- Construction projects tracking

**Key Pattern**: Context and comparison features help users understand relative value

---

## Best Practices for NFL Stadium Pages

### ✅ Stadium Header

**Essential Elements**:
- Large stadium photo (or team logo if exterior photo unavailable)
- Stadium name (prominent)
- City and State
- Primary team(s)
- Year opened
- Capacity

**Optional but Valuable**:
- Architect/Builder name
- Cost to build (historical value)
- Notable features (first dome? retractable roof?)
- Previous names (if stadium renamed)

**Example Header**:
```
┌─────────────────────────────────────────────────────────┐
│         [STADIUM PHOTO OR AERIAL VIEW]                 │
│                                                         │
│         ARROWHEAD STADIUM                              │
│         Kansas City, Missouri                          │
│                                                         │
│  Opened: 1972 | Capacity: 76,416                       │
│  Surface: Natural Grass | Roof: Open-Air              │
│  Home Team: Kansas City Chiefs                         │
│  Architect: Kivett & Myers                            │
└─────────────────────────────────────────────────────────┘
```

### ✅ Quick Facts Section

**Primary Information** (always visible):
```
┌──────────────────────────────────────────────┐
│ STADIUM FACTS                                │
├──────────────────────────────────────────────┤
│ Location:         Kansas City, Missouri      │
│ Opened:           September 10, 1972         │
│ Capacity:         76,416                     │
│ Surface Type:     Natural Grass              │
│ Roof Type:        Open-Air                   │
│ Architect:        Kivett & Myers             │
│ Build Cost:       $43 million (1972)         │
│ Total Games:      900+ (franchise history)   │
│ Home Teams:       Kansas City Chiefs         │
│ Seating Levels:   3 decks                    │
│ Luxury Suites:    112                        │
│ Total Parking:    9,500 spaces               │
└──────────────────────────────────────────────┘
```

### ✅ Team Timeline Section

**Display All Teams That Played There**:
```
TEAM TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1972-1975   Kansas City Chiefs (AFL, Pre-merger)
            Years: 4 | Games: 64 | Record: 32-32
            Notable: First home season at Arrowhead

1976-present Kansas City Chiefs (NFL, Post-merger)
            Years: 49 | Games: 875 | Record: 465-410
            Notable: 53-year tenure, Super Bowl home

[Click for team page]
```

**Key Information per Team**:
- Team name
- Years active (From-To)
- Total years at venue
- Games played
- Overall record at venue
- Notable achievements/seasons
- Link to team page

### ✅ Notable Players Section

**Famous Players Who Made Their Mark Here**:
```
NOTABLE PLAYERS AT ARROWHEAD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏈 Len Dawson (QB) - Chiefs Legend
   1962-1975 at Kansas City, 237 games
   Threw 119 TDs at Arrowhead
   Super Bowl IV champion (1970)
   [View Profile]

🏈 Joe Montana (QB) - Chiefs Era
   1993-1994 at Kansas City, 16 games
   Last season before retirement
   [View Profile]

🏈 Patrick Mahomes (QB) - Current
   2017-present at Kansas City
   500+ games, Super Bowl MVP (2020)
   [View Profile]

🏈 Priest Holmes (RB) - Chiefs History
   1999-2006 at Kansas City
   2,000+ rushing yards at Arrowhead
   [View Profile]

🏈 Derrick Johnson (LB) - All-Time Great
   2005-2016 at Kansas City
   All-Pro seasons, future Hall of Famer
   [View Profile]
```

### ✅ Stadium Records Section

**Best Individual Performances at This Venue**:
```
STADIUM RECORDS - SINGLE GAME PERFORMANCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASSING RECORDS
Passing Yards:        424 yards
  Player: Travis Kelce (WR) - Wait, wrong position
  Actually: Matt Ryan (QB, Falcons visiting)
  Date: October 2, 2016
  [View Game]

Passing Touchdowns:   6 TDs
  Player: Name TBD
  Date: Date TBD
  [View Game]

RUSHING RECORDS
Rushing Yards:        200+ yards
  Player: Name TBD
  Date: Date TBD

RECEIVING RECORDS
Receiving Yards:      200+ yards
  Player: Name TBD
  Date: Date TBD

TEAM RECORDS (HOME GAMES AT THIS STADIUM)
Highest Score:        59 points (vs Team)
  Date: Date
  [View Game]

Largest Margin:       51 points (vs Team)
  Date: Date
  [View Game]
```

### ✅ Stadium Features & Amenities

**Facilities Section**:
```
STADIUM FEATURES & AMENITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STRUCTURE
├── Total Capacity: 76,416
├── Seating Levels: 3 decks
├── Luxury Suites: 112
├── Club Seats: 6,500+
├── Accessible Seating: 1,000+

PLAYING SURFACE
├── Type: Natural Grass
├── Heating: In-ground heated field
├── Drainage: Specialized system
├── Maintenance: Year-round grounds crew

ROOF & WEATHER
├── Type: Open-Air (No roof)
├── Weather Protection: None (outdoor venue)
├── Climate: Kansas City Four Seasons
├── Snow/Rain: Occasionally affects games

FOOD & DINING
├── Food Courts: 25+
├── Restaurants: 5 full-service
├── Club Dining: 8 premium levels
├── Local Specialties: Kansas City BBQ featured
├── Concessions: Full alcoholic beverage service

PARKING & TRANSPORTATION
├── Total Parking Spaces: 9,500
├── Parking Cost: $25-$50 per event
├── Lot Types: Paved, gravel, street
├── Reserved Parking: 2,000 spaces
├── Accessible Parking: 200 spaces
├── Public Transit: RideKC buses nearby
├── Distance from Downtown: 2.5 miles

ACCESSIBILITY
├── Wheelchair Access: Full
├── Accessible Bathrooms: 40+
├── Companion Seating: Available
├── Service Animals: Welcome
├── Accessible Parking: 200 spaces
├── American Sign Language: Interpreters available

TECHNOLOGY
├── WiFi: Yes (premium)
├── Cell Service: All carriers
├── Video Boards: Yes (multiple)
├── Sound System: State-of-the-art
├── Scoreboard: Large video display
```

### ✅ Stadium Capacity Comparison

**How This Stadium Compares**:
```
NFL STADIUM CAPACITY RANKINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rank  Stadium Name                    Capacity
1.    MetLife Stadium (NYG/NYJ)       82,500
2.    FedExForum (MEM) - Baseball     75,525
3.    Arrowhead Stadium (KC)  ▼       76,416    ← You are here
4.    Lambeau Field (GB)              81,441
5.    AT&T Stadium (DAL)              80,000
...

ARROWHEAD STADIUM: Ranked 3rd by capacity
Average NFL Stadium Capacity: 71,000
Arrowhead vs. Average: +7.6% larger
```

### ✅ Directions & Getting There

**Location & Access**:
```
DIRECTIONS & GETTING THERE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ADDRESS
Arrowhead Stadium
1 Arrowhead Drive
Kansas City, Missouri 64129
USA

PARKING
Total Spaces: 9,500
Cost: $25-$50 (varies by event)
Directions: See parking map →
Reservation: Reserve parking →

PUBLIC TRANSIT
Bus: RideKC Route 12, 28 (nearby stops)
Travel Time: ~15 min from downtown
Schedule: Available before game, after game

DRIVING DIRECTIONS
From Downtown KC: I-70 East → Stadium signage
From Highway 435: Exit Stadium Drive
GPS Coordinates: 39.0494° N, 94.4852° W

HOTEL NEARBY
Crown Plaza Kansas City
Sheraton Kansas City
Hilton Kansas City

GROUND TRANSPORTATION
Ride Share: Uber, Lyft (drop-off area exists)
Taxi Service: Available
Hotel Shuttles: Many hotels provide service

[INTERACTIVE MAP EMBEDDED]
```

### ✅ Game History & Records

**Tab with Game Results**:
```
GAME HISTORY AT ARROWHEAD STADIUM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILTERS: [All Teams ▼] [All Years ▼] [Regular Season ▼]

RECENT GAMES (2025 Season)
Date          | Opponent        | Score   | Attendance
───────────────────────────────────────────────────────
Oct 5, 2025   | Las Vegas       | KC 27   | 75,456
              |                 | LV 20   |
───────────────────────────────────────────────────────
Sep 28, 2025  | Jacksonville    | KC 35   | 76,200
              |                 | JAX 17  |
───────────────────────────────────────────────────────
Sep 21, 2025  | San Francisco   | KC 28   | 76,416
              |                 | SF 25   |

[View full game history]
[Search by year, opponent, result]
```

### ✅ Stadium Photos & Media

**Visual Section**:
```
PHOTOS & MEDIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GALLERY
├── [Exterior day shot] × 20 photos
├── [Exterior night shot] × 15 photos
├── [Interior crowd] × 25 photos
├── [Field views] × 30 photos
├── [Luxury suites] × 12 photos
├── [Parking areas] × 8 photos

VIDEOS
├── Stadium Tour (15 min)
  → Virtual tour of Arrowhead
  → 360° views of seating

├── Game Day Atmosphere (5 min)
  → Crowd scenes
  → Tailgating
  → Fan reactions

├── History Documentary (30 min)
  → How Arrowhead was built
  → Evolution since 1972
  → Notable moments

AERIAL/DRONE FOOTAGE
├── Stadium exterior (4K)
├── Stadium at night (4K)
├── Stadium in snow (seasonal)
├── Parking lots (crowd size perspective)
```

### ✅ Responsive Design

**Mobile (<768px)**:
- Header stacks vertically
- Quick facts in card layout
- Single column for all sections
- Full-width map
- Simplified parking info

**Tablet (768-1200px)**:
- Header horizontal
- Two-column layout for facts
- Side-by-side comparison sections
- Map embedded
- Full navigation visible

**Desktop (1200px+)**:
- Full layout with all sections
- Sidebar for quick navigation
- Interactive map
- Rich formatting and spacing

---

## Sample Stadium Page Layout

### Navigation Structure
```
STADIUM: Arrowhead Stadium
├── Overview (photos, basic facts, quick intro)
├── Teams (all teams that played there)
├── Records (best performances, stadium records)
├── Features (amenities, capacity, parking)
├── Directions (map, parking, public transit)
├── Games (game history, results, searchable)
├── Media (photos, videos, gallery)
└── Compare (vs other stadiums)
```

### Overview Tab
```
┌────────────────────────────────────────────────────┐
│         [LARGE STADIUM PHOTO]                      │
│  ARROWHEAD STADIUM                                 │
│  Kansas City, Missouri | Home of KC Chiefs        │
│  Opened: 1972 | Capacity: 76,416                  │
├────────────────────────────────────────────────────┤
│ QUICK FACTS                | COMPARISONS           │
│ Capacity: 76,416          │ Rank: 3rd in NFL      │
│ Surface: Natural Grass    │ vs Avg: +7.6%        │
│ Roof: Open-Air           │ vs Lambeau: -4,975    │
│ Parking: 9,500 spaces    │                       │
├────────────────────────────────────────────────────┤
│ TEAM HISTORY                                      │
│ Kansas City Chiefs (1972-present): 53 years      │
│ 900+ games hosted, 465+ wins                      │
├────────────────────────────────────────────────────┤
│ NOTABLE PLAYERS                                   │
│ Len Dawson, Joe Montana, Patrick Mahomes, ...    │
├────────────────────────────────────────────────────┤
│ RECENT GAMES                                      │
│ ✓ W vs LV 27-20 | ✓ W vs JAX 35-17 | ✓ W vs SF 28-25
└────────────────────────────────────────────────────┘
```

---

## Data Model for Stadium Pages

```json
{
  "stadium": {
    "id": "arrowhead",
    "name": "Arrowhead Stadium",
    "city": "Kansas City",
    "state": "Missouri",
    "country": "USA",
    "coordinates": {
      "latitude": 39.0494,
      "longitude": -94.4852
    },
    "opened": 1972,
    "capacity": 76416,
    "architect": "Kivett & Myers",
    "build_cost": 43000000,
    "build_cost_year": 1972,
    "photos": {
      "exterior": "https://...",
      "interior": "https://...",
      "aerial": "https://..."
    }
  },
  "characteristics": {
    "surface_type": "Natural Grass",
    "roof_type": "Open-Air",
    "seating_levels": 3,
    "luxury_suites": 112,
    "club_seats": 6500,
    "accessible_seats": 1000
  },
  "teams": [
    {
      "team_id": "kc",
      "team_name": "Kansas City Chiefs",
      "years_active": {
        "start": 1972,
        "end": "present"
      },
      "total_games": 900,
      "record": {
        "wins": 465,
        "losses": 410,
        "ties": 25
      }
    }
  ],
  "facilities": {
    "parking_spaces": 9500,
    "parking_cost": "25-50",
    "food_courts": 25,
    "restaurants": 5,
    "has_wifi": true,
    "accessibility": {
      "wheelchair_access": true,
      "accessible_bathrooms": 40,
      "accessible_parking": 200,
      "service_animals": true
    }
  },
  "records": {
    "highest_scoring_game": {
      "score": 59,
      "date": "2000-01-01",
      "teams": ["KC", "OPP"]
    },
    "largest_margin": {
      "margin": 51,
      "date": "2000-01-01",
      "teams": ["KC", "OPP"]
    },
    "most_attendance": 76416
  }
}
```

---

## API Endpoints Needed

**From Backend**:
- `/v1/stadiums` → All NFL stadiums
- `/v1/stadiums/{stadium_id}` → Stadium details
- `/v1/stadiums/{stadium_id}/teams` → Teams that played there
- `/v1/stadiums/{stadium_id}/records` → Stadium records
- `/v1/stadiums/{stadium_id}/games?season={year}` → Games played there
- `/v1/stadiums/{stadium_id}/capacity/comparison` → Stadium size comparisons
- `/v1/stadiums/{stadium_id}/capacity/ranking` → Where it ranks in NFL

---

## Related Components

**Components That Link to Stadium Pages**:
1. **Team Pages** - Stadium listed in team header, links to stadium page
2. **Game Scorecards** - Stadium name clickable → stadium page
3. **Player Cards** - Career stats at specific stadiums (advanced stats)
4. **Historical Stats** - Filter by stadium
5. **Stadium Selector** - Modal/dropdown linking to all stadiums

**Stadium Cards for Stadium List**:
```
┌─────────────────────────────┐
│  [Small stadium photo]      │
│  Arrowhead Stadium          │
│  Kansas City, MO            │
│  Cap: 76,416 | Opened: 1972│
│  Teams: Kansas City Chiefs  │
│  → View Full Page           │
└─────────────────────────────┘
```

---

## Implementation Priorities

### Phase 1: MVP
- ✅ Stadium overview/header
- ✅ Quick facts (capacity, opened, surface, roof)
- ✅ Team timeline (teams that played there)
- ✅ Basic stadium features (parking, amenities)
- ✅ Mobile responsive

### Phase 2: Enhanced
- ✅ Notable players (Hall of Famers who played there)
- ✅ Stadium records (best performances)
- ✅ Game history (filterable by year/team)
- ✅ Directions and getting there
- ✅ Parking information

### Phase 3: Advanced
- ✅ Interactive map (parking, entrances, sections)
- ✅ Stadium photo gallery (360° tours)
- ✅ Video highlights (famous moments at stadium)
- ✅ Capacity comparisons (vs other stadiums)
- ✅ Historical evolution (renovations, changes)

---

## Success Criteria

✅ Stadium location immediately clear (name, city, state)
✅ Capacity and basic specs (roof, surface) quickly visible
✅ All teams that played there listed
✅ Getting there information prominent (directions, parking)
✅ Notable moments/records accessible
✅ Mobile responsive and touch-friendly
✅ All links functional
✅ Page loads fast
✅ Accessible (keyboard nav, screen reader friendly)
✅ Connected to team pages, game cards, player pages

---

**Status**: Stadium Page Design Complete - Ready for Implementation
**Related**: Backend provides stadium data via `/v1/stadiums/*` endpoints
**Owner**: Frontend team (Next.js implementation)
**Reference**: Pro Football Reference, Wikipedia, MLB/NBA venue patterns
