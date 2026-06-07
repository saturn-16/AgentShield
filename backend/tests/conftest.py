"""
Pytest fixtures for AgentShield AI backend test suite.
=====================================================
Provides:
- Async test client (httpx.AsyncClient)
- In-memory SQLite async database session
- Authenticated test user with JWT headers
- FastAPI dependency overrides for isolated testing
"""

import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.db.base import Base
from app.api.deps import get_db
from app.main import app
from app.models.user import User

# ── Test Database ────────────────────────────────────────────
# Use SQLite async (aiosqlite) for fast, isolated test runs
TEST_DATABASE_URL = "sqlite+aiosqlite://"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ── Event Loop ───────────────────────────────────────────────
@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create a single event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


# ── Database Session ─────────────────────────────────────────
@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    """
    Create all tables before each test, drop after.
    Ensures complete isolation between tests.
    """
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a transactional database session for tests."""
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()


# ── Dependency Override ──────────────────────────────────────
async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    """Override the FastAPI get_db dependency with the test session."""
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


# ── Async HTTP Client ───────────────────────────────────────
@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Provide an async HTTP client bound to the FastAPI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ── Test User ────────────────────────────────────────────────
@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> dict:
    """
    Create a test user in the database and return a dict with
    user data and pre-built Authorization headers.
    """
    user = User(
        email="testuser@agentshield.ai",
        password_hash=hash_password("TestPassword123!"),
        full_name="Test User",
        role="user",
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    access_token = create_access_token(data={"sub": user.email, "user_id": str(user.id), "role": user.role.value})

    return {
        "user": user,
        "email": user.email,
        "password": "TestPassword123!",
        "headers": {"Authorization": f"Bearer {access_token}"},
    }


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession) -> dict:
    """
    Create an admin user for privilege-escalation tests.
    """
    user = User(
        email="admin@agentshield.ai",
        password_hash=hash_password("AdminPassword123!"),
        full_name="Admin User",
        role="admin",
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    access_token = create_access_token(data={"sub": user.email, "user_id": str(user.id), "role": user.role.value})

    return {
        "user": user,
        "email": user.email,
        "password": "AdminPassword123!",
        "headers": {"Authorization": f"Bearer {access_token}"},
    }
