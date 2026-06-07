import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.schemas.agent import AgentSwarmRequest, AgentSwarmResponse, AgentActionResponse
from app.agents.graph import run_swarm
from app.models.user import User
from app.models.agent_action import AgentAction
from sqlalchemy import select, desc

router = APIRouter()

@router.post("/swarm/analyze", response_model=AgentSwarmResponse)
async def analyze_with_swarm(
    data: AgentSwarmRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    result = await run_swarm(
        content=data.content,
        analysis_type=data.analysis_type,
        session=session
    )
    return AgentSwarmResponse(
        id=result["id"],
        status=result["status"],
        threat_score=result["threat_score"],
        severity=result["severity"],
        traces=result["traces"],
        final_report=result["final_report"],
        created_at=result["created_at"]
    )

@router.get("/actions")
async def list_agent_actions(
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    # Select recent actions executed by our swarm agents
    query = select(AgentAction).order_by(desc(AgentAction.created_at)).limit(limit)
    result = await session.execute(query)
    items = list(result.scalars().all())
    
    return [AgentActionResponse.model_validate(item) for item in items]
