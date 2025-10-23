/**
 * Get Team Roster Data
 *
 * Fetches current roster for a specific team or all teams.
 * Returns formatted roster data with player details, positions, and stats.
 *
 * Usage:
 * - All teams: node scripts/get-team-roster.js
 * - Specific team: node scripts/get-team-roster.js --team=KC
 * - JSON output: node scripts/get-team-roster.js --team=KC --json
 *
 * Data Source: players + player_teams tables
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import { logger } from './utils/logger.js'

const SEASON_YEAR = 2025

/**
 * Fetch roster for a specific team
 *
 * @param {string} teamAbbr - Team abbreviation (e.g., 'KC', 'SF')
 * @returns {Promise<Object>} Team roster data
 */
export async function fetchTeamRoster(teamAbbr) {
  const supabase = getSupabaseClient()

  try {
    // Get team details
    const { data: team, error: teamError} = await supabase
      .from('teams')
      .select('*')
      .eq('team_abbr', teamAbbr.toUpperCase())
      .single()

    if (teamError || !team) {
      throw new Error(`Team '${teamAbbr}' not found`)
    }

    // Get current roster (using start_season/end_season instead of season)
    const { data: playerTeams, error: rosterError } = await supabase
      .from('player_teams')
      .select(`
        player_id,
        jersey_number,
        players (
          player_id,
          full_name,
          first_name,
          last_name,
          primary_position,
          height_inches,
          weight_lbs,
          college,
          rookie_year,
          headshot_url,
          status
        )
      `)
      .eq('team_id', team.team_id)
      .lte('start_season', SEASON_YEAR)
      .or(`end_season.is.null,end_season.gte.${SEASON_YEAR}`)

    if (rosterError) {
      throw rosterError
    }

    // Get season stats for roster players
    const playerIds = playerTeams.map(pt => pt.player_id)

    const { data: seasonStats } = await supabase
      .from('player_season_cumulative_stats')
      .select('*')
      .in('player_id', playerIds)
      .eq('season', SEASON_YEAR)

    // Build stats lookup map
    const statsMap = {}
    if (seasonStats) {
      seasonStats.forEach(stat => {
        statsMap[stat.player_id] = stat
      })
    }

    // Format roster with stats
    const roster = playerTeams
      .map(pt => {
        const player = Array.isArray(pt.players) ? pt.players[0] : pt.players
        if (!player) return null

        const stats = statsMap[pt.player_id]

        return {
          playerId: player.player_id,
          name: player.full_name,
          firstName: player.first_name,
          lastName: player.last_name,
          position: player.primary_position,
          jerseyNumber: pt.jersey_number || player.jersey_number,
          height: formatHeight(player.height_inches),
          weight: player.weight_lbs,
          college: player.college,
          experience: calculateExperience(player.rookie_year),
          headshot: player.headshot_url,
          status: player.status,

          // Season stats
          stats: stats ? {
            gamesPlayed: stats.games_played,
            passingYards: stats.season_passing_yards,
            passingTDs: stats.season_passing_touchdowns,
            rushingYards: stats.season_rushing_yards,
            rushingTDs: stats.season_rushing_touchdowns,
            receivingYards: stats.season_receiving_yards,
            receivingTDs: stats.season_receiving_touchdowns,
            receptions: stats.season_receptions,
            targets: stats.season_targets,
            tackles: stats.season_tackles,
            sacks: stats.season_sacks,
            interceptions: stats.season_interceptions,
            fantasyPoints: stats.season_fantasy_points_ppr
          } : null
        }
      })
      .filter(p => p !== null)

    // Group by position
    const positionGroups = groupByPosition(roster)

    return {
      team: {
        id: team.team_id,
        name: team.team_name,
        abbreviation: team.team_abbr,
        city: team.city,
        logo: team.logo_url,
        colors: {
          primary: team.team_color,
          secondary: team.secondary_color
        },
        conference: team.conference,
        division: team.division
      },
      season: SEASON_YEAR,
      rosterSize: roster.length,
      roster: roster,
      byPosition: positionGroups
    }

  } catch (error) {
    logger.error('Failed to fetch team roster:', error)
    throw error
  }
}

/**
 * Fetch all team rosters
 */
export async function fetchAllTeamRosters() {
  const supabase = getSupabaseClient()

  try {
    // Get all teams
    const { data: teams } = await supabase
      .from('teams')
      .select('team_abbr, team_name')
      .order('team_name')

    const rosters = []

    for (const team of teams) {
      try {
        const roster = await fetchTeamRoster(team.team_abbr)
        rosters.push(roster)
      } catch (error) {
        logger.error(`Failed to fetch roster for ${team.team_abbr}:`, error.message)
      }
    }

    return {
      season: SEASON_YEAR,
      totalTeams: rosters.length,
      rosters: rosters
    }

  } catch (error) {
    logger.error('Failed to fetch all rosters:', error)
    throw error
  }
}

/**
 * Group roster by position
 */
function groupByPosition(roster) {
  const groups = {
    QB: [],
    RB: [],
    WR: [],
    TE: [],
    OL: [],
    DL: [],
    LB: [],
    DB: [],
    K: [],
    P: [],
    LS: [],
    OTHER: []
  }

  roster.forEach(player => {
    const pos = player.position || 'OTHER'

    // Map positions to groups
    if (pos === 'QB') {
      groups.QB.push(player)
    } else if (pos === 'RB' || pos === 'FB') {
      groups.RB.push(player)
    } else if (pos === 'WR') {
      groups.WR.push(player)
    } else if (pos === 'TE') {
      groups.TE.push(player)
    } else if (['C', 'G', 'T', 'OL', 'OT', 'OG'].includes(pos)) {
      groups.OL.push(player)
    } else if (['DE', 'DT', 'NT', 'DL'].includes(pos)) {
      groups.DL.push(player)
    } else if (['LB', 'ILB', 'OLB', 'MLB'].includes(pos)) {
      groups.LB.push(player)
    } else if (['CB', 'S', 'DB', 'SS', 'FS'].includes(pos)) {
      groups.DB.push(player)
    } else if (pos === 'K') {
      groups.K.push(player)
    } else if (pos === 'P') {
      groups.P.push(player)
    } else if (pos === 'LS') {
      groups.LS.push(player)
    } else {
      groups.OTHER.push(player)
    }
  })

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key]
    }
  })

  return groups
}

/**
 * Format height from inches to feet-inches
 */
function formatHeight(inches) {
  if (!inches) return null
  const feet = Math.floor(inches / 12)
  const remainingInches = inches % 12
  return `${feet}'${remainingInches}"`
}

/**
 * Calculate years of experience
 */
function calculateExperience(rookieYear) {
  if (!rookieYear) return null
  const currentYear = new Date().getFullYear()
  const years = currentYear - rookieYear
  return years === 0 ? 'Rookie' : `${years} year${years !== 1 ? 's' : ''}`
}

/**
 * Display roster in console
 */
function displayRoster(rosterData) {
  const { team, rosterSize, byPosition } = rosterData

  console.log('═'.repeat(100))
  console.log(`${team.name.toUpperCase()} (${team.abbreviation}) - ${SEASON_YEAR} ROSTER`)
  console.log(`${team.city} • ${team.conference} ${team.division}`)
  console.log('═'.repeat(100))
  console.log(`Total Players: ${rosterSize}`)
  console.log('')

  // Display by position group
  const groupOrder = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K', 'P', 'LS', 'OTHER']

  groupOrder.forEach(posGroup => {
    if (byPosition[posGroup]) {
      console.log(`\n${posGroup} (${byPosition[posGroup].length})`)
      console.log('─'.repeat(100))

      byPosition[posGroup].forEach(player => {
        const num = player.jerseyNumber ? `#${player.jerseyNumber}`.padEnd(5) : '     '
        const name = player.name.padEnd(25)
        const pos = player.position.padEnd(4)
        const size = player.height && player.weight ?
          `${player.height} ${player.weight} lbs`.padEnd(15) : ''.padEnd(15)
        const college = player.college ? player.college.padEnd(20) : ''.padEnd(20)
        const exp = player.experience || ''

        console.log(`${num} ${name} ${pos} ${size} ${college} ${exp}`)
      })
    }
  })

  console.log('')
  console.log('═'.repeat(100))
}

/**
 * Main execution
 */
async function main() {
  try {
    const args = process.argv.slice(2)
    const teamArg = args.find(arg => arg.startsWith('--team='))
    const jsonMode = args.includes('--json')

    if (teamArg) {
      // Specific team
      const teamAbbr = teamArg.split('=')[1]
      const rosterData = await fetchTeamRoster(teamAbbr)

      if (jsonMode) {
        console.log(JSON.stringify(rosterData, null, 2))
      } else {
        displayRoster(rosterData)
      }
    } else {
      // All teams
      const allRosters = await fetchAllTeamRosters()

      if (jsonMode) {
        console.log(JSON.stringify(allRosters, null, 2))
      } else {
        console.log(`\nFetched rosters for ${allRosters.totalTeams} teams`)
        console.log('\nUse --team=<ABBR> to view specific team roster')
        console.log('Example: node scripts/get-team-roster.js --team=KC\n')
      }
    }

  } catch (error) {
    logger.error('Roster fetch failed:', error)
    console.error('Error:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file:///${process.argv[1]?.replace(/\\/g, '/')}`) {
  main()
}
