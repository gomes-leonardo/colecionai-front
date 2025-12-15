'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Lock, Trash2, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuctionRulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuctionRulesModal({ open, onOpenChange }: AuctionRulesModalProps) {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const handleContinue = () => {
    if (accepted) {
      onOpenChange(false);
      router.push('/auctions/create');
    }
  };

  const handleCancel = () => {
    setAccepted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Regras Importantes do Leilão
          </DialogTitle>
          <DialogDescription>
            Leia atentamente antes de criar seu leilão
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Regra de Edição */}
          <div className="p-4 rounded-lg border border-border/50 bg-muted/30 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Edit3 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-2">Edição de Leilão</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>Sem lances:</strong> Você pode editar livremente</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Com lances:</strong> Edição bloqueada para evitar fraudes</span>
                  </li>
                </ul>
                <div className="mt-3 p-3 rounded bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Exemplo de fraude:</strong> Alguém dá lance de R$ 500 em um iPhone e o vendedor edita para "Foto de um iPhone". Isso seria golpe!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Regra de Exclusão */}
          <div className="p-4 rounded-lg border border-border/50 bg-muted/30 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-2">Exclusão de Leilão</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-green-500 font-bold">✓</span>
                    <span><strong>Sem lances:</strong> Pode excluir (erro de cadastro)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-500 font-bold">✗</span>
                    <span><strong>Com lances:</strong> Exclusão bloqueada (existe expectativa de venda)</span>
                  </li>
                </ul>
                <div className="mt-3 p-3 rounded bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    <strong>Importante:</strong> Leilões com lances ficam registrados no histórico para transparência.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Duração */}
          <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-2">Duração do Leilão</h3>
                <p className="text-sm text-muted-foreground">
                  Todos os leilões têm duração máxima de <strong>48 horas (2 dias)</strong> a partir da criação.
                </p>
              </div>
            </div>
          </div>

          {/* Confirmação */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <Checkbox
              id="accept-rules"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="accept-rules"
              className="text-sm font-medium leading-relaxed cursor-pointer"
            >
              Li e estou ciente das regras acima. Entendo que não poderei editar ou excluir o leilão após receber lances.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleContinue} disabled={!accepted}>
            Continuar para Criar Leilão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
