'use client';

import { AcademicNoticeModal } from './academic-notice-modal';

/**
 * Wrapper para gerenciar as features acadêmicas globalmente
 * O tour de análise agora é gerenciado pelo AnalysisModeContext
 */
export function AcademicFeaturesWrapper({ children }: { children: React.ReactNode }) {
  const handleStartTour = () => {
    // O tour agora é ativado via AnalysisModeContext
    // Este handler pode ser usado para lógica adicional se necessário
  };

  return (
    <>
      {/* Modal de primeiro acesso */}
      <AcademicNoticeModal onStartTour={handleStartTour} />

      {children}
    </>
  );
}
