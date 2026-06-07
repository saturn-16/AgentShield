import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from app.models.prompt import Severity

class ThreatDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    prompt_id: uuid.UUID
    threat_type: str
    confidence: float
    category: str
    risk_level: Severity
    details: Dict[str, Any]
    created_at: datetime

class ThreatListResponse(BaseModel):
    items: List[ThreatDetail]
    total: int
    page: int
    per_page: int

class ThreatStats(BaseModel):
    total_threats: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    top_categories: List[Dict[str, Any]]
