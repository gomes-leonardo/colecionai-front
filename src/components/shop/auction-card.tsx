import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import Link from "next/link";
import { Auction } from "@/types/auction";
import { useEffect, useState } from "react";
import { getProductImageUrl } from "@/services/productService";
import { EmptyState } from "@/components/ui/empty-state";

interface AuctionCardProps {
  auction: Auction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Se o status já é FINISHED, não precisa calcular
    if (auction.status === 'FINISHED') {
      setIsFinished(true);
      setTimeRemaining("Encerrado");
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      
      // Calcular end_date baseado em created_at + 48 horas (2 dias)
      const createdAt = auction.created_at ? new Date(auction.created_at).getTime() : new Date(auction.start_date).getTime();
      const endTime = createdAt + (48 * 60 * 60 * 1000); // 48 horas em milissegundos
      
      const distance = endTime - now;

      if (distance < 0) {
        setTimeRemaining("Encerrado");
        setIsFinished(true);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [auction.end_date, auction.created_at, auction.start_date, auction.status]);

  // Get the first image URL from the product images array
  const imageUrl = auction.product.images?.[0]?.url 
    ? getProductImageUrl(auction.product.images[0].url)
    : null;
  const startPrice = parseFloat(auction.start_price);

  return (
    <Link href={`/auctions/${auction.id}`}>
      <Card 
        className="bg-background/80 backdrop-blur-xl border-border/40 overflow-hidden hover:border-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out group relative rounded-2xl"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        }}
        data-auction-preview
      >
        {/* Faixa diagonal "ENCERRADO" quando o leilão está finalizado */}
        {isFinished && (
          <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-2xl">
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-25deg] origin-center"
              style={{
                width: '200%',
                height: '60px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span 
                className="text-white font-bold text-xl tracking-wider uppercase"
                style={{
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '0.2em',
                }}
              >
                ENCERRADO
              </span>
            </div>
          </div>
        )}

        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/20 to-muted/5 rounded-t-2xl">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={auction.product.name}
              className={`object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out ${
                isFinished ? 'opacity-50 grayscale' : ''
              }`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          <EmptyState
            variant="image"
            className="w-full h-full absolute inset-0"
          />
          
          {/* Badge "Ao Vivo" - Apple-like com animação piscante */}
          {!isFinished && (
            <div className="absolute top-4 right-4 z-10">
              <div 
                className="px-4 py-1.5 rounded-full backdrop-blur-xl shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                  animation: 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              >
                <span 
                  className="text-white font-semibold text-xs tracking-wider uppercase"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '0.05em',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  Ao Vivo
                </span>
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-5 space-y-3.5">
          <div className="space-y-1">
            <h3 className="font-semibold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
              {auction.product.name}
            </h3>
            <p className="text-sm text-muted-foreground/80 line-clamp-1 leading-relaxed">
              {auction.product.description}
            </p>
          </div>

          <div className="flex items-end justify-between pt-3 border-t border-border/30">
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground/70 font-medium">Lance inicial</p>
              <p className="text-xl font-bold text-foreground tracking-tight">
                R$ {startPrice.toFixed(2)}
              </p>
            </div>
            {!isFinished && (
              <div className="text-right space-y-0.5">
                <p className="text-xs text-muted-foreground/70 mb-1 flex items-center gap-1 justify-end font-medium">
                  <Clock className="w-3 h-3" />
                  Termina em
                </p>
                <p className="text-sm font-semibold text-primary font-mono tracking-tight">
                  {timeRemaining}
                </p>
              </div>
            )}
            {isFinished && (
              <div className="text-right">
                <Badge variant="outline" className="text-muted-foreground/70 border-border/40 bg-muted/30">
                  Finalizado
                </Badge>
              </div>
            )}
          </div>
        </CardContent>

        {/* Estilo CSS para animação piscante suave */}
        <style jsx>{`
          @keyframes pulse-glow {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.85;
              transform: scale(0.98);
            }
          }
        `}</style>
      </Card>
    </Link>
  );
}
