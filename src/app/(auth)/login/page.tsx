'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginData } from '@/schemas/authSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { login, resendVerificationToken } from '@/services/authService';
import { getMe } from '@/services/userService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react'; // Assuming lucide-react is available, else use spinner

export default function LoginPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutateAsync: resendCode, isPending: isResending } = useMutation({
    mutationFn: resendVerificationToken,
    onSuccess: () => {
      toast.success("Novo código enviado!", {
        description: "Verifique seu e-mail e insira o código.",
        className: "bg-green-600 text-white border-none"
      });
      router.push(`/verify?email=${encodeURIComponent(pendingEmail)}`);
    },
    onError: () => {
      toast.error("Erro ao reenviar", {
        description: "Tente novamente mais tarde."
      });
      // Even on error, we might want to let them go to verify page if they think they have a code
      router.push(`/verify?email=${encodeURIComponent(pendingEmail)}`); 
    }
  });

  const { mutateAsync: authenticate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: async (data) => {
      if (data?.token) {
        localStorage.setItem('colecionai.token', data.token);
      }
      // O backend já retorna o user no response, não precisa chamar getMe novamente
      if (data.user) {
        localStorage.setItem('colecionai.user', JSON.stringify(data.user));
        setIsSuccess(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        toast.success(`Bem-vindo de volta, ${data.user.name}!`, {
          description: "Login realizado com sucesso.",
          className: "bg-green-600 text-white border-none"
        });
        router.push('/dashboard');
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      const errorMsg = errorData?.message || errorData?.error || "";
      
      // Verifica se o erro é de email não verificado (401 com mensagem específica)
      const isUnverified = error.response?.status === 401 && 
        (errorMsg.toLowerCase().includes('verificado') || 
         errorMsg.toLowerCase().includes('email não verificado'));

      if (isUnverified) {
        setPendingEmail(form.getValues('email'));
        setShowVerificationModal(true);
        return; 
      }

      console.error(error);
      let errorMessage = "Ocorreu um erro ao entrar.";

      if (error.response?.status === 401) {
        errorMessage = "Email ou senha incorretos.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error("Erro no login", {
        description: errorMessage,
      });
    },
  });

  async function onSubmit(data: LoginData) {
    await authenticate(data);
  }

  return (
    <div className="w-full animate-fade-in">
      
      {/* Verification Modal */}
      <Dialog open={showVerificationModal} onOpenChange={setShowVerificationModal}>
        <DialogContent className="bg-[#18181b]/95 backdrop-blur-xl border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Conta não verificada</DialogTitle>
            <DialogDescription className="text-zinc-400 text-base mt-2">
              Para sua segurança, precisamos que você verifique seu e-mail antes de acessar.
              <br/><br/>
              Já enviamos um código para <strong>{pendingEmail}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-3 mt-4">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white" 
              onClick={() => router.push(`/verify?email=${encodeURIComponent(pendingEmail)}`)}
            >
              Já tenho o código
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white"
              onClick={() => resendCode(pendingEmail)}
              disabled={isResending}
            >
              {isResending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reenviar código e verificar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">Bem-vindo de volta</h1>
        <p className="text-zinc-400 text-lg">
          Entre na sua conta para gerenciar sua coleção.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                    className="h-12 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 rounded-xl transition-all duration-300" 
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
                <div className="flex items-center justify-between">
                  <FormLabel className="text-zinc-300 ml-1">Senha</FormLabel>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••" 
                    {...field} 
                    className="h-12 bg-black/20 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 rounded-xl transition-all duration-300" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className={cn(
              "w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-none transition-all duration-300",
              isSuccess && "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
            )} 
            disabled={isPending || isSuccess}
            loading={isPending && !isSuccess}
          >
            {isSuccess ? (
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-8 text-center bg-white/5 p-4 rounded-xl border border-white/5">
        <p className="text-sm text-zinc-400">
          Não tem uma conta?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors">
            Criar conta gratuitamente
          </Link>
        </p>
      </div>
    </div>
  );
}