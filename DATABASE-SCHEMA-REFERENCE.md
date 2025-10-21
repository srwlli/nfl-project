# Database Schema Reference

> 🎯 **CRITICAL**: Always verify column names against this reference before writing queries!

## Purpose

This document provides **exact column names** for all database tables to prevent schema-related errors. All future agents and developers MUST consult this reference when writing queries.

## Quick Reference Files

- **📄 JSON Format**: `coderef/schema-reference.json` - Programmatic access (notes which scripts use which tables)
- **📋 Markdown**: This file - Human-readable documentation
- **🔄 Auto-Generated**: `coderef/training/database-schema-map.json` - Live database schema dump

**Update schema:** `npm run schema:map`

---

## ⚠️ Common Mistakes

### Column Name Mismatches (DO NOT DO THIS):
```javascript
// ❌ WRONG - This column doesn't exist
.select('receiving_receptions')

// ✅ CORRECT - Actual column name
.select('receptions')
```

### Always Verify Schema First:
```javascript
// Before writing a new script, run this query to verify column names:
const { data, error } = await supabase
  .from('player_game_stats')
  .select('*')
  .limit(1)

console.log('Available columns:', Object.keys(data[0]))
```

---

## Tables & Column Definitions

### `player_game_stats` (Most Complex Table)

**Primary Keys:**
- `player_id` (VARCHAR) - Player identifier (e.g., 'espn-3052587')
- `game_id` (VARCHAR) - Game identifier (e.g., 'espn-401772816')
- `season` (INTEGER) - Season year (e.g., 2025)

**Team/Position Info:**
- `team_id` (VARCHAR) - Team abbreviation (e.g., 'TB', 'DET')
- `position` (VARCHAR) - Player position (e.g., 'QB', 'RB', 'WR', 'TE')

**Passing Stats:**
- `passing_attempts` (INTEGER)
- `passing_completions` (INTEGER)
- `passing_yards` (INTEGER)
- `passing_touchdowns` (INTEGER)
- `passing_interceptions` (INTEGER)
- `passing_sacks` (INTEGER)
- `passing_sack_yards` (INTEGER)
- `passing_rating` (DECIMAL)
- `passing_qbr` (DECIMAL)
- `passing_completion_percentage` (DECIMAL)
- `passing_yards_per_attempt` (DECIMAL)
- `passing_first_downs` (INTEGER)
- `passing_long` (INTEGER)
- `passing_two_point_conversions` (INTEGER)

**Rushing Stats:**
- `rushing_attempts` (INTEGER)
- `rushing_yards` (INTEGER)
- `rushing_touchdowns` (INTEGER)
- `rushing_long` (INTEGER)
- `rushing_yards_per_attempt` (DECIMAL)
- `rushing_first_downs` (INTEGER)
- `rushing_fumbles` (INTEGER)
- `rushing_fumbles_lost` (INTEGER)
- `rushing_two_point_conversions` (INTEGER)

**Receiving Stats:**
- `receiving_targets` (INTEGER)
- `receptions` (INTEGER) ⚠️ **NOT `receiving_receptions`**
- `receiving_yards` (INTEGER)
- `receiving_touchdowns` (INTEGER)
- `receiving_long` (INTEGER)
- `receiving_yards_per_reception` (DECIMAL)
- `receiving_first_downs` (INTEGER)
- `receiving_fumbles` (INTEGER)
- `receiving_fumbles_lost` (INTEGER)
- `receiving_yards_after_catch` (INTEGER)
- `receiving_two_point_conversions` (INTEGER)

**Defensive Stats:**
- `defensive_tackles` (INTEGER)
- `defensive_solo_tackles` (INTEGER)
- `defensive_assists` (INTEGER)
- `defensive_sacks` (DECIMAL)
- `defensive_tackles_for_loss` (INTEGER)
- `defensive_qb_hits` (INTEGER)
- `defensive_interceptions` (INTEGER)
- `defensive_interception_yards` (INTEGER)
- `defensive_interception_touchdowns` (INTEGER)
- `defensive_passes_defended` (INTEGER)
- `defensive_fumbles_forced` (INTEGER)
- `defensive_fumbles_recovered` (INTEGER)
- `defensive_fumble_return_yards` (INTEGER)
- `defensive_fumble_return_touchdowns` (INTEGER)
- `defensive_safeties` (INTEGER)

**Kicking Stats:**
- `kicking_field_goals_made` (INTEGER)
- `kicking_field_goals_attempted` (INTEGER)
- `kicking_field_goal_percentage` (DECIMAL)
- `kicking_long` (INTEGER)
- `kicking_extra_points_made` (INTEGER)
- `kicking_extra_points_attempted` (INTEGER)

**Punting Stats:**
- `punting_punts` (INTEGER)
- `punting_yards` (INTEGER)
- `punting_average` (DECIMAL)
- `punting_long` (INTEGER)
- `punting_inside_20` (INTEGER)
- `punting_touchbacks` (INTEGER)

**Return Stats:**
- `kick_return_returns` (INTEGER)
- `kick_return_yards` (INTEGER)
- `kick_return_average` (DECIMAL)
- `kick_return_long` (INTEGER)
- `kick_return_touchdowns` (INTEGER)
- `punt_return_returns` (INTEGER)
- `punt_return_yards` (INTEGER)
- `punt_return_average` (DECIMAL)
- `punt_return_long` (INTEGER)
- `punt_return_touchdowns` (INTEGER)

**Fantasy Points (Session 4+):**
- `fantasy_points_standard` (DECIMAL) - Standard scoring
- `fantasy_points_ppr` (DECIMAL) - Points Per Reception
- `fantasy_points_half_ppr` (DECIMAL) - Half PPR
- `fantasy_points_dynasty` (DECIMAL) - Dynasty leagues
- `fantasy_points_superflex` (DECIMAL) - Superflex leagues

**Metadata:**
- `updated_at` (TIMESTAMP)

---

### `games` (With Quarter Scores)

**Primary Keys:**
- `game_id` (VARCHAR)
- `season` (INTEGER)

**Basic Info:**
- `week` (INTEGER)
- `season_type` (ENUM: 'preseason', 'regular', 'postseason')
- `game_date` (TIMESTAMP)
- `status` (ENUM: 'scheduled', 'in_progress', 'final', 'postponed', 'canceled')

**Teams:**
- `home_team_id` (VARCHAR)
- `away_team_id` (VARCHAR)
- `home_team_score` (INTEGER)
- `away_team_score` (INTEGER)

**Quarter Scores (Session 2+):**
- `home_q1_score` (INTEGER)
- `home_q2_score` (INTEGER)
- `home_q3_score` (INTEGER)
- `home_q4_score` (INTEGER)
- `home_ot_score` (INTEGER)
- `away_q1_score` (INTEGER)
- `away_q2_score` (INTEGER)
- `away_q3_score` (INTEGER)
- `away_q4_score` (INTEGER)
- `away_ot_score` (INTEGER)

**Venue:**
- `stadium_id` (VARCHAR) - Foreign key to stadiums table
- `venue_name` (VARCHAR)
- `venue_city` (VARCHAR)
- `venue_state` (VARCHAR)

**Broadcast:**
- `broadcast_network` (VARCHAR)

**Metadata:**
- `updated_at` (TIMESTAMP)

---

### `players`

**Primary Key:**
- `player_id` (VARCHAR)

**Basic Info:**
- `full_name` (VARCHAR)
- `display_name` (VARCHAR)
- `first_name` (VARCHAR)
- `last_name` (VARCHAR)
- `jersey_number` (INTEGER)

**Position:**
- `primary_position` (VARCHAR) ⚠️ **NOT `position`**
- `position_abbreviation` (VARCHAR)

**Physical:**
- `height_inches` (INTEGER)
- `weight_pounds` (INTEGER)
- `age` (INTEGER)
- `birth_date` (DATE)

**College:**
- `college` (VARCHAR)

**Team (Current):**
- `current_team_id` (VARCHAR) - Foreign key to teams
- `status` (ENUM: 'active', 'injured', 'inactive', 'suspended')

**Metadata:**
- `espn_id` (VARCHAR)
- `headshot_url` (VARCHAR)
- `updated_at` (TIMESTAMP)

---

### `teams`

**Primary Key:**
- `team_id` (VARCHAR)

**Names:**
- `full_name` (VARCHAR)
- `display_name` (VARCHAR)
- `abbreviation` (VARCHAR)
- `team_abbreviation` (VARCHAR) - Added in Session 4

**Conference/Division:**
- `conference` (VARCHAR)
- `division` (VARCHAR)

**Colors:**
- `primary_color` (VARCHAR)
- `secondary_color` (VARCHAR)

**Logos:**
- `logo_url` (VARCHAR)

**Metadata:**
- `espn_id` (VARCHAR)
- `updated_at` (TIMESTAMP)

---

### `player_injury_status`

**Composite Key:**
- `player_id` (VARCHAR)
- `season` (INTEGER)
- `week` (INTEGER)

**Status:**
- `injury_status` (ENUM: 'out', 'doubtful', 'questionable', 'probable')
- `injury_type` (VARCHAR) - Body part/description
- `injury_details` (TEXT) - Full description

**Metadata:**
- `updated_at` (TIMESTAMP)

---

### `team_game_stats`

**Composite Key:**
- `game_id` (VARCHAR)
- `team_id` (VARCHAR)
- `season` (INTEGER)

**Offensive Stats:**
- `total_yards` (INTEGER)
- `passing_yards` (INTEGER)
- `rushing_yards` (INTEGER)
- `plays` (INTEGER)
- `yards_per_play` (DECIMAL)

**Turnovers:**
- `turnovers` (INTEGER)
- `fumbles_lost` (INTEGER)
- `interceptions_thrown` (INTEGER)

**Possession:**
- `possession_time` (VARCHAR) - Format: "MM:SS"

**Conversions:**
- `third_down_conversions` (INTEGER)
- `third_down_attempts` (INTEGER)
- `fourth_down_conversions` (INTEGER)
- `fourth_down_attempts` (INTEGER)

**Penalties:**
- `penalties` (INTEGER)
- `penalty_yards` (INTEGER)

**Metadata:**
- `updated_at` (TIMESTAMP)

---

### `weekly_leaders` (Session 4+)

**Composite Key:**
- `season` (INTEGER)
- `week` (INTEGER)
- `category` (VARCHAR)
- `rank` (INTEGER)

**Player Info:**
- `player_id` (VARCHAR)
- `player_name` (VARCHAR)
- `team_id` (VARCHAR)
- `position` (VARCHAR)

**Stat:**
- `stat_value` (DECIMAL)

**Metadata:**
- `updated_at` (TIMESTAMP)

---

### `season_cumulative_stats` (Session 4+)

**Composite Key:**
- `season` (INTEGER)
- `player_id` (VARCHAR)

**Player Info:**
- `player_name` (VARCHAR)
- `team_id` (VARCHAR)
- `position` (VARCHAR)

**Games:**
- `games_played` (INTEGER)

**Passing (Cumulative):**
- `total_passing_yards` (INTEGER)
- `total_passing_touchdowns` (INTEGER)
- `total_passing_interceptions` (INTEGER)

**Rushing (Cumulative):**
- `total_rushing_yards` (INTEGER)
- `total_rushing_touchdowns` (INTEGER)
- `total_rushing_attempts` (INTEGER)

**Receiving (Cumulative):**
- `total_receiving_yards` (INTEGER)
- `total_receiving_touchdowns` (INTEGER)
- `total_receptions` (INTEGER) ⚠️ **NOT `total_receiving_receptions`**

**Fantasy (Cumulative):**
- `total_fantasy_points_ppr` (DECIMAL)

**Pace Projections:**
- `projected_passing_yards` (INTEGER)
- `projected_rushing_yards` (INTEGER)
- `projected_receiving_yards` (INTEGER)
- `projected_fantasy_points` (DECIMAL)

**Rankings:**
- `passing_yards_rank` (INTEGER)
- `rushing_yards_rank` (INTEGER)
- `receiving_yards_rank` (INTEGER)
- `fantasy_points_rank` (INTEGER)

**Metadata:**
- `updated_at` (TIMESTAMP)

---

## How to Use This Reference

### Before Writing ANY Query:

1. **Check this file first** - Find the table and verify column names
2. **Run a test query** - Select one row to confirm columns exist
3. **Copy exact names** - Don't guess, copy from this reference

### Example Workflow:

```javascript
// ✅ STEP 1: Check DATABASE-SCHEMA-REFERENCE.md
// Found: receptions (NOT receiving_receptions)

// ✅ STEP 2: Test query to verify
const { data } = await supabase
  .from('player_game_stats')
  .select('receptions')
  .limit(1)

// ✅ STEP 3: Use confirmed column name
const { data: stats } = await supabase
  .from('player_game_stats')
  .select('player_id, receptions, receiving_yards')
  .eq('player_id', playerId)
```

---

## Schema Verification Query

Run this to generate a complete column list for any table:

```javascript
/**
 * Get all column names for a table
 */
async function getTableColumns(tableName) {
  const { data } = await supabase
    .from(tableName)
    .select('*')
    .limit(1)

  if (data && data.length > 0) {
    const columns = Object.keys(data[0])
    console.log(`\n${tableName} columns:`)
    columns.forEach(col => console.log(`  - ${col}`))
    return columns
  }

  return []
}

// Usage:
await getTableColumns('player_game_stats')
```

---

## Common Query Patterns

### Player Stats Query (CORRECT):
```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select(`
    game_id,
    passing_yards,
    passing_touchdowns,
    rushing_yards,
    rushing_touchdowns,
    receiving_yards,
    receptions,          // ✅ CORRECT
    receiving_touchdowns,
    fantasy_points_ppr
  `)
  .eq('player_id', playerId)
  .eq('season', 2025)
```

### Player Info Query (CORRECT):
```javascript
const { data } = await supabase
  .from('players')
  .select('player_id, full_name, primary_position')  // ✅ CORRECT
  .in('primary_position', ['QB', 'RB', 'WR', 'TE'])
```

---

## Migration History

| Session | Changes | Tables/Columns Added |
|---------|---------|---------------------|
| 1 | Initial schema | 41 tables |
| 2 | Betting + quarter scores | 5 tables, 10 columns (games) |
| 4 | Fantasy stats + aggregation | 3 tables, 44 columns (player_game_stats), 3 views |
| 5 | Schema documentation | This file created |

---

## For MCP Agents & Future Developers

### ⚠️ CRITICAL RULES:

1. **ALWAYS consult this file before querying**
2. **NEVER assume column names** - verify first
3. **NEVER guess patterns** - `receptions` exists, `receiving_receptions` does not
4. **Test queries on one row** before processing thousands
5. **Update this file** when schema changes

### When Schema Changes:

1. Run schema verification query
2. Update this document with new columns
3. Document migration number and date
4. Commit changes with clear message

---

## Troubleshooting

### Error: "column does not exist"

**Cause:** Using wrong column name (e.g., `receiving_receptions` instead of `receptions`)

**Fix:**
1. Check this file for correct column name
2. Run verification query to confirm
3. Update your query with exact column name

### Error: "relation does not exist"

**Cause:** Table name is wrong or migrations haven't been applied

**Fix:**
1. Check table exists: `\dt` in psql or Supabase dashboard
2. Verify migrations applied: `supabase migration list`
3. Apply missing migrations: `supabase db push`

---

## Last Updated

**Date:** October 20, 2025
**Session:** 5
**Tables Documented:** 9 core tables
**Total Columns:** 150+

---

## Contributors

- Session 1-4: Initial schema design and migrations
- Session 5: Schema documentation and verification system
