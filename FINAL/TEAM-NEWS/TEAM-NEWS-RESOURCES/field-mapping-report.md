# Team News Table - Field Mapping Report

> **Purpose**: Field mapping for team_news table (optional enhancement)
> **Date**: October 22, 2025
> **Status**: ⚠️ PLANNED (Optional - lower priority than player_news)
> **CodeRef**: `coderef/working/player-news/plan.json:146-183`

---

## Executive Summary

The **team_news table** stores team-level news (coaching changes, roster moves, front office updates). This is a **simplified version** of player_news for team-wide news.

- **Total Columns**: 9 (vs 15 in player_news)
- **Total Records**: 0 (⚠️ Not implemented - optional table)
- **Priority**: LOW (implement player_news first)

---

## All 9 Fields (Copy-Paste Ready)

```
news_id, team_id, headline, description, news_category, published_at, external_id, created_at, updated_at
```

---

## Complete Field Mapping

| Field Name | Database Column | Type | Example | Nullable | Notes |
|------------|-----------------|------|---------|----------|-------|
| News ID | `news_id` | serial | 1 | ❌ No | PK (auto-increment) |
| Team ID | `team_id` | varchar(10) | "KC" | ❌ No | FK to teams table |
| Headline | `headline` | text | "Chiefs hire new OC" | ❌ No | News title |
| Description | `description` | text | "Kansas City hired..." | ✅ Yes | Full news body |
| News Category | `news_category` | news_category_enum | "other" | ❌ No | Same enum as player_news |
| Published At | `published_at` | timestamp | "2025-10-22 14:30:00" | ❌ No | When published |
| External ID | `external_id` | varchar(100) | "espn-news-12345" | ✅ Yes | For deduplication (UNIQUE) |
| Created At | `created_at` | timestamp | Auto | ✅ Yes | When scraped |
| Updated At | `updated_at` | timestamp | Auto | ✅ Yes | Last modified |

**Missing from player_news**: `short_description`, `source`, `source_url`, `is_breaking`, `priority`, `deleted_at`, `player_id`

---

## News Category Enum

Uses same enum as `player_news`:

```sql
-- Already defined for player_news
CREATE TYPE news_category_enum AS ENUM (
  'injury',      -- Not typically used for team news
  'trade',       -- Team acquisitions
  'performance', -- Team achievements
  'contract',    -- Coach/staff contracts
  'personal',    -- Organization matters
  'other'        -- Most team news (coaching, facilities, etc.)
);
```

**Common categories for team news:**
- `other` - Coaching changes, facility news, ownership
- `trade` - Team roster moves, signings
- `contract` - Coach/GM extensions

---

## Example Data

### Coaching Change

```json
{
  "news_id": 1,
  "team_id": "KC",
  "headline": "Chiefs hire Eric Bieniemy as offensive coordinator",
  "description": "Kansas City Chiefs announced the hiring of Eric Bieniemy as their new offensive coordinator...",
  "news_category": "other",
  "published_at": "2025-02-10T15:00:00Z",
  "external_id": "espn-news-78901"
}
```

### Roster Move

```json
{
  "news_id": 2,
  "team_id": "BAL",
  "headline": "Ravens sign veteran defensive end",
  "description": "Baltimore Ravens have signed DE Justin Houston to a one-year deal...",
  "news_category": "trade",
  "published_at": "2025-03-15T12:00:00Z",
  "external_id": "espn-news-78902"
}
```

---

## Common Queries

### Get Team News

```javascript
const { data: teamNews } = await supabase
  .from('team_news')
  .select('*')
  .eq('team_id', 'KC')
  .order('published_at', { ascending: false })
  .limit(10)
```

### Get All NFL News

```javascript
const { data: allNews } = await supabase
  .from('team_news')
  .select(`
    *,
    team:teams(team_name, team_abbr)
  `)
  .order('published_at', { ascending: false })
  .limit(50)
```

---

## Implementation Status

**Status**: ⚠️ **OPTIONAL (Not Implemented)**

**Priority**: LOW - Implement `player_news` first

**Why Optional:**
- Most team news can be linked to key players (coach, GM, star player)
- Lower volume than player news
- Can be added later if needed

---

## Related Tables

- `teams` - Team profiles (FK: team_id)
- `player_news` - Player-specific news (parallel table)

---

**Last Updated**: October 22, 2025
**Total Fields**: 9
**Total Records**: 0 (⚠️ Optional table)
**Status**: ⚠️ PLANNED - Lower priority than player_news
**CodeRef**: plan.json:146-183
