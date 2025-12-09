'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Pencil, Plus, DollarSign, Package } from 'lucide-react';
import { DeleteModal } from "@/components/ui/delete-modal";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProducts, deleteProduct, updateProduct, getProductImageUrl } from '@/services/productService';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ProductCategory, ProductCondition } from '@/types';

const productSchema = z.object({
  name: z.string().min(5, 'Nome deve ter pelo menos 5 caracteres'),
  price: z.coerce.number().min(1, 'Preço deve ser maior que zero'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category: z.nativeEnum(ProductCategory),
  condition: z.nativeEnum(ProductCondition),
  image: z.any().optional(), // File object
});

type ProductData = z.infer<typeof productSchema>;

import { useAuth } from '@/hooks/useAuth';

export default function SalesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: userProducts, isLoading } = useQuery({
    queryKey: ['my-products'],
    queryFn: () => getMyProducts(),
    enabled: !!user?.id,
  });

  const { mutateAsync: removeProduct, isPending: isDeleting } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Produto removido com sucesso");
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
    onError: () => {
      toast.error("Erro ao remover produto");
    }
  });

  const handleDelete = async (id: string) => {
    await removeProduct(id);
  };

  // Edit Form
  const form = useForm<ProductData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      // category and condition will be handled by reset or user selection, potentially undefined initially if not strict

    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        price: editingProduct.price / 100, // Convert centavos to BRL for display
        description: editingProduct.description,
        category: editingProduct.category,
        condition: editingProduct.condition,
      });
    }
  }, [editingProduct, form]);

  const { mutateAsync: editProduct, isPending: isEditing } = useMutation({
    mutationFn: (data: ProductData) => updateProduct(editingProduct!.id, {
      ...data,
      price: Math.round(data.price * 100) // Convert BRL to centavos
    }),
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      setIsEditOpen(false);
      setEditingProduct(null);
    },
    onError: () => {
      toast.error("Erro ao atualizar produto");
    }
  });

  const onEditSubmit = async (data: ProductData) => {
    await editProduct(data);
  };

  const totalValue = (userProducts?.reduce((acc, curr) => acc + curr.price, 0) || 0) / 100;
  const totalItems = userProducts?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Vendas</h1>
          <p className="text-muted-foreground">Gerencie seus itens anunciados e acompanhe seus ganhos.</p>
        </div>
        <Link href="/announce">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 w-full sm:w-auto shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <Plus className="w-4 h-4" />
            Novo Anúncio
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Itens
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Skeleton className="h-8 w-16" /> : totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Itens ativos na plataforma
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total Estimado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-8 w-24" /> : `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Soma do valor de todos os anúncios
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Itens à Venda
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-4">
               <Skeleton className="h-16 w-full bg-muted" />
               <Skeleton className="h-16 w-full bg-muted" />
               <Skeleton className="h-16 w-full bg-muted" />
             </div>
          ) : userProducts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="p-6 rounded-full bg-muted/50">
                <Package className="w-12 h-12 text-muted-foreground opacity-50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-foreground">Nenhum item anunciado</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Você ainda não colocou nada à venda. Que tal desapegar de algo da sua coleção?
                </p>
              </div>
              <Link href="/announce">
                <Button variant="outline" className="mt-4 border-primary text-primary hover:bg-primary/10">
                  Criar primeiro anúncio
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
              {userProducts?.map((product) => (
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
                    R$ {(product.price / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="col-span-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        setEditingProduct(product);
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <DeleteModal 
                      onConfirm={() => handleDelete(product.id)}
                      title="Excluir Produto?"
                      description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
                      isDeleting={isDeleting}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Faça alterações no seu anúncio aqui. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-muted/50 border-input focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-muted/50 border-input focus-visible:ring-primary" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="bg-muted/50 border-input focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50 border-input">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ProductCategory).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condição</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/50 border-input">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ProductCondition).map((condition) => (
                            <SelectItem key={condition} value={condition}>
                              {condition === 'NEW' ? 'Novo' : condition === 'USED' ? 'Usado' : 'Open Box'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Alterar Imagem (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="file"
                        accept="image/*"
                        className="bg-muted/50 border-input cursor-pointer file:text-foreground"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="border-input hover:bg-muted">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" loading={isEditing}>
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
