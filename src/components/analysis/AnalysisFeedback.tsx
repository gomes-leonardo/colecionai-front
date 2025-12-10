'use client';

import { ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAnalysisMode } from '@/contexts/AnalysisModeContext';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AnalysisFeedback() {
  const { submitFeedback, currentStep } = useAnalysisMode();
  const [selectedFeedback, setSelectedFeedback] = useState<'like' | 'dislike' | 'can-improve' | null>(null);
  const [showJustification, setShowJustification] = useState(false);
  const [justification, setJustification] = useState('');

  // Reset feedback quando mudar de passo
  useEffect(() => {
    setSelectedFeedback(null);
    setShowJustification(false);
    setJustification('');
  }, [currentStep?.id]);

  const handleFeedback = async (value: 'like' | 'dislike' | 'can-improve') => {
    setSelectedFeedback(value);
    
    if (value === 'dislike' || value === 'can-improve') {
      setShowJustification(true);
    } else {
      await submitFeedback(value, '');
    }
  };

  const handleSubmitJustification = async () => {
    if (selectedFeedback) {
      await submitFeedback(selectedFeedback, justification);
      setShowJustification(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <p className="text-sm text-textSecondary">
          A implementação deste passo está bem feita?
        </p>
        <p className="text-xs text-textMuted">
          Avalie a qualidade técnica, clareza das explicações e utilidade das informações.
        </p>
        
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={selectedFeedback === 'like' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFeedback('like')}
                disabled={selectedFeedback !== null}
                className="flex-1"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Sim
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Gostei muito da implementação</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={selectedFeedback === 'can-improve' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFeedback('can-improve')}
                disabled={selectedFeedback !== null}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Pode melhorar
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>A implementação está boa, mas pode ser aprimorada</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={selectedFeedback === 'dislike' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleFeedback('dislike')}
                disabled={selectedFeedback !== null}
                className="flex-1"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Não
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Não gostei da implementação</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {showJustification && (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            <label className="text-sm text-textSecondary">
              {selectedFeedback === 'can-improve' 
                ? 'O que pode ser melhorado? (opcional)'
                : 'O que poderia ser melhorado? (opcional)'}
            </label>
            <Textarea
              placeholder="Compartilhe suas sugestões de melhoria..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="min-h-[80px] text-sm"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitJustification}
              className="w-full"
            >
              Enviar Feedback
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
