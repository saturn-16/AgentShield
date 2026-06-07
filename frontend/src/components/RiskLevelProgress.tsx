"use client";

import React from "react";

interface RiskLevelProgressProps {
  level: number;
}

export default function RiskLevelProgress({ level }: RiskLevelProgressProps) {
  const totalSegments = 12;
  const clampedLevel = Math.max(1, Math.min(level, totalSegments));

  return (
    <div className="flex items-center space-x-[2px] h-[16px] select-none" title={`Risk Level: ${clampedLevel}/${totalSegments}`}>
      {Array.from({ length: totalSegments }).map((_, index) => {
        const isFilled = index < clampedLevel;
        
        let segmentColor = "bg-[#251D3A]";
        let glowStyle = {};

        if (isFilled) {
          if (clampedLevel >= 10) {
            segmentColor = "bg-gradient-to-b from-[#EC4899] to-[#8B5CF6]";
            glowStyle = {
              boxShadow: "0 0 6px rgba(236, 72, 153, 0.4)",
            };
          } else if (clampedLevel >= 7) {
            segmentColor = "bg-gradient-to-b from-[#A855F7] to-[#6366F1]";
            glowStyle = {
              boxShadow: "0 0 5px rgba(168, 85, 247, 0.35)",
            };
          } else {
            segmentColor = "bg-gradient-to-b from-[#3B82F6] to-[#4F46E5]";
            glowStyle = {
              boxShadow: "0 0 4px rgba(59, 130, 246, 0.3)",
            };
          }
        }

        return (
          <div
            key={index}
            className={`w-[4px] h-[11px] rounded-[1px] transition-all duration-300 ${segmentColor}`}
            style={glowStyle}
          />
        );
      })}
    </div>
  );
}
