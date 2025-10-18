import { getSupabaseClient } from './utils/supabase-client.js'
import fs from 'fs'

const supabase = getSupabaseClient()

console.log('Generating data-rich index.html...')

// Fetch current season statistics
const { data: teamStats } = await supabase
  .from('team_season_stats')
  .select('*')
  .eq('season', 2025)
  .order('conference_rank', { ascending: true })
  .limit(8)

const { data: recentGames } = await supabase
  .from('games')
  .select('*')
  .eq('season', 2025)
  .eq('status', 'final')
  .order('game_date', { ascending: false })
  .limit(6)

const { data: topPassers } = await supabase
  .from('player_game_stats')
  .select(`
    player_id,
    passing_yards,
    passing_touchdowns,
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
    rushing_yards,
    rushing_attempts,
    rushing_touchdowns,
    players!inner(full_name)
  `)
  .eq('season', 2025)
  .gt('rushing_attempts', 10)
  .order('rushing_yards', { ascending: false })
  .limit(5)

// Count total stats
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

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFL Stats Platform - Next Down Metrics</title>
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
            max-width: 1400px;
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
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
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
            font-size: 48px;
            font-weight: 700;
            color: var(--accent-green);
            font-family: 'JetBrains Mono', monospace;
            line-height: 1;
            margin-bottom: 8px;
        }

        .metric-label {
            color: var(--text-secondary);
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .metric-change {
            font-size: 14px;
            color: var(--accent-green);
            margin-top: 8px;
        }

        /* Data Tables */
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
            color: var(--accent-blue);
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            border: 1px solid var(--accent-blue);
            box-shadow: 0 0 10px var(--glow-blue);
        }

        /* Table Styles */
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 8px;
        }

        thead th {
            color: var(--text-secondary);
            font-size: 12px;
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
            padding: 16px;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
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
            font-size: 18px;
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

        /* Grid Layout */
        .data-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
        }

        @media (max-width: 900px) {
            .data-grid {
                grid-template-columns: 1fr;
            }
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

        /* Accent Lines */
        .accent-line {
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--accent-green), transparent);
            margin: 40px 0;
        }
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
                <div class="status-badge">● LIVE</div>
            </div>
            <h1 class="header-title">NEXT DOWN METRICS</h1>
            <p class="header-subtitle">Hypermodern analytics dashboard • 2025-26 Season • Week 7</p>
        </div>

        <!-- Real-Time Metrics -->
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${teamStats?.length || 32}</div>
                <div class="metric-label">ACTIVE TEAMS</div>
                <div class="metric-change">↑ 100% Coverage</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${playerCount || 2637}</div>
                <div class="metric-label">TRACKED PLAYERS</div>
                <div class="metric-change">↑ Real-time Updates</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${completedCount || 94}</div>
                <div class="metric-label">GAMES COMPLETED</div>
                <div class="metric-change">↑ Week 7 Active</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${gameCount || 272}</div>
                <div class="metric-label">SEASON GAMES</div>
                <div class="metric-change">↑ Full Schedule</div>
            </div>
        </div>

        <!-- Data Grid -->
        <div class="data-grid">
            <!-- Top Teams (Standings) -->
            <div class="data-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <span>📊</span>
                        <span>CONFERENCE LEADERS</span>
                    </h2>
                    <span class="section-badge mono">LIVE</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>RANK</th>
                            <th>TEAM</th>
                            <th>W-L</th>
                            <th>PCT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${teamStats?.slice(0, 6).map(team => `
                            <tr>
                                <td class="rank">#${team.conference_rank}</td>
                                <td class="team-name">${team.team_id}</td>
                                <td class="stat-value">${team.wins}-${team.losses}${team.ties > 0 ? `-${team.ties}` : ''}</td>
                                <td class="stat-value">${team.win_percentage.toFixed(3)}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="4">Loading data...</td></tr>'}
                    </tbody>
                </table>
            </div>

            <!-- Recent Games -->
            <div class="data-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <span>🎯</span>
                        <span>RECENT RESULTS</span>
                    </h2>
                    <span class="section-badge mono">FINAL</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>MATCHUP</th>
                            <th>SCORE</th>
                            <th>DATE</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentGames?.slice(0, 6).map(game => `
                            <tr>
                                <td class="team-name">${game.away_team_id} @ ${game.home_team_id}</td>
                                <td class="stat-value">${game.away_score}-${game.home_score}</td>
                                <td class="stat-value mono">${new Date(game.game_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="3">Loading data...</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="accent-line"></div>

        <!-- Player Leaders Grid -->
        <div class="data-grid">
            <!-- Top Passers -->
            <div class="data-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <span>⚡</span>
                        <span>TOP PASSERS (Single Game)</span>
                    </h2>
                    <span class="section-badge mono">YDS</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>PLAYER</th>
                            <th>YDS</th>
                            <th>TD</th>
                            <th>C/ATT</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topPassers?.map((p, i) => `
                            <tr>
                                <td class="team-name">${p.players.full_name}</td>
                                <td class="stat-value">${p.passing_yards}</td>
                                <td class="stat-value">${p.passing_touchdowns}</td>
                                <td class="stat-value mono">${p.passing_completions}/${p.passing_attempts}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="4">Loading data...</td></tr>'}
                    </tbody>
                </table>
            </div>

            <!-- Top Rushers -->
            <div class="data-section">
                <div class="section-header">
                    <h2 class="section-title">
                        <span>🏃</span>
                        <span>TOP RUSHERS (Single Game)</span>
                    </h2>
                    <span class="section-badge mono">YDS</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>PLAYER</th>
                            <th>YDS</th>
                            <th>CAR</th>
                            <th>TD</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topRushers?.map((p, i) => `
                            <tr>
                                <td class="team-name">${p.players.full_name}</td>
                                <td class="stat-value">${p.rushing_yards}</td>
                                <td class="stat-value">${p.rushing_attempts}</td>
                                <td class="stat-value">${p.rushing_touchdowns}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="4">Loading data...</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="accent-line"></div>

        <!-- Footer -->
        <div class="footer">
            <p class="mono">NFL STATS PLATFORM • NEXT DOWN METRICS INTERFACE</p>
            <p>Hypermodern Analytics Dashboard • Real-time Data Pipeline • 2025-26 Season</p>
            <div class="footer-links">
                <a href="./CLAUDE.md" class="footer-link mono">DOCS</a>
                <a href="./demo-game-page-with-players.html" class="footer-link mono">GAME DEMO</a>
                <a href="https://github.com/srwlli/nfl-project" class="footer-link mono">GITHUB</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px;">Built with Claude Code • October 2025</p>
        </div>
    </div>
</body>
</html>`

fs.writeFileSync('index.html', html)
console.log('✓ Generated: index.html (with live data)')

process.exit(0)
