'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { verifyEmail, resendVerificationToken } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [token, setToken] = useState('');
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(60);
  const canResend = timeLeft === 0;

  // Status can be: idle, verifying, success, error
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

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
    onSuccess: (data: any) => {
      setStatus('success');
      
      // Auto-login check
      if (data?.token && data?.user) {
        localStorage.setItem('colecionai.token', data.token);
        localStorage.setItem('colecionai.user', JSON.stringify(data.user));
        
        toast.success("Conta verificada e logada!", {
          description: "Redirecionando para o dashboard...",
          className: "bg-green-600 text-white border-none"
        });
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        toast.success("Email verificado com sucesso!", {
          className: "bg-green-600 text-white border-none"
        });
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
    <div className="w-full space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">Verifique seu código</h1>
        <p className="text-zinc-400 text-lg">
          Digite o código de 6 dígitos que enviamos para {email ? <strong className="text-zinc-300">{email}</strong> : 'seu e-mail'}.
        </p>
      </div>

      {status === 'success' ? (
        <div className="space-y-6 text-center animate-scale-in">
          <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white">Sucesso!</h2>
          <p className="text-zinc-400">Preparando seu acesso...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center">
            <OtpInput 
              value={token} 
              onChange={setToken} 
              length={6} 
              disabled={isPending}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-none rounded-xl transition-all duration-300"
            disabled={isPending || token.length < 6}
            loading={isPending}
          >
            {isPending ? 'Verificando...' : 'Verificar'}
          </Button>

          <div className="text-center">
             <button 
               type="button" 
               className={cn(
                 "text-sm transition-colors",
                 canResend 
                   ? "text-blue-400 hover:text-blue-300 hover:underline cursor-pointer" 
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
