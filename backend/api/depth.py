"""
Depth Charts endpoints - Team rosters and depth
"""

from fastapi import APIRouter, Query
from typing import Optional, List
import logging

from services.readers import data_reader
from services.cache import cache_manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/depth_charts")
async def get_depth_charts(
    team: str = Query(..., description="Team abbreviation (e.g., KC)"),
    season: int = Query(2025, description="Season year"),
    week: Optional[int] = Query(None, description="Week number"),
) -> List[dict]:
    """
    Get depth chart for team

    - **team**: Team abbreviation (e.g., KC, BUF, DAL)
    - **season**: Season year (e.g., 2025)
    - **week**: Optional week number (gets latest if not specified)

    Returns: sorted list of players by position and depth rank
    Cache: 5 minutes (changes weekly, sometimes mid-week)
    """
    try:
        cache_key = f"depth_charts:{team}:{season}:{week}"

        # Try cache
        cached = await cache_manager.get(cache_key)
        if cached:
            logger.debug(f"Cache HIT: depth_charts {team} {season} week {week}")
            return cached

        # Query database
        depth = await data_reader.read_depth_charts(team, season, week)

        # Cache for 5 minutes (changes mid-week sometimes)
        await cache_manager.set(cache_key, depth, ttl_seconds=300)

        logger.debug(f"Returned {len(depth)} depth chart entries")
        return depth

    except Exception as e:
        logger.error(f"Error fetching depth charts for {team}: {e}")
        return {"status": "error", "message": str(e)}
