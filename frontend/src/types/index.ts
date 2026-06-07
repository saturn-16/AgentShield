export type UserRole = "user" | "analyst" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export type Severity = "low" | "medium" | "high" | "critical";
export type Classification = "safe" | "suspicious" | "malicious";
export type AgentType = "sentinel" | "analyzer" | "validator" | "reporter";
export type ActionStatus = "pending" | "running" | "completed" | "failed";
export type ReportType = "scan_summary" | "threat_assessment" | "compliance" | "agent_analysis";
export type GeneratedBy = "manual" | "agent";

export interface DetectedPattern {
  pattern_name: string;
  matched_text: string;
  severity: Severity;
  description: string;
}

export interface PromptScanResult {
  id: string;
  content: string;
  threat_score: number;
  severity: Severity;
  detected_patterns: DetectedPattern[];
  explanation: string;
  recommended_action: string;
  created_at: string;
}

export interface UrlIndicator {
  name: string;
  value: string;
  risk_contribution: string;
}

export interface UrlScanResult {
  id: string;
  url: string;
  domain: string;
  domain_age_days?: number;
  reputation_score: number;
  classification: Classification;
  indicators: UrlIndicator[];
  created_at: string;
}

export interface TrustFactors {
  prompt_safety: number;
  url_safety: number;
  leakage_risk: number;
  behavioral_risk: number;
}

export interface TrustScore {
  id: string;
  score: number;
  factors: TrustFactors;
  risk_classification: string;
  created_at: string;
}

export interface TrustTrendPoint {
  score: number;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  source: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AgentTrace {
  agent_type: AgentType;
  action: string;
  reasoning: string;
  result: Record<string, any>;
  duration_ms: number;
}

export interface SwarmResult {
  id: string;
  status: string;
  threat_score: number;
  severity: Severity;
  traces: AgentTrace[];
  final_report: string;
  created_at: string;
}

export interface AgentAction {
  id: string;
  agent_type: AgentType;
  action: string;
  status: ActionStatus;
  reasoning_trace?: string;
  execution_time_ms?: number;
  created_at: string;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  report_type: ReportType;
  generated_by: GeneratedBy;
  created_at: string;
}

export interface DashboardStats {
  total_scans: number;
  threats_detected: number;
  average_trust_score: number;
  active_agents: number;
  scans_today: number;
  threats_today: number;
}

export interface ScanActivityPoint {
  date: string;
  prompt_scans: number;
  url_scans: number;
}

export interface ThreatDistItem {
  category: string;
  count: number;
  percentage: number;
}

export interface DashboardData {
  stats: DashboardStats;
  scan_activity: ScanActivityPoint[];
  threat_distribution: ThreatDistItem[];
  recent_threats: Array<{
    id: string;
    type: string;
    threat_score: number;
    severity: string;
    created_at: string;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  error_code?: string;
  request_id?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}
