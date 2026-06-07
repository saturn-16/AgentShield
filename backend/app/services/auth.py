from typing import Optional
from uuid import UUID
from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user import UserRepository
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse, UserUpdate
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from app.core.exceptions import ConflictError, AuthenticationError, NotFoundError
from app.core.config import settings

class AuthService:
    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepository(session)

    async def register(self, data: RegisterRequest) -> UserResponse:
        # Check if user already exists
        existing_user = await self.user_repo.get_by_email(data.email)
        if existing_user:
            raise ConflictError(f"Email '{data.email}' is already registered.")
            
        hashed_password = hash_password(data.password)
        
        user = await self.user_repo.create(
            email=data.email,
            password_hash=hashed_password,
            full_name=data.full_name,
            is_active=True,
            is_verified=False
        )
        
        return UserResponse.model_validate(user)

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise AuthenticationError("Invalid email or password.")
            
        if not user.is_active:
            raise AuthenticationError("This user account has been deactivated.")

        # Update last login
        await self.user_repo.update_last_login(user.id)

        token_data = {"user_id": str(user.id), "role": user.role.value}
        access_token = create_access_token(data=token_data)
        refresh_token = create_refresh_token(data=token_data)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token
        )

    async def refresh_token(self, refresh_token: str) -> TokenResponse:
        try:
            payload = verify_token(refresh_token)
            if payload.get("type") != "refresh":
                raise AuthenticationError("Invalid token type. Refresh token required.")
                
            user_id = payload.get("user_id")
            role = payload.get("role")
            
            user = await self.user_repo.get(UUID(user_id))
            if not user or not user.is_active:
                raise AuthenticationError("User is inactive or does not exist.")
                
            token_data = {"user_id": str(user.id), "role": role}
            
            access_token = create_access_token(data=token_data)
            new_refresh_token = create_refresh_token(data=token_data)
            
            return TokenResponse(
                access_token=access_token,
                refresh_token=new_refresh_token
            )
        except Exception as e:
            raise AuthenticationError(f"Could not refresh token: {str(e)}")

    async def update_user(self, user_id: UUID, data: UserUpdate) -> UserResponse:
        user = await self.user_repo.get(user_id)
        if not user:
            raise NotFoundError("User not found.")
            
        update_data = {}
        if data.full_name is not None:
            update_data["full_name"] = data.full_name
        if data.email is not None:
            # Check if email is already taken
            if data.email != user.email:
                existing = await self.user_repo.get_by_email(data.email)
                if existing:
                    raise ConflictError(f"Email '{data.email}' is already in use.")
                update_data["email"] = data.email
                
        if update_data:
            user = await self.user_repo.update(user_id, **update_data)
            
        return UserResponse.model_validate(user)
