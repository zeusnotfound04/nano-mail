import { motion } from "framer-motion";
import { Github } from "lucide-react";

export default function GithubStar() {
  return (
    <div className="flex justify-center">
      <motion.a
        href="https://github.com/zeusnotfound04/nano-mail"
        target="_blank"
        rel="noopener noreferrer"
        className="relative group"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 -z-10 h-full w-full rounded-full bg-gradient-to-br from-cyan-500/30 via-green-500/20 to-cyan-500/30 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-green-500/10 border border-cyan-500/30 hover:border-cyan-400/50 cursor-pointer transition-all duration-300">
          <Github className="text-cyan-400 w-5 h-5" />
          <p className="text-cyan-300 group-hover:text-cyan-200 transition-colors duration-300 font-medium">
            Star on GitHub
          </p>
        </div>
      </motion.a>
    </div>
  );
}
