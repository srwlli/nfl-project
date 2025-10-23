# Seasons - Raw Data Source Mapping

> **Table**: `seasons`
> **Source**: Hardcoded in seed script
> **Seed Script**: 04-schedule.js
> **CodeRef**: `04-schedule.js:28-32`
> **Date**: October 22, 2025

---

## Data Source

**Type**: Hardcoded values in seed script
**Location**: `scripts/seed/04-schedule.js`
**Update Frequency**: Once per season (manual)
**Trigger**: Part of schedule seeding process

---

## Seed Script Structure

**File**: `scripts/seed/04-schedule.js`

```javascript
// Lines 23-39

// Step 0: Ensure 2025 season exists
logger.info('Step 0: Checking if 2025 season exists...')
const { insertBatch } = await import('../utils/supabase-client.js')

try {
  await insertBatch('seasons', [{
    season: SEASON_YEAR,           // 2025
    start_date: '2025-09-04',      // First Thursday in September
    end_date: '2026-02-09'         // Estimated Super Bowl date
  }])
  logger.info('✓ Created 2025 season record')
} catch (error) {
  if (error.message?.includes('duplicate key')) {
    logger.info('✓ 2025 season already exists')
  } else {
    throw error
  }
}
```

---

## Field Mapping

| Database Column | Seed Script Value | Type | Transform | Notes |
|-----------------|-------------------|------|-----------|-------|
| `season` | `SEASON_YEAR` (2025) | integer | Direct | Primary key |
| `start_date` | `'2025-09-04'` | date | Direct | Season kickoff |
| `end_date` | `'2026-02-09'` | date | Direct | Estimated Super Bowl |
| `super_bowl_winner` | Not seeded | varchar(10) | NULL | Updated post-season |
| `super_bowl_runner_up` | Not seeded | varchar(10) | NULL | Updated post-season |
| `super_bowl_location` | Not seeded | varchar(100) | NULL | Updated post-season |
| `super_bowl_date` | Not seeded | date | NULL | Updated post-season |
| `regular_season_weeks` | Database default | integer | Default 17 | Not explicitly set |

---

## Transformation Logic

### Loading Process

```javascript
// scripts/seed/04-schedule.js:28-32

const SEASON_YEAR = 2025  // Hardcoded constant

await insertBatch('seasons', [{
  season: SEASON_YEAR,
  start_date: '2025-09-04',
  end_date: '2026-02-09'
}])
```

**No transformation** - Values are hardcoded in script.

---

## Complete Season Record

### 2025 Season (Current)

```json
{
  "season": 2025,
  "start_date": "2025-09-04",
  "end_date": "2026-02-09",
  "super_bowl_winner": null,
  "super_bowl_runner_up": null,
  "super_bowl_location": null,
  "super_bowl_date": null,
  "regular_season_weeks": 17,
  "created_at": "2025-10-18T09:57:51.041327",
  "updated_at": "2025-10-18T09:57:51.041327",
  "deleted_at": null
}
```

---

## How Dates Are Determined

### Start Date Calculation

**NFL Season Start Pattern:**
- First game: Thursday after Labor Day (first Monday in September)
- 2025: Labor Day is September 1, so first Thursday is September 4

**Hardcoded value:** `'2025-09-04'`

### End Date Calculation

**Super Bowl Date Pattern:**
- Played in early February (usually first or second Sunday)
- Approximately 5 months after season start
- 2026 Super Bowl: February 9, 2026

**Hardcoded value:** `'2026-02-09'`

---

## Update Strategy

### Initial Seed (Done)

```bash
# Seed 2025 season (part of schedule seed)
npm run seed:schedule
```

### Adding New Seasons (Future)

**Manual approach:**
1. Edit `scripts/seed/04-schedule.js`
2. Update `SEASON_YEAR` constant
3. Update start/end dates
4. Re-run seed script

**Example for 2026:**
```javascript
const SEASON_YEAR = 2026

await insertBatch('seasons', [{
  season: 2026,
  start_date: '2026-09-10',  // First Thursday after Labor Day
  end_date: '2027-02-07'     // Estimated Super Bowl Sunday
}])
```

### Updating Super Bowl Fields (Post-Season)

**Manual update after championship game:**
```javascript
await supabase.from('seasons').update({
  super_bowl_winner: 'KC',
  super_bowl_runner_up: 'SF',
  super_bowl_location: 'Las Vegas, NV',
  super_bowl_date: '2026-02-09'
}).eq('season', 2025)
```

---

## Data Validation

### Required Fields

Only 2 fields are required in seed:
```javascript
{
  season: 2025,        // PRIMARY KEY (required)
  start_date: '2025-09-04'  // NOT NULL (required)
}
```

### Optional Fields

All other fields are nullable:
- `end_date` - Usually provided but nullable
- `super_bowl_winner` - NULL until Super Bowl played
- `super_bowl_runner_up` - NULL until Super Bowl played
- `super_bowl_location` - NULL until Super Bowl played
- `super_bowl_date` - NULL until Super Bowl played
- `regular_season_weeks` - Has database default of 17

---

## Error Handling

### Duplicate Season

**Seed already run:**
```javascript
// Error: duplicate key value violates unique constraint "seasons_pkey"
```

**Handled by script:**
```javascript
if (error.message?.includes('duplicate key')) {
  logger.info('✓ 2025 season already exists')
}
```

**Solution**: Script gracefully handles duplicates, no action needed.

---

### Invalid Season Year

**Season outside valid range:**
```sql
-- Constraint: season >= 1970 AND season <= 2030
```

**Error:**
```
new row for relation "seasons" violates check constraint "seasons_season_check"
```

**Solution**: Only seed seasons between 1970 and 2030.

---

## Historical Data (Not Yet Seeded)

### Example: 2024 Season

```javascript
await insertBatch('seasons', [{
  season: 2024,
  start_date: '2024-09-05',
  end_date: '2025-02-09',
  super_bowl_winner: 'KC',
  super_bowl_runner_up: 'SF',
  super_bowl_location: 'Las Vegas, NV',
  super_bowl_date: '2025-02-09',
  regular_season_weeks: 17
}])
```

### Example: 2023 Season

```javascript
await insertBatch('seasons', [{
  season: 2023,
  start_date: '2023-09-07',
  end_date: '2024-02-11',
  super_bowl_winner: 'KC',
  super_bowl_runner_up: 'SF',
  super_bowl_location: 'Glendale, AZ',
  super_bowl_date: '2024-02-11',
  regular_season_weeks: 17
}])
```

---

## Complete Mapping Table

| Database Field | Seed Value | Default | Transform | Validation |
|----------------|------------|---------|-----------|------------|
| season | SEASON_YEAR (2025) | - | Direct | PK, INTEGER, 1970-2030 |
| start_date | '2025-09-04' | - | Direct | NOT NULL, DATE |
| end_date | '2026-02-09' | NULL | Direct | DATE |
| super_bowl_winner | Not seeded | NULL | NULL | VARCHAR(10) |
| super_bowl_runner_up | Not seeded | NULL | NULL | VARCHAR(10) |
| super_bowl_location | Not seeded | NULL | NULL | VARCHAR(100) |
| super_bowl_date | Not seeded | NULL | NULL | DATE |
| regular_season_weeks | Not seeded | 17 | Default | INTEGER |
| created_at | N/A | now() | Auto | Timestamp |
| updated_at | N/A | now() | Auto | Timestamp |
| deleted_at | N/A | NULL | Soft delete | Timestamp |

---

## Related Documentation

- **Field Mapping Report**: `field-mapping-report.md`
- **Seed Script**: `scripts/seed/04-schedule.js`
- **Database Schema**: `supabase/migrations/20250101000004_create_core_entity_tables.sql:8-25`

---

**Last Updated**: October 22, 2025
**Status**: ✅ Validated
**CodeRef**: 04-schedule.js:28-32
