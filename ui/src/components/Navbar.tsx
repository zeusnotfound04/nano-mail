"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

// Email-themed hover animation gradient
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
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onMouseLeave={() => setActive(null)}
      className="relative rounded-full border border-white/10 bg-black/50 backdrop-blur-md shadow-lg flex justify-center items-center space-x-4 px-6 py-3"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00D8FF]/20 to-[#427F39]/20 blur-md opacity-50"></div>
      <div className="flex items-center gap-6 relative z-10">
        {children}
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

export const HoveredLink = ({ children, href, icon, ...rest }: any) => {
  return (
    <Link
      href={href}
      className="text-gray-300 hover:text-[#00D8FF] transition-colors duration-300 flex items-center gap-2 py-1 group"
      {...rest}
    >
      {icon && <span className="text-[#00D8FF] opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>}
      <span className="border-b border-transparent group-hover:border-[#00D8FF]/50 transition-all duration-300">
        {children}
      </span>
    </Link>
  );
};

// Mail service icons can be added here
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#11baa9"  viewBox="0 0 16 16">
    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
  </svg>
);

const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#11baa9" viewBox="0 0 16 16">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

const ComposeMail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#11baa9" viewBox="0 0 16 16">
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1.5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
  </svg>
);

const InboxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#11baa9" viewBox="0 0 16 16">
    <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#11baa9  " viewBox="0 0 16 16">
    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
  </svg>
);

const NanoMailLogo = () => (
  <div className="flex items-center">
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
  </div>
);

export default function Navbar({ className }: { className?: string }) {
    const [active, setActive] = useState<string | null>(null);
    
    return (
      <div
        className={cn("fixed top-5 inset-x-0 max-w-3xl mx-auto z-50", className)}
      >
        <Menu setActive={setActive}>
          <NanoMailLogo />
          
          <div className="h-6 border-l border-white/20 mx-2"></div>
          
          <MenuItem 
            setActive={setActive} 
            active={active} 
            item="Mail" 
            icon={<MailIcon />}
          >
            <div className="flex flex-col space-y-5 min-w-[280px]">
              <MailServiceItem
                title="Inbox"
                href="/inbox"
                description="View and manage received emails"
                icon={<InboxIcon />}
              />
              <MailServiceItem
                title="Compose"
                href="/compose"
                description="Write and send new messages"
                icon={<ComposeMail />}
              />
              <div className="border-t border-white/10 pt-3 mt-2">
                <HoveredLink href="/mail/settings" icon={<SettingsIcon />}>Mail Settings</HoveredLink>
              </div>
            </div>
          </MenuItem>
          
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

          <MenuItem 
            setActive={setActive} 
            active={active} 
            item="GitHub"
            icon={<GithubIcon />}
          >
            <div className="flex flex-col space-y-3 text-sm min-w-[200px]">
              <h4 className="text-base font-bold text-white mb-2">Support the Project</h4>
              <div className="bg-gradient-to-r from-[#00D8FF]/20 to-[#427F39]/20 rounded-lg p-4 mb-2">
                <p className="text-gray-300 mb-3">If you find NanoMail useful, please consider giving our repository a star!</p>
                <a 
                  href="https://github.com/zeusnotfound04/nano-mail" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
                >
                  <GithubIcon />
                  <span>Drop a Star ⭐</span>
                </a>
              </div>
              <HoveredLink href="https://github.com/zeusnotfound04/nano-mailissues" target="_blank" rel="noopener noreferrer" icon={<GithubIcon />}>
                Report Issues
              </HoveredLink>
              <HoveredLink href="https://github.com/zeusnotfound04/nano-mailnano-mail/blob/main/README.md" target="_blank" rel="noopener noreferrer" icon={<GithubIcon />}>
                Documentation
              </HoveredLink>
            </div>
          </MenuItem>

        </Menu>
      </div>
    );
  }