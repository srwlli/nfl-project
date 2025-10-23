import { getSupabaseClient } from './utils/supabase-client.js';
import { getBettingContextForGame } from './utils/game-script.js';

const supabase = getSupabaseClient();

async function test() {
  // Check the game details
  const { data: game } = await supabase
    .from('games')
    .select('game_id, game_date, home_team_id, away_team_id')
    .eq('game_id', 'espn-401772941')
    .single();

  console.log('Game details:');
  console.log(JSON.stringify(game, null, 2));

  // Format the betting game ID
  const dateStr = game.game_date.replace(/-/g, '');
  const bettingGameId = `${dateStr}-${game.away_team_id}@${game.home_team_id}`;
  console.log('\nExpected betting ID:', bettingGameId);

  // Check if betting line exists
  const { data: betting } = await supabase
    .from('game_betting_lines')
    .select('*')
    .eq('game_id', bettingGameId)
    .eq('season', 2025);

  console.log('\nBetting line found:', betting?.length || 0);
  if (betting && betting.length > 0) {
    console.log(JSON.stringify(betting[0], null, 2));
  }

  // Test the utility function
  console.log('\n--- Testing getBettingContextForGame() ---');
  const context = await getBettingContextForGame('espn-401772941', 2025);
  console.log(JSON.stringify(context, null, 2));

  process.exit(0);
}

test();
