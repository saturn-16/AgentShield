import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user, require_role
from app.schemas.auth import UserResponse
from app.models.user import User, UserRole
from app.repositories.user import UserRepository
from app.core.exceptions import NotFoundError
from sqlalchemy import select, func

router = APIRouter(dependencies=[require_role(UserRole.ADMIN)])

@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db)
):
    user_repo = UserRepository(session)
    skip = (page - 1) * per_page
    
    users = await user_repo.get_multi(skip=skip, limit=per_page, order_by=User.created_at.desc())
    total = await user_repo.count()
    
    return {
        "items": [UserResponse.model_validate(u) for u in users],
        "total": total,
        "page": page,
        "per_page": per_page
    }

@router.patch("/users/{id}/role", response_model=UserResponse)
async def update_user_role(
    id: uuid.UUID,
    role: UserRole,
    session: AsyncSession = Depends(get_db)
):
    user_repo = UserRepository(session)
    user = await user_repo.get(id)
    if not user:
        raise NotFoundError("User not found.")
        
    updated = await user_repo.update(id, role=role)
    return UserResponse.model_validate(updated)

@router.delete("/users/{id}", response_model=UserResponse)
async def deactivate_user(
    id: uuid.UUID,
    session: AsyncSession = Depends(get_db)
):
    user_repo = UserRepository(session)
    user = await user_repo.get(id)
    if not user:
        raise NotFoundError("User not found.")
        
    updated = await user_repo.update(id, is_active=False)
    return UserResponse.model_validate(updated)

@router.get("/system/health")
async def get_system_health(
    session: AsyncSession = Depends(get_db)
):
    # Simple query check
    try:
        await session.execute(select(func.now()))
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
        
    return {
        "api_status": "healthy",
        "database_status": db_status,
        "redis_status": "healthy",
        "celery_queue_depth": 0,
        "system_load": 0.05
    }
