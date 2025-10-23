/**
 * Get Game-Day Active Roster
 *
 * Fetches the active roster for a specific game - shows who actually played.
 * Includes game stats for each active player.
 *
 * Usage:
 * - Specific game: node scripts/get-gameday-roster.js --game=401772510
 * - JSON output: node scripts/get-gameday-roster.js --game=401772510 --json
 *
 * Data Source: game_rosters + player_game_stats tables
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import { logger } from './utils/logger.js'

/**
 * Fetch game-day roster for a specific game
 *
 * @param {string} gameId - ESPN game ID (with or without 'espn-' prefix)
 * @returns {Promise<Object>} Game-day roster data
 */
export async function fetchGameDayRoster(gameId) {
  const supabase = getSupabaseClient()

  // Normalize game ID
  const fullGameId = gameId.startsWith('espn-') ? gameId : `espn-${gameId}`

  try {
    // Get game details
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select(`
        *,
        home_team:teams!games_home_team_id_fkey(team_id, team_name, team_abbreviation, logo_url),
        away_team:teams!games_away_team_id_fkey(team_id, team_name, team_abbreviation, logo_url)
      `)
      .eq('game_id', fullGameId)
      .single()

    if (gameError || !game) {
      throw new Error(`Game '${gameId}' not found`)
    }

    // Get game rosters
    const { data: rosters, error: rosterError } = await supabase
      .from('game_rosters')
      .select(`
        *,
        players (
          player_id,
          full_name,
          primary_position,
          headshot_url
        )
      `)
      .eq('game_id', fullGameId)

    if (rosterError) {
      throw rosterError
    }

    // Get player game stats
    const { data: stats, error: statsError } = await supabase
      .from('player_game_stats')
      .select('*')
      .eq('game_id', fullGameId)

    if (statsError) {
      throw statsError
    }

    // Build stats lookup map
    const statsMap = {}
    if (stats) {
      stats.forEach(stat => {
        statsMap[stat.player_id] = stat
      })
    }

    // Separate home and away rosters
    const homeRoster = []
    const awayRoster = []

    rosters.forEach(r => {
      const player = Array.isArray(r.players) ? r.players[0] : r.players
      if (!player) return

      const playerStats = statsMap[r.player_id]

      const playerData = {
        playerId: r.player_id,
        name: player.full_name,
        position: r.position || player.primary_position,
        jerseyNumber: r.jersey_number,
        active: r.active,
        headshot: player.headshot_url,

        // Game stats (if player recorded stats)
        stats: playerStats ? formatPlayerStats(playerStats) : null
      }

      if (r.team_id === game.home_team_id) {
        homeRoster.push(playerData)
      } else {
        awayRoster.push(playerData)
      }
    })

    // Sort by position and jersey number
    const sortRoster = (roster) => {
      return roster.sort((a, b) => {
        // Position order
        const posOrder = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P']
        const aPos = posOrder.indexOf(a.position)
        const bPos = posOrder.indexOf(b.position)

        if (aPos !== bPos) {
          return aPos - bPos
        }

        // Then by jersey number
        return (a.jerseyNumber || 99) - (b.jerseyNumber || 99)
      })
    }

    return {
      game: {
        gameId: game.game_id,
        week: game.week,
        season: game.season,
        date: game.game_date,
        time: game.game_time,
        status: game.status,
        homeScore: game.home_score,
        awayScore: game.away_score,
        broadcast: game.broadcast_network
      },
      homeTeam: {
        id: game.home_team_id,
        name: game.home_team?.team_name,
        abbreviation: game.home_team?.team_abbreviation,
        logo: game.home_team?.logo_url,
        score: game.home_score,
        rosterSize: homeRoster.length,
        roster: sortRoster(homeRoster)
      },
      awayTeam: {
        id: game.away_team_id,
        name: game.away_team?.team_name,
        abbreviation: game.away_team?.team_abbreviation,
        logo: game.away_team?.logo_url,
        score: game.away_score,
        rosterSize: awayRoster.length,
        roster: sortRoster(awayRoster)
      },
      totalActivePlayers: rosters.length,
      playersWithStats: stats ? stats.length : 0
    }

  } catch (error) {
    logger.error('Failed to fetch game-day roster:', error)
    throw error
  }
}

/**
 * Format player stats for display
 */
function formatPlayerStats(stats) {
  const formatted = {
    fantasyPoints: stats.fantasy_points_ppr || 0
  }

  // Passing stats
  if (stats.passing_yards || stats.passing_touchdowns) {
    formatted.passing = {
      yards: stats.passing_yards || 0,
      touchdowns: stats.passing_touchdowns || 0,
      interceptions: stats.passing_interceptions || 0,
      completions: stats.passing_completions || 0,
      attempts: stats.passing_attempts || 0
    }
  }

  // Rushing stats
  if (stats.rushing_yards || stats.rushing_touchdowns) {
    formatted.rushing = {
      yards: stats.rushing_yards || 0,
      touchdowns: stats.rushing_touchdowns || 0,
      attempts: stats.rushing_attempts || 0
    }
  }

  // Receiving stats
  if (stats.receiving_yards || stats.receiving_touchdowns || stats.receiving_receptions) {
    formatted.receiving = {
      yards: stats.receiving_yards || 0,
      touchdowns: stats.receiving_touchdowns || 0,
      receptions: stats.receiving_receptions || 0,
      targets: stats.receiving_targets || 0
    }
  }

  // Defensive stats
  if (stats.defense_tackles || stats.defense_sacks) {
    formatted.defense = {
      tackles: stats.defense_tackles || 0,
      sacks: stats.defense_sacks || 0,
      interceptions: stats.defense_interceptions || 0,
      forcedFumbles: stats.defense_forced_fumbles || 0
    }
  }

  return formatted
}

/**
 * Display game-day roster in console
 */
function displayGameDayRoster(data) {
  const { game, homeTeam, awayTeam, totalActivePlayers, playersWithStats } = data

  console.log('═'.repeat(100))
  console.log(`GAME-DAY ROSTER - ${awayTeam.name} @ ${homeTeam.name}`)
  console.log(`Week ${game.week}, ${game.season} • ${game.date} ${game.time}`)
  if (game.status === 'final') {
    console.log(`FINAL: ${awayTeam.abbreviation} ${awayTeam.score} - ${homeTeam.abbreviation} ${homeTeam.score}`)
  }
  console.log('═'.repeat(100))
  console.log(`Total Active Players: ${totalActivePlayers} | Players with Stats: ${playersWithStats}`)
  console.log('')

  // Display away team roster
  console.log(`\n${awayTeam.name.toUpperCase()} (${awayTeam.abbreviation}) - ${awayTeam.rosterSize} Active Players`)
  console.log('─'.repeat(100))
  displayRoster(awayTeam.roster)

  // Display home team roster
  console.log(`\n${homeTeam.name.toUpperCase()} (${homeTeam.abbreviation}) - ${homeTeam.rosterSize} Active Players`)
  console.log('─'.repeat(100))
  displayRoster(homeTeam.roster)

  console.log('\n' + '═'.repeat(100))
}

/**
 * Display roster list
 */
function displayRoster(roster) {
  roster.forEach(player => {
    const num = player.jerseyNumber ? `#${player.jerseyNumber}`.padEnd(5) : '     '
    const name = player.name.padEnd(30)
    const pos = (player.position || '').padEnd(4)
    const active = player.active ? '✓' : ' '

    let statsLine = ''
    if (player.stats) {
      const s = player.stats
      if (s.passing) {
        statsLine += `${s.passing.yards} pass yds, ${s.passing.touchdowns} TD`
      }
      if (s.rushing) {
        if (statsLine) statsLine += ' | '
        statsLine += `${s.rushing.yards} rush yds, ${s.rushing.touchdowns} TD`
      }
      if (s.receiving) {
        if (statsLine) statsLine += ' | '
        statsLine += `${s.receiving.receptions} rec, ${s.receiving.yards} yds, ${s.receiving.touchdowns} TD`
      }
      if (s.defense) {
        if (statsLine) statsLine += ' | '
        statsLine += `${s.defense.tackles} tkl, ${s.defense.sacks} sck`
      }
      if (s.fantasyPoints) {
        statsLine += ` (${s.fantasyPoints.toFixed(1)} fpts)`
      }
    }

    console.log(`${num} ${name} ${pos} ${active}  ${statsLine}`)
  })
}

/**
 * Main execution
 */
async function main() {
  try {
    const args = process.argv.slice(2)
    const gameArg = args.find(arg => arg.startsWith('--game='))
    const jsonMode = args.includes('--json')

    if (!gameArg) {
      console.log('Usage: node scripts/get-gameday-roster.js --game=<ESPN_GAME_ID>')
      console.log('Example: node scripts/get-gameday-roster.js --game=401772510')
      process.exit(1)
    }

    const gameId = gameArg.split('=')[1]
    const rosterData = await fetchGameDayRoster(gameId)

    if (jsonMode) {
      console.log(JSON.stringify(rosterData, null, 2))
    } else {
      displayGameDayRoster(rosterData)
    }

  } catch (error) {
    logger.error('Game-day roster fetch failed:', error)
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  main()
}
