'use client';

import { useState, useEffect } from 'react';
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
  Heart,
  MessageCircle,
  Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { ShareModal } from '@/components/ui/share-modal';
import { ConstructionNotice } from '@/components/ui/construction-notice';
import { SellerChatModal } from '@/components/ui/seller-chat-modal';
import { UserProfileModal } from '@/components/shared/user-profile-modal';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showConstructionNotice, setShowConstructionNotice] = useState(false);
  const [showLikeConstruction, setShowLikeConstruction] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Ícone visual */}
            <div className="relative mb-8">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-backgroundSecondary rounded-full flex items-center justify-center border-4 border-primary/20">
                <Package className="w-16 h-16 md:w-20 md:h-20 text-primary/40" />
              </div>
            </div>

            {/* Mensagem */}
            <h2 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">
              Produto não encontrado
            </h2>
            <p className="text-lg md:text-xl text-textSecondary mb-8 max-w-md mx-auto">
              Este produto não está mais disponível ou nunca existiu.
            </p>

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button onClick={() => router.back()} variant="outline" size="lg" className="h-12 px-8 text-base gap-2">
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </Button>
              <Link href="/">
                <Button size="lg" variant="primary" className="h-12 px-8 text-base gap-2">
                  <Package className="w-5 h-5" />
                  Ver Produtos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Properties not in Product type - preventing build errors
  const isAuction = false; 
  const auctionBids = 0;
  const sellerName = product.authorName || "Vendedor";

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = product?.name || 'Produto';

  // Check if product belongs to current user
  const getCurrentUserId = (): string | null => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('colecionai.user');
    if (!userData) return null;
    try {
      const user = JSON.parse(userData);
      return user.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();
  const isOwnProduct = currentUserId === product.user_id;

  // Pre-filled message for buy button
  const priceFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 100);
  const initialMessage = `Olá! Tenho interesse no seu produto "${product.name}" por ${priceFormatted}. Está disponível?`;

  return (
    <>
      <ShareModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        url={currentUrl}
        title={shareTitle}
        description="Compartilhe este produto com seus amigos!"
      />

      <ConstructionNotice
        open={showConstructionNotice}
        onOpenChange={setShowConstructionNotice}
        title="Leilões em Construção"
        description="A funcionalidade de leilões está em desenvolvimento e estará disponível em breve."
      />

      <ConstructionNotice
        open={showLikeConstruction}
        onOpenChange={setShowLikeConstruction}
        title="Favoritos em Construção"
        description="A funcionalidade de favoritar produtos está em desenvolvimento e estará disponível em breve."
      />

      <UserProfileModal
        userId={product?.user_id || ''}
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
      />

      <SellerChatModal
        open={showChatModal}
        onOpenChange={setShowChatModal}
        sellerName={sellerName}
        productName={product.name}
        productId={product.id}
        initialMessage={initialMessage}
      />

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
                    <EmptyState
                      variant="image"
                      title="Imagem não disponível"
                      className="w-full h-full"
                    />
                )}
                
                {/* Floating Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="rounded-full shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white text-foreground"
                      onClick={() => setShowShareModal(true)}
                    >
                        <Share2 className="w-5 h-5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="rounded-full shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white text-destructive hover:text-destructive"
                      onClick={() => setShowLikeConstruction(true)}
                    >
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
                    {isOwnProduct ? (
                      <>
                        <Button
                            size="lg"
                            className="w-full text-lg h-14 font-bold rounded-xl shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={() => router.push('/dashboard/sales')}
                        >
                            <Edit className="mr-2 h-5 w-5" /> Editar Produto
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            Este é o seu produto
                        </p>
                      </>
                    ) : (
                      <>
                        <Button
                            size="lg"
                            className={cn(
                                "w-full text-lg h-14 font-bold rounded-xl shadow-lg shadow-primary/20",
                                isAuction ? "bg-amber-500 hover:bg-amber-600" : "bg-primary hover:bg-primary/90"
                            )}
                            onClick={() => {
                              if (isAuction) {
                                setShowConstructionNotice(true);
                              } else {
                                setShowChatModal(true);
                              }
                            }}
                        >
                            {isAuction ? (
                                <><Gavel className="mr-2 h-5 w-5" /> Dar Lance</>
                            ) : (
                                <><ShoppingCart className="mr-2 h-5 w-5" /> Comprar Agora</>
                            )}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            Inicie uma conversa com o vendedor
                        </p>
                      </>
                    )}
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
                            <p className="font-bold text-foreground">{sellerName}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full"
                        onClick={() => setShowProfileModal(true)}
                      >
                        Ver Perfil
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="rounded-full gap-2"
                        onClick={() => setShowChatModal(true)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </Button>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
    </>
  );
}
