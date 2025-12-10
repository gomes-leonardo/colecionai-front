'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechItem {
  name: string;
  description: string;
  category: 'backend' | 'frontend' | 'devops' | 'architecture';
}

const technologies: TechItem[] = [
  {
    name: 'Node.js + Express',
    description: 'Base da API REST do Colecionaí, proporcionando performance e escalabilidade',
    category: 'backend',
  },
  {
    name: 'TypeScript',
    description: 'Tipagem estática em toda a aplicação, garantindo segurança e produtividade',
    category: 'backend',
  },
  {
    name: 'Prisma + PostgreSQL',
    description: 'Camada de persistência dos dados com ORM moderno e banco relacional robusto',
    category: 'backend',
  },
  {
    name: 'Redis + BullMQ',
    description: 'Filas para processamento assíncrono (ex: envio de e-mails e notificações)',
    category: 'backend',
  },
  {
    name: 'Docker',
    description: 'Containerização do ambiente para desenvolvimento e produção consistentes',
    category: 'devops',
  },
  {
    name: 'CI/CD (GitHub Actions + Render)',
    description: 'Pipeline de testes e deploy automatizado para entregas contínuas',
    category: 'devops',
  },
  {
    name: 'JWT',
    description: 'Autenticação stateless e segura com tokens JSON Web Token',
    category: 'backend',
  },
  {
    name: 'Zod',
    description: 'Validação robusta de dados de entrada com schemas TypeScript-first',
    category: 'backend',
  },
  {
    name: 'Multer',
    description: 'Upload seguro e validado de imagens dos produtos',
    category: 'backend',
  },
  {
    name: 'Clean Architecture + DDD',
    description: 'Organização da aplicação em camadas e contextos de domínio bem definidos',
    category: 'architecture',
  },
  {
    name: 'Injeção de Dependências',
    description: 'Facilita testes e desacoplamento dos módulos da aplicação',
    category: 'architecture',
  },
  {
    name: 'Jest',
    description: 'Testes unitários e de integração para garantir qualidade do código',
    category: 'backend',
  },
  {
    name: 'Next.js + React',
    description: 'Framework moderno para aplicações web com SSR e otimizações automáticas',
    category: 'frontend',
  },
  {
    name: 'TailwindCSS + Radix UI',
    description: 'Sistema de design utilitário com componentes acessíveis e customizáveis',
    category: 'frontend',
  },
];

const categoryColors = {
  backend: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  frontend: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  devops: 'from-green-500/20 to-green-600/20 border-green-500/30',
  architecture: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
};

const categoryLabels = {
  backend: 'Backend',
  frontend: 'Frontend',
  devops: 'DevOps',
  architecture: 'Arquitetura',
};

interface TechStackCarouselProps {
  autoPlayInterval?: number;
  className?: string;
}

/**
 * Carrossel mostrando as tecnologias utilizadas no projeto
 */
export function TechStackCarousel({ autoPlayInterval = 4000, className }: TechStackCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % technologies.length);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + technologies.length) % technologies.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayInterval, goToNext]);

  const currentTech = technologies[currentIndex];

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)} id="tech-stack-carousel">
      <div className="relative">
        {/* Main Card */}
        <Card className={cn(
          'bg-gradient-to-br border-2 transition-all duration-500',
          categoryColors[currentTech.category]
        )}>
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Category Badge */}
              <div className="px-3 py-1 rounded-full bg-background/50 backdrop-blur-sm border border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {categoryLabels[currentTech.category]}
                </span>
              </div>

              {/* Tech Name */}
              <h3 className="text-3xl md:text-4xl font-bold text-foreground">
                {currentTech.name}
              </h3>

              {/* Description */}
              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                {currentTech.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 md:-mx-16">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              goToPrevious();
              setIsAutoPlaying(false);
            }}
            className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-border hover:bg-background hover:scale-110 transition-all shadow-lg"
            aria-label="Tecnologia anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              goToNext();
              setIsAutoPlaying(false);
            }}
            className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-border hover:bg-background hover:scale-110 transition-all shadow-lg"
            aria-label="Próxima tecnologia"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {technologies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === currentIndex
                ? 'w-8 bg-primary'
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
            aria-label={`Ir para tecnologia ${index + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="text-center mt-4 text-sm text-muted-foreground">
        {currentIndex + 1} / {technologies.length}
      </div>
    </div>
  );
}
