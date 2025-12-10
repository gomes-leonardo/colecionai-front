'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe } from '@/services/userService';
import { AxiosError } from 'axios';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const pathname = usePathname();
  const redirectAttemptedRef = useRef(false);
  const queryClient = useQueryClient();
  // Com cookies httpOnly, não podemos verificar se há token no frontend
  // Vamos sempre tentar fazer a requisição e deixar o backend validar
  const { data: user, isError, isLoading, error } = useQuery({
    queryKey: ['session-user'],
    queryFn: () => getMe(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Sempre habilitado - cookies são enviados automaticamente
    enabled: true,
  });
  
  // hasToken agora é baseado na presença do usuário (se a requisição /me funcionou)
  const hasToken = !!user && !isError;

  useEffect(() => {
    // Reset flag quando pathname muda
    redirectAttemptedRef.current = false;
  }, [pathname]);

  useEffect(() => {
    // Não fazer nada se não requer autenticação
    if (!requireAuth) return;
    
    // Não redirecionar enquanto está carregando
    if (isLoading) return;
    
    // Não redirecionar se já está na página de login ou registro
    if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/verify') {
      return;
    }
    
    // Evitar múltiplos redirecionamentos
    if (redirectAttemptedRef.current) {
      return;
    }
    
    // Verificar se precisa redirecionar
    // IMPORTANTE: 
    // - Não redirecionar se está carregando (aguarda a requisição /me completar)
    // - Redirecionar apenas se: não há token OU houve erro de autenticação (401)
    // - Se há token mas ainda não tem user, aguardar (pode estar carregando ainda)
    const isAxiosError = error instanceof AxiosError;
    const needsRedirect = !hasToken || (isError && hasToken && isAxiosError && error.response?.status === 401);
    
    if (needsRedirect) {
      redirectAttemptedRef.current = true;
      
      // Limpa dados do usuário do localStorage (se houver)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('colecionai.user');
        // Cookie será limpo pelo backend no logout
      }
      
      // Usar replace para evitar adicionar ao histórico
      router.replace('/login');
    }
  }, [user, isError, isLoading, router, requireAuth, hasToken, pathname]);

  return { user, isAuthenticated: !!user && !isError, isLoading };
}
