'use client';

import { useEffect, useCallback } from 'react';
import { initializeSocket, getSocket, offSocketEvent } from '@/lib/socket';
import { toast } from 'sonner';
import { Gavel, TrendingUp, Trophy } from 'lucide-react';

interface BidEvent {
  auctionId: string;
  bid: {
    id: string;
    amount: string;
    user: {
      id: string;
      name: string;
    };
  };
}

interface AuctionEndedEvent {
  auctionId: string;
  winnerId?: string;
  winnerName?: string;
  finalAmount?: string;
}

interface UseAuctionSocketOptions {
  auctionId?: string;
  userId?: string;
  onBidUpdate?: (bid: BidEvent) => void;
  onAuctionEnded?: (data: AuctionEndedEvent) => void;
}

/**
 * Custom hook to handle auction-specific WebSocket events
 * 
 * IMPORTANTE: Este hook trata apenas eventos PÚBLICOS de leilão (new_bid, auction:ended)
 * Notificações PRIVADAS (OUTBID, OWNER_NEW_BID) são tratadas pelo NotificationListener
 */
export function useAuctionSocket({
  auctionId,
  userId,
  onBidUpdate,
  onAuctionEnded
}: UseAuctionSocketOptions = {}) {
  
  // Handle new bid event
  const handleNewBid = useCallback((data: BidEvent) => {
    console.log('📢 Novo lance recebido:', data);
    
    // If we're watching a specific auction, only process events for that auction
    if (auctionId && data.auctionId !== auctionId) {
      return;
    }

    // Call custom handler if provided
    if (onBidUpdate) {
      onBidUpdate(data);
    }

    // Show toast notification
    toast.success('Novo lance!', {
      description: `${data.bid.user.name} deu um lance de R$ ${parseFloat(data.bid.amount).toFixed(2)}`,
    });
  }, [auctionId, onBidUpdate]);

  // REMOVIDO: handleOutbid
  // Este evento não existe no backend. O backend emite 'notification' com type: 'OUTBID'
  // que é tratado pelo NotificationListener para evitar duplicação
  // 
  // const handleOutbid = useCallback((data: any) => {
  //   console.log('⚠️ Você foi superado:', data);
  //   ...
  // }, [userId]);

  // Handle auction ended event
  const handleAuctionEnded = useCallback((data: AuctionEndedEvent) => {
    console.log('🏁 Leilão encerrado:', data);
    
    // If we're watching a specific auction, only process events for that auction
    if (auctionId && data.auctionId !== auctionId) {
      return;
    }

    // Call custom handler if provided
    if (onAuctionEnded) {
      onAuctionEnded(data);
    }

    // Show appropriate message based on whether user won
    if (data.winnerId === userId) {
      toast.success('🎉 Você venceu o leilão!', {
        description: data.finalAmount ? `Valor final: R$ ${parseFloat(data.finalAmount).toFixed(2)}` : undefined,
        duration: 10000,
      });
    } else {
      toast.info('Leilão encerrado', {
        description: data.winnerName ? `Vencedor: ${data.winnerName}` : 'O leilão foi finalizado',
      });
    }
  }, [auctionId, userId, onAuctionEnded]);

  useEffect(() => {
    // Initialize socket connection
    const socket = initializeSocket();

    // Subscribe to auction events
    // IMPORTANTE: Backend emite 'new_bid' (não 'bid:new')
    socket.on('new_bid', handleNewBid);
    
    // REMOVIDO: 'bid:outbid' não existe no backend
    // O backend emite 'notification' com type: 'OUTBID'
    // Isso já é tratado pelo NotificationListener
    
    socket.on('auction:ended', handleAuctionEnded);

    // Cleanup on unmount
    return () => {
      const currentSocket = getSocket();
      if (currentSocket) {
        offSocketEvent('new_bid', handleNewBid);
        offSocketEvent('auction:ended', handleAuctionEnded);
      }
    };
  }, [handleNewBid, handleAuctionEnded]);

  return {
    // Expose socket instance if needed
    socket: getSocket(),
  };
}
