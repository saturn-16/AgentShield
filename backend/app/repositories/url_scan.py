from typing import List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.url_scan import UrlScan
from app.repositories.base import BaseRepository

class UrlScanRepository(BaseRepository[UrlScan]):
    def __init__(self, session: AsyncSession):
        super().__init__(UrlScan, session)

    async def get_user_scans(
        self, 
        user_id: UUID, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[UrlScan]:
        return await self.get_multi(
            skip=skip, 
            limit=limit, 
            user_id=user_id, 
            order_by=UrlScan.created_at.desc()
        )

    async def get_by_domain(self, domain: str) -> List[UrlScan]:
        return await self.get_multi(domain=domain)
