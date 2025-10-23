/**
 * Check games by week
 */

import { getSupabaseClient } from './utils/supabase-client.js'

async function checkGames() {
  const supabase = getSupabaseClient()

  const { data: games } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, status')
    .eq('season', 2025)
    .eq('status', 'final')
    .order('week', { ascending: true })

  console.log('Final games by week:\n')

  const byWeek = games.reduce((acc, g) => {
    acc[g.week] = (acc[g.week] || 0) + 1
    return acc
  }, {})

  Object.entries(byWeek).forEach(([week, count]) => {
    console.log(`  Week ${week}: ${count} games`)
  })

  console.log(`\nTotal: ${games.length} final games`)

  // Check if any are missing stats
  const { data: gamesWithStats } = await supabase
    .from('team_game_stats')
    .select('game_id')
    .eq('season', 2025)

  const gameIdsWithStats = new Set(gamesWithStats.map(g => g.game_id))
  const missingStats = games.filter(g => !gameIdsWithStats.has(g.game_id))

  if (missingStats.length > 0) {
    console.log(`\n⚠️  ${missingStats.length} games missing stats:`)
    missingStats.forEach(g => {
      console.log(`  - Week ${g.week}: ${g.game_id} (${g.away_team_id} @ ${g.home_team_id})`)
    })
  } else {
    console.log('\n✅ All final games have stats!')
  }
}

checkGames()
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
