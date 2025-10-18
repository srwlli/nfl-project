/**
 * Betting Lines Scraper
 *
 * Fetches betting odds from The Odds API for NFL games.
 * Updates game_betting_lines, spread_lines, moneyline_odds, over_under_lines tables.
 *
 * Data collected:
 * - Point spreads (opening/closing lines)
 * - Moneyline odds
 * - Over/Under totals
 * - Multiple bookmakers tracked
 *
 * IMPORTANT: Requires The Odds API key (free tier: 500 requests/month)
 * Sign up: https://the-odds-api.com/
 *
 * Usage:
 * - Daily update: npm run scrape:betting
 * - Specific week: npm run scrape:betting -- --week=7
 *
 * Recommended Schedule: Daily at 10 AM ET (before games)
 *
 * Data Source: The Odds API (https://api.the-odds-api.com/v4/)
 */

import axios from 'axios'
import { getSupabaseClient, upsertBatch } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'

const SCRIPT_NAME = 'betting-scraper.js'
const SEASON_YEAR = 2025

// The Odds API Configuration
const ODDS_API_KEY = process.env.THE_ODDS_API_KEY
const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4'
const SPORT = 'americanfootball_nfl'

// Bookmakers to track (free tier limited to 4)
const BOOKMAKERS = 'draftkings,fanduel,betmgm,caesars'

/**
 * Fetch current NFL odds from The Odds API
 */
async function fetchOddsFromAPI() {
  if (!ODDS_API_KEY) {
    logger.warn('THE_ODDS_API_KEY not found in environment variables')
    logger.warn('Sign up at https://the-odds-api.com/ to get a free API key')
    logger.warn('Add to .env file: THE_ODDS_API_KEY=your_key_here')
    return []
  }

  const url = `${ODDS_API_BASE_URL}/sports/${SPORT}/odds/`
  const params = {
    apiKey: ODDS_API_KEY,
    regions: 'us',
    markets: 'h2h,spreads,totals',
    bookmakers: BOOKMAKERS,
    oddsFormat: 'american'
  }

  try {
    logger.info('Fetching NFL odds from The Odds API...')
    const response = await axios.get(url, { params })

    // Log remaining requests
    const remainingRequests = response.headers['x-requests-remaining']
    const usedRequests = response.headers['x-requests-used']
    logger.info(`API Requests: ${usedRequests} used, ${remainingRequests} remaining`)

    logger.info(`✓ Fetched odds for ${response.data.length} games`)
    return response.data

  } catch (error) {
    if (error.response?.status === 401) {
      logger.error('Invalid API key. Check THE_ODDS_API_KEY in .env file')
    } else if (error.response?.status === 429) {
      logger.error('API rate limit exceeded. Free tier: 500 requests/month')
    } else {
      logger.error('Failed to fetch odds:', error.message)
    }
    throw error
  }
}

/**
 * Map ESPN team IDs to The Odds API team names
 */
const TEAM_MAPPING = {
  'Arizona Cardinals': 'ARI',
  'Atlanta Falcons': 'ATL',
  'Baltimore Ravens': 'BAL',
  'Buffalo Bills': 'BUF',
  'Carolina Panthers': 'CAR',
  'Chicago Bears': 'CHI',
  'Cincinnati Bengals': 'CIN',
  'Cleveland Browns': 'CLE',
  'Dallas Cowboys': 'DAL',
  'Denver Broncos': 'DEN',
  'Detroit Lions': 'DET',
  'Green Bay Packers': 'GB',
  'Houston Texans': 'HOU',
  'Indianapolis Colts': 'IND',
  'Jacksonville Jaguars': 'JAX',
  'Kansas City Chiefs': 'KC',
  'Las Vegas Raiders': 'LV',
  'Los Angeles Chargers': 'LAC',
  'Los Angeles Rams': 'LAR',
  'Miami Dolphins': 'MIA',
  'Minnesota Vikings': 'MIN',
  'New England Patriots': 'NE',
  'New Orleans Saints': 'NO',
  'New York Giants': 'NYG',
  'New York Jets': 'NYJ',
  'Philadelphia Eagles': 'PHI',
  'Pittsburgh Steelers': 'PIT',
  'San Francisco 49ers': 'SF',
  'Seattle Seahawks': 'SEA',
  'Tampa Bay Buccaneers': 'TB',
  'Tennessee Titans': 'TEN',
  'Washington Commanders': 'WAS'
}

/**
 * Find game_id from database by matching teams and date
 */
async function findGameId(homeTeam, awayTeam, gameDate) {
  const supabase = getSupabaseClient()

  const homeAbbr = TEAM_MAPPING[homeTeam]
  const awayAbbr = TEAM_MAPPING[awayTeam]

  if (!homeAbbr || !awayAbbr) {
    logger.warn(`Unknown team: ${homeTeam} or ${awayTeam}`)
    return null
  }

  // Query for game matching teams and approximate date
  const { data, error } = await supabase
    .from('games')
    .select('game_id, season')
    .eq('home_team_id', homeAbbr)
    .eq('away_team_id', awayAbbr)
    .eq('season', SEASON_YEAR)
    .limit(1)
    .single()

  if (error || !data) {
    logger.warn(`Game not found: ${awayTeam} @ ${homeTeam}`)
    return null
  }

  return data
}

/**
 * Transform odds data to database schema
 */
async function transformOddsData(oddsData) {
  const allBettingLines = []
  const allSpreads = []
  const allMoneylines = []
  const allTotals = []

  for (const game of oddsData) {
    const homeTeam = game.home_team
    const awayTeam = game.away_team
    const gameDate = game.commence_time

    // Find matching game in database
    const gameInfo = await findGameId(homeTeam, awayTeam, gameDate)
    if (!gameInfo) continue

    const { game_id, season } = gameInfo

    // Process each bookmaker's odds
    for (const bookmaker of game.bookmakers) {
      const bookmakerName = bookmaker.key
      const lastUpdate = bookmaker.last_update

      // Create betting line entry
      const bettingLineId = `${game_id}-${bookmakerName}`

      // Process markets
      for (const market of bookmaker.markets) {
        if (market.key === 'spreads') {
          // Spread lines
          const homeSpread = market.outcomes.find(o => o.name === homeTeam)
          const awaySpread = market.outcomes.find(o => o.name === awayTeam)

          if (homeSpread && awaySpread) {
            allBettingLines.push({
              betting_line_id: bettingLineId,
              game_id,
              season,
              bookmaker: bookmakerName,
              market_type: 'spread',
              last_update: lastUpdate
            })

            allSpreads.push({
              betting_line_id: bettingLineId,
              game_id,
              home_spread: homeSpread.point,
              away_spread: awaySpread.point,
              home_spread_odds: homeSpread.price,
              away_spread_odds: awaySpread.price,
              line_timestamp: lastUpdate,
              is_opening_line: false, // Would need historical data
              is_closing_line: false
            })
          }
        } else if (market.key === 'h2h') {
          // Moneyline
          const homeML = market.outcomes.find(o => o.name === homeTeam)
          const awayML = market.outcomes.find(o => o.name === awayTeam)

          if (homeML && awayML) {
            allBettingLines.push({
              betting_line_id: `${bettingLineId}-ml`,
              game_id,
              season,
              bookmaker: bookmakerName,
              market_type: 'moneyline',
              last_update: lastUpdate
            })

            allMoneylines.push({
              betting_line_id: `${bettingLineId}-ml`,
              game_id,
              home_moneyline: homeML.price,
              away_moneyline: awayML.price,
              line_timestamp: lastUpdate,
              is_opening_line: false,
              is_closing_line: false
            })
          }
        } else if (market.key === 'totals') {
          // Over/Under
          const over = market.outcomes.find(o => o.name === 'Over')
          const under = market.outcomes.find(o => o.name === 'Under')

          if (over && under) {
            allBettingLines.push({
              betting_line_id: `${bettingLineId}-ou`,
              game_id,
              season,
              bookmaker: bookmakerName,
              market_type: 'totals',
              last_update: lastUpdate
            })

            allTotals.push({
              betting_line_id: `${bettingLineId}-ou`,
              game_id,
              total_points: over.point,
              over_odds: over.price,
              under_odds: under.price,
              line_timestamp: lastUpdate,
              is_opening_line: false,
              is_closing_line: false
            })
          }
        }
      }
    }
  }

  return {
    bettingLines: allBettingLines,
    spreads: allSpreads,
    moneylines: allMoneylines,
    totals: allTotals
  }
}

/**
 * Main scraper function
 */
async function scrapeBettingOdds() {
  try {
    // Fetch odds from API
    const oddsData = await fetchOddsFromAPI()

    if (oddsData.length === 0) {
      logger.warn('No odds data available')
      return { success: 0, failed: 0, total: 0 }
    }

    // Transform to database schema
    logger.info('Transforming odds data...')
    const transformed = await transformOddsData(oddsData)

    // Update database
    logger.info('Updating database...')

    const results = {
      bettingLines: 0,
      spreads: 0,
      moneylines: 0,
      totals: 0
    }

    if (transformed.bettingLines.length > 0) {
      const result = await upsertBatch('game_betting_lines', transformed.bettingLines, ['betting_line_id'])
      results.bettingLines = result.success
      logger.info(`✓ Updated ${result.success} betting lines`)
    }

    if (transformed.spreads.length > 0) {
      const result = await upsertBatch('spread_lines', transformed.spreads, ['betting_line_id', 'line_timestamp'])
      results.spreads = result.success
      logger.info(`✓ Updated ${result.success} spread lines`)
    }

    if (transformed.moneylines.length > 0) {
      const result = await upsertBatch('moneyline_odds', transformed.moneylines, ['betting_line_id', 'line_timestamp'])
      results.moneylines = result.success
      logger.info(`✓ Updated ${result.success} moneyline odds`)
    }

    if (transformed.totals.length > 0) {
      const result = await upsertBatch('over_under_lines', transformed.totals, ['betting_line_id', 'line_timestamp'])
      results.totals = result.success
      logger.info(`✓ Updated ${result.success} over/under lines`)
    }

    return {
      success: results.bettingLines + results.spreads + results.moneylines + results.totals,
      failed: 0,
      total: transformed.bettingLines.length + transformed.spreads.length + transformed.moneylines.length + transformed.totals.length
    }

  } catch (error) {
    logger.error('Betting scraper failed:', error)
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
    const result = await scrapeBettingOdds()

    const duration = Date.now() - startTime

    logger.info('')
    logger.info('═'.repeat(60))
    logger.info('BETTING SCRAPER SUMMARY')
    logger.info('═'.repeat(60))
    logger.info(`✓ Records updated: ${result.success}/${result.total}`)
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
    logger.error('Betting scraper failed:', error)
    logScriptEnd(SCRIPT_NAME, {
      success: 0,
      failed: 1,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

main()
