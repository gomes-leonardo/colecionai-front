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
      if (data?.token) {
        localStorage.setItem('colecionai.token', data.token);
      }
      // O backend já retorna o user no response, não precisa chamar getMe novamente
      if (data.user) {
        localStorage.setItem('colecionai.user', JSON.stringify(data.user));
        setIsSuccess(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        toast.success(`Bem-vindo de volta, ${data.user.name}!`, {
          description: "Login realizado com sucesso."
        });
        router.push('/dashboard');
      }
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