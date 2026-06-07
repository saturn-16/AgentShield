import React from "react";
import { Shield, Bot, AlertTriangle, FileText, ArrowRight } from "lucide-react";

export default function Architecture() {
  const steps = [
    {
      id: "sentinel",
      name: "Sentinel Agent",
      desc: "Swift Input Classification",
      longDesc: "Scans raw payloads for instruction overrides, filters out standard inputs, and resolves execution paths.",
      icon: Shield,
      color: "border-shield-accent/40 text-shield-accent"
    },
    {
      id: "analyzer",
      name: "Analyzer Agent",
      desc: "Deep Security Audit",
      longDesc: "Performs full regex analysis of credential leakages and checks outbound domains for reputation flags.",
      icon: Bot,
      color: "border-blue-500/40 text-blue-400"
    },
    {
      id: "validator",
      name: "Validator Agent",
      desc: "Anomalies Cross-Verification",
      longDesc: "Cross-checks Sentinel alerts against deep audits, preventing false positives with weighted models.",
      icon: AlertTriangle,
      color: "border-orange-500/40 text-orange-400"
    },
    {
      id: "reporter",
      name: "Reporter Agent",
      desc: "Action Directive Compilation",
      longDesc: "Compiles all findings and issues structured, publication-grade markdown directives for immediate containment.",
      icon: FileText,
      color: "border-purple-500/40 text-purple-400"
    }
  ];

  return (
    <section id="architecture" className="py-20 px-6 md:px-12 border-t border-shield-border/40 bg-shield-surface/10 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="text-[10px] font-bold tracking-widest text-shield-accent uppercase"> Swarm Architecture</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-shield-text">Autonomous Multi-Agent Security Pipeline</h2>
        <p className="text-xs md:text-sm text-shield-text-muted leading-relaxed">
          AgentShield AI runs on a coordinated 4-agent LangGraph workflow, bringing expert analysis to every transaction.
        </p>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative flex flex-col items-center">
              {}
              {idx < 3 && (
                <div className="hidden md:block absolute top-[28%] -right-3 z-20 text-shield-border-light">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}

              {}
              <div className="glass p-6 rounded-xl border border-shield-border flex flex-col items-center text-center w-full h-72 justify-between">
                <div className="space-y-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 bg-shield-surface ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-shield-text">{step.name}</h3>
                    <span className="text-[9px] text-shield-accent font-semibold tracking-wider uppercase mt-1 block">
                      {step.desc}
                    </span>
                  </div>
                  <p className="text-[11px] text-shield-text-muted leading-relaxed">{step.longDesc}</p>
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-shield-text-muted/60 mt-4">
                  Step 0{idx + 1} Swarm Node
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
