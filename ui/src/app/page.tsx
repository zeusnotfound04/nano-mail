import AnimatedBackground from "@/components/AnimatedBackground";
import HeroSection from "@/components/HeroSection";
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
        
        <HeroSection />
      </main>
    </div>
  );
}