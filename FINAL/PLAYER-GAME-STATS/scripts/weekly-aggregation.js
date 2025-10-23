/**
 * Weekly Aggregation Script
 *
 * Calculates and populates:
 * - Section 2: Weekly Leaderboards (top 10 per category)
 * - Section 3: Season Cumulative Stats (running totals)
 *
 * Runs: After each week completes (typically Monday/Tuesday)
 *
 * Usage:
 * - npm run aggregate:weekly
 * - npm run aggregate:weekly -- --week=7 --season=2025
 *
 * Phase: 1 - Foundation Enhancement
 */

import { getSupabaseClient } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'

const SCRIPT_NAME = 'weekly-aggregation.js'

// Leaderboard categories (12 total)
const LEADERBOARD_CATEGORIES = [
  { key: 'passing_yards', label: 'Passing Yards', stat: 'passing_yards', minQualifier: 14 },
  { key: 'rushing_yards', label: 'Rushing Yards', stat: 'rushing_yards', minQualifier: 5 },
  { key: 'receiving_yards', label: 'Receiving Yards', stat: 'receiving_yards', minQualifier: 2 },
  { key: 'passing_touchdowns', label: 'Passing Touchdowns', stat: 'passing_touchdowns', minQualifier: 14 },
  { key: 'rushing_touchdowns', label: 'Rushing Touchdowns', stat: 'rushing_touchdowns', minQualifier: 5 },
  { key: 'receiving_touchdowns', label: 'Receiving Touchdowns', stat: 'receiving_touchdowns', minQualifier: 2 },
  { key: 'receptions', label: 'Receptions', stat: 'receptions', minQualifier: 2 },
  { key: 'fantasy_points_standard', label: 'Fantasy Points (Standard)', stat: 'fantasy_points_standard', minQualifier: 1 },
  { key: 'fantasy_points_ppr', label: 'Fantasy Points (PPR)', stat: 'fantasy_points_ppr', minQualifier: 1 },
  { key: 'passer_rating', label: 'Passer Rating', stat: 'passer_rating', minQualifier: 14 },
  { key: 'yards_from_scrimmage', label: 'Yards from Scrimmage', stat: 'rushing_yards,receiving_yards', calculated: true, minQualifier: 5 },
  { key: 'all_purpose_yards', label: 'All-Purpose Yards', stat: 'rushing_yards,receiving_yards', calculated: true, minQualifier: 5 }
]

/**
 * Main aggregation function
 */
async function runWeeklyAggregation(week, season) {
  logScriptStart(SCRIPT_NAME)

  const results = {
    weeklyLeaders: 0,
    seasonCumulative: 0,
    errors: []
  }

  try {
    logger.info(`Starting weekly aggregation for Week ${week}, ${season} season`)

    // Step 1: Calculate weekly leaderboards
    logger.info('Step 1: Calculating weekly leaderboards...')
    const weeklyLeadersCount = await calculateWeeklyLeaderboards(week, season)
    results.weeklyLeaders = weeklyLeadersCount
    logger.info(`✓ Generated ${weeklyLeadersCount} weekly leader records`)

    // Step 2: Calculate/update season cumulative stats
    logger.info('Step 2: Calculating season cumulative stats...')
    const seasonCumulativeCount = await calculateSeasonCumulative(week, season)
    results.seasonCumulative = seasonCumulativeCount
    logger.info(`✓ Updated ${seasonCumulativeCount} player season cumulative records`)

    logger.info(`\n${'='.repeat(60)}`)
    logger.info('WEEKLY AGGREGATION SUMMARY')
    logger.info(`${'='.repeat(60)}`)
    logger.info(`✓ Weekly leaders: ${results.weeklyLeaders}`)
    logger.info(`✓ Season cumulative: ${results.seasonCumulative}`)
    logger.info(`${'='.repeat(60)}`)

  } catch (error) {
    logger.error('Weekly aggregation failed:', error)
    results.errors.push(error.message)
  }

  logScriptEnd(SCRIPT_NAME)
  return results
}

/**
 * Calculate weekly leaderboards (Section 2)
 * Top 10 leaders per category
 */
async function calculateWeeklyLeaderboards(week, season) {
  const supabase = getSupabaseClient()
  let totalRecords = 0

  // Get all player stats for this week
  const { data: weekStats, error } = await supabase
    .from('player_game_stats')
    .select(`
      *,
      players!inner(full_name, primary_position)
    `)
    .eq('season', season)
    .gte('created_at', getWeekStartDate(week, season))
    .lte('created_at', getWeekEndDate(week, season))

  if (error) {
    logger.error(`Failed to fetch week ${week} stats:`, error)
    throw error
  }

  logger.info(`Processing ${weekStats.length} player performances from week ${week}`)

  // Process each leaderboard category
  for (const category of LEADERBOARD_CATEGORIES) {
    logger.info(`  Processing ${category.label}...`)

    let leaders
    if (category.calculated) {
      // Handle calculated stats (e.g., yards from scrimmage)
      leaders = calculateDerivedLeaders(weekStats, category, week, season)
    } else {
      // Handle direct stats
      leaders = weekStats
        .filter(s => s[category.stat] !== null && s[category.stat] > 0)
        .sort((a, b) => b[category.stat] - a[category.stat])
        .slice(0, 10)
        .map((stat, index) => ({
          season,
          week,
          category: category.key,
          rank: index + 1,
          player_id: stat.player_id,
          stat_value: stat[category.stat],
          touchdowns: stat.passing_touchdowns || stat.rushing_touchdowns || stat.receiving_touchdowns || 0,
          interceptions: stat.passing_interceptions || stat.interceptions || 0,
          receptions: stat.receptions || null,
          passer_rating: stat.passer_rating || null,
          game_result: null, // TODO: Get from games table
          trending_indicator: '', // TODO: Calculate from previous week
          trending_description: null,
          comparison_to_season_avg: null // TODO: Calculate from season stats
        }))
    }

    if (leaders.length > 0) {
      // Upsert leaders
      const { error: upsertError } = await supabase
        .from('weekly_stat_leaders')
        .upsert(leaders, {
          onConflict: 'season,week,category,rank',
          ignoreDuplicates: false
        })

      if (upsertError) {
        logger.error(`Failed to upsert ${category.label} leaders:`, upsertError)
      } else {
        totalRecords += leaders.length
        logger.info(`    ✓ Inserted ${leaders.length} leaders`)
      }
    } else {
      logger.info(`    ℹ No qualifiers for ${category.label}`)
    }
  }

  return totalRecords
}

/**
 * Calculate season cumulative stats (Section 3)
 * Running totals through current week
 */
async function calculateSeasonCumulative(week, season) {
  const supabase = getSupabaseClient()

  // Get all player stats for the season up to this week
  // NOTE: Supabase has hard limit of 1000 records per query, so we need to paginate
  logger.info('Fetching all player game stats (paginated)...')
  const seasonStats = []
  const PAGE_SIZE = 1000
  let page = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('player_game_stats')
      .select('*')
      .eq('season', season)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) {
      logger.error('Failed to fetch season stats:', error)
      throw error
    }

    if (data && data.length > 0) {
      seasonStats.push(...data)
      logger.info(`  Fetched page ${page + 1}: ${data.length} records (total so far: ${seasonStats.length})`)
      page++
      hasMore = data.length === PAGE_SIZE // Continue if we got a full page
    } else {
      hasMore = false
    }
  }

  logger.info(`Aggregating stats for ${seasonStats.length} player-game records`)

  // Group by player and sum stats
  const playerTotals = new Map()

  seasonStats.forEach(stat => {
    if (!playerTotals.has(stat.player_id)) {
      playerTotals.set(stat.player_id, {
        player_id: stat.player_id,
        season,
        last_updated_week: week,
        games_played: 0,
        games_started: 0,

        // Passing
        season_passing_attempts: 0,
        season_passing_completions: 0,
        season_passing_yards: 0,
        season_passing_touchdowns: 0,
        season_passing_interceptions: 0,
        season_passing_sacks: 0,
        season_passer_rating: null,

        // Rushing
        season_rushing_attempts: 0,
        season_rushing_yards: 0,
        season_rushing_touchdowns: 0,
        season_rushing_fumbles_lost: 0,

        // Receiving
        season_receptions: 0,
        season_receiving_yards: 0,
        season_receiving_touchdowns: 0,
        season_receiving_targets: 0,

        // Defense
        season_tackles_total: 0,
        season_sacks: 0,
        season_interceptions: 0,
        season_forced_fumbles: 0,
        season_passes_defended: 0,

        // Kicking
        season_field_goals_made: 0,
        season_field_goals_attempted: 0,

        // Fantasy
        season_fantasy_points_standard: 0,
        season_fantasy_points_ppr: 0,
        season_fantasy_points_half_ppr: 0
      })
    }

    const totals = playerTotals.get(stat.player_id)
    totals.games_played++
    if (stat.started) totals.games_started++

    // Accumulate stats
    totals.season_passing_attempts += stat.passing_attempts || 0
    totals.season_passing_completions += stat.passing_completions || 0
    totals.season_passing_yards += stat.passing_yards || 0
    totals.season_passing_touchdowns += stat.passing_touchdowns || 0
    totals.season_passing_interceptions += stat.passing_interceptions || 0
    totals.season_passing_sacks += stat.passing_sacks || 0

    totals.season_rushing_attempts += stat.rushing_attempts || 0
    totals.season_rushing_yards += stat.rushing_yards || 0
    totals.season_rushing_touchdowns += stat.rushing_touchdowns || 0
    totals.season_rushing_fumbles_lost += stat.rushing_fumbles_lost || 0

    totals.season_receptions += stat.receptions || 0
    totals.season_receiving_yards += stat.receiving_yards || 0
    totals.season_receiving_touchdowns += stat.receiving_touchdowns || 0
    totals.season_receiving_targets += stat.receiving_targets || 0

    totals.season_tackles_total += stat.tackles_total || 0
    totals.season_sacks += stat.sacks || 0
    totals.season_interceptions += stat.interceptions || 0
    totals.season_forced_fumbles += stat.forced_fumbles || 0
    totals.season_passes_defended += stat.passes_defended || 0

    totals.season_field_goals_made += stat.field_goals_made || 0
    totals.season_field_goals_attempted += stat.field_goals_attempted || 0

    totals.season_fantasy_points_standard += stat.fantasy_points_standard || 0
    totals.season_fantasy_points_ppr += stat.fantasy_points_ppr || 0
    totals.season_fantasy_points_half_ppr += stat.fantasy_points_half_ppr || 0
  })

  // Calculate passer rating and pace projections
  const playerTotalsArray = Array.from(playerTotals.values())
  playerTotalsArray.forEach(totals => {
    // Calculate season passer rating (average)
    if (totals.season_passing_attempts > 0) {
      totals.season_passer_rating = calculatePasserRating(
        totals.season_passing_completions,
        totals.season_passing_attempts,
        totals.season_passing_yards,
        totals.season_passing_touchdowns,
        totals.season_passing_interceptions
      )
    }

    // Calculate pace projections (17-game season)
    const gamesPlayed = totals.games_played
    if (gamesPlayed > 0) {
      const paceMultiplier = 17 / gamesPlayed

      totals.pace_projected_passing_yards = Math.round(totals.season_passing_yards * paceMultiplier)
      totals.pace_projected_passing_touchdowns = Math.round(totals.season_passing_touchdowns * paceMultiplier)
      totals.pace_projected_rushing_yards = Math.round(totals.season_rushing_yards * paceMultiplier)
      totals.pace_projected_rushing_touchdowns = Math.round(totals.season_rushing_touchdowns * paceMultiplier)
      totals.pace_projected_receptions = Math.round(totals.season_receptions * paceMultiplier)
      totals.pace_projected_receiving_yards = Math.round(totals.season_receiving_yards * paceMultiplier)
      totals.pace_projected_receiving_touchdowns = Math.round(totals.season_receiving_touchdowns * paceMultiplier)

      // Historical comparison (placeholder)
      if (totals.pace_projected_passing_yards > 5000) {
        totals.historical_comparison = `On pace for ${totals.pace_projected_passing_yards} yards (would rank in top 10 all-time)`
      } else if (totals.pace_projected_rushing_yards > 2000) {
        totals.historical_comparison = `On pace for ${totals.pace_projected_rushing_yards} yards (would break single-season record)`
      } else if (totals.pace_projected_receiving_yards > 1800) {
        totals.historical_comparison = `On pace for ${totals.pace_projected_receiving_yards} yards (would rank in top 5 all-time)`
      }
    }
  })

  // Calculate rankings
  calculateRankings(playerTotalsArray)

  // Upsert season cumulative stats
  const { error: upsertError } = await supabase
    .from('player_season_cumulative_stats')
    .upsert(playerTotalsArray, {
      onConflict: 'player_id,season',
      ignoreDuplicates: false
    })

  if (upsertError) {
    logger.error('Failed to upsert season cumulative stats:', upsertError)
    throw upsertError
  }

  return playerTotalsArray.length
}

/**
 * Calculate derived leaders (e.g., yards from scrimmage)
 */
function calculateDerivedLeaders(stats, category, week, season) {
  if (category.key === 'yards_from_scrimmage') {
    return stats
      .map(s => ({
        ...s,
        calculated_stat: (s.rushing_yards || 0) + (s.receiving_yards || 0)
      }))
      .filter(s => s.calculated_stat > 0)
      .sort((a, b) => b.calculated_stat - a.calculated_stat)
      .slice(0, 10)
      .map((stat, index) => ({
        season,
        week,
        category: category.key,
        rank: index + 1,
        player_id: stat.player_id,
        stat_value: stat.calculated_stat,
        touchdowns: (stat.rushing_touchdowns || 0) + (stat.receiving_touchdowns || 0),
        interceptions: 0,
        game_result: null,
        trending_indicator: '',
        trending_description: null,
        comparison_to_season_avg: null
      }))
  }

  return []
}

/**
 * Calculate rankings for season cumulative stats
 */
function calculateRankings(playerTotals) {
  // Sort by passing yards and assign ranks
  const passingRanks = [...playerTotals]
    .filter(p => p.season_passing_yards > 0)
    .sort((a, b) => b.season_passing_yards - a.season_passing_yards)
  passingRanks.forEach((player, index) => {
    const original = playerTotals.find(p => p.player_id === player.player_id)
    if (original) original.season_rank_passing_yards = index + 1
  })

  // Sort by rushing yards
  const rushingRanks = [...playerTotals]
    .filter(p => p.season_rushing_yards > 0)
    .sort((a, b) => b.season_rushing_yards - a.season_rushing_yards)
  rushingRanks.forEach((player, index) => {
    const original = playerTotals.find(p => p.player_id === player.player_id)
    if (original) original.season_rank_rushing_yards = index + 1
  })

  // Sort by receiving yards
  const receivingRanks = [...playerTotals]
    .filter(p => p.season_receiving_yards > 0)
    .sort((a, b) => b.season_receiving_yards - a.season_receiving_yards)
  receivingRanks.forEach((player, index) => {
    const original = playerTotals.find(p => p.player_id === player.player_id)
    if (original) original.season_rank_receiving_yards = index + 1
  })

  // Sort by fantasy PPR
  const fantasyRanks = [...playerTotals]
    .filter(p => p.season_fantasy_points_ppr > 0)
    .sort((a, b) => b.season_fantasy_points_ppr - a.season_fantasy_points_ppr)
  fantasyRanks.forEach((player, index) => {
    const original = playerTotals.find(p => p.player_id === player.player_id)
    if (original) original.season_rank_fantasy_ppr = index + 1
  })
}

/**
 * Calculate NFL passer rating
 */
function calculatePasserRating(completions, attempts, yards, tds, ints) {
  if (attempts === 0) return null

  const a = Math.min(Math.max(((completions / attempts) - 0.3) * 5, 0), 2.375)
  const b = Math.min(Math.max(((yards / attempts) - 3) * 0.25, 0), 2.375)
  const c = Math.min(Math.max((tds / attempts) * 20, 0), 2.375)
  const d = Math.min(Math.max(2.375 - ((ints / attempts) * 25), 0), 2.375)

  const rating = ((a + b + c + d) / 6) * 100
  return Math.round(rating * 10) / 10
}

/**
 * Get week start date (placeholder - needs proper NFL schedule logic)
 */
function getWeekStartDate(week, season) {
  // Simplified: Assumes week starts on Thursday
  const seasonStart = new Date(`${season}-09-05`) // Approximate NFL season start
  const weekStart = new Date(seasonStart)
  weekStart.setDate(seasonStart.getDate() + ((week - 1) * 7))
  return weekStart.toISOString()
}

/**
 * Get week end date
 */
function getWeekEndDate(week, season) {
  const weekStart = new Date(getWeekStartDate(week, season))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  return weekEnd.toISOString()
}

/**
 * CLI handling
 */
const args = process.argv.slice(2)
const weekArg = args.find(arg => arg.startsWith('--week='))
const seasonArg = args.find(arg => arg.startsWith('--season='))

const week = weekArg ? parseInt(weekArg.split('=')[1]) : 7 // Default to week 7
const season = seasonArg ? parseInt(seasonArg.split('=')[1]) : 2025

runWeeklyAggregation(week, season)
  .then(results => {
    logger.info('Weekly aggregation complete')
    process.exit(0)
  })
  .catch(error => {
    logger.error('Weekly aggregation failed:', error)
    process.exit(1)
  })

export { runWeeklyAggregation }
