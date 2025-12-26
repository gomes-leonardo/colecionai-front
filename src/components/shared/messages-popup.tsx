'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Send, Search, ChevronLeft, Minimize2, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserConversations, getConversationMessages, sendMessage as sendMessageAPI } from '@/services/messageService';
import { ConversationWithProduct, Message, NewMessageEvent } from '@/types/message';
import { getProductImageUrl } from '@/services/productService';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { playMessageSound, playNotificationSound } from '@/lib/sounds';
import { createOrder } from '@/services/orderService';
import { CheckCircle2 } from 'lucide-react';

interface MessagesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export function MessagesPopup({ isOpen, onClose, onMinimize }: MessagesPopupProps) {
  const [conversations, setConversations] = useState<ConversationWithProduct[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Socket.IO hooks - conectar automaticamente quando popup abre
  const { socket, isConnected, connect } = useSocket(false);

  // Conectar socket quando popup abre
  useEffect(() => {
    if (isOpen && !isConnected) {
      console.log('🔌 MessagesPopup: Conectando ao socket...');
      connect();
    }
  }, [isOpen, isConnected, connect]);

  // Ref para auto-scroll
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations when popup opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  // Load messages when conversation is selected + WebSocket setup
  useEffect(() => {
    if (!selectedConversation || !isConnected) return;

    // 1. HTTP Request: Load initial messages
    loadMessages(selectedConversation);

    // Mark messages as read when opening conversation
    const markAsRead = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'}/conversations/${selectedConversation}/read`, {
          method: 'PATCH',
          credentials: 'include',
        });
        
        if (response.ok) {
          // Atualizar estado local
          setConversations(prev => prev.map(conv => 
            conv.id === selectedConversation 
              ? { ...conv, unread_count: 0 }
              : conv
          ));
        }
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    };
    markAsRead();

    // 2. Socket Emit: Join the conversation room
    if (socket) {
      socket.emit('join_conversation', { conversation_id: selectedConversation });
    }

    // 3. Socket On: Listen for new messages in current conversation
    const handleNewMessage = (newMessage: any) => {
      // Garantir que a mensagem tem a estrutura correta
      const messageData: Message = {
        id: newMessage.id,
        content: newMessage.content,
        created_at: newMessage.created_at,
        sender_id: newMessage.sender_id || newMessage.sender?.id,
        conversation_id: newMessage.conversation_id,
        read_at: newMessage.read_at,
      };

      // Only add if it belongs to current conversation
      if (messageData.conversation_id === selectedConversation) {
        setMessages(prev => {
          // Prevent duplicates
          const exists = prev.some(msg => msg.id === messageData.id);
          if (exists) return prev;
          return [...prev, messageData];
        });

        // Play sound and show notification if it's not our own message
        const currentUserId = getCurrentUserId();
        if (messageData.sender_id !== currentUserId) {
          playMessageSound();
        }

        // Atualizar last_message na lista de conversas
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation
            ? { 
                ...conv, 
                last_message: {
                  id: messageData.id,
                  content: messageData.content,
                  created_at: messageData.created_at,
                  sender_id: messageData.sender_id,
                },
                updated_at: messageData.created_at,
              }
            : conv
        ));
      }
    };

    socket?.on('new_message', handleNewMessage);

    // Cleanup: Leave conversation when unmounting or switching
    return () => {
      socket?.off('new_message', handleNewMessage);
      if (socket) {
        socket.emit('leave_conversation', { conversation_id: selectedConversation });
      }
    };
  }, [selectedConversation, isConnected, socket]);

  // 4. Socket On: Listen for notifications (messages received outside current chat)
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotification = (notification: any) => {
      if (notification.type === 'NEW_MESSAGE') {
        const messageConvId = notification.data?.conversation_id;
        
        // Only show if it's not the current conversation
        if (messageConvId !== selectedConversation) {
          // Play notification sound
          playNotificationSound();
          
          // Show toast with message preview
          const senderName = notification.data?.sender?.name || 'Alguém';
          const productName = notification.data?.product?.name || 'produto';
          const messagePreview = notification.data?.message?.content || notification.message || 'Enviou uma mensagem';
          
          toast.info('Nova mensagem', {
            description: `${senderName}: ${messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview}`,
            action: {
              label: 'Ver',
              onClick: () => {
                setSelectedConversation(messageConvId);
              }
            },
            duration: 5000,
          });
          
          // Reload conversations to update last message and unread count
          loadConversations();
        }
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, isConnected, selectedConversation]);

  // 5. Socket On: Listen for messages read updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessagesReadUpdate = (data: any) => {
      // Update read_at for messages in current conversation
      if (data.conversation_id === selectedConversation) {
        setMessages(prev => 
          prev.map(msg => ({
            ...msg,
            read_at: msg.sender_id !== data.reader_id ? (msg.read_at || new Date().toISOString()) : msg.read_at
          }))
        );
      }
    };

    socket.on('messages_read_update', handleMessagesReadUpdate);

    return () => {
      socket.off('messages_read_update', handleMessagesReadUpdate);
    };
  }, [socket, isConnected, selectedConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getUserConversations();
      
      // Remover duplicatas baseado no ID
      const uniqueConversations = Array.from(
        new Map(data.map(conv => [conv.id, conv])).values()
      );
      
      setConversations(uniqueConversations);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await getConversationMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation || sending) return;

    const messageContent = message.trim();
    setMessage('');
    setSending(true);

    try {
      const sentMessage = await sendMessageAPI({
        content: messageContent,
        conversation_id: selectedConversation,
      });
      
      // Add message optimistically
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === sentMessage.id);
        if (exists) return prev;
        return [...prev, sentMessage];
      });

      // Atualizar last_message na lista de conversas
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation
          ? { 
              ...conv, 
              last_message: {
                id: sentMessage.id,
                content: sentMessage.content,
                created_at: sentMessage.created_at,
                sender_id: sentMessage.sender_id,
              },
              updated_at: sentMessage.created_at,
            }
          : conv
      ));
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error(error.response?.data?.error || 'Erro ao enviar mensagem');
      setMessage(messageContent);
    } finally {
      setSending(false);
    }
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
  const selectedConv = conversations.find(c => c.id === selectedConversation);
  
  // Filtrar conversas por busca
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.product.name.toLowerCase().includes(query) ||
      (conv.buyer?.name?.toLowerCase().includes(query)) ||
      (conv.seller?.name?.toLowerCase().includes(query)) ||
      conv.last_message?.content?.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  // Calcular total de não lidas
  const totalUnread = useMemo(() => {
    return conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);
  }, [conversations]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ 
            type: 'spring',
            stiffness: 400,
            damping: 30
          }}
          className="fixed bottom-4 right-4 w-96 h-[600px] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-border/50 bg-background/50">
            <div className="flex items-center gap-3">
              {selectedConversation && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedConversation(null);
                    setMessages([]);
                  }}
                  className="h-7 w-7 hover:bg-muted/50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">
                    {selectedConversation ? (
                      <>
                        {(() => {
                          const isBuyer = selectedConv?.buyer_id === currentUserId;
                          const otherUser = isBuyer ? selectedConv?.seller : selectedConv?.buyer;
                          return otherUser?.name || 'Usuário';
                        })()}
                      </>
                    ) : 'Mensagens'}
                  </h3>
                  {!selectedConversation && totalUnread > 0 && (
                    <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                      {totalUnread}
                    </span>
                  )}
                </div>
                {!selectedConversation && (
                  <p className="text-xs text-muted-foreground">
                    {conversations.length} conversa{conversations.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onMinimize}
                className="h-7 w-7 hover:bg-muted/50"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7 hover:bg-muted/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Lista de Conversas */}
          {!selectedConversation && (
            <>
              {/* Busca */}
              <div className="px-3 py-2 border-b border-border/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm bg-muted/30 border-0"
                  />
                </div>
              </div>

              {/* Conversas */}
              <ScrollArea className="flex-1">
                <div>
                  {loading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Carregando...
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                    </div>
                  ) : (
                    filteredConversations.map((conv) => {
                      const isBuyer = conv.buyer_id === currentUserId;
                      const otherUser = isBuyer ? conv.seller : conv.buyer;
                      const otherUserName = otherUser?.name || 'Usuário';
                      const myRole = isBuyer ? 'Comprador' : 'Vendedor';
                      const otherRole = isBuyer ? 'Vendedor' : 'Comprador';
                      const unreadCount = conv.unread_count || 0;
                      
                      return (
                        <motion.div
                          key={conv.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => setSelectedConversation(conv.id)}
                          className="px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/20 last:border-0 relative"
                        >
                          {unreadCount > 0 && (
                            <div className="absolute top-2 right-2 h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                              {unreadCount}
                            </div>
                          )}
                          <div className="flex gap-3">
                            {/* Product Photo */}
                            <div className="relative shrink-0">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border/30">
                                {conv.product.banner ? (
                                  <img 
                                    src={getProductImageUrl(conv.product.banner) || ''} 
                                    alt={conv.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                    <svg className="w-6 h-6 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0 pr-8">
                              {/* Product name - DESTACADO como identificador principal */}
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <h4 className="font-semibold text-sm text-foreground truncate">
                                  {conv.product.name}
                                </h4>
                                {conv.last_message && (
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {formatDistanceToNow(new Date(conv.last_message.created_at), { 
                                      addSuffix: true,
                                      locale: ptBR 
                                    })}
                                  </span>
                                )}
                              </div>
                              
                              {/* User name and role badges */}
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs text-muted-foreground truncate">
                                  {otherUserName}
                                </p>
                                <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                                  isBuyer 
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                                    : 'bg-green-500/10 text-green-600 dark:text-green-400'
                                }`}>
                                  {otherRole}
                                </span>
                              </div>
                              
                              {/* Last Message Preview */}
                              <p className={`text-xs truncate ${
                                unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'
                              }`}>
                                {conv.last_message?.content || 'Clique para ver a conversa...'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </>
          )}

          {/* Conversa Individual (Chat Room) */}
          {selectedConversation && selectedConv && (
            <>
              {/* Product Header */}
              <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
                <div className="flex items-center gap-3">
                  {/* Product Photo */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border/30 shrink-0">
                    {selectedConv.product.banner ? (
                      <img 
                        src={getProductImageUrl(selectedConv.product.banner) || ''} 
                        alt={selectedConv.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <svg className="w-5 h-5 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {selectedConv.product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Negociação sobre este produto
                    </p>
                  </div>
                  
                  {/* Finalizar Negócio Button - Only for Seller */}
                  {selectedConv.seller_id === currentUserId && (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-green-600 hover:bg-green-700 shrink-0"
                      disabled={creatingOrder}
                      onClick={async () => {
                        if (!selectedConv.product_id) {
                          toast.error('Produto não encontrado');
                          return;
                        }

                        setCreatingOrder(true);
                        try {
                          const order = await createOrder({
                            product_id: selectedConv.product_id,
                            conversation_id: selectedConversation,
                            final_price: selectedConv.product.price / 100, // Converter de centavos para reais
                          });

                          toast.success('Negócio iniciado! O comprador precisa confirmar.', {
                            description: `Pedido #${order.id.substring(0, 8)} criado com sucesso`,
                          });

                          // Recarregar conversas para atualizar status
                          loadConversations();
                        } catch (error: any) {
                          console.error('Erro ao criar pedido:', error);
                          toast.error(error.response?.data?.error || 'Erro ao fechar negócio');
                        } finally {
                          setCreatingOrder(false);
                        }
                      }}
                    >
                      {creatingOrder ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Fechar Negócio
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4 bg-muted/10">
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      Nenhuma mensagem ainda. Seja o primeiro a enviar!
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender_id === currentUserId;
                      const isRead = msg.read_at !== null;
                      const prevMessage = index > 0 ? messages[index - 1] : null;
                      const showAvatar = !prevMessage || prevMessage.sender_id !== msg.sender_id;
                      const showDate = !prevMessage || 
                        new Date(msg.created_at).toDateString() !== new Date(prevMessage.created_at).toDateString();
                      
                      return (
                        <div key={msg.id}>
                          {/* Date separator */}
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <div className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
                                {new Date(msg.created_at).toLocaleDateString('pt-BR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          )}
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            {/* Avatar */}
                            {showAvatar && !isMe && (
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {selectedConv.seller?.name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            {showAvatar && isMe && <div className="w-8 shrink-0" />}
                            
                            {/* Message bubble */}
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                              <div
                                className={`rounded-2xl px-4 py-2 ${
                                  isMe
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-background border border-border/30 rounded-bl-sm'
                                }`}
                              >
                                <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                  isMe ? 'text-primary-foreground' : 'text-foreground'
                                }`}>
                                  {msg.content}
                                </p>
                                <div className={`flex items-center gap-1.5 justify-end mt-1.5 ${
                                  isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                }`}>
                                  <span className="text-xs">
                                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                  {isMe && (
                                    <span className={`flex items-center justify-center ml-0.5 rounded-full p-0.5 ${
                                      isRead 
                                        ? 'bg-white/20' 
                                        : ''
                                    }`}>
                                      {isRead ? (
                                        // Check duplo azul claro quando lido (estilo WhatsApp)
                                        <CheckCheck 
                                          className="w-4 h-4 text-blue-100" 
                                          strokeWidth={2.5}
                                          fill="currentColor"
                                        />
                                      ) : (
                                        // Check simples branco semi-transparente quando não lido
                                        <Check 
                                          className="w-4 h-4 text-white/70" 
                                          strokeWidth={2.5}
                                        />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })
                  )}
                  {/* Scroll target */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input de mensagem */}
              <div className="p-3 border-t border-border/50 bg-background/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 h-9 text-sm bg-background border-border/30"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && message.trim() && !sending) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sending}
                  />
                  <Button
                    size="icon"
                    disabled={!message.trim() || sending}
                    className="h-9 w-9 shrink-0"
                    onClick={handleSendMessage}
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
