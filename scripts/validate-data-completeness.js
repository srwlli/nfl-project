/**
 * Validate Phase 1 Data Completeness
 */

import { getSupabaseClient } from './utils/supabase-client.js'

async function validateCompleteness() {
  const supabase = getSupabaseClient()

  console.log('🔍 Validating Phase 1 Data Completeness...\n')

  // 1. Count player game stats with fantasy points
  const { count: fantasyCount } = await supabase
    .from('player_game_stats')
    .select('*', { count: 'exact', head: true })
    .not('fantasy_points_ppr', 'is', null)
    .eq('season', 2025)

  console.log(`1. Player Game Stats with Fantasy Points: ${fantasyCount}`)

  // 2. Count weekly leaders
  const { count: leadersCount } = await supabase
    .from('weekly_stat_leaders')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025)

  console.log(`2. Weekly Stat Leaders: ${leadersCount}`)

  // 3. Count season cumulative stats
  const { count: cumulativeCount } = await supabase
    .from('player_season_cumulative_stats')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025)

  console.log(`3. Season Cumulative Stats: ${cumulativeCount}`)

  // 4. Count games by status
  const { data: gameStats } = await supabase
    .from('games')
    .select('status')
    .eq('season', 2025)

  const statusCounts = gameStats.reduce((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1
    return acc
  }, {})

  console.log(`\n4. Games by Status:`)
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`)
  })

  // 5. Count team game stats
  const { count: teamStatsCount } = await supabase
    .from('team_game_stats')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025)

  console.log(`\n5. Team Game Stats: ${teamStatsCount}`)

  // 6. Count scoring plays
  const { count: scoringPlaysCount } = await supabase
    .from('scoring_plays')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025)

  console.log(`6. Scoring Plays: ${scoringPlaysCount}`)

  // 7. Sample top fantasy performers
  const { data: topPerformers } = await supabase
    .from('player_game_stats')
    .select('player_id, fantasy_points_ppr, passing_yards, rushing_yards, receiving_yards')
    .eq('season', 2025)
    .order('fantasy_points_ppr', { ascending: false })
    .limit(5)

  console.log(`\n7. Top 5 Fantasy Performers (PPR):`)
  topPerformers.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.player_id}: ${p.fantasy_points_ppr} pts (Pass: ${p.passing_yards || 0}, Rush: ${p.rushing_yards || 0}, Rec: ${p.receiving_yards || 0})`)
  })

  // 8. Check for missing data
  const { data: gamesWithoutStats } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id')
    .eq('season', 2025)
    .eq('status', 'final')
    .order('week', { ascending: true })

  const gamesWithStatsSet = new Set()
  const { data: teamStatsGames } = await supabase
    .from('team_game_stats')
    .select('game_id')
    .eq('season', 2025)

  teamStatsGames.forEach(g => gamesWithStatsSet.add(g.game_id))

  const missingStats = gamesWithoutStats.filter(g => !gamesWithStatsSet.has(g.game_id))

  console.log(`\n8. Data Completeness:`)
  console.log(`   Total final games: ${gamesWithoutStats.length}`)
  console.log(`   Games with stats: ${gamesWithStatsSet.size}`)
  console.log(`   Missing stats: ${missingStats.length}`)

  if (missingStats.length > 0 && missingStats.length <= 10) {
    console.log(`\n   Missing game IDs:`)
    missingStats.forEach(g => {
      console.log(`     - Game ${g.game_id} (Week ${g.week}): ${g.away_team_id} @ ${g.home_team_id}`)
    })
  }

  // Summary
  console.log(`\n${'═'.repeat(80)}`)
  console.log('📊 PHASE 1 DATA COMPLETENESS SUMMARY')
  console.log('═'.repeat(80))
  console.log(`✅ Player Game Stats: ${fantasyCount} records with fantasy points`)
  console.log(`✅ Weekly Leaders: ${leadersCount} records`)
  console.log(`✅ Season Cumulative: ${cumulativeCount} player records`)
  console.log(`✅ Team Stats: ${teamStatsCount} records`)
  console.log(`✅ Scoring Plays: ${scoringPlaysCount} records`)
  console.log(`⚠️  Games Missing Stats: ${missingStats.length}/${gamesWithoutStats.length} (${Math.round(gamesWithStatsSet.size / gamesWithoutStats.length * 100)}% coverage)`)
  console.log('═'.repeat(80))

  const overallStatus = missingStats.length < 10 ? '✅ EXCELLENT' : missingStats.length < 20 ? '✅ GOOD' : '⚠️  NEEDS ATTENTION'
  console.log(`\nOverall Status: ${overallStatus}`)

  if (missingStats.length > 0) {
    console.log(`\nRecommendation: Run roster updates, then re-scrape missing games`)
    console.log(`Command: npm run scrape:roster && npm run scrape:game-stats -- --week=X`)
  } else {
    console.log(`\n🎉 All completed games have stats! Phase 1 deployment is COMPLETE.`)
  }
}

validateCompleteness()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
