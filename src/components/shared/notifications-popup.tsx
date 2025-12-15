'use client';

import { X, Bell, Gavel, TrendingUp, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, NotificationType } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface NotificationsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'header' | 'dashboard';
}

const iconMap = {
  BID: Gavel,
  OUTBID: TrendingUp,
  OWNER_NEW_BID: Gavel,
  AUCTION_WON: Trophy,
  AUCTION_ENDED: Clock,
};

export function NotificationsPopup({ isOpen, onClose, position = 'header' }: NotificationsPopupProps) {
  const { notifications, unreadCount, handleNotificationClick, markAllAsRead } = useNotifications();

  const handleClick = (notification: any) => {
    handleNotificationClick(notification);
    onClose();
  };

  // Classes de posicionamento baseadas no contexto
  const positionClasses = position === 'dashboard' 
    ? 'relative' // No dashboard, já está dentro de um container posicionado
    : 'absolute top-full right-0 mt-2'; // No header, posiciona relativo ao botão

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: position === 'dashboard' ? 10 : -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === 'dashboard' ? 10 : -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className={`${positionClasses} w-80 min-w-[320px] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col`}
          style={{
            zIndex: 9999,
            maxHeight: position === 'dashboard' ? 'min(600px, calc(100vh - 200px))' : '500px',
            height: 'auto'
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-border/50 shrink-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">Notificações</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shrink-0">
                  {unreadCount}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 hover:bg-muted/50 shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Notifications */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div>
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Você receberá notificações sobre lances e leilões aqui
                  </p>
                </div>
              ) : (
                notifications.map((notification, index) => {
                  const Icon = iconMap[notification.type as NotificationType];
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleClick(notification)}
                      className={`px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors border-b border-border/30 last:border-0 ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 flex-shrink-0 ${
                          !notification.read ? 'bg-primary/10' : 'bg-muted/50'
                        }`}>
                          <Icon className={`w-5 h-5 ${!notification.read ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-sm leading-tight flex-1 min-w-0">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap ml-2">
                              {formatDistanceToNow(new Date(notification.createdAt), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="px-4 py-2.5 border-t border-border/50 bg-muted/20 shrink-0">
              <Button 
                variant="ghost" 
                className="w-full h-9 text-xs font-medium hover:bg-muted/50 whitespace-nowrap" 
                size="sm"
                onClick={() => {
                  markAllAsRead();
                  onClose();
                }}
              >
                Marcar todas como lidas
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
