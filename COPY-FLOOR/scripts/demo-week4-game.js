import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

// Get a random Week 4 game
const { data: games, error } = await supabase
  .from('games')
  .select('game_id, home_team_id, away_team_id, game_date')
  .eq('season', 2025)
  .eq('week', 4)
  .eq('status', 'final')
  .limit(1);

if (error || !games || games.length === 0) {
  console.error('No completed Week 4 games found');
  process.exit(1);
}

const game = games[0];
const espnId = game.game_id.replace('espn-', '');

console.log('Selected Week 4 game:');
console.log(`  ${game.away_team_id} @ ${game.home_team_id}`);
console.log(`  Game ID: ${espnId}`);
console.log(`  Date: ${game.game_date}`);
console.log('');

process.exit(0);
