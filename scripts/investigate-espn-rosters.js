/**
 * Investigate ESPN roster data structure
 * Check if we can get full 53-man game-day rosters with active/inactive status
 */

import { fetchGameSummary } from './utils/espn-api.js';
import { logger } from './utils/logger.js';

async function investigateRosters() {
  // Test with a recent Week 7 game
  const gameId = '401772941'; // PIT @ CIN Week 7

  logger.info('🔍 Investigating ESPN roster data structure');
  logger.info(`Game ID: ${gameId}\n`);

  try {
    const gameSummary = await fetchGameSummary(gameId);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('AVAILABLE DATA SOURCES IN GAME SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 1. Check rosters array
    if (gameSummary.rosters && gameSummary.rosters.length > 0) {
      console.log('✅ gameSummary.rosters EXISTS');
      console.log(`   Teams: ${gameSummary.rosters.length}`);

      gameSummary.rosters.forEach((teamRoster, index) => {
        console.log(`\n   Team ${index + 1}: ${teamRoster.team?.displayName || 'Unknown'}`);
        console.log(`   Team ID: ${teamRoster.team?.id}`);

        if (teamRoster.roster && teamRoster.roster.length > 0) {
          console.log(`   Total Players: ${teamRoster.roster.length}`);

          // Check first player structure
          const firstPlayer = teamRoster.roster[0];
          console.log(`\n   Sample Player Structure:`);
          console.log(`   {`);
          Object.keys(firstPlayer).forEach(key => {
            const value = firstPlayer[key];
            if (typeof value === 'object' && value !== null) {
              console.log(`     ${key}: { ... } (object)`);
              if (key === 'athlete') {
                console.log(`       athlete.id: ${value.id}`);
                console.log(`       athlete.displayName: ${value.displayName}`);
                console.log(`       athlete.position: ${value.position?.abbreviation}`);
                console.log(`       athlete.jersey: ${value.jersey}`);
              }
            } else {
              console.log(`     ${key}: ${value}`);
            }
          });
          console.log(`   }`);

          // Count active vs inactive
          const active = teamRoster.roster.filter(p => p.status !== 'inactive').length;
          const inactive = teamRoster.roster.filter(p => p.status === 'inactive').length;

          console.log(`\n   Active: ${active}`);
          console.log(`   Inactive: ${inactive}`);

          // Show sample inactive players if they exist
          const inactivePlayers = teamRoster.roster.filter(p => p.status === 'inactive');
          if (inactivePlayers.length > 0) {
            console.log(`\n   Sample Inactive Players:`);
            inactivePlayers.slice(0, 3).forEach(p => {
              console.log(`     - ${p.athlete?.displayName} (${p.athlete?.position?.abbreviation}) - Status: ${p.status}`);
            });
          }

          // Check for "started" field
          const withStarted = teamRoster.roster.filter(p => p.started === true).length;
          if (withStarted > 0) {
            console.log(`\n   ✅ Players with started=true: ${withStarted}`);
          }
        }
      });
    } else {
      console.log('❌ gameSummary.rosters NOT FOUND');
    }

    // 2. Check boxscore.players (current source)
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('BOXSCORE.PLAYERS (Current Source)');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (gameSummary.boxscore && gameSummary.boxscore.players) {
      console.log('✅ gameSummary.boxscore.players EXISTS');
      console.log(`   Teams: ${gameSummary.boxscore.players.length}`);

      gameSummary.boxscore.players.forEach((teamData, index) => {
        console.log(`\n   Team ${index + 1}: ${teamData.team?.displayName || 'Unknown'}`);

        let totalPlayers = 0;
        if (teamData.statistics) {
          teamData.statistics.forEach(statGroup => {
            if (statGroup.athletes) {
              totalPlayers += statGroup.athletes.length;
            }
          });
        }

        console.log(`   Total Players with Stats: ${totalPlayers}`);
        console.log(`   (Only includes players who recorded stats)`);
      });
    } else {
      console.log('❌ gameSummary.boxscore.players NOT FOUND');
    }

    // 3. Summary comparison
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('COMPARISON');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (gameSummary.rosters && gameSummary.rosters.length > 0) {
      const rosterTotal = gameSummary.rosters.reduce((sum, team) => sum + (team.roster?.length || 0), 0);
      console.log(`📋 Rosters Array: ${rosterTotal} total players`);
    }

    if (gameSummary.boxscore && gameSummary.boxscore.players) {
      let boxscoreTotal = 0;
      gameSummary.boxscore.players.forEach(teamData => {
        if (teamData.statistics) {
          teamData.statistics.forEach(statGroup => {
            if (statGroup.athletes) {
              boxscoreTotal += statGroup.athletes.length;
            }
          });
        }
      });
      console.log(`📊 Boxscore Players: ${boxscoreTotal} players with stats\n`);
    }

    console.log('RECOMMENDATION:');
    if (gameSummary.rosters && gameSummary.rosters.length > 0) {
      const firstTeamRoster = gameSummary.rosters[0].roster?.length || 0;
      if (firstTeamRoster >= 50) {
        console.log('✅ USE gameSummary.rosters for full 53-man game-day roster');
        console.log('   Includes active/inactive status');
        console.log('   Contains all players, not just those with stats');
      } else {
        console.log('⚠️  Rosters array has fewer than 50 players per team');
        console.log('   May need alternative approach');
      }
    } else {
      console.log('❌ Rosters array not available - need alternative solution');
    }

    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    logger.error('Investigation failed:', error);
    throw error;
  }
}

investigateRosters()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
