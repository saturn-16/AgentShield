from typing import Any, Generic, List, Optional, Type, TypeVar, Union
from uuid import UUID
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get(self, id: UUID) -> Optional[ModelType]:
        query = select(self.model).where(self.model.id == id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_multi(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        order_by: Any = None, 
        **filters
    ) -> List[ModelType]:
        query = select(self.model)
        for key, value in filters.items():
            if hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)
        
        if order_by is not None:
            query = query.order_by(order_by)
        else:
            if hasattr(self.model, "created_at"):
                query = query.order_by(self.model.created_at.desc())
                
        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def create(self, **kwargs) -> ModelType:
        obj = self.model(**kwargs)
        self.session.add(obj)
        await self.session.commit()
        await self.session.refresh(obj)
        return obj

    async def update(self, id: UUID, **kwargs) -> Optional[ModelType]:
        query = (
            update(self.model)
            .where(self.model.id == id)
            .values(**kwargs)
            .execution_options(synchronize_session="fetch")
        )
        await self.session.execute(query)
        await self.session.commit()
        return await self.get(id)

    async def delete(self, id: UUID) -> bool:
        query = delete(self.model).where(self.model.id == id)
        result = await self.session.execute(query)
        await self.session.commit()
        return result.rowcount > 0

    async def count(self, **filters) -> int:
        query = select(func.count()).select_from(self.model)
        for key, value in filters.items():
            if hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)
        result = await self.session.execute(query)
        return result.scalar() or 0
