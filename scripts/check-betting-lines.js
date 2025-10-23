import { getSupabaseClient } from './utils/supabase-client.js';

const supabase = getSupabaseClient();

async function checkBettingLines() {
  console.log('Checking betting lines in database...\n');

  // Check if table exists and has data
  const { data: bettingLines, error } = await supabase
    .from('game_betting_lines')
    .select('game_id, bookmaker, spread_home, over_under_total, created_at')
    .eq('season', 2025)
    .limit(5);

  if (error) {
    console.log('Error:', error.message);
    console.log('\nBetting lines table may not exist or is empty.');
    return;
  }

  console.log(`Found ${bettingLines?.length || 0} betting lines (showing up to 5)\n`);

  if (bettingLines && bettingLines.length > 0) {
    bettingLines.forEach((line, i) => {
      console.log(`${i + 1}. Game: ${line.game_id}`);
      console.log(`   Bookmaker: ${line.bookmaker}`);
      console.log(`   Spread (Home): ${line.spread_home}`);
      console.log(`   Over/Under: ${line.over_under_total}`);
      console.log(`   Date: ${line.created_at}`);
      console.log();
    });

    // Get total count
    const { count } = await supabase
      .from('game_betting_lines')
      .select('*', { count: 'exact', head: true })
      .eq('season', 2025);

    console.log(`Total betting line records for 2025: ${count || 0}`);
  } else {
    console.log('❌ No betting lines found in database');
    console.log('\nTo populate betting lines, run:');
    console.log('  npm run scrape:betting');
    console.log('\nNote: Requires THE_ODDS_API_KEY in .env file');
  }
}

checkBettingLines().catch(console.error);
