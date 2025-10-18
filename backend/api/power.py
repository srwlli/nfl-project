"""
Power Ratings endpoints - Team strength ratings (ELO)
"""

from fastapi import APIRouter, Query
from typing import List
import logging

from services.readers import data_reader
from services.cache import cache_manager, cache_key_power_ratings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/power_ratings")
async def get_power_ratings(
    season: int = Query(2025, description="Season year"),
) -> List[dict]:
    """
    Get power ratings (ELO) for all teams

    - **season**: Season year (e.g., 2025)

    Returns: sorted list of teams by ELO rating with ranks
    Cache: 1 hour (weekly updates)
    """
    try:
        cache_key = cache_key_power_ratings(season)

        # Try cache
        cached = await cache_manager.get(cache_key)
        if cached:
            logger.debug(f"Cache HIT: power_ratings {season}")
            return cached

        # Query database
        ratings = await data_reader.read_power_ratings(season)

        # Cache for 1 hour (ratings updated weekly)
        await cache_manager.set(cache_key, ratings, ttl_seconds=3600)

        logger.debug(f"Returned {len(ratings)} power ratings")
        return ratings

    except Exception as e:
        logger.error(f"Error fetching power ratings: {e}")
        return {"status": "error", "message": str(e)}
