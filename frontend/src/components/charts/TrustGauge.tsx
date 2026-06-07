"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface TrustGaugeProps {
  score: number;
  size?: number;
}

export default function TrustGauge({ score, size = 200 }: TrustGaugeProps) {
  const needleRef = useRef<SVGLineElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const angle = (score / 100) * 180 - 90; // -90 deg to 90 deg
    if (needleRef.current) {
      gsap.to(needleRef.current, {
        rotation: angle,
        transformOrigin: "50% 100%",
        duration: 1.5,
        ease: "power3.out",
      });
    }
    if (textRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: score,
        duration: 1.5,
        ease: "power3.out",
        onUpdate: () => {
          if (textRef.current) {
            textRef.current.innerText = `${Math.floor(obj.val)}%`;
          }
        },
      });
    }
  }, [score]);

  const strokeWidth = 12;
  const center = 100;

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size / 1.5 }}>
      <svg width={size} height={size} viewBox="0 0 200 200" className="overflow-visible">
        {/* Background Arc */}
        <path
          d="M 30 100 A 70 70 0 0 1 170 100"
          fill="none"
          stroke="#1e1e2d"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Highlight Gradient Arc */}
        <path
          d="M 30 100 A 70 70 0 0 1 170 100"
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="220"
          strokeDashoffset={220 * (1 - score / 100)}
          className="transition-all duration-[1500ms] ease-out"
        />
        {/* Definitions for Gradient */}
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        
        {/* Needle Pin */}
        <circle cx={center} cy={100} r="6" fill="#ffffff" />
        
        {/* Needle */}
        <line
          ref={needleRef}
          x1={center}
          y1={100}
          x2={center}
          y2={45}
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {/* Center text score display */}
      <div className="absolute bottom-2 flex flex-col items-center">
        <div ref={textRef} className="text-3xl font-black tracking-tight text-white">
          {score}%
        </div>
        <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">TRUST RATIO</span>
      </div>
    </div>
  );
}