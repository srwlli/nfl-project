# Player Milestones Table - Explanation

> **Table**: `player_milestones`
> **Status**: ⚠️ NOT POPULATED (No active scraper)
> **Purpose**: Track significant career achievements and milestones
> **Migration**: 20250101000008_create_game_and_reference_tables.sql (lines 225-243)
> **Date**: October 22, 2025

---

## Purpose

This table tracks **significant career achievements** for NFL players - memorable moments when they reach major statistical milestones.

---

## What Gets Tracked

### Career Cumulative Milestones
- 10,000 career passing yards
- 20,000 career passing yards
- 50,000 career passing yards
- 100 career passing touchdowns
- 300 career passing touchdowns
- 5,000 career rushing yards
- 10,000 career rushing yards
- 100 career rushing touchdowns
- 500 career receptions
- 1,000 career receptions
- 10,000 career receiving yards
- 100 career sacks
- 30 career interceptions

### Single-Season Milestones
- First 1,000 rushing yards season
- First 1,000 receiving yards season
- First 4,000 passing yards season
- First 30 TD season

### Single-Game Achievements
- First career TD
- 3+ TD game
- 300+ yard passing game
- 100+ yard rushing game
- 200+ yard receiving game
- Hat trick (3 TDs in one game)

### Awards & Honors
- Pro Bowl selection (1st, 2nd, 3rd, etc.)
- All-Pro selection
- Rookie of the Year
- MVP award
- Offensive/Defensive Player of the Year

---

## Table Schema

From migration file (lines 225-243):

```sql
CREATE TABLE player_milestones (
    milestone_id SERIAL PRIMARY KEY,
    player_id VARCHAR(50) NOT NULL,
    milestone_type VARCHAR(100) NOT NULL,  -- e.g., "10000_career_rushing_yards"
    milestone_value INTEGER,                -- e.g., 10000
    achieved_date DATE,                     -- When it happened
    achieved_season INTEGER,                -- Which season
    game_id VARCHAR(50),                    -- Which game (if applicable)
    description TEXT,                       -- Human-readable text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    CONSTRAINT fk_player_milestones_player FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);
```

---

## Field Definitions

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| milestone_id | SERIAL | 1 | Primary key |
| player_id | VARCHAR(50) | "espn-3139477" | FK to players table |
| milestone_type | VARCHAR(100) | "10000_career_rushing_yards" | Milestone category |
| milestone_value | INTEGER | 10000 | Numeric threshold (nullable) |
| achieved_date | DATE | "2023-12-03" | When milestone reached |
| achieved_season | INTEGER | 2023 | Which NFL season |
| game_id | VARCHAR(50) | "espn-401547301" | Game where achieved (nullable) |
| description | TEXT | "Derrick Henry becomes 32nd..." | Human-readable description |

---

## Example Records

### Example 1: Career Rushing Milestone

```json
{
  "milestone_id": 1,
  "player_id": "espn-3139477",
  "milestone_type": "10000_career_rushing_yards",
  "milestone_value": 10000,
  "achieved_date": "2023-12-03",
  "achieved_season": 2023,
  "game_id": "espn-401547301",
  "description": "Derrick Henry becomes 32nd player in NFL history to rush for 10,000 career yards"
}
```

### Example 2: Single Game Achievement

```json
{
  "milestone_id": 2,
  "player_id": "espn-3916387",
  "milestone_type": "5_passing_tds_single_game",
  "milestone_value": 5,
  "achieved_date": "2024-09-15",
  "achieved_season": 2024,
  "game_id": "espn-401547123",
  "description": "Patrick Mahomes throws 5 TDs in Chiefs victory over Ravens"
}
```

### Example 3: Award

```json
{
  "milestone_id": 3,
  "player_id": "espn-4040715",
  "milestone_type": "offensive_rookie_of_year",
  "milestone_value": null,
  "achieved_date": "2024-02-08",
  "achieved_season": 2023,
  "game_id": null,
  "description": "CJ Stroud wins NFL Offensive Rookie of the Year"
}
```

---

## Current Status

⚠️ **This table is NOT actively populated** by current scrapers.

### What Would Be Required

1. **Milestone detection algorithm** - Analyze player_season_cumulative_stats to detect when thresholds are crossed
2. **Historical backfill** - Check career stats against milestone criteria
3. **Real-time detection** - After each game, check if any milestones were achieved
4. **Manual entry** - Awards and honors would need manual tracking or API integration

---

## Potential Use Cases

### Frontend Display

**Player profile pages:**
- Career achievements timeline
- Milestone badges
- Historical significance markers

**"Milestone Watch" widget:**
```
🎯 Derrick Henry is 127 yards away from 10,000 career rushing yards
🎯 Justin Jefferson needs 2 more receptions for 500 career catches
🎯 Patrick Mahomes is 1 TD away from 200 career passing TDs
```

**Timeline component:**
```jsx
<PlayerMilestones playerId="espn-3139477">
  <Milestone
    type="10,000 Career Rushing Yards"
    date="December 3, 2023"
    game="vs Ravens"
  />
  <Milestone
    type="2,000 Yards in a Season"
    date="December 29, 2020"
    game="vs Texans"
  />
</PlayerMilestones>
```

---

## Implementation Strategy (If Needed)

### Phase 1: Career Milestone Detection

```javascript
// scripts/detect-milestones.js (hypothetical)

const CAREER_MILESTONES = {
  passing: [10000, 20000, 30000, 40000, 50000, 60000, 70000],
  rushing: [5000, 10000, 15000, 20000],
  receiving: [5000, 10000, 15000],
  touchdowns: [100, 200, 300, 400, 500],
  sacks: [50, 100, 150],
  interceptions: [20, 30, 40, 50]
}

async function detectMilestones(playerId, seasonStats) {
  // Check cumulative stats against thresholds
  // Insert milestone record when threshold crossed
}
```

### Phase 2: Single-Game Detection

```javascript
// In game-stats-scraper.js (after player stats inserted)

async function checkGameMilestones(playerGameStats) {
  if (playerGameStats.passing_yards >= 300) {
    await insertMilestone({
      player_id: playerGameStats.player_id,
      milestone_type: '300_yard_passing_game',
      milestone_value: playerGameStats.passing_yards,
      achieved_date: new Date(),
      game_id: playerGameStats.game_id
    })
  }
}
```

### Phase 3: Awards Integration

Manual entry or API integration with NFL awards announcements.

---

## Related Tables

- `players` - Player profiles (FK: player_id)
- `games` - Game details (FK: game_id)
- `player_season_cumulative_stats` - Career stats for threshold detection
- `player_awards` - Formal awards (separate table)

---

## Why This Table Exists (But Isn't Used)

This table was created as **part of a comprehensive NFL database schema** to support advanced frontend features like:
- Player legacy/hall-of-fame tracking
- Historical significance markers
- Fan engagement ("milestone watch")
- Media content generation

However, **it's not critical** for core stats functionality and requires significant development effort to populate correctly.

---

**Last Updated**: October 22, 2025
**Status**: ⚠️ Schema exists, no data populated
**Priority**: Low (nice-to-have feature)
**Implementation Effort**: Medium-High (requires detection algorithms)
