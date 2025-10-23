const { AnalyzerService } = require('../../../../coderef-system/packages/core/dist/index.js');
const { scanCurrentElements } = require('../../../../coderef-system/packages/core/dist/index.js');
const { convertGraphToElements } = require('../../../../coderef-system/packages/core/dist/index.js');
const path = require('path');

async function debug() {
  const sourceDir = path.resolve('../..');

  console.log('Step 1: Regex scan...');
  const regexResults = await scanCurrentElements(sourceDir, ['js'], {
    exclude: [],
    verbose: false,
    recursive: true,
  });

  console.log(`Found ${regexResults.length} regex elements\n`);

  // Show sample regex results
  console.log('Sample regex elements:');
  regexResults.slice(0, 3).forEach(el => {
    console.log(`  ${el.name} | ${el.file}`);
  });

  console.log('\nStep 2: Build element map...');
  const elementMap = new Map();
  for (const el of regexResults) {
    if (el.file.endsWith('.js')) {
      elementMap.set(el.name, {
        id: el.name,
        type: el.type,
        file: el.file,
        line: el.line
      });
    }
  }

  console.log(`Element map size: ${elementMap.size}`);
  console.log('\nSample element map entries:');
  let count = 0;
  for (const [key, value] of elementMap) {
    if (count++ < 3) {
      console.log(`  key="${key}" -> file="${value.file}"`);
    }
  }

  console.log('\nStep 3: AST analysis with element map...');
  const astAnalyzer = new AnalyzerService(sourceDir);
  astAnalyzer.setElementMap(elementMap);
  const result = await astAnalyzer.analyze(['**/*.js', '!**/node_modules/**'], false);

  console.log(`Graph has ${result.graph.nodes.size} nodes\n`);

  // Show sample graph nodes
  console.log('Sample graph nodes:');
  count = 0;
  for (const [id, node] of result.graph.nodes) {
    if (count++ < 5) {
      console.log(`  id="${id}" | file="${node.file}" | type="${node.type}"`);
    }
  }

  console.log('\nStep 4: Convert graph to elements...');
  const astResults = convertGraphToElements(result.graph, { verbose: false });

  console.log(`Got ${astResults.length} AST elements\n`);

  // Show sample AST results
  console.log('Sample AST elements:');
  astResults.slice(0, 5).forEach(el => {
    console.log(`  ${el.name} | ${el.file}`);
    if (el.calls) console.log(`    calls: [${el.calls.join(', ')}]`);
    if (el.parameters) console.log(`    parameters: [${el.parameters.join(', ')}]`);
  });

  // Now check if they would match
  console.log('\n\nMatching analysis:');
  const normalizeFile = (f) => f.replace(/^\.\//, '').replace(/\\/g, '/');

  const regexKey = `${normalizeFile(regexResults[0].file)}|${regexResults[0].name}`;
  const astKey = `${normalizeFile(astResults[0].file)}|${astResults[0].name}`;

  console.log(`Regex key: "${regexKey}"`);
  console.log(`AST key:   "${astKey}"`);
  console.log(`Match: ${regexKey === astKey}`);
}

debug().catch(console.error);
