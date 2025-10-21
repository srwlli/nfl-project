# MCP Agent Schema Verification Instructions

> 📋 **For MCP Docs Agent**: How to ensure schema knowledge is embedded in training data

## Issue Summary

**Problem:** Column name mismatches cause query failures (e.g., `receiving_receptions` vs `receptions`)

**Root Cause:** Schema knowledge not embedded in agent context/training data

**Impact:** 15-30 minutes wasted debugging schema errors that should be preventable

---

## Required Actions for MCP Docs Agent

### 1. Create Schema Training Document

The MCP agent should create/update a training document that is loaded into agent context:

**File:** `coderef/training/database-schema.json`

**Structure:**
```json
{
  "training_type": "database_schema",
  "version": "1.0",
  "last_updated": "2025-10-20",
  "tables": {
    "player_game_stats": {
      "description": "Player performance statistics per game",
      "primary_keys": ["player_id", "game_id", "season"],
      "common_columns": {
        "passing": ["passing_attempts", "passing_completions", "passing_yards", "passing_touchdowns"],
        "rushing": ["rushing_attempts", "rushing_yards", "rushing_touchdowns"],
        "receiving": ["receiving_targets", "receptions", "receiving_yards", "receiving_touchdowns"]
      },
      "column_warnings": {
        "receptions": "NOT 'receiving_receptions' - just 'receptions'"
      }
    },
    "players": {
      "description": "Player profiles and information",
      "primary_keys": ["player_id"],
      "common_columns": {
        "identity": ["player_id", "full_name", "display_name"],
        "position": ["primary_position"]
      },
      "column_warnings": {
        "primary_position": "NOT 'position' - use 'primary_position'"
      }
    }
  },
  "common_mistakes": [
    {
      "mistake": "Using 'receiving_receptions' column",
      "correct": "Use 'receptions' instead",
      "frequency": "HIGH"
    },
    {
      "mistake": "Using 'position' from players table",
      "correct": "Use 'primary_position' instead",
      "frequency": "MEDIUM"
    }
  ]
}
```

---

### 2. Add Schema Verification to Workflow

**Task:** Update MCP agent workflows to include schema verification step

**Implementation:**

Create a new tool: `mcp__docs-mcp__verify_schema`

```typescript
{
  "name": "verify_schema",
  "description": "Verify database column exists before using in queries",
  "parameters": {
    "table_name": "string",
    "column_names": "string[]"
  },
  "returns": {
    "valid_columns": "string[]",
    "invalid_columns": "string[]",
    "suggestions": "object"
  }
}
```

**Workflow Integration:**

Before any code generation that includes database queries:
1. Extract table and column names from prompt
2. Call `verify_schema` tool
3. If invalid columns found, suggest corrections
4. Include corrections in generated code

---

### 3. Update Agent Prompts/Context

**Location:** MCP server system prompts

**Add this section:**

```markdown
## Database Schema Knowledge

When generating code that queries the database, you MUST verify column names first.

### Common Column Name Patterns:

**Player Game Stats:**
- ✅ `receptions` (NOT `receiving_receptions`)
- ✅ `passing_yards`, `rushing_yards`, `receiving_yards`
- ✅ `passing_touchdowns`, `rushing_touchdowns`, `receiving_touchdowns`

**Players Table:**
- ✅ `primary_position` (NOT `position`)
- ✅ `full_name`, `display_name`

### Verification Pattern:

Before writing queries, always:
1. Check DATABASE-SCHEMA-REFERENCE.md for exact column names
2. Use the verify_schema tool if available
3. Test query on 1 row before batch processing

### If Column Not Found:

1. Check for similar column names (e.g., `receptions` vs `receiving_receptions`)
2. Suggest correct column name from schema
3. Update query with correct name
4. Explain the correction to user
```

---

### 4. Create Auto-Generated Schema Map

**Task:** Generate schema map from live database

**Script:** `scripts/generate-schema-map.js`

```javascript
import { getSupabaseClient } from './utils/supabase-client.js'
import fs from 'fs'

const supabase = getSupabaseClient()

/**
 * Generate schema map for all tables
 */
async function generateSchemaMap() {
  const tables = [
    'player_game_stats',
    'players',
    'teams',
    'games',
    'team_game_stats',
    'player_injury_status',
    'weekly_leaders',
    'season_cumulative_stats'
  ]

  const schemaMap = {}

  for (const table of tables) {
    console.log(`Fetching schema for ${table}...`)

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1)

    if (error) {
      console.error(`Error fetching ${table}:`, error.message)
      continue
    }

    if (data && data.length > 0) {
      const columns = Object.keys(data[0])
      schemaMap[table] = {
        columns: columns,
        column_count: columns.length,
        sample_data: data[0]
      }
    }
  }

  // Save to coderef/training/
  const outputPath = 'coderef/training/database-schema-map.json'
  fs.mkdirSync('coderef/training', { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(schemaMap, null, 2))

  console.log(`\nSchema map saved to ${outputPath}`)
  console.log(`Total tables: ${Object.keys(schemaMap).length}`)
}

generateSchemaMap()
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
```

**Usage:**
```bash
node scripts/generate-schema-map.js
```

**Output:** `coderef/training/database-schema-map.json`

This file should be:
1. Generated weekly (cron job)
2. Loaded into MCP agent context
3. Used for schema verification

---

### 5. Add Schema Linting to Code Generation

**Task:** Lint generated code for schema errors before returning to user

**Implementation:**

```javascript
/**
 * Lint Supabase queries for schema errors
 */
function lintSupabaseQuery(code, schemaMap) {
  const errors = []

  // Extract .select() calls
  const selectRegex = /\.select\(['"`](.*?)['"`]\)/g
  const matches = [...code.matchAll(selectRegex)]

  for (const match of matches) {
    const columns = match[1].split(',').map(c => c.trim())

    // Check if columns exist in schema
    for (const col of columns) {
      // Skip wildcards
      if (col === '*') continue

      // Extract column name (handle aliases, joins)
      const cleanCol = col.split(' ')[0].split('.').pop()

      // Check against schema
      // (logic depends on table detection)
    }
  }

  return errors
}
```

**Integration:** Run linter before returning generated code to user

---

### 6. Update Documentation Index

**Task:** Ensure DATABASE-SCHEMA-REFERENCE.md is discoverable

**Files to Update:**

1. **PROJECT-MAP.md** - Add schema reference to "Essential Reading" section
2. **DATABASE-ACCESS-GUIDE.md** - Add link to schema reference in "Query Patterns" section
3. **CLAUDE.md** - Add schema reference to "Technical Details" section

**Example Addition to PROJECT-MAP.md:**

```markdown
## Essential Reading for New Agents

1. **PROJECT-MAP.md** (this file) - Navigation guide
2. **DATABASE-SCHEMA-REFERENCE.md** ⚠️ **READ FIRST BEFORE QUERYING** - Exact column names
3. **DATABASE-ACCESS-GUIDE.md** - Connection patterns
4. **AVAILABLE-DATA-INVENTORY.md** - What data exists
```

---

## Implementation Checklist

For the MCP agent to fix this at the root:

- [ ] Create `coderef/training/database-schema.json` with schema knowledge
- [ ] Add `verify_schema` tool to MCP server
- [ ] Update agent system prompts with schema verification instructions
- [ ] Create `scripts/generate-schema-map.js` for auto-schema detection
- [ ] Add npm script: `"schema:map": "node scripts/generate-schema-map.js"`
- [ ] Schedule weekly schema map generation (cron)
- [ ] Implement schema linting in code generation workflow
- [ ] Update PROJECT-MAP.md, DATABASE-ACCESS-GUIDE.md with schema links
- [ ] Test schema verification with common mistake examples
- [ ] Document verification workflow in MCP server README

---

## Testing Schema Verification

### Test Cases:

1. **Column Name Mismatch:**
   - Input: Query using `receiving_receptions`
   - Expected: Agent suggests `receptions`, corrects query
   - Status: ❌ Currently fails

2. **Position Column Error:**
   - Input: Query using `position` from players table
   - Expected: Agent suggests `primary_position`, corrects query
   - Status: ❌ Currently fails

3. **Valid Query:**
   - Input: Query using correct column names
   - Expected: Agent accepts without modification
   - Status: ✅ Currently passes

---

## Success Metrics

After implementation, we should see:

1. **Zero schema-related errors** in new code generation
2. **Auto-correction** of common mistakes before code execution
3. **Proactive suggestions** when user mentions non-existent columns
4. **Reduced debug time** from 15-30 min to 0 min per issue

---

## Example Agent Interaction (After Fix)

**User:** "Create a script to get receiving receptions for all WRs"

**Agent (with schema verification):**

> I notice you mentioned "receiving receptions" - the actual column name in the database is just `receptions` (not `receiving_receptions`). I'll use the correct column name in the script.
>
> Here's the script using the verified schema:

```javascript
const { data } = await supabase
  .from('player_game_stats')
  .select('player_id, receptions, receiving_yards')  // ✅ Corrected
  .eq('position', 'WR')
```

---

## Priority

**HIGH** - This prevents 15-30 minutes of debugging per schema error

**Estimated Implementation Time:** 4-6 hours for MCP agent developer

**ROI:** Prevents ~2-3 hours of wasted time per week across all developers/agents

---

## Next Steps

1. **MCP agent developer:** Implement `verify_schema` tool
2. **MCP agent developer:** Add schema knowledge to agent context
3. **Script developer:** Create `generate-schema-map.js`
4. **Documentation:** Update PROJECT-MAP.md and guides
5. **Testing:** Validate with common mistake scenarios

---

## References

- **DATABASE-SCHEMA-REFERENCE.md** - Complete schema documentation
- **DATABASE-ACCESS-GUIDE.md** - Query patterns and examples
- **coderef/working/performance-floors-enhancements/URGENT-FIX.md** - Example of schema confusion impact

---

## Last Updated

**Date:** October 20, 2025
**Session:** 5
**Status:** Instructions created, pending MCP agent implementation
