"""
Injuries endpoints - Player injury reports
"""

from fastapi import APIRouter, Query
from typing import Optional, List
import logging

from services.readers import data_reader
from services.cache import cache_manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/injuries")
async def get_injuries(
    season: int = Query(2025, description="Season year"),
    week: Optional[int] = Query(None, description="Week number"),
    team: Optional[str] = Query(None, description="Team abbreviation"),
) -> List[dict]:
    """
    Get injury reports for season/week/team

    - **season**: Season year (e.g., 2025)
    - **week**: Optional week number filter
    - **team**: Optional team abbreviation filter

    Returns: list of injured players with status
    Cache: 60 seconds (updated frequently)
    """
    try:
        cache_key = f"injuries:{season}:{week}:{team}"

        # Try cache
        cached = await cache_manager.get(cache_key)
        if cached:
            logger.debug(f"Cache HIT: injuries {season}/{week}/{team}")
            return cached

        # Query database
        injuries = await data_reader.read_injuries(season, week, team)

        # Cache for 60 seconds (updated weekly, some changes during week)
        await cache_manager.set(cache_key, injuries, ttl_seconds=60)

        logger.debug(f"Returned {len(injuries)} injury reports")
        return injuries

    except Exception as e:
        logger.error(f"Error fetching injuries: {e}")
        return {"status": "error", "message": str(e)}
