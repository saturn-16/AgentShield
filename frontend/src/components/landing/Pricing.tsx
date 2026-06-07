import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export default function Pricing() {
  const tiers = [
    {
      name: "Starter Clearance",
      price: "$49",
      desc: "For small teams and developer sandbox environments.",
      features: [
        "Up to 5,000 scans / month",
        "Prompt Injection detection",
        "API secrets redacting",
        "Basic email support (24h SLA)",
        "Single workspace clearance"
      ],
      cta: "Provision Sandbox",
      highlight: false
    },
    {
      name: "Professional SOC",
      price: "$199",
      desc: "For active startups and production agent workflows.",
      features: [
        "Unlimited transaction scans",
        "Full 6-filter security suite",
        "Outbound URL reputation checks",
        "LangGraph swarm orchestrations",
        "Priority Slack support (2h SLA)",
        "3 workspace developer clearances"
      ],
      cta: "Deploy Production SOC",
      highlight: true
    },
    {
      name: "Enterprise Shield",
      price: "Custom",
      desc: "For scale enterprise fleets requesting complete governance.",
      features: [
        "Custom rule-bounding parameters",
        "Dedicated cloud containment clusters",
        "Strict on-premise configurations",
        "Dedicated security analyst support",
        "SSO, SAML & custom RBAC integrations",
        "Unlimited workspace clearances"
      ],
      cta: "Initiate Audit Consultation",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-6 md:px-12 border-t border-shield-border/40 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="text-[10px] font-bold tracking-widest text-shield-accent uppercase">Pricing Models</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-shield-text">Select Swarm Clearance Protection</h2>
        <p className="text-xs md:text-sm text-shield-text-muted leading-relaxed">
          Flexible, scalable price options engineered to secure autonomous agents from development sandbox to enterprise scale.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className={`glass p-8 rounded-xl flex flex-col justify-between h-[480px] border transition-all duration-300 ${
              tier.highlight
                ? "border-shield-accent bg-shield-surface glow-accent lg:scale-105"
                : "border-shield-border"
            }`}
          >
            <div className="space-y-6">
              <div>
                {tier.highlight && (
                  <span className="px-2.5 py-0.5 rounded bg-shield-accent/10 border border-shield-accent/20 text-shield-accent text-[9px] font-extrabold uppercase tracking-widest mb-3 inline-block">
                    Most Popular
                  </span>
                )}
                <h3 className="font-extrabold text-sm text-shield-text">{tier.name}</h3>
                <p className="text-[11px] text-shield-text-muted mt-1 leading-relaxed">{tier.desc}</p>
              </div>

              <div className="flex items-baseline">
                <span className="text-3xl font-extrabold text-shield-text">{tier.price}</span>
                {tier.price !== "Custom" && <span className="text-xs text-shield-text-muted ml-1">/ month</span>}
              </div>

              <ul className="space-y-2.5 text-xs text-shield-text/90">
                {tier.features.map((feat, fidx) => (
                  <li key={fidx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-shield-accent shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/register"
              className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                tier.highlight
                  ? "bg-shield-accent text-shield-bg hover:bg-shield-accent/90 border border-shield-accent/15"
                  : "bg-shield-surface border border-shield-border hover:border-shield-accent/30 text-shield-text"
              }`}
            >
              {tier.cta}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
