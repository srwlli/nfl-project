# Player News - Raw Data Source Mapping

> **Purpose**: Document all news data sources for player_news table
> **Date**: October 22, 2025
> **Sources**: ESPN (primary), RotoWire (fallback), Sportsgrid (alternative), CBS/Fox/Rotoworld (future)
> **CodeRef**: `coderef/working/player-news/plan.json` + `perplexity.md`

---

## Overview of News Sources

### Current Implementation Plan

**Primary Source**: ESPN NFL News API (free, no auth required)
**Fallback Source**: RotoWire (web scraping when ESPN incomplete)
**Alternative Source**: Sportsgrid API (potential integration)

**Future Sources** (plan.json:562-564):
- Rotoworld
- CBS Sports
- Fox Sports

---

## Source 1: ESPN NFL News API (PRIMARY)

### API Endpoint

**Base URL:**
```
https://site.api.espn.com/apis/site/v2/sports/football/nfl/news
```

**Parameters:**
- `limit` (optional): Number of articles to return (default: 50)

**Player-Specific Endpoint** (if available):
```
https://site.api.espn.com/apis/site/v2/sports/football/nfl/athletes/{playerId}/news
```

---

### ESPN API Response Structure

```json
{
  "header": "NFL News",
  "link": {
    "language": "en-US",
    "rel": ["desktop", "mobile"],
    "href": "https://www.espn.com/nfl/",
    "text": "NFL"
  },
  "articles": [
    {
      "headline": "Derrick Henry questionable for Sunday's game",
      "description": "Ravens running back Derrick Henry is dealing with a hamstring strain and his status for Sunday's matchup against the Browns is uncertain.",
      "published": "2025-10-22T14:30:00Z",
      "type": "Story",
      "premium": false,
      "links": {
        "api": {
          "news": {
            "href": "https://api.espn.com/..."
          },
          "self": {
            "href": "https://api.espn.com/..."
          }
        },
        "web": {
          "href": "https://www.espn.com/nfl/story/_/id/12345/derrick-henry-questionable",
          "short": {
            "href": "https://es.pn/abc123"
          }
        },
        "mobile": {
          "href": "https://m.espn.com/..."
        }
      },
      "images": [
        {
          "name": "Derrick Henry",
          "url": "https://a.espncdn.com/...",
          "height": 1080,
          "width": 1920,
          "alt": "Derrick Henry"
        }
      ],
      "categories": [
        {
          "id": 1,
          "description": "Injury Report",
          "type": "topic",
          "sportId": 28,
          "leagueId": 1,
          "league": {
            "id": 1,
            "description": "National Football League",
            "links": {
              "web": {
                "href": "https://www.espn.com/nfl/"
              }
            }
          },
          "uid": "s:28~l:1~t:1",
          "createDate": "2025-10-22T14:30:00Z"
        }
      ],
      "keywords": ["Derrick Henry", "Baltimore Ravens", "injury", "NFL"],
      "byline": "Adam Schefter",
      "athletes": [
        {
          "id": 3139477,
          "uid": "s:28~l:1~a:3139477",
          "guid": "...",
          "type": "Player",
          "fullName": "Derrick Henry",
          "displayName": "Derrick Henry",
          "shortName": "D. Henry",
          "links": {
            "api": {
              "href": "https://sports.core.api.espn.pvt/v2/sports/football/leagues/nfl/athletes/3139477"
            },
            "web": {
              "href": "https://www.espn.com/nfl/player/_/id/3139477/derrick-henry"
            }
          },
          "headshot": "https://a.espncdn.com/...",
          "jersey": "22",
          "position": {
            "abbreviation": "RB"
          },
          "team": {
            "id": 33,
            "abbreviation": "BAL",
            "displayName": "Baltimore Ravens"
          }
        }
      ],
      "lastModified": "2025-10-22T14:35:00Z",
      "originalPublishDate": "2025-10-22T14:30:00Z"
    }
  ],
  "resultsCount": 50,
  "resultsLimit": 50,
  "timestamp": "2025-10-22T15:00:00Z"
}
```

---

### ESPN → Database Field Mapping

| Database Column | ESPN API Path | Transform | Notes |
|-----------------|---------------|-----------|-------|
| `player_id` | `athletes[0].id` | Prefix "espn-" | Use first athlete ID |
| `headline` | `headline` | Direct | News title |
| `description` | `description` | Direct | Full text |
| `short_description` | `description` | Truncate 500 chars | Add "..." if needed |
| `news_category` | `categories[0].description` + keyword match | Auto-categorize | Map to enum |
| `source` | Hardcoded | "ESPN" | News provider |
| `source_url` | `links.web.href` | Direct | Article link |
| `published_at` | `published` | Parse ISO 8601 | Convert to timestamp |
| `external_id` | `links.web.href` | Extract ID | "espn-news-{id}" |
| `is_breaking` | `published` | Check <1 hour | Boolean |
| `priority` | Calculate from category | 0-10 scale | See priority logic |

---

### ESPN Transformation Example

**ESPN Response:**
```json
{
  "headline": "Patrick Mahomes throws 4 TDs in comeback win",
  "description": "Kansas City Chiefs QB Patrick Mahomes threw four touchdown passes...",
  "published": "2025-10-22T20:15:00Z",
  "links": {
    "web": {
      "href": "https://www.espn.com/nfl/story/_/id/67890/mahomes-4-tds"
    }
  },
  "athletes": [
    {
      "id": 3139477,
      "fullName": "Patrick Mahomes"
    }
  ]
}
```

**Transformed to Database:**
```json
{
  "player_id": "espn-3139477",
  "headline": "Patrick Mahomes throws 4 TDs in comeback win",
  "description": "Kansas City Chiefs QB Patrick Mahomes threw four touchdown passes...",
  "short_description": "Kansas City Chiefs QB Patrick Mahomes threw four touchdown passes...",
  "news_category": "performance",
  "source": "ESPN",
  "source_url": "https://www.espn.com/nfl/story/_/id/67890/mahomes-4-tds",
  "published_at": "2025-10-22T20:15:00Z",
  "external_id": "espn-news-67890",
  "is_breaking": false,
  "priority": 6
}
```

---

### ESPN Rate Limiting

**Official Limit**: Unknown (ESPN API is public, no published limits)

**Recommended Practice**:
- 1 request per second (self-imposed)
- Exponential backoff on 429 errors
- Batch players (100 at a time)
- Cache responses for 1 hour

```javascript
const rateLimiter = createRateLimiter(1) // 1 req/sec

await rateLimiter.execute(async () => {
  const response = await axios.get(ESPN_NEWS_URL, {
    params: { limit: 50 }
  })
  return response.data
})
```

---

## Source 2: RotoWire (FALLBACK - Web Scraping)

### Why RotoWire as Fallback

**Use Case**: When ESPN API has no news for a player, scrape RotoWire

**URL Pattern:**
```
https://www.rotowire.com/football/player/{playerNameSlug}
```

**Example:**
```
https://www.rotowire.com/football/player/derrick-henry-9734
```

---

### RotoWire HTML Structure

```html
<div class="player-news">
  <div class="news-update">
    <div class="news-update__timestamp">
      Updated 3 hours ago
    </div>
    <div class="news-update__headline">
      Henry questionable for Sunday
    </div>
    <div class="news-update__news">
      <p>
        Derrick Henry (hamstring) is listed as questionable for
        Week 8 against the Browns. He was limited in practice
        all week and his status will be a game-time decision.
      </p>
    </div>
    <div class="news-update__impact">
      <strong>Impact:</strong> If Henry sits, expect Justice Hill
      to see increased carries.
    </div>
  </div>
</div>
```

---

### RotoWire Scraping Logic

```javascript
import axios from 'axios'
import * as cheerio from 'cheerio'

async function fetchFromRotoWire(playerName) {
  const slug = playerName.toLowerCase().replace(/ /g, '-')
  const url = `https://www.rotowire.com/football/player/${slug}`

  try {
    const { data: html } = await axios.get(url)
    const $ = cheerio.load(html)

    const newsItems = []

    $('.news-update').each((i, elem) => {
      const headline = $(elem).find('.news-update__headline').text().trim()
      const newsText = $(elem).find('.news-update__news p').text().trim()
      const timestamp = $(elem).find('.news-update__timestamp').text().trim()

      newsItems.push({
        headline,
        description: newsText,
        source: 'RotoWire',
        source_url: url,
        published_at: parseRelativeTime(timestamp) // "3 hours ago" → timestamp
      })
    })

    return newsItems
  } catch (error) {
    logger.error(`Failed to scrape RotoWire for ${playerName}:`, error.message)
    return []
  }
}

function parseRelativeTime(text) {
  // "Updated 3 hours ago" → calculate timestamp
  const match = text.match(/(\d+)\s+(hour|day|minute)s?\s+ago/)
  if (!match) return new Date()

  const [, amount, unit] = match
  const ms = {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000
  }[unit]

  return new Date(Date.now() - (amount * ms))
}
```

---

### RotoWire → Database Mapping

| Database Column | RotoWire HTML | Transform | Notes |
|-----------------|---------------|-----------|-------|
| `player_id` | From function param | Player lookup | Must have player_id beforehand |
| `headline` | `.news-update__headline` | Direct | News title |
| `description` | `.news-update__news p` | Direct | Full text |
| `short_description` | `.news-update__news p` | Truncate 500 | Preview |
| `news_category` | From headline/description | Auto-categorize | Keyword matching |
| `source` | Hardcoded | "RotoWire" | Source name |
| `source_url` | Page URL | Direct | Player page |
| `published_at` | `.news-update__timestamp` | Parse relative time | "3 hours ago" |
| `external_id` | Hash headline + timestamp | Generate | For dedup |
| `is_breaking` | From published_at | Check <1 hour | Boolean |
| `priority` | Calculate | 0-10 scale | Same logic |

---

## Source 3: Sportsgrid API (ALTERNATIVE)

### Sportsgrid API

**Status**: Potential integration (not yet implemented)

**API Base:**
```
https://api.sportsgrid.com/v1/
```

**Typical Endpoints:**
- `/news` - General news
- `/news/player/{playerId}` - Player-specific news
- `/news/nfl` - NFL news

**Authentication**: Requires API key (registration needed)

**Rate Limits**: Unknown (depends on plan)

---

### Example Sportsgrid Response

```json
{
  "news": [
    {
      "id": "sg-12345",
      "title": "Derrick Henry limited in practice",
      "body": "Ravens RB Derrick Henry was limited in Wednesday's practice...",
      "published_date": "2025-10-22T16:00:00Z",
      "source": "Sportsgrid",
      "url": "https://www.sportsgrid.com/nfl/news/...",
      "player_id": "3139477",
      "team": "BAL",
      "tags": ["injury", "practice report"]
    }
  ]
}
```

---

### Sportsgrid → Database Mapping

| Database Column | Sportsgrid API | Transform | Notes |
|-----------------|----------------|-----------|-------|
| `player_id` | `player_id` | Prefix "espn-" | Assumes ESPN IDs |
| `headline` | `title` | Direct | News title |
| `description` | `body` | Direct | Full text |
| `short_description` | `body` | Truncate 500 | Preview |
| `news_category` | `tags` or auto-categorize | Map tags | Use keyword logic |
| `source` | `source` or "Sportsgrid" | Direct | Source name |
| `source_url` | `url` | Direct | Article link |
| `published_at` | `published_date` | Parse ISO | Timestamp |
| `external_id` | `id` | Prefix "sg-" | Unique ID |
| `is_breaking` | Calculate | Check <1 hour | Boolean |
| `priority` | Calculate | 0-10 scale | Same logic |

---

## Future Sources (NOT YET IMPLEMENTED)

### Rotoworld

**URL**: `https://www.nbcsports.com/nfl/rotoworld`
**Method**: Web scraping or API (if available)
**Coverage**: Injury updates, depth chart changes, fantasy impact

---

### CBS Sports

**URL**: `https://www.cbssports.com/nfl/news/`
**Method**: Web scraping or RSS feeds
**Coverage**: Game recaps, injury reports, transactions

---

### Fox Sports

**URL**: `https://www.foxsports.com/nfl`
**Method**: Web scraping
**Coverage**: Breaking news, analysis, interviews

---

## Multi-Source Scraping Strategy

### Scraper Flow (from perplexity.md:17-21)

```javascript
async function fetchAllPlayerNews(playerId) {
  let newsItems = []

  // 1. Try ESPN first (primary source)
  try {
    const espnNews = await fetchNewsFromESPN(playerId, 50)
    newsItems.push(...espnNews)
    logger.info(`ESPN: Found ${espnNews.length} news items for player ${playerId}`)
  } catch (error) {
    logger.error(`ESPN fetch failed for ${playerId}:`, error.message)
  }

  // 2. If ESPN has no news, try RotoWire (fallback)
  if (newsItems.length === 0) {
    try {
      const playerName = await getPlayerName(playerId)
      const rotoNews = await fetchFromRotoWire(playerName)
      newsItems.push(...rotoNews)
      logger.info(`RotoWire: Found ${rotoNews.length} news items for ${playerName}`)
    } catch (error) {
      logger.error(`RotoWire scraping failed for ${playerId}:`, error.message)
    }
  }

  // 3. Future: Add Sportsgrid as alternative
  // if (SPORTSGRID_API_KEY) {
  //   const sgNews = await fetchFromSportsgrid(playerId)
  //   newsItems.push(...sgNews)
  // }

  return newsItems
}
```

---

## Deduplication Across Sources

### External ID Strategy

```javascript
function generateExternalId(news, source) {
  // Use source-specific ID if available
  if (source === 'ESPN' && news.links?.web?.href) {
    const match = news.links.web.href.match(/\/id\/(\d+)/)
    return match ? `espn-news-${match[1]}` : null
  }

  if (source === 'Sportsgrid' && news.id) {
    return `sg-${news.id}`
  }

  // For RotoWire (no IDs), generate hash
  if (source === 'RotoWire') {
    const hash = crypto
      .createHash('md5')
      .update(news.headline + news.published_at)
      .digest('hex')
      .substring(0, 8)
    return `roto-${hash}`
  }

  return null
}
```

---

### Fuzzy Matching for Duplicates

```javascript
async function isDuplicateNews(headline, publishedAt) {
  // Get news from last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const { data: recentNews } = await supabase
    .from('player_news')
    .select('headline, published_at')
    .gte('published_at', oneDayAgo)

  // Check for exact or near-exact headline matches
  for (const existing of recentNews) {
    const distance = levenshteinDistance(
      existing.headline.toLowerCase(),
      headline.toLowerCase()
    )

    // If very similar headline within 1 hour, it's a duplicate
    const timeDiff = Math.abs(new Date(existing.published_at) - new Date(publishedAt))
    if (distance < 10 && timeDiff < 60 * 60 * 1000) {
      return true
    }
  }

  return false
}
```

---

## Source Priority Ranking

### When Multiple Sources Have Same News

**Priority Order**:
1. **ESPN** (most authoritative, verified reporters)
2. **Sportsgrid** (real-time updates)
3. **RotoWire** (fantasy-focused, slower)
4. **CBS/Fox/Rotoworld** (general news)

**Logic**:
```javascript
function selectBestSource(duplicateNews) {
  const sourcePriority = {
    'ESPN': 10,
    'Sportsgrid': 8,
    'RotoWire': 6,
    'CBS Sports': 5,
    'Fox Sports': 5,
    'Rotoworld': 4
  }

  return duplicateNews.sort((a, b) =>
    sourcePriority[b.source] - sourcePriority[a.source]
  )[0]
}
```

---

## Testing Data Sources

### ESPN API Test

```bash
# Fetch general NFL news
curl "https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=10"

# Test in Node.js
node -e "const axios = require('axios'); (async () => { const res = await axios.get('https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=5'); console.log(JSON.stringify(res.data.articles[0], null, 2)); })();"
```

---

### RotoWire Scraping Test

```bash
# View HTML structure
curl "https://www.rotowire.com/football/player/derrick-henry-9734" | grep -A 10 "news-update"

# Test with cheerio
node -e "const axios = require('axios'); const cheerio = require('cheerio'); (async () => { const {data} = await axios.get('https://www.rotowire.com/football/player/derrick-henry-9734'); const $ = cheerio.load(data); console.log($('.news-update__headline').first().text()); })();"
```

---

## Implementation Checklist

### Phase 1: ESPN Integration
- [ ] Implement `fetchNewsFromESPN(playerId)`
- [ ] Parse ESPN API response
- [ ] Map to database schema
- [ ] Handle rate limiting
- [ ] Test with 10 players

### Phase 2: RotoWire Fallback
- [ ] Install cheerio for HTML parsing
- [ ] Implement `fetchFromRotoWire(playerName)`
- [ ] Parse HTML structure
- [ ] Handle relative timestamps
- [ ] Test scraping

### Phase 3: Multi-Source Strategy
- [ ] Implement source priority logic
- [ ] Add deduplication across sources
- [ ] Merge news from all sources
- [ ] Handle conflicts (same news, different sources)

### Phase 4: Future Sources
- [ ] Research Sportsgrid API
- [ ] Investigate CBS/Fox RSS feeds
- [ ] Add Rotoworld scraping

---

**Last Updated**: October 22, 2025
**Primary Source**: ESPN NFL News API (free, public)
**Fallback Source**: RotoWire (web scraping)
**Alternative Source**: Sportsgrid API (planned)
**Future Sources**: CBS, Fox Sports, Rotoworld
**Status**: ⚠️ Documented, not yet implemented
