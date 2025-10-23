# Stat Categories Table - Field Mapping Report

> **Purpose**: Complete field mapping for stat_categories metadata table
> **Date**: October 22, 2025
> **Status**: ⚠️ EMPTY (Metadata table for organizing stats)
> **CodeRef**: Migration 20250101000003:106-120

---

## All 9 Fields

```
category_id, category_name, position_group, stat_type, description, sort_order, created_at, updated_at, deleted_at
```

---

## Complete Field Mapping

| Field | Type | Example | Nullable | Constraints | Notes |
|-------|------|---------|----------|-------------|-------|
| category_id | varchar(50) | "passing_yards" | ❌ No | PK | Matches column names in player_game_stats |
| category_name | varchar(100) | "Passing Yards" | ❌ No | - | Display name for UI |
| position_group | varchar(20) | "Offense" | ✅ Yes | CHECK | 'Offense', 'Defense', or 'Special Teams' |
| stat_type | varchar(50) | "Counting" | ✅ Yes | CHECK | 'Counting', 'Rate', or 'Advanced' |
| description | text | "Total yards thrown..." | ✅ Yes | - | Stat explanation |
| sort_order | integer | 1 | ✅ Yes | - | Display order (ascending) |
| created_at | timestamp | Auto | ✅ Yes | DEFAULT | Created timestamp |
| updated_at | timestamp | Auto | ✅ Yes | DEFAULT | Updated timestamp |
| deleted_at | timestamp | null | ✅ Yes | - | Soft delete |

---

## CHECK Constraints

### position_group Constraint

```sql
CHECK (position_group IN ('Offense', 'Defense', 'Special Teams'))
```

**Valid Values:**
- `'Offense'` - Offensive stats (passing, rushing, receiving)
- `'Defense'` - Defensive stats (tackles, sacks, interceptions)
- `'Special Teams'` - Kicking, punting, returns

---

### stat_type Constraint

```sql
CHECK (stat_type IN ('Counting', 'Rate', 'Advanced'))
```

**Valid Values:**
- `'Counting'` - Volume stats (yards, TDs, tackles)
- `'Rate'` - Efficiency stats (yards/attempt, completion %)
- `'Advanced'` - Analytics (passer rating, EPA, WPA)

---

## Database Indexes

```sql
CREATE INDEX idx_stat_categories_position_group
ON stat_categories(position_group)
WHERE deleted_at IS NULL;
```

**Purpose**: Fast filtering by position group (Offense/Defense/Special Teams)

---

## Example Records

### Offense - Counting Stats

```json
[
  {
    "category_id": "passing_yards",
    "category_name": "Passing Yards",
    "position_group": "Offense",
    "stat_type": "Counting",
    "description": "Total yards thrown by quarterback",
    "sort_order": 1
  },
  {
    "category_id": "rushing_yards",
    "category_name": "Rushing Yards",
    "position_group": "Offense",
    "stat_type": "Counting",
    "description": "Total yards gained on rushing attempts",
    "sort_order": 10
  }
]
```

### Offense - Rate Stats

```json
[
  {
    "category_id": "completion_percentage",
    "category_name": "Completion %",
    "position_group": "Offense",
    "stat_type": "Rate",
    "description": "Percentage of passes completed",
    "sort_order": 5
  },
  {
    "category_id": "yards_per_carry",
    "category_name": "Yards/Carry",
    "position_group": "Offense",
    "stat_type": "Rate",
    "description": "Average yards per rushing attempt",
    "sort_order": 12
  }
]
```

### Defense - Counting Stats

```json
[
  {
    "category_id": "tackles",
    "category_name": "Tackles",
    "position_group": "Defense",
    "stat_type": "Counting",
    "description": "Total tackles (solo + assisted)",
    "sort_order": 20
  },
  {
    "category_id": "sacks",
    "category_name": "Sacks",
    "position_group": "Defense",
    "stat_type": "Counting",
    "description": "Quarterback sacks",
    "sort_order": 21
  }
]
```

---

## Field Usage Notes

### category_id

**Purpose**: Unique identifier matching column names in `player_game_stats`

**Format**: snake_case, matches database column names exactly

**Examples:**
- `passing_yards` → `player_game_stats.passing_yards`
- `rushing_tds` → `player_game_stats.rushing_tds`
- `tackles` → `player_game_stats.tackles`

---

### category_name

**Purpose**: Human-readable display name for UI

**Format**: Title Case, user-friendly

**Examples:**
- `passing_yards` → "Passing Yards"
- `completion_percentage` → "Completion %"
- `yards_per_carry` → "Yards/Carry"

---

### position_group

**Purpose**: Group stats by offensive/defensive/special teams

**Usage:**
```javascript
// Get all offense stats
const offenseStats = await supabase
  .from('stat_categories')
  .select('*')
  .eq('position_group', 'Offense')
```

---

### stat_type

**Purpose**: Classify stats by counting/rate/advanced

**Examples by Type:**

**Counting** (volume):
- passing_yards, rushing_yards, receptions
- tackles, sacks, interceptions

**Rate** (efficiency):
- completion_percentage, yards_per_attempt
- yards_per_carry, yards_per_reception

**Advanced** (analytics):
- passer_rating, qbr
- epa_per_play, success_rate

---

### sort_order

**Purpose**: Control display order in UI

**Strategy:**
- Group by position_group first
- Then by stat importance within group
- Increment by 1 or 10 for flexibility

**Example:**
```
1-9:   Passing stats
10-19: Rushing stats
20-29: Receiving stats
30-39: Defense stats
40-49: Kicking stats
50+:   Advanced stats
```

---

## Relationships

### Conceptual Link to player_game_stats

```sql
-- This table defines metadata
SELECT category_id, category_name, stat_type
FROM stat_categories
WHERE position_group = 'Offense';

-- Returns: passing_yards, rushing_yards, etc.

-- Use those IDs to query actual stats
SELECT passing_yards, rushing_yards
FROM player_game_stats
WHERE player_id = 'espn-3139477';
```

**No FK constraint** - this is pure metadata.

---

## Common Queries

### Get Stats by Position Group

```javascript
const { data } = await supabase
  .from('stat_categories')
  .select('*')
  .eq('position_group', 'Offense')
  .order('sort_order')
```

### Get Only Counting Stats

```javascript
const { data } = await supabase
  .from('stat_categories')
  .select('*')
  .eq('stat_type', 'Counting')
  .order('sort_order')
```

### Get Passing Stats Only

```javascript
const { data } = await supabase
  .from('stat_categories')
  .select('*')
  .like('category_id', 'passing_%')
  .order('sort_order')
```

---

## Validation Queries

### Check for Invalid position_group

```sql
-- Should return 0 rows
SELECT * FROM stat_categories
WHERE position_group NOT IN ('Offense', 'Defense', 'Special Teams')
  AND position_group IS NOT NULL;
```

### Check for Invalid stat_type

```sql
-- Should return 0 rows
SELECT * FROM stat_categories
WHERE stat_type NOT IN ('Counting', 'Rate', 'Advanced')
  AND stat_type IS NOT NULL;
```

---

## Implementation Status

**⚠️ EMPTY TABLE**

To populate, create seed script or manual INSERT:

```sql
INSERT INTO stat_categories VALUES
('passing_yards', 'Passing Yards', 'Offense', 'Counting', 'Total yards thrown', 1, NOW(), NOW(), NULL),
('passing_tds', 'Passing TDs', 'Offense', 'Counting', 'Touchdown passes', 2, NOW(), NOW(), NULL),
-- ... 50+ more categories
```

---

## Purpose & Use Case

**This is a metadata table** - it describes the stats, not stores them.

**Without this table:** Frontend hardcodes stat lists
**With this table:** Frontend dynamically builds stat displays from database

**Benefit:** Add new stat categories without code changes

---

**Last Updated**: October 22, 2025
**Total Fields**: 9
**Total Records**: 0 ⚠️ (Needs manual population)
**Status**: ⚠️ Metadata table
**CodeRef**: Migration 20250101000003:106-120
