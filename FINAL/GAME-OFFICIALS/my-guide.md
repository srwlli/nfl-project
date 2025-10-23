# Game Officials - Quick Reference Guide

> **Purpose**: Quick reference for game_officials table
> **Date**: October 22, 2025
> **Status**: ⚠️ EMPTY (Schema exists, no data)
> **CodeRef**: Migration 20250101000008:158-170

---

## All 7 Fields (Copy-Paste Ready)

```
game_official_id, game_id, official_name, position, created_at, updated_at, deleted_at
```

---

## SELECT Query String

```sql
game_official_id, game_id, official_name, position, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 7
- **Total Records**: 0 (⚠️ EMPTY - no data)
- **Expected Records**: ~1,500-2,000 per season (7 officials × ~280 games)
- **Per Game**: 7 officials (Referee, Umpire, Line Judge, etc.)
- **Data Source**: ESPN game data
- **Auto-Populated**: ❌ No scraper exists

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| game_official_id | serial | 1 | Auto-increment PK |
| game_id | varchar(50) | "401772510" | Which game (FK to games) |
| official_name | varchar(200) | "Shawn Hochuli" | Official's name ❌ Required |
| position | varchar(50) | "Referee" | Position/role ✅ Optional |
| created_at | timestamp | Auto | ✅ Optional |
| updated_at | timestamp | Auto | ✅ Optional |
| deleted_at | timestamp | null | Soft delete |

---

## Official Positions

Typical NFL officiating crew (7 positions):
- **Referee (R)** - Crew chief, announces penalties
- **Umpire (U)** - Line of scrimmage, equipment checks
- **Down Judge (DJ)** - Line of scrimmage, chain crew
- **Line Judge (LJ)** - Line of scrimmage, timekeeping
- **Field Judge (FJ)** - Deep coverage, receiver downfield
- **Side Judge (SJ)** - Deep coverage, receiver coverage
- **Back Judge (BJ)** - Deep middle, quarterback, field goals

---

## Expected Data Example

```json
{
  "game_official_id": 1,
  "game_id": "401772510",
  "official_name": "Shawn Hochuli",
  "position": "Referee"
}
```

---

## Current Status

**⚠️ TABLE IS EMPTY**

Schema exists but:
- ❌ No data populated
- ❌ No scraper implemented
- ⚠️ ESPN API may not provide official names

**Comment from migration**: "14,000+ games" (multi-season historical scope)

---

## Common Queries (When Populated)

```javascript
// Get officials for a game
const { data: officials } = await supabase
  .from('game_officials')
  .select('*')
  .eq('game_id', '401772510')

// Count games by official
const { data: officialGames } = await supabase
  .from('game_officials')
  .select('official_name, game_id')
  .eq('official_name', 'Shawn Hochuli')
```

---

## Related Tables

- `games` - Game information (FK: game_id)

---

## Documentation Links

- **Migration**: supabase/migrations/20250101000008_create_game_and_reference_tables.sql:158-170
- **Field Mapping**: GAME-OFFICIALS-RESOURCES/field-mapping-report.md
- **Comment**: "Officiating crews (14,000+ games)"

---

**Last Updated**: October 22, 2025
**Total Fields**: 7
**Total Records**: 0 ⚠️ (EMPTY)
**Status**: ⚠️ Schema exists, no data
**CodeRef**: Migration 20250101000008:158-170 ✅ Validated
