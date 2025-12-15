'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export type NotificationType = 'BID' | 'OUTBID' | 'OWNER_NEW_BID' | 'AUCTION_WON' | 'AUCTION_ENDED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  auctionId: string;
  read: boolean;
  createdAt: string; // ISO string for serialization
  userId?: string; // ID do usuário que recebeu a notificação
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt' | 'userId'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearOldNotifications: () => void;
  handleNotificationClick: (notification: Notification) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const getStorageKey = (userId?: string) => {
  return userId ? `colecionai.notifications.${userId}` : 'colecionai.notifications';
};

const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const MAX_AGE_READ = 24 * 60 * 60 * 1000; // 24 hours

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Limpa notificações quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      // Carrega notificações do usuário atual
      const storageKey = getStorageKey(user.id);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Filtra apenas notificações deste usuário (segurança extra)
          const userNotifications = parsed.filter((n: Notification) => !n.userId || n.userId === user.id);
          setNotifications(userNotifications);
        } catch (error) {
          console.error('Error loading notifications:', error);
          setNotifications([]);
        }
      } else {
        setNotifications([]);
      }
      
      // Limpa notificações antigas de outros usuários (migração)
      // Remove a chave antiga sem user_id se existir
      const oldKey = 'colecionai.notifications';
      const oldStored = localStorage.getItem(oldKey);
      if (oldStored) {
        try {
          const oldNotifications = JSON.parse(oldStored);
          // Se há notificações antigas sem userId ou de outro usuário, remove
          const hasOldNotifications = oldNotifications.some((n: Notification) => !n.userId || n.userId !== user.id);
          if (hasOldNotifications) {
            localStorage.removeItem(oldKey);
            console.log('🧹 Notificações antigas removidas');
          }
        } catch (e) {
          // Se não conseguir parsear, remove de qualquer forma
          localStorage.removeItem(oldKey);
        }
      }
    } else {
      // Se não há usuário logado, limpa as notificações
      setNotifications([]);
    }
  }, [user?.id]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (!user?.id) return; // Não salva se não há usuário logado
    
    const storageKey = getStorageKey(user.id);
    if (notifications.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [notifications, user?.id]);

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  // Auto-cleanup old read notifications
  const clearOldNotifications = useCallback(() => {
    const cutoff = Date.now() - MAX_AGE_READ;
    setNotifications(prev => 
      prev.filter(n => !n.read || new Date(n.createdAt).getTime() > cutoff)
    );
  }, []);

  // Run cleanup periodically
  useEffect(() => {
    clearOldNotifications(); // Run on mount
    const interval = setInterval(clearOldNotifications, CLEANUP_INTERVAL);
    return () => clearInterval(interval);
  }, [clearOldNotifications]);

  // Add new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt' | 'userId'>) => {
    // Só adiciona se houver usuário logado
    if (!user?.id) {
      console.warn('⚠️ Tentativa de adicionar notificação sem usuário logado');
      return;
    }

    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: new Date().toISOString(),
      userId: user.id, // Associa ao usuário atual
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    console.log('📬 Nova notificação adicionada:', newNotification);
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  // Handle notification click (redirect + mark as read)
  const handleNotificationClick = useCallback((notification: Notification) => {
    markAsRead(notification.id);
    router.push(`/auctions/${notification.auctionId}`);
  }, [markAsRead, router]);

  // Limpa todas as notificações (útil para logout)
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    if (user?.id) {
      const storageKey = getStorageKey(user.id);
      localStorage.removeItem(storageKey);
    }
    // Limpa também a chave antiga sem user_id (para migração)
    localStorage.removeItem('colecionai.notifications');
  }, [user?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearOldNotifications,
        handleNotificationClick,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
