'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Menu, Plus, LogOut } from 'lucide-react';
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

export function Navbar() {
  const { user, isAuthenticated } = useAuth(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      localStorage.removeItem('colecionai.token');
      localStorage.removeItem('colecionai.user');
      window.location.href = '/login';
    }
  };

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group relative">
            <span className="font-bold text-xl bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent group-hover:opacity-90 transition-all duration-300 relative z-10">
              Coleciona<span className="text-primary">í</span>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 relative group">
            Garimpar
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/auctions" className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 relative group">
            Leilões
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/dashboard/collections" className="text-sm font-medium text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 relative group">
            Coleções
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-all duration-300 group-focus-within:scale-110" />
            <input 
              type="text" 
              placeholder="Buscar itens..." 
              className="bg-muted/50 border border-input rounded-full py-2 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 w-64 transition-all duration-300 hover:bg-muted/70 focus:bg-background shadow-sm focus:shadow-md focus:shadow-primary/10"
            />
          </div>

          <CartSheet />

          <div className="hidden md:flex items-center gap-2">
            <div className="h-6 w-px bg-border mx-2" />
            
            {isAuthenticated && user ? (
              <>
                <Link href="/announce">
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40">
                    <Plus className="w-4 h-4" />
                    Anunciar
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/50 transition-all">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src="/avatars/01.png" alt={user.name} />
                        <AvatarFallback className="bg-primary/20 text-primary">{user.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-popover border-border text-popover-foreground" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/sales" className="cursor-pointer hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground">Minhas Vendas</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="cursor-pointer hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground">Configurações</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-lg shadow-black/5 transition-all hover:scale-105">
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
                <Link href="/" className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">Garimpar</Link>
                <Link href="/auctions" className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">Leilões</Link>
                <Link href="/dashboard/collections" className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors">Coleções</Link>
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
  );
}
