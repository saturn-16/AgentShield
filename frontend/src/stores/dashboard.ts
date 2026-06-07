import { create } from "zustand";
import { DashboardData } from "@/types";

const mockDashboard: DashboardData = {
  stats: {
    total_scans: 1248,
    threats_detected: 42,
    average_trust_score: 88,
    active_agents: 4,
    scans_today: 18,
    threats_today: 1,
  },
  scan_activity: [
    { date: "May 26", prompt_scans: 45, url_scans: 12 },
    { date: "May 27", prompt_scans: 58, url_scans: 19 },
    { date: "May 28", prompt_scans: 62, url_scans: 22 },
    { date: "May 29", prompt_scans: 51, url_scans: 15 },
    { date: "May 30", prompt_scans: 68, url_scans: 28 },
    { date: "May 31", prompt_scans: 74, url_scans: 31 },
    { date: "Jun 01", prompt_scans: 85, url_scans: 35 },
  ],
  threat_distribution: [
    { category: "Prompt Override", count: 18, percentage: 43 },
    { category: "DAN Jailbreak", count: 12, percentage: 29 },
    { category: "Data Leakage", count: 8, percentage: 19 },
    { category: "Phishing URL", count: 4, percentage: 9 },
  ],
  recent_threats: [
    { id: "1", type: "Prompt Override", threat_score: 85, severity: "critical", created_at: new Date().toISOString() },
    { id: "2", type: "DAN Jailbreak", threat_score: 72, severity: "high", created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "3", type: "API Credentials Leak", threat_score: 48, severity: "medium", created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: "4", type: "Phishing Domain Block", threat_score: 92, severity: "critical", created_at: new Date(Date.now() - 14400000).toISOString() },
  ],
};

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  fetchDashboard: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  data: null,
  isLoading: false,

  fetchDashboard: async () => {
    set({ isLoading: true });
    await new Promise(r => setTimeout(r, 300));
    set({ data: mockDashboard, isLoading: false });
  },

  refreshStats: async () => {
    await new Promise(r => setTimeout(r, 200));
    set({ data: mockDashboard });
  },
}));
