/**
 * Injuries Scraper (NFL.com)
 *
 * Fetches current injury reports and player status from NFL.com official injury report.
 * Updates the player_injuries table with latest player availability.
 *
 * NFL injury reports are typically updated:
 * - Wednesday: First practice report
 * - Thursday: Mid-week update
 * - Friday: Final injury report before Sunday games
 *
 * Usage:
 * - Daily check: npm run scrape:injuries
 *
 * Data Source: https://www.nfl.com/injuries/ (Official NFL injury report)
 */

import { getSupabaseClient, upsertBatch } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

const SCRIPT_NAME = 'injuries-scraper.js'
const SEASON_YEAR = 2025
const NFL_INJURIES_URL = 'https://www.nfl.com/injuries/'

// Team abbreviation mapping (NFL.com → our database)
const TEAM_MAP = {
  'ARI': 'ARI', 'ATL': 'ATL', 'BAL': 'BAL', 'BUF': 'BUF',
  'CAR': 'CAR', 'CHI': 'CHI', 'CIN': 'CIN', 'CLE': 'CLE',
  'DAL': 'DAL', 'DEN': 'DEN', 'DET': 'DET', 'GB': 'GB',
  'HOU': 'HOU', 'IND': 'IND', 'JAX': 'JAX', 'KC': 'KC',
  'LV': 'LV', 'LAC': 'LAC', 'LAR': 'LAR', 'MIA': 'MIA',
  'MIN': 'MIN', 'NE': 'NE', 'NO': 'NO', 'NYG': 'NYG',
  'NYJ': 'NYJ', 'PHI': 'PHI', 'PIT': 'PIT', 'SF': 'SF',
  'SEA': 'SEA', 'TB': 'TB', 'TEN': 'TEN', 'WAS': 'WAS',
  'WSH': 'WAS'  // Washington alias
}

/**
 * Fetch and parse NFL.com injury report
 */
async function fetchNFLInjuries() {
  try {
    logger.info('Fetching injury report from NFL.com...')
    const response = await axios.get(NFL_INJURIES_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(response.data)
    const injuries = []

    // Find all injury tables (one per team per game)
    $('div[class*="nfl-o-matchup-injury"]').each((_, matchupDiv) => {
      // Each matchup has two teams
      $(matchupDiv).find('table').each((_, table) => {
        const $table = $(table)

        // Get team abbreviation from header
        const teamHeader = $table.closest('div').find('h3, h4').first().text()
        const teamMatch = teamHeader.match(/\b([A-Z]{2,3})\b/)
        const teamAbbr = teamMatch ? TEAM_MAP[teamMatch[1]] || teamMatch[1] : null

        if (!teamAbbr) {
          logger.debug('Could not extract team from header:', teamHeader)
          return
        }

        // Parse each player row
        $table.find('tbody tr').each((_, row) => {
          const $row = $(row)
          const cells = $row.find('td')

          if (cells.length >= 4) {
            const playerName = $(cells[0]).text().trim()
            const position = $(cells[1]).text().trim()
            const injuryType = $(cells[2]).text().trim()
            const practiceStatus = $(cells[3]).text().trim()
            const gameStatus = $(cells[4]).text().trim() || 'Active' // Column 5 if exists

            if (playerName && injuryType) {
              injuries.push({
                team_id: teamAbbr,
                player_name: playerName,
                position: position,
                injury_type: injuryType,
                injury_status: mapInjuryStatus(gameStatus, practiceStatus),
                practice_status: practiceStatus,
                injury_description: `${injuryType} - ${practiceStatus}`
              })
            }
          }
        })
      })
    })

    logger.info(`✓ Parsed ${injuries.length} injuries from NFL.com`)
    return injuries

  } catch (error) {
    logger.error('Failed to fetch NFL.com injuries:', error.message)
    throw error
  }
}

/**
 * Map NFL.com injury status to our database enum
 */
function mapInjuryStatus(gameStatus, practiceStatus) {
  const statusLower = gameStatus.toLowerCase()
  const practiceLower = practiceStatus.toLowerCase()

  // Game status takes priority
  if (statusLower.includes('out')) return 'out'
  if (statusLower.includes('doubtful')) return 'doubtful'
  if (statusLower.includes('questionable')) return 'questionable'
  if (statusLower.includes('ir')) return 'injured_reserve'

  // Fallback to practice status
  if (practiceLower.includes('did not')) return 'out'
  if (practiceLower.includes('limited')) return 'questionable'
  if (practiceLower.includes('full')) return 'questionable' // Listed but practicing

  return 'questionable' // Default for listed players
}

/**
 * Match player name to database player_id
 */
async function matchPlayerToDatabase(injury, supabase) {
  try {
    // Try exact name match first
    let { data: players, error } = await supabase
      .from('players')
      .select('player_id, player_name, primary_position')
      .eq('player_name', injury.player_name)
      .limit(1)

    // If no exact match, try fuzzy match on last name
    if (!players || players.length === 0) {
      const lastName = injury.player_name.split(' ').pop()
      const { data: fuzzyPlayers } = await supabase
        .from('players')
        .select('player_id, player_name, primary_position')
        .ilike('player_name', `%${lastName}%`)
        .limit(5)

      // Filter by position if available
      if (fuzzyPlayers && fuzzyPlayers.length > 0) {
        players = fuzzyPlayers.filter(p =>
          !injury.position || p.primary_position === injury.position
        )

        if (players.length === 0) {
          players = [fuzzyPlayers[0]] // Take first match if position doesn't match
        }
      }
    }

    if (players && players.length > 0) {
      return players[0].player_id
    }

    logger.warn(`Could not match player to database: ${injury.player_name} (${injury.team_id})`)
    return null

  } catch (error) {
    logger.error(`Error matching player ${injury.player_name}:`, error.message)
    return null
  }
}

/**
 * Main scraper function
 */
async function scrapeInjuries() {
  const supabase = getSupabaseClient()
  const startTime = Date.now()
  let successCount = 0
  let failCount = 0

  try {
    logScriptStart(SCRIPT_NAME)
    logger.info('Starting injury report scrape...')

    // Fetch injuries from NFL.com
    const injuries = await fetchNFLInjuries()

    if (injuries.length === 0) {
      logger.info('No injuries found')
      return { success: 0, failed: 0, total: 0 }
    }

    logger.info(`Processing ${injuries.length} injuries...`)

    // Match players and prepare records
    const injuryRecords = []
    for (const injury of injuries) {
      const playerId = await matchPlayerToDatabase(injury, supabase)

      if (playerId) {
        injuryRecords.push({
          player_id: playerId,
          season: SEASON_YEAR,
          injury_type: injury.injury_type,
          injury_description: injury.injury_description,
          injury_status: injury.injury_status,
          injury_date: new Date().toISOString().split('T')[0],
          return_date: null,
          games_missed: 0
        })
        successCount++
      } else {
        failCount++
      }
    }

    // Batch upsert to database
    if (injuryRecords.length > 0) {
      logger.info(`Upserting ${injuryRecords.length} injury records...`)

      const { data, error } = await supabase
        .from('player_injuries')
        .upsert(injuryRecords, {
          onConflict: 'player_id, season',
          ignoreDuplicates: false
        })
        .select()

      if (error) {
        logger.error('Failed to upsert injuries:', error)
        throw error
      }

      logger.info(`✓ Updated ${injuryRecords.length} injuries in database`)
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    logger.info('')
    logger.info('═'.repeat(60))
    logger.info('INJURY SCRAPER SUMMARY')
    logger.info('═'.repeat(60))
    logger.info(`✓ Injuries found: ${injuries.length}`)
    logger.info(`✓ Successfully matched: ${successCount}`)
    logger.info(`✓ Failed to match: ${failCount}`)
    logger.info(`✓ Updated in database: ${injuryRecords.length}`)
    logger.info(`✓ Duration: ${duration}s`)
    logger.info('═'.repeat(60))

    return {
      success: successCount,
      failed: failCount,
      total: injuries.length
    }

  } catch (error) {
    logger.error('Injury scraper failed:', error)
    throw error
  } finally {
    logScriptEnd(SCRIPT_NAME, successCount, failCount)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  scrapeInjuries()
    .then(result => {
      process.exit(result.failed > 0 ? 1 : 0)
    })
    .catch(error => {
      logger.error('Fatal error:', error)
      process.exit(1)
    })
}

export { scrapeInjuries }
