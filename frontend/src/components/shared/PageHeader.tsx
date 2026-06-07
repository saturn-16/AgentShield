import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gradient">{title}</h2>
        <p className="text-xs md:text-sm text-shield-text-muted mt-1">{description}</p>
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
