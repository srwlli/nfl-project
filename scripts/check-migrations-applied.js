/**
 * Check if Phase 1 migrations have been applied
 */

import { getSupabaseClient } from './utils/supabase-client.js'

async function checkMigrations() {
  console.log('Checking if Phase 1 migrations are applied...\n')

  const supabase = getSupabaseClient()

  // Check for fantasy_points_ppr column (migration 20250101000020)
  const { data: playerStats, error: statsError } = await supabase
    .from('player_game_stats')
    .select('fantasy_points_ppr, passing_sacks, qbr, epa_total, snaps_played')
    .limit(1)

  if (statsError) {
    console.log('❌ Migration 20250101000020 NOT applied')
    console.log('   Error:', statsError.message)
    console.log('   Run: Apply migration 20250101000020_enhance_player_game_stats.sql to Supabase\n')
  } else {
    console.log('✅ Migration 20250101000020 applied (player_game_stats enhanced)\n')
  }

  // Check for weekly_stat_leaders table (migration 20250101000021)
  const { data: weeklyLeaders, error: weeklyError } = await supabase
    .from('weekly_stat_leaders')
    .select('*')
    .limit(1)

  if (weeklyError && weeklyError.message.includes('does not exist')) {
    console.log('❌ Migration 20250101000021 NOT applied')
    console.log('   Error:', weeklyError.message)
    console.log('   Run: Apply migration 20250101000021_create_weekly_aggregation_tables.sql to Supabase\n')
  } else if (weeklyError) {
    console.log('⚠️  Migration 20250101000021 may be partially applied')
    console.log('   Error:', weeklyError.message)
  } else {
    console.log('✅ Migration 20250101000021 applied (weekly aggregation tables exist)\n')
  }

  // Summary
  const migration1Applied = !statsError
  const migration2Applied = !weeklyError || !weeklyError.message.includes('does not exist')

  console.log('\n=== SUMMARY ===')
  if (migration1Applied && migration2Applied) {
    console.log('✅ All Phase 1 migrations applied - Ready for testing!')
    console.log('\nNext step: npm run scrape:game-stats -- --game=401772510')
  } else {
    console.log('❌ Migrations need to be applied to Supabase')
    console.log('\nApply these migrations in order:')
    if (!migration1Applied) {
      console.log('1. supabase/migrations/20250101000020_enhance_player_game_stats.sql')
    }
    if (!migration2Applied) {
      console.log('2. supabase/migrations/20250101000021_create_weekly_aggregation_tables.sql')
    }
  }
}

checkMigrations()
  .catch(error => {
    console.error('Error checking migrations:', error)
    process.exit(1)
  })
