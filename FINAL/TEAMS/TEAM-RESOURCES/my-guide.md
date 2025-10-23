# Teams Table - Quick Reference Guide

> **Purpose**: Fast reference for all 16 team fields
> **Date**: October 22, 2025
> **Status**: ✅ 100% Normalized

---

## All 16 Field Names (Copy-Paste Ready)

```javascript
team_id
team_name
team_abbr
city
conference
division
founded_year
stadium_id
primary_color
secondary_color
logo_url
franchise_history
is_active
created_at
updated_at
deleted_at
```

---

## Quick Query Strings

### All Fields
```javascript
'team_id, team_name, team_abbr, city, conference, division, founded_year, stadium_id, primary_color, secondary_color, logo_url, franchise_history, is_active, created_at, updated_at, deleted_at'
```

### Essential Fields (Team Card)
```javascript
'team_id, team_name, team_abbr, logo_url, primary_color, secondary_color'
```

### Identity Fields
```javascript
'team_id, team_name, team_abbr, city, conference, division, founded_year'
```

---

## ⚠️ CRITICAL - Don't Use These Names!

| ❌ WRONG | ✅ CORRECT |
|---------|----------|
| `abbreviation` | `team_abbr` |
| `name` | `team_name` |
| `color` | `primary_color` |
| `logo` | `logo_url` |

---

## Field Categories

### 📌 Identification (4)
- `team_id` - Primary key (e.g., "SEA")
- `team_name` - Full name (e.g., "Seattle Seahawks")
- `team_abbr` ⚠️ NOT "abbreviation"
- `city` - Team city

### 🏈 League Structure (2)
- `conference` - AFC | NFC
- `division` - East | West | North | South

### 📅 History (2)
- `founded_year` - Year franchise founded
- `franchise_history` - NULL (reserved)

### 🏟️ Venue (1)
- `stadium_id` - Foreign key to stadiums

### 🎨 Branding (3)
- `primary_color` - Hex code (e.g., "#002244")
- `secondary_color` - Hex code
- `logo_url` - ESPN logo URL

### 🔧 Meta (4)
- `is_active` - Always true
- `created_at`, `updated_at`, `deleted_at`

---

## Data Source

| Field | Source |
|-------|--------|
| 10 fields | JSON file (`scripts/data/teams.json`) |
| 3 fields | Database auto-generated |
| 3 fields | Always NULL (stadium_id, franchise_history, deleted_at) |

---

## Quick Stats

- **Total Teams**: 32
- **Total Columns**: 16
- **Primary Key**: `team_id`
- **Conferences**: AFC (16), NFC (16)
- **Divisions**: 4 per conference (East, West, North, South)

---

## All 32 Teams by Division

### AFC East
- **BUF** - Buffalo Bills
- **MIA** - Miami Dolphins
- **NE** - New England Patriots
- **NYJ** - New York Jets

### AFC North
- **BAL** - Baltimore Ravens
- **CIN** - Cincinnati Bengals
- **CLE** - Cleveland Browns
- **PIT** - Pittsburgh Steelers

### AFC South
- **HOU** - Houston Texans
- **IND** - Indianapolis Colts
- **JAX** - Jacksonville Jaguars
- **TEN** - Tennessee Titans

### AFC West
- **DEN** - Denver Broncos
- **KC** - Kansas City Chiefs
- **LV** - Las Vegas Raiders
- **LAC** - Los Angeles Chargers

### NFC East
- **DAL** - Dallas Cowboys
- **NYG** - New York Giants
- **PHI** - Philadelphia Eagles
- **WAS** - Washington Commanders

### NFC North
- **CHI** - Chicago Bears
- **DET** - Detroit Lions
- **GB** - Green Bay Packers
- **MIN** - Minnesota Vikings

### NFC South
- **ATL** - Atlanta Falcons
- **CAR** - Carolina Panthers
- **NO** - New Orleans Saints
- **TB** - Tampa Bay Buccaneers

### NFC West
- **ARI** - Arizona Cardinals
- **LAR** - Los Angeles Rams
- **SF** - San Francisco 49ers
- **SEA** - Seattle Seahawks

---

## Common Queries

### Get Team by ID
```javascript
.select('*').eq('team_id', 'SEA').single()
```

### Get All NFC West Teams
```javascript
.select('team_id, team_name, logo_url')
.eq('conference', 'NFC')
.eq('division', 'West')
.order('team_name')
```

### Get Team with Stadium
```javascript
.select(`
  *,
  stadiums(stadium_name, city, state, capacity, surface_type)
`)
.eq('team_id', 'SEA')
.single()
```

### Get All Teams (Ordered)
```javascript
.select('team_id, team_name, team_abbr, conference, division')
.eq('is_active', true)
.order('conference')
.order('division')
.order('team_name')
```

---

## Sample Team Colors

| Team | Primary | Secondary |
|------|---------|-----------|
| SEA | #002244 (Navy) | #69BE28 (Green) |
| SF | #AA0000 (Red) | #B3995D (Gold) |
| GB | #203731 (Green) | #FFB612 (Gold) |
| DAL | #041E42 (Navy) | #869397 (Silver) |
| NE | #002244 (Navy) | #C60C30 (Red) |
| KC | #E31837 (Red) | #FFB81C (Gold) |

---

## Logo URL Pattern

```
https://a.espncdn.com/i/teamlogos/nfl/500/{team_abbr_lowercase}.png
```

Examples:
- Seattle: `https://a.espncdn.com/i/teamlogos/nfl/500/sea.png`
- Dallas: `https://a.espncdn.com/i/teamlogos/nfl/500/dal.png`

---

## Related Tables

- `games` - Home/away games
- `players` - Roster (via `player_teams`)
- `player_game_stats` - Team player stats
- `team_game_stats` - Team statistics
- `team_season_stats` - Season standings
- `stadiums` - Home stadium

---

## Special Cases

### Washington Commanders
- **Current**: `WAS`
- **Historical**: `WSH`
- **Name Changes**:
  - Washington Redskins (1937-2019)
  - Washington Football Team (2020-2021)
  - Washington Commanders (2022-present)

### Los Angeles Teams
- **Rams**: `LAR` (moved from St. Louis 2016)
- **Chargers**: `LAC` (moved from San Diego 2017)

---

## Scripts in This Folder

### Analysis & Validation
- `scripts/analyze-teams-schema.js` - Analyze teams table structure (shows all 32 teams by division)
- `scripts/check-teams-with-stats.js` - Check which teams have game stats
- `scripts/normalize-team-data.js` - Normalize team abbreviations and data

### Data Management
- `scripts/01-teams.js` - Initial teams seed script (loads all 32 teams)
- `scripts/get-team-roster.js` - Get full roster for any team

### Data Files
- `data/teams.json` - Source data for all 32 NFL teams (14KB JSON file)

---

## Usage Examples

### Analyze Teams Table
```bash
node coderef/FINAL/TEAMS/scripts/analyze-teams-schema.js
```
Shows all 32 teams organized by conference and division

### Get Team Roster
```bash
node coderef/FINAL/TEAMS/scripts/get-team-roster.js --team=SEA
```
Displays full 53-man roster with positions, heights, weights

### Check Teams with Stats
```bash
node coderef/FINAL/TEAMS/scripts/check-teams-with-stats.js
```
Verifies which teams have game statistics populated

### Normalize Team Data
```bash
node coderef/FINAL/TEAMS/scripts/normalize-team-data.js
```
Ensures consistent team abbreviations (WSH→WAS, etc.)

---

## More Info

- **Full Mapping**: `field-mapping-report.md` (in this folder)
- **Data Sources**: `raw-data-source-mapping.md` (in this folder)
- **Seed Script**: `scripts/01-teams.js` (in this folder)
- **Data File**: `data/teams.json` (in this folder)
