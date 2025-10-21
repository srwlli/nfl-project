import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function checkTeams() {
  const { data } = await supabase
    .from('player_game_stats')
    .select('team_id')
    .eq('season', 2025)

  const teams = [...new Set(data.map(d => d.team_id))].sort()

  console.log(`Found ${teams.length} unique teams with player stats:`)
  console.log(teams.join(', '))

  console.log('\n\nTeams missing from player_game_stats:')
  const allTeams = ['ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LAC', 'LAR', 'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WSH']
  const missing = allTeams.filter(t => !teams.includes(t))
  console.log(missing.join(', '))

  process.exit(0)
}

checkTeams()
