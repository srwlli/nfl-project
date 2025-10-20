/**
 * Historical Betting Lines Scraper
 *
 * Fetches historical NFL betting lines (spread, over/under) from nflverse
 * Coverage: 2006-present (nearly 20 years of data)
 * Source: https://github.com/nflverse/nfldata
 *
 * Data extracted:
 * - Point spread (opening/closing)
 * - Over/under totals
 * - Spread result (home/away covered)
 * - Over/under result
 *
 * Usage:
 * - Manual: npm run scrape:historical-betting
 * - Automatic: Not scheduled (one-time backfill + weekly updates)
 *
 * Database:
 * - Populates: game_betting_lines table
 * - Flag: is_historical = true for pre-2025 data
 */

import { getSupabaseClient, insertBatch } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'
import axios from 'axios'

const SCRIPT_NAME = 'historical-betting-scraper.js'
const NFLVERSE_GAMES_URL = 'https://raw.githubusercontent.com/nflverse/nfldata/master/data/games.csv'

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
 * Convert nflverse team abbreviations to our team IDs
 */
function convertTeamAbbr(nflverseAbbr) {
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
    'LA': 'LAR',  // Rams
    'LAC': 'LAC',
    'LAR': 'LAR',
    'LV': 'LV',   // Raiders
    'MIA': 'MIA',
    'MIN': 'MIN',
    'NE': 'NE',
    'NO': 'NO',
    'NYG': 'NYG',
    'NYJ': 'NYJ',
    'OAK': 'LV',  // Old Raiders abbr
    'PHI': 'PHI',
    'PIT': 'PIT',
    'SD': 'LAC',  // Old Chargers abbr
    'SEA': 'SEA',
    'SF': 'SF',
    'STL': 'LAR', // Old Rams abbr
    'TB': 'TB',
    'TEN': 'TEN',
    'WAS': 'WAS'
  }

  return teamMap[nflverseAbbr] || nflverseAbbr
}

/**
 * Scrape historical betting lines from nflverse
 */
async function scrapeHistoricalBetting(options = {}) {
  const { minYear = 2006, maxYear = new Date().getFullYear(), top100Only = false } = options

  logger.info(`Fetching historical betting lines from nflverse...`)
  logger.info(`Coverage: ${minYear}-${maxYear}`)

  try {
    // Fetch the CSV
    const response = await axios.get(NFLVERSE_GAMES_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    })

    logger.info(`✓ Downloaded games data (${response.data.length} bytes)`)

    // Parse CSV
    const games = parseCSV(response.data)
    logger.info(`✓ Parsed ${games.length} games from CSV`)

    // Filter by year range
    let filteredGames = games.filter(game => {
      const season = parseInt(game.season)
      return season >= minYear && season <= maxYear
    })

    logger.info(`✓ Filtered to ${filteredGames.length} games (${minYear}-${maxYear})`)

    // If top100Only flag, get list of top 100 game dates to match
    let top100GameDates = new Set()
    if (top100Only) {
      const supabase = getSupabaseClient()
      const { data: top100Games } = await supabase
        .from('greatest_games_official_ranking')
        .select('game_date')

      if (top100Games) {
        top100GameDates = new Set(top100Games.map(g => g.game_date))
        logger.info(`✓ Loaded ${top100GameDates.size} top 100 game dates for filtering`)
      }
    }

    // Transform to our schema
    const bettingLines = []
    for (const game of filteredGames) {
      // Skip if no betting data
      if (!game.spread_line || game.spread_line === 'NA') continue

      // If top100Only, check if this game date matches
      if (top100Only && !top100GameDates.has(game.gameday)) {
        continue
      }

      const homeTeam = convertTeamAbbr(game.home_team)
      const awayTeam = convertTeamAbbr(game.away_team)

      // Create a game identifier (we'll need to match to our games table)
      // Format: YYYY-MM-DD-AWAY@HOME
      const gameIdentifier = `${game.gameday}-${awayTeam}@${homeTeam}`

      const spread = parseFloat(game.spread_line)
      const total = game.total_line ? parseFloat(game.total_line) : null

      // Determine favorite/underdog
      const isFavorite = spread > 0 ? homeTeam : awayTeam
      const isUnderdog = spread > 0 ? awayTeam : homeTeam

      bettingLines.push({
        // We'll need to match this to game_id later via a query
        game_date: game.gameday,
        home_team_id: homeTeam,
        away_team_id: awayTeam,
        season: parseInt(game.season),
        week: parseInt(game.week),

        // Spread data
        spread_line: Math.abs(spread),
        favorite_team_id: isFavorite,
        underdog_team_id: isUnderdog,
        spread_result: game.result, // 'home', 'away', or 'push'

        // Over/under data
        total_line: total,
        over_under_result: game.total, // 'over', 'under', or 'push'

        // Scores for verification
        home_score: game.home_score ? parseInt(game.home_score) : null,
        away_score: game.away_score ? parseInt(game.away_score) : null,

        // Metadata
        data_source: 'nflverse',
        is_historical: true,
        bookmaker: 'consensus', // nflverse uses consensus lines
        scraped_at: new Date().toISOString()
      })
    }

    logger.info(`✓ Transformed ${bettingLines.length} games with betting data`)

    return bettingLines

  } catch (error) {
    logger.error('Failed to scrape nflverse betting data:', error.message)
    throw error
  }
}

/**
 * Insert betting lines (with or without game_id match)
 * Will link to games when they're added to database later
 */
async function insertBettingLines(bettingLines) {
  const supabase = getSupabaseClient()
  logger.info('Preparing betting lines for insertion...')

  // Create synthetic game_id for historical games: YYYYMMDD-AWAY@HOME
  const records = bettingLines.map(line => {
    const dateStr = line.game_date.replace(/-/g, '') // 2024-10-17 → 20241017
    const syntheticGameId = `${dateStr}-${line.away_team_id}@${line.home_team_id}`

    return {
      game_id: syntheticGameId,
      season: line.season,
      bookmaker: line.bookmaker,
      market_type: 'spread', // Historical data is primarily spread + total
      spread_line: line.spread_line,
      favorite_team_id: line.favorite_team_id,
      underdog_team_id: line.underdog_team_id,
      total_line: line.total_line,
      data_source: line.data_source,
      is_historical: line.is_historical,
      scraped_at: line.scraped_at,
      last_update: line.scraped_at
    }
  })

  // Insert in batches
  logger.info(`Inserting ${records.length} historical betting lines...`)
  const result = await insertBatch('game_betting_lines', records)

  return {
    inserted: result.success,
    failed: result.failed || 0
  }
}

/**
 * Main scraper execution
 */
async function scrapeHistoricalBettingLines(options = {}) {
  try {
    logScriptStart(SCRIPT_NAME)

    // Scrape the data
    const bettingLines = await scrapeHistoricalBetting(options)

    if (bettingLines.length === 0) {
      logger.warn('No betting lines found')
      logScriptEnd(SCRIPT_NAME, 0, 0, 0)
      return { inserted: 0, skipped: 0 }
    }

    // Insert betting lines
    const result = await insertBettingLines(bettingLines)

    logger.info('')
    logger.info('════════════════════════════════════════════════════════════')
    logger.info('HISTORICAL BETTING LINES SCRAPE SUMMARY')
    logger.info('════════════════════════════════════════════════════════════')
    logger.info(`✓ Betting lines scraped: ${bettingLines.length}`)
    logger.info(`✓ Successfully inserted: ${result.inserted}`)
    logger.info(`✓ Failed: ${result.failed}`)
    logger.info(`✓ Source: nflverse (2006-present)`)
    logger.info('════════════════════════════════════════════════════════════')

    logScriptEnd(SCRIPT_NAME, result.inserted, 0, bettingLines.length)

    return result

  } catch (error) {
    logger.error('Failed to scrape historical betting lines:', error)
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
    } else if (arg === '--top-100-only') {
      options.top100Only = true
    }
  })

  scrapeHistoricalBettingLines(options)
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Script failed:', error)
      process.exit(1)
    })
}

export default scrapeHistoricalBettingLines
