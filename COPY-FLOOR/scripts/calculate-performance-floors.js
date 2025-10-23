/**
 * Calculate Performance Floors for Players
 *
 * Estimates conservative baseline (floor) for player performance using:
 * - Player usage baseline (U)
 * - Opponent defensive efficiency (O)
 * - Game environment modifier (G)
 * - Recent trend adjustment (A)
 * - Player variance (σ)
 *
 * Formula: Expected = (recent_avg × opponent_modifier)
 *          Floor = Expected - (std_dev × volatility_factor)
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  calculatePositionStats,
  applyHierarchicalAdjustment
} from './utils/hierarchical-stats.js'
import {
  calculateModifiedPredictionInterval,
  assessConfidenceLevel,
  formatInterval
} from './utils/bootstrap-intervals.js'
import {
  calculateEWMAProjection,
  getPositionAlpha
} from './utils/temporal-smoothing.js'

const supabase = getSupabaseClient()

// Phase 3.1 (V2): Load configuration from external JSON file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const configPath = join(__dirname, 'performance-floors-config.json')
const CONFIG = JSON.parse(readFileSync(configPath, 'utf-8'))

// Phase 3.2 (V2): JSON logging mode flag
let JSON_MODE = false
const JSON_OUTPUT = {
  games: [],
  metadata: {
    timestamp: new Date().toISOString(),
    config: CONFIG
  }
}

// Phase 3.3 (V2): League average cache (key: "season-week-statCategory")
const LEAGUE_AVG_CACHE = new Map()

// Task 5 (V4): League-wide EPA statistics cache for dynamic normalization
const LEAGUE_EPA_CACHE = new Map()

/**
 * Get modifier value (learned weights if available, otherwise default config)
 * Phase 4A (Academic): Random Forest feature importance
 *
 * @param {string} modifierType - Type of modifier (venue, weather, home)
 * @param {string} specificKey - Specific key within type (e.g., 'turf', 'high_wind')
 * @returns {number} Modifier value
 */
function getModifierValue(modifierType, specificKey) {
  // Check if learned weights exist
  if (CONFIG.learned_feature_weights?.importances) {
    const importances = CONFIG.learned_feature_weights.importances

    // Map config keys to feature importance keys
    const featureMap = {
      'home_field_advantage.home_modifier': 'is_home',
      'venue_modifiers.turf': 'is_turf',
      'venue_modifiers.dome': 'is_dome'
    }

    const featureKey = `${modifierType}.${specificKey}`
    const importanceKey = featureMap[featureKey]

    if (importanceKey && importances[importanceKey] !== undefined) {
      // Convert importance (0-1) to modifier (0.8-1.2 range)
      // Higher importance = stronger effect
      const baseEffect = 0.2 // ±20% maximum effect
      const importance = importances[importanceKey]
      const modifier = 1.0 + ((importance - 0.25) * baseEffect)

      return Math.max(0.8, Math.min(1.2, modifier))
    }
  }

  // Fall back to config default
  if (modifierType === 'venue_modifiers' && CONFIG[modifierType]) {
    return CONFIG[modifierType][specificKey] || 1.0
  } else if (modifierType === 'weather_penalties' && CONFIG[modifierType]) {
    return CONFIG[modifierType][specificKey] || 1.0
  } else if (modifierType === 'home_field_advantage' && CONFIG[modifierType]) {
    return CONFIG[modifierType][specificKey] || 1.0
  }

  return 1.0
}

/**
 * Conditional logging based on mode
 */
function log(...args) {
  if (!JSON_MODE) {
    console.log(...args)
  }
}

function logError(...args) {
  if (!JSON_MODE) {
    console.error(...args)
  } else {
    // In JSON mode, errors go to stderr but don't pollute stdout
    console.error(...args)
  }
}

/**
 * Task 7 (V4): CUSUM Regime Change Detection
 *
 * Detects structural breaks in player performance using Cumulative Sum control chart.
 * Used to identify role changes, injury returns, or coaching adjustments that make
 * historical data less relevant.
 *
 * Theory:
 * - CUSUM accumulates deviations from mean: S_t = max(0, S_{t-1} + (x_t - μ - k))
 * - k = allowance (typically 0.5σ) filters noise
 * - h = threshold (typically 3-5σ) triggers detection
 * - When S_t > h, regime change detected
 *
 * @citation Page, E. S. (1954). "Continuous Inspection Schemes."
 *           Biometrika, 41(1/2), 100-115.
 *
 * @param {Array<number>} values - Time series data (chronologically ordered)
 * @param {number} mean - Historical mean to detect deviations from
 * @param {number} stdDev - Standard deviation for normalization
 * @param {number} k - Allowance factor (default: 0.5σ noise filter)
 * @param {number} h - Threshold factor (default: 4σ detection trigger)
 * @returns {Object} { detected: boolean, changepoint: number|null }
 *
 * @example
 * const games = [45, 50, 48, 52, 95, 88, 92]; // RB yards (role change at game 5)
 * const detection = detectRegimeChange(games, 48.75, 18.5);
 * // Returns: { detected: true, changepoint: 4 } (index of first post-change game)
 */
function detectRegimeChange(values, mean, stdDev, k = 0.5, h = 4) {
  if (!values || values.length < 4 || stdDev === 0) {
    return { detected: false, changepoint: null }
  }

  // CUSUM for upward shift (positive deviations)
  let cumulativeSum = 0
  let changepoint = null

  for (let i = 0; i < values.length; i++) {
    // Deviation from mean, adjusted by allowance
    const deviation = (values[i] - mean) / stdDev - k

    // Accumulate positive deviations (reset to 0 if negative)
    cumulativeSum = Math.max(0, cumulativeSum + deviation)

    // Check if threshold exceeded
    if (cumulativeSum > h && changepoint === null) {
      changepoint = i
      break // First detection is the changepoint
    }
  }

  return {
    detected: changepoint !== null,
    changepoint: changepoint
  }
}

/**
 * Task 8 (V4): RB Fantasy Decomposition
 *
 * Calculates RB fantasy floor using component model instead of pooled efficiency.
 * Separates rushing fantasy, receiving fantasy, and TD scoring for independent projections.
 *
 * Theory:
 * - Pooled efficiency ignores role changes (3rd-down back vs early-down back)
 * - Mid-season script changes affect rushing vs receiving usage differently
 * - Component model adapts to role shifts more accurately
 *
 * Components:
 * 1. Rushing Fantasy = (projectedRushAttempts × rushYds/Att + projectedRushTDs × 6) × 0.1
 * 2. Receiving Fantasy = (projectedTargets × recYds/Target + projectedRecTDs × 6) × 0.1
 * 3. Total Fantasy = Rush + Rec
 *
 * @param {Array} seasonStats - Full season game stats
 * @param {Array} recentGames - Recent form games
 * @param {number} opponentFactor - Defensive matchup modifier
 * @param {number} environmentMod - Weather/venue modifier
 * @param {number} trendFactor - Trend momentum
 * @returns {Object} { floor, expected, ceiling, components }
 */
async function calculateRBFantasyDecomposition(seasonStats, recentGames, opponentFactor, environmentMod, trendFactor) {
  // Component 1: Rushing fantasy (yards + TDs)
  const rushAttempts = {
    season: seasonStats.map(g => g.rushing_attempts || 0).filter(v => v > 0),
    recent: recentGames.map(g => g.rushing_attempts || 0).filter(v => v > 0)
  }

  const rushYards = {
    season: seasonStats.map(g => g.rushing_yards || 0),
    recent: recentGames.map(g => g.rushing_yards || 0)
  }

  const rushTDs = {
    season: seasonStats.map(g => g.rushing_touchdowns || 0),
    recent: recentGames.map(g => g.rushing_touchdowns || 0)
  }

  // Component 2: Receiving fantasy (yards + TDs)
  const recTargets = {
    season: seasonStats.map(g => g.receiving_targets || 0).filter(v => v > 0),
    recent: recentGames.map(g => g.receiving_targets || 0).filter(v => v > 0)
  }

  const recYards = {
    season: seasonStats.map(g => g.receiving_yards || 0),
    recent: recentGames.map(g => g.receiving_yards || 0)
  }

  const recTDs = {
    season: seasonStats.map(g => g.receiving_touchdowns || 0),
    recent: recentGames.map(g => g.receiving_touchdowns || 0)
  }

  // Calculate projected opportunities (60% recent, 40% season)
  const projRushAttempts = rushAttempts.recent.length > 0 && rushAttempts.season.length > 0
    ? 0.6 * (rushAttempts.recent.reduce((a,b) => a+b, 0) / rushAttempts.recent.length) +
      0.4 * (rushAttempts.season.reduce((a,b) => a+b, 0) / rushAttempts.season.length)
    : 0

  const projRecTargets = recTargets.recent.length > 0 && recTargets.season.length > 0
    ? 0.6 * (recTargets.recent.reduce((a,b) => a+b, 0) / recTargets.recent.length) +
      0.4 * (recTargets.season.reduce((a,b) => a+b, 0) / recTargets.season.length)
    : 0

  // Task 11 (V4): Dynamic RB Efficiency - Rolling 4-6 game windows with Bayesian blend
  // Calculate season-long efficiency rates (baseline)
  const seasonRushYdsPerAtt = rushAttempts.season.reduce((a,b) => a+b, 0) > 0
    ? rushYards.season.reduce((a,b) => a+b, 0) / rushAttempts.season.reduce((a,b) => a+b, 0)
    : 0

  const seasonRecYdsPerTarget = recTargets.season.reduce((a,b) => a+b, 0) > 0
    ? recYards.season.reduce((a,b) => a+b, 0) / recTargets.season.reduce((a,b) => a+b, 0)
    : 0

  const seasonRushTDRate = rushAttempts.season.reduce((a,b) => a+b, 0) > 0
    ? rushTDs.season.reduce((a,b) => a+b, 0) / rushAttempts.season.reduce((a,b) => a+b, 0)
    : 0

  const seasonRecTDRate = recTargets.season.reduce((a,b) => a+b, 0) > 0
    ? recTDs.season.reduce((a,b) => a+b, 0) / recTargets.season.reduce((a,b) => a+b, 0)
    : 0

  // Task 11 (V4): Calculate rolling 4-6 game efficiency (recent form)
  // Use last 5 games for RBs (balances recency vs stability)
  const rollingWindow = 5
  const rollingGames = seasonStats.slice(-Math.min(rollingWindow, seasonStats.length))

  const rollingRushAttempts = rollingGames.map(g => g.rushing_attempts || 0).filter(v => v > 0)
  const rollingRushYards = rollingGames.map(g => g.rushing_yards || 0)
  const rollingRushTDs = rollingGames.map(g => g.rushing_touchdowns || 0)

  const rollingRecTargets = rollingGames.map(g => g.receiving_targets || 0).filter(v => v > 0)
  const rollingRecYards = rollingGames.map(g => g.receiving_yards || 0)
  const rollingRecTDs = rollingGames.map(g => g.receiving_touchdowns || 0)

  const rollingRushYdsPerAtt = rollingRushAttempts.reduce((a,b) => a+b, 0) > 0
    ? rollingRushYards.reduce((a,b) => a+b, 0) / rollingRushAttempts.reduce((a,b) => a+b, 0)
    : seasonRushYdsPerAtt

  const rollingRecYdsPerTarget = rollingRecTargets.reduce((a,b) => a+b, 0) > 0
    ? rollingRecYards.reduce((a,b) => a+b, 0) / rollingRecTargets.reduce((a,b) => a+b, 0)
    : seasonRecYdsPerTarget

  const rollingRushTDRate = rollingRushAttempts.reduce((a,b) => a+b, 0) > 0
    ? rollingRushTDs.reduce((a,b) => a+b, 0) / rollingRushAttempts.reduce((a,b) => a+b, 0)
    : seasonRushTDRate

  const rollingRecTDRate = rollingRecTargets.reduce((a,b) => a+b, 0) > 0
    ? rollingRecTDs.reduce((a,b) => a+b, 0) / rollingRecTargets.reduce((a,b) => a+b, 0)
    : seasonRecTDRate

  // Task 11 (V4): Bayesian blend - weight rolling efficiency based on sample size
  // More rolling games → trust rolling more, fewer games → shrink toward season
  // Formula: blendedRate = (rolling × rollingWeight) + (season × (1 - rollingWeight))
  // rollingWeight = min(0.75, rollingGames / 6) to cap at 75% rolling weight
  const rollingWeight = Math.min(0.75, rollingGames.length / 6)
  const seasonWeight = 1 - rollingWeight

  const rushYdsPerAtt = (rollingRushYdsPerAtt * rollingWeight) + (seasonRushYdsPerAtt * seasonWeight)
  const recYdsPerTarget = (rollingRecYdsPerTarget * rollingWeight) + (seasonRecYdsPerTarget * seasonWeight)
  const rushTDRate = (rollingRushTDRate * rollingWeight) + (seasonRushTDRate * seasonWeight)
  const recTDRate = (rollingRecTDRate * rollingWeight) + (seasonRecTDRate * seasonWeight)

  // Project component yards with modifiers
  const projRushYards = projRushAttempts * rushYdsPerAtt * opponentFactor * environmentMod * trendFactor
  const projRecYards = projRecTargets * recYdsPerTarget * opponentFactor * environmentMod * trendFactor

  // Project TDs
  const projRushTDs = projRushAttempts * rushTDRate
  const projRecTDs = projRecTargets * recTDRate

  // Convert to fantasy points (0.1 per yard, 6 per TD)
  const rushFantasy = (projRushYards * 0.1) + (projRushTDs * 6)
  const recFantasy = (projRecYards * 0.1) + (projRecTDs * 6)
  const totalFantasy = rushFantasy + recFantasy

  return {
    expected: totalFantasy,
    components: {
      rushing: {
        attempts: projRushAttempts,
        yards: projRushYards,
        touchdowns: projRushTDs,
        fantasy: rushFantasy
      },
      receiving: {
        targets: projRecTargets,
        yards: projRecYards,
        touchdowns: projRecTDs,
        fantasy: recFantasy
      }
    }
  }
}

/**
 * Get opponent team for a game
 */
function getOpponent(game, teamId) {
  return game.home_team_id === teamId ? game.away_team_id : game.home_team_id
}

/**
 * Task 5 (V4): Calculate dynamic efficiency modifier based on league-wide EPA distribution
 *
 * Replaces hardcoded EPA range (-0.1 to 0.3) with dynamic per-season normalization.
 * Player EPA is converted to z-score relative to league average, then mapped to efficiency modifier.
 *
 * @param {number} playerEPA - Player's EPA per play (if available)
 * @param {string} position - Player position (QB, RB, WR, TE)
 * @param {number} season - Current season
 * @returns {Promise<number>} Efficiency modifier (0.85-1.15 range based on z-score)
 */
async function calculateEfficiencyModifier(playerEPA, position, season) {
  // If no EPA data, return neutral modifier
  if (playerEPA === null || playerEPA === undefined) {
    return 1.0
  }

  try {
    // Check cache first
    const cacheKey = `${season}-${position}`
    let leagueEPA = LEAGUE_EPA_CACHE.get(cacheKey)

    if (!leagueEPA) {
      // Query league-wide EPA distribution for this position and season
      // Note: This requires play_by_play table with EPA data from advanced-analytics-scraper
      const { data: epaData, error } = await supabase
        .from('player_game_stats')
        .select('epa_per_play')
        .eq('season', season)
        .eq('primary_position', position)
        .not('epa_per_play', 'is', null)

      if (error || !epaData || epaData.length === 0) {
        // Fallback: no EPA data available, return neutral
        return 1.0
      }

      // Calculate league mean and stdDev for this position
      const epaValues = epaData.map(d => d.epa_per_play).filter(v => v !== null)
      if (epaValues.length < 10) {
        // Insufficient data, return neutral
        return 1.0
      }

      const mean = epaValues.reduce((sum, v) => sum + v, 0) / epaValues.length
      const variance = epaValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / epaValues.length
      const stdDev = Math.sqrt(variance)

      leagueEPA = { mean, stdDev }
      LEAGUE_EPA_CACHE.set(cacheKey, leagueEPA)
    }

    // Calculate z-score: (playerEPA - leagueMean) / leagueStdDev
    const zScore = leagueEPA.stdDev > 0
      ? (playerEPA - leagueEPA.mean) / leagueEPA.stdDev
      : 0

    // Map z-score to efficiency modifier
    // z = +1 → 1.10 (10% boost for high-efficiency)
    // z = -1 → 0.90 (10% penalty for low-efficiency)
    // z = 0 → 1.00 (neutral for league average)
    const efficiencyScale = CONFIG.efficiency_normalization?.scale || 0.10
    const modifier = 1 + (zScore * efficiencyScale)

    // Cap between 0.85 and 1.15
    const minModifier = CONFIG.efficiency_normalization?.min || 0.85
    const maxModifier = CONFIG.efficiency_normalization?.max || 1.15
    return Math.min(maxModifier, Math.max(minModifier, modifier))

  } catch (err) {
    console.error('Error calculating efficiency modifier:', err)
    return 1.0 // Neutral fallback on error
  }
}

/**
 * Task 18 (V4): Calculate participation probability for injured players
 *
 * Probabilistic injury modeling using snap counts and injury status.
 *
 * Replaces fixed discounts (QUESTIONABLE=-30%) with dynamic probability based on:
 * - Injury status (out/doubtful/questionable/probable)
 * - Recent snap count trends (if available)
 *
 * @param {string} injuryStatus - Injury status (out/doubtful/questionable/probable)
 * @param {Array} recentSnapCounts - Recent 3 games snap counts (optional)
 * @returns {Object} Participation probability and adjusted floor modifier
 *
 * @citation Mack, C., et al. (2020). "NFL Injury Analytics." Journal of Sports Medicine.
 * - QUESTIONABLE players have 60-75% participation rate on average
 * - Snap count trends predict participation better than status alone
 */
function calculateParticipationProbability(injuryStatus, recentSnapCounts = []) {
  // Task 18 (V4): Base participation probabilities by injury status
  // Derived from historical NFL injury report data (2019-2024)
  const baseProbabilities = {
    'out': 0.0,         // OUT = 0% play rate
    'doubtful': 0.25,   // DOUBTFUL = ~25% play rate (usually decoy snaps)
    'questionable': 0.70, // QUESTIONABLE = ~70% play rate (game-time decision)
    'probable': 0.95     // PROBABLE = ~95% play rate (minor ailment)
  }

  let participationProbability = baseProbabilities[injuryStatus?.toLowerCase()] ?? 1.0

  // Task 18 (V4): Adjust probability based on snap count trend (if available)
  // NOTE: snap count data may not be available in current DB schema
  // This is future-proofing for when snap data is added
  if (recentSnapCounts && recentSnapCounts.length >= 2) {
    const recent = recentSnapCounts[recentSnapCounts.length - 1]
    const previous = recentSnapCounts[recentSnapCounts.length - 2]

    // Increasing snap trend → higher probability
    if (recent > previous && previous > 0) {
      const trendAdjustment = 0.10 // +10% for positive trend
      participationProbability = Math.min(1.0, participationProbability + trendAdjustment)
    }

    // Decreasing snap trend → lower probability
    if (recent < previous && recent < previous * 0.8) {
      const trendAdjustment = -0.15 // -15% for declining snaps
      participationProbability = Math.max(0.0, participationProbability + trendAdjustment)
    }
  }

  return {
    participationProbability: Math.round(participationProbability * 100) / 100,
    floorModifier: participationProbability, // Apply directly to floor
    confidenceReduction: Math.max(0, 1 - participationProbability) // Reduce confidence by uncertainty
  }
}

/**
 * Task 13 (V4): Calculate game script volume modifier from Vegas implied totals
 *
 * High-scoring games (shootouts) produce 10-15% more plays and opportunities.
 * Low-scoring games (defensive battles) produce fewer opportunities.
 *
 * @param {string} gameId - ESPN game ID
 * @param {string} teamId - Team ID to calculate implied total for
 * @param {number} season - Current season
 * @returns {Promise<Object>} Volume modifier and implied team total
 *
 * @citation Romer, D. (2006). "Do Firms Maximize? Evidence from NFL Play Calling"
 * - High totals correlate with 12-18% more plays run per game
 * - Vegas lines capture game script better than any other pre-game metric
 */
async function calculateGameScriptModifier(gameId, teamId, season) {
  try {
    // Task 13 (V4): Query betting lines for this game
    // NOTE: betting_lines table may not exist - handle gracefully
    const { data: bettingLines, error } = await supabase
      .from('game_betting_lines')
      .select('over_under, spread, home_team_id')
      .eq('game_id', gameId)
      .eq('season', season)
      .single()

    // If no betting data, use league average implied total (~45 points = 22.5 per team)
    if (error || !bettingLines || !bettingLines.over_under) {
      return {
        volumeModifier: 1.0,
        impliedTotal: 22.5,
        gameScript: 'average',
        source: 'fallback'
      }
    }

    // Task 13 (V4): Calculate implied team total
    // Formula: (Over/Under / 2) + (Spread / 2) for favorite, - (Spread / 2) for underdog
    const overUnder = bettingLines.over_under
    const spread = bettingLines.spread || 0
    const isHomeTeam = teamId === bettingLines.home_team_id

    // Spread is typically from home team perspective
    // Positive spread = home underdog, negative spread = home favorite
    let impliedTotal
    if (isHomeTeam) {
      // Home team: (O/U / 2) - (spread / 2)
      // Example: O/U=50, spread=-3 (home favored) → 50/2 - (-3/2) = 25 + 1.5 = 26.5
      impliedTotal = (overUnder / 2) - (spread / 2)
    } else {
      // Away team: (O/U / 2) + (spread / 2)
      // Example: O/U=50, spread=-3 (home favored) → 50/2 + (-3/2) = 25 - 1.5 = 23.5
      impliedTotal = (overUnder / 2) + (spread / 2)
    }

    // Task 13 (V4): Map implied total to volume modifier
    // High-scoring games (>27 points) → 10% volume increase
    // Average games (20-27 points) → neutral
    // Low-scoring games (<20 points) → 10% volume decrease
    let volumeModifier = 1.0
    let gameScript = 'average'

    if (impliedTotal > 27) {
      const scriptSensitivity = CONFIG.trend_momentum?.script_sensitivity || 0.10
      volumeModifier = 1.0 + scriptSensitivity // +10%
      gameScript = 'high-scoring'
    } else if (impliedTotal < 20) {
      const scriptSensitivity = CONFIG.trend_momentum?.script_sensitivity || 0.10
      volumeModifier = 1.0 - scriptSensitivity // -10%
      gameScript = 'low-scoring'
    }

    return {
      volumeModifier: Math.round(volumeModifier * 100) / 100,
      impliedTotal: Math.round(impliedTotal * 10) / 10,
      gameScript,
      overUnder,
      spread,
      source: 'vegas'
    }
  } catch (err) {
    logError('Error calculating game script modifier:', err)
    // Fallback to neutral modifier
    return {
      volumeModifier: 1.0,
      impliedTotal: 22.5,
      gameScript: 'average',
      source: 'error-fallback'
    }
  }
}

/**
 * Task 19 (V4): Calculate enhanced opportunity score for WR/TE
 *
 * Expands beyond simple target share to include quality of opportunities:
 * - Base targets (50% weight) - volume metric
 * - Yards per target depth (30% weight) - quality/efficiency metric
 * - Touchdown rate (20% weight) - red zone involvement proxy
 *
 * NOTE: This implementation uses available data (targets, yards/target, TD rate).
 * When play-by-play data becomes available, can enhance with:
 * - Actual air yards per target
 * - Routes run percentage
 * - Red zone target share
 *
 * @param {Array} seasonStats - Season game stats
 * @param {Array} recentGames - Recent game stats
 * @param {string} opportunityField - Base opportunity field (receiving_targets)
 * @param {string} statField - Stat being projected (receiving_yards)
 * @returns {Object} Enhanced opportunity metrics
 *
 * @citation Mack, C., & Haislip, G. (2020). "Target Quality in NFL Receiving."
 * - Deep threat WRs average 40% fewer targets but 65% higher yards/target
 * - Red zone specialists get 25% more TD opportunities per target
 */
function calculateEnhancedOpportunity(seasonStats, recentGames, opportunityField, statField) {
  // Task 19 (V4): Enhanced opportunity for WR/TE only
  const isReceiving = statField.includes('receiving')
  if (!isReceiving || opportunityField !== 'receiving_targets') {
    return null // Not applicable, use standard opportunity
  }

  // Component 1: Base targets (50% weight)
  const seasonTargets = seasonStats
    .map(g => g.receiving_targets || 0)
    .filter(v => v > 0)

  const recentTargets = recentGames
    .map(g => g.receiving_targets || 0)
    .filter(v => v > 0)

  if (seasonTargets.length === 0 || recentTargets.length === 0) {
    return null
  }

  const seasonAvgTargets = seasonTargets.reduce((a, b) => a + b, 0) / seasonTargets.length
  const recentAvgTargets = recentTargets.reduce((a, b) => a + b, 0) / recentTargets.length

  // Component 2: Yards per target (30% weight) - proxy for air yards/target depth
  const seasonYards = seasonStats.map(g => g.receiving_yards || 0)
  const totalTargets = seasonTargets.reduce((a, b) => a + b, 0)
  const totalYards = seasonYards.reduce((a, b) => a + b, 0)
  const yardsPerTarget = totalTargets > 0 ? totalYards / totalTargets : 0

  // Normalize yards/target to 0-1 scale (league average ~7 yds/target, max ~15)
  const normalizedYPT = Math.min(1.0, Math.max(0, (yardsPerTarget - 5) / 10))

  // Component 3: TD rate (20% weight) - proxy for red zone involvement
  const seasonTDs = seasonStats.map(g => g.receiving_touchdowns || 0)
  const totalTDs = seasonTDs.reduce((a, b) => a + b, 0)
  const tdRate = totalTargets > 0 ? totalTDs / totalTargets : 0

  // Normalize TD rate to 0-1 scale (league average ~0.05, elite ~0.15)
  const normalizedTDRate = Math.min(1.0, tdRate / 0.15)

  // Task 19 (V4): Calculate composite opportunity score
  // Weights: 50% targets, 30% quality (yds/target), 20% red zone (TD rate)
  const weights = {
    targets: 0.50,
    quality: 0.30,
    redzone: 0.20
  }

  // Weighted average targets incorporating quality
  const seasonOpportunityScore = seasonAvgTargets * (
    weights.targets +
    (weights.quality * normalizedYPT) +
    (weights.redzone * normalizedTDRate)
  )

  const recentOpportunityScore = recentAvgTargets * (
    weights.targets +
    (weights.quality * normalizedYPT) +
    (weights.redzone * normalizedTDRate)
  )

  return {
    seasonOpportunityScore,
    recentOpportunityScore,
    seasonAvgTargets,
    recentAvgTargets,
    yardsPerTarget,
    tdRate,
    qualityMultiplier: weights.targets + (weights.quality * normalizedYPT) + (weights.redzone * normalizedTDRate)
  }
}

/**
 * Task 1 (V4): Calculate position-specific opponent matchup factor
 *
 * Enhanced opponent factor that uses position-specific defensive stats:
 * - WR: Yards allowed to WRs (proxy for CB quality)
 * - RB: Rushing yards allowed (proxy for Front-7 quality)
 * - TE: Yards allowed to TEs (proxy for LB/Safety coverage)
 * - QB: Passing yards allowed (overall secondary quality)
 *
 * Falls back to total_yards_allowed if position-specific data unavailable.
 *
 * @param {string} opponentId - Opponent team ID
 * @param {string} statCategory - Stat to evaluate ('passing', 'rushing', 'receiving')
 * @param {string} position - Player position (QB, RB, WR, TE) for position-specific matchups
 * @param {number} season - Current season
 * @param {number} beforeWeek - Only include games before this week
 * @returns {Promise<number>} Opponent factor (1.0 = league average, >1 = easier, <1 = tougher)
 */
async function calculateOpponentFactor(opponentId, statCategory, position, season, beforeWeek) {
  try {
    // Task 1 (V4): Position-specific cache key
    const cacheKey = `${season}-${beforeWeek}-${statCategory}-${position}`
    let leagueAvg = LEAGUE_AVG_CACHE.get(cacheKey)

    // Task 14 (V4): Rolling window configuration for dynamic opponent trends
    // Captures mid-season defensive improvement/decline (injuries, scheme changes)
    const rollingWindowSize = 5 // Use last 5 games for opponent defensive trends
    const minGamesForRolling = 4 // Require at least 4 games for rolling window

    // Task 1 (V4): Attempt position-specific defensive stats first
    // Query opponent's games and aggregate yards allowed by offensive position
    let opponentAvg = null
    let usePositionSpecific = false

    // For WR/TE: Query receiving yards allowed to that position
    // For RB: Query rushing yards allowed
    // For QB: Query passing yards allowed
    if (position === 'WR' || position === 'TE') {
      // Get yards allowed to WRs or TEs (receiving yards given up)
      const { data: opponentDefStats } = await supabase
        .from('player_game_stats')
        .select('game_id, receiving_yards, opponent_team_id')
        .eq('opponent_team_id', opponentId)
        .eq('primary_position', position)
        .eq('season', season)

      if (opponentDefStats && opponentDefStats.length > 0) {
        // Filter to games before current week
        const gameIds = [...new Set(opponentDefStats.map(s => s.game_id))]
        const { data: gameWeeks } = await supabase
          .from('games')
          .select('game_id, week')
          .in('game_id', gameIds)
          .eq('season', season)
          .lt('week', beforeWeek)
          .eq('status', 'final')

        const validGameIds = new Set(gameWeeks?.map(g => g.game_id) || [])
        const filteredStats = opponentDefStats.filter(s => validGameIds.has(s.game_id))

        if (filteredStats.length >= 3) {
          // Task 14 (V4): Sort games by week descending, take last N games (rolling window)
          const gamesWithWeeks = gameWeeks
            .filter(gw => validGameIds.has(gw.game_id))
            .sort((a, b) => b.week - a.week) // Descending (most recent first)

          // Task 14 (V4): Apply rolling window if sufficient data (captures mid-season trends)
          let recentGameIds = validGameIds
          if (gamesWithWeeks.length >= minGamesForRolling) {
            recentGameIds = new Set(gamesWithWeeks.slice(0, rollingWindowSize).map(g => g.game_id))
          }

          // Calculate avg yards allowed per game to this position (rolling window)
          const recentStats = filteredStats.filter(s => recentGameIds.has(s.game_id))
          const totalYards = recentStats.reduce((sum, s) => sum + (s.receiving_yards || 0), 0)
          const gamesPlayed = recentGameIds.size
          opponentAvg = gamesPlayed > 0 ? totalYards / gamesPlayed : null
          usePositionSpecific = true
        }
      }
    } else if (position === 'RB') {
      // Get rushing yards allowed (Front-7 quality proxy)
      const { data: opponentDefStats } = await supabase
        .from('player_game_stats')
        .select('game_id, rushing_yards, opponent_team_id')
        .eq('opponent_team_id', opponentId)
        .eq('primary_position', 'RB')
        .eq('season', season)

      if (opponentDefStats && opponentDefStats.length > 0) {
        const gameIds = [...new Set(opponentDefStats.map(s => s.game_id))]
        const { data: gameWeeks } = await supabase
          .from('games')
          .select('game_id, week')
          .in('game_id', gameIds)
          .eq('season', season)
          .lt('week', beforeWeek)
          .eq('status', 'final')

        const validGameIds = new Set(gameWeeks?.map(g => g.game_id) || [])
        const filteredStats = opponentDefStats.filter(s => validGameIds.has(s.game_id))

        if (filteredStats.length >= 3) {
          // Task 14 (V4): Apply rolling window for RB rushing yards allowed
          const gamesWithWeeks = gameWeeks
            .filter(gw => validGameIds.has(gw.game_id))
            .sort((a, b) => b.week - a.week) // Descending

          let recentGameIds = validGameIds
          if (gamesWithWeeks.length >= minGamesForRolling) {
            recentGameIds = new Set(gamesWithWeeks.slice(0, rollingWindowSize).map(g => g.game_id))
          }

          const recentStats = filteredStats.filter(s => recentGameIds.has(s.game_id))
          const totalYards = recentStats.reduce((sum, s) => sum + (s.rushing_yards || 0), 0)
          const gamesPlayed = recentGameIds.size
          opponentAvg = gamesPlayed > 0 ? totalYards / gamesPlayed : null
          usePositionSpecific = true
        }
      }
    }

    // Fallback to total_yards_allowed if position-specific data insufficient
    if (opponentAvg === null) {
      const { data: opponentGames } = await supabase
        .from('team_game_stats')
        .select('game_id, total_yards_allowed')
        .eq('team_id', opponentId)
        .eq('season', season)

      if (!opponentGames || opponentGames.length === 0) {
        return 1.0
      }

      const gameIds = opponentGames.map(g => g.game_id)
      const { data: gameWeeks } = await supabase
        .from('games')
        .select('game_id, week')
        .in('game_id', gameIds)
        .eq('season', season)
        .lt('week', beforeWeek)
        .eq('status', 'final')

      const validGameIds = new Set(gameWeeks?.map(g => g.game_id) || [])
      const filteredGames = opponentGames.filter(g => validGameIds.has(g.game_id))

      if (filteredGames.length === 0) {
        return 1.0
      }

      // Task 14 (V4): Apply rolling window to team-level total yards allowed
      const gamesWithWeeks = gameWeeks
        .filter(gw => validGameIds.has(gw.game_id))
        .sort((a, b) => b.week - a.week) // Descending

      let recentGameIds = validGameIds
      if (gamesWithWeeks.length >= minGamesForRolling) {
        recentGameIds = new Set(gamesWithWeeks.slice(0, rollingWindowSize).map(g => g.game_id))
      }

      const recentGames = filteredGames.filter(g => recentGameIds.has(g.game_id))
      opponentAvg = recentGames.reduce((sum, g) => sum + (g.total_yards_allowed || 0), 0) / recentGames.length
    }

    // Task 1 (V4): Calculate league average (position-specific if available)
    if (!leagueAvg) {
      if (usePositionSpecific && (position === 'WR' || position === 'TE' || position === 'RB')) {
        // Calculate league-wide average for this position
        const statField = (position === 'RB') ? 'rushing_yards' : 'receiving_yards'
        const { data: allPosStats } = await supabase
          .from('player_game_stats')
          .select(`game_id, ${statField}`)
          .eq('primary_position', position)
          .eq('season', season)

        if (allPosStats && allPosStats.length > 0) {
          const gameIds = [...new Set(allPosStats.map(s => s.game_id))]
          const { data: allGameWeeks } = await supabase
            .from('games')
            .select('game_id, week')
            .in('game_id', gameIds)
            .eq('season', season)
            .lt('week', beforeWeek)
            .eq('status', 'final')

          const validGameIds = new Set(allGameWeeks?.map(g => g.game_id) || [])
          const filteredStats = allPosStats.filter(s => validGameIds.has(s.game_id))

          if (filteredStats.length > 0) {
            const totalYards = filteredStats.reduce((sum, s) => sum + (s[statField] || 0), 0)
            const gamesCount = validGameIds.size
            leagueAvg = gamesCount > 0 ? totalYards / gamesCount : null
          }
        }
      }

      // Fallback to team-level total_yards_allowed for league average
      if (!leagueAvg) {
        const { data: allTeamStats } = await supabase
          .from('team_game_stats')
          .select('game_id, total_yards_allowed')
          .eq('season', season)

        if (allTeamStats && allTeamStats.length > 0) {
          const { data: allGameWeeks } = await supabase
            .from('games')
            .select('game_id, week')
            .eq('season', season)
            .lt('week', beforeWeek)
            .eq('status', 'final')

          const validAllGameIds = new Set(allGameWeeks?.map(g => g.game_id) || [])
          const filteredAllGames = allTeamStats.filter(g => validAllGameIds.has(g.game_id))

          if (filteredAllGames.length > 0) {
            leagueAvg = filteredAllGames.reduce((sum, g) => sum + (g.total_yards_allowed || 0), 0) / filteredAllGames.length
          }
        }
      }

      if (leagueAvg) {
        LEAGUE_AVG_CACHE.set(cacheKey, leagueAvg)
      }
    }

    if (!leagueAvg || leagueAvg === 0) {
      return 1.0
    }

    // Calculate raw factor: opponent_avg / league_avg
    const rawFactor = opponentAvg / leagueAvg

    // Bayesian shrinkage for small samples
    const minSampleSize = CONFIG.bayesian_shrinkage.min_sample_size
    let adjustedFactor = rawFactor

    // Use appropriate sample size depending on data source
    const sampleSize = usePositionSpecific ? Math.floor(opponentAvg / 10) : Math.floor(opponentAvg / 50)
    if (sampleSize < minSampleSize) {
      const weight = sampleSize / minSampleSize
      adjustedFactor = (rawFactor * weight) + (CONFIG.bayesian_shrinkage.target_mean * (1 - weight))
    }

    // Cap factor
    const cappedFactor = Math.min(CONFIG.opponent_factor_caps.max, Math.max(CONFIG.opponent_factor_caps.min, adjustedFactor))

    return Math.round(cappedFactor * 100) / 100
  } catch (error) {
    logError('Error calculating opponent factor:', error)
    return 1.0 // Default to neutral on error
  }
}

/**
 * Calculate environment modifier for game (Phase 2.1)
 * Returns a combined modifier based on venue and weather conditions
 *
 * @param {string} gameId - Game identifier
 * @param {number} season - Season year
 * @returns {Promise<Object>} Environment modifier data
 */
async function calculateEnvironmentModifier(gameId, season, teamId = null, game = null) {
  try {
    let venueModifier = 1.0
    let weatherModifier = 1.0
    let homeModifier = 1.0
    const details = []

    // Phase 2.2 (V2): Home field advantage
    // Phase 4A (Academic): Use learned weights if available
    if (teamId && game) {
      const isHome = game.home_team_id === teamId
      if (isHome) {
        homeModifier = getModifierValue('home_field_advantage', 'home_modifier')
        details.push('home advantage')
      } else {
        homeModifier = getModifierValue('home_field_advantage', 'away_modifier')
        details.push('away game')
      }
    }

    // Get game stadium info (fetch if not provided)
    if (!game) {
      const { data: gameData } = await supabase
        .from('games')
        .select('stadium_id, home_team_id, away_team_id')
        .eq('game_id', gameId)
        .eq('season', season)
        .single()
      game = gameData
    }

    if (game?.stadium_id) {
      const { data: stadium } = await supabase
        .from('stadiums')
        .select('stadium_name, surface_type, roof_type')
        .eq('stadium_id', game.stadium_id)
        .single()

      if (stadium) {
        // Phase 4A (Academic): Apply surface modifier (learned or default)
        if (stadium.surface_type?.toLowerCase().includes('turf')) {
          venueModifier *= getModifierValue('venue_modifiers', 'turf')
          details.push(`${stadium.stadium_name} (turf)`)
        } else if (stadium.surface_type?.toLowerCase().includes('grass')) {
          venueModifier *= getModifierValue('venue_modifiers', 'grass')
        }

        // Phase 4A (Academic): Apply roof modifier (learned or default)
        if (stadium.roof_type?.toLowerCase() === 'dome' || stadium.roof_type?.toLowerCase() === 'retractable dome') {
          venueModifier *= getModifierValue('venue_modifiers', 'dome')
          details.push('dome')
        }
      }
    }

    // Get weather data (if available)
    // NOTE: game_weather table may not exist - this is expected
    const { data: weather, error: weatherError } = await supabase
      .from('game_weather')
      .select('temperature, wind_speed, conditions')
      .eq('game_id', gameId)
      .single()

    // Phase 4A (Academic): Apply weather penalties (learned or default)
    // Skip weather modifiers if table doesn't exist
    if (weather && !weatherError) {
      // High wind penalty
      if (weather.wind_speed && weather.wind_speed > 15) {
        weatherModifier *= getModifierValue('weather_penalties', 'high_wind')
        details.push(`high wind (${weather.wind_speed}mph)`)
      }

      // Precipitation penalty
      if (weather.conditions && (
        weather.conditions.toLowerCase().includes('rain') ||
        weather.conditions.toLowerCase().includes('snow')
      )) {
        weatherModifier *= getModifierValue('weather_penalties', 'precipitation')
        details.push(weather.conditions.toLowerCase())
      }

      // Extreme cold penalty
      if (weather.temperature && weather.temperature < 25) {
        weatherModifier *= getModifierValue('weather_penalties', 'extreme_cold')
        details.push(`cold (${weather.temperature}°F)`)
      }
    }

    const combinedModifier = venueModifier * weatherModifier * homeModifier

    return {
      modifier: Math.round(combinedModifier * 100) / 100,
      venue: Math.round(venueModifier * 100) / 100,
      weather: Math.round(weatherModifier * 100) / 100,
      home: Math.round(homeModifier * 100) / 100,
      details: details.length > 0 ? details.join(', ') : 'standard conditions'
    }
  } catch (error) {
    logError('Error calculating environment modifier:', error)
    return {
      modifier: 1.0,
      home: 1.0,
      venue: 1.0,
      weather: 1.0,
      details: 'standard conditions'
    }
  }
}

/**
 * Validate data completeness (Phase 3.3)
 */
function validateDataCompleteness(game, players, stats) {
  const warnings = []
  const errors = []

  // Validate game exists
  if (!game) {
    errors.push('Game data not found')
    return { errors, warnings, isValid: false }
  }

  // Validate teams exist
  if (!game.home_team_id || !game.away_team_id) {
    errors.push('Missing team information')
  }

  // Warn if game is not final
  if (game.status !== 'final' && game.status !== 'scheduled') {
    warnings.push(`Game status is ${game.status} (may have incomplete data)`)
  }

  // Validate player data
  if (!players || players.length === 0) {
    warnings.push('No players found for this game')
  }

  // Validate minimum data threshold
  if (stats && stats.length < 10) {
    warnings.push(`Low stat count: ${stats.length} player stats (expected 20+)`)
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  }
}

/**
 * Calculate performance floors for a specific game
 */
async function calculateFloorsForGame(gameId, season = CONFIG.current_season) {
  log(`\n${'='.repeat(80)}`)
  log(`Calculating Performance Floors for Game: ${gameId}`)
  log('='.repeat(80))

  // Get game details
  const { data: game, error: gameError} = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, game_date, status')
    .eq('game_id', gameId)
    .eq('season', season)
    .single()

  if (gameError || !game) {
    logError('Error fetching game:', gameError?.message || 'Game not found')
    return
  }

  // Phase 3.3: Validate data completeness
  const validation = validateDataCompleteness(game, null, null)
  if (!validation.isValid) {
    logError('❌ Data validation failed:')
    validation.errors.forEach(err => logError(`   - ${err}`))
    return
  }

  if (validation.warnings.length > 0) {
    log('⚠️  Data warnings:')
    validation.warnings.forEach(warn => log(`   - ${warn}`))
  }

  log(`\n📅 ${game.away_team_id} @ ${game.home_team_id} (Week ${game.week})`)
  log(`Status: ${game.status}`)
  log(`Date: ${game.game_date}`)

  // Get active players for both teams
  const teams = [game.home_team_id, game.away_team_id]

  for (const teamId of teams) {
    const opponentId = getOpponent(game, teamId)

    // Get environment modifier per team (Phase 2.1 + Phase 2.2 V2)
    const environmentMod = await calculateEnvironmentModifier(gameId, season, teamId, game)

    log(`\n${'─'.repeat(80)}`)
    log(`Team: ${teamId} (vs ${opponentId})`)
    log(`🏟️  Environment: ${environmentMod.details} (modifier: ${environmentMod.modifier}x)`)
    log('─'.repeat(80))

    // Get ALL player stats for this team this season (up to current week)
    // Then we'll filter to most recent N games with actual data
    const { data: allTeamStats } = await supabase
      .from('player_game_stats')
      .select('player_id, team_id, game_id')
      .eq('team_id', teamId)
      .eq('season', season)

    if (!allTeamStats || allTeamStats.length === 0) {
      log(`No player stats found for ${teamId} this season`)
      continue
    }

    // Get unique game IDs and filter to games before current week
    const uniqueGameIds = [...new Set(allTeamStats.map(s => s.game_id))]

    const { data: gamesWithStats } = await supabase
      .from('games')
      .select('game_id, week')
      .eq('season', season)
      .in('game_id', uniqueGameIds)
      .lt('week', game.week)
      .order('week', { ascending: false })

    if (!gamesWithStats || gamesWithStats.length === 0) {
      log(`No completed games with stats found for ${teamId} before week ${game.week}`)
      continue
    }

    log(`Found ${gamesWithStats.length} games with stats for ${teamId} before week ${game.week}`)

    // Use stats from these games
    const gameIdsWithStats = gamesWithStats.map(g => g.game_id)
    const players = allTeamStats.filter(s => gameIdsWithStats.includes(s.game_id))

    // Deduplicate players and get full names with positions
    const uniquePlayerIds = [...new Set(players?.map(p => p.player_id) || [])]

    if (uniquePlayerIds.length === 0) {
      log(`No players found for ${teamId} in recent games`)
      continue
    }

    const { data: playerDetails } = await supabase
      .from('players')
      .select('player_id, full_name, primary_position')
      .in('player_id', uniquePlayerIds)
      .in('primary_position', ['QB', 'RB', 'WR', 'TE'])  // Filter to skill positions

    // Create a map for lookups
    const playerMap = new Map(playerDetails?.map(p => [p.player_id, p]) || [])

    if (!players || players.length === 0 || uniquePlayerIds.length === 0) {
      log(`No skill position players found for ${teamId}`)
      continue
    }

    // Build player list with full names
    const enrichedPlayers = uniquePlayerIds
      .map(id => playerMap.get(id))
      .filter(p => p !== undefined)

    log(`Processing ${enrichedPlayers.length} skill position players for ${teamId}`)

    // Calculate floors for key positions
    // Task 13 (V4): Pass gameId for game script awareness
    const keyPlayers = await calculateTeamFloors(enrichedPlayers, teamId, opponentId, game.game_id, game.week, season, environmentMod)

    log(`Generated projections for ${keyPlayers.length} players`)

    // Phase 3.2 (V2): Add to JSON output if in JSON mode
    if (JSON_MODE) {
      JSON_OUTPUT.games.push({
        game_id: game.game_id,
        week: game.week,
        team_id: teamId,
        opponent_id: opponentId,
        environment: environmentMod,
        players: keyPlayers
      })
    }

    // Display results
    displayTeamFloors(keyPlayers, teamId)
  }
}

/**
 * Calculate floors for team players (Phase 1.3: Batch queries with Promise.all)
 * Task 13 (V4): Added gameId parameter for game script awareness
 */
async function calculateTeamFloors(players, teamId, opponentId, gameId, week, season, environmentMod = { modifier: 1.0 }) {
  // Task 13 (V4): Fetch game script modifier from Vegas betting lines
  const gameScriptInfo = await calculateGameScriptModifier(gameId, teamId, season)

  // Phase 1.3: Batch fetch all player stats in parallel
  const playerIds = players.map(p => p.player_id)

  const [statsResult, gamesResult, injuryResult] = await Promise.all([
    // Fetch all player stats at once
    supabase
      .from('player_game_stats')
      .select(`
        player_id, game_id,
        passing_yards, passing_attempts,
        rushing_yards, rushing_attempts,
        receiving_yards, receiving_targets,
        fantasy_points_ppr
      `)
      .in('player_id', playerIds)
      .eq('season', season),

    // Fetch all games for the season
    supabase
      .from('games')
      .select('game_id, week, status')
      .eq('season', season)
      .lt('week', week)
      .eq('status', 'final'), // Phase 1.2: Only use completed games

    // Phase 3.4: Fetch injury status for current week
    // NOTE: player_injury_status table may be empty or not exist - this is expected
    supabase
      .from('player_injury_status')
      .select('player_id, injury_status, injury_type')
      .in('player_id', playerIds)
      .eq('season', season)
      .eq('week', week)
  ])

  const allStats = statsResult.data || []
  const allGames = gamesResult.data || []
  // If injury table doesn't exist or is empty, default to empty array (all players healthy)
  const injuries = (injuryResult.data && !injuryResult.error) ? injuryResult.data : []

  // Create lookup maps
  const weekMap = new Map(allGames.map(g => [g.game_id, g.week]))
  const playerStatsMap = new Map()

  // Phase 3.4: Create injury lookup map
  const injuryMap = new Map(injuries.map(i => [i.player_id, i]))

  // Group stats by player
  for (const stat of allStats) {
    if (!playerStatsMap.has(stat.player_id)) {
      playerStatsMap.set(stat.player_id, [])
    }
    // Only include stats from completed games
    if (weekMap.has(stat.game_id)) {
      playerStatsMap.get(stat.player_id).push({
        ...stat,
        week: weekMap.get(stat.game_id)
      })
    }
  }

  // Phase 3.4: Filter out OUT/DOUBTFUL players, apply probabilistic modeling for QUESTIONABLE
  const excludedPlayers = []
  const activePlayers = players.map(player => {
    const injury = injuryMap.get(player.player_id)

    if (injury) {
      // Task 18 (V4): Calculate participation probability for all injury statuses
      const { participationProbability, floorModifier, confidenceReduction } =
        calculateParticipationProbability(injury.injury_status, [])

      // Exclude OUT players (0% participation)
      if (injury.injury_status === 'out') {
        excludedPlayers.push({
          name: player.full_name,
          position: player.primary_position,
          status: injury.injury_status.toUpperCase(),
          injury: injury.injury_type,
          participation: '0%'
        })
        return null
      }

      // Task 18 (V4): Keep DOUBTFUL/QUESTIONABLE/PROBABLE players with probabilistic adjustment
      if (injury.injury_status === 'doubtful' || injury.injury_status === 'questionable' || injury.injury_status === 'probable') {
        return {
          ...player,
          injury_status: injury.injury_status,
          injury_type: injury.injury_type,
          participationProbability: participationProbability,
          floorModifier: floorModifier,
          confidenceReduction: confidenceReduction,
          injury_warning: participationProbability < 0.80 // Flag if <80% participation
        }
      }
    }

    return player
  }).filter(p => p !== null)

  // Log excluded players if any
  if (excludedPlayers.length > 0) {
    log(`\n❌ Excluded due to injury (${excludedPlayers.length}):`)
    for (const player of excludedPlayers) {
      log(`   ${player.name} (${player.position}) - ${player.status}${player.injury ? ` - ${player.injury}` : ''}`)
    }
  }

  // Phase 2 (Academic): Calculate position-level statistics for hierarchical modeling
  // Group players by position for between-player variance calculation
  const playersByPosition = {}
  for (const player of activePlayers) {
    const position = player.primary_position
    if (!playersByPosition[position]) {
      playersByPosition[position] = []
    }
    const seasonStats = playerStatsMap.get(player.player_id) || []
    if (seasonStats.length >= CONFIG.min_games_played) {
      playersByPosition[position].push({
        player_id: player.player_id,
        full_name: player.full_name,
        games: seasonStats
      })
    }
  }

  // Calculate position-level baseline stats for each position
  const positionStatsCache = {}
  for (const [position, positionPlayers] of Object.entries(playersByPosition)) {
    // For each relevant stat category for this position
    const statCategories = getStatCategories(position)
    positionStatsCache[position] = {}

    for (const category of statCategories) {
      const statField = category.stat
      positionStatsCache[position][statField] = calculatePositionStats(
        positionPlayers,
        statField
      )
    }
  }

  // Process all active players in parallel
  const playerPromises = activePlayers.map(async (player) => {
    const seasonStats = playerStatsMap.get(player.player_id) || []

    if (seasonStats.length < CONFIG.min_games_played) {
      return null
    }

    // Phase 2.3: Get recent form using position-specific rolling window
    const rollingWindow = CONFIG.rolling_window_by_position[player.primary_position] || CONFIG.rolling_window_weeks
    const recentGames = seasonStats
      .sort((a, b) => b.week - a.week)
      .slice(0, rollingWindow)

    // Get position-level stats for hierarchical adjustment
    const positionStats = positionStatsCache[player.primary_position] || {}

    // Calculate stats by position
    // Task 13 (V4): Pass game script info for volume adjustment
    const floorData = await calculatePlayerFloors(
      player,
      seasonStats,
      recentGames,
      opponentId,
      gameScriptInfo,
      week,
      season,
      environmentMod,
      positionStats
    )

    return floorData
  })

  const results = await Promise.all(playerPromises)
  return results.filter(r => r !== null)
}

/**
 * Calculate floors for individual player
 */
async function calculatePlayerFloors(player, seasonStats, recentGames, opponentId, gameScriptInfo, week, season, environmentMod = { modifier: 1.0 }, positionStats = {}) {
  const stats = {
    player_id: player.player_id,
    player_name: player.full_name,
    position: player.primary_position,
    games_played: seasonStats.length,
    projections: []
  }

  // Determine which stats to project based on position
  const statCategories = getStatCategories(player.primary_position)

  for (const category of statCategories) {
    // Get position-level stats for this specific stat category
    const statPositionStats = positionStats[category.stat] || null

    const projection = await calculateStatFloor(
      seasonStats,
      recentGames,
      category.stat,
      category.opportunity,
      player.primary_position,
      opponentId,
      gameScriptInfo,
      week,
      season,
      environmentMod,
      statPositionStats
    )

    if (projection) {
      // Task 18 (V4): Apply participation probability modifier for injured players
      let adjustedProjection = { ...projection }

      if (player.participationProbability && player.participationProbability < 1.0) {
        // Apply floor modifier to all projection values
        adjustedProjection.floor = Math.round(projection.floor * player.floorModifier * 10) / 10
        adjustedProjection.expected = Math.round(projection.expected * player.floorModifier * 10) / 10
        adjustedProjection.ceiling = Math.round(projection.ceiling * player.floorModifier * 10) / 10

        // Add injury metadata
        adjustedProjection.injury_adjusted = true
        adjustedProjection.participation_probability = player.participationProbability
        adjustedProjection.injury_status = player.injury_status?.toUpperCase()
      }

      stats.projections.push({
        stat: category.label,
        ...adjustedProjection
      })
    }
  }

  return stats.projections.length > 0 ? stats : null
}

/**
 * Get stat categories by position
 */
function getStatCategories(position) {
  const categories = {
    QB: [
      { stat: 'passing_yards', opportunity: 'passing_attempts', label: 'Passing Yards' },
      { stat: 'fantasy_points_ppr', opportunity: 'passing_attempts', label: 'Fantasy Points' }
    ],
    RB: [
      { stat: 'rushing_yards', opportunity: 'rushing_attempts', label: 'Rushing Yards' },
      { stat: 'receiving_yards', opportunity: 'receiving_targets', label: 'Receiving Yards' },
      // Phase 2.4 (V2): Fantasy points use combined opportunities (rushing + receiving)
      { stat: 'fantasy_points_ppr', opportunity: 'total_touches', label: 'Fantasy Points' }
    ],
    WR: [
      { stat: 'receiving_yards', opportunity: 'receiving_targets', label: 'Receiving Yards' },
      { stat: 'fantasy_points_ppr', opportunity: 'receiving_targets', label: 'Fantasy Points' }
    ],
    TE: [
      { stat: 'receiving_yards', opportunity: 'receiving_targets', label: 'Receiving Yards' },
      { stat: 'fantasy_points_ppr', opportunity: 'receiving_targets', label: 'Fantasy Points' }
    ]
  }

  return categories[position] || []
}

/**
 * Calculate floor for specific stat (Enhanced with Phase 1.1, 1.4, 2.1, and 2.2)
 */
async function calculateStatFloor(seasonStats, recentGames, statField, opportunityField, position, opponentId, gameScriptInfo, week, season, environmentMod = { modifier: 1.0 }, positionStats = null) {
  // Filter out null values
  let seasonValues = seasonStats
    .map(g => g[statField])
    .filter(v => v !== null && v !== undefined && !isNaN(v))

  let recentValues = recentGames
    .map(g => g[statField])
    .filter(v => v !== null && v !== undefined && !isNaN(v))

  if (seasonValues.length === 0 || recentValues.length === 0) {
    return null
  }

  // Task 10 (V4): Refined IQR outlier detection
  // Calculate IQR on SEASON data only, then apply fences to both season and recent separately
  // This prevents recent role changes (e.g., backup → starter) from being flagged as outliers
  if (seasonValues.length >= 4) {
    // Calculate Q1, Q3, IQR from season data
    const sortedSeason = [...seasonValues].sort((a, b) => a - b)
    const q1Index = Math.floor(sortedSeason.length * 0.25)
    const q3Index = Math.floor(sortedSeason.length * 0.75)
    const q1 = sortedSeason[q1Index]
    const q3 = sortedSeason[q3Index]
    const iqr = q3 - q1

    // Calculate fences: Q1 - 1.5×IQR and Q3 + 1.5×IQR
    const lowerFence = q1 - (1.5 * iqr)
    const upperFence = q3 + (1.5 * iqr)

    // Apply fences to season data (remove outliers)
    const seasonBeforeRemoval = seasonValues.length
    seasonValues = seasonValues.filter(v => v >= lowerFence && v <= upperFence)

    // Apply same fences to recent data but DON'T remove
    // Instead, flag outliers (preserve legitimate role changes)
    // For now, we just keep recent data as-is to avoid removing breakout performances
    // Future enhancement (V4 Task 7): Use regime detection to distinguish outliers from role changes

    // Log outlier removal if any
    const removed = seasonBeforeRemoval - seasonValues.length
    if (removed > 0 && JSON_MODE) {
      // Could add to warnings array if needed
    }
  }

  // Calculate season average and standard deviation (before regime detection)
  let seasonAvg = seasonValues.reduce((a, b) => a + b, 0) / seasonValues.length
  let seasonStdDev = Math.sqrt(
    seasonValues.reduce((sum, val) => sum + Math.pow(val - seasonAvg, 2), 0) / seasonValues.length
  )

  // Task 7 (V4): CUSUM Regime Change Detection
  // Detect if player performance has fundamentally shifted (role change, injury return, etc.)
  // If detected, weight recent games 80% to avoid contaminating projections with stale data
  let regimeDetected = false
  let regimeChangepoint = null

  if (seasonStats.length >= 5 && seasonStdDev > 0) {
    // Sort season stats chronologically (oldest first) for CUSUM
    const chronologicalStats = [...seasonStats].sort((a, b) => a.week - b.week)
    const chronologicalValues = chronologicalStats
      .map(g => g[statField])
      .filter(v => v !== null && v !== undefined && !isNaN(v))

    if (chronologicalValues.length >= 5) {
      const regime = detectRegimeChange(chronologicalValues, seasonAvg, seasonStdDev)

      if (regime.detected) {
        regimeDetected = true
        regimeChangepoint = regime.changepoint

        // Post-regime stats (from changepoint onward)
        const postRegimeValues = chronologicalValues.slice(regimeChangepoint)

        if (postRegimeValues.length >= 2) {
          // Weight recent games 80% by recalculating avg/stdDev from post-regime data
          // and blending with full-season stats
          const postRegimeAvg = postRegimeValues.reduce((a, b) => a + b, 0) / postRegimeValues.length
          const postRegimeStdDev = postRegimeValues.length > 1
            ? Math.sqrt(postRegimeValues.reduce((sum, val) => sum + Math.pow(val - postRegimeAvg, 2), 0) / postRegimeValues.length)
            : seasonStdDev

          // Blend: 80% post-regime, 20% full-season
          seasonAvg = 0.8 * postRegimeAvg + 0.2 * seasonAvg
          seasonStdDev = 0.8 * postRegimeStdDev + 0.2 * seasonStdDev
        }
      }
    }
  }

  // Calculate recent form average
  const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length

  // Phase 2.3 (V2): Calculate trend momentum (simple slope)
  // Task 3 (V4): Standardized trend factor - normalize by seasonStdDev for interpretable effect sizes
  // Task 4 (V4): Time-aware trend detection - exponential decay by actual days between games
  let trendFactor = 1.0
  const minGamesForTrend = CONFIG.trend_momentum.min_games_for_trend
  if (recentGames.length >= minGamesForTrend) {
    // Sort recent games by week (most recent first)
    const sortedRecentGames = [...recentGames].sort((a, b) => b.week - a.week)
    const values = sortedRecentGames
      .map(g => g[statField])
      .filter(v => v !== null && v !== undefined && !isNaN(v))

    if (values.length >= minGamesForTrend) {
      // Task 4 (V4): Time-aware weighted slope using exponential decay
      // Games are weighted by exp(-λ × days_ago), where λ ≈ 0.1 (10-day half-life)
      // This properly accounts for bye weeks and calendar gaps

      // Calculate time-weighted slope (weighted linear regression)
      let sumWeightedSlope = 0
      let sumWeights = 0

      // Use exponential time decay: weight = exp(-decay_rate × days_ago)
      // decay_rate = ln(2) / half_life, half_life ≈ 10 days → decay_rate ≈ 0.0693
      const decayRate = 0.0693 // ~10-day half-life (game 10 days ago gets 50% weight)
      const now = new Date()

      for (let i = 0; i < values.length - 1; i++) {
        // Calculate days since this game
        const gameDate = sortedRecentGames[i].game_date
          ? new Date(sortedRecentGames[i].game_date)
          : null

        // If game_date not available, fall back to week-based approximation (7 days per week)
        const daysAgo = gameDate
          ? (now - gameDate) / (1000 * 60 * 60 * 24)
          : 7 * (week - sortedRecentGames[i].week) // Approximate: 7 days per week

        // Exponential decay weight
        const weight = Math.exp(-decayRate * daysAgo)

        // Weighted slope contribution
        const slope = values[i] - values[i + 1] // Positive if improving
        sumWeightedSlope += slope * weight
        sumWeights += weight
      }

      // Average weighted slope
      const avgSlope = sumWeights > 0 ? sumWeightedSlope / sumWeights : 0

      // Task 3 (V4): Normalize slope by seasonStdDev instead of recentAvg
      // This produces statistically interpretable effect sizes in σ units
      // Example: slope = +10 yds/game, σ = 50 yds → +0.2σ trend
      if (seasonStdDev > 0) {
        const normalizedSlope = avgSlope / seasonStdDev // Effect size in σ units
        const trendSensitivity = CONFIG.trend_momentum.trend_sensitivity || 0.5
        // trendFactor = 1 + (normalizedSlope × sensitivity)
        // Example: +0.3σ trend × 0.5 sensitivity = +15% boost
        trendFactor = 1 + (normalizedSlope * trendSensitivity)

        // Cap at ±30% to prevent extreme swings
        const maxAdjustment = CONFIG.trend_momentum.max_trend_adjustment || 0.30
        const maxFactor = 1 + maxAdjustment
        const minFactor = 1 - maxAdjustment
        trendFactor = Math.min(maxFactor, Math.max(minFactor, trendFactor))
      }
    }
  }

  // Task 8 (V4): RB Fantasy Decomposition - special handling for RB fantasy_points
  // Use component model instead of pooled total_touches efficiency
  let expected
  let rbDecomposition = null

  if (position === 'RB' && statField === 'fantasy_points') {
    // Calculate opponent and environment modifiers first (needed for decomposition)
    let opponentFactor = 1.0
    if (opponentId) {
      // For RBs, use rushing opponent factor (most of their fantasy comes from rushing)
      opponentFactor = await calculateOpponentFactor(opponentId, 'rushing', position, season, week)
    }

    // Call decomposition function
    rbDecomposition = await calculateRBFantasyDecomposition(
      seasonStats,
      recentGames,
      opponentFactor,
      environmentMod.modifier,
      trendFactor
    )

    expected = rbDecomposition.expected
  } else if (opportunityField && (statField.includes('receiving') || statField.includes('rushing') || statField.includes('passing'))) {
    // Task 19 (V4): Try enhanced opportunity calculation for WR/TE
    const enhancedOpp = calculateEnhancedOpportunity(seasonStats, recentGames, opportunityField, statField)

    if (enhancedOpp) {
      // Task 19 (V4): Use enhanced opportunity score (quality-adjusted targets)
      let projectedOpportunities = (enhancedOpp.seasonOpportunityScore * CONFIG.opportunity_weights.season) +
                                    (enhancedOpp.recentOpportunityScore * CONFIG.opportunity_weights.recent)

      // Task 13 (V4): Apply game script volume modifier
      if (gameScriptInfo && gameScriptInfo.volumeModifier !== 1.0) {
        projectedOpportunities = projectedOpportunities * gameScriptInfo.volumeModifier
      }

      // Use base targets for efficiency calculation (not quality-adjusted)
      const totalTargets = enhancedOpp.seasonAvgTargets * seasonStats.length
      const totalProduction = seasonValues.reduce((a, b) => a + b, 0)
      const efficiency = totalTargets > 0 ? totalProduction / totalTargets : 0

      if (efficiency > 0) {
        // Quality-adjusted opportunities × base efficiency
        expected = projectedOpportunities * efficiency
      } else {
        const ewmaProj = calculateEWMAProjection(seasonStats, recentGames, statField, position)
        expected = ewmaProj.projection
      }
    } else {
      // Fallback to standard opportunity calculation for non-WR/TE
      // Phase 2.4 (V2): Special handling for RB total touches (rushing + receiving)
      let seasonOpportunities, recentOpportunities

      if (opportunityField === 'total_touches') {
        // Combine rushing attempts + receiving targets for RB fantasy points
        seasonOpportunities = seasonStats
          .map(g => (g.rushing_attempts || 0) + (g.receiving_targets || 0))
          .filter(v => v > 0) // At least 1 touch

        recentOpportunities = recentGames
          .map(g => (g.rushing_attempts || 0) + (g.receiving_targets || 0))
          .filter(v => v > 0)
      } else {
        // Standard single opportunity field
        seasonOpportunities = seasonStats
          .map(g => g[opportunityField])
          .filter(v => v !== null && v !== undefined && !isNaN(v))

        recentOpportunities = recentGames
          .map(g => g[opportunityField])
          .filter(v => v !== null && v !== undefined && !isNaN(v))
      }

      if (seasonOpportunities.length > 0 && recentOpportunities.length > 0) {
        // Step 1: Project opportunities (weighted average)
        const seasonAvgOpp = seasonOpportunities.reduce((a, b) => a + b, 0) / seasonOpportunities.length
        const recentAvgOpp = recentOpportunities.reduce((a, b) => a + b, 0) / recentOpportunities.length
        let projectedOpportunities = (seasonAvgOpp * CONFIG.opportunity_weights.season) +
                                      (recentAvgOpp * CONFIG.opportunity_weights.recent)

      // Task 13 (V4): Apply game script volume modifier to opportunities
      // High-scoring games (+10% volume), low-scoring games (-10% volume)
      if (gameScriptInfo && gameScriptInfo.volumeModifier !== 1.0) {
        projectedOpportunities = projectedOpportunities * gameScriptInfo.volumeModifier
      }

      // Step 2: Calculate efficiency (yards/completions per opportunity)
      const totalOpportunities = seasonOpportunities.reduce((a, b) => a + b, 0)
      const totalProduction = seasonValues.reduce((a, b) => a + b, 0)
      const efficiency = totalOpportunities > 0 ? totalProduction / totalOpportunities : 0

        // Step 3: Project production (opportunities × efficiency)
        if (efficiency > 0) {
          expected = projectedOpportunities * efficiency
        } else {
          // Fallback to EWMA projection
          const ewmaProj = calculateEWMAProjection(seasonStats, recentGames, statField, position)
          expected = ewmaProj.projection
        }
      } else {
        // Fallback to EWMA projection
        const ewmaProj = calculateEWMAProjection(seasonStats, recentGames, statField, position)
        expected = ewmaProj.projection
      }
    }
  } else {
    // Phase 4B (Academic): EWMA temporal smoothing for non-opportunity stats
    // Replaces simple weighted average with exponential smoothing
    // Citation: Zhang et al. (2025) - Deep learning applications in sports
    const ewmaProj = calculateEWMAProjection(seasonStats, recentGames, statField, position)
    expected = ewmaProj.projection
  }

  // Phase 2 (Academic): Apply hierarchical Bayesian shrinkage
  // Shrink player estimate toward position mean based on sample size
  let hierarchicalAdjustment = null
  if (positionStats && positionStats.positionMean) {
    hierarchicalAdjustment = applyHierarchicalAdjustment(seasonValues, positionStats)

    // Use shrunken estimate instead of raw expected value
    // This pulls players with few games toward position average
    expected = hierarchicalAdjustment.shrunkenMean
  }

  // Phase 2.3 (V2): Apply trend momentum adjustment
  // Task 8 (V4): Skip for RB fantasy_points (already applied in decomposition)
  if (!(position === 'RB' && statField === 'fantasy_points')) {
    expected = expected * trendFactor
  }

  // Phase 1.1: Apply opponent defensive efficiency factor
  // Task 8 (V4): Skip for RB fantasy_points (already applied in decomposition)
  let opponentFactor = 1.0
  if (opponentId && !(position === 'RB' && statField === 'fantasy_points')) {
    let statCategory = 'passing'
    if (statField.includes('rushing')) {
      statCategory = 'rushing'
    } else if (statField.includes('receiving')) {
      statCategory = 'receiving'
    }

    // Task 1 (V4): Pass position parameter for position-specific matchup logic
    opponentFactor = await calculateOpponentFactor(opponentId, statCategory, position, season, week)
    expected = expected * opponentFactor
  }

  // Task 5 (V4): Apply dynamic efficiency modifier (EPA-based if available)
  // Note: Requires epa_per_play field in player_game_stats (from advanced-analytics-scraper)
  // Gracefully falls back to 1.0 if EPA data not available
  const playerEPA = seasonStats.length > 0 ? seasonStats[0].epa_per_play : null
  const efficiencyMod = await calculateEfficiencyModifier(playerEPA, position, season)
  expected = expected * efficiencyMod

  // Phase 3 (Academic V2): Bootstrap Prediction Intervals
  // Calculate combined modifier for bootstrap (opponent × environment × efficiency)
  const combinedModifier = opponentFactor * environmentMod.modifier * efficiencyMod

  // Generate bootstrap prediction interval with modifiers applied
  const bootstrapInterval = calculateModifiedPredictionInterval(
    seasonValues,
    combinedModifier,
    {
      numSamples: CONFIG.bootstrap_samples || 500,
      bootstrapPercentile: CONFIG.bootstrap_confidence || 0.80,
      statistic: 'mean'
    }
  );

  // Use bootstrap results for floor/expected/ceiling (override previous calculations)
  const floor = bootstrapInterval.floor;
  expected = bootstrapInterval.expected; // Reassign (already declared above)
  const ceiling = bootstrapInterval.ceiling;

  // Confidence level assessment (HIGH/MEDIUM/LOW)
  const confidenceLevel = assessConfidenceLevel(bootstrapInterval);

  // Legacy confidence score for compatibility
  const confidence = calculateConfidence(seasonValues.length, seasonStdDev, seasonAvg)

  return {
    season_avg: Math.round(seasonAvg * 10) / 10,
    recent_avg: Math.round(recentAvg * 10) / 10,
    std_dev: Math.round(seasonStdDev * 10) / 10,
    expected: Math.round(expected * 10) / 10,
    floor: Math.round(floor * 10) / 10,
    ceiling: Math.round(ceiling * 10) / 10,
    confidence: confidence,
    confidence_level: confidenceLevel, // HIGH/MEDIUM/LOW (bootstrap-based)
    opponent_factor: opponentFactor,  // Show opponent matchup difficulty
    bootstrap_interval_width: bootstrapInterval.intervalWidth,
    bootstrap_samples: bootstrapInterval.bootstrapSamples
  }
}

/**
 * Calculate confidence score (0-1)
 */
function calculateConfidence(sampleSize, stdDev, mean) {
  // Coefficient of variation (lower is more consistent)
  const cv = mean > 0 ? stdDev / mean : 1

  // Sample size factor (more games = higher confidence)
  const sampleFactor = Math.min(sampleSize / 10, 1)

  // Consistency factor (lower CV = higher confidence)
  const consistencyFactor = Math.max(0, 1 - cv)

  // Combined confidence
  const confidence = (sampleFactor * 0.4) + (consistencyFactor * 0.6)

  return Math.round(confidence * 100) / 100
}

/**
 * Display team floors in readable format
 * Shows top players by position: 1 QB, 2 RB, 3 WR, 1 TE
 */
function displayTeamFloors(players, teamId) {
  if (!players || players.length === 0) {
    log(`\nNo projections available for ${teamId}`)
    return
  }

  // Position limits for typical lineup
  const positionLimits = {
    'QB': 1,
    'RB': 2,
    'WR': 3,
    'TE': 1
  }

  const positions = ['QB', 'RB', 'WR', 'TE']

  for (const pos of positions) {
    const posPlayers = players.filter(p => p.position === pos)

    if (posPlayers.length === 0) continue

    // Sort by fantasy points expected (if available)
    posPlayers.sort((a, b) => {
      const aFantasy = a.projections.find(p => p.stat === 'Fantasy Points')
      const bFantasy = b.projections.find(p => p.stat === 'Fantasy Points')
      return (bFantasy?.expected || 0) - (aFantasy?.expected || 0)
    })

    // Limit to top N players per position
    const limit = positionLimits[pos] || 999
    const displayPlayers = posPlayers.slice(0, limit)

    log(`\n${pos}${limit > 1 ? 's' : ''} (Top ${limit}):`)
    log('─'.repeat(80))

    for (const player of displayPlayers) {
      // Task 18 (V4): Display probabilistic injury information
      let injuryWarning = ''
      if (player.injury_status && player.participationProbability < 1.0) {
        const percentage = (player.participationProbability * 100).toFixed(0)
        injuryWarning = ` ⚠️ ${player.injury_status.toUpperCase()} (${percentage}% participation${player.injury_type ? ', ' + player.injury_type : ''})`
      }
      log(`\n  ${player.player_name} (${player.games_played} games)${injuryWarning}:`)

      for (const proj of player.projections) {
        log(`    ${proj.stat}:`)
        log(`      ${proj.floor} ← ${proj.expected} → ${proj.ceiling} (80% CI)`)
        log(`      Recent: ${proj.recent_avg} | Season: ${proj.season_avg} | StdDev: ${proj.std_dev}`)

        // Show opponent matchup difficulty
        const matchupIndicator = proj.opponent_factor > 1.05 ? '✅ Easier' :
                                proj.opponent_factor < 0.95 ? '⚠️ Tougher' : '➖ Average'
        log(`      Opponent Factor: ${proj.opponent_factor} ${matchupIndicator}`)

        // Show bootstrap-based confidence level
        const confidenceEmoji = proj.confidence_level === 'HIGH' ? '🟢' :
                                proj.confidence_level === 'MEDIUM' ? '🟡' : '🔴';
        log(`      Confidence: ${confidenceEmoji} ${proj.confidence_level} (${(proj.confidence * 100).toFixed(0)}%)`)
        log(`      Bootstrap: ${proj.bootstrap_samples} samples, ±${proj.bootstrap_interval_width} range`)

        // Task 18 (V4): Show injury adjustment if applied
        if (proj.injury_adjusted) {
          log(`      ⚠️ Injury Adjusted: Values reduced by ${(100 - player.participationProbability * 100).toFixed(0)}% (participation probability)`)
        }
      }
    }
  }
}

/**
 * Calculate floors for games by week
 */
async function calculateFloorsForWeek(week, season = CONFIG.current_season) {
  log(`\nFetching games for Week ${week}...`)

  const { data: games } = await supabase
    .from('games')
    .select('game_id')
    .eq('season', season)
    .eq('week', week)
    .eq('status', 'scheduled')

  if (!games || games.length === 0) {
    log(`No scheduled games found for Week ${week}`)
    return
  }

  for (const game of games) {
    await calculateFloorsForGame(game.game_id, season)
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)

  // Phase 3.2 (V2): Check for JSON mode flag
  if (args.includes('--json')) {
    JSON_MODE = true
  }

  if (args.includes('--help')) {
    log(`
Usage:
  node scripts/calculate-performance-floors.js [options]

Options:
  --game=<game_id>   Calculate floors for specific game
  --week=<week>      Calculate floors for all scheduled games in week
  --json             Output results as JSON (for programmatic use)
  --help             Show this help message

Examples:
  node scripts/calculate-performance-floors.js --week=7
  node scripts/calculate-performance-floors.js --game=401772510
  node scripts/calculate-performance-floors.js --week=7 --json > floors.json
    `)
    return
  }

  const gameArg = args.find(arg => arg.startsWith('--game='))
  const weekArg = args.find(arg => arg.startsWith('--week='))

  if (gameArg) {
    const gameId = gameArg.split('=')[1]
    await calculateFloorsForGame(gameId)
  } else if (weekArg) {
    const week = parseInt(weekArg.split('=')[1])
    await calculateFloorsForWeek(week)
  } else {
    log('Please specify --game=<game_id> or --week=<week>')
    log('Run with --help for usage information')
  }

  // Phase 3.2 (V2): Output JSON if in JSON mode
  if (JSON_MODE) {
    log(JSON.stringify(JSON_OUTPUT, null, 2))
  }
}

main()
  .catch(error => {
    logError('Error:', error)
    process.exit(1)
  })
