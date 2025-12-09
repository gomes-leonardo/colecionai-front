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
      // O backend pode retornar user ou email diretamente
      const email = data?.user?.email || data?.email || form.getValues('email');

      toast.success("Conta criada com sucesso!", {
        description: "Enviamos um email de verificação para você.",
        className: "bg-green-600 text-white border-none"
      });

      router.push(`/verify?email=${encodeURIComponent(email)}`);
    },
    onError: (error: any) => {
      console.error(error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Erro ao criar conta.";
      
      toast.error("Falha no cadastro", {
        description: errorMessage,
      });
    },
  });

  async function onSubmit(data: RegisterData) {
    await createAccount(data);
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Crie sua conta</h1>
        <p className="text-zinc-400">
          Comece sua jornada de colecionador hoje mesmo.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-zinc-300 ml-1">Nome</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Seu nome" 
                    {...field} 
                    className="h-11 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 rounded-xl transition-all duration-300"
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
                    className="h-11 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 rounded-xl transition-all duration-300" 
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
                    className="h-11 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 rounded-xl transition-all duration-300" 
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
                    className="h-11 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 rounded-xl transition-all duration-300" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-none transition-all duration-300 hover:scale-[1.02]" 
            loading={isPending}
            disabled={isPending}
          >
            Criar Conta
          </Button>
        </form>
      </Form>

      <div className="mt-8 text-center bg-white/5 p-4 rounded-xl border border-white/5">
        <p className="text-sm text-zinc-400">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
