'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { 
  initializeSocket, 
  getSocket, 
  disconnectSocket,
  emitSocketEvent,
  onSocketEvent,
  offSocketEvent
} from '@/lib/socket';

/**
 * Hook para gerenciar a conexão do Socket.IO
 * @param autoConnect - Se true, conecta automaticamente ao montar o componente
 * @returns Socket instance e estado de conexão
 */
export function useSocket(autoConnect: boolean = false) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoConnect) {
      const socketInstance = initializeSocket();
      setSocket(socketInstance);

      // Listeners para atualizar o estado
      socketInstance.on('connect', () => {
        setIsConnected(true);
        setError(null);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (err) => {
        setError(err.message);
        setIsConnected(false);
      });

      // Cleanup ao desmontar
      return () => {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [autoConnect]);

  const connect = useCallback(() => {
    const socketInstance = initializeSocket();
    setSocket(socketInstance);
    
    // Atualiza estado de conexão se já estiver conectado
    if (socketInstance.connected) {
      setIsConnected(true);
    }
    
    // Listeners para atualizar o estado
    socketInstance.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      setError(err.message);
      setIsConnected(false);
    });
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setIsConnected(false);
  }, []);

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
  };
}

/**
 * Hook para escutar eventos do Socket.IO
 * @param event - Nome do evento
 * @param callback - Função callback quando o evento é recebido
 */
export function useSocketEvent(event: string, callback: (...args: any[]) => void) {
  const callbackRef = useRef(callback);

  // Atualiza a ref quando o callback muda
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const socket = getSocket();
    
    if (!socket) {
      console.warn(`⚠️ Socket não inicializado. Não foi possível escutar o evento: ${event}`);
      // Tenta inicializar o socket se não existir
      const newSocket = initializeSocket();
      if (newSocket) {
        console.log(`🔄 Socket inicializado, registrando listener para: ${event}`);
        const eventHandler = (...args: any[]) => {
          callbackRef.current(...args);
        };
        onSocketEvent(event, eventHandler);
      }
      return;
    }

    // Wrapper para usar sempre a versão mais recente do callback
    const eventHandler = (...args: any[]) => {
      callbackRef.current(...args);
    };

    console.log(`📡 Registrando listener para evento: ${event}`);
    onSocketEvent(event, eventHandler);

    // Cleanup: remove o listener ao desmontar
    return () => {
      offSocketEvent(event, eventHandler);
    };
  }, [event]);
}

/**
 * Hook para emitir eventos do Socket.IO
 * @returns Função para emitir eventos
 */
export function useSocketEmit() {
  const emit = useCallback((event: string, data?: any) => {
    emitSocketEvent(event, data);
  }, []);

  return emit;
}

/**
 * Hook completo que combina conexão e eventos
 * Útil para componentes que precisam de funcionalidade completa de Socket.IO
 */
export function useSocketIO(autoConnect: boolean = false) {
  const { socket, isConnected, error, connect, disconnect } = useSocket(autoConnect);
  const emit = useSocketEmit();

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    onSocketEvent(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    offSocketEvent(event, callback);
  }, []);

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}
