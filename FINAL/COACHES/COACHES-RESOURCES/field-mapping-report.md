# Coaches Table - Field Mapping Report

> **Purpose**: Complete field mapping for coaches table
> **Date**: October 22, 2025
> **Status**: ⚠️ EMPTY (Schema exists, no data)
> **CodeRef**: Migration 20250101000004:81-108

---

## All 20 Fields

```
coach_id, first_name, last_name, full_name, birth_date, birth_city, birth_state, first_season, last_season, hof_inducted, hof_induction_year, total_wins, total_losses, total_ties, playoff_wins, playoff_losses, super_bowl_wins, headshot_url, created_at, updated_at, deleted_at
```

---

## Complete Field Mapping

| Field | Type | Example | Nullable | Notes |
|-------|------|---------|----------|-------|
| coach_id | varchar(50) | "espn-12345" | ❌ No | PK |
| first_name | varchar(100) | "Andy" | ❌ No | Required |
| last_name | varchar(100) | "Reid" | ❌ No | Required |
| full_name | varchar(200) | "Andy Reid" | ✅ Yes | Computed |
| birth_date | date | "1958-03-19" | ✅ Yes | Birthday |
| birth_city | varchar(100) | "Los Angeles" | ✅ Yes | Birth city |
| birth_state | varchar(50) | "California" | ✅ Yes | Birth state |
| first_season | integer | 1999 | ✅ Yes | First year |
| last_season | integer | 2025 | ✅ Yes | Last/current |
| hof_inducted | boolean | true | ✅ Yes | Hall of Fame (default false) |
| hof_induction_year | integer | 2030 | ✅ Yes | Induction year |
| total_wins | integer | 258 | ✅ Yes | Career wins (default 0) |
| total_losses | integer | 145 | ✅ Yes | Career losses (default 0) |
| total_ties | integer | 1 | ✅ Yes | Career ties (default 0) |
| playoff_wins | integer | 26 | ✅ Yes | Playoff wins (default 0) |
| playoff_losses | integer | 9 | ✅ Yes | Playoff losses (default 0) |
| super_bowl_wins | integer | 3 | ✅ Yes | Super Bowl wins (default 0) |
| headshot_url | text | "https://..." | ✅ Yes | Photo URL |
| created_at | timestamp | Auto | ✅ Yes | Created timestamp |
| updated_at | timestamp | Auto | ✅ Yes | Updated timestamp |
| deleted_at | timestamp | null | ✅ Yes | Soft delete |

---

## Database Indexes

```sql
-- Last name search
CREATE INDEX idx_coaches_last_name
ON coaches(last_name)
WHERE deleted_at IS NULL;

-- Hall of Fame coaches
CREATE INDEX idx_coaches_hof
ON coaches(hof_inducted)
WHERE hof_inducted = TRUE AND deleted_at IS NULL;
```

---

## Status

**⚠️ EMPTY TABLE** - Schema exists, no data populated, no scraper implemented.

---

**Last Updated**: October 22, 2025
**CodeRef**: Migration 20250101000004:81-108
