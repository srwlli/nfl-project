import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function diagnoseMissingStats() {
  const missingTeams = ['CHI', 'DEN', 'DET', 'HOU', 'IND', 'KC', 'LAC', 'MIN', 'TB']

  console.log('Diagnosing why teams are missing player_game_stats...\n')

  for (const team of missingTeams) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Team: ${team}`)
    console.log('='.repeat(60))

    // Check games for this team
    const { data: games } = await supabase
      .from('games')
      .select('game_id, week, home_team_id, away_team_id, status, home_score, away_score')
      .eq('season', 2025)
      .or(`home_team_id.eq.${team},away_team_id.eq.${team}`)
      .eq('status', 'final')
      .order('week')

    console.log(`\nCompleted games: ${games?.length || 0}`)

    if (games && games.length > 0) {
      console.log('\nGames:')
      for (const g of games.slice(0, 3)) {
        console.log(`  Week ${g.week}: ${g.away_team_id} @ ${g.home_team_id} (${g.away_score}-${g.home_score}) - ${g.game_id}`)

        // Check if this game has ANY player stats
        const { count: statsCount } = await supabase
          .from('player_game_stats')
          .select('*', { count: 'exact', head: true })
          .eq('game_id', g.game_id)
          .eq('season', 2025)

        console.log(`    Player stats in DB: ${statsCount}`)

        if (statsCount === 0) {
          // Check team_game_stats
          const { data: teamStats } = await supabase
            .from('team_game_stats')
            .select('team_id, total_yards')
            .eq('game_id', g.game_id)
            .eq('season', 2025)

          console.log(`    Team stats in DB: ${teamStats?.length || 0}`)
        }
      }
    } else {
      console.log('  No completed games found')
    }
  }

  console.log('\n\n' + '='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))

  // Check a game that DOES have stats
  const { data: workingTeamGames } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id')
    .eq('season', 2025)
    .or('home_team_id.eq.PHI,away_team_id.eq.PHI')
    .eq('status', 'final')
    .limit(1)

  if (workingTeamGames && workingTeamGames.length > 0) {
    const sampleGame = workingTeamGames[0]

    const { count: sampleStats } = await supabase
      .from('player_game_stats')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', sampleGame.game_id)
      .eq('season', 2025)

    console.log(`\nComparison - PHI game ${sampleGame.game_id}:`)
    console.log(`  Week ${sampleGame.week}: ${sampleGame.away_team_id} @ ${sampleGame.home_team_id}`)
    console.log(`  Player stats: ${sampleStats}`)
  }
}

diagnoseMissingStats()
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
