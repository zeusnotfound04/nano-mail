"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CopyEmailButtonProps {
  emailAddress: string;
}

const CopyEmailButton: React.FC<CopyEmailButtonProps> = ({ emailAddress }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Effect to detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to copy email address", error);
    }
  };

  return (
    <div className="relative w-full sm:w-auto">
      <motion.button
        onClick={handleCopy}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-[#00D8FF]/20 to-[#427F39]/20 rounded-lg border border-[#00D8FF]/30 hover:border-[#00D8FF]/70 transition-all hover:shadow-lg hover:shadow-[#00D8FF]/20 text-white group w-full sm:w-auto"
      >
        <motion.span 
          className="font-medium text-sm sm:text-base"
          animate={{ color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.9)' }}
        >
          Copy Address
        </motion.span>
        <motion.div
          animate={{ 
            rotate: showSuccess ? 360 : 0,
            scale: showSuccess ? [1, 1.2, 1] : 1,
          }}
          transition={{ 
            duration: showSuccess ? 0.5 : 0.3,
            ease: "easeInOut"
          }}
        >
          {showSuccess ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 sm:h-5 sm:w-5 text-[#427F39]" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 sm:h-5 sm:w-5 text-[#00D8FF] group-hover:text-white transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
              />
            </svg>
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`${isMobile ? 'fixed inset-x-4 bottom-20 z-50' : 'absolute top-full left-0 mt-3'} px-4 py-3 bg-black/80 backdrop-blur-md text-[#00D8FF] text-sm rounded-lg border border-[#00D8FF]/30 flex items-center gap-3 whitespace-nowrap shadow-lg shadow-black/30 z-50`}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#427F39] flex items-center justify-center flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <div className={isMobile ? "flex-1" : ""}>
              <p className="font-medium text-xs sm:text-sm">Email copied to clipboard</p>
              <p className="text-white/60 text-[10px] sm:text-xs mt-0.5 break-all">{emailAddress}</p>
            </div>
            {isMobile && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSuccess(false)}
                className="rounded-full w-5 h-5 flex items-center justify-center bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CopyEmailButton;