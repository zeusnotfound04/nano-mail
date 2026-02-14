"use client";
import React, { useState, useEffect, ReactNode, AnchorHTMLAttributes } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};
interface HoveredLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}

const NavbarGlow = () => {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full rounded-full bg-gradient-to-br from-[#00D8FF]/20 via-transparent to-[#427F39]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
  );
};

export const MenuItem = ({
  setActive,
  active,
  item,
  icon,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative group">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10"
      >
        {icon && <span className="text-[#00D8FF]">{icon}</span>}
        <motion.p
          className="text-white/90 group-hover:text-[#00D8FF] transition-colors duration-300"
        >
          {item}
        </motion.p>
      </motion.div>
      <NavbarGlow />
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_0.8rem)] left-1/2 transform -translate-x-1/2 pt-2 z-50">
              <motion.div
                transition={transition}
                layoutId="active-dropdown" 
                className="bg-black/90 backdrop-blur-lg rounded-xl overflow-hidden border border-[#00D8FF]/30 shadow-xl shadow-[#00D8FF]/20"
              >
                <motion.div
                  layout
                  className="w-max h-full p-4"
                >
                  <div className="relative z-10">
                    {children}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#00D8FF]/10 rounded-full blur-xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#427F39]/10 rounded-full blur-xl -z-10"></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  isMobile: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onMouseLeave={() => setActive(null)}
      className="relative rounded-full border border-white/10 bg-black/50 backdrop-blur-md shadow-lg flex justify-between items-center px-6 py-3"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00D8FF]/20 to-[#427F39]/20 blur-md opacity-50"></div>
      
      {/* Logo always visible */}
      <div className="flex items-center relative z-10">
        <NanoMailLogo />
      </div>
      
      {/* Mobile hamburger menu button */}
      {isMobile && (
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="relative z-10 text-white p-2 focus:outline-none"
        >
          <motion.div
            animate={mobileMenuOpen ? { rotate: 45 } : { rotate: 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-0.5 bg-white mb-1"
          />
          <motion.div
            animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-0.5 bg-white mb-1"
          />
          <motion.div
            animate={mobileMenuOpen ? { rotate: -45, marginTop: -8 } : { rotate: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-0.5 bg-white"
          />
        </button>
      )}
      
      {/* Navigation links - desktop or mobile expanded */}
      <div 
        className={`${isMobile ? 'absolute top-full mt-2 right-0 bg-black/90 border border-[#00D8FF]/30 rounded-xl overflow-hidden shadow-lg p-4 backdrop-blur-md transition-all duration-300' : 'flex items-center gap-6 relative z-10'} ${isMobile && !mobileMenuOpen ? 'opacity-0 invisible translate-y-[-10px]' : 'opacity-100 visible translate-y-0'}`}
      >
        {!isMobile && <div className="h-6 border-l border-white/20 mx-2"></div>}
        <div className={isMobile ? "flex flex-col space-y-4" : "flex items-center gap-6"}>
          {children}
        </div>
      </div>
    </motion.nav>
  );
};

export const MailServiceItem = ({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) => {
  return (
    <Link href={href} className="flex space-x-3 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#00D8FF] to-[#427F39] flex items-center justify-center">
        <div className="text-white">
          {icon}
        </div>
      </div>
      <div>
        <h4 className="text-base font-bold mb-1 text-white group-hover:text-[#00D8FF] transition-colors">
          {title}
        </h4>
        <p className="text-gray-300 text-sm max-w-[12rem]">
          {description}
        </p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({ children, href, icon, className = '' }: HoveredLinkProps) => {
  return (
    <Link
      href={href}
      className={`text-gray-300 hover:text-[#00D8FF] transition-colors duration-300 flex items-center gap-2 py-1 group ${className}`}
    >
      {icon && (
        <span className="text-[#00D8FF] opacity-70 group-hover:opacity-100 transition-opacity">
          {icon}
        </span>
      )}
      <span className="border-b border-transparent group-hover:border-[#00D8FF]/50 transition-all duration-300">
        {children}
      </span>
    </Link>
  );
}
const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#11baa9" viewBox="0 0 16 16">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

const NanoMailLogo = () => (
  <div className="flex items-center">
    <Link href="/" className="flex items-center">
    
    <motion.div 
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 4, ease: "linear", repeat: Infinity }}
      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D8FF] to-[#427F39] flex items-center justify-center"
    >

      <span className="text-white text-sm font-bold">N</span>
    </motion.div>
    <motion.span 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="ml-2 text-white font-bold text-lg"
    >

      Nano<span className="text-[#11baa9]">Mail</span>
    </motion.span>
    </Link>
  </div>
);

export default function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false); 
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div
      className={cn("fixed top-5 inset-x-0 max-w-xl mx-auto z-50", className)}
    >
      <Menu 
        setActive={setActive} 
        isMobile={isMobile} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
      >
        {isMobile && <Link href="/" className="block mb-4"><NanoMailLogo /></Link>}
        
        {!isMobile && <div className="h-6 border-l border-white/20 mx-2"></div>}
        
        <MenuItem 
          setActive={setActive} 
          active={active} 
          item="Features"
        >
          <div className="flex flex-col space-y-3 text-sm min-w-[180px]">
            <HoveredLink href="#" icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
            }>Secure Email</HoveredLink>
            <HoveredLink href="#" icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
              </svg>
            }>Instant Delivery</HoveredLink>
            <HoveredLink href="#" icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.5 2.311V.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v1.811a2.5 2.5 0 0 1 0 4.878V9.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.19a2.5 2.5 0 0 1 0-4.878Zm2.5.5a1.5 1.5 0 1 0-1 0h1Zm11 0a1.5 1.5 0 1 0-1 0h1Zm-11 8a1.5 1.5 0 1 0-1 0h1Zm11 0a1.5 1.5 0 1 0-1 0h1Z"/>
                <path d="M0 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5Zm6.5-3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Zm4 3a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5Z"/>
              </svg>
            }>Unlimited Storage</HoveredLink>
            <HoveredLink href="#" icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
              </svg>
            }>Smart Filters</HoveredLink>
          </div>
        </MenuItem>
        
        <MenuItem 
          setActive={setActive} 
          active={active} 
          item="Contact"
        >
          <div className="flex flex-col space-y-3 text-sm min-w-[180px]">
            <HoveredLink 
              href="https://x.com/Zeus_Notfound" 
              target="_blank" 
              rel="noopener noreferrer" 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#11baa9" viewBox="0 0 16 16">
                  <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"/>
                </svg>
              }
            >X</HoveredLink>
            <HoveredLink 
              href="https://github.com/zeusnotfound04" 
              target="_blank" 
              rel="noopener noreferrer" 
              icon={<GithubIcon />}
            >GitHub</HoveredLink>
            <HoveredLink 
              href="https://www.instagram.com/zeusnotfound04/" 
              target="_blank" 
              rel="noopener noreferrer" 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#11baa9" viewBox="0 0 16 16">
                  <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                </svg>
              }
            >Instagram</HoveredLink>
            <HoveredLink 
              href="https://www.linkedin.com/in/vishesh-prajapati-520599302/" 
              target="_blank" 
              rel="noopener noreferrer" 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#11baa9" viewBox="0 0 16 16">
                  <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                </svg>
              }
            >LinkedIn</HoveredLink>
          </div>
        </MenuItem>
        
        <Link
          href="/faq"
          className="relative group"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10"
          >
            <motion.p
              className="text-white/90 group-hover:text-[#00D8FF] transition-colors duration-300"
            >
              FAQ
            </motion.p>
          </motion.div>
          <div className="absolute inset-0 -z-10 h-full w-full rounded-full bg-gradient-to-br from-[#00D8FF]/20 via-transparent to-[#427F39]/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"></div>
        </Link>
      </Menu>
    </div>
  );
}