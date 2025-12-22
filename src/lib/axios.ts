import axios from 'axios';
import { logout } from '@/services/authService';

// Em desenvolvimento usa localhost HTTP, em produção usa HTTPS
const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3333'
  : (process.env.NEXT_PUBLIC_API_URL || 'https://colecionai-api.onrender.com');

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// INTERCEPTOR DE REQUISIÇÃO (Sai do Front -> Vai pro Back)
// Com cookies httpOnly, o token é enviado automaticamente via cookies
// Não precisamos mais injetar manualmente no header Authorization
api.interceptors.request.use((config) => {
  // Cookies são enviados automaticamente com withCredentials: true
  // O backend deve ler o token dos cookies, não do header Authorization
  return config;
});

// Flag global para prevenir múltiplos redirecionamentos simultâneos
let isRedirecting = false;
// Flag para prevenir múltiplas chamadas de logout simultâneas
let isLoggingOut = false;

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
  async (error) => {
    // Se o erro for 401 (Token inválido/expirado)
    if (error.response?.status === 401) {
      // Verificar se modo análise está ativo - NÃO fazer logout nesse caso
      const isAnalysisModeActive = typeof window !== 'undefined' && 
        document.body.classList.contains('analysis-mode-enabled');
      
      if (isAnalysisModeActive) {
        // No modo análise, apenas rejeitar o erro sem fazer logout
        return Promise.reject(error);
      }
      
      // Chamar logout apenas uma vez para evitar loops
      if (!isLoggingOut && typeof window !== 'undefined') {
        isLoggingOut = true;
        
        try {
          // Chamar endpoint de logout para limpar sessão no backend
          await logout();
        } catch (logoutError) {
          // Se logout falhar, pelo menos limpar localStorage
          localStorage.removeItem('colecionai.user');
        } finally {
          isLoggingOut = false;
        }
        
        // Evitar redirecionamento infinito
        const currentPath = window.location.pathname;
        
        // Lista de páginas públicas que NÃO devem redirecionar automaticamente
        // Essas páginas podem funcionar sem autenticação
        const publicPages = [
          '/',              // Home page
          '/login',         // Login
          '/register',      // Registro
          '/forgot-password', // Esqueci senha
          '/verify',        // Verificação de email
          '/password/reset', // Reset de senha
          '/products',      // Listagem de produtos (público)
          '/auctions',      // Leilões (público)
          '/feedback',      // Feedback (público)
          '/about',         // Sobre (público)
        ];
        
        // Verificar se está em uma página pública ou em uma rota de produto específico
        const isPublicPage = publicPages.some(page => currentPath === page || currentPath.startsWith(page + '/'));
        const isProductPage = currentPath.startsWith('/products/');
        const isFeedbackPage = currentPath.startsWith('/feedback');
        const isAboutPage = currentPath === '/about';
        
        // Verificar se a requisição que falhou é de um endpoint público
        const requestUrl = error.config?.url || '';
        const isPublicEndpoint = requestUrl.includes('/feedbacks') || 
                                 requestUrl.includes('/products') || 
                                 requestUrl.includes('/auctions') ||
                                 requestUrl.includes('/feedback') ||
                                 requestUrl === '/';
        
        // Só redirecionar se:
        // 1. Modo análise NÃO estiver ativo (já verificado acima)
        // 2. Não estiver em página pública
        // 3. Não for um endpoint público
        // 4. Não estiver já redirecionando
        // 5. Não estiver em /announce (pode ser acessado no modo análise para visualização)
        const isAnnouncePage = currentPath === '/announce';
        
        if (!isPublicPage && !isProductPage && !isFeedbackPage && !isAboutPage && 
            !isAnnouncePage && !isPublicEndpoint && !isRedirecting) {
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