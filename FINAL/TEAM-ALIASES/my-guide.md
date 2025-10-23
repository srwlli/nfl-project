# Team Aliases - Quick Reference Guide

> **Purpose**: Quick reference for team_aliases table
> **Date**: October 22, 2025
> **Status**: ✅ Complete
> **CodeRef**: `team-normalizer.js:35-82`, `20250101000023:34-230`

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

## SELECT Query String

```sql
alias_id, alias, canonical_team_id, source, is_primary, created_at
```

---

## Quick Stats

- **Total Columns**: 5
- **Total Records**: 132 (32 teams × ~4 aliases each)
- **Data Source**: Migration SQL (20250101000023)
- **Auto-Populated**: ✅ One-time migration
- **Utility Script**: team-normalizer.js

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| alias_id | serial | 128 | Auto-increment PK |
| alias | varchar(50) | "WSH" | UNIQUE - any team identifier |
| canonical_team_id | varchar(10) | "WAS" | The "official" ID we use |
| source | varchar(50) | "ESPN" | Where this alias comes from |
| is_primary | boolean | true | Only one true per team |

---

## What This Table Does

**Problem**: Different data sources use different team identifiers:
- ESPN uses "WSH" for Washington
- User might type "Kansas City Chiefs"
- Betting API might use full names
- Our database uses "WAS" and "KC"

**Solution**: Map all variations → canonical ID

```javascript
normalizeTeamId('WSH')      // → 'WAS'
normalizeTeamId('Washington') // → 'WAS'
normalizeTeamId('Commanders') // → 'WAS'
normalizeTeamId('Kansas City Chiefs') // → 'KC'
```

---

## Common Queries

### Normalize Team ID (Recommended Method)

```javascript
import { normalizeTeamId } from './scripts/utils/team-normalizer.js'

const canonical = await normalizeTeamId('WSH')
console.log(canonical)  // 'WAS'
```

### Normalize Multiple Teams

```javascript
import { normalizeTeamIds } from './scripts/utils/team-normalizer.js'

const result = await normalizeTeamIds(['WSH', 'Kansas City', 'SEA'])
console.log(result)
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
console.log(aliases)
// ['WAS', 'WSH', 'Washington', 'Commanders', 'Washington Commanders']
```

### Get All Canonical Teams

```javascript
import { getAllCanonicalTeamIds } from './scripts/utils/team-normalizer.js'

const teams = await getAllCanonicalTeamIds()
console.log(teams)
// ['ARI', 'ATL', 'BAL', 'BUF', ..., 'WAS'] (32 teams)
```

### Validate Team Input

```javascript
import { isValidTeam } from './scripts/utils/team-normalizer.js'

const valid = await isValidTeam('WSH')  // true
const invalid = await isValidTeam('XYZ')  // false
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

### Case-Insensitive Search

```javascript
// Using ilike for case-insensitive matching
const { data } = await supabase
  .from('team_aliases')
  .select('canonical_team_id')
  .ilike('alias', 'washington')
  .single()

console.log(data.canonical_team_id)  // 'WAS'
```

---

## Display Helpers

### Format Team from Canonical ID

```javascript
const getTeamFullName = async (canonicalId) => {
  const aliases = await getTeamAliases(canonicalId)
  return aliases.find(a => a.includes(' ')) || canonicalId
}

// Usage
await getTeamFullName('WAS')  // "Washington Commanders"
await getTeamFullName('KC')   // "Kansas City Chiefs"
```

### Get Team Abbreviation

```javascript
const getTeamAbbr = async (canonicalId) => {
  const { data } = await supabase
    .from('team_aliases')
    .select('alias')
    .eq('canonical_team_id', canonicalId)
    .eq('is_primary', true)
    .single()

  return data?.alias || canonicalId
}

// Usage
await getTeamAbbr('WAS')  // "WAS"
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Using external IDs directly

```javascript
// ESPN returns 'WSH', your DB uses 'WAS'
const espnGame = await fetchESPNGame()
await supabase.from('games').insert({
  home_team_id: espnGame.homeTeam.abbreviation  // 'WSH' - FK error!
})
```

### ✅ CORRECT - Always normalize first

```javascript
import { normalizeTeamId } from './scripts/utils/team-normalizer.js'

const espnGame = await fetchESPNGame()
const homeTeam = await normalizeTeamId(espnGame.homeTeam.abbreviation)

await supabase.from('games').insert({
  home_team_id: homeTeam  // 'WAS' - valid!
})
```

### ❌ WRONG - Case-sensitive matching

```javascript
// Won't find 'washington' (lowercase)
const { data } = await supabase
  .from('team_aliases')
  .eq('alias', 'washington')
```

### ✅ CORRECT - Use normalizeTeamId (case-insensitive)

```javascript
const canonical = await normalizeTeamId('washington')  // Works!
```

### ❌ WRONG - Not checking for null

```javascript
const canonical = await normalizeTeamId('InvalidTeam')
await supabase.from('games').insert({ home_team_id: canonical })  // null!
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
- **Key Functions**: 5 exported functions
- **CLI Usage**: Supports direct command-line testing

**Usage**:
```bash
# Test single team
node scripts/utils/team-normalizer.js WSH

# Test multiple teams
node scripts/utils/team-normalizer.js WSH "Kansas City" SEA

# Show all aliases for a team
node scripts/utils/team-normalizer.js --aliases WAS

# List all canonical teams
node scripts/utils/team-normalizer.js --list
```

**Example output:**
```
══════════════════════════════════════════════════
TEAM ID NORMALIZATION
══════════════════════════════════════════════════
WSH                       → WAS
Kansas City               → KC
SEA                       ✓ (already canonical)
══════════════════════════════════════════════════
```

**Key Code** (lines 35-82):
```javascript
export async function normalizeTeamId(teamInput) {
  const supabase = getSupabaseClient()

  // Case-insensitive query
  const { data } = await supabase
    .from('team_aliases')
    .select('canonical_team_id, alias, source')
    .or(`alias.ilike.${input},alias.eq.${input.toUpperCase()}`)
    .limit(1)
    .single()

  return data?.canonical_team_id || null
}
```

---

## Alias Categories

### Canonical (32 aliases)
The official abbreviations:
```
WAS, KC, SF, NYG, GB, DAL, PHI, PIT, BAL, etc.
```
- `is_primary = true`
- Source: `'canonical'`

### ESPN Aliases (4 aliases)
ESPN API uses different codes:
```
WSH → WAS
GNB → GB
JAC → JAX
```
- Source: `'ESPN'`

### User Input (96 aliases)
Human-friendly variations:
```
City names: "Washington", "Kansas City"
Mascots: "Commanders", "Chiefs"
Full names: "Washington Commanders", "Kansas City Chiefs"
Nicknames: "Bucs" → TB
```
- Source: `'user_input'`

---

## All 32 Teams (Canonical IDs)

```
ARI, ATL, BAL, BUF, CAR, CHI, CIN, CLE,
DAL, DEN, DET, GB, HOU, IND, JAX, KC,
LAC, LAR, LV, MIA, MIN, NE, NO, NYG,
NYJ, PHI, PIT, SF, SEA, TB, TEN, WAS
```

---

## Frontend Display Examples

### Team Autocomplete Search

```jsx
import { normalizeTeamId } from './utils/team-normalizer'

const TeamAutocomplete = ({ onSelect }) => {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])

  const handleSearch = async (value) => {
    setInput(value)

    // Get matching aliases (case-insensitive)
    const { data } = await supabase
      .from('team_aliases')
      .select('alias, canonical_team_id')
      .ilike('alias', `%${value}%`)
      .limit(10)

    setSuggestions(data)
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
        placeholder="Search teams..."
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

### Team Display Component

```jsx
import { getTeamAliases } from './utils/team-normalizer'

const TeamCard = ({ teamId }) => {
  const [aliases, setAliases] = useState([])

  useEffect(() => {
    getTeamAliases(teamId).then(setAliases)
  }, [teamId])

  const fullName = aliases.find(a => a.includes(' '))
  const abbr = aliases.find(a => a.length <= 3)

  return (
    <div className="team-card">
      <h3>{fullName || teamId}</h3>
      <span className="abbr">{abbr || teamId}</span>
    </div>
  )
}
```

### Team Dropdown Selector

```jsx
import { getAllCanonicalTeamIds } from './utils/team-normalizer'

const TeamSelector = ({ value, onChange }) => {
  const { data: teams } = useQuery(getAllCanonicalTeamIds)

  return (
    <select value={value} onChange={onChange}>
      <option value="">Select Team</option>
      {teams?.map(teamId => (
        <option key={teamId} value={teamId}>
          {teamId}
        </option>
      ))}
    </select>
  )
}
```

---

## Validation Queries

### Check All Teams Have Primary Alias

```sql
-- Should return 32 (one per team)
SELECT COUNT(*) as primary_count
FROM team_aliases
WHERE is_primary = true;
```

### Verify Canonical IDs Match Teams Table

```sql
-- Should return 0 (all canonical IDs exist in teams)
SELECT DISTINCT ta.canonical_team_id
FROM team_aliases ta
WHERE ta.is_primary = true
  AND NOT EXISTS (
    SELECT 1 FROM teams t WHERE t.team_id = ta.canonical_team_id
  );
```

### Find Duplicate Aliases

```sql
-- Should return 0 (UNIQUE constraint)
SELECT alias, COUNT(*)
FROM team_aliases
GROUP BY alias
HAVING COUNT(*) > 1;
```

### Check Source Distribution

```sql
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

## Testing & Debugging

### Test Team Normalization (CLI)

```bash
# Single team
node scripts/utils/team-normalizer.js WSH
# Output: WSH → WAS

# Multiple teams
node scripts/utils/team-normalizer.js WSH "Kansas City Chiefs" SEA GNB
```

### Show All Aliases (CLI)

```bash
node scripts/utils/team-normalizer.js --aliases WAS
# Output:
# Aliases for WAS:
# ──────────────────────────────────────────────────
#   WAS
#   WSH
#   Washington
#   Commanders
#   Washington Commanders
```

### List All Teams (CLI)

```bash
node scripts/utils/team-normalizer.js --list
# Output: All 32 canonical team IDs
```

### Query Database Directly

```bash
# Get all Washington aliases
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('team_aliases').select('*').eq('canonical_team_id', 'WAS').then(({ data }) => console.table(data));"
```

---

## Known Limitations

### 1. No Historical Team Names ⚠️

**Issue**: Old team names not included (Oakland Raiders, Washington Football Team, etc.).

**Impact**: Historical queries won't normalize old names.

**Solution**: Add aliases manually:
```javascript
await supabase.from('team_aliases').insert({
  alias: 'Oakland Raiders',
  canonical_team_id: 'LV',
  source: 'historical',
  is_primary: false
})
```

---

### 2. Case-Insensitive Matching Required ⚠️

**Issue**: Direct `.eq()` queries are case-sensitive.

**Impact**: `eq('alias', 'washington')` won't find 'Washington'.

**Solution**: Always use `normalizeTeamId()` or `.ilike()`.

---

## Documentation Links

- **Field Mapping**: `TEAM-ALIASES-RESOURCES/field-mapping-report.md` - All 5 fields documented
- **Raw Data Sources**: `TEAM-ALIASES-RESOURCES/raw-data-source-mapping.md` - Migration details
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000023_add_team_aliases.sql` (lines 14-263)
- **Utility Script**: scripts/utils/team-normalizer.js

---

## Quick Commands

```bash
# Test normalization
node scripts/utils/team-normalizer.js WSH

# Show aliases for a team
node scripts/utils/team-normalizer.js --aliases WAS

# List all teams
node scripts/utils/team-normalizer.js --list

# Query Washington aliases
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('team_aliases').select('*').eq('canonical_team_id', 'WAS').then(({ data }) => console.table(data));"

# Count aliases by source
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('team_aliases').select('source').then(({ data }) => { const counts = data.reduce((acc, r) => { acc[r.source] = (acc[r.source] || 0) + 1; return acc; }, {}); console.table(counts); });"
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 5
**Total Records**: 132 (32 teams × ~4 aliases each)
**Status**: ✅ Production Ready
**CodeRef**: team-normalizer.js:35-82, 20250101000023:34-230 ✅ Validated
