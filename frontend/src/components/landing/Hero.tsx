"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Shield, ArrowRight, Play } from "lucide-react";
import { gsapUtils, gsap } from "@/lib/gsap";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  
  const count1Ref = useRef<HTMLSpanElement>(null);
  const count2Ref = useRef<HTMLSpanElement>(null);
  const count3Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const anims = containerRef.current.querySelectorAll(".hero-animate");
      gsap.fromTo(
        anims,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.15, ease: "power3.out" }
      );
    }

    if (lineRef.current) {
      gsap.fromTo(
        lineRef.current,
        { top: "0%" },
        { top: "100%", duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" }
      );
    }

    // Trigger stats counter animations using custom GSAP loops
    if (count1Ref.current) {
      gsapUtils.animateCounter(count1Ref.current, 0, 1464, 2.5);
    }
    if (count2Ref.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: 99.98,
        duration: 2.2,
        ease: "power2.out",
        onUpdate: () => {
          if (count2Ref.current) {
            count2Ref.current.innerText = `${obj.val.toFixed(2)}%`;
          }
        }
      });
    }
    if (count3Ref.current) {
      gsapUtils.animateCounter(count3Ref.current, 100, 0, 2);
    }
  }, []);

  return (
    <section ref={containerRef} className="relative pt-32 pb-20 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden max-w-7xl mx-auto w-full min-h-[80vh]">
      {/* Laser scan lines container backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]">
        <div ref={lineRef} className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#00F0FF]" />
      </div>

      <div className="relative z-10 max-w-4xl space-y-6 flex flex-col items-center">
        <div className="hero-animate w-12 h-12 rounded-xl bg-shield-accent/10 flex items-center justify-center border border-shield-accent/30 glow-accent animate-pulse mb-2">
          <Shield className="w-6 h-6 text-shield-accent" />
        </div>

        <h1 className="hero-animate text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-white max-w-3xl">
          Autonomous Security Operations Center for <span className="text-gradient">AI Swarms</span>
        </h1>

        <p className="hero-animate text-xs md:text-sm text-shield-text-muted leading-relaxed max-w-2xl mx-auto uppercase tracking-wide">
          Deploy enterprise-grade active firewall guardrails. Intercept prompt injection vectors, redact critical DLP exposures, and isolate hijacked agent nodes in real-time.
        </p>

        <div className="hero-animate flex flex-col sm:flex-row gap-4 pt-4 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 rounded-lg bg-shield-accent hover:bg-shield-accent/90 border border-shield-accent/20 text-shield-bg text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider"
          >
            Deploy Active Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all uppercase tracking-wider"
          >
            <Play className="w-3.5 h-3.5 fill-white animate-pulse" />
            <span>Access Console</span>
          </Link>
        </div>

        <div className="hero-animate grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 w-full max-w-3xl">
          <div className="glass p-5 rounded-xl border border-shield-border/60 text-center space-y-2">
            <span className="text-2xl font-black text-white font-mono block">
              <span ref={count1Ref}>0</span>k+
            </span>
            <span className="text-[9px] text-shield-text-muted uppercase font-bold tracking-wider">Scans Inspected</span>
          </div>

          <div className="glass p-5 rounded-xl border border-shield-border/60 text-center space-y-2">
            <span ref={count2Ref} className="text-2xl font-black text-white font-mono block">0.00%</span>
            <span className="text-[9px] text-shield-text-muted uppercase font-bold tracking-wider">Swarm Uptime Ratio</span>
          </div>

          <div className="glass p-5 rounded-xl border border-shield-border/60 text-center space-y-2">
            <span className="text-2xl font-black text-white font-mono block">
              <span ref={count3Ref}>0</span>%
            </span>
            <span className="text-[9px] text-shield-text-muted uppercase font-bold tracking-wider">Containment Leak Rate</span>
          </div>
        </div>
      </div>
    </section>
  );
}