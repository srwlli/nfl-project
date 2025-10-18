# Decision Log: Historical Data Feature

**Date**: October 16, 2025
**Feature**: Historical NFL Data (1970-2024)
**Status**: Decisions Partially Locked, Context Gathering In Progress

---

## Decisions Locked (Q1-Q6) ✅

### Q1: Time Period ✅ LOCKED
**Question**: How far back should historical data go?
**Options**:
1. Last 10 years (2015-2024)
2. Last 20 years (2005-2024)
3. Since 2000 (2000-2024)
4. Complete history (1970-2024)

**Decision**: Option 4 - Complete history (1970-2024)
**Rationale**: Maximum value, comprehensive archive, no arbitrary cutoff
**Locked By**: User (10/16/2025)

---

### Q2: Data Types ✅ LOCKED
**Question**: Which data types should we include?
**Options**:
1. Basic only (schedules, scores, rosters)
2. Most types (exclude advanced stats)
3. All data types
4. All types EXCEPT injuries

**Decision**: Option 4 - All types EXCEPT injuries
**Rationale**: Comprehensive coverage, injuries not well-tracked historically
**Data Types Included** (10 types):
1. Schedules ✅
2. Play-by-Play ✅
3. Player Stats ✅
4. Snap Counts ✅
5. Depth Charts ✅
6. Rosters ✅
7. Teams ✅
8. Power Ratings ✅
9. Advanced Stats ✅
10. Live Scores ✅

**Data Types Excluded**:
- Injuries ❌ (inconsistent tracking, not available historically)

**Locked By**: User (10/16/2025)

---

### Q3: Storage Location ✅ LOCKED
**Question**: Where should historical data be stored?
**Options**:
1. Same Supabase database (mixed with 2025 data)
2. Separate Supabase schema (isolated historical tables)
3. Archive folder (parquet files in backup location)
4. Both database AND archive (dual storage)

**Decision**: Option 2 - Separate Supabase schema
**Rationale**:
- 2025 performance preserved (separate schema)
- Clean separation enables independent management
- Query optimization per schema
- Data integrity maintained
- Scalable for 100+ years

**Architecture**:
```
Supabase (Single Instance)
├── public schema (2025 current season)
│   ├── schedules_2025
│   ├── players_2025
│   └── [8 more tables]
└── historical_nfl schema (1970-2024)
    ├── schedules
    ├── play_by_play
    ├── players
    └── [7 more tables]
```

**Locked By**: Claude Recommendation, User Agreement (10/16/2025)

---

### Q4: Data Validation ✅ LOCKED
**Question**: How should historical data be validated?
**Options**:
1. Source matching (strict validation)
2. Coverage verification (check for missing years)
3. Completeness check (all types for each year)
4. Multi-layer validation (all of above)

**Decision**: Option 4 - Multi-layer Validation
**Rationale**: Production-ready, catches data quality issues, handles historical gaps, detects corruption

**Validation Layers**:

**Layer 1: Schema Validation**
- All 10 tables exist in historical_nfl schema
- All required columns present
- Column types match expected schema
- Indexes created properly

**Layer 2: Record Count Verification**
- Expected row ranges per year
- Teams always 32 (except pre-1970 expansions)
- Players vary by year (500-5000+)
- Flag anomalies (0 rows, negative years)

**Layer 3: Data Integrity Checks**
- MD5/SHA checksums of parquet files match source
- No duplicate rows by key
- Date ranges valid (no future dates, no pre-1970)
- Numeric fields in expected ranges

**Layer 4: Completeness Mapping**
- Which years have which data types
- Identify legitimate gaps
- Flag unexpected gaps
- Coverage report by era

**Validation Output**: JSON + HTML report
- Schema integrity status
- Row count verification
- Checksum validation results
- Coverage matrix by year and type
- Identified gaps (legitimate vs anomalies)
- Recommendations (pass/fail/review)

**Locked By**: Claude Recommendation, User Agreement (10/16/2025)

---

### Q5: API Design Pattern ✅ LOCKED
**Question**: How should API handle data varying by era?
**Options**:
1. Strict uniform (same columns always, null for missing)
2. Dynamic schema (response shape changes by era)
3. Metadata flagging (uniform + availability metadata)
4. Separate by era (different endpoints per era)

**Decision**: Option 3 - Metadata Flagging
**Rationale**:
- Frontend-friendly (consistent schema)
- Data accuracy (metadata shows what's available)
- Type-safe (TypeScript-friendly)
- Cache-friendly (same response structure)
- Discoverable (explicit metadata)

**Response Example**:
```json
GET /v1/historical/players?season=1975
{
  "season": 1975,
  "era": "1970-1989",
  "data_availability": {
    "snap_counts": false,
    "advanced_stats": false,
    "depth_chart": true,
    "rosters": true,
    "player_stats": true
  },
  "players": [
    {
      "id": "1234",
      "name": "Joe Montana",
      "position": "QB",
      "snap_counts": null,
      "advanced_stats": null,
      "depth_chart_rank": "1",
      "roster_status": "starter"
    }
  ]
}
```

**Benefits**:
- Frontend knows exact structure (consistent)
- Metadata shows what's available (no confusion)
- Null values clear ("data doesn't exist" not "bug")
- Conditional rendering easy
- TypeScript type definitions work

**Locked By**: Claude Recommendation, User Agreement (10/16/2025)

---

### Q6: Update Strategy ✅ LOCKED
**Question**: How should historical data stay current?
**Options**:
1. Static snapshot (load once, never update)
2. Annual refresh (every January, reload full year)
3. Rolling window (last 3-5 years continuously updated)
4. Continuous updates (all years monitored, update any changes)

**Decision**: Option 1 - Static Snapshot
**Rationale**:
- Historical data is immutable record (1970-2024 happened)
- No ongoing maintenance required
- Lowest cost approach
- Reliable and predictable
- Can rebuild if better sources found

**Update Philosophy**:
- 1970-2024: Frozen archive (no updates)
- 2025: Live updates (current season)
- Future: Each year becomes archive after season ends

**Process**:
- 1-time load: Download all 1970-2024 data
- Validation: Multi-layer validation
- Freeze: Mark as archive
- 2025 current: Separate, live-updating table
- Transition: Each January, lock previous year, start new season

**Change Policy**:
- If better sources found: Manual rebuild (not automatic)
- If data errors discovered: Manual correction (not automatic)
- New years: Add automatically (2026 season added 2026 data)

**Locked By**: Claude Recommendation, User Agreement (10/16/2025)

---

## Decisions Pending (Q7-Q10) ⏳

### Q7: Associated Resources ⏳ PENDING
**Question**: What supporting resources accompany historical data?
**Options**:
1. Data only (just tables, figure it out)
2. Documentation (schema + coverage report)
3. Analysis tools (docs + queries + sample analyses)
4. Full package (everything: docs, queries, analyses, ETL scripts, validation reports)

**Status**: PENDING
**Deadline**: TBD
**Assigned**: User decision required
**Impact**: Affects time-to-market and user adoption

---

### Q8: Implementation Constraints ⏳ PENDING
**Question**: What constraints should guide implementation?
**Sub-questions**:
- Budget available?
- Timeline required?
- Team resources (full-time, part-time)?
- Infrastructure limits?
- Performance requirements?

**Status**: PENDING
**Deadline**: TBD
**Assigned**: User to define constraints
**Impact**: Affects phase prioritization and resource allocation

---

### Q9: Primary Use Cases ⏳ PENDING
**Question**: Which analyses/use cases matter most?
**Available Use Cases** (See POTENTIAL_ANALYSES_LIBRARY.md):
- Game evolution & trends (4 analyses)
- Team dynasties & performance (3 analyses)
- Player performance & careers (4 analyses)
- Strategic evolution (3 analyses)
- Betting & prediction (3 analyses)
- League-wide insights (3 analyses)

**Status**: PENDING
**Decision Impact**:
- Prioritizes which data types to load first
- Guides documentation/query focus
- Informs marketing messaging

---

### Q10: Integration Method ⏳ PENDING
**Question**: How does historical data fit into product roadmap?
**Sub-questions**:
- MVP approach (minimum viable historical feature)?
- Phased rollout (launch in stages)?
- Full launch (everything at once)?
- Timeline for each phase?

**Status**: PENDING
**Decision Impact**: Affects development schedule and launch strategy

---

## Decision Matrix (Summary)

| Decision | Q# | Status | Option | Locked |
|----------|-----|--------|--------|---------|
| Time Period | 1 | ✅ | 1970-2024 | Yes |
| Data Types | 2 | ✅ | All types except injuries | Yes |
| Storage | 3 | ✅ | Separate schema | Yes |
| Validation | 4 | ✅ | Multi-layer | Yes |
| API Design | 5 | ✅ | Metadata flagging | Yes |
| Updates | 6 | ✅ | Static snapshot | Yes |
| Resources | 7 | ⏳ | TBD | No |
| Constraints | 8 | ⏳ | TBD | No |
| Use Cases | 9 | ⏳ | TBD | No |
| Integration | 10 | ⏳ | TBD | No |

---

## Implementation Timeline

### Phase 1: Data Collection & Validation
**Status**: Ready to start (after Q7-Q10 decisions)
**Effort**: 4-6 hours
**Depends On**: Q8 (constraints), Q7 (resources)

### Phase 2: Schema & Migration
**Status**: Blocked on Phase 1
**Effort**: 2-3 hours
**Depends On**: Q8 (infrastructure constraints)

### Phase 3: API Endpoints
**Status**: Blocked on Phase 2
**Effort**: 3-4 hours
**Depends On**: Phase 2 completion

### Phase 4: Services Layer
**Status**: Blocked on Phase 3
**Effort**: 2-3 hours
**Depends On**: Phase 3 completion

### Phase 5: Testing
**Status**: Blocked on Phase 4
**Effort**: 3-4 hours
**Depends On**: Phase 4 completion

### Phase 6: Documentation & Launch
**Status**: Blocked on Phase 5
**Effort**: 2-3 hours (or more if Q7 = Option 4)
**Depends On**: Phase 5 completion, Q7 (resources)

**Total Critical Path**: 16-23 hours (2-3 days)

---

## Recommendations for Q7-Q10

### Q7: Associated Resources
**Recommendation**: Option 3 (Analysis Tools)
**Rationale**:
- Best ROI (useful without massive overhead)
- Users can immediately get value
- Sample queries drive adoption
- Still maintainable long-term

**Alternative**: Option 4 (Full Package) if time allows
- Most professional deliverable
- Users can validate themselves
- Greatest trust and adoption

---

### Q8: Implementation Constraints
**Recommended Approach**:
- Budget: $2,000-3,000 (development only, ~$100/hour)
- Timeline: 2-3 weeks (if full-time), 1-2 months (if part-time)
- Resources: 1-2 people, 4-6 weeks estimated
- Infrastructure: Supabase free tier sufficient

---

### Q9: Primary Use Cases
**Recommended Prioritization**:
1. **Vegas Line Accuracy** (direct betting value)
2. **Situational Betting Patterns** (edge identification)
3. **Dynasty Identification** (content value)
4. **Scoring Evolution** (viral/engaging)
5. **All-Time Player Ranking** (user engagement)

---

### Q10: Integration Method
**Recommended Approach**: Phased Rollout
- **Phase 1**: Launch with documentation + top 5 analyses
- **Phase 2**: Add more analyses based on user demand
- **Phase 3**: Build B2B partnerships
- **Phase 4**: Full monetization (subscriptions, API)

---

## Approval Sign-Off

### Current Status: 60% Locked
✅ 6 out of 10 decisions locked
⏳ 4 out of 10 decisions pending

### Ready to Proceed?
✅ **YES** - We can begin implementation immediately
- Data types finalized
- Storage architecture defined
- Validation strategy set
- API design complete
- Q7-Q10 decisions can be made during implementation

### Next Steps
1. **User provides Q7-Q10 answers** (or uses recommendations)
2. **Finalize implementation plan**
3. **Begin Phase 1** (Data Collection)
4. **Track progress against timeline**

---

## Document References

- **HISTORICAL_DATA_OPPORTUNITY.md**: Capability overview
- **POTENTIAL_ANALYSES_LIBRARY.md**: Use case examples
- **HISTORICAL_DATA_CAPABILITIES_MATRIX.md**: Data availability by era
- **BUSINESS_VALUE.md**: Strategic and financial justification
- **context.json**: Full technical context

---

## Document History

| Date | Decision | Status | Notes |
|------|----------|--------|-------|
| 2025-10-16 | Q1-Q6 | ✅ Locked | Initial /gather-context session |
| 2025-10-16 | Q7-Q10 | ⏳ Pending | To be completed in follow-up |
| TBD | Implementation | 🚀 Ready | Awaiting Q7-Q10 + approval |

---

**Created**: October 16, 2025
**Last Updated**: October 16, 2025
**Status**: Awaiting Q7-Q10 decisions + implementation approval

