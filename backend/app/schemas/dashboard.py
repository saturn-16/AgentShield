from typing import List, Dict, Any
from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_scans: int
    threats_detected: int
    average_trust_score: int
    active_agents: int
    scans_today: int
    threats_today: int

class ScanActivityPoint(BaseModel):
    date: str
    prompt_scans: int
    url_scans: int

class ThreatDistItem(BaseModel):
    category: str
    count: int
    percentage: float

class DashboardResponse(BaseModel):
    stats: DashboardStats
    scan_activity: List[ScanActivityPoint]
    threat_distribution: List[ThreatDistItem]
    recent_threats: List[Dict[str, Any]]
