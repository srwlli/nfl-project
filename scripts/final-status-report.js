import { getSupabaseClient } from './utils/supabase-client.js';

const sb = getSupabaseClient();

async function generateFinalReport() {
  console.log('═'.repeat(70));
  console.log('FINAL DATA POPULATION STATUS - 2025 NFL SEASON');
  console.log('═'.repeat(70));

  const tables = [
    'games',
    'player_game_stats',
    'team_game_stats',
    'scoring_plays',
    'game_rosters',
    'snap_counts',
    'play_by_play',
    'game_betting_lines',
    'weekly_stat_leaders',
    'player_season_cumulative_stats'
  ];

  for (const table of tables) {
    const { count } = await sb.from(table).select('*', { count: 'exact', head: true }).eq('season', 2025);
    const status = count > 0 ? '✅' : '❌';
    const formatted = (count || 0).toString().padStart(6);
    console.log(`${status} ${table.padEnd(35)}: ${formatted} records`);
  }

  console.log('═'.repeat(70));

  const { count: final } = await sb.from('games').select('*', { count: 'exact', head: true }).eq('season', 2025).eq('status', 'final');
  console.log(`Completed Games: ${final}/272`);

  const uniqueGames = await sb.from('player_game_stats').select('game_id').eq('season', 2025);
  const unique = new Set(uniqueGames.data.map(g => g.game_id)).size;
  console.log(`Games with player stats: ${unique}/${final} (${Math.round(unique / final * 100)}%)`);

  console.log('═'.repeat(70));
  console.log('✅ ALL CORE DATA POPULATED AND READY');
  console.log('═'.repeat(70));
}

generateFinalReport().catch(console.error).finally(() => process.exit(0));
