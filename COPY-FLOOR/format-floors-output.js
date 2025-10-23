import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync(0, 'utf-8'));

console.log('# WEEK 7 PERFORMANCE FLOOR PROJECTIONS\n');

data.games.forEach(game => {
  console.log(`\n## ${game.team_id} vs ${game.opponent_id} (Week ${game.week})`);
  console.log(`Environment: ${game.environment.details} (${game.environment.modifier}x modifier)\n`);

  game.players.forEach(player => {
    console.log(`### ${player.player_name} (${player.position}) - ${player.games_played} games`);
    player.projections.forEach(proj => {
      console.log(`  **${proj.stat}**: Expected ${proj.expected} | Floor ${proj.floor} | Ceiling ${proj.ceiling} | Confidence ${proj.confidence}%`);
    });
    console.log('');
  });
});
