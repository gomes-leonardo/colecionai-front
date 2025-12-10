'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterData } from '@/schemas/authSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { register } from '@/services/authService';
import { LoginResponse } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const { mutateAsync: createAccount, isPending } = useMutation({
    mutationFn: register,
    onSuccess: (data: any) => {
      // A API retorna { status: "success", message: "..." }
      // Usamos o email e senha do formulário para permitir auto-login após verificação
      const email = form.getValues('email');
      const password = form.getValues('password');

      toast.success("Conta criada com sucesso!", {
        description: data?.message || "Enviamos um email de verificação para você."
      });

      // Passa email e senha para permitir auto-login após verificação
      router.push(`/verify?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    },
    onError: (error: any) => {
      console.error(error);
      const errorData = error.response?.data;
      
      // Tratar erros de validação com múltiplos campos
      if (errorData?.issues && Array.isArray(errorData.issues)) {
        const errorMessages = errorData.issues.map((issue: any) => {
          const field = issue.field ? `${issue.field}: ` : '';
          return `${field}${issue.message}`;
        }).join('\n');
        
        toast.error("Erro de validação", {
          description: errorMessages,
          duration: 5000,
        });
        
        // Também setar erros no formulário se possível
        errorData.issues.forEach((issue: any) => {
          if (issue.field && form.setError) {
            form.setError(issue.field as any, {
              type: 'manual',
              message: issue.message,
            });
          }
        });
        return;
      }
      
      // Tratar mensagem de erro simples
      const errorMessage = errorData?.message || errorData?.error || "Erro ao criar conta.";
      
      toast.error("Falha no cadastro", {
        description: errorMessage,
      });
    },
  });

  async function onSubmit(data: RegisterData) {
    await createAccount(data);
  }

  return (
    <div className="w-full space-y-10 sm:space-y-12 animate-fade-in py-4 sm:py-6">
        {/* Título */}
        <div className="text-center space-y-5 sm:space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black drop-shadow-lg">
              Crie sua conta
            </h1>
            <p className="text-zinc-400 text-lg sm:text-xl mt-3 sm:mt-4">
              Comece sua jornada no Colecionaí
            </p>
          </div>
        </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-7">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textSecondary">Nome</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Seu nome" 
                    {...field} 
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300 ml-1">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="seu@email.com" 
                    {...field} 
                    className="h-11 bg-black/20 border-white/10 placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 rounded-xl transition-all duration-300" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300 ml-1">Senha</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••" 
                    {...field} 
                    className="h-11 bg-black/20 border-white/10 placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 rounded-xl transition-all duration-300" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300 ml-1">Confirmar Senha</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••" 
                    {...field} 
                    className="h-11 bg-black/20 border-white/10 placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 rounded-xl transition-all duration-300" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            variant="primary"
            className="w-full h-11 text-base font-medium" 
            loading={isPending}
            disabled={isPending}
          >
            Criar Conta
          </Button>
        </form>
      </Form>

      <div className="mt-8 text-center bg-backgroundSecondary p-4 rounded-lg border border-border">
        <p className="text-sm text-textSecondary">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary hover:text-primary-hover font-medium hover:underline transition-colors">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
