/**
 * Normalize Team Data
 *
 * Converts all WSH team IDs to WAS across all tables.
 * This is the data mapping/normalization step that ensures consistent team IDs.
 *
 * Tables affected:
 * - player_teams
 * - game_rosters
 * - roster_transactions
 * - games (home_team_id, away_team_id)
 * - team_game_stats
 * - player_game_stats
 *
 * Usage:
 * node scripts/normalize-team-data.js
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import { logger } from './utils/logger.js'

const TABLES_TO_NORMALIZE = [
  { table: 'player_teams', column: 'team_id' },
  { table: 'game_rosters', column: 'team_id' },
  { table: 'roster_transactions', column: 'team_id' },
  { table: 'team_game_stats', column: 'team_id' },
  { table: 'team_season_stats', column: 'team_id' },
  { table: 'scoring_plays', column: 'team_id' },
  { table: 'player_game_stats', column: 'team_id' },
  { table: 'player_game_stats', column: 'opponent_team_id' }
]

const GAME_TABLE_COLUMNS = ['home_team_id', 'away_team_id']

async function normalizeTeamData() {
  const supabase = getSupabaseClient()

  console.log('═'.repeat(80))
  console.log('TEAM DATA NORMALIZATION')
  console.log('═'.repeat(80))
  console.log('Converting all WSH team IDs to WAS for data consistency\n')

  let totalUpdates = 0

  // Normalize regular tables with team_id column
  for (const { table, column } of TABLES_TO_NORMALIZE) {
    try {
      // Check how many records need updating
      const { count: beforeCount } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq(column, 'WSH')

      if (beforeCount === 0) {
        console.log(`✓ ${table}.${column}: Already normalized (0 WSH records)`)
        continue
      }

      // Update WSH → WAS
      const { error, count } = await supabase
        .from(table)
        .update({ [column]: 'WAS' })
        .eq(column, 'WSH')
        .select('*', { count: 'exact', head: true })

      if (error) {
        throw error
      }

      console.log(`✓ ${table}.${column}: Updated ${count || beforeCount} records (WSH → WAS)`)
      totalUpdates += (count || beforeCount)

    } catch (error) {
      logger.error(`Failed to normalize ${table}.${column}:`, error)
      console.error(`✗ ${table}.${column}: ERROR - ${error.message}`)
    }
  }

  // Normalize games table (has two team_id columns)
  for (const column of GAME_TABLE_COLUMNS) {
    try {
      // Check how many records need updating
      const { count: beforeCount } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq(column, 'WSH')

      if (beforeCount === 0) {
        console.log(`✓ games.${column}: Already normalized (0 WSH records)`)
        continue
      }

      // Update WSH → WAS
      const { error, count } = await supabase
        .from('games')
        .update({ [column]: 'WAS' })
        .eq(column, 'WSH')
        .select('*', { count: 'exact', head: true })

      if (error) {
        throw error
      }

      console.log(`✓ games.${column}: Updated ${count || beforeCount} records (WSH → WAS)`)
      totalUpdates += (count || beforeCount)

    } catch (error) {
      logger.error(`Failed to normalize games.${column}:`, error)
      console.error(`✗ games.${column}: ERROR - ${error.message}`)
    }
  }

  console.log('\n' + '═'.repeat(80))
  console.log(`NORMALIZATION COMPLETE`)
  console.log(`Total records updated: ${totalUpdates}`)
  console.log('═'.repeat(80))
  console.log('\nNext step: Delete duplicate WSH team entry')
  console.log('  DELETE FROM teams WHERE team_id = \'WSH\';')
  console.log('═'.repeat(80) + '\n')
}

async function deleteDuplicateTeam() {
  const supabase = getSupabaseClient()

  console.log('═'.repeat(80))
  console.log('DELETE DUPLICATE TEAM ENTRY')
  console.log('═'.repeat(80))

  try {
    // Check if WSH team exists
    const { data: wshTeam } = await supabase
      .from('teams')
      .select('team_id, team_name')
      .eq('team_id', 'WSH')
      .single()

    if (!wshTeam) {
      console.log('✓ WSH team entry already deleted\n')
      return
    }

    // Delete WSH team
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('team_id', 'WSH')

    if (error) {
      throw error
    }

    console.log(`✓ Deleted team: ${wshTeam.team_id} - ${wshTeam.team_name}`)
    console.log('\n' + '═'.repeat(80))
    console.log('CLEANUP COMPLETE')
    console.log('═'.repeat(80) + '\n')

  } catch (error) {
    logger.error('Failed to delete WSH team:', error)
    console.error(`✗ ERROR: ${error.message}\n`)
    throw error
  }
}

async function verifyNormalization() {
  const supabase = getSupabaseClient()

  console.log('═'.repeat(80))
  console.log('VERIFICATION')
  console.log('═'.repeat(80))

  // Check for any remaining WSH references
  const checks = [
    ...TABLES_TO_NORMALIZE,
    { table: 'games', column: 'home_team_id' },
    { table: 'games', column: 'away_team_id' },
    { table: 'teams', column: 'team_id' }
  ]

  let hasIssues = false

  for (const { table, column } of checks) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq(column, 'WSH')

    if (count > 0) {
      console.log(`✗ ${table}.${column}: Still has ${count} WSH records`)
      hasIssues = true
    }
  }

  // Count WAS records
  const { count: wasCount } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', 'WAS')

  if (!hasIssues) {
    console.log('✓ No WSH references found in database')
    console.log(`✓ WAS team exists: ${wasCount > 0 ? 'Yes' : 'No'}`)
    console.log('\n' + '═'.repeat(80))
    console.log('NORMALIZATION VERIFIED - ALL CLEAN!')
    console.log('═'.repeat(80) + '\n')
  } else {
    console.log('\n' + '═'.repeat(80))
    console.log('ISSUES FOUND - RERUN NORMALIZATION')
    console.log('═'.repeat(80) + '\n')
    process.exit(1)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const deleteTeam = args.includes('--delete-team')
  const verifyOnly = args.includes('--verify')

  try {
    if (verifyOnly) {
      await verifyNormalization()
    } else {
      // Step 1: Normalize all data (WSH → WAS)
      await normalizeTeamData()

      // Step 2: Delete duplicate team (if requested)
      if (deleteTeam) {
        await deleteDuplicateTeam()
        await verifyNormalization()
      } else {
        console.log('Run with --delete-team flag to remove WSH team entry')
        console.log('Example: node scripts/normalize-team-data.js --delete-team\n')
      }
    }

  } catch (error) {
    logger.error('Normalization failed:', error)
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()
