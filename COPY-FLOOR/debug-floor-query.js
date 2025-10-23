import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function debugQuery() {
  const season = 2025
  const gameWeek = 7
  const teamId = 'TB'

  console.log(`Looking for ${teamId} player stats in weeks ${gameWeek - 3} to ${gameWeek - 1}`)

  // Get recent game IDs
  const { data: recentGames } = await supabase
    .from('games')
    .select('game_id, week')
    .eq('season', season)
    .gte('week', Math.max(1, gameWeek - 3))
    .lt('week', gameWeek)
    .order('week')

  console.log('\nGames in range:', recentGames?.map(g => `Week ${g.week}: ${g.game_id}`).join('\n'))

  const recentGameIds = recentGames?.map(g => g.game_id) || []

  console.log(`\nTotal games in range: ${recentGameIds.length}`)

  // Get team roster from recent player_game_stats
  const { data: players } = await supabase
    .from('player_game_stats')
    .select('player_id, team_id, position, game_id')
    .eq('team_id', teamId)
    .eq('season', season)
    .in('game_id', recentGameIds)
    .in('position', ['QB', 'RB', 'WR', 'TE'])

  console.log(`\nPlayer stats found for ${teamId}: ${players?.length || 0}`)

  if (players && players.length > 0) {
    const uniquePlayers = [...new Set(players.map(p => p.player_id))]
    console.log(`Unique players: ${uniquePlayers.length}`)
    console.log('Game IDs with stats:', [...new Set(players.map(p => p.game_id))].join(', '))
  }

  process.exit(0)
}

debugQuery()
