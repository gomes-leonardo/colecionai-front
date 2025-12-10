import { api } from "@/lib/axios";
import { User } from "@/types";

interface MeResponse {
  user: User;
  token: string;
}

export async function getMe(): Promise<User> {
  // A API retorna { user, token }, precisamos extrair apenas o user
  const response = await api.get<MeResponse>('/me');
  return response.data.user;
}
