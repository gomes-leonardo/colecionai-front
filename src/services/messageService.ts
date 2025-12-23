import { api } from "@/lib/axios";
import { Message, SendMessageRequest, ConversationWithProduct } from "@/types/message";

/**
 * Envia uma nova mensagem
 * Se for a primeira mensagem, deve incluir product_id e seller_id
 * Se já existe uma conversa, deve incluir conversation_id
 */
export async function sendMessage(data: SendMessageRequest): Promise<Message> {
  const response = await api.post("/messages", data);
  return response.data;
}

/**
 * Busca mensagens de uma conversa específica
 * (Para implementação futura do histórico)
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const response = await api.get(`/messages/${conversationId}`);
  return response.data;
}

/**
 * Busca todas as conversas do usuário
 */
export async function getUserConversations(): Promise<ConversationWithProduct[]> {
  const response = await api.get("/conversations");
  return response.data;
}
