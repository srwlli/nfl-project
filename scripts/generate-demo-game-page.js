/**
 * Generate Demo Game Page with Real Data
 *
 * Uses v0-completed-game-template.json as structure template
 * Applies Next Down Metrics theme (monochrome + neon accents, HUD-style)
 * Populates with ALL real scraped data from database
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import { logger } from './utils/logger.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SEASON = 2025

/**
 * Fetch comprehensive game data from database
 */
async function fetchGameData(gameId) {
  const supabase = getSupabaseClient()
  logger.info(`\n🔍 Fetching comprehensive data for game: ${gameId}`)

  // Game basic info + quarter scores + weather
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('game_id', gameId)
    .single()

  if (gameError) {
    logger.error('Game query error:', gameError)
    throw gameError
  }

  // Get team details separately
  const { data: homeTeam } = await supabase
    .from('teams')
    .select('*')
    .eq('team_id', game.home_team_id)
    .single()

  const { data: awayTeam } = await supabase
    .from('teams')
    .select('*')
    .eq('team_id', game.away_team_id)
    .single()

  // Get venue details
  const { data: venue } = await supabase
    .from('stadiums')
    .select('*')
    .eq('stadium_id', game.stadium_id)
    .single()

  // Get weather
  const { data: gameWeather } = await supabase
    .from('game_weather')
    .select('*')
    .eq('game_id', gameId)
    .limit(1)

  // Add to game object (using aliases for consistency with template)
  game.home_team = homeTeam ? {
    ...homeTeam,
    full_name: homeTeam.team_name,
    abbreviation: homeTeam.team_abbr
  } : null

  game.away_team = awayTeam ? {
    ...awayTeam,
    full_name: awayTeam.team_name,
    abbreviation: awayTeam.team_abbr
  } : null

  game.venue = venue
  game.game_weather = gameWeather

  logger.info(`✓ Loaded game: ${game.away_team?.full_name || 'Unknown'} @ ${game.home_team?.full_name || 'Unknown'}`)

  // Team season stats (standings, records, playoff probability)
  const { data: homeStats } = await supabase
    .from('team_season_stats')
    .select('*')
    .eq('team_id', game.home_team_id)
    .eq('season', SEASON)
    .single()

  const { data: awayStats } = await supabase
    .from('team_season_stats')
    .select('*')
    .eq('team_id', game.away_team_id)
    .eq('season', SEASON)
    .single()

  // Player stats (passing, rushing, receiving, defense)
  const { data: playerStats } = await supabase
    .from('player_game_stats')
    .select('*')
    .eq('game_id', gameId)

  // Fetch player details separately
  if (playerStats && playerStats.length > 0) {
    const playerIds = [...new Set(playerStats.map(s => s.player_id))]
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .in('player_id', playerIds)

    const playerMap = {}
    players?.forEach(p => {
      playerMap[p.player_id] = p
    })

    playerStats.forEach(stat => {
      stat.player = playerMap[stat.player_id] || { full_name: 'Unknown', position: 'N/A', team_id: 'N/A' }
    })
  }

  // Scoring plays
  const { data: scoringPlays } = await supabase
    .from('scoring_plays')
    .select('*')
    .eq('game_id', gameId)
    .order('quarter', { ascending: true })
    .order('time_remaining_seconds', { ascending: false })

  // Betting lines
  const { data: bettingLines } = await supabase
    .from('game_betting_lines')
    .select(`
      *,
      spread_lines(home_spread, away_spread, home_spread_odds, is_opening_line, is_closing_line),
      over_under_lines(over_under, over_odds, under_odds, is_opening_line, is_closing_line),
      moneyline_odds(home_moneyline, away_moneyline, is_opening_line)
    `)
    .eq('game_id', gameId)
    .eq('season', SEASON)

  // Advanced analytics (EPA)
  const { data: epaData } = await supabase
    .from('game_epa_summary')
    .select('*')
    .eq('game_id', gameId)

  return {
    game,
    homeStats,
    awayStats,
    playerStats: playerStats || [],
    scoringPlays: scoringPlays || [],
    bettingLines: bettingLines || [],
    epaData: epaData || []
  }
}

/**
 * Format seconds to MM:SS format
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

/**
 * Generate HTML with Next Down Metrics theme
 */
function generateHTML(data) {
  const { game, homeStats, awayStats, playerStats, scoringPlays, bettingLines, epaData } = data

  // Calculate records before/after (use current records as "after", subtract 1 for before)
  const homeWins = homeStats?.wins || 0
  const homeLosses = homeStats?.losses || 0
  const awayWins = awayStats?.wins || 0
  const awayLosses = awayStats?.losses || 0

  const homeRecordAfter = `${homeWins}-${homeLosses}`
  const awayRecordAfter = `${awayWins}-${awayLosses}`

  const homeWon = game.home_score > game.away_score
  const homeRecordBefore = homeWon ? `${homeWins - 1}-${homeLosses}` : `${homeWins}-${homeLosses - 1}`
  const awayRecordBefore = !homeWon ? `${awayWins - 1}-${awayLosses}` : `${awayWins}-${awayLosses - 1}`

  // Format date
  const gameDate = new Date(game.game_date)
  const formattedDate = gameDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // Weather
  const weather = game.game_weather?.[0]
  const weatherDisplay = weather
    ? `${weather.temperature_fahrenheit || '--'}°F${weather.wind_speed_mph ? `, Wind ${weather.wind_direction || ''} ${weather.wind_speed_mph} mph` : ''}${weather.conditions ? `, ${weather.conditions}` : ''}`
    : 'N/A'

  // Separate player stats by category
  const passingStats = playerStats.filter(p => p.passing_attempts && p.passing_attempts > 0)
  const rushingStats = playerStats.filter(p => p.rushing_attempts && p.rushing_attempts > 0)
  const receivingStats = playerStats.filter(p => p.receptions && p.receptions > 0)
  const defenseStats = playerStats.filter(p => p.total_tackles && p.total_tackles > 0)

  // Betting data
  const openingSpread = bettingLines.find(bl => bl.spread_lines?.some(sl => sl.is_opening_line))
  const closingSpread = bettingLines.find(bl => bl.spread_lines?.some(sl => sl.is_closing_line))
  const openingTotal = bettingLines.find(bl => bl.over_under_lines?.some(ou => ou.is_opening_line))
  const closingTotal = bettingLines.find(bl => bl.over_under_lines?.some(ou => ou.is_closing_line))
  const moneyline = bettingLines.find(bl => bl.moneyline_odds?.some(ml => ml.is_opening_line))

  const spreadOpeningLine = openingSpread?.spread_lines?.find(sl => sl.is_opening_line)
  const spreadClosingLine = closingSpread?.spread_lines?.find(sl => sl.is_closing_line)
  const totalOpeningLine = openingTotal?.over_under_lines?.find(ou => ou.is_opening_line)
  const totalClosingLine = closingTotal?.over_under_lines?.find(ou => ou.is_closing_line)
  const mlOdds = moneyline?.moneyline_odds?.find(ml => ml.is_opening_line)

  // EPA data
  const homeEPA = epaData.find(e => e.team_id === game.home_team_id)
  const awayEPA = epaData.find(e => e.team_id === game.away_team_id)

  // Group scoring plays by quarter
  const scoringByQuarter = {
    '1': [],
    '2': [],
    '3': [],
    '4': []
  }
  scoringPlays.forEach(play => {
    if (scoringByQuarter[play.quarter]) {
      scoringByQuarter[play.quarter].push(play)
    }
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${game.away_team.full_name} @ ${game.home_team.full_name} - Week ${game.week} | Next Down Metrics</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* ═══════════════════════════════════════════════════════════════
           NEXT DOWN METRICS THEME
           Monochrome + Neon | HUD-Style | Data-First Design
           ═══════════════════════════════════════════════════════════════ */

        :root {
            --bg-primary: #0a0a0a;
            --bg-secondary: #141414;
            --bg-tertiary: #1a1a1a;
            --border-default: #2a2a2a;
            --border-accent: #3a3a3a;

            --text-primary: #ffffff;
            --text-secondary: #a0a0a0;
            --text-tertiary: #666666;

            --accent-green: #10b981;
            --accent-red: #ef4444;
            --accent-blue: #3b82f6;
            --accent-purple: #8b5cf6;
            --accent-amber: #f59e0b;

            --glow-green: rgba(16, 185, 129, 0.3);
            --glow-red: rgba(239, 68, 68, 0.3);
            --glow-blue: rgba(59, 130, 246, 0.3);
            --glow-purple: rgba(139, 92, 246, 0.3);

            --font-display: 'JetBrains Mono', monospace;
            --font-body: 'Space Grotesk', sans-serif;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: var(--bg-primary);
            color: var(--text-primary);
            font-family: var(--font-body);
            line-height: 1.6;
            overflow-x: hidden;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        /* ═══ HUD HEADER ═══ */
        .hud-header {
            background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
            border: 1px solid var(--border-accent);
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 24px;
            position: relative;
            overflow: hidden;
        }

        .hud-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg,
                var(--accent-green) 0%,
                var(--accent-blue) 50%,
                var(--accent-purple) 100%);
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }

        .meta-bar {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 24px;
            margin-bottom: 16px;
            font-family: var(--font-display);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--text-secondary);
        }

        .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .status-badge {
            background: var(--accent-green);
            color: var(--bg-primary);
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 10px;
            box-shadow: 0 0 12px var(--glow-green);
        }

        .header-title {
            text-align: center;
            font-size: 48px;
            font-weight: 700;
            font-family: var(--font-display);
            margin: 16px 0;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        /* ═══ SCOREBUG HUD ═══ */
        .scorebug {
            background: var(--bg-secondary);
            border: 1px solid var(--border-accent);
            border-radius: 16px;
            padding: 48px;
            margin-bottom: 24px;
            position: relative;
        }

        .scorebug::after {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 16px;
            padding: 1px;
            background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0.3;
            pointer-events: none;
        }

        .score-row {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            gap: 48px;
            margin-bottom: 32px;
        }

        .score-row:last-child {
            margin-bottom: 0;
        }

        .team-block {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .team-logo {
            width: 80px;
            height: 80px;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-accent);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            font-size: 24px;
            font-weight: 700;
            transition: all 0.3s ease;
        }

        .team-logo:hover {
            border-color: var(--accent-blue);
            box-shadow: 0 0 20px var(--glow-blue);
        }

        .team-info h2 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .team-record {
            font-family: var(--font-display);
            font-size: 14px;
            color: var(--text-secondary);
        }

        .score-display {
            font-family: var(--font-display);
            font-size: 72px;
            font-weight: 700;
            text-align: center;
            min-width: 120px;
            padding: 16px;
            background: var(--bg-tertiary);
            border-radius: 12px;
            border: 2px solid var(--border-accent);
        }

        .score-display.winner {
            color: var(--accent-green);
            border-color: var(--accent-green);
            box-shadow: 0 0 24px var(--glow-green);
        }

        /* ═══ QUARTER BREAKDOWN ═══ */
        .quarter-breakdown {
            margin-top: 32px;
            padding-top: 32px;
            border-top: 1px solid var(--border-accent);
        }

        .quarter-grid {
            display: grid;
            grid-template-columns: 2fr repeat(5, 1fr);
            gap: 12px;
            text-align: center;
            font-family: var(--font-display);
        }

        .quarter-header {
            padding: 12px;
            background: var(--bg-tertiary);
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .quarter-score {
            padding: 16px 12px;
            background: var(--bg-tertiary);
            border: 1px solid var(--border-default);
            border-radius: 8px;
            font-size: 20px;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .quarter-score:hover {
            background: var(--bg-secondary);
            border-color: var(--accent-blue);
        }

        .quarter-score.final {
            background: var(--accent-blue);
            color: var(--bg-primary);
            font-size: 24px;
            box-shadow: 0 0 16px var(--glow-blue);
        }

        /* ═══ INFO CARDS ═══ */
        .info-cards {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
        }

        .info-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-accent);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            transition: all 0.3s ease;
        }

        .info-card:hover {
            border-color: var(--accent-blue);
            transform: translateY(-2px);
            box-shadow: 0 4px 16px var(--glow-blue);
        }

        .info-label {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-tertiary);
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
        }

        .info-value {
            font-size: 20px;
            font-weight: 600;
            font-family: var(--font-display);
        }

        /* ═══ SECTION CONTAINERS ═══ */
        .section {
            background: var(--bg-secondary);
            border: 1px solid var(--border-accent);
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 24px;
        }

        .section-header {
            font-size: 24px;
            font-weight: 700;
            font-family: var(--font-display);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid var(--accent-blue);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .section-header::before {
            content: '▸';
            color: var(--accent-blue);
            font-size: 28px;
        }

        /* ═══ TABS ═══ */
        .tabs {
            display: flex;
            gap: 8px;
            margin-bottom: 24px;
            border-bottom: 2px solid var(--border-accent);
        }

        .tab {
            padding: 12px 24px;
            font-family: var(--font-display);
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            border-bottom: 3px solid transparent;
            margin-bottom: -2px;
            transition: all 0.2s ease;
        }

        .tab:hover {
            color: var(--text-primary);
            background: var(--bg-tertiary);
        }

        .tab.active {
            color: var(--accent-blue);
            border-bottom-color: var(--accent-blue);
            box-shadow: 0 -2px 8px var(--glow-blue);
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        /* ═══ TABLES ═══ */
        .data-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-family: var(--font-display);
            margin-bottom: 32px;
        }

        .data-table thead {
            background: var(--bg-tertiary);
        }

        .data-table th {
            padding: 16px 12px;
            text-align: left;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-tertiary);
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid var(--border-accent);
        }

        .data-table th:first-child {
            border-radius: 8px 0 0 0;
        }

        .data-table th:last-child {
            border-radius: 0 8px 0 0;
        }

        .data-table td {
            padding: 16px 12px;
            border-bottom: 1px solid var(--border-default);
            font-size: 14px;
        }

        .data-table tbody tr {
            transition: all 0.2s ease;
        }

        .data-table tbody tr:hover {
            background: var(--bg-tertiary);
        }

        .data-table tbody tr:last-child td {
            border-bottom: none;
        }

        .player-name {
            font-weight: 600;
            color: var(--text-primary);
        }

        .team-abbr {
            display: inline-block;
            padding: 2px 6px;
            background: var(--bg-tertiary);
            border-radius: 4px;
            font-size: 10px;
            color: var(--text-secondary);
            margin-left: 8px;
        }

        .stat-highlight {
            color: var(--accent-green);
            font-weight: 600;
        }

        /* ═══ TWO COLUMN LAYOUT ═══ */
        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
        }

        .column-block {
            background: var(--bg-tertiary);
            border: 1px solid var(--border-default);
            border-radius: 8px;
            padding: 24px;
        }

        .column-header {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 16px;
            color: var(--accent-blue);
        }

        /* ═══ SCORING PLAYS ═══ */
        .scoring-play {
            padding: 16px;
            background: var(--bg-tertiary);
            border-left: 3px solid var(--accent-green);
            border-radius: 4px;
            margin-bottom: 12px;
        }

        .play-time {
            font-size: 12px;
            font-weight: 700;
            color: var(--accent-blue);
            margin-bottom: 4px;
        }

        .play-description {
            font-size: 14px;
            margin-bottom: 8px;
        }

        .play-meta {
            font-size: 11px;
            color: var(--text-tertiary);
            display: flex;
            justify-content: space-between;
        }

        /* ═══ BETTING CARDS ═══ */
        .betting-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
        }

        .betting-card {
            background: var(--bg-tertiary);
            border: 1px solid var(--border-default);
            border-radius: 8px;
            padding: 20px;
        }

        .betting-title {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-tertiary);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }

        .betting-value {
            font-size: 18px;
            font-weight: 600;
            font-family: var(--font-display);
            margin-bottom: 4px;
        }

        .betting-result {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            margin-top: 8px;
        }

        .result-win {
            background: var(--accent-green);
            color: var(--bg-primary);
        }

        .result-loss {
            background: var(--accent-red);
            color: var(--bg-primary);
        }

        /* ═══ EPA BARS ═══ */
        .epa-metric {
            margin-bottom: 20px;
        }

        .epa-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 8px;
            text-transform: uppercase;
        }

        .epa-bar-container {
            height: 40px;
            background: var(--bg-tertiary);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
        }

        .epa-bar {
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            font-size: 14px;
            font-weight: 700;
            transition: all 0.3s ease;
        }

        .epa-bar.positive {
            background: var(--accent-green);
            color: var(--bg-primary);
        }

        .epa-bar.negative {
            background: var(--accent-red);
            color: var(--bg-primary);
        }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 1024px) {
            .two-column {
                grid-template-columns: 1fr;
            }

            .betting-grid {
                grid-template-columns: 1fr;
            }

            .info-cards {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .container {
                padding: 12px;
            }

            .hud-header {
                padding: 20px;
            }

            .header-title {
                font-size: 28px;
            }

            .scorebug {
                padding: 24px;
            }

            .score-row {
                grid-template-columns: 1fr;
                gap: 24px;
            }

            .score-display {
                font-size: 48px;
            }

            .quarter-grid {
                grid-template-columns: 1fr;
            }

            .data-table {
                font-size: 12px;
            }

            .data-table th,
            .data-table td {
                padding: 8px 6px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HUD HEADER -->
        <div class="hud-header">
            <div class="meta-bar">
                <div class="meta-item">WEEK ${game.week}</div>
                <div class="meta-item">•</div>
                <div class="meta-item">${formattedDate}</div>
                <div class="meta-item">•</div>
                <div class="meta-item">${game.game_time || 'TBD'}</div>
                <div class="meta-item">•</div>
                <div class="meta-item">${game.broadcast_network || 'TBD'}</div>
                <div class="meta-item">•</div>
                <div class="status-badge">${game.status || 'FINAL'}</div>
            </div>
            <h1 class="header-title">${game.away_team.full_name} @ ${game.home_team.full_name}</h1>
        </div>

        <!-- SCOREBUG -->
        <div class="scorebug">
            <div class="score-row">
                <div class="team-block">
                    <div class="team-logo">${game.away_team.abbreviation}</div>
                    <div class="team-info">
                        <h2>${game.away_team.full_name}</h2>
                        <div class="team-record">${awayRecordBefore} → ${awayRecordAfter} • Away</div>
                    </div>
                </div>
                <div class="score-display ${!homeWon ? 'winner' : ''}">${game.away_score}</div>
            </div>

            <div class="score-row">
                <div class="team-block">
                    <div class="team-logo">${game.home_team.abbreviation}</div>
                    <div class="team-info">
                        <h2>${game.home_team.full_name}</h2>
                        <div class="team-record">${homeRecordBefore} → ${homeRecordAfter} • Home</div>
                    </div>
                </div>
                <div class="score-display ${homeWon ? 'winner' : ''}">${game.home_score}</div>
            </div>

            <!-- QUARTER BREAKDOWN -->
            <div class="quarter-breakdown">
                <div class="quarter-grid">
                    <div class="quarter-header">Team</div>
                    <div class="quarter-header">Q1</div>
                    <div class="quarter-header">Q2</div>
                    <div class="quarter-header">Q3</div>
                    <div class="quarter-header">Q4</div>
                    <div class="quarter-header">Final</div>

                    <div class="quarter-header">${game.away_team.abbreviation}</div>
                    <div class="quarter-score">${game.away_q1_score || 0}</div>
                    <div class="quarter-score">${game.away_q2_score || 0}</div>
                    <div class="quarter-score">${game.away_q3_score || 0}</div>
                    <div class="quarter-score">${game.away_q4_score || 0}</div>
                    <div class="quarter-score final">${game.away_score}</div>

                    <div class="quarter-header">${game.home_team.abbreviation}</div>
                    <div class="quarter-score">${game.home_q1_score || 0}</div>
                    <div class="quarter-score">${game.home_q2_score || 0}</div>
                    <div class="quarter-score">${game.home_q3_score || 0}</div>
                    <div class="quarter-score">${game.home_q4_score || 0}</div>
                    <div class="quarter-score final">${game.home_score}</div>
                </div>
            </div>
        </div>

        <!-- INFO CARDS -->
        <div class="info-cards">
            <div class="info-card">
                <div class="info-label">Venue</div>
                <div class="info-value">${game.venue?.stadium_name || 'N/A'}</div>
            </div>
            <div class="info-card">
                <div class="info-label">Weather</div>
                <div class="info-value">${weatherDisplay}</div>
            </div>
            <div class="info-card">
                <div class="info-label">Attendance</div>
                <div class="info-value">${game.attendance?.toLocaleString() || 'N/A'}</div>
            </div>
        </div>

        <!-- SEASON CONTEXT -->
        <div class="section">
            <h3 class="section-header">Season Context & Standings</h3>
            <div class="two-column">
                <div class="column-block">
                    <div class="column-header">${game.home_team.full_name}</div>
                    <p><strong>Division:</strong> ${homeStats?.division_rank || 'N/A'}${homeStats?.division_rank ? ['st', 'nd', 'rd', 'th'][Math.min(homeStats.division_rank - 1, 3)] : ''} in ${game.home_team.division}</p>
                    <p><strong>Conference:</strong> ${homeStats?.conference_rank || 'N/A'}${homeStats?.conference_rank ? ['st', 'nd', 'rd', 'th'][Math.min(homeStats.conference_rank - 1, 3)] : ''} in ${game.home_team.conference}</p>
                    <p><strong>Record:</strong> ${homeRecordAfter} (${homeStats?.home_wins || 0}-${homeStats?.home_losses || 0} Home)</p>
                    <p><strong>Division Record:</strong> ${homeStats?.division_wins || 0}-${homeStats?.division_losses || 0}</p>
                    <p><strong>Playoff Probability:</strong> ${homeStats?.playoff_probability ? (homeStats.playoff_probability * 100).toFixed(1) + '%' : 'N/A'}</p>
                </div>
                <div class="column-block">
                    <div class="column-header">${game.away_team.full_name}</div>
                    <p><strong>Division:</strong> ${awayStats?.division_rank || 'N/A'}${awayStats?.division_rank ? ['st', 'nd', 'rd', 'th'][Math.min(awayStats.division_rank - 1, 3)] : ''} in ${game.away_team.division}</p>
                    <p><strong>Conference:</strong> ${awayStats?.conference_rank || 'N/A'}${awayStats?.conference_rank ? ['st', 'nd', 'rd', 'th'][Math.min(awayStats.conference_rank - 1, 3)] : ''} in ${game.away_team.conference}</p>
                    <p><strong>Record:</strong> ${awayRecordAfter} (${awayStats?.away_wins || 0}-${awayStats?.away_losses || 0} Away)</p>
                    <p><strong>Division Record:</strong> ${awayStats?.division_wins || 0}-${awayStats?.division_losses || 0}</p>
                    <p><strong>Playoff Probability:</strong> ${awayStats?.playoff_probability ? (awayStats.playoff_probability * 100).toFixed(1) + '%' : 'N/A'}</p>
                </div>
            </div>
        </div>

        ${bettingLines.length > 0 ? `
        <!-- BETTING RESULTS -->
        <div class="section">
            <h3 class="section-header">Betting Results</h3>
            <div class="betting-grid">
                ${spreadOpeningLine ? `
                <div class="betting-card">
                    <div class="betting-title">Spread</div>
                    <div class="betting-value">Opening: ${game.home_team.abbreviation} ${spreadOpeningLine.home_spread > 0 ? '+' : ''}${spreadOpeningLine.home_spread}</div>
                    ${spreadClosingLine ? `<div class="betting-value">Closing: ${game.home_team.abbreviation} ${spreadClosingLine.home_spread > 0 ? '+' : ''}${spreadClosingLine.home_spread}</div>` : ''}
                    <div class="betting-value">Actual: ${homeWon ? game.home_team.abbreviation : game.away_team.abbreviation} +${Math.abs(game.home_score - game.away_score)}</div>
                </div>
                ` : ''}

                ${totalOpeningLine ? `
                <div class="betting-card">
                    <div class="betting-title">Total (O/U)</div>
                    <div class="betting-value">Opening: ${totalOpeningLine.over_under}</div>
                    ${totalClosingLine ? `<div class="betting-value">Closing: ${totalClosingLine.over_under}</div>` : ''}
                    <div class="betting-value">Actual: ${game.home_score + game.away_score}</div>
                    ${totalOpeningLine ? `<div class="betting-result ${(game.home_score + game.away_score) > totalOpeningLine.over_under ? 'result-win' : 'result-loss'}">${(game.home_score + game.away_score) > totalOpeningLine.over_under ? 'OVER' : 'UNDER'}</div>` : ''}
                </div>
                ` : ''}

                ${mlOdds ? `
                <div class="betting-card">
                    <div class="betting-title">Moneyline</div>
                    <div class="betting-value">${game.home_team.abbreviation}: ${mlOdds.home_moneyline > 0 ? '+' : ''}${mlOdds.home_moneyline}</div>
                    <div class="betting-value">${game.away_team.abbreviation}: ${mlOdds.away_moneyline > 0 ? '+' : ''}${mlOdds.away_moneyline}</div>
                    <div class="betting-result result-win">Winner: ${homeWon ? game.home_team.abbreviation : game.away_team.abbreviation}</div>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}

        <!-- PLAYER STATISTICS -->
        <div class="section">
            <h3 class="section-header">Player Statistics</h3>

            <div class="tabs">
                <button class="tab active" onclick="showTab('passing')">Passing</button>
                <button class="tab" onclick="showTab('rushing')">Rushing</button>
                <button class="tab" onclick="showTab('receiving')">Receiving</button>
                <button class="tab" onclick="showTab('defense')">Defense</button>
            </div>

            <!-- PASSING -->
            <div id="passing" class="tab-content active">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>C/ATT</th>
                            <th>YDS</th>
                            <th>TD</th>
                            <th>INT</th>
                            <th>RTG</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${passingStats.map(stat => `
                        <tr>
                            <td>
                                <span class="player-name">${stat.player.full_name}</span>
                                <span class="team-abbr">${stat.player.team_id}</span>
                            </td>
                            <td>${stat.passing_completions || 0}/${stat.passing_attempts || 0}</td>
                            <td class="stat-highlight">${stat.passing_yards || 0}</td>
                            <td>${stat.passing_touchdowns || 0}</td>
                            <td>${stat.passing_interceptions || 0}</td>
                            <td>${stat.passer_rating ? stat.passer_rating.toFixed(1) : '--'}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- RUSHING -->
            <div id="rushing" class="tab-content">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>CAR</th>
                            <th>YDS</th>
                            <th>AVG</th>
                            <th>TD</th>
                            <th>LONG</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rushingStats.map(stat => `
                        <tr>
                            <td>
                                <span class="player-name">${stat.player.full_name}</span>
                                <span class="team-abbr">${stat.player.team_id}</span>
                            </td>
                            <td>${stat.rushing_attempts || 0}</td>
                            <td class="stat-highlight">${stat.rushing_yards || 0}</td>
                            <td>${stat.rushing_attempts > 0 ? (stat.rushing_yards / stat.rushing_attempts).toFixed(1) : '--'}</td>
                            <td>${stat.rushing_touchdowns || 0}</td>
                            <td>${stat.rushing_long || 0}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- RECEIVING -->
            <div id="receiving" class="tab-content">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>REC</th>
                            <th>TGT</th>
                            <th>YDS</th>
                            <th>AVG</th>
                            <th>TD</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${receivingStats.map(stat => `
                        <tr>
                            <td>
                                <span class="player-name">${stat.player.full_name}</span>
                                <span class="team-abbr">${stat.player.team_id}</span>
                            </td>
                            <td>${stat.receptions || 0}</td>
                            <td>${stat.targets || 0}</td>
                            <td class="stat-highlight">${stat.receiving_yards || 0}</td>
                            <td>${stat.receptions > 0 ? (stat.receiving_yards / stat.receptions).toFixed(1) : '--'}</td>
                            <td>${stat.receiving_touchdowns || 0}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- DEFENSE -->
            <div id="defense" class="tab-content">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>TOT</th>
                            <th>SOLO</th>
                            <th>ASST</th>
                            <th>SACKS</th>
                            <th>TFL</th>
                            <th>INT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${defenseStats.map(stat => `
                        <tr>
                            <td>
                                <span class="player-name">${stat.player.full_name}</span>
                                <span class="team-abbr">${stat.player.team_id}</span>
                            </td>
                            <td class="stat-highlight">${stat.total_tackles || 0}</td>
                            <td>${stat.solo_tackles || 0}</td>
                            <td>${stat.assisted_tackles || 0}</td>
                            <td>${stat.sacks || 0}</td>
                            <td>${stat.tackles_for_loss || 0}</td>
                            <td>${stat.interceptions || 0}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        ${scoringPlays.length > 0 ? `
        <!-- SCORING SUMMARY -->
        <div class="section">
            <h3 class="section-header">Scoring Summary</h3>
            ${['1', '2', '3', '4'].map(quarter => {
              const plays = scoringByQuarter[quarter] || []
              if (plays.length === 0) return ''

              return `
                <div style="margin-bottom: 32px;">
                    <h4 style="color: var(--accent-blue); margin-bottom: 16px; font-family: var(--font-display);">${['1st', '2nd', '3rd', '4th'][parseInt(quarter) - 1]} Quarter</h4>
                    ${plays.map(play => `
                        <div class="scoring-play">
                            <div class="play-time">${play.time_remaining_seconds ? formatTime(play.time_remaining_seconds) : 'Unknown'}</div>
                            <div class="play-description">${play.description || 'N/A'}</div>
                            <div class="play-meta">
                                <span>${play.scoring_team_id || 'Unknown'} scores</span>
                                <span>Score: ${play.away_score || 0}-${play.home_score || 0}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
              `
            }).join('')}
        </div>
        ` : ''}

        ${epaData.length > 0 ? `
        <!-- ADVANCED ANALYTICS -->
        <div class="section">
            <h3 class="section-header">Advanced Analytics (EPA)</h3>
            <div class="two-column">
                <div class="column-block">
                    <div class="column-header">${game.home_team.full_name}</div>
                    ${homeEPA ? `
                        <p><strong>Total EPA:</strong> ${homeEPA.total_epa ? homeEPA.total_epa.toFixed(2) : 'N/A'}</p>
                        <p><strong>Passing EPA:</strong> ${homeEPA.passing_epa ? homeEPA.passing_epa.toFixed(2) : 'N/A'}</p>
                        <p><strong>Rushing EPA:</strong> ${homeEPA.rushing_epa ? homeEPA.rushing_epa.toFixed(2) : 'N/A'}</p>
                        <p><strong>Success Rate:</strong> ${homeEPA.success_rate ? (homeEPA.success_rate * 100).toFixed(1) + '%' : 'N/A'}</p>
                    ` : '<p>No EPA data available</p>'}
                </div>
                <div class="column-block">
                    <div class="column-header">${game.away_team.full_name}</div>
                    ${awayEPA ? `
                        <p><strong>Total EPA:</strong> ${awayEPA.total_epa ? awayEPA.total_epa.toFixed(2) : 'N/A'}</p>
                        <p><strong>Passing EPA:</strong> ${awayEPA.passing_epa ? awayEPA.passing_epa.toFixed(2) : 'N/A'}</p>
                        <p><strong>Rushing EPA:</strong> ${awayEPA.rushing_epa ? awayEPA.rushing_epa.toFixed(2) : 'N/A'}</p>
                        <p><strong>Success Rate:</strong> ${awayEPA.success_rate ? (awayEPA.success_rate * 100).toFixed(1) + '%' : 'N/A'}</p>
                    ` : '<p>No EPA data available</p>'}
                </div>
            </div>
        </div>
        ` : ''}
    </div>

    <script>
        function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active')
            })

            // Remove active from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active')
            })

            // Show selected tab content
            document.getElementById(tabName).classList.add('active')

            // Mark clicked tab as active
            event.target.classList.add('active')
        }
    </script>
</body>
</html>`
}

/**
 * Main function
 */
async function main() {
  const supabase = getSupabaseClient()

  logger.info('')
  logger.info('═══════════════════════════════════════════════════════════════')
  logger.info('GENERATE DEMO GAME PAGE WITH NEXT DOWN METRICS THEME')
  logger.info('═══════════════════════════════════════════════════════════════')
  logger.info('')

  // Use Week 7 Thursday Night game (Browns vs Bengals on Prime)
  let { data: selectedGame } = await supabase
    .from('games')
    .select('game_id, home_team_id, away_team_id, home_score, away_score, week, status, broadcast_network')
    .eq('season', SEASON)
    .eq('week', 7)
    .or('home_team_id.eq.CIN,away_team_id.eq.CIN')
    .not('home_score', 'is', null)
    .not('away_score', 'is', null)
    .single()

  if (!selectedGame) {
    logger.error('❌ Week 7 Thursday Night game not found in database')
    // Fallback: just get any week 7 game with scores
    logger.info('Trying to find any Week 7 game with scores...')
    const { data: fallbackGame } = await supabase
      .from('games')
      .select('game_id, home_team_id, away_team_id, home_score, away_score, week, status, broadcast_network')
      .eq('season', SEASON)
      .eq('week', 7)
      .not('home_score', 'is', null)
      .not('away_score', 'is', null)
      .limit(1)
      .single()

    if (!fallbackGame) {
      logger.error('❌ No Week 7 games with scores found')
      return
    }

    selectedGame = fallbackGame
    logger.info(`✓ Selected fallback game: ${selectedGame.game_id} (Week ${selectedGame.week})`)
    logger.info(`   Teams: ${selectedGame.away_team_id} @ ${selectedGame.home_team_id}`)
  } else {
    logger.info(`✓ Selected game: ${selectedGame.game_id} (Week ${selectedGame.week})`)
    logger.info(`   Teams: ${selectedGame.away_team_id} @ ${selectedGame.home_team_id}`)
  }

  const gameId = selectedGame.game_id

  // Fetch all data
  const data = await fetchGameData(gameId)
  logger.info(`✓ Fetched game data:`)
  logger.info(`  - Player stats: ${data.playerStats.length} records`)
  logger.info(`  - Scoring plays: ${data.scoringPlays.length} plays`)
  logger.info(`  - Betting lines: ${data.bettingLines.length} bookmakers`)
  logger.info(`  - EPA data: ${data.epaData.length} teams`)

  // Generate HTML
  const html = generateHTML(data)

  // Write to file
  const outputPath = path.join(__dirname, '..', 'demo-game-page-with-players.html')
  fs.writeFileSync(outputPath, html, 'utf-8')

  logger.info('')
  logger.info(`✅ Generated: demo-game-page-with-players.html`)
  logger.info(`   Game: ${data.game.away_team.full_name} @ ${data.game.home_team.full_name}`)
  logger.info(`   Score: ${data.game.away_score}-${data.game.home_score}`)
  logger.info(`   Theme: Next Down Metrics (Monochrome + Neon HUD)`)
  logger.info('')
  logger.info('═══════════════════════════════════════════════════════════════')
}

main().catch(error => {
  logger.error('\n❌ ERROR:', error.message)
  logger.error('Stack:', error.stack)
  process.exit(1)
})
