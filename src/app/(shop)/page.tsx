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

export default function Home() {
  const { ref, inView } = useInView();
  const { addItem } = useCart();
  
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
      {/* Hero Section */}
      <section className="relative h-[700px] md:h-[800px] flex items-center justify-center overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 animate-gradient"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src="https://videos.pexels.com/video-files/3196068/3196068-hd_1920_1080_25fps.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
          
          {/* Floating orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight drop-shadow-2xl">
              Desapegue ou <br />
              <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
                Complete sua Coleção
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              O marketplace definitivo para colecionadores. De cartas raras a action figures, 
              encontre o que falta na sua estante ou faça dinheiro com o que está parado.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground h-14 px-10 text-lg font-semibold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105">
                Começar Agora
              </Button>
            </Link>
            <Link href="/announce">
              <Button size="lg" variant="outline" className="border-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary h-14 px-10 text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105">
                Anunciar Item
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-gradient-to-b from-background via-card/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-center">
            <span className="text-gradient">Categorias em Destaque</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Explore nossas principais categorias e encontre exatamente o que procura
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Trading Cards', 'Action Figures', 'Comics & Mangás', 'Games Retrô'].map((category, i) => (
              <Card key={i} className="group hover:border-primary/50 transition-all duration-300 cursor-pointer bg-card/80 backdrop-blur-sm border-border hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:via-accent/5 group-hover:to-secondary/5 transition-all duration-500"></div>
                <CardContent className="p-6 flex flex-col items-center justify-center gap-4 relative z-10">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-primary/20">
                    <Package className="w-8 h-8" />
                  </div>
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">{category}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Filters & Recent Arrivals */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          
          {/* Filters */}
          <div className="mb-12 space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Explorar Produtos</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Nome do Produto</label>
                <Input 
                  placeholder="Buscar por nome..." 
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  className="bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Categoria</label>
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
                <label className="text-sm font-medium text-muted-foreground">Condição</label>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {status === 'pending' ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : status === 'error' ? (
              <div className="col-span-full text-center text-destructive">Erro ao carregar produtos.</div>
            ) : (
              data?.pages.map((page) => (
                page.map((product) => (
                  <Link href={`/products/${product.id}`} key={product.id} className="group">
                    <Card className="bg-card/80 backdrop-blur-sm border-border overflow-hidden hover:border-primary/50 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/20 h-full relative">
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-secondary/0 group-hover:from-primary/5 group-hover:via-accent/5 group-hover:to-secondary/5 transition-all duration-500 z-0 pointer-events-none"></div>
                      
                      <div className="aspect-square bg-muted relative overflow-hidden z-10">
                        {getProductImageUrl(product.banner) && (
                          <img 
                            src={getProductImageUrl(product.banner)!} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        )}
                        <div className={`w-full h-full absolute inset-0 flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50 ${getProductImageUrl(product.banner) ? 'hidden' : ''}`}>
                          <ShoppingBag className="w-12 h-12 opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                        </div>
                        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-secondary to-primary text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300 border-none">
                          Novo
                        </Badge>
                        {/* Overlay gradient on image */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardContent className="p-5 relative z-10">
                        <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors duration-300 mb-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">Vendedor #{product.user_id.slice(0, 8)}</p>
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
    </main>
  );
}
