'use client';

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-backgroundSecondary to-background">
      
      {/* Home Link - Logo clicável */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 bg-background rounded-lg flex items-center justify-center border border-border shadow-sm group-hover:shadow-md transition-all duration-200 overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Colecionaí" 
              className="h-full w-full object-contain p-1.5"
            />
          </div>
        </Link>
      </div>

      {/* Form Section - Clean Card */}
      <motion.div 
        layout
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[500px] sm:max-w-[600px] md:max-w-[650px] p-4 sm:p-6 md:p-8 relative z-10"
      >
        <div className="w-full bg-background p-6 sm:p-10 md:p-14 lg:p-16 rounded-2xl border border-border shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
