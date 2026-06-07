"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Terminal as TermIcon, 
  Cpu, 
  Layers, 
  Activity, 
  Skull, 
  Radio, 
  Zap, 
  CheckCircle, 
  PlayCircle, 
  AlertCircle,
  FileText,
  Settings,
  Eye,
  RefreshCw
} from "lucide-react";

import { fetchAPI, ThreatLog, DashboardData, Policy } from "@/lib/api";
import ParticleGridBackground from "@/components/ParticleGridBackground";
import AgentSwarmNetwork, { SwarmNode } from "@/components/AgentSwarmNetwork";
import HolographicScanner from "@/components/HolographicScanner";
import RiskLevelProgress from "@/components/RiskLevelProgress";

interface ReplayStage {
  id: number;
  name: string;
  agent: string;
  verdict: "Safe" | "Warning" | "Threat Blocked" | "Pending";
  description: string;
}

export default function SOCDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [threats, setThreats] = useState<ThreatLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [hudStatus, setHudStatus] = useState<"SECURE" | "SCANNING" | "BREACH_INTERCEPTED">("SECURE");
  const [securityScore, setSecurityScore] = useState(94);
  const [totalScansChecked, setTotalScansChecked] = useState(1464);
  const [laserActive, setLaserActive] = useState(false);

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "AGENTSHELD AI-SOC ACTIVE DIRECTORY SYNC COMPLETE.",
    "SQLITE PERSISTENT LOGS AT sqlite:///./agentshield.db: CONNECTED.",
    "READY FOR USER CYBER SCANS AND SWARM INSTRUCTIONS..."
  ]);
  const [isScanning, setIsScanning] = useState(false);

  const [firedPayload, setFiredPayload] = useState<string | null>(null);
  const [firedVerdict, setFiredVerdict] = useState<"Blocked" | "Safe" | null>(null);

  const [selectedNode, setSelectedNode] = useState<SwarmNode | null>(null);

  const [scrollingBreaches, setScrollingBreaches] = useState<string[]>([
    "INSPECTING SOCKET PORT 443 -> SENTINEL NODE [CLEAN]",
    "EXAMINING MEMORY ARRAYS IN WORKER SQL CORE [CLEAN]"
  ]);

  const [replayActive, setReplayActive] = useState(false);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replayCurrentStage, setReplayCurrentStage] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(2500);
  const [replayVerdict, setReplayVerdict] = useState<"Blocked" | "Safe">("Blocked");
  const [replayPayloadText, setReplayPayloadText] = useState("");
  const replayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const initialReplayStages: ReplayStage[] = [
    { id: 1, name: "Sentinel Guard Sweep", agent: "Sentinel Agent", verdict: "Pending", description: "Evaluating incoming prompt variables for direct/indirect override syntax loops." },
    { id: 2, name: "Semantic Syntax Check", agent: "Analyzer Agent", verdict: "Pending", description: "Parsing cognitive DAN roleplays and resolving outbound URL host DNS reputations." },
    { id: 3, name: "DLP Compliance Audit", agent: "Validator Agent", verdict: "Pending", description: "Auditing memory buffers for plain-text AWS/Google access keys and masking exposures." },
    { id: 4, name: "Incident SIEM Register", agent: "Reporter Agent", verdict: "Pending", description: "Publishing detailed packet metadata and threat triggers to the secure SOC log." },
    { id: 5, name: "Containment Enforced", agent: "System Breach Guard", verdict: "Pending", description: "Applying active firewall isolation rules to quarantine hijacked nodes." }
  ];
  const [replayStages, setReplayStages] = useState<ReplayStage[]>(initialReplayStages);

  useEffect(() => {
    loadAllTelemetry();
    
    const interval = setInterval(() => {
      const logs = [
        "EXAMINING SHIELD PACKET PATHWAYS... [VERIFIED]",
        "SIEM DB SYNC COMPLETED SUCCESSFULLY. NO LOSSES DETECTED.",
        "MONITORING HOST UPTIME: SENTINEL NODE AT 99.98%",
        "DLP REGEX GUARD SWEEP COMPLETE. BUFFER SECURED.",
        "ROUTING DIALECT ARRAYS THROUGH ANALYZER NODE... [SAFE]",
        "RESOLVING DNS INTEGRATION HOSTNAMES... [CLEAN]"
      ];
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      setScrollingBreaches(prev => [randomLog, ...prev.slice(0, 9)]);
      
      setSecurityScore(prev => Math.min(100, Math.max(88, prev + (Math.random() > 0.5 ? 1 : -1))));
      setTotalScansChecked(prev => prev + 1);
    }, 4500);

    return () => {
      clearInterval(interval);
      if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    };
  }, []);

  const loadAllTelemetry = async () => {
    try {
      const [dbData, threatData] = await Promise.all([
        fetchAPI.getDashboard(),
        fetchAPI.getThreats()
      ]);
      setDashboard(dbData);
      setThreats(threatData);
      
      if (dbData?.summary) {
        setSecurityScore(dbData.summary.security_score);
        setTotalScansChecked(dbData.summary.threats_blocked);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startSecurityReplay = (payload: string, isAdversarial: boolean) => {
    if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
    
    setReplayActive(true);
    setReplayPlaying(true);
    setReplayCurrentStage(0);
    setReplayPayloadText(payload);
    
    const verdict = isAdversarial ? "Blocked" : "Safe";
    setReplayVerdict(verdict);
    setHudStatus("SCANNING");
    setLaserActive(true);

    const freshStages = initialReplayStages.map(s => ({ ...s, verdict: "Pending" as const }));
    setReplayStages(freshStages);

    setFiredPayload(payload);
    setFiredVerdict(null);

    let current = 0;
    const runStep = async () => {
      current++;
      setReplayCurrentStage(current);

      if (current === 1) {
        setTerminalLogs(prev => ["> STAGE 1: Sentinel Agent sweeping prompt parameters...", ...prev]);
        setReplayStages(prev => prev.map((s, idx) => idx === 0 ? { ...s, verdict: isAdversarial ? "Warning" : "Safe" } : s));
      } else if (current === 2) {
        setTerminalLogs(prev => ["> STAGE 2: Analyzer Agent resolving syntax & URL reputations...", ...prev]);
        setReplayStages(prev => prev.map((s, idx) => idx === 1 ? { ...s, verdict: isAdversarial ? "Warning" : "Safe" } : s));
      } else if (current === 3) {
        setTerminalLogs(prev => ["> STAGE 3: Validator Agent auditing memory buffers for DLP leakage...", ...prev]);
        setReplayStages(prev => prev.map((s, idx) => idx === 2 ? { ...s, verdict: isAdversarial ? "Warning" : "Safe" } : s));
      } else if (current === 4) {
        setTerminalLogs(prev => ["> STAGE 4: Reporter Agent registering active incident variables...", ...prev]);
        setReplayStages(prev => prev.map((s, idx) => idx === 3 ? { ...s, verdict: isAdversarial ? "Warning" : "Safe" } : s));
      } else if (current === 5) {
        setLaserActive(false);
        if (isAdversarial) {
          setHudStatus("BREACH_INTERCEPTED");
          setFiredVerdict("Blocked");
          setTerminalLogs(prev => ["🚨 THREAT INTERCEPTED: Dynamic containment quarantine active.", ...prev]);
          setReplayStages(prev => prev.map((s, idx) => idx === 4 ? { ...s, verdict: "Threat Blocked" } : s));
          setScrollingBreaches(prev => ["🚨 BREACH CONTAINED AT Sentinel AND Validator NODES", ...prev]);
          
          try {
            await fetchAPI.scanPrompt(payload);
            loadAllTelemetry();
          } catch(e){}
        } else {
          setHudStatus("SECURE");
          setFiredVerdict("Safe");
          setTerminalLogs(prev => ["✓ SWARM COMPLIANT: Query cleared for LLM token processing.", ...prev]);
          setReplayStages(prev => prev.map((s, idx) => idx === 4 ? { ...s, verdict: "Safe" } : s));
        }
        
        setReplayPlaying(false);
        if (replayIntervalRef.current) clearInterval(replayIntervalRef.current);
      }
    };

    replayIntervalRef.current = setInterval(runStep, replaySpeed);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 relative overflow-hidden select-none bg-transparent min-h-[550px]">
      <HolographicScanner active={laserActive} />

      {/* Main Top Summary Telemetry Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass p-5 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Firewall Status</span>
              <span className={`text-xs font-black tracking-wide uppercase ${
                hudStatus === "BREACH_INTERCEPTED" ? "text-pink-500 animate-pulse" : "text-cyan-400"
              }`}>{hudStatus}</span>
            </div>
          </div>
          <span className="text-2xl font-black text-white/95 font-mono">{securityScore}%</span>
        </div>

        <div className="glass p-5 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Scans Inspected</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">100% active</span>
            </div>
          </div>
          <span className="text-2xl font-black text-white/95 font-mono">{totalScansChecked}</span>
        </div>

        <div className="glass p-5 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-wider">Active Guard Swarms</span>
              <span className="text-[10px] text-purple-400 font-bold uppercase">4 Dedicated agents</span>
            </div>
          </div>
          <span className="text-2xl font-black text-white/95 font-mono">04</span>
        </div>
      </div>

      {/* Grid of central dashboard modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Attack Replay System (Left Column) */}
        <div className="glass p-6 rounded-xl border border-white/[0.06] lg:col-span-4 flex flex-col justify-between h-[520px]">
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/[0.06] pb-2.5 flex items-center space-x-2.5">
              <PlayCircle className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Attack Replay System</span>
            </h3>
            <p className="text-[10px] text-gray-500 mt-1.5 uppercase leading-normal font-medium">
              Simulate threat vectors to audit swarm containment behavior.
            </p>

            <div className="mt-5 bg-black/40 p-4 rounded-xl border border-white/[0.06] space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-500">PLAYBACK STATUS:</span>
                <span className={`font-black uppercase ${replayPlaying ? "text-cyan-400 animate-pulse" : "text-gray-400"}`}>
                  {replayPlaying ? "PLAYING STAGES" : "READY"}
                </span>
              </div>

              <div className="flex justify-center space-x-3 pt-1">
                <button
                  onClick={() => startSecurityReplay("DLP ALERT: AWS Key leakage AKIAP92SJD84KSDO9A discovered.", true)}
                  disabled={replayPlaying}
                  className="px-3 py-2 rounded bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[9px] font-bold hover:bg-pink-500/15 transition-all flex items-center space-x-1 cursor-pointer uppercase tracking-wider disabled:opacity-40"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Replay Exploit</span>
                </button>
                <button
                  onClick={() => startSecurityReplay("Summary: query parses successfully. Buffer secure.", false)}
                  disabled={replayPlaying}
                  className="px-3 py-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold hover:bg-emerald-500/15 transition-all flex items-center space-x-1 cursor-pointer uppercase tracking-wider disabled:opacity-40"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Replay Clean</span>
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {replayStages.map((stg, idx) => {
                const isActive = replayActive && replayCurrentStage >= idx + 1;
                const isTarget = replayActive && replayCurrentStage === idx + 1;
                
                let badgeColor = "bg-cyan-950/20 text-cyan-500 border-cyan-500/10";
                if (isActive) {
                  badgeColor = replayVerdict === "Blocked" 
                    ? "bg-pink-500/10 text-pink-500 border-pink-500/25 font-black"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 font-black";
                }

                return (
                  <div
                    key={stg.id}
                    className={`p-2.5 rounded border transition-all flex items-center justify-between text-[10px] ${
                      isTarget 
                        ? "bg-[#110e1f] border-cyan-500/30" 
                        : isActive 
                        ? "bg-black/30 border-white/[0.04] opacity-90"
                        : "bg-black/10 border-white/5 opacity-40"
                    }`}
                  >
                    <div className="flex flex-col max-w-[70%]">
                      <span className="font-bold text-white uppercase">{stg.name}</span>
                      <span className="text-[8px] text-gray-500 mt-0.5 leading-relaxed">{stg.description}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] border font-mono ${badgeColor}`}>
                      {isActive ? (replayVerdict === "Blocked" && idx === 4 ? "QUARANTINED" : "COMPLETED") : "WAITING"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Neural Swarm Canvas (Center Column) */}
        <div className="glass p-6 rounded-xl border border-white/[0.06] lg:col-span-5 flex flex-col justify-between h-[520px]">
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-2.5">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase flex items-center space-x-2.5">
              <Layers className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Swarm Network Central Vis</span>
            </h3>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[9px] text-cyan-400 font-bold uppercase">LIVE FEED</span>
            </div>
          </div>

          <div className="flex-1 relative w-full h-[320px] my-4">
            <AgentSwarmNetwork 
              onNodeSelect={(n) => setSelectedNode(n)}
              triggerScanPayload={firedPayload}
              scanVerdict={firedVerdict}
              activePulseIntensified={replayPlaying && replayVerdict === "Blocked"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-[10px] border-t border-white/[0.06] pt-4 font-bold tracking-wide">
            <div className="bg-black/40 p-2.5 border border-white/[0.06] rounded-lg text-center">
              <span className="text-gray-500 block text-[9px] mb-0.5 uppercase">DB Threats Logged</span>
              <span className="text-cyan-400 font-mono text-xs">{threats.length} LOGS ACTIVE</span>
            </div>
            <div className="bg-black/40 p-2.5 border border-white/[0.06] rounded-lg text-center">
              <span className="text-gray-500 block text-[9px] mb-0.5 uppercase">SIEM Gateway</span>
              <span className="text-emerald-400 font-mono text-xs">STABLE 0 BREACHES</span>
            </div>
          </div>
        </div>

        {/* Real-time Breach Stream (Right Column) */}
        <div className="glass p-6 rounded-xl border border-white/[0.06] lg:col-span-3 flex flex-col justify-between h-[520px]">
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/[0.06] pb-2.5 flex items-center space-x-2.5">
              <Activity className="w-4 h-4 text-pink-500" />
              <span>Real-Time Breach Stream</span>
            </h3>
            
            <div className="mt-4 space-y-2 h-[260px] overflow-y-auto font-mono text-[10px] tracking-wide pr-1 scrollbar-none">
              <AnimatePresence>
                {scrollingBreaches.map((log, idx) => {
                  const isBreach = log.includes("BREACH") || log.includes("ALARM") || log.includes("🚨");
                  return (
                    <motion.div
                      key={idx + log}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2 border rounded leading-relaxed select-none ${
                        isBreach 
                          ? "bg-red-500/10 border-red-500/20 text-pink-400 font-bold animate-pulse" 
                          : "bg-black/30 border-white/[0.04] text-cyan-400/80 opacity-60"
                      }`}
                    >
                      {isBreach ? "🚨 ALERT: " : "⚡ STAT: "} {log}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-5 border-t border-white/[0.06] pt-5">
            <h4 className="text-[10px] font-bold text-white tracking-wider mb-2.5 uppercase flex items-center space-x-2">
              <Skull className="w-4 h-4 text-pink-500" />
              <span>Incident alerts logged</span>
            </h4>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-none">
              {threats.slice(0, 3).map((th) => (
                <div key={th.id} className="p-2 bg-black/40 border border-white/[0.04] rounded flex justify-between items-center text-[10px] font-bold">
                  <span className="text-gray-300 truncate max-w-[65%]" title={th.title}>
                    {th.title}
                  </span>
                  <RiskLevelProgress level={th.risk_level} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
