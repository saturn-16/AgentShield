"use client";

import React, { useEffect, useRef } from "react";

export default function ParticleGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    class TelemetryDot {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      maxAlpha: number;
      alpha: number;
      fadeDirection: number;

      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.12;
        this.vy = (Math.random() - 0.5) * 0.12;
        this.size = Math.random() * 2.0 + 0.6;
        this.color = Math.random() > 0.6 ? "#00F0FF" : "#7000FF";
        this.maxAlpha = Math.random() * 0.22 + 0.08;
        this.alpha = Math.random() * this.maxAlpha;
        this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        this.alpha += this.fadeDirection * 0.002;
        if (this.alpha >= this.maxAlpha) {
          this.alpha = this.maxAlpha;
          this.fadeDirection = -1;
        } else if (this.alpha <= 0.01) {
          this.alpha = 0.01;
          this.fadeDirection = 1;
        }

        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.globalAlpha = this.alpha;
        c.shadowBlur = 3;
        c.shadowColor = this.color;
        c.fillStyle = this.color;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    const telemetryDots: TelemetryDot[] = Array.from({ length: 40 }, () => new TelemetryDot());

    let gridOffset = 0;
    let scanSweepProgress = 0;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = "#020106";
      ctx.fillRect(0, 0, w, h);

      const centerGlow = ctx.createRadialGradient(w * 0.5, h * 0.5, 5, w * 0.5, h * 0.5, w * 0.7);
      centerGlow.addColorStop(0, "rgba(8, 4, 24, 0.5)");
      centerGlow.addColorStop(0.5, "rgba(4, 2, 10, 0.2)");
      centerGlow.addColorStop(1, "transparent");
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(0, 240, 255, 0.02)";
      ctx.lineWidth = 0.6;
      
      gridOffset = (gridOffset + 0.05) % 40;
      
      for (let x = gridOffset; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      
      for (let y = gridOffset; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(112, 0, 255, 0.02)";
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.38, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 0.5;
      for (let i = 0; i < telemetryDots.length; i++) {
        for (let j = i + 1; j < telemetryDots.length; j++) {
          const dx = telemetryDots[i].x - telemetryDots[j].x;
          const dy = telemetryDots[i].y - telemetryDots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120) {
            const connectionAlpha = (1 - dist / 120) * 0.035;
            ctx.strokeStyle = `rgba(0, 240, 255, ${connectionAlpha})`;
            ctx.beginPath();
            ctx.moveTo(telemetryDots[i].x, telemetryDots[i].y);
            ctx.lineTo(telemetryDots[j].x, telemetryDots[j].y);
            ctx.stroke();
          }
        }
      }

      telemetryDots.forEach((dot) => {
        dot.update();
        dot.draw(ctx);
      });

      scanSweepProgress += 0.25;
      if (scanSweepProgress > h + 150) {
        scanSweepProgress = -50;
      }
      
      if (scanSweepProgress > 0 && scanSweepProgress < h) {
        ctx.save();
        ctx.strokeStyle = "rgba(0, 240, 255, 0.015)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, scanSweepProgress);
        ctx.lineTo(w, scanSweepProgress);
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
