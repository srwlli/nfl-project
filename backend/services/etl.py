"""
ETL (Extract-Transform-Load) functions
Loads data from Parquet files to Supabase PostgreSQL

Run manually or from background job queue:
    python -m scripts.etl
"""

import polars as pl
from pathlib import Path
import logging
from typing import List, Dict, Any
import asyncio

from services.readers import data_reader

logger = logging.getLogger(__name__)

# Configuration
DATA_RAW_PATH = Path(__file__).parent.parent.parent.parent / "data" / "raw"
BATCH_SIZE = 1000  # Upsert in batches to avoid payload limits


async def load_schedules(season: int = 2025) -> Dict[str, Any]:
    """
    Load schedules from parquet to PostgreSQL

    Expected columns:
    game_id, season, week, gameday, gametime, home_team, away_team,
    stadium, roof, temp, wind, spread_line, total_line,
    home_moneyline, away_moneyline, home_score, away_score, result
    """
    try:
        # Validate season - only 2025 supported
        if season != 2025:
            logger.error(f"Only 2025 season is supported. Requested: {season}")
            return {"status": "failed", "reason": f"Only 2025 season is supported. Got {season}"}

        logger.info(f"Loading schedules for season {season}...")

        # Find parquet file
        parquet_file = DATA_RAW_PATH / f"schedules_{season}*.parquet"
        files = list(DATA_RAW_PATH.glob(f"schedules_*{season}*.parquet"))

        if not files:
            logger.warning(f"No schedules file found for {season}")
            return {"status": "failed", "reason": "File not found"}

        # Read parquet
        df = pl.read_parquet(str(files[0]))
        logger.info(f"Read {len(df)} schedules from {files[0].name}")

        # Select and rename columns
        df = df.select([
            pl.col("game_id"),
            pl.col("season"),
            pl.col("week"),
            pl.col("gameday"),
            pl.col("gametime"),
            pl.col("home_team"),
            pl.col("away_team"),
            pl.col("stadium"),
            pl.col("roof"),
            pl.col("temp"),
            pl.col("wind"),
            pl.col("spread_line"),
            pl.col("total_line"),
            pl.col("home_moneyline").cast(pl.Int32).alias("home_moneyline"),
            pl.col("away_moneyline").cast(pl.Int32).alias("away_moneyline"),
            pl.col("home_score"),
            pl.col("away_score"),
            pl.col("result"),
        ])

        # Upsert to database in batches
        data = df.to_dicts()
        inserted = 0

        for i in range(0, len(data), BATCH_SIZE):
            batch = data[i : i + BATCH_SIZE]
            try:
                result = (
                    data_reader.supabase.table("schedules")
                    .upsert(batch, on_conflict="game_id")
                    .execute()
                )
                inserted += len(batch)
                logger.debug(f"Inserted batch {i//BATCH_SIZE + 1}")
            except Exception as e:
                logger.error(f"Error inserting batch: {e}")
                return {"status": "failed", "reason": str(e)}

        logger.info(f"Successfully loaded {inserted} schedules")
        return {"status": "success", "records_inserted": inserted}

    except Exception as e:
        logger.error(f"Error loading schedules: {e}")
        return {"status": "failed", "reason": str(e)}


async def load_teams() -> Dict[str, Any]:
    """Load team metadata"""
    try:
        logger.info("Loading teams...")

        # Hardcoded teams list (or read from file)
        teams = [
            {"team": "ARI", "team_name": "Arizona Cardinals", "location": "Phoenix"},
            {"team": "ATL", "team_name": "Atlanta Falcons", "location": "Atlanta"},
            {"team": "BAL", "team_name": "Baltimore Ravens", "location": "Baltimore"},
            {"team": "BUF", "team_name": "Buffalo Bills", "location": "Buffalo"},
            {"team": "CAR", "team_name": "Carolina Panthers", "location": "Charlotte"},
            {"team": "CHI", "team_name": "Chicago Bears", "location": "Chicago"},
            {"team": "CIN", "team_name": "Cincinnati Bengals", "location": "Cincinnati"},
            {"team": "CLE", "team_name": "Cleveland Browns", "location": "Cleveland"},
            {"team": "DAL", "team_name": "Dallas Cowboys", "location": "Dallas"},
            {"team": "DEN", "team_name": "Denver Broncos", "location": "Denver"},
            {"team": "DET", "team_name": "Detroit Lions", "location": "Detroit"},
            {"team": "GB", "team_name": "Green Bay Packers", "location": "Green Bay"},
            {"team": "HOU", "team_name": "Houston Texans", "location": "Houston"},
            {"team": "IND", "team_name": "Indianapolis Colts", "location": "Indianapolis"},
            {"team": "JAX", "team_name": "Jacksonville Jaguars", "location": "Jacksonville"},
            {"team": "KC", "team_name": "Kansas City Chiefs", "location": "Kansas City"},
            {"team": "LA", "team_name": "Los Angeles Rams", "location": "Los Angeles"},
            {"team": "LAC", "team_name": "Los Angeles Chargers", "location": "Los Angeles"},
            {"team": "LV", "team_name": "Las Vegas Raiders", "location": "Las Vegas"},
            {"team": "MIA", "team_name": "Miami Dolphins", "location": "Miami"},
            {"team": "MIN", "team_name": "Minnesota Vikings", "location": "Minneapolis"},
            {"team": "NE", "team_name": "New England Patriots", "location": "Boston"},
            {"team": "NO", "team_name": "New Orleans Saints", "location": "New Orleans"},
            {"team": "NYG", "team_name": "New York Giants", "location": "New York"},
            {"team": "NYJ", "team_name": "New York Jets", "location": "New York"},
            {"team": "PHI", "team_name": "Philadelphia Eagles", "location": "Philadelphia"},
            {"team": "PIT", "team_name": "Pittsburgh Steelers", "location": "Pittsburgh"},
            {"team": "SEA", "team_name": "Seattle Seahawks", "location": "Seattle"},
            {"team": "SF", "team_name": "San Francisco 49ers", "location": "San Francisco"},
            {"team": "TB", "team_name": "Tampa Bay Buccaneers", "location": "Tampa Bay"},
            {"team": "TEN", "team_name": "Tennessee Titans", "location": "Nashville"},
            {"team": "WAS", "team_name": "Washington Commanders", "location": "Washington DC"},
        ]

        # Upsert
        result = (
            data_reader.supabase.table("teams")
            .upsert(teams, on_conflict="team")
            .execute()
        )

        logger.info(f"Successfully loaded {len(teams)} teams")
        return {"status": "success", "records_inserted": len(teams)}

    except Exception as e:
        logger.error(f"Error loading teams: {e}")
        return {"status": "failed", "reason": str(e)}


async def load_all(season: int = 2025) -> Dict[str, Any]:
    """
    Load all data (orchestrator)

    This is what runs when you manually trigger a refresh
    """
    try:
        # Validate season - only 2025 supported
        if season != 2025:
            logger.error(f"Only 2025 season is supported. Requested: {season}")
            return {"status": "failed", "reason": f"Only 2025 season is supported. Got {season}"}

        logger.info("=" * 80)
        logger.info("🔄 Starting ETL process...")
        logger.info("=" * 80)

        results = {}

        # Load teams first (referenced by schedules)
        logger.info("\n[1/2] Loading teams...")
        results["teams"] = await load_teams()

        # Load schedules
        logger.info("\n[2/2] Loading schedules...")
        results["schedules"] = await load_schedules(season)

        # TODO: Add more data types as needed:
        # - players
        # - player_stats
        # - injuries
        # - depth_charts
        # - pbp
        # - season_stats
        # - power_ratings

        logger.info("\n" + "=" * 80)
        logger.info("✅ ETL process complete!")
        logger.info("=" * 80)

        return {"status": "success", "results": results}

    except Exception as e:
        logger.error(f"Error in ETL process: {e}")
        return {"status": "failed", "reason": str(e)}


if __name__ == "__main__":
    # Run ETL manually
    import sys

    season = int(sys.argv[1]) if len(sys.argv) > 1 else 2025

    result = asyncio.run(load_all(season))
    print(f"\nResult: {result}")
