"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { Bell, Search, Menu, User, ShieldCheck } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const getPageTitle = () => {
    const path = pathname.split("/").pop() || "dashboard";
    return path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-shield-border bg-shield-bg/50 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 text-shield-text-muted hover:text-shield-text rounded-lg hover:bg-shield-surface-alt"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-shield-text">{getPageTitle()}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {}
        <div className="relative hidden sm:block w-64">
          <input
            type="text"
            placeholder="Search anomalies, IPs, URLs..."
            className="w-full text-xs bg-shield-surface border border-shield-border rounded-lg pl-9 pr-4 py-2 text-shield-text placeholder-shield-text-muted focus:outline-none focus:border-shield-accent transition-colors"
          />
          <Search className="w-4 h-4 text-shield-text-muted absolute left-3 top-2.5" />
        </div>

        {}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Shield Active
        </div>

        {}
        <button className="p-2 text-shield-text-muted hover:text-shield-text rounded-lg hover:bg-shield-surface-alt relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 bg-shield-accent rounded-full absolute top-2 right-2 ring-2 ring-shield-bg" />
        </button>

        {}
        <div className="flex items-center gap-2 border-l border-shield-border pl-4">
          <div className="w-8 h-8 rounded-full bg-shield-accent/10 border border-shield-accent/20 flex items-center justify-center font-semibold text-shield-accent text-xs">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-shield-text">{user?.full_name || "Analyst"}</p>
            <p className="text-[10px] text-shield-text-muted uppercase font-medium">{user?.role || "user"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
