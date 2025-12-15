'use client';

import { useState } from 'react';
import { X, Send, Search, ChevronLeft, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data - Conversas
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    user: 'João Silva',
    avatar: 'JS',
    lastMessage: 'Sim! Aceita R$ 250?',
    timestamp: '10:35',
    unread: 2,
    online: true
  },
  {
    id: '2',
    user: 'Maria Santos',
    avatar: 'MS',
    lastMessage: 'Obrigada! Vou aguardar',
    timestamp: 'Ontem',
    unread: 0,
    online: false
  },
  {
    id: '3',
    user: 'Pedro Costa',
    avatar: 'PC',
    lastMessage: 'Quando pode enviar?',
    timestamp: '2 dias',
    unread: 1,
    online: true
  },
  {
    id: '4',
    user: 'Ana Oliveira',
    avatar: 'AO',
    lastMessage: 'Perfeito! Combinado então',
    timestamp: '3 dias',
    unread: 0,
    online: false
  }
];

// Mock data - Mensagens de uma conversa
const MOCK_MESSAGES = [
  {
    id: '1',
    sender: 'João Silva',
    message: 'Olá! Ainda tem o Funko Pop do Batman disponível?',
    timestamp: '10:30',
    isMe: false
  },
  {
    id: '2',
    sender: 'Você',
    message: 'Sim! Está disponível. Interessado?',
    timestamp: '10:32',
    isMe: true
  },
  {
    id: '3',
    sender: 'João Silva',
    message: 'Sim! Aceita R$ 250?',
    timestamp: '10:35',
    isMe: false
  }
];

interface MessagesPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export function MessagesPopup({ isOpen, onClose, onMinimize }: MessagesPopupProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedUser = MOCK_CONVERSATIONS.find(c => c.id === selectedConversation);
  const totalUnread = MOCK_CONVERSATIONS.reduce((acc, conv) => acc + conv.unread, 0);

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
                  onClick={() => setSelectedConversation(null)}
                  className="h-7 w-7 hover:bg-muted/50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <h3 className="font-semibold text-sm">
                  {selectedConversation ? selectedUser?.user : 'Mensagens'}
                </h3>
                {selectedConversation && selectedUser?.online && (
                  <p className="text-xs text-muted-foreground">Online</p>
                )}
                {!selectedConversation && totalUnread > 0 && (
                  <p className="text-xs text-muted-foreground">{totalUnread} não lidas</p>
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
                  {MOCK_CONVERSATIONS.map((conv, index) => (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedConversation(conv.id)}
                      className="px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/20 last:border-0"
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border border-border/30">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {conv.avatar}
                            </AvatarFallback>
                          </Avatar>
                          {conv.online && (
                            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {conv.user}
                            </h4>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {conv.timestamp}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage}
                            </p>
                            {conv.unread > 0 && (
                              <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center shrink-0">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}

          {/* Conversa Individual */}
          {selectedConversation && (
            <>
              {/* Mensagens */}
              <ScrollArea className="flex-1 p-4 bg-muted/10">
                <div className="space-y-3">
                  {MOCK_MESSAGES.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                          msg.isMe
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-muted border border-border/30 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input de mensagem */}
              <div className="p-3 border-t border-border/50 bg-background/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 h-9 text-sm bg-muted/30 border-border/30"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && message.trim()) {
                        setMessage('');
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    disabled={!message.trim()}
                    className="h-9 w-9 shrink-0"
                  >
                    <Send className="w-4 h-4" />
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
