"use client";
import AnimatedBackground from "@/components/AnimatedBackground";
import BlurText from "@/components/BlurText";
import Navbar from "@/components/Navbar";
import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [username, setUsername] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

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
           Inboxes that exist when you need them. No signups. No tracking. No trace. Just raw, unfiltered access for the internet's underground.
            </p>
            
            {/* Animated Email Input Field */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="w-full max-w-md mx-auto mt-8 relative"
            >
              <div 
                className={cn(
                  "flex items-center border-2 border-opacity-40 rounded-md bg-black bg-opacity-20 backdrop-blur-sm overflow-hidden transition-all duration-300",
                  isInputFocused 
                    ? "border-[#00D8FF] shadow-[0_0_15px_rgba(0,216,255,0.5)]" 
                    : "border-gray-600 hover:border-[#00D8FF] hover:shadow-[0_0_10px_rgba(0,216,255,0.3)]"
                )}
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_.]/g, ''))}
                  placeholder="username"
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  className="flex-1 bg-transparent py-3 px-4 text-white placeholder-gray-500 outline-none"
                  aria-label="Enter your desired username"
                />
                <div className="bg-white bg-opacity-20 py-3 px-3 text-[#00D8FF] font-medium border-l border-gray-700">
                  @zeus.nanomail.live
                </div>
              </div>
              
              {/* Animated glow effect */}
              <motion.div 
                className="absolute inset-0 -z-10 opacity-40 blur-xl"
                animate={{
                  boxShadow: isInputFocused 
                    ? "0 0 25px 5px rgba(0,216,255,0.7), 0 0 10px 1px rgba(66,127,57,0.5)" 
                    : "0 0 15px 2px rgba(0,216,255,0.4), 0 0 5px 1px rgba(66,127,57,0.3)"
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              />
              
              {/* Generate button */}
              <motion.button
                className="mt-4 px-6 py-2 bg-gradient-to-r from-[#00D8FF] to-[#11ba93] text-black font-medium rounded-md hover:shadow-[0_0_15px_rgba(0,216,255,0.7)] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Create Inbox
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
