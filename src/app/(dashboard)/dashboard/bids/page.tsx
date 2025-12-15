'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Gavel, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getMyBids, UserBid } from '@/services/bidService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { getProductImageUrl } from '@/services/productService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const getStatusBadge = (bid: UserBid, userId?: string) => {
  const auction = bid.auction;
  const isFinished = auction.status === 'FINISHED' || new Date(auction.end_date) < new Date();
  const bids = auction.bids || [];
  const highestBid = bids.length > 0 ? bids[0] : null;
  // Compara se o maior lance é do usuário atual
  const isMyBidHighest = highestBid && userId && highestBid.user?.id === userId;
  
  if (isFinished) {
    return isMyBidHighest 
      ? <Badge className="bg-primary hover:bg-primary/90">Vencido</Badge>
      : <Badge variant="secondary">Perdido</Badge>;
  }
  
  return isMyBidHighest
    ? <Badge className="bg-emerald-500 hover:bg-emerald-600">Ganhando</Badge>
    : <Badge variant="destructive">Superado</Badge>;
};

const getTimeRemaining = (endDate: string) => {
  const now = new Date();
  const end = new Date(endDate);
  const distance = end.getTime() - now.getTime();

  if (distance < 0) {
    return 'Finalizado';
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export default function MyBidsPage() {
  const { user } = useAuth();
  const [bids, setBids] = useState<UserBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadBids();
    }
  }, [user?.id]);

  const loadBids = async () => {
    try {
      setLoading(true);
      const data = await getMyBids();
      // Ordenar por data de criação (mais recentes primeiro)
      setBids(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err: any) {
      toast.error('Erro ao carregar lances', {
        description: err.message || 'Não foi possível carregar seus lances',
      });
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentBid = (bid: UserBid) => {
    const bids = bid.auction.bids || [];
    if (bids.length === 0) {
      return parseFloat(bid.auction.start_price);
    }
    return parseFloat(bids[0].amount);
  };

  const getStatus = (bid: UserBid) => {
    const auction = bid.auction;
    const isFinished = auction.status === 'FINISHED' || new Date(auction.end_date) < new Date();
    const bids = auction.bids || [];
    const highestBid = bids.length > 0 ? bids[0] : null;
    // Compara se o maior lance é do usuário atual
    const isMyBidHighest = highestBid && user?.id && highestBid.user?.id === user.id;
    
    if (isFinished) {
      return isMyBidHighest ? 'won' : 'lost';
    }
    
    return isMyBidHighest ? 'winning' : 'outbid';
  };

  const imageUrl = (bid: UserBid) => {
    const firstImage = bid.auction.product.images?.[0];
    return firstImage ? getProductImageUrl(firstImage.url) : null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Lances</h1>
          <p className="text-muted-foreground">Acompanhe o status dos seus lances em leilões.</p>
        </div>
        <Link href="/auctions">
          <Button variant="outline" className="gap-2">
            Ver Leilões Ativos <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bids.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="pt-12 pb-12">
            <EmptyState
              variant="default"
              icon="gavel"
              title="Nenhum lance realizado"
              description="Você ainda não deu nenhum lance em leilões. Explore os leilões disponíveis e comece a participar!"
              action={{
                label: "Ver Leilões",
                onClick: () => window.location.href = '/auctions'
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bids.map((bid) => {
            const status = getStatus(bid);
            const currentBid = getCurrentBid(bid);
            const myBidAmount = parseFloat(bid.amount);
            const isFinished = bid.auction.status === 'FINISHED' || new Date(bid.auction.end_date) < new Date();
            
            return (
              <Card key={bid.id} className="bg-card border-border overflow-hidden hover:border-primary/50 transition-colors">
                <Link href={`/auctions/${bid.auction.id}`}>
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 cursor-pointer">
                    {/* Image */}
                    <div className="w-full sm:w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      {imageUrl(bid) ? (
                        <img 
                          src={imageUrl(bid)!} 
                          alt={bid.auction.product.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gavel className="w-8 h-8 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <h3 className="font-bold text-lg text-foreground">{bid.auction.product.name}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {isFinished ? 'Finalizado' : getTimeRemaining(bid.auction.end_date)}
                      </div>
                    </div>

                    {/* Bids */}
                    <div className="grid grid-cols-2 gap-8 text-center sm:text-right px-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Seu Lance</p>
                        <p className="font-medium text-foreground">R$ {myBidAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lance Atual</p>
                        <p className={`font-bold ${status === 'outbid' ? 'text-destructive' : 'text-emerald-500'}`}>
                          R$ {currentBid.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div className="flex flex-col items-center sm:items-end gap-2 min-w-[120px]">
                      {getStatusBadge(bid, user?.id)}
                      
                      {status === 'outbid' && !isFinished && (
                        <Button 
                          size="sm" 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/auctions/${bid.auction.id}`;
                          }}
                        >
                          Aumentar Lance
                        </Button>
                      )}
                      {status === 'won' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/auctions/${bid.auction.id}`;
                          }}
                        >
                          Ver Detalhes
                        </Button>
                      )}
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
