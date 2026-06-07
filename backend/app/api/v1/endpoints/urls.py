from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.schemas.url_scan import UrlScanRequest, UrlScanResponse
from app.services.url_analysis import UrlAnalysisService
from app.repositories.url_scan import UrlScanRepository
from app.models.user import User

router = APIRouter()

@router.post("/scan", response_model=UrlScanResponse, status_code=status.HTTP_200_OK)
async def scan_url(
    data: UrlScanRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    analysis_service = UrlAnalysisService()
    result = analysis_service.analyze(data.url)
    
    url_repo = UrlScanRepository(session)
    url_scan = await url_repo.create(
        user_id=current_user.id,
        url=data.url,
        domain=result["domain"],
        domain_age_days=result.get("domain_age_days"),
        reputation_score=result["reputation_score"],
        classification=result["classification"],
        indicators=result["indicators"]
    )
    
    # Attach computed fields for compatibility with test suite
    url_scan.risk_score = (100.0 - url_scan.reputation_score) / 100.0
    url_scan.risk_level = "low"
    if url_scan.classification.value == "malicious":
        url_scan.risk_level = "critical"
    elif url_scan.classification.value == "suspicious":
        url_scan.risk_level = "medium"
    url_scan.is_malicious = url_scan.classification.value == "malicious"
    
    return UrlScanResponse.model_validate(url_scan)

@router.get("/history")
async def get_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    url_repo = UrlScanRepository(session)
    skip = (page - 1) * per_page
    
    items = await url_repo.get_user_scans(current_user.id, skip=skip, limit=per_page)
    total = await url_repo.count(user_id=current_user.id)
    
    return {
        "items": [UrlScanResponse.model_validate(item) for item in items],
        "total": total,
        "page": page,
        "per_page": per_page
    }
