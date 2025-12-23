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
  // Tipos de notificação:
  // - OUTBID: quando o usuário foi superado por outro lance
  // - OWNER_NEW_BID: quando o dono do produto recebe um novo lance
  // - NEW_MESSAGE: quando o usuário recebe uma nova mensagem
  // IMPORTANTE: O backend envia via io.to(recipient_id).emit("notification", ...)
  useSocketEvent('notification', (data: any) => {
    console.log('📬 Notificação recebida via WebSocket:', data);
    console.log('📬 Tipo da notificação:', data.type);

    // Se for notificação de mensagem, não tratar aqui (MessagesPopup já trata)
    if (data.type === 'NEW_MESSAGE') {
      // O MessagesPopup já trata essas notificações e toca o som
      // Não precisamos fazer nada aqui
      return;
    }

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
    const auctionId = data.data?.auction_id || data.auction_id || '';

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
