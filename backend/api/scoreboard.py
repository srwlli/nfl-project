"""
Scoreboard endpoints - Live game scores and status
"""

from fastapi import APIRouter, Query
from typing import List
from datetime import date
import logging

from services.readers import data_reader
from services.cache import cache_manager, cache_key_scoreboard

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/scoreboard")
async def get_scoreboard(
    date_param: str = Query(..., alias="date", description="Date (YYYY-MM-DD)")
) -> List[dict]:
    """
    Get games for a specific date (live scoreboard)

    - **date**: Date in YYYY-MM-DD format (e.g., 2025-10-15)

    Returns: games for that date with live scores and status
    Cache: 10 seconds (updates frequently)
    """
    try:
        cache_key = cache_key_scoreboard(date_param)

        # Try cache (short TTL for real-time updates)
        cached = await cache_manager.get(cache_key)
        if cached:
            logger.debug(f"Cache HIT: scoreboard {date_param}")
            return cached

        # Query database
        scoreboard = await data_reader.read_scoreboard(date_param)

        # Cache for 10 seconds (live updates)
        await cache_manager.set(cache_key, scoreboard, ttl_seconds=10)

        return scoreboard

    except Exception as e:
        logger.error(f"Error fetching scoreboard for {date_param}: {e}")
        return {"status": "error", "message": str(e)}
