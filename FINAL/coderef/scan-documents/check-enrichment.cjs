const fs = require('fs');

// Read the cleaned JSON file
const data = JSON.parse(fs.readFileSync('./scan-full-enriched-clean.json', 'utf8'));

console.log(`Total elements: ${data.length}\n`);

// Check for enriched elements (have parameters or calls)
const enriched = data.filter(el => el.parameters || el.calls);
console.log(`Enriched elements: ${enriched.length}\n`);

if (enriched.length > 0) {
  console.log('Sample enriched elements:');
  enriched.slice(0, 10).forEach(el => {
    console.log(`  ${el.type}: ${el.name} in ${el.file}:${el.line}`);
    if (el.parameters) console.log(`    parameters: [${el.parameters.join(', ')}]`);
    if (el.calls) console.log(`    calls: [${el.calls.join(', ')}]`);
  });
} else {
  console.log('❌ No enriched elements found');
  console.log('\nSample elements (first 5):');
  data.slice(0, 5).forEach(el => {
    console.log(`  ${el.type}: ${el.name} in ${el.file}:${el.line}`);
    console.log(`    has parameters: ${!!el.parameters}`);
    console.log(`    has calls: ${!!el.calls}`);
  });
}
