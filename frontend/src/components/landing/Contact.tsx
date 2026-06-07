"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Sparkles, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(2, "Company name is required"),
  message: z.string().min(10, "Message must be at least 10 characters long")
});

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", company: "", message: "" }
  });

  const onSubmit = (data: any) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-20 px-6 md:px-12 border-t border-shield-border/40 max-w-4xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <span className="text-[10px] font-bold tracking-widest text-shield-accent uppercase">Request Consultation</span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-shield-text">Secure Your Swarm Posture</h2>
        <p className="text-xs md:text-sm text-shield-text-muted leading-relaxed">
          Need custom rules, strict on-premise containment, or dedicated security analyst audits? Get in touch with our SOC team today.
        </p>
      </div>

      <div className="glass p-8 rounded-xl border border-shield-border/80 shadow-2xl relative">
        {success ? (
          <div className="p-4 rounded bg-emerald-500/10 border border-emerald-500/20 text-center text-xs text-emerald-400 space-y-2 animate-fade-in py-12">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="font-bold">Consultation Query Sent!</p>
            <p className="text-shield-text-muted">A senior security analyst will establish contact shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-shield-text-muted">Full Name</label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Gaurav Kumar"
                  className="w-full text-xs bg-shield-surface border border-shield-border rounded-lg px-4 py-2.5 text-shield-text placeholder-shield-text-muted focus:outline-none focus:border-shield-accent transition-colors"
                />
                {errors.name && <p className="text-[10px] text-red-400 font-semibold">{errors.name.message as string}</p>}
              </div>

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
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-shield-text-muted">Enterprise Company</label>
              <input
                type="text"
                {...register("company")}
                placeholder="CyberShield Inc."
                className="w-full text-xs bg-shield-surface border border-shield-border rounded-lg px-4 py-2.5 text-shield-text placeholder-shield-text-muted focus:outline-none focus:border-shield-accent transition-colors"
              />
              {errors.company && <p className="text-[10px] text-red-400 font-semibold">{errors.company.message as string}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-shield-text-muted">Operational Requirements</label>
              <textarea
                rows={4}
                {...register("message")}
                placeholder="Outline details on agent swarm nodes count, tools execution scopes, and security goals..."
                className="w-full text-xs bg-shield-surface border border-shield-border rounded-lg p-4 text-shield-text placeholder-shield-text-muted focus:outline-none focus:border-shield-accent transition-colors resize-none"
              />
              {errors.message && <p className="text-[10px] text-red-400 font-semibold">{errors.message.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-shield-accent hover:bg-shield-accent/90 border border-shield-accent/20 text-shield-bg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Routing consultation...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Request Clearance Assessment
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
