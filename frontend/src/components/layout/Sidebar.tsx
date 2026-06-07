"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShieldAlert,
  Globe,
  Activity,
  GitMerge,
  FileText,
  Settings,
  Users,
  LogOut,
  Shield,
  Menu
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Prompt Scanner", href: "/prompt-scanner", icon: ShieldAlert },
    { name: "URL Scanner", href: "/url-scanner", icon: Globe },
    { name: "Trust Center", href: "/trust-center", icon: Activity },
    { name: "Threat Monitor", href: "/threat-monitor", icon: Shield },
    { name: "Agent Swarm", href: "/agent-swarm", icon: GitMerge },
    { name: "Security Reports", href: "/reports", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const adminNavigation = [
    { name: "Admin Panel", href: "/admin", icon: Users }
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 flex flex-col glass border-r border-shield-border transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {}
      <div className="h-16 flex items-center justify-between px-6 border-b border-shield-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-shield-accent/10 flex items-center justify-center border border-shield-accent/30">
            <Shield className="w-5 h-5 text-shield-accent" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gradient">AgentShield</span>
        </Link>
        <button
          className="md:hidden p-1 text-shield-text-muted hover:text-shield-text"
          onClick={() => setIsOpen(false)}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        <div className="space-y-1.5">
          <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-shield-text-muted">Security Ops</span>
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-shield-accent/10 text-shield-accent border-l-2 border-shield-accent pl-2.5"
                    : "text-shield-text-muted hover:text-shield-text hover:bg-shield-surface-alt/50"
                )}
              >
                <Icon className={cn("w-4 h-4", active ? "text-shield-accent" : "text-shield-text-muted")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {}
        {user?.role === "admin" && (
          <div className="space-y-1.5">
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-shield-text-muted">Governance</span>
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-shield-accent/10 text-shield-accent border-l-2 border-shield-accent pl-2.5"
                      : "text-shield-text-muted hover:text-shield-text hover:bg-shield-surface-alt/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", active ? "text-shield-accent" : "text-shield-text-muted")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {}
      <div className="p-4 border-t border-shield-border bg-shield-surface/50">
        <div className="flex items-center gap-3 px-2 py-1.5 mb-2">
          <div className="w-9 h-9 rounded-full bg-shield-surface-alt border border-shield-border flex items-center justify-center font-semibold text-shield-accent">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold truncate text-shield-text">{user?.full_name || "Agent Analyst"}</h4>
            <span className="text-[10px] text-shield-accent uppercase font-medium">{user?.role || "analyst"}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
