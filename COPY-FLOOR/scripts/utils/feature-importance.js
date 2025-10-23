/**
 * Feature Importance Learning Module
 *
 * Uses Random Forest regression to learn optimal weights for opponent defensive
 * efficiency, venue type, weather conditions, and home/away advantage from
 * completed NFL games. Replaces hardcoded modifier weights with data-driven values.
 *
 * Academic Foundation:
 * @citation Byman, J. (2023). "Building a Statistical Learning Model for Evaluation
 *           of NBA Players." Ramapo College.
 *           https://www.ramapo.edu/dmc/wp-content/uploads/sites/361/2023/05/MSDS-Byman.pdf
 *
 * Theory:
 * Random Forest regression identifies which features (opponent defense, venue, etc.)
 * have the most predictive power for actual player performance. Feature importances
 * are calculated from the decrease in impurity (variance) when splitting on each feature.
 *
 * This creates data-driven weights that adapt to current season patterns rather than
 * relying on historical assumptions.
 */

import { RandomForestRegression } from 'ml-random-forest';
import { getSupabaseClient } from './supabase-client.js';

const supabase = getSupabaseClient();

/**
 * Prepare training data from completed games
 *
 * Fetches historical player performance and contextual factors (opponent strength,
 * venue, weather, home/away) from database for use in Random Forest training.
 *
 * @param {Object} options - Training data options
 * @param {number} options.season - Season year
 * @param {number} options.minWeek - Minimum week (default: 1)
 * @param {number} options.maxWeek - Maximum week (default: current week - 1)
 * @param {Array<string>} options.positions - Positions to include (default: ['QB', 'RB', 'WR', 'TE'])
 * @returns {Promise<Object>} Training data with features and targets
 */
export async function prepareTrainingData(options = {}) {
  const {
    season = 2025,
    minWeek = 1,
    maxWeek = 17,
    positions = ['QB', 'RB', 'WR', 'TE'],
    statField = 'fantasy_points_ppr'
  } = options;

  console.log(`Preparing training data for weeks ${minWeek}-${maxWeek}, season ${season}...`);

  // Fetch completed games
  const { data: games } = await supabase
    .from('games')
    .select('game_id, week, home_team_id, away_team_id, season, stadium_id')
    .eq('season', season)
    .eq('status', 'final')
    .gte('week', minWeek)
    .lte('week', maxWeek);

  if (!games || games.length === 0) {
    throw new Error(`No completed games found for season ${season}, weeks ${minWeek}-${maxWeek}`);
  }

  console.log(`Found ${games.length} completed games`);

  const trainingExamples = [];
  const gameIds = games.map(g => g.game_id);

  // Fetch all player stats for these games in batch
  const { data: playerStats } = await supabase
    .from('player_game_stats')
    .select(`
      player_id, game_id, team_id,
      ${statField},
      passing_yards, rushing_yards, receiving_yards
    `)
    .in('game_id', gameIds)
    .in('position', positions)
    .eq('season', season);

  if (!playerStats || playerStats.length === 0) {
    throw new Error('No player stats found for training');
  }

  console.log(`Found ${playerStats.length} player stat records`);

  // Fetch team defensive stats (yards allowed) for opponent strength calculation
  const { data: teamDefenseStats } = await supabase
    .from('team_game_stats')
    .select('game_id, team_id, total_yards_allowed')
    .in('game_id', gameIds)
    .eq('season', season);

  // Create lookup maps
  const gameMap = new Map(games.map(g => [g.game_id, g]));
  const defenseMap = new Map();

  for (const stat of (teamDefenseStats || [])) {
    if (!defenseMap.has(stat.team_id)) {
      defenseMap.set(stat.team_id, []);
    }
    defenseMap.get(stat.team_id).push(stat.total_yards_allowed || 0);
  }

  // Calculate league average yards allowed for normalization
  const allYardsAllowed = Array.from(defenseMap.values()).flat();
  const leagueAvgYardsAllowed = allYardsAllowed.reduce((a, b) => a + b, 0) / allYardsAllowed.length;

  // Fetch stadium data for venue features
  const stadiumIds = [...new Set(games.map(g => g.stadium_id).filter(id => id))];
  const { data: stadiums } = await supabase
    .from('stadiums')
    .select('stadium_id, surface_type, roof_type')
    .in('stadium_id', stadiumIds);

  const stadiumMap = new Map((stadiums || []).map(s => [s.stadium_id, s]));

  // Build training examples from player stats
  for (const stat of playerStats) {
    const game = gameMap.get(stat.game_id);
    if (!game) continue;

    const targetValue = stat[statField];
    if (targetValue === null || targetValue === undefined || isNaN(targetValue)) continue;

    // Determine if player is home or away
    const isHome = stat.team_id === game.home_team_id;
    const opponentId = isHome ? game.away_team_id : game.home_team_id;

    // Calculate opponent defensive efficiency
    const opponentYardsAllowed = defenseMap.get(opponentId) || [];
    const opponentAvg = opponentYardsAllowed.length > 0
      ? opponentYardsAllowed.reduce((a, b) => a + b, 0) / opponentYardsAllowed.length
      : leagueAvgYardsAllowed;

    const opponentDefensiveFactor = leagueAvgYardsAllowed > 0
      ? opponentAvg / leagueAvgYardsAllowed
      : 1.0;

    // Venue features
    const stadium = stadiumMap.get(game.stadium_id);
    const isTurf = stadium?.surface_type?.toLowerCase().includes('turf') ? 1 : 0;
    const isDome = (stadium?.roof_type?.toLowerCase() === 'dome' ||
                    stadium?.roof_type?.toLowerCase() === 'retractable dome') ? 1 : 0;

    // Create feature vector
    const features = {
      opponent_defense: opponentDefensiveFactor,
      is_home: isHome ? 1 : 0,
      is_turf: isTurf,
      is_dome: isDome,
      // Note: Weather features would go here if game_weather table exists
      // For now, we'll use venue/home as primary features
    };

    trainingExamples.push({
      features,
      target: targetValue
    });
  }

  console.log(`Prepared ${trainingExamples.length} training examples`);

  return {
    examples: trainingExamples,
    featureNames: Object.keys(trainingExamples[0]?.features || {}),
    sampleSize: trainingExamples.length
  };
}

/**
 * Convert training examples to matrix format for Random Forest
 *
 * @param {Array<Object>} examples - Training examples with features and targets
 * @returns {Object} Feature matrix (X) and target vector (y)
 */
export function convertToMatrixFormat(examples) {
  const X = examples.map(ex => Object.values(ex.features));
  const y = examples.map(ex => ex.target);

  return { X, y };
}

/**
 * Train Random Forest regression model
 *
 * @param {Array<Array<number>>} X - Feature matrix
 * @param {Array<number>} y - Target vector
 * @param {Object} options - Random Forest options
 * @returns {Object} Trained model
 */
export function trainRandomForest(X, y, options = {}) {
  const {
    nEstimators = 100,
    maxFeatures = 0.5,
    replacement = true,
    maxDepth = 10
  } = options;

  console.log(`Training Random Forest with ${nEstimators} estimators...`);

  const model = new RandomForestRegression({
    nEstimators,
    maxFeatures,
    replacement,
    maxDepth,
    seed: 42 // Reproducible results
  });

  model.train(X, y);

  console.log('✅ Random Forest training complete');

  return model;
}

/**
 * Extract feature importances from trained Random Forest
 *
 * Note: ml-random-forest doesn't provide built-in feature importance.
 * We'll calculate permutation importance instead (more robust anyway).
 *
 * @param {Object} model - Trained Random Forest model
 * @param {Array<Array<number>>} X - Feature matrix
 * @param {Array<number>} y - Target vector
 * @param {Array<string>} featureNames - Feature names
 * @returns {Object} Feature importances
 */
export function calculatePermutationImportance(model, X, y, featureNames) {
  console.log('Calculating permutation importance...');

  // Baseline error
  const baselinePredictions = model.predict(X);
  const baselineError = meanSquaredError(y, baselinePredictions);

  const importances = {};

  for (let featureIdx = 0; featureIdx < featureNames.length; featureIdx++) {
    // Permute this feature
    const XPermuted = X.map(row => [...row]);
    const originalValues = XPermuted.map(row => row[featureIdx]);

    // Fisher-Yates shuffle
    for (let i = originalValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [originalValues[i], originalValues[j]] = [originalValues[j], originalValues[i]];
    }

    // Apply permutation
    XPermuted.forEach((row, i) => {
      row[featureIdx] = originalValues[i];
    });

    // Calculate error with permuted feature
    const permutedPredictions = model.predict(XPermuted);
    const permutedError = meanSquaredError(y, permutedPredictions);

    // Importance = increase in error when feature is permuted
    importances[featureNames[featureIdx]] = permutedError - baselineError;
  }

  // Normalize to sum to 1.0
  const totalImportance = Object.values(importances).reduce((a, b) => a + b, 0);
  const normalizedImportances = {};

  for (const [feature, importance] of Object.entries(importances)) {
    normalizedImportances[feature] = totalImportance > 0 ? importance / totalImportance : 0;
  }

  return normalizedImportances;
}

/**
 * Calculate mean squared error
 */
function meanSquaredError(actual, predicted) {
  const errors = actual.map((y, i) => Math.pow(y - predicted[i], 2));
  return errors.reduce((a, b) => a + b, 0) / errors.length;
}

/**
 * Perform k-fold cross-validation
 *
 * @param {Array<Object>} examples - Training examples
 * @param {number} k - Number of folds
 * @returns {Object} Cross-validation metrics
 */
export function kFoldCrossValidation(examples, k = 5) {
  console.log(`Performing ${k}-fold cross-validation...`);

  const foldSize = Math.floor(examples.length / k);
  const foldScores = [];

  for (let fold = 0; fold < k; fold++) {
    const testStart = fold * foldSize;
    const testEnd = fold === k - 1 ? examples.length : testStart + foldSize;

    const testSet = examples.slice(testStart, testEnd);
    const trainSet = [...examples.slice(0, testStart), ...examples.slice(testEnd)];

    // Train on training fold
    const { X: XTrain, y: yTrain } = convertToMatrixFormat(trainSet);
    const { X: XTest, y: yTest } = convertToMatrixFormat(testSet);

    const model = trainRandomForest(XTrain, yTrain, { nEstimators: 50, maxDepth: 10 });

    // Evaluate on test fold
    const predictions = model.predict(XTest);
    const mse = meanSquaredError(yTest, predictions);
    const r2 = calculateR2(yTest, predictions);

    foldScores.push({ fold: fold + 1, mse, r2 });
  }

  const avgMSE = foldScores.reduce((sum, s) => sum + s.mse, 0) / k;
  const avgR2 = foldScores.reduce((sum, s) => sum + s.r2, 0) / k;

  return {
    foldScores,
    avgMSE,
    avgR2
  };
}

/**
 * Calculate R² (coefficient of determination)
 */
function calculateR2(actual, predicted) {
  const mean = actual.reduce((a, b) => a + b, 0) / actual.length;
  const ssTotal = actual.reduce((sum, y) => sum + Math.pow(y - mean, 2), 0);
  const ssResidual = actual.reduce((sum, y, i) => sum + Math.pow(y - predicted[i], 2), 0);

  return 1 - (ssResidual / ssTotal);
}

/**
 * Main training workflow
 *
 * @param {Object} options - Training options
 * @returns {Promise<Object>} Trained model and importances
 */
export async function trainFeatureImportanceModel(options = {}) {
  const {
    season = 2025,
    maxWeek = 17,
    performCV = true
  } = options;

  // Step 1: Prepare training data
  const trainingData = await prepareTrainingData({ season, maxWeek });

  if (trainingData.sampleSize < 100) {
    console.warn(`⚠️ Warning: Small training set (${trainingData.sampleSize} examples). Results may not be reliable.`);
  }

  // Step 2: Convert to matrix format
  const { X, y } = convertToMatrixFormat(trainingData.examples);

  // Step 3: (Optional) Perform cross-validation
  let cvResults = null;
  if (performCV) {
    cvResults = kFoldCrossValidation(trainingData.examples, 5);
    console.log(`\nCross-Validation Results:`);
    console.log(`Average R²: ${cvResults.avgR2.toFixed(3)}`);
    console.log(`Average MSE: ${cvResults.avgMSE.toFixed(2)}`);
  }

  // Step 4: Train final model on all data
  const model = trainRandomForest(X, y, { nEstimators: 100, maxDepth: 10 });

  // Step 5: Calculate feature importances
  const importances = calculatePermutationImportance(model, X, y, trainingData.featureNames);

  console.log(`\nFeature Importances:`);
  for (const [feature, importance] of Object.entries(importances)) {
    console.log(`  ${feature}: ${(importance * 100).toFixed(1)}%`);
  }

  return {
    model,
    importances,
    cvResults,
    trainingSize: trainingData.sampleSize,
    featureNames: trainingData.featureNames
  };
}
