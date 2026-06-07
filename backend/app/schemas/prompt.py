import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.prompt import Severity

class PromptScanRequest(BaseModel):
    content: str = Field(..., min_length=1, description="Prompt content to analyze")

class DetectedPattern(BaseModel):
    pattern_name: str
    matched_text: str
    severity: Severity
    description: str

class PromptScanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    content: str
    threat_score: int
    severity: Severity
    detected_patterns: List[DetectedPattern]
    explanation: str
    recommended_action: str
    created_at: datetime

class PromptHistoryResponse(BaseModel):
    items: List[PromptScanResponse]
    total: int
    page: int
    per_page: int
