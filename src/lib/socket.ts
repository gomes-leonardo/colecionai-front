import { io, Socket } from "socket.io-client";

// Usa a mesma URL base da API, mas para WebSocket
// Em desenvolvimento, usa localhost:3333, em produção usa a URL configurada
const SOCKET_URL = process.env.NODE_ENV === 'development' 
  ? "http://localhost:3333" 
  : (process.env.NEXT_PUBLIC_API_URL || "https://colecionai-api.onrender.com");

// Função para obter o token de autenticação
// Como estamos usando httpOnly cookies, o token será enviado automaticamente
// Mas se você precisar enviar um token JWT adicional via auth, pode fazer assim:
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Se você armazena o token no localStorage (além dos cookies)
  // const token = localStorage.getItem('colecionai.token');
  // return token;
  
  // Por enquanto, retorna null pois estamos usando apenas cookies httpOnly
  return null;
};

// Configuração do socket
let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  // Se já existe uma conexão, retorna ela
  if (socket && socket.connected) {
    return socket;
  }

  const token = getAuthToken();
  
  socket = io(SOCKET_URL, {
    path: "/socket.io",
    forceNew: true,
    reconnectionAttempts: 3,
    timeout: 2000,
    withCredentials: true, // Importante para enviar cookies httpOnly
    auth: token ? { token } : undefined, // Envia token apenas se existir
  });

  // Event listeners
  socket.on("connect", () => {
    console.log("✅ Socket conectado com ID:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Erro de conexão Socket.IO:", err.message);
    
    // Se o erro for de autenticação, você pode tratar aqui
    if (err.message === "Invalid token") {
      console.error("Token inválido. Usuário não autenticado.");
      // Opcional: redirecionar para login ou limpar estado
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket desconectado. Razão:", reason);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log("🔄 Socket reconectado após", attemptNumber, "tentativas");
  });

  socket.on("reconnect_error", (err) => {
    console.error("❌ Erro ao reconectar:", err.message);
  });

  socket.on("reconnect_failed", () => {
    console.error("❌ Falha ao reconectar após todas as tentativas");
  });

  return socket;
};

// Função para obter o socket atual
export const getSocket = (): Socket | null => {
  return socket;
};

// Função para desconectar o socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket desconectado manualmente");
  }
};

// Função para emitir eventos
export const emitSocketEvent = (event: string, data?: any): void => {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn("⚠️ Socket não está conectado. Evento não enviado:", event);
  }
};

// Função para escutar eventos
export const onSocketEvent = (event: string, callback: (...args: any[]) => void): void => {
  if (socket) {
    socket.on(event, callback);
  } else {
    console.warn("⚠️ Socket não inicializado. Não foi possível escutar o evento:", event);
  }
};

// Função para remover listener de evento
export const offSocketEvent = (event: string, callback?: (...args: any[]) => void): void => {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
};
