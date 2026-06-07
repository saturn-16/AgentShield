"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: "What types of AI threats does AgentShield detect?",
      a: "AgentShield AI scans instruction payloads for indirect prompt injections, jailbreak overrides, DAN roleplays, cipher bypass obfuscations, credential leak disclosures (AWS keys, passwords), and outbound remote destination safety checkpoints."
    },
    {
      q: "How does the multi-agent security swarm operate?",
      a: "Our swarm is coordinated via a structured 4-agent LangGraph pipeline: Sentinel Agent handles initial routing classification, Analyzer Agent audits leakages and URL reputations, Validator Agent cross-verifies metrics to reduce false positives, and Reporter Agent compiles final Markdown compliance directives."
    },
    {
      q: "Can I integrate AgentShield with my cognitive frameworks?",
      a: "Yes! Using our Developer API Key, you can execute a secure bearer token HTTP post request to scan instruction payload strings. Our scans are optimized to process in less than 100ms."
    },
    {
      q: "What is your threat detection precision rate?",
      a: "By combining compiled rule-based regex parsers with expert agent cross-verifications, our platform achieves a verified 99.7% detection accuracy on all standard OWASP LLM Top 10 vulnerabilities lists."
    },
    {
      q: "Is corporate proprietary data secure in scans?",
      a: "Absolutely. Our platform is engineered to strip and auto-mask credentials on local sandboxes. We never store raw prompts unless requested, and fully support isolated Docker deployment configurations."
    },
    {
      q: "Do you offer sandbox clearances for testing?",
      a: "Yes. Our Starter Sandbox tier allows developers to register and immediately process up to 5,000 transaction scans / month for free, with standard rule sets."
    }
  ];

  const handleToggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 px-6 md:px-12 border-t border-shield-border/40 max-w-4xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="text-[10px] font-bold tracking-widest text-shield-accent uppercase">FAQ Directory</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-shield-text">Frequently Asked Questions</h2>
        <p className="text-xs md:text-sm text-shield-text-muted leading-relaxed">
          Everything you need to know about secure cognitive orchestration, threat redaction, and compliance standards.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="glass p-5 rounded-xl border border-shield-border transition-colors hover:bg-shield-surface/60"
            >
              <div
                onClick={() => handleToggle(idx)}
                className="flex items-center justify-between gap-4 cursor-pointer"
              >
                <h4 className="text-xs md:text-sm font-bold text-shield-text">{faq.q}</h4>
                <button className="text-shield-text-muted hover:text-shield-text">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              
              {isOpen && (
                <div className="mt-3.5 pt-3.5 border-t border-shield-border/50 text-xs text-shield-text-muted leading-relaxed animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
