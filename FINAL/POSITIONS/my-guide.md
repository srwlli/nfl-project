# Positions - Quick Reference Guide

> **Purpose**: Quick reference for positions table
> **Date**: October 22, 2025
> **Status**: ✅ Complete
> **CodeRef**: `03-players.js:42-45`

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

## SELECT Query String

```sql
position_id, position_name, position_group, abbreviation, sort_order, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 5
- **Total Records**: ~25-30 NFL positions
- **Data Source**: `scripts/data/positions.json` (static file)
- **Auto-Populated**: ✅ One-time seed via 03-players.js

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| position_id | varchar(10) | "qb" | Lowercase ID (PK) |
| position_name | varchar(50) | "Quarterback" | Full position name |
| position_group | varchar(20) | "Offense" | Offense/Defense/Special Teams |
| abbreviation | varchar(5) | "QB" | Unique short form |
| sort_order | integer | 1 | Display ordering |

---

## Position Groups

**Enum Values:**
- `Offense` (~11 positions)
- `Defense` (~11 positions)
- `Special Teams` (~3 positions)

---

## Common Queries

### Get All Positions

```javascript
const { data: allPositions } = await supabase
  .from('positions')
  .select('*')
  .order('sort_order')

console.log(`${allPositions.length} positions`)
```

### Get Positions by Group

```javascript
const { data: offense } = await supabase
  .from('positions')
  .select('*')
  .eq('position_group', 'Offense')
  .order('sort_order')

offense.forEach(pos => {
  console.log(`${pos.abbreviation} - ${pos.position_name}`)
})
// "QB - Quarterback"
// "RB - Running Back"
// ...
```

### Get Position by Abbreviation

```javascript
const { data: qb } = await supabase
  .from('positions')
  .select('*')
  .eq('abbreviation', 'QB')
  .single()

console.log(qb.position_name)  // "Quarterback"
console.log(qb.position_group)  // "Offense"
```

### Validate Position Exists

```javascript
const positionExists = async (abbr) => {
  const { data } = await supabase
    .from('positions')
    .select('position_id')
    .eq('abbreviation', abbr)
    .maybeSingle()

  return !!data
}

// Usage
await positionExists('QB')  // true
await positionExists('XYZ')  // false
```

---

## Display Helpers

### Format Position Label

```javascript
const formatPosition = (position) => {
  return `${position.abbreviation} - ${position.position_name}`
}

// Usage
formatPosition({ abbreviation: 'QB', position_name: 'Quarterback' })
// "QB - Quarterback"
```

### Group Positions by Category

```javascript
const groupByCategory = (positions) => {
  return positions.reduce((acc, pos) => {
    const group = pos.position_group || 'Other'
    if (!acc[group]) acc[group] = []
    acc[group].push(pos)
    return acc
  }, {})
}

// Usage
const { data: positions } = await supabase
  .from('positions')
  .select('*')
  .order('sort_order')

const grouped = groupByCategory(positions)
console.log(Object.keys(grouped))  // ["Offense", "Defense", "Special Teams"]
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Hardcoding position names

```javascript
const position = 'Quarterback'  // What if it changes?
```

### ✅ CORRECT - Use positions table

```javascript
const { data: position } = await supabase
  .from('positions')
  .select('position_name')
  .eq('abbreviation', 'QB')
  .single()
```

### ❌ WRONG - Not ordering by sort_order

```javascript
.select('*')  // Random order
```

### ✅ CORRECT - Order by sort_order

```javascript
.select('*')
.order('sort_order')
```

### ❌ WRONG - Assuming position FK exists

```javascript
// players.primary_position is NOT a FK
.select('*, position:positions(position_name)')  // Won't work with automatic join
```

### ✅ CORRECT - Manual join or filter

```javascript
// Option 1: Manual join
const { data: players } = await supabase.from('players').select('*')
const { data: positions } = await supabase.from('positions').select('*')

const playersWithPositions = players.map(p => ({
  ...p,
  position_name: positions.find(pos => pos.abbreviation === p.primary_position)?.position_name
}))

// Option 2: Just use the abbreviation
console.log(player.primary_position)  // "QB" is sufficient
```

---

## Scripts in This Folder

### **File**: `scripts/seed/03-players.js`
- **Purpose**: Seed players table (also seeds positions first)
- **Position Seeding**: Lines 36-48
- **Data Source**: `scripts/data/positions.json`
- **Trigger**: Manual one-time

**Usage**:
```bash
# Seed positions (part of player seed)
npm run seed:players
```

**What It Does**:
1. Checks if positions table has records
2. If empty, loads `scripts/data/positions.json`
3. Inserts all positions via `insertBatch()`
4. Logs count of positions seeded

**Key Code** (lines 40-48):
```javascript
if (positionsCount === 0) {
  logger.info('Positions table is empty, seeding positions first...')
  const positionsPath = join(__dirname, '../data/positions.json')
  const positionsData = JSON.parse(readFileSync(positionsPath, 'utf-8'))
  await insertBatch('positions', positionsData)
  logger.info(`✓ Seeded ${positionsData.length} positions`)
}
```

---

## Position List (Quick Reference)

### Offense:
- QB - Quarterback
- RB - Running Back
- FB - Fullback
- WR - Wide Receiver
- TE - Tight End
- LT - Left Tackle
- LG - Left Guard
- C - Center
- RG - Right Guard
- RT - Right Tackle
- OL - Offensive Line (generic)

### Defense:
- DE - Defensive End
- DT - Defensive Tackle
- NT - Nose Tackle
- OLB - Outside Linebacker
- MLB - Middle Linebacker
- ILB - Inside Linebacker
- LB - Linebacker (generic)
- CB - Cornerback
- FS - Free Safety
- SS - Strong Safety
- S - Safety (generic)

### Special Teams:
- K - Kicker
- P - Punter
- LS - Long Snapper

---

## Frontend Display Examples

### Position Dropdown

```jsx
const PositionSelect = ({ value, onChange }) => {
  const { data: positions } = useQuery(() =>
    supabase.from('positions').select('*').order('sort_order')
  )

  return (
    <select value={value} onChange={onChange}>
      <option value="">Select Position</option>
      {positions?.map(pos => (
        <option key={pos.position_id} value={pos.abbreviation}>
          {pos.abbreviation} - {pos.position_name}
        </option>
      ))}
    </select>
  )
}
```

### Position Group Tabs

```jsx
const PositionTabs = ({ onSelectPosition }) => {
  const [activeGroup, setActiveGroup] = useState('Offense')

  const { data: positions } = useQuery(() =>
    supabase
      .from('positions')
      .select('*')
      .eq('position_group', activeGroup)
      .order('sort_order')
  )

  return (
    <div>
      <div className="tabs">
        <button onClick={() => setActiveGroup('Offense')}>Offense</button>
        <button onClick={() => setActiveGroup('Defense')}>Defense</button>
        <button onClick={() => setActiveGroup('Special Teams')}>Special Teams</button>
      </div>

      <div className="position-buttons">
        {positions?.map(pos => (
          <button
            key={pos.position_id}
            onClick={() => onSelectPosition(pos.abbreviation)}
          >
            {pos.abbreviation}
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## Validation Queries

### Check Data Completeness

```sql
-- Should have ~25-30 positions
SELECT COUNT(*) as total_positions
FROM positions;
```

### Check Position Group Distribution

```sql
SELECT
  position_group,
  COUNT(*) as count
FROM positions
GROUP BY position_group
ORDER BY count DESC;

-- Expected:
-- Offense: ~11
-- Defense: ~11
-- Special Teams: ~3
```

### Find Duplicate Abbreviations

```sql
-- Should return 0 rows (UNIQUE constraint)
SELECT abbreviation, COUNT(*)
FROM positions
GROUP BY abbreviation
HAVING COUNT(*) > 1;
```

---

## Testing & Debugging

### Test Position Query

```bash
# Get all positions
node -e "
const { getSupabaseClient } = require('./scripts/utils/supabase-client.js');
const supabase = getSupabaseClient();
supabase.from('positions').select('*').order('sort_order').then(({ data }) => {
  console.table(data);
});
"
```

### Verify Position Groups

```bash
node -e "
const { getSupabaseClient } = require('./scripts/utils/supabase-client.js');
const supabase = getSupabaseClient();
supabase.from('positions').select('position_group').then(({ data }) => {
  const groups = [...new Set(data.map(p => p.position_group))];
  console.log('Position Groups:', groups);
});
"
```

---

## Known Limitations

### 1. No Foreign Key to Players ⚠️

**Issue**: `players.primary_position` is varchar, not FK to positions.

**Impact**: Can't enforce referential integrity with automatic joins.

**Workaround**: Application-level validation when creating players.

---

### 2. Static Data ⚠️

**Issue**: Positions don't auto-update if NFL changes.

**Impact**: Manual updates required if new positions added.

**Solution**: Edit JSON file and re-seed.

---

## Documentation Links

- **Field Mapping**: `POSITIONS-RESOURCES/field-mapping-report.md` - All 5 fields documented
- **Raw Data Sources**: `POSITIONS-RESOURCES/raw-data-source-mapping.md` - JSON structure
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000003_create_foundation_tables.sql` (lines 67-81)
- **Seed Script**: scripts/seed/03-players.js:36-48
- **Data File**: scripts/data/positions.json

---

## Quick Commands

```bash
# Seed positions
npm run seed:players

# Query all positions
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('positions').select('*').order('sort_order').then(({ data }) => console.table(data));"
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 5
**Total Records**: ~25-30 positions
**Status**: ✅ Production Ready
**CodeRef**: 03-players.js:42-45 ✅ Validated
