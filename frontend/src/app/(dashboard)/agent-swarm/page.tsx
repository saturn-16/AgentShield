"use client";

import React, { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/shared/PageHeader";

import { SwarmResult } from "@/types";
import { gsap } from "gsap";
import { Bot, Play, Sparkles, Terminal, Shield, AlertTriangle, FileText, CheckCircle } from "lucide-react";
import { getSeverityColor } from "@/lib/utils";

export default function AgentSwarm() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "complete">("idle");
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [result, setResult] = useState<SwarmResult | null>(null);
  
  