import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

(async () => {
  // First get the Eagles Week 3 game
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, game_date')
    .eq('season', 2025)
    .eq('week', 3)
    .or('home_team_id.eq.PHI,away_team_id.eq.PHI')
    .single();

  if (gamesError) {
    console.log('Error finding game:', gamesError.message);
    return;
  }

  console.log('Week 3 Game Found:');
  console.log('Game ID:', games.game_id);
  console.log('Matchup:', games.home_team_id, 'vs', games.away_team_id);
  console.log('Date:', games.game_date);
  console.log('\n' + '='.repeat(80));
  console.log('PHILADELPHIA EAGLES - WEEK 3 GAME DAY ROSTER (53-MAN)');
  console.log('='.repeat(80));

  // Get the game day roster
  const { data: roster, error: rosterError } = await supabase
    .from('game_rosters')
    .select('player_id, position, jersey_number, active, status')
    .eq('game_id', games.game_id)
    .eq('team_id', 'PHI')
    .order('position')
    .order('jersey_number');

  if (rosterError) {
    console.log('Error fetching roster:', rosterError.message);
    return;
  }

  console.log('\nTotal Roster Size:', roster.length, 'players');
  console.log('Active:', roster.filter(p => p.active).length);
  console.log('Inactive:', roster.filter(p => !p.active).length);

  // Get player names
  const playerIds = roster.map(p => p.player_id);
  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('player_id, full_name')
    .in('player_id', playerIds);

  if (playersError) {
    console.log('Error fetching player names:', playersError.message);
    return;
  }

  // Create lookup map
  const playerMap = {};
  players.forEach(p => {
    playerMap[p.player_id] = p.full_name;
  });

  // Group by position
  const positions = {};
  roster.forEach(p => {
    if (!positions[p.position]) {
      positions[p.position] = [];
    }
    positions[p.position].push({
      name: playerMap[p.player_id] || p.player_id,
      jersey: p.jersey_number,
      active: p.active,
      status: p.status
    });
  });

  // Print roster by position
  const positionOrder = ['QB', 'RB', 'FB', 'WR', 'TE', 'OL', 'C', 'G', 'T', 'DL', 'DE', 'DT', 'LB', 'CB', 'S', 'DB', 'K', 'P', 'LS'];

  positionOrder.forEach(pos => {
    if (positions[pos]) {
      console.log('\n' + pos + ' (' + positions[pos].length + ' players):');
      console.log('-'.repeat(80));
      positions[pos].forEach(p => {
        const statusIcon = p.active ? '✅' : '❌';
        const statusText = p.active ? 'ACTIVE' : 'INACTIVE';
        console.log(`  ${statusIcon} #${p.jersey} ${p.name.padEnd(30)} ${statusText}`);
      });
    }
  });

  // Print any positions not in the standard order
  Object.keys(positions).forEach(pos => {
    if (!positionOrder.includes(pos)) {
      console.log('\n' + pos + ' (' + positions[pos].length + ' players):');
      console.log('-'.repeat(80));
      positions[pos].forEach(p => {
        const statusIcon = p.active ? '✅' : '❌';
        const statusText = p.active ? 'ACTIVE' : 'INACTIVE';
        console.log(`  ${statusIcon} #${p.jersey} ${p.name.padEnd(30)} ${statusText}`);
      });
    }
  });

  console.log('\n' + '='.repeat(80));
})();
