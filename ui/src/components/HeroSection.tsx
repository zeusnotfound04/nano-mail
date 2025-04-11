/* eslint-disable react/no-unescaped-entities */

"use client";
import { motion } from "motion/react";
import { useState, useCallback } from "react";
import BlurText from "@/components/BlurText";
import EmailInput from "@/components/EmailInput";
import CreateInboxButton from "@/components/CreateInboxButton";
import { useRouter } from "next/navigation";
import { encodeQueryParam } from "@/lib/queryEncoding";

export default function HeroSection() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [blurAnimationComplete, setBlurAnimationComplete] = useState(false);
console.log(blurAnimationComplete)
  const handleBlurAnimationComplete = useCallback(() => {
    setBlurAnimationComplete(true);
  }, []);

  const handleCreateInbox = useCallback(() => {
    if (username.trim()) {
      const encodedUsername = encodeQueryParam(username.toLowerCase());
      router.push(`/v1/inbox?q=${encodedUsername}`);
    }
  }, [username, router]);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pb-16 sm:pb-20 pt-16 sm:pt-0" suppressHydrationWarning>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="max-w-3xl mx-auto text-center"
        suppressHydrationWarning
      >
        <BlurText
          text=" Fast. Private. Disposable. This is NanoMail."
          delay={280}
          animateBy="words"
          direction="top"
          highlightWords={[{ word: "NanoMail", color: "#11ba93" }]}
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6"
          onAnimationComplete={handleBlurAnimationComplete}
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          suppressHydrationWarning
        >
          <p className="text-sm sm:text-md text-gray-300 mb-6 sm:mb-8 max-w-xl mx-auto" suppressHydrationWarning>
            Inboxes that exist when you need them. No signups. No tracking. No trace. Just raw, unfiltered access for the internet's underground.
          </p>
          
          <div className="space-y-4 sm:space-y-6" suppressHydrationWarning>
            <EmailInput username={username} setUsername={setUsername} />
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="relative max-w-md mx-auto"
            >
              <div className="px-4 py-2 text-xs text-center relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-900/10 to-transparent rounded-md"></div>
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div 
                    className="absolute h-[1px] w-full top-0 left-0"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(0, 216, 255, 0.4), transparent)" }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div 
                    className="absolute h-[1px] w-full bottom-0 left-0"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(0, 216, 255, 0.4), transparent)" }}
                    animate={{ x: ["100%", "-100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <motion.p 
                  className="text-[#427F39] font-light tracking-wide relative z-10"
                  animate={{ 
                    textShadow: ["0 0 4px rgba(0, 216, 255, 0.3)", "0 0 8px rgba(0, 216, 255, 0.5)", "0 0 4px rgba(0, 216, 255, 0.3)"] 
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  Choose a unique username for privacy
                </motion.p>
              </div>
            </motion.div>
            
            <CreateInboxButton handleCreateInbox={handleCreateInbox} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}