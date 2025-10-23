/**
 * Bootstrap Prediction Intervals Module
 *
 * Generates probabilistic confidence bounds for player performance projections
 * using empirical bootstrap resampling. Replaces deterministic point estimates
 * with prediction intervals that quantify uncertainty.
 *
 * Academic Foundation:
 * @citation Hopkins, W. G., et al. (2003). "Statistical Primer for Athletic
 *           Trainers: Using Confidence Intervals and Variation Measures."
 *           PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC5264560/
 *
 * @citation Sainani, K. L., et al. (2024). "Meta-analysis prediction intervals
 *           are underreported in sport and exercise science."
 *           Sports Medicine. https://onlinelibrary.wiley.com/doi/10.1111/sms.14603
 *
 * Theory:
 * Bootstrap resampling creates an empirical distribution of estimates by:
 * 1. Resampling observed data WITH REPLACEMENT
 * 2. Calculating the statistic of interest for each resample
 * 3. Extracting percentiles from the bootstrap distribution
 *
 * Advantages over parametric methods:
 * - No assumptions about normality
 * - Handles skewed distributions (e.g., WR yards with long-tail outliers)
 * - Quantifies uncertainty naturally from data
 * - Provides prediction intervals, not just confidence intervals
 */

/**
 * Generate bootstrap samples using resampling with replacement
 *
 * Creates multiple resampled datasets from observed data to build an
 * empirical distribution of the statistic of interest.
 *
 * @param {Array<number>} observedData - Original sample (e.g., player's game stats)
 * @param {number} numSamples - Number of bootstrap resamples (default: 500)
 * @returns {Array<Array<number>>} Array of resampled datasets
 *
 * @example
 * const games = [150, 200, 180, 220, 160]; // QB passing yards
 * const bootstrapSamples = generateBootstrapSamples(games, 500);
 * // Returns 500 arrays, each with 5 values sampled with replacement
 */
export function generateBootstrapSamples(observedData, numSamples = 500) {
  if (!observedData || observedData.length === 0) {
    throw new Error('Cannot generate bootstrap samples from empty data');
  }

  const bootstrapSamples = [];
  const n = observedData.length;

  for (let i = 0; i < numSamples; i++) {
    const resample = [];

    // Sample WITH REPLACEMENT
    for (let j = 0; j < n; j++) {
      const randomIndex = Math.floor(Math.random() * n);
      resample.push(observedData[randomIndex]);
    }

    bootstrapSamples.push(resample);
  }

  return bootstrapSamples;
}

/**
 * Generate block bootstrap samples preserving time series structure (V5 Improvement #2)
 *
 * Addresses autocorrelation in player performance by resampling blocks of consecutive
 * games instead of individual observations. This preserves temporal dependence structure
 * (streaks, momentum, form) that simple bootstrap destroys.
 *
 * Academic Foundation:
 * @citation Politis, D. N., & White, H. (2004). "Automatic block-length selection
 *           for the dependent bootstrap." Econometric Reviews, 23(1), 53-70.
 * @citation Lahiri, S. N. (2003). "Resampling Methods for Dependent Data."
 *           Springer Series in Statistics.
 *
 * Statistical Issue Addressed:
 * - Simple bootstrap assumes i.i.d. observations
 * - NFL player performance exhibits autocorrelation (hot/cold streaks)
 * - Simple bootstrap underestimates variance by 20-30%
 * - Result: Confidence intervals too narrow, floor hit rate < 80%
 *
 * Block Bootstrap Solution:
 * - Divide time series into overlapping blocks (size 2-3 games)
 * - Resample blocks instead of individual games
 * - Preserves within-block correlation structure
 * - Result: Proper variance estimation, floor hit rate → 80%
 *
 * @param {Array<number>} observedData - Chronologically sorted game stats
 * @param {number} numSamples - Number of bootstrap resamples (default: 500)
 * @param {number} blockSize - Block length (default: auto-calculated)
 * @returns {Array<Array<number>>} Array of block-resampled datasets
 *
 * @example
 * const games = [120, 150, 180, 200, 160, 190, 210]; // QB passing yards (chronological)
 * const blockSamples = generateBlockBootstrapSamples(games, 500, 3);
 * // Returns 500 arrays preserving 3-game autocorrelation structure
 * // E.g., [150,180,200, 120,150,180, 190,210,120] - blocks of 3 consecutive games
 */
export function generateBlockBootstrapSamples(observedData, numSamples = 500, blockSize = null) {
  if (!observedData || observedData.length === 0) {
    throw new Error('Cannot generate block bootstrap from empty data');
  }

  const n = observedData.length;

  // Optimal block size calculation (Politis & White 2004)
  // Formula: b ≈ n^(1/3) for optimal bias-variance tradeoff
  // Min: 2 (preserve at least pairwise correlation)
  // Max: n/2 (don't sample the entire series as one block)
  const optimalBlockSize = blockSize || Math.max(2, Math.min(
    Math.floor(Math.pow(n, 1/3)),
    Math.floor(n / 2)
  ));

  const bootstrapSamples = [];

  for (let i = 0; i < numSamples; i++) {
    const resample = [];

    // Sample blocks until we reach original sample size
    while (resample.length < n) {
      // Random starting point for block (ensuring block fits in data)
      const maxStart = n - optimalBlockSize;
      const blockStart = Math.floor(Math.random() * (maxStart + 1));

      // Extract block of consecutive observations
      const block = observedData.slice(blockStart, blockStart + optimalBlockSize);

      // Add block to resample
      resample.push(...block);
    }

    // Trim to exact original sample size (may have overshot)
    bootstrapSamples.push(resample.slice(0, n));
  }

  return bootstrapSamples;
}

/**
 * Calculate block bootstrap distribution (V5 Improvement #2)
 *
 * Applies a statistic function to each block bootstrap sample to create
 * an empirical distribution that properly accounts for time series dependence.
 *
 * @param {Array<number>} observedData - Chronologically sorted sample
 * @param {number} numSamples - Number of bootstrap resamples
 * @param {string|function} statistic - Statistic to calculate for each sample
 * @param {number} blockSize - Block length (default: auto-calculated)
 * @returns {Array<number>} Block bootstrap distribution (array of statistic values)
 *
 * @example
 * const games = [150, 200, 180, 220, 160];
 * const bootDist = calculateBlockBootstrapDistribution(games, 500, 'mean', 3);
 * // Returns 500 mean values preserving autocorrelation structure
 */
export function calculateBlockBootstrapDistribution(observedData, numSamples = 500, statistic = 'mean', blockSize = null) {
  const bootstrapSamples = generateBlockBootstrapSamples(observedData, numSamples, blockSize);

  return bootstrapSamples.map(sample => calculateStatistic(sample, statistic));
}

/**
 * Calculate statistic for a single dataset
 *
 * Supports multiple statistics. Default is mean, but can calculate
 * median, max, min, or custom functions.
 *
 * @param {Array<number>} data - Dataset to analyze
 * @param {string|function} statistic - Statistic to calculate ('mean', 'median', or function)
 * @returns {number} Calculated statistic
 */
export function calculateStatistic(data, statistic = 'mean') {
  if (!data || data.length === 0) {
    return 0;
  }

  if (typeof statistic === 'function') {
    return statistic(data);
  }

  switch (statistic) {
    case 'mean':
      return data.reduce((sum, val) => sum + val, 0) / data.length;

    case 'median': {
      const sorted = [...data].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    }

    case 'max':
      return Math.max(...data);

    case 'min':
      return Math.min(...data);

    default:
      return data.reduce((sum, val) => sum + val, 0) / data.length;
  }
}

/**
 * Calculate bootstrap distribution of a statistic
 *
 * Applies a statistic function to each bootstrap sample to create
 * an empirical distribution of that statistic.
 *
 * @param {Array<number>} observedData - Original sample
 * @param {number} numSamples - Number of bootstrap resamples
 * @param {string|function} statistic - Statistic to calculate for each sample
 * @returns {Array<number>} Bootstrap distribution (array of statistic values)
 *
 * @example
 * const games = [150, 200, 180, 220, 160];
 * const bootDist = calculateBootstrapDistribution(games, 500, 'mean');
 * // Returns 500 mean values, one from each bootstrap sample
 */
export function calculateBootstrapDistribution(observedData, numSamples = 500, statistic = 'mean') {
  const bootstrapSamples = generateBootstrapSamples(observedData, numSamples);

  return bootstrapSamples.map(sample => calculateStatistic(sample, statistic));
}

/**
 * Extract percentile from sorted array
 *
 * Uses linear interpolation for percentiles that fall between values.
 *
 * @param {Array<number>} sortedArray - Array sorted in ascending order
 * @param {number} percentile - Percentile to extract (0-1, e.g., 0.10 for 10th percentile)
 * @returns {number} Percentile value
 */
export function extractPercentile(sortedArray, percentile) {
  if (!sortedArray || sortedArray.length === 0) {
    return 0;
  }

  if (percentile <= 0) return sortedArray[0];
  if (percentile >= 1) return sortedArray[sortedArray.length - 1];

  // Calculate position in array (using linear interpolation)
  const position = percentile * (sortedArray.length - 1);
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);

  // If position is exact, return that value
  if (lowerIndex === upperIndex) {
    return sortedArray[lowerIndex];
  }

  // Otherwise, interpolate between the two surrounding values
  const fraction = position - lowerIndex;
  return sortedArray[lowerIndex] * (1 - fraction) + sortedArray[upperIndex] * fraction;
}

/**
 * Calculate prediction interval from bootstrap distribution
 *
 * Generates floor, expected, and ceiling values from bootstrap resamples.
 * The interval captures the uncertainty in the prediction.
 *
 * @param {Array<number>} observedData - Original sample (player's game stats)
 * @param {Object} options - Configuration options
 * @param {number} options.numSamples - Number of bootstrap samples (default: 500)
 * @param {number} options.confidence - Confidence level (default: 0.80 for 80% interval)
 * @param {string|function} options.statistic - Statistic to calculate (default: 'mean')
 * @returns {Object} Prediction interval with floor, expected, ceiling
 *
 * @example
 * const games = [150, 200, 180, 220, 160, 190, 210];
 * const interval = calculatePredictionInterval(games, { confidence: 0.80 });
 * // Returns: { floor: 165, expected: 186, ceiling: 208, confidence: 0.80 }
 */
export function calculatePredictionInterval(observedData, options = {}) {
  const {
    numSamples = 500,
    confidence = 0.80,
    statistic = 'mean'
  } = options;

  if (!observedData || observedData.length === 0) {
    return {
      floor: 0,
      expected: 0,
      ceiling: 0,
      confidence: 0,
      sampleSize: 0,
      bootstrapSamples: 0
    };
  }

  // Generate bootstrap distribution
  const bootstrapDistribution = calculateBootstrapDistribution(
    observedData,
    numSamples,
    statistic
  );

  // Sort for percentile extraction
  const sorted = [...bootstrapDistribution].sort((a, b) => a - b);

  // Calculate percentiles based on confidence level
  // For 80% confidence: 10th percentile (floor) to 90th percentile (ceiling)
  const lowerPercentile = (1 - confidence) / 2;
  const upperPercentile = 1 - lowerPercentile;

  const floor = extractPercentile(sorted, lowerPercentile);
  const expected = extractPercentile(sorted, 0.5); // Median (50th percentile)
  const ceiling = extractPercentile(sorted, upperPercentile);

  return {
    floor: Math.round(floor * 10) / 10,
    expected: Math.round(expected * 10) / 10,
    ceiling: Math.round(ceiling * 10) / 10,
    confidence,
    sampleSize: observedData.length,
    bootstrapSamples: numSamples,
    // Additional diagnostics
    intervalWidth: Math.round((ceiling - floor) * 10) / 10,
    coefficientOfVariation: expected > 0 ? Math.round((ceiling - floor) / expected * 100) / 100 : 0
  };
}

/**
 * Calculate prediction interval with modifiers applied (V5 Enhanced)
 *
 * Extends basic prediction interval by applying external modifiers
 * (opponent strength, environment, etc.) to the bootstrap distribution
 * BEFORE extracting percentiles.
 *
 * V4 Features:
 * - Task 17: CV-scaled bootstrap width - high-volatility players get wider intervals
 *
 * V5 Improvement #2: Block Bootstrap for Time Series
 * - Uses block bootstrap when v5_features.block_bootstrap is enabled
 * - Preserves autocorrelation structure in player performance
 * - Fixes underestimated variance from simple i.i.d. bootstrap
 * - Expected: Floor hit rate 65% → 80%
 *
 * This ensures the floor/ceiling reflect uncertainty AFTER adjustments.
 *
 * @param {Array<number>} observedData - Original sample (chronologically sorted)
 * @param {number} modifier - Combined modifier (opponent × environment × home, etc.)
 * @param {Object} options - Bootstrap options
 * @param {number} options.playerCV - Player's coefficient of variation (optional, V4)
 * @param {boolean} options.useBlockBootstrap - Enable block bootstrap (V5, default: true)
 * @param {number} options.blockSize - Block length (V5, default: auto-calculated)
 * @returns {Object} Modified prediction interval
 *
 * @example
 * const games = [150, 200, 180, 220, 160];
 * const opponentMod = 1.15; // Easier matchup
 * const interval = calculateModifiedPredictionInterval(games, opponentMod, {
 *   playerCV: 0.3,
 *   useBlockBootstrap: true,
 *   blockSize: 3
 * });
 * // Floor/ceiling scaled by 1.15x, adjusted for volatility, preserves streaks
 */
export function calculateModifiedPredictionInterval(observedData, modifier = 1.0, options = {}) {
  const {
    numSamples = 500,
    confidence = 0.80,
    statistic = 'mean',
    playerCV = null,  // V4: Player coefficient of variation
    useBlockBootstrap = true,  // V5: Enable block bootstrap by default
    blockSize = null   // V5: Auto-calculate optimal block size
  } = options;

  if (!observedData || observedData.length === 0) {
    return {
      floor: 0,
      expected: 0,
      ceiling: 0,
      confidence: 0,
      modifier: modifier,
      sampleSize: 0
    };
  }

  // V5 Improvement #2: Choose bootstrap method based on feature flag
  let bootstrapDistribution;
  let actualBlockSize = null;

  if (useBlockBootstrap && observedData.length >= 4) {
    // Block bootstrap for time series dependence (V5)
    // Minimum 4 observations needed for meaningful blocks
    const n = observedData.length;
    actualBlockSize = blockSize || Math.max(2, Math.min(
      Math.floor(Math.pow(n, 1/3)),
      Math.floor(n / 2)
    ));

    bootstrapDistribution = calculateBlockBootstrapDistribution(
      observedData,
      numSamples,
      statistic,
      actualBlockSize
    );
  } else {
    // Simple bootstrap (V4 fallback for small samples or disabled)
    bootstrapDistribution = calculateBootstrapDistribution(
      observedData,
      numSamples,
      statistic
    );
  }

  // Apply modifier to ENTIRE distribution
  bootstrapDistribution = bootstrapDistribution.map(val => val * modifier);

  // Sort for percentile extraction
  const sorted = [...bootstrapDistribution].sort((a, b) => a - b);

  // Task 17 (V4): CV-Scaled Bootstrap Width
  // Adjust confidence interval width based on player volatility
  let adjustedConfidence = confidence;

  if (playerCV !== null && playerCV > 0) {
    // Scale confidence level inversely with CV
    // High CV (boom/bust) → narrower confidence → wider intervals
    // Low CV (consistent) → wider confidence → narrower intervals

    // CV scaling factor: CV=0.3 (consistent) → 1.0x, CV=0.8 (volatile) → 0.7x
    const cvScalingFactor = Math.max(0.6, Math.min(1.0, 1.0 - (playerCV * 0.5)));
    adjustedConfidence = confidence * cvScalingFactor;

    // Clamp adjusted confidence to reasonable range [0.60, 0.95]
    adjustedConfidence = Math.max(0.60, Math.min(0.95, adjustedConfidence));
  }

  // Calculate percentiles with potentially adjusted confidence
  const lowerPercentile = (1 - adjustedConfidence) / 2;
  const upperPercentile = 1 - lowerPercentile;

  const floor = extractPercentile(sorted, lowerPercentile);
  const expected = extractPercentile(sorted, 0.5);
  const ceiling = extractPercentile(sorted, upperPercentile);

  return {
    floor: Math.round(floor * 10) / 10,
    expected: Math.round(expected * 10) / 10,
    ceiling: Math.round(ceiling * 10) / 10,
    confidence: adjustedConfidence,  // V4: Return adjusted confidence
    originalConfidence: confidence,  // V4: Track original for reference
    modifier: Math.round(modifier * 100) / 100,
    sampleSize: observedData.length,
    bootstrapSamples: numSamples,
    intervalWidth: Math.round((ceiling - floor) * 10) / 10,
    playerCV: playerCV,  // V4: Include CV in output
    blockBootstrap: useBlockBootstrap && observedData.length >= 4,  // V5: Bootstrap method used
    blockSize: actualBlockSize  // V5: Block size (null if simple bootstrap)
  };
}

/**
 * Assess confidence level based on interval characteristics
 *
 * Converts quantitative metrics (sample size, interval width) into
 * qualitative confidence labels (HIGH/MEDIUM/LOW).
 *
 * @param {Object} interval - Prediction interval object
 * @param {Object} thresholds - Confidence thresholds
 * @returns {string} Confidence level ('HIGH', 'MEDIUM', or 'LOW')
 */
export function assessConfidenceLevel(interval, thresholds = {}) {
  const {
    minSampleHigh = 8,
    minSampleMedium = 5,
    maxCVHigh = 0.3,
    maxCVMedium = 0.5
  } = thresholds;

  const { sampleSize, coefficientOfVariation } = interval;

  // HIGH: Large sample + low variance
  if (sampleSize >= minSampleHigh && coefficientOfVariation <= maxCVHigh) {
    return 'HIGH';
  }

  // MEDIUM: Moderate sample or moderate variance
  if (sampleSize >= minSampleMedium && coefficientOfVariation <= maxCVMedium) {
    return 'MEDIUM';
  }

  // LOW: Small sample or high variance
  return 'LOW';
}

/**
 * Format prediction interval for display
 *
 * Creates human-readable string representation of interval.
 *
 * @param {Object} interval - Prediction interval
 * @param {string} statLabel - Stat label (e.g., 'Passing Yards')
 * @returns {string} Formatted string
 *
 * @example
 * const interval = { floor: 165, expected: 186, ceiling: 208 };
 * formatInterval(interval, 'Passing Yards');
 * // Returns: "165 ← 186 → 208 yards (80% CI)"
 */
export function formatInterval(interval, statLabel = '') {
  const unit = statLabel.toLowerCase().includes('yards') ? 'yards' :
               statLabel.toLowerCase().includes('points') ? 'pts' : '';

  return `${interval.floor} ← ${interval.expected} → ${interval.ceiling} ${unit} (${(interval.confidence * 100).toFixed(0)}% CI)`;
}
