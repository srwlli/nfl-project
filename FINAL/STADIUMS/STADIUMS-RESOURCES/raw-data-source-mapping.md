# Stadiums Table - Raw Data Source Mapping

> **Purpose**: Maps each database field to its raw data sources
> **Date Generated**: October 22, 2025
> **Data Sources**: Seed JSON file + ESPN API Game Summary
> **CodeRef**: `extractAndUpsertVenue` at game-stats-scraper.js:215-257

---

## Executive Summary

This document shows **exactly** where each field in the `stadiums` table comes from. Unlike other tables, stadiums has **dual data sources**:

1. **Seed Script** (`scripts/data/stadiums.json`) - Initial population with full details
2. **Game Stats Scraper** (`extractAndUpsertVenue`) - Auto-updates from ESPN API

**Migration**: Lines 38-56 of 20250101000003_create_foundation_tables.sql
**Total Fields**: 14 (+ 3 metadata)

---

## Data Source Priority

### Initial Population (One-Time)
**Source**: `scripts/data/stadiums.json`
**Command**: `npm run seed:stadiums`
**Fields Populated**: ALL 14 fields

### Ongoing Updates (Every Game)
**Source**: ESPN API `gameInfo.venue`
**Trigger**: When game completes (live-games-scraper → game-stats-scraper)
**Fields Updated**: 7 fields (basic info only)
**Strategy**: UPSERT by stadium_id (updates existing, inserts new)

---

## Field-by-Field Mapping (14 Fields)

### 1. stadium_id

**Database Column**: `stadium_id`
**Data Type**: VARCHAR(50)

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].stadium_id`
- **Transformation**: Direct copy
- **Example Raw**: `"state-farm-stadium"`
- **Example Stored**: `"state-farm-stadium"`
- **Notes**: Human-readable ID

#### Source 2: Game Stats Scraper (line 222)
- **Raw Source**: ESPN venue.id
- **API Path**: `gameInfo.venue.id`
- **Transformation**: Prefix with `"espn-"`
- **Example Raw**: `"3975"`
- **Example Stored**: `"espn-3975"`
- **Notes**: ESPN numeric ID with prefix

**Code**:
```javascript
const stadiumId = `espn-${venue.id}`
```

**Important**: Seed uses human-readable IDs, scraper uses ESPN IDs. They may not match!

---

### 2. stadium_name

**Database Column**: `stadium_name`
**Data Type**: VARCHAR(200)

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].stadium_name`
- **Example Raw**: `"Arrowhead Stadium"`
- **Example Stored**: `"Arrowhead Stadium"`

#### Source 2: Game Stats Scraper (line 227)
- **Raw Source**: ESPN venue.fullName
- **API Path**: `gameInfo.venue.fullName`
- **Transformation**: Direct copy or null
- **Example Raw**: `"Arrowhead Stadium"`
- **Example Stored**: `"Arrowhead Stadium"`

**Code**:
```javascript
stadium_name: venue.fullName || null
```

---

### 3. city

**Database Column**: `city`
**Data Type**: VARCHAR(100)

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].city`
- **Example Raw**: `"Kansas City"`
- **Example Stored**: `"Kansas City"`

#### Source 2: Game Stats Scraper (line 228)
- **Raw Source**: ESPN venue.address.city
- **API Path**: `gameInfo.venue.address.city`
- **Transformation**: Direct copy or null
- **Example Raw**: `"Kansas City"`
- **Example Stored**: `"Kansas City"`

**Code**:
```javascript
city: venue.address?.city || null
```

---

### 4. state

**Database Column**: `state`
**Data Type**: VARCHAR(50)

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].state`
- **Example Raw**: `"MO"`
- **Example Stored**: `"MO"`

#### Source 2: Game Stats Scraper (line 229)
- **Raw Source**: ESPN venue.address.state
- **API Path**: `gameInfo.venue.address.state`
- **Transformation**: Direct copy or null
- **Example Raw**: `"MO"`
- **Example Stored**: `"MO"`

**Code**:
```javascript
state: venue.address?.state || null
```

---

### 5. country

**Database Column**: `country`
**Data Type**: VARCHAR(50)

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].country`
- **Example Raw**: `"USA"`
- **Example Stored**: `"USA"`
- **Notes**: All current stadiums are in USA

#### Source 2: Game Stats Scraper
- **Raw Source**: NOT EXTRACTED
- **Reason**: ESPN doesn't provide country
- **Default**: Database default "USA"

**Conclusion**: Country only comes from seed data.

---

### 6. capacity

**Database Column**: `capacity`
**Data Type**: INTEGER

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].capacity`
- **Example Raw**: `76416`
- **Example Stored**: `76416`

#### Source 2: Game Stats Scraper (line 230)
- **Raw Source**: ESPN venue.capacity
- **API Path**: `gameInfo.venue.capacity`
- **Transformation**: parseInt() or null
- **Example Raw**: `"76416"` (string)
- **Example Stored**: `76416` (integer)

**Code**:
```javascript
capacity: venue.capacity ? parseInt(venue.capacity) : null
```

---

### 7. surface_type

**Database Column**: `surface_type`
**Data Type**: VARCHAR(50)

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].surface_type`
- **Example Raw**: `"Grass"`, `"FieldTurf"`, `"Matrix Turf"`
- **Example Stored**: Same as raw
- **Notes**: Seed data has specific turf types

#### Source 2: Game Stats Scraper (line 231)
- **Raw Source**: DERIVED from ESPN venue.grass boolean
- **API Path**: `gameInfo.venue.grass`
- **Transformation**: Boolean → "Grass" or "Turf"
- **Example Raw**: `true`
- **Example Stored**: `"Grass"`

**Code**:
```javascript
surface_type: venue.grass ? 'Grass' : 'Turf'
```

**Limitation**: Scraper can only detect "Grass" vs "Turf", not specific turf types (FieldTurf, Matrix, etc.).

---

### 8. roof_type

**Database Column**: `roof_type`
**Data Type**: VARCHAR(50)

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].roof_type`
- **Possible Values**: `"Open"`, `"Retractable"`, `"Dome"`
- **Example Raw**: `"Retractable"`
- **Example Stored**: `"Retractable"`

#### Source 2: Game Stats Scraper (line 232)
- **Raw Source**: DERIVED from ESPN venue.indoor boolean
- **API Path**: `gameInfo.venue.indoor`
- **Transformation**: Boolean → "Dome" or "Open"
- **Example Raw**: `false`
- **Example Stored**: `"Open"`

**Code**:
```javascript
roof_type: venue.indoor ? 'Dome' : 'Open'
```

**Limitation**: Scraper cannot detect "Retractable" roofs. Assumes indoor=true → "Dome", indoor=false → "Open".

---

### 9. opened_year

**Database Column**: `opened_year`
**Data Type**: INTEGER

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].opened_year`
- **Example Raw**: `1972`
- **Example Stored**: `1972`

#### Source 2: Game Stats Scraper
- **Raw Source**: NOT EXTRACTED
- **Reason**: ESPN doesn't provide opened_year

**Conclusion**: opened_year only comes from seed data.

---

### 10. closed_year

**Database Column**: `closed_year`
**Data Type**: INTEGER

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].closed_year` (optional)
- **Example Raw**: `null` (most active stadiums)
- **Example Stored**: `null`

#### Source 2: Game Stats Scraper
- **Raw Source**: NOT EXTRACTED
- **Reason**: ESPN doesn't provide closed_year

**Conclusion**: closed_year only comes from seed data (rarely used).

---

### 11. latitude

**Database Column**: `latitude`
**Data Type**: DECIMAL(10, 8)

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].latitude`
- **Example Raw**: `39.04897400`
- **Example Stored**: `39.04897400`

#### Source 2: Game Stats Scraper
- **Raw Source**: NOT EXTRACTED
- **Reason**: ESPN venue doesn't include lat/lon

**Conclusion**: Coordinates only come from seed data.

---

### 12. longitude

**Database Column**: `longitude`
**Data Type**: DECIMAL(11, 8)

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].longitude`
- **Example Raw**: `-94.48400700`
- **Example Stored**: `-94.48400700`

#### Source 2: Game Stats Scraper
- **Raw Source**: NOT EXTRACTED
- **Reason**: ESPN venue doesn't include lat/lon

**Conclusion**: Coordinates only come from seed data.

---

### 13. elevation_feet

**Database Column**: `elevation_feet`
**Data Type**: INTEGER

#### Source 1: Seed Script
- **Raw Source**: stadiums.json
- **API Path**: `stadiums[].elevation_feet` (optional)
- **Example Raw**: `800`
- **Example Stored**: `800`
- **Notes**: Useful for thin air analysis (e.g., Denver at 5,280 ft)

#### Source 2: Game Stats Scraper
- **Raw Source**: NOT EXTRACTED
- **Reason**: ESPN doesn't provide elevation

**Conclusion**: elevation_feet only comes from seed data.

---

### 14. is_active

**Database Column**: `is_active`
**Data Type**: BOOLEAN

#### Source 1: Seed Script
- **Raw Source**: stadiums.json (optional field)
- **API Path**: `stadiums[].is_active`
- **Default**: `true` (if not provided)
- **Example Raw**: `true`
- **Example Stored**: `true`

#### Source 2: Game Stats Scraper
- **Raw Source**: NOT EXTRACTED
- **Default**: Database default `true`

**Conclusion**: is_active only comes from seed data (or database default).

---

### 15-17. Metadata (created_at, updated_at, deleted_at)
- **Database Columns**: `created_at`, `updated_at`, `deleted_at`
- **Data Type**: TIMESTAMP
- **Raw Source**: Database triggers
- **API Path**: N/A
- **Notes**: Managed by database automatically

---

## Complete ESPN API Response Example

### Request
```
GET https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401772510
```

### Response (Venue Section)
```json
{
  "gameInfo": {
    "venue": {
      "id": "3975",
      "fullName": "Arrowhead Stadium",
      "address": {
        "city": "Kansas City",
        "state": "MO"
      },
      "capacity": 76416,
      "grass": true,
      "indoor": false
    }
  }
}
```

**Note**: ESPN provides minimal stadium data. Full details (coordinates, opened_year, elevation) come from seed file.

---

## Complete Seed Data Example

### stadiums.json Structure
```json
{
  "stadium_id": "arrowhead-stadium",
  "stadium_name": "Arrowhead Stadium",
  "city": "Kansas City",
  "state": "MO",
  "country": "USA",
  "capacity": 76416,
  "surface_type": "Grass",
  "roof_type": "Open",
  "opened_year": 1972,
  "latitude": 39.04897400,
  "longitude": -94.48400700,
  "elevation_feet": 800
}
```

---

## Data Source Comparison Table

| Field | Seed Script | Game Scraper | Notes |
|-------|-------------|--------------|-------|
| stadium_id | ✅ Yes | ✅ Yes | Different ID formats! |
| stadium_name | ✅ Yes | ✅ Yes | Same |
| city | ✅ Yes | ✅ Yes | Same |
| state | ✅ Yes | ✅ Yes | Same |
| country | ✅ Yes | ❌ No | Defaults to "USA" |
| capacity | ✅ Yes | ✅ Yes | Same |
| surface_type | ✅ Yes (detailed) | ✅ Yes (binary) | Scraper less precise |
| roof_type | ✅ Yes (3 types) | ✅ Yes (2 types) | Scraper can't detect retractable |
| opened_year | ✅ Yes | ❌ No | Seed only |
| closed_year | ✅ Yes | ❌ No | Seed only |
| latitude | ✅ Yes | ❌ No | Seed only |
| longitude | ✅ Yes | ❌ No | Seed only |
| elevation_feet | ✅ Yes | ❌ No | Seed only |
| is_active | ✅ Yes | ❌ No | Seed only |

**Summary**: Seed provides **all 14 fields**. Scraper only updates **7 fields**.

---

## Data Extraction Workflows

### Workflow 1: Initial Seed

```bash
npm run seed:stadiums
```

**Process**:
1. Read `scripts/data/stadiums.json`
2. Validate each stadium record
3. Insert into stadiums table
4. Log results (30 stadiums inserted)

**Result**: Complete stadium data with all 14 fields.

### Workflow 2: Auto-Update from Games

**Trigger**: Game completes (status changes to "final")

**Process**:
1. Live-games-scraper detects final game
2. Auto-triggers game-stats-scraper
3. game-stats-scraper calls extractAndUpsertVenue (line 215)
4. Extracts 7 fields from ESPN gameInfo.venue
5. Upserts to stadiums table (by stadium_id)
6. Updates games.stadium_id foreign key

**Result**: Stadium basic info updated, seed data fields preserved.

---

## Common Data Issues

### Issue 1: Stadium ID Mismatch

**Symptom**: Seed stadium_id ≠ ESPN stadium_id

**Example**:
- Seed: `"arrowhead-stadium"`
- ESPN: `"espn-3975"`

**Cause**: Different ID formats

**Solution**: Both are valid. Database will have both records unless manually merged.

### Issue 2: Retractable Roofs Shown as "Open"

**Symptom**: Mercedes-Benz Stadium shows "Open" instead of "Retractable"

**Cause**: ESPN only provides indoor boolean, not retractable detection

**Solution**: Seed data has correct "Retractable" value. Don't re-seed or scraper will overwrite.

### Issue 3: Surface Type Loses Precision

**Symptom**: Seed has "FieldTurf", scraper updates to "Turf"

**Cause**: ESPN only provides grass boolean

**Solution**: If precision matters, don't let scraper overwrite seed data.

### Issue 4: Missing Coordinates

**Symptom**: New stadium from scraper has null lat/lon

**Cause**: ESPN doesn't provide coordinates

**Solution**: Manually add to stadiums.json and re-seed, or update database directly.

---

## Upsert Strategy (Game Stats Scraper)

### Code (lines 237-239)

```javascript
const { error: stadiumError } = await supabase
  .from('stadiums')
  .upsert([stadiumData], { onConflict: 'stadium_id' })
```

**Behavior**:
- If stadium_id exists → UPDATE with new data
- If stadium_id doesn't exist → INSERT new record

**⚠️ Warning**: Upsert will **overwrite** existing fields!

**Example**:
1. Seed creates: `{ stadium_id: "espn-3975", roof_type: "Retractable", ... }`
2. Scraper upserts: `{ stadium_id: "espn-3975", roof_type: "Open", ... }`
3. Result: roof_type changed from "Retractable" to "Open" ❌

**Solution**: If seed data is more accurate, either:
- Don't run scraper on seeded stadiums
- Modify scraper to only INSERT, not UPDATE
- Keep separate stadium_ids for seed vs ESPN

---

## Best Practices

### 1. Trust Seed Data for Detail Fields

Seed data is manually curated and includes:
- Coordinates (lat/lon)
- Opened year
- Elevation
- Precise surface types ("FieldTurf" vs "Turf")
- Retractable roof detection

**Recommendation**: Use seed data as source of truth.

### 2. Use Scraper for New Stadiums Only

If a new stadium opens and isn't in seed data:
- Scraper will auto-create with ESPN data
- Manually update coordinates/opened_year later

### 3. Prevent Scraper Overwriting Seed Data

**Option A**: Use different stadium_id formats
- Seed: `"arrowhead-stadium"`
- ESPN: `"espn-3975"`
- No conflict!

**Option B**: Modify scraper to check if stadium exists before upserting
```javascript
const { data: existing } = await supabase
  .from('stadiums')
  .select('stadium_id')
  .eq('stadium_id', stadiumId)
  .single()

if (!existing) {
  // Only insert if doesn't exist
  await supabase.from('stadiums').insert([stadiumData])
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-01 | Initial seed script created |
| 1.1 | 2025-10-18 | Added extractAndUpsertVenue to game-stats-scraper |
| 1.2 | 2025-10-22 | Documentation created with dual-source analysis |

---

## References

- **Seed Script**: `scripts/seed/02-stadiums.js`
- **Seed Data**: `scripts/data/stadiums.json` (30 stadiums)
- **Scraper**: `scripts/scrapers/game-stats-scraper.js` (lines 215-257)
- **CodeRef Location**: `extractAndUpsertVenue:215`
- **ESPN API Docs**: Not publicly documented (reverse-engineered)
- **Migration**: `supabase/migrations/20250101000003_create_foundation_tables.sql` (lines 38-56)

---

**Last Updated**: October 22, 2025
**Data Sources**: Seed JSON (all 14 fields) + ESPN API (7 fields)
**Total Fields**: 14 (+ 3 metadata)
**Automation**: ✅ Seed (one-time) + Auto-update (every game)
**CodeRef Validation**: ✅ All fields match between sources and schema
