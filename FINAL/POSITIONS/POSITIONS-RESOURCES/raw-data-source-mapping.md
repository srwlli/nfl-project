# Positions - Raw Data Source Mapping

> **Table**: `positions`
> **Source**: JSON file (static reference data)
> **Seed Script**: 03-players.js
> **CodeRef**: `03-players.js:42-45`
> **Date**: October 22, 2025

---

## Data Source

**Type**: Static JSON file
**Location**: `scripts/data/positions.json`
**Seed Script**: `scripts/seed/03-players.js`
**Update Frequency**: Manual (one-time seed, rarely updated)

---

## JSON File Structure

**File**: `scripts/data/positions.json`

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
  },
  {
    "position_id": "wr",
    "position_name": "Wide Receiver",
    "position_group": "Offense",
    "abbreviation": "WR",
    "sort_order": 3
  }
]
```

---

## Field Mapping

| Database Column | JSON Key | Type | Transform | Notes |
|-----------------|----------|------|-----------|-------|
| `position_id` | `position_id` | varchar(10) | Direct | Lowercase ID |
| `position_name` | `position_name` | varchar(50) | Direct | Full name |
| `position_group` | `position_group` | varchar(20) | Direct | Offense/Defense/Special Teams |
| `abbreviation` | `abbreviation` | varchar(5) | Direct | Uppercase (QB, RB, etc.) |
| `sort_order` | `sort_order` | integer | Direct | Display order |

---

## Transformation Logic

### Loading Process

```javascript
// scripts/seed/03-players.js:40-45

if (positionsCount === 0) {
  logger.info('Positions table is empty, seeding positions first...')
  const positionsPath = join(__dirname, '../data/positions.json')
  const positionsData = JSON.parse(readFileSync(positionsPath, 'utf-8'))
  await insertBatch('positions', positionsData)
  logger.info(`✓ Seeded ${positionsData.length} positions`)
}
```

**No transformation** - JSON structure matches database schema exactly.

---

## Complete Position List

### Offense (sort_order 1-11):
```json
[
  {"position_id": "qb", "position_name": "Quarterback", "abbreviation": "QB", "position_group": "Offense", "sort_order": 1},
  {"position_id": "rb", "position_name": "Running Back", "abbreviation": "RB", "position_group": "Offense", "sort_order": 2},
  {"position_id": "fb", "position_name": "Fullback", "abbreviation": "FB", "position_group": "Offense", "sort_order": 3},
  {"position_id": "wr", "position_name": "Wide Receiver", "abbreviation": "WR", "position_group": "Offense", "sort_order": 4},
  {"position_id": "te", "position_name": "Tight End", "abbreviation": "TE", "position_group": "Offense", "sort_order": 5},
  {"position_id": "lt", "position_name": "Left Tackle", "abbreviation": "LT", "position_group": "Offense", "sort_order": 6},
  {"position_id": "lg", "position_name": "Left Guard", "abbreviation": "LG", "position_group": "Offense", "sort_order": 7},
  {"position_id": "c", "position_name": "Center", "abbreviation": "C", "position_group": "Offense", "sort_order": 8},
  {"position_id": "rg", "position_name": "Right Guard", "abbreviation": "RG", "position_group": "Offense", "sort_order": 9},
  {"position_id": "rt", "position_name": "Right Tackle", "abbreviation": "RT", "position_group": "Offense", "sort_order": 10},
  {"position_id": "ol", "position_name": "Offensive Line", "abbreviation": "OL", "position_group": "Offense", "sort_order": 11}
]
```

### Defense (sort_order 12-22):
```json
[
  {"position_id": "de", "position_name": "Defensive End", "abbreviation": "DE", "position_group": "Defense", "sort_order": 12},
  {"position_id": "dt", "position_name": "Defensive Tackle", "abbreviation": "DT", "position_group": "Defense", "sort_order": 13},
  {"position_id": "nt", "position_name": "Nose Tackle", "abbreviation": "NT", "position_group": "Defense", "sort_order": 14},
  {"position_id": "olb", "position_name": "Outside Linebacker", "abbreviation": "OLB", "position_group": "Defense", "sort_order": 15},
  {"position_id": "mlb", "position_name": "Middle Linebacker", "abbreviation": "MLB", "position_group": "Defense", "sort_order": 16},
  {"position_id": "ilb", "position_name": "Inside Linebacker", "abbreviation": "ILB", "position_group": "Defense", "sort_order": 17},
  {"position_id": "lb", "position_name": "Linebacker", "abbreviation": "LB", "position_group": "Defense", "sort_order": 18},
  {"position_id": "cb", "position_name": "Cornerback", "abbreviation": "CB", "position_group": "Defense", "sort_order": 19},
  {"position_id": "fs", "position_name": "Free Safety", "abbreviation": "FS", "position_group": "Defense", "sort_order": 20},
  {"position_id": "ss", "position_name": "Strong Safety", "abbreviation": "SS", "position_group": "Defense", "sort_order": 21},
  {"position_id": "s", "position_name": "Safety", "abbreviation": "S", "position_group": "Defense", "sort_order": 22}
]
```

### Special Teams (sort_order 23-25):
```json
[
  {"position_id": "k", "position_name": "Kicker", "abbreviation": "K", "position_group": "Special Teams", "sort_order": 23},
  {"position_id": "p", "position_name": "Punter", "abbreviation": "P", "position_group": "Special Teams", "sort_order": 24},
  {"position_id": "ls", "position_name": "Long Snapper", "abbreviation": "LS", "position_group": "Special Teams", "sort_order": 25}
]
```

---

## Data Validation

### Required Fields

All 5 fields are required in JSON:

```javascript
// Validation (not implemented, but recommended)
const validatePosition = (pos) => {
  if (!pos.position_id || !pos.position_name || !pos.abbreviation) {
    throw new Error('Missing required position fields')
  }

  if (!['Offense', 'Defense', 'Special Teams'].includes(pos.position_group)) {
    throw new Error('Invalid position_group')
  }
}
```

### Unique Constraints

- `position_id` - Must be unique (PK)
- `abbreviation` - Must be unique (UNIQUE constraint)

---

## Update Strategy

### One-Time Seed

Positions are seeded once and rarely change:

```bash
# Seed positions (part of player seed)
npm run seed:players
```

### Manual Updates

If NFL introduces new positions:

1. Edit `scripts/data/positions.json`
2. Add new position entry
3. Re-run seed script (will skip if positions exist)
4. Or manually insert new position:

```javascript
await supabase.from('positions').insert({
  position_id: 'new_pos',
  position_name: 'New Position',
  position_group: 'Offense',
  abbreviation: 'NP',
  sort_order: 26
})
```

---

## Error Handling

### Duplicate Keys

**JSON has duplicate position_id:**
```javascript
// Will fail on insert due to PK constraint
await insertBatch('positions', positionsData)
// Error: duplicate key value violates unique constraint "positions_pkey"
```

**Solution**: Ensure JSON has unique position_id values.

---

### Invalid position_group

**JSON has invalid position_group:**
```json
{
  "position_id": "qb",
  "position_group": "InvalidGroup"  // Will fail CHECK constraint
}
```

**Solution**: Only use: `'Offense'`, `'Defense'`, `'Special Teams'`

---

## Complete Mapping Table

| Database Field | JSON Key | Default | Transform | Validation |
|----------------|----------|---------|-----------|------------|
| position_id | position_id | - | Direct | PK, VARCHAR(10) |
| position_name | position_name | - | Direct | NOT NULL |
| position_group | position_group | NULL | Direct | CHECK (Offense/Defense/Special Teams) |
| abbreviation | abbreviation | - | Direct | UNIQUE, NOT NULL |
| sort_order | sort_order | NULL | Direct | INTEGER |
| created_at | N/A | now() | Auto | Timestamp |
| updated_at | N/A | now() | Auto | Timestamp |
| deleted_at | N/A | NULL | Soft delete | Timestamp |

---

## Related Documentation

- **Field Mapping Report**: `field-mapping-report.md`
- **Seed Script**: `scripts/seed/03-players.js`
- **Data File**: `scripts/data/positions.json`
- **Database Schema**: `supabase/migrations/20250101000003_create_foundation_tables.sql:67-81`

---

**Last Updated**: October 22, 2025
**Status**: ✅ Validated
**CodeRef**: 03-players.js:42-45
