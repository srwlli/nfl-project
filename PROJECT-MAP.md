# Project Navigation Map

**Purpose**: High-level guide showing WHERE everything is located
**For**: New agents joining the project
**Last Updated**: 2025-10-20

---

## 🗺️ PROJECT STRUCTURE OVERVIEW

```
C:\Users\willh\Desktop\projects - current-location\next-scraper\
│
├── 📊 DATABASE FILES
│   ├── .env.local                               → Database credentials (gitignored)
│   ├── supabase/
│   │   ├── .temp/project-ref                    → Project ID: fuzouuxhxluqjmiyabal
│   │   └── migrations/*.sql                     → All database schema definitions
│   ├── DATABASE-SCHEMA-REFERENCE.md             → ⚠️ **CRITICAL**: Exact column names (READ FIRST!)
│   └── DATABASE-ACCESS-GUIDE.md                 → How to connect & query database
│
├── 📋 PROJECT PLANNING & DOCUMENTATION
│   ├── CLAUDE.md                                → Main development log (all sessions)
│   ├── communication.json                       → Agent session changelog
│   ├── SESSION-PHASE-1-DEPLOYMENT.md           → Phase 1 technical details
│   ├── PROJECT-MAP.md                           → THIS FILE - navigation guide
│   ├── AVAILABLE-DATA-INVENTORY.md             → 🎯 Complete 2025 season data catalog (2,000+ lines)
│   ├── README.md                                → Project overview
│   ├── SCHEDULER.md                             → Scheduler usage
│   ├── DEPLOYMENT.md                            → Production deployment
│   └── coderef/                                 → Planning documents
│       ├── working/                             → Active feature plans
│       │   ├── create-scripts/plan.json         → Initial scraper plan
│       │   └── player-news/plan.json            → Player news feature plan
│       └── finalizing-elements/                 → UI requirements & data sources
│           ├── data-sources/                    → Data source documentation
│           └── stats/                           → Stats template requirements
│
├── 🔧 SCRIPTS & AUTOMATION
│   ├── scripts/
│   │   ├── seed/                                → Initial data loaders (run once)
│   │   │   ├── 01-teams.js                      → Load 32 NFL teams
│   │   │   ├── 02-stadiums.js                   → Load 30 stadiums
│   │   │   ├── 03-players.js                    → Load 2,637 players
│   │   │   └── 04-schedule.js                   → Load 2025 season schedule
│   │   │
│   │   ├── scrapers/                            → Continuous data collectors (8 total)
│   │   │   ├── game-stats-scraper.js            → Post-game stats + quarter scores
│   │   │   ├── live-games-scraper.js            → Real-time scores
│   │   │   ├── injuries-scraper.js              → Injury reports
│   │   │   ├── roster-updates-scraper.js        → Roster transactions
│   │   │   ├── standings-scraper.js             → Division/conference rankings
│   │   │   ├── betting-scraper.js               → Betting odds
│   │   │   ├── advanced-analytics-scraper.js    → EPA/WPA data
│   │   │   └── player-news-scraper.js           → Player news (PLANNED)
│   │   │
│   │   ├── utils/                               → Shared utilities
│   │   │   ├── supabase-client.js               → Database connection
│   │   │   ├── espn-api.js                      → ESPN API wrapper
│   │   │   ├── logger.js                        → Winston logging
│   │   │   └── rate-limiter.js                  → API throttling
│   │   │
│   │   ├── check-migrations-applied.js          → Verify Phase 1 migrations
│   │   ├── validate-data-completeness.js        → Check 100% game coverage
│   │   └── verify-phase1-fields.js              → Check fantasy fields populated
│   │
│   └── scheduler.js                             → Automated orchestration
│
├── 🎨 DEMO & GENERATED FILES
│   ├── index.html                               → Comprehensive data showcase (auto-generated)
│   ├── demo-game-page.html                      → Basic game page demo
│   └── demo-game-page-with-players.html         → Enhanced with player stats tabs
│
└── 📝 LOGS & CONFIG
    ├── logs/                                    → Application logs (Winston)
    ├── package.json                             → Dependencies & npm scripts
    └── .gitignore                               → Git exclusions

```

---

## 🎯 QUICK NAVIGATION BY TASK

### "I need to access the database"
**Go to**: `DATABASE-ACCESS-GUIDE.md` (line 9-56 has step-by-step instructions)

**⚠️ CRITICAL - Read FIRST before writing queries**:
- `DATABASE-SCHEMA-REFERENCE.md` → **Exact column names** (prevents 15-30 min debugging)

**Critical files you'll need**:
- `.env.local` → Database credentials
- `supabase/.temp/project-ref` → Project ID
- `scripts/check-migrations-applied.js` → Verify setup

**Quick command**:
```bash
supabase link --project-ref fuzouuxhxluqjmiyabal
node scripts/check-migrations-applied.js
```

---

### "I need to understand the project history"
**Go to**: `CLAUDE.md` (Main development log)

**What you'll find**:
- All 4 sessions documented
- Complete scraper list (8 scrapers)
- Database schema (46 tables)
- Performance metrics
- Known limitations

**Also check**: `communication.json` (session-by-session changelog)

---

### "I need to access/export the NFL data"
**Go to**: `AVAILABLE-DATA-INVENTORY.md` 🎯

**What you'll find**:
- Complete catalog of all 2025 season data
- 9 tables with 303+ fields documented
- Sample queries for every table
- Export options (JSON, CSV, SQL)
- Connection methods (Supabase client, REST API, PostgreSQL)
- Data freshness and update schedules

**Quick stats**:
- 4,599 player game records
- 106 completed games
- 303 fields per player (fantasy, analytics, stats)
- 100% coverage for completed games

---

### "I need to understand Phase 1 deployment"
**Go to**: `SESSION-PHASE-1-DEPLOYMENT.md`

**What you'll find**:
- Migration fixes applied
- Schema errors resolved
- Testing & backfill results
- Performance metrics
- Known limitations
- Next steps for Phase 2

---

### "I need to see the implementation plan"
**Go to**: `coderef/working/create-scripts/plan.json`

**What you'll find**:
- Original scraper implementation plan
- Task breakdown
- Dependencies
- Time estimates

**For Phase 1 plan**: See `communication.json` (lines 1-210 have planning details)

---

### "I need to understand the database schema"
**Go to**: `supabase/migrations/` directory

**Key migrations**:
- `20250101000020_enhance_player_game_stats.sql` → 44 columns added (fantasy, EPA, advanced)
- `20250101000021_create_weekly_aggregation_tables.sql` → 3 tables + 3 views (leaders, cumulative)

**Also check**: `DATABASE-ACCESS-GUIDE.md` (lines 113-142 document schema patterns)

---

### "I need to validate data completeness"
**Run**:
```bash
node scripts/validate-data-completeness.js
```

**Expected output**:
- Player game stats: 3,817 records
- Weekly leaders: 110 records
- Season cumulative: 811 records
- Games missing stats: 0/94 (100% coverage)

---

### "I need to run a scraper"
**Check**: `package.json` for npm scripts

**Common commands**:
```bash
# Scrape specific game
npm run scrape:game-stats -- --game=401772510

# Scrape entire week
npm run scrape:game-stats -- --week=7

# Check live scores
npm run scrape:live -- --week=7

# Update standings
npm run scrape:standings

# Fetch betting odds
npm run scrape:betting
```

---

### "I need to understand what data we have"
**Check**: `index.html` (comprehensive data showcase)

**What's displayed**:
- 2,540 players tracked
- 94/272 games completed
- Conference standings
- Quarter-by-quarter scores
- Top performers (passers/rushers/receivers)
- Injury reports
- Roster transactions
- Betting lines (when available)

**Run**: `node scripts/generate-comprehensive-index.js` to regenerate

---

### "I need to deploy to production"
**Go to**: `DEPLOYMENT.md`

**What you'll find**:
- PM2 process management
- Environment setup
- Log rotation
- Monitoring
- Troubleshooting

---

### "I need to understand the scheduler"
**Go to**: `SCHEDULER.md`

**What you'll find**:
- All 8 scrapers scheduled
- Cron job timings
- Game day detection
- Development vs production modes
- Status monitoring

**Run**: `npm run scheduler` to start

---

## 📍 ABSOLUTE FILE PATHS (for copy/paste)

**Database Access:**
```
C:\Users\willh\Desktop\projects - current-location\next-scraper\.env.local
C:\Users\willh\Desktop\projects - current-location\next-scraper\supabase\.temp\project-ref
C:\Users\willh\Desktop\projects - current-location\next-scraper\DATABASE-ACCESS-GUIDE.md
```

**Documentation:**
```
C:\Users\willh\Desktop\projects - current-location\next-scraper\CLAUDE.md
C:\Users\willh\Desktop\projects - current-location\next-scraper\communication.json
C:\Users\willh\Desktop\projects - current-location\next-scraper\SESSION-PHASE-1-DEPLOYMENT.md
C:\Users\willh\Desktop\projects - current-location\next-scraper\PROJECT-MAP.md
C:\Users\willh\Desktop\projects - current-location\next-scraper\AVAILABLE-DATA-INVENTORY.md
```

**Validation Scripts:**
```
C:\Users\willh\Desktop\projects - current-location\next-scraper\scripts\check-migrations-applied.js
C:\Users\willh\Desktop\projects - current-location\next-scraper\scripts\validate-data-completeness.js
C:\Users\willh\Desktop\projects - current-location\next-scraper\scripts\verify-phase1-fields.js
```

**Planning Documents:**
```
C:\Users\willh\Desktop\projects - current-location\next-scraper\coderef\working\create-scripts\plan.json
C:\Users\willh\Desktop\projects - current-location\next-scraper\coderef\working\player-news\plan.json
C:\Users\willh\Desktop\projects - current-location\next-scraper\coderef\finalizing-elements\stats
```

---

## 🚀 FIRST-TIME AGENT CHECKLIST

When starting work on this project, do these steps IN ORDER:

1. ✅ **Read this file** (PROJECT-MAP.md) - You are here!

2. ✅ **Read CLAUDE.md** - Understand project overview and all 4 sessions

3. ✅ **Read communication.json** - See what the last agent did

4. ✅ **Link to database**:
   ```bash
   cat supabase/.temp/project-ref  # Should show: fuzouuxhxluqjmiyabal
   supabase link --project-ref fuzouuxhxluqjmiyabal
   ```

5. ✅ **Verify Phase 1 is deployed**:
   ```bash
   node scripts/check-migrations-applied.js
   ```

6. ✅ **Validate data completeness**:
   ```bash
   node scripts/validate-data-completeness.js
   ```

7. ✅ **Read DATABASE-ACCESS-GUIDE.md** - Learn database access patterns

8. ✅ **Check for new tasks** - Look at user's request and plan next steps

---

## 📊 PROJECT STATUS SNAPSHOT

**Phase 1**: ✅ COMPLETE (303/674 fields operational - 45%)
**Database**: ✅ Connected (fuzouuxhxluqjmiyabal)
**Data Coverage**: ✅ 100% (94/94 completed games)
**Scrapers**: ✅ 7/8 operational (player news planned)
**Documentation**: ✅ Complete (6 major docs created)

**Next Phase**: Phase 2 (Betting + Snaps + Trending)

---

## 🆘 TROUBLESHOOTING

**"I can't find the database credentials"**
- Check: `.env.local` (gitignored - may need user to provide)
- Variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

**"Supabase link fails"**
- Verify: `cat supabase/.temp/project-ref` shows `fuzouuxhxluqjmiyabal`
- Try: `supabase link --project-ref fuzouuxhxluqjmiyabal`
- Note: Linking is NOT persistent across terminal sessions

**"Database queries failing"**
- Check: `DATABASE-ACCESS-GUIDE.md` (lines 95-109 show common errors)
- Common issues:
  - Using `id` instead of composite `(game_id, season)`
  - Using `home_team` instead of `home_team_id`
  - Using `'completed'` instead of `'final'`

**"Missing player IDs during scrape"**
- Run: `npm run scrape:roster` (updates player database)
- Then: Re-run failed game scrapes

**"Can't find a specific file"**
- Use: This PROJECT-MAP.md file navigation sections
- Or: Grep through CLAUDE.md for file references

---

## 📚 DOCUMENTATION HIERARCHY

```
PROJECT-MAP.md (THIS FILE)           → Start here - high-level navigation
    ↓
CLAUDE.md                            → Project overview & session history
    ↓
communication.json                   → Detailed session changelog
    ↓
SESSION-PHASE-1-DEPLOYMENT.md       → Phase 1 technical details
    ↓
DATABASE-ACCESS-GUIDE.md            → Database connection & query patterns
    ↓
SCHEDULER.md                        → Scraper automation details
    ↓
DEPLOYMENT.md                       → Production deployment guide
```

**Read in this order for complete context!**

---

**Last Updated**: 2025-10-20 (Session 4)
**Next Agent**: Start with this file, then CLAUDE.md, then communication.json
