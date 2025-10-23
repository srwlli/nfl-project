# Pro Football Reference - Future Enhancement

## What They Have (That We Don't)

### 1. **Snap Count Data** ⭐ Most Valuable
**Example**: https://www.pro-football-reference.com/boxscores/202510200cin.htm

**Data Available**:
- Offensive snaps per player
- Defensive snaps per player
- Special teams snaps per player
- Snap percentage (% of team's total snaps)

**Why It's Valuable**:
- Know who was on the field (even if no stats)
- Identify backup usage vs starters
- Find players who played but had 0 stats (like blockers, coverage players)
- Snap count = better indicator of opportunity than targets/attempts

**Example Use Cases**:
- "Backup RB got 15 snaps but 0 carries" = injury to starter likely
- "WR3 played 80% of snaps but only 2 targets" = low usage despite playing time
- "Rookie CB took 100% of snaps" = starter now

### 2. **Advanced Receiving Metrics**
- Yards after catch (YAC)
- Drops
- Catchable targets

### 3. **Advanced Rushing Metrics**
- Yards before contact
- Broken tackles
- Stuff rate

### 4. **Game Scripts**
- Win probability by quarter
- Game flow (who led when)

### 5. **Weather Data**
- More detailed than ESPN
- Wind speed/direction
- Temperature
- Precipitation

---

## Implementation Complexity

### Challenges:
❌ **No Official API** - Would require HTML scraping
❌ **Scraping is Fragile** - HTML changes break scrapers
❌ **Legal/TOS** - Need to verify scraping is allowed
❌ **Rate Limiting** - Unknown tolerance for automated requests

### Alternative:
- **nflfastR R package** (part of nflverse) has some PFR data
- Check if snap counts are in nflverse datasets
- May already be available without scraping

---

## Priority

**Medium Priority** - Not critical for MVP, but very valuable for:
- Advanced analytics
- Deeper player insights
- Injury detection (snap count drops)
- Usage trends

---

## When to Implement

**After Core Features:**
1. ✅ Real-time stats (ESPN) - DONE
2. ✅ Full rosters (nflverse) - IN PROGRESS
3. ⏳ Betting lines - DONE
4. ⏳ Advanced analytics (EPA/WPA) - DONE
5. 🔮 **Snap counts** (PFR or nflverse) - FUTURE

---

## Research Needed

1. Check if nflverse has snap count data
2. Verify PFR terms of service for scraping
3. Test scraping reliability
4. Estimate maintenance burden

**Status**: Documented for future consideration
