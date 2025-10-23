/**
 * Team ID Normalizer
 *
 * Converts any team identifier (abbreviation, city, mascot) to canonical team ID.
 * Solves the WAS/WSH duplicate problem and allows flexible team input.
 *
 * Examples:
 * - normalizeTeamId('WSH') → 'WAS'
 * - normalizeTeamId('Washington') → 'WAS'
 * - normalizeTeamId('Commanders') → 'WAS'
 * - normalizeTeamId('Kansas City') → 'KC'
 *
 * Usage:
 * ```javascript
 * import { normalizeTeamId, normalizeTeamIds } from './scripts/utils/team-normalizer.js'
 *
 * // Single team
 * const canonical = await normalizeTeamId('WSH')  // Returns 'WAS'
 *
 * // Multiple teams
 * const teams = await normalizeTeamIds(['WSH', 'Kansas City', 'SEA'])
 * // Returns { WSH: 'WAS', 'Kansas City': 'KC', SEA: 'SEA' }
 * ```
 */

import { getSupabaseClient } from './supabase-client.js'
import { logger } from './logger.js'

/**
 * Normalize a single team identifier to canonical ID
 *
 * @param {string} teamInput - Any team identifier (WSH, Washington, Commanders, etc.)
 * @returns {Promise<string|null>} Canonical team ID (e.g., 'WAS') or null if not found
 */
export async function normalizeTeamId(teamInput) {
  if (!teamInput) {
    logger.warn('normalizeTeamId: No team input provided')
    return null
  }

  const supabase = getSupabaseClient()

  try {
    // Trim and normalize input
    const input = teamInput.trim()

    // Query team_aliases table for matching alias (case-insensitive)
    const { data, error } = await supabase
      .from('team_aliases')
      .select('canonical_team_id, alias, source')
      .or(`alias.ilike.${input},alias.eq.${input.toUpperCase()}`)
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        logger.warn(`normalizeTeamId: No match found for "${teamInput}"`)
        return null
      }
      throw error
    }

    if (!data) {
      logger.warn(`normalizeTeamId: No canonical ID found for "${teamInput}"`)
      return null
    }

    // Log if normalization occurred (input != output)
    if (data.alias !== data.canonical_team_id) {
      logger.debug(
        `normalizeTeamId: Normalized "${teamInput}" → "${data.canonical_team_id}" (source: ${data.source})`
      )
    }

    return data.canonical_team_id

  } catch (error) {
    logger.error(`normalizeTeamId: Error normalizing "${teamInput}":`, error)
    throw error
  }
}

/**
 * Normalize multiple team identifiers in batch
 *
 * @param {string[]} teamInputs - Array of team identifiers
 * @returns {Promise<Object>} Map of input → canonical ID
 *
 * @example
 * const result = await normalizeTeamIds(['WSH', 'Kansas City', 'SEA'])
 * // Returns:
 * // {
 * //   'WSH': 'WAS',
 * //   'Kansas City': 'KC',
 * //   'SEA': 'SEA'
 * // }
 */
export async function normalizeTeamIds(teamInputs) {
  if (!Array.isArray(teamInputs) || teamInputs.length === 0) {
    logger.warn('normalizeTeamIds: Invalid or empty input array')
    return {}
  }

  const supabase = getSupabaseClient()

  try {
    // Build case-insensitive OR query
    const orConditions = teamInputs
      .map(input => `alias.ilike.${input.trim()},alias.eq.${input.trim().toUpperCase()}`)
      .join(',')

    // Query all matching aliases in one request
    const { data, error } = await supabase
      .from('team_aliases')
      .select('canonical_team_id, alias, source')
      .or(orConditions)

    if (error) {
      throw error
    }

    // Build lookup map: alias (lowercase) → canonical_team_id
    const aliasMap = {}
    if (data) {
      data.forEach(row => {
        aliasMap[row.alias.toLowerCase()] = row.canonical_team_id
      })
    }

    // Map each input to its canonical ID
    const results = {}
    teamInputs.forEach(input => {
      const normalized = input.trim().toLowerCase()
      results[input] = aliasMap[normalized] || null

      if (!results[input]) {
        logger.warn(`normalizeTeamIds: No match found for "${input}"`)
      }
    })

    return results

  } catch (error) {
    logger.error('normalizeTeamIds: Batch normalization failed:', error)
    throw error
  }
}

/**
 * Get all aliases for a canonical team ID
 *
 * @param {string} canonicalId - Canonical team ID (e.g., 'WAS')
 * @returns {Promise<string[]>} Array of all aliases for this team
 *
 * @example
 * const aliases = await getTeamAliases('WAS')
 * // Returns: ['WAS', 'WSH', 'Washington', 'Commanders', 'Washington Commanders']
 */
export async function getTeamAliases(canonicalId) {
  if (!canonicalId) {
    logger.warn('getTeamAliases: No canonical ID provided')
    return []
  }

  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('team_aliases')
      .select('alias, source, is_primary')
      .eq('canonical_team_id', canonicalId.toUpperCase())
      .order('is_primary', { ascending: false })

    if (error) {
      throw error
    }

    return data ? data.map(row => row.alias) : []

  } catch (error) {
    logger.error(`getTeamAliases: Error getting aliases for "${canonicalId}":`, error)
    throw error
  }
}

/**
 * Get all canonical team IDs (deduplicated list)
 *
 * @returns {Promise<string[]>} Array of all canonical team IDs
 *
 * @example
 * const teams = await getAllCanonicalTeamIds()
 * // Returns: ['ARI', 'ATL', 'BAL', ..., 'WAS'] (32 teams)
 */
export async function getAllCanonicalTeamIds() {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('team_aliases')
      .select('canonical_team_id')
      .eq('is_primary', true)
      .order('canonical_team_id')

    if (error) {
      throw error
    }

    return data ? data.map(row => row.canonical_team_id) : []

  } catch (error) {
    logger.error('getAllCanonicalTeamIds: Error fetching canonical IDs:', error)
    throw error
  }
}

/**
 * Validate if a team identifier exists in the system
 *
 * @param {string} teamInput - Team identifier to validate
 * @returns {Promise<boolean>} True if team exists, false otherwise
 */
export async function isValidTeam(teamInput) {
  const canonical = await normalizeTeamId(teamInput)
  return canonical !== null
}

/**
 * CLI Usage: Test team normalization
 *
 * Usage:
 * - Single team: node scripts/utils/team-normalizer.js WSH
 * - Multiple teams: node scripts/utils/team-normalizer.js WSH "Kansas City" SEA
 * - Show aliases: node scripts/utils/team-normalizer.js --aliases WAS
 * - List all teams: node scripts/utils/team-normalizer.js --list
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('Usage:')
    console.log('  Single team:     node scripts/utils/team-normalizer.js WSH')
    console.log('  Multiple teams:  node scripts/utils/team-normalizer.js WSH "Kansas City" SEA')
    console.log('  Show aliases:    node scripts/utils/team-normalizer.js --aliases WAS')
    console.log('  List all teams:  node scripts/utils/team-normalizer.js --list')
    process.exit(1)
  }

  try {
    // Show aliases for a team
    if (args[0] === '--aliases' && args[1]) {
      const canonicalId = args[1]
      const aliases = await getTeamAliases(canonicalId)

      console.log(`\nAliases for ${canonicalId}:`)
      console.log('─'.repeat(50))
      aliases.forEach(alias => {
        console.log(`  ${alias}`)
      })
      console.log('')
      return
    }

    // List all canonical teams
    if (args[0] === '--list') {
      const teams = await getAllCanonicalTeamIds()

      console.log(`\nCanonical Team IDs (${teams.length} teams):`)
      console.log('─'.repeat(50))
      teams.forEach(team => {
        console.log(`  ${team}`)
      })
      console.log('')
      return
    }

    // Normalize single or multiple teams
    console.log('\n' + '═'.repeat(50))
    console.log('TEAM ID NORMALIZATION')
    console.log('═'.repeat(50))

    for (const input of args) {
      const canonical = await normalizeTeamId(input)

      if (canonical) {
        const match = input === canonical ? '✓ (already canonical)' : `→ ${canonical}`
        console.log(`${input.padEnd(25)} ${match}`)
      } else {
        console.log(`${input.padEnd(25)} ✗ NOT FOUND`)
      }
    }

    console.log('═'.repeat(50) + '\n')

  } catch (error) {
    logger.error('Team normalization failed:', error)
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  main()
}
