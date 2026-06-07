"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Shield, ArrowRight, Play, Server, Cpu, Lock } from "lucide-react";
import { gsapUtils, gsap } from "@/lib/gsap";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  
  const count1Ref = useRef<HTMLSpanElement>(null);
  const count2Ref = useRef<HTMLSpanElement>(null);
  const count3Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    