from typing import List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.prompt import Prompt
from app.repositories.base import BaseRepository

class PromptRepository(BaseRepository[Prompt]):
    def __init__(self, session: AsyncSession):
        super().__init__(Prompt, session)

    async def get_user_prompts(
        self, 
        user_id: UUID, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Prompt]:
        return await self.get_multi(
            skip=skip, 
            limit=limit, 
            user_id=user_id, 
            order_by=Prompt.created_at.desc()
        )

    async def get_recent_threats(self, limit: int = 10) -> List[Prompt]:
        query = (
            select(Prompt)
            .where(Prompt.threat_score > 0)
            .order_by(Prompt.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_scan_stats(self, user_id: UUID, days: int = 7) -> Dict[str, Any]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        query = (
            select(
                func.count(Prompt.id).label("total"),
                func.avg(Prompt.threat_score).label("avg_score"),
                func.sum(func.cast(Prompt.threat_score > 50, func.Integer)).label("high_threat_count")
            )
            .where(Prompt.user_id == user_id)
            .where(Prompt.created_at >= cutoff)
        )
        result = await self.session.execute(query)
        row = result.fetchone()
        
        return {
            "total_scans": row.total if row and row.total else 0,
            "average_threat_score": float(row.avg_score) if row and row.avg_score else 0.0,
            "high_threat_scans": row.high_threat_count if row and row.high_threat_count else 0
        }
