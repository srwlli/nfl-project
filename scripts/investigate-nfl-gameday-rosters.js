/**
 * Investigate NFL.com and other sources for full 53-man game-day rosters
 */

async function investigateNFLSources() {
  console.log('🔍 Investigating Sources for Full 53-Man Game-Day Rosters\n');
  console.log('Game: PIT @ CIN (Week 7, 2025)');
  console.log('ESPN Game ID: 401772941\n');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('POTENTIAL DATA SOURCES');
  console.log('═══════════════════════════════════════════════════════════\n');

  const sources = [
    {
      name: 'NFL.com Game Center',
      url: 'https://www.nfl.com/games/steelers-at-bengals-2025-reg-7',
      notes: [
        'Has official "Gameday Roster" tab',
        'Shows all 53 players with Active/Inactive status',
        'Updated ~90 minutes before kickoff',
        'Most reliable official source'
      ],
      apiUrl: 'https://api.nfl.com/v3/shield/?query=...',
      dataFormat: 'GraphQL API (requires investigation)',
      pros: [
        '✅ Official NFL source',
        '✅ Has active/inactive designations',
        '✅ Shows all 53 players',
        '✅ Injury designations included'
      ],
      cons: [
        '❌ GraphQL endpoint (complex)',
        '❌ May require authentication',
        '❌ Rate limiting unknown'
      ]
    },
    {
      name: 'ESPN Game Center (Web)',
      url: 'https://www.espn.com/nfl/game/_/gameId/401772941',
      notes: [
        'Has "Depth Chart" tab',
        'May show game-day actives',
        'Need to check if different from API'
      ],
      apiUrl: 'Same as already tested (no full roster)',
      dataFormat: 'JSON API',
      pros: [
        '✅ Already familiar with API',
        '✅ Easy to parse'
      ],
      cons: [
        '❌ API only has players with stats (confirmed)',
        '❌ Web scraping would be unreliable'
      ]
    },
    {
      name: 'Pro Football Reference',
      url: 'https://www.pro-football-reference.com/boxscores/202510200cin.htm',
      notes: [
        'Has detailed boxscores',
        'Shows snap counts',
        'May have inactive lists in text'
      ],
      apiUrl: 'No official API - would require scraping',
      dataFormat: 'HTML parsing',
      pros: [
        '✅ Very detailed stats',
        '✅ Historical data available',
        '✅ Has snap counts (DNP = 0 snaps)'
      ],
      cons: [
        '❌ No official API',
        '❌ Scraping HTML is fragile',
        '❌ May not have pre-game inactive list'
      ]
    },
    {
      name: 'Sleeper API',
      url: 'https://docs.sleeper.com/',
      notes: [
        'Fantasy football platform',
        'Has player data',
        'May track active/inactive'
      ],
      apiUrl: 'https://api.sleeper.app/v1/...',
      dataFormat: 'JSON API',
      pros: [
        '✅ Clean JSON API',
        '✅ No authentication needed',
        '✅ Fantasy-focused (relevant data)'
      ],
      cons: [
        '❌ May not have full rosters',
        '❌ Focused on fantasy-relevant players'
      ]
    },
    {
      name: 'nflverse Data',
      url: 'https://github.com/nflverse/nflverse-data',
      notes: [
        'Community-maintained NFL data',
        'Has weekly rosters CSV',
        'Updated regularly'
      ],
      apiUrl: 'https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_weekly_2025.csv',
      dataFormat: 'CSV',
      pros: [
        '✅ Free and reliable',
        '✅ Community maintained',
        '✅ Has weekly roster snapshots',
        '✅ Includes active/inactive status'
      ],
      cons: [
        '❌ Updated weekly (not real-time)',
        '❌ May not have game-specific data'
      ]
    },
    {
      name: 'Rotowire',
      url: 'https://www.rotowire.com/football/nfl-lineups.php',
      notes: [
        'Fantasy sports site',
        'Shows starting lineups',
        'Has injury reports'
      ],
      apiUrl: 'Unknown - likely requires subscription',
      dataFormat: 'Unknown',
      pros: [
        '✅ Fantasy-focused',
        '✅ Real-time updates'
      ],
      cons: [
        '❌ May require subscription',
        '❌ Unknown API access'
      ]
    }
  ];

  sources.forEach((source, index) => {
    console.log(`${index + 1}. ${source.name}`);
    console.log(`   URL: ${source.url}`);
    console.log(`   API: ${source.apiUrl}`);
    console.log(`   Format: ${source.dataFormat}\n`);

    console.log('   Pros:');
    source.pros.forEach(pro => console.log(`     ${pro}`));

    console.log('\n   Cons:');
    source.cons.forEach(con => console.log(`     ${con}`));

    console.log('');
  });

  console.log('═══════════════════════════════════════════════════════════');
  console.log('RECOMMENDATION');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Best Option: **nflverse Weekly Rosters**\n');

  console.log('Why:');
  console.log('✅ Free and reliable');
  console.log('✅ Already using nflverse for play-by-play data');
  console.log('✅ Has weekly roster snapshots with active status');
  console.log('✅ CSV format (easy to parse)');
  console.log('✅ Community-maintained and well-documented\n');

  console.log('Data Available:');
  console.log('- Weekly roster snapshots (who was on 53-man roster each week)');
  console.log('- Player status (Active, Inactive, IR, Practice Squad)');
  console.log('- Team changes week-to-week');
  console.log('- Position, depth chart order\n');

  console.log('Implementation:');
  console.log('1. Download weekly roster CSV from nflverse');
  console.log('2. Import to database (new table: weekly_rosters)');
  console.log('3. Cross-reference with game_rosters (who actually played)');
  console.log('4. Provides: Full 53-man roster + who played + who was inactive\n');

  console.log('Example URL:');
  console.log('https://github.com/nflverse/nflverse-data/releases/download/rosters/roster_weekly_2025.csv');
  console.log('');

  console.log('Alternative: **NFL.com GraphQL API**');
  console.log('- More real-time');
  console.log('- More complex to implement');
  console.log('- May have rate limits/auth requirements');
  console.log('- Could investigate if nflverse doesn\'t meet needs\n');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('NEXT STEPS');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('1. Test nflverse weekly rosters CSV');
  console.log('2. Check data format and completeness');
  console.log('3. Create scraper to import weekly rosters');
  console.log('4. Cross-reference with existing game_rosters\n');

  console.log('Would you like me to:');
  console.log('A) Test nflverse weekly rosters (RECOMMENDED)');
  console.log('B) Investigate NFL.com GraphQL API');
  console.log('C) Try another source\n');
}

investigateNFLSources()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
