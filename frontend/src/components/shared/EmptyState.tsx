import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-xl border border-dashed border-shield-border bg-shield-surface/30">
      <div className="w-12 h-12 rounded-full bg-shield-surface-alt flex items-center justify-center border border-shield-border mb-4">
        <Icon className="w-5 h-5 text-shield-text-muted" />
      </div>
      <h3 className="font-semibold text-sm text-shield-text mb-1">{title}</h3>
      <p className="text-xs text-shield-text-muted max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && action}
    </div>
  );
}
