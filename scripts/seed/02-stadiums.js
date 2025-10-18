/**
 * Seed Script: NFL Stadiums
 *
 * Loads all 30 current NFL stadiums into the database.
 * Some teams share stadiums (MetLife: NYG/NYJ, SoFi: LAR/LAC)
 *
 * Run with: npm run seed:stadiums
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { insertBatch, getRecordCount } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SCRIPT_NAME = '02-stadiums.js'

async function main() {
  const startTime = Date.now()
  logScriptStart(SCRIPT_NAME)

  try {
    // Step 1: Load stadiums data from JSON file
    logger.info('Step 1: Loading stadiums data from JSON file...')
    const stadiumsPath = join(__dirname, '../data/stadiums.json')
    const stadiumsData = JSON.parse(readFileSync(stadiumsPath, 'utf-8'))
    logger.info(`✓ Loaded ${stadiumsData.length} stadiums from file`)

    // Step 2: Check if stadiums already exist
    logger.info('Step 2: Checking existing stadiums in database...')
    const existingCount = await getRecordCount('stadiums')
    logger.info(`Current stadiums in database: ${existingCount}`)

    if (existingCount > 0) {
      logger.warn('⚠️  Stadiums already exist in database')
      logger.info('Options:')
      logger.info('  1. This script will skip insert to avoid duplicates')
      logger.info('  2. To reload, manually truncate stadiums table first')
      logger.info('Skipping insert...')

      logScriptEnd(SCRIPT_NAME, {
        success: existingCount,
        failed: 0,
        total: existingCount,
        duration: Date.now() - startTime
      })

      return
    }

    // Step 3: Validate stadium data
    logger.info('Step 3: Validating stadium data...')
    const requiredFields = ['stadium_id', 'stadium_name', 'city', 'capacity']
    const missingFields = []

    stadiumsData.forEach((stadium, index) => {
      requiredFields.forEach(field => {
        if (!stadium[field]) {
          missingFields.push(`Stadium ${index + 1} missing ${field}`)
        }
      })
    })

    if (missingFields.length > 0) {
      logger.error('Data validation failed:')
      missingFields.forEach(msg => logger.error(`  - ${msg}`))
      throw new Error('Stadium data validation failed')
    }

    logger.info('✓ All stadiums have required fields')

    // Step 4: Verify stadium count and distribution
    logger.info('Step 4: Analyzing stadium data...')
    logger.info(`Total stadiums: ${stadiumsData.length}`)

    // Roof type distribution
    const roofTypes = stadiumsData.reduce((acc, stadium) => {
      acc[stadium.roof_type] = (acc[stadium.roof_type] || 0) + 1
      return acc
    }, {})

    logger.info('Roof type distribution:')
    Object.entries(roofTypes).forEach(([type, count]) => {
      logger.info(`  ${type}: ${count} stadiums`)
    })

    // Surface type distribution
    const surfaceTypes = stadiumsData.reduce((acc, stadium) => {
      acc[stadium.surface_type] = (acc[stadium.surface_type] || 0) + 1
      return acc
    }, {})

    logger.info('Surface type distribution:')
    Object.entries(surfaceTypes).forEach(([type, count]) => {
      logger.info(`  ${type}: ${count} stadiums`)
    })

    // Step 5: Map data to match database schema
    logger.info('Step 5: Mapping data to database schema...')
    const schemaFields = [
      'stadium_id',
      'stadium_name',
      'city',
      'state',
      'country',
      'capacity',
      'surface_type',
      'roof_type',
      'opened_year',
      'latitude',
      'longitude',
      'elevation_feet'
    ]

    const mappedData = stadiumsData.map(stadium => {
      const mapped = {}
      schemaFields.forEach(field => {
        if (stadium[field] !== undefined) {
          mapped[field] = stadium[field]
        }
      })
      return mapped
    })

    logger.info(`✓ Mapped ${mappedData.length} stadiums to database schema`)

    // Step 6: Insert stadiums into database
    logger.info('Step 6: Inserting stadiums into database...')
    const result = await insertBatch('stadiums', mappedData)

    // Step 7: Verify insert
    logger.info('Step 7: Verifying insert...')
    const finalCount = await getRecordCount('stadiums')
    logger.info(`Stadiums in database after insert: ${finalCount}`)

    // Summary
    const duration = Date.now() - startTime
    logger.info('')
    logger.info('═'.repeat(60))
    logger.info('STADIUMS SEED SUMMARY')
    logger.info('═'.repeat(60))
    logger.info(`✓ Successfully inserted: ${result.success}/${result.total} stadiums`)

    if (result.errors.length > 0) {
      logger.error(`✗ Failed: ${result.errors.length} batches`)
      result.errors.forEach(err => {
        logger.error(`  Batch ${err.batch}: ${err.error}`)
      })
    }

    logger.info(`✓ Final database count: ${finalCount} stadiums`)
    logger.info(`✓ Duration: ${(duration / 1000).toFixed(2)}s`)
    logger.info('═'.repeat(60))

    // Verify expected count
    if (finalCount !== 30) {
      logger.warn(`⚠️  Warning: Expected 30 stadiums, but database has ${finalCount}`)
    } else {
      logger.info('✓ All 30 NFL stadiums loaded successfully!')
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
    logger.error('Stadiums seed failed:', error)
    logScriptEnd(SCRIPT_NAME, {
      success: 0,
      failed: 1,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

main()
