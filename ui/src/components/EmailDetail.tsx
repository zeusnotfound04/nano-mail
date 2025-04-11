"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Email } from "./EmailList";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: "700",
  subsets: ["latin"],
});
interface EmailDetailProps {
  email: Email | null;
  onBack?: () => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email, onBack }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [displayMode, setDisplayMode] = useState<'html' | 'text'>('html');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (email && email.htmlContent) {
      setDisplayMode('html');
    } else {
      setDisplayMode('text');
    }
  }, [email]);

  if (!email) {
    return (
      <div className="w-full h-full bg-black/40 backdrop-blur-md rounded-xl border border-[#00D8FF]/30 overflow-hidden shadow-lg shadow-black/20 flex items-center justify-center p-6 sm:p-10">
        <div className="text-center text-white/60 max-w-md">
          <motion.div
            animate={{
              rotateY: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-24 sm:h-24"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-[#00D8FF]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <motion.div
              className="absolute inset-0 rounded-full bg-[#00D8FF]/5"
              animate={{
                boxShadow: ["0 0 10px 2px rgba(0, 216, 255, 0.1)", "0 0 20px 5px rgba(0, 216, 255, 0.3)", "0 0 10px 2px rgba(0, 216, 255, 0.1)"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No message selected</h3>
          <p className="text-sm sm:text-base mb-4 sm:mb-6">Select an email from your inbox to view its content</p>

          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>To protect your privacy, emails are deleted after 7 days.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-black/40 backdrop-blur-md rounded-xl border border-[#00D8FF]/30 overflow-hidden shadow-lg shadow-black/20 flex flex-col h-full"
    >
      <div className="p-3 sm:p-5 border-b border-[#00D8FF]/30 bg-black/60">

        {isMobile && onBack && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-1 text-white/80 hover:text-white mb-3 text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to inbox
          </motion.button>
        )}

        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <div className="bg-[#00D8FF]/10 px-2 sm:px-3 py-1 rounded-full text-[#00D8FF] text-xs font-medium border border-[#00D8FF]/20 flex items-center gap-1.5">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#00D8FF]"></span>
            <span className="hidden xs:inline">Inbox</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">

            {email.htmlContent && (
              <div className="flex items-center mr-2 bg-black/40 rounded-lg overflow-hidden border border-white/10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setDisplayMode('html');
                  }}
                  className={`px-2 py-0.5 text-xs ${displayMode === 'html' ? 'bg-[#00D8FF]/30 text-white' : 'text-white/60'}`}
                >
                  HTML
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setDisplayMode('text');
                  }}
                  className={`px-2 py-0.5 text-xs ${displayMode === 'text' ? 'bg-[#00D8FF]/30 text-white' : 'text-white/60'}`}
                >
                  Text
                </button>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-white/60 hover:text-[#00D8FF] transition-colors p-1 sm:p-1.5 rounded-full hover:bg-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </motion.button>
  
          </div>
        </div>

        <h2 className="text-base sm:text-xl text-white font-medium mb-2 sm:mb-3 break-words"><span className={`font-bold text-[#01a0a5] ${poppins.className}`}>SUBJECT : </span> {email.subject}</h2>

        <div className="flex justify-between items-center border-t border-[#00D8FF]/10 pt-2 sm:pt-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#00D8FF] to-[#427F39] flex items-center justify-center text-white font-bold text-xs sm:text-sm">
              {email.from.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-white text-xs sm:text-sm font-medium">{email.from}</div>
              <div className="text-white/60 text-[10px] sm:text-xs mt-0.5">
                To: You
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-white/60 text-[10px] sm:text-xs bg-black/30 px-1.5 sm:px-2 py-0.5 rounded-full">
              {format(email.timestamp, isMobile ? "MM/dd/yy" : "MMMM dd, yyyy")}
            </span>
            <span className="text-[#00D8FF] text-[10px] sm:text-xs mt-0.5 sm:mt-1">
              {format(email.timestamp, "h:mm a")}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6 flex-grow overflow-y-auto custom-scrollbar">
        <div className="prose prose-invert prose-sm max-w-none">

          {email.htmlContent && displayMode === 'html' ? (
            <div
              className="text-white/90 email-html-content"
              dangerouslySetInnerHTML={{ __html: email.htmlContent }}
            />
          ) : (
            <p className="text-white/90 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
              {email.content}
            </p>
          )}

          <div className="absolute bottom-10 right-10 w-24 sm:w-40 h-24 sm:h-40 rounded-full bg-gradient-to-tr from-[#00D8FF]/10 to-transparent blur-3xl opacity-30 pointer-events-none"></div>
          <div className="absolute top-20 left-10 w-12 sm:w-20 h-12 sm:h-20 rounded-full bg-gradient-to-bl from-[#427F39]/10 to-transparent blur-2xl opacity-30 pointer-events-none"></div>
        </div>
      </div>

      <div className="p-3 sm:p-4 border-t border-[#00D8FF]/30 bg-black/60 flex justify-between items-center flex-wrap sm:flex-nowrap gap-2">
        <div className="flex items-center gap-1 text-white/40 text-[10px] sm:text-xs order-3 sm:order-1 w-full sm:w-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Temporary inbox - emails auto-delete after 7 days</span>
        </div>

        <div className="flex space-x-2 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-[#00D8FF]/10 hover:bg-[#00D8FF]/20 text-[#00D8FF] rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Reply
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-[#00D8FF]/10 hover:bg-[#00D8FF]/20 text-[#00D8FF] rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Forward
          </motion.button>
        </div>
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

        /* Email HTML content styling */
        .email-html-content {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.875rem;
        }

        .email-html-content a {
          color: #00D8FF;
          text-decoration: underline;
        }

        .email-html-content img {
          max-width: 100%;
          height: auto;
        }

        /* Additional email content fixes */
        .email-html-content table {
          max-width: 100%;
          border-collapse: collapse;
        }

        .email-html-content p {
          margin-bottom: 0.75rem;
        }
      `}</style>
    </motion.div>
  );
};

export default EmailDetail;