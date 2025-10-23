import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function investigateMissingStats() {
  console.log('='.repeat(80))
  console.log('INVESTIGATING MISSING PLAYER GAME STATS')
  console.log('='.repeat(80))

  // Get all completed games grouped by week
  const { data: completedGames } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, status')
    .eq('season', 2025)
    .eq('status', 'final')
    .order('week')

  console.log(`\nTotal completed games: ${completedGames.length}`)

  // Get all player_game_stats records
  const { data: allPlayerStats } = await supabase
    .from('player_game_stats')
    .select('game_id')
    .eq('season', 2025)

  const gamesWithStats = new Set(allPlayerStats.map(p => p.game_id))

  console.log(`Games with player stats: ${gamesWithStats.size}`)
  console.log(`Games WITHOUT player stats: ${completedGames.length - gamesWithStats.size}\n`)

  // Group by week
  const weekBreakdown = {}

  for (const game of completedGames) {
    const week = game.week
    if (!weekBreakdown[week]) {
      weekBreakdown[week] = {
        total: 0,
        withStats: 0,
        withoutStats: 0,
        gamesWithoutStats: []
      }
    }

    weekBreakdown[week].total++

    if (gamesWithStats.has(game.game_id)) {
      weekBreakdown[week].withStats++
    } else {
      weekBreakdown[week].withoutStats++
      weekBreakdown[week].gamesWithoutStats.push({
        game_id: game.game_id,
        teams: `${game.away_team_id} @ ${game.home_team_id}`
      })
    }
  }

  console.log('BREAKDOWN BY WEEK:')
  console.log('Week | Total | With Stats | Missing | Coverage')
  console.log('-'.repeat(60))

  for (const [week, data] of Object.entries(weekBreakdown)) {
    const coverage = Math.round((data.withStats / data.total) * 100)
    const status = coverage === 100 ? '✅' : coverage > 50 ? '🟡' : '❌'
    console.log(`${status} W${week.padStart(2)}  |  ${data.total.toString().padStart(2)}  |     ${data.withStats.toString().padStart(2)}     |    ${data.withoutStats.toString().padStart(2)}   |  ${coverage}%`)
  }

  // Show games without stats
  console.log('\n' + '='.repeat(80))
  console.log('GAMES MISSING PLAYER STATS:')
  console.log('='.repeat(80))

  let totalMissing = 0
  for (const [week, data] of Object.entries(weekBreakdown)) {
    if (data.gamesWithoutStats.length > 0) {
      console.log(`\nWeek ${week}:`)
      data.gamesWithoutStats.forEach(g => {
        console.log(`  - ${g.game_id}: ${g.teams}`)
        totalMissing++
      })
    }
  }

  console.log(`\nTotal games needing stats: ${totalMissing}`)

  // Check which games HAVE stats to see pattern
  console.log('\n' + '='.repeat(80))
  console.log('SAMPLE GAMES WITH STATS:')
  console.log('='.repeat(80))

  const gamesWithStatsArray = Array.from(gamesWithStats).slice(0, 10)

  for (const gameId of gamesWithStatsArray) {
    const game = completedGames.find(g => g.game_id === gameId)
    const { count } = await supabase
      .from('player_game_stats')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId)
      .eq('season', 2025)

    console.log(`${gameId}: ${game.away_team_id} @ ${game.home_team_id} (Week ${game.week}) - ${count} player records`)
  }

  // Check team coverage
  console.log('\n' + '='.repeat(80))
  console.log('TEAM COVERAGE ANALYSIS:')
  console.log('='.repeat(80))

  const teamStats = {}

  for (const game of completedGames) {
    const teams = [game.home_team_id, game.away_team_id]

    for (const team of teams) {
      if (!teamStats[team]) {
        teamStats[team] = { totalGames: 0, gamesWithStats: 0 }
      }
      teamStats[team].totalGames++

      if (gamesWithStats.has(game.game_id)) {
        teamStats[team].gamesWithStats++
      }
    }
  }

  console.log('\nTeam | Games Played | Games w/ Stats | Coverage')
  console.log('-'.repeat(60))

  const sortedTeams = Object.entries(teamStats).sort((a, b) =>
    (b[1].gamesWithStats / b[1].totalGames) - (a[1].gamesWithStats / a[1].totalGames)
  )

  for (const [team, data] of sortedTeams) {
    const coverage = Math.round((data.gamesWithStats / data.totalGames) * 100)
    const status = coverage === 100 ? '✅' : coverage > 50 ? '🟡' : '❌'
    console.log(`${status} ${team.padEnd(3)} |      ${data.totalGames.toString().padStart(2)}       |        ${data.gamesWithStats.toString().padStart(2)}       |   ${coverage}%`)
  }

  // Find teams with 0% coverage
  const teamsWithNoStats = sortedTeams.filter(([_, data]) => data.gamesWithStats === 0)

  if (teamsWithNoStats.length > 0) {
    console.log('\n⚠️  TEAMS WITH ZERO STATS:')
    teamsWithNoStats.forEach(([team, data]) => {
      console.log(`   ${team}: ${data.totalGames} games played, 0 with stats`)
    })
  }
}

investigateMissingStats()
