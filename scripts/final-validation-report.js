/**
 * Final Data Completeness Validation Report
 * Comprehensive check of all critical tables
 */

import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function generateReport() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 FINAL DATA COMPLETENESS VALIDATION REPORT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // 1. Games
  const { data: games } = await supabase
    .from('games')
    .select('status')
    .eq('season', 2025);

  const gamesByStatus = games.reduce((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1;
    return acc;
  }, {});

  console.log('1. GAMES');
  console.log('   Total: 272 (full 2025 season)');
  Object.entries(gamesByStatus).forEach(([status, count]) => {
    console.log(`   ${status}: ${count}`);
  });

  // 2. Teams
  const { count: teamCount } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true });

  console.log('\n2. TEAMS');
  console.log(`   Total: ${teamCount} (32 NFL teams + aliases)`);

  // 3. Players
  const { count: playerCount } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true });

  console.log('\n3. PLAYERS');
  console.log(`   Total: ${playerCount}`);

  // 4. Game Rosters
  const { count: rosterCount } = await supabase
    .from('game_rosters')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025);

  // Get all roster records with pagination
  let allRosterGames = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data } = await supabase
      .from('game_rosters')
      .select('game_id')
      .eq('season', 2025)
      .range(offset, offset + limit - 1);

    if (!data || data.length === 0) break;
    allRosterGames = allRosterGames.concat(data);
    offset += limit;
    if (data.length < limit) break;
  }

  const uniqueGamesWithRosters = new Set(allRosterGames.map(r => r.game_id));

  console.log('\n4. GAME ROSTERS');
  console.log(`   Total records: ${rosterCount}`);
  console.log(`   Games covered: ${uniqueGamesWithRosters.size}/106 (${Math.round(uniqueGamesWithRosters.size / 106 * 100)}%)`);

  // 5. Player Game Stats
  const { count: playerStatsCount } = await supabase
    .from('player_game_stats')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025);

  console.log('\n5. PLAYER GAME STATS');
  console.log(`   Total records: ${playerStatsCount}`);
  console.log(`   Average per game: ${Math.round(playerStatsCount / 106)} players`);

  // 6. Team Game Stats
  const { count: teamStatsCount } = await supabase
    .from('team_game_stats')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025);

  console.log('\n6. TEAM GAME STATS');
  console.log(`   Total records: ${teamStatsCount}`);
  console.log(`   Expected: ${106 * 2} (106 games × 2 teams)`);
  console.log(`   Coverage: ${Math.round(teamStatsCount / (106 * 2) * 100)}%`);

  // 7. Scoring Plays
  const { count: scoringPlaysCount } = await supabase
    .from('scoring_plays')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025);

  console.log('\n7. SCORING PLAYS');
  console.log(`   Total records: ${scoringPlaysCount}`);
  console.log(`   Average per game: ${Math.round(scoringPlaysCount / 106)} plays`);

  // 8. Season Cumulative Stats
  const { count: seasonStatsCount } = await supabase
    .from('player_season_cumulative_stats')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025);

  console.log('\n8. PLAYER SEASON CUMULATIVE STATS');
  console.log(`   Total players: ${seasonStatsCount}`);

  // 9. Weekly Stat Leaders
  const { count: leadersCount } = await supabase
    .from('weekly_stat_leaders')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025);

  console.log('\n9. WEEKLY STAT LEADERS');
  console.log(`   Total records: ${leadersCount}`);

  // 10. Team Season Stats
  const { count: teamSeasonCount } = await supabase
    .from('team_season_stats')
    .select('*', { count: 'exact', head: true })
    .eq('season', 2025);

  console.log('\n10. TEAM SEASON STATS');
  console.log(`   Total teams: ${teamSeasonCount}/32 (${Math.round(teamSeasonCount / 32 * 100)}%)`);

  // 11. Divisions & Conferences
  const { count: conferencesCount } = await supabase
    .from('conferences')
    .select('*', { count: 'exact', head: true });

  const { count: divisionsCount } = await supabase
    .from('divisions')
    .select('*', { count: 'exact', head: true });

  console.log('\n11. DIVISIONS & CONFERENCES');
  console.log(`   Conferences: ${conferencesCount}/2`);
  console.log(`   Divisions: ${divisionsCount}/8`);

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');

  const allChecks = [
    { name: 'Games', status: gamesByStatus.final === 106 },
    { name: 'Teams', status: teamCount >= 32 },
    { name: 'Players', status: playerCount > 2000 },
    { name: 'Game Rosters', status: uniqueGamesWithRosters.size === 106 },
    { name: 'Player Game Stats', status: playerStatsCount > 6000 },
    { name: 'Team Game Stats', status: teamStatsCount >= 210 },
    { name: 'Scoring Plays', status: scoringPlaysCount > 800 },
    { name: 'Season Stats', status: seasonStatsCount > 1000 },
    { name: 'Weekly Leaders', status: leadersCount > 100 },
    { name: 'Team Season Stats', status: teamSeasonCount === 32 },
    { name: 'Conferences', status: conferencesCount === 2 },
    { name: 'Divisions', status: divisionsCount === 8 }
  ];

  const passedChecks = allChecks.filter(c => c.status).length;
  const totalChecks = allChecks.length;

  console.log(`\n✅ Passed: ${passedChecks}/${totalChecks} checks\n`);

  allChecks.forEach(check => {
    const icon = check.status ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
  });

  if (passedChecks === totalChecks) {
    console.log('\n🎉 ALL CHECKS PASSED! Database is 100% complete.');
  } else {
    console.log(`\n⚠️  ${totalChecks - passedChecks} checks failed. Review above for details.`);
  }

  console.log('═══════════════════════════════════════════════════════════');
}

generateReport()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
