"""
Games endpoints - Full game details
"""

from fastapi import APIRouter
import logging

from services.readers import data_reader
from services.cache import cache_manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/games/{game_id}")
async def get_game_details(game_id: str) -> dict:
    """
    Get full game details including schedule, PBP sample, teams

    - **game_id**: Game ID (format: YYYYMMDD_AWAYTEAM_HOMETEAM)

    Returns: full game object with schedule info and PBP sample
    """
    try:
        cache_key = f"game:{game_id}"

        # Try cache
        cached = await cache_manager.get(cache_key)
        if cached:
            logger.debug(f"Cache HIT: game {game_id}")
            return cached

        # Query database
        game = await data_reader.read_game(game_id)

        if not game:
            return {"status": "error", "message": f"Game {game_id} not found"}

        # Cache for 60 seconds
        await cache_manager.set(cache_key, game, ttl_seconds=60)

        return game

    except Exception as e:
        logger.error(f"Error fetching game {game_id}: {e}")
        return {"status": "error", "message": str(e)}
