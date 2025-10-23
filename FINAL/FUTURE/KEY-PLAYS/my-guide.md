# Key Plays - Quick Reference Guide

> **Purpose**: Quick reference for key_plays table
> **Date**: October 22, 2025
> **Status**: ⚠️ EMPTY (Future enhancement)
> **CodeRef**: Migration 20250101000008:122-138

---

## All 11 Fields (Copy-Paste Ready)

```
key_play_id, game_id, play_id, season, play_type, importance_score, description, video_url, created_at, updated_at, deleted_at
```

---

## SELECT Query String

```sql
key_play_id, game_id, play_id, season, play_type, importance_score, description, video_url, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 11
- **Total Records**: 0 (⚠️ EMPTY - future enhancement)
- **Expected Records**: ~5,000-10,000 per season (~20 key plays per game)
- **Data Source**: ESPN highlights + importance algorithm
- **Auto-Populated**: ❌ Not implemented

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| key_play_id | serial | 1 | Auto-increment PK |
| game_id | varchar(50) | "401772510" | Which game ❌ Required |
| play_id | bigint | 40177251040 | Links to play_by_play ✅ Optional |
| season | integer | 2025 | Which season ❌ Required |
| play_type | varchar(50) | "touchdown" | Type of key play ✅ Optional |
| importance_score | decimal(5,2) | 95.50 | 0-100 importance rating ✅ Optional |
| description | text | "75-yard TD pass" | Play description ✅ Optional |
| video_url | text | "https://..." | Highlight video ✅ Optional |
| created_at | timestamp | Auto | ✅ Optional |
| updated_at | timestamp | Auto | ✅ Optional |
| deleted_at | timestamp | null | Soft delete |

---

## Play Types (Examples)

- `touchdown` - Scoring plays
- `interception` - Turnovers
- `fumble_recovery` - Fumbles
- `fourth_down_conversion` - Clutch conversions
- `long_gain` - Big yardage plays (20+)
- `sack` - Defensive highlights
- `game_winning_score` - Final scoring drive
- `two_point_conversion` - Critical 2-pt conversions

---

## Importance Score Scale

**0-100 scoring system:**
- **90-100**: Game-changing (game-winning TD, crucial turnover)
- **75-89**: Major impact (long TD, red zone stop)
- **50-74**: Notable play (big gain, sack)
- **25-49**: Solid play (good execution)
- **0-24**: Minor highlight

---

## Expected Data Example

```json
{
  "key_play_id": 1,
  "game_id": "401772510",
  "play_id": 40177251040,
  "season": 2025,
  "play_type": "touchdown",
  "importance_score": 95.50,
  "description": "Patrick Mahomes 75-yard TD pass to Travis Kelce with 1:23 remaining",
  "video_url": "https://www.espn.com/video/clip/_/id/12345"
}
```

---

## Current Status

**⚠️ TABLE IS EMPTY - FUTURE ENHANCEMENT**

**Why empty:**
- No algorithm to identify "key plays"
- No importance scoring system implemented
- ESPN video URLs may not be available via API

**To implement:**
1. Create importance scoring algorithm (WPA, EPA, game situation)
2. Extract video URLs from ESPN API
3. Auto-identify key plays from play_by_play data
4. Manual curation option

---

## Potential Algorithm

```javascript
function calculateImportance(play, gameContext) {
  let score = 0

  // Scoring plays
  if (play.scoringPlay) score += 30

  // Turnovers
  if (play.type.includes('interception') || play.type.includes('fumble')) score += 25

  // Big plays (20+ yards)
  if (play.statYardage >= 20) score += 15

  // Game situation (clutch factor)
  if (gameContext.scoreDifferential <= 7 && gameContext.quarter >= 4) score += 20

  // Win Probability Added
  score += (play.wpa || 0) * 100

  return Math.min(score, 100)
}
```

---

## Common Queries (When Populated)

```javascript
// Get top plays for a game
const { data: keyPlays } = await supabase
  .from('key_plays')
  .select('*')
  .eq('game_id', '401772510')
  .order('importance_score', { ascending: false })
  .limit(10)

// Get week's top plays
const { data: weekHighlights } = await supabase
  .from('key_plays')
  .select(`
    *,
    game:games(home_team_id, away_team_id, game_date)
  `)
  .eq('season', 2025)
  .gte('importance_score', 75)
  .order('importance_score', { ascending: false })
  .limit(50)

// Get touchdowns only
const { data: touchdowns } = await supabase
  .from('key_plays')
  .select('*')
  .eq('play_type', 'touchdown')
  .order('importance_score', { ascending: false })
```

---

## Related Tables

- `games` - Game context (FK: game_id)
- `play_by_play` - Full play details (FK: play_id)

---

## Frontend Use Cases

**Highlight Reels:**
- "Top 10 Plays of the Week"
- Game highlight compilation
- Player highlight videos

**Game Summaries:**
- Key moments timeline
- "How the game was won"
- Turning points analysis

**Analytics:**
- Clutch performance tracking
- Big play frequency
- High-leverage situations

---

## Documentation Links

- **Migration**: supabase/migrations/20250101000008_create_game_and_reference_tables.sql:122-138
- **Field Mapping**: KEY-PLAYS-RESOURCES/field-mapping-report.md
- **Comment**: "Highlight/key plays (140,000+ plays)"

---

**Last Updated**: October 22, 2025
**Total Fields**: 11
**Total Records**: 0 ⚠️ (EMPTY - future enhancement)
**Status**: ⚠️ Schema exists, awaiting implementation
**CodeRef**: Migration 20250101000008:122-138 ✅ Validated
