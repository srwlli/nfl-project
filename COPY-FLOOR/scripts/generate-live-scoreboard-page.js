/**
 * Generate Live Scoreboard Page
 *
 * Creates an interactive HTML scoreboard with auto-refresh capability.
 * Displays live games, final scores, and upcoming games with team logos and colors.
 *
 * Usage:
 * - node scripts/generate-live-scoreboard-page.js
 * - node scripts/generate-live-scoreboard-page.js --week=7
 *
 * Output: demo-live-scoreboard.html
 */

import { fetchScoreboardData } from './get-live-scoreboard.js'
import { logger } from './utils/logger.js'
import fs from 'fs'

/**
 * Get current week number
 */
function getCurrentWeek() {
  const now = new Date()
  const seasonStart = new Date('2025-09-04')

  if (now < seasonStart) return 1

  const diffTime = Math.abs(now - seasonStart)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const week = Math.ceil(diffDays / 7)

  return Math.min(week, 18)
}

/**
 * Generate HTML for scoreboard page
 */
function generateHTML(scoreboardData) {
  const { inProgress, completed, scheduled } = scoreboardData.games

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NFL Live Scoreboard - Week ${scoreboardData.week}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: #f0f0f0;
      padding: 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      padding: 30px 20px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      margin-bottom: 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    h1 {
      font-size: 2.5em;
      font-weight: 700;
      margin-bottom: 10px;
      background: linear-gradient(45deg, #00ff88, #00ccff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .update-info {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-top: 15px;
      font-size: 0.9em;
      color: #aaa;
    }

    .auto-refresh {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid rgba(0, 255, 136, 0.3);
      border-radius: 20px;
      color: #00ff88;
    }

    .pulse {
      width: 8px;
      height: 8px;
      background: #00ff88;
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .section {
      margin-bottom: 40px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px 20px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px 8px 0 0;
      border-bottom: 2px solid;
      margin-bottom: 0;
    }

    .section-header.live {
      border-color: #ff4444;
      background: rgba(255, 68, 68, 0.1);
    }

    .section-header.final {
      border-color: #00ff88;
      background: rgba(0, 255, 136, 0.05);
    }

    .section-header.upcoming {
      border-color: #00ccff;
      background: rgba(0, 204, 255, 0.05);
    }

    .section-header h2 {
      font-size: 1.4em;
      font-weight: 600;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85em;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.live {
      background: #ff4444;
      color: white;
    }

    .status-badge.final {
      background: #00ff88;
      color: #1a1a1a;
    }

    .status-badge.upcoming {
      background: #00ccff;
      color: #1a1a1a;
    }

    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 0 0 8px 8px;
    }

    .game-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .game-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      border-color: rgba(0, 255, 136, 0.3);
    }

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .game-status {
      font-weight: 600;
      font-size: 0.9em;
    }

    .game-status.live {
      color: #ff4444;
    }

    .game-status.final {
      color: #00ff88;
    }

    .game-status.scheduled {
      color: #00ccff;
    }

    .broadcast {
      font-size: 0.85em;
      color: #888;
    }

    .team-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      transition: background 0.2s;
    }

    .team-row:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .team-row.winner {
      background: rgba(0, 255, 136, 0.1);
      border: 1px solid rgba(0, 255, 136, 0.3);
    }

    .team-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .team-logo {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: contain;
      background: rgba(255, 255, 255, 0.1);
      padding: 4px;
    }

    .team-name {
      display: flex;
      flex-direction: column;
    }

    .team-abbr {
      font-weight: 700;
      font-size: 1.1em;
    }

    .team-full {
      font-size: 0.85em;
      color: #aaa;
    }

    .team-score {
      font-size: 2em;
      font-weight: 700;
      min-width: 50px;
      text-align: center;
    }

    .team-score.winner {
      color: #00ff88;
    }

    .quarter-scores {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.85em;
    }

    .quarter {
      text-align: center;
    }

    .quarter-label {
      color: #888;
      font-size: 0.8em;
      margin-bottom: 4px;
    }

    .quarter-value {
      font-weight: 600;
    }

    .venue-info {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.85em;
      color: #888;
      text-align: center;
    }

    .summary {
      display: flex;
      justify-content: center;
      gap: 40px;
      padding: 25px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      margin-top: 30px;
    }

    .summary-item {
      text-align: center;
    }

    .summary-value {
      font-size: 2.5em;
      font-weight: 700;
      background: linear-gradient(45deg, #00ff88, #00ccff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .summary-label {
      color: #888;
      margin-top: 5px;
      font-size: 0.9em;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-state-icon {
      font-size: 4em;
      margin-bottom: 20px;
    }

    @media (max-width: 768px) {
      .games-grid {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 1.8em;
      }

      .summary {
        flex-direction: column;
        gap: 20px;
      }

      .update-info {
        flex-direction: column;
        gap: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🏈 NFL LIVE SCOREBOARD</h1>
      <div style="color: #aaa; margin-top: 5px;">Week ${scoreboardData.week} • ${scoreboardData.season} Season</div>
      <div class="update-info">
        <div>Last Updated: <strong id="lastUpdated">${new Date(scoreboardData.lastUpdated).toLocaleTimeString()}</strong></div>
        <div class="auto-refresh">
          <span class="pulse"></span>
          Auto-refresh: <strong id="countdown">30</strong>s
        </div>
      </div>
    </header>

    ${inProgress.length > 0 ? `
    <div class="section">
      <div class="section-header live">
        <span class="status-badge live">● LIVE</span>
        <h2>Games in Progress</h2>
        <div style="margin-left: auto; color: #ff4444; font-size: 0.9em;">${inProgress.length} game${inProgress.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="games-grid">
        ${inProgress.map(game => generateGameCard(game)).join('')}
      </div>
    </div>
    ` : ''}

    ${completed.length > 0 ? `
    <div class="section">
      <div class="section-header final">
        <span class="status-badge final">✓ FINAL</span>
        <h2>Final Scores</h2>
        <div style="margin-left: auto; color: #00ff88; font-size: 0.9em;">${completed.length} game${completed.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="games-grid">
        ${completed.map(game => generateGameCard(game)).join('')}
      </div>
    </div>
    ` : ''}

    ${scheduled.length > 0 ? `
    <div class="section">
      <div class="section-header upcoming">
        <span class="status-badge upcoming">⏰ UPCOMING</span>
        <h2>Scheduled Games</h2>
        <div style="margin-left: auto; color: #00ccff; font-size: 0.9em;">${scheduled.length} game${scheduled.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="games-grid">
        ${scheduled.map(game => generateGameCard(game)).join('')}
      </div>
    </div>
    ` : ''}

    ${inProgress.length === 0 && completed.length === 0 && scheduled.length === 0 ? `
    <div class="empty-state">
      <div class="empty-state-icon">🏈</div>
      <h2>No games found for Week ${scoreboardData.week}</h2>
      <p style="color: #888; margin-top: 10px;">Check back later for updates</p>
    </div>
    ` : ''}

    <div class="summary">
      <div class="summary-item">
        <div class="summary-value">${scoreboardData.summary.total}</div>
        <div class="summary-label">Total Games</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${scoreboardData.summary.inProgress}</div>
        <div class="summary-label">Live</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${scoreboardData.summary.completed}</div>
        <div class="summary-label">Completed</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${scoreboardData.summary.scheduled}</div>
        <div class="summary-label">Upcoming</div>
      </div>
    </div>
  </div>

  <script>
    // Auto-refresh every 30 seconds
    let countdown = 30;

    setInterval(() => {
      countdown--;
      document.getElementById('countdown').textContent = countdown;

      if (countdown <= 0) {
        location.reload();
      }
    }, 1000);

    // Update last updated time every second
    setInterval(() => {
      const lastUpdated = new Date('${scoreboardData.lastUpdated}');
      const now = new Date();
      const diffSeconds = Math.floor((now - lastUpdated) / 1000);

      if (diffSeconds < 60) {
        document.getElementById('lastUpdated').textContent = diffSeconds + 's ago';
      } else {
        document.getElementById('lastUpdated').textContent = lastUpdated.toLocaleTimeString();
      }
    }, 1000);
  </script>
</body>
</html>`
}

/**
 * Generate HTML for a single game card
 */
function generateGameCard(game) {
  const awayWinner = game.status === 'final' && game.awayTeam.score > game.homeTeam.score
  const homeWinner = game.status === 'final' && game.homeTeam.score > game.awayTeam.score

  const hasQuarters = game.awayTeam.quarterScores.q1 !== null

  let statusClass = 'scheduled'
  if (game.status === 'in_progress') statusClass = 'live'
  if (game.status === 'final') statusClass = 'final'

  return `
    <div class="game-card">
      <div class="game-header">
        <div class="game-status ${statusClass}">${game.statusDisplay}</div>
        ${game.broadcast ? `<div class="broadcast">${game.broadcast}</div>` : ''}
      </div>

      <div class="team-row ${awayWinner ? 'winner' : ''}">
        <div class="team-info">
          <img src="${game.awayTeam.logo || 'https://via.placeholder.com/40'}" alt="${game.awayTeam.abbreviation}" class="team-logo" onerror="this.src='https://via.placeholder.com/40'">
          <div class="team-name">
            <div class="team-abbr">${game.awayTeam.abbreviation}</div>
            <div class="team-full">${game.awayTeam.name}</div>
          </div>
        </div>
        <div class="team-score ${awayWinner ? 'winner' : ''}">${game.awayTeam.score !== null ? game.awayTeam.score : '-'}</div>
      </div>

      <div class="team-row ${homeWinner ? 'winner' : ''}">
        <div class="team-info">
          <img src="${game.homeTeam.logo || 'https://via.placeholder.com/40'}" alt="${game.homeTeam.abbreviation}" class="team-logo" onerror="this.src='https://via.placeholder.com/40'">
          <div class="team-name">
            <div class="team-abbr">${game.homeTeam.abbreviation}</div>
            <div class="team-full">${game.homeTeam.name}</div>
          </div>
        </div>
        <div class="team-score ${homeWinner ? 'winner' : ''}">${game.homeTeam.score !== null ? game.homeTeam.score : '-'}</div>
      </div>

      ${hasQuarters ? `
      <div class="quarter-scores">
        <div class="quarter">
          <div class="quarter-label">Q1</div>
          <div class="quarter-value">${game.awayTeam.quarterScores.q1 || 0}-${game.homeTeam.quarterScores.q1 || 0}</div>
        </div>
        <div class="quarter">
          <div class="quarter-label">Q2</div>
          <div class="quarter-value">${game.awayTeam.quarterScores.q2 || 0}-${game.homeTeam.quarterScores.q2 || 0}</div>
        </div>
        <div class="quarter">
          <div class="quarter-label">Q3</div>
          <div class="quarter-value">${game.awayTeam.quarterScores.q3 || 0}-${game.homeTeam.quarterScores.q3 || 0}</div>
        </div>
        <div class="quarter">
          <div class="quarter-label">Q4</div>
          <div class="quarter-value">${game.awayTeam.quarterScores.q4 || 0}-${game.homeTeam.quarterScores.q4 || 0}</div>
        </div>
        ${game.overtime ? `
        <div class="quarter">
          <div class="quarter-label">OT</div>
          <div class="quarter-value">${game.awayTeam.quarterScores.ot || 0}-${game.homeTeam.quarterScores.ot || 0}</div>
        </div>
        ` : ''}
      </div>
      ` : ''}

      ${game.venue ? `
      <div class="venue-info">
        📍 ${game.venue.name} • ${game.venue.city}, ${game.venue.state}
        ${game.venue.roofType ? ` • ${game.venue.roofType}` : ''}
      </div>
      ` : ''}
    </div>
  `
}

/**
 * Main execution
 */
async function main() {
  try {
    logger.info('Generating live scoreboard page...')

    const args = process.argv.slice(2)
    const weekArg = args.find(arg => arg.startsWith('--week='))
    const week = weekArg ? parseInt(weekArg.split('=')[1]) : getCurrentWeek()

    // Fetch scoreboard data
    const scoreboardData = await fetchScoreboardData(week)

    // Generate HTML
    const html = generateHTML(scoreboardData)

    // Write to file
    const outputPath = 'demo-live-scoreboard.html'
    fs.writeFileSync(outputPath, html, 'utf8')

    logger.info(`✓ Live scoreboard page generated: ${outputPath}`)
    console.log('')
    console.log('═'.repeat(80))
    console.log('LIVE SCOREBOARD PAGE GENERATED')
    console.log('═'.repeat(80))
    console.log(`Output: ${outputPath}`)
    console.log(`Week: ${week}`)
    console.log(`Games: ${scoreboardData.summary.total}`)
    console.log(`  - Live: ${scoreboardData.summary.inProgress}`)
    console.log(`  - Final: ${scoreboardData.summary.completed}`)
    console.log(`  - Upcoming: ${scoreboardData.summary.scheduled}`)
    console.log('═'.repeat(80))
    console.log('')
    console.log('Open in browser to view the live scoreboard.')
    console.log('Page auto-refreshes every 30 seconds.')
    console.log('')

  } catch (error) {
    logger.error('Failed to generate scoreboard page:', error)
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()
