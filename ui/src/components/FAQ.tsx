"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
        "transition-all duration-300 ease-in-out backdrop-blur-sm",
        isOpen
          ? "bg-gradient-to-br from-white/5 via-white/[0.03] to-white/5 shadow-lg shadow-[#00D8FF]/5"
          : "hover:bg-white/[0.02] hover:border-[#00D8FF]/20"
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between gap-4"
      >
        <h3
          className={cn(
            "text-base font-bold transition-colors duration-200 text-left",
            "text-gray-300",
            isOpen ? "text-[#11ba93]" : "group-hover:text-white"
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
            isOpen ? "text-[#11ba93]" : "text-gray-500 group-hover:text-[#00D8FF]/70"
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
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="w-full h-[1px] mt-3 bg-gradient-to-r from-transparent via-[#00D8FF]/30 to-transparent"
              />
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
        "Yes, each generated email address is unique for your session. However, other people can access your created temporary address for their use. So, please do not use it for sensitive information.",
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
    <section className="py-16 w-full bg-transparent relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D8FF]/[0.03] to-transparent pointer-events-none" />
      
      {/* Decorative elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
        className="absolute -top-10 left-1/4 w-60 h-60 bg-[#427F39]/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute -bottom-20 right-1/4 w-80 h-80 bg-[#00D8FF]/10 rounded-full blur-3xl pointer-events-none"
      />
      
      <div className="container px-4 mx-auto relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-400">Everything you need to know about our temporary email service</p>
        </motion.div>
        
        <div className="max-w-2xl mx-auto space-y-3 relative">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="absolute -left-16 top-10 text-[#00D8FF] hidden lg:block"
          >
         
          </motion.div>
          
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faq;