# Players Table - Quick Reference Guide

> **Purpose**: Fast reference for all 31 player fields
> **Date**: October 22, 2025
> **Status**: ✅ 100% Normalized

---

## All 31 Field Names (Copy-Paste Ready)

```javascript
player_id
first_name
last_name
full_name
primary_position
secondary_positions
jersey_number
height_inches
weight_lbs
birth_date
birth_city
birth_state
birth_country
college
high_school
draft_year
draft_round
draft_pick
draft_team_id
undrafted
rookie_year
final_year
hof_inducted
hof_induction_year
status
headshot_url
profile_url
metadata
created_at
updated_at
deleted_at
```

---

## Quick Query Strings

### All Fields
```javascript
'player_id, first_name, last_name, full_name, primary_position, secondary_positions, jersey_number, height_inches, weight_lbs, birth_date, birth_city, birth_state, birth_country, college, high_school, draft_year, draft_round, draft_pick, draft_team_id, undrafted, rookie_year, final_year, hof_inducted, hof_induction_year, status, headshot_url, profile_url, metadata, created_at, updated_at, deleted_at'
```

### Essential Fields (Player Card)
```javascript
'player_id, full_name, primary_position, jersey_number, height_inches, weight_lbs, headshot_url'
```

### Bio Fields
```javascript
'full_name, primary_position, jersey_number, height_inches, weight_lbs, birth_date, college, draft_year, draft_round, draft_pick'
```

---

## ⚠️ CRITICAL - Don't Use These Names!

| ❌ WRONG | ✅ CORRECT |
|---------|----------|
| `position` | `primary_position` |
| `height` | `height_inches` |
| `weight` | `weight_lbs` |
| `name` | `full_name` |
| `receiving_receptions` | `receptions` |

---

## Field Categories

### 📌 Identification (4)
- `player_id` - Primary key (e.g., "espn-15818")
- `first_name`, `last_name`, `full_name`

### 🏈 Position (2)
- `primary_position` ⚠️ NOT "position"
- `secondary_positions`

### 📏 Physical (3)
- `jersey_number`
- `height_inches` - Total inches (74 = 6'2")
- `weight_lbs` - Pounds

### 🎂 Birth Info (4)
- `birth_date`, `birth_city`, `birth_state`, `birth_country`

### 🎓 Education (2)
- `college`, `high_school`

### 🎯 Draft (5)
- `draft_year`, `draft_round`, `draft_pick`, `draft_team_id`, `undrafted`

### 🏆 Career (4)
- `rookie_year`, `final_year`, `hof_inducted`, `hof_induction_year`

### 📊 Status (3)
- `status` - Enum: active | injured | inactive | suspended
- `headshot_url`, `profile_url`

### 🔧 Meta (4)
- `metadata`, `created_at`, `updated_at`, `deleted_at`

---

## Data Sources

| Fields | Source | Script |
|--------|--------|--------|
| 22 fields | ESPN API | `player-creator.js` |
| 3 fields | Calculated | (undrafted, hof_inducted, profile_url) |
| 3 fields | Database | (created_at, updated_at, deleted_at) |
| 3 fields | Always NULL | (secondary_positions, high_school, final_year) |

---

## Quick Stats

- **Total Players**: 2,571
- **Total Columns**: 31
- **Primary Key**: `player_id`
- **Top Positions**: WR (127), LB (127), CB (121)

---

## Common Queries

### Get Player by ID
```javascript
.select('*').eq('player_id', 'espn-15818').single()
```

### Get All QBs
```javascript
.select('player_id, full_name, jersey_number')
.eq('primary_position', 'QB')
.order('last_name')
```

### Get Team Roster
```javascript
.select(`
  player_id, full_name, primary_position, jersey_number,
  player_teams!inner(team_id)
`)
.eq('player_teams.team_id', 'SEA')
.is('player_teams.end_season', null)
```

---

## Height Conversion

```javascript
function formatHeight(inches) {
  const feet = Math.floor(inches / 12)
  const remainingInches = inches % 12
  return `${feet}'${remainingInches}"`
}

// Example: 74 → "6'2\""
```

---

## Related Tables

- `player_teams` - Current roster assignments
- `player_game_stats` - Game performance
- `roster_transactions` - Player moves
- `player_injury_status` - Injury reports

---

## Scripts in This Folder

### Analysis & Validation
- `scripts/analyze-players-schema.js` - Analyze players table structure
- `scripts/verify-players-mapping.js` - Verify schema matches mapping
- `scripts/list-missing-players.js` - Find players with missing data

### Data Management
- `scripts/03-players.js` - Initial player seed script
- `scripts/add-missing-players-by-id.js` - Add specific players by ESPN ID
- `scripts/backfill-missing-players.js` - Backfill missing player records

### Utilities
- `utils/player-creator.js` - Core player creation utility (auto-create from ESPN API)

---

## Usage Examples

### Analyze Players Table
```bash
node coderef/FINAL/PLAYERS/scripts/analyze-players-schema.js
```

### Verify Field Mapping
```bash
node coderef/FINAL/PLAYERS/scripts/verify-players-mapping.js
```

### Add Missing Player by ID
```bash
node coderef/FINAL/PLAYERS/scripts/add-missing-players-by-id.js
```

### List Missing Players
```bash
node coderef/FINAL/PLAYERS/scripts/list-missing-players.js
```

---

## More Info

- **Full Mapping**: `field-mapping-report.md` (in this folder)
- **Data Sources**: `raw-data-source-mapping.md` (in this folder)
- **Schema Docs**: `2025-players-table.md` (in this folder)
- **Creation Mechanisms**: `player-creation-mechanisms.md` (in this folder)
