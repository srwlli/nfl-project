# Comprehensive Stats Collection - Implementation Plan
**Goal:** Collect ALL 674 required fields for current season stats
**Priority:** P0 - Critical
**Timeline:** 8-12 hours total implementation
**Status:** Planning Complete - Ready for Implementation

---

## Field Coverage Breakdown

| Source | Fields | Priority | Status | Time Est |
|--------|--------|----------|--------|----------|
| ESPN API (Post-Game) | 40 | P0 | Partial (15/40) | 2h |
| Fantasy Calculator | 51 | P0 | Not Started | 1h |
| nflverse EPA/Advanced | 150 | P0 | Started (0/150) | 2h |
| Aggregations/Rankings | 212 | P0 | Not Started | 2h |
| The Odds API (Betting) | 58 | P1 | Started (0/58) | 1h |
| DFS APIs (DK/FD) | 12 | P1 | Not Started | 2h |
| NFL Next Gen Stats | 8 | P1 | Not Started | 2h |
| ESPN WebSocket (Live) | 87 | P2 | Not Started | 8h |
| Twitter API (Social) | 18 | P2 | Not Started | 4h |
| **TOTAL** | **674** | | **15/674 (2.2%)** | **24h** |

---

## Phase 1: Foundation Enhancement (P0) - 4 hours

### Goal: 253 fields operational (ESPN + Fantasy + nflverse + Aggregations)

### 1.1 Database Schema Migrations (30 min)

**File:** `supabase/migrations/20250101000020_enhance_player_game_stats.sql`

```sql
-- ESPN Advanced Fields (25 new columns)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS
  -- Passing (5 fields)
  passing_sacks INTEGER DEFAULT 0,
  passing_sack_yards_lost INTEGER DEFAULT 0,
  passing_longest INTEGER DEFAULT 0,
  passer_rating DECIMAL(5,2),
  qbr DECIMAL(5,2),

  -- Rushing (4 fields)
  rushing_longest INTEGER DEFAULT 0,
  rushing_fumbles INTEGER DEFAULT 0,
  rushing_fumbles_lost INTEGER DEFAULT 0,
  rushing_yards_after_contact INTEGER DEFAULT 0,

  -- Receiving (5 fields)
  receiving_targets INTEGER DEFAULT 0,
  receiving_longest INTEGER DEFAULT 0,
  receiving_yards_after_catch INTEGER DEFAULT 0,
  receiving_first_downs INTEGER DEFAULT 0,
  receiving_fumbles INTEGER DEFAULT 0,

  -- Defense (7 fields)
  tackles_solo INTEGER DEFAULT 0,
  tackles_assists INTEGER DEFAULT 0,
  tackles_for_loss DECIMAL(5,1) DEFAULT 0,
  qb_hits INTEGER DEFAULT 0,
  passes_defended INTEGER DEFAULT 0,
  forced_fumbles INTEGER DEFAULT 0,
  fumble_recoveries INTEGER DEFAULT 0,

  -- Kicking (3 fields)
  field_goal_longest INTEGER DEFAULT 0,
  extra_points_made INTEGER DEFAULT 0,
  extra_points_attempted INTEGER DEFAULT 0,

  -- Punting (6 fields)
  punts INTEGER DEFAULT 0,
  punt_yards INTEGER DEFAULT 0,
  punt_average DECIMAL(5,2),
  punts_inside_20 INTEGER DEFAULT 0,
  punt_longest INTEGER DEFAULT 0,
  punt_touchbacks INTEGER DEFAULT 0;

-- Fantasy Points (5 calculated fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS
  fantasy_points_standard DECIMAL(5,2),
  fantasy_points_ppr DECIMAL(5,2),
  fantasy_points_half_ppr DECIMAL(5,2),
  fantasy_points_dfs_dk DECIMAL(5,2),
  fantasy_points_dfs_fd DECIMAL(5,2);

-- nflverse Advanced Analytics (6 fields)
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS
  epa_total DECIMAL(6,3),
  epa_pass DECIMAL(6,3),
  epa_rush DECIMAL(6,3),
  epa_receive DECIMAL(6,3),
  success_rate DECIMAL(5,2),
  cpoe DECIMAL(5,2);

-- Opportunity Metrics (8 fields) - from snap data sources
ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS
  snaps_played INTEGER DEFAULT 0,
  snaps_total INTEGER DEFAULT 0,
  snap_percentage DECIMAL(5,2),
  routes_run INTEGER DEFAULT 0,
  route_participation_pct DECIMAL(5,2),
  red_zone_touches INTEGER DEFAULT 0,
  red_zone_targets INTEGER DEFAULT 0,
  end_zone_targets INTEGER DEFAULT 0;
```

**File:** `supabase/migrations/20250101000021_create_weekly_aggregation_tables.sql`

```sql
-- Weekly leaderboards (for Section 2: Weekly Leaderboards)
CREATE TABLE weekly_stat_leaders (
  week_leader_id BIGSERIAL PRIMARY KEY,
  season INTEGER NOT NULL,
  week INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'passing_yards', 'rushing_yards', etc.
  rank INTEGER NOT NULL,
  player_id VARCHAR(50) NOT NULL,
  stat_value DECIMAL(10,2),
  touchdowns INTEGER DEFAULT 0,
  interceptions INTEGER DEFAULT 0,
  game_result VARCHAR(20),
  trending_indicator VARCHAR(10), -- '🔥', '▲', '▼', ''
  comparison_to_season_avg DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_weekly_leader UNIQUE (season, week, category, rank),
  CONSTRAINT fk_weekly_leader_player FOREIGN KEY (player_id) REFERENCES players(player_id)
);

-- Season cumulative stats (for Section 3: Season Cumulative)
CREATE TABLE player_season_stats (
  player_season_id BIGSERIAL PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  season INTEGER NOT NULL,
  games_played INTEGER DEFAULT 0,
  games_started INTEGER DEFAULT 0,
  -- All cumulative stat fields (passing, rushing, receiving, defense)
  -- ... (full schema in separate file)
  season_rank_passing_yards INTEGER,
  season_rank_rushing_yards INTEGER,
  season_rank_receiving_yards INTEGER,
  pace_projected_passing_yards INTEGER,
  pace_projected_rushing_yards INTEGER,
  pace_projected_receiving_yards INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_player_season UNIQUE (player_id, season),
  CONSTRAINT fk_player_season_player FOREIGN KEY (player_id) REFERENCES players(player_id)
);

-- Trending analytics (for Section 7: Trending & Hot/Cold Streaks)
CREATE TABLE player_trending_analytics (
  trending_id BIGSERIAL PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  season INTEGER NOT NULL,
  week INTEGER NOT NULL,
  trending_status VARCHAR(20), -- 'hot', 'cold', 'stable', 'breakout', 'injury_concern'
  hot_streak_weeks INTEGER DEFAULT 0,
  hot_streak_criteria TEXT,
  cold_streak_weeks INTEGER DEFAULT 0,
  week_over_week_changes JSONB, -- Store WoW changes as JSON
  breakout_alert BOOLEAN DEFAULT FALSE,
  breakout_type VARCHAR(50),
  usage_trends JSONB,
  alerts TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_trending UNIQUE (player_id, season, week),
  CONSTRAINT fk_trending_player FOREIGN KEY (player_id) REFERENCES players(player_id)
);
```

### 1.2 Enhance game-stats-scraper.js (1 hour)

**Goal:** Extract ALL ESPN boxscore fields

**Current:** 15 fields
**Target:** 40 fields
**Changes:**
- Add passing: sacks, sack yards, longest, rating, QBR
- Add rushing: longest, fumbles, fumbles lost
- Add receiving: targets, longest, YAC
- Add defense: solo/assist splits, TFL, QB hits, PD, FF, FR
- Add kicking: longest FG, XP made/attempted
- Add punting: all punting stats

**Key Functions to Update:**
- `extractPlayerStats()` - Parse additional ESPN stat labels
- Add `calculateFantasyPoints()` - Calculate 5 fantasy scoring formats

### 1.3 Create fantasy-calculator.js (45 min)

**File:** `scripts/utils/fantasy-calculator.js`

```javascript
/**
 * Fantasy Points Calculator
 * Calculates fantasy points for multiple scoring formats
 */

export function calculateFantasyPoints(playerStats) {
  const {
    passing_yards, passing_touchdowns, passing_interceptions,
    rushing_yards, rushing_touchdowns,
    receptions, receiving_yards, receiving_touchdowns,
    fumbles_lost
  } = playerStats

  // Standard scoring (no PPR)
  const standard =
    (passing_yards * 0.04) +
    (passing_touchdowns * 4) +
    (passing_interceptions * -2) +
    (rushing_yards * 0.1) +
    (rushing_touchdowns * 6) +
    (receiving_yards * 0.1) +
    (receiving_touchdowns * 6) +
    (fumbles_lost * -2)

  // PPR (Point Per Reception)
  const ppr = standard + (receptions * 1.0)

  // Half PPR
  const half_ppr = standard + (receptions * 0.5)

  // DFS DraftKings
  const dfs_dk =
    (passing_yards * 0.04) +
    (passing_touchdowns * 4) +
    (passing_interceptions * -1) +
    (passing_yards >= 300 ? 3 : 0) + // 300-yard bonus
    (rushing_yards * 0.1) +
    (rushing_touchdowns * 6) +
    (rushing_yards >= 100 ? 3 : 0) + // 100-yard bonus
    (receptions * 1.0) +
    (receiving_yards * 0.1) +
    (receiving_touchdowns * 6) +
    (receiving_yards >= 100 ? 3 : 0) + // 100-yard bonus
    (fumbles_lost * -1)

  // DFS FanDuel
  const dfs_fd =
    (passing_yards * 0.04) +
    (passing_touchdowns * 4) +
    (passing_interceptions * -1) +
    (rushing_yards * 0.1) +
    (rushing_touchdowns * 6) +
    (receptions * 0.5) +
    (receiving_yards * 0.1) +
    (receiving_touchdowns * 6) +
    (fumbles_lost * -2)

  return {
    fantasy_points_standard: Math.round(standard * 100) / 100,
    fantasy_points_ppr: Math.round(ppr * 100) / 100,
    fantasy_points_half_ppr: Math.round(half_ppr * 100) / 100,
    fantasy_points_dfs_dk: Math.round(dfs_dk * 100) / 100,
    fantasy_points_dfs_fd: Math.round(dfs_fd * 100) / 100
  }
}
```

### 1.4 Enhance advanced-analytics-scraper.js (1 hour)

**Current Status:** Exists but needs enhancement
**Goal:** Extract ALL nflverse EPA/CPOE/Success Rate fields

**Changes:**
- Add per-player EPA aggregation (not just game-level)
- Add CPOE (Completion % Over Expected) for QBs
- Add Success Rate by player
- Map nflverse player IDs to ESPN player IDs

### 1.5 Create weekly-aggregation-script.js (1.5 hours)

**File:** `scripts/aggregators/weekly-aggregation.js`

**Purpose:** Calculate weekly leaderboards, season cumulative stats, rankings

**Sections Generated:**
- Section 2: Weekly Leaderboards (288 fields)
  - 12 categories × 24 fields per leader
  - Top 10 leaders per category
  - Trending indicators

- Section 3: Season Cumulative Stats (42 fields per player)
  - Running totals through current week
  - Season rankings
  - Pace projections

---

## Phase 2: Betting & Opportunity Metrics (P1) - 3 hours

### 2.1 Enhance betting-scraper.js (1 hour)

**Current:** Game lines only
**Target:** Game lines + Player props

**Add to betting scraper:**
- Player props (passing yards, TDs, receptions, etc.)
- Prop hit rate tracking
- Line movement history

### 2.2 Create snap-counts-scraper.js (2 hours)

**Source:** Pro Football Reference or ESPN snap count data

**Fields to scrape:**
- Snaps played / total snaps
- Snap percentage
- Routes run (for WR/TE)
- Route participation %
- Red zone snaps/touches
- End zone targets

---

## Phase 3: DFS & Next Gen Stats (P1) - 4 hours

### 3.1 Create dfs-scraper.js (2 hours)

**Sources:** DraftKings + FanDuel APIs/Scraping

**Fields:**
- Player salaries (DK/FD)
- Projected ownership %
- Optimal lineup suggestions
- Value calculations

### 3.2 Create next-gen-stats-scraper.js (2 hours)

**Source:** NFL.com Next Gen Stats pages

**Fields:**
- Average time to throw
- Completed air yards
- Cushion (WR separation)
- Max speed
- Tracking data

---

## Phase 4: Trending Analytics (P0) - 2 hours

### 4.1 Create trending-analytics-calculator.js

**Purpose:** Calculate hot/cold streaks, pace projections, breakout detection

**Calculations:**
- Hot streak detection (3+ consecutive high-performance weeks)
- Cold streak detection
- Week-over-week % changes
- Pace projections to season end
- Record chase alerts
- Breakout detection (usage spike analysis)

---

## Phase 5: Live Stats (P2 - Future) - 8+ hours

### 5.1 WebSocket Implementation

**Deferred to post-MVP** - Requires:
- WebSocket server/client
- ESPN live feed integration
- Real-time database updates
- Frontend WebSocket subscription

---

## Implementation Timeline

### Week 1 (Today)
- ✅ Create implementation plan
- [ ] Run database migrations (30 min)
- [ ] Enhance game-stats-scraper.js (1 hour)
- [ ] Create fantasy-calculator.js (45 min)
- [ ] Backfill 76 missing games with enhanced scraper (1 hour)

### Week 1 (Tomorrow)
- [ ] Enhance advanced-analytics-scraper.js (1 hour)
- [ ] Create weekly-aggregation-script.js (1.5 hours)
- [ ] Create trending-analytics-calculator.js (2 hours)
- [ ] Re-scrape all 94 games with complete enhancement (1 hour)

### Week 2
- [ ] Enhance betting-scraper.js for player props (1 hour)
- [ ] Create snap-counts-scraper.js (2 hours)
- [ ] Create dfs-scraper.js (2 hours)
- [ ] Create next-gen-stats-scraper.js (2 hours)

---

## Field Coverage After Each Phase

| Phase | Fields Added | Cumulative | % Complete |
|-------|--------------|------------|------------|
| Current | 15 | 15 | 2.2% |
| Phase 1 (P0) | +238 | 253 | 37.5% |
| Phase 2 (P1) | +70 | 323 | 47.9% |
| Phase 3 (P1) | +20 | 343 | 50.9% |
| Phase 4 (P0) | +38 | 381 | 56.5% |
| Phase 5 (P2) | +87 | 468 | 69.4% |
| Phase 6 (P2) | +18 | 486 | 72.1% |
| **Calculated** | +188 | **674** | **100%** |

---

## Success Criteria

### Phase 1 Complete (P0):
- ✅ 253/674 fields operational (37.5%)
- ✅ All ESPN fields extracted
- ✅ Fantasy points calculated
- ✅ EPA/CPOE from nflverse
- ✅ Weekly/season aggregations working
- ✅ All 94 games have complete enhanced stats

### Full Implementation (All Phases):
- ✅ 674/674 fields operational (100%)
- ✅ All scrapers running on schedule
- ✅ Data validation passing
- ✅ Ready for frontend integration

---

## Next Steps

1. **Get approval on this plan**
2. **Execute Phase 1** (4 hours, P0 priority)
3. **Validate Phase 1** (test all 253 fields)
4. **Proceed to Phase 2-4** based on priority

Ready to begin implementation?
