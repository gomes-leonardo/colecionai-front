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
  const [hasToken, setHasToken] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('colecionai.token');
  });
  
  // Atualizar hasToken quando o token for alterado
  useEffect(() => {
    const checkToken = () => {
      if (typeof window !== 'undefined') {
        const token = !!localStorage.getItem('colecionai.token');
        setHasToken(token);
      }
    };

    // Verificar token inicialmente e quando o evento for disparado
    checkToken();

    const handleAuthUpdate = () => {
      checkToken();
      // Invalidar query para forçar nova requisição com o novo token
      queryClient.invalidateQueries({ queryKey: ['session-user'] });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-updated', handleAuthUpdate);
      // Também escutar mudanças no localStorage
      window.addEventListener('storage', checkToken);
      
      return () => {
        window.removeEventListener('auth-token-updated', handleAuthUpdate);
        window.removeEventListener('storage', checkToken);
      };
    }
  }, [queryClient]);
  
  const { data: user, isError, isLoading, error } = useQuery({
    queryKey: ['session-user'],
    queryFn: () => getMe(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: hasToken, // Só faz a requisição se houver token
  });

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
      
      // Limpa dados inválidos
      if (typeof window !== 'undefined') {
        localStorage.removeItem('colecionai.token');
        localStorage.removeItem('colecionai.user');
      }
      
      // Usar replace para evitar adicionar ao histórico
      router.replace('/login');
    }
  }, [user, isError, isLoading, router, requireAuth, hasToken, pathname]);

  return { user, isAuthenticated: !!user && !isError, isLoading };
}
