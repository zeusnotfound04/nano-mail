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
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="max-w-3xl mx-auto text-center"
      >
        <BlurText
          text=" Fast. Private. Disposable. This is NanoMail."
          delay={280}
          animateBy="words"
          direction="top"
          highlightWords={[{ word: "NanoMail", color: "#11ba93" }]}
          className="text-4xl text-center md:text-6xl font-bold text-white mb-6"
          onAnimationComplete={handleBlurAnimationComplete}
        />
        <p className="text-md text-gray-300 mb-8">
          Inboxes that exist when you need them. No signups. No tracking. No trace. Just raw, unfiltered access for the internet's underground.
        </p>
        
        <EmailInput username={username} setUsername={setUsername} />
        <CreateInboxButton handleCreateInbox={handleCreateInbox} />
      </motion.div>
    </div>
  );
}