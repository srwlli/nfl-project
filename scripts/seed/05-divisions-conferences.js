/**
 * Seed Script: NFL Divisions and Conferences
 * Populates the divisions and conferences tables with NFL structure
 */

import { getSupabaseClient } from '../utils/supabase-client.js';
import { logger } from '../utils/logger.js';

const supabase = getSupabaseClient();

// NFL Conferences
const conferences = [
  {
    conference_id: 'AFC',
    conference_name: 'American Football Conference',
    established_year: 1970
  },
  {
    conference_id: 'NFC',
    conference_name: 'National Football Conference',
    established_year: 1970
  }
];

// NFL Divisions
const divisions = [
  // AFC Divisions
  {
    division_id: 'AFC_EAST',
    division_name: 'AFC East',
    conference: 'AFC',
    established_year: 1970
  },
  {
    division_id: 'AFC_NORTH',
    division_name: 'AFC North',
    conference: 'AFC',
    established_year: 2002
  },
  {
    division_id: 'AFC_SOUTH',
    division_name: 'AFC South',
    conference: 'AFC',
    established_year: 2002
  },
  {
    division_id: 'AFC_WEST',
    division_name: 'AFC West',
    conference: 'AFC',
    established_year: 1970
  },
  // NFC Divisions
  {
    division_id: 'NFC_EAST',
    division_name: 'NFC East',
    conference: 'NFC',
    established_year: 1970
  },
  {
    division_id: 'NFC_NORTH',
    division_name: 'NFC North',
    conference: 'NFC',
    established_year: 2002
  },
  {
    division_id: 'NFC_SOUTH',
    division_name: 'NFC South',
    conference: 'NFC',
    established_year: 2002
  },
  {
    division_id: 'NFC_WEST',
    division_name: 'NFC West',
    conference: 'NFC',
    established_year: 1970
  }
];

async function seedConferences() {
  logger.info('Seeding conferences...');

  const { data, error } = await supabase
    .from('conferences')
    .upsert(conferences, {
      onConflict: 'conference_id',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    logger.error('Failed to seed conferences:', error);
    throw error;
  }

  logger.info(`✓ Seeded ${data.length} conferences`);
  return data;
}

async function seedDivisions() {
  logger.info('Seeding divisions...');

  const { data, error } = await supabase
    .from('divisions')
    .upsert(divisions, {
      onConflict: 'division_id',
      ignoreDuplicates: false
    })
    .select();

  if (error) {
    logger.error('Failed to seed divisions:', error);
    throw error;
  }

  logger.info(`✓ Seeded ${data.length} divisions`);
  return data;
}

async function main() {
  logger.info('════════════════════════════════════════════════════════════');
  logger.info('SCRIPT START: 05-divisions-conferences.js');
  logger.info(`Timestamp: ${new Date().toISOString()}`);
  logger.info('════════════════════════════════════════════════════════════');

  try {
    // Seed conferences first (parent table)
    const conferencesData = await seedConferences();

    // Then seed divisions (child table with FK to conferences)
    const divisionsData = await seedDivisions();

    logger.info('');
    logger.info('════════════════════════════════════════════════════════════');
    logger.info('SEED SUMMARY');
    logger.info('════════════════════════════════════════════════════════════');
    logger.info(`✓ Conferences: ${conferencesData.length}`);
    logger.info(`✓ Divisions: ${divisionsData.length}`);
    logger.info('════════════════════════════════════════════════════════════');
    logger.info('════════════════════════════════════════════════════════════');
    logger.info('SCRIPT END: 05-divisions-conferences.js');
    logger.info(`Timestamp: ${new Date().toISOString()}`);
    logger.info('════════════════════════════════════════════════════════════');

    process.exit(0);
  } catch (error) {
    logger.error('Seed script failed:', error);
    process.exit(1);
  }
}

main();
