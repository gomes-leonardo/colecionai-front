'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verifyEmail, resendVerificationToken, login } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAnalysisMode } from '@/contexts/AnalysisModeContext';

function VerifyContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const password = searchParams.get('password'); // Senha passada via URL após registro
  const { enabled: analysisModeEnabled } = useAnalysisMode();
  const [token, setToken] = useState('');
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(60);
  const canResend = timeLeft === 0;

  // Status can be: idle, verifying, success, error, logging-in
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error' | 'logging-in'>('idle');

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const { mutateAsync: resendCode, isPending: isResending } = useMutation({
    mutationFn: resendVerificationToken,
    onSuccess: () => {
      setTimeLeft(60);
      toast.success("Código reenviado!", {
        description: "Verifique seu e-mail.",
        className: "bg-green-600 text-white border-none"
      });
    },
    onError: () => {
      toast.error("Erro ao reenviar", {
        description: "Tente novamente mais tarde."
      });
    }
  });

  const { mutateAsync: verify, isPending } = useMutation({
    mutationFn: verifyEmail,
    onSuccess: async (data: any) => {
      setStatus('success');
      
      toast.success("Email verificado!", {
        description: "Fazendo login automaticamente...",
        className: "bg-green-600 text-white border-none"
      });
      
      // Auto-login após verificação bem-sucedida
      if (email && password) {
        try {
          setStatus('logging-in');
          const loginResponse = await login({ email, password });
          
          // PRIMEIRO: Setar os dados do usuário da sessão no estado global (React Query)
          // Isso garante que todos os componentes que usam useAuth() recebam os dados imediatamente
          if (loginResponse.user) {
            queryClient.setQueryData(['session-user'], loginResponse.user);
          }
          
          // Depois: Salvar no localStorage apenas para cache/UX (opcional)
          if (loginResponse.user) {
            localStorage.setItem('colecionai.user', JSON.stringify(loginResponse.user));
          }
          
          toast.success("Login realizado!", {
            description: "Redirecionando...",
            className: "bg-green-600 text-white border-none"
          });
          
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } catch (error) {
          console.error('Erro no auto-login:', error);
          toast.error("Verificação OK, mas erro no login", {
            description: "Por favor, faça login manualmente."
          });
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } else {
        // Se não tiver senha, redireciona para login
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    },
    onError: (error: any) => {
      setStatus('error');
      console.error(error);
       toast.error("Código inválido", {
        description: "Verifique o código e tente novamente.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length < 6) return;
    setStatus('verifying');
    verify(token);
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    await resendCode(email);
  };

  return (
    <div className="w-full space-y-12 sm:space-y-16 animate-fade-in py-4 sm:py-8">
      <div className="text-center space-y-5 sm:space-y-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black drop-shadow-lg">
          Verifique seu código
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg md:text-xl px-4 sm:px-0 leading-relaxed">
          Digite o código de 6 dígitos que enviamos para {email ? <strong className="text-zinc-300">{email}</strong> : 'seu e-mail'}.
        </p>
      </div>

      {(status === 'success' || status === 'logging-in') ? (
        <div className="space-y-8 text-center animate-scale-in py-8">
          <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">
            {status === 'logging-in' ? 'Fazendo login...' : 'Sucesso!'}
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg">
            {status === 'logging-in' ? 'Aguarde um momento...' : 'Preparando seu acesso...'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-12 sm:space-y-16">
          <div className="flex justify-center px-4 sm:px-0 py-4 sm:py-6">
            <OtpInput 
              value={token} 
              onChange={setToken} 
              length={6} 
              disabled={isPending || analysisModeEnabled}
            />
          </div>

          <div className="px-4 sm:px-0 space-y-6">
            <Button 
              type="submit" 
              className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-none rounded-xl transition-all duration-300"
              disabled={isPending || token.length < 6}
              loading={isPending}
            >
              {isPending ? 'Verificando...' : 'Verificar'}
            </Button>

            <div className="text-center pt-4">
               <button 
                 type="button" 
                 className={cn(
                   "text-sm sm:text-base transition-colors py-3 px-6 rounded-lg inline-block",
                   canResend 
                     ? "text-blue-400 hover:text-blue-300 hover:underline cursor-pointer hover:bg-blue-500/10" 
                     : "text-zinc-600 cursor-not-allowed"
                 )}
                 onClick={handleResend}
                 disabled={!canResend || isResending}
               >
                 {isResending ? (
                   "Enviando..."
                 ) : canResend ? (
                   "Não recebeu? Reenviar código"
                 ) : (
                   `Reenviar código em ${timeLeft < 10 ? `0${timeLeft}` : timeLeft}s`
                 )}
               </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center text-white">Carregando...</div>}>
      <VerifyContent />
    </Suspense>
  )
}
