import { Package, Search, AlertCircle, Gavel } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: 'package' | 'search' | 'alert' | 'gavel';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  variant?: 'products' | 'image' | 'default' | 'error' | 'auctions';
}

export function EmptyState({
  icon = 'search',
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  const iconMap = {
    package: Package,
    search: Search,
    alert: AlertCircle,
    gavel: Gavel,
  };
  const Icon = iconMap[icon];

  // Variante para produtos não encontrados
  if (variant === 'products') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
        {/* Ícone visual */}
        <div className="relative mb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-backgroundSecondary rounded-full flex items-center justify-center border-4 border-primary/20">
            <Package className="w-16 h-16 md:w-20 md:h-20 text-primary/40" />
          </div>
        </div>

        {/* Mensagem */}
        <h3 className="text-2xl md:text-3xl font-bold text-textPrimary mb-4">
          {title}
        </h3>
        <p className="text-lg text-textSecondary mb-8 max-w-md mx-auto">
          {description}
        </p>

        {/* Ações */}
        {action && (
          <Button onClick={action.onClick} variant="outline" size="lg" className="h-12 px-8 text-base">
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  // Variante para leilões não encontrados
  if (variant === 'auctions') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
        {/* Ícone visual */}
        <div className="relative mb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-backgroundSecondary rounded-full flex items-center justify-center border-4 border-primary/20">
            <Gavel className="w-16 h-16 md:w-20 md:h-20 text-primary/40" />
          </div>
        </div>

        {/* Mensagem */}
        <h3 className="text-2xl md:text-3xl font-bold text-textPrimary mb-4">
          {title}
        </h3>
        <p className="text-lg text-textSecondary mb-8 max-w-md mx-auto">
          {description}
        </p>

        {/* Ações */}
        {action && (
          <Button onClick={action.onClick} variant="outline" size="lg" className="h-12 px-8 text-base">
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  // Variante para erros
  if (variant === 'error') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
        {/* Ícone visual */}
        <div className="relative mb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-destructive/10 rounded-full flex items-center justify-center border-4 border-destructive/20">
            <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-destructive/60" />
          </div>
        </div>

        {/* Mensagem */}
        <h3 className="text-2xl md:text-3xl font-bold text-textPrimary mb-4">
          {title}
        </h3>
        <p className="text-lg text-textSecondary mb-8 max-w-md mx-auto">
          {description}
        </p>

        {/* Ações */}
        {action && (
          <Button onClick={action.onClick} variant="outline" size="lg" className="h-12 px-8 text-base">
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  // Variante para imagem não disponível
  if (variant === 'image') {
    return (
      <div className={cn('w-full h-full flex flex-col items-center justify-center bg-backgroundSecondary text-textMuted', className)}>
        <div className="relative">
          <Package className="w-16 h-16 md:w-20 md:h-20 text-textMuted/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-xs font-medium text-textMuted/50">IMG</div>
          </div>
        </div>
        <p className="mt-3 text-sm font-medium text-textMuted/70">
          {title || 'Imagem não disponível'}
        </p>
      </div>
    );
  }

  // Variante padrão
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-4 text-center', className)}>
      <div className="mb-6 rounded-full bg-muted/30 p-6">
        <Icon className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
      </div>
      {title && <h3 className="mb-2 text-2xl font-semibold text-foreground">{title}</h3>}
      {description && (
        <p className="mb-6 max-w-md text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline" className="rounded-lg">
          {action.label}
        </Button>
      )}
    </div>
  );
}
