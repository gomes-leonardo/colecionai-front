'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Code2, BookOpen, Sparkles, AlertCircle, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAnalysisMode } from '@/contexts/AnalysisModeContext';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';
import { AnalysisFeedback } from './AnalysisFeedback';

// Import dinâmico para evitar problemas de SSR
const CodeBlock = dynamic(() => import('./CodeBlock').then(mod => ({ default: mod.CodeBlock })), {
  ssr: false,
  loading: () => (
    <div className="my-4 p-4 bg-backgroundSecondary rounded-lg border border-border animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-muted rounded w-full"></div>
    </div>
  ),
});

// Componente para Callouts tipo Notion
function Callout({ type = 'info', children }: { type?: 'info' | 'warning' | 'success' | 'error'; children: React.ReactNode }) {
  const config = {
    info: {
      icon: Info,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    success: {
      icon: CheckCircle2,
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  };

  const { icon: Icon, bg, border, text, iconColor } = config[type];

  return (
    <div className={`${bg} ${border} border-l-4 rounded-r-lg p-4 my-4 flex gap-3`}>
      <Icon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
      <div className={`${text} text-sm leading-relaxed flex-1`}>{children}</div>
    </div>
  );
}

export function AnalysisStepContent() {
  const { currentStep } = useAnalysisMode();
  const [showTechnical, setShowTechnical] = useState(true);

  if (!currentStep) return null;

  return (
    <div className="space-y-6">
      {/* Subtítulo (Passo X de Y) */}
      {currentStep.subtitle && (
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider px-3 py-1 bg-primary/10 rounded-full">
            {currentStep.subtitle}
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>
      )}

      {/* Título - Mais destaque */}
      <h2 className="text-2xl sm:text-3xl font-bold text-textPrimary leading-tight bg-gradient-to-r from-textPrimary to-textPrimary/80 bg-clip-text">
        {currentStep.title}
      </h2>

      {/* Descrição - Melhor tipografia e espaçamento */}
      <div className="prose prose-sm sm:prose-base max-w-none text-textSecondary leading-relaxed space-y-4">
        <div className="bg-backgroundSecondary/50 rounded-lg p-4 sm:p-5 border-l-4 border-primary/30">
          <div className="flex items-start gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <h3 className="text-sm font-semibold text-textPrimary uppercase tracking-wide">Contexto</h3>
          </div>
          <div className="text-sm sm:text-base leading-relaxed">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-textPrimary bg-primary/10 px-1.5 py-0.5 rounded">{children}</strong>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-3">{children}</ul>,
                li: ({ children }) => <li className="text-textSecondary">{children}</li>,
              }}
            >
              {currentStep.description}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Detalhes Técnicos - Destaque máximo com syntax highlighting */}
      {currentStep.technicalNotes && (
        <div className="border-2 border-primary/40 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-transparent shadow-lg">
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="w-full px-5 py-4 bg-gradient-to-r from-primary/15 via-primary/10 to-secondary/10 hover:from-primary/25 hover:via-primary/15 hover:to-secondary/15 transition-all flex items-center justify-between text-left group"
          >
            <span className="font-bold text-textPrimary flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                <Code2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg">Detalhes Técnicos</span>
                <span className="text-xs text-primary/70 font-normal">Arquitetura, código e implementação</span>
              </div>
            </span>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary/60" />
              {showTechnical ? (
                <ChevronUp className="w-5 h-5 text-primary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-primary" />
              )}
            </div>
          </button>
          
          {showTechnical && (
            <div className="p-5 sm:p-6 bg-background/80 border-t-2 border-primary/20 animate-in slide-in-from-top-2">
              <div className="prose prose-sm sm:prose-base max-w-none 
                prose-strong:text-textPrimary prose-strong:font-semibold
                prose-h2:text-lg prose-h2:font-bold prose-h2:text-textPrimary prose-h2:mt-6 prose-h2:mb-3
                prose-h3:text-base prose-h3:font-semibold prose-h3:text-textPrimary prose-h3:mt-4 prose-h3:mb-2
                prose-ul:list-disc prose-ul:ml-4 prose-ul:space-y-2
                prose-li:text-textSecondary prose-li:leading-relaxed
                prose-p:text-textSecondary prose-p:leading-relaxed prose-p:mb-3
                prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                text-sm sm:text-base leading-relaxed">
                <ReactMarkdown
                  components={{
                    // Syntax highlighting para blocos de código
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      
                      if (!inline && language) {
                        return (
                          <CodeBlock language={language}>
                            {String(children).replace(/\n$/, '')}
                          </CodeBlock>
                        );
                      }
                      
                      // Código inline - destaque VERMELHO tipo Notion (Cmd+E)
                      return (
                        <code
                          className="px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-mono text-sm font-semibold border border-red-300 dark:border-red-700 shadow-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    // Headers com barras coloridas e ícones
                    h2({ children, ...props }: any) {
                      return (
                        <h2 {...props} className="flex items-center gap-3 mt-6 mb-3 text-lg font-bold text-textPrimary border-l-4 border-primary pl-3 py-1 bg-primary/5 rounded-r">
                          <div className="w-1 h-6 bg-primary rounded-full"></div>
                          {children}
                        </h2>
                      );
                    },
                    h3({ children, ...props }: any) {
                      return (
                        <h3 {...props} className="flex items-center gap-2 mt-4 mb-2 text-base font-semibold text-textPrimary border-l-2 border-primary/60 pl-2 py-0.5 bg-primary/5 rounded-r">
                          <div className="w-1 h-5 bg-primary/60 rounded-full"></div>
                          {children}
                        </h3>
                      );
                    },
                    // Listas com melhor espaçamento e bullets coloridos
                    ul({ children, ...props }: any) {
                      return (
                        <ul {...props} className="list-none ml-0 space-y-2 my-3">
                          {children}
                        </ul>
                      );
                    },
                    li({ children, ...props }: any) {
                      return (
                        <li {...props} className="flex items-start gap-2 text-textSecondary leading-relaxed">
                          <span className="text-primary font-bold mt-1.5 shrink-0">•</span>
                          <span className="flex-1">{children}</span>
                        </li>
                      );
                    },
                    // Strong com destaque tipo Notion (fundo colorido)
                    strong({ children, ...props }: any) {
                      return (
                        <strong {...props} className="font-bold text-textPrimary bg-primary/15 px-2 py-0.5 rounded border border-primary/20">
                          {children}
                        </strong>
                      );
                    },
                    // Blockquotes como callouts
                    blockquote({ children, ...props }: any) {
                      // Verificar se começa com [INFO], [WARNING], [SUCCESS], [ERROR]
                      const content = String(children);
                      let type: 'info' | 'warning' | 'success' | 'error' = 'info';
                      
                      if (content.includes('[INFO]') || content.includes('[info]')) {
                        type = 'info';
                      } else if (content.includes('[WARNING]') || content.includes('[warning]') || content.includes('[WARN]')) {
                        type = 'warning';
                      } else if (content.includes('[SUCCESS]') || content.includes('[success]') || content.includes('[OK]')) {
                        type = 'success';
                      } else if (content.includes('[ERROR]') || content.includes('[error]')) {
                        type = 'error';
                      }
                      
                      const cleanContent = content.replace(/\[(INFO|WARNING|SUCCESS|ERROR|info|warning|success|error|WARN|OK)\]/g, '').trim();
                      
                      return (
                        <Callout type={type}>
                          {cleanContent}
                        </Callout>
                      );
                    },
                    // Parágrafos
                    p({ children, ...props }: any) {
                      return (
                        <p {...props} className="text-textSecondary leading-relaxed mb-3 last:mb-0">
                          {children}
                        </p>
                      );
                    },
                  }}
                >
                  {currentStep.technicalNotes}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}


      {/* Feedback - Component já tem seu próprio header colapsável */}
      <AnalysisFeedback />
    </div>
  );
}
