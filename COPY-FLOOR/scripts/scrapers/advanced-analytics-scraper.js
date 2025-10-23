/**
 * Advanced Analytics Scraper
 *
 * Fetches advanced NFL analytics from nflverse (nfl_data_py) including:
 * - EPA (Expected Points Added)
 * - Win Probability (WP/WPA)
 * - Success Rate
 * - Play-by-play data with analytics
 *
 * Updates play_by_play table with EPA, WPA, and success metrics.
 *
 * Data Source: nflverse via GitHub (free, no API key required)
 * - Play-by-play CSV: https://github.com/nflverse/nflverse-data/releases
 *
 * Usage:
 * - Weekly update: npm run scrape:analytics
 * - Specific week: npm run scrape:analytics -- --week=7
 * - Specific game: npm run scrape:analytics -- --game=401547398
 *
 * Recommended Schedule: Weekly on Tuesday 6 AM ET (after stats corrections)
 *
 * NOTE: This uses the free nflverse data which is updated weekly.
 * For real-time analytics, would need ESPN API or custom EPA calculations.
 */

import axios from 'axios'
import { parse } from 'csv-parse/sync'
import { getSupabaseClient, upsertBatch } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'

const SCRIPT_NAME = 'advanced-analytics-scraper.js'
const SEASON_YEAR = 2025

// nflverse data URLs
const NFLVERSE_BASE = 'https://github.com/nflverse/nflverse-data/releases/download'
const PBP_URL = `${NFLVERSE_BASE}/pbp/play_by_play_${SEASON_YEAR}.csv`

/**
 * Download play-by-play data from nflverse
 */
async function downloadPlayByPlayData(season) {
  const url = PBP_URL.replace(SEASON_YEAR, season)

  try {
    logger.info(`Downloading play-by-play data for ${season}...`)
    logger.info(`URL: ${url}`)

    const response = await axios.get(url, {
      responseType: 'text',
      timeout: 120000, // 2 minutes (large file)
      maxContentLength: 500 * 1024 * 1024 // 500MB max
    })

    logger.info(`✓ Downloaded ${(response.data.length / 1024 / 1024).toFixed(2)}MB`)

    // Parse CSV
    logger.info('Parsing CSV data...')
    const records = parse(response.data, {
      columns: true,
      skip_empty_lines: true,
      cast: true,
      cast_date: false
    })

    logger.info(`✓ Parsed ${records.length.toLocaleString()} plays`)
    return records

  } catch (error) {
    if (error.response?.status === 404) {
      logger.error(`Play-by-play data not available for ${season} yet`)
      logger.info('nflverse typically updates weekly on Tuesdays')
    } else if (error.code === 'ECONNABORTED') {
      logger.error('Download timeout - file too large or connection slow')
    } else {
      logger.error('Failed to download play-by-play data:', error.message)
    }
    throw error
  }
}

/**
 * Transform nflverse play-by-play to database schema
 */
function transformPlayByPlayData(pbpRecords, gameId = null) {
  logger.info('Transforming play-by-play data...')

  const plays = pbpRecords
    .filter(play => {
      // Filter by game if specified
      if (gameId && play.game_id !== gameId) return false
      // Only plays with EPA data
      if (!play.epa && play.epa !== 0) return false
      return true
    })
    .map(play => ({
      // Use existing play_id if available, otherwise generate
      play_id: play.play_id || null,
      game_id: play.game_id,
      season: play.season,
      drive_id: play.fixed_drive || null,
      play_number: play.play_id || null,
      quarter: play.qtr || null,
      time_remaining_seconds: play.quarter_seconds_remaining || null,
      down: play.down || null,
      yards_to_go: play.ydstogo || null,
      yard_line: play.yardline_100 ? (50 - play.yardline_100) : null,
      possession_team_id: play.posteam || null,
      play_type: play.play_type || null,
      play_description: play.desc || null,
      yards_gained: play.yards_gained || 0,

      // Advanced analytics
      epa: play.epa || 0,
      wpa: play.wpa || 0,
      success: play.success === 1 || play.success === true,

      // Additional context (if we add columns later)
      // air_epa: play.air_epa || 0,
      // yac_epa: play.yac_epa || 0,
      // comp_air_epa: play.comp_air_epa || 0,
      // comp_yac_epa: play.comp_yac_epa || 0,
      // total_home_epa: play.total_home_epa || 0,
      // total_away_epa: play.total_away_epa || 0,
      // home_wp: play.home_wp || null,
      // away_wp: play.away_wp || null,
    }))

  logger.info(`✓ Transformed ${plays.length.toLocaleString()} plays with analytics`)
  return plays
}

/**
 * Calculate game-level EPA summaries
 */
function calculateGameEPASummary(plays, gameId) {
  const gamePlays = plays.filter(p => p.game_id === gameId)

  if (gamePlays.length === 0) {
    logger.warn(`No plays found for game ${gameId}`)
    return null
  }

  // Group by team
  const teams = [...new Set(gamePlays.map(p => p.possession_team_id).filter(Boolean))]

  const summary = {}

  teams.forEach(team => {
    const teamPlays = gamePlays.filter(p => p.possession_team_id === team)

    summary[team] = {
      total_plays: teamPlays.length,
      total_epa: teamPlays.reduce((sum, p) => sum + (p.epa || 0), 0).toFixed(4),
      avg_epa_per_play: (teamPlays.reduce((sum, p) => sum + (p.epa || 0), 0) / teamPlays.length).toFixed(4),

      passing_plays: teamPlays.filter(p => p.play_type === 'pass').length,
      passing_epa: teamPlays.filter(p => p.play_type === 'pass').reduce((sum, p) => sum + (p.epa || 0), 0).toFixed(4),

      rushing_plays: teamPlays.filter(p => p.play_type === 'run').length,
      rushing_epa: teamPlays.filter(p => p.play_type === 'run').reduce((sum, p) => sum + (p.epa || 0), 0).toFixed(4),

      success_rate: (teamPlays.filter(p => p.success).length / teamPlays.length * 100).toFixed(2) + '%',
      explosive_plays: teamPlays.filter(p => (p.yards_gained || 0) >= 20).length
    }
  })

  return summary
}

/**
 * Main scraper function
 */
async function scrapeAdvancedAnalytics(season, gameId = null, week = null) {
  try {
    // Download play-by-play data
    const pbpData = await downloadPlayByPlayData(season)

    // Filter by week if specified
    let filteredData = pbpData
    if (week) {
      filteredData = pbpData.filter(play => play.week === parseInt(week))
      logger.info(`Filtered to week ${week}: ${filteredData.length} plays`)
    }

    // Transform to database schema
    const plays = transformPlayByPlayData(filteredData, gameId)

    if (plays.length === 0) {
      logger.warn('No plays to update')
      return { success: 0, failed: 0, total: 0 }
    }

    // Show sample EPA summary
    if (gameId) {
      logger.info('')
      logger.info('EPA Summary for Game:')
      const summary = calculateGameEPASummary(plays, gameId)
      if (summary) {
        Object.keys(summary).forEach(team => {
          logger.info(`  ${team}:`)
          logger.info(`    Total EPA: ${summary[team].total_epa}`)
          logger.info(`    Avg EPA/Play: ${summary[team].avg_epa_per_play}`)
          logger.info(`    Passing EPA: ${summary[team].passing_epa} (${summary[team].passing_plays} plays)`)
          logger.info(`    Rushing EPA: ${summary[team].rushing_epa} (${summary[team].rushing_plays} plays)`)
          logger.info(`    Success Rate: ${summary[team].success_rate}`)
          logger.info(`    Explosive Plays: ${summary[team].explosive_plays}`)
        })
      }
    }

    // Update database in batches
    logger.info('')
    logger.info('Updating play_by_play table...')

    const result = await upsertBatch('play_by_play', plays, ['game_id', 'play_id'])

    logger.info(`✓ Updated ${result.success.toLocaleString()} plays with analytics`)

    return {
      success: result.success,
      failed: result.errors.length,
      total: plays.length
    }

  } catch (error) {
    logger.error('Advanced analytics scraper failed:', error)
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
    const seasonArg = args.find(arg => arg.startsWith('--season='))
    const weekArg = args.find(arg => arg.startsWith('--week='))
    const gameArg = args.find(arg => arg.startsWith('--game='))

    const season = seasonArg ? parseInt(seasonArg.split('=')[1]) : SEASON_YEAR
    const week = weekArg ? parseInt(weekArg.split('=')[1]) : null
    const gameId = gameArg ? gameArg.split('=')[1] : null

    logger.info(`Season: ${season}`)
    if (week) logger.info(`Week: ${week}`)
    if (gameId) logger.info(`Game ID: ${gameId}`)
    logger.info('')

    const result = await scrapeAdvancedAnalytics(season, gameId, week)

    const duration = Date.now() - startTime

    logger.info('')
    logger.info('═'.repeat(60))
    logger.info('ADVANCED ANALYTICS SCRAPER SUMMARY')
    logger.info('═'.repeat(60))
    logger.info(`✓ Plays updated: ${result.success.toLocaleString()}/${result.total.toLocaleString()}`)
    if (result.failed > 0) {
      logger.error(`✗ Failed: ${result.failed.toLocaleString()}`)
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
    logger.error('Advanced analytics scraper failed:', error)
    logScriptEnd(SCRIPT_NAME, {
      success: 0,
      failed: 1,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

main()
