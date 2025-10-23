# Positions Table - Field Mapping Report

> **Purpose**: Complete field mapping verification for the positions table
> **Date Generated**: October 22, 2025
> **Status**: ✅ 100% Normalized
> **CodeRef**: `03-players.js:42-45` (seed script)

---

## Executive Summary

The **positions table** is a reference table storing NFL position definitions. This is a small, static lookup table used for position validation and display ordering.

- **Total Columns**: 5 (+ 3 metadata)
- **Total Records**: ~25-30 NFL positions
- **Critical Fields**: ✅ 5/5 verified
- **Normalization Status**: ✅ 100% compliant
- **Ready for Frontend**: ✅ Yes
- **Auto-Populated**: ✅ Via seed script (one-time)

---

## All 5 Fields (Copy-Paste Ready)

```
position_id, position_name, position_group, abbreviation, sort_order
```

---

## Field Categories

### Identification (2 fields)
```
position_id, abbreviation
```

### Description (2 fields)
```
position_name, position_group
```

### Display (1 field)
```
sort_order
```

---

## Complete Field Mapping

| Field Name | Database Column | Type | Example | Nullable | Notes |
|------------|-----------------|------|---------|----------|-------|
| Position ID | `position_id` | varchar(10) | "qb" | ❌ No | PK |
| Position Name | `position_name` | varchar(50) | "Quarterback" | ❌ No | Full name |
| Position Group | `position_group` | varchar(20) | "Offense" | ✅ Yes | Offense/Defense/Special Teams |
| Abbreviation | `abbreviation` | varchar(5) | "QB" | ❌ No | Unique, display short form |
| Sort Order | `sort_order` | integer | 1 | ✅ Yes | Display ordering |

---

## Position Groups

**Enum Values:**
- `'Offense'`
- `'Defense'`
- `'Special Teams'`

---

## Data Source Mapping

### JSON File → Database

**Source**: `scripts/data/positions.json`
**Seed Script**: `scripts/seed/03-players.js` (lines 42-45)

```javascript
// Seed process
const positionsData = JSON.parse(readFileSync('scripts/data/positions.json', 'utf-8'))
await insertBatch('positions', positionsData)
```

**Example JSON structure:**
```json
[
  {
    "position_id": "qb",
    "position_name": "Quarterback",
    "position_group": "Offense",
    "abbreviation": "QB",
    "sort_order": 1
  },
  {
    "position_id": "rb",
    "position_name": "Running Back",
    "position_group": "Offense",
    "abbreviation": "RB",
    "sort_order": 2
  }
]
```

---

## Common Position List

### Offense (11 positions):
1. QB - Quarterback
2. RB - Running Back
3. FB - Fullback
4. WR - Wide Receiver
5. TE - Tight End
6. LT - Left Tackle
7. LG - Left Guard
8. C - Center
9. RG - Right Guard
10. RT - Right Tackle
11. OL - Offensive Line (generic)

### Defense (11 positions):
12. DE - Defensive End
13. DT - Defensive Tackle
14. NT - Nose Tackle
15. OLB - Outside Linebacker
16. MLB - Middle Linebacker
17. ILB - Inside Linebacker
18. LB - Linebacker (generic)
19. CB - Cornerback
20. FS - Free Safety
21. SS - Strong Safety
22. S - Safety (generic)

### Special Teams (3 positions):
23. K - Kicker
24. P - Punter
25. LS - Long Snapper

---

## Common Queries

### Get All Positions by Group

```javascript
const { data: offensePositions } = await supabase
  .from('positions')
  .select('*')
  .eq('position_group', 'Offense')
  .order('sort_order')

console.log(offensePositions.map(p => p.abbreviation).join(', '))
// "QB, RB, WR, TE, ..."
```

### Get Position Details by Abbreviation

```javascript
const { data: position } = await supabase
  .from('positions')
  .select('*')
  .eq('abbreviation', 'QB')
  .single()

console.log(position.position_name)  // "Quarterback"
```

### Validate Position Exists

```javascript
const isValidPosition = async (abbr) => {
  const { data } = await supabase
    .from('positions')
    .select('position_id')
    .eq('abbreviation', abbr)
    .single()

  return !!data
}

// Usage
const valid = await isValidPosition('QB')  // true
const invalid = await isValidPosition('ZZ')  // false
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Using position string directly

```javascript
// Hardcoding positions without validation
const position = 'QB'  // No guarantee this exists in positions table
```

### ✅ CORRECT - Reference positions table

```javascript
// Validate against positions table
const { data: position } = await supabase
  .from('positions')
  .select('*')
  .eq('abbreviation', 'QB')
  .single()
```

### ❌ WRONG - Assuming all positions exist

```javascript
.select('*, position:positions(position_name)')  // May fail if position not in table
```

### ✅ CORRECT - Handle missing positions

```javascript
.select('*, position:positions(position_name)')
.then(({ data }) => {
  data.forEach(item => {
    const posName = item.position?.position_name || item.primary_position || 'Unknown'
    console.log(posName)
  })
})
```

---

## Scripts in This Folder

### **File**: `scripts/seed/03-players.js`
- **Purpose**: Seed players table (also seeds positions first as dependency)
- **Position Seeding**: Lines 36-48
- **Data Source**: `scripts/data/positions.json`
- **Trigger**: Manual one-time seed

**Usage**:
```bash
# Seed all players (includes positions)
npm run seed:players
```

**What It Does**:
1. Checks if positions table is empty
2. If empty, loads `scripts/data/positions.json`
3. Inserts positions via `insertBatch()`
4. Then proceeds to seed players

**Key Code** (lines 40-48):
```javascript
if (positionsCount === 0) {
  logger.info('Positions table is empty, seeding positions first...')
  const positionsPath = join(__dirname, '../data/positions.json')
  const positionsData = JSON.parse(readFileSync(positionsPath, 'utf-8'))
  await insertBatch('positions', positionsData)
  logger.info(`✓ Seeded ${positionsData.length} positions`)
} else {
  logger.info(`✓ Positions table already has ${positionsCount} positions`)
}
```

---

## Related Tables

### Referenced By

**No foreign keys reference this table currently**, but it serves as a lookup/validation table for:
- `players.primary_position` (string, not FK)
- `game_rosters.position` (string, not FK)

---

## Frontend Display Examples

### Position Dropdown Component

```jsx
const PositionSelect = () => {
  const { data: positions } = useQuery(/* positions query */)

  return (
    <select>
      {positions?.map(pos => (
        <option key={pos.position_id} value={pos.abbreviation}>
          {pos.position_name} ({pos.abbreviation})
        </option>
      ))}
    </select>
  )
}
```

### Position Group Filter

```jsx
const PositionGroupFilter = ({ group }) => {
  const { data: positions } = useQuery(() =>
    supabase
      .from('positions')
      .select('*')
      .eq('position_group', group)
      .order('sort_order')
  )

  return (
    <div className="position-buttons">
      {positions?.map(pos => (
        <button key={pos.position_id}>
          {pos.abbreviation}
        </button>
      ))}
    </div>
  )
}
```

---

## Validation Queries

### Check Data Completeness

```sql
-- Should have ~25-30 positions
SELECT COUNT(*) as position_count
FROM positions;
```

### Check Position Group Distribution

```sql
SELECT
  position_group,
  COUNT(*) as count
FROM positions
GROUP BY position_group;

-- Expected:
-- Offense: ~11
-- Defense: ~11
-- Special Teams: ~3
```

### Find Missing Sort Order

```sql
-- Check for gaps in sort_order
SELECT sort_order
FROM positions
ORDER BY sort_order;
```

---

## Known Limitations

### 1. No Foreign Keys Enforced ⚠️

**Issue**: `players.primary_position` is a string, not a FK to positions table.

**Impact**: Invalid positions could be inserted into players table.

**Workaround**: Application-level validation when creating players.

---

### 2. Static Reference Data ⚠️

**Issue**: Positions rarely change, but if NFL adds new positions, manual update required.

**Impact**: positions.json must be manually updated.

**Solution**: Re-run seed script with updated JSON file.

---

## Documentation Links

- **Field Mapping**: `POSITIONS-RESOURCES/field-mapping-report.md` - All 5 fields documented
- **Raw Data Sources**: `POSITIONS-RESOURCES/raw-data-source-mapping.md` - JSON data file
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000003_create_foundation_tables.sql` (lines 67-81)
- **Seed Script**: `scripts/seed/03-players.js:36-48`
- **Data File**: `scripts/data/positions.json`

---

## Quick Commands

```bash
# Seed positions (part of player seed)
npm run seed:players

# Query positions
node -e "
const { getSupabaseClient } = require('./scripts/utils/supabase-client.js');
const supabase = getSupabaseClient();
supabase.from('positions').select('*').order('sort_order').then(({ data }) => {
  console.table(data);
});
"
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 5
**Total Records**: ~25-30 NFL positions
**Status**: ✅ Production Ready
**CodeRef**: 03-players.js:42-45 ✅ Validated
