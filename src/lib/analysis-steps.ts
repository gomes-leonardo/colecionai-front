import { AnalysisStep } from '@/types/analysis';

export const analysisSteps: AnalysisStep[] = [
  // Passo 1 - Introdução (Landing)
  {
    id: 'intro-landing',
    route: '/',
    title: 'Bem-vindo ao Modo Análise',
    subtitle: 'Passo 1 de 25',
    description: `O Colecionaí é um marketplace acadêmico de itens colecionáveis. No modo análise, você vai percorrer telas como login e cadastro, entendendo quais validações existem, quais endpoints são chamados e como as regras de negócio foram implementadas.

Este projeto foi desenvolvido com foco em demonstrar boas práticas de engenharia de software, arquitetura limpa e tecnologias modernas.`,
    technicalNotes: `**Stack Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

**Stack Backend:**
- Node.js + Express
- Prisma ORM
- PostgreSQL
- Redis (Cache de produtos)
- BullMQ (Filas assíncronas)
- Docker

**Arquitetura:**
- Clean Architecture
- Domain-Driven Design (DDD)
- Dependency Injection
- CI/CD com GitHub Actions

**Uso de Redis:**
- Cache de listagem de produtos
- Reduz carga no banco de dados
- TTL configurável por endpoint

**Uso de BullMQ:**
- Envio de emails de boas-vindas
- Envio de emails de recuperação de senha
- Processamento assíncrono em workers separados`,
  },

  // Passo 2 - Navegação para Login
  {
    id: 'navigate-login',
    route: '/login',
    title: 'Tela de Login',
    subtitle: 'Passo 2 de 25',
    description: `Agora vamos explorar o fluxo de autenticação. Esta tela permite que usuários existentes façam login no sistema usando email e senha.

O processo de autenticação é stateless, utilizando JWT (JSON Web Tokens) para manter a sessão do usuário de forma segura.`,
    technicalNotes: `**Endpoint:**
- POST /sessions

**Fluxo:**
1. Usuário preenche email e senha
2. Frontend valida formato dos dados
3. Envia requisição para API
4. Backend valida credenciais
5. Retorna JWT token + dados do usuário
6. Token é armazenado em cookies httpOnly com credentials
7. Redirecionamento para dashboard`,
  },

  // Passo 3 - Campo Email (Login)
  {
    id: 'login-email-field',
    route: '/login',
    title: 'Campo de Email',
    subtitle: 'Passo 3 de 25',
    description: `Este campo recebe o endereço de email do usuário. É validado no frontend para garantir formato correto antes de enviar para o servidor.

A validação acontece em tempo real usando Zod, uma biblioteca de validação de schemas TypeScript.`,
    highlightSelector: 'input[name="email"]',
    technicalNotes: `**Validação Frontend:**
- Formato: regex de email (RFC 5322)
- Schema: Zod emailSchema
- Mensagem de erro: "Digite um email válido"
- Validação em tempo real (onChange)

**Validação Backend:**
- Verifica se email existe no banco de dados
- Case-insensitive (convertido para lowercase)
- Retorna erro 401 se não encontrado`,
  },

  // Passo 4 - Campo Senha (Login)
  {
    id: 'login-password-field',
    route: '/login',
    title: 'Campo de Senha',
    subtitle: 'Passo 4 de 25',
    description: `Campo para inserir a senha do usuário. A senha é enviada de forma segura via HTTPS e nunca é armazenada em texto plano no backend.

O sistema usa bcrypt para hash de senhas, garantindo que mesmo em caso de vazamento de dados, as senhas permaneçam protegidas.`,
    highlightSelector: 'input[type="password"]',
    technicalNotes: `**Validação Frontend:**
- Mínimo: 6 caracteres
- Sem validação de complexidade no login
- Campo obrigatório

**Segurança Backend:**
- Hash: bcrypt (cost factor 10)
- Comparação segura com hash armazenado
- Rate limiting: máx 5 tentativas/minuto
- Retorna erro genérico para evitar enumeration`,
  },

  // Passo 5 - Botão Login
  {
    id: 'login-submit',
    route: '/login',
    title: 'Autenticação',
    subtitle: 'Passo 5 de 25',
    description: `Ao clicar em "Entrar", os dados são enviados para o backend que valida as credenciais e retorna um token JWT se tudo estiver correto.

O token JWT contém informações do usuário codificadas e assinadas, permitindo autenticação stateless em requisições futuras. O token é armazenado em cookies httpOnly com credentials para maior segurança.`,
    highlightSelector: 'button[type="submit"]',
    technicalNotes: `**Request:**
\`\`\`json
POST /sessions
{
  "email": "usuario@example.com",
  "password": "senha123"
}
\`\`\`

**Response (Sucesso):**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Nome do Usuário",
    "email": "usuario@example.com"
  }
}
\`\`\`

**Erros Possíveis:**
- 400: Dados inválidos
- 401: Credenciais incorretas
- 403: Email não verificado`,
  },

  // Passo 6 - Navegação para Cadastro
  {
    id: 'navigate-register',
    route: '/register',
    title: 'Tela de Cadastro',
    subtitle: 'Passo 6 de 25',
    description: `Esta tela permite que novos usuários criem uma conta no sistema. O processo de cadastro inclui validações rigorosas e envio de email de verificação.

Após o cadastro, o usuário precisa verificar seu email antes de poder fazer login.`,
    technicalNotes: `**Endpoint:**
- POST /users

**Fluxo:**
1. Usuário preenche dados (nome, email, senha)
2. Frontend valida todos os campos
3. Envia requisição para API
4. Backend cria usuário no banco
5. Gera token de verificação
6. Envia email com link de verificação
7. Redireciona para tela de verificação`,
  },

  // Passo 7 - Campo Nome (Cadastro)
  {
    id: 'register-name-field',
    route: '/register',
    title: 'Campo de Nome',
    subtitle: 'Passo 7 de 25',
    description: `O nome do usuário é usado para personalização da experiência e identificação no sistema.

Este campo aceita nomes completos e é armazenado exatamente como digitado (preservando capitalização).`,
    highlightSelector: 'input[name="name"]',
    technicalNotes: `**Validação Frontend:**
- Mínimo: 3 caracteres
- Máximo: 100 caracteres
- Permite letras, espaços e acentos
- Campo obrigatório

**Validação Backend:**
- Trim de espaços extras
- Sanitização contra XSS
- Armazenado como VARCHAR(100)`,
  },

  // Passo 8 - Campo Email (Cadastro)
  {
    id: 'register-email-field',
    route: '/register',
    title: 'Campo de Email (Cadastro)',
    subtitle: 'Passo 8 de 25',
    description: `O email é usado como identificador único do usuário no sistema. Deve ser um endereço válido pois será enviado um link de verificação.

O sistema garante que cada email só pode ser cadastrado uma vez.`,
    highlightSelector: 'input[name="email"]',
    technicalNotes: `**Validação Frontend:**
- Formato de email válido
- Normalização: lowercase
- Campo obrigatório

**Validação Backend:**
- Unicidade: verifica se email já existe
- Normalização: lowercase + trim
- Gera token de verificação (UUID)
- Envia email via BullMQ (fila assíncrona)

**Email de Verificação:**
- Template HTML responsivo
- Link expira em 24 horas
- Processado em background worker

**BullMQ (Fila de Emails):**
- Job: 'send-verification-email'
- Worker separado processa a fila
- Retry automático em caso de falha
- Dead letter queue para erros persistentes

**Redis:**
- Armazena jobs da fila
- Persiste estado dos workers
- Permite escalabilidade horizontal`,
  },

  // Passo 9 - Campos Senha (Cadastro)
  {
    id: 'register-password-fields',
    route: '/register',
    title: 'Campos de Senha',
    subtitle: 'Passo 9 de 25',
    description: `O usuário deve criar uma senha e confirmá-la para evitar erros de digitação. A senha é validada quanto à força e complexidade.

As senhas são sempre hasheadas antes de serem armazenadas no banco de dados.`,
    highlightSelector: 'input[type="password"]',
    technicalNotes: `**Validação Frontend:**
- Mínimo: 6 caracteres
- Confirmação: senhas devem coincidir
- Feedback visual de força da senha

**Validação Backend:**
- Mínimo: 6 caracteres
- Hash: bcrypt (cost 10)
- Nunca armazenada em texto plano
- Nunca retornada em responses

**Segurança:**
- Salt único por senha
- Impossível reverter hash para senha original
- Comparação segura usando bcrypt.compare()`,
  },

  // Passo 10 - Verificação de Email
  {
    id: 'email-verification',
    route: '/verify',
    title: 'Verificação de Email',
    subtitle: 'Passo 10 de 25',
    description: `Após o cadastro, o usuário recebe um email com um código de verificação. Esta etapa garante que o email fornecido é válido e pertence ao usuário.

A verificação é obrigatória antes de poder fazer login no sistema.`,
    technicalNotes: `**Endpoint:**
- POST /users/verify

**Payload:**
\`\`\`json
{
  "email": "usuario@example.com",
  "token": "codigo-6-digitos"
}
\`\`\`

**Fluxo:**
1. Usuário recebe email com código
2. Insere código na tela de verificação
3. Backend valida código e email
4. Marca email como verificado
5. Permite login do usuário

**Segurança:**
- Código expira em 24h
- Máximo 3 tentativas
- Pode reenviar código (rate limited)`,
    // Sem highlightSelector para destacar o componente todo
    hudSide: 'right', // HUD na direita
  },

  // Passo 10.5 - Recuperação de Senha (Esqueci minha senha)
  {
    id: 'forgot-password',
    route: '/forgot-password',
    title: 'Recuperação de Senha',
    subtitle: 'Passo 11 de 25',
    description: `Sistema de recuperação de senha permite que usuários redefinam suas senhas através de um link enviado por email.

O processo utiliza BullMQ para processar o envio de emails de forma assíncrona, garantindo que a requisição não trave aguardando o envio.`,
    highlightSelector: 'form',
    technicalNotes: `**Endpoint:**
- POST /auth/forgot-password

**Payload:**
\`\`\`json
{
  "email": "usuario@example.com"
}
\`\`\`

**Fluxo com BullMQ:**
1. Usuário informa email na tela de recuperação
2. Frontend envia requisição para API
3. Backend valida se email existe
4. Gera token de recuperação (UUID, expira em 1h)
5. **Cria job na fila BullMQ** para envio de email
6. Retorna resposta imediata ao usuário (não aguarda envio)
7. Worker do BullMQ processa job em background
8. Email é enviado com link de recuperação
9. Usuário clica no link e redefine senha

**BullMQ (Fila de Emails):**
- **Job:** \`send-password-reset-email\`
- **Worker separado** processa a fila assincronamente
- **Retry automático:** 3 tentativas com backoff exponencial
- **Dead letter queue:** Jobs que falharam após todas as tentativas
- **Redis:** Armazena jobs e estado dos workers

**Vantagens do Processamento Assíncrono:**
- Resposta rápida ao usuário (não bloqueia aguardando SMTP)
- Escalabilidade: múltiplos workers podem processar jobs
- Confiabilidade: retry automático em caso de falha
- Monitoramento: pode verificar status dos jobs na fila

**Token de Recuperação:**
- UUID único por solicitação
- Expira em 1 hora
- Armazenado no banco com hash
- Link: \`/reset-password?token={uuid}\`

**Segurança:**
- Rate limiting: máximo 3 solicitações por hora por email
- Token único e não reutilizável
- Validação de email antes de criar token
- Link expira após uso ou tempo limite`,
  },

  // Passo 12 - Auto-login para Modo Análise
  {
    id: 'analysis-auto-login',
    route: '/login',
    title: 'Autenticação Automática',
    subtitle: 'Passo 12 de 25',
    description: `Para explorar as áreas protegidas do sistema (como o dashboard), vamos fazer login automaticamente com credenciais de demonstração.

Isso permite que você veja as funcionalidades completas sem precisar criar uma conta real.`,
    technicalNotes: `**Credenciais de Demonstração:**
- Email: analise@email.com
- Senha: Analise@123

**Processo:**
1. Sistema detecta que precisa de autenticação
2. Faz login automático com credenciais de teste
3. Armazena token JWT em cookies httpOnly com credentials
4. Redireciona para dashboard

**Nota:** Você precisará criar este usuário no backend antes de usar o modo análise.`,
    autoLogin: true,
  },

  // Passo 13 - Dashboard Overview
  {
    id: 'dashboard-overview',
    route: '/dashboard',
    title: 'Dashboard do Usuário',
    subtitle: 'Passo 13 de 25',
    description: `Após autenticado, o usuário acessa o dashboard onde pode gerenciar seus anúncios, ver estatísticas e acessar configurações.

O dashboard é uma área protegida que requer autenticação válida (token JWT armazenado em cookies httpOnly).`,
    technicalNotes: `**Proteção de Rota:**
- Middleware verifica JWT token dos cookies
- Redireciona para /login se não autenticado
- Busca dados do usuário via GET /me

**Funcionalidades:**
- Meus Anúncios (CRUD de produtos)
- Minhas Vendas
- Minhas Compras
- Coleções
- Configurações de perfil

**Autorização:**
- Usuário só pode editar seus próprios anúncios
- Verificações no backend por user_id`,
  },

  // Passo 13 - Criar Anúncio
  {
    id: 'create-product',
    route: '/announce',
    title: 'Criar Anúncio de Produto',
    subtitle: 'Passo 14 de 25',
    description: `Usuários autenticados podem criar anúncios de produtos colecionáveis para venda ou leilão.

O formulário de criação inclui validações rigorosas e upload de imagens usando Multer no backend.`,
    technicalNotes: `**Endpoint:**
- POST /products

**Campos:**
- Título (3-100 caracteres)
- Descrição (10-1000 caracteres)
- Preço (decimal, mínimo 0.01)
- Categoria (enum)
- Condição (novo, usado, etc.)
- Imagem (1 imagem, max 5MB)

**Upload de Imagens:**
- Multer middleware no backend
- Validação de tipo (JPEG, PNG, WebP)
- Resize automático (800x800px)
- Armazenamento local em /uploads (desenvolvimento)
- **Nota:** Upload de múltiplas imagens e integração com S3/AWS não foram implementados em produção devido aos custos de armazenamento na AWS. Atualmente, o sistema permite apenas 1 imagem por produto, armazenada localmente. A implementação de múltiplas imagens e CDN está planejada para futuras versões quando houver necessidade de escalabilidade.
- URLs retornadas no response`,
  },

  // Passo 14 - Upload de Imagens
  {
    id: 'image-upload',
    route: '/announce',
    title: 'Upload de Imagens com Multer',
    subtitle: 'Passo 15 de 25',
    description: `O sistema permite upload de 1 imagem por produto. As imagens são processadas no backend usando Multer.

Validações garantem qualidade e segurança dos arquivos enviados.`,
    highlightSelector: 'input[type="file"]',
    technicalNotes: `**Multer Configuration:**
\`\`\`javascript
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueName = \`\${Date.now()}-\${file.originalname}\`;
      cb(null, uniqueName);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});
\`\`\`

**Processamento:**
- Sharp para resize e otimização
- Conversão para WebP (menor tamanho)
- Geração de thumbnails

**Armazenamento:**
- **Desenvolvimento:** Armazenamento local em \`./uploads\`
- **Produção:** Não implementado com S3/AWS devido aos custos de armazenamento
- **Futuro:** Integração com AWS S3 e suporte a múltiplas imagens está planejado quando houver necessidade de escalabilidade

**Limitações Atuais:**
- Apenas 1 imagem por produto (não 5 como planejado inicialmente)
- Armazenamento local apenas (não em produção na AWS)
- Sem CDN configurado`,
  },

  // Passo 15 - Listagem de Produtos
  {
    id: 'product-listing',
    route: '/',
    title: 'Listagem e Filtros de Produtos',
    subtitle: 'Passo 16 de 25',
    description: `A página inicial exibe todos os produtos disponíveis com sistema de filtros avançado.

Os produtos são cacheados em Redis para melhor performance.`,
    technicalNotes: `**Endpoint:**
- GET /products?category=&condition=&minPrice=&maxPrice=&search=

**Cache com Redis:**
- Chave: \`products:list:\${query}\`
- TTL: 5 minutos
- Invalidação automática em:
  - Criação de produto
  - Atualização de produto
  - Exclusão de produto

**Paginação:**
- Limit: 20 produtos por página
- Offset baseado em query param
- Total count retornado no header

**Filtros:**
- Categoria (select)
- Condição (select)
- Faixa de preço (range)
- Busca por texto (debounced)`,
  },

  // Passo 16 - Detalhes do Produto
  {
    id: 'product-details',
    route: '/',
    title: 'Página de Detalhes do Produto',
    subtitle: 'Passo 17 de 25',
    description: `Ao clicar em um produto, o usuário é levado para uma página com informações completas, galeria de imagens e opções de compra.

**Status:** Parcialmente implementado.`,
    technicalNotes: `**Endpoint:**
- GET /products/:id

**Informações Exibidas:**
- Galeria de imagens (carousel)
- Título e descrição completa
- Preço atual
- Vendedor (nome, avaliação)
- Categoria e condição
- Data de publicação
- Botões: Adicionar ao carrinho, Comprar agora

**Funcionalidades Planejadas:**
- Sistema de avaliações
- Perguntas e respostas
- Produtos relacionados
- Histórico de preço`,
  },

  // Passo 17 - Carrinho de Compras
  {
    id: 'shopping-cart',
    route: '/',
    title: 'Carrinho de Compras',
    subtitle: 'Passo 18 de 25',
    description: `O carrinho permite adicionar múltiplos produtos antes de finalizar a compra.

Implementado com Context API para gerenciamento de estado global.`,
    hudSide: 'left', // Alternar para esquerda porque o carrinho abre da direita
    technicalNotes: `**Estado do Carrinho:**
\`\`\`typescript
interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}
\`\`\`

**Persistência:**
- localStorage para manter entre sessões
- Sincronização com backend (planejado)

**Funcionalidades:**
- Adicionar item
- Remover item
- Atualizar quantidade
- Calcular total
- Limpar carrinho

**Validações:**
- Estoque disponível
- Preço atualizado
- Produto ainda ativo`,
  },

  // Passo 18 - Processo de Checkout
  {
    id: 'checkout-process',
    route: '/',
    title: 'Processo de Checkout',
    subtitle: 'Passo 19 de 25',
    description: `O checkout guia o usuário através de múltiplas etapas para finalizar a compra.

**Status:** Planejado (não implementado).`,
    technicalNotes: `**Fluxo de Checkout (Planejado):**

1. **Revisão do Carrinho**
   - Confirmar itens e quantidades
   - Aplicar cupons de desconto
   - Calcular frete

2. **Endereço de Entrega**
   - CEP lookup (ViaCEP API)
   - Validação de endereço
   - Salvar para próximas compras

3. **Forma de Pagamento**
   - Cartão de crédito (Stripe/PagSeguro)
   - PIX (geração de QR Code)
   - Boleto bancário

4. **Confirmação**
   - Resumo do pedido
   - Termos e condições
   - Finalizar compra

**Endpoint:**
- POST /orders
- Payload: { items, address, payment }`,
  },

  // Passo 19 - Sistema de Leilões
  {
    id: 'auction-system',
    route: '/auctions',
    title: 'Sistema de Leilões',
    subtitle: 'Passo 20 de 25',
    description: `Além de vendas diretas, o Colecionaí suporta leilões de itens raros.

Usuários podem dar lances em tempo real com WebSockets.

**Status:** Planejado (não implementado).`,
    hudSide: 'left', // Exibir do lado esquerdo para mostrar preview do leilão
    technicalNotes: `**Arquitetura de Leilões:**

**Endpoints:**
- GET /auctions - Listar leilões ativos
- GET /auctions/:id - Detalhes do leilão
- POST /auctions - Criar leilão (vendedor)
- POST /auctions/:id/bids - Dar lance

**WebSocket para Lances em Tempo Real:**
\`\`\`typescript
// Cliente
socket.on('new-bid', (data) => {
  updateCurrentBid(data.amount);
  updateBidHistory(data);
});

// Servidor
io.to(\`auction-\${auctionId}\`).emit('new-bid', {
  amount: bid.amount,
  bidder: bid.user.name,
  timestamp: new Date()
});
\`\`\`

**Regras de Negócio:**
- Lance mínimo: preço inicial + incremento
- Incremento: 5% do valor atual
- Tempo de extensão: +5min se lance nos últimos 2min
- Finalização automática ao expirar
- Notificação ao vencedor (email + push)

**BullMQ Jobs:**
- \`auction-ending-soon\` - Notifica 1h antes
- \`auction-ended\` - Processa vencedor
- \`payment-reminder\` - Cobra vencedor`,
  },

  // Passo 20 - Notificações em Tempo Real
  {
    id: 'realtime-notifications',
    route: '/dashboard',
    title: 'Notificações em Tempo Real',
    subtitle: 'Passo 21 de 25',
    description: `Sistema de notificações usando WebSockets para alertar usuários sobre eventos importantes.

**Status:** Planejado (não implementado).`,
    hudSide: 'left', // Exibir do lado esquerdo
    technicalNotes: `**Eventos de Notificação:**
- Nova mensagem de comprador/vendedor
- Lance superado em leilão
- Produto vendido
- Pagamento confirmado
- Produto enviado
- Avaliação recebida

**Implementação com Socket.IO:**
\`\`\`typescript
// Backend
io.to(\`user-\${userId}\`).emit('notification', {
  type: 'bid-outbid',
  title: 'Você foi superado!',
  message: 'Alguém deu um lance maior no leilão X',
  link: '/auctions/123'
});

// Frontend
socket.on('notification', (data) => {
  toast.info(data.title, {
    description: data.message,
    action: {
      label: 'Ver',
      onClick: () => router.push(data.link)
    }
  });
});
\`\`\`

**Persistência:**
- Notificações salvas no banco
- Marcação de lido/não lido
- Histórico de 30 dias`,
  },

  // Passo 21 - Sistema de Avaliações
  {
    id: 'review-system',
    route: '/',
    title: 'Avaliações e Reputação',
    subtitle: 'Passo 22 de 25',
    description: `Compradores podem avaliar vendedores e produtos após a compra.

Sistema de reputação ajuda a construir confiança na plataforma.

**Status:** Planejado (não implementado).`,
    technicalNotes: `**Modelo de Avaliação:**
\`\`\`typescript
interface Review {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  buyerId: string;
  rating: number; // 1-5 estrelas
  comment: string;
  createdAt: Date;
}
\`\`\`

**Cálculo de Reputação:**
- Média ponderada das últimas 100 avaliações
- Peso maior para avaliações recentes
- Penalidade por respostas lentas
- Bônus por resolução de problemas

**Validações:**
- Apenas compradores podem avaliar
- Uma avaliação por pedido
- Prazo: até 30 dias após entrega
- Moderação de conteúdo ofensivo`,
  },

  // Passo 22 - Busca Avançada
  {
    id: 'advanced-search',
    route: '/',
    title: 'Busca Avançada e Autocomplete',
    subtitle: 'Passo 23 de 25',
    description: `Sistema de busca com autocomplete, sugestões inteligentes e histórico de pesquisas.

**Status:** Parcialmente implementado (busca básica existe).`,
    technicalNotes: `**Elasticsearch (Planejado):**
- Indexação de produtos
- Busca full-text
- Sugestões de autocomplete
- Correção de erros de digitação
- Sinônimos e stemming

**Implementação Atual:**
- Busca simples com LIKE no PostgreSQL
- Debounce de 300ms
- Filtro por categoria e preço

**Melhorias Planejadas:**
- Elasticsearch para busca avançada
- Histórico de buscas (localStorage)
- Sugestões baseadas em popularidade
- Filtros facetados
- Ordenação por relevância`,
  },

  // Passo 23 - Mensagens entre Usuários
  {
    id: 'user-messaging',
    route: '/dashboard',
    title: 'Sistema de Mensagens',
    subtitle: 'Passo 24 de 25',
    description: `Chat direto entre compradores e vendedores para tirar dúvidas sobre produtos.

**Status:** Planejado (não implementado).`,
    hudSide: 'left', // Exibir do lado esquerdo
    technicalNotes: `**Arquitetura:**
- WebSocket para mensagens em tempo real
- Fallback para polling se WebSocket falhar
- Persistência no PostgreSQL

**Endpoints:**
- GET /conversations - Listar conversas
- GET /conversations/:id/messages - Histórico
- POST /conversations/:id/messages - Enviar mensagem

**Funcionalidades:**
- Indicador de digitando...
- Confirmação de leitura
- Anexar imagens
- Notificações push
- Moderação automática (palavrões, spam)

**Segurança:**
- Apenas usuários autenticados
- Rate limiting: 10 mensagens/minuto
- Bloqueio de usuários
- Report de abuso`,
  },

  // Passo 25 - Tecnologias e Arquitetura Completa
  {
    id: 'complete-architecture',
    route: '/',
    title: 'Arquitetura Completa do Sistema',
    subtitle: 'Passo 25 de 25',
    description: `Visão geral completa de todas as tecnologias, padrões arquiteturais e decisões de design do projeto.

Este é um projeto acadêmico que demonstra domínio de engenharia de software moderna.`,
    technicalNotes: `**Stack Completo:**

**Frontend:**
- Next.js 16 (App Router, RSC)
- React 19 (Server Components)
- TypeScript (strict mode)
- Tailwind CSS + Radix UI
- React Query (cache, mutations)
- Framer Motion (animações)
- Zod (validação)

**Backend:**
- Node.js + Express
- Prisma ORM (type-safe)
- PostgreSQL (dados relacionais)
- Redis (cache + message broker)
- BullMQ (filas assíncronas)
- Socket.IO (WebSockets)
- Multer (upload de arquivos)
- Bcrypt (hash de senhas)
- JWT (autenticação)

**Processamento Assíncrono (BullMQ + Redis):**

**Jobs Implementados:**
1. **send-verification-email**
   - Disparado no cadastro
   - Retry: 3x com backoff exponencial
2. **send-password-reset-email**
   - Disparado em "Esqueci senha"
   - Token expira em 1h

**Jobs Planejados:**
3. **auction-ending-soon** - Notifica 1h antes
4. **auction-ended** - Processa vencedor
5. **payment-reminder** - Cobra vencedor
6. **order-shipped** - Notifica comprador

**Cache com Redis:**
- Produtos: TTL 5min, invalidação em CRUD
- Usuários: TTL 10min
- Leilões ativos: TTL 1min
- Reduz 80% das queries ao banco

**Arquitetura:**
- Clean Architecture (Domain, Application, Infra)
- DDD (Entities, Value Objects, Repositories)
- Dependency Injection
- SOLID principles
- Event-driven (WebSockets, BullMQ)

**Segurança:**
- HTTPS obrigatório
- CORS configurado
- Rate limiting (5 req/s por IP)
- SQL injection prevention (Prisma)
- XSS prevention (sanitização)
- CSRF tokens
- Helmet.js (security headers)

**Testes:**
- Jest (unit + integration)
- Supertest (API tests)
- Coverage mínimo: 80%

**DevOps:**
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Deploy: Vercel (front) + Render (back)
- Monitoramento: Sentry (errors)
- Logs: Winston + CloudWatch

**Funcionalidades Implementadas:**
✅ Autenticação completa (JWT)
✅ CRUD de produtos
✅ Upload de imagens (Multer)
✅ Carrinho de compras
✅ Cache com Redis
✅ Emails assíncronos (BullMQ)
✅ Validações (Zod)

**Funcionalidades Planejadas:**
🔄 Sistema de leilões (WebSocket)
🔄 Checkout e pagamentos
🔄 Notificações em tempo real
🔄 Avaliações e reputação
🔄 Busca avançada (Elasticsearch)
🔄 Coleções e favoritos
🔄 Mensagens entre usuários

**Diferenciais Técnicos:**
- Arquitetura escalável e manutenível
- Performance otimizada (cache, lazy loading)
- UX moderna e responsiva
- Código limpo e bem documentado
- Testes automatizados
- CI/CD configurado
- Modo Análise interativo (este tour!)`,
  },
];

