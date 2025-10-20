/**
 * Fantasy Points Calculator
 *
 * Calculates fantasy points for multiple scoring formats:
 * - Standard (no PPR)
 * - PPR (Point Per Reception)
 * - Half-PPR (0.5 points per reception)
 * - DraftKings DFS
 * - FanDuel DFS
 *
 * Usage:
 * import { calculateFantasyPoints } from './fantasy-calculator.js'
 * const points = calculateFantasyPoints(playerStats)
 */

/**
 * Calculate fantasy points for all scoring formats
 * @param {Object} stats - Player game stats object
 * @returns {Object} Fantasy points for all formats
 */
export function calculateFantasyPoints(stats) {
  const {
    passing_yards = 0,
    passing_touchdowns = 0,
    passing_interceptions = 0,
    rushing_yards = 0,
    rushing_touchdowns = 0,
    receptions = 0,
    receiving_yards = 0,
    receiving_touchdowns = 0,
    rushing_fumbles_lost = 0,
    receiving_fumbles = 0,
    passing_yards_300_bonus = false, // Calculated: passing_yards >= 300
    rushing_yards_100_bonus = false, // Calculated: rushing_yards >= 100
    receiving_yards_100_bonus = false // Calculated: receiving_yards >= 100
  } = stats

  // Calculate total fumbles lost
  const fumbles_lost = (rushing_fumbles_lost || 0) + (receiving_fumbles || 0)

  // Standard Scoring (no PPR)
  const standard = calculateStandard({
    passing_yards,
    passing_touchdowns,
    passing_interceptions,
    rushing_yards,
    rushing_touchdowns,
    receiving_yards,
    receiving_touchdowns,
    fumbles_lost
  })

  // PPR (1 point per reception)
  const ppr = standard + (receptions * 1.0)

  // Half-PPR (0.5 points per reception)
  const half_ppr = standard + (receptions * 0.5)

  // DraftKings DFS
  const dfs_dk = calculateDraftKings({
    passing_yards,
    passing_touchdowns,
    passing_interceptions,
    rushing_yards,
    rushing_touchdowns,
    receptions,
    receiving_yards,
    receiving_touchdowns,
    fumbles_lost
  })

  // FanDuel DFS
  const dfs_fd = calculateFanDuel({
    passing_yards,
    passing_touchdowns,
    passing_interceptions,
    rushing_yards,
    rushing_touchdowns,
    receptions,
    receiving_yards,
    receiving_touchdowns,
    fumbles_lost
  })

  return {
    fantasy_points_standard: round(standard),
    fantasy_points_ppr: round(ppr),
    fantasy_points_half_ppr: round(half_ppr),
    fantasy_points_dfs_dk: round(dfs_dk),
    fantasy_points_dfs_fd: round(dfs_fd)
  }
}

/**
 * Standard scoring (no PPR)
 */
function calculateStandard(stats) {
  const {
    passing_yards,
    passing_touchdowns,
    passing_interceptions,
    rushing_yards,
    rushing_touchdowns,
    receiving_yards,
    receiving_touchdowns,
    fumbles_lost
  } = stats

  return (
    (passing_yards * 0.04) + // 1 pt per 25 yards
    (passing_touchdowns * 4) +
    (passing_interceptions * -2) +
    (rushing_yards * 0.1) + // 1 pt per 10 yards
    (rushing_touchdowns * 6) +
    (receiving_yards * 0.1) + // 1 pt per 10 yards
    (receiving_touchdowns * 6) +
    (fumbles_lost * -2)
  )
}

/**
 * DraftKings DFS scoring
 * https://www.draftkings.com/help/rules/nfl
 */
function calculateDraftKings(stats) {
  const {
    passing_yards,
    passing_touchdowns,
    passing_interceptions,
    rushing_yards,
    rushing_touchdowns,
    receptions,
    receiving_yards,
    receiving_touchdowns,
    fumbles_lost
  } = stats

  let points = 0

  // Passing
  points += passing_yards * 0.04 // 1 pt per 25 yards
  points += passing_touchdowns * 4
  points += passing_interceptions * -1
  if (passing_yards >= 300) points += 3 // 300-yard bonus

  // Rushing
  points += rushing_yards * 0.1 // 1 pt per 10 yards
  points += rushing_touchdowns * 6
  if (rushing_yards >= 100) points += 3 // 100-yard bonus

  // Receiving
  points += receptions * 1.0 // Full PPR
  points += receiving_yards * 0.1 // 1 pt per 10 yards
  points += receiving_touchdowns * 6
  if (receiving_yards >= 100) points += 3 // 100-yard bonus

  // Fumbles
  points += fumbles_lost * -1

  return points
}

/**
 * FanDuel DFS scoring
 * https://www.fanduel.com/how-to-play-daily-fantasy-football
 */
function calculateFanDuel(stats) {
  const {
    passing_yards,
    passing_touchdowns,
    passing_interceptions,
    rushing_yards,
    rushing_touchdowns,
    receptions,
    receiving_yards,
    receiving_touchdowns,
    fumbles_lost
  } = stats

  let points = 0

  // Passing
  points += passing_yards * 0.04 // 1 pt per 25 yards
  points += passing_touchdowns * 4
  points += passing_interceptions * -1

  // Rushing
  points += rushing_yards * 0.1 // 1 pt per 10 yards
  points += rushing_touchdowns * 6

  // Receiving
  points += receptions * 0.5 // Half PPR
  points += receiving_yards * 0.1 // 1 pt per 10 yards
  points += receiving_touchdowns * 6

  // Fumbles
  points += fumbles_lost * -2

  return points
}

/**
 * Round to 2 decimal places
 */
function round(num) {
  return Math.round(num * 100) / 100
}

/**
 * Calculate defensive fantasy points (for DST)
 * @param {Object} stats - Defensive stats object
 * @returns {Object} Fantasy points for defense
 */
export function calculateDefensiveFantasyPoints(stats) {
  const {
    points_allowed = 0,
    sacks = 0,
    interceptions = 0,
    fumble_recoveries = 0,
    defensive_touchdowns = 0,
    safety = 0,
    blocked_kicks = 0
  } = stats

  let points = 0

  // Points allowed (tiered)
  if (points_allowed === 0) points += 10
  else if (points_allowed <= 6) points += 7
  else if (points_allowed <= 13) points += 4
  else if (points_allowed <= 20) points += 1
  else if (points_allowed <= 27) points += 0
  else if (points_allowed <= 34) points += -1
  else points += -4

  // Defensive stats
  points += sacks * 1
  points += interceptions * 2
  points += fumble_recoveries * 2
  points += defensive_touchdowns * 6
  points += safety * 2
  points += blocked_kicks * 2

  return {
    fantasy_points_defense: round(points)
  }
}

/**
 * Calculate kicker fantasy points
 * @param {Object} stats - Kicker stats object
 * @returns {Object} Fantasy points for kicker
 */
export function calculateKickerFantasyPoints(stats) {
  const {
    field_goals_0_39 = 0,
    field_goals_40_49 = 0,
    field_goals_50_plus = 0,
    extra_points_made = 0
  } = stats

  let points = 0

  // Field goals by distance
  points += field_goals_0_39 * 3
  points += field_goals_40_49 * 4
  points += field_goals_50_plus * 5

  // Extra points
  points += extra_points_made * 1

  return {
    fantasy_points_kicker: round(points)
  }
}

/**
 * Get fantasy position rank based on scoring format
 * @param {number} points - Fantasy points
 * @param {string} position - Player position (QB, RB, WR, TE)
 * @param {Array} allPlayerPoints - Array of all player points for this position
 * @returns {number} Position rank (1-indexed)
 */
export function getPositionRank(points, position, allPlayerPoints) {
  const sortedPoints = [...allPlayerPoints].sort((a, b) => b - a)
  const rank = sortedPoints.indexOf(points) + 1
  return rank
}

/**
 * Format position rank for display
 * @param {string} position - Player position
 * @param {number} rank - Position rank
 * @returns {string} Formatted rank (e.g., 'QB1', 'RB12', 'WR3')
 */
export function formatPositionRank(position, rank) {
  return `${position}${rank}`
}

/**
 * Calculate fantasy points breakdown (itemized)
 * @param {Object} stats - Player game stats
 * @returns {Object} Breakdown of points by category
 */
export function calculateFantasyBreakdown(stats) {
  const {
    passing_yards = 0,
    passing_touchdowns = 0,
    passing_interceptions = 0,
    rushing_yards = 0,
    rushing_touchdowns = 0,
    receptions = 0,
    receiving_yards = 0,
    receiving_touchdowns = 0,
    fumbles_lost = 0
  } = stats

  return {
    passing_yards_points: round(passing_yards * 0.04),
    passing_td_points: passing_touchdowns * 4,
    passing_int_points: passing_interceptions * -2,
    rushing_yards_points: round(rushing_yards * 0.1),
    rushing_td_points: rushing_touchdowns * 6,
    receptions_points: receptions * 1.0, // PPR
    receiving_yards_points: round(receiving_yards * 0.1),
    receiving_td_points: receiving_touchdowns * 6,
    fumbles_lost_points: fumbles_lost * -2
  }
}

/**
 * Check if player had boom/bust week
 * @param {number} points - Fantasy points scored
 * @param {string} position - Player position
 * @returns {Object} Boom/bust classification
 */
export function classifyWeekPerformance(points, position) {
  const thresholds = {
    QB: { boom: 25, bust: 10 },
    RB: { boom: 20, bust: 8 },
    WR: { boom: 20, bust: 8 },
    TE: { boom: 15, bust: 5 }
  }

  const threshold = thresholds[position] || { boom: 20, bust: 8 }

  if (points >= threshold.boom) {
    return { classification: 'boom', label: '💥 Boom Week' }
  } else if (points <= threshold.bust) {
    return { classification: 'bust', label: '💔 Bust Week' }
  } else {
    return { classification: 'normal', label: 'Normal Week' }
  }
}

export default {
  calculateFantasyPoints,
  calculateDefensiveFantasyPoints,
  calculateKickerFantasyPoints,
  getPositionRank,
  formatPositionRank,
  calculateFantasyBreakdown,
  classifyWeekPerformance
}
