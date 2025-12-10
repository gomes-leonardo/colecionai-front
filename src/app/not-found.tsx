'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, Package } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="group flex items-center">
              <img 
                src="/logo.png" 
                alt="Colecionaí Logo" 
                className="h-16 w-16 object-contain group-hover:scale-105 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* 404 Visual */}
          <div className="mb-8 relative">
            <h1 className="text-9xl md:text-[12rem] font-bold text-textPrimary/20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-backgroundSecondary rounded-full flex items-center justify-center border-4 border-primary/20">
                <Package className="w-16 h-16 md:w-20 md:h-20 text-primary/40" />
              </div>
            </div>
          </div>

          {/* Mensagem */}
          <h2 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">
            Item não encontrado
          </h2>
          <p className="text-lg md:text-xl text-textSecondary mb-8 max-w-md mx-auto">
            Ops! Parece que este item não está mais disponível ou nunca existiu.
          </p>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/">
              <Button size="lg" variant="primary" className="h-12 px-8 text-base gap-2">
                <Home className="w-5 h-5" />
                Voltar ao Início
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base gap-2">
                <Search className="w-5 h-5" />
                Explorar Produtos
              </Button>
            </Link>
          </div>

          {/* Ilustração ou decoração */}
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-textMuted">
              Se você acredita que isso é um erro,{' '}
              <Link href="/feedback" className="text-primary hover:text-primary-hover underline">
                entre em contato
              </Link>
              {' '}conosco.
            </p>
          </div>
        </div>
      </div>

      {/* Elementos decorativos */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}


