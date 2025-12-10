'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Package } from 'lucide-react';
import Link from 'next/link';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getProducts, getProductImageUrl } from '@/services/productService';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductSkeleton } from '@/components/ui/product-skeleton';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCategory, ProductCondition } from '@/types';
import { useDebounce } from 'use-debounce';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState } from '@/components/ui/empty-state';

export default function Home() {
  const { ref, inView } = useInView();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth(false);
  
  // Filters State
  const [nameFilter, setNameFilter] = useState('');
  const [debouncedName] = useDebounce(nameFilter, 500);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['products', debouncedName, categoryFilter, conditionFilter],
    queryFn: ({ pageParam = 1 }) => getProducts({
      page: pageParam,
      name: debouncedName || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      condition: conditionFilter !== 'all' ? conditionFilter : undefined
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 12 ? allPages.length + 1 : undefined;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - Only show when NOT authenticated */}
      {!isAuthenticated && (
        <section className="relative py-24 md:py-32 flex items-center justify-center bg-gradient-to-b from-backgroundSecondary to-background">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-textPrimary leading-tight">
                Desapegue e Encontre Itens Únicos
              </h1>
              <p className="text-lg md:text-xl text-textSecondary mb-10 max-w-2xl mx-auto leading-relaxed">
                O marketplace definitivo para colecionadores. De cartas raras a action figures, 
                encontre o que falta na sua estante ou faça dinheiro com o que está parado.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" variant="primary" className="h-12 px-8 text-base">
                  Começar Agora
                </Button>
              </Link>
              <Link href="/announce">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  Anunciar Item
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Categories - Only show when NOT authenticated */}
      {!isAuthenticated && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-semibold text-textPrimary mb-3 text-center">
              Categorias em Destaque
            </h2>
            <p className="text-textSecondary text-center mb-12 max-w-2xl mx-auto">
              Explore nossas principais categorias e encontre exatamente o que procura
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Trading Cards', 'Action Figures', 'Comics & Mangás', 'Games Retrô'].map((category, i) => (
                <Card key={i} className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                  <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
                    <div className="p-4 rounded-xl bg-backgroundSecondary text-primary group-hover:bg-primary-light transition-colors duration-200">
                      <Package className="w-8 h-8" />
                    </div>
                    <span className="font-medium text-textPrimary">{category}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Filters & Recent Arrivals */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          
          {/* Filters */}
          <div className="mb-12 space-y-6" id="product-filters">
            <h2 className="text-3xl font-semibold text-textPrimary">Explorar Produtos</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-backgroundSecondary p-6 rounded-lg border border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-textSecondary">Buscar</label>
                <Input 
                  placeholder="Buscar por nome..." 
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-textSecondary">Categoria</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {Object.values(ProductCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-textSecondary">Condição</label>
                <Select value={conditionFilter} onValueChange={setConditionFilter}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Qualquer condição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Qualquer condição</SelectItem>
                    {Object.values(ProductCondition).map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {condition === 'NEW' ? 'Novo' : condition === 'USED' ? 'Usado' : 'Open Box'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setNameFilter('');
                    setCategoryFilter('all');
                    setConditionFilter('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="product-listing">
            {status === 'pending' ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : status === 'error' ? (
              <div className="col-span-full text-center text-destructive">Erro ao carregar produtos.</div>
            ) : data?.pages && data.pages.length > 0 && data.pages[0].length > 0 ? (
              data?.pages.map((page) => (
                page.map((product) => (
                  <Link href={`/products/${product.id}`} key={product.id} className="group">
                    <Card className="overflow-hidden hover:shadow-md transition-all duration-200 h-full">
                      <div className="aspect-square bg-backgroundSecondary relative overflow-hidden">
                        {getProductImageUrl(product.banner) ? (
                          <img 
                            src={getProductImageUrl(product.banner)!} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 relative z-10"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : null}
                        <EmptyState
                          variant="image"
                          className="w-full h-full absolute inset-0"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-textPrimary mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">{product.name}</h3>
                        <p className="text-2xl font-bold text-primary mb-2">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 100)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.category.replace(/_/g, ' ')}
                          </Badge>
                          <Badge 
                            variant={product.condition === 'NEW' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {product.condition === 'NEW' ? 'Novo' : product.condition === 'USED' ? 'Usado' : 'Open Box'}
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="p-5 pt-0 flex items-center justify-between relative z-10">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          R$ {(product.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg shadow-primary/30 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 duration-300 hover:scale-110"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem(product);
                          }}
                          title="Adicionar ao carrinho"
                        >
                          <ShoppingBag className="w-5 h-5" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState 
                  variant="products"
                  title="Nenhum produto encontrado"
                  description={
                    (debouncedName || categoryFilter !== 'all' || conditionFilter !== 'all')
                      ? "Não encontramos produtos que correspondam aos seus filtros. Tente ajustar os critérios de busca."
                      : "Ainda não há produtos cadastrados. Seja o primeiro a anunciar!"
                  }
                  action={
                    (debouncedName || categoryFilter !== 'all' || conditionFilter !== 'all') ? {
                      label: 'Limpar Filtros',
                      onClick: () => {
                        setNameFilter('');
                        setCategoryFilter('all');
                        setConditionFilter('all');
                      }
                    } : undefined
                  }
                />
              </div>
            )}
          </div>
          
          {/* Infinite Scroll Trigger */}
          <div ref={ref} className="mt-12 flex justify-center">
            {isFetchingNextPage && (
              <div className="flex gap-2">
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
              </div>
            )}
          </div>
        </div>
      </section>



      {/* Footer with Visits Counter */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-textSecondary">
                © 2026 Colecionaí - Projeto Acadêmico de Estudo
              </p>
              <p className="text-xs text-textMuted mt-1">
                Desenvolvido para aprendizado de Clean Architecture, DDD e boas práticas
              </p>
            </div>
            
          </div>
        </div>
      </footer>
    </main>
  );
}
