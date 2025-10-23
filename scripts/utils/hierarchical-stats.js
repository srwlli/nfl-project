/**
 * Hierarchical Statistics Module
 *
 * Implements mixed-effects regression for NFL player performance modeling.
 * Separates variance into within-player and between-player components,
 * using empirical Bayes shrinkage to improve small-sample estimates.
 *
 * Academic Foundation:
 * @citation Baughman, B. R., et al. (2024). "A hierarchical approach for
 *           evaluating athlete performance." PMC.
 *           https://pmc.ncbi.nlm.nih.gov/articles/PMC10799012/
 *
 * Theory:
 * Total Variance = Between-Player Variance + Within-Player Variance + Residual
 *
 * For small samples, individual estimates are "shrunk" toward the group mean
 * based on the ratio of within-player to total variance.
 */

/**
 * Calculate mean of an array
 */
function calculateMean(values) {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate variance of an array
 */
function calculateVariance(values) {
  if (!values || values.length < 2) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / (values.length - 1);
}

/**
 * Calculate within-player variance for a single player
 *
 * This measures game-to-game variability for one player's performance.
 * Higher values indicate inconsistent performance.
 *
 * @param {Array} playerGames - Array of stat values from individual games
 * @returns {number} Within-player variance
 */
export function calculateWithinPlayerVariance(playerGames) {
  if (!playerGames || playerGames.length < 2) return 0;
  return calculateVariance(playerGames);
}

/**
 * Calculate between-player variance for a position group
 *
 * This measures how much players at a position differ from each other.
 * Higher values indicate more variability across players (e.g., WRs vs QBs).
 *
 * @param {Array<Array>} allPlayerGames - Array where each element is a player's game array
 * @returns {number} Between-player variance
 */
export function calculateBetweenPlayerVariance(allPlayerGames) {
  if (!allPlayerGames || allPlayerGames.length < 2) return 0;

  // Calculate mean for each player
  const playerMeans = allPlayerGames.map(games => calculateMean(games));

  // Variance of these means is the between-player variance
  return calculateVariance(playerMeans);
}

/**
 * Calculate hierarchical variance decomposition
 *
 * Decomposes total variance into:
 * - Within-player component (game-to-game fluctuation)
 * - Between-player component (talent differences)
 *
 * @param {Array} playerGames - Current player's game stats
 * @param {Array<Array>} allPlayerGames - All players at position (for between-player calculation)
 * @returns {Object} Variance components
 */
export function calculateHierarchicalVariance(playerGames, allPlayerGames) {
  const withinPlayerVariance = calculateWithinPlayerVariance(playerGames);
  const betweenPlayerVariance = calculateBetweenPlayerVariance(allPlayerGames);

  // Total variance approximation
  const totalVariance = withinPlayerVariance + betweenPlayerVariance;

  return {
    withinPlayerVariance,
    betweenPlayerVariance,
    totalVariance,
    // Proportion of variance due to player differences vs game randomness
    betweenPlayerRatio: totalVariance > 0 ? betweenPlayerVariance / totalVariance : 0
  };
}

/**
 * Empirical Bayes Shrinkage Estimator
 *
 * Adjusts individual player estimates toward the position mean based on
 * sample size and variance structure. Players with fewer games are pulled
 * more strongly toward the group average.
 *
 * Formula:
 * shrinkageFactor = withinVariance / (withinVariance + betweenVariance/n)
 * shrunkenEstimate = (shrinkageFactor × positionMean) + ((1 - shrinkageFactor) × playerMean)
 *
 * @citation Baughman et al. (2024) - Empirical Bayes methodology
 *
 * @param {number} playerMean - Player's observed average
 * @param {number} positionMean - Mean across all players at position
 * @param {number} withinPlayerVariance - Player's game-to-game variance
 * @param {number} betweenPlayerVariance - Variance across position
 * @param {number} sampleSize - Number of games for this player
 * @returns {Object} Shrinkage results
 */
export function applyEmpiricalBayesShrinkage(
  playerMean,
  positionMean,
  withinPlayerVariance,
  betweenPlayerVariance,
  sampleSize
) {
  // Avoid division by zero
  if (withinPlayerVariance === 0 && betweenPlayerVariance === 0) {
    return {
      shrunkenEstimate: playerMean,
      shrinkageFactor: 0,
      weightOnPosition: 0,
      weightOnPlayer: 1
    };
  }

  // Calculate shrinkage factor
  // Higher sample size → lower shrinkage (more trust in player data)
  // Higher between-player variance → lower shrinkage (players are truly different)
  const shrinkageFactor = withinPlayerVariance /
    (withinPlayerVariance + (betweenPlayerVariance / sampleSize));

  // Apply shrinkage
  const shrunkenEstimate = (shrinkageFactor * positionMean) +
    ((1 - shrinkageFactor) * playerMean);

  return {
    shrunkenEstimate,
    shrinkageFactor,
    weightOnPosition: shrinkageFactor,
    weightOnPlayer: 1 - shrinkageFactor,
    // How much the estimate moved toward the mean
    shrinkageAmount: Math.abs(playerMean - shrunkenEstimate)
  };
}

/**
 * Calculate position-level statistics for shrinkage baseline
 *
 * @param {Array<Object>} allPlayers - All players at position with their game data
 * @param {string} statField - Stat to analyze (e.g., 'passing_yards')
 * @returns {Object} Position-level statistics
 */
export function calculatePositionStats(allPlayers, statField) {
  // Extract all game values for all players
  const allGameValues = [];
  const allPlayerGames = [];

  for (const player of allPlayers) {
    const playerGames = player.games
      .map(g => g[statField])
      .filter(v => v !== null && v !== undefined && !isNaN(v));

    if (playerGames.length > 0) {
      allGameValues.push(...playerGames);
      allPlayerGames.push(playerGames);
    }
  }

  // Calculate position-level statistics
  const positionMean = calculateMean(allGameValues);
  const betweenPlayerVariance = calculateBetweenPlayerVariance(allPlayerGames);

  // Average within-player variance
  const withinPlayerVariances = allPlayerGames.map(games => calculateWithinPlayerVariance(games));
  const avgWithinPlayerVariance = calculateMean(withinPlayerVariances);

  return {
    positionMean,
    betweenPlayerVariance,
    avgWithinPlayerVariance,
    totalPlayers: allPlayerGames.length,
    totalGames: allGameValues.length
  };
}

/**
 * Apply hierarchical adjustment to player projection
 *
 * Main entry point for hierarchical modeling. Combines variance decomposition
 * with empirical Bayes shrinkage to produce more accurate estimates.
 *
 * @param {Array} playerGames - Current player's game stats
 * @param {Object} positionStats - Position-level baseline statistics
 * @returns {Object} Adjusted projection with hierarchical components
 */
export function applyHierarchicalAdjustment(playerGames, positionStats) {
  const playerMean = calculateMean(playerGames);
  const withinPlayerVariance = calculateWithinPlayerVariance(playerGames);

  // Apply empirical Bayes shrinkage
  const shrinkage = applyEmpiricalBayesShrinkage(
    playerMean,
    positionStats.positionMean,
    withinPlayerVariance,
    positionStats.betweenPlayerVariance,
    playerGames.length
  );

  return {
    // Original estimates
    rawMean: playerMean,
    rawVariance: withinPlayerVariance,

    // Hierarchical adjustments
    shrunkenMean: shrinkage.shrunkenEstimate,
    shrinkageFactor: shrinkage.shrinkageFactor,

    // Variance components
    withinPlayerVariance,
    betweenPlayerVariance: positionStats.betweenPlayerVariance,

    // Interpretation
    trustInPlayerData: shrinkage.weightOnPlayer, // 0-1 scale
    confidenceLevel: playerGames.length >= 6 ? 'HIGH' :
                     playerGames.length >= 3 ? 'MEDIUM' : 'LOW'
  };
}
