import { getSupabaseClient } from './utils/supabase-client.js';

(async () => {
  const supabase = getSupabaseClient();

  // Query PostgreSQL information_schema to get all tables
  const { data: tables, error } = await supabase.rpc('get_table_list');

  if (error) {
    console.log('Using fallback method...');

    // List of known tables from migrations
    const tableNames = [
      'teams', 'team_aliases', 'players', 'player_teams', 'games', 'stadiums',
      'team_game_stats', 'player_game_stats', 'team_season_stats', 'player_season_cumulative_stats',
      'scoring_plays', 'play_by_play', 'game_drives', 'game_rosters',
      'roster_transactions', 'player_injury_status', 'game_weather',
      'game_betting_lines', 'spread_lines', 'moneyline_odds', 'over_under_lines', 'betting_results',
      'snap_counts', 'player_news', 'team_news',
      'conferences', 'divisions', 'positions',
      'weekly_leaders', 'season_leaders', 'hot_players'
    ];

    console.log('\n📊 DATABASE TABLES:\n');
    console.log('='.repeat(80));

    for (const tableName of tableNames) {
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        const formatted = count?.toLocaleString() || '0';
        const status = count > 0 ? '✅' : '⚠️';
        console.log(`${status} ${tableName.padEnd(30)} ${formatted.padStart(10)} records`);
      }
    }

    console.log('='.repeat(80));
  }

  process.exit(0);
})();
