import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, HttpUrl, Field, ConfigDict, field_validator
from urllib.parse import urlparse
from app.models.url_scan import Classification

class UrlScanRequest(BaseModel):
    url: str = Field(..., min_length=4, description="URL to scan")

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v_clean = v.strip()
        # Basic validation: must start with http://, https://, or data:
        if not (v_clean.startswith("http://") or v_clean.startswith("https://") or v_clean.startswith("data:")):
            raise ValueError("URL must start with http://, https://, or data:")
        
        # Additional parsing check for http/https to make sure there's a domain/host
        if v_clean.startswith("http://") or v_clean.startswith("https://"):
            parsed = urlparse(v_clean)
            if not parsed.netloc:
                raise ValueError("URL is missing hostname")
                
        return v_clean

class UrlIndicator(BaseModel):
    name: str
    value: str
    risk_contribution: str

class UrlScanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    url: str
    domain: str
    domain_age_days: Optional[int] = None
    reputation_score: float
    classification: Classification
    indicators: List[UrlIndicator]
    created_at: datetime

    # Compatibility fields for tests
    risk_level: Optional[str] = None
    risk_score: Optional[float] = None
    is_malicious: Optional[bool] = None
