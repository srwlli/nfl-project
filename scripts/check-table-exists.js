import { getSupabaseClient } from './utils/supabase-client.js';

(async () => {
  const supabase = getSupabaseClient();

  // Try to query player_season_stats table
  const { data, error } = await supabase
    .from('player_season_stats')
    .select('*', { count: 'exact', head: true });

  if (error) {
    if (error.code === '42P01') {
      console.log('❌ player_season_stats table does NOT exist');
      console.log('✅ This is correct - it was replaced by player_season_cumulative_stats');
    } else {
      console.log('Error:', error);
    }
  } else {
    console.log(`⚠️  player_season_stats table EXISTS with ${data?.length || 0} records`);
    console.log('This table should be dropped since it was replaced.');
  }

  process.exit(0);
})();
