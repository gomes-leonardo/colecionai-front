'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createAuctionSchema, CreateAuctionFormData } from '@/schemas/auctionSchema';
import { createAuction } from '@/services/auctionService';
import { getMyProducts } from '@/services/productService';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gavel, Loader2, AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateAuctionPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAuctionFormData>({
    resolver: zodResolver(createAuctionSchema),
  });

  const selectedProductId = watch('product_id');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getMyProducts();
      setProducts(data);
    } catch (error: any) {
      toast.error('Erro ao carregar produtos', {
        description: error.message || 'Não foi possível carregar seus produtos',
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const onSubmit = async (data: CreateAuctionFormData) => {
    try {
      setSubmitting(true);
      
      // Auto-generate dates: start now, end in 48 hours
      const now = new Date();
      const endDate = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 hours from now
      
      await createAuction({
        ...data,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
      });
      
      toast.success('Leilão criado com sucesso!', {
        description: 'Seu leilão foi criado e já está disponível para lances.',
      });

      router.push('/auctions');
    } catch (error: any) {
      toast.error('Erro ao criar leilão', {
        description: error.message || 'Não foi possível criar o leilão',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
          <Gavel className="w-10 h-10 text-primary" />
          Criar Novo Leilão
        </h1>
        <p className="text-muted-foreground text-lg">
          Configure seu leilão e comece a receber lances
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Leilão</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar seu leilão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product_id">
                Produto <span className="text-destructive">*</span>
              </Label>
              {loadingProducts ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Carregando produtos...
                </div>
              ) : products.length === 0 ? (
                <div className="p-4 border border-amber-500/20 bg-amber-500/10 rounded-lg space-y-3">
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    Todos os seus produtos estão em leilões ativos
                  </p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                    Você não pode criar um novo leilão porque todos os seus produtos já estão em leilões ativos. 
                    Aguarde o término dos leilões atuais ou crie novos produtos para leiloar.
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Link href="/announce" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full border-amber-500/30 hover:bg-amber-500/10">
                        Criar Novo Produto
                      </Button>
                    </Link>
                    <Link href="/auctions" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full border-amber-500/30 hover:bg-amber-500/10">
                        Ver Meus Leilões
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Select
                  value={selectedProductId}
                  onValueChange={(value) => setValue('product_id', value)}
                >
                  <SelectTrigger id="product_id">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - R$ {(product.price / 100).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.product_id && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.product_id.message}
                </p>
              )}
            </div>

            {/* Start Price */}
            <div className="space-y-2">
              <Label htmlFor="start_price">
                Preço Inicial (R$) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start_price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="150.00"
                {...register('start_price', { valueAsNumber: true })}
              />
              {errors.start_price && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.start_price.message}
                </p>
              )}
            </div>

            {/* Auction Duration Info */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Duração do Leilão
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Início:</strong> Imediatamente após criação</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Duração:</strong> 48 horas (2 dias)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">✓</span>
                      <span><strong>Término:</strong> Automático após 48h</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || loadingProducts || products.length === 0}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Criar Leilão
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
