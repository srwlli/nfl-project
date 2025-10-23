/**
 * Test different ESPN endpoints to find full 53-man game-day rosters
 */

import { getSupabaseClient } from './utils/supabase-client.js';

const GAME_ID = '401772941'; // PIT @ CIN Week 7
const RATE_LIMIT_DELAY = 1000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchEndpoint(url, name) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  console.log('═'.repeat(60));

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}: ${response.statusText}\n`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Success! Response received\n`);

    return data;
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
    return null;
  }
}

async function investigateEndpoints() {
  console.log('🔍 Investigating ESPN API Endpoints for Game-Day Rosters\n');
  console.log(`Game: PIT @ CIN (Week 7)`);
  console.log(`Game ID: ${GAME_ID}\n`);

  const endpoints = [
    {
      name: '1. Game Summary (Current)',
      url: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${GAME_ID}`,
      check: (data) => {
        if (data.rosters) {
          console.log(`   ✅ Has rosters array: ${data.rosters.length} teams`);
          if (data.rosters[0]?.roster) {
            console.log(`   ✅ First team roster: ${data.rosters[0].roster.length} players`);
          }
        } else {
          console.log(`   ❌ No rosters array`);
        }

        if (data.boxscore?.players) {
          let total = 0;
          data.boxscore.players.forEach(team => {
            if (team.statistics) {
              team.statistics.forEach(group => {
                if (group.athletes) total += group.athletes.length;
              });
            }
          });
          console.log(`   📊 Boxscore players: ${total} (only with stats)`);
        }
      }
    },
    {
      name: '2. Play-by-Play',
      url: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/playbyplay?event=${GAME_ID}`,
      check: (data) => {
        if (data.teams) {
          console.log(`   ✅ Has teams array: ${data.teams.length}`);
          if (data.teams[0]?.roster) {
            console.log(`   ✅ Team roster: ${data.teams[0].roster.length} players`);
          } else {
            console.log(`   ❌ No roster in teams array`);
          }
        }

        if (data.gameInfo) {
          console.log(`   ℹ️  Has gameInfo`);
        }
      }
    },
    {
      name: '3. Scoreboard (Week Level)',
      url: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=7&seasontype=2&dates=2025`,
      check: (data) => {
        if (data.events) {
          console.log(`   ✅ Has events array: ${data.events.length} games`);

          const game = data.events.find(e => e.id === GAME_ID);
          if (game) {
            console.log(`   ✅ Found our game`);

            if (game.competitions && game.competitions[0]) {
              const comp = game.competitions[0];

              if (comp.competitors) {
                console.log(`   ✅ Has competitors: ${comp.competitors.length}`);

                comp.competitors.forEach((team, i) => {
                  console.log(`\n   Team ${i + 1}: ${team.team?.displayName}`);

                  if (team.roster) {
                    console.log(`     ✅ Roster: ${team.roster.length} players`);

                    // Show first player
                    if (team.roster[0]) {
                      console.log(`     Sample: ${team.roster[0].athlete?.displayName}`);
                      console.log(`     Fields: ${Object.keys(team.roster[0]).join(', ')}`);
                    }
                  } else {
                    console.log(`     ❌ No roster`);
                  }
                });
              }
            }
          } else {
            console.log(`   ❌ Game not found in scoreboard`);
          }
        }
      }
    },
    {
      name: '4. Team Roster (PIT)',
      url: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/23/roster`,
      check: (data) => {
        if (data.athletes) {
          console.log(`   ✅ Has athletes array: ${data.athletes.length} players`);
          console.log(`   ⚠️  This is FULL team roster, not game-specific`);

          if (data.athletes[0]) {
            console.log(`\n   Sample Player Fields:`);
            console.log(`   ${Object.keys(data.athletes[0]).join(', ')}`);
          }
        }
      }
    },
    {
      name: '5. Game (alternate endpoint)',
      url: `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${GAME_ID}`,
      check: (data) => {
        console.log(`   ℹ️  Response keys: ${Object.keys(data).join(', ')}`);

        if (data.$ref) {
          console.log(`   ℹ️  Has $ref link (need to follow)`);
        }

        if (data.competitions) {
          console.log(`   ✅ Has competitions`);
        }
      }
    }
  ];

  for (const endpoint of endpoints) {
    const data = await fetchEndpoint(endpoint.url, endpoint.name);

    if (data && endpoint.check) {
      endpoint.check(data);
    }

    await sleep(RATE_LIMIT_DELAY);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY & RECOMMENDATIONS');
  console.log('═'.repeat(60));
  console.log(`
Based on investigation, ESPN provides:

1. ❌ Game Summary: Only boxscore players (with stats)
2. ❓ Play-by-Play: Need to check
3. ❓ Scoreboard: May have game-day rosters in competitors
4. ✅ Team Roster: Full team (not game-specific)

NEXT STEPS:
- Check scoreboard endpoint more carefully
- May need to cross-reference team roster with game participation
- Alternative: Use boxscore players + create GP/GS from presence
  `);
  console.log('═'.repeat(60));
}

investigateEndpoints()
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
