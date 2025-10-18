# Scheduled Game - Data List (At-a-Glance)

**Game Type:** Pre-Game / Upcoming
**Update Frequency:** Betting lines every 5-15 min, team stats daily, weather every 3-6 hours
**User Context:** Planning bets, previewing matchup, researching team performance

---

## P0 - Must-Have Content

### 1. Game Header - Pre-Game Edition
- Teams (logos, names, abbreviations, colors)
- Current records (W-L-T)
- Scheduled date and time
- Venue (name, city, roof type)
- Broadcast network
- "UPCOMING" badge with countdown timer

**Data Sources:** schedules table, teams table

---

### 2. Betting Context
- **Spread:** Line, home/away odds, implied probability
- **Total (Over/Under):** Line, over/under odds
- **Moneyline:** Home/away odds, implied win probability
- Line movement indicator (opening vs current line)
- Last updated timestamp

**Data Sources:** The Odds API (DraftKings, FanDuel), schedules table (opening lines)

---

## P1 - Important Content

### 3. Team Preview Stats (Season-to-Date)
- Record (W-L-T), point differential
- PPG (points per game), PAPG (points allowed per game)
- Offensive rank (yards/game)
- Defensive rank (yards allowed/game)
- Turnover differential
- Home/away record (depending on game location)

**Data Sources:** season_stats table, player_stats table (aggregated), nflreadpy

---

### 4. Head-to-Head History
- All-time record (Team A vs Team B)
- Last 5 meetings (date, winner, score)
- Average margin in recent meetings
- Venue-specific record (if at same stadium)

**Data Sources:** schedules table (historical data filtered by both teams)

---

### 5. Weather Forecast
- Temperature (Fahrenheit)
- Conditions (clear, rain, snow, etc.)
- Wind speed and direction
- Precipitation probability
- Forecast updated timestamp

**Data Sources:** OpenWeatherMap API

---

### 6. Key Injuries & Roster Status
- Out: Player name, position, team
- Questionable: Player name, position, injury type
- Probable: Player name, position
- Impact rating (starter/key player indicator)

**Data Sources:** injuries table, depth_charts table

---

### 7. Betting Trends
- **Against the Spread (ATS):** Team A (W-L), Team B (W-L)
- **Over/Under Record:** Team A (O-U), Team B (O-U)
- Home/away ATS splits
- Division game ATS records

**Data Sources:** schedules table (historical betting results), calculate ATS/O-U records

---

## P2 - Nice-to-Have Content

### 8. Advanced Predictions
- **Win Probability:** Percentage for each team (based on power ratings, ELO, etc.)
- **Projected Score:** Predicted final score
- **Key Matchup Advantages:** Offensive strength vs defensive weakness
- **Power Rating Differential:** Team A rating vs Team B rating

**Data Sources:** power_ratings table, ELO calculations, ESPN FPI (if available)

---

### 9. Key Players to Watch
- Top offensive players (QB, RB, WR) with season stats
- Top defensive players (sacks, INTs, tackles)
- Recent performance (last 3 games)
- Injury status

**Data Sources:** player_stats table, injuries table

---

### 10. Expert Picks & Public Consensus
- Expert picks (if scraped from ESPN, NFL.com)
- Public betting percentages (% on each side)
- Sharp money indicator (where pros are betting)

**Data Sources:** External APIs (Action Network, Covers.com), The Odds API

---

### 11. Season Context
- Playoff implications (must-win game?, division race?)
- Current division standings (both teams)
- Strength of schedule remaining
- Recent form (last 5 games: W-L)

**Data Sources:** schedules table (calculate standings), season_stats table

---

## Navigation Structure

**5 Sub-Sections:**
1. **Game Overview** - Header, betting context, countdown
2. **Team Preview** - Season stats, records, rankings
3. **Head-to-Head** - Historical matchups, trends
4. **Injuries & Weather** - Key players out/questionable, forecast
5. **Predictions** - Advanced predictions, expert picks, key players (P2)

---

## Caching Strategy

- **Betting lines:** 5-15 minutes (frequently updated)
- **Team stats:** 24 hours (static until next game)
- **Weather forecast:** 3-6 hours (updated periodically)
- **Injuries:** 1 hour (can change throughout week)
- **Head-to-head history:** Permanent (historical data)
- **Power ratings:** 24 hours (updated weekly)

---

## Progressive Loading

1. **Initial Load (<1s):** Game header, betting context, team records
2. **Secondary Load (1-2s):** Team preview stats, head-to-head history
3. **Tertiary Load (2-3s):** Weather forecast, injuries, betting trends
4. **On-Demand:** Advanced predictions, expert picks (when section expanded)

---

## Update Frequencies

| Data Element | Update Frequency |
|--------------|------------------|
| Betting Lines | Every 5-15 minutes |
| Weather Forecast | Every 3-6 hours |
| Injury Reports | Every 1 hour (daily closer to game) |
| Team Stats | Daily (static between games) |
| Head-to-Head History | Static (historical) |
| Power Ratings | Weekly |
| Expert Picks | Daily (updated closer to game) |

---

## Key Features

✅ **Live Betting Lines:** Real-time spread, total, moneyline with line movement
✅ **Implied Probabilities:** Convert odds to win percentages
✅ **Betting Trends:** ATS and O/U records for both teams
✅ **Weather Impact:** Forecast with game-day conditions
✅ **Injury Context:** Key players out/questionable with impact ratings
✅ **Historical Edge:** Head-to-head trends and venue-specific records
✅ **Advanced Predictions:** Win probability, projected scores, power ratings
✅ **Season Context:** Playoff implications, division standings

---

## User Actions

Scheduled games should allow users to:
1. **Set Alerts:** Notify when line moves, injury updates, weather changes
2. **Compare Teams:** Side-by-side stat comparison
3. **View Full Schedules:** See both teams' upcoming games
4. **Add to Watchlist:** Save game for quick access
5. **Share Preview:** Social media share card
6. **Track Bets:** Log personal picks and track results

---

## Success Metrics

For scheduled games, track:
- Time spent on preview page
- Betting line engagement (clicks, hover time)
- Injury report views
- Weather forecast clicks
- Expert picks engagement
- User alert opt-ins
- Conversion to live game viewing

---

## Pre-Game Narratives

### Playoff Race Context
- "Win-and-in scenario for Team A"
- "Team B eliminated from playoff contention"
- "Division title on the line"

### Rivalry Context
- "5th meeting in 2 years, series tied 2-2"
- "Team A looking for revenge after Week 3 loss"
- "Heated NFC East rivalry continues"

### Betting Context
- "Largest spread of the week (Team A -14)"
- "Line moved 3 points since opening"
- "Public heavy on Team A, sharp money on Team B"

### Weather Impact
- "Snow expected, total dropped from 48 to 42"
- "High winds may impact passing game"
- "Dome game, weather neutral"

---

## Data Gaps & Recommendations

**Available Now:**
- ✅ Game schedule, teams, venue (schedules table)
- ✅ Team season stats (season_stats, player_stats)
- ✅ Historical matchups (schedules table)
- ✅ Power ratings (power_ratings table)
- ✅ Injuries (injuries table)

**Needs Integration:**
- ⚠️ Real-time betting lines (The Odds API - not yet integrated at 5-15 min frequency)
- ⚠️ Weather forecasts (OpenWeatherMap API - not integrated)
- ⚠️ Expert picks (ESPN/NFL.com scraping - not implemented)
- ⚠️ Public betting percentages (Action Network API - not integrated)
- ⚠️ Implied probability calculations (needs custom logic)

**Recommendation:**
Integrate The Odds API with 5-15 minute polling for live line updates. Add OpenWeatherMap API for game-day weather forecasts. Implement ATS/O-U record calculations from historical schedules data.
