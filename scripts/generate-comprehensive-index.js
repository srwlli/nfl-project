import { getSupabaseClient } from './utils/supabase-client.js'
import fs from 'fs'

const supabase = getSupabaseClient()

console.log('Generating comprehensive data showcase index.html...')

// ============================================================================
// FETCH ALL DATA FROM ALL SCRAPERS
// ============================================================================

// 1. STANDINGS SCRAPER DATA
const { data: teamStandings } = await supabase
  .from('team_season_stats')
  .select('*')
  .eq('season', 2025)
  .order('conference_rank', { ascending: true })
  .limit(8)

// 2. GAME STATS SCRAPER DATA (with quarter scores and weather)
const { data: recentGamesWithQuarters } = await supabase
  .from('games')
  .select('*')
  .eq('season', 2025)
  .eq('status', 'final')
  .not('home_q1_score', 'is', null)
  .order('game_date', { ascending: false })
  .limit(5)

// 3. WEATHER DATA
const { data: gameWeather } = await supabase
  .from('game_weather')
  .select(`
    *,
    games!inner(game_id, home_team_id, away_team_id, game_date)
  `)
  .order('games(game_date)', { ascending: false })
  .limit(5)

// 4. PLAYER GAME STATS (Enhanced)
const { data: topPassers } = await supabase
  .from('player_game_stats')
  .select(`
    player_id,
    team_id,
    passing_yards,
    passing_touchdowns,
    passing_interceptions,
    passing_completions,
    passing_attempts,
    players!inner(full_name)
  `)
  .eq('season', 2025)
  .gt('passing_attempts', 15)
  .order('passing_yards', { ascending: false })
  .limit(5)

const { data: topRushers } = await supabase
  .from('player_game_stats')
  .select(`
    player_id,
    team_id,
    rushing_yards,
    rushing_attempts,
    rushing_touchdowns,
    players!inner(full_name)
  `)
  .eq('season', 2025)
  .gt('rushing_attempts', 10)
  .order('rushing_yards', { ascending: false })
  .limit(5)

const { data: topReceivers } = await supabase
  .from('player_game_stats')
  .select(`
    player_id,
    team_id,
    receptions,
    receiving_yards,
    receiving_touchdowns,
    players!inner(full_name)
  `)
  .eq('season', 2025)
  .gt('receptions', 5)
  .order('receiving_yards', { ascending: false })
  .limit(5)

// 5. INJURIES SCRAPER DATA
const { data: recentInjuries } = await supabase
  .from('player_injury_status')
  .select(`
    player_id,
    injury_status,
    injury_description,
    updated_at,
    players!inner(full_name, team_id)
  `)
  .eq('season', 2025)
  .order('updated_at', { ascending: false })
  .limit(8)

// 6. ROSTER TRANSACTIONS
const { data: recentTransactions } = await supabase
  .from('roster_transactions')
  .select(`
    transaction_type,
    transaction_date,
    details,
    players!inner(full_name),
    teams!inner(abbreviation, name)
  `)
  .order('transaction_date', { ascending: false })
  .limit(8)

// 7. SCORING PLAYS
const { data: recentScores } = await supabase
  .from('scoring_plays')
  .select('*')
  .eq('season', 2025)
  .order('game_id', { ascending: false })
  .limit(10)

// 8. LIVE GAMES SCRAPER - Current week games
const { data: liveGames } = await supabase
  .from('games')
  .select('*')
  .eq('season', 2025)
  .in('status', ['in_progress', 'scheduled'])
  .order('game_date', { ascending: true })
  .limit(6)

// 9. BETTING DATA (if available)
const { data: bettingLines } = await supabase
  .from('spread_lines')
  .select(`
    *,
    game_betting_lines!inner(game_id)
  `)
  .order('line_timestamp', { ascending: false })
  .limit(6)

// 10. ADVANCED ANALYTICS (EPA data from play_by_play)
const { data: topEpaPlays } = await supabase
  .from('play_by_play')
  .select('*')
  .eq('season', 2025)
  .not('epa', 'is', null)
  .order('epa', { ascending: false })
  .limit(10)

// Count totals
const { count: playerCount } = await supabase
  .from('players')
  .select('*', { count: 'exact', head: true })

const { count: gameCount } = await supabase
  .from('games')
  .select('*', { count: 'exact', head: true })
  .eq('season', 2025)

const { count: completedCount } = await supabase
  .from('games')
  .select('*', { count: 'exact', head: true })
  .eq('season', 2025)
  .eq('status', 'final')

const { count: injuryCount } = await supabase
  .from('player_injury_status')
  .select('*', { count: 'exact', head: true })
  .eq('season', 2025)

const { count: transactionCount } = await supabase
  .from('roster_transactions')
  .select('*', { count: 'exact', head: true })

const { count: scoringPlayCount } = await supabase
  .from('scoring_plays')
  .select('*', { count: 'exact', head: true })
  .eq('season', 2025)

const { count: playerStatsCount } = await supabase
  .from('player_game_stats')
  .select('*', { count: 'exact', head: true })
  .eq('season', 2025)

const { count: weatherCount } = await supabase
  .from('game_weather')
  .select('*', { count: 'exact', head: true })

const { count: bettingCount } = await supabase
  .from('game_betting_lines')
  .select('*', { count: 'exact', head: true })

const { count: playByPlayCount } = await supabase
  .from('play_by_play')
  .select('*', { count: 'exact', head: true })
  .eq('season', 2025)

console.log('Data fetched:')
console.log(`  Teams: ${teamStandings?.length || 0}`)
console.log(`  Players: ${playerCount || 0}`)
console.log(`  Games: ${completedCount}/${gameCount}`)
console.log(`  Injuries: ${injuryCount || 0}`)
console.log(`  Transactions: ${transactionCount || 0}`)
console.log(`  Scoring Plays: ${scoringPlayCount || 0}`)
console.log(`  Player Stats: ${playerStatsCount || 0}`)
console.log(`  Weather Records: ${weatherCount || 0}`)
console.log(`  Betting Lines: ${bettingCount || 0}`)
console.log(`  Play-by-Play: ${playByPlayCount || 0}`)

// ============================================================================
// GENERATE HTML
// ============================================================================

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFL Stats Platform - Comprehensive Data Showcase</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-dark: #0a0a0f;
            --bg-card: #12121a;
            --bg-hover: #1a1a28;
            --text-primary: #e4e4e7;
            --text-secondary: #71717a;
            --accent-green: #10b981;
            --accent-blue: #3b82f6;
            --accent-purple: #a855f7;
            --accent-red: #ef4444;
            --accent-yellow: #f59e0b;
            --border: rgba(255, 255, 255, 0.1);
            --glow-green: rgba(16, 185, 129, 0.3);
            --glow-blue: rgba(59, 130, 246, 0.3);
        }

        body {
            font-family: 'Space Grotesk', sans-serif;
            background: var(--bg-dark);
            color: var(--text-primary);
            line-height: 1.6;
            padding: 20px;
        }

        .mono {
            font-family: 'JetBrains Mono', monospace;
        }

        .container {
            max-width: 1600px;
            margin: 0 auto;
        }

        /* HUD Header */
        .hud-header {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 40px;
            margin-bottom: 30px;
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
            background: linear-gradient(90deg, var(--accent-green), var(--accent-blue), var(--accent-purple));
            animation: shimmer 3s linear infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .logo {
            font-size: 32px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .status-badge {
            background: var(--accent-green);
            color: var(--bg-dark);
            padding: 6px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            box-shadow: 0 0 20px var(--glow-green);
            animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .header-title {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 10px;
            background: linear-gradient(135deg, var(--accent-green), var(--accent-blue));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header-subtitle {
            color: var(--text-secondary);
            font-size: 18px;
        }

        /* Metrics Grid */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .metric-card:hover {
            border-color: var(--accent-green);
            box-shadow: 0 0 30px var(--glow-green);
            transform: translateY(-5px);
        }

        .metric-value {
            font-size: 36px;
            font-weight: 700;
            color: var(--accent-green);
            font-family: 'JetBrains Mono', monospace;
            line-height: 1;
            margin-bottom: 8px;
        }

        .metric-label {
            color: var(--text-secondary);
            font-size: 11px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }

        .metric-change {
            font-size: 12px;
            color: var(--accent-green);
            margin-top: 6px;
        }

        /* Data Section */
        .data-section {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
        }

        .section-title {
            font-size: 24px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .section-badge {
            background: var(--bg-hover);
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            border: 1px solid;
            letter-spacing: 1px;
        }

        .badge-green {
            color: var(--accent-green);
            border-color: var(--accent-green);
            box-shadow: 0 0 10px var(--glow-green);
        }

        .badge-blue {
            color: var(--accent-blue);
            border-color: var(--accent-blue);
            box-shadow: 0 0 10px var(--glow-blue);
        }

        .badge-purple {
            color: var(--accent-purple);
            border-color: var(--accent-purple);
        }

        .badge-yellow {
            color: var(--accent-yellow);
            border-color: var(--accent-yellow);
        }

        .badge-red {
            color: var(--accent-red);
            border-color: var(--accent-red);
        }

        /* Table Styles */
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 8px;
        }

        thead th {
            color: var(--text-secondary);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-align: left;
            padding-bottom: 16px;
        }

        tbody tr {
            background: var(--bg-hover);
            transition: all 0.2s ease;
        }

        tbody tr:hover {
            background: rgba(16, 185, 129, 0.1);
            transform: translateX(5px);
        }

        tbody td {
            padding: 14px;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
            font-size: 14px;
        }

        tbody td:first-child {
            border-left: 1px solid var(--border);
            border-radius: 8px 0 0 8px;
        }

        tbody td:last-child {
            border-right: 1px solid var(--border);
            border-radius: 0 8px 8px 0;
        }

        .rank {
            font-family: 'JetBrains Mono', monospace;
            color: var(--accent-green);
            font-weight: 700;
            font-size: 16px;
        }

        .team-name {
            font-weight: 600;
            color: var(--text-primary);
        }

        .stat-value {
            font-family: 'JetBrains Mono', monospace;
            color: var(--accent-blue);
            font-weight: 500;
        }

        .stat-small {
            font-size: 12px;
            color: var(--text-secondary);
        }

        /* Grid Layout */
        .data-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }

        @media (max-width: 1100px) {
            .data-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Accent Lines */
        .accent-line {
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--accent-green), transparent);
            margin: 40px 0;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-secondary);
            font-size: 14px;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin-top: 20px;
        }

        .footer-link {
            color: var(--accent-green);
            text-decoration: none;
            transition: color 0.2s;
        }

        .footer-link:hover {
            color: var(--accent-blue);
            text-decoration: underline;
        }

        /* Scraper Tags */
        .scraper-tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
            margin-left: 8px;
            letter-spacing: 0.5px;
        }

        .tag-standings { background: rgba(16, 185, 129, 0.2); color: var(--accent-green); }
        .tag-game-stats { background: rgba(59, 130, 246, 0.2); color: var(--accent-blue); }
        .tag-injuries { background: rgba(239, 68, 68, 0.2); color: var(--accent-red); }
        .tag-roster { background: rgba(168, 85, 247, 0.2); color: var(--accent-purple); }
        .tag-live { background: rgba(245, 158, 11, 0.2); color: var(--accent-yellow); }
        .tag-betting { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        .tag-analytics { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
    </style>
</head>
<body>
    <div class="container">
        <!-- HUD Header -->
        <div class="hud-header">
            <div class="header-top">
                <div class="logo">
                    <span>🏈</span>
                    <span>NFL STATS PLATFORM</span>
                </div>
                <div class="status-badge mono">● LIVE DATA</div>
            </div>
            <h1 class="header-title">COMPREHENSIVE DATA SHOWCASE</h1>
            <p class="header-subtitle">All 8 Scrapers • Live Database • 2025-26 Season • Week 7</p>
        </div>

        <!-- Metrics Overview -->
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${playerCount || 2637}</div>
                <div class="metric-label">Players</div>
                <div class="metric-change">↑ Real-time</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${completedCount || 0}</div>
                <div class="metric-label">Games Done</div>
                <div class="metric-change">/ ${gameCount || 272} Total</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${injuryCount || 0}</div>
                <div class="metric-label">Injuries</div>
                <div class="metric-change">↑ Daily 6 AM</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${transactionCount || 0}</div>
                <div class="metric-label">Transactions</div>
                <div class="metric-change">↑ Daily 5 PM</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${scoringPlayCount || 0}</div>
                <div class="metric-label">Scores</div>
                <div class="metric-change">↑ Post-Game</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${playerStatsCount || 0}</div>
                <div class="metric-label">Player Stats</div>
                <div class="metric-change">↑ Per Game</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${weatherCount || 0}</div>
                <div class="metric-label">Weather</div>
                <div class="metric-change">↑ Per Game</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${bettingCount || 0}</div>
                <div class="metric-label">Betting Lines</div>
                <div class="metric-change">↑ Daily 10 AM</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${playByPlayCount ? Math.floor(playByPlayCount / 1000) + 'k' : '0'}</div>
                <div class="metric-label">PBP Plays</div>
                <div class="metric-change">↑ Weekly Tue</div>
            </div>
        </div>

        <div class="accent-line"></div>

        <!-- STANDINGS SCRAPER -->
        <div class="data-section">
            <div class="section-header">
                <h2 class="section-title">
                    <span>📊</span>
                    <span>CONFERENCE STANDINGS</span>
                    <span class="scraper-tag tag-standings mono">STANDINGS-SCRAPER</span>
                </h2>
                <span class="section-badge badge-green mono">DAILY 7 AM</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>RANK</th>
                        <th>TEAM</th>
                        <th>W-L-T</th>
                        <th>PCT</th>
                        <th>PF</th>
                        <th>PA</th>
                        <th>DIFF</th>
                        <th>DIV</th>
                    </tr>
                </thead>
                <tbody>
                    ${teamStandings?.slice(0, 8).map(team => `
                        <tr>
                            <td class="rank">#${team.conference_rank}</td>
                            <td class="team-name">${team.team_id}</td>
                            <td class="stat-value">${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}</td>
                            <td class="stat-value">${team.win_percentage.toFixed(3)}</td>
                            <td class="stat-value">${team.points_for}</td>
                            <td class="stat-value">${team.points_against}</td>
                            <td class="stat-value" style="color: ${team.point_differential > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${team.point_differential > 0 ? '+' : ''}${team.point_differential}</td>
                            <td class="stat-value">${team.division_rank}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="8">No standings data available</td></tr>'}
                </tbody>
            </table>
        </div>

        <!-- GAME STATS SCRAPER - Quarter Scores & Weather -->
        <div class="data-grid">
            <div class="data-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <span>🎯</span>
                        <span>QUARTER SCORES</span>
                        <span class="scraper-tag tag-game-stats mono">GAME-STATS</span>
                    </h2>
                    <span class="section-badge badge-blue mono">POST-GAME</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>GAME</th>
                            <th>Q1</th>
                            <th>Q2</th>
                            <th>Q3</th>
                            <th>Q4</th>
                            <th>FINAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentGamesWithQuarters?.slice(0, 5).map(game => `
                            <tr>
                                <td class="team-name stat-small">${game.away_team_id} @ ${game.home_team_id}</td>
                                <td class="stat-value mono">${game.away_q1_score}-${game.home_q1_score}</td>
                                <td class="stat-value mono">${game.away_q2_score}-${game.home_q2_score}</td>
                                <td class="stat-value mono">${game.away_q3_score}-${game.home_q3_score}</td>
                                <td class="stat-value mono">${game.away_q4_score}-${game.home_q4_score}</td>
                                <td class="stat-value mono" style="font-weight: 700;">${game.away_score}-${game.home_score}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="6">No quarter score data available</td></tr>'}
                    </tbody>
                </table>
            </div>

            <div class="data-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <span>🌤️</span>
                        <span>GAME WEATHER</span>
                        <span class="scraper-tag tag-game-stats mono">GAME-STATS</span>
                    </h2>
                    <span class="section-badge badge-blue mono">POST-GAME</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>GAME</th>
                            <th>TEMP</th>
                            <th>WIND</th>
                            <th>CONDITIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gameWeather?.slice(0, 5).map(w => `
                            <tr>
                                <td class="team-name stat-small">${w.games.away_team_id} @ ${w.games.home_team_id}</td>
                                <td class="stat-value mono">${w.temperature_fahrenheit ? w.temperature_fahrenheit + '°F' : '-'}</td>
                                <td class="stat-value mono">${w.wind_speed_mph ? (w.wind_direction || '') + ' ' + w.wind_speed_mph + ' mph' : '-'}</td>
                                <td class="stat-value stat-small">${w.conditions || 'N/A'}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="4">No weather data available</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- PLAYER STATS (Game Stats Scraper) -->
        <div class="data-grid">
            <div class="data-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <span>⚡</span>
                        <span>TOP PASSERS</span>
                        <span class="scraper-tag tag-game-stats mono">GAME-STATS</span>
                    </h2>
                    <span class="section-badge badge-blue mono">SINGLE GAME</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>PLAYER</th>
                            <th>TEAM</th>
                            <th>YDS</th>
                            <th>TD</th>
                            <th>INT</th>
                            <th>C/ATT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topPassers?.map(p => `
                            <tr>
                                <td class="team-name">${p.players.full_name}</td>
                                <td class="stat-value">${p.team_id}</td>
                                <td class="stat-value">${p.passing_yards}</td>
                                <td class="stat-value">${p.passing_touchdowns}</td>
                                <td class="stat-value">${p.passing_interceptions}</td>
                                <td class="stat-value mono">${p.passing_completions}/${p.passing_attempts}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="6">No passing data available</td></tr>'}
                    </tbody>
                </table>
            </div>

            <div class="data-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <span>🏃</span>
                        <span>TOP RUSHERS</span>
                        <span class="scraper-tag tag-game-stats mono">GAME-STATS</span>
                    </h2>
                    <span class="section-badge badge-blue mono">SINGLE GAME</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>PLAYER</th>
                            <th>TEAM</th>
                            <th>YDS</th>
                            <th>CAR</th>
                            <th>TD</th>
                            <th>AVG</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topRushers?.map(p => `
                            <tr>
                                <td class="team-name">${p.players.full_name}</td>
                                <td class="stat-value">${p.team_id}</td>
                                <td class="stat-value">${p.rushing_yards}</td>
                                <td class="stat-value">${p.rushing_attempts}</td>
                                <td class="stat-value">${p.rushing_touchdowns}</td>
                                <td class="stat-value mono">${(p.rushing_yards / p.rushing_attempts).toFixed(1)}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="6">No rushing data available</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="data-section">
            <div class="section-header">
                <h2 class="section-title">
                    <span>🎣</span>
                    <span>TOP RECEIVERS</span>
                    <span class="scraper-tag tag-game-stats mono">GAME-STATS</span>
                </h2>
                <span class="section-badge badge-blue mono">SINGLE GAME</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>PLAYER</th>
                        <th>TEAM</th>
                        <th>REC</th>
                        <th>YDS</th>
                        <th>TD</th>
                        <th>YPR</th>
                    </tr>
                </thead>
                <tbody>
                    ${topReceivers?.map(p => `
                        <tr>
                            <td class="team-name">${p.players.full_name}</td>
                            <td class="stat-value">${p.team_id}</td>
                            <td class="stat-value">${p.receptions}</td>
                            <td class="stat-value">${p.receiving_yards}</td>
                            <td class="stat-value">${p.receiving_touchdowns}</td>
                            <td class="stat-value mono">${(p.receiving_yards / p.receptions).toFixed(1)}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="6">No receiving data available</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="accent-line"></div>

        <!-- INJURIES SCRAPER -->
        <div class="data-section">
            <div class="section-header">
                <h2 class="section-title">
                    <span>🏥</span>
                    <span>INJURY REPORT</span>
                    <span class="scraper-tag tag-injuries mono">INJURIES-SCRAPER</span>
                </h2>
                <span class="section-badge badge-red mono">DAILY 6 AM</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>PLAYER</th>
                        <th>TEAM</th>
                        <th>STATUS</th>
                        <th>INJURY</th>
                        <th>UPDATED</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentInjuries?.slice(0, 8).map(inj => `
                        <tr>
                            <td class="team-name">${inj.players.full_name}</td>
                            <td class="stat-value">${inj.players.team_id}</td>
                            <td class="stat-value" style="color: ${
                                inj.injury_status === 'out' ? 'var(--accent-red)' :
                                inj.injury_status === 'doubtful' ? 'var(--accent-red)' :
                                inj.injury_status === 'questionable' ? 'var(--accent-yellow)' :
                                'var(--accent-green)'
                            }; text-transform: uppercase;">${inj.injury_status}</td>
                            <td class="stat-small">${inj.injury_description || '-'}</td>
                            <td class="stat-value mono stat-small">${new Date(inj.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="5">No injury data available</td></tr>'}
                </tbody>
            </table>
        </div>

        <!-- ROSTER TRANSACTIONS -->
        <div class="data-section">
            <div class="section-header">
                <h2 class="section-title">
                    <span>📋</span>
                    <span>ROSTER MOVES</span>
                    <span class="scraper-tag tag-roster mono">ROSTER-SCRAPER</span>
                </h2>
                <span class="section-badge badge-purple mono">DAILY 5 PM</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>DATE</th>
                        <th>TEAM</th>
                        <th>PLAYER</th>
                        <th>TYPE</th>
                        <th>DETAILS</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentTransactions?.slice(0, 8).map(txn => `
                        <tr>
                            <td class="stat-value mono stat-small">${new Date(txn.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                            <td class="stat-value">${txn.teams.abbreviation}</td>
                            <td class="team-name">${txn.players.full_name}</td>
                            <td class="stat-value" style="text-transform: uppercase; color: ${
                                txn.transaction_type === 'signed' ? 'var(--accent-green)' :
                                txn.transaction_type === 'released' ? 'var(--accent-red)' :
                                txn.transaction_type === 'traded' ? 'var(--accent-blue)' :
                                'var(--accent-purple)'
                            };">${txn.transaction_type}</td>
                            <td class="stat-small">${txn.details || '-'}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="5">No transaction data available</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="accent-line"></div>

        <!-- LIVE GAMES SCRAPER -->
        <div class="data-section">
            <div class="section-header">
                <h2 class="section-title">
                    <span>📡</span>
                    <span>UPCOMING GAMES</span>
                    <span class="scraper-tag tag-live mono">LIVE-GAMES-SCRAPER</span>
                </h2>
                <span class="section-badge badge-yellow mono">GAME DAYS 30s</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>DATE</th>
                        <th>TIME</th>
                        <th>MATCHUP</th>
                        <th>VENUE</th>
                        <th>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    ${liveGames?.slice(0, 6).map(game => `
                        <tr>
                            <td class="stat-value mono">${new Date(game.game_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                            <td class="stat-value mono">${game.game_time ? new Date('1970-01-01T' + game.game_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '-'}</td>
                            <td class="team-name">${game.away_team_id} @ ${game.home_team_id}</td>
                            <td class="stat-small">${game.stadium_id || '-'}</td>
                            <td class="stat-value" style="text-transform: uppercase; color: ${
                                game.status === 'in_progress' ? 'var(--accent-green)' :
                                game.status === 'scheduled' ? 'var(--accent-blue)' :
                                'var(--text-secondary)'
                            };">${game.status}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="5">No upcoming games</td></tr>'}
                </tbody>
            </table>
        </div>

        <!-- SCORING PLAYS -->
        <div class="data-section">
            <div class="section-header">
                <h2 class="section-title">
                    <span>🎯</span>
                    <span>RECENT SCORES</span>
                    <span class="scraper-tag tag-game-stats mono">GAME-STATS</span>
                </h2>
                <span class="section-badge badge-blue mono">POST-GAME</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>TEAM</th>
                        <th>TYPE</th>
                        <th>PTS</th>
                        <th>QTR</th>
                        <th>TIME</th>
                        <th>DESCRIPTION</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentScores?.slice(0, 10).map(score => `
                        <tr>
                            <td class="stat-value">${score.team_id}</td>
                            <td class="stat-value stat-small" style="text-transform: uppercase;">${score.scoring_type}</td>
                            <td class="stat-value" style="color: var(--accent-green); font-size: 16px;">${score.points}</td>
                            <td class="stat-value mono">Q${score.quarter}</td>
                            <td class="stat-value mono stat-small">${score.time_remaining_seconds ? Math.floor(score.time_remaining_seconds / 60) + ':' + (score.time_remaining_seconds % 60).toString().padStart(2, '0') : '-'}</td>
                            <td class="stat-small">${score.description?.substring(0, 60)}...</td>
                        </tr>
                    `).join('') || '<tr><td colspan="6">No scoring data available</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="accent-line"></div>

        <!-- BETTING SCRAPER -->
        ${bettingLines?.length > 0 ? `
        <div class="data-section">
            <div class="section-header">
                <h2 class="section-title">
                    <span>💰</span>
                    <span>BETTING LINES</span>
                    <span class="scraper-tag tag-betting mono">BETTING-SCRAPER</span>
                </h2>
                <span class="section-badge mono" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; border-color: #22c55e;">DAILY 10 AM</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>GAME</th>
                        <th>HOME SPREAD</th>
                        <th>AWAY SPREAD</th>
                        <th>HOME ODDS</th>
                        <th>AWAY ODDS</th>
                        <th>UPDATED</th>
                    </tr>
                </thead>
                <tbody>
                    ${bettingLines?.slice(0, 6).map(line => `
                        <tr>
                            <td class="team-name stat-small">${line.game_betting_lines.game_id}</td>
                            <td class="stat-value mono">${line.home_spread > 0 ? '+' : ''}${line.home_spread}</td>
                            <td class="stat-value mono">${line.away_spread > 0 ? '+' : ''}${line.away_spread}</td>
                            <td class="stat-value mono">${line.home_spread_odds > 0 ? '+' : ''}${line.home_spread_odds}</td>
                            <td class="stat-value mono">${line.away_spread_odds > 0 ? '+' : ''}${line.away_spread_odds}</td>
                            <td class="stat-value mono stat-small">${new Date(line.line_timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <!-- ADVANCED ANALYTICS (EPA) -->
        ${topEpaPlays?.length > 0 ? `
        <div class="data-section">
            <div class="section-header">
                <h2 class="section-title">
                    <span>📈</span>
                    <span>TOP EPA PLAYS</span>
                    <span class="scraper-tag tag-analytics mono">ANALYTICS-SCRAPER</span>
                </h2>
                <span class="section-badge mono" style="background: rgba(99, 102, 241, 0.2); color: #6366f1; border-color: #6366f1;">WEEKLY TUE 6 AM</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>TEAM</th>
                        <th>DOWN</th>
                        <th>DIST</th>
                        <th>TYPE</th>
                        <th>YARDS</th>
                        <th>EPA</th>
                        <th>WPA</th>
                        <th>SUCCESS</th>
                    </tr>
                </thead>
                <tbody>
                    ${topEpaPlays?.slice(0, 10).map(play => `
                        <tr>
                            <td class="stat-value">${play.possession_team_id}</td>
                            <td class="stat-value mono">${play.down || '-'}</td>
                            <td class="stat-value mono">${play.yards_to_go || '-'}</td>
                            <td class="stat-value stat-small" style="text-transform: uppercase;">${play.play_type || '-'}</td>
                            <td class="stat-value mono">${play.yards_gained || 0}</td>
                            <td class="stat-value mono" style="color: ${play.epa > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight: 700;">${play.epa > 0 ? '+' : ''}${play.epa?.toFixed(2) || 0}</td>
                            <td class="stat-value mono" style="color: ${play.wpa > 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">${play.wpa > 0 ? '+' : ''}${play.wpa?.toFixed(2) || 0}</td>
                            <td class="stat-value mono">${play.success ? '✓' : '✗'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="accent-line"></div>

        <!-- Footer -->
        <div class="footer">
            <p class="mono">NFL STATS PLATFORM • COMPREHENSIVE DATA SHOWCASE</p>
            <p>8 Active Scrapers • ${playerStatsCount || 0} Player Stats • ${scoringPlayCount || 0} Scoring Plays • ${playByPlayCount ? Math.floor(playByPlayCount / 1000) + 'k' : '0'} PBP Records</p>
            <p>Automated Data Pipeline • Real-time Updates • 2025-26 Season</p>
            <div class="footer-links">
                <a href="./CLAUDE.md" class="footer-link mono">DOCUMENTATION</a>
                <a href="./SCHEDULER.md" class="footer-link mono">SCHEDULER</a>
                <a href="./demo-game-page-with-players.html" class="footer-link mono">GAME DEMO</a>
                <a href="https://github.com/srwlli/nfl-project" class="footer-link mono">GITHUB</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: var(--text-secondary);">
                Scrapers: standings-scraper • game-stats-scraper • injuries-scraper • roster-updates-scraper •
                live-games-scraper • betting-scraper • advanced-analytics-scraper • schedule-seeder
            </p>
            <p style="margin-top: 10px; font-size: 12px;">Built with Claude Code • October 2025</p>
        </div>
    </div>
</body>
</html>`

fs.writeFileSync('index.html', html)
console.log('✓ Generated: index.html (comprehensive data showcase)')

process.exit(0)
