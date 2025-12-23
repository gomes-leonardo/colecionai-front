'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Loader2, Check, CheckCheck } from 'lucide-react';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import { sendMessage } from '@/services/messageService';
import { Message, NewMessageEvent } from '@/types/message';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SellerChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerName?: string;
  productName?: string;
  productId?: string;
  conversationId?: string;
  initialMessage?: string; // Mensagem pré-preenchida
}

export function SellerChatModal({
  open,
  onOpenChange,
  sellerName = 'Vendedor',
  productName = 'produto',
  productId,
  conversationId: initialConversationId,
  initialMessage = '',
}: SellerChatModalProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageSound = useRef<HTMLAudioElement | null>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);
  
  const { socket, isConnected, connect } = useSocket(false);

  // Initialize sounds
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Simple notification sounds using Web Audio API
      messageSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjKM0fPTgjMGHm7A7+OZURE');
      notificationSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjKM0fPTgjMGHm7A7+OZURE');
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set initial message when modal opens
  useEffect(() => {
    if (open && initialMessage) {
      setMessage(initialMessage);
    }
  }, [open, initialMessage]);

  // Connect socket when modal opens
  useEffect(() => {
    if (open && !isConnected) {
      connect();
    }
  }, [open, isConnected, connect]);

  // Join conversation when modal opens and socket is connected
  useEffect(() => {
    if (open && isConnected && socket && conversationId) {
      console.log('📨 Entrando na conversa:', conversationId);
      socket.emit('join_conversation', { conversation_id: conversationId });

      // Leave conversation on cleanup
      return () => {
        console.log('📭 Saindo da conversa:', conversationId);
        socket.emit('leave_conversation', { conversation_id: conversationId });
      };
    }
  }, [open, isConnected, socket, conversationId]);

  // Listen for new messages
  useSocketEvent('new_message', (data: NewMessageEvent) => {
    console.log('📬 Nova mensagem recebida:', data);
    
    // Only add message if it's for this conversation
    if (data.conversation_id === conversationId) {
      // Check if message already exists to prevent duplicates
      setMessages((prev) => {
        const exists = prev.some(msg => msg.id === data.id);
        if (exists) return prev;
        
        // Play sound if it's not our own message
        const currentUserId = getCurrentUserId();
        if (data.sender_id !== currentUserId) {
          messageSound.current?.play().catch(() => {});
          
          // Show notification if window is not focused
          if (document.hidden) {
            notificationSound.current?.play().catch(() => {});
            toast.info(`Nova mensagem de ${sellerName}`, {
              description: data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''),
            });
          }
        }
        
        return [...prev, data as Message];
      });
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    if (!productId) {
      toast.error('Erro ao enviar mensagem', {
        description: 'Informações do produto não disponíveis.',
      });
      return;
    }

    setIsSending(true);

    try {
      const payload = {
        content: message.trim(),
        ...(conversationId 
          ? { conversation_id: conversationId }
          : { product_id: productId }
        ),
      };

      const sentMessage = await sendMessage(payload);
      
      // Set conversation ID from first message
      if (!conversationId && sentMessage.conversation_id) {
        setConversationId(sentMessage.conversation_id);
      }

      // DON'T add message to local state - wait for Socket.IO event
      // This prevents duplication
      setMessage('');
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Get current user ID from localStorage
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Chat com {sellerName}</DialogTitle>
              <DialogDescription className="text-textSecondary">
                Sobre: {productName}
              </DialogDescription>
            </div>
          </div>
          {!isConnected && (
            <div className="flex items-center gap-2 text-xs text-amber-600 mt-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Conectando...
            </div>
          )}
        </DialogHeader>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
              <div className="p-6 rounded-full bg-primary/10">
                <MessageCircle className="w-12 h-12 text-primary/50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Inicie a conversa
                </h3>
                <p className="text-sm text-textSecondary max-w-md">
                  Envie uma mensagem para {sellerName} sobre {productName}.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwnMessage = msg.sender_id === currentUserId;
                const isRead = msg.read_at !== null;
                
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2',
                        isOwnMessage
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <p className={cn(
                          "text-xs",
                          isOwnMessage ? "text-white/70" : "opacity-70"
                        )}>
                          {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {isOwnMessage && (
                          <span className="text-white/70">
                            {isRead ? (
                              <CheckCheck className="w-3 h-3 text-blue-400" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-border bg-background">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1"
              disabled={isSending || !isConnected}
            />
            <Button
              type="submit"
              variant="primary"
              size="icon"
              disabled={isSending || !message.trim() || !isConnected}
              className="shrink-0"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          {!isConnected && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              Aguardando conexão...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
