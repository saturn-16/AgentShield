"use client";

import React from "react";

export default function RiskHeatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const categories = [
    "Prompt Injection",
    "Jailbreak Attempt",
    "Data Leakage",
    "Malicious Domain"
  ];

  