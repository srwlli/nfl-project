/**
 * Check which weeks have snap count data
 */

import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function checkWeeks() {
  console.log('📊 Snap Counts Coverage by Week\n');

  // Get total count first
  const { count: totalCount } = await supabase
    .from('snap_counts')
    .select('*', { count: 'exact', head: true });

  console.log(`Total records in database: ${totalCount}\n`);

  // Fetch all data with pagination (Supabase has 1000 row limit)
  let allData = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('snap_counts')
      .select('week, game_id')
      .order('week')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Error:', error);
      return;
    }

    if (data && data.length > 0) {
      allData = allData.concat(data);
      page++;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  console.log(`Fetched ${allData.length} records\n`);

  const weekData = {};
  const gamesByWeek = {};

  allData.forEach(row => {
    if (!weekData[row.week]) {
      weekData[row.week] = 0;
      gamesByWeek[row.week] = new Set();
    }
    weekData[row.week]++;
    gamesByWeek[row.week].add(row.game_id);
  });

  console.log('Week | Records | Games');
  console.log('-----|---------|------');

  Object.keys(weekData).sort((a, b) => a - b).forEach(week => {
    const records = weekData[week];
    const games = gamesByWeek[week].size;
    console.log(`  ${week.padStart(2)}  | ${records.toString().padStart(7)} | ${games.toString().padStart(5)}`);
  });

  const totalRecords = Object.values(weekData).reduce((a, b) => a + b, 0);
  const totalGames = Object.values(gamesByWeek).reduce((sum, set) => sum + set.size, 0);

  console.log('-----|---------|------');
  console.log(`Total | ${totalRecords.toString().padStart(7)} | ${totalGames.toString().padStart(5)}`);
  console.log('');
}

checkWeeks().catch(console.error);
