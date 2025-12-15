'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket, useSocketEvent, useSocketEmit } from '@/hooks/useSocket';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Componente de exemplo que demonstra o uso do Socket.IO
 * 
 * Este componente:
 * 1. Conecta ao Socket.IO quando o usuário está autenticado
 * 2. Escuta eventos de notificação
 * 3. Permite enviar eventos de teste
 * 4. Mostra o status da conexão
 */
export function SocketExample() {
  const { isAuthenticated } = useAuth();
  const { isConnected, error, connect, disconnect } = useSocket(false);
  const emit = useSocketEmit();
  
  const [notifications, setNotifications] = useState<string[]>([]);

  // Conecta automaticamente quando autenticado
  useEffect(() => {
    if (isAuthenticated && !isConnected) {
      connect();
    } else if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, isConnected, connect, disconnect]);

  // Escuta eventos de notificação
  useSocketEvent('notification', (data) => {
    console.log('📬 Nova notificação recebida:', data);
    setNotifications(prev => [...prev, JSON.stringify(data)]);
  });

  // Escuta eventos de leilão (exemplo)
  useSocketEvent('auction:bid', (data) => {
    console.log('💰 Novo lance recebido:', data);
    setNotifications(prev => [...prev, `Novo lance: ${JSON.stringify(data)}`]);
  });

  const handleSendTestEvent = () => {
    emit('test:event', { 
      message: 'Teste do frontend', 
      timestamp: new Date().toISOString() 
    });
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">
          Faça login para conectar ao Socket.IO
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Socket.IO Status</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          Erro: {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          onClick={connect} 
          disabled={isConnected}
          variant="outline"
          size="sm"
        >
          Conectar
        </Button>
        <Button 
          onClick={disconnect} 
          disabled={!isConnected}
          variant="outline"
          size="sm"
        >
          Desconectar
        </Button>
        <Button 
          onClick={handleSendTestEvent} 
          disabled={!isConnected}
          size="sm"
        >
          Enviar Evento de Teste
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Notificações Recebidas</h4>
          {notifications.length > 0 && (
            <Button 
              onClick={handleClearNotifications}
              variant="ghost"
              size="sm"
            >
              Limpar
            </Button>
          )}
        </div>
        
        <div className="max-h-60 overflow-y-auto space-y-2">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação recebida ainda
            </p>
          ) : (
            notifications.map((notification, index) => (
              <div 
                key={index}
                className="p-2 bg-muted rounded-md text-sm font-mono"
              >
                {notification}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 border-t text-xs text-muted-foreground">
        <p>💡 Este é um componente de exemplo para testar o Socket.IO</p>
        <p>Abra o console do navegador para ver os logs detalhados</p>
      </div>
    </Card>
  );
}
