/**
 * Populate Divisions and Conferences Tables
 *
 * Quick seed script to populate reference tables for NFL structure
 */

import { getSupabaseClient } from '../utils/supabase-client.js';
import { logger } from '../utils/logger.js';

const supabase = getSupabaseClient();

const conferences = [
  {
    conference_id: 'AFC',
    conference_name: 'American Football Conference',
    abbreviation: 'AFC'
  },
  {
    conference_id: 'NFC',
    conference_name: 'National Football Conference',
    abbreviation: 'NFC'
  }
];

const divisions = [
  // AFC Divisions
  {
    division_id: 'AFC_EAST',
    division_name: 'AFC East',
    conference_id: 'AFC',
    abbreviation: 'AFC East'
  },
  {
    division_id: 'AFC_NORTH',
    division_name: 'AFC North',
    conference_id: 'AFC',
    abbreviation: 'AFC North'
  },
  {
    division_id: 'AFC_SOUTH',
    division_name: 'AFC South',
    conference_id: 'AFC',
    abbreviation: 'AFC South'
  },
  {
    division_id: 'AFC_WEST',
    division_name: 'AFC West',
    conference_id: 'AFC',
    abbreviation: 'AFC West'
  },
  // NFC Divisions
  {
    division_id: 'NFC_EAST',
    division_name: 'NFC East',
    conference_id: 'NFC',
    abbreviation: 'NFC East'
  },
  {
    division_id: 'NFC_NORTH',
    division_name: 'NFC North',
    conference_id: 'NFC',
    abbreviation: 'NFC North'
  },
  {
    division_id: 'NFC_SOUTH',
    division_name: 'NFC South',
    conference_id: 'NFC',
    abbreviation: 'NFC South'
  },
  {
    division_id: 'NFC_WEST',
    division_name: 'NFC West',
    conference_id: 'NFC',
    abbreviation: 'NFC West'
  }
];

async function populateConferences() {
  console.log('\n📊 Populating Conferences...');

  const { data, error } = await supabase
    .from('conferences')
    .upsert(conferences, { onConflict: 'conference_id' })
    .select();

  if (error) {
    logger.error('Error populating conferences:', error);
    throw error;
  }

  console.log(`✅ Populated ${data.length} conferences`);
  return data;
}

async function populateDivisions() {
  console.log('\n📊 Populating Divisions...');

  const { data, error } = await supabase
    .from('divisions')
    .upsert(divisions, { onConflict: 'division_id' })
    .select();

  if (error) {
    logger.error('Error populating divisions:', error);
    throw error;
  }

  console.log(`✅ Populated ${data.length} divisions`);
  return data;
}

async function main() {
  console.log('═'.repeat(60));
  console.log('POPULATE NFL STRUCTURE');
  console.log('═'.repeat(60));

  try {
    await populateConferences();
    await populateDivisions();

    console.log('\n' + '═'.repeat(60));
    console.log('✅ SUCCESS - All tables populated');
    console.log('═'.repeat(60));
    console.log('');

  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    process.exit(1);
  }
}

main();
