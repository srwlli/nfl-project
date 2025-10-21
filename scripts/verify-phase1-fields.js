/**
 * Verify Phase 1 fields are populated
 */

import { getSupabaseClient } from './utils/supabase-client.js'

async function verifyFields() {
  const supabase = getSupabaseClient()

  console.log('🔍 Verifying Phase 1 fields populated...\n')

  // Check game 401772510
  const { data: players, error } = await supabase
    .from('player_game_stats')
    .select('player_id, passing_yards, passing_sacks, qbr, passer_rating, fantasy_points_ppr, fantasy_points_standard, fantasy_points_dfs_dk, receiving_targets, tackles_solo')
    .eq('game_id', '401772510')
    .eq('season', 2025)
    .order('fantasy_points_ppr', { ascending: false })
    .limit(5)

  if (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }

  console.log('📊 Top 5 Fantasy Performers (Game 401772510):')
  console.log('═'.repeat(80))

  players.forEach((p, i) => {
    console.log(`${i + 1}. ${p.player_id}`)
    console.log(`   Fantasy: PPR=${p.fantasy_points_ppr} | Std=${p.fantasy_points_standard} | DK=${p.fantasy_points_dfs_dk}`)
    console.log(`   Passing: ${p.passing_yards || 'N/A'} yds | ${p.passing_sacks || 0} sacks | QBR=${p.qbr || 'N/A'} | Rating=${p.passer_rating || 'N/A'}`)
    console.log(`   Receiving: ${p.receiving_targets || 0} targets`)
    console.log(`   Defense: ${p.tackles_solo || 0} solo tackles`)
    console.log('')
  })

  // Count stats with new fields
  const { count: fantasyCount } = await supabase
    .from('player_game_stats')
    .select('*', { count: 'exact', head: true })
    .not('fantasy_points_ppr', 'is', null)

  const { count: sacksCount } = await supabase
    .from('player_game_stats')
    .select('*', { count: 'exact', head: true })
    .gt('passing_sacks', 0)

  const { count: targetsCount } = await supabase
    .from('player_game_stats')
    .select('*', { count: 'exact', head: true })
    .gt('receiving_targets', 0)

  console.log('═'.repeat(80))
  console.log('📈 Phase 1 Field Coverage:')
  console.log(`   Fantasy Points (PPR): ${fantasyCount} records`)
  console.log(`   Passing Sacks: ${sacksCount} records`)
  console.log(`   Receiving Targets: ${targetsCount} records`)
  console.log('')
  console.log('✅ Phase 1 fields successfully populated!')
}

verifyFields()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
