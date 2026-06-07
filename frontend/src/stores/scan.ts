import { create } from "zustand";
import { PromptScanResult, UrlScanResult } from "@/types";

const PROMPT_PATTERNS = [
  { pattern_name: "Prompt Override Attempt", matched_text: "ignore previous instructions", severity: "critical" as const, description: "Attempts to override system prompt directives." },
  { pattern_name: "DAN Jailbreak", matched_text: "do anything now", severity: "high" as const, description: "Classic DAN jailbreak pattern detected." },
  { pattern_name: "Role Confusion", matched_text: "pretend you are", severity: "medium" as const, description: "Tries to assign a malicious persona to the model." },
  { pattern_name: "Data Exfiltration Hint", matched_text: "send this to", severity: "high" as const, description: "Potential data exfiltration instruction." },
];

function analyzeSeverity(score: number): "low" | "medium" | "high" | "critical" {
  if (score >= 80) return "critical";
  if (score >= 55) return "high";
  if (score >= 30) return "medium";
  return "low";
}

function mockScanPrompt(content: string): PromptScanResult {
  const lower = content.toLowerCase();
  const matched = PROMPT_PATTERNS.filter(p => lower.includes(p.matched_text));
  const score = Math.min(95, matched.length * 25 + Math.floor(Math.random() * 15));
  return {
    id: Date.now().toString(36),
    content,
    threat_score: score,
    severity: analyzeSeverity(score),
    detected_patterns: matched,
    explanation: matched.length > 0
      ? `Detected ${matched.length} suspicious pattern(s) in the prompt. This content poses a ${analyzeSeverity(score)} risk.`
      : "No known threat patterns detected. Content appears safe.",
    recommended_action: score >= 55 ? "Block and flag for review." : "Allow with monitoring.",
    created_at: new Date().toISOString(),
  };
}

function mockScanUrl(url: string): UrlScanResult {
  let domain = "example.com";
  try {
    const parsed = new URL(url);
    domain = parsed.hostname;
  } catch {
    domain = url.replace(/https?:\/\//, "").split("/")[0];
  }

  const isPhishing = url.includes("paypa1") || url.includes("secure") || url.includes("login") || url.includes("update") || url.includes("verification");
  const isNoHttps = !url.startsWith("https://");
  
  const indicators = [];
  let score = 95;

  if (isPhishing) {
    indicators.push({ name: "Typosquat Domain", value: "High similarity to known brand", risk_contribution: "-40" });
    score -= 40;
  } else {
    indicators.push({ name: "Domain Reputation", value: "Verified clean history", risk_contribution: "+10" });
  }

  if (isNoHttps) {
    indicators.push({ name: "No HTTPS", value: "Plaintext HTTP", risk_contribution: "-20" });
    score -= 20;
  } else {
    indicators.push({ name: "SSL Certificate", value: "Valid HTTPS connection", risk_contribution: "+5" });
  }

  score = Math.max(0, Math.min(100, score));

  let classification: "safe" | "suspicious" | "malicious" = "safe";
  if (score <= 50) {
    classification = "malicious";
  } else if (score <= 75) {
    classification = "suspicious";
  }

  return {
    id: Date.now().toString(36),
    url,
    domain,
    reputation_score: score,
    classification,
    domain_age_days: isPhishing ? 12 : 1420,
    indicators,
    created_at: new Date().toISOString()
  };
}

const PROMPT_HISTORY_KEY = "agentshield_prompt_history";
const URL_HISTORY_KEY = "agentshield_url_history";

function getStoredHistory<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function saveHistory<T>(key: string, history: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(history.slice(0, 100)));
}

const AUDIT_LOGS_KEY = "agentshield_audit_logs";
const AUDIT_STATS_KEY = "agentshield_audit_stats";

type AuditSeverity = "safe" | "warning" | "critical";

function mapSeverity(score: number): AuditSeverity {
  if (score >= 70) return "critical";
  if (score >= 35) return "warning";
  return "safe";
}

function writeAuditLog(entry: {
  service: "Prompt Scanner" | "URL Scanner" | "Agent Swarm" | "Trust Center" | "Reports";
  action: string;
  user: string;
  duration: string;
  status: "completed" | "blocked" | "running";
  severity: AuditSeverity;
  detail: string;
}) {
  if (typeof window === "undefined") return;
  const existing = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || "[]");
  const newLog = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    ...entry,
    timestamp: new Date().toISOString(),
  };
  const updated = [newLog, ...existing].slice(0, 200);
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));

  const stats = JSON.parse(localStorage.getItem(AUDIT_STATS_KEY) || "{}");
  stats.scans = (stats.scans || 0) + 1;
  if (entry.status === "blocked" || entry.severity === "critical") {
    stats.protected = (stats.protected || 0) + 1;
    stats.alerts = (stats.alerts || 0) + 1;
  } else if (entry.severity === "warning") {
    stats.protected = (stats.protected || 0) + 1;
  }
  localStorage.setItem(AUDIT_STATS_KEY, JSON.stringify(stats));
}

interface ScanState {
  promptResult: PromptScanResult | null;
  urlResult: UrlScanResult | null;
  isScanning: boolean;
  promptHistory: PromptScanResult[];
  urlHistory: UrlScanResult[];
  scanPrompt: (content: string) => Promise<PromptScanResult>;
  scanUrl: (url: string) => Promise<UrlScanResult>;
  fetchPromptHistory: (page?: number, perPage?: number) => Promise<void>;
  fetchUrlHistory: (page?: number, perPage?: number) => Promise<void>;
  clearResults: () => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  promptResult: null,
  urlResult: null,
  isScanning: false,
  promptHistory: [],
  urlHistory: [],

  clearResults: () => set({ promptResult: null, urlResult: null }),

  scanPrompt: async (content) => {
    set({ isScanning: true });
    const t0 = Date.now();
    await new Promise(r => setTimeout(r, 1200));
    const result = mockScanPrompt(content);
    const history = [result, ...getStoredHistory<PromptScanResult>(PROMPT_HISTORY_KEY)];
    saveHistory(PROMPT_HISTORY_KEY, history);
    set({ promptResult: result, isScanning: false, promptHistory: history.slice(0, 10) });

    const durationMs = Date.now() - t0;
    const sev = mapSeverity(result.threat_score);
    writeAuditLog({
      service: "Prompt Scanner",
      action: result.detected_patterns.length > 0
        ? `Threat detected: ${result.detected_patterns[0].pattern_name}`
        : "Prompt scan completed — no threats",
      user: "Current User",
      duration: `${(durationMs / 1000).toFixed(1)}s`,
      status: result.threat_score >= 55 ? "blocked" : "completed",
      severity: sev,
      detail: result.explanation.slice(0, 100),
    });
    return result;
  },

  scanUrl: async (url) => {
    set({ isScanning: true });
    const t0 = Date.now();
    await new Promise(r => setTimeout(r, 1000));
    const result = mockScanUrl(url);
    const history = [result, ...getStoredHistory<UrlScanResult>(URL_HISTORY_KEY)];
    saveHistory(URL_HISTORY_KEY, history);
    set({ urlResult: result, isScanning: false, urlHistory: history.slice(0, 10) });

    const durationMs = Date.now() - t0;
    writeAuditLog({
      service: "URL Scanner",
      action: result.classification === "malicious"
        ? `Malicious URL blocked: ${result.domain}`
        : result.classification === "suspicious"
        ? `Suspicious URL flagged: ${result.domain}`
        : `URL verified safe: ${result.domain}`,
      user: "Current User",
      duration: `${(durationMs / 1000).toFixed(1)}s`,
      status: result.classification === "malicious" ? "blocked" : "completed",
      severity: result.classification === "malicious" ? "critical" : result.classification === "suspicious" ? "warning" : "safe",
      detail: `${result.indicators.length} indicators checked. Domain age: ${result.domain_age_days ?? "unknown"} days.`,
    });
    return result;
  },

  fetchPromptHistory: async () => {
    const history = getStoredHistory<PromptScanResult>(PROMPT_HISTORY_KEY);
    set({ promptHistory: history });
  },

  fetchUrlHistory: async () => {
    const history = getStoredHistory<UrlScanResult>(URL_HISTORY_KEY);
    set({ urlHistory: history });
  },
}));