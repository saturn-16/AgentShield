"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/validators";
import { Shield, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { gsapUtils } from "@/lib/gsap";

export default function Register() {
  const router = useRouter();
  const { registerUser, isLoading } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", confirm_password: "" }
  });

  useEffect(() => {
    gsapUtils.animateIn(".register-card", 0.1);
  }, []);

  const onSubmit = async (data: any) => {
    setErrorMessage("");
    try {
      await registerUser(data.full_name, data.email, data.password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (e: any) {
      setErrorMessage(e.response?.data?.error || "Registration failed. Try again.");
    }
  };

  return (
    <div className="register-card glass p-8 rounded-xl border border-shield-border/80 shadow-2xl relative overflow-hidden">
      {}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-shield-accent/10 flex items-center justify-center border border-shield-accent/20 mb-3 glow-accent">
          <Shield className="w-6 h-6 text-shield-accent" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-gradient">AgentShield AI</h2>
        <p className="text-xs text-shield-text-muted mt-1.5 uppercase tracking-wider font-semibold">Autonomous Security SOC</p>
      </div>

      {success ? (
        <div className="p-4 rounded bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-400 space-y-2 animate-fade-in">
          <p className="font-bold">Workspace Account Created Successfully!</p>
          <p className="text-shield-text-muted">Directing clearance access routing to login portal...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-semibold">{errorMessage}</p>
            </div>
          )}

          {}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-shield-text-muted">Full Name</label>
            <input
              type="text"
              {...register("full_name")}
              placeholder="Gaurav Kumar"
              className="w-full text-xs bg-shield-surface border border-shield-border rounded-lg px-4 py-2.5 text-shield-text placeholder-shield-text-muted focus:outline-none focus:border-shield-accent transition-colors"
            />
            {errors.full_name && <p className="text-[10px] text-red-400 font-semibold">{errors.full_name.message as string}</p>}
          </div>

          {}
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

          {}
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

          {}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-shield-text-muted">Confirm Password</label>
            <input
              type="password"
              {...register("confirm_password")}
              placeholder="••••••••"
              className="w-full text-xs bg-shield-surface border border-shield-border rounded-lg px-4 py-2.5 text-shield-text placeholder-shield-text-muted focus:outline-none focus:border-shield-accent transition-colors"
            />
            {errors.confirm_password && (
              <p className="text-[10px] text-red-400 font-semibold">{errors.confirm_password.message as string}</p>
            )}
          </div>

          {}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-shield-accent hover:bg-shield-accent/90 border border-shield-accent/20 text-shield-bg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Provisioning Clearance Credentials...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Initialize Workspace
              </>
            )}
          </button>
        </form>
      )}

      {}
      <div className="mt-8 pt-6 border-t border-shield-border/50 text-center text-xs text-shield-text-muted">
        Already have a workspace session?{" "}
        <Link href="/login" className="text-shield-accent hover:underline font-semibold">
          Access Workspace
        </Link>
      </div>
    </div>
  );
}
