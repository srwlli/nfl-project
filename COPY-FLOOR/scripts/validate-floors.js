/**
 * Backtesting Validation Framework for Performance Floors
 *
 * Validates floor projections against actual game outcomes to measure:
 * - Mean Absolute Error (MAE)
 * - Coverage Rate (% of actuals within floor-ceiling range)
 * - Calibration (do 80% confidence intervals actually contain 80% of outcomes?)
 * - Bias detection (systematic over/under projection)
 *
 * Academic Foundation:
 * @citation Hopkins, W. G. (2003). "A scale of magnitudes for effect statistics."
 *           A New View of Statistics. https://www.sportsci.org/resource/stats/
 * @citation Sainani, K. L. (2024). "Prediction Intervals in Sports Science Research."
 *           PubMed. https://pubmed.ncbi.nlm.nih.gov/38412063/
 *
 * Usage:
 *   node scripts/validate-floors.js --week=7
 *   node scripts/validate-floors.js --weeks=1-7
 *   node scripts/validate-floors.js --season=2025 --output=markdown
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  calculateModifiedPredictionInterval,
  assessConfidenceLevel
} from './utils/bootstrap-intervals.js'
import {
  calculatePositionStats,
  applyHierarchicalAdjustment
} from './utils/hierarchical-stats.js'
import { calculateEWMAProjection } from './utils/temporal-smoothing.js'

const supabase = getSupabaseClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const configPath = join(__dirname, 'performance-floors-config.json')
const CONFIG = JSON.parse(readFileSync(configPath, 'utf-8'))

/**
 * Backtest a single week's projections against actual outcomes
 *
 * @param {number} week - Week number to validate
 * @param {number} season - Season year
 * @returns {Promise<Object>} Validation metrics
 */
async function backtestWeek(week, season = 2025) {
  console.log(`\nBacktesting Week ${week}, ${season} season...`)

  // Get completed games for this week
  const { data: games } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id')
    .eq('season', season)
    .eq('week', week)
    .eq('status', 'final')

  if (!games || games.length === 0) {
    console.log(`No completed games found for Week ${week}`)
    return null
  }

  console.log(`Found ${games.length} completed games`)

  const validationResults = []
  let totalPlayers = 0
  let playersWithHistory = 0
  const statFields = [
    'passing_yards',
    'rushing_yards',
    'receiving_yards',
    'fantasy_points_ppr'
  ]

  // For each game, generate projections using data BEFORE that week
  for (const game of games) {
    const gameId = game.game_id

    // Get actual player stats for this game (join with players to get position)
    const { data: actualStats } = await supabase
      .from('player_game_stats')
      .select(`
        player_id,
        passing_yards,
        rushing_yards,
        receiving_yards,
        fantasy_points_ppr,
        players!inner(primary_position)
      `)
      .eq('game_id', gameId)
      .eq('season', season)

    if (!actualStats || actualStats.length === 0) continue

    // Filter to skill positions
    const filteredStats = actualStats
      .filter(s => ['QB', 'RB', 'WR', 'TE'].includes(s.players?.primary_position))
      .map(s => ({
        ...s,
        position: s.players.primary_position
      }))

    // For each player, generate projection using historical data
    for (const playerActual of filteredStats) {
      const { player_id, position } = playerActual

      // Get player's historical games BEFORE this week (join with games to get week)
      const { data: historicalGames } = await supabase
        .from('player_game_stats')
        .select(`
          *,
          games!inner(week, status)
        `)
        .eq('player_id', player_id)
        .eq('season', season)

      // Filter to completed games before this week
      const filteredHistorical = (historicalGames || [])
        .filter(g => g.games?.week < week && g.games?.status === 'final')
        .sort((a, b) => b.games.week - a.games.week) // Descending by week

      if (!filteredHistorical || filteredHistorical.length < CONFIG.min_games_played) {
        continue // Not enough data to project
      }

      // Get position stats for hierarchical adjustment
      const positionStats = await calculatePositionStats(
        supabase,
        position,
        season,
        week - 1 // Use data up to previous week
      )

      // Generate projections for each stat
      for (const statField of statFields) {
        // Skip irrelevant stats (e.g., passing_yards for RB)
        if ((statField === 'passing_yards' && position !== 'QB') ||
            (statField === 'rushing_yards' && position === 'TE') ||
            (statField === 'receiving_yards' && position === 'QB')) {
          continue
        }

        const actual = playerActual[statField]
        if (actual === null || actual === undefined || isNaN(actual)) {
          continue
        }

        // Calculate projection using same logic as main script
        const seasonValues = filteredHistorical.map(g => g[statField]).filter(v => v !== null && !isNaN(v))

        if (seasonValues.length === 0) continue

        const seasonAvg = seasonValues.reduce((a, b) => a + b, 0) / seasonValues.length

        // Get recent games
        const rollingWindow = CONFIG.rolling_window_by_position[position] || CONFIG.rolling_window_weeks
        const recentGames = filteredHistorical.slice(0, rollingWindow)

        // EWMA projection
        const ewmaProj = calculateEWMAProjection(filteredHistorical, recentGames, statField, position)
        let expected = ewmaProj.projection

        // Hierarchical adjustment
        if (positionStats?.positionMean) {
          const hierarchicalAdj = applyHierarchicalAdjustment(seasonValues, positionStats)
          expected = hierarchicalAdj.shrunkenMean
        }

        // Bootstrap intervals (with neutral modifier for validation)
        const bootstrapInterval = calculateModifiedPredictionInterval(
          seasonValues,
          1.0, // Neutral modifier for pure validation
          {
            numSamples: CONFIG.bootstrap_samples || 500,
            confidence: CONFIG.bootstrap_confidence || 0.80
          }
        )

        const floor = bootstrapInterval.floor
        const ceiling = bootstrapInterval.ceiling

        // Record validation result
        validationResults.push({
          week,
          game_id: gameId,
          player_id,
          position,
          stat_field: statField,
          actual,
          expected,
          floor,
          ceiling,
          error: Math.abs(actual - expected),
          within_range: actual >= floor && actual <= ceiling,
          below_floor: actual < floor,
          above_ceiling: actual > ceiling,
          sample_size: seasonValues.length
        })
      }
    }
  }

  return validationResults
}

/**
 * Calculate aggregate validation metrics
 *
 * @param {Array<Object>} results - Validation results
 * @returns {Object} Aggregate metrics
 */
function calculateMetrics(results) {
  if (!results || results.length === 0) {
    return null
  }

  // Overall metrics
  const totalPredictions = results.length
  const totalError = results.reduce((sum, r) => sum + r.error, 0)
  const mae = totalError / totalPredictions

  const coverageCount = results.filter(r => r.within_range).length
  const coverageRate = coverageCount / totalPredictions

  const belowFloorCount = results.filter(r => r.below_floor).length
  const aboveCeilingCount = results.filter(r => r.above_ceiling).length

  // By position
  const byPosition = {}
  const positions = ['QB', 'RB', 'WR', 'TE']

  for (const pos of positions) {
    const posResults = results.filter(r => r.position === pos)
    if (posResults.length === 0) continue

    const posError = posResults.reduce((sum, r) => sum + r.error, 0)
    const posCoverage = posResults.filter(r => r.within_range).length

    byPosition[pos] = {
      predictions: posResults.length,
      mae: posError / posResults.length,
      coverage_rate: posCoverage / posResults.length,
      below_floor: posResults.filter(r => r.below_floor).length,
      above_ceiling: posResults.filter(r => r.above_ceiling).length
    }
  }

  // By stat type
  const byStatField = {}
  const statFields = [...new Set(results.map(r => r.stat_field))]

  for (const stat of statFields) {
    const statResults = results.filter(r => r.stat_field === stat)
    const statError = statResults.reduce((sum, r) => sum + r.error, 0)
    const statCoverage = statResults.filter(r => r.within_range).length

    byStatField[stat] = {
      predictions: statResults.length,
      mae: statError / statResults.length,
      coverage_rate: statCoverage / statResults.length
    }
  }

  return {
    overall: {
      total_predictions: totalPredictions,
      mae: Math.round(mae * 100) / 100,
      coverage_rate: Math.round(coverageRate * 1000) / 10, // Percentage
      below_floor_count: belowFloorCount,
      above_ceiling_count: aboveCeilingCount,
      target_coverage: CONFIG.bootstrap_confidence * 100 // Expected coverage %
    },
    by_position: byPosition,
    by_stat_field: byStatField
  }
}

/**
 * Generate markdown validation report
 *
 * @param {Object} metrics - Validation metrics
 * @param {Array<number>} weeks - Weeks validated
 * @param {number} season - Season year
 * @returns {string} Markdown report
 */
function generateMarkdownReport(metrics, weeks, season) {
  const weekRange = weeks.length > 1
    ? `Weeks ${Math.min(...weeks)}-${Math.max(...weeks)}`
    : `Week ${weeks[0]}`

  let report = `# Performance Floor Validation Report\n\n`
  report += `**Season:** ${season}\n`
  report += `**Validation Period:** ${weekRange}\n`
  report += `**Generated:** ${new Date().toISOString()}\n\n`
  report += `---\n\n`

  // Overall metrics
  const overall = metrics.overall
  report += `## Overall Metrics\n\n`
  report += `| Metric | Value | Target |\n`
  report += `|--------|-------|--------|\n`
  report += `| **Total Predictions** | ${overall.total_predictions} | - |\n`
  report += `| **Mean Absolute Error (MAE)** | ${overall.mae} | Lower is better |\n`
  report += `| **Coverage Rate** | ${overall.coverage_rate}% | ${overall.target_coverage}% |\n`
  report += `| **Below Floor** | ${overall.below_floor_count} | ~10% |\n`
  report += `| **Above Ceiling** | ${overall.above_ceiling_count} | ~10% |\n\n`

  // Calibration assessment
  const calibrationDiff = Math.abs(overall.coverage_rate - overall.target_coverage)
  let calibrationStatus = '✅ Well-calibrated'
  if (calibrationDiff > 10) {
    calibrationStatus = '⚠️ Needs recalibration'
  } else if (calibrationDiff > 5) {
    calibrationStatus = '🟡 Acceptable'
  }

  report += `**Calibration Status:** ${calibrationStatus}\n\n`
  report += `---\n\n`

  // By position
  report += `## Metrics by Position\n\n`
  report += `| Position | Predictions | MAE | Coverage | Below Floor | Above Ceiling |\n`
  report += `|----------|-------------|-----|----------|-------------|---------------|\n`

  for (const [pos, data] of Object.entries(metrics.by_position)) {
    report += `| **${pos}** | ${data.predictions} | ${data.mae.toFixed(1)} | ${(data.coverage_rate * 100).toFixed(1)}% | ${data.below_floor} | ${data.above_ceiling} |\n`
  }

  report += `\n---\n\n`

  // By stat field
  report += `## Metrics by Stat Type\n\n`
  report += `| Stat | Predictions | MAE | Coverage |\n`
  report += `|------|-------------|-----|----------|\n`

  for (const [stat, data] of Object.entries(metrics.by_stat_field)) {
    const statName = stat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    report += `| **${statName}** | ${data.predictions} | ${data.mae.toFixed(1)} | ${(data.coverage_rate * 100).toFixed(1)}% |\n`
  }

  report += `\n---\n\n`

  // Interpretation
  report += `## Interpretation\n\n`
  report += `### Mean Absolute Error (MAE)\n`
  report += `- Measures average prediction error in stat units\n`
  report += `- Lower is better (closer to actual outcomes)\n`
  report += `- Position-specific benchmarks:\n`
  report += `  - QB Passing Yards: <30 excellent, <50 good\n`
  report += `  - RB/WR Yards: <20 excellent, <35 good\n`
  report += `  - Fantasy Points: <5 excellent, <8 good\n\n`

  report += `### Coverage Rate\n`
  report += `- % of actual outcomes within [floor, ceiling] range\n`
  report += `- Should match confidence level (${overall.target_coverage}%)\n`
  report += `- If too high: Intervals too wide (conservative)\n`
  report += `- If too low: Intervals too narrow (overconfident)\n\n`

  report += `### Below Floor / Above Ceiling\n`
  report += `- For 80% confidence: expect ~10% on each side\n`
  report += `- Asymmetry indicates systematic bias\n`
  report += `- More below floor = projections too optimistic\n`
  report += `- More above ceiling = projections too pessimistic\n\n`

  return report
}

/**
 * Main validation workflow
 */
async function main() {
  const args = process.argv.slice(2)

  // Parse arguments
  let weeks = []
  let season = CONFIG.current_season || 2025
  let outputFormat = 'console' // 'console' or 'markdown'

  for (const arg of args) {
    if (arg.startsWith('--week=')) {
      weeks = [parseInt(arg.split('=')[1])]
    } else if (arg.startsWith('--weeks=')) {
      const range = arg.split('=')[1]
      const [start, end] = range.split('-').map(Number)
      weeks = Array.from({ length: end - start + 1 }, (_, i) => start + i)
    } else if (arg.startsWith('--season=')) {
      season = parseInt(arg.split('=')[1])
    } else if (arg.startsWith('--output=')) {
      outputFormat = arg.split('=')[1]
    }
  }

  if (weeks.length === 0) {
    console.error('Usage: node validate-floors.js --week=7 [--season=2025] [--output=markdown]')
    console.error('   or: node validate-floors.js --weeks=1-7 [--season=2025]')
    process.exit(1)
  }

  console.log(`\n${'='.repeat(80)}`)
  console.log(`Performance Floor Validation`)
  console.log(`Season: ${season} | Weeks: ${weeks.join(', ')}`)
  console.log('='.repeat(80))

  // Backtest each week
  const allResults = []

  for (const week of weeks) {
    const weekResults = await backtestWeek(week, season)
    if (weekResults) {
      allResults.push(...weekResults)
    }
  }

  if (allResults.length === 0) {
    console.log('\nNo validation results generated. Check that weeks have completed games.')
    process.exit(0)
  }

  // Calculate metrics
  const metrics = calculateMetrics(allResults)

  // Output results
  if (outputFormat === 'markdown') {
    const report = generateMarkdownReport(metrics, weeks, season)
    const reportPath = join(__dirname, `validation-report-week${weeks.join('-')}.md`)
    writeFileSync(reportPath, report)
    console.log(`\n✅ Validation report saved to: ${reportPath}`)
  } else {
    // Console output
    console.log(`\n${'='.repeat(80)}`)
    console.log('OVERALL METRICS')
    console.log('='.repeat(80))
    console.log(`Total Predictions: ${metrics.overall.total_predictions}`)
    console.log(`Mean Absolute Error (MAE): ${metrics.overall.mae}`)
    console.log(`Coverage Rate: ${metrics.overall.coverage_rate}% (target: ${metrics.overall.target_coverage}%)`)
    console.log(`Below Floor: ${metrics.overall.below_floor_count}`)
    console.log(`Above Ceiling: ${metrics.overall.above_ceiling_count}`)

    console.log(`\n${'='.repeat(80)}`)
    console.log('METRICS BY POSITION')
    console.log('='.repeat(80))
    for (const [pos, data] of Object.entries(metrics.by_position)) {
      console.log(`\n${pos}:`)
      console.log(`  Predictions: ${data.predictions}`)
      console.log(`  MAE: ${data.mae.toFixed(1)}`)
      console.log(`  Coverage: ${(data.coverage_rate * 100).toFixed(1)}%`)
    }

    console.log(`\n${'='.repeat(80)}`)
    console.log('METRICS BY STAT TYPE')
    console.log('='.repeat(80))
    for (const [stat, data] of Object.entries(metrics.by_stat_field)) {
      console.log(`\n${stat}:`)
      console.log(`  Predictions: ${data.predictions}`)
      console.log(`  MAE: ${data.mae.toFixed(1)}`)
      console.log(`  Coverage: ${(data.coverage_rate * 100).toFixed(1)}%`)
    }
  }

  console.log(`\n✅ Validation complete!`)
}

main().catch(error => {
  console.error('Error running validation:', error)
  process.exit(1)
})
