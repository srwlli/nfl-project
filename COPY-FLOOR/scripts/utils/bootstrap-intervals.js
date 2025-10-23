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
 * @param {number} options.bootstrapPercentile - Bootstrap percentile level (default: 0.80 for 80% interval)
 * @param {string|function} options.statistic - Statistic to calculate (default: 'mean')
 * @returns {Object} Prediction interval with floor, expected, ceiling
 *
 * @example
 * const games = [150, 200, 180, 220, 160, 190, 210];
 * const interval = calculatePredictionInterval(games, { bootstrapPercentile: 0.80 });
 * // Returns: { floor: 165, expected: 186, ceiling: 208, bootstrapPercentile: 0.80 }
 */
export function calculatePredictionInterval(observedData, options = {}) {
  const {
    numSamples = 500,
    bootstrapPercentile = 0.80,
    statistic = 'mean'
  } = options;

  if (!observedData || observedData.length === 0) {
    return {
      floor: 0,
      expected: 0,
      ceiling: 0,
      bootstrapPercentile: 0,
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

  // Calculate percentiles based on bootstrap percentile level
  // For 80% percentile: 10th percentile (floor) to 90th percentile (ceiling)
  const lowerPercentile = (1 - bootstrapPercentile) / 2;
  const upperPercentile = 1 - lowerPercentile;

  const floor = extractPercentile(sorted, lowerPercentile);
  const expected = extractPercentile(sorted, 0.5); // Median (50th percentile)
  const ceiling = extractPercentile(sorted, upperPercentile);

  return {
    floor: Math.round(floor * 10) / 10,
    expected: Math.round(expected * 10) / 10,
    ceiling: Math.round(ceiling * 10) / 10,
    bootstrapPercentile,
    sampleSize: observedData.length,
    bootstrapSamples: numSamples,
    // Additional diagnostics
    intervalWidth: Math.round((ceiling - floor) * 10) / 10,
    coefficientOfVariation: expected > 0 ? Math.round((ceiling - floor) / expected * 100) / 100 : 0
  };
}

/**
 * Calculate prediction interval with modifiers applied
 *
 * Extends basic prediction interval by applying external modifiers
 * (opponent strength, environment, etc.) to the bootstrap distribution
 * BEFORE extracting percentiles.
 *
 * This ensures the floor/ceiling reflect uncertainty AFTER adjustments.
 *
 * @param {Array<number>} observedData - Original sample
 * @param {number} modifier - Combined modifier (opponent × environment × home, etc.)
 * @param {Object} options - Bootstrap options
 * @returns {Object} Modified prediction interval
 *
 * @example
 * const games = [150, 200, 180, 220, 160];
 * const opponentMod = 1.15; // Easier matchup
 * const interval = calculateModifiedPredictionInterval(games, opponentMod);
 * // Floor/ceiling scaled by 1.15x
 */
export function calculateModifiedPredictionInterval(observedData, modifier = 1.0, options = {}) {
  const {
    numSamples = 500,
    bootstrapPercentile = 0.80,
    statistic = 'mean'
  } = options;

  if (!observedData || observedData.length === 0) {
    return {
      floor: 0,
      expected: 0,
      ceiling: 0,
      bootstrapPercentile: 0,
      modifier: modifier,
      sampleSize: 0
    };
  }

  // Generate bootstrap distribution
  let bootstrapDistribution = calculateBootstrapDistribution(
    observedData,
    numSamples,
    statistic
  );

  // Apply modifier to ENTIRE distribution
  bootstrapDistribution = bootstrapDistribution.map(val => val * modifier);

  // Sort for percentile extraction
  const sorted = [...bootstrapDistribution].sort((a, b) => a - b);

  // Calculate percentiles
  const lowerPercentile = (1 - bootstrapPercentile) / 2;
  const upperPercentile = 1 - lowerPercentile;

  const floor = extractPercentile(sorted, lowerPercentile);
  const expected = extractPercentile(sorted, 0.5);
  const ceiling = extractPercentile(sorted, upperPercentile);

  return {
    floor: Math.round(floor * 10) / 10,
    expected: Math.round(expected * 10) / 10,
    ceiling: Math.round(ceiling * 10) / 10,
    bootstrapPercentile,
    modifier: Math.round(modifier * 100) / 100,
    sampleSize: observedData.length,
    bootstrapSamples: numSamples,
    intervalWidth: Math.round((ceiling - floor) * 10) / 10
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
