"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";

import { SecurityEvent } from "@/types";
import { ShieldAlert, AlertTriangle, Info, Terminal, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { getSeverityColor, formatDate } from "@/lib/utils";
import { gsapUtils } from "@/lib/gsap";

export default function ThreatMonitor() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));
    setEvents([]); 