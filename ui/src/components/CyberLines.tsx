"use client";
import { motion } from "motion/react";
import { useMemo } from "react";

interface CyberLinesProps {
  dataPulse: boolean;
}

export default function CyberLines({ dataPulse }: CyberLinesProps) {
  const cyberLines = useMemo(() => (
    [...Array(6)].map((_, i) => {
      const isVertical = i % 2 === 0;
      const position = 15 + (i * 15);
      
      return (
        <motion.div
          key={`cyber-line-${i}`}
          className={`absolute bg-cyan-400 opacity-40 ${isVertical ? "w-[1px]" : "h-[1px]"}`}
          style={{
            [isVertical ? 'height' : 'width']: `${15 + Math.random() * 20}%`,
            [isVertical ? 'left' : 'top']: `${position}%`,
            [isVertical ? 'top' : 'left']: `${Math.random() * 80}%`,
            boxShadow: "0 0 3px rgba(0, 216, 255, 0.5)",
          }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: dataPulse ? [0.1, 0.6, 0.1] : [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.1
          }}
        />
      );
    })
  ), [dataPulse]);

  return <>{cyberLines}</>;
}