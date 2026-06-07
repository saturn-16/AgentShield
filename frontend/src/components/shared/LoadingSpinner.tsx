import React from "react";
import { Shield } from "lucide-react";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const iconClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        {}
        <div className="absolute inset-0 rounded-full border-2 border-shield-accent/20 border-t-shield-accent animate-spin" />
        
        {}
        <Shield className={`${iconClasses[size]} text-shield-accent animate-pulse`} />
      </div>
      <span className="text-xs text-shield-text-muted font-medium uppercase tracking-wider animate-pulse">
        Initializing Shield Systems...
      </span>
    </div>
  );
}
