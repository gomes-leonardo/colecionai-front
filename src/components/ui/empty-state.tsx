import { Package, Search } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: 'package' | 'search';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = 'search',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const Icon = icon === 'package' ? Package : Search;

  return (
    <div className={cn('flex flex-col items-center justify-center py-20 px-4 text-center', className)}>
      <div className="mb-6 rounded-full bg-muted/30 p-6">
        <Icon className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 text-2xl font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-md text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="outline" className="rounded-lg">
          {action.label}
        </Button>
      )}
    </div>
  );
}
