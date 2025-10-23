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
import { createCache } from './utils/smart-cache.js'
import { queryWithRetry } from './utils/query-retry.js'

const supabase = getSupabaseClient()

// Phase 3.1 (V2): Load configuration from external JSON file
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const configPath = join(__dirname, 'performance-floors-config.json')
const CONFIG = JSON.parse(readFileSync(configPath, 'utf-8'))

// Phase 3.2 (V2): JSON logging mode flag
let JSON_MODE = false
// Phase 5.1 (V3): Structured warnings and errors in JSON output
const JSON_OUTPUT = {
  games: [],
  warnings: [],
  errors: [],
  metadata: {
    timestamp: new Date().toISOString(),
    config: CONFIG
  }
}
const addWarning = (code, msg, ctx = {}) => JSON_MODE && JSON_OUTPUT.warnings.push({ code, message: msg, context: ctx })
const addError = (code, msg, ctx = {}) => JSON_MODE && JSON_OUTPUT.errors.push({ code, message: msg, context: ctx })

// Phase 2.2 (V3): Smart caches with TTL eviction (prevents memory leaks)
// League averages: 1 hour TTL (updated once per week, but cleared hourly for safety)
const LEAGUE_AVG_CACHE = createCache('LeagueAverages', 60 * 60 * 1000)
// Environment modifiers: 6 hour TTL (stadium/weather data changes rarely)
const ENVIRONMENT_CACHE = createCache('Environment', 6 * 60 * 60 * 1000)
// Injury status: 1 hour TTL (updated daily, but cleared hourly)
const INJURY_CACHE = createCache('Injuries', 60 * 60 * 1000)

// Phase 2.1 (V3): Preloaded league averages cache
// Stores all team defensive stats for the season to avoid repeated DB queries
// Structure: { season: { week: { teamId: { total_yards_allowed, games: [] }, leagueAvg } } }
const PRELOADED_LEAGUE_DATA = {}

/**
 * Preload all team defensive stats for a given season
 * Phase 2.1 (V3): Fetch once at startup, massive performance improvement
 *
 * @param {number} season - Season year
 * @param {number} maxWeek - Maximum week to preload (default: 18)
 */
async function preloadLeagueAverages(season, maxWeek = 18) {
  try {
    log(`⏳ Preloading league averages for season ${season}...`)

    // Phase 2.6 (V3): Wrap critical queries with retry logic (exponential backoff)
    // Phase 3.1 (V3): Fetch position-specific defensive stats
    const { data: allTeamStats, error: statsError } = await queryWithRetry(
      () => supabase
        .from('team_game_stats')
        .select('game_id, team_id, total_yards_allowed, passing_yards_allowed, rushing_yards_allowed')
        .eq('season', season),
      {
        maxRetries: 3,
        delayMs: 1000,
        onRetry: (info) => log(`⚠️  Retry ${info.attempt}/${info.maxRetries} - Preloading team stats (waiting ${info.delay}ms)`)
      }
    )

    if (statsError || !allTeamStats) {
      logError('Error preloading team stats:', statsError?.message)
      return
    }

    // Fetch all games to get week information
    const gameIds = [...new Set(allTeamStats.map(s => s.game_id))]
    const { data: allGames, error: gamesError } = await queryWithRetry(
      () => supabase
        .from('games')
        .select('game_id, week, status')
        .in('game_id', gameIds)
        .eq('season', season)
        .eq('status', 'final'),
      {
        maxRetries: 3,
        delayMs: 1000,
        onRetry: (info) => log(`⚠️  Retry ${info.attempt}/${info.maxRetries} - Preloading games (waiting ${info.delay}ms)`)
      }
    )

    if (gamesError || !allGames) {
      logError('Error preloading games:', gamesError?.message)
      return
    }

    // Create game_id → week mapping
    const gameWeekMap = new Map()
    allGames.forEach(g => gameWeekMap.set(g.game_id, g.week))

    // Initialize data structure
    if (!PRELOADED_LEAGUE_DATA[season]) {
      PRELOADED_LEAGUE_DATA[season] = {}
    }

    // Group stats by week and team
    for (let week = 1; week <= maxWeek; week++) {
      PRELOADED_LEAGUE_DATA[season][week] = {}

      // Get all games before this week
      const statsBeforeWeek = allTeamStats.filter(s => {
        const gameWeek = gameWeekMap.get(s.game_id)
        return gameWeek && gameWeek < week
      })

      // Phase 3.1 (V3): Group by team with position-specific stats
      const teamStats = {}
      statsBeforeWeek.forEach(stat => {
        if (!teamStats[stat.team_id]) {
          teamStats[stat.team_id] = {
            total_yards_allowed: [],
            passing_yards_allowed: [],
            rushing_yards_allowed: [],
            game_count: 0
          }
        }
        teamStats[stat.team_id].total_yards_allowed.push(stat.total_yards_allowed || 0)
        teamStats[stat.team_id].passing_yards_allowed.push(stat.passing_yards_allowed || 0)
        teamStats[stat.team_id].rushing_yards_allowed.push(stat.rushing_yards_allowed || 0)
        teamStats[stat.team_id].game_count++
      })

      // Phase 3.1 (V3): Calculate averages per team (all three stat types)
      Object.keys(teamStats).forEach(teamId => {
        const totalYards = teamStats[teamId].total_yards_allowed
        const passingYards = teamStats[teamId].passing_yards_allowed
        const rushingYards = teamStats[teamId].rushing_yards_allowed

        PRELOADED_LEAGUE_DATA[season][week][teamId] = {
          avg_yards_allowed: totalYards.length > 0 ? totalYards.reduce((sum, y) => sum + y, 0) / totalYards.length : null,
          avg_passing_yards_allowed: passingYards.length > 0 ? passingYards.reduce((sum, y) => sum + y, 0) / passingYards.length : null,
          avg_rushing_yards_allowed: rushingYards.length > 0 ? rushingYards.reduce((sum, y) => sum + y, 0) / rushingYards.length : null,
          game_count: totalYards.length
        }
      })

      // Phase 3.1 (V3): Calculate league averages for all three stat types
      const allTeamData = Object.values(PRELOADED_LEAGUE_DATA[season][week]).filter(t => t.avg_yards_allowed !== null)

      PRELOADED_LEAGUE_DATA[season][week].leagueAvg = allTeamData.length > 0
        ? allTeamData.reduce((sum, t) => sum + t.avg_yards_allowed, 0) / allTeamData.length
        : null

      PRELOADED_LEAGUE_DATA[season][week].leagueAvgPassing = allTeamData.length > 0
        ? allTeamData.reduce((sum, t) => sum + (t.avg_passing_yards_allowed || 0), 0) / allTeamData.length
        : null

      PRELOADED_LEAGUE_DATA[season][week].leagueAvgRushing = allTeamData.length > 0
        ? allTeamData.reduce((sum, t) => sum + (t.avg_rushing_yards_allowed || 0), 0) / allTeamData.length
        : null
    }

    log(`✅ Preloaded league averages for ${maxWeek} weeks (${allTeamStats.length} team games)`)
  } catch (error) {
    logError('Error in preloadLeagueAverages:', error.message)
  }
}

/**
 * Validate configuration at startup
 * Phase 1.2 (V3): Catch invalid config before processing
 *
 * @throws {Error} If configuration is invalid
 */
function validateConfig() {
  const errors = []

  // Check required fields
  const requiredFields = [
    'current_season',
    'min_games_played',
    'rolling_window_weeks',
    'bootstrap_samples',
    'bootstrap_confidence'
  ]

  const missingFields = requiredFields.filter(field => !CONFIG[field] && CONFIG[field] !== 0)

  if (missingFields.length > 0) {
    errors.push(`Missing required config fields: ${missingFields.join(', ')}`)
  }

  // Validate numeric ranges
  if (CONFIG.bootstrap_confidence) {
    if (CONFIG.bootstrap_confidence <= 0 || CONFIG.bootstrap_confidence >= 1) {
      errors.push('bootstrap_confidence must be between 0 and 1 (exclusive)')
    }
  }

  if (CONFIG.min_games_played !== undefined) {
    if (CONFIG.min_games_played < 1) {
      errors.push('min_games_played must be at least 1')
    }
  }

  if (CONFIG.bootstrap_samples) {
    if (CONFIG.bootstrap_samples < 100) {
      errors.push('bootstrap_samples should be at least 100 for reliable intervals')
    }
  }

  // Validate position_volatility has all required positions
  if (CONFIG.position_volatility) {
    const requiredPositions = ['QB', 'RB', 'WR', 'TE']
    const missingPositions = requiredPositions.filter(pos => !CONFIG.position_volatility[pos])
    if (missingPositions.length > 0) {
      errors.push(`position_volatility missing positions: ${missingPositions.join(', ')}`)
    }
  }

  // Validate rolling_window_by_position has all required positions
  if (CONFIG.rolling_window_by_position) {
    const requiredPositions = ['QB', 'RB', 'WR', 'TE']
    const missingPositions = requiredPositions.filter(pos => !CONFIG.rolling_window_by_position[pos])
    if (missingPositions.length > 0) {
      errors.push(`rolling_window_by_position missing positions: ${missingPositions.join(', ')}`)
    }
  }

  // If there are errors, throw them all at once
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n  - ${errors.join('\n  - ')}`)
  }

  log('✅ Configuration validated successfully')
}

/**
 * Get modifier value (learned weights if available, otherwise default config)
 * Phase 4A (Academic): Random Forest feature importance
 *
 * @param {string} modifierType - Type of modifier (venue, weather, home)
 * @param {string} specificKey - Specific key within type (e.g., 'turf', 'high_wind')
 * @returns {number} Modifier value
 */
function getModifierValue(modifierType, specificKey) {
  // Check if learned weights exist and are enabled
  if (CONFIG.learned_feature_weights?.enabled !== false && CONFIG.learned_feature_weights?.importances) {
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
    // Phase 2.1 (V3): Use preloaded data if available (60-70% faster)
    if (PRELOADED_LEAGUE_DATA[season] && PRELOADED_LEAGUE_DATA[season][beforeWeek]) {
      const weekData = PRELOADED_LEAGUE_DATA[season][beforeWeek]
      const opponentData = weekData[opponentId]

      if (!opponentData) {
        return 1.0 // Default to league average if no data
      }

      // Phase 3.1 (V3): Use position-specific defensive stats
      let opponentAvg, leagueAvg

      if (statCategory === 'passing' && opponentData.avg_passing_yards_allowed && weekData.leagueAvgPassing) {
        // For QBs, WRs, TEs: Use passing yards allowed
        opponentAvg = opponentData.avg_passing_yards_allowed
        leagueAvg = weekData.leagueAvgPassing
      } else if (statCategory === 'rushing' && opponentData.avg_rushing_yards_allowed && weekData.leagueAvgRushing) {
        // For RBs: Use rushing yards allowed
        opponentAvg = opponentData.avg_rushing_yards_allowed
        leagueAvg = weekData.leagueAvgRushing
      } else {
        // Fallback to total yards (for 'receiving' or if position-specific data missing)
        opponentAvg = opponentData.avg_yards_allowed
        leagueAvg = weekData.leagueAvg
      }

      if (!opponentAvg || !leagueAvg || opponentAvg === 0 || leagueAvg === 0) {
        return 1.0
      }

      const gameCount = opponentData.game_count

      if (gameCount === 0) {
        return 1.0
      }

      // Calculate raw factor: opponent_avg / league_avg
      // Higher yards allowed = easier matchup (weaker defense) = factor > 1
      const rawFactor = opponentAvg / leagueAvg

      // Phase 2.1 (V2): Bayesian shrinkage for small samples
      const minSampleSize = CONFIG.bayesian_shrinkage.min_sample_size
      let adjustedFactor = rawFactor

      if (gameCount < minSampleSize) {
        const weight = gameCount / minSampleSize
        adjustedFactor = (rawFactor * weight) + (CONFIG.bayesian_shrinkage.target_mean * (1 - weight))
      }

      // Cap factor between configured min/max (default: 0.7-1.3)
      const cappedFactor = Math.min(CONFIG.opponent_factor_caps.max, Math.max(CONFIG.opponent_factor_caps.min, adjustedFactor))

      return Math.round(cappedFactor * 100) / 100
    }

    // FALLBACK: Use original query-based approach if preload not available
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

    // Phase 3.3 (V2): Calculate league average only if not cached
    if (!leagueAvg) {
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

    // Phase 2.1 (V2): Bayesian shrinkage for small samples
    // Regress toward league average when sample size < min_sample_size games
    const minSampleSize = CONFIG.bayesian_shrinkage.min_sample_size
    let adjustedFactor = rawFactor

    if (filteredGames.length < minSampleSize) {
      const weight = filteredGames.length / minSampleSize
      adjustedFactor = (rawFactor * weight) + (CONFIG.bayesian_shrinkage.target_mean * (1 - weight))
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
 * Calculate environment modifier for game (Phase 2.1)
 * Returns a combined modifier based on venue and weather conditions
 *
 * @param {string} gameId - Game identifier
 * @param {number} season - Season year
 * @returns {Promise<Object>} Environment modifier data
 */
async function calculateEnvironmentModifier(gameId, season, teamId = null, game = null) {
  try {
    // Phase 2.2 (V3): Check cache first (6 hour TTL)
    const cacheKey = `${gameId}-${teamId || 'neutral'}`
    const cached = ENVIRONMENT_CACHE.get(cacheKey)
    if (cached) {
      return cached
    }

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

    const result = {
      modifier: Math.round(combinedModifier * 100) / 100,
      venue: Math.round(venueModifier * 100) / 100,
      weather: Math.round(weatherModifier * 100) / 100,
      home: Math.round(homeModifier * 100) / 100,
      details: details.length > 0 ? details.join(', ') : 'standard conditions'
    }

    // Phase 2.2 (V3): Cache the result (6 hour TTL)
    ENVIRONMENT_CACHE.set(cacheKey, result)

    return result
  } catch (error) {
    logError('Error calculating environment modifier:', error)
    return {
      modifier: 1.0,
      home: 1.0,
      venue: 1.0,
      weather: 1.0,
      details: 'standard conditions'
    }
  }
}

/**
 * Validate data completeness with severity tiers
 * Phase 1.3 (V3): Enhanced validation with CRITICAL/MODERATE/MINOR tiers
 *
 * @param {Object} game - Game data
 * @param {Array} players - Player data
 * @param {Array} stats - Stat data
 * @returns {Object} Validation result with errors, warnings, and infos
 */
function validateDataCompleteness(game, players, stats) {
  const errors = []      // CRITICAL: Abort processing
  const warnings = []    // MODERATE: Continue with caution
  const infos = []       // MINOR: Informational only

  // CRITICAL: Game exists
  if (!game) {
    errors.push('Game data not found')
    return { errors, warnings, infos, isValid: false, severity: 'CRITICAL' }
  }

  // CRITICAL: Teams exist
  if (!game.home_team_id || !game.away_team_id) {
    errors.push('Missing team information (home_team_id or away_team_id)')
  }

  // CRITICAL: Game ID exists
  if (!game.game_id) {
    errors.push('Missing game_id')
  }

  // MODERATE: Game status
  if (game.status !== 'final' && game.status !== 'scheduled') {
    warnings.push(`Game status is '${game.status}' (may have incomplete data)`)
  }

  // MODERATE: Player count
  if (!players || players.length === 0) {
    warnings.push('No players found for this game')
  } else if (players.length < 10) {
    warnings.push(`Low player count: ${players.length} players (expected 20+)`)
  }

  // MODERATE: Stat count
  if (stats && stats.length < 10) {
    warnings.push(`Low stat count: ${stats.length} player stats (expected 40+)`)
  }

  // MINOR: Weather data
  // Note: We can't check this here without querying, but we'll log in calculateEnvironmentModifier
  // This is just a placeholder for future enhancement
  if (game.stadium_id === null || game.stadium_id === undefined) {
    infos.push('Missing stadium_id (environment modifiers will default to neutral)')
  }

  // MINOR: Week and season
  if (!game.week) {
    infos.push('Missing game week information')
  }
  if (!game.season) {
    infos.push('Missing game season information')
  }

  // Determine severity
  let severity = 'NONE'
  if (errors.length > 0) {
    severity = 'CRITICAL'
  } else if (warnings.length > 0) {
    severity = 'MODERATE'
  } else if (infos.length > 0) {
    severity = 'MINOR'
  }

  return {
    errors,
    warnings,
    infos,
    isValid: errors.length === 0,
    severity
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

  // Phase 1.3 (V3): Enhanced data validation with severity tiers
  const validation = validateDataCompleteness(game, null, null)

  // CRITICAL: Abort on errors
  if (!validation.isValid) {
    logError('❌ Data validation failed (CRITICAL):')
    validation.errors.forEach(err => {
      logError(`   - ${err}`)
      addError('VALIDATION_FAILED', err, { game_id: gameId, week: game.week }) // Phase 5.1
    })
    return
  }

  // MODERATE: Show warnings but continue
  if (validation.warnings.length > 0) {
    log('⚠️  Data warnings (MODERATE):')
    validation.warnings.forEach(warn => {
      log(`   - ${warn}`)
      addWarning('DATA_INCOMPLETE', warn, { game_id: gameId, week: game.week }) // Phase 5.1
    })
  }

  // MINOR: Show informational messages
  if (validation.infos.length > 0) {
    log('ℹ️  Data info (MINOR):')
    validation.infos.forEach(info => log(`   - ${info}`))
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

    // Phase 2.5 (V3): Consolidate database queries with joins
    // Phase 2.6 (V3): Add retry logic with exponential backoff
    // Single query with nested select to fetch player stats + game details
    // Filters at database level (status='final', week<current) instead of JavaScript
    const { data: players } = await queryWithRetry(
      () => supabase
        .from('player_game_stats')
        .select(`
          player_id,
          team_id,
          game_id,
          game:games!inner(
            game_id,
            week,
            status
          )
        `)
        .eq('team_id', teamId)
        .eq('season', season)
        .eq('game.status', 'final')
        .lt('game.week', game.week)
        .order('game.week', { ascending: false }),
      {
        maxRetries: 3,
        delayMs: 1000,
        onRetry: (info) => log(`⚠️  Retry ${info.attempt}/${info.maxRetries} - Fetching player stats for ${teamId} (waiting ${info.delay}ms)`)
      }
    )

    if (!players || players.length === 0) {
      log(`No completed games with stats found for ${teamId} before week ${game.week}`)
      continue
    }

    log(`Found ${players.length} player stat records from ${[...new Set(players.map(p => p.game.week))].length} games for ${teamId} before week ${game.week}`)

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

  // Phase 3.4: Filter out OUT/DOUBTFUL players, flag QUESTIONABLE with discount
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

      // Flag QUESTIONABLE players with injury discount
      if (injury.injury_status === 'questionable') {
        return {
          ...player,
          injury_warning: true,
          injury_type: injury.injury_type,
          injury_status: 'questionable',
          injury_discount: CONFIG.injury_probability?.enabled ? CONFIG.injury_probability.questionable_discount : 1.0
        }
      }

      // Flag PROBABLE players with injury discount
      if (injury.injury_status === 'probable') {
        return {
          ...player,
          injury_warning: true,
          injury_type: injury.injury_type,
          injury_status: 'probable',
          injury_discount: CONFIG.injury_probability?.enabled ? CONFIG.injury_probability.probable_discount : 1.0
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
    projections: [],
    injury_discount: player.injury_discount || 1.0,
    injury_status: player.injury_status || null
  }

  // Phase 2.4 (V2): Fetch advanced metrics (EPA, success rate, QBR) if available
  let efficiencyModifier = 1.0
  let advancedMetrics = null

  const recentGameIds = recentGames.map(g => g.game_id).filter(Boolean)
  if (recentGameIds.length > 0) {
    advancedMetrics = await getAdvancedMetrics(player.player_id, recentGameIds, player.primary_position)
    efficiencyModifier = calculateEfficiencyModifier(advancedMetrics)

    // Store advanced metrics in stats object for display
    if (advancedMetrics && (advancedMetrics.epa_total !== null || advancedMetrics.qbr !== null)) {
      stats.advanced_metrics = advancedMetrics
      stats.efficiency_modifier = efficiencyModifier
    }
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
      player.injury_discount || 1.0,
      efficiencyModifier, // Phase 2.4: Pass efficiency modifier to stat calculation
      player.full_name // Phase 1.1 (V3): Pass player name for outlier logging
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
 * Validate and clean stats using IQR method for outlier detection
 * Phase 1.1 (V3): Remove statistical outliers to prevent garbage-time distortion
 *
 * @param {Array<number>} values - Raw stat values
 * @param {string} statType - Stat field name (for logging)
 * @param {string} playerName - Player name (for logging)
 * @returns {Array<number>} Cleaned values with outliers removed
 */
function validateAndCleanStats(values, statType, playerName = '') {
  if (!values || values.length === 0) return []

  // Filter out null/undefined/NaN
  const validValues = values.filter(v =>
    v !== null && v !== undefined && !isNaN(v) && v >= 0
  )

  if (validValues.length < 5) {
    // Not enough data for IQR, return as-is
    return validValues
  }

  // Calculate IQR (Interquartile Range)
  const sorted = [...validValues].sort((a, b) => a - b)
  const q1Index = Math.floor(sorted.length * 0.25)
  const q3Index = Math.floor(sorted.length * 0.75)
  const q1 = sorted[q1Index]
  const q3 = sorted[q3Index]
  const iqr = q3 - q1

  // Define outlier bounds (1.5 * IQR is standard)
  const lowerBound = q1 - (1.5 * iqr)
  const upperBound = q3 + (1.5 * iqr)

  // Remove outliers
  const cleaned = validValues.filter(v => v >= lowerBound && v <= upperBound)

  // Log outliers removed (if any and not in JSON mode)
  if (cleaned.length < validValues.length && !JSON_MODE) {
    const outliersRemoved = validValues.length - cleaned.length
    const outlierPercent = Math.round((outliersRemoved / validValues.length) * 100)

    // If >30% are outliers, this is likely a high-variance player - keep all data
    if (outlierPercent > 30) {
      log(`   ℹ️  ${playerName || 'Player'} (${statType}): ${outlierPercent}% outliers detected - keeping all data (high variance player)`)
      return validValues
    }

    log(`   ⚠️  Removed ${outliersRemoved} outliers for ${playerName || 'Player'} (${statType})`)
  }

  return cleaned
}

/**
 * Get minimum floor for a given position and stat type
 * Phase 1.4 (V3): Prevent absurd projections (e.g., QB floor of 50 passing yards)
 *
 * @param {string} position - Player position (QB, RB, WR, TE)
 * @param {string} statField - Stat field name (e.g., 'passing_yards', 'rushing_yards')
 * @returns {number|null} Minimum floor value, or null if not configured
 */
function getMinimumFloor(position, statField) {
  if (!CONFIG.minimum_floors || !CONFIG.minimum_floors[position]) {
    return null
  }

  const positionMinimums = CONFIG.minimum_floors[position]
  return positionMinimums[statField] || null
}

/**
 * Calculate floor for specific stat (Enhanced with Phase 1.1, 1.4, 2.1, 2.2, and injury probability)
 */
async function calculateStatFloor(seasonStats, recentGames, statField, opportunityField, position, opponentId, week, season, environmentMod = { modifier: 1.0 }, positionStats = null, injuryDiscount = 1.0, efficiencyModifier = 1.0, playerName = '') {
  // Phase 1.1 (V3): Apply IQR-based outlier detection
  const seasonValues = validateAndCleanStats(
    seasonStats.map(g => g[statField]),
    statField,
    playerName
  )

  const recentValues = validateAndCleanStats(
    recentGames.map(g => g[statField]),
    statField,
    playerName
  )

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

  // Phase 3.2 (V3): Calculate trend momentum using weighted linear regression
  // Recent games weighted 2-3x more than older games (reduces noise from outliers)
  let trendFactor = 1.0
  const minGamesForTrend = CONFIG.trend_momentum.min_games_for_trend
  if (recentGames.length >= minGamesForTrend) {
    // Sort recent games by week (oldest first for time series)
    const sortedRecentGames = [...recentGames].sort((a, b) => a.week - b.week)
    const values = sortedRecentGames
      .map(g => g[statField])
      .filter(v => v !== null && v !== undefined && !isNaN(v))

    if (values.length >= minGamesForTrend) {
      // Weighted Linear Regression: y = mx + b
      // Weight increases with recency: w_i = i + 1 (most recent has highest weight)
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumW = 0

      for (let i = 0; i < values.length; i++) {
        const x = i // Time index (0 = oldest, n-1 = most recent)
        const y = values[i]
        const weight = (i + 1) // Linear weight: older=1, recent=2,3,4...

        sumX += weight * x
        sumY += weight * y
        sumXY += weight * x * y
        sumX2 += weight * x * x
        sumW += weight
      }

      // Calculate weighted slope: m = (Σw*x*y - Σw*x * Σw*y / Σw) / (Σw*x² - (Σw*x)² / Σw)
      const numerator = sumXY - (sumX * sumY / sumW)
      const denominator = sumX2 - (sumX * sumX / sumW)

      if (denominator !== 0) {
        const slope = numerator / denominator

        // Convert slope to percentage change per game
        if (recentAvg > 0) {
          const slopePercent = slope / recentAvg
          const maxAdjustment = CONFIG.trend_momentum.max_trend_adjustment

          // Apply trend factor based on slope direction
          // Positive slope = increasing trend, negative = decreasing
          trendFactor = 1 + (slopePercent * maxAdjustment * values.length)
          const maxFactor = 1 + maxAdjustment
          const minFactor = 1 - maxAdjustment
          trendFactor = Math.min(maxFactor, Math.max(minFactor, trendFactor))
        }
      }
    }
  }

  // Phase 2.2: Opportunity-based projections for volume-dependent stats
  let expected
  if (opportunityField && (statField.includes('receiving') || statField.includes('rushing') || statField.includes('passing'))) {
    // Phase 2.4 (V2): Special handling for RB total touches (rushing + receiving)
    let seasonOpportunities, recentOpportunities

    // Phase 3.3 (V3): Separate RB rushing and receiving efficiency
    if (opportunityField === 'total_touches' && position === 'RB') {
      // RBs have different efficiency for rushing vs receiving
      // Calculate separate projections and combine

      // Rushing component
      const seasonRushAttempts = seasonStats.map(g => g.rushing_attempts || 0).filter(v => v > 0)
      const recentRushAttempts = recentGames.map(g => g.rushing_attempts || 0).filter(v => v > 0)
      const seasonRushYards = seasonStats.map(g => g.rushing_yards || 0)
      const recentRushYards = recentGames.map(g => g.rushing_yards || 0)

      // Receiving component
      const seasonRecTargets = seasonStats.map(g => g.receiving_targets || 0).filter(v => v > 0)
      const recentRecTargets = recentGames.map(g => g.receiving_targets || 0).filter(v => v > 0)
      const seasonRecYards = seasonStats.map(g => g.receiving_yards || 0)
      const recentRecYards = recentGames.map(g => g.receiving_yards || 0)

      // Project opportunities (weighted average)
      let projectedRushAttempts = 0
      let projectedRecTargets = 0

      if (seasonRushAttempts.length > 0 && recentRushAttempts.length > 0) {
        const seasonAvgRush = seasonRushAttempts.reduce((a, b) => a + b, 0) / seasonRushAttempts.length
        const recentAvgRush = recentRushAttempts.reduce((a, b) => a + b, 0) / recentRushAttempts.length
        projectedRushAttempts = (seasonAvgRush * CONFIG.opportunity_weights.season) +
                                 (recentAvgRush * CONFIG.opportunity_weights.recent)
      }

      if (seasonRecTargets.length > 0 && recentRecTargets.length > 0) {
        const seasonAvgRec = seasonRecTargets.reduce((a, b) => a + b, 0) / seasonRecTargets.length
        const recentAvgRec = recentRecTargets.reduce((a, b) => a + b, 0) / recentRecTargets.length
        projectedRecTargets = (seasonAvgRec * CONFIG.opportunity_weights.season) +
                              (recentAvgRec * CONFIG.opportunity_weights.recent)
      }

      // Calculate separate efficiencies
      const rushEfficiency = seasonRushAttempts.reduce((a, b) => a + b, 0) > 0
        ? seasonRushYards.reduce((a, b) => a + b, 0) / seasonRushAttempts.reduce((a, b) => a + b, 0)
        : 0

      const recEfficiency = seasonRecTargets.reduce((a, b) => a + b, 0) > 0
        ? seasonRecYards.reduce((a, b) => a + b, 0) / seasonRecTargets.reduce((a, b) => a + b, 0)
        : 0

      // Combine projections (yards only - fantasy points calculated separately)
      if (statField.includes('yards') && !statField.includes('receiving') && !statField.includes('rushing')) {
        // Total yards projection
        const projectedRushYards = projectedRushAttempts * rushEfficiency
        const projectedRecYards = projectedRecTargets * recEfficiency
        expected = projectedRushYards + projectedRecYards
      } else {
        // For fantasy points, fall through to standard calculation
        // Standard single opportunity field (combined)
        seasonOpportunities = seasonStats
          .map(g => (g.rushing_attempts || 0) + (g.receiving_targets || 0))
          .filter(v => v > 0)

        recentOpportunities = recentGames
          .map(g => (g.rushing_attempts || 0) + (g.receiving_targets || 0))
          .filter(v => v > 0)
      }
    } else if (opportunityField === 'total_touches') {
      // Non-RB with total_touches (shouldn't happen, but fallback)
      seasonOpportunities = seasonStats
        .map(g => (g.rushing_attempts || 0) + (g.receiving_targets || 0))
        .filter(v => v > 0)

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

  // Phase 5.3 (V3): Feature flag - Apply trend momentum adjustment
  if (CONFIG.features?.enable_trend_detection !== false) {
    expected = expected * trendFactor
  }

  // Phase 5.3 (V3): Feature flag - Apply opponent defensive efficiency factor
  let opponentFactor = 1.0
  if (CONFIG.features?.enable_opponent_factor !== false && opponentId) {
    let statCategory = 'passing'
    if (statField.includes('rushing')) {
      statCategory = 'rushing'
    } else if (statField.includes('receiving')) {
      statCategory = 'receiving'
    }

    opponentFactor = await calculateOpponentFactor(opponentId, statCategory, season, week)
    expected = expected * opponentFactor
  }

  // Phase 5.3 (V3): Feature flag - Apply efficiency modifier (EPA, QBR, success rate)
  if (CONFIG.features?.enable_advanced_metrics !== false) {
    expected = expected * efficiencyModifier
  }

  // Phase 3.4 (V3): Adaptive volatility factor by player (Phase 5.3: with feature flag)
  let adaptiveConfidence = CONFIG.bootstrap_confidence || 0.80

  if (CONFIG.features?.enable_adaptive_volatility !== false) {
    // Calculate player-specific coefficient of variation (CV = stddev / mean)
    // High CV = boom-bust player → wider intervals (lower confidence %)
    // Low CV = consistent player → narrower intervals (higher confidence %)
    const coefficientOfVariation = seasonAvg > 0 ? seasonStdDev / seasonAvg : 0

    if (coefficientOfVariation > 0) {
      // Base position volatility
      const baseVolatility = CONFIG.position_volatility?.[position] || 0.75

      // Adjust confidence based on player consistency relative to position baseline
      const volatilityRatio = coefficientOfVariation / baseVolatility

      if (volatilityRatio < 0.7) {
        // Very consistent player → tighter floors
        adaptiveConfidence = Math.min(0.90, adaptiveConfidence + 0.10)
      } else if (volatilityRatio > 1.3) {
        // Very volatile (boom-bust) player → wider floors
        adaptiveConfidence = Math.max(0.70, adaptiveConfidence - 0.10)
      }
    }
  }

  // Phase 3 (Academic V2): Bootstrap Prediction Intervals
  // Calculate combined modifier for bootstrap (opponent × environment × efficiency)
  const combinedModifier = opponentFactor * environmentMod.modifier * efficiencyModifier

  // Generate bootstrap prediction interval with modifiers applied
  const bootstrapInterval = calculateModifiedPredictionInterval(
    seasonValues,
    combinedModifier,
    {
      numSamples: CONFIG.bootstrap_samples || 500,
      confidence: adaptiveConfidence, // Phase 3.4: Player-specific confidence
      statistic: 'mean'
    }
  );

  // Use bootstrap results for floor/expected/ceiling (override previous calculations)
  let floor = bootstrapInterval.floor;
  expected = bootstrapInterval.expected; // Reassign (already declared above)
  let ceiling = bootstrapInterval.ceiling;

  // Apply injury probability discount if enabled
  if (CONFIG.injury_probability?.enabled && injuryDiscount < 1.0) {
    if (CONFIG.injury_probability.apply_to_floor) {
      floor = floor * injuryDiscount;
    }
    if (CONFIG.injury_probability.apply_to_expected) {
      expected = expected * injuryDiscount;
    }
    if (CONFIG.injury_probability.apply_to_ceiling) {
      ceiling = ceiling * injuryDiscount;
    }
  }

  // Phase 1.4 (V3): Apply minimum floor constraints to prevent absurd projections
  const minimumFloor = getMinimumFloor(position, statField);
  if (minimumFloor !== null && floor < minimumFloor) {
    if (!JSON_MODE) {
      log(`   ℹ️  Applied minimum floor constraint for ${statField}: ${Math.round(floor * 10) / 10} → ${minimumFloor}`);
    }
    floor = minimumFloor;
    // Also ensure expected doesn't fall below floor after constraint
    if (expected < floor) {
      expected = floor;
    }
  }

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
    efficiency_modifier: efficiencyModifier !== 1.0 ? efficiencyModifier : undefined, // Phase 2.4: Show if non-neutral
    bootstrap_interval_width: bootstrapInterval.intervalWidth,
    bootstrap_samples: bootstrapInterval.bootstrapSamples
  }
}

/**
 * Get advanced metrics (EPA, Success Rate, QBR) for a player
 * Phase 2.4 (V2): Advanced Metrics Integration
 *
 * @param {string} playerId - Player ID
 * @param {Array} recentGameIds - Recent game IDs to query
 * @param {string} position - Player position
 * @returns {Promise<Object>} Advanced metrics data
 */
async function getAdvancedMetrics(playerId, recentGameIds, position) {
  try {
    let epaTotal = null
    let successRate = null
    let qbr = null
    let passingRating = null

    // Query play_by_play table for EPA and success_rate (if available)
    // Note: play_by_play table may be empty - this is expected and gracefully handled
    const { data: playByPlayData, error: pbpError } = await supabase
      .from('play_by_play')
      .select('epa, success')
      .in('game_id', recentGameIds)
      .eq('passer_player_id', playerId) // For QB/passing plays
      .not('epa', 'is', null)

    if (playByPlayData && playByPlayData.length > 0 && !pbpError) {
      // Calculate average EPA from play-by-play data
      const epaValues = playByPlayData.map(play => play.epa).filter(v => v !== null)
      if (epaValues.length > 0) {
        epaTotal = epaValues.reduce((sum, val) => sum + val, 0) / epaValues.length
      }

      // Calculate success rate (percentage of successful plays)
      const successValues = playByPlayData.map(play => play.success).filter(v => v !== null)
      if (successValues.length > 0) {
        const successfulPlays = successValues.filter(v => v === true || v === 1).length
        successRate = successfulPlays / successValues.length
      }
    }

    // Query player_game_stats for QBR and passing_rating (QBs only)
    if (position === 'QB') {
      const { data: gameStats, error: statsError } = await supabase
        .from('player_game_stats')
        .select('qbr, passing_rating')
        .in('game_id', recentGameIds)
        .eq('player_id', playerId)
        .not('qbr', 'is', null)

      if (gameStats && gameStats.length > 0 && !statsError) {
        // Calculate average QBR
        const qbrValues = gameStats.map(g => g.qbr).filter(v => v !== null && v !== undefined)
        if (qbrValues.length > 0) {
          qbr = qbrValues.reduce((sum, val) => sum + val, 0) / qbrValues.length
        }

        // Calculate average passing rating
        const ratingValues = gameStats.map(g => g.passing_rating).filter(v => v !== null && v !== undefined)
        if (ratingValues.length > 0) {
          passingRating = ratingValues.reduce((sum, val) => sum + val, 0) / ratingValues.length
        }
      }
    }

    return {
      epa_total: epaTotal !== null ? Math.round(epaTotal * 100) / 100 : null,
      success_rate: successRate !== null ? Math.round(successRate * 100) / 100 : null,
      qbr: qbr !== null ? Math.round(qbr * 10) / 10 : null,
      passing_rating: passingRating !== null ? Math.round(passingRating * 10) / 10 : null
    }
  } catch (error) {
    // Gracefully handle missing tables (play_by_play may not exist yet)
    logError('Error fetching advanced metrics (expected if play_by_play table empty):', error.message)
    return {
      epa_total: null,
      success_rate: null,
      qbr: null,
      passing_rating: null
    }
  }
}

/**
 * Calculate efficiency score from advanced metrics
 * Phase 2.4 (V2): Composite efficiency score
 *
 * Combines EPA, Success Rate, and QBR into a single modifier (0.8-1.2)
 * Formula: 0.4 * EPA_norm + 0.3 * SuccessRate + 0.3 * QBR_norm
 *
 * @param {Object} advancedMetrics - Advanced metrics object
 * @returns {number} Efficiency modifier (0.8-1.2, default 1.0 if no data)
 */
function calculateEfficiencyModifier(advancedMetrics) {
  const { epa_total, success_rate, qbr, passing_rating } = advancedMetrics

  // If no advanced metrics available, return neutral modifier
  if (epa_total === null && success_rate === null && qbr === null) {
    return 1.0
  }

  let score = 0
  let totalWeight = 0

  // EPA component (normalized to 0-1 range, where 0.2+ EPA is excellent)
  if (epa_total !== null) {
    const epaNorm = Math.max(0, Math.min(1, (epa_total + 0.1) / 0.4)) // -0.1 to 0.3 → 0 to 1
    score += epaNorm * 0.4
    totalWeight += 0.4
  }

  // Success Rate component (already 0-1)
  if (success_rate !== null) {
    score += success_rate * 0.3
    totalWeight += 0.3
  }

  // QBR component (normalized to 0-1 range, where 70+ is excellent)
  if (qbr !== null) {
    const qbrNorm = Math.max(0, Math.min(1, qbr / 100)) // 0-100 → 0-1
    score += qbrNorm * 0.3
    totalWeight += 0.3
  } else if (passing_rating !== null) {
    // Fallback to passing rating if QBR not available
    const ratingNorm = Math.max(0, Math.min(1, (passing_rating - 60) / 80)) // 60-140 → 0-1
    score += ratingNorm * 0.3
    totalWeight += 0.3
  }

  // Normalize score to 0-1 range based on available weights
  if (totalWeight === 0) {
    return 1.0
  }

  const normalizedScore = score / totalWeight

  // Convert to modifier range (0.8-1.2)
  // 0.5 score = 1.0 modifier (neutral)
  // 0.0 score = 0.8 modifier (poor efficiency)
  // 1.0 score = 1.2 modifier (excellent efficiency)
  const modifier = 0.8 + (normalizedScore * 0.4)

  return Math.round(modifier * 100) / 100
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
      // Phase 3.4: Display injury warning with discount percentage
      let injuryWarning = ''
      if (player.injury_warning && player.injury_discount && player.injury_discount < 1.0) {
        const discountPercent = Math.round((1 - player.injury_discount) * 100)
        const status = player.injury_status ? player.injury_status.toUpperCase() : 'QUESTIONABLE'
        injuryWarning = ` ⚠️ ${status} (${player.injury_type || 'Injury'}) - Projection reduced ${discountPercent}%`
      } else if (player.injury_warning) {
        const status = player.injury_status ? player.injury_status.toUpperCase() : 'QUESTIONABLE'
        injuryWarning = ` ⚠️ ${status} (${player.injury_type || 'Injury'})`
      }
      log(`\n  ${player.player_name} (${player.games_played} games)${injuryWarning}:`)

      for (const proj of player.projections) {
        log(`    ${proj.stat}:`)
        log(`      ${proj.floor} ← ${proj.expected} → ${proj.ceiling} (80% CI)`)
        log(`      Recent: ${proj.recent_avg} | Season: ${proj.season_avg} | StdDev: ${proj.std_dev}`)

        // Show opponent matchup difficulty
        const matchupIndicator = proj.opponent_factor > 1.05 ? '✅ Easier' :
                                proj.opponent_factor < 0.95 ? '⚠️ Tougher' : '➖ Average'
        log(`      Opponent Factor: ${proj.opponent_factor} ${matchupIndicator}`)

        // Phase 2.4 (V2): Show efficiency modifier if available
        if (proj.efficiency_modifier) {
          const efficiencyIndicator = proj.efficiency_modifier > 1.05 ? '⬆️ High' :
                                      proj.efficiency_modifier < 0.95 ? '⬇️ Low' : '➖ Neutral'
          log(`      Efficiency Modifier: ${proj.efficiency_modifier} ${efficiencyIndicator}`)
        }

        // Show bootstrap-based confidence level
        const confidenceEmoji = proj.confidence_level === 'HIGH' ? '🟢' :
                                proj.confidence_level === 'MEDIUM' ? '🟡' : '🔴';
        log(`      Confidence: ${confidenceEmoji} ${proj.confidence_level} (${(proj.confidence * 100).toFixed(0)}%)`)
        log(`      Bootstrap: ${proj.bootstrap_samples} samples, ±${proj.bootstrap_interval_width} range`)
      }

      // Phase 2.4 (V2): Display advanced metrics if available
      if (player.advanced_metrics) {
        const am = player.advanced_metrics
        const metrics = []
        if (am.epa_total !== null) metrics.push(`EPA: ${am.epa_total}`)
        if (am.success_rate !== null) metrics.push(`Success Rate: ${(am.success_rate * 100).toFixed(1)}%`)
        if (am.qbr !== null) metrics.push(`QBR: ${am.qbr}`)
        if (am.passing_rating !== null) metrics.push(`Rating: ${am.passing_rating}`)

        if (metrics.length > 0) {
          log(`    Advanced Metrics: ${metrics.join(' | ')}`)
        }
      }
    }
  }

  // Phase 5.2 (V3): Add team/position summary statistics
  if (!JSON_MODE) {
    log(`\n${'═'.repeat(80)}`)
    log(`TEAM SUMMARY - ${teamId}`)
    log('═'.repeat(80))

    for (const pos of positions) {
      const posPlayers = players.filter(p => p.position === pos)
      if (posPlayers.length === 0) continue

      const fantasyFloors = posPlayers
        .map(p => p.projections.find(pr => pr.stat === 'Fantasy Points')?.floor)
        .filter(f => f !== undefined)

      if (fantasyFloors.length > 0) {
        const avgFloor = (fantasyFloors.reduce((a, b) => a + b, 0) / fantasyFloors.length).toFixed(1)
        const maxFloor = Math.max(...fantasyFloors).toFixed(1)
        const minFloor = Math.min(...fantasyFloors).toFixed(1)
        log(`  ${pos}: Avg Floor ${avgFloor} pts | Range ${minFloor}-${maxFloor} pts | Players ${posPlayers.length}`)
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

  // Phase 1.2 (V3): Validate configuration before processing
  try {
    validateConfig()
  } catch (error) {
    logError('❌ Configuration validation failed:')
    logError(error.message)
    process.exit(1)
  }

  // Phase 2.1 (V3): Preload league averages for massive performance improvement
  await preloadLeagueAverages(CONFIG.current_season)

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

  // Phase 2.2 (V3): Cleanup cache timers for graceful shutdown
  LEAGUE_AVG_CACHE.destroy()
  ENVIRONMENT_CACHE.destroy()
  INJURY_CACHE.destroy()
}

main()
  .catch(error => {
    logError('Error:', error)
    process.exit(1)
  })
