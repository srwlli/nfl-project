/**
 * Check game status values
 */

import { getSupabaseClient } from './scripts/utils/supabase-client.js'

async function checkGameStatus() {
  const supabase = getSupabaseClient()

  // Check game statuses
  const { data: allGames } = await supabase
    .from('games')
    .select('status')
    .limit(1000)

  const statusCounts = {}
  allGames?.forEach(g => {
    statusCounts[g.status] = (statusCounts[g.status] || 0) + 1
  })

  console.log('\n=== GAME STATUS BREAKDOWN ===\n')
  console.log('Status counts:')
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`)
  })

  // Check recent games with scores
  const { data: recentGames } = await supabase
    .from('games')
    .select('game_date, week, home_team, away_team, home_score, away_score, status')
    .order('game_date', { ascending: false })
    .limit(15)

  console.log('\n=== RECENT 15 GAMES ===\n')
  recentGames?.forEach(g => {
    const scoreStr = (g.home_score !== null && g.away_score !== null)
      ? `${g.away_score}-${g.home_score}`
      : 'no score'
    console.log(`Week ${g.week} | ${g.game_date} | ${g.away_team} @ ${g.home_team} | ${scoreStr} | ${g.status}`)
  })

  console.log('\n')
}

checkGameStatus().catch(console.error)
