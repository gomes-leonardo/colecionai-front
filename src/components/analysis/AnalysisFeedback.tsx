'use client';

import { Star, Loader2, Send, ThumbsUp, ThumbsDown, MessageCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAnalysisMode } from '@/contexts/AnalysisModeContext';
import { createFeedback } from '@/services/feedbackService';
import { FeedbackType } from '@/types/feedback';
import { toast } from 'sonner';

export function AnalysisFeedback() {
  const { currentStep } = useAnalysisMode();
  const [rating, setRating] = useState<number>(0);
  const [quickFeedback, setQuickFeedback] = useState<'like' | 'dislike' | 'can-improve' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Começar colapsado

  // Reset quando mudar de passo
  useEffect(() => {
    setRating(0);
    setQuickFeedback(null);
    setComment('');
    setIsSubmitting(false);
    setIsCollapsed(true); // Recolher ao mudar de passo
  }, [currentStep?.id]);

  // Quando seleciona like/dislike/pode melhorar, ajusta rating automaticamente
  useEffect(() => {
    if (quickFeedback === 'like') {
      setRating(5);
    } else if (quickFeedback === 'dislike') {
      setRating(1);
    } else if (quickFeedback === 'can-improve') {
      setRating(3);
    }
  }, [quickFeedback]);

  const handleSubmit = async () => {
    if (!currentStep) return;
    
    // Se não deu rating nem quick feedback, não permite enviar
    if (rating === 0 && !quickFeedback) {
      toast.warning('Avalie este passo', {
        description: 'Selecione uma avaliação antes de enviar.'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Mapear para tipo de feedback
      let type: FeedbackType;
      let finalRating = rating;
      let message: string;

      if (quickFeedback === 'like' || rating >= 4) {
        type = FeedbackType.COMPLIMENT;
        finalRating = rating || 5;
        message = comment.trim() || 'Passo útil e bem explicado';
      } else if (quickFeedback === 'can-improve' || rating === 3) {
        type = FeedbackType.SUGGESTION;
        finalRating = rating || 3;
        message = comment.trim() || 'Passo pode ser melhorado';
      } else {
        type = FeedbackType.BUG;
        finalRating = rating || 1;
        message = comment.trim() || `Avaliação: ${finalRating} estrelas`;
      }

      // Buscar nome do visitante do localStorage - GARANTIR QUE ESTÁ SENDO USADO
      const visitorName = localStorage.getItem('analysis_mode_visitor_name') || 'Visitante Anônimo';
      
      // Log para debug - garantir que o nome está sendo usado
      console.log('[AnalysisFeedback] Enviando feedback com visitor_name:', visitorName);
      
      await createFeedback({
        type,
        message,
        rating: finalRating,
        visitor_name: visitorName,
        context: currentStep.id
      });

      toast.success('Obrigado! 🙏', {
        description: 'Seu feedback melhora a qualidade do conteúdo.'
      });

      // Reset
      setRating(0);
      setQuickFeedback(null);
      setComment('');
      setIsCollapsed(true); // Recolher após envio

      // NÃO avançar automaticamente - deixar usuário controlar
    } catch (error: any) {
      toast.error('Erro ao enviar', {
        description: 'Tente novamente'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-backgroundSecondary/30">
      {/* Header colapsável */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-backgroundSecondary/50 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Feedback (opcional)
          </span>
          {(rating > 0 || quickFeedback || comment.trim()) && (
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          )}
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Conteúdo (oculto quando colapsado) */}
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
          <div className="text-center space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Avalie este passo
            </h3>
            <p className="text-xs text-muted-foreground">
              Seu feedback ajuda a melhorar o conteúdo
            </p>
          </div>

          {/* Botões Rápidos - Like/Dislike/Pode Melhorar */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={quickFeedback === 'like' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setQuickFeedback('like');
                setRating(5);
              }}
              disabled={isSubmitting}
              className="flex-1 max-w-[100px] text-xs"
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              Gostei
            </Button>
            <Button
              variant={quickFeedback === 'can-improve' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setQuickFeedback('can-improve');
                setRating(3);
              }}
              disabled={isSubmitting}
              className="flex-1 max-w-[100px] text-xs"
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Melhorar
            </Button>
            <Button
              variant={quickFeedback === 'dislike' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setQuickFeedback('dislike');
                setRating(1);
              }}
              disabled={isSubmitting}
              className="flex-1 max-w-[100px] text-xs"
            >
              <ThumbsDown className="w-3 h-3 mr-1" />
              Não gostei
            </Button>
          </div>

          {/* Rating Stars - 0 a 5 (ajustável mesmo com quick feedback) */}
          <div className="space-y-2">
            <p className="text-xs text-center text-muted-foreground">
              Ou ajuste a nota de 0 a 5 estrelas:
            </p>
            <div className="flex items-center justify-center gap-1">
              {/* Botão "0" para nenhuma estrela */}
              <button
                type="button"
                onClick={() => {
                  setRating(0);
                  setQuickFeedback(null);
                }}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                  rating === 0
                    ? 'bg-destructive/20 text-destructive border-2 border-destructive'
                    : 'bg-muted text-muted-foreground border-2 border-transparent hover:bg-muted/80'
                }`}
                disabled={isSubmitting}
              >
                0
              </button>
              
              {/* Estrelas 1-5 */}
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                    // Ajustar quick feedback baseado na estrela
                    if (star >= 4) setQuickFeedback('like');
                    else if (star === 3) setQuickFeedback('can-improve');
                    else if (star <= 2) setQuickFeedback('dislike');
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      const stars = e.currentTarget.parentElement?.querySelectorAll('button[data-star]');
                      stars?.forEach((s) => {
                        const starNum = parseInt(s.getAttribute('data-star') || '0');
                        if (starNum <= star && starNum > 0) {
                          s.classList.add('text-yellow-400');
                          s.classList.remove('text-muted-foreground');
                        }
                      });
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      const stars = e.currentTarget.parentElement?.querySelectorAll('button[data-star]');
                      stars?.forEach((s) => {
                        const starNum = parseInt(s.getAttribute('data-star') || '0');
                        if (starNum > rating) {
                          s.classList.remove('text-yellow-400');
                          s.classList.add('text-muted-foreground');
                        }
                      });
                    }
                  }}
                  data-star={star}
                  className={`transition-all p-1.5 ${
                    rating >= star
                      ? 'text-yellow-400 scale-110'
                      : 'text-muted-foreground hover:scale-105'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={isSubmitting}
                >
                  <Star className={`w-5 h-5 ${rating >= star ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Comentário opcional */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Comentário (opcional)
            </label>
            <textarea
              placeholder="O que você achou deste passo?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[50px] p-2 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
              disabled={isSubmitting}
            />
          </div>

          {/* Botão de envio */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (rating === 0 && !quickFeedback)}
            className="w-full"
            size="sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Feedback
              </>
            )}
          </Button>

          {(rating === 0 && !quickFeedback) && (
            <p className="text-xs text-center text-muted-foreground">
              Selecione uma avaliação para enviar
            </p>
          )}
        </div>
      )}
    </div>
  );
}
