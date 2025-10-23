import { getSupabaseClient } from './utils/supabase-client.js'
import { execSync } from 'child_process'

const supabase = getSupabaseClient()

/**
 * Automated script to ensure complete data prerequisites before scraping
 *
 * This script:
 * 1. Checks for missing players causing FK errors
 * 2. Runs roster scraper if needed
 * 3. Validates data completeness
 * 4. Optionally triggers game stats scraper
 *
 * Usage:
 *   node scripts/ensure-complete-data.js
 *   node scripts/ensure-complete-data.js --week=7
 *   node scripts/ensure-complete-data.js --auto-scrape  (runs game scraper after fixing)
 */

async function ensureCompleteData() {
  console.log('='.repeat(80))
  console.log('ENSURING COMPLETE DATA PREREQUISITES')
  console.log('='.repeat(80))

  const args = process.argv.slice(2)
  const weekArg = args.find(arg => arg.startsWith('--week='))
  const autoScrape = args.includes('--auto-scrape')
  const week = weekArg ? weekArg.split('=')[1] : null

  // Step 1: Check for missing player references
  console.log('\n[1/4] Checking for missing player references...')
  const missingPlayers = await checkMissingPlayers()

  if (missingPlayers.length > 0) {
    console.log(`\n⚠️  Found ${missingPlayers.length} missing player references:`)
    missingPlayers.forEach(p => {
      console.log(`   - ${p.player_id} (appears in ${p.game_count} games)`)
    })

    // Step 2: Run roster scraper to add missing players
    console.log('\n[2/4] Running roster scraper to add missing players...')
    try {
      execSync('npm run scrape:roster', { stdio: 'inherit' })
      console.log('✅ Roster scraper completed successfully')
    } catch (error) {
      console.error('❌ Roster scraper failed:', error.message)
      process.exit(1)
    }

    // Step 3: Verify missing players are now present
    console.log('\n[3/4] Verifying missing players were added...')
    const stillMissing = await verifyPlayersAdded(missingPlayers.map(p => p.player_id))

    if (stillMissing.length > 0) {
      console.log(`\n⚠️  ${stillMissing.length} players still missing after roster scrape:`)
      stillMissing.forEach(id => console.log(`   - ${id}`))
      console.log('\n❌ Manual intervention required - some players not found in ESPN rosters')
      process.exit(1)
    }

    console.log('✅ All missing players have been added to the database')
  } else {
    console.log('✅ No missing player references found')
    console.log('\n[2/4] Skipping roster scraper (no missing players)')
    console.log('[3/4] Skipping verification (no missing players)')
  }

  // Step 4: Check data completeness
  console.log('\n[4/4] Checking data completeness...')
  await checkDataCompleteness()

  // Optional: Auto-trigger game stats scraper
  if (autoScrape) {
    console.log('\n' + '='.repeat(80))
    console.log('AUTO-SCRAPING GAME STATS')
    console.log('='.repeat(80))

    if (week) {
      console.log(`\nScraping Week ${week}...`)
      execSync(`npm run scrape:game-stats -- --week=${week}`, { stdio: 'inherit' })
    } else {
      console.log('\nScraping all missing games...')
      const missingGames = await getMissingGames()
      console.log(`Found ${missingGames.length} games without player stats`)

      // Group by week and scrape
      const weekMap = {}
      missingGames.forEach(g => {
        if (!weekMap[g.week]) weekMap[g.week] = []
        weekMap[g.week].push(g)
      })

      for (const [weekNum, games] of Object.entries(weekMap)) {
        console.log(`\nScraping Week ${weekNum} (${games.length} games)...`)
        execSync(`npm run scrape:game-stats -- --week=${weekNum}`, { stdio: 'inherit' })
      }
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ DATA PREREQUISITES COMPLETE')
  console.log('='.repeat(80))
}

/**
 * Check for player IDs referenced in game stats that don't exist in players table
 */
async function checkMissingPlayers() {
  // Query to find player_ids in game stats that don't exist in players table
  // This uses a raw SQL query since Supabase client doesn't support complex LEFT JOIN anti-patterns
  const { data, error } = await supabase.rpc('check_missing_players')

  if (error) {
    // Fallback: manually check by attempting to scrape a sample game and catching FK errors
    console.log('   (Using fallback method - checking completed games for FK errors)')

    const { data: completedGames } = await supabase
      .from('games')
      .select('game_id, week, home_team_id, away_team_id')
      .eq('season', 2025)
      .eq('status', 'final')
      .order('week')
      .limit(10)

    const { data: statsGames } = await supabase
      .from('player_game_stats')
      .select('game_id')
      .eq('season', 2025)

    const gamesWithStats = new Set(statsGames.map(s => s.game_id))
    const gamesWithoutStats = completedGames.filter(g => !gamesWithStats.has(g.game_id))

    if (gamesWithoutStats.length > 0) {
      console.log(`   Found ${gamesWithoutStats.length} games without stats (potential FK issues)`)
      return [{ player_id: 'unknown', game_count: gamesWithoutStats.length }]
    }

    return []
  }

  return data || []
}

/**
 * Verify that previously missing players are now in the database
 */
async function verifyPlayersAdded(playerIds) {
  const { data } = await supabase
    .from('players')
    .select('player_id')
    .in('player_id', playerIds)

  const foundIds = new Set(data.map(p => p.player_id))
  return playerIds.filter(id => !foundIds.has(id))
}

/**
 * Check overall data completeness
 */
async function checkDataCompleteness() {
  const { data: completedGames } = await supabase
    .from('games')
    .select('game_id')
    .eq('season', 2025)
    .eq('status', 'final')

  const { data: playerStats } = await supabase
    .from('player_game_stats')
    .select('game_id')
    .eq('season', 2025)

  const gamesWithStats = new Set(playerStats.map(s => s.game_id))
  const coverage = Math.round((gamesWithStats.size / completedGames.length) * 100)

  console.log(`   Completed games: ${completedGames.length}`)
  console.log(`   Games with stats: ${gamesWithStats.size}`)
  console.log(`   Coverage: ${coverage}%`)

  if (coverage === 100) {
    console.log('   ✅ Full coverage - all games have player stats')
  } else {
    console.log(`   ⚠️  ${completedGames.length - gamesWithStats.size} games still missing stats`)
  }
}

/**
 * Get list of games without player stats
 */
async function getMissingGames() {
  const { data: completedGames } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id')
    .eq('season', 2025)
    .eq('status', 'final')
    .order('week')

  const { data: playerStats } = await supabase
    .from('player_game_stats')
    .select('game_id')
    .eq('season', 2025)

  const gamesWithStats = new Set(playerStats.map(s => s.game_id))
  return completedGames.filter(g => !gamesWithStats.has(g.game_id))
}

// Run the script
ensureCompleteData().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
