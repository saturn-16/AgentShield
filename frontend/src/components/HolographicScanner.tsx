"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HolographicScannerProps {
  active: boolean;
}

export default function HolographicScanner({ active }: HolographicScannerProps) {
  const [shouldRender, setShouldRender] = useState(active);

  useEffect(() => {
    if (active) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <AnimatePresence>
      {active && shouldRender && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-25 bg-cyan-500/[0.015]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,240,255,0.08)_50%),linear-gradient(90deg,rgba(0,240,255,0.03),rgba(0,240,255,0)_20%,rgba(0,240,255,0)_80%,rgba(0,240,255,0.03))] bg-[length:100%_4px,100%_100%] pointer-events-none" />

          <motion.div
            initial={{ y: "-10%" }}
            animate={{ y: "110%" }}
            transition={{
              duration: 2.2,
              ease: "easeInOut",
              repeat: Infinity
            }}
            className="absolute left-0 w-full h-[6px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent"
            style={{
              boxShadow: "0 0 16px #00F0FF, 0 0 8px rgba(0, 240, 255, 0.8)",
            }}
          />

          <div className="absolute top-1/4 left-0 w-full h-[1px] bg-cyan-400/20 animate-pulse" />
          <div className="absolute top-2/3 left-0 w-full h-[2px] bg-pink-500/10 animate-pulse" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
