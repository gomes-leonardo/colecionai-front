import axios from 'axios';

// Usa a URL de produção por padrão, mas permite override via env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://colecionai-api.onrender.com';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// INTERCEPTOR DE REQUISIÇÃO (Sai do Front -> Vai pro Back)
api.interceptors.request.use((config) => {
  // Tenta pegar o token do localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('colecionai.token') : null;

  // Se tiver token válido, injeta no cabeçalho Authorization
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Flag global para prevenir múltiplos redirecionamentos simultâneos
let isRedirecting = false;

// INTERCEPTOR DE RESPOSTA (Volta do Back -> Chega no Front)
api.interceptors.response.use(
  (response) => {
    // Delay apenas em desenvolvimento para simular latência
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => resolve(response), 500);
      });
    }
    return response;
  },
  (error) => {
    // Se o erro for 401 (Token inválido/expirado)
    if (error.response?.status === 401) {
      // Limpar storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('colecionai.token');
        localStorage.removeItem('colecionai.user');
        
        // Evitar redirecionamento infinito
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath === '/login' || 
                          currentPath === '/register' || 
                          currentPath === '/forgot-password' || 
                          currentPath === '/verify' ||
                          currentPath === '/password/reset';
        
        // Só redirecionar se não estiver em página de auth e não estiver já redirecionando
        if (!isAuthPage && !isRedirecting) {
          isRedirecting = true;
          
          // Usar replace para evitar loop de histórico
          window.location.replace('/login');
          
          // Reset flag após um tempo
          setTimeout(() => {
            isRedirecting = false;
          }, 1000);
        }
      }
    }
    return Promise.reject(error);
  }
);