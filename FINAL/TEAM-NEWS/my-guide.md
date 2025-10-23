# Team News - Quick Reference Guide

> **Purpose**: Quick reference for team_news table
> **Date**: October 22, 2025
> **Status**: ⚠️ PLANNED (Optional enhancement to player_news)
> **CodeRef**: plan.json:146-183

---

## All 9 Fields (Copy-Paste Ready)

```
news_id, team_id, headline, description, news_category, published_at, external_id, created_at, updated_at
```

---

## SELECT Query String

```sql
news_id, team_id, headline, description, news_category, published_at, external_id, created_at, updated_at
```

---

## Quick Stats

- **Total Columns**: 9 (simplified version of player_news)
- **Total Records**: 0 (⚠️ NOT IMPLEMENTED - optional table)
- **Expected Records**: ~1,000-5,000 (team-level news only)
- **Daily Volume**: ~10-50 team news items
- **Data Sources**: Same as player_news (ESPN, RotoWire, etc.)
- **Auto-Populated**: ⚠️ Optional enhancement

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| news_id | serial | 1 | Auto-increment PK |
| team_id | varchar(10) | "KC" | FK to teams |
| headline | text | "Chiefs sign Pro Bowl DE" | News title |
| description | text | "Kansas City adds veteran..." | Full text |
| news_category | enum | "trade" | Same enum as player_news |
| published_at | timestamp | "2025-10-22 14:30:00" | When published |
| external_id | varchar(100) | "espn-news-12345" | For deduplication (UNIQUE) |
| created_at | timestamp | Auto | When scraped |
| updated_at | timestamp | Auto | Last modified |

**Note**: Simpler than player_news - no `short_description`, `source`, `source_url`, `is_breaking`, `priority`, or `deleted_at`

---

## Use Cases

### Team-Level News Examples

- Coaching changes ("New OC hired")
- Roster moves ("Team signs veteran CB")
- Front office news ("GM extension")
- Stadium/facility news ("New practice facility")
- League announcements affecting team ("Salary cap changes")

---

## Relationship to player_news

**Difference:**
- `player_news`: Player-specific (injury, performance, contract)
- `team_news`: Team-wide (coaching, facilities, organization)

**Example:**
- **Player news**: "Patrick Mahomes throws 4 TDs" → `player_news` table
- **Team news**: "Chiefs hire new offensive coordinator" → `team_news` table

---

## Common Queries

```javascript
// Get team news
const { data: teamNews } = await supabase
  .from('team_news')
  .select('*')
  .eq('team_id', 'KC')
  .order('published_at', { ascending: false })
  .limit(10)

// Get all NFL news (all teams)
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

## Status

**⚠️ OPTIONAL TABLE**

This is listed as "optional enhancement" in plan.json:146. Most team news can be stored in `player_news` table by linking to key players (QB, coach, GM).

**Priority**: LOW (implement `player_news` first)

---

## Documentation

See `PLAYER-NEWS` folder for detailed documentation - same concepts apply but simplified schema.

---

**Last Updated**: October 22, 2025
**Total Fields**: 9
**Total Records**: 0 ⚠️ (NOT IMPLEMENTED)
**Status**: ⚠️ OPTIONAL - Lower priority than player_news
**CodeRef**: plan.json:146-183
