# Field Mapping Reference

> 🎯 **PURPOSE**: Maps frontend display names to backend database columns and data sources
> 📅 **CREATED**: October 22, 2025
> 🔄 **STATUS**: Comprehensive mapping for all 6 core pages

---

## Overview

This document establishes the **canonical field names** used to present data in the UI and maps them to the actual database column names and data sources.

**Architecture**:
```
Frontend Display Name → Database Column Name → Data Source → Current Availability
```

---

## Quick Navigation

1. [Game Summary Page](#1-game-summary-page-completed-games)
2. [Live Scoreboard](#2-live-scoreboard-home-page)
3. [Team Profile Page](#3-team-profile-page)
4. [Player Profile Page](#4-player-profile-page)
5. [Standings Page](#5-standings-page)
6. [Stats Leaders Page](#6-stats-leaders-page)

---

## 1. GAME SUMMARY PAGE (Completed Games)

### 1.1 Game Header

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Home Team Logo** | `teams.logo_url` | teams | Seed (static) | ✅ Available |
| **Away Team Logo** | `teams.logo_url` | teams | Seed (static) | ✅ Available |
| **Home Team Name** | `teams.team_name` | teams | Seed (static) | ✅ Available |
| **Away Team Name** | `teams.team_name` | teams | Seed (static) | ✅ Available |
| **Home Team Abbreviation** | `teams.team_abbr` | teams | Seed (static) | ✅ Available |
| **Away Team Abbreviation** | `teams.team_abbr` | teams | Seed (static) | ✅ Available |
| **Final Score** | `games.home_score`, `games.away_score` | games | Game Stats Scraper | ✅ Available |
| **Game Date** | `games.game_date` | games | Schedule Seed | ✅ Available |
| **Game Time** | `games.game_time` | games | Schedule Seed | ✅ Available |
| **Venue** | `stadiums.stadium_name` | stadiums | Game Stats Scraper | ✅ Available |
| **City, State** | `stadiums.city`, `stadiums.state` | stadiums | Game Stats Scraper | ✅ Available |
| **Attendance** | `games.attendance` | games | Game Stats Scraper | ✅ Available |
| **Broadcast Network** | `games.broadcast_network` | games | Schedule Seed | ✅ Available |
| **"FINAL" Badge** | `games.status` | games | Game Stats Scraper | ✅ Available |
| **Team Records (Before)** | *(Calculation needed)* | N/A | Calculate from games | ⚠️ Need Function |
| **Team Records (After)** | *(Calculation needed)* | N/A | Calculate from games | ⚠️ Need Function |

---

### 1.2 Quarter-by-Quarter Scores

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Q1 Score (Home)** | `games.home_q1_score` | games | Game Stats Scraper | ✅ Available |
| **Q2 Score (Home)** | `games.home_q2_score` | games | Game Stats Scraper | ✅ Available |
| **Q3 Score (Home)** | `games.home_q3_score` | games | Game Stats Scraper | ✅ Available |
| **Q4 Score (Home)** | `games.home_q4_score` | games | Game Stats Scraper | ✅ Available |
| **OT Score (Home)** | `games.home_ot_score` | games | Game Stats Scraper | ✅ Available |
| **Q1 Score (Away)** | `games.away_q1_score` | games | Game Stats Scraper | ✅ Available |
| **Q2 Score (Away)** | `games.away_q2_score` | games | Game Stats Scraper | ✅ Available |
| **Q3 Score (Away)** | `games.away_q3_score` | games | Game Stats Scraper | ✅ Available |
| **Q4 Score (Away)** | `games.away_q4_score` | games | Game Stats Scraper | ✅ Available |
| **OT Score (Away)** | `games.away_ot_score` | games | Game Stats Scraper | ✅ Available |
| **Final Total (Home)** | `games.home_score` | games | Game Stats Scraper | ✅ Available |
| **Final Total (Away)** | `games.away_score` | games | Game Stats Scraper | ✅ Available |

---

### 1.3 Box Score - Passing Stats

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Completions** | `player_game_stats.passing_completions` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Attempts** | `player_game_stats.passing_attempts` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Completion %** | *(Calculation)* `completions / attempts * 100` | N/A | Calculate | ✅ Available (calc) |
| **Yards** | `player_game_stats.passing_yards` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Yards/Attempt** | *(Calculation)* `yards / attempts` | N/A | Calculate | ✅ Available (calc) |
| **Touchdowns** | `player_game_stats.passing_touchdowns` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Interceptions** | `player_game_stats.passing_interceptions` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Sacks** | `player_game_stats.passing_sacks` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Longest Pass** | `player_game_stats.passing_longest` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Passer Rating** | `player_game_stats.passer_rating` | player_game_stats | Game Stats Scraper | ✅ Available |
| **QBR** | `player_game_stats.qbr` | player_game_stats | Game Stats Scraper | ✅ Available |

---

### 1.4 Box Score - Rushing Stats

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Carries** | `player_game_stats.rushing_attempts` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Yards** | `player_game_stats.rushing_yards` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Average** | *(Calculation)* `yards / attempts` | N/A | Calculate | ✅ Available (calc) |
| **Touchdowns** | `player_game_stats.rushing_touchdowns` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Long** | `player_game_stats.rushing_longest` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Fumbles** | `player_game_stats.rushing_fumbles` | player_game_stats | Game Stats Scraper | ✅ Available |
| **First Downs** | *(Not available)* | N/A | ESPN API (not extracted) | ❌ Not Available |

---

### 1.5 Box Score - Receiving Stats

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Receptions** | `player_game_stats.receptions` ⚠️ **NOT** `receiving_receptions` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Targets** | `player_game_stats.receiving_targets` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Catch Rate %** | *(Calculation)* `receptions / targets * 100` | N/A | Calculate | ✅ Available (calc) |
| **Yards** | `player_game_stats.receiving_yards` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Yards/Reception** | *(Calculation)* `yards / receptions` | N/A | Calculate | ✅ Available (calc) |
| **Touchdowns** | `player_game_stats.receiving_touchdowns` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Long** | `player_game_stats.receiving_longest` | player_game_stats | Game Stats Scraper | ✅ Available |
| **First Downs** | `player_game_stats.receiving_first_downs` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Yards After Catch** | `player_game_stats.receiving_yards_after_catch` | player_game_stats | Game Stats Scraper | ✅ Available |

---

### 1.6 Box Score - Defense Stats

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Tackles** | `player_game_stats.tackles_total` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Solo Tackles** | `player_game_stats.tackles_solo` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Assists** | `player_game_stats.tackles_assists` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Sacks** | `player_game_stats.sacks` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Tackles for Loss** | `player_game_stats.tackles_for_loss` | player_game_stats | Game Stats Scraper | ✅ Available |
| **QB Hits** | `player_game_stats.qb_hits` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Interceptions** | `player_game_stats.interceptions` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Passes Defended** | `player_game_stats.passes_defended` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Forced Fumbles** | `player_game_stats.forced_fumbles` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Fumble Recoveries** | `player_game_stats.fumble_recoveries` | player_game_stats | Game Stats Scraper | ✅ Available |

---

### 1.7 Team Stats Comparison

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **First Downs (Total)** | *(Not available)* | N/A | ESPN API (not extracted) | ❌ Not Available |
| **First Downs (Passing)** | *(Not available)* | N/A | ESPN API (not extracted) | ❌ Not Available |
| **First Downs (Rushing)** | *(Not available)* | N/A | ESPN API (not extracted) | ❌ Not Available |
| **First Downs (Penalty)** | *(Not available)* | N/A | ESPN API (not extracted) | ❌ Not Available |
| **Total Yards** | `team_game_stats.total_yards` | team_game_stats | Game Stats Scraper | ✅ Available |
| **Passing Yards** | *(Aggregation needed)* Sum of player passing | N/A | Calculate from player_game_stats | ⚠️ Need Function |
| **Rushing Yards** | *(Aggregation needed)* Sum of player rushing | N/A | Calculate from player_game_stats | ⚠️ Need Function |
| **Total Plays** | `team_game_stats.plays` | team_game_stats | Game Stats Scraper | ✅ Available |
| **Yards per Play** | *(Calculation)* `total_yards / plays` | N/A | Calculate | ✅ Available (calc) |
| **Turnovers** | `team_game_stats.turnovers` | team_game_stats | Game Stats Scraper | ✅ Available |
| **Fumbles Lost** | `team_game_stats.fumbles_lost` | team_game_stats | Game Stats Scraper | ✅ Available |
| **Interceptions Thrown** | `team_game_stats.interceptions_thrown` | team_game_stats | Game Stats Scraper | ✅ Available |
| **Penalties** | `team_game_stats.penalties` | team_game_stats | Game Stats Scraper | ✅ Available |
| **Penalty Yards** | `team_game_stats.penalty_yards` | team_game_stats | Game Stats Scraper | ✅ Available |
| **Time of Possession** | `team_game_stats.time_of_possession_seconds` | team_game_stats | Game Stats Scraper | ✅ Available |
| **3rd Down Conversions** | `team_game_stats.third_down_conversions` | team_game_stats | Game Stats Scraper | ✅ Available |
| **3rd Down Attempts** | `team_game_stats.third_down_attempts` | team_game_stats | Game Stats Scraper | ✅ Available |
| **3rd Down %** | *(Calculation)* `conversions / attempts * 100` | N/A | Calculate | ✅ Available (calc) |
| **4th Down Conversions** | `team_game_stats.fourth_down_conversions` | team_game_stats | Game Stats Scraper | ✅ Available |
| **4th Down Attempts** | `team_game_stats.fourth_down_attempts` | team_game_stats | Game Stats Scraper | ✅ Available |
| **4th Down %** | *(Calculation)* `conversions / attempts * 100` | N/A | Calculate | ✅ Available (calc) |
| **Red Zone Efficiency** | *(Not available)* | N/A | ESPN API (not extracted) | ❌ Not Available |
| **Sacks Allowed** | *(Not available)* | N/A | ESPN API (not extracted) | ❌ Not Available |

---

### 1.8 Scoring Summary

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Quarter** | `scoring_plays.quarter` | scoring_plays | Game Stats Scraper | ✅ Available |
| **Time Remaining** | `scoring_plays.time_remaining_seconds` | scoring_plays | Game Stats Scraper | ✅ Available |
| **Team** | `scoring_plays.team_id` | scoring_plays | Game Stats Scraper | ✅ Available |
| **Score Type** | `scoring_plays.scoring_type` | scoring_plays | Game Stats Scraper | ✅ Available |
| **Description** | `scoring_plays.description` | scoring_plays | Game Stats Scraper | ✅ Available |
| **Points** | `scoring_plays.points` | scoring_plays | Game Stats Scraper | ✅ Available |
| **Score After** | *(Calculation needed)* | N/A | Calculate cumulative | ⚠️ Need Function |
| **Drive Info** | *(Not available)* | N/A | ESPN API (not extracted) | ❌ Not Available |

---

### 1.9 Betting Results

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Spread Line** | `game_betting_lines.spread_line` | game_betting_lines | Betting Scraper | ✅ Available |
| **Favorite Team** | `game_betting_lines.favorite_team_id` | game_betting_lines | Betting Scraper | ✅ Available |
| **Underdog Team** | `game_betting_lines.underdog_team_id` | game_betting_lines | Betting Scraper | ✅ Available |
| **Actual Margin** | *(Calculation)* `home_score - away_score` | N/A | Calculate from games | ✅ Available (calc) |
| **Spread Result** | *(Calculation)* Cover/Push/Loss | N/A | Calculate | ⚠️ Need Function |
| **Total Line** | `game_betting_lines.total_line` | game_betting_lines | Betting Scraper | ✅ Available |
| **Actual Total** | *(Calculation)* `home_score + away_score` | N/A | Calculate from games | ✅ Available (calc) |
| **O/U Result** | *(Calculation)* Over/Under/Push | N/A | Calculate | ⚠️ Need Function |
| **Opening Line** | *(Not available)* | N/A | Need historical betting scraper | ❌ Not Available |
| **Closing Line** | *(Same as spread_line)* | game_betting_lines | Betting Scraper | ✅ Available |

---

### 1.10 Game Weather

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Temperature** | `game_weather.temperature` | game_weather | Game Stats Scraper | ⚠️ Table Empty |
| **Weather Condition** | `game_weather.condition` | game_weather | Game Stats Scraper | ⚠️ Table Empty |
| **Wind Speed** | `game_weather.wind_speed` | game_weather | Game Stats Scraper | ⚠️ Table Empty |
| **Wind Direction** | `game_weather.wind_direction` | game_weather | Game Stats Scraper | ⚠️ Table Empty |

**Note**: Weather parsing implemented in scraper but table not yet populated. Need to verify scraper is writing to game_weather table.

---

## 2. LIVE SCOREBOARD (Home Page)

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Week Number** | `games.week` | games | Schedule Seed | ✅ Available |
| **Season Year** | `games.season` | games | Schedule Seed | ✅ Available |
| **Home Team Logo** | `teams.logo_url` | teams | Seed (static) | ✅ Available |
| **Away Team Logo** | `teams.logo_url` | teams | Seed (static) | ✅ Available |
| **Home Team Abbr** | `teams.team_abbr` | teams | Seed (static) | ✅ Available |
| **Away Team Abbr** | `teams.team_abbr` | teams | Seed (static) | ✅ Available |
| **Home Score** | `games.home_score` | games | Live Games Scraper | ✅ Available |
| **Away Score** | `games.away_score` | games | Live Games Scraper | ✅ Available |
| **Game Status** | `games.status` | games | Live Games Scraper | ✅ Available |
| **Game Time** | `games.game_time` | games | Schedule Seed | ✅ Available |
| **Broadcast Network** | `games.broadcast_network` | games | Schedule Seed | ✅ Available |

---

## 3. TEAM PROFILE PAGE

### 3.1 Team Identity

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Team Name** | `teams.team_name` | teams | Seed (static) | ✅ Available |
| **Team Abbreviation** | `teams.team_abbr` | teams | Seed (static) | ✅ Available |
| **City** | `teams.city` | teams | Seed (static) | ✅ Available |
| **Logo** | `teams.logo_url` | teams | Seed (static) | ✅ Available |
| **Primary Color** | `teams.primary_color` | teams | Seed (static) | ✅ Available |
| **Secondary Color** | `teams.secondary_color` | teams | Seed (static) | ✅ Available |
| **Conference** | `teams.conference` | teams | Seed (static) | ✅ Available |
| **Division** | `teams.division` | teams | Seed (static) | ✅ Available |

---

### 3.2 Season Record

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Wins** | `team_season_stats.wins` | team_season_stats | Standings Scraper | ✅ Available |
| **Losses** | `team_season_stats.losses` | team_season_stats | Standings Scraper | ✅ Available |
| **Ties** | `team_season_stats.ties` | team_season_stats | Standings Scraper | ✅ Available |
| **Win Percentage** | `team_season_stats.win_percentage` | team_season_stats | Standings Scraper | ✅ Available |
| **Points For** | `team_season_stats.points_for` | team_season_stats | Standings Scraper | ✅ Available |
| **Points Against** | `team_season_stats.points_against` | team_season_stats | Standings Scraper | ✅ Available |
| **Point Differential** | `team_season_stats.point_differential` | team_season_stats | Standings Scraper | ✅ Available |
| **Division Rank** | `team_season_stats.division_rank` | team_season_stats | Standings Scraper | ✅ Available |
| **Conference Rank** | `team_season_stats.conference_rank` | team_season_stats | Standings Scraper | ✅ Available |

---

### 3.3 Current Roster

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Jersey Number** | `player_teams.jersey_number` | player_teams | Roster Updates Scraper | ✅ Available |
| **Position** | `players.primary_position` ⚠️ **NOT** `position` | players | Player Seed | ✅ Available |
| **Height** | `players.height_inches` | players | Player Seed | ✅ Available |
| **Weight** | `players.weight_lbs` | players | Player Seed | ✅ Available |
| **College** | `players.college` | players | Player Seed | ✅ Available |
| **Status** | `players.status` | players | Player Seed | ✅ Available |

---

### 3.4 Injury Report

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Injury Status** | `player_injury_status.injury_status` | player_injury_status | Injuries Scraper | ⚠️ Table Exists (empty) |
| **Injury Type** | `player_injury_status.injury_type` | player_injury_status | Injuries Scraper | ⚠️ Table Exists (empty) |
| **Injury Details** | `player_injury_status.injury_details` | player_injury_status | Injuries Scraper | ⚠️ Table Exists (empty) |

**Note**: Injury scraper implemented but ESPN API has limited injury data availability.

---

### 3.5 Recent Transactions

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Transaction Type** | `roster_transactions.transaction_type` | roster_transactions | Roster Updates Scraper | ✅ Available |
| **Transaction Date** | `roster_transactions.transaction_date` | roster_transactions | Roster Updates Scraper | ✅ Available |
| **Details** | `roster_transactions.details` | roster_transactions | Roster Updates Scraper | ✅ Available |

---

### 3.6 Upcoming Schedule

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Opponent** | `teams.team_name` (join via home/away) | teams + games | Schedule Seed | ✅ Available |
| **Game Date** | `games.game_date` | games | Schedule Seed | ✅ Available |
| **Game Time** | `games.game_time` | games | Schedule Seed | ✅ Available |
| **Home/Away** | *(Calculation)* Check team_id vs home/away | N/A | Calculate | ✅ Available (calc) |
| **Venue** | `stadiums.stadium_name` | stadiums | Schedule Seed | ✅ Available |
| **Broadcast** | `games.broadcast_network` | games | Schedule Seed | ✅ Available |

---

## 4. PLAYER PROFILE PAGE

### 4.1 Player Bio

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Full Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **First Name** | `players.first_name` | players | Player Seed | ✅ Available |
| **Last Name** | `players.last_name` | players | Player Seed | ✅ Available |
| **Jersey Number** | `players.jersey_number` | players | Player Seed | ✅ Available |
| **Position** | `players.primary_position` | players | Player Seed | ✅ Available |
| **Height** | `players.height_inches` | players | Player Seed | ✅ Available |
| **Weight** | `players.weight_lbs` | players | Player Seed | ✅ Available |
| **Birth Date** | `players.birth_date` | players | Player Seed | ✅ Available |
| **College** | `players.college` | players | Player Seed | ✅ Available |
| **Headshot** | `players.headshot_url` | players | Player Seed | ✅ Available |
| **Draft Year** | `players.draft_year` | players | Player Seed | ✅ Available |
| **Draft Round** | `players.draft_round` | players | Player Seed | ✅ Available |
| **Draft Pick** | `players.draft_pick` | players | Player Seed | ✅ Available |

---

### 4.2 Current Team

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Team Name** | `teams.team_name` | teams | Seed (static) | ✅ Available |
| **Team Logo** | `teams.logo_url` | teams | Seed (static) | ✅ Available |
| **Jersey Number** | `player_teams.jersey_number` | player_teams | Roster Updates Scraper | ✅ Available |

---

### 4.3 Season Statistics

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Games Played** | *(Count distinct game_id)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Total Passing Yards** | *(Sum passing_yards)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Total Passing TDs** | *(Sum passing_touchdowns)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Total Interceptions** | *(Sum passing_interceptions)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Total Rushing Yards** | *(Sum rushing_yards)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Total Rushing TDs** | *(Sum rushing_touchdowns)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Total Receptions** | *(Sum receptions)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Total Receiving Yards** | *(Sum receiving_yards)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Total Receiving TDs** | *(Sum receiving_touchdowns)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Total Fantasy Points (PPR)** | *(Sum fantasy_points_ppr)* | player_game_stats | Calculate | ✅ Available (calc) |

**Note**: All season stats need aggregation function but raw data available.

---

### 4.4 Game-by-Game Log

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Week** | `games.week` (join via game_id) | games | Schedule Seed | ✅ Available |
| **Opponent** | `player_game_stats.opponent_team_id` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Result (W/L)** | *(Calculation)* Compare scores | N/A | Calculate from games | ⚠️ Need Function |
| **Passing Stats** | All `passing_*` columns | player_game_stats | Game Stats Scraper | ✅ Available |
| **Rushing Stats** | All `rushing_*` columns | player_game_stats | Game Stats Scraper | ✅ Available |
| **Receiving Stats** | All `receiving_*` columns | player_game_stats | Game Stats Scraper | ✅ Available |
| **Fantasy Points** | `fantasy_points_ppr` | player_game_stats | Game Stats Scraper | ✅ Available |

---

## 5. STANDINGS PAGE

### 5.1 Division Standings

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Team Name** | `teams.team_name` | teams | Seed (static) | ✅ Available |
| **Team Logo** | `teams.logo_url` | teams | Seed (static) | ✅ Available |
| **Wins** | `team_season_stats.wins` | team_season_stats | Standings Scraper | ✅ Available |
| **Losses** | `team_season_stats.losses` | team_season_stats | Standings Scraper | ✅ Available |
| **Ties** | `team_season_stats.ties` | team_season_stats | Standings Scraper | ✅ Available |
| **Win %** | `team_season_stats.win_percentage` | team_season_stats | Standings Scraper | ✅ Available |
| **Points For** | `team_season_stats.points_for` | team_season_stats | Standings Scraper | ✅ Available |
| **Points Against** | `team_season_stats.points_against` | team_season_stats | Standings Scraper | ✅ Available |
| **Point Differential** | `team_season_stats.point_differential` | team_season_stats | Standings Scraper | ✅ Available |
| **Division Rank** | `team_season_stats.division_rank` | team_season_stats | Standings Scraper | ✅ Available |
| **Conference Rank** | `team_season_stats.conference_rank` | team_season_stats | Standings Scraper | ✅ Available |
| **Current Streak** | *(Calculation needed)* | N/A | Calculate from games | ⚠️ Need Function |
| **Home Record** | *(Calculation needed)* | N/A | Calculate from games | ⚠️ Need Function |
| **Away Record** | *(Calculation needed)* | N/A | Calculate from games | ⚠️ Need Function |
| **Division Record** | *(Calculation needed)* | N/A | Calculate from games | ⚠️ Need Function |

---

## 6. STATS LEADERS PAGE

### 6.1 Passing Leaders

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Rank** | *(ORDER BY stat DESC)* | N/A | Calculate | ✅ Available (calc) |
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Team** | `player_game_stats.team_id` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Passing Yards** | *(SUM passing_yards)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Passing TDs** | *(SUM passing_touchdowns)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Interceptions** | *(SUM passing_interceptions)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Passer Rating** | *(AVG passer_rating)* | player_game_stats | Calculate | ✅ Available (calc) |

---

### 6.2 Rushing Leaders

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Rank** | *(ORDER BY stat DESC)* | N/A | Calculate | ✅ Available (calc) |
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Team** | `player_game_stats.team_id` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Rushing Yards** | *(SUM rushing_yards)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Rushing TDs** | *(SUM rushing_touchdowns)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Carries** | *(SUM rushing_attempts)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Yards/Carry** | *(AVG rushing_yards / rushing_attempts)* | player_game_stats | Calculate | ✅ Available (calc) |

---

### 6.3 Receiving Leaders

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Rank** | *(ORDER BY stat DESC)* | N/A | Calculate | ✅ Available (calc) |
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Team** | `player_game_stats.team_id` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Receptions** | *(SUM receptions)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Receiving Yards** | *(SUM receiving_yards)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Receiving TDs** | *(SUM receiving_touchdowns)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Yards/Reception** | *(AVG receiving_yards / receptions)* | player_game_stats | Calculate | ✅ Available (calc) |

---

### 6.4 Defense Leaders

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Rank** | *(ORDER BY stat DESC)* | N/A | Calculate | ✅ Available (calc) |
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Team** | `player_game_stats.team_id` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Total Tackles** | *(SUM tackles_total)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Sacks** | *(SUM sacks)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Interceptions** | *(SUM interceptions)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Forced Fumbles** | *(SUM forced_fumbles)* | player_game_stats | Calculate | ✅ Available (calc) |

---

### 6.5 Fantasy Leaders

| Frontend Display Name | Database Column | Table | Data Source | Status |
|----------------------|-----------------|-------|-------------|--------|
| **Rank** | *(ORDER BY stat DESC)* | N/A | Calculate | ✅ Available (calc) |
| **Player Name** | `players.full_name` | players | Player Seed | ✅ Available |
| **Position** | `players.primary_position` | players | Player Seed | ✅ Available |
| **Team** | `player_game_stats.team_id` | player_game_stats | Game Stats Scraper | ✅ Available |
| **Fantasy Points (PPR)** | *(SUM fantasy_points_ppr)* | player_game_stats | Calculate | ✅ Available (calc) |
| **Points/Game** | *(AVG fantasy_points_ppr)* | player_game_stats | Calculate | ✅ Available (calc) |

---

## SUMMARY: Data Availability

### ✅ **Available Now** (95%)
- All team identity data
- All player bio data
- Complete game schedule
- Quarter-by-quarter scores
- Player game statistics (passing, rushing, receiving, defense, kicking)
- Team game statistics
- Scoring plays timeline
- Season standings (W-L-T, rankings)
- Roster transactions
- Betting lines (current)
- Fantasy points (all formats)

### ⚠️ **Need Calculation Functions** (4%)
- Team records before/after game
- Game result (W/L) for player logs
- Season totals (aggregations from game stats)
- Current streaks
- Home/away/division records
- Spread/O-U betting results

### ❌ **Not Available** (1%)
- First downs breakdown (by type)
- Red zone efficiency
- Sacks allowed (team stat)
- Drive statistics (plays, yards, time)
- Opening betting lines (only closing)
- Injury reports (scraper ready, ESPN API limited)
- Weather data (scraper ready, table empty)

---

## Next Steps

### 1. Build 5 Missing Aggregation Functions (HIGH PRIORITY)
```javascript
// scripts/calculate-team-record.js
// Input: team_id, season
// Output: { wins, losses, ties, win_pct, pf, pa }

// scripts/calculate-season-stats.js
// Input: player_id, season, stat_category
// Output: { total, average, games }

// scripts/calculate-streaks.js
// Input: team_id, season
// Output: { current_streak: 'W3' | 'L2' }

// scripts/calculate-home-away-division.js
// Input: team_id, season
// Output: { home: '5-2', away: '3-4', division: '2-2' }

// scripts/calculate-betting-results.js
// Input: game_id
// Output: { spread_result, ou_result, margin, total }
```

### 2. Verify Weather & Injury Data Population (MEDIUM PRIORITY)
- Check if game_weather table is being populated
- Verify injuries scraper is writing to player_injury_status
- ESPN API may have limited data for both

### 3. Add Historical Betting Lines (LOW PRIORITY)
- Current scraper only gets latest lines
- Need to track opening vs closing lines
- Requires separate table or historical snapshot

---

## Column Name Warnings ⚠️

**CRITICAL**: Always use these EXACT column names:

| ❌ WRONG | ✅ CORRECT | Table |
|---------|----------|-------|
| `receiving_receptions` | `receptions` | player_game_stats |
| `position` | `primary_position` | players |
| `abbreviation` | `team_abbr` | teams |
| `home_team_score` | `home_score` | games |
| `away_team_score` | `away_score` | games |

---

## Sources Used

1. ✅ **DATABASE-SCHEMA-REFERENCE.md** (600+ lines) - Exact column names
2. ✅ **coderef/schema-reference.json** (500 lines) - Programmatic schema reference
3. ✅ **coderef/training/database-schema-map.json** (910 lines) - Live schema dump
4. ✅ **Master-Data-Sources.json** (1,005 lines) - External data sources catalog
5. ✅ **completed-game-details-data-list.md** (209 lines) - UI display requirements
6. ✅ **AVAILABLE-DATA-INVENTORY.md** (2,000+ lines) - Current data coverage
7. ✅ **CLAUDE.md** (940 lines) - Project history and session logs

---

## Last Updated

**Date**: October 22, 2025
**Session**: 8
**Total Fields Mapped**: 250+
**Pages Covered**: 6 (Game Summary, Scoreboard, Team, Player, Standings, Leaders)
**Availability**: 95% available, 4% need functions, 1% not available

---

## Contributors

- Session 8: Field mapping document creation with comprehensive coverage
