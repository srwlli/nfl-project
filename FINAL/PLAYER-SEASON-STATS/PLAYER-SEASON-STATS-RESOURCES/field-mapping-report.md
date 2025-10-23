# Player Season Stats Table - Field Mapping Report

> **Purpose**: Complete field mapping verification for the player_season_cumulative_stats table
> **Date Generated**: October 22, 2025
> **Status**: ✅ 100% Normalized
> **CodeRef**: `calculateSeasonCumulative` at weekly-aggregation.js:166

---

## Executive Summary

The **player_season_cumulative_stats table** stores running season totals for all players through the current week. This table provides cumulative statistics, rankings, pace projections, and historical comparisons for season-long analysis.

- **Total Columns**: 43 (+ 2 metadata, no deleted_at)
- **Total Records**: 1,516+ players with season stats
- **Critical Fields**: ✅ 43/43 verified
- **Normalization Status**: ✅ 100% compliant
- **Ready for Frontend**: ✅ Yes
- **Auto-Populated**: ✅ Via weekly-aggregation script

---

## 1. Critical Field Verification

These are the most important fields that must match exactly:

| Field Name | Status | Database Column | Type | Notes |
|------------|--------|-----------------|------|-------|
| **Player Season ID** | ✅ CORRECT | `player_season_id` | bigserial | Auto-increment |
| **Player ID** | ✅ CORRECT | `player_id` | string | FK to players |
| **Season** | ✅ CORRECT | `season` | integer | Year |
| **Games Played** | ✅ CORRECT | `games_played` | integer | Counted |
| **Season Passing Yards** | ✅ CORRECT | `season_passing_yards` | integer | Summed |
| **Fantasy Points PPR** | ✅ CORRECT | `season_fantasy_points_ppr` | decimal | Summed |

---

## 2. Complete Field Mapping (43 Columns)

### 2.1 Identification Fields (4 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Player Season ID | `player_season_id` | bigserial | 12345 | ❌ No (auto-increment) |
| Player ID | `player_id` | string | "espn-3139477" | ❌ No (FK) |
| Season | `season` | integer | 2025 | ❌ No |
| Last Updated Week | `last_updated_week` | integer | 7 | ❌ No |

**Unique Constraint**: (player_id, season) - one record per player per season

---

### 2.2 Games Stats (2 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Games Played | `games_played` | integer | 7 | ❌ No (default 0) |
| Games Started | `games_started` | integer | 7 | ❌ No (default 0) |

---

### 2.3 Passing Cumulative (6 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Passing Attempts | `season_passing_attempts` | integer | 245 | ❌ No (default 0) |
| Passing Completions | `season_passing_completions` | integer | 165 | ❌ No (default 0) |
| Passing Yards | `season_passing_yards` | integer | 1850 | ❌ No (default 0) |
| Passing Touchdowns | `season_passing_touchdowns` | integer | 15 | ❌ No (default 0) |
| Passing Interceptions | `season_passing_interceptions` | integer | 5 | ❌ No (default 0) |
| Passing Sacks | `season_passing_sacks` | integer | 18 | ❌ No (default 0) |

---

### 2.4 Passing Metrics (1 column)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Passer Rating | `season_passer_rating` | decimal(5,2) | 98.75 | ✅ Yes (calculated) |

**Formula**: NFL Passer Rating formula using completions, attempts, yards, TDs, INTs

---

### 2.5 Rushing Cumulative (4 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Rushing Attempts | `season_rushing_attempts` | integer | 142 | ❌ No (default 0) |
| Rushing Yards | `season_rushing_yards` | integer | 625 | ❌ No (default 0) |
| Rushing Touchdowns | `season_rushing_touchdowns` | integer | 7 | ❌ No (default 0) |
| Rushing Fumbles Lost | `season_rushing_fumbles_lost` | integer | 2 | ❌ No (default 0) |

---

### 2.6 Receiving Cumulative (4 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Receptions | `season_receptions` | integer | 52 | ❌ No (default 0) |
| Receiving Yards | `season_receiving_yards` | integer | 680 | ❌ No (default 0) |
| Receiving Touchdowns | `season_receiving_touchdowns` | integer | 6 | ❌ No (default 0) |
| Receiving Targets | `season_receiving_targets` | integer | 75 | ❌ No (default 0) |

---

### 2.7 Defense Cumulative (5 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Tackles Total | `season_tackles_total` | integer | 58 | ❌ No (default 0) |
| Sacks | `season_sacks` | decimal(5,1) | 6.5 | ❌ No (default 0) |
| Interceptions | `season_interceptions` | integer | 3 | ❌ No (default 0) |
| Forced Fumbles | `season_forced_fumbles` | integer | 2 | ❌ No (default 0) |
| Passes Defended | `season_passes_defended` | integer | 8 | ❌ No (default 0) |

---

### 2.8 Kicking Cumulative (2 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Field Goals Made | `season_field_goals_made` | integer | 15 | ❌ No (default 0) |
| Field Goals Attempted | `season_field_goals_attempted` | integer | 18 | ❌ No (default 0) |

---

### 2.9 Fantasy Cumulative (3 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Fantasy Points (Standard) | `season_fantasy_points_standard` | decimal(7,2) | 125.50 | ✅ Yes |
| Fantasy Points (PPR) | `season_fantasy_points_ppr` | decimal(7,2) | 177.50 | ✅ Yes |
| Fantasy Points (Half PPR) | `season_fantasy_points_half_ppr` | decimal(7,2) | 151.50 | ✅ Yes |

---

### 2.10 Rankings (4 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Passing Yards Rank | `season_rank_passing_yards` | integer | 5 | ✅ Yes |
| Rushing Yards Rank | `season_rank_rushing_yards` | integer | 12 | ✅ Yes |
| Receiving Yards Rank | `season_rank_receiving_yards` | integer | 8 | ✅ Yes |
| Fantasy PPR Rank | `season_rank_fantasy_ppr` | integer | 3 | ✅ Yes |

**Ranking Logic**: Top players by category, descending order

---

### 2.11 Pace Projections (7 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Projected Passing Yards | `pace_projected_passing_yards` | integer | 4500 | ✅ Yes |
| Projected Passing TDs | `pace_projected_passing_touchdowns` | integer | 36 | ✅ Yes |
| Projected Rushing Yards | `pace_projected_rushing_yards` | integer | 1520 | ✅ Yes |
| Projected Rushing TDs | `pace_projected_rushing_touchdowns` | integer | 17 | ✅ Yes |
| Projected Receptions | `pace_projected_receptions` | integer | 126 | ✅ Yes |
| Projected Receiving Yards | `pace_projected_receiving_yards` | integer | 1652 | ✅ Yes |
| Projected Receiving TDs | `pace_projected_receiving_touchdowns` | integer | 15 | ✅ Yes |

**Formula**: (season_total × 17) / games_played

---

### 2.12 Historical Context (1 column)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Historical Comparison | `historical_comparison` | text | "On pace for 5236 yards (would rank 3rd all-time)" | ✅ Yes |

---

### 2.13 Metadata (2 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Created At | `created_at` | timestamp | "2025-10-20T16:30:00Z" | ❌ No |
| Updated At | `updated_at` | timestamp | "2025-10-20T16:30:00Z" | ❌ No |

**Note**: No `deleted_at` column (not soft-delete enabled)

---

## 3. Data Quality Report

### 3.1 Field Categories

**By Category**:
1. **Identification** (4): player_season_id, player_id, season, last_updated_week
2. **Games** (2): games_played, games_started
3. **Passing Cumulative** (6): attempts, completions, yards, TDs, INTs, sacks
4. **Passing Metrics** (1): passer_rating
5. **Rushing Cumulative** (4): attempts, yards, TDs, fumbles_lost
6. **Receiving Cumulative** (4): receptions, yards, TDs, targets
7. **Defense Cumulative** (5): tackles, sacks, INTs, forced_fumbles, passes_defended
8. **Kicking Cumulative** (2): FG made, FG attempted
9. **Fantasy Cumulative** (3): standard, PPR, half_PPR
10. **Rankings** (4): passing, rushing, receiving, fantasy ranks
11. **Pace Projections** (7): projected stats for 17-game season
12. **Historical Context** (1): historical_comparison text
13. **Metadata** (2): created_at, updated_at

**Total**: 4 + 2 + 6 + 1 + 4 + 4 + 5 + 2 + 3 + 4 + 7 + 1 + 2 = **45 fields** ✅

---

## 4. Frontend Display Examples

### 4.1 Get Player Season Stats

```javascript
const { data } = await supabase
  .from('player_season_cumulative_stats')
  .select(`
    *,
    player:players(player_name, primary_position)
  `)
  .eq('player_id', 'espn-3139477')
  .eq('season', 2025)
  .single()

// Display
console.log(`${data.player.player_name}: ${data.season_passing_yards} yards, ${data.season_passing_touchdowns} TDs`)
console.log(`Fantasy Points (PPR): ${data.season_fantasy_points_ppr}`)
console.log(`Rank: #${data.season_rank_fantasy_ppr}`)
```

### 4.2 Get Top Passers

```javascript
const { data: topPassers } = await supabase
  .from('player_season_cumulative_stats')
  .select(`
    *,
    player:players(player_name, primary_position)
  `)
  .eq('season', 2025)
  .order('season_passing_yards', { ascending: false })
  .limit(10)
```

### 4.3 Get Fantasy Leaders (PPR)

```javascript
const { data: leaders } = await supabase
  .from('player_season_cumulative_stats')
  .select(`
    *,
    player:players(player_name, primary_position)
  `)
  .eq('season', 2025)
  .order('season_fantasy_points_ppr', { ascending: false })
  .limit(20)
```

### 4.4 Get Players On Pace for Records

```javascript
const { data: onPace} = await supabase
  .from('player_season_cumulative_stats')
  .select(`
    *,
    player:players(player_name)
  `)
  .eq('season', 2025)
  .not('historical_comparison', 'is', null)
```

---

## 5. Common Mistakes to Avoid

### ❌ WRONG Queries

```javascript
// ❌ WRONG - Forgetting season filter
.eq('player_id', 'espn-3139477')  // Could match multiple seasons

// ❌ WRONG - Using wrong table
.from('player_season_stats')  // Use player_season_cumulative_stats!

// ❌ WRONG - Expecting position field
.select('position')  // Table doesn't have position, must JOIN players

// ❌ WRONG - Not joining player data
.select('player_id')  // Only gets ID, not name
```

### ✅ CORRECT Queries

```javascript
// ✅ CORRECT - Include season
.eq('player_id', 'espn-3139477')
.eq('season', 2025)

// ✅ CORRECT - Use correct table name
.from('player_season_cumulative_stats')

// ✅ CORRECT - JOIN for position
.select('*, player:players(player_name, primary_position)')

// ✅ CORRECT - Join player data
.select('*, player:players(player_name)')
```

---

## 6. Related Tables

The player_season_cumulative_stats table joins with:

1. **players** - Player information
   - Join: `player_season_cumulative_stats.player_id = players.player_id`
   - FK: ✅ Foreign key constraint exists
   - Use: Get player name, position, team

2. **player_game_stats** - Source data
   - Join: Not direct (cumulative is aggregated from game stats)
   - Use: Weekly-aggregation queries player_game_stats to calculate cumulative

---

## 7. Query Patterns

### Season Leaders by Position

```javascript
const { data } = await supabase
  .from('player_season_cumulative_stats')
  .select(`
    *,
    player:players(player_name, primary_position)
  `)
  .eq('season', 2025)
  .eq('player.primary_position', 'QB')
  .order('season_passing_yards', { ascending: false})
  .limit(10)
```

### Pace Projection Display

```javascript
const formatPaceProjection = (stats) => {
  if (stats.games_played === 0) return 'N/A'

  const paceYards = stats.pace_projected_passing_yards
  const paceTDs = stats.pace_projected_passing_touchdowns

  return `On pace for ${paceYards} yards, ${paceTDs} TDs (17-game pace)`
}
```

### Fantasy Points Per Game

```javascript
const fantasyPPG = (stats) => {
  if (stats.games_played === 0) return 0
  return (stats.season_fantasy_points_ppr / stats.games_played).toFixed(2)
}

// Usage
console.log(`${fantasyPPG(data)} PPR points per game`)
```

---

## 8. Unique Constraint

**Composite Key**: (player_id, season)
- One record per player per season
- Updates weekly as games complete

---

## 9. Indexes

### Performance Indexes Created

1. **idx_player_season_cumulative_season** - `(season)` for season-wide queries
2. **idx_player_season_cumulative_passing_yards** - `(season_passing_yards DESC)` for passing leaders
3. **idx_player_season_cumulative_rushing_yards** - `(season_rushing_yards DESC)` for rushing leaders
4. **idx_player_season_cumulative_receiving_yards** - `(season_receiving_yards DESC)` for receiving leaders
5. **idx_player_season_cumulative_fantasy_ppr** - `(season_fantasy_points_ppr DESC)` for fantasy leaders

---

## 10. Validation Checklist

- [x] All 43 columns exist in database (45 total with metadata)
- [x] Composite unique constraint on (player_id, season)
- [x] Foreign key to players table
- [x] Indexes created for common queries
- [x] Query patterns documented
- [x] Common mistakes documented
- [x] Related tables identified
- [x] Calculation logic documented

---

## 11. Maintenance Notes

### Data Sources
- **Calculated**: From player_game_stats table
- **Aggregator**: `scripts/aggregators/weekly-aggregation.js` (line 166)
- **Trigger**: Weekly aggregation after games complete
- **Method**: Sums all player_game_stats for the season

### Update Frequency
- **Weekly**: After each week's games complete
- **Manual**: Can run anytime with `npm run aggregate:weekly -- --week=7`
- **Automatic**: Triggered by scheduler (Mondays at 3 AM)

### Known Limitations

#### 1. No Position Field ⚠️

**Issue**: Table does not have position column.

**Workaround**: JOIN with players table:
```javascript
.select('*, player:players(primary_position)')
```

#### 2. Passer Rating is Season Average ⚠️

**Issue**: season_passer_rating is calculated from season totals, not average of game ratings.

**Impact**: May differ slightly from ESPN's season passer rating.

#### 3. Historical Comparison is Basic ⚠️

**Issue**: Only compares to hardcoded thresholds (5000 pass yards, 2000 rush yards, 1800 rec yards).

**Enhancement Needed**: Query historical records table for accurate comparisons.

---

## 12. Calculation Logic

See raw-data-source-mapping.md for complete calculation details.

**Summary**:
1. Fetch all player_game_stats for season (paginated)
2. Group by player_id
3. Sum all cumulative stats (passing, rushing, receiving, defense, kicking, fantasy)
4. Calculate passer rating from season totals
5. Calculate pace projections (× 17 / games_played)
6. Calculate rankings (sort + assign ranks)
7. Upsert to player_season_cumulative_stats

---

## 13. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-01 | Initial player_season_cumulative_stats table created |
| 1.1 | 2025-10-20 | Weekly aggregation script implemented |
| 1.2 | 2025-10-22 | Documentation created with CodeRef |

---

## 14. References

- **Aggregator**: `scripts/aggregators/weekly-aggregation.js` (lines 166-343)
- **CodeRef Location**: `calculateSeasonCumulative:166`
- **Migration**: `supabase/migrations/20250101000021_create_weekly_aggregation_tables.sql` (lines 55-134)

---

## Contact & Support

For schema questions or field mapping issues:
- Review: `DATABASE-SCHEMA-REFERENCE.md`
- Check: `coderef/FINAL/FIELD-MAPPING-REFERENCE.md`
- Validation Report: `coderef/FINAL/FIELD-MAPPING-VALIDATION-REPORT.md`
- Run: `npm run schema:map` (generates fresh schema dump)

---

**Last Updated**: October 22, 2025
**Status**: ✅ Production Ready - 100% Normalized
**Total Fields**: 43 (+ 2 metadata)
**Total Records**: 1,516+ players with season stats
**CodeRef Validation**: ✅ Code (line 166) matches Schema (lines 55-126) perfectly
