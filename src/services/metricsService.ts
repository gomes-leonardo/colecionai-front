import { api } from "@/lib/axios";

/**
 * Serviço de métricas da aplicação
 * 
 * NOTA: Atualmente usa localStorage para simular o contador.
 * Quando o backend estiver pronto, basta descomentar as chamadas à API
 * e remover a lógica de localStorage.
 */

const VISIT_COUNT_KEY = 'colecionai_visit_count';

/**
 * Incrementa o contador de visitas
 * 
 * TODO: Quando o backend estiver pronto, substituir por:
 * const response = await api.post('/metrics/visit');
 * return response.data.totalVisits;
 */
export async function incrementVisit(): Promise<number> {
  try {
    // Simulação frontend (remover quando backend estiver pronto)
    const currentCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
    const newCount = currentCount + 1;
    localStorage.setItem(VISIT_COUNT_KEY, newCount.toString());
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return newCount;
    
    // Backend (descomentar quando estiver pronto):
    // const response = await api.post('/metrics/visit');
    // return response.data.totalVisits;
  } catch (error) {
    console.error('Erro ao incrementar visitas:', error);
    // Fallback: retorna contador local
    return parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
  }
}

/**
 * Obtém o contador atual de visitas
 */
export async function getVisitCount(): Promise<number> {
  try {
    // Simulação frontend (remover quando backend estiver pronto)
    return parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
    
    // Backend (descomentar quando estiver pronto):
    // const response = await api.get('/metrics/visits');
    // return response.data.totalVisits;
  } catch (error) {
    console.error('Erro ao obter contador de visitas:', error);
    return 0;
  }
}
