/**
 * Apply Phase 1 migrations directly to Supabase using pg client
 */

import pkg from 'pg'
const { Client } = pkg
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load environment variables
dotenv.config({ path: '.env.local' })

async function applyMigrations() {
  // Construct connection string from Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local')
    process.exit(1)
  }

  // Extract project ref from Supabase URL (e.g., https://edzkyqjbpcclefqxnrgo.supabase.co)
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

  if (!projectRef) {
    console.error('❌ Could not extract project ref from Supabase URL')
    process.exit(1)
  }

  // Construct PostgreSQL connection string
  const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD || 'password')}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

  console.log('🚀 Applying Phase 1 migrations to Supabase...')
  console.log(`   Project: ${projectRef}`)
  console.log('')

  const client = new Client({ connectionString })

  try {
    await client.connect()
    console.log('✅ Connected to Supabase database\n')

    // Migration 1: Enhance player_game_stats
    console.log('📝 Migration 1: 20250101000020_enhance_player_game_stats.sql')
    const migration1Path = join(__dirname, '../supabase/migrations/20250101000020_enhance_player_game_stats.sql')
    const migration1SQL = readFileSync(migration1Path, 'utf-8')

    await client.query(migration1SQL)
    console.log('   ✅ Applied successfully (44 columns added)\n')

    // Migration 2: Create weekly aggregation tables
    console.log('📝 Migration 2: 20250101000021_create_weekly_aggregation_tables.sql')
    const migration2Path = join(__dirname, '../supabase/migrations/20250101000021_create_weekly_aggregation_tables.sql')
    const migration2SQL = readFileSync(migration2Path, 'utf-8')

    await client.query(migration2SQL)
    console.log('   ✅ Applied successfully (3 tables + 3 views created)\n')

    console.log('=== SUMMARY ===')
    console.log('✅ All Phase 1 migrations applied successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Run: node scripts/check-migrations-applied.js')
    console.log('2. Test: npm run scrape:game-stats -- --game=401772510')
    console.log('3. Backfill: npm run scrape:game-stats -- --week=2')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

applyMigrations()
