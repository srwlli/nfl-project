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
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  calculatePositionStats,
  applyHierarchicalAdjustment
} from './utils/hierarchical-stats.js'
import {
  calculateModifiedPredictionInterval,
  assessConfidenceLevel,
  formatInterval
} from './utils/bootstrap-intervals.js'
import {
  calculateEWMAProjection,
  getPositionAlpha
} from './utils/temporal-smoothing.js'

const supabase = getSupabaseClient()

// Phase 3.1 (V2): Load configuration from external JSON file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const configPath = join(__dirname, 'performance-floors-config.json')
const CONFIG = JSON.parse(readFileSync(configPath, 'utf-8'))

// Phase 3.2 (V2): JSON logging mode flag
let JSON_MODE = false
const JSON_OUTPUT = {
  games: [],
  metadata: {
    timestamp: new Date().toISOString(),
    config: CONFIG
  }
}

// Phase 3.3 (V2): League average cache (key: "season-week-statCategory")
const LEAGUE_AVG_CACHE = new Map()

/**
 * Get modifier value (learned weights if available, otherwise default config)
 * Phase 4A (Academic): Random Forest feature importance
 *
 * @param {string} modifierType - Type of modifier (venue, weather, home)
 * @param {string} specificKey - Specific key within type (e.g., 'turf', 'high_wind')
 * @returns {number} Modifier value
 */
function getModifierValue(modifierType, specificKey) {
  // Check if learned weights exist
  if (CONFIG.learned_feature_weights?.importances) {
    const importances = CONFIG.learned_feature_weights.importances

    // Map config keys to feature importance keys
    const featureMap = {
      'home_field_advantage.home_modifier': 'is_home',
      'venue_modifiers.turf': 'is_turf',
      'venue_modifiers.dome': 'is_dome'
    }

    const featureKey = `${modifierType}.${specificKey}`
    const importanceKey = featureMap[featureKey]

    if (importanceKey && importances[importanceKey] !== undefined) {
      // Convert importance (0-1) to modifier (0.8-1.2 range)
      // Higher importance = stronger effect
      const baseEffect = 0.2 // ±20% maximum effect
      const importance = importances[importanceKey]
      const modifier = 1.0 + ((importance - 0.25) * baseEffect)

      return Math.max(0.8, Math.min(1.2, modifier))
    }
  }

  // Fall back to config default
  if (modifierType === 'venue_modifiers' && CONFIG[modifierType]) {
    return CONFIG[modifierType][specificKey] || 1.0
  } else if (modifierType === 'weather_penalties' && CONFIG[modifierType]) {
    return CONFIG[modifierType][specificKey] || 1.0
  } else if (modifierType === 'home_field_advantage' && CONFIG[modifierType]) {
    return CONFIG[modifierType][specificKey] || 1.0
  }

  return 1.0
}

/**
 * Conditional logging based on mode
 */
function log(...args) {
  if (!JSON_MODE) {
    console.log(...args)
  }
}

function logError(...args) {
  if (!JSON_MODE) {
    console.error(...args)
  } else {
    // In JSON mode, errors go to stderr but don't pollute stdout
    console.error(...args)
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
    // Phase 3.3 (V2): Check league average cache first
    const cacheKey = `${season}-${beforeWeek}-${statCategory}`
    let leagueAvg = LEAGUE_AVG_CACHE.get(cacheKey)

    // Get opponent's defensive stats for the season (before current week)
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

    // Task 16 (V4): Always fetch league-wide data for empirical Bayes (even if cached)
    // Get league-wide average for normalization
    const { data: allTeamStats } = await supabase
      .from('team_game_stats')
      .select('game_id, team_id, total_yards_allowed')  // Task 16 (V4): Include team_id for empirical Bayes
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

    // Calculate league average if not cached
    if (!leagueAvg) {
      leagueAvg = filteredAllGames.reduce((sum, g) => sum + (g.total_yards_allowed || 0), 0) / filteredAllGames.length
      // Cache the league average
      LEAGUE_AVG_CACHE.set(cacheKey, leagueAvg)
    }

    if (leagueAvg === 0) {
      return 1.0
    }

    // Calculate raw factor: opponent_avg / league_avg
    // Higher yards allowed = easier matchup (weaker defense) = factor > 1
    const rawFactor = opponentAvg / leagueAvg

    // Task 16 (V4): Empirical Bayes opponent factor shrinkage
    // Replaces heuristic shrinkage with data-driven optimal shrinkage
    let adjustedFactor = rawFactor

    if (CONFIG.empirical_bayes?.enabled !== false) {
      // Calculate between-team variance (τ²): variance of team defensive means
      // Get all teams' average yards allowed
      const teamMeans = []
      const teamStatsMap = new Map()

      // Group games by team
      for (const game of filteredAllGames) {
        if (!teamStatsMap.has(game.team_id)) {
          teamStatsMap.set(game.team_id, [])
        }
        teamStatsMap.get(game.team_id).push(game.total_yards_allowed || 0)
      }

      // Calculate mean for each team
      for (const [teamId, yards] of teamStatsMap.entries()) {
        if (yards.length > 0) {
          const teamMean = yards.reduce((a, b) => a + b, 0) / yards.length
          teamMeans.push(teamMean)
        }
      }

      // Between-team variance τ²
      const grandMean = teamMeans.reduce((a, b) => a + b, 0) / teamMeans.length
      const betweenTeamVariance = teamMeans.reduce((sum, mean) => sum + Math.pow(mean - grandMean, 2), 0) / (teamMeans.length - 1)

      // Calculate within-team variance (σ²): pooled variance within teams
      let totalSquaredDev = 0
      let totalGames = 0

      for (const [teamId, yards] of teamStatsMap.entries()) {
        if (yards.length > 1) {
          const teamMean = yards.reduce((a, b) => a + b, 0) / yards.length
          const squaredDev = yards.reduce((sum, val) => sum + Math.pow(val - teamMean, 2), 0)
          totalSquaredDev += squaredDev
          totalGames += yards.length
        }
      }

      const withinTeamVariance = totalGames > teamMeans.length ? totalSquaredDev / (totalGames - teamMeans.length) : 0

      // Optimal shrinkage factor: B = τ² / (τ² + σ²/n)
      const n = filteredGames.length
      const shrinkageFactor = betweenTeamVariance / (betweenTeamVariance + (withinTeamVariance / n))

      // Apply empirical Bayes shrinkage
      // shrunkFactor = B × observedFactor + (1-B) × pooledMean
      const pooledMean = CONFIG.bayesian_shrinkage?.target_mean || 1.0
      adjustedFactor = (shrinkageFactor * rawFactor) + ((1 - shrinkageFactor) * pooledMean)
    } else {
      // Fallback: Phase 2.1 (V2) heuristic Bayesian shrinkage
      const minSampleSize = CONFIG.bayesian_shrinkage.min_sample_size
      if (filteredGames.length < minSampleSize) {
        const weight = filteredGames.length / minSampleSize
        adjustedFactor = (rawFactor * weight) + (CONFIG.bayesian_shrinkage.target_mean * (1 - weight))
      }
    }

    // Cap factor between configured min/max (default: 0.7-1.3)
    const cappedFactor = Math.min(CONFIG.opponent_factor_caps.max, Math.max(CONFIG.opponent_factor_caps.min, adjustedFactor))

    return Math.round(cappedFactor * 100) / 100
  } catch (error) {
    logError('Error calculating opponent factor:', error)
    return 1.0 // Default to neutral on error
  }
}

/**
 * Task 12 (V4): Calculate player-specific environment performance
 *
 * Tracks historical player performance in specific conditions:
 * - Dome vs outdoor stadiums
 * - Turf vs grass surface
 * - Cold weather games (<32°F)
 * - High wind games (>15mph)
 *
 * Theory:
 * - Some players have proven track records in specific environments
 * - Example: Cold-weather QBs (Josh Allen), dome-specialist WRs
 * - Historical data more accurate than generic positional adjustments
 *
 * @param {string} playerId - Player's espn_id (e.g., 'espn-3139477')
 * @param {string} statField - Stat to analyze (e.g., 'passing_yards')
 * @param {Object} gameEnvironment - Current game environment (dome, turf, cold, wind)
 * @param {number} season - Current season
 * @returns {Promise<Object>} Player-specific environment adjustment
 */
async function calculatePlayerEnvironmentFactor(playerId, statField, gameEnvironment, season) {
  const minGamesForPersonalization = 3; // Need 3+ games in condition for personalization

  try {
    // Fetch ALL historical games for this player across all seasons (not just current)
    const { data: allGames, error } = await supabase
      .from('player_game_stats')
      .select(`
        game_id,
        season,
        ${statField}
      `)
      .eq('player_id', playerId)
      .not(statField, 'is', null);

    if (error || !allGames || allGames.length < minGamesForPersonalization) {
      // Not enough data - return neutral factor
      return { factor: 1.0, source: 'insufficient_data', gamesInCondition: 0 };
    }

    // Enrich games with environment data
    const gameIds = allGames.map(g => g.game_id);

    // Batch fetch stadium/weather data for all games
    const { data: gameData } = await supabase
      .from('games')
      .select('game_id, stadium_id')
      .in('game_id', gameIds);

    const gameStadiumMap = new Map(gameData?.map(g => [g.game_id, g.stadium_id]) || []);

    const stadiumIds = [...new Set(gameData?.map(g => g.stadium_id).filter(Boolean) || [])];
    const { data: stadiumData } = await supabase
      .from('stadiums')
      .select('stadium_id, surface_type, roof_type')
      .in('stadium_id', stadiumIds);

    const stadiumInfoMap = new Map(stadiumData?.map(s => [s.stadium_id, s]) || []);

    const { data: weatherData } = await supabase
      .from('game_weather')
      .select('game_id, temperature, wind_speed')
      .in('game_id', gameIds);

    const weatherMap = new Map(weatherData?.map(w => [w.game_id, w]) || []);

    // Categorize games by environment conditions
    const conditionGames = {
      dome: [],
      outdoor: [],
      turf: [],
      grass: [],
      cold: [],
      highWind: [],
      all: allGames
    };

    for (const game of allGames) {
      const stadiumId = gameStadiumMap.get(game.game_id);
      const stadium = stadiumId ? stadiumInfoMap.get(stadiumId) : null;
      const weather = weatherMap.get(game.game_id);

      if (stadium) {
        // Dome/outdoor
        const isDome = stadium.roof_type?.toLowerCase().includes('dome');
        if (isDome) {
          conditionGames.dome.push(game);
        } else {
          conditionGames.outdoor.push(game);
        }

        // Turf/grass
        const isTurf = stadium.surface_type?.toLowerCase().includes('turf');
        if (isTurf) {
          conditionGames.turf.push(game);
        } else {
          conditionGames.grass.push(game);
        }
      }

      if (weather) {
        // Cold weather
        if (weather.temperature && weather.temperature < 32) {
          conditionGames.cold.push(game);
        }

        // High wind
        if (weather.wind_speed && weather.wind_speed > 15) {
          conditionGames.highWind.push(game);
        }
      }
    }

    // Determine which condition to apply based on current game environment
    let relevantCondition = null;
    let conditionName = '';

    // Priority: Weather > Venue > Surface
    if (gameEnvironment.cold && conditionGames.cold.length >= minGamesForPersonalization) {
      relevantCondition = conditionGames.cold;
      conditionName = 'cold';
    } else if (gameEnvironment.highWind && conditionGames.highWind.length >= minGamesForPersonalization) {
      relevantCondition = conditionGames.highWind;
      conditionName = 'highWind';
    } else if (gameEnvironment.dome && conditionGames.dome.length >= minGamesForPersonalization) {
      relevantCondition = conditionGames.dome;
      conditionName = 'dome';
    } else if (gameEnvironment.outdoor && conditionGames.outdoor.length >= minGamesForPersonalization) {
      relevantCondition = conditionGames.outdoor;
      conditionName = 'outdoor';
    } else if (gameEnvironment.turf && conditionGames.turf.length >= minGamesForPersonalization) {
      relevantCondition = conditionGames.turf;
      conditionName = 'turf';
    } else if (gameEnvironment.grass && conditionGames.grass.length >= minGamesForPersonalization) {
      relevantCondition = conditionGames.grass;
      conditionName = 'grass';
    }

    if (!relevantCondition) {
      // No personalization available - return neutral
      return { factor: 1.0, source: 'insufficient_condition_data', gamesInCondition: 0 };
    }

    // Calculate player's performance in this condition vs overall average
    const conditionValues = relevantCondition.map(g => g[statField]).filter(v => v !== null && !isNaN(v));
    const allValues = conditionGames.all.map(g => g[statField]).filter(v => v !== null && !isNaN(v));

    if (conditionValues.length < minGamesForPersonalization || allValues.length < minGamesForPersonalization) {
      return { factor: 1.0, source: 'insufficient_sample', gamesInCondition: conditionValues.length };
    }

    const conditionAvg = conditionValues.reduce((a, b) => a + b, 0) / conditionValues.length;
    const overallAvg = allValues.reduce((a, b) => a + b, 0) / allValues.length;

    // Calculate factor as ratio of condition performance to overall performance
    const rawFactor = overallAvg > 0 ? conditionAvg / overallAvg : 1.0;

    // Task 12 (V4): Cap personalization to ±20% (0.80-1.20 range)
    // This prevents overfitting to small samples
    const cappedFactor = Math.min(1.20, Math.max(0.80, rawFactor));

    return {
      factor: Math.round(cappedFactor * 100) / 100,
      source: 'player_history',
      condition: conditionName,
      gamesInCondition: conditionValues.length,
      conditionAvg: Math.round(conditionAvg * 10) / 10,
      overallAvg: Math.round(overallAvg * 10) / 10
    };

  } catch (error) {
    logError(`Error calculating player environment factor for ${playerId}:`, error);
    return { factor: 1.0, source: 'error', gamesInCondition: 0 };
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
async function calculateEnvironmentModifier(gameId, season, teamId = null, game = null) {
  try {
    let venueModifier = 1.0
    let weatherModifier = 1.0
    let homeModifier = 1.0
    const details = []

    // Phase 2.2 (V2): Home field advantage
    // Phase 4A (Academic): Use learned weights if available
    if (teamId && game) {
      const isHome = game.home_team_id === teamId
      if (isHome) {
        homeModifier = getModifierValue('home_field_advantage', 'home_modifier')
        details.push('home advantage')
      } else {
        homeModifier = getModifierValue('home_field_advantage', 'away_modifier')
        details.push('away game')
      }
    }

    // Get game stadium info (fetch if not provided)
    if (!game) {
      const { data: gameData } = await supabase
        .from('games')
        .select('stadium_id, home_team_id, away_team_id')
        .eq('game_id', gameId)
        .eq('season', season)
        .single()
      game = gameData
    }

    if (game?.stadium_id) {
      const { data: stadium } = await supabase
        .from('stadiums')
        .select('stadium_name, surface_type, roof_type')
        .eq('stadium_id', game.stadium_id)
        .single()

      if (stadium) {
        // Phase 4A (Academic): Apply surface modifier (learned or default)
        if (stadium.surface_type?.toLowerCase().includes('turf')) {
          venueModifier *= getModifierValue('venue_modifiers', 'turf')
          details.push(`${stadium.stadium_name} (turf)`)
        } else if (stadium.surface_type?.toLowerCase().includes('grass')) {
          venueModifier *= getModifierValue('venue_modifiers', 'grass')
        }

        // Phase 4A (Academic): Apply roof modifier (learned or default)
        if (stadium.roof_type?.toLowerCase() === 'dome' || stadium.roof_type?.toLowerCase() === 'retractable dome') {
          venueModifier *= getModifierValue('venue_modifiers', 'dome')
          details.push('dome')
        }
      }
    }

    // Get weather data (if available)
    // NOTE: game_weather table may not exist - this is expected
    const { data: weather, error: weatherError } = await supabase
      .from('game_weather')
      .select('temperature, wind_speed, conditions')
      .eq('game_id', gameId)
      .single()

    // Phase 4A (Academic): Apply weather penalties (learned or default)
    // Skip weather modifiers if table doesn't exist
    if (weather && !weatherError) {
      // High wind penalty
      if (weather.wind_speed && weather.wind_speed > 15) {
        weatherModifier *= getModifierValue('weather_penalties', 'high_wind')
        details.push(`high wind (${weather.wind_speed}mph)`)
      }

      // Precipitation penalty
      if (weather.conditions && (
        weather.conditions.toLowerCase().includes('rain') ||
        weather.conditions.toLowerCase().includes('snow')
      )) {
        weatherModifier *= getModifierValue('weather_penalties', 'precipitation')
        details.push(weather.conditions.toLowerCase())
      }

      // Extreme cold penalty
      if (weather.temperature && weather.temperature < 25) {
        weatherModifier *= getModifierValue('weather_penalties', 'extreme_cold')
        details.push(`cold (${weather.temperature}°F)`)
      }
    }

    const combinedModifier = venueModifier * weatherModifier * homeModifier

    // Task 12 (V4): Expose environment conditions for player-specific adjustments
    const conditions = {
      dome: false,
      outdoor: false,
      turf: false,
      grass: false,
      cold: false,
      highWind: false
    };

    // Determine stadium conditions
    if (game?.stadium_id) {
      const { data: stadium } = await supabase
        .from('stadiums')
        .select('surface_type, roof_type')
        .eq('stadium_id', game.stadium_id)
        .single();

      if (stadium) {
        conditions.dome = stadium.roof_type?.toLowerCase().includes('dome') || false;
        conditions.outdoor = !conditions.dome;
        conditions.turf = stadium.surface_type?.toLowerCase().includes('turf') || false;
        conditions.grass = !conditions.turf;
      }
    }

    // Determine weather conditions
    if (weather && !weatherError) {
      conditions.cold = (weather.temperature && weather.temperature < 32) || false;
      conditions.highWind = (weather.wind_speed && weather.wind_speed > 15) || false;
    }

    return {
      modifier: Math.round(combinedModifier * 100) / 100,
      venue: Math.round(venueModifier * 100) / 100,
      weather: Math.round(weatherModifier * 100) / 100,
      home: Math.round(homeModifier * 100) / 100,
      details: details.length > 0 ? details.join(', ') : 'standard conditions',
      conditions: conditions // Task 12 (V4): Environment flags for player-specific adjustments
    }
  } catch (error) {
    logError('Error calculating environment modifier:', error)
    return {
      modifier: 1.0,
      home: 1.0,
      venue: 1.0,
      weather: 1.0,
      details: 'standard conditions',
      conditions: { dome: false, outdoor: false, turf: false, grass: false, cold: false, highWind: false }
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
  log(`\n${'='.repeat(80)}`)
  log(`Calculating Performance Floors for Game: ${gameId}`)
  log('='.repeat(80))

  // Get game details
  const { data: game, error: gameError} = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, game_date, status')
    .eq('game_id', gameId)
    .eq('season', season)
    .single()

  if (gameError || !game) {
    logError('Error fetching game:', gameError?.message || 'Game not found')
    return
  }

  // Phase 3.3: Validate data completeness
  const validation = validateDataCompleteness(game, null, null)
  if (!validation.isValid) {
    logError('❌ Data validation failed:')
    validation.errors.forEach(err => logError(`   - ${err}`))
    return
  }

  if (validation.warnings.length > 0) {
    log('⚠️  Data warnings:')
    validation.warnings.forEach(warn => log(`   - ${warn}`))
  }

  log(`\n📅 ${game.away_team_id} @ ${game.home_team_id} (Week ${game.week})`)
  log(`Status: ${game.status}`)
  log(`Date: ${game.game_date}`)

  // Get active players for both teams
  const teams = [game.home_team_id, game.away_team_id]

  for (const teamId of teams) {
    const opponentId = getOpponent(game, teamId)

    // Get environment modifier per team (Phase 2.1 + Phase 2.2 V2)
    const environmentMod = await calculateEnvironmentModifier(gameId, season, teamId, game)

    log(`\n${'─'.repeat(80)}`)
    log(`Team: ${teamId} (vs ${opponentId})`)
    log(`🏟️  Environment: ${environmentMod.details} (modifier: ${environmentMod.modifier}x)`)
    log('─'.repeat(80))

    // Get ALL player stats for this team this season (up to current week)
    // Then we'll filter to most recent N games with actual data
    const { data: allTeamStats } = await supabase
      .from('player_game_stats')
      .select('player_id, team_id, game_id')
      .eq('team_id', teamId)
      .eq('season', season)

    if (!allTeamStats || allTeamStats.length === 0) {
      log(`No player stats found for ${teamId} this season`)
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
      log(`No completed games with stats found for ${teamId} before week ${game.week}`)
      continue
    }

    log(`Found ${gamesWithStats.length} games with stats for ${teamId} before week ${game.week}`)

    // Use stats from these games
    const gameIdsWithStats = gamesWithStats.map(g => g.game_id)
    const players = allTeamStats.filter(s => gameIdsWithStats.includes(s.game_id))

    // Deduplicate players and get full names with positions
    const uniquePlayerIds = [...new Set(players?.map(p => p.player_id) || [])]

    if (uniquePlayerIds.length === 0) {
      log(`No players found for ${teamId} in recent games`)
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
      log(`No skill position players found for ${teamId}`)
      continue
    }

    // Build player list with full names
    const enrichedPlayers = uniquePlayerIds
      .map(id => playerMap.get(id))
      .filter(p => p !== undefined)

    log(`Processing ${enrichedPlayers.length} skill position players for ${teamId}`)

    // Calculate floors for key positions
    const keyPlayers = await calculateTeamFloors(enrichedPlayers, teamId, opponentId, game.week, season, environmentMod)

    log(`Generated projections for ${keyPlayers.length} players`)

    // Phase 3.2 (V2): Add to JSON output if in JSON mode
    if (JSON_MODE) {
      JSON_OUTPUT.games.push({
        game_id: game.game_id,
        week: game.week,
        team_id: teamId,
        opponent_id: opponentId,
        environment: environmentMod,
        players: keyPlayers
      })
    }

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
    // NOTE: player_injury_status table may be empty or not exist - this is expected
    supabase
      .from('player_injury_status')
      .select('player_id, injury_status, injury_type')
      .in('player_id', playerIds)
      .eq('season', season)
      .eq('week', week)
  ])

  const allStats = statsResult.data || []
  const allGames = gamesResult.data || []
  // If injury table doesn't exist or is empty, default to empty array (all players healthy)
  const injuries = (injuryResult.data && !injuryResult.error) ? injuryResult.data : []

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
    log(`\n❌ Excluded due to injury (${excludedPlayers.length}):`)
    for (const player of excludedPlayers) {
      log(`   ${player.name} (${player.position}) - ${player.status}${player.injury ? ` - ${player.injury}` : ''}`)
    }
  }

  // Phase 2 (Academic): Calculate position-level statistics for hierarchical modeling
  // Group players by position for between-player variance calculation
  const playersByPosition = {}
  for (const player of activePlayers) {
    const position = player.primary_position
    if (!playersByPosition[position]) {
      playersByPosition[position] = []
    }
    const seasonStats = playerStatsMap.get(player.player_id) || []
    if (seasonStats.length >= CONFIG.min_games_played) {
      playersByPosition[position].push({
        player_id: player.player_id,
        full_name: player.full_name,
        games: seasonStats
      })
    }
  }

  // Calculate position-level baseline stats for each position
  const positionStatsCache = {}
  for (const [position, positionPlayers] of Object.entries(playersByPosition)) {
    // For each relevant stat category for this position
    const statCategories = getStatCategories(position)
    positionStatsCache[position] = {}

    for (const category of statCategories) {
      const statField = category.stat
      positionStatsCache[position][statField] = calculatePositionStats(
        positionPlayers,
        statField
      )
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

    // Get position-level stats for hierarchical adjustment
    const positionStats = positionStatsCache[player.primary_position] || {}

    // Calculate stats by position
    const floorData = await calculatePlayerFloors(
      player,
      seasonStats,
      recentGames,
      opponentId,
      week,
      season,
      environmentMod,
      positionStats
    )

    return floorData
  })

  const results = await Promise.all(playerPromises)
  return results.filter(r => r !== null)
}

/**
 * Calculate floors for individual player
 */
async function calculatePlayerFloors(player, seasonStats, recentGames, opponentId, week, season, environmentMod = { modifier: 1.0 }, positionStats = {}) {
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
    // Get position-level stats for this specific stat category
    const statPositionStats = positionStats[category.stat] || null

    const projection = await calculateStatFloor(
      seasonStats,
      recentGames,
      category.stat,
      category.opportunity,
      player.primary_position,
      opponentId,
      week,
      season,
      environmentMod,
      statPositionStats,
      player.player_id  // Task 12 (V4): Pass player_id for personalized environment
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
      // Phase 2.4 (V2): Fantasy points use combined opportunities (rushing + receiving)
      { stat: 'fantasy_points_ppr', opportunity: 'total_touches', label: 'Fantasy Points' }
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
 * Task 21 (V4): Winsorize outliers using IQR method
 *
 * Caps extreme values at IQR boundaries instead of removing them.
 * Preserves sample size while reducing outlier influence.
 *
 * @param {Array<number>} values - Data to winsorize
 * @returns {Array<number>} Winsorized values
 */
function winsorizeIQR(values) {
  if (!values || values.length < 4) {
    return values; // Need at least 4 values for quartiles
  }

  // Sort values to calculate quartiles
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Calculate Q1 (25th percentile) and Q3 (75th percentile)
  const q1Index = Math.floor(n * 0.25);
  const q3Index = Math.floor(n * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  // Calculate bounds (Tukey's fences)
  const lowerBound = q1 - (1.5 * iqr);
  const upperBound = q3 + (1.5 * iqr);

  // Winsorize: cap values at bounds
  return values.map(v => {
    if (v < lowerBound) return lowerBound;
    if (v > upperBound) return upperBound;
    return v;
  });
}

/**
 * Calculate floor for specific stat (Enhanced with Phase 1.1, 1.4, 2.1, 2.2, and Task 12 V4)
 */
async function calculateStatFloor(seasonStats, recentGames, statField, opportunityField, position, opponentId, week, season, environmentMod = { modifier: 1.0 }, positionStats = null, playerId = null) {
  // Filter out null values
  let seasonValues = seasonStats
    .map(g => g[statField])
    .filter(v => v !== null && v !== undefined && !isNaN(v))

  let recentValues = recentGames
    .map(g => g[statField])
    .filter(v => v !== null && v !== undefined && !isNaN(v))

  if (seasonValues.length === 0 || recentValues.length === 0) {
    return null
  }

  // Task 21 (V4): Winsorize outliers using IQR method
  // Apply if enabled in config (default: true)
  if (CONFIG.winsorize_outliers !== false) {
    seasonValues = winsorizeIQR(seasonValues);
    recentValues = winsorizeIQR(recentValues);
  }

  // Calculate season average and standard deviation
  const seasonAvg = seasonValues.reduce((a, b) => a + b, 0) / seasonValues.length
  const seasonStdDev = Math.sqrt(
    seasonValues.reduce((sum, val) => sum + Math.pow(val - seasonAvg, 2), 0) / seasonValues.length
  )

  // Calculate recent form average
  const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length

  // Phase 2.3 (V2): Calculate trend momentum (simple slope)
  let trendFactor = 1.0
  const minGamesForTrend = CONFIG.trend_momentum.min_games_for_trend
  if (recentGames.length >= minGamesForTrend) {
    // Sort recent games by week (most recent first)
    const sortedRecentGames = [...recentGames].sort((a, b) => b.week - a.week)
    const values = sortedRecentGames
      .map(g => g[statField])
      .filter(v => v !== null && v !== undefined && !isNaN(v))

    if (values.length >= minGamesForTrend) {
      // Calculate simple slope (sum of differences between consecutive games)
      let sumSlope = 0
      for (let i = 0; i < values.length - 1; i++) {
        sumSlope += (values[i] - values[i + 1]) // Positive if improving (recent > older)
      }

      const avgSlope = sumSlope / (values.length - 1)

      // Convert slope to percentage change relative to recent average
      if (recentAvg > 0) {
        const slopePercent = avgSlope / recentAvg
        const maxAdjustment = CONFIG.trend_momentum.max_trend_adjustment
        // Apply configured cap based on momentum
        trendFactor = 1 + (slopePercent * maxAdjustment)
        const maxFactor = 1 + maxAdjustment
        const minFactor = 1 - maxAdjustment
        trendFactor = Math.min(maxFactor, Math.max(minFactor, trendFactor))
      }
    }
  }

  // Phase 2.2: Opportunity-based projections for volume-dependent stats
  let expected
  if (opportunityField && (statField.includes('receiving') || statField.includes('rushing') || statField.includes('passing'))) {
    // Phase 2.4 (V2): Special handling for RB total touches (rushing + receiving)
    let seasonOpportunities, recentOpportunities

    if (opportunityField === 'total_touches') {
      // Combine rushing attempts + receiving targets for RB fantasy points
      seasonOpportunities = seasonStats
        .map(g => (g.rushing_attempts || 0) + (g.receiving_targets || 0))
        .filter(v => v > 0) // At least 1 touch

      recentOpportunities = recentGames
        .map(g => (g.rushing_attempts || 0) + (g.receiving_targets || 0))
        .filter(v => v > 0)
    } else {
      // Standard single opportunity field
      seasonOpportunities = seasonStats
        .map(g => g[opportunityField])
        .filter(v => v !== null && v !== undefined && !isNaN(v))

      recentOpportunities = recentGames
        .map(g => g[opportunityField])
        .filter(v => v !== null && v !== undefined && !isNaN(v))
    }

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
        // Fallback to EWMA projection
        const ewmaProj = calculateEWMAProjection(seasonStats, recentGames, statField, position)
        expected = ewmaProj.projection
      }
    } else {
      // Fallback to EWMA projection
      const ewmaProj = calculateEWMAProjection(seasonStats, recentGames, statField, position)
      expected = ewmaProj.projection
    }
  } else {
    // Phase 4B (Academic): EWMA temporal smoothing for non-opportunity stats
    // Replaces simple weighted average with exponential smoothing
    // Citation: Zhang et al. (2025) - Deep learning applications in sports
    const ewmaProj = calculateEWMAProjection(seasonStats, recentGames, statField, position)
    expected = ewmaProj.projection
  }

  // Phase 2 (Academic): Apply hierarchical Bayesian shrinkage
  // Shrink player estimate toward position mean based on sample size
  let hierarchicalAdjustment = null
  if (positionStats && positionStats.positionMean) {
    hierarchicalAdjustment = applyHierarchicalAdjustment(seasonValues, positionStats)

    // Use shrunken estimate instead of raw expected value
    // This pulls players with few games toward position average
    expected = hierarchicalAdjustment.shrunkenMean
  }

  // Phase 2.3 (V2): Apply trend momentum adjustment
  expected = expected * trendFactor

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

  // Task 12 (V4): Apply player-specific environment factor
  let playerEnvironmentFactor = 1.0
  let playerEnvironmentInfo = null
  if (playerId && environmentMod.conditions) {
    playerEnvironmentInfo = await calculatePlayerEnvironmentFactor(
      playerId,
      statField,
      environmentMod.conditions,
      season
    );
    playerEnvironmentFactor = playerEnvironmentInfo.factor;
    expected = expected * playerEnvironmentFactor;
  }

  // Phase 3 (Academic V2): Bootstrap Prediction Intervals
  // Task 12 (V4): Calculate combined modifier for bootstrap (opponent × environment × player-specific)
  const combinedModifier = opponentFactor * environmentMod.modifier * playerEnvironmentFactor

  // Task 17 (V4): Calculate player CV for bootstrap width scaling
  const playerCV = seasonAvg > 0 ? seasonStdDev / seasonAvg : 0

  // Generate bootstrap prediction interval with modifiers applied
  const bootstrapInterval = calculateModifiedPredictionInterval(
    seasonValues,
    combinedModifier,
    {
      numSamples: CONFIG.bootstrap_samples || 500,
      confidence: CONFIG.bootstrap_confidence || 0.80,
      statistic: 'mean',
      playerCV: playerCV  // Task 17 (V4): Pass player CV for interval width scaling
    }
  );

  // Use bootstrap results for floor/expected/ceiling (override previous calculations)
  const floor = bootstrapInterval.floor;
  expected = bootstrapInterval.expected; // Reassign (already declared above)
  const ceiling = bootstrapInterval.ceiling;

  // Confidence level assessment (HIGH/MEDIUM/LOW)
  const confidenceLevel = assessConfidenceLevel(bootstrapInterval);

  // Legacy confidence score for compatibility
  const confidence = calculateConfidence(seasonValues.length, seasonStdDev, seasonAvg)

  return {
    season_avg: Math.round(seasonAvg * 10) / 10,
    recent_avg: Math.round(recentAvg * 10) / 10,
    std_dev: Math.round(seasonStdDev * 10) / 10,
    expected: Math.round(expected * 10) / 10,
    floor: Math.round(floor * 10) / 10,
    ceiling: Math.round(ceiling * 10) / 10,
    confidence: confidence,
    confidence_level: confidenceLevel, // HIGH/MEDIUM/LOW (bootstrap-based)
    opponent_factor: opponentFactor,  // Show opponent matchup difficulty
    bootstrap_interval_width: bootstrapInterval.intervalWidth,
    bootstrap_samples: bootstrapInterval.bootstrapSamples
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
    log(`\nNo projections available for ${teamId}`)
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

    log(`\n${pos}${limit > 1 ? 's' : ''} (Top ${limit}):`)
    log('─'.repeat(80))

    for (const player of displayPlayers) {
      // Phase 3.4: Display injury warning if player is questionable
      const injuryWarning = player.injury_warning ? ` ⚠️ QUESTIONABLE (${player.injury_type || 'Injury'})` : ''
      log(`\n  ${player.player_name} (${player.games_played} games)${injuryWarning}:`)

      for (const proj of player.projections) {
        log(`    ${proj.stat}:`)
        log(`      ${proj.floor} ← ${proj.expected} → ${proj.ceiling} (80% CI)`)
        log(`      Recent: ${proj.recent_avg} | Season: ${proj.season_avg} | StdDev: ${proj.std_dev}`)

        // Show opponent matchup difficulty
        const matchupIndicator = proj.opponent_factor > 1.05 ? '✅ Easier' :
                                proj.opponent_factor < 0.95 ? '⚠️ Tougher' : '➖ Average'
        log(`      Opponent Factor: ${proj.opponent_factor} ${matchupIndicator}`)

        // Show bootstrap-based confidence level
        const confidenceEmoji = proj.confidence_level === 'HIGH' ? '🟢' :
                                proj.confidence_level === 'MEDIUM' ? '🟡' : '🔴';
        log(`      Confidence: ${confidenceEmoji} ${proj.confidence_level} (${(proj.confidence * 100).toFixed(0)}%)`)
        log(`      Bootstrap: ${proj.bootstrap_samples} samples, ±${proj.bootstrap_interval_width} range`)
      }
    }
  }
}

/**
 * Calculate floors for games by week
 */
async function calculateFloorsForWeek(week, season = CONFIG.current_season) {
  log(`\nFetching games for Week ${week}...`)

  const { data: games } = await supabase
    .from('games')
    .select('game_id')
    .eq('season', season)
    .eq('week', week)
    .eq('status', 'scheduled')

  if (!games || games.length === 0) {
    log(`No scheduled games found for Week ${week}`)
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

  // Phase 3.2 (V2): Check for JSON mode flag
  if (args.includes('--json')) {
    JSON_MODE = true
  }

  if (args.includes('--help')) {
    log(`
Usage:
  node scripts/calculate-performance-floors.js [options]

Options:
  --game=<game_id>   Calculate floors for specific game
  --week=<week>      Calculate floors for all scheduled games in week
  --json             Output results as JSON (for programmatic use)
  --help             Show this help message

Examples:
  node scripts/calculate-performance-floors.js --week=7
  node scripts/calculate-performance-floors.js --game=401772510
  node scripts/calculate-performance-floors.js --week=7 --json > floors.json
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
    log('Please specify --game=<game_id> or --week=<week>')
    log('Run with --help for usage information')
  }

  // Phase 3.2 (V2): Output JSON if in JSON mode
  if (JSON_MODE) {
    log(JSON.stringify(JSON_OUTPUT, null, 2))
  }
}

main()
  .catch(error => {
    logError('Error:', error)
    process.exit(1)
  })
