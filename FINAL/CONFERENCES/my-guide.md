# Conferences - Quick Reference Guide

> **Purpose**: Quick reference for conferences table
> **Date**: October 22, 2025
> **Status**: ⚠️ EMPTY (No data populated)
> **CodeRef**: Migration only (no seed script)

---

## All 3 Fields (Copy-Paste Ready)

```
conference_id, conference_name, established_year
```

---

## Field Categories

### Identification (2 fields)
```
conference_id, conference_name
```

### Metadata (1 field)
```
established_year
```

---

## SELECT Query String

```sql
conference_id, conference_name, established_year, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 3
- **Total Records**: 0 (⚠️ NOT POPULATED)
- **Expected Records**: 2 (AFC, NFC)
- **Data Source**: Should be manually seeded
- **Auto-Populated**: ❌ No seed script exists

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| conference_id | varchar(3) | "AFC" | PK (AFC or NFC only) |
| conference_name | varchar(50) | "American Football Conference" | Full name |
| established_year | integer | 1970 | When conference created |

---

## Expected Data (2 Conferences)

```sql
('AFC', 'American Football Conference', 1970)
('NFC', 'National Football Conference', 1970)
```

---

## Current Status

**⚠️ TABLE IS EMPTY**

This table exists in the schema but has no data. Currently, conference information is stored directly in the `teams` table:
- `teams.conference` - 'AFC' or 'NFC'

---

## How to Populate

### Manual SQL Insert

```sql
INSERT INTO conferences (conference_id, conference_name, established_year) VALUES
  ('AFC', 'American Football Conference', 1970),
  ('NFC', 'National Football Conference', 1970);
```

### Via Supabase Client

```javascript
const conferences = [
  { conference_id: 'AFC', conference_name: 'American Football Conference', established_year: 1970 },
  { conference_id: 'NFC', conference_name: 'National Football Conference', established_year: 1970 }
]

await supabase.from('conferences').insert(conferences)
```

---

## Potential Use Cases

### 1. Conference Display Names

```javascript
// Get full conference name
const { data: conference } = await supabase
  .from('conferences')
  .select('conference_name')
  .eq('conference_id', 'AFC')
  .single()

console.log(conference.conference_name)  // "American Football Conference"
```

### 2. Conference Validation

```javascript
// Validate team conference assignment
const { data: conference } = await supabase
  .from('conferences')
  .select('*')
  .eq('conference_id', team.conference)
  .single()

if (!conference) {
  throw new Error('Invalid conference')
}
```

### 3. Conference Listings

```javascript
// Get both conferences
const { data: conferences } = await supabase
  .from('conferences')
  .select('*')
  .order('conference_id')

// Returns: [{ conference_id: 'AFC', ... }, { conference_id: 'NFC', ... }]
```

---

## Current Workaround

Since the table is empty, conference logic currently uses the `teams` table directly:

```javascript
// Current approach (without conferences table)
const { data: teams } = await supabase
  .from('teams')
  .select('team_id, team_name, conference, division')
  .eq('conference', 'AFC')
```

---

## Frontend Display Examples

### Conference Selector

```jsx
const ConferenceSelector = ({ value, onChange }) => {
  const { data: conferences } = useQuery(() =>
    supabase.from('conferences').select('*').order('conference_id')
  )

  return (
    <select value={value} onChange={onChange}>
      <option value="">All Conferences</option>
      {conferences?.map(c => (
        <option key={c.conference_id} value={c.conference_id}>
          {c.conference_name} ({c.conference_id})
        </option>
      ))}
    </select>
  )
}
```

### Conference Standings Display

```jsx
const ConferenceStandings = ({ conferenceId }) => {
  const { data: conference } = useQuery(() =>
    supabase
      .from('conferences')
      .select('*')
      .eq('conference_id', conferenceId)
      .single()
  )

  return (
    <div>
      <h2>{conference?.conference_name} Standings</h2>
      <p>Established: {conference?.established_year}</p>
    </div>
  )
}
```

---

## Documentation Links

- **Migration**: `supabase/migrations/20250101000003_create_foundation_tables.sql` (lines 140-149)
- **Related Tables**: teams (conference field), divisions

---

## Quick Commands

```bash
# Check if populated
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('conferences').select('*', { count: 'exact' }).then(({ count }) => console.log('Conferences:', count));"

# Populate (if needed)
# Create a seed script or run SQL insert manually
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 3
**Total Records**: 0 ⚠️ (Expected: 2)
**Status**: ⚠️ Schema exists, no data
**CodeRef**: Migration only (no seed script)
