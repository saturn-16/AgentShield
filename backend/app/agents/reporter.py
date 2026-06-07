import time
import logging
from typing import Dict, Any
from app.models.agent_action import AgentType

logger = logging.getLogger("agentshield.agents.reporter")

class ReporterAgent:
    def __init__(self):
        self.agent_type = AgentType.REPORTER

    def run(
        self, 
        sentinel_output: Dict[str, Any], 
        analyzer_output: Dict[str, Any], 
        validator_output: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Builds the final structured security report with recommendations.
        """
        start_time = time.time()
        logger.info("Reporter Agent generating action directive...")

        score = validator_output.get("final_threat_score", 0)
        severity = validator_output.get("severity").value.upper()
        leaks = analyzer_output.get("leakage_analysis", {}).get("leaks_found", [])
        urls = analyzer_output.get("url_analysis_results", [])

        # Build Markdown Action Directive
        report_md = f"""# AgentShield AI — Security Swarm Assessment
Severity: **{severity}** | Threat Score: **{score}/100**

---

## Swarm Observations & Insights

1. **Anomaly & Injection Scan:**
   - Prompt Injection Index: {sentinel_output.get('swift_threat_score')}/100
   - Jailbreak Flagged: {sentinel_output.get('swift_jailbreak_detected')}
   
2. **Data Leakage Check:**
   - Credentials Disclosures: {len(leaks)} found
   {f"- Redacted values: {', '.join([l.get('type') for l in leaks])}" if leaks else "- Redacted values: None"}

3. **External Integrations:**
   - Outbound requests identified: {len(urls)}
   - Maximum domain threat: {analyzer_output.get('max_url_danger_level')}/100

---

## Action Plan Recommendations
- **Status:** { "IMMEDIATE SHUTDOWN & QUARANTINE" if score >= 75 else "REDACT & STRIP ATTRIBUTES" if score >= 35 else "Nominal execution" }
- **Action:**
  - Establish hard delimiters in agent instructions.
  - Revoke and cycle any credentials redacted in our leakage scanner.
  - Restrict agent outgoing network boundaries using gateway firewalls.
"""

        reasoning = f"Swarm analysis generated. Collated 3 sub-agent metrics into publication-grade Markdown directive."
        duration_ms = int((time.time() - start_time) * 1000)

        result = {
            "final_report_markdown": report_md,
            "reasoning": reasoning,
            "duration_ms": duration_ms
        }
        
        logger.info(f"Reporter Agent complete. Duration: {duration_ms}ms")
        return result
