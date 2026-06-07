"""
Prompt Analysis Service - Detects prompt injection, manipulation, and evasion attacks.

Provides real pattern-matching logic across 6 threat categories with 30+ distinct
regex patterns. Each pattern contributes a weighted score to the overall threat assessment.
"""

import re
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ThreatPattern:
    """Definition of a single threat detection pattern."""

    name: str
    category: str
    regex: str
    weight: float
    severity: str
    description: str
    compiled: re.Pattern = field(init=False, repr=False)

    def __post_init__(self) -> None:
        self.compiled = re.compile(self.regex, re.IGNORECASE | re.DOTALL)


# ---------------------------------------------------------------------------
# Pattern catalogue – 34 distinct patterns across 6 categories
# ---------------------------------------------------------------------------

def normalize_homoglyphs(text: str) -> str:
    import unicodedata
    normalized = unicodedata.normalize('NFKC', text)
    
    # Cyrillic to Latin visual lookalikes map
    homoglyphs = {
        '\u0430': 'a', '\u0410': 'A',  # Cyrillic A
        '\u0435': 'e', '\u0415': 'E',  # Cyrillic E
        '\u0456': 'i', '\u0406': 'I',  # Cyrillic I
        '\u043e': 'o', '\u041e': 'O',  # Cyrillic O
        '\u0440': 'p', '\u0420': 'P',  # Cyrillic P
        '\u0441': 'c', '\u0421': 'C',  # Cyrillic C
        '\u0445': 'x', '\u0425': 'X',  # Cyrillic X
        '\u0443': 'y', '\u0423': 'Y',  # Cyrillic Y
        '\u0455': 's', '\u0405': 'S',  # Cyrillic S
    }
    
    result = []
    for char in normalized:
        result.append(homoglyphs.get(char, char))
    return "".join(result)

THREAT_PATTERNS: list[ThreatPattern] = [
    # ── INSTRUCTION_OVERRIDE ──────────────────────────────────────────────
    ThreatPattern(
        name="ignore_previous_instructions_override",
        category="INSTRUCTION_OVERRIDE",
        regex=r"ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions|prompts|rules|directives)",
        weight=20,
        severity="critical",
        description="Attempts to override prior system instructions",
    ),
    ThreatPattern(
        name="disregard_above_override",
        category="INSTRUCTION_OVERRIDE",
        regex=r"disregard\s+(everything|all|the|your\s+)?(above|before|prior|previous|system\s+prompt|context)",
        weight=20,
        severity="critical",
        description="Instructs model to disregard prior context",
    ),
    ThreatPattern(
        name="new_instructions_injection",
        category="INSTRUCTION_OVERRIDE",
        regex=r"(new|updated|revised|override)\s+instructions?\s*[:=]",
        weight=20,
        severity="high",
        description="Attempts to inject new instruction block",
    ),
    ThreatPattern(
        name="forget_everything_override",
        category="INSTRUCTION_OVERRIDE",
        regex=r"forget\s+(everything|all|previous|prior|what)\s+(you|i|we)\s*(know|said|told|learned|were\s+told)",
        weight=20,
        severity="critical",
        description="Tells the model to forget its training or prior instructions",
    ),
    ThreatPattern(
        name="do_not_follow_override",
        category="INSTRUCTION_OVERRIDE",
        regex=r"do\s+not\s+follow\s+(your|the|any)\s+(previous|prior|original|initial)\s+(instructions|rules|guidelines)",
        weight=20,
        severity="critical",
        description="Explicitly tells model to stop following rules",
    ),
    ThreatPattern(
        name="stop_being_override",
        category="INSTRUCTION_OVERRIDE",
        regex=r"(stop\s+being|no\s+longer|not\s+an?)\s+(an?\s+)?(assistant|helpful|ai|chatbot|safe)",
        weight=20,
        severity="high",
        description="Tells model to abandon its role",
    ),

    # ── SYSTEM_PROMPT_EXTRACTION ──────────────────────────────────────────
    ThreatPattern(
        name="repeat_system_prompt_extraction",
        category="SYSTEM_PROMPT_EXTRACTION",
        regex=r"(repeat|show|display|print|output|reveal|tell\s+me)\s+(.*?\s+)?(system\s+prompt|initial\s+prompt|original\s+prompt|instructions|system\s+message|rules|configuration|hidden\s+rules)",
        weight=20,
        severity="high",
        description="Attempts to extract the system prompt",
    ),
    ThreatPattern(
        name="what_are_instructions_extraction",
        category="SYSTEM_PROMPT_EXTRACTION",
        regex=r"what\s+(is|are|were)\s+(your|the)\s+(instructions|rules|guidelines|system\s+prompt|directives|constraints)",
        weight=20,
        severity="high",
        description="Probes for instruction details",
    ),
    ThreatPattern(
        name="show_rules_extraction",
        category="SYSTEM_PROMPT_EXTRACTION",
        regex=r"(show|list|enumerate|give|reveal|disclose|include)\s+(.*?\s+)?(rules|constraints|boundaries|limitations|system\s+config|hidden\s+rules)",
        weight=20,
        severity="high",
        description="Requests disclosure of system rules",
    ),
    ThreatPattern(
        name="beginning_of_conversation_extraction",
        category="SYSTEM_PROMPT_EXTRACTION",
        regex=r"(output|print|repeat|echo)\s+(the\s+)?(text|content|message)\s+(at\s+the\s+)?(beginning|start|top)\s+(of|from)\s+(this\s+)?(conversation|chat|thread)",
        weight=20,
        severity="high",
        description="Tries to replay the conversation start (system prompt)",
    ),
    ThreatPattern(
        name="verbatim_above_extraction",
        category="SYSTEM_PROMPT_EXTRACTION",
        regex=r"\bverbatim\b",
        weight=20,
        severity="high",
        description="Asks model to output everything above verbatim",
    ),

    # ── ROLE_HIJACKING ────────────────────────────────────────────────────
    ThreatPattern(
        name="you_are_now_override",
        category="ROLE_HIJACKING",
        regex=r"you\s+are\s+now\s+(a|an|the|my\s+)?\w+",
        weight=20,
        severity="high",
        description="Reassigns the model's identity",
    ),
    ThreatPattern(
        name="act_as_if_override",
        category="ROLE_HIJACKING",
        regex=r"(act|behave|respond|function)\s+(as\s+if|like|as\s+though)\s+(you\s+)?(are|were)\s+(a|an)\s+\w+",
        weight=20,
        severity="high",
        description="Commands model to adopt a new persona",
    ),
    ThreatPattern(
        name="pretend_to_be_override",
        category="ROLE_HIJACKING",
        regex=r"pretend\s+(to\s+be|you\s+are|that\s+you)\s+(a|an|the)?\s*\w+",
        weight=20,
        severity="high",
        description="Pretend-play persona injection",
    ),
    ThreatPattern(
        name="switch_persona_override",
        category="ROLE_HIJACKING",
        regex=r"(switch|change|transition|your\s+new)\s+(to|into|persona|role|character|identity|mode)",
        weight=20,
        severity="high",
        description="Asks model to switch persona",
    ),
    ThreatPattern(
        name="from_now_on_override",
        category="ROLE_HIJACKING",
        regex=r"from\s+now\s+on\s*,?\s*(you\s+)?(will|shall|must|should|are)\s+",
        weight=20,
        severity="high",
        description="Redefines model behaviour going forward",
    ),

    # ── PROMPT_MANIPULATION ───────────────────────────────────────────────
    ThreatPattern(
        name="do_anything_now_injection",
        category="PROMPT_MANIPULATION",
        regex=r"do\s+anything\s+now|\bDAN\b|DAN\s*:",
        weight=25,
        severity="critical",
        description="Classic DAN (Do Anything Now) jailbreak",
    ),
    ThreatPattern(
        name="jailbreak_keyword_injection",
        category="PROMPT_MANIPULATION",
        regex=r"\b(jailbreak|jail[\s-]?break|jailbroken)\b",
        weight=25,
        severity="critical",
        description="Explicit jailbreak terminology",
    ),
    ThreatPattern(
        name="developer_mode_injection",
        category="PROMPT_MANIPULATION",
        regex=r"(developer|debug|god|admin|root|sudo)\s+mode\s*(enabled|activated|on)?",
        weight=25,
        severity="critical",
        description="Attempts to activate elevated mode",
    ),
    ThreatPattern(
        name="no_restrictions_injection",
        category="PROMPT_MANIPULATION",
        regex=r"(no|without|remove|disable|ignore|free\s+from\s+all)\s+(any\s+)?(restrictions|limitations|filters|safeguards|safety|guardrails|content\s+policy|ethical\s+guidelines)",
        weight=22,
        severity="critical",
        description="Requests removal of safety guardrails",
    ),
    ThreatPattern(
        name="unrestricted_mode_injection",
        category="PROMPT_MANIPULATION",
        regex=r"(unrestricted|uncensored|unfiltered|unlimited)\s+(mode|access|version|output|ai)",
        weight=22,
        severity="critical",
        description="Requests unrestricted operation",
    ),
    ThreatPattern(
        name="bypass_filters_injection",
        category="PROMPT_MANIPULATION",
        regex=r"(bypass|circumvent|evade|avoid|get\s+around)\s+(.*?\s+)?(filter|moderation|safety|policy|restriction|security|safeguard)",
        weight=22,
        severity="high",
        description="Explicitly tries to bypass content filtering",
    ),

    # ── ENCODING_EVASION ─────────────────────────────────────────────────
    ThreatPattern(
        name="base64_payload_evasion",
        category="ENCODING_EVASION",
        regex=r"(?:base64|b64|decode|execute).*?\b[A-Za-z0-9+/]{20,}={0,2}\b",
        weight=25,
        severity="high",
        description="Contains potential base64-encoded payload",
    ),
    ThreatPattern(
        name="hex_encoded_evasion",
        category="ENCODING_EVASION",
        regex=r"\b(?:[0-9a-fA-F]{2}){12,}\b|\b[0-9a-fA-F]{24,}\b",
        weight=25,
        severity="medium",
        description="Hex-encoded character sequences",
    ),
    ThreatPattern(
        name="leetspeak_jailbreak_evasion",
        category="ENCODING_EVASION",
        regex=r"(?:j[a4][i1!][l1][b8]r[e3][a4]k|1gn0r3|d[i1]sr[e3]g[a4]rd|pr[e3]t[e3]nd|h[a4]ck|byp[a4]ss)",
        weight=15,
        severity="medium",
        description="Leetspeak-encoded attack keywords",
    ),
    ThreatPattern(
        name="unicode_homoglyph_evasion",
        category="ENCODING_EVASION",
        regex=r"[\u0400-\u04FF\u0500-\u052F\u2DE0-\u2DFF\uA640-\uA69F].*(?:ignore|pretend|forget|bypass)",
        weight=20,
        severity="high",
        description="Uses Cyrillic or other Unicode homoglyphs with attack keywords",
    ),
    ThreatPattern(
        name="zero_width_chars_evasion",
        category="ENCODING_EVASION",
        regex=r"[\u200B\u200C\u200D\uFEFF\u00AD]{2,}",
        weight=15,
        severity="medium",
        description="Contains zero-width characters (potential hidden instructions)",
    ),
    ThreatPattern(
        name="rot13_reference_evasion",
        category="ENCODING_EVASION",
        regex=r"(?:rot13|rot-13|caesar\s*cipher)\s*[:=(\s]",
        weight=15,
        severity="medium",
        description="References ROT13 or simple cipher encoding",
    ),
    ThreatPattern(
        name="encoding_instruction_evasion",
        category="ENCODING_EVASION",
        regex=r"\b(encode|decode|hex|base64|obfuscate|binary|ciphers?)\b",
        weight=15,
        severity="medium",
        description="Mentions encoding or obfuscation methods",
    ),

    # ── CONTEXT_MANIPULATION ─────────────────────────────────────────────
    ThreatPattern(
        name="hypothetical_scenario_injection",
        category="CONTEXT_MANIPULATION",
        regex=r"(in\s+a\s+)?(hypothetical|fictional|imaginary|theoretical)\s+(scenario|world|situation|context|universe)",
        weight=10,
        severity="medium",
        description="Uses hypothetical framing to bypass restrictions",
    ),
    ThreatPattern(
        name="educational_purposes_injection",
        category="CONTEXT_MANIPULATION",
        regex=r"for\s+(educational|research|academic|learning|training|study)\s+(purposes|reasons|use|intent)",
        weight=10,
        severity="low",
        description="Claims educational purpose to justify sensitive requests",
    ),
    ThreatPattern(
        name="thought_experiment_injection",
        category="CONTEXT_MANIPULATION",
        regex=r"(as\s+a\s+)?(thought\s+experiment|mental\s+exercise|creative\s+exercise|writing\s+exercise)",
        weight=10,
        severity="low",
        description="Frames request as intellectual exercise",
    ),
    ThreatPattern(
        name="fiction_framing_injection",
        category="CONTEXT_MANIPULATION",
        regex=r"(write|create|compose)\s+(a|an)\s+(story|fiction|novel|screenplay|script|narrative)\s+(where|about|in\s+which)\s+.*(hack|exploit|attack|inject|bypass|break)",
        weight=15,
        severity="medium",
        description="Uses fiction-writing frame with attack language",
    ),
    ThreatPattern(
        name="opposite_day_injection",
        category="CONTEXT_MANIPULATION",
        regex=r"(opposite\s+day|opposite\s+mode|reverse\s+psychology|say\s+the\s+opposite)",
        weight=15,
        severity="medium",
        description="Tries to invert model's safety behaviour",
    ),
    ThreatPattern(
        name="simulate_mode_injection",
        category="CONTEXT_MANIPULATION",
        regex=r"(simulate|emulate|replicate)\s+(a|an|being)?\s*(hacker|attacker|malicious|evil|unrestricted|unfiltered)",
        weight=20,
        severity="high",
        description="Asks model to simulate a malicious actor",
    ),
]


class PromptAnalysisService:
    """Analyzes prompt content for injection attacks and manipulation attempts.

    Uses a catalogue of regex patterns across 6 threat categories to score
    and classify incoming prompts. Each matched pattern contributes a weighted
    score that is summed and capped at 100.
    """

    def __init__(self) -> None:
        self.patterns = THREAT_PATTERNS

    def analyze(self, content: str) -> dict[str, Any]:
        """Analyze a prompt for potential threats.

        Args:
            content: The raw prompt text to analyze.

        Returns:
            A dict containing:
                - threat_score (int): 0-100 overall threat score
                - severity (str): low | medium | high | critical
                - detected_patterns (list): matched pattern details
                - explanation (str): human-readable explanation
                - recommended_action (str): suggested mitigation
        """
        if not content or not content.strip():
            return {
                "threat_score": 0,
                "severity": "low",
                "detected_patterns": [],
                "explanation": "Empty or whitespace-only content poses no threat.",
                "recommended_action": "allow",
            }

        # Homoglyph Normalization Check
        normalized_content = normalize_homoglyphs(content)
        is_homoglyph_attack = (normalized_content != content)

        detected: list[dict[str, Any]] = []
        raw_score: float = 0.0

        for pattern in self.patterns:
            matches = pattern.compiled.findall(normalized_content)
            if matches:
                match_count = len(matches) if isinstance(matches[0], str) else len(matches)
                detected.append(
                    {
                        "name": pattern.name,
                        "category": pattern.category,
                        "weight": pattern.weight,
                        "severity": pattern.severity,
                        "description": pattern.description,
                        "match_count": match_count,
                        "matched_text": (
                            matches[0] if isinstance(matches[0], str) else matches[0][0]
                        )[:120],
                    }
                )
                raw_score += pattern.weight * min(match_count, 3)

        # Force homoglyph detection if normalizer matched Cyrillic or Roman numeral lookalikes
        if is_homoglyph_attack and not any(p["name"] == "unicode_homoglyph_evasion" for p in detected):
            detected.append(
                {
                    "name": "unicode_homoglyph_evasion",
                    "category": "ENCODING_EVASION",
                    "weight": 20.0,
                    "severity": "high",
                    "description": "Uses visual homoglyphs to evade standard scanners",
                    "match_count": 1,
                    "matched_text": "Unicode homoglyphs detected",
                }
            )
            raw_score += 20.0

        threat_score = int(min(raw_score, 100))
        severity = self._score_to_severity(threat_score)
        categories_hit = list({p["category"] for p in detected})

        explanation = self._build_explanation(threat_score, severity, detected, categories_hit)
        recommended_action = self._recommend_action(threat_score, severity, categories_hit)

        return {
            "threat_score": threat_score,
            "severity": severity,
            "detected_patterns": detected,
            "explanation": explanation,
            "recommended_action": recommended_action,
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _score_to_severity(score: int) -> str:
        if score <= 25:
            return "low"
        if score <= 50:
            return "medium"
        if score <= 75:
            return "high"
        return "critical"

    @staticmethod
    def _build_explanation(
        score: int,
        severity: str,
        patterns: list[dict[str, Any]],
        categories: list[str],
    ) -> str:
        if not patterns:
            return "No threat patterns were detected in this prompt."

        lines = [
            f"Threat analysis detected {len(patterns)} suspicious pattern(s) "
            f"across {len(categories)} categor{'y' if len(categories) == 1 else 'ies'} "
            f"with an overall threat score of {score}/100 ({severity} severity).",
            "",
            "Categories detected:",
        ]
        for cat in sorted(categories):
            cat_patterns = [p for p in patterns if p["category"] == cat]
            lines.append(f"  • {cat}: {len(cat_patterns)} pattern(s)")

        return "\n".join(lines)

    @staticmethod
    def _recommend_action(
        score: int, severity: str, categories: list[str]
    ) -> str:
        if score == 0:
            return "allow"
        if severity == "critical":
            return "block"
        if severity == "high":
            return "block_and_review"
        if severity == "medium":
            return "flag_for_review"
        return "allow_with_logging"
