/**
 * Seed Script: NFL Players
 *
 * Loads current NFL player rosters from ESPN API.
 *
 * LIMITATION: ESPN's roster endpoint returns limited players (~6 per team).
 * For full rosters (~2,700 players), consider:
 *   - nflreadpy Python library (requires Python bridge)
 *   - Manual CSV import from Pro Football Reference
 *   - Different ESPN endpoint (needs research)
 *
 * This script provides a MINIMAL foundation for testing.
 * Phase 3 scrapers will handle full roster population.
 *
 * Data Source: ESPN NFL API (free, no auth required)
 * Run with: npm run seed:players
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { fetchAllRosters, transformPlayerData } from '../utils/espn-api.js'
import { upsertBatch, getRecordCount, insertBatch } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SCRIPT_NAME = '03-players.js'

async function main() {
  const startTime = Date.now()
  logScriptStart(SCRIPT_NAME)

  try {
    // Step 0: Ensure positions table is seeded (dependency)
    logger.info('Step 0: Checking positions table...')
    const positionsCount = await getRecordCount('positions')

    if (positionsCount === 0) {
      logger.info('Positions table is empty, seeding positions first...')
      const positionsPath = join(__dirname, '../data/positions.json')
      const positionsData = JSON.parse(readFileSync(positionsPath, 'utf-8'))
      await insertBatch('positions', positionsData)
      logger.info(`✓ Seeded ${positionsData.length} positions`)
    } else {
      logger.info(`✓ Positions table already has ${positionsCount} positions`)
    }

    // Step 1: Check current player count
    logger.info('Step 1: Checking existing players in database...')
    const existingCount = await getRecordCount('players')
    logger.info(`Current players in database: ${existingCount}`)

    if (existingCount > 2000) {
      logger.warn('⚠️  Large number of players already exist')
      logger.info('This script uses UPSERT to update existing players and add new ones')
      logger.info('Continuing...')
    }

    // Step 2: Fetch all rosters from ESPN
    logger.info('Step 2: Fetching all NFL rosters from ESPN API...')
    logger.info('This will take ~30-60 seconds due to rate limiting (1 req/sec)')
    logger.info('')

    const espnPlayers = await fetchAllRosters()

    if (espnPlayers.length === 0) {
      throw new Error('No players fetched from ESPN API')
    }

    logger.info(`✓ Fetched ${espnPlayers.length} players from ESPN`)

    // Step 3: Transform ESPN data to our schema
    logger.info('Step 3: Transforming player data to database schema...')

    const transformedPlayers = espnPlayers.map(espnPlayer => {
      try {
        return transformPlayerData(espnPlayer)
      } catch (error) {
        logger.warn(`  ⚠️  Failed to transform player ${espnPlayer.id}: ${error.message}`)
        return null
      }
    }).filter(p => p !== null)

    logger.info(`✓ Transformed ${transformedPlayers.length}/${espnPlayers.length} players`)

    // Step 4: Validate transformed data
    logger.info('Step 4: Validating player data...')

    const invalidPlayers = transformedPlayers.filter(p =>
      !p.player_id || !p.first_name || !p.last_name || !p.primary_position
    )

    if (invalidPlayers.length > 0) {
      logger.warn(`⚠️  Found ${invalidPlayers.length} players with missing required fields`)
      logger.warn('These players will be skipped')
    }

    const validPlayers = transformedPlayers.filter(p =>
      p.player_id && p.first_name && p.last_name && p.primary_position
    )

    logger.info(`✓ ${validPlayers.length} players have all required fields`)

    // Step 5: Analyze player distribution
    logger.info('Step 5: Analyzing player data...')

    const positionGroups = validPlayers.reduce((acc, player) => {
      acc[player.primary_position] = (acc[player.primary_position] || 0) + 1
      return acc
    }, {})

    logger.info('Position distribution (top 10):')
    Object.entries(positionGroups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([pos, count]) => {
        logger.info(`  ${pos}: ${count} players`)
      })

    // Step 6: Upsert players into database
    logger.info('Step 6: Upserting players into database...')
    logger.info('Using UPSERT to handle updates to existing players')

    const result = await upsertBatch(
      'players',
      validPlayers,
      ['player_id'] // Conflict resolution on player_id
    )

    // Step 7: Verify insert
    logger.info('Step 7: Verifying database state...')
    const finalCount = await getRecordCount('players')
    logger.info(`Players in database after upsert: ${finalCount}`)

    // Summary
    const duration = Date.now() - startTime
    logger.info('')
    logger.info('═'.repeat(60))
    logger.info('PLAYERS SEED SUMMARY')
    logger.info('═'.repeat(60))
    logger.info(`✓ Fetched from ESPN: ${espnPlayers.length} players`)
    logger.info(`✓ Transformed successfully: ${transformedPlayers.length} players`)
    logger.info(`✓ Valid for insert: ${validPlayers.length} players`)
    logger.info(`✓ Upserted to database: ${result.success}/${result.total} players`)

    if (result.errors.length > 0) {
      logger.error(`✗ Failed: ${result.errors.length} batches`)
      result.errors.forEach(err => {
        logger.error(`  Batch ${err.batch}: ${err.error}`)
      })
    }

    logger.info(`✓ Final database count: ${finalCount} players`)
    logger.info(`✓ Duration: ${(duration / 1000).toFixed(2)}s`)
    logger.info('═'.repeat(60))

    // Success message
    if (result.success === validPlayers.length) {
      logger.info('✓ All players loaded successfully!')
    } else {
      logger.warn(`⚠️  ${validPlayers.length - result.success} players failed to load`)
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
    logger.error('Players seed failed:', error)
    logScriptEnd(SCRIPT_NAME, {
      success: 0,
      failed: 1,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

main()
