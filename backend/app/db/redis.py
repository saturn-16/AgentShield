import json
import logging
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

logger = logging.getLogger("agentshield.redis")

class RedisClient:
    def __init__(self):
        self._client: Optional[aioredis.Redis] = None

    def connect(self) -> None:
        self._client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        logger.info("Connected to Redis successfully.")

    async def close(self) -> None:
        if self._client:
            await self._client.close()
            logger.info("Closed Redis connection.")

    async def get(self, key: str) -> Optional[str]:
        if not self._client:
            self.connect()
        try:
            return await self._client.get(key)
        except Exception as e:
            logger.error(f"Redis get error: {str(e)}")
            return None

    async def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        if not self._client:
            self.connect()
        try:
            return await self._client.set(key, value, ex=ex)
        except Exception as e:
            logger.error(f"Redis set error: {str(e)}")
            return False

    async def delete(self, key: str) -> int:
        if not self._client:
            self.connect()
        try:
            return await self._client.delete(key)
        except Exception as e:
            logger.error(f"Redis delete error: {str(e)}")
            return 0

    async def incr(self, key: str) -> Optional[int]:
        if not self._client:
            self.connect()
        try:
            return await self._client.incr(key)
        except Exception as e:
            logger.error(f"Redis incr error: {str(e)}")
            return None

    async def expire(self, key: str, seconds: int) -> bool:
        if not self._client:
            self.connect()
        try:
            return await self._client.expire(key, seconds)
        except Exception as e:
            logger.error(f"Redis expire error: {str(e)}")
            return False

    async def check_rate_limit(self, key: str, limit: int, window: int) -> bool:
        """
        Returns True if request is allowed, False if rate limit is exceeded.
        """
        if not self._client:
            self.connect()
        try:
            current = await self.get(key)
            if current is not None and int(current) >= limit:
                return False
            
            async with self._client.pipeline(transaction=True) as pipe:
                pipe.incr(key)
                if current is None:
                    pipe.expire(key, window)
                await pipe.execute()
            return True
        except Exception as e:
            logger.error(f"Redis rate limit check error: {str(e)}")
            # Fail open for safety in case Redis goes down
            return True

redis_client = RedisClient()

async def get_redis() -> RedisClient:
    return redis_client
