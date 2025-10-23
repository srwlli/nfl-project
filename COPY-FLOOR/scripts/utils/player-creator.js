/**
 * Player Creator Utility
 * Workorder: WO-GAME-DAY-ROSTER-TRACKING-001
 * Task: UTIL-001
 *
 * Purpose: Auto-create missing players by fetching from ESPN API
 * This solves FK constraint violations when players appear in games
 * but are missing from the players table (released, traded, etc.)
 */

import axios from 'axios'
import { logger } from './logger.js'
import { getSupabaseClient } from './supabase-client.js'

const supabase = getSupabaseClient()

/**
 * Parse ESPN height string to inches
 * @param {string} heightStr - Format: "6'2\"" or "6-2"
 * @returns {number|null} - Total inches
 */
function parseHeight(heightStr) {
  if (!heightStr) return null

  // Handle "6'2\"" format
  const feetInchesMatch = heightStr.match(/(\d+)'(\d+)"/)
  if (feetInchesMatch) {
    const feet = parseInt(feetInchesMatch[1])
    const inches = parseInt(feetInchesMatch[2])
    return feet * 12 + inches
  }

  // Handle "6-2" format
  const dashMatch = heightStr.match(/(\d+)-(\d+)/)
  if (dashMatch) {
    const feet = parseInt(dashMatch[1])
    const inches = parseInt(dashMatch[2])
    return feet * 12 + inches
  }

  return null
}

/**
 * Fetch player data from ESPN API
 * @param {string} playerId - Player ID (e.g., "espn-4372085")
 * @returns {Promise<Object|null>} - Player data or null if not found
 */
export async function fetchPlayerFromESPN(playerId) {
  // Extract ESPN ID (remove 'espn-' prefix)
  const espnId = playerId.replace('espn-', '')

  try {
    // Fetch from ESPN athlete endpoint
    const url = `https://site.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${espnId}`
    logger.info(`Fetching player ${playerId} from ESPN API...`)

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const data = response.data
    if (!data || !data.athlete) {
      logger.warn(`Player ${playerId} not found in ESPN API`)
      return null
    }

    const athlete = data.athlete

    // Get team info if available
    let teamId = null
    if (athlete.team && athlete.team.id) {
      teamId = `espn-${athlete.team.id}`
    }

    // Transform to our schema
    const player = {
      player_id: playerId,
      full_name: athlete.displayName || athlete.fullName || `${athlete.firstName} ${athlete.lastName}`,
      first_name: athlete.firstName || null,
      last_name: athlete.lastName || null,
      jersey_number: athlete.jersey ? parseInt(athlete.jersey) : null,
      primary_position: athlete.position?.abbreviation || 'UNK',
      height_inches: parseHeight(athlete.displayHeight || athlete.height),
      weight_lbs: athlete.weight ? parseInt(athlete.weight) : null,
      college: athlete.college?.name || null,
      birth_date: athlete.dateOfBirth || null,
      headshot_url: athlete.headshot?.href || null,
      profile_url: athlete.links?.find(l => l.rel?.includes('playercard'))?.href || null,
      status: 'active', // Default to active
      draft_year: athlete.draft?.year || null,
      draft_round: athlete.draft?.round || null,
      draft_pick: athlete.draft?.selection || null,
      metadata: {
        espn_id: espnId,
        team_id: teamId,
        auto_created: true,
        created_at: new Date().toISOString(),
        source: 'espn_api_athlete_endpoint'
      }
    }

    logger.info(`✓ Fetched ${player.full_name} (${playerId}) - ${player.primary_position}`)
    return player

  } catch (error) {
    if (error.response?.status === 404) {
      logger.warn(`Player ${playerId} not found (404)`)
    } else {
      logger.error(`Failed to fetch player ${playerId}: ${error.message}`)
    }
    return null
  }
}

/**
 * Check if players exist in database (batch query)
 * @param {Array<string>} playerIds - Array of player IDs
 * @returns {Promise<Set<string>>} - Set of existing player IDs
 */
export async function getExistingPlayers(playerIds) {
  if (!playerIds || playerIds.length === 0) {
    return new Set()
  }

  try {
    const { data, error } = await supabase
      .from('players')
      .select('player_id')
      .in('player_id', playerIds)

    if (error) {
      logger.error(`Failed to check existing players: ${error.message}`)
      return new Set()
    }

    return new Set(data.map(p => p.player_id))

  } catch (error) {
    logger.error(`Failed to check existing players: ${error.message}`)
    return new Set()
  }
}

/**
 * Create player in database with UPSERT
 * @param {Object} player - Player data object
 * @returns {Promise<boolean>} - True if successful
 */
export async function createPlayer(player) {
  try {
    const { error } = await supabase
      .from('players')
      .upsert(player, {
        onConflict: 'player_id',
        ignoreDuplicates: false
      })

    if (error) {
      logger.error(`Failed to upsert player ${player.player_id}: ${error.message}`)
      return false
    }

    logger.info(`✓ Upserted player ${player.full_name} (${player.player_id})`)
    return true

  } catch (error) {
    logger.error(`Failed to upsert player ${player.player_id}: ${error.message}`)
    return false
  }
}

/**
 * Auto-create missing players with rate limiting
 * @param {Array<string>} playerIds - Array of player IDs to create
 * @param {Object} options - Options for rate limiting
 * @param {number} options.rateLimit - Milliseconds between requests (default: 1000)
 * @returns {Promise<Object>} - Results object with created, failed, and skipped counts
 */
export async function autoCreatePlayers(playerIds, options = {}) {
  const { rateLimit = 1000 } = options

  // Check which players already exist
  const existingPlayerIds = await getExistingPlayers(playerIds)
  const missingPlayerIds = playerIds.filter(id => !existingPlayerIds.has(id))

  if (missingPlayerIds.length === 0) {
    logger.info('All players already exist in database')
    return { created: 0, failed: 0, skipped: playerIds.length }
  }

  logger.info(`Found ${missingPlayerIds.length} missing players to create`)

  const results = {
    created: 0,
    failed: 0,
    skipped: existingPlayerIds.size,
    failedPlayers: []
  }

  for (const playerId of missingPlayerIds) {
    // Fetch from ESPN API
    const playerData = await fetchPlayerFromESPN(playerId)

    if (playerData) {
      // Create in database
      const success = await createPlayer(playerData)
      if (success) {
        results.created++
      } else {
        results.failed++
        results.failedPlayers.push(playerId)
      }
    } else {
      results.failed++
      results.failedPlayers.push(playerId)
    }

    // Rate limit: wait before next request
    if (missingPlayerIds.indexOf(playerId) < missingPlayerIds.length - 1) {
      await new Promise(resolve => setTimeout(resolve, rateLimit))
    }
  }

  logger.info(`Auto-create summary: ${results.created} created, ${results.failed} failed, ${results.skipped} skipped`)

  return results
}

/**
 * Extract player IDs from game roster data
 * @param {Object} gameData - ESPN game summary data
 * @returns {Array<string>} - Array of player IDs found in rosters
 */
export function extractPlayerIdsFromGame(gameData) {
  const playerIds = new Set()

  // Extract from boxscore > players array
  if (gameData.boxscore && gameData.boxscore.players) {
    for (const team of gameData.boxscore.players) {
      if (team.statistics) {
        for (const statGroup of team.statistics) {
          if (statGroup.athletes) {
            for (const athlete of statGroup.athletes) {
              if (athlete.athlete && athlete.athlete.id) {
                playerIds.add(`espn-${athlete.athlete.id}`)
              }
            }
          }
        }
      }
    }
  }

  // Extract from rosters (if available)
  if (gameData.rosters) {
    for (const roster of gameData.rosters) {
      if (roster.roster) {
        for (const player of roster.roster) {
          if (player.athlete && player.athlete.id) {
            playerIds.add(`espn-${player.athlete.id}`)
          }
        }
      }
    }
  }

  return Array.from(playerIds)
}
