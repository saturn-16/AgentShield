Created At: 2026-06-02T15:27:58Z
Completed At: 2026-06-02T15:27:59Z
File Path: `file:///c:/Users/Gaurav%20Kumar/Desktop/microsoft%20hackathon/agentshield-ai/frontend/src/stores/scan.ts`
Total Lines: 146
Total Bytes: 6265
Showing lines 1 to 40
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
1: import { create } from "zustand";
2: import { PromptScanResult, UrlScanResult } from "@/types";
3: 
4: // ── Mock scan engine ─────────────────────────────────────────────────────────
5: const PROMPT_PATTERNS = [
6:   { pattern_name: "Prompt Override Attempt", matched_text: "ignore previous instructions", severity: "critical" as const, description: "Attempts to override system prompt directives." },
7:   { pattern_name: "DAN Jailbreak", matched_text: "do anything now", severity: "high" as const, description: "Classic DAN jailbreak pattern detected." },
8:   { pattern_name: "Role Confusion", matched_text: "pretend you are", severity: "medium" as const, description: "Tries to assign a malicious persona to the model." },
9:   { pattern_name: "Data Exfiltration Hint", matched_text: "send this to", severity: "high" as const, description: "Potential data exfiltration instruction." },
10: ];
11: 
12: function analyzeSeverity(score: number): "low" | "medium" | "high" | "critical" {
13:   if (score >= 80) return "critical";
14:   if (score >= 55) return "high";
15:   if (score >= 30) return "medium";
16:   return "low";
17: }
18: 
19: function mockScanPrompt(content: string): PromptScanResult {
20:   const lower = content.toLowerCase();
21:   const matched = PROMPT_PATTERNS.filter(p => lower.includes(p.matched_text));
22:   const score = Math.min(95, matched.length * 25 + Math.floor(Math.random() * 15));
23:   return {
24:     id: Date.now().toString(36),
25:     content,
26:     threat_score: score,
27:     severity: analyzeSeverity(score),
28:     detected_patterns: matched,
29:     explanation: matched.length > 0
30:       ? `Detected ${matched.length} suspicious pattern(s) in the prompt. This content poses a ${analyzeSeverity(score)} risk.`
31:       : "No known threat patterns detected. Content appears safe.",
32:     recommended_action: score >= 55 ? "Block and flag for review." : "Allow with monitoring.",
33:     created_at: new Date().toISOString(),
34:   };
35: }
36: 
37: const URL_INDICATORS = {
38:   phishing: [
39:     { name: "Typosquat Domain", value: "High similarity to known brand", risk_contribution: "+40" },
40:     { name: "No HTTPS", value: "Plaintext HTTP", risk_contribution: "+20" },
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
