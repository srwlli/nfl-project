# NFL-Scraper Project - Python Codebase Analysis

## 1. FRAMEWORK & LIBRARIES USED

### Primary Web Framework
- **Streamlit** (not FastAPI/Flask)
  - Main application: `app.py`
  - Multi-page navigation with sidebar
  - Components use `st.markdown()`, `st.columns()`, `st.session_state`

### Data Libraries
- **Polars** (primary)
  - All data aggregation and transformation
  - Parquet read/write: `pl.read_parquet()`, `write_parquet()`
  - Used in: `scrape_everything.py`, `fetch_team_data.py`, `process_team_stats.py`

- **Pandas** (secondary)
  - Specific operations and conversions
  - Pattern: `pl.from_pandas(df)` for Polars conversion

### HTTP/API Libraries
- **requests** - for REST API calls (ESPN API)
- **json** - for JSON serialization

### External Data Libraries
- **nflreadpy** (primary scraper)
  - Provides: schedules, injuries, depth charts, PBP, stats, snap counts, NGS, rosters, teams
  - Pattern: `import nflreadpy as nfl`

- **nflscraPy** (supplementary)
  - Methods: `_five_thirty_eight()`, `_season_splits()`, `_expected_points()`
  - Pattern: `import nflscraPy as nfls`

### Database
- **No traditional database** - uses Parquet files
- Data persisted in `data/raw/` and `data/processed/` directories

### Testing
- No pytest/unittest infrastructure

---

## 2. CODE PATTERNS

### Import Organization
```python
# Standard library
import sys, json
from pathlib import Path
from datetime import datetime

# Third-party data
import polars as pl
import pandas as pd
import requests

# Domain libraries
import nflreadpy as nfl
import nflscraPy as nfls

# Local
from components.scorecard import render_scorecard
```

### API/Endpoint Pattern: CLI Scripts (not REST)
Current architecture:
1. **CLI Scripts** - Direct execution: `python scripts/scrape_everything.py --no-confirm`
2. **Streamlit Pages** - Multi-page app with sidebar navigation
3. **Data Functions** - Reusable functions with parameters

Example function signature:
```python
def fetch_team_data(team_abbr: str, season: int = 2025, include_historical: bool = False) -> dict:
```

### Error Handling Pattern
Consistent try/except with status tracking:
```python
try:
    pbp = nfl.load_pbp(seasons)
    pbp.write_parquet(str(output_file))
    results['pbp'] = {'status': 'SUCCESS', 'records': len(pbp)}
    print(f"   [OK] Records: {len(pbp):,}")
except Exception as e:
    results['pbp'] = {'status': 'FAILED', 'error': str(e)}
    print(f"   [ERROR] FAILED: {e}")
```

**Logging approach:**
- Print-based with status indicators: `[OK]`, `[ERROR]`, `[WARN]`, `[INFO]`
- No stdlib logging used
- Informative console output for scripts

### Configuration Management
```python
# Environment variables
BASE_DIR = Path(__file__).parent.parent
DATA_RAW = BASE_DIR / 'data' / 'raw'
DATA_PROCESSED = BASE_DIR / 'data' / 'processed'

# Season constants
HISTORICAL_SEASONS = [2022, 2023, 2024]
SCHEDULE_SEASONS = list(range(2019, 2025))
```

- Uses `.env` file via `python-dotenv`
- Path-based configuration with `pathlib.Path`
- Constants as module-level variables

---

## 3. DATA ACCESS PATTERNS

### Parquet Operations

**Read:**
```python
df = pl.read_parquet(DATA_RAW / 'schedules_2025.parquet')
```

**Write:**
```python
df.write_parquet(str(output_file))
```

### Data Transformation (Polars)

**Filter & Aggregation:**
```python
off_stats = pbp.filter(
    pl.col('posteam') == team_abbr.upper()
).select([
    pl.col('epa').mean().alias('epa_per_play_off'),
    pl.col('pass').sum().alias('pass_plays'),
    pl.len().alias('total_plays')
]).to_dicts()[0]
```

**Joins:**
```python
final_stats = standings_df.join(offense, on='team', how='left') \
    .join(defense, on='team', how='left') \
    .join(epa_stats, on='team', how='left')
```

**Ranking:**
```python
final_stats = final_stats.with_columns([
    pl.col(stat).rank(method='min', descending=True).over(pl.lit(1)).alias(f'{stat}_rank')
    for stat in ranking_stats
])
```

**Output Formats:**
```python
# To dictionary (for JSON)
team_row = team_data.to_dicts()[0]

# To JSON file
df.write_json(str(output_file))

# To console
print(final_stats.head(5))
```

---

## 4. PYTHON VERSION & STYLE

### Python Version Target
- **Python 3.10+** (inferred from Union syntax)
- Uses `str | int` instead of `Union[str, int]`

### Type Hints
**Selective usage:**
- Function parameters and returns
- Union types: `away_score: str | int`
- Not used for local variables or comprehensive coverage

### Naming Conventions
- **Functions:** `snake_case` - `fetch_team_data()`, `render_scorecard()`
- **Variables:** `snake_case` - `pass_yards`, `total_records`
- **Constants:** `UPPERCASE` - `HISTORICAL_SEASONS`, `BASE_DIR`
- **Classes:** `PascalCase` (if used, currently using functions)

### Code Organization
**Functional programming style (not OOP):**
- Scripts are procedural with linear execution
- Reusable components are functions, not classes
- `components/` folder: `def render_scorecard()`, `def render_quick_stats()`
- Each data source has dedicated function/module

### Code Style Details

**Docstrings with parameters:**
```python
"""
Fetch comprehensive team data for a specific team

Parameters:
    team_abbr: Team abbreviation (e.g., 'KC', 'BUF')
    season: Season year (default 2025)

Returns:
    Dict with team_info, power_ratings, season_stats, schedule
"""
```

**Strategic inline comments:**
```python
# Home team: result + spread > 0 means cover
# Away team: result - spread > 0 means cover (spread is from home perspective)
if is_home:
    covered = (margin + game['spread_line']) > 0
```

**Line length:** Generally <100 characters

---

## 5. KEY ARCHITECTURAL INSIGHTS

1. **No backend framework** - Pure Streamlit + file-based data
   - **Implication for migration:** You're moving from Streamlit UI to REST API backend

2. **Polars-first data stack** - All transformations use Polars
   - **Best practice for FastAPI:** Keep Polars in backend, use `to_dicts()` for JSON serialization

3. **Script-driven architecture** - CLI tools for data collection
   - **Migration pattern:** Convert scripts into FastAPI endpoint handlers or background jobs

4. **Practical error handling** - Try/except blocks with console output
   - **Best practice:** Use FastAPI exception handlers + structured logging (JSON)

5. **Configuration simple** - Path-based, environment variables, constants
   - **Migration:** Move to Pydantic Settings for FastAPI

6. **Functional decomposition** - Components are render functions
   - **Best practice:** Convert to reusable service functions in FastAPI services/

7. **Data-centric** - Entire codebase around Parquet I/O
   - **Migration:** Will become PostgreSQL queries instead of Parquet reads

---

## 6. WHAT THIS MEANS FOR YOUR FASTAPI BACKEND

### Dependencies to Add
```
# Core
fastapi
uvicorn[standard]
pydantic-settings  # Configuration management

# Data
polars
pandas  # For compatibility

# Database
supabase  # PostgreSQL client
psycopg[binary]  # PostgreSQL driver

# Caching
redis
hiredis  # For performance

# Utilities
python-dotenv
requests
```

### Project Structure to Follow
```
backend/
├── app.py                    # FastAPI main (follows your script style)
├── core/
│   └── config.py            # Pydantic Settings (replaces pathlib pattern)
├── api/
│   ├── schedules.py         # Endpoint modules (follows functional style)
│   ├── teams.py
│   └── ...
├── services/
│   ├── readers.py           # Polars operations (follows your pattern)
│   ├── cache.py
│   └── jobs.py
└── requirements.txt
```

### Code Style to Maintain
- Use Polars for data ops, convert with `.to_dicts()` for JSON
- Keep try/except blocks with structured error responses
- Use Path objects for configuration
- Docstrings on all functions
- Type hints on all function signatures
- Status-based response patterns similar to your scripts

---

## 7. MISSING ELEMENTS (TO CREATE)

- [ ] Database schema + SQL migrations
- [ ] Pydantic models for request/response validation
- [ ] Redis caching layer
- [ ] Supabase client initialization
- [ ] ETL scripts (Parquet → PostgreSQL)
- [ ] Structured logging (JSON)
- [ ] API error handling
- [ ] CORS configuration
- [ ] Environment variable validation
- [ ] Tests

---

## RECOMMENDATIONS FOR FASTAPI MIGRATION

1. **Keep Polars** - It's your strength, continue using it
2. **Adopt Pydantic** - For request/response validation
3. **Add structured logging** - Move from print to Python logging JSON format
4. **Use type hints everywhere** - Full coverage for FastAPI benefits
5. **Organize by feature** - Keep script logic modular in services/
6. **Cache expensive queries** - PBP, joins → Redis
7. **ETL data offline** - Load Parquets into PostgreSQL before API runs
8. **Error responses** - Mirror your status pattern: `{"status": "error", "message": "..."}`

