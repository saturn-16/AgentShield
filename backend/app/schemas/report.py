import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from app.models.report import ReportType, GeneratedBy

class ReportCreate(BaseModel):
    title: Optional[str] = None
    report_type: ReportType

class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    content: str
    report_type: ReportType
    generated_by: GeneratedBy
    created_at: datetime

class ReportListResponse(BaseModel):
    items: List[ReportResponse]
    total: int
    page: int
    per_page: int
