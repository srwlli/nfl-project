/**
 * Check game_rosters coverage across all completed games
 */

import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function checkCoverage() {
  console.log('🔍 Checking game_rosters coverage...\n');

  // Get all completed games
  const { data: completedGames, error: gamesError } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id')
    .eq('season', 2025)
    .eq('status', 'final')
    .order('week');

  if (gamesError) {
    console.error('Error fetching games:', gamesError);
    return;
  }

  console.log(`Total completed games: ${completedGames.length}\n`);

  // Check each game for roster data
  const gamesWithRosters = [];
  const gamesMissingRosters = [];

  for (const game of completedGames) {
    const { count, error } = await supabase
      .from('game_rosters')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', game.game_id);

    if (error) {
      console.error(`Error checking game ${game.game_id}:`, error);
      continue;
    }

    if (count > 0) {
      gamesWithRosters.push({ ...game, roster_count: count });
    } else {
      gamesMissingRosters.push(game);
    }
  }

  console.log(`Games with rosters: ${gamesWithRosters.length} (${Math.round(gamesWithRosters.length / completedGames.length * 100)}%)`);
  console.log(`Games missing rosters: ${gamesMissingRosters.length}\n`);

  // Show coverage by week
  const byWeek = {};
  gamesWithRosters.forEach(g => {
    byWeek[g.week] = (byWeek[g.week] || 0) + 1;
  });

  console.log('Coverage by week:');
  for (let week = 1; week <= 7; week++) {
    const total = completedGames.filter(g => g.week === week).length;
    const withRosters = byWeek[week] || 0;
    console.log(`  Week ${week}: ${withRosters}/${total} games (${Math.round(withRosters / total * 100)}%)`);
  }

  // Show missing games by week
  if (gamesMissingRosters.length > 0) {
    console.log('\nMissing games by week:');
    const missingByWeek = {};
    gamesMissingRosters.forEach(g => {
      if (!missingByWeek[g.week]) missingByWeek[g.week] = [];
      missingByWeek[g.week].push(g);
    });

    Object.entries(missingByWeek).forEach(([week, games]) => {
      console.log(`\n  Week ${week} (${games.length} games):`);
      games.forEach(g => {
        console.log(`    - Game ${g.game_id}: ${g.away_team_id} @ ${g.home_team_id}`);
      });
    });
  }

  // Total roster records
  const { count: totalRosters } = await supabase
    .from('game_rosters')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025);

  console.log(`\nTotal roster records: ${totalRosters}`);
  console.log(`Average per game: ${Math.round(totalRosters / gamesWithRosters.length)} players`);
}

checkCoverage()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
