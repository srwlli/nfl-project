/**
 * Apply Phase 1 Migration 20250101000020
 * Adds 44 columns to player_game_stats table
 *
 * This script executes ALTER TABLE statements via Supabase client
 */

import { getSupabaseClient } from './utils/supabase-client.js'

async function applyMigration() {
  const supabase = getSupabaseClient()

  console.log('🚀 Applying Migration 20250101000020: Enhance player_game_stats\n')
  console.log('   Adding 44 new columns...\n')

  // Define all columns to add
  const columns = [
    // Passing Advanced (5)
    { name: 'passing_sacks', type: 'INTEGER DEFAULT 0' },
    { name: 'passing_sack_yards_lost', type: 'INTEGER DEFAULT 0' },
    { name: 'passing_longest', type: 'INTEGER DEFAULT 0' },
    { name: 'passer_rating', type: 'DECIMAL(5,2)' },
    { name: 'qbr', type: 'DECIMAL(5,2)' },

    // Rushing Advanced (4)
    { name: 'rushing_longest', type: 'INTEGER DEFAULT 0' },
    { name: 'rushing_fumbles', type: 'INTEGER DEFAULT 0' },
    { name: 'rushing_fumbles_lost', type: 'INTEGER DEFAULT 0' },
    { name: 'rushing_yards_after_contact', type: 'INTEGER DEFAULT 0' },

    // Receiving Advanced (5)
    { name: 'receiving_targets', type: 'INTEGER DEFAULT 0' },
    { name: 'receiving_longest', type: 'INTEGER DEFAULT 0' },
    { name: 'receiving_yards_after_catch', type: 'INTEGER DEFAULT 0' },
    { name: 'receiving_first_downs', type: 'INTEGER DEFAULT 0' },
    { name: 'receiving_fumbles', type: 'INTEGER DEFAULT 0' },

    // Defense Advanced (7)
    { name: 'tackles_solo', type: 'INTEGER DEFAULT 0' },
    { name: 'tackles_assists', type: 'INTEGER DEFAULT 0' },
    { name: 'tackles_for_loss', type: 'DECIMAL(5,1) DEFAULT 0' },
    { name: 'qb_hits', type: 'INTEGER DEFAULT 0' },
    { name: 'passes_defended', type: 'INTEGER DEFAULT 0' },
    { name: 'forced_fumbles', type: 'INTEGER DEFAULT 0' },
    { name: 'fumble_recoveries', type: 'INTEGER DEFAULT 0' },

    // Kicking Advanced (3)
    { name: 'field_goal_longest', type: 'INTEGER DEFAULT 0' },
    { name: 'extra_points_made', type: 'INTEGER DEFAULT 0' },
    { name: 'extra_points_attempted', type: 'INTEGER DEFAULT 0' },

    // Punting (6)
    { name: 'punts', type: 'INTEGER DEFAULT 0' },
    { name: 'punt_yards', type: 'INTEGER DEFAULT 0' },
    { name: 'punt_average', type: 'DECIMAL(5,2)' },
    { name: 'punts_inside_20', type: 'INTEGER DEFAULT 0' },
    { name: 'punt_longest', type: 'INTEGER DEFAULT 0' },
    { name: 'punt_touchbacks', type: 'INTEGER DEFAULT 0' },

    // Fantasy Points (5)
    { name: 'fantasy_points_standard', type: 'DECIMAL(5,2)' },
    { name: 'fantasy_points_ppr', type: 'DECIMAL(5,2)' },
    { name: 'fantasy_points_half_ppr', type: 'DECIMAL(5,2)' },
    { name: 'fantasy_points_dfs_dk', type: 'DECIMAL(5,2)' },
    { name: 'fantasy_points_dfs_fd', type: 'DECIMAL(5,2)' },

    // nflverse EPA (6)
    { name: 'epa_total', type: 'DECIMAL(6,3)' },
    { name: 'epa_pass', type: 'DECIMAL(6,3)' },
    { name: 'epa_rush', type: 'DECIMAL(6,3)' },
    { name: 'epa_receive', type: 'DECIMAL(6,3)' },
    { name: 'success_rate', type: 'DECIMAL(5,2)' },
    { name: 'cpoe', type: 'DECIMAL(5,2)' },

    // Opportunity Metrics (8)
    { name: 'snaps_played', type: 'INTEGER DEFAULT 0' },
    { name: 'snaps_total', type: 'INTEGER DEFAULT 0' },
    { name: 'snap_percentage', type: 'DECIMAL(5,2)' },
    { name: 'routes_run', type: 'INTEGER DEFAULT 0' },
    { name: 'route_participation_pct', type: 'DECIMAL(5,2)' },
    { name: 'red_zone_touches', type: 'INTEGER DEFAULT 0' },
    { name: 'red_zone_targets', type: 'INTEGER DEFAULT 0' },
    { name: 'end_zone_targets', type: 'INTEGER DEFAULT 0' }
  ]

  let successCount = 0
  let alreadyExist = 0
  let failCount = 0

  // Try to add each column
  for (const column of columns) {
    const sql = `ALTER TABLE player_game_stats ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`

    try {
      // Use Supabase's sql helper to execute raw SQL
      const { data, error } = await supabase.rpc('exec', { sql_query: sql })

      if (error) {
        // Supabase may not have exec RPC, try alternative approach
        // We'll check if column exists first, then add if needed
        const { data: testData, error: testError } = await supabase
          .from('player_game_stats')
          .select(column.name)
          .limit(1)

        if (testError && testError.message.includes('does not exist')) {
          console.log(`   ⏩ ${column.name} - needs manual addition`)
          failCount++
        } else if (testError) {
          console.log(`   ❌ ${column.name} - error: ${testError.message}`)
          failCount++
        } else {
          console.log(`   ✅ ${column.name} - already exists`)
          alreadyExist++
        }
      } else {
        console.log(`   ✅ ${column.name}`)
        successCount++
      }
    } catch (err) {
      console.log(`   ❌ ${column.name} - exception: ${err.message}`)
      failCount++
    }
  }

  console.log(`\n=== SUMMARY ===`)
  console.log(`Added: ${successCount} columns`)
  console.log(`Already exist: ${alreadyExist} columns`)
  console.log(`Failed/Need manual: ${failCount} columns`)
  console.log(`Total: ${successCount + alreadyExist + failCount}/${columns.length}`)

  if (failCount > 0) {
    console.log(`\n⚠️  ${failCount} columns need manual addition via Supabase SQL Editor`)
    console.log('   Go to: https://supabase.com/dashboard → SQL Editor')
    console.log('   Copy/paste: supabase/migrations/20250101000020_enhance_player_game_stats.sql')
  } else if (successCount + alreadyExist === columns.length) {
    console.log('\n✅ Migration 20250101000020 complete!')
  }
}

applyMigration()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
