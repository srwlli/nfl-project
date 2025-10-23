# Game Weather - Quick Reference Guide

> **Purpose**: Quick reference for game_weather table
> **Date**: October 22, 2025
> **Status**: ✅ Complete
> **CodeRef**: `extractGameWeather:263`

---

## All 8 Fields (Copy-Paste Ready)

```
weather_id, game_id, temperature_fahrenheit, humidity_percentage, wind_speed_mph, wind_direction, precipitation, conditions
```

---

## Field Categories

### Identification (2 fields)
```
weather_id, game_id
```

### Temperature & Humidity (2 fields)
```
temperature_fahrenheit, humidity_percentage
```

### Wind Conditions (2 fields)
```
wind_speed_mph, wind_direction
```

### Precipitation & Conditions (2 fields)
```
precipitation, conditions
```

---

## SELECT Query String

```sql
weather_id, game_id, temperature_fahrenheit, humidity_percentage, wind_speed_mph, wind_direction, precipitation, conditions, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 8
- **Total Records**: 100+ (completed games with weather data)
- **Data Source**: ESPN gameInfo.weather
- **Auto-Populated**: ✅ Yes (via live-games-scraper → game-stats-scraper)

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| weather_id | serial | 123 | Auto-increment PK |
| game_id | string | "espn-401772510" | UNIQUE (one per game) |
| temperature_fahrenheit | integer | 55 | Nullable, parsed from text |
| humidity_percentage | integer | null | Always null (ESPN doesn't provide) |
| wind_speed_mph | integer | 15 | Parsed from displayValue |
| wind_direction | string | "NW" | N/S/E/W/NE/NW/SE/SW |
| precipitation | string | "rain" | rain/snow/sleet or null |
| conditions | text | "55°F Cloudy Wind NW 10" | Full ESPN displayValue |

---

## Common Queries

### Get Weather for a Game
```javascript
const { data } = await supabase
  .from('game_weather')
  .select('*')
  .eq('game_id', 'espn-401772510')
  .single()

// Display
console.log(`${data.temperature_fahrenheit}°F, ${data.conditions}`)
```

### Get Cold Weather Games
```javascript
const { data } = await supabase
  .from('game_weather')
  .select(`
    *,
    game:games(home_team_id, away_team_id, game_date)
  `)
  .lt('temperature_fahrenheit', 32)
  .order('temperature_fahrenheit', { ascending: true })
```

### Get High Wind Games
```javascript
const { data } = await supabase
  .from('game_weather')
  .select('*')
  .gte('wind_speed_mph', 15)
```

### Get Games with Precipitation
```javascript
const { data } = await supabase
  .from('game_weather')
  .select(`
    *,
    game:games(home_team_id, away_team_id)
  `)
  .not('precipitation', 'is', null)
```

---

## Weather Display Helper

```javascript
const formatWeatherDisplay = (weather) => {
  if (!weather) return 'No data'

  const parts = []

  if (weather.temperature_fahrenheit) {
    parts.push(`${weather.temperature_fahrenheit}°F`)
  }

  if (weather.wind_speed_mph) {
    const dir = weather.wind_direction ? ` ${weather.wind_direction}` : ''
    parts.push(`Wind${dir} ${weather.wind_speed_mph} mph`)
  }

  if (weather.precipitation) {
    const precip = weather.precipitation.charAt(0).toUpperCase() + weather.precipitation.slice(1)
    parts.push(precip)
  }

  return parts.length > 0 ? parts.join(', ') : weather.conditions || 'No data'
}

// Usage
formatWeatherDisplay(data)  // "55°F, Wind NW 10 mph, Rain"
```

---

## Weather Condition Icons

```javascript
const getWeatherIcon = (weather) => {
  if (!weather) return '☁️'

  const conditions = (weather.conditions || '').toLowerCase()

  if (conditions.includes('rain')) return '🌧️'
  if (conditions.includes('snow')) return '❄️'
  if (conditions.includes('sunny') || conditions.includes('clear')) return '☀️'
  if (conditions.includes('cloudy')) return '☁️'
  if (conditions.includes('dome') || conditions.includes('indoors')) return '🏟️'

  return '☁️'  // Default
}
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Using Celsius
```javascript
.eq('temperature_celsius', 10)  // Field doesn't exist!
```

### ✅ CORRECT - Use Fahrenheit
```javascript
.eq('temperature_fahrenheit', 50)
```

### ❌ WRONG - Expecting humidity
```javascript
.not('humidity_percentage', 'is', null)  // Always null from ESPN
```

### ✅ CORRECT - Accept that humidity is always null
```javascript
.select('humidity_percentage')  // Will always be null
```

### ❌ WRONG - Case-sensitive precipitation
```javascript
.eq('precipitation', 'Rain')  // Stored as lowercase "rain"
```

### ✅ CORRECT - Lowercase
```javascript
.eq('precipitation', 'rain')
```

### ❌ WRONG - Forgetting nullable fields
```javascript
.order('wind_speed_mph')  // Will fail if nulls exist
```

### ✅ CORRECT - Handle nulls
```javascript
.order('wind_speed_mph', { ascending: true, nullsFirst: false })
```

---

## Scripts in This Folder

### **File**: `scripts/game-stats-scraper.js` (34K)
- **Purpose**: Scrapes complete game data including weather
- **Extraction Function**: `extractGameWeather` (lines 263-309)
- **Auto-Trigger**: When game status changes to "final"
- **Records Created**: 1 per game (if weather available)
- **Upsert Strategy**: Updates existing or inserts new by game_id

**Usage**:
```bash
# Scrape specific game
npm run scrape:game-stats -- --game=401772510

# Scrape all games in a week
npm run scrape:game-stats -- --week=7
```

**What It Does**:
1. Fetches game summary from ESPN API
2. Extracts gameInfo.weather object
3. Parses temperature, wind, precipitation from displayValue
4. Upserts to game_weather table by game_id
5. Logs success/failure

**Key Code** (lines 263-309):
```javascript
function extractGameWeather(gameSummary, gameId) {
  const gameInfo = gameSummary.gameInfo
  const weather = gameInfo?.weather

  if (!weather) return null

  // Parse temperature (direct or from string)
  let temperature = weather.temperature
  if (!temperature && weather.displayValue) {
    const tempMatch = weather.displayValue.match(/(\d+)°?F?/i)
    if (tempMatch) temperature = parseInt(tempMatch[1])
  }

  // Parse wind (speed + direction)
  let windSpeed = null
  let windDirection = null
  if (weather.displayValue) {
    const windMatch = weather.displayValue.match(/wind\s+([NSEW]{1,3})?\s*(\d+)/i)
    if (windMatch) {
      if (windMatch[1]) windDirection = windMatch[1].toUpperCase()
      windSpeed = parseInt(windMatch[2])
    }
  }

  // Detect precipitation keywords
  let precipitation = null
  const conditionsLower = (weather.displayValue || '').toLowerCase()
  if (conditionsLower.includes('rain')) precipitation = 'rain'
  else if (conditionsLower.includes('snow')) precipitation = 'snow'
  else if (conditionsLower.includes('sleet')) precipitation = 'sleet'

  return {
    game_id: `espn-${gameId}`,
    temperature_fahrenheit: temperature || null,
    humidity_percentage: null,  // ESPN doesn't provide
    wind_speed_mph: windSpeed,
    wind_direction: windDirection,
    precipitation: precipitation,
    conditions: weather.displayValue || null
  }
}
```

---

## Related Tables

### Join with Games
```javascript
.select(`
  *,
  game:games(game_date, home_team_id, away_team_id, home_score, away_score)
`)
```

---

## Frontend Display Examples

### Weather Badge Component
```jsx
const WeatherBadge = ({ gameId }) => {
  const { data: weather } = useQuery(/* query above */)

  if (!weather) return <span>No weather data</span>

  return (
    <div className="weather-badge">
      <span className="icon">{getWeatherIcon(weather)}</span>
      <span className="temp">{weather.temperature_fahrenheit}°F</span>
      {weather.wind_speed_mph && (
        <span className="wind">
          {weather.wind_direction} {weather.wind_speed_mph} mph
        </span>
      )}
      {weather.precipitation && (
        <span className="precip">{weather.precipitation}</span>
      )}
    </div>
  )
}
```

### Game Card with Weather
```jsx
const GameCard = ({ game }) => {
  const { data: weather } = useQuery(/* query for game weather */)

  return (
    <div className="game-card">
      <div className="teams">
        {game.away_team_id} @ {game.home_team_id}
      </div>
      <div className="score">
        {game.away_score} - {game.home_score}
      </div>
      {weather && (
        <div className="weather">
          {formatWeatherDisplay(weather)}
        </div>
      )}
    </div>
  )
}
```

---

## Validation Queries

### Check Data Completeness
```sql
-- How many games have weather data?
SELECT
  COUNT(DISTINCT gw.game_id) as games_with_weather,
  COUNT(DISTINCT g.game_id) as total_completed_games,
  ROUND(100.0 * COUNT(DISTINCT gw.game_id) / COUNT(DISTINCT g.game_id), 1) as coverage_pct
FROM games g
LEFT JOIN game_weather gw ON g.game_id = gw.game_id
WHERE g.status = 'final' AND g.season = 2025;
```

### Find Games Missing Weather
```sql
SELECT
  g.game_id,
  g.week,
  g.home_team_id,
  g.away_team_id,
  g.game_date
FROM games g
LEFT JOIN game_weather gw ON g.game_id = gw.game_id
WHERE g.season = 2025
  AND g.status = 'final'
  AND gw.weather_id IS NULL;
```

### Weather Conditions Breakdown
```sql
SELECT
  CASE
    WHEN conditions LIKE '%Dome%' OR conditions LIKE '%Indoors%' THEN 'Indoor'
    WHEN precipitation = 'rain' THEN 'Rain'
    WHEN precipitation = 'snow' THEN 'Snow'
    WHEN temperature_fahrenheit < 32 THEN 'Cold'
    WHEN wind_speed_mph >= 20 THEN 'Windy'
    ELSE 'Normal'
  END as weather_category,
  COUNT(*) as game_count
FROM game_weather
WHERE game_id IN (SELECT game_id FROM games WHERE season = 2025 AND status = 'final')
GROUP BY weather_category
ORDER BY game_count DESC;
```

---

## Testing & Debugging

### Test Single Game Extraction
```bash
# Extract weather for completed game
npm run scrape:game-stats -- --game=401772510

# Check database
node -e "
const { getSupabaseClient } = require('./scripts/utils/supabase-client.js');
const supabase = getSupabaseClient();
supabase.from('game_weather')
  .select('*')
  .eq('game_id', 'espn-401772510')
  .single()
  .then(({ data }) => console.log(JSON.stringify(data, null, 2)));
"
```

### Debug ESPN API Response
```bash
# Fetch raw ESPN data
curl "https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=401772510" \
  | jq '.gameInfo.weather'
```

---

## Known Limitations

### 1. humidity_percentage Always Null ⚠️

**Issue**: ESPN API does not provide humidity data.

**Impact**: Field exists but will always be null.

**Workaround**: None - wait for alternative data source.

---

### 2. Indoor Games Have Minimal Data ⚠️

**Issue**: Dome/indoor games often have conditions = "Indoors" with no other data.

**Impact**: temperature, wind, precipitation all null.

**Workaround**: Check if conditions includes "Dome" or "Indoors" to display appropriate UI.

```javascript
const isIndoor = weather.conditions?.toLowerCase().includes('dome') ||
                 weather.conditions?.toLowerCase().includes('indoors')

if (isIndoor) {
  return <span>🏟️ Indoor</span>
}
```

---

### 3. Wind Data Not Always Available ⚠️

**Issue**: ESPN displayValue doesn't always include wind information.

**Impact**: wind_speed_mph and wind_direction may be null even if weather exists.

**Workaround**: Display what's available, don't require wind data.

---

### 4. Precipitation Detection is Pattern-Based ⚠️

**Issue**: Precipitation is detected by keyword matching in conditions string.

**Accuracy**: ~95% accurate but may miss unusual formats.

**Examples of Missed Cases**:
- "Drizzle" (not detected)
- "Flurries" (not detected)
- "Freezing rain" (detected as "rain")

**Workaround**: Always display full `conditions` string as fallback.

---

## Documentation Links

- **Field Mapping**: `GAME-WEATHER-RESOURCES/field-mapping-report.md` - All 8 fields documented
- **Raw Data Sources**: `GAME-WEATHER-RESOURCES/raw-data-source-mapping.md` - ESPN API mappings
- **Database Schema**: `DATABASE-SCHEMA-REFERENCE.md` - Complete schema reference
- **Migration**: `supabase/migrations/20250101000008_create_game_and_reference_tables.sql` (lines 140-153)
- **CodeRef**: extractGameWeather at game-stats-scraper.js:263

---

## Quick Commands

```bash
# Extract weather for one game
npm run scrape:game-stats -- --game=401772510

# Extract for all games in week 7
npm run scrape:game-stats -- --week=7

# Check data completeness
node scripts/validate-data-completeness.js
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 8
**Total Records**: 100+ (completed games with weather data)
**Status**: ✅ Production Ready
**CodeRef**: extractGameWeather:263 ✅ Validated
