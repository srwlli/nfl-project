/**
 * Test NFL.com injury page HTML structure
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

async function testNFLInjuryPage() {
  try {
    console.log('Fetching NFL.com injury page...')

    const response = await axios.get('https://www.nfl.com/injuries/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const $ = cheerio.load(response.data)

    console.log('\n=== Page Structure Analysis ===\n')

    // Try different selectors
    const selectors = [
      'div[class*="injury"]',
      'div[class*="matchup"]',
      'table',
      '.nfl-o-matchup-injury',
      '[data-testid*="injury"]'
    ]

    for (const selector of selectors) {
      const count = $(selector).length
      console.log(`Selector: "${selector}" - Found: ${count} elements`)

      if (count > 0 && count < 10) {
        $(selector).first().each((_, el) => {
          const classes = $(el).attr('class')
          console.log(`  First element classes: ${classes}`)
        })
      }
    }

    // Check for tables
    console.log('\n=== Table Analysis ===\n')
    console.log(`Total tables found: ${$('table').length}`)

    if ($('table').length > 0) {
      $('table').first().each((_, table) => {
        const $table = $(table)
        console.log('First table structure:')
        console.log('  Headers:', $table.find('th').map((_, th) => $(th).text().trim()).get())
        console.log('  First row cells:', $table.find('tbody tr').first().find('td').map((_, td) => $(td).text().trim()).get())
      })
    }

    // Save sample HTML for inspection
    const sampleHTML = $('body').html().substring(0, 5000)
    console.log('\n=== First 500 chars of body HTML ===\n')
    console.log(sampleHTML.substring(0, 500))

  } catch (error) {
    console.error('Error:', error.message)
  }
}

testNFLInjuryPage()
