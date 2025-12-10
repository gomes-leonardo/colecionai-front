'use client';

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Construction } from 'lucide-react';

interface ConstructionNoticeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function ConstructionNotice({
  open,
  onOpenChange,
  title = 'Funcionalidade em Construção',
  description = 'Esta funcionalidade está em desenvolvimento e estará disponível em breve.',
}: ConstructionNoticeProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background border-border">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
              <Construction className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="text-xl">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-textSecondary text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="primary" className="w-full">
            Entendi
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

