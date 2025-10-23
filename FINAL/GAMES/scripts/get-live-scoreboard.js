/**
 * Get Live Scoreboard Data
 *
 * Fetches formatted scoreboard data for display in frontend applications.
 * Returns all games for a specific week with team details, scores, status, and timing.
 *
 * Usage:
 * - Current week: node scripts/get-live-scoreboard.js
 * - Specific week: node scripts/get-live-scoreboard.js --week=7
 * - JSON output: node scripts/get-live-scoreboard.js --json
 *
 * Output Format:
 * - Console: Formatted scoreboard display
 * - JSON mode: Raw JSON data for API consumption
 *
 * Auto-refreshes: Designed to be called repeatedly (e.g., every 10-30 seconds)
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import { logger } from './utils/logger.js'

const SEASON_YEAR = 2025

/**
 * Get current week number based on date
 */
function getCurrentWeek() {
  const now = new Date()
  const seasonStart = new Date('2025-09-04') // Week 1 start

  if (now < seasonStart) {
    return 1
  }

  const diffTime = Math.abs(now - seasonStart)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const week = Math.ceil(diffDays / 7)

  return Math.min(week, 18)
}

/**
 * Fetch scoreboard data for a specific week
 *
 * @param {number} week - Week number (1-18)
 * @returns {Promise<Object>} Scoreboard data with games grouped by status
 */
export async function fetchScoreboardData(week) {
  const supabase = getSupabaseClient()

  try {
    // Fetch all games for the week
    const { data: games, error } = await supabase
      .from('games')
      .select('*')
      .eq('season', SEASON_YEAR)
      .eq('week', week)
      .order('game_date')
      .order('game_time')

    if (error) {
      logger.error('Failed to fetch scoreboard data:', error)
      throw error
    }

    // Fetch team details separately
    const homeTeamIds = games.map(g => g.home_team_id)
    const awayTeamIds = games.map(g => g.away_team_id)
    const allTeamIds = [...new Set([...homeTeamIds, ...awayTeamIds])]

    const { data: teams } = await supabase
      .from('teams')
      .select('*')
      .in('team_id', allTeamIds)

    // Fetch stadium details
    const stadiumIds = games.map(g => g.stadium_id).filter(id => id !== null)
    const { data: stadiums } = await supabase
      .from('stadiums')
      .select('*')
      .in('stadium_id', stadiumIds)

    // Build team and stadium lookup maps
    const teamMap = {}
    teams.forEach(team => {
      teamMap[team.team_id] = team
    })

    const stadiumMap = {}
    stadiums.forEach(stadium => {
      stadiumMap[stadium.stadium_id] = stadium
    })

    // Attach team and stadium data to games
    games.forEach(game => {
      game.home_team = teamMap[game.home_team_id]
      game.away_team = teamMap[game.away_team_id]
      game.stadium = stadiumMap[game.stadium_id]
    })

    // Group games by status
    const inProgress = []
    const completed = []
    const scheduled = []

    games.forEach(game => {
      const formattedGame = formatGameForScoreboard(game)

      if (game.status === 'in_progress') {
        inProgress.push(formattedGame)
      } else if (game.status === 'final') {
        completed.push(formattedGame)
      } else {
        scheduled.push(formattedGame)
      }
    })

    return {
      week,
      season: SEASON_YEAR,
      lastUpdated: new Date().toISOString(),
      summary: {
        total: games.length,
        inProgress: inProgress.length,
        completed: completed.length,
        scheduled: scheduled.length
      },
      games: {
        inProgress,
        completed,
        scheduled
      }
    }

  } catch (error) {
    logger.error('Failed to fetch scoreboard:', error)
    throw error
  }
}

/**
 * Format a game object for scoreboard display
 *
 * @param {Object} game - Raw game object from database
 * @returns {Object} Formatted game object
 */
function formatGameForScoreboard(game) {
  const homeTeam = game.home_team || {}
  const awayTeam = game.away_team || {}
  const stadium = game.stadium || null

  // Determine possession (for in-progress games)
  // In a real implementation, this would come from live data
  const possession = null

  // Format game time/status display
  let statusDisplay = ''
  let clock = null
  let quarter = null

  if (game.status === 'scheduled') {
    const gameDateTime = new Date(`${game.game_date}T${game.game_time}`)
    statusDisplay = gameDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York'
    })
  } else if (game.status === 'in_progress') {
    // This would be populated from live data in real-time
    statusDisplay = 'LIVE'
    quarter = 2 // Example
    clock = '5:23' // Example
  } else if (game.status === 'final') {
    statusDisplay = game.overtime ? 'FINAL/OT' : 'FINAL'
  }

  // Build quarter scores (only for completed/in-progress games)
  const quarterScores = {
    home: {
      q1: game.home_q1_score,
      q2: game.home_q2_score,
      q3: game.home_q3_score,
      q4: game.home_q4_score,
      ot: game.home_ot_score
    },
    away: {
      q1: game.away_q1_score,
      q2: game.away_q2_score,
      q3: game.away_q3_score,
      q4: game.away_q4_score,
      ot: game.away_ot_score
    }
  }

  return {
    gameId: game.game_id,
    status: game.status,
    statusDisplay,
    clock,
    quarter,

    homeTeam: {
      id: homeTeam.team_id || game.home_team_id,
      name: homeTeam.team_name || 'Home Team',
      abbreviation: homeTeam.team_abbreviation || game.home_team_id,
      logo: homeTeam.logo_url || null,
      color: homeTeam.team_color || null,
      score: game.home_score,
      quarterScores: quarterScores.home,
      hasPossession: possession === 'home'
    },

    awayTeam: {
      id: awayTeam.team_id || game.away_team_id,
      name: awayTeam.team_name || 'Away Team',
      abbreviation: awayTeam.team_abbreviation || game.away_team_id,
      logo: awayTeam.logo_url || null,
      color: awayTeam.team_color || null,
      score: game.away_score,
      quarterScores: quarterScores.away,
      hasPossession: possession === 'away'
    },

    venue: stadium ? {
      name: stadium.stadium_name,
      city: stadium.city,
      state: stadium.state,
      roofType: stadium.roof_type
    } : null,

    broadcast: game.broadcast_network,
    attendance: game.attendance,
    overtime: game.overtime,

    gameDate: game.game_date,
    gameTime: game.game_time
  }
}

/**
 * Display scoreboard in console
 *
 * @param {Object} scoreboardData - Scoreboard data from fetchScoreboardData()
 */
function displayScoreboard(scoreboardData) {
  console.log('═'.repeat(80))
  console.log(`NFL SCOREBOARD - WEEK ${scoreboardData.week} (${scoreboardData.season} Season)`)
  console.log(`Last Updated: ${new Date(scoreboardData.lastUpdated).toLocaleTimeString()}`)
  console.log('═'.repeat(80))
  console.log('')

  const { inProgress, completed, scheduled } = scoreboardData.games

  // In Progress Games
  if (inProgress.length > 0) {
    console.log('🔴 LIVE GAMES')
    console.log('─'.repeat(80))
    inProgress.forEach(game => {
      displayGame(game)
    })
    console.log('')
  }

  // Completed Games
  if (completed.length > 0) {
    console.log('✅ FINAL SCORES')
    console.log('─'.repeat(80))
    completed.forEach(game => {
      displayGame(game)
    })
    console.log('')
  }

  // Scheduled Games
  if (scheduled.length > 0) {
    console.log('📅 UPCOMING GAMES')
    console.log('─'.repeat(80))
    scheduled.forEach(game => {
      displayGame(game)
    })
    console.log('')
  }

  // Summary
  console.log('═'.repeat(80))
  console.log(`Total: ${scoreboardData.summary.total} games | ` +
              `Live: ${scoreboardData.summary.inProgress} | ` +
              `Final: ${scoreboardData.summary.completed} | ` +
              `Upcoming: ${scoreboardData.summary.scheduled}`)
  console.log('═'.repeat(80))
}

/**
 * Display a single game
 *
 * @param {Object} game - Formatted game object
 */
function displayGame(game) {
  const awayLine = `${game.awayTeam.abbreviation.padEnd(4)} ${
    game.awayTeam.score !== null ? String(game.awayTeam.score).padStart(3) : '  -'
  }`

  const homeLine = `${game.homeTeam.abbreviation.padEnd(4)} ${
    game.homeTeam.score !== null ? String(game.homeTeam.score).padStart(3) : '  -'
  }`

  const statusPadded = game.statusDisplay.padEnd(12)

  let quarterLine = ''
  if (game.status !== 'scheduled') {
    const hasQuarters = game.homeTeam.quarterScores.q1 !== null
    if (hasQuarters) {
      quarterLine = `  (Q1: ${game.awayTeam.quarterScores.q1}-${game.homeTeam.quarterScores.q1}, ` +
                   `Q2: ${game.awayTeam.quarterScores.q2}-${game.homeTeam.quarterScores.q2}, ` +
                   `Q3: ${game.awayTeam.quarterScores.q3}-${game.homeTeam.quarterScores.q3}, ` +
                   `Q4: ${game.awayTeam.quarterScores.q4}-${game.homeTeam.quarterScores.q4}` +
                   (game.overtime ? `, OT: ${game.awayTeam.quarterScores.ot}-${game.homeTeam.quarterScores.ot}` : '') +
                   ')'
    }
  }

  console.log(`${awayLine}  at  ${homeLine}  ${statusPadded}${
    game.broadcast ? `[${game.broadcast}]` : ''
  }${quarterLine}`)
}

/**
 * Main execution
 */
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2)
    const weekArg = args.find(arg => arg.startsWith('--week='))
    const jsonMode = args.includes('--json')

    const week = weekArg ? parseInt(weekArg.split('=')[1]) : getCurrentWeek()

    // Fetch scoreboard data
    const scoreboardData = await fetchScoreboardData(week)

    if (jsonMode) {
      // Output JSON for API consumption
      console.log(JSON.stringify(scoreboardData, null, 2))
    } else {
      // Display formatted scoreboard
      displayScoreboard(scoreboardData)
    }

  } catch (error) {
    logger.error('Scoreboard fetch failed:', error)
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  main()
}
