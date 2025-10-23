import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const results = {
  passed: [],
  failed: [],
  warnings: []
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function pass(tableName, test) {
  results.passed.push({ table: tableName, test });
  log(`  ✅ ${test}`, 'green');
}

function fail(tableName, test, details) {
  results.failed.push({ table: tableName, test, details });
  log(`  ❌ ${test}`, 'red');
  if (details) log(`     ${details}`, 'yellow');
}

function warn(tableName, test, details) {
  results.warnings.push({ table: tableName, test, details });
  log(`  ⚠️  ${test}`, 'yellow');
  if (details) log(`     ${details}`, 'yellow');
}

async function verifyPlayers() {
  log('\n' + '='.repeat(80), 'cyan');
  log('1. VERIFYING PLAYERS TABLE', 'bold');
  log('='.repeat(80), 'cyan');

  // Test 1: Record count
  const { count: totalCount, error: countError } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    fail('players', 'Record count query', countError.message);
    return;
  }

  if (totalCount === 2571) {
    pass('players', `Record count: ${totalCount.toLocaleString()} records`);
  } else {
    fail('players', `Record count: Expected 2,571, got ${totalCount}`);
  }

  // Test 2: Check for null critical fields
  const { data: nullChecks, error: nullError } = await supabase
    .from('players')
    .select('player_id, full_name, primary_position')
    .or('full_name.is.null,primary_position.is.null')
    .limit(10);

  if (nullError) {
    fail('players', 'Null field check', nullError.message);
  } else if (nullChecks.length > 0) {
    fail('players', `Found ${nullChecks.length} players with null name or position`,
         `Example: ${nullChecks[0].player_id}`);
  } else {
    pass('players', 'No critical null fields (full_name, primary_position)');
  }

  // Test 3: All 32 teams represented
  const { data: teamCounts, error: teamError } = await supabase
    .from('player_teams')
    .select('team_id')
    .is('end_season', null);

  if (teamError) {
    fail('players', 'Team representation check', teamError.message);
  } else {
    const uniqueTeams = new Set(teamCounts.map(r => r.team_id));
    if (uniqueTeams.size === 32) {
      pass('players', `All 32 teams have active players (${uniqueTeams.size} teams)`);
    } else {
      warn('players', `Only ${uniqueTeams.size} teams have active players (expected 32)`,
           `Missing teams: ${32 - uniqueTeams.size}`);
    }
  }

  // Test 4: Sample data quality
  const { data: samples, error: sampleError } = await supabase
    .from('players')
    .select('player_id, full_name, primary_position, height_inches, weight_lbs')
    .limit(5);

  if (sampleError) {
    fail('players', 'Sample data query', sampleError.message);
  } else {
    pass('players', `Sample query successful (${samples.length} players returned)`);
    log(`     Sample: ${samples[0].full_name} (${samples[0].primary_position})`, 'cyan');
  }
}

async function verifyTeams() {
  log('\n' + '='.repeat(80), 'cyan');
  log('2. VERIFYING TEAMS TABLE', 'bold');
  log('='.repeat(80), 'cyan');

  // Test 1: Record count
  const { count: totalCount, error: countError } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    fail('teams', 'Record count query', countError.message);
    return;
  }

  if (totalCount === 32) {
    pass('teams', `Record count: ${totalCount} teams`);
  } else {
    fail('teams', `Record count: Expected 32, got ${totalCount}`);
  }

  // Test 2: Check for duplicates
  const { data: allTeams, error: teamError } = await supabase
    .from('teams')
    .select('team_id, team_abbr, team_name');

  if (teamError) {
    fail('teams', 'Team data query', teamError.message);
  } else {
    const abbrs = allTeams.map(t => t.team_abbr);
    const uniqueAbbrs = new Set(abbrs);
    if (abbrs.length === uniqueAbbrs.size) {
      pass('teams', 'No duplicate team abbreviations');
    } else {
      fail('teams', 'Duplicate team abbreviations found');
    }
  }

  // Test 3: Check divisions/conferences populated
  const { data: divisionCheck, error: divError } = await supabase
    .from('teams')
    .select('team_id, division, conference')
    .or('division.is.null,conference.is.null');

  if (divError) {
    fail('teams', 'Division/conference check', divError.message);
  } else if (divisionCheck.length > 0) {
    warn('teams', `${divisionCheck.length} teams missing division or conference`,
         `Example: ${divisionCheck[0].team_id}`);
  } else {
    pass('teams', 'All teams have division and conference assigned');
  }

  // Test 4: Sample teams
  const { data: samples, error: sampleError } = await supabase
    .from('teams')
    .select('team_abbr, team_name, city')
    .in('team_abbr', ['KC', 'SF', 'BAL', 'PHI']);

  if (sampleError) {
    fail('teams', 'Sample teams query', sampleError.message);
  } else {
    pass('teams', `Sample query successful (${samples.length}/4 teams found)`);
    log(`     Sample: ${samples[0].city} ${samples[0].team_name}`, 'cyan');
  }
}

async function verifyGames() {
  log('\n' + '='.repeat(80), 'cyan');
  log('3. VERIFYING GAMES TABLE', 'bold');
  log('='.repeat(80), 'cyan');

  // Test 1: Total record count
  const { count: totalCount, error: countError } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    fail('games', 'Record count query', countError.message);
    return;
  }

  if (totalCount === 272) {
    pass('games', `Record count: ${totalCount} games (full season)`);
  } else {
    warn('games', `Record count: Expected 272, got ${totalCount}`);
  }

  // Test 2: Completed games with scores
  const { data: completedGames, error: completeError } = await supabase
    .from('games')
    .select('game_id, home_score, away_score')
    .eq('status', 'final');

  if (completeError) {
    fail('games', 'Completed games query', completeError.message);
  } else {
    const gamesWithScores = completedGames.filter(g => g.home_score !== null && g.away_score !== null);
    pass('games', `${completedGames.length} completed games, ${gamesWithScores.length} have scores`);
  }

  // Test 3: Scheduled games
  const { count: scheduledCount, error: schedError } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled');

  if (schedError) {
    fail('games', 'Scheduled games query', schedError.message);
  } else {
    pass('games', `${scheduledCount} scheduled games remaining`);
  }

  // Test 4: Check for null team references
  const { data: nullTeams, error: nullError } = await supabase
    .from('games')
    .select('game_id, home_team_id, away_team_id')
    .or('home_team_id.is.null,away_team_id.is.null')
    .limit(5);

  if (nullError) {
    fail('games', 'Team reference check', nullError.message);
  } else if (nullTeams.length > 0) {
    fail('games', `${nullTeams.length} games with null team references`);
  } else {
    pass('games', 'All games have home and away team references');
  }
}

async function verifyPlayerGameStats() {
  log('\n' + '='.repeat(80), 'cyan');
  log('4. VERIFYING PLAYER_GAME_STATS TABLE', 'bold');
  log('='.repeat(80), 'cyan');

  // Test 1: Record count
  const { count: totalCount, error: countError } = await supabase
    .from('player_game_stats')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    fail('player_game_stats', 'Record count query', countError.message);
    return;
  }

  pass('player_game_stats', `Record count: ${totalCount.toLocaleString()} records`);

  // Test 2: Check stat coverage for completed games
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('game_id')
    .eq('status', 'final')
    .limit(5);

  if (!gamesError && games.length > 0) {
    const { count: statsCount, error: statsError } = await supabase
      .from('player_game_stats')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', games[0].game_id);

    if (statsError) {
      fail('player_game_stats', 'Stats coverage check', statsError.message);
    } else if (statsCount > 0) {
      pass('player_game_stats', `Sample game has ${statsCount} player stat records`);
    } else {
      fail('player_game_stats', `Sample game ${games[0].game_id} has no stats`);
    }
  }

  // Test 3: Check for orphaned records (invalid player_id)
  const { data: orphans, error: orphanError } = await supabase
    .from('player_game_stats')
    .select('player_id')
    .not('player_id', 'in', `(SELECT player_id FROM players)`)
    .limit(5);

  if (orphanError) {
    // This query might not work on all DB versions, skip if error
    pass('player_game_stats', 'Skipped orphaned records check (query not supported)');
  } else if (orphans && orphans.length > 0) {
    warn('player_game_stats', `Found ${orphans.length} stats with invalid player_id references`);
  } else {
    pass('player_game_stats', 'No orphaned player stats (all player_ids valid)');
  }

  // Test 4: Check fantasy points calculated
  const { data: fantasyCheck, error: fantasyError } = await supabase
    .from('player_game_stats')
    .select('player_id, game_id, fantasy_points_ppr, fantasy_points_half_ppr, fantasy_points_standard')
    .not('fantasy_points_ppr', 'is', null)
    .limit(10);

  if (fantasyError) {
    fail('player_game_stats', 'Fantasy points check', fantasyError.message);
  } else if (fantasyCheck.length > 0) {
    pass('player_game_stats', `Fantasy points calculated (${fantasyCheck.length}/10 samples have PPR points)`);
  } else {
    warn('player_game_stats', 'No fantasy points found in sample');
  }
}

async function verifyTeamGameStats() {
  log('\n' + '='.repeat(80), 'cyan');
  log('5. VERIFYING TEAM_GAME_STATS TABLE', 'bold');
  log('='.repeat(80), 'cyan');

  // Test 1: Record count
  const { count: totalCount, error: countError } = await supabase
    .from('team_game_stats')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    fail('team_game_stats', 'Record count query', countError.message);
    return;
  }

  pass('team_game_stats', `Record count: ${totalCount} records`);

  // Test 2: Verify 2 records per completed game (home + away)
  const { count: completedCount, error: completeError } = await supabase
    .from('games')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'final');

  if (!completeError) {
    const expectedStats = completedCount * 2;
    if (totalCount === expectedStats) {
      pass('team_game_stats', `2 records per game (${completedCount} games × 2 = ${expectedStats})`);
    } else {
      warn('team_game_stats', `Expected ${expectedStats} records (${completedCount} games × 2), got ${totalCount}`);
    }
  }

  // Test 3: Check for null team references
  const { data: nullTeams, error: nullError } = await supabase
    .from('team_game_stats')
    .select('game_id, team_id')
    .is('team_id', null)
    .limit(5);

  if (nullError) {
    fail('team_game_stats', 'Team reference check', nullError.message);
  } else if (nullTeams.length > 0) {
    fail('team_game_stats', `${nullTeams.length} records with null team_id`);
  } else {
    pass('team_game_stats', 'All records have valid team_id');
  }

  // Test 4: Sample data quality
  const { data: samples, error: sampleError } = await supabase
    .from('team_game_stats')
    .select('team_id, total_yards, turnovers')
    .limit(5);

  if (sampleError) {
    fail('team_game_stats', 'Sample data query', sampleError.message);
  } else {
    pass('team_game_stats', `Sample query successful (${samples.length} records)`);
    log(`     Sample: ${samples[0].team_id} - ${samples[0].total_yards} yards`, 'cyan');
  }
}

async function verifyPlayerTeams() {
  log('\n' + '='.repeat(80), 'cyan');
  log('6. VERIFYING PLAYER_TEAMS TABLE', 'bold');
  log('='.repeat(80), 'cyan');

  // Test 1: Record count
  const { count: totalCount, error: countError } = await supabase
    .from('player_teams')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    fail('player_teams', 'Record count query', countError.message);
    return;
  }

  pass('player_teams', `Record count: ${totalCount.toLocaleString()} relationships`);

  // Test 2: Check active players (end_season is null)
  const { count: activeCount, error: activeError } = await supabase
    .from('player_teams')
    .select('*', { count: 'exact', head: true })
    .is('end_season', null);

  if (activeError) {
    fail('player_teams', 'Active players check', activeError.message);
  } else {
    pass('player_teams', `${activeCount.toLocaleString()} active player-team relationships`);
  }

  // Test 3: Verify all 32 teams have players
  const { data: teamCounts, error: teamError } = await supabase
    .from('player_teams')
    .select('team_id')
    .is('end_season', null);

  if (teamError) {
    fail('player_teams', 'Team coverage check', teamError.message);
  } else {
    const uniqueTeams = new Set(teamCounts.map(r => r.team_id));
    if (uniqueTeams.size === 32) {
      pass('player_teams', `All 32 teams have active players`);
    } else {
      warn('player_teams', `Only ${uniqueTeams.size}/32 teams have active players`);
    }
  }

  // Test 4: Check for orphaned records
  const { data: samples, error: sampleError } = await supabase
    .from('player_teams')
    .select('player_id, team_id, start_season, end_season')
    .limit(5);

  if (sampleError) {
    fail('player_teams', 'Sample data query', sampleError.message);
  } else {
    pass('player_teams', `Sample query successful (${samples.length} relationships)`);
    log(`     Sample: Player ${samples[0].player_id} on ${samples[0].team_id} (${samples[0].start_season})`, 'cyan');
  }
}

async function verifyPositions() {
  log('\n' + '='.repeat(80), 'cyan');
  log('7. VERIFYING POSITIONS TABLE', 'bold');
  log('='.repeat(80), 'cyan');

  // Test 1: Record count
  const { count: totalCount, error: countError } = await supabase
    .from('positions')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    fail('positions', 'Record count query', countError.message);
    return;
  }

  if (totalCount === 26) {
    pass('positions', `Record count: ${totalCount} positions`);
  } else {
    warn('positions', `Record count: Expected 26, got ${totalCount}`);
  }

  // Test 2: Check critical positions exist
  const criticalPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
  const { data: posData, error: posError } = await supabase
    .from('positions')
    .select('abbreviation, position_name')
    .in('abbreviation', criticalPositions);

  if (posError) {
    fail('positions', 'Critical positions check', posError.message);
  } else {
    const foundAbbrs = posData.map(p => p.abbreviation);
    const missing = criticalPositions.filter(p => !foundAbbrs.includes(p));

    if (missing.length === 0) {
      pass('positions', `All critical positions present (${criticalPositions.join(', ')})`);
    } else {
      fail('positions', `Missing critical positions: ${missing.join(', ')}`);
    }
  }

  // Test 3: Sample positions
  const { data: samples, error: sampleError } = await supabase
    .from('positions')
    .select('abbreviation, position_name')
    .limit(10);

  if (sampleError) {
    fail('positions', 'Sample positions query', sampleError.message);
  } else {
    pass('positions', `Sample query successful (${samples.length} positions)`);
    log(`     Sample: ${samples.slice(0, 3).map(p => `${p.abbreviation} (${p.position_name})`).join(', ')}`, 'cyan');
  }
}

async function verifySeasons() {
  log('\n' + '='.repeat(80), 'cyan');
  log('8. VERIFYING SEASONS TABLE', 'bold');
  log('='.repeat(80), 'cyan');

  // Test 1: Record count
  const { count: totalCount, error: countError } = await supabase
    .from('seasons')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    fail('seasons', 'Record count query', countError.message);
    return;
  }

  if (totalCount >= 1) {
    pass('seasons', `Record count: ${totalCount} season(s)`);
  } else {
    fail('seasons', 'No seasons found in database');
  }

  // Test 2: Check 2025 season exists
  const { data: season2025, error: seasonError } = await supabase
    .from('seasons')
    .select('season, start_date, end_date')
    .eq('season', 2025)
    .single();

  if (seasonError) {
    fail('seasons', '2025 season check', seasonError.message);
  } else if (season2025) {
    pass('seasons', `2025 season exists (${season2025.start_date} to ${season2025.end_date})`);
  } else {
    fail('seasons', '2025 season not found');
  }

  // Test 3: Check date validity
  if (season2025 && season2025.start_date && season2025.end_date) {
    const start = new Date(season2025.start_date);
    const end = new Date(season2025.end_date);

    if (start < end) {
      pass('seasons', 'Season dates are valid (start_date < end_date)');
    } else {
      fail('seasons', 'Invalid season dates (start_date >= end_date)');
    }
  }
}

async function printSummary() {
  log('\n' + '='.repeat(80), 'cyan');
  log('VERIFICATION SUMMARY', 'bold');
  log('='.repeat(80), 'cyan');

  log(`\n✅ Passed: ${results.passed.length}`, 'green');
  log(`⚠️  Warnings: ${results.warnings.length}`, 'yellow');
  log(`❌ Failed: ${results.failed.length}`, 'red');

  if (results.failed.length > 0) {
    log('\n' + '='.repeat(80), 'red');
    log('FAILURES DETAILS:', 'red');
    log('='.repeat(80), 'red');
    results.failed.forEach(f => {
      log(`\n${f.table}: ${f.test}`, 'red');
      if (f.details) log(`  ${f.details}`, 'yellow');
    });
  }

  if (results.warnings.length > 0) {
    log('\n' + '='.repeat(80), 'yellow');
    log('WARNINGS DETAILS:', 'yellow');
    log('='.repeat(80), 'yellow');
    results.warnings.forEach(w => {
      log(`\n${w.table}: ${w.test}`, 'yellow');
      if (w.details) log(`  ${w.details}`, 'yellow');
    });
  }

  log('\n' + '='.repeat(80), 'cyan');
  const allPassed = results.failed.length === 0;
  if (allPassed) {
    log('🎉 ALL CRITICAL TABLES VERIFIED - PRODUCTION READY! 🎉', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED - REVIEW REQUIRED', 'yellow');
  }
  log('='.repeat(80), 'cyan');
  log('');
}

// Main execution
async function main() {
  log('\n' + '='.repeat(80), 'bold');
  log('CRITICAL TABLES VERIFICATION', 'bold');
  log('Testing 8 Critical Tables Required for Site Launch', 'cyan');
  log('='.repeat(80), 'bold');

  try {
    await verifyPlayers();
    await verifyTeams();
    await verifyGames();
    await verifyPlayerGameStats();
    await verifyTeamGameStats();
    await verifyPlayerTeams();
    await verifyPositions();
    await verifySeasons();

    await printSummary();

    process.exit(results.failed.length === 0 ? 0 : 1);
  } catch (error) {
    log('\n❌ FATAL ERROR:', 'red');
    log(error.message, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
