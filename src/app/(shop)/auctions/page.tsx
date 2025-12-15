'use client';

import { useState, useEffect } from 'react';
import { Gavel, Loader2, Plus } from 'lucide-react';
import { getAuctions, getMyAuctions, deleteAuction } from '@/services/auctionService';
import { Auction, AuctionFilters as AuctionFiltersType } from '@/types/auction';
import { AuctionCard } from '@/components/shop/auction-card';
import { MyAuctionCard } from '@/components/shop/my-auction-card';
import { AuctionFilters } from '@/components/shop/auction-filters';
import { AuctionRulesModal } from '@/components/ui/auction-rules-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function AuctionsPage() {
  const { isAuthenticated, user } = useAuth(false);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [myAuctions, setMyAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMyAuctions, setLoadingMyAuctions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuctionFiltersType>({
    page: 1,
    per_page: 12,
  });
  const [activeTab, setActiveTab] = useState('all');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadAuctions();
  }, [filters]);

  useEffect(() => {
    if (isAuthenticated && user && activeTab === 'my-auctions') {
      loadMyAuctions();
    }
  }, [isAuthenticated, user, activeTab]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuctions(filters);
      setAuctions(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar leilões');
    } finally {
      setLoading(false);
    }
  };

  const loadMyAuctions = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingMyAuctions(true);
      const data = await getMyAuctions(user.id);
      console.log(data)
      setMyAuctions(data);
    } catch (err: any) {
      console.error('Erro ao carregar meus leilões:', err);
      setMyAuctions([]);
    } finally {
      setLoadingMyAuctions(false);
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    try {
      setDeletingId(auctionId);
      await deleteAuction(auctionId);
      toast.success('Leilão excluído com sucesso!');
      loadMyAuctions(); // Reload my auctions
    } catch (err: any) {
      toast.error('Erro ao excluir leilão', {
        description: err.message
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const hasActiveFilters = filters.name || filters.category || filters.condition;

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <AuctionRulesModal 
        open={showRulesModal} 
        onOpenChange={setShowRulesModal}
      />
      
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
          <Gavel className="w-10 h-10 text-primary" />
          Leilões em Destaque
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
          Dê o seu lance em itens raros e exclusivos. A melhor oferta leva para casa.
        </p>
        <Button 
          size="lg" 
          className="shadow-lg shadow-primary/20"
          onClick={() => setShowRulesModal(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Criar Novo Leilão
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="all">Todos os Leilões</TabsTrigger>
          <TabsTrigger value="my-auctions">
            Meus Leilões {myAuctions.length > 0 && `(${myAuctions.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Todos os Leilões */}
        <TabsContent value="all" className="space-y-8">
          <AuctionFilters filters={filters} onFilterChange={handleFilterChange} />

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <EmptyState
              variant="error"
              title="Erro ao carregar leilões"
              description={error}
              action={{
                label: 'Tentar Novamente',
                onClick: loadAuctions
              }}
            />
          )}

          {!loading && !error && auctions.length === 0 && (
            <EmptyState
              variant="auctions"
              title="Nenhum leilão encontrado"
              description={
                hasActiveFilters
                  ? "Não encontramos leilões que correspondam aos seus filtros. Tente ajustar os critérios de busca."
                  : "Não há leilões ativos no momento. Seja o primeiro a criar um leilão!"
              }
              action={
                hasActiveFilters ? {
                  label: 'Limpar Filtros',
                  onClick: () => {
                    setFilters({ page: 1, per_page: 12 });
                  }
                } : {
                  label: 'Criar Primeiro Leilão',
                  onClick: () => window.location.href = '/auctions/create'
                }
              }
            />
          )}

          {!loading && !error && auctions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Meus Leilões */}
        <TabsContent value="my-auctions" className="space-y-8">
          {loadingMyAuctions && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          )}

          {!loadingMyAuctions && myAuctions.length === 0 && (
            <EmptyState
              variant="auctions"
              title="Você ainda não tem leilões"
              description="Crie seu primeiro leilão e comece a vender seus itens de coleção para outros colecionadores."
              action={{
                label: 'Criar Meu Primeiro Leilão',
                onClick: () => window.location.href = '/auctions/create'
              }}
            />
          )}

          {!loadingMyAuctions && myAuctions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {myAuctions.map((auction) => (
                <MyAuctionCard 
                  key={auction.id} 
                  auction={auction}
                  onDelete={handleDeleteAuction}
                  isDeleting={deletingId === auction.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
