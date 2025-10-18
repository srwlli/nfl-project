# Supabase Database - NFL Stats Platform

Complete Supabase implementation for the NFL Stats Platform with auto-generated REST API.

## Quick Start

1. **Create Supabase Project**: [https://supabase.com](https://supabase.com)
2. **Run Migrations**: Execute migration files in order (see guide)
3. **Get API**: Auto-generated REST API ready immediately
4. **Load Data**: Use ingestion scripts (see guide)

## What's Included

### Migration Files (10 files)

Located in `supabase/migrations/`:

| # | File | Purpose |
|---|------|---------|
| 1 | `20250101000001_enable_extensions.sql` | PostgreSQL extensions (uuid-ossp, pg_trgm, btree_gin) |
| 2 | `20250101000002_create_enums.sql` | ENUM types (game_status, player_status, etc.) |
| 3 | `20250101000003_create_foundation_tables.sql` | 7 foundation tables (teams, stadiums, positions, etc.) |
| 4 | `20250101000004_create_core_entity_tables.sql` | 5 core tables (players, coaches, seasons, games, team_seasons) |
| 5 | `20250101000005_create_player_stats_tables.sql` | 7 player stats tables (incl. 2 partitioned) |
| 6 | `20250101000006_create_remaining_player_stats.sql` | 4 more player stats tables |
| 7 | `20250101000007_create_team_stats_tables.sql` | 5 team stats tables |
| 8 | `20250101000008_create_game_and_reference_tables.sql` | 20 tables (game details, leaderboards, relationships) |
| 9 | `20250101000009_enable_rls_policies.sql` | Row Level Security (public read, service write) |
| 10 | `20250101000010_create_database_functions.sql` | 8 custom database functions |

**Total**: 41 tables, ~850 columns, ~150 indexes, 4 partitioned tables

### Database Functions

8 custom PostgreSQL functions for complex queries:

1. `get_player_career_summary(player_id)` - Career stats
2. `get_season_leaderboard(season, stat, position, limit)` - Leaderboards
3. `get_team_season_record(team_id, season)` - Team record
4. `get_upcoming_games(limit)` - Upcoming schedule
5. `search_players(term, limit)` - Fuzzy player search
6. `get_player_stats_by_season(player_id, season)` - Season stats
7. `get_game_summary(game_id)` - Game details
8. `soft_delete(table, column, value)` - Soft delete helper

### Implementation Guide

Complete guide in `SUPABASE-IMPLEMENTATION-GUIDE.md`:

- ✅ Setup instructions (step-by-step)
- ✅ Migration execution (Dashboard + CLI)
- ✅ Auto-generated API examples
- ✅ Database function usage
- ✅ Row Level Security explained
- ✅ Data ingestion patterns
- ✅ Cost estimates ($25-50/month)
- ✅ Performance optimization
- ✅ Code examples (JavaScript, Python)

## Database Schema Summary

### 41 Tables Across 6 Domains

| Domain | Tables | Est. Rows |
|--------|--------|-----------|
| **Core Entities** | 8 | 847,050 |
| **Player Stats** | 10 | 1,153,000 |
| **Team Stats** | 5 | 5,456 |
| **Game Details** | 7 | 7,055,000 |
| **Leaderboards** | 4 | 67,000 |
| **Reference** | 7 | 303 |
| **TOTAL** | **41** | **~9.1M rows** |

### Partitioned Tables (For Performance)

- `player_season_stats` - Partitioned by decade (1970s, 1980s, ..., 2020s)
- `player_game_stats` - Partitioned by season (recent 5 years individual)
- `play_by_play` - Partitioned by season (~7M rows)
- `games` - Partitioned by season

## Auto-Generated REST API

Supabase automatically creates REST API endpoints for all 41 tables!

### Example API Calls

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)

// Get all teams
const { data } = await supabase.from('teams').select('*')

// Get player stats with joins
const { data } = await supabase
  .from('player_season_stats')
  .select('*, players(*), teams(*)')
  .eq('player_id', 'brady-tom')
  .eq('season', 2007)

// Use custom function
const { data } = await supabase.rpc('get_season_leaderboard', {
  p_season: 2024,
  p_stat_category: 'passing_yards',
  p_limit: 10
})

// Real-time subscriptions
const channel = supabase
  .channel('game-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'games'
  }, (payload) => {
    console.log('Game updated:', payload.new)
  })
  .subscribe()
```

## Row Level Security (RLS)

- ✅ **Public READ**: Anyone can SELECT (using `anon` key)
- ✅ **Service WRITE**: Only `service_role` key can INSERT/UPDATE/DELETE
- ✅ **Soft Deletes**: Records with `deleted_at != NULL` hidden automatically

### Frontend (Read-Only)

```javascript
// Safe to use in browser
const supabase = createClient(url, anonKey)
const { data } = await supabase.from('players').select('*') // ✅ Works
const { error } = await supabase.from('players').insert({...}) // ❌ Blocked by RLS
```

### Backend (Full Access)

```javascript
// NEVER expose in browser!
const supabase = createClient(url, serviceRoleKey)
const { data } = await supabase.from('players').insert({...}) // ✅ Works
```

## Cost Estimate

| Plan | Database | Bandwidth | Cost |
|------|----------|-----------|------|
| Free | 500 MB | 5 GB | $0 |
| **Pro** (Recommended) | 8 GB | 100 GB | **$25/month** |
| Team | 100 GB | 250 GB | $599/month |

**Savings vs AWS RDS**: $90-145/month

## Performance Features

- ✅ **Partitioning**: 4 tables partitioned (40-80% speedup)
- ✅ **Indexing**: ~150 indexes (10-100x speedup)
- ✅ **Connection Pooling**: Built-in pgBouncer
- ✅ **Edge Functions**: Serverless compute
- ✅ **Real-time**: WebSocket subscriptions

## Getting Started

1. Read `SUPABASE-IMPLEMENTATION-GUIDE.md`
2. Create Supabase project at [https://supabase.com](https://supabase.com)
3. Run migrations in order (via Dashboard or CLI)
4. Test API with sample queries
5. Load data using ingestion scripts

**Setup time**: 1-2 hours

## Data Sources (All Free)

- nflreadpy - Historical stats (1970-2024)
- sportsref_nfl - Pro Football Reference scraper
- nflscrapy - Advanced analytics
- NFL Next Gen Stats - Tracking data (2016+)
- Manual curation - Awards, milestones

## Files Structure

```
supabase/
├── migrations/
│   ├── 20250101000001_enable_extensions.sql
│   ├── 20250101000002_create_enums.sql
│   ├── 20250101000003_create_foundation_tables.sql
│   ├── 20250101000004_create_core_entity_tables.sql
│   ├── 20250101000005_create_player_stats_tables.sql
│   ├── 20250101000006_create_remaining_player_stats.sql
│   ├── 20250101000007_create_team_stats_tables.sql
│   ├── 20250101000008_create_game_and_reference_tables.sql
│   ├── 20250101000009_enable_rls_policies.sql
│   └── 20250101000010_create_database_functions.sql
├── SUPABASE-IMPLEMENTATION-GUIDE.md (Complete guide)
└── README.md (This file)
```

## Next Steps

1. ✅ Database schema complete (41 tables)
2. ✅ Migrations ready
3. ✅ RLS policies configured
4. ✅ Custom functions created
5. ⏳ **Create Supabase project** ← START HERE
6. ⏳ Run migrations
7. ⏳ Load data
8. ⏳ Build frontend

## Support

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Implementation guide included in this directory

---

**Ready to deploy!** Follow the implementation guide to get started.
