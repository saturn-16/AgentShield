"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface TrustGaugeProps {
  score: number;
  size?: number;
}

export default function TrustGauge({ score, size = 200 }: TrustGaugeProps) {
  const needleRef = useRef<SVGLineElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    