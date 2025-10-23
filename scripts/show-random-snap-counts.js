/**
 * Show Random Players from Week 4 Snap Counts
 */

import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function showRandomPlayers() {
  const week = process.argv[2] ? parseInt(process.argv[2].replace('--week=', '')) : 4;

  console.log(`🏈 5 Random Players from Week ${week} Snap Counts\n`);

  const { data, error } = await supabase
    .from('snap_counts')
    .select('player_name, position, team_id, opponent_team_id, offense_snaps, offense_pct, defense_snaps, defense_pct, st_snaps, st_pct, game_id')
    .eq('week', week)
    .limit(500);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log(`❌ No Week ${week} data found in snap_counts table`);
    console.log('Currently only Week 1 data is available (nflverse updates weekly)\n');

    // Show what weeks ARE available
    const { data: allWeeks } = await supabase
      .from('snap_counts')
      .select('week')
      .order('week');

    if (allWeeks && allWeeks.length > 0) {
      const uniqueWeeks = [...new Set(allWeeks.map(w => w.week))];
      console.log(`Available weeks: ${uniqueWeeks.join(', ')}`);
    }
    return;
  }

  // Get 5 random players
  const shuffled = data.sort(() => 0.5 - Math.random());
  const random5 = shuffled.slice(0, 5);

  random5.forEach((player, i) => {
    console.log(`${i + 1}. ${player.player_name} (${player.position}) - ${player.team_id} vs ${player.opponent_team_id}`);
    console.log(`   Game: ${player.game_id}`);
    console.log(`   OFF: ${player.offense_snaps} snaps (${(player.offense_pct * 100).toFixed(1)}%)`);
    console.log(`   DEF: ${player.defense_snaps} snaps (${(player.defense_pct * 100).toFixed(1)}%)`);
    console.log(`   ST:  ${player.st_snaps} snaps (${(player.st_pct * 100).toFixed(1)}%)`);
    console.log('');
  });

  console.log(`Total players in Week ${week}: ${data.length}\n`);
}

showRandomPlayers().catch(console.error);
