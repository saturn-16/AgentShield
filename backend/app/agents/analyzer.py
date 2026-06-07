import time
import logging
from typing import Dict, Any, List
from app.models.agent_action import AgentType
from app.agents.tools import analyze_url_tool, check_data_leakage_tool

logger = logging.getLogger("agentshield.agents.analyzer")

class AnalyzerAgent:
    def __init__(self):
        self.agent_type = AgentType.ANALYZER

    def run(self, input_data: Dict[str, Any], sentinel_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Deep analyzer execution step. Aggregates data leak detection and external domain safety audits.
        """
        start_time = time.time()
        content = input_data.get("content", "")
        urls = sentinel_output.get("urls_found", [])
        
        logger.info(f"Analyzer Agent deep audit. Scanning data leakages...")
        
        # 1. Scan for data leakage
        leakage_results = check_data_leakage_tool.invoke({"content": content})
        
        # 2. Analyze all URLs found
        url_results: List[Dict[str, Any]] = []
        for url in urls:
            url_res = analyze_url_tool.invoke({"url": url})
            url_results.append(url_res)
            
        logger.info(f"Analyzer scanned {len(url_results)} URLs. Collating findings...")

        # Calculate impact metrics
        leakage_score = leakage_results.get("risk_score", 0.0)
        highest_url_severity = 0.0
        for ur in url_results:
            rep = ur.get("reputation_score", 100.0)
            highest_url_severity = max(highest_url_severity, 100.0 - rep)

        reasoning = f"Data leak scan completed. Found {len(leakage_results.get('leaks_found', []))} active credentials leaks. " \
                    f"Risk score evaluated at {leakage_score}. Scanned {len(urls)} out-going endpoints, yielding max reputational penalty of {highest_url_severity}."

        duration_ms = int((time.time() - start_time) * 1000)

        result = {
            "leakage_analysis": leakage_results,
            "url_analysis_results": url_results,
            "leakage_risk_score": leakage_score,
            "max_url_danger_level": highest_url_severity,
            "reasoning": reasoning,
            "duration_ms": duration_ms
        }
        
        logger.info(f"Analyzer Agent complete. Duration: {duration_ms}ms")
        return result
