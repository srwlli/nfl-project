# Performance Floor Predictive Model Review

Here’s a **targeted technical review** of your revised `calculate-performance-floors.js` script, with actionable feedback grouped by category. The goal is to improve **accuracy, maintainability, and runtime efficiency** — your refactor is already significantly improved in scope and statistical realism.

---

## ✅ High-Level Assessment

You’ve moved this script from a linear stat-averaging calculator to a **multi-factor predictive baseline model**, incorporating:

* **Opponent defensive efficiency**
* **Venue + weather modifiers**
* **Injury filtering**
* **Position-based volatility**
* **Percentile floors (15th percentile)**
* **Parallelized Supabase queries**

That’s a strong design foundation — what remains are accuracy, normalization, and structural refinements to ensure *consistent, scalable predictions*.

---

## ⚙️ 1. Statistical Accuracy

### 🔸 1.1 Opponent Factor — Logic Flaw

You’re fetching `total_yards_allowed` from `team_game_stats`, but the [AVAILABLE-DATA-INVENTORY.md] schema doesn’t include that field. It provides category splits (`passing_yards`, `rushing_yards`, etc.).

**Fix**:
Replace `total_yards_allowed` with aggregated values based on `passing_yards` + `rushing_yards` allowed from the opposing team’s **defensive side**.

```js
// Defensive performance proxy
const { data: opponentGames } = await supabase
  .from('team_game_stats')
  .select('passing_yards, rushing_yards')
  .eq('team_id', opponentId)
  .eq('season', season)
```

Then calculate:

```js
const opponentAvg = opponentGames.reduce(
  (sum, g) => sum + (g.passing_yards || 0) + (g.rushing_yards || 0), 0
) / opponentGames.length
```

---

### 🔸 1.2 Opportunity Projection Bias

In `calculateStatFloor`, projected opportunities multiply directly by average efficiency.
That creates an upward bias for small-sample players (high variance).

**Fix**: Apply a **Bayesian shrinkage** toward positional league averages.

```js
expected = ((projectedOpportunities * efficiency) + (leagueAvg * 0.3)) / 1.3
```

---

### 🔸 1.3 Confidence Model Oversimplified

`calculateConfidence()` uses only coefficient of variation (CV) and sample size — it doesn’t penalize noisy recency or missing weeks.

**Fix**:
Add recency penalty + position-specific stability weighting.

```js
const recencyPenalty = Math.max(0, 1 - (recentGames.length / rollingWindow))
const posWeight = { QB: 1.0, RB: 0.9, WR: 0.8, TE: 0.85 }[position] || 1.0

const confidence = ((sampleFactor * 0.4) + (consistencyFactor * 0.6)) * posWeight * (1 - recencyPenalty)
```

---

## 🧩 2. Data Integration Accuracy

### 🔸 2.1 `primary_position` field mismatch

`players` table defines `position` (not `primary_position`).

**Fix**:
Change Supabase query:

```js
.select('player_id, full_name, position')
.in('position', ['QB', 'RB', 'WR', 'TE'])
```

and replace all references to `player.primary_position` → `player.position`.

---

### 🔸 2.2 Missing Game Weather Table

`game_weather` isn’t defined in your data inventory.
This will cause silent failures in `calculateEnvironmentModifier()`.

**Fix options**:

1. Wrap in explicit existence check:

   ```js
   const { data: weather, error } = await supabase
     .from('game_weather')
     .select('*')
     .eq('game_id', gameId)
     .maybeSingle()
   if (error?.code === '42P01') return { modifier: 1.0, details: 'no weather table' }
   ```
2. Or move weather logic into a future schema migration (document as TODO).

---

## 🧮 3. Computational Efficiency

### 🔸 3.1 Query Redundancy

You call `.from('games')` repeatedly (for each opponent, team, and environment check).
Each is a network call — unnecessary duplication.

**Fix**:
Cache the `games` table data in memory once per run:

```js
const gamesCache = new Map()
async function getGame(gameId) {
  if (!gamesCache.has(gameId)) {
    const { data } = await supabase.from('games').select('*').eq('game_id', gameId).single()
    gamesCache.set(gameId, data)
  }
  return gamesCache.get(gameId)
}
```

Use `getGame()` across all functions.

---

### 🔸 3.2 Parallelization

`calculateTeamFloors()` already parallelizes player processing — ✅ good.
But you could also parallelize game-level calculations in `calculateFloorsForWeek()`:

```js
await Promise.all(games.map(g => calculateFloorsForGame(g.game_id, season)))
```

This will roughly halve total runtime.

---

## 📊 4. Output and Reporting

### 🔸 4.1 Confidence Visualization

You output confidence as a percentage but not normalized across positions.
A QB’s 85% confidence ≠ WR’s 85% (different data distributions).

**Fix**: Include position reference in logs.

```js
console.log(`      Confidence: ${(proj.confidence * 100).toFixed(0)}% (${player.position})`)
```

---

### 🔸 4.2 Injury Warnings

Currently you show ⚠️ for “questionable”, but no positive signal for “healthy”.

**Fix**:

```js
const injuryLabel = player.injury_warning
  ? `⚠️ QUESTIONABLE (${player.injury_type || 'Injury'})`
  : '✅ Healthy'
```

---

## 🧠 5. Structural / Maintainability

| Issue                                | Recommendation                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| No unit testing hooks                | Export all helper functions (`calculateOpponentFactor`, `calculateConfidence`, etc.) for Jest-based testing. |
| Hardcoded CONFIG constants           | Externalize CONFIG into `config/performance-floors.json` to enable parameter tuning without code changes.    |
| Console-heavy logging                | Use structured logger (e.g., `pino` or `winston`) for downstream observability.                              |
| No handling for missing player stats | Add fallback logs if player has zero fantasy fields populated (avoid silent skips).                          |

---

## ⚡ Summary of Actionable Fixes

| Priority | Area                  | Action                                                            |
| -------- | --------------------- | ----------------------------------------------------------------- |
| 🔥       | Opponent factor       | Replace `total_yards_allowed` with combined passing/rushing yards |
| 🔥       | Schema mismatch       | Change `primary_position` → `position`                            |
| 🔥       | Missing weather table | Add schema guard or fallback                                      |
| ⚡        | Confidence model      | Add recency + position weighting                                  |
| ⚡        | Efficiency            | Cache `games` and parallelize weekly runs                         |
| ⚡        | Output clarity        | Add position context + healthy label                              |
| 💡       | Maintainability       | Export helper functions + externalize CONFIG                      |

---

Would you like me to generate a **refactored version** of this file implementing these fixes (schema-correct, cache-enabled, test-ready)? It would preserve all current logic but correct integration and math errors for full Supabase alignment.

---
This is an **excellent, professional, and well-structured** rewrite of the performance floor calculation script. You have successfully integrated all the proposed improvements, including opponent factors, environment modifiers, opportunity-based projections, and dynamic volatility, while significantly improving the database efficiency with batching.

The script is now far more accurate and robust than the initial version.

Here is a precise list of actionable feedback points to make the app even more complete, accurate, and ready for production, categorized by priority.

-----

## 1\. High-Priority Actionable Feedback (Accuracy & Completeness)

### A. Refine `calculateOpponentFactor` Stat Linkage (Critical)

The current implementation of `calculateOpponentFactor` defaults to using the opponent's **`total_yards_allowed`** from `team_game_stats` as a proxy for all categories, which is in your comments: `// So we use total_yards_allowed as a general defensive efficiency metric`.

**Actionable Fix:**

1.  **Update Database Query:** The `team_game_stats` table in your inventory has specific metrics like `passing_yards`, `rushing_yards`, and `receiving_yards`. You must use these to calculate a position-specific defensive factor.
2.  **Map Category to Field:** In `calculateOpponentFactor`, pass the actual defensive field name (e.g., `passing_yards_allowed`, `rushing_yards_allowed`). Since your inventory doesn't explicitly list an "allowed" field, you'll need to infer the opponent's "yards allowed" by summing the yards gained by the opponent's *offense* in those games.

<!-- end list -->

  * **New Logic for `calculateOpponentFactor`:**
      * If `statCategory` is `'passing'`, fetch the opponent's **`passing_yards`** from their offensive stats in `team_game_stats` and divide by 2 (since the opponent's defense allowed these yards). **OR** more correctly, fetch the `passing_yards` of the **opposing team** in each of those games and average it.
      * The simplest, most direct fix is to **add defensive metrics** to the `team_game_stats` table (e.g., `def_passing_yards_allowed`, `def_rushing_yards_allowed`). Until then, `total_yards_allowed` is a weak proxy.

### B. Implement Percentile Ceiling (Model Consistency)

You correctly implemented the **Floor** using the **15th percentile** of historical outcomes, which is a great use of non-linear statistics.

However, the **Ceiling** is still calculated linearly as `expected + (seasonStdDev * volatilityFactor)`.

**Actionable Fix:**

1.  **Change Ceiling Calculation:** Replace the linear ceiling calculation with a **percentile-based ceiling**, such as the **85th percentile**.
2.  **New Ceiling Logic:** Sort `seasonValues` and get the value at the index corresponding to the 85th percentile (`Math.floor(sortedValues.length * 0.85)`). This makes the range (Floor to Ceiling) consistent and less prone to skew from outliers.

### C. Remove Hardcoded Opportunity Fallback Weights

In `calculateStatFloor`, the fallback for when efficiency is 0 is `expected = (seasonAvg * 0.4) + (recentAvg * 0.6)`.

**Actionable Fix:**

1.  **Refactor Fallback:** Replace the hardcoded `0.4` and `0.6` with the configurable weights from your `CONFIG` object (`CONFIG.opportunity_weights.season` and `CONFIG.opportunity_weights.recent`). This keeps all tuning parameters centralized and prevents magic numbers.

## 2\. Medium-Priority Actionable Feedback (Robustness & Efficiency)

### A. Account for Home/Away in Opponent Factor

The current opponent factor logic does not differentiate between performance at home vs. away, but defensive performance can vary.

**Actionable Fix:**

1.  **Enhance `calculateOpponentFactor`:** When fetching the opponent's allowed stats, check if the game was a **home** or **away** game for the opponent and factor that into the overall average calculation, or even calculate separate home and away defense averages.

### B. Add `try...finally` Block to `main()`

As this is a production script interacting with an external database, you must ensure connections are closed or resources are handled even if an error occurs.

**Actionable Fix:**

1.  **Wrap `main()` Logic:** In the `main` function (or the `main().catch` block), ensure you have a mechanism to gracefully exit or log connection errors. While the Supabase client abstracts connection pooling, a final logging step or more robust error handling in the `catch` is best practice.

### C. Improve Data Access in `calculateTeamFloors`

You are fetching **all** player stats for the whole season, then filtering by game week *in memory* using `weekMap`. While this is better than individual calls, it can be optimized further.

**Actionable Fix:**

1.  **Add `week` Filter to Stat Fetch:** In `calculateTeamFloors`, apply the week filter directly to the Supabase query for player stats:

    ```javascript
    // Change
    .eq('season', season)
    // To
    .eq('season', season)
    .lt('week', week) // Assuming 'week' is a joinable column on player_game_stats or you join 'games'
    ```

2.  **Refine `player_game_stats` schema:** For optimal efficiency, consider adding `week` as a denormalized field to the `player_game_stats` table to eliminate the need to join with `games` just to filter by week.

-----

## 3\. Low-Priority Actionable Feedback (Readability & Polish)

### A. Clean Up Hardcoded Weights

In `calculateStatFloor`, you still have two instances of `(seasonAvg * 0.4) + (recentAvg * 0.6)` which are only used as fallbacks.

**Actionable Fix:**

1.  **Create a Constant for Fallback Weights:** Add `season_fallback_weight: 0.4` and `recent_fallback_weight: 0.6` to `CONFIG` to eliminate these final "magic numbers."

### B. Consistency in Player Position Naming

Your `playerDetails` query uses `primary_position`, but `getStatCategories` uses `position` as the argument name.

**Actionable Fix:**

1.  **Standardize Naming:** Rename the field in the `players` table query to `position` (or rename the argument in `getStatCategories` to `primary_position`) for clarity. Stick with the name you used in the inventory: `position`.

### C. Display Player Injury Status in `calculateTeamFloors` Log

You correctly log excluded players. You should also log the included but questionable players within that same block for complete transparency before processing.

**Actionable Fix:**

1.  **Log Questionable Players:** Add a separate log block in `calculateTeamFloors` after logging excluded players to list all players flagged as **`QUESTIONABLE`** who were *not* excluded.

---
Here’s **actionable feedback** on your updated `calculate-performance-floors.js`, organized by priority and impact:

---

### **1. Strengths (Keep These!)**
- **Position-Specific Volatility:** The `position_volatility` object is a great addition for tailoring calculations by position.
- **Venue & Weather Modifiers:** These are well-structured and will improve accuracy for environmental factors.
- **Opportunity-Based Projection Weights:** The `opportunity_weights` logic is a smart way to blend season-long and recent performance.
- **Rolling Window by Position:** Adapting the rolling window by position is a nuanced and valuable improvement.
- **CLI Interface:** The `--game` and `--week` arguments make the script flexible and user-friendly.

---

### **2. Actionable Improvements**

#### **A. Data Fetching & Error Handling**
- **Issue:** The script assumes all required data (e.g., `player_game_stats`, `team_defensive_efficiency`) is always available and valid.
- **Action:**
  - Add checks for `null`/`undefined` in Supabase responses.
  - Log warnings if `min_games_played` is not met for a player.
  - Example:
    ```javascript
    if (!playerStats || playerStats.length < CONFIG.min_games_played) {
      console.warn(`⚠️ Insufficient data for player ${playerId} (${playerStats.length} games)`);
      continue;
    }
    ```

#### **B. Opponent Modifier Calculation**
- **Issue:** The `opponent_modifier` is calculated as `1 / opponent_factor`, which may not always be intuitive.
- **Action:**
  - Clarify the logic in comments (e.g., "Lower opponent_factor = tougher defense").
  - Consider normalizing the modifier to a 0–1 range for interpretability.

#### **C. Confidence Score**
- **Issue:** The `confidence` score is based on sample size but doesn’t account for data quality (e.g., variance in recent games).
- **Action:**
  - Incorporate standard deviation or variance into the confidence calculation.
  - Example:
    ```javascript
    const confidence = Math.min(1, (playerStats.length / CONFIG.min_games_played) * (1 / (1 + stdDev)));
    ```

#### **D. Weather & Venue Modifiers**
- **Issue:** The script doesn’t show how `weather_conditions` or `venue_type` are fetched from the database.
- **Action:**
  - Add a query to fetch these fields from the `games` table.
  - Example:
    ```javascript
    const { data: gameDetails } = await supabase
      .from('games')
      .select('venue_type, weather_conditions')
      .eq('game_id', gameId)
      .single();
    ```

#### **E. Logging & Debugging**
- **Issue:** Logs are helpful but could be more structured for debugging.
- **Action:**
  - Use a logging library (e.g., `winston`) or format logs as JSON for parsing.
  - Example:
    ```javascript
    console.log(JSON.stringify({
      playerId,
      expected,
      floor,
      opponent_factor,
      confidence,
      notes: ["High variance WR", "Tough opponent"]
    }));
    ```

#### **F. Performance Optimization**
- **Issue:** The script processes players sequentially, which may be slow for large datasets.
- **Action:**
  - Use `Promise.all` to fetch data for all players in parallel.
  - Example:
    ```javascript
    const playerPromises = players.map(playerId => fetchPlayerStats(playerId));
    const playerStats = await Promise.all(playerPromises);
    ```

#### **G. Documentation**
- **Issue:** The formula and logic are documented, but edge cases (e.g., injured players, bye weeks) are not.
- **Action:**
  - Add a `README` section for edge cases and assumptions.
  - Example:
    ```markdown
    ### Edge Cases
    - **Injured Players:** Skipped if marked as `status = 'INJURED'`.
    - **Bye Weeks:** Players with no games in the rolling window are excluded.
    ```

#### **H. Testing**
- **Issue:** No automated tests are included.
- **Action:**
  - Write unit tests for:
    - `calculateOpponentModifier`
    - `calculatePlayerFloor`
    - Edge cases (e.g., player with 1 game, extreme weather).
  - Example (using `jest`):
    ```javascript
    test('calculateOpponentModifier returns 1 for average defense', () => {
      expect(calculateOpponentModifier(1.0)).toBe(1);
    });
    ```

---

### **3. Example Refactored Snippet**
Here’s how you might refactor the `calculatePlayerFloor` function for clarity and robustness:
```javascript
async function calculatePlayerFloor(playerId, teamId, opponentId, gameDetails) {
  // Fetch player stats with error handling
  const { data: playerStats, error } = await supabase
    .from('player_game_stats')
    .select('fantasy_points, game_id')
    .eq('player_id', playerId)
    .eq('season', CONFIG.current_season)
    .order('game_date', { ascending: false })
    .limit(CONFIG.rolling_window_by_position[playerPosition] || CONFIG.rolling_window_weeks);

  if (error || !playerStats || playerStats.length < CONFIG.min_games_played) {
    console.warn(`⚠️ Skipping player ${playerId}: ${error?.message || 'Insufficient data'}`);
    return null;
  }

  // Calculate recent average and standard deviation
  const points = playerStats.map(s => s.fantasy_points);
  const recentAvg = points.reduce((a, b) => a + b, 0) / points.length;
  const stdDev = Math.sqrt(points.reduce((sq, n) => sq + Math.pow(n - recentAvg, 2), 0) / points.length);

  // Fetch opponent defensive efficiency
  const { data: opponentEfficiency } = await supabase
    .from('team_defensive_efficiency')
    .select('fantasy_points_allowed_per_game')
    .eq('team_id', opponentId)
    .eq('season', CONFIG.current_season)
    .single();

  if (!opponentEfficiency) {
    console.warn(`⚠️ No defensive efficiency data for opponent ${opponentId}`);
    return null;
  }

  // Apply modifiers
  const opponentFactor = opponentEfficiency.fantasy_points_allowed_per_game / leagueAvgFantasyPoints;
  const opponentModifier = 1 / opponentFactor;
  const volatilityFactor = CONFIG.position_volatility[playerPosition] || CONFIG.volatility_factor;
  const expected = recentAvg * opponentModifier;
  const floor = expected - (stdDev * volatilityFactor);

  // Calculate confidence
  const confidence = Math.min(1, (playerStats.length / CONFIG.min_games_played) * (1 / (1 + stdDev)));

  return { playerId, expected, floor, opponent_factor: opponentFactor, confidence };
}
```

---

### **4. Next Steps**
- **Implement the refactored `calculatePlayerFloor` function.**
- **Add automated tests for core logic.**
- **Document edge cases and assumptions.**

Would you like me to draft a test suite or further refine any section?

---
This version of **`calculate-performance-floors.js`** is a strong step forward — modular, data-rich, and logically aligned with modern fantasy performance modeling. However, several actionable improvements can further enhance **accuracy, maintainability, and computational efficiency**. Here’s the detailed, prioritized feedback:

***

## 1. Modeling Accuracy Improvements

### a. Expand Opponent Factor Beyond Total Yards
Currently, the defensive modifier relies solely on **`totalyardsallowed`**, which treats all defenses uniformly.  
**Recommendation:**  
- Pull stat-specific opponent data from `teamgamestats` (e.g., `passingyardsallowed`, `rushingyardsallowed`, `receivingyardsallowed`).  
- If unavailable, infer category-specific proxies by normalizing total yard splits by opponent run/pass ratios.

### b. Contextualize Opportunity Projections
The method multiplying **projected_opportunities × efficiency** assumes consistent usage patterns.  
**Improvements:**  
- Incorporate **team-level pass or rush rate trends** for game script sensitivity.  
- Adjust opportunity weighting by **vegas implied totals** or **spread**, since leading teams see reduced passing volume.

### c. Player Trend Integration
The weighted 0.4/0.6 seasonal vs recent average is static.  
**Refine** with exponential smoothing:  
$$
WeightedAverage = \alpha \times recentAvg + (1 - \alpha) \times seasonAvg
$$
and make `α` adaptive based on player variance or recency intensity.

### d. Environment Modifiers Granularity
Venue and weather factors are cleanly applied, but multipliers are static.  
**Actionable:**  
- Add wind-speed scaling `1 - (windspeed / 100)` beyond threshold penalties.  
- Include individualized modifiers for dome vs. retractable stadiums vs. high-altitude fields (Denver/Arizona).

### e. Percentile Floor Calculation
Good choice to use the **15th percentile** rather than a linear subtraction — more regression-resilient.  
**Enhance further:**  
- Compute percentile on **recentGames only** (for form-based volatility).  
- Add a **ceiling percentile** (e.g., 85th) for balanced confidence intervals.

***

## 2. Data Validation & Robustness

### a. Broaden `validateDataCompleteness`
You check game/team records, but not the *integrity of stat depth*.  
Add checks for:  
- Missing or **uniform zero stats** across players.  
- Unusual standard deviation spikes (e.g., >3σ from mean).  
- Inconsistent game count (e.g., player has stats for games not in `gamesWithStats`).

### b. Handle Empty Result Sets Gracefully
Your function returns neutral modifiers when data is missing, which is good, but masking excessive data gaps can bias the model.  
**Suggestion:**  
Log missing count ratios per team/week and skip projections entirely when >25% of expected player data is absent.

### c. Injury Logic Refinement
`OUT` and `DOUBTFUL` players are excluded, `QUESTIONABLE` are flagged.  
Add a dynamic injury scaling adjustment:  
$$
output = output \times (1 - injurySeverityFactor)
$$
e.g., 0.1–0.3 reduction for questionable designation.

***

## 3. Query Optimization and Scale

### a. Consolidate Supabase Fetches
The script makes several per-loop `.select()` calls.  
**Fix:**  
Batch `from(...).in()` fetches per team/week early in the loop, then reuse those result sets downstream.  
Expected performance gain: **3–5× faster** for multi-game batches.

### b. Reduce Redundant `await` Storms
Functions like `calculateStatFloor` run in deeply nested `Promise.all` blocks. Collapse to fewer aggregate async calls via data prefetch.  
Optionally, replace `await` chaining with top-level `Promise.allSettled` to continue partial completions.

### c. Caching League-wide Averages
League averages in opponent factor calculations are recomputed each time.  
**Action:** Store `leagueAvg` in memory for a single season run to prevent redundant recalculation.

***

## 4. Maintainability & Extensibility

### a. Modularize Config
Move `CONFIG` to its own JSON (e.g., `config/performance-model.json`) so model assumptions can be version-controlled and tweaked without touching code.

### b. Structured Logging
Switch raw `console.log` outputs to structured JSON with keys:
```js
{player: "Josh Allen", position: "QB", floor: 15.3, confidence: 0.84}
```
This would make it much easier to load outputs into dashboards or validation scripts.

### c. Explicit Error Typing
Wrap Supabase operations in a universal query handler:
```js
const query = async (table, filter) => {
  const { data, error } = await supabase.from(table).select(...).match(filter);
  if (error) throw new DataError(table, error.message);
  return data;
};
```
This simplifies logging and improves debugging for silent failures.

***

## 5. Statistical Refinements

### a. Improve Confidence Scoring
`cv`-based confidence is input-sensitive to low means.  
Replace `confidence = 1 - cv` with:
$$
confidence = \frac{1}{1 + e^{(cv * k - b)}}
$$
so confidence follows a sigmoidal decay, improving stability for high-variance data.

### b. Normalize Across Sample Sizes
Apply a small bias correction term for small samples:
$$
adjustedStdDev = stdDev \times \sqrt{n / (n-1)}
$$
to remove underestimation when `n < 10`.

### c. Inter-Stat Correlation
If data depth allows, compute cross-correlation between yards and fantasy points to smooth projections for any stat missing recent samples.

***

## 6. Developer Experience Improvements

- Add **CLI flags** for `--team KC` or `--position QB` filters for debugging smaller data slices.  
- Write **unit tests** mocking Supabase responses for each major phase (opponent factor, environment, validation).  
- Integrate **JSDoc** on each helper function to expose expected inputs/outputs and improve IDE hinting.

***

### Top 5 Quick-Win Actions

| Priority | Action | Impact |
|-----------|---------|--------|
| 1 | Batch Supabase queries (reduce per-player loops) | Performance |
| 2 | Cache league averages & opponent stats | Accuracy + Speed |
| 3 | Use exponential smoothing for recent form | Accuracy |
| 4 | Refine percentile floor to recentGames | Statistical stability |
| 5 | Switch to structured JSON logs | Debuggability |

***

Applying the above will improve both runtime efficiency and predictive reliability — bringing the app closer to professional-grade player modeling systems.

[1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/58677421/6717c694-bf4e-4731-9100-9e707de694ee/calculate-performance-floors.js)
---
- **Fix Defensive Stats Calculation in `calculateOpponentFactor`**: The current implementation incorrectly queries `team_game_stats` for the opponent's own offensive stats (e.g., `passing_yards` is the opponent's offense, not defense). It also references a non-existent `total_yards_allowed` field. To accurately compute defensive efficiency:
  - For a given `statCategory` (e.g., 'passing'), query `games` where the opponent was playing (as home or away), then join `team_game_stats` for the *other* team in those games to sum their offensive stats (e.g., `passing_yards` allowed = sum of opponents' `passing_yards`).
  - Example query structure:
    ```
    // Get games where opponentId played
    const { data: opponentGames } = await supabase
      .from('games')
      .select('game_id, home_team_id, away_team_id')
      .eq('season', season)
      .or(`home_team_id.eq.${opponentId},away_team_id.eq.${opponentId}`)
      .lt('week', beforeWeek)
      .eq('status', 'final');

    // For each game, get the offensive stats of the team that is NOT opponentId
    const allowedStats = [];
    for (const game of opponentGames) {
      const offensiveTeam = game.home_team_id === opponentId ? game.away_team_id : game.home_team_id;
      const { data: stats } = await supabase
        .from('team_game_stats')
        .select(statCategory === 'passing' ? 'passing_yards' : statCategory === 'rushing' ? 'rushing_yards' : 'receiving_yards')
        .eq('team_id', offensiveTeam)
        .eq('game_id', game.game_id)
        .single();
      if (stats) allowedStats.push(stats[statField] || 0);
    }
    const opponentAvg = allowedStats.reduce((sum, v) => sum + v, 0) / allowedStats.length || 0;
    ```
  - Similarly, compute leagueAvg by aggregating all teams' allowed stats (sum across all games, divide by number of games * 2 since each game has two teams).
  - This makes the factor stat-specific (e.g., passing yards allowed for QBs). Cap at 0.7-1.3 as is.

- **Remove or Source Non-Existent Tables (`game_weather` and `player_injury_status`)**: These tables are not listed in `AVAILABLE-DATA-INVENTORY.md`, so queries will fail. 
  - For weather: Remove the weather-related code in `calculateEnvironmentModifier` (including `CONFIG.weather_penalties` and related logic) until data is available. Alternatively, add a comment noting it requires external integration (e.g., via API calls to weather services like OpenWeatherMap for game_date and venue_city from `games`/`stadiums`).
  - For injuries: Remove the injury query and handling in `calculateTeamFloors` (including exclusion logic and warnings). As a future enhancement, suggest integrating via external scraping (e.g., from ESPN injury reports) or adding a new table to the DB schema.

- **Incorporate Home/Away Adjustment in Environment Modifier**: Currently, no home-field advantage is applied. Add a home modifier (e.g., 1.05 for home team) based on whether `teamId === game.home_team_id`. Update `calculateEnvironmentModifier` to accept `teamId` and apply:
  ```
  const isHome = game.home_team_id === teamId;
  const homeModifier = isHome ? 1.05 : 0.95; // +5% home, -5% away
  combinedModifier *= homeModifier;
  details.push(isHome ? 'home advantage' : 'away game');
  ```
  Pass `teamId` when calling from `calculateFloorsForGame`.

- **Implement Recent Trend Adjustment (A) with Simple Slope Calculation**: The docstring mentions this, but it's missing beyond basic weighting. In `calculateStatFloor`, after computing `recentAvg`, calculate a trend slope:
  ```
  if (recentGames.length >= 2) {
    const weeks = recentGames.map(g => g.week).sort((a, b) => b - a); // Descending
    const values = recentGames.sort((a, b) => b.week - a.week).map(g => g[statField]);
    let sumSlope = 0;
    for (let i = 0; i < values.length - 1; i++) {
      sumSlope += (values[i] - values[i+1]); // Positive if improving
    }
    const avgSlope = sumSlope / (values.length - 1);
    const trendFactor = 1 + (avgSlope / recentAvg) * 0.2; // Cap adjustment at ±20%
    expected *= Math.min(1.2, Math.max(0.8, trendFactor));
  }
  ```
  This captures momentum (e.g., upward trend boosts expected).

- **Enhance Sparse Data Handling**: If `recentGames.length < rollingWindow` (from `CONFIG.rolling_window_by_position`), dynamically reduce recent weight:
  ```
  const recentWeight = recentGames.length / rollingWindow * 0.6; // Scale down if sparse
  const seasonWeight = 1 - recentWeight;
  expected = (seasonAvg * seasonWeight) + (recentAvg * recentWeight);
  ```
  Also, in `calculateConfidence`, penalize if `recentGames.length < 2`: `sampleFactor = Math.min(sampleSize / 10, recentGames.length / rollingWindow)`.

- **Use Advanced Metrics for Refinement (e.g., EPA)**: Leverage `player_game_stats.epa_pass`, `epa_rush`, etc. In `calculateStatFloor`, after `expected`:
  ```
  // Fetch average EPA for the stat
  const epaField = statField.includes('passing') ? 'epa_pass' : statField.includes('rushing') ? 'epa_rush' : 'epa_receive';
  const seasonEpa = seasonStats.reduce((sum, g) => sum + (g[epaField] || 0), 0) / seasonStats.length;
  // Assume league avg EPA is 0; adjust if >0 (efficient) or <0 (inefficient)
  const epaFactor = 1 + (seasonEpa * 0.1); // ±10% adjustment
  expected *= Math.min(1.1, Math.max(0.9, epaFactor));
  ```
  Query these fields in the batch fetch in `calculateTeamFloors`.

- **Position-Specific Opportunity for RBs**: For RBs' fantasy points, opportunity is only 'rushing_attempts', but should combine rushes + targets. In `getStatCategories`, for RB fantasy: `{ stat: 'fantasy_points_ppr', opportunity: ['rushing_attempts', 'receiving_targets'], label: 'Fantasy Points' }`. In `calculateStatFloor`, if opportunityField is array, sum them: `seasonOpportunities = seasonStats.map(g => (g[opportunityField[0]] || 0) + (g[opportunityField[1]] || 0))`.

- **Improve Validation and Logging**: Expand `validateDataCompleteness` to check for stats existence: pass `allTeamStats` and warn if < expected (e.g., `if (allTeamStats.length < 20) warnings.push('Low player stats count')`). Add logging for key modifiers: in `displayTeamFloors`, show `environmentMod.modifier` and `opponent_factor` breakdown (e.g., `Environment: ${environmentMod.details} (${environmentMod.modifier}x)`).

- **Optimize Batch Queries Further**: In `calculateOpponentFactor`, batch game fetches and use `.in('game_id', gameIds)` for stats instead of looping. For leagueAvg, cache it once per run (e.g., in `CONFIG`) to avoid repeated queries.

- **Add TD Regression Using `scoring_plays`**: For fantasy floors, adjust for unsustainable TDs. Query `scoring_plays` for player's TDs: `const { data: tds } = await supabase.from('scoring_plays').select('count').eq('player_id', player.player_id).eq('score_type', 'touchdown')`. If recent TDs > expected (e.g., > season avg), reduce floor by 10-20%.

- **Handle Edge Cases**: Add min floor values (e.g., QB fantasy floor >= 8 if starter). In `calculateStatFloor`, if `seasonStdDev === 0` (consistent), set floor = expected * 0.9. Test with small samples.

- **General Cleanup**: Rename `primary_position` to `position` for consistency. Update docstrings to match implemented features (e.g., add percentile floor). Consider exporting results to JSON instead of console for usability.







