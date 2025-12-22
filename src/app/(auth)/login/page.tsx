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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, resendVerificationToken } from '@/services/authService';
import { getMe } from '@/services/userService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react'; // Assuming lucide-react is available, else use spinner

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
        description: "Verifique seu e-mail e insira o código."
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
      // PRIMEIRO: Setar os dados do usuário da sessão no estado global (React Query)
      // Isso garante que todos os componentes que usam useAuth() recebam os dados imediatamente
      if (data.user) {
        queryClient.setQueryData(['session-user'], data.user);
      }
      
      // Depois: Salvar no localStorage apenas para cache/UX (opcional)
      if (typeof window !== 'undefined' && data.user) {
        localStorage.setItem('colecionai.user', JSON.stringify(data.user));
      }
      
      setIsSuccess(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`Bem-vindo de volta, ${data.user.name}!`, {
        description: "Login realizado com sucesso."
      });
      router.push('/dashboard');
    },
    onError: (error: any) => {
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
        return;
      }
      
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
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
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
        <DialogContent className="bg-background border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-textPrimary">Conta não verificada</DialogTitle>
            <DialogDescription className="text-textSecondary text-base mt-2">
              Para sua segurança, precisamos que você verifique seu e-mail antes de acessar.
              <br/><br/>
              Já enviamos um código para <strong>{pendingEmail}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-3 mt-4">
            <Button 
              variant="primary"
              className="w-full" 
              onClick={() => router.push(`/verify?email=${encodeURIComponent(pendingEmail)}`)}
            >
              Já tenho o código
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => resendCode(pendingEmail)}
              disabled={isResending}
            >
              {isResending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reenviar código e verificar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="w-full space-y-10 sm:space-y-12 animate-fade-in py-4 sm:py-6">
        {/* Título */}
        <div className="text-center space-y-5 sm:space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black drop-shadow-lg">
              Bem-vindo de volta
            </h1>
            <p className="text-zinc-400 text-lg sm:text-xl mt-3 sm:mt-4">
              Entre na sua conta para continuar
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 sm:space-y-7">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-textSecondary">Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="seu@email.com" 
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-textSecondary">Senha</FormLabel>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••" 
                    {...field} 
                    className="h-11" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            variant={isSuccess ? "default" : "primary"}
            className={cn(
              "w-full h-11 text-base font-medium",
              isSuccess && "bg-success hover:bg-success/90"
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

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou continue com</span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11"
            onClick={() => {
              toast.info('Em breve!', {
                description: 'Login com Google está sendo implementado.'
              });
            }}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar com Google
          </Button>
        </form>
      </Form>

      <div className="mt-8 text-center bg-backgroundSecondary p-4 rounded-lg border border-border">
        <p className="text-sm text-textSecondary">
          Não tem uma conta?{' '}
          <Link href="/register" className="text-primary hover:text-primary-hover font-medium hover:underline transition-colors">
            Criar conta gratuitamente
          </Link>
        </p>
      </div>
    </div>
  );
}