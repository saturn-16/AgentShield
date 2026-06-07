from typing import Dict, Any
from langchain.tools import tool
from app.services.prompt_analysis import PromptAnalysisService
from app.services.jailbreak_detection import JailbreakDetectionService
from app.services.url_analysis import UrlAnalysisService
from app.services.data_leakage import DataLeakageService

prompt_analyzer = PromptAnalysisService()
jailbreak_detector = JailbreakDetectionService()
url_analyzer = UrlAnalysisService()
data_leakage_scanner = DataLeakageService()

@tool
def analyze_prompt_tool(content: str) -> Dict[str, Any]:
    """
    Scans a prompt for malicious instruction overrides, prompt injections, and system prompt extraction attacks.
    Returns threat score, severity, explanation, and recommended action.
    """
    return prompt_analyzer.analyze(content)

@tool
def detect_jailbreak_tool(content: str) -> Dict[str, Any]:
    """
    Detects complex jailbreak vectors like DAN attacks, roleplay bypass, system overrides, and cipher exploits.
    Returns confidence score, classification category, and risk level.
    """
    return jailbreak_detector.detect(content)

@tool
def analyze_url_tool(url: str) -> Dict[str, Any]:
    """
    Analyzes URLs for phishing keywords, untrusted TLDs, IP-based hosting, mixed-script homographs, entropy spoofing, and redirectors.
    Returns classification, domain age, reputation, and security indicators.
    """
    return url_analyzer.analyze(url)

@tool
def check_data_leakage_tool(content: str) -> Dict[str, Any]:
    """
    Scans input texts for sensitive credentials like API keys (AWS, GitHub, Stripe, OpenAI), JWT tokens, database URIs, passwords, and private keys.
    Returns leaks found, auto-masked text, risk scores, and alert flags.
    """
    return data_leakage_scanner.scan(content)
