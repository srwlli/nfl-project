# Team Aliases - Raw Data Source Mapping

> **Table**: `team_aliases`
> **Source**: Hardcoded in migration file
> **Migration**: 20250101000023_add_team_aliases.sql
> **CodeRef**: `20250101000023_add_team_aliases.sql:34-230`
> **Date**: October 22, 2025

---

## Data Source

**Type**: SQL INSERT statements in migration
**Location**: `supabase/migrations/20250101000023_add_team_aliases.sql`
**Update Frequency**: Manual (one-time migration, rarely updated)
**Trigger**: Database migration apply

---

## Migration Structure

**File**: `supabase/migrations/20250101000023_add_team_aliases.sql`

Lines 34-230 contain INSERT statements for all 132 aliases.

```sql
INSERT INTO team_aliases (alias, canonical_team_id, source, is_primary) VALUES
  -- Arizona Cardinals
  ('ARI', 'ARI', 'canonical', true),
  ('Arizona', 'ARI', 'user_input', false),
  ('Cardinals', 'ARI', 'user_input', false),
  ('Arizona Cardinals', 'ARI', 'user_input', false),

  -- Washington Commanders (WAS/WSH problem)
  ('WAS', 'WAS', 'canonical', true),
  ('WSH', 'WAS', 'ESPN', false),
  ('Washington', 'WAS', 'user_input', false),
  ('Commanders', 'WAS', 'user_input', false),
  ('Washington Commanders', 'WAS', 'user_input', false)
ON CONFLICT (alias) DO NOTHING;
```

---

## Field Mapping

| Database Column | Migration Value | Type | Transform | Notes |
|-----------------|-----------------|------|-----------|-------|
| `alias_id` | Auto-generated | serial | Auto-increment | PK |
| `alias` | Hardcoded string | varchar(50) | Direct | UNIQUE constraint |
| `canonical_team_id` | Hardcoded string | varchar(10) | Direct | The "official" ID |
| `source` | Hardcoded enum | varchar(50) | Direct | 'canonical', 'ESPN', 'user_input', etc. |
| `is_primary` | Hardcoded boolean | boolean | Direct | Only one true per team |
| `created_at` | Not specified | timestamptz | Default NOW() | Auto-timestamp |

---

## Transformation Logic

### Loading Process

No transformation - values are directly inserted from migration SQL:

```sql
INSERT INTO team_aliases (alias, canonical_team_id, source, is_primary) VALUES
  ('WSH', 'WAS', 'ESPN', false)
```

**Conflict Handling:**
```sql
ON CONFLICT (alias) DO NOTHING;
```

If migration re-runs, duplicate aliases are ignored (no error).

---

## Complete Alias Patterns

### Pattern 1: Canonical ID (32 aliases)

**Purpose**: The "official" abbreviation we use internally.

```sql
('WAS', 'WAS', 'canonical', true)
('KC', 'KC', 'canonical', true)
('SF', 'SF', 'canonical', true)
```

**Characteristics:**
- `is_primary = true` (only one per team)
- `alias === canonical_team_id`
- Source: `'canonical'`

---

### Pattern 2: ESPN Aliases (4 aliases)

**Purpose**: ESPN API uses different abbreviations for some teams.

```sql
('WSH', 'WAS', 'ESPN', false)  -- Washington
('GNB', 'GB', 'ESPN', false)   -- Green Bay
('JAC', 'JAX', 'ESPN', false)  -- Jacksonville
```

**Mapping:**
- WSH (ESPN) → WAS (canonical)
- GNB (ESPN) → GB (canonical)
- JAC (ESPN) → JAX (canonical)

---

### Pattern 3: City Names (32 aliases)

**Purpose**: Allow searching by city name.

```sql
('Washington', 'WAS', 'user_input', false)
('Kansas City', 'KC', 'user_input', false)
('Green Bay', 'GB', 'user_input', false)
```

**All cities:**
Arizona, Atlanta, Baltimore, Buffalo, Carolina, Chicago, Cincinnati, Cleveland, Dallas, Denver, Detroit, Green Bay, Houston, Indianapolis, Jacksonville, Kansas City, Los Angeles (2x), Las Vegas, Miami, Minnesota, New England, New Orleans, New York (2x), Philadelphia, Pittsburgh, San Francisco, Seattle, Tampa Bay, Tennessee, Washington

---

### Pattern 4: Mascots (32 aliases)

**Purpose**: Allow searching by team mascot name.

```sql
('Cardinals', 'ARI', 'user_input', false)
('Chiefs', 'KC', 'user_input', false)
('Commanders', 'WAS', 'user_input', false)
```

**All mascots:**
Cardinals, Falcons, Ravens, Bills, Panthers, Bears, Bengals, Browns, Cowboys, Broncos, Lions, Packers, Texans, Colts, Jaguars, Chiefs, Chargers, Rams, Raiders, Dolphins, Vikings, Patriots, Saints, Giants, Jets, Eagles, Steelers, 49ers, Seahawks, Buccaneers (Bucs), Titans, Commanders

---

### Pattern 5: Full Names (32+ aliases)

**Purpose**: Allow searching by full team name.

```sql
('Washington Commanders', 'WAS', 'user_input', false)
('Kansas City Chiefs', 'KC', 'user_input', false)
('Tampa Bay Buccaneers', 'TB', 'user_input', false)
```

**All full names:**
Arizona Cardinals, Atlanta Falcons, Baltimore Ravens, Buffalo Bills, Carolina Panthers, Chicago Bears, Cincinnati Bengals, Cleveland Browns, Dallas Cowboys, Denver Broncos, Detroit Lions, Green Bay Packers, Houston Texans, Indianapolis Colts, Jacksonville Jaguars, Kansas City Chiefs, Los Angeles Chargers, Los Angeles Rams, Las Vegas Raiders, Miami Dolphins, Minnesota Vikings, New England Patriots, New Orleans Saints, New York Giants, New York Jets, Philadelphia Eagles, Pittsburgh Steelers, San Francisco 49ers, Seattle Seahawks, Tampa Bay Buccaneers, Tennessee Titans, Washington Commanders

---

### Pattern 6: Nicknames (1 alias)

**Purpose**: Common abbreviations for team names.

```sql
('Bucs', 'TB', 'user_input', false)  -- Tampa Bay Buccaneers
```

---

## Example: Washington Commanders (WAS)

**All 5 aliases:**

```sql
('WAS', 'WAS', 'canonical', true),               -- ✅ Primary canonical
('WSH', 'WAS', 'ESPN', false),                   -- ESPN uses WSH
('Washington', 'WAS', 'user_input', false),      -- City
('Commanders', 'WAS', 'user_input', false),      -- Mascot
('Washington Commanders', 'WAS', 'user_input', false)  -- Full name
```

**Database result:**
```json
[
  {
    "alias_id": 128,
    "alias": "WAS",
    "canonical_team_id": "WAS",
    "source": "canonical",
    "is_primary": true,
    "created_at": "2025-10-22T02:26:31.949085+00:00"
  },
  {
    "alias_id": 129,
    "alias": "WSH",
    "canonical_team_id": "WAS",
    "source": "ESPN",
    "is_primary": false,
    "created_at": "2025-10-22T02:26:31.949085+00:00"
  },
  {
    "alias_id": 130,
    "alias": "Washington",
    "canonical_team_id": "WAS",
    "source": "user_input",
    "is_primary": false,
    "created_at": "2025-10-22T02:26:31.949085+00:00"
  },
  {
    "alias_id": 131,
    "alias": "Commanders",
    "canonical_team_id": "WAS",
    "source": "user_input",
    "is_primary": false,
    "created_at": "2025-10-22T02:26:31.949085+00:00"
  },
  {
    "alias_id": 132,
    "alias": "Washington Commanders",
    "canonical_team_id": "WAS",
    "source": "user_input",
    "is_primary": false,
    "created_at": "2025-10-22T02:26:31.949085+00:00"
  }
]
```

---

## Data Validation

### Required Fields

All 4 fields must be provided in INSERT:

```sql
INSERT INTO team_aliases (alias, canonical_team_id, source, is_primary) VALUES
  ('WSH', 'WAS', 'ESPN', false)
```

### Unique Constraint

`alias` must be unique across all rows:

```sql
-- ✅ Valid
('WSH', 'WAS', 'ESPN', false)

-- ❌ Duplicate (will be ignored by ON CONFLICT)
('WSH', 'GB', 'ESPN', false)  -- Can't have same alias map to different team
```

### One Primary Per Team

Only one alias can have `is_primary = true` per `canonical_team_id`:

```sql
-- ✅ Valid (one primary)
('WAS', 'WAS', 'canonical', true)
('WSH', 'WAS', 'ESPN', false)

-- ⚠️ No database constraint enforces this (application-level validation)
```

---

## Update Strategy

### Initial Migration (Done)

```bash
# Applied via Supabase CLI
supabase db push
```

### Adding New Aliases (Future)

**Option 1: New migration file**
```sql
-- supabase/migrations/20250101000024_add_new_aliases.sql
INSERT INTO team_aliases (alias, canonical_team_id, source, is_primary) VALUES
  ('Washington Football Team', 'WAS', 'historical', false)  -- Old name
ON CONFLICT (alias) DO NOTHING;
```

**Option 2: Direct insert**
```javascript
await supabase.from('team_aliases').insert({
  alias: 'Washington Football Team',
  canonical_team_id: 'WAS',
  source: 'historical',
  is_primary: false
})
```

---

## Error Handling

### Duplicate Alias

**Migration re-run with existing alias:**
```sql
INSERT INTO team_aliases (alias, canonical_team_id, source, is_primary) VALUES
  ('WSH', 'WAS', 'ESPN', false)
ON CONFLICT (alias) DO NOTHING;
```

**Result**: Silent ignore (no error) due to `ON CONFLICT DO NOTHING`.

---

### Invalid Canonical Team ID

**Alias references non-existent team:**
```sql
INSERT INTO team_aliases (alias, canonical_team_id, source, is_primary) VALUES
  ('ABC', 'INVALID', 'test', false)
```

**Result**: ⚠️ No FK constraint enforced - record will be inserted but unusable.

**Validation**: Application-level check via `teams` table.

---

## Source Categories

### canonical (32 records)
- The official abbreviation we use
- `is_primary = true`
- Examples: WAS, KC, SF

### ESPN (4 records)
- ESPN API-specific abbreviations
- Maps to canonical equivalents
- Examples: WSH → WAS, GNB → GB, JAC → JAX

### user_input (96 records)
- Human-friendly variations
- City names, mascots, full names, nicknames
- Examples: "Washington", "Commanders", "Washington Commanders"

### Future sources (not yet used)
- `'The Odds API'` - Betting API team names
- `'historical'` - Old team names (Oakland Raiders, etc.)
- `'international'` - International variations

---

## Complete Mapping Table

| Database Field | Migration Value | Default | Transform | Validation |
|----------------|-----------------|---------|-----------|------------|
| alias_id | Auto | nextval() | Auto-increment | SERIAL PK |
| alias | Hardcoded | - | Direct | UNIQUE, NOT NULL, VARCHAR(50) |
| canonical_team_id | Hardcoded | - | Direct | NOT NULL, VARCHAR(10) |
| source | Hardcoded | NULL | Direct | VARCHAR(50) |
| is_primary | Hardcoded | false | Direct | BOOLEAN |
| created_at | N/A | NOW() | Auto | TIMESTAMPTZ |

---

## Related Documentation

- **Field Mapping Report**: `field-mapping-report.md`
- **Migration File**: `supabase/migrations/20250101000023_add_team_aliases.sql`
- **Utility Script**: `scripts/utils/team-normalizer.js`

---

**Last Updated**: October 22, 2025
**Status**: ✅ Validated
**CodeRef**: 20250101000023:34-230
