import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

(async () => {
  // Get a Week 5 game
  const { data: games } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id')
    .eq('season', 2025)
    .eq('week', 5)
    .limit(1);

  const game = games[0];

  console.log('Week 5 Game:', game.away_team_id, '@', game.home_team_id);
  console.log('Game ID:', game.game_id);
  console.log('\nFetching', game.home_team_id, 'roster for this game...\n');

  // Get roster for this game
  const { data: roster } = await supabase
    .from('game_rosters')
    .select('player_id, position, jersey_number, active')
    .eq('game_id', game.game_id)
    .eq('team_id', game.home_team_id)
    .order('position')
    .order('jersey_number');

  if (!roster || roster.length === 0) {
    console.log('No roster data for this game.');
    return;
  }

  // Get player names
  const playerIds = roster.map(r => r.player_id);
  const { data: players } = await supabase
    .from('players')
    .select('player_id, full_name')
    .in('player_id', playerIds);

  const playerMap = {};
  players.forEach(p => {
    playerMap[p.player_id] = p.full_name;
  });

  // Group by position
  const positions = {};
  roster.forEach(r => {
    if (!positions[r.position]) positions[r.position] = [];
    positions[r.position].push({
      name: playerMap[r.player_id] || r.player_id,
      jersey: r.jersey_number,
      active: r.active
    });
  });

  console.log('='.repeat(80));
  console.log(game.home_team_id.toUpperCase() + ' - WEEK 5 GAME DAY ROSTER (53-MAN)');
  console.log('='.repeat(80));
  console.log('Total:', roster.length, 'players');
  console.log('Active:', roster.filter(r => r.active).length);
  console.log('Inactive:', roster.filter(r => !r.active).length);
  console.log('\n');

  const posOrder = ['QB', 'RB', 'FB', 'WR', 'TE', 'OL', 'C', 'G', 'T', 'OT', 'DL', 'DE', 'DT', 'LB', 'CB', 'S', 'DB', 'K', 'P', 'LS', 'PK'];

  posOrder.forEach(pos => {
    if (positions[pos]) {
      console.log(pos + ' (' + positions[pos].length + ' players):');
      console.log('-'.repeat(80));
      positions[pos].forEach(p => {
        const status = p.active ? '✅ ACTIVE  ' : '❌ INACTIVE';
        console.log('  ' + status + ' #' + (p.jersey || 'N/A') + ' ' + p.name);
      });
      console.log('');
    }
  });

  console.log('='.repeat(80));
})();
