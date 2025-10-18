# My Ranks - Interactive Player Ranking System

**Purpose:** Complete user-generated NFL player ranking and tier list system
**Audience:** UI/UX Design Team
**Status:** ✅ COMPLETE - Ready for Implementation
**Date:** October 16, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Page Structure](#page-structure)
3. [Tier List Builder](#tier-list-builder)
4. [Ranking Modes](#ranking-modes)
5. [Data Requirements](#data-requirements)
6. [Visual Design Specifications](#visual-design-specifications)
7. [Interactive Features](#interactive-features)
8. [Implementation Guide](#implementation-guide)

---

## 🎯 Overview

### What This Component Does

Creates an **interactive player ranking and tier list builder** that:
- ✅ Allows users to create custom NFL player rankings
- ✅ Drag-and-drop interface for easy tier list building
- ✅ Multiple ranking modes (All-Time, Current, Position-specific)
- ✅ Save, share, and compare rankings with friends
- ✅ Visual tier system (S, A, B, C, D, F)
- ✅ Collaborative features (compare your ranks vs community)
- ✅ Export rankings as image for social media

### Inspiration

**Based on research from:**
- TierMaker (gold standard - 1M+ templates, drag-and-drop)
- Canva Tier List Maker (beautiful design, real-time collaboration)
- Cheatsheet King (fantasy football drag-and-drop rankings)
- PFF Rankings Builder (add tiers, export for draft day)
- BeatADP (custom rankings, platform integration)

**Our Enhancement:** Combine TierMaker's simplicity with PFF's sports focus, add social features and NFL-specific ranking modes

---

## 🏗️ Page Structure

### URL: `/my-ranks`

```
┌────────────────────────────────────────────────────────────────┐
│ MY RANKS                                                       │
│ Create Your NFL Player Rankings                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 1. HEADER                                                │ │
│  │    - Title: "My Ranks"                                   │ │
│  │    - Subtitle: "Create Your NFL Player Rankings"        │ │
│  │    - Action buttons: [New Rank List] [My Lists]         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 2. RANKING MODE SELECTOR                                 │ │
│  │    [All-Time QBs] [All-Time RBs] [All-Time WRs] ...     │ │
│  │    [Current QBs] [Current RBs] [Current WRs] ...         │ │
│  │    [Custom] - Build your own from scratch                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 3. TIER LIST BUILDER                                     │ │
│  │    - Left: Player pool (unranked players)                │ │
│  │    - Right: Tier list (S, A, B, C, D, F tiers)          │ │
│  │    - Drag and drop between pools                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 4. ACTIONS BAR                                           │ │
│  │    [Save] [Share] [Export Image] [Compare] [Reset]      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Tier List Builder

### Layout: Split View (Player Pool + Tier List)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌────────────────────────┐  ┌────────────────────────────────────────────┐ │
│  │   PLAYER POOL          │  │   YOUR TIER LIST                           │ │
│  │   (Unranked)           │  │                                            │ │
│  ├────────────────────────┤  ├────────────────────────────────────────────┤ │
│  │                        │  │ S TIER (GOAT)               [Edit Label]   │ │
│  │ 🔍 Search...           │  │ ┌───┐ ┌───┐ ┌───┐                         │ │
│  │                        │  │ │TB │ │JR │ │LT │                         │ │
│  │ [Filter: All ▼]        │  │ └───┘ └───┘ └───┘                         │ │
│  │ [Sort: Name ▼]         │  │                                            │ │
│  │                        │  │ A TIER (Elite)              [Edit Label]   │ │
│  │ ┌─────────────────┐    │  │ ┌───┐ ┌───┐ ┌───┐ ┌───┐                  │ │
│  │ │ [PHOTO]         │    │  │ │PM │ │WP │ │BO │ │RW │                  │ │
│  │ │ Tom Brady       │◄───┼──┼─┤Drag & drop to tiers                      │ │
│  │ │ QB • Patriots   │    │  │ └───┘ └───┘ └───┘ └───┘                  │ │
│  │ └─────────────────┘    │  │                                            │ │
│  │                        │  │ B TIER (Very Good)          [Edit Label]   │ │
│  │ ┌─────────────────┐    │  │ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐           │ │
│  │ │ [PHOTO]         │    │  │ │BF │ │DF │ │SY │ │TB │ │JM │           │ │
│  │ │ Jerry Rice      │    │  │ └───┘ └───┘ └───┘ └───┘ └───┘           │ │
│  │ │ WR • 49ers      │    │  │                                            │ │
│  │ └─────────────────┘    │  │ C TIER (Good)               [Edit Label]   │ │
│  │                        │  │ ┌───┐ ┌───┐ ┌───┐                         │ │
│  │ ┌─────────────────┐    │  │ │   │ │   │ │   │                         │ │
│  │ │ [PHOTO]         │    │  │ └───┘ └───┘ └───┘                         │ │
│  │ │ Lawrence Taylor │    │  │                                            │ │
│  │ │ LB • Giants     │    │  │ D TIER (Average)            [Edit Label]   │ │
│  │ └─────────────────┘    │  │ ┌───┐ ┌───┐                               │ │
│  │                        │  │ │   │ │   │                               │ │
│  │ [...more players]      │  │ └───┘ └───┘                               │ │
│  │                        │  │                                            │ │
│  │ Remaining: 247/350     │  │ F TIER (Below Average)      [Edit Label]   │ │
│  │                        │  │ ┌───┐                                      │ │
│  └────────────────────────┘  │ │   │                                      │ │
│                              │ └───┘                                      │ │
│                              │                                            │ │
│                              │ [+ Add Custom Tier]                        │ │
│                              └────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Left Panel: Player Pool

**Purpose:** Source of unranked players to drag into tiers

**Features:**
- Search bar (filter by name)
- Position filter (ALL, QB, RB, WR, TE, OL, DL, LB, DB, K/P)
- Team filter (all 32 teams)
- Sort options (Name A-Z, Name Z-A, Position, Team)
- Player count: "Remaining: 247/350"

**Player Card (Small):**
```
┌─────────────────────┐
│  [PHOTO - 60x60]    │
│                     │
│  Player Name        │ ← 16px bold
│  POS • Team         │ ← 12px secondary
│                     │
│  [🏆 3x SB] [👑HOF] │ ← Badges (optional)
└─────────────────────┘
```

**Card Dimensions:**
- Width: 200px
- Height: 120px
- Padding: 12px
- Background: #1a1a1a
- Border: 1px solid #30363d
- Hover: Border becomes #3b82f6 (blue)
- Dragging: Opacity 0.5, cursor grabbing

**Visual States:**
- Default: Dark card (#1a1a1a)
- Hover: Blue border, cursor grab
- Dragging: Semi-transparent, blue glow
- Dropped: Fade out animation from pool

---

### Right Panel: Tier List

**Purpose:** Organized tiers where users rank players

**Default Tiers (Customizable):**

| Tier | Label | Color | Description |
|------|-------|-------|-------------|
| S | GOAT | #ef4444 (Red) | Greatest of All Time |
| A | Elite | #f59e0b (Orange) | Top-tier, HOF-caliber |
| B | Very Good | #eab308 (Yellow) | Pro Bowl level |
| C | Good | #10b981 (Green) | Solid starters |
| D | Average | #3b82f6 (Blue) | Average/below average |
| F | Below Average | #6b7280 (Gray) | Replacement level |

**Tier Row Specifications:**

```
┌────────────────────────────────────────────────────────────┐
│ S TIER (GOAT)                              [Edit] [Delete] │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐                 │
│  │ TB │  │ JR │  │ LT │  │ JB │  │ PM │  ...             │
│  └────┘  └────┘  └────┘  └────┘  └────┘                 │
│                                                            │
│  Drop players here or arrange order                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Tier Row Design:**
- Height: 140px (min), expands with players
- Background: Tier color at 10% opacity (e.g., rgba(239, 68, 68, 0.1) for S tier)
- Border-left: 4px solid tier color
- Label: 18px bold, tier color
- Edit button: Change label text
- Delete button: Remove tier (moves players back to pool)

**Player Chip (In Tier):**
```
┌──────┐
│ [PH] │ ← Photo (48x48 circular)
│      │
│  TB  │ ← Initials (if photo unavailable)
│      │
│ Brady│ ← Last name (10px)
└──────┘
```

**Chip Dimensions:**
- Width: 80px
- Height: 100px
- Padding: 8px
- Background: #1a1a1a
- Border-radius: 8px
- Photo: 48x48px circular
- Name: 10px below photo
- Draggable: Can reorder within tier or move to different tier

**Visual States:**
- Default: Dark chip
- Hover: Lift 2px, cursor grab
- Dragging: Opacity 0.7, blue glow
- Drop target: Green glow on tier row

---

### Tier Interactions

**1. Add Custom Tier**
- Click "[+ Add Custom Tier]" button at bottom
- Modal appears: "Tier Name:", "Color:", "Position:"
- User creates custom tier (e.g., "Hall of Very Good" in Purple)

**2. Edit Tier Label**
- Click "[Edit]" button next to tier name
- Inline edit: Change "S TIER (GOAT)" → "S TIER (Legends)"
- Press Enter to save

**3. Delete Tier**
- Click "[Delete]" button next to tier name
- Confirmation: "Move X players back to pool?"
- All players in tier return to unranked pool

**4. Reorder Tiers**
- Drag tier by handle (☰ icon)
- Move tier up/down in list
- Example: Move "B TIER" above "A TIER" if desired

---

## 🎮 Ranking Modes

### Mode Selection (Top of Page)

```
┌──────────────────────────────────────────────────────────────┐
│ Choose a Ranking Mode:                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ALL-TIME RANKINGS                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │    🏈    │ │    🏃    │ │    🎯    │ │    💪    │       │
│  │ All-Time │ │ All-Time │ │ All-Time │ │ All-Time │       │
│  │   QBs    │ │   RBs    │ │   WRs    │ │   TEs    │       │
│  │ (350)    │ │ (280)    │ │ (320)    │ │ (180)    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │    🛡️    │ │    💥    │ │    🏅    │ │    ⚡    │       │
│  │ All-Time │ │ All-Time │ │ All-Time │ │ All-Time │       │
│  │   OL     │ │   DL     │ │   LB     │ │   DB     │       │
│  │ (240)    │ │ (260)    │ │ (250)    │ │ (280)    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  CURRENT SEASON (2025)                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Current  │ │ Current  │ │ Current  │ │ Current  │       │
│  │   QBs    │ │   RBs    │ │   WRs    │ │   TEs    │       │
│  │ (32)     │ │ (64)     │ │ (96)     │ │ (48)     │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  CUSTOM RANKINGS                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │ Custom   │ │ My Team  │ │ Rookies  │                    │
│  │ Mix      │ │ (32)     │ │ 2025     │                    │
│  │ (Any)    │ │ Chiefs   │ │ (256)    │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Mode Categories

#### 1. **All-Time Rankings** 🏆

Rank the greatest players in NFL history by position.

**Available Modes:**
- All-Time QBs (350 players) - Brady, Montana, Manning, etc.
- All-Time RBs (280 players) - Emmitt Smith, Barry Sanders, Walter Payton
- All-Time WRs (320 players) - Jerry Rice, Randy Moss, Calvin Johnson
- All-Time TEs (180 players) - Tony Gonzalez, Rob Gronkowski, Antonio Gates
- All-Time OL (240 players) - Anthony Munoz, Bruce Matthews, Larry Allen
- All-Time DL (260 players) - Reggie White, Bruce Smith, Aaron Donald
- All-Time LB (250 players) - Lawrence Taylor, Ray Lewis, Dick Butkovich
- All-Time DB (280 players) - Deion Sanders, Rod Woodson, Ed Reed

**Player Pool:**
- All HOF players at position
- All-Pro players (1st/2nd team)
- Pro Bowl players (5+ selections)
- Notable players with 8+ year careers

**Data Source:**
- `hall_of_fame_inductees.json` (HOF players)
- `all_time_greats.json` (manually curated list)
- Player stats from `player_stats_*.parquet` (career totals)

---

#### 2. **Current Season (2025)** 📅

Rank active players in the 2025 NFL season.

**Available Modes:**
- Current QBs (32 starting QBs)
- Current RBs (64 top RBs - RB1/RB2 on each team)
- Current WRs (96 top WRs - Top 3 per team)
- Current TEs (48 top TEs - Top 1-2 per team)
- Current EDGE (48 top pass rushers)
- Current LBs (48 top linebackers)
- Current CBs (64 top corners)
- Current Safeties (48 top safeties)

**Player Pool:**
- All active 2025 players at position
- Sorted by 2025 stats/performance
- Can filter by team, division

**Data Source:**
- `player_stats_2025.parquet` (current season stats)
- `depth_chart_2025.parquet` (current rosters)

---

#### 3. **Custom Rankings** ✏️

Build your own custom ranking list from scratch.

**Available Modes:**

**a) Custom Mix**
- Choose any players from any position/era
- Example: "Top 50 NFL Players of All Time"
- Start with empty pool, add players manually

**b) My Team Rankings**
- Rank players from your favorite team
- Example: "All-Time Chiefs" or "2025 Chiefs Roster"
- Choose team → Auto-populate with team players

**c) Rookie Rankings**
- Rank all rookies from a draft class
- Example: "2025 NFL Draft Class Rankings"
- Choose year → Auto-populate with rookies

**d) Decade Rankings**
- Rank best players from a specific decade
- Example: "Best Players of the 2010s"
- Choose decade → Auto-populate with players

**e) Head-to-Head**
- Compare two specific players
- Example: "Brady vs. Montana - Who's Better?"
- Choose 2 players → Simple A/B ranking

---

## 💾 Data Requirements

### Player Data Structure

**`ranking_players.json`** (Master list of all rankable players)

```json
{
  "all_time_qbs": [
    {
      "id": "brady_tom",
      "name": "Tom Brady",
      "first_name": "Tom",
      "last_name": "Brady",
      "position": "QB",
      "primary_team": "New England Patriots",
      "photo_url": "/images/players/brady_tom.jpg",
      "career_start": 2000,
      "career_end": 2022,
      "is_hof": true,
      "is_active": false,
      "badges": ["hof", "7x_sb", "5x_sb_mvp", "3x_mvp"],
      "stats": {
        "games": 335,
        "pass_yards": 89214,
        "pass_tds": 649,
        "super_bowls": 7
      },
      "legacy_rank": 1,
      "community_avg_rank": 1.2
    },
    {
      "id": "manning_peyton",
      "name": "Peyton Manning",
      "first_name": "Peyton",
      "last_name": "Manning",
      "position": "QB",
      "primary_team": "Indianapolis Colts",
      "photo_url": "/images/players/manning_peyton.jpg",
      "career_start": 1998,
      "career_end": 2015,
      "is_hof": true,
      "is_active": false,
      "badges": ["hof", "2x_sb", "5x_mvp"],
      "stats": {
        "games": 266,
        "pass_yards": 71940,
        "pass_tds": 539,
        "super_bowls": 2
      },
      "legacy_rank": 2,
      "community_avg_rank": 2.8
    }
  ],
  "current_qbs_2025": [
    {
      "id": "mahomes_patrick",
      "name": "Patrick Mahomes",
      "first_name": "Patrick",
      "last_name": "Mahomes",
      "position": "QB",
      "primary_team": "Kansas City Chiefs",
      "photo_url": "/images/players/mahomes_patrick.jpg",
      "career_start": 2017,
      "career_end": null,
      "is_hof": false,
      "is_active": true,
      "badges": ["3x_sb", "2x_mvp", "3x_sb_mvp"],
      "stats_2025": {
        "games": 16,
        "pass_yards": 4800,
        "pass_tds": 38,
        "completion_pct": 67.2
      },
      "legacy_rank": null,
      "community_avg_rank": 1.1
    }
  ]
}
```

**Fields Explained:**
- `id`: Unique identifier (lastname_firstname)
- `name`: Full name for display
- `first_name/last_name`: For initials and sorting
- `position`: QB, RB, WR, TE, OL, DL, LB, DB, K, P
- `primary_team`: Main team associated with
- `photo_url`: Path to player headshot
- `career_start/end`: Years active (null if current)
- `is_hof`: Hall of Fame status
- `is_active`: Currently playing (2025 season)
- `badges`: Array of achievement badges
- `stats`: Career stats object (position-specific)
- `stats_2025`: Current season stats (if active)
- `legacy_rank`: Expert consensus rank (if applicable)
- `community_avg_rank`: Average rank from all user lists

---

### User Rankings Data Structure

**`user_rankings.json`** (Saved user tier lists)

```json
{
  "user_id": "user_12345",
  "rankings": [
    {
      "rank_id": "rank_001",
      "name": "My All-Time QBs",
      "mode": "all_time_qbs",
      "created_at": "2025-10-16T10:30:00Z",
      "updated_at": "2025-10-16T11:45:00Z",
      "is_public": true,
      "views": 127,
      "likes": 45,
      "tiers": [
        {
          "tier_id": "S",
          "label": "GOAT",
          "color": "#ef4444",
          "position": 0,
          "players": [
            "brady_tom",
            "montana_joe",
            "manning_peyton"
          ]
        },
        {
          "tier_id": "A",
          "label": "Elite",
          "color": "#f59e0b",
          "position": 1,
          "players": [
            "rodgers_aaron",
            "elway_john",
            "marino_dan",
            "favre_brett"
          ]
        },
        {
          "tier_id": "B",
          "label": "Very Good",
          "color": "#eab308",
          "position": 2,
          "players": [
            "brees_drew",
            "young_steve",
            "aikman_troy"
          ]
        }
      ],
      "unranked_count": 287
    },
    {
      "rank_id": "rank_002",
      "name": "Current QBs 2025",
      "mode": "current_qbs",
      "created_at": "2025-10-15T14:20:00Z",
      "updated_at": "2025-10-15T14:50:00Z",
      "is_public": false,
      "views": 0,
      "likes": 0,
      "tiers": [
        {
          "tier_id": "S",
          "label": "MVP Caliber",
          "color": "#ef4444",
          "position": 0,
          "players": [
            "mahomes_patrick",
            "allen_josh",
            "jackson_lamar"
          ]
        }
      ],
      "unranked_count": 29
    }
  ]
}
```

---

## 🎨 Visual Design Specifications

### Color Palette (Tier Colors)

```css
:root {
  /* Default Tier Colors */
  --tier-s-color: #ef4444;     /* Red - GOAT */
  --tier-a-color: #f59e0b;     /* Orange - Elite */
  --tier-b-color: #eab308;     /* Yellow - Very Good */
  --tier-c-color: #10b981;     /* Green - Good */
  --tier-d-color: #3b82f6;     /* Blue - Average */
  --tier-f-color: #6b7280;     /* Gray - Below Average */

  /* Tier Backgrounds (10% opacity) */
  --tier-s-bg: rgba(239, 68, 68, 0.1);
  --tier-a-bg: rgba(245, 158, 11, 0.1);
  --tier-b-bg: rgba(234, 179, 8, 0.1);
  --tier-c-bg: rgba(16, 185, 129, 0.1);
  --tier-d-bg: rgba(59, 130, 246, 0.1);
  --tier-f-bg: rgba(107, 114, 128, 0.1);

  /* Interface Colors */
  --bg-primary: #0a0a0a;       /* Page background */
  --bg-secondary: #1a1a1a;     /* Cards, panels */
  --border-color: #30363d;     /* Borders */
  --text-primary: #ffffff;     /* Main text */
  --text-secondary: #cccccc;   /* Secondary text */

  /* Interaction Colors */
  --hover-color: #3b82f6;      /* Blue on hover */
  --drag-color: #10b981;       /* Green when dragging */
  --drop-zone-color: #10b981;  /* Green drop zone */
}
```

### Typography

```css
/* My Ranks Typography */
.rank-title {
  font-family: Inter, system-ui, sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
}

.tier-label {
  font-family: Inter, system-ui, sans-serif;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.player-name {
  font-family: Inter, system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.player-meta {
  font-family: Inter, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: var(--text-secondary);
}
```

### Animations

```css
/* Drag and Drop Animations */
@keyframes drag-start {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.95); opacity: 0.7; }
}

.dragging {
  animation: drag-start 0.2s ease;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5);
  cursor: grabbing;
}

/* Drop Zone Highlight */
@keyframes drop-zone-pulse {
  0%, 100% { background-color: rgba(16, 185, 129, 0.1); }
  50% { background-color: rgba(16, 185, 129, 0.2); }
}

.drop-zone-active {
  animation: drop-zone-pulse 1s infinite;
  border: 2px dashed var(--drop-zone-color);
}

/* Player Card Hover */
.player-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  border-color: var(--hover-color);
  cursor: grab;
}

/* Tier Add Animation */
@keyframes tier-add {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.tier-new {
  animation: tier-add 0.3s ease;
}

/* Save Success */
@keyframes save-success {
  0%, 100% { background-color: #10b981; }
  50% { background-color: #059669; }
}

.save-button-success {
  animation: save-success 0.5s ease;
}
```

---

## 🎮 Interactive Features

### 1. Drag and Drop

**Functionality:**
- Drag player from pool → Drop in tier
- Drag player within tier → Reorder position
- Drag player between tiers → Move to different tier
- Drag player from tier → Drop back in pool

**Visual Feedback:**
- Grab cursor on hover
- Grabbing cursor while dragging
- Semi-transparent while dragging (opacity 0.7)
- Blue glow around dragged item
- Green glow on valid drop zone
- Red X on invalid drop zone

**Implementation:**
- Use HTML5 Drag and Drop API
- OR use library (react-beautiful-dnd, dnd-kit, react-dnd)

---

### 2. Search & Filter

**Search Bar:**
- Type player name → Filter player pool
- Autocomplete suggestions
- Clear button (X)

**Position Filter:**
- Dropdown: ALL, QB, RB, WR, TE, OL, DL, LB, DB, K/P
- Shows count per position: "QB (32)"
- Multi-select option (Ctrl+click)

**Team Filter:**
- Dropdown: All 32 teams
- Shows count per team: "Patriots (8)"

**Sort Options:**
- Name (A-Z)
- Name (Z-A)
- Position
- Team
- Legacy Rank (expert consensus)
- Community Rank (user average)

---

### 3. Save & Load

**Save Ranking:**
- Click [Save] button
- Modal: "Name Your Ranking:"
- Input: "My All-Time QBs"
- Checkbox: "Make Public" (share with community)
- Save to user account (localStorage or database)

**Load Ranking:**
- Click [My Lists] button
- Shows list of saved rankings
- Click to load → Replaces current tier list
- Option to duplicate/edit/delete

**Auto-Save:**
- Save draft every 30 seconds
- Show "Saving..." indicator
- Show "Last saved: 2 minutes ago"

---

### 4. Share & Export

**Share Link:**
- Click [Share] button
- Generate unique URL: `/my-ranks/view/abc123`
- Copy to clipboard
- Share on social media (Twitter, Reddit, Discord)

**Export as Image:**
- Click [Export Image] button
- Render tier list as PNG/JPEG
- Download to device
- Size: 1920x1080 (optimized for social media)
- Includes watermark: "Made with [YourAppName]"

**Export as Text:**
- Click [Export Text] button
- Copy tier list as formatted text:
```
MY ALL-TIME QBs

S TIER (GOAT)
- Tom Brady
- Joe Montana
- Peyton Manning

A TIER (Elite)
- Aaron Rodgers
- John Elway
- Dan Marino

[...]
```

---

### 5. Compare Rankings

**Compare with Community:**
- Click [Compare] button
- Shows your ranking vs community average
- Highlight differences:
  - Green: You ranked higher than community
  - Red: You ranked lower than community
  - Gray: Same as community

**Compare with Friend:**
- Enter friend's username or share link
- Side-by-side comparison
- Show agreement %: "You agree on 72% of rankings"

---

### 6. Undo/Redo

**Undo Last Action:**
- Keyboard: Ctrl+Z (Windows) or Cmd+Z (Mac)
- Button: [Undo ↶] in actions bar
- Undo stack: Last 20 actions

**Redo Action:**
- Keyboard: Ctrl+Y or Ctrl+Shift+Z
- Button: [Redo ↷] in actions bar

---

### 7. Reset Ranking

**Reset Button:**
- Click [Reset] button
- Confirmation: "Clear all tiers? This cannot be undone."
- Moves all players back to pool
- Clears all custom tiers

---

## 🛠️ Implementation Guide

### Phase 1: Core UI (Week 1)

**Goal:** Build basic tier list interface

**Tasks:**
1. Create `MyRanksPage.tsx` component
2. Create `PlayerPool.tsx` component (left panel)
3. Create `TierList.tsx` component (right panel)
4. Create `PlayerCard.tsx` component (small card)
5. Create `PlayerChip.tsx` component (tier chip)
6. Create `TierRow.tsx` component (S, A, B, C, D, F tiers)
7. Implement basic layout (split view)

**Deliverables:**
- Basic UI structure working
- Static player cards (no drag-and-drop yet)
- Tier rows displaying correctly

---

### Phase 2: Drag and Drop (Week 2)

**Goal:** Add drag-and-drop functionality

**Tasks:**
1. Choose drag-and-drop library (react-beautiful-dnd or dnd-kit)
2. Make PlayerCard draggable from pool
3. Make TierRow a drop zone
4. Implement drag from pool → tier
5. Implement drag within tier (reorder)
6. Implement drag between tiers
7. Implement drag from tier → pool (remove)
8. Add visual feedback (hover, dragging, drop zones)

**Deliverables:**
- Full drag-and-drop working
- Visual feedback complete
- Smooth animations

---

### Phase 3: Ranking Modes (Week 3)

**Goal:** Add ranking mode selection and data

**Tasks:**
1. Create `ranking_players.json` data file
2. Populate with All-Time QBs (350 players)
3. Populate with Current QBs 2025 (32 players)
4. Create mode selector UI
5. Implement mode switching (loads different player pools)
6. Add 8 all-time modes (QB, RB, WR, TE, OL, DL, LB, DB)
7. Add current season modes

**Deliverables:**
- All ranking modes functional
- Player data complete for all modes
- Mode switching working

---

### Phase 4: Save, Share, Export (Week 4)

**Goal:** Add persistence and sharing features

**Tasks:**
1. Implement save ranking (localStorage)
2. Implement load ranking ("My Lists")
3. Implement auto-save (every 30s)
4. Implement share link generation
5. Implement export as image (html-to-image library)
6. Implement export as text
7. Create public ranking view page (`/my-ranks/view/:id`)

**Deliverables:**
- Save/load working
- Share links functional
- Export to image working

---

### Phase 5: Advanced Features (Week 5)

**Goal:** Add search, filters, compare, undo/redo

**Tasks:**
1. Implement search bar with autocomplete
2. Implement position filter
3. Implement team filter
4. Implement sort options
5. Implement compare with community
6. Implement undo/redo (action history)
7. Implement custom tiers (add/edit/delete)
8. Polish animations and UX

**Deliverables:**
- All filters working
- Compare feature functional
- Undo/redo working
- Final polish complete

---

## 📊 Component Hierarchy

```
My Ranks System
│
├── /my-ranks (Main Page)
│   ├── MyRanksPage.tsx (Main container)
│   │   ├── PageHeader.tsx (Title + action buttons)
│   │   ├── ModeSelector.tsx (Choose ranking mode)
│   │   ├── RankBuilder.tsx (Split view container)
│   │   │   ├── PlayerPool.tsx (Left panel)
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   ├── PlayerCard.tsx (repeating)
│   │   │   │   └── PlayerCount.tsx
│   │   │   │
│   │   │   └── TierList.tsx (Right panel)
│   │   │       ├── TierRow.tsx (repeating)
│   │   │       │   ├── TierHeader.tsx (label + actions)
│   │   │       │   └── PlayerChip.tsx (repeating)
│   │   │       │
│   │   │       └── AddTierButton.tsx
│   │   │
│   │   └── ActionsBar.tsx (Save, Share, Export, etc.)
│   │
│   └── Modals/
│       ├── SaveRankingModal.tsx
│       ├── LoadRankingModal.tsx
│       ├── ShareModal.tsx
│       └── CompareModal.tsx
│
├── /my-ranks/view/:id (Public View)
│   └── PublicRankingView.tsx (Read-only tier list)
│
├── hooks/
│   ├── useRankingData.ts (Fetch player data)
│   ├── useDragDrop.ts (Drag-and-drop logic)
│   ├── useRankingState.ts (Tier list state management)
│   ├── useAutoSave.ts (Auto-save logic)
│   └── useUndoRedo.ts (Action history)
│
└── utils/
    ├── exportToImage.ts (Export tier list as PNG)
    ├── exportToText.ts (Export tier list as text)
    └── shareRanking.ts (Generate share link)
```

---

## 📋 UI Team Checklist

### Design Tasks

- [ ] Design page layout (split view)
- [ ] Design player card (pool)
- [ ] Design player chip (tier)
- [ ] Design tier row (S, A, B, C, D, F)
- [ ] Design mode selector cards
- [ ] Design search bar
- [ ] Design filter dropdowns
- [ ] Design actions bar (Save, Share, etc.)
- [ ] Design modals (Save, Load, Share, Compare)
- [ ] Design drag-and-drop states (hover, dragging, drop zone)
- [ ] Design export image template
- [ ] Design public ranking view page

### Development Tasks

- [ ] Create `ranking_players.json` data file
- [ ] Build `MyRanksPage.tsx` component
- [ ] Build `PlayerPool.tsx` component
- [ ] Build `TierList.tsx` component
- [ ] Build `PlayerCard.tsx` component
- [ ] Build `PlayerChip.tsx` component
- [ ] Build `TierRow.tsx` component
- [ ] Implement drag-and-drop (library integration)
- [ ] Implement mode selector
- [ ] Implement search and filters
- [ ] Implement save/load (localStorage)
- [ ] Implement share link generation
- [ ] Implement export to image
- [ ] Implement compare with community
- [ ] Implement undo/redo
- [ ] Create public ranking view page

### Data Tasks

- [ ] Curate All-Time QBs list (350 players)
- [ ] Curate All-Time RBs list (280 players)
- [ ] Curate All-Time WRs list (320 players)
- [ ] Curate All-Time TEs list (180 players)
- [ ] Curate All-Time OL list (240 players)
- [ ] Curate All-Time DL list (260 players)
- [ ] Curate All-Time LB list (250 players)
- [ ] Curate All-Time DB list (280 players)
- [ ] Import Current 2025 players from backend
- [ ] Download all player photos
- [ ] Calculate legacy ranks (expert consensus)
- [ ] Calculate community avg ranks (seed with defaults)

### Testing Tasks

- [ ] Test drag-and-drop (pool → tier)
- [ ] Test drag-and-drop (tier → tier)
- [ ] Test drag-and-drop (tier → pool)
- [ ] Test reordering within tiers
- [ ] Test search functionality
- [ ] Test all filters (position, team, sort)
- [ ] Test save/load rankings
- [ ] Test share link generation
- [ ] Test export to image
- [ ] Test compare with community
- [ ] Test undo/redo (20 actions)
- [ ] Test custom tier creation
- [ ] Test mobile responsive design
- [ ] Performance test with 350 players

---

## 🎯 Success Criteria

### My Ranks Page Complete When:

- ✅ Split view layout working (player pool + tier list)
- ✅ Drag-and-drop fully functional (all directions)
- ✅ All ranking modes available (8 all-time + current + custom)
- ✅ Search and filters working
- ✅ Save/load rankings working
- ✅ Share link generation working
- ✅ Export to image working (1920x1080 PNG)
- ✅ Compare with community working
- ✅ Undo/redo working (20 actions)
- ✅ Custom tiers can be created/edited/deleted
- ✅ Mobile responsive design
- ✅ Fast performance (smooth drag-and-drop)
- ✅ Auto-save every 30 seconds

---

## 💡 Future Enhancements

### Phase 6+ (Post-Launch)

**Advanced Features:**
1. **Tournament Bracket** - Rank via head-to-head elimination
2. **AI Suggestions** - "You ranked Brady #1. Consider ranking Montana higher based on..."
3. **Video Highlights** - Watch player highlights while ranking
4. **Live Debates** - Real-time ranking with friends (multiplayer)
5. **Ranking Badges** - Earn badges for completing rankings ("All-Time Master")
6. **Leaderboards** - "Most Popular Rankings This Week"
7. **Import/Export** - Import from ESPN, PFF, or other sites
8. **Voice Ranking** - "Alexa, add Tom Brady to S tier"
9. **Mobile App** - Native iOS/Android app
10. **Public Voting** - Community votes on best user ranking

---

## 🎉 Final Notes for UI Team

### Why This Matters

Ranking systems are **highly engaging** and **social**. Users love:
- ✅ Expressing opinions (hot takes, debates)
- ✅ Comparing with friends (who's right?)
- ✅ Sharing on social media (generating discussions)
- ✅ Revisiting and updating rankings over time
- ✅ Building personal sports history knowledge

### Key Design Principles

1. **Intuitive Drag-and-Drop** - Must feel smooth and responsive
2. **Visual Clarity** - Tier colors and labels clearly differentiated
3. **Fast Performance** - No lag with 350 players
4. **Easy Sharing** - One-click share and export
5. **Non-Destructive** - Auto-save and undo/redo prevent data loss

### What Makes This Component Great

1. **Multiple Modes** - All-time, current, custom (endless content)
2. **Social by Default** - Share, compare, export for social media
3. **Beautiful Design** - Tier colors, smooth animations, premium feel
4. **Data-Rich** - Player stats, badges, photos make informed rankings
5. **Addictive Loop** - Complete one ranking → Want to do another
6. **Community Features** - Compare with friends and community

---

**Document Status:** ✅ COMPLETE - Ready for UI Team

**Components:** 15+ React components
**Data Required:** ~2,000 players across all modes (curated lists)
**Estimated Implementation:** 5 weeks
**MVP Timeline:** 2-3 weeks (All-Time QBs + Current QBs + basic features)

**Created:** October 16, 2025
**Purpose:** Interactive player ranking and tier list builder
**Next Step:** Phase 1 - Build core UI with static data
