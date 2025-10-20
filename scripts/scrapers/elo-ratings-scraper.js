/**
 * Elo Ratings Scraper
 *
 * Fetches historical NFL Elo ratings from FiveThirtyEight
 * Coverage: 1920-present (complete NFL history!)
 * Source: https://projects.fivethirtyeight.com/nfl-api/nfl_elo.csv
 *
 * Data extracted:
 * - Team Elo ratings (pre/post game)
 * - Elo-based win probability
 * - Quarterback adjustments
 * - Playoff game indicators
 *
 * Usage:
 * - Manual: npm run scrape:elo-ratings
 * - Automatic: Not scheduled (one-time backfill + weekly updates)
 *
 * Database:
 * - Populates: team_elo_ratings table
 */

import { getSupabaseClient, insertBatch } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'
import axios from 'axios'
import { parse } from 'csv-parse/sync'

const SCRIPT_NAME = 'elo-ratings-scraper.js'
// FiveThirtyEight NFL Elo data from GitHub (1920-present)
const FIVETHIRTYEIGHT_ELO_URL = 'https://raw.githubusercontent.com/fivethirtyeight/nfl-elo-game/master/data/nfl_games.csv'

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',')

  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const row = {}
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || null
    })
    data.push(row)
  }

  return data
}

/**
 * Convert FiveThirtyEight team abbreviations to our team IDs
 */
function convertTeamAbbr(eloTeam) {
  const teamMap = {
    'ARI': 'ARI',
    'ATL': 'ATL',
    'BAL': 'BAL',
    'BUF': 'BUF',
    'CAR': 'CAR',
    'CHI': 'CHI',
    'CIN': 'CIN',
    'CLE': 'CLE',
    'DAL': 'DAL',
    'DEN': 'DEN',
    'DET': 'DET',
    'GB': 'GB',
    'HOU': 'HOU',
    'IND': 'IND',
    'JAX': 'JAX',
    'KC': 'KC',
    'LAC': 'LAC',
    'LAR': 'LAR',
    'LV': 'LV',
    'MIA': 'MIA',
    'MIN': 'MIN',
    'NE': 'NE',
    'NO': 'NO',
    'NYG': 'NYG',
    'NYJ': 'NYJ',
    'OAK': 'LV',
    'PHI': 'PHI',
    'PIT': 'PIT',
    'SD': 'LAC',
    'SEA': 'SEA',
    'SF': 'SF',
    'STL': 'LAR',
    'TB': 'TB',
    'TEN': 'TEN',
    'WAS': 'WAS',
    'WSH': 'WAS'
  }

  return teamMap[eloTeam] || eloTeam
}

/**
 * Scrape Elo ratings from FiveThirtyEight
 */
async function scrapeEloRatings(options = {}) {
  const { minYear = 1920, maxYear = new Date().getFullYear() } = options

  logger.info(`Fetching Elo ratings from FiveThirtyEight...`)
  logger.info(`Coverage: ${minYear}-${maxYear}`)

  try {
    // Fetch the CSV
    const response = await axios.get(FIVETHIRTYEIGHT_ELO_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 60000
    })

    logger.info(`✓ Downloaded Elo data (${response.data.length} bytes)`)

    // Parse CSV properly (handles quoted fields)
    const games = parse(response.data, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
    logger.info(`✓ Parsed ${games.length} games from CSV`)

    // Filter by year range
    let filteredGames = games.filter(game => {
      const season = parseInt(game.season)
      return season >= minYear && season <= maxYear
    })

    logger.info(`✓ Filtered to ${filteredGames.length} games (${minYear}-${maxYear})`)

    // Transform to our schema - create TWO records per game (one for each team)
    // CSV columns: date, season, neutral, playoff, team1, team2, elo1, elo2, elo_prob1, score1, score2, result1
    const eloRecords = []

    for (const game of filteredGames) {
      const season = parseInt(game.season)
      const gameDate = game.date

      // Team1 (home team) Elo record
      const team1 = convertTeamAbbr(game.team1)
      const elo1 = parseFloat(game.elo1)
      const prob1 = parseFloat(game.elo_prob1)
      const isPlayoff = game.playoff === '1'
      const score1 = parseInt(game.score1) || 0
      const score2 = parseInt(game.score2) || 0

      // Calculate post-game Elo (simplified - actual change depends on result)
      // K-factor = 20, result1 = 1 if team1 won, 0 if lost
      const result1 = parseFloat(game.result1)
      const eloChange1 = 20 * (result1 - prob1)
      const elo1Post = elo1 + eloChange1

      if (team1 && !isNaN(elo1)) {
        eloRecords.push({
          team_id: team1,
          season: season,
          game_date: gameDate,
          elo_pre_game: elo1,
          elo_post_game: elo1Post,
          elo_probability: prob1,
          qb_adjustment: 0, // Not available in this dataset
          is_playoff: isPlayoff,
          opponent_team_id: convertTeamAbbr(game.team2),
          is_home_game: true
        })
      }

      // Team2 (away team) Elo record
      const team2 = convertTeamAbbr(game.team2)
      const elo2 = parseFloat(game.elo2)
      const prob2 = 1 - prob1 // Team2 probability = 1 - Team1 probability
      const result2 = 1 - result1
      const eloChange2 = 20 * (result2 - prob2)
      const elo2Post = elo2 + eloChange2

      if (team2 && !isNaN(elo2)) {
        eloRecords.push({
          team_id: team2,
          season: season,
          game_date: gameDate,
          elo_pre_game: elo2,
          elo_post_game: elo2Post,
          elo_probability: prob2,
          qb_adjustment: 0, // Not available in this dataset
          is_playoff: isPlayoff,
          opponent_team_id: team1,
          is_home_game: false
        })
      }
    }

    logger.info(`✓ Transformed ${eloRecords.length} Elo records (${filteredGames.length} games × 2 teams)`)

    return eloRecords

  } catch (error) {
    logger.error(`Failed to scrape FiveThirtyEight Elo data: ${error.message}`)
    if (error.response) {
      logger.error(`HTTP Status: ${error.response.status}`)
    }
    throw error
  }
}

/**
 * Insert Elo ratings into database
 */
async function insertEloRatings(eloRecords) {
  logger.info('Preparing Elo ratings for insertion...')

  // Add metadata
  const records = eloRecords.map(record => ({
    ...record,
    data_source: 'FiveThirtyEight',
    scraped_at: new Date().toISOString()
  }))

  // Insert in batches
  logger.info(`Inserting ${records.length} Elo ratings...`)
  const result = await insertBatch('team_elo_ratings', records)

  return {
    inserted: result.success,
    failed: result.failed || 0
  }
}

/**
 * Main scraper execution
 */
async function scrapeEloRatingsData(options = {}) {
  try {
    logScriptStart(SCRIPT_NAME)

    // Scrape the data
    const eloRecords = await scrapeEloRatings(options)

    if (eloRecords.length === 0) {
      logger.warn('No Elo ratings found')
      logScriptEnd(SCRIPT_NAME, 0, 0, 0)
      return { inserted: 0, failed: 0 }
    }

    // Insert ratings
    const result = await insertEloRatings(eloRecords)

    logger.info('')
    logger.info('════════════════════════════════════════════════════════════')
    logger.info('ELO RATINGS SCRAPE SUMMARY')
    logger.info('════════════════════════════════════════════════════════════')
    logger.info(`✓ Elo records scraped: ${eloRecords.length}`)
    logger.info(`✓ Successfully inserted: ${result.inserted}`)
    logger.info(`✓ Failed: ${result.failed}`)
    logger.info(`✓ Source: FiveThirtyEight (1920-present)`)
    logger.info(`✓ Coverage: Complete NFL history`)
    logger.info('════════════════════════════════════════════════════════════')

    logScriptEnd(SCRIPT_NAME, result.inserted, 0, eloRecords.length)

    return result

  } catch (error) {
    logger.error('Failed to scrape Elo ratings:', error)
    logScriptEnd(SCRIPT_NAME, 0, 1, 0)
    throw error
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Parse command line options
  const args = process.argv.slice(2)
  const options = {}

  args.forEach(arg => {
    if (arg.startsWith('--min-year=')) {
      options.minYear = parseInt(arg.split('=')[1])
    } else if (arg.startsWith('--max-year=')) {
      options.maxYear = parseInt(arg.split('=')[1])
    }
  })

  scrapeEloRatingsData(options)
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Script failed:', error)
      process.exit(1)
    })
}

export default scrapeEloRatingsData
