'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, XCircle, Shield, Loader2, ChevronUp, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalysisMode } from '@/contexts/AnalysisModeContext';
import { AnalysisStepContent } from './AnalysisStepContent';
import { AnalysisFeedback } from './AnalysisFeedback';
import { AnalysisContact } from './AnalysisContact';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AnalysisHUD() {
  const {
    enabled,
    currentStepIndex,
    currentStep,
    steps,
    nextStep,
    prevStep,
    disable,
    isLoginLoading,
  } = useAnalysisMode();

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hudSide, setHudSide] = useState<'left' | 'right'>('right');
  const [hudWidth, setHudWidth] = useState(550);
  const prevHudSideRef = useRef<'left' | 'right'>('right'); // Rastrear lado anterior para animação
  const [shouldAnimate, setShouldAnimate] = useState(false); // Controlar quando animar

  // Detectar se é mobile e atualizar classes no body
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // No mobile, começar minimizado por padrão
      if (mobile && !isMinimized) {
        setIsMinimized(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determinar lado e largura do HUD baseado no passo atual
  // Também detecta automaticamente se elemento destacado está à direita
  useEffect(() => {
    if (!currentStep || !enabled) return;
    
    // Verificar se passo tem configuração explícita
    let side = currentStep.hudSide;
    let width = currentStep.hudWidth || 550;
    
    // Reduzir largura em telas de auth (login, register, verify, forgot-password)
    if (currentStep.route === '/login' || currentStep.route === '/register' || currentStep.route === '/verify' || currentStep.route === '/forgot-password') {
      width = 420; // Largura menor para não colar no componente
    }
    
    // Se não tem configuração explícita, detectar automaticamente
    if (!side && currentStep.highlightSelector) {
      // Pequeno delay para garantir que elemento foi renderizado
      setTimeout(() => {
        const element = document.querySelector(currentStep.highlightSelector || '');
        if (element) {
          const rect = element.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          // Se elemento está na metade direita da tela, colocar HUD à esquerda
          if (rect.left > viewportWidth / 2) {
            side = 'left';
            width = 450; // Comprimir um pouco quando à esquerda
          } else {
            side = 'right';
          }
        }
      }, 100);
    }
    
    // Fallback para right se ainda não definido
    side = side || 'right';
    
    // Verificar se o lado mudou
    const sideChanged = prevHudSideRef.current !== side;
    
    // Atualizar ref antes de setState
    prevHudSideRef.current = side;
    
    // Só animar se mudou de lado
    setShouldAnimate(sideChanged);
    setHudSide(side);
    setHudWidth(width);
    
    // Resetar flag de animação após um delay
    if (sideChanged) {
      setTimeout(() => setShouldAnimate(false), 500);
    }
  }, [currentStep, enabled]);

  // Atualizar classes no body para controlar padding do conteúdo
  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('analysis-hud-expanded', 'analysis-hud-minimized', 'analysis-hud-mobile', 'analysis-hud-left', 'analysis-hud-right');
      return;
    }

    // Remover classes anteriores
    document.body.classList.remove('analysis-hud-expanded', 'analysis-hud-minimized', 'analysis-hud-mobile', 'analysis-hud-left', 'analysis-hud-right');

    // Adicionar classe do lado
    document.body.classList.add(`analysis-hud-${hudSide}`);

    if (isMobile) {
      document.body.classList.add('analysis-hud-mobile');
      if (!isMinimized) {
        document.body.classList.add('analysis-hud-expanded');
      } else {
        document.body.classList.add('analysis-hud-minimized');
      }
    } else {
      // Desktop
      if (isMinimized) {
        document.body.classList.add('analysis-hud-minimized');
      } else {
        document.body.classList.add('analysis-hud-expanded');
      }
    }

    return () => {
      document.body.classList.remove('analysis-hud-expanded', 'analysis-hud-minimized', 'analysis-hud-mobile', 'analysis-hud-left', 'analysis-hud-right');
    };
  }, [enabled, isMinimized, isMobile, hudSide]);

  if (!enabled || !currentStep) return null;

  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  
  // Verificar se usuário está autenticado (tem token)
  const isAuthenticated = typeof window !== 'undefined' 
    ? !!localStorage.getItem('colecionai.token')
    : false;
  
  // Mostrar blur apenas no primeiro passo
  const showBlurOverlay = currentStepIndex === 0;

  const handleOutsideClick = () => {
    setShowExitConfirm(true);
  };

  const handleConfirmExit = async () => {
    setShowExitConfirm(false);
    await disable();
  };

  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  return (
    <>
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="bg-background border-border z-[110] max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-500/10">
                <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <AlertDialogTitle className="text-xl">
                Deseja sair do modo análise?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-textSecondary text-base leading-relaxed space-y-3 pt-2">
              <p>
                {isAuthenticated ? (
                  <>
                    Ao sair do modo análise, você será <strong>deslogado automaticamente</strong> e perderá o progresso atual do tour técnico.
                  </>
                ) : (
                  <>
                    Ao sair do modo análise, você perderá o progresso atual do tour técnico.
                  </>
                )}
              </p>
              <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Proteção do sistema:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Ações bloqueadas durante o modo análise</li>
                  <li>Não é possível criar ou editar produtos</li>
                  <li>Não é possível realizar outras modificações</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                  Isso garante que você foque apenas no tour técnico sem alterar dados do sistema.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
            <AlertDialogCancel 
              onClick={handleCancelExit}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmExit}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground w-full sm:w-auto order-1 sm:order-2"
            >
              {isAuthenticated ? 'Sair e Deslogar' : 'Sair'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimatePresence mode="wait">
        {enabled && (
          <>
            {/* Overlay escuro no mobile quando drawer está aberto */}
            {isMobile && !isMinimized && (
              <motion.div
                key="analysis-mobile-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm"
                onClick={() => setIsMinimized(true)}
                style={{ pointerEvents: 'auto' }}
              />
            )}
            
            {/* Overlay invisível clicável - apenas desktop */}
            {!isMobile && (
              <motion.div
                key="analysis-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90]"
                style={{ 
                  pointerEvents: 'auto',
                  background: 'transparent'
                }}
                onClick={(e) => {
                  const hud = document.querySelector('.analysis-hud-panel');
                  if (hud && !hud.contains(e.target as Node)) {
                    handleOutsideClick();
                  }
                }}
              />
            )}

            {/* Overlay escuro - APENAS NO PRIMEIRO PASSO */}
            {showBlurOverlay && (
              <motion.div
                key="analysis-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
            )}

            {/* HUD Panel - Responsivo e colapsável - OVERLAY ABSOLUTO, não comprime conteúdo */}
            {/* Alterna de lado suavemente com Framer Motion - apenas quando muda de lado */}
            <motion.div
              key={`analysis-hud-${hudSide}`}
              initial={shouldAnimate ? {
                x: hudSide === 'right' ? '100%' : '-100%',
                opacity: 0
              } : false}
              animate={{ 
                x: 0, 
                opacity: 1,
              }}
              transition={shouldAnimate ? {
                type: 'spring', 
                damping: 25, 
                stiffness: 200,
                duration: 0.3
              } : { duration: 0 }}
              className={`fixed ${hudSide === 'right' ? 'right-0 border-l' : 'left-0 border-r'} top-0 bottom-0 bg-background border-border shadow-2xl z-[100] flex flex-col analysis-hud-panel ${
                isMinimized ? 'overflow-hidden' : ''
              } transition-all duration-300 ease-in-out`}
              style={{
                // Garantir que seja overlay absoluto, não comprime layout
                position: 'fixed',
                pointerEvents: 'auto',
                width: isMobile 
                  ? (isMinimized ? '60px' : '100%') 
                  : (isMinimized ? '80px' : `${hudWidth}px`),
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Mais espaçoso */}
              <div className={`p-4 sm:p-6 border-b border-border bg-backgroundSecondary shrink-0 ${isMinimized ? 'p-2' : ''}`}>
                {!isMinimized ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg sm:text-xl font-bold text-textPrimary flex items-center gap-2">
                        <span className="text-primary">{'</>'}</span>
                        <span className="hidden sm:inline">MODO ANÁLISE</span>
                        <span className="sm:hidden">ANÁLISE</span>
                      </h3>
                      <div className="flex items-center gap-2">
                        {/* Botão minimizar - direção muda baseado no lado do HUD */}
                        <button
                          onClick={() => setIsMinimized(true)}
                          className={`text-textMuted hover:text-textPrimary transition-colors ${
                            isMobile ? 'p-2 bg-backgroundHover rounded-lg' : 'p-1'
                          }`}
                          title="Minimizar painel"
                        >
                          {hudSide === 'right' ? (
                            isMobile ? (
                              <ChevronRight className="w-6 h-6" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )
                          ) : (
                            isMobile ? (
                              <ChevronLeft className="w-6 h-6" />
                            ) : (
                              <ChevronLeft className="w-5 h-5" />
                            )
                          )}
                        </button>
                        <button
                          onClick={disable}
                          className={`text-textMuted hover:text-textPrimary transition-colors ${
                            isMobile ? 'p-2 bg-backgroundHover rounded-lg' : 'p-1'
                          }`}
                          title="Fechar modo análise"
                        >
                          {isMobile ? (
                            <X className="w-6 h-6" />
                          ) : (
                            <X className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-textSecondary">
                        <span>Progresso</span>
                        <span className="font-semibold">{currentStepIndex + 1} de {steps.length}</span>
                      </div>
                      <div className="h-2.5 bg-backgroundHover rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  /* Versão minimizada - com navegação */
                  <div className="flex flex-col items-center gap-4 h-full justify-between py-4">
                    <div className="flex flex-col items-center gap-4 flex-1">
                      <div className="text-primary text-xl font-bold">{'</>'}</div>
                      <div className="h-32 w-1 bg-backgroundHover rounded-full overflow-hidden relative">
                        <motion.div
                          className="w-full bg-primary absolute bottom-0"
                          initial={{ height: 0 }}
                          animate={{ height: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <div className="text-xs text-textSecondary font-semibold" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                        {currentStepIndex + 1}/{steps.length}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {/* Botão anterior */}
                      {currentStepIndex > 0 && (
                        <button
                          onClick={prevStep}
                          className="text-textMuted hover:text-textPrimary transition-colors p-1"
                          title="Passo anterior"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                      )}
                      {/* Botão próximo */}
                      {currentStepIndex < steps.length - 1 && (
                        <button
                          onClick={nextStep}
                          className="text-textMuted hover:text-textPrimary transition-colors p-1"
                          title="Próximo passo"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      )}
                      {/* Botão expandir */}
                      <button
                        onClick={() => setIsMinimized(false)}
                        className="text-textMuted hover:text-textPrimary transition-colors p-1"
                        title="Expandir painel"
                      >
                        {hudSide === 'right' ? (
                          <ChevronLeft className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                      {/* Botão fechar */}
                      <button
                        onClick={disable}
                        className="text-textMuted hover:text-destructive transition-colors p-1"
                        title="Fechar modo análise"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Content - Scrollable com mais espaço (oculto quando minimizado) */}
              {!isMinimized && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Loading durante autenticação automática */}
                {isLoginLoading && currentStep?.autoLogin && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in">
                    <Spinner size="lg" />
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold text-textPrimary">
                        Autenticando...
                      </p>
                      <p className="text-sm text-textSecondary">
                        Fazendo login automaticamente com credenciais de demonstração.
                        <br />
                        Aguarde enquanto processamos sua autenticação.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Conteúdo do passo (oculto durante loading de login) */}
                {(!isLoginLoading || !currentStep?.autoLogin) && (
                  <>
                    <AnalysisStepContent />
                    {/* Seção de contato no último passo */}
                    {currentStepIndex === steps.length - 1 && (
                      <div className="mt-8 pt-6 border-t border-border">
                        <AnalysisContact />
                      </div>
                    )}
                  </>
                )}
              </div>
              )}

              {/* Footer - Fixed com mais espaço (oculto quando minimizado) */}
              {!isMinimized && (
              <div className="p-4 sm:p-6 border-t border-border bg-backgroundSecondary space-y-5 shrink-0">
                {/* Feedback */}
                <AnalysisFeedback />

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                    className="flex-1 h-11"
                  >
                    <ChevronLeft className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Anterior</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="default"
                    onClick={nextStep}
                    disabled={isLoginLoading && currentStep?.autoLogin}
                    className="flex-1 h-11"
                  >
                    {isLoginLoading && currentStep?.autoLogin ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:mr-2 animate-spin" />
                        <span>Aguardando...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">
                          {currentStepIndex === steps.length - 1 ? 'Concluir' : 'Próximo'}
                        </span>
                        <span className="sm:hidden">
                          {currentStepIndex === steps.length - 1 ? 'Fim' : 'Próx'}
                        </span>
                        <ChevronRight className="w-4 h-4 sm:ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Exit Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={disable}
                  className="w-full text-textMuted hover:text-destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Sair do Modo Análise
                </Button>
              </div>
              )}
            </motion.div>

            {/* Botão flutuante para expandir quando minimizado (mobile) */}
            {isMinimized && isMobile && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-4 right-4 z-[101] bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-hover transition-colors"
                title="Expandir painel"
              >
                <Menu className="w-6 h-6" />
              </motion.button>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}
