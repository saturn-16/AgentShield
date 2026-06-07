import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/shared/Providers";

export const metadata: Metadata = {
  title: "AgentShield AI | Autonomous AI Agent SOC & Security Platform",
  description: "Enterprise-grade real-time security operations center (AI-SOC) for autonomous AI agents. Real-time prompt injection detection, data leakage prevention, and multi-agent swarm orchestration.",
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <title>AgentShield AI | Enterprise Agent Security Platform</title>
        <meta name="description" content="Autonomous AI Agent SOC, Prompt Injection Detection, Data Leakage Guard." />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
