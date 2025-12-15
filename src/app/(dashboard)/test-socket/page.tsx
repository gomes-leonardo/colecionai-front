'use client';

import { SocketExample } from '@/components/examples/SocketExample';

export default function TestSocketPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Teste Socket.IO</h1>
          <p className="text-muted-foreground">
            Esta página permite testar a conexão WebSocket em tempo real
          </p>
        </div>

        <SocketExample />

        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Como testar:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Certifique-se de estar logado na aplicação</li>
            <li>Observe o status da conexão (verde = conectado, vermelho = desconectado)</li>
            <li>Abra o console do navegador (F12) para ver os logs detalhados</li>
            <li>Clique em "Enviar Evento de Teste" para emitir um evento ao servidor</li>
            <li>As notificações recebidas do servidor aparecerão na lista abaixo</li>
          </ol>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
            💡 Dica para teste completo
          </h3>
          <p className="text-sm text-muted-foreground">
            Para testar a comunicação bidirecional completa, você precisa que o backend
            esteja configurado para responder aos eventos. Verifique se o servidor Socket.IO
            está rodando em <code className="bg-muted px-1 rounded">http://localhost:3333</code> ou
            na URL de produção.
          </p>
        </div>
      </div>
    </div>
  );
}
