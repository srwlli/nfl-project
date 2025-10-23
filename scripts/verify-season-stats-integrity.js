/**
 * Verify player_season_cumulative_stats data integrity
 * Ensures all players with season stats also have corresponding game stats
 */

import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function verifyIntegrity() {
  console.log('🔍 Verifying player_season_cumulative_stats integrity...\n');

  // Get ALL season stats (paginated)
  let allSeasonStats = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('player_season_cumulative_stats')
      .select('player_id')
      .eq('season', 2025)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching season stats:', error);
      break;
    }

    if (!data || data.length === 0) break;

    allSeasonStats = allSeasonStats.concat(data);
    offset += limit;

    if (data.length < limit) break;
  }

  console.log(`Total players with season stats: ${allSeasonStats.length}\n`);

  // Get ALL game stats (paginated)
  let allGameStats = [];
  offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from('player_game_stats')
      .select('player_id')
      .eq('season', 2025)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching game stats:', error);
      break;
    }

    if (!data || data.length === 0) break;

    allGameStats = allGameStats.concat(data);
    offset += limit;

    if (data.length < limit) break;
  }

  const playersWithSeasonStats = new Set(allSeasonStats.map(p => p.player_id));
  const playersWithGameStats = new Set(allGameStats.map(p => p.player_id));

  console.log(`Total game stat records: ${allGameStats.length}`);
  console.log(`Unique players with game stats: ${playersWithGameStats.size}\n`);

  // Find players with season stats but NO game stats
  const orphanedPlayers = [...playersWithSeasonStats].filter(p => !playersWithGameStats.has(p));

  console.log('═══════════════════════════════════════════════════════════');
  console.log('DATA INTEGRITY CHECK');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Players with season stats: ${playersWithSeasonStats.size}`);
  console.log(`Players with game stats: ${playersWithGameStats.size}`);
  console.log(`Players with season stats but NO game stats: ${orphanedPlayers.length}`);

  if (orphanedPlayers.length > 0) {
    console.log('\n⚠️  DATA INTEGRITY ISSUE DETECTED!');
    console.log('These players have season stats but no game stats.');
    console.log('This should not happen - season stats are aggregated from game stats.\n');

    // Sample some orphaned players
    console.log('Sample orphaned players (first 10):');
    for (let i = 0; i < Math.min(10, orphanedPlayers.length); i++) {
      const { data: player } = await supabase
        .from('players')
        .select('full_name, primary_position')
        .eq('player_id', orphanedPlayers[i])
        .single();

      console.log(`  ${orphanedPlayers[i]}: ${player?.full_name || 'Unknown'} (${player?.primary_position || 'N/A'})`);
    }

    console.log('\n💡 RECOMMENDATION:');
    console.log('Run: DELETE FROM player_season_cumulative_stats WHERE season = 2025;');
    console.log('Then: node scripts/aggregators/weekly-aggregation.js');
  } else {
    console.log('\n✅ DATA INTEGRITY OK');
    console.log('All players with season stats also have game stats.');
  }

  // Reverse check
  const playersNeedingAggregation = [...playersWithGameStats].filter(p => !playersWithSeasonStats.has(p));

  console.log(`\nPlayers with game stats but NO season stats: ${playersNeedingAggregation.length}`);

  if (playersNeedingAggregation.length > 0) {
    console.log('⚠️  These players played but are missing from season stats.');
    console.log('Run: node scripts/aggregators/weekly-aggregation.js');
  } else {
    console.log('✅ All players who played have season stats.');
  }

  console.log('═══════════════════════════════════════════════════════════');
}

verifyIntegrity()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
