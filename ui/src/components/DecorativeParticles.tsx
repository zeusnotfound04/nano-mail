"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface DecorativeParticlesProps {
  isInputFocused: boolean;
  pulseEffect: boolean;
}

export default function DecorativeParticles({ isInputFocused, pulseEffect }: DecorativeParticlesProps) {
  const particles = useMemo(() => (
    [...Array(4)].map((_, i) => (
      <motion.div
        key={`particle-${i}`}
        className="absolute w-1 h-1 rounded-full"
        style={{
          background: i % 2 === 0 ? "#00D8FF" : "#427F39",
          boxShadow: i % 2 === 0 
            ? "0 0 4px 1px rgba(0, 216, 255, 0.7)" 
            : "0 0 4px 1px rgba(66, 127, 57, 0.7)"
        }}
        initial={{
          opacity: 0,
          top: "50%",
          left: "50%",
          x: 0,
          y: 0
        }}
        animate={{
          opacity: (isInputFocused || pulseEffect) ? [0, 0.9, 0] : 0,
          x: (i % 4 < 2 ? -1 : 1) * (40 + Math.random() * 60) * (i % 2 === 0 ? 1.2 : 1),
          y: (i < 4 ? -1 : 1) * (40 + Math.random() * 60) * (i % 3 === 0 ? 1.2 : 1),
        }}
        transition={{
          duration: 1.5 + Math.random(),
          delay: Math.random() * 0.4,
          ease: "easeOut",
          repeat: isInputFocused ? 1 : pulseEffect ? 1 : 0,
          repeatDelay: 1
        }}
        suppressHydrationWarning
      />
    ))
  ), [isInputFocused, pulseEffect]);

  return <div suppressHydrationWarning>{particles}</div>;
}