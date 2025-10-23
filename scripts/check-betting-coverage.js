import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function checkBettingCoverage() {
  // Get all 2025 games
  const { data: games } = await supabase
    .from('games')
    .select('game_id, week, game_date, home_team_id, away_team_id, status')
    .eq('season', 2025)
    .order('week');

  // Group by week
  const weekMap = new Map();
  for (const game of games) {
    if (!weekMap.has(game.week)) weekMap.set(game.week, []);
    weekMap.get(game.week).push(game);
  }

  console.log('Betting Coverage by Week (2025 Season):');
  console.log('='.repeat(60));

  for (const [week, weekGames] of [...weekMap.entries()].sort((a,b) => a[0] - b[0])) {
    // Generate betting IDs for this week
    const gameIds = weekGames.map(g => {
      const dateStr = g.game_date.replace(/-/g, '');
      return `${dateStr}-${g.away_team_id}@${g.home_team_id}`;
    });

    const { count } = await supabase
      .from('game_betting_lines')
      .select('*', { count: 'exact', head: true })
      .in('game_id', gameIds)
      .eq('season', 2025);

    const finalCount = weekGames.filter(g => g.status === 'final').length;
    const coverage = count || 0;
    const percentage = weekGames.length > 0 ? Math.round((coverage / weekGames.length) * 100) : 0;
    const status = coverage === weekGames.length ? '✅' : coverage > 0 ? '⚠️' : '❌';

    console.log(`  Week ${week.toString().padStart(2)}: ${status} ${coverage}/${weekGames.length} games (${percentage}%) - ${finalCount} final`);
  }

  console.log('='.repeat(60));

  // Total summary
  const allGameIds = games.map(g => {
    const dateStr = g.game_date.replace(/-/g, '');
    return `${dateStr}-${g.away_team_id}@${g.home_team_id}`;
  });

  const { count: totalCoverage } = await supabase
    .from('game_betting_lines')
    .select('*', { count: 'exact', head: true })
    .in('game_id', allGameIds)
    .eq('season', 2025);

  console.log(`\nTotal Coverage: ${totalCoverage}/${games.length} games (${Math.round((totalCoverage/games.length)*100)}%)`);
  console.log(`Final Games: ${games.filter(g => g.status === 'final').length}`);
}

checkBettingCoverage().catch(console.error).finally(() => process.exit(0));
