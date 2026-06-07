"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Swarm Pipeline", href: "#architecture" },
    { name: "Pricing Plans", href: "#pricing" },
    { name: "FAQ", href: "#faq" }
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 h-16 flex items-center justify-between border-b",
        scrolled
          ? "bg-shield-bg/85 backdrop-blur-md border-shield-border"
          : "bg-transparent border-transparent"
      )}
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-shield-accent/10 flex items-center justify-center border border-shield-accent/30">
          <Shield className="w-5 h-5 text-shield-accent" />
        </div>
        <span className="font-bold text-base tracking-tight text-gradient">AgentShield AI</span>
      </Link>

      {}
      <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-shield-text-muted">
        {navLinks.map((link) => (
          <a key={link.name} href={link.href} className="hover:text-shield-accent transition-colors">
            {link.name}
          </a>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-4">
        <Link href="/login" className="text-xs font-bold text-shield-text hover:text-shield-accent transition-colors">
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-4 py-2.5 rounded-lg bg-shield-accent hover:bg-shield-accent/90 border border-shield-accent/20 text-shield-bg text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
        >
          Deploy Workspace
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-1.5 text-shield-text-muted hover:text-shield-text"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 bg-shield-bg border-b border-shield-border flex flex-col p-6 gap-5 md:hidden animate-fade-in shadow-2xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-xs font-bold uppercase tracking-wider text-shield-text hover:text-shield-accent"
            >
              {link.name}
            </a>
          ))}
          <div className="border-t border-shield-border pt-4 flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-xs font-bold text-center py-2 text-shield-text">
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 rounded-lg bg-shield-accent hover:bg-shield-accent/90 border border-shield-accent/20 text-shield-bg text-xs font-bold flex items-center justify-center gap-1"
            >
              Deploy Workspace
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
