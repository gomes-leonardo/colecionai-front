'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProducts, deleteProduct, getProductImageUrl } from '@/services/productService';
import { Button } from '@/components/ui/button';
import { DeleteModal } from "@/components/ui/delete-modal";
import { Pencil, Package, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyAdsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['my-products'],
    queryFn: () => getMyProducts(),
    enabled: isAuthenticated,
  });

  const { mutateAsync: removeProduct } = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['my-products'] });
      const previousProducts = queryClient.getQueryData(['my-products']);

      queryClient.setQueryData(['my-products'], (old: any[]) =>
        old ? old.filter((product) => product.id !== id) : []
      );

      return { previousProducts };
    },
    onError: (err, newTodo, context: any) => {
      queryClient.setQueryData(['my-products'], context.previousProducts);
      toast.error("Erro ao excluir produto");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
    onSuccess: () => {
      toast.success("Anúncio removido com sucesso");
    },
  });

  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Anúncios</h1>
          <p className="text-muted-foreground">Gerencie seus itens à venda no marketplace.</p>
        </div>
        <Link href="/announce">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Novo Anúncio
          </Button>
        </Link>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Itens Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full bg-muted" />
              <Skeleton className="h-16 w-full bg-muted" />
              <Skeleton className="h-16 w-full bg-muted" />
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-destructive">
              Erro ao carregar seus anúncios. Tente recarregar a página.
            </div>
          ) : products?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="p-6 rounded-full bg-muted/50">
                <Package className="w-12 h-12 text-muted-foreground opacity-50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">Nenhum anúncio ativo</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Você não tem itens sendo vendidos no momento.
                </p>
              </div>
              <Link href="/announce">
                <Button variant="outline" className="mt-4 border-primary text-primary hover:bg-primary/10">
                  Criar Anúncio
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/50 text-sm font-medium text-muted-foreground">
                <div className="col-span-6">Produto</div>
                <div className="col-span-3">Preço</div>
                <div className="col-span-3 text-right">Ações</div>
              </div>
              {products?.map((product) => (
                <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-border last:border-0 hover:bg-muted/30 transition-colors group">
                  <div className="col-span-6 font-medium text-foreground flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {getProductImageUrl(product.banner) && (
                        <img 
                          src={getProductImageUrl(product.banner)!} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      )}
                      <div className={`w-full h-full flex items-center justify-center ${getProductImageUrl(product.banner) ? 'hidden' : ''}`}>
                        <Package className="w-5 h-5 text-muted-foreground opacity-50" />
                      </div>
                    </div>
                    {product.name}
                  </div>
                  <div className="col-span-3 text-emerald-500 font-bold">
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="col-span-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <DeleteModal
                      onConfirm={async () => await removeProduct(product.id)}
                      title="Excluir Anúncio?"
                      description="Tem certeza que deseja remover este anúncio? O item não aparecerá mais no marketplace."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
