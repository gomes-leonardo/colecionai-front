'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAnalysisMode } from '@/contexts/AnalysisModeContext';
import ReactMarkdown from 'react-markdown';

export function AnalysisStepContent() {
  const { currentStep } = useAnalysisMode();
  const [showTechnical, setShowTechnical] = useState(false);

  if (!currentStep) return null;

  return (
    <div className="space-y-4">
      {/* Subtítulo (Passo X de Y) */}
      {currentStep.subtitle && (
        <p className="text-sm font-medium text-primary">
          {currentStep.subtitle}
        </p>
      )}

      {/* Título */}
      <h2 className="text-2xl font-semibold text-textPrimary">
        {currentStep.title}
      </h2>

      {/* Descrição */}
      <div className="prose prose-sm max-w-none text-textSecondary leading-relaxed whitespace-pre-line">
        <ReactMarkdown>
          {currentStep.description}
        </ReactMarkdown>
      </div>

      {/* Detalhes Técnicos (Colapsável) */}
      {currentStep.technicalNotes && (
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="w-full px-4 py-3 bg-backgroundSecondary hover:bg-backgroundHover transition-colors flex items-center justify-between text-left"
          >
            <span className="font-medium text-textPrimary flex items-center gap-2">
              <span className="text-primary">{'</>'}</span>
              Detalhes Técnicos
            </span>
            {showTechnical ? (
              <ChevronUp className="w-4 h-4 text-textMuted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-textMuted" />
            )}
          </button>
          
          {showTechnical && (
            <div className="p-4 bg-background border-t border-border">
              <div className="prose prose-sm max-w-none prose-pre:bg-backgroundSecondary prose-pre:border prose-pre:border-border prose-code:text-primary">
                <ReactMarkdown>
                  {currentStep.technicalNotes}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
