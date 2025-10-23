# Coaches - Quick Reference Guide

> **Purpose**: Quick reference for coaches table
> **Date**: October 22, 2025
> **Status**: ⚠️ EMPTY (Schema exists, no data)
> **CodeRef**: Migration 20250101000004:81-108

---

## All 20 Fields (Copy-Paste Ready)

```
coach_id, first_name, last_name, full_name, birth_date, birth_city, birth_state, first_season, last_season, hof_inducted, hof_induction_year, total_wins, total_losses, total_ties, playoff_wins, playoff_losses, super_bowl_wins, headshot_url, created_at, updated_at, deleted_at
```

---

## SELECT Query String

```sql
coach_id, first_name, last_name, full_name, birth_date, birth_city, birth_state, first_season, last_season, hof_inducted, hof_induction_year, total_wins, total_losses, total_ties, playoff_wins, playoff_losses, super_bowl_wins, headshot_url, created_at, updated_at, deleted_at
```

---

## Quick Stats

- **Total Columns**: 20
- **Total Records**: 0 (⚠️ EMPTY - no data)
- **Expected Records**: ~300-500 coaches (historical)
- **Current Active**: ~32 head coaches + ~100 coordinators
- **Data Source**: ESPN API (coach profiles)
- **Auto-Populated**: ❌ No scraper exists

---

## Field Definitions (Quick)

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| coach_id | varchar(50) | "espn-12345" | PK |
| first_name | varchar(100) | "Andy" | ❌ Required |
| last_name | varchar(100) | "Reid" | ❌ Required |
| full_name | varchar(200) | "Andy Reid" | ✅ Optional |
| birth_date | date | "1958-03-19" | ✅ Optional |
| birth_city | varchar(100) | "Los Angeles" | ✅ Optional |
| birth_state | varchar(50) | "California" | ✅ Optional |
| first_season | integer | 1999 | First year coaching |
| last_season | integer | 2025 | Current/last year |
| hof_inducted | boolean | true | Hall of Fame (default false) |
| hof_induction_year | integer | 2030 | Year inducted |
| total_wins | integer | 258 | Career wins (default 0) |
| total_losses | integer | 145 | Career losses (default 0) |
| total_ties | integer | 1 | Career ties (default 0) |
| playoff_wins | integer | 26 | Playoff wins (default 0) |
| playoff_losses | integer | 9 | Playoff losses (default 0) |
| super_bowl_wins | integer | 3 | Super Bowl wins (default 0) |
| headshot_url | text | "https://..." | Photo URL |
| created_at | timestamp | Auto | ✅ Optional |
| updated_at | timestamp | Auto | ✅ Optional |
| deleted_at | timestamp | null | Soft delete |

---

## Expected Data Example

```json
{
  "coach_id": "espn-12345",
  "first_name": "Andy",
  "last_name": "Reid",
  "full_name": "Andy Reid",
  "birth_date": "1958-03-19",
  "birth_city": "Los Angeles",
  "birth_state": "California",
  "first_season": 1999,
  "last_season": 2025,
  "hof_inducted": false,
  "hof_induction_year": null,
  "total_wins": 258,
  "total_losses": 145,
  "total_ties": 1,
  "playoff_wins": 26,
  "playoff_losses": 9,
  "super_bowl_wins": 3,
  "headshot_url": "https://a.espncdn.com/..."
}
```

---

## Current Status

**⚠️ TABLE IS EMPTY**

Schema exists but:
- ❌ No data populated
- ❌ No scraper implemented
- ❌ Not linked to teams or games yet

**To populate**: Would need ESPN coach data or manual entry

---

## Common Queries (When Populated)

```javascript
// Get active head coaches
const { data: coaches } = await supabase
  .from('coaches')
  .select('*')
  .is('last_season', null)
  .order('last_name')

// Get Hall of Fame coaches
const { data: hof } = await supabase
  .from('coaches')
  .select('*')
  .eq('hof_inducted', true)
  .order('hof_induction_year')

// Get coaches with most wins
const { data: winners } = await supabase
  .from('coaches')
  .select('*')
  .order('total_wins', { ascending: false })
  .limit(10)
```

---

## Related Tables (Not Yet Created)

Would connect to:
- `team_coaches` - Link coaches to teams/seasons
- `games` - Coach records per game

---

## Documentation Links

- **Migration**: supabase/migrations/20250101000004_create_core_entity_tables.sql:81-108
- **Field Mapping**: COACHES-RESOURCES/field-mapping-report.md
- **Comment**: "NFL head coaches and coordinators"

---

**Last Updated**: October 22, 2025
**Total Fields**: 20
**Total Records**: 0 ⚠️ (EMPTY)
**Status**: ⚠️ Schema exists, no data
**CodeRef**: Migration 20250101000004:81-108 ✅ Validated
