import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const schema = JSON.parse(readFileSync(join(__dirname, '../coderef/schema-reference.json'), 'utf-8'))

console.log('═'.repeat(80))
console.log('DATABASE TABLES (Current Schema)')
console.log('═'.repeat(80))
console.log()
console.log(`Total Tables: ${schema.total_tables}`)
console.log(`Total Columns: ${schema.total_columns}`)
console.log()

console.log('Tables with Data:')
console.log('─'.repeat(80))
Object.entries(schema.tables).forEach(([name, info]) => {
  const padding = ' '.repeat(Math.max(0, 30 - name.length))
  console.log(`  ${name}${padding} | ${info.row_count}`)
})

console.log()
console.log('Empty Tables:')
console.log('─'.repeat(80))
if (schema.empty_tables) {
  schema.empty_tables.tables.forEach(t => console.log(`  - ${t}`))
}

console.log()
console.log('Missing/Views:')
console.log('─'.repeat(80))
if (schema.missing_tables) {
  schema.missing_tables.tables.forEach(t => console.log(`  - ${t}`))
  console.log()
  console.log(`  Reason: ${schema.missing_tables.reason}`)
}
