"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import TrustGauge from "@/components/charts/TrustGauge";
import { RefreshCw, ShieldCheck } from "lucide-react";

interface TrustData {
  score: number;
  factors: {
    prompt_safety: number;
    url_safety: number;
    leakage_risk: number;
    behavioral_risk: number;
  };
  risk_classification: string;
  trend: Array<{ score: number; created_at: string }>;
}

export default function TrustCenter() {
  const [data, setData] = useState<TrustData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const mockData: TrustData = {
    score: 88,
    factors: { prompt_safety: 85, url_safety: 90, leakage_risk: 95, behavioral_risk: 100 },
    risk_classification: "Low Risk",
    trend: [],
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await new Promise(r => setTimeout(r, 1200));
    setData({
      ...mockData,
      score: 85 + Math.floor(Math.random() * 12),
      factors: {
        prompt_safety: 80 + Math.floor(Math.random() * 18),
        url_safety: 85 + Math.floor(Math.random() * 14),
        leakage_risk: 90 + Math.floor(Math.random() * 9),
        behavioral_risk: 95 + Math.floor(Math.random() * 5),
      }
    });
    setIsRecalculating(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <PageHeader 
        title="Trust Center & Safety Compliance" 
        description="Verify compliance certificates, audit exfiltration mitigation ratings, and query active trust indices."
      />

      {isLoading || !data ? (
        <div className="glass p-20 rounded-xl border border-white/[0.06] flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Dial */}
          <div className="glass p-6 rounded-xl border border-white/[0.06] lg:col-span-5 flex flex-col items-center justify-between min-h-[420px] text-center">
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/[0.06] pb-2.5 w-full">
              Global Swarm Trust Index
            </h3>

            <div className="my-6">
              <TrustGauge score={data.score} size={220} />
            </div>

            <div className="space-y-4 w-full">
              <p className="text-[10px] text-gray-400 leading-relaxed max-w-xs mx-auto">
                Aggregated safety rating representing active guardrail node performance. A rating above 90% is recommended.
              </p>
              
              <button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? "animate-spin" : ""}`} />
                <span>{isRecalculating ? "Re-Auditing Swarms..." : "Recalculate Trust Index"}</span>
              </button>
            </div>
          </div>

          {/* Indicators list */}
          <div className="glass p-6 rounded-xl border border-white/[0.06] lg:col-span-7 flex flex-col justify-between min-h-[420px]">
            <div>
              <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/[0.06] pb-2.5">
                Primary Security Factors
              </h3>

              <div className="space-y-5 mt-6 font-mono text-[10px] font-bold">
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-gray-400">
                    <span className="uppercase">Prompt Injection Containment</span>
                    <span className="text-white">{data.factors.prompt_safety}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-[1000ms] ease-out"
                      style={{ width: `${data.factors.prompt_safety}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-gray-400">
                    <span className="uppercase">Outbound Link Sandboxing</span>
                    <span className="text-white">{data.factors.url_safety}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-400 transition-all duration-[1000ms] ease-out"
                      style={{ width: `${data.factors.url_safety}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-gray-400">
                    <span className="uppercase">DLP Cryptographic Obfuscation</span>
                    <span className="text-white">{data.factors.leakage_risk}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pink-500 transition-all duration-[1000ms] ease-out"
                      style={{ width: `${data.factors.leakage_risk}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-gray-400">
                    <span className="uppercase">Multi-Agent Autonomy Quarantine</span>
                    <span className="text-white">{data.factors.behavioral_risk}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-[1000ms] ease-out"
                      style={{ width: `${data.factors.behavioral_risk}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-4 mt-6 flex justify-between items-center text-[9px] text-gray-500 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Status classification: {data.risk_classification}</span>
              </div>
              <span>SOC Verifier v1.0.0</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}