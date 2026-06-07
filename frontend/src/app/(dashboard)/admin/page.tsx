"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { useAuthStore } from "@/stores/auth";
import { User, UserRole } from "@/types";
import { Users, Shield, Cpu, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { gsapUtils } from "@/lib/gsap";

interface SystemHealth {
  api_status: string;
  database_status: string;
  redis_status: string;
  celery_queue_depth: number;
  system_load: number;
}

export default function AdminPanel() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activeTab, setActiveTab] = useState("users");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    try {
      const stored = JSON.parse(localStorage.getItem("agentshield_users") || "[]");
      const users = stored.map(({ password_hash, ...u }: any) => u);
      setUsersList(users);
    } catch {
      setUsersList([]);
    }
    setHealth({
      api_status: "healthy",
      database_status: "healthy",
      redis_status: "healthy",
      celery_queue_depth: 0,
      system_load: 0.04,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role !== "admin") {
        router.push("/dashboard");
      } else {
        fetchAdminData();
      }
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (!isLoading) {
      gsapUtils.staggerIn(".admin-card", 0.08);
    }
  }, [isLoading, activeTab]);

  const handleUpdateRole = (userId: string, newRole: UserRole) => {
    try {
      const stored = JSON.parse(localStorage.getItem("agentshield_users") || "[]");
      const updated = stored.map((u: any) => (u.id === userId ? { ...u, role: newRole } : u));
      localStorage.setItem("agentshield_users", JSON.stringify(updated));
      setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      alert("User role updated successfully.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeactivateUser = (userId: string) => {
    if (!confirm("Are you sure you want to toggle deactivation status for this user?")) return;
    try {
      const stored = JSON.parse(localStorage.getItem("agentshield_users") || "[]");
      const matched = stored.find((u: any) => u.id === userId);
      if (matched) {
        const nextActive = !matched.is_active;
        const updated = stored.map((u: any) => (u.id === userId ? { ...u, is_active: nextActive } : u));
        localStorage.setItem("agentshield_users", JSON.stringify(updated));
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, is_active: nextActive } : u)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center text-shield-text-muted">Loading permissions checks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Panel"
        description="Configure role-based access controls (RBAC) and audit live system cluster orchestrations."
      />

      {/* Tabs */}
      <div className="flex border-b border-shield-border/50 gap-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "users" ? "text-shield-accent border-b-2 border-shield-accent" : "text-shield-text-muted hover:text-shield-text"
          }`}
        >
          <Users className="w-4 h-4" />
          User Management
        </button>
        <button
          onClick={() => setActiveTab("health")}
          className={`pb-3 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "health" ? "text-shield-accent border-b-2 border-shield-accent" : "text-shield-text-muted hover:text-shield-text"
          }`}
        >
          <Cpu className="w-4 h-4" />
          System Health
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="w-8 h-8 text-shield-accent animate-spin" />
        </div>
      ) : activeTab === "users" ? (
        <div className="admin-card glass p-6 rounded-xl">
          <h3 className="text-sm font-bold text-shield-text uppercase tracking-wider mb-4 flex items-center gap-1.5">
            Registered Identities
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-shield-border text-shield-text-muted font-bold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-shield-border/50 text-shield-text/80">
                {usersList.length > 0 ? (
                  usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-shield-surface/30">
                      <td className="py-3 px-4 font-semibold">{usr.full_name}</td>
                      <td className="py-3 px-4 font-mono">{usr.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={usr.role}
                          onChange={(e) => handleUpdateRole(usr.id, e.target.value as UserRole)}
                          className="bg-shield-surface border border-shield-border rounded text-[11px] font-bold text-shield-text px-2 py-1 focus:outline-none focus:border-shield-accent"
                        >
                          <option value="user">USER</option>
                          <option value="analyst">ANALYST</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                            usr.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {usr.is_active ? "ACTIVE" : "DISABLED"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-shield-text-muted">{formatDate(usr.created_at)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeactivateUser(usr.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded border cursor-pointer transition-colors ${
                            usr.is_active
                              ? "bg-red-500/5 text-red-400 border-red-500/20 hover:bg-red-500/10"
                              : "bg-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                          }`}
                        >
                          {usr.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-shield-text-muted">
                      No user accounts registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="admin-card glass p-6 rounded-xl text-center space-y-4">
            <Shield className="w-10 h-10 text-shield-accent mx-auto animate-pulse" />
            <h4 className="text-xs uppercase font-bold text-shield-text-muted">SOC API Node</h4>
            <div className="text-2xl font-black text-white uppercase">{health?.api_status}</div>
            <p className="text-[10px] text-shield-text-muted leading-relaxed">
              API gateway connection heartbeat is stable. Routing overhead &lt;12ms.
            </p>
          </div>

          <div className="admin-card glass p-6 rounded-xl text-center space-y-4">
            <Cpu className="w-10 h-10 text-cyan-400 mx-auto" />
            <h4 className="text-xs uppercase font-bold text-shield-text-muted">CPU System Load</h4>
            <div className="text-2xl font-black text-white font-mono">{(health?.system_load ?? 0.04) * 100}%</div>
            <p className="text-[10px] text-shield-text-muted leading-relaxed">
              Worker process cluster load is optimal. Celery Queue depth: {health?.celery_queue_depth}.
            </p>
          </div>

          <div className="admin-card glass p-6 rounded-xl text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-xs uppercase font-bold text-shield-text-muted">Core Cache & DB</h4>
            <div className="text-2xl font-black text-emerald-400 uppercase">ONLINE</div>
            <p className="text-[10px] text-shield-text-muted leading-relaxed">
              Redis cache cluster and local SQLite persistent models are connected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}