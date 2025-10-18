/**
 * Game Stats Scraper
 *
 * Fetches comprehensive game statistics from ESPN's /summary endpoint for completed games.
 * Populates tables needed for the completed game template.
 *
 * Data fetched:
 * - Team game statistics (team_game_stats table)
 * - Scoring plays (scoring_plays table)
 * - Game weather info (game_weather table)
 *
 * Usage:
 * - Manual: npm run scrape:game-stats
 * - With game ID: npm run scrape:game-stats -- --game=401772510
 * - For specific week: npm run scrape:game-stats -- --week=7
 *
 * Data Source: ESPN NFL API /summary endpoint
 */

import { fetchGameSummary } from '../utils/espn-api.js'
import { upsertBatch, getSupabaseClient } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'

const SCRIPT_NAME = 'game-stats-scraper.js'
const SEASON_YEAR = 2025

/**
 * Extract team statistics from boxscore data
 * Maps to team_game_stats table schema
 */
function extractTeamStats(gameSummary, gameId) {
  const boxscore = gameSummary.boxscore
  if (!boxscore || !boxscore.teams) {
    logger.warn(`No boxscore data for game ${gameId}`)
    return []
  }

  const competition = gameSummary.header?.competitions?.[0]
  const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home')
  const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away')

  return boxscore.teams.map(teamData => {
    const stats = teamData.statistics || []
    const statMap = {}

    // Convert array of stats to key-value map
    // Use displayValue (string with actual number) instead of value (which can be "-")
    stats.forEach(stat => {
      statMap[stat.name] = stat.displayValue || stat.value
    })

    const teamAbbr = teamData.team.abbreviation
    const isHome = teamAbbr === homeTeam?.team?.abbreviation

    // Get scores from competition data
    const teamCompetitor = isHome ? homeTeam : awayTeam
    const opponentCompetitor = isHome ? awayTeam : homeTeam

    //Helper function to safely parse numbers
    const parseNumber = (value) => {
      if (value === null || value === undefined || value === '' || value === '-') return 0
      const num = parseFloat(value)
      return isNaN(num) ? 0 : num
    }

    return {
      team_id: teamAbbr,
      game_id: `espn-${gameId}`,
      season: SEASON_YEAR,
      is_home: isHome,
      points_scored: teamCompetitor?.score ? parseInt(teamCompetitor.score) : 0,
      points_allowed: opponentCompetitor?.score ? parseInt(opponentCompetitor.score) : 0,
      total_yards: parseNumber(statMap.totalYards),
      total_yards_allowed: 0, // Will need opponent's stats to calculate
      turnovers: parseNumber(statMap.turnovers),
      turnovers_forced: 0, // Will need opponent's turnovers
      time_of_possession_seconds: parseTimeToSeconds(statMap.possessionTime)
    }
  })
}

/**
 * Convert time string "MM:SS" to seconds
 */
function parseTimeToSeconds(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null
  const parts = timeStr.split(':')
  if (parts.length !== 2) return null
  const minutes = parseInt(parts[0])
  const seconds = parseInt(parts[1])
  return minutes * 60 + seconds
}

/**
 * Extract scoring plays from game summary
 * Maps to scoring_plays table schema
 */
function extractScoringPlays(gameSummary, gameId) {
  const scoringPlays = gameSummary.scoringPlays || []

  return scoringPlays.map((play, index) => {
    // Calculate points from score change
    // ESPN provides awayScore and homeScore after the play
    // To get points, we need to look at the previous play's score
    let points = 0
    if (index > 0) {
      const prevPlay = scoringPlays[index - 1]
      if (play.team.abbreviation === prevPlay.team.abbreviation) {
        // Same team scored - look at which side they're on
        const competition = gameSummary.header?.competitions?.[0]
        const isAway = competition?.competitors?.find(c => c.team?.abbreviation === play.team.abbreviation)?.homeAway === 'away'
        if (isAway) {
          points = play.awayScore - prevPlay.awayScore
        } else {
          points = play.homeScore - prevPlay.homeScore
        }
      } else {
        // Different team - compare their current score to previous play
        const competition = gameSummary.header?.competitions?.[0]
        const isAway = competition?.competitors?.find(c => c.team?.abbreviation === play.team.abbreviation)?.homeAway === 'away'
        if (isAway) {
          points = play.awayScore - (prevPlay.awayScore || 0)
        } else {
          points = play.homeScore - (prevPlay.homeScore || 0)
        }
      }
    } else {
      // First scoring play - points = current score
      const competition = gameSummary.header?.competitions?.[0]
      const isAway = competition?.competitors?.find(c => c.team?.abbreviation === play.team.abbreviation)?.homeAway === 'away'
      points = isAway ? play.awayScore : play.homeScore
    }

    return {
      game_id: `espn-${gameId}`,
      play_id: play.id ? parseInt(play.id) : null,
      season: SEASON_YEAR,
      team_id: play.team?.abbreviation || 'UNK',
      quarter: play.period?.number || 1,
      time_remaining_seconds: parseClockToSeconds(play.clock?.displayValue),
      scoring_type: play.type?.text || 'unknown',
      points: points,
      description: play.text || ''
    }
  })
}

/**
 * Convert game clock "MM:SS" to seconds remaining in quarter
 */
function parseClockToSeconds(clockStr) {
  if (!clockStr || typeof clockStr !== 'string') return null
  const parts = clockStr.split(':')
  if (parts.length !== 2) return null
  const minutes = parseInt(parts[0])
  const seconds = parseInt(parts[1])
  return minutes * 60 + seconds
}

/**
 * Extract game weather info
 * Maps to game_weather table schema
 */
function extractGameWeather(gameSummary, gameId) {
  const gameInfo = gameSummary.gameInfo
  const weather = gameInfo?.weather

  if (!weather) {
    return null
  }

  return {
    game_id: `espn-${gameId}`,
    temperature_fahrenheit: weather.temperature || null,
    humidity_percentage: null, // ESPN doesn't provide this
    wind_speed_mph: null, // ESPN doesn't provide this in structured format
    wind_direction: null,
    precipitation: null,
    conditions: weather.displayValue || null
  }
}

/**
 * Main scraper function
 */
async function scrapeGameStats(gameId) {
  try {
    logger.info(`Fetching stats for game ${gameId}...`)

    // Fetch complete game summary
    const gameSummary = await fetchGameSummary(gameId)

    const results = {
      teamStats: 0,
      scoringPlays: 0,
      gameWeather: 0
    }

    // Extract and insert team statistics
    logger.info('Processing team statistics...')
    const teamStats = extractTeamStats(gameSummary, gameId)
    if (teamStats.length > 0) {
      // After getting both teams' stats, update turnovers_forced and total_yards_allowed
      if (teamStats.length === 2) {
        teamStats[0].turnovers_forced = teamStats[1].turnovers
        teamStats[1].turnovers_forced = teamStats[0].turnovers
        teamStats[0].total_yards_allowed = teamStats[1].total_yards
        teamStats[1].total_yards_allowed = teamStats[0].total_yards
      }

      const result = await upsertBatch('team_game_stats', teamStats, ['team_id', 'game_id'])
      results.teamStats = result.success
      logger.info(`✓ Upserted ${result.success} team stat records`)
    }

    // Extract and insert scoring plays
    logger.info('Processing scoring plays...')
    const scoringPlays = extractScoringPlays(gameSummary, gameId)
    if (scoringPlays.length > 0) {
      // Delete existing scoring plays for this game first (to allow re-scraping)
      const supabase = getSupabaseClient()
      await supabase.from('scoring_plays').delete().eq('game_id', `espn-${gameId}`)

      // Then insert new records
      const { insertBatch } = await import('../utils/supabase-client.js')
      const result = await insertBatch('scoring_plays', scoringPlays)
      results.scoringPlays = result.success
      logger.info(`✓ Inserted ${result.success} scoring plays`)
    }

    // Extract and insert game weather
    logger.info('Processing game weather...')
    const gameWeather = extractGameWeather(gameSummary, gameId)
    if (gameWeather) {
      const result = await upsertBatch('game_weather', [gameWeather], ['game_id'])
      results.gameWeather = result.success
      logger.info(`✓ Upserted game weather`)
    } else {
      logger.info('ℹ No weather data available')
    }

    return results

  } catch (error) {
    logger.error(`Failed to scrape stats for game ${gameId}:`, error)
    throw error
  }
}

/**
 * Scrape stats for all completed games in a specific week
 */
async function scrapeWeekStats(season, week) {
  try {
    logger.info(`Fetching all completed games for ${season} Week ${week}...`)

    // Query database for all completed games in this week
    const supabase = getSupabaseClient()
    const { data: games, error } = await supabase
      .from('games')
      .select('game_id, home_team_id, away_team_id, status')
      .eq('season', season)
      .eq('week', week)
      .eq('status', 'final')

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    if (!games || games.length === 0) {
      logger.warn(`No completed games found for Week ${week}`)
      return { success: 0, failed: 0, total: 0 }
    }

    logger.info(`Found ${games.length} completed games to process`)

    let successCount = 0
    let failCount = 0

    for (const game of games) {
      // Extract numeric ESPN ID from our game_id format (espn-401671705)
      const espnId = game.game_id.replace('espn-', '')

      try {
        logger.info(`[${successCount + failCount + 1}/${games.length}] Processing ${game.away_team_id} @ ${game.home_team_id}...`)
        await scrapeGameStats(espnId)
        successCount++
      } catch (error) {
        logger.error(`Failed to process game ${game.game_id}: ${error.message}`)
        failCount++
      }
    }

    return {
      success: successCount,
      failed: failCount,
      total: games.length
    }

  } catch (error) {
    logger.error(`Failed to scrape week stats:`, error)
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
    const gameIdArg = args.find(arg => arg.startsWith('--game='))
    const weekArg = args.find(arg => arg.startsWith('--week='))

    let result

    if (gameIdArg) {
      // Scrape single game
      const gameId = gameIdArg.split('=')[1]
      logger.info(`Mode: Single game scrape (Game ID: ${gameId})`)
      result = await scrapeGameStats(gameId)

      logger.info('')
      logger.info('═'.repeat(60))
      logger.info('SINGLE GAME SCRAPE SUMMARY')
      logger.info('═'.repeat(60))
      logger.info(`✓ Team stats: ${result.teamStats} records`)
      logger.info(`✓ Scoring plays: ${result.scoringPlays} records`)
      logger.info(`✓ Game weather: ${result.gameWeather ? 'Updated' : 'Skipped'}`)
      logger.info('═'.repeat(60))

    } else if (weekArg) {
      // Scrape all completed games in a week
      const week = parseInt(weekArg.split('=')[1])
      logger.info(`Mode: Week scrape (Week ${week})`)
      result = await scrapeWeekStats(SEASON_YEAR, week)

      logger.info('')
      logger.info('═'.repeat(60))
      logger.info('WEEK SCRAPE SUMMARY')
      logger.info('═'.repeat(60))
      logger.info(`✓ Games processed: ${result.success}/${result.total}`)
      logger.info(`✗ Games failed: ${result.failed}/${result.total}`)
      logger.info('═'.repeat(60))

    } else {
      logger.error('Missing required argument: --game=<id> or --week=<number>')
      logger.info('Usage:')
      logger.info('  npm run scrape:game-stats -- --game=401772510')
      logger.info('  npm run scrape:game-stats -- --week=7')
      process.exit(1)
    }

    const duration = Date.now() - startTime
    logScriptEnd(SCRIPT_NAME, {
      success: result.success || result.teamStats || 0,
      failed: result.failed || 0,
      total: result.total || 1,
      duration
    })

    process.exit(0)

  } catch (error) {
    logger.error('Game stats scraper failed:', error)
    logScriptEnd(SCRIPT_NAME, {
      success: 0,
      failed: 1,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

main()
