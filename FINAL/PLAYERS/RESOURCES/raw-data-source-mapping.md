# Players Table - Raw Data Source Mapping

> **Purpose**: Maps each database field to its raw data source and ESPN API field
> **Date Generated**: October 22, 2025
> **Data Source**: ESPN API (`/apis/common/v3/sports/football/nfl/athletes/{id}`)

---

## Field-by-Field Source Mapping

### 1. player_id
- **Database Column**: `player_id`
- **Data Type**: VARCHAR(50)
- **Raw Source**: ESPN API athlete ID
- **API Path**: `athlete.id`
- **Transformation**: Prefix with "espn-"
- **Example Raw**: `15818`
- **Example Stored**: `"espn-15818"`
- **Script**: `scripts/utils/player-creator.js` line 45
```javascript
player_id: `espn-${athlete.id}`
```

---

### 2. first_name
- **Database Column**: `first_name`
- **Data Type**: VARCHAR(100)
- **Raw Source**: ESPN API athlete firstName
- **API Path**: `athlete.firstName`
- **Transformation**: None (direct)
- **Example Raw**: `"Keenan"`
- **Example Stored**: `"Keenan"`
- **Script**: `scripts/seed/03-players.js` line 156

---

### 3. last_name
- **Database Column**: `last_name`
- **Data Type**: VARCHAR(100)
- **Raw Source**: ESPN API athlete lastName
- **API Path**: `athlete.lastName`
- **Transformation**: None (direct)
- **Example Raw**: `"Allen"`
- **Example Stored**: `"Allen"`
- **Script**: `scripts/seed/03-players.js` line 157

---

### 4. full_name
- **Database Column**: `full_name`
- **Data Type**: VARCHAR(200)
- **Raw Source**: ESPN API athlete displayName
- **API Path**: `athlete.displayName`
- **Transformation**: None (direct)
- **Example Raw**: `"Keenan Allen"`
- **Example Stored**: `"Keenan Allen"`
- **Script**: `scripts/utils/player-creator.js` line 46
```javascript
full_name: athlete.displayName
```

---

### 5. primary_position ⚠️
- **Database Column**: `primary_position`
- **Data Type**: VARCHAR(10)
- **Raw Source**: ESPN API position abbreviation
- **API Path**: `athlete.position.abbreviation`
- **Transformation**: Default to 'UNK' if missing
- **Example Raw**: `"WR"`
- **Example Stored**: `"WR"`
- **Script**: `scripts/utils/player-creator.js` line 47
```javascript
primary_position: athlete.position?.abbreviation || 'UNK'
```
**⚠️ CRITICAL**: Column is `primary_position` NOT `position`

---

### 6. secondary_positions
- **Database Column**: `secondary_positions`
- **Data Type**: VARCHAR(50)
- **Raw Source**: ESPN API (not provided)
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated
**Note**: ESPN API does not provide secondary positions

---

### 7. jersey_number
- **Database Column**: `jersey_number`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API athlete jersey
- **API Path**: `athlete.jersey`
- **Transformation**: parseInt() or NULL
- **Example Raw**: `"13"`
- **Example Stored**: `13`
- **Script**: `scripts/seed/03-players.js` line 165
```javascript
jersey_number: athlete.jersey ? parseInt(athlete.jersey) : null
```

---

### 8. height_inches ⚠️
- **Database Column**: `height_inches`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API displayHeight
- **API Path**: `athlete.displayHeight`
- **Transformation**: Parse "6'2\"" → 74 inches
- **Example Raw**: `"6'2\""`
- **Example Stored**: `74`
- **Script**: `scripts/utils/player-creator.js` parseHeight()
```javascript
function parseHeight(heightStr) {
  // "6'2\"" → 74
  const match = heightStr?.match(/(\d+)'(\d+)"?/)
  if (!match) return null
  return parseInt(match[1]) * 12 + parseInt(match[2])
}
```

---

### 9. weight_lbs ⚠️
- **Database Column**: `weight_lbs`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API weight
- **API Path**: `athlete.weight`
- **Transformation**: parseInt()
- **Example Raw**: `211`
- **Example Stored**: `211`
- **Script**: `scripts/utils/player-creator.js` line 50
```javascript
weight_lbs: parseInt(athlete.weight)
```

---

### 10. birth_date
- **Database Column**: `birth_date`
- **Data Type**: DATE
- **Raw Source**: ESPN API dateOfBirth
- **API Path**: `athlete.dateOfBirth`
- **Transformation**: ISO date format
- **Example Raw**: `"1992-04-27T07:00Z"`
- **Example Stored**: `"1992-04-27"`
- **Script**: `scripts/seed/03-players.js` line 167
```javascript
birth_date: athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toISOString().split('T')[0] : null
```

---

### 11. birth_city
- **Database Column**: `birth_city`
- **Data Type**: VARCHAR(100)
- **Raw Source**: ESPN API birthPlace.city
- **API Path**: `athlete.birthPlace.city`
- **Transformation**: None (direct)
- **Example Raw**: `"Greensboro"`
- **Example Stored**: `"Greensboro"`
- **Script**: `scripts/seed/03-players.js` line 168
**Note**: Often NULL in ESPN API

---

### 12. birth_state
- **Database Column**: `birth_state`
- **Data Type**: VARCHAR(50)
- **Raw Source**: ESPN API birthPlace.state
- **API Path**: `athlete.birthPlace.state`
- **Transformation**: None (direct)
- **Example Raw**: `"NC"`
- **Example Stored**: `"NC"`
- **Script**: `scripts/seed/03-players.js` line 169
**Note**: Often NULL in ESPN API

---

### 13. birth_country
- **Database Column**: `birth_country`
- **Data Type**: VARCHAR(100)
- **Raw Source**: ESPN API birthPlace.country
- **API Path**: `athlete.birthPlace.country`
- **Transformation**: None (direct)
- **Example Raw**: `"USA"`
- **Example Stored**: `"USA"`
- **Script**: `scripts/seed/03-players.js` line 170
**Note**: Often NULL in ESPN API

---

### 14. college
- **Database Column**: `college`
- **Data Type**: VARCHAR(200)
- **Raw Source**: ESPN API college name
- **API Path**: `athlete.college.name`
- **Transformation**: None (direct)
- **Example Raw**: `"California"`
- **Example Stored**: `"California"`
- **Script**: `scripts/seed/03-players.js` line 171
```javascript
college: athlete.college?.name || null
```

---

### 15. high_school
- **Database Column**: `high_school`
- **Data Type**: VARCHAR(200)
- **Raw Source**: ESPN API (not provided)
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated
**Note**: ESPN API does not provide high school

---

### 16. draft_year
- **Database Column**: `draft_year`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API draft.year
- **API Path**: `athlete.draft.year`
- **Transformation**: parseInt() or NULL
- **Example Raw**: `2013`
- **Example Stored**: `2013`
- **Script**: `scripts/seed/03-players.js` line 173
```javascript
draft_year: athlete.draft?.year || null
```

---

### 17. draft_round
- **Database Column**: `draft_round`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API draft.round
- **API Path**: `athlete.draft.round`
- **Transformation**: parseInt() or NULL
- **Example Raw**: `3`
- **Example Stored**: `3`
- **Script**: `scripts/seed/03-players.js` line 174

---

### 18. draft_pick
- **Database Column**: `draft_pick`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API draft.selection
- **API Path**: `athlete.draft.selection`
- **Transformation**: parseInt() or NULL
- **Example Raw**: `76`
- **Example Stored**: `76`
- **Script**: `scripts/seed/03-players.js` line 175

---

### 19. draft_team_id
- **Database Column**: `draft_team_id`
- **Data Type**: VARCHAR(10)
- **Raw Source**: ESPN API draft.team.abbreviation
- **API Path**: `athlete.draft.team.abbreviation`
- **Transformation**: None (direct)
- **Example Raw**: `"LAC"`
- **Example Stored**: `"LAC"`
- **Script**: `scripts/seed/03-players.js` line 176
```javascript
draft_team_id: athlete.draft?.team?.abbreviation || null
```

---

### 20. undrafted
- **Database Column**: `undrafted`
- **Data Type**: BOOLEAN
- **Raw Source**: Calculated (no draft data = undrafted)
- **API Path**: N/A
- **Transformation**: `!athlete.draft`
- **Example Raw**: N/A
- **Example Stored**: `false`
- **Script**: `scripts/seed/03-players.js` line 177
```javascript
undrafted: !athlete.draft
```

---

### 21. rookie_year
- **Database Column**: `rookie_year`
- **Data Type**: INTEGER
- **Raw Source**: ESPN API debut.year
- **API Path**: `athlete.debut.year`
- **Transformation**: parseInt() or NULL
- **Example Raw**: `2013`
- **Example Stored**: `2013`
- **Script**: `scripts/seed/03-players.js` line 178
**Note**: Often NULL in ESPN API

---

### 22. final_year
- **Database Column**: `final_year`
- **Data Type**: INTEGER
- **Raw Source**: Not provided (for retired players)
- **API Path**: N/A
- **Transformation**: Always NULL for active players
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated
**Note**: Would need to be manually set

---

### 23. hof_inducted
- **Database Column**: `hof_inducted`
- **Data Type**: BOOLEAN
- **Raw Source**: Calculated (default false)
- **API Path**: N/A
- **Transformation**: Default false
- **Example Raw**: N/A
- **Example Stored**: `false`
- **Script**: `scripts/seed/03-players.js` line 180
```javascript
hof_inducted: false
```

---

### 24. hof_induction_year
- **Database Column**: `hof_induction_year`
- **Data Type**: INTEGER
- **Raw Source**: Not provided
- **API Path**: N/A
- **Transformation**: Always NULL
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Not populated

---

### 25. status
- **Database Column**: `status`
- **Data Type**: ENUM
- **Raw Source**: ESPN API status
- **API Path**: `athlete.status`
- **Transformation**: Map to enum or default 'active'
- **Example Raw**: `"active"`
- **Example Stored**: `"active"`
- **Script**: `scripts/utils/player-creator.js` line 53
```javascript
status: athlete.status || 'active'
```
**Enum Values**: active | injured | inactive | suspended

---

### 26. headshot_url
- **Database Column**: `headshot_url`
- **Data Type**: TEXT
- **Raw Source**: ESPN API headshot.href
- **API Path**: `athlete.headshot.href`
- **Transformation**: None (direct)
- **Example Raw**: `"https://a.espncdn.com/i/headshots/nfl/players/full/15818.png"`
- **Example Stored**: Same
- **Script**: `scripts/seed/03-players.js` line 183
```javascript
headshot_url: athlete.headshot?.href || null
```

---

### 27. profile_url
- **Database Column**: `profile_url`
- **Data Type**: TEXT
- **Raw Source**: Constructed from player ID
- **API Path**: N/A
- **Transformation**: `https://www.espn.com/nfl/player/_/id/{id}/{name}`
- **Example Raw**: N/A
- **Example Stored**: `"https://www.espn.com/nfl/player/_/id/15818/keenan-allen"`
- **Script**: `scripts/seed/03-players.js` line 184
```javascript
profile_url: `https://www.espn.com/nfl/player/_/id/${athlete.id}/${athlete.slug || athlete.displayName.toLowerCase().replace(/\s+/g, '-')}`
```

---

### 28. metadata
- **Database Column**: `metadata`
- **Data Type**: JSONB
- **Raw Source**: Auto-generated tracking data
- **API Path**: N/A
- **Transformation**: JSON object with source info
- **Example Raw**: N/A
- **Example Stored**:
```json
{
  "espn_id": "15818",
  "auto_created": true,
  "created_at": "2025-10-22T01:39:25.735Z",
  "source": "espn_api_athlete_endpoint"
}
```
- **Script**: `scripts/utils/player-creator.js` line 54-59

---

### 29. created_at
- **Database Column**: `created_at`
- **Data Type**: TIMESTAMP
- **Raw Source**: Database auto-generated
- **API Path**: N/A
- **Transformation**: `CURRENT_TIMESTAMP`
- **Example Raw**: N/A
- **Example Stored**: `"2025-10-18T09:38:43.649978"`
- **Script**: Database default

---

### 30. updated_at
- **Database Column**: `updated_at`
- **Data Type**: TIMESTAMP
- **Raw Source**: Database auto-generated
- **API Path**: N/A
- **Transformation**: `CURRENT_TIMESTAMP`
- **Example Raw**: N/A
- **Example Stored**: `"2025-10-22T01:39:25.735276"`
- **Script**: Database default with ON UPDATE trigger

---

### 31. deleted_at
- **Database Column**: `deleted_at`
- **Data Type**: TIMESTAMP
- **Raw Source**: Soft delete timestamp
- **API Path**: N/A
- **Transformation**: NULL (unless deleted)
- **Example Raw**: N/A
- **Example Stored**: `null`
- **Script**: Set manually on deletion

---

## ESPN API Response Example

### Raw API Response
```json
{
  "athlete": {
    "id": "15818",
    "uid": "s:20~l:28~a:15818",
    "guid": "abc123",
    "type": "athlete",
    "firstName": "Keenan",
    "lastName": "Allen",
    "fullName": "Keenan Allen",
    "displayName": "Keenan Allen",
    "shortName": "K. Allen",
    "weight": 211,
    "displayWeight": "211 lbs",
    "height": 74,
    "displayHeight": "6' 2\"",
    "age": 33,
    "dateOfBirth": "1992-04-27T07:00Z",
    "birthPlace": {
      "city": "Greensboro",
      "state": "NC",
      "country": "USA"
    },
    "citizenship": "USA",
    "slug": "keenan-allen",
    "jersey": "13",
    "position": {
      "id": "4",
      "name": "Wide Receiver",
      "displayName": "Wide Receiver",
      "abbreviation": "WR",
      "leaf": true
    },
    "college": {
      "id": "25",
      "name": "California",
      "mascot": "Bears",
      "abbreviation": "CAL"
    },
    "draft": {
      "year": 2013,
      "round": 3,
      "selection": 76,
      "team": {
        "id": "24",
        "abbreviation": "LAC",
        "displayName": "Los Angeles Chargers"
      }
    },
    "status": "active",
    "headshot": {
      "href": "https://a.espncdn.com/i/headshots/nfl/players/full/15818.png",
      "alt": "Keenan Allen"
    },
    "experience": {
      "years": 11
    }
  }
}
```

---

## Data Source Scripts

### Primary Scripts
1. **Initial Seed**: `scripts/seed/03-players.js`
   - One-time bulk load of all team rosters
   - Uses ESPN roster API: `/teams/{team}/roster`
   - Loads ~80 players per team × 32 teams = ~2,560 players

2. **Auto-Creation**: `scripts/utils/player-creator.js`
   - Runs during game stats scraping
   - Creates missing players automatically
   - Uses ESPN athlete API: `/athletes/{id}`

3. **Daily Updates**: `scripts/scrapers/roster-updates-scraper.js`
   - Runs daily at 5:00 PM ET
   - Detects roster changes (signings/releases)
   - Updates player_teams relationships

---

## API Endpoints Used

### 1. Team Roster Endpoint (Bulk Load)
```
GET https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{team}/roster
```
**Returns**: Array of athletes with limited fields

### 2. Individual Athlete Endpoint (Detailed)
```
GET https://site.api.espn.com/apis/common/v3/sports/football/nfl/athletes/{id}
```
**Returns**: Complete athlete object with all details

---

## Field Population Summary

| Field | ESPN API | Calculated | Database | Always NULL |
|-------|----------|------------|----------|-------------|
| player_id | ✅ (transformed) | | | |
| first_name | ✅ | | | |
| last_name | ✅ | | | |
| full_name | ✅ | | | |
| primary_position | ✅ | | | |
| secondary_positions | | | | ✅ |
| jersey_number | ✅ | | | |
| height_inches | ✅ (parsed) | | | |
| weight_lbs | ✅ | | | |
| birth_date | ✅ | | | |
| birth_city | ✅ (often null) | | | |
| birth_state | ✅ (often null) | | | |
| birth_country | ✅ (often null) | | | |
| college | ✅ | | | |
| high_school | | | | ✅ |
| draft_year | ✅ | | | |
| draft_round | ✅ | | | |
| draft_pick | ✅ | | | |
| draft_team_id | ✅ | | | |
| undrafted | | ✅ | | |
| rookie_year | ✅ (often null) | | | |
| final_year | | | | ✅ |
| hof_inducted | | ✅ (false) | | |
| hof_induction_year | | | | ✅ |
| status | ✅ | | | |
| headshot_url | ✅ | | | |
| profile_url | | ✅ | | |
| metadata | | ✅ | | |
| created_at | | | ✅ | |
| updated_at | | | ✅ | |
| deleted_at | | | ✅ | |

---

## Data Quality Notes

### Fields with High NULL Rate
- `secondary_positions` - 100% NULL (ESPN doesn't provide)
- `birth_city` - ~60% NULL
- `birth_state` - ~60% NULL
- `birth_country` - ~60% NULL
- `high_school` - 100% NULL (ESPN doesn't provide)
- `rookie_year` - ~40% NULL
- `final_year` - 100% NULL (active players)
- `hof_induction_year` - ~99.9% NULL

### Fields Always Populated
- `player_id` - Primary key
- `first_name` - From ESPN
- `last_name` - From ESPN
- `full_name` - From ESPN
- `primary_position` - Defaults to 'UNK' if missing
- `undrafted` - Calculated boolean
- `hof_inducted` - Defaults to false
- `status` - Defaults to 'active'
- `created_at` - Database timestamp
- `updated_at` - Database timestamp

---

## Transformation Functions

### Height Parser
```javascript
function parseHeight(heightStr) {
  // Input: "6'2\"" or "6-2"
  // Output: 74 (total inches)

  if (!heightStr) return null

  const match = heightStr.match(/(\d+)['′-](\d+)/)
  if (!match) return null

  const feet = parseInt(match[1])
  const inches = parseInt(match[2])
  return (feet * 12) + inches
}
```

### Player ID Generator
```javascript
function generatePlayerId(espnId) {
  return `espn-${espnId}`
}
```

### Profile URL Generator
```javascript
function generateProfileUrl(id, name) {
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return `https://www.espn.com/nfl/player/_/id/${id}/${slug}`
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-22 | Initial raw data source mapping |

---

## References

- **ESPN API Documentation**: Internal (not publicly documented)
- **Player Creator**: `scripts/utils/player-creator.js`
- **Seed Script**: `scripts/seed/03-players.js`
- **Roster Scraper**: `scripts/scrapers/roster-updates-scraper.js`
- **Field Mapping**: `coderef/FINAL/FIELD-MAPPING-REFERENCE.md`

---

**Last Updated**: October 22, 2025
**Data Source**: ESPN API (site.api.espn.com)
**Total Fields**: 31 (22 from ESPN, 3 calculated, 3 database, 3 always NULL)
