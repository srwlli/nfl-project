# PROPOSAL: Canonical Team ID System

## Problem Statement

Currently we have duplicate Washington team entries (WAS and WSH) because different data sources use different abbreviations. This will cause:
- Confusion in queries ("Which one do I use?")
- Duplicate roster entries
- Inconsistent API responses
- Data integrity issues

## Proposed Solution: 3-Layer Architecture

### Layer 1: Ingestion (Keep Raw Data)
**Don't change this** - Keep storing data exactly as sources provide it.

### Layer 2: Mapping Table (New)
Create `team_aliases` table to map all variants to a single canonical ID.

```sql
CREATE TABLE team_aliases (
  alias_id SERIAL PRIMARY KEY,
  alias VARCHAR(10) NOT NULL UNIQUE,        -- WSH, Washington, Commanders, etc.
  canonical_team_id VARCHAR(10) NOT NULL,   -- WAS (the "official" one we use)
  source VARCHAR(50),                        -- ESPN, The Odds API, user input, etc.
  is_primary BOOLEAN DEFAULT false,          -- Only one true per team
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_team_aliases_canonical ON team_aliases(canonical_team_id);
CREATE INDEX idx_team_aliases_alias ON team_aliases(alias);
```

**Example Data**:
```sql
INSERT INTO team_aliases (alias, canonical_team_id, source, is_primary) VALUES
  ('WAS', 'WAS', 'canonical', true),
  ('WSH', 'WAS', 'ESPN', false),
  ('Washington', 'WAS', 'user_input', false),
  ('Commanders', 'WAS', 'user_input', false),
  ('Washington Commanders', 'WAS', 'user_input', false),

  ('KC', 'KC', 'canonical', true),
  ('Kansas City', 'KC', 'user_input', false),
  ('Chiefs', 'KC', 'user_input', false),

  ('SEA', 'SEA', 'canonical', true),
  ('Seattle', 'SEA', 'user_input', false),
  ('Seahawks', 'SEA', 'user_input', false);
  -- ... for all 32 teams
```

### Layer 3: Canonical Views/Functions

**Option A: Database View** (Recommended)
```sql
-- View that always returns canonical team data
CREATE VIEW teams_canonical AS
SELECT DISTINCT ON (canonical_team_id)
  ta.canonical_team_id as team_id,
  t.team_name,
  ta.canonical_team_id as team_abbr,
  t.city,
  t.conference,
  t.division,
  t.team_color,
  t.secondary_color,
  t.logo_url
FROM team_aliases ta
JOIN teams t ON t.team_id = ta.alias
WHERE ta.is_primary = true;
```

**Option B: Helper Function**
```javascript
// scripts/utils/team-normalizer.js
export async function normalizeTeamId(teamInput) {
  const supabase = getSupabaseClient()

  const { data } = await supabase
    .from('team_aliases')
    .select('canonical_team_id')
    .or(`alias.ilike.${teamInput},alias.eq.${teamInput.toUpperCase()}`)
    .single()

  return data?.canonical_team_id || null
}

// Usage:
const canonical = await normalizeTeamId('WSH')  // Returns 'WAS'
const canonical = await normalizeTeamId('Washington')  // Returns 'WAS'
const canonical = await normalizeTeamId('Commanders')  // Returns 'WAS'
```

## Implementation Plan

### Phase 1: Create Mapping Infrastructure (2 hours)
- [ ] Create `team_aliases` table migration
- [ ] Populate with all known aliases for 32 teams
- [ ] Create `teams_canonical` view
- [ ] Create helper functions in `scripts/utils/team-normalizer.js`

### Phase 2: Update Scrapers (1 hour)
- [ ] Modify scrapers to normalize team IDs before insert
- [ ] Update queries to use canonical IDs
- [ ] Test with WSH → WAS conversion

### Phase 3: Clean Existing Data (1 hour)
- [ ] Update all `player_teams` records: WSH → WAS
- [ ] Update all `game_rosters` records: WSH → WAS
- [ ] Update all `roster_transactions` records: WSH → WAS
- [ ] Remove duplicate WSH team entry (keep only WAS)

### Phase 4: API Layer (Future)
- [ ] Create API endpoint: `/api/teams` (returns canonical only)
- [ ] Add team search: `/api/teams/search?q=Washington` (fuzzy match)
- [ ] Support aliases in all endpoints

## Benefits

✅ **Single Source of Truth**: Only WAS exists in output, no confusion
✅ **Flexible Input**: Accept WSH, WAS, Washington, Commanders - all work
✅ **Future-Proof**: Easy to add new aliases when teams rebrand
✅ **Data Integrity**: FK constraints work correctly (only canonical IDs in data)
✅ **Better UX**: Users can search by city, team name, abbreviation

## Example Usage

### Before (Current - Confusing):
```javascript
// User searches "Washington"
// Returns 2 results: WAS and WSH - which one?
const teams = await supabase.from('teams').select('*').ilike('team_name', '%Washington%')
// Result: [{ team_id: 'WAS', ... }, { team_id: 'WSH', ... }]  ❌ Duplicate!
```

### After (Proposed - Clean):
```javascript
// User searches "Washington"
const canonical = await normalizeTeamId('Washington')  // Returns 'WAS'
const team = await supabase.from('teams_canonical').select('*').eq('team_id', canonical)
// Result: [{ team_id: 'WAS', team_abbr: 'WAS', team_name: 'Washington Commanders' }]  ✅ Clean!

// Alternative: Direct search with alias support
const teams = await supabase.from('teams_canonical').select('*')
// Result: Only 32 teams, no duplicates  ✅
```

## Migration Strategy

### Step 1: Add Aliases (Non-Breaking)
```sql
-- Create table
CREATE TABLE team_aliases (...);

-- Populate all aliases
INSERT INTO team_aliases (...);
```

### Step 2: Update Code to Use Canonical (Non-Breaking)
```javascript
// Old code still works, but start using canonical
const teamId = await normalizeTeamId(input)  // WSH → WAS
```

### Step 3: Clean Data (Breaking Change - Do Last)
```sql
-- Update all references
UPDATE player_teams SET team_id = 'WAS' WHERE team_id = 'WSH';
UPDATE game_rosters SET team_id = 'WAS' WHERE team_id = 'WSH';
UPDATE roster_transactions SET team_id = 'WAS' WHERE team_id = 'WSH';

-- Remove duplicate
DELETE FROM teams WHERE team_id = 'WSH';
```

## Recommended Canonical IDs (32 Teams)

```
ARI - Arizona Cardinals
ATL - Atlanta Falcons
BAL - Baltimore Ravens
BUF - Buffalo Bills
CAR - Carolina Panthers
CHI - Chicago Bears
CIN - Cincinnati Bengals
CLE - Cleveland Browns
DAL - Dallas Cowboys
DEN - Denver Broncos
DET - Detroit Lions
GB  - Green Bay Packers
HOU - Houston Texans
IND - Indianapolis Colts
JAX - Jacksonville Jaguars
KC  - Kansas City Chiefs
LAC - Los Angeles Chargers
LAR - Los Angeles Rams
LV  - Las Vegas Raiders
MIA - Miami Dolphins
MIN - Minnesota Vikings
NE  - New England Patriots
NO  - New Orleans Saints
NYG - New York Giants
NYJ - New York Jets
PHI - Philadelphia Eagles
PIT - Pittsburgh Steelers
SF  - San Francisco 49ers
SEA - Seattle Seahawks
TB  - Tampa Bay Buccaneers
TEN - Tennessee Titans
WAS - Washington Commanders  ⭐ (WSH is alias)
```

## Alternatives Considered

### Alternative 1: Just delete WSH ❌
**Problem**: ESPN might still send WSH in future data, causing FK errors

### Alternative 2: Keep both, document which to use ❌
**Problem**: Developers will make mistakes, data will be inconsistent

### Alternative 3: This proposal ✅
**Best**: Accept any variant, normalize internally, output canonical only

## Decision Required

Should we implement this canonical team ID system?

**Estimated Effort**: 4-5 hours total
**Risk**: Low (non-breaking until Phase 3)
**Benefit**: High (prevents future data issues)

---

**Next Steps If Approved**:
1. Create migration for `team_aliases` table
2. Populate with all known aliases
3. Create `team-normalizer.js` utility
4. Update documentation with canonical ID list
