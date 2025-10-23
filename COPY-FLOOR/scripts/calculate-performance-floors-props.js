/**
 * Calculate Performance Floors for Players - PROPS FORMAT
 *
 * Displays player props in betting format: Player, Stat, Floor, Expected, Ceiling
 */

import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

// Configuration
const CONFIG = {
  rolling_window_weeks: 3,
  volatility_factor: 0.75,
  current_season: 2025,
  min_games_played: 2
}

/**
 * Get opponent team for a game
 */
function getOpponent(game, teamId) {
  return game.home_team_id === teamId ? game.away_team_id : game.home_team_id
}

/**
 * Calculate performance floors for a specific game - PROPS OUTPUT
 */
async function calculateFloorsForGame(gameId, season = CONFIG.current_season) {
  console.log(`\n${'='.repeat(100)}`)
  console.log(`PLAYER PROPS - Game: ${gameId}`)
  console.log('='.repeat(100))

  // Get game details
  const { data: game } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, game_date, status')
    .eq('game_id', gameId)
    .eq('season', season)
    .single()

  if (!game) {
    console.error('Game not found')
    return
  }

  console.log(`\n📅 ${game.away_team_id} @ ${game.home_team_id} (Week ${game.week}) - ${game.game_date}\n`)

  const teams = [game.away_team_id, game.home_team_id]
  const allProps = []

  for (const teamId of teams) {
    const opponentId = getOpponent(game, teamId)

    // Get ALL player stats for this team
    const { data: allTeamStats } = await supabase
      .from('player_game_stats')
      .select('player_id, team_id, game_id')
      .eq('team_id', teamId)
      .eq('season', season)

    if (!allTeamStats || allTeamStats.length === 0) continue

    // Get unique game IDs
    const uniqueGameIds = [...new Set(allTeamStats.map(s => s.game_id))]

    const { data: gamesWithStats } = await supabase
      .from('games')
      .select('game_id, week')
      .eq('season', season)
      .in('game_id', uniqueGameIds)
      .lt('week', game.week)
      .order('week', { ascending: false })

    if (!gamesWithStats || gamesWithStats.length === 0) continue

    const gameIdsWithStats = gamesWithStats.map(g => g.game_id)
    const players = allTeamStats.filter(s => gameIdsWithStats.includes(s.game_id))

    const uniquePlayerIds = [...new Set(players?.map(p => p.player_id) || [])]

    const { data: playerDetails } = await supabase
      .from('players')
      .select('player_id, full_name, primary_position')
      .in('player_id', uniquePlayerIds)
      .in('primary_position', ['QB', 'RB', 'WR', 'TE'])

    const playerMap = new Map(playerDetails?.map(p => [p.player_id, p]) || [])

    const enrichedPlayers = uniquePlayerIds
      .map(id => playerMap.get(id))
      .filter(p => p !== undefined)

    // Calculate props for each player
    for (const player of enrichedPlayers) {
      const props = await calculatePlayerProps(player, teamId, opponentId, game.week, season)
      if (props && props.length > 0) {
        allProps.push(...props)
      }
    }
  }

  // Display props grouped by category
  displayProps(allProps, game)
}

/**
 * Calculate props for individual player
 */
async function calculatePlayerProps(player, teamId, opponentId, week, season) {
  // Get player historical stats
  const { data: seasonStats } = await supabase
    .from('player_game_stats')
    .select(`
      game_id,
      passing_yards, passing_attempts, passing_touchdowns,
      rushing_yards, rushing_attempts, rushing_touchdowns,
      receiving_yards, receiving_targets, receptions, receiving_touchdowns
    `)
    .eq('player_id', player.player_id)
    .eq('season', season)

  if (!seasonStats || seasonStats.length === 0) return null

  // Get game weeks for filtering
  const gameIds = seasonStats.map(s => s.game_id)
  const { data: gameWeeks } = await supabase
    .from('games')
    .select('game_id, week')
    .in('game_id', gameIds)
    .eq('season', season)
    .lt('week', week)

  const weekMap = new Map(gameWeeks?.map(g => [g.game_id, g.week]) || [])

  const filteredStats = seasonStats
    .filter(s => weekMap.has(s.game_id) && weekMap.get(s.game_id) < week)
    .map(s => ({ ...s, week: weekMap.get(s.game_id) }))

  if (!filteredStats || filteredStats.length < CONFIG.min_games_played) return null

  const recentGames = filteredStats
    .sort((a, b) => b.week - a.week)
    .slice(0, CONFIG.rolling_window_weeks)

  // Define prop types by position
  const propTypes = getPropsForPosition(player.primary_position)

  const props = []

  for (const propType of propTypes) {
    const prop = calculateProp(
      player.full_name,
      player.primary_position,
      teamId,
      propType,
      filteredStats,
      recentGames
    )

    if (prop) {
      props.push(prop)
    }
  }

  return props
}

/**
 * Get relevant prop types by position
 */
function getPropsForPosition(position) {
  const propMap = {
    QB: [
      { stat: 'passing_yards', label: 'Pass Yds' },
      { stat: 'passing_touchdowns', label: 'Pass TDs' }
    ],
    RB: [
      { stat: 'rushing_yards', label: 'Rush Yds' },
      { stat: 'receiving_yards', label: 'Rec Yds' },
      { stat: 'rushing_touchdowns', label: 'Rush TDs' }
    ],
    WR: [
      { stat: 'receiving_yards', label: 'Rec Yds' },
      { stat: 'receptions', label: 'Receptions' },
      { stat: 'receiving_touchdowns', label: 'Rec TDs' }
    ],
    TE: [
      { stat: 'receiving_yards', label: 'Rec Yds' },
      { stat: 'receptions', label: 'Receptions' },
      { stat: 'receiving_touchdowns', label: 'Rec TDs' }
    ]
  }

  return propMap[position] || []
}

/**
 * Calculate individual prop
 */
function calculateProp(playerName, position, teamId, propType, seasonStats, recentGames) {
  const seasonValues = seasonStats
    .map(g => g[propType.stat])
    .filter(v => v !== null && v !== undefined && !isNaN(v))

  const recentValues = recentGames
    .map(g => g[propType.stat])
    .filter(v => v !== null && v !== undefined && !isNaN(v))

  if (seasonValues.length === 0 || recentValues.length === 0) return null

  const seasonAvg = seasonValues.reduce((a, b) => a + b, 0) / seasonValues.length
  const seasonStdDev = Math.sqrt(
    seasonValues.reduce((sum, val) => sum + Math.pow(val - seasonAvg, 2), 0) / seasonValues.length
  )

  const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length

  // Expected (60% recent, 40% season)
  const expected = (seasonAvg * 0.4) + (recentAvg * 0.6)

  // Floor
  const floor = Math.max(0, expected - (seasonStdDev * CONFIG.volatility_factor))

  // Ceiling
  const ceiling = expected + (seasonStdDev * CONFIG.volatility_factor)

  // Round based on stat type
  const isWhole = propType.stat.includes('touchdown') || propType.stat.includes('receptions')
  const roundFn = isWhole ? Math.round : (v => Math.round(v * 10) / 10)

  return {
    player: playerName,
    position,
    team: teamId,
    prop: propType.label,
    floor: roundFn(floor),
    expected: roundFn(expected),
    ceiling: roundFn(ceiling),
    games: seasonValues.length,
    recent_avg: roundFn(recentAvg),
    season_avg: roundFn(seasonAvg)
  }
}

/**
 * Display props in betting format
 */
function displayProps(props, game) {
  if (!props || props.length === 0) {
    console.log('No props available')
    return
  }

  // Group by prop type
  const propTypes = ['Pass Yds', 'Pass TDs', 'Rush Yds', 'Rush TDs', 'Rec Yds', 'Receptions', 'Rec TDs']

  console.log(`\n${'='.repeat(100)}`)
  console.log(`PLAYER PROPS - ${game.away_team_id} @ ${game.home_team_id}`)
  console.log('='.repeat(100) + '\n')

  for (const propType of propTypes) {
    const typeProps = props.filter(p => p.prop === propType)

    if (typeProps.length === 0) continue

    // Sort by expected descending
    typeProps.sort((a, b) => b.expected - a.expected)

    console.log(`\n🎯 ${propType.toUpperCase()}`)
    console.log('─'.repeat(100))
    console.log(`${'Player'.padEnd(25)} ${'Pos'.padEnd(5)} ${'Team'.padEnd(6)} ${'Floor'.padStart(8)} ${'Expected'.padStart(10)} ${'Ceiling'.padStart(10)} ${'Games'.padStart(8)}`)
    console.log('─'.repeat(100))

    for (const prop of typeProps) {
      const player = prop.player.padEnd(25)
      const pos = prop.position.padEnd(5)
      const team = prop.team.padEnd(6)
      const floor = String(prop.floor).padStart(8)
      const expected = String(prop.expected).padStart(10)
      const ceiling = String(prop.ceiling).padStart(10)
      const games = String(prop.games).padStart(8)

      console.log(`${player} ${pos} ${team} ${floor} ${expected} ${ceiling} ${games}`)
    }
  }

  console.log(`\n${'='.repeat(100)}\n`)
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    console.log(`
Usage:
  node scripts/calculate-performance-floors-props.js [options]

Options:
  --game=<game_id>   Calculate props for specific game
  --week=<week>      Calculate props for all scheduled games in week
  --help             Show this help message

Examples:
  node scripts/calculate-performance-floors-props.js --week=7
  node scripts/calculate-performance-floors-props.js --game=401772816
    `)
    return
  }

  const gameArg = args.find(arg => arg.startsWith('--game='))
  const weekArg = args.find(arg => arg.startsWith('--week='))

  if (gameArg) {
    const gameId = gameArg.split('=')[1]
    await calculateFloorsForGame(gameId)
  } else if (weekArg) {
    const week = parseInt(weekArg.split('=')[1])

    const { data: games } = await supabase
      .from('games')
      .select('game_id')
      .eq('season', CONFIG.current_season)
      .eq('week', week)
      .eq('status', 'scheduled')

    if (!games || games.length === 0) {
      console.log(`No scheduled games found for Week ${week}`)
      return
    }

    for (const game of games) {
      await calculateFloorsForGame(game.game_id)
    }
  } else {
    console.log('Please specify --game=<game_id> or --week=<week>')
    console.log('Run with --help for usage information')
  }
}

main()
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
