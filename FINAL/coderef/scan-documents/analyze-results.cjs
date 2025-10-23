// Analyze scan results
const fs = require('fs');
const path = require('path');

const scanFile = path.join(__dirname, 'scan-regex.json');
const data = JSON.parse(fs.readFileSync(scanFile, 'utf-8'));

// Calculate statistics
const stats = {
  total: data.length,
  files: new Set(data.map(e => e.file)).size,
  byType: {},
  topFiles: {},
};

// Count by type
data.forEach(e => {
  stats.byType[e.type] = (stats.byType[e.type] || 0) + 1;

  // Track elements per file
  if (!stats.topFiles[e.file]) {
    stats.topFiles[e.file] = 0;
  }
  stats.topFiles[e.file]++;
});

// Get top 10 files
const topFiles = Object.entries(stats.topFiles)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([file, count]) => ({
    file: path.basename(file),
    count
  }));

// Sample elements
const samples = {
  functions: data.filter(e => e.type === 'function').slice(0, 3),
  methods: data.filter(e => e.type === 'method').slice(0, 3),
  constants: data.filter(e => e.type === 'constant').slice(0, 3),
};

console.log('\n📊 Scan Results Analysis\n');
console.log('Total Elements:', stats.total);
console.log('Files Scanned:', stats.files);
console.log('\nBy Type:');
Object.entries(stats.byType)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

console.log('\nTop 10 Files (by element count):');
topFiles.forEach((f, i) => {
  console.log(`  ${i + 1}. ${f.file}: ${f.count} elements`);
});

console.log('\nSample Elements:');
console.log('  Functions:', samples.functions.map(e => e.name).join(', '));
console.log('  Methods:', samples.methods.map(e => e.name).join(', '));
console.log('  Constants:', samples.constants.map(e => e.name).join(', '));

// Save detailed stats
const output = {
  summary: {
    total: stats.total,
    files: stats.files,
    avgElementsPerFile: (stats.total / stats.files).toFixed(2),
  },
  byType: stats.byType,
  topFiles,
  samples,
};

fs.writeFileSync(
  path.join(__dirname, 'analysis.json'),
  JSON.stringify(output, null, 2)
);

console.log('\n✅ Analysis saved to analysis.json');
