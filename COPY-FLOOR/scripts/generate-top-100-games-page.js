/**
 * Generate Top 100 Greatest Games Page
 *
 * Creates HTML page displaying all 100 NFL greatest games
 * Uses Next Down Metrics theme (monochrome + neon accents)
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import { logger } from './utils/logger.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function generateTop100Page() {
  logger.info('Generating top-100-games.html...')

  const supabase = getSupabaseClient()

  // Fetch all 100 games
  const { data: games, error } = await supabase
    .from('greatest_games_official_ranking')
    .select('*')
    .order('rank')

  if (error) {
    logger.error('Failed to fetch games:', error)
    throw error
  }

  logger.info(`✓ Loaded ${games.length} games`)

  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NFL's 100 Greatest Games | Next Down Metrics</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>
    /* =====================================================
       NEXT DOWN METRICS THEME
       - Monochrome base (black, gunmetal, slate gray)
       - Neon accents (green, red, blue, purple)
       - HUD-style UI elements
       - Typography: JetBrains Mono (display) + Space Grotesk (body)
       ===================================================== */

    :root {
      /* Base colors */
      --bg-primary: #0a0e14;
      --bg-secondary: #1a1e24;
      --bg-tertiary: #2a2e34;

      /* Text colors */
      --text-primary: #e6e8eb;
      --text-secondary: #a0a4a8;
      --text-tertiary: #6b7075;

      /* Accent colors */
      --accent-green: #00ff88;
      --accent-red: #ff3366;
      --accent-blue: #00d4ff;
      --accent-purple: #b388ff;

      /* Glow effects */
      --glow-green: rgba(0, 255, 136, 0.3);
      --glow-blue: rgba(0, 212, 255, 0.3);

      /* Fonts */
      --font-display: 'JetBrains Mono', monospace;
      --font-body: 'Space Grotesk', sans-serif;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-body);
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
    }

    /* Header */
    .header {
      background: var(--bg-secondary);
      border-bottom: 2px solid var(--accent-green);
      padding: 24px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0, 255, 136, 0.1);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 700;
      color: var(--accent-green);
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 0 10px var(--glow-green);
    }

    .nav {
      display: flex;
      gap: 24px;
    }

    .nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s;
      padding: 8px 16px;
      border-radius: 4px;
    }

    .nav a:hover {
      color: var(--accent-green);
      background: rgba(0, 255, 136, 0.1);
    }

    /* Container */
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 48px 24px;
    }

    /* Page title */
    .page-title {
      font-family: var(--font-display);
      font-size: 48px;
      font-weight: 700;
      color: var(--accent-green);
      text-align: center;
      margin-bottom: 16px;
      text-shadow: 0 0 20px var(--glow-green);
    }

    .page-subtitle {
      text-align: center;
      color: var(--text-secondary);
      font-size: 18px;
      margin-bottom: 48px;
    }

    /* Stats bar */
    .stats-bar {
      background: var(--bg-secondary);
      border: 2px solid var(--accent-blue);
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 48px;
      display: flex;
      justify-content: space-around;
      gap: 24px;
      box-shadow: 0 0 20px var(--glow-blue);
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-family: var(--font-display);
      font-size: 36px;
      font-weight: 700;
      color: var(--accent-blue);
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Games grid */
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    /* Game card */
    .game-card {
      background: var(--bg-secondary);
      border: 2px solid var(--bg-tertiary);
      border-radius: 8px;
      padding: 20px;
      transition: all 0.3s;
      cursor: pointer;
    }

    .game-card:hover {
      border-color: var(--accent-green);
      transform: translateY(-4px);
      box-shadow: 0 8px 24px var(--glow-green);
    }

    .game-rank {
      font-family: var(--font-display);
      font-size: 48px;
      font-weight: 700;
      color: var(--accent-green);
      line-height: 1;
      margin-bottom: 12px;
    }

    .game-rank.top-10 {
      color: var(--accent-red);
      text-shadow: 0 0 15px rgba(255, 51, 102, 0.5);
    }

    .game-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
      line-height: 1.3;
    }

    .game-matchup {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 8px;
      font-family: var(--font-display);
    }

    .game-date {
      color: var(--text-tertiary);
      font-size: 12px;
      margin-bottom: 12px;
    }

    .game-context {
      color: var(--accent-blue);
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .game-significance {
      color: var(--text-secondary);
      font-size: 13px;
      line-height: 1.5;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--bg-tertiary);
    }

    /* Tier badges */
    .tier-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .tier-legendary {
      background: rgba(255, 51, 102, 0.2);
      color: var(--accent-red);
      border: 1px solid var(--accent-red);
    }

    .tier-epic {
      background: rgba(0, 255, 136, 0.2);
      color: var(--accent-green);
      border: 1px solid var(--accent-green);
    }

    .tier-memorable {
      background: rgba(0, 212, 255, 0.2);
      color: var(--accent-blue);
      border: 1px solid var(--accent-blue);
    }

    .tier-classic {
      background: rgba(179, 136, 255, 0.2);
      color: var(--accent-purple);
      border: 1px solid var(--accent-purple);
    }

    /* Footer */
    .footer {
      background: var(--bg-secondary);
      border-top: 2px solid var(--accent-green);
      padding: 24px;
      margin-top: 64px;
      text-align: center;
      color: var(--text-secondary);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-title {
        font-size: 32px;
      }

      .stats-bar {
        flex-direction: column;
        gap: 16px;
      }

      .games-grid {
        grid-template-columns: 1fr;
      }

      .nav {
        display: none;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="header-content">
      <div class="logo">Next Down Metrics</div>
      <nav class="nav">
        <a href="index.html">Home</a>
        <a href="top-100-games.html">Top 100 Games</a>
        <a href="demo-game-page-with-players.html">Demo Game</a>
      </nav>
    </div>
  </header>

  <!-- Main content -->
  <main class="container">
    <h1 class="page-title">NFL's 100 Greatest Games</h1>
    <p class="page-subtitle">
      Official rankings from NFL's 100th season celebration (2019) • Scraped from Pro-Football-Reference
    </p>

    <!-- Stats bar -->
    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-value">${games.length}</div>
        <div class="stat-label">Total Games</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${games.filter(g => g.game_date >= '2000-01-01').length}</div>
        <div class="stat-label">Since 2000</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${games.filter(g => g.summary.includes('Super Bowl')).length}</div>
        <div class="stat-label">Super Bowls</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${new Date(games[0].game_date).getFullYear()}</div>
        <div class="stat-label">Oldest Game</div>
      </div>
    </div>

    <!-- Games grid -->
    <div class="games-grid">
${games.map(game => {
  const tier = game.rank <= 10 ? 'legendary' :
               game.rank <= 30 ? 'epic' :
               game.rank <= 60 ? 'memorable' : 'classic'
  const tierLabel = game.rank <= 10 ? 'LEGENDARY' :
                    game.rank <= 30 ? 'EPIC' :
                    game.rank <= 60 ? 'MEMORABLE' : 'CLASSIC'

  const gameDate = new Date(game.game_date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return `      <div class="game-card">
        <span class="tier-badge tier-${tier}">${tierLabel}</span>
        <div class="game-rank ${game.rank <= 10 ? 'top-10' : ''}">#${game.rank}</div>
        <h3 class="game-title">${game.game_title}</h3>
        <div class="game-matchup">${game.away_team_id} @ ${game.home_team_id}</div>
        <div class="game-date">${gameDate}</div>
        ${game.summary ? `<div class="game-context">${game.summary}</div>` : ''}
        ${game.significance_notes ? `<div class="game-significance">${game.significance_notes}</div>` : ''}
      </div>`
}).join('\n')}
    </div>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <p>Next Down Metrics © ${new Date().getFullYear()} • Data from Pro-Football-Reference.com</p>
    <p style="margin-top: 8px; font-size: 14px;">
      Rankings based on NFL's official "NFL 100 Greatest Games" list from 2019
    </p>
  </footer>
</body>
</html>`

  // Write to file
  const outputPath = path.join(__dirname, '..', 'top-100-games.html')
  fs.writeFileSync(outputPath, html, 'utf8')

  logger.info(`✅ Generated: ${outputPath}`)
  logger.info(`   Total games: ${games.length}`)
  logger.info(`   Theme: Next Down Metrics`)
  logger.info(`   Tiers: Legendary (1-10), Epic (11-30), Memorable (31-60), Classic (61-100)`)
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateTop100Page()
    .then(() => {
      logger.info('✅ top-100-games.html generation complete!')
      process.exit(0)
    })
    .catch(error => {
      logger.error('Failed to generate page:', error)
      process.exit(1)
    })
}

export default generateTop100Page
