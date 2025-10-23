# Teams Table - Field Mapping Report

> **Purpose**: Complete field mapping verification for the teams table
> **Date Generated**: October 22, 2025
> **Status**: ✅ 100% Normalized to FIELD-MAPPING-REFERENCE.md

---

## Executive Summary

The **teams table** is **fully normalized** to the FIELD-MAPPING-REFERENCE.md standards with all 16 columns properly named and typed.

- **Total Columns**: 16
- **Total Records**: 32 teams (all active NFL teams)
- **Critical Fields**: ✅ 3/3 verified
- **Normalization Status**: ✅ 100% compliant
- **Ready for Frontend**: ✅ Yes

---

## 1. Critical Field Verification

These are the most important fields that must match exactly:

| Field Name | Status | Database Column | Type | Notes |
|------------|--------|-----------------|------|-------|
| **Team ID** | ✅ CORRECT | `team_id` | string | Primary key (e.g., "SEA") |
| **Abbreviation** | ✅ CORRECT | `team_abbr` | string | ⚠️ NOT "abbreviation" |
| **Name** | ✅ CORRECT | `team_name` | string | Full team name |

---

## 2. Complete Field Mapping (16 Columns)

### 2.1 Identification Fields (4 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Team ID | `team_id` | string | "SEA" | ❌ No |
| Team Name | `team_name` | string | "Seattle Seahawks" | ❌ No |
| Team Abbreviation | `team_abbr` | string | "SEA" | ❌ No |
| City | `city` | string | "Seattle" | ❌ No |

**⚠️ CRITICAL**: Column is `team_abbr` NOT `abbreviation`

---

### 2.2 League Structure (2 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Conference | `conference` | string | "NFC" | ❌ No |
| Division | `division` | string | "West" | ❌ No |

**Conference Values**: `AFC` | `NFC`
**Division Values**: `East` | `West` | `North` | `South`

---

### 2.3 Historical Info (2 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Founded Year | `founded_year` | number | 1976 | ❌ No |
| Franchise History | `franchise_history` | string | null | ✅ Yes |

---

### 2.4 Venue (1 column)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Stadium ID | `stadium_id` | string | "lumen-field" | ✅ Yes |

**Note**: Foreign key reference to `stadiums` table

---

### 2.5 Branding (3 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Primary Color | `primary_color` | string | "#002244" | ❌ No |
| Secondary Color | `secondary_color` | string | "#69BE28" | ❌ No |
| Logo URL | `logo_url` | string | "https://a.espncdn.com/..." | ❌ No |

**Color Format**: Hex color codes (e.g., "#002244")

---

### 2.6 Status & Metadata (4 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Active Status | `is_active` | boolean | true | ❌ No |
| Created At | `created_at` | timestamp | "2025-10-18T08:51:55" | ❌ No |
| Updated At | `updated_at` | timestamp | "2025-10-18T08:51:55" | ❌ No |
| Deleted At | `deleted_at` | timestamp | null | ✅ Yes |

---

## 3. Data Quality Report

### 3.1 Record Counts

```
Total Teams: 32 (all active)
```

### 3.2 Conference Distribution

| Conference | Teams | Percentage |
|------------|-------|------------|
| AFC | 16 | 50% |
| NFC | 16 | 50% |

### 3.3 Division Distribution

| Division | AFC Teams | NFC Teams | Total |
|----------|-----------|-----------|-------|
| East | 4 | 4 | 8 |
| West | 4 | 4 | 8 |
| North | 4 | 4 | 8 |
| South | 4 | 4 | 8 |

### 3.4 All 32 Teams by Conference/Division

**AFC East**: BUF, MIA, NE, NYJ
**AFC North**: BAL, CIN, CLE, PIT
**AFC South**: HOU, IND, JAX, TEN
**AFC West**: DEN, KC, LV, LAC

**NFC East**: DAL, NYG, PHI, WAS
**NFC North**: CHI, DET, GB, MIN
**NFC South**: ATL, CAR, NO, TB
**NFC West**: ARI, LAR, SF, SEA

### 3.5 Nullable Fields Analysis

Fields that are commonly NULL:
- `stadium_id`: May be NULL if stadium not yet mapped
- `franchise_history`: NULL for most teams
- `deleted_at`: NULL for all active teams

---

## 4. Frontend Display Examples

### 4.1 Team Card Display

```javascript
// ✅ CORRECT - Using exact column names
const { data: team } = await supabase
  .from('teams')
  .select('team_name, team_abbr, logo_url, primary_color, secondary_color')
  .eq('team_id', 'SEA')
  .single()

// Display
console.log(team.team_name)          // "Seattle Seahawks"
console.log(team.team_abbr)          // "SEA"
console.log(team.primary_color)      // "#002244"
```

### 4.2 Team Identity Display

```javascript
// ✅ CORRECT - Complete team query
const { data: team } = await supabase
  .from('teams')
  .select(`
    team_id,
    team_name,
    team_abbr,
    city,
    conference,
    division,
    founded_year,
    primary_color,
    secondary_color,
    logo_url
  `)
  .eq('team_id', teamId)
  .single()

// Display division info
console.log(`${team.conference} ${team.division}`)  // "NFC West"
```

### 4.3 Division Standings Query

```javascript
// ✅ CORRECT - Get all teams in a division
const { data: teams } = await supabase
  .from('teams')
  .select('team_id, team_name, team_abbr, logo_url')
  .eq('conference', 'NFC')
  .eq('division', 'West')
  .order('team_name')

// Returns: ARI, LAR, SF, SEA
```

---

## 5. Common Mistakes to Avoid

### ❌ WRONG Column Names

```javascript
// ❌ WRONG - These columns don't exist
.select('abbreviation')              // Should be: team_abbr
.select('name')                      // Should be: team_name
.select('color')                     // Should be: primary_color
.select('team')                      // Should be: team_name or team_id
```

### ✅ CORRECT Column Names

```javascript
// ✅ CORRECT
.select('team_abbr')                 // Abbreviation (SEA, NE, etc.)
.select('team_name')                 // Full name
.select('team_id')                   // Primary key (same as abbr)
.select('primary_color')             // Hex color code
.select('secondary_color')           // Secondary hex color
```

---

## 6. Related Tables

The teams table joins with:

1. **games** - Home/away games
   - Join: `teams.team_id = games.home_team_id` OR `games.away_team_id`

2. **players** - Current roster (via player_teams)
   - Join: `teams.team_id = player_teams.team_id`

3. **player_game_stats** - Team player stats
   - Join: `teams.team_id = player_game_stats.team_id`

4. **team_game_stats** - Team statistics
   - Join: `teams.team_id = team_game_stats.team_id`

5. **team_season_stats** - Season standings
   - Join: `teams.team_id = team_season_stats.team_id`

6. **stadiums** - Home stadium
   - Join: `teams.stadium_id = stadiums.stadium_id`

---

## 7. Query Patterns

### Get Team by ID

```javascript
const { data } = await supabase
  .from('teams')
  .select('*')
  .eq('team_id', 'SEA')
  .single()
```

### Get All Teams in Division

```javascript
const { data } = await supabase
  .from('teams')
  .select('team_id, team_name, team_abbr')
  .eq('conference', 'AFC')
  .eq('division', 'West')
  .order('team_name')
```

### Get Team with Stadium Info

```javascript
const { data } = await supabase
  .from('teams')
  .select(`
    *,
    stadiums(
      stadium_name,
      city,
      state,
      capacity,
      surface_type,
      roof_type
    )
  `)
  .eq('team_id', 'SEA')
  .single()
```

### Get All Teams with Logos

```javascript
const { data } = await supabase
  .from('teams')
  .select('team_id, team_name, team_abbr, logo_url, primary_color')
  .eq('is_active', true)
  .order('team_name')
```

---

## 8. Special Cases

### Washington Commanders (WSH/WAS Alias)

The Washington Commanders have historically used both `WSH` and `WAS` abbreviations:
- **Current**: `WAS` (Washington)
- **Historical**: `WSH` (Washington)

**Handling**:
- Database may contain both entries for compatibility
- Always use `WAS` for current data
- Legacy data may reference `WSH`

---

## 9. Validation Checklist

- [x] All 16 columns exist in database
- [x] Critical columns use correct names (team_abbr, team_name)
- [x] Team ID format verified (3-letter abbreviation)
- [x] All 32 teams accounted for
- [x] Conference values validated (AFC, NFC)
- [x] Division values validated (East, West, North, South)
- [x] Color format verified (hex codes)
- [x] Query patterns documented
- [x] Common mistakes documented
- [x] Related tables identified

---

## 10. Maintenance Notes

### Data Sources
- **Initial Seed**: `scripts/seed/01-teams.js` (one-time)
- **Updates**: Manual (teams rarely change)

### Update Frequency
- **Team data**: Static (only changes with expansion/relocation)
- **Stadium IDs**: Updated when stadiums change
- **Branding**: Updated when teams rebrand (rare)

### Known Issues
- None - teams table is stable and complete

### Recommended Actions
1. ✅ Schema is correct - no changes needed
2. ✅ All 32 teams properly configured
3. ✅ Stadium references properly linked

---

## 11. Team Branding Reference

### Color Scheme Examples

| Team | Primary | Secondary |
|------|---------|-----------|
| SEA | #002244 (Navy) | #69BE28 (Action Green) |
| SF | #AA0000 (Red) | #B3995D (Gold) |
| GB | #203731 (Green) | #FFB612 (Gold) |
| DAL | #041E42 (Navy) | #869397 (Silver) |

---

## 12. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-22 | Initial field mapping report created |

---

## 13. References

- **Field Mapping Standard**: `coderef/FINAL/FIELD-MAPPING-REFERENCE.md`
- **Database Schema**: `coderef/schema-reference.json`
- **Seed Script**: `scripts/seed/01-teams.js`
- **Schema Reference**: `DATABASE-SCHEMA-REFERENCE.md`

---

## Contact & Support

For schema questions or field mapping issues:
- Review: `DATABASE-SCHEMA-REFERENCE.md`
- Check: `coderef/FINAL/FIELD-MAPPING-REFERENCE.md`
- Validate: Run `node scripts/analyze-teams-schema.js`

---

**Last Updated**: October 22, 2025
**Status**: ✅ Production Ready - 100% Normalized
**Total Fields**: 16 (all from seed data)
