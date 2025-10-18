# NFL Betting Data System - Explained for Complete Beginners

**No technical background needed!**

---

## What We're Building (In Simple Terms)

Imagine you want to create a **sports betting website** that shows:
- Which NFL teams are playing this week
- What the odds are
- Player stats
- Injuries

**That's what we built.**

---

## The Data - What Is It?

Think of this like a **filing cabinet with 11 drawers**:

### Drawer 1: Game Schedule
```
Contains cards for each game:
┌─────────────────────────────┐
│ Kansas City vs Buffalo      │
│ Sunday, Oct 12, 1pm         │
│ Arrowhead Stadium           │
│ Odds: KC -3.5, Total 45.5   │
└─────────────────────────────┘
```
- 272 cards (one for each game in 2025 season)
- Filed by week number

### Drawer 2: Play-by-Play
```
Contains detailed play cards:
┌──────────────────────────────────┐
│ Game: KC vs Buffalo              │
│ Play #1: Pass from Mahomes       │
│ Gained: 8 yards                  │
│ Down: 1st and 10 → 1st and 2    │
│ Advanced Metrics: EPA +0.5       │
└──────────────────────────────────┘
```
- 12,473 cards (one for each play)
- Shows what happened on every single play

### Drawer 3: Player Stats
```
┌──────────────────────────────────┐
│ Patrick Mahomes (Week 6)         │
│ Passing Yards: 287               │
│ Touchdowns: 2                    │
│ Interceptions: 0                 │
│ Fantasy Points: 24.8             │
└──────────────────────────────────┘
```
- 4,950 cards (one per player per week)
- Shows how each player performed

### Drawers 4-11: More Data
- **Snap Counts**: How much did each player play?
- **Depth Charts**: Who's the starter vs backup?
- **Rosters**: Player info (height, weight, college)
- **Team Info**: 32 teams, their names, locations
- **Power Ratings**: How strong is each team?
- **Injuries**: Who's injured?
- **Advanced Stats**: Super detailed tracking data
- **Live Scores**: Real-time updates during games

---

## Where Does the Data Come From?

```
┌──────────────────────────┐
│  The NFL               │
│  Official Records      │
│  (what really happened)│
└────────────┬───────────┘
             │
             │ (Every week someone downloads it)
             ↓
┌──────────────────────────┐
│  nflreadpy              │
│  (A tool that grabs     │
│   data from the NFL)    │
└────────────┬───────────┘
             │
             │ (We run a script)
             ↓
┌──────────────────────────┐
│  Our File Cabinet       │
│  With 11 Drawers        │
│  (Parquet Files)        │
└────────────┬───────────┘
             │
             │ (Backend loads the data)
             ↓
┌──────────────────────────┐
│  Database               │
│  (Like a computer       │
│   file cabinet)         │
└────────────┬───────────┘
             │
             │ (Website calls it)
             ↓
┌──────────────────────────┐
│  Your Website           │
│  (What users see)       │
└──────────────────────────┘
```

### Who Updates It?

Currently: **You manually** (or a scheduled script on your computer)
- Once a week, the script wakes up
- Downloads new NFL data
- Updates the filing cabinet
- Website always has latest info

Future: **Automatic**
- Runs without you doing anything
- Like a robot updating your filing cabinet every Sunday

---

## The Tools - What Do They Do?

### Tool 1: PARQUET FILES
**What**: A special file format for storing data

**Think of it like**: A ZIP file that compresses your filing cabinet
- Regular filing cabinet: Takes up a desk
- ZIP file filing cabinet: Takes up a USB stick

**Why we use it**:
- Much smaller (5.8 MB instead of 100+ MB)
- Much faster to read
- Computer-optimized (humans can't read it directly)

---

### Tool 2: POLARS
**What**: A tool that transforms and processes data

**Think of it like**: A worker who organizes your filing cabinet
- You have messy cards
- Polars worker: Sorts them, filters them, organizes them
- Result: Perfectly organized data

**Example**:
```
Before (messy):
- Player stats have weird text characters
- Dates in wrong format
- Missing some values

After (Polars processes it):
- All dates same format
- All numbers properly formatted
- Missing values handled
- Ready to store in database
```

---

### Tool 3: SUPABASE
**What**: A company that hosts your database in the cloud

**Think of it like**: Google Drive but for databases
- You don't buy a server
- You don't maintain a server
- Supabase keeps it running 24/7

**What's inside**:
- PostgreSQL (a database system)
- Your 11 tables with all the data
- Tools to query the data quickly

**Cost**: Free for small projects (up to 500MB)

---

### Tool 4: REDIS
**What**: Super-fast temporary memory

**Think of it like**: A whiteboard vs a filing cabinet
- Filing cabinet: Reliable but slower to access
- Whiteboard: Right in front of you, instant to read

**How we use it**:
```
User 1: "Get KC schedule"
  ↓
Not on whiteboard, so check filing cabinet
Get data
Write on whiteboard
Return to user

User 2: "Get KC schedule" (1 second later)
  ↓
Already on whiteboard!
Return to user instantly
No need to open filing cabinet
```

**Result**: Website feels faster to users

**Auto-cleanup**: Whiteboard erases every 60 seconds (auto-deletes old data)

---

### Tool 5: FASTAPI
**What**: A tool that creates the website's "front desk"

**Think of it like**: A restaurant's waiters
- User: "I want this data"
- Waiter (FastAPI): Takes order, goes to kitchen
- Kitchen: Gets the food
- Waiter: Returns with food
- User: Happy!

**What it does**:
```
User asks: "Give me KC's schedule for week 6"

FastAPI receives request:
  ↓
Check: Is this a valid request? (YES)
Check: Is season = 2025? (YES - we block others)
Check: Is this in our cache? (No)
Open database: "Give me KC games, week 6"
Database: "Here are the games"
Store in cache: "Whiteboard: KC week 6"
Send to user: "Here's your answer"
```

**Automatic Documentation**: FastAPI automatically creates documentation at `/docs` (like instructions for using the API)

---

### Tool 6: DOCKER
**What**: A tool that packages everything in a container

**Think of it like**: Putting your entire restaurant in a box
- With Docker: All recipes, all ingredients, all equipment
- Someone else: Opens the box, runs the same restaurant perfectly
- Without Docker: "Use these ingredients" → They can't find them → Breaks

**What we package**:
```
Docker Container:
├── Python 3.13 (programming language)
├── FastAPI library
├── Polars library
├── Redis connector
├── All your code
├── All settings
└── Instructions on how to run
```

**Result**: Code works on any computer, any server

---

### Tool 7: NEXT.JS
**What**: A tool that creates the website (what users see)

**Think of it like**: A website builder
- You don't write HTML manually
- Next.js creates beautiful, fast websites
- Runs in the user's browser

**What it does**:
```
User clicks "Schedule" button
  ↓
Next.js website wakes up
  ↓
Calls FastAPI: "Give me schedule data"
  ↓
FastAPI returns data
  ↓
Next.js: Makes it pretty with HTML/CSS
  ↓
User sees beautiful table with teams, times, odds
```

---

## How It All Works Together (Real Example)

### Monday: Update Data
```
Your script wakes up
  ↓
Calls NFL: "Give me this week's data"
  ↓
NFL: "Here's the schedule, play-by-play, stats"
  ↓
Polars processes it
  ↓
Saved as parquet files
```

### Tuesday: Load to Database
```
Backend script runs
  ↓
Reads parquet files
  ↓
Processes with Polars
  ↓
Stores in Supabase database
  ↓
Database now has 188,429 rows of data
```

### Wednesday: User Visits Website
```
User: Visits https://sportsbet.app

Next.js loads (website code)
  ↓
Shows: "Loading schedules..."
  ↓
Calls API: GET /v1/schedules?season=2025&week=6
  ↓
FastAPI receives request
  ↓
FastAPI checks Redis (cache)
  ↓
Not there, so query Supabase database
  ↓
Database returns: All 272 games
  ↓
FastAPI stores in Redis (for next time)
  ↓
FastAPI returns to Next.js
  ↓
Next.js displays beautiful table:

  KC vs BUF, Sun Oct 12, 1pm, KC -3.5, Total 45.5
  DAL vs NYG, Sun Oct 12, 4pm, DAL -7.0, Total 46.0
  ... (270 more games)

User clicks "Filter to my team" (KC)
  ↓
API called again for KC games
  ↓
Redis has it cached!
  ↓
Returns instantly
  ↓
User: "Wow, this is fast!"
```

---

## What We Built

### The Filing Cabinet (Data)
- 11 drawers
- 188,429 cards
- 2025 season only
- Updated weekly

### The Filing System (Backend)
- FastAPI (the waiter)
- 11 different API endpoints (11 different types of requests)
- Redis cache (the whiteboard)
- Supabase database (the main filing cabinet)

### The Website (Frontend)
- Next.js
- Beautiful interface
- Calls the API to get data
- Shows tables, charts, filters

### The Automation (DevOps)
- Docker (package everything)
- Scripts (update data weekly)
- GitHub (store code)

---

## What We Just Did (The 2025-Only Update)

### The Problem
```
Backend could accidentally load 2024 data if:
- Someone asked for year 2024
- Old files were on computer
- Configuration was wrong

User: "Give me 2024 schedule"
Old Backend: *loads 2024 data* ✗ BAD
```

### The Solution: Three Levels of Locks
```
Level 1 - ETL (The waiter says no):
  You: "Load 2024 data"
  ETL: "No, only 2025. You're blocked."

Level 2 - API (Waiters at all doors):
  You: "GET /v1/schedules?season=2024"
  API: "No, only 2025. You're blocked."

Level 3 - Data Files:
  Only 2025 files are being used
  2024 files ignored

Result: IMPOSSIBLE to load 2024 data
```

---

## Summary for Complete Beginners

### What We Have
1. **Data** (11 drawers of NFL info)
2. **Database** (Supabase - cloud storage)
3. **API** (FastAPI - the waiter)
4. **Cache** (Redis - the whiteboard)
5. **Website** (Next.js - what users see)
6. **Container** (Docker - the box everything ships in)

### The Flow
```
NFL Data
  ↓ (downloaded weekly)
Parquet Files
  ↓ (loaded by backend)
Supabase Database
  ↓ (queried by API)
FastAPI
  ↓ (called by website)
Next.js
  ↓ (displayed to user)
Beautiful Website
```

### What You Can Do Now
- ✅ Deploy to Supabase
- ✅ Start the backend (runs on your computer or a server)
- ✅ Start the website
- ✅ View NFL data
- ✅ Know that 2024 data is impossible to load

---

## Common Questions Answered Simply

**Q: Where's my data stored?**
A: In Supabase (cloud) + your computer (parquet files as backup)

**Q: How much does it cost?**
A: Free for small projects. Supabase free tier can hold 500MB of data.

**Q: Do I need to understand all this code?**
A: No! Everything is already built. You just need to understand what it does.

**Q: What if something breaks?**
A: Check the error message. Usually it's one of:
- Can't connect to Supabase (check credentials)
- Can't find parquet file (check file exists)
- Database not set up (create schema first)

**Q: Can I add new data?**
A: Yes! Add a parquet file → write ETL code → create API endpoint

**Q: Is this secure?**
A: Yes! We added 3 layers of validation so only 2025 data loads.

---

## You Now Know Enough To

✅ Explain to someone else how this works
✅ Deploy the system
✅ Add new features
✅ Debug basic issues
✅ Understand what each tool does

**That's it. You're ready!**
