'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Menu, Plus, LogOut, Microscope, Gavel, MessageSquare, Bell, Users } from 'lucide-react';
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
import { useNotifications } from '@/contexts/NotificationContext';
import { MessagesPopup } from '@/components/shared/messages-popup';
import { NotificationsPopup } from '@/components/shared/notifications-popup';

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
  const { unreadCount, clearAllNotifications } = useNotifications();
  const pathname = usePathname();
  
  // Hide cart and search on institutional pages
  const isInstitutionalPage = pathname === '/about' || pathname === '/feedback';
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [messagesMinimized, setMessagesMinimized] = useState(false);
  const [notificationsMinimized, setNotificationsMinimized] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // Limpa notificações do contexto
      clearAllNotifications();
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
      <nav className="border-b border-border/80 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo com imagem */}
          <Link href="/" className="group flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="Colecionaí Logo" 
              className="h-14 w-14 object-contain"
            />
          </Link>

        {/* Desktop Nav - Melhorado */}
        <div className="hidden md:flex items-center gap-4">
          {/* Botão de Leilões Destacado */}
          <Link href="/auctions">
            <Button 
              variant="outline" 
              className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              <Gavel className="w-4 h-4" />
              <span className="font-semibold">Leilões</span>
            </Button>
          </Link>
          
          {/* Botão de About */}
          <Link href="/about">
            <Button 
              variant="ghost" 
              className="gap-2 hover:bg-primary/10 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Sobre</span>
            </Button>
          </Link>
          
          {/* Botão de Feedbacks */}
          <Link href="/feedback">
            <Button 
              variant="ghost" 
              className="gap-2 hover:bg-primary/10 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Feedbacks</span>
            </Button>
          </Link>
          
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!isInstitutionalPage && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-textMuted pointer-events-none" />
              <input 
                type="text" 
                placeholder="Buscar itens..." 
                className="bg-backgroundSecondary/80 border border-border/60 rounded-lg py-2 pl-10 pr-4 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 w-64 transition-all duration-200 hover:border-border"
              />
            </div>
          )}

         
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

          {/* Mensagens e Notificações - Apenas para usuários autenticados */}
          {isAuthenticated && (
            <>
              {/* Botão de Mensagens */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                title="Mensagens"
                onClick={() => {
                  setShowMessages(!showMessages);
                  setMessagesMinimized(false);
                  setShowNotifications(false);
                }}
              >
                <MessageSquare className="w-5 h-5" />
              </Button>

              {/* Botão de Notificações */}
              <div className="relative" style={{ zIndex: 9999 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  title="Notificações"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setNotificationsMinimized(false);
                    setShowMessages(false);
                  }}
                >
                  <Bell className="w-5 h-5" />
                  {/* Badge de notificações não lidas */}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                
                {/* Popup de Notificações */}
                <NotificationsPopup
                  isOpen={showNotifications && !notificationsMinimized}
                  onClose={() => setShowNotifications(false)}
                  position="header"
                />
              </div>
            </>
          )}

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
                      <Link href="/dashboard/collections" className="cursor-pointer">Meus Leilões</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/bids" className="cursor-pointer">Meus Lances</Link>
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

    {/* Popup de Mensagens */}
    <MessagesPopup
      isOpen={showMessages && !messagesMinimized}
      onClose={() => setShowMessages(false)}
      onMinimize={() => setMessagesMinimized(true)}
    />
    </>
  );
}
