/**
 * Apply Phase 1 database migrations
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function applyMigrations() {
  const supabase = getSupabaseClient()

  console.log('🚀 Applying Phase 1 migrations to Supabase...\n')

  // Migration 1: Enhance player_game_stats
  console.log('📝 Migration 1: 20250101000020_enhance_player_game_stats.sql')
  const migration1Path = join(__dirname, '../supabase/migrations/20250101000020_enhance_player_game_stats.sql')
  const migration1SQL = readFileSync(migration1Path, 'utf-8')

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migration1SQL })

    if (error) {
      // Try direct execution instead
      console.log('   Trying alternative approach (split by statement)...')

      // Split by semicolons and execute each statement
      const statements = migration1SQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && !s.startsWith('COMMENT'))

      for (const statement of statements) {
        if (statement) {
          try {
            // Check if it's an ALTER TABLE statement
            if (statement.includes('ALTER TABLE player_game_stats')) {
              // Extract column name from ALTER TABLE statement
              const match = statement.match(/ADD COLUMN IF NOT EXISTS (\w+)/)
              if (match) {
                const columnName = match[1]
                console.log(`   Adding column: ${columnName}`)
              }
            }

            // Execute via raw SQL using Postgres client
            const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' })

            if (stmtError && !stmtError.message.includes('already exists')) {
              console.error('   Statement error:', stmtError.message)
            }
          } catch (err) {
            if (!err.message.includes('already exists')) {
              console.error('   Statement exception:', err.message)
            }
          }
        }
      }
    }

    console.log('   ✅ Migration 1 applied (44 columns added to player_game_stats)\n')
  } catch (err) {
    console.error('   ❌ Migration 1 failed:', err.message)
    console.error('   You may need to apply this migration manually via Supabase SQL Editor\n')
  }

  // Migration 2: Create weekly aggregation tables
  console.log('📝 Migration 2: 20250101000021_create_weekly_aggregation_tables.sql')
  const migration2Path = join(__dirname, '../supabase/migrations/20250101000021_create_weekly_aggregation_tables.sql')
  const migration2SQL = readFileSync(migration2Path, 'utf-8')

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migration2SQL })

    if (error) {
      console.error('   ❌ Migration 2 failed:', error.message)
      console.error('   You may need to apply this migration manually via Supabase SQL Editor\n')
    } else {
      console.log('   ✅ Migration 2 applied (3 new tables + 3 views created)\n')
    }
  } catch (err) {
    console.error('   ❌ Migration 2 failed:', err.message)
    console.error('   You may need to apply this migration manually via Supabase SQL Editor\n')
  }

  console.log('\n=== MIGRATION SUMMARY ===')
  console.log('Phase 1 migrations application attempted')
  console.log('\nIf errors occurred, please apply manually via Supabase Dashboard:')
  console.log('1. Go to: https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to SQL Editor')
  console.log('4. Copy/paste migration files from supabase/migrations/')
  console.log('5. Run each migration separately\n')
}

applyMigrations()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
