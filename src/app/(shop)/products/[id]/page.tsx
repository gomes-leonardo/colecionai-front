'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, getProductImageUrl } from '@/services/productService';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Gavel, 
  Clock, 
  User, 
  ShieldCheck, 
  Share2,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      try {
        if (typeof params.id === 'string') {
          const data = await getProductById(params.id);
          setProduct(data);
        }
      } catch (err) {
        setError('Erro ao carregar produto');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-muted-foreground mb-4">Produto não encontrado</h2>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  // Properties not in Product type - preventing build errors
  const isAuction = false; 
  const auctionBids = 0;
  const sellerName = "Vendedor"; // Placeholder as Product type only has user_id

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-8 hover:bg-transparent hover:text-primary transition-colors pl-0"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a loja
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left Column - Image */}
        <div className="relative group">
            <Card className="overflow-hidden border-border bg-card shadow-sm rounded-3xl aspect-square flex items-center justify-center relative">
                {product.banner ? (
                    <img 
                        src={getProductImageUrl(product.banner) || ''} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-muted/30 flex flex-col items-center justify-center text-muted-foreground">
                         <div className="text-6xl font-bold text-muted-foreground/20">IMG</div>
                         <p className="mt-4 text-sm font-medium">Sem imagem</p>
                    </div>
                )}
                
                {/* Floating Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white text-foreground">
                        <Share2 className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white text-destructive hover:text-destructive">
                        <Heart className="w-5 h-5" />
                    </Button>
                </div>
            </Card>
        </div>

        {/* Right Column - Details */}
        <div className="flex flex-col space-y-8 py-2">
            
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        {product.category}
                    </span>
                    {isAuction && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Em Leilão
                        </span>
                    )}
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
                    {product.name}
                </h1>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-1 text-success" />
                        <span className="text-sm font-medium">Proteção ao comprador garantida</span>
                    </div>
                </div>
            </div>

            {/* Price & Action */}
            <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-primary/10 rounded-2xl shadow-sm space-y-6">
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        {isAuction ? 'Lance Atual' : 'Preço Total'}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className={cn("text-5xl font-extrabold tracking-tight", isAuction ? "text-amber-600" : "text-primary")}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 100)}
                        </span>
                    </div>
                    {isAuction && (
                         <p className="text-sm text-amber-600/80 font-medium">
                            {auctionBids} pessoas deram lance
                         </p>
                    )}
                </div>

                <div className="space-y-3">
                    <Button 
                        size="lg" 
                        className={cn(
                            "w-full text-lg h-14 font-bold rounded-xl shadow-lg shadow-primary/20",
                            isAuction ? "bg-amber-500 hover:bg-amber-600" : "bg-primary hover:bg-primary/90"
                        )}
                    >
                        {isAuction ? (
                            <><Gavel className="mr-2 h-5 w-5" /> Dar Lance</>
                        ) : (
                            <><ShoppingCart className="mr-2 h-5 w-5" /> Comprar Agora</>
                        )}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                        Transação segura e processada pelo Colecionai
                    </p>
                </div>
            </Card>

            {/* Description */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">Sobre este item</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                    {product.description || "Este produto não possui uma descrição detalhada fornecida pelo vendedor. Entre em contato para mais informações."}
                </p>
            </div>

            {/* Seller */}
            <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                            <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Vendido por</p>
                            <p className="font-bold text-foreground">@{sellerName}</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                        Ver Perfil
                    </Button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
