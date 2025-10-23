import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function checkDataAvailability() {
  // Check completed games by week
  const { data: games } = await supabase
    .from('games')
    .select('game_id, week, status, home_team_id, away_team_id')
    .eq('season', 2025)
    .order('week')

  const weekSummary = {}
  games.forEach(g => {
    if (!weekSummary[g.week]) {
      weekSummary[g.week] = { total: 0, final: 0, teams: new Set() }
    }
    weekSummary[g.week].total++
    if (g.status === 'final') {
      weekSummary[g.week].final++
      weekSummary[g.week].teams.add(g.home_team_id)
      weekSummary[g.week].teams.add(g.away_team_id)
    }
  })

  console.log('\nWeek-by-Week Game Completion:')
  console.log('─'.repeat(60))
  Object.entries(weekSummary).forEach(([week, data]) => {
    console.log(`Week ${week.padStart(2)}: ${data.final}/${data.total} complete (${data.teams.size} teams)`)
  })

  // Check player_game_stats by team for recent weeks
  console.log('\n\nPlayer Stats Availability for Week 4-6:')
  console.log('─'.repeat(60))

  const teams = ['HOU', 'SEA', 'TB', 'DET']

  for (const team of teams) {
    const { data: stats } = await supabase
      .from('player_game_stats')
      .select('game_id, player_id, position')
      .eq('team_id', team)
      .eq('season', 2025)
      .in('position', ['QB', 'RB', 'WR', 'TE'])

    if (stats && stats.length > 0) {
      // Get unique players and game count
      const uniquePlayers = new Set(stats.map(s => s.player_id))
      const uniqueGames = new Set(stats.map(s => s.game_id))

      console.log(`${team}: ${uniquePlayers.size} players, ${uniqueGames.size} games, ${stats.length} total records`)
    } else {
      console.log(`${team}: No player stats found`)
    }
  }

  // Check specific game IDs for weeks 4-6
  console.log('\n\nGames in Weeks 4-6:')
  console.log('─'.repeat(60))

  const { data: recentGames } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, status')
    .eq('season', 2025)
    .gte('week', 4)
    .lte('week', 6)
    .order('week')

  recentGames.forEach(g => {
    console.log(`Week ${g.week}: ${g.away_team_id} @ ${g.home_team_id} - ${g.status} (${g.game_id})`)
  })
}

checkDataAvailability()
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
