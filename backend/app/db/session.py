from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings
import logging
import socket

logger = logging.getLogger("agentshield.db")

db_url = settings.DATABASE_URL

# Fallback to local SQLite database if PostgreSQL is not running/accessible
if "postgresql" in db_url:
    try:
        # Parse host and port from URL
        # e.g., postgresql+asyncpg://user:pass@host:port/db
        host_port = db_url.split("@")[-1].split("/")[0]
        if ":" in host_port:
            host, port = host_port.split(":")
            port = int(port)
        else:
            host, port = host_port, 5432
            
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.5)
        s.connect((host, port))
        s.close()
        logger.info(f"PostgreSQL detected at {host}:{port}. Using Postgres.")
    except Exception:
        logger.warning("PostgreSQL database is not reachable. Falling back to local SQLite database.")
        db_url = "sqlite+aiosqlite:///agentshield.db"

engine_args = {}
if "sqlite" in db_url:
    # SQLite does not support pool_size or pool_pre_ping arguments in the same way
    pass
else:
    engine_args = {
        "pool_size": 20,
        "max_overflow": 10,
        "pool_pre_ping": True
    }

engine = create_async_engine(db_url, **engine_args)

async_session_maker = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

async def init_local_db():
    if "sqlite" in db_url:
        from app.models import Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Local SQLite database initialized with all tables.")

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

