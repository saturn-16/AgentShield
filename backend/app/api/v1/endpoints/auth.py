from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse, UserUpdate, RefreshRequest
from app.services.auth import AuthService
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    session: AsyncSession = Depends(get_db)
):
    service = AuthService(session)
    return await service.register(data)

@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    session: AsyncSession = Depends(get_db)
):
    service = AuthService(session)
    return await service.login(data)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    data: RefreshRequest,
    session: AsyncSession = Depends(get_db)
):
    service = AuthService(session)
    return await service.refresh_token(data.refresh_token)

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_active_user)
):
    return UserResponse.model_validate(current_user)

@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    service = AuthService(session)
    return await service.update_user(current_user.id, data)
