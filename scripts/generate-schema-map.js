/**
 * Generate Schema Map from Live Database
 *
 * Queries actual database tables to get exact column names and types
 * Outputs to coderef/training/database-schema-map.json
 */

import { getSupabaseClient } from './utils/supabase-client.js'
import fs from 'fs'

const supabase = getSupabaseClient()

/**
 * Get all column names and sample data for a table
 */
async function getTableSchema(tableName) {
  console.log(`Fetching schema for ${tableName}...`)

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1)

  if (error) {
    console.error(`  ❌ Error fetching ${tableName}:`, error.message)
    return null
  }

  if (!data || data.length === 0) {
    console.log(`  ⚠️  ${tableName} is empty, getting columns from metadata...`)
    // Try empty select to get column structure
    const { data: emptyData, error: emptyError } = await supabase
      .from(tableName)
      .select('*')
      .limit(0)

    if (emptyError) {
      return null
    }

    return {
      columns: [],
      column_count: 0,
      has_data: false,
      sample_data: null
    }
  }

  const columns = Object.keys(data[0])
  const columnTypes = {}

  // Infer types from sample data
  for (const col of columns) {
    const value = data[0][col]
    if (value === null) {
      columnTypes[col] = 'unknown (null)'
    } else {
      columnTypes[col] = typeof value
    }
  }

  console.log(`  ✅ Found ${columns.length} columns`)

  return {
    columns: columns,
    column_count: columns.length,
    column_types: columnTypes,
    has_data: true,
    sample_data: data[0]
  }
}

/**
 * Generate schema map for all tables
 */
async function generateSchemaMap() {
  console.log('\n🔍 Generating Schema Map from Live Database\n')

  const tables = [
    'teams',
    'players',
    'games',
    'stadiums',
    'player_game_stats',
    'team_game_stats',
    'player_injury_status',
    'roster_transactions',
    'player_teams',
    'scoring_plays',
    'play_by_play',
    'game_weather',
    'team_season_stats',
    'player_season_stats',
    'weekly_leaders',
    'season_cumulative_stats',
    'hot_players',
    'game_betting_lines',
    'spread_lines',
    'moneyline_odds',
    'over_under_lines',
    'betting_results'
  ]

  const schemaMap = {
    generated_at: new Date().toISOString(),
    database: 'fuzouuxhxluqjmiyabal',
    tables: {}
  }

  for (const table of tables) {
    const schema = await getTableSchema(table)
    if (schema) {
      schemaMap.tables[table] = schema
    }
  }

  // Save to coderef/training/
  const outputDir = 'coderef/training'
  const outputPath = `${outputDir}/database-schema-map.json`

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(schemaMap, null, 2))

  console.log(`\n✅ Schema map saved to ${outputPath}`)
  console.log(`\n📊 Summary:`)
  console.log(`   Total tables: ${Object.keys(schemaMap.tables).length}`)

  const totalColumns = Object.values(schemaMap.tables).reduce((sum, t) => sum + t.column_count, 0)
  console.log(`   Total columns: ${totalColumns}`)

  const tablesWithData = Object.values(schemaMap.tables).filter(t => t.has_data).length
  console.log(`   Tables with data: ${tablesWithData}/${Object.keys(schemaMap.tables).length}`)

  // Print column summary for key tables
  console.log(`\n📋 Key Tables:`)
  const keyTables = ['player_game_stats', 'players', 'games', 'teams']
  for (const table of keyTables) {
    if (schemaMap.tables[table]) {
      console.log(`   ${table}: ${schemaMap.tables[table].column_count} columns`)
    }
  }

  return schemaMap
}

/**
 * Main execution
 */
async function main() {
  try {
    const schemaMap = await generateSchemaMap()

    console.log(`\n✅ Schema generation complete!`)
    console.log(`\nNext steps:`)
    console.log(`1. Review coderef/training/database-schema-map.json`)
    console.log(`2. Update DATABASE-SCHEMA-REFERENCE.md with any new columns`)
    console.log(`3. Commit changes to git`)

    process.exit(0)
  } catch (error) {
    console.error('\n❌ Error generating schema map:', error)
    process.exit(1)
  }
}

main()
