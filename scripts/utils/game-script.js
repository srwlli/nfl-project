/**
 * Game Script Adjustment Utilities
 *
 * Provides betting line context (spread, over/under) for performance floor projections.
 * Adjusts projections based on expected game flow and pace.
 *
 * Academic Foundation:
 * - Favored teams run more (RB boost), underdogs pass more (QB/WR boost)
 * - High-scoring games increase volume for all positions
 * - Based on Vegas betting market consensus
 *
 * Data Source: nflverse consensus betting lines in game_betting_lines table
 *
 * Usage:
 *   const context = await getBettingContextForGame(gameId, season)
 *   const modifier = calculateGameScriptModifier(position, team, context.spread, context.total, context.favoriteTeam)
 */

import { getSupabaseClient } from './supabase-client.js'
import { logger } from './logger.js'

/**
 * Map ESPN game ID to date-based betting game ID format
 *
 * @param {string} espnGameId - ESPN game ID (e.g., 'espn-401772941')
 * @param {number} season - Season year
 * @returns {Promise<string|null>} - Betting game ID (e.g., '20251020-PIT@CIN') or null if not found
 *
 * @example
 * const bettingId = await mapGameToBettingId('espn-401772941', 2025)
 * // Returns: '20251020-PIT@CIN'
 */
export async function mapGameToBettingId(espnGameId, season) {
  const supabase = getSupabaseClient()

  try {
    // Query games table for game details
    const { data, error } = await supabase
      .from('games')
      .select('game_date, home_team_id, away_team_id')
      .eq('game_id', espnGameId)
      .eq('season', season)
      .single()

    if (error || !data) {
      logger.debug(`Game not found in database: ${espnGameId}`)
      return null
    }

    const { game_date, home_team_id, away_team_id } = data

    if (!game_date || !home_team_id || !away_team_id) {
      logger.warn(`Missing game data for ${espnGameId}: date=${game_date}, home=${home_team_id}, away=${away_team_id}`)
      return null
    }

    // Parse game_date (format: YYYY-MM-DD) to YYYYMMDD
    const dateStr = game_date.replace(/-/g, '')

    // Format: YYYYMMDD-AWAY@HOME
    const bettingGameId = `${dateStr}-${away_team_id}@${home_team_id}`

    return bettingGameId

  } catch (error) {
    logger.error(`Error mapping game ID ${espnGameId}:`, error.message)
    return null
  }
}

/**
 * Fetch betting lines from database using flat schema
 *
 * @param {string} bettingGameId - Betting game ID (e.g., '20251020-PIT@CIN')
 * @param {number} season - Season year
 * @returns {Promise<Object>} - Betting data { spread, total, favoriteTeam, underdogTeam, hasData }
 *
 * @example
 * const lines = await getGameBettingLines('20251020-PIT@CIN', 2025)
 * // Returns: { spread: 3.5, total: 48.5, favoriteTeam: 'CIN', underdogTeam: 'PIT', hasData: true }
 */
export async function getGameBettingLines(bettingGameId, season) {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('game_betting_lines')
      .select('spread_line, total_line, favorite_team_id, underdog_team_id')
      .eq('game_id', bettingGameId)
      .eq('season', season)
      .single()

    if (error || !data) {
      return {
        spread: null,
        total: null,
        favoriteTeam: null,
        underdogTeam: null,
        hasData: false
      }
    }

    const { spread_line, total_line, favorite_team_id, underdog_team_id } = data

    // Validate data
    if (spread_line === null || total_line === null) {
      return {
        spread: null,
        total: null,
        favoriteTeam: null,
        underdogTeam: null,
        hasData: false
      }
    }

    return {
      spread: spread_line,
      total: total_line,
      favoriteTeam: favorite_team_id,
      underdogTeam: underdog_team_id,
      hasData: true
    }

  } catch (error) {
    logger.error(`Error fetching betting lines for ${bettingGameId}:`, error.message)
    return {
      spread: null,
      total: null,
      favoriteTeam: null,
      underdogTeam: null,
      hasData: false
    }
  }
}

/**
 * Get complete betting context for a game (convenience wrapper)
 *
 * @param {string} espnGameId - ESPN game ID
 * @param {number} season - Season year
 * @returns {Promise<Object>} - Complete betting context with bettingGameId included
 *
 * @example
 * const context = await getBettingContextForGame('espn-401772941', 2025)
 * // Returns: { spread: 3.5, total: 48.5, favoriteTeam: 'CIN', underdogTeam: 'PIT', bettingGameId: '20251020-PIT@CIN', hasData: true }
 */
export async function getBettingContextForGame(espnGameId, season) {
  // Step 1: Map ESPN ID to betting ID
  const bettingGameId = await mapGameToBettingId(espnGameId, season)

  if (!bettingGameId) {
    return {
      spread: null,
      total: null,
      favoriteTeam: null,
      underdogTeam: null,
      bettingGameId: null,
      hasData: false
    }
  }

  // Step 2: Fetch betting lines
  const bettingData = await getGameBettingLines(bettingGameId, season)

  // Step 3: Return combined result
  return {
    ...bettingData,
    bettingGameId
  }
}

/**
 * Calculate game script modifier based on spread and total
 *
 * @param {string} position - Player position (QB, RB, WR, TE)
 * @param {string} playerTeam - Player's team abbreviation (e.g., 'PIT')
 * @param {number} spread - Betting spread (absolute value)
 * @param {number} total - Over/under total points
 * @param {string} favoriteTeam - Team abbreviation of favorite
 * @returns {Object} - { modifier, spreadMod, totalMod, spread, total, isFavored }
 *
 * @example
 * // Underdog WR in high-scoring game
 * const mod = calculateGameScriptModifier('WR', 'PIT', 3.5, 52.5, 'CIN')
 * // Returns: { modifier: 1.16, spreadMod: 1.05, totalMod: 1.05, spread: 3.5, total: 52.5, isFavored: false }
 *
 * @formula
 * Spread Modifiers:
 * - RB: isFavored ? 1 + (spread × 0.02) : 1 - (spread × 0.02), cap: 0.80-1.20
 * - WR: isFavored ? 1 - (spread × 0.015) : 1 + (spread × 0.015), cap: 0.85-1.15
 * - QB: isFavored ? 1 - (spread × 0.01) : 1 + (spread × 0.01), cap: 0.85-1.15
 * - TE: isFavored ? 1 - (spread × 0.005) : 1 + (spread × 0.005), cap: 0.95-1.05
 *
 * Total Modifier:
 * - 1 + ((total - 47.5) / 47.5) × position_sensitivity
 * - Sensitivities: QB=0.4, RB=0.3, WR=0.5, TE=0.3
 * - Cap: 0.70-1.30
 *
 * Combined: spreadMod × totalMod
 */
export function calculateGameScriptModifier(position, playerTeam, spread, total, favoriteTeam) {
  // Determine if player's team is favored
  const isFavored = playerTeam === favoriteTeam

  // Position-specific spread sensitivities
  const spreadSensitivities = {
    QB: 0.01,
    RB: 0.02,
    WR: 0.015,
    TE: 0.005
  }

  // Position-specific total (pace) sensitivities
  const totalSensitivities = {
    QB: 0.4,
    RB: 0.3,
    WR: 0.5,
    TE: 0.3
  }

  // Spread caps by position
  const spreadCaps = {
    QB: { min: 0.85, max: 1.15 },
    RB: { min: 0.80, max: 1.20 },
    WR: { min: 0.85, max: 1.15 },
    TE: { min: 0.95, max: 1.05 }
  }

  // Total caps (same for all positions)
  const totalCap = { min: 0.70, max: 1.30 }

  const sensitivity = spreadSensitivities[position] || 0
  const totalSensitivity = totalSensitivities[position] || 0
  const caps = spreadCaps[position] || { min: 0.90, max: 1.10 }

  // Calculate spread modifier
  let spreadMod
  if (position === 'RB') {
    // RBs: Favored teams run more (positive modifier for favorites)
    spreadMod = isFavored
      ? 1 + (spread * sensitivity)
      : 1 - (spread * sensitivity)
  } else {
    // QB/WR/TE: Underdogs pass more (positive modifier for underdogs)
    spreadMod = isFavored
      ? 1 - (spread * sensitivity)
      : 1 + (spread * sensitivity)
  }

  // Cap spread modifier
  spreadMod = Math.max(caps.min, Math.min(caps.max, spreadMod))

  // Calculate total (pace) modifier
  // Baseline total: 47.5 (league average)
  const totalDelta = (total - 47.5) / 47.5
  let totalMod = 1 + (totalDelta * totalSensitivity)

  // Cap total modifier
  totalMod = Math.max(totalCap.min, Math.min(totalCap.max, totalMod))

  // Combined modifier
  const modifier = spreadMod * totalMod

  return {
    modifier,
    spreadMod,
    totalMod,
    spread,
    total,
    isFavored
  }
}
