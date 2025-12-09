'use client';

import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // const isRegister = pathname === '/register';
  // const isForgotPassword = pathname === '/forgot-password';

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative bg-[#121216]">
      
      {/* Background Gradient Mesh - Premium Dark */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         {/* Deep Indigo Orb */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/30 blur-[140px] rounded-full opacity-50 animate-pulse-slow mix-blend-screen" />
        
        {/* Electric Blue Orb */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/30 blur-[140px] rounded-full opacity-50 animate-pulse-slow mix-blend-screen" style={{ animationDelay: '2s' }} />
        
        {/* Accent Purple Orb */}
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-purple-600/20 blur-[120px] rounded-full opacity-40 animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05] z-0 pointer-events-none" style={{ backgroundSize: '30px 30px' }} />

      {/* Floating Particles/Stars */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[15%] w-1 h-1 bg-white/60 rounded-full animate-float" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[70%] left-[80%] w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-float" style={{ animationDuration: '7s', animationDelay: '1s' }} />
        <div className="absolute top-[40%] right-[20%] w-1 h-1 bg-purple-400/50 rounded-full animate-float" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      {/* Home Link - Premium Glass Pill */}
      <div className="absolute top-8 left-8 z-50">
        <a href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.2)] group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300">
            <span className="text-white font-bold text-xl drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">C</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white/90 group-hover:text-white transition-colors">
            Coleciona<span className="text-blue-400">í</span>
          </span>
        </a>
      </div>

      {/* Form Section - Glass Card */}
      <motion.div 
        layout
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[600px] p-6 relative z-10"
      >
        <div className="w-full bg-[#18181b]/70 backdrop-blur-2xl p-8 sm:p-14 rounded-[2.5rem] border border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
          {/* Top colored line shine */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
