import { motion } from "framer-motion";

export default function BrandingTag() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.8 }}
      className="relative max-w-md mx-auto mt-6 mb-6"
    >
      <div className="px-4 py-2 text-xs text-center relative rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-green-500/10 to-cyan-500/10 opacity-50"></div>
        
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 50% 50%, rgba(0, 216, 255, 0.3) 0%, transparent 40%)",
              "radial-gradient(circle at 20% 80%, rgba(66, 127, 57, 0.3) 0%, transparent 40%)",
              "radial-gradient(circle at 80% 20%, rgba(0, 216, 255, 0.3) 0%, transparent 40%)",
              "radial-gradient(circle at 50% 50%, rgba(66, 127, 57, 0.3) 0%, transparent 40%)",
              "radial-gradient(circle at 50% 50%, rgba(0, 216, 255, 0.3) 0%, transparent 40%)",
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.p
          className="font-bold tracking-wider relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-green-300"
          animate={{
            textShadow: [
              "0 0 2px rgba(0, 216, 255, 0.5)",
              "0 0 8px rgba(66, 127, 57, 0.5)",
              "0 0 2px rgba(0, 216, 255, 0.5)",
            ],
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            repeatType: "mirror" 
          }}
        >
          22k+ monthly mails processed!
        </motion.p>
      </div>
    </motion.div>
  );
}
