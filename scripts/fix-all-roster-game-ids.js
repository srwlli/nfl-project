/**
 * Fix all game_id formats in game_rosters table
 * Adds espn- prefix to all game_ids that don't have it
 */

import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function fixAllGameIds() {
  console.log('🔧 Fixing all game_id formats in game_rosters...\n');

  let totalFixed = 0;
  let iteration = 0;

  while (true) {
    iteration++;

    const { data: rosters, error } = await supabase
      .from('game_rosters')
      .select('game_id')
      .not('game_id', 'like', 'espn-%')
      .limit(1000);

    if (error) {
      console.error('Error fetching rosters:', error);
      break;
    }

    if (!rosters || rosters.length === 0) {
      console.log('\n✅ No more records to fix!');
      break;
    }

    const uniqueGameIds = [...new Set(rosters.map(r => r.game_id))];

    console.log(`Iteration ${iteration}: Found ${uniqueGameIds.length} unique game IDs in ${rosters.length} records`);

    for (const oldGameId of uniqueGameIds) {
      const newGameId = 'espn-' + oldGameId;

      const { error: updateError } = await supabase
        .from('game_rosters')
        .update({ game_id: newGameId })
        .eq('game_id', oldGameId);

      if (updateError) {
        console.error(`  Error updating ${oldGameId}:`, updateError);
      } else {
        totalFixed++;
      }
    }

    console.log(`  Fixed: ${totalFixed} game IDs so far\n`);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ All done! Fixed ${totalFixed} unique game IDs`);
  console.log('═══════════════════════════════════════════════════════════');

  // Final verification
  const { count: remaining } = await supabase
    .from('game_rosters')
    .select('*', { count: 'exact', head: true })
    .not('game_id', 'like', 'espn-%');

  console.log(`\nRecords remaining without prefix: ${remaining}`);

  if (remaining === 0) {
    console.log('✅ All game_ids now have espn- prefix!');
  } else {
    console.log('⚠️  Some records still need fixing - run again');
  }
}

fixAllGameIds()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
