'use client';

import { useState } from 'react';
import { Sidebar, SidebarContent } from '@/components/dashboard/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, MessageSquare, Bell } from 'lucide-react';
import { MessagesPopup } from '@/components/shared/messages-popup';
import { NotificationsPopup } from '@/components/shared/notifications-popup';
import { useNotifications } from '@/contexts/NotificationContext';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth(true);
  const { unreadCount } = useNotifications();
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [messagesMinimized, setMessagesMinimized] = useState(false);
  const [notificationsMinimized, setNotificationsMinimized] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useAuth
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b border-border flex items-center justify-between bg-card sticky top-0 z-50">
        <div className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Coleciona Aí!
        </div>
        <div className="flex items-center gap-2">
          {/* Botão de Mensagens */}
          <Button
            size="icon"
            className="relative bg-primary hover:bg-primary/90 text-primary-foreground"
            title="Mensagens"
            onClick={() => {
              setShowMessages(!showMessages);
              setMessagesMinimized(false);
              setShowNotifications(false);
            }}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          {/* Botão de Notificações */}
          <div className="relative">
            <Button
              size="icon"
              className="relative bg-primary hover:bg-primary/90 text-primary-foreground"
              title="Notificações"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setNotificationsMinimized(false);
                setShowMessages(false);
              }}
            >
              <Bell className="w-5 h-5" />
              {/* Badge de notificações não lidas */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </Button>
            
            {/* Popup de Notificações */}
            <NotificationsPopup
              isOpen={showNotifications && !notificationsMinimized}
              onClose={() => setShowNotifications(false)}
            />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-card border-border w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-[calc(100vh-65px)] md:h-screen relative">
        {/* Botões flutuantes de Chat e Notificações (Desktop) */}
        <div className="hidden md:flex fixed bottom-6 right-6 gap-3 z-40">
          {/* Botão de Mensagens */}
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:scale-110 transition-transform"
            title="Mensagens"
            onClick={() => {
              setShowMessages(!showMessages);
              setMessagesMinimized(false);
              setShowNotifications(false);
            }}
          >
            <MessageSquare className="w-6 h-6" />
          </Button>

          {/* Botão de Notificações */}
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:scale-110 transition-transform relative"
            title="Notificações"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setNotificationsMinimized(false);
              setShowMessages(false);
            }}
          >
            <Bell className="w-6 h-6" />
            {/* Badge de notificações não lidas */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold border-2 border-background">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </div>

        {children}
      </main>

      {/* Popup de Mensagens */}
      <MessagesPopup
        isOpen={showMessages && !messagesMinimized}
        onClose={() => setShowMessages(false)}
        onMinimize={() => setMessagesMinimized(true)}
      />

      {/* Popup de Notificações (Desktop) */}
      {showNotifications && !notificationsMinimized && (
        <div className="hidden md:block fixed bottom-24 right-6" style={{ zIndex: 9999 }}>
          <NotificationsPopup
            isOpen={showNotifications && !notificationsMinimized}
            onClose={() => setShowNotifications(false)}
            position="dashboard"
          />
        </div>
      )}
    </div>
  );
}
