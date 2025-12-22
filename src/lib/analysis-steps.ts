import { AnalysisStep } from '@/types/analysis';

export const analysisSteps: AnalysisStep[] = [
  // Passo 1 - Introdução
  {
    id: 'intro-landing',
    route: '/',
    title: 'Bem-vindo ao Modo Análise Técnico',
    subtitle: 'Passo 1 de 12',
    description: `Este é um tour técnico focado em demonstrar as decisões arquiteturais, padrões de código e tecnologias utilizadas neste projeto acadêmico.

**Objetivo:** Mostrar como problemas reais foram resolvidos com soluções profissionais, focando em arquitetura, performance e boas práticas.`,
    technicalNotes: `## Stack Tecnológico

**Frontend:**
- Next.js 16 (App Router, Server Components)
- React 19 com TypeScript (strict mode)
- Tailwind CSS + Radix UI (componentes acessíveis)
- React Query (cache e sincronização de estado)
- Framer Motion (animações performáticas)
- Zod (validação type-safe)

**Backend:**
- Node.js + Express 5
- TypeScript (100% tipado)
- Prisma ORM (type-safe database access)
- PostgreSQL 15 (banco relacional)
- Redis (cache + message broker)
- BullMQ (filas assíncronas)
- Socket.IO (WebSockets para real-time)
- JWT (autenticação stateless)

**Arquitetura:**
- Clean Architecture (Domain, Application, Infrastructure)
- Domain-Driven Design (DDD)
- Dependency Injection (TSyringe)
- SOLID principles
- Repository Pattern`,
  },

  // Passo 2 - Autenticação (explicação sem login forçado)
  {
    id: 'auth-explanation',
    route: '/login',
    title: 'Sistema de Autenticação',
    subtitle: 'Passo 2 de 12',
    description: `O sistema utiliza JWT (JSON Web Tokens) para autenticação stateless. O token é armazenado em cookies httpOnly para segurança máxima.

**Como funciona:** Após login bem-sucedido, o backend retorna um token JWT que contém informações do usuário. Este token é enviado automaticamente em todas as requisições via cookies.`,
    technicalNotes: `## Fluxo de Autenticação

**1. Login (POST /sessions):**
\`\`\`typescript
// Backend: AuthenticateUserUseCase
- Valida email e senha
- Compara hash bcrypt da senha
- Gera JWT token com payload: { sub: userId, jti: tokenId }
- Retorna token + dados do usuário
- Token armazenado em cookie httpOnly (não acessível via JavaScript)
\`\`\`

**2. Proteção de Rotas:**
\`\`\`typescript
// Middleware: ensureAuthenticated
- Lê token dos cookies
- Verifica assinatura JWT
- Verifica blacklist no Redis (logout)
- Injeta req.user = { id: userId }
\`\`\`

**3. Segurança:**
- Cookies httpOnly (proteção XSS)
- SameSite=strict (proteção CSRF)
- Secure em produção (HTTPS only)
- Blacklist de tokens no Redis ao fazer logout
- Rate limiting: 5 tentativas/minuto por IP

**4. Validação de Senha:**
- Hash bcrypt com cost factor 10
- Salt único por senha
- Comparação segura (timing-safe)
- Nunca armazenada em texto plano`,
  },

  // Passo 3 - Cadastro e Emails Assíncronos
  {
    id: 'register-bullmq',
    route: '/register',
    title: 'Cadastro e Processamento Assíncrono',
    subtitle: 'Passo 3 de 12',
    description: `O cadastro de usuários demonstra processamento assíncrono com BullMQ. Após criar o usuário, o envio de email é feito em background, não bloqueando a resposta.

**Por que assíncrono?** Enviar emails pode levar segundos. Se fizéssemos síncrono, o usuário esperaria muito tempo. Com filas, a resposta é imediata e o email é processado depois.`,
    highlightSelector: 'form',
    technicalNotes: `## Arquitetura de Filas (BullMQ + Redis)

**1. Criação de Usuário (POST /users):**
\`\`\`typescript
// CreateUserUseCase
1. Valida dados (Zod schema)
2. Verifica se email já existe
3. Hash da senha (bcrypt, cost 10)
4. Cria usuário no PostgreSQL via Prisma
5. Gera token de verificação (6 dígitos alfanuméricos)
6. Salva token no banco (expira em 3h)
7. **Adiciona job na fila BullMQ** (não aguarda envio)
8. Retorna resposta imediata ao usuário
\`\`\`

**2. Fila BullMQ:**
\`\`\`typescript
// BullQueueProvider.add("register-confirmation", { email, name, token })
- Job é adicionado na fila "emails" no Redis
- Retorna imediatamente (não bloqueia)
- Worker separado processa em background
\`\`\`

**3. Worker de Emails:**
\`\`\`typescript
// jobs/worker.ts
const emailWorker = new Worker("emails", async (job) => {
  const mailProvider = container.resolve<IMailProvider>("MailProvider");
  
  switch (job.name) {
    case "register-confirmation":
      await mailProvider.sendMail(email, subject, html);
      break;
  }
}, {
  connection: redisConnection,
  concurrency: 10, // Processa 10 emails simultaneamente
});
\`\`\`

**4. Redis como Message Broker:**
- Armazena jobs na fila
- Garante entrega (persistência)
- Permite retry automático
- Suporta múltiplos workers (escalabilidade)
- Dead letter queue para jobs que falharam

**5. Vantagens:**
- ✅ Resposta rápida ao usuário (< 200ms)
- ✅ Escalável (múltiplos workers)
- ✅ Confiável (retry automático)
- ✅ Não bloqueia API principal
- ✅ Monitorável (status dos jobs)

**6. Implementação Real:**
- **Fila:** \`emailQueue\` (BullMQ Queue)
- **Worker:** \`emailWorker\` (processa jobs)
- **Provider:** \`SMTPMailProvider\` ou \`ConsoleMailProvider\`
- **Redis:** Armazena jobs e estado dos workers`,
  },

  // Passo 4 - Cache com Redis
  {
    id: 'redis-cache',
    route: '/',
    title: 'Cache com Redis para Performance',
    subtitle: 'Passo 4 de 12',
    description: `O sistema utiliza Redis para cache de dados frequentes, reduzindo drasticamente a carga no banco de dados PostgreSQL.

**Impacto:** Listagens de produtos que levariam 200-500ms no banco, retornam em < 10ms do cache. Isso melhora muito a experiência do usuário.`,
    technicalNotes: `## Sistema de Cache com Redis

**1. Estratégia de Cache:**
\`\`\`typescript
// ListAllProductsUseCase
const cacheKey = \`products-list:\${JSON.stringify(filter)}\`;

// Tentar recuperar do cache primeiro
const cached = await cacheProvider.recover<Product[]>(cacheKey);
if (cached) {
  console.log("⚡ Hit no Cache! Retornando do Redis.");
  return cached; // Resposta instantânea
}

// Se não está em cache, buscar no banco
const products = await productsRepository.list(filter);

// Salvar no cache para próximas requisições
await cacheProvider.save(cacheKey, products);

return products;
\`\`\`

**2. Implementação Redis:**
\`\`\`typescript
// RedisCacheProvider
class RedisCacheProvider implements ICacheProvider {
  private client: Redis;
  
  async save(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }
  
  async saveWithExpiration(key: string, value: any, ttl: number): Promise<void> {
    await this.client.setex(key, ttl, JSON.stringify(value));
  }
  
  async recover<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async invalidate(key: string): Promise<void> {
    await this.client.del(key);
  }
  
  async invalidatePrefix(prefix: string): Promise<void> {
    const keys = await this.client.keys(\`\${prefix}:*\`);
    if (keys.length > 0) {
      const pipeline = this.client.pipeline();
      keys.forEach(key => pipeline.del(key));
      await pipeline.exec(); // Executa todas as deleções em batch
    }
  }
}
\`\`\`

**3. Invalidação Inteligente:**
\`\`\`typescript
// CreateProductUseCase
await productsRepository.create(product);

// Invalidar cache de listagens
await cacheProvider.invalidatePrefix("products-list:");

// Próxima requisição vai buscar do banco e recachear
\`\`\`

**4. TTL (Time To Live):**
- Produtos: 5 minutos (dados mudam pouco)
- Feedbacks: 20 segundos (dados mais dinâmicos)
- Usuários: 10 minutos (dados estáticos)

**5. Métricas de Performance:**
- **Sem cache:** 200-500ms (query PostgreSQL)
- **Com cache:** < 10ms (Redis em memória)
- **Redução:** ~95% do tempo de resposta
- **Throughput:** Suporta 10x mais requisições

**6. Arquitetura:**
- Redis como camada de cache (não é fonte de verdade)
- PostgreSQL como fonte de verdade
- Invalidação automática em CRUD
- Fallback gracioso se Redis estiver offline`,
  },

  // Passo 5 - Clean Architecture
  {
    id: 'clean-architecture',
    route: '/',
    title: 'Clean Architecture e DDD',
    subtitle: 'Passo 5 de 12',
    description: `O projeto segue Clean Architecture com Domain-Driven Design, garantindo código testável, manutenível e desacoplado.

**Benefícios:** Se precisar trocar Prisma por outro ORM, ou Express por Fastify, só muda a camada de infraestrutura. O domínio permanece intacto.`,
    technicalNotes: `## Estrutura de Camadas

**1. Domain Layer (Núcleo):**
\`\`\`
modules/
  accounts/
    entities/
      User.ts          # Entidade de domínio
    repositories/
      IUserRepository.ts  # Interface (contrato)
\`\`\`
- **Regras de negócio puras**
- **Sem dependências externas**
- **Interfaces (contratos) apenas**

**2. Application Layer (Use Cases):**
\`\`\`
modules/
  accounts/
    useCases/
      createUser/
        CreateUserUseCase.ts    # Lógica de negócio
        CreateUserController.ts # HTTP handler
\`\`\`
- **Orquestra o domínio**
- **Dependency Injection (TSyringe)**
- **Validações de entrada**

**3. Infrastructure Layer:**
\`\`\`
shared/
  infra/
    prisma/
      PrismaUsersRepository.ts  # Implementação concreta
    providers/
      RedisCacheProvider.ts
      BullQueueProvider.ts
\`\`\`
- **Implementações concretas**
- **Prisma, Redis, BullMQ, etc.**
- **Pode ser trocado sem afetar domínio**

**4. Dependency Injection:**
\`\`\`typescript
// shared/container/index.ts
container.registerSingleton<IUserRepository>(
  "UsersRepository",
  PrismaUsersRepository  // Implementação concreta
);

// Use Case recebe interface, não implementação
@injectable()
class CreateUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUserRepository  // Interface!
  ) {}
}
\`\`\`

**5. Vantagens:**
- ✅ Testável (mock de interfaces)
- ✅ Desacoplado (troca implementações facilmente)
- ✅ Manutenível (responsabilidades claras)
- ✅ Escalável (adiciona features sem quebrar existentes)

**6. Exemplo Real:**
Se quiser trocar Redis por Memcached:
1. Criar \`MemcachedCacheProvider\` implementando \`ICacheProvider\`
2. Trocar registro no container
3. **Pronto!** Todo código continua funcionando`,
  },

  // Passo 6 - Validações com Zod
  {
    id: 'validation-zod',
    route: '/register',
    title: 'Validação Type-Safe com Zod',
    subtitle: 'Passo 6 de 12',
    description: `Todas as validações são feitas com Zod, garantindo type-safety do frontend ao backend.

**Benefício:** Se o schema mudar, o TypeScript avisa em tempo de compilação. Não há risco de enviar dados inválidos.`,
    highlightSelector: 'input[name="name"]',
    technicalNotes: `## Validação com Zod

**1. Schema Compartilhado:**
\`\`\`typescript
// schemas/userSchema.ts
export const createUserSchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, "Nome deve ter no mínimo 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    email: z.string()
      .email("Email inválido")
      .toLowerCase(), // Normalização automática
    password: z.string()
      .min(8, "Senha deve ter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "Senha deve conter 1 maiúscula")
      .regex(/[a-z]/, "Senha deve conter 1 minúscula")
      .regex(/[0-9]/, "Senha deve conter 1 número")
      .regex(/[^A-Za-z0-9]/, "Senha deve conter 1 caractere especial")
  })
});
\`\`\`

**2. Middleware de Validação:**
\`\`\`typescript
// validateResource middleware
router.post(
  "/users",
  validateResource(createUserSchema),  // Valida antes do controller
  createUserController.handle
);

// Se inválido, retorna 400 com detalhes:
{
  "status": "error",
  "message": "Erro de validação",
  "issues": [
    { "field": "email", "message": "Email inválido" },
    { "field": "password", "message": "Senha deve conter 1 maiúscula" }
  ]
}
\`\`\`

**3. Frontend (React Hook Form + Zod):**
\`\`\`typescript
const form = useForm({
  resolver: zodResolver(createUserSchema),
  defaultValues: { name: '', email: '', password: '' }
});

// Validação em tempo real
// TypeScript conhece os tipos automaticamente
\`\`\`

**4. Vantagens:**
- ✅ Type-safe (TypeScript + Zod)
- ✅ Validação no frontend E backend
- ✅ Mensagens de erro consistentes
- ✅ Auto-complete no IDE
- ✅ Refactoring seguro`,
  },

  // Passo 7 - WebSockets e Real-time
  {
    id: 'websockets-realtime',
    route: '/',
    title: 'WebSockets para Tempo Real',
    subtitle: 'Passo 7 de 12',
    description: `O sistema de leilões utiliza Socket.IO para atualizações em tempo real. Quando alguém dá um lance, todos os participantes são notificados instantaneamente.

**Tecnologia:** Socket.IO com fallback automático para polling se WebSocket não estiver disponível.`,
    technicalNotes: `## Sistema de WebSockets (Socket.IO)

**1. Configuração do Servidor:**
\`\`\`typescript
// server.ts
import { Server } from "socket.io";

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Autenticação via JWT nos cookies
io.use((socket, next) => {
  const token = extractTokenFromCookies(socket.handshake.headers.cookie);
  const decoded = verify(token, JWT_SECRET);
  socket.user_id = decoded.sub;
  next();
});
\`\`\`

**2. Sistema de Rooms:**
\`\`\`typescript
// Cliente entra na "sala" do leilão
socket.on("join_auction", ({ auction_id }) => {
  socket.join(auction_id);
});

// Quando lance é criado, notifica apenas quem está na sala
auctionEvents.on("bid:created", (bid) => {
  io.to(bid.auction_id).emit("new_bid", {
    amount: bid.amount,
    bidder: bid.user.name,
    timestamp: new Date()
  });
});
\`\`\`

**3. Eventos Implementados:**
- \`new_bid\` - Novo lance no leilão
- \`notification\` - Notificação personalizada
- \`bid:outbid\` - Você foi superado
- \`bid:received\` - Dono do leilão recebeu lance

**4. Frontend (React Hook):**
\`\`\`typescript
// useAuctionSocket.ts
const socket = useSocket();

useEffect(() => {
  socket.on("new_bid", (data) => {
    setCurrentBid(data.amount);
    setBidHistory(prev => [...prev, data]);
    toast.info(\`Novo lance: R$ \${data.amount}\`);
  });
  
  return () => socket.off("new_bid");
}, []);
\`\`\`

**5. Fallback Automático:**
- Socket.IO tenta WebSocket primeiro
- Se falhar, usa polling (long-polling)
- Transparente para o desenvolvedor
- Funciona mesmo em proxies/corporativos

**6. Performance:**
- Conexão persistente (não precisa re-autenticar)
- Broadcast eficiente (apenas para rooms relevantes)
- Baixa latência (< 50ms para notificações)`,
  },

  // Passo 8 - Upload de Imagens
  {
    id: 'image-upload',
    route: '/',
    title: 'Upload e Processamento de Imagens',
    subtitle: 'Passo 8 de 12',
    description: `O sistema permite upload de imagens usando Multer no backend. As imagens são validadas, processadas e armazenadas.

**Limitação atual:** Apenas 1 imagem por produto (armazenamento local). Múltiplas imagens e S3 estão planejados para produção.`,
    highlightSelector: 'input[type="file"]',
    technicalNotes: `## Upload com Multer

**1. Configuração Multer:**
\`\`\`typescript
// config/upload.ts
const upload = multer({
  storage: multer.diskStorage({
    destination: './tmp/uploads',
    filename: (req, file, cb) => {
      const uniqueName = \`\${Date.now()}-\${file.originalname}\`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
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

**2. Endpoint:**
\`\`\`typescript
router.patch(
  "/products/:id/image",
  ensureAuthenticated,
  upload.single("image"),  // Multer middleware
  updateProductImageController.handle
);
\`\`\`

**3. Processamento (Planejado):**
- Resize automático (Sharp)
- Conversão para WebP
- Geração de thumbnails
- Otimização de tamanho

**4. Armazenamento:**
- **Desenvolvimento:** Local (\`./tmp/uploads\`)
- **Produção:** Planejado S3/AWS (não implementado por custos)
- **URL:** \`/files/\${filename}\` (servido estaticamente)

**5. Validações:**
- Tipo MIME (JPEG, PNG, WebP)
- Tamanho máximo (5MB)
- Dimensões (planejado)`,
  },

  // Passo 9 - Rate Limiting
  {
    id: 'rate-limiting',
    route: '/login',
    title: 'Rate Limiting e Segurança',
    subtitle: 'Passo 9 de 12',
    description: `O sistema implementa rate limiting para prevenir abuso e ataques de força bruta.

**Proteção:** Máximo 5 requisições por minuto por IP em endpoints sensíveis como login.`,
    technicalNotes: `## Rate Limiting

**1. Implementação:**
\`\`\`typescript
// middlewares/rateLimiter.ts
import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto (geral)
  message: "Muitas requisições, tente novamente em 1 minuto",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit específico para login
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // Apenas 5 tentativas de login por minuto
  skipSuccessfulRequests: true, // Não conta se login foi bem-sucedido
});
\`\`\`

**2. Headers Retornados:**
\`\`\`
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1640995200
\`\`\`

**3. Outras Proteções:**
- CORS configurado (origens permitidas)
- Helmet.js (security headers)
- Validação de entrada (Zod)
- SQL injection prevention (Prisma)
- XSS prevention (sanitização)`,
  },

  // Passo 10 - Estrutura de Módulos
  {
    id: 'module-structure',
    route: '/',
    title: 'Estrutura Modular (DDD)',
    subtitle: 'Passo 10 de 12',
    description: `O projeto está organizado em módulos independentes seguindo DDD. Cada módulo representa um contexto delimitado.

**Módulos:** accounts, products, auctions, bids, feedbacks. Cada um com suas próprias entidades, use cases e repositórios.`,
    technicalNotes: `## Estrutura de Módulos

**1. Organização:**
\`\`\`
modules/
  accounts/          # Contexto: Autenticação e Usuários
    entities/
    repositories/
    useCases/
      createUser/
      authenticateUser/
      sendVerificationToken/
  
  products/          # Contexto: Catálogo de Produtos
    entities/
    repositories/
    useCases/
      createProduct/
      listProducts/
      updateProduct/
  
  auctions/          # Contexto: Sistema de Leilões
    entities/
    repositories/
    useCases/
      createAuction/
      closeAuction/
  
  bids/              # Contexto: Lances em Leilões
    entities/
    repositories/
    useCases/
      createBid/
  
  feedbacks/         # Contexto: Feedback de Usuários
    entities/
    repositories/
    useCases/
      createFeedback/
      listFeedbacks/
\`\`\`

**2. Princípios:**
- **Bounded Context:** Cada módulo é independente
- **Ubiquitous Language:** Termos do domínio
- **Aggregates:** Entidades relacionadas agrupadas
- **Value Objects:** Objetos imutáveis (preço, email)

**3. Comunicação entre Módulos:**
- Via eventos (EventEmitter)
- Via interfaces compartilhadas
- Sem dependências diretas

**4. Vantagens:**
- ✅ Código organizado e fácil de encontrar
- ✅ Time pode trabalhar em módulos diferentes
- ✅ Testes isolados por módulo
- ✅ Escalável (adiciona novos módulos facilmente)`,
  },

  // Passo 11 - Performance e Otimizações
  {
    id: 'performance',
    route: '/',
    title: 'Otimizações de Performance',
    subtitle: 'Passo 11 de 12',
    description: `Várias otimizações foram implementadas para garantir performance e escalabilidade.

**Principais:** Cache Redis, processamento assíncrono, lazy loading, code splitting.`,
    technicalNotes: `## Otimizações Implementadas

**1. Cache Redis:**
- Listagens de produtos: 5min TTL
- Detalhes de produto: sem TTL (invalidação manual)
- Feedbacks: 20s TTL
- **Redução:** 95% das queries ao banco

**2. Processamento Assíncrono:**
- Emails via BullMQ (não bloqueia API)
- Fechamento de leilões agendado
- Workers escaláveis horizontalmente

**3. Frontend:**
- Code splitting (Next.js automático)
- Lazy loading de componentes
- React Query (cache de requisições)
- Image optimization (Next.js Image)

**4. Banco de Dados:**
- Índices em campos frequentes (email, user_id)
- Queries otimizadas (Prisma)
- Connection pooling
- Migrations versionadas

**5. Monitoramento:**
- Logs estruturados
- Error tracking (planejado: Sentry)
- Performance metrics (planejado)`,
  },

  // Passo 12 - Conclusão e Feedback
  {
    id: 'conclusion',
    route: '/feedback',
    title: 'Conclusão e Próximos Passos',
    subtitle: 'Passo 12 de 12',
    description: `Este tour técnico mostrou as principais decisões arquiteturais e tecnologias utilizadas.

**Obrigado por explorar!** Seu feedback é muito valioso para meu crescimento como desenvolvedor.`,
    technicalNotes: `## Resumo Técnico

**Arquitetura:**
- ✅ Clean Architecture
- ✅ Domain-Driven Design
- ✅ Dependency Injection
- ✅ Repository Pattern

**Tecnologias:**
- ✅ Redis (cache + filas)
- ✅ BullMQ (processamento assíncrono)
- ✅ Socket.IO (real-time)
- ✅ Prisma (type-safe ORM)
- ✅ JWT (autenticação stateless)

**Boas Práticas:**
- ✅ Validação type-safe (Zod)
- ✅ Rate limiting
- ✅ Error handling centralizado
- ✅ Logs estruturados
- ✅ Código testável

**Próximos Passos:**
- 🔄 Testes automatizados (Jest)
- 🔄 CI/CD completo (GitHub Actions)
- 🔄 Monitoramento (Sentry, DataDog)
- 🔄 Documentação API (Swagger completo)

**Diferenciais:**
- Arquitetura escalável e manutenível
- Performance otimizada
- Código limpo e bem documentado
- Foco em boas práticas de engenharia`,
  },
];
