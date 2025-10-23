import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function checkData() {
  const {count: tbCount} = await supabase
    .from('player_game_stats')
    .select('*', {count: 'exact', head: true})
    .eq('team_id', 'TB')
    .eq('season', 2025)

  const {count: seaCount} = await supabase
    .from('player_game_stats')
    .select('*', {count: 'exact', head: true})
    .eq('team_id', 'SEA')
    .eq('season', 2025)

  console.log(`TB player stats: ${tbCount}`)
  console.log(`SEA player stats: ${seaCount}`)

  // Check which weeks
  const {data: tbWeeks} = await supabase
    .from('games')
    .select('game_id, week')
    .eq('season', 2025)
    .or('home_team_id.eq.TB,away_team_id.eq.TB')
    .order('week')

  const {data: tbStats} = await supabase
    .from('player_game_stats')
    .select('game_id')
    .eq('team_id', 'TB')
    .eq('season', 2025)

  const tbGameIds = new Set(tbStats?.map(s => s.game_id) || [])

  console.log('\nTB games and stats:')
  tbWeeks?.forEach(g => {
    const hasStats = tbGameIds.has(g.game_id)
    console.log(`  Week ${g.week}: ${g.game_id} - ${hasStats ? '✓ HAS STATS' : '✗ NO STATS'}`)
  })

  process.exit(0)
}

checkData()
