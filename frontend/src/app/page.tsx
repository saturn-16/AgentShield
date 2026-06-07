"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  Shield, Globe, Activity, Terminal, Layers, FileText,
  ArrowRight, Sparkles, Play, ArrowUpRight,
  ShieldCheck, Bot, ShieldAlert, Cpu, Lock, Zap, Eye,
  AlertTriangle, CheckCircle, XCircle, Search, Network
} from "lucide-react";

function Section({
  children,
  className = "",
  id
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`section-reveal relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden ${className}`}
    >
      {children}
    </section>
  );
}

function InfoCard({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="border-l-2 border-shield-accent/40 bg-white/[0.02] rounded-r-xl p-5 hover:bg-white/[0.04] transition-colors">
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-shield-accent">{label}</span>
      <p className="text-sm text-white/50 mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sections = document.querySelectorAll(".section-reveal");
    sections.forEach((section) => {
      const headings = section.querySelectorAll(".section-heading");
      const subtitles = section.querySelectorAll(".section-subtitle");
      const bodies = section.querySelectorAll(".section-body");
      const visuals = section.querySelectorAll(".section-visual");

      gsap.fromTo(
        headings,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none reverse" },
        }
      );

      gsap.fromTo(
        subtitles,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 75%", toggleActions: "play none none reverse" },
        }
      );

      gsap.fromTo(
        bodies,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none reverse" },
        }
      );

      gsap.fromTo(
        visuals,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1, scale: 1, duration: 1.2, delay: 0.3, ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 75%", toggleActions: "play none none reverse" },
        }
      );
    });

    if (lineRef.current) {
      gsap.fromTo(
        lineRef.current,
        { top: "0%" },
        { top: "100%", duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" }
      );
    }

    const heroEls = document.querySelectorAll(".hero-animate");
    gsap.fromTo(
      heroEls,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: "power3.out" }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const navLinks = [
    { name: "OVERVIEW", href: "#hero" },
    { name: "THE PROBLEM", href: "#problem" },
    { name: "PROMPT SCANNER", href: "#prompt-scanner" },
    { name: "URL SCANNER", href: "#url-scanner" },
    { name: "TRUST ENGINE", href: "#trust-engine" },
    { name: "THREAT MONITOR", href: "#threat-monitor" },
    { name: "AGENT SWARM", href: "#agent-swarm" },
    { name: "REPORTS", href: "#reports" },
    { name: "WORKSPACE", href: "#workspace" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen text-gray-200 relative font-sans overflow-x-hidden select-none bg-[#0a0a0f]">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-shield-accent/10 flex items-center justify-center border border-shield-accent/30">
            <Shield className="w-4 h-4 text-shield-accent" />
          </div>
          <span className="font-black text-sm tracking-tight text-white uppercase">AgentShield</span>
          <span className="text-[9px] font-bold text-shield-text-muted uppercase tracking-widest">Overview</span>
        </Link>
        <div className="hidden xl:flex items-center gap-5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/40">
          {navLinks.slice(1).map((link) => (
            <a key={link.name} href={link.href} className="hover:text-shield-accent transition-colors whitespace-nowrap">
              {link.name}
            </a>
          ))}
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-lg bg-shield-accent hover:bg-shield-accent/90 text-[#0a0a0f] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors shrink-0"
        >
          Launch Console
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </nav>

      <div className="relative z-10 w-full flex flex-col items-center">

        {/* ═══════════════════ HERO ═══════════════════ */}
        <Section id="hero">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]">
            <div ref={lineRef} className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#00F0FF]" />
          </div>

          <div className="hero-animate inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-shield-accent/20 bg-shield-accent/[0.06] mb-10 mt-24">
            <Sparkles className="w-3.5 h-3.5 text-shield-accent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-shield-accent">Enterprise AI Agent Security Platform</span>
          </div>

          <div className="relative w-full max-w-6xl mx-auto px-6">
            <div className="hero-animate relative flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center gap-0 select-none">
                <h1 className="text-[clamp(3rem,11vw,10rem)] font-black tracking-tighter leading-none text-white/[0.06] uppercase">AGENT</h1>

                <div className="relative mx-[-2vw] flex items-center justify-center z-10" style={{ width: "clamp(160px, 22vw, 280px)", height: "clamp(160px, 22vw, 280px)" }}>
                  <svg viewBox="0 0 400 400" className="w-full h-full" style={{ animation: "spin 30s linear infinite" }}>
                    <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(52,211,153,0.06)" strokeWidth="1" strokeDasharray="4 8" />
                    <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(52,211,153,0.08)" strokeWidth="1" strokeDasharray="2 6" />
                    <circle cx="200" cy="200" r="80" fill="none" stroke="rgba(52,211,153,0.1)" strokeWidth="1" />
                    <ellipse cx="200" cy="200" rx="140" ry="60" fill="none" stroke="rgba(52,211,153,0.12)" strokeWidth="0.8" transform="rotate(25, 200, 200)" />
                    <ellipse cx="200" cy="200" rx="140" ry="60" fill="none" stroke="rgba(52,211,153,0.08)" strokeWidth="0.8" transform="rotate(-30, 200, 200)" />
                    <ellipse cx="200" cy="200" rx="130" ry="50" fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="0.8" transform="rotate(60, 200, 200)" />
                    <circle cx="200" cy="200" r="25" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
                    <path d="M 200 185 L 212 192 L 212 205 Q 212 212 200 218 Q 188 212 188 205 L 188 192 Z" fill="none" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  <div className="absolute inset-0 rounded-full shadow-[0_0_60px_rgba(52,211,153,0.12),0_0_120px_rgba(52,211,153,0.05)]" />
                  <div className="absolute inset-[-20px] rounded-full" style={{ animation: "spin 8s linear infinite" }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  </div>
                  <div className="absolute inset-[-30px] rounded-full" style={{ animation: "spin 12s linear infinite reverse" }}>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
                  </div>
                </div>

                <h1 className="text-[clamp(3rem,11vw,10rem)] font-black tracking-tighter leading-none text-white/[0.06] uppercase">HIELD</h1>
              </div>

              <h1 className="hero-animate text-[clamp(3rem,11vw,10rem)] font-black tracking-tighter leading-none text-white/[0.06] uppercase -mt-4 md:-mt-8">AI</h1>

              <div className="absolute left-4 top-1/2 -translate-y-1/2 max-w-[220px] glass p-4 rounded-xl hidden lg:block">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-shield-accent">// Paradigm</span>
                <p className="text-[11px] text-white/50 mt-2 leading-relaxed">Combining AI-driven threat detection with multi-agent consensus to secure autonomous systems.</p>
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 max-w-[220px] glass p-4 rounded-xl hidden lg:block">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-shield-accent">// Focus Matrix</span>
                <p className="text-[11px] text-white/50 mt-2 leading-relaxed">Prompt injection defense, URL threat analysis, trust scoring, and LangGraph swarm orchestration.</p>
              </div>
            </div>

            <div className="hero-animate text-center mt-8 max-w-2xl mx-auto">
              <p className="text-sm md:text-base text-white/35 leading-relaxed italic">
                Securing Autonomous AI Agents for the Agentic Future — real-time prompt injection defense, data leakage prevention, and multi-agent swarm orchestration.
              </p>
            </div>

            <div className="hero-animate flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <a href="#overview" className="px-6 py-3.5 rounded-lg bg-shield-accent hover:bg-shield-accent/90 text-[#0a0a0f] text-[11px] font-black flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wider justify-center">
                <Play className="w-3.5 h-3.5 fill-current" />
                Explore How It Works
              </a>
              <Link href="/dashboard" className="px-6 py-3.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white text-[11px] font-bold flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wider justify-center">
                Launch Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Section>

        {/* ═══════════════════ SCENE 01 — OVERVIEW (Orbital Architecture) ═══════════════════ */}
        <Section id="overview">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-shield-accent/[0.02] blur-[150px]" />
          </div>
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="section-heading space-y-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-shield-accent bg-shield-accent/[0.08] border border-shield-accent/10 px-3 py-1 rounded-full">
                  Scene 01 — Overview
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  The <span className="text-shield-accent">AgentShield</span> Platform
                </h2>
              </div>
              <p className="section-subtitle text-base text-white/40 leading-relaxed">
                An autonomous Security Operations Center (AI-SOC) that intercepts, audits, and sandboxes AI agent activity to ensure alignment, secure data boundaries, and safe integrations.
              </p>
              <div className="section-body space-y-4">
                <InfoCard label="What it is" desc="A real-time isolation gate and validator firewall that monitors and controls autonomous agent activity before it reaches production systems." />
                <InfoCard label="Why it exists" desc="AI agents execute dynamic API calls and database queries without human approval, creating severe data exfiltration vulnerabilities." />
                <InfoCard label="How it works" desc="Monitors the entire input-to-output pipeline — analyzing prompts, outbound URLs, credential exposures, and multi-agent communication." />
                <InfoCard label="What it solves" desc="Eliminates excessive agency exploits, prompt manipulation vectors, and dynamic phishing attacks on AI systems." />
              </div>
            </div>
            <div className="section-visual flex items-center justify-center">
              <div className="relative w-[380px] h-[380px]">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  <circle cx="200" cy="200" r="140" fill="none" stroke="rgba(52,211,153,0.08)" strokeWidth="1" strokeDasharray="4 6" />
                  <circle cx="200" cy="200" r="100" fill="none" stroke="rgba(52,211,153,0.06)" strokeWidth="1" />
                  <circle cx="200" cy="200" r="45" fill="rgba(52,211,153,0.04)" stroke="rgba(52,211,153,0.25)" strokeWidth="2" />
                  <text x="200" y="195" textAnchor="middle" fontSize="11" fontWeight="900" fill="rgba(52,211,153,0.9)" letterSpacing="1">AGENT</text>
                  <text x="200" y="212" textAnchor="middle" fontSize="11" fontWeight="900" fill="rgba(52,211,153,0.9)" letterSpacing="1">SHIELD</text>

                  {[
                    { angle: -90, label: "Prompt", sub: "Scanner", color: "52,211,153" },
                    { angle: -30, label: "URL", sub: "Firewall", color: "52,211,153" },
                    { angle: 30, label: "Trust", sub: "Engine", color: "52,211,153" },
                    { angle: 90, label: "Threat", sub: "Monitor", color: "52,211,153" },
                    { angle: 150, label: "Agent", sub: "Swarm", color: "52,211,153" },
                    { angle: 210, label: "Compliance", sub: "Reports", color: "52,211,153" },
                  ].map((node, i) => {
                    const rad = (node.angle * Math.PI) / 180;
                    const cx = 200 + Math.cos(rad) * 140;
                    const cy = 200 + Math.sin(rad) * 140;
                    const lx = 200 + Math.cos(rad) * 105;
                    const ly = 200 + Math.sin(rad) * 105;
                    return (
                      <g key={i}>
                        <line x1={lx} y1={ly} x2={cx} y2={cy} stroke={`rgba(${node.color},0.15)`} strokeWidth="1" strokeDasharray="3 4" />
                        <circle cx={cx} cy={cy} r="8" fill={`rgba(${node.color},0.08)`} stroke={`rgba(${node.color},0.4)`} strokeWidth="1.5" />
                        <circle cx={cx} cy={cy} r="3" fill={`rgba(${node.color},0.6)`}>
                          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                        </circle>
                        <text x={cx} y={cy - 16} textAnchor="middle" fontSize="9" fontWeight="bold" fill="rgba(255,255,255,0.6)">{node.label}</text>
                        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.35)">{node.sub}</text>
                      </g>
                    );
                  })}

                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const a1 = (-90 + i * 60) * Math.PI / 180;
                    const a2 = (-90 + (i + 1) * 60) * Math.PI / 180;
                    const x1 = 200 + Math.cos(a1) * 140;
                    const y1 = 200 + Math.sin(a1) * 140;
                    const x2 = 200 + Math.cos(a2) * 140;
                    const y2 = 200 + Math.sin(a2) * 140;
                    return (
                      <line key={`conn-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(52,211,153,0.06)" strokeWidth="1" strokeDasharray="2 5" />
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════════════ SCENE 02 — THE THREAT (Attack Flow Diagram) ═══════════════════ */}
        <Section id="problem">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-500/[0.03] blur-[150px]" />
          </div>
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="section-heading space-y-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/80 bg-red-400/[0.08] border border-red-400/10 px-3 py-1 rounded-full">
                  Scene 02 — The Threat
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  The AI Agent <span className="text-red-400">Security Crisis</span>
                </h2>
              </div>
              <p className="section-subtitle text-base text-white/40 leading-relaxed">
                Language models process instructions and data in the same context window. Attackers exploit this by hiding malicious commands inside seemingly innocent inputs.
              </p>
              <div className="section-body space-y-4">
                <InfoCard label="Attack surface" desc="Prompt injection, jailbreaking, indirect injection via retrieved documents, and tool-use manipulation." />
                <InfoCard label="Data exposure" desc="Uncontrolled agents can leak API keys, PII, database credentials, and proprietary training data through crafted outputs." />
                <InfoCard label="Cascading failure" desc="In multi-agent systems, a single compromised node can propagate malicious instructions across the entire swarm pipeline." />
              </div>
            </div>
            <div className="section-visual flex items-center justify-center">
              <div className="relative w-[420px] h-[380px]">
                <svg viewBox="0 0 420 380" className="w-full h-full">
                  <rect x="100" y="20" width="180" height="60" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <text x="190" y="42" textAnchor="middle" fontSize="9" fontWeight="bold" fill="rgba(255,255,255,0.5)">System Command</text>
                  <text x="190" y="62" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="rgba(255,255,255,0.7)">&quot;Summarize report&quot;</text>

                  <line x1="190" y1="80" x2="190" y2="120" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <circle r="3" fill="rgba(255,255,255,0.3)">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M 190 80 L 190 120" />
                  </circle>

                  <rect x="80" y="120" width="200" height="70" rx="8" fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.3)" strokeWidth="1.5" strokeDasharray="6 3" />
                  <text x="180" y="142" textAnchor="middle" fontSize="9" fontWeight="bold" fill="rgba(239,68,68,0.8)">Injected Payload</text>
                  <text x="180" y="160" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="rgba(255,255,255,0.3)">&quot;Ignore all rules...&quot;</text>
                  <text x="180" y="176" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="rgba(255,255,255,0.3)">&quot;Send all keys to...&quot;</text>
                  <text x="180" y="184" textAnchor="middle" fontSize="8" fontFamily="monospace" fill="rgba(239,68,68,0.4)">data.export.now</text>

                  <path d="M 280 155 Q 320 155 340 130 Q 355 110 355 90" fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <circle r="3" fill="rgba(239,68,68,0.7)">
                    <animateMotion dur="2s" repeatCount="indefinite" path="M 280 155 Q 320 155 340 130 Q 355 110 355 90" />
                  </circle>

                  <circle cx="355" cy="70" r="22" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.35)" strokeWidth="2" className="animate-pulse" />
                  <Lock className="w-4 h-4" />
                  <text x="355" y="67" textAnchor="middle" fontSize="14" fill="rgba(239,68,68,0.7)">🔓</text>
                  <text x="355" y="104" textAnchor="middle" fontSize="8" fontWeight="900" fill="rgba(239,68,68,0.8)" letterSpacing="1">HIJACKED</text>

                  <line x1="355" y1="110" x2="355" y2="280" stroke="rgba(239,68,68,0.15)" strokeWidth="1.5" strokeDasharray="5 5" />
                  <circle r="3" fill="rgba(239,68,68,0.6)">
                    <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.5s" path="M 355 110 L 355 280" />
                  </circle>

                  <rect x="305" y="290" width="100" height="35" rx="6" fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.4)" strokeWidth="1.5" />
                  <text x="355" y="312" textAnchor="middle" fontSize="8" fontWeight="900" fill="rgba(239,68,68,0.9)" letterSpacing="1">DATA EXFILTRATED</text>
                </svg>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════════════ SCENE 03 — PROMPT SCANNER (Scanner/Quarantine SVG) ═══════════════════ */}
        <Section id="prompt-scanner">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[150px]" />
          </div>
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="section-heading space-y-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/70 bg-emerald-400/[0.08] border border-emerald-400/10 px-3 py-1 rounded-full">
                  Scene 03 — Prompt Scanner
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  <span className="text-shield-accent">Injection</span> Interceptor
                </h2>
              </div>
              <p className="section-subtitle text-base text-white/40 leading-relaxed">
                Real-time inspection and sanitization of user prompts. Every input is analyzed for jailbreak patterns, DAN exploits, roleplay bypasses, and system instruction overrides before it reaches the LLM.
              </p>

              <div className="section-visual flex items-center justify-center lg:hidden">
                <ScannerDiagram />
              </div>

              <div className="section-body space-y-4">
                <InfoCard label="What it is" desc="A cognitive input sanitizer that checks dynamic text blocks for adversarial jailbreak attempts in real-time." />
                <InfoCard label="Why it exists" desc="To intercept prompt injections and malicious instruction overrides at the input stage, before they reach downstream LLMs." />
                <InfoCard label="How it works" desc="Evaluates character streams against known jailbreak patterns, roleplay bypasses, system stripping requests, and evasion formats." />
                <InfoCard label="What it solves" desc="Prevents DAN attacks, instruction override exploits, and encoded payload injections from compromising agent behavior." />
              </div>
            </div>
            <div className="section-visual hidden lg:flex items-center justify-center">
              <ScannerDiagram />
            </div>
          </div>
        </Section>

        {/* ═══════════════════ SCENE 04 — URL SCANNER ═══════════════════ */}
        <Section id="url-scanner">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] blur-[150px]" />
          </div>
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="section-visual flex items-center justify-center">
              <div className="relative w-[380px] h-[340px]">
                <svg viewBox="0 0 380 340" className="w-full h-full">
                  <rect x="120" y="10" width="140" height="40" rx="6" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" />
                  <text x="190" y="35" textAnchor="middle" fontSize="9" fontWeight="900" fill="rgba(6,182,212,0.9)" letterSpacing="2">URL GATEWAY</text>

                  <line x1="190" y1="50" x2="190" y2="90" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />
                  <circle r="3" fill="rgba(6,182,212,0.6)">
                    <animateMotion dur="1s" repeatCount="indefinite" path="M 190 50 L 190 90" />
                  </circle>

                  <rect x="80" y="90" width="220" height="120" rx="8" fill="rgba(6,182,212,0.02)" stroke="rgba(6,182,212,0.2)" strokeWidth="1.5" strokeDasharray="8 4" />
                  <text x="190" y="110" textAnchor="middle" fontSize="8" fontWeight="bold" fill="rgba(6,182,212,0.5)">REPUTATION ENGINE</text>

                  {[
                    { y: 130, url: "api.openai.com", safe: true },
                    { y: 155, url: "malware-c2.dark.ru", safe: false },
                    { y: 180, url: "github.com/api/v3", safe: true },
                  ].map((item, i) => (
                    <g key={i}>
                      <text x="110" y={item.y + 4} fontSize="8" fontFamily="monospace" fill="rgba(255,255,255,0.35)">{item.url}</text>
                      <circle cx="270" cy={item.y} r="4" fill={item.safe ? "rgba(52,211,153,0.6)" : "rgba(239,68,68,0.6)"}>
                        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                      </circle>
                      <text x="282" y={item.y + 3} fontSize="7" fontWeight="bold" fill={item.safe ? "rgba(52,211,153,0.8)" : "rgba(239,68,68,0.8)"}>{item.safe ? "PASS" : "BLOCK"}</text>
                    </g>
                  ))}

                  <line x1="100" y1="210" x2="100" y2="260" stroke="rgba(52,211,153,0.15)" strokeWidth="1" />
                  <rect x="40" y="260" width="120" height="35" rx="6" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.3)" strokeWidth="1.5" />
                  <text x="100" y="282" textAnchor="middle" fontSize="8" fontWeight="900" fill="rgba(52,211,153,0.9)">✓ ALLOWED</text>

                  <line x1="280" y1="210" x2="280" y2="260" stroke="rgba(239,68,68,0.15)" strokeWidth="1" strokeDasharray="4 4" />
                  <circle r="3" fill="rgba(239,68,68,0.5)">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M 280 210 L 280 260" />
                  </circle>
                  <rect x="220" y="260" width="120" height="35" rx="6" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.3)" strokeWidth="1.5" />
                  <text x="280" y="282" textAnchor="middle" fontSize="8" fontWeight="900" fill="rgba(239,68,68,0.9)">✗ BLOCKED</text>
                </svg>
              </div>
            </div>
            <div className="space-y-6">
              <div className="section-heading space-y-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400/70 bg-cyan-400/[0.08] border border-cyan-400/10 px-3 py-1 rounded-full">
                  Scene 04 — URL Scanner
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  <span className="text-cyan-400">Egress</span> Firewall
                </h2>
              </div>
              <p className="section-subtitle text-base text-white/40 leading-relaxed">
                Real-time outbound HTTP reputation analysis. Every URL your agents attempt to access is scanned against threat intelligence feeds, domain reputation databases, and behavioral heuristics.
              </p>
              <div className="section-body space-y-4">
                <InfoCard label="What it is" desc="An outbound URL inspection gateway that validates every HTTP egress request from your AI agents against 40+ threat intelligence feeds." />
                <InfoCard label="Why it exists" desc="Compromised agents may attempt to contact command-and-control servers, exfiltrate data, or load malicious payloads from untrusted domains." />
                <InfoCard label="How it works" desc="Cross-references domain reputation, certificate transparency logs, WHOIS age, and real-time content inspection for malicious indicators." />
                <InfoCard label="What it solves" desc="Prevents data exfiltration, C2 callbacks, and malicious payload downloads by enforcing real-time egress policy controls." />
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════════════ SCENE 05 — TRUST ENGINE ═══════════════════ */}
        <Section id="trust-engine">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/[0.03] blur-[150px]" />
          </div>
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 lg:order-2">
              <div className="section-heading space-y-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400/70 bg-violet-400/[0.08] border border-violet-400/10 px-3 py-1 rounded-full">
                  Scene 05 — Risk Posture
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  <span className="text-violet-400">Trust</span> Engine
                </h2>
              </div>
              <p className="section-subtitle text-base text-white/40 leading-relaxed">
                Translates complex, real-time security events into a single composite AI Trust Posture Index — a quantitative safety metric for enterprise compliance.
              </p>
              <div className="section-body space-y-4">
                <InfoCard label="What it is" desc="A central scoring matrix that aggregates multiple agent safety vectors into one unified trust score." />
                <InfoCard label="Why it exists" desc="Enterprise compliance leaders require a measurable, standardized safety score to verify AI application postures." />
                <InfoCard label="How it works" desc="Weighs incident counts, prompt scanner blocks, credential exclusions, URL firewall indicators, and behavioral anomalies." />
                <InfoCard label="What it solves" desc="Eliminates compliance blindspots, establishing quantitative metrics for continuous AI safety auditing." />
              </div>
            </div>
            <div className="section-visual flex items-center justify-center lg:order-1">
              <div className="relative w-[280px] h-[280px]">
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  <defs>
                    <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(139,92,246,0.3)" />
                      <stop offset="100%" stopColor="rgba(52,211,153,0.3)" />
                    </linearGradient>
                  </defs>
                  <circle cx="150" cy="150" r="120" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="20" />
                  <circle cx="150" cy="150" r="120" fill="none" stroke="url(#trustGrad)" strokeWidth="20" strokeLinecap="round" strokeDasharray="628" strokeDashoffset="125" transform="rotate(-90, 150, 150)" />
                  <text x="150" y="140" textAnchor="middle" fontSize="48" fontWeight="900" fill="white">84</text>
                  <text x="150" y="168" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgba(255,255,255,0.4)" letterSpacing="3">TRUST INDEX</text>
                  <text x="150" y="190" textAnchor="middle" fontSize="9" fill="rgba(139,92,246,0.7)">● HEALTHY POSTURE</text>
                </svg>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════════════ SCENE 06 — THREAT MONITOR ═══════════════════ */}
        <Section id="threat-monitor">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 right-1/3 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-orange-500/[0.03] blur-[150px]" />
          </div>
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="section-visual flex items-center justify-center">
              <div className="glass p-6 rounded-2xl w-full max-w-[400px] space-y-3">
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Live Threat Feed</span>
                </div>
                {[
                  { time: "2s ago", type: "Prompt Override", severity: "CRITICAL", color: "text-red-400 border-red-400/20 bg-red-400/10" },
                  { time: "14s ago", type: "DAN Jailbreak v4.2", severity: "HIGH", color: "text-orange-400 border-orange-400/20 bg-orange-400/10" },
                  { time: "1m ago", type: "Encoded Payload (Base64)", severity: "MEDIUM", color: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10" },
                  { time: "3m ago", type: "Malicious URL Egress", severity: "HIGH", color: "text-orange-400 border-orange-400/20 bg-orange-400/10" },
                  { time: "8m ago", type: "PII Leakage Attempt", severity: "CRITICAL", color: "text-red-400 border-red-400/20 bg-red-400/10" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-white/[0.04]">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-white truncate">{item.type}</p>
                      <p className="text-[9px] text-white/30">{item.time}</p>
                    </div>
                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${item.color}`}>{item.severity}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="section-heading space-y-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400/70 bg-orange-400/[0.08] border border-orange-400/10 px-3 py-1 rounded-full">
                  Scene 06 — Threat Monitor
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  <span className="text-orange-400">Anomaly</span> Radar
                </h2>
              </div>
              <p className="section-subtitle text-base text-white/40 leading-relaxed">
                Continuous real-time surveillance of all agent interactions. Correlates behavioral patterns, detects zero-day attack signatures, and triggers automated containment protocols.
              </p>
              <div className="section-body space-y-4">
                <InfoCard label="What it is" desc="A real-time event correlation engine that streams, classifies, and prioritizes all security events from your agent pipeline." />
                <InfoCard label="Why it exists" desc="Manual log review cannot keep pace with autonomous agent activity at production scale — automated detection is essential." />
                <InfoCard label="How it works" desc="Multi-tier severity classification: INFO → LOW → MEDIUM → HIGH → CRITICAL with automated escalation and containment rules." />
                <InfoCard label="What it solves" desc="Eliminates detection blind spots and reduces mean-time-to-response from hours to milliseconds for critical agent threats." />
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════════════ SCENE 07 — AGENT SWARM ═══════════════════ */}
        <Section id="agent-swarm">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-emerald-500/[0.02] blur-[150px]" />
          </div>
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 lg:order-2">
              <div className="section-heading space-y-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/70 bg-emerald-400/[0.08] border border-emerald-400/10 px-3 py-1 rounded-full">
                  Scene 07 — Agent Swarm
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  <span className="text-shield-accent">Multi-Agent</span> Orchestration
                </h2>
              </div>
              <p className="section-subtitle text-base text-white/40 leading-relaxed">
                A LangGraph-powered multi-agent consensus pipeline where specialized security agents collaborate to analyze, validate, and respond to threats autonomously.
              </p>
              <div className="section-body space-y-4">
                <InfoCard label="What it is" desc="A coordinated swarm of 4 specialized AI agents — Sentinel, Analyzer, Validator, and Reporter — operating as a unified security fabric." />
                <InfoCard label="Why it exists" desc="Single-model security is brittle. Multi-agent consensus provides defense-in-depth with redundant validation at every stage." />
                <InfoCard label="How it works" desc="LangGraph state machine orchestrates agent handoffs: Sentinel triages → Analyzer inspects → Validator confirms → Reporter documents." />
                <InfoCard label="What it solves" desc="Eliminates single-point-of-failure in threat detection and provides cryptographic audit trails for every security decision." />
              </div>
            </div>
            <div className="section-visual flex items-center justify-center lg:order-1">
              <div className="relative w-[340px] h-[340px]">
                <svg viewBox="0 0 400 350" className="w-full h-full">
                  <line x1="80" y1="175" x2="200" y2="80" stroke="rgba(52,211,153,0.15)" strokeWidth="2" strokeDasharray="6 4" />
                  <line x1="200" y1="80" x2="320" y2="175" stroke="rgba(59,130,246,0.15)" strokeWidth="2" strokeDasharray="6 4" />
                  <line x1="80" y1="175" x2="200" y2="270" stroke="rgba(52,211,153,0.15)" strokeWidth="2" strokeDasharray="6 4" />
                  <line x1="200" y1="270" x2="320" y2="175" stroke="rgba(245,158,11,0.15)" strokeWidth="2" strokeDasharray="6 4" />
                  <line x1="80" y1="175" x2="320" y2="175" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 6" />

                  <circle r="5" fill="#34d399" opacity="0.8">
                    <animateMotion dur="2s" repeatCount="indefinite" path="M 80 175 L 200 80" />
                  </circle>
                  <circle r="5" fill="#3b82f6" opacity="0.8">
                    <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M 200 80 L 320 175" />
                  </circle>
                  <circle r="5" fill="#f59e0b" opacity="0.8">
                    <animateMotion dur="2s" repeatCount="indefinite" begin="0.3s" path="M 80 175 L 200 270" />
                  </circle>
                  <circle r="5" fill="#34d399" opacity="0.8">
                    <animateMotion dur="2s" repeatCount="indefinite" begin="0.8s" path="M 200 270 L 320 175" />
                  </circle>

                  <g transform="translate(80, 175)">
                    <circle r="30" fill="rgba(52,211,153,0.04)" stroke="rgba(52,211,153,0.4)" strokeWidth="3" className="animate-pulse" />
                    <text textAnchor="middle" y="5" fontSize="18" fontWeight="950" fill="rgba(52,211,153,0.9)">S</text>
                    <text y="48" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgba(255,255,255,0.5)">Sentinel</text>
                  </g>
                  <g transform="translate(200, 80)">
                    <circle r="30" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.4)" strokeWidth="3" />
                    <text textAnchor="middle" y="5" fontSize="18" fontWeight="950" fill="rgba(59,130,246,0.9)">A</text>
                    <text y="-38" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgba(255,255,255,0.5)">Analyzer</text>
                  </g>
                  <g transform="translate(200, 270)">
                    <circle r="30" fill="rgba(245,158,11,0.04)" stroke="rgba(245,158,11,0.4)" strokeWidth="3" />
                    <text textAnchor="middle" y="5" fontSize="18" fontWeight="950" fill="rgba(245,158,11,0.9)">V</text>
                    <text y="48" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgba(255,255,255,0.5)">Validator</text>
                  </g>
                  <g transform="translate(320, 175)">
                    <circle r="30" fill="rgba(139,92,246,0.04)" stroke="rgba(139,92,246,0.4)" strokeWidth="3" />
                    <text textAnchor="middle" y="5" fontSize="18" fontWeight="950" fill="rgba(139,92,246,0.9)">R</text>
                    <text y="48" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgba(255,255,255,0.5)">Reporter</text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════════════ SCENE 08 — REPORTS ═══════════════════ */}
        <Section id="reports">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/[0.03] blur-[150px]" />
          </div>
          <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="section-visual flex items-center justify-center">
              <div className="glass p-6 rounded-2xl w-full max-w-[400px] space-y-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Generated Reports</span>
                </div>
                {[
                  { name: "Monthly Security Audit", date: "Jun 2025", pages: "24 pages" },
                  { name: "Incident Response Log", date: "Jun 2025", pages: "8 entries" },
                  { name: "OWASP LLM Top 10 Compliance", date: "Q2 2025", pages: "Passed" },
                  { name: "Agent Trust Posture Report", date: "Weekly", pages: "Score: 84" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-white/[0.04]">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[9px] text-white/30">{item.date}</p>
                    </div>
                    <span className="text-[9px] text-blue-400 font-bold shrink-0">{item.pages}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="section-heading space-y-4">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400/70 bg-blue-400/[0.08] border border-blue-400/10 px-3 py-1 rounded-full">
                  Scene 08 — Reports & Compliance
                </span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  <span className="text-blue-400">Audit</span> Intelligence
                </h2>
              </div>
              <p className="section-subtitle text-base text-white/40 leading-relaxed">
                Automated compliance report generation with full audit trails. Maps security events to OWASP LLM Top 10, NIST AI RMF, and enterprise governance frameworks.
              </p>
              <div className="section-body space-y-4">
                <InfoCard label="What it is" desc="An automated report generation engine that produces structured security audit documents on configurable schedules." />
                <InfoCard label="Why it exists" desc="Enterprise security teams need standardized, auditable documentation for regulatory compliance and board-level reporting." />
                <InfoCard label="How it works" desc="Aggregates all scan results, incident logs, and trust score history into templated reports mapped to compliance frameworks." />
                <InfoCard label="What it solves" desc="Eliminates manual report compilation, ensures audit trail completeness, and provides exportable PDF/CSV/JSON compliance artifacts." />
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════════════ CTA / WORKSPACE ═══════════════════ */}
        <Section id="workspace">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-shield-accent/[0.04] blur-[150px]" />
          </div>
          <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-32 text-center space-y-8">
            <div className="section-heading space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-shield-accent/20 bg-shield-accent/[0.06]">
                <Zap className="w-3.5 h-3.5 text-shield-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-shield-accent">Ready to Deploy</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                Secure Your <span className="text-gradient">AI Agents</span> Today
              </h2>
            </div>
            <p className="section-subtitle text-base text-white/40 leading-relaxed max-w-2xl mx-auto">
              Deploy enterprise-grade security guardrails for your autonomous AI agent infrastructure. Start with a free workspace and scale as your swarm grows.
            </p>
            <div className="section-body flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register" className="px-8 py-4 rounded-lg bg-shield-accent hover:bg-shield-accent/90 text-[#0a0a0f] text-[11px] font-black flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wider justify-center">
                Deploy Active Workspace
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="px-8 py-4 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white text-[11px] font-bold flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wider justify-center">
                <Play className="w-3.5 h-3.5 fill-white" />
                Access Console
              </Link>
            </div>
          </div>
        </Section>

        <footer className="w-full border-t border-white/[0.04] py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-shield-accent/10 flex items-center justify-center border border-shield-accent/20">
                <Shield className="w-3.5 h-3.5 text-shield-accent" />
              </div>
              <span className="text-xs font-bold text-white/60">AgentShield AI</span>
            </div>
            <p className="text-[10px] text-white/25">© 2025 AgentShield AI. Autonomous Security for the Agentic Future.</p>
            <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-wider text-white/30">
              <a href="#" className="hover:text-shield-accent transition-colors">Documentation</a>
              <a href="#" className="hover:text-shield-accent transition-colors">GitHub</a>
              <a href="#" className="hover:text-shield-accent transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ScannerDiagram() {
  return (
    <div className="relative w-[380px] h-[360px]">
      <svg viewBox="0 0 380 360" className="w-full h-full">
        <line x1="0" y1="150" x2="80" y2="150" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <circle r="3" fill="rgba(255,255,255,0.4)">
          <animateMotion dur="1.5s" repeatCount="indefinite" path="M 0 150 L 80 150" />
        </circle>

        <text x="165" y="30" textAnchor="middle" fontSize="10" fontWeight="900" fill="rgba(52,211,153,0.8)" letterSpacing="2">SCANNER</text>
        <rect x="80" y="45" width="170" height="210" rx="8" fill="rgba(52,211,153,0.02)" stroke="rgba(52,211,153,0.25)" strokeWidth="1.5" strokeDasharray="8 4" />

        {[120, 150, 180].map((x, i) => (
          <line key={i} x1={x} y1="55" x2={x} y2="245" stroke="rgba(52,211,153,0.08)" strokeWidth="1" strokeDasharray="3 6" />
        ))}

        <circle r="2.5" fill="rgba(52,211,153,0.6)">
          <animateMotion dur="2s" repeatCount="indefinite" path="M 130 55 L 130 245" />
        </circle>
        <circle r="2.5" fill="rgba(52,211,153,0.4)">
          <animateMotion dur="2.5s" repeatCount="indefinite" begin="0.3s" path="M 165 245 L 165 55" />
        </circle>
        <circle r="2.5" fill="rgba(52,211,153,0.5)">
          <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.6s" path="M 200 55 L 200 245" />
        </circle>

        <line x1="80" y1="150" x2="30" y2="150" stroke="rgba(52,211,153,0.15)" strokeWidth="1.5" />
        <rect x="10" y="130" width="70" height="40" rx="6" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.35)" strokeWidth="1.5" />
        <text x="45" y="148" textAnchor="middle" fontSize="8" fontWeight="900" fill="rgba(52,211,153,0.9)">SAFE</text>
        <text x="45" y="161" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)">Sanitized</text>

        <rect x="140" y="120" width="80" height="60" rx="6" fill="rgba(239,68,68,0.05)" stroke="rgba(239,68,68,0.3)" strokeWidth="1.5" />
        <text x="180" y="145" textAnchor="middle" fontSize="8" fontWeight="900" fill="rgba(239,68,68,0.9)">MALICIOUS</text>
        <text x="180" y="158" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)">Hostile intent</text>

        <line x1="180" y1="180" x2="180" y2="250" stroke="rgba(239,68,68,0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle r="3" fill="rgba(239,68,68,0.5)">
          <animateMotion dur="1.5s" repeatCount="indefinite" path="M 180 180 L 180 250" />
        </circle>
        <line x1="180" y1="250" x2="300" y2="310" stroke="rgba(239,68,68,0.15)" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle r="3" fill="rgba(239,68,68,0.4)">
          <animateMotion dur="1.5s" repeatCount="indefinite" begin="0.5s" path="M 180 250 L 300 310" />
        </circle>

        <rect x="270" y="295" width="100" height="35" rx="6" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.35)" strokeWidth="1.5" />
        <text x="320" y="317" textAnchor="middle" fontSize="8" fontWeight="900" fill="rgba(239,68,68,0.9)" letterSpacing="1">QUARANTINE</text>
      </svg>
    </div>
  );
}
