# Divisions - Quick Reference Guide

> **Purpose**: Quick reference for divisions table
> **Date**: October 22, 2025
> **Status**: ⚠️ EMPTY (No data populated)
> **CodeRef**: Migration only (no seed script)

---

## All 5 Fields (Copy-Paste Ready)

```
division_id, division_name, conference, established_year
```

---

## Field Categories

### Identification (2 fields)
```
division_id, division_name
```

### Metadata (2 fields)
```
conference, established_year
```

---

## SELECT Query String

```sql
division_id, division_name, conference, established_year, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 4
- **Total Records**: 0 (⚠️ NOT POPULATED)
- **Expected Records**: 8 (AFC/NFC × North/South/East/West)
- **Data Source**: Should be manually seeded
- **Auto-Populated**: ❌ No seed script exists

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| division_id | varchar(10) | "AFC-North" | PK (conference-division) |
| division_name | varchar(50) | "AFC North" | Display name |
| conference | varchar(3) | "AFC" | AFC or NFC |
| established_year | integer | 1970 | When division created |

---

## Expected Data (8 Divisions)

### AFC Divisions (4)
```sql
('AFC-North', 'AFC North', 'AFC', 1970)
('AFC-South', 'AFC South', 'AFC', 2002)
('AFC-East', 'AFC East', 'AFC', 1970)
('AFC-West', 'AFC West', 'AFC', 1970)
```

### NFC Divisions (4)
```sql
('NFC-North', 'NFC North', 'NFC', 1970)
('NFC-South', 'NFC South', 'NFC', 2002)
('NFC-East', 'NFC East', 'NFC', 1970)
('NFC-West', 'NFC West', 'NFC', 1970)
```

---

## Current Status

**⚠️ TABLE IS EMPTY**

This table exists in the schema but has no data. Currently, division information is stored directly in the `teams` table:
- `teams.conference` - 'AFC' or 'NFC'
- `teams.division` - 'North', 'South', 'East', or 'West'

---

## How to Populate

### Manual SQL Insert

```sql
INSERT INTO divisions (division_id, division_name, conference, established_year) VALUES
  ('AFC-North', 'AFC North', 'AFC', 1970),
  ('AFC-South', 'AFC South', 'AFC', 2002),
  ('AFC-East', 'AFC East', 'AFC', 1970),
  ('AFC-West', 'AFC West', 'AFC', 1970),
  ('NFC-North', 'NFC North', 'NFC', 1970),
  ('NFC-South', 'NFC South', 'NFC', 2002),
  ('NFC-East', 'NFC East', 'NFC', 1970),
  ('NFC-West', 'NFC West', 'NFC', 1970);
```

### Via Supabase Client

```javascript
const divisions = [
  { division_id: 'AFC-North', division_name: 'AFC North', conference: 'AFC', established_year: 1970 },
  { division_id: 'AFC-South', division_name: 'AFC South', conference: 'AFC', established_year: 2002 },
  { division_id: 'AFC-East', division_name: 'AFC East', conference: 'AFC', established_year: 1970 },
  { division_id: 'AFC-West', division_name: 'AFC West', conference: 'AFC', established_year: 1970 },
  { division_id: 'NFC-North', division_name: 'NFC North', conference: 'NFC', established_year: 1970 },
  { division_id: 'NFC-South', division_name: 'NFC South', conference: 'NFC', established_year: 2002 },
  { division_id: 'NFC-East', division_name: 'NFC East', conference: 'NFC', established_year: 1970 },
  { division_id: 'NFC-West', division_name: 'NFC West', conference: 'NFC', established_year: 1970 }
]

await supabase.from('divisions').insert(divisions)
```

---

## Potential Use Cases

### 1. Division Display Names

```javascript
// Get formatted division name
const { data: division } = await supabase
  .from('divisions')
  .select('division_name')
  .eq('division_id', 'AFC-North')
  .single()

console.log(division.division_name)  // "AFC North"
```

### 2. Division Validation

```javascript
// Validate team division assignment
const { data: division } = await supabase
  .from('divisions')
  .select('*')
  .eq('conference', team.conference)
  .eq('division_name', `${team.conference} ${team.division}`)
  .single()

if (!division) {
  throw new Error('Invalid division')
}
```

### 3. Division Listings

```javascript
// Get all divisions by conference
const { data: afcDivisions } = await supabase
  .from('divisions')
  .select('*')
  .eq('conference', 'AFC')
  .order('division_name')
```

---

## Current Workaround

Since the table is empty, division logic currently uses the `teams` table directly:

```javascript
// Current approach (without divisions table)
const { data: teams } = await supabase
  .from('teams')
  .select('team_id, team_name, conference, division')
  .eq('conference', 'AFC')
  .eq('division', 'North')

// Groups teams by division
const divisionKey = `${team.conference}-${team.division}`  // "AFC-North"
```

---

## Documentation Links

- **Migration**: `supabase/migrations/20250101000003_create_foundation_tables.sql` (lines 125-135)
- **Related Tables**: teams (conference, division fields), conferences

---

## Quick Commands

```bash
# Check if populated
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('divisions').select('*', { count: 'exact' }).then(({ count }) => console.log('Divisions:', count));"

# Populate (if needed)
# Create a seed script or run SQL insert manually
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 4
**Total Records**: 0 ⚠️ (Expected: 8)
**Status**: ⚠️ Schema exists, no data
**CodeRef**: Migration only (no seed script)
