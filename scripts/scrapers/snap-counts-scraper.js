/**
 * Snap Counts Scraper
 *
 * Downloads player snap count data from nflverse
 * Tracks offensive, defensive, and special teams snaps per player per game
 *
 * Data Source: https://github.com/nflverse/nflverse-data/releases/download/snap_counts/snap_counts_2025.csv
 * Schedule: Weekly Tuesday updates (after nflverse processes weekend games)
 *
 * Usage:
 * - npm run scrape:snap-counts
 * - npm run scrape:snap-counts -- --week=7
 */

import https from 'https';
import csv from 'csv-parser';
import { getSupabaseClient } from '../utils/supabase-client.js';
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js';

const SCRIPT_NAME = 'snap-counts-scraper.js';
const SEASON_YEAR = 2025;
const SNAP_COUNTS_URL = `https://github.com/nflverse/nflverse-data/releases/download/snap_counts/snap_counts_${SEASON_YEAR}.csv`;

const supabase = getSupabaseClient();

/**
 * Map nflverse team abbreviations to our team_id format
 */
const TEAM_MAP = {
  'ARI': 'ARI', 'ATL': 'ATL', 'BAL': 'BAL', 'BUF': 'BUF',
  'CAR': 'CAR', 'CHI': 'CHI', 'CIN': 'CIN', 'CLE': 'CLE',
  'DAL': 'DAL', 'DEN': 'DEN', 'DET': 'DET', 'GB': 'GB',
  'HOU': 'HOU', 'IND': 'IND', 'JAX': 'JAX', 'KC': 'KC',
  'LAC': 'LAC', 'LAR': 'LAR', 'LV': 'LV', 'MIA': 'MIA',
  'MIN': 'MIN', 'NE': 'NE', 'NO': 'NO', 'NYG': 'NYG',
  'NYJ': 'NYJ', 'PHI': 'PHI', 'PIT': 'PIT', 'SEA': 'SEA',
  'SF': 'SF', 'TB': 'TB', 'TEN': 'TEN', 'WAS': 'WAS',
  'WSH': 'WAS', // Washington alias
  'LA': 'LAR' // LA Rams alias (nflverse uses 'LA')
};

/**
 * Download and parse CSV from URL
 */
function downloadCSV(url) {
  return new Promise((resolve, reject) => {
    const results = [];

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return https.get(response.headers.location, (redirectResponse) => {
          redirectResponse
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
        }).on('error', reject);
      }

      response
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Transform CSV row to database record
 */
function transformSnapCount(row) {
  return {
    game_id: row.game_id,
    pfr_game_id: row.pfr_game_id,
    season: parseInt(row.season),
    game_type: row.game_type,
    week: parseInt(row.week),
    player_name: row.player,
    pfr_player_id: row.pfr_player_id,
    player_id: null, // Will be mapped later if we have PFR player ID mapping
    position: row.position,
    team_id: TEAM_MAP[row.team] || row.team,
    opponent_team_id: TEAM_MAP[row.opponent] || row.opponent,
    offense_snaps: parseInt(row.offense_snaps) || 0,
    offense_pct: parseFloat(row.offense_pct) || 0,
    defense_snaps: parseInt(row.defense_snaps) || 0,
    defense_pct: parseFloat(row.defense_pct) || 0,
    st_snaps: parseInt(row.st_snaps) || 0,
    st_pct: parseFloat(row.st_pct) || 0
  };
}

/**
 * Scrape snap counts for all games or specific week
 */
async function scrapeSnapCounts(weekFilter = null) {
  try {
    logScriptStart(SCRIPT_NAME);

    logger.info(`Downloading snap counts from nflverse...`);
    logger.info(`URL: ${SNAP_COUNTS_URL}\n`);

    const csvData = await downloadCSV(SNAP_COUNTS_URL);
    logger.info(`✓ Downloaded ${csvData.length} snap count records\n`);

    // Filter by week if specified
    let filteredData = csvData;
    if (weekFilter) {
      filteredData = csvData.filter(row => parseInt(row.week) === weekFilter);
      logger.info(`Filtered to Week ${weekFilter}: ${filteredData.length} records\n`);
    }

    if (filteredData.length === 0) {
      logger.warn('No snap count data found');
      return { success: 0, failed: 0, total: 0 };
    }

    // Transform data
    const snapCounts = filteredData.map(transformSnapCount);

    // Batch insert/upsert
    logger.info(`Upserting ${snapCounts.length} snap count records...`);

    const BATCH_SIZE = 1000;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < snapCounts.length; i += BATCH_SIZE) {
      const batch = snapCounts.slice(i, i + BATCH_SIZE);

      const { data, error } = await supabase
        .from('snap_counts')
        .upsert(batch, {
          onConflict: 'game_id, season, player_name, team_id',
          ignoreDuplicates: false
        });

      if (error) {
        logger.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, error);
        failCount += batch.length;
      } else {
        successCount += batch.length;
        logger.info(`✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(snapCounts.length / BATCH_SIZE)} complete (${successCount}/${snapCounts.length})`);
      }
    }

    logger.info('');
    logger.info('═'.repeat(60));
    logger.info('SNAP COUNTS SCRAPE SUMMARY');
    logger.info('═'.repeat(60));
    logger.info(`✓ Success: ${successCount}`);
    logger.info(`✗ Failed: ${failCount}`);
    logger.info(`Total: ${snapCounts.length}`);
    logger.info('═'.repeat(60));

    logScriptEnd(SCRIPT_NAME);

    return {
      success: successCount,
      failed: failCount,
      total: snapCounts.length
    };

  } catch (error) {
    logger.error('Snap counts scrape failed:', error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const weekArg = args.find(arg => arg.startsWith('--week='));

    const weekFilter = weekArg ? parseInt(weekArg.split('=')[1]) : null;

    if (weekFilter) {
      logger.info(`Mode: Week-specific scrape (Week ${weekFilter})`);
    } else {
      logger.info(`Mode: Full season scrape (all weeks)`);
    }

    const result = await scrapeSnapCounts(weekFilter);

    const duration = Date.now() - startTime;
    logger.info(`\nTotal duration: ${duration}ms`);

    process.exit(result.failed > 0 ? 1 : 0);

  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
