"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/validators";
import { Shield, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { gsapUtils } from "@/lib/gsap";

export default function Login() {
  const router = useRouter();
  const { login, isLoading, user } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  useEffect(() => {
    gsapUtils.animateIn(".login-card", 0.1);
  }, []);

  useEffect(() => {
    // If logged in already, direct route immediately to dashboard
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const onSubmit = async (data: any) => {
    setErrorMessage("");
    try {
      await login(data.email, data.password);
      router.push("/dashboard");
    } catch (e: any) {
      setErrorMessage(e.message || "Invalid credentials.");
    }
  };

  return (
    <div className="login-card glass p-8 rounded-xl border border-shield-border/80 shadow-2xl relative overflow-hidden w-full max-w-md">
      {/* Brand logo header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-shield-accent/10 flex items-center justify-center border border-shield-accent/20 mb-3 glow-accent">
          <Shield className="w-6 h-6 text-shield-accent animate-pulse" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-gradient">AgentShield AI</h2>
        <p className="text-xs text-shield-text-muted mt-1.5 uppercase tracking-wider font-semibold">Autonomous Security SOC</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-semibold">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-shield-text-muted">Corporate Email</label>
          <input
            type="email"
            {...register("email")}
            placeholder="name@company.com"
            className="w-full text-xs bg-shield-surface border border-shield-border rounded-lg px-4 py-2.5 text-shield-text placeholder-shield-text-muted focus:outline-none focus:border-shield-accent transition-colors"
          />
          {errors.email && <p className="text-[10px] text-red-400 font-semibold">{errors.email.message as string}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-shield-text-muted">Password</label>
          <input
            type="password"
            {...register("password")}
            placeholder="••••••••"
            className="w-full text-xs bg-shield-surface border border-shield-border rounded-lg px-4 py-2.5 text-shield-text placeholder-shield-text-muted focus:outline-none focus:border-shield-accent transition-colors"
          />
          {errors.password && <p className="text-[10px] text-red-400 font-semibold">{errors.password.message as string}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 rounded-lg bg-shield-accent hover:bg-shield-accent/90 border border-shield-accent/20 text-shield-bg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Accessing Session...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Authenticate Clearance
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-shield-border/50 text-center text-xs text-shield-text-muted">
        Need workspace access?{" "}
        <Link href="/register" className="text-shield-accent hover:underline font-semibold">
          Request Clearance
        </Link>
      </div>
    </div>
  );
}