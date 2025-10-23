/**
 * Train Feature Importance Model
 *
 * Trains Random Forest on completed 2025 season games to learn optimal
 * weights for opponent defense, venue, and home field advantage.
 *
 * Saves learned weights to performance-floors-config.json
 *
 * Usage:
 *   node scripts/train-feature-weights.js --week=7
 *   node scripts/train-feature-weights.js --auto
 */

import { trainFeatureImportanceModel } from './utils/feature-importance.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, 'performance-floors-config.json');

async function main() {
  const args = process.argv.slice(2);

  // Determine max week for training
  let maxWeek = 17;
  const weekArg = args.find(arg => arg.startsWith('--week='));
  if (weekArg) {
    maxWeek = parseInt(weekArg.split('=')[1]);
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`Training Feature Importance Model`);
  console.log(`Using data through Week ${maxWeek}, 2025 season`);
  console.log('='.repeat(80));

  try {
    // Train model
    const results = await trainFeatureImportanceModel({
      season: 2025,
      maxWeek: maxWeek,
      performCV: true
    });

    console.log(`\n✅ Training complete!`);
    console.log(`   Training samples: ${results.trainingSize}`);
    console.log(`   Cross-validation R²: ${results.cvResults.avgR2.toFixed(3)}`);
    console.log(`   Cross-validation MSE: ${results.cvResults.avgMSE.toFixed(2)}`);

    // Load current config
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));

    // Update config with learned weights
    config.learned_feature_weights = {
      generated_at: new Date().toISOString(),
      training_week: maxWeek,
      training_samples: results.trainingSize,
      cross_validation_r2: results.cvResults.avgR2,
      importances: results.importances
    };

    // Save updated config
    writeFileSync(configPath, JSON.stringify(config, null, 2));

    console.log(`\n✅ Saved learned weights to ${configPath}`);
    console.log(`\nLearned Feature Importances:`);
    for (const [feature, importance] of Object.entries(results.importances)) {
      console.log(`   ${feature}: ${(importance * 100).toFixed(1)}%`);
    }

    console.log(`\n💡 Tip: Re-run this weekly to keep weights current!`);

  } catch (error) {
    console.error(`\n❌ Error training model:`, error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
