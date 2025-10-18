"""
Schedules endpoints - Game schedules, dates, betting lines
"""

from fastapi import APIRouter, Query
from typing import Optional, List
import logging

from services.readers import data_reader
from services.cache import cache_manager, cache_key_schedules

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/schedules")
async def get_schedules(
    season: int = Query(2025, description="NFL season year"),
    week: Optional[int] = Query(None, description="Week number (1-18)"),
    team: Optional[str] = Query(None, description="Team abbreviation (e.g., KC, BUF)"),
) -> List[dict]:
    """
    Get NFL game schedules with optional filters

    - **season**: NFL season (e.g., 2025)
    - **week**: Week number (optional, 1-18)
    - **team**: Team abbreviation (optional, filters home or away)

    Returns list of games with schedules, spreads, totals
    """
    try:
        # Validate season - only 2025 supported
        if season != 2025:
            logger.warning(f"Requested season {season} not available. Only 2025 data is available.")
            return {"status": "error", "message": f"Only 2025 season data is available. Requested: {season}"}

        # Build cache key
        cache_key = cache_key_schedules(season, week, team)

        # Try cache first
        cached = await cache_manager.get(cache_key)
        if cached:
            logger.debug(f"Cache HIT: schedules for {season}/{week}/{team}")
            return cached

        # Query database
        schedules = await data_reader.read_schedules(season, week, team)

        # Cache for 60 seconds
        await cache_manager.set(cache_key, schedules, ttl_seconds=60)

        logger.debug(f"Returned {len(schedules)} schedules")
        return schedules

    except Exception as e:
        logger.error(f"Error fetching schedules: {e}")
        return {"status": "error", "message": str(e)}
