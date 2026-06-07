"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";

import { Report } from "@/types";
import { FileText, Plus, Eye, Download, ShieldCheck, Terminal, X, RefreshCw, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { gsapUtils } from "@/lib/gsap";

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  