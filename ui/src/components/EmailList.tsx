"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

export interface Email {
  id: string;
  from: string;
  subject: string;
  content: string;
  htmlContent?: string;
  timestamp: Date;
  read: boolean;
}

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (emailId: string) => void;
 
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-full bg-black/40 backdrop-blur-md rounded-xl border border-[#00D8FF]/30 overflow-hidden shadow-lg shadow-black/20">
      <div className="p-3 sm:p-4 border-b border-[#00D8FF]/30 flex items-center justify-between bg-black/60">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-[#00D8FF]" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <h2 className="text-[#00D8FF] font-medium text-sm sm:text-base">Inbox</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#427F39]/20 px-1.5 sm:px-2 py-0.5 rounded text-[#427F39] text-xs font-medium border border-[#427F39]/30 hidden sm:block">
            {emails.length} messages
          </span>
          <span className="text-[#427F39] text-xs sm:hidden">
            {emails.length}
          </span>
          <motion.button 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="text-white/60 hover:text-[#00D8FF] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
      </div>
      
      <div className={`divide-y divide-[#00D8FF]/10 ${isMobile ? 'max-h-[70vh]' : 'max-h-[450px]'} overflow-y-auto custom-scrollbar`}>
        <AnimatePresence>
          {emails.length > 0 ? (
            emails.map((email) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => onSelectEmail(email.id)}
                className={`px-3 sm:px-4 py-3 sm:py-4 hover:bg-[#00D8FF]/10 transition-all cursor-pointer group relative ${
                  selectedEmailId === email.id ? "bg-[#00D8FF]/20 border-r-2 border-[#00D8FF]" : ""
                } ${!email.read ? "before:absolute before:left-0 before:top-0 before:w-1 before:h-full before:bg-[#427F39]" : ""}`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`font-medium flex items-center gap-1.5 text-xs sm:text-sm ${!email.read ? "text-white" : "text-white/80"}`}>
                    {!email.read && (
                      <motion.span 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#427F39] rounded-full"
                      />
                    )}
                    <span className="truncate max-w-[120px] sm:max-w-full">
                      {email.from}
                    </span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] sm:text-xs text-white/50 whitespace-nowrap">
                      {format(email.timestamp, isMobile ? "h:mm a" : "MMM dd, h:mm a")}
                    </span>
                    {selectedEmailId === email.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-1.5 h-1.5 rounded-full bg-[#00D8FF]"
                      />
                    )}
                  </div>
                </div>
                <div className={`${!email.read ? "font-semibold" : "font-normal"} text-xs sm:text-sm text-white/90 mb-1.5 truncate`}>
                  {email.subject}
                </div>
                <div className="text-[10px] sm:text-xs text-white/60 truncate group-hover:text-white/70 transition-colors">
                  {email.content.substring(0, isMobile ? 40 : 80)}...
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 opacity-0 bg-black/30 rounded-full p-0.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-[#00D8FF]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    <path d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 sm:p-10 text-center text-white/50 flex flex-col items-center"
            >
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0, -5, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative mb-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-[#00D8FF]/30" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <motion.div
                  animate={{
                    opacity: [0, 0.5, 0],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 bg-[#00D8FF]/10 rounded-full blur-xl -z-10"
                />
              </motion.div>
              <p className="text-base sm:text-lg font-medium text-white/70 mb-1">Your inbox is empty</p>
              <p className="text-xs sm:text-sm max-w-[200px] mx-auto">New messages will appear here automatically</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 216, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 216, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default EmailList;