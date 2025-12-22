'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllFeedback } from '@/services/feedbackService';
import { Feedback, FeedbackType } from '@/types/feedback';
import { Bug, Lightbulb, Heart, MessageSquare, Star, ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const feedbackTypeIcons = {
  [FeedbackType.BUG]: Bug,
  [FeedbackType.SUGGESTION]: Lightbulb,
  [FeedbackType.COMPLIMENT]: Heart,
  [FeedbackType.OTHER]: MessageSquare,
};

const feedbackTypeColors = {
  [FeedbackType.BUG]: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30' },
  [FeedbackType.SUGGESTION]: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  [FeedbackType.COMPLIMENT]: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  [FeedbackType.OTHER]: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/30' },
};

const feedbackTypeLabels = {
  [FeedbackType.BUG]: 'Bug',
  [FeedbackType.SUGGESTION]: 'Sugestão',
  [FeedbackType.COMPLIMENT]: 'Elogio',
  [FeedbackType.OTHER]: 'Outro',
};

const ITEMS_PER_PAGE = 12;

export default function AllFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [displayedFeedbacks, setDisplayedFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'regular' | 'suggestions'>('all');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest' | 'rating-high' | 'rating-low'>('recent');
  const observerTarget = useRef(null);

  // Função para ordenar feedbacks
  const sortFeedbacks = useCallback((data: Feedback[]) => {
    const sorted = [...data];
    switch (sortOrder) {
      case 'recent':
        return sorted.sort((a, b) => {
          if (!a.created_at) return 1;
          if (!b.created_at) return -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      case 'oldest':
        return sorted.sort((a, b) => {
          if (!a.created_at) return 1;
          if (!b.created_at) return -1;
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
      case 'rating-high':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating-low':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [sortOrder]);

  useEffect(() => {
    loadAllFeedbacks();
  }, []);

  // Atualizar ordenação quando sortOrder mudar
  useEffect(() => {
    if (feedbacks.length > 0) {
      let filtered = filterType === 'suggestions' 
        ? feedbacks.filter(f => f.context === 'about_page_suggestions')
        : filterType === 'regular'
        ? feedbacks.filter(f => f.context !== 'about_page_suggestions')
        : feedbacks;
      
      const sorted = sortFeedbacks(filtered);
      setDisplayedFeedbacks(sorted.slice(0, ITEMS_PER_PAGE));
      setHasMore(sorted.length > ITEMS_PER_PAGE);
    }
  }, [sortOrder, filterType, feedbacks, sortFeedbacks]);

  const loadAllFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await getAllFeedback();
      
      // Ordenar por data (mais recentes primeiro) - padrão
      const sortedData = sortFeedbacks(data);
      
      setFeedbacks(sortedData);
      
      // Separar feedbacks regulares de sugestões do /about
      const regular = sortedData.filter(f => f.context !== 'about_page_suggestions');
      const suggestions = sortedData.filter(f => f.context === 'about_page_suggestions');
      
      // Mostrar todos por padrão, mas separados e ordenados
      let initialData = filterType === 'suggestions' ? suggestions : 
                         filterType === 'regular' ? regular : 
                         sortedData;
      
      setDisplayedFeedbacks(initialData.slice(0, ITEMS_PER_PAGE));
      setHasMore(initialData.length > ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedFeedbacks.length;
      // Filtrar baseado no tipo selecionado
      let filtered = filterType === 'suggestions' 
        ? feedbacks.filter(f => f.context === 'about_page_suggestions')
        : filterType === 'regular'
        ? feedbacks.filter(f => f.context !== 'about_page_suggestions')
        : feedbacks;
      
      // Aplicar ordenação
      filtered = sortFeedbacks(filtered);
      
      const nextBatch = filtered.slice(currentLength, currentLength + ITEMS_PER_PAGE);
      setDisplayedFeedbacks(prev => [...prev, ...nextBatch]);
      setHasMore(currentLength + nextBatch.length < filtered.length);
      setLoadingMore(false);
    }, 500);
  }, [feedbacks, displayedFeedbacks, loadingMore, hasMore, filterType, sortFeedbacks]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/feedback">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Todos os Feedbacks</h1>
                <p className="text-muted-foreground">
                  {feedbacks.length} feedback{feedbacks.length !== 1 ? 's' : ''} recebido{feedbacks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2 mt-4">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilterType('all');
                }}
              >
                Todos ({feedbacks.length})
              </Button>
              <Button
                variant={filterType === 'regular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilterType('regular');
                }}
              >
                Feedbacks ({feedbacks.filter(f => f.context !== 'about_page_suggestions').length})
              </Button>
              <Button
                variant={filterType === 'suggestions' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilterType('suggestions');
                }}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Sugestões ({feedbacks.filter(f => f.context === 'about_page_suggestions').length})
              </Button>
            </div>
            
            {/* Ordenação */}
            <div className="flex items-center gap-2 mt-4">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <Select value={sortOrder} onValueChange={(value: any) => {
                setSortOrder(value);
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais Recentes</SelectItem>
                  <SelectItem value="oldest">Mais Antigos</SelectItem>
                  <SelectItem value="rating-high">Maior Avaliação</SelectItem>
                  <SelectItem value="rating-low">Menor Avaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Feedbacks Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayedFeedbacks.length === 0 ? (
              <Card>
                <CardContent className="p-16 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum feedback ainda</h3>
                  <p className="text-muted-foreground">
                    Seja o primeiro a deixar um feedback!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4">
                  {displayedFeedbacks.map((feedback, index) => {
                    const Icon = feedbackTypeIcons[feedback.type];
                    const colors = feedbackTypeColors[feedback.type];
                    return (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 hover:shadow-xl transition-all group">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-5 h-5 ${colors.text}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div>
                                    <span className="font-semibold text-lg">{feedback.visitor_name}</span>
                                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                                      {feedbackTypeLabels[feedback.type]}
                                    </span>
                                  </div>
                                  <div className="flex gap-0.5 flex-shrink-0">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 ${
                                          star <= feedback.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-muted-foreground'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">
                                  {feedback.created_at && formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true, locale: ptBR })}
                                  {feedback.context && ` • ${feedback.context.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
                                  {feedback.context === 'about_page_suggestions' && (
                                    <Badge variant="outline" className="ml-2 text-xs border-purple-500/30 text-purple-500">
                                      <Lightbulb className="w-3 h-3 mr-1" />
                                      Sugestão de Desenvolvimento
                                    </Badge>
                                  )}
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

                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                {/* Intersection Observer Target */}
                <div ref={observerTarget} className="h-10" />

                {/* End Message */}
                {!hasMore && displayedFeedbacks.length > 0 && (
                  <div className="mt-8 text-center text-muted-foreground">
                    <p>Você viu todos os {feedbacks.length} feedbacks! 🎉</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
