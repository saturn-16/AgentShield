from typing import List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.threat import Threat
from app.repositories.base import BaseRepository

class ThreatRepository(BaseRepository[Threat]):
    def __init__(self, session: AsyncSession):
        super().__init__(Threat, session)

    async def get_by_prompt(self, prompt_id: UUID) -> List[Threat]:
        return await self.get_multi(prompt_id=prompt_id)

    async def get_threat_distribution(self, days: int = 30) -> List[Dict[str, Any]]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        query = (
            select(
                Threat.category,
                func.count(Threat.id).label("count")
            )
            .where(Threat.created_at >= cutoff)
            .group_by(Threat.category)
            .order_by(func.count(Threat.id).desc())
        )
        result = await self.session.execute(query)
        rows = result.all()
        
        total = sum(row.count for row in rows)
        
        return [
            {
                "category": row.category,
                "count": row.count,
                "percentage": round((row.count / total) * 100, 2) if total > 0 else 0.0
            }
            for row in rows
        ]

    async def get_recent(self, limit: int = 20) -> List[Threat]:
        return await self.get_multi(limit=limit, order_by=Threat.created_at.desc())
