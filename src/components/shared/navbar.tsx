'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Menu, Plus, LogOut, Microscope, Gavel, Info } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CartSheet } from '@/components/shared/cart-sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logout } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { useAnalysisMode } from '@/contexts/AnalysisModeContext';
import { AuctionsInfoModal } from '@/components/ui/auctions-info-modal';

interface NavbarProps {
  onStartTour?: () => void;
}

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

export function Navbar({ onStartTour }: NavbarProps = {}) {
  const { user, isAuthenticated } = useAuth(false);
  const { enabled, enable, disable } = useAnalysisMode();
  const [showAuctionsInfo, setShowAuctionsInfo] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      // Cookie será limpo pelo backend
      localStorage.removeItem('colecionai.user');
      window.location.href = '/login';
    }
  };

  const userInitials = getInitials(user?.name);

  return (
    <>
      <AuctionsInfoModal
        open={showAuctionsInfo}
        onOpenChange={setShowAuctionsInfo}
      />

      <nav className="border-b border-border/80 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo com imagem */}
          <Link href="/" className="group flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="Colecionaí Logo" 
              className="h-10 w-10 object-contain"
            />
          </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-3">
          <Link 
            href="/auctions"
            className="text-sm font-medium text-textSecondary hover:text-primary transition-colors duration-200 flex items-center gap-2"
          >
            <Gavel className="w-4 h-4" />
            Leilões
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAuctionsInfo(true)}
            className="h-8 w-8 text-textMuted hover:text-primary hover:bg-primary/5 transition-all duration-200"
            title="Como funcionam os leilões"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-textMuted pointer-events-none" />
            <input 
              type="text" 
              placeholder="Buscar itens..." 
              className="bg-backgroundSecondary/80 border border-border/60 rounded-lg py-2 pl-10 pr-4 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 w-64 transition-all duration-200 hover:border-border"
            />
          </div>

         
          {/* Modo Análise Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => enabled ? disable() : enable()}
            className="gap-2"
            title={enabled ? "Sair do Modo Análise" : "Ativar Modo Análise"}
          >
            <Microscope className="w-4 h-4" />
            <span className="hidden lg:inline">
              {enabled ? 'Sair do Modo Análise' : 'Modo Análise'}
            </span>
          </Button>

          <CartSheet />

          <div className="hidden md:flex items-center gap-2" id="auth-section">
            <div className="h-6 w-px bg-border mx-2" />
            
            {isAuthenticated && user ? (
              <>
                <Link href="/announce">
                  <Button variant="primary" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Anunciar
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                        <AvatarImage src={undefined} alt={user.name || 'Usuário'} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-semibold text-sm">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || 'Usuário'}</p>
                        <p className="text-xs leading-none text-textSecondary">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/sales" className="cursor-pointer">Minhas Vendas</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer">Configurações</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-background border-border text-foreground">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex items-center justify-between">
                  <Link 
                    href="/auctions"
                    className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Gavel className="w-5 h-5" />
                    Leilões
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowAuctionsInfo(true);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    title="Como funcionam os leilões"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </div>
                <hr className="border-border" />
                {isAuthenticated && user ? (
                  <>
                    <Link href="/announce" className="text-lg font-medium text-primary">Anunciar Item</Link>
                    <Link href="/dashboard" className="text-lg font-medium text-muted-foreground hover:text-foreground">Dashboard</Link>
                    <Link href="/dashboard/settings" className="text-lg font-medium text-muted-foreground hover:text-foreground">Configurações</Link>
                    <button onClick={handleLogout} className="text-lg font-medium text-destructive text-left hover:text-destructive/80">Sair</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-lg font-medium text-muted-foreground hover:text-foreground">Entrar</Link>
                    <Link href="/register" className="text-lg font-medium text-muted-foreground hover:text-foreground">Cadastrar</Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
    </>
  );
}
