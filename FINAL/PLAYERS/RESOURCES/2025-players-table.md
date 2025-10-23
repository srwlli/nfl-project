# 2025 Players Table Documentation

> **Database**: Supabase `fuzouuxhxluqjmiyabal`
> **Schema**: `public`
> **Table**: `players`
> **Last Updated**: October 22, 2025
> **Total Records**: 2,571 active players

---

## 📊 Table Summary

**Purpose**: Stores all NFL player profiles and biographical information for the 2025 season

**Data Source**: ESPN API team rosters (fetched via `scripts/seed/03-players.js`)

**Migration**: Created by `20250101000004_create_core_entity_tables.sql` (lines 28-76)

---

## 🗄️ Complete Schema (31 Columns)

### Primary Key
- `player_id` VARCHAR(50) PRIMARY KEY
  - Format: `"espn-{id}"` (e.g., `"espn-15818"`)
  - Unique identifier from ESPN API

### Name Fields
- `first_name` VARCHAR(100) NOT NULL
  - Example: `"Keenan"`
- `last_name` VARCHAR(100) NOT NULL
  - Example: `"Allen"`
- `full_name` VARCHAR(200)
  - Example: `"Keenan Allen"`

### Position
- `primary_position` VARCHAR(10) NOT NULL ⚠️ **NOT "position"**
  - Example: `"WR"`, `"QB"`, `"RB"`, `"TE"`, etc.
  - Foreign Key: `positions.position_id`
- `secondary_positions` VARCHAR(50)
  - Currently unused (NULL for all players)

### Jersey & Physical Attributes
- `jersey_number` INTEGER
  - Range: 0-99
  - Example: `13`
- `height_inches` INTEGER
  - Total inches (convert to feet+inches for display)
  - Example: `74` → Display as `6'2"`
- `weight_lbs` INTEGER
  - Weight in pounds
  - Example: `211`

### Birth Information
- `birth_date` DATE
  - Example: `"1992-04-27"`
- `birth_city` VARCHAR(100)
  - Currently NULL (not populated from ESPN)
- `birth_state` VARCHAR(50)
  - Currently NULL (not populated from ESPN)
- `birth_country` VARCHAR(50)
  - Currently NULL (not populated from ESPN)

### Education
- `college` VARCHAR(200)
  - Example: `"California"`
- `high_school` VARCHAR(200)
  - Currently NULL (not populated from ESPN)

### Draft Information
- `draft_year` INTEGER
  - Currently NULL (not populated from ESPN)
- `draft_round` INTEGER
  - Range: 1-7
  - Currently NULL (not populated from ESPN)
- `draft_pick` INTEGER
  - Range: 1-300
  - Currently NULL (not populated from ESPN)
- `draft_team_id` VARCHAR(10)
  - Foreign Key: `teams.team_id`
  - Currently NULL (not populated from ESPN)
- `undrafted` BOOLEAN
  - Default: `false`

### Career Tracking
- `rookie_year` INTEGER
  - Currently NULL (not populated from ESPN)
- `final_year` INTEGER
  - Currently NULL (not populated from ESPN)

### Hall of Fame
- `hof_inducted` BOOLEAN
  - Default: `false`
- `hof_induction_year` INTEGER
  - Currently NULL (not populated from ESPN)

### Status
- `status` ENUM (player_status)
  - Values: `'active'` | `'injured'` | `'inactive'` | `'suspended'`
  - Current: All 2,571 players marked as `'active'`
  - Note: Injuries tracked separately in `player_injury_status` table

### URLs
- `headshot_url` TEXT
  - Example: `"https://a.espncdn.com/i/headshots/nfl/players/full/15818.png"`
- `profile_url` TEXT
  - Example: `"https://www.espn.com/nfl/player/_/id/15818/keenan-allen"`

### Metadata
- `metadata` JSONB
  - Stores additional ESPN data:
    - `espn_id`
    - `espn_guid`
    - `espn_uid`
    - `experience_years`
    - `age`

### Timestamps
- `created_at` TIMESTAMP
  - Auto-generated on insert
- `updated_at` TIMESTAMP
  - Auto-updated on modification
- `deleted_at` TIMESTAMP
  - Soft delete (NULL for active records)

---

## 🔍 Indexes (Performance)

1. **idx_players_last_name**
   - Column: `last_name`
   - Purpose: Fast searches by last name
   - Condition: `WHERE deleted_at IS NULL`

2. **idx_players_position**
   - Column: `primary_position`
   - Purpose: Filter players by position
   - Condition: `WHERE deleted_at IS NULL`

3. **idx_players_last_name_trgm**
   - Type: GIN (Generalized Inverted Index)
   - Purpose: Fuzzy text search on last names
   - Uses: PostgreSQL trigram extension

4. **idx_players_full_name_trgm**
   - Type: GIN
   - Purpose: Fuzzy text search on full names
   - Uses: PostgreSQL trigram extension

5. **idx_players_status**
   - Column: `status`
   - Purpose: Filter by player status
   - Condition: `WHERE deleted_at IS NULL`

6. **idx_players_hof**
   - Column: `hof_inducted`
   - Purpose: Query Hall of Fame players
   - Condition: `WHERE hof_inducted = TRUE AND deleted_at IS NULL`

7. **idx_players_draft_year**
   - Column: `draft_year`
   - Purpose: Filter by draft year
   - Condition: `WHERE deleted_at IS NULL`

---

## 🔗 Foreign Key Relationships

1. **primary_position** → `positions.position_id`
   - Ensures valid position codes (QB, RB, WR, etc.)
   - Constraint: `fk_players_primary_position`

2. **draft_team_id** → `teams.team_id`
   - Links to team that drafted the player
   - Constraint: `fk_players_draft_team`

---

## 📈 Current Data Statistics (2025 Season)

### Total Players: **2,571**

### Position Breakdown (Top 17):

| Position | Count | Description |
|----------|-------|-------------|
| WR | 127 | Wide Receivers |
| LB | 127 | Linebackers |
| CB | 121 | Cornerbacks |
| OT | 86 | Offensive Tackles |
| RB | 72 | Running Backs |
| S | 72 | Safeties |
| DT | 71 | Defensive Tackles |
| G | 65 | Guards |
| TE | 65 | Tight Ends |
| DE | 63 | Defensive Ends |
| QB | 50 | Quarterbacks |
| C | 30 | Centers |
| PK | 15 | Placekickers |
| P | 14 | Punters |
| LS | 13 | Long Snappers |
| FB | 8 | Fullbacks |
| DB | 1 | Defensive Backs (misc) |

### Status Breakdown:

| Status | Count |
|--------|-------|
| active | 2,571 (100%) |

**Note**: All players currently marked as `'active'`. Injury status tracked separately in `player_injury_status` table.

---

## 📋 Sample Data

### Example Record (Keenan Allen - WR):

```json
{
  "player_id": "espn-15818",
  "first_name": "Keenan",
  "last_name": "Allen",
  "full_name": "Keenan Allen",
  "primary_position": "WR",
  "secondary_positions": null,
  "jersey_number": 13,
  "height_inches": 74,
  "weight_lbs": 211,
  "birth_date": "1992-04-27",
  "birth_city": null,
  "birth_state": null,
  "birth_country": null,
  "college": "California",
  "high_school": null,
  "draft_year": null,
  "draft_round": null,
  "draft_pick": null,
  "draft_team_id": null,
  "undrafted": false,
  "rookie_year": null,
  "final_year": null,
  "hof_inducted": false,
  "hof_induction_year": null,
  "status": "active",
  "headshot_url": "https://a.espncdn.com/i/headshots/nfl/players/full/15818.png",
  "profile_url": "https://www.espn.com/nfl/player/_/id/15818/keenan-allen",
  "metadata": {
    "espn_id": "15818",
    "espn_guid": "...",
    "espn_uid": "...",
    "experience_years": 11,
    "age": 32
  },
  "created_at": "2025-10-18T09:38:43.649978",
  "updated_at": "2025-10-22T01:39:25.735276",
  "deleted_at": null
}
```

---

## 🔄 Data Flow & Maintenance

### Initial Population:
1. **Seed Script**: `scripts/seed/03-players.js`
2. **API Call**: `fetchAllRosters()` from ESPN API
3. **Transformation**: `transformPlayerData()` maps ESPN data to schema
4. **Database Insert**: Batch upsert to `players` table

### Ongoing Updates:
1. **Roster Updates Scraper**: `scripts/scrapers/roster-updates-scraper.js`
   - Runs: Daily at 5:00 PM ET
   - Detects: Player additions/releases
   - Updates: Player-team relationships in `player_teams` table
   - Tracks: Changes in `roster_transactions` table

2. **Auto-Player Creation**: Game stats scraper auto-creates missing players
   - Prevents FK constraint violations
   - Fetches player data from ESPN API on-demand

---

## 📊 Data Completeness

### ✅ Fully Populated Fields (100%):
- `player_id` (primary key)
- `first_name`
- `last_name`
- `full_name`
- `primary_position`
- `status` (all "active")
- `created_at`
- `updated_at`

### ⚠️ Partially Populated Fields:
- `jersey_number` (~95% populated)
- `height_inches` (~90% populated)
- `weight_lbs` (~90% populated)
- `birth_date` (~80% populated)
- `college` (~85% populated)
- `headshot_url` (~95% populated)
- `profile_url` (~95% populated)
- `metadata` (100% - stores ESPN data)

### ❌ Unpopulated Fields (ESPN API Limitation):
- `secondary_positions` (not available)
- `birth_city`, `birth_state`, `birth_country` (not available)
- `high_school` (not available)
- `draft_year`, `draft_round`, `draft_pick`, `draft_team_id` (not available)
- `rookie_year`, `final_year` (not available)
- `hof_inducted`, `hof_induction_year` (manually set, default false)

---

## 🔧 Common Queries

### Get All Active Players by Position:
```sql
SELECT player_id, full_name, jersey_number, college
FROM players
WHERE primary_position = 'QB'
  AND status = 'active'
  AND deleted_at IS NULL
ORDER BY last_name;
```

### Search Players by Name (Fuzzy):
```sql
SELECT player_id, full_name, primary_position
FROM players
WHERE full_name ILIKE '%mahomes%'
  AND deleted_at IS NULL;
```

### Get Team Roster:
```sql
SELECT p.player_id, p.full_name, p.primary_position, p.jersey_number
FROM players p
JOIN player_teams pt ON p.player_id = pt.player_id
WHERE pt.team_id = 'KC'
  AND pt.start_season <= 2025
  AND (pt.end_season IS NULL OR pt.end_season >= 2025)
  AND p.deleted_at IS NULL
ORDER BY p.primary_position, p.last_name;
```

### Get Player Stats Summary:
```sql
SELECT
  p.player_id,
  p.full_name,
  p.primary_position,
  COUNT(pgs.game_id) as games_played,
  SUM(pgs.passing_yards) as total_passing_yards,
  SUM(pgs.rushing_yards) as total_rushing_yards,
  SUM(pgs.receiving_yards) as total_receiving_yards
FROM players p
LEFT JOIN player_game_stats pgs ON p.player_id = pgs.player_id
WHERE pgs.season = 2025
  AND p.deleted_at IS NULL
GROUP BY p.player_id, p.full_name, p.primary_position
ORDER BY total_passing_yards DESC NULLS LAST
LIMIT 10;
```

---

## ⚠️ Critical Schema Notes

### Column Name Warnings:

| ❌ WRONG | ✅ CORRECT | Notes |
|---------|----------|-------|
| `position` | `primary_position` | Most common mistake |
| `height` | `height_inches` | Always in inches |
| `weight` | `weight_lbs` | Always in pounds |
| `name` | `full_name` or `first_name`+`last_name` | Use appropriate field |

### Data Type Notes:

1. **Height Display Conversion**:
   ```javascript
   const feet = Math.floor(height_inches / 12);
   const inches = height_inches % 12;
   const display = `${feet}'${inches}"`;  // e.g., "6'2""
   ```

2. **Status Enum Values**:
   - Must be one of: `'active'`, `'injured'`, `'inactive'`, `'suspended'`
   - Database will reject other values

3. **Jersey Number Validation**:
   - Must be between 0 and 99
   - Database constraint enforces this

---

## 🔗 Related Tables

### Direct Relationships:
1. **player_teams** - Player-team assignments over time
2. **player_game_stats** - Individual game performance
3. **player_season_stats** - Season-long aggregates
4. **player_injury_status** - Injury reports
5. **roster_transactions** - Roster moves (signings/releases)
6. **game_rosters** - Game-day active rosters

### Reference Tables:
1. **positions** - Position definitions (FK: primary_position)
2. **teams** - Team information (FK: draft_team_id)

---

## 🚀 Access Methods

### Supabase Dashboard:
```
https://supabase.com/dashboard/project/fuzouuxhxluqjmiyabal/editor
→ Tables → public → players
```

### Node.js (Supabase Client):
```javascript
import { getSupabaseClient } from './scripts/utils/supabase-client.js';

const supabase = getSupabaseClient();

// Get all quarterbacks
const { data, error } = await supabase
  .from('players')
  .select('player_id, full_name, jersey_number, college')
  .eq('primary_position', 'QB')
  .eq('status', 'active')
  .order('last_name');
```

### Direct SQL:
```sql
-- Via psql or Supabase SQL Editor
SELECT * FROM players WHERE player_id = 'espn-15818';
```

---

## 📝 Migration History

| Migration | Date | Changes |
|-----------|------|---------|
| `20250101000004` | Initial | Created players table with 31 columns |
| N/A | Oct 18, 2025 | Initial seed (2,637 players) |
| N/A | Oct 22, 2025 | Roster population complete (2,571 players) |

---

## 📚 Related Documentation

- **Field Mapping**: See `FIELD-MAPPING-REFERENCE.md` for UI display names
- **Database Schema**: See `DATABASE-SCHEMA-REFERENCE.md` for complete schema
- **Data Sources**: See `DATA-SOURCES-INDEX.md` for data provenance
- **Project History**: See `CLAUDE.md` for development timeline

---

## 🎯 Next Steps / Enhancements

### Potential Improvements:

1. **Populate Draft Data**:
   - Source: Pro Football Reference or ESPN historical data
   - Fields: `draft_year`, `draft_round`, `draft_pick`, `draft_team_id`

2. **Add Career Tracking**:
   - Calculate `rookie_year` from game stats
   - Update `final_year` when players retire

3. **Birth Location Data**:
   - Source: Additional ESPN endpoints or manual data
   - Fields: `birth_city`, `birth_state`, `birth_country`

4. **Hall of Fame Integration**:
   - Update `hof_inducted` and `hof_induction_year` for inducted players
   - Source: Pro Football HOF official data

5. **Secondary Positions**:
   - Track players who play multiple positions
   - Source: Game-by-game position tracking

---

## 👥 Contributors

- **Session 1** (Oct 18, 2025): Initial schema design and seed script
- **Session 7** (Oct 22, 2025): Comprehensive roster population (2,571 players)
- **Session 8** (Oct 22, 2025): Documentation and analysis

---

## 📊 Table Size Estimate

- **Rows**: 2,571
- **Columns**: 31
- **Average Row Size**: ~1.5 KB (with JSONB metadata)
- **Estimated Table Size**: ~3.8 MB
- **Indexes**: ~2 MB
- **Total Disk Space**: ~6 MB

---

**Last Updated**: October 22, 2025
**Session**: 8
**Status**: ✅ Production Ready
