/**
 * Check current stats status in database
 */

import { getSupabaseClient } from './scripts/utils/supabase-client.js'
import { logger } from './scripts/utils/logger.js'

async function checkStatsStatus() {
  const supabase = getSupabaseClient()

  console.log('\n=== NFL STATS STATUS CHECK ===\n')

  // Check latest completed game
  const { data: latestGame } = await supabase
    .from('games')
    .select('game_date, week, home_team, away_team, home_score, away_score, status')
    .eq('status', 'completed')
    .order('game_date', { ascending: false })
    .limit(1)
    .single()

  console.log('📅 Latest Completed Game:')
  if (latestGame) {
    console.log(`   Week ${latestGame.week}: ${latestGame.away_team} @ ${latestGame.home_team}`)
    console.log(`   Score: ${latestGame.away_score}-${latestGame.home_score}`)
    console.log(`   Date: ${latestGame.game_date}`)
  }

  // Count stats records
  const { count: playerStatsCount } = await supabase
    .from('player_game_stats')
    .select('*', { count: 'exact', head: true })

  const { count: teamStatsCount } = await supabase
    .from('team_game_stats')
    .select('*', { count: 'exact', head: true })

  const { count: scoringPlaysCount } = await supabase
    .from('scoring_plays')
    .select('*', { count: 'exact', head: true })

  console.log('\n📊 Stats Counts:')
  console.log(`   Player game stats: ${playerStatsCount}`)
  console.log(`   Team game stats: ${teamStatsCount}`)
  console.log(`   Scoring plays: ${scoringPlaysCount}`)

  // Get most recent stats update
  const { data: latestPlayerStat } = await supabase
    .from('player_game_stats')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  console.log('\n⏰ Last Stats Update:')
  console.log(`   ${latestPlayerStat?.created_at || 'Never'}`)

  // Check upcoming games
  const { data: upcomingGames, count: upcomingCount } = await supabase
    .from('games')
    .select('game_date, week, home_team, away_team, status', { count: 'exact' })
    .in('status', ['scheduled', 'in_progress'])
    .order('game_date', { ascending: true })
    .limit(5)

  console.log(`\n📆 Upcoming Games (${upcomingCount} total):`)
  upcomingGames?.forEach(game => {
    console.log(`   Week ${game.week}: ${game.away_team} @ ${game.home_team} (${game.game_date}) - ${game.status}`)
  })

  // Check completed games count
  const { count: completedCount } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')

  const { count: totalGames } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })

  console.log(`\n🏈 Season Progress:`)
  console.log(`   Completed: ${completedCount}/${totalGames} games`)
  console.log(`   Percentage: ${((completedCount / totalGames) * 100).toFixed(1)}%`)

  // Check if stats match completed games
  const expectedTeamStats = completedCount * 2 // 2 teams per game
  console.log(`\n✅ Data Integrity:`)
  console.log(`   Expected team stats: ${expectedTeamStats}`)
  console.log(`   Actual team stats: ${teamStatsCount}`)
  console.log(`   Coverage: ${teamStatsCount >= expectedTeamStats ? '✅ Complete' : '⚠️ Missing data'}`)

  // Check injuries
  const { count: injuryCount } = await supabase
    .from('player_injury_status')
    .select('*', { count: 'exact', head: true })

  console.log(`\n🏥 Injury Reports:`)
  console.log(`   Active injuries: ${injuryCount}`)

  // Check roster transactions
  const { count: transactionCount } = await supabase
    .from('roster_transactions')
    .select('*', { count: 'exact', head: true })

  console.log(`\n🔄 Roster Transactions:`)
  console.log(`   Total transactions: ${transactionCount}`)

  console.log('\n')
}

checkStatsStatus()
  .catch(err => {
    logger.error('Stats check failed:', err)
    process.exit(1)
  })
