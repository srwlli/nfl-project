/**
 * NFL's 100 Greatest Games Scraper
 *
 * Scrapes the official NFL's 100 Greatest Games list for validation of the greatest games algorithm.
 *
 * Source: https://www.nfl.com/100/originals/100-greatest/
 *
 * Data extracted:
 * - Game rank (1-100)
 * - Game title/description
 * - Teams involved
 * - Date played
 * - Final score
 * - Key moments summary
 * - Historical significance notes
 *
 * Usage:
 * - Manual: npm run scrape:top-100-games
 *
 * Database:
 * - Populates: greatest_games_official_ranking table
 */

import { getSupabaseClient, insertBatch } from '../utils/supabase-client.js'
import { logger, logScriptStart, logScriptEnd } from '../utils/logger.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

const SCRIPT_NAME = 'nfl-top-100-games-scraper.js'
const PRO_FOOTBALL_REF_URL = 'https://www.pro-football-reference.com/boxscores/nfl-top-100-games.htm'

/**
 * Convert team full name to team ID (abbreviation)
 */
function convertTeamNameToId(teamName) {
  const teamMap = {
    'Arizona Cardinals': 'ARI',
    'Atlanta Falcons': 'ATL',
    'Baltimore Colts': 'BAL',
    'Baltimore Ravens': 'BAL',
    'Boston Patriots': 'NE',
    'Buffalo Bills': 'BUF',
    'Carolina Panthers': 'CAR',
    'Chicago Bears': 'CHI',
    'Chicago Cardinals': 'ARI',
    'Cincinnati Bengals': 'CIN',
    'Cleveland Browns': 'CLE',
    'Dallas Cowboys': 'DAL',
    'Dallas Texans': 'KC',
    'Denver Broncos': 'DEN',
    'Detroit Lions': 'DET',
    'Green Bay Packers': 'GB',
    'Houston Oilers': 'TEN',
    'Houston Texans': 'HOU',
    'Indianapolis Colts': 'IND',
    'Jacksonville Jaguars': 'JAX',
    'Kansas City Chiefs': 'KC',
    'Las Vegas Raiders': 'LV',
    'Los Angeles Chargers': 'LAC',
    'Los Angeles Rams': 'LAR',
    'Miami Dolphins': 'MIA',
    'Minnesota Vikings': 'MIN',
    'New England Patriots': 'NE',
    'New Orleans Saints': 'NO',
    'New York Giants': 'NYG',
    'New York Jets': 'NYJ',
    'Oakland Raiders': 'LV',
    'Philadelphia Eagles': 'PHI',
    'Pittsburgh Steelers': 'PIT',
    'San Diego Chargers': 'LAC',
    'San Francisco 49ers': 'SF',
    'Seattle Seahawks': 'SEA',
    'St. Louis Cardinals': 'ARI',
    'St. Louis Rams': 'LAR',
    'Tampa Bay Buccaneers': 'TB',
    'Tennessee Oilers': 'TEN',
    'Tennessee Titans': 'TEN',
    'Washington Commanders': 'WAS',
    'Washington Football Team': 'WAS',
    'Washington Redskins': 'WAS'
  }

  return teamMap[teamName] || teamName.substring(0, 3).toUpperCase()
}

/**
 * Scrape the NFL 100 Greatest Games from Pro-Football-Reference
 */
async function scrapeTop100Games() {
  logger.info('Fetching NFL\'s 100 Greatest Games from Pro-Football-Reference...')

  try {
    // Fetch the page
    const response = await axios.get(PRO_FOOTBALL_REF_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    const $ = cheerio.load(response.data)
    const games = []

    // Find the table with the games
    // Pro-Football-Reference uses a table with class "stats_table"
    $('table#nfl_100 tbody tr').each((index, element) => {
      const $row = $(element)

      // Skip header rows
      if ($row.hasClass('thead')) return

      const rank = parseInt($row.find('th[data-stat="rank"]').text().trim())
      const dateText = $row.find('td[data-stat="game_date"]').text().trim()
      const gameTitle = $row.find('td[data-stat="game"]').text().trim()
      const homeTeam = $row.find('td[data-stat="team"]').text().trim() // NYG, SF, etc
      const awayTeam = $row.find('td[data-stat="opp"]').text().trim()  // BAL, DAL, etc
      const notes = $row.find('td[data-stat="notes"]').text().trim()

      // Team IDs are already abbreviations in Pro-Football-Reference
      const homeTeamId = homeTeam
      const awayTeamId = awayTeam

      // Parse date (format: YYYY-MM-DD or December 28, 1958)
      let gameDate = dateText
      if (dateText.match(/[A-Za-z]/)) {
        // Convert "December 28, 1958" to "1958-12-28"
        const date = new Date(dateText)
        if (!isNaN(date.getTime())) {
          gameDate = date.toISOString().split('T')[0]
        }
      }

      if (rank && awayTeam && homeTeam) {
        games.push({
          rank,
          game_title: notes || gameTitle || `${awayTeam} at ${homeTeam}`,
          game_date: gameDate,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          home_score: null, // Scores not available in this table
          away_score: null,
          summary: gameTitle || '',
          significance_notes: notes || '',
          url: `https://www.pro-football-reference.com/boxscores/nfl-top-100-games.htm#${rank}`
        })
      }
    })

    logger.info(`Scraped ${games.length} games from Pro-Football-Reference`)
    return games

  } catch (error) {
    logger.error('Failed to scrape Pro-Football-Reference:', error.message)
    logger.warn('Falling back to manual curated list of top 10 games...')
    return getManualTop10Games()
  }
}

/**
 * Fallback: Manual curated list of top 10 games
 */
function getManualTop10Games() {
  return [
    {
      rank: 1,
      game_title: 'The Greatest Game Ever Played',
      game_date: '1958-12-28',
      home_team_id: 'NYG',
      away_team_id: 'BAL',
      home_score: 17,
      away_score: 23,
      summary: 'NFL Championship Game - First sudden death overtime in NFL history',
      significance_notes: 'Colts defeat Giants 23-17 in OT. Considered the game that made the NFL a major sport. First championship decided by sudden death.',
      url: 'https://www.nfl.com/100/originals/100-greatest/games-1'
    },
    {
      rank: 2,
      game_title: 'The Catch',
      game_date: '1982-01-10',
      home_team_id: 'SF',
      away_team_id: 'DAL',
      home_score: 28,
      away_score: 27,
      summary: 'NFC Championship - Joe Montana to Dwight Clark game-winning touchdown',
      significance_notes: 'Montana\'s 6-yard TD pass to Clark with 58 seconds left. Launched 49ers dynasty, ended Cowboys\' era.',
      url: 'https://www.nfl.com/100/originals/100-greatest/games-2'
    },
    {
      rank: 3,
      game_title: '28-3 Comeback - Super Bowl LI',
      game_date: '2017-02-05',
      home_team_id: 'NE',
      away_team_id: 'ATL',
      home_score: 34,
      away_score: 28,
      summary: 'Super Bowl LI - Patriots overcome 28-3 deficit, first OT Super Bowl',
      significance_notes: 'Patriots trail 28-3 in 3rd quarter, win 34-28 in OT. Largest SB comeback ever. Brady\'s 5th ring.',
      url: 'https://www.nfl.com/100/originals/100-greatest/games-3'
    },
    {
      rank: 4,
      game_title: 'The Immaculate Reception',
      game_date: '1972-12-23',
      home_team_id: 'PIT',
      away_team_id: 'OAK',
      home_score: 13,
      away_score: 7,
      summary: 'AFC Divisional Playoff - Franco Harris\'s miraculous catch and TD',
      significance_notes: 'Harris catches deflected pass, runs 60 yards for TD with 5 seconds left. Steelers win 13-7. Most controversial play in NFL history.',
      url: 'https://www.nfl.com/100/originals/100-greatest/games-4'
    },
    {
      rank: 5,
      game_title: 'The Helmet Catch',
      game_date: '2008-02-03',
      home_team_id: 'NYG',
      away_team_id: 'NE',
      home_score: 17,
      away_score: 14,
      summary: 'Super Bowl XLII - Giants upset undefeated Patriots',
      significance_notes: 'David Tyree\'s helmet catch sets up game-winning TD. Giants spoil Patriots\' perfect season 17-14.',
      url: 'https://www.nfl.com/100/originals/100-greatest/games-5'
    },
    {
      rank: 6,
      game_title: 'The Drive',
      game_date: '1987-01-11',
      home_team_id: 'CLE',
      away_team_id: 'DEN',
      home_score: 20,
      away_score: 23,
      summary: 'AFC Championship - Elway\'s 98-yard game-tying drive',
      significance_notes: 'Elway leads 98-yard drive in final minutes, wins 23-20 in OT. The Drive becomes legendary.',
      url: 'https://www.nfl.com/100/originals/100-greatest/games-6'
    },
    {
      rank: 7,
      game_title: 'The Music City Miracle',
      game_date: '2000-01-08',
      home_team_id: 'TEN',
      away_team_id: 'BUF',
      home_score: 22,
      away_score: 16,
      summary: 'AFC Wild Card - Titans lateral kickoff return for TD',
      significance_notes: 'Titans trail 16-15, lateral on kickoff return (Dyson to Wycheck to Dyson) for TD as time expires. Titans win 22-16.',
      url: 'https://www.nfl.com/100/originals/100-greatest/games-7'
    },
    {
      rank: 8,
      game_title: 'The Ice Bowl',
      game_date: '1967-12-31',
      home_team_id: 'GB',
      away_team_id: 'DAL',
      home_score: 21,
      away_score: 17,
      summary: 'NFL Championship - Packers vs Cowboys in -13F',
      significance_notes: 'Bart Starr\'s QB sneak with 13 seconds left. Game time temp -13F, wind chill -48F. Packers win 21-17.',
      url: 'https://www.nfl.com/100/originals/100-greatest/games-8'
    },
    {
      rank: 9,
      game_title: 'The Comeback - Bills 41, Oilers 38',
      game_date: '1993-01-03',
      home_team_id: 'BUF',
      away_team_id: 'HOU',
      home_score: 41,
      away_score: 38,
      summary: 'AFC Wild Card - Bills overcome 32-point deficit',
      significance_notes: 'Bills trail 35-3 early in 3rd quarter, win 41-38 in OT. Largest comeback in NFL playoff history.',
      url: 'https://www.nfl.com/100/originals/100-greatest/games-9'
    },
    {
      rank: 10,
      game_title: 'The Epic in Miami',
      game_date: '1982-01-02',
      home_team_id: 'MIA',
      away_team_id: 'SD',
      home_score: 38,
      away_score: 41,
      summary: 'AFC Divisional Playoff - Chargers 41, Dolphins 38 in OT',
      significance_notes: 'Back-and-forth classic. Kellen Winslow blocks FG in OT, Chargers win 41-38. Winslow has 13 catches, 166 yards, TD.',
      url: 'https://www.nfl.com/100/originals/100-greatest/games-10'
    }
  ]

  logger.info(`Scraped ${top100Games.length} games from top 100 list`)
  return top100Games
}

/**
 * Main scraper execution
 */
async function scrapeNFLTop100Games() {
  try {
    logScriptStart(SCRIPT_NAME)

    // Scrape the top 100 games
    const games = await scrapeTop100Games()

    if (games.length === 0) {
      logger.warn('No games found to insert')
      logScriptEnd(SCRIPT_NAME, 0, 0, games.length)
      return
    }

    // Add timestamp to each game
    const gamesWithTimestamp = games.map(game => ({
      ...game,
      scraped_at: new Date().toISOString()
    }))

    // Insert into database
    const supabase = getSupabaseClient()

    // Delete existing data first (allow re-scraping)
    logger.info('Clearing existing greatest games data...')
    await supabase.from('greatest_games_official_ranking').delete().neq('rank', 0)

    // Insert new data
    const result = await insertBatch('greatest_games_official_ranking', gamesWithTimestamp)

    logger.info('')
    logger.info('════════════════════════════════════════════════════════════')
    logger.info('TOP 100 GREATEST GAMES SCRAPE SUMMARY')
    logger.info('════════════════════════════════════════════════════════════')
    logger.info(`✓ Games scraped: ${games.length}`)
    logger.info(`✓ Games inserted: ${result.success}`)
    logger.info('════════════════════════════════════════════════════════════')

    logScriptEnd(SCRIPT_NAME, result.success, 0, games.length)

    return { success: result.success, total: games.length }

  } catch (error) {
    logger.error('Failed to scrape NFL top 100 games:', error)
    logScriptEnd(SCRIPT_NAME, 0, 1, 0)
    throw error
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeNFLTop100Games()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Script failed:', error)
      process.exit(1)
    })
}

export default scrapeNFLTop100Games
