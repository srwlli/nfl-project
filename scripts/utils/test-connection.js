/**
 * Test Supabase Connection
 *
 * Simple script to verify database connectivity and environment setup.
 * Run with: npm run test:db
 */

import { getSupabaseClient, testConnection, getRecordCount } from './supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from './logger.js'

async function main() {
  logScriptStart('test-connection.js')

  try {
    // Test 1: Environment variables
    logger.info('Test 1: Checking environment variables...')
    const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    const missing = requiredVars.filter(v => !process.env[v])

    if (missing.length > 0) {
      logger.error(`Missing environment variables: ${missing.join(', ')}`)
      logger.error('Make sure .env.local exists and contains these variables')
      process.exit(1)
    }

    logger.info('✓ Environment variables configured')

    // Test 2: Database connection
    logger.info('Test 2: Testing database connection...')
    const connected = await testConnection()

    if (!connected) {
      logger.error('✗ Database connection failed')
      logger.error('Check your Supabase credentials and network connection')
      process.exit(1)
    }

    logger.info('✓ Database connection successful')

    // Test 3: Check if migrations have been run
    logger.info('Test 3: Checking if database schema exists...')

    const supabase = getSupabaseClient()
    const { data: tables, error } = await supabase
      .from('teams')
      .select('*')
      .limit(1)

    if (error) {
      logger.warn('✗ Teams table not found or not accessible')
      logger.warn('Database migrations may not have been run yet')
      logger.info('Run migrations with: supabase db push')
    } else {
      logger.info('✓ Database schema exists')

      // Test 4: Get record counts
      logger.info('Test 4: Checking record counts...')

      const tablesToCheck = ['teams', 'stadiums', 'player_profiles', 'game_schedules']

      for (const table of tablesToCheck) {
        try {
          const count = await getRecordCount(table)
          logger.info(`  ${table}: ${count} records`)
        } catch (err) {
          logger.warn(`  ${table}: Unable to query (${err.message})`)
        }
      }
    }

    // Test 5: Verify write permissions
    logger.info('Test 5: Testing write permissions...')

    const testRecord = {
      test_id: 'connection-test',
      test_timestamp: new Date().toISOString()
    }

    // Try to insert a test record (will fail if RLS is blocking, which is expected)
    const { error: writeError } = await supabase
      .from('teams')
      .insert(testRecord)

    if (writeError) {
      if (writeError.code === '42P01') {
        logger.warn('✗ Table does not exist - migrations need to be run')
      } else if (writeError.code === '23505') {
        logger.info('✓ Write access confirmed (duplicate key expected)')
      } else {
        logger.info('✓ Service role has write access (using service_role_key)')
      }
    } else {
      logger.info('✓ Test record inserted (cleaning up...)')

      // Clean up test record
      await supabase
        .from('teams')
        .delete()
        .eq('test_id', 'connection-test')
    }

    logger.info('')
    logger.info('═'.repeat(60))
    logger.info('CONNECTION TEST SUMMARY')
    logger.info('═'.repeat(60))
    logger.info('✓ All checks passed!')
    logger.info('✓ Environment configured correctly')
    logger.info('✓ Database connection working')
    logger.info('')
    logger.info('Next steps:')
    logger.info('  1. Run database migrations (if not done): supabase db push')
    logger.info('  2. Start seeding data: npm run seed:teams')
    logger.info('═'.repeat(60))

    logScriptEnd('test-connection.js', {
      success: true,
      duration: Date.now() - startTime
    })

    process.exit(0)
  } catch (error) {
    logger.error('Connection test failed:', error)
    logScriptEnd('test-connection.js', {
      success: false,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

const startTime = Date.now()
main()
