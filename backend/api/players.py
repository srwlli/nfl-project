"""
Players endpoints - Player profiles and statistics
"""

from fastapi import APIRouter, Query
from typing import Optional, List
import logging

from services.readers import data_reader
from services.cache import cache_manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/players/{player_id}")
async def get_player(player_id: str) -> dict:
    """
    Get player profile and career stats

    - **player_id**: Player ID (GSIS, NFL ID, or ESPN ID)

    Returns: player metadata, position, stats history
    """
    try:
        cache_key = f"player:{player_id}"

        # Try cache
        cached = await cache_manager.get(cache_key)
        if cached:
            logger.debug(f"Cache HIT: player {player_id}")
            return cached

        # Query database
        player = await data_reader.read_player(player_id)

        if not player:
            return {"status": "error", "message": f"Player {player_id} not found"}

        # Cache for 1 hour (player data rarely changes)
        await cache_manager.set(cache_key, player, ttl_seconds=3600)

        return player

    except Exception as e:
        logger.error(f"Error fetching player {player_id}: {e}")
        return {"status": "error", "message": str(e)}


@router.get("/player_stats")
async def get_player_stats(
    season: int = Query(2025, description="Season year"),
    team: Optional[str] = Query(None, description="Team abbreviation filter"),
    position: Optional[str] = Query(None, description="Position filter (QB, RB, WR, etc.)"),
) -> List[dict]:
    """
    Get player statistics for season

    - **season**: Season year (e.g., 2025)
    - **team**: Optional team abbreviation filter
    - **position**: Optional position filter (QB, RB, WR, TE, etc.)

    Returns: list of player stats with yards, touchdowns, etc.
    """
    try:
        cache_key = f"player_stats:{season}:{team}:{position}"

        # Try cache
        cached = await cache_manager.get(cache_key)
        if cached:
            logger.debug(f"Cache HIT: player_stats {season} {team} {position}")
            return cached

        # Query database
        stats = await data_reader.read_player_stats(season, team, position)

        # Cache for 5 minutes
        await cache_manager.set(cache_key, stats, ttl_seconds=300)

        logger.debug(f"Returned {len(stats)} player stats")
        return stats

    except Exception as e:
        logger.error(f"Error fetching player stats: {e}")
        return {"status": "error", "message": str(e)}
