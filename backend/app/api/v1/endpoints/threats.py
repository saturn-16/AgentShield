from fastapi import APIRouter, Depends, Query, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.schemas.threat import ThreatListResponse, ThreatStats, ThreatDetail
from app.repositories.threat import ThreatRepository
from app.repositories.prompt import PromptRepository
from app.models.user import User
from app.core.exceptions import NotFoundError
from sqlalchemy import select, func, desc
from app.models.threat import Threat
from app.models.prompt import Severity
import json
import logging
import uuid

logger = logging.getLogger("agentshield.threats")
router = APIRouter()

# WebSocket Connection Manager for real-time broadcasts
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket client connected. Active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket client disconnected. Active: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting WebSocket message: {str(e)}")

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_threats_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for ping/messages
            data = await websocket.receive_text()
            # Simple echo/heartbeat
            await websocket.send_text(json.dumps({"status": "heartbeat", "received": data}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Helper function to trigger broadcasts externally from API
async def broadcast_threat_alert(threat_data: dict):
    message = json.dumps({
        "event": "new_threat",
        "data": threat_data
    })
    await manager.broadcast(message)

@router.get("/", response_model=ThreatListResponse)
async def get_threats(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    threat_repo = ThreatRepository(session)
    skip = (page - 1) * per_page
    
    # Restrict to threats tied to current user's prompts
    prompt_repo = PromptRepository(session)
    prompts = await prompt_repo.get_user_prompts(current_user.id, skip=0, limit=1000)
    prompt_ids = [p.id for p in prompts]
    
    if not prompt_ids:
        return ThreatListResponse(items=[], total=0, page=page, per_page=per_page)
        
    query = select(Threat).where(Threat.prompt_id.in_(prompt_ids)).order_by(desc(Threat.created_at)).offset(skip).limit(per_page)
    result = await session.execute(query)
    items = list(result.scalars().all())
    
    count_query = select(func.count()).select_from(Threat).where(Threat.prompt_id.in_(prompt_ids))
    count_res = await session.execute(count_query)
    total = count_res.scalar() or 0
    
    return ThreatListResponse(
        items=[ThreatDetail.model_validate(item) for item in items],
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/stats", response_model=ThreatStats)
async def get_threat_stats(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    threat_repo = ThreatRepository(session)
    prompt_repo = PromptRepository(session)
    
    prompts = await prompt_repo.get_user_prompts(current_user.id, skip=0, limit=1000)
    prompt_ids = [p.id for p in prompts]
    
    if not prompt_ids:
        return ThreatStats(
            total_threats=0,
            critical_count=0,
            high_count=0,
            medium_count=0,
            low_count=0,
            top_categories=[]
        )
        
    from sqlalchemy import select, func
    from app.models.threat import Threat
    from app.models.prompt import Severity
    
    # Threat counts by severity
    query = select(Threat.risk_level, func.count(Threat.id)).where(Threat.prompt_id.in_(prompt_ids)).group_by(Threat.risk_level)
    res = await session.execute(query)
    counts = {row[0]: row[1] for row in res.all()}
    
    # Top categories
    dist = await threat_repo.get_threat_distribution(days=30)
    
    return ThreatStats(
        total_threats=sum(counts.values()),
        critical_count=counts.get(Severity.CRITICAL, 0),
        high_count=counts.get(Severity.HIGH, 0),
        medium_count=counts.get(Severity.MEDIUM, 0),
        low_count=counts.get(Severity.LOW, 0),
        top_categories=dist
    )

@router.get("/{id}", response_model=ThreatDetail)
async def get_threat_detail(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    threat_repo = ThreatRepository(session)
    threat = await threat_repo.get(id)
    if not threat:
        raise NotFoundError("Threat log not found.")
        
    # Check authorization (belongs to current user's prompt)
    prompt_repo = PromptRepository(session)
    prompt = await prompt_repo.get(threat.prompt_id)
    if not prompt or prompt.user_id != current_user.id:
        raise NotFoundError("Threat log not found.")
        
    return ThreatDetail.model_validate(threat)
