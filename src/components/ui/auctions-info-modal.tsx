'use client';

import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gavel, Clock, TrendingUp, Shield, Zap, ArrowRight } from 'lucide-react';

interface AuctionsInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuctionsInfoModal({
  open,
  onOpenChange,
}: AuctionsInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-500/10">
              <Gavel className="w-6 h-6 text-amber-500" />
            </div>
            <DialogTitle className="text-2xl">Como Funcionam os Leilões</DialogTitle>
          </div>
          <DialogDescription className="text-textSecondary text-base">
            Sistema de leilões para itens raros e colecionáveis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Em Desenvolvimento
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
              Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
            </p>
          </div>

          {/* Como Funciona */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Como Funcionará:</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Lances em Tempo Real</h4>
                  <p className="text-sm text-textSecondary">
                    Compradores podem dar lances em tempo real. Cada lance deve ser maior que o lance atual.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Tempo de Extensão</h4>
                  <p className="text-sm text-textSecondary">
                    Se um lance for feito nos últimos 2 minutos, o leilão é automaticamente estendido em 5 minutos.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Notificações em Tempo Real</h4>
                  <p className="text-sm text-textSecondary">
                    Você receberá notificações quando alguém fizer um lance maior que o seu, permitindo que você contra-lance.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Proteção ao Comprador</h4>
                  <p className="text-sm text-textSecondary">
                    Sistema seguro de pagamento e proteção garantida para todas as transações de leilão.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Funcionalidades Planejadas */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground">Funcionalidades Planejadas:</h3>
            <ul className="space-y-2 text-sm text-textSecondary">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>WebSocket para atualizações em tempo real</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Histórico completo de todos os lances</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Lances automáticos (auto-bid)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Notificações push e por email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Integração com gateway de pagamento</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
          <Link href="/auctions" onClick={() => onOpenChange(false)}>
            <Button variant="primary" className="flex items-center gap-2 w-full">
              Ver Leilões
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




