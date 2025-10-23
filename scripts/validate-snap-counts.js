/**
 * Validate Snap Counts Coverage
 * Checks that snap count data was imported correctly
 */

import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function validateSnapCounts() {
  console.log('🔍 Validating Snap Count Coverage\n');

  // Total records
  const { count: totalCount } = await supabase
    .from('snap_counts')
    .select('*', { count: 'exact', head: true });

  console.log(`Total snap count records: ${totalCount}\n`);

  // Records by week
  const { data: weekData } = await supabase
    .from('snap_counts')
    .select('week')
    .order('week');

  const weekCounts = {};
  weekData.forEach(row => {
    weekCounts[row.week] = (weekCounts[row.week] || 0) + 1;
  });

  console.log('Records by week:');
  Object.keys(weekCounts).sort((a, b) => a - b).forEach(week => {
    console.log(`  Week ${week}: ${weekCounts[week]} snap count records`);
  });

  // Sample snap counts for Week 7
  console.log('\n📊 Sample Snap Counts (Week 7 - Top 10 by offense snaps):\n');

  const { data: sampleData } = await supabase
    .from('snap_counts')
    .select('player_name, position, team_id, offense_snaps, offense_pct, defense_snaps, st_snaps')
    .eq('week', 7)
    .order('offense_snaps', { ascending: false })
    .limit(10);

  sampleData.forEach(player => {
    console.log(`${player.player_name.padEnd(25)} (${player.position.padEnd(3)}) - ${player.team_id}`);
    console.log(`  OFF: ${player.offense_snaps} snaps (${(player.offense_pct * 100).toFixed(1)}%) | DEF: ${player.defense_snaps} | ST: ${player.st_snaps}`);
  });

  // Players with 0 snaps (inactive but on roster)
  const { count: inactiveCount } = await supabase
    .from('snap_counts')
    .select('*', { count: 'exact', head: true })
    .eq('offense_snaps', 0)
    .eq('defense_snaps', 0)
    .eq('st_snaps', 0);

  console.log(`\n📋 Players with 0 total snaps (inactive/healthy scratch): ${inactiveCount}`);

  // Check for specific game coverage
  console.log('\n🎯 Game Coverage Sample (Week 7):');

  const { data: gameData } = await supabase
    .from('snap_counts')
    .select('game_id')
    .eq('week', 7)
    .order('game_id');

  const uniqueGames = [...new Set(gameData.map(g => g.game_id))];
  console.log(`  Unique games with snap counts: ${uniqueGames.length}`);
  uniqueGames.slice(0, 3).forEach(gameId => {
    console.log(`    ${gameId}`);
  });

  console.log('\n✅ Snap count validation complete!\n');
}

validateSnapCounts().catch(console.error);
