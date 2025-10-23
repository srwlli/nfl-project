import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function checkActualResults() {
  const gameId = 'espn-401772850' // DAL @ NYJ Week 5

  console.log('='.repeat(80))
  console.log('ACTUAL RESULTS: DAL @ NYJ (Week 5)')
  console.log('='.repeat(80))

  // Get game info
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('game_id', gameId)
    .single()

  console.log(`\nFinal Score: DAL ${game.away_team_score} - NYJ ${game.home_team_score}`)

  // Get top performers with player names
  const { data: stats } = await supabase
    .from('player_game_stats')
    .select(`
      player_id,
      passing_yards,
      rushing_yards,
      receiving_yards,
      receiving_receptions,
      fantasy_points_ppr,
      players!inner(full_name, primary_position)
    `)
    .eq('game_id', gameId)
    .eq('season', 2025)
    .gt('fantasy_points_ppr', 5)
    .order('fantasy_points_ppr', { ascending: false })

  console.log('\nTOP PERFORMERS (>5 fantasy pts):')
  console.log('─'.repeat(80))

  stats.forEach(s => {
    const player = s.players
    let statLine = ''

    if (s.passing_yards > 0) {
      statLine = `${s.passing_yards} pass yds`
    } else if (s.rushing_yards > 0 && s.receiving_yards > 0) {
      statLine = `${s.rushing_yards} rush yds, ${s.receiving_yards} rec yds`
    } else if (s.rushing_yards > 0) {
      statLine = `${s.rushing_yards} rush yds`
    } else {
      statLine = `${s.receiving_yards} rec yds (${s.receiving_receptions} rec)`
    }

    console.log(`${player.primary_position.padEnd(3)} ${player.full_name.padEnd(25)} ${statLine.padEnd(30)} ${s.fantasy_points_ppr.toFixed(1)} pts`)
  })

  console.log('\n' + '='.repeat(80))
}

checkActualResults().catch(console.error)
