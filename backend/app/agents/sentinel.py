import time
import logging
from typing import Dict, Any
from app.models.agent_action import AgentType, ActionStatus
from app.agents.tools import analyze_prompt_tool, detect_jailbreak_tool

logger = logging.getLogger("agentshield.agents.sentinel")

class SentinelAgent:
    def __init__(self):
        self.agent_type = AgentType.SENTINEL

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes user raw input, determines if it contains a URL, prompt, or potential jailbreak.
        """
        start_time = time.time()
        content = input_data.get("content", "")
        
        logger.info(f"Sentinel Agent starting analysis of content (length: {len(content)})")
        
        # 1. Look for URLs
        url_pattern = r'https?://[^\s/$.?#].[^\s]*'
        import re
        urls_found = re.findall(url_pattern, content)
        
        # 2. Run swift initial scans
        prompt_analysis = analyze_prompt_tool.invoke({"content": content})
        jailbreak_analysis = detect_jailbreak_tool.invoke({"content": content})

        threat_score = prompt_analysis.get("threat_score", 0)
        is_jailbreak = jailbreak_analysis.get("is_jailbreak", False)
        
        # Route logic decision
        analysis_needed = "comprehensive"
        if len(urls_found) > 0:
            analysis_needed = "mixed_url_and_prompt"
        elif threat_score > 60 or is_jailbreak:
            analysis_needed = "critical_threat_investigation"
        else:
            analysis_needed = "standard_scan"

        reasoning = f"Input contains {len(urls_found)} URLs. Swift scanner yielded threat score of {threat_score}. " \
                    f"Jailbreak classification is {is_jailbreak}. Routing to Analyzer for deep {analysis_needed}."

        duration_ms = int((time.time() - start_time) * 1000)

        result = {
            "urls_found": urls_found,
            "swift_threat_score": threat_score,
            "swift_jailbreak_detected": is_jailbreak,
            "recommended_routing": analysis_needed,
            "reasoning": reasoning,
            "duration_ms": duration_ms
        }
        
        logger.info(f"Sentinel Agent complete. Duration: {duration_ms}ms")
        return result
