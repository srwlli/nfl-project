import axios from 'axios'
import * as cheerio from 'cheerio'

async function test() {
  const response = await axios.get('https://www.nfl.com/injuries/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })

  const $ = cheerio.load(response.data)

  console.log('=== Finding Team Names ===\n')

  // Find all tables and their preceding headers
  $('table').each((i, table) => {
    const $table = $(table)

    // Look for team name in various places
    const prevH3 = $table.prevAll('h3').first().text().trim()
    const prevH4 = $table.prevAll('h4').first().text().trim()
    const parentDiv = $table.parent().parent().find('h3, h4').first().text().trim()

    // Get first player name
    const firstPlayer = $table.find('tbody tr').first().find('td').first().text().trim()

    console.log(`Table ${i + 1}:`)
    console.log(`  prevH3: "${prevH3}"`)
    console.log(`  prevH4: "${prevH4}"`)
    console.log(`  parentDiv header: "${parentDiv}"`)
    console.log(`  First player: "${firstPlayer}"`)
    console.log('')

    if (i >= 2) return false // Only show first 3 tables
  })
}

test().catch(console.error)
