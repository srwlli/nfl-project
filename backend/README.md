# FastAPI NFL Betting Backend

Production-ready REST API for NFL betting data, built with FastAPI + Supabase PostgreSQL + Redis.

## ✅ What's Generated

**Core Files:**
- ✅ `app.py` - FastAPI main application with health check
- ✅ `core/config.py` - Pydantic Settings for environment management
- ✅ `services/readers.py` - Supabase PostgreSQL data access layer (all 12 read methods)
- ✅ `services/cache.py` - Redis caching layer with TTL management

**Infrastructure:**
- ✅ `requirements.txt` - All dependencies
- ✅ `.env.example` - Environment template
- ✅ `Dockerfile` - Container image
- ✅ `docker-compose.yml` - Local dev environment (FastAPI + Redis)
- ✅ `migrations/001_create_schema.sql` - Database schema (9 tables)

**Documentation:**
- ✅ `SETUP.md` - Complete setup guide
- ✅ `README.md` - This file

---

## ⬜ What's Still Needed

### 1. Generate 15 API Endpoint Modules

**Location:** `api/` directory

These modules need to be created (templates provided in SETUP.md):

```
api/
├── schedules.py      # GET /v1/schedules
├── games.py          # GET /v1/games/{game_id}
├── scoreboard.py     # GET /v1/scoreboard
├── teams.py          # GET /v1/teams, /v1/teams/{team}/stats
├── pbp.py            # GET /v1/pbp
├── players.py        # GET /v1/players/{player_id}, /v1/player_stats
├── power.py          # GET /v1/power_ratings
├── injuries.py       # GET /v1/injuries
├── depth.py          # GET /v1/depth_charts
├── inventory.py      # GET /v1/data/inventory
└── admin.py          # POST /v1/admin/jobs
```

Each endpoint should:
- Use `data_reader` from `services/readers.py`
- Check `cache_manager` before querying
- Return Pydantic models (create in `models/schemas.py`)
- Include proper error handling

### 2. Create Pydantic Models

**Location:** `models/schemas.py`

Define request/response models:
```python
from pydantic import BaseModel
from typing import Optional, List

class Schedule(BaseModel):
    game_id: str
    season: int
    week: int
    home_team: str
    away_team: str
    # ... etc

class ScheduleResponse(BaseModel):
    data: List[Schedule]
```

### 3. Data Loading (ETL)

**Location:** `services/etl.py`

Create ETL functions to load Parquet files into PostgreSQL:
```python
async def load_schedules()
async def load_teams()
async def load_player_stats()
async def load_pbp()
# ... etc
```

### 4. Endpoint Registration in app.py

Update `app.py` to include routers:
```python
from api import schedules, teams, games, scoreboard, pbp, players, power, injuries, depth, inventory, admin

app.include_router(schedules.router, prefix="/v1", tags=["schedules"])
app.include_router(teams.router, prefix="/v1", tags=["teams"])
# ... etc
```

### 5. Tests

**Location:** `tests/` directory

Create test files for:
- Endpoint tests (verify 200 responses)
- Data reader tests (with fixtures)
- Cache tests

---

## Quick Start

### Local Development

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 2. Create database tables
# Go to Supabase SQL Editor and run: migrations/001_create_schema.sql

# 3. Start API with Docker
docker-compose up

# 4. Verify API is running
curl http://localhost:8000/health

# 5. View Swagger documentation
open http://localhost:8000/docs
```

---

## What's Ready to Use

### Services Layer (Complete)

**`services/readers.py`** - 12 async methods ready to call:

```python
from services.readers import data_reader

# All these methods are ready
await data_reader.read_schedules(season=2025, week=5, team="KC")
await data_reader.read_team_stats(team="KC", season=2025)
await data_reader.read_pbp(game_id="12345", limit=100)
await data_reader.read_teams()
await data_reader.read_power_ratings(season=2025)
await data_reader.read_injuries(season=2025, week=5)
await data_reader.read_depth_charts(team="KC", season=2025)
await data_reader.read_player_stats(season=2025)
await data_reader.read_player(player_id="123")
await data_reader.read_game(game_id="12345")
await data_reader.read_scoreboard(date="2025-10-15")
```

**`services/cache.py`** - Caching ready:

```python
from services.cache import cache_manager, cache_key_schedules

# Automatic caching
cached = await cache_manager.get(key)
await cache_manager.set(key, value, ttl_seconds=60)
```

### Configuration (Complete)

**`core/config.py`** - Settings loaded from `.env`:

```python
from core.config import settings

settings.SUPABASE_URL    # Your Supabase project URL
settings.SUPABASE_KEY    # Your Supabase anon key
settings.REDIS_URL       # Redis connection string
settings.CURRENT_SEASON  # 2025
settings.ALLOWED_ORIGINS # CORS whitelist
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│ Next.js PWA (Vercel)                                     │
│ - Calls REST API endpoints                               │
│ - Uses SWR for client-side caching                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ HTTPS Requests
                     │
┌────────────────────▼─────────────────────────────────────┐
│ FastAPI Backend (Supabase Functions)                     │
│ - 15 REST endpoints (/v1/*)                              │
│ - Request validation (Pydantic)                          │
│ - Response caching (Redis, short TTL)                    │
└────────────────┬──────────────────────────┬──────────────┘
                 │                          │
                 │ SQL Queries              │ Cache Get/Set
                 │                          │
         ┌───────▼──────────┐       ┌──────▼──────────┐
         │ Supabase         │       │ Redis           │
         │ PostgreSQL       │       │ In-memory cache │
         │                  │       │                 │
         │ 9 Tables:        │       │ TTL: 10s-1h     │
         │ - schedules      │       │                 │
         │ - teams          │       │ Caches:         │
         │ - players        │       │ - Schedules     │
         │ - pbp            │       │ - Team stats    │
         │ - stats          │       │ - PBP data      │
         │ - injuries       │       │ - Power ratings │
         │ - depth_charts   │       │                 │
         │ - etc.           │       │                 │
         └──────────────────┘       └─────────────────┘
```

---

## Key Design Decisions

1. **Polars for data ops** - Matches your existing code style
2. **Async/await** - FastAPI async for concurrent requests
3. **Short TTL caching** - 10-60s for real-time updates
4. **Service layer separation** - Data access logic isolated
5. **Environment-based config** - Pydantic Settings for safety

---

## Next Steps

1. **Generate endpoint modules** (11 files to create)
   - Use templates in SETUP.md
   - Each endpoint: read → cache → return

2. **Create Pydantic models** (optional but recommended)
   - Improves type safety and documentation

3. **Load initial data**
   - Run ETL to populate PostgreSQL from parquets

4. **Test locally**
   - `docker-compose up`
   - `curl http://localhost:8000/v1/schedules`

5. **Deploy to Supabase Functions**
   - Copy code to Supabase Functions folder
   - Set environment variables
   - Test live endpoints from Next.js

---

## Command Reference

```bash
# Local development
docker-compose up                 # Start API + Redis
docker-compose down               # Stop containers
docker-compose logs api           # View API logs
docker-compose logs redis         # View Redis logs

# Manual testing
curl http://localhost:8000/health
curl "http://localhost:8000/v1/teams"
curl "http://localhost:8000/v1/schedules?season=2025"

# Python interactive testing
python
>>> from services.readers import data_reader
>>> import asyncio
>>> asyncio.run(data_reader.read_teams())
```

---

## File Structure

```
backend/
├── README.md                    ← You are here
├── SETUP.md                     ← Setup instructions
├── requirements.txt             ✅ Generated
├── .env.example                 ✅ Generated
├── app.py                       ✅ Generated (mostly complete)
├── Dockerfile                   ✅ Generated
├── docker-compose.yml           ✅ Generated
├── core/
│   ├── __init__.py             ✅ Generated
│   └── config.py               ✅ Generated
├── api/
│   ├── __init__.py             ✅ Generated (empty)
│   ├── schedules.py            ⬜ To create
│   ├── teams.py                ⬜ To create
│   ├── games.py                ⬜ To create
│   ├── scoreboard.py           ⬜ To create
│   ├── pbp.py                  ⬜ To create
│   ├── players.py              ⬜ To create
│   ├── power.py                ⬜ To create
│   ├── injuries.py             ⬜ To create
│   ├── depth.py                ⬜ To create
│   ├── inventory.py            ⬜ To create
│   └── admin.py                ⬜ To create
├── services/
│   ├── __init__.py             ✅ Generated
│   ├── readers.py              ✅ Generated (complete)
│   ├── cache.py                ✅ Generated (complete)
│   └── etl.py                  ⬜ To create
├── models/
│   ├── __init__.py             ⬜ To create
│   └── schemas.py              ⬜ To create
├── migrations/
│   └── 001_create_schema.sql   ✅ Generated
└── tests/                       ⬜ To create
    ├── test_endpoints.py
    ├── test_readers.py
    └── fixtures/
```

---

## Status

**Generated:** 60%
**Ready to Use:** Core infrastructure (config, services, database schema)
**Remaining:** Endpoint implementations (15 modules)

---

## Support

See **SETUP.md** for detailed troubleshooting and deployment guides.

