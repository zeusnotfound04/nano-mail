"use client";
import React from "react";
import { motion } from "motion/react";

interface EmailParticleBackgroundProps {
  density?: number;
}

const EmailParticleBackground: React.FC<EmailParticleBackgroundProps> = ({ 
  density = 20
}) => {
  const particles = React.useMemo(() => {
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 10
    }));
  }, [density]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-[#00D8FF] opacity-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Decorative envelope symbols */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`envelope-${i}`}
          className="absolute text-[#427F39] opacity-10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 20 + 10}px`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0, -10, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 20,
            delay: Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ✉
        </motion.div>
      ))}

      {/* Digital circuit-like lines */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%" className="opacity-10">
          <motion.path
            d="M0,50 Q25,25 50,50 T100,50"
            stroke="#00D8FF"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M0,70 C30,60 70,80 100,70"
            stroke="#427F39"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 1 }}
          />
          <motion.path
            d="M20,0 C20,50 80,50 80,100"
            stroke="#00D8FF"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2 }}
          />
        </svg>
      </div>
    </div>
  );
};

export default EmailParticleBackground;