# Stadiums Table - Field Mapping Report

> **Purpose**: Complete field mapping verification for the stadiums table
> **Date Generated**: October 22, 2025
> **Status**: ✅ 100% Normalized
> **CodeRef**: `extractAndUpsertVenue` at game-stats-scraper.js:215

---

## Executive Summary

The **stadiums table** stores NFL venue information. This table provides stadium details for game context, venue analysis, and location-based insights.

- **Total Columns**: 14 (+ 3 metadata)
- **Total Records**: 30+ NFL stadiums
- **Critical Fields**: ✅ 14/14 verified
- **Normalization Status**: ✅ 100% compliant
- **Ready for Frontend**: ✅ Yes
- **Auto-Populated**: ✅ Via seed script + game-stats-scraper

---

## 1. Critical Field Verification

These are the most important fields that must match exactly:

| Field Name | Status | Database Column | Type | Notes |
|------------|--------|-----------------|------|-------|
| **Stadium ID** | ✅ CORRECT | `stadium_id` | string | Primary key |
| **Stadium Name** | ✅ CORRECT | `stadium_name` | string | Required |
| **City** | ✅ CORRECT | `city` | string | Required |
| **Capacity** | ✅ CORRECT | `capacity` | integer | Nullable |
| **Surface Type** | ✅ CORRECT | `surface_type` | string | Grass/Turf |
| **Roof Type** | ✅ CORRECT | `roof_type` | string | Open/Retractable/Dome |

---

## 2. Complete Field Mapping (14 Columns)

### 2.1 Identification Fields (2 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Stadium ID | `stadium_id` | string | "espn-3975" | ❌ No (PK) |
| Stadium Name | `stadium_name` | string | "Arrowhead Stadium" | ❌ No |

---

### 2.2 Location Fields (4 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| City | `city` | string | "Kansas City" | ❌ No |
| State | `state` | string | "MO" | ✅ Yes |
| Country | `country` | string | "USA" | ✅ Yes (default) |
| Is Active | `is_active` | boolean | true | ✅ Yes (default true) |

---

### 2.3 Stadium Details (5 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Capacity | `capacity` | integer | 76416 | ✅ Yes |
| Surface Type | `surface_type` | string | "Grass" | ✅ Yes |
| Roof Type | `roof_type` | string | "Open" | ✅ Yes |
| Opened Year | `opened_year` | integer | 1972 | ✅ Yes |
| Closed Year | `closed_year` | integer | null | ✅ Yes |

**Roof Type Values**: "Open", "Retractable", "Dome"
**Surface Type Values**: "Grass", "Turf"

---

### 2.4 Geographic Coordinates (3 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Latitude | `latitude` | decimal(10,8) | 39.04897400 | ✅ Yes |
| Longitude | `longitude` | decimal(11,8) | -94.48400700 | ✅ Yes |
| Elevation (feet) | `elevation_feet` | integer | 800 | ✅ Yes |

**Note**: Coordinates used for mapping/distance calculations.

---

### 2.5 Metadata (3 columns)

| Frontend Display | Database Column | Type | Example | Nullable |
|------------------|-----------------|------|---------|----------|
| Created At | `created_at` | timestamp | "2025-10-20T16:30:00Z" | ❌ No |
| Updated At | `updated_at` | timestamp | "2025-10-20T16:30:00Z" | ❌ No |
| Deleted At | `deleted_at` | timestamp | null | ✅ Yes |

---

## 3. Data Quality Report

### 3.1 Field Categories

**By Category**:
1. **Identification** (2): stadium_id, stadium_name
2. **Location** (4): city, state, country, is_active
3. **Stadium Details** (5): capacity, surface_type, roof_type, opened_year, closed_year
4. **Geographic Coordinates** (3): latitude, longitude, elevation_feet
5. **Metadata** (3): created_at, updated_at, deleted_at

---

## 4. Frontend Display Examples

### 4.1 Get Stadium by ID

```javascript
const { data } = await supabase
  .from('stadiums')
  .select('*')
  .eq('stadium_id', 'espn-3975')
  .single()

// Display
console.log(`${data.stadium_name} in ${data.city}, ${data.state}`)
console.log(`Capacity: ${data.capacity.toLocaleString()}`)
console.log(`Surface: ${data.surface_type}, Roof: ${data.roof_type}`)
```

### 4.2 Get All Active Stadiums

```javascript
const { data: stadiums } = await supabase
  .from('stadiums')
  .select('*')
  .eq('is_active', true)
  .order('stadium_name')
```

### 4.3 Get Stadiums with Games

```javascript
const { data } = await supabase
  .from('stadiums')
  .select(`
    *,
    games:games(game_id, game_date, home_team_id, away_team_id)
  `)
  .eq('stadiums.is_active', true)
```

### 4.4 Find Dome Stadiums

```javascript
const { data: domes } = await supabase
  .from('stadiums')
  .select('*')
  .eq('roof_type', 'Dome')
```

### 4.5 Find Grass Fields

```javascript
const { data: grassFields } = await supabase
  .from('stadiums')
  .select('*')
  .eq('surface_type', 'Grass')
```

---

## 5. Common Mistakes to Avoid

### ❌ WRONG Queries

```javascript
// ❌ WRONG - Case-sensitive roof type
.eq('roof_type', 'open')  // Should be "Open" (capitalized)

// ❌ WRONG - Assuming all stadiums have coordinates
.not('latitude', 'is', null)  // Some may be null

// ❌ WRONG - Using capacity as string
.eq('capacity', '76416')  // It's an integer!

// ❌ WRONG - Forgetting is_active filter
.select('*')  // May include closed stadiums
```

### ✅ CORRECT Queries

```javascript
// ✅ CORRECT - Capitalized roof type
.eq('roof_type', 'Open')

// ✅ CORRECT - Handle nullable coordinates
.order('latitude', { ascending: true, nullsFirst: false })

// ✅ CORRECT - Capacity as integer
.gte('capacity', 70000)

// ✅ CORRECT - Filter active stadiums
.eq('is_active', true)
```

---

## 6. Related Tables

The stadiums table joins with:

1. **games** - Game information
   - Join: `stadiums.stadium_id = games.stadium_id`
   - Use: Get games played at stadium

2. **teams** - Team information
   - Join: `stadiums.stadium_id = teams.stadium_id` (if home_stadium_id exists)
   - Use: Get team's home stadium

---

## 7. Query Patterns

### Stadium Details with Game Count

```javascript
const { data } = await supabase
  .from('stadiums')
  .select(`
    *,
    games:games(count)
  `)
  .eq('is_active', true)

// Display
data.forEach(stadium => {
  console.log(`${stadium.stadium_name}: ${stadium.games[0].count} games`)
})
```

### Stadiums by Capacity (Largest First)

```javascript
const { data } = await supabase
  .from('stadiums')
  .select('*')
  .eq('is_active', true)
  .order('capacity', { ascending: false })
  .limit(10)
```

### Indoor vs Outdoor Breakdown

```javascript
const { data } = await supabase
  .from('stadiums')
  .select('roof_type')
  .eq('is_active', true)

const breakdown = data.reduce((acc, stadium) => {
  acc[stadium.roof_type] = (acc[stadium.roof_type] || 0) + 1
  return acc
}, {})

// Result: { Open: 20, Dome: 8, Retractable: 2 }
```

### Format Stadium Display

```javascript
const formatStadiumDisplay = (stadium) => {
  const parts = [stadium.stadium_name]

  if (stadium.city && stadium.state) {
    parts.push(`${stadium.city}, ${stadium.state}`)
  }

  if (stadium.capacity) {
    parts.push(`Capacity: ${stadium.capacity.toLocaleString()}`)
  }

  const features = []
  if (stadium.surface_type) features.push(stadium.surface_type)
  if (stadium.roof_type) features.push(stadium.roof_type)

  if (features.length > 0) {
    parts.push(`(${features.join(', ')})`)
  }

  return parts.join(' - ')
}

// Usage
formatStadiumDisplay(data)
// "Arrowhead Stadium - Kansas City, MO - Capacity: 76,416 - (Grass, Open)"
```

---

## 8. Unique Constraint

**stadium_id** - Primary key, unique per stadium

**Identification**: Use `stadium_id` (string like "espn-3975") for lookups.

---

## 9. Indexes

### Performance Indexes

1. **stadium_id** - Primary key index
2. **is_active** - For filtering active stadiums

---

## 10. Validation Checklist

- [x] All 14 columns exist in database
- [x] Primary key on stadium_id
- [x] CHECK constraint on roof_type
- [x] Query patterns documented
- [x] Common mistakes documented
- [x] Related tables identified
- [x] Dual data sources documented (seed + game-stats-scraper)

---

## 11. Maintenance Notes

### Data Sources

**Dual Source Pattern**:

1. **Initial Seed**: `scripts/seed/02-stadiums.js`
   - Loads 30 NFL stadiums from `scripts/data/stadiums.json`
   - Includes full details (coordinates, opened_year, etc.)
   - Run once: `npm run seed:stadiums`

2. **Auto-Update**: `scripts/scrapers/game-stats-scraper.js` (line 215)
   - Extracts venue from ESPN gameInfo
   - Upserts stadium on every game scrape
   - Updates basic fields (name, city, capacity, surface, roof)
   - Does NOT overwrite: coordinates, opened_year, elevation

### Update Frequency
- **Seed**: One-time initial load
- **Auto-Update**: Every game completion (upsert by stadium_id)
- **Manual**: Edit stadiums.json and re-seed if needed

### Known Limitations

#### 1. Game-Stats-Scraper Has Limited Fields ⚠️

**Issue**: extractAndUpsertVenue only extracts 6 fields from ESPN:
- stadium_id
- stadium_name
- city
- state
- capacity
- surface_type (derived from venue.grass boolean)
- roof_type (derived from venue.indoor boolean)

**Missing from ESPN**:
- country (defaults to "USA")
- opened_year
- closed_year
- latitude / longitude
- elevation_feet
- is_active

**Workaround**: Seed script populates full details. Game scraper only updates basic fields.

#### 2. Surface Type Detection is Binary ⚠️

**Issue**: ESPN only provides `venue.grass` boolean.

**Logic**:
```javascript
surface_type: venue.grass ? 'Grass' : 'Turf'
```

**Limitation**: Cannot detect hybrid surfaces (e.g., "FieldTurf", "Matrix Turf").

#### 3. Roof Type Detection is Binary ⚠️

**Issue**: ESPN only provides `venue.indoor` boolean.

**Logic**:
```javascript
roof_type: venue.indoor ? 'Dome' : 'Open'
```

**Limitation**: Cannot auto-detect "Retractable" roofs. Must be set in seed data.

---

## 12. Data Sources in Detail

### Seed Script (02-stadiums.js)

**Purpose**: Initial population with complete stadium details

**Fields Populated**:
- All 14 fields
- Includes coordinates (lat/lon)
- Includes opened_year
- Includes elevation_feet

**Usage**:
```bash
npm run seed:stadiums
```

**Location**: `scripts/data/stadiums.json` (30 stadiums)

### Game Stats Scraper (extractAndUpsertVenue)

**Purpose**: Auto-update stadium info from game data

**Fields Extracted** (lines 215-257):
```javascript
{
  stadium_id: `espn-${venue.id}`,
  stadium_name: venue.fullName,
  city: venue.address?.city,
  state: venue.address?.state,
  capacity: parseInt(venue.capacity),
  surface_type: venue.grass ? 'Grass' : 'Turf',
  roof_type: venue.indoor ? 'Dome' : 'Open'
}
```

**Upsert Strategy**:
- Uses `onConflict: 'stadium_id'`
- Updates existing or inserts new
- Does NOT overwrite seed data fields (coordinates, opened_year, etc.)

**Trigger**: Every game completion (auto-triggered by live-games-scraper)

---

## 13. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-01 | Initial stadiums table created |
| 1.1 | 2025-10-18 | Added extractAndUpsertVenue to game-stats-scraper |
| 1.2 | 2025-10-22 | Documentation created with CodeRef |

---

## 14. References

- **Seed Script**: `scripts/seed/02-stadiums.js`
- **Scraper**: `scripts/scrapers/game-stats-scraper.js` (lines 215-257)
- **CodeRef Location**: `extractAndUpsertVenue:215`
- **Migration**: `supabase/migrations/20250101000003_create_foundation_tables.sql` (lines 38-56)
- **Data File**: `scripts/data/stadiums.json`

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
**Total Fields**: 14
**Total Records**: 30+ NFL stadiums
**CodeRef Validation**: ✅ Code (line 215) matches Schema (lines 38-56) perfectly
