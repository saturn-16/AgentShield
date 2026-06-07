import React from "react";
import { Shield, ShieldAlert, Globe, Activity, GitMerge, Lock } from "lucide-react";

export default function Features() {
  const items = [
    {
      title: "Prompt Injection Detection",
      desc: "Intercept instruction overrides, malicious roleplays, and system rules extraction attacks at the cognitive gateway.",
      icon: ShieldAlert,
      color: "text-red-400 bg-red-500/5 border-red-500/10"
    },
    {
      title: "Jailbreak Prevention Engine",
      desc: "Block complex cipher tricks, DAN personas, and obfuscated exploits dynamically before routing to cognitive agents.",
      icon: Shield,
      color: "text-shield-accent bg-shield-accent/5 border-shield-accent/10"
    },
    {
      title: "Outbound URL Reputation",
      desc: "Scrutinize outgoing tool hyperlinks for command and control (C2), mixed script homographs, and phishing indicators.",
      icon: Globe,
      color: "text-blue-400 bg-blue-500/5 border-blue-500/10"
    },
    {
      title: "Data Leakage Auto-Redactor",
      desc: "Detect passwords, private keys, database URIs, SSN, credit cards, and PII. Masks vulnerabilities instantly.",
      icon: Lock,
      color: "text-purple-400 bg-purple-500/5 border-purple-500/10"
    },
    {
      title: "Swarm Governance Metrics",
      desc: "Calculate dynamic, weighted corporate trust score metrics tracking prompt safety, domain integrations, and leakage events.",
      icon: Activity,
      color: "text-orange-400 bg-orange-500/5 border-orange-500/10"
    },
    {
      title: "Autonomous Agent Swarm",
      desc: "Deploy orchestrated 4-agent pipelines utilizing LangGraph workflows (Sentinel, Analyzer, Validator, Reporter).",
      icon: GitMerge,
      color: "text-indigo-400 bg-indigo-500/5 border-indigo-500/10"
    }
  ];

  return (
    <section id="features" className="py-20 px-6 md:px-12 border-t border-shield-border/40 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="text-[10px] font-bold tracking-widest text-shield-accent uppercase">Security Filters</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-shield-text">Enterprise-Grade Security for AI Agents</h2>
        <p className="text-xs md:text-sm text-shield-text-muted leading-relaxed">
          AgentShield AI deploys six specialized security filters to enforce strict bounds around autonomous agent executions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="glass glass-hover p-6 rounded-xl flex flex-col justify-between h-64 border border-shield-border"
            >
              <div className="space-y-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-shield-text">{item.title}</h3>
                <p className="text-xs text-shield-text-muted leading-relaxed">{item.desc}</p>
              </div>
              <div className="text-[9px] uppercase font-bold tracking-wider text-shield-text-muted mt-4">
                OWASP LLM SECURE FILTER
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
