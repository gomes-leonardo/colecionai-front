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

export interface UserProfile {
  id: string;
  name: string;
  created_at: string;
}

export async function getUserProfile(id: string): Promise<UserProfile> {
  const response = await api.get<UserProfile>(`/profile/${id}`);
  return response.data;
}
