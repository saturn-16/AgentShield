"use client";

import React, { useEffect, useRef, useState } from "react";

export interface SwarmNode {
  id: string;
  name: string;
  role: string;
  status: "Active" | "Scanning" | "Alert" | "Clean" | "Offline";
  safety_score: number;
  uptime: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Packet {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  color: string;
  speed: number;
  nodeIndex: number;
}

interface TelemetryStreamPoint {
  progress: number;
  speed: number;
  color: string;
}

interface AgentSwarmNetworkProps {
  onNodeSelect?: (node: SwarmNode) => void;
  triggerScanPayload?: string | null;
  scanVerdict?: "Blocked" | "Safe" | null;
  activePulseIntensified?: boolean;
}

export default function AgentSwarmNetwork({ 
  onNodeSelect, 
  triggerScanPayload, 
  scanVerdict, 
  activePulseIntensified = false 
}: AgentSwarmNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<SwarmNode | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  const nodesRef = useRef<SwarmNode[]>([]);
  const packetsRef = useRef<Packet[]>([]);
  
  const telemetryStreamsRef = useRef<{
    sentinel_to_analyzer: TelemetryStreamPoint[];
    analyzer_to_validator: TelemetryStreamPoint[];
    validator_to_reporter: TelemetryStreamPoint[];
  }>({
    sentinel_to_analyzer: Array.from({ length: 6 }, (_, i) => ({ progress: i * 0.16, speed: 0.002, color: "#00F0FF" })),
    analyzer_to_validator: Array.from({ length: 6 }, (_, i) => ({ progress: i * 0.16, speed: 0.002, color: "#00F0FF" })),
    validator_to_reporter: Array.from({ length: 6 }, (_, i) => ({ progress: i * 0.16, speed: 0.002, color: "#00F0FF" }))
  });

  const pulseScaleRef = useRef(1);
  const pulseDirRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let rect = canvas.getBoundingClientRect();
    let w = (canvas.width = rect.width);
    let h = (canvas.height = rect.height);

    const initialNodes: SwarmNode[] = [
      { id: "sentinel", name: "Sentinel Agent", role: "Input Guardrail", status: "Active", safety_score: 98, uptime: "99.98%", x: w * 0.16, y: h * 0.5, vx: 0.04, vy: 0.06, radius: 26, color: "#00F0FF" },
      { id: "analyzer", name: "Analyzer Agent", role: "Deep Parser", status: "Active", safety_score: 92, uptime: "99.95%", x: w * 0.38, y: h * 0.32, vx: -0.05, vy: 0.03, radius: 26, color: "#3B82F6" },
      { id: "validator", name: "Validator Agent", role: "Compliance Masker", status: "Active", safety_score: 96, uptime: "99.99%", x: w * 0.62, y: h * 0.68, vx: 0.06, vy: -0.04, radius: 26, color: "#F97316" },
      { id: "reporter", name: "Reporter Agent", role: "SIEM Alert Publisher", status: "Active", safety_score: 99, uptime: "99.96%", x: w * 0.84, y: h * 0.5, vx: -0.04, vy: -0.05, radius: 26, color: "#10B981" },
      
      { id: "smtp", name: "SMTP Mail Gate", role: "Email Stream", status: "Active", safety_score: 95, uptime: "99.92%", x: w * 0.16, y: h * 0.18, vx: 0.03, vy: -0.03, radius: 15, color: "#7000FF" },
      { id: "azure", name: "Active Directory Bridge", role: "IAM Check", status: "Active", safety_score: 100, uptime: "99.99%", x: w * 0.38, y: h * 0.82, vx: -0.04, vy: -0.02, radius: 15, color: "#7000FF" },
      { id: "db_sync", name: "AgentSQL Sync Core", role: "Storage Lock", status: "Active", safety_score: 97, uptime: "99.97%", x: w * 0.62, y: h * 0.18, vx: 0.02, vy: 0.04, radius: 15, color: "#7000FF" },
      { id: "vector", name: "FAISS Vector Store", role: "RAG Embeddings", status: "Active", safety_score: 99, uptime: "99.98%", x: w * 0.84, y: h * 0.82, vx: -0.03, vy: 0.03, radius: 15, color: "#7000FF" }
    ];

    nodesRef.current = initialNodes;

    const handleMouseMove = (e: MouseEvent) => {
      const crect = canvas.getBoundingClientRect();
      const mx = e.clientX - crect.left;
      const my = e.clientY - crect.top;

      let found: SwarmNode | null = null;
      nodesRef.current.forEach((n) => {
        const dx = n.x - mx;
        const dy = n.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < n.radius + 6) {
          found = n;
        }
      });

      setHoveredNode(found);
      if (found) {
        setHoverPos({ x: e.clientX - crect.left + 20, y: e.clientY - crect.top - 80 });
      }
    };

    const handleMouseClick = (e: MouseEvent) => {
      const crect = canvas.getBoundingClientRect();
      const mx = e.clientX - crect.left;
      const my = e.clientY - crect.top;

      nodesRef.current.forEach((n) => {
        const dx = n.x - mx;
        const dy = n.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < n.radius + 6 && onNodeSelect) {
          onNodeSelect(n);
        }
      });
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleMouseClick);

    const draw = () => {
      rect = canvas.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
      ctx.clearRect(0, 0, w, h);

      const SOCglow = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w / 2);
      SOCglow.addColorStop(0, "rgba(0, 240, 255, 0.02)");
      SOCglow.addColorStop(1, "transparent");
      ctx.fillStyle = SOCglow;
      ctx.fillRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const streams = telemetryStreamsRef.current;

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < n.radius + 15 || n.x > w - n.radius - 15) n.vx *= -1;
        if (n.y < n.radius + 15 || n.y > h - n.radius - 15) n.vy *= -1;
      });

      const pulseSpeed = (scanVerdict === "Blocked" || activePulseIntensified) ? 0.025 : 0.012;
      pulseScaleRef.current += pulseDirRef.current * pulseSpeed;
      if (pulseScaleRef.current >= 1.25) {
        pulseScaleRef.current = 1.25;
        pulseDirRef.current = -1;
      } else if (pulseScaleRef.current <= 0.95) {
        pulseScaleRef.current = 0.95;
        pulseDirRef.current = 1;
      }

      const isBreachActive = scanVerdict === "Blocked" || activePulseIntensified;

      const drawLinkWithStream = (
        from: SwarmNode, 
        to: SwarmNode, 
        streamKey: "sentinel_to_analyzer" | "analyzer_to_validator" | "validator_to_reporter" | null,
        active = false
      ) => {
        ctx.beginPath();
        ctx.strokeStyle = isBreachActive 
          ? "rgba(255, 0, 127, 0.15)" 
          : active 
          ? "rgba(0, 240, 255, 0.12)" 
          : "rgba(112, 0, 255, 0.05)";
        ctx.lineWidth = active ? 1.8 : 1.0;
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        if (streamKey && streams[streamKey]) {
          streams[streamKey].forEach((pt) => {
            pt.progress += pt.speed;
            if (pt.progress >= 1.0) pt.progress = 0;

            const sx = from.x + (to.x - from.x) * pt.progress;
            const sy = from.y + (to.y - from.y) * pt.progress;

            ctx.save();
            ctx.fillStyle = isBreachActive ? "#FF007F" : "#00F0FF";
            ctx.shadowBlur = 4;
            ctx.shadowColor = isBreachActive ? "#FF007F" : "#00F0FF";
            ctx.beginPath();
            ctx.arc(sx, sy, 2.0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        }

        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        
        ctx.save();
        ctx.strokeStyle = isBreachActive ? "#FF007F" : active ? "#00F0FF" : "#7000FF";
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX - 6 * Math.cos(angle - 0.4), midY - 6 * Math.sin(angle - 0.4));
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX - 6 * Math.cos(angle + 0.4), midY - 6 * Math.sin(angle + 0.4));
        ctx.stroke();
        ctx.restore();
      };

      drawLinkWithStream(nodes[0], nodes[1], "sentinel_to_analyzer", true);
      drawLinkWithStream(nodes[1], nodes[2], "analyzer_to_validator", true);
      drawLinkWithStream(nodes[2], nodes[3], "validator_to_reporter", true);

      drawLinkWithStream(nodes[4], nodes[0], null);
      drawLinkWithStream(nodes[5], nodes[1], null);
      drawLinkWithStream(nodes[6], nodes[2], null);
      drawLinkWithStream(nodes[7], nodes[3], null);

      const packets = packetsRef.current;
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;

        const px = p.fromX + (p.toX - p.fromX) * p.progress;
        const py = p.fromY + (p.toY - p.fromY) * p.progress;

        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        
        const angle = Math.atan2(p.toY - p.fromY, p.toX - p.fromX);
        ctx.beginPath();
        ctx.arc(px, py, 6.0, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - 14 * Math.cos(angle), py - 14 * Math.sin(angle));
        ctx.stroke();
        ctx.restore();

        if (p.progress >= 1.0) {
          const nextIndex = p.nodeIndex + 1;
          
          if (nextIndex < 4) {
            nodes[nextIndex].status = "Scanning";
            
            packets.push({
              fromX: nodes[nextIndex - 1].x,
              fromY: nodes[nextIndex - 1].y,
              toX: nodes[nextIndex].x,
              toY: nodes[nextIndex].y,
              progress: 0,
              color: isBreachActive ? "#FF007F" : "#00F0FF",
              speed: 0.015,
              nodeIndex: nextIndex
            });
            nodes[nextIndex - 1].status = "Clean";
          } else {
            if (scanVerdict === "Blocked") {
              nodes.forEach(n => {
                if (["sentinel", "analyzer", "validator", "reporter"].includes(n.id)) n.status = "Alert";
              });
            } else {
              nodes.forEach(n => {
                if (["sentinel", "analyzer", "validator", "reporter"].includes(n.id)) n.status = "Clean";
              });
            }
          }
          packets.splice(i, 1);
        }
      }

      nodes.forEach((n) => {
        const isHovered = hoveredNode?.id === n.id;
        ctx.save();
        
        let nColor = n.color;
        let ringGlow = "rgba(0, 240, 255, 0.2)";
        
        if (n.status === "Scanning") {
          nColor = "#FF9F00";
          ringGlow = "rgba(255, 159, 0, 0.5)";
        } else if (n.status === "Alert") {
          nColor = "#FF007F";
          ringGlow = "rgba(255, 0, 127, 0.6)";
        } else if (n.status === "Clean") {
          nColor = "#00FF66";
          ringGlow = "rgba(0, 255, 102, 0.5)";
        }

        ctx.shadowBlur = isHovered ? 20 : 8;
        ctx.shadowColor = nColor;
        ctx.fillStyle = "#07040E";
        ctx.strokeStyle = nColor;
        ctx.lineWidth = isHovered ? 3.0 : 1.8;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (n.status === "Scanning" || isHovered || isBreachActive) {
          ctx.strokeStyle = ringGlow;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          const pulseR = n.radius + 6 * pulseScaleRef.current;
          ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
          ctx.stroke();
        }

        if (n.status !== "Active") {
          ctx.font = "bold 8px monospace";
          ctx.fillStyle = nColor;
          ctx.textAlign = "center";
          ctx.fillText(`[${n.status.toUpperCase()}]`, n.x, n.y - n.radius - 8);
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let label = n.name.slice(0, 3).toUpperCase();
        if (n.id === "smtp") label = "SMTP";
        if (n.id === "azure") label = "IAM";
        if (n.id === "db_sync") label = "SQL";
        if (n.id === "vector") label = "RAG";

        ctx.fillText(label, n.x, n.y);
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleMouseClick);
    };
  }, [hoveredNode, onNodeSelect, scanVerdict, activePulseIntensified]);

  useEffect(() => {
    if (triggerScanPayload) {
      const nodes = nodesRef.current;
      if (nodes.length >= 4) {
        nodes.forEach(n => n.status = "Active");
        nodes[0].status = "Scanning";

        packetsRef.current = [
          {
            fromX: nodes[0].x,
            fromY: nodes[0].y,
            toX: nodes[1].x,
            toY: nodes[1].y,
            progress: 0,
            color: activePulseIntensified ? "#FF007F" : "#00F0FF",
            speed: 0.015,
            nodeIndex: 0
          }
        ];
      }
    }
  }, [triggerScanPayload, activePulseIntensified]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair z-10" />

      {hoveredNode && (
        <div
          className="absolute bg-[#080512]/95 border text-xs text-gray-300 font-mono rounded-xl p-4 shadow-2xl backdrop-blur-md pointer-events-none z-30 min-w-[200px]"
          style={{
            left: `${hoverPos.x}px`,
            top: `${hoverPos.y}px`,
            borderColor: hoveredNode.status === "Alert" ? "#FF007F" : hoveredNode.status === "Scanning" ? "#FF9F00" : "#00F0FF",
            boxShadow: `0 0 20px ${hoveredNode.status === "Alert" ? "rgba(255, 0, 127, 0.25)" : "rgba(0, 240, 255, 0.15)"}`
          }}
        >
          <span className="text-[12px] font-bold text-white block border-b border-white/10 pb-1.5 mb-2 uppercase">
            🛰. {hoveredNode.name}
          </span>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-500">Pipeline Node:</span>
              <span className="font-bold text-gray-200">{hoveredNode.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Node Status:</span>
              <span className={`font-bold ${
                hoveredNode.status === "Alert" ? "text-pink-500 animate-pulse font-black" :
                hoveredNode.status === "Scanning" ? "text-orange-400" : "text-emerald-400"
              }`}>{hoveredNode.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Safety Index:</span>
              <span className="font-bold text-white font-mono">{hoveredNode.safety_score}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Host Uptime:</span>
              <span className="font-bold text-white font-mono">{hoveredNode.uptime}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
