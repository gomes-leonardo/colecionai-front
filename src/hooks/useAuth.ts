'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/services/userService';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  
  // Verifica se há token antes de fazer a requisição
  const hasToken = typeof window !== 'undefined' 
    ? !!localStorage.getItem('colecionai.token') 
    : false;
  
  const { data: user, isError, isLoading, error } = useQuery({
    queryKey: ['session-user'],
    queryFn: () => getMe(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: hasToken, // Só faz a requisição se houver token
  });

  useEffect(() => {
    if (requireAuth && !isLoading) {
      // Se não há token ou houve erro de autenticação, redireciona
      if (!hasToken || isError || (!user && hasToken)) {
        // Limpa dados inválidos
        if (typeof window !== 'undefined') {
          localStorage.removeItem('colecionai.token');
          localStorage.removeItem('colecionai.user');
        }
        router.push('/login');
      }
    }
  }, [user, isError, isLoading, router, requireAuth, hasToken]);

  return { user, isAuthenticated: !!user && !isError, isLoading };
}
