'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from 'lucide-react';

interface IdentificationModalProps {
  onComplete: (name: string) => void;
}

export function IdentificationModal({ onComplete }: IdentificationModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  // Notificar quando modal abre/fecha para comprimir HUD
  useEffect(() => {
    if (open) {
      document.body.setAttribute('data-identification-modal-open', 'true');
    } else {
      document.body.removeAttribute('data-identification-modal-open');
    }
    return () => {
      document.body.removeAttribute('data-identification-modal-open');
    };
  }, [open]);

  useEffect(() => {
    // Verifica se já perguntou antes
    const hasAsked = localStorage.getItem('analysis_mode_asked_name');
    const savedName = localStorage.getItem('analysis_mode_visitor_name');
    
    if (!hasAsked) {
      // Pequeno delay para não aparecer instantaneamente
      const timer = setTimeout(() => {
        setOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    } else if (savedName) {
      // Se já tem nome salvo, usar direto
      onComplete(savedName);
    } else {
      // Se já perguntou mas não tem nome, completar sem nome
      onComplete('');
    }
  }, [onComplete]);

  const handleSkip = () => {
    localStorage.setItem('analysis_mode_asked_name', 'true');
    setOpen(false);
    onComplete('');
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    localStorage.setItem('analysis_mode_asked_name', 'true');
    if (trimmedName) {
      localStorage.setItem('analysis_mode_visitor_name', trimmedName);
    }
    setOpen(false);
    onComplete(trimmedName);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Não permitir fechar sem escolher (pular ou continuar)
        const hasAsked = localStorage.getItem('analysis_mode_asked_name');
        if (!isOpen && !hasAsked) {
          // Bloquear fechamento até escolher
          return;
        }
        setOpen(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md z-[200]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Quer se identificar?</DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed">
            Durante o modo análise, você poderá dar feedbacks. Se quiser, deixe seu nome para tornar seus comentários mais pessoais.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Input
            placeholder="Seu nome (opcional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
            className="h-11"
            autoFocus
            disabled={false}
            readOnly={false}
          />

          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="flex-1"
            >
              Pular
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
            >
              {name.trim() ? 'Continuar' : 'Continuar sem nome'}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Você pode mudar isso depois a qualquer momento
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
