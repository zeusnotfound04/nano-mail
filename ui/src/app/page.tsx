"use client";
import AnimatedBackground from "@/components/AnimatedBackground";
import BlurText from "@/components/BlurText";
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
           
              <BlurText
                text=" Fast. Private. Disposable. This is NanoMail."
                delay={280}
                animateBy="words"
                direction="top"
                highlightWords={[{ word: "NanoMail", color: "#11ba93" }]}
                className="text-4xl text-center md:text-6xl font-bold text-white mb-6"
              />
            <p className="text-md text-gray-300 mb-8">
           Inboxes that exist when you need them. No signups. No tracking. No trace. Just raw, unfiltered access for the internet’s underground.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-[#00D8FF] to-[#427F39] rounded-full text-white font-medium text-lg shadow-lg shadow-[#00D8FF]/20"
              >
                Get Started
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-black/30 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium text-lg hover:bg-black/50 transition-colors"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
