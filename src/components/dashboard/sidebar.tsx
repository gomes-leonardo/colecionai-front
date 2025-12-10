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
import { useAuth } from '@/hooks/useAuth';
import { logout } from '@/services/authService';

// Função para gerar iniciais do nome
function getInitials(name: string | undefined | null): string {
  if (!name) return 'U';
  
  const trimmedName = name.trim();
  const parts = trimmedName.split(/\s+/);
  
  if (parts.length === 1) {
    // Se tem apenas um nome, pega as primeiras 2 letras
    return trimmedName.substring(0, 2).toUpperCase().padEnd(2, trimmedName[0].toUpperCase());
  }
  
  // Se tem sobrenome, pega primeira letra do nome e primeira do sobrenome
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Visão Geral', href: '/dashboard' },
  { icon: ShoppingBag, label: 'Minhas Vendas', href: '/dashboard/sales' },
  { icon: Gavel, label: 'Meus Lances', href: '/dashboard/bids' },
  { icon: Settings, label: 'Configurações', href: '/dashboard/settings' },
];

export function SidebarContent() {
  const pathname = usePathname();
  const { user } = useAuth(false);
  const userInitials = getInitials(user?.name);
  const userName = user?.name || 'Usuário';

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
            <ShoppingBag className="w-5 h-5" />
            Minhas Vendas
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
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-primary/20">
            <span className="text-xs font-semibold text-primary">
              {userInitials}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={async () => {
            try {
              await logout();
            } catch (error) {
              console.error("Erro ao fazer logout:", error);
            } finally {
              // Cookie será limpo pelo backend
              localStorage.removeItem('colecionai.user');
              window.location.href = '/login';
            }
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
