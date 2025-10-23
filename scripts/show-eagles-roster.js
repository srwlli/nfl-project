import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

(async () => {
  console.log('='.repeat(80));
  console.log('PHILADELPHIA EAGLES - 2025 ROSTER');
  console.log('='.repeat(80));

  // Get Eagles roster
  const { data: roster, error } = await supabase
    .from('player_teams')
    .select(`
      player_id,
      players (
        full_name,
        primary_position,
        jersey_number,
        height_inches,
        weight_lbs,
        college
      )
    `)
    .eq('team_id', 'PHI')
    .is('end_season', null)
    .order('players(primary_position)');

  if (error) {
    console.log('Error:', error.message);
    return;
  }

  console.log(`\nTotal Players: ${roster.length}\n`);

  // Group by position
  const positions = {};
  roster.forEach(r => {
    const pos = r.players.primary_position;
    if (!positions[pos]) {
      positions[pos] = [];
    }
    positions[pos].push(r.players);
  });

  // Display by position
  const posOrder = ['QB', 'RB', 'FB', 'WR', 'TE', 'C', 'G', 'T', 'OL', 'DE', 'DT', 'DL', 'LB', 'CB', 'S', 'DB', 'K', 'P', 'LS'];

  posOrder.forEach(pos => {
    if (positions[pos]) {
      console.log(`${pos} (${positions[pos].length} players):`);
      console.log('-'.repeat(80));
      positions[pos].forEach(p => {
        const height = p.height_inches ? `${Math.floor(p.height_inches / 12)}'${p.height_inches % 12}"` : 'N/A';
        const weight = p.weight_lbs ? `${p.weight_lbs} lbs` : 'N/A';
        const college = p.college || 'N/A';
        console.log(`  #${p.jersey_number || 'N/A'} ${p.full_name.padEnd(25)} ${height.padEnd(6)} ${weight.padEnd(8)} ${college}`);
      });
      console.log('');
    }
  });

  // Show any other positions
  Object.keys(positions).forEach(pos => {
    if (!posOrder.includes(pos)) {
      console.log(`${pos} (${positions[pos].length} players):`);
      console.log('-'.repeat(80));
      positions[pos].forEach(p => {
        const height = p.height_inches ? `${Math.floor(p.height_inches / 12)}'${p.height_inches % 12}"` : 'N/A';
        const weight = p.weight_lbs ? `${p.weight_lbs} lbs` : 'N/A';
        const college = p.college || 'N/A';
        console.log(`  #${p.jersey_number || 'N/A'} ${p.full_name.padEnd(25)} ${height.padEnd(6)} ${weight.padEnd(8)} ${college}`);
      });
      console.log('');
    }
  });

  console.log('='.repeat(80));
})();
