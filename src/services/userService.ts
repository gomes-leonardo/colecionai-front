import { api } from "@/lib/axios";
import { User } from "@/types";

export async function getMe(): Promise<User> {
  // A API retorna diretamente o objeto User, não um wrapper
  const response = await api.get<User>('/me');
  return response.data;
}
