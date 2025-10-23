/**
 * ESPN API Utility
 *
 * Wrapper for ESPN's public NFL API endpoints.
 * No authentication required.
 *
 * Base URL: https://site.api.espn.com/apis/site/v2/sports/football/nfl/
 */

import axios from 'axios'
import { logger } from './logger.js'
import { createRateLimiter, delay } from './rate-limiter.js'

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'

// ESPN doesn't publish rate limits, so we'll be conservative: 1 request per second
const rateLimiter = createRateLimiter(1)

/**
 * Fetch all NFL teams from ESPN
 *
 * @returns {Promise<Array>} Array of team objects
 */
export async function fetchTeams() {
  return rateLimiter.execute(async () => {
    try {
      logger.info('Fetching teams from ESPN API...')
      const response = await axios.get(`${ESPN_API_BASE}/teams`, {
        params: { limit: 32 }
      })

      const teams = response.data.sports[0].leagues[0].teams.map(t => t.team)
      logger.info(`✓ Fetched ${teams.length} teams from ESPN`)
      return teams
    } catch (error) {
      logger.error('Failed to fetch teams from ESPN:', error.message)
      throw error
    }
  })
}

/**
 * Fetch roster for a specific team
 *
 * @param {string} teamId - ESPN team ID
 * @returns {Promise<Array>} Array of player objects
 */
export async function fetchTeamRoster(teamId) {
  return rateLimiter.execute(async () => {
    try {
      logger.debug(`Fetching roster for team ${teamId}...`)
      const response = await axios.get(`${ESPN_API_BASE}/teams/${teamId}/roster`)

      // ESPN returns players grouped by position category (offense, defense, specialTeam, etc.)
      // Each category has an "items" array with the actual players
      const athleteGroups = response.data.athletes || []
      const allPlayers = []

      athleteGroups.forEach(group => {
        if (group.items && Array.isArray(group.items)) {
          allPlayers.push(...group.items)
        }
      })

      logger.debug(`✓ Fetched ${allPlayers.length} players for team ${teamId}`)
      return allPlayers
    } catch (error) {
      logger.error(`Failed to fetch roster for team ${teamId}:`, error.message)
      return [] // Return empty array instead of throwing to allow partial success
    }
  })
}

/**
 * Fetch rosters for all NFL teams
 *
 * @returns {Promise<Array>} Array of all players across all teams
 */
export async function fetchAllRosters() {
  try {
    logger.info('Fetching all NFL team rosters from ESPN...')

    // First, get all teams
    const teams = await fetchTeams()
    logger.info(`Found ${teams.length} teams, fetching rosters...`)

    const allPlayers = []
    let successCount = 0
    let failCount = 0

    // Fetch roster for each team (with rate limiting built in)
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i]
      logger.info(`[${i + 1}/${teams.length}] Fetching roster for ${team.displayName}...`)

      try {
        const roster = await fetchTeamRoster(team.id)

        if (roster.length > 0) {
          // Add team info to each player
          roster.forEach(player => {
            player.teamInfo = {
              id: team.id,
              abbreviation: team.abbreviation,
              displayName: team.displayName
            }
          })

          allPlayers.push(...roster)
          successCount++
          logger.info(`  ✓ Added ${roster.length} players (Total: ${allPlayers.length})`)
        } else {
          failCount++
          logger.warn(`  ⚠️  No players found for ${team.displayName}`)
        }
      } catch (error) {
        failCount++
        logger.error(`  ✗ Failed to fetch ${team.displayName}: ${error.message}`)
      }

      // Progress update every 5 teams
      if ((i + 1) % 5 === 0) {
        logger.info(`Progress: ${i + 1}/${teams.length} teams processed, ${allPlayers.length} total players`)
      }
    }

    logger.info('═'.repeat(60))
    logger.info(`Roster fetch complete:`)
    logger.info(`  ✓ Successful teams: ${successCount}/${teams.length}`)
    logger.info(`  ✗ Failed teams: ${failCount}/${teams.length}`)
    logger.info(`  Total players fetched: ${allPlayers.length}`)
    logger.info('═'.repeat(60))

    return allPlayers
  } catch (error) {
    logger.error('Failed to fetch all rosters:', error)
    throw error
  }
}

/**
 * Map ESPN player status values to our database enum
 *
 * @param {string} espnStatus - ESPN status value
 * @returns {string} Database enum value
 */
function mapPlayerStatus(espnStatus) {
  if (!espnStatus) return 'active'

  const statusMap = {
    'active': 'active',
    'injured': 'injured_reserve',
    'injured_reserve': 'injured_reserve',
    'day-to-day': 'active',  // Day-to-day injuries = still active
    'out': 'injured_reserve',
    'doubtful': 'active',
    'questionable': 'active',
    'practice_squad': 'practice_squad',
    'suspended': 'suspended',
    'retired': 'retired',
    'free_agent': 'free_agent'
  }

  const normalized = espnStatus.toLowerCase().replace(/\s+/g, '_')
  return statusMap[normalized] || statusMap[espnStatus.toLowerCase()] || 'active'
}

/**
 * Transform ESPN player data to our database schema
 *
 * @param {Object} espnPlayer - Raw ESPN player object
 * @returns {Object} Transformed player object matching our schema
 */
export function transformPlayerData(espnPlayer) {
  // Get position - handle ESPN's inconsistent format
  let position = espnPlayer.position?.abbreviation ||
                espnPlayer.position?.name ||
                espnPlayer.position ||
                'UNK'

  // ESPN roster endpoint returns roster categories, not positions
  // Filter these out and default to UNK
  const invalidPositions = ['offense', 'defense', 'specialTeam', 'injuredReserveOrOut', 'suspended', 'practiceSquad']
  if (invalidPositions.includes(position) || position.length > 10) {
    position = 'UNK'
  }

  const player = {
    // Use ESPN ID for now, will need to create our own format
    player_id: `espn-${espnPlayer.id}`,

    // Name fields
    first_name: espnPlayer.firstName || espnPlayer.displayName?.split(' ')[0] || 'Unknown',
    last_name: espnPlayer.lastName || espnPlayer.displayName?.split(' ').slice(1).join(' ') || 'Unknown',
    full_name: espnPlayer.displayName || espnPlayer.fullName || `${espnPlayer.firstName} ${espnPlayer.lastName}`,

    // Position
    primary_position: position,

    // Jersey number
    jersey_number: espnPlayer.jersey ? parseInt(espnPlayer.jersey) : null,

    // Physical attributes
    height_inches: espnPlayer.height ? parseInt(espnPlayer.height) : null,
    weight_lbs: espnPlayer.weight ? parseInt(espnPlayer.weight) : null,

    // Birth info
    birth_date: espnPlayer.dateOfBirth || null,

    // College
    college: espnPlayer.college?.name || espnPlayer.college || null,

    // Draft info (if available)
    draft_year: espnPlayer.draft?.year || null,
    draft_round: espnPlayer.draft?.round || null,
    draft_pick: espnPlayer.draft?.selection || null,

    // Experience
    rookie_year: espnPlayer.experience?.years === 0 ? new Date().getFullYear() : null,

    // Status - map ESPN values to our enum
    status: mapPlayerStatus(espnPlayer.status?.type),

    // URLs
    headshot_url: espnPlayer.headshot?.href || espnPlayer.headshot || null,
    profile_url: espnPlayer.links?.find(l => l.rel?.includes('playercard'))?.href || null,

    // Metadata (store full ESPN data for reference)
    metadata: {
      espn_id: espnPlayer.id,
      espn_guid: espnPlayer.guid,
      espn_uid: espnPlayer.uid,
      experience_years: espnPlayer.experience?.years,
      age: espnPlayer.age
    }
  }

  return player
}

/**
 * Fetch player by ID
 *
 * @param {string} playerId - ESPN player ID
 * @returns {Promise<Object>} Player object
 */
export async function fetchPlayer(playerId) {
  return rateLimiter.execute(async () => {
    try {
      logger.debug(`Fetching player ${playerId} from ESPN...`)
      const response = await axios.get(`${ESPN_API_BASE}/athletes/${playerId}`)

      const player = response.data
      logger.debug(`✓ Fetched player: ${player.displayName}`)
      return player
    } catch (error) {
      logger.error(`Failed to fetch player ${playerId}:`, error.message)
      throw error
    }
  })
}

/**
 * Fetch schedule for a specific week
 *
 * @param {number} year - Season year (e.g., 2025)
 * @param {number} seasonType - 1=preseason, 2=regular, 3=playoffs
 * @param {number} week - Week number
 * @returns {Promise<Array>} Array of game objects
 */
export async function fetchSchedule(year, seasonType, week) {
  return rateLimiter.execute(async () => {
    try {
      const response = await axios.get(`${ESPN_API_BASE}/scoreboard`, {
        params: {
          dates: year,
          seasontype: seasonType,
          week: week
        }
      })

      const games = response.data.events || []
      logger.debug(`✓ Fetched ${games.length} games for ${year} season type ${seasonType} week ${week}`)
      return games
    } catch (error) {
      logger.error(`Failed to fetch schedule for ${year} week ${week}:`, error.message)
      return [] // Return empty array instead of throwing to allow partial success
    }
  })
}

/**
 * Fetch complete game summary with all stats
 *
 * @param {string} gameId - ESPN game/event ID
 * @returns {Promise<Object>} Complete game summary data
 */
export async function fetchGameSummary(gameId) {
  return rateLimiter.execute(async () => {
    try {
      logger.debug(`Fetching game summary for ${gameId}...`)
      const response = await axios.get(`${ESPN_API_BASE}/summary`, {
        params: { event: gameId }
      })

      logger.debug(`✓ Fetched complete game summary for ${gameId}`)
      return response.data
    } catch (error) {
      logger.error(`Failed to fetch game summary ${gameId}:`, error.message)
      throw error
    }
  })
}

/**
 * Transform ESPN game data to our database schema
 *
 * @param {Object} espnGame - Raw ESPN game object
 * @param {number} season - Season year
 * @returns {Object} Transformed game object matching our schema
 */
export function transformGameData(espnGame, season) {
  const competition = espnGame.competitions?.[0]
  if (!competition) {
    throw new Error('No competition data in game object')
  }

  const homeTeam = competition.competitors.find(c => c.homeAway === 'home')
  const awayTeam = competition.competitors.find(c => c.homeAway === 'away')

  if (!homeTeam || !awayTeam) {
    throw new Error('Missing home or away team')
  }

  // Determine season type from ESPN's season.type field
  // For playoffs, we'll set to 'regular' initially and update later with specific round
  // (wildcard, division, conference, superbowl) when playoff bracket is determined
  let seasonType = 'regular'
  if (espnGame.season?.type === 1) {
    seasonType = 'preseason'
  } else if (espnGame.season?.type === 2) {
    seasonType = 'regular'
  }
  // espnGame.season?.type === 3 (playoffs) will default to 'regular' for now

  // Parse game status
  const status = competition.status
  let gameStatus = 'scheduled'
  if (status.type.completed) {
    gameStatus = 'final'
  } else if (status.type.state === 'in') {
    gameStatus = 'in_progress'
  }

  // Extract game date and time
  const gameDateTime = new Date(espnGame.date)
  const gameDate = gameDateTime.toISOString().split('T')[0] // YYYY-MM-DD
  const gameTime = gameDateTime.toISOString().split('T')[1].split('.')[0] // HH:MM:SS

  return {
    game_id: `espn-${espnGame.id}`,
    season: season,
    game_type: seasonType,
    week: espnGame.week?.number || 1,
    game_date: gameDate,
    game_time: gameTime,

    home_team_id: homeTeam.team.abbreviation,
    away_team_id: awayTeam.team.abbreviation,

    stadium_id: null, // Will be populated later from team's home stadium

    home_score: homeTeam.score ? parseInt(homeTeam.score) : null,
    away_score: awayTeam.score ? parseInt(awayTeam.score) : null,

    status: gameStatus,

    broadcast_network: competition.broadcasts?.[0]?.names?.[0] || null,

    attendance: competition.attendance ? parseInt(competition.attendance) : null,

    overtime: false, // Will be determined from game stats later

    playoff_round: null // Will be set when playoff bracket is finalized
  }
}
