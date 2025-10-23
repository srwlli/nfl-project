/**
 * Seed Script: NFL Teams
 *
 * Loads all 32 NFL teams into the database.
 * This is the foundation - all other data references teams.
 *
 * Run with: npm run seed:teams
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { insertBatch, getRecordCount } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SCRIPT_NAME = '01-teams.js'

async function main() {
  const startTime = Date.now()
  logScriptStart(SCRIPT_NAME)

  try {
    // Step 1: Load teams data from JSON file
    logger.info('Step 1: Loading teams data from JSON file...')
    const teamsPath = join(__dirname, '../data/teams.json')
    const teamsData = JSON.parse(readFileSync(teamsPath, 'utf-8'))
    logger.info(`✓ Loaded ${teamsData.length} teams from file`)

    // Step 2: Check if teams already exist
    logger.info('Step 2: Checking existing teams in database...')
    const existingCount = await getRecordCount('teams')
    logger.info(`Current teams in database: ${existingCount}`)

    if (existingCount > 0) {
      logger.warn('⚠️  Teams already exist in database')
      logger.info('Options:')
      logger.info('  1. This script will skip insert to avoid duplicates')
      logger.info('  2. To reload, manually truncate teams table first')
      logger.info('Skipping insert...')

      logScriptEnd(SCRIPT_NAME, {
        success: existingCount,
        failed: 0,
        total: existingCount,
        duration: Date.now() - startTime
      })

      return
    }

    // Step 3: Validate team data
    logger.info('Step 3: Validating team data...')
    const requiredFields = ['team_id', 'team_abbr', 'team_name', 'conference', 'division']
    const missingFields = []

    teamsData.forEach((team, index) => {
      requiredFields.forEach(field => {
        if (!team[field]) {
          missingFields.push(`Team ${index + 1} missing ${field}`)
        }
      })
    })

    if (missingFields.length > 0) {
      logger.error('Data validation failed:')
      missingFields.forEach(msg => logger.error(`  - ${msg}`))
      throw new Error('Team data validation failed')
    }

    logger.info('✓ All teams have required fields')

    // Step 4: Verify we have exactly 32 teams
    if (teamsData.length !== 32) {
      logger.warn(`⚠️  Expected 32 teams, found ${teamsData.length}`)
    }

    // Verify conference/division distribution
    const distribution = teamsData.reduce((acc, team) => {
      const key = `${team.conference}-${team.division}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    logger.info('Conference/Division distribution:')
    Object.entries(distribution).forEach(([key, count]) => {
      logger.info(`  ${key}: ${count} teams`)
    })

    // Step 5: Map data to match database schema
    logger.info('Step 5: Mapping data to database schema...')
    const schemaFields = ['team_id', 'team_name', 'team_abbr', 'city', 'conference', 'division', 'founded_year', 'primary_color', 'secondary_color', 'logo_url']
    const mappedData = teamsData.map(team => {
      const mapped = {}
      schemaFields.forEach(field => {
        if (team[field] !== undefined) {
          mapped[field] = team[field]
        }
      })
      // Database constraint requires founded_year >= 1920 (NFL establishment)
      if (mapped.founded_year && mapped.founded_year < 1920) {
        logger.warn(`  ${team.team_name}: Founded ${mapped.founded_year}, adjusting to 1920 for database constraint`)
        mapped.founded_year = 1920
      }
      return mapped
    })
    logger.info(`✓ Mapped ${mappedData.length} teams to database schema`)

    // Step 6: Insert teams into database
    logger.info('Step 6: Inserting teams into database...')
    const result = await insertBatch('teams', mappedData)

    // Step 7: Verify insert
    logger.info('Step 7: Verifying insert...')
    const finalCount = await getRecordCount('teams')
    logger.info(`Teams in database after insert: ${finalCount}`)

    // Summary
    const duration = Date.now() - startTime
    logger.info('')
    logger.info('═'.repeat(60))
    logger.info('TEAMS SEED SUMMARY')
    logger.info('═'.repeat(60))
    logger.info(`✓ Successfully inserted: ${result.success}/${result.total} teams`)

    if (result.errors.length > 0) {
      logger.error(`✗ Failed: ${result.errors.length} batches`)
      result.errors.forEach(err => {
        logger.error(`  Batch ${err.batch}: ${err.error}`)
      })
    }

    logger.info(`✓ Final database count: ${finalCount} teams`)
    logger.info(`✓ Duration: ${(duration / 1000).toFixed(2)}s`)
    logger.info('═'.repeat(60))

    // Verify expected count
    if (finalCount !== 32) {
      logger.warn(`⚠️  Warning: Expected 32 teams, but database has ${finalCount}`)
    } else {
      logger.info('✓ All 32 NFL teams loaded successfully!')
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
    logger.error('Teams seed failed:', error)
    logScriptEnd(SCRIPT_NAME, {
      success: 0,
      failed: 1,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

main()
