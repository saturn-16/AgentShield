import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from app.models.agent_action import AgentType, ActionStatus
from app.models.prompt import Severity

class AgentSwarmRequest(BaseModel):
    content: str
    analysis_type: str = "comprehensive"

class AgentTrace(BaseModel):
    agent_type: AgentType
    action: str
    reasoning: str
    result: Dict[str, Any]
    duration_ms: int

class AgentSwarmResponse(BaseModel):
    id: uuid.UUID
    status: str
    threat_score: int
    severity: Severity
    traces: List[AgentTrace]
    final_report: str
    created_at: datetime

class AgentActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    agent_type: AgentType
    action: str
    status: ActionStatus
    reasoning_trace: Optional[str] = None
    execution_time_ms: Optional[int] = None
    created_at: datetime
