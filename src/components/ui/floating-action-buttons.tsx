'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Bell } from 'lucide-react';
import { ConversationsSheet } from '@/components/ui/conversations-sheet';
import { NotificationsPopup } from '@/components/shared/notifications-popup';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/hooks/useAuth';

export function FloatingActionButtons() {
  const { isAuthenticated } = useAuth(false);
  const { unreadCount } = useNotifications();
  const [showConversations, setShowConversations] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Notifications Button */}
        <div className="relative">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowConversations(false);
            }}
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </Button>
          
          {/* Notifications Popup */}
          <div className="absolute bottom-16 right-0 w-80">
            <NotificationsPopup
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
            />
          </div>
        </div>

        {/* Messages Button */}
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          onClick={() => {
            setShowConversations(!showConversations);
            setShowNotifications(false);
          }}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>

      {/* Conversations Sheet - controlled externally */}
      {showConversations && (
        <div className="hidden">
          <ConversationsSheet />
        </div>
      )}
    </>
  );
}
