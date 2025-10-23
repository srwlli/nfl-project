# Player News - Quick Reference Guide

> **Purpose**: Quick reference for player_news table
> **Date**: October 22, 2025
> **Status**: ⚠️ PLANNED (Not yet implemented)
> **CodeRef**: plan.json + perplexity.md

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

## SELECT Query String

```sql
news_id, player_id, headline, description, short_description, news_category, source, source_url, published_at, external_id, is_breaking, priority, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 15
- **Total Records**: 0 (⚠️ NOT IMPLEMENTED)
- **Expected Records**: ~10,000-50,000 (30-day retention)
- **Daily Volume**: ~100-500 news items
- **Data Sources**: ESPN (primary), RotoWire (fallback), Sportsgrid (alternative)
- **Auto-Populated**: ⚠️ Planned (scraper not yet built)

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| news_id | serial | 1 | Auto-increment PK |
| player_id | varchar(50) | "espn-3139477" | FK to players |
| headline | text | "Henry questionable for Sunday" | News title |
| description | text | "Ravens RB dealing with..." | Full text |
| short_description | varchar(500) | "Dealing with hamstring..." | Preview (500 chars) |
| news_category | enum | "injury" | injury/trade/performance/contract/personal/other |
| source | varchar(100) | "ESPN" | ESPN/RotoWire/Sportsgrid |
| source_url | text | "https://espn.com/..." | Article link |
| published_at | timestamp | "2025-10-22 14:30:00" | When published |
| external_id | varchar(100) | "espn-news-12345" | For deduplication (UNIQUE) |
| is_breaking | boolean | true | <1 hour old (default false) |
| priority | integer | 8 | 0-10 scale (default 0) |
| created_at | timestamp | Auto | When scraped |
| updated_at | timestamp | Auto | Last modified |
| deleted_at | timestamp | null | Soft delete |

---

## News Category Enum

```sql
CREATE TYPE news_category_enum AS ENUM (
  'injury',      -- Injury reports, health status
  'trade',       -- Trades, acquisitions, releases
  'performance', -- Game stats, achievements
  'contract',    -- Contract signings, extensions
  'personal',    -- Personal matters, suspensions
  'other'        -- Miscellaneous
);
```

---

## Expected Data Examples

### Example 1: Injury News (Breaking)

```json
{
  "news_id": 1,
  "player_id": "espn-3139477",
  "headline": "Derrick Henry questionable for Sunday",
  "description": "Ravens RB Derrick Henry is dealing with a hamstring strain and his status for Sunday's matchup against the Browns is uncertain.",
  "short_description": "Dealing with a hamstring strain and is questionable for Week 8.",
  "news_category": "injury",
  "source": "ESPN",
  "source_url": "https://www.espn.com/nfl/story/_/id/12345",
  "published_at": "2025-10-22T14:30:00Z",
  "external_id": "espn-news-12345",
  "is_breaking": true,
  "priority": 9
}
```

### Example 2: Trade News

```json
{
  "news_id": 2,
  "player_id": "espn-4040715",
  "headline": "Chiefs acquire Hopkins in blockbuster trade",
  "description": "The Kansas City Chiefs have traded for WR DeAndre Hopkins in exchange for a 2025 second-round pick.",
  "short_description": "Traded to Chiefs for 2025 second-round pick.",
  "news_category": "trade",
  "source": "ESPN",
  "source_url": "https://www.espn.com/nfl/story/_/id/67890",
  "published_at": "2025-10-20T16:00:00Z",
  "external_id": "espn-news-67890",
  "is_breaking": false,
  "priority": 8
}
```

### Example 3: Performance News

```json
{
  "news_id": 3,
  "player_id": "espn-3916387",
  "headline": "Mahomes throws 4 TDs in comeback win",
  "description": "Kansas City Chiefs QB Patrick Mahomes threw four touchdown passes in a 31-28 comeback victory over the Chargers.",
  "short_description": "Threw four touchdown passes in 31-28 win.",
  "news_category": "performance",
  "source": "ESPN",
  "source_url": "https://www.espn.com/nfl/story/_/id/11111",
  "published_at": "2025-10-21T23:45:00Z",
  "external_id": "espn-news-11111",
  "is_breaking": false,
  "priority": 6
}
```

---

## Current Status

**⚠️ NOT IMPLEMENTED**

This table is **planned but not yet built**. The complete specification exists in:
- `coderef/working/player-news/plan.json` (645 lines)
- `coderef/working/player-news/perplexity.md` (execution plan)

**What's Missing:**
- Database migrations (enum + table)
- Scraper script (player-news-scraper.js)
- Scheduler integration
- Frontend components

---

## Common Use Cases (When Implemented)

### 1. Get Player News (Last 30 Days)

```javascript
const { data: news } = await supabase
  .from('player_news')
  .select('*')
  .eq('player_id', 'espn-3139477')
  .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  .order('published_at', { ascending: false })
  .limit(10)

news.forEach(item => {
  console.log(`[${item.news_category}] ${item.headline}`)
})
```

### 2. Get Breaking News

```javascript
const { data: breaking } = await supabase
  .from('player_news')
  .select(`
    *,
    player:players(full_name, primary_position)
  `)
  .eq('is_breaking', true)
  .order('published_at', { ascending: false })
  .limit(20)

console.log(`${breaking.length} breaking news items`)
```

### 3. Get News by Category

```javascript
const { data: injuries } = await supabase
  .from('player_news')
  .select(`
    *,
    player:players(full_name, team_id)
  `)
  .eq('news_category', 'injury')
  .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  .order('published_at', { ascending: false })
```

### 4. Get Team News (All Players)

```javascript
// Get team roster
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
    player:players(full_name)
  `)
  .in('player_id', playerIds)
  .gte('published_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  .order('published_at', { ascending: false })
```

---

## Data Sources

### Primary: ESPN NFL News API

```
https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=50
```

**Pros:**
- Free, no authentication
- Real-time updates
- Verified reporters
- Player associations

**Cons:**
- Rate limiting (unofficial)
- May not have all players

---

### Fallback: RotoWire (Web Scraping)

```
https://www.rotowire.com/football/player/{playerName}
```

**Pros:**
- Comprehensive coverage
- Fantasy-focused (injury impact)
- Depth chart insights

**Cons:**
- Requires web scraping
- Slower updates
- No official API

---

### Alternative: Sportsgrid API

**Status**: Planned, not implemented

**Pros:**
- Real-time updates
- Fantasy focus
- Official API

**Cons:**
- Requires API key
- Potential costs

---

## Auto-Categorization Keywords

### Injury
```
injury, injured, out for, placed on IR, concussion, surgery,
torn, sprained, fracture, questionable, doubtful, probable
```

### Trade
```
traded, trade, acquired, dealt to, sends, receives,
signs with, released
```

### Performance
```
yards, touchdown, TD, reception, passing, rushing, sack,
interception, record, career-high, performance, game-winning
```

### Contract
```
contract, extension, signed, deal, million, year deal,
franchise tag, restructure, bonus
```

### Personal
```
arrested, suspension, retirement, retires, personal,
family, offseason, fine
```

---

## Frontend Display Examples

### News Card

```jsx
const NewsCard = ({ news }) => {
  const timeAgo = formatTimeAgo(news.published_at)

  return (
    <div className={`news-card ${news.is_breaking ? 'breaking' : ''}`}>
      {news.is_breaking && (
        <span className="breaking-badge">🔴 BREAKING</span>
      )}

      <span className={`category-badge ${news.news_category}`}>
        {news.news_category.toUpperCase()}
      </span>

      <h3>{news.headline}</h3>
      <p>{news.short_description || news.description}</p>

      <div className="meta">
        <span className="source">{news.source}</span>
        <span className="time">{timeAgo}</span>
      </div>

      {news.source_url && (
        <a href={news.source_url} target="_blank">
          Read More →
        </a>
      )}
    </div>
  )
}
```

### Category Filter

```jsx
const categories = ['all', 'injury', 'trade', 'performance', 'contract', 'personal']

<div className="filters">
  {categories.map(cat => (
    <button
      key={cat}
      onClick={() => setCategory(cat)}
      className={category === cat ? 'active' : ''}
    >
      {cat === 'all' ? 'All News' : cat.charAt(0).toUpperCase() + cat.slice(1)}
    </button>
  ))}
</div>
```

---

## Related Tables

- **players** - Player profiles (FK: player_id)
- **player_teams** - Team rosters (for team news aggregation)
- **team_news** - Team-level news (parallel table)

---

## Known Limitations

### 1. Not Yet Implemented ⚠️

**Issue**: Table and scraper don't exist yet.

**Status**: Complete specification available in plan.json.

**Next Steps**: Create migrations, build scraper, integrate with scheduler.

---

### 2. ESPN API Has No Official Rate Limits 🤷

**Issue**: No published rate limits for ESPN News API.

**Mitigation**: Self-impose 1 req/sec limit, monitor for 429 errors.

---

### 3. RotoWire Requires Web Scraping ⚠️

**Issue**: No official API, must parse HTML.

**Risk**: Site structure changes could break scraper.

**Mitigation**: Add error handling, fallback to ESPN only if scraping fails.

---

## Implementation Checklist

To populate this table:

- [ ] Create enum: `news_category_enum`
- [ ] Create table: `player_news` with all 15 columns
- [ ] Create indexes (5 total)
- [ ] Build scraper: `player-news-scraper.js`
- [ ] Implement ESPN API integration
- [ ] Add RotoWire fallback (optional)
- [ ] Add keyword categorization logic
- [ ] Implement deduplication (external_id)
- [ ] Add to scheduler (hourly between 6 AM - 11 PM ET)
- [ ] Create frontend news components
- [ ] Test with 100+ players

**Estimated Time**: 4-6 hours (per plan.json)

---

## Documentation Links

- **Migration Plan**: `coderef/working/player-news/plan.json` - Complete 645-line spec
- **Execution Guide**: `coderef/working/player-news/perplexity.md` - Phase-by-phase implementation
- **Field Mapping**: `PLAYER-NEWS-RESOURCES/field-mapping-report.md` - All 15 fields documented
- **Data Sources**: `PLAYER-NEWS-RESOURCES/raw-data-source-mapping.md` - ESPN + RotoWire + Sportsgrid

---

## Quick Commands (When Implemented)

```bash
# Run news scraper manually
npm run scrape:player-news

# Run for specific player
npm run scrape:player-news -- --player=3139477

# Check news count
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('player_news').select('*', { count: 'exact', head: true }).then(({ count }) => console.log('News items:', count));"

# Get breaking news
node -e "const { getSupabaseClient } = require('./scripts/utils/supabase-client.js'); const supabase = getSupabaseClient(); supabase.from('player_news').select('headline, published_at').eq('is_breaking', true).order('published_at', { ascending: false }).limit(10).then(({ data }) => console.table(data));"
```

---

**Last Updated**: October 22, 2025
**Total Fields**: 15
**Total Records**: 0 ⚠️ (NOT IMPLEMENTED)
**Status**: ⚠️ PLANNED - Complete spec exists, not yet built
**CodeRef**: plan.json + perplexity.md ✅ Validated
