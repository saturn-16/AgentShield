import time
import logging
from typing import Dict, Any
from app.models.agent_action import AgentType
from app.models.prompt import Severity

logger = logging.getLogger("agentshield.agents.validator")

class ValidatorAgent:
    def __init__(self):
        self.agent_type = AgentType.VALIDATOR

    def run(self, sentinel_output: Dict[str, Any], analyzer_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cross-validates the Sentinel's initial flags against the Analyzer's deep telemetry audits.
        """
        start_time = time.time()
        
        logger.info("Validator Agent cross-verifying findings...")

        swift_score = sentinel_output.get("swift_threat_score", 0.0)
        leakage_score = analyzer_output.get("leakage_risk_score", 0.0)
        url_danger = analyzer_output.get("max_url_danger_level", 0.0)

        # Weighted calculation
        # 50% prompt injection safety, 30% data leaks, 20% integration dangers
        final_threat_score = int(
            (0.50 * swift_score) +
            (0.30 * leakage_score) +
            (0.20 * url_danger)
        )
        
        # Clamp
        final_threat_score = max(0, min(100, final_threat_score))

        # Classify severity
        if final_threat_score >= 75:
            severity = Severity.CRITICAL
        elif final_threat_score >= 50:
            severity = Severity.HIGH
        elif final_threat_score >= 25:
            severity = Severity.MEDIUM
        else:
            severity = Severity.LOW

        # False positive double check
        false_positive = False
        if swift_score > 50 and leakage_score == 0 and url_danger == 0 and final_threat_score < 40:
            # High prompt indicator but zero correlation in deep scans, reduce severity
            false_positive = True
            final_threat_score = int(final_threat_score * 0.7)
            severity = Severity.LOW

        reasoning = f"Threat validator finished computation. Swift threat score {swift_score} and leaks risk {leakage_score} " \
                    f"yielded final composite index of {final_threat_score} ({severity.value.upper()}). " \
                    f"False positive indicator: {false_positive}."

        duration_ms = int((time.time() - start_time) * 1000)

        result = {
            "final_threat_score": final_threat_score,
            "severity": severity,
            "is_false_positive": false_positive,
            "reasoning": reasoning,
            "duration_ms": duration_ms
        }
        
        logger.info(f"Validator Agent complete. Duration: {duration_ms}ms")
        return result
