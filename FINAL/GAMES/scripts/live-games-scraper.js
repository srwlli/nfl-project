/**
 * Live Games Scraper
 *
 * Fetches real-time game updates from ESPN's scoreboard endpoint.
 * Updates game scores, status, and identifies newly completed games.
 *
 * Use Cases:
 * 1. During live games: Update scores every 30-60 seconds
 * 2. After games: Update final scores and trigger game-stats-scraper
 * 3. Weekly check: Ensure all scores are up to date
 *
 * Usage:
 * - Check current week: npm run scrape:live
 * - Specific week: npm run scrape:live -- --week=7
 * - Watch mode (auto-refresh): npm run scrape:live -- --watch
 *
 * Data Source: ESPN NFL Scoreboard API
 */

import { fetchSchedule } from '../utils/espn-api.js'
import { upsertBatch, getSupabaseClient } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'
import { execSync } from 'child_process'

const SCRIPT_NAME = 'live-games-scraper.js'
const SEASON_YEAR = 2025
const WATCH_INTERVAL_MS = 60000 // 60 seconds

/**
 * Get current week number based on date
 * NFL season starts early September, 18-week regular season
 */
function getCurrentWeek() {
  const now = new Date()
  const seasonStart = new Date('2025-09-04') // Week 1 start

  if (now < seasonStart) {
    return 1 // Preseason or not started
  }

  const diffTime = Math.abs(now - seasonStart)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const week = Math.ceil(diffDays / 7)

  return Math.min(week, 18) // Cap at week 18
}

/**
 * Extract game updates from ESPN scoreboard data
 */
function extractGameUpdates(espnGames) {
  return espnGames.map(game => {
    const competition = game.competitions?.[0]
    if (!competition) return null

    const homeTeam = competition.competitors.find(c => c.homeAway === 'home')
    const awayTeam = competition.competitors.find(c => c.homeAway === 'away')

    if (!homeTeam || !awayTeam) return null

    // Determine game status
    const status = competition.status
    let gameStatus = 'scheduled'
    if (status.type.completed) {
      gameStatus = 'final'
    } else if (status.type.state === 'in') {
      gameStatus = 'in_progress'
    }

    // Extract scores
    const homeScore = homeTeam.score ? parseInt(homeTeam.score) : null
    const awayScore = awayTeam.score ? parseInt(awayTeam.score) : null

    return {
      game_id: `espn-${game.id}`,
      status: gameStatus,
      home_score: homeScore,
      away_score: awayScore,
      // Additional live game info
      current_period: status.period || null,
      clock: status.displayClock || null,
      last_updated: new Date().toISOString()
    }
  }).filter(g => g !== null)
}

/**
 * Identify games that just completed (status changed from in_progress to final)
 */
async function findNewlyCompletedGames(currentGames) {
  const supabase = getSupabaseClient()

  const finalGameIds = currentGames
    .filter(g => g.status === 'final')
    .map(g => g.game_id)

  if (finalGameIds.length === 0) {
    return []
  }

  // Query database to see which games were NOT final before
  const { data: dbGames, error } = await supabase
    .from('games')
    .select('game_id, status')
    .in('game_id', finalGameIds)

  if (error) {
    logger.error('Failed to query existing games:', error)
    return []
  }

  // Find games that were not 'final' before but are now
  const newlyCompleted = dbGames
    .filter(dbGame => dbGame.status !== 'final')
    .map(dbGame => dbGame.game_id)

  return newlyCompleted
}

/**
 * Trigger game-stats-scraper for newly completed games
 */
async function scrapeCompletedGameStats(gameIds) {
  if (gameIds.length === 0) return

  logger.info(`Triggering game-stats-scraper for ${gameIds.length} newly completed games...`)

  for (const gameId of gameIds) {
    const espnId = gameId.replace('espn-', '')
    try {
      logger.info(`  Scraping stats for ${gameId}...`)

      // Run game-stats-scraper as child process
      execSync(`node scripts/scrapers/game-stats-scraper.js --game=${espnId}`, {
        cwd: process.cwd(),
        stdio: 'inherit'
      })

      logger.info(`  ✓ Completed stats scrape for ${gameId}`)
    } catch (error) {
      logger.error(`  ✗ Failed to scrape stats for ${gameId}:`, error.message)
    }
  }
}

/**
 * Main scraper function
 */
async function scrapeLiveGames(week, triggerStatsScraperForCompleted = true) {
  try {
    logger.info(`Fetching live scores for Week ${week}...`)

    // Fetch current scoreboard from ESPN
    const games = await fetchSchedule(SEASON_YEAR, 2, week) // 2 = regular season

    if (!games || games.length === 0) {
      logger.warn(`No games found for Week ${week}`)
      return {
        updated: 0,
        inProgress: 0,
        completed: 0,
        scheduled: 0,
        newlyCompleted: []
      }
    }

    logger.info(`Found ${games.length} games`)

    // Extract game updates
    const gameUpdates = extractGameUpdates(games)

    // Count games by status
    const statusCounts = {
      inProgress: gameUpdates.filter(g => g.status === 'in_progress').length,
      completed: gameUpdates.filter(g => g.status === 'final').length,
      scheduled: gameUpdates.filter(g => g.status === 'scheduled').length
    }

    logger.info(`Status: ${statusCounts.inProgress} in progress, ${statusCounts.completed} final, ${statusCounts.scheduled} scheduled`)

    // Find newly completed games BEFORE updating
    const newlyCompleted = await findNewlyCompletedGames(gameUpdates)

    if (newlyCompleted.length > 0) {
      logger.info(`🎉 ${newlyCompleted.length} game(s) just completed!`)
      newlyCompleted.forEach(gameId => {
        const game = gameUpdates.find(g => g.game_id === gameId)
        logger.info(`  ${gameId}: Final score updated`)
      })
    }

    // Update games in database
    logger.info('Updating games in database...')

    // Use direct UPDATE queries instead of UPSERT to avoid NOT NULL constraints
    const supabase = getSupabaseClient()
    let successCount = 0
    let failCount = 0

    for (const game of gameUpdates) {
      const { error } = await supabase
        .from('games')
        .update({
          status: game.status,
          home_score: game.home_score,
          away_score: game.away_score
        })
        .eq('game_id', game.game_id)
        .eq('season', SEASON_YEAR)

      if (error) {
        logger.error(`Failed to update ${game.game_id}:`, error.message)
        failCount++
      } else {
        successCount++
      }
    }

    logger.info(`✓ Updated ${successCount} games${failCount > 0 ? ` (${failCount} failed)` : ''}`)

    // Trigger game-stats-scraper for newly completed games
    if (triggerStatsScraperForCompleted && newlyCompleted.length > 0) {
      await scrapeCompletedGameStats(newlyCompleted)
    }

    return {
      updated: successCount,
      inProgress: statusCounts.inProgress,
      completed: statusCounts.completed,
      scheduled: statusCounts.scheduled,
      newlyCompleted: newlyCompleted
    }

  } catch (error) {
    logger.error(`Failed to scrape live games:`, error)
    throw error
  }
}

/**
 * Watch mode - continuously poll for updates
 */
async function watchMode(week) {
  logger.info('═'.repeat(60))
  logger.info('WATCH MODE ENABLED')
  logger.info(`Monitoring Week ${week} games every ${WATCH_INTERVAL_MS / 1000} seconds`)
  logger.info('Press Ctrl+C to stop')
  logger.info('═'.repeat(60))
  logger.info('')

  let iteration = 1

  const poll = async () => {
    logger.info(`[Iteration ${iteration}] Checking for updates...`)

    try {
      const result = await scrapeLiveGames(week, true)

      // Show summary
      if (result.inProgress > 0) {
        logger.info(`  🔴 LIVE: ${result.inProgress} game(s) in progress`)
      }
      if (result.newlyCompleted.length > 0) {
        logger.info(`  🎉 NEW: ${result.newlyCompleted.length} game(s) just finished!`)
      }
      if (result.completed > 0 && result.newlyCompleted.length === 0) {
        logger.info(`  ✓ ${result.completed} game(s) already completed`)
      }
      if (result.scheduled > 0) {
        logger.info(`  ⏰ ${result.scheduled} game(s) upcoming`)
      }

      logger.info(`  Next check in ${WATCH_INTERVAL_MS / 1000} seconds...`)
      logger.info('')

    } catch (error) {
      logger.error('Poll failed:', error.message)
    }

    iteration++
    setTimeout(poll, WATCH_INTERVAL_MS)
  }

  // Start polling
  await poll()
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
    const weekArg = args.find(arg => arg.startsWith('--week='))
    const watchArg = args.includes('--watch')

    const week = weekArg ? parseInt(weekArg.split('=')[1]) : getCurrentWeek()

    logger.info(`Mode: ${watchArg ? 'Watch (continuous)' : 'Single check'}`)
    logger.info(`Week: ${week}`)
    logger.info('')

    if (watchArg) {
      // Watch mode - runs indefinitely
      await watchMode(week)
    } else {
      // Single check mode
      const result = await scrapeLiveGames(week, true)

      // Summary
      logger.info('')
      logger.info('═'.repeat(60))
      logger.info('LIVE GAMES SCRAPER SUMMARY')
      logger.info('═'.repeat(60))
      logger.info(`✓ Games updated: ${result.updated}`)
      logger.info(`  In Progress: ${result.inProgress}`)
      logger.info(`  Completed: ${result.completed}`)
      logger.info(`  Scheduled: ${result.scheduled}`)
      if (result.newlyCompleted.length > 0) {
        logger.info(`🎉 Newly Completed: ${result.newlyCompleted.length} games`)
        result.newlyCompleted.forEach(gameId => {
          logger.info(`    - ${gameId}`)
        })
      }
      logger.info('═'.repeat(60))

      const duration = Date.now() - startTime
      logScriptEnd(SCRIPT_NAME, {
        success: result.updated,
        failed: 0,
        total: result.updated,
        duration
      })

      process.exit(0)
    }

  } catch (error) {
    logger.error('Live games scraper failed:', error)
    logScriptEnd(SCRIPT_NAME, {
      success: 0,
      failed: 1,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

main()
