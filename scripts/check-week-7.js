/**
 * Check Week 7 game statuses
 */

import { getSupabaseClient } from './utils/supabase-client.js'

async function checkWeek7() {
  const supabase = getSupabaseClient()

  const { data: games } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, home_score, away_score, status, game_date')
    .eq('season', 2025)
    .eq('week', 7)
    .order('game_date', { ascending: true })

  console.log('Week 7 Games:\n')

  games.forEach(g => {
    const status = g.status === 'final' ? '✅ FINAL' :
                   g.status === 'in_progress' ? '🔴 LIVE' :
                   '⏰ SCHEDULED'
    const score = g.status === 'scheduled' ? '' : ` (${g.away_score}-${g.home_score})`
    console.log(`${status} - ${g.away_team_id} @ ${g.home_team_id}${score}`)
  })

  const finalCount = games.filter(g => g.status === 'final').length
  const scheduledCount = games.filter(g => g.status === 'scheduled').length
  const liveCount = games.filter(g => g.status === 'in_progress').length

  console.log(`\nTotal: ${finalCount} final, ${liveCount} live, ${scheduledCount} scheduled`)
  console.log(`\nWeek 7 Status: ${finalCount}/16 games completed`)
}

checkWeek7()
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
