import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.schemas.report import ReportCreate, ReportResponse, ReportListResponse
from app.services.report_generator import ReportGeneratorService
from app.repositories.report import ReportRepository
from app.models.user import User
from app.core.exceptions import NotFoundError

router = APIRouter()

@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(
    data: ReportCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    service = ReportGeneratorService()
    report = await service.generate(current_user.id, data.report_type, session)
    return ReportResponse.model_validate(report)

@router.get("/", response_model=ReportListResponse)
async def list_reports(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    report_repo = ReportRepository(session)
    skip = (page - 1) * per_page
    
    items = await report_repo.get_user_reports(current_user.id, skip=skip, limit=per_page)
    total = await report_repo.count(user_id=current_user.id)
    
    return ReportListResponse(
        items=[ReportResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        per_page=per_page
    )

@router.get("/{id}", response_model=ReportResponse)
async def get_report(
    id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db)
):
    report_repo = ReportRepository(session)
    report = await report_repo.get(id)
    if not report or report.user_id != current_user.id:
        raise NotFoundError("Report not found.")
    return ReportResponse.model_validate(report)
