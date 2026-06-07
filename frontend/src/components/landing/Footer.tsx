import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 border-t border-shield-border/40 px-6 md:px-12 bg-shield-surface/20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-shield-accent/10 flex items-center justify-center border border-shield-accent/30">
            <Shield className="w-5 h-5 text-shield-accent" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-gradient">AgentShield AI</span>
        </div>

        {}
        <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold uppercase tracking-wider text-shield-text-muted">
          <a href="#features" className="hover:text-shield-accent transition-colors">Features</a>
          <a href="#architecture" className="hover:text-shield-accent transition-colors">Swarm Pipeline</a>
          <a href="#pricing" className="hover:text-shield-accent transition-colors">Pricing Plans</a>
          <a href="#faq" className="hover:text-shield-accent transition-colors">FAQ</a>
        </div>

        <div className="text-[10px] text-shield-text-muted">
          © {new Date().getFullYear()} AgentShield AI Inc. Security Operations Center. All clearance rights reserved.
        </div>
      </div>
    </footer>
  );
}
