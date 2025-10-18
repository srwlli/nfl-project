

# Supabase Implementation Guide - NFL Stats Platform

**Project:** NFL Stats Platform - Next Scraper
**Database:** Supabase (PostgreSQL 15+)
**Created:** 2025-10-18
**Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [Migration Files](#migration-files)
4. [Auto-Generated API](#auto-generated-api)
5. [Database Functions](#database-functions)
6. [Row Level Security](#row-level-security)
7. [Data Ingestion](#data-ingestion)
8. [Cost Estimates](#cost-estimates)
9. [Performance Optimization](#performance-optimization)
10. [Next Steps](#next-steps)

---

## Overview

This guide provides complete instructions for implementing the NFL Stats Platform database on **Supabase**.

### Why Supabase?

- ✅ **Auto-generated REST API** from database schema
- ✅ **Built-in authentication** and Row Level Security
- ✅ **Real-time subscriptions** (perfect for live games)
- ✅ **Lower cost**: $25-50/month vs $115-170/month for AWS RDS
- ✅ **PostgreSQL 15+** with all our advanced features (partitioning, etc.)
- ✅ **Developer-friendly** UI and tooling

### Database Schema Summary

- **41 tables** across 6 domains
- **~850 columns** total
- **~9.1 million rows** at launch
- **~18 GB** estimated size with indexes
- **4 partitioned tables** for performance
- **6 materialized views** (optional, for performance)
- **~150 indexes** for fast queries

---

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization (if needed)
4. Click "New project"
5. Fill in details:
   - **Name**: nfl-stats-platform
   - **Database Password**: (generate strong password, save it!)
   - **Region**: Choose closest to your users (e.g., US East)
   - **Pricing Plan**:
     - Start with **Free** for development ($0, 500 MB database)
     - Upgrade to **Pro** for production ($25/month, 8 GB database)
6. Click "Create new project"
7. Wait 2-3 minutes for provisioning

### Step 2: Get Your Credentials

Once your project is created, go to **Settings → API**:

```javascript
// Save these somewhere safe!
export const supabaseConfig = {
  url: 'https://your-project-id.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Public key (read-only via RLS)
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Private key (full access)
}
```

**IMPORTANT**:
- `anonKey` → Use in frontend (safe to expose, read-only via RLS)
- `serviceRoleKey` → Use in backend only (full database access, NEVER expose!)

### Step 3: Install Supabase CLI (Optional but Recommended)

```bash
# Install via npm
npm install -g supabase

# Or via homebrew (Mac)
brew install supabase/tap/supabase

# Or via scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 4: Link Project to CLI

```bash
# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Enter your database password when prompted
```

---

## Migration Files

### Option A: Run Migrations via Supabase Dashboard (Easiest)

1. Go to your Supabase project
2. Click **SQL Editor** in left sidebar
3. Click **New query**
4. Copy/paste contents of each migration file **in order**:
   - `20250101000001_enable_extensions.sql`
   - `20250101000002_create_enums.sql`
   - `20250101000003_create_foundation_tables.sql`
   - `20250101000004_create_core_entity_tables.sql`
   - `20250101000005_create_player_stats_tables.sql`
   - `20250101000006_create_remaining_player_stats.sql`
   - `20250101000007_create_team_stats_tables.sql`
   - `20250101000008_create_game_and_reference_tables.sql`
   - `20250101000009_enable_rls_policies.sql`
   - `20250101000010_create_database_functions.sql`
5. Click **RUN** for each migration
6. Verify no errors (should see "Success. No rows returned")

**Estimated time**: 15-20 minutes

### Option B: Run Migrations via CLI (Faster)

```bash
# From your project root
cd supabase/migrations

# Push all migrations to Supabase
supabase db push

# Or run individually
supabase db execute --file 20250101000001_enable_extensions.sql
supabase db execute --file 20250101000002_create_enums.sql
# ... etc
```

**Estimated time**: 5 minutes

### Verify Schema Created

```sql
-- In SQL Editor, run this to check tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should return 41 tables
```

---

## Auto-Generated API

Supabase **automatically creates a REST API** from your database schema!

### Example API Calls

#### Get All Teams

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project-id.supabase.co',
  'your-anon-key'
)

// Get all teams
const { data, error } = await supabase
  .from('teams')
  .select('*')

// Returns:
// [
//   { team_id: 'KC', team_name: 'Kansas City Chiefs', conference: 'AFC', ... },
//   { team_id: 'SF', team_name: 'San Francisco 49ers', conference: 'NFC', ... },
//   ...
// ]
```

#### Get Player Season Stats

```javascript
// Get Tom Brady's 2007 season stats
const { data, error } = await supabase
  .from('player_season_stats')
  .select(`
    *,
    players (full_name, primary_position),
    teams (team_name, team_abbr)
  `)
  .eq('player_id', 'brady-tom')
  .eq('season', 2007)
  .single()

// Returns:
// {
//   player_id: 'brady-tom',
//   season: 2007,
//   passing_yards: 4806,
//   passing_touchdowns: 50,
//   players: { full_name: 'Tom Brady', primary_position: 'QB' },
//   teams: { team_name: 'New England Patriots', team_abbr: 'NE' }
// }
```

#### Get Season Leaderboard (Custom Function)

```javascript
// Use our custom database function
const { data, error } = await supabase
  .rpc('get_season_leaderboard', {
    p_season: 2024,
    p_stat_category: 'passing_yards',
    p_position: 'QB',
    p_limit: 10
  })

// Returns top 10 QBs by passing yards in 2024
```

#### Real-time Subscriptions (Live Games!)

```javascript
// Subscribe to live game updates
const channel = supabase
  .channel('game-updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'games',
      filter: 'status=eq.in_progress'
    },
    (payload) => {
      console.log('Game updated:', payload.new)
      // Update UI with new scores
    }
  )
  .subscribe()
```

### API Features

- ✅ **Automatic CRUD**: All tables have SELECT/INSERT/UPDATE/DELETE
- ✅ **Filtering**: `.eq()`, `.neq()`, `.gt()`, `.lt()`, `.like()`, etc.
- ✅ **Sorting**: `.order('column', { ascending: false })`
- ✅ **Pagination**: `.range(0, 9)` or `.limit(10)`
- ✅ **Joins**: Automatic via foreign keys (use `.select('*, foreign_table(*)')`)
- ✅ **Full-text search**: `.textSearch('column', 'query')`
- ✅ **Real-time**: Subscribe to INSERT/UPDATE/DELETE events

### PostgREST Query Examples

Supabase uses PostgREST under the hood. You can also use direct HTTP:

```bash
# Get all teams
curl 'https://your-project-id.supabase.co/rest/v1/teams?select=*' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"

# Get player stats for 2024 season
curl 'https://your-project-id.supabase.co/rest/v1/player_season_stats?season=eq.2024&select=*' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"

# Get leaderboard (custom function)
curl 'https://your-project-id.supabase.co/rest/v1/rpc/get_season_leaderboard' \
  -X POST \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"p_season":2024,"p_stat_category":"passing_yards","p_limit":10}'
```

---

## Database Functions

We've created **8 custom database functions** for complex queries:

### 1. `get_player_career_summary(player_id)`

Get comprehensive career stats for a player.

```javascript
const { data } = await supabase.rpc('get_player_career_summary', {
  p_player_id: 'brady-tom'
})

// Returns: { player_id, full_name, position, seasons, games, passing: {...}, rushing: {...}, receiving: {...} }
```

### 2. `get_season_leaderboard(season, stat_category, position, limit)`

Get leaderboard for any stat category.

```javascript
const { data } = await supabase.rpc('get_season_leaderboard', {
  p_season: 2024,
  p_stat_category: 'rushing_yards',
  p_position: 'RB',
  p_limit: 20
})

// Returns: [{ rank, player_id, player_name, team_id, stat_value }, ...]
```

### 3. `get_team_season_record(team_id, season)`

Get complete team record for a season.

```javascript
const { data } = await supabase.rpc('get_team_season_record', {
  p_team_id: 'KC',
  p_season: 2024
})

// Returns: { wins, losses, ties, points_for, points_against, playoff_result, ... }
```

### 4. `get_upcoming_games(limit)`

Get upcoming scheduled games.

```javascript
const { data } = await supabase.rpc('get_upcoming_games', {
  p_limit: 10
})

// Returns: [{ game_id, game_date, home_team, away_team, week, season }, ...]
```

### 5. `search_players(search_term, limit)`

Fuzzy search for players by name.

```javascript
const { data } = await supabase.rpc('search_players', {
  p_search_term: 'mahomes',
  p_limit: 10
})

// Returns: [{ player_id, full_name, position, current_team, status }, ...]
```

### 6. `get_player_stats_by_season(player_id, season)`

Get all stats for a player in a specific season.

```javascript
const { data } = await supabase.rpc('get_player_stats_by_season', {
  p_player_id: 'mahomes-patrick',
  p_season: 2023
})

// Returns: { passing: {...}, rushing: {...}, receiving: {...}, defense: {...} }
```

### 7. `get_game_summary(game_id)`

Get complete game summary with teams and venue.

```javascript
const { data } = await supabase.rpc('get_game_summary', {
  p_game_id: '2024_01_KC_BUF'
})

// Returns: { game_id, home_team: {...}, away_team: {...}, stadium: {...}, attendance, ... }
```

### 8. `soft_delete(table_name, id_column, id_value)`

Soft delete a record (sets `deleted_at` timestamp).

```javascript
// Via service_role only (backend)
const { data } = await supabase.rpc('soft_delete', {
  p_table_name: 'players',
  p_id_column: 'player_id',
  p_id_value: 'some-player-id'
})
```

---

## Row Level Security

**RLS Policies Summary:**

- ✅ **Public Read Access**: Anyone can SELECT from all tables (excluding soft-deleted records)
- ✅ **Service Role Write**: Only `service_role` key can INSERT/UPDATE/DELETE
- ✅ **Soft Delete**: Records marked `deleted_at != NULL` are hidden from queries

### Read Access (Frontend - Safe)

```javascript
// Using anon key - read-only access
const supabase = createClient(url, anonKey)

// ✅ Can read all data
const { data } = await supabase.from('players').select('*')

// ❌ Cannot write (RLS blocks it)
const { error } = await supabase.from('players').insert({ ... })
// Error: new row violates row-level security policy
```

### Write Access (Backend - Restricted)

```javascript
// Using service_role key - full access
const supabase = createClient(url, serviceRoleKey)

// ✅ Can read
const { data } = await supabase.from('players').select('*')

// ✅ Can write
const { data, error } = await supabase.from('players').insert({
  player_id: 'new-player',
  first_name: 'John',
  last_name: 'Doe',
  primary_position: 'QB'
})
```

### Customizing RLS Policies

If you need more granular access control (e.g., authenticated users can update their favorites):

```sql
-- Example: Allow authenticated users to insert into a "favorites" table
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Data Ingestion

### Step 1: Prepare Data Sources

You have 5 free data sources documented:

1. **nflreadpy** - Historical stats (1970-2024)
2. **sportsref_nfl** - Pro Football Reference scraper
3. **nflscrapy** - Advanced analytics (EPA, DVOA)
4. **NFL Next Gen Stats** - Tracking data (2016+)
5. **Manual curation** - Awards, milestones

### Step 2: Create Ingestion Scripts

#### Example: Load Teams Data

```javascript
// scripts/load_teams.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service_role for writes!
)

const teams = [
  {
    team_id: 'KC',
    team_name: 'Kansas City Chiefs',
    team_abbr: 'KC',
    city: 'Kansas City',
    conference: 'AFC',
    division: 'West',
    founded_year: 1960,
    stadium_id: 'arrowhead',
    is_active: true
  },
  // ... 31 more teams
]

async function loadTeams() {
  const { data, error } = await supabase
    .from('teams')
    .insert(teams)

  if (error) {
    console.error('Error loading teams:', error)
  } else {
    console.log(`✅ Loaded ${data.length} teams`)
  }
}

loadTeams()
```

#### Example: Load Player Stats from nflreadpy

```python
# scripts/load_player_stats.py
import nfl_data_py as nfl
from supabase import create_client
import os

# Initialize Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# Fetch player stats for 2024
stats = nfl.import_seasonal_data([2024])

# Transform to match our schema
records = []
for _, row in stats.iterrows():
    records.append({
        'player_id': row['player_id'],
        'season': 2024,
        'team_id': row['recent_team'],
        'primary_position': row['position'],
        'games_played': row['games'],
        'passing_attempts': row.get('attempts', 0),
        'passing_completions': row.get('completions', 0),
        'passing_yards': row.get('passing_yards', 0),
        'passing_touchdowns': row.get('passing_tds', 0),
        # ... map all fields
    })

# Bulk insert (Supabase supports up to 10,000 rows per request)
batch_size = 1000
for i in range(0, len(records), batch_size):
    batch = records[i:i+batch_size]
    result = supabase.table('player_season_stats').insert(batch).execute()
    print(f"✅ Inserted batch {i//batch_size + 1}: {len(batch)} records")
```

### Step 3: Scheduled Updates (Production)

Use **Supabase Edge Functions** for scheduled data updates:

```typescript
// supabase/functions/update-stats/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Fetch latest stats from external API
  const response = await fetch('https://api.nfl.com/stats/...')
  const stats = await response.json()

  // Update database
  const { data, error } = await supabase
    .from('player_game_stats')
    .upsert(stats, { onConflict: 'player_id,game_id' })

  return new Response(JSON.stringify({ updated: data?.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

Deploy with:

```bash
supabase functions deploy update-stats

# Schedule to run every hour during game days
# (Configure via Supabase Dashboard → Edge Functions → Cron)
```

---

## Cost Estimates

### Supabase Pricing

| Plan | Database Size | Bandwidth | Cost/Month |
|------|---------------|-----------|------------|
| **Free** | 500 MB | 5 GB | $0 |
| **Pro** | 8 GB | 100 GB | $25 |
| **Team** | 100 GB | 250 GB | $599 |
| **Enterprise** | Custom | Custom | Custom |

### Estimated Costs for NFL Stats Platform

| Stage | Database Size | Traffic | Plan | Cost |
|-------|---------------|---------|------|------|
| **Development** | <500 MB | Minimal | Free | $0 |
| **MVP Launch** | ~2-5 GB | <10K users | Pro | $25/month |
| **Growth** | ~10-15 GB | 10K-50K users | Pro + Add-ons | $50-100/month |
| **Scale** | ~20-50 GB | 50K-100K users | Team | $599/month |

**Initial Recommendation**: Start with **Pro plan ($25/month)**

### Cost Comparison

| Service | Monthly Cost | Database | Features |
|---------|--------------|----------|----------|
| **Supabase Pro** | $25 | 8 GB | DB + Auth + Storage + Real-time + API |
| **AWS RDS** | $115-170 | 8 GB | DB only (need separate Auth, API, etc.) |
| **Savings** | **$90-145/month** | - | - |

---

## Performance Optimization

### 1. Partitioning (Already Implemented)

We've partitioned 4 large tables:
- `player_season_stats` (by decade)
- `player_game_stats` (by season)
- `play_by_play` (by season)
- `games` (by season)

**Benefit**: 40-80% speedup for queries filtering by season

### 2. Indexes (Already Implemented)

~150 indexes created for:
- Primary keys (automatic)
- Foreign keys (join performance)
- Common filters (season, player_id, team_id)
- Sorting columns (leaderboards)

**Benefit**: 10-100x speedup for filtered queries

### 3. Materialized Views (Optional)

Create materialized views for expensive aggregations:

```sql
-- Example: Pre-compute career totals
CREATE MATERIALIZED VIEW mv_player_career_totals AS
SELECT
    player_id,
    SUM(passing_yards) AS career_passing_yards,
    SUM(rushing_yards) AS career_rushing_yards,
    SUM(receiving_yards) AS career_receiving_yards
FROM player_season_stats
GROUP BY player_id;

-- Create index for fast lookups
CREATE UNIQUE INDEX idx_mv_career_player ON mv_player_career_totals(player_id);

-- Refresh daily
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_player_career_totals;
```

**Benefit**: 50-100x speedup for career stat queries

### 4. Connection Pooling

Supabase includes **pgBouncer** by default (connection pooling enabled).

Use the **pooler connection string** for serverless/edge functions:

```javascript
// Use pooler for serverless functions
const supabase = createClient(
  'https://your-project-id.supabase.co',
  'your-key',
  {
    db: {
      schema: 'public',
      pooler: true // Use connection pooler
    }
  }
)
```

### 5. Caching Strategy

**Application-level caching** (recommended):

```javascript
// Example using React Query
import { useQuery } from '@tanstack/react-query'

function usePlayerStats(playerId, season) {
  return useQuery({
    queryKey: ['player-stats', playerId, season],
    queryFn: async () => {
      const { data } = await supabase
        .from('player_season_stats')
        .select('*')
        .eq('player_id', playerId)
        .eq('season', season)
        .single()
      return data
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  })
}
```

**CDN caching** for static data:

```javascript
// Use Vercel/Cloudflare edge caching
export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  const { data } = await supabase.from('teams').select('*')

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  })
}
```

---

## Next Steps

### Immediate (This Week)

1. ✅ Create Supabase project
2. ✅ Run all migration files
3. ✅ Verify schema created (41 tables)
4. ✅ Test API with a few sample queries
5. ✅ Load initial test data (teams, stadiums, positions)

### Short-term (Next 2-4 Weeks)

1. **Data Ingestion**:
   - Write scripts to load historical data (1970-2024)
   - Start with nflreadpy for player/team stats
   - Add sportsref scraper for defensive stats
   - Estimated time: 40-60 hours initial load

2. **API Testing**:
   - Test all custom database functions
   - Verify leaderboard queries perform well
   - Test real-time subscriptions

3. **Frontend Development**:
   - Set up Next.js project
   - Connect to Supabase
   - Build initial pages (player stats, team pages)

### Medium-term (1-2 Months)

1. **Production Data Load**:
   - Load complete 54-year dataset
   - Verify data quality
   - Optimize queries based on usage patterns

2. **Advanced Features**:
   - Implement search (fuzzy player/team search)
   - Build leaderboards (season, career, active)
   - Add game details pages (live, scheduled, completed)

3. **Performance Optimization**:
   - Add materialized views if needed
   - Implement caching strategy
   - Monitor query performance

### Long-term (3+ Months)

1. **Scale**:
   - Upgrade Supabase plan if needed
   - Add CDN caching
   - Implement edge functions for real-time updates

2. **Features**:
   - Player comparisons
   - Advanced analytics
   - Mobile app (using same Supabase backend)

---

## Resources

### Supabase Documentation
- [Official Docs](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgREST API](https://postgrest.org/en/stable/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### NFL Data Sources
- [nflreadpy](https://github.com/cooperdff/nfl_data_py)
- [nflscrapy](https://github.com/BurntSushi/nflscrapy)
- [NFL Next Gen Stats](https://nextgenstats.nfl.com/)

### Community
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

---

## Summary

You now have:

✅ **Complete database schema** (41 tables, 850 columns)
✅ **Migration files** ready to run on Supabase
✅ **Auto-generated REST API** for all tables
✅ **8 custom database functions** for complex queries
✅ **Row Level Security** policies (public read, service write)
✅ **Real-time subscriptions** ready for live games
✅ **Cost savings** of $90-145/month vs AWS RDS
✅ **Implementation guide** with code examples

**Total setup time**: 1-2 hours to get database + API running

**Next step**: Create Supabase project and run migrations!
