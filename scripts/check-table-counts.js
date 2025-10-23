import { getSupabaseClient } from './utils/supabase-client.js';
const supabase = getSupabaseClient();

const tables = [
  'betting_lines', 'coaches', 'conferences', 'divisions', 'game_drives',
  'game_officials', 'game_rosters', 'games', 'game_weather', 'play_by_play',
  'player_game_stats', 'player_injuries', 'player_news', 'players',
  'player_season_stats', 'player_teams', 'positions', 'roster_transactions',
  'scoring_plays', 'seasons', 'stadiums', 'stat_categories', 'team_aliases',
  'team_game_stats', 'team_news', 'teams', 'team_season_stats', 'weekly_stats'
];

(async () => {
  const results = [];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        results.push({ table, count: 'ERROR', status: error.message });
      } else {
        results.push({ table, count, status: count > 0 ? 'HAS DATA' : 'EMPTY' });
      }
    } catch (err) {
      results.push({ table, count: 'ERROR', status: err.message });
    }
  }

  // Print table
  console.log('\n' + '='.repeat(80));
  console.log('TABLE DATA STATUS');
  console.log('='.repeat(80));
  console.log(sprintf('%-30s | %-12s | %s', 'TABLE NAME', 'RECORD COUNT', 'STATUS'));
  console.log('-'.repeat(80));

  results.forEach(r => {
    const countStr = r.count === 'ERROR' ? 'ERROR' : (r.count === null ? '0' : r.count.toLocaleString());
    console.log(sprintf('%-30s | %-12s | %s', r.table, countStr, r.status));
  });

  console.log('='.repeat(80));

  const hasData = results.filter(r => r.count > 0).length;
  const empty = results.filter(r => r.count === 0).length;
  const errors = results.filter(r => r.count === 'ERROR').length;

  console.log(`\nSummary: ${hasData} with data | ${empty} empty | ${errors} errors`);
  console.log('='.repeat(80) + '\n');
})();

function sprintf(format, ...args) {
  let i = 0;
  return format.replace(/%-?(\d+)s/g, (match, width) => {
    const arg = String(args[i++] || '');
    const w = parseInt(width);
    const leftAlign = match.startsWith('%-');
    if (leftAlign) {
      return arg.padEnd(w);
    } else {
      return arg.padStart(w);
    }
  });
}
