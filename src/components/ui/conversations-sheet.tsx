'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2, Package } from 'lucide-react';
import { getUserConversations } from '@/services/messageService';
import { ConversationWithProduct } from '@/types/message';
import { getProductImageUrl } from '@/services/productService';
import { cn } from '@/lib/utils';
import { SellerChatModal } from './seller-chat-modal';

export function ConversationsSheet() {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationWithProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithProduct | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (open) {
      loadConversations();
    }
  }, [open]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await getUserConversations();
      setConversations(data);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConversation = (conversation: ConversationWithProduct) => {
    setSelectedConversation(conversation);
    setShowChatModal(true);
    setOpen(false);
  };

  const getCurrentUserId = (): string | null => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('colecionai.user');
    if (!userData) return null;
    try {
      const user = JSON.parse(userData);
      return user.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <MessageCircle className="h-5 w-5" />
            {conversations.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {conversations.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Conversas</SheetTitle>
            <SheetDescription>
              Suas conversas sobre produtos
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="p-6 rounded-full bg-muted mb-4">
                  <MessageCircle className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma conversa</h3>
                <p className="text-sm text-muted-foreground">
                  Quando você enviar mensagens sobre produtos, elas aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => {
                  const isBuyer = conversation.buyer_id === currentUserId;
                  
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleOpenConversation(conversation)}
                      className="w-full p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 text-left"
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {conversation.product.banner ? (
                          <img
                            src={getProductImageUrl(conversation.product.banner) || ''}
                            alt={conversation.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate mb-1">
                          {conversation.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {isBuyer ? 'Você está interessado' : 'Alguém está interessado'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(conversation.updated_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="text-muted-foreground">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Chat Modal */}
      {selectedConversation && (
        <SellerChatModal
          open={showChatModal}
          onOpenChange={setShowChatModal}
          sellerName="Vendedor" // TODO: Get seller name from conversation
          productName={selectedConversation.product.name}
          productId={selectedConversation.product_id}
          conversationId={selectedConversation.id}
        />
      )}
    </>
  );
}
