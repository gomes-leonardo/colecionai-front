'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedbackButtonsProps {
  onFeedback?: (type: 'like' | 'dislike') => void;
  className?: string;
}

const FEEDBACK_KEY = 'colecionai_onboarding_feedback';

/**
 * Componente de feedback para o onboarding
 * Permite que o usuário dê like ou dislike
 */
export function FeedbackButtons({ onFeedback, className }: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(FEEDBACK_KEY);
    return stored as 'like' | 'dislike' | null;
  });

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    localStorage.setItem(FEEDBACK_KEY, type);
    if (onFeedback) {
      onFeedback(type);
    }
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <p className="text-sm font-medium text-textSecondary">O que achou do tour?</p>
      <div className="flex gap-2">
        <Button
          variant={feedback === 'like' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFeedback('like')}
          className={cn(
            'gap-2 transition-all',
            feedback === 'like' && 'bg-success hover:bg-success/90'
          )}
        >
          <ThumbsUp className="w-4 h-4" />
          Gostei
        </Button>
        <Button
          variant={feedback === 'dislike' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFeedback('dislike')}
          className={cn(
            'gap-2 transition-all',
            feedback === 'dislike' && 'bg-destructive hover:bg-destructive/90'
          )}
        >
          <ThumbsDown className="w-4 h-4" />
          Não gostei
        </Button>
      </div>
    </div>
  );
}
