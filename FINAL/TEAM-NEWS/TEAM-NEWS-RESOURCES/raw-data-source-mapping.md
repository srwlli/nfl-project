# Team News - Raw Data Source Mapping

> **Purpose**: Document news sources for team_news table
> **Date**: October 22, 2025
> **Sources**: Same as player_news (ESPN, RotoWire, etc.)
> **Status**: ⚠️ OPTIONAL (Lower priority)

---

## Data Sources

**Same sources as player_news:**

1. **ESPN NFL News API** (primary)
2. **RotoWire** (fallback)
3. **Sportsgrid API** (alternative)
4. **Future**: CBS, Fox Sports, Rotoworld

**See**: `PLAYER-NEWS/PLAYER-NEWS-RESOURCES/raw-data-source-mapping.md` for complete source documentation

---

## ESPN API → Team News

### Filter Team-Level News

```javascript
async function fetchTeamNews() {
  const response = await axios.get(
    'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news',
    { params: { limit: 100 } }
  )

  // Filter for team-level news (no specific athletes)
  const teamNews = response.data.articles.filter(article =>
    !article.athletes || article.athletes.length === 0
  )

  return teamNews
}
```

---

## ESPN → Database Mapping

| Database Column | ESPN API | Notes |
|-----------------|----------|-------|
| team_id | Extract from keywords/categories | May require manual mapping |
| headline | `headline` | Direct |
| description | `description` | Direct |
| news_category | Auto-categorize | Usually "other" for team news |
| published_at | `published` | Parse ISO 8601 |
| external_id | From article URL | "espn-news-{id}" |

---

## Example ESPN Team News

```json
{
  "headline": "Chiefs promote assistant to defensive coordinator",
  "description": "Kansas City Chiefs have promoted Steve Spagnuolo to defensive coordinator...",
  "published": "2025-02-01T14:00:00Z",
  "links": {
    "web": {
      "href": "https://www.espn.com/nfl/story/_/id/99999"
    }
  },
  "keywords": ["Kansas City Chiefs", "coaching", "NFL"],
  "athletes": []  // No specific players
}
```

**Maps to:**
```json
{
  "team_id": "KC",
  "headline": "Chiefs promote assistant to defensive coordinator",
  "description": "Kansas City Chiefs have promoted Steve Spagnuolo...",
  "news_category": "other",
  "published_at": "2025-02-01T14:00:00Z",
  "external_id": "espn-news-99999"
}
```

---

## Team ID Extraction

### From Keywords

```javascript
function extractTeamId(article) {
  const text = (article.headline + ' ' + article.description).toLowerCase()

  // Check for team names in text
  const teams = {
    'chiefs': 'KC',
    'kansas city': 'KC',
    'ravens': 'BAL',
    'baltimore': 'BAL',
    // ... all 32 teams
  }

  for (const [keyword, teamId] of Object.entries(teams)) {
    if (text.includes(keyword)) {
      return teamId
    }
  }

  return null // Cannot determine team
}
```

---

## Implementation Status

**Status**: ⚠️ **OPTIONAL**

This table is lower priority than `player_news`. Most team news can be stored in `player_news` by linking to relevant players (coaches, GMs, star players).

---

**For Complete Source Documentation:**
See `PLAYER-NEWS/PLAYER-NEWS-RESOURCES/raw-data-source-mapping.md`

---

**Last Updated**: October 22, 2025
**Status**: ⚠️ OPTIONAL - Same sources as player_news
**Priority**: LOW
