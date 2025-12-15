# Socket.IO Client - Guia de Uso

Este guia mostra como usar o Socket.IO no frontend da aplicação Colecionai.

## 📦 Arquivos Criados

- **`src/lib/socket.ts`**: Configuração principal do Socket.IO
- **`src/hooks/useSocket.ts`**: React hooks para facilitar o uso em componentes

## 🚀 Exemplos de Uso

### 1. Uso Básico com Hook

```tsx
'use client';

import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import { useEffect } from 'react';

export function MyComponent() {
  // Conecta automaticamente ao montar o componente
  const { isConnected, error } = useSocket(true);

  // Escuta evento de notificação
  useSocketEvent('notification', (data) => {
    console.log('Nova notificação:', data);
    // Exibir toast, atualizar UI, etc.
  });

  return (
    <div>
      {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
      {error && <p>Erro: {error}</p>}
    </div>
  );
}
```

### 2. Emitir Eventos

```tsx
'use client';

import { useSocketEmit } from '@/hooks/useSocket';

export function ChatComponent() {
  const emit = useSocketEmit();

  const sendMessage = (message: string) => {
    emit('chat:message', { text: message, timestamp: Date.now() });
  };

  return (
    <button onClick={() => sendMessage('Olá!')}>
      Enviar Mensagem
    </button>
  );
}
```

### 3. Hook Completo (Conexão + Eventos)

```tsx
'use client';

import { useSocketIO } from '@/hooks/useSocket';
import { useEffect } from 'react';

export function AuctionComponent() {
  const { isConnected, emit, on, off } = useSocketIO(true);

  useEffect(() => {
    // Escutar evento de lance
    const handleBid = (data: any) => {
      console.log('Novo lance:', data);
    };

    on('auction:bid', handleBid);

    // Cleanup
    return () => {
      off('auction:bid', handleBid);
    };
  }, [on, off]);

  const placeBid = (amount: number) => {
    emit('auction:place-bid', { amount });
  };

  return (
    <div>
      <p>Status: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      <button onClick={() => placeBid(100)}>
        Dar Lance de R$ 100
      </button>
    </div>
  );
}
```

### 4. Controle Manual de Conexão

```tsx
'use client';

import { useSocket } from '@/hooks/useSocket';

export function SettingsComponent() {
  const { isConnected, connect, disconnect } = useSocket(false); // não conecta automaticamente

  return (
    <div>
      <p>Status: {isConnected ? 'Conectado' : 'Desconectado'}</p>
      <button onClick={connect}>Conectar</button>
      <button onClick={disconnect}>Desconectar</button>
    </div>
  );
}
```

### 5. Uso Direto (sem hooks)

```tsx
'use client';

import { initializeSocket, emitSocketEvent, onSocketEvent } from '@/lib/socket';
import { useEffect } from 'react';

export function DirectUsageComponent() {
  useEffect(() => {
    // Inicializar socket
    const socket = initializeSocket();

    // Escutar evento
    onSocketEvent('custom:event', (data) => {
      console.log('Evento recebido:', data);
    });

    // Emitir evento
    emitSocketEvent('custom:action', { foo: 'bar' });

    // Cleanup não é necessário aqui pois o socket é singleton
  }, []);

  return <div>Componente com uso direto</div>;
}
```

## 🔐 Autenticação

O Socket.IO está configurado para usar **cookies httpOnly** automaticamente através da opção `withCredentials: true`. Isso significa que:

1. O token de autenticação é enviado automaticamente nos cookies
2. Não é necessário passar o token manualmente
3. A autenticação é gerenciada pelo backend

### Se você precisar enviar um token JWT adicional:

Edite o arquivo `src/lib/socket.ts` e modifique a função `getAuthToken()`:

```typescript
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Buscar token do localStorage ou de onde você armazena
  const token = localStorage.getItem('colecionai.token');
  return token;
};
```

## 📡 Eventos Comuns

Aqui estão alguns eventos que você pode usar (dependendo da implementação do backend):

### Eventos do Sistema
- `connect` - Conectado com sucesso
- `disconnect` - Desconectado
- `connect_error` - Erro de conexão
- `reconnect` - Reconectado após falha

### Eventos Personalizados (exemplos)
- `notification` - Notificações em tempo real
- `auction:bid` - Novo lance em leilão
- `auction:end` - Leilão finalizado
- `chat:message` - Nova mensagem de chat
- `product:update` - Atualização de produto

## ⚙️ Configuração

A configuração do Socket.IO está em `src/lib/socket.ts`:

```typescript
const socket = io(SOCKET_URL, {
  path: "/socket.io",
  forceNew: true,
  reconnectionAttempts: 3,  // Tenta reconectar 3 vezes
  timeout: 2000,            // Timeout de 2 segundos
  withCredentials: true,    // Envia cookies httpOnly
});
```

### Variáveis de Ambiente

A URL do socket é baseada na variável de ambiente:

```bash
NEXT_PUBLIC_API_URL=https://colecionai-api.onrender.com
```

Se não definida, usa a URL de produção por padrão.

## 🐛 Debug

Para ver os logs do Socket.IO no console:

```typescript
// Os logs já estão configurados em src/lib/socket.ts
// Você verá mensagens como:
// ✅ Socket conectado com ID: abc123
// ❌ Erro de conexão Socket.IO: Invalid token
// 🔌 Socket desconectado. Razão: transport close
```

## 📝 Notas Importantes

1. **Singleton**: O socket é um singleton, ou seja, apenas uma instância é criada por aplicação
2. **Auto-reconexão**: O socket tenta reconectar automaticamente até 3 vezes
3. **Cleanup**: Ao usar hooks, o cleanup é feito automaticamente ao desmontar o componente
4. **Server-Side**: O Socket.IO não funciona no servidor (SSR), use apenas em componentes client-side (`'use client'`)

## 🔄 Integração com useAuth

Para conectar apenas quando o usuário estiver autenticado:

```tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useEffect } from 'react';

export function AuthenticatedSocketComponent() {
  const { isAuthenticated } = useAuth();
  const { connect, disconnect, isConnected } = useSocket(false);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, connect, disconnect]);

  return (
    <div>
      {isConnected && <p>Conectado ao servidor em tempo real</p>}
    </div>
  );
}
```
