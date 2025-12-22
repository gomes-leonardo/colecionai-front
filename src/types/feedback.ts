export enum FeedbackType {
  BUG = 'BUG',           // "Deu erro aqui"
  SUGGESTION = 'SUGGESTION', // "Podia ter um botão azul"
  COMPLIMENT = 'COMPLIMENT', // "Amei o site"
  OTHER = 'OTHER'
}

export interface Feedback {
  id?: string;
  type: FeedbackType;
  message: string;
  rating: number; // 1-5
  visitor_name: string;
  context: string;
  created_at?: string;
}

export interface CreateFeedbackData {
  type: FeedbackType;
  message: string;
  rating: number;
  visitor_name: string;
  context: string;
}
