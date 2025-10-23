# Teams Table - Raw Data Source Mapping

> **Purpose**: Maps each database field to its raw data source
> **Date Generated**: October 22, 2025
> **Data Source**: Static JSON file (`scripts/data/teams.json`)

---

## Field-by-Field Source Mapping

### 1. team_id
- **Database Column**: `team_id`
- **Data Type**: VARCHAR(10)
- **Raw Source**: JSON file `teams.json`
- **JSON Path**: `team_id`
- **Transformation**: None (direct)
- **Example Raw**: `"SEA"`
- **Example Stored**: `"SEA"`
- **Script**: `scripts/seed/01-teams.js` line 94
```javascript
team_id: team.team_id
```

---

### 2. team_name
- **Database Column**: `team_name`
- **Data Type**: VARCHAR(200)
- **Raw Source**: JSON file `teams.json`
- **JSON Path**: `team_name`
- **Transformation**: None (direct)
- **Example Raw**: `"Seattle Seahawks"`
- **Example Stored**: `"Seattle Seahawks"`
- **Script**: `scripts/seed/01-teams.js`

---

### 3. team_abbr ⚠️
- **Database Column**: `team_abbr`
- **Data Type**: VARCHAR(10)
- **Raw Source**: JSON file `teams.json`
- **JSON Path**: `team_abbr`
- **Transformation**: None (direct)
- **Example Raw**: `"SEA"`
- **Example Stored**: `"SEA"`
- **Script**: `scripts/seed/01-teams.js`
**⚠️ CRITICAL**: Column is `team_abbr` NOT `abbreviation`

---

### 4. city
- **Database Column**: `city`
- **Data Type**: VARCHAR(100)
- **Raw Source**: JSON file `teams.json`
- **JSON Path**: `city`
- **Transformation**: None (direct)
- **Example Raw**: `"Seattle"`
- **Example Stored**: `"Seattle"`
- **Script**: `scripts/seed/01-teams.js`

---

### 5. conference
- **Database Column**: `conference`
- **Data Type**: VARCHAR(10)
- **Raw Source**: JSON file `teams.json`
- **JSON Path**: `conference`
- **Transformation**: None (direct)
- **Example Raw**: `"NFC"`
- **Example Stored**: `"NFC"`
- **Script**: `scripts/seed/01-teams.js`
**Valid Values**: `AFC` | `NFC`

---

### 6. division
- **Database Column**: `division`
- **Data Type**: VARCHAR(10)
- **Raw Source**: JSON file `teams.json`
- **JSON Path**: `division`
- **Transformation**: None (direct)
- **Example Raw**: `"West"`
- **Example Stored**: `"West"`
- **Script**: `scripts/seed/01-teams.js`
**Valid Values**: `East` | `West` | `North` | `South`

---

### 7. founded_year
- **Database Column**: `founded_year`
- **Data Type**: INTEGER
- **Raw Source**: JSON file `teams.json`
- **JSON Path**: `founded_year`
- **Transformation**: None (direct)
- **Example Raw**: `1976`
- **Example Stored**: `1976`
- **Script**: `scripts/seed/01-teams.js`

---

### 8. stadium_id
- **Database Column**: `stadium_id`
- **Data Type**: VARCHAR(50)
- **Raw Source**: Not provided in seed
- **JSON Path**: N/A
- **Transformation**: NULL (linked later)
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated during seed
**Note**: Foreign key reference to stadiums table (linked after stadium seed)

---

### 9. primary_color
- **Database Column**: `primary_color`
- **Data Type**: VARCHAR(20)
- **Raw Source**: JSON file `teams.json`
- **JSON Path**: `primary_color`
- **Transformation**: None (direct)
- **Example Raw**: `"#002244"`
- **Example Stored**: `"#002244"`
- **Script**: `scripts/seed/01-teams.js`
**Format**: Hex color code

---

### 10. secondary_color
- **Database Column**: `secondary_color`
- **Data Type**: VARCHAR(20)
- **Raw Source**: JSON file `teams.json`
- **JSON Path**: `secondary_color`
- **Transformation**: None (direct)
- **Example Raw**: `"#69BE28"`
- **Example Stored**: `"#69BE28"`
- **Script**: `scripts/seed/01-teams.js`
**Format**: Hex color code

---

### 11. logo_url
- **Database Column**: `logo_url`
- **Data Type**: TEXT
- **Raw Source**: JSON file `teams.json`
- **JSON Path**: `logo_url`
- **Transformation**: None (direct)
- **Example Raw**: `"https://a.espncdn.com/i/teamlogos/nfl/500/sea.png"`
- **Example Stored**: Same
- **Script**: `scripts/seed/01-teams.js`

---

### 12. franchise_history
- **Database Column**: `franchise_history`
- **Data Type**: TEXT
- **Raw Source**: Not provided in seed
- **JSON Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated
**Note**: Reserved for future historical franchise relocation data

---

### 13. is_active
- **Database Column**: `is_active`
- **Data Type**: BOOLEAN
- **Raw Source**: Calculated (default true)
- **JSON Path**: N/A
- **Transformation**: Default true
- **Example Raw**: N/A
- **Example Stored**: `true`
- **Script**: Database default
```sql
is_active BOOLEAN DEFAULT true
```

---

### 14. created_at
- **Database Column**: `created_at`
- **Data Type**: TIMESTAMP
- **Raw Source**: Database auto-generated
- **JSON Path**: N/A
- **Transformation**: `CURRENT_TIMESTAMP`
- **Example Raw**: N/A
- **Example Stored**: `"2025-10-18T08:51:55.854678"`
- **Script**: Database default

---

### 15. updated_at
- **Database Column**: `updated_at`
- **Data Type**: TIMESTAMP
- **Raw Source**: Database auto-generated
- **JSON Path**: N/A
- **Transformation**: `CURRENT_TIMESTAMP`
- **Example Raw**: N/A
- **Example Stored**: `"2025-10-18T08:51:55.854678"`
- **Script**: Database default with ON UPDATE trigger

---

### 16. deleted_at
- **Database Column**: `deleted_at`
- **Data Type**: TIMESTAMP
- **Raw Source**: Soft delete timestamp
- **JSON Path**: N/A
- **Transformation**: NULL (unless deleted)
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Set manually on deletion

---

## JSON Data Source Example

### Raw JSON Record
```json
{
  "team_id": "SEA",
  "team_abbr": "SEA",
  "team_name": "Seattle Seahawks",
  "city": "Seattle",
  "state": "WA",
  "conference": "NFC",
  "division": "West",
  "founded_year": 1976,
  "stadium_name": "Lumen Field",
  "head_coach": "Mike Macdonald",
  "primary_color": "#002244",
  "secondary_color": "#69BE28",
  "logo_url": "https://a.espncdn.com/i/teamlogos/nfl/500/sea.png"
}
```

### Fields in JSON but NOT in Database
- `state` - State abbreviation (not stored in teams table)
- `stadium_name` - Stadium name (stored in separate stadiums table)
- `head_coach` - Coach name (not stored - changes frequently)

---

## Data Source Scripts

### Primary Script
**File**: `scripts/seed/01-teams.js`
**Purpose**: One-time bulk load of all 32 NFL teams
**Data Source**: `scripts/data/teams.json`
**Run Command**: `npm run seed:teams`

### Seed Process
```javascript
// Step 1: Load teams data from JSON file
const teamsPath = join(__dirname, '../data/teams.json')
const teamsData = JSON.parse(readFileSync(teamsPath, 'utf-8'))

// Step 2: Map to database schema
const schemaFields = [
  'team_id', 'team_name', 'team_abbr', 'city',
  'conference', 'division', 'founded_year',
  'primary_color', 'secondary_color', 'logo_url'
]

const mappedData = teamsData.map(team => {
  const mapped = {}
  schemaFields.forEach(field => {
    if (team[field] !== undefined) {
      mapped[field] = team[field]
    }
  })
  return mapped
})

// Step 3: Insert into database
await insertBatch('teams', mappedData)
```

---

## Field Population Summary

| Field | JSON File | Calculated | Database | Always NULL |
|-------|-----------|------------|----------|-------------|
| team_id | ✅ | | | |
| team_name | ✅ | | | |
| team_abbr | ✅ | | | |
| city | ✅ | | | |
| conference | ✅ | | | |
| division | ✅ | | | |
| founded_year | ✅ | | | |
| stadium_id | | | | ✅ (NULL initially) |
| primary_color | ✅ | | | |
| secondary_color | ✅ | | | |
| logo_url | ✅ | | | |
| franchise_history | | | | ✅ |
| is_active | | ✅ (default true) | | |
| created_at | | | ✅ | |
| updated_at | | | ✅ | |
| deleted_at | | | ✅ | |

---

## Data Quality Notes

### Fields Always Populated
- `team_id` - Primary key (3-letter abbreviation)
- `team_name` - Full team name
- `team_abbr` - Team abbreviation (same as team_id)
- `city` - Team city
- `conference` - AFC or NFC
- `division` - East, West, North, or South
- `founded_year` - Year franchise founded
- `primary_color` - Hex color code
- `secondary_color` - Hex color code
- `logo_url` - ESPN logo URL
- `is_active` - Always true
- `created_at` - Auto-generated timestamp
- `updated_at` - Auto-generated timestamp

### Fields Always NULL
- `stadium_id` - Not populated during seed (linked later)
- `franchise_history` - Reserved for future use
- `deleted_at` - NULL for all active teams

---

## Validation Rules

### Required Fields (from seed script)
```javascript
const requiredFields = [
  'team_id',
  'team_abbr',
  'team_name',
  'conference',
  'division'
]
```

### Expected Counts
- **Total Teams**: Exactly 32
- **Teams per Conference**: 16 AFC, 16 NFC
- **Teams per Division**: 4 teams (each conference has 4 divisions)

### Conference/Division Distribution
```
AFC-East: 4 teams
AFC-North: 4 teams
AFC-South: 4 teams
AFC-West: 4 teams
NFC-East: 4 teams
NFC-North: 4 teams
NFC-South: 4 teams
NFC-West: 4 teams
```

---

## Color Scheme Reference

### Sample Team Colors

| Team | Primary | Secondary | Notes |
|------|---------|-----------|-------|
| SEA | #002244 | #69BE28 | Navy & Action Green |
| SF | #AA0000 | #B3995D | Red & Gold |
| GB | #203731 | #FFB612 | Green & Gold |
| DAL | #041E42 | #869397 | Navy & Silver |
| NE | #002244 | #C60C30 | Navy & Red |
| KC | #E31837 | #FFB81C | Red & Gold |
| PIT | #FFB612 | #101820 | Gold & Black |
| DEN | #FB4F14 | #002244 | Orange & Navy |

**Color Format**: All colors stored as 6-digit hex codes with # prefix

---

## Logo URL Pattern

All logos follow ESPN's standard pattern:
```
https://a.espncdn.com/i/teamlogos/nfl/500/{team_abbr_lowercase}.png
```

Examples:
- Seattle: `https://a.espncdn.com/i/teamlogos/nfl/500/sea.png`
- Green Bay: `https://a.espncdn.com/i/teamlogos/nfl/500/gb.png`
- New England: `https://a.espncdn.com/i/teamlogos/nfl/500/ne.png`

---

## Transformation Functions

### None Required
All team data is loaded directly from JSON with no transformations:
- No parsing needed (unlike players height parsing)
- No calculations needed
- No API calls needed
- Direct JSON → Database mapping

---

## Special Cases

### Washington Commanders (WSH/WAS)
- **Current Abbreviation**: `WAS`
- **Historical Abbreviation**: `WSH`
- **Handling**: Database may contain alias entry for backwards compatibility
- **Name History**:
  - Washington Redskins (1937-2019)
  - Washington Football Team (2020-2021)
  - Washington Commanders (2022-present)

### Los Angeles Teams
- **Rams**: `LAR` (moved from St. Louis 2016)
- **Chargers**: `LAC` (moved from San Diego 2017)

---

## Update Strategy

### Static Data (No Updates Needed)
Teams data is essentially **static** and rarely changes:
- New teams: NFL expansion (rare - last was 2002)
- Relocations: Team moves city (rare - last was 2020)
- Rebrands: Name/color change (rare - last was 2022)

### When Updates Are Needed
1. **Manual Edit**: Update `scripts/data/teams.json`
2. **Truncate Table**: Clear existing teams
3. **Re-run Seed**: `npm run seed:teams`

**OR** update directly in Supabase dashboard for single team changes

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-22 | Initial raw data source mapping |

---

## References

- **Seed Script**: `scripts/seed/01-teams.js`
- **Data File**: `scripts/data/teams.json`
- **Field Mapping**: `coderef/FINAL/FIELD-MAPPING-REFERENCE.md`
- **Schema Reference**: `DATABASE-SCHEMA-REFERENCE.md`

---

**Last Updated**: October 22, 2025
**Data Source**: Static JSON file (manually curated)
**Total Fields**: 16 (10 from JSON, 3 database, 3 always NULL)
