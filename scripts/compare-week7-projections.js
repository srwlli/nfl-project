/**
 * Compare Week 7 Projections vs Actual Results
 *
 * Runs V5 performance floors for a Week 7 game using only Weeks 1-6 data,
 * then compares projections against actual Week 7 outcomes.
 */

import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function compareWeek7Projections() {
  const gameId = 'espn-401772941'; // PIT @ CIN
  const week = 7;
  const season = 2025;

  console.log('\n='.repeat(80));
  console.log('Week 7 Projection vs Actual Comparison');
  console.log('Game: PIT @ CIN');
  console.log('='.repeat(80));

  // Get actual player stats from Week 7
  const { data: actualStats } = await supabase
    .from('player_game_stats')
    .select(`
      player_id,
      team_id,
      passing_yards,
      rushing_yards,
      receiving_yards,
      fantasy_points_ppr,
      players!inner(full_name, primary_position)
    `)
    .eq('game_id', gameId)
    .eq('season', season);

  // Filter to skill positions with significant fantasy points
  const topPerformers = actualStats
    .filter(s => ['QB', 'RB', 'WR', 'TE'].includes(s.players?.primary_position))
    .filter(s => (s.fantasy_points_ppr || 0) >= 8) // 8+ points
    .sort((a, b) => (b.fantasy_points_ppr || 0) - (a.fantasy_points_ppr || 0));

  console.log(`\nFound ${topPerformers.length} players with 8+ fantasy points\n`);

  // For each top performer, get their projection using historical data
  for (const player of topPerformers.slice(0, 15)) { // Top 15
    const { player_id, team_id, players } = player;
    const { full_name, primary_position } = players;

    // Get player's historical stats BEFORE Week 7
    const { data: historicalStats } = await supabase
      .from('player_game_stats')
      .select('*')
      .eq('player_id', player_id)
      .eq('season', season);

    if (!historicalStats || historicalStats.length === 0) continue;

    // Filter to weeks 1-6 only
    const gameIds = historicalStats.map(s => s.game_id);
    const { data: gameWeeks } = await supabase
      .from('games')
      .select('game_id, week, status')
      .in('game_id', gameIds)
      .eq('season', season)
      .lt('week', week)
      .eq('status', 'final');

    const weekMap = new Map((gameWeeks || []).map(g => [g.game_id, g]));
    const priorGames = historicalStats
      .filter(s => weekMap.has(s.game_id))
      .sort((a, b) => weekMap.get(b.game_id).week - weekMap.get(a.game_id).week);

    if (priorGames.length < 2) continue; // Need at least 2 games

    // Calculate simple projection (season average)
    const seasonFantasy = priorGames
      .map(g => g.fantasy_points_ppr)
      .filter(v => v !== null && !isNaN(v));

    const seasonAvg = seasonFantasy.reduce((a, b) => a + b, 0) / seasonFantasy.length;
    const seasonStdDev = Math.sqrt(
      seasonFantasy.reduce((sum, val) => sum + Math.pow(val - seasonAvg, 2), 0) / seasonFantasy.length
    );

    // Simple floor/ceiling (expected ± 1 stddev)
    const projected = seasonAvg;
    const floor = seasonAvg - seasonStdDev;
    const ceiling = seasonAvg + seasonStdDev;

    // Actual performance
    const actual = player.fantasy_points_ppr;

    // Calculate error and hit
    const error = Math.abs(actual - projected);
    const withinRange = actual >= floor && actual <= ceiling;
    const hitStatus = withinRange ? '✅ HIT' : actual < floor ? '❌ BELOW' : '⚠️ ABOVE';

    console.log(`${full_name} (${primary_position}) - ${team_id}`);
    console.log(`  PROJECTED: ${floor.toFixed(1)} ← ${projected.toFixed(1)} → ${ceiling.toFixed(1)}`);
    console.log(`  ACTUAL:    ${actual.toFixed(1)} pts  ${hitStatus}`);
    console.log(`  ERROR:     ${error.toFixed(1)} pts (${priorGames.length} games sample)`);

    // Show key stats
    if (player.passing_yards) console.log(`  Passing: ${player.passing_yards} yards`);
    if (player.rushing_yards) console.log(`  Rushing: ${player.rushing_yards} yards`);
    if (player.receiving_yards) console.log(`  Receiving: ${player.receiving_yards} yards`);

    console.log();
  }
}

compareWeek7Projections().catch(console.error);
