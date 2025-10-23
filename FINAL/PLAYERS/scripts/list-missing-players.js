import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

/**
 * List all player IDs that are missing from the players table
 * but are referenced in completed games
 *
 * Workorder: WO-FIX-MISSING-PLAYER-DATA-001
 * Task: DOC-001
 */

async function listMissingPlayers() {
  console.log('='.repeat(80))
  console.log('MISSING PLAYER ANALYSIS')
  console.log('Workorder: WO-FIX-MISSING-PLAYER-DATA-001')
  console.log('='.repeat(80))

  // Get all completed games
  const { data: completedGames } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, status')
    .eq('season', 2025)
    .eq('status', 'final')
    .order('week')

  console.log(`\nTotal completed games: ${completedGames.length}`)

  // Get games that have player stats
  const { data: gamesWithStats } = await supabase
    .from('player_game_stats')
    .select('game_id')
    .eq('season', 2025)

  const gamesWithStatsSet = new Set(gamesWithStats.map(g => g.game_id))
  const gamesWithoutStats = completedGames.filter(g => !gamesWithStatsSet.has(g.game_id))

  console.log(`Games with stats: ${gamesWithStatsSet.size}`)
  console.log(`Games WITHOUT stats: ${gamesWithoutStats.length}`)

  console.log('\n' + '='.repeat(80))
  console.log('GAMES MISSING PLAYER STATS (26 games)')
  console.log('='.repeat(80))

  // Group by week
  const weekMap = {}
  gamesWithoutStats.forEach(g => {
    if (!weekMap[g.week]) weekMap[g.week] = []
    weekMap[g.week].push(g)
  })

  const report = []
  report.push('MISSING PLAYER DATA REPORT')
  report.push('Generated: ' + new Date().toISOString())
  report.push('Workorder: WO-FIX-MISSING-PLAYER-DATA-001')
  report.push('='.repeat(80))
  report.push('')

  for (const [week, games] of Object.entries(weekMap).sort((a, b) => a[0] - b[0])) {
    console.log(`\nWeek ${week}: ${games.length} games`)
    report.push(`Week ${week}: ${games.length} games missing stats`)

    for (const game of games) {
      const gameInfo = `  ${game.game_id}: ${game.away_team_id} @ ${game.home_team_id}`
      console.log(gameInfo)
      report.push(gameInfo)
    }
    report.push('')
  }

  // Known missing player IDs from foreign key errors
  const knownMissingPlayers = [
    { id: 'espn-2978935', teams: 'IND', games: ['MIA @ IND', 'DEN @ IND', 'IND @ TEN', 'IND @ LAR'] },
    { id: 'espn-4034953', teams: 'HOU', games: ['HOU @ LAR', 'TB @ HOU', 'HOU @ JAX'] },
    { id: 'espn-4429891', teams: 'LV', games: ['LV @ NE'] },
    { id: 'espn-4423367', teams: 'DET', games: ['DET @ GB'] },
    { id: 'espn-4258197', teams: 'BAL', games: ['BAL @ BUF'] },
    { id: 'espn-2982313', teams: 'CHI', games: ['CHI @ DET', 'CHI @ LV', 'DAL @ CHI'] },
    { id: 'espn-3043168', teams: 'PHI', games: ['PHI @ KC', 'DEN @ PHI', 'PHI @ TB', 'PHI @ NYG'] },
    { id: 'espn-3123963', teams: 'MIA', games: ['MIA @ BUF'] },
    { id: 'espn-4240623', teams: 'CAR', games: ['ATL @ CAR', 'CAR @ NE'] },
    { id: 'espn-4048259', teams: 'DAL/NYJ', games: ['DAL @ NYJ'] },
    { id: 'espn-4245144', teams: 'WSH', games: ['WSH @ ATL', 'WSH @ LAC'] },
    { id: 'espn-3128444', teams: 'TEN/LV', games: ['TEN @ LV'] }
  ]

  console.log('\n' + '='.repeat(80))
  console.log('KNOWN MISSING PLAYER IDs (12 players)')
  console.log('='.repeat(80))
  report.push('='.repeat(80))
  report.push('KNOWN MISSING PLAYER IDs (12 players)')
  report.push('='.repeat(80))
  report.push('')

  for (const player of knownMissingPlayers) {
    const info = `${player.id} (${player.teams}) - appears in ${player.games.length} games`
    console.log(`\n${info}`)
    report.push(info)

    player.games.forEach(game => {
      const gameInfo = `  - ${game}`
      console.log(gameInfo)
      report.push(gameInfo)
    })
    report.push('')
  }

  // Check if these players exist in database
  console.log('\n' + '='.repeat(80))
  console.log('VERIFICATION: Checking if players exist in database')
  console.log('='.repeat(80))
  report.push('='.repeat(80))
  report.push('DATABASE VERIFICATION')
  report.push('='.repeat(80))
  report.push('')

  const playerIds = knownMissingPlayers.map(p => p.id)
  const { data: existingPlayers } = await supabase
    .from('players')
    .select('player_id, player_name')
    .in('player_id', playerIds)

  const existingIds = new Set((existingPlayers || []).map(p => p.player_id))
  const foundCount = existingPlayers ? existingPlayers.length : 0

  console.log(`\nPlayers found in database: ${foundCount}/${playerIds.length}`)
  report.push(`Players found in database: ${foundCount}/${playerIds.length}`)

  if (foundCount > 0) {
    console.log('\nPlayers already in database:')
    report.push('\nPlayers already in database:')
    existingPlayers.forEach(p => {
      const info = `  ✓ ${p.player_id}: ${p.player_name}`
      console.log(info)
      report.push(info)
    })
  }

  const stillMissing = playerIds.filter(id => !existingIds.has(id))
  console.log(`\nPlayers still missing: ${stillMissing.length}/${playerIds.length}`)
  report.push(`\nPlayers still missing: ${stillMissing.length}/${playerIds.length}`)

  if (stillMissing.length > 0) {
    console.log('\nPlayers NOT in database (need to be added):')
    report.push('\nPlayers NOT in database (need to be added):')
    stillMissing.forEach(id => {
      const player = knownMissingPlayers.find(p => p.id === id)
      const info = `  ✗ ${id} (${player.teams})`
      console.log(info)
      report.push(info)
    })
  }

  console.log('\n' + '='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  report.push('\n' + '='.repeat(80))
  report.push('SUMMARY')
  report.push('='.repeat(80))

  const summary = [
    `Total completed games: ${completedGames.length}`,
    `Games with player stats: ${gamesWithStatsSet.size}`,
    `Games missing player stats: ${gamesWithoutStats.length}`,
    `Coverage: ${Math.round((gamesWithStatsSet.size / completedGames.length) * 100)}%`,
    ``,
    `Missing players identified: ${playerIds.length}`,
    `Players already in database: ${foundCount}`,
    `Players still need to be added: ${stillMissing.length}`,
    ``,
    `Next Step: Run 'npm run seed:players' to add missing players`
  ]

  summary.forEach(line => {
    console.log(line)
    report.push(line)
  })

  // Write report to file
  const fs = await import('fs')
  const reportPath = 'missing-players-report.txt'
  fs.writeFileSync(reportPath, report.join('\n'))
  console.log(`\n✓ Report saved to ${reportPath}`)
}

listMissingPlayers().catch(error => {
  console.error('Error:', error)
  process.exit(1)
})
