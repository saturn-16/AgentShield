from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.schemas.trust import TrustScoreResponse, TrustTrendResponse
from app.services.trust_scoring import TrustScoringService
from app.models.user import User

router = APIRouter()

@router.get("/score", response_model=TrustScoreResponse)
async def get_score(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    service = TrustScoringService()
    return await service.calculate(current_user.id, session)

@router.post("/calculate", response_model=TrustScoreResponse)
async def calculate_score(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    service = TrustScoringService()
    return await service.calculate(current_user.id, session)

@router.get("/trend", response_model=TrustTrendResponse)
async def get_trend(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    service = TrustScoringService()
    result = await service.calculate(current_user.id, session)
    
    # Calculate average
    trend = result["trend"]
    avg = sum(t["score"] for t in trend) / len(trend) if trend else 100.0
    
    return TrustTrendResponse(
        trend=trend,
        average=avg,
        current=result["score"]
    )
