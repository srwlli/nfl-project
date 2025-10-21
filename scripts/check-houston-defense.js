import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkHoustonDefense() {
  // Get Houston's defensive stats for Week 1-6
  const { data: houGames } = await supabase
    .from('team_game_stats')
    .select('game_id, total_yards_allowed')
    .eq('team_id', 'HOU')
    .eq('season', 2025);

  console.log('Houston defensive games:', houGames);

  if (!houGames || houGames.length === 0) {
    console.log('\n⚠️  NO HOUSTON DEFENSIVE DATA FOUND!');
    return;
  }

  // Get week info for those games
  const gameIds = houGames.map(g => g.game_id);
  const { data: gameWeeks } = await supabase
    .from('games')
    .select('game_id, week, status, home_team_id, away_team_id')
    .in('game_id', gameIds)
    .eq('season', 2025)
    .lt('week', 7)
    .eq('status', 'final');

  console.log('\nCompleted Houston games before Week 7:', gameWeeks);

  if (gameWeeks && gameWeeks.length > 0) {
    const validIds = new Set(gameWeeks.map(g => g.game_id));
    const filtered = houGames.filter(g => validIds.has(g.game_id));
    
    const houAvg = filtered.reduce((sum, g) => sum + (g.total_yards_allowed || 0), 0) / filtered.length;
    console.log('\nHouston avg yards allowed:', houAvg);
  } else {
    console.log('\n⚠️  NO COMPLETED GAMES WITH DEFENSIVE STATS');
  }

  // Check league average
  const { data: allStats } = await supabase
    .from('team_game_stats')
    .select('game_id, total_yards_allowed')
    .eq('season', 2025);

  console.log('\nTotal team_game_stats records:', allStats?.length || 0);

  const { data: allGames } = await supabase
    .from('games')
    .select('game_id, week, status')
    .eq('season', 2025)
    .lt('week', 7)
    .eq('status', 'final');

  console.log('Total completed games before Week 7:', allGames?.length || 0);

  if (allGames && allStats) {
    const validIds = new Set(allGames.map(g => g.game_id));
    const filtered = allStats.filter(g => validIds.has(g.game_id));
    const leagueAvg = filtered.reduce((sum, g) => sum + (g.total_yards_allowed || 0), 0) / filtered.length;
    console.log('League avg yards allowed:', leagueAvg);
    
    // Show the calculation
    if (gameWeeks && gameWeeks.length > 0) {
      const validIds2 = new Set(gameWeeks.map(g => g.game_id));
      const filtered2 = houGames.filter(g => validIds2.has(g.game_id));
      const houAvg = filtered2.reduce((sum, g) => sum + (g.total_yards_allowed || 0), 0) / filtered2.length;
      
      const factor = houAvg / leagueAvg;
      const capped = Math.min(1.3, Math.max(0.7, factor));
      
      console.log('\n📊 Opponent Factor Calculation:');
      console.log('HOU avg allowed:', houAvg.toFixed(1));
      console.log('League avg allowed:', leagueAvg.toFixed(1));
      console.log('Raw factor:', factor.toFixed(3));
      console.log('Capped factor:', capped.toFixed(2));
      console.log('\nInterpretation: opponent_avg / league_avg');
      console.log('Lower is BETTER defense (allows fewer yards)');
      console.log('Factor < 1.0 = Tough defense (SEA offense suppressed)');
      console.log('Factor > 1.0 = Easier defense (SEA offense boosted)');
    }
  }
}

checkHoustonDefense();
