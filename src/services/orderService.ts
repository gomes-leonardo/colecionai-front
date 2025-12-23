import { api } from "@/lib/axios";

export interface CreateOrderRequest {
  product_id: string;
  conversation_id?: string;
  buyer_id?: string;
  final_price: number; // em reais (será convertido para centavos no backend)
}

export interface Order {
  id: string;
  final_price: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  conversation_id: string | null;
  buyer?: {
    id: string;
    name: string;
    email: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  product?: {
    id: string;
    name: string;
    banner: string | null;
    price: number;
  };
}

export async function createOrder(data: CreateOrderRequest): Promise<Order> {
  const response = await api.post("/orders", data);
  return response.data;
}

export async function getUserOrders(): Promise<Order[]> {
  const response = await api.get("/orders");
  return response.data;
}

export async function completeOrder(orderId: string): Promise<Order> {
  const response = await api.patch(`/orders/${orderId}/complete`);
  return response.data;
}

