"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { decodeQueryParam } from "@/lib/queryEncoding";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import EmailList, { Email } from "@/components/EmailList";
import EmailDetail from "@/components/EmailDetail";
import CopyEmailButton from "@/components/CopyEmailButton";
import EmailParticleBackground from "@/components/EmailParticleBackground";
import LoadingAnimation from "@/components/LoadingAnimation";
import { motion } from "motion/react";

// Sample emails for demonstration
const generateSampleEmails = (username: string): Email[] => [
  // ...existing code...
];

export default function InboxPage() {
  const searchParam = useSearchParams();
  const router = useRouter();
  const encodedQuery = searchParam.get("q") ?? "";
  const selectedEmailId = searchParam.get("id");
  const [decodedUsername, setDecodedUsername] = useState<string>("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  // For mobile view toggling
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  
  // Effect to handle mobile view changes when an email is selected
  useEffect(() => {
    if (selectedEmail) {
      setMobileView("detail");
    }
  }, [selectedEmail]);

  // Effect to handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      // Reset to list view on larger screens
      if (window.innerWidth >= 768) {
        setMobileView("list");
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Decode the query parameter when the component mounts or query changes
  useEffect(() => {
    if (!encodedQuery) {
      router.push("/");
      return;
    }
  
    const decoded = decodeQueryParam(encodedQuery);
    setDecodedUsername(decoded);
 
    if (!decoded) {
      router.push("/");
    } else {
      // Simulate loading delay for demo purposes
      setLoading(true);
      setTimeout(() => {
        // Generate sample emails for the demo
        const sampleEmails = generateSampleEmails(decoded);
        setEmails(sampleEmails);
        
        // If there's an email ID in the URL, find and select that email
        if (selectedEmailId) {
          const foundEmail = sampleEmails.find(email => email.id === selectedEmailId);
          if (foundEmail) {
            setSelectedEmail(foundEmail);
            // Mark as read
            if (!foundEmail.read) {
              foundEmail.read = true;
              setEmails(sampleEmails.map(email => 
                email.id === selectedEmailId ? {...email, read: true} : email
              ));
            }
          }
        }
        setLoading(false);
      }, 2000); // 2 seconds loading for demo
    }
  }, [encodedQuery, router, selectedEmailId]);

  const handleSelectEmail = (emailId: string) => {
    const email = emails.find(e => e.id === emailId);
    if (email) {
      setSelectedEmail(email);
      // Update URL with email ID
      const url = `/v1/inbox?q=${encodedQuery}&id=${emailId}`;
      router.push(url, { scroll: false });
      
      // Mark as read
      if (!email.read) {
        email.read = true;
        setEmails(emails.map(e => 
          e.id === emailId ? {...e, read: true} : e
        ));
      }
      
      // On mobile, switch to detail view when an email is selected
      if (window.innerWidth < 768) {
        setMobileView("detail");
      }
    }
  };

  // Function to go back to the email list on mobile
  const handleBackToList = () => {
    setMobileView("list");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />
      
      <main className="relative min-h-screen w-full pt-20 md:pt-24 pb-16 px-3 md:px-4">
        {/* Background elements */}
        <AnimatedBackground 
          auroraColors={["#00D8FF", "#427F39", "#00D8FF"]}
          primaryParticleColor="#00D8FF"
          secondaryParticleColor="#427F39"
          particleDensity={15}
          auroraAmplitude={1.0}
          auroraBlend={0.5}
          auroraSpeed={0.5}
        />
        <EmailParticleBackground density={30} />

        {/* Main content */}
        <div className="container mx-auto max-w-5xl z-10 relative">
          {/* Header with email address - z-10 brings it forward */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 md:mb-10 flex flex-col md:flex-row items-center justify-between gap-4 bg-black/30 backdrop-blur-md p-4 md:p-6 rounded-xl border border-[#00D8FF]/30 shadow-lg shadow-[#00D8FF]/10"
          >
            <div className="flex flex-col items-center md:items-start w-full md:w-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2 drop-shadow-[0_2px_4px_rgba(0,216,255,0.4)] text-center md:text-left">
                Your Inbox
              </h1>
              {decodedUsername && (
                <div className="text-white/90 text-sm md:text-base lg:text-lg text-center md:text-left">
                  Your temporary email inbox is ready
                </div>
              )}
            </div>
            
            {decodedUsername && (
              <div className="flex flex-col items-center md:items-end shrink-0">
                <div className="text-[#00D8FF] text-base sm:text-lg md:text-xl font-medium text-center md:text-right break-all md:break-normal">
                  <span className="text-white/70 text-xs sm:text-sm md:text-base">
                    <span className="text-[#00D8FF]">{decodedUsername}</span>@zeus.nanomail.live
                  </span>
                </div>
                <div className="mt-2">
                  <CopyEmailButton emailAddress={`${decodedUsername}@zeus.nanomail.live`} />
                </div>
              </div>
            )}
          </motion.div>

          {/* Mobile view toggle buttons - only visible on small screens */}
          {!loading && selectedEmail && (
            <div className="md:hidden flex justify-center mb-4">
              <div className="inline-flex rounded-md bg-black/40 backdrop-blur-md border border-[#00D8FF]/20 p-1">
                <button 
                  onClick={() => setMobileView("list")}
                  className={`px-4 py-2 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
                    mobileView === "list" 
                    ? "bg-[#00D8FF]/20 text-white" 
                    : "text-white/60 hover:text-white/80"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <span>Inbox</span>
                </button>
                <button 
                  onClick={() => setMobileView("detail")}
                  className={`px-4 py-2 rounded-md text-sm flex items-center gap-1.5 transition-colors ${
                    mobileView === "detail" 
                    ? "bg-[#00D8FF]/20 text-white" 
                    : "text-white/60 hover:text-white/80"
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Message</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading animation or Email interface */}
          {loading ? (
            <LoadingAnimation />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Email list - Full width on mobile or when in list view, 1/3 width on desktop */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`md:col-span-1 ${mobileView === "detail" ? "hidden md:block" : "block"}`}
              >
                <EmailList 
                  emails={emails} 
                  selectedEmailId={selectedEmail?.id || null}
                  onSelectEmail={handleSelectEmail} 
                />
              </motion.div>
              
              {/* Email detail - Full width on mobile or when in detail view, 2/3 width on desktop */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`md:col-span-2 ${mobileView === "list" ? "hidden md:block" : "block"}`}
              >
                <EmailDetail email={selectedEmail} />
              </motion.div>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer - made it more visible with background */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute bottom-0 w-full py-2 md:py-4 px-4 md:px-6 text-center bg-black/40 backdrop-blur-sm border-t border-[#00D8FF]/10"
      >
        <p className="text-white/60 text-xs md:text-sm">
          Emails are automatically deleted after 7 days. 
          <a href="/faq" className="text-[#00D8FF] hover:text-[#00D8FF]/80 ml-2 transition-colors underline decoration-[#00D8FF]/30 hover:decoration-[#00D8FF]">Learn more</a>
        </p>
      </motion.footer>
    </div>
  );
}