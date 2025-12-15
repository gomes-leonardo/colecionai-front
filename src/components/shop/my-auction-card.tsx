'use client';

import { useState, useEffect } from 'react';
import { Auction } from '@/types/auction';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/empty-state';
import { getProductImageUrl } from '@/services/productService';
import { DeleteModal } from '@/components/ui/delete-modal';

interface MyAuctionCardProps {
  auction: Auction;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function MyAuctionCard({ auction, onDelete, isDeleting = false }: MyAuctionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isFinished, setIsFinished] = useState(false);

  // Calcular tempo restante (similar ao AuctionCard)
  useEffect(() => {
    if (auction.status === 'FINISHED') {
      setIsFinished(true);
      setTimeRemaining('Encerrado');
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const createdAt = auction.created_at ? new Date(auction.created_at).getTime() : new Date(auction.start_date).getTime();
      const endTime = createdAt + (48 * 60 * 60 * 1000);
      const distance = endTime - now;

      if (distance < 0) {
        setTimeRemaining('Encerrado');
        setIsFinished(true);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [auction.status, auction.created_at, auction.start_date]);

  const imageUrl = auction.product.images?.[0]?.url 
    ? getProductImageUrl(auction.product.images[0].url)
    : null;
  const startPrice = parseFloat(auction.start_price);

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-border/50 overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={auction.product.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <EmptyState
          variant="image"
          className="w-full h-full absolute inset-0"
        />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
          {!isFinished && (
            <Badge className="bg-red-500/90 text-white backdrop-blur-md shadow-lg px-3 py-1 text-xs font-medium animate-pulse">
              Ao Vivo
            </Badge>
          )}
          <Badge className={`${
            isFinished 
              ? 'bg-muted/90 text-muted-foreground backdrop-blur-md border border-border/50' 
              : 'bg-primary/90 text-primary-foreground backdrop-blur-md shadow-lg'
          } px-3 py-1 text-xs font-medium`}>
            {isFinished ? 'Encerrado' : 'Ativo'}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-base line-clamp-1">
            {auction.product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            {auction.product.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Lance inicial</p>
            <p className="text-lg font-bold text-foreground">
              R$ {startPrice.toFixed(2)}
            </p>
          </div>
          {!isFinished && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" />
                Termina em
              </p>
              <p className="text-sm font-semibold text-primary font-mono">
                {timeRemaining}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href={`/auctions/${auction.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Ver Detalhes
            </Button>
          </Link>
          <DeleteModal
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            }
            onConfirm={() => onDelete(auction.id)}
            title="Excluir Leilão?"
            description="Tem certeza que deseja excluir este leilão? Esta ação não pode ser desfeita. Todos os lances relacionados serão perdidos."
            isDeleting={isDeleting}
          />
        </div>
      </CardContent>
    </Card>
  );
}
