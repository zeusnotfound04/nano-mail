"use client";
import React, { useEffect, useState, Suspense } from "react";
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
import { searchEmails } from "@/actions/getEmails";

function InboxContent() {
  const searchParam = useSearchParams();
  const router = useRouter();
  const encodedQuery = searchParam.get("q") ?? "";
  const selectedEmailId = searchParam.get("id");
  const [decodedUsername, setDecodedUsername] = useState<string>("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  const [readEmails, setReadEmails] = useState<string[]>([]);

  useEffect(() => {
    if (!decodedUsername) return;

    try {
      const storedReadEmails = localStorage.getItem(
        `read_emails_${decodedUsername}`
      );
      if (storedReadEmails) {
        setReadEmails(JSON.parse(storedReadEmails));
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
    }
  }, [decodedUsername]);

  const saveReadEmail = (emailId: string | number) => {
    if (!decodedUsername) return;

    try {
      const emailIdStr = String(emailId);
      if (!readEmails.includes(emailIdStr)) {
        const newReadEmails = [...readEmails, emailIdStr];
        setReadEmails(newReadEmails);

        localStorage.setItem(
          `read_emails_${decodedUsername}`,
          JSON.stringify(newReadEmails)
        );
      }
    } catch (error) {
      console.error("Error saving to localStorage", error);
    }
  };

  const isEmailRead = (emailId: string | number): boolean => {
    return readEmails.includes(String(emailId));
  };

  const fetchEmails = async (username: string) => {
    setLoading(true);
    try {
      const fetchedEmails = await searchEmails(username);
      const transformedEmails = fetchedEmails.map((email) => ({
        id: String(email.id),
        from: email.mail_from || "",
        subject: email.subject || "",
        content: email.data?.text || "",
        htmlContent: email.data?.text_as_html || "",
        timestamp: new Date(email.date),
        read: isEmailRead(email.id),
      }));

      setEmails(transformedEmails);

      if (selectedEmailId) {
        const foundEmail = transformedEmails.find(
          (email) => email.id === selectedEmailId
        );
        if (foundEmail) {
          setSelectedEmail(foundEmail);

          if (!foundEmail.read) {
            foundEmail.read = true;
            setEmails(
              transformedEmails.map((email) =>
                email.id === selectedEmailId
                  ? { ...email, read: true }
                  : email
              )
            );

            saveReadEmail(selectedEmailId);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (refreshing || loading) return;
    setRefreshing(true);
    fetchEmails(decodedUsername);
  };

  useEffect(() => {
    if (selectedEmail) {
      setMobileView("detail");
    }
  }, [selectedEmail]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileView("list");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      fetchEmails(decoded);
    }
  }, [encodedQuery, router, selectedEmailId]);

  const handleSelectEmail = (emailId: string) => {
    const email = emails.find((e) => e.id === emailId);
    if (email) {
      setSelectedEmail(email);
      const url = `/v1/inbox?q=${encodedQuery}&id=${emailId}`;
      router.push(url, { scroll: false });

      if (!email.read) {
        email.read = true;
        setEmails(
          emails.map((e) =>
            e.id === emailId ? { ...e, read: true } : e
          )
        );

        saveReadEmail(emailId);
      }

      if (window.innerWidth < 768) {
        setMobileView("detail");
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />

      <main className="relative min-h-screen w-full pt-20 md:pt-24 pb-16 px-3 md:px-4">
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

        <div className="container mx-auto max-w-5xl z-10 relative">
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
                    <span className="text-[#00D8FF]">
                      {decodedUsername}
                    </span>
                    @zeus.nanomail.live
                  </span>
                </div>
                <div className="mt-2 flex items-center space-x-3">
                  <motion.button
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 8px rgba(0, 216, 255, 0.5)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center px-3 py-1.5 bg-black/40 hover:bg-black/60 border border-[#00D8FF]/30 rounded-md text-white/90 hover:text-[#00D8FF] transition-colors"
                  >
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      animate={
                        refreshing
                          ? { rotate: 360 }
                          : { rotate: 0 }
                      }
                      transition={
                        refreshing
                          ? {
                              repeat: Infinity,
                              duration: 1,
                              ease: "linear",
                            }
                          : { duration: 0.2 }
                      }
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </motion.svg>
                    {refreshing ? "Checking..." : "Refresh"}
                  </motion.button>
                  <CopyEmailButton
                    emailAddress={`${decodedUsername}@zeus.nanomail.live`}
                  />
                </div>
              </div>
            )}
          </motion.div>

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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h7"
                    />
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Message</span>
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <LoadingAnimation />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`md:col-span-1 ${
                  mobileView === "detail" ? "hidden md:block" : "block"
                }`}
              >
                <EmailList
                  emails={emails}
                  selectedEmailId={selectedEmail?.id || null}
                  onSelectEmail={handleSelectEmail}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`md:col-span-2 ${
                  mobileView === "list" ? "hidden md:block" : "block"
                }`}
              >
                <EmailDetail email={selectedEmail} />
              </motion.div>
            </div>
          )}
        </div>
      </main>

      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute bottom-0 w-full py-2 md:py-4 px-4 md:px-6 text-center bg-black/40 backdrop-blur-sm border-t border-[#00D8FF]/10"
      >
        <p className="text-white/60 text-xs md:text-sm">
          Emails are automatically deleted after 7 days.
          <a
            href="/faq"
            className="text-[#00D8FF] hover:text-[#00D8FF]/80 ml-2 transition-colors underline decoration-[#00D8FF]/30 hover:decoration-[#00D8FF]"
          >
            Learn more
          </a>
        </p>
      </motion.footer>
    </div>
  );
}

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingAnimation />
        </div>
      }
    >
      <InboxContent />
    </Suspense>
  );
}