import { getSupabaseClient } from './utils/supabase-client.js';
import { fetchGameSummary } from './utils/espn-api.js';

const gameId = '401772938'; // SEA @ ARI Week 4
const dbGameId = `espn-${gameId}`;

const supabase = getSupabaseClient();

console.log('═'.repeat(80));
console.log('WEEK 4 GAME DATA: SEA @ ARI (September 26, 2025)');
console.log('═'.repeat(80));
console.log('');

// Fetch game basic info
const { data: game } = await supabase
  .from('games')
  .select('*')
  .eq('game_id', dbGameId)
  .single();

console.log('📋 GAME BASIC INFO:');
console.log(`  Game ID: ${game.game_id}`);
console.log(`  Date: ${game.game_date} at ${game.game_time}`);
console.log(`  Week: ${game.week}`);
console.log(`  Season: ${game.season}`);
console.log(`  Status: ${game.status}`);
console.log(`  Network: ${game.broadcast_network || 'N/A'}`);
console.log('');

// Fetch team game stats
const { data: teamStats } = await supabase
  .from('team_game_stats')
  .select('*')
  .eq('game_id', dbGameId)
  .order('is_home', { ascending: false });

console.log('📊 TEAM STATISTICS:');
teamStats.forEach(ts => {
  const location = ts.is_home ? 'HOME' : 'AWAY';
  console.log(`\n  ${ts.team_id} (${location}): ${ts.points_scored} points`);
  console.log(`    Total Yards: ${ts.total_yards}`);
  console.log(`    Yards Allowed: ${ts.total_yards_allowed}`);
  console.log(`    Turnovers: ${ts.turnovers}`);
  console.log(`    Turnovers Forced: ${ts.turnovers_forced}`);
  console.log(`    Time of Possession: ${Math.floor(ts.time_of_possession_seconds / 60)}:${(ts.time_of_possession_seconds % 60).toString().padStart(2, '0')}`);
});
console.log('');

// Fetch scoring plays
const { data: scoringPlays } = await supabase
  .from('scoring_plays')
  .select('*')
  .eq('game_id', dbGameId)
  .order('quarter', { ascending: true })
  .order('time_remaining_seconds', { ascending: false });

console.log('🏈 SCORING SUMMARY (' + scoringPlays.length + ' plays):');
let currentQuarter = 0;
scoringPlays.forEach(sp => {
  if (sp.quarter !== currentQuarter) {
    currentQuarter = sp.quarter;
    console.log(`\n  === QUARTER ${sp.quarter} ===`);
  }
  const minutes = Math.floor(sp.time_remaining_seconds / 60);
  const seconds = sp.time_remaining_seconds % 60;
  const time = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  console.log(`  ${time} - ${sp.team_id}: ${sp.scoring_type} (${sp.points} pts)`);
  console.log(`         ${sp.description}`);
});
console.log('');

// Fetch additional data from ESPN for context
const summary = await fetchGameSummary(gameId);

console.log('🏟️  GAME CONTEXT (from ESPN API):');
const competition = summary.header?.competitions?.[0];
console.log(`  Stadium: ${competition?.venue?.fullName || 'N/A'}`);
console.log(`  Location: ${competition?.venue?.address?.city || 'N/A'}, ${competition?.venue?.address?.state || 'N/A'}`);
console.log(`  Attendance: ${competition?.attendance?.toLocaleString() || 'N/A'}`);
console.log('');

// Show team records
const homeTeam = competition?.competitors?.find(c => c.homeAway === 'home');
const awayTeam = competition?.competitors?.find(c => c.homeAway === 'away');

console.log('📈 TEAM RECORDS:');
console.log(`  ${awayTeam?.team?.abbreviation}: ${awayTeam?.records?.[0]?.summary || 'N/A'} (${awayTeam?.records?.[0]?.type || 'overall'})`);
console.log(`  ${homeTeam?.team?.abbreviation}: ${homeTeam?.records?.[0]?.summary || 'N/A'} (${homeTeam?.records?.[0]?.type || 'overall'})`);
console.log('');

// Show final score with quarter breakdown
console.log('📊 FINAL SCORE:');
const homeScore = homeTeam?.score || 0;
const awayScore = awayTeam?.score || 0;
console.log(`  ${awayTeam?.team?.abbreviation}: ${awayScore}`);
console.log(`  ${homeTeam?.team?.abbreviation}: ${homeScore}`);

if (homeTeam?.linescores && awayTeam?.linescores) {
  console.log('');
  console.log('  Quarter-by-Quarter:');
  console.log(`       Q1  Q2  Q3  Q4   FINAL`);
  const awayQuarters = awayTeam.linescores.map(l => (l.value || 0).toString().padStart(2, ' ')).join('  ');
  const homeQuarters = homeTeam.linescores.map(l => (l.value || 0).toString().padStart(2, ' ')).join('  ');
  console.log(`  ${awayTeam.team.abbreviation}:  ${awayQuarters}    ${awayScore}`);
  console.log(`  ${homeTeam.team.abbreviation}:  ${homeQuarters}    ${homeScore}`);
}
console.log('');

console.log('═'.repeat(80));
console.log('TEMPLATE MAPPING VERIFICATION');
console.log('═'.repeat(80));
console.log('');
console.log('✓ Top Meta Info: Week, date, time, network, status');
console.log('✓ Main Scorebug: Team logos, scores, records');
console.log('✓ Quarter-by-quarter breakdown: Available from ESPN');
console.log('✓ Game Info: Venue, attendance');
console.log('✓ Team Statistics: Total yards, turnovers, time of possession');
console.log('✓ Scoring Summary: All scoring plays with descriptions');
console.log('');
console.log('⚠️  NOT YET IMPLEMENTED:');
console.log('   - Season context (standings, playoff status)');
console.log('   - Betting results (spread, O/U)');
console.log('   - Player statistics (passing, rushing, receiving, defense)');
console.log('   - Advanced analytics (EPA, win probability)');
console.log('   - Officials info');
console.log('   - Weather data');
console.log('');

process.exit(0);
