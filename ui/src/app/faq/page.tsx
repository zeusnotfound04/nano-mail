"use client";
import AnimatedBackground from "@/components/AnimatedBackground";
import BlurText from "@/components/BlurText";
import Faq from "@/components/FAQ";
import Navbar from "@/components/Navbar";
import { motion } from "motion/react";
import { useState } from "react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <Navbar />
      
      <main className="relative min-h-screen w-full">
        {/* Enhanced email-themed animated background */}
        <AnimatedBackground 
          auroraColors={["#00D8FF", "#427F39", "#00D8FF"]}
          primaryParticleColor="#00D8FF"
          secondaryParticleColor="#427F39"
          particleDensity={15}
          auroraAmplitude={1.0}
          auroraBlend={0.5}
          auroraSpeed={0.5}
        />
        
        {/* Hero section with mail-themed content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <Faq />
        </div>
      </main>
    </div>
  );
}
