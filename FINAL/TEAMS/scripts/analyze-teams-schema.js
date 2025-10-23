import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

console.log('═'.repeat(80))
console.log('TEAMS TABLE SCHEMA & DATA ANALYSIS')
console.log('═'.repeat(80))
console.log()

// Get total count
const { count: totalTeams } = await supabase
  .from('teams')
  .select('*', { count: 'exact', head: true })

console.log(`📊 TOTAL TEAMS: ${totalTeams}`)
console.log()

// Get sample team to show all columns
const { data: sample } = await supabase
  .from('teams')
  .select('*')
  .limit(1)
  .single()

console.log('📋 FULL SCHEMA (All Columns):')
console.log('─'.repeat(80))

Object.keys(sample).forEach((col, idx) => {
  const value = sample[col]
  const type = typeof value
  const example = type === 'string' && value.length > 50
    ? value.substring(0, 47) + '...'
    : JSON.stringify(value)

  console.log(`${(idx + 1).toString().padStart(2)}. ${col.padEnd(25)} | ${type.padEnd(10)} | ${example}`)
})

console.log()
console.log('📊 ALL TEAMS:')
console.log('─'.repeat(80))

const { data: allTeams } = await supabase
  .from('teams')
  .select('team_id, team_name, team_abbr, conference, division')
  .order('conference')
  .order('division')
  .order('team_name')

let currentConference = ''
let currentDivision = ''

allTeams.forEach(team => {
  if (team.conference !== currentConference) {
    currentConference = team.conference
    console.log()
    console.log(`${currentConference} Conference:`)
    console.log('─'.repeat(80))
  }

  if (team.division !== currentDivision) {
    currentDivision = team.division
    console.log(`  ${currentDivision} Division:`)
  }

  console.log(`    ${team.team_abbr.padEnd(4)} | ${team.team_name}`)
})

console.log()
console.log('═'.repeat(80))
console.log('SCHEMA NOTES:')
console.log('═'.repeat(80))
console.log('✅ PRIMARY KEY: team_id (VARCHAR)')
console.log('✅ CRITICAL COLUMN: team_abbr (NOT "abbreviation")')
console.log('✅ CONFERENCE: AFC | NFC')
console.log('✅ DIVISION: East | West | North | South')
console.log('═'.repeat(80))

process.exit(0)
