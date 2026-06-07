"use client";

import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Architecture from "@/components/landing/Architecture";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";
import ParticleGridBackground from "@/components/ParticleGridBackground";

export default function Home() {
  return (
    <div className="min-h-screen text-gray-200 relative font-sans overflow-x-hidden select-none bg-[#020106]">
      {/* Drifting HTML5 Canvas particle backdrop */}
      <ParticleGridBackground />

      <div className="relative z-10 w-full flex flex-col items-center">
        <Navbar />
        <Hero />
        <Features />
        <Architecture />
        <Pricing />
        <FAQ />
        <Contact />
        <Footer />
      </div>
    </div>
  );
}
