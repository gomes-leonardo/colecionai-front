export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversation_id: string;
  read_at: string | null;
}

export interface Conversation {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithProduct extends Conversation {
  product: {
    id: string;
    name: string;
    banner: string | null;
    price: number;
    user_id: string;
    user: {
      id: string;
      name: string;
    };
  };
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
  };
  last_message?: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count?: number;
}

export interface SendMessageRequest {
  content: string;
  conversation_id?: string;
  product_id?: string;
}

export interface NewMessageEvent {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversation_id: string;
  read_at: string | null;
}

export interface JoinConversationPayload {
  conversation_id: string;
}

export interface LeaveConversationPayload {
  conversation_id: string;
}
