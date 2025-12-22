'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllFeedback } from '@/services/feedbackService';
import { Feedback, FeedbackType } from '@/types/feedback';
import { 
  Bug, Lightbulb, Heart, MessageSquare, Star, TrendingUp,
  Users, BarChart3, Sparkles, Award, Target, Zap, Calendar,
  Activity, TrendingDown, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { formatDistanceToNow, format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Legend, LineChart, Line, AreaChart, 
  Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const feedbackTypeIcons = {
  [FeedbackType.BUG]: Bug,
  [FeedbackType.SUGGESTION]: Lightbulb,
  [FeedbackType.COMPLIMENT]: Heart,
  [FeedbackType.OTHER]: MessageSquare,
};

const feedbackTypeColors = {
  [FeedbackType.BUG]: { bg: 'bg-red-500/10', text: 'text-red-500', hex: '#ef4444' },
  [FeedbackType.SUGGESTION]: { bg: 'bg-blue-500/10', text: 'text-blue-500', hex: '#3b82f6' },
  [FeedbackType.COMPLIMENT]: { bg: 'bg-green-500/10', text: 'text-green-500', hex: '#22c55e' },
  [FeedbackType.OTHER]: { bg: 'bg-gray-500/10', text: 'text-gray-500', hex: '#6b7280' },
};

const feedbackTypeLabels = {
  [FeedbackType.BUG]: 'Bugs',
  [FeedbackType.SUGGESTION]: 'Sugestões',
  [FeedbackType.COMPLIMENT]: 'Elogios',
  [FeedbackType.OTHER]: 'Outros',
};

function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      const data = await getAllFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Separar feedbacks normais de sugestões do /about e ordenar por data (mais recentes primeiro)
  const regularFeedbacks = useMemo(() => 
    feedbacks
      .filter(f => f.context !== 'about_page_suggestions')
      .sort((a, b) => {
        if (!a.created_at) return 1;
        if (!b.created_at) return -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [feedbacks]
  );

  const aboutSuggestions = useMemo(() => 
    feedbacks
      .filter(f => f.context === 'about_page_suggestions')
      .sort((a, b) => {
        if (!a.created_at) return 1;
        if (!b.created_at) return -1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [feedbacks]
  );

  const totalFeedbacks = regularFeedbacks.length;
  const averageRating = regularFeedbacks.length > 0
    ? regularFeedbacks.reduce((sum, f) => sum + f.rating, 0) / regularFeedbacks.length
    : 0;
  
  const typeDistribution = Object.values(FeedbackType).map(type => ({
    name: feedbackTypeLabels[type],
    value: regularFeedbacks.filter(f => f.type === type).length,
    color: feedbackTypeColors[type].hex
  })).filter(item => item.value > 0);

  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating}★`,
    count: regularFeedbacks.filter(f => f.rating === rating).length
  }));

  // Dados temporais para gráfico de linha
  const timelineData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        feedbacks: 0,
        rating: 0,
        count: 0
      };
    });

    regularFeedbacks.forEach(feedback => {
      if (feedback.created_at) {
        try {
          const feedbackDate = typeof feedback.created_at === 'string' 
            ? parseISO(feedback.created_at) 
            : new Date(feedback.created_at);
          
          if (isNaN(feedbackDate.getTime())) {
            return; // Data inválida, pular este feedback
          }
          
          const daysAgo = Math.floor((Date.now() - feedbackDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysAgo >= 0 && daysAgo < 30) {
            const index = 29 - daysAgo;
            if (last30Days[index]) {
              last30Days[index].feedbacks += 1;
              last30Days[index].rating += feedback.rating;
              last30Days[index].count += 1;
            }
          }
        } catch (e) {
          // Ignorar erros de parsing de data
          console.warn('Erro ao processar data do feedback:', feedback.created_at, e);
        }
      }
    });

    return last30Days.map(day => ({
      ...day,
      rating: day.count > 0 ? (day.rating / day.count).toFixed(1) : 0
    }));
  }, [regularFeedbacks]);

  // Dados para gráfico de radar
  const radarData = useMemo(() => {
    const ratings = [1, 2, 3, 4, 5];
    return ratings.map(rating => ({
      rating: `${rating}★`,
      quantidade: regularFeedbacks.filter(f => f.rating === rating).length,
      fullMark: regularFeedbacks.length
    }));
  }, [regularFeedbacks]);

  // Análise de tendência
  const trendAnalysis = useMemo(() => {
    if (regularFeedbacks.length < 2) return { trend: 'neutral', percentage: 0 };
    
    const recent = regularFeedbacks
      .filter(f => f.created_at)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(0, Math.floor(regularFeedbacks.length / 2));
    
    const older = regularFeedbacks
      .filter(f => f.created_at)
      .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
      .slice(Math.floor(regularFeedbacks.length / 2));

    const recentAvg = recent.length > 0 
      ? recent.reduce((sum, f) => sum + f.rating, 0) / recent.length 
      : 0;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, f) => sum + f.rating, 0) / older.length 
      : 0;

    const diff = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      trend: diff > 5 ? 'up' : diff < -5 ? 'down' : 'neutral',
      percentage: Math.abs(diff)
    };
  }, [regularFeedbacks]);

  // Distribuição por contexto
  const contextDistribution = useMemo(() => {
    const contexts = regularFeedbacks.reduce((acc, f) => {
      const ctx = f.context || 'outros';
      acc[ctx] = (acc[ctx] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(contexts).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value
    }));
  }, [regularFeedbacks]);

  const sentimentScore = averageRating * 20;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Hero */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto text-center">
            <Badge className="mb-4 bg-gradient-to-r from-primary to-secondary text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Dashboard de Insights Avançado
            </Badge>
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Engajamento e Evolução
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Veja como este projeto está crescendo através dos feedbacks recebidos. Cada gráfico mostra o engajamento real da comunidade e como estou evoluindo com base nas sugestões.
            </p>
          </motion.div>
        </div>
      </section>

      {/* KPIs Avançados */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto mb-8">
            <h2 className="text-2xl font-bold mb-2 text-center">Métricas de Engajamento</h2>
            <p className="text-center text-muted-foreground">
              Números que mostram o interesse e participação da comunidade
            </p>
          </div>
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { 
                icon: MessageSquare, 
                label: 'Total de Feedbacks', 
                description: 'Pessoas que compartilharam opiniões',
                value: totalFeedbacks, 
                color: 'from-blue-500 to-cyan-500',
                trend: trendAnalysis.trend === 'up' ? <ArrowUp className="w-4 h-4 text-green-500" /> : 
                       trendAnalysis.trend === 'down' ? <ArrowDown className="w-4 h-4 text-red-500" /> : 
                       <Minus className="w-4 h-4 text-gray-500" />
              },
              { 
                icon: Star, 
                label: 'Avaliação Média', 
                description: 'Nota geral do projeto',
                value: averageRating.toFixed(1), 
                suffix: '/5', 
                color: 'from-yellow-500 to-orange-500' 
              },
              { 
                icon: Lightbulb, 
                label: 'Sugestões Recebidas', 
                description: 'Ideias para melhorias',
                value: regularFeedbacks.filter(f => f.type === FeedbackType.SUGGESTION).length, 
                color: 'from-purple-500 to-pink-500' 
              },
              { 
                icon: Heart, 
                label: 'Elogios', 
                description: 'Agradecimentos e reconhecimentos',
                value: regularFeedbacks.filter(f => f.type === FeedbackType.COMPLIMENT).length, 
                color: 'from-green-500 to-emerald-500' 
              },
            ].map((metric) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                        <metric.icon className="w-6 h-6 text-white" />
                      </div>
                      {metric.trend}
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      <AnimatedCounter end={typeof metric.value === 'number' ? metric.value : parseFloat(metric.value)} suffix={metric.suffix || ''} />
                    </div>
                    <div className="text-sm font-semibold mt-2">{metric.label}</div>
                    {metric.description && (
                      <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gráficos Avançados */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Análise Visual do Engajamento</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Gráficos que mostram como o projeto está evoluindo e recebendo feedbacks ao longo do tempo
              </p>
            </div>
            
            {/* Primeira linha: Pie Chart e Radar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Tipos de Feedback Recebidos
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Veja quantos feedbacks de cada tipo foram recebidos. Mostra o equilíbrio entre sugestões, elogios e problemas reportados.
                    </p>
                  </CardHeader>
                  <CardContent>
                    {typeDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <defs>
                            <linearGradient id="gradBug" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="gradSuggestion" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="gradCompliment" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22c55e" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#16a34a" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="gradOther" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6b7280" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#4b5563" stopOpacity={0.8}/>
                            </linearGradient>
                            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3"/>
                            </filter>
                          </defs>
                          <Pie 
                            data={typeDistribution.map(item => ({
                              ...item,
                              fill: item.name === 'Bugs' ? 'url(#gradBug)' :
                                    item.name === 'Sugestões' ? 'url(#gradSuggestion)' :
                                    item.name === 'Elogios' ? 'url(#gradCompliment)' :
                                    'url(#gradOther)'
                            }))}
                            cx="50%" 
                            cy="50%" 
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
                              if (!midAngle) return null;
                              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                              const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                              const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                              return (
                                <text 
                                  x={x} 
                                  y={y} 
                                  fill="white" 
                                  textAnchor={x > cx ? 'start' : 'end'} 
                                  dominantBaseline="central"
                                  className="font-bold text-sm drop-shadow-lg"
                                >
                                  {`${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                                </text>
                              );
                            }}
                            outerRadius={120}
                            innerRadius={70}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1500}
                            paddingAngle={3}
                            filter="url(#shadow)"
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(0,0,0,0.95)',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                              color: 'white'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                        Aguardando feedbacks...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Distribuição de Avaliações
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Visualização em radar mostrando quantas avaliações de cada nota (1 a 5 estrelas) foram recebidas.
                    </p>
                  </CardHeader>
                  <CardContent>
                    {regularFeedbacks.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#888" opacity={0.3} />
                          <PolarAngleAxis 
                            dataKey="rating" 
                            tick={{ fill: '#888', fontSize: 12 }}
                          />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 'dataMax']}
                            tick={{ fill: '#888', fontSize: 10 }}
                          />
                          <Radar
                            name="Feedbacks"
                            dataKey="quantidade"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                            animationDuration={1500}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(0,0,0,0.95)',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                              color: 'white'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                        Aguardando feedbacks...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Segunda linha: Timeline e Rating Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Crescimento do Engajamento
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Quantidade de feedbacks recebidos por dia nos últimos 30 dias. Mostra se o projeto está ganhando mais atenção ao longo do tempo.
                    </p>
                  </CardHeader>
                  <CardContent>
                    {regularFeedbacks.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorFeedbacks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fill: '#888', fontSize: 11 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis tick={{ fill: '#888', fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(0,0,0,0.95)',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                              color: 'white'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="feedbacks" 
                            stroke="#3b82f6" 
                            fillOpacity={1} 
                            fill="url(#colorFeedbacks)"
                            animationDuration={1500}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                        Aguardando feedbacks...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Quantidade por Nota
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Barras mostrando quantas pessoas deram cada nota (de 1 a 5 estrelas). Quanto maior a barra, mais pessoas deram aquela nota.
                    </p>
                  </CardHeader>
                  <CardContent>
                    {regularFeedbacks.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={ratingDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <defs>
                            <linearGradient id="colorRatingBar" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#d97706" stopOpacity={0.7}/>
                            </linearGradient>
                            <filter id="barShadow" x="-50%" y="-50%" width="200%" height="200%">
                              <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.2"/>
                            </filter>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#888" vertical={false} />
                          <XAxis 
                            dataKey="rating" 
                            tick={{ fill: '#888', fontSize: 12 }}
                            axisLine={{ stroke: '#888', strokeWidth: 2 }}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fill: '#888', fontSize: 12 }}
                            axisLine={{ stroke: '#888', strokeWidth: 2 }}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(0,0,0,0.95)',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                              color: 'white'
                            }}
                            cursor={{ fill: 'rgba(59, 130, 246, 0.1)', radius: 8 }}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="url(#colorRatingBar)" 
                            radius={[12, 12, 0, 0]}
                            animationDuration={1500}
                            filter="url(#barShadow)"
                            maxBarSize={80}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                        Aguardando feedbacks...
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Terceira linha: Gráfico de linha com rating médio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Evolução da Satisfação
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Linha mostrando a média de avaliações ao longo do tempo. Se a linha sobe, significa que as avaliações estão melhorando. Se desce, pode indicar áreas que precisam de atenção.
                  </p>
                </CardHeader>
                <CardContent>
                  {regularFeedbacks.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={timelineData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#888', fontSize: 11 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          domain={[0, 5]}
                          tick={{ fill: '#888', fontSize: 11 }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
                            color: 'white'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rating" 
                          stroke="#22c55e" 
                          strokeWidth={3}
                          dot={{ fill: '#22c55e', r: 5 }}
                          activeDot={{ r: 8 }}
                          animationDuration={1500}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                      Aguardando feedbacks...
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Seção de Sugestões do /about */}
      {aboutSuggestions.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Sugestões de Desenvolvimento
                </Badge>
                <h2 className="text-4xl font-bold mb-4">Sugestões da Página Sobre</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Feedbacks específicos sobre tecnologias, práticas e áreas de estudo sugeridas pelos visitantes
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aboutSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card/80 backdrop-blur-sm border-2 border-purple-500/30 hover:border-purple-500/50 hover:shadow-xl transition-all h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-purple-500/10">
                            <Lightbulb className="w-5 h-5 text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-lg">{suggestion.visitor_name || 'Anônimo'}</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`w-4 h-4 ${
                                      star <= suggestion.rating 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-muted-foreground'
                                    }`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              {suggestion.created_at && formatDistanceToNow(new Date(suggestion.created_at), { addSuffix: true, locale: ptBR })}
                            </p>
                            <p className="text-sm leading-relaxed">{suggestion.message}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* For Recruiters */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-10">
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-secondary">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-4">Para Recrutadores 👔</h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    Este dashboard demonstra minhas habilidades em:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: BarChart3, text: 'Data Visualization Avançada (Recharts)' },
                      { icon: Sparkles, text: 'Animações Premium com Framer Motion' },
                      { icon: Target, text: 'UX/UI de Alto Nível' },
                      { icon: Zap, text: 'Performance Otimizada' },
                      { icon: Award, text: 'Design System Consistente' },
                      { icon: TrendingUp, text: 'Análise de Dados em Tempo Real' },
                      { icon: Activity, text: 'Métricas e KPIs Profissionais' },
                      { icon: Calendar, text: 'Visualizações Temporais' },
                    ].map((skill) => (
                      <div key={skill.text} className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <skill.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{skill.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Feedbacks */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Feedbacks Recentes</h2>
              <Link href="/feedback/all">
                <Button variant="outline" className="gap-2">
                  Ver Todos
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {regularFeedbacks.length}
                  </span>
                </Button>
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
                ))}
              </div>
            ) : regularFeedbacks.length === 0 ? (
              <Card>
                <CardContent className="p-16 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Aguardando Feedbacks</h3>
                  <p className="text-muted-foreground mb-6">Seja o primeiro a deixar um feedback!</p>
                  <Link href="/about">
                    <Button size="lg" className="gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Enviar Feedback
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regularFeedbacks.slice(0, 6).map((feedback, index) => {
                  const Icon = feedbackTypeIcons[feedback.type];
                  const colors = feedbackTypeColors[feedback.type];
                  return (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 hover:shadow-xl transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${colors.bg}`}>
                              <Icon className={`w-5 h-5 ${colors.text}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-lg">{feedback.visitor_name || 'Anônimo'}</span>
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={`w-4 h-4 ${star <= feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mb-3">
                                {feedback.created_at && formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: ptBR })}
                                {feedback.context && ` • ${feedback.context.replace(/_/g, ' ')}`}
                              </p>
                              <p className="text-sm leading-relaxed">{feedback.message}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Quer deixar seu feedback?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Sua opinião é muito importante para minha evolução!
            </p>
            <Link href="/about">
              <Button size="lg" className="gap-2 text-lg px-8 py-6">
                <MessageSquare className="w-6 h-6" />
                Enviar Feedback
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
