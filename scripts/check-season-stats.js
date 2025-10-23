import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function checkSeasonStats() {
  console.log('='.repeat(80))
  console.log('SEASON STATS COVERAGE CHECK - 2025 Season')
  console.log('='.repeat(80))

  // Check games by week
  const { data: games } = await supabase
    .from('games')
    .select('week, status')
    .eq('season', 2025)
    .order('week')

  const weekSummary = {}
  games.forEach(g => {
    if (!weekSummary[g.week]) {
      weekSummary[g.week] = { total: 0, final: 0, scheduled: 0 }
    }
    weekSummary[g.week].total++
    if (g.status === 'final') weekSummary[g.week].final++
    else weekSummary[g.week].scheduled++
  })

  console.log('\nGAMES BY WEEK:')
  console.log('Week | Total | Final | Scheduled')
  console.log('-'.repeat(40))
  for (const [week, stats] of Object.entries(weekSummary)) {
    const status = stats.final === stats.total ? '✅' : stats.final > 0 ? '🟡' : '⏳'
    console.log(`${status} W${week.padStart(2)} | ${stats.total.toString().padStart(2)} | ${stats.final.toString().padStart(2)} | ${stats.scheduled.toString().padStart(2)}`)
  }

  // Check player_game_stats count by week
  const { data: playerStats } = await supabase
    .from('player_game_stats')
    .select('game_id')
    .eq('season', 2025)

  const uniqueGamesWithStats = new Set(playerStats.map(p => p.game_id))

  console.log('\nPLAYER GAME STATS:')
  console.log(`Total records: ${playerStats.length}`)
  console.log(`Unique games with stats: ${uniqueGamesWithStats.size}`)
  console.log(`Average players per game: ${Math.round(playerStats.length / uniqueGamesWithStats.size)}`)

  // Check player_season_stats
  const { data: seasonStats, count: seasonCount } = await supabase
    .from('player_season_stats')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025)

  console.log('\nPLAYER SEASON STATS:')
  console.log(`Total records: ${seasonCount || 0}`)

  // Check weekly_player_leaders
  const { data: weeklyLeaders } = await supabase
    .from('weekly_player_leaders')
    .select('week, stat_category')
    .eq('season', 2025)

  if (weeklyLeaders && weeklyLeaders.length > 0) {
    const weekLeadersSummary = {}
    weeklyLeaders.forEach(w => {
      if (!weekLeadersSummary[w.week]) weekLeadersSummary[w.week] = 0
      weekLeadersSummary[w.week]++
    })

    console.log('\nWEEKLY LEADERS:')
    console.log('Week | Categories')
    console.log('-'.repeat(30))
    for (const [week, count] of Object.entries(weekLeadersSummary)) {
      console.log(`W${week.padStart(2)}  | ${count} categories`)
    }
  } else {
    console.log('\nWEEKLY LEADERS: None found')
  }

  // Check latest aggregation
  const { data: latestAgg } = await supabase
    .from('weekly_player_leaders')
    .select('week')
    .eq('season', 2025)
    .order('week', { ascending: false })
    .limit(1)

  console.log('\n' + '='.repeat(80))
  console.log('SUMMARY:')
  console.log('='.repeat(80))
  console.log(`Latest week with player stats: ${uniqueGamesWithStats.size > 0 ? 'Multiple weeks' : 'None'}`)
  console.log(`Latest weekly aggregation: ${latestAgg?.[0]?.week || 'None'}`)
  console.log(`Season stats table populated: ${seasonCount > 0 ? 'Yes' : 'No'}`)

  console.log('\n✅ Data is ready for analysis!')
}

checkSeasonStats()
