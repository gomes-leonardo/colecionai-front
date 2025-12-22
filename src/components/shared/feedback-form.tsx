'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FeedbackType } from '@/types/feedback';
import { createFeedback } from '@/services/feedbackService';
import { toast } from 'sonner';
import { Bug, Lightbulb, Heart, MessageSquare, Star, Loader2 } from 'lucide-react';

interface FeedbackFormProps {
  context?: string;
  onSuccess?: () => void;
  defaultVisitorName?: string;
}

const feedbackTypeIcons = {
  [FeedbackType.BUG]: Bug,
  [FeedbackType.SUGGESTION]: Lightbulb,
  [FeedbackType.COMPLIMENT]: Heart,
  [FeedbackType.OTHER]: MessageSquare,
};

const feedbackTypeLabels = {
  [FeedbackType.BUG]: 'Reportar Bug',
  [FeedbackType.SUGGESTION]: 'Sugestão',
  [FeedbackType.COMPLIMENT]: 'Elogio',
  [FeedbackType.OTHER]: 'Outro',
};

const feedbackTypeDescriptions = {
  [FeedbackType.BUG]: 'Algo não está funcionando corretamente',
  [FeedbackType.SUGGESTION]: 'Tenho uma ideia para melhorar',
  [FeedbackType.COMPLIMENT]: 'Gostei de algo específico',
  [FeedbackType.OTHER]: 'Outro tipo de feedback',
};

export function FeedbackForm({ 
  context = 'general', 
  onSuccess,
  defaultVisitorName = 'Visitante Anônimo'
}: FeedbackFormProps) {
  const [type, setType] = useState<FeedbackType>(FeedbackType.SUGGESTION);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(3);
  const [visitorName, setVisitorName] = useState(defaultVisitorName);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Por favor, escreva sua mensagem');
      return;
    }

    try {
      setSubmitting(true);
      await createFeedback({
        type,
        message: message.trim(),
        rating,
        visitor_name: visitorName.trim() || defaultVisitorName,
        context
      });

      toast.success('Feedback enviado com sucesso!', {
        description: 'Obrigado por nos ajudar a melhorar!'
      });

      // Reset form
      setMessage('');
      setRating(3);
      setVisitorName(defaultVisitorName);
      
      onSuccess?.();
    } catch (error: any) {
      toast.error('Erro ao enviar feedback', {
        description: error.message || 'Tente novamente'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Enviar Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Feedback */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Feedback</Label>
            <Select value={type} onValueChange={(value) => setType(value as FeedbackType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FeedbackType).map((feedbackType) => {
                  const Icon = feedbackTypeIcons[feedbackType];
                  return (
                    <SelectItem key={feedbackType} value={feedbackType}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{feedbackTypeLabels[feedbackType]}</div>
                          <div className="text-xs text-muted-foreground">
                            {feedbackTypeDescriptions[feedbackType]}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Avaliação */}
          <div className="space-y-2">
            <Label>Avaliação Geral</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {rating === 1 && 'Muito insatisfeito'}
              {rating === 2 && 'Insatisfeito'}
              {rating === 3 && 'Neutro'}
              {rating === 4 && 'Satisfeito'}
              {rating === 5 && 'Muito satisfeito'}
            </p>
          </div>

          {/* Mensagem */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Conte-nos mais sobre sua experiência..."
              rows={4}
              required
            />
          </div>

          {/* Nome (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="visitorName">Seu Nome (opcional)</Label>
            <Input
              id="visitorName"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="Como podemos te chamar?"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !message.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Feedback'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
