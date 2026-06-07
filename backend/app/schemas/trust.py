import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class TrustFactors(BaseModel):
    prompt_safety: float
    url_safety: float
    leakage_risk: float
    behavioral_risk: float

class TrustTrendPoint(BaseModel):
    score: int
    created_at: datetime

class TrustScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    score: int
    factors: TrustFactors
    risk_classification: str
    created_at: datetime
    trend: Optional[List[TrustTrendPoint]] = None

class TrustTrendResponse(BaseModel):
    trend: List[TrustTrendPoint]
    average: float
    current: int
