from typing import AsyncGenerator
from fastapi import Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_session
from app.db.redis import get_redis, RedisClient
from app.core.security import verify_token
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.models.user import User, UserRole
from app.repositories.user import UserRepository
from uuid import UUID

security = HTTPBearer(auto_error=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_session():
        yield session

async def get_redis_client() -> RedisClient:
    return await get_redis()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Security(security),
    session: AsyncSession = Depends(get_db)
) -> User:
    if not credentials:
        raise AuthenticationError("Not authenticated.")
    token = credentials.credentials
    try:
        payload = verify_token(token)
        if payload.get("type") != "access":
            raise AuthenticationError("Invalid token type. Access token expected.")
        user_id = payload.get("user_id")
        
        user_repo = UserRepository(session)
        user = await user_repo.get(UUID(user_id))
        
        if not user:
            raise AuthenticationError("User not found.")
        return user
    except Exception as e:
        raise AuthenticationError(f"Could not validate credentials: {str(e)}")

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise AuthenticationError("User account is inactive.")
    return current_user

class RoleChecker:
    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(
        self, 
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        if current_user.role not in self.allowed_roles:
            raise AuthorizationError("Insufficient permissions to perform this action.")
        return current_user

def require_role(*roles: UserRole):
    return Depends(RoleChecker(list(roles)))
