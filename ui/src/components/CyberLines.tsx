"use client";
import { motion } from "motion/react";
import { useMemo } from "react";

interface CyberLinesProps {
  dataPulse: boolean;
}

// Generate deterministic values based on index instead of Math.random()
function getLineHeight(index: number): number {
  // Use a formula that provides predictable but varied values
  const baseHeights = [27.73, 25.36, 24.88, 28.97, 30.45, 26.52];
  return baseHeights[index % baseHeights.length];
}

function getLinePosition(index: number): number {
  // Use a formula that provides predictable but varied positions
  const basePositions = [31.47, 29.14, 31.25, 66.35, 69.58, 42.37];
  return basePositions[index % basePositions.length];
}

function getLineWidth(index: number): number {
  // Use a formula that provides predictable but varied widths
  const baseWidths = [33.38, 26.12, 34.84, 30.45, 28.00, 32.19];
  return baseWidths[index % baseWidths.length];
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
            [isVertical ? 'height' : 'width']: `${isVertical ? getLineHeight(i) : getLineWidth(i)}%`,
            [isVertical ? 'left' : 'top']: `${position}%`,
            [isVertical ? 'top' : 'left']: `${getLinePosition(i)}%`,
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