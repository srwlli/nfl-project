/**
 * Re-scrape missing games to populate game_rosters
 * Uses exec to call game-stats-scraper.js for each missing game
 */

import { getSupabaseClient } from './utils/supabase-client.js';
import { logger } from './utils/logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const supabase = getSupabaseClient();

async function getMissingGames() {
  // Get all completed games
  const { data: completedGames, error: gamesError } = await supabase
    .from('games')
    .select('game_id, week')
    .eq('season', 2025)
    .eq('status', 'final')
    .order('week');

  if (gamesError) {
    throw gamesError;
  }

  // Check which games have rosters
  const gamesMissing = [];

  for (const game of completedGames) {
    const { count } = await supabase
      .from('game_rosters')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', game.game_id);

    if (count === 0) {
      gamesMissing.push(game);
    }
  }

  return gamesMissing;
}

async function main() {
  logger.info('════════════════════════════════════════════════════════════');
  logger.info('RESCRAPE MISSING GAME ROSTERS');
  logger.info('════════════════════════════════════════════════════════════');

  const missingGames = await getMissingGames();

  logger.info(`Found ${missingGames.length} games missing rosters`);

  if (missingGames.length === 0) {
    logger.info('✅ All games have rosters!');
    return;
  }

  // Group by week
  const byWeek = {};
  missingGames.forEach(g => {
    if (!byWeek[g.week]) byWeek[g.week] = [];
    byWeek[g.week].push(g.game_id);
  });

  logger.info('\nMissing by week:');
  Object.entries(byWeek).forEach(([week, games]) => {
    logger.info(`  Week ${week}: ${games.length} games`);
  });

  // Re-scrape each missing game
  logger.info('\n════════════════════════════════════════════════════════════');
  logger.info('Starting re-scrape...\n');

  let success = 0;
  let failed = 0;

  for (const game of missingGames) {
    const espnGameId = game.game_id.replace('espn-', '');

    try {
      logger.info(`Scraping game ${game.game_id} (Week ${game.week})...`);

      const { stdout, stderr } = await execAsync(
        `node scripts/scrapers/game-stats-scraper.js --game=${espnGameId}`,
        { timeout: 30000 }
      );

      success++;
      logger.info(`✅ Success (${success}/${missingGames.length})\n`);
    } catch (error) {
      failed++;
      logger.error(`❌ Failed: ${error.message}\n`);
    }
  }

  logger.info('════════════════════════════════════════════════════════════');
  logger.info('SUMMARY');
  logger.info('════════════════════════════════════════════════════════════');
  logger.info(`Success: ${success}`);
  logger.info(`Failed: ${failed}`);
  logger.info(`Total: ${missingGames.length}`);
  logger.info('════════════════════════════════════════════════════════════');
}

main()
  .catch(error => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
