"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface CircleProps {
  id: number;
  top: string;
  left: string;
  delay: number;
}

const LoadingAnimation: React.FC = () => {
  // State to hold client-side generated circle positions
  const [circles, setCircles] = useState<CircleProps[]>([]);

  // Generate circle positions on client-side only to avoid hydration mismatch
  useEffect(() => {
    const generatedCircles = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      top: `${50 + 35 * Math.sin(i * (2 * Math.PI / 5))}%`,
      left: `${50 + 35 * Math.cos(i * (2 * Math.PI / 5))}%`,
      delay: i * 0.2
    }));
    
    setCircles(generatedCircles);
  }, []);

  return (
    <div className="w-full h-[500px] bg-black/40 backdrop-blur-md rounded-xl border border-[#00D8FF]/20 overflow-hidden shadow-lg flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 mb-8">
        {/* Envelope animation */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1.1, 1],
            opacity: [0, 1, 1],
          }}
          transition={{ 
            duration: 2, 
            ease: "easeInOut", 
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 1 
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-full h-full text-[#00D8FF]"
          >
            <path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4.5" />
            <path d="m22 10.5-8.45 4.225a2 2 0 0 1-1.1.275 2 2 0 0 1-1.1-.275L3 10.5" />
          </svg>
        </motion.div>

        {/* Circular pulse */}
        <motion.div
          className="absolute inset-0 w-full h-full rounded-full border-2 border-[#427F39]"
          initial={{ scale: 0.2, opacity: 0.7 }}
          animate={{
            scale: [0.2, 2],
            opacity: [0.7, 0],
          }}
          transition={{ 
            duration: 2, 
            ease: "easeOut", 
            repeat: Infinity,
            repeatDelay: 0.5 
          }}
        />
        
        {/* Smaller decorative circles - only rendered client-side */}
        {circles.map((circle) => (
          <motion.div
            key={circle.id}
            className="absolute w-3 h-3 rounded-full bg-[#00D8FF]"
            style={{
              top: circle.top,
              left: circle.left,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: circle.delay,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}
      </div>

      {/* Text animation */}
      <div className="flex items-center space-x-1 text-white text-lg mb-2">
        <span>Checking for emails</span>
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.span
            key={i}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.3,
              repeatDelay: 0.5,
            }}
            className="text-[#00D8FF] text-xl"
          >
            .
          </motion.span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-black/40 rounded-full overflow-hidden mt-4">
        <motion.div
          className="h-full bg-gradient-to-r from-[#00D8FF] to-[#427F39]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      </div>

      {/* Helpful message */}
      <motion.p 
        className="text-white/60 text-sm max-w-md text-center mt-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        Your temporary inbox is being refreshed. New emails will appear automatically once they arrive.
      </motion.p>

      {/* Circuit lines animation */}
      <svg width="100%" height="100%" className="absolute inset-0 opacity-10 pointer-events-none">
        <motion.path
          d="M0,50 Q50,20 100,50 T200,50"
          stroke="#00D8FF"
          strokeWidth="0.8"
          fill="none"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M20,10 C40,80 120,30 200,60"
          stroke="#427F39"
          strokeWidth="0.8"
          fill="none"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </svg>
    </div>
  );
};

export default LoadingAnimation;