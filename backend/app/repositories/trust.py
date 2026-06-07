from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.trust_score import TrustScore
from app.repositories.base import BaseRepository

class TrustScoreRepository(BaseRepository[TrustScore]):
    def __init__(self, session: AsyncSession):
        super().__init__(TrustScore, session)

    async def get_latest(self, user_id: UUID) -> Optional[TrustScore]:
        query = (
            select(TrustScore)
            .where(TrustScore.user_id == user_id)
            .order_by(TrustScore.created_at.desc())
            .limit(1)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_trend(self, user_id: UUID, days: int = 30) -> List[TrustScore]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        query = (
            select(TrustScore)
            .where(TrustScore.user_id == user_id)
            .where(TrustScore.created_at >= cutoff)
            .order_by(TrustScore.created_at.asc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
