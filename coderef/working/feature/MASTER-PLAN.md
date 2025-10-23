# 🎯 MASTER PLAN - Agentic Parallel Development Workflow

**Project**: NFL Stats Platform Frontend
**Approach**: Storybook-First Component Development → Page Integration
**Total Agents**: 8 (1 Foundation + 7 Page Builders)
**Estimated Timeline**: Phase 1 (12h) → Phase 2 (8h parallel) → Phase 3 (4-6h parallel)

---

## 📋 Three-Phase Structure

### **Phase 1: Foundation Setup** (12 hours - BLOCKING)
**Agent**: Agent-Foundation
**Status**: Ready for execution
**Blocks**: All 7 Phase 2 agents

**Deliverables**:
- ✅ Next.js 15 app generated (using nextjs-pwa generator)
- ✅ Storybook 8 configured and running (localhost:6006)
- ✅ shadcn/ui installed (9 base components)
- ✅ 6 theme variants (Next Down Metrics as default)
- ✅ Supabase integration (types, client, .env)
- ✅ Mock data library (lib/mock-data.ts matching DB schema)
- ✅ Component generator script
- ✅ Example ScoreBug component with all variants
- ✅ Documentation (STORYBOOK-WORKFLOW.md)

**Location**: `coderef/working/feature/00-storybook-setup/`

---

### **Phase 2: Component Development in Storybook** (8 hours - PARALLEL)
**7 Agents working simultaneously**
**Status**: Waiting for Phase 1 completion

Each agent builds their page's components **in Storybook** with:
- All design variants (5 per component where applicable)
- Mock data integration
- Full interactivity and controls
- Stories for each component
- Theme switching support
- Mobile responsive design

**No page integration yet** - pure component library development

---

### **Phase 3: Page Integration** (4-6 hours - PARALLEL)
**Same 7 agents continue with their pages**
**Status**: Waiting for Phase 2 completion

Each agent integrates their Storybook components into actual Next.js pages with:
- Real Supabase data
- Server/client component architecture
- Real-time updates (WebSocket where needed)
- Loading and error states
- Performance optimizations
- Production-ready implementation

---

## 🤖 Agent Assignments

| Agent | Page Type | Priority | Components | Est. Hours | Route |
|-------|-----------|----------|------------|------------|-------|
| **Agent-1** | Live Scoreboard (Homepage) | P0 | 8 | 12h (8+4) | `/scoreboard` or `/` |
| **Agent-2** | Game Details (3 variants) | P0 | 12 | 14h (10+4) | `/game/[id]` |
| **Agent-3** | Player Profiles | P1 | 10 | 12h (8+4) | `/player/[id]` |
| **Agent-4** | Team Pages | P1 | 9 | 12h (8+4) | `/team/[id]` |
| **Agent-5** | Stats & Leaderboards | P1 | 8 | 12h (8+4) | `/stats` |
| **Agent-6** | Matchup Preview | P2 | 7 | 10h (6+4) | `/matchup/[id]` |
| **Agent-7** | Stadium Pages | P2 | 6 | 10h (6+4) | `/stadium/[id]` |

**Total Component Count**: 60 components
**Total Story Files**: 60 stories
**Total Pages**: 7 page types (some with dynamic routes)

---

## 📦 Agent-1: Live Scoreboard (Homepage)

**Feature ID**: AGENT1-LIVE-SCOREBOARD
**Priority**: P0 (Critical - Homepage)
**Template**: `coderef/finalizing-elements/live-scoreboard/template-scorebugs.tsx`

### Phase 2 Components (8 hours)
1. **ScoreBug** (60min) - Single game score display, 5 variants
2. **LiveGamesGrid** (45min) - Grid of live games
3. **CompletedGamesGrid** (30min) - Recent final scores
4. **UpcomingGamesGrid** (45min) - Scheduled games with betting
5. **StandingsCard** (60min) - Division/conference standings
6. **TopPerformersToday** (60min) - Top stats from today
7. **InjuryReportCard** (45min) - Color-coded injury status
8. **RosterMovesCard** (45min) - Recent transactions

### Phase 3 Integration (4 hours)
- Page: `app/(pages)/scoreboard/page.tsx`
- Real-time: WebSocket subscriptions for live games
- Data: 7 Supabase queries + real-time channel
- Performance: <2s load time, CLS < 0.1

**Location**: `coderef/working/feature/01-live-scoreboard/`

---

## 📦 Agent-2: Game Details (3 Variants)

**Feature ID**: AGENT2-GAME-DETAILS
**Priority**: P0 (Critical - Game Page)
**Template**: `coderef/finalizing-elements/game-details/template-next-down-metrics.tsx`

### Phase 2 Components (10 hours)
1. **GameScoreBug** (60min) - Main scorebug with quarter scores
2. **SeasonContextCards** (45min) - Team records, playoff implications
3. **BettingResultsCard** (45min) - Spread/total results
4. **PlayerMilestonesCard** (45min) - Career achievements in game
5. **GameNarrative** (60min) - Key plays timeline
6. **PlayerStatsTable** (90min) - Tabbed stats (Offense/Defense/ST)
7. **ScoringTimeline** (45min) - Chronological scoring plays
8. **TeamStatsComparison** (60min) - Side-by-side team stats
9. **AdvancedAnalytics** (60min) - EPA, WPA, success rate
10. **VideoHighlightsGrid** (45min) - Highlight clips (mock)
11. **LivePlayByPlay** (60min) - Real-time play updates
12. **WeatherCard** (30min) - Game conditions

### 3 Page Variants
- **Live Game**: Real-time updates, possession indicator
- **Completed Game**: Final stats, full narrative
- **Scheduled Game**: Matchup preview, betting lines

### Phase 3 Integration (4 hours)
- Page: `app/(pages)/game/[id]/page.tsx`
- Dynamic: Route parameter for game ID
- Real-time: WebSocket for live games only
- Data: 10+ Supabase queries
- Performance: <2.5s load time

**Location**: `coderef/working/feature/02-game-details/`

---

## 📦 Agent-3: Player Profiles

**Feature ID**: AGENT3-PLAYER-PROFILES
**Priority**: P1
**Template**: `coderef/finalizing-elements/player-profiles/template-player-profiles.tsx`

### Phase 2 Components (8 hours)
1. **PlayerHero** (60min) - Header with photo, name, number, team, HOF badge
2. **QuickStatsBar** (45min) - Career totals (yards, TDs, rating, awards)
3. **StatsTable** (90min) - Season-by-season breakdown, sortable
4. **CareerHighlights** (45min) - Achievements timeline
5. **BiographicalInfo** (30min) - Birthplace, draft, college
6. **GameLogTable** (60min) - Recent games, expandable
7. **SplitsCard** (45min) - Home/Away, vs Division, etc.
8. **NewsAndMedia** (45min) - Recent news, video highlights
9. **ComparisonTool** (60min) - Compare to other players
10. **CareerChart** (60min) - Performance graph over time

### Phase 3 Integration (4 hours)
- Page: `app/(pages)/player/[id]/page.tsx`
- Dynamic: Route parameter for player ID
- Data: Player + season stats + game logs
- Performance: <2s load time

**Location**: `coderef/working/feature/03-player-profiles/`

---

## 📦 Agent-4: Team Pages

**Feature ID**: AGENT4-TEAM-PAGES
**Priority**: P1
**Template**: `coderef/finalizing-elements/team-pages/template-team-pages.tsx`

### Phase 2 Components (8 hours)
1. **TeamHero** (45min) - Logo, name, record, division rank, playoff odds
2. **StatsGrid** (60min) - PPG, YPG, PA, turnover diff (with NFL rank)
3. **KeyPlayersGrid** (60min) - Top 4-6 players with season stats
4. **RecentGamesTimeline** (45min) - Last 5 games with W/L
5. **UpcomingSchedule** (45min) - Next 5 games with odds
6. **DivisionStandingsCard** (45min) - Full division table
7. **DepthChart** (90min) - Roster by position (Starters/Backups)
8. **TeamNewsCard** (45min) - Recent team news
9. **HistoricalRecords** (45min) - Franchise records, Super Bowls

### Phase 3 Integration (4 hours)
- Page: `app/(pages)/team/[id]/page.tsx`
- Dynamic: Route parameter for team abbreviation
- Data: Team + roster + games + standings
- Performance: <2s load time

**Location**: `coderef/working/feature/04-team-pages/`

---

## 📦 Agent-5: Stats & Leaderboards

**Feature ID**: AGENT5-STATS-LEADERBOARDS
**Priority**: P1
**Template**: `coderef/finalizing-elements/stats/template-stats-leaderboards.tsx`

### Phase 2 Components (8 hours)
1. **StatsBrowser** (90min) - Filterable table (season, position, team, sort)
2. **LeaderboardTable** (90min) - Top 25 per category, paginated
3. **AllTimeLeaders** (60min) - Career leaders cards (Passing, Rushing)
4. **SeasonComparison** (60min) - Year-by-year comparison cards
5. **PlayerCareerView** (60min) - Season-by-season table for one player
6. **InteractiveExplorer** (60min) - Search, filters, quick access
7. **FeaturedStat** (30min) - Stat of the day card
8. **PositionFilters** (30min) - QB/RB/WR/TE/DEF filter chips

### Phase 3 Integration (4 hours)
- Page: `app/(pages)/stats/page.tsx`
- Data: Player season stats + aggregations
- Performance: <2s load time, pagination
- Features: Sorting, filtering, search

**Location**: `coderef/working/feature/05-stats-leaderboards/`

---

## 📦 Agent-6: Matchup Preview

**Feature ID**: AGENT6-MATCHUP-PREVIEW
**Priority**: P2
**Template**: `coderef/finalizing-elements/matchup-preview/template-matchup-preview.tsx`

### Phase 2 Components (6 hours)
1. **GameHero** (45min) - Team matchup, betting lines, sharp action alerts
2. **QuickStatsComparison** (60min) - Visual comparison bars (PPG, EPA, ATS)
3. **BettingAnalysis** (60min) - ATS trends, O/U trends, situational spots
4. **InjuryReport** (45min) - Color-coded with impact analysis
5. **KeyMatchups** (60min) - Position group vs position group
6. **ExpertPick** (60min) - Best bet with confidence, projected score
7. **WeatherImpact** (30min) - Forecast and historical impact

### Phase 3 Integration (4 hours)
- Page: `app/(pages)/matchup/[id]/page.tsx`
- Dynamic: Route parameter for game ID
- Data: Game + betting + injuries + matchups
- Performance: <2s load time

**Location**: `coderef/working/feature/06-matchup-preview/`

---

## 📦 Agent-7: Stadium Pages

**Feature ID**: AGENT7-STADIUM-PAGES
**Priority**: P2
**Template**: `coderef/finalizing-elements/stadium-pages/template-stadiums.tsx`

### Phase 2 Components (6 hours)
1. **StadiumHero** (45min) - Photo, name, city, capacity, surface, roof
2. **QuickStatsGrid** (30min) - Games, record, suites, parking
3. **BasicInfoCard** (30min) - Opened, architect, cost, facilities
4. **TeamTimeline** (45min) - Tenant history
5. **StadiumRecords** (60min) - Passing, rushing, receiving, attendance records
6. **CapacityComparison** (45min) - Table comparing to other NFL stadiums
7. **DirectionsCard** (60min) - Address, parking, transportation options

### Phase 3 Integration (4 hours)
- Page: `app/(pages)/stadium/[id]/page.tsx`
- Dynamic: Route parameter for stadium ID
- Data: Stadium + games + records
- Performance: <2s load time

**Location**: `coderef/working/feature/07-stadium-pages/`

---

## 🔄 Workflow Diagram

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: Foundation (Agent-Foundation)              │
│ ├─ Next.js 15 + Storybook 8                        │
│ ├─ shadcn/ui + Themes                              │
│ ├─ Supabase + Mock Data                            │
│ └─ Component Generator + Docs                      │
│                                                     │
│ Estimated: 12 hours                                │
│ Status: Ready for execution                        │
└─────────────────────────────────────────────────────┘
                        ↓
         ┌──────────────┴──────────────┐
         ↓                             ↓
┌────────────────────┐        ┌────────────────────┐
│ PHASE 2: PARALLEL  │        │ 7 AGENTS BUILDING  │
│ COMPONENT DEV      │───────→│ IN STORYBOOK       │
│                    │        │                    │
│ Agent-1: Scoreboard│        │ • All design vars  │
│ Agent-2: Game      │        │ • Mock data        │
│ Agent-3: Player    │        │ • Full controls    │
│ Agent-4: Team      │        │ • Theme support    │
│ Agent-5: Stats     │        │ • Mobile responsive│
│ Agent-6: Matchup   │        │                    │
│ Agent-7: Stadium   │        │ 60 components      │
│                    │        │ 60 stories         │
│ Est: 6-10h each    │        │                    │
└────────────────────┘        └────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 3: PAGE INTEGRATION (Parallel)                │
│                                                     │
│ Same 7 agents integrate components to pages:        │
│ ├─ Real Supabase data                              │
│ ├─ WebSocket real-time updates                     │
│ ├─ Loading/error states                            │
│ ├─ Performance optimization                        │
│ └─ Production-ready pages                          │
│                                                     │
│ Estimated: 4-6 hours each                          │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ DELIVERABLE: Full NFL Stats Platform                │
│ ├─ 7 pages (homepage + 6 feature pages)            │
│ ├─ 60 components in Storybook                      │
│ ├─ Real-time data from Supabase                    │
│ ├─ 6 theme variants                                │
│ └─ Production-ready Next.js 15 app                 │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Timeline Estimates

### Sequential (No Parallelization)
- Phase 1: 12 hours
- Phase 2: 7 agents × 8h avg = 56 hours
- Phase 3: 7 agents × 4h avg = 28 hours
- **Total: 96 hours (12 work days)**

### Parallel (7 Agents Working Simultaneously)
- Phase 1: 12 hours (1 agent, blocking)
- Phase 2: 10 hours (longest agent, parallel)
- Phase 3: 6 hours (longest agent, parallel)
- **Total: 28 hours (~3.5 work days)**

### Time Savings: **68 hours (71% faster)**

---

## 🔗 Dependencies & Coordination

### Dependency Chain
```
Phase 1 (Foundation)
  └─ BLOCKS all Phase 2 agents
       ↓
Phase 2 (Components) - Agents work independently
  ├─ Agent-1 → Phase 3 (Page 1)
  ├─ Agent-2 → Phase 3 (Page 2)
  ├─ Agent-3 → Phase 3 (Page 3)
  ├─ Agent-4 → Phase 3 (Page 4)
  ├─ Agent-5 → Phase 3 (Page 5)
  ├─ Agent-6 → Phase 3 (Page 6)
  └─ Agent-7 → Phase 3 (Page 7)
```

### Shared Resources
All agents share:
- **Components**: ScoreBug (used by multiple agents)
- **Mock Data**: lib/mock-data.ts
- **Theme System**: ThemeProvider
- **Types**: types/database.ts
- **Supabase Client**: lib/supabase.ts

### Conflict Prevention
- Each agent owns their own components/ folder
- No overlapping file writes
- Shared components created in Phase 1
- Communication via communication.json logs

---

## 📁 File Structure

```
nfl-stats-app/
├── .storybook/                    # Phase 1
│   ├── main.ts
│   └── preview.tsx
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   # Agent-1 (could be scoreboard)
│   └── (pages)/
│       ├── scoreboard/page.tsx    # Agent-1 (or homepage above)
│       ├── game/[id]/page.tsx     # Agent-2
│       ├── player/[id]/page.tsx   # Agent-3
│       ├── team/[id]/page.tsx     # Agent-4
│       ├── stats/page.tsx         # Agent-5
│       ├── matchup/[id]/page.tsx  # Agent-6
│       └── stadium/[id]/page.tsx  # Agent-7
│
├── components/
│   ├── ui/                        # shadcn (Phase 1)
│   ├── providers/
│   │   └── ThemeProvider.tsx     # Phase 1
│   │
│   ├── ScoreBug/                  # Phase 1 example
│   ├── LiveGamesGrid/             # Agent-1
│   ├── GameScoreBug/              # Agent-2
│   ├── PlayerHero/                # Agent-3
│   ├── TeamHero/                  # Agent-4
│   ├── LeaderboardTable/          # Agent-5
│   ├── BettingAnalysis/           # Agent-6
│   ├── StadiumHero/               # Agent-7
│   └── ... (60 total components)
│
├── stories/
│   ├── ScoreBug.stories.tsx       # Phase 1
│   ├── LiveGamesGrid.stories.tsx  # Agent-1
│   └── ... (60 story files)
│
├── lib/
│   ├── mock-data.ts               # Phase 1
│   ├── storybook-utils.ts         # Phase 1
│   ├── supabase.ts                # Phase 1
│   └── utils.ts                   # shadcn
│
├── types/
│   └── database.ts                # Phase 1 (from backend)
│
├── docs/
│   ├── STORYBOOK-WORKFLOW.md      # Phase 1
│   └── PROJECT-STRUCTURE.md       # Phase 1
│
└── scripts/
    └── generate-component.js      # Phase 1
```

---

## ✅ Success Criteria

### Phase 1 Complete When:
- [ ] Next.js 15 runs at localhost:3000
- [ ] Storybook 8 runs at localhost:6006
- [ ] All 6 themes switch correctly
- [ ] Mock data matches DB schema
- [ ] Component generator works
- [ ] Example ScoreBug renders all 5 variants
- [ ] Documentation complete

### Phase 2 Complete When (Per Agent):
- [ ] All components built
- [ ] All stories render in Storybook
- [ ] All design variants work
- [ ] Mock data integrated
- [ ] Theme switcher works for all components
- [ ] Mobile responsive
- [ ] No TypeScript errors
- [ ] No a11y critical issues

### Phase 3 Complete When (Per Agent):
- [ ] Page integrates all components
- [ ] Real Supabase data loads
- [ ] Real-time updates work (where applicable)
- [ ] Loading/error states implemented
- [ ] Page loads in <2 seconds
- [ ] Mobile responsive
- [ ] Lighthouse score > 90
- [ ] No console errors

### Project Complete When:
- [ ] All 7 pages deployed
- [ ] All 60 components in Storybook
- [ ] All Supabase queries optimized
- [ ] Performance targets met
- [ ] SEO optimized
- [ ] PWA configured
- [ ] Ready for production

---

## 📞 Communication Protocol

### Each Agent Logs:
1. **Start of Phase** - "Starting Phase 2 component development"
2. **Component Completions** - "Completed ScoreBug component (5 variants)"
3. **Blockers** - "Blocked: Missing team logo assets"
4. **Phase Completion** - "Phase 2 complete, moving to Phase 3"
5. **Final Handoff** - "Agent-1 complete: Live Scoreboard delivered"

### Coordination Points:
- **Daily Standups**: Each agent posts progress in communication.json
- **Blocker Resolution**: Flag blockers immediately, other agents assist
- **Shared Component Updates**: Notify all agents if shared component changes
- **Integration Testing**: Coordinate page handoffs for navigation testing

---

## 🚀 Execution Instructions

### For Agent-Foundation:
1. Read `00-storybook-setup/context.json`
2. Follow `00-storybook-setup/plan.json` step-by-step
3. Complete all Phase 1 tasks
4. Validate all acceptance criteria
5. Log completion in `communication.json`
6. **Signal ready** for Phase 2 agents to start

### For Agents 1-7 (Phase 2):
1. **Wait** for Phase 1 completion signal
2. Read your `context.json` (e.g., `01-live-scoreboard/context.json`)
3. Follow your `plan.json` Phase 2 tasks
4. Build all components in Storybook
5. Validate in Storybook (all variants, themes, mobile)
6. Log completion in `communication.json`
7. **Move to Phase 3**

### For Agents 1-7 (Phase 3):
1. Follow your `plan.json` Phase 3 tasks
2. Create Next.js page file
3. Integrate components with real data
4. Add real-time features (if needed)
5. Optimize performance
6. Validate page works end-to-end
7. Log completion in `communication.json`

---

## 📚 Reference Documents

### Phase 1 (Foundation)
- **Context**: `00-storybook-setup/context.json`
- **Plan**: `00-storybook-setup/plan.json`
- **Communication**: `00-storybook-setup/communication.json`

### Phase 2-3 (All Agents)
- **Agent-1**: `01-live-scoreboard/` (✅ Complete)
- **Agent-2**: `02-game-details/` (Template follows Agent-1 structure)
- **Agent-3**: `03-player-profiles/` (Template follows Agent-1 structure)
- **Agent-4**: `04-team-pages/` (Template follows Agent-1 structure)
- **Agent-5**: `05-stats-leaderboards/` (Template follows Agent-1 structure)
- **Agent-6**: `06-matchup-preview/` (Template follows Agent-1 structure)
- **Agent-7**: `07-stadium-pages/` (Template follows Agent-1 structure)

### Templates & Specs
- **Templates**: `coderef/finalizing-elements/`
- **Component Specs**: Each page has `components.json`
- **Themes**: `coderef/finalizing-elements/THEMES/`
- **Database Schema**: `types/database.ts` (from backend)

---

## 🎉 Expected Outcomes

By following this agentic workflow, we will deliver:

✅ **Complete NFL Stats Platform** with 7 full-featured pages
✅ **60 reusable components** in Storybook
✅ **6 theme variants** (Next Down Metrics as primary)
✅ **Real-time data** from Supabase (45,991 records)
✅ **Mobile-first responsive** design
✅ **Production-ready** Next.js 15 app
✅ **71% time savings** via parallel development

**Timeline**: ~28 hours (3.5 work days) instead of 96 hours (12 days)

---

**Created**: 2025-01-23
**Status**: Ready for Phase 1 execution
**Next Action**: Agent-Foundation starts `00-storybook-setup/plan.json`
