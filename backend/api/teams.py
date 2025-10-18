"""
Teams endpoints - Team info, stats, profiles
"""

from fastapi import APIRouter, Query
from typing import Optional, List
import logging

from services.readers import data_reader
from services.cache import cache_manager, cache_key_teams, cache_key_team_stats

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/teams")
async def get_teams() -> List[dict]:
    """
    Get all NFL teams

    Returns list of teams with metadata (colors, location, etc.)
    """
    try:
        # Check cache
        cache_key = cache_key_teams()
        cached = await cache_manager.get(cache_key)
        if cached:
            logger.debug("Cache HIT: teams list")
            return cached

        # Query database
        teams = await data_reader.read_teams()

        # Cache for 5 minutes (teams rarely change)
        await cache_manager.set(cache_key, teams, ttl_seconds=300)

        return teams

    except Exception as e:
        logger.error(f"Error fetching teams: {e}")
        return {"status": "error", "message": str(e)}


@router.get("/teams/{team}/stats")
async def get_team_stats(
    team: str = Query(..., description="Team abbreviation (e.g., KC)"),
    season: int = Query(2025, description="Season year"),
    week: Optional[int] = Query(None, description="Week number (if not specified, uses latest)"),
) -> dict:
    """
    Get team statistics for season

    - **team**: Team abbreviation (e.g., KC, BUF, DAL)
    - **season**: Season year (e.g., 2025)
    - **week**: Week number (optional - gets latest if not specified)

    Returns: wins, losses, EPA metrics, ATS record, etc.
    """
    try:
        # Build cache key
        cache_key = cache_key_team_stats(team, season, week)

        # Try cache
        cached = await cache_manager.get(cache_key)
        if cached:
            logger.debug(f"Cache HIT: team stats {team} {season} week {week}")
            return cached

        # Query database
        stats = await data_reader.read_team_stats(team, season, week)

        # Cache for 60 seconds (updates weekly)
        await cache_manager.set(cache_key, stats, ttl_seconds=60)

        return stats

    except Exception as e:
        logger.error(f"Error fetching team stats for {team}: {e}")
        return {"status": "error", "message": str(e)}


@router.get("/teams/{team}/profile")
async def get_team_profile(
    team: str = Query(..., description="Team abbreviation"),
    season: int = Query(2025, description="Season year"),
) -> dict:
    """
    Get full team profile (combined stats, power rating, schedule)

    Returns comprehensive team data including:
    - Team metadata (name, colors, location)
    - Season statistics
    - Power rating (ELO)
    - Schedule for season
    """
    try:
        # For profile, skip cache initially to allow complex query

        # Get team metadata
        teams = await data_reader.read_teams()
        team_info = next((t for t in teams if t.get("team") == team.upper()), None)

        if not team_info:
            return {"status": "error", "message": f"Team {team} not found"}

        # Get stats
        stats = await data_reader.read_team_stats(team, season)

        # Get power rating
        ratings = await data_reader.read_power_ratings(season)
        power_rating = next((r for r in ratings if r.get("team") == team.upper()), None)

        # Get schedule
        schedule = await data_reader.read_schedules(season, team=team)

        profile = {
            "team_info": team_info,
            "stats": stats,
            "power_rating": power_rating,
            "schedule": schedule,
        }

        return profile

    except Exception as e:
        logger.error(f"Error fetching team profile for {team}: {e}")
        return {"status": "error", "message": str(e)}
