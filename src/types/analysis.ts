export type AnalysisStep = {
  id: string;
  route: string;
  title: string;
  subtitle?: string;
  description: string;
  technicalNotes?: string;
  highlightSelector?: string;
  fields?: AnalysisField[];
  autoLogin?: boolean; // Flag para trigger auto-login
  hudSide?: 'left' | 'right'; // Lado do HUD (padrão: right)
  hudWidth?: number; // Largura customizada do HUD quando expandido (padrão: 550px)
};

export type AnalysisField = {
  selector: string;
  label: string;
  description: string;
  validation: string;
  backendValidation?: string;
};

export type AnalysisFeedback = {
  stepId: string;
  value: 'like' | 'dislike' | 'can-improve';
  timestamp: string;
  justification?: string;
};

export type AnalysisModeChoice = 'analysis' | 'normal' | null;

export interface AnalysisModeContextType {
  enabled: boolean;
  currentStepIndex: number;
  currentStep: AnalysisStep | null;
  steps: AnalysisStep[];
  choice: AnalysisModeChoice;
  isLoginLoading: boolean; // Indica se o login automático está em progresso
  
  // Métodos
  enable: () => void;
  disable: () => void;
  setChoice: (choice: AnalysisModeChoice) => void;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitFeedback: (value: 'like' | 'dislike' | 'can-improve', justification?: string) => Promise<void>;
}
