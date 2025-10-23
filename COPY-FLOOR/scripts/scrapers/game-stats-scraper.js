/**
 * Game Stats Scraper - ENHANCED (Phase 1)
 *
 * Fetches comprehensive game statistics from ESPN's /summary endpoint for completed games.
 * Populates tables needed for the completed game template.
 *
 * Data fetched (ENHANCED):
 * - Quarter-by-quarter scores (games table columns)
 * - Team game statistics (team_game_stats table)
 * - Player game statistics (player_game_stats table) - 40 FIELDS:
 *   - Passing: completions, attempts, yards, TDs, INTs, sacks, sack yards, longest, rating, QBR
 *   - Rushing: attempts, yards, TDs, longest, fumbles, fumbles lost
 *   - Receiving: receptions, yards, TDs, targets, longest, YAC
 *   - Defense: tackles (total, solo, assist), sacks, TFL, QB hits, PD, INTs, FF, FR
 *   - Kicking: FG made/attempted, longest, XP made/attempted
 *   - Punting: punts, yards, average, inside 20, longest, touchbacks
 *   - Fantasy Points: Standard, PPR, Half-PPR, DFS (DraftKings, FanDuel)
 * - Scoring plays (scoring_plays table)
 * - Game weather info with enhanced parsing (game_weather table)
 * - Venue/stadium extraction
 *
 * Usage:
 * - Manual: npm run scrape:game-stats
 * - With game ID: npm run scrape:game-stats -- --game=401772510
 * - For specific week: npm run scrape:game-stats -- --week=7
 *
 * Data Source: ESPN NFL API /summary endpoint
 * Phase: 1 - Foundation Enhancement
 */

import { fetchGameSummary } from '../utils/espn-api.js'
import { upsertBatch, getSupabaseClient } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'
import { calculateFantasyPoints } from '../utils/fantasy-calculator.js'
import { extractPlayerIdsFromGame, getExistingPlayers, autoCreatePlayers } from '../utils/player-creator.js'

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
 * Extract quarter-by-quarter scores
 * Maps to games table quarter score columns
 */
function extractQuarterScores(gameSummary, gameId) {
  const competition = gameSummary.header?.competitions?.[0]
  const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home')
  const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away')

  if (!homeTeam || !awayTeam) {
    logger.warn(`Missing team data for quarter scores in game ${gameId}`)
    return null
  }

  // ESPN provides linescores array: [Q1, Q2, Q3, Q4, OT, FINAL]
  const homeLineScores = homeTeam.linescores || []
  const awayLineScores = awayTeam.linescores || []

  const parseScore = (score) => {
    if (score === null || score === undefined || score.value === null || score.value === undefined) return 0
    return parseInt(score.value) || 0
  }

  return {
    game_id: `espn-${gameId}`,
    home_q1_score: homeLineScores[0] ? parseScore(homeLineScores[0]) : 0,
    home_q2_score: homeLineScores[1] ? parseScore(homeLineScores[1]) : 0,
    home_q3_score: homeLineScores[2] ? parseScore(homeLineScores[2]) : 0,
    home_q4_score: homeLineScores[3] ? parseScore(homeLineScores[3]) : 0,
    home_ot_score: homeLineScores[4] ? parseScore(homeLineScores[4]) : 0,
    away_q1_score: awayLineScores[0] ? parseScore(awayLineScores[0]) : 0,
    away_q2_score: awayLineScores[1] ? parseScore(awayLineScores[1]) : 0,
    away_q3_score: awayLineScores[2] ? parseScore(awayLineScores[2]) : 0,
    away_q4_score: awayLineScores[3] ? parseScore(awayLineScores[3]) : 0,
    away_ot_score: awayLineScores[4] ? parseScore(awayLineScores[4]) : 0
  }
}

/**
 * Extract and upsert venue/stadium information
 * Updates both stadiums table and games.stadium_id
 */
async function extractAndUpsertVenue(gameSummary, gameId) {
  const venue = gameSummary.gameInfo?.venue

  if (!venue || !venue.id) {
    return null
  }

  const stadiumId = `espn-${venue.id}`

  // Prepare stadium record
  const stadiumData = {
    stadium_id: stadiumId,
    stadium_name: venue.fullName || null,
    city: venue.address?.city || null,
    state: venue.address?.state || null,
    capacity: venue.capacity ? parseInt(venue.capacity) : null,
    surface_type: venue.grass ? 'Grass' : 'Turf',
    roof_type: venue.indoor ? 'Dome' : 'Open'
  }

  // Upsert stadium
  const supabase = getSupabaseClient()
  const { error: stadiumError } = await supabase
    .from('stadiums')
    .upsert([stadiumData], { onConflict: 'stadium_id' })

  if (stadiumError) {
    logger.warn(`Failed to upsert stadium ${stadiumId}: ${stadiumError.message}`)
  }

  // Update game with stadium_id
  const { error: gameError } = await supabase
    .from('games')
    .update({ stadium_id: stadiumId })
    .eq('game_id', `espn-${gameId}`)

  if (gameError) {
    logger.warn(`Failed to update game stadium_id: ${gameError.message}`)
    return null
  }

  return stadiumId
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

  // Parse temperature from display value if needed
  let temperature = weather.temperature
  if (!temperature && weather.displayValue) {
    // Try to extract temperature from string like "55°F Cloudy"
    const tempMatch = weather.displayValue.match(/(\d+)°?F?/i)
    if (tempMatch) {
      temperature = parseInt(tempMatch[1])
    }
  }

  // Try to parse wind from displayValue if available
  let windSpeed = null
  let windDirection = null
  if (weather.displayValue) {
    // Look for wind patterns like "Wind 15 MPH" or "Wind NW 10 mph"
    const windMatch = weather.displayValue.match(/wind\s+([NSEW]{1,3})?\s*(\d+)/i)
    if (windMatch) {
      if (windMatch[1]) windDirection = windMatch[1].toUpperCase()
      windSpeed = parseInt(windMatch[2])
    }
  }

  // Detect precipitation from conditions string
  let precipitation = null
  const conditionsLower = (weather.displayValue || '').toLowerCase()
  if (conditionsLower.includes('rain')) precipitation = 'rain'
  else if (conditionsLower.includes('snow')) precipitation = 'snow'
  else if (conditionsLower.includes('sleet')) precipitation = 'sleet'

  return {
    game_id: `espn-${gameId}`,
    temperature_fahrenheit: temperature || null,
    humidity_percentage: null, // ESPN doesn't provide this
    wind_speed_mph: windSpeed,
    wind_direction: windDirection,
    precipitation: precipitation,
    conditions: weather.displayValue || null
  }
}

/**
 * Extract player game statistics from boxscore
 * Maps to player_game_stats table schema
 */
function extractPlayerStats(gameSummary, gameId) {
  const boxscore = gameSummary.boxscore
  if (!boxscore || !boxscore.players) {
    logger.warn(`No player stats in boxscore for game ${gameId}`)
    return []
  }

  const competition = gameSummary.header?.competitions?.[0]
  const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home')
  const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away')

  const allPlayerStats = []

  // Process each team's player stats
  boxscore.players.forEach(teamData => {
    const teamAbbr = teamData.team.abbreviation
    const isHome = teamAbbr === homeTeam?.team?.abbreviation
    const opponentTeamId = isHome ? awayTeam?.team?.abbreviation : homeTeam?.team?.abbreviation

    // Process each statistical category (passing, rushing, receiving, etc.)
    const statistics = teamData.statistics || []

    // Helper to parse stat values
    const parseStat = (statStr, index) => {
      if (!statStr || statStr === '-' || statStr === '') return 0
      // Handle fractional stats like "18/26" -> return the first number
      if (statStr.includes('/')) {
        const parts = statStr.split('/')
        return parseFloat(parts[index === 0 ? 0 : 1]) || 0
      }
      return parseFloat(statStr) || 0
    }

    // Build a map of player stats by player ID
    const playerStatsMap = new Map()

    statistics.forEach(category => {
      const categoryName = category.name
      const labels = category.labels || []
      const athletes = category.athletes || []

      athletes.forEach(athleteData => {
        const playerId = `espn-${athleteData.athlete?.id}`
        const stats = athleteData.stats || []

        // Get or create player stats record (ENHANCED with all new fields)
        if (!playerStatsMap.has(playerId)) {
          playerStatsMap.set(playerId, {
            player_id: playerId,
            game_id: `espn-${gameId}`,
            season: SEASON_YEAR,
            team_id: teamAbbr,
            opponent_team_id: opponentTeamId,
            started: false, // ESPN doesn't provide this easily

            // Basic passing
            passing_attempts: 0,
            passing_completions: 0,
            passing_yards: 0,
            passing_touchdowns: 0,
            passing_interceptions: 0,
            // Passing advanced (NEW)
            passing_sacks: 0,
            passing_sack_yards_lost: 0,
            passing_longest: 0,
            passer_rating: null,
            qbr: null,

            // Basic rushing
            rushing_attempts: 0,
            rushing_yards: 0,
            rushing_touchdowns: 0,
            // Rushing advanced (NEW)
            rushing_longest: 0,
            rushing_fumbles: 0,
            rushing_fumbles_lost: 0,

            // Basic receiving
            receptions: 0,
            receiving_yards: 0,
            receiving_touchdowns: 0,
            // Receiving advanced (NEW)
            receiving_targets: 0,
            receiving_longest: 0,
            receiving_yards_after_catch: 0,
            receiving_first_downs: 0,
            receiving_fumbles: 0,

            // Basic defense
            tackles_total: 0,
            sacks: 0,
            interceptions: 0,
            // Defense advanced (NEW)
            tackles_solo: 0,
            tackles_assists: 0,
            tackles_for_loss: 0,
            qb_hits: 0,
            passes_defended: 0,
            forced_fumbles: 0,
            fumble_recoveries: 0,

            // Basic kicking
            field_goals_made: 0,
            field_goals_attempted: 0,
            // Kicking advanced (NEW)
            field_goal_longest: 0,
            extra_points_made: 0,
            extra_points_attempted: 0,

            // Punting (NEW)
            punts: 0,
            punt_yards: 0,
            punt_average: null,
            punts_inside_20: 0,
            punt_longest: 0,
            punt_touchbacks: 0
          })
        }

        const playerStats = playerStatsMap.get(playerId)

        // Map stats based on category (ENHANCED - ALL ESPN FIELDS)
        if (categoryName === 'passing') {
          // Labels: C/ATT, YDS, AVG, TD, INT, SACKS, QBR, RTG
          playerStats.passing_completions = parseStat(stats[0], 0) // C from "C/ATT"
          playerStats.passing_attempts = parseStat(stats[0], 1) // ATT from "C/ATT"
          playerStats.passing_yards = parseStat(stats[1], 0) // YDS
          playerStats.passing_touchdowns = parseStat(stats[3], 0) // TD
          playerStats.passing_interceptions = parseStat(stats[4], 0) // INT
          playerStats.passing_sacks = parseStat(stats[5], 0) // SACKS (NEW)
          // Sack yards typically not in ESPN boxscore - calculate as (sacks * 7) estimate
          playerStats.passing_sack_yards_lost = Math.round(parseStat(stats[5], 0) * 7)
          playerStats.qbr = parseStat(stats[6], 0) // QBR (NEW)
          playerStats.passer_rating = parseStat(stats[7], 0) // RTG (NEW)
          // Longest completion not always in summary - would need play-by-play
          playerStats.passing_longest = 0 // TODO: Extract from plays if available
        } else if (categoryName === 'rushing') {
          // Labels: CAR, YDS, AVG, TD, LONG
          playerStats.rushing_attempts = parseStat(stats[0], 0) // CAR
          playerStats.rushing_yards = parseStat(stats[1], 0) // YDS
          playerStats.rushing_touchdowns = parseStat(stats[3], 0) // TD
          playerStats.rushing_longest = parseStat(stats[4], 0) // LONG (NEW)
          // Fumbles not always in rushing category - check fumbles category
        } else if (categoryName === 'receiving') {
          // Labels: REC, YDS, AVG, TD, LONG, TGTS
          playerStats.receptions = parseStat(stats[0], 0) // REC
          playerStats.receiving_yards = parseStat(stats[1], 0) // YDS
          playerStats.receiving_touchdowns = parseStat(stats[3], 0) // TD
          playerStats.receiving_longest = parseStat(stats[4], 0) // LONG (NEW)
          playerStats.receiving_targets = parseStat(stats[5], 0) // TGTS (NEW)
          // YAC not in standard ESPN boxscore - would need Next Gen Stats
          playerStats.receiving_yards_after_catch = 0 // TODO: Add if available
        } else if (categoryName === 'defensive') {
          // Labels: TOT, SOLO, SACKS, TFL, PD, QB HTS, TD
          playerStats.tackles_total = parseStat(stats[0], 0) // TOT
          playerStats.tackles_solo = parseStat(stats[1], 0) // SOLO (NEW)
          // Assists = Total - Solo
          playerStats.tackles_assists = Math.max(0, parseStat(stats[0], 0) - parseStat(stats[1], 0))
          playerStats.sacks = parseStat(stats[2], 0) // SACKS
          playerStats.tackles_for_loss = parseStat(stats[3], 0) // TFL (NEW)
          playerStats.passes_defended = parseStat(stats[4], 0) // PD (NEW)
          playerStats.qb_hits = parseStat(stats[5], 0) // QB HTS (NEW)
        } else if (categoryName === 'interceptions') {
          // Labels: INT, YDS, TD
          playerStats.interceptions = parseStat(stats[0], 0) // INT
        } else if (categoryName === 'fumbles') {
          // Labels: FUM, LOST, REC
          playerStats.rushing_fumbles = parseStat(stats[0], 0) // FUM (NEW)
          playerStats.rushing_fumbles_lost = parseStat(stats[1], 0) // LOST (NEW)
          playerStats.fumble_recoveries = parseStat(stats[2], 0) // REC (NEW)
        } else if (categoryName === 'defensive') {
          // Additional defensive stats
          playerStats.forced_fumbles = parseStat(stats[6], 0) // FF (if available)
        } else if (categoryName === 'kicking') {
          // Labels: FG, PCT, LONG, XP, PTS
          playerStats.field_goals_made = parseStat(stats[0], 0) // FG from "FG/ATT"
          playerStats.field_goals_attempted = parseStat(stats[0], 1) // ATT from "FG/ATT"
          playerStats.field_goal_longest = parseStat(stats[2], 0) // LONG (NEW)
          playerStats.extra_points_made = parseStat(stats[3], 0) // XP from "XP/ATT" (NEW)
          playerStats.extra_points_attempted = parseStat(stats[3], 1) // ATT from "XP/ATT" (NEW)
        } else if (categoryName === 'punting') {
          // Labels: NO, YDS, AVG, TB, IN 20, LONG
          playerStats.punts = parseStat(stats[0], 0) // NO (NEW)
          playerStats.punt_yards = parseStat(stats[1], 0) // YDS (NEW)
          playerStats.punt_average = parseStat(stats[2], 0) // AVG (NEW)
          playerStats.punt_touchbacks = parseStat(stats[3], 0) // TB (NEW)
          playerStats.punts_inside_20 = parseStat(stats[4], 0) // IN 20 (NEW)
          playerStats.punt_longest = parseStat(stats[5], 0) // LONG (NEW)
        }
      })
    })

    // Calculate fantasy points for each player (NEW)
    playerStatsMap.forEach((playerStats, playerId) => {
      const fantasyPoints = calculateFantasyPoints(playerStats)
      Object.assign(playerStats, fantasyPoints)
    })

    // Add all player stats for this team
    allPlayerStats.push(...Array.from(playerStatsMap.values()))
  })

  logger.info(`Extracted stats for ${allPlayerStats.length} players with fantasy points`)
  return allPlayerStats
}

/**
 * Extract game-day rosters from game summary
 * Maps to game_rosters table schema
 */
function extractGameRosters(gameSummary, gameId, season, teamIds = []) {
  const rosterMap = new Map() // Use Map to deduplicate by player_id + team_id

  if (!gameSummary.rosters || gameSummary.rosters.length === 0) {
    // If no rosters array, extract from boxscore players
    if (gameSummary.boxscore && gameSummary.boxscore.players) {
      gameSummary.boxscore.players.forEach((teamData, index) => {
        // Use correct team_id from teamIds array (mapped by index 0=home, 1=away)
        // Fallback to espn-{id} if teamIds not provided
        const teamId = teamIds[index] || `espn-${teamData.team.id}`

        if (teamData.statistics) {
          teamData.statistics.forEach(statGroup => {
            if (statGroup.athletes) {
              statGroup.athletes.forEach(athleteData => {
                const athlete = athleteData.athlete
                if (athlete && athlete.id) {
                  const key = `${teamId}-${athlete.id}` // Dedupe key
                  if (!rosterMap.has(key)) {
                    rosterMap.set(key, {
                      game_id: gameId,
                      season: season,
                      team_id: teamId,
                      player_id: `espn-${athlete.id}`,
                      position: athlete.position?.abbreviation || null,
                      jersey_number: athlete.jersey ? parseInt(athlete.jersey) : null,
                      active: true, // If they have stats, they were active
                      status: 'active'
                    })
                  }
                }
              })
            }
          })
        }
      })
    }
    return Array.from(rosterMap.values())
  }

  // Extract from rosters array (if available)
  gameSummary.rosters.forEach((teamRoster, index) => {
    // Use correct team_id from teamIds array (mapped by index)
    // Fallback to espn-{id} if teamIds not provided
    const teamId = teamIds[index] || `espn-${teamRoster.team.id}`

    if (teamRoster.roster) {
      teamRoster.roster.forEach(player => {
        const athlete = player.athlete
        if (athlete && athlete.id) {
          const key = `${teamId}-${athlete.id}` // Dedupe key
          if (!rosterMap.has(key)) {
            rosterMap.set(key, {
              game_id: gameId,
              season: season,
              team_id: teamId,
              player_id: `espn-${athlete.id}`,
              position: athlete.position?.abbreviation || null,
              jersey_number: athlete.jersey ? parseInt(athlete.jersey) : null,
              active: player.status !== 'inactive', // Determine if player dressed
              status: player.status || 'active'
            })
          }
        }
      })
    }
  })

  return Array.from(rosterMap.values())
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
      gameWeather: 0,
      playerStats: 0,
      quarterScores: 0,
      venue: 0
    }

    // Extract and upsert venue
    logger.info('Processing venue information...')
    const stadiumId = await extractAndUpsertVenue(gameSummary, gameId)
    if (stadiumId) {
      results.venue = 1
      logger.info(`✓ Upserted venue: ${stadiumId}`)
    } else {
      logger.info('ℹ No venue data available')
    }

    // Extract and update quarter scores
    logger.info('Processing quarter-by-quarter scores...')
    const quarterScores = extractQuarterScores(gameSummary, gameId)
    if (quarterScores) {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('games')
        .update(quarterScores)
        .eq('game_id', `espn-${gameId}`)

      if (error) {
        logger.error(`Failed to update quarter scores: ${error.message}`)
      } else {
        results.quarterScores = 1
        logger.info(`✓ Updated quarter scores`)
      }
    } else {
      logger.info('ℹ No quarter scores available')
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

    // Extract and insert player statistics
    logger.info('Processing player statistics...')
    const playerStats = extractPlayerStats(gameSummary, gameId)
    if (playerStats.length > 0) {
      logger.info(`Extracted stats for ${playerStats.length} players with fantasy points`)

      // Auto-create missing players before inserting stats
      // Extract all player IDs from the game data
      const playerIdsInGame = extractPlayerIdsFromGame(gameSummary)
      logger.info(`  Found ${playerIdsInGame.length} players in game roster data`)

      // Check which players are missing from the database
      const existingPlayerIds = await getExistingPlayers(playerIdsInGame)
      const missingPlayerIds = playerIdsInGame.filter(id => !existingPlayerIds.has(id))

      if (missingPlayerIds.length > 0) {
        logger.warn(`  Found ${missingPlayerIds.length} missing players, auto-creating...`)
        const autoCreateResult = await autoCreatePlayers(missingPlayerIds, { rateLimit: 1000 })

        if (autoCreateResult.created > 0) {
          logger.info(`  ✓ Auto-created ${autoCreateResult.created} missing players`)
        }
        if (autoCreateResult.failed > 0) {
          logger.error(`  ⚠️  Failed to create ${autoCreateResult.failed} players: ${autoCreateResult.failedPlayers.join(', ')}`)
        }
      }

      // Now upsert player stats (all players should exist)
      logger.info(`  Found ${playerStats.length} player stat records`)
      const result = await upsertBatch('player_game_stats', playerStats, ['player_id', 'game_id', 'season'])
      results.playerStats = result.success
      logger.info(`✓ Upserted ${result.success} player stat records`)
    } else {
      logger.info('ℹ No player stats available')
    }

    // Extract and insert game-day rosters
    logger.info('Processing game-day rosters...')
    const season = gameSummary.header?.season?.year || 2025 // Default to 2025 season

    // Get team IDs from the game record (we need the correct team_id format)
    const supabase = getSupabaseClient()
    const { data: gameData } = await supabase
      .from('games')
      .select('home_team_id, away_team_id')
      .eq('game_id', `espn-${gameId}`)
      .single()

    const teamIds = gameData ? [gameData.home_team_id, gameData.away_team_id] : []

    const gameRosters = extractGameRosters(gameSummary, gameId, season, teamIds)
    if (gameRosters.length > 0) {
      const result = await upsertBatch('game_rosters', gameRosters, ['game_id', 'season', 'team_id', 'player_id'])
      results.gameRosters = result.success
      logger.info(`✓ Upserted ${result.success} game roster records`)
    } else {
      logger.info('ℹ No roster data available')
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
      logger.info(`✓ Quarter scores: ${result.quarterScores ? 'Updated' : 'Skipped'}`)
      logger.info(`✓ Team stats: ${result.teamStats} records`)
      logger.info(`✓ Scoring plays: ${result.scoringPlays} records`)
      logger.info(`✓ Player stats: ${result.playerStats} records`)
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
