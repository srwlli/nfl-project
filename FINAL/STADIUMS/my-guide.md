# Stadiums - Quick Reference Guide

> **Purpose**: Quick reference for stadiums table
> **Date**: October 22, 2025
> **Status**: ✅ Complete
> **CodeRef**: `extractAndUpsertVenue:215`

---

## All 14 Fields (Copy-Paste Ready)

```
stadium_id, stadium_name, city, state, country, capacity, surface_type, roof_type, opened_year, closed_year, latitude, longitude, elevation_feet, is_active
```

---

## Field Categories

### Identification (2 fields)
```
stadium_id, stadium_name
```

### Location (4 fields)
```
city, state, country, is_active
```

### Stadium Details (5 fields)
```
capacity, surface_type, roof_type, opened_year, closed_year
```

### Geographic Coordinates (3 fields)
```
latitude, longitude, elevation_feet
```

---

## SELECT Query String

```sql
stadium_id, stadium_name, city, state, country, capacity, surface_type, roof_type, opened_year, closed_year, latitude, longitude, elevation_feet, is_active, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 14
- **Total Records**: 30+ NFL stadiums
- **Data Sources**: Seed JSON + ESPN API (dual source)
- **Auto-Populated**: ✅ Partial (ESPN updates 7 fields only)

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| stadium_id | string | "espn-3975" | PK (unique) |
| stadium_name | string | "Arrowhead Stadium" | Required |
| city | string | "Kansas City" | Required |
| state | string | "MO" | Nullable |
| country | string | "USA" | Default "USA" |
| capacity | integer | 76416 | Nullable |
| surface_type | string | "Grass" | Grass/Turf/FieldTurf |
| roof_type | string | "Open" | Open/Retractable/Dome |
| opened_year | integer | 1972 | Nullable |
| closed_year | integer | null | Nullable (rarely used) |
| latitude | decimal | 39.04897400 | Nullable |
| longitude | decimal | -94.48400700 | Nullable |
| elevation_feet | integer | 800 | Nullable |
| is_active | boolean | true | Default true |

---

## Common Queries

### Get Stadium by ID
```javascript
const { data } = await supabase
  .from('stadiums')
  .select('*')
  .eq('stadium_id', 'espn-3975')
  .single()

console.log(`${data.stadium_name} - ${data.city}, ${data.state}`)
console.log(`Capacity: ${data.capacity.toLocaleString()}`)
```

### Get All Active Stadiums
```javascript
const { data: stadiums } = await supabase
  .from('stadiums')
  .select('*')
  .eq('is_active', true)
  .order('stadium_name')
```

### Get Stadiums with Games
```javascript
const { data } = await supabase
  .from('stadiums')
  .select(`
    *,
    games:games(game_id, game_date, home_team_id, away_team_id)
  `)
  .eq('is_active', true)
```

### Find Dome Stadiums
```javascript
const { data: domes } = await supabase
  .from('stadiums')
  .select('*')
  .eq('roof_type', 'Dome')
```

### Find Grass Fields
```javascript
const { data: grassFields } = await supabase
  .from('stadiums')
  .select('*')
  .eq('surface_type', 'Grass')
```

### Largest Stadiums
```javascript
const { data } = await supabase
  .from('stadiums')
  .select('*')
  .order('capacity', { ascending: false })
  .limit(10)
```

---

## Stadium Display Helper

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

## Stadium Icons

```javascript
const getStadiumIcon = (stadium) => {
  if (stadium.roof_type === 'Dome') return '🏟️'
  if (stadium.roof_type === 'Retractable') return '🔄'
  if (stadium.surface_type === 'Grass') return '🌱'
  return '🏈'  // Default
}
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Case-sensitive roof type
```javascript
.eq('roof_type', 'open')  // Should be "Open" (capitalized)
```

### ✅ CORRECT - Capitalized
```javascript
.eq('roof_type', 'Open')
```

### ❌ WRONG - Assuming all have coordinates
```javascript
.not('latitude', 'is', null)  // Some may be null
```

### ✅ CORRECT - Handle nulls
```javascript
.order('latitude', { ascending: true, nullsFirst: false })
```

### ❌ WRONG - Capacity as string
```javascript
.eq('capacity', '76416')  // It's an integer!
```

### ✅ CORRECT - Integer comparison
```javascript
.gte('capacity', 70000)
```

### ❌ WRONG - Forgetting is_active
```javascript
.select('*')  // May include closed stadiums
```

### ✅ CORRECT - Filter active
```javascript
.eq('is_active', true)
```

---

## Scripts in This Folder

### **File**: `scripts/seed/02-stadiums.js`
- **Purpose**: Initial stadium population with full details
- **Data Source**: stadiums.json (30 stadiums)
- **Fields Populated**: ALL 14 fields
- **Run Once**: `npm run seed:stadiums`

**What It Does**:
1. Reads `scripts/data/stadiums.json`
2. Validates each stadium record
3. Inserts into stadiums table
4. Logs results (30 stadiums inserted)

**Usage**:
```bash
# Seed all stadiums
npm run seed:stadiums
```

---

### **File**: `scripts/scrapers/game-stats-scraper.js`
- **Purpose**: Auto-update stadium info from game data
- **Extraction Function**: `extractAndUpsertVenue` (lines 215-257)
- **Auto-Trigger**: When game status changes to "final"
- **Fields Updated**: 7 fields (basic info only)
- **Upsert Strategy**: Updates existing or inserts new by stadium_id

**Usage**:
```bash
# Scrape specific game (includes stadium update)
npm run scrape:game-stats -- --game=401772510

# Scrape all games in a week
npm run scrape:game-stats -- --week=7
```

**What It Does**:
1. Fetches game summary from ESPN API
2. Extracts gameInfo.venue object
3. Creates/updates stadium record
4. Updates games.stadium_id foreign key
5. Logs success/failure

**Key Code** (lines 215-257):
```javascript
async function extractAndUpsertVenue(gameSummary, gameId) {
  const venue = gameSummary.gameInfo?.venue

  if (!venue || !venue.id) return null

  const stadiumId = `espn-${venue.id}`

  // Prepare stadium record
  const stadiumData = {
    stadium_id: stadiumId,
    stadium_name: venue.fullName || null,
    city: venue.address?.city || null,
    state: venue.address?.state || null,
    capacity: venue.capacity ? parseInt(venue.capacity) : null,
    surface_type: venue.grass ? 'Grass' : 'Turf',
    roof_type: venue.indoor ? 'Dome' : 'Open'
  }

  // Upsert stadium
  const { error: stadiumError } = await supabase
    .from('stadiums')
    .upsert([stadiumData], { onConflict: 'stadium_id' })

  // Update game with stadium_id
  await supabase
    .from('games')
    .update({ stadium_id: stadiumId })
    .eq('game_id', `espn-${gameId}`)

  return stadiumId
}
```

---

## Data Source Priority

### Seed Script (One-Time)
- **Fields**: ALL 14 fields
- **Includes**: Coordinates, opened_year, elevation_feet
- **Precision**: Specific turf types ("FieldTurf"), retractable roofs
- **Command**: `npm run seed:stadiums`

### Game Stats Scraper (Every Game)
- **Fields**: 7 fields only
- **Missing**: coordinates, opened_year, elevation, is_active, country
- **Precision**: Binary (Grass/Turf, Dome/Open only)
- **Trigger**: Auto-runs when game completes

**Important**: Scraper will **overwrite** seed data if stadium_id matches!

---

## Dual Source Example

**Seed creates**:
```json
{
  "stadium_id": "espn-3975",
  "stadium_name": "Arrowhead Stadium",
  "city": "Kansas City",
  "state": "MO",
  "capacity": 76416,
  "surface_type": "Grass",
  "roof_type": "Open",
  "opened_year": 1972,
  "latitude": 39.04897400,
  "longitude": -94.48400700,
  "elevation_feet": 800
}
```

**Scraper updates** (every game):
```json
{
  "stadium_id": "espn-3975",
  "stadium_name": "Arrowhead Stadium",
  "city": "Kansas City",
  "state": "MO",
  "capacity": 76416,
  "surface_type": "Grass",
  "roof_type": "Open"
  // No coordinates, opened_year, elevation!
}
```

**⚠️ Warning**: Upsert will preserve existing fields, but if ESPN data changes, it will overwrite.

---

## Related Tables

### Join with Games
```javascript
.select(`
  *,
  games:games(game_id, game_date, home_team_id, away_team_id)
`)
```

### Join with Teams (if home_stadium_id exists)
```javascript
.select(`
  *,
  teams:teams(team_id, team_name)
`)
```

---

## Frontend Display Examples

### Stadium Card Component
```jsx
const StadiumCard = ({ stadiumId }) => {
  const { data: stadium } = useQuery(/* query above */)

  return (
    <div className="stadium-card">
      <h2>{stadium.stadium_name}</h2>
      <div className="location">
        {stadium.city}, {stadium.state}
      </div>
      <div className="details">
        <span>Capacity: {stadium.capacity.toLocaleString()}</span>
        <span>{stadium.surface_type} • {stadium.roof_type}</span>
        {stadium.opened_year && (
          <span>Est. {stadium.opened_year}</span>
        )}
      </div>
    </div>
  )
}
```

### Stadium Selector
```jsx
const StadiumSelector = ({ onSelect }) => {
  const { data: stadiums } = useQuery(/* all active stadiums */)

  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      <option value="">Select Stadium</option>
      {stadiums?.map(stadium => (
        <option key={stadium.stadium_id} value={stadium.stadium_id}>
          {stadium.stadium_name} - {stadium.city}
        </option>
      ))}
    </select>
  )
}
```

---

## Validation Queries

### Check Data Completeness
```sql
-- How many stadiums have coordinates?
SELECT
  COUNT(*) FILTER (WHERE latitude IS NOT NULL) as with_coords,
  COUNT(*) as total_stadiums,
  ROUND(100.0 * COUNT(*) FILTER (WHERE latitude IS NOT NULL) / COUNT(*), 1) as pct_with_coords
FROM stadiums
WHERE is_active = true;
```

### Find Stadiums Missing Details
```sql
SELECT
  stadium_id,
  stadium_name,
  CASE WHEN latitude IS NULL THEN 'Missing coords' ELSE '' END as missing_coords,
  CASE WHEN opened_year IS NULL THEN 'Missing opened_year' ELSE '' END as missing_year,
  CASE WHEN elevation_feet IS NULL THEN 'Missing elevation' ELSE '' END as missing_elevation
FROM stadiums
WHERE is_active = true
  AND (latitude IS NULL OR opened_year IS NULL OR elevation_feet IS NULL);
```

### Roof Type Breakdown
```sql
SELECT
  roof_type,
  COUNT(*) as stadium_count
FROM stadiums
WHERE is_active = true
GROUP BY roof_type
ORDER BY stadium_count DESC;
```

---

## Testing & Debugging

### Test Seed Script
```bash
# Seed all stadiums
npm run seed:stadiums

# Check database
node -e "
const { getSupabaseClient } = require('./scripts/utils/supabase-client.js');
const supabase = getSupabaseClient();
supabase.from('stadiums')
  .select('stadium_id, stadium_name, city, opened_year, latitude')
  .eq('is_active', true)
  .then(({ data }) => console.log(JSON.stringify(data, null, 2)));
"
```

### Test Scraper Update
```bash
# Scrape game (updates stadium)
npm run scrape:game-stats -- --game=401772510

# Check if stadium updated
node -e "
const { getSupabaseClient } = require('./scripts/utils/supabase-client.js');
const supabase = getSupabaseClient();
supabase.from('stadiums')
  .select('*')
  .ilike('stadium_name', '%Arrowhead%')
  .single()
  .then(({ data }) => console.log(JSON.stringify(data, null, 2)));
"
```

---

## Known Limitations

### 1. Scraper Cannot Detect Retractable Roofs ⚠️

**Issue**: ESPN only provides `indoor` boolean, not retractable detection.

**Impact**: Retractable roofs shown as "Open" if roof was open during game.

**Solution**: Trust seed data for roof_type. Don't let scraper overwrite.

---

### 2. Surface Type Loses Precision ⚠️

**Issue**: ESPN only provides `grass` boolean.

**Impact**: Specific turf types ("FieldTurf") become generic "Turf".

**Solution**: Seed data has precise types. Keep separate stadium_ids to prevent overwrite.

---

### 3. Stadium ID Mismatch ⚠️

**Issue**: Seed uses human-readable IDs, ESPN uses numeric IDs.

**Example**:
- Seed: `"arrowhead-stadium"`
- ESPN: `"espn-3975"`

**Impact**: Database will have duplicate records for same stadium.

**Solution**: Choose one ID format and stick with it, or manually merge duplicates.

---

### 4. Scraper Overwrites Seed Data ⚠️

**Issue**: Upsert strategy will overwrite existing stadium fields.

**Impact**: Lose coordinates, opened_year, elevation, precise surface/roof types.

**Solution**:
- Use different stadium_id formats (no conflict)
- OR modify scraper to only INSERT new stadiums
- OR disable scraper stadium updates entirely

---

## Documentation Links

- **Field Mapping**: `STADIUMS-RESOURCES/field-mapping-report.md` - All 14 fields documented
- **Raw Data Sources**: `STADIUMS-RESOURCES/raw-data-source-mapping.md` - Seed + ESPN mappings
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000003_create_foundation_tables.sql` (lines 38-56)
- **CodeRef**: extractAndUpsertVenue at game-stats-scraper.js:215

---

## Quick Commands

```bash
# Seed all stadiums (one-time)
npm run seed:stadiums

# Scrape game (auto-updates stadium)
npm run scrape:game-stats -- --game=401772510

# Check data completeness
node scripts/validate-data-completeness.js
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 14
**Total Records**: 30+ NFL stadiums
**Status**: ✅ Production Ready
**CodeRef**: extractAndUpsertVenue:215 ✅ Validated
