/**
 * Standings Scraper
 *
 * Fetches current NFL standings from ESPN API and calculates division/conference rankings.
 * Updates team_season_stats table with wins, losses, rankings, and win percentages.
 *
 * Data calculated:
 * - Win-loss records (from completed games in database)
 * - Division rankings (1-4 per division)
 * - Conference rankings (1-16 per conference)
 * - Win percentage and point differential
 *
 * This scraper uses the DATABASE as source of truth for game results,
 * not the ESPN API, ensuring data consistency.
 *
 * Usage:
 * - Daily update: npm run scrape:standings
 * - Specific season: npm run scrape:standings -- --season=2025
 *
 * Recommended Schedule: Daily at 6 AM ET (after all games settled)
 *
 * Data Source: Database (games table) for accuracy
 */

import { getSupabaseClient, upsertBatch } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'

const SCRIPT_NAME = 'standings-scraper.js'
const SEASON_YEAR = 2025

/**
 * Calculate team records from completed games
 */
async function calculateTeamRecords(season) {
  const supabase = getSupabaseClient()

  logger.info(`Calculating team records for ${season} season...`)

  // Get all completed games for the season
  const { data: games, error } = await supabase
    .from('games')
    .select('*')
    .eq('season', season)
    .eq('status', 'final')

  if (error) {
    throw new Error(`Failed to fetch games: ${error.message}`)
  }

  logger.info(`Found ${games.length} completed games`)

  // Build team records
  const teamRecords = new Map()

  // Initialize all teams
  const { data: teams, error: teamsError} = await supabase
    .from('teams')
    .select('team_id, division, conference')

  if (teamsError) {
    throw new Error(`Failed to fetch teams: ${teamsError.message}`)
  }

  if (!teams) {
    throw new Error('No teams found in database')
  }

  teams.forEach(team => {
    teamRecords.set(team.team_id, {
      team_id: team.team_id,
      division: team.division,
      conference: team.conference,
      wins: 0,
      losses: 0,
      ties: 0,
      points_for: 0,
      points_against: 0,
      games_played: 0
    })
  })

  // Calculate records from games
  games.forEach(game => {
    const homeTeam = teamRecords.get(game.home_team_id)
    const awayTeam = teamRecords.get(game.away_team_id)

    if (!homeTeam || !awayTeam) return

    const homeScore = game.home_score || 0
    const awayScore = game.away_score || 0

    // Update games played
    homeTeam.games_played++
    awayTeam.games_played++

    // Update points
    homeTeam.points_for += homeScore
    homeTeam.points_against += awayScore
    awayTeam.points_for += awayScore
    awayTeam.points_against += homeScore

    // Determine winner
    if (homeScore > awayScore) {
      homeTeam.wins++
      awayTeam.losses++
    } else if (awayScore > homeScore) {
      awayTeam.wins++
      homeTeam.losses++
    } else {
      homeTeam.ties++
      awayTeam.ties++
    }
  })

  return Array.from(teamRecords.values())
}

/**
 * Calculate division rankings
 */
function calculateDivisionRankings(teamRecords) {
  // Group by division (conference + division)
  const divisions = new Map()

  teamRecords.forEach(team => {
    const divisionKey = `${team.conference}-${team.division}` // e.g., "AFC-North"
    if (!divisions.has(divisionKey)) {
      divisions.set(divisionKey, [])
    }
    divisions.get(divisionKey).push(team)
  })

  // Rank within each division
  divisions.forEach((teams, divisionId) => {
    // Sort by: win %, then head-to-head (not implemented), then division record (not implemented), then point differential
    teams.sort((a, b) => {
      const aWinPct = a.games_played > 0 ? (a.wins + a.ties * 0.5) / a.games_played : 0
      const bWinPct = b.games_played > 0 ? (b.wins + b.ties * 0.5) / b.games_played : 0

      if (aWinPct !== bWinPct) return bWinPct - aWinPct

      // Tiebreaker: point differential
      const aDiff = a.points_for - a.points_against
      const bDiff = b.points_for - b.points_against
      return bDiff - aDiff
    })

    // Assign division ranks
    teams.forEach((team, index) => {
      team.division_rank = index + 1
    })
  })

  return teamRecords
}

/**
 * Calculate conference rankings
 */
function calculateConferenceRankings(teamRecords) {
  // Group by conference
  const conferences = {
    'AFC': [],
    'NFC': []
  }

  teamRecords.forEach(team => {
    if (team.conference === 'AFC' || team.conference === 'NFC') {
      conferences[team.conference].push(team)
    }
  })

  // Rank within each conference
  Object.keys(conferences).forEach(conf => {
    const teams = conferences[conf]

    // Sort by: win %, then strength of victory (not implemented), then point differential
    teams.sort((a, b) => {
      const aWinPct = a.games_played > 0 ? (a.wins + a.ties * 0.5) / a.games_played : 0
      const bWinPct = b.games_played > 0 ? (b.wins + b.ties * 0.5) / b.games_played : 0

      if (aWinPct !== bWinPct) return bWinPct - aWinPct

      // Tiebreaker: point differential
      const aDiff = a.points_for - a.points_against
      const bDiff = b.points_for - b.points_against
      return bDiff - aDiff
    })

    // Assign conference ranks
    teams.forEach((team, index) => {
      team.conference_rank = index + 1
    })
  })

  return teamRecords
}

/**
 * Transform to team_season_stats schema
 */
function transformToTeamSeasonStats(teamRecords, season) {
  // Only include teams that have played games
  return teamRecords.filter(team => team.games_played > 0).map(team => {
    const winPct = team.games_played > 0
      ? (team.wins + team.ties * 0.5) / team.games_played
      : 0

    return {
      team_id: team.team_id,
      season: season,
      games_played: team.games_played,
      wins: team.wins,
      losses: team.losses,
      ties: team.ties,
      win_percentage: parseFloat(winPct.toFixed(4)),
      points_for: team.points_for,
      points_against: team.points_against,
      point_differential: team.points_for - team.points_against,
      division_rank: team.division_rank,
      conference_rank: team.conference_rank
    }
  })
}

/**
 * Main scraper function
 */
async function scrapeStandings(season) {
  try {
    logger.info('Starting standings calculation...')

    // Calculate team records from database
    let teamRecords = await calculateTeamRecords(season)

    // Calculate division rankings
    logger.info('Calculating division rankings...')
    teamRecords = calculateDivisionRankings(teamRecords)

    // Calculate conference rankings
    logger.info('Calculating conference rankings...')
    teamRecords = calculateConferenceRankings(teamRecords)

    // Transform to database schema
    const teamSeasonStats = transformToTeamSeasonStats(teamRecords, season)

    // Update database
    logger.info('Updating team_season_stats table...')
    const result = await upsertBatch('team_season_stats', teamSeasonStats, ['team_id', 'season'])

    logger.info(`✓ Updated ${result.success} team season records`)

    // Show sample standings
    logger.info('')
    logger.info('Sample Standings (Top 4 AFC):')
    const afcTeams = teamRecords
      .filter(t => t.conference === 'AFC')
      .sort((a, b) => a.conference_rank - b.conference_rank)
      .slice(0, 4)

    afcTeams.forEach(team => {
      logger.info(`  ${team.conference_rank}. ${team.team_id}: ${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''} (Div: ${team.division_rank}, Conf: ${team.conference_rank})`)
    })

    logger.info('')
    logger.info('Sample Standings (Top 4 NFC):')
    const nfcTeams = teamRecords
      .filter(t => t.conference === 'NFC')
      .sort((a, b) => a.conference_rank - b.conference_rank)
      .slice(0, 4)

    nfcTeams.forEach(team => {
      logger.info(`  ${team.conference_rank}. ${team.team_id}: ${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''} (Div: ${team.division_rank}, Conf: ${team.conference_rank})`)
    })

    return {
      success: result.success,
      failed: result.errors.length,
      total: teamSeasonStats.length
    }

  } catch (error) {
    logger.error('Standings scraper failed:', error)
    throw error
  }
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now()
  logScriptStart(SCRIPT_NAME)

  try {
    // Parse command line arguments
    const args = process.argv.slice(2)
    const seasonArg = args.find(arg => arg.startsWith('--season='))
    const season = seasonArg ? parseInt(seasonArg.split('=')[1]) : SEASON_YEAR

    logger.info(`Season: ${season}`)
    logger.info('')

    const result = await scrapeStandings(season)

    const duration = Date.now() - startTime

    logger.info('')
    logger.info('═'.repeat(60))
    logger.info('STANDINGS SCRAPER SUMMARY')
    logger.info('═'.repeat(60))
    logger.info(`✓ Teams updated: ${result.success}/${result.total}`)
    if (result.failed > 0) {
      logger.error(`✗ Failed: ${result.failed}`)
    }
    logger.info(`✓ Duration: ${(duration / 1000).toFixed(2)}s`)
    logger.info('═'.repeat(60))

    logScriptEnd(SCRIPT_NAME, {
      success: result.success,
      failed: result.failed,
      total: result.total,
      duration
    })

    process.exit(0)

  } catch (error) {
    logger.error('Standings scraper failed:', error)
    logScriptEnd(SCRIPT_NAME, {
      success: 0,
      failed: 1,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

main()
