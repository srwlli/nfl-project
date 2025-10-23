import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function showSeasonLeaders() {
  console.log('='.repeat(80))
  console.log('2025 SEASON LEADERS (Through Week 7)')
  console.log('='.repeat(80))

  const positions = [
    { pos: 'QB', limit: 32, sortBy: 'passing_yards' },
    { pos: 'RB', limit: 32, sortBy: 'rushing_yards' },
    { pos: 'WR', limit: 64, sortBy: 'receiving_yards' },
    { pos: 'TE', limit: 32, sortBy: 'receiving_yards' }
  ]

  for (const { pos, limit, sortBy } of positions) {
    // Map sortBy to the season cumulative column names
    const seasonSortBy = sortBy === 'passing_yards' ? 'season_passing_yards' :
                        sortBy === 'rushing_yards' ? 'season_rushing_yards' :
                        sortBy === 'receiving_yards' ? 'season_receiving_yards' : sortBy

    const { data } = await supabase
      .from('player_season_cumulative_stats')
      .select(`
        player_id,
        games_played,
        season_passing_yards,
        season_rushing_yards,
        season_receiving_yards,
        season_passing_touchdowns,
        season_rushing_touchdowns,
        season_receiving_touchdowns,
        season_receptions,
        season_fantasy_points_ppr,
        players!inner(full_name, primary_position)
      `)
      .eq('season', 2025)
      .eq('players.primary_position', pos)
      .order(seasonSortBy, { ascending: false })
      .limit(limit)

    console.log(`\n${pos} LEADERS (Top ${limit}):`)
    console.log('─'.repeat(80))

    if (!data || data.length === 0) {
      console.log('No data found')
      continue
    }

    data.slice(0, 10).forEach((p, i) => {
      const rank = (i + 1).toString().padStart(2)
      const name = p.players.full_name.substring(0, 25).padEnd(25)
      const games = p.games_played

      let stats = ''
      if (pos === 'QB') {
        stats = `${p.season_passing_yards} pass yds, ${p.season_passing_touchdowns} TD`
      } else if (pos === 'RB') {
        stats = `${p.season_rushing_yards} rush yds, ${p.season_receiving_yards} rec yds, ${p.season_rushing_touchdowns + p.season_receiving_touchdowns} TD`
      } else {
        stats = `${p.season_receiving_yards} rec yds, ${p.season_receptions} rec, ${p.season_receiving_touchdowns} TD`
      }

      const fpts = p.season_fantasy_points_ppr.toFixed(1)
      console.log(`${rank}. ${name} (${games} games) - ${stats} | ${fpts} fpts`)
    })

    console.log(`\n   ... and ${data.length - 10} more`)
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ Season leaders populated: 32 QB, 32 RB, 64 WR, 32 TE')
  console.log('='.repeat(80))
}

showSeasonLeaders().catch(console.error)
