import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function debugAllData() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('PERFORMANCE FLOORS - ALL DATA SOURCES');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. GAMES DATA
  console.log('1️⃣  GAMES TABLE (Week 7, 2025 Season)');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data: week7Games } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, status, stadium_id')
    .eq('season', 2025)
    .eq('week', 7)
    .order('game_id');

  console.log(`Total Week 7 games: ${week7Games?.length || 0}\n`);
  for (const game of week7Games || []) {
    console.log(`  ${game.home_team_id} vs ${game.away_team_id} (${game.status})`);
    console.log(`    game_id: ${game.game_id}, stadium_id: ${game.stadium_id}`);
  }

  // 2. COMPLETED GAMES BEFORE WEEK 7
  console.log('\n\n2️⃣  COMPLETED GAMES (Weeks 1-6, status=final)');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data: completedGames } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, home_team_score, away_team_score')
    .eq('season', 2025)
    .lt('week', 7)
    .eq('status', 'final')
    .order('week', { ascending: true });

  console.log(`Total completed games before Week 7: ${completedGames?.length || 0}\n`);

  const gamesByWeek = {};
  for (const game of completedGames || []) {
    if (!gamesByWeek[game.week]) gamesByWeek[game.week] = [];
    gamesByWeek[game.week].push(game);
  }

  for (const [week, games] of Object.entries(gamesByWeek)) {
    console.log(`  Week ${week}: ${games.length} games`);
    for (const game of games) {
      console.log(`    ${game.away_team_id} @ ${game.home_team_id}: ${game.away_team_score}-${game.home_team_score} (${game.game_id})`);
    }
  }

  // 3. TEAM_GAME_STATS DATA
  console.log('\n\n3️⃣  TEAM_GAME_STATS TABLE (Defensive Data)');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data: allTeamStats } = await supabase
    .from('team_game_stats')
    .select('game_id, team_id, total_yards_allowed, turnovers, penalties')
    .eq('season', 2025)
    .order('team_id');

  console.log(`Total team_game_stats records: ${allTeamStats?.length || 0}\n`);

  if (allTeamStats && allTeamStats.length > 0) {
    const statsByTeam = {};
    for (const stat of allTeamStats) {
      if (!statsByTeam[stat.team_id]) statsByTeam[stat.team_id] = [];
      statsByTeam[stat.team_id].push(stat);
    }

    for (const [teamId, stats] of Object.entries(statsByTeam)) {
      const avgYardsAllowed = stats.reduce((sum, s) => sum + (s.total_yards_allowed || 0), 0) / stats.length;
      console.log(`  ${teamId}: ${stats.length} games, avg ${avgYardsAllowed.toFixed(1)} yards allowed`);
      for (const stat of stats) {
        console.log(`    game ${stat.game_id}: ${stat.total_yards_allowed || 0} yards allowed`);
      }
    }
  } else {
    console.log('  ⚠️  NO TEAM_GAME_STATS DATA FOUND!');
  }

  // 4. PLAYER_GAME_STATS DATA
  console.log('\n\n4️⃣  PLAYER_GAME_STATS TABLE (Player Performance)');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data: playerStats } = await supabase
    .from('player_game_stats')
    .select('player_id, game_id, position, passing_yards, rushing_yards, receiving_yards, receptions, fantasy_points_ppr')
    .eq('season', 2025)
    .order('game_id');

  console.log(`Total player_game_stats records: ${playerStats?.length || 0}\n`);

  if (playerStats && playerStats.length > 0) {
    const statsByGame = {};
    for (const stat of playerStats) {
      if (!statsByGame[stat.game_id]) statsByGame[stat.game_id] = [];
      statsByGame[stat.game_id].push(stat);
    }

    console.log(`Games with player stats: ${Object.keys(statsByGame).length}\n`);

    for (const [gameId, stats] of Object.entries(statsByGame).slice(0, 3)) {
      console.log(`  Game ${gameId}: ${stats.length} player records`);

      const qbs = stats.filter(s => s.position === 'QB').slice(0, 2);
      const rbs = stats.filter(s => s.position === 'RB').slice(0, 2);
      const wrs = stats.filter(s => s.position === 'WR').slice(0, 2);

      if (qbs.length > 0) {
        console.log('    QBs:');
        for (const qb of qbs) {
          console.log(`      ${qb.player_id}: ${qb.passing_yards || 0} pass yds, ${qb.fantasy_points_ppr || 0} pts`);
        }
      }
      if (rbs.length > 0) {
        console.log('    RBs:');
        for (const rb of rbs) {
          console.log(`      ${rb.player_id}: ${rb.rushing_yards || 0} rush yds, ${rb.fantasy_points_ppr || 0} pts`);
        }
      }
      if (wrs.length > 0) {
        console.log('    WRs:');
        for (const wr of wrs) {
          console.log(`      ${wr.player_id}: ${wr.receiving_yards || 0} rec yds, ${wr.receptions || 0} rec, ${wr.fantasy_points_ppr || 0} pts`);
        }
      }
    }

    console.log('\n  (Showing first 3 games only...)');
  } else {
    console.log('  ⚠️  NO PLAYER_GAME_STATS DATA FOUND!');
  }

  // 5. PLAYERS DATA
  console.log('\n\n5️⃣  PLAYERS TABLE');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data: players } = await supabase
    .from('players')
    .select('player_id, full_name, primary_position, current_team_id')
    .in('current_team_id', ['HOU', 'SEA', 'TB', 'DET'])
    .order('current_team_id', { ascending: true });

  console.log(`Total players for HOU/SEA/TB/DET: ${players?.length || 0}\n`);

  if (players && players.length > 0) {
    const playersByTeam = {};
    for (const player of players) {
      if (!playersByTeam[player.current_team_id]) playersByTeam[player.current_team_id] = [];
      playersByTeam[player.current_team_id].push(player);
    }

    for (const [teamId, teamPlayers] of Object.entries(playersByTeam)) {
      const byPos = {};
      for (const p of teamPlayers) {
        if (!byPos[p.primary_position]) byPos[p.primary_position] = [];
        byPos[p.primary_position].push(p);
      }

      console.log(`  ${teamId}: ${teamPlayers.length} players`);
      console.log(`    QBs: ${byPos['QB']?.length || 0}, RBs: ${byPos['RB']?.length || 0}, WRs: ${byPos['WR']?.length || 0}, TEs: ${byPos['TE']?.length || 0}`);

      if (byPos['QB']) {
        console.log(`      QBs: ${byPos['QB'].map(p => p.full_name).join(', ')}`);
      }
    }
  } else {
    console.log('  ⚠️  NO PLAYER DATA FOUND!');
  }

  // 6. STADIUMS DATA
  console.log('\n\n6️⃣  STADIUMS TABLE (Environment Modifiers)');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data: stadiums } = await supabase
    .from('stadiums')
    .select('stadium_id, stadium_name, surface_type, roof_type')
    .order('stadium_name');

  console.log(`Total stadiums: ${stadiums?.length || 0}\n`);

  if (stadiums && stadiums.length > 0) {
    for (const stadium of stadiums.slice(0, 10)) {
      console.log(`  ${stadium.stadium_name}`);
      console.log(`    ID: ${stadium.stadium_id}, Surface: ${stadium.surface_type || 'unknown'}, Roof: ${stadium.roof_type || 'unknown'}`);
    }
    console.log('\n  (Showing first 10 stadiums only...)');
  } else {
    console.log('  ⚠️  NO STADIUM DATA FOUND!');
  }

  // 7. GAME_WEATHER DATA
  console.log('\n\n7️⃣  GAME_WEATHER TABLE');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data: weather } = await supabase
    .from('game_weather')
    .select('game_id, temperature, wind_speed, conditions')
    .eq('season', 2025)
    .order('game_id');

  console.log(`Total game_weather records: ${weather?.length || 0}\n`);

  if (weather && weather.length > 0) {
    for (const w of weather) {
      console.log(`  Game ${w.game_id}:`);
      console.log(`    Temp: ${w.temperature || 'unknown'}°F, Wind: ${w.wind_speed || 'unknown'}mph, Conditions: ${w.conditions || 'unknown'}`);
    }
  } else {
    console.log('  ⚠️  NO WEATHER DATA FOUND!');
  }

  // 8. PLAYER_INJURY_STATUS DATA
  console.log('\n\n8️⃣  PLAYER_INJURY_STATUS TABLE');
  console.log('─────────────────────────────────────────────────────────────\n');

  const { data: injuries } = await supabase
    .from('player_injury_status')
    .select('player_id, season, week, injury_status, injury_type')
    .eq('season', 2025)
    .eq('week', 7)
    .order('player_id');

  console.log(`Total injury records for Week 7: ${injuries?.length || 0}\n`);

  if (injuries && injuries.length > 0) {
    for (const inj of injuries) {
      console.log(`  ${inj.player_id}: ${inj.injury_status.toUpperCase()} - ${inj.injury_type || 'unknown'}`);
    }
  } else {
    console.log('  ⚠️  NO INJURY DATA FOR WEEK 7!');
  }

  // 9. OPPONENT FACTOR CALCULATIONS
  console.log('\n\n9️⃣  OPPONENT FACTOR CALCULATIONS (For Week 7 Games)');
  console.log('─────────────────────────────────────────────────────────────\n');

  // Calculate for each Week 7 team
  const teams = ['HOU', 'SEA', 'TB', 'DET'];

  for (const teamId of teams) {
    console.log(`\n${teamId} DEFENSE:`);

    // Get team's defensive stats
    const { data: teamDefStats } = await supabase
      .from('team_game_stats')
      .select('game_id, total_yards_allowed')
      .eq('team_id', teamId)
      .eq('season', 2025);

    if (!teamDefStats || teamDefStats.length === 0) {
      console.log(`  ⚠️  NO DEFENSIVE DATA`);
      continue;
    }

    // Filter to completed games before Week 7
    const gameIds = teamDefStats.map(g => g.game_id);
    const { data: gameWeeks } = await supabase
      .from('games')
      .select('game_id, week')
      .in('game_id', gameIds)
      .eq('season', 2025)
      .lt('week', 7)
      .eq('status', 'final');

    const validGameIds = new Set(gameWeeks?.map(g => g.game_id) || []);
    const filteredGames = teamDefStats.filter(g => validGameIds.has(g.game_id));

    if (filteredGames.length === 0) {
      console.log(`  ⚠️  NO COMPLETED GAMES WITH DEFENSIVE STATS`);
      continue;
    }

    const teamAvg = filteredGames.reduce((sum, g) => sum + (g.total_yards_allowed || 0), 0) / filteredGames.length;

    console.log(`  Games with data: ${filteredGames.length}`);
    console.log(`  Yards allowed per game:`);
    for (const game of filteredGames) {
      const week = gameWeeks.find(g => g.game_id === game.game_id)?.week;
      console.log(`    Week ${week} (${game.game_id}): ${game.total_yards_allowed} yards`);
    }
    console.log(`  Average: ${teamAvg.toFixed(1)} yards/game`);
  }

  // League average
  console.log('\n\nLEAGUE AVERAGE:');
  const { data: allDefStats } = await supabase
    .from('team_game_stats')
    .select('game_id, total_yards_allowed')
    .eq('season', 2025);

  const { data: allGameWeeks } = await supabase
    .from('games')
    .select('game_id, week')
    .eq('season', 2025)
    .lt('week', 7)
    .eq('status', 'final');

  const validAllGameIds = new Set(allGameWeeks?.map(g => g.game_id) || []);
  const filteredAllGames = allDefStats?.filter(g => validAllGameIds.has(g.game_id)) || [];

  if (filteredAllGames.length > 0) {
    const leagueAvg = filteredAllGames.reduce((sum, g) => sum + (g.total_yards_allowed || 0), 0) / filteredAllGames.length;
    console.log(`  Total team-game records: ${filteredAllGames.length}`);
    console.log(`  League average yards allowed: ${leagueAvg.toFixed(1)} yards/game`);

    console.log('\n\nOPPONENT FACTORS (opponent_avg / league_avg):');
    for (const teamId of teams) {
      const { data: teamDefStats } = await supabase
        .from('team_game_stats')
        .select('game_id, total_yards_allowed')
        .eq('team_id', teamId)
        .eq('season', 2025);

      const gameIds = teamDefStats?.map(g => g.game_id) || [];
      const { data: gameWeeks } = await supabase
        .from('games')
        .select('game_id, week')
        .in('game_id', gameIds)
        .eq('season', 2025)
        .lt('week', 7)
        .eq('status', 'final');

      const validGameIds = new Set(gameWeeks?.map(g => g.game_id) || []);
      const filteredGames = teamDefStats?.filter(g => validGameIds.has(g.game_id)) || [];

      if (filteredGames.length > 0) {
        const teamAvg = filteredGames.reduce((sum, g) => sum + (g.total_yards_allowed || 0), 0) / filteredGames.length;
        const rawFactor = teamAvg / leagueAvg;
        const cappedFactor = Math.min(1.3, Math.max(0.7, rawFactor));

        console.log(`  ${teamId}: ${teamAvg.toFixed(1)} / ${leagueAvg.toFixed(1)} = ${rawFactor.toFixed(3)} → ${cappedFactor.toFixed(2)} (${filteredGames.length} games)`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('DATA DUMP COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

debugAllData();
