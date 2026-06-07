"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { fetchAPI } from "@/lib/api";
import { FileText, Download, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [reportMd, setReportMd] = useState<string>("");
  const [generatingReport, setGeneratingReport] = useState(false);

  const compileExecutiveReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetchAPI.generateReport();
      setReportMd(res.report_md);
      
      const newReport = {
        id: res.metadata?.generated_at || new Date().toISOString(),
        title: `SOC Briefing - ${new Date().toLocaleDateString()}`,
        content: res.report_md,
        created_at: res.metadata?.generated_at || new Date().toISOString()
      };
      setReports(prev => [newReport, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      <PageHeader 
        title="Executive Briefing & Report Compiler" 
        description="Compile dynamic markdown incident briefs and audit telemetry reports straight from database models."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Report Editor & compiler */}
        <div className="glass p-6 rounded-xl border border-white/[0.06] lg:col-span-8 flex flex-col justify-between min-h-[460px]">
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/[0.06] pb-2.5 flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-pink-500" />
              <span>Executive Briefing Compiler Output</span>
            </h3>
            
            <div className="mt-5">
              {reportMd ? (
                <textarea
                  readOnly
                  value={reportMd}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-4 py-3.5 text-xs text-[#00FF66] focus:outline-none h-[300px] resize-none font-mono leading-relaxed"
                />
              ) : (
                <div className="h-[300px] bg-black/20 border border-white/[0.04] rounded-xl flex flex-col justify-center items-center text-center text-gray-500 px-6">
                  <FileText className="w-8 h-8 mb-2.5 text-white/10" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">No active report generated. Click below to compile incident logs.</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={compileExecutiveReport}
              disabled={generatingReport}
              className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer uppercase tracking-wider disabled:opacity-40"
            >
              {generatingReport ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compiling database models...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Compile SOC Briefing</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Report History/Archive Side Panel */}
        <div className="glass p-6 rounded-xl border border-white/[0.06] lg:col-span-4 flex flex-col justify-between min-h-[460px]">
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/[0.06] pb-2.5 flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Briefing Archive</span>
            </h3>

            <div className="mt-5 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-gray-600 text-[10px] font-bold uppercase">
                  Archive Empty
                </div>
              ) : (
                reports.map((r) => (
                  <div 
                    key={r.id}
                    onClick={() => setReportMd(r.content)}
                    className="p-3 bg-black/30 border border-white/[0.04] rounded-lg hover:border-cyan-500/30 transition-all cursor-pointer flex justify-between items-center text-[10px] font-mono font-bold"
                  >
                    <div className="flex flex-col">
                      <span className="text-white truncate max-w-[160px]">{r.title}</span>
                      <span className="text-gray-500 text-[8px] mt-0.5">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-cyan-400 hover:text-white" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}