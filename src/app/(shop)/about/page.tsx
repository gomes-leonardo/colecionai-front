'use client';

import { motion, useInView } from 'framer-motion';
import { Github, Linkedin, Mail, Code2, Database, Zap, Shield, Rocket, Users, Sparkles, TrendingUp, Award, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FeedbackForm } from '@/components/shared/feedback-form';
import { FeedbackType } from '@/types/feedback';
import { useEffect, useRef, useState } from 'react';

// Animated Counter Component
function AnimatedCounter({ end, duration = 2, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Badge className="mb-4 text-sm bg-gradient-to-r from-primary to-secondary text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                Projeto Acadêmico de Aprendizado
              </Badge>
            </motion.div>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Aprendendo na Prática
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Este projeto foi desenvolvido como parte da minha jornada de aprendizado em arquitetura de software, 
              boas práticas e tecnologias modernas. Cada linha de código representa um passo no meu crescimento como desenvolvedor.
            </p>
            
            {/* Bento Grid Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { value: 5000, label: 'Linhas de Código', suffix: '+', icon: Code2, color: 'from-blue-500 to-cyan-500' },
                { value: 20, label: 'Endpoints REST', suffix: '+', icon: Zap, color: 'from-yellow-500 to-orange-500' },
                { value: 100, label: 'TypeScript', suffix: '%', icon: Award, color: 'from-green-500 to-emerald-500' },
                { value: 4, label: 'Módulos DDD', suffix: '', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group"
                >
                  <div className="relative">
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl`} />
                    
                    <Card className="relative bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                      <CardContent className="p-6 text-center">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300`}>
                          <metric.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          <AnimatedCounter end={metric.value} suffix={metric.suffix} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 font-medium">{metric.label}</div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons with Glow */}
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="https://github.com/gomes-leonardo" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 transition-all duration-300">
                    <Github className="w-5 h-5" />
                    Ver no GitHub
                  </Button>
                </a>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a href="https://www.linkedin.com/in/gomess-leonardo/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="gap-2 border-2 hover:border-primary hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </Button>
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-4">Stack Tecnológico</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Tecnologias modernas escolhidas estrategicamente para performance, escalabilidade e developer experience
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Code2,
                  title: 'Backend Core',
                  techs: ['Node.js 20', 'TypeScript 5.9', 'Express 5.1'],
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  icon: Database,
                  title: 'Banco de Dados',
                  techs: ['PostgreSQL 15', 'Prisma 7.1', 'Redis'],
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Zap,
                  title: 'Real-time',
                  techs: ['Socket.IO 4.8', 'BullMQ 5.65', 'EventEmitter'],
                  color: 'from-yellow-500 to-orange-500'
                },
                {
                  icon: Shield,
                  title: 'Segurança',
                  techs: ['JWT', 'bcryptjs', 'Zod', 'Rate Limiting'],
                  color: 'from-red-500 to-pink-500'
                },
                {
                  icon: Rocket,
                  title: 'DevOps',
                  techs: ['Docker', 'GitHub Actions', 'Render.com'],
                  color: 'from-purple-500 to-violet-500'
                },
                {
                  icon: Users,
                  title: 'Frontend',
                  techs: ['Next.js 15', 'React 19', 'Tailwind CSS'],
                  color: 'from-indigo-500 to-blue-500'
                },
              ].map((stack, index) => (
                <motion.div
                  key={stack.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stack.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <stack.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-3">{stack.title}</h3>
                      <div className="space-y-2">
                        {stack.techs.map((tech) => (
                          <div key={tech} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {tech}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technical Decisions - Interactive Accordion */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-4">Decisões Técnicas</h2>
            <p className="text-center text-muted-foreground mb-12">
              Por que escolhi cada tecnologia? Clique para saber mais
            </p>

            <div className="space-y-4">
              {[
                {
                  question: '🏗️ Por que Clean Architecture?',
                  answer: 'Aprendi que separar o código em camadas torna tudo mais organizado e testável. Se eu quiser trocar o Prisma por outro ORM, só preciso mudar a camada de infraestrutura. O domínio fica protegido e independente!',
                  benefits: ['Código mais organizado', 'Fácil de testar', 'Tecnologias intercambiáveis']
                },
                {
                  question: '⚡ Por que TypeScript?',
                  answer: 'No início achei complicado, mas depois vi que os erros aparecem antes de rodar o código. O IntelliSense me ajuda muito e refatorar ficou muito mais seguro. Não volto mais para JavaScript puro!',
                  benefits: ['Menos bugs', 'Melhor autocomplete', 'Refactoring seguro']
                },
                {
                  question: '🗄️ Por que Prisma?',
                  answer: 'Migrations automáticas, queries tipadas e um schema super legível. Aprendi que ORM não é "mágica ruim" quando bem usado. O Prisma Studio também ajuda muito a visualizar os dados!',
                  benefits: ['Type-safe', 'Migrations fáceis', 'Ótima DX']
                },
                {
                  question: '⚡ Por que Redis?',
                  answer: 'Cache é essencial! Aprendi que buscar dados do banco toda hora é lento. Com Redis, as listagens ficaram instantâneas. Também uso para as filas do BullMQ.',
                  benefits: ['Performance', 'Cache rápido', 'Suporte a filas']
                },
                {
                  question: '🔌 Por que Socket.IO?',
                  answer: 'Foi o maior desafio! Precisava de real-time para os leilões. Socket.IO tem fallback automático (polling se WebSocket falhar) e o sistema de rooms facilitou muito enviar notificações só para quem precisa.',
                  benefits: ['Real-time', 'Fallback automático', 'Rooms/Namespaces']
                },
              ].map((item, index) => (
                <motion.details
                  key={item.question}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <summary className="cursor-pointer list-none">
                    <Card className="hover:shadow-md transition-all duration-300 group-open:border-primary">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{item.question}</h3>
                          <div className="text-muted-foreground group-open:rotate-180 transition-transform">
                            ▼
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </summary>
                  <div className="mt-2 ml-4 pl-4 border-l-2 border-primary/30">
                    <Card className="bg-muted/30">
                      <CardContent className="p-6">
                        <p className="text-muted-foreground mb-4">{item.answer}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Benefícios:</p>
                          {item.benefits.map((benefit) => (
                            <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.details>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-4">Clean Architecture</h2>
            <p className="text-center text-muted-foreground mb-12">
              Arquitetura em camadas garantindo separação de responsabilidades e testabilidade
            </p>

            <div className="space-y-4">
              {[
                {
                  layer: 'Presentation Layer',
                  description: 'Controllers e Routes - Interface HTTP',
                  examples: ['AuthenticateUserController', 'CreateProductController'],
                  color: 'from-blue-500/20 to-blue-500/10'
                },
                {
                  layer: 'Application Layer',
                  description: 'Use Cases - Lógica de negócio isolada',
                  examples: ['AuthenticateUserUseCase', 'CreateBidUseCase'],
                  color: 'from-green-500/20 to-green-500/10'
                },
                {
                  layer: 'Domain Layer',
                  description: 'Entidades e Regras de Negócio',
                  examples: ['User', 'Product', 'Auction', 'Bid'],
                  color: 'from-yellow-500/20 to-yellow-500/10'
                },
                {
                  layer: 'Infrastructure Layer',
                  description: 'Repositories e Serviços Externos',
                  examples: ['PrismaUsersRepository', 'RedisCacheProvider'],
                  color: 'from-purple-500/20 to-purple-500/10'
                },
              ].map((layer, index) => (
                <motion.div
                  key={layer.layer}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-r ${layer.color} border border-border rounded-lg p-6 hover:border-primary/50 transition-all`}
                >
                  <h3 className="text-lg font-semibold mb-2">{layer.layer}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{layer.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {layer.examples.map((example) => (
                      <Badge key={example} variant="secondary" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades Implementadas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: '🔐 Autenticação Segura',
                  items: ['JWT em cookies HTTP-only', 'Verificação de email', 'Recuperação de senha', 'Rate limiting']
                },
                {
                  title: '📦 Gerenciamento de Produtos',
                  items: ['CRUD completo', 'Upload de imagens', '13 categorias', 'Cache Redis']
                },
                {
                  title: '🎯 Leilões em Tempo Real',
                  items: ['WebSockets (Socket.IO)', 'Notificações instantâneas', 'Fechamento automático', 'Histórico completo']
                },
                {
                  title: '⚡ Performance',
                  items: ['Cache distribuído', 'Filas assíncronas', 'Workers escaláveis', 'Queries otimizadas']
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                      <ul className="space-y-2">
                        {feature.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Development Journey Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-4">Jornada de Desenvolvimento</h2>
            <p className="text-center text-muted-foreground mb-12">
              Cada etapa representa um aprendizado importante nesta jornada
            </p>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

              {/* Timeline Items */}
              <div className="space-y-8">
                {[
                  {
                    phase: 'Fase 1',
                    title: 'Planejamento & Arquitetura',
                    description: 'Estudei Clean Architecture e DDD, desenhei a estrutura de pastas e defini os bounded contexts',
                    techs: ['Clean Architecture', 'DDD', 'SOLID'],
                    icon: '📐',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    phase: 'Fase 2',
                    title: 'Setup & Infraestrutura',
                    description: 'Configurei TypeScript, Prisma, Docker Compose e estruturei o projeto seguindo as camadas da Clean Architecture',
                    techs: ['TypeScript', 'Prisma', 'Docker', 'PostgreSQL'],
                    icon: '⚙️',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    phase: 'Fase 3',
                    title: 'Autenticação & Segurança',
                    description: 'Implementei JWT, hash de senhas, verificação de email e rate limiting. Aprendi sobre cookies HTTP-only e CORS',
                    techs: ['JWT', 'bcrypt', 'Cookies', 'CORS'],
                    icon: '🔐',
                    color: 'from-red-500 to-pink-500'
                  },
                  {
                    phase: 'Fase 4',
                    title: 'CRUD & Validações',
                    description: 'Criei os módulos de produtos e leilões, aprendi Zod para validação e implementei upload de imagens',
                    techs: ['Zod', 'Multer', 'Repository Pattern'],
                    icon: '📦',
                    color: 'from-yellow-500 to-orange-500'
                  },
                  {
                    phase: 'Fase 5',
                    title: 'Real-time & Eventos',
                    description: 'Maior desafio! Implementei WebSockets com Socket.IO, sistema de lances em tempo real e notificações',
                    techs: ['Socket.IO', 'EventEmitter', 'WebSockets'],
                    icon: '⚡',
                    color: 'from-purple-500 to-violet-500'
                  },
                  {
                    phase: 'Fase 6',
                    title: 'Performance & Cache',
                    description: 'Otimizei com Redis para cache, implementei filas com BullMQ para processar emails e fechar leilões',
                    techs: ['Redis', 'BullMQ', 'Workers'],
                    icon: '🚀',
                    color: 'from-indigo-500 to-blue-500'
                  },
                  {
                    phase: 'Fase 7',
                    title: 'Deploy & CI/CD',
                    description: 'Aprendi sobre containers, GitHub Actions para testes automáticos e deploy no Render.com',
                    techs: ['GitHub Actions', 'Render', 'CI/CD'],
                    icon: '🌐',
                    color: 'from-teal-500 to-cyan-500'
                  },
                ].map((milestone, index) => (
                  <motion.div
                    key={milestone.phase}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-20"
                  >
                    {/* Icon Circle */}
                    <div className={`absolute left-0 w-16 h-16 rounded-full bg-gradient-to-br ${milestone.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {milestone.icon}
                    </div>

                    {/* Content Card */}
                    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {milestone.phase}
                          </Badge>
                          <h3 className="text-xl font-semibold">{milestone.title}</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          {milestone.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {milestone.techs.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Current Status */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative pl-20 mt-8"
              >
                <div className="absolute left-0 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl shadow-lg animate-pulse">
                  ✨
                </div>
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">Agora: Aprendizado Contínuo</h3>
                    <p className="text-muted-foreground">
                      Buscando feedback, estudando novas tecnologias e sempre melhorando o código. 
                      O aprendizado nunca para! 🚀
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Ajude-me a Crescer! 🚀</h2>
              <p className="text-lg text-muted-foreground">
                Estou sempre buscando evoluir como desenvolvedor. Suas sugestões são muito valiosas para minha jornada!
              </p>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-2">
              <CardContent className="p-8">
                <form className="space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const message = formData.get('message') as string;
                  const rating = parseInt(formData.get('rating') as string);
                  const name = formData.get('name') as string || 'Visitante Anônimo';

                  try {
                    const { createFeedback } = await import('@/services/feedbackService');
                    const { FeedbackType } = await import('@/types/feedback');
                    const { toast } = await import('sonner');
                    
                    const result = await createFeedback({
                      type: FeedbackType.SUGGESTION,
                      message: message.trim(),
                      rating,
                      visitor_name: name.trim() || 'Visitante Anônimo',
                      context: 'about_page_suggestions'
                    });

                    // Verificar se realmente foi criado com sucesso
                    if (result && result.id) {
                      toast.success('Sugestão enviada com sucesso!', {
                        description: 'Obrigado por me ajudar a crescer! 🙏'
                      });

                      e.currentTarget.reset();
                      // Reset rating stars
                      const stars = document.querySelectorAll('[data-rating-star]');
                      stars.forEach(star => {
                        star.classList.remove('fill-yellow-400', 'text-yellow-400');
                        star.classList.add('text-muted-foreground');
                      });
                      // Reset hidden input
                      const ratingInput = document.querySelector('[name="rating"]') as HTMLInputElement;
                      if (ratingInput) ratingInput.value = '3';
                    } else {
                      throw new Error('Resposta inválida do servidor');
                    }
                  } catch (error: any) {
                    console.error('Erro ao enviar feedback:', error);
                    const { toast } = await import('sonner');
                    // Só mostrar erro se realmente houver um problema
                    if (error.message && !error.message.includes('Network Error')) {
                      toast.error('Erro ao enviar sugestão', {
                        description: error.message || 'Tente novamente'
                      });
                    }
                  }
                }}>
                  {/* Rating Stars */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Como você avalia este projeto? *
                    </label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          data-rating-star={star}
                          onClick={(e) => {
                            const stars = document.querySelectorAll('[data-rating-star]');
                            stars.forEach((s, i) => {
                              const starNum = parseInt(s.getAttribute('data-rating-star') || '0');
                              if (starNum <= star) {
                                s.classList.add('text-yellow-400');
                                s.classList.remove('text-muted-foreground');
                              } else {
                                s.classList.remove('text-yellow-400');
                                s.classList.add('text-muted-foreground');
                              }
                            });
                            // Update hidden input
                            const input = document.querySelector('[name="rating"]') as HTMLInputElement;
                            if (input) input.value = star.toString();
                          }}
                          className="transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary rounded text-muted-foreground"
                        >
                          <Star className="w-10 h-10 fill-current" />
                        </button>
                      ))}
                    </div>
                    <input type="hidden" name="rating" value="3" required />
                    <p className="text-xs text-center text-muted-foreground">
                      Clique nas estrelas para avaliar
                    </p>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      O que você sugere que eu estude ou melhore? *
                    </label>
                    <textarea
                      name="message"
                      required
                      placeholder="Ex: Aprofundar em Kubernetes, estudar Rust, melhorar performance, adicionar testes..."
                      className="w-full min-h-[120px] p-4 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>

                  {/* Name (optional) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Seu Nome Completo (opcional)
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Ex: João Silva, Maria Santos..."
                      className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <p className="text-xs text-muted-foreground">
                      Se preferir, pode deixar em branco para permanecer anônimo
                    </p>
                  </div>

                  {/* Quick Topics */}
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Algumas ideias que você pode sugerir:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Microserviços',
                        'GraphQL',
                        'Kubernetes',
                        'Rust/Go',
                        'IA/ML',
                        'System Design',
                        'Soft Skills',
                        'Cloud (AWS/GCP)',
                      ].map((topic) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
                            if (textarea) {
                              textarea.value = textarea.value ? `${textarea.value}, ${topic}` : topic;
                              textarea.focus();
                            }
                          }}
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Enviar Sugestão
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                💡 Também aceito sugestões sobre: tendências do mercado, tecnologias emergentes, 
                melhores práticas, livros, cursos, ou qualquer dica que possa me ajudar a evoluir!
              </p>
              <a href="/feedback" className="text-sm text-primary hover:underline font-medium">
                Ver dashboard completo de feedbacks →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Desenvolvido por Leonardo Rodrigues</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Estudante de desenvolvimento apaixonado por aprender e criar soluções de qualidade.
              Em constante evolução, buscando sempre aplicar as melhores práticas e tecnologias modernas.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {['Clean Architecture', 'DDD', 'SOLID', 'TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Redis', 'Docker', 'CI/CD'].map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm px-4 py-2">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <a href="https://github.com/gomes-leonardo" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  <Github className="w-5 h-5" />
                  GitHub
                </Button>
              </a>
              <a href="https://www.linkedin.com/in/gomess-leonardo/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </Button>
              </a>
              <a href="mailto:leonardo@example.com">
                <Button variant="outline" size="lg" className="gap-2">
                  <Mail className="w-5 h-5" />
                  Contato
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
