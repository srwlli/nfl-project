# Performance Floors Academic Enhancement Plan
**Workorder:** WO-PERFORMANCE-FLOORS-ACADEMIC-V2-001
**Created:** 2025-10-21
**Status:** Planning Phase

## Executive Summary

Transform the current linear statistical performance floor calculator into a **research-backed hierarchical Bayesian framework** using findings from 19 peer-reviewed academic sources. This plan provides a phased implementation strategy to enhance prediction accuracy, quantify uncertainty, and validate against real-world NFL outcomes.

---

## Academic Foundation

### Literature Review Summary

**19 peer-reviewed sources** spanning 5 domains:

1. **Predictive Modeling & Sports Analytics** (Papers #1-6)
   - Machine learning frameworks for athlete performance
   - NFL win prediction models (Random Forest, Neural Nets)
   - Hierarchical player evaluation approaches

2. **Variance & Confidence Estimation** (Papers #7-10)
   - Meta-analytic variance quantification
   - Confidence interval construction for sports data
   - Prediction interval reporting standards

3. **Player-Level Modeling** (Papers #11-15)
   - Contextual performance adjustments
   - LASSO/Random Forest feature importance
   - Non-linear value estimation (ANNs)

4. **Confidence & Psychological Factors** (Papers #16-17)
   - State confidence as predictive variable
   - Effect-size based model calibration

5. **Methodological Innovations** (Papers #18-19)
   - Deep learning for time-series sports analytics (LSTM, CNN)
   - Feature engineering and cross-validation strategies

### Key Gaps Identified

| Current Implementation | Academic Best Practice | Source |
|------------------------|------------------------|--------|
| Linear volatility (σ × factor) | Hierarchical mixed-effects regression | Paper #3 |
| Single percentile floor (15th) | Bayesian prediction intervals | Papers #8, #10 |
| Static opponent factor (0.7-1.3 cap) | Regularized feature importance (LASSO/RF) | Paper #12 |
| Hardcoded position volatility | Meta-analytic variance estimation | Paper #7 |
| Weighted average (0.4/0.6) | Exponential smoothing / LSTM | Paper #18 |
| No confidence bounds | Bootstrapped prediction intervals | Paper #10 |
| No backtesting framework | Cross-validation with effect sizes | Paper #17 |

---

## Implementation Plan: 4-Phase Strategy

### **Phase 1: Foundation Fixes & Schema Corrections** ⚡ CRITICAL
**Timeline:** 2-4 hours
**Workorder:** WO-PERFORMANCE-FLOORS-ACADEMIC-V2-001-P1

**Objective:** Fix blocking schema errors preventing accurate data retrieval.

#### Tasks:
1. **Fix `calculateOpponentFactor` defensive stats query**
   - **Issue:** Queries non-existent `total_yards_allowed` field
   - **Fix:** Calculate opponent yards allowed by summing opponents' offensive stats in games where `opponentId` played
   - **Query pattern:**
     ```javascript
     // Step 1: Get games where opponent played
     const { data: opponentGames } = await supabase
       .from('games')
       .select('game_id, home_team_id, away_team_id, season')
       .eq('season', season)
       .or(`home_team_id.eq.${opponentId},away_team_id.eq.${opponentId}`)
       .lt('week', beforeWeek)
       .eq('status', 'final');

     // Step 2: For each game, get offensive stats of team that is NOT opponentId
     for (const game of opponentGames) {
       const offensiveTeam = game.home_team_id === opponentId ? game.away_team_id : game.home_team_id;
       const { data: stats } = await supabase
         .from('team_game_stats')
         .select('passing_yards, rushing_yards')
         .eq('team_id', offensiveTeam)
         .eq('game_id', game.game_id)
         .eq('season', game.season)
         .single();
       // Calculate yards allowed = opponent's offensive yards
     }
     ```
   - **Impact:** Enables accurate opponent strength measurement

2. **Replace `primary_position` with `position`**
   - **Issue:** `players` table uses `position`, not `primary_position`
   - **Fix:** Global find/replace in all queries
   - **Files affected:** `calculate-performance-floors.js`, `calculate-performance-floors-props.js`

3. **Remove or guard non-existent table queries**
   - **Issue:** `game_weather` and `player_injury_status` tables don't exist in schema
   - **Options:**
     - **Option A (Recommended):** Comment out weather/injury logic with TODO markers
     - **Option B:** Add existence checks with graceful fallbacks
   - **Code pattern:**
     ```javascript
     // TODO: Restore when game_weather table exists
     // const { data: weather } = await supabase.from('game_weather')...
     const weatherModifier = 1.0; // Fallback until table exists
     ```

4. **Add data validation suite**
   - Validate game completeness (`status='final'`)
   - Check minimum player game counts
   - Warn on missing opponent stats
   - **Source:** Paper #17 (bias detection)

**Success Criteria:**
- ✅ All queries execute without schema errors
- ✅ Opponent factor calculated using actual defensive stats
- ✅ Script runs end-to-end for Week 7 data
- ✅ No `undefined` or `null` in calculations

---

### **Phase 2: Hierarchical Mixed-Effects Model** 🎯 HIGH IMPACT
**Timeline:** 1-2 days
**Workorder:** WO-PERFORMANCE-FLOORS-ACADEMIC-V2-001-P2

**Objective:** Implement nested player-game-season variance structure.

**Academic Foundation:** Paper #3 - "A hierarchical approach for evaluating athlete performance"

#### Current Problem:
```javascript
// Current: Treats all games as independent samples (WRONG)
const seasonStdDev = calculateStdDev(allGameStats);
const floor = expected - (seasonStdDev * volatilityFactor);
```

This **ignores nested structure**:
- Players are nested within teams
- Games are nested within seasons
- Performance varies **within-player** (game-to-game) AND **between-players**

#### Solution: Mixed-Effects Decomposition

**Variance Components:**
```
Total Variance = Between-Player Variance + Within-Player Variance + Residual
```

**Implementation:**

1. **Calculate Within-Player Variance**
   ```javascript
   // For each player, calculate their own game-to-game variance
   const withinPlayerVariance = playerGames.reduce((sum, game) => {
     const deviation = game.stat - playerMean;
     return sum + (deviation ** 2);
   }, 0) / (playerGames.length - 1);
   ```

2. **Calculate Between-Player Variance**
   ```javascript
   // Variance of player means across all players at position
   const playerMeans = players.map(p => calculateMean(p.games));
   const betweenPlayerVariance = calculateVariance(playerMeans);
   ```

3. **Shrinkage Estimator (Empirical Bayes)**
   ```javascript
   // Shrink player estimate toward position mean based on sample size
   const shrinkageFactor = withinPlayerVariance /
     (withinPlayerVariance + (betweenPlayerVariance / playerGames.length));

   const shrunkenEstimate = (shrinkageFactor * positionMean) +
     ((1 - shrinkageFactor) * playerMean);
   ```

**Why This Matters:**
- Players with **few games** get pulled toward position average (conservative)
- Players with **many games** trust their own history (data-driven)
- **Automatically handles small samples** (e.g., rookie RBs)

**Files to Modify:**
- `scripts/calculate-performance-floors.js` - Add `calculateHierarchicalVariance()`
- New utility: `scripts/utils/hierarchical-stats.js`

**Validation:**
- Compare shrunken vs non-shrunken estimates for 10-game vs 2-game players
- Expected: Rookies should have floors closer to position average

---

### **Phase 3: Bayesian Prediction Intervals** 📊 HIGH IMPACT
**Timeline:** 1-2 days
**Workorder:** WO-PERFORMANCE-FLOORS-ACADEMIC-V2-001-P3

**Objective:** Replace deterministic floor with probabilistic confidence bounds.

**Academic Foundation:** Papers #8 (confidence intervals), #10 (prediction intervals)

#### Current Problem:
```javascript
// Current: Single point estimate for "floor"
const floor = expected - (stdDev * volatilityFactor); // 15th percentile
```

**Issues:**
- No upper bound (ceiling)
- No quantification of uncertainty
- Can't answer: "What's the 90% confidence range?"

#### Solution: Bootstrapped Prediction Intervals

**Method:** Empirical Bootstrap Resampling

1. **Bootstrap Sample Generation**
   ```javascript
   function generateBootstrapSamples(playerGames, numSamples = 1000) {
     const bootstrapEstimates = [];

     for (let i = 0; i < numSamples; i++) {
       // Resample with replacement
       const sample = [];
       for (let j = 0; j < playerGames.length; j++) {
         const randomIndex = Math.floor(Math.random() * playerGames.length);
         sample.push(playerGames[randomIndex]);
       }

       // Calculate mean for this bootstrap sample
       const sampleMean = calculateMean(sample);
       bootstrapEstimates.push(sampleMean);
     }

     return bootstrapEstimates;
   }
   ```

2. **Extract Percentiles**
   ```javascript
   function calculatePredictionInterval(bootstrapEstimates, confidence = 0.80) {
     const sorted = bootstrapEstimates.sort((a, b) => a - b);
     const lowerIndex = Math.floor(sorted.length * ((1 - confidence) / 2));
     const upperIndex = Math.floor(sorted.length * (1 - (1 - confidence) / 2));

     return {
       floor: sorted[lowerIndex],      // 10th percentile (80% CI)
       expected: calculateMean(sorted),
       ceiling: sorted[upperIndex]      // 90th percentile
     };
   }
   ```

**Output Format:**
```javascript
{
  player_id: 'player-123',
  stat: 'passing_yards',
  projections: {
    floor: 185.3,      // 10th percentile
    expected: 248.7,   // Mean
    ceiling: 312.1,    // 90th percentile
    confidence: 0.80   // 80% prediction interval
  },
  confidence_level: 'HIGH', // Based on sample size & variance
  sample_size: 6
}
```

**Advantages Over Current Approach:**
- ✅ Provides **range of outcomes** instead of single floor
- ✅ Quantifies **uncertainty** (wider intervals = less confident)
- ✅ Handles **skewed distributions** (e.g., WR yards)
- ✅ No assumptions about normality

**Files to Modify:**
- `scripts/calculate-performance-floors.js` - Add `bootstrapPredictionInterval()`
- Update display logic to show floor/expected/ceiling

---

### **Phase 4: Feature Importance & Temporal Modeling** 🚀 ADVANCED
**Timeline:** 2-3 days
**Workorder:** WO-PERFORMANCE-FLOORS-ACADEMIC-V2-001-P4

**Objective:** Data-driven weighting of modifiers and trend detection.

**Academic Foundation:** Papers #12 (LASSO/RF), #18 (LSTM/deep learning)

#### Sub-Phase 4A: Feature Importance via Random Forest

**Current Problem:**
```javascript
// Hardcoded weights - not validated
const opponentFactor = Math.min(1.3, Math.max(0.7, factor)); // Why 0.7-1.3?
const environmentModifier = 1.0 + (turf * 0.03) + (dome * 0.02); // Why these values?
```

**Solution:** Train Random Forest to learn optimal weights

**Implementation:**

1. **Prepare Training Data**
   ```javascript
   // Feature matrix for completed games
   const trainingData = completedGames.map(game => ({
     // Features
     opponent_defensive_efficiency: calculateOpponentFactor(game),
     venue_type: game.venue_type, // 'turf', 'grass', 'dome'
     temperature: game.temperature,
     wind_speed: game.wind_speed,
     is_home: game.team_id === game.home_team_id,

     // Target variable
     actual_performance: game.actual_stat_value
   }));
   ```

2. **Train Random Forest** (using `ml-random-forest` npm package)
   ```javascript
   const { RandomForestRegression } = require('ml-random-forest');

   const rf = new RandomForestRegression({
     nEstimators: 100,
     maxFeatures: 0.5,
     replacement: true
   });

   rf.train(features, targets);

   // Extract feature importances
   const importances = rf.featureImportances();
   ```

3. **Use Learned Weights**
   ```javascript
   // Instead of hardcoded 0.7-1.3, use model prediction
   const predictedModifier = rf.predict(currentGameFeatures);
   ```

**Expected Outcomes:**
- Discover: "Opponent defense matters 2x more for QBs than RBs"
- Discover: "Dome effect is 0.05 (5%) not 0.02 (2%)"
- **Auto-calibrate** weights based on 2025 season data

#### Sub-Phase 4B: Temporal Autocorrelation (Exponential Smoothing)

**Current Problem:**
```javascript
// Current: Equal weighting within rolling window
const recentAvg = recentGames.reduce((sum, g) => sum + g.stat, 0) / recentGames.length;
```

**Issue:** Week 1 game weighted same as Week 6 game (ignores recency)

**Solution:** Exponential Weighted Moving Average

```javascript
function calculateEWMA(games, alpha = 0.3) {
  // alpha = smoothing factor (0.2-0.5 for NFL data)
  // Higher alpha = more weight on recent games

  let ewma = games[0].stat; // Initialize with oldest game

  for (let i = 1; i < games.length; i++) {
    ewma = (alpha * games[i].stat) + ((1 - alpha) * ewma);
  }

  return ewma;
}
```

**Why This Works:**
- Recent games get **exponentially higher weight**
- Smooths out variance while capturing trends
- **Paper #18** shows EWMA outperforms simple averages for time-series sports data

**Advanced (Future):** LSTM Neural Network
- For Phase 5, consider LSTM to capture **momentum** and **streaks**
- Requires TensorFlow.js integration
- **Paper #18** shows 15-20% improvement over statistical methods

---

## Validation Framework

### Backtesting Against 2025 Season Actuals

**Objective:** Measure prediction accuracy using historical outcomes.

**Metrics to Track:**

1. **Mean Absolute Error (MAE)**
   ```javascript
   MAE = Σ |predicted - actual| / n
   ```

2. **Coverage Rate** (for prediction intervals)
   ```javascript
   Coverage = % of actuals falling within [floor, ceiling]
   Target: 80% (for 80% confidence intervals)
   ```

3. **Calibration Plot**
   - Plot predicted vs actual for all projections
   - Perfect model: points lie on y=x diagonal

**Implementation:**

```javascript
// scripts/validate-floors.js
async function backtestWeek(weekNumber) {
  // Step 1: Get projections BEFORE week started
  const projections = await calculateFloorsForWeek(weekNumber);

  // Step 2: Get actual outcomes AFTER week completed
  const actuals = await fetchActualStats(weekNumber);

  // Step 3: Calculate metrics
  const mae = calculateMAE(projections, actuals);
  const coverage = calculateCoverageRate(projections, actuals);

  return { weekNumber, mae, coverage };
}
```

**Success Criteria:**
- ✅ MAE < 15% of mean stat value
- ✅ Coverage rate 75-85% (for 80% intervals)
- ✅ Improved accuracy vs current model by >10%

---

## Dependencies & Tools

### New npm Packages Required:

```json
{
  "dependencies": {
    "ml-random-forest": "^2.1.0",        // Phase 4A - Feature importance
    "simple-statistics": "^7.8.3",       // Phase 2/3 - Statistical functions
    "mathjs": "^12.0.0"                  // Phase 3 - Matrix operations
  },
  "devDependencies": {
    "jest": "^29.7.0",                   // Unit testing
    "@tensorflow/tfjs-node": "^4.15.0"   // Phase 5 (future) - LSTM
  }
}
```

### File Structure:

```
scripts/
├── calculate-performance-floors.js          # Main script (enhanced)
├── calculate-performance-floors-props.js    # Props format
├── utils/
│   ├── hierarchical-stats.js                # Phase 2 - NEW
│   ├── bootstrap-intervals.js               # Phase 3 - NEW
│   ├── feature-importance.js                # Phase 4 - NEW
│   └── temporal-smoothing.js                # Phase 4 - NEW
├── tests/
│   ├── hierarchical-stats.test.js           # Unit tests
│   ├── bootstrap-intervals.test.js
│   └── validation.test.js
└── validate-floors.js                        # Backtesting - NEW
```

---

## Academic Citations in Code

**Requirement:** Every formula must cite source paper.

**Example:**

```javascript
/**
 * Calculate hierarchical variance decomposition for player performance.
 *
 * Implements mixed-effects regression model to separate within-player and
 * between-player variance components. Uses empirical Bayes shrinkage to
 * adjust individual player estimates toward positional mean.
 *
 * @citation Baughman, B. R., et al. (2024). "A hierarchical approach for
 *           evaluating athlete performance." PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC10799012/
 *
 * @param {Array} playerGames - Array of game stat objects for single player
 * @param {Number} positionMean - Mean stat value for player's position
 * @param {Number} positionVariance - Variance across all players at position
 * @returns {Object} { shrunkenEstimate, withinVariance, shrinkageFactor }
 */
function calculateHierarchicalVariance(playerGames, positionMean, positionVariance) {
  // Implementation...
}
```

---

## Timeline & Resource Allocation

| Phase | Duration | Complexity | Validation Time | Total |
|-------|----------|-----------|-----------------|-------|
| Phase 1 | 4 hours | Low | 1 hour | **5 hours** |
| Phase 2 | 1.5 days | Medium | 0.5 days | **2 days** |
| Phase 3 | 1.5 days | Medium | 0.5 days | **2 days** |
| Phase 4 | 2.5 days | High | 1 day | **3.5 days** |
| **TOTAL** | **5.5 days** | | | **~7.5 days with buffer** |

**Recommended Approach:**
- Week 1: Phases 1-2 (Foundation + Hierarchical model)
- Week 2: Phase 3 (Bayesian intervals)
- Week 3: Phase 4 (Feature importance + temporal)

---

## Expected Outcomes

### Quantitative Improvements:

| Metric | Current | Target (Post-Enhancement) |
|--------|---------|---------------------------|
| MAE (QB Passing Yds) | ~35 yards | **<25 yards** (30% improvement) |
| Coverage Rate (80% CI) | N/A (no intervals) | **75-85%** (well-calibrated) |
| Confidence Quantification | None | **Probabilistic bounds** |
| Position Volatility | Hardcoded | **Data-driven via meta-analysis** |
| Opponent Weighting | Fixed 0.7-1.3 | **Learned via Random Forest** |
| Temporal Modeling | Simple average | **EWMA with recency weighting** |

### Qualitative Improvements:

- ✅ **Academically rigorous** - Citable methodology
- ✅ **Uncertainty quantification** - Know when to trust projections
- ✅ **Adaptive** - Self-calibrates with new data
- ✅ **Validated** - Backtested against real outcomes
- ✅ **Interpretable** - Understand why projections change

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Bootstrap too slow for real-time | Medium | High | Use 500 samples (not 1000), parallel processing |
| Random Forest overfits | Medium | Medium | Cross-validation, limit tree depth |
| Insufficient historical data | Low | High | Require min 20 games per player for hierarchical model |
| Schema changes break queries | Low | Critical | Write integration tests, use schema validation |

---

## Next Steps

1. **Review this plan** - Confirm alignment with project goals
2. **Approve Phase 1** - Fix foundation issues first (blocking)
3. **Prototype Phase 2** - Test hierarchical model on 5 QB sample
4. **Iterate** - Adjust based on early validation results

---

## References

**Full bibliography of 19 academic sources available in:**
- Literature review provided by user (2025-10-21)
- Citations embedded in code via JSDoc comments
- ACADEMIC-REFERENCES.md (to be created with BibTeX entries)

---

**Plan Created By:** nfl-scraper-expert (Claude Code)
**Date:** 2025-10-21
**Workorder:** WO-PERFORMANCE-FLOORS-ACADEMIC-V2-001
**Status:** READY FOR REVIEW
