/**
 * Temporal Smoothing Module - EWMA (Exponentially Weighted Moving Average)
 *
 * Replaces simple weighted averages with exponential smoothing to give
 * higher weight to recent performances. Captures momentum and form changes
 * better than equal weighting within rolling windows.
 *
 * Academic Foundation:
 * @citation Zhang, Y., et al. (2025). "A narrative review of deep learning
 *           applications in sports." PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC12382096/
 *
 * Theory:
 * EWMA gives exponentially decreasing weights to older observations:
 *   EWMA_t = α × X_t + (1 - α) × EWMA_(t-1)
 *
 * Where:
 * - α (alpha) = smoothing factor (0.2-0.5 for NFL data)
 * - Higher α = more weight on recent games (responsive to changes)
 * - Lower α = more smoothing (stable, less reactive)
 */

/**
 * Calculate Exponentially Weighted Moving Average
 *
 * @param {Array<Object>} games - Game objects sorted by week (oldest first)
 * @param {string} statField - Stat field to calculate EWMA for
 * @param {number} alpha - Smoothing factor (0-1, default: 0.3)
 * @returns {number} EWMA value
 *
 * @example
 * const games = [
 *   { week: 1, passing_yards: 200 },
 *   { week: 2, passing_yards: 180 },
 *   { week: 3, passing_yards: 220 }
 * ];
 * const ewma = calculateEWMA(games, 'passing_yards', 0.3);
 * // Returns ~206 (more weight on week 3)
 */
export function calculateEWMA(games, statField, alpha = 0.3) {
  if (!games || games.length === 0) {
    return 0;
  }

  // Sort by week ascending (oldest first) to apply weights correctly
  const sortedGames = [...games].sort((a, b) => a.week - b.week);

  // Initialize with first game value
  let ewma = sortedGames[0][statField];

  // Apply exponential smoothing
  for (let i = 1; i < sortedGames.length; i++) {
    const currentValue = sortedGames[i][statField];

    if (currentValue !== null && currentValue !== undefined && !isNaN(currentValue)) {
      ewma = (alpha * currentValue) + ((1 - alpha) * ewma);
    }
  }

  return ewma;
}

/**
 * Calculate EWMA with adaptive alpha based on variance
 *
 * Uses higher alpha (more responsive) when recent variance is high,
 * indicating player's performance is changing.
 *
 * @param {Array<Object>} games - Game objects
 * @param {string} statField - Stat field
 * @param {number} baseAlpha - Base smoothing factor (default: 0.3)
 * @returns {Object} EWMA value and effective alpha used
 */
export function calculateAdaptiveEWMA(games, statField, baseAlpha = 0.3) {
  if (!games || games.length < 3) {
    return {
      ewma: games?.length > 0 ? games[games.length - 1][statField] : 0,
      alpha: baseAlpha
    };
  }

  // Calculate recent variance (last 3 games)
  const recent = games.slice(-3);
  const recentValues = recent.map(g => g[statField]).filter(v => v !== null && !isNaN(v));

  if (recentValues.length < 2) {
    return { ewma: calculateEWMA(games, statField, baseAlpha), alpha: baseAlpha };
  }

  const mean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const variance = recentValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentValues.length;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;

  // Adaptive alpha: higher CV = higher alpha (more responsive to changes)
  const adaptiveAlpha = Math.min(0.6, Math.max(0.2, baseAlpha + (cv * 0.3)));

  return {
    ewma: calculateEWMA(games, statField, adaptiveAlpha),
    alpha: adaptiveAlpha
  };
}

/**
 * Calculate trend momentum using linear regression on EWMA values
 *
 * @param {Array<Object>} games - Game objects
 * @param {string} statField - Stat field
 * @returns {Object} Trend information
 */
export function calculateEWMATrend(games, statField, alpha = 0.3) {
  if (!games || games.length < 3) {
    return { trend: 'stable', slope: 0, direction: 0 };
  }

  // Calculate EWMA for each game in sequence
  const sortedGames = [...games].sort((a, b) => a.week - b.week);
  const ewmaValues = [];

  let ewma = sortedGames[0][statField];
  ewmaValues.push(ewma);

  for (let i = 1; i < sortedGames.length; i++) {
    const currentValue = sortedGames[i][statField];
    if (currentValue !== null && !isNaN(currentValue)) {
      ewma = (alpha * currentValue) + ((1 - alpha) * ewma);
      ewmaValues.push(ewma);
    }
  }

  // Simple slope calculation (change per game)
  const n = ewmaValues.length;
  if (n < 2) {
    return { trend: 'stable', slope: 0, direction: 0 };
  }

  const slope = (ewmaValues[n - 1] - ewmaValues[0]) / (n - 1);
  const avgValue = ewmaValues.reduce((a, b) => a + b, 0) / n;
  const slopePercent = avgValue > 0 ? slope / avgValue : 0;

  // Classify trend
  let trend = 'stable';
  let direction = 0;

  if (slopePercent > 0.05) {
    trend = 'improving';
    direction = 1;
  } else if (slopePercent < -0.05) {
    trend = 'declining';
    direction = -1;
  }

  return {
    trend,
    slope,
    slopePercent,
    direction,
    ewmaValues
  };
}

/**
 * Calculate position-specific EWMA alpha values
 *
 * Different positions have different volatility patterns.
 * QBs are more consistent (lower alpha), WRs are more volatile (higher alpha).
 *
 * @param {string} position - Player position
 * @returns {number} Recommended alpha value
 */
export function getPositionAlpha(position) {
  const alphaByPosition = {
    'QB': 0.25,  // Most consistent position
    'RB': 0.35,  // Moderate volatility
    'WR': 0.40,  // High volatility (targets vary)
    'TE': 0.30   // Moderate consistency
  };

  return alphaByPosition[position] || 0.3;
}

/**
 * Calculate weighted projection using EWMA
 *
 * Combines season average with EWMA-based recent form.
 *
 * @param {Array<Object>} seasonGames - All season games
 * @param {Array<Object>} recentGames - Recent games subset
 * @param {string} statField - Stat to project
 * @param {string} position - Player position
 * @returns {Object} Projection with EWMA components
 */
export function calculateEWMAProjection(seasonGames, recentGames, statField, position) {
  if (!seasonGames || seasonGames.length === 0) {
    return { projection: 0, seasonAvg: 0, ewma: 0, trend: 'stable' };
  }

  // Season average (simple)
  const seasonValues = seasonGames.map(g => g[statField]).filter(v => v !== null && !isNaN(v));
  const seasonAvg = seasonValues.reduce((a, b) => a + b, 0) / seasonValues.length;

  // EWMA on recent games
  const alpha = getPositionAlpha(position);
  const { ewma, alpha: effectiveAlpha } = calculateAdaptiveEWMA(recentGames, statField, alpha);

  // Trend detection
  const trendInfo = calculateEWMATrend(recentGames, statField, alpha);

  // Weighted projection (40% season, 60% EWMA)
  const projection = (seasonAvg * 0.4) + (ewma * 0.6);

  return {
    projection,
    seasonAvg,
    ewma,
    alpha: effectiveAlpha,
    trend: trendInfo.trend,
    trendSlope: trendInfo.slope
  };
}
