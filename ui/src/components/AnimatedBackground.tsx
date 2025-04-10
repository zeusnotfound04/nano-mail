"use client";
import React from "react";
import Aurora from "./BackgroundAura";
interface AnimatedBackgroundProps {
  auroraColors?: string[];
  primaryParticleColor?: string;
  secondaryParticleColor?: string;
  particleDensity?: number;
  auroraAmplitude?: number;
  auroraBlend?: number;
  auroraSpeed?: number;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  auroraColors = ["#00D8FF", "#7CFF67", "#00D8FF"],
  auroraAmplitude = 1.0,
  auroraBlend = 0.5,
  auroraSpeed = 0.5,
}) => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" suppressHydrationWarning>
      
      <div className="absolute inset-0 -z-10" suppressHydrationWarning>
        <Aurora
          colorStops={auroraColors}
          amplitude={auroraAmplitude}
          blend={auroraBlend}
          speed={auroraSpeed}
        />
      </div>

      
    </div>
  );
};

export default AnimatedBackground;