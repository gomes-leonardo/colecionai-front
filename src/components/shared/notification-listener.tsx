/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications, NotificationType } from '@/contexts/NotificationContext';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import { toast } from 'sonner';
import { NotificationToast } from '@/components/ui/notification-toast';

/**
 * Componente que escuta eventos de notificação do WebSocket
 * e exibe toasts estilo Apple quando recebe notificações
 */
export function NotificationListener() {
  const { isAuthenticated } = useAuth(false);
  const { addNotification } = useNotifications();
  const { isConnected, connect } = useSocket(false);

  // Conecta ao socket quando autenticado
  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      console.log('🔌 NotificationListener: Conectando ao socket...');
      connect();
    } else if (isAuthenticated && isConnected) {
      console.log('✅ NotificationListener: Socket já está conectado');
    }
  }, [isAuthenticated, isConnected, connect]);

  // Garante que o listener está registrado após a conexão
  useEffect(() => {
    if (isConnected) {
      console.log('✅ NotificationListener: Socket conectado, listener de "notification" será registrado');
    }
  }, [isConnected]);

  // Escuta eventos de notificação do WebSocket
  // O backend envia 'notification' apenas em casos específicos:
  // - OUTBID: quando o usuário foi superado por outro lance
  // - OWNER_NEW_BID: quando o dono do produto recebe um novo lance
  // Não notifica quando o próprio usuário dá um lance (isso seria redundante)
  // IMPORTANTE: O backend envia via io.to(recipient_id).emit("notification", ...)
  // então o usuário precisa estar conectado e na sala correta (feito automaticamente pelo backend)
  useSocketEvent('notification', (data: any) => {
    console.log('📬 Notificação recebida via WebSocket:', data);
    console.log('📬 Tipo da notificação:', data.type);
    console.log('📬 Dados completos:', JSON.stringify(data, null, 2));

    // Determina o tipo de notificação baseado no tipo enviado pelo backend
    let notificationType: NotificationType = 'OUTBID';
    
    if (data.type === 'OWNER_NEW_BID') {
      notificationType = 'OWNER_NEW_BID';
    } else if (data.type === 'OUTBID') {
      notificationType = 'OUTBID';
    } else if (data.type === 'BID') {
      notificationType = 'BID';
    } else if (data.type === 'AUCTION_WON') {
      notificationType = 'AUCTION_WON';
    } else if (data.type === 'AUCTION_ENDED') {
      notificationType = 'AUCTION_ENDED';
    }

    // Extrai o auction_id dos dados
    // IMPORTANTE: O backend precisa incluir auction_id no objeto data quando emite bid:received
    // Exemplo: auctionEvents.emit("bid:received", { ..., auction_id: auction_id })
    const auctionId = data.data?.auction_id || data.auction_id || '';
    
    console.log('📬 Auction ID extraído:', auctionId);
    console.log('📬 Estrutura completa dos dados:', {
      'data.data': data.data,
      'data.auction_id': data.auction_id,
      'data': data
    });
    
    if (!auctionId) {
      console.warn('⚠️ Notificação recebida sem auction_id. O backend precisa incluir auction_id no objeto data.');
    }

    // Adiciona à lista de notificações
    addNotification({
      type: notificationType,
      title: data.title || 'Nova Notificação',
      message: data.message || '',
      auctionId: auctionId,
    });

    // Exibe toast estilo Apple
    toast.custom(
      (t) => (
        <NotificationToast
          type={notificationType}
          title={data.title || 'Nova Notificação'}
          message={data.message || ''}
          onClick={() => {
            toast.dismiss(t);
            // Navegar para o leilão se tiver auction_id
            const auctionId = data.data?.auction_id || data.auction_id || '';
            if (auctionId) {
              window.location.href = `/auctions/${auctionId}`;
            } else {
              console.warn('⚠️ Notificação sem auction_id, não é possível navegar');
            }
          }}
          onClose={() => toast.dismiss(t)}
        />
      ),
      {
        duration: 5000,
      }
    );
  });

  // Nota: O evento 'new_bid' é apenas para atualização da UI em tempo real
  // Não deve criar notificações aqui, pois:
  // - Se o usuário deu o lance, não faz sentido notificar ele mesmo
  // - Se outro usuário deu lance, o backend enviará 'notification' com tipo apropriado:
  //   * OUTBID: se o usuário atual foi superado
  //   * OWNER_NEW_BID: se o usuário atual é dono do produto
  // Portanto, não escutamos 'new_bid' para criar notificações

  return null;
}
