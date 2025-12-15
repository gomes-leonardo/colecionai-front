'use client';

import React from 'react';
import { Gavel, TrendingUp, Trophy, Clock, X, Package } from 'lucide-react';
import { NotificationType } from '@/contexts/NotificationContext';
import { motion } from 'framer-motion';

interface NotificationToastProps {
  type: NotificationType | 'OWNER_NEW_BID';
  title: string;
  message: string;
  onClick?: () => void;
  onClose?: () => void;
}

const typeConfig = {
  BID: {
    icon: Gavel,
  },
  OUTBID: {
    icon: TrendingUp,
  },
  OWNER_NEW_BID: {
    icon: Gavel,
  },
  AUCTION_WON: {
    icon: Trophy,
  },
  AUCTION_ENDED: {
    icon: Clock,
  },
};

// Função para extrair o nome do produto da mensagem
function extractProductName(message: string): { productName: string; remainingMessage: string } {
  // Padrões possíveis:
  // - "Seu produto [Nome] recebeu um lance de R$ X"
  // - "produto [Nome] recebeu um lance"
  // - "[Nome] recebeu um lance"
  
  // Tenta encontrar "Seu produto [Nome]" seguido de "recebeu"
  let productMatch = message.match(/Seu produto\s+([^recebeu]+?)(?:\s+recebeu)/i);
  
  if (!productMatch) {
    // Tenta encontrar apenas "produto [Nome]" seguido de "recebeu"
    productMatch = message.match(/produto\s+([^recebeu]+?)(?:\s+recebeu)/i);
  }
  
  if (productMatch && productMatch[1]) {
    const productName = productMatch[1].trim();
    // Remove o nome do produto da mensagem original
    const remainingMessage = message.replace(new RegExp(`(?:Seu )?produto\\s+${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i'), '').trim();
    return { productName, remainingMessage };
  }
  
  return { productName: '', remainingMessage: message };
}

export function NotificationToast({ type, title, message, onClick, onClose }: NotificationToastProps) {
  const config = typeConfig[type] || typeConfig.BID;
  const Icon = config.icon;
  const { productName, remainingMessage } = extractProductName(message);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
      transition={{ 
        type: 'spring',
        stiffness: 400,
        damping: 25
      }}
      onClick={onClick}
      className="group relative flex flex-col gap-3 p-4 rounded-3xl bg-background border border-border shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 min-w-[320px] max-w-[400px]"
    >
      {/* Header com ícone e título */}
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>

        {/* Título */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm leading-tight text-foreground">
            {title}
          </h4>
        </div>

        {/* Botão de fechar */}
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-md hover:bg-muted transition-colors shrink-0 opacity-0 group-hover:opacity-100"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Mensagem com destaque para o produto */}
      <div>
        {productName ? (
          <div className="space-y-2">
            {/* Badge com nome do produto */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/20">
              <Package className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {productName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {remainingMessage}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        )}
      </div>
    </motion.div>
  );
}
