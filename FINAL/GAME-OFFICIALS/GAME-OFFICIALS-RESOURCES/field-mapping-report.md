# Game Officials Table - Field Mapping Report

> **Purpose**: Complete field mapping for game_officials table
> **Date**: October 22, 2025
> **Status**: ⚠️ EMPTY (Schema exists, no data)
> **CodeRef**: Migration 20250101000008:158-170

---

## All 7 Fields

```
game_official_id, game_id, official_name, position, created_at, updated_at, deleted_at
```

---

## Complete Field Mapping

| Field | Type | Example | Nullable | Notes |
|-------|------|---------|----------|-------|
| game_official_id | serial | 1 | ❌ No | PK (auto-increment) |
| game_id | varchar(50) | "401772510" | ❌ No | FK to games |
| official_name | varchar(200) | "Shawn Hochuli" | ❌ No | Official's full name |
| position | varchar(50) | "Referee" | ✅ Yes | R/U/DJ/LJ/FJ/SJ/BJ |
| created_at | timestamp | Auto | ✅ Yes | Created timestamp |
| updated_at | timestamp | Auto | ✅ Yes | Updated timestamp |
| deleted_at | timestamp | null | ✅ Yes | Soft delete |

---

## Database Index

```sql
CREATE INDEX idx_game_officials_game
ON game_officials(game_id)
WHERE deleted_at IS NULL;
```

---

## Official Positions

| Position | Abbreviation | Primary Responsibilities |
|----------|--------------|--------------------------|
| Referee | R | Crew chief, penalty announcements |
| Umpire | U | Line of scrimmage, equipment |
| Down Judge | DJ | Line of scrimmage, chain crew |
| Line Judge | LJ | Line of scrimmage, timekeeping |
| Field Judge | FJ | Deep coverage, receivers |
| Side Judge | SJ | Deep coverage, receivers |
| Back Judge | BJ | Deep middle, QB, field goals |

---

## Expected Records

**Per Game**: 7 officials
**Per Season**: ~1,960 records (280 games × 7 officials)
**Comment**: "14,000+ games" suggests multi-season historical data

---

## Status

**⚠️ EMPTY TABLE** - Schema exists, no data populated, no scraper implemented.

**Data Availability**: ESPN API may not provide official crew information.

---

**Last Updated**: October 22, 2025
**CodeRef**: Migration 20250101000008:158-170
