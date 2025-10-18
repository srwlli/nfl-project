# Complete Guide: NFL Data, Tools & Architecture Explained

**Audience**: Complete beginners to data engineering
**Goal**: Understand what data we're using, where it comes from, and how everything works

---

## Part 1: THE DATA - What Are We Working With?

### What is "NFL Betting Data"?

Think of it like a massive spreadsheet of information about NFL football games. Instead of one spreadsheet, we have **11 different types of spreadsheets**:

1. **Game Schedules** (272 rows for 2025)
   - Which teams play each other
   - What date/time the game is
   - Where it's being played (stadium)
   - Weather (temperature, wind)
   - What people are betting on (spread, total points, moneyline)

2. **Play-by-Play** (12,473 rows)
   - Every single play that happens in games
   - What down is it? How many yards to go?
   - Did they throw it or run it?
   - How many yards gained?
   - Did someone get injured? Was there a penalty?
   - Advanced metrics: EPA (Expected Points Added), Win Probability

3. **Player Statistics** (4,950 rows)
   - Individual player performance
   - How many passing yards did this QB throw?
   - How many rushing yards did this RB get?
   - How many receptions did this WR have?
   - Fantasy points earned

4. **Snap Counts** (6,064 rows)
   - What percentage of plays was this player on the field?
   - Offensive snaps, defensive snaps, special teams snaps
   - Shows who's important vs. backup players

5. **Depth Charts** (160,774 rows)
   - Starter/backup rankings by position
   - Example: QB depth chart shows starter, backup, 3rd string

6. **Rosters** (3,076 rows)
   - Player names, heights, weights
   - Which college they went to
   - Draft information (what round, what pick)

7. **Team Metadata** (32 rows)
   - The 32 NFL teams
   - Team names, locations, logos
   - Conference and division info

8. **Power Ratings** (32 rows)
   - How strong is each team?
   - ELO rating (chess-style rating system)
   - EPA per play (efficiency metric)
   - Win percentage against the spread

9. **Injuries** (updating weekly)
   - Which players are injured?
   - Are they Out, Doubtful, or Questionable?
   - When are they expected to return?

10. **Next Gen Stats** (756 rows)
    - Advanced tracking data (motion-capture level detail)
    - Time to throw for QBs
    - Air yards, separation distances
    - Yards gained over expected value

11. **Live Scoreboard** (updates during games)
    - Real-time scores as games are happening
    - Current quarter, time remaining
    - Current odds

### How Much Data?
- **188,429 total rows** across all 11 spreadsheets
- **5.8 MB** of data (very small - fits on a USB drive)
- **Updated**: October 6, 2025 (6 games through)
- **Coverage**: Just 2025 season (going back to 2019-2024 available separately)

---

## Part 2: WHERE DOES THE DATA COME FROM?

### The Sources

**Primary Source: nflreadpy** (Python library)
- Reads from NFL's official nflverse (GitHub)
- Combines data from:
  - NFL's official statistics
  - NFL's official play-by-play records
  - NFL's official roster/injury data
  - Next Gen Stats (official tracking data)

**Secondary Sources**:
- **ESPN API**: Live scores during games
- **Pro Football Reference**: Alternative depth charts
- **Your Own Code**: We've written scripts that call these libraries and save the data

### How Data Gets to You

```
NFL Official Data
        ↓
nflreadpy Library (Python)
        ↓
Scripts Run Weekly (our code)
        ↓
Parquet Files Created (storage)
        ↓
Backend Loads to Database
        ↓
API Serves to Next.js Frontend
        ↓
User Sees on Web Browser
```

### Who Updates the Data?

Currently: **You do** (manually or via scheduled script)
- Your script runs weekly and downloads latest data
- Creates new parquet files
- Backend loads them into database

Future: **Automated**
- Cron job (scheduler) runs weekly automatically
- Fetches latest data
- Updates database
- No manual work needed

---

## Part 3: THE TOOLS - How Everything Works

### Understanding the Technology Stack

```
┌─────────────────────────────────────────────────────┐
│                    Frontend Layer                    │
│         Next.js (React) Web Application              │
│        Running in User's Browser                     │
└────────────────────┬────────────────────────────────┘
                     ↓
              ┌──────────────┐
              │  REST API    │
              │  (HTTP)      │
              │  Port 8000   │
              └──────────────┘
                     ↓
┌─────────────────────────────────────────────────────┐
│                 Backend Layer (FastAPI)              │
│         Your Python Code (app.py)                   │
│    Receives requests, processes, sends responses    │
└────────────────────┬────────────────────────────────┘
                     ↓
        ┌────────────────────────┐
        │   Business Logic       │
        │  (api/*.py files)      │
        │  Validates & filters   │
        │  Applies caching       │
        └────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│              Data Storage Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Supabase    │  │    Redis     │  │  Parquet   │ │
│  │ PostgreSQL   │  │    Cache     │  │   Files    │ │
│  │  Database    │  │  (Fast!)     │  │  (Backup)  │ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## Part 4: EXPLAINING EACH TOOL

### 1. PARQUET FILES - The Storage Format

**What is it?**
A file format for storing data tables (like Excel spreadsheets saved as files)

**Why Parquet instead of Excel?**
- **Excel**: Human-readable but slow, large file sizes
- **Parquet**: Computer-optimized, fast to read, smaller files
- Analogy: Like comparing a handwritten letter to a barcode

**What we store**:
```
schedules_2025_latest.parquet
├── game_id (unique identifier)
├── season (2025)
├── week (1-18)
├── home_team (KC, BUF, etc.)
├── away_team
├── spread_line (-3.5, +7.0, etc.)
├── total_line (42.5, 48.0, etc.)
├── home_moneyline (-120, +150, etc.)
└── ... 40+ more columns
```

**Why we use it**:
- Smallest file size (3.4 MB for 12,473 plays)
- Fastest to read
- Maintains data types (knows that season is always a number)

---

### 2. POLARS - The Data Processing Library

**What is it?**
A Python tool that lets you work with data tables (similar to Pandas but faster)

**What we do with it**:
```python
import polars as pl

# Read a parquet file into memory
df = pl.read_parquet('schedules_2025_latest.parquet')

# Filter for just KC Chiefs games
kc_games = df.filter(pl.col("home_team") == "KC")

# Select specific columns
subset = df.select(["game_id", "week", "home_team", "spread_line"])

# Convert to dictionary for database
data = df.to_dicts()  # Now it's like a list of dictionaries
```

**Why we use it**:
- Fast (optimized for large datasets)
- Simple syntax
- Handles data type conversions
- Perfect for transforming data before storing

---

### 3. SUPABASE - The Database Backend

**What is it?**
A hosted database service (PostgreSQL in the cloud) + authentication + realtime features

**Think of it like**:
- Google Drive for databases
- You don't maintain servers, they do

**What PostgreSQL is**:
A relational database (like Excel but more powerful)
- Tables with rows and columns
- Can create relationships between tables
- Can query very fast with SQL

**Our Schema** (table structure):
```
schedules table:
├── game_id (primary key - unique identifier)
├── season (2025)
├── week (1-18)
├── home_team (FK = foreign key linking to teams table)
├── away_team (FK)
├── spread_line
└── ...

teams table:
├── team (primary key - e.g., "KC")
├── full_name ("Kansas City Chiefs")
├── location ("Kansas City")
└── ...

play_by_play table:
├── play_id (primary key)
├── game_id (FK linking to schedules)
├── season
├── down
├── yards_gained
├── epa
└── ...
```

**Why we use it**:
- Reliable (your data is always there)
- Fast queries
- Can scale to millions of rows
- SQL language is powerful
- Integrates with Vercel (where Next.js is hosted)

---

### 4. REDIS - The Cache Layer

**What is it?**
Super-fast temporary storage in computer memory

**Why caching?**
- Database queries take time
- Same query asked 100 times = 100 waits
- Cache stores the answer: next 100 times = instant

**How it works**:
```python
# User 1 asks: GET /v1/schedules?season=2025&week=10
# Backend checks Redis cache
# Not there, so query database
# Get results
# Store in Redis with 60-second expiration
# Return to user

# User 2 asks: GET /v1/schedules?season=2025&week=10
# Backend checks Redis cache
# FOUND! Return instantly
# Don't bother database
```

**Why we use it**:
- API feels faster to users
- Reduces database load
- Cheap to run (uses RAM instead of slow queries)
- Can set expiration times (data auto-deletes after X seconds)

---

### 5. FastAPI - The Web Framework

**What is it?**
Python library that creates REST APIs (web services)

**What's an API?**
"Application Programming Interface" = how programs talk to each other

**How it works**:
```python
# File: api/schedules.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/schedules")  # When GET /v1/schedules is called
async def get_schedules(season: int = 2025):
    # Validate season
    if season != 2025:
        return {"error": "Only 2025 available"}

    # Check cache
    cached = await cache.get(cache_key)
    if cached:
        return cached  # Fast!

    # Query database
    result = await database.query(season)

    # Store in cache
    await cache.set(cache_key, result)

    # Return to frontend
    return result
```

**What happens when user requests**:
```
Browser: GET http://api.example.com/v1/schedules?season=2025

FastAPI receives request:
  ↓
Run the function get_schedules()
  ↓
Function runs validation
Function checks cache
Function queries database
Function returns JSON
  ↓
Browser receives:
{
  "game_id": "202510050",
  "week": 6,
  "home_team": "KC",
  "away_team": "BUF",
  "spread_line": -3.5,
  ...
}
```

**Why we use it**:
- Simple to write
- Automatically generates documentation (/docs)
- Handles authentication
- Async (fast, can handle multiple requests simultaneously)

---

### 6. DOCKER - The Container/Packaging Tool

**What is it?**
A way to package your application with ALL dependencies in a box

**Why containers?**
```
Without Docker:
My computer: "pip install polars redis fastapi"
  Works perfectly!

Your computer: "pip install polars redis fastapi"
  Error: Version conflicts!
  Different Python version!
  Different operating system!

Docker:
My computer: Create a box with everything inside
Your computer: Run the box, it works exactly the same!
```

**How we use it**:
```dockerfile
FROM python:3.13
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0"]
```

**Why we use it**:
- Consistent development (my computer = your computer = server)
- Easy deployment
- Your Next.js frontend also uses Docker

---

### 7. NEXT.JS - The Frontend Framework

**What is it?**
React (JavaScript library) + Server-side features + file-based routing

**What it does**:
- Creates the web interface users see
- Calls FastAPI backend for data
- Renders HTML/CSS/JavaScript in browser
- Hosted on Vercel

**Flow**:
```
User visits: https://example.com/games
  ↓
Next.js loads page component
  ↓
Component calls API: GET /v1/schedules
  ↓
FastAPI returns JSON data
  ↓
Component renders HTML with data
  ↓
User sees interactive table/charts
```

---

## Part 5: HOW IT ALL WORKS TOGETHER

### The Complete Flow (Week-by-Week)

**Monday**: Automated Task Runs
```
1. Python script (your scraper) wakes up
2. Calls nflreadpy library
3. Downloads latest NFL data
4. Processes with Polars
5. Saves as 2025 parquet files
```

**Tuesday**: Data Loads to Database
```
1. You manually run ETL (or it's scheduled)
2. Backend reads parquet files with Polars
3. Transforms data to match schema
4. Inserts into Supabase PostgreSQL
5. 188,429 rows now in database
```

**Wednesday-Sunday**: Users Access Data
```
1. Browser opens: https://app.example.com
2. Next.js loads frontend
3. User clicks "Schedule" button
4. Frontend calls: GET /v1/schedules?season=2025&week=6
5. FastAPI receives request
6. Checks Redis cache (miss)
7. Queries Supabase database
8. Gets 272 games
9. Stores in Redis cache (60 second TTL)
10. Returns JSON to frontend
11. Frontend displays games
12. User sees beautiful table with teams, dates, odds
```

**Next time same user asks (within 60 seconds)**:
```
1. User clicks "Refresh Schedule"
2. Frontend calls: GET /v1/schedules?season=2025&week=6
3. FastAPI receives request
4. Checks Redis cache (HIT!)
5. Returns cached result instantly
6. No database query needed
```

---

## Part 6: THE DATA FLOW DIAGRAM

```
┌─────────────────────┐
│   NFL Official      │
│   Data (GitHub)     │
└────────────┬────────┘
             │
             ↓
┌─────────────────────────────┐
│  Your Python Scripts        │
│  - nflreadpy import         │
│  - downloads weekly data    │
│  - processes with Polars    │
└────────────┬────────────────┘
             │
             ↓
    ┌─────────────────────┐
    │ Parquet Files       │
    │ (storage backup)    │
    │                     │
    │ schedules_2025.par  │
    │ pbp_2025.parquet    │
    │ player_stats_2025   │
    │ ... etc             │
    └────────┬────────────┘
             │
             ↓ (ETL loads data)
    ┌─────────────────────┐
    │ Supabase PostgreSQL │
    │ (live database)     │
    │                     │
    │ schedules table     │
    │ play_by_play table  │
    │ players table       │
    │ ... etc             │
    └─────────┬───────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ↓                    ↓
┌──────────────┐  ┌─────────────┐
│   Redis      │  │  FastAPI    │
│   Cache      │  │  Backend    │
│              │  │             │
│ Stores fast  │  │ Processes   │
│ temp data    │  │ requests    │
└──────────────┘  └──────┬──────┘
                         │
                         ↓
              ┌──────────────────┐
              │  Next.js App     │
              │  (Frontend)      │
              │  React Components│
              └──────────┬───────┘
                         │
                         ↓
              ┌──────────────────┐
              │   Browser        │
              │   (User sees     │
              │    beautiful UI) │
              └──────────────────┘
```

---

## Part 7: WHAT WE ACTUALLY DID IN THIS PROJECT

### Files You Should Understand

**Backend Entry Point**:
```
backend/app.py
├── Imports all 11 API routers
├── Sets up FastAPI application
├── Configures CORS (who can access)
└── Defines health check endpoint
```

**The 11 API Endpoints**:
```
backend/api/schedules.py     → GET /v1/schedules
backend/api/teams.py          → GET /v1/teams
backend/api/games.py          → GET /v1/games
backend/api/pbp.py            → GET /v1/pbp
backend/api/players.py        → GET /v1/players
backend/api/power.py          → GET /v1/power-ratings
backend/api/injuries.py       → GET /v1/injuries
backend/api/depth.py          → GET /v1/depth_charts
backend/api/scoreboard.py     → GET /v1/scoreboard
backend/api/admin.py          → POST /v1/admin/jobs
backend/api/inventory.py      → GET /v1/data/inventory
```

**Services (Business Logic)**:
```
backend/services/readers.py   → Database queries
backend/services/cache.py     → Redis caching
backend/services/etl.py       → Load parquet to database
```

**Configuration**:
```
backend/core/config.py        → Settings (API key, database URL, etc.)
```

**Database**:
```
backend/migrations/001_create_schema.sql
├── Creates 9 tables
├── Defines relationships
└── Sets up indexes for fast queries
```

---

## Part 8: OUR IMPROVEMENTS TO 2025-ONLY FOCUS

### The Problem We Solved

**Before**: Backend could accidentally load 2024 data if:
- Someone passed `season=2024` parameter
- Old files were on disk
- Configuration was wrong

**Our Solution**: Three layers of validation

```
Layer 1 - ETL (services/etl.py):
  if season != 2025:
      return error

Layer 2 - API (api/schedules.py):
  if season != 2025:
      return error

Layer 3 - Data (parquet files):
  Only 2025 files are actively used
```

**Result**: Zero chance of 2024 data being loaded

---

## Part 9: KEY CONCEPTS SUMMARY

| Concept | What It Is | Why We Use It | Real-World Analogy |
|---------|-----------|---------------|--------------------|
| **Parquet** | Data storage format | Small, fast | Compressed ZIP file |
| **Polars** | Data processing library | Transform data efficiently | Swiss Army knife |
| **Supabase** | Hosted database | Reliable storage | Google Drive for data |
| **PostgreSQL** | Database language | Query data with SQL | Smart spreadsheet |
| **Redis** | Fast cache | Speed up responses | RAM memory cache |
| **FastAPI** | Web framework | Create API endpoints | Restaurant website |
| **Docker** | Container tool | Package everything | Shipping container |
| **Next.js** | Frontend framework | Create web interface | Landing page builder |
| **REST API** | Communication standard | How frontend talks to backend | Phone call protocol |
| **ETL** | Extract-Transform-Load | Move data pipeline | Moving company |

---

## Part 10: YOU DON'T NEED TO UNDERSTAND

These are "under the hood" - you don't need to know them to use the system:

- ✗ SQL query optimization
- ✗ Database index structure
- ✗ How Redis eviction policies work
- ✗ HTTP headers and status codes (unless debugging)
- ✗ Python async/await concurrency
- ✗ Docker networking
- ✗ PostgreSQL replication

---

## Part 11: QUESTIONS YOU MIGHT HAVE

**Q: Do I need to write code?**
A: No! We did it for you. You just run it.

**Q: What if data doesn't load?**
A: Check the logs. Most likely:
- Supabase credentials wrong
- Parquet file missing or corrupted
- Database schema not created

**Q: Can I modify the API endpoints?**
A: Yes! Each endpoint is independent. You can add new queries or modify existing ones.

**Q: Where does the data go when I delete it?**
A: Deleted from Supabase database. Original parquet files remain (backup).

**Q: Can I add a new data type?**
A: Yes! Add a new parquet file → create ETL function → create API endpoint.

**Q: What's the cost?**
A: Supabase has free tier (up to 500MB). Redis can be free (local) or $7/mo. Frontend (Vercel) is free for static sites.

---

## Final Summary

You now understand:
1. ✅ What data we're working with (11 tables of NFL info)
2. ✅ Where it comes from (NFL official + nflreadpy library)
3. ✅ How tools work together (data flow pipeline)
4. ✅ What each tool does (Parquet, Polars, Supabase, Redis, FastAPI, Docker, Next.js)
5. ✅ How users access the data (frontend → API → database)
6. ✅ What we secured (2025-only validation on 3 layers)

**You're ready to deploy to Supabase!**
