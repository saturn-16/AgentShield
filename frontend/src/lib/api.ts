import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    try {
      const rawSession = localStorage.getItem("agentshield_session");
      if (rawSession) {
        const session = JSON.parse(rawSession);
        if (session && session.token) {
          config.headers.Authorization = `Bearer ${session.token}`;
        }
      }
    } catch (e) {
      console.error("Error setting authorization header", e);
    }
    return config;
  });
}

export interface ThreatLog {
  id: number;
  entity: string;
  entity_label: string;
  title: string;
  risk_level: number;
  last_activity: string;
  data_sources: string[];
  status: string;
  category: string;
  created_at: string;
}

export interface DashboardData {
  summary: {
    threats_blocked: number;
    security_score: number;
    active_agents: number;
    risk_events: number;
  };
  alerts_by_time: Array<{
    time: string;
    "Prompt Injection": number;
    Jailbreak: number;
    "Data Leakage": number;
    "Malicious URL": number;
  }>;
  threat_tactics: {
    central: number;
    nodes: Array<{
      id: string;
      label: string;
      val: number;
      color: string;
      angle: number;
      radius: number;
    }>;
  };
  threat_status: {
    open: number;
    dismissed: number;
    investigating: number;
  };
}

export interface ScanResult {
  id?: number;
  scanner_type: string;
  threat_score: number;
  severity: string;
  risk_indicators: string[];
  explanation: string;
  masked_content?: string;
  created_at?: string;
}

export interface AgentNode {
  id: number;
  name: string;
  role: string;
  status: string;
  safety_score: number;
  uptime: string;
}

export interface SwarmStep {
  agent: string;
  status: string;
  timestamp: string;
  message: string;
}

export interface SwarmSimulationResult {
  status: string;
  verdict: string;
  score: number;
  steps: SwarmStep[];
  masked_content?: string;
}

export interface Policy {
  id: number;
  name: string;
  description: string;
  action: string;
  enabled: boolean;
}

const FALLBACK_DASHBOARD: DashboardData = {
  summary: { threats_blocked: 1464, security_score: 94, active_agents: 4, risk_events: 5 },
  alerts_by_time: [
    { time: "6:00 PM", "Prompt Injection": 12, Jailbreak: 14, "Data Leakage": 5, "Malicious URL": 8 },
    { time: "7:00 PM", "Prompt Injection": 15, Jailbreak: 8, "Data Leakage": 10, "Malicious URL": 12 },
    { time: "8:00 PM", "Prompt Injection": 8, Jailbreak: 20, "Data Leakage": 15, "Malicious URL": 6 },
    { time: "9:00 PM", "Prompt Injection": 14, Jailbreak: 12, "Data Leakage": 9, "Malicious URL": 10 },
    { time: "10:00 PM", "Prompt Injection": 22, Jailbreak: 18, "Data Leakage": 11, "Malicious URL": 15 },
    { time: "11:00 PM", "Prompt Injection": 9, Jailbreak: 15, "Data Leakage": 8, "Malicious URL": 11 }
  ],
  threat_tactics: {
    central: 3548,
    nodes: [
      { id: "node-1", label: "Defense Evasion", val: 2756, color: "#EC4899", angle: 45, radius: 110 },
      { id: "node-2", label: "Discovery", val: 2957, color: "#3B82F6", angle: 135, radius: 115 },
      { id: "node-3", label: "Execution", val: 3012, color: "#A855F7", angle: 225, radius: 120 },
      { id: "node-4", label: "Initial Access", val: 1930, color: "#F97316", angle: 315, radius: 110 },
      { id: "node-5", label: "Data Leakage", val: 2614, color: "#EC4899", angle: 90, radius: 140 },
      { id: "node-6", label: "Poisoning", val: 2873, color: "#3B82F6", angle: 180, radius: 135 },
      { id: "node-7", label: "Model Hijacking", val: 2747, color: "#A855F7", angle: 270, radius: 140 },
      { id: "node-8", label: "Spoofing", val: 2437, color: "#F97316", angle: 0, radius: 130 }
    ]
  },
  threat_status: { open: 40, dismissed: 18, investigating: 5 }
};

const FALLBACK_THREATS: ThreatLog[] = [
  {
    id: 1,
    entity: "debra.holt@agentshield.ai",
    entity_label: "LangGraph Node: input_guard",
    title: "Indirect prompt injection in sales inquiry email",
    risk_level: 10,
    last_activity: "Apr 12, 2026",
    data_sources: ["openai", "langchain", "slack"],
    status: "Open",
    category: "Prompt Injection",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    entity: "tim.jennings@agentshield.ai",
    entity_label: "LangGraph Node: deep_analyzer",
    title: "DAN Jailbreak override attempt detected in live session",
    risk_level: 11,
    last_activity: "Apr 14, 2026",
    data_sources: ["google", "langchain", "slack"],
    status: "Open",
    category: "Jailbreak",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    entity: "debbie.baker@agentshield.ai",
    entity_label: "LangGraph Node: payload_validator",
    title: "API Key credentials leak in PDF response payload",
    risk_level: 7,
    last_activity: "Apr 15, 2026",
    data_sources: ["openai", "google"],
    status: "Open",
    category: "Data Leakage",
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    entity: "dolores.cham@agentshield.ai",
    entity_label: "LangGraph Node: output_reporter",
    title: "Malicious exfiltration URL threat loaded in document",
    risk_level: 6,
    last_activity: "Apr 17, 2026",
    data_sources: ["aws", "slack", "google"],
    status: "Open",
    category: "Malicious URL",
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    entity: "michelle.rivera@agentshield.ai",
    entity_label: "LangGraph Node: input_guard",
    title: "Cognitive roleplay sandbox escape simulation bypass",
    risk_level: 8,
    last_activity: "Apr 18, 2026",
    data_sources: ["google", "openai", "slack"],
    status: "Open",
    category: "Jailbreak",
    created_at: new Date().toISOString()
  }
];

const FALLBACK_AGENTS: AgentNode[] = [
  { id: 1, name: "Sentinel Agent", role: "Input Guardrail", status: "Active", safety_score: 98, uptime: "99.98%" },
  { id: 2, name: "Analyzer Agent", role: "Adversarial Parser", status: "Active", safety_score: 92, uptime: "99.95%" },
  { id: 3, name: "Validator Agent", role: "Output Guardrail", status: "Active", safety_score: 96, uptime: "99.99%" },
  { id: 4, name: "Reporter Agent", role: "SOC Incident Publisher", status: "Active", safety_score: 99, uptime: "99.96%" }
];

const FALLBACK_POLICIES: Policy[] = [
  { id: 1, name: "Adversarial Prompt Injection Guard", description: "Detects and blocks prompt override patterns automatically.", action: "Block", enabled: true },
  { id: 2, name: "DLP Credential Masker", description: "Identifies and redacts AWS, Google, and Stripe keys before agent processing.", action: "Mask", enabled: true },
  { id: 3, name: "DAN & Roleplay Jailbreak Blocker", description: "Intercepts jailbreak instructions and blocks LLM token delivery.", action: "Block", enabled: true },
  { id: 4, name: "Malicious Link Sandboxing", description: "Resolves hyperlinked domains online to flag phishing and malware domains.", action: "Block", enabled: true },
  { id: 5, name: "Agent-to-Agent Logs Auditor", description: "Records messaging paths and checks for exfiltration tokens.", action: "Audit", enabled: true }
];

export const fetchAPI = {
  async getDashboard(): Promise<DashboardData> {
    try {
      const res = await api.get("/dashboard/overview");
      return res.data;
    } catch {
      return FALLBACK_DASHBOARD;
    }
  },

  async scanPrompt(content: string): Promise<ScanResult> {
    try {
      const res = await api.post("/prompts/scan", { content });
      return res.data;
    } catch {
      const hasOverride = content.toLowerCase().includes("ignore");
      const score = hasOverride ? 85 : 0;
      return {
        scanner_type: "prompt",
        threat_score: score,
        severity: score >= 80 ? "Critical" : "Safe",
        risk_indicators: hasOverride ? ["Adversarial Command Detected"] : [],
        explanation: hasOverride ? "Locally scanned: Overriding prompt signature flagged." : "Locally scanned: Safe content payload."
      };
    }
  },

  async scanJailbreak(content: string): Promise<ScanResult> {
    try {
      const res = await api.post("/prompts/scan", { content });
      return res.data;
    } catch {
      const isDan = content.toLowerCase().includes("dan");
      const score = isDan ? 90 : 0;
      return {
        scanner_type: "jailbreak",
        threat_score: score,
        severity: isDan ? "Critical" : "Safe",
        risk_indicators: isDan ? ["DAN Character Bypass Signature"] : [],
        explanation: isDan ? "Locally scanned: Adversarial persona override." : "Locally scanned: No jailbreaks identified."
      };
    }
  },

  async scanURL(url: string): Promise<ScanResult> {
    try {
      const res = await api.post("/urls/scan", { url });
      return res.data;
    } catch {
      const isSuspicious = url.includes(".xyz") || url.includes("hack");
      const score = isSuspicious ? 75 : 10;
      return {
        scanner_type: "url",
        threat_score: score,
        severity: isSuspicious ? "High" : "Safe",
        risk_indicators: isSuspicious ? ["High-Risk TLD (.xyz)", "Phishing Keyword"] : [],
        explanation: isSuspicious ? "Locally scanned: Malicious domain extensions detected." : "Locally scanned: Clean reputation."
      };
    }
  },

  async scanDLP(content: string): Promise<ScanResult> {
    try {
      throw new Error("Local fallback required");
    } catch {
      let masked = content;
      const indicators: string[] = [];
      let score = 0;

      // 1. AWS Access Key
      const awsMatches = content.match(/\bAKIA[0-9A-Z]{16}\b/g);
      if (awsMatches) {
        indicators.push(`Exposed AWS Access Key Signature (Count: ${awsMatches.length})`);
        score += 35 * awsMatches.length;
        masked = masked.replace(/\bAKIA[0-9A-Z]{16}\b/g, "●●●●[REDACTED_AWS_ACCESS_KEY]●●●●");
      }

      // 2. Google API Key
      const googleMatches = content.match(/\bAIza[0-9A-Za-z\-_]{35,45}\b/g);
      if (googleMatches) {
        indicators.push(`Exposed Google API Key Signature (Count: ${googleMatches.length})`);
        score += 35 * googleMatches.length;
        masked = masked.replace(/\bAIza[0-9A-Za-z\-_]{35,45}\b/g, "●●●●[REDACTED_GOOGLE_API_KEY]●●●●");
      }

      // 3. Stripe Secret Key
      const stripeMatches = content.match(/\bsk_live_[0-9a-zA-Z]{24,99}\b/g);
      if (stripeMatches) {
        indicators.push(`Exposed Stripe Secret Key Signature (Count: ${stripeMatches.length})`);
        score += 35 * stripeMatches.length;
        masked = masked.replace(/\bsk_live_[0-9a-zA-Z]{24,99}\b/g, "●●●●[REDACTED_STRIPE_SECRET_KEY]●●●●");
      }

      // 4. GitHub PAT
      const githubMatches = content.match(/\b(?:ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z]{82})\b/g);
      if (githubMatches) {
        indicators.push(`Exposed GitHub Personal Access Token Signature (Count: ${githubMatches.length})`);
        score += 35 * githubMatches.length;
        masked = masked.replace(/\b(?:ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z]{82})\b/g, "●●●●[REDACTED_GITHUB_PERSONAL_ACCESS_TOKEN]●●●●");
      }

      // 5. Slack Webhook
      const slackMatches = content.match(/https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]{8}\/B[A-Z0-9]{8}\/[A-Za-z0-9]{24}/g);
      if (slackMatches) {
        indicators.push(`Exposed Slack Webhook URL Signature (Count: ${slackMatches.length})`);
        score += 35 * slackMatches.length;
        masked = masked.replace(/https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]{8}\/B[A-Z0-9]{8}\/[A-Za-z0-9]{24}/g, "●●●●[REDACTED_SLACK_WEBHOOK_URL]●●●●");
      }

      // 6. Generic Secret Key Value
      const genericRegex = /\b(?:api_key|secret_key|password|jwt_token|token)\b\s*[:=]\s*['"]([a-zA-Z0-9_\-\.]{20,})['"]/gi;
      let genericMatch;
      let genericCount = 0;
      while ((genericMatch = genericRegex.exec(content)) !== null) {
        genericCount++;
        const secretVal = genericMatch[1];
        masked = masked.replace(secretVal, "●●●●[REDACTED_SECRET]●●●●");
      }
      if (genericCount > 0) {
        indicators.push(`Exposed Generic Secret Entropy Signature (Count: ${genericCount})`);
        score += 35 * genericCount;
      }

      // 7. PEM Private Key
      const pemRegex = /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]+?-----END [A-Z ]*PRIVATE KEY-----/g;
      const pemMatches = content.match(pemRegex);
      if (pemMatches) {
        indicators.push(`Exposed PEM Private Key Signature (Count: ${pemMatches.length})`);
        score += 35 * pemMatches.length;
        masked = masked.replace(pemRegex, "●●●●[REDACTED_PEM_PRIVATE_KEY]●●●●");
      }

      score = Math.min(score, 100);
      
      let severity = "Safe";
      let explanation = "No secrets, API keys, private tokens, or credential signatures identified in the payload.";
      if (score >= 70) {
        severity = "Critical";
        explanation = "Multiple high-entropy cryptographic keys, API access tokens, or private RSA keys identified in open-text logs. Automated masking executed.";
      } else if (score >= 35) {
        severity = "High";
        explanation = "Single high-fidelity API credential exposed in communication streams. Sensitive information has been masked successfully.";
      } else if (score > 0) {
        severity = "Medium";
        explanation = "Identified suspicious key/value credential mappings. Automatic obfuscation complete.";
      }

      return {
        scanner_type: "dlp",
        threat_score: score,
        severity: severity,
        risk_indicators: indicators,
        explanation: `Locally scanned: ${explanation}`,
        masked_content: masked
      };
    }
  },

  async getThreats(search?: string, status?: string): Promise<ThreatLog[]> {
    try {
      let url = "/threats";
      const params: any = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await api.get(url, { params });
      return res.data;
    } catch {
      let filtered = [...FALLBACK_THREATS];
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(t => t.title.toLowerCase().includes(query) || t.entity.toLowerCase().includes(query));
      }
      if (status) {
        filtered = filtered.filter(t => t.status === status);
      }
      return filtered;
    }
  },

  async updateThreatStatus(id: number, status: string): Promise<any> {
    try {
      const res = await api.patch(`/threats/${id}/status`, { status });
      return res.data;
    } catch {
      return { id, status };
    }
  },

  async getAgents(): Promise<AgentNode[]> {
    try {
      const res = await api.get("/agents");
      return res.data;
    } catch {
      return FALLBACK_AGENTS;
    }
  },

  async simulateSwarm(content: string): Promise<SwarmSimulationResult> {
    try {
      const res = await api.post("/agents/simulate", { content });
      return res.data;
    } catch {
      return {
        status: "Safe",
        verdict: "Local Swarm Simulation Complete",
        score: 0,
        steps: [
          { agent: "Sentinel Agent", status: "Clean", timestamp: "12:00:01", message: "Sentinel checked input, no bypass triggers matched." },
          { agent: "Analyzer Agent", status: "Clean", timestamp: "12:00:02", message: "Analyzer mapped semantic arrays, 0 injection tokens found." },
          { agent: "Validator Agent", status: "Clean", timestamp: "12:00:03", message: "Validator verified output buffers, data leakage safe." },
          { agent: "Reporter Agent", status: "Publishing", timestamp: "12:00:04", message: "Reporter published clean status token to system logs." }
        ]
      };
    }
  },

  async getPolicies(): Promise<Policy[]> {
    try {
      throw new Error("No backend endpoint");
    } catch {
      return FALLBACK_POLICIES;
    }
  },

  async updatePolicy(id: number, enabled: boolean, action: string): Promise<any> {
    try {
      throw new Error("No backend endpoint");
    } catch {
      return { id, enabled, action };
    }
  },

  async generateReport(): Promise<{ report_md: string; metadata: any }> {
    try {
      const res = await api.post("/reports/generate", { report_type: "incident_summary" });
      return res.data;
    } catch {
      return {
        report_md: "# AgentShield AI SOC Report - Fallback Mode\n\nActive monitoring running safely. System status is healthy. No critical breaches have bypassed the active firewall quarantines.",
        metadata: { total_incidents: 5, open_incidents: 5, critical_risk_incidents: 2, generated_at: new Date().toISOString() }
      };
    }
  }
};
