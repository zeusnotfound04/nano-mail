"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.15,
        ease: "easeOut",
      }}
      className={cn(
        "group rounded-lg border-[0.5px] border-gray-800/50",
        "transition-all duration-200 ease-in-out",
        isOpen
          ? "bg-linear-to-br from-white/5 via-white to-white/5"
          : "hover:bg-white/[0.02]"
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between gap-4"
      >
        <h3
          className={cn(
            "text-base font-medium transition-colors duration-200 text-left",
            "text-gray-300",
            isOpen && "text-white"
          )}
        >
          {question}
        </h3>
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className={cn(
            "p-0.5 rounded-full shrink-0",
            "transition-colors duration-200",
            isOpen ? "text-primary" : "text-gray-500"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  duration: 0.4,
                  ease: [0.04, 0.62, 0.23, 0.98],
                },
                opacity: {
                  duration: 0.25,
                  delay: 0.1,
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.3,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 0.25,
                },
              },
            }}
          >
            <div className="px-6 pb-4 pt-2">
              <motion.p
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="text-sm text-gray-400 leading-relaxed"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Faq() {
  const faqs: Omit<FAQItemProps, "index">[] = [
    {
      question: "Why delete temporary emails after 7 days?",
      answer:
        "Temporary emails are deleted after 7 days to ensure privacy and security, prevent storage overload, and comply with best practices for temporary data retention.",
    },
    {
      question: "Can I use the temporary email for account verification?",
      answer:
        "Yes, you can use the temporary email for one-time verifications, but some services may block temporary email domains. If an issue arises, consider using a different provider.",
    },
    {
      question: "Is my temporary email address unique?",
      answer:
        "Yes, each generated email address is unique for your session. However, once it expires, the same address might be assigned to another user.",
    },
    {
      question: "Can I recover a deleted email?",
      answer:
        "No, once an email is deleted, it is permanently removed from our system. We do not store backups for security and privacy reasons.",
    },
    {
      question: "How does a temporary email service work?",
      answer:
        "When you visit our site, we generate a random email address for you. Any emails sent to that address appear in your inbox, and after a set period, they are automatically deleted.",
    },
    {
      question: "Can I send emails using a temporary email address?",
      answer:
        "No, our service is designed only for receiving emails, not for sending them. This is to prevent misuse and ensure compliance with email service policies.",
    },
  ];

  return (
    <section className="py-16 w-full bg-linear-to-b from-transparent via-white/[0.02] to-transparent">
      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faq;