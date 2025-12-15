'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign, Package, Upload as UploadIcon, Image as ImageIcon, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { useMutation } from '@tanstack/react-query';
import { createProduct } from '@/services/productService';
import { ProductCategory, ProductCondition } from '@/types';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysisMode } from '@/contexts/AnalysisModeContext';
import { ConstructionNotice } from '@/components/ui/construction-notice';
import { Info } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(5, 'Nome deve ter pelo menos 5 caracteres'),
  price: z.coerce.number().min(1, 'Preço deve ser maior que zero'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  category: z.string().min(1, 'Selecione uma categoria'),
  condition: z.string().min(1, 'Selecione a condição'),
  image: z.string().optional(),
});

export type ProductData = z.infer<typeof productSchema>;

export default function AnnouncePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { enabled: analysisModeEnabled } = useAnalysisMode();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<ProductData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      category: '',
      condition: '',
      image: '',
    },
    mode: 'onChange',
  });

  const watchedValues = form.watch();

  const { mutateAsync: createItem, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Anúncio criado com sucesso!", {
        description: "Seu item já está disponível no marketplace.",
        className: "bg-emerald-600 text-white border-none"
      });
      router.push('/');
    },
    onError: (error: any) => {
      console.error(error);
      const errorMessage = error?.message || "Tente novamente mais tarde.";
      toast.error("Erro ao criar anúncio", {
        description: errorMessage,
      });
    },
  });

  async function onSubmit(data: ProductData) {
    if (analysisModeEnabled) {
      toast.error("Não é possível criar produtos durante o modo análise.", {
        description: "Complete o tour técnico primeiro.",
      });
      return;
    }

    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para anunciar.");
      router.push('/login');
      return;
    }
    
    await createItem({
      name: data.name,
      price: Math.round(data.price * 100), // Convert to centavos
      description: data.description,
      category: data.category as ProductCategory,
      condition: data.condition as ProductCondition,
      image: imageFile || undefined
    });
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/auth-bg.png')] bg-cover bg-center opacity-10 fixed" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background fixed" />

      <div className="container relative z-10 py-12 max-w-7xl mx-auto">
        {analysisModeEnabled && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    Modo Análise Ativo
                  </h3>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">
                    Durante o modo análise, você não pode criar ou modificar produtos. Complete o tour técnico primeiro.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Form */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <div>
              <h1 className="text-4xl font-bold mb-2">Novo Anúncio</h1>
              <p className="text-muted-foreground">Preencha os detalhes para vender seu item.</p>
            </div>

            <Card className="bg-card/50 backdrop-blur-xl border-white/10 shadow-2xl">
              <CardContent className="p-6 lg:p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label>Fotos do Item</Label>
                      <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300 cursor-pointer bg-black/20 group hover:bg-black/30 relative overflow-hidden">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        />
                        {previewImage ? (
                          <img 
                            src={previewImage} 
                            alt="Preview" 
                            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity z-0"
                          />
                        ) : null}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="p-4 rounded-full bg-white/5 group-hover:bg-primary/20 transition-colors mb-4 backdrop-blur-sm">
                            <UploadIcon className="w-8 h-8" />
                          </div>
                          <p className="font-medium">Clique ou arraste para enviar</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">JPG, PNG ou WEBP (Max 5MB)</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Nome do Item</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Nintendo 64 Completo" {...field} className="bg-black/20 border-white/10" />
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
                            <FormLabel>Preço (R$)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="number" placeholder="0,00" {...field} className="pl-9 bg-black/20 border-white/10" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-black/20 border-white/10">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={ProductCategory.RETRO_GAMES}>Games Retrô</SelectItem>
                                <SelectItem value={ProductCategory.COMIC_BOOKS}>HQs e Mangás</SelectItem>
                                <SelectItem value={ProductCategory.ACTION_FIGURES}>Action Figures</SelectItem>
                                <SelectItem value={ProductCategory.FUNKO_POP}>Funko Pop</SelectItem>
                                <SelectItem value={ProductCategory.COLLECTIBLE_STATUES}>Estátuas</SelectItem>
                                <SelectItem value={ProductCategory.TRADING_CARDS}>Cartas (TCG)</SelectItem>
                                <SelectItem value={ProductCategory.MOVIES_TV_COLLECTIBLES}>Filmes & TV</SelectItem>
                                <SelectItem value={ProductCategory.ANIME_COLLECTIBLES}>Anime</SelectItem>
                                <SelectItem value={ProductCategory.MINIATURES}>Miniaturas</SelectItem>
                                <SelectItem value={ProductCategory.MODEL_KITS}>Model Kits</SelectItem>
                                <SelectItem value={ProductCategory.ART_BOOKS}>Art Books</SelectItem>
                                <SelectItem value={ProductCategory.RARE_COLLECTIBLES}>Raridades</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condição</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-black/20 border-white/10">
                                <SelectValue placeholder="Selecione a condição" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ProductCondition.NEW}>Novo / Lacrado</SelectItem>
                              <SelectItem value={ProductCondition.USED}>Usado</SelectItem>
                              <SelectItem value={ProductCondition.OPEN_BOX}>Open Box</SelectItem>
                            </SelectContent>
                          </Select>
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
                            <Textarea 
                              placeholder="Conte a história desse item, detalhes de conservação, etc." 
                              className="min-h-[120px] bg-black/20 border-white/10 resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" 
                      loading={isPending}
                      disabled={analysisModeEnabled}
                    >
                      {analysisModeEnabled ? 'Indisponível no Modo Análise' : 'Publicar Anúncio'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:sticky lg:top-24 space-y-6 animate-in fade-in slide-in-from-right duration-700 delay-200">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Eye className="w-5 h-5" />
              <span>Pré-visualização ao vivo</span>
            </div>

            <Card className="bg-card border-border overflow-hidden shadow-2xl ring-1 ring-white/10 transform transition-all hover:scale-[1.02] duration-500">
              <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-8 opacity-50">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">A imagem aparecerá aqui</p>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black/60 backdrop-blur-md hover:bg-black/70 border-none text-white">
                    {watchedValues.condition === 'new' ? 'Novo' : 'Usado'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
                      {watchedValues.category === 'games' ? 'Games' : 
                       watchedValues.category === 'comics' ? 'HQs' : 
                       watchedValues.category === 'collectibles' ? 'Colecionáveis' : 'Categoria'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Há 1 min</span>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight text-foreground">
                    {watchedValues.name || "Nome do Produto"}
                  </h3>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Preço Atual</p>
                    <p className="text-3xl font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(watchedValues.price) || 0)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {watchedValues.description || "A descrição do seu item aparecerá aqui. Capriche nos detalhes para atrair mais compradores!"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-400">
              <p className="font-semibold mb-1">Dica de Vendedor</p>
              <p>Fotos bem iluminadas e descrições detalhadas aumentam em 40% as chances de venda rápida.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
