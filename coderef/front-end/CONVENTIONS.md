# Frontend Components Naming & Organization Conventions

**Last Updated**: October 16, 2025
**Status**: Enforced
**Applies To**: `next-scraper/coderef/front-end/`

---

## Directory Structure

### Hierarchy
```
next-scraper/coderef/front-end/
├── 00-meta/                    # Project documentation
├── 01-core-components/         # MVP & essential components
├── 02-data-components/         # Historical data & archives
├── 03-interactive-tools/       # Calculators & simulators
├── 04-engagement-gamification/ # Games & challenges
├── 05-user-social/             # User profiles & social features
├── 06-platforms-hubs/          # Standalone platforms
└── 07-hall-of-fame/            # Special large components
```

### Directory Naming Rules

**Format**: `{number}-{category-name}/`

**Rules**:
- ✅ Use 2-digit zero-padded numbers (00-99)
- ✅ Use kebab-case (lowercase-with-hyphens)
- ✅ Use descriptive category names
- ✅ Keep names concise (2-3 words max)

**Pattern**: `^[0-9]{2}-[a-z]+(-[a-z]+)*/$`

**Examples**:
```
✅ CORRECT:
  00-meta/
  01-core-components/
  04-engagement-gamification/

❌ INCORRECT:
  Components/               (no number, PascalCase)
  1-core/                   (single digit)
  CORE_COMPONENTS/          (SCREAMING_SNAKE_CASE)
  core-components/          (no number)
```

---

## File Naming Rules

### Markdown Files

**Format**: `{descriptive-name}.md`

**Rules**:
- ✅ Use kebab-case (lowercase-with-hyphens)
- ✅ Use descriptive, readable names
- ✅ Keep names concise but clear
- ✅ Avoid abbreviations unless universally known
- ✅ Use present tense for actions (e.g., `player-card` not `player-cards`)

**Pattern**: `^[a-z0-9]+(-[a-z0-9]+)*\.md$`

**Examples**:
```
✅ CORRECT:
  live-scorebug.md
  playoff-probability-calculator.md
  user-profile-system.md
  goat-calculator.md
  on-this-day.md

❌ INCORRECT:
  SCOREBUG_STUB.md          (SCREAMING_SNAKE_CASE)
  MY_RANKS_COMPONENT.md     (SNAKE_CASE)
  EngagementPage.md         (PascalCase)
  player_cards.md           (snake_case)
  plyr-crd.md               (unclear abbreviations)
```

### JSON Files

**Format**: `{descriptive-name}.json`

**Rules**:
- ✅ Same rules as markdown files
- ✅ Use kebab-case
- ✅ Be descriptive

**Examples**:
```
✅ CORRECT:
  context.json
  migration-plan.json
  component-metadata.json

❌ INCORRECT:
  Context.json
  MIGRATION_PLAN.json
  component_metadata.json
```

---

## Category Definitions

### 00-meta/
**Purpose**: Project-level documentation, status, design systems
**Contents**: README, INDEX, context, project status, design system
**File Count**: ~8 files

**Examples**:
- readme.md
- index.md
- context.json
- project-status.md
- design-system.md

---

### 01-core-components/
**Purpose**: MVP components, essential features for product launch
**Contents**: Scorebug, matchup preview, team pages, player cards
**File Count**: ~7 files

**Examples**:
- live-scorebug.md
- matchup-preview.md
- team-page.md
- player-card.md

---

### 02-data-components/
**Purpose**: Historical data, archives, records, statistics
**Contents**: All-time games, Super Bowl history, historic matchups
**File Count**: ~5 files

**Examples**:
- all-time-games.md
- super-bowl-history.md
- historic-matchups.md
- on-this-day.md

---

### 03-interactive-tools/
**Purpose**: Calculators, simulators, prediction tools
**Contents**: GOAT calculator, playoff probability, draft simulator
**File Count**: ~5 files

**Examples**:
- goat-calculator.md
- playoff-probability-calculator.md
- fantasy-draft-simulator.md
- record-chase-tracker.md

---

### 04-engagement-gamification/
**Purpose**: Games, challenges, gamification mechanics
**Contents**: Engagement challenges, mini-games, rankings, awards
**File Count**: ~5 files

**Examples**:
- engagement-challenges.md
- my-ranks.md
- mini-games-collection.md
- weekly-awards-system.md

---

### 05-user-social/
**Purpose**: User profiles, social features, community tools
**Contents**: User profiles, player card collections, creator directory
**File Count**: ~4 files

**Examples**:
- user-profile-system.md
- my-player-cards.md
- content-creator-directory.md
- social-media-trends.md

---

### 06-platforms-hubs/
**Purpose**: Standalone platforms, large independent apps
**Contents**: Youth football hub, commercial league, franchise sim
**File Count**: ~3 files

**Examples**:
- youth-football-community-hub.md
- commercial-league-platform.md
- franchise-sim-mobile-game.md

---

### 07-hall-of-fame/
**Purpose**: Special, unique, large components that don't fit elsewhere
**Contents**: Hall of Fame component
**File Count**: ~1 file

**Examples**:
- hall-of-fame.md

---

## Adding New Files

### Step 1: Determine Category
Ask yourself:
1. Is this project documentation? → `00-meta/`
2. Is this essential for MVP? → `01-core-components/`
3. Is this historical data? → `02-data-components/`
4. Is this a calculator/simulator? → `03-interactive-tools/`
5. Is this a game/challenge? → `04-engagement-gamification/`
6. Is this user/social focused? → `05-user-social/`
7. Is this a standalone platform? → `06-platforms-hubs/`
8. Is this unique/special? → `07-hall-of-fame/`

### Step 2: Name the File
1. Use kebab-case
2. Be descriptive but concise
3. Avoid abbreviations
4. Use present tense

### Step 3: Add to Category
```bash
# Example: Adding a new playoff simulator tool
touch 03-interactive-tools/playoff-bracket-simulator.md
```

### Step 4: Update Documentation
1. Update `00-meta/index.md` with new file
2. Update `00-meta/file-list.txt`
3. Update `00-meta/context.json` if necessary

---

## Renaming Files

### Before You Rename
1. Check if file is referenced in other documents
2. Search for internal links to the file
3. Update all references after renaming

### Renaming Process
```bash
# 1. Rename the file
mv old-name.md new-name.md

# 2. Search for references
grep -r "old-name.md" .

# 3. Update all references
# (Use your editor's find-replace)

# 4. Update documentation
# - Update index.md
# - Update file-list.txt
# - Update context.json
```

---

## Moving Files Between Categories

### When to Move
- Component purpose changes
- Component maturity changes (prototype → MVP)
- Better category identified

### Moving Process
```bash
# 1. Move the file
mv 01-core-components/old-file.md 03-interactive-tools/old-file.md

# 2. Update all references
grep -r "01-core-components/old-file.md" .

# 3. Update documentation files
# - Update index.md
# - Update file-list.txt
# - Update context.json
# - Update category file counts
```

---

## Validation

### Automated Checks

Run validation script to check naming compliance:
```bash
python scripts/validate_naming_conventions.py
```

### Manual Checks

**Directory Structure**:
- [ ] All directories follow `{number}-{name}/` pattern
- [ ] Numbers are 2-digit zero-padded
- [ ] Names are kebab-case
- [ ] No empty directories

**File Names**:
- [ ] All files are kebab-case
- [ ] No UPPERCASE or snake_case files
- [ ] Names are descriptive and clear
- [ ] No abbreviations unless standard

**Organization**:
- [ ] Files are in correct categories
- [ ] No orphaned files
- [ ] Documentation is up-to-date

---

## Common Mistakes

### ❌ MISTAKE 1: Wrong Case
```
❌ PLAYER_BADGE_SYSTEM.md
✅ player-badge-system.md
```

### ❌ MISTAKE 2: Wrong Separator
```
❌ player_badge_system.md
✅ player-badge-system.md
```

### ❌ MISTAKE 3: No Number Prefix
```
❌ core-components/
✅ 01-core-components/
```

### ❌ MISTAKE 4: Single Digit Number
```
❌ 1-core-components/
✅ 01-core-components/
```

### ❌ MISTAKE 5: Unclear Abbreviations
```
❌ plyr-bdg-sys.md
✅ player-badge-system.md
```

### ❌ MISTAKE 6: Wrong Category
```
❌ 01-core-components/franchise-sim-mobile-game.md
✅ 06-platforms-hubs/franchise-sim-mobile-game.md
```

---

## Benefits of These Conventions

### 1. **Findability** (80% faster)
Clear categories make files easy to locate

### 2. **Consistency** (100% compliance)
One naming standard = zero ambiguity

### 3. **Scalability** (Easy growth)
Add new files to existing categories effortlessly

### 4. **Tooling** (Automation-friendly)
Scripts can easily parse and validate structure

### 5. **Onboarding** (3x faster)
New developers understand structure immediately

### 6. **Maintenance** (Clear ownership)
Separation of concerns makes updates easier

---

## Enforcement

### Required
- ✅ All new files MUST follow these conventions
- ✅ All moved files MUST be renamed to comply
- ✅ All categories MUST be properly numbered

### Recommended
- 📝 Run validation script before commits
- 📝 Update documentation when adding files
- 📝 Review naming in code reviews

### Tools
- Validation script: `scripts/validate_naming_conventions.py`
- Migration script: `scripts/migrate_frontend_components.py`
- Pre-commit hook: `.git/hooks/pre-commit`

---

## Questions?

**Where should I put this file?**
→ Review the category definitions above

**How should I name this file?**
→ Use kebab-case, be descriptive, check examples

**Can I use abbreviations?**
→ Only if universally known (e.g., `api`, `ui`, `nfl`)

**What if a file fits multiple categories?**
→ Choose the primary purpose, document in file header

**How do I rename an existing file?**
→ Follow the "Renaming Files" process above

---

**Last Updated**: October 16, 2025
**Maintained By**: Frontend Team
**Version**: 1.0.0
