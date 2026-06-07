"use client";

import React from "react";

export default function RiskHeatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const categories = [
    "Prompt Injection",
    "Jailbreak",
    "Data Leakage",
    "Malicious URL"
  ];

  const heatmapData = [
    [0.1, 0.4, 0.2, 0.8, 0.3, 0.1, 0.5], // Prompt Injection
    [0.3, 0.1, 0.6, 0.2, 0.9, 0.2, 0.1], // Jailbreak
    [0.7, 0.2, 0.1, 0.4, 0.2, 0.5, 0.3], // Data Leakage
    [0.1, 0.5, 0.3, 0.1, 0.4, 0.8, 0.2]  // Malicious URL
  ];

  const getHeatColor = (val: number) => {
    if (val >= 0.8) return "bg-pink-500 border-pink-400/30 shadow-[0_0_8px_rgba(236,72,153,0.4)]";
    if (val >= 0.5) return "bg-orange-500/80 border-orange-500/25";
    if (val >= 0.3) return "bg-cyan-500/40 border-cyan-500/10";
    return "bg-cyan-950/25 border-white/5";
  };

  return (
    <div className="w-full flex flex-col space-y-4 font-mono text-xs">
      <div className="flex justify-between items-center text-[10px] text-gray-500 border-b border-white/5 pb-2">
        <span className="uppercase">Threat Intensity Heatmap (30 Days)</span>
        <div className="flex items-center space-x-2">
          <span>Low</span>
          <div className="w-2.5 h-2.5 rounded bg-cyan-950/25 border border-white/5" />
          <div className="w-2.5 h-2.5 rounded bg-cyan-500/40 border border-cyan-500/10" />
          <div className="w-2.5 h-2.5 rounded bg-orange-500/80 border border-orange-500/25" />
          <div className="w-2.5 h-2.5 rounded bg-pink-500 border border-pink-400/30" />
          <span>High</span>
        </div>
      </div>
      
      <div className="grid grid-cols-12 gap-2">
        {/* Categories Labels */}
        <div className="col-span-3 flex flex-col justify-around space-y-1 pr-2 text-[10px] text-gray-400 font-bold uppercase">
          {categories.map((cat) => (
            <div key={cat} className="truncate" title={cat}>
              {cat}
            </div>
          ))}
        </div>

        {/* Heat Grid */}
        <div className="col-span-9 flex flex-col space-y-2">
          {heatmapData.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-7 gap-1.5">
              {row.map((val, cIdx) => (
                <div
                  key={cIdx}
                  className={`aspect-square rounded border flex items-center justify-center transition-all hover:scale-110 cursor-crosshair ${getHeatColor(val)}`}
                  title={`${categories[rIdx]} risk level: ${Math.floor(val * 100)}%`}
                />
              ))}
            </div>
          ))}
          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1.5 pt-1 text-[9px] text-gray-500 text-center uppercase font-bold">
            {days.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}