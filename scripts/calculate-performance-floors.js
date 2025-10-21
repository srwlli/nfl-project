/**
 * Calculate Performance Floors for Players
 *
 * Estimates conservative baseline (floor) for player performance using:
 * - Player usage baseline (U)
 * - Opponent defensive efficiency (O)
 * - Game environment modifier (G)
 * - Recent trend adjustment (A)
 * - Player variance (σ)
 *
 * Formula: Expected = (recent_avg × opponent_modifier)
 *          Floor = Expected - (std_dev × volatility_factor)
 */

import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

// Configuration
const CONFIG = {
  rolling_window_weeks: 3,      // Recent form window
  volatility_factor: 0.75,       // Floor conservatism (0.5-1.0)
  current_season: 2025,
  min_games_played: 2,           // Minimum games for reliability

  // Position-specific volatility (Phase 1.4)
  position_volatility: {
    QB: 0.6,   // Most consistent
    RB: 0.8,   // Medium variance
    WR: 0.9,   // Highest variance
    TE: 0.75   // Medium-high
  },

  // Venue modifiers (Phase 2.1)
  venue_modifiers: {
    turf: 1.03,      // Faster surface
    grass: 1.00,     // Baseline
    dome: 1.02,      // Controlled environment
    outdoor: 1.00    // Baseline
  },

  // Weather penalties (Phase 2.1)
  weather_penalties: {
    high_wind: 0.95,       // >15 mph
    precipitation: 0.92,   // Rain/snow
    extreme_cold: 0.94     // <25°F
  },

  // Opportunity-based projection weights (Phase 2.2)
  opportunity_weights: {
    season: 0.4,
    recent: 0.6
  },

  // Adaptive rolling window by position (Phase 2.3)
  rolling_window_by_position: {
    QB: 5,   // Most stable - use more games
    RB: 3,   // Volatile (injuries, game scripts) - use fewer games
    WR: 4,   // Medium
    TE: 4    // Medium
  }
}

/**
 * Get opponent team for a game
 */
function getOpponent(game, teamId) {
  return game.home_team_id === teamId ? game.away_team_id : game.home_team_id
}

/**
 * Calculate opponent defensive efficiency factor (Phase 1.1)
 * Returns a modifier (0.7-1.3) based on opponent's defensive strength
 *
 * @param {string} opponentId - Opponent team ID
 * @param {string} statCategory - Stat to evaluate ('passing', 'rushing', 'receiving')
 * @param {number} season - Current season
 * @param {number} beforeWeek - Only include games before this week
 * @returns {Promise<number>} Opponent factor (1.0 = league average, >1 = easier, <1 = tougher)
 */
async function calculateOpponentFactor(opponentId, statCategory, season, beforeWeek) {
  try {
    // Get opponent's defensive stats for the season (before current week)
    // NOTE: team_game_stats has total_yards_allowed but not passing/rushing breakdown
    // So we use total_yards_allowed as a general defensive efficiency metric
    const { data: opponentGames } = await supabase
      .from('team_game_stats')
      .select('game_id, total_yards_allowed')
      .eq('team_id', opponentId)
      .eq('season', season)

    if (!opponentGames || opponentGames.length === 0) {
      return 1.0 // Default to league average if no data
    }

    // Filter to games before current week
    const gameIds = opponentGames.map(g => g.game_id)
    const { data: gameWeeks } = await supabase
      .from('games')
      .select('game_id, week')
      .in('game_id', gameIds)
      .eq('season', season)
      .lt('week', beforeWeek)
      .eq('status', 'final') // Phase 1.2: Only use completed games

    const validGameIds = new Set(gameWeeks?.map(g => g.game_id) || [])
    const filteredGames = opponentGames.filter(g => validGameIds.has(g.game_id))

    if (filteredGames.length === 0) {
      return 1.0
    }

    // Calculate opponent's average yards allowed per game
    const opponentAvg = filteredGames.reduce((sum, g) => sum + (g.total_yards_allowed || 0), 0) / filteredGames.length

    // Get league-wide average for normalization
    const { data: allTeamStats } = await supabase
      .from('team_game_stats')
      .select('game_id, total_yards_allowed')
      .eq('season', season)

    if (!allTeamStats || allTeamStats.length === 0) {
      return 1.0
    }

    // Filter to completed games before current week
    const { data: allGameWeeks } = await supabase
      .from('games')
      .select('game_id, week')
      .eq('season', season)
      .lt('week', beforeWeek)
      .eq('status', 'final')

    const validAllGameIds = new Set(allGameWeeks?.map(g => g.game_id) || [])
    const filteredAllGames = allTeamStats.filter(g => validAllGameIds.has(g.game_id))

    if (filteredAllGames.length === 0) {
      return 1.0
    }

    const leagueAvg = filteredAllGames.reduce((sum, g) => sum + (g.total_yards_allowed || 0), 0) / filteredAllGames.length

    if (leagueAvg === 0) {
      return 1.0
    }

    // Calculate factor: opponent_avg / league_avg
    // Higher yards allowed = easier matchup (weaker defense) = factor > 1
    const rawFactor = opponentAvg / leagueAvg

    // Cap factor between 0.7 (tough defense) and 1.3 (weak defense)
    const cappedFactor = Math.min(1.3, Math.max(0.7, rawFactor))

    return Math.round(cappedFactor * 100) / 100
  } catch (error) {
    console.error('Error calculating opponent factor:', error)
    return 1.0 // Default to neutral on error
  }
}

/**
 * Calculate environment modifier for game (Phase 2.1)
 * Returns a combined modifier based on venue and weather conditions
 *
 * @param {string} gameId - Game identifier
 * @param {number} season - Season year
 * @returns {Promise<Object>} Environment modifier data
 */
async function calculateEnvironmentModifier(gameId, season) {
  try {
    let venueModifier = 1.0
    let weatherModifier = 1.0
    const details = []

    // Get game stadium info
    const { data: game } = await supabase
      .from('games')
      .select('stadium_id')
      .eq('game_id', gameId)
      .eq('season', season)
      .single()

    if (game?.stadium_id) {
      const { data: stadium } = await supabase
        .from('stadiums')
        .select('stadium_name, surface_type, roof_type')
        .eq('stadium_id', game.stadium_id)
        .single()

      if (stadium) {
        // Apply surface modifier
        if (stadium.surface_type?.toLowerCase().includes('turf')) {
          venueModifier *= CONFIG.venue_modifiers.turf
          details.push(`${stadium.stadium_name} (turf)`)
        } else if (stadium.surface_type?.toLowerCase().includes('grass')) {
          venueModifier *= CONFIG.venue_modifiers.grass
        }

        // Apply roof modifier
        if (stadium.roof_type?.toLowerCase() === 'dome' || stadium.roof_type?.toLowerCase() === 'retractable dome') {
          venueModifier *= CONFIG.venue_modifiers.dome
          details.push('dome')
        }
      }
    }

    // Get weather data (if available)
    const { data: weather } = await supabase
      .from('game_weather')
      .select('temperature, wind_speed, conditions')
      .eq('game_id', gameId)
      .single()

    if (weather) {
      // High wind penalty
      if (weather.wind_speed && weather.wind_speed > 15) {
        weatherModifier *= CONFIG.weather_penalties.high_wind
        details.push(`high wind (${weather.wind_speed}mph)`)
      }

      // Precipitation penalty
      if (weather.conditions && (
        weather.conditions.toLowerCase().includes('rain') ||
        weather.conditions.toLowerCase().includes('snow')
      )) {
        weatherModifier *= CONFIG.weather_penalties.precipitation
        details.push(weather.conditions.toLowerCase())
      }

      // Extreme cold penalty
      if (weather.temperature && weather.temperature < 25) {
        weatherModifier *= CONFIG.weather_penalties.extreme_cold
        details.push(`cold (${weather.temperature}°F)`)
      }
    }

    const combinedModifier = venueModifier * weatherModifier

    return {
      modifier: Math.round(combinedModifier * 100) / 100,
      venue: Math.round(venueModifier * 100) / 100,
      weather: Math.round(weatherModifier * 100) / 100,
      details: details.length > 0 ? details.join(', ') : 'standard conditions'
    }
  } catch (error) {
    console.error('Error calculating environment modifier:', error)
    return {
      modifier: 1.0,
      venue: 1.0,
      weather: 1.0,
      details: 'standard conditions'
    }
  }
}

/**
 * Validate data completeness (Phase 3.3)
 */
function validateDataCompleteness(game, players, stats) {
  const warnings = []
  const errors = []

  // Validate game exists
  if (!game) {
    errors.push('Game data not found')
    return { errors, warnings, isValid: false }
  }

  // Validate teams exist
  if (!game.home_team_id || !game.away_team_id) {
    errors.push('Missing team information')
  }

  // Warn if game is not final
  if (game.status !== 'final' && game.status !== 'scheduled') {
    warnings.push(`Game status is ${game.status} (may have incomplete data)`)
  }

  // Validate player data
  if (!players || players.length === 0) {
    warnings.push('No players found for this game')
  }

  // Validate minimum data threshold
  if (stats && stats.length < 10) {
    warnings.push(`Low stat count: ${stats.length} player stats (expected 20+)`)
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  }
}

/**
 * Calculate performance floors for a specific game
 */
async function calculateFloorsForGame(gameId, season = CONFIG.current_season) {
  console.log(`\n${'='.repeat(80)}`)
  console.log(`Calculating Performance Floors for Game: ${gameId}`)
  console.log('='.repeat(80))

  // Get game details
  const { data: game, error: gameError} = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, game_date, status')
    .eq('game_id', gameId)
    .eq('season', season)
    .single()

  if (gameError || !game) {
    console.error('Error fetching game:', gameError?.message || 'Game not found')
    return
  }

  // Phase 3.3: Validate data completeness
  const validation = validateDataCompleteness(game, null, null)
  if (!validation.isValid) {
    console.error('❌ Data validation failed:')
    validation.errors.forEach(err => console.error(`   - ${err}`))
    return
  }

  if (validation.warnings.length > 0) {
    console.log('⚠️  Data warnings:')
    validation.warnings.forEach(warn => console.log(`   - ${warn}`))
  }

  console.log(`\n📅 ${game.away_team_id} @ ${game.home_team_id} (Week ${game.week})`)
  console.log(`Status: ${game.status}`)
  console.log(`Date: ${game.game_date}`)

  // Get environment modifier (Phase 2.1)
  const environmentMod = await calculateEnvironmentModifier(gameId, season)
  console.log(`🏟️  Environment: ${environmentMod.details} (modifier: ${environmentMod.modifier}x)`)

  // Get active players for both teams
  const teams = [game.home_team_id, game.away_team_id]

  for (const teamId of teams) {
    const opponentId = getOpponent(game, teamId)
    console.log(`\n${'─'.repeat(80)}`)
    console.log(`Team: ${teamId} (vs ${opponentId})`)
    console.log('─'.repeat(80))

    // Get ALL player stats for this team this season (up to current week)
    // Then we'll filter to most recent N games with actual data
    const { data: allTeamStats } = await supabase
      .from('player_game_stats')
      .select('player_id, team_id, game_id')
      .eq('team_id', teamId)
      .eq('season', season)

    if (!allTeamStats || allTeamStats.length === 0) {
      console.log(`No player stats found for ${teamId} this season`)
      continue
    }

    // Get unique game IDs and filter to games before current week
    const uniqueGameIds = [...new Set(allTeamStats.map(s => s.game_id))]

    const { data: gamesWithStats } = await supabase
      .from('games')
      .select('game_id, week')
      .eq('season', season)
      .in('game_id', uniqueGameIds)
      .lt('week', game.week)
      .order('week', { ascending: false })

    if (!gamesWithStats || gamesWithStats.length === 0) {
      console.log(`No completed games with stats found for ${teamId} before week ${game.week}`)
      continue
    }

    console.log(`Found ${gamesWithStats.length} games with stats for ${teamId} before week ${game.week}`)

    // Use stats from these games
    const gameIdsWithStats = gamesWithStats.map(g => g.game_id)
    const players = allTeamStats.filter(s => gameIdsWithStats.includes(s.game_id))

    // Deduplicate players and get full names with positions
    const uniquePlayerIds = [...new Set(players?.map(p => p.player_id) || [])]

    if (uniquePlayerIds.length === 0) {
      console.log(`No players found for ${teamId} in recent games`)
      continue
    }

    const { data: playerDetails } = await supabase
      .from('players')
      .select('player_id, full_name, primary_position')
      .in('player_id', uniquePlayerIds)
      .in('primary_position', ['QB', 'RB', 'WR', 'TE'])  // Filter to skill positions

    // Create a map for lookups
    const playerMap = new Map(playerDetails?.map(p => [p.player_id, p]) || [])

    if (!players || players.length === 0 || uniquePlayerIds.length === 0) {
      console.log(`No skill position players found for ${teamId}`)
      continue
    }

    // Build player list with full names
    const enrichedPlayers = uniquePlayerIds
      .map(id => playerMap.get(id))
      .filter(p => p !== undefined)

    console.log(`Processing ${enrichedPlayers.length} skill position players for ${teamId}`)

    // Calculate floors for key positions
    const keyPlayers = await calculateTeamFloors(enrichedPlayers, teamId, opponentId, game.week, season, environmentMod)

    console.log(`Generated projections for ${keyPlayers.length} players`)

    // Display results
    displayTeamFloors(keyPlayers, teamId)
  }
}

/**
 * Calculate floors for team players (Phase 1.3: Batch queries with Promise.all)
 */
async function calculateTeamFloors(players, teamId, opponentId, week, season, environmentMod = { modifier: 1.0 }) {
  // Phase 1.3: Batch fetch all player stats in parallel
  const playerIds = players.map(p => p.player_id)

  const [statsResult, gamesResult, injuryResult] = await Promise.all([
    // Fetch all player stats at once
    supabase
      .from('player_game_stats')
      .select(`
        player_id, game_id,
        passing_yards, passing_attempts,
        rushing_yards, rushing_attempts,
        receiving_yards, receiving_targets,
        fantasy_points_ppr
      `)
      .in('player_id', playerIds)
      .eq('season', season),

    // Fetch all games for the season
    supabase
      .from('games')
      .select('game_id, week, status')
      .eq('season', season)
      .lt('week', week)
      .eq('status', 'final'), // Phase 1.2: Only use completed games

    // Phase 3.4: Fetch injury status for current week
    supabase
      .from('player_injury_status')
      .select('player_id, injury_status, injury_type')
      .in('player_id', playerIds)
      .eq('season', season)
      .eq('week', week)
  ])

  const allStats = statsResult.data || []
  const allGames = gamesResult.data || []
  const injuries = injuryResult.data || []

  // Create lookup maps
  const weekMap = new Map(allGames.map(g => [g.game_id, g.week]))
  const playerStatsMap = new Map()

  // Phase 3.4: Create injury lookup map
  const injuryMap = new Map(injuries.map(i => [i.player_id, i]))

  // Group stats by player
  for (const stat of allStats) {
    if (!playerStatsMap.has(stat.player_id)) {
      playerStatsMap.set(stat.player_id, [])
    }
    // Only include stats from completed games
    if (weekMap.has(stat.game_id)) {
      playerStatsMap.get(stat.player_id).push({
        ...stat,
        week: weekMap.get(stat.game_id)
      })
    }
  }

  // Phase 3.4: Filter out OUT/DOUBTFUL players, flag QUESTIONABLE
  const excludedPlayers = []
  const activePlayers = players.map(player => {
    const injury = injuryMap.get(player.player_id)

    if (injury) {
      // Exclude OUT and DOUBTFUL players
      if (injury.injury_status === 'out' || injury.injury_status === 'doubtful') {
        excludedPlayers.push({
          name: player.full_name,
          position: player.primary_position,
          status: injury.injury_status.toUpperCase(),
          injury: injury.injury_type
        })
        return null
      }

      // Flag QUESTIONABLE players
      if (injury.injury_status === 'questionable') {
        return {
          ...player,
          injury_warning: true,
          injury_type: injury.injury_type
        }
      }
    }

    return player
  }).filter(p => p !== null)

  // Log excluded players if any
  if (excludedPlayers.length > 0) {
    console.log(`\n❌ Excluded due to injury (${excludedPlayers.length}):`)
    for (const player of excludedPlayers) {
      console.log(`   ${player.name} (${player.position}) - ${player.status}${player.injury ? ` - ${player.injury}` : ''}`)
    }
  }

  // Process all active players in parallel
  const playerPromises = activePlayers.map(async (player) => {
    const seasonStats = playerStatsMap.get(player.player_id) || []

    if (seasonStats.length < CONFIG.min_games_played) {
      return null
    }

    // Phase 2.3: Get recent form using position-specific rolling window
    const rollingWindow = CONFIG.rolling_window_by_position[player.primary_position] || CONFIG.rolling_window_weeks
    const recentGames = seasonStats
      .sort((a, b) => b.week - a.week)
      .slice(0, rollingWindow)

    // Calculate stats by position
    const floorData = await calculatePlayerFloors(player, seasonStats, recentGames, opponentId, week, season, environmentMod)

    return floorData
  })

  const results = await Promise.all(playerPromises)
  return results.filter(r => r !== null)
}

/**
 * Calculate floors for individual player
 */
async function calculatePlayerFloors(player, seasonStats, recentGames, opponentId, week, season, environmentMod = { modifier: 1.0 }) {
  const stats = {
    player_id: player.player_id,
    player_name: player.full_name,
    position: player.primary_position,
    games_played: seasonStats.length,
    projections: []
  }

  // Determine which stats to project based on position
  const statCategories = getStatCategories(player.primary_position)

  for (const category of statCategories) {
    const projection = await calculateStatFloor(
      seasonStats,
      recentGames,
      category.stat,
      category.opportunity,
      player.primary_position,
      opponentId,
      week,
      season,
      environmentMod
    )

    if (projection) {
      stats.projections.push({
        stat: category.label,
        ...projection
      })
    }
  }

  return stats.projections.length > 0 ? stats : null
}

/**
 * Get stat categories by position
 */
function getStatCategories(position) {
  const categories = {
    QB: [
      { stat: 'passing_yards', opportunity: 'passing_attempts', label: 'Passing Yards' },
      { stat: 'fantasy_points_ppr', opportunity: 'passing_attempts', label: 'Fantasy Points' }
    ],
    RB: [
      { stat: 'rushing_yards', opportunity: 'rushing_attempts', label: 'Rushing Yards' },
      { stat: 'receiving_yards', opportunity: 'receiving_targets', label: 'Receiving Yards' },
      { stat: 'fantasy_points_ppr', opportunity: 'rushing_attempts', label: 'Fantasy Points' }
    ],
    WR: [
      { stat: 'receiving_yards', opportunity: 'receiving_targets', label: 'Receiving Yards' },
      { stat: 'fantasy_points_ppr', opportunity: 'receiving_targets', label: 'Fantasy Points' }
    ],
    TE: [
      { stat: 'receiving_yards', opportunity: 'receiving_targets', label: 'Receiving Yards' },
      { stat: 'fantasy_points_ppr', opportunity: 'receiving_targets', label: 'Fantasy Points' }
    ]
  }

  return categories[position] || []
}

/**
 * Calculate floor for specific stat (Enhanced with Phase 1.1, 1.4, 2.1, and 2.2)
 */
async function calculateStatFloor(seasonStats, recentGames, statField, opportunityField, position, opponentId, week, season, environmentMod = { modifier: 1.0 }) {
  // Filter out null values
  const seasonValues = seasonStats
    .map(g => g[statField])
    .filter(v => v !== null && v !== undefined && !isNaN(v))

  const recentValues = recentGames
    .map(g => g[statField])
    .filter(v => v !== null && v !== undefined && !isNaN(v))

  if (seasonValues.length === 0 || recentValues.length === 0) {
    return null
  }

  // Calculate season average and standard deviation
  const seasonAvg = seasonValues.reduce((a, b) => a + b, 0) / seasonValues.length
  const seasonStdDev = Math.sqrt(
    seasonValues.reduce((sum, val) => sum + Math.pow(val - seasonAvg, 2), 0) / seasonValues.length
  )

  // Calculate recent form average
  const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length

  // Phase 2.2: Opportunity-based projections for volume-dependent stats
  let expected
  if (opportunityField && (statField.includes('receiving') || statField.includes('rushing') || statField.includes('passing'))) {
    // Get opportunity data (targets, attempts)
    const seasonOpportunities = seasonStats
      .map(g => g[opportunityField])
      .filter(v => v !== null && v !== undefined && !isNaN(v))

    const recentOpportunities = recentGames
      .map(g => g[opportunityField])
      .filter(v => v !== null && v !== undefined && !isNaN(v))

    if (seasonOpportunities.length > 0 && recentOpportunities.length > 0) {
      // Step 1: Project opportunities (weighted average)
      const seasonAvgOpp = seasonOpportunities.reduce((a, b) => a + b, 0) / seasonOpportunities.length
      const recentAvgOpp = recentOpportunities.reduce((a, b) => a + b, 0) / recentOpportunities.length
      const projectedOpportunities = (seasonAvgOpp * CONFIG.opportunity_weights.season) +
                                     (recentAvgOpp * CONFIG.opportunity_weights.recent)

      // Step 2: Calculate efficiency (yards/completions per opportunity)
      const totalOpportunities = seasonOpportunities.reduce((a, b) => a + b, 0)
      const totalProduction = seasonValues.reduce((a, b) => a + b, 0)
      const efficiency = totalOpportunities > 0 ? totalProduction / totalOpportunities : 0

      // Step 3: Project production (opportunities × efficiency)
      if (efficiency > 0) {
        expected = projectedOpportunities * efficiency
      } else {
        // Fallback to simple average
        expected = (seasonAvg * 0.4) + (recentAvg * 0.6)
      }
    } else {
      // Fallback to simple average
      expected = (seasonAvg * 0.4) + (recentAvg * 0.6)
    }
  } else {
    // For non-opportunity stats (like fantasy points), use simple weighted average
    expected = (seasonAvg * 0.4) + (recentAvg * 0.6)
  }

  // Phase 1.1: Apply opponent defensive efficiency factor
  let opponentFactor = 1.0
  if (opponentId) {
    let statCategory = 'passing'
    if (statField.includes('rushing')) {
      statCategory = 'rushing'
    } else if (statField.includes('receiving')) {
      statCategory = 'receiving'
    }

    opponentFactor = await calculateOpponentFactor(opponentId, statCategory, season, week)
    expected = expected * opponentFactor
  }

  // Phase 2.1: Apply environment modifier (venue + weather)
  expected = expected * environmentMod.modifier

  // Phase 1.4: Use position-specific volatility
  const volatilityFactor = CONFIG.position_volatility[position] || CONFIG.volatility_factor

  // Phase 2.4: Percentile-based floor (15th percentile of actual outcomes)
  let floor
  if (seasonValues.length >= 3) {
    // Sort values and get 15th percentile
    const sortedValues = [...seasonValues].sort((a, b) => a - b)
    const percentileIndex = Math.floor(sortedValues.length * 0.15)
    const percentile15 = sortedValues[percentileIndex]

    // Use percentile-based floor (more realistic than linear)
    floor = Math.max(0, percentile15)
  } else {
    // Fallback to linear calculation for small samples
    floor = Math.max(0, expected - (seasonStdDev * volatilityFactor))
  }

  // Ceiling calculation: Expected + (σ × position_volatility_factor)
  const ceiling = expected + (seasonStdDev * volatilityFactor)

  // Confidence score (based on sample size and consistency)
  const confidence = calculateConfidence(seasonValues.length, seasonStdDev, seasonAvg)

  return {
    season_avg: Math.round(seasonAvg * 10) / 10,
    recent_avg: Math.round(recentAvg * 10) / 10,
    std_dev: Math.round(seasonStdDev * 10) / 10,
    expected: Math.round(expected * 10) / 10,
    floor: Math.round(floor * 10) / 10,
    ceiling: Math.round(ceiling * 10) / 10,
    confidence: confidence,
    opponent_factor: opponentFactor  // Show opponent matchup difficulty
  }
}

/**
 * Calculate confidence score (0-1)
 */
function calculateConfidence(sampleSize, stdDev, mean) {
  // Coefficient of variation (lower is more consistent)
  const cv = mean > 0 ? stdDev / mean : 1

  // Sample size factor (more games = higher confidence)
  const sampleFactor = Math.min(sampleSize / 10, 1)

  // Consistency factor (lower CV = higher confidence)
  const consistencyFactor = Math.max(0, 1 - cv)

  // Combined confidence
  const confidence = (sampleFactor * 0.4) + (consistencyFactor * 0.6)

  return Math.round(confidence * 100) / 100
}

/**
 * Display team floors in readable format
 * Shows top players by position: 1 QB, 2 RB, 3 WR, 1 TE
 */
function displayTeamFloors(players, teamId) {
  if (!players || players.length === 0) {
    console.log(`\nNo projections available for ${teamId}`)
    return
  }

  // Position limits for typical lineup
  const positionLimits = {
    'QB': 1,
    'RB': 2,
    'WR': 3,
    'TE': 1
  }

  const positions = ['QB', 'RB', 'WR', 'TE']

  for (const pos of positions) {
    const posPlayers = players.filter(p => p.position === pos)

    if (posPlayers.length === 0) continue

    // Sort by fantasy points expected (if available)
    posPlayers.sort((a, b) => {
      const aFantasy = a.projections.find(p => p.stat === 'Fantasy Points')
      const bFantasy = b.projections.find(p => p.stat === 'Fantasy Points')
      return (bFantasy?.expected || 0) - (aFantasy?.expected || 0)
    })

    // Limit to top N players per position
    const limit = positionLimits[pos] || 999
    const displayPlayers = posPlayers.slice(0, limit)

    console.log(`\n${pos}${limit > 1 ? 's' : ''} (Top ${limit}):`)
    console.log('─'.repeat(80))

    for (const player of displayPlayers) {
      // Phase 3.4: Display injury warning if player is questionable
      const injuryWarning = player.injury_warning ? ` ⚠️ QUESTIONABLE (${player.injury_type || 'Injury'})` : ''
      console.log(`\n  ${player.player_name} (${player.games_played} games)${injuryWarning}:`)

      for (const proj of player.projections) {
        console.log(`    ${proj.stat}:`)
        console.log(`      Expected: ${proj.expected} | Floor: ${proj.floor} | Ceiling: ${proj.ceiling}`)
        console.log(`      Recent: ${proj.recent_avg} | Season: ${proj.season_avg} | StdDev: ${proj.std_dev}`)

        // Show opponent matchup difficulty
        const matchupIndicator = proj.opponent_factor > 1.05 ? '✅ Easier' :
                                proj.opponent_factor < 0.95 ? '⚠️ Tougher' : '➖ Average'
        console.log(`      Opponent Factor: ${proj.opponent_factor} ${matchupIndicator}`)
        console.log(`      Confidence: ${(proj.confidence * 100).toFixed(0)}%`)
      }
    }
  }
}

/**
 * Calculate floors for games by week
 */
async function calculateFloorsForWeek(week, season = CONFIG.current_season) {
  console.log(`\nFetching games for Week ${week}...`)

  const { data: games } = await supabase
    .from('games')
    .select('game_id')
    .eq('season', season)
    .eq('week', week)
    .eq('status', 'scheduled')

  if (!games || games.length === 0) {
    console.log(`No scheduled games found for Week ${week}`)
    return
  }

  for (const game of games) {
    await calculateFloorsForGame(game.game_id, season)
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--help')) {
    console.log(`
Usage:
  node scripts/calculate-performance-floors.js [options]

Options:
  --game=<game_id>   Calculate floors for specific game
  --week=<week>      Calculate floors for all scheduled games in week
  --help             Show this help message

Examples:
  node scripts/calculate-performance-floors.js --week=7
  node scripts/calculate-performance-floors.js --game=401772510
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
    await calculateFloorsForWeek(week)
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
