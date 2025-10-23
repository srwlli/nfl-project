import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function checkDataStatus() {
  console.log('Data Population Status Check:');
  console.log('='.repeat(60));

  // Check key tables
  const tables = [
    { name: 'games', filter: { season: 2025 } },
    { name: 'player_game_stats', filter: { season: 2025 } },
    { name: 'team_game_stats', filter: { season: 2025 } },
    { name: 'scoring_plays', filter: { season: 2025 } },
    { name: 'game_rosters', filter: { season: 2025 } },
    { name: 'player_injury_status', filter: { season: 2025 } },
    { name: 'snap_counts', filter: { season: 2025 } },
    { name: 'game_betting_lines', filter: { season: 2025 } },
    { name: 'play_by_play', filter: { season: 2025 } },
    { name: 'game_weather', filter: {} },
    { name: 'weekly_stats', filter: { season: 2025 } },
    { name: 'player_season_stats', filter: { season: 2025 } }
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true })
      .match(table.filter);

    const status = count > 0 ? '✅' : '❌';
    const countStr = (count || 0).toString().padStart(6);
    console.log(`${status} ${table.name.padEnd(25)}: ${countStr} records`);
  }

  console.log('='.repeat(60));

  // Check completed games
  const { count: finalGames } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025)
    .eq('status', 'final');

  console.log(`Completed games: ${finalGames}/272`);

  // Check which weeks have complete data
  console.log('\nWeek-by-Week Coverage:');
  for (let week = 1; week <= 8; week++) {
    const { count: weekGames } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('season', 2025)
      .eq('week', week)
      .eq('status', 'final');

    const { count: weekStats } = await supabase
      .from('player_game_stats')
      .select('game_id, season', { count: 'exact', head: true })
      .eq('season', 2025);

    // Get games for this week
    const { data: games } = await supabase
      .from('games')
      .select('game_id')
      .eq('season', 2025)
      .eq('week', week)
      .eq('status', 'final');

    if (games && games.length > 0) {
      const gameIds = games.map(g => g.game_id);
      const { count: statsForWeek } = await supabase
        .from('player_game_stats')
        .select('*', { count: 'exact', head: true })
        .in('game_id', gameIds);

      const coverage = weekGames > 0 ? Math.round((statsForWeek > 0 ? 1 : 0) * 100) : 0;
      const status = statsForWeek > 0 ? '✅' : '❌';
      console.log(`  Week ${week}: ${status} ${weekGames} games, ${statsForWeek || 0} player stats`);
    }
  }
}

checkDataStatus().catch(console.error).finally(() => process.exit(0));
