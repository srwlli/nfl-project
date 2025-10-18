# 🏈 NFL Gamified Badge Ecosystem

**Purpose:** Unified badge & achievement system for players, teams, and coaches — designed for data-driven gamification, engagement, and profile enrichment.

**Last Updated:** October 17, 2025
**Author:** System Architecture Team
**Status:** ✅ Ready for Implementation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Badge Categories](#badge-categories)
4. [Badge Tier Hierarchy](#badge-tier-hierarchy)
5. [Player Badge System](#player-badge-system)
6. [Team Badge System](#team-badge-system)
7. [Coach Badge System](#coach-badge-system)
8. [Data Source Mapping](#data-source-mapping)
9. [Backend Integration](#backend-integration)
10. [Database Schema](#database-schema)
11. [API Specification](#api-specification)
12. [Frontend Integration](#frontend-integration)
13. [Future Expansion](#future-expansion)

---

## 🎯 Overview

The **NFL Badge Ecosystem** gamifies player, team, and coach profiles using visual badges tied to real data. The system rewards:

* Career achievements
* Seasonal excellence
* Single-game feats

Each badge is tied to actual NFL statistics, analytics, or award data — ensuring transparency, credibility, and scalability.

---

## 🧱 System Architecture

### Core Entities

* **Players** → Individual performance (Game / Season / Career)
* **Teams** → Collective achievements (Game / Season / Franchise)
* **Coaches** → Leadership metrics (Game / Season / Career)

### Data Flow

```
Data Sources → Rule Engine → Badge Evaluator → DB → API → Frontend UI
```

1. **Data Sources:** player_stats, team_stats, play-by-play (EPA), schedules, awards APIs
2. **Rule Engine:** JSON/YAML configs defining badge conditions
3. **Evaluator:** Python or Node service processing badge logic nightly
4. **DB:** Stores catalog + progress
5. **API:** Serves data to UI
6. **Frontend:** Displays badge grids, tooltips, and progress

---

## 🏅 Badge Categories

| Entity     | Categories              | Levels                                            |
| ---------- | ----------------------- | ------------------------------------------------- |
| **Player** | Career, Season, Game    | 7 subtypes (milestones, efficiency, clutch, etc.) |
| **Team**   | Game, Season, Franchise | 3 tiers of organizational achievement             |
| **Coach**  | Game, Season, Career    | 3 tiers focused on strategy and leadership        |

---

## 🥇 Badge Tier Hierarchy

| Tier            | Color   | Definition                               |
| --------------- | ------- | ---------------------------------------- |
| 🔴 Legendary    | #DC2626 | Historic or record-breaking achievements |
| 💜 Hall of Fame | #9333EA | Career-defining honors                   |
| 🥇 Platinum     | #E5E7EB | Top 1–5% elite performance               |
| 🥇 Gold         | #F59E0B | Top 10% achievements                     |
| 🥈 Silver       | #94A3B8 | Solid professional milestones            |
| 🥉 Bronze       | #92400E | Entry-level achievements                 |
| ⭐ Standard      | #3B82F6 | Base milestones                          |

---

## 👤 Player Badge System

Players earn badges in 3 levels:

* **Game:** Single-game feats (Perfect Passer, 4th Q Assassin)
* **Season:** Annual performance (Elite Passer, Top 10 Rusher)
* **Career:** Lifetime achievements (50K Yards, Hall of Fame)

### Example: Player Badge JSON

```json
{
  "id": "career_5k_passer",
  "name": "5K Club",
  "category": "Career Milestones",
  "tier": "Platinum",
  "icon": "🎯",
  "requirement": {
    "metric": "passing_yards",
    "threshold": 5000,
    "comparison": ">=",
    "scope": "season",
    "position_filter": ["QB"]
  },
  "data_source": "player_stats_2025.parquet",
  "earned": true,
  "progress": 5127,
  "earned_date": "2025-01-07"
}
```

---

## 🏟️ Team Badge System

Teams are evaluated by **game**, **season**, and **franchise** milestones.

### Game-Level Examples

| ID                      | Name            | Tier         | Requirement       |
| ----------------------- | --------------- | ------------ | ----------------- |
| team_game_shutout       | Shutout Victory | 🥇 Platinum  | Allowed 0 points  |
| team_game_50_point_game | 50 Point Game   | 🔴 Legendary | Scored 50+ points |

### Season-Level Examples

| ID                         | Name                | Tier            | Requirement  |
| -------------------------- | ------------------- | --------------- | ------------ |
| team_season_undefeated     | Perfect Season      | 🔴 Legendary    | 16–0 or 17–0 |
| team_season_super_bowl_win | Super Bowl Champion | 💜 Hall of Fame | Win SB       |
| team_season_division_champ | Division Champion   | 🥇 Gold         | Win division |

### Franchise-Level Examples

| ID                            | Name                  | Tier            | Requirement             |
| ----------------------------- | --------------------- | --------------- | ----------------------- |
| team_career_dynasty           | Dynasty Era           | 🔴 Legendary    | 3+ SB wins in 5 years   |
| team_career_legacy_franchise  | Legacy Franchise      | 💜 Hall of Fame | 5+ SB titles            |
| team_career_20_playoff_berths | Postseason Powerhouse | 🥇 Platinum     | 20+ playoff appearances |

---

## 🧠 Coach Badge System

Coaches have **game**, **season**, and **career** level achievements.

### Game-Level Examples

| ID                             | Name                | Tier        | Requirement             |
| ------------------------------ | ------------------- | ----------- | ----------------------- |
| coach_game_perfect_playcalling | Perfect Playcalling | 🥇 Platinum | 0 turnovers, 35+ points |
| coach_game_comeback_master     | Comeback Master     | 🥇 Gold     | Win after trailing 14+  |

### Season-Level Examples

| ID                          | Name                 | Tier            | Requirement |
| --------------------------- | -------------------- | --------------- | ----------- |
| coach_season_coach_of_year  | Coach of the Year    | 💜 Hall of Fame | Awarded COY |
| coach_season_turnaround     | Franchise Turnaround | 🥇 Gold         | +5 wins YoY |
| coach_season_super_bowl_win | Super Bowl Champion  | 💜 Hall of Fame | Won SB      |

### Career-Level Examples

| ID                        | Name                  | Tier            | Requirement              |
| ------------------------- | --------------------- | --------------- | ------------------------ |
| coach_career_100_wins     | 100 Career Wins       | 🥇 Platinum     | 100+ wins                |
| coach_career_200_wins     | 200 Career Wins       | 💜 Hall of Fame | 200+ wins                |
| coach_career_3x_sb_titles | Dynasty Coach         | 🔴 Legendary    | 3+ Super Bowls           |
| coach_career_coach_tree   | Coaching Tree Builder | 💜 Hall of Fame | 3+ assistants became HCs |

---

## 📂 Data Source Mapping

| Entity      | Data Source                                         | Type                    |
| ----------- | --------------------------------------------------- | ----------------------- |
| Player      | `player_stats_*.parquet`                            | Aggregated stats        |
| Team        | `team_stats_*.parquet`, `franchise_history.parquet` | Aggregated / historical |
| Coach       | `coach_stats_*.parquet`, `awards_api`               | Aggregated / external   |
| EPA, Clutch | `pbp_2025.parquet`                                  | Advanced analytics      |
| Awards      | `nfl_honors_api`                                    | External feed           |

---

## 🧩 Backend Integration

### Flow

```
Raw Stats → Rule Engine → Badge Evaluator → player_badges / team_badges / coach_badges → REST API → UI
```

### Rule Engine Config (YAML)

```yaml
team_season_super_bowl_win:
  name: "Super Bowl Champion"
  category: "Team Season"
  tier: "Hall of Fame"
  data_source: "team_stats_2025.parquet"
  condition: "super_bowl_wins >= 1"
  metric: "super_bowl_wins"
  description: "Won Super Bowl that season"
```

### Evaluator Pseudocode

```python
def evaluate_badge(entity, stats, rule):
    value = stats.get(rule['metric'], 0)
    condition = rule['condition']
    earned = eval(str(value) + condition.split(rule['metric'])[1])
    return { 'earned': earned, 'progress': value }
```

---

## 🗄️ Database Schema

### Table: `badge_catalog`

| Field       | Type                          | Notes                  |
| ----------- | ----------------------------- | ---------------------- |
| badge_id    | VARCHAR                       | Unique key             |
| name        | VARCHAR                       | Badge name             |
| entity_type | ENUM('player','team','coach') | Owner type             |
| category    | VARCHAR                       | Game / Season / Career |
| tier        | VARCHAR                       | Legendary → Bronze     |
| data_source | VARCHAR                       | Source file/API        |
| metric      | VARCHAR                       | e.g., passing_yards    |
| condition   | TEXT                          | Rule string            |
| description | TEXT                          | Tooltip text           |

### Table: `entity_badges`

| Field       | Type      | Notes                     |
| ----------- | --------- | ------------------------- |
| id          | UUID      | Unique                    |
| entity_id   | UUID      | Player, team, or coach ID |
| badge_id    | VARCHAR   | FK to badge_catalog       |
| earned      | BOOL      | True if achieved          |
| progress    | FLOAT     | Stat progress             |
| threshold   | FLOAT     | Requirement value         |
| earned_date | TIMESTAMP | When earned               |

---

## 🌐 API Specification

### `GET /api/v1/badges/catalog`

Returns all badge definitions.

### `GET /api/v1/{entity}/{id}/badges`

Returns all badges earned and progress for a player/team/coach.

### `GET /api/v1/{entity}/{id}/badges/progress`

Returns near-complete badges (80–99%).

### `POST /api/v1/badges/sync`

Triggers a refresh of badge data for entities.

---

## 💻 Frontend Integration

### Components

* `Badge.tsx` → Visual component (icon, tier color)
* `BadgeGallery.tsx` → Grid display
* `BadgeTooltip.tsx` → Hover / tap info popup
* `ProgressTracker.tsx` → "Almost There" section

### Display Rules

* **Hero Section:** Top-tier badges only (Legendary / HOF)
* **Gallery:** All earned badges (sortable)
* **Progress Tracker:** 80–99% badges
* **Locked State:** Grayed-out with unlock hint

---

## 🚀 Future Expansion

| Direction                    | Description                                   |
| ---------------------------- | --------------------------------------------- |
| **Fantasy Integration**      | Tie badges to fantasy performance             |
| **Fan Interaction**          | Allow fan votes to create social badges       |
| **AI Performance Insights**  | Use ML to predict badge progression           |
| **Cross-Entity Meta Badges** | Combine player + coach + team accomplishments |

---

**Total Ecosystem:** ~170 badges across all entities.
**Shared Tier System:** Legendary → Standard.
**Backend Coverage:** 75% data available via existing pipelines.
**Ready for Implementation:** ✅ Weeks 1–5 rollout structure aligns with prior phases.

---

**End of Document — NFL Badge Ecosystem**
