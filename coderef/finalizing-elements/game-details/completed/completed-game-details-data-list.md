# Completed Game - Data List (At-a-Glance)

**Game Type:** Final / Post-Game
**Update Frequency:** Static (updated once after game ends)
**User Context:** Reviewing results, analyzing performance, researching season trends

---

## P0 - Must-Have Content

### 1. Final Game Header
- Teams (logos, names, abbreviations)
- Final score (winner highlighted)
- Records before/after game (e.g., 10-5 → 11-5)
- Date, time, venue, attendance
- Broadcast network
- "FINAL" badge

**Data Sources:** schedules table, teams table

---

### 2. Final Score Breakdown
- Quarter-by-quarter scoring table (Q1, Q2, Q3, Q4, OT, Total)
- Winner's row highlighted

**Data Sources:** schedules table (quarter scores)

---

### 3. Complete Box Score - Passing
- Player name, completions/attempts, completion %, yards, YPA, TDs, INTs, sacks, longest pass, passer rating, QBR
- Highlight: 300+ yard games, 3+ TDs
- Color-coded passer rating (>100=green, <70=red)

**Data Sources:** nflreadpy play-by-play, player_stats table

---

### 4. Complete Box Score - Rushing
- Player name, carries, yards, average, TDs, long, fumbles, first downs
- Highlight: 100+ yard games, 2+ TDs

**Data Sources:** nflreadpy play-by-play, player_stats table

---

### 5. Complete Box Score - Receiving
- Player name, receptions, targets, catch rate, yards, YPR, TDs, long, first downs
- Highlight: 100+ yard games, 2+ TDs

**Data Sources:** nflreadpy play-by-play, player_stats table

---

### 6. Complete Box Score - Defense
- Player name, tackles, assists, sacks, TFL, interceptions, passes defended, forced fumbles, fumble recoveries
- Highlight: 2+ sacks, interceptions

**Data Sources:** nflreadpy play-by-play, player_stats table

---

### 7. Final Team Stats Comparison
- Side-by-side comparison: first downs (by type), total yards, passing/rushing yards, plays, yards per play, turnovers, penalties, time of possession, 3rd/4th down conversion %, red zone efficiency, sacks allowed
- Winner's column highlighted
- Stat differentials shown (e.g., +120 yards)

**Data Sources:** nflreadpy play-by-play (calculate from all plays), schedules table

---

## P1 - Important Content

### 8. Complete Scoring Summary
- Chronological timeline of all scoring plays
- Quarter, time, team, score type (TD/FG/safety), description, yards (drive/FG distance)
- Score differential after each play
- Drive info (plays, yards, time)

**Data Sources:** nflreadpy play-by-play (filter scoring plays)

---

### 9. Season Context & Playoff Implications
- Playoff status (clinched/in hunt/eliminated)
- Division standing (1-4), conference standing (1-16)
- Playoff probability (if available)
- Current streak (e.g., W3, L2)
- Home/away/division records
- Season series summary (e.g., "Series tied 1-1")

**Data Sources:** schedules table (calculate standings, streaks), season_stats table

---

### 10. Final Betting Results
- Spread: opening/closing line, favorite, actual margin, result (covered/push)
- Total: opening/closing line, actual total, result (over/under/push)
- Moneyline: odds, winner

**Data Sources:** schedules table (lines), calculate results from final score

---

### 11. Player Milestones & Achievements
- Career/season/game milestones (e.g., "300th career TD", "First 100-yard game")
- Player name, team, achievement description
- Badge for each milestone

**Data Sources:** player_stats table (calculate career/season totals), logic to detect milestones

---

### 12. Historical Comparisons
- Head-to-head all-time record
- Record at this venue
- Previous meeting this season (if any)
- Similar games (same records, playoff implications)

**Data Sources:** schedules table (historical), logic to find similar matchups

---

## P2 - Nice-to-Have Content

### 13. Complete Play-by-Play
- Drive-by-drive breakdown
- Every play: quarter, time, down/distance, yardline, possession team, play type, description, yards gained, scoring/turnover/penalty flags
- Collapsible, searchable, filterable
- Export to CSV option

**Data Sources:** nflreadpy play-by-play (every single play)

---

### 14. Game Information & Details
- **Weather:** temperature, condition, wind speed/direction
- **Officials:** referee, umpire, judges
- **Broadcast:** network, announcers, viewership ratings

**Data Sources:** nflreadpy schedules (weather, officials), ESPN API (broadcast)

---

### 15. Advanced Analytics
- Win probability chart (full game, line graph)
- EPA summary (total/passing/rushing by team)
- Success rate percentages
- Explosive plays count (plays > 20 yards)

**Data Sources:** nflreadpy play-by-play (EPA, WP for every play)

---

### 16. Video Highlights & Media
- Highlight video thumbnails and links
- Key play videos with impact notes
- Post-game interviews (coaches, players)
- Click to watch inline

**Data Sources:** ESPN API (video highlights), manual curation (interviews)

---

## Navigation Structure

**8 Sub-Tabs:**
1. **Game Summary** - Header, score breakdown, season context, betting results
2. **Box Score** - All 4 player stat categories (passing, rushing, receiving, defense)
3. **Team Stats** - Final team stats comparison
4. **Scoring Summary** - Chronological scoring timeline
5. **Play-by-Play** - Complete drive-by-drive breakdown (P2)
6. **Game Info** - Officials, weather, broadcast (P2)
7. **Advanced** - Win probability, EPA, success rate (P2)
8. **Videos** - Highlights and interviews (P2)

---

## Caching Strategy

- **P0/P1 Data:** 24 hours (may be corrected, but rarely changes)
- **Season context:** 1 hour (standings may shift)
- **Betting results:** Permanent (never changes)
- **Play-by-play:** Permanent (never changes after game ends)
- **Video highlights:** 6 hours (new videos may be added)

---

## Progressive Loading

1. **Initial Load (<1s):** Final score, game header, score breakdown, team stats
2. **Secondary Load (1-2s):** Box scores, scoring summary, season context
3. **Tertiary Load (2-3s):** Betting results, milestones, historical comparisons, advanced analytics
4. **On-Demand:** Play-by-play (when tab clicked), video highlights (when section expanded)

---

## Key Features

✅ **Season Trends:** Playoff implications, streaks, standing changes
✅ **Player Milestones:** Auto-detect career/season achievements
✅ **Historical Context:** Head-to-head records, similar games
✅ **Betting Results:** Spread/total outcomes with opening/closing lines
✅ **Complete Stats:** Every player, every stat category
✅ **Advanced Analytics:** EPA, win probability, success rate
✅ **Export Options:** Download box score as PDF/CSV
✅ **Video Integration:** Highlights and interviews
