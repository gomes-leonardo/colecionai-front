'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Timer, Gavel, TrendingUp, Users, Construction } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ConstructionNotice } from '@/components/ui/construction-notice';

// Mock Data for Auctions
const auctions = [
  {
    id: 1,
    title: "PlayStation 1 Original (1995)",
    currentBid: 450.00,
    bids: 12,
    timeLeft: 3600, // seconds
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&q=80&w=1000",
    condition: "Usado - Bom",
    seller: "RetroGamer_BR"
  },
  {
    id: 2,
    title: "HQ X-Men #1 (Capa Variante)",
    currentBid: 1200.00,
    bids: 28,
    timeLeft: 7200,
    image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=1000",
    condition: "Novo - Lacrado",
    seller: "ComicHunter"
  },
  {
    id: 3,
    title: "Funko Pop! Iron Man (Glow in Dark)",
    currentBid: 180.00,
    bids: 5,
    timeLeft: 1800,
    image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=1000",
    condition: "Novo",
    seller: "PopStore"
  },
  {
    id: 4,
    title: "Cartucho Super Mario 64",
    currentBid: 250.00,
    bids: 8,
    timeLeft: 5400,
    image: "https://images.unsplash.com/photo-1612404730960-5c71579fca2c?auto=format&fit=crop&q=80&w=1000",
    condition: "Usado - Excelente",
    seller: "MarioFan99"
  }
];

function CountdownTimer({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s > 0 ? s - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="flex items-center gap-2 text-amber-500 font-mono font-bold">
      <Timer className="w-4 h-4" />
      {formatTime(seconds)}
    </div>
  );
}

export default function AuctionsPage() {
  const [showConstructionNotice, setShowConstructionNotice] = useState(false);

  return (
    <>
      <ConstructionNotice
        open={showConstructionNotice}
        onOpenChange={setShowConstructionNotice}
        title="Sistema de Leilões em Construção"
        description="A funcionalidade de leilões está em desenvolvimento e estará disponível em breve. Em breve você poderá dar lances em tempo real em itens raros e exclusivos!"
      />

      <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
        {/* Aviso de Construção */}
        <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <div className="p-2 rounded-full bg-amber-500/20 text-amber-500 flex-shrink-0">
            <Construction className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-textPrimary mb-1">Sistema de Leilões em Construção</h3>
            <p className="text-sm text-textSecondary">
              Esta funcionalidade está em desenvolvimento. Os leilões exibidos abaixo são apenas demonstrações.
            </p>
          </div>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Gavel className="w-10 h-10 text-primary" />
            Leilões em Destaque
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Dê o seu lance em itens raros e exclusivos. A melhor oferta leva para casa.
          </p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {auctions.map((auction) => (
          <Card key={auction.id} className="bg-card border-border overflow-hidden hover:border-primary transition-all duration-300 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
              <img 
                src={auction.image} 
                alt={auction.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-red-600 hover:bg-red-700 text-white animate-pulse">
                  Ao Vivo
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
                <CountdownTimer initialSeconds={auction.timeLeft} />
              </div>
            </div>
            
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="border-primary/50 text-primary text-xs">
                  {auction.condition}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-foreground line-clamp-2 h-14">
                {auction.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {auction.bids} lances
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                  Alta demanda
                </div>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Lance Atual</p>
                <p className="text-2xl font-bold text-primary">
                  R$ {auction.currentBid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-lg shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-transform"
                onClick={() => setShowConstructionNotice(true)}
              >
                Dar Lance
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
    </>
  );
}
