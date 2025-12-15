import { api } from "@/lib/axios";
import { LoginRequest, LoginResponse, RegisterRequest } from "@/types";

export async function login(data: LoginRequest) {
  const response = await api.post("/sessions", data);
  return response.data as LoginResponse;
}

export async function register(data: RegisterRequest) {
  const response = await api.post("/users", data);
  return response.data;
}

export async function logout() {
  try {
    await api.post("/logout");
    // Backend deve limpar o cookie httpOnly
  } finally {
    // Limpa dados do usuário do localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('colecionai.user');
      let userId: string | null = null;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          userId = user.id;
        } catch (e) {
          // Ignora erro de parsing
        }
      }
      
      localStorage.removeItem('colecionai.user');
      
      // Limpa notificações do usuário
      if (userId) {
        localStorage.removeItem(`colecionai.notifications.${userId}`);
      }
      // Limpa também a chave antiga sem user_id (para migração)
      localStorage.removeItem('colecionai.notifications');
      
      // Cookie será limpo pelo backend
    }
  }
}

export async function forgotPassword(email: string) {
  await api.post("/forgot-password", { email });
}

export async function resetPassword(token: string, password: string) {
  await api.post(`/reset-password?token=${token}`, { password });
}

export async function verifyEmail(token: string) {
  // ⚠️ IMPORTANTE: O campo deve ser verifyEmailToken conforme a API
  const response = await api.post("/verify", { verifyEmailToken: token });
  return response.data;
}

export async function resendVerificationToken(email: string) {
  await api.post("/verify/resend", { email });
}