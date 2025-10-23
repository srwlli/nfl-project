import { getSupabaseClient } from './utils/supabase-client.js'
import axios from 'axios'
import { logger } from './utils/logger.js'

const supabase = getSupabaseClient()

/**
 * Manually add missing players by fetching from ESPN API by player ID
 *
 * These players appeared in games but are no longer on active rosters,
 * so the standard roster seed misses them.
 *
 * Workorder: WO-FIX-MISSING-PLAYER-DATA-001
 * Task: FIX-001-MANUAL
 */

const MISSING_PLAYER_IDS = [
  'espn-2978935',  // MIA @ IND (Week 1)
  'espn-4034953',  // HOU @ LAR (Week 1)
  'espn-4429891',  // LV @ NE (Week 1)
  'espn-4423367',  // DET @ GB (Week 1)
  'espn-4258197'   // BAL @ BUF (Week 1)
]

async function fetchPlayerFromESPN(playerId) {
  // Extract ESPN ID (remove 'espn-' prefix)
  const espnId = playerId.replace('espn-', '')

  try {
    // Fetch from ESPN athlete endpoint
    const url = `https://site.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${espnId}`
    const response = await axios.get(url)
    const data = response.data

    if (!data || !data.athlete) {
      logger.warn(`Player ${playerId} not found in ESPN API`)
      return null
    }

    const athlete = data.athlete

    // Transform to our schema
    const player = {
      player_id: playerId,
      full_name: athlete.displayName || athlete.fullName,
      first_name: athlete.firstName || null,
      last_name: athlete.lastName || null,
      jersey_number: athlete.jersey ? parseInt(athlete.jersey) : null,
      primary_position: athlete.position?.abbreviation || null,
      height_inches: athlete.displayHeight ? parseHeight(athlete.displayHeight) : null,
      weight_lbs: athlete.weight ? parseInt(athlete.weight) : null,
      college: athlete.college?.name || null,
      birth_date: athlete.dateOfBirth || null,
      headshot_url: athlete.headshot?.href || null,
      status: 'active' // Default to active - status enum only allows specific values
    }

    logger.info(`✓ Fetched ${player.full_name} (${playerId})`)
    return player

  } catch (error) {
    logger.error(`Failed to fetch player ${playerId}:`, error.message)
    return null
  }
}

function parseHeight(heightStr) {
  // Parse "6'2\"" to inches
  const match = heightStr.match(/(\d+)'(\d+)"/)
  if (!match) return null
  return parseInt(match[1]) * 12 + parseInt(match[2])
}

async function addMissingPlayers() {
  console.log('='.repeat(80))
  console.log('ADDING MISSING PLAYERS BY ID')
  console.log('Workorder: WO-FIX-MISSING-PLAYER-DATA-001')
  console.log('='.repeat(80))

  console.log(`\nAttempting to fetch ${MISSING_PLAYER_IDS.length} missing players from ESPN API...\n`)

  const players = []
  const failed = []

  for (const playerId of MISSING_PLAYER_IDS) {
    const player = await fetchPlayerFromESPN(playerId)
    if (player) {
      players.push(player)
    } else {
      failed.push(playerId)
    }

    // Rate limit: 1 req/sec
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n' + '='.repeat(80))
  console.log(`Fetched ${players.length}/${MISSING_PLAYER_IDS.length} players`)

  if (failed.length > 0) {
    console.log(`\nFailed to fetch ${failed.length} players:`)
    failed.forEach(id => console.log(`  - ${id}`))
  }

  if (players.length === 0) {
    console.log('\n❌ No players to add')
    process.exit(1)
  }

  // Insert players into database
  console.log('\n' + '='.repeat(80))
  console.log('INSERTING PLAYERS INTO DATABASE')
  console.log('='.repeat(80))

  const { data, error } = await supabase
    .from('players')
    .upsert(players, {
      onConflict: 'player_id',
      ignoreDuplicates: false
    })

  if (error) {
    logger.error('Failed to insert players:', error)
    console.log(`\n❌ Database insert failed: ${error.message}`)
    process.exit(1)
  }

  console.log(`\n✓ Successfully inserted ${players.length} players`)

  // Verify they're now in database
  const { data: verification } = await supabase
    .from('players')
    .select('player_id, full_name')
    .in('player_id', MISSING_PLAYER_IDS)

  console.log('\n' + '='.repeat(80))
  console.log('VERIFICATION')
  console.log('='.repeat(80))
  console.log(`\nPlayers now in database: ${verification ? verification.length : 0}/${MISSING_PLAYER_IDS.length}`)

  if (verification.length === MISSING_PLAYER_IDS.length) {
    console.log('\n✅ All missing players successfully added!')
    console.log('\nNext step: Re-scrape affected games to populate player stats')
  } else {
    const stillMissing = MISSING_PLAYER_IDS.filter(
      id => !verification.some(p => p.player_id === id)
    )
    console.log(`\n⚠️  ${stillMissing.length} players still missing:`)
    stillMissing.forEach(id => console.log(`  - ${id}`))
  }

  console.log('\n' + '='.repeat(80))
}

addMissingPlayers().catch(error => {
  logger.error('Fatal error:', error)
  console.error('Fatal error:', error)
  process.exit(1)
})
