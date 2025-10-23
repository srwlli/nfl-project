import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load schema and field mapping
const schema = JSON.parse(readFileSync(join(__dirname, '../coderef/schema-reference.json'), 'utf-8'))
const fieldMapping = readFileSync(join(__dirname, '../coderef/FINAL/FIELD-MAPPING-REFERENCE.md'), 'utf-8')

console.log('═'.repeat(80))
console.log('PLAYERS TABLE - FIELD MAPPING VERIFICATION')
console.log('═'.repeat(80))
console.log()

// Get players table columns from schema
const playersSchema = schema.tables.players
console.log('DATABASE SCHEMA - Players Table Columns:')
console.log('─'.repeat(80))
Object.keys(playersSchema.columns).forEach((col, idx) => {
  const info = playersSchema.columns[col]
  const warning = info.warning ? ` ⚠️ ${info.warning}` : ''
  console.log(`${(idx + 1).toString().padStart(2)}. ${col.padEnd(25)} | ${info.type.padEnd(10)}${warning}`)
})

console.log()
console.log('FIELD MAPPING REQUIREMENTS - Player Profile Section:')
console.log('─'.repeat(80))

// Extract player fields from field mapping
const playerSection = fieldMapping.match(/### 4\.1 Player Bio([\s\S]*?)---/)?.[1] || ''
const playerFields = [...playerSection.matchAll(/\| \*\*(.+?)\*\* \| `players\.(.+?)` \|/g)]

playerFields.forEach(match => {
  const displayName = match[1]
  const dbColumn = match[2]
  const exists = playersSchema.columns[dbColumn] ? '✅' : '❌'
  console.log(`${exists} ${displayName.padEnd(20)} → ${dbColumn}`)
})

console.log()
console.log('CRITICAL COLUMN VERIFICATION:')
console.log('─'.repeat(80))

const criticalColumns = [
  { field: 'primary_position', warning: 'NOT "position"' },
  { field: 'height_inches', warning: 'Total inches (not feet/inches)' },
  { field: 'weight_lbs', warning: 'Pounds (not kg)' },
  { field: 'jersey_number', warning: 'May be NULL for some players' },
  { field: 'full_name', warning: 'Display name' },
  { field: 'player_id', warning: 'Format: espn-{id}' }
]

criticalColumns.forEach(({ field, warning }) => {
  const exists = playersSchema.columns[field]
  const status = exists ? '✅ EXISTS' : '❌ MISSING'
  console.log(`  ${status.padEnd(12)} | ${field.padEnd(20)} | ${warning}`)
})

console.log()
console.log('SUMMARY:')
console.log('─'.repeat(80))
console.log(`Total Database Columns: ${Object.keys(playersSchema.columns).length}`)
console.log(`Mapped Fields Found: ${playerFields.length}`)
console.log(`Critical Columns: ${criticalColumns.filter(c => playersSchema.columns[c.field]).length}/${criticalColumns.length}`)
