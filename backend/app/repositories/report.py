from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.report import Report
from app.repositories.base import BaseRepository

class ReportRepository(BaseRepository[Report]):
    def __init__(self, session: AsyncSession):
        super().__init__(Report, session)

    async def get_user_reports(
        self, 
        user_id: UUID, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Report]:
        return await self.get_multi(
            skip=skip, 
            limit=limit, 
            user_id=user_id, 
            order_by=Report.created_at.desc()
        )
