import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function verify() {
  const { data, count } = await supabase
    .from('snap_counts')
    .select('week, game_id', { count: 'exact' })
    .eq('week', 4);

  console.log(`Week 4 records: ${count}`);

  if (data && data.length > 0) {
    console.log('Sample game_ids:');
    data.slice(0, 5).forEach(d => console.log(`  ${d.game_id}`));
  }
}

verify();
