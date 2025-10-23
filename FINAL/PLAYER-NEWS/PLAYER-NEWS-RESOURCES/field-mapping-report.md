# Player News Table - Field Mapping Report

> **Purpose**: Complete field mapping verification for the player_news table
> **Date Generated**: October 22, 2025
> **Status**: ⚠️ PLANNED (Not Yet Implemented)
> **CodeRef**: `coderef/working/player-news/plan.json:59-143`

---

## Executive Summary

The **player_news table** stores player-related news articles and updates from multiple sources (ESPN, RotoWire, Sportsgrid, etc.). This table enables real-time news integration into player profiles and a dedicated news feed.

- **Total Columns**: 15 (+ 3 metadata)
- **Total Records**: 0 (⚠️ Not yet implemented - no migrations, no scraper)
- **Critical Fields**: ✅ 15/15 verified from plan
- **Normalization Status**: ✅ 100% compliant
- **Ready for Frontend**: ⚠️ Schema planned, not yet deployed
- **Auto-Populated**: ⚠️ Scraper planned but not implemented

**Expected Data Volume:**
- ~2,000+ active players with news
- ~100-500 news items per day (league-wide)
- Historical retention: 30 days minimum
- Peak during trade deadline, injuries, playoffs

---

## All 15 Fields (Copy-Paste Ready)

```
news_id, player_id, headline, description, short_description, news_category, source, source_url, published_at, external_id, is_breaking, priority, created_at, updated_at, deleted_at
```

---

## Field Categories

### Identification (3 fields)
```
news_id, player_id, external_id
```

### Content (3 fields)
```
headline, description, short_description
```

### Classification (2 fields)
```
news_category, source
```

### Metadata (4 fields)
```
source_url, published_at, is_breaking, priority
```

### Timestamps (3 fields)
```
created_at, updated_at, deleted_at
```

---

## Complete Field Mapping

| Field Name | Database Column | Type | Example | Nullable | Notes |
|------------|-----------------|------|---------|----------|-------|
| News ID | `news_id` | serial | 1 | ❌ No | PK (auto-increment) |
| Player ID | `player_id` | varchar(50) | "espn-3139477" | ❌ No | FK to players table |
| Headline | `headline` | text | "Derrick Henry questionable for Sunday" | ❌ No | News title |
| Description | `description` | text | "Ravens RB dealing with hamstring strain..." | ✅ Yes | Full news body |
| Short Description | `short_description` | varchar(500) | "Dealing with hamstring strain" | ✅ Yes | Truncated preview |
| News Category | `news_category` | news_category_enum | "injury" | ❌ No | Enum: injury/trade/performance/contract/personal/other |
| Source | `source` | varchar(100) | "ESPN" | ✅ Yes | News provider |
| Source URL | `source_url` | text | "https://espn.com/..." | ✅ Yes | Original article link |
| Published At | `published_at` | timestamp | "2025-10-22 14:30:00" | ❌ No | When published |
| External ID | `external_id` | varchar(100) | "espn-news-12345" | ✅ Yes | For deduplication (UNIQUE) |
| Is Breaking | `is_breaking` | boolean | true | ✅ Yes | Breaking news flag (default false) |
| Priority | `priority` | integer | 8 | ✅ Yes | 0-10 scale (default 0) |
| Created At | `created_at` | timestamp | "2025-10-22 14:31:00" | ✅ Yes | When scraped |
| Updated At | `updated_at` | timestamp | "2025-10-22 14:31:00" | ✅ Yes | Last modified |
| Deleted At | `deleted_at` | timestamp | null | ✅ Yes | Soft delete |

---

## News Category Enum

### Enum Definition

```sql
CREATE TYPE news_category_enum AS ENUM (
  'injury',
  'trade',
  'performance',
  'contract',
  'personal',
  'other'
);
```

### Category Descriptions

| Category | Description | Examples |
|----------|-------------|----------|
| **injury** | Injury reports, health status | "Player questionable with ankle", "Placed on IR" |
| **trade** | Trades, acquisitions, releases | "Traded to Chiefs", "Released by team" |
| **performance** | On-field achievements | "Career-high 200 yards", "3 TD performance" |
| **contract** | Contracts, extensions, negotiations | "Signs 4-year extension", "Franchise tagged" |
| **personal** | Personal matters, off-field news | "Retirement announcement", "Suspension" |
| **other** | Miscellaneous news | "Coaching praise", "Roster move" |

---

## Keyword-Based Auto-Categorization

### Categorization Logic (from plan.json:266-272)

```javascript
const categoryKeywords = {
  injury: [
    "injury", "injured", "out for", "placed on IR",
    "concussion", "surgery", "torn", "sprained", "fracture",
    "questionable", "doubtful", "probable"
  ],
  trade: [
    "traded", "trade", "acquired", "dealt to",
    "sends", "receives", "signs with", "released"
  ],
  performance: [
    "yards", "touchdown", "TD", "reception", "passing",
    "rushing", "sack", "interception", "record",
    "career-high", "performance", "game-winning"
  ],
  contract: [
    "contract", "extension", "signed", "deal",
    "million", "year deal", "franchise tag",
    "restructure", "bonus"
  ],
  personal: [
    "arrested", "suspension", "retirement", "retires",
    "personal", "family", "offseason", "fine"
  ]
}

function categorizeNews(headline, description) {
  const text = (headline + ' ' + description).toLowerCase()

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category
    }
  }

  return 'other'
}
```

---

## Data Source Mapping

### Multiple News Sources

**Primary Source: ESPN**
- API: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/news`
- Free, no API key required
- Rate limit: 1 req/sec (self-imposed)

**Fallback Source: RotoWire**
- Method: Web scraping
- URL: `https://www.rotowire.com/football/player/{playerName}`
- Requires parsing HTML

**Alternative Source: Sportsgrid API**
- API: Potential integration
- Status: Not yet implemented

**Future Sources (plan.json:562-564):**
- Rotoworld
- CBS Sports
- Fox Sports

---

## ESPN API → Database Mapping

### ESPN News API Response

```json
{
  "articles": [
    {
      "headline": "Derrick Henry questionable for Sunday",
      "description": "Ravens RB Derrick Henry is dealing with a hamstring strain and is questionable for Week 8.",
      "published": "2025-10-22T14:30:00Z",
      "links": {
        "web": {
          "href": "https://www.espn.com/nfl/story/_/id/12345"
        }
      },
      "categories": [
        {
          "description": "Injury Report"
        }
      ],
      "athletes": [
        {
          "id": 3139477,
          "fullName": "Derrick Henry"
        }
      ]
    }
  ]
}
```

### Mapped to Database

```json
{
  "player_id": "espn-3139477",
  "headline": "Derrick Henry questionable for Sunday",
  "description": "Ravens RB Derrick Henry is dealing with a hamstring strain and is questionable for Week 8.",
  "short_description": "Dealing with a hamstring strain and is questionable for Week 8.",
  "news_category": "injury",
  "source": "ESPN",
  "source_url": "https://www.espn.com/nfl/story/_/id/12345",
  "published_at": "2025-10-22T14:30:00Z",
  "external_id": "espn-news-12345",
  "is_breaking": true,
  "priority": 8,
  "created_at": "2025-10-22T14:31:00Z",
  "updated_at": "2025-10-22T14:31:00Z",
  "deleted_at": null
}
```

---

## Field Mapping Details

| Database Column | ESPN Source | Transform | Notes |
|-----------------|-------------|-----------|-------|
| news_id | Auto-increment | N/A | Generated by database |
| player_id | `athletes[0].id` | Prefix "espn-" | FK to players table |
| headline | `headline` | Direct | News title |
| description | `description` | Direct | Full text |
| short_description | `description` | Truncate to 500 chars | Add "..." if truncated |
| news_category | `categories` or headline | Auto-categorize | Use keyword matching |
| source | Hardcoded | "ESPN" | News provider |
| source_url | `links.web.href` | Direct | Original article |
| published_at | `published` | Parse ISO datetime | Convert to timestamp |
| external_id | From URL | Extract ID from href | "espn-news-{id}" |
| is_breaking | `published` | Check if <1 hour old | Boolean |
| priority | N/A | Calculate based on category | 0-10 scale |
| created_at | Current time | Auto | When scraped |
| updated_at | Current time | Auto | When scraped |
| deleted_at | NULL | Default | Soft delete |

---

## Breaking News Detection

### Logic (from plan.json)

```javascript
function detectBreakingNews(publishedDate) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const publishDate = new Date(publishedDate)
  return publishDate > oneHourAgo
}
```

**Breaking News Criteria:**
- Published within last 1 hour
- Flagged with `is_breaking = true`
- Higher priority in news feed
- Displayed with red pulse animation

---

## Priority Calculation

### Priority Scale (0-10)

```javascript
function calculatePriority(category, isBreaking) {
  let priority = 5 // Default

  // Adjust by category
  if (category === 'injury') priority += 2
  if (category === 'trade') priority += 3
  if (category === 'contract') priority += 1

  // Boost breaking news
  if (isBreaking) priority += 2

  return Math.min(priority, 10)
}
```

**Examples:**
- Breaking injury news: 8-9 priority
- Trade news: 7-8 priority
- Performance update: 4-5 priority
- Contract signing: 5-6 priority

---

## Deduplication Logic

### External ID Uniqueness

```sql
-- UNIQUE constraint on external_id
ALTER TABLE player_news
ADD CONSTRAINT unique_external_id UNIQUE (external_id);
```

### Fuzzy Matching Fallback

```javascript
// If external_id not available, check for similar headlines
async function isDuplicate(headline, publishedAt) {
  // Get news from last 24 hours
  const { data: recentNews } = await supabase
    .from('player_news')
    .select('headline')
    .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000))

  // Check for exact or near-exact matches
  return recentNews.some(news =>
    levenshteinDistance(news.headline, headline) < 5
  )
}
```

---

## Common Queries

### Get Player News (Last 30 Days)

```javascript
const { data: playerNews } = await supabase
  .from('player_news')
  .select('*')
  .eq('player_id', 'espn-3139477')
  .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  .order('published_at', { ascending: false })
  .limit(10)

playerNews.forEach(news => {
  console.log(`[${news.news_category}] ${news.headline}`)
  console.log(`  Published: ${news.published_at}`)
})
```

### Get Breaking News

```javascript
const { data: breakingNews } = await supabase
  .from('player_news')
  .select(`
    *,
    player:players(full_name, primary_position)
  `)
  .eq('is_breaking', true)
  .order('published_at', { ascending: false })
  .limit(20)

console.log(`${breakingNews.length} breaking news items`)
```

### Get News by Category

```javascript
const { data: injuryNews } = await supabase
  .from('player_news')
  .select(`
    *,
    player:players(full_name, team_id)
  `)
  .eq('news_category', 'injury')
  .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  .order('published_at', { ascending: false })

console.log(`${injuryNews.length} injury reports this week`)
```

### Get Team News (All Players)

```javascript
// First get team roster
const { data: roster } = await supabase
  .from('player_teams')
  .select('player_id')
  .eq('team_id', 'KC')
  .is('end_season', null)

const playerIds = roster.map(p => p.player_id)

// Get news for those players
const { data: teamNews } = await supabase
  .from('player_news')
  .select(`
    *,
    player:players(full_name, primary_position)
  `)
  .in('player_id', playerIds)
  .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  .order('published_at', { ascending: false })
```

---

## ⚠️ CRITICAL: Common Mistakes

### ❌ WRONG - Not checking for null description

```javascript
const preview = news.description.substring(0, 100)  // Could be NULL!
```

### ✅ CORRECT - Handle nullable description

```javascript
const preview = news.short_description || news.description?.substring(0, 100) || 'No details available'
```

### ❌ WRONG - Hardcoding category values

```javascript
if (news.news_category === 'INJURY') {  // Wrong case!
  // ...
}
```

### ✅ CORRECT - Use enum values exactly

```javascript
if (news.news_category === 'injury') {  // Lowercase as defined in enum
  // ...
}
```

### ❌ WRONG - Not deduplicating by external_id

```javascript
// Will create duplicates
await supabase.from('player_news').insert(newsItems)
```

### ✅ CORRECT - Upsert with conflict resolution

```javascript
await supabase
  .from('player_news')
  .upsert(newsItems, { onConflict: 'external_id' })
```

---

## Database Indexes (from plan.json:137-143)

```sql
-- Player lookup (most common)
CREATE INDEX idx_player_news_player
ON player_news(player_id)
WHERE deleted_at IS NULL;

-- Chronological sorting
CREATE INDEX idx_player_news_published
ON player_news(published_at DESC)
WHERE deleted_at IS NULL;

-- Category filtering
CREATE INDEX idx_player_news_category
ON player_news(news_category)
WHERE deleted_at IS NULL;

-- Breaking news queries
CREATE INDEX idx_player_news_breaking
ON player_news(is_breaking, published_at DESC)
WHERE is_breaking = TRUE AND deleted_at IS NULL;

-- Deduplication lookups
CREATE INDEX idx_player_news_external
ON player_news(external_id)
WHERE deleted_at IS NULL;
```

---

## Frontend Display Examples

### News Card Component

```jsx
const NewsCard = ({ news }) => {
  const timeAgo = formatTimeAgo(news.published_at)

  return (
    <div className={`news-card ${news.is_breaking ? 'breaking' : ''}`}>
      {news.is_breaking && (
        <span className="breaking-badge pulsing">BREAKING</span>
      )}

      <span className={`category-badge ${news.news_category}`}>
        {news.news_category.toUpperCase()}
      </span>

      <h3>{news.headline}</h3>

      <p className="description">
        {news.short_description || news.description}
      </p>

      <div className="meta">
        <span className="source">{news.source}</span>
        <span className="time">{timeAgo}</span>
      </div>

      {news.source_url && (
        <a href={news.source_url} target="_blank" rel="noopener">
          Read Full Article →
        </a>
      )}
    </div>
  )
}
```

### Player News Feed

```jsx
const PlayerNewsFeed = ({ playerId }) => {
  const [category, setCategory] = useState('all')

  const { data: news } = useQuery(() => {
    let query = supabase
      .from('player_news')
      .select('*')
      .eq('player_id', playerId)
      .order('published_at', { ascending: false })

    if (category !== 'all') {
      query = query.eq('news_category', category)
    }

    return query.limit(20)
  })

  return (
    <div className="player-news-feed">
      <h2>Recent News</h2>

      <div className="category-filters">
        <button onClick={() => setCategory('all')}>All</button>
        <button onClick={() => setCategory('injury')}>Injuries</button>
        <button onClick={() => setCategory('trade')}>Trades</button>
        <button onClick={() => setCategory('performance')}>Performance</button>
        <button onClick={() => setCategory('contract')}>Contracts</button>
      </div>

      <div className="news-list">
        {news?.map(item => (
          <NewsCard key={item.news_id} news={item} />
        ))}
      </div>
    </div>
  )
}
```

---

## Implementation Status

**Status**: ⚠️ **PLANNED (Not Yet Implemented)**

**What Exists:**
- ✅ Complete schema design in plan.json
- ✅ Categorization logic defined
- ✅ API endpoints identified
- ✅ Execution plan created (perplexity.md)

**What's Missing:**
- ❌ Database migrations (no SQL files)
- ❌ Scraper script (player-news-scraper.js not created)
- ❌ Scheduler integration
- ❌ Frontend components
- ❌ Testing suite

**To Implement:**
1. Create migration: `20250101000013_create_news_enum.sql`
2. Create migration: `20250101000014_create_player_news_table.sql`
3. Create scraper: `scripts/scrapers/player-news-scraper.js`
4. Add to scheduler: `scripts/scheduler.js`
5. Create news display components

---

## Related Tables

### Referenced By

- `players` - Player profiles (FK: player_id)
- `player_teams` - Team rosters (for team news aggregation)

### Related Tables

- `team_news` - Team-level news (parallel structure)

---

## Documentation Links

- **Field Mapping**: `PLAYER-NEWS-RESOURCES/field-mapping-report.md` - All 15 fields documented
- **Raw Data Sources**: `PLAYER-NEWS-RESOURCES/raw-data-source-mapping.md` - ESPN + RotoWire + Sportsgrid
- **Implementation Plan**: `coderef/working/player-news/plan.json` - Complete 645-line spec
- **Execution Plan**: `coderef/working/player-news/perplexity.md` - Phase-by-phase guide

---

**Last Updated**: October 22, 2025
**Total Fields**: 15
**Total Records**: 0 (⚠️ Not yet implemented)
**Status**: ⚠️ PLANNED - Schema designed, not yet deployed
**CodeRef**: plan.json:59-143 ✅ Validated
