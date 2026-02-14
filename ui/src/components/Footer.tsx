"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const Footer: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  
  
  const primaryColor = "#4d5250"; 
  const secondaryColor = "#757575"; 
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    
    const pulseInterval = setInterval(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 800);
    }, 3000);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <motion.div 
      className="fixed bottom-4 left-0 right-0 w-full flex justify-center items-center z-40"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
    >
      <motion.div 
        className={`relative px-6 py-2 rounded-full bg-black/70 backdrop-blur-md border border-${primaryColor}/30 shadow-lg overflow-hidden cursor-pointer`}
        whileHover={{ scale: 1.05 }}
        animate={{ 
          boxShadow: pulseEffect 
            ? [`0 0 25px ${primaryColor}80`, `0 0 30px ${primaryColor}90`, `0 0 25px ${primaryColor}80`]
            : [`0 0 10px ${primaryColor}50`, `0 0 15px ${primaryColor}70`, `0 0 10px ${primaryColor}50`]
        }}
        transition={{ 
          boxShadow: { 
            repeat: Infinity, 
            duration: pulseEffect ? 0.8 : 3,
            ease: "easeInOut"
          }
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Ambient glow effect */}
        <motion.div 
          className={`absolute inset-0 rounded-full bg-gradient-to-r from-${primaryColor}/20 via-${secondaryColor}/10 to-${primaryColor}/20 opacity-80 blur-md`}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            filter: pulseEffect ? "brightness(1.5) blur-md" : "brightness(1) blur-md"
          }}
          transition={{
            backgroundPosition: {
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            },
            filter: {
              duration: 0.4
            }
          }}
        />
        
        {isHovered && (
          <motion.div 
            className={`absolute w-32 h-32 rounded-full bg-white/30 blur-xl mix-blend-screen`}
            animate={{
              x: mousePosition.x - 150,
              y: mousePosition.y - 350,
              opacity: 0.6
            }}
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 200
            }}
          />
        )}
        
        <EnhancedParticleEffect primaryColor={primaryColor} secondaryColor={secondaryColor} isHovered={isHovered} />
        
        <motion.div 
          className={`absolute inset-0 rounded-full border-2 border-${primaryColor}/0`}
          animate={isHovered ? {
            borderColor: [`${primaryColor}60`, `${secondaryColor}60`, `${primaryColor}60`],
            rotate: [0, 10, 0], 
          } : {
            borderColor: `${primaryColor}00`,
            rotate: 0
          }}
          transition={{ 
            duration: 2,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="text-sm md:text-base font-medium text-white/90 flex items-center justify-center relative z-10 cursor-pointer"
          animate={isHovered ? { letterSpacing: "0.05em" } : { letterSpacing: "0" }}
          transition={{ duration: 0.3 }}
          onClick={() => window.open('https://zeusnotfound.tech', '_blank')}
        >
          Built by Zeus{" "}
          <motion.span 
            className="relative mx-1 font-bold"
            style={{ color: primaryColor }}
            animate={{ 
              color: [primaryColor, secondaryColor, primaryColor],
              textShadow: [
                `0 0 5px ${primaryColor}80`, 
                `0 0 10px ${primaryColor}A0`, 
                `0 0 5px ${primaryColor}80`
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            NotFound
          </motion.span>
          
          <motion.span
            className="relative"
            style={{ width: 0, height: 0 }}
          >
            <motion.span 
              className="absolute -bottom-1 left-[-58px] h-0.5 rounded-full"
              style={{ backgroundColor: primaryColor }}
              initial={{ width: "0%" }}
              animate={isHovered ? { 
                width: ["0%", "100%", "90%", "100%"],
                x: [0, 0, 2, 0]
              } : { 
                width: "0%" 
              }}
              transition={{ 
                duration: 0.8,
                times: [0, 0.6, 0.8, 1]
              }}
            />
          </motion.span>
          
          <motion.span 
            className="ml-1 text-xs relative"
            style={{ color: `${primaryColor}B0` }}
            animate={{ 
              rotate: [0, 10, 0, -10, 0],
              scale: pulseEffect ? [1, 1.5, 1] : [1, 1.1, 1],
            }}
            transition={{ 
              rotate: {
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              },
              scale: {
                duration: pulseEffect ? 0.8 : 2,
              }
            }}
          >
            
            
            <motion.div 
              className="absolute inset-0 rounded-full bg-gradient-radial from-white/50 to-transparent blur-sm opacity-0"
              animate={pulseEffect ? { 
                scale: [1, 3],
                opacity: [0, 0.8, 0]
              } : {}}
              transition={{ duration: 0.8 }}
            />
          </motion.span>
        </motion.div>
        
        <div className="absolute bottom-0 left-0 right-0 flex justify-center h-0.5 overflow-hidden">
          <AudioBars primaryColor={primaryColor} isHovered={isHovered} />
        </div>
      </motion.div>
    </motion.div>
  );
};

interface EnchancePraticleProp {
  primaryColor: string;
  secondaryColor: string;
  isHovered: boolean;
}
const EnhancedParticleEffect = ({ primaryColor, secondaryColor, isHovered }: EnchancePraticleProp) => {
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ 
              backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
              opacity: 0
            }}
          />
        ))}
      </>
    );
  }
  
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{ 
            backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
            opacity: 0
          }}
          animate={isHovered ? { 
            y: [0, -30, 0],
            x: [0, (i * 7) % 60 - 30, 0],
            opacity: [0, 0.9, 0],
            scale: [0.5, 1.2, 0.5]
          } : { 
            y: [0, -15, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2 + (i % 3) * 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </>
  );
};
interface AudioBarProp {
  primaryColor: string;
  isHovered: boolean;
}
const AudioBars = ({ primaryColor, isHovered } : AudioBarProp) => {
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="flex space-x-0.5">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-t-sm"
            style={{ 
              backgroundColor: primaryColor,
              height: 2
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-0.5">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-t-sm"
          style={{ backgroundColor: primaryColor }}
          initial={{ height: 2 }}
          animate={isHovered ? {
            height: [
              2 + Math.sin(i * 0.8) * 6,
              2 + Math.cos(i * 1.2) * 12,
              2 + Math.sin(i * 0.8) * 6
            ]
          } : {
            height: [
              2,
              2 + Math.sin(i * 0.5) * 3,
              2
            ]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default Footer;