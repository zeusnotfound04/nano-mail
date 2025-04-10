"use client";
import { motion } from "motion/react";

export default function CreateInboxButton( { handleCreateInbox }: { handleCreateInbox: () => void }) {
  return (
    <motion.div className="mt-6 relative group">
      <motion.button
        type="button"
        onClick={handleCreateInbox}
        className="px-8 py-3 bg-gradient-to-r from-[#121212] via-[#1a1a1a] to-[#121212] border border-gray-700 text-cyan-50 font-medium rounded-md transition-all duration-200 relative overflow-hidden group-hover:border-cyan-400/50 z-1"
        initial={{ boxShadow: "0 0 0 rgba(0,0,0,0)" }}
        whileHover={{ 
          y: -2, 
          boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
          scale: 1.02
        }}
        whileTap={{ 
          scale: 0.98,
          boxShadow: "0 3px 8px rgba(0,0,0,0.4)"
        }}
      >
        <motion.div 
          className="absolute inset-0 overflow-hidden rounded-md pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <motion.div
            className="absolute h-[1px] bg-cyan-400 opacity-30 bottom-0"
            style={{ 
              boxShadow: "0 0 8px 1px rgba(0, 216, 255, 0.6)",
              width: "30%" 
            }}
            animate={{ 
              left: ["-30%", "100%"],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear"
            }}
          />
          
          <motion.div
            className="absolute w-[1px] bg-cyan-400 opacity-30 right-5 top-0 h-full"
            style={{ boxShadow: "0 0 4px rgba(0, 216, 255, 0.4)" }}
            animate={{ 
              scaleY: [0, 1, 0],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          />
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{ 
            background: "radial-gradient(circle at 50% 50%, rgba(0, 216, 255, 0.08), transparent 70%)",
            zIndex: 0 
          }}
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        <motion.div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`button-particle-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: i % 2 === 0 ? "#00D8FF" : "#427F39",
                boxShadow: i % 2 === 0 
                  ? "0 0 4px 1px rgba(0, 216, 255, 0.7)" 
                  : "0 0 4px 1px rgba(66, 127, 57, 0.7)",
                top: "50%",
                left: "50%",
                x: "-50%",
                y: "-50%",
              }}
              initial={{ opacity: 0 }}
              whileHover={{
                opacity: [0, 0.8, 0],
                x: ["-50%", `${(i%2===0?-1:1) * (Math.random() * 70)}px`],
                y: ["-50%", `${(i<3?-1:1) * (Math.random() * 40)}px`],
              }}
              transition={{
                duration: 1 + Math.random(),
                ease: "easeOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
        
        <motion.div 
          className="relative z-10 flex items-center justify-center"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.2 }}
        >
          <motion.span
            className="text-sm font-medium tracking-wide"
            style={{ textShadow: "0 0 8px rgba(0,216,255,0.3)" }}
            whileHover={{
              textShadow: "0 0 12px rgba(0,216,255,0.6)"
            }}
          >
            Create Inbox
          </motion.span>
          
          {/* Arrow icon */}
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-1.5 opacity-80" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </motion.svg>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}