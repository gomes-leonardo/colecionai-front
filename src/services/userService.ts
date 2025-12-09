import { api } from "@/lib/axios";
import { User } from "@/types";

export interface UserProfileResponse {
  user: User;
  token?: string;
}

export async function getMe() {
  const response = await api.get<UserProfileResponse>('/me');
  // Se o backend retornar um novo token, atualiza no localStorage
  if (response.data.token) {
    localStorage.setItem('colecionai.token', response.data.token);
  }
  return response.data.user;
}
