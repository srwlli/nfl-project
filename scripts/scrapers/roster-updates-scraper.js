/**
 * Roster Updates Scraper
 *
 * Detects roster changes by comparing current ESPN rosters with database.
 * Records transactions (signings, releases) in roster_transactions table.
 *
 * Limitations:
 * - ESPN API doesn't provide explicit transaction data or dates
 * - We detect changes by comparing rosters, so we only know transactions occurred "since last check"
 * - Cannot detect trades (player moves between teams) vs release+signing
 * - Cannot distinguish between different IR types or practice squad moves
 *
 * Usage:
 * - Daily check: npm run scrape:roster-updates
 * - Specific team: npm run scrape:roster-updates -- --team=PHI
 * - Force rescan all: npm run scrape:roster-updates -- --force
 *
 * Recommended Schedule: Daily at 5 PM ET (after most roster moves announced)
 *
 * Data Source: ESPN Roster API (comparative analysis)
 */

import { fetchAllRosters, fetchTeamRoster, fetchTeams, transformPlayerData } from '../utils/espn-api.js'
import { getSupabaseClient, upsertBatch, insertBatch } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'

const SCRIPT_NAME = 'roster-updates-scraper.js'
const SEASON_YEAR = 2025

/**
 * Get current roster from database for a team
 */
async function getCurrentDatabaseRoster(teamId) {
  const supabase = getSupabaseClient()

  // Get players through player_teams join table
  // Only include players where end_season is NULL (still on team)
  const { data, error } = await supabase
    .from('player_teams')
    .select(`
      player_id,
      players!inner (
        player_id,
        full_name,
        primary_position,
        status
      )
    `)
    .eq('team_id', teamId)
    .is('end_season', null)
    .is('deleted_at', null)

  if (error) {
    logger.error(`Failed to fetch database roster for ${teamId}:`, error.message)
    return []
  }

  // Flatten the data structure
  const players = (data || []).map(pt => ({
    player_id: pt.players.player_id,
    full_name: pt.players.full_name,
    primary_position: pt.players.primary_position,
    status: pt.players.status
  }))

  return players
}

/**
 * Detect roster changes between ESPN and database
 */
function detectRosterChanges(espnRoster, dbRoster, teamId) {
  const changes = {
    additions: [],  // Players on ESPN but not in DB = signed
    removals: [],   // Players in DB but not on ESPN = released
    updates: []     // Players in both but with different status
  }

  // Create lookup maps
  const espnPlayerMap = new Map()
  espnRoster.forEach(player => {
    const playerId = `espn-${player.id}`
    espnPlayerMap.set(playerId, player)
  })

  const dbPlayerMap = new Map()
  dbRoster.forEach(player => {
    dbPlayerMap.set(player.player_id, player)
  })

  // Find additions (on ESPN but not in DB)
  espnRoster.forEach(espnPlayer => {
    const playerId = `espn-${espnPlayer.id}`
    if (!dbPlayerMap.has(playerId)) {
      changes.additions.push({
        player: espnPlayer,
        playerId: playerId,
        teamId: teamId
      })
    }
  })

  // Find removals (in DB but not on ESPN)
  dbRoster.forEach(dbPlayer => {
    if (!espnPlayerMap.has(dbPlayer.player_id)) {
      changes.removals.push({
        player: dbPlayer,
        playerId: dbPlayer.player_id,
        teamId: teamId
      })
    }
  })

  return changes
}

/**
 * Create transaction records from detected changes
 */
function createTransactionRecords(changes, teamId) {
  const transactions = []
  const today = new Date().toISOString().split('T')[0]

  // Process additions (signings)
  changes.additions.forEach(addition => {
    transactions.push({
      player_id: addition.playerId,
      team_id: teamId,
      transaction_type: 'signed',
      transaction_date: today,
      details: `Signed ${addition.player.displayName || 'player'} (detected via roster comparison)`
    })
  })

  // Process removals (releases)
  changes.removals.forEach(removal => {
    transactions.push({
      player_id: removal.playerId,
      team_id: teamId,
      transaction_type: 'released',
      transaction_date: today,
      details: `Released ${removal.player.full_name || 'player'} (detected via roster comparison)`
    })
  })

  return transactions
}

/**
 * Update player records in database
 */
async function updatePlayerRecords(espnRoster, teamId) {
  const supabase = getSupabaseClient()

  // Transform player data (without current_team_id)
  const players = espnRoster.map(espnPlayer => transformPlayerData(espnPlayer))

  // Upsert player records
  let playerResult = { success: 0, errors: [] }
  if (players.length > 0) {
    playerResult = await upsertBatch('players', players, ['player_id'])
  }

  // Update player_teams relationships
  // For each player, ensure they have an active player_teams record
  const playerTeamRecords = []

  for (const espnPlayer of espnRoster) {
    const playerId = `espn-${espnPlayer.id}`

    // Check if player_teams record exists for this player + team
    const { data: existing } = await supabase
      .from('player_teams')
      .select('player_team_id, end_season')
      .eq('player_id', playerId)
      .eq('team_id', teamId)
      .is('deleted_at', null)
      .order('start_season', { ascending: false })
      .limit(1)
      .single()

    if (!existing) {
      // Create new player_teams record
      playerTeamRecords.push({
        player_id: playerId,
        team_id: teamId,
        start_season: SEASON_YEAR,
        end_season: null,  // Still on team
        jersey_number: espnPlayer.jersey ? parseInt(espnPlayer.jersey) : null
      })
    } else if (existing.end_season !== null) {
      // Player was previously on team but left - update to rejoin
      await supabase
        .from('player_teams')
        .update({ end_season: null })
        .eq('player_team_id', existing.player_team_id)
    }
  }

  // Insert new player_teams records
  if (playerTeamRecords.length > 0) {
    await insertBatch('player_teams', playerTeamRecords)
  }

  return playerResult
}

/**
 * Process roster updates for a specific team
 */
async function processTeamRosterUpdates(team, forceUpdate = false) {
  const teamId = team.abbreviation
  const teamName = team.displayName

  logger.info(`Processing ${teamName} (${teamId})...`)

  try {
    // Fetch current ESPN roster
    const espnRoster = await fetchTeamRoster(team.id)

    if (!espnRoster || espnRoster.length === 0) {
      logger.warn(`  ⚠️  No roster data from ESPN for ${teamId}`)
      return {
        team: teamId,
        additions: 0,
        removals: 0,
        updates: 0,
        errors: []
      }
    }

    logger.info(`  ESPN roster: ${espnRoster.length} players`)

    // Get current database roster
    const dbRoster = await getCurrentDatabaseRoster(teamId)
    logger.info(`  Database roster: ${dbRoster.length} players`)

    // Detect changes
    const changes = detectRosterChanges(espnRoster, dbRoster, teamId)

    const additionCount = changes.additions.length
    const removalCount = changes.removals.length

    if (additionCount > 0 || removalCount > 0) {
      logger.info(`  📋 Detected changes:`)
      if (additionCount > 0) {
        logger.info(`     ✓ ${additionCount} addition(s)`)
        changes.additions.forEach(add => {
          logger.info(`       + ${add.player.displayName || 'Unknown'}`)
        })
      }
      if (removalCount > 0) {
        logger.info(`     ✓ ${removalCount} removal(s)`)
        changes.removals.forEach(rem => {
          logger.info(`       - ${rem.player.full_name || 'Unknown'}`)
        })
      }

      // Create transaction records
      const transactions = createTransactionRecords(changes, teamId)

      // Insert transactions
      if (transactions.length > 0) {
        const result = await insertBatch('roster_transactions', transactions)
        logger.info(`  ✓ Recorded ${result.success} transaction(s)`)
      }
    } else {
      logger.debug(`  - No roster changes detected`)
    }

    // Update player records with current roster (always do this to keep data fresh)
    const updateResult = await updatePlayerRecords(espnRoster, teamId)
    logger.debug(`  ✓ Updated ${updateResult.success} player record(s)`)

    return {
      team: teamId,
      additions: additionCount,
      removals: removalCount,
      updates: updateResult.success,
      errors: updateResult.errors
    }

  } catch (error) {
    logger.error(`  ✗ Failed to process ${teamId}:`, error.message)
    return {
      team: teamId,
      additions: 0,
      removals: 0,
      updates: 0,
      errors: [error.message]
    }
  }
}

/**
 * Main scraper function
 */
async function scrapeRosterUpdates(specificTeamId = null, forceUpdate = false) {
  try {
    logger.info('Starting roster updates scraper...')

    if (forceUpdate) {
      logger.info('FORCE MODE: Will process all rosters regardless of changes')
    }

    // Get teams to process
    let teams
    if (specificTeamId) {
      teams = await fetchTeams()
      teams = teams.filter(t => t.abbreviation === specificTeamId)
      if (teams.length === 0) {
        throw new Error(`Team ${specificTeamId} not found`)
      }
      logger.info(`Processing single team: ${specificTeamId}`)
    } else {
      logger.info('Fetching all NFL teams...')
      teams = await fetchTeams()
      logger.info(`Found ${teams.length} teams`)
    }

    // Process each team
    const results = []
    let totalAdditions = 0
    let totalRemovals = 0
    let totalUpdates = 0
    let totalErrors = 0

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i]
      logger.info(`[${i + 1}/${teams.length}] ${team.displayName}`)

      const result = await processTeamRosterUpdates(team, forceUpdate)
      results.push(result)

      totalAdditions += result.additions
      totalRemovals += result.removals
      totalUpdates += result.updates
      totalErrors += result.errors.length
    }

    logger.info('')
    logger.info('═'.repeat(60))
    logger.info('ROSTER UPDATES SUMMARY')
    logger.info('═'.repeat(60))
    logger.info(`Teams processed: ${teams.length}`)
    logger.info(`Total roster additions: ${totalAdditions}`)
    logger.info(`Total roster removals: ${totalRemovals}`)
    logger.info(`Total player records updated: ${totalUpdates}`)
    if (totalErrors > 0) {
      logger.error(`Total errors: ${totalErrors}`)
    }
    logger.info('═'.repeat(60))

    return {
      teams: teams.length,
      additions: totalAdditions,
      removals: totalRemovals,
      updates: totalUpdates,
      errors: totalErrors
    }

  } catch (error) {
    logger.error('Roster updates scraper failed:', error)
    throw error
  }
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now()
  logScriptStart(SCRIPT_NAME)

  try {
    // Parse command line arguments
    const args = process.argv.slice(2)
    const teamArg = args.find(arg => arg.startsWith('--team='))
    const forceArg = args.includes('--force')

    const teamId = teamArg ? teamArg.split('=')[1] : null

    const result = await scrapeRosterUpdates(teamId, forceArg)

    const duration = Date.now() - startTime

    logScriptEnd(SCRIPT_NAME, {
      success: result.additions + result.removals,
      failed: result.errors,
      total: result.teams,
      duration
    })

    process.exit(0)

  } catch (error) {
    logger.error('Roster updates scraper failed:', error)
    logScriptEnd(SCRIPT_NAME, {
      success: 0,
      failed: 1,
      duration: Date.now() - startTime
    })
    process.exit(1)
  }
}

main()
