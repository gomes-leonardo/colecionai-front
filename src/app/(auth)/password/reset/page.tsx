'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { toast } from "sonner";
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { resetPassword } from "@/services/authService";
import { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      toast.error("Token de recuperação inválido ou ausente", {
        description: "Por favor, solicite uma nova recuperação de senha."
      });
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Token inválido");
      return;
    }

    try {
      await resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success("Senha redefinida com sucesso!", {
        description: "Você já pode fazer login com sua nova senha."
      });
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError) {
        toast.error("Erro ao redefinir senha", {
          description: error.response?.data?.message || "O token pode estar expirado ou inválido."
        });
      } else {
        toast.error("Erro inesperado", {
          description: "Tente novamente mais tarde."
        });
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Senha Alterada!</h1>
        <p className="text-muted-foreground">
          Sua senha foi redefinida com sucesso.
          Você será redirecionado para o login em instantes...
        </p>
        <div className="pt-4">
          <Link href="/login">
            <Button className="w-full">
              Ir para o Login Agora
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Redefinir Senha</h1>
        <p className="text-muted-foreground">
          Crie uma nova senha segura para sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nova Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input 
              id="password" 
              type="password" 
              placeholder="******" 
              className="pl-10" 
              {...register("password")}
              disabled={isSubmitting || !token}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="******" 
              className="pl-10" 
              {...register("confirmPassword")}
              disabled={isSubmitting || !token}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || !token}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redefinindo...
            </>
          ) : (
            "Redefinir Senha"
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
