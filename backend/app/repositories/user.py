from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> Optional[User]:
        query = select(User).where(User.email == email)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def update_last_login(self, user_id: UUID) -> None:
        query = (
            update(User)
            .where(User.id == user_id)
            .values(last_login=datetime.now(timezone.utc))
        )
        await self.session.execute(query)
        await self.session.commit()
