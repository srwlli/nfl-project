import { fetchScoreboardData } from './scripts/get-live-scoreboard.js'
import { fetchTeamRoster } from './scripts/get-team-roster.js'

console.log('='.repeat(80))
console.log('WEEK 4 SCOREBOARD')
console.log('='.repeat(80))

const scoreboard = await fetchScoreboardData(4)

console.log(`\nWeek: ${scoreboard.week}, Season: ${scoreboard.season}`)
console.log(`Games: ${scoreboard.summary.total} | Final: ${scoreboard.summary.completed} | Upcoming: ${scoreboard.summary.scheduled}\n`)

if (scoreboard.games.completed.length > 0) {
  console.log('✅ FINAL SCORES')
  console.log('-'.repeat(80))
  scoreboard.games.completed.forEach(game => {
    console.log(`${game.awayTeam.abbreviation.padEnd(4)} ${String(game.awayTeam.score).padStart(2)}  at  ${game.homeTeam.abbreviation.padEnd(4)} ${String(game.homeTeam.score).padStart(2)}  [${game.statusDisplay}]`)
  })
  console.log('')
}

if (scoreboard.games.scheduled.length > 0) {
  console.log('📅 UPCOMING GAMES')
  console.log('-'.repeat(80))
  scoreboard.games.scheduled.forEach(game => {
    console.log(`${game.awayTeam.abbreviation}  at  ${game.homeTeam.abbreviation}  (${game.date} ${game.time})`)
  })
  console.log('')
}

console.log('='.repeat(80))
console.log('SEATTLE SEAHAWKS ROSTER')
console.log('='.repeat(80))

const roster = await fetchTeamRoster('SEA')
console.log(`\n${roster.team.name} (${roster.team.abbreviation})`)
console.log(`${roster.team.city} • ${roster.team.conference} ${roster.team.division}`)
console.log(`Total Players: ${roster.rosterSize}\n`)

// Show QB roster
if (roster.byPosition.QB) {
  console.log(`QB (${roster.byPosition.QB.length})`)
  console.log('-'.repeat(80))
  roster.byPosition.QB.forEach(p => {
    console.log(`#${p.jerseyNumber || '??'}  ${p.name.padEnd(25)}  ${p.height || ''}  ${p.weight ? p.weight + ' lbs' : ''}`)
  })
  console.log('')
}

// Show RB roster
if (roster.byPosition.RB) {
  console.log(`RB (${roster.byPosition.RB.length})`)
  console.log('-'.repeat(80))
  roster.byPosition.RB.forEach(p => {
    console.log(`#${p.jerseyNumber || '??'}  ${p.name.padEnd(25)}  ${p.height || ''}  ${p.weight ? p.weight + ' lbs' : ''}`)
  })
  console.log('')
}

// Show WR roster
if (roster.byPosition.WR) {
  console.log(`WR (${roster.byPosition.WR.length})`)
  console.log('-'.repeat(80))
  roster.byPosition.WR.slice(0, 5).forEach(p => {
    console.log(`#${p.jerseyNumber || '??'}  ${p.name.padEnd(25)}  ${p.height || ''}  ${p.weight ? p.weight + ' lbs' : ''}`)
  })
  if (roster.byPosition.WR.length > 5) {
    console.log(`... and ${roster.byPosition.WR.length - 5} more WRs`)
  }
  console.log('')
}

console.log('='.repeat(80))
