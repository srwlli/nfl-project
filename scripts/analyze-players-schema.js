import { getSupabaseClient } from './utils/supabase-client.js'

const supabase = getSupabaseClient()

async function analyzePlayersTable() {
  console.log('═'.repeat(80))
  console.log('PLAYERS TABLE SCHEMA & 2025 DATA ANALYSIS')
  console.log('═'.repeat(80))
  console.log()

  // Get total count
  const { count: totalPlayers } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })

  console.log(`📊 TOTAL PLAYERS: ${totalPlayers}`)
  console.log()

  // Get sample row to show all columns
  const { data: sample } = await supabase
    .from('players')
    .select('*')
    .limit(1)

  if (sample && sample.length > 0) {
    console.log('📋 FULL SCHEMA (All Columns):')
    console.log('─'.repeat(80))
    const columns = Object.keys(sample[0])
    columns.forEach((col, idx) => {
      const value = sample[0][col]
      const type = value === null ? 'null' : typeof value
      const displayValue = value === null ? 'NULL' :
                          type === 'string' ? `"${value}"` :
                          type === 'boolean' ? value.toString() :
                          value
      console.log(`${(idx + 1).toString().padStart(2)}. ${col.padEnd(25)} | ${type.padEnd(10)} | ${displayValue}`)
    })
    console.log()
  }

  // Position breakdown
  const { data: positions } = await supabase
    .from('players')
    .select('primary_position')
    .not('primary_position', 'is', null)

  const positionCounts = {}
  positions?.forEach(p => {
    const pos = p.primary_position
    positionCounts[pos] = (positionCounts[pos] || 0) + 1
  })

  console.log('📊 POSITION BREAKDOWN:')
  console.log('─'.repeat(80))
  Object.entries(positionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pos, count]) => {
      console.log(`  ${pos.padEnd(4)} | ${count.toString().padStart(4)} players`)
    })
  console.log()

  // Status breakdown
  const { data: statuses } = await supabase
    .from('players')
    .select('status')

  const statusCounts = {}
  statuses?.forEach(s => {
    const status = s.status
    statusCounts[status] = (statusCounts[status] || 0) + 1
  })

  console.log('📊 STATUS BREAKDOWN:')
  console.log('─'.repeat(80))
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status.padEnd(10)} | ${count.toString().padStart(4)} players`)
  })
  console.log()

  // Sample players from different positions
  const samplePositions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'K']
  console.log('📋 SAMPLE PLAYERS BY POSITION:')
  console.log('─'.repeat(80))

  for (const pos of samplePositions) {
    const { data: posPlayers } = await supabase
      .from('players')
      .select('full_name, primary_position, jersey_number, height_inches, weight_lbs, college')
      .eq('primary_position', pos)
      .limit(2)

    if (posPlayers && posPlayers.length > 0) {
      console.log(`\n${pos} Players:`)
      posPlayers.forEach(p => {
        const height = p.height_inches ? `${Math.floor(p.height_inches/12)}'${p.height_inches%12}"` : 'N/A'
        console.log(`  #${(p.jersey_number || '??').toString().padStart(2)} ${p.full_name.padEnd(25)} | ${height.padEnd(6)} | ${(p.weight_lbs || 'N/A').toString().padStart(3)}lbs | ${p.college || 'N/A'}`)
      })
    }
  }

  console.log()
  console.log('═'.repeat(80))
  console.log('SCHEMA NOTES:')
  console.log('═'.repeat(80))
  console.log('✅ PRIMARY KEY: player_id (VARCHAR)')
  console.log('✅ CRITICAL COLUMN: primary_position (NOT "position")')
  console.log('✅ HEIGHT: Stored in total inches (convert to feet + inches for display)')
  console.log('✅ WEIGHT: Stored in pounds (weight_lbs)')
  console.log('✅ STATUS ENUM: active | injured | inactive | suspended')
  console.log('═'.repeat(80))
}

analyzePlayersTable().catch(console.error)
