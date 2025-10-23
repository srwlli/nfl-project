# Stat Categories - Quick Reference Guide

> **Purpose**: Quick reference for stat_categories table (metadata/reference table)
> **Date**: October 22, 2025
> **Status**: ⚠️ EMPTY (Metadata table for UI organization)
> **CodeRef**: Migration 20250101000003:106-120

---

## All 9 Fields (Copy-Paste Ready)

```
category_id, category_name, position_group, stat_type, description, sort_order, created_at, updated_at, deleted_at
```

---

## SELECT Query String

```sql
category_id, category_name, position_group, stat_type, description, sort_order, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 9
- **Total Records**: 0 (⚠️ EMPTY - needs manual population)
- **Expected Records**: ~50-75 stat categories
- **Purpose**: Metadata table to organize/categorize statistical fields
- **Type**: Reference table (not actual stats data)
- **Auto-Populated**: ❌ Requires manual entry

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| category_id | varchar(50) | "passing_yards" | PK, matches column names |
| category_name | varchar(100) | "Passing Yards" | Display name ❌ Required |
| position_group | varchar(20) | "Offense" | CHECK: Offense/Defense/Special Teams ✅ Optional |
| stat_type | varchar(50) | "Counting" | CHECK: Counting/Rate/Advanced ✅ Optional |
| description | text | "Total yards thrown by QB" | Stat explanation ✅ Optional |
| sort_order | integer | 1 | Display order ✅ Optional |
| created_at | timestamp | Auto | ✅ Optional |
| updated_at | timestamp | Auto | ✅ Optional |
| deleted_at | timestamp | null | Soft delete |

---

## CHECK Constraints

### position_group
```sql
CHECK (position_group IN ('Offense', 'Defense', 'Special Teams'))
```

### stat_type
```sql
CHECK (stat_type IN ('Counting', 'Rate', 'Advanced'))
```

---

## What This Table Does

**It's a metadata/dictionary table** that organizes the 75+ statistical columns in `player_game_stats`.

### Without stat_categories:
```javascript
// Hardcoded in frontend
const passingStats = ['passing_yards', 'passing_tds', 'passing_ints']
```

### With stat_categories:
```javascript
// Dynamic from database
const { data: stats } = await supabase
  .from('stat_categories')
  .select('*')
  .eq('position_group', 'Offense')
  .like('category_name', '%Passing%')
  .order('sort_order')
```

---

## Expected Data Examples

### Counting Stats (Volume)

```json
{
  "category_id": "passing_yards",
  "category_name": "Passing Yards",
  "position_group": "Offense",
  "stat_type": "Counting",
  "description": "Total yards thrown by quarterback",
  "sort_order": 1
}
```

```json
{
  "category_id": "rushing_yards",
  "category_name": "Rushing Yards",
  "position_group": "Offense",
  "stat_type": "Counting",
  "description": "Total yards gained on rushing attempts",
  "sort_order": 10
}
```

### Rate Stats (Efficiency)

```json
{
  "category_id": "completion_percentage",
  "category_name": "Completion %",
  "position_group": "Offense",
  "stat_type": "Rate",
  "description": "Percentage of passes completed",
  "sort_order": 5
}
```

```json
{
  "category_id": "yards_per_attempt",
  "category_name": "Yards/Attempt",
  "position_group": "Offense",
  "stat_type": "Rate",
  "description": "Average yards gained per rushing attempt",
  "sort_order": 12
}
```

### Advanced Stats (Analytics)

```json
{
  "category_id": "passer_rating",
  "category_name": "Passer Rating",
  "position_group": "Offense",
  "stat_type": "Advanced",
  "description": "NFL passer rating formula (0-158.3 scale)",
  "sort_order": 8
}
```

```json
{
  "category_id": "epa_per_play",
  "category_name": "EPA/Play",
  "position_group": "Offense",
  "stat_type": "Advanced",
  "description": "Expected Points Added per play",
  "sort_order": 50
}
```

---

## Use Cases

### 1. Dynamic UI Generation

```javascript
// Build stat display sections
const offenseStats = await supabase
  .from('stat_categories')
  .select('*')
  .eq('position_group', 'Offense')
  .order('sort_order')

// Render stats dynamically
offenseStats.forEach(category => {
  renderStatRow(
    category.category_name,
    playerStats[category.category_id]
  )
})
```

### 2. Organize Stats by Type

```javascript
// Show only counting stats
const countingStats = await supabase
  .from('stat_categories')
  .select('*')
  .eq('stat_type', 'Counting')
  .order('sort_order')

// Show only advanced analytics
const advancedStats = await supabase
  .from('stat_categories')
  .select('*')
  .eq('stat_type', 'Advanced')
```

### 3. Position-Specific Stats

```javascript
// Defense stats only
const defenseStats = await supabase
  .from('stat_categories')
  .select('*')
  .eq('position_group', 'Defense')
  .order('sort_order')

// Returns: tackles, sacks, interceptions, etc.
```

---

## Sample Data Population

### Offense - Passing

| category_id | category_name | stat_type | sort_order |
|-------------|---------------|-----------|------------|
| passing_yards | Passing Yards | Counting | 1 |
| passing_tds | Passing TDs | Counting | 2 |
| passing_ints | Interceptions Thrown | Counting | 3 |
| passing_completions | Completions | Counting | 4 |
| completion_percentage | Completion % | Rate | 5 |
| yards_per_attempt | Yards/Attempt | Rate | 6 |
| passer_rating | Passer Rating | Advanced | 7 |

### Offense - Rushing

| category_id | category_name | stat_type | sort_order |
|-------------|---------------|-----------|------------|
| rushing_yards | Rushing Yards | Counting | 10 |
| rushing_tds | Rushing TDs | Counting | 11 |
| rushing_attempts | Rush Attempts | Counting | 12 |
| yards_per_carry | Yards/Carry | Rate | 13 |

### Defense

| category_id | category_name | stat_type | sort_order |
|-------------|---------------|-----------|------------|
| tackles | Tackles | Counting | 20 |
| sacks | Sacks | Counting | 21 |
| interceptions | Interceptions | Counting | 22 |
| passes_defended | Passes Defended | Counting | 23 |

---

## Current Status

**⚠️ TABLE IS EMPTY**

This is a **reference/metadata table** that needs manual population:
- Define all 75+ stat categories from `player_game_stats`
- Assign position groups
- Classify by stat type
- Set display order

**Not critical** for core functionality - stats work fine without this table. It's a UI/UX enhancement for dynamic stat organization.

---

## Common Queries (When Populated)

### Get All Offense Stats

```javascript
const { data: offenseStats } = await supabase
  .from('stat_categories')
  .select('*')
  .eq('position_group', 'Offense')
  .order('sort_order')
```

### Get Counting Stats Only

```javascript
const { data: countingStats } = await supabase
  .from('stat_categories')
  .select('*')
  .eq('stat_type', 'Counting')
  .order('position_group', 'sort_order')
```

### Get Passing Stats

```javascript
const { data: passingStats } = await supabase
  .from('stat_categories')
  .select('*')
  .like('category_id', 'passing_%')
  .order('sort_order')
```

---

## Database Index

```sql
CREATE INDEX idx_stat_categories_position_group
ON stat_categories(position_group)
WHERE deleted_at IS NULL;
```

---

## Related Tables

**Referenced by:**
- `player_game_stats` - The actual stats (this table describes them)
- `player_season_stats` - Season aggregates
- UI/Frontend - For dynamic stat display

**Note**: No foreign keys - this is a pure metadata table

---

## Relationship to Actual Data

```
stat_categories (METADATA)        player_game_stats (ACTUAL DATA)
├─ passing_yards          ────>   passing_yards: 312
├─ passing_tds            ────>   passing_tds: 3
├─ rushing_yards          ────>   rushing_yards: 45
└─ tackles                ────>   tackles: 12
```

This table tells you **what the stats are**.
`player_game_stats` contains **the actual numbers**.

---

## Implementation Notes

### To Populate This Table:

```sql
INSERT INTO stat_categories (category_id, category_name, position_group, stat_type, description, sort_order) VALUES
('passing_yards', 'Passing Yards', 'Offense', 'Counting', 'Total yards thrown by quarterback', 1),
('passing_tds', 'Passing TDs', 'Offense', 'Counting', 'Touchdown passes thrown', 2),
('passing_ints', 'Interceptions', 'Offense', 'Counting', 'Passes intercepted by defense', 3),
-- ... 50+ more stat definitions
```

Or create a seed script: `scripts/seed/06-stat-categories.js`

---

## Documentation Links

- **Migration**: supabase/migrations/20250101000003_create_foundation_tables.sql:106-120
- **Field Mapping**: STAT-CATEGORIES-RESOURCES/field-mapping-report.md
- **Comment**: "Statistical categories for organizing stats"

---

**Last Updated**: October 22, 2025
**Total Fields**: 9
**Total Records**: 0 ⚠️ (EMPTY - needs manual population)
**Status**: ⚠️ Metadata table for UI organization
**CodeRef**: Migration 20250101000003:106-120 ✅ Validated
