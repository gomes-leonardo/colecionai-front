'use client';

import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function FloatingAnnounceButton() {
  const pathname = usePathname();
  
  // Não mostrar em páginas de anúncio ou criação
  if (pathname?.includes('/announce') || pathname?.includes('/create')) {
    return null;
  }

  return (
    <Link href="/announce">
      <Button
        size="lg"
        variant="primary"
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-110 z-50 group"
      >
        <Plus className="w-7 h-7 text-white" />
        
        {/* Tooltip */}
        <div className="absolute right-full mr-4 px-4 py-2 bg-popover text-popover-foreground rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-border">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <span className="font-medium">Anunciar Produto</span>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
            <div className="border-8 border-transparent border-l-popover" />
          </div>
        </div>
      </Button>
    </Link>
  );
}
