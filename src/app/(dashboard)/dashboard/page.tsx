'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingBag, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Visão Geral</h1>
          <p className="text-muted-foreground">Bem-vindo de volta, Colecionador.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/announce">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              Anunciar Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendas Totais
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">R$ 1.250,00</div>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +12% este mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens Ativos
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">8</div>
            <p className="text-xs text-muted-foreground mt-1">
              3 com propostas pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Meus Lances
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
            <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
              2 ganhando atualmente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { text: "Você deu um lance em 'Super Mario 64'", time: "Há 2 horas", icon: "💰" },
                { text: "Seu item 'Funko Pop Batman' foi favoritado", time: "Há 5 horas", icon: "❤️" },
                { text: "Novo item listado: 'PlayStation 2 Slim'", time: "Ontem", icon: "📦" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                  <div className="bg-muted p-2 rounded-full text-sm">{activity.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-border h-full relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Dica do Dia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/90">
              Complete seu perfil para aumentar suas chances de venda em até 30%. Compradores confiam mais em perfis verificados.
            </p>
            <Button variant="secondary" className="w-full sm:w-auto">
              Completar Perfil <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
