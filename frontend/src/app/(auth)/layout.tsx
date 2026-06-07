import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-shield-bg flex flex-col items-center justify-center relative overflow-hidden px-4">
      {}
      <div className="absolute top-[20%] left-[15%] w-96 h-96 rounded-full bg-shield-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[15%] w-96 h-96 rounded-full bg-shield-blue/5 blur-[120px] pointer-events-none" />
      
      {}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#21262d1a_1px,transparent_1px),linear-gradient(to_bottom,#21262d1a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  );
}
