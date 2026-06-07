"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import TrustGauge from "@/components/charts/TrustGauge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Activity, ShieldAlert, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TrustData {
  score: number;
  factors: {
    prompt_safety: number;
    url_safety: number;
    leakage_risk: number;
    behavioral_risk: number;
  };
  risk_classification: string;
  trend: Array<{ score: number; created_at: string }>;
}

export default function TrustCenter() {
  const [data, setData] = useState<TrustData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const mockData: TrustData = {
    score: 88,
    factors: { prompt_safety: 85, url_safety: 90, leakage_risk: 95, behavioral_risk: 100 },
    risk_classification: "Low Risk",
    trend: [],
  };

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    await new Promise(r => setTimeout(r, 800));
    setData({ ...mockData, score: 85 + Math.floor(Math.random() * 12) });
    setIsRecalculating(false);
  };

  useEffect(() => {
    setTimeout(() => { setData(mockData); setIsLoading(false); }, 200);
  }, []);

  