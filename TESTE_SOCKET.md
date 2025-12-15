# 🧪 Guia Rápido de Teste - Socket.IO

## Passo a Passo para Testar

### 1️⃣ Acesse a página de teste

Com o servidor de desenvolvimento rodando (`npm run dev`), acesse:

```
http://localhost:3000/test-socket
```

### 2️⃣ Faça login

- Se não estiver logado, faça login na aplicação
- A conexão Socket.IO só funciona para usuários autenticados

### 3️⃣ Observe a conexão

Na página de teste, você verá:
- 🟢 **Verde** = Conectado ao servidor Socket.IO
- 🔴 **Vermelho** = Desconectado

### 4️⃣ Abra o Console do Navegador

Pressione **F12** ou **Cmd+Option+I** (Mac) para abrir o DevTools e vá na aba **Console**.

Você verá logs como:
```
✅ Socket conectado com ID: abc123xyz
```

### 5️⃣ Teste enviar eventos

Clique no botão **"Enviar Evento de Teste"** e observe:
- O evento sendo enviado no console
- Se o backend responder, você verá notificações aparecendo na lista

### 6️⃣ Teste desconexão/reconexão

Use os botões:
- **Conectar** - Inicia a conexão
- **Desconectar** - Fecha a conexão
- Observe os logs no console

## 🔍 O que verificar no Console

### ✅ Conexão bem-sucedida:
```
✅ Socket conectado com ID: abc123xyz
```

### ❌ Erro de conexão:
```
❌ Erro de conexão Socket.IO: <mensagem>
```

Possíveis causas:
- Backend não está rodando em `http://localhost:3333`
- CORS não configurado no backend
- Socket.IO não configurado no backend

### 🔄 Reconexão:
```
🔌 Socket desconectado. Razão: transport close
🔄 Socket reconectado após 1 tentativas
```

## 🛠️ Testando com o Backend

### Opção 1: Backend Local

Se você tem o backend rodando localmente:

1. Certifique-se que o backend está rodando em `http://localhost:3333`
2. Verifique se o Socket.IO está configurado no backend
3. A conexão deve funcionar automaticamente

### Opção 2: Backend em Produção

Se quiser testar com o backend em produção:

1. Edite `src/lib/socket.ts` e comente a linha de desenvolvimento:
```typescript
const SOCKET_URL = "https://colecionai-api.onrender.com";
```

2. Ou defina a variável de ambiente:
```bash
NEXT_PUBLIC_API_URL=https://colecionai-api.onrender.com
```

## 📡 Eventos para Testar

Você pode testar diferentes eventos modificando o componente ou usando o console:

### No Console do Navegador:
```javascript
// Obter o socket
const { getSocket, emitSocketEvent } = await import('/src/lib/socket.ts');

// Emitir evento customizado
emitSocketEvent('meu-evento', { mensagem: 'teste' });
```

## 🐛 Troubleshooting

### Problema: "Socket não está conectado"
**Solução:** 
- Verifique se você está logado
- Verifique se o backend está rodando
- Veja os erros no console

### Problema: "connect_error"
**Solução:**
- Verifique a URL do backend
- Confirme que o Socket.IO está configurado no backend
- Verifique configurações de CORS

### Problema: Não recebe eventos do backend
**Solução:**
- Confirme que o backend está emitindo eventos
- Verifique o nome do evento (deve ser exatamente igual)
- Use `socket.onAny((event, ...args) => console.log(event, args))` para ver todos os eventos

## 📝 Próximos Passos

Depois de confirmar que a conexão funciona:

1. **Integre em componentes reais**: Use os hooks em componentes de leilão, chat, notificações, etc.
2. **Configure eventos do backend**: Defina quais eventos o backend vai emitir
3. **Implemente handlers**: Crie funções para tratar cada tipo de evento recebido

## 💡 Dica Extra

Para ver TODOS os eventos que o socket recebe, adicione no console:

```javascript
const socket = getSocket();
socket.onAny((event, ...args) => {
  console.log('📨 Evento recebido:', event, args);
});
```
