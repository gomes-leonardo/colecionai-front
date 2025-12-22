'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Clock, Gavel, ArrowLeft, Loader2, Zap, Trophy, Users, AlertCircle, XCircle } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getAuctionDetails, cancelAuction } from '@/services/auctionService';
import { createBid } from '@/services/bidService';
import { AuctionDetails } from '@/types/auction';
import { useAuth } from '@/hooks/useAuth';
import { getProductImageUrl } from '@/services/productService';
import { initializeSocket, getSocket, offSocketEvent } from '@/lib/socket';

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth(false); // Don't require auth for viewing auctions
  const [auction, setAuction] = useState<AuctionDetails | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cancellingAuction, setCancellingAuction] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Fetch auction details
  const fetchAuction = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const auctionId = params.id as string;
      const data = await getAuctionDetails(auctionId);
      setAuction(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar leilão');
      toast.error(err.message || 'Erro ao carregar leilão');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchAuction();
    }
  }, [params.id, fetchAuction]);

  // WebSocket: Join auction room and listen for real-time updates
  useEffect(() => {
    const auctionId = params.id as string;
    if (!auctionId) return;

    // Initialize socket connection
    const socket = initializeSocket();
    console.log('🔌 Conectando ao WebSocket para leilão:', auctionId);

    // 1. Join the auction room
    socket.emit('join_auction', { auction_id: auctionId });
    console.log('📥 Entrando na sala do leilão:', auctionId);

    // 2. Listen for new bids (real-time price updates)
    const handleNewBid = (newBid: any) => {
      console.log('💰 Novo lance recebido:', newBid);
      
      // Update auction state with new bid (apenas atualização da UI)
      setAuction((prevAuction) => {
        if (!prevAuction) return prevAuction;
        
        return {
          ...prevAuction,
          current_bid: newBid.amount.toString(),
          bids: [newBid, ...prevAuction.bids],
          _count: {
            bids: prevAuction._count.bids + 1
          }
        };
      });

      // Não cria notificação aqui - apenas atualiza a UI
      // As notificações serão enviadas pelo backend via evento 'notification':
      // - OUTBID: quando o usuário foi superado
      // - OWNER_NEW_BID: quando o dono do produto recebe um lance
    };

    // 3. Listen for notifications (outbid alerts)
    // Nota: As notificações são tratadas globalmente pelo NotificationListener
    // Este handler pode ser usado para ações locais específicas se necessário
    const handleNotification = (notification: any) => {
      console.log('🔔 Notificação recebida na página de leilão:', notification);
      // Não precisa adicionar notificação aqui - o NotificationListener global já faz isso
    };

    // Attach event listeners
    socket.on('new_bid', handleNewBid);
    socket.on('notification', handleNotification);

    // Cleanup on unmount
    return () => {
      console.log('📤 Saindo da sala do leilão:', auctionId);
      socket.emit('leave_auction', { auction_id: auctionId });
      
      // Remove event listeners
      const currentSocket = getSocket();
      if (currentSocket) {
        offSocketEvent('new_bid', handleNewBid);
        offSocketEvent('notification', handleNotification);
      }
    };
  }, [params.id]);

  // Calcular tempo restante
  useEffect(() => {
    if (!auction) return;

    // Se o leilão já está finalizado, não calcular timer
    if (auction.status === 'FINISHED' || auction.status === 'CANCELLED') {
      setTimeRemaining('Encerrado');
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      
      // Calcular end_date baseado em created_at + 48 horas (2 dias)
      const createdAt = auction.created_at ? new Date(auction.created_at).getTime() : new Date(auction.start_date).getTime();
      const endTime = createdAt + (48 * 60 * 60 * 1000); // 48 horas em milissegundos
      
      const distance = endTime - now;

      if (distance < 0) {
        setTimeRemaining('Encerrado');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  const handlePlaceBid = async () => {
    if (!auction || !user) {
      toast.error('Você precisa estar autenticado para dar lances');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    const minBidValue = parseFloat((parseFloat(auction.bids.length > 0 ? auction.bids[0].amount : auction.start_price) + 10).toFixed(2));

    if (isNaN(bidValue) || bidValue < minBidValue) {
      toast.error('Lance inválido', {
        description: `O lance mínimo é R$ ${minBidValue.toFixed(2)}`
      });
      return;
    }

    try {
      setPlacingBid(true);
      
      await createBid({
        auction_id: auction.id,
        amount: bidValue
      });

      toast.success('Lance realizado com sucesso!', {
        description: `Seu lance de R$ ${bidValue.toFixed(2)} foi registrado. Boa sorte!`
      });
      
      setBidAmount('');
      
      // Refresh auction data to show new bid
      await fetchAuction();
    } catch (error: any) {
      toast.error('Erro ao dar lance', {
        description: error.message || 'Tente novamente'
      });
    } finally {
      setPlacingBid(false);
    }
  };

  const handleCancelAuction = async () => {
    if (!auction) return;

    try {
      setCancellingAuction(true);
      await cancelAuction(auction.id);
      toast.success('Leilão cancelado com sucesso!', {
        description: 'O produto voltou para a lista de produtos disponíveis.'
      });
      router.push('/auctions');
    } catch (error: any) {
      toast.error('Erro ao cancelar leilão', {
        description: error.message || 'Tente novamente'
      });
    } finally {
      setCancellingAuction(false);
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Erro ao carregar leilão</h3>
                <p className="text-sm text-muted-foreground">{error || 'Leilão não encontrado'}</p>
              </div>
              <Button onClick={() => router.push('/auctions')}>
                Voltar para Leilões
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user && auction.product.user && user.id === auction.product.user.id;
  const isFinished = auction.status === 'FINISHED' || auction.status === 'CANCELLED' || timeRemaining === 'Encerrado';
  const currentBid = auction.bids.length > 0 ? auction.bids[0].amount : auction.start_price;
  const minBid = (parseFloat(currentBid) + 10).toFixed(2);
  const imageUrl = auction.product.images?.[0]?.url 
    ? getProductImageUrl(auction.product.images[0].url)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero Section com Badge Destacado */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            
            {/* Badge de Leilão Ativo - Mais Visível */}
            <div className="flex items-center gap-4">
              {!isFinished && (
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-3 text-base font-semibold shadow-lg shadow-primary/30 animate-pulse">
                  <Zap className="w-5 h-5 mr-2" />
                  Leilão Ativo
                </Badge>
              )}
              {isFinished && (
                <Badge variant="secondary" className="px-6 py-3 text-base font-semibold">
                  Encerrado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Coluna Principal - Produto (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Imagem do Produto com Overlay de Info */}
            <Card className="overflow-hidden border-2 border-border">
              <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={auction.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <EmptyState variant="image" className="w-full h-full" />
                )}
                
                {/* Overlay com Timer - Posição Inferior */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/80 text-sm mb-1">Tempo Restante</p>
                      <p className="text-white text-3xl font-bold font-mono tracking-tight">
                        {timeRemaining}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 text-sm mb-1">Lance Atual</p>
                      <p className="text-white text-3xl font-bold">
                        {formatCurrency(currentBid)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Informações do Produto */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-3">
                      {auction.product.name}
                    </CardTitle>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-sm">
                        Vendedor: {auction.product.user.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {auction.product.description}
                </p>
              </CardContent>
            </Card>

            {/* Histórico de Lances - Design Melhorado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Histórico de Lances
                  <Badge variant="secondary" className="ml-2">
                    {auction._count.bids} lances
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auction.bids.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhum lance ainda. Seja o primeiro!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {auction.bids.map((bid, index) => (
                      <div key={bid.id || `bid-${index}`}>
                        <div className={`flex items-center justify-between py-4 px-4 rounded-lg transition-colors ${
                          index === 0 ? 'bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20' : 'hover:bg-muted/50'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-muted'
                            }`}>
                              {index === 0 ? (
                                <Trophy className="w-5 h-5 text-white" />
                              ) : (
                                <span className="text-sm font-semibold text-muted-foreground">#{index + 1}</span>
                              )}
                            </div>
                            <div>
                              <p className={`font-medium ${index === 0 ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                                {bid.user?.name || 'Usuário anônimo'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(bid.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xl font-bold ${index === 0 ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                              {formatCurrency(bid.amount)}
                            </p>
                          </div>
                        </div>
                        {index < auction.bids.length - 1 && <Separator className="my-1" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Ações (2/5) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card de Dar Lance - Design Melhorado */}
            <div className="sticky top-4">
              {isOwner ? (
                <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5">
                  <CardHeader>
                    <CardTitle className="text-center text-xl">Seu Leilão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        Este é o seu leilão. Você não pode dar lances em seus próprios itens.
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Lance Atual</p>
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(currentBid)}
                      </p>
                    </div>
                    
                    {/* Botão Cancelar - só aparece se leilão estiver ativo */}
                    {auction.status === 'OPEN' && (
                      <>
                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full hover:bg-warning/10 hover:text-warning hover:border-warning/30"
                          onClick={() => setShowCancelDialog(true)}
                          disabled={cancellingAuction}
                        >
                          {cancellingAuction ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 mr-2" />
                              Cancelar Leilão
                            </>
                          )}
                        </Button>
                        
                        <ConfirmDialog
                          open={showCancelDialog}
                          onOpenChange={setShowCancelDialog}
                          onConfirm={handleCancelAuction}
                          title="Cancelar Leilão?"
                          description="Tem certeza que deseja cancelar este leilão? Esta ação não pode ser desfeita. O produto voltará para a lista de produtos disponíveis. Só é possível cancelar se não houver lances."
                          confirmText="Sim, cancelar"
                          cancelText="Não, manter"
                          variant="destructive"
                        />
                      </>
                    )}
                    
                    {auction.status === 'OPEN' && (
                      <p className="text-xs text-center text-muted-foreground">
                        Só é possível cancelar se não houver lances
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5 shadow-xl shadow-primary/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-center text-2xl">Dar Seu Lance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Lance Atual Destacado */}
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-2">Lance Atual</p>
                      <p className="text-5xl font-bold text-primary mb-1">
                        {formatCurrency(currentBid)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Inicial: {formatCurrency(auction.start_price)}
                      </p>
                    </div>

                    {/* Input de Lance */}
                    {!isFinished && (
                      <>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Seu lance</span>
                            <span className="text-xs text-muted-foreground">
                              Mínimo: {formatCurrency(minBid)}
                            </span>
                          </div>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                              R$
                            </span>
                            <Input
                              type="number"
                              step="10"
                              min={minBid}
                              placeholder={minBid}
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              className="pl-12 h-14 text-xl font-semibold text-center"
                            />
                          </div>
                        </div>

                        {/* Botão de Lance */}
                        <Button
                          size="lg"
                          className="w-full h-16 text-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02]"
                          onClick={handlePlaceBid}
                          disabled={placingBid || !bidAmount || parseFloat(bidAmount) < parseFloat(minBid) || !user}
                        >
                          {placingBid ? (
                            <>
                              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                              Processando...
                            </>
                          ) : !user ? (
                            'Faça login para dar lances'
                          ) : (
                            <>
                              <Gavel className="w-6 h-6 mr-2" />
                              Confirmar Lance
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                          Ao dar um lance, você concorda com os termos do leilão
                        </p>
                      </>
                    )}

                    {isFinished && (
                      <div className="text-center p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">
                          Este leilão foi encerrado
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Estatísticas */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Total de Lances</span>
                    <span className="text-2xl font-bold text-primary">{auction._count.bids}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground">Participantes</span>
                    <span className="text-2xl font-bold text-primary">{auction.bids.length}</span>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Início</span>
                      <span className="font-medium">{formatDate(auction.start_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Término</span>
                      <span className="font-medium">{formatDate(auction.end_date)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
