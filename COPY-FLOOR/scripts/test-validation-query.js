import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function test() {
  // Get a Week 4 game
  const { data: games } = await supabase
    .from('games')
    .select('game_id, week')
    .eq('season', 2025)
    .eq('week', 4)
    .eq('status', 'final')
    .limit(1)

  console.log('Game:', games[0])

  // Try to get player stats with join
  const { data: stats, error } = await supabase
    .from('player_game_stats')
    .select(`
      player_id,
      passing_yards,
      players!inner(primary_position)
    `)
    .eq('game_id', games[0].game_id)
    .eq('season', 2025)
    .limit(5)

  console.log('Stats:', stats)
  console.log('Error:', error)
  console.log('Count:', stats?.length)
}

test()
