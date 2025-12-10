'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title?: string;
  description?: string;
}

export function ShareModal({
  open,
  onOpenChange,
  url,
  title = 'Compartilhar Produto',
  description,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copiado!', {
        description: 'O link foi copiado para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar link');
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const link = shareLinks[platform];
    window.open(link, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-textSecondary">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Preview do Link */}
        <div className="bg-backgroundSecondary p-4 rounded-lg border border-border">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 bg-background rounded flex items-center justify-center border border-border flex-shrink-0">
              <Share2 className="w-8 h-8 text-primary/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-textPrimary truncate mb-1">
                {title}
              </p>
              <p className="text-xs text-textMuted truncate">
                {url}
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Compartilhar */}
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="w-5 h-5 text-blue-400" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleShare('facebook')}
            >
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => handleShare('whatsapp')}
            >
              <MessageCircle className="w-5 h-5 text-green-500" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>

          {/* Copiar Link */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-success" />
                Link Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Link
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

