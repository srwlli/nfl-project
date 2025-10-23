# Performance Floors V3 - Production Hardening & Statistical Refinements

**Created**: October 22, 2025
**Status**: ⏳ Plan Created - Ready for Implementation
**Based On**: 5 comprehensive AI reviews (ChatGPT, Gemini, DeepSeek, Perplexity, Grok)

---

## Executive Summary

Performance Floors V3 is a **production hardening** effort focused on:
1. **Data Quality** - Prevent garbage-in-garbage-out via outlier detection and validation
2. **Performance** - Reduce execution time from 800ms to <300ms per game (60% improvement)
3. **Statistical Accuracy** - Improve floor prediction accuracy by 10-15%
4. **Maintainability** - Modularize code, add JSDoc, centralize database queries
5. **Observability** - Better error reporting, warnings, and summary metrics

---

## What's Different from V2?

| Version | Focus | Key Features |
|---------|-------|--------------|
| **V1** | Basic floor calculations | Simple averages, stddev-based floors |
| **V2** | Statistical sophistication | Bayesian shrinkage, EWMA, bootstrap intervals, opponent factor, environment modifiers, advanced metrics (EPA/QBR) |
| **V3** | Production hardening | Data validation, performance optimization, stat-specific opponent factors, modularization, retry logic |

**V2 was about "what"** - adding sophisticated algorithms
**V3 is about "how"** - making them production-ready, fast, and accurate

---

## The Plan: 5 Phases, 18 Tasks

### Phase 1: Critical Data Quality & Validation (CRITICAL)
**Time**: 3-4 hours
**Priority**: Must implement first

| Task | What It Does | Impact |
|------|-------------|--------|
| **1.1: IQR Outlier Detection** | Removes garbage-time games (300-yard WR games in blowouts) | 15-20% less distortion |
| **1.2: Config Validation** | Catches invalid config before processing | Saves 10-15 min debugging |
| **1.3: Enhanced Data Validation** | Severity tiers (critical/moderate/minor errors) | Better data quality visibility |
| **1.4: Minimum Floor Constraints** | Prevents absurd projections (QB floor of 50 yards) | Realistic projections |

**Why First?**: Garbage data causes 80% of projection errors. Fix this before optimizing.

---

### Phase 2: Performance Optimization & Query Efficiency (HIGH)
**Time**: 4-5 hours
**Priority**: Implement next for major speedup

| Task | What It Does | Impact |
|------|-------------|--------|
| **2.1: Preload League Averages** | Fetch once per week instead of per player | 60-70% faster opponent factor |
| **2.2: Smart Caching (TTL)** | Auto-evict stale cache, prevent memory leaks | Stable memory usage |
| **2.3: Parallel Environment Modifiers** | Home/Away env mods calculated in parallel | 40-50% faster per game |
| **2.4: Parallel Player Calculations** | All 20-30 players per team in parallel | 70-80% faster per team |
| **2.5: Consolidate DB Queries** | Combine 3 queries into 1 with joins | 66% fewer round-trips |
| **2.6: Retry Logic** | Exponential backoff for transient failures | Handles network hiccups |

**Combined Impact**: Execution time from 800ms → <300ms per game (60% improvement)

---

### Phase 3: Statistical Accuracy Refinements (HIGH)
**Time**: 4-5 hours
**Priority**: Implement for better projections

| Task | What It Does | Impact |
|------|-------------|--------|
| **3.1: Position-Specific Opponent Stats** | Use passing_yards_allowed for WRs, rushing_yards_allowed for RBs | 10-15% accuracy gain |
| **3.2: Weighted Trend Regression** | Recent games weighted 2-3x more in trend detection | Less noise from outliers |
| **3.3: Separate RB Rushing/Receiving** | Different efficiency rates for rush vs. catch | 5-10% better RB PPR |
| **3.4: Adaptive Volatility Factor** | Player-specific volatility (not one-size-fits-all) | Better floor differentiation |

**Combined Impact**: 10-15% more accurate floor projections

---

### Phase 4: Code Quality & Maintainability (MEDIUM)
**Time**: 3-4 hours
**Priority**: Optional but recommended for long-term health

| Task | What It Does | Impact |
|------|-------------|--------|
| **4.1: Centralize DB Queries** | All Supabase calls go through safeFetch() | Consistent error handling |
| **4.2: Add JSDoc** | Document all functions with types and examples | Better IDE support |
| **4.3: Modularize Code** | Break 1327 lines into data-fetchers, calculations, display | Easier testing |

**Impact**: Main file from 1327 → <600 lines, easier onboarding

---

### Phase 5: Enhanced Output & Observability (LOW-MEDIUM)
**Time**: 2-3 hours
**Priority**: Nice-to-have for debugging and monitoring

| Task | What It Does | Impact |
|------|-------------|--------|
| **5.1: Structured Warnings/Errors** | JSON output includes warnings array | Easier debugging |
| **5.2: Team/Position Summaries** | Aggregate stats per team/position | Quick sanity checks |
| **5.3: Feature Flags** | Toggle algorithms via config | A/B testing, debugging |

**Impact**: Better observability, easier debugging

---

## Priority Matrix (What to Implement First)

### Must Have (6 tasks):
1. ✅ **1.1: IQR Outlier Detection** - Prevents GIGO
2. ✅ **1.2: Config Validation** - Catches errors early
3. ✅ **2.1: Preload League Averages** - Biggest performance win
4. ✅ **2.3: Parallel Environment Modifiers** - Easy parallelization
5. ✅ **2.4: Parallel Player Calculations** - 70-80% faster
6. ✅ **3.1: Position-Specific Opponent Stats** - Biggest accuracy win

**Estimated Time**: 6-8 hours
**Expected Impact**:
- 50-60% faster execution
- 10-15% more accurate projections
- Prevents most garbage data issues

---

### Should Have (6 tasks):
1. **1.3: Enhanced Data Validation**
2. **1.4: Minimum Floor Constraints**
3. **2.2: Smart Caching**
4. **2.6: Retry Logic**
5. **3.2: Weighted Trend Regression**
6. **3.4: Adaptive Volatility**

**Estimated Time**: 5-6 hours
**Expected Impact**: Production robustness, further accuracy improvements

---

### Nice to Have (6 tasks):
- Remaining Phase 2, 4, 5 tasks

**Estimated Time**: 6-8 hours
**Expected Impact**: Code quality, observability

---

## Success Metrics

| Metric | Current (V2) | Target (V3) |
|--------|-------------|------------|
| **Execution Time (per game)** | ~800ms | <300ms (60% faster) |
| **Outlier Distortion** | 15-20% impact | <5% impact |
| **Database Queries (per game)** | ~15 queries | ~7 queries (50% reduction) |
| **Team Processing Time** | ~15 seconds | <5 seconds (70% faster) |
| **Accuracy vs. Actuals** | Baseline | +10-15% improvement |
| **Main File Size** | 1,327 lines | <600 lines (modular) |

---

## Implementation Roadmap

### Week 1: Core Improvements (Must Have)
- **Day 1-2**: Phase 1 (Data Quality)
  - 1.1: IQR Outlier Detection
  - 1.2: Config Validation
- **Day 3-4**: Phase 2 (Performance)
  - 2.1: Preload League Averages
  - 2.3: Parallel Environment Modifiers
  - 2.4: Parallel Player Calculations
- **Day 5**: Phase 3 (Accuracy)
  - 3.1: Position-Specific Opponent Stats

**Deliverable**: V3 with 50-60% performance improvement and 10-15% accuracy improvement

### Week 2: Robustness (Should Have)
- **Day 1**: Phase 1 (Validation)
  - 1.3: Enhanced Data Validation
  - 1.4: Minimum Floor Constraints
- **Day 2**: Phase 2 (Reliability)
  - 2.2: Smart Caching
  - 2.6: Retry Logic
- **Day 3-4**: Phase 3 (Statistical)
  - 3.2: Weighted Trend Regression
  - 3.4: Adaptive Volatility

**Deliverable**: Production-ready V3 with robust error handling

### Week 3: Polish (Nice to Have)
- **Day 1-2**: Phase 4 (Code Quality)
- **Day 3**: Phase 5 (Observability)

**Deliverable**: Maintainable, well-documented V3

---

## File Structure Changes

### New Utility Files:
```
COPY-FLOOR/
├── utils/
│   ├── smart-cache.js          (NEW - TTL caching)
│   ├── query-retry.js          (NEW - exponential backoff)
│   └── db.js                   (NEW - centralized queries)
├── modules/
│   ├── data-fetchers.js        (NEW - data fetching logic)
│   ├── calculations.js         (NEW - stat calculations)
│   └── display.js              (NEW - output formatting)
└── calculate-performance-floors.js  (REFACTORED - orchestrator)
```

### Config Additions:
```json
{
  "features": {
    "enable_opponent_factor": true,
    "enable_environment_modifier": true,
    "enable_trend_detection": true,
    "enable_bayesian_shrinkage": true,
    "enable_advanced_metrics": true
  },
  "minimum_floors": {
    "QB": { "passing_yards": 150, "fantasy_points_ppr": 8 },
    "RB": { "rushing_yards": 20, "fantasy_points_ppr": 5 },
    "WR": { "receiving_yards": 15, "fantasy_points_ppr": 4 },
    "TE": { "receiving_yards": 10, "fantasy_points_ppr": 3 }
  }
}
```

---

## Risk Mitigation

1. **Outlier Detection Over-Filtering**: 30% threshold prevents removing high-variance players
2. **Performance Regression**: All changes benchmarked, feature flags allow rollback
3. **Breaking Changes**: Backward compatible with V2 config structure
4. **Database Schema Changes**: Position-specific opponent stats can be computed on-the-fly if columns missing
5. **Code Complexity**: Modularization improves testability, not just reduces line count

---

## Next Steps

**Option 1: Implement Must-Have Tasks (6-8 hours)**
- Gets you 50-60% performance improvement
- Gets you 10-15% accuracy improvement
- Production-ready with data quality fixes

**Option 2: Implement Phases 1-3 (11-14 hours)**
- Complete data quality, performance, and accuracy improvements
- Leaves code quality and observability for later

**Option 3: Full V3 Implementation (16-21 hours)**
- All 18 tasks across 5 phases
- Fully production-hardened, maintainable, observable

---

## AI Consensus Analysis

| Improvement Area | ChatGPT | Gemini | DeepSeek | Perplexity | Grok | Priority |
|------------------|---------|---------|----------|------------|------|----------|
| **Data Validation** | ✅ | ✅ | ✅ | ✅ | ✅ | CRITICAL |
| **Performance (Caching)** | ✅ | ✅ | ✅ | - | - | HIGH |
| **Stat-Specific Opponent** | ✅ | ✅ | - | - | ✅ | HIGH |
| **Query Consolidation** | - | ✅ | - | - | - | MEDIUM |
| **Retry Logic** | - | - | ✅ | - | ✅ | MEDIUM |
| **Modularization** | ✅ | - | - | ✅ | - | MEDIUM |
| **JSDoc** | - | - | - | ✅ | - | LOW |

**Unanimous (5/5 AIs)**: Data validation is #1 priority
**Strong Consensus (3-4 AIs)**: Performance optimization, stat-specific opponent factors
**Split Opinion (1-2 AIs)**: Modularization, JSDoc

---

## Questions?

- **Should I implement all of V3?** Start with "Must Have" tasks (6-8 hours) for biggest wins.
- **Will this break V2 functionality?** No, all changes are backward compatible.
- **Do I need new database columns?** Optional - position-specific opponent stats can be computed on-the-fly.
- **How do I test these changes?** Work in COPY-FLOOR, test on Week 7 data, compare to V2 results.

**Ready to start? Pick a phase and let's go!**
