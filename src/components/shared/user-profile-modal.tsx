'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/services/userService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Calendar, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfileModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileModal({ userId, open, onOpenChange }: UserProfileModalProps) {
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: open && !!userId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-md">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Perfil do Vendedor</DialogTitle>
              <DialogDescription className="text-textSecondary">
                Informações sobre o vendedor deste produto
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary/40" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-16 h-16 text-primary animate-spin" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Carregando perfil...</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="p-4 rounded-full bg-destructive/10">
                <User className="w-8 h-8 text-destructive/50" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium text-foreground">Erro ao carregar perfil</p>
                <p className="text-sm text-muted-foreground">
                  Não foi possível carregar as informações do vendedor.
                </p>
              </div>
            </div>
          )}

          {profile && !isLoading && (
            <div className="space-y-4">
              {/* Nome do Vendedor */}
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Nome
                  </label>
                  <p className="text-xl font-bold text-foreground">{profile.name}</p>
                </div>
              </Card>

              {/* Membro Desde */}
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Membro desde
                    </label>
                  </div>
                  <div className="space-y-1 pl-8">
                    <p className="text-base font-semibold text-foreground">
                      {formatDistanceToNow(new Date(profile.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Badge de Confiança */}
              <div className="flex items-center justify-center pt-2">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-medium text-success">Vendedor Verificado</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
