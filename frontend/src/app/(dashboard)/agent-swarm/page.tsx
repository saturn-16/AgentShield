"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import AgentSwarmNetwork, { SwarmNode } from "@/components/AgentSwarmNetwork";
import { fetchAPI, SwarmSimulationResult, SwarmStep } from "@/lib/api";
import { 
  Bot, 
  Play, 
  Sparkles, 
  Terminal, 
  Shield, 
  AlertTriangle, 
  FileText, 
  CheckCircle,
  Activity,
  Cpu
} from "lucide-react";

export default function AgentSwarm() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "complete">("idle");
  const [selectedNode, setSelectedNode] = useState<SwarmNode | null>(null);
  const [simResult, setSimResult] = useState<SwarmSimulationResult | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  // Auto-scanning trigger references
  const [firedPayload, setFiredPayload] = useState<string | null>(null);
  const [firedVerdict, setFiredVerdict] = useState<"Blocked" | "Safe" | null>(null);

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setStatus("running");
    setFiredPayload(content);
    setFiredVerdict(null);
    setCurrentStep(0);
    setSimResult(null);

    try {
      const isAdversarial = content.toLowerCase().includes("ignore") || content.toLowerCase().includes("dan");
      const res = await fetchAPI.simulateSwarm(content);
      
      // Gradually step through simulation steps to make it look alive
      for (let i = 0; i < res.steps.length; i++) {
        await new Promise(r => setTimeout(r, 1200));
        setCurrentStep(i);
      }

      setFiredVerdict(isAdversarial ? "Blocked" : "Safe");
      setSimResult({
        ...res,
        status: isAdversarial ? "Threat Blocked" : "Safe",
        verdict: isAdversarial ? "Active Override Quarantine Applied" : "Cleared",
        score: isAdversarial ? 85 : 0
      });
      setStatus("complete");
    } catch (err) {
      console.error(err);
      setStatus("idle");
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <PageHeader 
        title="Agent Swarm Topology" 
        description="Monitor multi-agent execution paths, inspect active guards, and simulate coordinate sweeps."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Swarm Interactive Canvas & Telemetry (lg:col-span-8) */}
        <div className="lg:col-span-8 flex flex-col space-y-5">
          
          {/* Swarm Graph Panel */}
          <div className="glass p-5 rounded-xl border border-white/[0.06] flex-1 flex flex-col min-h-[380px]">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3 mb-4">
              <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Swarm Topology Canvas
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">Live Neural Mapping</span>
              </div>
            </div>

            <div className="flex-1 relative w-full h-[320px] bg-black/20 rounded-lg overflow-hidden border border-white/[0.04]">
              <AgentSwarmNetwork 
                onNodeSelect={(n) => setSelectedNode(n)}
                triggerScanPayload={firedPayload}
                scanVerdict={firedVerdict}
                activePulseIntensified={status === "running"}
              />
            </div>
          </div>

          {/* Simulation Console Input */}
          <div className="glass p-5 rounded-xl border border-white/[0.06]">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Swarm Execution Console</h3>
            <form onSubmit={handleRunSimulation} className="flex gap-3">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter payload prompt to scan across active swarm (e.g. ignore previous instructions...)"
                className="flex-1 bg-black/40 border border-white/[0.08] rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                disabled={status === "running"}
              />
              <button
                type="submit"
                disabled={status === "running" || !content.trim()}
                className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-colors uppercase tracking-wider"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Inject Swarm</span>
              </button>
            </form>
          </div>
        </div>

        {/* Swarm Telemetry Sidebar (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col space-y-5">
          
          {/* Target Node Telemetry */}
          <div className="glass p-5 rounded-xl border border-white/[0.06] flex-1 flex flex-col justify-between min-h-[200px]">
            <div>
              <h4 className="text-xs font-bold text-white tracking-wider border-b border-white/[0.06] pb-2.5 uppercase mb-4">
                🛰️ Swarm Node Telemetry
              </h4>

              {selectedNode ? (
                <div className="space-y-3 font-mono text-xs text-gray-300 leading-normal">
                  <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                    <span className="text-gray-500">Node ID:</span>
                    <span className="font-bold text-white text-[13px]">{selectedNode.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                    <span className="text-gray-500">Pipeline Role:</span>
                    <span className="font-bold text-gray-200">{selectedNode.role}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                    <span className="text-gray-500">Active State:</span>
                    <span className={`font-black uppercase ${
                      selectedNode.status === "Alert" ? "text-pink-500 animate-pulse" :
                      selectedNode.status === "Scanning" ? "text-orange-400 animate-pulse" : "text-emerald-400"
                    }`}>{selectedNode.status}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.03] pb-1.5">
                    <span className="text-gray-500">Safety Index:</span>
                    <span className="font-bold text-white">{selectedNode.safety_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Uptime:</span>
                    <span className="font-bold text-cyan-400">{selectedNode.uptime}</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-10">
                  <Cpu className="w-8 h-8 text-white/10 mb-2" />
                  <p className="text-[10px] leading-relaxed max-w-[200px] uppercase font-bold">
                    Click any floating bubble node in the central canvas graph to pull active socket parameters.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] pt-3 text-[9px] text-gray-500 font-bold uppercase tracking-wider flex justify-between mt-4">
              <span>IAM: MATCHED</span>
              <span>BUF LOAD: 0.15%</span>
            </div>
          </div>

          {/* Execution Trace list */}
          <div className="glass p-5 rounded-xl border border-white/[0.06] min-h-[250px] flex flex-col">
            <h4 className="text-xs font-bold text-white tracking-wider border-b border-white/[0.06] pb-2.5 uppercase mb-4 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Live Execution Trace
            </h4>

            {status === "idle" && (
              <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-500 py-8">
                <FileText className="w-8 h-8 text-white/10 mb-2" />
                <p className="text-[10px] uppercase font-bold">Awaiting swarm console injection...</p>
              </div>
            )}

            {(status === "running" || status === "complete") && simResult && (
              <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                {simResult.steps.map((step, idx) => {
                  const isChecked = currentStep >= idx;
                  const isCurrent = currentStep === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded border transition-all text-[10px] font-mono leading-relaxed ${
                        isCurrent 
                          ? "bg-cyan-500/10 border-cyan-500/30 text-white" 
                          : isChecked 
                          ? "bg-black/30 border-white/[0.04] text-gray-300 opacity-80" 
                          : "opacity-25"
                      }`}
                    >
                      <div className="flex justify-between font-bold uppercase mb-1">
                        <span className={isCurrent ? "text-cyan-400" : "text-gray-400"}>{step.agent}</span>
                        <span className="text-gray-600">{step.timestamp}</span>
                      </div>
                      <p>{step.message}</p>
                    </div>
                  );
                })}

                {status === "complete" && (
                  <div className="p-3 rounded bg-black/40 border border-white/[0.06] text-[10px] space-y-1.5 animate-fade-in font-mono mt-2">
                    <div className="flex justify-between border-b border-white/[0.04] pb-1 font-bold">
                      <span className="text-gray-500">SWARM VERDICT:</span>
                      <span className={simResult.status === "Safe" ? "text-emerald-400" : "text-pink-500 font-black animate-pulse"}>
                        {simResult.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">EXPLANATION:</span>
                      <span className="text-gray-300 block mt-0.5 leading-normal">{simResult.verdict}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}