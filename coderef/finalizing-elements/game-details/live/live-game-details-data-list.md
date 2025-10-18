# Live Game - Data List (At-a-Glance)

**Game Type:** In-Progress / Live
**Update Frequency:** Real-time (every play, 5-15 second intervals)
**User Context:** Following live action, tracking bets, watching momentum shifts

---

## P0 - Must-Have Content

### 1. Game Header - Live Edition
- Teams (logos, names, abbreviations, colors)
- **Current score** (home/away, large display)
- **Game status:** "LIVE" badge (pulsing/animated)
- **Quarter/Period:** 1st, 2nd, 3rd, 4th, OT
- **Time remaining:** MM:SS (live countdown)
- **Possession:** Which team has the ball (visual indicator)
- **Down & Distance:** e.g., "2nd & 7"
- **Field position:** e.g., "SF 35"
- **Red zone indicator:** If team is inside 20-yard line

**Data Sources:** ESPN API (live endpoints), nflreadpy (real-time pbp)

---

### 2. Score Breakdown - Live Updating
- Quarter-by-quarter scoring table (Q1, Q2, Q3, Q4, OT, Total)
- Updates instantly after each score
- Leading team's row highlighted

**Data Sources:** ESPN API, nflreadpy (pbp data aggregation)

---

### 3. Live Drive Tracker
- **Current drive number**
- **Possessing team**
- **Drive start position** (e.g., "Own 25")
- **Current position** (e.g., "Opp 40")
- **Plays in drive:** Count
- **Yards gained:** Net yards
- **Time of possession:** MM:SS (for this drive)
- **Drive result:** Ongoing, TD, FG, Punt, Turnover, Downs

**Data Sources:** ESPN API (live drive data), nflreadpy (play aggregation)

---

### 4. Last Play Summary
- **Play description:** Full text (e.g., "Patrick Mahomes pass deep right to Travis Kelce for 23 yards")
- **Yards gained/lost:** +23, -5, etc.
- **Result:** First Down, Touchdown, Incomplete, Interception, etc.
- **Key players involved:** Passer, receiver, rusher, tackler
- **Clock time:** When play occurred (MM:SS)

**Data Sources:** ESPN API, nflreadpy (real-time pbp)

---

## P1 - Important Content

### 5. Play-by-Play Feed (Last 10-20 Plays)
- **Play number** (in game)
- **Quarter**
- **Time**
- **Down & Distance**
- **Field position**
- **Play description** (short version)
- **Yards gained**
- **Result icon** (✓ First Down, 🏈 TD, ❌ Incomplete, 🔄 Turnover)
- Auto-scrolls with new plays (prepend to top)

**Data Sources:** ESPN API, nflreadpy (pbp)

---

### 6. Live Box Score - Key Stats Only
**Passing (Top QBs):**
- Completions/Attempts, Yards, TDs, INTs, Rating

**Rushing (Top RBs):**
- Attempts, Yards, TDs, Long

**Receiving (Top WRs/TEs):**
- Receptions, Yards, TDs, Long

**Updates:** After each play or every 30-60 seconds

**Data Sources:** ESPN API (live stats), nflreadpy (aggregated pbp)

---

### 7. Live Team Stats Comparison
Side-by-side comparison:
- **Total yards** (offense)
- **Passing yards**
- **Rushing yards**
- **First downs**
- **Third down conversions** (X/Y, percentage)
- **Fourth down conversions**
- **Turnovers**
- **Time of possession** (MM:SS)
- **Penalties** (number / yards)

**Updates:** Every 30-60 seconds or after significant plays

**Data Sources:** ESPN API, nflreadpy (calculated from pbp)

---

### 8. Live Betting Lines (Real-Time Updates)
- **Live spread:** Adjusted based on current score and time
- **Live total:** Over/under adjustment
- **Live moneyline:** Current odds (if available)
- **Line movement indicator:** ↑ ↓ (compared to pre-game)
- **Last updated:** Timestamp

**Updates:** Every 15-30 seconds during live game

**Data Sources:** The Odds API (live endpoint)

---

## P2 - Nice-to-Have Content

### 9. Live Highlights / Recent Key Plays
- Highlight thumbnails (auto-generated)
- Play description
- Impact level (Game-Changing, Big Play, Notable)
- Video clip URL (if available)
- Updates after TDs, turnovers, big gains (20+ yards)

**Data Sources:** ESPN API (highlights endpoint), YouTube API (potential)

---

### 10. Live Win Probability Chart
- **Current win probability:** Home vs Away (0-100%)
- **Chart data:** Line graph showing WP over time (by play)
- **Key moments highlighted:** Turnovers, TDs, 4th down conversions
- Updates after each play

**Data Sources:** nflreadpy (wp column in pbp data), ESPN API

---

### 11. Live EPA (Expected Points Added)
- **Cumulative EPA:** Home vs Away (bar chart)
- **EPA for last play**
- **EPA trend:** Chart showing EPA accumulation over game
- Updates after each play

**Data Sources:** nflreadpy (epa column in pbp data)

---

## Navigation Structure

**4 Live Tabs:**
1. **Live Feed** - Current score, possession, last play, recent plays (P0)
2. **Box Score** - Live player stats (passing, rushing, receiving) (P1)
3. **Team Stats** - Live team comparison (P1)
4. **Advanced** - Win probability chart, EPA, live betting lines (P1/P2)

---

## Real-Time Update Strategy

### WebSocket vs Polling
**Recommendation:** Hybrid approach
- **WebSocket:** For play-by-play updates (ESPN may offer WebSocket endpoints)
- **Polling:** For live stats, betting lines (every 15-30 seconds)

### Polling Intervals
| Data Element | Interval |
|--------------|----------|
| Game Header / Score | 10-15 seconds |
| Play-by-Play Feed | 5-10 seconds (or WebSocket) |
| Box Score Stats | 30 seconds |
| Team Stats | 30-60 seconds |
| Betting Lines | 15-30 seconds |
| Win Probability | After each play (via pbp update) |

---

## Caching Strategy (Redis)

- **Live game state:** 10-second TTL
- **Box score stats:** 30-second TTL
- **Team stats:** 60-second TTL
- **Play-by-play feed:** 5-second TTL
- **Invalidate cache on new play detection**

---

## Progressive Loading

1. **Initial Load (<1s):** Game header, current score, possession, down/distance
2. **Secondary Load (1-2s):** Score breakdown, last play summary, live drive tracker
3. **Tertiary Load (2-3s):** Recent plays feed, live box score, team stats
4. **On-Demand:** Win probability chart, EPA (when Advanced tab clicked)

---

## Mobile Optimization

### Priority on Small Screens
- **Above fold:** Current score, quarter, time, possession, down & distance
- **Sticky header:** Score stays visible when scrolling
- **Compact stats:** Key stats only (total yards, turnovers, time of possession)
- **Auto-refresh toggle:** Allow users to pause updates (save battery/data)

### Data Usage Optimization
- **Delta updates:** Only send changed data (new plays, updated stats)
- **Compressed JSON**
- **Server-sent events (SSE):** Lightweight streaming alternative to WebSocket

---

## User Actions During Live Game

1. **Auto-refresh toggle:** Pause/resume live updates
2. **Notification preferences:** Alert on scores, turnovers, big plays (20+ yards)
3. **Minimize mode:** Compact view (score, possession, time only)
4. **Expand play:** Click play description for full details
5. **Share play:** Share specific play to social media
6. **Compare to pre-game lines:** Show original betting lines vs current

---

## Success Metrics

For live games, track:
- **Update latency:** < 15 seconds from actual play to UI update
- **Data accuracy:** 99.9% accuracy on scores, stats, play descriptions
- **Uptime:** 99.5% availability during live games
- **User engagement:** Average session time > 20 minutes
- **Error rate:** < 0.1% failed updates or missing plays

---

## Live Game Narratives

### Momentum Shifts
- "Team A now on 14-0 run, has taken the lead"
- "Team B scoreless in 2nd half"
- "Team A outgaining Team B 210-85 in 2nd half"

### Betting Context (Live)
- "Spread now Team A -7 (opened -10)"
- "Total tracking under (41 points scored, line was 48)"
- "Live moneyline: Team A -200, Team B +170"

### Drive Context
- "Team A in red zone (3rd & Goal from the 5)"
- "Team B driving, 7 plays, 65 yards, 3:24 elapsed"
- "Team A facing 4th & 1 at midfield"

### Win Probability Shifts
- "Team A's win probability jumped from 35% to 68% after INT"
- "Team B's win probability now 92% (was 55% at halftime)"

---

## Key Features

✅ **Real-Time Updates:** Every play, 5-15 second latency
✅ **Live Drive Tracker:** Current drive stats and momentum
✅ **Last Play Highlight:** Immediate context on what just happened
✅ **Recent Plays Feed:** Last 10-20 plays with scrolling
✅ **Live Box Score:** Key player stats updating in real-time
✅ **Live Team Stats:** Side-by-side comparison
✅ **Live Betting Lines:** Real-time spread, total, moneyline adjustments
✅ **Win Probability:** Live chart showing momentum shifts
✅ **Live EPA:** Expected points tracking
✅ **Auto-Refresh Toggle:** User control over updates

---

## Data Gaps & Recommendations

**Available Now:**
- ✅ Game ID, teams, scores (nflreadpy, ESPN API)
- ✅ Play-by-play descriptions (nflreadpy pbp)
- ✅ Down, distance, yardline (nflreadpy)
- ✅ Win probability, EPA (nflreadpy)
- ✅ Player stats (partial - can aggregate from pbp)

**Needs Integration:**
- ⚠️ Real-time ESPN API for live games (not yet integrated)
- ⚠️ WebSocket or polling mechanism (not implemented)
- ⚠️ Live betting lines (The Odds API integration exists but not real-time)
- ⚠️ Quarter-by-quarter scores (needs ESPN API or pbp aggregation logic)
- ⚠️ Live highlights/videos (ESPN API or YouTube integration needed)

**Recommendation:**
Integrate ESPN live endpoints with 10-15 second polling for P0 data, 30-60 second polling for P1 data. Consider WebSocket upgrade for high-traffic games. Implement Redis caching with 10-60 second TTLs. Build real-time stats aggregation engine from play-by-play data.

---

## Technical Implementation Notes

### API Endpoints Needed

**ESPN API (Primary Live Source):**
- `GET /sports/football/nfl/scoreboard` - Live scores and game status
- `GET /sports/football/nfl/summary?event={game_id}` - Live game details
- `GET /sports/football/nfl/playbyplay?event={game_id}` - Real-time plays
- `GET /sports/football/nfl/boxscore?event={game_id}` - Live stats

**The Odds API (Live Betting Lines):**
- `GET /v4/sports/americanfootball_nfl/odds?markets=spreads,totals&bookmakers=draftkings`

**nflreadpy (Real-Time PBP Ingestion):**
- Load latest play-by-play data for in-progress games
- Filter to current game_id
- Parse live columns: desc, yards_gained, down, ydstogo, yardline_100, drive, wp, epa

### Error Handling
- **API timeout:** Retry 3x with exponential backoff
- **Missing play:** Alert monitoring, log error, continue with next update
- **Invalid data:** Validate against schema, discard if invalid
- **Cache failure:** Fallback to direct API call

### Performance Optimization
- **Debounce updates:** Don't update UI more than once per second
- **Batch stat calculations:** Calculate all team stats in single pass
- **Lazy load charts:** Only render win probability/EPA when tab is active
