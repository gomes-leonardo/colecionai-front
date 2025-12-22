'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, X } from 'lucide-react';

interface VisitorNameModalProps {
  open: boolean;
  onComplete: (name: string) => void;
  onSkip: () => void;
}

export function VisitorNameModal({ open, onComplete, onSkip }: VisitorNameModalProps) {
  const [visitorName, setVisitorName] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  // Verificar se já tem nome salvo
  useEffect(() => {
    if (open) {
      const savedName = localStorage.getItem('analysis_mode_visitor_name');
      if (savedName) {
        setVisitorName(savedName);
      }
      // Verificar se já foi perguntado antes
      const hasAsked = localStorage.getItem('analysis_mode_asked_name');
      if (hasAsked) {
        setHasInteracted(true);
      }
    }
  }, [open]);

  const handleContinue = () => {
    const trimmedName = visitorName.trim();
    if (trimmedName) {
      localStorage.setItem('analysis_mode_visitor_name', trimmedName);
      console.log('[VisitorNameModal] Nome salvo:', trimmedName);
    } else {
      console.log('[VisitorNameModal] Continuando sem nome (anônimo)');
    }
    localStorage.setItem('analysis_mode_asked_name', 'true');
    onComplete(trimmedName || '');
  };

  const handleSkip = () => {
    localStorage.setItem('analysis_mode_asked_name', 'true');
    onSkip();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal={true}>
      <DialogContent className="sm:max-w-md bg-background border-border z-[200]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold text-textPrimary">
              Como podemos te chamar?
            </DialogTitle>
          </div>
          <DialogDescription className="text-textSecondary text-sm leading-relaxed">
            Seu nome será usado nos feedbacks durante o tour técnico. Você pode pular se preferir permanecer anônimo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="visitor-name" className="text-sm font-medium text-foreground">
              Seu nome completo (opcional)
            </label>
            <Input
              id="visitor-name"
              placeholder="Ex: João Silva, Maria Santos..."
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && visitorName.trim()) {
                  handleContinue();
                }
              }}
              className="h-11"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Se preferir, pode deixar em branco para permanecer anônimo
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="flex-1"
            >
              Pular
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1"
              variant="primary"
            >
              {visitorName.trim() ? 'Continuar' : 'Continuar sem nome'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
