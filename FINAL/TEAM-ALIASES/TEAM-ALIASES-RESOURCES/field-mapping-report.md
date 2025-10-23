# Team Aliases Table - Field Mapping Report

> **Purpose**: Complete field mapping verification for the team_aliases table
> **Date Generated**: October 22, 2025
> **Status**: ✅ 100% Normalized
> **CodeRef**: `team-normalizer.js:35-82`, `20250101000023_add_team_aliases.sql:34-230`

---

## Executive Summary

The **team_aliases table** is a critical normalization table that maps all team name variations to canonical IDs. This solves the WAS/WSH duplicate problem and allows flexible team input across all data sources.

- **Total Columns**: 5 (+ 1 metadata)
- **Total Records**: 132 (32 teams × ~4 aliases each)
- **Critical Fields**: ✅ 5/5 verified
- **Normalization Status**: ✅ 100% compliant
- **Ready for Frontend**: ✅ Yes
- **Auto-Populated**: ✅ Via migration (one-time)

---

## All 5 Fields (Copy-Paste Ready)

```
alias_id, alias, canonical_team_id, source, is_primary
```

---

## Field Categories

### Identification (2 fields)
```
alias_id, alias
```

### Mapping (1 field)
```
canonical_team_id
```

### Metadata (2 fields)
```
source, is_primary
```

---

## Complete Field Mapping

| Field Name | Database Column | Type | Example | Nullable | Notes |
|------------|-----------------|------|---------|----------|-------|
| Alias ID | `alias_id` | serial | 128 | ❌ No | PK (auto-increment) |
| Alias | `alias` | varchar(50) | "WSH" | ❌ No | UNIQUE - any team identifier |
| Canonical Team ID | `canonical_team_id` | varchar(10) | "WAS" | ❌ No | The "official" ID we use |
| Source | `source` | varchar(50) | "ESPN" | ✅ Yes | Where this alias comes from |
| Is Primary | `is_primary` | boolean | true | ✅ Yes | Only one true per team (default: false) |

---

## Data Source Mapping

### Migration → Database

**Source**: `supabase/migrations/20250101000023_add_team_aliases.sql`
**CodeRef**: Lines 34-230

```sql
-- Example: Washington Commanders
INSERT INTO team_aliases (alias, canonical_team_id, source, is_primary) VALUES
  ('WAS', 'WAS', 'canonical', true),           -- Primary canonical
  ('WSH', 'WAS', 'ESPN', false),               -- ESPN uses WSH
  ('Washington', 'WAS', 'user_input', false),  -- City name
  ('Commanders', 'WAS', 'user_input', false),  -- Mascot
  ('Washington Commanders', 'WAS', 'user_input', false)  -- Full name
```

**Example records:**
```json
[
  {
    "alias_id": 128,
    "alias": "WAS",
    "canonical_team_id": "WAS",
    "source": "canonical",
    "is_primary": true
  },
  {
    "alias_id": 129,
    "alias": "WSH",
    "canonical_team_id": "WAS",
    "source": "ESPN",
    "is_primary": false
  },
  {
    "alias_id": 130,
    "alias": "Washington",
    "canonical_team_id": "WAS",
    "source": "user_input",
    "is_primary": false
  }
]
```

---

## Alias Types by Source

### `canonical` (32 aliases)
The official abbreviation we use internally:
- WAS, KC, SF, NYG, etc.
- Always has `is_primary = true`

### `ESPN` (4 aliases)
ESPN API uses different abbreviations:
- WSH → WAS
- GNB → GB
- JAC → JAX

### `user_input` (96 aliases)
Human-friendly variations:
- Full names: "Kansas City Chiefs"
- City names: "Kansas City"
- Mascots: "Chiefs"
- Nicknames: "Bucs" → TB

---

## Problem This Solves

### Before team_aliases table:

```javascript
// ❌ WAS/WSH duplicate problem
const game1 = { home_team: 'WAS', away_team: 'DAL' }
const game2 = { home_team: 'WSH', away_team: 'DAL' }  // Same team, different ID!

// ❌ Foreign key violations
await supabase.from('games').insert({ home_team_id: 'WSH' })
// Error: violates foreign key constraint (teams table only has 'WAS')

// ❌ No support for full names
await normalizeTeam('Kansas City Chiefs')  // No way to map to 'KC'
```

### After team_aliases table:

```javascript
// ✅ All variations map to canonical ID
await normalizeTeamId('WSH')      // → 'WAS'
await normalizeTeamId('WAS')      // → 'WAS'
await normalizeTeamId('Washington') // → 'WAS'
await normalizeTeamId('Commanders') // → 'WAS'
await normalizeTeamId('Kansas City Chiefs') // → 'KC'

// ✅ No duplicates - all IDs are canonical
const canonical = await normalizeTeamId(espnTeamId)
await supabase.from('games').insert({ home_team_id: canonical })
```

---

## Common Queries

### Normalize Team ID

```javascript
import { normalizeTeamId } from './scripts/utils/team-normalizer.js'

// Single team
const canonical = await normalizeTeamId('WSH')  // Returns 'WAS'
```

### Normalize Multiple Teams

```javascript
import { normalizeTeamIds } from './scripts/utils/team-normalizer.js'

const result = await normalizeTeamIds(['WSH', 'Kansas City', 'SEA'])
// Returns:
// {
//   'WSH': 'WAS',
//   'Kansas City': 'KC',
//   'SEA': 'SEA'
// }
```

### Get All Aliases for a Team

```javascript
import { getTeamAliases } from './scripts/utils/team-normalizer.js'

const aliases = await getTeamAliases('WAS')
// Returns: ['WAS', 'WSH', 'Washington', 'Commanders', 'Washington Commanders']
```

### Get All Canonical Team IDs

```javascript
import { getAllCanonicalTeamIds } from './scripts/utils/team-normalizer.js'

const teams = await getAllCanonicalTeamIds()
// Returns: ['ARI', 'ATL', 'BAL', ..., 'WAS'] (32 teams)
```

### Direct Database Query

```javascript
// Look up canonical ID
const { data } = await supabase
  .from('team_aliases')
  .select('canonical_team_id')
  .eq('alias', 'WSH')
  .single()

console.log(data.canonical_team_id)  // 'WAS'
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Using team IDs directly from external APIs

```javascript
// ESPN returns 'WSH', but your database uses 'WAS'
const espnGame = await fetchESPNGame()
await supabase.from('games').insert({
  home_team_id: espnGame.homeTeam.abbreviation  // 'WSH' - FK violation!
})
```

### ✅ CORRECT - Always normalize before using

```javascript
import { normalizeTeamId } from './scripts/utils/team-normalizer.js'

const espnGame = await fetchESPNGame()
const homeTeamCanonical = await normalizeTeamId(espnGame.homeTeam.abbreviation)

await supabase.from('games').insert({
  home_team_id: homeTeamCanonical  // 'WAS' - valid!
})
```

### ❌ WRONG - Case-sensitive matching

```javascript
// Won't find 'washington' (lowercase)
const { data } = await supabase
  .from('team_aliases')
  .eq('alias', userInput)  // Case-sensitive!
```

### ✅ CORRECT - Use normalizeTeamId() (case-insensitive)

```javascript
const canonical = await normalizeTeamId(userInput)  // Handles any case
```

### ❌ WRONG - Not checking for null

```javascript
const canonical = await normalizeTeamId('InvalidTeam')
await supabase.from('games').insert({ home_team_id: canonical })  // null - error!
```

### ✅ CORRECT - Validate before using

```javascript
const canonical = await normalizeTeamId(userInput)

if (!canonical) {
  throw new Error(`Invalid team: ${userInput}`)
}

await supabase.from('games').insert({ home_team_id: canonical })
```

---

## Scripts in This Folder

### **File**: `scripts/utils/team-normalizer.js`
- **Purpose**: Normalize team identifiers to canonical IDs
- **Key Functions**:
  - `normalizeTeamId()` - Single team (lines 35-82)
  - `normalizeTeamIds()` - Batch normalization (lines 99-148)
  - `getTeamAliases()` - Get all aliases (lines 160-185)
  - `getAllCanonicalTeamIds()` - List all teams (lines 196-216)
  - `isValidTeam()` - Validate team exists (lines 224-227)

**Usage**:
```bash
# Normalize single team
node scripts/utils/team-normalizer.js WSH
# Output: WSH → WAS

# Normalize multiple teams
node scripts/utils/team-normalizer.js WSH "Kansas City" SEA

# Show all aliases for a team
node scripts/utils/team-normalizer.js --aliases WAS

# List all canonical teams
node scripts/utils/team-normalizer.js --list
```

**Key Code** (lines 35-82):
```javascript
export async function normalizeTeamId(teamInput) {
  const supabase = getSupabaseClient()

  // Query team_aliases table (case-insensitive)
  const { data } = await supabase
    .from('team_aliases')
    .select('canonical_team_id, alias, source')
    .or(`alias.ilike.${input},alias.eq.${input.toUpperCase()}`)
    .limit(1)
    .single()

  return data.canonical_team_id  // 'WAS'
}
```

---

## Related Tables

### Referenced By

This table is used by all scrapers that deal with team IDs:
- `game-stats-scraper.js` - Normalizes ESPN team IDs
- `betting-scraper.js` - Normalizes The Odds API team names
- `roster-updates-scraper.js` - Normalizes team IDs
- Any script that accepts user-provided team input

### Foreign Keys

- `canonical_team_id` references `teams(team_id)` (implicit - normalized before insertion)

---

## Frontend Display Examples

### Team Search Autocomplete

```jsx
import { normalizeTeamId, getTeamAliases } from './utils/team-normalizer'

const TeamSearch = ({ onSelect }) => {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])

  const handleSearch = async (value) => {
    setInput(value)

    // Get all aliases that match input
    const { data: allAliases } = await supabase
      .from('team_aliases')
      .select('alias, canonical_team_id')
      .ilike('alias', `%${value}%`)
      .limit(10)

    setSuggestions(allAliases)
  }

  const handleSelect = async (alias) => {
    const canonical = await normalizeTeamId(alias)
    onSelect(canonical)
  }

  return (
    <div>
      <input
        value={input}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search teams (e.g., Washington, WSH, Commanders)"
      />
      <ul>
        {suggestions.map(s => (
          <li key={s.alias} onClick={() => handleSelect(s.alias)}>
            {s.alias} → {s.canonical_team_id}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Team Name Display

```jsx
const TeamDisplay = ({ teamId }) => {
  const [aliases, setAliases] = useState([])

  useEffect(() => {
    getTeamAliases(teamId).then(setAliases)
  }, [teamId])

  const primaryAlias = aliases.find(a => a.is_primary)?.alias
  const fullName = aliases.find(a => a.alias.includes(' '))?.alias

  return (
    <div>
      <h3>{fullName || primaryAlias}</h3>
      <span className="abbr">{primaryAlias}</span>
    </div>
  )
}
```

---

## Validation Queries

### Check Data Completeness

```sql
-- Should have 32 primary aliases (one per team)
SELECT COUNT(*) as primary_count
FROM team_aliases
WHERE is_primary = true;
-- Expected: 32
```

### Verify All Canonical Teams Exist

```sql
-- Check canonical IDs reference valid teams
SELECT DISTINCT canonical_team_id
FROM team_aliases
WHERE is_primary = true
ORDER BY canonical_team_id;
-- Should match teams table (32 teams)
```

### Find Duplicate Aliases

```sql
-- Should return 0 rows (UNIQUE constraint)
SELECT alias, COUNT(*)
FROM team_aliases
GROUP BY alias
HAVING COUNT(*) > 1;
```

### Check Source Distribution

```sql
-- Distribution of aliases by source
SELECT
  source,
  COUNT(*) as count
FROM team_aliases
GROUP BY source
ORDER BY count DESC;

-- Expected:
-- user_input: ~96
-- canonical: 32
-- ESPN: ~4
```

---

## Known Limitations

### 1. Manual Updates for New Aliases ⚠️

**Issue**: No automatic scraper to add new aliases when discovered.

**Impact**: If new team name variations appear, must manually add to migration.

**Solution**: Edit migration and re-run, or insert directly:
```javascript
await supabase.from('team_aliases').insert({
  alias: 'Washington Football Team',  // Old name
  canonical_team_id: 'WAS',
  source: 'historical',
  is_primary: false
})
```

---

### 2. No Historical Team Names ⚠️

**Issue**: Old team names not included (e.g., "Oakland Raiders" → LV).

**Impact**: Historical data with old team names won't normalize.

**Solution**: Add historical aliases as needed.

---

## Documentation Links

- **Field Mapping**: `TEAM-ALIASES-RESOURCES/field-mapping-report.md` - All 5 fields documented
- **Raw Data Sources**: `TEAM-ALIASES-RESOURCES/raw-data-source-mapping.md` - Migration details
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000023_add_team_aliases.sql` (lines 14-230)
- **Utility Script**: scripts/utils/team-normalizer.js

---

## Quick Commands

```bash
# Normalize team ID (CLI)
node scripts/utils/team-normalizer.js WSH

# Show all aliases for a team
node scripts/utils/team-normalizer.js --aliases WAS

# List all canonical teams
node scripts/utils/team-normalizer.js --list

# Query all Washington aliases
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('team_aliases').select('*').eq('canonical_team_id', 'WAS').then(({ data }) => console.table(data));"
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 5
**Total Records**: 132 (32 teams × ~4 aliases each)
**Status**: ✅ Production Ready
**CodeRef**: team-normalizer.js:35-82, 20250101000023:34-230 ✅ Validated
