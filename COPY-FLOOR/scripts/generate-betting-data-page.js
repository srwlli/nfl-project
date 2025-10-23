/**
 * Generate Historical Betting Data Page
 *
 * Creates HTML page with sortable table displaying all historical betting lines
 * Uses Next Down Metrics theme with interactive sorting
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import { logger } from './utils/logger.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function generateBettingDataPage() {
  logger.info('Generating historical-betting-data.html...')

  const supabase = getSupabaseClient()

  // Fetch all betting lines
  const { data: bettingLines, error } = await supabase
    .from('game_betting_lines')
    .select('*')
    .order('season', { ascending: false })
    .order('game_id')

  if (error) {
    logger.error('Failed to fetch betting lines:', error)
    throw error
  }

  logger.info(`✓ Loaded ${bettingLines.length} betting lines`)

  // Calculate stats
  const seasons = [...new Set(bettingLines.map(b => b.season))].sort()
  const avgSpread = (bettingLines.reduce((sum, b) => sum + (b.spread_line || 0), 0) / bettingLines.length).toFixed(1)
  const avgTotal = (bettingLines.reduce((sum, b) => sum + (b.total_line || 0), 0) / bettingLines.length).toFixed(1)

  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Historical Betting Data | Next Down Metrics</title>

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
        <a href="demo-game-page-with-players.html">Demo Game</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <h1 class="page-title">Historical Betting Data</h1>
    <p class="page-subtitle">
      ${bettingLines.length.toLocaleString()} games • ${seasons[0]}-${seasons[seasons.length - 1]} • Source: nflverse
    </p>

    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-value">${bettingLines.length.toLocaleString()}</div>
        <div class="stat-label">Total Games</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${seasons.length}</div>
        <div class="stat-label">Seasons</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${avgSpread}</div>
        <div class="stat-label">Avg Spread</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${avgTotal}</div>
        <div class="stat-label">Avg Total</div>
      </div>
    </div>

    <div class="controls">
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search by team, game ID, or date..." />
      </div>
      <select id="seasonFilter" class="filter-select">
        <option value="">All Seasons</option>
        ${seasons.reverse().map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
    </div>

    <div class="table-container">
      <table id="dataTable">
        <thead>
          <tr>
            <th class="sortable" data-sort="season">Season</th>
            <th class="sortable" data-sort="game_id">Game ID</th>
            <th class="sortable" data-sort="favorite_team_id">Favorite</th>
            <th class="sortable" data-sort="underdog_team_id">Underdog</th>
            <th class="sortable" data-sort="spread_line">Spread</th>
            <th class="sortable" data-sort="total_line">Total</th>
            <th class="sortable" data-sort="bookmaker">Bookmaker</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody id="tableBody">
${bettingLines.map(line => `          <tr data-season="${line.season}">
            <td class="mono">${line.season}</td>
            <td class="mono">${line.game_id}</td>
            <td class="team">${line.favorite_team_id || 'N/A'}</td>
            <td class="team">${line.underdog_team_id || 'N/A'}</td>
            <td class="mono">${line.spread_line || '-'}</td>
            <td class="mono">${line.total_line || '-'}</td>
            <td>${line.bookmaker || 'N/A'}</td>
            <td>${line.data_source || 'N/A'}</td>
          </tr>`).join('\n')}
        </tbody>
      </table>
    </div>
  </main>

  <footer class="footer">
    <p>Next Down Metrics © ${new Date().getFullYear()} • Historical betting data from nflverse</p>
    <p style="margin-top: 8px; font-size: 14px;">
      ${bettingLines.length.toLocaleString()} games • ${seasons.length} seasons (${seasons[seasons.length - 1]}-${seasons[0]})
    </p>
  </footer>

  <script>
    // Sorting functionality
    let currentSort = { column: 'season', direction: 'desc' };
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
        const aVal = a.cells[columnIndex].textContent;
        const bVal = b.cells[columnIndex].textContent;

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

    // Search functionality
    document.getElementById('searchInput').addEventListener('input', filterTable);
    document.getElementById('seasonFilter').addEventListener('change', filterTable);

    function filterTable() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const seasonFilter = document.getElementById('seasonFilter').value;

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const season = row.dataset.season;

        const matchesSearch = searchTerm === '' || text.includes(searchTerm);
        const matchesSeason = seasonFilter === '' || season === seasonFilter;

        row.style.display = matchesSearch && matchesSeason ? '' : 'none';
      });
    }

    // Initialize sort
    updateSortIndicators(document.querySelector('th[data-sort="season"]'));
  </script>
</body>
</html>`;

  // Write to file
  const outputPath = path.join(__dirname, '..', 'historical-betting-data.html')
  fs.writeFileSync(outputPath, html, 'utf8')

  logger.info(`✅ Generated: ${outputPath}`)
  logger.info(`   Total records: ${bettingLines.length}`)
  logger.info(`   Seasons: ${seasons[0]}-${seasons[seasons.length - 1]}`)
  logger.info(`   Features: Sortable columns, search, season filter`)
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateBettingDataPage()
    .then(() => {
      logger.info('✅ historical-betting-data.html generation complete!')
      process.exit(0)
    })
    .catch(error => {
      logger.error('Failed to generate page:', error)
      process.exit(1)
    })
}

export default generateBettingDataPage
