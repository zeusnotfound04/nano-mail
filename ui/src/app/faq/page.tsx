"use client";
import AnimatedBackground from "@/components/AnimatedBackground";

import Faq from "@/components/FAQ";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <Navbar />
      
      <main className="relative min-h-screen w-full">
        <AnimatedBackground 
          auroraColors={["#00D8FF", "#427F39", "#00D8FF"]}
          primaryParticleColor="#00D8FF"
          secondaryParticleColor="#427F39"
          particleDensity={15}
          auroraAmplitude={1.0}
          auroraBlend={0.5}
          auroraSpeed={0.5}
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <Faq />
        </div>
      </main>
    </div>
  );
}
