import { getSupabaseClient } from './utils/supabase-client.js';

(async () => {
  const supabase = getSupabaseClient();

  console.log('Dropping obsolete player_season_stats table...\n');

  // Check if table has data
  const { count, error: countError } = await supabase
    .from('player_season_stats')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.log('❌ Error checking table:', countError);
    process.exit(1);
  }

  console.log(`Table contains ${count} records`);

  if (count > 0) {
    console.log('⚠️  Table contains data - manual review required');
    process.exit(1);
  }

  console.log('✅ Table is empty - safe to drop\n');

  // Drop the table using raw SQL via RPC
  const { error: dropError } = await supabase.rpc('exec_sql', {
    sql: 'DROP TABLE IF EXISTS player_season_stats CASCADE;'
  });

  if (dropError) {
    // Supabase may not have exec_sql RPC, try alternative approach
    console.log('RPC method not available, checking alternative...');
    console.log('\nTo drop the table, run this SQL command in Supabase SQL Editor:');
    console.log('─'.repeat(80));
    console.log('DROP TABLE IF EXISTS player_season_stats CASCADE;');
    console.log('─'.repeat(80));
    console.log('\nOr use: npx supabase db execute --file supabase/migrations/20250101000024_drop_obsolete_player_season_stats.sql');
  } else {
    console.log('✅ Table dropped successfully');
  }

  process.exit(0);
})();
