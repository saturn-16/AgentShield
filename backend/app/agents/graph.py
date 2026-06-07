import uuid
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, TypedDict
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.agent_action import AgentAction, AgentType, ActionStatus
from app.agents.sentinel import SentinelAgent
from app.agents.analyzer import AnalyzerAgent
from app.agents.validator import ValidatorAgent
from app.agents.reporter import ReporterAgent
from app.models.prompt import Severity

class AgentState(TypedDict):
    input_data: Dict[str, Any]
    sentinel_output: Dict[str, Any]
    analyzer_output: Dict[str, Any]
    validator_output: Dict[str, Any]
    reporter_output: Dict[str, Any]
    traces: List[Dict[str, Any]]
    status: str

async def log_agent_action(
    session: AsyncSession,
    agent_type: AgentType,
    action: str,
    input_data: dict,
    output_data: dict,
    status: ActionStatus,
    reasoning_trace: str,
    execution_time_ms: int,
    parent_action_id: uuid.UUID = None
) -> uuid.UUID:
    action_record = AgentAction(
        agent_type=agent_type,
        action=action,
        input_data=input_data,
        output_data=output_data,
        status=status,
        reasoning_trace=reasoning_trace,
        execution_time_ms=execution_time_ms,
        parent_action_id=parent_action_id
    )
    session.add(action_record)
    await session.commit()
    await session.refresh(action_record)
    return action_record.id

async def run_swarm(
    content: str,
    analysis_type: str = "comprehensive",
    session: AsyncSession = None
) -> Dict[str, Any]:
    """
    Executes the 4-agent security swarm sequentially and stores traces in DB.
    """
    state: AgentState = {
        "input_data": {"content": content, "analysis_type": analysis_type},
        "sentinel_output": {},
        "analyzer_output": {},
        "validator_output": {},
        "reporter_output": {},
        "traces": [],
        "status": "pending"
    }

    parent_id = None

    # 1. Sentinel Agent Node
    sentinel = SentinelAgent()
    sentinel_in = state["input_data"]
    sentinel_res = sentinel.run(sentinel_in)
    state["sentinel_output"] = sentinel_res
    
    if session:
        parent_id = await log_agent_action(
            session=session,
            agent_type=AgentType.SENTINEL,
            action="input_classification",
            input_data=sentinel_in,
            output_data=sentinel_res,
            status=ActionStatus.COMPLETED,
            reasoning_trace=sentinel_res.get("reasoning", ""),
            execution_time_ms=sentinel_res.get("duration_ms", 0)
        )
        state["traces"].append({
            "agent_type": AgentType.SENTINEL,
            "action": "input_classification",
            "reasoning": sentinel_res.get("reasoning", ""),
            "result": sentinel_res,
            "duration_ms": sentinel_res.get("duration_ms", 0)
        })

    # 2. Analyzer Agent Node
    analyzer = AnalyzerAgent()
    analyzer_res = analyzer.run(state["input_data"], state["sentinel_output"])
    state["analyzer_output"] = analyzer_res
    
    if session:
        await log_agent_action(
            session=session,
            agent_type=AgentType.ANALYZER,
            action="deep_leakage_and_url_audit",
            input_data={"content": content, "urls": state["sentinel_output"].get("urls_found", [])},
            output_data=analyzer_res,
            status=ActionStatus.COMPLETED,
            reasoning_trace=analyzer_res.get("reasoning", ""),
            execution_time_ms=analyzer_res.get("duration_ms", 0),
            parent_action_id=parent_id
        )
        state["traces"].append({
            "agent_type": AgentType.ANALYZER,
            "action": "deep_leakage_and_url_audit",
            "reasoning": analyzer_res.get("reasoning", ""),
            "result": analyzer_res,
            "duration_ms": analyzer_res.get("duration_ms", 0)
        })

    # 3. Validator Agent Node
    validator = ValidatorAgent()
    validator_res = validator.run(state["sentinel_output"], state["analyzer_output"])
    state["validator_output"] = validator_res
    
    if session:
        await log_agent_action(
            session=session,
            agent_type=AgentType.VALIDATOR,
            action="cross_verification_and_weighing",
            input_data={"sentinel": state["sentinel_output"], "analyzer": state["analyzer_output"]},
            output_data=validator_res,
            status=ActionStatus.COMPLETED,
            reasoning_trace=validator_res.get("reasoning", ""),
            execution_time_ms=validator_res.get("duration_ms", 0),
            parent_action_id=parent_id
        )
        state["traces"].append({
            "agent_type": AgentType.VALIDATOR,
            "action": "cross_verification_and_weighing",
            "reasoning": validator_res.get("reasoning", ""),
            "result": validator_res,
            "duration_ms": validator_res.get("duration_ms", 0)
        })

    # 4. Reporter Agent Node
    reporter = ReporterAgent()
    reporter_res = reporter.run(state["sentinel_output"], state["analyzer_output"], state["validator_output"])
    state["reporter_output"] = reporter_res
    
    if session:
        await log_agent_action(
            session=session,
            agent_type=AgentType.REPORTER,
            action="structured_report_compilation",
            input_data={
                "sentinel": state["sentinel_output"],
                "analyzer": state["analyzer_output"],
                "validator": state["validator_output"]
            },
            output_data=reporter_res,
            status=ActionStatus.COMPLETED,
            reasoning_trace=reporter_res.get("reasoning", ""),
            execution_time_ms=reporter_res.get("duration_ms", 0),
            parent_action_id=parent_id
        )
        state["traces"].append({
            "agent_type": AgentType.REPORTER,
            "action": "structured_report_compilation",
            "reasoning": reporter_res.get("reasoning", ""),
            "result": reporter_res,
            "duration_ms": reporter_res.get("duration_ms", 0)
        })

    state["status"] = "completed"

    return {
        "id": parent_id or uuid.uuid4(),
        "status": state["status"],
        "threat_score": state["validator_output"].get("final_threat_score", 0),
        "severity": state["validator_output"].get("severity", Severity.LOW),
        "traces": state["traces"],
        "final_report": state["reporter_output"].get("final_report_markdown", ""),
        "created_at": datetime.now(timezone.utc)
    }
