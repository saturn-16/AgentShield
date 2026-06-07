"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useScanStore } from "@/stores/scan";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { urlScanSchema } from "@/validators";
import { AlertCircle, Globe, Sparkles, ChevronRight, Terminal, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { getClassificationColor, formatDate } from "@/lib/utils";
import { gsapUtils } from "@/lib/gsap";

export default function UrlScanner() {
  const { urlResult, isScanning, scanUrl, urlHistory, fetchUrlHistory, clearResults } = useScanStore();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(urlScanSchema),
    defaultValues: { url: "" }
  });

  useEffect(() => {
    fetchUrlHistory();
    clearResults();
  }, [fetchUrlHistory, clearResults]);

  useEffect(() => {
    if (urlResult) {
      gsapUtils.animateIn(".result-panel", 0.1);
    }
  }, [urlResult]);

  const onSubmit = async (data: { url: string }) => {
    try {
      await scanUrl(data.url);
      reset({ url: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const loadExample = (example: string) => {
    reset({ url: example });
  };

  const EXAMPLES = [
    "http://192.168.1.1/secure-signin/update.php",
    "http://paypa1-account-login.tk/verification",
    "https://github.com/openai/langchain-integration"
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="URL Threat Scanner"
        description="Verify outbound dynamic hyperlinks for spoofing scripts, phishing keywords, untrusted TLDs, and shorteners."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="glass p-6 rounded-xl lg:col-span-2">
          <h3 className="text-sm font-bold text-shield-text uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-shield-accent" />
            Dynamic Link Input
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                type="text"
                {...register("url")}
                placeholder="Enter dynamic link to check (e.g. http://example.com)..."
                className="w-full bg-shield-surface border border-shield-border rounded-lg px-4 py-3 text-sm text-shield-text placeholder-shield-text-muted focus:outline-none focus:border-shield-accent transition-colors"
              />
            </div>
            {errors.url && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.url.message}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              {}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-shield-text-muted">Load Attack Vector:</span>
                {EXAMPLES.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadExample(ex)}
                    className="text-[10px] px-2.5 py-1 rounded bg-shield-surface-alt border border-shield-border text-shield-text-muted hover:text-shield-accent hover:border-shield-accent/30 transition-all duration-200"
                  >
                    Vector {idx + 1}
                  </button>
                ))}
              </div>

              {}
              <button
                type="submit"
                disabled={isScanning}
                className="px-5 py-2 rounded-lg bg-shield-accent hover:bg-shield-accent/90 border border-shield-accent/20 text-shield-bg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Auditing Hostname...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Scan Domain
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {}
        <div className="lg:col-span-1">
          {urlResult ? (
            <div className="result-panel glass p-6 rounded-xl h-full flex flex-col justify-between border-l-2 border-shield-accent">
              <div>
                <h3 className="text-sm font-bold text-shield-text uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-shield-accent" />
                  Reputation Check
                </h3>
                
                {}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-shield-text-muted">Reputation Score</span>
                    <span className="text-xs font-bold text-shield-text">{urlResult.reputation_score}/100</span>
                  </div>
                  <div className="w-full bg-shield-surface rounded-full h-2 border border-shield-border">
                    <div
                      className="h-full bg-shield-accent rounded-full"
                      style={{ width: `${urlResult.reputation_score}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${getClassificationColor(urlResult.classification)}`}>
                      {urlResult.classification}
                    </span>
                    <span className="text-[10px] text-shield-text-muted">
                      Age: {urlResult.domain_age_days ? `${urlResult.domain_age_days} days` : "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-shield-text-muted mb-1.5">Security Checkpoints</h4>
                    <div className="space-y-2">
                      {urlResult.indicators.map((ind, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2">
                            {parseFloat(ind.risk_contribution) < 0 ? (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className="font-semibold text-shield-text">{ind.name}</p>
                              <p className="text-[10px] text-shield-text-muted mt-0.5">{ind.value}</p>
                            </div>
                          </div>
                          <span className={`font-mono text-[10px] font-bold ${parseFloat(ind.risk_contribution) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {ind.risk_contribution}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-shield-border mt-6">
                <p className="text-[10px] text-shield-text-muted leading-relaxed">
                  Destination domain parsed as <code className="text-shield-accent">{urlResult.domain}</code>. Always confirm redirect payloads before integrating in multi-agent environments.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass p-6 rounded-xl h-full flex flex-col items-center justify-center text-center">
              <Globe className="w-10 h-10 text-shield-text-muted/40 mb-3 animate-pulse" />
              <h4 className="font-semibold text-sm text-shield-text">Waiting for input</h4>
              <p className="text-xs text-shield-text-muted max-w-xs mt-1 leading-relaxed">
                Provide a dynamic link payload on the left to trigger domain-level reputation assessments.
              </p>
            </div>
          )}
        </div>
      </div>

      {}
      <div className="glass p-6 rounded-xl">
        <h3 className="text-sm font-bold text-shield-text uppercase tracking-wider mb-4">URL Security Audit Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-shield-border text-shield-text-muted font-bold">
                <th className="py-3 px-4">URL</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Reputation Score</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-shield-border/50 text-shield-text/80">
              {urlHistory.length > 0 ? (
                urlHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-shield-surface/30">
                    <td className="py-3 px-4 font-mono truncate max-w-xs">{item.url}</td>
                    <td className="py-3 px-4">{item.domain}</td>
                    <td className="py-3 px-4 font-semibold">{item.reputation_score}/100</td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getClassificationColor(item.classification)}`}>
                        {item.classification}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-shield-text-muted">{formatDate(item.created_at)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => scanUrl(item.url)}
                        className="text-[10px] text-shield-accent hover:text-white flex items-center gap-1"
                      >
                        Re-scan
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-shield-text-muted">
                    No scan logs available. Run a scanner audit above to populate local database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
