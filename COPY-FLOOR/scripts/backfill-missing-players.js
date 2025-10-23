/**
 * Backfill Missing Players
 * Workorder: WO-GAME-DAY-ROSTER-TRACKING-001
 * Task: BACKFILL-001
 *
 * Purpose: Add missing players that appear in games but are not in players table
 * These players were released, traded, or moved to practice squad after playing in games
 */

import { logger } from './utils/logger.js'
import { autoCreatePlayers } from './utils/player-creator.js'

// Known missing player IDs from FK constraint errors across weeks 1-6
const MISSING_PLAYER_IDS = [
  'espn-2978935',  // Round 1 - Found in MIA @ IND, DEN @ IND, IND @ TEN, IND @ LAR
  'espn-4034953',  // Round 1 - Found in HOU @ LAR, TB @ HOU, HOU @ JAX
  'espn-4429891',  // Round 1 - Found in LV @ NE
  'espn-4423367',  // Round 1 - Found in DET @ GB
  'espn-4258197',  // Round 1 - Found in BAL @ BUF
  'espn-2982313',  // Round 2 - Found in CHI @ DET, CHI @ LV, DAL @ CHI
  'espn-3043168',  // Round 2 - Found in PHI @ KC, DEN @ PHI, PHI @ TB, PHI @ NYG
  'espn-3123963',  // Round 2 - Found in MIA @ BUF
  'espn-4240623',  // Round 2 - Found in ATL @ CAR, CAR @ NE
  'espn-4048259',  // Round 2 - Found in DAL @ NYJ
  'espn-4245144',  // Round 2 - Found in WSH @ ATL, WSH @ LAC
  'espn-3128444'   // Round 2 - Found in TEN @ LV
]

async function backfillMissingPlayers() {
  console.log('='.repeat(80))
  console.log('BACKFILL MISSING PLAYERS')
  console.log('Workorder: WO-GAME-DAY-ROSTER-TRACKING-001')
  console.log('Task: BACKFILL-001')
  console.log('='.repeat(80))

  logger.info('Starting backfill for missing players...')
  console.log(`\nAttempting to create ${MISSING_PLAYER_IDS.length} missing players from ESPN API...\n`)

  // Use auto-create utility with 1 req/sec rate limit
  const results = await autoCreatePlayers(MISSING_PLAYER_IDS, {
    rateLimit: 1000
  })

  // Display results
  console.log('\n' + '='.repeat(80))
  console.log('BACKFILL SUMMARY')
  console.log('='.repeat(80))

  console.log(`\nPlayers created: ${results.created}`)
  console.log(`Players skipped (already exist): ${results.skipped}`)
  console.log(`Players failed: ${results.failed}`)

  if (results.failedPlayers && results.failedPlayers.length > 0) {
    console.log(`\n⚠️  Failed to create ${results.failedPlayers.length} players:`)
    results.failedPlayers.forEach(id => console.log(`  - ${id}`))
  }

  const successRate = ((results.created + results.skipped) / MISSING_PLAYER_IDS.length * 100).toFixed(1)
  console.log(`\nSuccess rate: ${successRate}%`)

  if (results.created > 0) {
    console.log(`\n✅ Successfully added ${results.created} missing players!`)
    console.log('\nNext step: Re-scrape affected games to populate player stats')
    console.log('Run: npm run scrape:game-stats -- --week=1 (and weeks 2-6)')
  } else if (results.skipped === MISSING_PLAYER_IDS.length) {
    console.log('\n✅ All players already exist in database!')
  } else {
    console.log('\n❌ Backfill incomplete - some players could not be added')
    process.exit(1)
  }

  console.log('\n' + '='.repeat(80))
}

backfillMissingPlayers().catch(error => {
  logger.error('Fatal error during backfill:', error)
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
