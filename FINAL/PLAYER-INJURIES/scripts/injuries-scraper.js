/**
 * Injuries Scraper
 *
 * Fetches current injury reports and player status from ESPN.
 * Updates the player_injuries table with latest player availability.
 *
 * NFL injury reports are typically updated:
 * - Wednesday: First practice report
 * - Thursday: Mid-week update
 * - Friday: Final injury report before Sunday games
 *
 * Usage:
 * - Daily check: npm run scrape:injuries
 * - Specific team: npm run scrape:injuries -- --team=PHI
 *
 * Data Source: ESPN API
 */

import { fetchTeams } from '../utils/espn-api.js'
import { getSupabaseClient, upsertBatch } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'
import axios from 'axios'
import { createRateLimiter } from '../utils/rate-limiter.js'

const SCRIPT_NAME = 'injuries-scraper.js'
const SEASON_YEAR = 2025
const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'

const rateLimiter = createRateLimiter(1) // 1 request per second

/**
 * Fetch injuries for a specific team
 */
async function fetchTeamInjuries(teamId) {
  return rateLimiter.execute(async () => {
    try {
      const response = await axios.get(`${ESPN_API_BASE}/teams/${teamId}`, {
        params: {
          enable: 'injuries'
        }
      })

      const injuries = response.data.team?.injuries || []
      logger.debug(`Fetched ${injuries.length} injuries for team ${teamId}`)
      return injuries

    } catch (error) {
      logger.error(`Failed to fetch injuries for team ${teamId}:`, error.message)
      return []
    }
  })
}

/**
 * Map ESPN injury status to our database enum
 */
function mapInjuryStatus(espnStatus) {
  const statusMap = {
    'Out': 'out',
    'Questionable': 'questionable',
    'Doubtful': 'doubtful',
    'IR': 'injured_reserve',
    'PUP': 'physically_unable_to_perform',
    'Suspended': 'out',
    'Day-To-Day': 'questionable',
    'Active': 'active'
  }

  return statusMap[espnStatus] || 'questionable'
}

/**
 * Transform ESPN injury data to our schema
 */
function transformInjuryData(injury, teamId) {
  const athlete = injury.athlete || {}

  // Build injury description from available data
  const bodyPart = injury.details?.detail || injury.details?.side || ''
  const status = injury.status || ''
  const comment = injury.longComment || injury.details?.fantasyStatus || ''

  const injuryDescription = [bodyPart, status, comment]
    .filter(Boolean)
    .join(' - ')

  return {
    player_id: `espn-${athlete.id}`,
    season: SEASON_YEAR,
    injury_type: injury.type || injury.details?.type || 'Unknown',
    injury_description: injuryDescription || null,
    injury_date: injury.date || new Date().toISOString().split('T')[0],
    return_date: injury.details?.returnDate || null,
    games_missed: 0  // Will be calculated separately if needed
  }
}

/**
 * Main scraper function
 */
async function scrapeInjuries(specificTeamId = null) {
  try {
    logger.info('Starting injury report scrape...')

    // Get all teams or specific team
    let teams
    if (specificTeamId) {
      teams = [{ id: specificTeamId, abbreviation: specificTeamId }]
      logger.info(`Scraping injuries for team: ${specificTeamId}`)
    } else {
      logger.info('Fetching all NFL teams...')
      const allTeams = await fetchTeams()
      teams = allTeams
      logger.info(`Found ${teams.length} teams`)
    }

    let allInjuries = []
    let teamsWithInjuries = 0
    let totalInjuredPlayers = 0

    // Fetch injuries for each team
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i]
      const teamAbbr = team.abbreviation

      logger.info(`[${i + 1}/${teams.length}] Fetching injuries for ${teamAbbr}...`)

      const injuries = await fetchTeamInjuries(team.id)

      if (injuries.length > 0) {
        teamsWithInjuries++
        totalInjuredPlayers += injuries.length

        // Transform and add to collection
        const transformed = injuries.map(inj => transformInjuryData(inj, teamAbbr))
        allInjuries.push(...transformed)

        logger.info(`  ✓ Found ${injuries.length} injured player(s)`)
      } else {
        logger.debug(`  - No injuries reported`)
      }
    }

    logger.info('')
    logger.info(`Total: ${totalInjuredPlayers} injuries across ${teamsWithInjuries} teams`)

    // Update database
    if (allInjuries.length > 0) {
      logger.info('Updating player_injuries table...')

      // First, clear old injuries for this season (optional - keeps historical data)
      // We'll just upsert and let old records stay unless we explicitly delete them

      const result = await upsertBatch(
        'player_injuries',
        allInjuries,
        ['player_id', 'season']
      )

      logger.info(`✓ Upserted ${result.success} injury records`)

      return {
        success: result.success,
        failed: result.errors.length,
        total: allInjuries.length,
        teamsWithInjuries: teamsWithInjuries
      }
    } else {
      logger.info('No injuries to update')
      return {
        success: 0,
        failed: 0,
        total: 0,
        teamsWithInjuries: 0
      }
    }

  } catch (error) {
    logger.error('Injury scraper failed:', error)
    throw error
  }
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now()
  logScriptStart(SCRIPT_NAME)

  try {
    // Parse command line arguments
    const args = process.argv.slice(2)
    const teamArg = args.find(arg => arg.startsWith('--team='))
    const teamId = teamArg ? teamArg.split('=')[1] : null

    const result = await scrapeInjuries(teamId)

    // Summary
    const duration = Date.now() - startTime
    logger.info('')
    logger.info('═'.repeat(60))
    logger.info('INJURY SCRAPER SUMMARY')
    logger.info('═'.repeat(60))
    logger.info(`✓ Injuries found: ${result.total}`)
    logger.info(`✓ Teams with injuries: ${result.teamsWithInjuries}`)
    logger.info(`✓ Updated in database: ${result.success}`)
    if (result.failed > 0) {
      logger.error(`✗ Failed: ${result.failed}`)
    }
    logger.info(`✓ Duration: ${(duration / 1000).toFixed(2)}s`)
    logger.info('═'.repeat(60))

    logScriptEnd(SCRIPT_NAME, {
      success: result.success,
      failed: result.failed,
      total: result.total,
      duration
    })

    process.exit(0)

  } catch (error) {
    logger.error('Injury scraper failed:', error)
    logScriptEnd(SCRIPT_NAME, {
      success: 0,
      failed: 1,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

main()
