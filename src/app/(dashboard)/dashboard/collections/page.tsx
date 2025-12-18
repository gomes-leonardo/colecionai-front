'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { AuctionCard } from '@/components/shop/auction-card';
import { getMyAuctions, deleteAuction } from '@/services/auctionService';
import { Auction } from '@/types/auction';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Gavel, Plus, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { DeleteModal } from '@/components/ui/delete-modal';

export default function MyAuctionsPage() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadAuctions();
    }
  }, [user?.id]);

  const loadAuctions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getMyAuctions(user.id);
      setAuctions(data);
    } catch (err: any) {
      toast.error('Erro ao carregar leilões', {
        description: err.message || 'Não foi possível carregar seus leilões',
      });
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (auctionId: string) => {
    try {
      setDeletingId(auctionId);
      await deleteAuction(auctionId);
      toast.success('Leilão excluído com sucesso!');
      loadAuctions();
    } catch (err: any) {
      toast.error('Erro ao excluir leilão', {
        description: err.message || 'Não foi possível excluir o leilão',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const activeAuctions = auctions.filter(a => a.status === 'OPEN');
  const finishedAuctions = auctions.filter(a => a.status === 'FINISHED');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Leilões</h1>
          <p className="text-muted-foreground">
            Gerencie seus leilões ativos e acompanhe os finalizados.
          </p>
        </div>
        <Link href="/auctions/create">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Criar Leilão
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Leilões</p>
                <div className="text-2xl font-bold text-foreground">
                  {loading ? <Skeleton className="h-8 w-16 inline-block" /> : auctions.length}
                </div>
              </div>
              <Gavel className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Leilões Ativos</p>
                <div className="text-2xl font-bold text-emerald-500">
                  {loading ? <Skeleton className="h-8 w-16 inline-block" /> : activeAuctions.length}
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                Ativo
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Finalizados</p>
                <div className="text-2xl font-bold text-muted-foreground">
                  {loading ? <Skeleton className="h-8 w-16 inline-block" /> : finishedAuctions.length}
                </div>
              </div>
              <Badge variant="secondary">Finalizado</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leilões Ativos */}
      {activeAuctions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Leilões Ativos</h2>
            <Link href="/auctions">
              <Button variant="outline" size="sm" className="gap-2">
                Ver Todos <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAuctions.map((auction) => (
                <div key={auction.id} className="relative group">
                  <AuctionCard auction={auction} />
                  <div className="absolute top-2 left-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DeleteModal
                      onConfirm={() => handleDelete(auction.id)}
                      title="Excluir Leilão?"
                      description="Tem certeza que deseja excluir este leilão? Esta ação não pode ser desfeita."
                      isDeleting={deletingId === auction.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leilões Finalizados */}
      {finishedAuctions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Leilões Finalizados</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && auctions.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="pt-12 pb-12">
            <EmptyState
              variant="default"
              icon="gavel"
              title="Nenhum leilão criado"
              description="Você ainda não criou nenhum leilão. Que tal criar seu primeiro leilão?"
              action={{
                label: "Criar Primeiro Leilão",
                onClick: () => window.location.href = '/auctions/create'
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
