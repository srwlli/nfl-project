"""
Data readers for Supabase PostgreSQL
Handles all database queries using Polars for transformation
"""

import logging
from typing import Optional, List, Dict, Any
import polars as pl
from supabase import create_client, Client

from core.config import settings

logger = logging.getLogger(__name__)


class DataReader:
    """Reads and transforms data from Supabase PostgreSQL"""

    def __init__(self):
        """Initialize Supabase client"""
        try:
            self.supabase: Client = create_client(
                settings.SUPABASE_URL, settings.SUPABASE_KEY
            )
            logger.info("✅ Supabase client initialized")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase: {e}")
            raise

    async def read_schedules(
        self,
        season: int,
        week: Optional[int] = None,
        team: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Read game schedules with optional filters"""
        try:
            query = self.supabase.table("schedules").select("*").eq("season", season)

            if week:
                query = query.eq("week", week)

            if team:
                # Filter by home or away team
                query = query.or_(f"home_team.eq.{team},away_team.eq.{team}")

            result = query.order("gameday", desc=False).execute()
            logger.debug(f"Read {len(result.data)} schedules for season {season}")
            return result.data or []

        except Exception as e:
            logger.error(f"Error reading schedules: {e}")
            return []

    async def read_team_stats(
        self, team: str, season: int, week: Optional[int] = None
    ) -> Dict[str, Any]:
        """Read team statistics"""
        try:
            query = (
                self.supabase.table("season_stats")
                .select("*")
                .eq("team", team)
                .eq("season", season)
            )

            if week:
                query = query.eq("week", week)
            else:
                # Get most recent week if not specified
                query = query.order("week", desc=True).limit(1)

            result = query.execute()
            return result.data[0] if result.data else {}

        except Exception as e:
            logger.error(f"Error reading team stats for {team}: {e}")
            return {}

    async def read_pbp(
        self, game_id: str, limit: int = 100, offset: int = 0
    ) -> Dict[str, Any]:
        """Read play-by-play data with pagination"""
        try:
            # Get total count
            count_result = (
                self.supabase.table("play_by_play")
                .select("*", count="exact")
                .eq("game_id", game_id)
                .execute()
            )

            # Get paginated data
            query = (
                self.supabase.table("play_by_play")
                .select("*")
                .eq("game_id", game_id)
                .order("play_index", desc=False)
                .range(offset, offset + limit - 1)
            )

            result = query.execute()

            return {
                "total": count_result.count or 0,
                "plays": result.data or [],
                "limit": limit,
                "offset": offset,
            }

        except Exception as e:
            logger.error(f"Error reading PBP for {game_id}: {e}")
            return {"total": 0, "plays": [], "limit": limit, "offset": offset}

    async def read_teams(self) -> List[Dict[str, Any]]:
        """Read all teams"""
        try:
            result = self.supabase.table("teams").select("*").execute()
            logger.debug(f"Read {len(result.data)} teams")
            return result.data or []

        except Exception as e:
            logger.error(f"Error reading teams: {e}")
            return []

    async def read_power_ratings(self, season: int) -> List[Dict[str, Any]]:
        """Read power ratings for a season"""
        try:
            result = (
                self.supabase.table("power_ratings")
                .select("*")
                .eq("season", season)
                .order("elo_rank", desc=False)
                .execute()
            )
            logger.debug(f"Read {len(result.data)} power ratings")
            return result.data or []

        except Exception as e:
            logger.error(f"Error reading power ratings: {e}")
            return []

    async def read_injuries(
        self, season: int, week: Optional[int] = None, team: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Read injury reports"""
        try:
            query = self.supabase.table("injuries").select("*").eq("season", season)

            if week:
                query = query.eq("week", week)

            if team:
                query = query.eq("team", team)

            result = query.execute()
            return result.data or []

        except Exception as e:
            logger.error(f"Error reading injuries: {e}")
            return []

    async def read_depth_charts(
        self, team: str, season: int, week: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Read depth charts"""
        try:
            query = (
                self.supabase.table("depth_charts")
                .select("*")
                .eq("team", team)
                .eq("season", season)
            )

            if week:
                query = query.eq("week", week)

            result = query.order("position", desc=False).order(
                "depth_rank", desc=False
            ).execute()
            return result.data or []

        except Exception as e:
            logger.error(f"Error reading depth charts: {e}")
            return []

    async def read_player_stats(
        self, season: int, team: Optional[str] = None, position: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Read player statistics"""
        try:
            query = (
                self.supabase.table("player_stats")
                .select("*")
                .eq("season", season)
            )

            if team:
                query = query.eq("team", team)

            if position:
                query = query.eq("position", position)

            result = query.execute()
            return result.data or []

        except Exception as e:
            logger.error(f"Error reading player stats: {e}")
            return []

    async def read_player(self, player_id: str) -> Dict[str, Any]:
        """Read single player profile"""
        try:
            result = (
                self.supabase.table("players")
                .select("*")
                .eq("player_id", player_id)
                .execute()
            )

            return result.data[0] if result.data else {}

        except Exception as e:
            logger.error(f"Error reading player {player_id}: {e}")
            return {}

    async def read_game(self, game_id: str) -> Dict[str, Any]:
        """Read full game details"""
        try:
            # Get schedule info
            schedule = (
                self.supabase.table("schedules")
                .select("*")
                .eq("game_id", game_id)
                .execute()
            )

            if not schedule.data:
                return {}

            game = schedule.data[0]

            # Get PBP sample (last 20 plays)
            pbp_result = (
                self.supabase.table("play_by_play")
                .select("*")
                .eq("game_id", game_id)
                .order("play_index", desc=False)
                .limit(20)
                .execute()
            )

            game["pbp_sample"] = pbp_result.data or []

            return game

        except Exception as e:
            logger.error(f"Error reading game {game_id}: {e}")
            return {}

    async def read_scoreboard(self, date: str) -> List[Dict[str, Any]]:
        """Read scoreboard for a specific date"""
        try:
            result = (
                self.supabase.table("schedules")
                .select("*")
                .eq("gameday", date)
                .order("gametime", desc=False)
                .execute()
            )

            return result.data or []

        except Exception as e:
            logger.error(f"Error reading scoreboard for {date}: {e}")
            return []


# Global data reader instance
data_reader = DataReader()
