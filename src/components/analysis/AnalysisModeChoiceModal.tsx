'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Microscope, Mail, Linkedin, Github } from 'lucide-react';
import { useAnalysisMode } from '@/contexts/AnalysisModeContext';

const CHOICE_KEY = 'colecionai_analysis_choice_v1';

export function AnalysisModeChoiceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { setChoice } = useAnalysisMode();

  useEffect(() => {
    // Verifica se o usuário já fez uma escolha
    const savedChoice = localStorage.getItem(CHOICE_KEY);
    
    if (!savedChoice) {
      // Pequeno delay para melhor UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNormalMode = () => {
    setChoice('normal');
    setIsOpen(false);
  };

  const handleAnalysisModeClick = () => {
    // Iniciar modo análise - o modal de nome será mostrado pelo HUD
    setChoice('analysis');
    setIsOpen(false);
  };

  const handleDecideLater = () => {
    setIsOpen(false);
    // Não salva nada - modal aparecerá novamente na próxima visita
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] bg-background border-border p-0 gap-0">
        <DialogHeader className="p-6 border-b border-border">
          <DialogTitle className="text-2xl font-semibold text-textPrimary mb-2">
            Bem-vindo ao Colecionaí!
          </DialogTitle>
          <DialogDescription className="text-textSecondary">
            <span className="font-semibold text-primary">Projeto Acadêmico</span> - Marketplace de itens colecionáveis desenvolvido para fins educacionais
          </DialogDescription>
          <p className="text-sm text-textMuted mt-2">
            Escolha como você quer explorar o projeto:
          </p>
        </DialogHeader>

        {/* Options */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opção 1 - Navegar Normalmente */}
              <div
                className="group relative p-6 rounded-lg border-2 border-border hover:border-primary transition-all duration-200 text-left bg-background hover:bg-backgroundSecondary"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-backgroundSecondary group-hover:bg-primary-light flex items-center justify-center transition-colors">
                    <ShoppingBag className="w-8 h-8 text-textSecondary group-hover:text-primary transition-colors" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-textPrimary mb-2">
                      Navegar normalmente
                    </h3>
                    <p className="text-sm text-textSecondary">
                      Usar o marketplace como um usuário comum, explorando itens e funcionalidades.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full group-hover:border-primary group-hover:text-primary"
                    onClick={handleNormalMode}
                  >
                    Começar
                  </Button>
                </div>
              </div>

              {/* Opção 2 - Modo Análise */}
              <div
                className="group relative p-6 rounded-lg border-2 border-primary bg-primary-subtle hover:bg-primary-light transition-all duration-200 text-left"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary-light group-hover:bg-primary flex items-center justify-center transition-colors">
                    <Microscope className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-textPrimary mb-2">
                      Explorar em modo análise
                    </h3>
                    <p className="text-sm text-textSecondary">
                      Ver uma visão técnica guiada: login, cadastro, validações, endpoints e arquitetura.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleAnalysisModeClick}
                  >
                    <Microscope className="w-4 h-4 mr-2" />
                    Iniciar Tour Técnico
                  </Button>
                </div>
              </div>
            </div>

        {/* Footer com Contatos */}
        <div className="p-6 border-t border-border bg-backgroundSecondary space-y-4">
          {/* Seção de Contatos */}
          <div className="text-center space-y-3">
            <p className="text-sm font-semibold text-textPrimary">
              Desenvolvido para fins acadêmicos
            </p>
            <p className="text-xs text-textMuted">
              Este é um projeto educacional demonstrando tecnologias modernas de desenvolvimento web.
            </p>
            
            {/* Contatos */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a
                href="mailto:seu-email@example.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-textSecondary hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>
              <a
                href="https://linkedin.com/in/seu-perfil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-textSecondary hover:text-primary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://github.com/seu-usuario"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-textSecondary hover:text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
          
          {/* Botão Decidir Depois */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={handleDecideLater}
              className="text-sm text-textMuted hover:text-textPrimary transition-colors mx-auto block"
            >
              Posso escolher depois
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
