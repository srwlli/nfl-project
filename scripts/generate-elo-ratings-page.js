/**
 * Generate Historical Elo Ratings Page
 *
 * Creates HTML page with sortable table displaying all historical team Elo ratings
 * Uses Next Down Metrics theme with interactive sorting
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import { logger } from './utils/logger.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function generateEloRatingsPage() {
  logger.info('Generating historical-elo-ratings.html...')

  const supabase = getSupabaseClient()

  // Fetch recent Elo ratings with pagination (Supabase limits to 1000 per request)
  let eloRatings = []
  let page = 0
  const pageSize = 1000
  const minSeason = 2010

  logger.info('Fetching Elo ratings (2010-2020)...')

  while (true) {
    const { data, error } = await supabase
      .from('team_elo_ratings')
      .select('*')
      .gte('season', minSeason)
      .order('game_date', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) {
      logger.error('Failed to fetch Elo ratings:', error)
      throw error
    }

    if (!data || data.length === 0) break

    eloRatings = eloRatings.concat(data)
    logger.info(`  ✓ Fetched page ${page + 1} (${data.length} records, ${eloRatings.length} total)`)

    if (data.length < pageSize) break // Last page
    page++
  }

  logger.info(`✓ Loaded ${eloRatings.length} Elo ratings`)

  // Calculate stats
  const seasons = [...new Set(eloRatings.map(e => e.season))].sort((a, b) => b - a)
  const avgElo = (eloRatings.reduce((sum, e) => sum + (e.elo_pre_game || 0), 0) / eloRatings.length).toFixed(0)
  const maxElo = Math.max(...eloRatings.map(e => e.elo_pre_game)).toFixed(0)
  const playoffGames = eloRatings.filter(e => e.is_playoff).length

  // Get unique teams
  const teams = [...new Set(eloRatings.map(e => e.team_id))].sort()

  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Historical Elo Ratings | Next Down Metrics</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>
    :root {
      --bg-primary: #0a0e14;
      --bg-secondary: #1a1e24;
      --bg-tertiary: #2a2e34;
      --text-primary: #e6e8eb;
      --text-secondary: #a0a4a8;
      --text-tertiary: #6b7075;
      --accent-green: #00ff88;
      --accent-red: #ff3366;
      --accent-blue: #00d4ff;
      --accent-purple: #b388ff;
      --glow-green: rgba(0, 255, 136, 0.3);
      --glow-blue: rgba(0, 212, 255, 0.3);
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
      max-width: 1600px;
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

    .container {
      max-width: 1600px;
      margin: 0 auto;
      padding: 48px 24px;
    }

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

    .controls {
      background: var(--bg-secondary);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 250px;
    }

    .search-box input {
      width: 100%;
      padding: 12px 16px;
      background: var(--bg-tertiary);
      border: 2px solid var(--bg-tertiary);
      border-radius: 6px;
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: 14px;
      transition: all 0.3s;
    }

    .search-box input:focus {
      outline: none;
      border-color: var(--accent-green);
      box-shadow: 0 0 10px var(--glow-green);
    }

    .filter-select {
      padding: 12px 16px;
      background: var(--bg-tertiary);
      border: 2px solid var(--bg-tertiary);
      border-radius: 6px;
      color: var(--text-primary);
      font-family: var(--font-body);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--accent-blue);
    }

    .table-container {
      background: var(--bg-secondary);
      border: 2px solid var(--bg-tertiary);
      border-radius: 8px;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: var(--bg-tertiary);
      position: sticky;
      top: 76px;
    }

    th {
      padding: 16px;
      text-align: left;
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 600;
      color: var(--accent-green);
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }

    th:hover {
      background: rgba(0, 255, 136, 0.1);
    }

    th.sortable::after {
      content: ' ⇅';
      opacity: 0.3;
    }

    th.sort-asc::after {
      content: ' ↑';
      opacity: 1;
    }

    th.sort-desc::after {
      content: ' ↓';
      opacity: 1;
    }

    tbody tr {
      border-bottom: 1px solid var(--bg-tertiary);
      transition: all 0.2s;
    }

    tbody tr:hover {
      background: rgba(0, 255, 136, 0.05);
    }

    td {
      padding: 14px 16px;
      color: var(--text-primary);
      font-size: 14px;
    }

    td.mono {
      font-family: var(--font-display);
      color: var(--accent-blue);
    }

    td.team {
      font-weight: 600;
      color: var(--accent-green);
    }

    .playoff-badge {
      display: inline-block;
      background: var(--accent-red);
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .elo-high {
      color: var(--accent-green);
      font-weight: 600;
    }

    .elo-mid {
      color: var(--accent-blue);
    }

    .elo-low {
      color: var(--text-secondary);
    }

    .footer {
      background: var(--bg-secondary);
      border-top: 2px solid var(--accent-green);
      padding: 24px;
      margin-top: 64px;
      text-align: center;
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 32px;
      }

      .stats-bar {
        flex-direction: column;
      }

      .nav {
        display: none;
      }

      th, td {
        padding: 10px 8px;
        font-size: 12px;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-content">
      <div class="logo">Next Down Metrics</div>
      <nav class="nav">
        <a href="index.html">Home</a>
        <a href="top-100-games.html">Top 100 Games</a>
        <a href="historical-betting-data.html">Betting Data</a>
        <a href="historical-elo-ratings.html">Elo Ratings</a>
        <a href="demo-game-page-with-players.html">Demo Game</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <h1 class="page-title">Historical Elo Ratings</h1>
    <p class="page-subtitle">
      ${eloRatings.length.toLocaleString()} team-game records • ${seasons[seasons.length - 1]}-${seasons[0]} • Source: FiveThirtyEight
    </p>

    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-value">${eloRatings.length.toLocaleString()}</div>
        <div class="stat-label">Total Records</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${seasons.length}</div>
        <div class="stat-label">Seasons</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${avgElo}</div>
        <div class="stat-label">Avg Elo Rating</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${maxElo}</div>
        <div class="stat-label">Max Elo Rating</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${playoffGames}</div>
        <div class="stat-label">Playoff Games</div>
      </div>
    </div>

    <div class="controls">
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search by team, opponent, or date..." />
      </div>
      <select id="seasonFilter" class="filter-select">
        <option value="">All Seasons</option>
        ${seasons.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <select id="teamFilter" class="filter-select">
        <option value="">All Teams</option>
        ${teams.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
      <select id="playoffFilter" class="filter-select">
        <option value="">All Games</option>
        <option value="playoff">Playoff Only</option>
        <option value="regular">Regular Season</option>
      </select>
    </div>

    <div class="table-container">
      <table id="dataTable">
        <thead>
          <tr>
            <th class="sortable" data-sort="season">Season</th>
            <th class="sortable" data-sort="game_date">Date</th>
            <th class="sortable" data-sort="team_id">Team</th>
            <th class="sortable" data-sort="opponent_team_id">Opponent</th>
            <th class="sortable" data-sort="elo_pre_game">Pre-Game Elo</th>
            <th class="sortable" data-sort="elo_post_game">Post-Game Elo</th>
            <th class="sortable" data-sort="elo_probability">Win Prob</th>
            <th>Playoff</th>
            <th>Home/Away</th>
          </tr>
        </thead>
        <tbody id="tableBody">
${eloRatings.map(rating => {
  const eloClass = rating.elo_pre_game >= 1650 ? 'elo-high' :
                   rating.elo_pre_game >= 1450 ? 'elo-mid' : 'elo-low'
  const winProb = (rating.elo_probability * 100).toFixed(1)
  const eloChange = (rating.elo_post_game - rating.elo_pre_game).toFixed(0)
  const eloChangeSign = eloChange > 0 ? '+' : ''

  return `          <tr data-season="${rating.season}" data-team="${rating.team_id}" data-playoff="${rating.is_playoff}">
            <td class="mono">${rating.season}</td>
            <td class="mono">${rating.game_date}</td>
            <td class="team">${rating.team_id}</td>
            <td class="team">${rating.opponent_team_id || 'N/A'}</td>
            <td class="mono ${eloClass}">${rating.elo_pre_game.toFixed(0)}</td>
            <td class="mono ${eloClass}">${rating.elo_post_game.toFixed(0)} <span style="font-size: 11px; color: var(--text-tertiary);">(${eloChangeSign}${eloChange})</span></td>
            <td class="mono">${winProb}%</td>
            <td>${rating.is_playoff ? '<span class="playoff-badge">Playoff</span>' : '-'}</td>
            <td>${rating.is_home_game ? 'Home' : 'Away'}</td>
          </tr>`
}).join('\n')}
        </tbody>
      </table>
    </div>
  </main>

  <footer class="footer">
    <p>Next Down Metrics © ${new Date().getFullYear()} • Historical Elo ratings from FiveThirtyEight</p>
    <p style="margin-top: 8px; font-size: 14px;">
      ${eloRatings.length.toLocaleString()} team-game records • ${seasons.length} seasons (${seasons[seasons.length - 1]}-${seasons[0]})
    </p>
  </footer>

  <script>
    // Sorting functionality
    let currentSort = { column: 'game_date', direction: 'desc' };
    const table = document.getElementById('dataTable');
    const tbody = document.getElementById('tableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    document.querySelectorAll('th.sortable').forEach(th => {
      th.addEventListener('click', () => {
        const column = th.dataset.sort;

        if (currentSort.column === column) {
          currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
          currentSort.column = column;
          currentSort.direction = 'asc';
        }

        sortTable(column, currentSort.direction);
        updateSortIndicators(th);
      });
    });

    function sortTable(column, direction) {
      const columnIndex = Array.from(table.querySelectorAll('th')).findIndex(th => th.dataset.sort === column);

      rows.sort((a, b) => {
        const aVal = a.cells[columnIndex].textContent.replace(/[^0-9.-]/g, '');
        const bVal = b.cells[columnIndex].textContent.replace(/[^0-9.-]/g, '');

        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });

      rows.forEach(row => tbody.appendChild(row));
    }

    function updateSortIndicators(activeHeader) {
      document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
      });

      activeHeader.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
    }

    // Filter functionality
    document.getElementById('searchInput').addEventListener('input', filterTable);
    document.getElementById('seasonFilter').addEventListener('change', filterTable);
    document.getElementById('teamFilter').addEventListener('change', filterTable);
    document.getElementById('playoffFilter').addEventListener('change', filterTable);

    function filterTable() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const seasonFilter = document.getElementById('seasonFilter').value;
      const teamFilter = document.getElementById('teamFilter').value;
      const playoffFilter = document.getElementById('playoffFilter').value;

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const season = row.dataset.season;
        const team = row.dataset.team;
        const isPlayoff = row.dataset.playoff === 'true';

        const matchesSearch = searchTerm === '' || text.includes(searchTerm);
        const matchesSeason = seasonFilter === '' || season === seasonFilter;
        const matchesTeam = teamFilter === '' || team === teamFilter;
        const matchesPlayoff = playoffFilter === '' ||
                              (playoffFilter === 'playoff' && isPlayoff) ||
                              (playoffFilter === 'regular' && !isPlayoff);

        row.style.display = matchesSearch && matchesSeason && matchesTeam && matchesPlayoff ? '' : 'none';
      });
    }

    // Initialize sort
    updateSortIndicators(document.querySelector('th[data-sort="game_date"]'));
  </script>
</body>
</html>`;

  // Write to file
  const outputPath = path.join(__dirname, '..', 'historical-elo-ratings.html')
  fs.writeFileSync(outputPath, html, 'utf8')

  logger.info(`✅ Generated: ${outputPath}`)
  logger.info(`   Total records: ${eloRatings.length}`)
  logger.info(`   Seasons: ${seasons[seasons.length - 1]}-${seasons[0]}`)
  logger.info(`   Features: Sortable columns, search, filters (season, team, playoff)`)
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateEloRatingsPage()
    .then(() => {
      logger.info('✅ historical-elo-ratings.html generation complete!')
      process.exit(0)
    })
    .catch(error => {
      logger.error('Failed to generate page:', error)
      process.exit(1)
    })
}

export default generateEloRatingsPage
