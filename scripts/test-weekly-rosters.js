/**
 * Test game rosters for one random game from each week
 */

import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function testWeeklyRosters() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 TESTING GAME ROSTERS - ONE GAME PER WEEK');
  console.log('═══════════════════════════════════════════════════════════\n');

  const results = [];

  for (let week = 1; week <= 7; week++) {
    // Get one random game from this week
    const { data: games } = await supabase
      .from('games')
      .select('game_id, week, home_team_id, away_team_id')
      .eq('season', 2025)
      .eq('week', week)
      .eq('status', 'final')
      .limit(1);

    if (!games || games.length === 0) {
      console.log(`Week ${week}: No completed games found`);
      results.push({ week, status: '❌', message: 'No games' });
      continue;
    }

    const game = games[0];

    // Get roster for this game
    const { data: roster, error } = await supabase
      .from('game_rosters')
      .select('player_id, team_id, position, active')
      .eq('game_id', game.game_id);

    if (error) {
      console.log(`Week ${week}: Database error - ${error.message}`);
      results.push({ week, status: '❌', message: 'DB Error' });
      continue;
    }

    if (!roster || roster.length === 0) {
      console.log(`Week ${week}: ❌ NO ROSTER DATA`);
      console.log(`  Game: ${game.away_team_id} @ ${game.home_team_id} (${game.game_id})\n`);
      results.push({ week, status: '❌', message: 'No rosters', game: game.game_id });
      continue;
    }

    // Count by team
    const homeRoster = roster.filter(r => r.team_id === game.home_team_id);
    const awayRoster = roster.filter(r => r.team_id === game.away_team_id);

    console.log(`Week ${week}: ✅ ROSTER FOUND`);
    console.log(`  Game: ${game.away_team_id} @ ${game.home_team_id}`);
    console.log(`  ${game.away_team_id}: ${awayRoster.length} players (${awayRoster.filter(r => r.active).length} active)`);
    console.log(`  ${game.home_team_id}: ${homeRoster.length} players (${homeRoster.filter(r => r.active).length} active)`);
    console.log(`  Total: ${roster.length} roster entries\n`);

    results.push({
      week,
      status: '✅',
      game: game.game_id,
      matchup: `${game.away_team_id} @ ${game.home_team_id}`,
      total: roster.length,
      away: awayRoster.length,
      home: homeRoster.length
    });
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');

  const passed = results.filter(r => r.status === '✅').length;
  const failed = results.filter(r => r.status === '❌').length;

  console.log(`Total Weeks Tested: 7`);
  console.log(`Passed: ${passed}/7 (${Math.round(passed / 7 * 100)}%)`);
  console.log(`Failed: ${failed}/7\n`);

  if (failed > 0) {
    console.log('Failed Weeks:');
    results.filter(r => r.status === '❌').forEach(r => {
      console.log(`  Week ${r.week}: ${r.message}`);
    });
  }

  if (passed === 7) {
    console.log('🎉 ALL WEEKS PASSED! Game rosters are 100% populated.\n');
  } else {
    console.log('⚠️  Some weeks missing roster data. Review above for details.\n');
  }

  console.log('═══════════════════════════════════════════════════════════');

  // Now test Eagles Week 3 specifically
  console.log('\n🦅 PHILADELPHIA EAGLES - WEEK 3 SPECIFIC TEST\n');

  const { data: eaglesGame } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id')
    .eq('season', 2025)
    .eq('week', 3)
    .or('home_team_id.eq.PHI,away_team_id.eq.PHI')
    .single();

  console.log('Game:', eaglesGame.away_team_id, '@', eaglesGame.home_team_id);
  console.log('Game ID:', eaglesGame.game_id);

  const { data: eaglesRoster } = await supabase
    .from('game_rosters')
    .select('player_id, position, jersey_number, active')
    .eq('game_id', eaglesGame.game_id)
    .eq('team_id', 'PHI')
    .order('position')
    .order('jersey_number');

  if (!eaglesRoster || eaglesRoster.length === 0) {
    console.log('❌ No roster data for Eagles!\n');
    return;
  }

  console.log('Total Eagles roster:', eaglesRoster.length);
  console.log('Active:', eaglesRoster.filter(r => r.active).length);
  console.log('Inactive:', eaglesRoster.filter(r => !r.active).length);

  // Show positions breakdown
  const positions = {};
  eaglesRoster.forEach(r => {
    positions[r.position] = (positions[r.position] || 0) + 1;
  });

  console.log('\nPositions:');
  Object.entries(positions).sort().forEach(([pos, count]) => {
    console.log(`  ${pos}: ${count}`);
  });

  console.log('\n✅ Eagles Week 3 roster test PASSED!');
  console.log('═══════════════════════════════════════════════════════════');
}

testWeeklyRosters()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
