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
  } finally {
    // Sempre limpa o localStorage, mesmo se a requisição falhar
    if (typeof window !== 'undefined') {
      localStorage.removeItem('colecionai.token');
      localStorage.removeItem('colecionai.user');
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