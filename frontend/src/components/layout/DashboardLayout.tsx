"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  Shield,
  LogOut,
  ChevronDown,
  User as UserIcon,
  LayoutDashboard,
  Terminal,
  Globe,
  BarChart3,
  ShieldCheck,
  Settings,
  Bot,
  Home,
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loadSession, isLoading, logout } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (isMounted && !isLoading && !user) {
      router.push("/login");
    }
  }, [isMounted, isLoading, user, router]);

  const navItems = [
    { name: "Home",           href: "/",               icon: Home,           external: true  },
    { name: "Security Log",   href: "/dashboard",      icon: LayoutDashboard                 },
    { name: "Prompt Scanner", href: "/prompt-scanner", icon: Terminal                         },
    { name: "URL Scanner",    href: "/url-scanner",    icon: Globe                            },
    { name: "Reports",        href: "/reports",        icon: BarChart3                        },
    { name: "Trust Center",   href: "/trust-center",   icon: ShieldCheck                     },
    { name: "Settings",       href: "/settings",       icon: Settings                        },
  ];

  if (!isMounted || (isLoading && !user)) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  const initials = user.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col antialiased relative">
      {}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/[0.04] rounded-full blur-[180px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/[0.02] rounded-full blur-[200px]" />
        {}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      </div>

      {}
      <header className="sticky top-0 z-50 w-full bg-white/[0.03] border-b border-white/[0.06] backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          
          {}
          <div
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-[13px] font-bold tracking-[0.05em] text-white/80 group-hover:text-white transition-colors uppercase">
              AgentShield
            </span>
          </div>

          {}
          <nav className="hidden lg:flex items-center gap-0.5 ml-10">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              if (item.external) {
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 text-white/40 hover:text-white hover:bg-white/[0.05] uppercase"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.name}
                  </Link>
                );
              }
              return (
                <button
                  key={idx}
                  onClick={() => router.push(item.href)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 flex items-center gap-1.5 uppercase cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/20"
                      : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {}
          <div className="flex items-center gap-3 ml-auto">
            {}
            <div className="hidden md:flex items-center gap-2 border border-emerald-500/20 rounded-lg px-3 py-1.5 bg-emerald-500/[0.05] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold tracking-wide uppercase">AI Security Console</span>
            </div>

            {}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center cursor-pointer shadow-lg shadow-emerald-500/20 text-white text-[11px] font-black">
              {initials}
            </div>

            {}
            <button
              className="w-8 h-8 rounded-lg border border-white/[0.08] hover:bg-white/[0.05] flex items-center justify-center transition-colors cursor-pointer group"
              onClick={() => { logout(); router.push("/login"); }}
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-white/40 group-hover:text-white/80 transition-colors" />
            </button>
          </div>
        </div>
      </header>

      {}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6 relative z-10 flex flex-col">
        {children}
      </main>
    </div>
  );
}
