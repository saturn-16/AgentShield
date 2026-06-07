"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { fetchAPI, ThreatLog } from "@/lib/api";
import { ShieldAlert, ChevronDown, ChevronUp, RefreshCw, CheckCircle2 } from "lucide-react";
import RiskLevelProgress from "@/components/RiskLevelProgress";

export default function ThreatMonitor() {
  const [events, setEvents] = useState<ThreatLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAPI.getThreats();
      setEvents(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDismiss = async (id: number) => {
    try {
      await fetchAPI.updateThreatStatus(id, "Dismissed");
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "Dismissed" } : e));
    } catch (e) {
      console.error(e);
    }
  };

  const getSeverityStyle = (risk: number) => {
    if (risk >= 10) return "text-pink-500 bg-pink-500/10 border-pink-500/20";
    if (risk >= 7) return "text-purple-400 bg-purple-500/10 border-purple-500/20";
    return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
  };

  const filteredEvents = events.filter(e => {
    if (severityFilter === "all") return true;
    if (severityFilter === "critical") return e.risk_level >= 10;
    if (severityFilter === "high") return e.risk_level >= 7 && e.risk_level < 10;
    return e.risk_level < 7;
  });

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <PageHeader 
        title="Real-Time Incident Stream" 
        description="Audit logged prompt injection vectors, data leakage blocks, and active sandbox containment files."
      />

      <div className="glass p-6 rounded-xl border border-white/[0.06] flex-1 flex flex-col space-y-4">
        
        <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
          <div className="flex gap-2">
            {(["all", "critical", "high", "medium"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSeverityFilter(filter)}
                className={`px-3 py-1.5 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  severityFilter === filter
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    : "bg-black/20 border-white/[0.06] text-gray-500 hover:text-white"
                }`}
              >
                {filter} Severity
              </button>
            ))}
          </div>

          <button
            onClick={fetchEvents}
            disabled={isLoading}
            className="p-2 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-gray-400 hover:text-white cursor-pointer disabled:opacity-40"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-mono text-xs uppercase">
            No threat logs recorded. System secure.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div 
                  key={item.id}
                  className={`border rounded-lg transition-all ${
                    isExpanded ? "bg-black/40 border-cyan-500/30" : "bg-black/20 border-white/[0.06] hover:border-white/[0.12]"
                  }`}
                >
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5 max-w-[70%]">
                      <ShieldAlert className={`w-5 h-5 shrink-0 ${item.risk_level >= 10 ? "text-pink-500" : "text-cyan-400"}`} />
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{item.title}</span>
                        <span className="text-[9px] text-gray-500 font-mono uppercase mt-0.5 block">{item.entity_label}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`px-2.5 py-0.5 rounded text-[8px] border font-mono font-bold uppercase ${getSeverityStyle(item.risk_level)}`}>
                        {item.category}
                      </span>
                      <RiskLevelProgress level={item.risk_level} />
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-white/[0.03] space-y-4 font-mono text-[10px] text-gray-300 leading-normal animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-gray-500 block uppercase">Triggering Identity</span>
                          <span className="text-white block bg-black/30 px-3 py-1.5 rounded border border-white/[0.04]">{item.entity}</span>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-gray-500 block uppercase">Telemetry Sources</span>
                          <div className="flex flex-wrap gap-1">
                            {item.data_sources.map(src => (
                              <span key={src} className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.04] text-white">
                                {src.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-gray-500 block uppercase">Status</span>
                          <span className={`font-bold ${item.status === "Open" ? "text-orange-400" : "text-emerald-400"}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-gray-500 block uppercase">Logged Timestamp</span>
                          <span className="text-white">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {item.status === "Open" && (
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => handleDismiss(item.id)}
                            className="px-4 py-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/15 transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Acknowledge & Dismiss</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}