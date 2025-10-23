/**
 * Analyze snap counts data structure
 */

import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function analyze() {
  console.log('📊 Snap Counts Data Analysis\n');

  // Total records
  const { count: totalRecords } = await supabase
    .from('snap_counts')
    .select('*', { count: 'exact', head: true });

  console.log(`Total records: ${totalRecords.toLocaleString()}`);
  console.log('(Each record = one player in one game)\n');

  // Unique players
  const { data: allPlayers } = await supabase
    .from('snap_counts')
    .select('player_name')
    .limit(20000);

  const uniquePlayers = new Set(allPlayers.map(p => p.player_name));
  console.log(`Unique players: ${uniquePlayers.size.toLocaleString()}`);
  console.log('(Total different players who appeared in any game)\n');

  // Average players per game
  const { data: games } = await supabase
    .from('snap_counts')
    .select('game_id')
    .limit(20000);

  const uniqueGames = new Set(games.map(g => g.game_id));
  const avgPlayersPerGame = Math.round(totalRecords / uniqueGames.size);

  console.log(`Unique games: ${uniqueGames.size}`);
  console.log(`Average players per game: ${avgPlayersPerGame}`);
  console.log('(About 45-50 per team = 90-100 total)\n');

  // Players with any snaps
  const { count: playersWithSnaps } = await supabase
    .from('snap_counts')
    .select('*', { count: 'exact', head: true })
    .or('offense_snaps.gt.0,defense_snaps.gt.0,st_snaps.gt.0');

  console.log(`Records with ANY snaps: ${playersWithSnaps.toLocaleString()}`);

  // Players with zero snaps (inactive)
  const { count: inactive } = await supabase
    .from('snap_counts')
    .select('*', { count: 'exact', head: true })
    .eq('offense_snaps', 0)
    .eq('defense_snaps', 0)
    .eq('st_snaps', 0);

  console.log(`Records with ZERO snaps: ${inactive}`);
  console.log('(Inactive/healthy scratch but on game-day roster)\n');

  console.log('─'.repeat(50));
  console.log('EXAMPLE: If player X played in 5 games:');
  console.log('  - Database has 5 records for player X');
  console.log('  - Each shows their snaps for that specific game');
  console.log('  - Total records = players × games they appeared in');
  console.log('─'.repeat(50));
}

analyze().catch(console.error);
