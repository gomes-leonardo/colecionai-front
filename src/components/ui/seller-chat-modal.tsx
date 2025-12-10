'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConstructionNotice } from './construction-notice';
import { MessageCircle, Send, Construction } from 'lucide-react';

interface SellerChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerName?: string;
  productName?: string;
}

export function SellerChatModal({
  open,
  onOpenChange,
  sellerName = 'Vendedor',
  productName = 'produto',
}: SellerChatModalProps) {
  const [message, setMessage] = useState('');
  const [showConstructionNotice, setShowConstructionNotice] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Mostrar aviso de construção ao tentar enviar mensagem
      setShowConstructionNotice(true);
      setMessage('');
    }
  };

  return (
    <>
      <ConstructionNotice
        open={showConstructionNotice}
        onOpenChange={setShowConstructionNotice}
        title="Chat em Construção"
        description="O sistema de mensagens está em desenvolvimento e estará disponível em breve. Você poderá conversar diretamente com o vendedor para tirar dúvidas sobre o produto."
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-background border-border sm:max-w-2xl h-[600px] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/10">
                <Construction className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <DialogTitle className="text-xl">Chat com {sellerName}</DialogTitle>
                <DialogDescription className="text-textSecondary">
                  Sobre: {productName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Chat Area - Placeholder */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
            {/* Aviso de construção */}
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
              <div className="p-6 rounded-full bg-primary/10">
                <MessageCircle className="w-12 h-12 text-primary/50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Chat em Desenvolvimento
                </h3>
                <p className="text-sm text-textSecondary max-w-md">
                  O sistema de mensagens está sendo desenvolvido. Em breve você poderá conversar 
                  diretamente com o vendedor para tirar dúvidas sobre este produto.
                </p>
              </div>
              <div className="mt-6 p-4 bg-backgroundSecondary rounded-lg border border-border max-w-md w-full">
                <p className="text-xs text-textSecondary mb-2">Enquanto isso, você pode:</p>
                <ul className="text-xs text-textSecondary space-y-1 text-left list-disc list-inside">
                  <li>Verificar o perfil do vendedor</li>
                  <li>Revisar informações do produto</li>
                  <li>Aguardar o lançamento da funcionalidade</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Input Area - Desabilitado mas visível */}
          <div className="px-6 py-4 border-t border-border bg-background">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem... (em construção)"
                className="flex-1"
                disabled
              />
              <Button
                type="submit"
                variant="primary"
                size="icon"
                disabled
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Funcionalidade em desenvolvimento
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

