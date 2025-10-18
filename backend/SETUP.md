# FastAPI NFL Backend - Setup Guide

## Overview

This is the backend API for your NFL betting data dashboard. It connects your Supabase PostgreSQL database with your Next.js frontend.

**Architecture:**
```
Next.js (Vercel) ←→ FastAPI (Supabase Functions) ←→ PostgreSQL (Supabase)
                                  ↓
                            Redis (caching)
```

---

## Prerequisites

- Python 3.11+
- Docker & Docker Compose (for local dev)
- Supabase account with PostgreSQL database
- Redis (or use Docker)

---

## Quick Start (Local Development)

### 1. Setup Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
```

### 2. Create Database Tables

Go to **Supabase Dashboard** → **SQL Editor** and run the migration:

```sql
-- Copy contents of migrations/001_create_schema.sql and paste here
```

Or use psql directly:
```bash
psql $DATABASE_URL < migrations/001_create_schema.sql
```

### 3. Start API with Docker Compose

```bash
docker-compose up
```

This will start:
- **FastAPI** on `http://localhost:8000`
- **Redis** on `localhost:6379`
- **Swagger UI** on `http://localhost:8000/docs`

### 4. Verify API is Running

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "ok",
  "version": "0.1.0",
  "environment": "development"
}
```

---

## Project Structure

```
backend/
├── app.py                      # Main FastAPI application
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker image
├── docker-compose.yml          # Local dev environment
├── .env.example               # Environment template
├── core/
│   ├── __init__.py
│   └── config.py              # Pydantic Settings
├── api/                        # Endpoint modules (to be created)
│   ├── __init__.py
│   ├── schedules.py           # GET /v1/schedules
│   ├── teams.py               # GET /v1/teams
│   ├── games.py               # GET /v1/games/{game_id}
│   └── ... (9 more endpoints)
├── services/
│   ├── __init__.py
│   ├── readers.py             # Supabase PostgreSQL queries
│   ├── cache.py               # Redis caching
│   └── etl.py                 # (Data loading script)
├── migrations/
│   └── 001_create_schema.sql  # Database schema
└── tests/                      # (Test files, if added)
```

---

## API Endpoints (15 Total)

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/v1/schedules` | Game schedules |
| GET | `/v1/games/{game_id}` | Game details |
| GET | `/v1/scoreboard` | Live scoreboard |
| GET | `/v1/pbp` | Play-by-play |
| GET | `/v1/teams` | Teams list |
| GET | `/v1/teams/{team}/stats` | Team stats |
| GET | `/v1/teams/{team}/profile` | Team full profile |
| GET | `/v1/players/{player_id}` | Player details |
| GET | `/v1/player_stats` | Player stats |
| GET | `/v1/power_ratings` | Power ratings |
| GET | `/v1/injuries` | Injury reports |
| GET | `/v1/depth_charts` | Depth charts |
| GET | `/v1/data/inventory` | Data metadata |
| POST | `/v1/admin/jobs` | Trigger manual jobs |

---

## Adding Endpoints

### Example: Create Schedules Endpoint

**File:** `api/schedules.py`

```python
from fastapi import APIRouter, Query
from typing import Optional, List
from services.readers import data_reader
from services.cache import cache_manager, cache_key_schedules

router = APIRouter()

@router.get("/schedules")
async def get_schedules(
    season: int = Query(2025, description="NFL season"),
    week: Optional[int] = Query(None, description="Week number"),
    team: Optional[str] = Query(None, description="Team abbreviation"),
):
    """Get NFL game schedules"""

    # Build cache key
    cache_key = cache_key_schedules(season, week, team)

    # Try cache first
    cached = await cache_manager.get(cache_key)
    if cached:
        return cached

    # Query database
    schedules = await data_reader.read_schedules(season, week, team)

    # Cache for 60 seconds
    await cache_manager.set(cache_key, schedules, ttl_seconds=60)

    return schedules
```

**Register in `app.py`:**

```python
from api import schedules
app.include_router(schedules.router, prefix="/v1", tags=["schedules"])
```

---

## Data Loading (ETL)

### Load Data from Parquet Files to PostgreSQL

**File:** `services/etl.py` (create this)

```python
import polars as pl
from services.readers import data_reader
from core.config import settings
from pathlib import Path

async def load_schedules():
    """Load schedules from parquet to PostgreSQL"""

    # Read parquet
    df = pl.read_parquet("../data/raw/schedules_2025.parquet")

    # Normalize columns
    schedules = df.select([
        pl.col('game_id'),
        pl.col('season'),
        pl.col('week'),
        pl.col('gameday'),
        # ... etc
    ])

    # Upsert to database
    data = schedules.to_dicts()
    result = (
        data_reader.supabase
        .table("schedules")
        .upsert(data)
        .execute()
    )

    return result
```

Run with:
```bash
python -c "import asyncio; from services.etl import load_schedules; asyncio.run(load_schedules())"
```

---

## Caching Strategy

### Cache TTLs

| Endpoint | TTL | Reason |
|----------|-----|--------|
| `/schedules` | 60s | Updates during season |
| `/teams` | 300s | Static data |
| `/pbp` | 60s | Expensive query |
| `/scoreboard` | 10s | Real-time updates |
| `/power_ratings` | 3600s | Weekly updates |

### Clear Cache

```python
from services.cache import cache_manager

# Clear specific key
await cache_manager.delete("schedules:2025:None:None")

# Clear pattern
await cache_manager.clear_pattern("schedules:*")
```

---

## Deployment to Supabase Functions

### Option 1: Supabase CLI

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Deploy
supabase functions deploy nfl-api --allow-cors
```

### Option 2: Manual Deployment

1. Copy `app.py` + services/ to Supabase Functions folder
2. Create `requirements.txt` in Functions folder
3. Deploy via Supabase dashboard

---

## Environment Variables for Production

When deploying to Supabase Functions:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
REDIS_URL=redis://your-redis-host:6379  # Or use Upstash Redis
API_KEY=your-secure-admin-key
ALLOWED_ORIGINS=["https://yourfrontend.vercel.app"]
ENVIRONMENT=production
```

---

## Testing API

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Get schedules
curl "http://localhost:8000/v1/schedules?season=2025&week=1"

# Get teams
curl http://localhost:8000/v1/teams
```

### Using Swagger UI

Navigate to `http://localhost:8000/docs` for interactive API documentation.

---

## Troubleshooting

### Redis Connection Error
```
⚠️ Redis connection failed. Caching disabled.
```

**Solution:** Make sure Redis is running:
```bash
docker-compose up redis
```

### Supabase Connection Error
```
❌ Failed to initialize Supabase
```

**Solution:** Check `.env` has correct Supabase credentials:
```bash
echo $SUPABASE_URL
echo $SUPABASE_KEY
```

### Database Connection Error
```
Error reading schedules: ...
```

**Solution:** Verify tables exist in Supabase SQL Editor - run migration SQL.

---

## Next Steps

1. ✅ Environment setup
2. ✅ Database schema created
3. ⬜ Generate endpoint modules (api/*.py)
4. ⬜ Load initial data from parquets
5. ⬜ Test all endpoints
6. ⬜ Deploy to Supabase Functions
7. ⬜ Connect Next.js frontend

---

## References

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Polars Docs](https://pola-rs.github.io/polars/)
- [Redis Docs](https://redis.io/docs/)

