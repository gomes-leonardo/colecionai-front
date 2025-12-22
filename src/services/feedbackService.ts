import { api } from '@/lib/axios';
import { Feedback, CreateFeedbackData } from '@/types/feedback';

/**
 * Submit feedback from analysis mode or general usage
 */
export async function createFeedback(data: CreateFeedbackData): Promise<Feedback> {
  try {
    const response = await api.post<Feedback>('/feedback', data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;

      if (status === 400) {
        throw new Error(responseData.message || 'Dados de feedback inválidos');
      }

      throw new Error(responseData.message || 'Erro ao enviar feedback');
    }

    throw new Error('Erro ao enviar feedback. Tente novamente.');
  }
}

export async function getAllFeedback(filters?: {
  type?: string;
  context?: string;
  minRating?: number;
  maxRating?: number;
}): Promise<Feedback[]> {
  try {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.context) params.append('context', filters.context);
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.maxRating) params.append('maxRating', filters.maxRating.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/feedbacks?${queryString}` : '/feedbacks';
    
    const response = await api.get<any>(url);
    
    // Se a resposta for uma string (JSON do cache), fazer parse
    let data = response.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        return [];
      }
    }
    
    // Se for array direto, retornar
    if (Array.isArray(data)) {
      return data;
    }

    // Se estiver dentro de uma propriedade data
    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    // Se estiver dentro de uma propriedade feedbacks
    if (data && Array.isArray(data.feedbacks)) {
      return data.feedbacks;
    }

    return [];
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    // Se for 401, não é um erro crítico - pode ser que o usuário não esteja logado
    // mas a página de feedback é pública, então retornamos array vazio
    if (error.response?.status === 401) {
      console.warn('401 ao buscar feedbacks - retornando array vazio (página pública)');
      return [];
    }
    throw new Error('Erro ao buscar feedbacks');
  }
}
