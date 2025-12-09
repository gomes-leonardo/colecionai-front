'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gavel, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Mock Data for User Bids
const myBids = [
  {
    id: 1,
    item: "PlayStation 1 Original (1995)",
    myBid: 450.00,
    currentBid: 450.00,
    status: "winning", // winning, outbid, won, lost
    timeLeft: "1h 20m",
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 2,
    item: "HQ X-Men #1 (Capa Variante)",
    myBid: 1100.00,
    currentBid: 1200.00,
    status: "outbid",
    timeLeft: "2h 45m",
    image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 3,
    item: "Game Boy Color Teal",
    myBid: 350.00,
    currentBid: 350.00,
    status: "won",
    timeLeft: "Finalizado",
    image: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&q=80&w=200",
  },
  {
    id: 4,
    item: "Funko Pop! Star Wars",
    myBid: 80.00,
    currentBid: 120.00,
    status: "lost",
    timeLeft: "Finalizado",
    image: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=200",
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'winning':
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">Ganhando</Badge>;
    case 'outbid':
      return <Badge variant="destructive">Superado</Badge>;
    case 'won':
      return <Badge className="bg-primary hover:bg-primary/90">Vencido</Badge>;
    case 'lost':
      return <Badge variant="secondary">Perdido</Badge>;
    default:
      return null;
  }
};

export default function MyBidsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Lances</h1>
          <p className="text-muted-foreground">Acompanhe o status dos seus leilões.</p>
        </div>
        <Link href="/auctions">
          <Button variant="outline" className="gap-2">
            Ver Leilões Ativos <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {myBids.map((bid) => (
          <Card key={bid.id} className="bg-card border-border overflow-hidden hover:border-primary/50 transition-colors">
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4">
              {/* Image */}
              <div className="w-full sm:w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                <img src={bid.image} alt={bid.item} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-lg text-foreground">{bid.item}</h3>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {bid.timeLeft}
                </div>
              </div>

              {/* Bids */}
              <div className="grid grid-cols-2 gap-8 text-center sm:text-right px-4">
                <div>
                  <p className="text-xs text-muted-foreground">Seu Lance</p>
                  <p className="font-medium text-foreground">R$ {bid.myBid.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lance Atual</p>
                  <p className={`font-bold ${bid.status === 'outbid' ? 'text-destructive' : 'text-emerald-500'}`}>
                    R$ {bid.currentBid.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex flex-col items-center sm:items-end gap-2 min-w-[120px]">
                {getStatusBadge(bid.status)}
                
                {bid.status === 'outbid' && (
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Aumentar Lance
                  </Button>
                )}
                {bid.status === 'won' && (
                  <Button size="sm" variant="outline" className="w-full border-emerald-500 text-emerald-500 hover:bg-emerald-500/10">
                    Pagar Agora
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
