'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AnalysisModeContextType, AnalysisModeChoice, AnalysisStep } from '@/types/analysis';
import { analysisSteps } from '@/lib/analysis-steps';
import { AnalysisOverlay } from '@/components/analysis/AnalysisOverlay';
// Removido import de logout - modo análise não requer autenticação
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
  const queryClient = useQueryClient();
  
  const [enabled, setEnabled] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [choice, setChoiceState] = useState<AnalysisModeChoice>(null);

  // Tratamento de erro global - apenas logar, não deslogar (modo análise não requer autenticação)
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (enabled) {
        console.error('Erro detectado no modo análise:', event.error);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (enabled) {
        console.error('Promise rejeitada no modo análise:', event.reason);
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
  useEffect(() => {
    if (!enabled) return;
    
    const currentStep = analysisSteps[currentStepIndex];
    if (currentStep && pathname !== currentStep.route) {
      router.push(currentStep.route);
    }
  }, [enabled, currentStepIndex, pathname, router]);

  // Adicionar/remover classe no body para overlay e proteção de segurança
  useEffect(() => {
    if (enabled) {
      document.body.classList.add('analysis-mode-enabled');
      
      // Proteção adicional: prevenir interações via JavaScript
      // IMPORTANTE: Funciona mesmo quando HUD está minimizado
      const preventInteraction = (e: Event) => {
        // Permitir apenas eventos do HUD e modais
        const target = e.target as HTMLElement;
        if (target && target.closest) {
          // Permitir interação no HUD
          if (target.closest('.analysis-hud-panel')) {
            return;
          }
          // Permitir interação em modais (Dialog, AlertDialog, etc)
          if (target.closest('[role="dialog"]') || 
              target.closest('[data-radix-portal]') ||
              target.closest('.radix-dialog') ||
              target.closest('[id*="radix"]')) {
            return;
          }
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

  const enable = useCallback(async () => {
    setEnabled(true);
    setCurrentStepIndex(0);
  }, []);

  const disable = useCallback(async () => {
    setEnabled(false);
    setCurrentStepIndex(0);
    setHighlightedElement(null);
    
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
    
    toast.success('Modo Análise encerrado', {
      description: 'Obrigado por explorar o projeto!',
    });
    
    // Redirecionar para home
    router.push('/');
  }, [router]);

  const setChoice = useCallback((newChoice: AnalysisModeChoice) => {
    setChoiceState(newChoice);
    if (newChoice) {
      localStorage.setItem(CHOICE_KEY, newChoice);
    }
    
    // NÃO habilitar automaticamente - o HUD vai verificar se precisa mostrar modal de nome primeiro
    if (newChoice === 'analysis') {
      // Verificar se já tem nome antes de habilitar
      const savedName = localStorage.getItem('analysis_mode_visitor_name');
      if (savedName && savedName.trim()) {
        // Se já tem nome, habilitar direto
        enable();
      } else {
        // Se não tem nome, habilitar mas o HUD vai mostrar o modal primeiro
        enable();
      }
    }
  }, [enable]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < analysisSteps.length) {
      setCurrentStepIndex(index);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < analysisSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Último passo - mostrar mensagem de conclusão
      toast.success('Modo Análise Concluído!', {
        description: 'Obrigado por explorar o projeto!'
      });
      disable();
    }
  }, [currentStepIndex, disable]);

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
        isLoginLoading: false, // Não há mais login automático
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
