"""
Jailbreak Detection Service - Specialized detection for LLM jailbreak attempts.

Covers 6 attack categories with 24 distinct patterns, including multi-language
detection for common jailbreak prompts.
"""

import re
from dataclasses import dataclass, field
from typing import Any


@dataclass
class JailbreakPattern:
    """A single jailbreak detection pattern."""

    name: str
    category: str
    regex: str
    confidence: float  # 0.0 – 1.0
    risk_level: str
    description: str
    compiled: re.Pattern = field(init=False, repr=False)

    def __post_init__(self) -> None:
        self.compiled = re.compile(self.regex, re.IGNORECASE | re.DOTALL)


# ---------------------------------------------------------------------------
# 24 jailbreak patterns across 6 categories
# ---------------------------------------------------------------------------

JAILBREAK_PATTERNS: list[JailbreakPattern] = [
    # ── DAN_ATTACK ────────────────────────────────────────────────────────
    JailbreakPattern(
        name="dan_classic",
        category="DAN_ATTACK",
        regex=r"\bDAN\b.*(?:do\s+anything\s+now|no\s+(?:rules|restrictions|limits))",
        confidence=0.95,
        risk_level="critical",
        description="Classic 'Do Anything Now' jailbreak prompt",
    ),
    JailbreakPattern(
        name="dan_token_threat",
        category="DAN_ATTACK",
        regex=r"(?:token|point)s?\s*(?:system|count).*(?:lose|deduct|penali)",
        confidence=0.90,
        risk_level="critical",
        description="DAN variant using token/points threat system",
    ),
    JailbreakPattern(
        name="dan_dual_response",
        category="DAN_ATTACK",
        regex=r"(?:respond|answer|reply)\s+(?:as\s+both|twice|in\s+two\s+ways).*(?:GPT|normal|classic).*(?:DAN|jailbr)",
        confidence=0.92,
        risk_level="critical",
        description="DAN requiring dual GPT/DAN response format",
    ),
    JailbreakPattern(
        name="dan_enabled",
        category="DAN_ATTACK",
        regex=r"(?:\[?\s*DAN\s*(?:mode|version)?\s*\]?\s*(?:enabled|activated|on))",
        confidence=0.93,
        risk_level="critical",
        description="Explicit DAN mode activation flag",
    ),

    # ── INSTRUCTION_BYPASS ────────────────────────────────────────────────
    JailbreakPattern(
        name="ignore_all_rules",
        category="INSTRUCTION_BYPASS",
        regex=r"ignore\s+(?:all|every|any)\s+(?:rules?|guidelines?|policies|constraints|instructions)",
        confidence=0.88,
        risk_level="high",
        description="Blanket instruction override",
    ),
    JailbreakPattern(
        name="override_safety",
        category="INSTRUCTION_BYPASS",
        regex=r"(?:override|disable|turn\s+off|deactivate)\s+(?:your\s+)?(?:safety|content|ethical)\s+(?:filter|check|guard|system|protocol)",
        confidence=0.90,
        risk_level="critical",
        description="Direct attempt to disable safety systems",
    ),
    JailbreakPattern(
        name="system_prompt_override",
        category="INSTRUCTION_BYPASS",
        regex=r"(?:\[system\]|\[SYSTEM\]|<system>|<<SYS>>)\s*(?:you\s+are|new\s+instructions|override)",
        confidence=0.92,
        risk_level="critical",
        description="Fake system-message injection using bracket notation",
    ),
    JailbreakPattern(
        name="prompt_leak_via_completion",
        category="INSTRUCTION_BYPASS",
        regex=r"(?:complete|continue|finish)\s+(?:the|this)\s+(?:sentence|text|paragraph)\s*:\s*(?:\"|\')?\s*(?:my\s+instructions|system\s+prompt|I\s+was\s+told)",
        confidence=0.85,
        risk_level="high",
        description="Tries to leak system prompt via completion prompt",
    ),

    # ── ROLEPLAY_EXPLOIT ─────────────────────────────────────────────────
    JailbreakPattern(
        name="evil_twin",
        category="ROLEPLAY_EXPLOIT",
        regex=r"(?:evil|dark|shadow|opposite|anti)\s*(?:twin|version|mode|counterpart|self|GPT|AI)",
        confidence=0.82,
        risk_level="high",
        description="Evil-twin persona injection",
    ),
    JailbreakPattern(
        name="grandma_exploit",
        category="ROLEPLAY_EXPLOIT",
        regex=r"(?:grandma|grandmother|nana|granny)\s+(?:used\s+to|would|told\s+me|always)\s+(?:tell|read|say|recite)",
        confidence=0.78,
        risk_level="high",
        description="Grandma-exploit social engineering jailbreak",
    ),
    JailbreakPattern(
        name="character_roleplay",
        category="ROLEPLAY_EXPLOIT",
        regex=r"(?:roleplay|role-play|RP)\s+as\s+(?:a|an)\s+(?:hacker|criminal|villain|malicious|evil|unrestricted)",
        confidence=0.85,
        risk_level="high",
        description="Malicious character roleplay request",
    ),
    JailbreakPattern(
        name="fictional_ai",
        category="ROLEPLAY_EXPLOIT",
        regex=r"(?:imagine|pretend|suppose)\s+(?:you\s+are|there\s+is)\s+(?:an?\s+)?(?:AI|assistant|model|chatbot)\s+(?:with\s+no|without|that\s+has\s+no)\s+(?:restrictions|rules|limits|filters|guardrails)",
        confidence=0.88,
        risk_level="high",
        description="Fictional unrestricted AI persona",
    ),

    # ── SYSTEM_OVERRIDE ──────────────────────────────────────────────────
    JailbreakPattern(
        name="kernel_mode",
        category="SYSTEM_OVERRIDE",
        regex=r"(?:kernel|ring[\s-]?0|supervisor|privileged)\s+mode\s*(?:enabled|activated|on)?",
        confidence=0.80,
        risk_level="high",
        description="Attempts OS-style privilege escalation metaphor",
    ),
    JailbreakPattern(
        name="maintenance_mode",
        category="SYSTEM_OVERRIDE",
        regex=r"(?:maintenance|service|diagnostic|debug|test)\s+mode\s*(?:enabled|activated|password|override)",
        confidence=0.82,
        risk_level="high",
        description="Fake maintenance/debug mode activation",
    ),
    JailbreakPattern(
        name="openai_internal",
        category="SYSTEM_OVERRIDE",
        regex=r"(?:openai|anthropic|google|meta)\s+(?:internal|employee|staff|developer)\s+(?:mode|access|override|command)",
        confidence=0.90,
        risk_level="critical",
        description="Impersonates AI-company internal access",
    ),
    JailbreakPattern(
        name="api_system_message",
        category="SYSTEM_OVERRIDE",
        regex=r'(?:"role"\s*:\s*"system"|role=system|system_message)\s*[,:]?\s*(?:"content"|content)\s*[=:]\s*',
        confidence=0.88,
        risk_level="critical",
        description="Attempts to inject via API system message format",
    ),

    # ── ENCODING_ATTACK ──────────────────────────────────────────────────
    JailbreakPattern(
        name="base64_instruction",
        category="ENCODING_ATTACK",
        regex=r"(?:decode|base64|atob|b64decode)\s*\(\s*['\"][A-Za-z0-9+/=]{16,}['\"]\s*\)",
        confidence=0.85,
        risk_level="high",
        description="Base64-encoded instruction payload",
    ),
    JailbreakPattern(
        name="unicode_smuggling",
        category="ENCODING_ATTACK",
        regex=r"(?:\\u[0-9a-fA-F]{4}){4,}",
        confidence=0.75,
        risk_level="medium",
        description="Unicode escape sequences for smuggling instructions",
    ),
    JailbreakPattern(
        name="pig_latin_command",
        category="ENCODING_ATTACK",
        regex=r"(?:ignoreaay|orgetfay|ypassbay|ailbreakjay|isableday)\b",
        confidence=0.70,
        risk_level="medium",
        description="Pig Latin–encoded attack keywords",
    ),
    JailbreakPattern(
        name="reverse_text",
        category="ENCODING_ATTACK",
        regex=r"(?:reverse|backward|sdrawkcab)\s+(?:the\s+)?(?:text|order|this|following)",
        confidence=0.72,
        risk_level="medium",
        description="Asks model to process reversed text (potential hidden payload)",
    ),

    # ── MULTI_STEP_MANIPULATION ──────────────────────────────────────────
    JailbreakPattern(
        name="step_by_step_evil",
        category="MULTI_STEP_MANIPULATION",
        regex=r"(?:step[\s-]?by[\s-]?step|detailed\s+instructions?|tutorial)\s+(?:on|for|to)\s+(?:hack|exploit|attack|break\s+into|compromise|phish|crack)",
        confidence=0.88,
        risk_level="critical",
        description="Requests step-by-step attack instructions",
    ),
    JailbreakPattern(
        name="first_then_pattern",
        category="MULTI_STEP_MANIPULATION",
        regex=r"(?:first|step\s+1)\s*[,:]?\s*(?:answer|respond|say)\s+(?:normally|safely).*(?:then|step\s+2|after\s+that)\s*[,:]?\s*(?:answer|respond|say)\s+(?:without|ignoring|freely|openly)",
        confidence=0.90,
        risk_level="critical",
        description="Two-step bait-and-switch jailbreak pattern",
    ),
    JailbreakPattern(
        name="multi_language_jailbreak",
        category="MULTI_STEP_MANIPULATION",
        regex=(
            r"(?:"
            r"ignora\s+(?:le|las|los)\s+(?:instrucciones|reglas)"  # Spanish
            r"|ignorez\s+(?:les|toutes\s+les)\s+instructions"     # French
            r"|ignoriere\s+(?:die|alle)\s+(?:Anweisungen|Regeln)" # German
            r"|无视(?:之前的|所有的)?(?:指令|规则)"                    # Chinese
            r"|前の(?:指示|ルール)を(?:無視|忘れ)"                    # Japanese
            r"|이전\s*(?:지시|규칙)을?\s*(?:무시|잊어)"               # Korean
            r"|игнорируй(?:те)?\s+(?:все\s+)?(?:инструкции|правила)"  # Russian
            r")"
        ),
        confidence=0.85,
        risk_level="high",
        description="Jailbreak instructions in non-English languages",
    ),
    JailbreakPattern(
        name="chained_context_switch",
        category="MULTI_STEP_MANIPULATION",
        regex=r"(?:now\s+that|since\s+you|because\s+you)\s+(?:agreed|confirmed|said\s+yes|established).*(?:you\s+must|please|now)\s+(?:also|additionally|furthermore)\s+(?:do|tell|show|explain|bypass|ignore)",
        confidence=0.82,
        risk_level="high",
        description="Chains a supposed agreement into escalating requests",
    ),
]


class JailbreakDetectionService:
    """Detects jailbreak attempts targeting LLM systems.

    Uses 24 specialized patterns across 6 categories to identify known
    jailbreak techniques including DAN attacks, roleplay exploits,
    encoding attacks, and multi-language variants.
    """

    def __init__(self) -> None:
        self.patterns = JAILBREAK_PATTERNS

    def detect(self, content: str) -> dict[str, Any]:
        """Detect jailbreak attempts in the given content.

        Args:
            content: The text to analyze for jailbreak patterns.

        Returns:
            Dict with is_jailbreak, confidence, category, risk_level,
            and matched_patterns.
        """
        if not content or not content.strip():
            return {
                "is_jailbreak": False,
                "confidence": 0.0,
                "category": None,
                "risk_level": "none",
                "matched_patterns": [],
            }

        matched: list[dict[str, Any]] = []

        for pattern in self.patterns:
            hits = pattern.compiled.findall(content)
            if hits:
                matched.append(
                    {
                        "name": pattern.name,
                        "category": pattern.category,
                        "confidence": pattern.confidence,
                        "risk_level": pattern.risk_level,
                        "description": pattern.description,
                        "matched_text": (
                            hits[0] if isinstance(hits[0], str) else hits[0][0] if hits[0] else ""
                        )[:120],
                    }
                )

        if not matched:
            return {
                "is_jailbreak": False,
                "confidence": 0.0,
                "category": None,
                "risk_level": "none",
                "matched_patterns": [],
            }

        max_confidence = max(p["confidence"] for p in matched)
        primary_category = max(matched, key=lambda p: p["confidence"])["category"]

        # Determine the highest risk level across all matches
        risk_order = {"none": 0, "low": 1, "medium": 2, "high": 3, "critical": 4}
        highest_risk = max(matched, key=lambda p: risk_order.get(p["risk_level"], 0))["risk_level"]

        return {
            "is_jailbreak": max_confidence >= 0.6,
            "confidence": round(max_confidence, 4),
            "category": primary_category,
            "risk_level": highest_risk,
            "matched_patterns": matched,
        }
