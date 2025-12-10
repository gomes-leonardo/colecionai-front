'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, ArrowRight, CreditCard, Plus, Minus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { ProductCondition } from '@/types';

const conditionLabels: Record<ProductCondition, string> = {
  NEW: 'Novo',
  USED: 'Usado',
  OPEN_BOX: 'Open Box',
};

export function CartSheet() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Seu carrinho está vazio');
      return;
    }
    
    toast.success("Redirecionando para o pagamento...", {
      description: "Integração com gateway em breve.",
    });
    setIsOpen(false);
  };

  // Expor função para abrir carrinho programaticamente (para modo análise)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).openCart = () => setIsOpen(true);
      (window as any).closeCart = () => setIsOpen(false);
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).openCart;
        delete (window as any).closeCart;
      }
    };
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-cart-trigger>
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse-subtle px-1">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-background border-border flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="text-xl font-semibold text-textPrimary flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Seu Carrinho
          </SheetTitle>
        </SheetHeader>

        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {items.map((item) => {
                  const priceInReais = item.price / 100;
                  return (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-backgroundSecondary flex-shrink-0">
                        {item.banner ? (
                          <Image 
                            src={item.banner.startsWith('http') ? item.banner : `https://colecionai-api.onrender.com/files/${item.banner}`}
                            alt={item.name} 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-backgroundSecondary flex items-center justify-center text-textMuted">
                            <ShoppingCart className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <h4 className="font-medium text-textPrimary line-clamp-2">{item.name}</h4>
                          <p className="text-xs text-textSecondary mt-1">
                            {conditionLabels[item.condition as ProductCondition] || item.condition}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-3 gap-2">
                          <div className="flex items-center gap-2 bg-backgroundSecondary rounded-lg border border-border">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 hover:bg-backgroundHover transition-colors rounded-l-lg"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3 text-textSecondary" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium text-textPrimary min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 hover:bg-backgroundHover transition-colors rounded-r-lg"
                            >
                              <Plus className="w-3 h-3 text-textSecondary" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary text-sm">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceInReais * item.quantity)}
                            </span>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-textMuted hover:text-destructive transition-colors p-1.5 hover:bg-destructive/10 rounded"
                              title="Remover item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-6 bg-backgroundSecondary border-t border-border space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-textSecondary">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-textSecondary">
                  <span>Frete</span>
                  <span className="text-success">Grátis</span>
                </div>
                <Separator className="bg-border my-2" />
                <div className="flex justify-between text-lg font-semibold text-textPrimary">
                  <span>Total</span>
                  <span className="text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                </div>
              </div>

              <Button 
                variant="primary"
                className="w-full h-11"
                onClick={handleCheckout}
              >
                Finalizar Compra <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <div className="flex justify-center gap-4 text-textMuted">
                <CreditCard className="w-5 h-5 opacity-50" />
                {/* Add more payment icons if needed */}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-backgroundSecondary flex items-center justify-center mb-2">
              <ShoppingCart className="w-8 h-8 text-textMuted" />
            </div>
            <h3 className="text-lg font-medium text-textPrimary">Seu carrinho está vazio</h3>
            <p className="text-textSecondary max-w-xs">
              Explore nossa seleção de itens raros e encontre algo especial para você.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsOpen(false)}
            >
              Começar a Garimpar
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
