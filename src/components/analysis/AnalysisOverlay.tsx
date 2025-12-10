'use client';

import { useEffect, useRef, useState } from 'react';

interface AnalysisOverlayProps {
  targetElement: HTMLElement | null;
  enabled: boolean;
  currentStepId?: string;
  currentRoute?: string;
}

export function AnalysisOverlay({ targetElement, enabled, currentStepId, currentRoute }: AnalysisOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  
  // Rotas que não devem ter blur (permitir visualização parcial)
  const noBlurRoutes = ['/dashboard', '/auctions'];
  const noBlurStepIds = ['auction-system', 'user-messaging'];
  const shouldShowBlur = !noBlurRoutes.includes(currentRoute || '') && !noBlurStepIds.includes(currentStepId || '');

  useEffect(() => {
    if (!enabled) {
      setIsVisible(false);
      setSpotlightRect(null);
      return;
    }

    setIsVisible(true);

    // Se não há elemento alvo, mostrar overlay completo sem buraco
    if (!targetElement) {
      setSpotlightRect(null);
      return;
    }

    const updateSpotlight = () => {
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      setSpotlightRect(rect);
    };

    // Atualizar imediatamente
    updateSpotlight();

    // Event listeners para atualização
    const handleUpdate = () => {
      requestAnimationFrame(updateSpotlight);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    // MutationObserver para detectar mudanças no elemento
    const observer = new MutationObserver(handleUpdate);
    observer.observe(targetElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: false,
      subtree: false,
    });

    // Também observar mudanças no body (para scroll)
    const resizeObserver = new ResizeObserver(handleUpdate);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [enabled, targetElement]);

  if (!enabled) return null;

  const padding = 30; // Aumentado de 20 para 30 para spotlight maior
  const borderRadius = 16; // Border radius para arredondar as bordas do spotlight

  // Se não há elemento alvo, mostrar overlay completo sem buraco
  if (!spotlightRect || !targetElement) {
    // Se não deve ter blur, não mostrar overlay
    if (!shouldShowBlur) {
      return null;
    }
    
    return (
      <div
        ref={overlayRef}
        id="analysis-spotlight-overlay"
        className="fixed inset-0 pointer-events-none z-[46]"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'opacity 0.3s ease',
          opacity: isVisible ? 1 : 0,
        }}
        aria-hidden="true"
      />
    );
  }
  
  // Se não deve ter blur, não mostrar overlay
  if (!shouldShowBlur) {
    return null;
  }

  // Calcular posições do "buraco" com padding e border-radius
  const left = Math.max(0, spotlightRect.left - padding);
  const top = Math.max(0, spotlightRect.top - padding);
  const right = Math.min(window.innerWidth, spotlightRect.right + padding);
  const bottom = Math.min(window.innerHeight, spotlightRect.bottom + padding);
  const width = right - left;
  const height = bottom - top;

  return (
    <>
      {/* Overlay escuro com blur - Topo */}
      {top > 0 && shouldShowBlur && (
        <div
          className="fixed pointer-events-none z-[46]"
          style={{
            left: 0,
            top: 0,
            width: '100%',
            height: `${top}px`,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'opacity 0.3s ease',
            opacity: isVisible ? 1 : 0,
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Overlay escuro com blur - Esquerda (com border-radius no canto superior esquerdo) */}
      {left > 0 && shouldShowBlur && (
        <div
          className="fixed pointer-events-none z-[46]"
          style={{
            left: 0,
            top: `${top}px`,
            width: `${left}px`,
            height: `${height}px`,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderTopRightRadius: `${borderRadius}px`,
            borderBottomRightRadius: `${borderRadius}px`,
            transition: 'opacity 0.3s ease',
            opacity: isVisible ? 1 : 0,
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Overlay escuro com blur - Direita (com border-radius no canto superior direito) */}
      {right < window.innerWidth && shouldShowBlur && (
        <div
          className="fixed pointer-events-none z-[46]"
          style={{
            left: `${right}px`,
            top: `${top}px`,
            width: `${window.innerWidth - right}px`,
            height: `${height}px`,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderTopLeftRadius: `${borderRadius}px`,
            borderBottomLeftRadius: `${borderRadius}px`,
            transition: 'opacity 0.3s ease',
            opacity: isVisible ? 1 : 0,
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Overlay escuro com blur - Fundo */}
      {bottom < window.innerHeight && shouldShowBlur && (
        <div
          className="fixed pointer-events-none z-[46]"
          style={{
            left: 0,
            top: `${bottom}px`,
            width: '100%',
            height: `${window.innerHeight - bottom}px`,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'opacity 0.3s ease',
            opacity: isVisible ? 1 : 0,
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
