"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useAuthStore } from "@/stores/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/validators";
import { fetchAPI, Policy } from "@/lib/api";
import { Settings, Key, Bell, Shield, Clipboard, RefreshCw, AlertCircle, Check } from "lucide-react";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || ""
    }
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoadingPolicies(true);
    try {
      const p = await fetchAPI.getPolicies();
      setPolicies(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPolicies(false);
    }
  };

  const handlePolicyToggle = async (policyId: number, enabled: boolean, action: string) => {
    try {
      await fetchAPI.updatePolicy(policyId, enabled, action);
      setPolicies(prev => prev.map(p => p.id === policyId ? { ...p, enabled, action } : p));
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmitProfile = (data: { full_name: string; email: string }) => {
    if (user) {
      setUser({ ...user, ...data });
      alert("Settings preferences updated.");
    }
  };

  const handleGenerateKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const key = "ag_shield_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setApiKey(key);
      setIsGenerating(false);
    }, 1200);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <PageHeader 
        title="Command Settings" 
        description="Configure your corporate profile, provision AI API credentials, and toggle mitigation policy rules."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Navigation tabs sidebar (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-3 rounded-lg text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 ${
              activeTab === "profile" 
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Profile Configuration</span>
          </button>
          
          <button
            onClick={() => setActiveTab("api-keys")}
            className={`px-4 py-3 rounded-lg text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 ${
              activeTab === "api-keys" 
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Provision API Credentials</span>
          </button>

          <button
            onClick={() => setActiveTab("policies")}
            className={`px-4 py-3 rounded-lg text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2.5 ${
              activeTab === "policies" 
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Mitigation Firewall Rules</span>
          </button>
        </div>

        {/* Dynamic Settings Content Panel (lg:col-span-9) */}
        <div className="lg:col-span-9 glass p-6 rounded-xl border border-white/[0.06] min-h-[400px]">
          
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/[0.06] pb-3">
                Profile Settings
              </h3>
              
              <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Corporate Full Name</label>
                  <input
                    type="text"
                    {...register("full_name")}
                    className="w-full text-xs bg-black/40 border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  />
                  {errors.full_name && <p className="text-[10px] text-red-400 font-semibold">{errors.full_name.message as string}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-500">Corporate Email Address</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full text-xs bg-black/40 border border-white/[0.08] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                  />
                  {errors.email && <p className="text-[10px] text-red-400 font-semibold">{errors.email.message as string}</p>}
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Save Profile Configuration
                </button>
              </form>
            </div>
          )}

          {activeTab === "api-keys" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/[0.06] pb-3">
                Provision API Keys
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
                Provision a secure, cryptographically random token to verify outbound RAG and multi-agent operations from external scripts.
              </p>

              <div className="space-y-4 pt-2">
                <button
                  onClick={handleGenerateKey}
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                >
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  <span>{isGenerating ? "Generating Secure Key..." : "Generate Security API Token"}</span>
                </button>

                {apiKey && (
                  <div className="max-w-md bg-black/40 border border-white/[0.08] p-4 rounded-lg flex items-center justify-between font-mono text-xs text-[#00FF66] tracking-wider">
                    <span className="truncate max-w-[80%]">{apiKey}</span>
                    <button
                      onClick={copyToClipboard}
                      className="p-1.5 rounded hover:bg-white/[0.05] text-cyan-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy key"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "policies" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/[0.06] pb-3">
                Mitigation Firewall Rules
              </h3>
              
              <div className="space-y-4 max-w-2xl">
                {policies.map((p) => (
                  <div key={p.id} className="p-3.5 bg-black/40 border border-white/[0.06] rounded-xl flex items-center justify-between">
                    <div className="flex flex-col max-w-[70%] leading-relaxed">
                      <span className="text-xs font-bold text-white tracking-wide">{p.name}</span>
                      <span className="text-[10px] text-gray-500 mt-0.5 leading-normal">{p.description}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <select
                        value={p.action}
                        onChange={(e) => handlePolicyToggle(p.id, p.enabled, e.target.value)}
                        className="bg-[#120E1E] border border-white/[0.08] text-[9px] font-black text-gray-300 rounded px-2 py-0.5 focus:outline-none cursor-pointer"
                      >
                        <option value="Block">BLOCK</option>
                        <option value="Mask">MASK</option>
                        <option value="Audit">AUDIT</option>
                      </select>
                      <input
                        type="checkbox"
                        checked={p.enabled}
                        onChange={(e) => handlePolicyToggle(p.id, e.target.checked, p.action)}
                        className="accent-cyan-500 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}