'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, MessageSquare, BarChart3, Clock, Award, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FeedbackData {
  stepId: string;
  value: 'like' | 'dislike';
  justification: string;
  timestamp: string;
}

interface StepStats {
  stepId: string;
  stepTitle: string;
  likes: number;
  dislikes: number;
  total: number;
  satisfaction: number;
  justifications: string[];
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [stats, setStats] = useState<StepStats[]>([]);

  useEffect(() => {
    const savedFeedbacks = JSON.parse(localStorage.getItem('analysis_feedbacks') || '[]');
    setFeedbacks(savedFeedbacks);

    const stepMap = new Map<string, StepStats>();
    
    savedFeedbacks.forEach((feedback: FeedbackData) => {
      if (!stepMap.has(feedback.stepId)) {
        stepMap.set(feedback.stepId, {
          stepId: feedback.stepId,
          stepTitle: getStepTitle(feedback.stepId),
          likes: 0,
          dislikes: 0,
          total: 0,
          satisfaction: 0,
          justifications: [],
        });
      }

      const stat = stepMap.get(feedback.stepId)!;
      stat.total++;
      
      if (feedback.value === 'like') {
        stat.likes++;
      } else {
        stat.dislikes++;
        if (feedback.justification) {
          stat.justifications.push(feedback.justification);
        }
      }

      stat.satisfaction = (stat.likes / stat.total) * 100;
    });

    setStats(Array.from(stepMap.values()).sort((a, b) => b.total - a.total));
  }, []);

  const totalFeedbacks = feedbacks.length;
  const totalLikes = feedbacks.filter(f => f.value === 'like').length;
  const totalDislikes = feedbacks.filter(f => f.value === 'dislike').length;
  const overallSatisfaction = totalFeedbacks > 0 ? (totalLikes / totalFeedbacks) * 100 : 0;

  // Calcular feedbacks por dia
  const feedbacksByDate = feedbacks.reduce((acc, f) => {
    const date = new Date(f.timestamp).toLocaleDateString('pt-BR');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-backgroundSecondary to-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-2">
              ← Voltar ao início
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-textPrimary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Dashboard de Feedbacks
              </h1>
              <p className="text-textSecondary mt-2">
                Análise completa dos feedbacks do Modo Análise
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-subtle rounded-lg border border-primary/20">
              <BarChart3 className="w-5 h-5 text-primary" />
              <div className="text-sm">
                <div className="font-semibold text-textPrimary">{totalFeedbacks}</div>
                <div className="text-textMuted">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary-subtle to-background">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Total de Avaliações
              </CardDescription>
              <CardTitle className="text-4xl font-bold">{totalFeedbacks}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-textMuted">
                {stats.length} passos avaliados
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success bg-gradient-to-br from-success-light to-background">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                Feedbacks Positivos
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-success">{totalLikes}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-backgroundSecondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success transition-all duration-500"
                    style={{ width: `${totalFeedbacks > 0 ? (totalLikes / totalFeedbacks) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-success">
                  {totalFeedbacks > 0 ? ((totalLikes / totalFeedbacks) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive bg-gradient-to-br from-destructive/10 to-background">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <ThumbsDown className="w-4 h-4" />
                Feedbacks Negativos
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-destructive">{totalDislikes}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-backgroundSecondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-destructive transition-all duration-500"
                    style={{ width: `${totalFeedbacks > 0 ? (totalDislikes / totalFeedbacks) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-destructive">
                  {totalFeedbacks > 0 ? ((totalDislikes / totalFeedbacks) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning bg-gradient-to-br from-warning-light to-background">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Satisfação Geral
              </CardDescription>
              <CardTitle className="text-4xl font-bold">{overallSatisfaction.toFixed(1)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                {overallSatisfaction >= 70 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-success font-medium">Excelente</span>
                  </>
                ) : overallSatisfaction >= 50 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-warning" />
                    <span className="text-warning font-medium">Bom</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span className="text-destructive font-medium">Precisa melhorar</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedbacks por Passo</CardTitle>
                <CardDescription>
                  Análise detalhada de cada passo do Modo Análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.length === 0 ? (
                  <div className="text-center py-16 text-textMuted">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">Nenhum feedback registrado ainda</p>
                    <p className="text-sm mt-2">
                      Os feedbacks aparecerão aqui após serem enviados no Modo Análise
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.map((stat, index) => (
                      <div
                        key={stat.stepId}
                        className="group p-5 border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-subtle text-primary font-semibold text-sm">
                                {index + 1}
                              </span>
                              <h4 className="font-semibold text-textPrimary group-hover:text-primary transition-colors">
                                {stat.stepTitle}
                              </h4>
                            </div>
                            <p className="text-sm text-textMuted ml-11">
                              {stat.total} {stat.total === 1 ? 'avaliação' : 'avaliações'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="relative inline-flex items-center justify-center w-20 h-20">
                              {/* Background circle */}
                              <svg className="w-20 h-20 transform -rotate-90">
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="32"
                                  stroke="currentColor"
                                  strokeWidth="6"
                                  fill="none"
                                  className="text-backgroundSecondary"
                                />
                                <circle
                                  cx="40"
                                  cy="40"
                                  r="32"
                                  stroke="currentColor"
                                  strokeWidth="6"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 32}`}
                                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - stat.satisfaction / 100)}`}
                                  className={stat.satisfaction >= 70 ? 'text-success' : stat.satisfaction >= 50 ? 'text-warning' : 'text-destructive'}
                                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-textPrimary">
                                  {stat.satisfaction.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-8 bg-backgroundSecondary rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-success to-success/80 flex items-center justify-start px-3 transition-all duration-500"
                            style={{ width: `${(stat.likes / stat.total) * 100}%` }}
                          >
                            {stat.likes > 0 && (
                              <span className="text-xs font-semibold text-white flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3" />
                                {stat.likes}
                              </span>
                            )}
                          </div>
                          <div
                            className="absolute inset-y-0 right-0 bg-gradient-to-l from-destructive to-destructive/80 flex items-center justify-end px-3 transition-all duration-500"
                            style={{ width: `${(stat.dislikes / stat.total) * 100}%` }}
                          >
                            {stat.dislikes > 0 && (
                              <span className="text-xs font-semibold text-white flex items-center gap-1">
                                {stat.dislikes}
                                <ThumbsDown className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Justifications */}
                        {stat.justifications.length > 0 && (
                          <div className="mt-4 space-y-2 pl-11">
                            <p className="text-sm font-medium text-textSecondary flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-warning" />
                              Sugestões de melhoria:
                            </p>
                            <div className="space-y-2">
                              {stat.justifications.map((just, idx) => (
                                <div
                                  key={idx}
                                  className="text-sm text-textSecondary bg-warning-light/50 p-3 rounded-lg border-l-2 border-warning italic"
                                >
                                  "{just}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Linha do Tempo
                </CardTitle>
                <CardDescription>
                  Histórico cronológico de todos os feedbacks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedbacks.length === 0 ? (
                  <div className="text-center py-16 text-textMuted">
                    <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Nenhum feedback ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((feedback, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            feedback.value === 'like' ? 'bg-success-light text-success' : 'bg-destructive/10 text-destructive'
                          }`}>
                            {feedback.value === 'like' ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown className="w-5 h-5" />}
                          </div>
                          {idx < feedbacks.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-textPrimary">
                              {getStepTitle(feedback.stepId)}
                            </h4>
                            <span className="text-xs text-textMuted">
                              {new Date(feedback.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          {feedback.justification && (
                            <p className="text-sm text-textSecondary bg-backgroundSecondary p-3 rounded-lg mt-2 italic">
                              "{feedback.justification}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {stats.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Melhor passo */}
                  <Card className="border-l-4 border-l-success">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-success">
                        <Award className="w-5 h-5" />
                        Passo Mais Bem Avaliado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-4 bg-success-light rounded-lg">
                        <h4 className="font-semibold text-textPrimary mb-2">
                          {stats.sort((a, b) => b.satisfaction - a.satisfaction)[0].stepTitle}
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="text-3xl font-bold text-success">
                            {stats[0].satisfaction.toFixed(0)}%
                          </div>
                          <div className="text-sm text-textSecondary">
                            de satisfação
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-textSecondary">
                        Este passo está funcionando muito bem! Continue monitorando para manter a qualidade.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Pior passo */}
                  {stats.filter(s => s.dislikes > 0).length > 0 && (
                    <Card className="border-l-4 border-l-warning">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-warning">
                          <AlertTriangle className="w-5 h-5" />
                          Precisa de Atenção
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-4 bg-warning-light rounded-lg">
                          <h4 className="font-semibold text-textPrimary mb-2">
                            {stats.sort((a, b) => a.satisfaction - b.satisfaction)[0].stepTitle}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className="text-3xl font-bold text-warning">
                              {stats.sort((a, b) => a.satisfaction - b.satisfaction)[0].dislikes}
                            </div>
                            <div className="text-sm text-textSecondary">
                              feedback(s) negativo(s)
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-textSecondary">
                          Revise as justificativas e implemente melhorias para aumentar a satisfação.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Recomendação geral */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Recomendação Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-6 bg-gradient-to-r from-primary-subtle to-primary-subtle/50 rounded-lg border border-primary/20">
                      <p className="text-textPrimary leading-relaxed">
                        {overallSatisfaction >= 80 ? (
                          <>
                            <strong className="text-primary">🎉 Excelente trabalho!</strong> O Modo Análise está muito bem avaliado com {overallSatisfaction.toFixed(0)}% de satisfação. 
                            Continue monitorando os feedbacks para manter a qualidade e considere expandir o conteúdo dos passos mais bem avaliados.
                          </>
                        ) : overallSatisfaction >= 60 ? (
                          <>
                            <strong className="text-warning">👍 Bom trabalho!</strong> Há espaço para melhorias com {overallSatisfaction.toFixed(0)}% de satisfação. 
                            Foque nos passos com mais feedbacks negativos e implemente as sugestões fornecidas nas justificativas.
                          </>
                        ) : (
                          <>
                            <strong className="text-destructive">⚠️ Atenção necessária!</strong> Com {overallSatisfaction.toFixed(0)}% de satisfação, é importante revisar urgentemente os passos com baixa avaliação. 
                            Analise as justificativas detalhadamente e priorize as melhorias sugeridas.
                          </>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper para obter título do passo
function getStepTitle(stepId: string): string {
  const titles: Record<string, string> = {
    'intro-landing': 'Introdução ao Projeto',
    'navigate-login': 'Tela de Login',
    'login-email-field': 'Campo de Email (Login)',
    'login-password-field': 'Campo de Senha (Login)',
    'login-submit': 'Autenticação',
    'navigate-register': 'Tela de Cadastro',
    'register-name-field': 'Campo de Nome',
    'register-email-field': 'Campo de Email (Cadastro)',
    'register-password-fields': 'Campos de Senha',
    'email-verification': 'Verificação de Email',
    'analysis-auto-login': 'Auto-login Automático',
    'dashboard-overview': 'Dashboard',
    'create-product': 'Criar Anúncio',
    'image-upload': 'Upload de Imagens',
    'product-listing': 'Listagem de Produtos',
    'product-details': 'Detalhes do Produto',
    'shopping-cart': 'Carrinho de Compras',
    'checkout-process': 'Processo de Checkout',
    'auction-system': 'Sistema de Leilões',
    'realtime-notifications': 'Notificações em Tempo Real',
    'review-system': 'Sistema de Avaliações',
    'advanced-search': 'Busca Avançada',
    'user-messaging': 'Sistema de Mensagens',
    'complete-architecture': 'Arquitetura Completa',
  };

  return titles[stepId] || stepId;
}
