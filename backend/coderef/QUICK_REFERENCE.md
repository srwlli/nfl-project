# Quick Reference Guide - One Page Summary

---

## WHERE THE DATA COMES FROM

```
┌─────────────────────────┐
│   NFL Official Website  │
│   (What really happens) │
└──────────────┬──────────┘
               │
        (nflreadpy downloads)
               ↓
        ┌──────────────┐
        │ GitHub (NFL  │
        │  data files) │
        └──────┬───────┘
               │
      (Your script runs weekly)
               ↓
        ┌──────────────┐
        │  Parquet     │
        │  Files       │
        │  (backed up) │
        └──────┬───────┘
               │
         (Backend ETL loads)
               ↓
        ┌──────────────┐
        │  Supabase    │
        │  Database    │
        │  (live data) │
        └──────┬───────┘
               │
         (API queries)
               ↓
        ┌──────────────┐
        │  Next.js     │
        │  Website     │
        │  (users see) │
        └──────────────┘
```

---

## WHAT DATA WE HAVE

### 11 Types of Data (Drawers in Filing Cabinet)

| # | Name | Records | Updated | Example |
|---|------|---------|---------|---------|
| 1 | Schedules | 272 | Daily | KC vs BUF, Oct 12, -3.5 spread |
| 2 | Play-by-Play | 12,473 | Weekly | "1st & 10, completed pass, 8 yards" |
| 3 | Player Stats | 4,950 | Weekly | "Mahomes: 287 yards, 2 TDs" |
| 4 | Snap Counts | 6,064 | Weekly | "Mahomes: 100% snaps" |
| 5 | Depth Charts | 160,774 | Weekly | "Starter, Backup, 3rd string" |
| 6 | Rosters | 3,076 | Weekly | "Patrick Mahomes, 6'3", Texas Tech" |
| 7 | Teams | 32 | Static | "Kansas City Chiefs, AFC West" |
| 8 | Power Ratings | 32 | Weekly | "KC: ELO 1645, #3 ranked" |
| 9 | Injuries | Updating | Daily | "Player X: Out (knee)" |
| 10 | Advanced Stats | 756 | Weekly | "Time to throw, separation, EPA" |
| 11 | Live Scores | Real-time | During games | Current score, time, quarter |

---

## THE TOOLS & WHAT THEY DO

### 1. PARQUET
**What**: Compressed file format for data
**Uses**: Stores data on your computer as backup
**Example**: `schedules_2025_latest.parquet` (3.4 MB)

### 2. POLARS
**What**: Data processing tool
**Uses**: Transforms messy data into clean data
**Example**: Fixes dates, formats numbers, handles missing values

### 3. SUPABASE
**What**: Cloud database (PostgreSQL)
**Uses**: Stores all data live for the website to query
**Cost**: Free for small projects
**Example**: Your 11 tables with 188K rows live in the cloud

### 4. REDIS
**What**: Super-fast temporary memory
**Uses**: Caches recent queries so website feels faster
**Example**: "User asked for KC schedule 5 seconds ago, still in memory"

### 5. FASTAPI
**What**: Web framework that creates the API
**Uses**: Receives requests from website, queries database, returns data
**Example**: Website asks "Give me schedules" → FastAPI talks to database → Returns JSON

### 6. DOCKER
**What**: Container that packages everything
**Uses**: Makes your code work on any computer
**Example**: "This works on my laptop, in the data center, and on a server"

### 7. NEXT.JS
**What**: Website framework (what users see)
**Uses**: Creates beautiful, fast website
**Example**: User clicks button, website calls API, shows schedule table

---

## HOW IT WORKS (Step by Step)

### Step 1: Data Arrives (Weekly)
```
Monday morning:
  Your script downloads NFL data
  Polars processes it
  Saves to parquet files
```

### Step 2: Data Loads (Manual or Scheduled)
```
Tuesday:
  Backend reads parquet files
  Uploads to Supabase
  Database now has latest data
```

### Step 3: User Visits Website (Any time)
```
User: Opens website
Website: Loads Next.js code
Website: Calls API: "Get schedule for week 6"
  ↓
API: Checks cache (is it already loaded?)
  ✗ Not in cache
API: Query database for schedules
  ↓
Database: Returns 272 games
  ↓
API: Stores in cache (for next user)
API: Returns to website
  ↓
Website: Displays beautiful table
User: "Wow, nice schedule!"

Next user asks same thing:
Website: "Get schedule for week 6"
  ↓
API: Check cache (is it already loaded?)
  ✓ In cache! Instant!
API: Return immediately
User 2: Gets answer faster!
```

---

## THE FILES WE USE

### Backend Directory Structure
```
backend/
├── app.py                    ← Main application
├── requirements.txt          ← List of tools needed
├── Dockerfile                ← How to package
├── docker-compose.yml        ← Local development
│
├── api/                      ← API endpoints
│   ├── schedules.py         ← GET /v1/schedules
│   ├── teams.py             ← GET /v1/teams
│   ├── games.py             ← GET /v1/games
│   ├── pbp.py               ← GET /v1/pbp
│   ├── players.py           ← GET /v1/players
│   ├── power.py             ← GET /v1/power-ratings
│   ├── injuries.py          ← GET /v1/injuries
│   ├── depth.py             ← GET /v1/depth_charts
│   ├── scoreboard.py        ← GET /v1/scoreboard
│   ├── admin.py             ← POST /v1/admin/jobs
│   └── inventory.py         ← GET /v1/data/inventory
│
├── services/                 ← Business logic
│   ├── readers.py           ← Database queries
│   ├── cache.py             ← Redis caching
│   └── etl.py               ← Load data pipeline
│
├── core/
│   └── config.py            ← Settings
│
└── migrations/
    └── 001_create_schema.sql ← Database setup
```

---

## THE 11 API ENDPOINTS

| Method | URL | What It Does | Example |
|--------|-----|------|---------|
| GET | `/v1/schedules` | Get games | `/v1/schedules?season=2025&week=6` |
| GET | `/v1/teams` | Get all 32 teams | `/v1/teams` |
| GET | `/v1/games/{game_id}` | Get single game details | `/v1/games/202510050` |
| GET | `/v1/pbp` | Get play-by-play | `/v1/pbp?game_id=202510050` |
| GET | `/v1/players/{player_id}/stats` | Player performance | `/v1/players/123/stats?season=2025` |
| GET | `/v1/power-ratings` | Team strength | `/v1/power-ratings?season=2025` |
| GET | `/v1/injuries` | Injury reports | `/v1/injuries?season=2025&week=6` |
| GET | `/v1/depth_charts` | Starters/backups | `/v1/depth_charts?team=KC` |
| GET | `/v1/scoreboard` | Live scores | `/v1/scoreboard?date=2025-10-12` |
| POST | `/v1/admin/jobs` | Trigger data refresh | `{"action": "refresh_schedules"}` |
| GET | `/v1/data/inventory` | What data exists | `/v1/data/inventory` |

---

## OUR 2025-ONLY PROTECTION

### Three Layers of Defense

```
Layer 1: ETL (Loading)
  if season != 2025:
      return ERROR

Layer 2: API (Website Requests)
  if season != 2025:
      return ERROR

Layer 3: Data Files
  Only 2025 files used
  2024 files ignored

Result: IMPOSSIBLE to load 2024 data
```

---

## COSTS

| Tool | Cost | Why |
|------|------|-----|
| Supabase | Free - $5/mo | 500MB free, then pay |
| Redis | Free - $7/mo | Local free, cloud $7 |
| Vercel | Free | Next.js hosting |
| GitHub | Free | Code storage |
| Docker | Free | Container tool |
| **Total** | **~$12/mo** | Or completely free |

---

## YOU NOW UNDERSTAND

✅ Where data comes from (NFL → nflreadpy → parquet → database → website)
✅ What each tool does (Parquet, Polars, Supabase, Redis, FastAPI, Docker, Next.js)
✅ How data flows through the system
✅ The 11 types of data we track
✅ How the API works
✅ How users see the data
✅ Why we can't accidentally load 2024 data

---

## NEXT STEP: Deploy to Supabase

You have everything ready:
1. ✅ Code written (26 files)
2. ✅ 2024 data blocked (3 layers)
3. ✅ 2025 data validated (all parquet files confirmed)
4. ✅ Documentation complete (this guide!)

**What's left**:
- Create Supabase account
- Create PostgreSQL database
- Run migrations to create tables
- Run ETL to load data
- Deploy backend to server
- Deploy Next.js to Vercel

**You're 80% done!**

---

## Important Files to Read

1. **BEGINNER_EXPLAINED.md** - Start here first
2. **DATA_TOOLS_EXPLAINED.md** - More detailed
3. **2025_MIGRATION_LOG.md** - What we changed
4. **TEST_RESULTS_FINAL.md** - Validation results

---

## Questions?

- **"How do I deploy?"** → See SETUP.md in backend
- **"How do I add new data?"** → Add parquet file + ETL function + API endpoint
- **"Why is it slow?"** → Check Redis cache status
- **"Can I see the code?"** → Yes, all 26 files in backend/
- **"Is this secure?"** → Yes, 2024 data is impossible to load

---

**You're ready! Let's deploy to Supabase next.**
