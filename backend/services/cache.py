"""
Redis caching layer for expensive queries
"""

import json
import redis
import logging
from typing import Optional, Any
from core.config import settings

logger = logging.getLogger(__name__)


class CacheManager:
    """Manages Redis caching for API responses"""

    def __init__(self):
        """Initialize Redis connection"""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL, decode_responses=True, socket_connect_timeout=5
            )
            # Test connection
            self.redis_client.ping()
            logger.info("✅ Redis connected")
        except redis.ConnectionError as e:
            logger.warning(f"⚠️  Redis connection failed: {e}. Caching disabled.")
            self.redis_client = None

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.redis_client:
            return None
        try:
            data = self.redis_client.get(key)
            if data:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(data)
            logger.debug(f"Cache MISS: {key}")
            return None
        except Exception as e:
            logger.error(f"Cache get error for {key}: {e}")
            return None

    async def set(self, key: str, value: Any, ttl_seconds: int = 300) -> None:
        """Set value in cache with TTL"""
        if not self.redis_client:
            return
        try:
            self.redis_client.setex(key, ttl_seconds, json.dumps(value))
            logger.debug(f"Cache SET: {key} (TTL: {ttl_seconds}s)")
        except Exception as e:
            logger.error(f"Cache set error for {key}: {e}")

    async def delete(self, key: str) -> None:
        """Delete from cache"""
        if not self.redis_client:
            return
        try:
            self.redis_client.delete(key)
            logger.debug(f"Cache DEL: {key}")
        except Exception as e:
            logger.error(f"Cache delete error for {key}: {e}")

    async def clear_pattern(self, pattern: str) -> None:
        """Delete all keys matching pattern"""
        if not self.redis_client:
            return
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                self.redis_client.delete(*keys)
                logger.info(f"Cache cleared {len(keys)} keys matching {pattern}")
        except Exception as e:
            logger.error(f"Cache clear pattern error: {e}")


# Global cache manager instance
cache_manager = CacheManager()


# Cache key builders
def cache_key_schedules(season: int, week: Optional[int] = None, team: Optional[str] = None) -> str:
    """Build cache key for schedules"""
    return f"schedules:{season}:{week}:{team}"


def cache_key_team_stats(team: str, season: int, week: Optional[int] = None) -> str:
    """Build cache key for team stats"""
    return f"team_stats:{team}:{season}:{week}"


def cache_key_pbp(game_id: str, limit: int = 100, offset: int = 0) -> str:
    """Build cache key for play-by-play"""
    return f"pbp:{game_id}:{limit}:{offset}"


def cache_key_teams() -> str:
    """Build cache key for teams list"""
    return "teams:all"


def cache_key_power_ratings(season: int) -> str:
    """Build cache key for power ratings"""
    return f"power_ratings:{season}"


def cache_key_scoreboard(date: str) -> str:
    """Build cache key for scoreboard"""
    return f"scoreboard:{date}"
