"use client";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import CyberLines from "@/components/CyberLines";
import DecorativeParticles from "@/components/DecorativeParticles";

interface EmailInputProps {
  username: string;
  setUsername: (username: string) => void;
}

export default function EmailInput({ username, setUsername }: EmailInputProps) {
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [dataPulse, setDataPulse] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  
  const triggerPulseEffect = useCallback(() => {
    setPulseEffect(true);
    setTimeout(() => setPulseEffect(false), 2000);
  }, []);
  
  const triggerDataPulse = useCallback(() => {
    setDataPulse(true);
    setTimeout(() => setDataPulse(false), 800);
  }, []);
  
  useEffect(() => {
    const pulseInterval = setInterval(triggerPulseEffect, 8000);
    const dataInterval = setInterval(triggerDataPulse, 3000);
    
    return () => {
      clearInterval(pulseInterval);
      clearInterval(dataInterval);
    };
  }, [triggerPulseEffect, triggerDataPulse]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="w-full max-w-md mx-auto mt-4 sm:mt-8 relative"
      suppressHydrationWarning
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" suppressHydrationWarning>
        <CyberLines dataPulse={dataPulse} />
        
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`node-${i}`}
            className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
            style={{
              top: `${20 + i * 20}%`,
              left: `${(i % 2 === 0 ? 15 : 85)}%`,
              boxShadow: "0 0 5px rgba(0, 216, 255, 0.7)",
            }}
            animate={{
              opacity: dataPulse ? [0.3, 1, 0.3] : 0.3,
              scale: dataPulse ? [1, 1.3, 1] : 1,
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
            suppressHydrationWarning
          />
        ))}
      </div>
    
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          background: "transparent",
          border: `1px solid rgba(0, 216, 255, ${isInputFocused ? 0.6 : 0.3})`,
          zIndex: 1
        }}
        animate={{
          borderColor: dataPulse 
            ? ['rgba(0, 216, 255, 0.3)', 'rgba(0, 216, 255, 0.7)', 'rgba(0, 216, 255, 0.3)'] 
            : isInputFocused
              ? 'rgba(0, 216, 255, 0.6)'
              : 'rgba(0, 216, 255, 0.3)'
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <motion.div
          className="absolute w-full h-[2px] bg-cyan-400 opacity-20"
          style={{ boxShadow: "0 0 8px 2px rgba(0, 216, 255, 0.4)" }}
          initial={{ top: "-10%" }}
          animate={{ 
            top: ["-10%", "110%"],
            opacity: isInputFocused ? 0.3 : 0.15
          }}
          transition={{
            duration: 2.5,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
      </motion.div>
      
      {[...Array(4)].map((_, i) => {
        const positions = [
          { top: "-2px", left: "-2px" }, 
          { top: "-2px", right: "-2px" }, 
          { bottom: "-2px", left: "-2px" }, 
          { bottom: "-2px", right: "-2px" }  
        ];
        
        return (
          <motion.div
            key={`corner-${i}`}
            className="absolute w-2 h-2"
            style={{
              ...positions[i],
              zIndex: 1
            }}
          >
            <motion.div
              className="absolute w-2 h-2"
              style={{
                borderTop: i < 2 ? "2px solid rgba(0, 216, 255, 0.8)" : "none",
                borderBottom: i >= 2 ? "2px solid rgba(0, 216, 255, 0.8)" : "none",
                borderLeft: i % 2 === 0 ? "2px solid rgba(0, 216, 255, 0.8)" : "none",
                borderRight: i % 2 === 1 ? "2px solid rgba(0, 216, 255, 0.8)" : "none",
              }}
              animate={{
                opacity: dataPulse ? [0.7, 1, 0.7] : isInputFocused ? 1 : 0.7
              }}
              transition={{ 
                duration: 0.8,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        );
      })}
      
      <DecorativeParticles isInputFocused={isInputFocused} pulseEffect={pulseEffect} />
      
      <div 
        className={cn(
          "flex flex-col sm:flex-row items-stretch sm:items-center border border-opacity-40 rounded-lg bg-[#121212] bg-opacity-80 overflow-hidden transition-all duration-200 backdrop-blur-sm relative z-10",
          isInputFocused 
            ? "border-cyan-400 shadow-[0_0_8px_rgba(0,216,255,0.3)]" 
            : "border-gray-700 hover:border-gray-500 hover:shadow-[0_0_5px_rgba(40,40,40,0.4)]"
        )}
      >
        {isInputFocused && (
          <motion.div 
            className="absolute inset-0 rounded-lg"
            style={{ 
              background: `radial-gradient(circle at 50% 50%, rgba(0, 216, 255, 0.07), transparent 70%)`,
              zIndex: -1 
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
        
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_.]/g, ''))}
          placeholder="username"
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          className="flex-1 bg-transparent py-3 px-4 text-white placeholder-gray-500 outline-none relative z-10"
          aria-label="Enter your desired username"
        />
        <div className="bg-[#1a1a1a] py-2 sm:py-3 px-3 text-sm sm:text-base text-center text-gray-300 font-bold border-t sm:border-t-0 sm:border-l border-gray-700 relative z-10">
          @zeus.nanomail.live
        </div>
      </div>
      
      <motion.div 
        className="absolute -bottom-1 left-0 right-0 h-[1px] overflow-hidden"
        style={{ zIndex: -1 }}
      >
        {isInputFocused && (
          <motion.div
            className="absolute h-full"
            style={{
              background: "linear-gradient(90deg, transparent, #00D8FF, transparent)",
              boxShadow: "0 0 6px rgba(0, 216, 255, 0.6)",
              width: "30%"
            }}
            animate={{ left: ["-30%", "100%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear"
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}