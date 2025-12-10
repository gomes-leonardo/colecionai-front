'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { AnalysisModeContextType, AnalysisModeChoice, AnalysisStep } from '@/types/analysis';
import { analysisSteps } from '@/lib/analysis-steps';
import { AnalysisOverlay } from '@/components/analysis/AnalysisOverlay';
import { logout } from '@/services/authService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CHOICE_KEY = 'colecionai_analysis_choice_v1';
const FEEDBACKS_KEY = 'analysis_feedbacks';

const AnalysisModeContext = createContext<AnalysisModeContextType | undefined>(undefined);

export function AnalysisModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [enabled, setEnabled] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [choice, setChoiceState] = useState<AnalysisModeChoice>(null);
  const [loginFailed, setLoginFailed] = useState(false); // Flag para prevenir loops
  const [isLoginLoading, setIsLoginLoading] = useState(false); // Estado para indicar se o login está em progresso (para UI)
  const [showLoginErrorModal, setShowLoginErrorModal] = useState(false); // Estado para controlar modal de erro de login
  
  // Refs para garantir que login só é tentado UMA vez, mesmo que effect rode múltiplas vezes
  const loginAttemptedRef = useRef(false);
  const loginInProgressRef = useRef(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tratamento de erro global - sempre deslogar em caso de erro
  useEffect(() => {
    const handleError = async (event: ErrorEvent) => {
      // Se modo análise está ativo e há erro, deslogar usuário de teste
      if (enabled) {
        console.error('Erro detectado no modo análise:', event.error);
        try {
          await logout();
          if (typeof window !== 'undefined') {
            localStorage.removeItem('colecionai.user');
            // Cookie será limpo pelo backend
          }
          toast.warning('Sessão encerrada por segurança', {
            description: 'Um erro foi detectado no modo análise. Você foi deslogado automaticamente por segurança.',
            duration: 5000,
          });
        } catch (e) {
          // Ignorar erros de logout, mas garantir limpeza
          if (typeof window !== 'undefined') {
            localStorage.removeItem('colecionai.user');
            // Cookie será limpo pelo backend
          }
          toast.warning('Sessão encerrada por segurança', {
            description: 'Um erro foi detectado no modo análise. Você foi deslogado automaticamente por segurança.',
            duration: 5000,
          });
        }
      }
    };

    const handleUnhandledRejection = async (event: PromiseRejectionEvent) => {
      // Se modo análise está ativo e há promise rejeitada, deslogar usuário de teste
      if (enabled) {
        console.error('Promise rejeitada no modo análise:', event.reason);
        try {
          await logout();
          if (typeof window !== 'undefined') {
            localStorage.removeItem('colecionai.user');
            // Cookie será limpo pelo backend
          }
          toast.warning('Sessão encerrada por segurança', {
            description: 'Um erro foi detectado no modo análise. Você foi deslogado automaticamente por segurança.',
            duration: 5000,
          });
        } catch (e) {
          // Ignorar erros de logout, mas garantir limpeza
          if (typeof window !== 'undefined') {
            localStorage.removeItem('colecionai.user');
            // Cookie será limpo pelo backend
          }
          toast.warning('Sessão encerrada por segurança', {
            description: 'Um erro foi detectado no modo análise. Você foi deslogado automaticamente por segurança.',
            duration: 5000,
          });
        }
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [enabled]);

  // Carregar escolha do localStorage (mas NÃO ativar automaticamente)
  useEffect(() => {
    const savedChoice = localStorage.getItem(CHOICE_KEY) as AnalysisModeChoice;
    if (savedChoice) {
      setChoiceState(savedChoice);
      // NÃO ativar automaticamente - usuário precisa clicar no botão
    }
  }, []);

  // Navegar automaticamente para a rota do passo atual
  // IMPORTANTE: Não navegar se o login falhou (previne loops)
  useEffect(() => {
    // NÃO navegar se modo análise não está habilitado, login falhou, ou está em progresso de login
    if (!enabled || loginFailed || loginInProgressRef.current) return;
    
    const currentStep = analysisSteps[currentStepIndex];
    if (currentStep && pathname !== currentStep.route) {
      router.push(currentStep.route);
    }
  }, [enabled, currentStepIndex, pathname, router, loginFailed]);

  // Adicionar/remover classe no body para overlay e proteção de segurança
  useEffect(() => {
    if (enabled) {
      document.body.classList.add('analysis-mode-enabled');
      
      // Proteção adicional: prevenir interações via JavaScript
      // IMPORTANTE: Funciona mesmo quando HUD está minimizado
      const preventInteraction = (e: Event) => {
        // Permitir apenas eventos do HUD
        const target = e.target as HTMLElement;
        if (target && target.closest && target.closest('.analysis-hud-panel')) {
          return; // Permitir interação no HUD
        }
        // Bloquear TODAS as outras interações, mesmo quando HUD está minimizado
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Mostrar toast de aviso se for um clique
        if (e.type === 'click' || e.type === 'mousedown') {
          toast.warning('Modo Análise Ativo', {
            description: 'Interações bloqueadas. Use o HUD para navegar.',
            duration: 3000,
          });
        }
        
        return false;
      };
      
      // Bloquear vários tipos de eventos
      const events = ['click', 'mousedown', 'mouseup', 'keydown', 'keypress', 'keyup', 'submit', 'change', 'input', 'focus', 'blur', 'touchstart', 'touchend'];
      events.forEach(eventType => {
        document.addEventListener(eventType, preventInteraction, { capture: true, passive: false });
      });
      
      return () => {
        document.body.classList.remove('analysis-mode-enabled');
        events.forEach(eventType => {
          document.removeEventListener(eventType, preventInteraction, { capture: true });
        });
      };
    } else {
      document.body.classList.remove('analysis-mode-enabled');
    }
    
    return () => {
      document.body.classList.remove('analysis-mode-enabled');
    };
  }, [enabled]);

  // Estado para armazenar o elemento destacado
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  // Função para encontrar o container apropriado do elemento
  // Se for um campo individual (input, button), retorna o container mais próximo (FormItem)
  // Se for um elemento grande (form), retorna o form completo
  const findHighlightContainer = (element: HTMLElement, isIndividualField: boolean = false): HTMLElement => {
    // Se é um campo individual (input, button, etc.), procurar pelo FormItem mais próximo
    if (isIndividualField) {
      let current: HTMLElement | null = element.parentElement;
      
      // Procurar por FormItem ou container de campo
      while (current && current !== document.body) {
        const classList = Array.from(current.classList || []);
        const tagName = current.tagName.toLowerCase();
        
        // Se encontrar um FormItem (prioridade máxima), usar ele
        if (classList.some(cls => 
          cls.includes('FormItem') || 
          cls.includes('form-item')
        )) {
          return current;
        }
        
        // Se encontrar um div que contém um label e o input atual, usar ele
        if (tagName === 'div' && current.querySelector('label') && current.contains(element)) {
          return current;
        }
        
        current = current.parentElement;
      }
      
      // Se não encontrou FormItem, procurar pelo container que tem o label e input juntos
      current = element.parentElement;
      while (current && current !== document.body) {
        const hasLabel = current.querySelector('label');
        const hasInput = current.querySelector('input, textarea, select, button');
        if (hasLabel && hasInput && current.contains(element)) {
          return current;
        }
        current = current.parentElement;
      }
      
      // Se não encontrou nada, usar o próprio elemento ou o pai direto
      return element.parentElement || element;
    }
    
    // Se não é campo individual, procurar pelo form completo ou container grande
    if (element.tagName === 'FORM') {
      return element;
    }
    
    // Procurar pelo form mais próximo primeiro (para elementos grandes como login)
    let current: HTMLElement | null = element.parentElement;
    while (current && current !== document.body) {
      if (current.tagName === 'FORM') {
        return current;
      }
      current = current.parentElement;
    }
    
    // Se não encontrou form, procurar por containers apropriados
    current = element.parentElement;
    while (current && current !== document.body) {
      const classList = Array.from(current.classList || []);
      const tagName = current.tagName.toLowerCase();
      
      // Se encontrar um container apropriado (form, section, card, etc.), usar ele
      if (
        tagName === 'form' ||
        tagName === 'section' ||
        classList.some(cls => 
          cls.includes('card') ||
          cls.includes('Card') ||
          cls.includes('container')
        )
      ) {
        return current;
      }
      current = current.parentElement;
    }
    
    // Se não encontrar container apropriado, usar o próprio elemento
    return element;
  };

  // Highlight de elementos com spotlight real - SEMPRE ativo
  useEffect(() => {
    if (!enabled) {
      setHighlightedElement(null);
      // Limpar highlights ao desabilitar
      const highlighted = document.querySelectorAll('.analysis-highlight');
      highlighted.forEach(el => {
        el.classList.remove('analysis-highlight');
        const htmlEl = el as HTMLElement;
        htmlEl.style.transition = '';
        htmlEl.style.opacity = '';
        htmlEl.style.transform = '';
      });
      return;
    }
    
    const currentStep = analysisSteps[currentStepIndex];
    const cleanupTimeouts: NodeJS.Timeout[] = [];
    
    // Delay maior para garantir que o DOM foi completamente renderizado
    const timer = setTimeout(() => {
      // Limpar highlights anteriores
      const prevHighlighted = document.querySelectorAll('.analysis-highlight');
      prevHighlighted.forEach(el => {
        const htmlEl = el as HTMLElement;
        el.classList.remove('analysis-highlight');
        htmlEl.style.transition = '';
        htmlEl.style.opacity = '';
        htmlEl.style.transform = '';
      });
      
      let targetElement: HTMLElement | null = null;
      
      // Se há highlightSelector específico, usar ele (campo individual)
      if (currentStep?.highlightSelector) {
        // Tentar múltiplas vezes com diferentes seletores
        let specificElement = document.querySelector(currentStep.highlightSelector) as HTMLElement;
        
        // Se não encontrou, tentar variações do seletor
        if (!specificElement) {
          // Extrair o nome do campo do seletor
          const nameMatch = currentStep.highlightSelector.match(/name="([^"]+)"/);
          const fieldName = nameMatch ? nameMatch[1] : '';
          
          // Tentar diferentes variações de seletores
          const selectorVariations = [
            currentStep.highlightSelector,
            // Tentar por tipo de input
            fieldName === 'email' ? 'input[type="email"]' : null,
            fieldName === 'password' ? 'input[type="password"]' : null,
            // Tentar encontrar pelo label próximo
            fieldName === 'email' ? 'input[placeholder*="email" i], input[placeholder*="Email"]' : null,
            fieldName === 'password' ? 'input[type="password"]' : null,
            // Tentar encontrar pelo FormItem que contém o label
            fieldName ? `form label:has-text("${fieldName === 'email' ? 'Email' : 'Senha'}")` : null,
          ].filter(Boolean) as string[];
          
          // Tentar cada variação
          for (const selector of selectorVariations) {
            try {
              specificElement = document.querySelector(selector) as HTMLElement;
              if (specificElement) break;
            } catch (e) {
              // Seletor inválido, continuar
            }
          }
          
          // Se ainda não encontrou, tentar encontrar pelo label e pegar o input próximo
          if (!specificElement && fieldName) {
            const labels = Array.from(document.querySelectorAll('label'));
            const targetLabel = labels.find(label => {
              const text = label.textContent?.toLowerCase() || '';
              if (fieldName === 'email') return text.includes('email');
              if (fieldName === 'password') return text.includes('senha') || text.includes('password');
              return false;
            });
            
            if (targetLabel) {
              // Procurar o input mais próximo do label
              const formItem = targetLabel.closest('[class*="FormItem"], [class*="form-item"], div');
              if (formItem) {
                const input = formItem.querySelector('input') as HTMLElement;
                if (input) specificElement = input;
              }
            }
          }
        }
        
        if (specificElement) {
          // Para campos individuais, usar o container mais próximo (FormItem), não o form completo
          targetElement = findHighlightContainer(specificElement, true);
        } else {
          console.warn('Element not found:', currentStep.highlightSelector, 'on route:', currentStep.route);
        }
      }
      
      // Se não encontrou elemento específico, usar container da página
      if (!targetElement) {
        const spotlightSelectors: Record<string, string> = {
          '/': 'main',
          '/login': 'form',
          '/register': 'form',
          '/verify': 'form', // Vai buscar o form primeiro
          '/forgot-password': 'form',
          '/dashboard': '', // Dashboard não deve ter spotlight - deixar tudo exposto
          '/auctions': '', // Leilões não devem ter spotlight - deixar tudo exposto
          '/announce': 'form',
        };
        
        const selector = spotlightSelectors[currentStep.route];
        if (selector) {
          const foundElement = document.querySelector(selector) as HTMLElement;
          if (foundElement) {
            // Para /verify, pegar o container pai que envolve título + form
            if (currentStep.route === '/verify') {
              // Procurar pelo container pai que tem o título e o form
              const parentContainer = foundElement.parentElement?.closest('div[class*="space-y"]') ||
                                     foundElement.parentElement ||
                                     foundElement;
              targetElement = parentContainer as HTMLElement;
            } else if (selector === 'form') {
              targetElement = foundElement;
            } else {
              targetElement = foundElement;
            }
          }
        }
        // Se é dashboard ou auctions e não encontrou nada, não destacar nada (deixar tudo exposto)
        if ((currentStep.route === '/dashboard' || currentStep.route === '/auctions') && !targetElement) {
          setHighlightedElement(null);
          return;
        }
        
        // Para passos específicos (leilão e mensagens), não aplicar spotlight - deixar tudo visível
        if (currentStep?.id === 'auction-system' || currentStep?.id === 'user-messaging') {
          setHighlightedElement(null);
          return;
        }
      }
      
      // Abrir componentes automaticamente baseado no passo
      if (currentStep?.id === 'shopping-cart') {
        // Abrir carrinho programaticamente usando função global
        setTimeout(() => {
          if (typeof window !== 'undefined' && (window as any).openCart) {
            (window as any).openCart();
          } else {
            // Fallback: clicar no botão do carrinho
            const cartTrigger = document.querySelector('[data-cart-trigger]') as HTMLElement;
            if (cartTrigger) {
              cartTrigger.click();
            }
          }
        }, 500);
      } else if (currentStep?.id === 'user-messaging') {
        // Abrir chat programaticamente
        setTimeout(() => {
          if (typeof window !== 'undefined' && (window as any).openChat) {
            (window as any).openChat();
          } else {
            const chatTrigger = document.querySelector('[data-chat-trigger]') as HTMLElement;
            if (chatTrigger) chatTrigger.click();
          }
        }, 500);
      } else if (currentStep?.id === 'auction-system') {
        // Mostrar preview de leilão - procurar por elementos de leilão
        setTimeout(() => {
          const auctionCard = document.querySelector('[data-auction-preview]') as HTMLElement;
          if (auctionCard) {
            auctionCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
      
      // Se encontrou algum elemento para destacar
      if (targetElement) {
        // Adicionar classe de highlight imediatamente
        targetElement.classList.add('analysis-highlight');
        
        // Definir elemento destacado para o overlay
        setHighlightedElement(targetElement);
        
        // Scroll suave apenas se não for o primeiro passo (intro-landing)
        // O primeiro passo não precisa de scroll, apenas blur no fundo
        if (currentStep?.id !== 'intro-landing') {
          const scrollTimer = setTimeout(() => {
            const rect = targetElement!.getBoundingClientRect();
            const elementTop = rect.top + window.scrollY;
            const elementLeft = rect.left + window.scrollX;
            const elementCenterY = elementTop + (rect.height / 2);
            const elementCenterX = elementLeft + (rect.width / 2);
            
            // Calcular posição para centralizar o elemento
            const scrollY = elementCenterY - (window.innerHeight / 2);
            const scrollX = elementCenterX - (window.innerWidth / 2);
            
            window.scrollTo({
              top: Math.max(0, scrollY),
              left: Math.max(0, scrollX),
              behavior: 'smooth'
            });
          }, 200);
          cleanupTimeouts.push(scrollTimer);
        }
      } else {
        setHighlightedElement(null);
      }
    }, 600); // Aumentado para 600ms para garantir renderização completa
    cleanupTimeouts.push(timer);

    return () => {
      // Limpar todos os timeouts
      cleanupTimeouts.forEach(t => clearTimeout(t));
      // Limpar highlights ao sair
      const highlighted = document.querySelectorAll('.analysis-highlight');
      highlighted.forEach(el => {
        el.classList.remove('analysis-highlight');
        const htmlEl = el as HTMLElement;
        htmlEl.style.transition = '';
        htmlEl.style.opacity = '';
        htmlEl.style.transform = '';
      });
      setHighlightedElement(null);
    };
  }, [enabled, currentStepIndex, pathname]);

  // Auto-login quando necessário - tentar apenas 1 vez POR SESSAO
  useEffect(() => {
    // Se modo análise não está habilitado ou login já falhou, não fazer nada
    if (!enabled || loginFailed) {
      // Limpar timeout se existir
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }
      loginInProgressRef.current = false;
      setIsLoginLoading(false);
      return;
    }
    
    const currentStep = analysisSteps[currentStepIndex];
    
    // Se não é passo de auto-login, resetar refs (mas manter loginAttemptedRef para prevenir retentativas)
    if (!currentStep?.autoLogin) {
      loginInProgressRef.current = false;
      setIsLoginLoading(false);
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }
      return;
    }

    // CRITICAL: Se já tentou login UMA VEZ (mesmo que em outro passo), NÃO tentar novamente
    // Isso previne loops quando navegação falha ou há re-renders
    if (loginAttemptedRef.current) {
      return;
    }

    // Se já está em progresso, não iniciar outra tentativa
    if (loginInProgressRef.current) {
      return;
    }

    // Marcar que está tentando login AGORA
    loginAttemptedRef.current = true;
    loginInProgressRef.current = true;
    setIsLoginLoading(true); // Ativar loading na UI

    // Importação dinâmica para evitar circular dependency
    const performLogin = async () => {
      try {
        const { performAnalysisLogin } = await import('@/lib/analysis-auto-login');
        const loginResponse = await performAnalysisLogin();
        
        // Marcar que tentativa foi concluída
        loginInProgressRef.current = false;
        setIsLoginLoading(false); // Desativar loading
        loginTimeoutRef.current = null;
        
        if (!loginResponse || !loginResponse.token) {
          // IMPORTANTE: Desabilitar modo análise IMEDIATAMENTE e deslogar
          setLoginFailed(true);
          setEnabled(false);
          setCurrentStepIndex(0);
          
          // Limpar dados do usuário do localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('colecionai.user');
            // Cookie será limpo pelo backend
          }
          
          // Deslogar usuário de teste em caso de erro
          try {
            await logout();
            toast.warning('Sessão encerrada por segurança', {
              description: 'Falha no login automático. Você foi deslogado automaticamente por segurança.',
              duration: 5000,
            });
          } catch (e) {
            // Ignorar erros de logout, mas garantir limpeza do localStorage
            if (typeof window !== 'undefined') {
              localStorage.removeItem('colecionai.user');
              // Cookie será limpo pelo backend
            }
            toast.warning('Sessão encerrada por segurança', {
              description: 'Falha no login automático. Você foi deslogado automaticamente por segurança.',
              duration: 5000,
            });
          }
          
          // Mostrar modal de erro
          setShowLoginErrorModal(true);
          
          // NÃO redirecionar aqui - deixar o usuário onde está
          // O modal vai explicar o que aconteceu
        } else {
          // Se sucesso, resetar flag de falha mas MANTER loginAttemptedRef = true
          // para prevenir novas tentativas
          setLoginFailed(false);
          
          // Aguardar um pouco para garantir que o React Query reconhece o novo token
          // e faz a requisição /me antes de navegar
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Navegar para o próximo passo (dashboard) - o useEffect de navegação vai cuidar disso
          // Mas garantimos que não bloqueie devido ao loginFailed
        }
      } catch (error) {
        console.error('Erro no auto-login:', error);
        
        // Marcar que tentativa foi concluída
        loginInProgressRef.current = false;
        setIsLoginLoading(false); // Desativar loading
        loginTimeoutRef.current = null;
        
        // IMPORTANTE: Desabilitar modo análise IMEDIATAMENTE e deslogar
        setLoginFailed(true);
        setEnabled(false);
        setCurrentStepIndex(0);
        
        // Limpar dados do usuário do localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('colecionai.user');
          // Cookie será limpo pelo backend
        }
        
        // Deslogar usuário de teste em caso de erro
        try {
          await logout();
          toast.warning('Sessão encerrada por segurança', {
            description: 'Erro no login automático. Você foi deslogado automaticamente por segurança.',
            duration: 5000,
          });
        } catch (e) {
          // Ignorar erros de logout, mas garantir limpeza do localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('colecionai.user');
            // Cookie será limpo pelo backend
          }
          toast.warning('Sessão encerrada por segurança', {
            description: 'Erro no login automático. Você foi deslogado automaticamente por segurança.',
            duration: 5000,
          });
        }
        
        // Mostrar modal de erro
        setShowLoginErrorModal(true);
        
        // NÃO redirecionar aqui
      }
    };

    // Delay para dar tempo do usuário ler a mensagem
    loginTimeoutRef.current = setTimeout(performLogin, 1500);
    
    return () => {
      // Limpar timeout se component desmontar ou effect rodar novamente
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }
      // NÃO resetar loginAttemptedRef aqui - queremos manter que já tentou
      // Apenas marcar que não está mais em progresso
      loginInProgressRef.current = false;
      setIsLoginLoading(false);
    };
  }, [enabled, currentStepIndex, loginFailed]);

  // Auto-login quando necessário - tentar apenas 1 vez POR SESSAO
  useEffect(() => {
    // Se modo análise não está habilitado ou login já falhou, não fazer nada
    if (!enabled || loginFailed) {
      // Limpar timeout se existir
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }
      loginInProgressRef.current = false;
      setIsLoginLoading(false);
      return;
    }
    
    const currentStep = analysisSteps[currentStepIndex];
    
    // Se não é passo de auto-login, resetar refs (mas manter loginAttemptedRef para prevenir retentativas)
    if (!currentStep?.autoLogin) {
      loginInProgressRef.current = false;
      setIsLoginLoading(false);
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }
      return;
    }

    // CRITICAL: Se já tentou login UMA VEZ (mesmo que em outro passo), NÃO tentar novamente
    // Isso previne loops quando navegação falha ou há re-renders
    if (loginAttemptedRef.current) {
      return;
    }

    // Se já está em progresso, não iniciar outra tentativa
    if (loginInProgressRef.current) {
      return;
    }

    // Marcar que está tentando login AGORA
    loginAttemptedRef.current = true;
    loginInProgressRef.current = true;
    setIsLoginLoading(true); // Ativar loading na UI

    // Importação dinâmica para evitar circular dependency
    const performLogin = async () => {
      try {
        const { performAnalysisLogin } = await import('@/lib/analysis-auto-login');
        const loginResponse = await performAnalysisLogin();
        
        // Marcar que tentativa foi concluída
        loginInProgressRef.current = false;
        setIsLoginLoading(false); // Desativar loading
        loginTimeoutRef.current = null;
        
        if (!loginResponse || !loginResponse.token) {
          // IMPORTANTE: Desabilitar modo análise IMEDIATAMENTE
          // Usar callbacks para garantir ordem correta
          setLoginFailed(true);
          setEnabled(false);
          setCurrentStepIndex(0);
          
          // Limpar dados do usuário do localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('colecionai.user');
            // Cookie será limpo pelo backend
          }
          
          // Mostrar modal de erro
          setShowLoginErrorModal(true);
          
          // NÃO redirecionar aqui - deixar o usuário onde está
          // O modal vai explicar o que aconteceu
        } else {
          // Se sucesso, resetar flag de falha mas MANTER loginAttemptedRef = true
          // para prevenir novas tentativas
          setLoginFailed(false);
          
          // Aguardar um pouco para garantir que o React Query reconhece o novo token
          // e faz a requisição /me antes de navegar
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Navegar para o próximo passo (dashboard) - o useEffect de navegação vai cuidar disso
          // Mas garantimos que não bloqueie devido ao loginFailed
        }
      } catch (error) {
        console.error('Erro no auto-login:', error);
        
        // Marcar que tentativa foi concluída
        loginInProgressRef.current = false;
        setIsLoginLoading(false); // Desativar loading
        loginTimeoutRef.current = null;
        
        // IMPORTANTE: Desabilitar modo análise IMEDIATAMENTE
        setLoginFailed(true);
        setEnabled(false);
        setCurrentStepIndex(0);
        
        // Limpar dados do usuário do localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('colecionai.user');
          // Cookie será limpo pelo backend
        }
        
        // Mostrar modal de erro
        setShowLoginErrorModal(true);
        
        // NÃO redirecionar aqui
      }
    };

    // Delay para dar tempo do usuário ler a mensagem
    loginTimeoutRef.current = setTimeout(performLogin, 1500);
    
    return () => {
      // Limpar timeout se component desmontar ou effect rodar novamente
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
        loginTimeoutRef.current = null;
      }
      // NÃO resetar loginAttemptedRef aqui - queremos manter que já tentou
      // Apenas marcar que não está mais em progresso
      loginInProgressRef.current = false;
      setIsLoginLoading(false);
    };
  }, [enabled, currentStepIndex, loginFailed]);


  const enable = useCallback(async () => {
    // Verificar se há usuário logado e deslogar antes de iniciar modo análise
    // Com cookies httpOnly, não podemos verificar diretamente, mas tentamos fazer logout
    // para garantir que não há sessão anterior
    try {
      await logout();
      toast.info('Sessão limpa', {
        description: 'O modo análise requer autenticação própria. Qualquer sessão anterior foi encerrada.',
      });
    } catch (error) {
      // Se falhar, pelo menos limpa o localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('colecionai.user');
        // Cookie será limpo pelo backend
      }
    }
    
    setEnabled(true);
    setCurrentStepIndex(0);
    setLoginFailed(false); // Reset flag de falha ao reabilitar
    setIsLoginLoading(false); // Reset loading
    loginAttemptedRef.current = false; // Reset ref ao reabilitar - permitir nova tentativa
    loginInProgressRef.current = false;
    if (loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
      loginTimeoutRef.current = null;
    }
  }, []);

  const disable = useCallback(async () => {
    setEnabled(false);
    setCurrentStepIndex(0); // Reset para o início
    setHighlightedElement(null); // Limpar elemento destacado
    setLoginFailed(false); // Reset flag de falha
    
    // Restaurar scroll do body
    document.body.style.overflow = '';
    
    // Remove classe do body
    document.body.classList.remove('analysis-mode-enabled');
    
    // Remove todos os highlights
    const highlighted = document.querySelectorAll('.analysis-highlight');
    highlighted.forEach(el => {
      el.classList.remove('analysis-highlight');
      const htmlEl = el as HTMLElement;
      htmlEl.style.transition = '';
      htmlEl.style.opacity = '';
      htmlEl.style.transform = '';
    });
    
    // Remove todos os spotlights
    const spotlights = document.querySelectorAll('.analysis-spotlight');
    spotlights.forEach(el => el.classList.remove('analysis-spotlight'));
    
    // Deslogar automaticamente o usuário logado pelo modo análise
    try {
      await logout();
      toast.info('Sessão encerrada', {
        description: 'Você foi deslogado automaticamente ao sair do modo análise.',
        duration: 4000,
      });
    } catch (error) {
      // Se falhar, pelo menos limpa o localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('colecionai.user');
        // Cookie será limpo pelo backend
      }
      toast.info('Sessão encerrada', {
        description: 'Você foi deslogado automaticamente ao sair do modo análise.',
        duration: 4000,
      });
    }
    
    toast.success('Modo Análise encerrado', {
      description: 'Você foi deslogado automaticamente.',
    });
    
    // Redirecionar para home
    router.push('/');
  }, [router]);

  const setChoice = useCallback((newChoice: AnalysisModeChoice) => {
    setChoiceState(newChoice);
    if (newChoice) {
      localStorage.setItem(CHOICE_KEY, newChoice);
    }
    
    if (newChoice === 'analysis') {
      enable();
    }
  }, [enable]);

  const goToStep = useCallback((index: number) => {
    // Bloquear navegação para passos além do atual se login está em progresso
    const targetStep = analysisSteps[index];
    const currentStep = analysisSteps[currentStepIndex];
    
    if (currentStep?.autoLogin && (loginInProgressRef.current || isLoginLoading)) {
      toast.info('Aguarde a autenticação', {
        description: 'Não é possível avançar enquanto o login está em progresso.',
      });
      return;
    }
    
    if (index >= 0 && index < analysisSteps.length) {
      setCurrentStepIndex(index);
    }
  }, [currentStepIndex, isLoginLoading]);

  const nextStep = useCallback(() => {
    const currentStep = analysisSteps[currentStepIndex];
    
    // Se está no passo de auto-login e o login ainda está em progresso, bloquear avanço
    if (currentStep?.autoLogin && (loginInProgressRef.current || isLoginLoading)) {
      toast.info('Aguarde a autenticação', {
        description: 'Estamos fazendo login automaticamente. Aguarde um momento...',
      });
      return;
    }
    
    // Se está no passo de auto-login e o login ainda não foi tentado, não permitir avançar
    if (currentStep?.autoLogin && !loginAttemptedRef.current) {
      toast.info('Aguarde a autenticação', {
        description: 'O login automático será iniciado em breve. Aguarde...',
      });
      return;
    }
    
    // Se está no passo de auto-login e o login falhou, não permitir avançar
    if (currentStep?.autoLogin && loginFailed) {
      return; // Modal de erro já deve estar aberto
    }
    
    if (currentStepIndex < analysisSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Último passo - mostrar mensagem de conclusão
      toast.success('Modo Análise Concluído!', {
        description: 'Você completou todos os passos do tour técnico.'
      });
      disable();
    }
  }, [currentStepIndex, disable, isLoginLoading, loginFailed]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const submitFeedback = useCallback(async (value: 'like' | 'dislike' | 'can-improve', justification?: string) => {
    const currentStep = analysisSteps[currentStepIndex];
    
    // Salvar localmente
    const feedbacks = JSON.parse(localStorage.getItem(FEEDBACKS_KEY) || '[]');
    feedbacks.push({
      stepId: currentStep.id,
      value,
      justification: justification || '',
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(feedbacks));
    
    toast.success('Obrigado pelo feedback!');
    
    // TODO: Quando backend estiver pronto, descomentar
    /*
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: currentStep.id,
          value,
          justification,
          source: 'analysis-mode',
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.warn('Feedback endpoint não disponível:', error);
    }
    */
  }, [currentStepIndex]);

  const currentStep = analysisSteps[currentStepIndex] || null;

  return (
    <AnalysisModeContext.Provider
      value={{
        enabled,
        currentStepIndex,
        currentStep,
        steps: analysisSteps,
        choice,
        isLoginLoading,
        enable,
        disable,
        setChoice,
        goToStep,
        nextStep,
        prevStep,
        submitFeedback,
      }}
    >
      {children}
      {/* Overlay de Spotlight */}
      <AnalysisOverlay 
        targetElement={highlightedElement} 
        enabled={enabled}
        currentStepId={currentStep?.id}
        currentRoute={currentStep?.route}
      />
      {/* Modal de erro de login */}
      <AlertDialog 
        open={showLoginErrorModal} 
        onOpenChange={(open) => {
          // Só permitir fechar clicando no botão ou fora
          if (!open && !loginFailed) {
            setShowLoginErrorModal(false);
          }
        }}
      >
        <AlertDialogContent className="bg-background border-border z-[110] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Usuário de Teste Não Configurado</AlertDialogTitle>
            <AlertDialogDescription className="text-textSecondary mt-2">
              O usuário de teste do Modo Análise ainda não foi configurado neste ambiente. 
              <br /><br />
              O Modo Análise foi encerrado automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction
            onClick={() => {
              setShowLoginErrorModal(false);
              setLoginFailed(false); // Reset flag ao fechar modal
              // Garantir que vai para home, especialmente se estiver em rota protegida
              if (pathname.startsWith('/dashboard') || pathname.startsWith('/announce')) {
                router.push('/');
              }
            }}
            className="w-full sm:w-auto"
          >
            Entendi
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </AnalysisModeContext.Provider>
  );
}

export function useAnalysisMode() {
  const context = useContext(AnalysisModeContext);
  if (context === undefined) {
    throw new Error('useAnalysisMode must be used within AnalysisModeProvider');
  }
  return context;
}
