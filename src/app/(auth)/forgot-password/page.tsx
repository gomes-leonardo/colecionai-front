'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { forgotPassword } from "@/services/authService";
import { AxiosError } from "axios";

const forgotPasswordSchema = z.object({
  email: z.string().email("Digite um email válido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success("Email enviado!", {
        description: "Verifique sua caixa de entrada para redefinir a senha."
      });
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError) {
        toast.error("Erro ao enviar email", {
          description: error.response?.data?.message || "Ocorreu um erro inesperado. Tente novamente."
        });
      } else {
        toast.error("Erro inesperado", {
          description: "Tente novamente mais tarde."
        });
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-primary-light rounded-full flex items-center justify-center">
            <Mail className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-textPrimary">Verifique seu email</h1>
        <p className="text-textSecondary">
          Enviamos as instruções de recuperação para o seu email.
          Não esqueça de verificar a caixa de spam!
        </p>
        <div className="pt-4">
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Voltar para o Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 sm:space-y-12 py-4 sm:py-6">
      <div className="space-y-5 sm:space-y-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-textPrimary">Recuperar Senha</h1>
        <p className="text-textSecondary text-lg sm:text-xl">
          Digite seu email para receber as instruções de redefinição.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-7">
        <div className="space-y-3 sm:space-y-4">
          <Label htmlFor="email" className="text-base">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-textMuted" />
            <Input 
              id="email" 
              type="email" 
              placeholder="seu@email.com" 
              className="pl-10 h-12 sm:h-14 text-base" 
              {...register("email")}
              disabled={isSubmitting}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive mt-2">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" variant="primary" className="w-full h-12 sm:h-14 text-base font-medium" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Link de Recuperação"
          )}
        </Button>
      </form>

      <div className="text-center pt-4 sm:pt-6">
        <Link href="/login" className="text-sm sm:text-base text-textSecondary hover:text-primary flex items-center justify-center gap-2 py-2 px-4 rounded-lg hover:bg-backgroundSecondary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
}
