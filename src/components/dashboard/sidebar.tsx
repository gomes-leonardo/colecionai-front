'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Gavel,
  Settings,
  LogOut,
  User,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Visão Geral', href: '/dashboard' },
  { icon: ShoppingBag, label: 'Minhas Vendas', href: '/dashboard/sales' },
  { icon: Package, label: 'Minhas Coleções', href: '/dashboard/collections' },
  { icon: Gavel, label: 'Meus Lances', href: '/dashboard/bids' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/settings' },
];

export function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-6 border-b border-border">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Coleciona Aí!
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === '/dashboard' 
                ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Visão Geral
          </Link>
          <Link 
            href="/dashboard/sales" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === '/dashboard/sales' 
                ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <ShoppingBag className="w-5 h-5" /> {/* Changed from Package to ShoppingBag based on menuItems */}
            Minhas Vendas
          </Link>
          <Link 
            href="/dashboard/collections" /* Added missing collections link */
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === '/dashboard/collections' 
                ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Package className="w-5 h-5" />
            Minhas Coleções
          </Link>
          <Link 
            href="/dashboard/bids" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === '/dashboard/bids' 
                ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Gavel className="w-5 h-5" />
            Meus Lances
          </Link>
          <Link 
            href="/dashboard/settings" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === '/dashboard/settings' 
                ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </Link>
        </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
            <User className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">Usuário</p>
            <p className="text-xs text-muted-foreground truncate">Colecionador</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => {
            localStorage.removeItem('colecionai.token');
            localStorage.removeItem('colecionai.user');
            window.location.href = '/login';
          }}
        >
          <LogOut className="w-5 h-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col h-screen fixed left-0 top-0">
      <SidebarContent />
    </aside>
  );
}
