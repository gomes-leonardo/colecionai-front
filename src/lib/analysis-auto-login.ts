import { login } from '@/services/authService';
import { LoginResponse } from '@/types';

const ANALYSIS_CREDENTIALS = {
  email: 'analise@email.com',
  password: 'Analise@123',
};

// Flag global para prevenir múltiplas chamadas simultâneas
let loginInProgress = false;

export async function performAnalysisLogin(): Promise<LoginResponse | null> {
  // Se já está tentando fazer login, retornar null imediatamente
  if (loginInProgress) {
    console.warn('[AnalysisLogin] Login já está em progresso, ignorando nova tentativa');
    return null;
  }

  loginInProgress = true;

  try {
    // Fazer login exatamente como o login normal - retornar a resposta completa
    const response: LoginResponse = await login(ANALYSIS_CREDENTIALS);
    
    loginInProgress = false;
    
    // Salvar token e user no localStorage, exatamente como no login normal
    if (response.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('colecionai.token', response.token);
        
        // Salvar dados do usuário se retornados
        if (response.user) {
          localStorage.setItem('colecionai.user', JSON.stringify(response.user));
        }
        
        // Disparar evento para invalidar queries do React Query
        // Isso força o useAuth a refazer a requisição /me com o novo token
        window.dispatchEvent(new CustomEvent('auth-token-updated'));
      }
      
      // Retornar a resposta completa para uso no contexto
      return response;
    }
    
    return null;
  } catch (error: any) {
    loginInProgress = false;
    return null;
  }
}
