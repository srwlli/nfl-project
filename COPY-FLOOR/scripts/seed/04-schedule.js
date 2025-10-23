/**
 * Seed Script: 2025-26 NFL Schedule
 *
 * Loads the complete 2025-26 NFL season schedule from ESPN API.
 * Includes regular season (18 weeks) and playoffs.
 *
 * Data Source: ESPN NFL Scoreboard API (free, no auth required)
 * Run with: npm run seed:schedule
 */

import { fetchSchedule, transformGameData } from '../utils/espn-api.js'
import { upsertBatch, getRecordCount } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'

const SCRIPT_NAME = '04-schedule.js'
const SEASON_YEAR = 2025

async function main() {
  const startTime = Date.now()
  logScriptStart(SCRIPT_NAME)

  try {
    // Step 0: Ensure 2025 season exists
    logger.info('Step 0: Checking if 2025 season exists...')
    const { insertBatch } = await import('../utils/supabase-client.js')

    try {
      await insertBatch('seasons', [{
        season: SEASON_YEAR,
        start_date: '2025-09-04',
        end_date: '2026-02-09'
      }])
      logger.info('✓ Created 2025 season record')
    } catch (error) {
      if (error.message?.includes('duplicate key')) {
        logger.info('✓ 2025 season already exists')
      } else {
        throw error
      }
    }

    // Step 1: Check existing schedule games
    logger.info('Step 1: Checking existing games in database...')
    const existingCount = await getRecordCount('games')
    logger.info(`Current games in database: ${existingCount || 0}`)

    // Step 2: Fetch 2025 regular season schedule (18 weeks)
    logger.info('Step 2: Fetching 2025-26 NFL schedule from ESPN API...')
    logger.info('This will take ~20-30 seconds due to rate limiting (1 req/sec)')
    logger.info('')

    const allGames = []

    // Regular season: 18 weeks
    logger.info('Fetching regular season schedule (18 weeks)...')
    for (let week = 1; week <= 18; week++) {
      logger.info(`  [${week}/18] Fetching Week ${week}...`)
      const weekGames = await fetchSchedule(SEASON_YEAR, 2, week) // seasontype=2 = regular season
      allGames.push(...weekGames)
      logger.info(`    ✓ Added ${weekGames.length} games (Total: ${allGames.length})`)
    }

    // Playoffs (Wild Card, Divisional, Conference, Super Bowl)
    logger.info('Fetching playoff schedule...')
    for (let week = 1; week <= 5; week++) {
      logger.info(`  [${week}/5] Fetching Playoff Week ${week}...`)
      const weekGames = await fetchSchedule(SEASON_YEAR, 3, week) // seasontype=3 = playoffs

      if (weekGames.length > 0) {
        allGames.push(...weekGames)
        logger.info(`    ✓ Added ${weekGames.length} games (Total: ${allGames.length})`)
      } else {
        logger.info(`    ℹ No games found (playoffs not scheduled yet)`)
      }
    }

    logger.info('')
    logger.info('═'.repeat(60))
    logger.info(`Schedule fetch complete: ${allGames.length} total games`)
    logger.info('═'.repeat(60))

    if (allGames.length === 0) {
      logger.warn('⚠️  No games fetched from ESPN API')
      logger.info('This may be because the 2025 schedule is not published yet')
      logger.info('Try again closer to the season start')

      logScriptEnd(SCRIPT_NAME, {
        success: 0,
        failed: 0,
        total: 0,
        duration: Date.now() - startTime
      })
      return
    }

    // Step 3: Transform ESPN data to our schema
    logger.info('Step 3: Transforming game data to database schema...')

    const transformedGames = allGames.map(espnGame => {
      try {
        return transformGameData(espnGame, SEASON_YEAR)
      } catch (error) {
        logger.warn(`  ⚠️  Failed to transform game ${espnGame.id}: ${error.message}`)
        return null
      }
    }).filter(g => g !== null)

    logger.info(`✓ Transformed ${transformedGames.length}/${allGames.length} games`)

    // Step 4: Validate transformed data
    logger.info('Step 4: Validating game data...')

    const invalidGames = transformedGames.filter(g =>
      !g.game_id || !g.home_team_id || !g.away_team_id || !g.game_date ||
      g.home_team_id === 'TBD' || g.away_team_id === 'TBD'
    )

    if (invalidGames.length > 0) {
      logger.warn(`⚠️  Found ${invalidGames.length} games with missing required fields or TBD teams`)
      logger.warn('These games will be skipped (playoff teams not yet determined)')
    }

    const validGames = transformedGames.filter(g =>
      g.game_id && g.home_team_id && g.away_team_id && g.game_date &&
      g.home_team_id !== 'TBD' && g.away_team_id !== 'TBD'
    )

    logger.info(`✓ ${validGames.length} games have all required fields`)

    // Step 5: Analyze schedule distribution
    logger.info('Step 5: Analyzing schedule data...')

    const weekGroups = validGames.reduce((acc, game) => {
      const key = `${game.game_type}-${game.week}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    logger.info('Games per week:')
    Object.entries(weekGroups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([week, count]) => {
        const [type, num] = week.split('-')
        const label = type === 'regular' ? `Week ${num}` : `Playoff Week ${num}`
        logger.info(`  ${label}: ${count} games`)
      })

    // Step 6: Upsert games into database
    logger.info('Step 6: Upserting schedule into database...')
    logger.info('Using UPSERT to handle updates to existing games')

    const result = await upsertBatch(
      'games',
      validGames,
      ['game_id', 'season'] // Conflict resolution on composite primary key
    )

    // Step 7: Verify insert
    logger.info('Step 7: Verifying database state...')
    const finalCount = await getRecordCount('games')
    logger.info(`Games in database after upsert: ${finalCount || 0}`)

    // Summary
    const duration = Date.now() - startTime
    logger.info('')
    logger.info('═'.repeat(60))
    logger.info('SCHEDULE SEED SUMMARY')
    logger.info('═'.repeat(60))
    logger.info(`✓ Fetched from ESPN: ${allGames.length} games`)
    logger.info(`✓ Transformed successfully: ${transformedGames.length} games`)
    logger.info(`✓ Valid for insert: ${validGames.length} games`)
    logger.info(`✓ Upserted to database: ${result.success}/${result.total} games`)

    if (result.errors.length > 0) {
      logger.error(`✗ Failed: ${result.errors.length} batches`)
      result.errors.forEach(err => {
        logger.error(`  Batch ${err.batch}: ${err.error}`)
      })
    }

    logger.info(`✓ Final database count: ${finalCount} games`)
    logger.info(`✓ Duration: ${(duration / 1000).toFixed(2)}s`)
    logger.info('═'.repeat(60))

    // Success message
    if (result.success === validGames.length) {
      logger.info('✓ All games loaded successfully!')
    } else {
      logger.warn(`⚠️  ${validGames.length - result.success} games failed to load`)
    }

    logScriptEnd(SCRIPT_NAME, {
      success: result.success,
      failed: result.errors.length,
      total: result.total,
      duration
    })

    // Exit with appropriate code
    process.exit(result.errors.length > 0 ? 1 : 0)

  } catch (error) {
    logger.error('Schedule seed failed:', error)
    logScriptEnd(SCRIPT_NAME, {
      success: 0,
      failed: 1,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

main()
