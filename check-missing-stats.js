/**
 * Check which final games are missing stats
 */

import { getSupabaseClient } from './scripts/utils/supabase-client.js'

async function checkMissingStats() {
  const supabase = getSupabaseClient()

  // Get all final games
  const { data: finalGames } = await supabase
    .from('games')
    .select('game_id, season, game_date, week, home_team_id, away_team_id, home_score, away_score')
    .eq('status', 'final')
    .order('game_date', { ascending: true })

  if (!finalGames || finalGames.length === 0) {
    console.log('❌ No final games found or query error')
    return
  }

  console.log(`\n=== CHECKING ${finalGames.length} FINAL GAMES ===\n`)

  // Check which have team stats
  const gamesWithStats = []
  const gamesWithoutStats = []

  for (const game of finalGames) {
    const { count } = await supabase
      .from('team_game_stats')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', game.game_id)
      .eq('season', game.season)

    if (count > 0) {
      gamesWithStats.push(game)
    } else {
      gamesWithoutStats.push(game)
    }
  }

  console.log(`✅ Games WITH stats: ${gamesWithStats.length}`)
  console.log(`❌ Games WITHOUT stats: ${gamesWithoutStats.length}`)

  if (gamesWithStats.length > 0) {
    console.log(`\nFirst game WITH stats:`)
    const first = gamesWithStats[0]
    console.log(`   Week ${first.week}: ${first.away_team_id} @ ${first.home_team_id} (${first.game_date})`)

    console.log(`\nLast game WITH stats:`)
    const last = gamesWithStats[gamesWithStats.length - 1]
    console.log(`   Week ${last.week}: ${last.away_team_id} @ ${last.home_team_id} (${last.game_date})`)
  }

  if (gamesWithoutStats.length > 0) {
    console.log(`\n\n❌ GAMES MISSING STATS (${gamesWithoutStats.length} games):`)
    console.log(`${'='.repeat(80)}\n`)

    gamesWithoutStats.forEach(game => {
      console.log(`Week ${game.week.toString().padStart(2)} | ${game.game_date} | ${game.away_team_id.padEnd(3)} @ ${game.home_team_id.padEnd(3)} | ${game.away_score}-${game.home_score}`)
    })
  }

  console.log('\n')
}

checkMissingStats().catch(console.error)
