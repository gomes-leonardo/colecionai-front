'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GraduationCap, Code2, ArrowRight, Microscope, Sparkles } from 'lucide-react';
import { TechStackCarousel } from './tech-stack-carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NOTICE_KEY = 'colecionai_academic_notice_v1';

interface AcademicNoticeModalProps {
  onStartTour?: () => void;
}

/**
 * Modal aprimorado que aparece no primeiro acesso
 * Inclui carrossel de tecnologias e opção de iniciar tour interativo
 */
export function AcademicNoticeModal({ onStartTour }: AcademicNoticeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('welcome');

  useEffect(() => {
    // Modal desabilitado - agora usamos apenas o AnalysisModeChoiceModal
    // que aparece na primeira visita e oferece a opção de modo análise
    return;
    
    /* Código antigo comentado
    const hasSeenNotice = localStorage.getItem(NOTICE_KEY);
    
    if (!hasSeenNotice) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    */
  }, []);

  const handleClose = () => {
    localStorage.setItem(NOTICE_KEY, 'true');
    setIsOpen(false);
  };

  const handleStartTour = () => {
    handleClose();
    if (onStartTour) {
      onStartTour();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary-light">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-semibold text-textPrimary">
              Bem-vindo ao Colecionaí!
            </DialogTitle>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="welcome">Sobre o Projeto</TabsTrigger>
            <TabsTrigger value="tech">Tecnologias</TabsTrigger>
          </TabsList>

          <TabsContent value="welcome" className="space-y-4">
            <DialogDescription className="text-textSecondary text-base leading-relaxed space-y-3">
              <p>
                Este é um software criado para fins de <span className="font-semibold text-textPrimary">estudo e aprendizado</span> de tecnologias modernas de desenvolvimento.
              </p>
              
              <div className="bg-backgroundSecondary p-4 rounded-lg border border-border space-y-2">
                <p className="flex items-start gap-2">
                  <Code2 className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                  <span className="text-sm">
                    Foco em <strong>backend robusto</strong>, Clean Architecture, 
                    Domain-Driven Design (DDD), filas assíncronas e CI/CD.
                  </span>
                </p>
              </div>

              <p className="text-sm bg-warning-light border border-warning/20 p-3 rounded-lg">
                <strong className="text-warning">⚠️ Importante:</strong> Este não é um marketplace real. 
                Não utilize dados sensíveis ou informações pessoais reais.
              </p>

              <div className="bg-primary-subtle border border-primary/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Microscope className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-textPrimary mb-1">Tour Interativo Disponível</h4>
                    <p className="text-sm text-textSecondary mb-3">
                      Explore o projeto de forma guiada! Nosso tour interativo mostra cada tecnologia aplicada, 
                      desde autenticação com JWT até processamento assíncrono com Redis + BullMQ.
                    </p>
                    <Button
                      onClick={handleStartTour}
                      variant="primary"
                      size="sm"
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Iniciar Tour Interativo
                    </Button>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </TabsContent>

          <TabsContent value="tech" className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-textPrimary mb-2">
                Tecnologias Utilizadas
              </h3>
              <p className="text-sm text-textSecondary">
                Explore as 14 tecnologias que compõem este projeto acadêmico
              </p>
            </div>
            
            <TechStackCarousel />
            
            <p className="text-xs text-textMuted text-center mt-4">
              Use as setas ou os indicadores para navegar entre as tecnologias
            </p>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={() => setActiveTab('tech')}
            className="w-full sm:w-auto"
          >
            <Code2 className="w-4 h-4 mr-2" />
            Ver Tecnologias
          </Button>
          <Button
            onClick={handleClose}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Entendi, continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
