"""
Play-by-play endpoints - Detailed game plays and statistics
"""

from fastapi import APIRouter, Query
import logging

from services.readers import data_reader
from services.cache import cache_manager, cache_key_pbp

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/pbp")
async def get_pbp(
    game_id: str = Query(..., description="Game ID"),
    limit: int = Query(100, ge=1, le=500, description="Results limit (1-500)"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
) -> dict:
    """
    Get play-by-play data for a game (paginated)

    - **game_id**: Game ID to fetch plays for
    - **limit**: Number of plays per page (default 100, max 500)
    - **offset**: Pagination offset

    Returns: paginated plays with EPA, yards gained, etc.
    Cache: 60 seconds (expensive query - cached heavily)
    """
    try:
        cache_key = cache_key_pbp(game_id, limit, offset)

        # Try cache (expensive query - cache longer)
        cached = await cache_manager.get(cache_key)
        if cached:
            logger.debug(f"Cache HIT: pbp {game_id} limit={limit} offset={offset}")
            return cached

        # Query database with pagination
        pbp_data = await data_reader.read_pbp(game_id, limit, offset)

        # Cache for 60 seconds
        await cache_manager.set(cache_key, pbp_data, ttl_seconds=60)

        logger.debug(f"Returned {len(pbp_data.get('plays', []))} plays")
        return pbp_data

    except Exception as e:
        logger.error(f"Error fetching PBP for {game_id}: {e}")
        return {"status": "error", "message": str(e), "total": 0, "plays": []}
